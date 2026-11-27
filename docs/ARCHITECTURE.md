# Arquitectura de Software — FinTrack

> **Estado actual:** Fase 03 implementada y verificada localmente (migraciones PostgreSQL, RLS, tipos `database.ts`, clientes Supabase SSR, `src/proxy.ts`, autenticación real `/login`, `/register`, `/auth/callback`, protección de rutas, APIs `/api/profile` y `/api/auth/signout`, estados vacíos honestos en rutas privadas). Aplicación remota de migraciones y verificación en vivo de RLS pendientes de proyecto Supabase autorizado en `.env.local`.

## 1. Arquitectura de Autenticación y Renderizado (Fase 03)

```mermaid
flowchart TD
    Browser["Navegador / Client Components"]
    Proxy["src/proxy.ts (Next.js 16 Network Boundary)"]
    Public["(marketing) / — Static"]
    AuthUI["(auth) /login, /register + /auth/callback"]
    AppLayout["(app)/layout.tsx (force-dynamic + getUser())"]
    API["Route Handlers (/api/profile, /api/auth/signout)"]
    Services["Server Services (server-only)"]
    SupaSSR["Supabase SSR Client (Cookies HTTP)"]
    PG["Supabase PostgreSQL + Auth + RLS"]

    Browser --> Proxy
    Proxy -->|"Público"| Public
    Proxy -->|"Redirige a /dashboard si ya autenticado"| AuthUI
    Proxy -->|"Verifica JWT vía getClaims(); redirige a /login si sin sesión"| AppLayout
    Proxy -->|"Nunca redirige HTML; propaga cookies y Cache-Control: no-store"| API
    AppLayout -->|"Verificación autoritativa getUser()"| Services
    API -->|"Validación Same-Origin + Zod + getUser()"| Services
    Services --> SupaSSR
    SupaSSR -->|"Publishable Key + JWT usuario (sin service_role)"| PG
```

