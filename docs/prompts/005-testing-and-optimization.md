# PROMPT-005 — Auditoría técnica, testing, seguridad y optimización de FinTrack

## 1. CONTEXTO Y AUTORIZACIÓN

Se ha revisado el Walkthrough de la Fase 04 de FinTrack.

Se aprueba la implementación funcional para continuar con
la Fase 05.

Resultados reportados hasta el momento:

- 32/32 pruebas unitarias aprobadas.
- 42/42 comprobaciones de seguridad API aprobadas.
- 18/18 flujos financieros E2E aprobados.
- 18/18 pruebas de aislamiento RLS aprobadas.
- 15/15 flujos autenticados de regresión aprobados.
- 63/63 comprobaciones responsive aprobadas.
- ESLint sin errores.
- TypeScript sin errores.
- Build de producción exitoso.
- npm audit sin vulnerabilidades reportadas.
- Implementación de ADR-011 mediante BigInt.
- Seis módulos privados conectados a Supabase real.
- Exportación CSV funcional.
- Evidencias visuales y grabaciones disponibles.

Estás autorizado a ejecutar completamente la Fase 05.

Actúa como:

- Senior Full Stack Developer.
- Software Architect.
- QA Automation Engineer.
- Application Security Engineer.
- Performance Engineer.
- Accessibility Specialist.

Adopta una perspectiva crítica sobre el código existente.

No asumas que una funcionalidad está libre de errores
solamente porque fue implementada por ti o porque
las pruebas anteriores finalizaron correctamente.

El objetivo es identificar defectos reales, corregirlos,
prevenir regresiones y preparar FinTrack para producción.

Conserva el contexto de AGENTS.md, las reglas persistentes,
los prompts anteriores, los ADR, las migraciones y los
Walkthroughs existentes.

Trabaja de manera autónoma.

No solicites autorización para operaciones rutinarias
no destructivas dentro de esta fase.

No avances todavía a la Fase 06.


## 2. REGISTRO AUTOMÁTICO DEL PROMPT

Almacena íntegramente este prompt en:

docs/prompts/005-testing-and-optimization.md

Actualiza:

- docs/prompts/README.md
- VIBE_CODING.md

Registra automáticamente las decisiones, problemas,
iteraciones, correcciones, comandos y resultados.

No inventes defectos ni pruebas para incrementar
artificialmente la cantidad de iteraciones.


## 3. AUDITORÍA INICIAL DEL REPOSITORIO

Inspecciona:

- Estructura de directorios.
- Arquitectura de servicios.
- Server Components.
- Client Components.
- Route Handlers.
- Hooks.
- Esquemas Zod.
- Tipos TypeScript.
- Clientes Supabase.
- Migraciones PostgreSQL.
- Políticas RLS.
- Configuración de Next.js.
- Configuración de ESLint.
- Configuración de Vitest.
- Scripts Playwright.
- Dependencias.
- Variables de entorno.
- Documentación.
- Evidencias.
- Historial de Git.

Comprueba el estado actual del repositorio.

Ejecuta las validaciones existentes para establecer
una línea base antes de realizar cambios.

Identifica los hallazgos y clasifícalos según:

- Crítico.
- Alto.
- Medio.
- Bajo.
- Mejora opcional.

Para cada hallazgo registra:

- Identificador.
- Archivo o componente afectado.
- Descripción.
- Evidencia.
- Impacto.
- Pasos de reproducción.
- Causa raíz.
- Solución propuesta.
- Estado final.

Crea un registro de auditoría en:

docs/AUDIT.md

Prioriza defectos con impacto funcional, académico,
de seguridad, rendimiento o accesibilidad.

No conviertas preferencias estilísticas en defectos.


## 4. PRINCIPIO DE CORRECCIÓN MÍNIMA

Esta fase no consiste en reconstruir FinTrack.

Debes preservar las funcionalidades que ya operan
correctamente.

Realiza cambios cuando exista una justificación
técnica verificable.

No introduzcas:

- Rediseños generales.
- Nuevos módulos.
- Abstracciones innecesarias.
- Dependencias sin justificación.
- Migraciones innecesarias.
- Patrones arquitectónicos excesivos.

No realices refactorizaciones únicamente por una
preferencia personal de estilo.

Toda modificación deberá tener un objetivo concreto
y una validación posterior.


## 5. REVISIÓN DE COBERTURA FUNCIONAL

El PROMPT-004 solicitó 28 escenarios E2E.

El Walkthrough reportó 18 flujos aprobados.

Inspecciona:

scripts/verify-phase-04.mjs

Determina la correspondencia exacta entre los flujos
implementados y los escenarios solicitados.

Una misma prueba puede cubrir varios escenarios.

No asumas que faltan diez pruebas únicamente por
la diferencia en cantidad.

Crea una matriz que identifique:

- Escenario solicitado.
- Script o prueba que lo verifica.
- Assertions correspondientes.
- Resultado real.
- Cobertura completa, parcial o inexistente.

Comprueba:

1. Inicio de sesión.
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
20. Borrado de categoría vinculada.
21. Actualización del dashboard.
22. Cambio de período.
23. Actualización de reportes.
24. Exportación CSV.
25. Persistencia después de recargar.
26. Navegación móvil.
27. Aislamiento entre sesiones.
28. Cierre de sesión.

