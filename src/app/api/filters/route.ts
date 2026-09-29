import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";

export const runtime = "nodejs";

/** Opciones dinámicas para el buscador (ciudades, zonas, tipos, features). */
async function doFilters() {
  const [cities, zones, types, features, operations] = await Promise.all([
    prisma.property.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    }),
    prisma.property.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        zone: { not: null },
      },
      select: { zone: true },
      distinct: ["zone"],
      orderBy: { zone: "asc" },
      take: 60,
    }),
    prisma.property.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { type: true },
      distinct: ["type"],
    }),
    prisma.propertyFeature.findMany({
      distinct: ["name"],
      where: { name: { not: "" } },
      orderBy: { name: "asc" },
      take: 80,
    }),
    prisma.property.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { operation: true },
      distinct: ["operation"],
    }),
  ]);

  return ok({
    cities: cities.map((c) => c.city).filter(Boolean),
    zones: zones.map((z) => z.zone).filter(Boolean),
    types: types.map((t) => t.type).filter(Boolean),
    features: features.map((f) => f.name).filter(Boolean),
    operations: operations.map((o) => o.operation),
  });
}

export async function GET() {
  return handle(() => doFilters());
}