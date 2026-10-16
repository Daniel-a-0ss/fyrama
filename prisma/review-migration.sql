-- ============================================================================
-- Fyrama — tabla de opiniones de clientes
-- ----------------------------------------------------------------------------
-- Solo sentencias ADITIVAS: no modifica ni borra datos existentes.
-- Ejecutar UNA SOLA VEZ en la base de datos de PostgreSQL de producción.
--
-- Desde Vercel:  Projecto fyrama > Storage > Postgres > pestana "Data"
--                (o la consola de Neon) > pegar este bloque > Run
--
-- Es idempotente: si se ejecuta dos veces no falla.
-- ============================================================================

-- 1) Estado de la opinión (moderación)
DO $$
BEGIN
  CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- 2) Tabla de opiniones
CREATE TABLE IF NOT EXISTS "Review" (
  "id"         TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "rating"     INTEGER NOT NULL DEFAULT 5,
  "title"      TEXT,
  "content"    TEXT NOT NULL,
  "status"     "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  "ipAddress"  TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  "approvedAt" TIMESTAMP(3),
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- 3) Índice del panel de moderación
CREATE INDEX IF NOT EXISTS "Review_status_createdAt_idx"
  ON "Review" ("status", "createdAt");

-- 4) Nuevas acciones de auditoría (aprobar / rechazar / borrar opinión)
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'APPROVE_REVIEW';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'REJECT_REVIEW';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DELETE_REVIEW';

-- ---------------------------------------------------------------------------
-- Verificación (debe devolver 1 y 3):
--   SELECT count(*) FROM information_schema.tables
--     WHERE table_name = 'Review';
--   SELECT count(*) FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
--     WHERE t.typname = 'ReviewStatus';
-- ---------------------------------------------------------------------------
