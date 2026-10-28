import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export type SlugKind =
  | "property"
  | "article"
  | "category"
  | "legal-service"
  | "real-estate-service";

export async function uniqueSlug(
  kind: SlugKind,
  base: string,
  excludeId?: string
): Promise<string> {
  const root = base || "item";
  let candidate = root;
  let i = 2;
  for (;;) {
    const find = (slug: string) => {
      switch (kind) {
        case "property":
          return prisma.property.findUnique({ where: { slug }, select: { id: true } });
        case "article":
          return prisma.article.findUnique({ where: { slug }, select: { id: true } });
        case "category":
          return prisma.articleCategory.findUnique({ where: { slug }, select: { id: true } });
        case "legal-service":
          return prisma.legalService.findUnique({ where: { slug }, select: { id: true } });
        case "real-estate-service":
          return prisma.realEstateService.findUnique({ where: { slug }, select: { id: true } });
      }
    };
    const existing = await find(candidate);
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${i++}`;
  }
}

export function slugFromTitle(title: string): string {
  return slugify(title) || "item";
}