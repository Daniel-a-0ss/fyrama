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
import { legalServiceAnchor } from "@/lib/services/nav";
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
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40 lg:px-8">
      <Breadcrumbs items={[{ label: "Asesoría jurídica" }]} />

      <div className="mt-5 max-w-3xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Servicios Jurídicos
        </h1>
        <p className="mt-3 font-display text-xl italic leading-snug text-gold-700 sm:text-2xl">
          Respaldo jurídico para proteger lo que más importa.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-ink-600">
          En <em className="italic text-gold-700">Fyrama</em> ofrecemos asesoría,
          acompañamiento y representación jurídica integral para personas,
          empresas e inversiones. Nuestro enfoque combina{" "}
          <em className="italic text-gold-700">
            experiencia, prevención y estrategia
          </em>
          , buscando anticipar riesgos, proteger derechos, resolver conflictos y
          brindar seguridad jurídica en cada decisión.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Desde la{" "}
          <em className="italic text-gold-700">
            asesoría preventiva y revisión de contratos
          </em>
          , hasta la{" "}
          <strong className="font-semibold text-ink-900">
            representación en procesos y solución de controversias
          </strong>
          , ponemos el conocimiento jurídico al servicio de tus intereses y de
          la protección de tu patrimonio.
        </p>
        <p className="mt-6 border-l-2 border-gold-500 pl-4 font-display text-lg italic leading-relaxed text-ink-900">
          Más que resolver problemas, trabajamos para prevenirlos.
        </p>
      </div>

      {/* Servicios */}
      <section id="servicios" aria-labelledby="servicios-title" className="mt-12">
        <h2
          id="servicios-title"
          className="mb-6 font-display text-2xl font-semibold text-ink-900"
        >
          Servicios
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = iconMap[s.icon ?? "scale"] ?? Scale;
            return (
              <article
                key={s.id}
                id={legalServiceAnchor(s.title)}
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

      {/* Formulario de solicitud */}
      <section id="solicitar" aria-labelledby="solicitar-title" className="mt-14">
        <div className="grid gap-8 rounded-3xl border border-bone-200/80 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="solicitar-title" className="font-display text-2xl font-semibold text-ink-900">
              Agenda tu asesoría
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              Completa el formulario con tus datos y cuéntanos brevemente el
              motivo de tu consulta. Recibiremos tu solicitud y nos
              pondremos en contacto contigo para{" "}
              <em className="italic text-gold-700">
                coordinar la fecha y hora de tu cita con un profesional de
                Fyrama
              </em>
              .
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-500">
              <em className="italic text-gold-700">
                El valor de la asesoría dependerá del tipo de consulta, su
                complejidad y el alcance del servicio requerido
              </em>
              . Antes de la cita te informaremos las condiciones y el valor
              correspondiente.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Solicitud y agendamiento de la cita",
                "Atención personalizada con un profesional",
                "Asesoría jurídica e inmobiliaria según tu necesidad",
                "Valor definido de acuerdo con el tipo de asesoría",
                "Información tratada de manera confidencial",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-ink-600">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-pine-600" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <ContactForm
            type="LEGAL"
            submitLabel="Agendar asesoría"
            title="¡Asesoría solicitada!"
            description="Recibimos tu solicitud. Te contactaremos por tu preferencia indicada."
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