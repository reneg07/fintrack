# Prompt 003 — Base de datos, seguridad y autenticación (Fase 03)

- **Identificador:** `003-database-and-authentication`
- **Fase:** Fase 03 — Base de datos, migraciones, seguridad y autenticación (incluyendo resolución de pendientes de Fase 02)
- **Fecha real de recepción:** 2026-11-26

## Contenido íntegro del prompt recibido

```text
# PROMPT-003 — Base de datos, seguridad y autenticación

## 1. AUTORIZACIÓN Y CONTINUIDAD

Se ha revisado el informe de cierre de la Fase 02 de FinTrack.

Se aprueba la implementación técnica realizada, dejando pendiente la verificación visual y las evidencias que no pudieron generarse debido al problema de conexión del agente de navegador con Chrome.

Estás autorizado a ejecutar completamente la Fase 03, incluyendo la resolución de los pendientes de la Fase 02.

Conserva el contexto de:

- PROMPT-001.
- PROMPT-002.
- Implementation Plan.
- AGENTS.md.
- Reglas persistentes de Antigravity.
- Documentación y arquitectura existentes.

Actúa como Senior Full Stack Developer, Database Administrator, Security Engineer y QA Engineer.

Trabaja autónomamente dentro del alcance autorizado.

No te limites a presentar un plan. Debes implementar, ejecutar, verificar, corregir y documentar.

No solicites autorización para cada comando, archivo o actividad rutinaria no destructiva.

Solicita intervención humana únicamente cuando sea imprescindible para configurar cuentas, permisos, credenciales o recursos externos.

## 2. NUEVA INSTRUCCIÓN PERMANENTE: WALKTHROUGH

A partir de esta fase, es obligatorio generar un Walkthrough al finalizar cada fase de desarrollo.

Actualiza AGENTS.md y las reglas persistentes de Antigravity para incorporar esta instrucción.

Utiliza el artefacto nativo walkthrough.md de Antigravity cuando esté disponible.

Además, conserva una copia versionada dentro del repositorio:

docs/walkthroughs/

Genera los siguientes archivos durante esta fase:

docs/walkthroughs/002-initialization-and-design.md
docs/walkthroughs/003-database-and-authentication.md

El Walkthrough deberá incluir:

- Objetivos.
- Resumen de la implementación.
- Funcionalidades desarrolladas.
- Cambios relevantes.
- Decisiones técnicas.
- Archivos creados y modificados.
- Problemas encontrados.
- Soluciones implementadas.
- Pruebas ejecutadas.
- Resultados verificables.
- Capturas de pantalla reales.
- Grabaciones de navegador, cuando estén disponibles.
- Referencias a commits.
- Limitaciones.
- Funcionalidades pendientes.
- Instrucciones para reproducir las verificaciones.

Utiliza enlaces relativos a los archivos y evidencias almacenados en el repositorio.

El Walkthrough no sustituye VIBE_CODING.md.

Ambos documentos deberán mantenerse actualizados.

No inventes resultados ni evidencias.

## 3. REGISTRO DEL PROMPT

Antes de comenzar la implementación, almacena el contenido íntegro de este prompt en:

docs/prompts/003-database-and-authentication.md

Actualiza:

- docs/prompts/README.md
- VIBE_CODING.md
- AGENTS.md
- docs/TESTING.md
- docs/ARCHITECTURE.md

Registra automáticamente todas las decisiones, iteraciones y correcciones realizadas.

## 4. RESOLUCIÓN DE PENDIENTES DE LA FASE 02

El informe anterior identifica que el agente de navegador no pudo conectarse a Chrome por la ausencia de DevToolsActivePort.

Intenta resolver este bloqueo de manera autónoma.

Prioriza las siguientes alternativas:

1. Verificar la disponibilidad del agente de navegador nativo de Antigravity.
2. Utilizar una instancia de navegador aislada para desarrollo.
3. Utilizar Playwright con Chromium como herramienta alternativa de automatización y pruebas.

No modifiques de manera insegura el perfil personal del usuario en Chrome.

No deshabilites mecanismos de seguridad del navegador.

No abras puertos de depuración accesibles públicamente.

Si Playwright es necesario, verifica la compatibilidad de sus dependencias e instálalo como herramienta de desarrollo cuando corresponda.

Implementa scripts reutilizables de pruebas de navegador que puedan aprovecharse durante las fases posteriores.

Verifica las nueve páginas existentes antes de incorporar la protección de rutas.

Comprueba:

- Navegación.
- Diseño responsive.
- Formularios.
- Modales.
- Gráficos.
- Errores de consola.
- Desbordamientos horizontales.
- Accesibilidad básica.
- Consistencia visual.

Realiza pruebas en las resoluciones previamente definidas.

Genera las capturas pendientes de la Fase 02 y almacénalas en docs/screenshots/.

Corrige los problemas visuales relevantes que detectes.

Documenta la solución utilizada y genera el Walkthrough correspondiente a la Fase 02.

Si las herramientas de navegador continúan bloqueadas, documenta la causa real y continúa con las actividades restantes que no dependan de ellas.

## 5. REVISIÓN DE LA CONFIGURACIÓN DE NEXT.JS

Inspecciona la configuración actual de Next.js.

Revisa especialmente:

- cacheComponents: true
- partialPrefetching: true

Estas opciones deberán evaluarse antes de implementar Supabase Auth y datos financieros privados.

Consulta la documentación oficial correspondiente a la versión realmente instalada de Next.js.

Prioriza una arquitectura sencilla, estable y segura.

Si estas opciones no aportan un beneficio necesario para FinTrack, deshabilítalas o elimina las configuraciones opcionales correspondientes.

Justifica la decisión.

Garantiza que:

- Las rutas autenticadas no compartan información privada entre usuarios.
- Las respuestas personalizadas no se almacenen en cachés públicas.
- Las consultas dependientes de sesión se ejecuten en el contexto correcto.
- Las APIs privadas no almacenen respuestas sensibles de manera inapropiada.
- Las páginas públicas puedan aprovechar las optimizaciones disponibles sin afectar la seguridad.

No introduzcas complejidad arquitectónica innecesaria únicamente para mantener opciones avanzadas de caché.

Registra la decisión como ADR en docs/ARCHITECTURE.md.

## 6. CONFIGURACIÓN DE SUPABASE

El backend de FinTrack utilizará Supabase y PostgreSQL.

Verifica si existen herramientas, integraciones o sesiones autenticadas que permitan configurar el proyecto de Supabase automáticamente.

Si existe acceso autorizado, aprovecha las herramientas disponibles.

Si no existe acceso:

- Continúa primero con la generación de migraciones y código que no requiera credenciales.
- Solicita al usuario únicamente la intervención imprescindible.
- Proporciona instrucciones sencillas para crear un proyecto gratuito en Supabase.
- Indica cómo obtener la URL del proyecto y su Publishable Key.
- Indica cómo configurar las variables directamente en .env.local.

No solicites que el usuario publique contraseñas, claves privadas o tokens sensibles en el chat.

No utilices proyectos de Supabase ajenos sin autorización.

No contrates servicios ni habilites recursos de pago.

Utiliza las siguientes variables:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

Verifica que .env.example continúe documentado y versionado.

Verifica que .env.local esté excluido de Git.

No utilices service_role ni claves secretas para operaciones normales de la aplicación.

## 7. MIGRACIONES DE BASE DE DATOS

Implementa las migraciones SQL versionadas dentro de:

supabase/migrations/

Utiliza nombres compatibles con las convenciones oficiales de Supabase CLI cuando corresponda.

Implementa las tablas:

- profiles
- categories
- transactions
- budgets

Utiliza auth.users como entidad de autenticación administrada por Supabase.

Respeta el modelo entidad-relación aprobado durante la Fase 01.

Antes de generar las migraciones, inspecciona los tipos existentes en:

src/types/domain.ts

Alinea los nombres de campos y contratos de datos.

No introduzcas estructuras incompatibles con las interfaces existentes sin actualizar los tipos y documentar el cambio.

## 8. RESTRICCIONES DE INTEGRIDAD

Implementa restricciones directamente en PostgreSQL para garantizar:

- Identificadores UUID.
- Claves primarias.
- Claves foráneas.
- Propiedad de los registros por usuario.
- Importes monetarios positivos.
- Importes almacenados en centavos enteros.
- Límites monetarios seguros y coherentes con JavaScript.
- Tipos de transacción income y expense.
- Compatibilidad entre categorías y transacciones.
- Categorías pertenecientes al propietario de la transacción.
- Presupuestos asociados únicamente a categorías de gastos.
- Presupuestos únicos por usuario, categoría y mes.
- Fechas financieras almacenadas mediante DATE.
- Fechas mensuales correspondientes al primer día del mes.
- Nombres de categorías únicos por usuario y tipo.
- Colores hexadecimales válidos.
- Timestamps de creación y actualización.
- Eliminación segura de categorías relacionadas con registros existentes.

Utiliza claves foráneas compuestas cuando sean necesarias para asegurar la integridad entre propietarios y tipos de categoría.

Evita depender exclusivamente de las validaciones del frontend.

Garantiza que las operaciones inválidas sean rechazadas incluso si se realizan directamente mediante la API de Supabase.

Revisa también que los cálculos acumulados no pierdan precisión al transportar valores BIGINT hacia JavaScript.

## 9. ÍNDICES Y RENDIMIENTO

Implementa índices justificados para:

- Transacciones por usuario y fecha.
- Transacciones por usuario, tipo y fecha.
- Transacciones por categoría.
- Presupuestos por usuario y mes.
- Categorías por usuario y tipo.

Evita índices redundantes.

Documenta su finalidad y relación con las consultas previstas.

No realices optimizaciones prematuras que compliquen innecesariamente el modelo.

## 10. PERFILES Y CATEGORÍAS INICIALES

Implementa la creación automática del perfil y las categorías iniciales después del registro de un usuario.

Categorías de ingresos:

- Salario.
- Freelance.
- Inversiones.
- Otros ingresos.

Categorías de gastos:

- Alimentación.
- Vivienda.
- Transporte.
- Servicios.
- Salud.
- Entretenimiento.
- Educación.
- Otros gastos.

Cada categoría deberá incluir:

- Nombre.
- Tipo.
- Color.
- Icono.
- Identificador de propietario.

Utiliza los iconos previamente definidos en el catálogo de FinTrack.

Si utilizas funciones SECURITY DEFINER:

- Configura un search_path seguro.
- Utiliza referencias explícitas a los esquemas.
- Limita los permisos de ejecución.
- Evita ejecutar SQL dinámico innecesario.
- Valida y limita los datos provenientes de metadata de usuario.

Comprueba que el trigger de creación del usuario funcione correctamente y no provoque fallos de registro.

No utilices información financiera ficticia como datos iniciales de los usuarios.

Los usuarios nuevos deberán comenzar sin transacciones ni presupuestos.

## 11. ROW LEVEL SECURITY

Habilita RLS en todas las tablas propias:

- profiles
- categories
- transactions
- budgets

Implementa políticas explícitas y justificadas para las operaciones necesarias:

- SELECT
- INSERT
- UPDATE
- DELETE

Utiliza USING y WITH CHECK según corresponda.

Garantiza que un usuario únicamente pueda consultar, crear, modificar y eliminar los registros que le pertenecen.

No permitas modificar el propietario de un registro para transferirlo a otro usuario.

Aplica el principio de mínimo privilegio mediante GRANT y REVOKE cuando corresponda.

Los usuarios anónimos no deberán tener acceso a información financiera.

No crees políticas permisivas generales como USING (true) sobre tablas privadas.

No utilices service_role para evitar las políticas RLS.

Implementa una estrategia segura para la creación automática de perfiles y categorías.

## 12. TIPOS TYPESCRIPT DE BASE DE DATOS

Genera los tipos TypeScript correspondientes al esquema PostgreSQL.

Utiliza la herramienta oficial de generación de tipos de Supabase cuando sea posible.

Almacena los tipos dentro de:

src/types/database.ts

Mantén separados:

- Tipos de base de datos.
- Tipos de dominio.
- Esquemas de validación.
- Contratos de API.

Asegura que los clientes de Supabase utilicen los tipos generados.

Evita utilizar any para solucionar problemas de tipado.

## 13. CLIENTES DE SUPABASE

Implementa la integración de Supabase SSR siguiendo la documentación oficial vigente.

Crea o adapta:

src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/supabase/proxy.ts
src/proxy.ts

Utiliza @supabase/ssr y @supabase/supabase-js.

Considera:

- Browser Client cuando sea realmente necesario.
- Server Client para operaciones de servidor.
- Gestión de cookies.
- Actualización de sesión.
- Verificación de identidad.
- Compatibilidad con Next.js 16.
- APIs asíncronas de Next.js.
- Separación entre código de servidor y cliente.

Evita exponer módulos exclusivos del servidor al bundle del navegador.

No inicialices clientes globales de servidor que puedan reutilizar sesiones entre usuarios.

## 14. AUTENTICACIÓN REAL

Integra las interfaces existentes de:

/login
/register

Implementa:

- Registro real de usuarios.
- Inicio de sesión real.
- Cierre de sesión.
- Manejo de sesión mediante cookies.
- Actualización de sesión.
- Verificación de identidad desde el servidor.
- Manejo de errores de autenticación.
- Estados de carga durante el envío.
- Deshabilitación temporal de botones durante operaciones.
- Prevención de envíos duplicados.
- Redirecciones posteriores al registro e inicio de sesión.

Conserva el diseño visual implementado en la Fase 02.

Reutiliza React Hook Form y Zod.

No almacenes contraseñas ni tokens de sesión manualmente en localStorage.

No registres contraseñas, tokens o credenciales en logs.

Traduce los errores relevantes a mensajes comprensibles en español.

Evita mensajes de autenticación que expongan información innecesaria sobre otras cuentas.

## 15. CONFIRMACIÓN POR CORREO ELECTRÓNICO

Implementa un flujo compatible con la confirmación por correo electrónico de Supabase Auth.

Prioriza una configuración segura para producción.

Consulta la documentación oficial para determinar la estrategia correcta de confirmación, PKCE, callback y verificación de token.

Implementa:

/auth/callback

Agrega otras rutas de confirmación únicamente si son necesarias para el flujo oficial elegido.

Valida cualquier parámetro de redirección.

No permitas open redirects.

Documenta:

- Comportamiento con confirmación habilitada.
- Comportamiento con confirmación deshabilitada.
- Configuración de Site URL.
- Redirect URLs locales.
- Configuración futura para Vercel.

Para pruebas académicas utiliza cuentas controladas o un entorno de pruebas autorizado.

Si fuera necesario deshabilitar temporalmente la confirmación por correo para probar la aplicación, solicita autorización y documenta claramente sus implicaciones.

No reduzcas silenciosamente la seguridad de producción para facilitar las pruebas.

## 16. PROTECCIÓN DE RUTAS

Protege las siguientes páginas:

/dashboard
/transactions
/categories
/budgets
/reports
/settings

Utiliza las convenciones actuales de Next.js y Supabase SSR.

Implementa:

- Redirección hacia /login cuando no exista sesión válida.
- Redirección hacia /dashboard cuando un usuario autenticado intente acceder a /login o /register.
- Protección del layout privado.
- Verificación de identidad en el servidor.
- Autorización en cada operación protegida.
- Manejo correcto de sesiones expiradas.

No confíes exclusivamente en proxy.ts.

No confíes únicamente en el estado de autenticación del navegador.

No utilices getSession() como única verificación de autorización en el servidor.

Utiliza los métodos oficiales de validación de identidad adecuados para la versión instalada de Supabase.

Las APIs privadas deberán devolver códigos HTTP apropiados en lugar de responder con redirecciones HTML de autenticación.

## 17. PERFIL Y CONFIGURACIÓN

Conecta la información del usuario autenticado con:

- AppHeader.
- AppSidebar, cuando corresponda.
- Menú de usuario.
- Página de configuración.

Elimina nombres, correos e identidades ficticias del área autenticada.

Implementa la lectura real del perfil.

Implementa el cierre de sesión funcional.

Permite actualizar el nombre del perfil si esta funcionalidad puede completarse dentro de la integración de autenticación.

Utiliza Route Handlers o mecanismos de servidor coherentes con la arquitectura aprobada.

Valida cualquier modificación de perfil desde el servidor.

## 18. TRANSICIÓN DE DATOS DE DEMOSTRACIÓN

Durante la Fase 02 se utilizaron datos ficticios para construir las interfaces.

Después de implementar autenticación real:

- No presentes datos de demostración como si fueran datos financieros del usuario.
- Elimina las referencias a usuarios ficticios dentro de las rutas autenticadas.
- Conserva los datos de demostración únicamente para la landing, pruebas o componentes de presentación claramente identificados.
- Utiliza estados vacíos para los módulos que todavía no estén conectados a la base de datos.
- Mantén los diseños existentes sin introducir regresiones visuales.
- No simules operaciones de CRUD exitosas.

La implementación completa de transacciones, presupuestos, reportes y dashboard financiero corresponde a la Fase 04.

No adelantes innecesariamente esa fase.

## 19. INFRAESTRUCTURA DE API

Prepara los componentes base de los Route Handlers:

- Validación de autenticación.
- Manejo estandarizado de respuestas.
- Manejo seguro de errores.
- Validación Zod.
- Códigos HTTP.
- Prevención de filtración de información interna.
- Autorización.
- Validación de origen en operaciones mutables cuando corresponda.

Implementa como mínimo las operaciones relacionadas con esta fase:

- Cierre de sesión.
- Consulta del perfil.
- Actualización del perfil, si se implementó.
- Callback o confirmación de autenticación.

Respeta los contratos definidos en el Implementation Plan.

No expongas stack traces ni detalles SQL al cliente.

Las respuestas privadas no deberán almacenarse en cachés públicas.

## 20. APLICACIÓN DE MIGRACIONES

Cuando exista un proyecto Supabase autorizado y las herramientas necesarias:

- Aplica las migraciones versionadas.
- Verifica que las tablas existan.
- Verifica las restricciones.
- Verifica las funciones.
- Verifica los triggers.
- Verifica los índices.
- Verifica las políticas RLS.
- Verifica los permisos de los roles.

Utiliza Supabase CLI, integraciones autorizadas o el panel oficial según las capacidades disponibles.

Si el usuario debe ejecutar alguna operación manual:

- Genera el SQL completo.
- Proporciona el archivo exacto.
- Indica dónde ejecutarlo.
- Reduce la intervención a copiar, pegar y confirmar.

No solicites al usuario redactar SQL manualmente.

No ejecutes reset, drop o eliminación de información en bases de datos existentes sin autorización explícita.

No realices cambios sobre proyectos distintos del autorizado.

## 21. PRUEBAS DE BASE DE DATOS Y AUTENTICACIÓN

Realiza pruebas reales utilizando cuentas ficticias y controladas.

Verifica:

1. Registro de un usuario válido.
2. Rechazo de formularios inválidos.
3. Inicio de sesión válido.
4. Rechazo de credenciales incorrectas.
5. Cierre de sesión.
6. Persistencia de sesión después de recargar.
7. Acceso a rutas privadas con sesión.
8. Redirección al intentar acceder sin sesión.
9. Creación automática del perfil.
10. Creación de las doce categorías iniciales.
11. Lectura de información del perfil.
12. Actualización de perfil, cuando corresponda.
13. Rechazo de importes monetarios inválidos.
14. Rechazo de presupuestos duplicados.
15. Rechazo de presupuestos asociados a categorías de ingresos.
16. Rechazo de transacciones asociadas a categorías de otro usuario.
17. Rechazo de transacciones con tipo incompatible.
18. Rechazo de eliminación de categorías vinculadas.

Implementa una prueba de aislamiento con al menos dos usuarios de prueba.

Comprueba que:

- El usuario A no pueda consultar los registros privados del usuario B.
- El usuario A no pueda modificarlos.
- El usuario A no pueda eliminarlos.
- El usuario A no pueda insertar registros en nombre del usuario B.
- Un visitante anónimo no pueda acceder a información privada.

Utiliza sesiones reales de usuarios sujetas a RLS.

No utilices service_role para afirmar que las políticas RLS fueron verificadas.

No incluyas credenciales de prueba dentro del repositorio público.

Si una prueba requiere recursos externos todavía no configurados, regístrala como pendiente o bloqueada.

## 22. VALIDACIONES TÉCNICAS

Ejecuta:

npm run lint
npm run typecheck
npm run test
npm run build

Ejecuta también:

npx next typegen

cuando sea necesario para generar tipos actualizados.

Verifica:

- Compatibilidad de dependencias.
- Ausencia de errores TypeScript.
- Ausencia de errores de compilación.
- Errores de consola.
- Funcionamiento de Supabase.
- Manejo de variables de entorno.
- Estados de carga.
- Manejo de errores.
- Redirecciones.
- Protección de rutas.

Cuando una validación falle:

1. Analiza la causa.
2. Corrige el problema.
3. Ejecuta nuevamente las pruebas.
4. Documenta la solución.

No declares exitosas pruebas que no se hayan ejecutado.

No utilices simulaciones como sustituto de una prueba real de integración.

## 23. EVIDENCIAS VISUALES

Utiliza el agente de navegador de Antigravity o Playwright para generar evidencias reales.

Capturas sugeridas:

- phase-03-register.png
- phase-03-login.png
- phase-03-login-validation.png
- phase-03-authenticated-dashboard.png
- phase-03-empty-dashboard.png
- phase-03-profile.png
- phase-03-mobile-login.png
- phase-03-mobile-dashboard.png

Cuando las herramientas lo permitan, genera una grabación del flujo:

Registro > Inicio de sesión > Dashboard > Configuración > Cierre de sesión.

Conserva las evidencias en docs/screenshots/ o una carpeta documentada para grabaciones.

No captures:

- Contraseñas.
- Tokens.
- Credenciales.
- Variables de entorno sensibles.
- Información financiera real.
- Información personal auténtica.

Utiliza únicamente datos ficticios de prueba.

Incluye las evidencias dentro del Walkthrough mediante referencias válidas.

## 24. CONTROL DE VERSIONES

Genera commits locales reales y progresivos.

Mensajes sugeridos:

test: complete phase 02 browser and responsive validation
docs: add phase 02 implementation walkthrough
refactor: simplify authenticated rendering configuration
feat: add PostgreSQL database migrations
feat: configure row level security policies
feat: integrate Supabase SSR authentication
feat: implement user registration and login
feat: protect authenticated application routes
feat: integrate user profile and session management
test: validate authentication and data isolation
docs: document phase 03 implementation and walkthrough

Adapta los mensajes a los cambios realmente realizados.

No generes commits vacíos.

Antes de cada commit:

- Revisa git status.
- Revisa los cambios incluidos.
- Verifica que no se incluyan archivos sensibles.
- Verifica que las credenciales permanezcan fuera de Git.

Registra las referencias de los commits reales en la documentación.

No publiques todavía el código en GitHub.

## 25. DOCUMENTACIÓN AUTOMÁTICA

Actualiza:

- README.md
- VIBE_CODING.md
- AGENTS.md
- Reglas persistentes de Antigravity.
- docs/ARCHITECTURE.md
- docs/IMPLEMENTATION_PLAN.md, registrando cambios como adendas sin alterar el historial original.
- docs/TESTING.md
- docs/prompts/README.md
- docs/prompts/003-database-and-authentication.md
- docs/walkthroughs/002-initialization-and-design.md
- docs/walkthroughs/003-database-and-authentication.md

Documenta las migraciones, restricciones, políticas y estrategia de autenticación.

Incluye diagramas Mermaid actualizados cuando corresponda.

Mantén una matriz de cumplimiento académico.

Diferencia los requisitos:

- Implementados.
- Verificados.
- Pendientes.
- Bloqueados.

Registra automáticamente las intervenciones humanas que hayan sido realmente necesarias.

No solicites al usuario documentar manualmente el proceso.

## 26. CRITERIOS DE ACEPTACIÓN

La Fase 03 se considerará completada cuando:

- Las migraciones SQL estén implementadas y versionadas.
- La estructura PostgreSQL esté creada en el proyecto autorizado.
- Las restricciones de integridad estén operativas.
- RLS esté habilitado y verificado.
- Los clientes Supabase SSR estén configurados.
- Los tipos de base de datos estén disponibles.
- El registro sea funcional.
- El inicio de sesión sea funcional.
- El cierre de sesión sea funcional.
- Las rutas privadas estén protegidas.
- Los perfiles se generen automáticamente.
- Las categorías iniciales se generen correctamente.
- Los usuarios no puedan acceder a información ajena.
- Las variables de entorno estén protegidas.
- Los datos de demostración no se presenten como datos reales del usuario.
- Las validaciones técnicas hayan sido ejecutadas.
- Existan commits reales y descriptivos.
- La documentación esté actualizada.
- El Walkthrough esté generado.
- Las evidencias disponibles sean reales.

Si existen bloqueos externos, registra claramente qué criterios no se han podido verificar.

No declares la fase completada al 100% mientras existan requisitos esenciales sin comprobar.

## 27. RESTRICCIONES

No implementar todavía:

- CRUD financiero completo de transacciones.
- Gestión completa de presupuestos.
- Dashboard conectado a cálculos financieros definitivos.
- Reportes financieros completos.
- Exportación CSV definitiva.

Estas funcionalidades corresponden a la Fase 04.

No publicar todavía el repositorio en GitHub.

No desplegar todavía en Vercel.

No contratar servicios.

No generar costos.

No utilizar datos personales o financieros reales.

No avanzar automáticamente a la Fase 04.

## 28. ENTREGA FINAL OBLIGATORIA

Al concluir genera el artefacto Walkthrough de Antigravity.

Conserva también su versión Markdown dentro de docs/walkthroughs/.

Incluye:

1. Resumen ejecutivo.
2. Estado de la Fase 02 y resolución de pendientes.
3. Estado de la Fase 03.
4. Arquitectura implementada.
5. Diagrama actualizado de base de datos.
6. Migraciones y restricciones.
7. Políticas RLS.
8. Flujo de autenticación.
9. Archivos creados y modificados.
10. Decisiones técnicas.
11. Problemas encontrados.
12. Soluciones implementadas.
13. Comandos ejecutados.
14. Resultados de pruebas.
15. Verificación de aislamiento entre usuarios.
16. Evidencias visuales y grabaciones disponibles.
17. Historial de commits reales.
18. Estado de la documentación.
19. Matriz de cumplimiento académico.
20. Limitaciones y bloqueos.
21. Preparación para la Fase 04.

El Walkthrough deberá permitir comprender y reproducir el trabajo realizado sin depender del historial del chat.

Presenta al usuario un resumen de cierre y enlaces a los archivos correspondientes.

Ejecuta la Fase 03 desde este momento.

Resuelve autónomamente los problemas técnicos.

Solicita intervención humana únicamente cuando sea imprescindible.

Al finalizar, espera el siguiente prompt de autorización.
```