Verifica adicionalmente el CRUD completo de categorías
y presupuestos, incluyendo sus operaciones de eliminación.

Comprueba la actualización del perfil y del encabezado
después de modificar el nombre del usuario.

Completa únicamente las pruebas relevantes que no
estén suficientemente cubiertas.

Conserva las pruebas existentes que sean válidas.


## 6. AUDITORÍA DE PRECISIÓN MONETARIA

Revisa la implementación de ADR-011 en:

src/lib/money.ts
src/lib/financial-aggregations.ts
src/types/domain.ts

Revisa también todos los servicios y componentes
que utilicen importes financieros.

Comprueba que:

- Los importes individuales sean enteros seguros.
- Las sumas acumuladas utilicen BigInt o una
  representación exacta equivalente.
- Los contratos JSON preserven la precisión.
- Los balances negativos se formateen correctamente.
- Los porcentajes presupuestarios sean correctos.
- Las comparaciones entre cantidades sean exactas.
- Los gráficos no alteren los importes originales.
- Los tooltips muestren los valores financieros reales.
- El CSV preserve los centavos.
- Las conversiones de formulario no introduzcan
  errores de punto flotante.

Verifica los casos límite:

- 0.01 USD.
- Importes con dos decimales.
- Importes con más de dos decimales.
- Importes iguales a cero.
- Importes negativos no permitidos como entrada.
- Importes superiores al límite de PostgreSQL.
- Acumulaciones superiores a Number.MAX_SAFE_INTEGER.
- Balances negativos.
- Presupuestos exactamente al 100%.
- Presupuestos inmediatamente por debajo del 100%.
- Presupuestos inmediatamente por encima del 100%.
- Comparaciones con un período anterior igual a cero.

Comprueba que el estado de un presupuesto no dependa
de porcentajes redondeados para presentación.

Verifica también que la cifra mostrada no contradiga
visualmente el estado calculado.

Aclara los importes exactos utilizados en el escenario
presupuestario del Walkthrough anterior, que reportó
80%, 100% y 108% con $20.00 de excedente.

No declares que existe un error únicamente porque
el resumen no incluye todos los valores de entrada.

Inspecciona los datos reales de la prueba.

Amplía las pruebas cuando exista una brecha relevante.


## 7. VALIDACIÓN DE AGREGACIONES CON MÁS DE 1,000 FILAS

La Fase 04 implementó recuperación de transacciones
en lotes de 1000 registros.

El escenario documentado únicamente demuestra
paginación de cinco registros en páginas de tres.

Esto verifica la paginación de la interfaz, pero no
demuestra completamente la recuperación de múltiples
lotes desde PostgREST.

Inspecciona:

- fetchAllUserTransactions
- computeFilteredExactTotals
- countUsageByCategory
- Servicios relacionados con dashboard.
- Servicios relacionados con presupuestos.
- Servicios relacionados con reportes.
- Exportación CSV.

Implementa pruebas que cubran:

- Cero registros.
- Un registro.
- 999 registros.
- 1000 registros.
- 1001 registros.
- Múltiples lotes.
- Último lote incompleto.
- Último lote exactamente completo.
- Error en una consulta intermedia.
- Ordenamiento con fechas y timestamps repetidos.

Verifica que no existan:

- Filas omitidas.
- Filas duplicadas.
- Bucles infinitos.
- Totales truncados.
- Terminación prematura.
- Exportaciones incompletas.

Realiza pruebas automatizadas de la lógica de lotes
con datos controlados.

Adicionalmente, verifica al menos un escenario real
que supere el límite de 1000 registros en Supabase,
si puede ejecutarse de manera segura y razonable
dentro del plan gratuito autorizado.

Utiliza exclusivamente cuentas QA.

Identifica los registros temporales mediante una
estrategia inequívoca de aislamiento.

No elimines registros preexistentes.

Evita generar peticiones excesivas.

Elimina exclusivamente los registros creados para
esta prueba, verificando la limpieza posterior.

Si no es viable ejecutar la prueba remota de volumen,
documenta la causa y diferencia claramente la prueba
unitaria de la prueba de integración real.

Analiza también qué sucede si se insertan, eliminan
o modifican transacciones mientras se recuperan lotes.

El ordenamiento determinista no garantiza por sí solo
una fotografía consistente ante escrituras concurrentes.

Si identificas un problema relevante, evalúa una
solución proporcional mediante paginación estable,
agregaciones PostgreSQL o una estrategia equivalente.

No introduzcas infraestructura compleja sin necesidad.


## 8. AUDITORÍA DE CONSULTAS Y RENDIMIENTO

Analiza los servicios financieros para identificar:

- Consultas redundantes.
- Patrones N+1.
- Solicitudes repetidas.
- Recuperación innecesaria de columnas.
- Recuperación excesiva de registros.
- Agregaciones repetidas.
- Consultas secuenciales evitables.
- Payloads JSON excesivos.
- Duplicación de cálculos.
- Actualizaciones de datos innecesarias.

