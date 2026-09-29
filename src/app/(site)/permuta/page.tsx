import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  FileSearch,
  Handshake,
  KeyRound,
  Repeat,
  Scale,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "Permuta de inmuebles",
  description:
    "Cambia tu inmueble por otro sin vender primero: asesoramos la permuta de casas y apartamentos con estudio jurídico y trámites completos.",
  path: "/permuta",
});

const IMAGE = "/media/seed/casa1-0.webp";

const BENEFICIOS = [
  {
    icon: Scale,
    title: "Valoración justa",
    text: "Avalúo y análisis del valor de cada inmueble para que la compensación sea equilibrada y transparente.",
  },
  {
    icon: FileSearch,
    title: "Estudio jurídico",
    text: "Verificamos títulos, gravámenes y tradición antes de iniciar la negociación de la permuta.",
  },
  {
    icon: Handshake,
    title: "Negociación asistida",
    text: "Acompañamos las contrapropuestas, plazos y condiciones para lograr un acuerdo seguro para las dos partes.",
  },
  {
    icon: BadgeCheck,
    title: "Trámites incluidos",
    text: "Escritura, notaría y registro de la permuta coordinados por nuestro equipo.",
  },
];

export default function PermutaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Permuta" }]} />

      <div className="mt-5 grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            Permuta de inmuebles
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Cambia de vivienda sin vender primero
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-600">
            La permuta te permite entregar tu inmueble y recibir otro a cambio,
            complementando la diferencia si es necesario. Fyrama te asesora para
            que el cambio sea seguro, justo y sin trámites engorrosos.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={buildWhatsAppUrl(
                "Hola, tengo un inmueble y me interesa permutarlo con Fyrama."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gold-500 px-7 text-base font-semibold text-pine-950 transition-colors hover:bg-gold-400"
            >
              Consultar por WhatsApp
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <LinkButton href="/contacto" variant="outline" size="lg">
              Escribir por correo
            </LinkButton>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <img
            src={IMAGE}
            alt="Inmueble disponible para permuta"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pine-950/60 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 backdrop-blur-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-pine-950">
              <Repeat className="size-4 text-gold-600" aria-hidden />
              Permuta respaldada por estudio jurídico y avalúo previo.
            </p>
          </div>
        </div>
      </div>

      <section aria-labelledby="beneficios-title" className="mt-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
            ¿Por qué permutar con Fyrama?
          </p>
          <h2
            id="beneficios-title"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900"
          >
            Un cambio con garantías
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map((b) => (
            <article
              key={b.title}
              className="rounded-2xl border border-bone-200/80 bg-white p-6 shadow-sm"
            >
              <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-pine-100 text-pine-800">
                <b.icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink-900">
                {b.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="como-title" className="mt-16">
        <div className="rounded-3xl bg-pine-950 p-8 sm:p-10">
          <h2
            id="como-title"
            className="font-display text-2xl font-semibold text-bone-50"
          >
            Así funcionamos
          </h2>
          <ol className="mt-7 grid gap-5 md:grid-cols-4">
            {[
              { step: "01", text: "Cuéntanos tu inmueble y lo que buscas a cambio." },
              { step: "02", text: "Realizamos avalúo y estudio jurídico de las dos propiedades." },
              { step: "03", text: "Negociamos condiciones y compensaciones con tu visto bueno." },
              { step: "04", text: "Formalizamos la permuta con escritura, notaría y registro." },
            ].map((s) => (
              <li
                key={s.step}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <span className="font-display text-3xl font-semibold text-gold-400">
                  {s.step}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-bone-100/80">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="cta-title" className="mt-16">
        <div className="rounded-3xl border border-bone-200/80 bg-white p-8 text-center shadow-sm sm:p-12">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gold-200 text-gold-700">
            <KeyRound className="size-7" aria-hidden />
          </span>
          <h2
            id="cta-title"
            className="mx-auto max-w-xl font-display text-3xl font-semibold tracking-tight text-ink-900"
          >
            ¿Tienes un inmueble y quieres cambiarlo por otro?
          </h2>
          <ul className="mx-auto mt-6 grid max-w-lg grid-cols-1 gap-2 text-left text-sm text-ink-600 sm:grid-cols-2">
            {[
              "Sin necesidad de vender primero",
              "Compensación clara entre valores",
              "Acompañamiento jurídico en todo el proceso",
              "Trámites notariales y registrales coordinados",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-pine-600" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={buildWhatsAppUrl(
                "Hola, quiero información sobre permuta de inmuebles en Fyrama."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gold-500 px-7 text-base font-semibold text-pine-950 transition-colors hover:bg-gold-400"
            >
              Consultar por WhatsApp
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <LinkButton href="/contacto" variant="outline" size="lg">
              Contactar a un asesor
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}