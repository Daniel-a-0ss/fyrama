import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardList,
  FileText,
  Images,
  Inbox,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard · Fyrama",
};

export default async function AdminDashboardPage() {
  const [
    propertyCounts,
    requestCounts,
    articleCounts,
    mediaCount,
    adminCount,
    editorCount,
    serviceCount,
    recentAudit,
  ] = await Promise.all([
    Promise.all([
      prisma.property.count({ where: { deletedAt: null } }),
      prisma.property.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      prisma.property.count({ where: { featured: true, deletedAt: null } }),
      prisma.property.count({ where: { status: "DRAFT", deletedAt: null } }),
    ]),
    Promise.all([
      prisma.contactRequest.count({ where: { status: "NEW" } }),
      prisma.contactRequest.count({ where: { status: "CONTACTED" } }),
      prisma.contactRequest.count(),
    ]),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.mediaAsset.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: "ADMIN", active: true } }),
    prisma.user.count({ where: { role: "EDITOR", active: true } }),
    prisma.legalService.count({ where: { active: true } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const [totalProps, published, featured, drafts] = propertyCounts;
  const [newRequests, contacted, totalRequests] = requestCounts;

  const cards = [
    { label: "Viviendas publicadas", value: published, href: "/admin/viviendas?status=PUBLISHED", icon: ClipboardList, accent: "bg-pine-50 text-pine-800" },
    { label: "Borradores", value: drafts, href: "/admin/viviendas?status=DRAFT", icon: ClipboardList, accent: "bg-bone-100 text-ink-600" },
    { label: "Solicitudes nuevas", value: newRequests, href: "/admin/solicitudes?status=NEW", icon: Inbox, accent: "bg-gold-100 text-gold-700" },
    { label: "Artículos publicados", value: articleCounts, href: "/admin/contenido?status=PUBLISHED", icon: FileText, accent: "bg-bone-100 text-ink-600" },
    { label: "Imágenes en biblioteca", value: mediaCount, href: "/admin/media", icon: Images, accent: "bg-pine-50 text-pine-800" },
    { label: "Servicios de asesoría", value: serviceCount, href: "/admin/asesoria", icon: Scale, accent: "bg-gold-100 text-gold-700" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">
            Panel principal
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Resumen de la plataforma. (Contenido de demostración generado por el seed.)
          </p>
        </div>
        <Link href="/viviendas" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800">
          Ver sitio público <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group flex items-start justify-between rounded-2xl border border-bone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-fyrama"
          >
            <div>
              <p className="font-display text-3xl font-semibold text-ink-900">{c.value}</p>
              <p className="mt-1 text-sm text-ink-500">{c.label}</p>
            </div>
            <span className={`flex size-10 items-center justify-center rounded-xl ${c.accent}`}>
              <c.icon className="size-5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink-900">Solicitudes</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-xl bg-gold-200/40 p-3">
              <dt className="text-xs text-ink-500">Nuevas</dt>
              <dd className="font-display text-2xl font-semibold text-gold-700">{newRequests}</dd>
            </div>
            <div className="rounded-xl bg-bone-100 p-3">
              <dt className="text-xs text-ink-500">En contacto</dt>
              <dd className="font-display text-2xl font-semibold text-ink-800">{contacted}</dd>
            </div>
            <div className="rounded-xl bg-pine-50 p-3">
              <dt className="text-xs text-ink-500">Totales</dt>
              <dd className="font-display text-2xl font-semibold text-pine-800">{totalRequests}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink-900">Equipo</h2>
          <p className="mt-2 text-sm text-ink-500">
            {adminCount} administrador{adminCount === 1 ? "" : "es"} y {editorCount} editor
            {editorCount === 1 ? "" : "es"} activos.
          </p>
          <div className="mt-4">
            <p className="text-sm font-medium text-ink-700 mb-2">Destacadas: {featured} · Totales: {totalProps}</p>
            <div className="h-2 overflow-hidden rounded-full bg-bone-100">
              <div
                className="h-full rounded-full bg-gold-500"
                style={{ width: `${totalProps ? Math.round((published / totalProps) * 100) : 0}%` }}
              />
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-ink-900">Última actividad</h2>
          <Link href="/admin/auditoria" className="text-sm font-medium text-pine-800 hover:underline">
            Ver auditoría completa
          </Link>
        </div>
        {recentAudit.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">Aún no hay actividad registrada.</p>
        ) : (
          <ul className="mt-4 divide-y divide-bone-100">
            {recentAudit.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800">
                    {entry.user ? entry.user.name : "Sistema"}
                  </p>
                  <p className="truncate text-xs text-ink-500">{entry.action}</p>
                </div>
                <time className="shrink-0 text-xs text-ink-400">
                  {new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(entry.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}