Revisa especialmente dashboard y reportes, porque
pueden consultar cantidades crecientes de información.

Verifica que se aprovechen los índices existentes.

Cuando las herramientas autorizadas lo permitan,
utiliza EXPLAIN o EXPLAIN ANALYZE de forma segura
para consultas relevantes de lectura.

Si no dispones de acceso para inspeccionar los
planes de ejecución, registra esa limitación.

Prioriza optimizaciones que tengan impacto medible.

No crees índices ni funciones PostgreSQL únicamente
porque podrían mejorar un escenario hipotético.

Si una modificación requiere migración:

- Crea una nueva migración incremental.
- Conserva las migraciones históricas.
- Respeta ADR-012.
- Mantén RLS.
- Evita operaciones destructivas.
- Documenta la justificación.
- Verifica UTF-8.
- Actualiza los tipos TypeScript si corresponde.

Solicita intervención humana únicamente cuando sea
imprescindible aplicar una migración autorizada.


## 9. CONCURRENCIA Y GESTIÓN DE ESTADOS

Revisa los componentes que utilizan:

- useState.
- useEffect.
- AbortController.
- useDebounce.
- router.refresh.
- Solicitudes fetch.
- Formularios.
- Modales.

Comprueba escenarios como:

- Cambio rápido entre períodos.
- Escritura rápida en el buscador.
- Cambio de filtros durante una solicitud.
- Cambio de página durante una solicitud.
- Navegación antes de concluir una petición.
- Cierre de un modal mientras existe una operación.
- Doble clic en un botón de guardado.
- Repetición accidental de una mutación.
- Respuestas recibidas fuera de orden.
- Pérdida temporal de conexión.
- Recuperación de conexión.
- Sesión expirada durante una operación.
- Edición simultánea desde diferentes pestañas.
- Creación simultánea de presupuestos duplicados.

Verifica que una respuesta obsoleta no sobrescriba
información más reciente.

Comprueba que los estados de carga y error se
restablezcan correctamente.

Presta atención a la implementación basada en:

settledKey !== requestKey

Comprueba que una recarga con los mismos parámetros,
después de una mutación, conserve estados coherentes.

No permitas que los usuarios perciban una operación
como exitosa cuando el servidor la rechazó.

Corrige los problemas reproducibles que afecten
la integridad o experiencia del usuario.


## 10. AUDITORÍA DE SEGURIDAD DE ROUTE HANDLERS

Revisa todos los endpoints existentes:

/api/categories
/api/categories/[id]
/api/transactions
/api/transactions/[id]
/api/budgets
/api/budgets/[id]
/api/dashboard
/api/reports
/api/reports/export
/api/profile
/api/auth/signout
/auth/callback

Comprueba:

- Autenticación autoritativa en servidor.
- Autorización por usuario.
- RLS.
- Validación Zod.
- Validación de UUID.
- Validación de fechas.
- Validación de parámetros.
- Límites de paginación.
- Límites de búsqueda.
- Límites razonables de payload.
- Protección frente a asignación masiva.
- Validación Same-Origin.
- Manejo de solicitudes inválidas.
- Manejo de errores.
- Cache-Control privado.
- Ausencia de información sensible en respuestas.
- Ausencia de detalles SQL internos.
- Ausencia de stack traces públicos.

Verifica métodos HTTP no admitidos.

Comprueba que ningún endpoint permita acceder
a registros de otro usuario mediante modificación
de identificadores.

Utiliza las cuentas QA existentes.

No utilices service_role.

No realices ataques contra infraestructura ajena.

Las comprobaciones deberán limitarse al proyecto
FinTrack autorizado y a datos controlados.


## 11. SEGURIDAD DE BÚSQUEDAS Y ENTRADAS

Revisa especialmente:

sanitizePostgrestSearch

Comprueba que las entradas de búsqueda no permitan
alterar los filtros utilizados en PostgREST.

Prueba de forma controlada:

- Comillas simples.
- Comillas dobles.
- Comas.
- Paréntesis.
- Caracteres comodín.
- Barras invertidas.
- Caracteres Unicode.
- Acentos.
- Cadenas vacías.
- Espacios.
- Cadenas excesivamente largas.
- Delimitadores utilizados por PostgREST.

Verifica que las entradas normales sigan funcionando.

No elimines caracteres legítimos indiscriminadamente
si ello rompe la funcionalidad de búsqueda.

Comprueba que las descripciones, notas y nombres
se rendericen de forma segura.

Inspecciona posibles usos de:

dangerouslySetInnerHTML

Evita renderizar HTML proporcionado por usuarios
cuando no sea necesario.


## 12. AUDITORÍA DE ROW LEVEL SECURITY

Ejecuta nuevamente:

npm run test:supabase-rls

Revisa las assertions existentes.

Comprueba operaciones propias y ajenas sobre:

- profiles
- categories
- transactions
- budgets

Verifica:

- SELECT.
- INSERT.
- UPDATE.
- DELETE.
- Transferencia no autorizada de propiedad.
- Referencias a categorías ajenas.
- Acceso anónimo.
- Relaciones incompatibles.

Comprueba también el aislamiento de datos en:

