# ORCID Manager

**Aplicación web completa para gestionar búsquedas de ORCIDs de investigadores**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0--rc2-blue.svg)](https://github.com/vtomasv/ORCIDSearcher/releases)

## 📋 Descripción

ORCID Manager es una aplicación web moderna que facilita la búsqueda y gestión de ORCIDs (Open Researcher and Contributor ID) para investigadores. Permite subir archivos Excel con datos de investigadores y buscar automáticamente sus ORCIDs en la base de datos de ORCID.org.

### ✨ Características Principales

- **📤 Subida de Excel**: Importa fácilmente listas de investigadores desde archivos Excel
- **🔍 Búsqueda Automática**: Búsqueda automatizada en ORCID.org usando Puppeteer
- **🧠 Búsqueda Inteligente**: 
  - Normalización de nombres (sin acentos ni caracteres especiales)
  - Múltiples variantes de instituciones
  - Reintentos automáticos con backoff exponencial
- **⚡ Procesamiento en Background**: Sistema de colas con BullMQ y Redis
- **📊 Progreso en Tiempo Real**: WebSockets para actualización instantánea del dashboard
- **✏️ Revisión Manual**: Interfaz para resolver casos ambiguos (0 o múltiples resultados)
- **📥 Exportación**: Descarga Excel con ORCIDs encontrados y URLs de búsqueda
- **🐳 Docker Ready**: Despliegue fácil con Docker Compose

## 🚀 Inicio Rápido

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/vtomasv/ORCIDSearcher.git
cd ORCIDSearcher

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Iniciar servicios
docker-compose up --build -d

# 4. Ejecutar migraciones
docker-compose exec app pnpm db:push

# 5. Cargar instituciones (opcional pero recomendado)
docker-compose exec app pnpm db:seed-institutions

# 6. Acceder a la aplicación
# Abrir http://localhost:3000
```

### Opción 2: Instalación Local

#### Requisitos Previos

- Node.js 22+
- pnpm 10+
- MySQL 8.0+
- Redis 7+

#### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/vtomasv/ORCIDSearcher.git
cd ORCIDSearcher

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL y Redis

# 4. Ejecutar migraciones
pnpm db:push

# 5. Cargar instituciones (opcional pero recomendado)
pnpm db:seed-institutions

# 6. Iniciar en desarrollo
pnpm dev

# O construir para producción
pnpm build
pnpm start
```

## 📖 Cómo Usar

### 1. Preparar Excel

Crea un archivo Excel (.xlsx) con las siguientes columnas:

| firstName | lastName | institution | email (opcional) | country (opcional) |
|-----------|----------|-------------|------------------|-------------------|
| Juan      | Pérez    | Universidad de La República | juan@example.com | Uruguay |
| María     | García   | UDELAR      | maria@example.com | Uruguay |

### 2. Subir Archivo

1. Accede a la aplicación en http://localhost:3000
2. Haz clic en "Subir Excel"
3. Selecciona tu archivo Excel
4. Haz clic en "Procesar"

### 3. Iniciar Búsqueda Automática

1. Ve al Dashboard
2. Haz clic en el botón "Buscar ORCIDs" en la sesión correspondiente
3. Observa el progreso en tiempo real

### 4. Revisar Casos Ambiguos

1. Ve a la página de "Revisión Manual"
2. Revisa casos con múltiples resultados o sin resultados
3. Selecciona el ORCID correcto o marca como "No encontrado"

### 5. Exportar Resultados

1. En el Dashboard, haz clic en "Exportar Excel"
2. Descarga el archivo con los ORCIDs encontrados

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- React 19
- TypeScript
- Tailwind CSS 4
- tRPC para comunicación type-safe
- Socket.IO Client para WebSockets
- Wouter para routing

**Backend:**
- Node.js con Express
- tRPC Server
- MySQL con Drizzle ORM
- Redis para colas
- BullMQ para procesamiento en background
- Socket.IO para WebSockets en tiempo real
- Puppeteer para scraping de ORCID.org

**Infraestructura:**
- Docker & Docker Compose
- MySQL 8.0
- Redis 7

### Estructura del Proyecto

```
orcid-manager/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── components/    # Componentes reutilizables
│   │   ├── hooks/         # Custom hooks (useSocket, useAuth)
│   │   └── lib/           # Utilidades y configuración
├── server/                # Backend Node.js
│   ├── _core/            # Configuración del servidor
│   ├── db.ts             # Funciones de base de datos
│   ├── routers.ts        # Endpoints tRPC
│   ├── orcidSearchWorker.ts  # Worker de búsqueda
│   ├── queueService.ts   # Servicio de colas BullMQ
│   └── utils.ts          # Utilidades
├── drizzle/              # Esquemas y migraciones
├── scripts/              # Scripts de utilidad
├── docker-compose.yml    # Orquestación de servicios
└── Dockerfile           # Imagen de la aplicación
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Base de Datos
DATABASE_URL=mysql://user:password@localhost:3306/orcid_manager

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# OAuth (Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://account.manus.im
VITE_APP_ID=your-app-id

# Aplicación
VITE_APP_TITLE=ORCID Manager
APP_PORT=3000
```

### Cargar Instituciones

El archivo `instituciones_final.json` contiene variantes de nombres de instituciones para mejorar las búsquedas:

```bash
# Con Docker
docker-compose exec app pnpm db:seed-institutions

# Sin Docker
pnpm db:seed-institutions
```

## 📝 Scripts Disponibles

```bash
pnpm dev                    # Iniciar en desarrollo
pnpm build                  # Construir para producción
pnpm start                  # Iniciar en producción
pnpm db:push                # Ejecutar migraciones
pnpm db:seed-institutions   # Cargar instituciones
pnpm test                   # Ejecutar tests
pnpm format                 # Formatear código
pnpm check                  # Verificar tipos TypeScript
```

## 🐛 Solución de Problemas

### Error de Conexión a MySQL

```bash
# Verificar que MySQL esté ejecutándose
docker-compose ps

# Ver logs de MySQL
docker-compose logs db
```

### Error de Conexión a Redis

```bash
# Verificar que Redis esté ejecutándose
docker-compose ps

# Ver logs de Redis
docker-compose logs redis
```

### Puppeteer no Funciona

Puppeteer requiere dependencias del sistema. En Docker ya están incluidas. En instalación local:

```bash
# Ubuntu/Debian
sudo apt-get install -y \
  chromium-browser \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgtk-3-0
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Desarrollo Inicial** - [vtomasv](https://github.com/vtomasv)

## 🙏 Agradecimientos

- [ORCID](https://orcid.org/) por proporcionar la base de datos de identificadores de investigadores
- Comunidad open source por las excelentes herramientas utilizadas

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

- Abre un [Issue](https://github.com/vtomasv/ORCIDSearcher/issues)
- Contacta al equipo de desarrollo

---

**Versión**: 1.0.0-rc2  
**Última Actualización**: Noviembre 2024
