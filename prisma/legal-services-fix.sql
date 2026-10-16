-- ============================================================================
-- Fyrama — servicios jurídicos: dejar como contenido real la misma lista
--                    que muestra el menú de navegación.
-- ----------------------------------------------------------------------------
-- En producción la tabla "LegalService" tiene 9 registros con títulos que NO
-- coinciden con las opciones del menú ("Revisión de contratos", "CORRETAJE",
-- "Promesas de compraventa"...). Por eso 9 de las 10 opciones del menú
-- llegaban a un ancla inexistente, y las 9 descripciones decía lo mismo:
-- "Inmueble de demostración para desarrollo."
--
-- Este script reemplaza el contenido por la lista del menú, con descripciones
-- reales. Es idempotente: se puede ejecutar las veces que sea necesario.
--
-- Desde Vercel:  Proyecto fyrama > Storage > Postgres > pestaña "Data"
--                (o la consola de Neon) > pegar este bloque > Run
-- ============================================================================

BEGIN;

-- 1) Desactivar los registros que no pertenecen a la lista definitiva.
--    No se borran, para poder recuperarlos desde el panel si hicieran falta.
UPDATE "LegalService"
SET "active" = false,
    "updatedAt" = NOW()
WHERE "slug" NOT IN (
  'asesoria-y-consultoria',
  'representacion-judicial-y-extrajudicial',
  'negociacion-y-conciliacion-juridica',
  'acciones-de-tutela',
  'derechos-de-peticion',
  'estudio-de-titulos',
  'cobro-de-cartera',
  'auditoria-y-revision-juridica',
  'estudio-de-riesgo-juridico'
);

-- 2) Insertar o actualizar la lista definitiva.
INSERT INTO "LegalService" ("id", "title", "slug", "description", "content", "icon", "active", "sortOrder", "createdAt", "updatedAt")
VALUES
  (
    'ls-asesoria-y-consultoria',
    'Asesoría y consultoría',
    'asesoria-y-consultoria',
    'Orientación jurídica personalizada para tu proyecto inmobiliario o legal, con análisis de riesgos y recomendaciones claras antes de actuar.',
    'Analizamos tu situación y te entregamos una hoja de ruta con las alternativas viables, sus costos, plazos y riesgos. Acompañamiento en consultas, planeación y decisiones.',
    'scale',
    true,
    0,
    NOW(),
    NOW()
  ),
  (
    'ls-representacion-judicial',
    'Representación judicial y extrajudicial',
    'representacion-judicial-y-extrajudicial',
    'Representación en litigios y conflictos ante los tribunales y ante terceros, con estrategia definida desde el primer escrito.',
    'Contamos con abogados que atienden desde la conciliación previa hasta la ejecución de la sentencia, si es necesario.',
    'gavel',
    true,
    1,
    NOW(),
    NOW()
  ),
  (
    'ls-negociacion-y-conciliacion',
    'Negociación y conciliación jurídica',
    'negociacion-y-conciliacion-juridica',
    'Mediación y conciliación de conflictos para lograr acuerdos firmados que evitan pleitos y reducen la incertidumbre para las partes.',
    'Actuamos como neutral para propiciar acuerdos. Cuando el arreglo es posible, se documenta en un acta con la misma validez de un acuerdo formal.',
    'handshake',
    true,
    2,
    NOW(),
    NOW()
  ),
  (
    'ls-acciones-de-tutela',
    'Acciones de tutela',
    'acciones-de-tutela',
    'Tramitamos y sustentamos acciones de tutela y habeas corpus para la protección inmediata de tus derechos fundamentales.',
    'Evaluamos si tu caso procede, preparamos la solicitud con los hechos y las normas aplicables, y la radicamos ante el juez competente. También atendemos las impugnaciones y el desacato.',
    'shield',
    true,
    3,
    NOW(),
    NOW()
  ),
  (
    'ls-derechos-de-peticion',
    'Derechos de petición',
    'derechos-de-peticion',
    'Radicar y responder derechos de petición y de información con respuesta de fondo, en los plazos que exige la ley.',
    'Redactamos, radicamos y respondemos peticiones, solicitudes y escritos, para que recibas respuestas claras y oportunas.',
    'file-text',
    true,
    4,
    NOW(),
    NOW()
  ),
  (
    'ls-estudio-de-titulos',
    'Estudio de títulos',
    'estudio-de-titulos',
    'Revisamos la situación jurídica del inmueble: tradición, gravámenes, hipotecas, posesiones y afectaciones, antes de firmar.',
    'Entregamos un concepto claro sobre la titularidad, las cargas y los riesgos que pueden afectar la operación, con recomendaciones para reducir su impacto.',
    'filesearch',
    true,
    5,
    NOW(),
    NOW()
  ),
  (
    'ls-cobro-de-cartera',
    'Cobro de cartera',
    'cobro-de-cartera',
    'Gestión y cobro de cartera con acuerdos de pago y, cuando es necesario, acciones judiciales.',
    'Analizamos la viabilidad del cobro, proponemos alternativas de pago y sustentamos el proceso judicial si se requiere.',
    'coins',
    true,
    6,
    NOW(),
    NOW()
  ),
  (
    'ls-auditoria-y-revision',
    'Auditoría y revisión jurídica',
    'auditoria-y-revision-juridica',
    'Revisamos contratos, documentos y procesos para detectar riesgos y cláusulas desfavorables antes de que se firmen.',
    'Auditoría integral de tu operación o de tu cartera, señalando los riesgos y los ajustes posibles al instrumento.',
    'filetext',
    true,
    7,
    NOW(),
    NOW()
  ),
  (
    'ls-estudio-de-riesgo',
    'Estudio de riesgo jurídico',
    'estudio-de-riesgo-juridico',
    'Analizamos el riesgo legal de una operación inmobiliaria y te entregamos un mapa claro de las contingencias.',
    'Identificamos los puntos críticos del negocio y las contingencias que pueden surgir, con un plan de mitigación para cada una.',
    'book',
    true,
    8,
    NOW(),
    NOW()
  )
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "content" = EXCLUDED."content",
  "icon" = EXCLUDED."icon",
  "active" = EXCLUDED."active",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = NOW();

COMMIT;

-- Verificación opcional:
-- SELECT "sortOrder", "title", "active" FROM "LegalService" ORDER BY "sortOrder";
