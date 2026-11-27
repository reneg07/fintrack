# FinTrack — Tus finanzas, bajo control

Aplicación web SaaS de gestión de finanzas personales construida con **Next.js 16 (App Router)**, **React 19**, **TypeScript estricto**, **Tailwind CSS v4**, **shadcn/ui**, **Recharts** y **Supabase**, desarrollada mediante la metodología **Vibe Coding** (desarrollo iterativo guiado por IA).

> **Estado actual:** **Fase 02 y Fase 03 completadas y verificadas** contra Supabase real (conectividad, migraciones PostgreSQL + migración correctiva UTF-8, 18/18 pruebas reales de restricciones y aislamiento RLS con 2 usuarios independientes sin `service_role`, flujos autenticados E2E en Playwright con grabación WebM, 63/63 matriz responsive sin desbordamiento y 22/22 pruebas unitarias Vitest). Listo para autorización de **Fase 04** (CRUD financiero completo y reportes CSV).

---

## Características

- **Landing Page (`/`)**: Presentación de producto, funcionalidades, flujo de uso, pilares de seguridad y vista previa demostrativa.
- **Autenticación (`/login`, `/register`, `/auth/callback`)**: Integración real con Supabase SSR por cookies HTTP, formularios React Hook Form + Zod, flujo compatible con confirmación por correo (PKCE/OTP) y protección contra open redirects.
- **Protección de rutas y perfil (`/dashboard`, `/transactions`, `/categories`, `/budgets`, `/reports`, `/settings`)**: `src/proxy.ts` + verificación autoritativa `getUser()` en servidor, lectura automática de las 12 categorías iniciales sembradas por PostgreSQL en `/categories`, edición de perfil en `/settings` (`PATCH /api/profile`) y cierre de sesión (`POST /api/auth/signout`).
- **Base de datos PostgreSQL + RLS (`supabase/migrations/`)**: Tablas `profiles`, `categories`, `transactions` y `budgets` con centavos enteros `BIGINT`, FKs compuestas de propietario/tipo, presupuestos exclusivos para gastos, trigger `SECURITY DEFINER` de 12 categorías iniciales y RLS forzado.

---

## Instalación y Configuración Local

### Requisitos previos
- **Node.js** `>= 22.0.0` (desarrollado con `v22.19.0`)
- **npm** `>= 10`
- Proyecto gratuito en [Supabase](https://supabase.com/) (para autenticación y base de datos en Fase 03+)

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
4. Aplica las migraciones en **Supabase Dashboard → SQL Editor** ejecutando el contenido de [`supabase/phase-03-setup.sql`](./supabase/phase-03-setup.sql) (o mediante Supabase CLI usando `supabase/migrations/`).
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
| `npm run test` | Ejecuta la suite unitaria de Vitest (no interactivo) |
| `npm run verify:phase02` | Script Playwright de auditoría visual/responsive de Fase 02 |
| `npm run verify:phase03` | Script Playwright de protección de rutas, APIs JSON y Auth UI |
| `npm run test:supabase-rls` | Suite de integración real de Auth, constraints PostgreSQL y aislamiento RLS de 2 usuarios (requiere `.env.local`) |

---

## Documentación del Proyecto

- [VIBE_CODING.md](./VIBE_CODING.md) — Bitácora real e iterativa del desarrollo guiado por IA.
- [AGENTS.md](./AGENTS.md) — Instrucciones permanentes y reglas de ingeniería.
- [docs/walkthroughs/002-initialization-and-design.md](./docs/walkthroughs/002-initialization-and-design.md) — Walkthrough de Fase 02.
- [docs/walkthroughs/003-database-and-authentication.md](./docs/walkthroughs/003-database-and-authentication.md) — Walkthrough de implementación de Fase 03.
- [docs/walkthroughs/003.1-supabase-integration-validation.md](./docs/walkthroughs/003.1-supabase-integration-validation.md) — Walkthrough definitivo de validación real Supabase y cierre de Fase 03.
- [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) — Plan maestro aprobado y adendas.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Arquitectura, diagramas Mermaid y ADRs.
- [docs/TESTING.md](./docs/TESTING.md) — Estrategia y resultados reales de pruebas.
- [docs/prompts/README.md](./docs/prompts/README.md) — Registro íntegro de prompts recibidos.

## Enlace de Producción

*Pendiente de despliegue en Vercel (Fase 06).*
