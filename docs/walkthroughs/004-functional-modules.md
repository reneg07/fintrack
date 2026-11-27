# Walkthrough Fase 04 — Implementación de Módulos Funcionales de FinTrack

## 1. Objetivos de la Fase
Conectar de extremo a extremo todos los módulos funcionales de FinTrack (`/categories`, `/transactions`, `/budgets`, `/dashboard`, `/reports` y `/settings`) contra Supabase PostgreSQL real con Row Level Security, aritmética monetaria de precisión arbitraria en `BigInt` (ADR-011), validaciones cliente/servidor con Zod, exportación CSV segura contra Formula Injection y cobertura automatizada unitaria, de seguridad API, E2E y responsive.

## 2. Resumen Ejecutivo de la Implementación
- **Estado general:** **Implementado y Verificado** contra Supabase real sin utilizar `service_role` ni desactivar `Confirm email`.
- **Resultados verificados:**
  - `npx next typegen`, `npm run lint`, `npm run typecheck`, `npm run build`: **0 errores, 0 advertencias**.
  - `npm run test` (Vitest): **32/32 pruebas aprobadas** (7 archivos).
  - `npm run test:api-security`: **42/42 checks aprobados** (autorización API, aislamiento Usuario A vs Usuario B y escenario financiero determinista).
  - `npm run verify:phase04`: **18/18 flujos E2E aprobados**, descarga real CSV verificada desde disco, **63/63 checks responsive con datos reales (`0px` overflow)**, **0 errores de consola** y **0 errores de página**.
  - Regresiones: `npm run test:supabase-rls` (**18/18**), `npm run verify:phase03` (**15/15** flujos autenticados + **21/21** responsive), `npm audit --audit-level=moderate` (**0 vulnerabilidades**).

## 3. Funcionalidades Desarrolladas
- **Categorías (`/categories`):** Listado con conteo real de transacciones y presupuestos asociados, filtros por tipo, creación/edición con selector de color e icono Lucide, bloqueo HTTP `409 Conflict` al eliminar o cambiar el tipo de categorías en uso y diálogo de confirmación accesible.
- **Transacciones (`/transactions`):** CRUD completo en centavos enteros USD, búsqueda de texto con `useDebounce(300ms)`, filtros combinados (tipo, categoría, rango `from`/`to`), paginación real en servidor, totales exactos `BigInt` sobre todo el conjunto filtrado, tabla responsive en escritorio y tarjetas en móvil.
- **Presupuestos Mensuales (`/budgets`):** Selector mensual (`YYYY-MM`), KPIs globales, alerta consolidada, CRUD exclusivo para categorías de gasto con unicidad `(user_id, category_id, month)` (`409 Conflict`), barra de progreso y clasificación exacta en 4 estados (`En control`, `Cerca del límite`, `Límite alcanzado`, `Superado`).
- **Dashboard Real (`/dashboard`):** Balance acumulado histórico independiente del período, KPIs por período (`current_month`, `last_3_months`, `last_6_months`, `current_year` y meses individuales), gráficos Recharts exactos (barras ingresos vs. gastos, área flujo neto, dona de gastos por categoría), 5 movimientos recientes y acceso directo a nueva transacción.
- **Reportes y Exportación CSV (`/reports`):** Períodos predefinidos y rangos personalizados, comparativas contra período previo con `"Sin base previa"` cuando el período anterior es `$0.00`, gráficos interactivos, tabla mensual exacta y descarga CSV UTF-8 con BOM y protección contra Formula Injection.

## 4. Arquitectura de Servicios y Route Handlers
- **Autenticación centralizada en servicios:** [`src/services/_auth.ts`](../../src/services/_auth.ts) expone `requireAuthenticatedContext()` verificando siempre `supabase.auth.getUser()` (nunca `getSession()`).
- **Servicios `server-only`:**
  - [`src/services/categories.service.ts`](../../src/services/categories.service.ts)
  - [`src/services/transactions.service.ts`](../../src/services/transactions.service.ts)
  - [`src/services/budgets.service.ts`](../../src/services/budgets.service.ts)
  - [`src/services/dashboard.service.ts`](../../src/services/dashboard.service.ts)
  - [`src/services/reports.service.ts`](../../src/services/reports.service.ts)
