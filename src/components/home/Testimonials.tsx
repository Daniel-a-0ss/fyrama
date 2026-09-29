"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Sparkles } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Excelente servicio, nos acompañaron en todo el proceso de compra. La revisión jurídica y los estudios de títulos nos dieron una tranquilidad enorme.",
    name: "Laura G.",
    role: "Compradora de vivienda en Armenia",
  },
  {
    quote:
      "Gestionaron la venta de nuestro apartamento de principio a fin: el avalúo, los contratos y el acompañamiento legal fueron impecables.",
    name: "Carlos M.",
    role: "Vendedor en Quindío",
  },
  {
    quote:
      "Arrendamos por Fyrama con contratos claros y respaldo permanente. Se nota que son abogados, todo quedó perfectamente documentado.",
    name: "Ana R.",
    role: "Arrendataria en Armenia",
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const current = TESTIMONIALS[active];

  const go = (dir: 1 | -1) =>
    setActive((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="bg-pine-950 py-14 sm:py-16" aria-labelledby="testimonios-title">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
            Testimonios
          </p>
          <h2
            id="testimonios-title"
            className="mt-2 font-display text-3xl font-semibold tracking-tight text-bone-50 sm:text-4xl"
          >
            Lo que dicen nuestros clientes
          </h2>

          <div
            className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10"
            aria-live="polite"
          >
            <Quote className="size-9 text-gold-400" aria-hidden />
            <blockquote className="mt-4 text-xl leading-relaxed text-bone-50 sm:text-2xl">
              “{current.quote}”
            </blockquote>
            <div className="mt-6">
              <p className="font-display text-lg font-semibold text-gold-300">{current.name}</p>
              <p className="text-sm text-bone-100/70">{current.role}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1.5" role="tablist" aria-label="Seleccionar testimonio">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name}
                  role="tab"
                  aria-selected={active === i}
                  aria-label={`Testimonio de ${t.name}`}
                  onClick={() => setActive(i)}
                  className={
                    active === i
                      ? "h-1.5 w-8 rounded-full bg-gold-400 transition-all"
                      : "h-1.5 w-3 rounded-full bg-white/25 transition-all hover:bg-white/45"
                  }
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Testimonio anterior"
                className="grid size-10 place-items-center rounded-full border border-white/20 text-bone-50 transition-colors hover:bg-white/10"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Testimonio siguiente"
                className="grid size-10 place-items-center rounded-full border border-white/20 text-bone-50 transition-colors hover:bg-white/10"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden rounded-3xl lg:block">
          <img
            src="/media/seed/casa2-0.webp"
            alt="Clientes satisfechos de Fyrama"
            className="h-full min-h-[26rem] w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pine-950 via-pine-950/35 to-pine-950/10" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-center">
            <Sparkles className="mx-auto size-8 text-gold-400" aria-hidden />
            <p className="mt-3 font-display text-2xl font-semibold leading-snug text-bone-50">
              Historias reales,
              <br />
              resultados reales
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}