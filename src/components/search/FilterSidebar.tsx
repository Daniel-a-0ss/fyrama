"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { FEATURE_PRESETS, PROPERTY_TYPES, STRATO_OPTIONS } from "@/lib/constants";
import { searchUrl, type SearchParamsRecord } from "@/lib/search";

type Props = {
  current: SearchParamsRecord;
  cities: string[];
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-t border-bone-200/80 px-5 py-4 first:border-t-0">
      <legend className="mb-2.5 text-sm font-semibold text-ink-900">{label}</legend>
      {children}
    </fieldset>
  );
}

export function FilterSidebar({ current, cities }: Props) {
  const router = useRouter();
  const [cityDraft, setCityDraft] = useState(current.ciudad ?? "");

  const setParam = (key: string, value: string) => {
    const next: SearchParamsRecord = { ...current };
    if (value) next[key] = value;
    else delete next[key];
    delete next.page;
    const url = searchUrl("/viviendas", next);
    router.replace(url);
  };

  const toggleParam = (key: string, value: string) => {
    const existing = (current[key] ?? "").split(",").filter(Boolean);
    const next = existing.includes(value)
      ? existing.filter((x) => x !== value)
      : [...existing, value];
    setParam(key, next.join(","));
  };

  const clear = () => router.replace("/viviendas");

  const setCity = () => {
    const value = cityDraft.trim();
    if (value !== (current.ciudad ?? "")) setParam("ciudad", value);
  };

  const select = (key: string, options: Array<{ value: string; label: string }>, placeholder: string) => (
    <select
      value={current[key] ?? ""}
      onChange={(e) => setParam(key, e.target.value)}
      className="w-full min-w-0 cursor-pointer rounded-xl border border-ink-900/12 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pine-600/25"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  const numOptions = (max: number, unit?: string) =>
    Array.from({ length: max }, (_, i) => i + 1).map((n) => ({
      value: String(n),
      label: `${n}+ ${unit ?? ""}`.trim(),
    }));

  return (
    <div className="rounded-2xl border border-bone-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink-900">Filtros</h2>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-pine-900"
        >
          <RotateCcw className="size-3.5" aria-hidden /> Limpiar
        </button>
      </div>

      <Field label="Operación">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { value: "", label: "Todas" },
            { value: "venta", label: "Venta" },
            { value: "arriendo", label: "Arrendamiento" },
          ].map((op) => {
            const value = op.value ? op.value.toUpperCase() : "";
            const active = (current.operacion?.toUpperCase() ?? "") === value;
            return (
              <button
                key={op.label}
                type="button"
                aria-pressed={active}
                onClick={() => setParam("operacion", value)}
                className={cn(
                  "min-w-0 rounded-lg border px-2 py-1.5 text-center text-sm font-medium transition-colors",
                  active
                    ? "border-pine-950 bg-pine-950 text-bone-50"
                    : "border-ink-900/12 text-ink-600 hover:border-ink-900/30"
                )}
              >
                {op.label}
              </button>
            );
          })}
          <Link
            href="/viviendas?operacion=permuta"
            className="min-w-0 rounded-lg border border-ink-900/12 px-2 py-1.5 text-center text-sm font-medium text-ink-600 transition-colors hover:border-ink-900/30 hover:bg-bone-100"
          >
            Permuta
          </Link>
        </div>
      </Field>

      <Field label="Ciudad">
        <div className="flex gap-1.5">
          <input
            value={cityDraft}
            onChange={(e) => setCityDraft(e.target.value)}
            onBlur={setCity}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), setCity())}
            list="fyrama-filter-cities"
            placeholder="Todas"
            className="min-w-0 flex-1 rounded-xl border border-ink-900/12 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pine-600/25"
          />
          <datalist id="fyrama-filter-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {current.ciudad && (
            <button
              type="button"
              onClick={() => {
                setCityDraft("");
                setParam("ciudad", "");
              }}
              className="rounded-lg border border-ink-900/12 px-2 text-ink-500 hover:text-red-600"
              aria-label="Quitar ciudad"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </Field>

      <Field label="Tipo de inmueble">
        <ul className="space-y-1">
          {PROPERTY_TYPES.map((t) => {
            const active = current.tipo === t.value;
            return (
              <li key={t.value}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setParam("tipo", active ? "" : t.value)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-600 hover:bg-bone-100"
                >
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded border",
                      active
                        ? "border-pine-950 bg-pine-950 text-bone-50"
                        : "border-ink-900/20 bg-white"
                    )}
                  >
                    {active && <Check className="size-3" aria-hidden />}
                  </span>
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </Field>

      <Field label="Precio">
        <div className="space-y-2">
          {select(
            "precio_min",
            PRICE_OPTIONS.map((o) => ({ value: String(o), label: `${formatCurrency(o)} en adelante` })),
            "Precio mínimo"
          )}
          {select(
            "precio_max",
            PRICE_OPTIONS.map((o) => ({ value: String(o), label: `hasta ${formatCurrency(o)}` })),
            "Precio máximo"
          )}
        </div>
      </Field>

      <Field label="Espacios">
        <div className="grid grid-cols-1 gap-2 min-[260px]:grid-cols-2">
          {select("habitaciones", numOptions(5), "Habitaciones")}
          {select("banos", numOptions(4), "Baños")}
          {select("parqueaderos", numOptions(4), "Parqueaderos")}
          {select(
            "estrato",
            STRATO_OPTIONS.map((n) => ({ value: String(n), label: `Estrato ${n}` })),
            "Estrato"
          )}
        </div>
      </Field>

      <Field label="Área">
        <div className="grid grid-cols-1 gap-2 min-[260px]:grid-cols-2">
          {select("area_min", AREA_MIN.map((n) => ({ value: String(n), label: `${n} m² en adelante` })), "Área mínima")}
          {select("area_max", AREA_MAX.map((n) => ({ value: String(n), label: `hasta ${n} m²` })), "Área máxima")}
        </div>
      </Field>

      <Field label="Características">
        <div className="flex flex-wrap gap-1.5">
          {FEATURE_PRESETS.map((f) => {
            const active = (current.caracteristicas ?? "").split(",").includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => toggleParam("caracteristicas", f)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-pine-950 bg-pine-950 text-bone-50"
                    : "border-ink-900/15 text-ink-600 hover:border-ink-900/35"
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

// Opciones de precio (COP)
const PRICE_OPTIONS = [100_000_000, 200_000_000, 350_000_000, 500_000_000, 800_000_000, 1_200_000_000];
const AREA_MIN = [40, 60, 80, 120, 160];
const AREA_MAX = [80, 120, 160, 220, 300];