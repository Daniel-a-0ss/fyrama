# Modelo de datos

Schema Prisma: `prisma/schema.prisma`. Generación de tablas: `npm run db:push` (sin migraciones; para producciones grandes usar migraciones).

## Modelos

### Seguridad / identidad
- **User**: `id` (cuid), `email` (único), `name`, `passwordHash`, `role` (`ADMIN|EDITOR`), `active`, `lastLoginAt`, timestamps.
- **Session**: `id`, `tokenHash` (único), `userId`, `expiresAt`, timestamps.

### Catálogo
- **Property**: `id`, `title`, `slug` (único), `description`, `operation` (`VENTA|ARRIENDO`), `type`, `price`, `currency`, `status` (`DRAFT|PUBLISHED|HIDDEN`), `featured`, `city`, `zone`, `neighborhood`, `address`, `latitude`, `longitude`, `area`, `builtArea`, `bedrooms`, `bathrooms`, `parking`, `estrato`, `features` (JSON array), `deletedAt` (baja lógica).
- **PropertyImage**: puente `propertyId` ⇄ `mediaAssetId`, `isCover`, `sortOrder`, `alt`.
- **PropertyFeature**: puente `propertyId` ⇄ nombre de característica (se mantiene para queries `some: { name }`).
- **MediaAsset**: archivo subido: `url`, `thumbUrl`, `variants` (JSON `{width: url}`), `kind` (`PROPERTY|ARTICLE|GENERAL`), `alt`, `deletedAt`. Se leen las dimensiones al subir.

### Contenido
- **Article**: `id`, `title`, `slug` (único), `excerpt`, `content` (Markdown), `status` (`DRAFT|PUBLISHED`), `author`, `publishedAt`, `coverMediaId`, `coverAlt`, `categoryId`, `seoTitle`, `metaDescription`.
- **ArticleCategory**: `name`, `slug` (único). Relación 1-N con Article.

### Asesoría
- **LegalService**: `title`, `slug` (único), `description`, `content` (Markdown), `icon`, `active`, `sortOrder`.

### Contacto
- **ContactRequest**: `type` (`PROPERTY|LEGAL|GENERAL`), `name`, `email`, `phone`, `message`, `propertyId?`, `legalTopic?`, `contactPreference?`, `status` (`NEW|CONTACTED|CLOSED`), `ipAddress`.

### Sistema
- **AuditLog**: `action`, `userId?`, `entityType`, `entityId`, `details` (JSON), `ipAddress`, `userAgent`.
- **SiteSetting**: `key` (único), `value`. Los defaults viven en `src/lib/services/settings.ts` (`DEFAULT_SETTINGS`) y se resuelven con `mergeSettings`.
- **CityLanding**: página de ciudad aterrizaje (reservada para futuras landing por ciudad).

## Reglas de integridad relevantes

- `Property.deletedAt` (baja lógica): el catálogo público filtra `deletedAt: null`; el admin también.
- Las imágenes en uso no se borran físicamente: `DELETE /api/admin/media/:id` consulta `_count` de usos.
- Timeline: `createdAt`/`updatedAt` gestionados por Prisma; `User.lastLoginAt` se actualiza en cada login.

## Índices recomendados (producción)

Los índices principales ya existen por claves únicas (`slug`, `email`, `tokenHash`) y por las claves foráneas que Prisma crea automáticamente. Para volúmenes altos, añadir índices compuestos para los filtros más usados del catálogo (`operation + status + deletedAt`, `city`).