# Prompt 002 — Inicialización del proyecto y sistema de diseño UI/UX (Fase 02)

- **Identificador:** `002-initialization-and-design`
- **Fase:** Fase 02 — Inicialización del proyecto, dependencias, sistema de diseño y layouts
- **Fecha real de recepción:** 2026-11-26

## Contenido íntegro del prompt recibido

```text
# PROMPT-002 — Inicialización del proyecto y sistema de diseño UI/UX

## 1. AUTORIZACIÓN Y CONTINUIDAD

Se aprueba el Implementation Plan presentado durante la Fase 01 del proyecto FinTrack.

Se autorizan expresamente las siguientes decisiones técnicas:

- Utilizar npm como gestor de paquetes.
- Incorporar Vitest como dependencia de desarrollo.
- Utilizar NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY como variable de entorno para la clave pública de Supabase.
- Impedir la eliminación de categorías con transacciones o presupuestos asociados mediante restricciones de integridad y respuestas HTTP 409.

A partir de este momento estás autorizado a ejecutar completamente la Fase 02.

Conserva el contexto del PROMPT-001, las instrucciones maestras y el Implementation Plan previamente generado.

Actúa con autonomía como Senior Full Stack Developer, UI/UX Designer y QA Engineer.

No te limites a presentar un nuevo plan. Debes ejecutar la implementación, realizar las validaciones, corregir los errores encontrados y documentar los resultados.

No solicites autorización para operaciones rutinarias no destructivas dentro de esta fase.

## 2. OBJETIVOS DE LA FASE

- Inicializar correctamente el proyecto Next.js.
- Configurar el stack tecnológico aprobado.
- Inicializar Git.
- Establecer las instrucciones permanentes del proyecto.
- Crear toda la estructura de documentación.
- Implementar la identidad visual de FinTrack.
- Desarrollar la landing page pública.
- Implementar las interfaces de autenticación.
- Desarrollar el AppShell de la aplicación.
- Crear las rutas principales con interfaces preliminares.
- Implementar componentes reutilizables.
- Verificar el diseño responsive.
- Ejecutar pruebas y validaciones.
- Generar commits descriptivos.
- Registrar automáticamente el proceso de Vibe Coding.

## 3. INICIALIZACIÓN DEL PROYECTO

Utiliza el workspace actual:

C:\xampp\htdocs\vibe_coding

Inicializa el proyecto directamente dentro de este directorio, sin crear una carpeta de proyecto anidada innecesariamente.

Verifica previamente el contenido del workspace y evita sobrescribir cualquier archivo existente sin justificación.

El nombre del paquete y del proyecto será fintrack.

Configura:

- Next.js 16 o superior en versión estable.
- App Router.
- TypeScript en modo estricto.
- Directorio src/.
- Alias de importación @/*.
- Tailwind CSS.
- ESLint.
- npm.
- Turbopack cuando corresponda a la configuración estable oficial.

Utiliza create-next-app siguiendo las convenciones actuales de Next.js.

Verifica las versiones disponibles mediante el registro oficial de npm y la documentación correspondiente.

No asumas que las versiones indicadas en el Implementation Plan existen o siguen siendo las más adecuadas.

Selecciona versiones estables y compatibles con Node.js 22.19.0 o con la versión realmente instalada en el entorno.

No utilices versiones canary, beta, alpha o release candidate.

Evita resolver incompatibilidades mediante --force o --legacy-peer-deps sin analizar previamente su causa.

Mantén package-lock.json versionado.

## 4. DEPENDENCIAS

Instala y configura las dependencias necesarias:

- shadcn/ui.
- lucide-react.
- recharts.
- @supabase/supabase-js.
- @supabase/ssr.
- zod.
- react-hook-form.
- @hookform/resolvers.
- sonner.
- vitest.

Instala únicamente componentes y dependencias adicionales que tengan una utilidad justificada.

Configura shadcn/ui de manera compatible con Tailwind CSS y React.

Evita instalar todos los componentes de shadcn/ui indiscriminadamente.

Selecciona inicialmente aquellos necesarios para el sistema de diseño, incluyendo según corresponda:

- Button.
- Card.
- Input.
- Label.
- Badge.
- Avatar.
- Separator.
- Sheet.
- Dialog.
- Dropdown Menu.
- Select.
- Table.
- Skeleton.
- Tooltip.
- Progress.
- Alert.
- Sonner.

Configura los scripts de desarrollo, compilación, lint, type checking y pruebas.

Incluye scripts equivalentes a:

npm run dev
npm run build
npm run lint
npm run typecheck
npm run test

El comando de pruebas deberá permitir una ejecución no interactiva para futuras validaciones automatizadas.

## 5. CONTROL DE VERSIONES

Inicializa Git utilizando la rama main.

Si create-next-app ya inicializó Git, conserva el repositorio existente y verifica la rama actual.

No inicialices repositorios Git anidados.

Utiliza Conventional Commits.

Genera commits reales y progresivos conforme completes bloques funcionales.

Mensajes sugeridos:

chore: initialize FinTrack Next.js project
docs: establish architecture and vibe coding guidelines
feat: implement FinTrack design system
feat: build responsive marketing landing page
feat: create authentication interfaces
feat: implement responsive application shell
feat: scaffold financial module interfaces
test: configure testing and validate initial application
docs: document phase 02 implementation and validation

Adapta los mensajes al trabajo realmente realizado.

No generes commits vacíos ni artificiales.

Antes de cada commit verifica:

- Archivos incluidos.
- Ausencia de credenciales.
- Ausencia de datos sensibles.
- Coherencia de los cambios.
- Estado de Git.

Estás autorizado a realizar todos los commits locales correspondientes a esta fase.

No configures todavía un repositorio remoto ni publiques código en GitHub.

## 6. INSTRUCCIONES PERMANENTES

Crea el archivo AGENTS.md en la raíz del proyecto.

Incluye:

- Contexto académico.
- Alcance de FinTrack.
- Stack tecnológico.
- Arquitectura aprobada.
- Convenciones de desarrollo.
- Convenciones de Git.
- Estrategia de seguridad.
- Uso de Server Components y Client Components.
- Gestión de estados.
- Cálculos financieros en centavos.
- Zona horaria America/El_Salvador.
- Reglas de documentación automática.
- Estrategia de pruebas.
- Restricciones de privacidad.
- Prohibición de utilizar service_role para operaciones habituales de usuarios.
- Prohibición de inventar evidencias.
- Reglas de autonomía del agente.
- Criterios para solicitar intervención humana.

Configura también el mecanismo nativo de reglas persistentes de Antigravity según su documentación vigente.

Utiliza la ubicación y formato oficialmente soportados por la versión actual de Antigravity.

Mantén ambas fuentes de instrucciones sincronizadas y evita duplicaciones innecesarias que puedan producir contradicciones.

## 7. DOCUMENTACIÓN AUTOMÁTICA

Crea y configura:

- README.md
- VIBE_CODING.md
- AGENTS.md
- docs/IMPLEMENTATION_PLAN.md
- docs/ARCHITECTURE.md
- docs/TESTING.md
- docs/prompts/README.md
- docs/prompts/001-master-planning.md
- docs/prompts/002-initialization-and-design.md
- docs/screenshots/

El archivo docs/IMPLEMENTATION_PLAN.md deberá contener el Implementation Plan completo elaborado durante la Fase 01.

Registra el contenido íntegro del PROMPT-001 y del presente PROMPT-002 en sus respectivos archivos.

Si no puedes recuperar íntegramente algún prompt anterior, registra esa limitación de forma explícita. No inventes ni reconstruyas texto presentándolo como el prompt original.

Actualiza VIBE_CODING.md con la documentación correspondiente a las fases 01 y 02.

Registra:

- Fecha real de ejecución.
- Objetivos.
- Prompts recibidos.
- Decisiones técnicas.
- Versiones realmente instaladas.
- Iteraciones efectuadas.
- Implementaciones realizadas.
- Archivos relevantes.
- Problemas realmente encontrados.
- Soluciones aplicadas.
- Comandos ejecutados.
- Pruebas realizadas.
- Resultados verificables.
- Evidencias visuales.
- Referencias a commits.
- Estado final.

Utiliza el español como idioma principal de la documentación.

Mantén los identificadores, convenciones de código y mensajes de commits en inglés.

Toda la documentación deberá actualizarse automáticamente conforme avances.

No dejes esta actividad para la fase final del proyecto.

No solicites al usuario redactar documentos que puedas generar tú.

## 8. VARIABLES DE ENTORNO

Crea un archivo .env.example con las siguientes variables:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

Documenta la finalidad de cada variable.

Configura .gitignore para excluir:

- .env.local
- Otros archivos de entorno que puedan contener credenciales.
- node_modules/
- .next/
- Archivos de compilación.
- Archivos temporales.
- Logs locales.

Asegúrate de que .env.example no quede excluido de Git.

No inventes credenciales de Supabase.

No utilices claves falsas para simular una conexión real.

La aplicación deberá poder compilarse y ejecutarse durante esta fase sin credenciales de Supabase.

La conexión real, autenticación y configuración del proyecto Supabase corresponden exclusivamente a la Fase 03.

## 9. IDENTIDAD VISUAL DE FINTRACK

Implementa la dirección visual aprobada:

Refined Emerald Fintech.

Nombre de marca:

FinTrack

Eslogan:

Tus finanzas, bajo control.

La identidad visual debe transmitir:

- Confianza.
- Claridad.
- Control financiero.
- Profesionalismo.
- Modernidad.
- Simplicidad.

Utiliza la siguiente paleta como referencia:

- Brand dark: #10251F
- Brand primary: #059669
- Brand accent: #34D399
- Canvas background: #F8FAFC
- Surface: #FFFFFF
- Danger: #DC5656
- Warning: #D97706
- Primary text: #0F172A
- Secondary text: #475569

Define tokens semánticos reutilizables mediante variables CSS y Tailwind.

Ajusta las tonalidades cuando sea necesario para garantizar contraste accesible WCAG AA, especialmente en botones, textos pequeños, indicadores y estados de error.

Utiliza Geist como tipografía principal.

Utiliza números tabulares para importes monetarios y métricas.

Si la descarga externa de fuentes afecta la compilación, implementa una alternativa local o fallback estable y documenta la decisión.

Crea un componente de marca reutilizable con un isotipo sencillo, original y relacionado con el control financiero.

Genera también un favicon coherente con la identidad visual.

Evita:

- Gradientes exagerados.
- Glassmorphism excesivo.
- Sombras innecesariamente pronunciadas.
- Interfaces saturadas.
- Animaciones excesivas.
- Apariencia genérica de dashboard generado por IA.
- Textos comerciales artificiales.
- Uso excesivo de tarjetas redondeadas sin jerarquía visual.
- Imágenes de stock que no aporten valor.

Busca una estética SaaS profesional, con composición cuidada, jerarquía visual y espaciado consistente.

## 10. LANDING PAGE

Implementa una landing page pública completamente diseñada en la ruta /.

Debe incluir:

1. Navbar.
   - Marca FinTrack.
   - Navegación hacia funcionalidades.
   - Botón de inicio de sesión.
   - CTA de registro.
   - Menú responsive.

2. Hero principal.
   - Propuesta de valor clara.
   - Título atractivo y profesional.
   - Descripción breve.
   - CTA principal para comenzar.
   - CTA secundario para conocer las funcionalidades.
   - Representación visual personalizada del dashboard de FinTrack.

3. Funcionalidades principales.
   - Control de ingresos y gastos.
   - Gestión de presupuestos.
   - Categorización de transacciones.
   - Reportes financieros.

4. Sección de funcionamiento.
   - Registra tus movimientos.
   - Organiza tus finanzas.
   - Visualiza tus resultados.

5. Sección de seguridad y privacidad.
   - Explica únicamente características reales o previstas de la aplicación.
   - No realices afirmaciones de seguridad que todavía no hayan sido implementadas o verificadas.

6. CTA final.

7. Footer.
   - Identidad visual.
   - Navegación válida.
   - Información básica del proyecto.

Evita incluir testimonios falsos, estadísticas de usuarios inventadas, logotipos de empresas ficticias, certificaciones inexistentes o planes comerciales que no forman parte del proyecto.

La landing deberá verse como la presentación de un producto real y no como una plantilla académica.

Utiliza textos naturales en español.

Los botones de navegación deberán funcionar.

## 11. INTERFACES DE AUTENTICACIÓN

Implementa las interfaces visuales de:

/login
/register

Crea un layout de autenticación con identidad propia de FinTrack.

Formulario de inicio de sesión:

- Correo electrónico.
- Contraseña.
- Mostrar u ocultar contraseña.
- Validaciones visuales.
- Botón de inicio de sesión.
- Enlace hacia registro.

Formulario de registro:

- Nombre completo.
- Correo electrónico.
- Contraseña.
- Confirmación de contraseña.
- Mostrar u ocultar contraseña.
- Validaciones visuales.
- Botón de registro.
- Enlace hacia inicio de sesión.

Utiliza React Hook Form y Zod cuando corresponda.

Incluye etiquetas accesibles, estados de foco y mensajes de validación claros.

En esta fase implementa únicamente la interfaz y validación de formularios.

No simules autenticación exitosa.

No implementes sesiones ficticias ni mecanismos de autenticación inseguros.

No persistas contraseñas en localStorage ni en otros mecanismos de demostración.

Indica de manera clara que la integración real se completará en la Fase 03.

## 12. APPLICATION SHELL

Implementa el layout base de la aplicación financiera.

Incluye:

- Sidebar.
- Header.
- Área de contenido principal.
- Navegación móvil.
- Identidad visual.
- Indicador de ruta activa.
- Menú de usuario preliminar.
- Componentes de navegación reutilizables.

La navegación incluirá:

Resumen
Transacciones
Categorías
Presupuestos
Reportes
Configuración

Utiliza iconografía Lucide consistente.

En escritorio:

- Sidebar lateral de aproximadamente 256px.
- Header limpio.
- Área de contenido con ancho adaptable.
- Espaciado consistente.
- Navegación claramente identificable.

En tablet:

- Sidebar colapsable o drawer.
- Reorganización de tarjetas y contenido.

En móvil:

- Header compacto.
- Menú de navegación accesible.
- Contenido adaptable sin scroll horizontal involuntario.
- Áreas táctiles adecuadas.

Mantén una estrategia coherente para la navegación y los layouts.

Durante esta fase las rutas financieras podrán visualizarse localmente para revisar el diseño.

Este comportamiento es exclusivamente temporal y no debe presentarse como protección de rutas.

En la Fase 03 deberá sustituirse completamente por autenticación real y controles de acceso en servidor.

## 13. RUTAS PRINCIPALES

Crea las siguientes páginas mediante App Router:

/
/login
/register
/dashboard
/transactions
/categories
/budgets
/reports
/settings

Organiza las páginas mediante Route Groups:

(marketing)
(auth)
(app)

Implementa las interfaces preliminares de todos los módulos.

Dashboard:

- Tarjetas KPI.
- Balance acumulado.
- Ingresos.
- Gastos.
- Flujo de efectivo.
- Gráfico de ingresos y gastos.
- Gráfico de gastos por categoría.
- Transacciones recientes.
- Selector de período.

Transacciones:

- Encabezado del módulo.
- Botón de nueva transacción.
- Interfaz de filtros.
- Buscador.
- Tabla responsive o tarjetas móviles.
- Interfaz de formulario de transacción.

Categorías:

- Distribución por ingresos y gastos.
- Tarjetas o listado de categorías.
- Interfaz de creación y edición.
- Colores e iconos.

Presupuestos:

- Selector de mes.
- Tarjetas de presupuesto.
- Barras de progreso.
- Indicadores de consumo.
- Estados de advertencia.

Reportes:

- Selectores de período.
- Gráficos comparativos.
- Distribución de gastos.
- Interfaz de exportación CSV.

Configuración:

- Interfaz de información del perfil.
- Preferencia de moneda USD.
- Zona horaria de referencia.
- Sección de sesión.

Prioriza la coherencia visual entre módulos.

Utiliza componentes compartidos y evita duplicación de código.

En esta fase no implementes el CRUD real ni las consultas a Supabase.

No agregues funcionalidades fuera del alcance aprobado.

## 14. DATOS DE DEMOSTRACIÓN

Utiliza únicamente datos ficticios para validar visualmente la aplicación.

Centraliza los datos de demostración en una ubicación claramente identificada, por ejemplo:

src/lib/demo-data.ts

Evita distribuir datos hardcodeados de forma desorganizada entre los componentes.

Identifica las interfaces preliminares como vistas de demostración durante esta fase.

Los datos ficticios deberán:

- Ser coherentes entre módulos.
- Mantener consistencia matemática.
- Utilizar importes en USD.
- Mostrar fechas y categorías realistas.
- No incluir información personal auténtica.

Los gráficos, balances y presupuestos deben corresponder matemáticamente con los datos de demostración.

No almacenes los datos ficticios en una base de datos externa.

No implementes mecanismos temporales de persistencia que luego puedan confundirse con la implementación real.

En las fases posteriores, sustituye los datos de demostración por información real del usuario autenticado.

## 15. COMPONENTES Y ARQUITECTURA

Prioriza Server Components por defecto.

Utiliza Client Components exclusivamente cuando exista una necesidad de:

- Hooks.
- Eventos.
- Formularios.
- Gráficos.
- Navegación interactiva.
- APIs del navegador.

Implementa componentes reutilizables para:

- BrandLogo.
- AppSidebar.
- AppHeader.
- MobileNav.
- PageHeader.
- KpiCard.
- MoneyDisplay.
- EmptyState.
- ErrorAlert.
- CategoryIcon.
- FinancialChart.
- BudgetProgress.
- LoadingSkeleton.

Adapta los nombres cuando exista una justificación técnica.

Respeta la estructura del Implementation Plan.

Crea únicamente directorios y archivos que tengan una finalidad real dentro de la fase.

Evita archivos vacíos, abstracciones prematuras y dependencias circulares.

Prepara utilidades básicas para:

- Formateo monetario en USD.
- Conversión exacta entre dólares y centavos.
- Formateo de fechas.
- Manejo de la zona horaria America/El_Salvador.

Utiliza operaciones enteras seguras y define límites monetarios coherentes con Number.MAX_SAFE_INTEGER.

Evita errores de precisión de punto flotante en la conversión de importes.

## 16. ESTADOS DE INTERFAZ

Implementa la infraestructura visual de:

- loading.tsx.
- error.tsx.
- not-found.tsx.
- Skeletons.
- Estados vacíos.
- Mensajes de validación.
- Notificaciones Toast.
- Indicadores de carga.
- Componentes de error con opción de reintento cuando corresponda.

No generes retrasos artificiales en la aplicación solamente para simular una carga.

No provoques errores deliberados en la versión que posteriormente se desplegará.

Prepara los componentes para integrarlos correctamente con las operaciones reales en las siguientes fases.

## 17. RESPONSIVE Y ACCESIBILIDAD

Verifica visualmente las interfaces en diferentes resoluciones, incluyendo:

- 1920x1080.
- 1440x900.
- 1366x768.
- 1024x768.
- 768x1024.
- 390x844.
- 360x800.

Comprueba:

- Ausencia de desbordamientos horizontales involuntarios.
- Adaptación de tarjetas.
- Legibilidad de textos.
- Comportamiento de tablas.
- Adaptación de gráficos.
- Navegación móvil.
- Comportamiento de modales.
- Formularios.
- Contraste.
- Foco visible.
- Navegación por teclado.
- Etiquetas accesibles.
- Interacción táctil.

Utiliza el agente de navegador de Antigravity cuando esté disponible.

No te limites a inspeccionar el código CSS.

Corrige los problemas encontrados antes de cerrar la fase.

## 18. PRUEBAS AUTOMATIZADAS

Configura Vitest.

Crea pruebas unitarias iniciales para las utilidades realmente implementadas, especialmente:

- Conversión de dólares a centavos.
- Conversión de centavos a dólares.
- Formateo monetario.
- Importes con dos decimales.
- Importes mínimos.
- Valores inválidos.
- Límites seguros de enteros.
- Utilidades de fecha.
- Validaciones Zod de los formularios de autenticación.

Incluye casos como:

0.01
19.99
1000000.50

Comprueba que la conversión monetaria no produzca errores de precisión.

No generes pruebas triviales únicamente para incrementar la cantidad de tests.

Documenta las pruebas realmente ejecutadas y sus resultados.

## 19. VALIDACIONES TÉCNICAS

Ejecuta como mínimo:

npm run lint
npm run typecheck
npm run test
npm run build

Verifica que la aplicación pueda iniciarse mediante:

npm run dev

Comprueba que todas las rutas previstas puedan visualizarse localmente.

Revisa errores de consola del navegador.

Analiza advertencias relevantes de compilación.

Verifica el estado de las dependencias y las vulnerabilidades reportadas por npm.

No ejecutes actualizaciones destructivas o npm audit fix --force automáticamente.

Si una validación falla:

1. Identifica la causa.
2. Corrige el código o configuración.
3. Ejecuta nuevamente la validación.
4. Documenta el problema y la solución.

No declares una validación como exitosa si no fue ejecutada.

## 20. EVIDENCIAS VISUALES

Utiliza las herramientas disponibles para capturar evidencias reales de la aplicación funcionando.

Almacena las capturas dentro de docs/screenshots/ cuando sea técnicamente posible.

Capturas sugeridas:

- phase-02-landing-desktop.png
- phase-02-landing-mobile.png
- phase-02-login.png
- phase-02-register.png
- phase-02-dashboard-desktop.png
- phase-02-dashboard-mobile.png
- phase-02-transactions.png
- phase-02-categories.png
- phase-02-budgets.png
- phase-02-reports.png
- phase-02-settings.png

No generes capturas ficticias.

Si las herramientas no permiten guardar directamente alguna evidencia, registra la limitación y conserva las referencias disponibles.

No incluyas credenciales ni información personal en las evidencias.

## 21. CRITERIOS DE ACEPTACIÓN

La Fase 02 se considerará completada únicamente cuando:

- Next.js 16 o superior esté instalado.
- TypeScript estricto esté configurado.
- Tailwind CSS funcione correctamente.
- shadcn/ui esté configurado.
- El stack tecnológico sea compatible.
- Git esté inicializado.
- Existan commits reales y descriptivos.
- AGENTS.md esté creado.
- Las instrucciones persistentes estén configuradas cuando la herramienta lo permita.
- Los prompts estén documentados.
- El Implementation Plan esté almacenado en el repositorio.
- README.md y VIBE_CODING.md estén actualizados.
- .env.example esté creado y versionado.
- .gitignore proteja los archivos sensibles.
- La identidad visual esté implementada.
- La landing page sea funcional.
- Las interfaces de autenticación estén implementadas.
- El AppShell sea responsive.
- Las nueve rutas estén creadas.
- Los datos de demostración estén claramente separados.
- Existan componentes de carga y error.
- Las utilidades monetarias tengan pruebas.
- Las validaciones técnicas se hayan ejecutado.
- Las verificaciones visuales se hayan realizado según las capacidades disponibles.
- Los problemas encontrados estén documentados.

Si algún criterio no puede completarse, registra su estado como pendiente o bloqueado y explica la causa.

## 22. RESTRICCIONES DE ESTA FASE

No debes:

- Crear todavía un proyecto remoto en Supabase.
- Solicitar credenciales de Supabase.
- Aplicar migraciones remotas.
- Implementar autenticación ficticia como si fuera real.
- Publicar el repositorio en GitHub.
- Desplegar en Vercel.
- Contratar servicios.
- Generar costos.
- Avanzar automáticamente a la Fase 03.

Resuelve autónomamente cualquier problema técnico que pertenezca a la Fase 02.

## 23. INFORME DE CIERRE

Al finalizar, actualiza toda la documentación y presenta un informe de cierre que contenga:

1. Resumen ejecutivo.
2. Estado de la Fase 02.
3. Versiones realmente instaladas.
4. Funcionalidades e interfaces implementadas.
5. Estructura final de directorios.
6. Decisiones técnicas.
7. Archivos principales creados o modificados.
8. Problemas encontrados y soluciones.
9. Validaciones y pruebas ejecutadas.
10. Resultados de las pruebas.
11. Verificaciones responsive.
12. Evidencias visuales.
13. Historial de commits reales.
14. Estado de VIBE_CODING.md.
15. Matriz actualizada de cumplimiento académico.
16. Limitaciones o bloqueos.
17. Instrucciones para visualizar la aplicación localmente.
18. Preparación necesaria para la Fase 03.

Diferencia claramente entre:

- Implementado.
- Verificado.
- Preliminar.
- Pendiente.
- Bloqueado.

No inventes resultados ni ocultes errores pendientes.

Ejecuta completamente la Fase 02 desde este momento.

No te limites a explicar cómo realizarla.

Finaliza el trabajo correspondiente a esta fase y espera el siguiente prompt de autorización antes de avanzar a la Fase 03.
```
