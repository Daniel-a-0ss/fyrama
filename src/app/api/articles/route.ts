import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doList() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverAlt: true,
        author: true,
        publishedAt: true,
        category: { select: { slug: true, name: true } },
        coverMedia: { select: { url: true } },
      },
    }),
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: { where: { status: "PUBLISHED" } } } } },
    }),
  ]);
  return ok({ articles, categories });
}

export async function GET() {
  return handle(() => doList());
}