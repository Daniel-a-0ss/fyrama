# Producción

Pasos y checklist para desplegar Fyrama en producción.

## 1. Base de datos

SQLite sirve para desarrollo/demo. En producción usar **PostgreSQL**:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/fyrama?schema=public"
```

Aplicar el schema:

```bash
npm i
npm run db:generate
# o migraciones gestionadas:
npx prisma migrate deploy
```

Para una instalación limpia, cargar el contenido inicial ejecutando el seed una única vez (
`npm run db:seed`) y luego **cambiar** las credenciales del administrador semilla.

## 2. Variables de entorno

Documentadas en `.env.example`. Las críticas:

- `SESSION_SECRET` — generar con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Se usa para sesión.
- `NEXT_PUBLIC_SITE_URL` — https://dominio.tld (canonical/sitemap/OG).
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — solo aplican al primer seed.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — captcha de Cloudflare (opcional; vacío = desactivado).
- `CONTACT_RATE_LIMIT_MAX` — anti-spam de contacto.
- `MAP_PROVIDER` — `osm` por defecto (`src/lib/map.ts`).

## 3. HTTPS y cookie `Secure`

La sesión usa `HttpOnly; SameSite=Strict; Secure` en producción. **HTTPS es obligatorio**:
si el servidor es HTTP, la cookie de sesión no funcionará.

Vías habituales:

- **Plataforma (Vercel/Cloudflare Pages)**: terminación TLS automática. `NODE_ENV=production`.
- **VPS**: proxy inverso Nginx/Caddy con certificado Let's Encrypt y reenvío de cabeceras:

```nginx
proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Host            $host;
proxy_pass http://127.0.0.1:3000;
```

> `getClientIp` confía en `X-Forwarded-For`; solo acepte esas cabeceras desde el proxy.

## 4. Build y arranque

```bash
npm run build
npm start   # puerto configurable con PORT
```

Supervisar el proceso (systemd/PM2/Docker). Los límites de rate-limit son **en memoria**:
en multipas/instancias múltiples, reemplazar `src/lib/security/rate-limit.ts` por un store
compartido (Redis) manteniendo la misma interfaz (`allow/remaining/reset`).

## 5. Almacenamiento de imágenes

`public/media/` debe vivir en almacenamiento persistente:
- volumen Docker, disco del VPS, o un bucket CDN; y
- mantenga el `NEXT_PUBLIC_SITE_URL` apuntando al origen que sirva `/media/**`.

No borre `public/media/` en los deploys, o las URLs de `MediaAsset` quedarán rotas.

## 6. Optimizaciones / madurez

- Añadir migraciones Prisma (`prisma migrate`) para cambios futuros de schema.
- SSL a nivel de BD de ser posible; backups de PostgreSQL programados.
- Compatir `CONTACT_RATE_LIMIT_MAX` con un captcha (Cloudflare Turnstile ya soportado).
- Monitoreo (uptime + logs). El equipo de auth no depende de servicios externos.

## 7. Post-deploy

- Verificar: `/`, `/viviendas`, `/contacto`, `/admin/login`.
- Confirmar que la cookie `fyrama_session` llega con `Secure` y las cabeceras HSTS/CSP presentes.
- Comprobar `/api/contact` (rate limit) desde una IP externa.
- Revocar/rotar `SEED_ADMIN_PASSWORD` tras el primer login.