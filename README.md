# FinTrack — Tus finanzas, bajo control

Aplicación web SaaS de gestión de finanzas personales construida con **Next.js 16 (App Router)**, **React 19**, **TypeScript estricto**, **Tailwind CSS v4**, **shadcn/ui**, **Recharts** y **Supabase**, desarrollada mediante la metodología **Vibe Coding** (desarrollo iterativo guiado por IA).

> **Estado actual:** **Fases 01, 02, 03 y 04 completadas y verificadas** contra Supabase real. Los 6 módulos privados (`/dashboard`, `/transactions`, `/categories`, `/budgets`, `/reports`, `/settings`) operan íntegramente sobre PostgreSQL con RLS, aritmética monetaria exacta `BigInt` (ADR-011), exportación CSV sanitizada contra Formula Injection, `32/32` pruebas unitarias Vitest, `42/42` pruebas de seguridad API y escenario financiero determinista, `18/18` flujos E2E con descarga real CSV y `63/63` matriz responsive con datos reales. Listo para autorización de **Fase 05** (optimización, pulido integral y preparación final de despliegue).

---

## Características Implementadas

- **Landing Page (`/`)**: Presentación de producto, funcionalidades, flujo de uso, pilares de seguridad y vista previa demostrativa claramente etiquetada.
- **Autenticación (`/login`, `/register`, `/auth/callback`)**: Integración real con Supabase SSR por cookies HTTP, formularios React Hook Form + Zod, flujo compatible con confirmación por correo (PKCE/OTP) y protección contra open redirects.
- **Resumen Financiero (`/dashboard` + `GET /api/dashboard`)**: Balance acumulado histórico independiente del período, KPIs por período (`current_month`, `last_3_months`, `last_6_months`, `current_year`, meses individuales), gráficos interactivos Recharts con tooltips exactos en USD y últimos 5 movimientos del período.
- **Transacciones (`/transactions` + `GET/POST /api/transactions`, `GET/PATCH/DELETE /api/transactions/[id]`)**: CRUD completo en centavos enteros USD, búsqueda con debounce (300 ms), filtros combinados por tipo, categoría y rango de fechas calendario (`America/El_Salvador`), paginación real en servidor y totales exactos `BigInt` sobre todo el universo filtrado.
- **Categorías (`/categories` + `GET/POST /api/categories`, `PATCH/DELETE /api/categories/[id]`)**: 12 categorías iniciales sembradas por PostgreSQL + CRUD personalizado con selector de color e icono Lucide, conteo de uso y bloqueo HTTP `409 Conflict` al intentar eliminar o cambiar el tipo de categorías con registros asociados.
- **Presupuestos Mensuales (`/budgets` + `GET/POST /api/budgets`, `PATCH/DELETE /api/budgets/[id]`)**: Límites mensuales exclusivos para categorías de gasto con cálculo real automático en 4 estados (`En control`, `Cerca del límite`, `Límite alcanzado`, `Superado`) y alertas preventivas configurables (50%–99%).
- **Reportes y Exportación CSV (`/reports` + `GET /api/reports`, `GET /api/reports/export`)**: Comparativas contra período anterior (`Sin base previa` cuando la base es `$0.00`), rangos personalizados, tabla mensual exacta y exportación CSV UTF-8 con BOM, RFC 4180 y neutralización de Formula Injection.
- **Configuración (`/settings` + `GET/PATCH /api/profile`, `POST /api/auth/signout`)**: Edición de perfil y cierre de sesión seguro.

---

## Instalación y Configuración Local

### Requisitos previos
- **Node.js** `>= 22.0.0` (desarrollado con `v22.19.0`)
- **npm** `>= 10`
- Proyecto gratuito en [Supabase](https://supabase.com/)

### Pasos
1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Crea `.env.local` a partir de `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
3. Completa en `.env.local` los valores de tu proyecto Supabase (**Project Settings → API**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
4. Aplica las migraciones en **Supabase Dashboard → SQL Editor** ejecutando [`supabase/phase-03-setup.sql`](./supabase/phase-03-setup.sql) (incluye las migraciones base y la migración correctiva UTF-8).
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
| `npm run lint` | Ejecuta ESLint |
| `npm run typecheck` | Ejecuta `tsc --noEmit` en modo estricto |
| `npm run test` | Ejecuta la suite unitaria de Vitest (32 pruebas) |
| `npm run test:supabase-rls` | Suite de integración real de Auth, constraints PostgreSQL y aislamiento RLS de 2 usuarios (18 checks) |
| `npm run test:api-security` | Suite de autorización API, aislamiento entre usuarios y escenario financiero determinista (42 checks) |
| `npm run verify:phase02` | Script Playwright de auditoría visual/responsive de Fase 02 |
| `npm run verify:phase03` | Script Playwright de protección de rutas, APIs JSON y flujos autenticados de Fase 03 |
| `npm run verify:phase04` | Script Playwright E2E financiero completo, descarga real CSV y matriz responsive 9×7 con datos reales |

---

## Documentación del Proyecto

- [VIBE_CODING.md](./VIBE_CODING.md) — Bitácora real e iterativa del desarrollo guiado por IA.
- [AGENTS.md](./AGENTS.md) — Instrucciones permanentes y reglas de ingeniería.
- [docs/walkthroughs/002-initialization-and-design.md](./docs/walkthroughs/002-initialization-and-design.md) — Walkthrough de Fase 02.
- [docs/walkthroughs/003-database-and-authentication.md](./docs/walkthroughs/003-database-and-authentication.md) — Walkthrough de implementación de Fase 03.
- [docs/walkthroughs/003.1-supabase-integration-validation.md](./docs/walkthroughs/003.1-supabase-integration-validation.md) — Walkthrough de validación Supabase y cierre de Fase 03.
- [docs/walkthroughs/004-functional-modules.md](./docs/walkthroughs/004-functional-modules.md) — Walkthrough de módulos funcionales completos de Fase 04.
- [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) — Plan maestro aprobado y adendas.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Arquitectura, diagramas Mermaid y ADRs.
- [docs/TESTING.md](./docs/TESTING.md) — Estrategia y resultados reales de pruebas.
- [docs/prompts/README.md](./docs/prompts/README.md) — Registro íntegro de prompts recibidos.

## Enlace de Producción

*Pendiente de despliegue en Vercel (Fase 06). La validación manual de envío/confirmación SMTP en el registro público permanece como requisito obligatorio previo al cierre de producción.*