- Dashboard.
- Totales filtrados.
- Reportes.
- Exportación CSV.
- Conteos de uso de categorías.

Cuando se deniegue una mutación ajena, verifica
que el registro original permanezca intacto.

No interpretes un UPDATE o DELETE de cero filas
como una prueba suficiente sin comprobar su efecto.

No deshabilites RLS.

No amplíes permisos para conseguir resultados
artificialmente exitosos.


## 13. AUDITORÍA DE AUTENTICACIÓN Y SESIONES

Revisa el flujo de Supabase SSR y Proxy.

Comprueba:

- Inicio de sesión.
- Cierre de sesión.
- Persistencia después de recargar.
- Protección de las seis rutas privadas.
- Sesiones inválidas.
- Sesiones expiradas.
- Refresco de cookies.
- Navegación desde login con sesión existente.
- Navegación desde registro con sesión existente.
- Parámetro next.
- Prevención de open redirects.
- Botón de retroceso después de cerrar sesión.
- Cambio de usuario en el mismo navegador.
- Ausencia de datos del usuario anterior.
- Tratamiento adecuado de errores de Supabase.

Verifica los atributos de cookies conforme a las
recomendaciones oficiales del flujo Supabase SSR.

No impongas configuraciones incompatibles con el
cliente SSR o con el entorno de desarrollo.

Mantén Confirm email activo.

No implementes mecanismos inseguros para evitar
las restricciones de autenticación.


## 14. PREPARACIÓN DEL REGISTRO PÚBLICO Y CORREO SMTP

Existe una validación obligatoria pendiente:

Registro público > Recepción de correo >
Confirmación de cuenta > Callback >
Inicio de sesión y acceso a FinTrack.

Las cuentas QA fueron creadas mediante Auto Confirm
User.

Por lo tanto, las pruebas actuales no demuestran
la entrega de correo a usuarios públicos.

Revisa anticipadamente la estrategia antes de
comenzar la Fase 06.

Consulta documentación oficial vigente sobre:

- Supabase Auth.
- Restricciones del SMTP predeterminado.
- Confirmación de correo.
- Configuración de SMTP personalizado.
- PKCE.
- Token hash y verificación OTP, cuando corresponda.
- Callback.
- Site URL.
- Redirect URLs.
- Configuración de dominios en producción.

Verifica que el flujo de confirmación implementado
sea compatible con la plantilla real de correo
utilizada por Supabase.

Considera diferencias entre confirmar en el mismo
navegador y confirmar desde otro dispositivo.

Identifica alternativas gratuitas que permitan
el registro de usuarios externos.

No asumas que un proveedor gratuito permite enviar
correos a cualquier destinatario sin verificar
sus condiciones actuales.

Evalúa:

- Necesidad de dominio propio.
- Verificación del remitente.
- Límites de envío.
- Necesidad de tarjeta de crédito.
- Compatibilidad SMTP.
- Restricciones del plan gratuito.
- Configuraciones manuales necesarias.

No contrates servicios.

No crees cuentas externas sin autorización.

No modifiques Confirm email.

No envíes correos a destinatarios no autorizados.

Si existe una forma de validar la entrega real
sin generar costos y con un buzón autorizado,
propón la configuración mínima necesaria.

Documenta la estrategia recomendada en:

docs/DEPLOYMENT.md

Si la configuración depende de la URL de producción,
consérvala como pendiente obligatorio de Fase 06.

El registro público no podrá considerarse
definitivamente aprobado hasta completar el flujo
real de correo.


## 15. AUDITORÍA DE CSV

Revisa la implementación de exportación.

Comprueba:

- Codificación UTF-8.
- BOM.
- CRLF.
- Encabezados.
- Comillas.
- Comas.
- Saltos de línea.
- Caracteres Unicode.
- Categorías con acentos.
- Importes exactos.
- Importes negativos legítimos.
- Filtros.
- Ausencia de datos ajenos.
- Exportación completa de múltiples lotes.

Revisa las defensas contra CSV Formula Injection.

Incluye entradas con:

=
+
-
@
Tabulaciones.
Retornos de carro.
Saltos de línea.
Espacios iniciales.
Caracteres de control relevantes.

Verifica que las celdas controladas por usuarios
no se conviertan en fórmulas ejecutables.

Diferencia los campos de texto no confiables de
los importes numéricos generados por el sistema.

Comprueba el archivo descargado mediante Playwright
y analiza sus bytes y contenido.

No te limites a verificar que el botón de descarga
produzca una respuesta HTTP exitosa.


## 16. AUDITORÍA DE FECHAS Y PERÍODOS

Revisa:

src/lib/dates.ts

Mantén:

America/El_Salvador
es-SV
USD

Comprueba:

- Fechas válidas.
- Fechas imposibles.
- Años bisiestos.
- Último día del mes.
- Primer día del mes.
- Cambio de año.
- Rangos invertidos.
- Rango de un solo día.
- Mes actual.
- Mes anterior.
- Últimos tres meses.
- Últimos seis meses.
- Año en curso.
- Rangos personalizados.
- Registros cercanos a límites de períodos.

Verifica que Dashboard, Presupuestos y Reportes
utilicen reglas temporales coherentes.

