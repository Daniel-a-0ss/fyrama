import { Star } from "lucide-react";

const REVIEWS = [
  {
    initials: "LG",
    name: "Laura G.",
    time: "Compra de vivienda",
    text: "Acompañamiento jurídico real, no solo publicidad. Cada documento fue revisado y explicado antes de firmar.",
  },
  {
    initials: "CM",
    name: "Carlos M.",
    time: "Venta de apartamento",
    text: "Vendí mi apartamento sin estrés. Respondían siempre y todo el papeleo quedó listo en el tiempo prometido.",
  },
  {
    initials: "AR",
    name: "Ana R.",
    time: "Arrendamiento",
    text: "El contrato de arrendamiento más claro que he firmado. Se nota la seriedad de Fyrama en cada detalle.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4 fill-gold-500 text-gold-500" aria-hidden />
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8" aria-labelledby="resenas-title">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xl font-semibold uppercase tracking-[0.25em] text-gold-600 sm:text-2xl">
          Opiniones
        </p>
        <h2
          id="resenas-title"
          className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
        >
          Lo que dicen los clientes de nosotros
        </h2>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Stars />
          <p className="text-sm font-medium text-ink-600">
            5.0 · Más de 100 clientes acompañados
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r) => (
          <article
            key={r.name}
            className="rounded-2xl border border-bone-200/70 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pine-100 font-display text-sm font-semibold text-pine-800">
                  {r.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{r.name}</p>
                  <p className="text-xs text-ink-500">{r.time}</p>
                </div>
              </div>
              <Stars />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-600">“{r.text}”</p>
          </article>
        ))}
      </div>
    </section>
  );
}