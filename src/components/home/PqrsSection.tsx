import {
  ArrowRight,
  ClipboardList,
  FileText,
  Lightbulb,
  MessageSquareWarning,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const PQRS_TYPES = [
  {
    icon: FileText,
    title: "Peticiones",
    text: "Solicitudes de información, trámites y documentos para tus procesos.",
  },
  {
    icon: MessageSquareWarning,
    title: "Quejas",
    text: "Cuéntanos qué no salió como esperabas para corregirlo a tiempo.",
  },
  {
    icon: ClipboardList,
    title: "Reclamos",
    text: "Desacuerdos con un servicio: los revisamos y te respondemos con claridad.",
  },
  {
    icon: Lightbulb,
    title: "Sugerencias",
    text: "Tus ideas nos ayudan a mejorar la experiencia de todos los clientes.",
  },
];

export function PqrsSection() {
  return (
    <section className="bg-bone-50 py-12 sm:py-14" aria-labelledby="pqrs-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
            Atención al cliente
          </p>
          <h2
            id="pqrs-title"
            className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
          >
            PQRS
          </h2>
          <p className="mt-3 text-ink-500">
            Peticiones, quejas, reclamos y sugerencias. Queremos escucharte y
            mejorar cada día.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PQRS_TYPES.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-bone-200/70 bg-white p-6 shadow-sm"
            >
              <span className="grid size-14 place-items-center rounded-xl bg-gold-100 text-gold-700">
                <t.icon className="size-7" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{t.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/contacto" variant="gold" size="lg">
            Enviar por formulario
            <ArrowRight className="size-4" aria-hidden />
          </LinkButton>
          <LinkButton
            href={buildWhatsAppUrl(
              "Hola, quiero presentar una PQRS (petición, queja, reclamo o sugerencia)."
            )}
            variant="outline"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Escríbenos por WhatsApp
          </LinkButton>
        </div>
      </div>
    </section>
  );
}