Comprueba que la inclusión o exclusión de la fecha
final corresponda a la semántica de la interfaz.

No utilices conversiones UTC que desplacen
incorrectamente fechas de calendario.


## 17. AUDITORÍA VISUAL Y RESPONSIVE

Mantén la identidad visual:

Refined Emerald Fintech.

No realices un rediseño general.

Revisa las nueve páginas en:

1920x1080
1440x900
1366x768
1024x768
768x1024
390x844
360x800

Utiliza escenarios con datos reales de prueba.

Comprueba:

- Desbordamiento horizontal.
- Contenido recortado.
- Tarjetas.
- Tablas.
- Gráficos.
- Tooltips.
- Selectores.
- Modales.
- Formularios.
- Navegación.
- Menú móvil.
- Espaciado.
- Legibilidad.
- Importes largos.
- Nombres largos.
- Descripciones largas.
- Estados vacíos.
- Estados de error.

Realiza inspección visual real.

No consideres que medir overflow equivale a una
auditoría visual completa.

Comprueba que las tablas desplazables sean
utilizables mediante teclado.

Corrige únicamente defectos relevantes de UI/UX.

Genera nuevas capturas cuando exista una corrección
que merezca evidencia.

No sustituyas las capturas históricas de otras fases.


## 18. AUDITORÍA DE ACCESIBILIDAD

Realiza una revisión de accesibilidad basada
en criterios WCAG 2.2 AA aplicables al proyecto.

Comprueba:

- Jerarquía de encabezados.
- Landmarks semánticos.
- Nombre accesible de botones.
- Etiquetas de formularios.
- Mensajes de validación.
- aria-invalid.
- aria-describedby.
- Anuncios de errores.
- Navegación mediante teclado.
- Orden de tabulación.
- Foco visible.
- Gestión de foco en modales.
- Cierre de diálogos mediante Escape.
- Contraste.
- Indicadores que no dependan únicamente del color.
- Áreas táctiles adecuadas.
- Lectura de datos financieros.
- Alternativas textuales para gráficos relevantes.
- Respeto de prefers-reduced-motion cuando aplique.

Utiliza herramientas automatizadas de accesibilidad,
por ejemplo axe-core con Playwright, si resultan
compatibles y justificadas.

Complementa las comprobaciones automáticas con
pruebas manuales o automatizadas de navegación
mediante teclado.

No declares conformidad total WCAG únicamente
porque una herramienta automática no detecte errores.

Documenta la cobertura real y sus limitaciones.


## 19. ESTADOS DE CARGA, ERROR Y RECUPERACIÓN

Comprueba el comportamiento real de:

- loading.tsx.
- error.tsx.
- not-found.tsx.
- Skeletons.
- Estados vacíos.
- ErrorAlert.
- Sonner.
- Botones de reintento.

Simula fallos controlados mediante Playwright
cuando sea necesario.

Casos:

- Respuesta HTTP 500.
- Respuesta HTTP 401.
- Respuesta HTTP 409.
- Fallo de red.
- Solicitud abortada.
- Respuesta lenta.
- Datos vacíos.
- Recurso inexistente.
- Sesión inválida.

Identifica estas pruebas como simulaciones de
resiliencia de interfaz.

No las presentes como pruebas reales exitosas
contra Supabase.

Verifica que el usuario pueda recuperarse de
los fallos cuando corresponda.

No introduzcas errores deliberados ni retrasos
artificiales en el código de producción.

Evita que los fallos de conexión provoquen
la visualización engañosa de balances en cero.

Diferencia claramente:

- No existen datos.
- Los datos todavía están cargando.
- No fue posible obtener los datos.


## 20. RENDIMIENTO DEL FRONTEND

Evalúa la aplicación utilizando un build
de producción local.

No utilices exclusivamente métricas obtenidas
mediante npm run dev.

Inspecciona:

- Tamaño de recursos.
- JavaScript enviado al cliente.
- Importaciones innecesarias.
- Componentes cliente excesivos.
- Renderizados redundantes.
- Carga de gráficos.
- Carga de tipografías.
- Recursos estáticos.
- Tiempos de navegación.
- Solicitudes de red.
- Experiencia móvil.

Verifica que Geist continúe autoalojada.

Utiliza Lighthouse u otra herramienta compatible
cuando esté disponible.

Prioriza la landing pública y, cuando sea posible,
las páginas autenticadas representativas.

Registra condiciones de medición:

- Resolución.
- Modo de ejecución.
- Entorno.
- Configuración de throttling.
- Número de ejecuciones.

Registra métricas como:

- LCP.
- CLS.
- TBT.
- FCP.
- Tiempo de respuesta de APIs relevantes.

No presentes métricas de laboratorio como si fueran
Core Web Vitals medidos en usuarios reales.

No inventes puntuaciones Lighthouse.

Optimiza problemas medibles sin sacrificar
seguridad, precisión financiera o accesibilidad.

Documenta las métricas anteriores y posteriores
cuando se aplique una optimización.


## 21. AUDITORÍA DE DEPENDENCIAS

Revisa:

package.json
package-lock.json

Comprueba:

