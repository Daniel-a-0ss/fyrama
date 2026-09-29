import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  sessionCookieHeader,
} from "@/lib/auth/session";
import { userIdFromPending2faRequest } from "@/lib/auth/twoFa";
import { clearPending2faCookieHeader } from "@/lib/auth/twoFa";
import {
  totpVerifyLimiter,
  totpVerifyIpLimiter,
} from "@/lib/security/rate-limit";
import { assertMutationSecurity } from "@/lib/security/csrf";
import { verifyTotp } from "@/lib/security/totp";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_AGE_SECONDS =
  (Number(process.env.SESSION_MAX_AGE_HOURS ?? 12) || 12) * 3600;

const codeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Ingresa el código.")
    .max(12, "Código inválido."),
});

async function doVerify(request: Request) {
  const denied = assertMutationSecurity(request);
  if (denied) return denied;

  const ip = getClientIp(request.headers);
  const ua = getClientUserAgent(request.headers);
  const ipKey = (ip ?? "unknown").slice(0, 64);

  if (!totpVerifyIpLimiter.allow("all:" + ipKey)) {
    return fail(
      429,
      "RATE_LIMITED",
      "Demasiados intentos. Espera un momento."
    );
  }

  const userId = userIdFromPending2faRequest(request);
  if (!userId) {
    return fail(
      401,
      "2FA_EXPIRED",
      "La verificación expiró. Inicia sesión nuevamente."
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = codeSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  if (!totpVerifyLimiter.allow(userId)) {
    return fail(
      429,
      "RATE_LIMITED",
      "Demasiados códigos incorrectos. Intenta nuevamente en 15 minutos."
    );
  }

  const found = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      totpEnabled: true,
      totpSecret: true,
      recoveryCodes: true,
    },
  });

  if (!found || !found.active) {
    return fail(401, "INVALID_SESSION", "Sesión inválida.");
  }

  const code = parsed.data.code;
  let viaRecovery = false;
  let recoveryMatch: string | null = null;

  if (found.totpEnabled && found.totpSecret) {
    if (verifyTotp(found.totpSecret, code)) {
      // código TOTP correcto
    } else {
      // Tal vez sea un código de recuperación
      const hashes: string[] = [];
      try {
        const parsedHashes = JSON.parse(found.recoveryCodes ?? "[]");
        if (Array.isArray(parsedHashes)) hashes.push(...parsedHashes.map(String));
      } catch {
        // datos corruptos: se ignoran
      }
      for (const hash of hashes) {
        if (await verifyPassword(code, hash)) {
          recoveryMatch = hash;
          viaRecovery = true;
          break;
        }
      }
      if (!viaRecovery) {
        await logAudit({
          action: "LOGIN_FAILED",
          userId: found.id,
          ipAddress: ip,
          userAgent: ua,
          details: "bad_2fa_code",
        }).catch(() => {});
        return fail(
          401,
          "INVALID_2FA_CODE",
          "El código no es válido o expiró."
        );
      }
    }
  } else if (found.totpEnabled) {
    // 2FA marcado activo pero sin secret: no se puede verificar
    return fail(401, "INVALID_2FA_CODE", "El código no es válido o expiró.");
  }
  // Si el 2FA se desactivó mientras tanto, se continúa el login normal.

  if (recoveryMatch) {
    const remaining = (JSON.parse(found.recoveryCodes ?? "[]") as string[]).filter(
      (h) => h !== recoveryMatch
    );
    await prisma.user.update({
      where: { id: found.id },
      data: { recoveryCodes: JSON.stringify(remaining) },
    });
  }

  const token = await createSession(found.id, ip, ua);
  totpVerifyLimiter.reset(found.id);

  await logAudit({
    action: "LOGIN",
    userId: found.id,
    ipAddress: ip,
    userAgent: ua,
    details: viaRecovery ? "2fa_recovery" : "2fa_verified",
  }).catch(() => {});

  const response = ok({
    user: { id: found.id, name: found.name, email: found.email, role: found.role },
  });
  response.headers.set("Set-Cookie", sessionCookieHeader(token, MAX_AGE_SECONDS));
  response.headers.append("Set-Cookie", clearPending2faCookieHeader());
  return response;
}

export async function POST(request: Request) {
  return handle(() => doVerify(request));
}

export const GET = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");