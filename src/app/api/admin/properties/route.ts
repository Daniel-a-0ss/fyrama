import { prisma } from "@/lib/prisma";
import { Prisma, PropertyStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { propertySchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";
import { uniqueSlug } from "@/lib/services/admin";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

async function doList(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(48, Math.max(1, Number(url.searchParams.get("limit") ?? 12)));
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();

  const where: Prisma.PropertyWhereInput = {
    deletedAt: null,
    ...(status && status !== "ALL" ? { status: status as PropertyStatus } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { city: { contains: q } }] } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { where: { isCover: true }, include: { mediaAsset: true } },
        _count: { select: { images: true, contactRequests: true } },
      },
    }),
  ]);

  return ok({
    items: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      operation: r.operation,
      type: r.type,
      price: r.price,
      currency: r.currency,
      status: r.status,
      featured: r.featured,
      city: r.city,
      zone: r.zone,
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      area: r.area,
      coverUrl: r.images[0]?.mediaAsset.url ?? null,
      coverThumb: r.images[0]?.mediaAsset.thumbUrl ?? null,
      imageCount: r._count.images,
      contactCount: r._count.contactRequests,
      updatedAt: r.updatedAt,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

async function doCreate(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  const data = parsed.data;
  const slug = data.slug?.trim() || (await uniqueSlug("property", slugify(data.title) || "inmueble"));

  let property;
  try {
    property = await prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          operation: data.operation,
          type: data.type,
          price: data.price ?? null,
          currency: data.currency,
          status: data.status,
          featured: data.featured ?? false,
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
      if (data.features.length > 0) {
        await tx.propertyFeature.createMany({
          data: data.features.map((f) => ({
            propertyId: created.id,
            name: f.trim(),
          })),
        });
      }
      return created;
    });
  } catch (err) {
    if (String(err).includes("Unique constraint")) {
      return fail(409, "SLUG_CONFLICT", "Ya existe un inmueble con ese slug.");
    }
    throw err;
  }

  await logAudit({
    action: "CREATE_PROPERTY",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "property",
    entityId: property.id,
    details: { title: property.title, slug },
  });

  return ok({ id: property.id, slug: property.slug }, 201);
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}
export async function POST(request: Request) {
  return handle(() => doCreate(request));
}