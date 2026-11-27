# Estrategia y Registro de Pruebas — FinTrack

Este documento registra la estrategia de aseguramiento de calidad y los resultados **reales y verificables** de cada ejecución de pruebas.

## 1. Pirámide de Validación
1. **Análisis estático:** `npx next typegen`, `npm run lint` (ESLint) y `npm run typecheck` (`tsc --noEmit`).
2. **Pruebas unitarias automatizadas (`npm run test` — Vitest):**
   - `tests/money.test.ts`: centavos enteros, formateo USD, límites seguros y presupuestos.
   - `tests/dates.test.ts`: zona horaria `America/El_Salvador`, medianoche UTC y años bisiestos.
   - `tests/auth-schema.test.ts`: esquemas Zod de inicio de sesión y registro.
   - `tests/demo-data.test.ts`: consistencia matemática de datos de presentación.
   - `tests/security-helpers.test.ts`: prevención de open redirects (`sanitizeNextPath`), traducción segura de errores de autenticación, validación de perfil y protección Same-Origin.
3. **Compilación de producción:** `npm run build` (Next.js 16.4.6 + Turbopack).
4. **Auditoría de dependencias:** `npm audit --audit-level=moderate`.
5. **Verificación E2E y responsive en navegador aislado (Playwright):** `npm run verify:phase02` y `npm run verify:phase03`.
6. **Pruebas reales de Supabase Auth, restricciones PostgreSQL y aislamiento RLS de 2 usuarios:** `npm run test:supabase-rls` (`scripts/test-supabase-rls.mjs`).

---

## 2. Registro Real de Ejecuciones

### Fase 01 — Planificación (2026-11-26)
- Inspección no destructiva del entorno (`Node.js v22.19.0`, `npm 10.9.3`, `Git 2.43.0.windows.1`, workspace vacío). **Estado: Verificado.**

### Fase 02 — Inicialización y Diseño UI/UX (resuelto íntegramente el 2026-11-26)

| Validación | Comando | Resultado real | Estado |
| :--- | :--- | :--- | :--- |
| Linting + TypeScript + Build | `npm run lint`, `npm run typecheck`, `npm run build` | `EXIT=0` (0 errores, 0 advertencias) | **Verificado** |
| Suite unitaria Fase 02 | `npm run test` | 4 archivos, 18/18 tests aprobados | **Verificado** |
| Auditoría visual y responsive (9 rutas × 7 resoluciones + 5 flujos + 11 capturas) | `npm run verify:phase02` (Playwright + Chrome aislado) | 1ª corrida detectó 2 desbordamientos en `/` (`768x1024`: `824px`, `360x800`: `365px`) y `h1Count: 0` en `/login` y `/register`. Tras corregirlos, 2ª corrida: **`EXIT=0`**, **9/9 HTTP 200 con `h1Count: 1`**, **42/42 sin desbordamiento**, **5/5 interactivos OK**, **11/11 capturas reales**, **0 errores de consola/página** | **Verificado** |

### Fase 03 — Base de Datos, Seguridad y Autenticación (2026-11-26)

| Validación | Comando | Resultado real | Estado |
| :--- | :--- | :--- | :--- |
| Generación de tipos de ruta | `npx next typegen` | `✓ Types generated successfully` (`EXIT=0`) | **Verificado** |
| Linting estático | `npm run lint` | `0` errores, `0` advertencias (`EXIT=0`) | **Verificado** |
| TypeScript estricto | `npm run typecheck` | `0` errores (`EXIT=0`) | **Verificado** |
| Suite unitaria Vitest | `npm run test` | **5 archivos, 22/22 tests aprobados** en `1.32s` (`EXIT=0`) | **Verificado** |
| Compilación de producción | `npm run build` | Turbopack `2.7s`, `/` estático (`○`), las 6 rutas privadas y 3 endpoints como dinámicos (`ƒ`), `Proxy` activo (`EXIT=0`) | **Verificado** |
| Auditoría de dependencias | `npm audit --audit-level=moderate` | `found 0 vulnerabilities` (622 paquetes) | **Verificado** |
| Protección de rutas, APIs privadas, open-redirect y formularios Auth en navegador | `npm run verify:phase03` (Playwright + Chrome aislado) | **`EXIT=0`**: 6/6 rutas privadas redirigen a `/login`; `GET /api/profile` responde JSON `503` (sin env) con `Cache-Control: no-store, private` sin redirección HTML; `POST /api/auth/signout` cross-origin rechazado con `403`; `/auth/callback?next=//evil.example/phish` bloqueado sin salir del origen; validación Zod y vista móvil sin desbordamiento; 4 capturas `phase-03-*.png`; 0 errores de consola/página | **Verificado** |
| Pruebas en vivo de Supabase (registro, login, trigger 12 categorías, restricciones PostgreSQL y aislamiento RLS de 2 usuarios) | `npm run test:supabase-rls` | No ejecutado aún porque `.env.local` no existe y el proyecto gratuito de Supabase requiere creación/autorización del usuario | **Bloqueado (espera Supabase)** |
