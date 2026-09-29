import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { legalServiceSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/services/admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function doDetail(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const service = await prisma.legalService.findUnique({ where: { id } });
  if (!service) return fail(404, "NOT_FOUND", "El servicio no existe.");
  return ok({ service });
}

async function doUpdate(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.legalService.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "El servicio no existe.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = legalServiceSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const d = parsed.data;

  const want = d.slug?.trim();
  const slug =
    want && want !== existing.slug
      ? await uniqueSlug("legal-service", slugify(want) || "servicio", existing.id)
      : existing.slug;

  try {
    const service = await prisma.legalService.update({
      where: { id },
      data: {
        title: d.title,
        slug,
        description: d.description,
        content: d.content,
        icon: d.icon,
        active: d.active,
        sortOrder: d.sortOrder,
      },
    });
    await logAudit({
      action: "UPDATE_LEGAL_SERVICE",
      userId: guard.user.id,
      ipAddress: getClientIp(request.headers),
      userAgent: getClientUserAgent(request.headers),
      entityType: "legal-service",
      entityId: id,
      details: { title: service.title, active: service.active },
    });
    return ok({ id: service.id, slug: service.slug });
  } catch {
    return fail(409, "SLUG_CONFLICT", "Ya existe un servicio con ese slug.");
  }
}

async function doDelete(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.legalService.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "El servicio no existe.");

  await prisma.legalService.delete({ where: { id } });

  await logAudit({
    action: "DELETE_LEGAL_SERVICE",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "legal-service",
    entityId: id,
    details: { title: existing.title },
  });

  return ok({ deleted: true });
}

export async function GET(request: Request, ctx: Ctx) {
  return handle(() => doDetail(request, ctx));
}
export async function PUT(request: Request, ctx: Ctx) {
  return handle(() => doUpdate(request, ctx));
}
export async function DELETE(request: Request, ctx: Ctx) {
  return handle(() => doDelete(request, ctx));
}