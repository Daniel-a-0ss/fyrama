# Fyrama

Plataforma inmobiliaria profesional para **Fyrama**, con catálogo de viviendas, blog de contenido, servicios de asesoría jurídica y un panel administrativo completo.

> Estado: v1 funcional. Sitio público terminado, backend REST y panel `/admin` completos.

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 15 (App Router, RSC, Server Actions) + React 19 |
| Lenguaje | TypeScript (strict) |
| Base de datos | Prisma 6 — SQLite (`file:./dev.db`) en desarrollo, PostgreSQL en producción |
| Estilos | Tailwind CSS v4 |
| Validación | Zod |
| Auth | Sesiones propias (cookie `fyrama_session`, bcrypt, CSRF) |
| Imágenes | sharp (variantes WebP/AVIF automáticas) |
| Contenido del blog / asesoría | Markdown (react-markdown + remark-gfm) |
| Testing | Vitest + Testing Library (pendiente completar) |

---

## Funcionalidades

### Sitio público
- **Viviendas**: listado con filtros (operación, ciudad, zona, barrio, tipo, precio, habitaciones, baños, área, parqueaderos, estrato, características), ordenamiento y paginación.
- **Detalle de vivienda**: galería, mapa (proveedor desacoplado), características, inmuebles relacionados, formulario de interés.
- **Blog**: listado, categorías, detalle con Markdown seguro.
- **Asesoría jurídica**: servicios y formulario de solicitud.
- **Contacto** con honeypot + rate-limiting, páginas legales, SEO (sitemap, robots, metadata, JSON-LD, Open Graph).

### Panel administrativo (`/admin`)
- Dashboard con estadísticas y última actividad.
- **Viviendas**: crear/editar (borrador → publicado), gestionar imágenes (subida a biblioteca, portada, orden), destacar, filtros por estado.
- **Contenido**: artículos del blog, categorías.
- **Asesoría jurídica**: CRUD de servicios.
- **Biblioteca de medios**: subida por arrastre, variantes automáticas, búsqueda por tipo, protección de imágenes en uso.
- **Solicitudes**: gestionar estado (nuevo → contactado → completado/archivado).
- **Usuarios** (solo ADMIN) y **auditoría** (solo ADMIN) con registro de actividad.
- **Configuración**: datos de contacto, SEO, aviso legal y cambio de contraseña.

### API REST (`/api`)
- Públicas: `auth/login|logout|me|change-password`, `contact`, `filters`, `properties`, `articles`, `legal-services`.
- Admin: CRUD de `properties`, `articles`, `categories`, `legal-services`, `media`, `requests`, `users`, `settings`, `stats`, `audit` — todas protegidas con sesión + CSRF + roles.

---

## Requisitos

- **Node.js ≥ 20**
- **npm**
- (Opcional, para imágenes) un entorno con soporte nativo de sharp

## Puesta en marcha (desarrollo local)

```bash
# 1. Instalar dependencias (ejecuta prisma generate en postinstall)
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Crear la base de datos (SQLite local)
npm run db:push

# 4. Sembrar datos demo (usuarios, viviendas, contenido, imágenes)
npm run db:seed

# 5. Levantar el servidor de desarrollo
npm run dev
```

Abre **http://localhost:3000** (el panel está en **http://localhost:3000/admin**).

> El paso 2 es opcional si no quieres personalizar: existe `.env` local con la configuración de desarrollo y los valores del seed por defecto.

### Credenciales del seed

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@fyrama.co` | `Fyrama!2026` |
| Editor | `editor@fyrama.co` | `Fyrama!2026` |

> El seed descarga imágenes de Unsplash (licencia libre) hacia `public/media/`. Si la descarga falla, genera placeholders SVG locales. Todo el contenido demo está marcado como tal.

---

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción (requiere `npm run build` previo) |
| `npm run lint` | ESLint (Next + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `npm run test:watch` | Tests Vitest |
| `npm run db:generate` | Regenera el cliente Prisma |
| `npm run db:push` | Aplica el schema a la base (`prisma db push`) |
| `npm run db:seed` | Ejecuta `node prisma/seed.mjs` |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (site)/                 # Páginas públicas (home, viviendas, blog, asesoría, contacto, legales)
│   ├── admin/
│   │   ├── login/              # Login del panel
│   │   └── (dashboard)/        # Panel admin (layout con guard de sesión + sidebar)
│   │       ├── viviendas/      # Listado, nueva vivienda, edición (con ImageManager)
│   │       ├── contenido/      # Artículos del blog + categorías
│   │       ├── asesoria/       # Servicios de asesoría jurídica
│   │       ├── media/          # Biblioteca de imágenes
│   │       ├── solicitudes/    # Solicitudes de contacto
│   │       ├── usuarios/       # Gestión de usuarios (ADMIN)
│   │       ├── auditoria/      # Registro de actividad (ADMIN)
│   │       └── configuracion/  # Ajustes del sitio + cambio de contraseña
│   ├── api/                    # REST: api/auth, api/contact, api/filters,
│   │                           # api/properties, api/articles, api/legal-services,
│   │                           # api/admin/... (CRUD protegidos)
│   ├── sitemap.ts              # Sitemap dinámico
│   └── robots.ts
├── components/
│   ├── admin/                  # PropertyForm, ArticleForm, MediaGallery, ImageManager,
│   │                           # MediaPicker, UsersManager, SettingsForm, DeleteButton, AdminSidebar…
│   ├── property/ · article/ · search/ · home/ · site/ · ui/ · seo/
├── lib/
│   ├── auth/                   # Sesiones, CSRF, requireAdmin, contraseñas
│   ├── services/               # property, search, settings, admin (slugs)
│   ├── security/               # rate-limit, cabeceras de seguridad
│   └── validation/             # Schemas Zod (enums tipados, single source of truth)
└── middleware.ts               # Cabeceras de seguridad (CSP, HSTS)
```

