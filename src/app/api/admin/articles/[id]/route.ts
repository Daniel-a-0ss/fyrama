import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { articleSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/services/admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

function toPublishedAt(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(value);
}

async function doDetail(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      coverMedia: { select: { id: true, url: true, thumbUrl: true } },
    },
  });
  if (!article) return fail(404, "NOT_FOUND", "El artículo no existe.");
  return ok({ article });
}

async function doUpdate(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "El artículo no existe.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const d = parsed.data;

  const want = d.slug?.trim();
  const slug =
    want && want !== existing.slug
      ? await uniqueSlug("article", slugify(want) || "articulo", existing.id)
      : existing.slug;

  let article;
  try {
    article = await prisma.article.update({
      where: { id },
      data: {
        title: d.title,
        slug,
        excerpt: d.excerpt,
        content: d.content,
        coverMediaId: d.coverMediaId || null,
        coverAlt: d.coverAlt || null,
        categoryId: d.categoryId || null,
        author: d.author,
        publishedAt: toPublishedAt(d.publishedAt ?? existing.publishedAt?.toISOString()),
        status: d.status,
        seoTitle: d.seoTitle || null,
        metaDescription: d.metaDescription || null,
      },
    });
  } catch (err) {
    if (String(err).includes("Unique constraint")) {
      return fail(409, "SLUG_CONFLICT", "Ya existe un artículo con ese slug.");
    }
    throw err;
  }

  await logAudit({
    action: "UPDATE_ARTICLE",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "article",
    entityId: id,
    details: { title: article.title, status: article.status },
  });

  return ok({ id: article.id, slug: article.slug });
}

async function doDelete(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "El artículo no existe.");

  await prisma.article.delete({ where: { id } });

  await logAudit({
    action: "DELETE_ARTICLE",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "article",
    entityId: id,
    details: { title: existing.title },
  });

  return ok({ deleted: true });
}

export async function GET(request: Request, ctx: Ctx) {
  return handle(() => doDetail(request, ctx));
}
export async function PUT(request: Request, ctx: Ctx) {
  return handle(() => doUpdate(request, ctx));
}
export async function DELETE(request: Request, ctx: Ctx) {
  return handle(() => doDelete(request, ctx));
}