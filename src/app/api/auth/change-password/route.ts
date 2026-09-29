import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { hashSessionToken, tokenFromRequest } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/admin";
import { changePasswordSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";

export const runtime = "nodejs";

async function doChangePassword(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: guard.user.id } });
  if (!user) return fail(401, "UNAUTHORIZED", "No autorizado.");

  const validCurrent = await verifyPassword(currentPassword, user.passwordHash);
  if (!validCurrent) {
    return fail(401, "INVALID_CREDENTIALS", "La contraseña actual no es correcta.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  // Invalida otras sesiones activas (se conserva la sesión actual).
  const currentToken = tokenFromRequest(request);
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
      ...(currentToken ? { tokenHash: { not: hashSessionToken(currentToken) } } : {}),
    },
  });

  await logAudit({
    action: "CHANGE_PASSWORD",
    userId: user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
  });

  return ok({ changed: true });
}

export async function POST(request: Request) {
  return handle(() => doChangePassword(request));
}

export const GET = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");