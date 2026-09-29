import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { ok, fail, handle } from "@/lib/api";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function findWithImages(id: string) {
  return prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: { images: { orderBy: { sortOrder: "asc" }, include: { mediaAsset: true } } },
  });
}

/** Adjunta media assets existentes como fotos del inmueble. */
async function doAttach(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const { mediaAssetIds } = body as { mediaAssetIds?: unknown };
  if (!Array.isArray(mediaAssetIds) || mediaAssetIds.length === 0) {
    return fail(422, "VALIDATION", "mediaAssetIds es obligatorio.");
  }
  const ids = mediaAssetIds.map(String);
  if (ids.length > 40) return fail(422, "VALIDATION", "Demasiadas imágenes.");

  const property = await findWithImages((await ctx.params).id);
  if (!property) return fail(404, "NOT_FOUND", "El inmueble no existe.");

  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: { id: true },
  });
  if (assets.length !== ids.length) {
    return fail(422, "VALIDATION", "Una o más imágenes no existen.");
  }

  let nextOrder = 0;
  for (const img of property.images) nextOrder = Math.max(nextOrder, img.sortOrder + 1);

  const first = property.images.length === 0;
  let inserted = 0;
  for (const asset of assets) {
    await prisma.propertyImage.create({
      data: {
        propertyId: property.id,
        mediaAssetId: asset.id,
        sortOrder: nextOrder + inserted++,
        isCover: first && inserted === 1,
      },
    });
  }

  return ok({ attached: inserted });
}

/** Reordena imágenes y define la portada. */
async function doReorder(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const { order, coverId } = body as { order?: unknown; coverId?: unknown };
  if (!Array.isArray(order) || order.length === 0) {
    return fail(422, "VALIDATION", "order es obligatorio.");
  }
  const ordered = order.map(String);
  const wantCover = typeof coverId === "string" ? coverId : null;

  const property = await findWithImages((await ctx.params).id);
  if (!property) return fail(404, "NOT_FOUND", "El inmueble no existe.");

  const ids = new Set(property.images.map((i) => i.id));
  const validOrder = ordered.filter((id) => ids.has(id));
  if (wantCover && !ids.has(wantCover)) {
    return fail(422, "VALIDATION", "La portada no pertenece a este inmueble.");
  }

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < validOrder.length; i++) {
      await tx.propertyImage.update({
        where: { id: validOrder[i] },
        data: { sortOrder: i },
      });
    }
    await tx.propertyImage.updateMany({
      where: { propertyId: property.id },
      data: { isCover: false },
    });
    if (wantCover && validOrder.includes(wantCover)) {
      await tx.propertyImage.update({ where: { id: wantCover }, data: { isCover: true } });
    } else if (validOrder.length > 0) {
      await tx.propertyImage.update({ where: { id: validOrder[0] }, data: { isCover: true } });
    }
  });

  return ok({ ordered: validOrder.length });
}

/** Desvincula una foto del inmueble (no borra el media asset). */
async function doDetach(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const { imageId } = body as { imageId?: unknown };
  if (typeof imageId !== "string") return fail(422, "VALIDATION", "imageId es obligatorio.");

  const property = await findWithImages((await ctx.params).id);
  if (!property) return fail(404, "NOT_FOUND", "El inmueble no existe.");

  const target = property.images.find((i) => i.id === imageId);
  if (!target) return fail(404, "NOT_FOUND", "La imagen no pertenece a este inmueble.");

  await prisma.propertyImage.delete({ where: { id: imageId } });

  if (target.isCover) {
    const remaining = property.images.filter((i) => i.id !== imageId);
    if (remaining.length > 0) {
      const sorted = [...remaining].sort((a, b) => a.sortOrder - b.sortOrder);
      await prisma.propertyImage.update({ where: { id: sorted[0].id }, data: { isCover: true } });
    }
  }

  return ok({ detached: true });
}

export async function POST(request: Request, ctx: Ctx) {
  return handle(() => doAttach(request, ctx));
}
export async function PUT(request: Request, ctx: Ctx) {
  return handle(() => doReorder(request, ctx));
}
export async function DELETE(request: Request, ctx: Ctx) {
  return handle(() => doDetach(request, ctx));
}