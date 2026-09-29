import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Política de privacidad",
  description: "Política de privacidad de Fyrama.",
  path: "/politica-de-privacidad",
});

export default function PoliticaPrivacidad() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">
        Política de privacidad
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Última actualización: [FECHA]. · <span className="text-gold-600">[PLACEHOLDER — completar con la información jurídica real de Fyrama]</span>
      </p>
      <div className="fyrama-prose mt-8">
        <h2>1. Responsable del tratamiento</h2>
        <p>
          [PLACEHOLDER] Nombre o razón social del responsable, NIT, domicilio y
          datos de contacto oficiales de Fyrama. Este texto debe ser redactado
          por el propietario con la asesoría legal correspondiente.
        </p>
        <h2>2. Datos que recopilamos</h2>
        <p>
          Recopilamos la información que nos proporcionas voluntariamente al
          usar el sitio: nombre, correo electrónico, teléfono y mensajes de
          contacto. También recopilamos información técnica de navegación
          (como cookies) según nuestra política de cookies.
        </p>
        <h2>3. Finalidad del tratamiento</h2>
        <ul>
          <li>Atender solicitudes de contacto e información sobre inmuebles.</li>
          <li>Gestionar solicitudes de asesoría jurídica.</li>
          <li>Mejorar el funcionamiento y seguridad del sitio.</li>
        </ul>
        <h2>4. Derechos de los titulares</h2>
        <p>
          De conformidad con la normativa aplicable en Colombia (Ley 1581 de
          2012 y Decreto 1377 de 2013), puedes ejercer tus derechos de acceso,
          rectificación, actualización y supresión de tus datos escribiendo a
          [PLACEHOLDER — correo de privacidad].
        </p>
        <h2>5. Conservación</h2>
        <p>
          [PLACEHOLDER] Describe el plazo de conservación de los datos y los
          procedimientos de eliminación.
        </p>
        <h2>6. Contacto</h2>
        <p>
          Para dudas sobre esta política, escríbenos a [PLACEHOLDER — correo oficial].
        </p>
      </div>
    </div>
  );
}