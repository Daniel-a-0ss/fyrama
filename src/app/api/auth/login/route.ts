import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  sessionCookieHeader,
} from "@/lib/auth/session";
import {
  encodePending2fa,
  pending2faCookieHeader,
} from "@/lib/auth/twoFa";
import { loginLimiter, loginAttemptLimiter } from "@/lib/security/rate-limit";
import { assertMutationSecurity } from "@/lib/security/csrf";
import { loginSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_AGE_SECONDS =
  (Number(process.env.SESSION_MAX_AGE_HOURS ?? 12) || 12) * 3600;

async function doLogin(request: Request) {
  const denied = assertMutationSecurity(request);
  if (denied) return denied;

  const ip = getClientIp(request.headers);
  const ua = getClientUserAgent(request.headers);
  const ipKey = (ip ?? "unknown").slice(0, 64);

  if (!loginAttemptLimiter.allow("all:" + ipKey)) {
    return fail(
      429,
      "RATE_LIMITED",
      "Demasiados intentos. Espera un momento y vuelve a intentar."
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  const { email, password } = parsed.data;
  const emailLower = email.trim().toLowerCase();
  const accountKey = `${emailLower}:${ipKey}`;

  if (!loginLimiter.allow(accountKey)) {
    return fail(
      429,
      "RATE_LIMITED",
      "Demasiados intentos fallidos. Intenta nuevamente en 15 minutos."
    );
  }

  const found = await prisma.user.findFirst({
    where: { email: emailLower },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      passwordHash: true,
      totpEnabled: true,
    },
  });

  if (!found) {
    // Mensaje genérico: no revela si el usuario existe (anti-enumeración).
    return fail(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos.");
  }

  const valid = await verifyPassword(password, found.passwordHash);
  if (!valid) {
    await logAudit({
      action: "LOGIN_FAILED",
      userId: found.id,
      ipAddress: ip,
      userAgent: ua,
      details: "bad_password",
    }).catch(() => {});
    return fail(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos.");
  }

  if (!found.active) {
    return fail(403, "ACCOUNT_DISABLED", "Tu cuenta está desactivada.");
  }

  loginLimiter.reset(accountKey);

  if (found.totpEnabled) {
    const response = ok({ requires2FA: true });
    response.headers.set(
      "Set-Cookie",
      pending2faCookieHeader(encodePending2fa(found.id))
    );
    return response;
  }

  const token = await createSession(found.id, ip, ua);

  await logAudit({
    action: "LOGIN",
    userId: found.id,
    ipAddress: ip,
    userAgent: ua,
  }).catch(() => {});

  const response = ok({
    user: { id: found.id, name: found.name, email: found.email, role: found.role },
  });
  response.headers.set("Set-Cookie", sessionCookieHeader(token, MAX_AGE_SECONDS));
  return response;
}

export async function POST(request: Request) {
  return handle(() => doLogin(request));
}

export const GET = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");