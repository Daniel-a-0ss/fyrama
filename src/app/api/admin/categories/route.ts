import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { articleCategorySchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/services/admin";

export const runtime = "nodejs";

async function doList(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const items = await prisma.articleCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  return ok({ items });
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
  const parsed = articleCategorySchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const d = parsed.data;

  const slug =
    d.slug?.trim() || (await uniqueSlug("category", slugify(d.name) || "categoria"));

  try {
    const category = await prisma.articleCategory.create({ data: { name: d.name, slug } });
    return ok({ id: category.id, slug: category.slug }, 201);
  } catch {
    return fail(409, "SLUG_CONFLICT", "Ya existe una categoría con ese slug.");
  }
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}
export async function POST(request: Request) {
  return handle(() => doCreate(request));
}