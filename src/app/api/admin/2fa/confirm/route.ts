import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { totpSetupLimiter } from "@/lib/security/rate-limit";
import { assertMutationSecurity } from "@/lib/security/csrf";
import { verifyTotp, generateRecoveryCodes } from "@/lib/security/totp";
import { ok, fail, failValidation, handle, unauthorizedMessage } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/utils";

export const runtime = "nodejs";

const confirmSchema = z.object({
  secret: z
    .string()
    .trim()
    .regex(/^[A-Z2-7=]+$/i, "Clave inválida.")
    .min(16, "Clave inválida.")
    .max(64, "Clave inválida."),
  code: z.string().regex(/^\d{6}$/, "Ingresa el código de 6 dígitos."),
});

async function doConfirm(request: Request) {
  const denied = assertMutationSecurity(request);
  if (denied) return denied;

  const auth = await requireAuth(request);
  if (!auth.user) return unauthorizedMessage();

  if (auth.user.totpEnabled) {
    return fail(409, "ALREADY_ENABLED", "La verificación en dos pasos ya está activa.");
  }

  const ip = getClientIp(request.headers);
  if (!totpSetupLimiter.allow(auth.user.id)) {
    return fail(
      429,
      "RATE_LIMITED",
      "Demasiados intentos. Intenta nuevamente en 15 minutos."
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  const { secret, code } = parsed.data;
  if (!verifyTotp(secret, code)) {
    return fail(401, "INVALID_CODE", "El código no es válido.");
  }

  const recoveryCodes = generateRecoveryCodes(8);
  const hashes: string[] = [];
  for (const rc of recoveryCodes) {
    hashes.push(await hashPassword(rc));
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: {
      totpSecret: secret,
      totpEnabled: true,
      totpConfirmedAt: new Date(),
      recoveryCodes: JSON.stringify(hashes),
    },
  });

  totpSetupLimiter.reset(auth.user.id);

  await logAudit({
    action: "TWO_FACTOR_ENABLED",
    userId: auth.user.id,
    ipAddress: ip,
  }).catch(() => {});

  return ok({ enabled: true, recoveryCodes });
}

export async function POST(request: Request) {
  return handle(() => doConfirm(request));
}

export const GET = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");