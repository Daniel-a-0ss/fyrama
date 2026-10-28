import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { DEFAULT_SETTINGS } from "@/lib/services/settings";

export const metadata: Metadata = buildMetadata({
  title: "Tratamiento de datos personales",
  description:
    "Autorización y política de tratamiento de datos personales de Fyrama conforme a la Ley 1581 de 2012.",
  path: "/tratamiento-de-datos-personales",
});

const LAST_UPDATE = "28 de octubre de 2026";
const EMAIL = DEFAULT_SETTINGS.contact_email;

export default function TratamientoDatos() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        Autorización de tratamiento de datos personales
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Última actualización: {LAST_UPDATE}.
      </p>
      <div className="fyrama-prose mt-8">
        <p>
          <strong>Fyrama</strong>, con domicilio en Armenia, Quindío (Colombia),
          actúa como responsable del tratamiento de los datos personales que
          recibe a través de este sitio web, en cumplimiento de la Ley 1581 de
          2012, el Decreto 1377 de 2013 y demás normas aplicables.
        </p>

        <h2>1. Autorización del titular</h2>
        <p>
          Al diligenciar y enviar cualquiera de los formularios del sitio
          (contacto, solicitud sobre un inmueble, asesoría jurídica, permuta u
          opiniones), el titular autoriza de manera previa, expresa e informada
          a Fyrama para tratar sus datos personales de acuerdo con las
          finalidades descritas en esta autorización y en la{" "}
          <Link href="/politica-de-privacidad">política de privacidad</Link>.
        </p>

        <h2>2. Datos tratados</h2>
        <ul>
          <li>Nombre completo.</li>
          <li>Correo electrónico y número de teléfono.</li>
          <li>Ciudad y preferencia de contacto.</li>
          <li>Contenido del mensaje, inmueble de interés y tema de asesoría.</li>
          <li>Dirección IP y datos técnicos de la solicitud, por seguridad.</li>
        </ul>

        <h2>3. Finalidades</h2>
        <ul>
          <li>Atender y responder la solicitud realizada.</li>
          <li>Contactar al titular por el canal que haya indicado.</li>
          <li>Gestionar la relación comercial o profesional derivada.</li>
          <li>Prevenir fraudes, abusos y garantizar la seguridad del sitio.</li>
          <li>
            Enviar información relacionada con los servicios, cuando el titular
            lo haya solicitado o autorizado.
          </li>
        </ul>

        <h2>4. Tratamiento y encargados</h2>
        <p>
          Los datos se almacenan en proveedores de infraestructura y base de
          datos que actúan como encargados bajo obligaciones de
          confidencialidad y seguridad. Fyrama no vende ni cede los datos a
          terceros con fines publicitarios. Podrá compartirlos cuando exista
          obligación legal o requerimiento de autoridad competente.
        </p>

        <h2>5. Derechos del titular</h2>
        <p>El titular puede ejercer en cualquier momento los derechos de:</p>
        <ul>
          <li>Conocer, actualizar y rectificar sus datos.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>Ser informado sobre el uso dado a sus datos.</li>
          <li>Revocar la autorización y solicitar la supresión.</li>
          <li>Acceder gratuitamente a sus datos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
        </ul>
        <p>
          Para ejercerlos, escribe a{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> con tu nombre, documento de
          identidad, la solicitud concreta y un canal de respuesta. Atenderemos
          la petición en los plazos legales.
        </p>

        <h2>6. Vigencia y conservación</h2>
        <p>
          La autorización permanece vigente mientras exista una relación con
          Fyrama o hasta que el titular solicite su revocatoria. Los datos se
          conservarán durante el tiempo necesario para cumplir las finalidades y
          las obligaciones legales, y luego serán eliminados o anonimizados.
        </p>

        <h2>7. Canales de atención</h2>
        <p>
          Correo: <a href={`mailto:${EMAIL}`}>{EMAIL}</a> · Teléfono:{" "}
          {DEFAULT_SETTINGS.contact_phone} · Dirección: Armenia, Quindío,
          Colombia.
        </p>

        <p className="text-sm text-ink-500">
          Esta autorización se entiende aceptada al marcar la casilla de
          consentimiento y enviar el formulario correspondiente.
        </p>
      </div>
    </div>
  );
}
