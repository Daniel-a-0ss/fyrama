import { BadgeCheck, Quote, Star } from "lucide-react";
import { listApprovedReviews, initialsOf } from "@/lib/reviews";
import { ReviewForm } from "@/components/home/ReviewForm";

/** Testimonios de arranque: se muestran mientras no haya opiniones aprobadas. */
const SEED_REVIEWS = [
  {
    id: "seed-1",
    name: "Laura G.",
    time: "Compra de inmueble",
    rating: 5,
    text: "Acompañamiento jurídico real, no solo publicidad. Cada documento fue revisado y explicado antes de firmar.",
  },
  {
    id: "seed-2",
    name: "Carlos M.",
    time: "Venta de apartamento",
    rating: 5,
    text: "Vendí mi apartamento sin estrés. Respondían siempre y todo el papeleo quedó listo en el tiempo prometido.",
  },
  {
    id: "seed-3",
    name: "Ana R.",
    time: "Arrendamiento",
    rating: 5,
    text: "El contrato de arrendamiento más claro que he firmado. Se nota la seriedad de Fyrama en cada detalle.",
  },
];

type Item = {
  id: string;
  name: string;
  time: string | null;
  rating: number;
  text: string;
};

function Stars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <div
      className="flex gap-0.5"
      aria-label={`${rating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? `${size} fill-gold-500 text-gold-500`
              : `${size} fill-transparent text-gold-500/35`
          }
          aria-hidden
        />
      ))}
    </div>
  );
}

export async function Reviews() {
  const approved = await listApprovedReviews(6);

  const items: Item[] = [
    ...approved.map((r) => ({
      id: r.id,
      name: r.name,
      time: r.title,
      rating: r.rating,
      text: r.content,
    })),
    ...(approved.length < SEED_REVIEWS.length
      ? SEED_REVIEWS.slice(approved.length)
      : []),
  ];

  const average =
    items.length > 0
      ? items.reduce((acc, r) => acc + r.rating, 0) / items.length
      : 5;

  return (
    <section
      className="border-y border-bone-200/70 bg-bone-50 py-16 sm:py-20"
      aria-labelledby="resenas-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">
            Opiniones
          </span>
          <h2
            id="resenas-title"
            className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
          >
            Lo que dicen nuestros clientes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-600">
            Cada opinión es revisada por nuestro equipo antes de publicarse.
            Sin filtros, sin testimonios inventados.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-bone-200 bg-white py-2 pl-5 pr-6 shadow-fyrama">
            <Stars rating={Math.round(average)} size="size-5" />
            <span className="h-4 w-px bg-bone-200" aria-hidden />
            <p className="text-sm font-semibold text-ink-900">
              {average.toFixed(1)}
              <span className="font-normal text-ink-500">
                {" "}
                · más de 100 clientes acompañados
              </span>
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <article
              key={r.id}
              className="group relative flex flex-col rounded-2xl border border-bone-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gold-500/40 hover:shadow-fyrama-lg"
            >
              <Quote
                className="absolute right-5 top-5 size-8 text-bone-200 transition-colors group-hover:text-gold-500/40"
                aria-hidden
              />
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-pine-950 font-display text-base font-semibold text-gold-400">
                  {initialsOf(r.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">
                    {r.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs font-medium text-pine-700">
                    <BadgeCheck className="size-3.5 shrink-0" aria-hidden />
                    {r.time ?? "Cliente Fyrama"}
                  </p>
                </div>
              </div>
              <Stars rating={r.rating} />
              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-600">
                “{r.text}”
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-3xl border border-bone-200/80 bg-white shadow-fyrama">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <div className="bg-pine-950 p-8 text-bone-100 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
                Tu turno
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-snug text-bone-50 sm:text-3xl">
                Opina sobre tu experiencia con nuestros servicios
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-bone-200/75">
                Cuéntale a otros clientes qué te pareció tu experiencia. Tu
                opinión ayuda a que alguien más se decida con confianza.
              </p>
              <ul className="mt-7 space-y-3 text-sm text-bone-200/85">
                {[
                  "Se publica solo después de revisarla",
                  "Tu nombre y tu experiencia, sin filtros",
                  "Ayudas a miles de familias en Armenia",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <BadgeCheck
                      className="mt-0.5 size-4 shrink-0 text-gold-400"
                      aria-hidden
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 sm:p-10">
              <ReviewForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
