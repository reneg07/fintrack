# Prompt 004 — Implementación de módulos funcionales de FinTrack (Fase 04)

- **Identificador:** `004-functional-modules`
- **Fase:** Fase 04 — Implementación completa de módulos funcionales
- **Fecha real de recepción:** 2026-11-27

## Contenido íntegro del prompt recibido

```text
# PROMPT-004 — Implementación de módulos funcionales de FinTrack

## 1. CONTEXTO Y AUTORIZACIÓN

Se ha revisado y aprobado el Walkthrough definitivo de
la Fase 03.1 del proyecto FinTrack.

Las Fases 01, 02 y 03 se encuentran aprobadas para
continuar con el desarrollo.

Resultados reportados durante la última iteración:

- 22/22 pruebas unitarias aprobadas.
- 18/18 pruebas reales PostgreSQL y RLS aprobadas.
- 15/15 flujos autenticados E2E aprobados.
- 63/63 comprobaciones responsive aprobadas.
- ESLint sin errores.
- TypeScript sin errores.
- Build de producción exitoso.
- Conexión real con Supabase verificada.
- Aislamiento de información entre usuarios verificado.
- Migración correctiva UTF-8 aplicada.
- Autenticación mediante cookies operativa.
- Grabaciones y evidencias reales disponibles.

La confirmación por correo electrónico permanece activa.

La validación integral del registro público, entrega SMTP,
confirmación de correo y callback se mantiene como requisito
obligatorio antes de cerrar el despliegue de la Fase 06.

No consideres que Auto Confirm User demuestra por sí solo
el funcionamiento del registro público.

Estás autorizado a ejecutar completamente la Fase 04.

Actúa como Senior Full Stack Developer, Software Architect,
Database Engineer, UI/UX Engineer y QA Engineer.

Conserva el contexto de:

- AGENTS.md.
- Reglas persistentes de Antigravity.
- Implementation Plan.
- Prompts anteriores.
- Walkthroughs anteriores.
- docs/ARCHITECTURE.md.
- docs/TESTING.md.
- VIBE_CODING.md.
- ADR-009, ADR-011 y ADR-012.
- Migraciones PostgreSQL aplicadas.

Trabaja autónomamente dentro del alcance autorizado.

No te limites a elaborar otro Implementation Plan.
Debes implementar, ejecutar, probar, corregir y documentar.

No solicites autorización para operaciones rutinarias
no destructivas dentro de esta fase.

## 2. REGISTRO AUTOMÁTICO DEL PROMPT

Antes de comenzar, almacena íntegramente este prompt en:

docs/prompts/004-functional-modules.md

Actualiza:

- docs/prompts/README.md
- VIBE_CODING.md

Registra esta fase como una nueva iteración real del
proceso de Vibe Coding.

Conserva el historial de las fases anteriores.

Documenta automáticamente cualquier decisión técnica,
problema encontrado, solución, prueba o modificación.

No solicites al usuario realizar documentación manual.

## 3. AUDITORÍA INICIAL DEL PROYECTO

Antes de implementar nuevas funcionalidades:

- Inspecciona la estructura actual del proyecto.
- Revisa los componentes financieros existentes.
- Revisa las utilidades monetarias.
- Revisa los tipos TypeScript.
- Revisa los esquemas Zod existentes.
- Revisa los clientes Supabase SSR.
- Revisa los Route Handlers existentes.
- Revisa las políticas RLS documentadas.
- Revisa las migraciones SQL.
- Revisa los scripts de pruebas.
- Comprueba el estado de Git.
- Comprueba la conexión con Supabase.

Identifica qué funcionalidades ya están implementadas
y cuáles continúan siendo interfaces preliminares.

Reutiliza el código existente cuando sea adecuado.

No reconstruyas módulos funcionales sin justificación.

No actualices indiscriminadamente las dependencias
ni modifiques el stack aprobado.

Mantén el diseño Refined Emerald Fintech implementado
en la Fase 02.

## 4. OBJETIVO GENERAL

Convertir FinTrack en una aplicación completamente
funcional de gestión de finanzas personales.

Implementa contra Supabase real:

- Gestión de categorías.
- Gestión de ingresos y gastos.
- Presupuestos mensuales.
- Dashboard financiero.
- Reportes financieros.
- Exportación CSV.
- Configuración y perfil.

El usuario debe poder iniciar sesión, registrar sus
movimientos, establecer presupuestos y consultar sus
resultados financieros reales.

No utilices datos de demostración dentro de las rutas
privadas para simular funcionalidades terminadas.

## 5. ORDEN DE IMPLEMENTACIÓN

Desarrolla los módulos en el siguiente orden:

1. Infraestructura de servicios, API y utilidades.
2. Categorías.
3. Transacciones.
4. Presupuestos.
5. Dashboard.
6. Reportes y exportación CSV.
7. Configuración e integración entre módulos.
8. Pruebas y validaciones.
9. Documentación y Walkthrough.

Genera commits reales conforme completes cada bloque.

No esperes hasta terminar todos los módulos para
ejecutar las primeras validaciones.

## 6. ARQUITECTURA DE SERVICIOS

Implementa una capa de servicios reutilizable para
separar la lógica de negocio del acceso HTTP y la UI.

Utiliza o adapta:

src/services/categories.service.ts
src/services/transactions.service.ts
src/services/budgets.service.ts
src/services/dashboard.service.ts
src/services/reports.service.ts
src/services/profile.service.ts

Utiliza esquemas de validación en:

src/schemas/

Mantén los contratos y tipos en:

src/types/

Utiliza Server Components para cargar los datos
iniciales mediante la capa de servicios.

Utiliza Client Components para:

- Formularios.
- Filtros.
- Búsquedas.
- Modales.
- Gráficos.
- Selectores de período.
- Actualizaciones dinámicas.
- Interacciones del usuario.

Los Server Components no deberán realizar peticiones
HTTP innecesarias contra la API de la propia aplicación.

Los Client Components consumirán Route Handlers reales
cuando corresponda.

Evita duplicar lógica de negocio entre servicios,
Route Handlers y componentes.

Marca los módulos exclusivos del servidor de manera
que no puedan importarse accidentalmente al cliente.

No utilices any como solución a problemas de tipado.

## 7. IMPLEMENTACIÓN DE ROUTE HANDLERS

Implementa o completa los endpoints definidos en
el Implementation Plan.

Categorías:

GET    /api/categories
POST   /api/categories
PATCH  /api/categories/[id]
DELETE /api/categories/[id]

Transacciones:

GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/[id]
PATCH  /api/transactions/[id]
DELETE /api/transactions/[id]

Presupuestos:

GET    /api/budgets
POST   /api/budgets
PATCH  /api/budgets/[id]
DELETE /api/budgets/[id]

Dashboard:

GET    /api/dashboard

Reportes:

GET    /api/reports
GET    /api/reports/export

Perfil:

GET    /api/profile
PATCH  /api/profile

Autenticación existente:

POST   /api/auth/signout

Respeta los contratos existentes y documenta cualquier
ajuste que sea necesario.

Utiliza respuestas JSON consistentes, excepto cuando
el endpoint de exportación devuelva un archivo CSV.

Aplica los códigos HTTP apropiados:

- 200: operación exitosa.
- 201: recurso creado.
- 204: operación exitosa sin contenido, si corresponde.
- 400: solicitud inválida.
- 401: usuario no autenticado.
- 403: operación no autorizada.
- 404: recurso no encontrado o no accesible.
- 409: conflicto de integridad o duplicación.
- 500: error interno inesperado.

No reveles información sobre la existencia de registros
pertenecientes a otros usuarios.

No expongas stack traces, errores SQL internos ni
información sensible.

## 8. SEGURIDAD OBLIGATORIA DE LAS API

Todas las operaciones privadas deberán:

- Verificar la identidad desde el servidor.
- Utilizar el cliente Supabase asociado a la sesión.
- Respetar las políticas RLS.
- Validar los datos de entrada mediante Zod.
- Verificar la autorización correspondiente.
- Utilizar respuestas privadas sin caché pública.
- Aplicar Cache-Control: no-store cuando corresponda.
- Mantener la validación de origen para mutaciones.

Nunca confíes en un user_id proporcionado por el cliente.

Obtén el identificador de usuario de la sesión validada.

No utilices service_role para operaciones normales
de la aplicación.

No deshabilites RLS para resolver problemas de acceso.

No utilices claves secretas dentro del navegador.

No permitas modificar campos protegidos mediante
asignaciones indiscriminadas del cuerpo JSON.

Construye explícitamente los campos permitidos para
INSERT y UPDATE.

Valida identificadores UUID, filtros, rangos de fecha,
tipos, límites y parámetros de paginación.

No construyas consultas de búsqueda concatenando
directamente entradas de usuario sin tratamiento seguro.

## 9. PRECISIÓN MONETARIA — ADR-011

Implementa completamente la estrategia monetaria
documentada durante la Fase 03.1.

El almacenamiento actual utiliza BIGINT y centavos
enteros positivos.

El límite individual establecido por PostgreSQL es:

900000000000000 centavos.

Aunque cada importe individual sea seguro en JavaScript,
la suma de múltiples transacciones puede superar
Number.MAX_SAFE_INTEGER.

Por lo tanto:

- Mantén los importes individuales en centavos enteros.
- Evita parseFloat para conversiones monetarias exactas.
- Evita multiplicaciones decimales susceptibles a errores.
- Implementa acumulaciones exactas mediante PostgreSQL
  NUMERIC, BigInt o una estrategia equivalente justificada.
- Evita convertir totales acumulados a number cuando
  puedan perder precisión.
- Serializa importes acumulados de manera exacta.
- Utiliza cadenas decimales en contratos JSON cuando
  sean necesarias para transportar cantidades exactas.
- No intentes serializar BigInt directamente con
  JSON.stringify sin conversión explícita.
- Implementa formateo monetario que preserve todos
  los centavos del importe original.

Revisa:

src/lib/money.ts
src/types/domain.ts

Adapta los contratos de dominio cuando sea necesario.

Documenta claramente la diferencia entre:

- Importe individual.
- Importe acumulado.
- Valor serializado.
- Valor formateado.
- Valor utilizado exclusivamente para visualización
  gráfica.

Si Recharts requiere valores numéricos, implementa
una representación gráfica segura y explícitamente
diferenciada del valor financiero exacto.

Los indicadores, tablas, tooltips financieros y
exportaciones deberán preservar los valores exactos.

Las aproximaciones gráficas nunca deberán utilizarse
como fuente de verdad para los cálculos financieros.

Incluye pruebas de acumulaciones que superen
Number.MAX_SAFE_INTEGER.

Incluye pruebas de conversión y formateo para:

- 0.01 USD.
- 19.99 USD.
- 1000000.50 USD.
- Importes cercanos al límite individual.
- Sumas superiores al límite seguro de JavaScript.
- Balances negativos.
- Presupuestos excedidos.

No declares implementado ADR-011 hasta verificarlo
mediante pruebas automatizadas.

## 10. CONSULTAS COMPLETAS Y PAGINACIÓN

Evita que los límites de filas de Supabase/PostgREST
produzcan indicadores financieros incorrectos.

Los cálculos de dashboard, presupuestos y reportes
deberán considerar todos los registros correspondientes
al usuario y período solicitado.

No calcules totales financieros utilizando únicamente
los registros de la página visible de una tabla.

Utiliza agregaciones en PostgreSQL o recuperación
paginada completa según resulte más apropiado.

Prioriza consultas eficientes en la base de datos.

Si utilizas funciones RPC:

- Utiliza migraciones incrementales versionadas.
- Respeta RLS y los permisos del usuario autenticado.
- Prefiere SECURITY INVOKER cuando corresponda.
- Evita funciones SECURITY DEFINER innecesarias.
- Valida sus parámetros.
- Restringe los permisos de ejecución.
- Mantén los resultados monetarios exactos.

Comprueba que la paginación tenga un orden estable,
incluyendo un criterio de desempate.

Incluye pruebas que demuestren que los agregados
financieros no se truncan al superar los límites
de una página o del proveedor.

Utiliza escenarios locales o datos controlados de prueba
sin generar cargas excesivas sobre Supabase.

## 11. GOBIERNO DE MIGRACIONES — ADR-012

Las migraciones anteriores ya fueron aplicadas
manualmente en Supabase SQL Editor.

No vuelvas a ejecutarlas.

No modifiques silenciosamente su contenido histórico.

Si necesitas nuevas funciones, índices o modificaciones
de esquema:

- Crea una nueva migración incremental.
- Documenta su finalidad.
- Verifica su compatibilidad con los datos existentes.
- Mantén la seguridad y RLS.
- Genera tipos TypeScript actualizados.
- Aplica la migración únicamente mediante herramientas
  autorizadas.

Si requieres intervención manual del usuario:

- Proporciona el nombre y ruta exacta del archivo.
- Indica dónde ejecutarlo.
- Agrupa las configuraciones pendientes cuando sea
  técnicamente posible.
- Continúa con las tareas que no dependan del bloqueo.

No solicites al usuario redactar SQL manualmente.

No ejecutes reset, drop o eliminación de datos
existentes sin autorización explícita.

Mantén la codificación UTF-8 y verifica que no vuelvan
a introducirse caracteres corruptos por PowerShell 5.1.

No declares sincronizado el historial remoto de
Supabase CLI sin verificarlo realmente.

## 12. MÓDULO DE CATEGORÍAS

Ruta:

/categories

Implementa la gestión real de categorías.

Funcionalidades:

- Consultar categorías del usuario autenticado.
- Separar categorías de ingresos y gastos.
- Crear categorías.
- Editar categorías.
- Eliminar categorías sin registros asociados.
- Mostrar categorías iniciales existentes.
- Seleccionar colores.
- Seleccionar iconos Lucide.
- Mostrar información de uso cuando corresponda.

Respeta las doce categorías iniciales generadas
automáticamente por PostgreSQL.

No vuelvas a sembrarlas desde el frontend.

Validaciones:

- Nombre obligatorio.
- Nombre normalizado y sin espacios innecesarios.
- Tipo income o expense.
- Color hexadecimal válido.
- Icono perteneciente al catálogo permitido.
- Unicidad de nombre por usuario y tipo.

La eliminación de una categoría vinculada a
transacciones o presupuestos deberá rechazarse.

Devuelve HTTP 409 y un mensaje comprensible:

"No puedes eliminar esta categoría porque tiene
transacciones o presupuestos asociados."

Muestra el conteo exacto de registros vinculados
cuando esté disponible de forma segura.

Mantén la integridad de las relaciones ante operaciones
concurrentes.

No elimines registros financieros en cascada para
permitir el borrado de una categoría.

No permitas cambiar el tipo de una categoría si
existen relaciones incompatibles.

Utiliza diálogos de confirmación para eliminar.

Actualiza la interfaz después de cada operación
exitosa sin necesidad de recargar toda la aplicación.

## 13. MÓDULO DE TRANSACCIONES

Ruta:

/transactions

Implementa CRUD real de ingresos y gastos.

Campos:

- Tipo de movimiento.
- Categoría.
- Importe.
- Fecha.
- Descripción.
- Notas opcionales.

Funcionalidades:

- Registrar ingresos.
- Registrar gastos.
- Editar movimientos.
- Eliminar movimientos.
- Consultar transacciones.
- Buscar por descripción y notas.
- Filtrar por tipo.
- Filtrar por categoría.
- Filtrar por rango de fechas.
- Limpiar filtros.
- Paginar resultados.
- Mostrar totales correspondientes a los filtros.

Reutiliza el formulario y los componentes visuales
existentes cuando sea posible.

Validaciones:

- Importe obligatorio y positivo.
- Máximo dos decimales.
- Respeto del límite monetario establecido.
- Fecha válida.
- Categoría perteneciente al usuario.
- Compatibilidad entre categoría y tipo de movimiento.
- Longitudes razonables para descripción y notas.

Filtra las categorías disponibles según el tipo
seleccionado.

Si cambia el tipo de movimiento, limpia la categoría
seleccionada cuando resulte incompatible.

Al editar una transacción, carga correctamente
sus valores actuales.

No pierdas precisión al convertir los importes
almacenados en centavos a campos de formulario.

Solicita confirmación antes de eliminar.

Evita envíos duplicados durante las operaciones.

No muestres mensajes de éxito hasta que la operación
haya sido confirmada por el servidor.

Utiliza ordenamiento inicial por fecha descendente,
con criterios de desempate deterministas.

Implementa paginación real desde el servidor.

Los totales filtrados deberán corresponder a todos
los resultados del filtro y no solamente a la página
actual.

Adapta el listado para escritorio y tarjetas móviles,
manteniendo el diseño existente.

## 14. HOOKS DE REACT — REQUISITO ACADÉMICO

Implementa un uso real, funcional y justificado de:

- useState.
- useEffect.

Utiliza useState para gestionar, según corresponda:

- Filtros.
- Paginación.
- Búsqueda.
- Modales.
- Períodos.
- Estados de carga.
- Datos obtenidos dinámicamente.
- Errores.

Implementa un hook useDebounce para la búsqueda
de transacciones.

Utiliza useEffect cuando sea necesario sincronizar
los filtros o períodos con una fuente externa.

Ejemplos:

- Recargar transacciones mediante GET /api/transactions.
- Actualizar indicadores mediante GET /api/dashboard.
- Cambiar el mes mediante GET /api/budgets.
- Actualizar reportes mediante GET /api/reports.

Utiliza AbortController o una estrategia equivalente
para cancelar solicitudes obsoletas.

Evita condiciones de carrera que permitan que una
respuesta antigua sobrescriba resultados recientes.

Implementa correctamente las dependencias de los
efectos y su limpieza.

Evita bucles de renderizado y solicitudes redundantes.

Aprovecha los datos iniciales obtenidos mediante
Server Components sin duplicar innecesariamente
las primeras solicitudes.

No agregues useEffect artificialmente solo para
cumplir el requisito académico.

Documenta ejemplos concretos y sus archivos
correspondientes en VIBE_CODING.md.

## 15. MÓDULO DE PRESUPUESTOS

Ruta:

/budgets

Implementa presupuestos mensuales reales asociados
a categorías de gastos.

Funcionalidades:

- Crear presupuesto.
- Editar presupuesto.
- Eliminar presupuesto.
- Consultar presupuestos por mes.
- Seleccionar categoría de gasto.
- Definir importe límite.
- Consultar monto consumido.
- Consultar monto restante.
- Consultar porcentaje de consumo.
- Visualizar presupuestos excedidos.
- Mostrar indicadores generales del mes.

Respeta la restricción de unicidad:

usuario + categoría + mes.

Utiliza alert_threshold_pct si está disponible en
el esquema actual, manteniendo 80% como valor
predeterminado.

Calcula el gasto consumido utilizando las
transacciones reales:

- Del usuario autenticado.
- Del tipo expense.
- De la misma categoría.
- Del mismo mes del presupuesto.

Reglas de negocio:

Monto restante = límite - gasto consumido.

Porcentaje consumido = gasto consumido / límite × 100.

Estados:

- Saludable: por debajo del umbral configurado.
- Advertencia: desde el umbral hasta menos del 100%.
- Límite alcanzado: exactamente 100%.
- Excedido: superior al 100%.

Mantén las comparaciones monetarias exactas.

La barra visual puede limitarse al 100%, pero el
porcentaje y el excedente deben reflejar el valor real.

No impidas registrar un gasto por superar el
presupuesto; los presupuestos son herramientas
de seguimiento, no bloqueos financieros.

Ejemplos:

Presupuesto: $200.00
Gasto: $150.00
Disponible: $50.00
Consumo: 75%

Presupuesto: $200.00
Gasto: $250.00
Excedente: $50.00
Consumo: 125%

Comprueba que crear, editar o eliminar una transacción
actualice correctamente el consumo correspondiente.

No almacenes una copia desactualizada del monto
consumido como fuente de verdad.

## 16. DASHBOARD FINANCIERO

Ruta:

/dashboard

Sustituye completamente la información preliminar
por datos reales de Supabase.

Implementa cuatro indicadores:

1. Balance acumulado histórico.
2. Ingresos del período seleccionado.
3. Gastos del período seleccionado.
4. Flujo de efectivo neto del período.

Reglas:

Balance acumulado histórico =
todos los ingresos registrados - todos los gastos
registrados del usuario.

Ingresos del período =
suma de ingresos dentro del período seleccionado.

Gastos del período =
suma de gastos dentro del período seleccionado.

Flujo neto del período =
ingresos del período - gastos del período.

El balance acumulado histórico será independiente
del filtro de período.

Etiqueta claramente esta diferencia en la interfaz
para evitar interpretaciones incorrectas.

Implementa:

- Gráfico de ingresos frente a gastos.
- Evolución temporal del flujo financiero.
- Distribución de gastos por categoría.
- Cinco transacciones recientes.
- Acceso rápido a registrar una transacción.
- Estados vacíos para usuarios nuevos.
- Skeletons y estados de error.
- Selector de período.

Períodos:

- Mes actual.
- Meses anteriores.
- Últimos tres meses.
- Últimos seis meses.
- Año en curso.

Define y documenta la semántica exacta de cada
período, incluyendo el tratamiento del mes actual
incompleto.

Los indicadores y gráficos deben corresponder
matemáticamente a las transacciones reales.

No utilices porcentajes inventados, tendencias
ficticias ni métricas que no puedan calcularse.

No muestres incrementos porcentuales engañosos
cuando el período anterior tenga valor cero.

Utiliza una presentación clara para valores
sin base de comparación.

## 17. MÓDULO DE REPORTES

Ruta:

/reports

Implementa reportes financieros reales.

Incluye:

- Comparación mensual de ingresos.
- Comparación mensual de gastos.
- Evolución histórica del flujo neto.
- Distribución de gastos por categoría.
- Variaciones respecto al período anterior.
- Resumen tabular.
- Filtros de período.
- Rango de fechas personalizado.
- Exportación CSV.

Mantén consistencia con los cálculos del dashboard.

Utiliza la misma lógica de agregación y fechas
cuando ambos módulos consulten el mismo período.

No dupliques fórmulas de negocio innecesariamente.

Incluye meses sin movimientos como valores cero
cuando corresponda al gráfico temporal.

Evita gráficos inválidos cuando no existan datos.

No interpretes automáticamente una ausencia de
gastos como una mejora porcentual.

Los filtros deberán ser funcionales y consumir
la API real de reportes.

Los gráficos Recharts deberán adaptarse al ancho
disponible y mostrar tooltips comprensibles.

## 18. EXPORTACIÓN CSV

Implementa:

GET /api/reports/export

La exportación deberá contener las transacciones
reales del usuario autenticado según los filtros
aplicados.

No limites la exportación a los registros visibles
en la tabla de la interfaz.

Incluye columnas en español:

- Fecha.
- Tipo.
- Categoría.
- Descripción.
- Notas.
- Importe USD.

Utiliza una representación consistente de los importes
y documenta si la columna utiliza signos o si el tipo
determina la naturaleza del movimiento.

El contenido deberá preservar exactamente los centavos.

Nombre sugerido:

fintrack-transacciones-YYYY-MM-DD.csv

Implementa:

- Codificación UTF-8.
- BOM para facilitar compatibilidad con Excel.
- Escapado correcto de comillas.
- Manejo de comas.
- Manejo de saltos de línea.
- Encabezados HTTP de descarga.
- Content-Type apropiado.
- Cache-Control: no-store.

Previene CSV Formula Injection en campos de texto
controlados por usuarios.

Considera valores que comiencen con:

=
+
-
@
tabulaciones
retornos de carro
saltos de línea

Considera también caracteres o espacios iniciales
que puedan ocultar una fórmula.

No alteres incorrectamente los importes numéricos
negativos legítimos generados por el sistema.

Incluye pruebas para descripciones y notas que
contengan fórmulas potencialmente peligrosas.

No exportes:

- Contraseñas.
- Tokens.
- Claves.
- Identificadores internos innecesarios.
- Información de otros usuarios.

Comprueba mediante Playwright que la descarga real
sea funcional y que el contenido coincida con los
filtros seleccionados.

## 19. FECHAS Y ZONA HORARIA

Mantén como referencia:

America/El_Salvador

Idioma:

es-SV

Moneda:

USD

Las fechas financieras almacenadas mediante DATE
deberán tratarse como fechas de calendario y no
como instantes UTC.

Evita conversiones que puedan desplazar una fecha
al día anterior o posterior.

Utiliza límites de período consistentes.

Para rangos mensuales, prioriza:

- Fecha inicial inclusiva.
- Fecha inicial del siguiente mes exclusiva.

Para filtros de fecha definidos por el usuario,
documenta cómo se interpreta la fecha final y
garantiza que la experiencia sea consistente.

Valida:

- Meses con diferente cantidad de días.
- Años bisiestos.
- Cambio de mes.
- Cambio de año.
- Fechas cercanas a medianoche UTC.
- Rangos invertidos.
- Fechas inválidas.

Mantén las decisiones documentadas en:

src/lib/dates.ts
docs/ARCHITECTURE.md

## 20. CONFIGURACIÓN Y PERFIL

Ruta:

/settings

La Fase 03 ya implementó el perfil real y el cierre
de sesión.

Reutiliza esta implementación.

Verifica:

- Visualización del nombre real.
- Visualización del correo del usuario autenticado.
- Edición del nombre.
- Persistencia de cambios.
- Actualización del AppHeader.
- Moneda USD.
- Zona horaria America/El_Salvador.
- Cierre de sesión.

No agregues edición de moneda o zona horaria si
la aplicación no admite realmente dichas preferencias.

No agregues funcionalidades de seguridad ficticias.

No introduzcas gestión de suscripciones, conexiones
bancarias o funcionalidades fuera del alcance.

## 21. CONSISTENCIA ENTRE MÓDULOS

Garantiza que las operaciones financieras se reflejen
correctamente en todos los módulos relacionados.

Ejemplos:

Al crear un ingreso:

- Aumentan los ingresos del período correspondiente.
- Aumenta el balance acumulado.
- Se actualiza el flujo neto.
- Aparece en transacciones recientes si corresponde.
- Se actualizan los reportes.

Al crear un gasto:

- Aumentan los gastos del período correspondiente.
- Disminuye el balance acumulado.
- Se actualiza el flujo neto.
- Aumenta el consumo del presupuesto correspondiente.
- Se actualiza el gráfico de gastos por categoría.
- Se actualizan los reportes.

Al editar o eliminar movimientos:

- Los indicadores se recalculan correctamente.
- No se duplican importes.
- No permanecen totales obsoletos.
- Los presupuestos afectados se actualizan.

Al cambiar una categoría:

- Su nombre, color e icono se reflejan en los
  registros y gráficos relacionados cuando corresponda.

Implementa una estrategia coherente de actualización
de datos tras las mutaciones.

Utiliza refetch, router.refresh o mecanismos
equivalentes cuando estén justificados.

Evita estados financieros inconsistentes causados
por datos iniciales obsoletos o respuestas en carrera.

## 22. DISEÑO Y EXPERIENCIA DE USUARIO

Conserva el sistema de diseño existente:

Refined Emerald Fintech.

Mantén:

- Paleta de colores.
- Tipografía Geist.
- Sidebar.
- AppHeader.
- Navegación móvil.
- Componentes shadcn/ui.
- Iconografía Lucide.
- Espaciado.
- Jerarquía visual.
- Identidad de marca.

No realices un rediseño general de la aplicación.

Puedes mejorar componentes únicamente cuando
exista una necesidad funcional, responsive o
de accesibilidad.

Todas las funcionalidades deben incluir estados
adecuados de:

- Carga.
- Éxito.
- Error.
- Estado vacío.
- Validación.
- Confirmación de eliminación.
- Operación en progreso.

Utiliza Sonner para notificaciones cuando corresponda.

Evita notificaciones duplicadas o mensajes
técnicos innecesarios.

No dejes botones sin funcionalidad dentro de los
módulos incluidos en el alcance.

No utilices retrasos artificiales para demostrar
estados de carga.

Conserva ejemplos de demostración únicamente
en la landing page o pruebas claramente identificadas.

## 23. PRUEBAS UNITARIAS

Amplía la suite existente de Vitest.

Incluye pruebas para:

- Conversión monetaria.
- Acumulación monetaria exacta.
- Totales superiores a Number.MAX_SAFE_INTEGER.
- Formateo de importes acumulados.
- Balances negativos.
- Cálculo de ingresos.
- Cálculo de gastos.
- Cálculo de flujo neto.
- Cálculo de balance acumulado.
- Consumo de presupuestos.
- Umbrales de presupuestos.
- Presupuestos excedidos.
- Agrupación mensual.
- Distribución de gastos por categoría.
- Comparaciones porcentuales.
- Períodos con valores cero.
- Utilidades de fecha.
- Validación Zod.
- Paginación.
- Serialización exacta.
- Exportación CSV.
- Prevención de CSV Formula Injection.

Reutiliza las pruebas anteriores.

No elimines tests válidos para conseguir resultados
exitosos artificialmente.

No reduzcas assertions para ocultar errores.

Incluye casos límite y resultados esperados calculados
independientemente de las funciones probadas.

## 24. PRUEBAS DE INTEGRACIÓN FINANCIERA

Utiliza los usuarios controlados de prueba existentes:

TEST_USER_A_EMAIL
TEST_USER_A_PASSWORD
TEST_USER_B_EMAIL
TEST_USER_B_PASSWORD

Obtén sus valores desde .env.local.

No imprimas sus contraseñas.

No utilices service_role.

Crea un escenario financiero determinista y aislado,
con datos identificables como registros de prueba.

Ejemplo:

Período anterior:

Ingreso: $500.00
Gasto: $100.00

Período seleccionado:

Ingreso: $1000.00
Gasto alimentación: $120.00
Gasto transporte: $80.00

Presupuesto alimentación:

$150.00

Resultados esperados del escenario:

Balance acumulado histórico: $1200.00
Ingresos del período: $1000.00
Gastos del período: $200.00
Flujo neto del período: $800.00
Consumo alimentación: $120.00
Disponible alimentación: $30.00
Porcentaje consumido: 80%

Comprueba los resultados en:

- Base de datos.
- API.
- Dashboard.
- Presupuestos.
- Reportes.
- Exportación CSV.

Utiliza un período fijo o controlado para evitar que
las pruebas dependan accidentalmente de la fecha
de ejecución.

Garantiza que los resultados del escenario no se
confundan con datos preexistentes de las cuentas QA.

No elimines registros que no pertenezcan a la prueba.

Comprueba también que los valores se actualicen
correctamente después de editar y eliminar movimientos.

Incluye pruebas con más registros que el tamaño
de una página y pruebas de agregaciones completas
sin truncamiento.

Utiliza registros de prueba controlados y evita
generar cargas innecesarias sobre el plan gratuito.

Al finalizar, elimina exclusivamente los datos
temporales creados por las pruebas cuando sea seguro.

Conserva las cuentas QA para fases posteriores.

## 25. PRUEBAS DE SEGURIDAD DE LAS API

Además de las pruebas RLS existentes, comprueba
la seguridad de los nuevos Route Handlers.

Verifica:

- Acceso no autenticado.
- Acceso autenticado válido.
- Payload inválido.
- Identificador UUID inválido.
- Identificador inexistente.
- Solicitud cross-origin de mutación.
- Intento de modificar user_id.
- Lectura cruzada entre usuarios.
- Creación en nombre de otro usuario.
- Edición de registros ajenos.
- Eliminación de registros ajenos.
- Asociación con categorías ajenas.
- Presupuestos duplicados.
- Categorías incompatibles.
- Eliminación de categorías vinculadas.
- Respuestas privadas sin caché pública.
- Exportación CSV limitada al usuario autenticado.

Comprueba que el usuario B no pueda obtener información
del usuario A mediante dashboard, reportes o exportación.

No pruebes solamente operaciones CRUD directas
contra PostgreSQL.

Debes comprobar también los endpoints HTTP reales
de FinTrack.

Ejecuta nuevamente las pruebas RLS de la Fase 03.1
para detectar regresiones.

## 26. PRUEBAS E2E MEDIANTE PLAYWRIGHT

Reutiliza la infraestructura Playwright existente.

Implementa un script o suite específica para
validar la Fase 04.

Agrega un comando reproducible, por ejemplo:

npm run verify:phase04

Comprueba al menos los siguientes flujos reales:

1. Inicio de sesión con usuario QA.
2. Acceso al dashboard.
3. Creación de categoría.
4. Edición de categoría.
5. Registro de ingreso.
6. Registro de gasto.
7. Edición de transacción.
8. Eliminación de transacción.
9. Búsqueda de transacciones.
10. Filtrado por fecha.
11. Filtrado por categoría.
12. Filtrado por tipo.
13. Paginación.
14. Creación de presupuesto.
15. Edición de presupuesto.
16. Seguimiento automático del gasto.
17. Advertencia de límite cercano.
18. Presupuesto excedido.
19. Conflicto por presupuesto duplicado.
20. Rechazo del borrado de categoría vinculada.
21. Actualización del dashboard.
22. Cambio de período.
23. Actualización de reportes.
24. Exportación CSV real.
25. Persistencia de información al recargar.
26. Navegación móvil.
27. Aislamiento entre sesiones.
28. Cierre de sesión.

Utiliza assertions reales y verificables.

Evita depender exclusivamente de capturas de pantalla.

Comprueba que las operaciones persistan en Supabase.

No utilices mocks para sustituir pruebas reales de
integración financiera.

Si alguna prueba queda bloqueada, documenta su causa
y no la presentes como aprobada.

## 27. VALIDACIÓN RESPONSIVE

Conserva las siete resoluciones previamente definidas:

1920x1080
1440x900
1366x768
1024x768
768x1024
390x844
360x800

Prioriza los módulos que hayan cambiado.

Comprueba:

- Ausencia de desbordamientos horizontales.
- Gráficos adaptables.
- Tarjetas financieras.
- Tablas y listados.
- Filtros.
- Selectores de fechas.
- Formularios.
- Modales.
- Navegación.
- Botones.
- Textos con importes grandes.
- Estados vacíos.
- Mensajes de error.

Verifica la matriz responsive de las nueve rutas
después de incorporar los cambios funcionales.

Incluye escenarios con registros reales de prueba,
no solamente cuentas vacías.

Comprueba errores de consola y errores de página.

Corrige defectos relevantes antes de cerrar la fase.

## 28. EVIDENCIAS VISUALES Y GRABACIÓN

Genera evidencias reales en:

docs/screenshots/

Capturas sugeridas:

phase-04-dashboard-desktop.png
phase-04-dashboard-mobile.png
phase-04-transactions.png
phase-04-transactions-mobile.png
phase-04-create-transaction.png
phase-04-categories.png
phase-04-create-category.png
phase-04-budgets.png
phase-04-budget-warning.png
phase-04-budget-exceeded.png
phase-04-reports.png
phase-04-reports-mobile.png
phase-04-csv-export.png
phase-04-settings.png

Adapta el número de evidencias a las funcionalidades
realmente implementadas.

No generes capturas redundantes únicamente para
incrementar su cantidad.

Genera cuando sea posible una grabación real en:

docs/recordings/phase-04-financial-flow.webm

Flujo sugerido:

Inicio de sesión > Crear categoría > Registrar ingreso >
Registrar gasto > Crear presupuesto > Consultar dashboard >
Consultar reportes > Exportar CSV > Cerrar sesión.

Utiliza exclusivamente datos controlados de prueba.

No captures contraseñas, tokens, secretos o información
financiera auténtica.

Verifica que los archivos referenciados existan.

Utiliza enlaces relativos dentro del repositorio.

No reemplaces las evidencias históricas de las
fases anteriores.

## 29. VALIDACIONES TÉCNICAS

Ejecuta como mínimo:

npx next typegen
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:supabase-rls
npm run verify:phase03
npm run verify:phase04

Ejecuta las comprobaciones responsive adicionales
que correspondan.

Revisa el estado de dependencias y ejecuta la
auditoría npm apropiada.

No ejecutes npm audit fix --force automáticamente.

Verifica que el build utilice correctamente las
variables NEXT_PUBLIC_* existentes.

Comprueba que los scripts de prueba sean compatibles
con el entorno actual.

Si algún script histórico depende de una configuración
anterior, conserva su propósito y adapta su ejecución
de manera documentada.

No alteres pruebas para ocultar regresiones.

Ante cualquier fallo:

1. Identifica la causa.
2. Corrige el defecto.
3. Ejecuta nuevamente la validación.
4. Documenta el resultado.

No declares exitosas pruebas que no hayan sido
ejecutadas realmente.

## 30. CONTROL DE VERSIONES

Genera commits locales reales, progresivos y
descriptivos.

Mensajes sugeridos:

feat: implement secure financial service layer
feat: implement exact monetary aggregations
feat: implement category management
feat: implement transaction CRUD and filters
feat: implement monthly budget tracking
feat: integrate real financial dashboard
feat: implement financial reports
feat: add secure CSV export
test: validate financial calculations
test: verify financial API authorization
test: add end-to-end financial workflows
fix: resolve financial module integration issues
docs: document functional modules and walkthrough

Adapta los mensajes al trabajo realmente realizado.

No generes commits vacíos.

No alteres el historial existente.

Antes de cada commit verifica:

- git status.
- Cambios incluidos.
- Ausencia de secretos.
- Exclusión de .env.local.
- Ausencia de contraseñas QA.
- Ausencia de datos privados.
- Seguridad de archivos y evidencias.
- Correspondencia entre documentación y código.

No publiques todavía el repositorio en GitHub.

## 31. DOCUMENTACIÓN AUTOMÁTICA

Actualiza:

README.md
VIBE_CODING.md
AGENTS.md
docs/ARCHITECTURE.md
docs/TESTING.md
docs/IMPLEMENTATION_PLAN.md
docs/prompts/README.md

Actualiza las reglas persistentes de Antigravity
si existen nuevas convenciones relevantes.

Crea:

docs/walkthroughs/004-functional-modules.md

Documenta:

- Prompt recibido.
- Fecha real de ejecución.
- Arquitectura implementada.
- Servicios.
- Route Handlers.
- Contratos API.
- Esquemas de validación.
- Uso de Server Components.
- Uso de Client Components.
- Uso real de useState y useEffect.
- Estrategia monetaria definitiva.
- Decisiones técnicas.
- Migraciones adicionales.
- Problemas encontrados.
- Correcciones.
- Pruebas ejecutadas.
- Resultados reales.
- Evidencias.
- Commits.
- Limitaciones.

Actualiza la matriz de cumplimiento académico.

Identifica los archivos que evidencian cada requisito.

Mantén trazabilidad de las decisiones anteriores.

No reescribas el historial para ocultar errores.

No inventes resultados ni evidencias.

## 32. CRITERIOS DE ACEPTACIÓN

La Fase 04 podrá considerarse completada cuando:

- Los seis módulos privados sean funcionales.
- Las categorías utilicen Supabase real.
- El CRUD de categorías funcione.
- El borrado seguro de categorías funcione.
- El CRUD de transacciones funcione.
- La búsqueda y filtros funcionen.
- La paginación sea real.
- Los presupuestos utilicen datos reales.
- El gasto consumido se calcule correctamente.
- Las alertas presupuestarias funcionen.
- El dashboard utilice datos reales.
- Los indicadores sean matemáticamente correctos.
- Los reportes sean funcionales.
- Los gráficos reflejen información real.
- La exportación CSV funcione.
- Los cálculos monetarios preserven precisión.
- Las agregaciones no se trunquen por paginación.
- Los Route Handlers estén protegidos.
- Los usuarios no puedan acceder a datos ajenos.
- Exista consumo real de API desde Client Components.
- Exista uso funcional de useState y useEffect.
- Los estados de carga y error estén implementados.
- Las interfaces sean responsive.
- Las pruebas unitarias estén aprobadas.
- Las pruebas de integración estén aprobadas.
- Las pruebas de seguridad estén aprobadas.
- Las pruebas E2E relevantes estén aprobadas.
- El build de producción sea exitoso.
- Existan commits descriptivos.
- La documentación esté actualizada.
- Existan evidencias reales.
- El Walkthrough obligatorio esté generado.

Si un criterio esencial permanece incumplido,
no declares la fase completada al 100%.

Diferencia entre funcionalidades implementadas,
verificadas, pendientes y bloqueadas.

## 33. WALKTHROUGH OBLIGATORIO

Genera el artefacto nativo Walkthrough de Antigravity.

No entregues únicamente un informe dentro del chat.

Utiliza el archivo walkthrough.md mediante el
mecanismo de artefactos disponible.

Conserva una copia versionada en:

docs/walkthroughs/004-functional-modules.md

Incluye:

1. Resumen ejecutivo.
2. Estado definitivo de la Fase 04.
3. Arquitectura funcional implementada.
4. Servicios y contratos API.
5. Funcionalidades por módulo.
6. Diagrama del flujo de datos.
7. Estrategia monetaria implementada.
8. Resultados financieros de prueba.
9. Uso de Server y Client Components.
10. Evidencia de useState y useEffect.
11. Migraciones adicionales, si existen.
12. Problemas encontrados.
13. Soluciones implementadas.
14. Archivos creados y modificados.
15. Validaciones estáticas.
16. Resultados de pruebas unitarias.
17. Resultados de pruebas de integración.
18. Resultados de pruebas de seguridad.
19. Resultados de pruebas E2E.
20. Cobertura responsive.
21. Evidencias visuales reales.
22. Grabaciones disponibles.
23. Historial de commits con hashes reales.
24. Matriz de cumplimiento académico.
25. Estado de la documentación.
26. Limitaciones y bloqueos.
27. Preparación para la Fase 05.

Incluye capturas directamente en el Walkthrough
cuando las herramientas disponibles lo permitan.

El Walkthrough deberá permitir comprender y
reproducir el trabajo realizado sin depender
del historial de conversaciones.

## 34. RESTRICCIONES DE ESTA FASE

No implementar:

- Conexiones bancarias.
- Pagos electrónicos.
- Suscripciones.
- Múltiples monedas.
- Asesoramiento financiero automatizado.
- Funcionalidades de IA dentro de FinTrack.
- Módulos administrativos fuera del alcance.
- Funcionalidades experimentales innecesarias.

No rediseñar completamente la aplicación.

No realizar refactorizaciones generales sin
justificación técnica.

No modificar configuraciones de seguridad
de Supabase sin autorización.

No desactivar Confirm email.

No contratar servicios.

No generar costos.

No publicar en GitHub.

No desplegar en Vercel.

No avanzar automáticamente a la Fase 05.

## 35. INSTRUCCIÓN FINAL DE EJECUCIÓN

Comienza inmediatamente con la auditoría del
proyecto y la implementación de la Fase 04.

Trabaja de manera autónoma.

Implementa los módulos siguiendo el orden indicado.

Prueba cada bloque antes de continuar.

Corrige los problemas que encuentres.

Preserva todas las funcionalidades que ya operan
correctamente.

Solicita intervención humana únicamente cuando
sea estrictamente imprescindible.

Genera los commits correspondientes.

Actualiza automáticamente toda la documentación.

Finaliza entregando el artefacto Walkthrough
obligatorio con evidencias y resultados reales.

No avances a la Fase 05 hasta recibir el siguiente
prompt de autorización.
```
