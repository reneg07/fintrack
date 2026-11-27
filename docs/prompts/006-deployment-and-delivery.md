# PROMPT-006 — Publicación, despliegue y cierre definitivo de FinTrack

La Fase 05 queda aprobada.

Estamos cerca del límite de tiempo de entrega y únicamente
disponemos del 15% de los tokens restantes.

Prioriza la ejecución sobre la planificación y las explicaciones.
Trabaja autónomamente, utiliza el contexto existente y evita
consumir tokens en tareas redundantes.

El objetivo es finalizar FinTrack en esta última iteración.

## 1. Registro de la iteración

Guarda este prompt en:

docs/prompts/006-deployment-and-delivery.md

Actualiza VIBE_CODING.md y el índice de prompts.

Conserva todas las instrucciones persistentes, decisiones
arquitectónicas y documentación de las fases anteriores.

## 2. Prioridades de ejecución

P0 — Repositorio público en GitHub.
P0 — Despliegue público funcional en Vercel.
P0 — README.md con enlaces reales.
P0 — VIBE_CODING.md completo.
P0 — Seguridad de credenciales y datos.
P0 — Validación básica de producción.
P1 — Configuración y validación SMTP real.
P1 — Walkthrough definitivo.

No implementes nuevas funcionalidades.
No rediseñes la aplicación.
No repitas la auditoría completa de Fase 05.
No ejecutes nuevamente las pruebas de volumen de 1005 filas.
No generes documentación redundante.
No contrates servicios ni generes costos.

## 3. GitHub

Comprueba si GitHub CLI está disponible y autenticado.

Si cuentas con autorización y acceso, crea un repositorio
público llamado fintrack en la cuenta del usuario.

Conserva el historial completo de commits descriptivos.

Antes de publicar, realiza una comprobación final de secretos,
incluyendo historial Git, credenciales QA y evidencias.

Verifica:

- .env.local excluido.
- .env.example incluido.
- Ausencia de contraseñas y claves administrativas.
- Ausencia de tokens y estados de sesión.
- Ausencia de información financiera privada.
- Documentación y evidencias seguras para publicación.

Si encuentras una credencial expuesta, detén la publicación
hasta resolverla de forma segura.

No inventes enlaces.
No utilices force push.
No sobrescribas repositorios existentes.

Publica la rama main y verifica que el repositorio sea
accesible públicamente sin autenticación.

Si necesitas autorización humana, proporciona únicamente
los pasos o comandos indispensables.

## 4. Vercel

Utiliza Vercel Hobby y el repositorio GitHub de FinTrack.

Comprueba si dispones de Vercel CLI o acceso autorizado.

Si es posible, realiza directamente la configuración
y el despliegue.

Configura Next.js y una versión de Node.js compatible.

Variables de producción:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL

Obtén las dos primeras desde .env.local sin imprimirlas.

NEXT_PUBLIC_APP_URL debe corresponder a la URL pública
definitiva de producción.

No configures TEST_USER_* en Vercel.
No utilices service_role.
No publiques credenciales QA.
No solicites tokens mediante el chat.

Si necesitas establecer primero el dominio del proyecto,
actualiza NEXT_PUBLIC_APP_URL y realiza el despliegue
definitivo posteriormente.

Verifica que la URL de producción sea pública y no esté
protegida por autenticación de Vercel.

## 5. Supabase

Una vez definida la URL de producción, configura o solicita
al usuario configurar:

Site URL:
https://DOMINIO-REAL-DE-FINTRACK

Redirect URL:
https://DOMINIO-REAL-DE-FINTRACK/auth/callback

Conserva también la Redirect URL de desarrollo:

http://localhost:3000/auth/callback

Mantén RLS activo.
Mantén Confirm email activo.
No vuelvas a ejecutar migraciones aplicadas.

## 6. SMTP y registro público

Utiliza la estrategia existente en docs/DEPLOYMENT.md.

Prioriza una solución gratuita compatible con Supabase.

Brevo es la alternativa recomendada en la Fase 05,
sujeta a sus condiciones vigentes y disponibilidad.

Si requiere una cuenta, remitente o configuración manual,
agrupa las instrucciones indispensables para el usuario.

