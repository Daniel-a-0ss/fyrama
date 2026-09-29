import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export const runtime = "nodejs";

const STATIC_ROUTES: Array<[string, string]> = [
  ["/", "0.9"],
  ["/viviendas", "0.9"],
  ["/nuestra-empresa", "0.7"],
  ["/servicios-inmobiliarios", "0.7"],
  ["/permuta", "0.7"],
  ["/asesoria-juridica", "0.8"],
  ["/blog", "0.8"],
  ["/contacto", "0.7"],
  ["/politica-de-privacidad", "0.3"],
  ["/terminos-y-condiciones", "0.3"],
  ["/tratamiento-de-datos-personales", "0.3"],
  ["/politica-de-cookies", "0.3"],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, articles] = await Promise.all([
    prisma.property.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(([path, priority]) => ({
    url: absoluteUrl(path),
    priority: Number(priority),
    changeFrequency: path === "/" ? "weekly" : "monthly",
  }));

  for (const p of properties) {
    entries.push({
      url: absoluteUrl(`/viviendas/${p.slug}`),
      lastModified: p.updatedAt,
      priority: 0.8,
      changeFrequency: "weekly",
    });
  }

  for (const a of articles) {
    entries.push({
      url: absoluteUrl(`/blog/${a.slug}`),
      lastModified: a.updatedAt,
      priority: 0.7,
      changeFrequency: "monthly",
    });
  }

  return entries;
}