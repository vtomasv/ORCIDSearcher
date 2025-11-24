# ORCID Manager - TODO

## Fase 1: Diseño de Base de Datos y Estructura
- [x] Diseñar esquema de base de datos para investigadores y búsquedas
- [x] Crear tablas: researchers, orcid_searches, institutions, upload_sessions
- [x] Implementar migraciones de base de datos

## Fase 2: Interfaz de Usuario Básica
- [x] Diseñar página principal con navegación
- [x] Crear página de subida de Excel
- [x] Crear componente de visualización de progreso (Dashboard)
- [x] Implementar página de revisión manual

## Fase 3: Funcionalidad de Búsqueda
- [x] Implementar endpoint para subir y procesar Excel
- [x] Crear utilidades de normalización de nombres
- [x] Integrar variantes de instituciones
- [x] Implementar servicio de búsqueda automática de ORCIDs (backend worker)
- [x] Conectar con ORCID.org para búsquedas usando Puppeteer

## Fase 4: Revisión Manual
- [x] Crear interfaz para casos con 0 resultados
- [x] Crear interfaz para casos con múltiples resultados
- [x] Implementar selección manual de ORCID correcto
- [x] Agregar búsqueda manual personalizada

## Fase 5: Exportación
- [x] Implementar generación de Excel con resultados
- [x] Agregar columna ORCID al Excel original
- [x] Incluir URLs de búsqueda para casos pendientes
- [x] Implementar descarga de archivo final

## Fase 6: Mejoras y Pulido
- [x] Agregar indicadores de progreso en tiempo real con WebSockets
- [x] Implementar manejo de errores robusto
- [x] Agregar validaciones de datos
- [x] Optimizar rendimiento de búsquedas con sistema de colas (BullMQ)
- [x] Crear script para cargar datos de instituciones desde JSON
- [ ] Documentar uso de la aplicación actualizado
- [ ] Probar flujo completo end-to-end

## Fase 7: Búsqueda Automática de ORCIDs
- [x] Crear worker/job para búsqueda automática en background
- [x] Implementar scraping de ORCID con Puppeteer
- [x] Procesar investigadores en lotes con BullMQ
- [x] Actualizar progreso en tiempo real con Socket.IO
- [x] Implementar búsqueda con normalización de nombres
- [x] Implementar búsqueda con variantes de instituciones
- [x] Agregar endpoint para iniciar búsqueda automática

## Fase 8: Docker y Despliegue
- [x] Crear Dockerfile para la aplicación
- [x] Crear docker-compose.yml con app y base de datos
- [x] Agregar Redis al docker-compose para BullMQ
- [x] Configurar variables de entorno
- [x] Probar build de la aplicación
- [x] Crear .dockerignore
- [x] Documentar instrucciones de despliegue

## Fase 9: GitHub Release
- [x] Clonar repositorio ORCIDSearcher
- [x] Copiar archivos del proyecto
- [x] Crear commit con cambios
- [x] Crear tag de versión v1.0.0-rc1
- [x] Publicar release candidate en GitHub

## Próximos Pasos
- [ ] Actualizar README con nuevas funcionalidades
- [ ] Actualizar DOCKER_README con instrucciones de Redis
- [ ] Crear tests para búsqueda automática
- [ ] Probar flujo completo con datos reales
- [ ] Publicar versión final v1.0.0

## Fase 10: Release v1.0.0-rc2
- [x] Commit y push de cambios con búsqueda automática
- [x] Crear tag v1.0.0-rc2
- [x] Publicar release en GitHub con notas completas


## Fase 12: Fixes Post-Release
- [x] Fix Dockerfile: Eliminar copia de directorio storage inexistente
- [x] Fix Dockerfile: Agregar copia de directorio patches antes de pnpm install
- [x] Fix: Crear archivo client/src/lib/trpc.ts faltante
- [x] Fix: Crear archivo client/src/lib/utils.ts faltante
- [x] Fix: Agregar función getResearcherById a server/db.ts
- [x] Fix: Hacer importación de vite dinámica para evitar incluirla en producción
- [x] Fix: Eliminar importación de vite.config para evitar bundlear plugins
- [x] Fix: Agregar valores por defecto para OAuth URL para evitar TypeError


