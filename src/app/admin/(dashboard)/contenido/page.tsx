import Link from "next/link";
import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Contenido · Fyrama" };

export default async function AdminContenidoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const status = params.status ?? "ALL";
  const q = params.q?.trim() ?? "";
  const limit = 15;

  const where: Prisma.ArticleWhereInput = {
    ...(status !== "ALL" ? { status: status as ArticleStatus } : {}),
    ...(q ? { title: { contains: q } } : {}),
  };

  const [total, articles, categories] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
        coverMedia: { select: { thumbUrl: true } },
      },
    }),
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Contenido</h1>
          <p className="mt-1 text-sm text-ink-500">Artículos del blog y categorías.</p>
        </div>
        <Link
          href="/admin/contenido/nuevo"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800"
        >
          <Plus className="size-4" aria-hidden /> Nuevo artículo
        </Link>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        {[
          { key: "ALL", label: "Todos" },
          { key: "PUBLISHED", label: "Publicados" },
          { key: "DRAFT", label: "Borradores" },
        ].map((t) => (
          <a
            key={t.key}
            href={t.key === "ALL" ? "/admin/contenido" : `/admin/contenido?status=${t.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              status === t.key ? "bg-pine-950 text-bone-50" : "border border-ink-900/12 text-ink-600 hover:bg-white"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      <form method="get" action="/admin/contenido" className="mb-6">
        <div className="flex max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar artículo…"
              className="w-full rounded-xl border border-ink-900/12 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-pine-700 focus:ring-2 focus:ring-pine-700/20"
            />
          </div>
          <button type="submit" className="rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800">
            Buscar
          </button>
        </div>
      </form>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone-300 bg-white py-14 text-center text-ink-500">
          No hay artículos que coincidan.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-bone-200 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-bone-200 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Artículo</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="hidden px-4 py-3 sm:table-cell">Publicación</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-100">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-bone-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-bone-100">
                        {a.coverMedia && (
                          <img src={a.coverMedia.thumbUrl ?? ""} alt="" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">{a.title}</p>
                        <p className="text-xs text-ink-400">{a.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{a.category?.name ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="hidden px-4 py-3 text-ink-600 sm:table-cell">{formatDate(a.publishedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/contenido/${a.id}`} className="font-medium text-pine-800 hover:underline">Editar</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-3" aria-label="Paginación">
          {page > 1 && (
            <a href={`/admin/contenido?page=${page - 1}&status=${status}&q=${encodeURIComponent(q)}`} className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white">← Anterior</a>
          )}
          <span className="text-sm text-ink-500">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <a href={`/admin/contenido?page=${page + 1}&status=${status}&q=${encodeURIComponent(q)}`} className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white">Siguiente →</a>
          )}
        </nav>
      )}

      <CategoriesManager initial={categories} />
    </div>
  );
}