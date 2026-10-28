"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FilterBar } from "@/components/search/FilterBar";
import { MobileFiltersButton } from "@/components/search/MobileFiltersButton";
import type { SearchParamsRecord } from "@/lib/search";

const FORM_ID = "fyrama-mobile-filters";

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
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros de búsqueda"
        >
          <div
            className="absolute inset-0 bg-pine-950/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="animate-fade-up absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto overscroll-contain rounded-t-3xl bg-bone-50 p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-fyrama-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-900">
                Filtrar inmuebles
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-full bg-white text-ink-600 shadow-sm transition-colors hover:bg-bone-100"
                aria-label="Cerrar filtros"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div onSubmitCapture={() => setOpen(false)}>
              <FilterBar cities={cities} initial={current} formId={FORM_ID} />
            </div>
            <button
              type="submit"
              form={FORM_ID}
              className="mt-3 inline-flex h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-pine-950 px-4 text-center text-sm font-semibold text-bone-50 transition-colors hover:bg-pine-800 active:scale-[0.99]"
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </>
  );
}
