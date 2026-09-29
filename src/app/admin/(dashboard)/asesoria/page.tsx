import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const metadata = { title: "Asesoría jurídica · Fyrama" };

export default async function AdminAsesoriaPage() {
  const services = await prisma.legalService.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Asesoría jurídica</h1>
          <p className="mt-1 text-sm text-ink-500">Servicios que se muestran en /asesoria-juridica.</p>
        </div>
        <Link
          href="/admin/asesoria/nueva"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800"
        >
          <Plus className="size-4" aria-hidden /> Nuevo servicio
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone-300 bg-white py-14 text-center text-ink-500">
          Aún no hay servicios de asesoría.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-bone-200 bg-white shadow-sm">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-bone-200 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Servicio</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Visible</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-bone-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{s.title}</p>
                    <p className="truncate text-xs text-ink-400">{s.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{s.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={s.active ? "text-pine-800" : "text-ink-400"}>
                      {s.active ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/asesoria/${s.id}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-bone-100"
                        aria-label={`Editar ${s.title}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      <DeleteButton
                        url={`/api/admin/legal-services/${s.id}`}
                        confirmText={`¿Eliminar el servicio "${s.title}"?`}
                        label={`Eliminar ${s.title}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}