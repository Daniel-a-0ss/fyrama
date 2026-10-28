"use client";

import { useState } from "react";
import { Check, Star, X } from "lucide-react";
import { api, errorMessage } from "@/lib/client/api";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { initialsOf } from "@/lib/reviews";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Publicada",
  REJECTED: "Rechazada",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gold-100 text-gold-700",
  APPROVED: "bg-pine-100 text-pine-800",
  REJECTED: "bg-bone-200 text-ink-600",
};

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < value ? "fill-gold-500 text-gold-500" : "fill-transparent text-gold-500/40"
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function ReviewRow({
  review: initial,
}: {
  review: {
    id: string;
    name: string;
    rating: number;
    title: string | null;
    content: string;
    status: string;
    createdAt: string;
  };
}) {
  const [review, setReview] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function setStatus(status: string) {
    setBusy(true);
    try {
      const data = await api<{ id: string; status: string }>(
        `/api/admin/reviews/${review.id}`,
        { method: "PATCH", body: JSON.stringify({ status }) }
      );
      setReview((r) => ({ ...r, status: data.status }));
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-2xl border border-bone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pine-100 font-display text-sm font-semibold text-pine-800">
            {initialsOf(review.name)}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-ink-900">{review.name}</p>
            <p className="text-sm text-ink-500">
              {new Date(review.createdAt).toLocaleString("es-CO")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              STATUS_STYLES[review.status] ?? "bg-bone-200 text-ink-600"
            )}
          >
            {STATUS_LABELS[review.status] ?? review.status}
          </span>
          <button
            type="button"
            onClick={() => setStatus("APPROVED")}
            disabled={busy || review.status === "APPROVED"}
            className="inline-flex items-center gap-1.5 rounded-lg bg-pine-900 px-3 py-1.5 text-sm font-medium text-bone-50 transition-colors hover:bg-pine-800 disabled:opacity-40"
          >
            <Check className="size-4" aria-hidden /> Publicar
          </button>
          <button
            type="button"
            onClick={() => setStatus("REJECTED")}
            disabled={busy || review.status === "REJECTED"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:border-ink-900/30 disabled:opacity-40"
          >
            <X className="size-4" aria-hidden /> Rechazar
          </button>
          <DeleteButton
            url={`/api/admin/reviews/${review.id}`}
            confirmText={`¿Eliminar la opinión de ${review.name}?`}
            label={`Eliminar opinión de ${review.name}`}
            onDeleted={() => window.location.reload()}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Rating value={review.rating} />
        {review.title && (
          <span className="text-xs text-ink-500">· {review.title}</span>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap rounded-xl bg-bone-50 px-4 py-3 text-sm text-ink-700">
        “{review.content}”
      </p>
    </article>
  );
}
