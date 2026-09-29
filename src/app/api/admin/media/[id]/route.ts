import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { fail, ok, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";
import { deleteMediaFiles } from "@/lib/images";
import { parseVariants } from "@/lib/services/property";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function doDelete(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const asset = await prisma.mediaAsset.findFirst({ where: { id, deletedAt: null } });
  if (!asset) return fail(404, "NOT_FOUND", "La imagen no existe.");

  const inUse = await prisma.$transaction([
    prisma.propertyImage.count({ where: { mediaAssetId: id } }),
    prisma.article.count({ where: { coverMediaId: id } }),
  ]);

  if (inUse[0] > 0) {
    return fail(
      409,
      "MEDIA_IN_USE",
      "Esta imagen está vinculada a inmuebles. Desvincúlala antes de eliminarla."
    );
  }
  if (inUse[1] > 0) {
    return fail(
      409,
      "MEDIA_IN_USE",
      "Esta imagen está vinculada a un artículo. Desvincúlala antes de eliminarla."
    );
  }

  await prisma.mediaAsset.update({ where: { id }, data: { deletedAt: new Date() } });

  try {
    await deleteMediaFiles(asset.url, parseVariants(asset.variants));
  } catch {
    // Los archivos pueden no existir (p. ej. seed); la fila ya se marcó borrada.
  }

  await logAudit({
    action: "DELETE_MEDIA",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "media",
    entityId: id,
    details: { originalName: asset.originalName },
  });

  return ok({ deleted: true });
}

export async function DELETE(request: Request, ctx: Ctx) {
  return handle(() => doDelete(request, ctx));
}