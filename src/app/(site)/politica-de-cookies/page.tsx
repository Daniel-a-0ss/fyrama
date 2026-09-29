import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Política de cookies",
  description: "Política de cookies de Fyrama.",
  path: "/politica-de-cookies",
});

export default function PoliticaCookies() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">
        Política de cookies
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Última actualización: [FECHA]. ·{" "}
        <span className="text-gold-600">[PLACEHOLDER — completar según el uso real]</span>
      </p>
      <div className="fyrama-prose mt-8">
        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos que se almacenan en tu dispositivo
          para el funcionamiento y la mejora de la experiencia del sitio.
        </p>
        <h2>2. Cookies que utilizamos</h2>
        <ul>
          <li>
            <strong>Cookies técnicas (necesarias):</strong> sesión de
            administración, preferencias de interfaz y protección contra abuso.
          </li>
          <li>
            <strong>Cookies de análisis (si se activan):</strong> [PLACEHOLDER —
            herramientas de analítica que se configuren, con enlace a su
            política].
          </li>
        </ul>
        <h2>3. Gestión de cookies</h2>
        <p>
          Puedes configurar tu navegador para rechazar o eliminar cookies. Al
          hacerlo, algunas funciones del sitio podrían no operar
          correctamente.
        </p>
        <h2>4. Aviso (DEMO)</h2>
        <p>
          Fyrama puede incluir un banner de consentimiento de cookies cuando el
          propietario active herramientas de terceros. Este texto se debe
          ajustar con la configuración real del sitio.
        </p>
      </div>
    </div>
  );
}