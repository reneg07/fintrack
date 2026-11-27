# Guía de Preparación para Despliegue — FinTrack (Fase 06)

> **Estado actual:** Preparado y verificado localmente para despliegue en **Vercel + Supabase** (Fase 05). **No se ha publicado todavía el repositorio en GitHub ni se ha desplegado en Vercel** (acciones reservadas para autorización de la Fase 06).

---

## 1. Requisitos del Entorno y Portabilidad

- **Node.js:** `>= 22.0.0` (desarrollado y verificado con `v22.19.0`).
- **npm:** `>= 10.0.0` (desarrollado con `10.9.3`, manteniendo `package-lock.json`).
- **Independencia de entorno local:** FinTrack no depende de rutas absolutas de Windows, XAMPP, Apache, servicios locales ni `localhost` hardcodeado. La tipografía `Geist` está autoalojada (`geist@1.9.2`), sin dependencias de Google Fonts en tiempo de compilación.
- **Instalación reproducible verificada (Fase 05):** Se ejecutó un clon limpio sin `.env.local` ni credenciales QA seguido de `npm ci` (`621` paquetes, `0 vulnerabilities`) y `npm run build` (`EXIT=0`, `/` estático `○`, 6 rutas privadas + 11 Route Handlers dinámicos `ƒ`, `Proxy` activo).

---

## 2. Preparación de GitHub (Fase 06)

Antes de ejecutar `git push` al repositorio público:
1. Verificar `git status` limpio y `git check-ignore -v .env.local`.
2. Confirmar que `.env.example` está versionado y sin valores reales.
3. Confirmar que no existen claves `service_role`, tokens, archivos `.env.local` ni variables `TEST_USER_*` en ningún archivo rastreado.
4. Crear el repositorio público en GitHub en la rama `main` y enlazar el remoto (`origin`).

---

## 3. Configuración de Vercel (Fase 06)

| Parámetro | Valor recomendado |
| :--- | :--- |
| **Framework Preset** | Next.js |
| **Node.js Version** | `22.x` |
| **Install Command** | `npm ci` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` (predeterminado) |

### Variables de Entorno en Vercel (Production y Preview)

| Variable | Obligatoria | Descripción |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase (`https://<project-ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí | Clave pública Publishable Key (`sb_publishable_...`) sujeta a RLS |
| `NEXT_PUBLIC_APP_URL` | Sí | URL pública de producción (ej. `https://<tu-app>.vercel.app`, sin barra final) |

> **Regla estricta de seguridad:**
> - **NUNCA** configurar `SUPABASE_SERVICE_ROLE_KEY` ni `sb_secret_*` en Vercel.
> - **NUNCA** agregar `TEST_USER_A_*` ni `TEST_USER_B_*` en Vercel (esas variables son exclusivas de scripts QA locales).

---

## 4. Configuración de Supabase Auth para Producción

En **Supabase Dashboard → Authentication → URL Configuration**:
1. **Site URL:** `https://<tu-app>.vercel.app`
2. **Redirect URLs:**
   - `https://<tu-app>.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` *(opcional si deseas conservar desarrollo local)*
3. Mantener **`Confirm email` habilitado** (`mailer_autoconfirm: false`).

---

## 5. Estrategia de Registro Público y SMTP Personalizado (Obligatorio antes de cerrar Fase 06)

### ¿Por qué el SMTP integrado de Supabase NO sirve para usuarios externos?
De acuerdo con la documentación oficial vigente de Supabase Auth (2025/2026):
- El servidor SMTP integrado tiene un límite estricto de **2 correos por hora**, **solo entrega a direcciones de miembros autorizados del proyecto/organización** (los demás reciben `Email address not authorized`) y bloquea la edición de plantillas en proyectos gratuitos nuevos.
- Por ello, aunque las cuentas QA creadas con *Auto Confirm User* validan sesiones y RLS, **no demuestran la entrega real de correos a usuarios públicos**.

### Comparativa de Opciones Gratuitas Compatibles con Supabase Custom SMTP

