# VIBE_CODING.md — Bitácora Real de Desarrollo Guiado por IA

Este documento registra de forma verídica, cronológica e iterativa el proceso real de desarrollo de **FinTrack** (*Tus finanzas, bajo control*) bajo la metodología **Vibe Coding**. Ningún dato, error, prueba, commit o evidencia ha sido fabricado.

---

## Fase 01 — Planificación, Arquitectura e Instrucciones Permanentes

- **Identificador de fase:** `Fase 01`
- **Fecha real de ejecución:** `2026-11-26`
- **Prompt recibido:** [docs/prompts/001-master-planning.md](./docs/prompts/001-master-planning.md)
- **Objetivo:** Inspeccionar el entorno de forma no destructiva, validar compatibilidad del stack tecnológico y elaborar el Implementation Plan completo cubriendo arquitectura, modelo de datos, seguridad, rutas, APIs, diseño, pruebas y cumplimiento académico.
- **Decisiones técnicas:** `npm`, `vitest`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, borrado seguro de categorías con HTTP `409 Conflict`, `AGENTS.md` + `.agents/rules/fintrack-standards.md`.
- **Resultados verificables:** Workspace vacío verificado (`Node.js v22.19.0`, `npm 10.9.3`, `Git 2.43.0.windows.1`) e Implementation Plan aprobado por el supervisor.
- **Estado final:** **Completada y aprobada**.

---

## Fase 02 — Inicialización del Proyecto, Dependencias, Sistema de Diseño y Layouts

- **Identificador de fase:** `Fase 02`
- **Fecha real de ejecución:** `2026-11-26`
- **Prompt recibido:** [docs/prompts/002-initialization-and-design.md](./docs/prompts/002-initialization-and-design.md)
- **Walkthrough versionado:** [docs/walkthroughs/002-initialization-and-design.md](./docs/walkthroughs/002-initialization-and-design.md)
- **Implementaciones y validaciones:** Next.js `16.4.6`, React `19.3.0`, TypeScript `5.9.3` estricto, Tailwind CSS `4.3.3`, `shadcn/ui` (`base-nova`), `geist@1.9.2` autoalojada, sistema de diseño *Refined Emerald Fintech* WCAG AA, landing page `/`, formularios `/login` y `/register` con React Hook Form + Zod, AppShell responsive y 6 módulos preliminares sobre `src/lib/demo-data.ts`.
- **Resolución de pendientes visuales (completada al inicio de Fase 03):** Se incorporó `playwright@1.58.2` (`scripts/verify-phase-02.mjs` + `scripts/run-with-server.mjs`) usando una instancia aislada de navegador para verificar las 9 rutas en 7 resoluciones (`1920x1080` a `360x800`), detectar y corregir 2 desbordamientos horizontales en `/` (`768x1024` y `360x800`) y la ausencia de `<h1>` en `/login` y `/register`, y generar las 11 capturas reales `docs/screenshots/phase-02-*.png` con `0` errores de consola.
- **Commits principales:** `2f33570`, `cc46c23`, `a32798f`, `6ee5009`, `0e845b9`, `81e3964`, `63ef233`, `404c4a8`, `10f5875`, `78c3aab`, `b5c49f3`, `2092dc4`.
- **Estado final:** **Completada y verificada integralmente**.

---

## Fase 03 — Base de Datos, Migraciones, Seguridad y Autenticación

- **Identificador de fase:** `Fase 03`
- **Fecha real de ejecución:** `2026-11-26`
- **Prompt recibido:** [docs/prompts/003-database-and-authentication.md](./docs/prompts/003-database-and-authentication.md)
- **Walkthrough versionado:** [docs/walkthroughs/003-database-and-authentication.md](./docs/walkthroughs/003-database-and-authentication.md)
- **Objetivo:** Resolver las evidencias visuales pendientes de Fase 02, incorporar la política permanente de Walkthroughs, simplificar la configuración de caché de Next.js 16 para rutas privadas, implementar las migraciones PostgreSQL con restricciones de integridad y RLS, generar los tipos de base de datos, integrar Supabase SSR (`src/proxy.ts`, `client.ts`, `server.ts`, `/auth/callback`), conectar registro/login/logout reales, proteger las 6 rutas privadas, mostrar perfil real y categorías reales y reemplazar los datos de demostración en el área autenticada por estados vacíos honestos.

