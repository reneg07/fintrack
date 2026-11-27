# FinTrack — Tus finanzas, bajo control

Aplicación web SaaS de gestión de finanzas personales construida con **Next.js 16 (App Router)**, **React 19**, **TypeScript estricto**, **Tailwind CSS v4**, **shadcn/ui**, **Recharts** y **Supabase**, desarrollada mediante la metodología **Vibe Coding** (desarrollo iterativo guiado por IA).

> **Estado actual:** **Fases 01 a 05 completadas, auditadas y verificadas** contra Supabase real. Todos los hallazgos críticos, altos y medios de auditoría fueron corregidos y verificados (`36/36` pruebas unitarias Vitest, `18/18` RLS, `42/42` seguridad API, `18/18` E2E Fase 04 + `63/63` responsive, `24/24` Fase 05 incluyendo prueba real de volumen de `1,005` filas en Supabase, `15/15` regresión Fase 03, `0` vulnerabilidades en `npm audit` e instalación limpia reproducible `npm ci` + `npm run build`). **Listo para autorización de Fase 06** (publicación en GitHub, despliegue en Vercel y validación SMTP real).

---

## Características Implementadas

- **Landing Page (`/`)**: Presentación de producto, funcionalidades, flujo de uso, pilares de seguridad y vista previa demostrativa claramente etiquetada (`FCP/LCP = 152 ms`, `CLS = 0`, `0` fuentes externas en laboratorio local de producción).
- **Autenticación (`/login`, `/register`, `/auth/callback`)**: Integración real con Supabase SSR por cookies HTTP, formularios React Hook Form + Zod, compatibilidad dual PKCE (`?code=`) y OTP (`?token_hash=`), y protección contra open redirects.
- **Resumen Financiero (`/dashboard` + `GET /api/dashboard`)**: Balance acumulado histórico independiente del período, KPIs exactos `BigInt` por período, gráficos interactivos Recharts con tooltips exactos en USD y últimos 5 movimientos del período.
- **Transacciones (`/transactions` + `/api/transactions`, `/api/transactions/[id]`)**: CRUD completo en centavos enteros USD, búsqueda sanitizada con debounce (`300 ms`), filtros por tipo/categoría/fechas (`America/El_Salvador`), paginación en servidor y totales exactos `BigInt` sobre todo el universo filtrado.
- **Categorías (`/categories` + `/api/categories`, `/api/categories/[id]`)**: 12 categorías iniciales sembradas por PostgreSQL + CRUD personalizado con conteo real de uso y bloqueo HTTP `409 Conflict` para categorías vinculadas.
- **Presupuestos Mensuales (`/budgets` + `/api/budgets`, `/api/budgets/[id]`)**: Límites mensuales exclusivos para categorías de gasto con cálculo real en 4 estados (`En control`, `Cerca del límite`, `Límite alcanzado`, `Superado`) y redondeo visual consistente (`99.9%` / `100.0%` / `100.1%`).
- **Reportes y Exportación CSV (`/reports` + `/api/reports`, `/api/reports/export`)**: Comparativas contra período previo (`Sin base previa` cuando base es `$0.00`), rangos personalizados, tabla mensual exacta y descarga CSV UTF-8 con BOM, RFC 4180 y protección contra Formula Injection verificada hasta >1,000 filas.
- **Configuración (`/settings` + `/api/profile`, `/api/auth/signout`)**: Edición de perfil sincronizada con el encabezado y cierre de sesión seguro.

---

## Instalación y Configuración Local

### Requisitos previos
- **Node.js** `>= 22.0.0` (desarrollado con `v22.19.0`)
- **npm** `>= 10`
- Proyecto gratuito en [Supabase](https://supabase.com/)

### Pasos
1. Instala las dependencias de forma reproducible:
   ```bash
   npm ci
   ```
2. Crea `.env.local` a partir de `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
3. Completa en `.env.local` los valores de tu proyecto Supabase (**Project Settings → API**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
4. Aplica las migraciones en **Supabase Dashboard → SQL Editor** ejecutando [`supabase/phase-03-setup.sql`](./supabase/phase-03-setup.sql).
5. En **Supabase Dashboard → Authentication → URL Configuration**, configura:
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** `http://localhost:3000/auth/callback`
6. Inicia la aplicación:
   ```bash
   npm run dev
   ```

### Scripts disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con Turbopack |
| `npm run build` | Genera el build de producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint (incluye reglas estrictas de React 19) |
| `npm run typecheck` | Ejecuta `tsc --noEmit` en modo estricto |
| `npm run test` | Ejecuta la suite unitaria de Vitest (36 pruebas) |
| `npm run test:supabase-rls` | Suite de integración real de Auth, constraints PostgreSQL y aislamiento RLS de 2 usuarios (18 checks) |
| `npm run test:api-security` | Suite de autorización API, aislamiento entre usuarios y escenario financiero determinista (42 checks) |
| `npm run verify:phase02` | Script Playwright de auditoría visual/responsive de Fase 02 |
| `npm run verify:phase03` | Script Playwright de protección de rutas, APIs JSON y flujos autenticados de Fase 03 |
| `npm run verify:phase04` | Script Playwright E2E financiero completo, descarga real CSV y matriz responsive 9×7 con datos reales |
| `npm run verify:phase05` | Suite integral Fase 05: cobertura 28/28, volumen real `1,005` filas Supabase, accesibilidad, resiliencia y rendimiento |

---

## Documentación del Proyecto

- [VIBE_CODING.md](./VIBE_CODING.md) — Bitácora real e iterativa del desarrollo guiado por IA.
- [AGENTS.md](./AGENTS.md) — Instrucciones permanentes y reglas de ingeniería.
- [docs/AUDIT.md](./docs/AUDIT.md) — Auditoría técnica completa de Fase 05 (hallazgos por severidad y matriz de 28 escenarios).
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — Guía de despliegue en Vercel, configuración Supabase Auth y estrategia SMTP gratuita.
- [docs/ACADEMIC_REQUIREMENTS.md](./docs/ACADEMIC_REQUIREMENTS.md) — Matriz verificable de cumplimiento de los 21 requisitos académicos.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Arquitectura, diagramas Mermaid y ADRs (`ADR-001` a `ADR-013`).
- [docs/TESTING.md](./docs/TESTING.md) — Estrategia y registro real de todas las suites de prueba.
- [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) — Plan maestro aprobado y adendas.
- [docs/prompts/README.md](./docs/prompts/README.md) — Registro íntegro de prompts recibidos (`001` a `005`).
- Walkthroughs versionados: [Fase 02](./docs/walkthroughs/002-initialization-and-design.md) · [Fase 03](./docs/walkthroughs/003-database-and-authentication.md) · [Fase 03.1](./docs/walkthroughs/003.1-supabase-integration-validation.md) · [Fase 04](./docs/walkthroughs/004-functional-modules.md) · [Fase 05](./docs/walkthroughs/005-testing-and-optimization.md).

## Enlace de Producción

*Pendiente de despliegue en Vercel y validación manual de registro público con Custom SMTP (Fase 06).*