| Proveedor | Límite gratuito | ¿Requiere tarjeta? | ¿Requiere dominio propio? | Compatibilidad SMTP / Notas reales |
| :--- | :--- | :---: | :---: | :--- |
| **Brevo** *(Recomendado para producción gratuita)* | 300 correos/día (~9,000/mes) | No | Recomendado (SPF/DKIM); permite remitente único verificado para pruebas controladas | `smtp-relay.brevo.com`, puerto `587`, usar **SMTP Key** (no API Key). Sin dominio propio aumenta probabilidad de carpeta Spam, pero permite validar entregas a correos externos sin costo. |
| **Resend** | 3,000 correos/mes (100/día) | No | **Sí** para enviar a destinatarios externos (sin dominio solo entrega al correo del propietario de la cuenta) | Integración nativa con Supabase y SMTP estándar; excelente DX si el estudiante cuenta con dominio propio. |
| **Gmail SMTP (App Password)** | ~500 correos/día (cuota de cuenta Google) | No | No (usa tu propia dirección Gmail) | `smtp.gmail.com`, puerto `465`/`587`, exige **2FA + Contraseña de aplicación de 16 caracteres**. Válido **solo para pruebas académicas/MVP controladas**, no recomendado para tráfico masivo de producción. |

### Compatibilidad PKCE vs. `token_hash` (Mismo Navegador vs. Otro Dispositivo)
- **`src/app/auth/callback/route.ts` ya soporta ambos flujos oficiales:**
  1. `?code=...` → `supabase.auth.exchangeCodeForSession(code)` (flujo PKCE estándar cuando el usuario abre el enlace en el mismo navegador donde inició el registro).
  2. `?token_hash=...&type=signup` → `supabase.auth.verifyOtp({ type, token_hash })` (flujo OTP independiente del navegador/dispositivo: funciona incluso si el usuario se registra en escritorio y confirma el correo desde su teléfono!).
- **Recomendación para la plantilla *Confirm signup* en Supabase (al activar Custom SMTP en Fase 06):**
  Configurar el enlace del correo como:
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup&next=/dashboard`
  De este modo la confirmación funciona de forma confiable tanto en el mismo navegador como entre distintos dispositivos, respetando además `sanitizeNextPath`.

### Validación Mínima Obligatoria en Fase 06
Con un buzón real autorizado y Custom SMTP configurado en Supabase:
1. Registrar un usuario nuevo desde `https://<tu-app>.vercel.app/register`.
2. Verificar la pantalla *"Confirma tu correo electrónico"*.
3. Recibir el correo real, hacer clic en el enlace hacia `/auth/callback`.
4. Confirmar activación de sesión, acceso a `/dashboard`, creación automática de perfil y 12 categorías iniciales, y capacidad de volver a iniciar sesión en `/login`.

---

## 6. Pruebas Posteriores al Despliegue (Smoke Test de Producción)

1. Abrir `https://<tu-app>.vercel.app/` y verificar `HTTP 200`, tipografía `Geist`, cero errores de consola y vista responsive móvil.
2. Verificar que las 6 rutas privadas sin sesión redirigen a `/login?next=...` y que `/api/dashboard` responde `401` JSON con `Cache-Control: no-store`.
3. Completar el flujo real de registro público + confirmación SMTP + `/auth/callback`.
4. Crear 1 categoría, 1 ingreso, 1 gasto, 1 presupuesto y descargar el archivo CSV desde `/reports`, validando que el balance y gráficos se actualizan y persisten tras recargar.
5. Cerrar sesión y confirmar que el botón atrás no expone datos privados.

---

## 7. Procedimiento de Rollback

- **Aplicación (Vercel):** En **Vercel Dashboard → Deployments**, seleccionar el último despliegue estable previo y pulsar **Instant Rollback** (reversión inmediata sin reconstrucción).
- **Base de datos (Supabase):** Siguiendo **ADR-012**, nunca alterar migraciones históricas ya aplicadas; cualquier reversión de esquema debe aplicarse mediante una nueva migración incremental con timestamp posterior validada primero sobre copia/pruebas.
