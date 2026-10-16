-- ============================================================================
-- Fyrama — servicios inmobiliarios: tabla editable desde el panel de administración
-- ----------------------------------------------------------------------------
-- Los servicios de /servicios-inmobiliarios estaban escritos en el código, así
-- que no se podían agregar, editar ni eliminar. Este script crea la tabla y
-- siembra los 14 servicios que ya se veían en el sitio, para que el contenido
-- no cambie al hacer el despliegue.
--
-- Es idempotente: se puede ejecutar las veces que sea necesario.
--
-- Desde Vercel:  Proyecto fyrama > Storage > Postgres > pestaña "Data"
--                (o la consola de Neon) > pegar este bloque > Run
-- ============================================================================

BEGIN;

-- 1) Crear la tabla si no existe.
CREATE TABLE IF NOT EXISTS "RealEstateService" (
  "id"        TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "slug"      TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "content"   TEXT NOT NULL DEFAULT '',
  "icon"      TEXT,
  "href"      TEXT,
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RealEstateService_pkey" PRIMARY KEY ("id")
);

-- 2) Índice único del slug (mismo comportamiento que LegalService).
CREATE UNIQUE INDEX IF NOT EXISTS "RealEstateService_slug_key"
  ON "RealEstateService"("slug");

-- 3) Sembrar los 14 servicios actuales.
INSERT INTO "RealEstateService" ("id", "title", "slug", "description", "content", "icon", "href", "active", "sortOrder", "createdAt", "updatedAt")
VALUES
  (
    'ri-inmuebles-en-venta',
    'Inmuebles en venta',
    'inmuebles-en-venta',
    'Casas, apartamentos, lotes, oficinas y locales en venta, con asesoría integral para comprar o vender tu inmueble.',
    '',
    'home',
    '/viviendas?operacion=venta',
    true, 0, NOW(), NOW()
  ),
  (
    'ri-inmuebles-en-arrendamiento',
    'Inmuebles en arrendamiento',
    'inmuebles-en-arrendamiento',
    'Oferta verificada de arrendamientos con contratos revisados y acompañamiento desde la visita hasta la entrega del inmueble.',
    '',
    'key',
    '/viviendas?operacion=arriendo',
    true, 1, NOW(), NOW()
  ),
  (
    'ri-inmuebles-para-permutar',
    'Inmuebles para permutar',
    'inmuebles-para-permutar',
    'Selección de inmuebles disponibles para permuta y asesoría para valorar, negociar y formalizar el cambio de inmueble.',
    '',
    'repeat',
    '/permuta',
    true, 2, NOW(), NOW()
  ),
  (
    'ri-negociacion-de-inmuebles',
    'Asesoría en negociación de inmuebles',
    'negociacion-de-inmuebles',
    'Acompañamiento en cada etapa de la negociación: ofertas, contrapuestas y acuerdos con respaldo profesional.',
    '',
    'handshake',
    '',
    true, 3, NOW(), NOW()
  ),
  (
    'ri-estudio-juridico',
    'Estudio jurídico de inmuebles',
    'estudio-juridico',
    'Revisión del certificado de tradición y libertad, gravámenes, hipotecas y situación jurídica del inmueble.',
    '',
    'filesearch',
    '',
    true, 4, NOW(), NOW()
  ),
  (
    'ri-promesas-y-contratos',
    'Elaboración de promesas y contratos inmobiliarios',
    'promesas-y-contratos',
    'Redacción y revisión de promesas de compraventa y contratos de arrendamiento a medida de tu operación.',
    '',
    'penline',
    '',
    true, 5, NOW(), NOW()
  ),
  (
    'ri-administracion-contratos',
    'Administración de contratos de arrendamiento',
    'administracion-contratos',
    'Gestión de contratos, cánones, renovaciones, cláusulas y requerimientos legales del arrendamiento.',
    '',
    'filetext',
    '',
    true, 6, NOW(), NOW()
  ),
  (
    'ri-administracion-gestion',
    'Administración y gestión inmobiliaria',
    'administracion-gestion',
    'Administramos tus inmuebles: control de ingresos, mantenimientos, pagos y gestión con arrendatarios.',
    '',
    'building',
    '',
    true, 7, NOW(), NOW()
  ),
  (
    'ri-inversion-inmobiliaria',
    'Asesoría en inversión inmobiliaria',
    'inversion-inmobiliaria',
    'Análisis de mercado, rentabilidad y valorización para invertir en inmueble con criterio y seguridad.',
    '',
    'trending',
    '',
    true, 8, NOW(), NOW()
  ),
  (
    'ri-saneamiento-juridico',
    'Saneamiento jurídico de inmuebles',
    'saneamiento-juridico',
    'Regularización de títulos, superación de vicios y trámites para dejar tu inmueble en orden legal.',
    '',
    'badgecheck',
    '',
    true, 9, NOW(), NOW()
  ),
  (
    'ri-tramites-notariales',
    'Trámites notariales y registrales',
    'tramites-notariales',
    'Coordinación de escrituras, registro, tradición y demás trámites ante notarías y registro de instrumentos públicos.',
    '',
    'stamp',
    '',
    true, 10, NOW(), NOW()
  ),
  (
    'ri-marketing-publicidad',
    'Marketing y publicidad inmobiliaria',
    'marketing-publicidad',
    'Publicación profesional de tu inmueble en portales y redes para llegar a los compradores y arrendatarios correctos.',
    '',
    'megaphone',
    '',
    true, 11, NOW(), NOW()
  ),
  (
    'ri-subsidios-y-creditos',
    'Subsidios y créditos inmobiliarios',
    'subsidios-y-creditos',
    'Acompañamiento integral en la gestión de subsidios de inmueble y créditos hipotecarios o de leasing.',
    '',
    'piggybank',
    '',
    true, 12, NOW(), NOW()
  ),
  (
    'ri-avaluo-y-peritaje',
    'Avalúo y peritaje de inmuebles',
    'avaluo-y-peritaje',
    'Avalúos comerciales y peritajes técnicos del inmueble para negociar, invertir o resolver controversias.',
    '',
    'ruler',
    '',
    true, 13, NOW(), NOW()
  )
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "icon" = EXCLUDED."icon",
  "href" = EXCLUDED."href",
  "active" = EXCLUDED."active",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = NOW();

COMMIT;

-- Verificación opcional:
-- SELECT "sortOrder", "title", "active" FROM "RealEstateService" ORDER BY "sortOrder";
