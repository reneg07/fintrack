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
- **Estado:** **En ejecución** *(se actualizará con todos los resultados finales, pruebas, evidencias visuales y commits reales al concluir la fase)*.
