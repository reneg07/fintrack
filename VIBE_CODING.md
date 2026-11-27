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


---

## Fase 04 — Implementación de Módulos Funcionales Completos (`PROMPT-004`, 2026-11-27)

### Prompt y Alcance
- Registrado íntegramente en [`docs/prompts/004-functional-modules.md`](./docs/prompts/004-functional-modules.md).
- Objetivo: conectar de extremo a extremo los 6 módulos privados (`/categories`, `/transactions`, `/budgets`, `/dashboard`, `/reports`, `/settings`) contra Supabase PostgreSQL real, implementando ADR-011 (`BigInt` + `ExactCents`), protección contra truncamiento de agregaciones, presupuestos de 4 estados, exportación CSV segura y pruebas unitarias, de seguridad API y E2E en navegador real.

### Arquitectura de Estado (`useState` y `useEffect`) Documentada
- **`src/hooks/use-debounce.ts`**: utiliza `useState` + `useEffect` con `setTimeout` y limpieza (`clearTimeout`) para estabilizar búsquedas de texto (`300 ms`) antes de invocar `GET /api/transactions`.
- **`src/components/transactions/transactions-manager.tsx`**: `useState` para filtros (`searchInput`, `typeFilter`, `categoryFilter`, `fromDate`, `toDate`, `page`), estado de modales (`isFormOpen`, `editingTx`, `deletingTx`) y resultados paginados; `useEffect` con `AbortController` para consultas abortables a `GET /api/transactions` y sincronización de categoría compatible al alternar entre ingreso y gasto.
- **`src/components/budgets/budgets-manager.tsx`**: `useState` para mes seleccionado y modales CRUD; `useEffect` con `AbortController` al cambiar mes (`GET /api/budgets?month=...`).
- **`src/components/dashboard/dashboard-client.tsx`** y **`src/components/reports/reports-client.tsx`**: `useState` para período/rango personalizado y filtros CSV; `useEffect` con `AbortController` para recargar `GET /api/dashboard` y `GET /api/reports` sin condiciones de carrera.
- **`src/components/categories/categories-view.tsx`**: `useState` para filtro de pestañas, modales de creación/edición y diálogo de confirmación de borrado seguro (`409 Conflict`).

### Decisiones Técnicas y Defectos Reales Detectados y Resueltos Durante la Iteración
1. **Regla React 19 `react-hooks/set-state-in-effect` en ESLint:** Al escribir los efectos de consulta en `transactions-manager.tsx`, ESLint señaló correctamente que llamar `setState` de forma síncrona al inicio de `useEffect` puede inducir renders en cascada. Se refactorizaron `transactions-manager.tsx`, `budgets-manager.tsx`, `dashboard-client.tsx` y `reports-client.tsx` para derivar el estado de carga (`const isLoading = settledKey !== requestKey`) y los errores de rango de fechas sin `setState` síncrono dentro de `useEffect`.
2. **Orden de seguridad en Route Handlers (`401` antes de `400`):** La primera ejecución de `npm run test:api-security` detectó que `POST /api/categories`, `POST /api/transactions` y `POST /api/budgets` devolvían HTTP `400` antes de HTTP `401` cuando un cliente no autenticado enviaba un JSON vacío. Se endurecieron los 9 Route Handlers nuevos (`88b914c`) ejecutando `requireAuthenticatedContext()` inmediatamente después de `isValidSameOrigin()` y antes de parsear JSON, UUIDs o esquemas Zod.
3. **Verificación de bytes crudos UTF-8 BOM y trim de Zod en CSV:** `Response.text()` elimina automáticamente el BOM UTF-8 (`EF BB BF`) al decodificar y Zod aplica `.trim()` a `notes`. Se actualizó la aserción en `scripts/test-api-security.mjs` para inspeccionar los bytes crudos (`await csvRes.body()` → `0xEF 0xBB 0xBF`) y confirmar la neutralización exacta de fórmulas (`'=SUM(...)`, `'+cmd|...`).
4. **Latencia real contra Supabase remoto en pruebas E2E:** En la primera corrida de `verify:phase04`, las esperas fijas de `700–800 ms` resultaron insuficientes frente a la latencia real con West US (Oregon) en eliminación y búsqueda con debounce (`16/18`). Se reemplazaron por esperas deterministas (`waitFor` sobre estado del DOM y toasts), logrando `18/18` aprobados.
5. **Inspección visual real de capturas (donas recortadas y captura prematura):** Al revisar visualmente las 6 capturas `phase-04-*.png`, se detectó que `ExactExpenseCategoryChart` recortaba lateralmente la dona en columnas de 1/3 de ancho en escritorio (`phase-04-dashboard-desktop.png` y `phase-04-reports.png`) y que `phase-04-budgets.png` se había capturado antes de cerrarse el modal de edición. Se ajustó el layout a apilamiento vertical centrado (`9a69358`) y se añadió espera explícita al cierre del `Dialog`, confirmando visualmente todas las capturas finales.

