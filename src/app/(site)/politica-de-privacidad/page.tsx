import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { DEFAULT_SETTINGS } from "@/lib/services/settings";

export const metadata: Metadata = buildMetadata({
  title: "Política de privacidad",
  description:
    "Política de privacidad y tratamiento de datos personales de Fyrama conforme a la Ley 1581 de 2012.",
  path: "/politica-de-privacidad",
});

const LAST_UPDATE = "28 de octubre de 2026";
const EMAIL = DEFAULT_SETTINGS.contact_email;

export default function PoliticaPrivacidad() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        Política de privacidad
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Última actualización: {LAST_UPDATE}.
      </p>
      <div className="fyrama-prose mt-8">
        <h2>1. Responsable del tratamiento</h2>
        <p>
          <strong>Fyrama</strong>, con domicilio en Armenia, Quindío (Colombia),
          es el responsable del tratamiento de los datos personales que se
          recopilan a través de este sitio web. Para cualquier asunto
          relacionado con privacidad puedes escribir a{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </p>

        <h2>2. Marco normativo</h2>
        <p>
          Esta política se rige por la Ley 1581 de 2012, el Decreto 1377 de
          2013, el Decreto 1082 de 2015 y demás normas colombianas que regulan
          la protección de datos personales, así como por las instrucciones de
          la Superintendencia de Industria y Comercio (SIC).
        </p>

        <h2>3. Datos que recopilamos</h2>
        <ul>
          <li>
            <strong>Datos de contacto:</strong> nombre, correo electrónico,
            teléfono, ciudad y preferencia de contacto que envías mediante
            nuestros formularios.
          </li>
          <li>
            <strong>Contenido de las solicitudes:</strong> mensajes, inmueble de
            interés y tema de asesoría jurídica.
          </li>
          <li>
            <strong>Datos técnicos:</strong> dirección IP, navegador y fecha de
            la solicitud, utilizados para seguridad, prevención de abuso y
            diagnóstico.
          </li>
        </ul>
        <p>
          No solicitamos datos sensibles ni información financiera a través de
          este sitio.
        </p>

        <h2>4. Finalidades del tratamiento</h2>
        <ul>
          <li>Atender solicitudes de información sobre inmuebles.</li>
          <li>Gestionar solicitudes de asesoría jurídica inmobiliaria.</li>
          <li>Contactarte por teléfono, correo o WhatsApp según tu preferencia.</li>
          <li>Prevenir fraudes y usos indebidos del sitio.</li>
          <li>
            Enviar comunicaciones relacionadas con la solicitud y, si lo
            autorizas, información comercial sobre nuestros servicios.
          </li>
        </ul>

        <h2>5. Autorización</h2>
        <p>
          Al enviar un formulario autorizas de manera previa, expresa e
          informada el tratamiento de tus datos para las finalidades descritas.
          Puedes revocar esta autorización en cualquier momento, salvo cuando
          exista un deber legal o contractual de conservarlos. El detalle de la
          autorización está disponible en la{" "}
          <Link href="/tratamiento-de-datos-personales">
            autorización de tratamiento de datos personales
          </Link>
          .
        </p>

        <h2>6. Encargados y terceros</h2>
        <p>
          Para operar el sitio utilizamos proveedores de infraestructura,
          alojamiento, base de datos y correo electrónico que pueden tratar
          datos por cuenta de Fyrama y bajo obligaciones de confidencialidad.
          No vendemos ni cedemos tus datos a terceros con fines publicitarios.
          Podremos compartirlos cuando exista obligación legal o requerimiento
          de autoridad competente.
        </p>

        <h2>7. Conservación</h2>
        <p>
          Conservamos los datos mientras la solicitud esté vigente y durante el
          tiempo necesario para cumplir obligaciones legales, contables o
          contractuales. Cuando dejen de ser necesarios, se eliminarán o
          anonimizarán de forma segura.
        </p>

        <h2>8. Derechos del titular</h2>
        <p>Como titular de los datos puedes:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>Ser informado sobre el uso dado a tus datos.</li>
          <li>Revocar la autorización y solicitar la supresión de los datos.</li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio.
          </li>
        </ul>
        <p>
          Para ejercer estos derechos escribe a{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> indicando tu nombre, documento
          de identidad, la solicitud concreta y un canal de respuesta.
          Responderemos en los términos legales aplicables.
        </p>

        <h2>9. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger la
          información, incluyendo cifrado en tránsito, control de acceso,
          registros de auditoría y limitación de intentos. Ningún sistema es
          completamente infalible; si detectamos un incidente relevante,
          actuaremos conforme a la normativa aplicable.
        </p>

        <h2>10. Cookies</h2>
        <p>
          Usamos cookies técnicas necesarias para el funcionamiento y la
          seguridad del sitio. Consulta la{" "}
          <Link href="/politica-de-cookies">política de cookies</Link> para más
          información.
        </p>

        <h2>11. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política para reflejar cambios normativos u
          operativos. La versión vigente será siempre la publicada en esta
          página, con su fecha de actualización.
        </p>

        <h2>12. Contacto</h2>
        <p>
          Dudas o solicitudes:{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> ·{" "}
          {DEFAULT_SETTINGS.contact_phone} · Armenia, Quindío, Colombia.
        </p>
      </div>
    </div>
  );
}
