import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { totpSetupLimiter } from "@/lib/security/rate-limit";
import { assertMutationSecurity } from "@/lib/security/csrf";
import { verifyTotp } from "@/lib/security/totp";
import { ok, fail, failValidation, handle, unauthorizedMessage } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/utils";

export const runtime = "nodejs";

const disableSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Ingresa el código de 6 dígitos."),
});

async function doDisable(request: Request) {
  const denied = assertMutationSecurity(request);
  if (denied) return denied;

  const auth = await requireAuth(request);
  if (!auth.user) return unauthorizedMessage();

  if (!auth.user.totpEnabled) {
    return fail(409, "NOT_ENABLED", "La verificación en dos pasos no está activa.");
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
  const parsed = disableSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  const me = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { totpSecret: true },
  });
  if (!me?.totpSecret || me.totpSecret === "") {
    return fail(409, "INVALID_STATE", "No hay una clave configurada.");
  }
  if (!verifyTotp(me.totpSecret, parsed.data.code)) {
    return fail(401, "INVALID_CODE", "El código no es válido.");
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: {
      totpSecret: null,
      totpEnabled: false,
      totpConfirmedAt: null,
      recoveryCodes: null,
    },
  });

  totpSetupLimiter.reset(auth.user.id);

  await logAudit({
    action: "TWO_FACTOR_DISABLED",
    userId: auth.user.id,
    ipAddress: ip,
  }).catch(() => {});

  return ok({ enabled: false });
}

export async function POST(request: Request) {
  return handle(() => doDisable(request));
}

export const GET = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");