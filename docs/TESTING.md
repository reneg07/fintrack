# Estrategia y Registro de Pruebas — FinTrack

Este documento registra la estrategia de aseguramiento de calidad y los resultados **reales y verificables** de cada ejecución de pruebas.

## 1. Pirámide de Validación
1. **Análisis estático:** ESLint (`npm run lint`) y TypeScript estricto (`npm run typecheck`).
2. **Pruebas unitarias automatizadas (Vitest — `npm run test`):**
   - Conversión exacta USD ↔ centavos enteros, formateo monetario y límites de `Number.MAX_SAFE_INTEGER`.
   - Utilidades de fechas y zona horaria `America/El_Salvador` (incluyendo cruce de medianoche UTC y años bisiestos).
   - Esquemas de validación Zod de formularios de autenticación.
   - Consistencia matemática y relacional de `src/lib/demo-data.ts`.
3. **Compilación de producción:** `npm run build` (Next.js 16.4.6 + Turbopack).
4. **Auditoría de dependencias:** `npm audit --audit-level=moderate`.
5. **Verificación visual, funcional y responsive en navegador:** Revisión real en resoluciones `1920x1080`, `1440x900`, `1366x768`, `1024x768`, `768x1024`, `390x844` y `360x800` con el agente de navegador de Antigravity.

---

## 2. Registro de Ejecuciones

### Fase 01 — Planificación (2026-11-26)
- Verificación no destructiva del entorno local (`Node.js v22.19.0`, `npm 10.9.3`, `Git 2.43.0.windows.1`, directorio vacío). **Estado: Verificado.**

### Fase 02 — Inicialización y Diseño UI/UX (2026-11-26)

| Validación | Comando ejecutado | Resultado real | Estado |
| :--- | :--- | :--- | :--- |
| Generación de tipos de rutas | `npx next typegen` | `✓ Types generated successfully` (`EXIT=0`) | **Verificado** |
| Linting estático | `npm run lint` | `0` errores, `0` advertencias (`EXIT=0`) | **Verificado** |
| TypeScript estricto | `npm run typecheck` | `0` errores (`EXIT=0`) | **Verificado** |
| Suite unitaria Vitest | `npm run test` | **4 archivos, 18/18 tests aprobados** en `985ms`, `0` advertencias | **Verificado** |
| Build de producción | `npm run build` | Compilado con Turbopack en `3.2s`, **12/12 rutas** generadas (`EXIT=0`) | **Verificado** |
| Servidor de desarrollo | `npm run dev` | `Ready in 1166ms` en `http://localhost:3000` | **Verificado** |
| Auditoría de dependencias | `npm audit --audit-level=moderate` | `found 0 vulnerabilities` (619 paquetes auditados) | **Verificado** |
| Verificación en navegador (7 resoluciones + consola + 11 capturas) | Agente `browser` sobre `http://localhost:3000` | No se pudo conectar a Chrome (`ENOENT: DevToolsActivePort`; requiere activar `chrome://inspect/#remote-debugging`) | **Bloqueado** |

#### Detalle de pruebas unitarias ejecutadas (`npm run test`)
1. `tests/money.test.ts` (**7 pruebas aprobadas**):
   - Conversión exacta de `0.01`, `19.99`, `1000000.50`, `$1,234.56`, enteros, negativos y `0` sin deriva flotante.
   - Validación estricta de importes positivos (`parsePositiveDollarsToCents`).
   - Rechazo de formatos inválidos, más de 2 decimales, `NaN`, `Infinity` y desbordamiento sobre `MAX_SAFE_CENTS`.
   - Conversión inversa `centsToDollars` y protección contra enteros no seguros (`Number.MAX_SAFE_INTEGER + 1`).
   - Formateo USD (`formatCurrency`) con signos y negativos.
   - Suma segura en centavos (`sumCents([10, 20]) === 30`) con guardia de desbordamiento.
   - Cálculo de porcentajes y estados de presupuesto (`healthy`, `warning`, `exceeded`).
2. `tests/dates.test.ts` (**4 pruebas aprobadas**):
   - Resolución de fecha calendario y mes en `America/El_Salvador` cruzando medianoche UTC (`2026-11-27T04:15:00Z` → `2026-11-26`; `2026-12-01T05:59:59Z` → `2026-11-30`).
   - Validación estricta de fechas ISO incluyendo año bisiesto (`2024-02-29` válido, `2026-02-29` y `2026-02-30` rechazados).
   - Cálculo de límites exactos de mes (`getMonthBounds`).
   - Formateo en español sin desplazamiento de día.
3. `tests/auth-schema.test.ts` (**4 pruebas aprobadas**):
   - Validación de `loginSchema` (recorte de espacios en correo, rechazo de correos inválidos y contraseñas cortas).
   - Validación de `registerSchema` (soporte de nombres Unicode como `María José Ñúñez`, rechazo de contraseñas no coincidentes o sin dígito).
4. `tests/demo-data.test.ts` (**3 pruebas aprobadas**):
   - Integridad de tipo categoría-transacción y exclusividad de categorías de gasto en presupuestos.
   - Coincidencia exacta entre KPIs de balance/gastos, serie mensual y desglose por categoría.
   - Presencia verificada de estados `healthy`, `warning` y `exceeded` en el mes activo de demostración.
