import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { DEFAULT_SETTINGS } from "@/lib/services/settings";

export const metadata: Metadata = buildMetadata({
  title: "Política de cookies",
  description:
    "Política de cookies de Fyrama: qué cookies usamos, para qué y cómo puedes gestionarlas.",
  path: "/politica-de-cookies",
});

const LAST_UPDATE = "28 de octubre de 2026";
const EMAIL = DEFAULT_SETTINGS.contact_email;

export default function PoliticaCookies() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        Política de cookies
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Última actualización: {LAST_UPDATE}.
      </p>
      <div className="fyrama-prose mt-8">
        <h2>1. ¿Qué son las cookies?</h2>
        <p>
          Son pequeños archivos que el navegador almacena en tu dispositivo
          cuando visitas un sitio web. Permiten recordar información, mantener
          sesiones seguras y mejorar la experiencia de navegación.
        </p>

        <h2>2. Base legal</h2>
        <p>
          Las cookies estrictamente necesarias se usan para prestar el servicio
          y garantizar la seguridad del sitio. Cualquier cookie no necesaria
          requeriría tu consentimiento previo, el cual no solicitamos porque
          actualmente no usamos cookies de publicidad ni de analítica.
        </p>

        <h2>3. Cookies que utilizamos</h2>
        <ul>
          <li>
            <strong>fyrama_session:</strong> cookie técnica de sesión para el
            panel administrativo. Es HttpOnly, SameSite=Strict y expira al
            cerrar sesión o al vencer el tiempo configurado.
          </li>
          <li>
            <strong>fyrama_2fa_pending:</strong> cookie técnica temporal que
            recuerda que se inició la verificación en dos pasos mientras se
            completa el acceso al panel. Expira en pocos minutos.
          </li>
        </ul>
        <p>
          Estas cookies son necesarias para la seguridad del sitio y no se usan
          para rastrearte ni para elaborar perfiles publicitarios.
        </p>

        <h2>4. Cookies de terceros</h2>
        <p>
          Actualmente no incorporamos herramientas de analítica, publicidad ni
          botones sociales que instalen cookies de terceros. Los enlaces a
          WhatsApp, Facebook, Instagram y TikTok abren sitios externos que
          aplican sus propias políticas; te recomendamos revisarlas.
        </p>

        <h2>5. Durante cuánto tiempo se conservan</h2>
        <p>
          Las cookies técnicas se conservan durante la sesión o hasta que
          expire su plazo. Si cierras sesión o borras las cookies del navegador,
          se eliminan de tu dispositivo.
        </p>

        <h2>6. Gestión de cookies</h2>
        <p>
          Puedes configurar tu navegador para rechazar, bloquear o eliminar
          cookies. Ten en cuenta que, si desactivas las cookies técnicas, no
          podrás iniciar sesión ni usar el panel administrativo. Consulta la
          ayuda de tu navegador (Chrome, Edge, Firefox o Safari) para hacerlo.
        </p>

        <h2>7. Cambios a esta política</h2>
        <p>
          Si en el futuro incorporamos cookies de analítica o publicidad,
          actualizaremos esta política y habilitaremos un mecanismo de
          consentimiento antes de instalarlas.
        </p>

        <h2>8. Contacto</h2>
        <p>
          Dudas sobre cookies: <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ·{" "}
          {DEFAULT_SETTINGS.contact_phone}. Consulta también la{" "}
          <Link href="/politica-de-privacidad">política de privacidad</Link>.
        </p>
      </div>
    </div>
  );
}
