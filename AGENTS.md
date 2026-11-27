<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Instrucciones Permanentes del Proyecto FinTrack

Este archivo es la **fuente de verdad permanente** para cualquier agente o sesión que trabaje en **FinTrack** (`Tus finanzas, bajo control`). Las reglas nativas del workspace de Antigravity en `.agents/rules/fintrack-standards.md` permanecen sincronizadas con este documento.

---

## 1. Contexto Académico y Alcance de Producto
- **Actividad evaluada:** *Implementación de Aplicación Next.js mediante Vibe Coding: Flujo de Desarrollo Guiado por IA*. El proceso iterativo, las validaciones y la documentación real son tan importantes como el resultado final.
- **Producto:** FinTrack, aplicación web SaaS de gestión de finanzas personales en **español (`es-SV`)**, moneda **USD (`$`)** y zona horaria de referencia **`America/El_Salvador`** (UTC-6, sin horario de verano).
- **Módulos incluidos:** Landing page (`/`), Autenticación (`/login`, `/register`), Dashboard (`/dashboard`), Transacciones (`/transactions`), Categorías (`/categories`), Presupuestos (`/budgets`), Reportes con exportación CSV (`/reports`) y Configuración (`/settings`).
- **Exclusiones estrictas:** No implementar conexiones bancarias, pagos electrónicos, suscripciones de pago, asesoramiento financiero automatizado ni un backend independiente fuera de Next.js + Supabase.

## 2. Stack Tecnológico Aprobado
- **Framework:** Next.js 16+ (App Router, Turbopack, `src/`, alias `@/*`), React 19, TypeScript en modo estricto (`"strict": true`).
- **UI y Estilos:** Tailwind CSS v4 (CSS-first en `src/app/globals.css`), `shadcn/ui` (`base-nova` con `@base-ui/react`), `lucide-react`, `recharts`, `sonner`, tipografía `Geist` / `Geist Mono`.
- **Formularios y Validación:** `react-hook-form`, `zod`, `@hookform/resolvers`.
- **Backend / Datos (Fase 03+):** Supabase (PostgreSQL, Auth, `@supabase/ssr`, `@supabase/supabase-js`).
- **Calidad y Pruebas:** ESLint, `tsc --noEmit`, Vitest (`npm run test`), agente de navegador de Antigravity.
- **Gestor de paquetes:** `npm` (mantener `package-lock.json` versionado). Evitar `--force` o `--legacy-peer-deps` sin analizar la causa raíz.

## 3. Arquitectura y Reglas de Componentes
- **Route Groups:** `(marketing)` para `/`, `(auth)` para `/login` y `/register`, `(app)` para las 6 rutas privadas.
- **Server Components por defecto:** Páginas y layouts deben ser Server Components; en Fase 03+ leerán directamente `src/services/*`.
- **Client Components solo cuando sea necesario:** Hooks (`useState`, `useEffect`), formularios interactivos, eventos del navegador, gráficos Recharts y navegación activa.
- **Consumo de APIs internas:** Mutaciones, filtros interactivos y exportación CSV consumirán Route Handlers bajo `src/app/api/*` (Fase 04+).
- **Gestión de estados:** Usar `useState` y `useEffect` de forma justificada (ej. debounce, fetch abortable con `AbortController`, control de modales/filtros). Implementar skeletons (`loading.tsx`), `error.tsx`, `not-found.tsx`, estados vacíos y notificaciones Sonner sin retrasos artificiales.

## 4. Cálculos Financieros y Zona Horaria
- **Aritmética en centavos enteros:** Almacenar, sumar y calcular todos los importes en **centavos enteros seguros** (`amount_cents`, `limit_cents`) respetando `Number.MAX_SAFE_INTEGER`. Prohibido operar dinero con aritmética flotante imprecisa.
- **Formateo USD:** Convertir a representación monetaria USD únicamente en la capa de presentación (`src/lib/money.ts`) usando `tabular-nums`.
- **Zona horaria `America/El_Salvador`:** Resolver "hoy", rangos mensuales y formateo de fechas de forma determinista con `America/El_Salvador` (`src/lib/dates.ts`), guardando fechas calendario (`YYYY-MM-DD`) para evitar desfases UTC.

