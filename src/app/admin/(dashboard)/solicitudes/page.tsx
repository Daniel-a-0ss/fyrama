import { ContactStatus, ContactType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { RequestRow } from "@/components/admin/RequestRow";

export const metadata = { title: "Solicitudes · Fyrama" };

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const status = params.status ?? "ALL";
  const type = params.type ?? "ALL";
  const limit = 15;

  const where: Prisma.ContactRequestWhereInput = {
    ...(status !== "ALL" ? { status: status as ContactStatus } : {}),
    ...(type !== "ALL" ? { type: type as ContactType } : {}),
  };

  const [total, requests] = await Promise.all([
    prisma.contactRequest.count({ where }),
    prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { property: { select: { id: true, title: true, slug: true } } },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const filters = [
    { key: "ALL", label: "Todas" },
    { key: "NEW", label: "Nuevas" },
    { key: "CONTACTED", label: "Contactadas" },
    { key: "COMPLETED", label: "Completadas" },
    { key: "ARCHIVED", label: "Archivadas" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Solicitudes</h1>
        <p className="mt-1 text-sm text-ink-500">{total} solicitudes en total.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[
          { key: "ALL", label: "Todas" },
          { key: "PROPERTY", label: "Inmuebles" },
          { key: "LEGAL", label: "Asesoría" },
          { key: "GENERAL", label: "General" },
        ].map((t) => {
          const active = type === t.key;
          const qs = new URLSearchParams();
          if (status !== "ALL") qs.set("status", status);
          if (t.key !== "ALL") qs.set("type", t.key);
          return (
            <a
              key={t.key}
              href={"/admin/solicitudes?" + qs.toString()}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-pine-950 text-bone-50" : "border border-ink-900/12 text-ink-600 hover:bg-white"
              }`}
            >
              {t.label}
            </a>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const active = status === f.key;
          const qs = new URLSearchParams();
          if (f.key !== "ALL") qs.set("status", f.key);
          if (type !== "ALL") qs.set("type", type);
          return (
            <a
              key={f.key}
              href={`/admin/solicitudes?${qs.toString()}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-gold-600 text-ink-950" : "border border-gold-600/30 text-ink-600 hover:bg-gold-100/40"
              }`}
            >
              {f.label}
            </a>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone-300 bg-white py-14 text-center text-ink-500">
          No hay solicitudes que coincidan.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {requests.map((r) => (
            <RequestRow
              key={r.id}
              request={{
                id: r.id,
                status: r.status,
                type: r.type,
                name: r.name,
                email: r.email,
                phone: r.phone,
                message: r.message,
                legalTopic: r.legalTopic,
                contactPreference: r.contactPreference,
                createdAt: r.createdAt.toISOString(),
                property: r.property,
              }}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Paginación">
          {page > 1 && (
            <a
              href={`/admin/solicitudes?page=${page - 1}&status=${status}&type=${type}`}
              className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white"
            >
              ← Anterior
            </a>
          )}
          <span className="text-sm text-ink-500">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <a
              href={`/admin/solicitudes?page=${page + 1}&status=${status}&type=${type}`}
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