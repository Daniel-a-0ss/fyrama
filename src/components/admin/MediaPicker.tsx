"use client";

import { useEffect, useState } from "react";
import { Check, Images, Loader2, Plus } from "lucide-react";
import { api, errorMessage } from "@/lib/client/api";
import { Modal } from "@/components/ui/Modal";

type MediaItem = {
  id: string;
  url: string;
  thumbUrl: string | null;
  originalName: string;
  kind: string;
  alt: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (ids: string[]) => void;
  /** ids ya seleccionadas (para marcarlas) */
  selected?: string[];
  single?: boolean;
  kindFilter?: string;
  triggerLabel?: string;
};

/** Selector visual de la biblioteca de medios. */
export function MediaPicker({
  open,
  onClose,
  onSelect,
  selected = [],
  single = false,
  kindFilter,
  triggerLabel = "Seleccionar imágenes",
}: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set(selected));

  useEffect(() => {
    if (!open) return;
    setChecked(new Set(selected));
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function load(target: number) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(target), limit: "24" });
      if (kindFilter) params.set("kind", kindFilter);
      const res = await api<{ items: MediaItem[]; total: number }>(
        `/api/admin/media?${params.toString()}`
      );
      setItems(res.items);
      setTotal(res.total);
      setPage(target);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (single) return new Set([id]);
        next.add(id);
      }
      return next;
    });
  }

  function confirm() {
    onSelect([...checked]);
  }

  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Modal open={open} onClose={onClose} title="Biblioteca de imágenes" size="lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {checked.size} seleccionada{checked.size === 1 ? "" : "s"}
          {single ? " (elige una)" : ""}
        </p>
        <div className="flex gap-2">
          <a
            href="/admin/media"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-900/10 px-3 text-sm font-medium text-ink-700 hover:bg-bone-100"
          >
            <Plus className="size-4" aria-hidden /> Subir nuevas
          </a>
          <button
            type="button"
            onClick={confirm}
            disabled={checked.size === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-50"
          >
            <Check className="size-4" aria-hidden />
            {triggerLabel}
          </button>
        </div>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading && items.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-pine-700" aria-hidden />
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-ink-400">
          <Images className="size-8" aria-hidden />
          <p className="text-sm">No hay imágenes. Sube algunas desde la biblioteca.</p>
        </div>
      ) : (
        <div className="mt-4 grid max-h-[50vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {items.map((img) => {
            const isChecked = checked.has(img.id);
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => toggle(img.id)}
                aria-pressed={isChecked}
                className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${
                  isChecked ? "border-gold-500" : "border-transparent hover:border-pine-300"
                }`}
              >
                <img
                  src={img.thumbUrl ?? img.url}
                  alt={img.alt ?? img.originalName}
                  className="h-full w-full object-cover"
                />
                {isChecked && (
                  <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-gold-500 text-white">
                    <Check className="size-4" aria-hidden />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => load(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="font-medium text-pine-800 hover:underline disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="text-ink-500">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => load(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="font-medium text-pine-800 hover:underline disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </Modal>
  );
}