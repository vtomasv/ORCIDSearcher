# ORCID Manager - Docker Deployment

Esta guía explica cómo desplegar la aplicación ORCID Manager usando Docker y Docker Compose.

## Requisitos Previos

- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)

## Arquitectura de Servicios

La aplicación utiliza tres servicios principales:

1. **app**: Aplicación Node.js con React frontend y Express backend
2. **db**: Base de datos MySQL 8.0 para almacenar investigadores y búsquedas
3. **redis**: Redis 7 para sistema de colas (BullMQ) y búsqueda automática

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=tu_password_root_seguro
MYSQL_DATABASE=orcid_manager
MYSQL_USER=orcid_user
MYSQL_PASSWORD=tu_password_seguro
MYSQL_PORT=3306

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Application Port
APP_PORT=3000

# JWT Secret (¡CAMBIA ESTO EN PRODUCCIÓN!)
JWT_SECRET=tu-clave-secreta-jwt-muy-segura

# OAuth Configuration (Manus) - Opcional si no usas autenticación Manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=tu-app-id

# Owner Information - Opcional
OWNER_OPEN_ID=
OWNER_NAME=Admin

# App Configuration
VITE_APP_TITLE=ORCID Manager - Gestión de Búsquedas de ORCID
VITE_APP_LOGO=/logo.svg
```

### 2. Construcción y Ejecución

#### Opción 1: Construcción y ejecución en un solo comando

```bash
docker-compose up --build -d
```

#### Opción 2: Construcción y ejecución por separado

```bash
# Construir las imágenes
docker-compose build

# Iniciar los servicios
docker-compose up -d
```

### 3. Inicialización de la Base de Datos

Después del primer inicio, ejecuta las migraciones y carga las instituciones:

```bash
# Ejecutar migraciones
docker-compose exec app pnpm db:push

# Cargar instituciones (recomendado para mejorar búsquedas)
docker-compose exec app pnpm db:seed-institutions
```

### 4. Verificar el Estado

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo de la aplicación
docker-compose logs -f app

# Ver logs solo de la base de datos
docker-compose logs -f db

# Ver logs de Redis
docker-compose logs -f redis

# Verificar el estado de los contenedores (debe mostrar "healthy")
docker-compose ps
```

### 5. Acceder a la Aplicación

Una vez que los contenedores estén ejecutándose, accede a la aplicación en:

```
http://localhost:3000
```

## Funcionalidades Principales

### Búsqueda Automática de ORCIDs

La aplicación incluye un sistema de búsqueda automática que:

1. **Usa Puppeteer** para navegar a ORCID.org
2. **Procesa en background** usando BullMQ y Redis
3. **Actualiza en tiempo real** vía WebSockets (Socket.IO)
4. **Normaliza nombres** (sin acentos ni caracteres especiales)
5. **Prueba variantes** de instituciones automáticamente

Para usar la búsqueda automática:

1. Sube un archivo Excel con investigadores
2. Ve al Dashboard
3. Haz clic en "Buscar ORCIDs"
4. Observa el progreso en tiempo real

### Sistema de Colas (BullMQ)

El sistema de colas permite:

- Procesar hasta 5 búsquedas simultáneas
- Reintentos automáticos en caso de error
- Persistencia de trabajos en Redis
- Monitoreo de progreso en tiempo real

## Comandos Útiles

### Gestión de Servicios

```bash
# Detener los servicios
docker-compose stop

# Reiniciar los servicios
docker-compose restart

# Reiniciar solo la aplicación
docker-compose restart app

# Detener y eliminar los contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes (¡CUIDADO! Esto borrará los datos)
docker-compose down -v
```

### Acceso a Contenedores

```bash
# Acceder a la shell del contenedor de la aplicación
docker-compose exec app sh

# Acceder a MySQL
docker-compose exec db mysql -u orcid_user -p orcid_manager

# Acceder a Redis CLI
docker-compose exec redis redis-cli
```

### Monitoreo de Colas

```bash
# Ver trabajos en la cola de Redis
docker-compose exec redis redis-cli KEYS "bull:*"

# Ver estadísticas de la cola
docker-compose exec redis redis-cli INFO stats
```

## Estructura de Volúmenes

El docker-compose crea tres volúmenes persistentes:

- `mysql_data`: Almacena los datos de la base de datos MySQL
- `redis_data`: Almacena los datos de Redis (colas y caché)
- `app_uploads`: Almacena los archivos subidos por los usuarios (opcional)

## Puertos Expuestos

- **3000**: Aplicación web (configurable con `APP_PORT`)
- **3306**: Base de datos MySQL (configurable con `MYSQL_PORT`)
- **6379**: Redis (solo accesible internamente entre contenedores)

## Health Checks

Todos los servicios incluyen health checks:

