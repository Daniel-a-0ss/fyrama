import { prisma } from "@/lib/prisma";
import { ReviewStatus } from "@prisma/client";
import { ReviewRow } from "@/components/admin/ReviewRow";

export const metadata = { title: "Opiniones · Fyrama" };

const FILTERS = [
  { key: "PENDING", label: "Pendientes" },
  { key: "APPROVED", label: "Publicadas" },
  { key: "REJECTED", label: "Rechazadas" },
  { key: "ALL", label: "Todas" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const status = params.status ?? "PENDING";
  const limit = 10;

  const where =
    status !== "ALL" ? { status: status as ReviewStatus } : {};

  let total = 0;
  let reviews: Awaited<ReturnType<typeof prisma.review.findMany>> = [];
  let pendingCount = 0;
  let tableMissing = false;

  try {
    [total, reviews, pendingCount] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { status: "PENDING" } }),
    ]);
  } catch (err) {
    console.error("[fyrama-admin-reviews] no se pudieron leer las opiniones:", err);
    tableMissing = true;
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">
          Opiniones
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {total} opiniones en total
          {pendingCount > 0 ? ` · ${pendingCount} esperando revisión` : ""}.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = status === f.key;
          const qs = new URLSearchParams();
          if (f.key !== "PENDING") qs.set("status", f.key);
          return (
            <a
              key={f.key}
              href={f.key === "PENDING" ? "/admin/opiniones" : `/admin/opiniones?${qs.toString()}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-pine-950 text-bone-50"
                  : "border border-ink-900/12 text-ink-600 hover:bg-white"
              }`}
            >
              {f.label}
            </a>
          );
        })}
      </div>

      {tableMissing ? (
        <div className="rounded-2xl border border-dashed border-gold-600/50 bg-gold-100/30 p-8 text-center">
          <p className="font-medium text-ink-900">
            Falta crear la tabla de opiniones en la base de datos
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-ink-600">
            Ejecuta una sola vez el archivo{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              prisma/review-migration.sql
            </code>{" "}
            en el editor SQL de Postgres (Vercel → Storage → Postgres → Data).
            Es aditivo: no toca los datos existentes.
          </p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone-300 bg-white py-14 text-center text-ink-500">
          No hay opiniones que coincidan.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((r) => (
            <ReviewRow
              key={r.id}
              review={{
                id: r.id,
                name: r.name,
                rating: r.rating,
                title: r.title,
                content: r.content,
                status: r.status,
                createdAt: r.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Paginación">
          {page > 1 && (
            <a
              href={`/admin/opiniones?page=${page - 1}&status=${status}`}
              className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white"
            >
              ← Anterior
            </a>
          )}
          <span className="text-sm text-ink-500">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <a
              href={`/admin/opiniones?page=${page + 1}&status=${status}`}
              className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white"
            >
              Siguiente →
            </a>
          )}
        </nav>
      )}
    </div>
  );
}