## Fase 13: Sistema de Autenticación Simplificado (Sin Login)
- [x] Actualizar esquema de base de datos
- [x] Instalar bcrypt
- [x] Crear usuario por defecto automáticamente al iniciar
- [x] Modificar contexto para usar usuario por defecto siempre
- [x] Actualizar frontend para eliminar botón de login
- [x] Eliminar dependencias de OAuth del frontend
- [x] Commit y push de cambios
- [x] Crear release v1.0.9 en GitHub

## Fase 14: Diagnóstico y Corrección del Problema de Login
- [x] Revisar código actual de Home.tsx
- [x] Verificar que los cambios se aplicaron correctamente
- [x] Revisar otras páginas que puedan tener verificación de autenticación
- [x] Corregir Dashboard.tsx - eliminar verificación de auth
- [x] Corregir Upload.tsx - eliminar verificación de auth
- [x] Corregir Review.tsx - eliminar verificación de auth
- [x] Commit y push de correcciones
- [x] Crear release v1.0.10

## Fase 15: Corrección de Error de Base de Datos
- [x] Revisar server/_core/context.ts
- [x] Revisar server/initDefaultUser.ts
- [x] Identificar problema: falta openId en usuario por defecto
- [x] Agregar openId al usuario por defecto
- [x] Refactorizar código con constantes
- [x] Probar subida de archivo
- [x] Commit y push
- [x] Crear release v1.0.11

## Fase 16: Investigación de Error Persistente de Base de Datos
- [x] Revisar mensaje de error en detalle
- [x] Verificar migraciones de base de datos
- [x] Identificar desincronización entre esquema y migración
- [x] Revertir esquema para que coincida con migración original (openId NOT NULL)
- [x] Actualizar initDefaultUser para usar openId como identificador principal
- [x] Probar creación de usuario y subida de archivo
- [x] Commit y push
- [x] Crear release v1.0.12

## Fase 17: Corrección de Variables de Entorno en Docker
- [x] Identificar variables VITE faltantes (VITE_APP_LOGO, VITE_ANALYTICS_ENDPOINT)
- [x] Agregar ARGs en Dockerfile para variables VITE
- [x] Configurar build args en docker-compose.yml
- [x] Establecer valores por defecto para todas las variables VITE
- [x] Commit y push
- [x] Crear release v1.0.13

## Fase 18: Inicialización Automática del Usuario Por Defecto
- [x] Revisar server/_core/index.ts para ver el inicio del servidor
- [x] Agregar importación de initDefaultUser
- [x] Agregar llamada a initDefaultUser() al inicio de startServer()
- [x] Agregar logs para confirmar inicialización
- [x] Commit y push
- [x] Crear release v1.0.14

## Fase 19: Corrección de DATABASE_URL en Docker Compose
- [x] Revisar docker-compose.yml línea de DATABASE_URL
- [x] Identificar problema: \$ en lugar de $ causaba literal \orcid_user
- [x] Corregir escape de variables (cambiar \$ por $)
- [x] Commit y push
- [x] Crear release v1.0.15

## Fase 20: Ejecución Automática de Migraciones de Base de Datos
- [x] Crear script de migración (scripts/migrate.mjs)
- [x] Copiar scripts al contenedor Docker
- [x] Modificar CMD para ejecutar migraciones antes de iniciar servidor
- [x] Agregar logs para confirmar migraciones
- [x] Commit y push
- [x] Crear release v1.0.16

## Fase 21: Diagnóstico y Corrección del Worker de BullMQ
- [x] Revisar server/queueService.ts - worker configurado correctamente
- [x] Identificar problema: Alpine Linux no tiene dependencias de Chromium
- [x] Agregar instalación de Chromium y dependencias en Dockerfile
- [x] Configurar variables de entorno para Puppeteer
- [x] Commit y push
- [x] Crear release v1.0.17

## Fase 22: Diagnóstico del Worker de BullMQ No Procesando Trabajos
- [x] Agregar logs de inicialización del worker (ready, error events)
- [x] Agregar logs cuando se agregan trabajos a la cola
- [x] Agregar logs para cada job agregado
- [x] Probar con logs mejorados para identificar el problema
- [x] Commit y push
- [x] Crear release v1.0.18

## Fase 23: Botón de Inicio Manual con Control de Workers
- [x] Agregar input numérico para configurar workers en paralelo (1-20)
- [x] Modificar botón existente "Buscar ORCIDs" a "Iniciar Búsqueda"
- [x] Botón ya se muestra solo cuando hay investigadores pendientes
- [x] Botón ya se deshabilita durante procesamiento
- [x] Actualizar backend para recibir parámetro de concurrencia
- [x] Implementar rate limiting por batches
- [x] Agregar logs de concurrencia
- [x] Commit y push
- [x] Crear release v1.0.19

