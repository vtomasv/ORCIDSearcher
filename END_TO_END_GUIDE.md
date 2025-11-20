# ORCID Manager - Guía de Flujo End-to-End

Esta guía describe el flujo completo de uso de ORCID Manager, desde la preparación de datos hasta la exportación de resultados.

## Tabla de Contenidos

1. [Preparación de Datos](#1-preparación-de-datos)
2. [Configuración Inicial](#2-configuración-inicial)
3. [Subida de Excel](#3-subida-de-excel)
4. [Búsqueda Automática](#4-búsqueda-automática)
5. [Monitoreo de Progreso](#5-monitoreo-de-progreso)
6. [Revisión Manual](#6-revisión-manual)
7. [Exportación de Resultados](#7-exportación-de-resultados)
8. [Casos de Uso Comunes](#8-casos-de-uso-comunes)

---

## 1. Preparación de Datos

### Formato del Excel

Crea un archivo Excel (`.xlsx`) con las siguientes columnas:

| Columna | Requerido | Descripción | Ejemplo |
|---------|-----------|-------------|---------|
| `firstName` | ✅ Sí | Nombre del investigador | Juan |
| `lastName` | ✅ Sí | Apellido del investigador | Pérez |
| `institution` | ⚠️ Recomendado | Institución afiliada | Universidad de La República |
| `email` | ❌ Opcional | Correo electrónico | juan.perez@universidad.edu |
| `country` | ❌ Opcional | País | Uruguay |

### Ejemplo de Archivo Excel

```
firstName | lastName | institution                    | email                    | country
----------|----------|--------------------------------|--------------------------|--------
Juan      | Pérez    | Universidad de La República    | juan@universidad.edu     | Uruguay
María     | García   | UDELAR                         | maria@udelar.edu.uy      | Uruguay
José      | Rodríguez| Universidad ORT Uruguay        | jose@ort.edu.uy          | Uruguay
Ana       | Martínez | Universidad Católica del Uruguay| ana@ucu.edu.uy          | Uruguay
```

### Consejos para Mejores Resultados

1. **Incluye la institución**: Aumenta significativamente la precisión de las búsquedas
2. **Usa nombres completos**: Evita abreviaciones cuando sea posible
3. **Verifica ortografía**: Nombres mal escritos no encontrarán resultados
4. **Formato consistente**: Mantén el mismo formato para todas las filas

---

## 2. Configuración Inicial

### Con Docker

```bash
# 1. Clonar repositorio
git clone https://github.com/vtomasv/ORCIDSearcher.git
cd ORCIDSearcher

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Iniciar servicios
docker-compose up --build -d

# 4. Esperar a que los servicios estén saludables (30-60 segundos)
docker-compose ps

# 5. Ejecutar migraciones
docker-compose exec app pnpm db:push

# 6. Cargar instituciones (IMPORTANTE para mejorar búsquedas)
docker-compose exec app pnpm db:seed-institutions
```

### Sin Docker

```bash
# 1. Clonar repositorio
git clone https://github.com/vtomasv/ORCIDSearcher.git
cd ORCIDSearcher

# 2. Instalar dependencias
pnpm install

# 3. Configurar .env con MySQL y Redis

# 4. Ejecutar migraciones
pnpm db:push

# 5. Cargar instituciones
pnpm db:seed-institutions

# 6. Iniciar aplicación
pnpm dev
```

### Verificar Instalación

Accede a `http://localhost:3000` y verifica que la página principal se carga correctamente.

---

## 3. Subida de Excel

### Paso a Paso

1. **Navegar a la página de subida**
   - Click en "Subir Excel" en el menú de navegación
   - O accede directamente a `http://localhost:3000/upload`

2. **Seleccionar archivo**
   - Click en el área de drop zone o "Seleccionar archivo"
   - Selecciona tu archivo `.xlsx`

3. **Validación automática**
   - La aplicación verifica que el archivo tenga las columnas requeridas
   - Muestra un preview de los primeros registros

4. **Procesar archivo**
   - Click en "Procesar Excel"
   - La aplicación:
     - Lee todas las filas del Excel
     - Crea registros en la base de datos
     - Crea una sesión de subida
     - Redirige al Dashboard

### Ejemplo de Respuesta

```json
{
  "success": true,
  "sessionId": "abc123",
  "researchersCreated": 150,
  "message": "Excel procesado exitosamente"
}
```

---

## 4. Búsqueda Automática

### Iniciar Búsqueda

1. **Ir al Dashboard**
   - Automáticamente después de subir Excel
   - O navega a `http://localhost:3000/dashboard`

2. **Seleccionar sesión**
   - Verás una lista de sesiones de subida
   - Cada sesión muestra:
     - Fecha de subida
     - Número de investigadores
     - Progreso actual

3. **Iniciar búsqueda automática**
   - Click en "Buscar ORCIDs" en la sesión deseada
   - Confirma la acción

### Qué Sucede Durante la Búsqueda

El sistema ejecuta automáticamente:

1. **Encolado de trabajos**
   - Cada investigador se agrega a la cola de BullMQ
   - Los trabajos se procesan en orden FIFO

2. **Procesamiento en background**
   - Hasta 5 búsquedas simultáneas
   - Cada búsqueda:
     - Navega a ORCID.org con Puppeteer
     - Busca con nombre y apellido originales
     - Si no encuentra, intenta con nombres normalizados
     - Si no encuentra, prueba variantes de institución

3. **Actualización en tiempo real**
   - Socket.IO emite eventos de progreso
   - El dashboard se actualiza automáticamente
   - No necesitas refrescar la página

### Estrategias de Búsqueda

La búsqueda automática usa múltiples estrategias:

#### Estrategia 1: Búsqueda Original
```
Nombre: José María
Apellido: García López
Institución: Universidad de La República
```

#### Estrategia 2: Nombres Normalizados
```
Nombre: jose maria
Apellido: garcia lopez
Institución: Universidad de La República
```

#### Estrategia 3: Variantes de Institución
```
Nombre: José María
Apellido: García López
Institución: UDELAR  (variante)
```

#### Estrategia 4: Combinación
```
Nombre: jose maria  (normalizado)
Apellido: garcia lopez  (normalizado)
Institución: UDELAR  (variante)
```

---

## 5. Monitoreo de Progreso

### Dashboard en Tiempo Real

El dashboard muestra:

#### Estadísticas Generales
- **Total de investigadores**: Número total en la sesión
- **Procesados**: Investigadores ya buscados
- **Encontrados**: ORCIDs encontrados exitosamente
- **Múltiples**: Casos con más de un resultado
- **No encontrados**: Sin resultados
- **Pendientes**: Aún no procesados

#### Barra de Progreso
- Actualización en tiempo real
- Porcentaje completado
- Estimación de tiempo restante (basado en velocidad actual)

#### Lista de Resultados
- Tabla con todos los investigadores
- Columnas:
  - Nombre completo
  - Institución
  - ORCID (si se encontró)
  - Estado (encontrado/múltiples/no encontrado/procesando)
  - Acciones (revisar/ver en ORCID)

### Eventos de Socket.IO

La aplicación emite estos eventos:

```typescript
// Progreso actualizado
socket.on('search:progress', (data) => {
  console.log(`Procesados: ${data.processed}/${data.total}`);
});

// Búsqueda completada
socket.on('search:complete', (data) => {
  console.log(`ORCID encontrado: ${data.orcid}`);
});

// Error en búsqueda
socket.on('search:error', (data) => {
  console.log(`Error: ${data.error}`);
});
```

---

## 6. Revisión Manual

### Cuándo Revisar Manualmente

Debes revisar manualmente cuando:

1. **Múltiples resultados**: ORCID.org devuelve más de un investigador
2. **Sin resultados**: No se encontró ningún ORCID
3. **Dudas**: Quieres verificar que el ORCID es correcto

### Proceso de Revisión

1. **Navegar a Revisión Manual**
   - Click en "Revisión Manual" en el menú
   - O accede a `http://localhost:3000/review`

2. **Filtrar casos**
   - Todos los casos
   - Solo múltiples resultados
   - Solo sin resultados

3. **Para cada caso**:

#### Caso: Múltiples Resultados

```
Investigador: Juan Pérez
Institución: Universidad de La República

Resultados encontrados:
1. Juan Pérez - Universidad de La República, Uruguay
   ORCID: 0000-0001-2345-6789
   
2. Juan Pérez - Universidad de Buenos Aires, Argentina
   ORCID: 0000-0001-9876-5432
   
3. Juan A. Pérez - Universidad de La República, Uruguay
   ORCID: 0000-0002-1111-2222
```

**Acciones disponibles**:
- Seleccionar el ORCID correcto
- Marcar como "No es ninguno de estos"
- Buscar manualmente con otros parámetros

#### Caso: Sin Resultados

```
Investigador: María García
Institución: UDELAR

No se encontraron resultados.
```

**Acciones disponibles**:
- Buscar manualmente con nombre modificado
- Buscar sin institución
- Marcar como "No tiene ORCID"
- Ir a ORCID.org para búsqueda manual

### Búsqueda Manual Personalizada

Si la búsqueda automática no encuentra resultados, puedes:

1. **Modificar parámetros**:
   - Cambiar nombre (ej: usar segundo nombre)
   - Cambiar apellido (ej: usar solo primer apellido)
   - Cambiar o quitar institución
   - Agregar país

2. **Buscar nuevamente**:
   - La aplicación busca con los nuevos parámetros
   - Muestra resultados inmediatamente

3. **Guardar resultado**:
   - Selecciona el ORCID correcto
   - Se guarda automáticamente en la base de datos

---

## 7. Exportación de Resultados

### Generar Excel con Resultados

1. **Ir al Dashboard**
   - Navega a `http://localhost:3000/dashboard`

2. **Seleccionar sesión**
   - Click en la sesión que deseas exportar

3. **Exportar**
   - Click en "Exportar Excel"
   - El archivo se descarga automáticamente

### Contenido del Excel Exportado

El Excel exportado incluye todas las columnas originales más:

| Columna Original | Columna Nueva | Descripción |
|-----------------|---------------|-------------|
| firstName | ORCID | ORCID encontrado o vacío |
| lastName | ORCID_Status | Estado de la búsqueda |
| institution | ORCID_Search_URL | URL de búsqueda en ORCID.org |
| ... | ... | ... |

### Valores de ORCID_Status

- `FOUND`: ORCID encontrado exitosamente
- `MULTIPLE`: Múltiples resultados, requiere revisión
- `NOT_FOUND`: No se encontró ningún resultado
- `PENDING`: Aún no procesado
- `ERROR`: Error durante la búsqueda

### Ejemplo de Excel Exportado

```
firstName | lastName | institution | ORCID              | ORCID_Status | ORCID_Search_URL
----------|----------|-------------|--------------------|--------------|-----------------
Juan      | Pérez    | UDELAR      | 0000-0001-2345-6789| FOUND        | https://orcid.org/...
María     | García   | UDELAR      |                    | MULTIPLE     | https://orcid.org/...
José      | Rodríguez| ORT         | 0000-0002-9876-5432| FOUND        | https://orcid.org/...
Ana       | Martínez | UCU         |                    | NOT_FOUND    | https://orcid.org/...
```

---

## 8. Casos de Uso Comunes

### Caso 1: Universidad con 100 Investigadores

**Escenario**: Una universidad quiere obtener los ORCIDs de su facultad.

**Proceso**:
1. Exportar lista de investigadores desde sistema interno
2. Formatear como Excel con columnas requeridas
3. Subir a ORCID Manager
4. Iniciar búsqueda automática
5. Esperar 10-15 minutos (aprox. 5-10 segundos por investigador)
6. Revisar casos ambiguos (típicamente 10-20%)
7. Exportar resultados finales

**Tiempo estimado**: 30-45 minutos total

### Caso 2: Proyecto de Investigación Multi-institucional

**Escenario**: Proyecto con investigadores de 5 universidades diferentes.

**Proceso**:
1. Recopilar datos de todas las instituciones
2. Unificar en un solo Excel
3. Asegurar que nombres de instituciones sean consistentes
4. Cargar instituciones con variantes si es necesario
5. Subir y procesar
6. Revisar casos con múltiples resultados (más común en multi-institucional)
7. Exportar

**Tiempo estimado**: 1-2 horas para 200-300 investigadores

### Caso 3: Actualización Periódica

**Escenario**: Universidad que actualiza ORCIDs trimestralmente.

**Proceso**:
1. Exportar solo nuevos investigadores o sin ORCID
2. Subir a ORCID Manager
3. Buscar automáticamente
4. Revisar y exportar
5. Importar resultados al sistema interno

**Tiempo estimado**: 15-30 minutos por actualización

### Caso 4: Investigador Individual

**Escenario**: Un investigador busca su propio ORCID o el de colegas.

**Proceso**:
1. Crear Excel simple con 1-10 investigadores
2. Subir y buscar
3. Resultados en menos de 1 minuto

**Tiempo estimado**: 2-5 minutos

---

## Solución de Problemas

### Problema: Búsqueda muy lenta

**Causas posibles**:
- Muchos investigadores en cola
- Conexión lenta a internet
- ORCID.org respondiendo lentamente

**Soluciones**:
- Esperar pacientemente (el sistema continúa en background)
- Verificar logs: `docker-compose logs -f app`
- Reiniciar servicios si es necesario

### Problema: Muchos "No encontrados"

**Causas posibles**:
- Nombres mal escritos en el Excel
- Instituciones no reconocidas
- Investigadores sin ORCID registrado

**Soluciones**:
- Verificar ortografía de nombres
- Cargar variantes de instituciones
- Usar búsqueda manual para casos específicos
- Recordar que no todos los investigadores tienen ORCID

### Problema: Muchos "Múltiples resultados"

**Causas posibles**:
- Nombres comunes (ej: Juan Pérez)
- Falta de información de institución
- Instituciones muy grandes

**Soluciones**:
- Asegurar que la columna institución esté completa
- Usar revisión manual para seleccionar el correcto
- Agregar información adicional (email, país) si está disponible

---

## Mejores Prácticas

### Preparación de Datos

1. ✅ Limpia los datos antes de subir
2. ✅ Usa nombres completos (no iniciales)
3. ✅ Incluye institución siempre que sea posible
4. ✅ Verifica ortografía
5. ✅ Usa formato consistente

### Durante la Búsqueda

1. ✅ Deja que la búsqueda automática termine antes de revisar
2. ✅ Monitorea el progreso pero no refresques constantemente
3. ✅ Revisa los logs si hay errores
4. ✅ No cierres el navegador durante la búsqueda

### Revisión Manual

1. ✅ Verifica la institución antes de seleccionar un ORCID
2. ✅ Usa el link a ORCID.org para ver el perfil completo
3. ✅ Si tienes dudas, marca como "No encontrado" y verifica manualmente después
4. ✅ Documenta casos especiales

### Exportación

1. ✅ Exporta cuando toda la revisión esté completa
2. ✅ Guarda una copia del Excel exportado
3. ✅ Verifica que todos los ORCIDs estén en formato correcto
4. ✅ Usa el ORCID_Status para identificar casos pendientes

---

## Preguntas Frecuentes

### ¿Cuánto tiempo toma buscar 100 investigadores?

Aproximadamente 10-15 minutos con búsqueda automática (5-10 segundos por investigador).

### ¿Puedo buscar miles de investigadores?

Sí, pero considera:
- Dividir en lotes de 500-1000
- Ejecutar durante horas de baja actividad
- Monitorear el uso de recursos del servidor

### ¿Los resultados se guardan si cierro el navegador?

Sí, todo se guarda en la base de datos. Puedes volver al Dashboard en cualquier momento.

### ¿Puedo pausar y reanudar la búsqueda?

Actualmente no hay función de pausa, pero puedes detener los servicios con `docker-compose stop` y reiniciar después.

### ¿Qué pasa si ORCID.org está caído?

El sistema reintentará automáticamente con backoff exponencial. Si persiste, los trabajos quedarán en la cola hasta que ORCID.org esté disponible.

### ¿Puedo buscar investigadores de cualquier país?

Sí, ORCID es internacional. Solo asegúrate de tener las variantes de instituciones cargadas para tu país.

---

## Soporte

Si encuentras problemas no cubiertos en esta guía:

1. Revisa los logs: `docker-compose logs -f`
2. Consulta el README principal
3. Abre un issue en GitHub
4. Contacta al equipo de desarrollo

---

**Versión**: 1.0.0-rc2  
**Última Actualización**: Noviembre 2024
