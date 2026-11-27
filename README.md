# FinTrack — Tus finanzas, bajo control

Aplicación web SaaS de gestión de finanzas personales construida con **Next.js 16 (App Router)**, **React 19**, **TypeScript estricto**, **Tailwind CSS v4**, **shadcn/ui**, **Recharts** y **Supabase**, desarrollada mediante la metodología **Vibe Coding** (desarrollo iterativo guiado por IA).

> **Estado actual:** **Fase 02 implementada y validada técnicamente** (con verificación visual automatizada en Chrome pendiente de habilitar depuración remota). Incluye Next.js 16.4.6, sistema de diseño *Refined Emerald Fintech*, landing page pública, interfaces de autenticación con React Hook Form + Zod, AppShell responsive, 6 módulos financieros preliminares con datos de demostración coherentes y 18/18 pruebas unitarias en Vitest. La autenticación real y base de datos Supabase se integrarán en la Fase 03, y el CRUD/APIs en la Fase 04.

---

## Características Principales

- **Landing Page (`/`)**: Presentación de producto, funcionalidades, flujo de uso, principios de privacidad y accesos directos.
- **Autenticación (`/login`, `/register`)**: Formularios accesibles con React Hook Form + Zod (integración real con Supabase Auth en Fase 03).
- **Dashboard (`/dashboard`)**: KPIs financieros (balance acumulado, ingresos, gastos, flujo neto), evolución mensual, distribución de gastos por categoría y movimientos recientes.
- **Transacciones (`/transactions`)**: Buscador, filtros por tipo y categoría, vista tabular responsive y formulario modal de registro.
- **Categorías (`/categories`)**: Organización por ingresos y gastos, paleta de colores, catálogo de iconos Lucide y borrado seguro (`HTTP 409` en Fase 04).
- **Presupuestos (`/budgets`)**: Seguimiento mensual por categoría de gasto con barras de progreso, advertencias (`>= 80%`) y alertas críticas (`>= 100%`).
- **Reportes (`/reports`)**: Comparaciones mensuales, tendencia ingresos vs. gastos, distribución y vista de exportación CSV.
- **Configuración (`/settings`)**: Información de perfil, moneda USD, zona horaria `America/El_Salvador` y gestión de sesión.

---

## Stack Tecnológico

- **Next.js 16.4.6** (App Router + Turbopack) · **React 19.3.0** · **TypeScript 5** (modo estricto)
- **Tailwind CSS 4.3.3** · **shadcn/ui (`base-nova`)** · **Lucide React** · **Recharts** · **Sonner**
- **React Hook Form** · **Zod 4** · **@hookform/resolvers**
- **Supabase (`@supabase/supabase-js`, `@supabase/ssr`)** *(conexión en Fase 03)*
- **Vitest** · **ESLint**

---

## Instalación y Uso Local

### Requisitos previos
- **Node.js** `>= 22.0.0` (desarrollado con `v22.19.0`)
- **npm** `>= 10`

### Pasos
1. Clona o ubica el repositorio e instala dependencias:
   ```bash
   npm install
   ```
2. Crea `.env.local` a partir de la plantilla documentada cuando se habilite la Fase 03 (en Fase 02 la aplicación funciona localmente sin credenciales de Supabase):
   ```bash
   cp .env.example .env.local
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con Turbopack |
| `npm run build` | Genera el build de producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |
| `npm run typecheck` | Verifica tipos con TypeScript (`tsc --noEmit`) |
| `npm run test` | Ejecuta la suite unitaria de Vitest en modo no interactivo |

---

## Documentación del Proyecto

- [VIBE_CODING.md](./VIBE_CODING.md) — Bitácora real e iterativa del proceso de desarrollo guiado por IA.
- [AGENTS.md](./AGENTS.md) — Instrucciones permanentes y reglas de ingeniería del proyecto.
- [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) — Plan maestro aprobado en Fase 01.
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Arquitectura del sistema y ADRs.
- [docs/TESTING.md](./docs/TESTING.md) — Estrategia y resultados reales de pruebas.
- [docs/prompts/README.md](./docs/prompts/README.md) — Registro íntegro de prompts recibidos.

## Enlace de Producción

*Pendiente de despliegue en Vercel (Fase 06).*
