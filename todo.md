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
- [ ] Implementar servicio de búsqueda automática de ORCIDs (backend worker)
- [ ] Conectar con ORCID.org para búsquedas

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
- [ ] Agregar indicadores de progreso en tiempo real
- [ ] Implementar manejo de errores robusto
- [ ] Agregar validaciones de datos
- [ ] Optimizar rendimiento de búsquedas
- [ ] Cargar datos de instituciones desde JSON
- [ ] Documentar uso de la aplicación

## Pendiente: Búsqueda Automática de ORCIDs
- [ ] Crear worker/job para búsqueda automática en background
- [ ] Implementar scraping o API de ORCID
- [ ] Procesar investigadores en lotes
- [ ] Actualizar progreso en tiempo real


## Fase 7: Docker y Despliegue
- [x] Crear Dockerfile para la aplicación
- [x] Crear docker-compose.yml con app y base de datos
- [x] Configurar variables de entorno
- [x] Probar build de la aplicación
- [x] Crear .dockerignore
- [x] Documentar instrucciones de despliegue


## Fase 8: GitHub Release
- [ ] Clonar repositorio ORCIDSearcher
- [ ] Copiar archivos del proyecto
- [ ] Crear commit con cambios
- [ ] Crear tag de versión
- [ ] Publicar release candidate en GitHub