- **Route Handlers (todos con `Cache-Control: no-store, private, max-age=0` y `Vary: Cookie`):**
  - [`src/app/api/categories/route.ts`](../../src/app/api/categories/route.ts) y [`src/app/api/categories/[id]/route.ts`](../../src/app/api/categories/[id]/route.ts)
  - [`src/app/api/transactions/route.ts`](../../src/app/api/transactions/route.ts) y [`src/app/api/transactions/[id]/route.ts`](../../src/app/api/transactions/[id]/route.ts)
  - [`src/app/api/budgets/route.ts`](../../src/app/api/budgets/route.ts) y [`src/app/api/budgets/[id]/route.ts`](../../src/app/api/budgets/[id]/route.ts)
  - [`src/app/api/dashboard/route.ts`](../../src/app/api/dashboard/route.ts)
  - [`src/app/api/reports/route.ts`](../../src/app/api/reports/route.ts) y [`src/app/api/reports/export/route.ts`](../../src/app/api/reports/export/route.ts)

## 5. Implementación de ADR-011 (Seguridad Monetaria Acumulada y Precisión Arbitraria)
- Implementado en [`src/lib/money.ts`](../../src/lib/money.ts) y [`src/lib/financial-aggregations.ts`](../../src/lib/financial-aggregations.ts).
- Todas las sumas se acumulan con `BigInt` (`sumExactCents`, `computeExactWindowTotals`), se serializan en JSON como `ExactCents` (`string` entero base-10) y se formatean con `formatExactCurrency` mediante división entera `BigInt` sin pasar por flotantes IEEE-754.
- Probado en [`tests/money.test.ts`](../../tests/money.test.ts) y [`tests/financial-schemas.test.ts`](../../tests/financial-schemas.test.ts) con sumas por encima de `Number.MAX_SAFE_INTEGER` (`10,800,000,000,000,001` centavos → `"$108,000,000,000,000.01"`).
- La conversión numérica queda aislada en `exactCentsToChartNumber` exclusivamente para el trazado de ejes/barras/sectores en Recharts, mientras tooltips, KPIs, tablas y CSV utilizan siempre los valores exactos `ExactCents`.

## 6. Reglas de Fechas, Períodos y Zona Horaria
- Ancladas a `America/El_Salvador` (UTC-6, sin DST) en [`src/lib/dates.ts`](../../src/lib/dates.ts).
- Las transacciones almacenan `occurred_on` como fecha calendario `DATE` (`YYYY-MM-DD`).
- Los rangos mensuales operan con inicio inclusivo y fin exclusivo (`getMonthRangeExclusiveEnd`), mientras los filtros personalizados `from`/`to` son inclusivos en ambos extremos (`endExclusive = addCalendarDays(to, 1)`).
- `resolvePeriodRange` unifica `current_month`, `last_3_months`, `last_6_months`, `current_year` y `YYYY-MM` entre Dashboard y Reportes.

## 7. Prevención de Truncamiento en Agregaciones
- `fetchAllUserTransactions`, `computeFilteredExactTotals` y `countUsageByCategory` recorren resultados en lotes de `1000` filas (`.range(offset, offset + 999)`) con orden determinista (`occurred_on DESC, created_at DESC, id DESC`), evitando truncamiento silencioso por el tope de PostgREST o por la página activa de UI.
- Verificado en `test:api-security`: consultando `page=1&pageSize=3` sobre 5 transacciones de julio 2026, el endpoint devolvió 3 filas en la página y los totales exactos de las 5 transacciones (`incomeCents: "100000"`, `expenseCents: "20000"`, `netCents: "80000"`).

## 8. Gestión de Categorías y Protección HTTP 409
- Las 12 categorías iniciales sembradas por PostgreSQL y las personalizadas se gestionan con validación Zod (`createCategorySchema`, `updateCategorySchema`) y manejo de errores `23505` (duplicado → `409`) y `23503` (relación activa → `409`).
- Tanto `DELETE /api/categories/[id]` como `PATCH /api/categories/[id]` (cambio de `type`) rechazan con `409 Conflict` cuando existen transacciones o presupuestos vinculados, verificándose tanto a nivel API como en el diálogo de UI en `verify:phase04`.

