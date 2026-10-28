"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUp, Loader2, Search } from "lucide-react";
import { api, errorMessage } from "@/lib/client/api";

type MediaItem = {
  id: string;
  originalName: string;
  url: string;
  thumbUrl: string | null;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  kind: string;
  createdAt: string;
  _count?: { propertyImages: number; articleCover: number };
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaGallery() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [kind, setKind] = useState("ALL");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ items: MediaItem[]; total: number; page: number; totalPages: number }>(
        `/api/admin/media?page=${page}&limit=24&kind=${kind}&q=${encodeURIComponent(query)}`
      );
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, kind, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          alert(`"${file.name}" no es una imagen.`);
          continue;
        }
        const form = new FormData();
        form.append("file", file);
        form.append("kind", kind === "ALL" ? "GENERAL" : kind);
        await api<{ id: string }>("/api/admin/media", { method: "POST", body: form });
      }
      setPage(1);
      await load();
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function remove(item: MediaItem) {
    const usage = (item._count?.propertyImages ?? 0) + (item._count?.articleCover ?? 0);
    if (usage > 0) {
      alert("Esta imagen está en uso y no se puede eliminar.");
      return;
    }
    if (!confirm(`¿Eliminar "${item.originalName}"?`)) return;
    try {
      await api(`/api/admin/media/${item.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  const pending = uploading;

  return (
    <div>
      <form
        className="mb-4 flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(q);
        }}
      >
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-xl border border-ink-900/12 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-pine-700 focus:ring-2 focus:ring-pine-700/20"
          />
        </div>
        <select
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-ink-900/12 bg-white px-3 py-2.5 text-sm text-ink-700 outline-none focus:border-pine-700"
        >
          <option value="ALL">Todas las imágenes</option>
          <option value="PROPERTY">Inmuebles</option>
          <option value="ARTICLE">Artículos</option>
          <option value="PAGE">Páginas/Generales</option>
        </select>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-60"
        >
          <ImageUp className="size-4" aria-hidden />
          {pending ? "Subiendo…" : "Subir imágenes"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </form>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        className={`rounded-3xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-pine-700 bg-pine-900/5" : "border-bone-300 bg-white"
        }`}
      >
        <p className="text-sm text-ink-500">
          Arrastra imágenes aquí o usa el botón de arriba.
          <br />
          <span className="text-xs text-ink-400">
            JPG, PNG, WebP, AVIF, GIF, SVG hasta ~10 MB. Se generan variantes WebP/AVIF automáticamente.
          </span>
        </p>
      </div>

      {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {uploading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-pine-800">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Procesando y optimizando imágenes…
        </p>
      )}

      <p className="mt-6 text-sm text-ink-500">{total} imágenes en total.</p>

      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-bone-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-bone-300 bg-white py-14 text-center text-ink-500">
          No hay imágenes que coincidan.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-bone-200 bg-white shadow-sm"
            >
              <div className="aspect-square overflow-hidden bg-bone-100">
                {item.mime === "image/svg+xml" ? (
                  <img src={item.url} alt={item.alt ?? item.originalName} className="h-full w-full object-contain p-4" />
                ) : (
                  <img
                    src={item.thumbUrl ?? item.url}
                    alt={item.alt ?? item.originalName}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-ink-800" title={item.originalName}>
                  {item.originalName}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-400">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ""} {humanSize(item.size)}
                  {(item._count?.propertyImages ?? 0) + (item._count?.articleCover ?? 0) > 0 && (
                    <span className="font-medium text-pine-800"> · en uso</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(item)}
                className="absolute right-2 top-2 hidden rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-white group-hover:block"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Paginación">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="text-sm text-ink-500">Página {page} de {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-sm hover:bg-white disabled:opacity-50"
          >
            Siguiente →
          </button>
        </nav>
      )}
    </div>
  );
}