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
