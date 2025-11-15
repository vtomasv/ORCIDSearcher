# ORCID Manager - Docker Deployment

Esta guía explica cómo desplegar la aplicación ORCID Manager usando Docker y Docker Compose.

## Requisitos Previos

- Docker (versión 20.10 o superior)
- Docker Compose (versión 2.0 o superior)

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

### 3. Verificar el Estado

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo de la aplicación
docker-compose logs -f app

# Ver logs solo de la base de datos
docker-compose logs -f db

# Verificar el estado de los contenedores
docker-compose ps
```

### 4. Acceder a la Aplicación

Una vez que los contenedores estén ejecutándose, accede a la aplicación en:

```
http://localhost:3000
```

### 5. Ejecutar Migraciones de Base de Datos

Después del primer inicio, ejecuta las migraciones:

```bash
docker-compose exec app pnpm db:push
```

## Comandos Útiles

### Detener los Servicios

```bash
docker-compose stop
```

### Reiniciar los Servicios

```bash
docker-compose restart
```

### Detener y Eliminar los Contenedores

```bash
docker-compose down
```

### Detener y Eliminar Contenedores + Volúmenes (¡CUIDADO! Esto borrará los datos)

```bash
docker-compose down -v
```

### Acceder a la Shell del Contenedor de la Aplicación

```bash
docker-compose exec app sh
```

### Acceder a MySQL

```bash
docker-compose exec db mysql -u orcid_user -p orcid_manager
```

## Estructura de Volúmenes

El docker-compose crea dos volúmenes persistentes:

- `mysql_data`: Almacena los datos de la base de datos MySQL
- `app_uploads`: Almacena los archivos subidos por los usuarios

## Puertos Expuestos

- **3000**: Aplicación web (configurable con `APP_PORT`)
- **3306**: Base de datos MySQL (configurable con `MYSQL_PORT`)

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

### Error de permisos en volúmenes

Si tienes problemas de permisos, puedes eliminar los volúmenes y recrearlos:

```bash
docker-compose down -v
docker-compose up -d
```

### La aplicación no inicia

1. Revisa los logs de la aplicación:
   ```bash
   docker-compose logs app
   ```

2. Verifica que todas las variables de entorno estén configuradas correctamente.

3. Asegúrate de que el puerto 3000 no esté siendo usado por otra aplicación.

## Producción

Para despliegue en producción:

1. **Cambia todas las contraseñas y secretos** en el archivo `.env`
2. Usa un `JWT_SECRET` fuerte y único
3. Configura un proxy reverso (nginx, Traefik, etc.) con HTTPS
4. Configura backups automáticos del volumen `mysql_data`
5. Considera usar Docker Swarm o Kubernetes para alta disponibilidad

## Backup y Restauración

### Backup de la Base de Datos

```bash
docker-compose exec db mysqldump -u orcid_user -p orcid_manager > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar desde Backup

```bash
docker-compose exec -T db mysql -u orcid_user -p orcid_manager < backup_20240101_120000.sql
```