- **db**: Verifica conexión MySQL cada 10 segundos
- **redis**: Verifica que Redis responda con PING cada 5 segundos
- **app**: Verifica que el servidor HTTP responda en el puerto 3000

## Troubleshooting

### La aplicación no se conecta a la base de datos

1. Verifica que el contenedor de la base de datos esté saludable:
   ```bash
   docker-compose ps
   ```

2. Revisa los logs de la base de datos:
   ```bash
   docker-compose logs db
   ```

3. Asegúrate de que las credenciales en el archivo `.env` sean correctas.

### La aplicación no se conecta a Redis

1. Verifica que Redis esté ejecutándose:
   ```bash
   docker-compose ps redis
   ```

2. Revisa los logs de Redis:
   ```bash
   docker-compose logs redis
   ```

3. Verifica la conectividad desde la aplicación:
   ```bash
   docker-compose exec app sh -c "nc -zv redis 6379"
   ```

### Las búsquedas automáticas no funcionan

1. Verifica que Redis esté funcionando correctamente
2. Revisa los logs de la aplicación para errores de Puppeteer:
   ```bash
   docker-compose logs app | grep -i puppeteer
   ```

3. Asegúrate de que las instituciones estén cargadas:
   ```bash
   docker-compose exec app pnpm db:seed-institutions
   ```

### Error de permisos en volúmenes

Si tienes problemas de permisos, puedes eliminar los volúmenes y recrearlos:

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec app pnpm db:push
docker-compose exec app pnpm db:seed-institutions
```

### La aplicación no inicia

1. Revisa los logs de la aplicación:
   ```bash
   docker-compose logs app
   ```

2. Verifica que todas las variables de entorno estén configuradas correctamente.

3. Asegúrate de que los puertos 3000, 3306 y 6379 no estén siendo usados por otras aplicaciones.

### Puppeteer falla al iniciar Chrome

Puppeteer requiere dependencias del sistema que ya están incluidas en el Dockerfile. Si aún así falla:

1. Verifica los logs:
   ```bash
   docker-compose logs app | grep -i chrome
   ```

2. Reconstruye la imagen:
   ```bash
   docker-compose build --no-cache app
   docker-compose up -d
   ```

## Producción

Para despliegue en producción:

1. **Cambia todas las contraseñas y secretos** en el archivo `.env`
2. Usa un `JWT_SECRET` fuerte y único (mínimo 32 caracteres)
3. Configura un proxy reverso (nginx, Traefik, etc.) con HTTPS
4. Configura backups automáticos de los volúmenes `mysql_data` y `redis_data`
5. Considera usar Docker Swarm o Kubernetes para alta disponibilidad
6. Configura límites de recursos para cada contenedor
7. Implementa monitoreo con Prometheus/Grafana
8. Configura alertas para fallos en las colas

### Ejemplo de Configuración de Recursos

Agrega esto a tu `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Backup y Restauración

### Backup de la Base de Datos

```bash
# Backup completo
docker-compose exec db mysqldump -u orcid_user -p orcid_manager > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup comprimido
docker-compose exec db mysqldump -u orcid_user -p orcid_manager | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Backup de Redis

```bash
# Forzar guardado de Redis
docker-compose exec redis redis-cli SAVE

# Copiar archivo RDB
docker cp orcid-manager-redis-1:/data/dump.rdb ./redis_backup_$(date +%Y%m%d_%H%M%S).rdb
```

### Restaurar desde Backup

```bash
# Restaurar MySQL
docker-compose exec -T db mysql -u orcid_user -p orcid_manager < backup_20240101_120000.sql

# Restaurar MySQL desde comprimido
gunzip < backup_20240101_120000.sql.gz | docker-compose exec -T db mysql -u orcid_user -p orcid_manager

# Restaurar Redis
docker-compose stop redis
docker cp redis_backup_20240101_120000.rdb orcid-manager-redis-1:/data/dump.rdb
docker-compose start redis
```

## Escalabilidad

Para escalar la aplicación:

1. **Múltiples workers**: Ejecuta múltiples instancias de la aplicación detrás de un load balancer
2. **Redis Cluster**: Para alta disponibilidad de colas
3. **MySQL Replication**: Para lectura distribuida
4. **CDN**: Para servir assets estáticos

## Monitoreo

### Métricas Recomendadas

- Uso de CPU y memoria por contenedor
- Número de trabajos en cola (BullMQ)
- Tasa de éxito/fallo de búsquedas
- Tiempo promedio de búsqueda
- Conexiones activas a MySQL y Redis

### Logs Centralizados

Considera usar:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Loki + Grafana
- CloudWatch (AWS)

## Soporte

Para problemas o preguntas:
- Revisa los logs: `docker-compose logs -f`
- Consulta el README principal
- Abre un issue en GitHub
