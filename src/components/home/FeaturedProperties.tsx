"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { PropertyCardView } from "@/lib/services/property";
import { PropertyCard } from "@/components/property/PropertyCard";
import { LinkButton } from "@/components/ui/Button";
import { searchUrl } from "@/lib/search";

const TABS = [
  { value: "VENTA", label: "Venta" },
  { value: "ARRIENDO", label: "Arrendamiento" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function FeaturedProperties({ properties }: { properties: PropertyCardView[] }) {
  const [tab, setTab] = useState<TabValue>("VENTA");

  const visible = useMemo(
    () => properties.filter((p) => p.operation === tab).slice(0, 4),
    [properties, tab]
  );

  return (
    <section className="bg-bone-50 py-14 sm:py-16" aria-labelledby="destacadas-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
              Selección Fyrama
            </p>
            <h2
              id="destacadas-title"
              className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
            >
              Propiedades destacadas
            </h2>
          </div>

          <div className="inline-flex rounded-full bg-pine-950/5 p-1" role="tablist" aria-label="Operación">
            {TABS.map((t) => (
              <button
                key={t.value}
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
                className={
                  tab === t.value
                    ? "rounded-full bg-pine-950 px-5 py-2 text-sm font-medium text-bone-50 shadow-sm"
                    : "rounded-full px-5 py-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-bone-300 bg-bone-100 p-8 text-center text-ink-500">
            Próximamente publicaremos más propiedades en {tab === "VENTA" ? "venta" : "arrendamiento"}.
          </p>
        )}

        <div className="mt-10 text-center">
          <LinkButton
            href={searchUrl("/viviendas", { operacion: tab })}
            variant="outline"
            size="lg"
          >
            Ver todas las propiedades
            <ArrowRight className="size-4" aria-hidden />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}