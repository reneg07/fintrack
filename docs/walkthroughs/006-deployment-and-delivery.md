# Walkthrough Fase 06 — Publicación, Despliegue y Cierre Definitivo de FinTrack

## 1. Estado Final del Proyecto
- **Estado:** **Completado, publicado y verificado en producción** (Fases 01 a 06 cerradas).
- **URL pública de producción (Vercel):** https://fintrack-ten-weld-84.vercel.app
- **URL pública del repositorio (GitHub):** https://github.com/reneg07/fintrack (`HTTP 200` público sin autenticación)

## 2. Resultado de Pruebas Finales y Producción
- **Locales previas al despliegue:** `npm run lint` (`0` errores), `npm run typecheck` (`0` errores), `npm run test` (**36/36**), `npm run build` (`EXIT=0`), `npm audit --audit-level=moderate` (`0 vulnerabilities`).
- **Smoke test en producción (`PROD_URL=https://fintrack-ten-weld-84.vercel.app npm run verify:prod`):** **`15/15` aprobados (`EXIT=0`)**:
  - `GET /api/dashboard` sin sesión → `401` + `Cache-Control: no-store`.
  - Landing `/` (`HTTP 200`, pública sin Vercel Authentication) y `/register` (`HTTP 200`).
  - Redirección de `/dashboard` sin sesión hacia `/login`.
  - Inicio de sesión real con cuenta QA confirmada en Supabase.
  - Carga real de `/categories`, creación de transacción (`$42.50`) persistida en Supabase y reflejada en `/dashboard`.
  - Carga limpia de `/budgets`, `/reports` con descarga CSV real con BOM UTF-8 (`fintrack-transacciones-2026-11-27.csv`) y `/settings`.
  - Vista móvil `390×844` con `0px` de desbordamiento horizontal.
  - Limpieza del registro temporal de prueba, cierre de sesión verificado y **`0` errores de consola o página**.

## 3. Autenticación en Producción y Estado Real del SMTP
- **Autenticación verificada:** Cookies HTTP SSR, `src/proxy.ts`, verificación autoritativa `getUser()`, RLS activo en las 4 tablas y `Site URL` / `Redirect URLs` de Supabase actualizadas al dominio `https://fintrack-ten-weld-84.vercel.app`.
- **Estado real de Custom SMTP:** **No configurado** antes de la entrega. Se mantienen **`Confirm email` activo** (`mailer_autoconfirm: false`) y **RLS activo**. El registro público con correos externos queda documentado como limitación conocida debido a la restricción del SMTP gratuito de Supabase (solo miembros del proyecto, 2/hora); la guía para activar Brevo gratuito está en [`docs/DEPLOYMENT.md`](../DEPLOYMENT.md).

## 4. Evidencias de Producción
- [Landing pública desplegada en Vercel](../screenshots/phase-06-production-landing.png)
- [Dashboard autenticado en producción conectado a Supabase](../screenshots/phase-06-production-dashboard.png)
- Evidencias históricas preservadas en [`docs/screenshots/`](../screenshots) y [`docs/recordings/`](../recordings).

## 5. Commits Finales de Fase 06
- `09249fc` — `chore: prepare production deployment`
- *(y el commit final de cierre documental y enlaces de producción publicado en `origin/main`)*

## 6. Cumplimiento de los 21 Requisitos Académicos
- **21/21 Verificados** en [`docs/ACADEMIC_REQUIREMENTS.md`](../ACADEMIC_REQUIREMENTS.md) (incluyendo `#17` repositorio público en GitHub y `#21` URL pública de producción, con la limitación SMTP documentada transparentemente).

## 7. Limitaciones Pendientes
- Configuración de un servidor **Custom SMTP** (p. ej. Brevo gratuito) en Supabase Dashboard para permitir la confirmación por correo de usuarios públicos externos.

## 8. Instrucciones Mínimas para Evaluar la Aplicación
1. **Abrir producción:** https://fintrack-ten-weld-84.vercel.app (revisar landing, diseño responsive y redirección al visitar `/dashboard` sin sesión).
2. **Revisar código y proceso Vibe Coding:** https://github.com/reneg07/fintrack (`README.md`, `VIBE_CODING.md`, `docs/ACADEMIC_REQUIREMENTS.md`, `docs/AUDIT.md`, `docs/walkthroughs/`).
3. **Ejecución local reproducible:** `git clone https://github.com/reneg07/fintrack.git && cd fintrack && npm ci`, crear `.env.local` desde `.env.example`, ejecutar `npm run dev` y `npm run test`.
