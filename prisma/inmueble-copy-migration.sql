-- ============================================================================
-- Fyrama — «vivienda» -> «inmueble» en los contenidos ya sembrados
-- ----------------------------------------------------------------------------
-- El texto visible del sitio vive en dos sitios:
--   1) código fuente  -> ya cambiado y desplegado
--   2) base de datos  -> este script (el seed NO se reejecuta en producción)
--
-- Recorre cada columna de prosa y aplica la misma cadena de sustituciones que
-- se aplicó al código, en el mismo orden:
--   a) las palabras        (vivienda -> inmueble)
--   b) los artículos       (la -> el, las -> los, una -> un, esta -> este)
--   c) las contracciones   (de la -> del, a la -> al)  [antes que (b)]
--   d) la concordancia     (nueva -> nuevo, creada -> creado, publicadas -> ...)
--
-- No toca slug, path, href, citySlug ni keys: ninguna URL cambia.
--
-- Es idempotente y solo escribe las filas que aún contengan «vivienda»
-- (aunque sea en mayúsculas), así que se puede ejecutar más de una vez.
--
-- Como PostgreSQL no permite triggers en tablas Prisma desde aquí, el cambio
-- no altera "updatedAt" (lo gestiona el cliente, no la base).
--
-- Desde Vercel:  Proyecto fyrama > Storage > Postgres > pestaña "Data" > Run
-- ============================================================================

DO $$
DECLARE
  -- Orden relevante: cada pareja se aplica sobre el resultado de la anterior.
  pairs TEXT[][] := ARRAY[
    -- 1) palabras
    ARRAY['viviendas',   'inmuebles'],
    ARRAY['Viviendas',   'Inmuebles'],
    ARRAY['VIVIENDAS',   'INMUEBLES'],
    ARRAY['vivienda',    'inmueble'],
    ARRAY['Vivienda',    'Inmueble'],
    ARRAY['VIVIENDA',    'INMUEBLE'],
    -- 2) contracciones (antes de "la" suelto, para no dejar "de el")
    ARRAY['de la inmueble', 'del inmueble'],
    ARRAY['De la inmueble', 'Del inmueble'],
    ARRAY['a la inmueble',  'al inmueble'],
    ARRAY['A la inmueble',  'Al inmueble'],
    -- 3) artículos y pronombres
    ARRAY['la inmueble',          'el inmueble'],
    ARRAY['La inmueble',          'El inmueble'],
    ARRAY['las inmuebles',        'los inmuebles'],
    ARRAY['Las inmuebles',        'Los inmuebles'],
    ARRAY['una inmueble',         'un inmueble'],
    ARRAY['Una inmueble',         'Un inmueble'],
    ARRAY['unas inmuebles',       'unos inmuebles'],
    ARRAY['Unas inmuebles',       'Unos inmuebles'],
    ARRAY['esta inmueble',        'este inmueble'],
    ARRAY['Esta inmueble',        'Este inmueble'],
    ARRAY['estas inmuebles',      'estos inmuebles'],
    ARRAY['Estas inmuebles',      'Estos inmuebles'],
    ARRAY['esta inmuebles',       'estos inmuebles'],
    ARRAY['Esta inmuebles',       'Estos inmuebles'],
    ARRAY['todas las inmuebles',  'todos los inmuebles'],
    ARRAY['Todas las inmuebles',  'Todos los inmuebles'],
    ARRAY['toda la inmueble',     'todo el inmueble'],
    ARRAY['Toda la inmueble',     'Todo el inmueble'],
    ARRAY['alguna inmueble',      'algún inmueble'],
    ARRAY['Alguna inmueble',      'Algún inmueble'],
    ARRAY['algunas inmuebles',    'algunos inmuebles'],
    ARRAY['Algunas inmuebles',    'Algunos inmuebles'],
    -- 4) concordancia de número
    ARRAY['nuevas inmuebles',     'nuevos inmuebles'],
    ARRAY['Nuevas inmuebles',     'Nuevos inmuebles'],
    ARRAY['nueva inmueble',       'nuevo inmueble'],
    ARRAY['Nueva inmueble',       'Nuevo inmueble'],
    ARRAY['inmuebles nueva y usada', 'inmuebles nuevos y usados'],
    ARRAY['inmueble nueva y usada',  'inmueble nuevo y usado'],
    ARRAY['inmueble nueva',       'inmueble nuevo'],
    ARRAY['Inmueble nueva',       'Inmueble nuevo'],
    ARRAY['inmuebles vieja',      'inmuebles viejos'],
    -- 5) adjetivos en femenino
    ARRAY['inmueble creada',      'inmueble creado'],
    ARRAY['Inmueble creada',      'Inmueble creado'],
    ARRAY['inmueble actualizada', 'inmueble actualizado'],
    ARRAY['Inmueble actualizada', 'Inmueble actualizado'],
    ARRAY['inmueble eliminada',   'inmueble eliminado'],
    ARRAY['Inmueble eliminada',   'Inmueble eliminado'],
    ARRAY['inmueble publicada',   'inmueble publicado'],
    ARRAY['Inmueble publicada',   'Inmueble publicado'],
    ARRAY['inmueble guardada',    'inmueble guardado'],
    ARRAY['Inmueble guardada',    'Inmueble guardado'],
    ARRAY['inmueble asociada',    'inmueble asociado'],
    ARRAY['Inmueble asociada',    'Inmueble asociado'],
    ARRAY['inmueble encontrada',  'inmueble encontrado'],
    ARRAY['Inmueble encontrada',  'Inmueble encontrado'],
    ARRAY['inmuebles publicadas', 'inmuebles publicados'],
    ARRAY['Inmuebles publicadas', 'Inmuebles publicados']
  ];

  -- Tabla y columna de prosa. NUNCA slug / path / href / citySlug / keys.
  regs   RECORD;
  expr   TEXT;
  j      INT;
