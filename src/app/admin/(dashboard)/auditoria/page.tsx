import { redirect } from "next/navigation";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";

export const metadata = { title: "Auditoría · Fyrama" };

const ACTION_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Inicio de sesión",
  LOGIN_FAILED: "Intento fallido de login",
  LOGOUT: "Cierre de sesión",
  CREATE_PROPERTY: "Vivienda creada",
  UPDATE_PROPERTY: "Vivienda actualizada",
  UPDATE_PROPERTY_STATUS: "Estado de vivienda",
  DELETE_PROPERTY: "Vivienda eliminada",
  ADD_PROPERTY_IMAGES: "Imágenes agregadas",
  REORDER_PROPERTY_IMAGES: "Imágenes reordenadas",
  DELETE_PROPERTY_IMAGE: "Imagen desvinculada",
  CREATE_ARTICLE: "Artículo creado",
  UPDATE_ARTICLE: "Artículo actualizado",
  DELETE_ARTICLE: "Artículo eliminado",
  CREATE_LEGAL_SERVICE: "Servicio creado",
  UPDATE_LEGAL_SERVICE: "Servicio actualizado",
  DELETE_LEGAL_SERVICE: "Servicio eliminado",
  UPLOAD_MEDIA: "Imagen subida",
  DELETE_MEDIA: "Imagen eliminada",
  UPDATE_CONTACT_STATUS: "Estado de solicitud",
  DELETE_CONTACT_REQUEST: "Solicitud eliminada",
  CREATE_USER: "Usuario creado",
  UPDATE_USER: "Usuario actualizado",
  USER_PERMISSION_CHANGE: "Permisos cambiados",
  DELETE_USER: "Usuario eliminado",
  SETTINGS_UPDATED: "Ajustes actualizados",
  CHANGE_PASSWORD: "Contraseña cambiada",
};

export default async function AdminAuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const rawAction = params.action;
  const limit = 30;

  const session = await getSessionFromCookies();
  if (session?.user.role !== "ADMIN") redirect("/admin");

  const allowed =
    rawAction && (Object.values(AuditAction) as string[]).includes(rawAction);
  const where = allowed ? { action: rawAction as AuditAction } : undefined;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function prettyDetails(raw: unknown): string[] {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!parsed || typeof parsed !== "object") return [String(raw ?? "")];
      return Object.entries(parsed as Record<string, unknown>)
        .filter(([k]) => !k.toLowerCase().includes("pass"))
        .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
        .slice(0, 5);
    } catch {
      return [];
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Registro de auditoría</h1>
        <p className="mt-1 text-sm text-ink-500">{total} eventos registrados.</p>
      </div>

      <form method="get" action="/admin/auditoria" className="mb-4 flex max-w-md gap-2">
        <select
          name="action"
          defaultValue={allowed ? rawAction : ""}
          className="flex-1 rounded-xl border border-ink-900/12 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-pine-700"
        >
          <option value="">Todas las acciones</option>
          {Object.values(AuditAction).map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a] ?? a}</option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800">
          Filtrar
        </button>
      </form>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bone-300 bg-white py-14 text-center text-ink-500">
          No hay eventos con ese filtro.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-bone-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-bone-200 bg-bone-50 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="hidden px-4 py-3 md:table-cell">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-100">
              {logs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-bone-50/60">
                  <td className="px-4 py-3 text-xs text-ink-600 sm:text-sm">
                    {log.createdAt.toLocaleString("es-CO")}
                    <span className="block text-xs text-ink-400">{log.ipAddress || ""}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink-800">{ACTION_LABELS[log.action] ?? log.action}</span>
                    {log.entityType && (
                      <span className="block text-xs text-ink-400">{log.entityType} · {log.entityId}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{log.user?.name ?? "—"}</td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {prettyDetails(log.details).length === 0 ? (
                      <span className="text-ink-400">—</span>
                    ) : (
                      <ul className="space-y-0.5 text-xs text-ink-600">
                        {prettyDetails(log.details).map((d, i) => (
                          <li key={i} className="truncate" title={d}>{d}</li>
                        ))}
                      </ul>
                    )}
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
            <a
              href={`/admin/auditoria?page=${page - 1}${allowed ? `&action=${rawAction}` : ""}`}
              className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white"
            >
              ← Anterior
            </a>
          )}
          <span className="text-sm text-ink-500">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <a
              href={`/admin/auditoria?page=${page + 1}${allowed ? `&action=${rawAction}` : ""}`}
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