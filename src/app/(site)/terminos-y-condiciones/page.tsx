import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Términos y condiciones",
  description: "Términos y condiciones de uso del sitio Fyrama.",
  path: "/terminos-y-condiciones",
});

export default function Terminos() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">
        Términos y condiciones
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Última actualización: [FECHA]. ·{" "}
        <span className="text-gold-600">
          [PLACEHOLDER — redactar o completar con asesoría legal]
        </span>
      </p>
      <div className="fyrama-prose mt-8">
        <h2>1. Aceptación de los términos</h2>
        <p>
          [PLACEHOLDER] Al acceder y usar el sitio de Fyrama aceptas los
          presentes términos.
        </p>
        <h2>2. Naturaleza informativa</h2>
        <p>
          La información publicada sobre inmuebles, precios y disponibilidad
          tiene carácter informativo y puede cambiar sin previo aviso. No
          constituye oferta comercial vinculante.
        </p>
        <h2>3. Contenido del sitio</h2>
        <p>
          [PLACEHOLDER] El contenido de asesoría jurídica es informativo y no
          reemplaza la consulta con un profesional calificado.
        </p>
        <h2>4. Responsabilidad</h2>
        <p>
          [PLACEHOLDER] Describe los límites de responsabilidad de Fyrama
          respecto al uso del sitio.
        </p>
        <h2>5. Contacto</h2>
        <p>
          Para consultas sobre estos términos: [PLACEHOLDER — correo oficial].
        </p>
      </div>
    </div>
  );
}