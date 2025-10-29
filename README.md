# Genesys Laboral Medicine

> Sistema integral de gestión para Salud y Seguridad en el Trabajo (SST)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.17.0-brightgreen.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Genesys Business Inteligence** es una plataforma web completa para la gestión de salud ocupacional y seguridad en el trabajo. Permite a las empresas crear profesiogramas, matrices de riesgos profesionales, y generar automáticamente documentos de cumplimiento según la normativa colombiana (Resolución 1843).

## Características Principales

- **Matriz de Riesgos Profesionales**: Evaluación de riesgos laborales utilizando metodología GTC 45
- **Profesiogramas Automatizados**: Generación de perfiles ocupacionales por cargo
- **Gestión de GES** (Grupos de Exposición Similar): Identificación y clasificación de riesgos
- **Generación de Documentos**: Exportación automática a PDF y Excel
- **Sistema de Almacenamiento Cloud**: Integración con DigitalOcean Spaces
- **Interfaz Interactiva**: Tutorial paso a paso con tooltips contextuales
- **Multi-tenant**: Gestión de múltiples empresas y usuarios
- **Persistencia Local**: Guardado automático de formularios con expiración de 72 horas
- **Integración de WhatsApp**: Comunicación automatizada con usuarios
- **Flujo de IA**: Procesamiento inteligente de documentos

## Stack Tecnológico

### Frontend
- **JavaScript Vanilla**: Sin frameworks, máximo rendimiento
- **Webpack 5**: Bundling modular con múltiples entry points
- **SCSS**: Preprocesamiento de estilos
- **HTML5**: Templates semánticos y accesibles

### Backend
- **Node.js 20.17.0**: Runtime con soporte ES Modules
- **Express.js**: Framework web minimalista y flexible
- **PostgreSQL 16**: Base de datos relacional robusta
- **Knex.js**: Query builder y migration manager

### Librerías Principales
- **ExcelJS**: Generación de matrices en formato Excel
- **jsPDF + jsPDF-AutoTable**: Creación de documentos PDF
- **pdf-to-png-converter**: Conversión de PDFs a thumbnails PNG
- **sharp**: Optimización y redimensionamiento de imágenes
- **JWT**: Autenticación basada en tokens
- **Bcrypt**: Hash seguro de contraseñas
- **Axios**: Cliente HTTP para APIs externas
- **@aws-sdk/client-s3**: Integración con DigitalOcean Spaces

