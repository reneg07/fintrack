# Reglas Persistentes del Workspace — FinTrack

Fuente de verdad completa: `AGENTS.md` en la raíz del proyecto. Este archivo activa los lineamientos críticos en el mecanismo nativo `.agents/rules/` de Antigravity sin duplicar extensamente el contenido.

## Reglas Innegociables
1. **Stack y Next.js 16:** Respetar Next.js 16 (`src/proxy.ts`, APIs async, `node_modules/next/dist/docs/`), React 19, TypeScript estricto, Tailwind v4, shadcn/ui (`base-nova` / `@base-ui/react`) y `npm`.
2. **Arquitectura:** Priorizar Server Components; usar Client Components solo para interactividad, hooks, formularios o gráficos. Mantener datos de demostración aislados en `src/lib/demo-data.ts` (solo hasta ser reemplazados por Supabase en Fase 03/04).
3. **Dinero y Fechas:** Operar importes exclusivamente en centavos enteros (`src/lib/money.ts`) y fechas en zona horaria `America/El_Salvador` (`src/lib/dates.ts`).
4. **Seguridad y Privacidad:** Prohibido usar `service_role` en operaciones de usuario. Nunca commitear `.env.local`, secretos ni datos personales. Variable estándar: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Bloquear borrado de categorías en uso con HTTP `409`.
5. **Calidad y Veracidad:** Ejecutar `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` antes de cerrar cambios relevantes. Jamás inventar pruebas, prompts, errores, commits o capturas.
6. **Documentación y Fases:** Registrar cada prompt en `docs/prompts/`, actualizar `VIBE_CODING.md` por fase, usar Conventional Commits en rama `main` y nunca avanzar a una nueva fase sin autorización explícita del supervisor.
