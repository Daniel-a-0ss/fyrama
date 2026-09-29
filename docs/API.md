# API REST

Todas las rutas viven en `src/app/api/**` y devuelven un contrato uniforme:

```jsonc
// Éxito
{ "ok": true, "data": { ... } }

// Error
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { … } } }
```

Códigos de error comunes: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403),
`CSRF_FAILED` (403), `RATE_LIMITED` (429), `VALIDATION_ERROR` (422), `INTERNAL_ERROR` (500).

## Autenticación en mutaciones

Todas las rutas que mutan estado exigen CSRF: cabecera `x-fyrama-csrf: fyrama-validated`
o misma-origen (Origin/Referer idéntico al host). El login no necesita sesión previa;
los contenido JSON se envían con `Content-Type: application/json`.

## Públicas

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/login` | `{email, password}` → `{user}` + cookie `fyrama_session` |
| POST | `/api/auth/logout` | Cierra la sesión actual |
| GET | `/api/auth/me` | `{user}` o `{user: null}` (no lanza error si no hay sesión) |
| POST | `/api/auth/change-password` | `{currentPassword, newPassword}` (autenticado) |
| POST | `/api/contact` | Crea una solicitud de contacto (ver más abajo) |
| GET | `/api/filters` | Valores disponibles para los filtros del catálogo |
| GET | `/api/properties` | Lista de viviendas (mismos filtros que `/viviendas`) |
| GET | `/api/properties/:slug` | Detalle de vivienda publicado |
| GET | `/api/articles` | Artículos publicados |
| GET | `/api/articles/:slug` | Detalle de artículo |
| GET | `/api/legal-services` | Servicios de asesoría activos |

### POST /api/contact

Body: `{type?, name, email, phone?, message, propertyId?, legalTopic?, contactPreference?, company?}`.
- `company` es un honeypot (debe quedar vacío); si llega relleno, se rechaza la validación.
- Rate limit: `CONTACT_RATE_LIMIT_MAX` solicitudes por IP cada 10 min.
- Guarda `ipAddress` (de `X-Forwarded-For`/`X-Real-IP`).
- `propertyId` referencia una vivienda existente (opcional).

## Admin (todas exigen `requireAdmin`)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET/POST | `/api/admin/properties` | Listar/crear viviendas |
| GET/PUT/DELETE | `/api/admin/properties/:id` | Leer/actualizar/borrar (baja lógica) |
| PUT | `/api/admin/properties/:id/images` | Reordenar y fijar portada |
| GET/POST | `/api/admin/articles` | Listar/crear artículos |
| GET/PUT/DELETE | `/api/admin/articles/:id` | CRUD de artículo |
| GET/POST | `/api/admin/categories` | Listar/crear categorías |
| PUT/DELETE | `/api/admin/categories/:id` | Actualizar/eliminar categoría |
| GET/POST | `/api/admin/legal-services` | Listar/crear servicios |
| GET/PUT/DELETE | `/api/admin/legal-services/:id` | CRUD de servicio |
| GET/POST | `/api/admin/media` | Listar/subir imágenes (multipart) |
| GET/DELETE | `/api/admin/media/:id` | Ver/eliminar asset (bloqueado si está en uso) |
| GET | `/api/admin/requests` | Listar solicitudes de contacto |
| PATCH/DELETE | `/api/admin/requests/:id` | Cambiar estado / eliminar solicitud |
| GET/POST | `/api/admin/users` | Listar/crear usuarios (rol ADMIN) |
| GET/PUT/DELETE | `/api/admin/users/:id` | CRUD usuario; protege último ADMIN y auto-eliminación |
| GET/PUT | `/api/admin/settings` | Leer/actualizar `SiteSetting` |
| GET | `/api/admin/stats` | Conteos para el dashboard |
| GET | `/api/admin/audit` | Registro de auditoría (rol ADMIN) |

### Subida de imágenes (`POST /api/admin/media`)

`multipart/form-data` con uno o varios `file` y `kind` (`PROPERTY | ARTICLE | GENERAL`).
Genera variantes (`320/480/800/1200/1600`) con sharp y devuelve los assets. Rate limitado.

## Convenciones

- Las rutas públicas de listado aceptan `page`/`limit` y en el caso de propiedades los mismos
  filtros que la UI (`operacion`, `ciudad`, `zona`, `barrio`, `tipo`, `precio_min`,
  `precio_max`, `habitaciones`, `banos`, `area_min`, `area_max`, `parqueaderos`, `estrato`, `caracteristicas`).
- Las rutas admin nunca devuelven `passwordHash` ni `tokenHash`.