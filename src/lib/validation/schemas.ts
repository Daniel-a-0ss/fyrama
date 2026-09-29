import { z } from "zod";
import {
  CONTACT_PREFERENCES,
  FEATURE_PRESETS,
  LEGAL_TOPICS,
  MAX_ARTICLE_CONTENT,
  MAX_CONTACT_MESSAGE,
  MAX_PROPERTY_DESCRIPTION,
  PROPERTY_TYPES,
} from "@/lib/constants";
import { isValidPasswordPolicy } from "@/lib/auth/password";
import { slugify } from "@/lib/utils";

const str = (max = 2000) => z.string().trim().max(max).optional().or(z.literal(""));

const enumFrom = <U extends string, T extends readonly [U, ...U[]]>(values: T) =>
  z.enum(values);

const operationEnum = enumFrom(["VENTA", "ARRIENDO"]);
const propertyTypeEnum = enumFrom([
  "APARTAMENTO",
  "CASA",
  "OFICINA",
  "LOCAL",
  "BODEGA",
  "LOTE",
  "EDIFICIO",
  "CASA_CAMPO",
]);
const propertyStatusEnum = enumFrom(["DRAFT", "PUBLISHED", "HIDDEN"]);
const articleStatusEnum = enumFrom(["DRAFT", "PUBLISHED"]);
const roleEnum = enumFrom(["ADMIN", "EDITOR"]);
const contactTypeEnum = enumFrom(["PROPERTY", "LEGAL", "GENERAL"]);
const contactStatusEnum = enumFrom(["NEW", "CONTACTED", "CLOSED"]);
export { contactStatusEnum };
const mediaKindEnum = enumFrom(["PROPERTY", "ARTICLE", "GENERAL"]);

const toNumber = (v: unknown): number | undefined => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

const coerceNumber = (min: number, max: number) =>
  z.preprocess(toNumber, z.number().min(min).max(max).optional());

export const loginSchema = z.object({
  email: z.string().email("El correo no es válido"),
  password: z.string().min(1, "La contraseña es obligatoria").max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z
    .string()
    .min(10, "Mínimo 10 caracteres")
    .max(128)
    .refine(isValidPasswordPolicy, {
      message: "Debe incluir mayúsculas, minúsculas y números",
    }),
});

export const contactSchema = z.object({
  type: contactTypeEnum.default("GENERAL"),
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  email: z.string().email("El correo no es válido").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres)")
    .max(MAX_CONTACT_MESSAGE),
  propertyId: z.string().cuid().optional().or(z.literal("")),
  legalTopic: z.enum(LEGAL_TOPICS as unknown as [string, ...string[]]).optional(),
  contactPreference: z.enum(CONTACT_PREFERENCES as unknown as [string, ...string[]]).optional(),
  company: z.string().max(0).optional().or(z.literal("")), // honeypot
});

const cleanFeatures = z
  .array(z.string().trim().max(80))
  .max(60)
  .optional()
  .default([]);

function enumOrFreeString(values: readonly string[]) {
  return z
    .string()
    .trim()
    .optional()
    .transform((v) =>
      v === undefined || v.trim() === "" || values.includes(v) ? v : undefined
    );
}

export const propertySchema = z.object({
  title: z.string().trim().min(3, "El título es obligatorio").max(120),
  slug: z.string().trim().max(160).optional(),
  description: z.string().trim().max(MAX_PROPERTY_DESCRIPTION).default(""),
  operation: operationEnum,
  type: propertyTypeEnum,
  price: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).max(100_000_000_000).nullable().optional()
  ),
  currency: z.string().trim().max(8).default("COP"),
  status: propertyStatusEnum.default("DRAFT"),
  featured: z.preprocess((v) => v === true || v === "true", z.boolean()).optional(),
  city: str(80),
  zone: str(80),
  neighborhood: str(100),
  address: str(160),
  latitude: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().min(-90).max(90).nullable().optional()
  ),
  longitude: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().min(-180).max(180).nullable().optional()
  ),
  area: coerceNumber(1, 10_000_000),
  builtArea: coerceNumber(1, 10_000_000),
  bedrooms: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).max(50).nullable().optional()
  ),
  bathrooms: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).max(50).nullable().optional()
  ),
  parking: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(0).max(50).nullable().optional()
  ),
  estrato: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(1).max(6).nullable().optional()
  ),
  features: cleanFeatures.refine((f) =>
    f.every((name) => name.trim().length > 0)
  ),
});

export const propertyQuerySchema = z.object({
  page: z.preprocess(toNumber, z.number().int().min(1).default(1)),
  limit: z.preprocess(toNumber, z.number().int().min(1).max(48).optional()),
  sort: z
    .enum(["relevancia", "precio-asc", "precio-desc", "area-desc", "recientes"])
    .catch("relevancia"),
  operacion: enumOrFreeString(["VENTA", "ARRIENDO"]),
  ciudad: str(80),
  zona: str(80),
  barrio: str(100),
  tipo: enumOrFreeString(PROPERTY_TYPES.map((t) => t.value)),
  precio_min: coerceNumber(0, 100_000_000_000),
  precio_max: coerceNumber(0, 100_000_000_000),
  habitaciones: coerceNumber(0, 20),
  banos: coerceNumber(0, 20),
  area_min: coerceNumber(0, 10_000_000),
  area_max: coerceNumber(0, 10_000_000),
  parqueaderos: coerceNumber(0, 20),
  estrato: coerceNumber(0, 6),
  zone_id: z.string().optional(),
});

export const articleSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().max(180).optional(),
  excerpt: z.string().trim().max(320).default(""),
  content: z.string().trim().max(MAX_ARTICLE_CONTENT).default(""),
  coverMediaId: z.string().cuid().optional().or(z.literal("")),
  coverAlt: str(200),
  categoryId: z.string().cuid().optional().or(z.literal("")),
  author: z.string().trim().max(100).default("Fyrama"),
  publishedAt: z
    .string()
    .datetime()
    .optional()
    .or(z.literal(""))
    .or(z.literal(null)),
  status: articleStatusEnum.default("DRAFT"),
  seoTitle: str(120),
  metaDescription: str(200),
});

export const articleCategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().max(80).optional(),
});

export const legalServiceSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z.string().trim().max(150).optional(),
  description: z.string().trim().max(400).default(""),
  content: z.string().trim().max(20000).default(""),
  icon: z.string().trim().max(40).default("scale"),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

export const userSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().trim().max(120),
  password: z
    .string()
    .min(10, "Mínimo 10 caracteres")
    .max(128)
    .refine(isValidPasswordPolicy, {
      message: "Debe incluir mayúsculas, minúsculas y números",
    }),
  role: roleEnum.default("EDITOR"),
});

export const userUpdateSchema = userSchema.omit({ password: true }).extend({
  password: z
    .string()
    .min(10)
    .max(128)
    .refine(isValidPasswordPolicy)
    .optional()
    .or(z.literal("")),
  active: z.boolean().optional(),
});

export const settingsSchema = z
  .record(z.string().trim().min(1).max(80), z.string().trim().max(5000))
  .refine((v) => Object.keys(v).length <= 60);

export const mediaKindSchema = mediaKindEnum.default("GENERAL");

export function makeSlug(value: string): string {
  return slugify(value);
}
export { FEATURE_PRESETS };