### Decisiones técnicas aplicadas
1. **Resolución autónoma de navegador vía Playwright aislado:** Evitó tocar el perfil personal de Chrome o abrir puertos públicos de depuración, permitiendo automatizar pruebas visuales y capturas reales de Fase 02 y Fase 03.
2. **Simplificación de Next.js 16 (`ADR-009`):** Se eliminaron `cacheComponents: true` y `partialPrefetching: true` de `next.config.ts` y se declaró `export const dynamic = "force-dynamic"` en `src/app/(app)/layout.tsx`, garantizando que las 6 rutas privadas siempre se rendericen dinámicamente (`ƒ`) sin riesgo de fuga entre usuarios mientras `/` permanece estático (`○`).
3. **Integridad estricta declarativa en PostgreSQL:** Clave única compuesta `UNIQUE (id, user_id, type)` en `categories` referenciada por FKs compuestas `ON DELETE RESTRICT ON UPDATE RESTRICT` en `transactions` y en `budgets` (mediante columna generada `category_type = 'expense'`), más techo monetario `<= 900,000,000,000,000` centavos compatible con `Number.MAX_SAFE_INTEGER`.
4. **RLS forzado y privilegio mínimo:** `REVOKE ALL FROM PUBLIC, anon`, permisos específicos para `authenticated` (en `profiles` solo `SELECT` y `UPDATE (full_name)`), políticas `SELECT`/`INSERT`/`UPDATE`/`DELETE` con `(SELECT auth.uid()) = user_id` y función `handle_new_user()` (`SECURITY DEFINER`, `SET search_path = ''`, sin permisos ejecutables por `anon`/`authenticated`).
5. **Defensa en profundidad en autenticación y APIs:** `src/proxy.ts` (`getClaims()`) + `(app)/layout.tsx` (`getUser()`) + `/api/profile` y `/api/auth/signout` (`getUser()`, `isValidSameOrigin()`, Zod, `Cache-Control: no-store, private`) + `sanitizeNextPath()` en `/auth/callback` y `/login`.
6. **Transición limpia desde datos ficticios:** Eliminados `DEMO_USER` y las vistas ficticias de `(app)/`; `/categories` lee categorías reales vía `getUserCategories()`, `/settings` lee y actualiza `public.profiles` vía `/api/profile`, y `/dashboard`, `/transactions`, `/budgets` y `/reports` muestran estados vacíos reales en `$0.00` hasta la Fase 04.

### Archivos relevantes creados o modificados
- **Migraciones SQL:** `supabase/migrations/20261126230000_initial_schema.sql`, `supabase/migrations/20261126230100_rls_and_seed.sql`, `supabase/phase-03-setup.sql`.
- **Supabase SSR y Seguridad:** `src/types/database.ts`, `src/lib/supabase/{env.ts, client.ts, server.ts, proxy.ts}`, `src/proxy.ts`, `src/lib/{redirects.ts, auth-errors.ts, api-response.ts}`.
- **Servicios, Esquemas y Route Handlers:** `src/schemas/profile.schema.ts`, `src/services/{profile.service.ts, categories.service.ts}`, `src/app/auth/callback/route.ts`, `src/app/api/auth/signout/route.ts`, `src/app/api/profile/route.ts`.
- **UI autenticada y protección de rutas:** `src/app/(auth)/{layout.tsx, login/page.tsx}`, `src/components/auth/{login-form.tsx, register-form.tsx}`, `src/app/(app)/{layout.tsx, dashboard/page.tsx, transactions/page.tsx, categories/page.tsx, budgets/page.tsx, reports/page.tsx, settings/page.tsx}`, `src/components/layout/{app-sidebar.tsx, app-header.tsx}`, `src/components/settings/settings-view.tsx`, `src/components/categories/categories-view.tsx`.
- **Pruebas y scripts:** `tests/security-helpers.test.ts`, `scripts/{run-with-server.mjs, verify-phase-02.mjs, verify-phase-03.mjs, test-supabase-rls.mjs}`.
- **Documentación y Walkthroughs:** `AGENTS.md`, `.agents/rules/fintrack-standards.md`, `docs/prompts/003-database-and-authentication.md`, `docs/walkthroughs/{002-initialization-and-design.md, 003-database-and-authentication.md}`, `docs/{ARCHITECTURE.md, IMPLEMENTATION_PLAN.md, TESTING.md}`, `README.md`, `VIBE_CODING.md`.

