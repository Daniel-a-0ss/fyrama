import type { Metadata } from "next";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardList,
  Coins,
  FileSearch,
  FileText,
  Gavel,
  Handshake,
  Landmark,
  PenLine,
  Scale,
  ShieldCheck,
  Stamp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, mergeSettings } from "@/lib/services/settings";
import { buildMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "Asesoría jurídica inmobiliaria",
  description:
    "Fyrama ofrece orientación jurídica para operaciones inmobiliarias: revisión de contratos, promesas de compraventa, contratos de arrendamiento y estudio de documentos.",
  path: "/asesoria-juridica",
});

type IconKey = string;

const iconMap: Record<IconKey, React.ComponentType<{ className?: string }>> = {
  scale: Scale,
  file: FileText,
  filetext: FileText,
  stamp: Stamp,
  building: Building2,
  landmark: Landmark,
  pen: PenLine,
  penline: PenLine,
  handshake: Handshake,
  shield: ShieldCheck,
  gavel: Gavel,
  coins: Coins,
  clipboard: ClipboardList,
  filesearch: FileSearch,
  book: BookOpen,
};

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const AREAS_DEL_DERECHO = [
  "Derecho constitucional",
  "Derecho procesal",
  "Derecho inmobiliario",
  "Derecho notarial",
  "Derecho civil",
  "Derecho de familia",
  "Derecho penal",
  "Derecho laboral y seguridad social",
  "Derecho mercantil y empresarial",
  "Derecho administrativo",
  "Derecho disciplinario",
  "Derecho policivo",
  "Derecho militar",
  "Derecho migratorio",
  "Derecho ambiental",
  "Derecho tributario",
  "Derecho digital y tecnologías",
  "Propiedad industrial",
  "Derechos de autor y propiedad intelectual",
  "Derecho internacional público",
];

export default async function AsesoriaJuridicaPage() {
  const [services, settings] = await Promise.all([
    prisma.legalService.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getSiteSettings(),
  ]);
  const cfg = mergeSettings(settings);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Asesoría jurídica" }]} />

      <div className="mt-5 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Servicios jurídicos inmobiliarios
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Tu respaldo antes de firmar
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600">
          Fyrama te acompaña en las decisiones jurídicas de tu operación
          inmobiliaria: revisamos documentos, contratos y procesos para que
          compres, vendas o arriendes con confianza.
        </p>
      </div>

      {/* Servicios */}
      <section id="servicios" aria-labelledby="servicios-title" className="mt-12">
        <h2
          id="servicios-title"
          className="mb-6 font-display text-2xl font-semibold text-ink-900"
        >
          Servicios de asesoría
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = iconMap[s.icon ?? "scale"] ?? Scale;
            return (
              <article
                key={s.id}
                id={slugify(s.title)}
                className="group flex scroll-mt-26 flex-col rounded-2xl border border-bone-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-fyrama-lg"
              >
                <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-pine-100 text-pine-800 transition-colors group-hover:bg-pine-950 group-hover:text-gold-400">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="font-display text-lg font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                  {s.description}
                </p>
                <LinkButton
                  href="#solicitar"
                  variant="ghost"
                  size="sm"
                  className="mt-4 self-start"
                >
                  Solicitar esta asesoría
                </LinkButton>
              </article>
            );
          })}
        </div>
      </section>

      {/* Áreas del derecho */}
      <section
        id="areas-del-derecho"
        aria-labelledby="areas-title"
        className="mt-14"
      >
        <div className="rounded-3xl bg-pine-950 p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gold-200 text-gold-700">
                <BookOpen className="size-6" aria-hidden />
              </span>
              <h2
                id="areas-title"
                className="font-display text-3xl font-semibold tracking-tight text-bone-50"
              >
                Áreas del derecho
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-bone-100/75">
                Adicional a la asesoría inmobiliaria, brindamos orientación en
                distintas áreas del derecho según la necesidad de cada cliente.
              </p>
              <LinkButton
                href="#solicitar"
                variant="gold"
                className="mt-5"
              >
                Solicitar consulta
              </LinkButton>
            </div>
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {AREAS_DEL_DERECHO.map((area) => (
                <li
                  key={area}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bone-100/90"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-gold-400" aria-hidden />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section aria-labelledby="como-title" className="mt-14">
        <h2 id="como-title" className="mb-6 font-display text-2xl font-semibold text-ink-900">
          Cómo trabajamos
        </h2>
        <ol className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {[
            { step: "01", text: "Cuéntanos tu caso con el formulario de asesoría." },
            { step: "02", text: "Revisamos tu documentación y la situación de la operación." },
            { step: "03", text: "Recibes orientación clara y pasos a seguir." },
            { step: "04", text: "Acompañamos la revisión previa a la firma." },
          ].map((s) => (
            <li
              key={s.step}
              className="rounded-2xl border border-bone-200/80 bg-white p-5 shadow-sm"
            >
              <span className="font-display text-3xl font-semibold text-gold-500">{s.step}</span>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Formulario de solicitud */}
      <section id="solicitar" aria-labelledby="solicitar-title" className="mt-14">
        <div className="grid gap-8 rounded-3xl border border-bone-200/80 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="solicitar-title" className="font-display text-2xl font-semibold text-ink-900">
              Solicitar asesoría
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              Completa el formulario con tu consulta y la preferencia de
              contacto. Un asesor de Fyrama te responderá con orientación
              inicial. Liberación a contactar según disponibilidad.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Respuesta en 1–2 días hábiles",
                "Consulta inicial orientada a tu operación",
                "Tratamiento confidencial de tus datos",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-ink-600">
                  <CheckCircle2 className="size-4 text-pine-600" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <ContactForm
            type="LEGAL"
            submitLabel="Solicitar asesoría"
            title="¡Asesoría solicitada!"
            description="Recibimos tu solicitud. Te contactaremos por tu preferencia indicada. (DEMO)"
            buttonTone="gold"
          />
        </div>
      </section>

      {/* Aviso legal */}
      <div className="mt-8 rounded-2xl border border-gold-300 bg-gold-200/40 p-6">
        <h2 className="sr-only">Aviso legal</h2>
        <p className="flex items-start gap-3 text-sm leading-relaxed text-ink-700">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden />
          <span>
            {cfg.legal_disclaimer ||
              "El contenido informativo de este sitio no reemplaza la asesoría jurídica profesional."}
          </span>
        </p>
      </div>
    </div>
  );
}