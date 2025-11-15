# ORCID Manager

Aplicación web para gestionar búsquedas de ORCIDs de investigadores de forma eficiente.

## Características

- **Subida de Excel**: Carga archivos Excel con listas de investigadores
- **Búsqueda Automática**: Busca ORCIDs usando múltiples estrategias (nombres normalizados, variantes de instituciones)
- **Dashboard en Tiempo Real**: Visualiza el progreso de las búsquedas
- **Revisión Manual**: Decide manualmente en casos con 0 o múltiples resultados
- **Exportación**: Descarga Excel con todos los ORCIDs encontrados

## Tecnologías

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Node.js + Express + tRPC
- **Base de Datos**: MySQL 8.0
- **ORM**: Drizzle ORM
- **Autenticación**: Manus OAuth (opcional)

## Despliegue con Docker

### Requisitos

- Docker 20.10+
- Docker Compose 2.0+

### Inicio Rápido

1. Clona el repositorio o descarga los archivos

2. Crea un archivo `.env` en la raíz del proyecto (ver sección Variables de Entorno)

3. Ejecuta:
```bash
docker-compose up --build -d
```

4. Accede a la aplicación en `http://localhost:3000`

5. Ejecuta las migraciones de base de datos:
```bash
docker-compose exec app pnpm db:push
```

### Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
# Database
MYSQL_ROOT_PASSWORD=tu_password_root_seguro
MYSQL_DATABASE=orcid_manager
MYSQL_USER=orcid_user
MYSQL_PASSWORD=tu_password_seguro
MYSQL_PORT=3306

# Application
APP_PORT=3000
JWT_SECRET=clave-secreta-jwt-muy-segura

# OAuth (opcional)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=tu-app-id

# App Config
VITE_APP_TITLE=ORCID Manager
VITE_APP_LOGO=/logo.svg
```

Ver `DOCKER_README.md` para instrucciones detalladas.

## Desarrollo Local

### Requisitos

- Node.js 22+
- pnpm 10+
- MySQL 8.0+

### Instalación

1. Instala dependencias:
```bash
pnpm install
```

2. Configura las variables de entorno (usa el panel de gestión de Manus)

3. Ejecuta las migraciones:
```bash
pnpm db:push
```

4. Inicia el servidor de desarrollo:
```bash
pnpm dev
```

5. Accede a `http://localhost:3000`

## Formato del Excel

El archivo Excel debe contener las siguientes columnas:

- **First Name** (requerido): Nombre del investigador
- **Last Name** (requerido): Apellido del investigador
- **Institution** (opcional): Institución del investigador
- **Email** (opcional): Correo electrónico
- **Country** (opcional): País

## Uso

1. **Subir Excel**: Ve a la página de Upload y selecciona tu archivo
2. **Ver Progreso**: El Dashboard muestra el estado de las búsquedas
3. **Revisar Casos**: En la página Review, decide manualmente sobre casos ambiguos
4. **Exportar**: Descarga el Excel con los resultados desde el Dashboard

## Estructura del Proyecto

```
orcid-manager/
├── client/           # Frontend React
│   ├── src/
│   │   ├── pages/    # Páginas de la aplicación
│   │   ├── components/ # Componentes reutilizables
│   │   └── lib/      # Utilidades y configuración
├── server/           # Backend Node.js
│   ├── _core/        # Infraestructura (OAuth, tRPC, etc.)
│   ├── db.ts         # Funciones de base de datos
│   ├── routers.ts    # Endpoints tRPC
│   └── utils.ts      # Utilidades
├── drizzle/          # Esquemas y migraciones de BD
├── shared/           # Código compartido
├── storage/          # Helpers de S3
├── Dockerfile        # Configuración Docker
└── docker-compose.yml # Orquestación de servicios
```

## Comandos Útiles

```bash
# Desarrollo
pnpm dev              # Iniciar servidor de desarrollo
pnpm build            # Construir para producción
pnpm start            # Iniciar en producción
pnpm db:push          # Aplicar migraciones

# Docker
docker-compose up -d           # Iniciar servicios
docker-compose logs -f app     # Ver logs
docker-compose down            # Detener servicios
docker-compose exec app sh     # Acceder al contenedor
```

## Licencia

MIT

## Soporte

Para preguntas o problemas, consulta la documentación o abre un issue.