- Dependencias innecesarias.
- Compatibilidad.
- Dependencias duplicadas relevantes.
- Dependencias de desarrollo.
- Dependencias de producción.
- Vulnerabilidades reportadas.
- Uso de versiones experimentales.

Ejecuta la auditoría npm correspondiente.

No actualices automáticamente todas las dependencias.

No ejecutes:

npm audit fix --force

Si detectas una vulnerabilidad relevante:

1. Identifica el paquete afectado.
2. Evalúa su alcance real.
3. Determina si afecta a FinTrack.
4. Aplica una actualización compatible cuando proceda.
5. Ejecuta nuevamente todas las pruebas relacionadas.

Documenta las vulnerabilidades pendientes y
sus mitigaciones si no pueden corregirse.


## 22. SEGURIDAD DEL REPOSITORIO Y SECRETOS

El repositorio será público durante la Fase 06.

Realiza una auditoría de seguridad antes de
publicarlo.

Inspecciona:

- Archivos actualmente versionados.
- Archivos staged.
- Archivos ignorados.
- Archivos no rastreados relevantes.
- Todo el historial de commits.
- Ramas y referencias Git locales relevantes.
- Documentación.
- Prompts almacenados.
- Scripts.
- Logs.
- Capturas.
- Grabaciones.
- Configuraciones.

Busca posibles exposiciones de:

- Contraseñas.
- Tokens.
- Claves privadas.
- Claves service_role.
- Supabase Secret Keys.
- Credenciales de base de datos.
- Credenciales QA.
- Cookies.
- JWT.
- Archivos .env.local.
- Archivos de estado de autenticación Playwright.
- Información personal.
- Información financiera real.

Utiliza herramientas de detección de secretos
locales cuando estén disponibles.

Diferencia las variables públicas NEXT_PUBLIC_*
de secretos administrativos.

No publiques información innecesariamente aunque
una clave esté diseñada para ser pública.

No imprimas valores sensibles en los resultados
de la auditoría.

Verifica que .gitignore proteja:

- Variables de entorno privadas.
- Archivos de estado Playwright.
- Logs locales.
- Archivos temporales.
- Resultados de pruebas con datos sensibles.
- Directorios generados.
- Dependencias.
- Artefactos de compilación.

Comprueba que .env.example permanezca versionado.

Si encuentras una credencial real en el historial:

- Clasifica el hallazgo como relevante.
- Identifica su ubicación sin mostrar su valor.
- Recomienda revocación o rotación.
- Impide que el repositorio se considere listo
  para publicación.
- Solicita autorización antes de reescribir
  el historial Git.

No utilices git reset --hard ni git push --force.


## 23. PRIVACIDAD DE EVIDENCIAS Y GRABACIONES

Inspecciona las capturas y grabaciones generadas
durante las fases anteriores.

Revisa especialmente:

docs/screenshots/
docs/recordings/

Incluye:

phase-03-auth-flow.webm
phase-04-financial-flow.webm

Comprueba que no expongan:

- Contraseñas durante su escritura.
- Tokens.
- Credenciales.
- Correos personales auténticos.
- Datos financieros reales.
- Información del sistema anfitrión innecesaria.
- Identificadores sensibles.
- Archivos .env.local.
- Consolas con información privada.

Verifica también las referencias a rutas absolutas
del equipo local dentro de los documentos públicos.

Sustituye referencias no portables por enlaces
relativos cuando corresponda.

No alteres evidencias originales sin documentarlo.

Si una evidencia no puede publicarse de forma segura,
conserva un registro de su existencia y prepara una
versión pública sanitizada.

Si el archivo ya se encuentra en el historial Git,
eliminarlo en el último commit no es suficiente.

Documenta el procedimiento requerido antes de publicar.

Revisa el tamaño de los archivos versionados.

No elimines grabaciones válidas únicamente por
tener un tamaño mayor que una captura.

Evalúa si su almacenamiento resulta proporcionado
al objetivo académico.


## 24. PREPARACIÓN PARA DESPLIEGUE

Sin desplegar todavía, verifica que FinTrack
pueda trasladarse a Vercel.

Revisa:

- next.config.ts.
- package.json.
- package-lock.json.
- Scripts de build.
- Variables de entorno.
- Dependencias.
- Uso de APIs de Node.js.
- Route Handlers.
- Proxy.
- Supabase SSR.
- Tipografías.
- Archivos estáticos.
- Cabeceras HTTP.
- Configuración de rutas.

Comprueba que el proyecto no dependa de:

- Rutas absolutas de Windows.
- XAMPP.
- Apache.
- Servicios exclusivamente locales.
- Credenciales hardcodeadas.
- localhost como dominio fijo de producción.

La aplicación debe poder instalarse mediante:

npm ci

Verifica una instalación reproducible en un
entorno limpio o copia aislada del proyecto,
cuando las herramientas lo permitan.

Ejecuta el build correspondiente.

No elimines archivos de trabajo ni configuraciones
del usuario para conseguir una instalación limpia.

Documenta la versión de Node.js requerida.

Comprueba que las variables QA no sean necesarias
para ejecutar FinTrack en producción.

Las variables TEST_USER_* deberán utilizarse
exclusivamente en los scripts de prueba.