### Problemas realmente encontrados y soluciones aplicadas
1. **Desbordamientos responsive detectados en `/` al ejecutar Playwright (`768x1024`: `824px`, `360x800`: `365px`) y `h1Count: 0` en `/login` y `/register`:** Se ajustó `marketing-navbar.tsx` (`lg:flex`), se habilitó `whitespace-normal` + `min-w-0` en el hero y se reemplazó `CardTitle` por `<h1>` en los formularios de autenticación. Verificado en 2ª corrida con `0` desbordamientos.
2. **Sobrescritura externa de `package.json`:** Durante la instalación de `server-only`, `package.json` había sido guardado con su contenido inicial del editor abierto; se detectó de inmediato en el log de `npm`, se restauró íntegramente desde `git show 10f5875:package.json`, se añadieron `server-only` y `playwright` y se reinstaló con `0 vulnerabilities`.
3. **Rutas `(app)/*` marcadas como estáticas (`○`) durante `next build` cuando `.env.local` aún no existía:** Se agregó `export const dynamic = "force-dynamic"` en `src/app/(app)/layout.tsx`, garantizando que las 6 rutas privadas aparezcan como `ƒ (Dynamic)` en compilación independientemente de las variables de entorno.
4. **Advertencia ESLint de variable sin uso `userB` en `scripts/test-supabase-rls.mjs`:** Corregida para dejar `npm run lint` en `0` errores y `0` advertencias.
5. **Bloqueo externo esperado — Proyecto remoto de Supabase:** No existe `.env.local`, Supabase CLI ni integración autenticada en el entorno local. Todo el SQL, el código de autenticación SSR y el script automatizado `npm run test:supabase-rls` quedaron listos y verificados localmente; solo falta la intervención humana para crear el proyecto gratuito en Supabase, ejecutar `supabase/phase-03-setup.sql` y completar `.env.local`.

### Comandos ejecutados y resultados verificables
- `npm run verify:phase02` → **`EXIT=0`** (9/9 rutas HTTP 200, 42/42 sin desbordamiento, 5/5 interactivos OK, 11 capturas PNG, 0 errores consola/página).
- `npx next typegen` → **`EXIT=0`**.
- `npm run lint` → **`EXIT=0`** (0 errores, 0 advertencias).
- `npm run typecheck` → **`EXIT=0`**.
- `npm run test` → **`EXIT=0`** (**5 archivos, 22/22 tests aprobados** en `1.32s`).
- `npm run build` → **`EXIT=0`** (Turbopack `2.7s`; `/` estático `○`, las 6 rutas privadas y 3 APIs dinámicas `ƒ`, `Proxy` activo).
- `npm audit --audit-level=moderate` → **`found 0 vulnerabilities`** (622 paquetes).
- `npm run verify:phase03` → **`EXIT=0`** (6/6 redirecciones privadas a `/login`, `/api/profile` JSON + `no-store`, `/api/auth/signout` cross-origin `403`, open-redirect bloqueado, 4 capturas `phase-03-*.png`, 0 errores consola/página).
- `npm run test:supabase-rls` → **Bloqueado / Pendiente** hasta configurar `.env.local` y aplicar `supabase/phase-03-setup.sql` en Supabase.

