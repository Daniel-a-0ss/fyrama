"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FilterBar } from "@/components/search/FilterBar";
import { MobileFiltersButton } from "@/components/search/MobileFiltersButton";
import type { SearchParamsRecord } from "@/lib/search";

export function MobileFiltersSheet({
  cities,
  current,
  activeCount,
}: {
  cities: string[];
  current: SearchParamsRecord;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <MobileFiltersButton onOpen={() => setOpen(true)} activeCount={activeCount} />
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros de búsqueda">
          <div
            className="absolute inset-0 bg-pine-950/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="animate-fade-up absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-bone-50 p-4 pb-6 shadow-fyrama-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-900">
                Filtrar viviendas
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-full bg-white text-ink-600 shadow-sm"
                aria-label="Cerrar filtros"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <FilterBar cities={cities} initial={current} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-pine-950 text-sm font-medium text-bone-50"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </>
  );
}