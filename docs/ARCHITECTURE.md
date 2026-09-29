# Arquitectura

Visión de alto nivel de cómo está organizado Fyrama. Complementa al README.

## Capas

```
┌─────────────────────────────────────────────────────────────┐
│  Cliente                                                      │
│  · Páginas públicas (SRC) y panel /admin                     │
│  · Componentes "use client" para interacción                 │
├─────────────────────────────────────────────────────────────┤
│  Next.js (App Router)                                        │
│  · Server Components leen la sesión y los datos              │
│  · Route handlers (/api/**) implementan la REST             │
│  · middleware.ts aplica cabeceras de seguridad               │
├─────────────────────────────────────────────────────────────┤
│  Servicios                                                  │
│  · src/lib/services (property, settings, engine de búsqueda) │
│  · src/lib/auth (sesiones, contraseñas, autorización)       │
│  · src/lib/security (CSRF, rate-limit, sanitize, headers)   │
├─────────────────────────────────────────────────────────────┤
│  Datos                                                       │
│  · Prisma ORM → SQLite (dev) / PostgreSQL (prod)            │
└─────────────────────────────────────────────────────────────┘
```

## Patrón de seguridad (defensa en profundidad)

1. **Middleware**: agrega CSP, HSTS (solo prod), X-Frame-Options y demás cabeceras al HTML.
2. **`requireAdmin`** en cada ruta administrativa: valida CSRF → sesión → rol. Nunca se confía en el frontend.
3. **Server Components** del panel: guard `getSessionFromCookies()` en su layout.
4. **CSRF**: cookies `SameSite=Strict` + cabecera `x-fyrama-csrf` en todas las mutaciones.
5. **Rate limiting** en login, contacto y subida de imágenes.

## Decisiones clave

- **Single source of truth de validación**: los enums de Zod en `src/lib/validation/schemas.ts` se usan en todas las rutas; campos/filtros nuevos deben añadirse ahí primero.
- **Búsqueda desacoplada**: `src/lib/search.ts` convierte query params → Prisma `where`/`orderBy`. Los filtros del público (`/viviendas?ciudad=…&operacion=…`) y del admin comparten la misma base.
- **Imágenes**: subida → variantes con sharp → `MediaAsset` con `url` + `variants` (srcset). La imagen se asocia a propiedades/articles mediante tablas puente. Se bloquea el borrado si un asset está en uso.
- **Auditoría**: cada mutación administrativa registra `AuditLog` (userId, acción, IP, user-agent, detalle) vía `src/lib/audit.ts`. El detalle nunca incluye contraseñas.
- **Slugs**: generados con `slugify` en `src/lib/utils.ts` (acentos → ASCII). Únicos por entidad (ver `src/lib/services/admin.ts`).

## Flujos principales

### Catálogo público
`/viviendas` → server component lee `searchParams`, los pasa por `normalizeSearchParams` → `normalizeQuery` → `buildWhereClause`/`buildOrderBy` → Prisma. Paginación + filtros laterales (desktop) y hoja inferior (mobile).

### Autenticación
POST `/api/auth/login` → verifica bcrypt → `createSession` (token aleatorio 32 bytes, guardado hasheado) → cookie `fyrama_session` → el resto de rutas usan `requireAuth`/`getSessionFromCookies`.

### Admin
`/admin/**` → layout verifica sesión y renderiza `AdminShell` (sidebar drawer en móvil). Páginas server + componentes `"use client"` que llaman a `/api/admin/**`.

## Estructura de carpetas

```
src/
├─ app/(site)/        páginas públicas
├─ app/admin/         panel (login + (dashboard))
├─ app/api/           REST (pública y admin)
├─ components/        admin, site, property, search, article, ui, seo, home
├─ lib/               auth, security, services, validation, client, utils…
└─ middleware.ts      cabeceras de seguridad
```

Ver también: `docs/API.md`, `docs/DATABASE.md`, `docs/AUTH.md`, `docs/TESTING.md`, `docs/PRODUCTION.md`, `docs/ADMIN.md`.