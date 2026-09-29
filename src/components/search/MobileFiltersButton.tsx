"use client";

import { SlidersHorizontal } from "lucide-react";

export function MobileFiltersButton({
  onOpen,
  activeCount,
}: {
  onOpen: () => void;
  activeCount: number;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink-900/12 bg-white px-4 text-sm font-medium text-ink-800 shadow-sm"
      aria-haspopup="dialog"
    >
      <SlidersHorizontal className="size-4" aria-hidden />
      Filtros
      {activeCount > 0 && (
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-pine-950 text-[11px] font-semibold text-bone-50">
          {activeCount}
        </span>
      )}
    </button>
  );
}