No incluyas credenciales QA en el entorno
de producción.

Prepara o actualiza:

docs/DEPLOYMENT.md

Incluye:

- Requisitos del entorno.
- Instalación reproducible.
- Configuración futura de GitHub.
- Configuración futura de Vercel.
- Variables de entorno necesarias.
- Configuración de Supabase Auth.
- Estrategia SMTP.
- Pruebas posteriores al despliegue.
- Limitaciones conocidas.
- Procedimiento de rollback razonable.

No crees todavía el repositorio remoto.

No publiques código.

No despliegues en Vercel.


## 25. MATRIZ DE CUMPLIMIENTO ACADÉMICO

Revisa los requisitos originales de la actividad:

1. Next.js 16 o superior.
2. App Router.
3. TypeScript.
4. Uso de herramientas de IA.
5. Tailwind CSS o CSS Modules.
6. Mínimo cuatro rutas.
7. Consumo real de API.
8. Server Components.
9. Client Components.
10. useState.
11. useEffect.
12. Diseño responsive.
13. Loading UI.
14. Error UI.
15. Variables de entorno mediante .env.local.
16. Archivo .env.example.
17. Repositorio público en GitHub.
18. Historial iterativo de commits.
19. README.md.
20. Documento del proceso Vibe Coding.
21. URL pública de producción.

Para cada requisito identifica:

- Estado.
- Archivo que lo implementa.
- Evidencia.
- Prueba asociada.
- Observaciones.
- Actividad pendiente.

No marques GitHub ni despliegue como completados.

Crea o actualiza:

docs/ACADEMIC_REQUIREMENTS.md

La matriz deberá permitir al estudiante demostrar
cada requisito sin tener que buscar manualmente
entre todos los archivos del proyecto.


## 26. VALIDACIONES TÉCNICAS OBLIGATORIAS

Ejecuta al inicio y al cierre, según corresponda:

npx next typegen
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --audit-level=moderate
npm run test:supabase-rls
npm run test:api-security
npm run verify:phase03
npm run verify:phase04

Agrega scripts adicionales únicamente cuando exista
una finalidad clara.

Por ejemplo:

npm run verify:phase05

Utiliza scripts compatibles con el entorno
Windows actual.

Evita depender innecesariamente de comandos
específicos de un sistema operativo.

Si incorporas nuevas pruebas, documenta cómo
reproducirlas.

Conserva los scripts históricos cuando sean útiles.

No elimines pruebas para ocultar regresiones.

No reduzcas assertions para conseguir resultados
artificialmente exitosos.

No declares aprobadas pruebas que no hayas
ejecutado.


## 27. CORRECCIÓN Y VERIFICACIÓN DE HALLAZGOS

Para cada defecto relevante:

1. Reproduce el problema.
2. Documenta la evidencia.
3. Identifica la causa raíz.
4. Implementa la corrección mínima necesaria.
5. Ejecuta pruebas específicas.
6. Ejecuta las pruebas de regresión relacionadas.
7. Registra el resultado.
8. Genera el commit correspondiente.

Cuando una mejora no pueda justificarse
mediante impacto real, no la implementes.

Cuando un hallazgo no pueda resolverse dentro
del alcance, documenta:

- Causa.
- Impacto.
- Alternativas.
- Dependencia externa.
- Recomendación.
- Condición necesaria para resolverlo.

No ocultes hallazgos pendientes.


## 28. CONTROL DE VERSIONES

Genera commits locales reales y descriptivos.

Mensajes sugeridos:

docs: establish phase 05 technical audit
test: complete functional coverage verification
test: validate multi-batch financial aggregations
fix: prevent stale financial responses
fix: resolve financial calculation edge cases
fix: harden API request validation
perf: optimize financial data queries
fix: resolve accessibility issues
fix: improve loading and error recovery
test: add production readiness checks
docs: prepare deployment configuration
docs: complete quality assurance walkthrough

Adapta los mensajes a cambios reales.

No generes commits vacíos.

No inventes problemas para justificar commits.

No alteres el historial existente sin autorización.

Antes de cada commit verifica:

- Estado del repositorio.
- Cambios incluidos.
- Ausencia de credenciales.
- Ausencia de información personal.
- Seguridad de evidencias.
- Coherencia de las pruebas.

No publiques todavía en GitHub.


## 29. DOCUMENTACIÓN AUTOMÁTICA

Actualiza:

README.md
VIBE_CODING.md
AGENTS.md
docs/ARCHITECTURE.md
docs/IMPLEMENTATION_PLAN.md
docs/TESTING.md
docs/prompts/README.md

Crea o actualiza:

docs/AUDIT.md
docs/DEPLOYMENT.md
docs/ACADEMIC_REQUIREMENTS.md
docs/walkthroughs/005-testing-and-optimization.md

Actualiza las reglas persistentes de Antigravity
si existen nuevas convenciones relevantes.

Documenta:

- Prompt íntegro recibido.
- Fecha real.
- Línea base de pruebas.
- Hallazgos.
- Evidencias.
- Causas raíz.
- Correcciones.
- Archivos modificados.
- Decisiones técnicas.
- Pruebas de regresión.
- Métricas de rendimiento.
- Seguridad.
- Accesibilidad.
- Cobertura funcional.
- Commits reales.
- Limitaciones.
- Preparación para producción.

