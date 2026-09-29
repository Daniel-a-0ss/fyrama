import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/admin";
import { userUpdateSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function doUpdate(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request, { role: "ADMIN" });
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "El usuario no existe.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const d = parsed.data;

  if (d.email) {
    const clash = await prisma.user.findFirst({
      where: { email: d.email.trim().toLowerCase(), id: { not: id } },
    });
    if (clash) return fail(409, "EMAIL_IN_USE", "Ya existe un usuario con ese correo.");
  }

  // Evita desactivar o deponer al último ADMIN activo.
  if (existing.role === "ADMIN" && (d.active === false || (d.role && d.role !== "ADMIN"))) {
    const otherAdmins = await prisma.user.count({
      where: { role: "ADMIN", active: true, id: { not: id } },
    });
    if (otherAdmins === 0) {
      return fail(
        409,
        "LAST_ADMIN",
        "Debe existir al menos un administrador activo."
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: d.name,
      email: d.email.trim().toLowerCase(),
      role: d.role,
      active: d.active ?? existing.active,
      ...(d.password ? { passwordHash: await hashPassword(d.password) } : {}),
    },
  });

  // Si la contraseña cambió, revoca todas las sesiones del usuario.
  if (d.password) {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  const permissionChanged =
    d.role !== undefined && d.role !== existing.role;
  await logAudit({
    action: permissionChanged ? "USER_PERMISSION_CHANGE" : "UPDATE_USER",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "user",
    entityId: id,
    details: {
      email: updated.email,
      role: updated.role,
      active: updated.active,
      passwordChanged: Boolean(d.password),
    },
  });

  return ok({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    active: updated.active,
  });
}

async function doDelete(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request, { role: "ADMIN" });
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "El usuario no existe.");

  if (id === guard.user.id) {
    return fail(409, "SELF_DELETE", "No puedes eliminar tu propia cuenta.");
  }

  if (existing.role === "ADMIN") {
    const otherAdmins = await prisma.user.count({
      where: { role: "ADMIN", id: { not: id } },
    });
    if (otherAdmins === 0) {
      return fail(409, "LAST_ADMIN", "Debe existir al menos un administrador.");
    }
  }

  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  await logAudit({
    action: "DELETE_USER",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "user",
    entityId: id,
    details: { email: existing.email },
  });

  return ok({ deleted: true });
}

export async function PUT(request: Request, ctx: Ctx) {
  return handle(() => doUpdate(request, ctx));
}
export async function DELETE(request: Request, ctx: Ctx) {
  return handle(() => doDelete(request, ctx));
}