## 2. Modelo Entidad-Relación en PostgreSQL (Migraciones Versionadas)

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "1:1 ON DELETE CASCADE"
    AUTH_USERS ||--o{ CATEGORIES : "1:N ON DELETE CASCADE"
    AUTH_USERS ||--o{ TRANSACTIONS : "1:N ON DELETE CASCADE"
    AUTH_USERS ||--o{ BUDGETS : "1:N ON DELETE CASCADE"
    CATEGORIES ||--o{ TRANSACTIONS : "FK (id, user_id, type) RESTRICT"
    CATEGORIES ||--o{ BUDGETS : "FK (id, user_id, 'expense') RESTRICT"

    PROFILES {
        uuid id PK, FK
        text full_name "CHECK length 2..100"
        text currency "DEFAULT USD"
        text timezone "DEFAULT America/El_Salvador"
        timestamptz created_at
        timestamptz updated_at
    }
    CATEGORIES {
        uuid id PK
        uuid user_id FK
        text name "UNIQUE(user_id, type, lower(btrim(name)))"
        text type "income | expense"
        text color "HEX ^#[0-9A-Fa-f]{6}$"
        text icon "Catálogo Lucide verificado"
        boolean is_default
        timestamptz created_at
        timestamptz updated_at
    }
    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        text type "income | expense"
        bigint amount_cents "1..900000000000000"
        date occurred_on
        text description "1..200 chars"
        text notes "NULL | <= 500 chars"
        timestamptz created_at
        timestamptz updated_at
    }
    BUDGETS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        text category_type "GENERATED ALWAYS AS ('expense')"
        date month "CHECK day = 1"
        bigint limit_cents "1..900000000000000"
        smallint alert_threshold_pct "50..99"
        timestamptz created_at
        timestamptz updated_at
    }
```

## 3. Índices Justificados (`20261126230000_initial_schema.sql`)

| Índice | Tabla y Columnas | Consulta que optimiza |
| :--- | :--- | :--- |
| `idx_categories_unique_name` | `categories (user_id, type, lower(btrim(name)))` | Unicidad de nombre insensible a mayúsculas/espacios por usuario y tipo |
| `idx_categories_user_type` | `categories (user_id, type)` | Listado de categorías separado por ingresos y gastos |
| `idx_transactions_user_occurred_on` | `transactions (user_id, occurred_on DESC, created_at DESC)` | Historial paginado y recientes del dashboard |
| `idx_transactions_user_type_occurred_on` | `transactions (user_id, type, occurred_on DESC)` | Agregaciones de ingresos/gastos por período y cálculo de presupuestos |
| `idx_transactions_category_id` | `transactions (category_id)` | Filtro por categoría y validación rápida de `ON DELETE RESTRICT` |
| `idx_budgets_user_month` | `budgets (user_id, month)` | Consulta mensual de presupuestos en `/budgets` |

## 4. Estrategia de Confirmación por Correo y Redirecciones (`/auth/callback`)

- **Confirmación habilitada (recomendada para producción):** `supabase.auth.signUp` crea el usuario sin sesión activa; `RegisterForm` muestra una pantalla clara de verificación de correo. El enlace enviado apunta a `/auth/callback?next=/dashboard`, donde se intercambia el `code` (PKCE) o `token_hash`+`type` (OTP) por cookies HTTP seguras.
- **Confirmación deshabilitada (opcional en pruebas académicas controladas):** Si el supervisor la desactiva temporalmente en Supabase Auth, `signUp` devuelve sesión activa inmediata y redirige a `/dashboard`. No se desactiva silenciosamente en producción.
- **Prevención de Open Redirects:** `sanitizeNextPath` (`src/lib/redirects.ts`) rechaza URLs absolutas, `//`, `\`, esquemas `http:`/`javascript:` y rutas fuera de los 6 prefijos privados de FinTrack.
- **Configuración en Supabase Dashboard (Auth → URL Configuration):**
  - **Site URL (local):** `http://localhost:3000`
  - **Redirect URLs (local):** `http://localhost:3000/auth/callback`
  - **Configuración futura en Vercel (Fase 06):** Actualizar **Site URL** a `https://<tu-app>.vercel.app` y agregar `https://<tu-app>.vercel.app/auth/callback` en Redirect URLs.

## 5. Registro de Decisiones de Arquitectura (ADR)

- **ADR-001:** Aritmética monetaria exclusivamente en centavos enteros (`BIGINT`, techo `900,000,000,000,000` compatible con `Number.MAX_SAFE_INTEGER`).
- **ADR-002:** Zona horaria determinista `America/El_Salvador` y fechas calendario `DATE`.
- **ADR-003 / ADR-009:** Eliminación de `cacheComponents` y `partialPrefetching` en `next.config.ts` + `export const dynamic = "force-dynamic"` en `(app)/layout.tsx` y `Cache-Control: no-store, private` en Route Handlers, garantizando que nunca se cacheen vistas o respuestas privadas entre usuarios mientras `/` permanece estático.
- **ADR-004:** Actualización limpia de `@types/node@^22` alineada con `Node.js v22.19.0` para compatibilidad sin `--force` con `vitest@5.1.2`.
- **ADR-005:** `shadcn/ui` (`base-nova` sobre `@base-ui/react@1.9.0`) nativo para React 19 y Tailwind CSS v4.
- **ADR-006:** Transición de `demo-data.ts`: restringido exclusivamente a la vista previa claramente etiquetada en `/` y pruebas unitarias; las rutas autenticadas muestran estados vacíos reales y categorías reales de PostgreSQL.
- **ADR-007:** Tipografía `Geist` autoalojada (`geist@1.9.2`) para compilación determinista sin red externa.
- **ADR-008:** Contraste WCAG AA ajustado (`--primary: #047857`, `--danger-text: #B91C1C`, `--warning-text: #B45309`).
- **ADR-010:** Defensa en profundidad en autenticación: `src/proxy.ts` (`getClaims()`) + `(app)/layout.tsx` (`getUser()`) + Route Handlers (`getUser()` + validación `Origin` Same-Origin) + RLS forzado y privilegios mínimos (`REVOKE ALL FROM PUBLIC, anon`) en PostgreSQL.
