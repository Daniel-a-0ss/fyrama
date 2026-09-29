"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn, buildSrcSet } from "@/lib/utils";
import type { MediaImage } from "@/lib/services/property";

type Item = { image: MediaImage; alt: string };

export function PropertyGallery({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef<number | null>(null);

  const count = items.length;
  const current = items[Math.min(active, count - 1)];

  const openLightbox = (i: number) => {
    setActive(i);
    setLightbox(true);
  };

  const step = useCallback(
    (dir: 1 | -1) => {
      setActive((a) => (dir === 1 ? (a + 1) % count : (a - 1 + count) % count));
    },
    [count]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, step]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-gradient-to-br from-pine-800 to-pine-950 sm:aspect-[16/9]">
        <span className="font-display text-2xl text-bone-50/60">Fyrama</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="group relative overflow-hidden rounded-2xl bg-pine-950 cursor-zoom-in"
        role="group"
      >
        <img
          key={current.image.url}
          src={current.image.url}
          srcSet={buildSrcSet(current.image.variants)}
          sizes="(min-width: 1024px) 70vw, 100vw"
          alt={current.alt}
          onClick={() => openLightbox(active)}
          className="aspect-[16/10] w-full object-cover sm:aspect-[16/9]"
          fetchPriority="high"
          draggable={false}
          onTouchStart={(e) => (touchStart.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            if (touchStart.current === null) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current;
            if (Math.abs(dx) > 48) step(dx > 0 ? -1 : 1);
            touchStart.current = null;
          }}
        />
        <button
          type="button"
          onClick={() => openLightbox(active)}
          className="absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-pine-950/60 text-bone-50 backdrop-blur transition hover:bg-pine-950/80"
          aria-label="Ampliar imagen en pantalla completa"
        >
          <Expand className="size-4" aria-hidden />
        </button>
        {count > 1 && (
          <div className="absolute bottom-4 right-4 rounded-full bg-pine-950/70 px-3 py-1 text-xs font-medium text-bone-50 backdrop-blur">
            {active + 1} / {count}
          </div>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8">
          {items.map((item, i) => (
            <button
              key={item.image.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}: ${item.alt}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all",
                i === active
                  ? "border-gold-500 ring-2 ring-gold-500/30"
                  : "border-transparent opacity-75 hover:opacity-100"
              )}
            >
              <img
                src={item.image.thumbUrl ?? item.image.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imágenes"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-pine-950/95 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(false);
          }}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Cerrar visor"
          >
            <X className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(-1)}
            className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <figure className="max-h-[85vh] max-w-5xl">
            <img
              key={current.image.url + "lb"}
              src={current.image.url}
              alt={current.alt}
              className="max-h-[80vh] w-auto rounded-xl object-contain"
              draggable={false}
            />
            <figcaption className="mt-3 text-center text-sm text-bone-200">
              {current.alt} · {active + 1} / {count}
            </figcaption>
          </figure>
          <button
            type="button"
            onClick={() => step(1)}
            className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
          <span className="visually-hidden">Visor de imágenes de la propiedad</span>
        </div>
      )}
    </div>
  );
}