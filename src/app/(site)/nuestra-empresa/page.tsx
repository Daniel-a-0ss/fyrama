import type { Metadata } from "next";
import {
  Award,
  Compass,
  Eye,
  Flag,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "Nuestra empresa",
  description:
    "Conoce quiénes somos, nuestra misión, visión y las razones para elegir a Fyrama como tu aliado jurídico e inmobiliario en Colombia.",
  path: "/nuestra-empresa",
});

export default function NuestraEmpresaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40 lg:px-8">
      <Breadcrumbs items={[{ label: "Nuestra empresa" }]} />

      <div className="mt-5 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Nuestra empresa
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Fyrama, tu aliado jurídico e inmobiliario
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600">
          Integramos{" "}
          <em className="italic text-gold-700">
            experiencia jurídica y conocimiento del sector inmobiliario
          </em>{" "}
          para acompañarte, asesorarte y{" "}
          <em className="italic text-gold-700">defender tus derechos</em> en
          cada etapa de tus negocios y decisiones.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Te brindamos respaldo profesional en la{" "}
          <em className="italic text-gold-700">
            compra, venta, arriendo o permuta de inmuebles
          </em>
          , así como en diferentes{" "}
          <strong className="font-semibold text-ink-900">áreas del derecho</strong>
          , protegiendo tus intereses y buscando soluciones jurídicas claras,
          estratégicas y oportunas.
        </p>
        <p className="mt-6 border-l-2 border-gold-500 pl-4 font-display text-lg italic leading-relaxed text-ink-900">
          Fyrama: respaldo jurídico, gestión inmobiliaria y defensa de tus
          derechos.
        </p>
      </div>

      {/* ¿Quiénes somos? */}
      <section
        id="quienes-somos"
        aria-labelledby="quienes-somos-title"
        className="mt-14 grid items-center gap-8 lg:grid-cols-2"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
            ¿Quiénes somos?
          </p>
          <h2
            id="quienes-somos-title"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900"
          >
            Derecho e inmobiliaria bajo un mismo techo
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">
            Fyrama es una firma que integra la asesoría jurídica con los
            servicios inmobiliarios. Creemos que una operación de inmuebles está
            segura cuando se entiende lo que se firma y se verifica lo que se
            compra, arrienda o permuta.
          </p>
          <p className="mt-3 leading-relaxed text-ink-600">
            Por eso acompañamos a personas, familias y empresas con orientación
            profesional en contratos, promesas, títulos, trámites y decisiones
            de inversión en inmueble.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-pine-950 p-8 sm:p-10">
          <div
            className="absolute -right-10 -top-10 size-48 rounded-full bg-gold-500/10 blur-2xl"
            aria-hidden
          />
          <h3 className="font-display text-2xl font-semibold text-bone-50">
            Operaciones seguras, decisiones informadas
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-bone-100/75">
            La combinación de estudio jurídico y acompañamiento inmobiliario
            reduce riesgos y te permite avanzar con tranquilidad en una de las
            decisiones patrimoniales más importantes de tu vida.
          </p>
          <LinkButton href="/contacto" variant="gold" className="mt-6">
            Hablar con un asesor
          </LinkButton>
        </div>
      </section>

      {/* Misión */}
      <section
        id="mision"
        aria-labelledby="mision-title"
        className="mt-16 grid gap-6 lg:grid-cols-2"
      >
        <article className="rounded-3xl border border-bone-200/70 bg-white p-8 shadow-sm sm:p-10">
          <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-gold-200 text-gold-700">
            <Target className="size-6" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
            Nuestra misión
          </p>
          <h2
            id="mision-title"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900"
          >
            Acompañar con rigurosidad jurídica
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">
            Nuestra misión es facilitar operaciones inmobiliarias seguras,
            brindando asesoría jurídica clara y servicios inmobiliarios
            integrales en cada etapa: búsqueda, negociación, documentación,
            notaría y registro.
          </p>
          <p className="mt-3 leading-relaxed text-ink-600">
            Trabajamos para que cada cliente entienda su negocio, su contrato y
            sus compromisos, convirtiendo la complejidad legal en tranquilidad.
          </p>
        </article>

        {/* Visión */}
        <article
          id="vision"
          className="rounded-3xl border border-bone-200/70 bg-white p-8 shadow-sm sm:p-10"
        >
          <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-gold-200 text-gold-700">
            <Eye className="size-6" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
            Nuestra visión
          </p>
          <h2
            id="vision-title"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900"
          >
            Ser el referente en confianza
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">
            Ser la firma jurídica e inmobiliaria de referencia en Colombia por
            su transparencia, profesionalismo y acompañamiento integral:
            reconocida por convertir procesos complejos en experiencias simples
            y seguras para sus clientes.
          </p>
          <p className="mt-3 leading-relaxed text-ink-600">
            Aspiramos a crecer de la mano de la tecnología y del talento humano,
            cuidando el patrimonio de quienes confían en nosotros.
          </p>
        </article>
      </section>

      {/* ¿Por qué elegirnos? */}
      <section
        id="por-que-elegirnos"
        aria-labelledby="por-que-title"
        className="mt-16"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
            ¿Por qué elegirnos?
          </p>
          <h2
            id="por-que-title"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
          >
            Cinco razones para confiar en Fyrama
          </h2>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: Compass,
              title: "Acompañamiento integral",
              text: "Jurídico e inmobiliario en un solo equipo, sin tener que coordinar varios profesionales.",
            },
            {
              icon: ShieldCheck,
              title: "Rigor documental",
              text: "Verificamos títulos, certificados y documentos para reducir riesgos antes de firmar.",
            },
            {
              icon: Users,
              title: "Trato cercano",
              text: "Te explicamos en lenguaje claro cada cláusula, plazo y obligación del proceso.",
            },
            {
              icon: Award,
              title: "Orientación en inversión",
              text: "Te ayudamos a decidir con información sobre valorización, rentabilidad y mercado.",
            },
            {
              icon: Flag,
              title: "Transparencia total",
              text: "Honorarios, tiempos y condiciones claros desde la primera conversación.",
            },
          ].map((r, i) => (
            <li
              key={r.title}
              className="flex gap-4 rounded-2xl border border-bone-200/70 bg-white p-5 shadow-sm"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pine-950 text-gold-400">
                <r.icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-ink-900">
                  <span className="mr-1.5 text-gold-500">{i + 1}.</span>
                  {r.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{r.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <div className="rounded-3xl bg-gradient-to-br from-pine-900 to-pine-950 px-8 py-12 text-center sm:px-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-bone-50">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-bone-100/75">
            Cuéntanos tu proyecto o consulta y un asesor de Fyrama te orientará
            con acompañamiento jurídico e inmobiliario.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/contacto" variant="gold" size="lg">
              Contáctanos
            </LinkButton>
            <LinkButton
              href="/viviendas"
              variant="outline"
              size="lg"
              className="border-[#ffffff]/25! text-[#fbfaf6]! hover:bg-[#ffffff]/10! hover:border-[#ffffff]/40!"
            >
              Explorar inmuebles
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}