import Link from "next/link";
import { Prisma, PropertyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Plus, Search } from "lucide-react";
import { OperationBadge, StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { PROPERTY_TYPE_LABEL } from "@/lib/constants";

export const metadata = { title: "Inmuebles · Fyrama" };

export default async function AdminViviendasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const status = params.status ?? "ALL";
  const q = params.q?.trim() ?? "";
  const limit = 12;

  const where: Prisma.PropertyWhereInput = {
    deletedAt: null,
    ...(status !== "ALL" ? { status: status as PropertyStatus } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { city: { contains: q } }] } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { where: { isCover: true }, include: { mediaAsset: true } },
        _count: { select: { images: true, contactRequests: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const statusTabs = [
    { key: "ALL", label: "Todas" },
    { key: "PUBLISHED", label: "Publicadas" },
    { key: "DRAFT", label: "Borradores" },
    { key: "HIDDEN", label: "Ocultas" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Inmuebles</h1>
          <p className="mt-1 text-sm text-ink-500">{total} inmuebles en total.</p>
        </div>
        <Link
          href="/admin/viviendas/nueva"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800"
        >
          <Plus className="size-4" aria-hidden /> Nuevo inmueble
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statusTabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "ALL" ? "/admin/viviendas" : `/admin/viviendas?status=${t.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              status === t.key
                ? "bg-pine-950 text-bone-50"
                : "border border-ink-900/12 text-ink-600 hover:bg-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <form method="get" action="/admin/viviendas" className="mb-6">
        <div className="flex max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por título o ciudad…"
              className="w-full rounded-xl border border-ink-900/12 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-pine-700 focus:ring-2 focus:ring-pine-700/20"
            />
          </div>
          <button type="submit" className="rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800">
            Buscar
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone-300 bg-white py-16 text-center">
          <p className="text-ink-500">No hay inmuebles que coincidan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-bone-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-bone-200 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Inmueble</th>
                <th className="px-4 py-3">Operación</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="hidden px-4 py-3 sm:table-cell">Ciudad</th>
                <th className="hidden px-4 py-3 md:table-cell">Fotos</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-bone-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-bone-100">
                        {p.images[0] && (
                          <img
                            src={p.images[0].mediaAsset.thumbUrl ?? p.images[0].mediaAsset.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">
                          {p.featured && <span className="mr-1 text-gold-500" title="Destacada">★</span>}
                          {p.title}
                        </p>
                        <p className="truncate text-xs text-ink-400">{PROPERTY_TYPE_LABEL[p.type]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><OperationBadge operation={p.operation} /></td>
                  <td className="px-4 py-3 font-medium text-ink-800">
                    {formatCurrency(p.price, p.currency)}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="hidden px-4 py-3 text-ink-600 sm:table-cell">{p.city ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-ink-600 md:table-cell">{p._count.images}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/viviendas/${p.id}`} className="font-medium text-pine-800 hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Paginación">
          {page > 1 && (
            <Link href={`/admin/viviendas?page=${page - 1}&status=${status}&q=${encodeURIComponent(q)}`} className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white">
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-ink-500">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/viviendas?page=${page + 1}&status=${status}&q=${encodeURIComponent(q)}`} className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white">
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}