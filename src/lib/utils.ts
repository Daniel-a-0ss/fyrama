import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatCurrency(value: number | null | undefined, currency = "COP"): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function pluralize(count: number | null | undefined, singular: string, plural?: string) {
  const n = count ?? 0;
  if (n === 1) return `${n} ${singular}`;
  return `${n} ${plural ?? singular + "s"}`;
}

export function formatArea(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${Math.round(value).toLocaleString("es-CO")} m²`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://fyrama.com"
    : "http://localhost:3000")
).replace(/\/$/, "");

export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}/${path.replace(/^\//, "")}`;
}

export function getClientIp(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip");
}

export function getClientUserAgent(headers: Headers): string | null {
  return headers.get("user-agent");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function safeSlugSegment(value: string): string {
  const slugged = slugify(value);
  return slugged || "item";
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Construye un atributo srcset a partir de las variantes generadas por sharp.
 * Las variantes se guardan como { "320": "/media/...", "480": "...", ... }.
 */
export function buildSrcSet(
  variants: Record<string, string> | null | undefined,
  widths: number[] = [320, 480, 800, 1200, 1600]
): string {
  if (!variants) return "";
  const parts = widths
    .filter((w) => variants[String(w)])
    .map((w) => `${variants[String(w)]} ${w}w`);
  return parts.join(", ");
}