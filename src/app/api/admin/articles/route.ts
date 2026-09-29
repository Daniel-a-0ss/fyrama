import { prisma } from "@/lib/prisma";
import { ArticleStatus, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { articleSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/services/admin";

export const runtime = "nodejs";

function toPublishedAt(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(value);
}

async function doList(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(48, Math.max(1, Number(url.searchParams.get("limit") ?? 15)));
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();

  const where: Prisma.ArticleWhereInput = {
    ...(status && status !== "ALL" ? { status: status as ArticleStatus } : {}),
    ...(q ? { title: { contains: q } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        author: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
        coverMedia: { select: { thumbUrl: true } },
      },
    }),
  ]);

  return ok({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
}

async function doCreate(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const d = parsed.data;

  const slug =
    d.slug?.trim() || (await uniqueSlug("article", slugify(d.title) || "articulo"));

  let article;
  try {
    article = await prisma.article.create({
      data: {
        title: d.title,
        slug,
        excerpt: d.excerpt,
        content: d.content,
        coverMediaId: d.coverMediaId || null,
        coverAlt: d.coverAlt || null,
        categoryId: d.categoryId || null,
        author: d.author,
        publishedAt: toPublishedAt(d.publishedAt ?? null),
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
    action: "CREATE_ARTICLE",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "article",
    entityId: article.id,
    details: { title: article.title },
  });

  return ok({ id: article.id, slug: article.slug }, 201);
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}
export async function POST(request: Request) {
  return handle(() => doCreate(request));
}