"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/client/api";
import { DeleteButton } from "@/components/admin/DeleteButton";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  COMPLETED: "Completado",
  ARCHIVED: "Archivado",
};

export function RequestRow({
  request: initial,
}: {
  request: {
    id: string;
    status: string;
    type: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    legalTopic: string | null;
    contactPreference: string | null;
    createdAt: string;
    property?: { id: string; title: string; slug: string } | null;
  };
}) {
  const [request, setRequest] = useState(initial);

  async function setStatus(status: string) {
    try {
      const data = await api<{ id: string; status: string }>(`/api/admin/requests/${request.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setRequest((r) => ({ ...r, status: data.status }));
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  const TYPE_LABELS: Record<string, string> = {
    PROPERTY: "Inmueble",
    GENERAL: "General",
    LEGAL: "Asesoría jurídica",
  };

  return (
    <div className="rounded-2xl border border-bone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink-900">{request.name}</p>
          <p className="text-sm text-ink-500">
            {TYPE_LABELS[request.type] ?? request.type} · {new Date(request.createdAt).toLocaleString("es-CO")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={request.status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-ink-900/12 bg-white px-2.5 py-1.5 text-sm text-ink-700 outline-none focus:border-pine-700"
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <DeleteButton
            url={`/api/admin/requests/${request.id}`}
            confirmText={`¿Eliminar la solicitud de ${request.name}?`}
            label={`Eliminar solicitud de ${request.name}`}
            onDeleted={() => {
              // Forzar recarga del listado en la página server.
              window.location.reload();
            }}
          />
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="flex gap-1.5">
          <dt className="shrink-0 text-ink-400">Email:</dt>
          <dd className="min-w-0 truncate">
            <a href={`mailto:${request.email}`} className="text-pine-800 hover:underline">{request.email}</a>
          </dd>
        </div>
        {request.phone && (
          <div className="flex gap-1.5">
            <dt className="shrink-0 text-ink-400">Teléfono:</dt>
            <dd>{request.phone}</dd>
          </div>
        )}
        {request.legalTopic && (
          <div className="flex gap-1.5">
            <dt className="shrink-0 text-ink-400">Tema:</dt>
            <dd>{request.legalTopic}</dd>
          </div>
        )}
        {request.contactPreference && (
          <div className="flex gap-1.5">
            <dt className="shrink-0 text-ink-400">Preferencia:</dt>
            <dd>{request.contactPreference}</dd>
          </div>
        )}
        {request.property && (
          <div className="flex gap-1.5">
            <dt className="shrink-0 text-ink-400">Inmueble:</dt>
            <dd className="truncate" title={request.property.title}>
              <a href={`/viviendas/${request.property.slug}`} className="text-pine-800 hover:underline" target="_blank" rel="noopener noreferrer">
                {request.property.title}
              </a>
            </dd>
          </div>
        )}
      </dl>

      {request.message && (
        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-bone-50 px-4 py-3 text-sm text-ink-700">
          {request.message}
        </p>
      )}
    </div>
  );
}