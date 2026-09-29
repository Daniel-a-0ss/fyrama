import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { ok, fail, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";
import { contactStatusEnum } from "@/lib/validation/schemas";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function doUpdateStatus(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.contactRequest.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "La solicitud no existe.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = contactStatusEnum.safeParse((body as { status?: string }).status);
  if (!parsed.success) return fail(422, "VALIDATION", "Estado no válido.");

  const updated = await prisma.contactRequest.update({
    where: { id },
    data: { status: parsed.data },
  });

  await logAudit({
    action: "UPDATE_CONTACT_STATUS",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "contact-request",
    entityId: id,
    details: { status: updated.status, name: updated.name },
  });

  return ok({ id: updated.id, status: updated.status });
}

async function doDelete(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.contactRequest.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "La solicitud no existe.");

  await prisma.contactRequest.delete({ where: { id } });

  await logAudit({
    action: "DELETE_CONTACT_REQUEST",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "contact-request",
    entityId: id,
    details: { name: existing.name, email: existing.email },
  });

  return ok({ deleted: true });
}

export async function PATCH(request: Request, ctx: Ctx) {
  return handle(() => doUpdateStatus(request, ctx));
}
export async function DELETE(request: Request, ctx: Ctx) {
  return handle(() => doDelete(request, ctx));
}