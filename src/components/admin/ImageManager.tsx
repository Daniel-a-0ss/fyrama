"use client";

import { useState } from "react";
import { Crown, Images, Link as LinkIcon, Star, Trash2 } from "lucide-react";
import { api, errorMessage } from "@/lib/client/api";
import { MediaPicker } from "@/components/admin/MediaPicker";

type PropertyImageRemote = {
  id: string;
  alt: string | null;
  isCover: boolean;
  sortOrder: number;
  mediaAsset: {
    id: string;
    url: string;
    thumbUrl: string | null;
    alt: string | null;
    originalName: string;
  };
};

type Props = {
  propertyId: string;
  initialImages: PropertyImageRemote[];
};

/** Gestor visual de fotos de un inmueble: adjuntar, reordenar, portada, quitar. */
export function ImageManager({ propertyId, initialImages }: Props) {
  const [images, setImages] = useState<PropertyImageRemote[]>(
    [...initialImages].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function attach(mediaIds: string[]) {
    if (mediaIds.length === 0) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/admin/properties/${propertyId}/images`, {
        method: "POST",
        body: JSON.stringify({ mediaAssetIds: mediaIds }),
      });
      const refreshed = await api<{ property: { images: PropertyImageRemote[] } }>(
        `/api/admin/properties/${propertyId}`
      );
      setImages(refreshed.property.images.sort((a, b) => a.sortOrder - b.sortOrder));
      setPickerOpen(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function persist(next: PropertyImageRemote[], coverId?: string) {
    const order = next.map((i) => i.id);
    try {
      await api(`/api/admin/properties/${propertyId}/images`, {
        method: "PUT",
        body: JSON.stringify({ order, coverId: coverId ?? next.find((i) => i.isCover)?.id }),
      });
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    }
  }

  async function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    const ordered = next.map((img, idx) => ({ ...img, sortOrder: idx }));
    setImages(ordered);
    try {
      await persist(ordered);
    } catch {
      setImages(images);
    }
  }

  async function setCover(id: string) {
    const next = images.map((img) => ({ ...img, isCover: img.id === id }));
    setImages(next);
    try {
      await persist(next, id);
    } catch {
      setImages(images);
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Quitar esta foto del inmueble? (El archivo se conserva en la biblioteca.)")) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/admin/properties/${propertyId}/images`, {
        method: "DELETE",
        body: JSON.stringify({ imageId: id }),
      });
      const refreshed = await api<{ property: { images: PropertyImageRemote[] } }>(
        `/api/admin/properties/${propertyId}`
      );
      setImages(refreshed.property.images.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">Fotografías</h2>
          <p className="mt-1 text-sm text-ink-500">
            La primera con corona es la portada. Usa las flechas para reordenar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={busy}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-50"
        >
          <Images className="size-4" aria-hidden /> Adjuntar de la biblioteca
        </button>
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-bone-300 py-10 text-ink-400">
          <LinkIcon className="size-7" aria-hidden />
          <p className="text-sm">Este inmueble aún no tiene fotografías.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, idx) => (
            <li
              key={img.id}
              className={`relative overflow-hidden rounded-xl border ${
                img.isCover ? "border-gold-500 ring-2 ring-gold-500/30" : "border-bone-200"
              }`}
            >
              <img
                src={img.mediaAsset.thumbUrl ?? img.mediaAsset.url}
                alt={img.alt ?? img.mediaAsset.alt ?? "Fotografía del inmueble"}
                className="aspect-square w-full bg-bone-100 object-cover"
              />
              {img.isCover && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Crown className="size-3" aria-hidden /> Portada
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 py-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0 || busy}
                    aria-label="Mover antes"
                    className="flex size-7 items-center justify-center rounded-md bg-white/90 text-ink-800 hover:bg-white disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === images.length - 1 || busy}
                    aria-label="Mover después"
                    className="flex size-7 items-center justify-center rounded-md bg-white/90 text-ink-800 hover:bg-white disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
                <div className="flex gap-1">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => setCover(img.id)}
                      disabled={busy}
                      aria-label="Marcar como portada"
                      title="Marcar como portada"
                      className="flex size-7 items-center justify-center rounded-md bg-white/90 text-gold-600 hover:bg-white"
                    >
                      <Star className="size-4" aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    disabled={busy}
                    aria-label="Quitar foto"
                    title="Quitar foto"
                    className="flex size-7 items-center justify-center rounded-md bg-white/90 text-red-600 hover:bg-white"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={attach}
        kindFilter="PROPERTY"
      />
    </section>
  );
}