## Fase 24: Corrección de Condición del Botón de Inicio
- [x] Cambiar condición del botón - eliminar requisito de status='completed'
- [x] Botón ahora aparece cuando totalResearchers > procesados
- [x] Commit y push
- [x] Crear release v1.0.20

## Fase 25: Corrección de Creación de Registros de Búsqueda
- [x] Revisar procedimiento processExcel - sí crea orcid_searches
- [x] Identificar problema: falta uploadSessionId en tabla researchers
- [x] Agregar campo uploadSessionId a schema.ts
- [x] Actualizar processExcel para pasar uploadSessionId
- [x] Crear migración SQL para agregar columna
- [x] Commit y push
- [x] Crear release v1.0.21

## Fase 26: Corrección de Ejecución de Migración
- [x] Revisar scripts/migrate.mjs - usa drizzle migrator
- [x] Identificar problema: 0002 no está en _journal.json
- [x] Actualizar _journal.json con entrada para 0002
- [x] Reescribir migrate.mjs para ejecutar SQL manual además de Drizzle
- [x] Agregar manejo de errores para columnas duplicadas
- [x] Agregar logs detallados por statement
- [x] Commit y push
- [x] Crear release v1.0.22

## Fase 27: Corrección de Conflicto de Migración y Dashboard
- [x] Quitar 0002 de _journal.json (Drizzle no debe ejecutarlo)
- [x] Dejar 0002 solo en manualMigrations array
- [x] Diagnosticar por qué dashboard no se actualiza durante búsquedas
- [x] Identificar problema: queueService se importa ANTES de asignar global.io
- [x] Mover importación de queueService después de asignar global.io
- [x] Usar dynamic import para garantizar orden correcto
- [x] Commit y push
- [x] Crear release v1.0.23

## Fase 28: Diagnóstico de Socket.IO en Frontend
- [x] Revisar Dashboard.tsx para ver si usa Socket.IO
- [x] Verificar que se conecta a Socket.IO
- [x] Verificar que escucha evento 'search-progress'
- [x] Verificar que se une al room correcto
- [x] Instalar Redis localmente para desarrollo
- [x] Modificar Dashboard para usar progress de Socket.IO en tiempo real
- [x] Commit y push
- [x] Crear release v1.0.24

## Fase 29: Vista Detallada de No Encontrados con Re-encolado
- [x] Crear endpoint para obtener detalles de búsquedas no encontradas
- [x] Incluir en respuesta: nombre buscado, institución, URL de búsqueda, resultados devueltos
- [x] Crear endpoint para actualizar datos de investigador y re-encolar
- [x] Crear página NotFoundSearches.tsx para mostrar lista de no encontrados
- [x] Implementar formulario de edición inline para corregir datos
- [x] Agregar botón "Re-encolar" para cada investigador
- [x] Mostrar URL de búsqueda original y resultados
- [x] Agregar navegación desde Dashboard a vista de no encontrados

## Fase 30: Botón para Detener Búsqueda
- [x] Implementar endpoint para pausar/detener worker de BullMQ
- [x] Agregar método para pausar la cola en queueService
- [x] Crear botón "Detener Búsqueda" en Dashboard
- [x] Mostrar estado de la búsqueda (en progreso/detenida)
- [x] Botón se muestra solo cuando hay trabajos activos
- [x] Actualizar UI para reflejar estado de pausa

## Fase 31: Testing y Release v1.0.25
- [x] Probar vista de no encontrados
- [x] Probar corrección y re-encolado
- [x] Probar detener y reanudar búsqueda
- [x] Commit y push
- [x] Crear release v1.0.25

## Fase 32: Fix Scraper de ORCID - No Extrae Resultados
- [x] Revisar orcidSearchWorker.ts para identificar selectores incorrectos
- [x] Actualizar selectores para extraer tabla de resultados correctamente
- [x] Probar con caso de Raquel Abella López
- [x] Commit y push
- [x] Crear release v1.0.26

