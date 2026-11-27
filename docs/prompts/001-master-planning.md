# Prompt 001 — Planificación Maestra y Arquitectura (Fase 01)

- **Identificador:** `001-master-planning`
- **Fase:** Fase 01 — Planificación, arquitectura e instrucciones permanentes
- **Fecha real de recepción:** 2026-11-26

## Contenido íntegro del prompt recibido

```text
ROL Y RESPONSABILIDADES
Actúa como un Senior Full Stack Developer, Software Architect, UI/UX Designer, QA Engineer y DevOps Engineer.Serás el agente principal responsable de planificar, desarrollar, probar, documentar y preparar para producción una aplicación web denominada FinTrack.Trabajaremos mediante la metodología de Vibe Coding. Yo actuaré como supervisor del proyecto y proporcionaré instrucciones de alto nivel, mientras tú tendrás autonomía para ejecutar las tareas técnicas correspondientes a cada fase autorizada.Debes minimizar la necesidad de intervención manual por parte del usuario.1. CONTEXTO ACADÉMICO
El proyecto corresponde a una actividad evaluada denominada:Implementación de Aplicación Next.js mediante Vibe Coding: Flujo de Desarrollo Guiado por IA.El objetivo es construir una aplicación web funcional, profesional y desplegada públicamente, demostrando el ciclo completo de desarrollo guiado por inteligencia artificial:- Concepción inicial.
- Planificación.
- Generación de código mediante prompts.
- Implementación iterativa.
- Validación.
- Corrección de errores.
- Optimización.
- Documentación.
- Despliegue en producción.
El proceso de desarrollo es tan importante como el resultado final.2. DEFINICIÓN DEL PRODUCTO
Nombre: FinTrack.Eslogan: Tus finanzas, bajo control.FinTrack será una aplicación web SaaS de gestión de finanzas personales que permitirá registrar, administrar y analizar ingresos, gastos, categorías y presupuestos mensuales.Idioma: español.Moneda: dólares estadounidenses (USD).Zona horaria de referencia: America/El_Salvador.La aplicación debe tener una apariencia profesional y ser adecuada para un portafolio de desarrollo de software.3. REQUISITOS ACADÉMICOS OBLIGATORIOS
- Next.js 16 o superior en versión estable.
- App Router.
- TypeScript.
- Mínimo cuatro páginas o rutas distintas.
- Consumo de al menos una API interna o externa mediante Route Handlers o servicios serverless.
- Uso combinado de Server Components y Client Components.
- Uso funcional y justificado de useState y useEffect.
- Diseño responsive.
- Estados de carga.
- Manejo de errores.
- Variables de entorno mediante .env.local.
- Archivo .env.example documentado y sin credenciales reales.
- Repositorio público en GitHub.
- Historial de commits que evidencie el desarrollo iterativo.
- README.md con instrucciones de instalación, uso y enlace de producción.
- VIBE_CODING.md con documentación del proceso real de desarrollo.
- Aplicación desplegada y accesible públicamente.
Todos los requisitos deberán verificarse antes de finalizar el proyecto.4. STACK TECNOLÓGICO PROPUESTO
- Next.js 16 o superior.
- App Router.
- TypeScript en modo estricto.
- Tailwind CSS.
- shadcn/ui.
- Lucide React.
- Recharts.
- Supabase.
- PostgreSQL.
- Supabase Auth.
- Supabase SSR.
- Zod.
- React Hook Form.
- Sonner.
- ESLint.
- Git y GitHub.
- Vercel.
Verifica las versiones y compatibilidad de las dependencias mediante documentación oficial.Evita dependencias innecesarias, experimentales, obsoletas o que introduzcan complejidad injustificada.Prioriza servicios gratuitos y evita cualquier contratación o configuración que genere costos sin autorización explícita.5. FUNCIONALIDADES DEL PRODUCTO
Landing page
- Presentación del producto.
- Descripción de funcionalidades.
- Llamados a la acción.
- Acceso al registro e inicio de sesión.
Autenticación
- Registro de usuarios.
- Inicio de sesión.
- Cierre de sesión.
- Gestión de sesiones.
- Protección de rutas privadas.
- Mensajes de validación y errores.
Dashboard
- Balance acumulado.
- Ingresos del período seleccionado.
- Gastos del período seleccionado.
- Flujo de efectivo.
- Distribución de gastos por categoría.
- Transacciones recientes.
- Filtro de período.
Transacciones
- Registrar ingresos.
- Registrar gastos.
- Editar transacciones.
- Eliminar transacciones.
- Buscar transacciones.
- Filtrar por fecha, categoría y tipo.
- Validar importes y campos obligatorios.
Categorías
- Categorías iniciales de ingresos y gastos.
- Creación de categorías personalizadas.
- Edición de categorías.
- Eliminación segura de categorías.
- Configuración de colores e iconos.
Presupuestos
- Presupuestos mensuales por categoría.
- Seguimiento automático del gasto.
- Indicadores de progreso.
- Advertencias al acercarse al límite.
- Alertas cuando el presupuesto sea superado.
Reportes
- Comparaciones mensuales.
- Evolución de ingresos y gastos.
- Distribución de gastos.
- Filtros por período.
- Exportación de transacciones en CSV.
Configuración
- Información básica del perfil.
- Edición del nombre del usuario.
- Gestión de sesión.
No implementar conexiones bancarias, pagos electrónicos, suscripciones de pago ni asesoramiento financiero automatizado.6. RUTAS PROPUESTAS
/
/login
/register
/dashboard
/transactions
/categories
/budgets
/reports
/settingsUtiliza Route Groups cuando resulte conveniente para separar layouts públicos, autenticación y rutas privadas.7. ARQUITECTURA
Implementa una arquitectura modular, mantenible y proporcional al alcance del proyecto.Utiliza separación de responsabilidades entre:- Páginas.
- Layouts.
- Componentes reutilizables.
- Componentes de negocio.
- Hooks.
- Servicios.
- Esquemas de validación.
- Tipos TypeScript.
- Utilidades.
- Clientes de Supabase.
- Route Handlers.
Prioriza Server Components por defecto.Utiliza Client Components cuando sean necesarios para interactividad, hooks, formularios, gráficos o APIs del navegador.Los Server Components deberán acceder directamente a los servicios del servidor cuando corresponda.Implementa Route Handlers funcionales que sean consumidos desde componentes cliente y permitan demostrar el requisito académico de consumo de API.No desarrolles un backend independiente.8. BASE DE DATOS
Diseña un modelo relacional en PostgreSQL mediante Supabase.Entidades iniciales:- auth.users.
- profiles.
- categories.
- transactions.
- budgets.
Considera:- UUID como identificadores.
- Claves primarias y foráneas.
- Restricciones de integridad.
- Índices.
- Timestamps.
- Row Level Security.
- Aislamiento de información por usuario.
- Migraciones SQL versionadas.
- Importes monetarios almacenados en centavos enteros.
- Validación de importes positivos.
- Presupuestos únicos por usuario, categoría y mes.
- Integridad entre el propietario de una categoría y los registros relacionados.
- Compatibilidad entre tipos de categorías y transacciones.
- Presupuestos asociados únicamente a categorías de gastos.
La base de datos debe impedir operaciones inválidas incluso cuando se realicen fuera de la interfaz gráfica.9. SEGURIDAD
Utiliza las prácticas oficiales y actuales de autenticación de Supabase con Next.js App Router.Considera:- Sesiones mediante cookies.
- Validación de identidad en el servidor.
- Protección de rutas privadas.
- Autorización en cada operación protegida.
- Validación de datos mediante Zod.
- Políticas RLS.
- Manejo seguro de variables de entorno.
- Exclusión de credenciales mediante .gitignore.
- Prevención de exposición de información sensible.
- Manejo seguro de errores.
No utilices claves service_role para operaciones habituales de usuarios.Nunca incluyas credenciales reales en documentación, capturas, commits o mensajes de salida.10. DISEÑO UI/UX
FinTrack deberá tener una identidad visual propia, moderna, elegante y profesional.Evita la apariencia de una plantilla administrativa genérica.Paleta de referencia:- Verde oscuro: #10251F.
- Verde primario: #059669.
- Verde de acento: #34D399.
- Fondo: #F8FAFC.
- Superficies: #FFFFFF.
- Gastos y advertencias críticas: #DC5656.
Utiliza tipografía Geist o una alternativa justificada.Considera:- Sidebar adaptable.
- Header.
- Navegación móvil.
- Tarjetas de indicadores.
- Gráficos financieros interactivos.
- Tablas responsivas.
- Formularios.
- Modales.
- Notificaciones Toast.
- Skeletons.
- Estados vacíos.
- Mensajes de error.
- Microinteracciones discretas.
- Accesibilidad.
- Navegación mediante teclado.
- Contraste adecuado.
El diseño deberá adaptarse correctamente a desktop, laptop, tablet y móvil.Utiliza datos ficticios únicamente para demostraciones y pruebas claramente identificadas.11. AUTONOMÍA DEL AGENTE
Durante las fases de implementación autorizadas, eres responsable de:- Crear y modificar archivos.
- Inicializar el proyecto.
- Instalar dependencias.
- Ejecutar comandos.
- Implementar funcionalidades.
- Generar migraciones SQL.
- Revisar el código.
- Detectar errores.
- Corregir errores.
- Ejecutar pruebas.
- Verificar el funcionamiento mediante el navegador.
- Comprobar el diseño responsive.
- Optimizar el proyecto.
- Documentar decisiones.
- Generar commits descriptivos.
- Preparar el despliegue.
- Ejecutar el despliegue cuando las herramientas y permisos disponibles lo permitan.
No solicites confirmación para cada archivo, componente o comando rutinario no destructivo dentro de una fase autorizada.Resuelve autónomamente los problemas técnicos que encuentres.Solicita intervención del usuario únicamente cuando sea imprescindible, por ejemplo:- Creación de cuentas externas.
- Autenticación en plataformas.
- Configuración de credenciales.
- Permisos de acceso.
- Operaciones destructivas.
- Cambios sustanciales en el alcance.
- Acciones que puedan generar costos.
Cuando necesites intervención, proporciona instrucciones concretas y sencillas.No solicites que el usuario programe manualmente una funcionalidad que puedas implementar tú.12. DOCUMENTACIÓN AUTOMÁTICA DEL VIBE CODING
Esta sección es obligatoria durante todo el proyecto.Serás responsable de documentar automáticamente los prompts, decisiones, iteraciones y resultados.Durante la inicialización, crea los siguientes archivos:- README.md.
- VIBE_CODING.md.
- AGENTS.md.
- docs/ARCHITECTURE.md.
- docs/TESTING.md.
- docs/prompts/README.md.
- docs/screenshots/.
El archivo AGENTS.md deberá contener las instrucciones permanentes del proyecto para mantener la continuidad entre sesiones y agentes. Si Antigravity dispone de un mecanismo específico de reglas persistentes del workspace, utiliza también dicho mecanismo siguiendo su documentación oficial.Cada prompt principal recibido deberá almacenarse en un archivo Markdown independiente dentro de docs/prompts/.Ejemplo:docs/prompts/001-master-planning.md
docs/prompts/002-initialization-and-design.md
docs/prompts/003-database-and-authentication.mdRegistra los prompts de corrección e iteraciones adicionales utilizando identificadores secundarios.Por cada fase, actualiza VIBE_CODING.md incluyendo:- Identificador de la fase.
- Fecha real de ejecución.
- Prompt recibido.
- Objetivo.
- Propuesta inicial.
- Decisiones técnicas.
- Implementaciones realizadas.
- Archivos relevantes.
- Problemas realmente encontrados.
- Soluciones implementadas.
- Iteraciones efectuadas.
- Comandos ejecutados.
- Pruebas realizadas.
- Resultados verificables.
- Referencias a commits.
- Estado final.
El registro deberá evidenciar que el proyecto fue desarrollado de manera iterativa y supervisada mediante IA.No inventes prompts, errores, pruebas, resultados, aprobaciones, commits ni evidencias.No incluyas secretos o información privada dentro de estos documentos.Conserva las evidencias que las herramientas disponibles permitan generar, incluyendo capturas de pantalla reales de la aplicación y verificaciones realizadas.Actualiza la documentación conforme avances. No dejes toda la documentación para la última fase.13. CONTROL DE VERSIONES
Inicializa Git durante la fase correspondiente.Mantén un historial de commits coherente y descriptivo siguiendo Conventional Commits.Ejemplos:chore: initialize FinTrack project
docs: define application architecture
feat: implement responsive application layout
feat: configure Supabase authentication
feat: implement transaction management
feat: add financial dashboard
feat: implement monthly budgets
test: validate financial calculations
fix: resolve responsive navigation issues
docs: update vibe coding development log
chore: prepare production deploymentLos commits deberán corresponder a cambios reales y funcionales.No generes commits vacíos ni historiales artificiales.Antes de cada commit, revisa los cambios y verifica que no se incluyan credenciales ni archivos sensibles.Puedes realizar commits locales durante una fase autorizada.La publicación del repositorio y el despliegue se realizarán durante la fase correspondiente, utilizando las cuentas y permisos autorizados por el usuario.14. VALIDACIÓN Y CALIDAD
Durante el desarrollo ejecuta las validaciones correspondientes.Como mínimo:- ESLint.
- TypeScript type checking.
- Build de producción.
- Pruebas funcionales.
- Verificación de rutas.
- Pruebas de formularios.
- Validación de cálculos financieros.
- Verificación responsive.
- Validación de estados de carga.
- Validación de errores.
- Verificación de autenticación.
- Pruebas de aislamiento de información entre usuarios.
Utiliza el agente de navegador de Antigravity cuando esté disponible.No declares una prueba como exitosa si no ha sido ejecutada y verificada.Cuando encuentres errores, analiza su causa, corrígelos y vuelve a ejecutar las validaciones correspondientes.15. DESPLIEGUE
El entorno de producción objetivo será Vercel y el repositorio deberá alojarse públicamente en GitHub.Durante la fase de despliegue:- Verifica la configuración del proyecto.
- Comprueba el build.
- Configura el repositorio remoto proporcionado.
- Publica los cambios.
- Configura las variables de entorno necesarias.
- Prepara la integración con Vercel.
- Ejecuta el despliegue mediante las herramientas disponibles cuando cuentes con los permisos necesarios.
- Verifica la URL pública.
- Comprueba el funcionamiento en producción.
- Actualiza README.md con la URL pública real.
Si una configuración requiere autenticación o intervención manual, proporciona únicamente los pasos necesarios.No declares el despliegue como completado hasta comprobar su funcionamiento.16. FASES DE DESARROLLO
Fase 01: Planificación, arquitectura e instrucciones permanentes.Fase 02: Inicialización del proyecto, dependencias, sistema de diseño y layouts.Fase 03: Base de datos, migraciones, seguridad y autenticación.Fase 04: Implementación completa de módulos funcionales.Fase 05: Testing, correcciones, seguridad y optimización.Fase 06: Documentación final, publicación en GitHub y despliegue en Vercel.Cada fase tendrá objetivos, criterios de aceptación y resultados verificables.Dentro de una fase autorizada, puedes trabajar autónomamente hasta completar sus objetivos.No avances automáticamente a una nueva fase sin recibir el prompt correspondiente.17. FORMATO DE ENTREGA DE CADA FASE
Al finalizar cada fase proporciona un informe que contenga:1. Resumen ejecutivo.
2. Funcionalidades implementadas.
3. Archivos creados y modificados.
4. Decisiones técnicas.
5. Problemas encontrados y resueltos.
6. Comandos y pruebas ejecutadas.
7. Resultados de las validaciones.
8. Evidencias disponibles.
9. Commits realizados.
10. Estado de la documentación.
11. Bloqueos o intervenciones necesarias del usuario.
12. Estado de los requisitos académicos.
13. Recomendaciones para la siguiente fase.
Mantén los informes claros y verificables.18. INSTRUCCIÓN PARA ESTA PRIMERA FASE
En esta primera interacción, ejecuta exclusivamente la Fase 01.Inspecciona el workspace y verifica de manera no destructiva el entorno disponible.Elabora un Implementation Plan completo que incluya:- Alcance funcional.
- Arquitectura.
- Stack y compatibilidad.
- Estructura de carpetas.
- Modelo entidad-relación.
- Estrategia de seguridad.
- Mapa de rutas.
- Diseño de APIs.
- Distribución entre Server Components y Client Components.
- Sistema de diseño.
- Estrategia de pruebas.
- Estrategia de documentación automática.
- Estrategia de control de versiones.
- Estrategia de despliegue.
- Riesgos y dependencias externas.
- Criterios de aceptación por fase.
- Matriz de cumplimiento académico.
Identifica las decisiones que requieran aprobación y las configuraciones que posteriormente necesitarán intervención humana.Por ahora no inicialices Next.js, no instales dependencias y no comiences la implementación funcional.Conserva el contenido íntegro de este prompt para registrarlo durante la inicialización.Finaliza presentando el Implementation Plan para revisión y espera el prompt de autorización de la Fase 02.
```
