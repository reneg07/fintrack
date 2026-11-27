# VIBE_CODING.md — Bitácora Real de Desarrollo Guiado por IA

Este documento registra de forma verídica, cronológica e iterativa el proceso real de desarrollo de **FinTrack** (*Tus finanzas, bajo control*) bajo la metodología **Vibe Coding**. Ningún dato, error, prueba, commit o evidencia ha sido fabricado.

---

## Fase 01 — Planificación, Arquitectura e Instrucciones Permanentes

- **Identificador de fase:** `Fase 01`
- **Fecha real de ejecución:** `2026-11-26`
- **Prompt recibido:** [docs/prompts/001-master-planning.md](./docs/prompts/001-master-planning.md)
- **Objetivo:** Inspeccionar el entorno de forma no destructiva, validar compatibilidad del stack tecnológico y elaborar el Implementation Plan completo cubriendo arquitectura, modelo de datos, seguridad, rutas, APIs, diseño, pruebas y cumplimiento académico.
- **Propuesta inicial:** Arquitectura modular en Next.js 16 (App Router + Route Groups) con Supabase SSR (`proxy.ts`), almacenamiento monetario en centavos enteros (`BIGINT`), integridad referencial compuesta en PostgreSQL y diseño *Refined Emerald Fintech*.
- **Decisiones técnicas:**
  1. Usar `npm` como gestor de paquetes (ya instalado en el entorno).
  2. Incorporar `vitest` como dependencia de desarrollo gratuita para pruebas unitarias de utilidades financieras y esquemas Zod.
  3. Estandarizar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para la clave pública de Supabase.
  4. Impedir el borrado de categorías con transacciones o presupuestos asociados mediante restricciones FK `ON DELETE RESTRICT` y respuestas HTTP `409 Conflict`.
  5. Adoptar `AGENTS.md` + `.agents/rules/fintrack-standards.md` siguiendo la documentación oficial de personalización de Antigravity.
- **Implementaciones realizadas:** Inspección del entorno y elaboración del Implementation Plan completo sin modificar el workspace (manteniéndolo limpio para inicialización en Fase 02).
- **Archivos relevantes:**
  - [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)
  - [docs/prompts/001-master-planning.md](./docs/prompts/001-master-planning.md)
- **Problemas realmente encontrados:**
  1. `npx --version` dentro del entorno aislado devolvió `npm error code E403`; se verificó con `npx -v` confirmando `npx 10.9.3`.
  2. `pnpm`, `gh`, `vercel` y `supabase` CLI no estaban instalados globalmente.
  3. `git init.defaultBranch` no estaba configurado globalmente.
- **Soluciones implementadas:** Se adoptó `npm` como gestor único, se planificó renombrar/inicializar la rama explícitamente como `main` y usar migraciones SQL versionadas + paneles/integraciones oficiales para Fase 03 y Fase 06.
- **Iteraciones efectuadas:** 1 iteración de análisis, verificación documental web y aprobación del supervisor.
- **Comandos ejecutados:** Inspección de directorio (`Get-ChildItem -Force`), verificación de versiones (`node`, `npm`, `npx`, `pnpm`, `git`, `gh`, `vercel`, `supabase`) y lectura de configuración básica de Git.
- **Pruebas realizadas:** Validación no destructiva del entorno (`DirCount: 0`, `Node.js v22.19.0`, `npm 10.9.3`, `Git 2.43.0.windows.1`).
- **Resultados verificables:** Entorno apto y Implementation Plan aprobado íntegramente por el supervisor en el Prompt 002.
- **Referencias a commits:** Sin commits en Fase 01 (el repositorio Git se inicializó en Fase 02).
- **Estado final:** **Completada y aprobada**.

---

## Fase 02 — Inicialización del Proyecto, Dependencias, Sistema de Diseño y Layouts

- **Identificador de fase:** `Fase 02`
- **Fecha real de ejecución:** `2026-11-26`
- **Prompt recibido:** [docs/prompts/002-initialization-and-design.md](./docs/prompts/002-initialization-and-design.md)
- **Objetivo:** Inicializar Next.js 16 directamente en `C:\xampp\htdocs\vibe_coding` con nombre `fintrack`, instalar y verificar el stack aprobado, configurar Git en `main`, crear las instrucciones permanentes (`AGENTS.md` + `.agents/rules/fintrack-standards.md`) y la documentación base, implementar el sistema de diseño *Refined Emerald Fintech*, construir la landing page `/`, las interfaces de autenticación `/login` y `/register` con React Hook Form + Zod, el AppShell responsive y las 6 vistas preliminares de módulos financieros con datos de demostración matemáticamente consistentes, configurar Vitest y ejecutar las validaciones técnicas y visuales disponibles.