## Fase 33: Agregar Logs Detallados de Scraping para Debugging
- [x] Agregar campo debugHtml a tabla orcid_searches
- [x] Agregar campo debugInfo (JSON) para logs estructurados
- [x] Actualizar schema (migración se ejecutará en Docker)
- [x] Modificar orcidSearchWorker para capturar HTML de la página
- [x] Guardar logs: selectores encontrados, ORCID IDs extraídos, contenido de tabla
- [x] Mostrar logs en página NotFoundSearches
- [x] Agregar botón "Ver Logs de Debug" en cada fila
- [x] Commit y push
- [x] Crear release v1.0.27

## Fase 34: Script de Migración Manual para Campos de Debugging
- [x] Crear script SQL para agregar campos debugHtml, debugInfo, errorMessage, searchedAt
- [x] Crear script Node.js migrate-debug-fields.mjs para ejecutar migración
- [x] Documentar cómo ejecutar la migración
- [x] Commit y push
- [x] Crear release v1.0.28

## Fase 35: Fix Schema para Migraciones Automáticas
- [x] Revisar error de INSERT con valores default
- [x] Corregir schema.ts para que campos opcionales tengan .default(null)
- [x] Código de inserción ya estaba correcto (solo pasa campos necesarios)
- [x] Eliminar script de migración manual (ya no necesario)
- [x] Commit y push
- [x] Crear release v1.0.29

## Fase 36: Fix Script de Migración - Índice Duplicado
- [x] Localizar script 0002_add_upload_session_id.sql
- [x] Modificar migrate.mjs para ignorar error ER_DUP_KEYNAME
- [x] Hacer script idempotente
- [x] Commit y push
- [x] Crear release v1.0.30

## Fase 37: Fix INSERT con Valores Default en Drizzle
- [x] Revisar código de inserción en routers.ts
- [x] Identificar por qué Drizzle genera SQL con 'default' (pasaba valores por defecto explícitamente)
- [x] Eliminar campos con valores por defecto del objeto de inserción
- [x] Commit y push
- [x] Crear release v1.0.31

## Fase 38: Fix Drizzle Generando SQL con 'default'
- [x] Revisar por qué .default(null) causa que Drizzle genere SQL con 'default'
- [x] Eliminar .default(null) de campos opcionales en schema
- [x] Dejar campos opcionales sin .default() ni .notNull()
- [x] Commit y push
- [x] Crear release v1.0.32

## Fase 39: Generar Nuevas Migraciones de Drizzle
- [x] Revisar migraciones existentes en drizzle/ (0001 tiene schema antiguo)
- [x] Crear migración manual 0003_add_debug_fields.sql
- [x] Crear script de verificación de schema (verify-schema.mjs)
- [x] Agregar nueva migración a migrate.mjs
- [x] Commit y push
- [x] Crear release v1.0.33

## Fase 40: Fix Scraper - Esperar Carga de Resultados
- [x] Revisar orcidSearchWorker.ts
- [x] Agregar page.waitForFunction para esperar texto "Showing"
- [x] Aumentar timeout de page.goto a 60 segundos
- [x] Agregar wait adicional de 2 segundos para renderizado
- [x] Mejorar captura de debugHtml (capturar siempre, no solo en error)
- [x] Agregar logs detallados de cada paso
- [x] Commit y push
- [x] Crear release v1.0.34

## Fase 41: Fix waitForTimeout Deprecado
- [x] Reemplazar page.waitForTimeout por new Promise(resolve => setTimeout)
- [x] Commit y push
- [x] Crear release v1.0.35

## Fase 42: Fix Lógica de Detección de Resultados
- [x] Eliminar verificación prematura de "No results found"
- [x] Dejar que el código siempre intente extraer ORCIDs
- [x] Marcar como not_found solo si no se encuentra ningún ORCID (ya estaba implementado)
- [x] Commit y push
- [x] Crear release v1.0.36

## Fase 43: Página de Múltiples Resultados con Selección
- [x] Crear endpoint para obtener búsquedas con múltiples resultados
- [x] Crear endpoint para seleccionar ORCID correcto de la lista
- [x] Múltiples ORCIDs ya se guardan en debugInfo.multipleOrcids
- [x] Crear página MultipleResults.tsx similar a NotFoundSearches
- [x] Mostrar lista de ORCIDs encontrados con botón "Seleccionar"
- [x] Permitir editar datos y re-encolar
- [x] Mostrar logs de debugging
- [x] Agregar ruta en App.tsx
- [x] Agregar botón "Ver Múltiples" en Dashboard
- [ ] Commit y push
- [ ] Crear release v1.0.37
