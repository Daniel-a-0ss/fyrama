import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { articleCategorySchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/services/admin";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function doUpdate(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.articleCategory.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "La categoría no existe.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = articleCategorySchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const d = parsed.data;

  const want = d.slug?.trim();
  const slug =
    want && want !== existing.slug
      ? await uniqueSlug("category", slugify(want) || "categoria", existing.id)
      : existing.slug;

  try {
    const category = await prisma.articleCategory.update({
      where: { id },
      data: { name: d.name, slug },
    });
    return ok({ id: category.id, slug: category.slug });
  } catch {
    return fail(409, "SLUG_CONFLICT", "Ya existe una categoría con ese slug.");
  }
}

async function doDelete(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.articleCategory.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "La categoría no existe.");

  const count = await prisma.article.count({ where: { categoryId: id } });
  if (count > 0) {
    return fail(
      409,
      "CATEGORY_IN_USE",
      "Esta categoría tiene artículos asociados. Reasigna o elimina los artículos primero."
    );
  }

  await prisma.articleCategory.delete({ where: { id } });
  return ok({ deleted: true });
}

export async function PUT(request: Request, ctx: Ctx) {
  return handle(() => doUpdate(request, ctx));
}
export async function DELETE(request: Request, ctx: Ctx) {
  return handle(() => doDelete(request, ctx));
}