### Commits Reales de la Fase 04
- `edd0890` — `feat: implement exact monetary aggregations and validation schemas`
- `78796cf` — `feat: implement category management`
- `ebd4742` — `feat: implement transaction CRUD and filters`
- `c46e7b4` — `feat: implement monthly budget tracking`
- `de70f37` — `feat: integrate real financial dashboard`
- `7295a98` — `feat: implement financial reports and secure CSV export`
- `c4189f8` — `test: validate financial calculations`
- `88b914c` — `fix: enforce authentication before input validation in financial APIs`
- `45fd175` — `test: verify financial API authorization`
- `9a69358` — `fix: prevent donut chart clipping in narrow desktop cards`
- `b254bdb` — `test: add end-to-end financial workflows`

### Estado Real de Cierre
- **Implementado y Verificado:** Todos los módulos funcionales, 11 Route Handlers financieros, motor `BigInt` ADR-011, exportación CSV segura, `32/32` Vitest, `42/42` seguridad API + escenario determinista, `18/18` Playwright E2E + descarga CSV real + `63/63` responsive con datos reales, `18/18` regresión RLS, `15/15` regresión Fase 03 y `0` vulnerabilidades en `npm audit`.
- **Pendiente para Fase 06:** Validación manual integral de registro público con envío real de correo SMTP y clic en `/auth/callback` antes de cerrar producción.


---

## Fase 05 — Auditoría Técnica, Testing, Seguridad y Optimización (`PROMPT-005`, 2026-11-27)

### Prompt y Enfoque Crítico
- Registrado íntegramente en [`docs/prompts/005-testing-and-optimization.md`](./docs/prompts/005-testing-and-optimization.md).
- Enfoque: auditoría adversarial del código existente para identificar y corregir únicamente defectos técnicos reales (sin rediseños ni abstracciones innecesarias), cubrir los 28 escenarios E2E, validar agregaciones >1,000 filas tanto unitariamente como en Supabase real, auditar accesibilidad, concurrencia, seguridad, historial Git, privacidad de evidencias y preparación para Vercel + Custom SMTP.

### Hallazgos Reales Detectados y Corregidos (`docs/AUDIT.md`)
1. **`AUDIT-001` (Alto — Estados de error engañosos):** Los 5 Server Components de `(app)` atrapaban errores con `.catch(() => emptyData)` mostrando balances en `$0.00` falsos ante caídas; y los Client Components mantenían KPIs previos visibles durante errores de carga. Corregido propagando `initialError` y renderizando `<ErrorAlert onRetry={...} />` en lugar de cifras en `$0.00` (`a58e0e2`).
2. **`AUDIT-002` (Alto — Orden de autenticación en `/api/profile`):** `PATCH /api/profile` validaba Zod (`400`) antes de verificar `getUser()` (`401`). Corregido moviendo `requireAuthenticatedContext()` antes del parseo JSON (`c56dc6d`).
3. **`AUDIT-003` (Alto — Sanitización PostgREST):** `sanitizePostgrestSearch` no eliminaba `"` sin cerrar ni el comodín `*` en `.or(...)`. Extraído a `src/lib/search.ts` y endurecido preservando acentos y Unicode (`c56dc6d`), validado en vivo contra Supabase.
4. **`AUDIT-004` (Medio — Concurrencia y sesión expirada):** Agregada redirección limpia a `/login?next=...` ante HTTP `401`, bloqueo de cierre de modales durante `isSubmitting`, guarda contra doble envío y deduplicación por `id` en `collectPaginatedBatches` (`9e5c01e`, `a58e0e2`).
5. **`AUDIT-005` (Medio — Consultas redundantes):** `React.cache()` por petición en `src/services/_auth.ts` eliminó llamadas duplicadas a `supabase.auth.getUser()` (reduciendo latencias de API en vivo de ~750–815 ms a **541–568 ms**); `listTransactions` evita doble consulta cuando página 1 contiene todos los resultados y `budgets.service.ts` usa `fetchExpenseTotalsByCategory` ligero (`9e5c01e`).
6. **`AUDIT-006` (Medio — Accesibilidad WCAG 2.2 AA):** Añadidos `tabIndex={0}` + `role="region"` en `Table`, enlace `Saltar al contenido principal` en `(app)/layout.tsx`, `@media (prefers-reduced-motion: reduce)` en `globals.css`, `role="img"` + `aria-label` en gráficos Recharts y `aria-invalid`/`aria-describedby`/`role="alert"` en los formularios de Fase 04 (`1ffb9e5`, `a58e0e2`).
7. **`AUDIT-007` (Medio — Portabilidad y `.gitignore`):** Reemplazadas rutas absolutas de Windows en `docs/IMPLEMENTATION_PLAN.md` y `docs/walkthroughs/003-database-and-authentication.md` y ampliado `.gitignore` para artefactos Playwright (`315f30a`).
8. **`AUDIT-008` (Bajo — Consistencia visual del 100%):** `calculateExactBudgetPercentage` acota `< limit` a `99.9%` y `> limit` a `100.1%`, reservando `100.0%` exclusivamente a `limit_reached` (`f5e95a2`).
9. **`AUDIT-009` (Bajo — Estrategia SMTP Fase 06):** Documentada en [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) tras consultar restricciones vigentes de Supabase Auth (2 correos/hora, solo miembros del equipo en SMTP integrado) y opciones gratuitas (Brevo, Resend, Gmail App Password) + compatibilidad dual PKCE/`token_hash`.

