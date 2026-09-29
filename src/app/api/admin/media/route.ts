import { prisma } from "@/lib/prisma";
import { MediaKind } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { uploadLimiter } from "@/lib/security/rate-limit";
import { processAndSaveImage, verifyImageFile, ImageError } from "@/lib/images";
import { mediaKindSchema } from "@/lib/validation/schemas";
import { ok, fail, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";

export const runtime = "nodejs";

async function doList(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get("limit") ?? 24)));
  const kind = url.searchParams.get("kind");
  const q = url.searchParams.get("q")?.trim();

  const where = {
    deletedAt: null,
    ...(kind && kind !== "ALL" ? { kind: kind as MediaKind } : {}),
    ...(q ? { originalName: { contains: q } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { propertyImages: true, articleCover: true } },
      },
    }),
  ]);

  return ok({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
}

async function doUpload(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const ip = getClientIp(request.headers);
  if (!uploadLimiter.allow(ip ?? "unknown")) {
    return fail(429, "RATE_LIMITED", "Demasiadas subidas. Espera un momento.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "BAD_REQUEST", "Multipart inválido.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail(422, "VALIDATION", "Campo 'file' requerido.");
  }

  let ver;
  try {
    ver = await verifyImageFile(file);
  } catch (err) {
    if (err instanceof ImageError) {
      return fail(422, err.code, err.message);
    }
    throw err;
  }

  const kindParsed = mediaKindSchema.safeParse(String(form.get("kind") ?? "GENERAL"));
  const kind = kindParsed.success ? kindParsed.data : "GENERAL";
  const alt = String(form.get("alt") ?? "").trim().slice(0, 300) || null;

  const processed = await processAndSaveImage(ver.buffer, {
    width: ver.width,
    height: ver.height,
  });

  const asset = await prisma.mediaAsset.create({
    data: {
      originalName: file.name.slice(0, 200),
      filename: processed.url.split("/").pop() ?? file.name,
      mime: ver.mime,
      size: ver.size,
      width: processed.width,
      height: processed.height,
      url: processed.url,
      thumbUrl: processed.thumbUrl,
      cardUrl: processed.cardUrl,
      variants: JSON.stringify(processed.variants),
      alt,
      kind: kindParsed.success ? (kindParsed.data as MediaKind) : "GENERAL",
    },
  });

  await logAudit({
    action: "UPLOAD_MEDIA",
    userId: guard.user.id,
    ipAddress: ip,
    userAgent: getClientUserAgent(request.headers),
    entityType: "media",
    entityId: asset.id,
    details: { originalName: asset.originalName, kind },
  });

  return ok(
    {
      id: asset.id,
      url: asset.url,
      thumbUrl: asset.thumbUrl,
      variants: processed.variants,
    },
    201
  );
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}
export async function POST(request: Request) {
  return handle(() => doUpload(request));
}