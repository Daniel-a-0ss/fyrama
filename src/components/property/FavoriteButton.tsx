"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "fyrama:favorites";
const EVENT = "fyrama:favorites:change";

export function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function FavoriteButton({
  slug,
  title,
  className,
}: {
  slug: string;
  title: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(readFavorites().includes(slug));
    const onChange = () => setActive(readFavorites().includes(slug));
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [slug]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = readFavorites();
    const next = active
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setActive(!active);
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? `Quitar ${title} de favoritos` : `Guardar ${title} en favoritos`}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95",
        className
      )}
    >
      <Heart
        className={cn(
          "size-4.5 transition-colors",
          active ? "fill-gold-500 text-gold-500" : "text-ink-500"
        )}
        aria-hidden
      />
    </button>
  );
}