# Estrategia y Registro de Pruebas — FinTrack

Este documento registra la estrategia de aseguramiento de calidad y los resultados **reales y verificables** de cada ejecución de pruebas, diferenciando entre análisis estático, pruebas unitarias, pruebas de seguridad API, pruebas reales de integración PostgreSQL/RLS y pruebas E2E/responsive en navegador aislado.

## 1. Pirámide de Validación
1. **Validaciones estáticas:** `npx next typegen`, `npm run lint` (ESLint + React 19 hooks), `npm run typecheck` (`tsc --noEmit`).
2. **Pruebas unitarias (`npm run test` — Vitest, 7 archivos / 32 tests):**
   - `tests/money.test.ts` (8 tests): centavos enteros, precisión arbitraria `BigInt` > `Number.MAX_SAFE_INTEGER`, 4 estados de presupuesto (`healthy`, `warning`, `limit_reached`, `exceeded`) y comparativas con base `0` (`null`).
   - `tests/dates.test.ts` (5 tests): `America/El_Salvador`, medianoche UTC, años bisiestos, transiciones de año y `resolvePeriodRange`.
   - `tests/csv.test.ts` (4 tests): BOM UTF-8, RFC 4180, neutralización de Formula Injection (`=`, `+`, `-`, `@`, `\t`, espacios iniciales) y preservación de montos negativos USD.
   - `tests/financial-schemas.test.ts` (4 tests): esquemas Zod de categorías, transacciones, presupuestos, reportes/CSV y motor `financial-aggregations.ts` por encima de `MAX_SAFE_INTEGER`.
   - `tests/auth-schema.test.ts` (4 tests), `tests/demo-data.test.ts` (3 tests), `tests/security-helpers.test.ts` (4 tests).
3. **Compilación de producción y auditoría de dependencias:** `npm run build` y `npm audit --audit-level=moderate`.
4. **Pruebas reales PostgreSQL + RLS (`npm run test:supabase-rls`, 18 checks):** 2 usuarios reales independientes usando exclusivamente `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (sin `service_role`).
5. **Pruebas reales de seguridad API y escenario financiero determinista (`npm run test:api-security`, 42 checks):** cookies SSR reales para Usuario A y Usuario B contra todos los Route Handlers de Fase 04.
6. **Pruebas E2E en navegador real + descarga CSV + matriz responsive (`npm run verify:phase04` y regresión `npm run verify:phase03`).**

---

## 2. Registro Real de Ejecuciones

### Fase 01 — Planificación (2026-11-26)
- Inspección del entorno (`Node.js v22.19.0`, `npm 10.9.3`, `Git 2.43.0.windows.1`). **Verificado.**

### Fase 02 — Inicialización y Diseño UI/UX (2026-11-26)
- `lint`, `typecheck`, `test` (18/18), `build` y `verify:phase02` (9/9 rutas HTTP 200, 42/42 responsive parcial, 11 capturas PNG, 0 errores). **Verificado.**

### Fase 03 / 03.1 — Base de Datos, RLS y Autenticación (2026-11-26 / 2026-11-27)
- `lint`, `typecheck`, `test` (22/22), `build`, `test:supabase-rls` (**18/18**), `verify:phase03` (**15/15** flujos autenticados + **63/63** matriz responsive completa). **Verificado.**

### Fase 04 — Módulos Funcionales Completos (2026-11-27)

| Categoría | Comando | Resultado real verificado | Estado |
| :--- | :--- | :--- | :--- |
| Tipos Next.js | `npx next typegen` | `✓ Types generated successfully` (`EXIT=0`) | **Verificado** |
| Linter | `npm run lint` | `0` errores, `0` advertencias (`EXIT=0`) | **Verificado** |
| TypeScript | `npm run typecheck` | `0` errores (`EXIT=0`) | **Verificado** |
| Pruebas unitarias | `npm run test` | **7 archivos, 32/32 tests aprobados** (`EXIT=0`) | **Verificado** |
| Build de producción | `npm run build` | Turbopack `3.3s` con `- Environments: .env.local`; `/` estático `○`, 6 rutas privadas + 11 Route Handlers dinámicos `ƒ`, `Proxy` activo (`EXIT=0`) | **Verificado** |
| Seguridad de paquetes | `npm audit --audit-level=moderate` | **`found 0 vulnerabilities`** (`EXIT=0`) | **Verificado** |
| Regresión PostgreSQL + RLS | `npm run test:supabase-rls` | **`18/18` checks aprobados** (`mailerAutoConfirm: false`, `initialTx=0, initialBudgets=0`, `EXIT=0`) | **Verificado** |
| Seguridad API + Escenario financiero determinista | `npm run test:api-security` | **`42/42` checks aprobados (`EXIT=0`)**: `401` + `no-store` en 9 endpoints sin sesión (antes de validación `400`), UUID inválido `400`, inexistente `404`, cross-origin `403`, duplicados `409`, borrado/cambio de tipo de categoría vinculada `409`, paginación con totales `BigInt` completos, 4 estados de presupuesto (`warning` → `limit_reached` → `exceeded`), paridad Dashboard/Reportes (`+$1,200` acumulado, `+$1,000 / -$200 / +$800`, `+100%` vs junio), CSV con bytes BOM `EF BB BF` y fórmulas neutralizadas, y aislamiento total Usuario B vs Usuario A | **Verificado** |
| E2E completo + CSV real + Responsive 9×7 con datos reales | `npm run verify:phase04` | **`18/18` checks aprobados (`EXIT=0`)**: login UI, CRUD categorías, CRUD transacciones (crear, editar, eliminar en diálogo, búsqueda con debounce), presupuestos (`Cerca del límite`, duplicado `409`, edición a `Superado`), bloqueo `409` de categoría en uso, dashboard real con gráficos Recharts y cambio de período + recarga, descarga real de archivo `fintrack-transacciones-2026-11-27.csv` verificada desde disco, **63/63 matriz responsive (9 rutas × 7 resoluciones) con datos reales y `0px` de desbordamiento**, 6 capturas PNG + grabación WebM (`16.7 MB`), **`0` errores de consola y `0` page errors** | **Verificado** |
| Regresión Fase 03 | `npm run verify:phase03` | **`EXIT=0`**: 6/6 redirecciones, 3/3 APIs protegidas, open-redirect bloqueado, 15/15 flujos autenticados, 21/21 checks responsive, `0` errores de consola/página | **Verificado** |
| Registro público SMTP y clic en correo real | Flujo `/register` → bandeja real → `/auth/callback?code=` | `Confirm email` permanece activo (`mailer_autoconfirm: false`). La creación de cuentas QA con *Auto Confirm User* no demuestra entrega SMTP pública; permanece como validación obligatoria previa al cierre de despliegue en Fase 06 | **Pendiente (Fase 06)** |
