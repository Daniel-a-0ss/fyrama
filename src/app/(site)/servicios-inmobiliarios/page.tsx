import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  FileSearch,
  FileText,
  Handshake,
  Home,
  KeyRound,
  Landmark,
  Megaphone,
  PenLine,
  PiggyBank,
  Repeat,
  Ruler,
  Stamp,
  TrendingUp,
  Users,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Servicios inmobiliarios",
  description:
    "Compra, venta, arrendamiento y permuta de inmuebles con acompañamiento jurídico: promesas, contratos, trámites notariales, avalúos e inversión inmobiliaria.",
  path: "/servicios-inmobiliarios",
});

const SERVICES = [
  {
    id: "inmuebles-en-venta",
    title: "Inmuebles en venta",
    icon: Home,
    text: "Casas, apartamentos, lotes, oficinas y locales en venta, con asesoría integral para comprar o vender tu inmueble.",
    href: "/viviendas?operacion=venta",
  },
  {
    id: "inmuebles-en-arrendamiento",
    title: "Inmuebles en arrendamiento",
    icon: KeyRound,
    text: "Oferta verificada de arrendamientos con contratos revisados y acompañamiento desde la visita hasta la entrega del inmueble.",
    href: "/viviendas?operacion=arriendo",
  },
  {
    id: "inmuebles-para-permutar",
    title: "Inmuebles para permutar",
    icon: Repeat,
    text: "Selección de inmuebles disponibles para permuta y asesoría para valorar, negociar y formalizar el cambio de vivienda.",
    href: "/permuta",
  },
  {
    id: "negociacion-de-inmuebles",
    title: "Asesoría en negociación de inmuebles",
    icon: Handshake,
    text: "Acompañamiento en cada etapa de la negociación: ofertas, contrapuestas y acuerdos con respaldo profesional.",
  },
  {
    id: "estudio-juridico",
    title: "Estudio jurídico de inmuebles",
    icon: FileSearch,
    text: "Revisión del certificado de tradición y libertad, gravámenes, hipotecas y situación jurídica del inmueble.",
  },
  {
    id: "promesas-y-contratos",
    title: "Elaboración de promesas y contratos inmobiliarios",
    icon: PenLine,
    text: "Redacción y revisión de promesas de compraventa y contratos de arrendamiento a medida de tu operación.",
  },
  {
    id: "administracion-contratos",
    title: "Administración de contratos de arrendamiento",
    icon: FileText,
    text: "Gestión de contratos, cánones, renovaciones, cláusulas y requerimientos legales del arrendamiento.",
  },
  {
    id: "administracion-gestion",
    title: "Administración y gestión inmobiliaria",
    icon: Building2,
    text: "Administramos tus inmuebles: control de ingresos, mantenimientos, pagos y gestión con arrendatarios.",
  },
  {
    id: "inversion-inmobiliaria",
    title: "Asesoría en inversión inmobiliaria",
    icon: TrendingUp,
    text: "Análisis de mercado, rentabilidad y valorización para invertir en vivienda con criterio y seguridad.",
  },
  {
    id: "saneamiento-juridico",
    title: "Saneamiento jurídico de inmuebles",
    icon: BadgeCheck,
    text: "Regularización de títulos, superación de vicios y trámites para dejar tu inmueble en orden legal.",
  },
  {
    id: "tramites-notariales",
    title: "Trámites notariales y registrales",
    icon: Stamp,
    text: "Coordinación de escrituras, registro, tradición y demás trámites ante notarías y registro de instrumentos públicos.",
  },
  {
    id: "marketing-publicidad",
    title: "Marketing y publicidad inmobiliaria",
    icon: Megaphone,
    text: "Publicación profesional de tu inmueble en portales y redes para llegar a los compradores y arrendatarios correctos.",
  },
  {
    id: "subsidios-y-creditos",
    title: "Subsidios y créditos inmobiliarios",
    icon: PiggyBank,
    text: "Acompañamiento integral en la gestión de subsidios de vivienda y créditos hipotecarios o de leasing.",
  },
  {
    id: "avaluo-y-peritaje",
    title: "Avalúo y peritaje de inmuebles",
    icon: Ruler,
    text: "Avalúos comerciales y peritajes técnicos del inmueble para negociar, invertir o resolver controversias.",
  },
];

export default function ServiciosInmobiliariosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Servicios inmobiliarios" }]} />

      <div className="mt-5 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Servicios inmobiliarios
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Compra, vende, arrienda o permuta con respaldo jurídico
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600">
          Más allá de listar inmuebles, acompañamos cada operación con estudio
          jurídico, contratos claros y gestión profesional para que tu patrimonio
          esté protegido en todo momento.
        </p>
      </div>

      <section aria-labelledby="servicios-title" className="mt-12">
        <h2 id="servicios-title" className="sr-only">
          Listado de servicios inmobiliarios
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="group flex scroll-mt-26 flex-col rounded-2xl border border-bone-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-fyrama-lg"
            >
              <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-pine-100 text-pine-800 transition-colors group-hover:bg-pine-950 group-hover:text-gold-400">
                <s.icon className="size-6" aria-hidden />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink-900">
                {s.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{s.text}</p>
              {s.href ? (
                <a
                  href={s.href}
                  className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-pine-800 hover:text-pine-950"
                >
                  Explorar
                  <ArrowRight className="size-4" aria-hidden />
                </a>
              ) : (
                <a
                  href={buildWhatsAppUrl(
                    `Hola, me interesa el servicio de ${s.title} en Fyrama.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-pine-800 hover:text-pine-950"
                >
                  Consultar por WhatsApp
                  <ArrowRight className="size-4" aria-hidden />
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="grid gap-6 rounded-3xl bg-pine-950 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-bone-50">
              ¿Tienes un inmueble o un proyecto en mente?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-bone-100/75">
              Cuéntanos qué necesitas: venta, arrendamiento, permuta, estudio
              jurídico o gestión. Un asesor de Fyrama te acompañará en el
              proceso completo.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-bone-100">
                <Users className="size-4 text-gold-400" aria-hidden />
                Atención personalizada
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-bone-100">
                <FileCheck2 className="size-4 text-gold-400" aria-hidden />
                Respaldo jurídico
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-bone-100">
                <Landmark className="size-4 text-gold-400" aria-hidden />
                Trámites incluidos
              </span>
            </div>
          </div>
          <a
            href={buildWhatsAppUrl(
              "Hola, quiero información sobre los servicios inmobiliarios de Fyrama."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-semibold text-pine-950 transition-colors hover:bg-gold-400"
          >
            Consultar por WhatsApp
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}