# Testing

Suite **Vitest + Testing Library** (jsdom para componentes).

## Comandos

```bash
npm test          # ejecución única
npm run test:watch
```

## Estructura

```
tests/
├─ global-setup.ts      prepara la BD de prueba (prisma/test.db) y un usuario ADMIN
├─ seed-test-db.mjs     seed mínimo para la base de pruebas
├─ utils.test.ts        helpers puros (slugify, formato, IP, srcset…)
├─ csrf.test.ts         assertSameOrigin / hasCsrfToken
├─ session.test.ts      tokenFromRequest, hashing, cookie header + Secure en prod
├─ validation.test.ts   schemas Zod (auth, contacto, inmueble, artículo, usuario…)
├─ search.test.ts       normalizeSearchParams, buildWhereClause/buildOrderBy
├─ api-guards.test.ts   requireAdmin: CSRF, 401/403 (requiere BD)
├─ contact-api.test.ts  POST /api/contact: persistencia, IP, honeypot, rate-limit
└─ pagination.test.tsx  componentes Pagination y StatusBadge (jsdom)
```

## Cómo se aísla la BD

- `vitest.config.mts` inyecta `DATABASE_URL=file:./test.db` y `NODE_ENV=test` en los workers.
- `global-setup` recrea `prisma/test.db` (vacía cada corrida), aplica el schema con
  `prisma db push` y siembra `admin@test.fyrama`.
- Los tests que tocan Prisma importan los route handlers reales y leen/escriben en esa BD
  local. Se elimina al terminar.
- `fileParallelism: false` evita escrituras concurrentes en SQLite.

## Añadir tests

1. Nombra el archivo `tests/*.test.ts` (o `.tsx` para componentes).
2. Para componentes añade el docblock `// @vitest-environment jsdom` y usa
   `@testing-library/react` + `afterEach(cleanup)`.
3. Si la ruta/admin usa `requireAdmin`, basta con una Request construida en memoria;
   para probar autorización real contra la BD usa `admin@test.fyrama` / `AdminPrueba!2026`
   (definida en `tests/seed-test-db.mjs`).

## Cobertura esperada en un PR

- Cualquier cambio en `src/lib/validation`, `src/lib/search`, `src/lib/auth` o cabeceras de
  seguridad debería ir acompañado de tests unitarios.
- Cualquier cambio en un route handler con lógica de negocio (contacto, admin) → test de API.