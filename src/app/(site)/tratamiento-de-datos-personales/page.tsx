import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Tratamiento de datos personales",
  description: "Política de tratamiento de datos personales de Fyrama.",
  path: "/tratamiento-de-datos-personales",
});

export default function TratamientoDatos() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">
        Autorización de tratamiento de datos personales
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        Última actualización: [FECHA]. ·{" "}
        <span className="text-gold-600">
          [PLACEHOLDER — texto definitivo del consentimiento]
        </span>
      </p>
      <div className="fyrama-prose mt-8">
        <p>
          [PLACEHOLDER] Al enviar un formulario en Fyrama, el titular autoriza
          expresamente el tratamiento de sus datos personales (nombre, correo,
          teléfono) para atender su solicitud de contacto o asesoría, de
          conformidad con la Ley 1581 de 2012, el Decreto 1377 de 2013 y las
          normas que las sustituyan o modifiquen.
        </p>
        <p>
          Los datos serán tratados únicamente para las finalidades descritas en
          la política de privacidad y no serán compartidos con terceros sin
          autorización, salvo obligación legal.
        </p>
        <h2>Derechos</h2>
        <p>
          Puedes solicitar acceso, rectificación, actualización o supresión de
          tus datos escribiendo a [PLACEHOLDER — correo de privacidad].
        </p>
        <h2>Aviso importante (DEMO)</h2>
        <p>
          Este es un texto provisional para desarrollo. Antes de producción,
          Fyrama debe publicar la autorización final redactada con asesoría
          legal especializada en protección de datos.
        </p>
      </div>
    </div>
  );
}