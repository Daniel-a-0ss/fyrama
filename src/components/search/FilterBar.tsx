"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { OPERATIONS, PROPERTY_TYPES } from "@/lib/constants";
import { searchUrl, type SearchParamsRecord } from "@/lib/search";

type Props = {
  cities: string[];
  initial?: SearchParamsRecord;
  formId?: string;
};

const clean = (v: string) => v.trim();

export function FilterBar({
  cities,
  initial,
  formId = "fyrama-filter-form",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [operation, setOperation] = useState<"VENTA" | "ARRIENDO">(
    (initial?.operacion as "VENTA" | "ARRIENDO") ?? "VENTA"
  );

  const [ciudad, setCiudad] = useState(initial?.ciudad ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: SearchParamsRecord = { operacion: operation };
    const set = (k: string, v: string) => {
      const c = clean(v);
      if (c) params[k] = c;
    };
    set("ciudad", ciudad);
    set("tipo", tipo);
    startTransition(() => {
      router.push(searchUrl("/viviendas", params));
    });
  };

  const reset = () => {
    setCiudad("");
    setTipo("");
  };

  const inputClass =
    "w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3.5 text-lg text-ink-900 shadow-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-pine-600/25 focus:border-pine-700";
  const selectClass = `cursor-pointer pr-10 ${inputClass}`;

  return (
    <form
      id={formId}
      onSubmit={submit}
      className="mx-auto w-full max-w-3xl rounded-3xl border border-bone-200/70 bg-white/95 p-4 shadow-fyrama-lg backdrop-blur-sm sm:p-7"
      aria-label="Buscador de inmuebles"
      aria-busy={pending || undefined}
    >
      {/* Encabezado del buscador */}
      <p className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.3em] text-ink-500">
        Busca tu propiedad
      </p>

      {/* Tabs Venta / Arrendamiento + acceso a Permuta */}
      <div className="mb-5 flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start">
        <div
          className="inline-flex justify-center rounded-full bg-bone-100 p-1"
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
              disabled={pending}
              className={cn(
                "rounded-full px-5 py-2.5 text-sm font-medium transition-all sm:px-7 sm:py-3 sm:text-base",
                operation === op.value
                  ? "bg-pine-950 text-bone-50 shadow-sm"
                  : "text-ink-600 hover:text-ink-900",
                pending && "cursor-wait opacity-70"
              )}
            >
              {op.label}
            </button>
          ))}
        </div>
        <Link
          href="/permuta"
          className="rounded-full px-5 py-2.5 text-sm font-medium text-ink-600 transition-all hover:bg-bone-100 hover:text-ink-900 sm:px-7 sm:py-3 sm:text-base"
        >
          Permuta
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="f-ciudad" className="sr-only">
            Ciudad
          </label>
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-400"
              aria-hidden
            />
            <input
              id="f-ciudad"
              list="fyrama-cities"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ciudad o municipio"
              className={cn(inputClass, "pl-12")}
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
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-14 flex-1 items-center justify-center gap-2.5 rounded-2xl bg-gold-500 px-8 text-base font-semibold text-pine-950 shadow-sm transition-colors hover:bg-gold-400 active:bg-gold-600 disabled:cursor-wait disabled:opacity-80 sm:text-lg"
          >
            {pending ? (
              <Loader2 className="size-6 animate-spin" aria-hidden />
            ) : (
              <Search className="size-6" aria-hidden />
            )}
            {pending ? "Buscando…" : "Buscar"}
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="inline-flex h-14 items-center justify-center rounded-2xl border border-ink-900/10 px-7 text-base font-medium text-ink-600 transition-colors hover:bg-bone-100 disabled:opacity-60"
          >
            Limpiar
          </button>
        </div>
      </div>
    </form>
  );
}