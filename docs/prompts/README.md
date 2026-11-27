# Registro de Prompts — Proceso Vibe Coding (FinTrack)

Este directorio conserva de forma cronológica e íntegra cada prompt principal recibido del supervisor y cualquier prompt de iteración o corrección relevante durante el desarrollo de **FinTrack**.

## Índice

| ID | Archivo | Fase | Fecha | Resumen |
| :--- | :--- | :--- | :--- | :--- |
| `001` | [001-master-planning.md](./001-master-planning.md) | Fase 01 | 2026-11-26 | Definición maestra del producto, requisitos académicos, arquitectura y solicitud del Implementation Plan |
| `002` | [002-initialization-and-design.md](./002-initialization-and-design.md) | Fase 02 | 2026-11-26 | Aprobación del plan, inicialización de Next.js 16, stack, reglas permanentes, sistema de diseño UI/UX y vistas preliminares |
| `003` | [003-database-and-authentication.md](./003-database-and-authentication.md) | Fase 03 | 2026-11-26 | Resolución visual de Fase 02, regla permanente de Walkthrough, revisión de Next.js, migraciones PostgreSQL + RLS y autenticación Supabase SSR |
| `003.1` | [003.1-supabase-integration-validation.md](./003.1-supabase-integration-validation.md) | Fase 03 (Iteración) | 2026-11-26 | Validación real de conectividad Supabase, permisos PostgreSQL, restricciones, RLS de dos usuarios, flujos autenticados Playwright y cierre de Fase 03 |
| `004` | [004-functional-modules.md](./004-functional-modules.md) | Fase 04 | 2026-11-27 | Implementación completa de módulos funcionales (categorías, transacciones, presupuestos, dashboard, reportes, CSV, ADR-011 y E2E Playwright) |
| `005` | [005-testing-and-optimization.md](./005-testing-and-optimization.md) | Fase 05 | 2026-11-27 | Auditoría técnica integral, cobertura de 28 escenarios, agregaciones >1,000 filas, seguridad API/RLS, accesibilidad, rendimiento y preparación de despliegue |

## Política de Integridad
- Cada prompt se registra textualmente sin alterar ni fabricar contenido.
- Los prompts secundarios de corrección o refinamiento se nombrarán con sufijos alfabéticos (por ejemplo `002-a-responsive-fix.md`).
- Nunca se incluyen credenciales, tokens ni datos personales dentro de este directorio.
