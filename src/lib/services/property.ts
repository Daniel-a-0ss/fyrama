import type {
  MediaAsset,
  Operation,
  Prisma,
  Property,
  PropertyImage,
  PropertyType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mergeCityOptions } from "@/lib/colombia";
import {
  buildOrderBy,
  buildWhereClause,
  type NormalizedQuery,
} from "@/lib/search";

export type MediaImage = {
  url: string;
  thumbUrl: string | null;
  cardUrl: string | null;
  variants: Record<string, string> | null;
  alt: string | null;
  width: number | null;
  height: number | null;
};

export function parseVariants(json: string | null): Record<string, string> | null {
  if (!json) return null;
  try {
    const v = JSON.parse(json) as Record<string, string>;
    return v && typeof v === "object" ? v : null;
  } catch {
    return null;
  }
}

export type PropertyWithImages = {
  images: Array<{
    mediaAsset: MediaAsset;
    sortOrder?: number;
    isCover?: boolean;
    alt?: string | null;
  }>;
};

export function imageFor(property: PropertyWithImages): MediaImage | null {
  if (property.images.length === 0) return null;
  const sorted = [...property.images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
  const image = sorted.find((i) => i.isCover) ?? sorted[0];
  return {
    url: image.mediaAsset.url,
    thumbUrl: image.mediaAsset.thumbUrl,
    cardUrl: image.mediaAsset.cardUrl,
    variants: parseVariants(image.mediaAsset.variants),
    alt: image.alt || image.mediaAsset.alt,
    width: image.mediaAsset.width,
    height: image.mediaAsset.height,
  };
}

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  operation: true,
  type: true,
  price: true,
  currency: true,
  city: true,
  zone: true,
  neighborhood: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  parking: true,
  featured: true,
  updatedAt: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    include: { mediaAsset: true },
  },
} satisfies Prisma.PropertySelect;

export type PropertyCardView = {
  id: string;
  slug: string;
  title: string;
  operation: Operation;
  type: PropertyType;
  price: number | null;
  currency: string;
  city: string | null;
  zone: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  parking: number | null;
  featured: boolean;
  updatedAt: Date;
  cover: MediaImage | null;
};

export function toCardView(property: {
  id: string;
  slug: string;
  title: string;
  operation: Operation;
  type: PropertyType;
  price: number | null;
  currency: string;
  city: string | null;
  zone: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  parking: number | null;
  featured: boolean;
  updatedAt: Date;
  images: Array<{ mediaAsset: import("@prisma/client").MediaAsset }>;
}): PropertyCardView {
  const image = imageFor(property);
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    operation: property.operation,
    type: property.type,
    price: property.price,
    currency: property.currency,
    city: property.city,
    zone: property.zone,
    neighborhood: property.neighborhood,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    parking: property.parking,
    featured: property.featured,
    updatedAt: property.updatedAt,
    cover: image,
  };
}

export type PropertyListResult = {
  items: PropertyCardView[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

export async function listProperties(options: {
  q: NormalizedQuery;
  sort: string;
  page: number;
  limit?: number;
}): Promise<PropertyListResult> {
  const limit = options.limit ?? 9;
  const where = buildWhereClause(options.q);
  const orderBy = buildOrderBy(options.sort);
  const [total, rows] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy,
      skip: (options.page - 1) * limit,
      take: limit,
      select: cardSelect,
    }),
  ]);
  return {
    items: rows.map((r) => toCardView(r)),
    total,
    page: options.page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    limit,
  };
}

export type PropertyDetail = Property & {
  images: (PropertyImage & { mediaAsset: MediaAsset })[];
  features: { id: string; name: string }[];
};

export async function getPropertyBySlug(slug: string): Promise<PropertyDetail | null> {
  const property = await prisma.property.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" }, include: { mediaAsset: true } },
      features: { orderBy: { name: "asc" } },
    },
  });
  return property;
}

export async function getRelatedProperties(
  current: PropertyDetail,
  limit = 3
): Promise<PropertyCardView[]> {
  const rows = await prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      slug: { not: current.slug },
      OR: [{ city: current.city }, { operation: current.operation }],
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
  const fill = rows.length < limit ? limit - rows.length : 0;
  if (fill > 0) {
    const extra = await prisma.property.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        slug: { not: current.slug },
      },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: fill,
      select: cardSelect,
    });
    const seen = new Set(rows.map((r) => r.id));
    for (const e of extra) {
      if (!seen.has(e.id)) rows.push(e);
    }
  }
  return rows.map((r) => toCardView(r));
}

/**
 * Ciudades para los filtros: los municipios donde ya hay inmuebles publicados
 * más el catálogo nacional, para poder consultar cualquier ciudad de Colombia
 * aunque todavía no haya inventario.
 */
export async function getCities(): Promise<string[]> {
  const rows = await prisma.property.findMany({
    where: { status: "PUBLISHED", deletedAt: null, city: { not: null } },
    distinct: ["city"],
    select: { city: true },
  });
  return mergeCityOptions(rows.map((r) => r.city!));
}

export const PROPERTY_CARD_SELECT = cardSelect;