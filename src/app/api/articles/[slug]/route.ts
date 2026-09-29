import { prisma } from "@/lib/prisma";
import { fail, ok, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doDetail(_request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: {
      category: true,
      coverMedia: true,
    },
  });
  if (!article) {
    return fail(404, "NOT_FOUND", "El artículo no existe o no está publicado.");
  }
  return ok({ article });
}

export async function GET(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  return handle(() => doDetail(request, ctx));
}