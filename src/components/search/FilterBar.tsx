"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  MapPin,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FEATURE_PRESETS,
  OPERATIONS,
  PROPERTY_TYPES,
  STRATO_OPTIONS,
} from "@/lib/constants";
import { searchUrl, type SearchParamsRecord } from "@/lib/search";
import { formatCurrency } from "@/lib/utils";

type Props = {
  cities: string[];
  initial?: SearchParamsRecord;
};

const PRICE_OPTIONS: Record<"VENTA" | "ARRIENDO", Array<{ value: string; label: string }>> = {
  VENTA: [0, 100_000_000, 200_000_000, 300_000_000, 500_000_000, 800_000_000, 1_200_000_000, 2_000_000_000].map(
    (p) => ({ value: String(p), label: p ? formatCurrency(p) : "Cualquier precio" })
  ),
  ARRIENDO: [0, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000].map((p) => ({
    value: String(p),
    label: p ? formatCurrency(p) : "Cualquier precio",
  })),
};

const clean = (v: string) => v.trim();

export function FilterBar({ cities, initial }: Props) {
  const router = useRouter();
  const [operation, setOperation] = useState<"VENTA" | "ARRIENDO">(
    (initial?.operacion as "VENTA" | "ARRIENDO") ?? "VENTA"
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [ciudad, setCiudad] = useState(initial?.ciudad ?? "");
  const [zona, setZona] = useState(initial?.zona ?? "");
  const [barrio, setBarrio] = useState(initial?.barrio ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "");
  const [precioMin, setPrecioMin] = useState(initial?.precio_min ?? "");
  const [precioMax, setPrecioMax] = useState(initial?.precio_max ?? "");
  const [habitaciones, setHabitaciones] = useState(initial?.habitaciones ?? "");
  const [banos, setBanos] = useState(initial?.banos ?? "");
  const [areaMin, setAreaMin] = useState(initial?.area_min ?? "");
  const [areaMax, setAreaMax] = useState(initial?.area_max ?? "");
  const [parqueaderos, setParqueaderos] = useState(initial?.parqueaderos ?? "");
  const [estrato, setEstrato] = useState(initial?.estrato ?? "");
  const [features, setFeatures] = useState<string[]>(
    (initial?.caracteristicas ?? "").split(",").filter(Boolean)
  );

  const priceOptions = useMemo(() => PRICE_OPTIONS[operation], [operation]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: SearchParamsRecord = { operacion: operation };
    const set = (k: string, v: string) => {
      const c = clean(v);
      if (c) params[k] = c;
    };
    set("ciudad", ciudad);
    set("zona", zona);
    set("barrio", barrio);
    set("tipo", tipo);
    set("precio_min", precioMin);
    set("precio_max", precioMax);
    set("habitaciones", habitaciones);
    set("banos", banos);
    set("area_min", areaMin);
    set("area_max", areaMax);
    set("parqueaderos", parqueaderos);
    set("estrato", estrato);
    if (features.length > 0) params.caracteristicas = features.join(",");
    router.push(searchUrl("/viviendas", params));
  };

  const reset = () => {
    setCiudad("");
    setZona("");
    setBarrio("");
    setTipo("");
    setPrecioMin("");
    setPrecioMax("");
    setHabitaciones("");
    setBanos("");
    setAreaMin("");
    setAreaMax("");
    setParqueaderos("");
    setEstrato("");
    setFeatures([]);
  };

  const toggleFeature = (name: string) =>
    setFeatures((f) =>
      f.includes(name) ? f.filter((x) => x !== name) : [...f, name]
    );

  const inputClass =
    "w-full rounded-xl border border-ink-900/10 bg-white px-3.5 py-2.5 text-base text-ink-900 shadow-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-pine-600/25 focus:border-pine-700";
  const selectClass = `cursor-pointer pr-9 ${inputClass}`;

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-bone-200/70 bg-white/95 p-4 shadow-fyrama-lg backdrop-blur-sm sm:p-5"
      aria-label="Buscador de viviendas"
    >
      {/* Encabezado del buscador */}
      <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-500">
        Busca tu propiedad
      </p>

      {/* Tabs Comprar / Arrendar */}
      <div
        className="mb-4 inline-flex w-full justify-center rounded-full bg-bone-100 p-1 sm:w-auto"
        role="radiogroup"
        aria-label="Operación"
      >
        {OPERATIONS.map((op) => (
          <button
            key={op.value}
            type="button"
            role="radio"
            aria-checked={operation === op.value}
            onClick={() => setOperation(op.value)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all",
              operation === op.value
                ? "bg-pine-950 text-bone-50 shadow-sm"
                : "text-ink-600 hover:text-ink-900"
            )}
          >
            {op.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="lg:col-span-2">
          <label htmlFor="f-ciudad" className="sr-only">
            Ciudad
          </label>
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <input
              id="f-ciudad"
              list="fyrama-cities"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ciudad o municipio"
              className={cn(inputClass, "pl-10")}
              autoComplete="off"
            />
            <datalist id="fyrama-cities">
              {cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        <label htmlFor="f-tipo">
          <span className="sr-only">Tipo de inmueble</span>
          <select
            id="f-tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={selectClass}
          >
            <option value="">Tipo de inmueble</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="f-precio-min">
          <span className="sr-only">Precio mínimo</span>
          <select
            id="f-precio-min"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className={selectClass}
          >
            {priceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} {o.value !== "0" && "en adelante"}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="f-precio-max">
          <span className="sr-only">Precio máximo</span>
          <select
            id="f-precio-max"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className={selectClass}
          >
            {priceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} {o.value !== "0" && "hasta"}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="f-habitaciones">
          <span className="sr-only">Habitaciones</span>
          <select
            id="f-habitaciones"
            value={habitaciones}
            onChange={(e) => setHabitaciones(e.target.value)}
            className={selectClass}
          >
            <option value="">Habitaciones</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+ habitaciones
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="f-banos">
          <span className="sr-only">Baños</span>
          <select
            id="f-banos"
            value={banos}
            onChange={(e) => setBanos(e.target.value)}
            className={selectClass}
          >
            <option value="">Baños</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+ baños
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          className="inline-flex items-center justify-center gap-1.5 self-start rounded-xl px-2 py-2 text-sm font-medium text-pine-900 hover:bg-pine-50"
        >
          {showAdvanced ? (
            <X className="size-4" aria-hidden />
          ) : (
            <PlusCircle className="size-4" aria-hidden />
          )}
          {showAdvanced ? "Ocultar filtros avanzados" : "Ver filtros avanzados"}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              showAdvanced && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold-500 px-7 text-base font-semibold text-pine-950 shadow-sm transition-colors hover:bg-gold-400 active:bg-gold-600"
          >
            <Search className="size-5" aria-hidden />
            Buscar
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-ink-900/10 px-5 text-sm font-medium text-ink-600 transition-colors hover:bg-bone-100"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="animate-fade-in mt-4 grid grid-cols-2 gap-3 border-t border-bone-100 pt-4 md:grid-cols-4">
          <label>
            <span className="mb-1.5 block text-sm text-ink-600">Área mínima (m²)</span>
            <input
              type="number"
              min={0}
              placeholder="Ej: 60"
              value={areaMin}
              onChange={(e) => setAreaMin(e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-ink-600">Área máxima (m²)</span>
            <input
              type="number"
              min={0}
              placeholder="Ej: 200"
              value={areaMax}
              onChange={(e) => setAreaMax(e.target.value)}
              className={inputClass}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-ink-600">Parqueaderos</span>
            <select
              value={parqueaderos}
              onChange={(e) => setParqueaderos(e.target.value)}
              className={selectClass}
            >
              <option value="">Cualquiera</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-ink-600">Estrato</span>
            <select
              value={estrato}
              onChange={(e) => setEstrato(e.target.value)}
              className={selectClass}
            >
              <option value="">Cualquiera</option>
              {STRATO_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  Estrato {n}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="col-span-2 md:col-span-4">
            <legend className="mb-2 text-sm text-ink-600">
              Características adicionales
            </legend>
            <div className="flex flex-wrap gap-2">
              {FEATURE_PRESETS.map((name) => {
                const selected = features.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleFeature(name)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selected
                        ? "border-pine-800 bg-pine-950 text-bone-50"
                        : "border-ink-900/15 text-ink-600 hover:border-ink-900/35",
                      "min-w-0"
                    )}
                  >
                    <Building2
                      className={cn("size-3.5", selected ? "text-gold-400" : "text-ink-400")}
                      aria-hidden
                    />
                    {name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="col-span-2 md:col-span-4">
            <label>
              <span className="mb-1.5 block text-sm text-ink-600">Zona</span>
              <input
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                placeholder="Ej: Centro, Norte…"
                className={inputClass}
              />
            </label>
          </div>
          <div className="col-span-2 md:col-span-4">
            <label>
              <span className="mb-1.5 block text-sm text-ink-600">Barrio</span>
              <input
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                placeholder="Ej: Uribe, La Patria…"
                className={inputClass}
              />
            </label>
          </div>
        </div>
      )}
    </form>
  );
}