## 5. Seguridad, Base de Datos y Privacidad
- **Autenticación oficial Next.js 16 + Supabase SSR:** Sesiones por cookies HTTP, `src/proxy.ts` (no `middleware.ts` obsoleto), verificación en servidor con `getUser()` / `getClaims()`. Nunca confiar en `getSession()` en el servidor.
- **Prohibición de `service_role`:** Nunca utilizar la clave `service_role` de Supabase para operaciones habituales de usuarios ni incluirla en el runtime de la aplicación.
- **Variable pública estándar:** Utilizar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (documentadas sin secretos en `.env.example`; `.env.local` siempre excluido en `.gitignore`).
- **Integridad en PostgreSQL + RLS:** Activar Row Level Security en todas las tablas públicas; validar propiedad de categorías, compatibilidad de tipo categoría-transacción, presupuestos exclusivos de categorías de gasto e impedir eliminación de categorías con registros asociados (HTTP `409 Conflict`).
- **Validación:** Validar entradas en cliente y servidor con esquemas Zod. Sanitizar exportaciones CSV contra inyección de fórmulas.
- **Privacidad absoluta:** Jamás exponer credenciales reales, tokens, correos personales ni datos sensibles en código, capturas, logs, commits o documentación.

## 6. Convenciones de Código y Control de Versiones
- **Idioma:** Interfaz de usuario y documentación en español natural; identificadores de código, nombres de archivos y mensajes de commit en inglés.
- **Git:** Rama principal `main`, Conventional Commits (`chore:`, `docs:`, `feat:`, `fix:`, `test:`, `refactor:`). Commits reales, atómicos y revisados antes de confirmar (`git status` + revisión de ausencia de secretos). Nunca crear commits vacíos ni historiales artificiales.

## 7. Pruebas, Documentación Automática, Walkthroughs y Veracidad
- **Validaciones mínimas por fase:** `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` y verificación visual/responsive en navegador (agente de navegador de Antigravity o Playwright con Chromium aislado).
- **Documentación viva obligatoria:** Mantener actualizados `README.md`, `VIBE_CODING.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/prompts/`, `docs/walkthroughs/` y `docs/screenshots/` conforme avanza cada fase.
- **Walkthrough obligatorio por fase:** Al finalizar cada fase se debe generar el artefacto nativo `walkthrough.md` de Antigravity y conservar una copia versionada en `docs/walkthroughs/` (ej. `002-initialization-and-design.md`, `003-database-and-authentication.md`) con enlaces relativos a archivos, capturas reales, grabaciones si existen, commits y pasos de reproducción. El Walkthrough complementa y no sustituye a `VIBE_CODING.md`.
- **Prohibición estricta de inventar evidencias:** Nunca inventar prompts, errores, pruebas, resultados, capturas, métricas de usuarios ni commits. Reportar siempre el estado real (`Implementado`, `Verificado`, `Preliminar`, `Pendiente` o `Bloqueado`).

## 8. Autonomía e Intervención Humana
- **Autonomía total dentro de la fase autorizada:** Crear/editar archivos, instalar dependencias aprobadas, ejecutar comandos no destructivos, corregir errores, probar, capturar evidencias y realizar commits locales sin pedir permiso paso a paso.
- **No avanzar de fase automáticamente** sin recibir el prompt de autorización correspondiente.
- **Solicitar intervención humana únicamente** para cuentas externas, autenticación en plataformas (Supabase, GitHub, Vercel), credenciales reales, permisos, operaciones destructivas, cambios mayores de alcance o cualquier acción que genere costos.