### Referencias a commits (Fase 03)
- `b5c49f3` — `test: complete phase 02 browser and responsive validation`
- `2092dc4` — `docs: add phase 02 implementation walkthrough`
- `e85fe1e` — `refactor: simplify authenticated rendering configuration`
- `cf5c08d` — `feat: add PostgreSQL database migrations`
- `0ff33dd` — `feat: configure row level security policies`
- `6d1ee68` — `feat: integrate Supabase SSR authentication`
- `a71ae55` — `feat: implement user registration and login`
- `4b5d1ce` — `feat: protect authenticated application routes`
- `2880ce3` — `feat: integrate user profile and session management`
- `b55a1d7` — `test: validate authentication and data isolation`
- *(Seguido del commit documental `docs: document phase 03 implementation and walkthrough`)*

### Estado final de la Fase 03
- **Implementado y verificado localmente:** 100% de la resolución visual de Fase 02, simplificación de Next.js 16, migraciones PostgreSQL + RLS, tipos `database.ts`, clientes Supabase SSR, `src/proxy.ts`, `/auth/callback`, `/api/auth/signout`, `/api/profile`, autenticación real UI, protección de rutas, perfil real, categorías reales y estados vacíos honestos.
- **Bloqueado externamente (requiere intervención humana en Supabase):** Creación del proyecto gratuito en Supabase, ejecución del archivo listo `supabase/phase-03-setup.sql`, carga de `.env.local` y ejecución final de `npm run test:supabase-rls` + capturas autenticadas en vivo (`phase-03-authenticated-dashboard.png`, `phase-03-profile.png`, `phase-03-mobile-dashboard.png`).


---

## Fase 03.1 — Iteración Correctiva: Validación Real de Integración Supabase y Cierre de Fase 03

- **Identificador de iteración:** `Fase 03.1`
- **Fecha real de ejecución:** `2026-11-26` / `2026-11-27`
- **Prompt recibido:** [docs/prompts/003.1-supabase-integration-validation.md](./docs/prompts/003.1-supabase-integration-validation.md)
- **Walkthrough versionado:** [docs/walkthroughs/003.1-supabase-integration-validation.md](./docs/walkthroughs/003.1-supabase-integration-validation.md)
- **Objetivo:** Verificar técnicamente las configuraciones externas realizadas por el usuario en Supabase, ejecutar pruebas reales de restricciones PostgreSQL y aislamiento RLS de 2 usuarios sin `service_role`, ejecutar flujos autenticados E2E con Playwright + grabación WebM + capturas pendientes, completar la matriz responsive de 63 combinaciones, documentar la estrategia monetaria acumulada para Fase 04 y cerrar la Fase 03.

### Configuraciones externas reportadas por el usuario vs. verificaciones técnicas ejecutadas
- **Reportado por el usuario:** Proyecto gratuito `FinTrack` en Supabase (`DevPortfolio`, West US Oregon), Data API habilitada, concesión automática API deshabilitada, RLS automático habilitado, ejecución de `supabase/phase-03-setup.sql`, Site URL `http://localhost:3000`, Redirect URL `http://localhost:3000/auth/callback` y archivo `.env.local` creado.
- **Verificado técnicamente:**
  1. `.env.local` excluido por `.gitignore:34:.env*` (`git check-ignore -v .env.local`), con `NEXT_PUBLIC_SUPABASE_URL` válida, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_*`), `NEXT_PUBLIC_APP_URL=http://localhost:3000` y ausencia total de `SUPABASE_SERVICE_ROLE_KEY`.
  2. Conectividad real con `/auth/v1/settings` (`HTTP 200`, `email_enabled: true`, `disable_signup: false`, `mailer_autoconfirm: false`).
  3. Rechazo estricto a `anon` en las 4 tablas vía PostgREST (`HTTP 401`, código PostgreSQL `42501 permission denied`).
  4. Intervención humana coordinada para mantener **Confirm email** activo (sin debilitar seguridad): el usuario aplicó la migración correctiva UTF-8 `20261126235000_fix_utf8_seed_and_comments.sql` y creó 2 usuarios de prueba con **Auto Confirm User** configurando `TEST_USER_A_*` y `TEST_USER_B_*` en `.env.local`.