### Validaciones Ejecutadas y Commits de Fase 05
- **Unitarias (`npm run test`):** `36/36` aprobadas (8 archivos, incluyendo `tests/batch-pagination.test.ts`).
- **Volumen real >1,000 filas + cobertura 28/28 + a11y + resiliencia + perf (`npm run verify:phase05`):** **`24/24` aprobadas**, incluyendo inserción y agregación real de **1,005 filas** en Supabase (`100500` centavos, `1,006` líneas CSV, `0` remanentes tras limpieza) y métricas de laboratorio en producción (`FCP=152ms`, `LCP=152ms`, `CLS=0`, `TBT=0ms`, `0` fuentes externas).
- **Instalación limpia reproducible:** `git clone` sin `.env.local` → `npm ci` (`621` paquetes, `0 vulnerabilities`) → `npm run build` (`EXIT=0`).
- **Regresión completa de cierre:** `npm audit` (`0 vulnerabilities`), `test:supabase-rls` (`18/18`), `test:api-security` (`42/42`), `verify:phase04` (`18/18` + `63/63` responsive), `verify:phase03` (`15/15` + `21/21` responsive).
- **Commits:** `f5e95a2`, `c56dc6d`, `9e5c01e`, `1ffb9e5`, `a58e0e2`, `315f30a`, `c675b63` (+ commit final de documentación de Fase 05).


---

## Fase 06 — Publicación en GitHub, Despliegue en Vercel y Cierre Definitivo (`PROMPT-006`, 2026-11-27)

### Prompt y Participación del Usuario
- Registrado íntegramente en [`docs/prompts/006-deployment-and-delivery.md`](./docs/prompts/006-deployment-and-delivery.md).
- **Herramienta de IA utilizada a lo largo del proyecto:** Antigravity (agente principal de desarrollo guiado por IA) + supervisión humana del estudiante para decisiones de arquitectura, cuentas externas (Supabase, GitHub, Vercel), credenciales locales y aprobación por fase.
- **Acciones externas ejecutadas por el usuario:** creación del repositorio público `https://github.com/reneg07/fintrack`, `git push` inicial de `main`, despliegue en Vercel Hobby en `https://fintrack-ten-weld-84.vercel.app` con las 3 variables `NEXT_PUBLIC_*` (`NEXT_PUBLIC_APP_URL` actualizada + Redeploy), y actualización de `Site URL` y `Redirect URLs` en Supabase Auth manteniendo `Confirm email` y RLS activos.

### Validación Real en Producción y Cierre
- Validaciones locales previas: `npm run lint`, `npm run typecheck`, `npm run test` (`36/36`), `npm run build` (`EXIT=0`, commit `09249fc`).
- **Smoke test en vivo contra `https://fintrack-ten-weld-84.vercel.app` (`npm run verify:prod`):** **`15/15` aprobados**:
  - `GET /api/dashboard` sin sesión → `401` + `Cache-Control: no-store`.
  - Acceso público a `/` (`HTTP 200`, sin muro de Vercel Authentication) y `/register` (`HTTP 200`); redirección de `/dashboard` a `/login`.
  - Login real con cuenta QA confirmada, lectura real de categorías Supabase, creación de transacción de prueba (`$42.50`) reflejada en `/dashboard`, descarga real de CSV con BOM UTF-8 (`fintrack-transacciones-2026-11-27.csv`), `/budgets`, `/settings`, vista móvil `390×844` con `0px` overflow, limpieza del registro de prueba, cierre de sesión y **`0` errores de consola/página**.
- **Repositorio público verificado sin autenticación:** `HEAD https://github.com/reneg07/fintrack` → **`HTTP 200`**.
- **Estado honesto de Custom SMTP:** No configurado antes de la entrega; `Confirm email` y RLS permanecen activos, y la limitación de registro público externo queda documentada en `README.md`, `docs/DEPLOYMENT.md` y el Walkthrough definitivo.
