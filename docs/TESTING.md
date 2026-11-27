# Estrategia y Registro de Pruebas — FinTrack

Este documento registra la estrategia de aseguramiento de calidad y los resultados reales y verificables de cada ejecución de pruebas.

## 1. Pirámide de Validación
1. **Análisis estático:** ESLint (`npm run lint`) y TypeScript estricto (`npm run typecheck`).
2. **Pruebas unitarias automatizadas (Vitest — `npm run test`):**
   - Conversión exacta USD ↔ centavos enteros, formateo monetario y límites de `Number.MAX_SAFE_INTEGER`.
   - Utilidades de fechas y zona horaria `America/El_Salvador`.
   - Consistencia matemática de datos de demostración (Fase 02) y cálculos de agregación.
   - Esquemas de validación Zod de formularios de autenticación.
3. **Compilación de producción:** `npm run build` (Next.js 16 + Turbopack).
4. **Auditoría de dependencias:** `npm audit`.
5. **Verificación visual, funcional y responsive en navegador:** Revisión real con el agente de navegador en resoluciones `1920x1080`, `1440x900`, `1366x768`, `1024x768`, `768x1024`, `390x844` y `360x800`, comprobando consola, accesibilidad, foco y ausencia de desbordamiento horizontal.

## 2. Registro de Ejecuciones

### Fase 01 — Planificación (2026-11-26)
- Verificación no destructiva de entorno local (`node v22.19.0`, `npm 10.9.3`, `git 2.43.0.windows.1`, workspace vacío).

### Fase 02 — Inicialización y Diseño UI/UX (2026-11-26)
*(Esta sección se completará automáticamente al finalizar la ejecución real de `lint`, `typecheck`, `test`, `build`, `npm audit` y la verificación en navegador de esta fase.)*