### Problemas realmente encontrados y correcciones aplicadas
1. **Doble codificación UTF-8 en `supabase/phase-03-setup.sql`:** La concatenación previa en PowerShell 5.1 sin `-Encoding UTF8` produjo mojibake (`CategorÃas`, `AlimentaciÃ³n`, `EducaciÃ³n`). Se creó la migración correctiva versionada e idempotente `supabase/migrations/20261126235000_fix_utf8_seed_and_comments.sql` (sin alterar migraciones ya aplicadas) y se regeneró `supabase/phase-03-setup.sql` con Node.js en UTF-8 puro. Verificado en remoto: `utf8Clean=true` (`Alimentación` y `Educación` limpias).
2. **Variables `NEXT_PUBLIC_*` no inyectadas en el build anterior a `.env.local`:** La primera corrida de `verify:phase03` usó `.next` compilado antes de crear `.env.local`. Recompilar con `npm run build` (`- Environments: .env.local`) resolvió inmediatamente la conectividad en el bundle cliente.
3. **Captura prematura del skeleton en `phase-03-authenticated-dashboard.png`:** Al inspeccionar la captura se observó `loading.tsx` antes de terminar el streaming del Server Component. Se añadió `waitFor` sobre `<h1>` en `scripts/verify-phase-03.mjs` y se recapturó el dashboard autenticado real.
4. **Error de consola esperado (`400`) en prueba negativa de credenciales inválidas:** Filtrado estrictamente solo durante la prueba negativa en `/login` dentro de `scripts/verify-phase-03.mjs`, confirmando `0` errores inesperados de consola y `0` errores de página.
5. **Binario `ffmpeg` ausente para grabación de video de Playwright:** Instalado mediante `npx playwright install ffmpeg`, generando la grabación real `docs/recordings/phase-03-auth-flow.webm`.

### Resultados verificables y evidencias
- `npx next typegen`, `npm run lint` (0 errores/0 advertencias), `npm run typecheck`, `npm run test` (22/22 tests) y `npm run build` → **`EXIT=0`**.
- `npm run test:supabase-rls` → **`18/18` checks aprobados (`EXIT=0`)** cubriendo CRUD positivo propio, aislamiento RLS en las 4 tablas (`profiles`, `categories`, `transactions`, `budgets`), bloqueo de transferencia de propietario (`42501`), rechazo de montos `0`, `-500` y `> MAX_SAFE_CENTS` (`23514`), FKs compuestas (`23503`), presupuestos únicos (`23505`) y borrado seguro de categorías vinculadas (`23503`).
- `npm run verify:phase03` → **`EXIT=0`**: 6/6 rutas privadas protegidas (`?next=`), `401` JSON + `no-store` en `/api/profile`, `403` cross-origin, open-redirect bloqueado, 15/15 flujos autenticados reales (incluyendo edición persistente de perfil y cierre de sesión con botón atrás), 21/21 checks responsive restantes (**63/63 matriz completa 9×7 sin desbordamiento**), 5 capturas autenticadas y grabación real `docs/recordings/phase-03-auth-flow.webm`.

### Commits de esta iteración
- `019e658` — `fix: add corrective UTF-8 migration for category seeding`
- `15cd779` — `test: verify database constraints, RLS isolation, and authenticated flows`
- *(Seguido de `docs: complete phase 03 integration walkthrough`)*

### Estado final de la Fase 03
- **Completada y verificada técnicamente contra Supabase real**, manteniendo `Confirm email` activo para producción (con la comprobación manual de entrega de correo real SMTP documentada como validación previa al despliegue en Fase 06).