### Versiones realmente instaladas (verificadas en `node_modules`)
- `next`: `16.4.6` · `react`: `19.3.0` · `react-dom`: `19.3.0`
- `typescript`: `5.9.3` · `tailwindcss`: `4.3.3` · `@tailwindcss/turbopack`: `4.3.3`
- `shadcn` CLI: `4.23.1` (`style: base-nova` sobre `@base-ui/react@1.9.0`)
- `lucide-react`: `1.81.0` · `recharts`: `3.11.1` · `sonner`: `2.0.8` · `geist`: `1.9.2`
- `@supabase/supabase-js`: `2.119.2` · `@supabase/ssr`: `0.12.7`
- `zod`: `4.6.7` · `react-hook-form`: `7.92.0` · `@hookform/resolvers`: `7.0.9`
- `eslint`: `9.39.5` · `eslint-config-next`: `16.4.6` · `vitest`: `5.1.2` · `@types/node`: `22.20.7`

### Decisiones técnicas aplicadas
1. **Contraste WCAG AA en botones y textos de estado:** Se mantuvo `#059669` (`--brand-primary`), `#10251F` (`--brand-dark`), `#34D399` (`--brand-accent`) y `#DC5656` (`--danger`) como paleta base, ajustando `--primary` de botones a `#047857` (ratio 5.48:1 sobre blanco), `--danger-text` a `#B91C1C` y `--warning-text` a `#B45309` para asegurar contraste WCAG AA en texto pequeño.
2. **Tipografía Geist autoalojada (`geist@1.9.2`):** Al fallar la descarga de `next/font/google` en compilación sin salida a internet, se adoptó el paquete oficial `geist` de Vercel (`geist/font/sans` y `geist/font/mono`), logrando tipografía Geist auténtica con compilación 100% determinista sin depender de red externa.
3. **Resolución limpia de peer dependencies:** Se actualizó `@types/node` a `^22` (acorde a `Node.js v22.19.0`) para instalar `vitest@5.1.2` sin usar `--force` ni `--legacy-peer-deps`.
4. **Buenas prácticas web modernas aplicadas:** Atributos `autocomplete="username"`/`"new-password"`/`"name"` y `spellCheck={false}` en autenticación; `aria-invalid` explícito y `aria-describedby` condicional en errores; `aria-current="page"` con indicador visual no dependiente solo del color en navegación; regiones de tabla desplazables por teclado (`tabIndex={0}`, `role="region"`).
5. **Aislamiento de datos de demostración:** Todo dato ficticio vive únicamente en `src/lib/demo-data.ts` y las métricas/gráficos se derivan matemáticamente de un único conjunto de registros en centavos enteros.

