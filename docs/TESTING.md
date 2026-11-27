# Estrategia y Registro de Pruebas — FinTrack

Este documento registra la estrategia de aseguramiento de calidad y los resultados **reales y verificables** de cada ejecución de pruebas, diferenciando entre análisis estático, pruebas unitarias, pruebas locales de navegador, pruebas reales de integración contra Supabase y pruebas de seguridad.

## 1. Pirámide de Validación
1. **Validaciones estáticas:** `npx next typegen`, `npm run lint` (ESLint) y `npm run typecheck` (`tsc --noEmit`).
2. **Pruebas unitarias (`npm run test` — Vitest):**
   - `tests/money.test.ts` (7 tests): aritmética en centavos enteros, formateo USD, `MAX_SAFE_CENTS` y presupuestos.
   - `tests/dates.test.ts` (4 tests): `America/El_Salvador`, medianoche UTC y años bisiestos.
   - `tests/auth-schema.test.ts` (4 tests): esquemas Zod de login y registro.
   - `tests/demo-data.test.ts` (3 tests): consistencia matemática de datos de presentación.
   - `tests/security-helpers.test.ts` (4 tests): prevención de open redirects, mapeo seguro de errores Auth, validación de perfil y Same-Origin.
3. **Compilación de producción y seguridad de paquetes:** `npm run build` y `npm audit --audit-level=moderate`.
4. **Pruebas de navegador y matriz responsive (Playwright aislado):** `npm run verify:phase02` y `npm run verify:phase03`.
5. **Pruebas reales de integración PostgreSQL + RLS de 2 usuarios (`npm run test:supabase-rls`):** Ejecutadas contra el proyecto autorizado de Supabase usando exclusivamente `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (sin `service_role`).

---

## 2. Registro Real de Ejecuciones

### Fase 01 — Planificación (2026-11-26)
- Inspección no destructiva del entorno (`Node.js v22.19.0`, `npm 10.9.3`, `Git 2.43.0.windows.1`, workspace vacío). **Verificado.**

### Fase 02 — Inicialización y Diseño UI/UX (2026-11-26)
- `lint`, `typecheck`, `test` (18/18), `build` y `verify:phase02` (**9/9 rutas HTTP 200**, `h1Count: 1`, **42/42 checks de overflow en 6 rutas × 7 resoluciones**, 5/5 interactivos, 11 capturas PNG, 0 errores de consola). **Verificado.**

### Fase 03 — Implementación Base (2026-11-26)
- Implementación de migraciones, RLS, Supabase SSR, `src/proxy.ts`, `/auth/callback`, `/api/profile`, `/api/auth/signout` y validaciones locales (`lint`, `typecheck`, 22/22 tests, `build`, `verify:phase03` sin `.env.local`).

### Fase 03.1 — Validación Real de Integración Supabase y Cierre de Fase 03 (2026-11-26 / 2026-11-27)

| Categoría | Validación / Comando | Resultado real verificado | Estado |
| :--- | :--- | :--- | :--- |
| Validación estática | `npx next typegen` | `✓ Types generated successfully` (`EXIT=0`) | **Verificado** |
| Validación estática | `npm run lint` | `0` errores, `0` advertencias (`EXIT=0`) | **Verificado** |
| Validación estática | `npm run typecheck` | `0` errores (`EXIT=0`) | **Verificado** |
| Pruebas unitarias | `npm run test` | **5 archivos, 22/22 tests aprobados** en `1.46s` (`EXIT=0`) | **Verificado** |
| Compilación | `npm run build` | Turbopack `4.4s` con `- Environments: .env.local`; `/` estático `○`, las 6 rutas privadas y 3 APIs dinámicos `ƒ`, `Proxy` activo (`EXIT=0`) | **Verificado** |
| Integración real Supabase + Seguridad RLS | `npm run test:supabase-rls` | **`18/18` checks aprobados (`EXIT=0`)** contra el proyecto remoto usando solo Publishable Key y 2 usuarios reales independientes (`profiles`, `categories`, `transactions`, `budgets`) | **Verificado** |
| Pruebas E2E autenticadas, sesiones y matriz responsive restante | `npm run verify:phase03` | **`EXIT=0`**: 6/6 redirecciones no autenticadas (`?next=`), `GET`/`PATCH /api/profile` → `401` JSON + `no-store`, cross-origin `POST /api/auth/signout` → `403`, open-redirect bloqueado, login inválido real contra Supabase Auth, login real en UI, recarga persistente, redirección autenticada desde `/login` y `/register`, acceso a 6/6 rutas privadas, 12 categorías reales visibles, `GET /api/profile` `200` + `no-store`, `PATCH /api/profile` persistente tras recarga, cierre de sesión + bloqueo en navegación atrás, **21/21 checks responsive restantes** (`/register`, `/categories`, `/settings` × 7 resoluciones = **63/63 matriz completa**), 5 capturas autenticadas + grabación WebM, `0` errores de consola/página | **Verificado** |
| Envío y clic real de correo SMTP de confirmación | Flujo `/register` → bandeja de entrada → `/auth/callback?code=` | `mailer_autoconfirm: false` verificado en `/auth/v1/settings` y handler `/auth/callback` probado contra open-redirect; no se enviaron correos reales a buzones externos durante QA automatizado para respetar los límites SMTP del plan gratuito | **Pendiente (verificación manual con buzón real antes de producción)** |

#### Detalle de los 18 Checks Reales de PostgreSQL y RLS (`npm run test:supabase-rls`)
1. `anon-denied-all-4-tables`: **PASS** — `profiles:42501, categories:42501, transactions:42501, budgets:42501`
2. `auth-two-independent-users`: **PASS** — `userA != userB` (sesiones independientes reales)
3. `auto-profile-created-and-readable`: **PASS** — `currency=USD, tz=America/El_Salvador`
4. `profile-update-own`: **PASS** — `OK`
5. `rls-profiles-isolation`: **PASS** — `bRead=0, bUpd=0, intact=true`
6. `auto-12-initial-categories-utf8`: **PASS** — `defaults=12 (income=4, expense=8, utf8Clean=true)`
7. `new-user-starts-clean-no-demo-data`: **PASS** — `initialTx=0, initialBudgets=0`
8. `categories-own-insert-update`: **PASS** — `OK`
9. `rls-categories-isolation-and-no-transfer`: **PASS** — `bRead=0, bUpd=0, bDel=0, bInsErr=42501, transferErr=42501`
10. `constraints-reject-invalid-amounts`: **PASS** — `zero=23514, neg=23514, overMax=23514`
11. `constraints-category-type-and-owner-fk`: **PASS** — `badType=23503, foreignCat=23503`
12. `transactions-own-insert-update`: **PASS** — `OK`
13. `constraint-reject-delete-category-with-tx`: **PASS** — `23503`
14. `rls-transactions-isolation-and-no-transfer`: **PASS** — `bRead=0, bUpd=0, bDel=0, bInsErr=42501, transferErr=42501`
15. `constraints-budgets-expense-only-first-day-unique`: **PASS** — `incomeErr=23503, badDayErr=23514, dupErr=23505`
16. `budgets-own-update`: **PASS** — `OK`
17. `rls-budgets-isolation-and-no-transfer`: **PASS** — `bRead=0, bUpd=0, bDel=0, bInsErr=42501, transferErr=42501`
18. `own-delete-tx-budget-and-unlinked-category`: **PASS** — `OK`