## 9. Gestión de Transacciones, Filtros y Paginación
- Validación de compatibilidad `category.type === transaction.type` y pertenencia al usuario en cliente, servicio y FK compuesta PostgreSQL.
- Búsqueda sanitizada (`sanitizePostgrestSearch`) contra inyección de comodines y delimitadores de `.or(...)` en PostgREST.
- En el cliente ([`src/components/transactions/transactions-manager.tsx`](../../src/components/transactions/transactions-manager.tsx)), `useDebounce(searchInput, 300)` + `useEffect` con `AbortController` cancelan peticiones obsoletas al teclear o cambiar filtros.

## 10. Gestión de Presupuestos Mensuales y Estados
- Exclusivos para categorías `expense`, con unicidad mensual por usuario y categoría (`409` en duplicados).
- Clasificación exacta en `BigInt` (`getExactBudgetStatus`): `healthy` (`< threshold%`), `warning` (`>= threshold%` y `< 100%`), `limit_reached` (`=== 100%` exacto) y `exceeded` (`> 100%`).
- Verificada la transición completa `warning` (`80%`) → `limit_reached` (`100%`) → `exceeded` (`108%` / `106.7%`) en `test:api-security` y `verify:phase04`.

## 11. Dashboard Conectado a Datos Reales
- [`src/services/dashboard.service.ts`](../../src/services/dashboard.service.ts) + [`src/components/dashboard/dashboard-client.tsx`](../../src/components/dashboard/dashboard-client.tsx).
- El Balance Acumulado refleja siempre el histórico total del usuario y se etiqueta explícitamente como independiente del período seleccionado, mientras Ingresos, Gastos, Flujo Neto, Dona por categoría y los 5 movimientos recientes responden al selector de período.

## 12. Reportes y Exportación CSV Segura
- [`src/services/reports.service.ts`](../../src/services/reports.service.ts), [`src/lib/csv.ts`](../../src/lib/csv.ts) y [`src/components/reports/reports-client.tsx`](../../src/components/reports/reports-client.tsx).
- Reutiliza el mismo motor `financial-aggregations.ts` que Dashboard, garantizando paridad exacta al centavo.
- `buildTransactionsCsv` antepone BOM UTF-8 (`\uFEFF`), usa saltos CRLF, encabezados en español (`Fecha,Tipo,Categoría,Descripción,Notas,Importe USD`), escapado RFC 4180, neutralización de Formula Injection (`=`, `+`, `-`, `@`, `\t`, `\r`, `\n`, incluso con espacios iniciales) en columnas de texto y preserva montos negativos USD (`-60.00`) sin comilla prefijo.

## 13. Uso Real y Documentado de `useState` y `useEffect`
- [`src/hooks/use-debounce.ts`](../../src/hooks/use-debounce.ts): `useState` + `useEffect` con temporizador y `clearTimeout`.
- [`src/components/transactions/transactions-manager.tsx`](../../src/components/transactions/transactions-manager.tsx): `useState` para filtros/paginación/modales y `useEffect` con `AbortController` + sincronización de categoría compatible al cambiar `type`.
- [`src/components/budgets/budgets-manager.tsx`](../../src/components/budgets/budgets-manager.tsx), [`src/components/dashboard/dashboard-client.tsx`](../../src/components/dashboard/dashboard-client.tsx), [`src/components/reports/reports-client.tsx`](../../src/components/reports/reports-client.tsx): `useState` para controles de período/mes/modales y `useEffect` con `AbortController` + estado de carga derivado (`settledKey !== requestKey`) compatible con React 19.

## 14. Migraciones y Decisiones de Base de Datos
- **Sin migraciones SQL nuevas en Fase 04:** El esquema, índices compuestos, FKs `ON DELETE RESTRICT`, columnas generadas y políticas RLS de Fase 03/03.1 cubrieron todos los requisitos de Fase 04 sin requerir intervención SQL manual (respetando ADR-012).

## 15. Seguridad y Autorización Verificada
- Orden estricto en Route Handlers: `Same-Origin` (`403`) → `getUser()` (`401`) → `Zod` (`400`) → Servicio RLS (`404`/`409`).
- Aislamiento verificado con 2 usuarios reales independientes (`TEST_USER_A_*` y `TEST_USER_B_*`): Usuario B recibió `404` al intentar leer/editar/eliminar recursos de Usuario A, `400` al intentar referenciar una categoría de Usuario A, y cero registros ajenos en dashboard, reportes y CSV.
- `service_role` ausente en todo el código fuente; `.env.local` verificado como ignorado por `.gitignore`.

