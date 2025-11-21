# Migración de Base de Datos - v1.0.27

## Problema

La versión v1.0.27 agregó nuevos campos a la tabla `orcid_searches` para logging de debugging:
- `errorMessage` (TEXT)
- `searchedAt` (TIMESTAMP)
- `debugHtml` (TEXT)
- `debugInfo` (TEXT)

Si actualizaste el código pero no migraste la base de datos, verás este error al cargar archivos Excel:

```
Failed query: insert into `orcid_searches` ...
```

## Solución

Ejecuta el script de migración para agregar los campos faltantes a tu base de datos.

### Opción 1: Usando Docker (Recomendado)

```bash
# Ejecutar migración dentro del contenedor
docker-compose exec web node migrate-debug-fields.mjs
```

### Opción 2: Localmente (si tienes Node.js instalado)

```bash
# Asegúrate de tener el archivo .env con DATABASE_URL
node migrate-debug-fields.mjs
```

### Opción 3: SQL Directo

Si prefieres ejecutar el SQL manualmente, conéctate a tu base de datos y ejecuta:

```sql
-- Agregar columna errorMessage
ALTER TABLE orcid_searches 
ADD COLUMN errorMessage TEXT NULL AFTER notes;

-- Agregar columna searchedAt
ALTER TABLE orcid_searches 
ADD COLUMN searchedAt TIMESTAMP NULL AFTER errorMessage;

-- Agregar columna debugHtml
ALTER TABLE orcid_searches 
ADD COLUMN debugHtml TEXT NULL AFTER searchedAt;

-- Agregar columna debugInfo
ALTER TABLE orcid_searches 
ADD COLUMN debugInfo TEXT NULL AFTER debugHtml;
```

## Verificación

Después de ejecutar la migración, deberías ver:

```
[Migration] ✅ Migration completed successfully!
[Migration] You can now use the debug logging features.
```

Ahora podrás:
- Cargar archivos Excel sin errores
- Ver logs detallados en la página "Ver No Encontrados"
- Diagnosticar por qué el scraper no encuentra ciertos ORCIDs

## Notas

- El script es **idempotente**: puedes ejecutarlo múltiples veces sin problemas
- Solo agrega columnas que no existen
- No modifica datos existentes
- Es seguro ejecutarlo en producción