BEGIN
  FOR regs IN
    SELECT * FROM (VALUES
      ('Article',          'title'),
      ('Article',          'excerpt'),
      ('Article',          'content'),
      ('Article',          'coverAlt'),
      ('Article',          'seoTitle'),
      ('Article',          'metaDescription'),
      ('ArticleCategory',  'name'),
      ('Property',         'title'),
      ('Property',         'description'),
      ('Property',         'zone'),
      ('Property',         'neighborhood'),
      ('Property',         'address'),
      ('RealEstateService','title'),
      ('RealEstateService','description'),
      ('RealEstateService','content'),
      ('LegalService',     'title'),
      ('LegalService',     'description'),
      ('LegalService',     'content'),
      ('CityLanding',      'cityName'),
      ('CityLanding',      'title'),
      ('CityLanding',      'intro'),
      ('CityLanding',      'body'),
      ('Review',           'name'),
      ('Review',           'title'),
      ('Review',           'content'),
      ('ContactRequest',   'message')
    ) AS v(tabla, columna)
  LOOP
    expr := format('%I', regs.columna);
    FOR j IN 1 .. array_length(pairs, 1) LOOP
      expr := format('REPLACE(%s, %L, %L)', expr, pairs[j][1], pairs[j][2]);
    END LOOP;

    EXECUTE format(
      'UPDATE %I SET %I = %s WHERE %I ILIKE %L',
      regs.tabla, regs.columna, expr, regs.columna, '%vivienda%'
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Verificación: todas estas consultas deben devolver 0.
-- ---------------------------------------------------------------------------
SELECT 'Article'           AS tabla, count(*) FROM "Article"
  WHERE title ILIKE '%vivienda%' OR excerpt ILIKE '%vivienda%'
     OR content ILIKE '%vivienda%' OR "coverAlt" ILIKE '%vivienda%'
     OR "seoTitle" ILIKE '%vivienda%' OR "metaDescription" ILIKE '%vivienda%';
SELECT 'ArticleCategory'   AS tabla, count(*) FROM "ArticleCategory"
  WHERE name ILIKE '%vivienda%';
SELECT 'Property'          AS tabla, count(*) FROM "Property"
  WHERE title ILIKE '%vivienda%' OR description ILIKE '%vivienda%'
     OR zone ILIKE '%vivienda%' OR neighborhood ILIKE '%vivienda%'
     OR address ILIKE '%vivienda%';
SELECT 'RealEstateService' AS tabla, count(*) FROM "RealEstateService"
  WHERE title ILIKE '%vivienda%' OR description ILIKE '%vivienda%'
     OR content ILIKE '%vivienda%';
SELECT 'LegalService'      AS tabla, count(*) FROM "LegalService"
  WHERE title ILIKE '%vivienda%' OR description ILIKE '%vivienda%'
     OR content ILIKE '%vivienda%';
SELECT 'CityLanding'       AS tabla, count(*) FROM "CityLanding"
  WHERE "cityName" ILIKE '%vivienda%' OR title ILIKE '%vivienda%'
     OR intro ILIKE '%vivienda%' OR body ILIKE '%vivienda%';
SELECT 'Review'            AS tabla, count(*) FROM "Review"
  WHERE name ILIKE '%vivienda%' OR title ILIKE '%vivienda%'
     OR content ILIKE '%vivienda%';
SELECT 'ContactRequest'    AS tabla, count(*) FROM "ContactRequest"
  WHERE message ILIKE '%vivienda%';