## 16. Escenario Financiero Determinista Ejecutado
Ejecutado automáticamente por [`scripts/test-api-security.mjs`](../../scripts/test-api-security.mjs) en los meses controlados `2026-06` y `2026-07` con limpieza completa al finalizar:
- **Junio 2026:** `+$500.00` ingreso, `-$100.00` gasto → neto `+$400.00`.
- **Julio 2026:** `+$1,000.00` ingreso, 4 gastos (`$60 + $60 + $50 + $30 = $200.00`, incluyendo descripción `=SUM(A1:A5)...` y nota `+cmd|...`) → neto `+$800.00`.
- **Balance acumulado:** delta exacto `+$1,200.00` respecto al estado base del usuario.
- **Presupuesto julio (`$250.00`, umbral `80%`):** `$200.00` gastado (`80.0%`, `warning`) → tras editar transacción a `$250.00` (`100.0%`, `limit_reached`) → tras editar a `$270.00` (`108.0%`, `exceeded`, excedente `$20.00`).
- **Comparativa reportes julio vs. junio:** ingresos `+100.0%`, gastos `+100.0%`, paridad exacta al centavo con Dashboard.

## 17. Archivos Creados y Modificados
- **Dominio, utilidades y esquemas:** `src/types/domain.ts`, `src/lib/money.ts`, `src/lib/dates.ts`, `src/lib/csv.ts`, `src/lib/service-errors.ts`, `src/lib/financial-aggregations.ts`, `src/hooks/use-debounce.ts`, `src/schemas/{common,category,transaction,budget,reports}.schema.ts`.
- **Servicios:** `src/services/_auth.ts`, `src/services/{categories,transactions,budgets,dashboard,reports}.service.ts`.
- **APIs:** `src/app/api/categories/{route,[id]/route}.ts`, `src/app/api/transactions/{route,[id]/route}.ts`, `src/app/api/budgets/{route,[id]/route}.ts`, `src/app/api/dashboard/route.ts`, `src/app/api/reports/{route,export/route}.ts`.
- **UI y páginas:** `src/components/shared/{money-display,kpi-card,budget-progress,financial-chart}.tsx`, `src/components/categories/categories-view.tsx`, `src/components/transactions/transactions-manager.tsx`, `src/components/budgets/budgets-manager.tsx`, `src/components/dashboard/dashboard-client.tsx`, `src/components/reports/reports-client.tsx`, `src/app/(app)/{categories,transactions,budgets,dashboard,reports}/page.tsx`.
- **Pruebas y documentación:** `tests/{money,dates,csv,financial-schemas}.test.ts`, `scripts/{test-api-security,verify-phase-04}.mjs`, `package.json`, `README.md`, `VIBE_CODING.md`, `docs/{ARCHITECTURE,TESTING,IMPLEMENTATION_PLAN}.md`, `docs/prompts/{004-functional-modules,README}.md`, `docs/walkthroughs/004-functional-modules.md`.

## 18. Problemas Encontrados
1. Regla `react-hooks/set-state-in-effect` de React 19 al llamar `setIsLoading(true)` de forma síncrona en `useEffect`.
2. Los Route Handlers `POST` devolvían `400` antes de `401` cuando un usuario no autenticado enviaba un cuerpo inválido.
3. `Response.text()` eliminaba el BOM UTF-8 al decodificar en la prueba automática del CSV y Zod recortaba espacios iniciales en `notes`.
4. Esperas fijas (`700–800 ms`) en `verify:phase04` fallaban por latencia real de Supabase (Oregon) en eliminación y búsqueda con debounce.
5. En tarjetas de 1/3 de columna en escritorio, `ExactExpenseCategoryChart` recortaba lateralmente la dona; y `phase-04-budgets.png` se había capturado antes del cierre del diálogo modal.

## 19. Soluciones Implementadas
1. Estado de carga derivado (`settledKey !== requestKey`) y validación de rango derivada sin `setState` síncrono en `useEffect`.
2. Reordenamiento defensivo en los 9 Route Handlers nuevos ejecutando `requireAuthenticatedContext()` antes del parseo JSON/UUID/Zod (`88b914c`).
3. Lectura de bytes crudos (`await csvRes.body()`) verificando `0xEF 0xBB 0xBF` y la salida sanitizada exacta.
4. Sustitución por esperas deterministas (`waitFor` sobre nodos DOM, toasts y cierre de `Dialog`).
5. Apilamiento vertical centrado en `ExactExpenseCategoryChart` (`9a69358`) y recaptura verificada visualmente.

