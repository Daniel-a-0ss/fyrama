import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { DEFAULT_SETTINGS } from "@/lib/services/settings";

export const metadata: Metadata = buildMetadata({
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de uso del sitio web de Fyrama y de sus servicios inmobiliarios y jurídicos.",
  path: "/terminos-y-condiciones",
});

const LAST_UPDATE = "28 de octubre de 2026";
const EMAIL = DEFAULT_SETTINGS.contact_email;

export default function Terminos() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        Términos y condiciones
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Última actualización: {LAST_UPDATE}.
      </p>
      <div className="fyrama-prose mt-8">
        <h2>1. Aceptación</h2>
        <p>
          Al acceder y utilizar el sitio web de Fyrama aceptas estos términos y
          condiciones. Si no estás de acuerdo, debes abstenerte de usar el
          sitio. El uso del sitio implica también la aceptación de la{" "}
          <Link href="/politica-de-privacidad">política de privacidad</Link> y
          la <Link href="/politica-de-cookies">política de cookies</Link>.
        </p>

        <h2>2. Objeto y naturaleza informativa</h2>
        <p>
          Fyrama ofrece información sobre inmuebles, servicios inmobiliarios y
          asesoría jurídica. La información publicada tiene carácter informativo
          y no constituye una oferta comercial vinculante, salvo que se indique
          expresamente en un documento suscrito por las partes.
        </p>

        <h2>3. Uso del sitio</h2>
        <ul>
          <li>No utilizar el sitio para fines ilícitos o no autorizados.</li>
          <li>No intentar acceder a áreas restringidas ni alterar su funcionamiento.</li>
          <li>No enviar información falsa, ofensiva o de terceros sin autorización.</li>
          <li>No realizar extracción masiva de contenido ni acciones que afecten el servicio.</li>
        </ul>

        <h2>4. Inmuebles, precios y disponibilidad</h2>
        <p>
          Los precios, áreas, fotografías y características de los inmuebles
          pueden variar sin previo aviso y están sujetos a disponibilidad y
          verificación. La publicación de un inmueble no garantiza su
          disponibilidad ni constituye una promesa de venta o arrendamiento.
        </p>

        <h2>5. Asesoría jurídica</h2>
        <p>
          El contenido jurídico publicado en el sitio es de carácter general e
          informativo y no reemplaza el análisis de un profesional sobre tu caso
          concreto. La relación profesional se perfecciona únicamente mediante
          la contratación expresa del servicio.
        </p>

        <h2>6. Propiedad intelectual</h2>
        <p>
          Los textos, marcas, logotipos, fotografías, diseños y demás contenidos
          del sitio son propiedad de Fyrama o se usan con autorización. No se
          permite su reproducción, distribución o modificación sin autorización
          previa y por escrito.
        </p>

        <h2>7. Enlaces a terceros</h2>
        <p>
          El sitio puede incluir enlaces a plataformas externas (por ejemplo,
          WhatsApp o redes sociales). Fyrama no controla ni responde por sus
          contenidos, políticas o prácticas.
        </p>

        <h2>8. Responsabilidad</h2>
        <p>
          Fyrama adopta medidas razonables para mantener la información
          actualizada y el sitio disponible, pero no garantiza la ausencia de
          errores, interrupciones o virus. En la medida permitida por la ley, no
          será responsable por daños derivados del uso del sitio o de decisiones
          tomadas con base en información meramente informativa.
        </p>

        <h2>9. Datos personales</h2>
        <p>
          El tratamiento de datos se rige por la{" "}
          <Link href="/politica-de-privacidad">política de privacidad</Link> y
          por la{" "}
          <Link href="/tratamiento-de-datos-personales">
            autorización de tratamiento de datos personales
          </Link>
          .
        </p>

        <h2>10. Modificaciones</h2>
        <p>
          Fyrama puede actualizar estos términos en cualquier momento. La
          versión vigente será la publicada en esta página. El uso continuado
          del sitio después de una actualización implica su aceptación.
        </p>

        <h2>11. Ley aplicable y jurisdicción</h2>
        <p>
          Estos términos se rigen por las leyes de la República de Colombia.
          Cualquier controversia se someterá a los jueces competentes del
          domicilio de Fyrama, salvo norma imperativa en contrario.
        </p>

        <h2>12. Contacto</h2>
        <p>
          Consultas sobre estos términos:{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ·{" "}
          {DEFAULT_SETTINGS.contact_phone} · Armenia, Quindío, Colombia.
        </p>
      </div>
    </div>
  );
}
