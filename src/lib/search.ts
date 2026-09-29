import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { propertyQuerySchema } from "@/lib/validation/schemas";

/** Parámetros de búsqueda permitidos y únicos (single source of truth). */
export const SEARCH_PARAMS = [
  "operacion",
  "ciudad",
  "zona",
  "barrio",
  "tipo",
  "precio_min",
  "precio_max",
  "habitaciones",
  "banos",
  "area_min",
  "area_max",
  "parqueaderos",
  "estrato",
  "caracteristicas",
] as const;

export type SearchParamsRecord = Record<string, string>;

/** Extrae solo los parámetros válidos de un objeto de entrada. */
export function normalizeSearchParams(
  source: Record<string, string | string[] | undefined> | URLSearchParams
): SearchParamsRecord {
  const get = (k: string): string => {
    const v = source instanceof URLSearchParams ? source.get(k) : source[k];
    return typeof v === "string" ? v : Array.isArray(v) ? v[0] ?? "" : "";
  };
  const out: SearchParamsRecord = {};
  for (const key of SEARCH_PARAMS) {
    const value = get(key).trim();
    if (value) out[key] = value;
  }
  return out;
}

/** Convierte los parámetros normalizados en una URL de búsqueda. */
export function searchUrl(
  base = "/viviendas",
  params: SearchParamsRecord
): string {
  const url = new URL(base, "http://localhost");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }
  const search = url.search.replace(/^\?/, "");
  return search ? `${url.pathname}?${search}` : url.pathname;
}

export type NormalizedQuery = {
  operacion?: string;
  ciudad?: string;
  zona?: string;
  barrio?: string;
  tipo?: string;
  precioMin?: number;
  precioMax?: number;
  habitaciones?: number;
  banos?: number;
  areaMin?: number;
  areaMax?: number;
  parqueaderos?: number;
  estrato?: number;
  caracteristicas: string[];
};

export function normalizeQuery(params: SearchParamsRecord): NormalizedQuery {
  const parsed = propertyQuerySchema.safeParse(params);
  const d: z.output<typeof propertyQuerySchema> = parsed.success
    ? parsed.data
    : { page: 1, sort: "relevancia" };
  const features = (params.caracteristicas ?? "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  return {
    operacion: d.operacion,
    ciudad: params.ciudad,
    zona: params.zona,
    barrio: params.barrio,
    tipo: d.tipo,
    precioMin: d.precio_min,
    precioMax: d.precio_max,
    habitaciones: d.habitaciones,
    banos: d.banos,
    areaMin: d.area_min,
    areaMax: d.area_max,
    parqueaderos: d.parqueaderos,
    estrato: d.estrato,
    caracteristicas: features,
  };
}

const contains = (value?: string): Prisma.StringFilter | undefined =>
  value ? { contains: value } : undefined;

export function buildWhereClause(q: NormalizedQuery): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: "PUBLISHED",
    deletedAt: null,
  };
  if (q.operacion) where.operation = q.operacion as "VENTA" | "ARRIENDO";
  if (q.tipo) where.type = q.tipo as never;
  where.city = contains(q.ciudad);
  where.zone = contains(q.zona);
  where.neighborhood = contains(q.barrio);
  if (q.precioMin !== undefined) {
    where.price = { ...(where.price as object), gte: q.precioMin };
  }
  if (q.precioMax !== undefined) {
    where.price = { ...(where.price as object), lte: q.precioMax };
  }
  if (q.habitaciones !== undefined) where.bedrooms = { gte: q.habitaciones };
  if (q.banos !== undefined) where.bathrooms = { gte: q.banos };
  if (q.areaMin !== undefined) where.area = { gte: q.areaMin };
  if (q.areaMax !== undefined) where.area = { ...(where.area as object), lte: q.areaMax };
  if (q.parqueaderos !== undefined) where.parking = { gte: q.parqueaderos };
  if (q.estrato !== undefined) where.estrato = q.estrato;
  if (q.caracteristicas.length > 0) {
    where.AND = q.caracteristicas.map((name) => ({
      features: { some: { name: { contains: name } } },
    }));
  }
  return where;
}

export function buildOrderBy(
  sort: string
): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case "precio-asc":
      return [{ price: "asc" }];
    case "precio-desc":
      return [{ price: "desc" }];
    case "area-desc":
      return [{ area: "desc" }];
    case "recientes":
      return [{ updatedAt: "desc" }];
    default:
      return [{ featured: "desc" }, { updatedAt: "desc" }];
  }
}