import { prisma } from "@/lib/prisma";
import { PropertyStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { propertySchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";
import { uniqueSlug } from "@/lib/services/admin";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

async function getDetail(id: string) {
  const property = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" }, include: { mediaAsset: true } },
      features: { orderBy: { name: "asc" }, select: { name: true } },
      contactRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          type: true,
          status: true,
          contactPreference: true,
          createdAt: true,
        },
      },
    },
  });
  if (!property) return fail(404, "NOT_FOUND", "El inmueble no existe.");
  return ok({ property });
}

async function doUpdate(request: Request, id: string) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const existing = await prisma.property.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return fail(404, "NOT_FOUND", "El inmueble no existe.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }

  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const data = parsed.data;

  const wantSlug = data.slug?.trim();
  const slug =
    wantSlug && wantSlug !== existing.slug
      ? await uniqueSlug("property", slugify(wantSlug) || "inmueble", existing.id)
      : existing.slug;

  let updated;
  try {
    updated = await prisma.$transaction(async (tx) => {
      const up = await tx.property.update({
        where: { id },
        data: {
          title: data.title,
          slug,
          description: data.description,
          operation: data.operation,
          type: data.type,
          price: data.price ?? null,
          currency: data.currency,
          status: data.status,
          featured: data.featured ?? existing.featured,
          city: data.city || null,
          zone: data.zone || null,
          neighborhood: data.neighborhood || null,
          address: data.address || null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          area: data.area ?? null,
          builtArea: data.builtArea ?? null,
          bedrooms: data.bedrooms ?? null,
          bathrooms: data.bathrooms ?? null,
          parking: data.parking ?? null,
          estrato: data.estrato ?? null,
        },
      });
      await tx.propertyFeature.deleteMany({ where: { propertyId: id } });
      if (data.features.length > 0) {
        await tx.propertyFeature.createMany({
          data: data.features.map((f) => ({
            propertyId: id,
            name: f.trim(),
          })),
        });
      }
      return up;
    });
  } catch (err) {
    if (String(err).includes("Unique constraint")) {
      return fail(409, "SLUG_CONFLICT", "Ya existe un inmueble con ese slug.");
    }
    throw err;
  }

  await logAudit({
    action: "UPDATE_PROPERTY",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "property",
    entityId: id,
    details: { title: updated.title },
  });

  return ok({ id: updated.id, slug: updated.slug });
}

async function doPatchStatus(request: Request, id: string) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const status = (body as { status?: string }).status;
  const featured = (body as { featured?: boolean }).featured;
  const allowedStatuses: PropertyStatus[] = ["DRAFT", "PUBLISHED", "HIDDEN"];
  if (status !== undefined && !allowedStatuses.includes(status as PropertyStatus)) {
    return fail(422, "VALIDATION", "Estado no válido.");
  }
  if (featured !== undefined && typeof featured !== "boolean") {
    return fail(422, "VALIDATION", "featured debe ser booleano.");
  }

  const existing = await prisma.property.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return fail(404, "NOT_FOUND", "El inmueble no existe.");

  const updated = await prisma.property.update({
    where: { id },
    data: {
      ...(status ? { status: status as PropertyStatus } : {}),
      ...(featured !== undefined ? { featured } : {}),
    },
    select: { id: true, status: true, featured: true, title: true },
  });

  await logAudit({
    action: "UPDATE_PROPERTY",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "property",
    entityId: id,
    details: { title: updated.title, status: updated.status, featured: updated.featured },
  });

  return ok(updated);
}

async function doDelete(request: Request, id: string) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const existing = await prisma.property.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return fail(404, "NOT_FOUND", "El inmueble no existe.");

  await prisma.property.update({ where: { id }, data: { deletedAt: new Date() } });

  await logAudit({
    action: "DELETE_PROPERTY",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "property",
    entityId: id,
    details: { title: existing.title },
  });

  return ok({ deleted: true });
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  return handle(async () => {
    const guard = await requireAdmin(request);
    if (!guard.user) return guard.error;
    return getDetail((await ctx.params).id);
  });
}
export async function PUT(request: Request, ctx: Ctx) {
  return handle(async () => doUpdate(request, (await ctx.params).id));
}
export async function PATCH(request: Request, ctx: Ctx) {
  return handle(async () => doPatchStatus(request, (await ctx.params).id));
}
export async function DELETE(request: Request, ctx: Ctx) {
  return handle(async () => doDelete(request, (await ctx.params).id));
}