### Implementaciones realizadas y archivos relevantes
- **Configuración y entorno:** `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `components.json`, `vitest.config.mts`, `.env.example`, `.gitignore`.
- **Reglas permanentes y documentación:** `AGENTS.md`, `.agents/rules/fintrack-standards.md`, `README.md`, `VIBE_CODING.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/prompts/*`.
- **Sistema de diseño, utilidades y compartidos:** `src/app/globals.css`, `src/app/layout.tsx`, `src/app/icon.svg`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/loading.tsx`, `src/types/domain.ts`, `src/lib/money.ts`, `src/lib/dates.ts`, `src/lib/category-icons.ts`, `src/lib/demo-data.ts`, `src/components/shared/*` (11 componentes) y `src/components/ui/*` (17 componentes shadcn/ui).
- **Landing Page (`/`):** `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/page.tsx`, `src/components/marketing/marketing-navbar.tsx`, `src/components/marketing/marketing-footer.tsx`.
- **Autenticación (`/login`, `/register`):** `src/schemas/auth.schema.ts`, `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/components/auth/login-form.tsx`, `src/components/auth/register-form.tsx`.
- **AppShell y 6 módulos financieros:** `src/app/(app)/layout.tsx`, `src/app/(app)/loading.tsx`, `src/app/(app)/error.tsx`, `src/components/layout/*`, y páginas/vistas de `/dashboard`, `/transactions`, `/categories`, `/budgets`, `/reports` y `/settings`.
- **Pruebas unitarias:** `tests/money.test.ts`, `tests/dates.test.ts`, `tests/auth-schema.test.ts`, `tests/demo-data.test.ts`.

### Problemas realmente encontrados y soluciones aplicadas
1. **`create-next-app` bloqueado en sandbox sin red (`E403`)**: Se reintentó únicamente la instalación de paquetes con acceso de red habilitado (`BypassSandbox`), manteniendo compilación, lint y tests dentro del sandbox estándar.
2. **Sintaxis `&&` inválida en Windows PowerShell 5.1**: Se reemplazó por `; if ($LASTEXITCODE -eq 0) { ... }`.
3. **Conflicto `ERESOLVE` al instalar `vitest@5.1.2`**: `create-next-app` fijó `@types/node@^20`, incompatible con el peer optional de `vitest@5.1.2`. Se analizó la causa raíz y se actualizó `@types/node` a `^22.20.7` (igualando `Node.js v22.19.0`), resolviendo el árbol con `0` vulnerabilidades.
4. **Rama inicial `master` y nombre `vibe_coding`**: Se renombró la rama a `main` (`git branch -M main`) y se actualizó `"name": "fintrack"` en `package.json`.
5. **Error `TS2737` (literales BigInt `100n`/`0n` en `target: ES2017`) y tipos obsoletos en `.next/types/validator.ts`**: Se sustituyeron por `BigInt(100)` / `BigInt(0)` en `src/lib/money.ts` y se ejecutó `npx next typegen` para regenerar tipos tras mover `/` a `(marketing)/page.tsx`.
6. **Fallo de `next build` descargando Google Fonts sin red**: Se instaló `geist@1.9.2` (fuente oficial autoalojada) en `src/app/layout.tsx`, logrando compilación 100% exitosa en `3.2s` sin dependencias de red.
7. **Advertencia de Vite 8 sobre `vitest.config.ts` (CJS + `__dirname`)**: Se migró a `vitest.config.mts` usando `import.meta.dirname`, eliminando todas las advertencias en `npm run test`.
8. **Bloqueo en conexión del agente de navegador de Antigravity**: Al ejecutar la auditoría en Chrome, la herramienta devolvió `ENOENT: no such file or directory, open 'C:\Users\Soporte\AppData\Local\Google\Chrome\User Data\DevToolsActivePort'` porque la depuración remota de Chrome (`chrome://inspect/#remote-debugging`) no está activada en el equipo anfitrión. Se documentó con transparencia como limitación externa sin inventar capturas ni resultados.

### Iteraciones efectuadas
1. Inicialización base con `create-next-app@16.4.6` y corrección de rama/paquete/`.gitignore`.
2. Resolución de peer dependency de `vitest` y alta de 17 componentes `shadcn/ui` (`base-nova`).
3. Creación de reglas permanentes y estructura documental.
4. Construcción del sistema de diseño, utilidades puras y 11 componentes reutilizables.
5. Implementación secuencial de Landing Page, Autenticación, AppShell y los 6 módulos financieros.
6. Iteración de validación y corrección: primera ejecución de `lint`/`typecheck`/`test`/`build` → corrección de `BigInt`, regeneración `next typegen`, migración a `geist` local y `vitest.config.mts` → segunda ejecución 100% limpia (`EXIT=0`).
7. Intento de verificación visual en navegador con servidor `npm run dev` activo (`Ready in 1166ms`) y registro del bloqueo externo de Chrome Remote Debugging.

### Comandos ejecutados y resultados verificables
- `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes` → Exitoso (`next@16.4.6`).
- `npm install lucide-react recharts @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers sonner geist` y `npm install -D @types/node@^22 vitest` → Exitoso (`0 vulnerabilities`).
- `npx shadcn@latest init -d -y` y `npx shadcn@latest add ...` (17 componentes) → Exitoso.
- `npm audit --audit-level=moderate` → **`found 0 vulnerabilities`** (619 paquetes auditados).
- `npx next typegen` → **`EXIT=0`**.
- `npm run lint` → **`EXIT=0`** (0 errores, 0 advertencias).
- `npm run typecheck` → **`EXIT=0`** (TypeScript estricto limpio).
- `npm run test` → **`EXIT=0`** (**4 archivos, 18/18 pruebas aprobadas** en `985ms`, 0 advertencias).
- `npm run build` → **`EXIT=0`** (compilación Turbopack en `3.2s`, 12/12 rutas generadas).
- `npm run dev` → **`Ready in 1166ms`** en `http://localhost:3000`.
- Verificación visual en navegador y capturas `docs/screenshots/phase-02-*.png` → **Bloqueado** por falta de depuración remota activa en Chrome (`DevToolsActivePort`).

### Referencias a commits (Fase 02)
- `2f33570` — `Initial commit from Create Next App` (base generada por CLI)
- `cc46c23` — `chore: initialize FinTrack Next.js project`
- `a32798f` — `docs: establish architecture and vibe coding guidelines`
- `6ee5009` — `feat: implement FinTrack design system`
- `0e845b9` — `feat: build responsive marketing landing page`
- `81e3964` — `feat: create authentication interfaces`
- `63ef233` — `feat: implement responsive application shell`
- `404c4a8` — `feat: scaffold financial module interfaces`
- `10f5875` — `test: configure testing and validate initial application`
- *(Seguido del commit de cierre documental `docs: document phase 02 implementation and validation`)*

### Estado final de la Fase 02
- **Implementado y verificado técnicamente** (Next.js 16.4.6, stack completo, 9 rutas, sistema de diseño, reglas permanentes, documentación, 18/18 pruebas unitarias, lint, typecheck, build, dev server y 0 vulnerabilidades).
- **Bloqueado externamente (solo evidencia visual automatizada):** Verificación en vivo con el agente de navegador y generación de capturas PNG en `docs/screenshots/`, pendiente de habilitar depuración remota en Chrome (`chrome://inspect/#remote-debugging`).