## 20. Resultados de Validaciones Técnicas
| Validación | Resultado |
| :--- | :--- |
| `npx next typegen` | `EXIT=0` (`✓ Types generated successfully`) |
| `npm run lint` | `EXIT=0` (`0` errores, `0` advertencias) |
| `npm run typecheck` | `EXIT=0` (`0` errores) |
| `npm run test` | `EXIT=0` (**32/32** unitarias aprobadas) |
| `npm run build` | `EXIT=0` (`/` estático `○`, 6 rutas privadas y 11 APIs dinámicas `ƒ`, `Proxy` activo) |
| `npm audit --audit-level=moderate` | `EXIT=0` (**0 vulnerabilidades**) |
| `git check-ignore -v .env.local` | `.gitignore:34:.env* .env.local` |

## 21. Resultados de Pruebas Unitarias, de Integración, Seguridad API y E2E
- **Vitest (`npm run test`):** `32/32` aprobadas (7 archivos).
- **Supabase PostgreSQL + RLS (`npm run test:supabase-rls`):** `18/18` aprobadas.
- **Seguridad API + Escenario determinista (`npm run test:api-security`):** `42/42` aprobadas.
- **Playwright E2E + CSV real (`npm run verify:phase04`):** `18/18` aprobadas, `0` errores de consola, `0` errores de página.
- **Regresión Fase 03 (`npm run verify:phase03`):** `15/15` flujos autenticados + `21/21` responsive + `6/6` redirecciones aprobadas.

## 22. Verificación Visual y Responsive con Datos Reales
- **Matriz 9 rutas × 7 resoluciones (`1920×1080`, `1440×900`, `1366×768`, `1024×768`, `768×1024`, `390×844`, `360×800`):** **63/63 checks con `0px` de desbordamiento horizontal** con datos financieros reales presentes.
- Todas las capturas fueron inspeccionadas visualmente tras la corrección del gráfico de dona y la espera de cierre de modal.

## 23. Evidencias Visuales y Grabaciones
- [Dashboard real en escritorio](../screenshots/phase-04-dashboard-desktop.png)
- [Dashboard real en móvil (390×844)](../screenshots/phase-04-dashboard-mobile.png)
- [Gestión de transacciones con filtros y totales](../screenshots/phase-04-transactions.png)
- [Gestión de categorías con conteo de uso](../screenshots/phase-04-categories.png)
- [Presupuestos mensuales con estado Superado](../screenshots/phase-04-budgets.png)
- [Reportes financieros con exportación CSV confirmada](../screenshots/phase-04-reports.png)
- [Grabación WebM completa del flujo financiero E2E (16.7 MB)](../recordings/phase-04-financial-flow.webm)

## 24. Commits Realizados
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

## 25. Cómo Reproducir las Validaciones
```bash
npx next typegen
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --audit-level=moderate
npm run test:supabase-rls
npm run test:api-security
npm run verify:phase04
npm run verify:phase03
```
*(Requiere `.env.local` configurado con las credenciales públicas de Supabase y las dos cuentas QA de pruebas.)*

## 26. Limitaciones Conocidas y Riesgos Abiertos
- **Registro público SMTP:** `Confirm email` permanece habilitado (`mailer_autoconfirm: false`). La entrega real de correo SMTP y la confirmación manual desde un buzón externo quedan pendientes como validación obligatoria de Fase 06 antes de dar por cerrado el despliegue en producción.
- **Servidor remoto gratuito de Supabase:** La latencia de red hacia la región West US (Oregon) es de ~300–600 ms por operación; todos los formularios bloquean doble envío y muestran retroalimentación clara tras confirmación del servidor.

## 27. Estado de Preparación para la Fase 05
- **Estado:** **Listo para autorización de Fase 05** (optimización, accesibilidad fina, pruebas integrales adicionales y preparación final previa a despliegue en Vercel). No se ha avanzado automáticamente a la Fase 05 ni se ha empujado código a repositorios remotos.
