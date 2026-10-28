import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings, mergeSettings } from "@/lib/services/settings";
import { buildMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/contact/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const asunto = sp.asunto === "vender" ? "vendiendo tu inmueble" : undefined;
  return buildMetadata({
    title: asunto ? `Contacto · ¿${asunto}?` : "Contacto",
    description:
      "Contáctanos para comprar, vender o arrendar inmueble, o para solicitar asesoría jurídica inmobiliaria.",
    path: "/contacto",
  });
}

export default async function ContactoPage() {
  const settings = mergeSettings(await getSiteSettings());

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40 lg:px-8">
      <Breadcrumbs items={[{ label: "Contacto" }]} />
      <div className="mt-5 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Estamos para ayudarte
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Contáctanos
        </h1>
        <p className="mt-4 text-lg text-ink-600">
          ¿Tienes un inmueble para vender o arrendar, buscas asesoría jurídica
          o quieres información? Escríbenos.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Correo", value: settings.contact_email },
            { icon: Phone, label: "Teléfono", value: settings.contact_phone },
            { icon: MapPin, label: "Ubicación", value: settings.contact_city },
          ].map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-4 rounded-2xl border border-bone-200/80 bg-white p-5 shadow-sm"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-pine-100 text-pine-800">
                <c.icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm text-ink-500">{c.label}</p>
                <p className="font-medium text-ink-900">{c.value}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-gold-300 bg-gold-200/40 p-5 text-sm text-ink-700">
            <p>
              <strong>Horario:</strong> Lunes a viernes, 8:00 a.m. – 6:00 p.m.
            </p>
            <p className="mt-2">
              También puedes escribirnos por WhatsApp o correo para una respuesta
              más rápida.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-bone-200/80 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Envíanos un mensaje
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Responderemos lo antes posible. Si tu consulta es jurídica, usa el
            formulario de{" "}
            <a href="/asesoria-juridica" className="text-pine-800 underline underline-offset-2">
              asesoría jurídica
            </a>
            .
          </p>
          <ContactForm
            className="mt-6"
            type="GENERAL"
            submitLabel="Enviar mensaje"
            title="¡Mensaje enviado!"
            description="Recibimos tu mensaje. Nos pondremos en contacto contigo. (DEMO)"
          />
        </div>
      </div>
    </div>
  );
}