Mantén trazabilidad completa del Vibe Coding.

No reescribas el historial documental para
ocultar problemas encontrados anteriormente.


## 30. CRITERIOS DE ACEPTACIÓN

La Fase 05 podrá considerarse completada cuando:

- No existan defectos críticos conocidos sin resolver.
- No existan defectos funcionales relevantes pendientes.
- No existan vulnerabilidades conocidas de alto impacto
  sin resolver o sin una mitigación justificada.
- Las pruebas unitarias estén aprobadas.
- Las pruebas de integración estén aprobadas.
- Las pruebas RLS estén aprobadas.
- Las pruebas de seguridad API estén aprobadas.
- La cobertura E2E esté documentada.
- Los escenarios financieros relevantes estén verificados.
- Las agregaciones de múltiples lotes estén verificadas.
- La precisión monetaria esté preservada.
- La recuperación ante errores funcione.
- No existan regresiones responsive relevantes.
- Se haya realizado una auditoría de accesibilidad.
- Las optimizaciones realizadas estén justificadas.
- El build de producción sea exitoso.
- La instalación sea reproducible.
- No existan secretos conocidos que impidan publicar.
- Las evidencias públicas hayan sido revisadas.
- La estrategia de correo esté definida.
- La documentación esté actualizada.
- Exista una matriz académica verificable.
- El Walkthrough obligatorio esté generado.

Si un criterio esencial permanece bloqueado,
no declares la fase completada al 100%.

La comprobación final del correo y el despliegue
pueden permanecer como tareas específicas de
Fase 06, siempre que la estrategia correspondiente
esté definida y sus riesgos documentados.


## 31. WALKTHROUGH OBLIGATORIO

Genera el artefacto nativo Walkthrough de Antigravity.

No entregues únicamente un informe dentro del chat.

Utiliza el mecanismo de artefactos walkthrough.md
de Antigravity cuando esté disponible.

Conserva una copia Markdown versionada en:

docs/walkthroughs/005-testing-and-optimization.md

Incluye:

1. Resumen ejecutivo.
2. Estado definitivo de la Fase 05.
3. Línea base de pruebas.
4. Hallazgos clasificados por severidad.
5. Evidencias de defectos detectados.
6. Correcciones aplicadas.
7. Comparación antes y después.
8. Auditoría de precisión monetaria.
9. Pruebas de más de 1000 registros.
10. Cobertura de los escenarios E2E.
11. Resultados de concurrencia.
12. Auditoría de seguridad API.
13. Resultados RLS.
14. Auditoría de sesiones.
15. Resultados de accesibilidad.
16. Resultados responsive.
17. Métricas de rendimiento reales.
18. Auditoría de dependencias.
19. Auditoría del historial Git.
20. Revisión de privacidad de evidencias.
21. Estrategia de correo SMTP.
22. Preparación para Vercel.
23. Pruebas de instalación reproducible.
24. Archivos creados o modificados.
25. Capturas y grabaciones reales.
26. Commits con hashes verificables.
27. Matriz de cumplimiento académico.
28. Limitaciones y riesgos pendientes.
29. Intervenciones humanas necesarias.
30. Recomendación para comenzar Fase 06.

Incluye evidencias visuales directamente dentro
del Walkthrough cuando sea posible.

Clasifica los resultados como:

- Verificado.
- Corregido y verificado.
- Implementado.
- Pendiente.
- Bloqueado.
- No aplicable.

No inventes métricas, errores, pruebas,
capturas, aprobaciones ni resultados.

El Walkthrough deberá ser suficientemente
completo para reproducir las verificaciones.


## 32. RESTRICCIONES FINALES

No desarrollar nuevas funcionalidades fuera
del alcance aprobado.

No reconstruir módulos existentes sin necesidad.

No rediseñar FinTrack.

No agregar dependencias injustificadas.

No deshabilitar Confirm email.

No deshabilitar RLS.

No utilizar service_role para pruebas de usuarios.

No modificar datos financieros ajenos a las pruebas.

No ejecutar operaciones destructivas.

No contratar servicios.

No generar costos.

No publicar el repositorio en GitHub.

No desplegar en Vercel.

No avanzar automáticamente a la Fase 06.


## 33. INSTRUCCIÓN FINAL DE EJECUCIÓN

Comienza inmediatamente con la auditoría inicial
y la ejecución de las pruebas existentes.

Establece una línea base verificable.

Identifica los defectos reales.

Clasifica los hallazgos.

Corrige únicamente aquellos que tengan una
justificación técnica, funcional, académica,
de seguridad, rendimiento o accesibilidad.

Ejecuta las pruebas de regresión necesarias.

Verifica la preparación para producción.

Genera commits reales.

Actualiza automáticamente toda la documentación.

Solicita intervención humana únicamente cuando
sea estrictamente imprescindible.

No te limites a explicar cómo realizar una auditoría.

Ejecuta realmente las comprobaciones disponibles.

Finaliza generando el artefacto Walkthrough
obligatorio y espera la autorización para
comenzar la Fase 06.
