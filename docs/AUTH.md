# Autenticación y seguridad

## Sesiones

Fyrama usa cookies de sesión propias (sin librerías externas).

- **Cookie**: `fyrama_session`.
- **Formato del token**: 64 caracteres hex aleatorios (`randomBytes(32)`).
- **Almacenamiento**: solo `tokenHash` (SHA-256) en `Session`; el token nunca se guarda en texto plano en BD.
- **Cookie**: `HttpOnly; SameSite=Strict; Path=/; Max-Age=43200` (12 h, configurable con `SESSION_MAX_AGE_HOURS`). En producción (`NODE_ENV=production`) se añade `Secure`.
- **Expiración**: al leer, si `expiresAt <= now` se borra la sesión. También se revocan todas las sesiones de un usuario al desactivarlo o eliminar su cuenta.

`src/lib/auth/session.ts` expone: `createSession`, `getSessionByToken`, `getSessionFromRequest` (route handlers), `getSessionFromCookies` (server components), `destroySession`, `requireAuth`.

## Contraseñas

- Hash **bcrypt** con 12 rondas (`src/lib/auth/password.ts`).
- Política mínima: ≥ 10 caracteres, minúscula, mayúscula y número.

## CSRF

Doble mitigación (defensa en profundidad):

1. Cookies `SameSite=Strict` (el navegador no las envía en peticiones cross-site).
2. Cabecera `x-fyrama-csrf: fyrama-validated` o misma-origen (`Origin`/`Referer`), verificada por `assertSameOrigin`/`requireAdmin` en cada mutación.

El cliente (`src/lib/client/api.ts`) añade automáticamente la cabecera CSRF.

## Autorización por rol

Roles: `ADMIN` (todo) y `EDITOR` (documentos, medios, solicitudes, asesoría; **no** usuarios ni auditoría).

- Se aplica SIEMPRE en backend: `requireAdmin(request, { role: "ADMIN" })` y en páginas `session.user.role !== "ADMIN" → redirect`.
- El layout del panel redirige a `/admin/login` sin sesión.
- Cambios de rol y guardas contra eliminar al último ADMIN / a uno mismo están en `src/lib/auth/admin.ts` y `src/app/api/admin/users/**`.

## Rate limiting

Límites en memoria (`src/lib/security/rate-limit.ts`, sliding window):

| Limiter | Ventana | Máximo | Uso |
| --- | --- | --- | --- |
| `loginLimiter` | 15 min | 5 por cuenta | fuerza bruta |
| `loginAttemptLimiter` | 1 min | 10 por IP | login |
| `contactLimiter` | 10 min | `CONTACT_RATE_LIMIT_MAX` (5) por IP | contacto |
| `uploadLimiter` | 1 min | 30 por IP | subida de imágenes |

> En multipas producción, sustituir el `Map` por un store compartido (Redis) manteniendo la misma interfaz.

## Cabeceras de seguridad

`src/lib/security/headers.ts`, aplicadas en `src/middleware.ts`:
CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `X-XSS-Protection` (descontinuada) y **HSTS** cuando `NODE_ENV=production`.

## Auditoría

`src/lib/audit.ts` + tabla `AuditLog`. Todas las mutaciones administrativas quedan con quién, cuándo, IP, user-agent y detalle (con contraseñas excluidas). Solo visible para ADMIN (`/admin/auditoria`, `GET /api/admin/audit`).

## Honeypot en contacto

El campo oculto `company` en el formulario de contacto es trampa anti-bots: si viene relleno, la validación falla y no se guarda nada.