### Modelo de datos (Prisma)

`User`, `Session`, `Property` (+ `PropertyImage`, `PropertyFeature`, `MediaAsset`), `Article` (+ `ArticleCategory`), `LegalService`, `ContactRequest`, `AuditLog`, `SiteSetting`, `CityLanding`.

---

## Configuración

Todas las variables están documentadas en `.env.example`. Las principales:

- `DATABASE_URL` — SQLite en dev (`file:./dev.db`) o PostgreSQL en producción.
- `NEXT_PUBLIC_SITE_URL` — URL canónica (sitemap, Open Graph).
- `SESSION_SECRET` — clave para sesiones; genera una aleatoria en producción.
- `SESSION_MAX_AGE_HOURS` — duración de sesión (12 h por defecto).
- `SEED_ADMIN_*` — credenciales del administrador semilla (solo en el primer seed).
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — captcha de Cloudflare Turnstile (opcional; vacío = desactivado).
- `CONTACT_RATE_LIMIT_MAX` — máximo de solicitudes de contacto por IP / 10 min.
- `MAP_PROVIDER` — proveedor de mapas desacoplado (`src/lib/map.ts`).
- `NODE_ENV` — en producción, `"production"` activa HSTS + CSP estricta.

---

## Seguridad

- Contraseñas con **bcrypt** (nunca texto plano).
- Sesiones con token aleatorio de 32 bytes, hash SHA-256 en BD, cookie `HttpOnly; SameSite=Strict; Secure` en producción.
- **CSRF** en todas las rutas que mutan estado (`x-fyrama-csrf` o comprobación del mismo origen).
- Rate-limiting: login (por IP + por cuenta), contacto, subida de imágenes.
- Honeypot anti-bots en el formulario de contacto.
- Auditoría de acciones administrativas (quién, cuándo, IP, agente, detalle).
- Roles `ADMIN` / `EDITOR` con protección real en backend (nunca solo en el frontend).
- Cabeceras de seguridad vía middleware: CSP, HSTS (producción), X-Frame-Options, etc.
- Validación estricta de entrada con Zod en todas las rutas.

---

## Producción

```bash
npm run build
npm start          # en un proceso supervisado (systemd, PM2, contenedor…)
```

Recomendaciones:
1. Usa **PostgreSQL** y aplica el schema con `prisma db push` (o migraciones).
2. Paós HTTPS (proxy inverso Nginx/Caddy o plataforma como Vercel) — el cookie de sesión es `Secure`.
3. Ajusta `SESSION_SECRET`, credenciales de seed y `NEXT_PUBLIC_SITE_URL`.
4. `NODE_ENV=production` activa HSTS y la CSP estricta.
5. Sube imágenes por el panel de medios; `public/media/` debe persistirse en disco (volumen/almacenamiento).

---

## Notas de desarrollo

- **Windows / PowerShell**: usa `npm.cmd` (o `npx.cmd`) si `npm` no abre directamente.
- **Tests**: `npm test` (83 tests: helpers, CSRF/sesión, schemas de validación, búsqueda, guards de API, `/api/contact` y componentes). Preparan su propia BD de prueba (`prisma/test.db`) automáticamente. Detalles en `docs/TESTING.md`.
- El contenido del blog y de asesoría se escribe en Markdown y se renderiza de forma segura (sin HTML crudo).

## Documentación

- `docs/ARCHITECTURE.md` — capas, flujos y decisiones de diseño.
- `docs/API.md` — referencia completa de la API REST.
- `docs/AUTH.md` — sesiones, CSRF, roles, rate-limit y auditoría.
- `docs/DATABASE.md` — modelos de datos.
- `docs/PRODUCTION.md` — checklist de despliegue.
- `docs/ADMIN.md` — guía de uso del panel.
- `docs/TESTING.md` — cómo correr y añadir tests.