### DevOps
- **Docker & Docker Compose**: Containerización y orquestación
- **Nodemon**: Hot-reload en desarrollo
- **Concurrently**: Ejecución paralela de procesos
- **ESLint**: Linting y calidad de código

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: v20.17.0 o superior ([Descargar](https://nodejs.org/))
- **npm**: v10 o superior (incluido con Node.js)
- **PostgreSQL**: v16 o superior ([Descargar](https://www.postgresql.org/download/))
- **Docker** (opcional): Para desarrollo con contenedores ([Descargar](https://www.docker.com/))
- **Git**: Para control de versiones ([Descargar](https://git-scm.com/))

### Verificación de Requisitos

```bash
node --version  # Debe ser >= v20.17.0
npm --version   # Debe ser >= v10.x
psql --version  # Debe ser >= v16.x
docker --version # (Opcional)
```

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/aframirez177/dev_genesys_laboral_medicine.git
cd dev_genesys_laboral_medicine
```

### 2. Instalar Dependencias

El proyecto utiliza un sistema de workspaces con tres niveles:
- **Root**: Scripts principales y herramientas compartidas
- **Client**: Frontend vanilla JavaScript
- **Server**: Backend Node.js/Express

```bash
# Instalar todas las dependencias (root, client y server)
npm install
```

Este comando ejecuta automáticamente:
- `npm install` en el directorio raíz
- `npm run client:install` para instalar dependencias del cliente
- `npm run server:install` para instalar dependencias del servidor

#### Instalación Manual (alternativa)

Si prefieres instalar por separado:

```bash
# Solo dependencias del cliente
npm run client:install

# Solo dependencias del servidor
npm run server:install
```

### 3. Configurar Base de Datos

#### Opción A: PostgreSQL Local

1. Crear base de datos:
```bash
psql -U postgres
CREATE DATABASE genesys_laboral_medicine;
\q
```

2. Configurar variables de entorno:
```bash
# Crear archivo .env en la carpeta server
cp server/.env.example server/.env
```

3. Editar `server/.env` con tus credenciales:
```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=genesys_laboral_medicine

# Configuración del Servidor
NODE_ENV=development
SERVER_HOST=localhost
PORT=3000

# URLs
FRONTEND_URL=http://localhost:8080

# JWT
JWT_SECRET=tu_secret_key_seguro

# DigitalOcean Spaces (Opcional)
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=tu_access_key
DO_SPACES_SECRET=tu_secret_key
DO_SPACES_BUCKET=tu_bucket_name

# WhatsApp API (Opcional)
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_TOKEN=tu_token
```

4. Ejecutar migraciones:
```bash
npx knex migrate:latest --knexfile knexfile.js
```

#### Opción B: Docker Compose

1. Crear archivo `.env` en la raíz del proyecto:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=genesys_laboral_medicine
```

2. Crear `server/.env` con la configuración del servidor (ver Opción A)

3. Iniciar servicios:
```bash
docker-compose up -d
```

4. Ejecutar migraciones:
```bash
docker-compose exec api npx knex migrate:latest --knexfile knexfile.js
```

## Comandos de Desarrollo

### Desarrollo Local

```bash
# Ejecutar cliente y servidor simultáneamente (recomendado)
npm run dev

# Ejecutar solo el cliente (Webpack Dev Server en puerto 8080)
npm run client:dev

# Ejecutar solo el servidor (Nodemon en puerto 3000)
npm run server:dev

# Iniciar solo el servidor en modo normal
npm start
```

### Build y Producción

```bash
# Build completo (cliente + servidor)
npm run build

# Build solo del cliente (genera dist/ con assets optimizados)
npm run client:build

# Build solo del servidor
npm run server:build

# Desplegar (ejecuta build y deploy del cliente)
npm run deploy
```

### Gestión de Base de Datos

```bash
# Ejecutar migraciones pendientes
npx knex migrate:latest --knexfile knexfile.js

# Revertir última migración
npx knex migrate:rollback --knexfile knexfile.js

# Crear nueva migración
npx knex migrate:make nombre_migracion --knexfile knexfile.js

# Ver estado de migraciones
npx knex migrate:status --knexfile knexfile.js
```

### Docker

```bash
# Iniciar servicios en modo detached
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir contenedores
docker-compose up --build

# Eliminar volúmenes (⚠️ borra datos de la BD)
docker-compose down -v
```

### Utilidades

```bash
# Limpiar puerto 3000 si está ocupado
npm run clean

# Ejecutar tests (servidor)
cd server && npm test

# Linting
npm run lint
```

## Estructura del Proyecto

```
dev_genesys_laboral_medicine/
├── client/                          # Frontend Application
│   ├── public/                      # Static assets
│   │   ├── pages/                   # HTML templates
│   │   │   ├── index.html
│   │   │   ├── diagnostico_interactivo.html
│   │   │   ├── resultados.html
│   │   │   └── ...
│   │   ├── assets/                  # Images, fonts, PDFs
│   │   └── favicon.ico
│   ├── src/                         # Source code
│   │   ├── main.js                  # Common entry point (shared bundle)
│   │   ├── index.js                 # Homepage entry
│   │   ├── main_*.js                # Page-specific entry points
│   │   ├── js/
│   │   │   ├── components/          # Reusable UI components
│   │   │   │   ├── form_matriz_riesgos_prof.js
│   │   │   │   ├── resultadosComponent.js
│   │   │   │   └── ...
│   │   │   └── utils/               # Frontend utilities
│   │   └── styles/                  # SCSS stylesheets
│   │       ├── main.scss
│   │       └── components/
│   ├── dist/                        # Build output (generated)
│   ├── webpack.config.js            # Webpack configuration
│   └── package.json
│
├── server/                          # Backend Application
│   ├── src/
│   │   ├── app.js                   # Express app entry point
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js          # Knex connection
│   │   │   ├── env.js               # Environment loader
│   │   │   └── whatsappConfig.js
│   │   ├── controllers/             # Request handlers
│   │   │   ├── documentos.controller.js
│   │   │   ├── matrizRiesgos.controller.js
│   │   │   └── ...
│   │   ├── routes/                  # Express routes
│   │   │   ├── documentos.routes.js
│   │   │   ├── matrizRiesgos.routes.js
│   │   │   └── index.js
│   │   ├── services/                # Business logic layer
│   │   │   ├── excelService.js
│   │   │   ├── pdfService.js
│   │   │   ├── storageService.js
│   │   │   └── ...
│   │   ├── utils/                   # Backend utilities
│   │   └── database/
│   │       ├── init.js              # DB initialization
│   │       └── migrations/          # Knex migrations (.cjs)
│   ├── .env                         # Environment variables (gitignored)
│   ├── dist/                        # Build output (generated)
│   └── package.json
│
├── scripts/                         # Build and utility scripts
│   ├── fix-inline-css-paths.js     # Post-build CSS path fixer
│   └── clean-ports.js              # Port cleanup utility
│
├── knexfile.js                      # Knex configuration (root level)
├── docker-compose.yml               # Docker orchestration
├── Dockerfile                       # Container definition
├── .nvmrc                          # Node version (20.17.0)
├── .gitignore
├── package.json                     # Root package.json (workspaces)
├── CLAUDE.md                       # Claude Code instructions
└── README.md                       # This file
```

### Arquitectura de Aplicación

#### Multi-Page Architecture

El frontend utiliza una arquitectura multi-página con bundling modular:

- **Shared Bundle (`main.js`)**: Código común compartido por todas las páginas
- **Page Bundles**: Cada página HTML tiene su propio entry point (`main_*.js`)
- **Code Splitting**: Webpack separa automáticamente código común y específico
- **Lazy Loading**: Recursos cargados bajo demanda para optimizar rendimiento

#### Backend API Routes

```
/api/
├── /matriz-riesgos          # POST: Crear matriz de riesgos
├── /documentos
│   ├── POST /               # Generar documentos (PDF/Excel)
│   ├── GET /status/:token   # Consultar estado de generación
│   └── GET /download/:id    # Descargar documento
├── /whatsapp                # Integración WhatsApp
├── /flujo-ia                # Procesamiento AI
└── /health                  # Health check
```

## Características de SST

### Profesiograma y Matriz de Riesgos

El módulo principal permite:

1. **Crear Cargos**: Definir cargos con áreas, zonas y número de trabajadores
2. **Evaluar Riesgos**: Seleccionar GES (Grupos de Exposición Similar) por cargo
3. **Calcular Niveles de Riesgo**: Metodología GTC 45 con niveles de:
   - **Deficiencia**: N/A (0), Bajo (2), Medio (6), Alto/Muy Alto (10)
   - **Exposición**: Esporádica (1), Ocasional (2), Frecuente (3), Continua (4)
   - **Consecuencia**: Leve (10), Grave (25), Muy Grave (60), Mortal (100)
4. **Definir Controles**: Controles en fuente, medio e individuo
5. **Generar Documentos**: Excel con matriz completa y PDF con profesiogramas

### Cumplimiento Normativo

El sistema genera documentos conformes a:
- **Resolución 1843 de 2017**: Profesiogramas
- **GTC 45**: Metodología de identificación de peligros y valoración de riesgos

## Despliegue

### Producción con Docker

```bash
# 1. Configurar variables de entorno
cp server/.env.example server/.env
# Editar server/.env con valores de producción

# 2. Build de imágenes
docker-compose build

# 3. Iniciar servicios
docker-compose up -d

# 4. Ejecutar migraciones
docker-compose exec api npx knex migrate:latest --knexfile knexfile.js

# 5. Verificar estado
docker-compose ps
docker-compose logs -f api
```

### Producción Manual

```bash
# 1. Build del proyecto
npm run build

# 2. Ejecutar migraciones
npx knex migrate:latest --knexfile knexfile.js --env production

# 3. Iniciar servidor (con PM2 recomendado)
cd server
pm2 start dist/app.js --name genesys-api

# 4. Servir cliente con Nginx/Apache
# Los archivos estáticos están en client/dist/
```

### Variables de Entorno de Producción

Asegúrate de configurar:

```env
NODE_ENV=production
DB_HOST=tu_host_produccion
DB_PASSWORD=password_seguro
JWT_SECRET=secret_muy_seguro_aleatorio
FRONTEND_URL=https://genesyslm.com.co
```

## Documentación Adicional

- **[CLAUDE.md](CLAUDE.md)**: Instrucciones para Claude Code
- **[DIAGNOSTICO_DOCUMENTOS_ARQUITECTURA.md](DIAGNOSTICO_DOCUMENTOS_ARQUITECTURA.md)**: Análisis detallado de arquitectura
- **Knexfile**: Ver `knexfile.js` para configuración de base de datos
- **Webpack Config**: Ver `client/webpack.config.js` para configuración de bundling

## Soporte y Contribuciones

### Reportar Issues

Si encuentras un bug o tienes una sugerencia:

1. Verifica que no exista un issue similar en [GitHub Issues](https://github.com/aframirez177/dev_genesys_laboral_medicine/issues)
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs. actual
   - Screenshots si aplica
   - Información del entorno (OS, Node version, etc.)

### Contribuir al Código

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Desarrollo

- Usa ES Modules en el backend (imports con extensión `.js`)
- Sigue las convenciones de código existentes
- Escribe comentarios claros para lógica compleja
- Actualiza la documentación cuando sea necesario
- Ejecuta tests antes de hacer commit

## Tecnologías y Herramientas

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Runtime | Node.js | 20.17.0 |
| Base de Datos | PostgreSQL | 16+ |
| Query Builder | Knex.js | 3.1.0 |
| Framework Backend | Express | Latest |
| Bundler Frontend | Webpack | 5.x |
| Generación Excel | ExcelJS | 4.4.0 |
| Generación PDF | jsPDF + jsPDF-AutoTable | 2.5.1 + 3.8.4 |
| PDF a Imágenes | pdf-to-png-converter | Latest |
| Procesamiento Imágenes | sharp | Latest |
| Cloud Storage | @aws-sdk/client-s3 | Latest |
| Autenticación | JWT | 9.0.2 |
| Seguridad Password | Bcrypt | 5.1.1 |
| HTTP Client | Axios | 1.7.9 |
| Containerización | Docker | Latest |

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Autor

**Álvaro Ramírez**
Email: af.ramirez1772@gmail.com
GitHub: [@aframirez177](https://github.com/aframirez177)

## Enlaces

- **Sitio Web**: [https://genesyslm.com.co](https://genesyslm.com.co)
- **Repositorio**: [https://github.com/aframirez177/dev_genesys_laboral_medicine](https://github.com/aframirez177/dev_genesys_laboral_medicine)
- **Issues**: [https://github.com/aframirez177/dev_genesys_laboral_medicine/issues](https://github.com/aframirez177/dev_genesys_laboral_medicine/issues)

---

**Genesys Laboral Medicine** - Gestión profesional de Salud y Seguridad en el Trabajo