No dediques tiempo excesivo a comparar proveedores.

Comprueba, cuando sea posible:

Registro público > recepción de correo >
confirmación > callback > acceso autenticado.

Si SMTP no puede completarse antes de la entrega,
no bloquees la publicación académica por ese motivo.

Mantén Confirm email activo, informa claramente de la
limitación de registro público y utiliza las cuentas QA
confirmadas para validar el funcionamiento en producción.

No declares verificado el registro público si no ha
sido completado realmente.

No publiques las contraseñas de las cuentas QA.

## 7. Validación de producción

Aprovecha los resultados aprobados de la Fase 05.

Ejecuta únicamente las comprobaciones finales necesarias:

- npm run lint
- npm run typecheck
- npm run test
- npm run build

Si realizas modificaciones de código, ejecuta las pruebas
de regresión directamente relacionadas.

Contra la URL real de producción verifica:

- Landing pública.
- Login.
- Registro.
- Protección de rutas privadas.
- Inicio de sesión con una cuenta QA.
- Dashboard conectado a Supabase.
- CRUD básico de transacciones.
- Categorías.
- Presupuestos.
- Reportes.
- Exportación CSV.
- Perfil.
- Cierre de sesión.
- Vista móvil.
- Ausencia de errores críticos.
- API privada devuelve 401 sin autenticación.

Utiliza datos controlados de prueba.
Elimina únicamente los registros creados para esta validación.

No repitas todas las matrices históricas.

## 8. README y documentación final

Actualiza README.md con:

- Nombre y descripción del proyecto.
- URL pública real.
- URL del repositorio GitHub.
- Funcionalidades principales.
- Stack tecnológico.
- Arquitectura resumida.
- Instrucciones de instalación.
- npm ci.
- Configuración de .env.local.
- npm run dev.
- Comandos de pruebas.
- Capturas existentes.
- Limitaciones conocidas.

Verifica que VIBE_CODING.md documente realmente:

- Herramientas de IA utilizadas.
- Prompts ejecutados.
- Iteraciones.
- Decisiones técnicas.
- Problemas encontrados.
- Soluciones implementadas.
- Resultados obtenidos.
- Participación del usuario.

Actualiza:

docs/ACADEMIC_REQUIREMENTS.md
docs/DEPLOYMENT.md
docs/IMPLEMENTATION_PLAN.md
docs/TESTING.md

Marca los requisitos académicos únicamente según su
cumplimiento real.

No inventes resultados ni aprobaciones.

## 9. Commits y entrega

Genera los commits finales que correspondan a cambios reales.

Ejemplos:

chore: prepare production deployment
docs: finalize academic project documentation
docs: add production deployment links

Publica los cambios finales en GitHub.

Verifica que Vercel haya desplegado la versión final
del repositorio.

Comprueba que los enlaces incluidos en README.md funcionen.

## 10. Walkthrough definitivo

Genera el artefacto nativo Walkthrough de Antigravity.

Conserva una copia versionada en:

docs/walkthroughs/006-deployment-and-delivery.md

Sé conciso.

Incluye:

- Estado final del proyecto.
- URL pública de GitHub.
- URL pública de Vercel.
- Resultado de las pruebas finales.
- Resultado de autenticación en producción.
- Estado real del SMTP.
- Evidencias de producción.
- Commits finales.
- Cumplimiento de los 21 requisitos académicos.
- Limitaciones pendientes.
- Instrucciones mínimas para evaluar la aplicación.

Reutiliza las evidencias existentes.
Genera únicamente las capturas nuevas necesarias
para demostrar el despliegue real.

No declares completado un requisito no verificado.

## 11. Instrucción final

Comienza inmediatamente.

NO generes otro Implementation Plan extenso.

Tenemos restricciones de tiempo y tokens.

Prioriza GitHub, Vercel y la entrega académica.

Agrupa las intervenciones humanas imprescindibles.

Si una dependencia externa bloquea una actividad,
continúa con todas las demás que sean posibles.

Finaliza con los enlaces reales de entrega, el estado
de los requisitos y el Walkthrough definitivo.
