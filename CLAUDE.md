# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Genesys Laboral Medicine is a comprehensive occupational health and workplace safety management system. It consists of a vanilla JavaScript frontend and Node.js/Express backend with PostgreSQL database.

**Tech Stack:**
- Frontend: Vanilla JavaScript with Webpack bundler
- Backend: Node.js (ES modules), Express
- Database: PostgreSQL (with Knex.js ORM)
- Deployment: Docker with docker-compose

## Development Commands

### Installation
```bash
# Install all dependencies (root, client, and server)
npm install

# Install client dependencies only
npm run client:install

# Install server dependencies only
npm run server:install
```

### Development
```bash
# Run both client and server in watch mode
npm run dev

# Run only client in watch mode
npm run client:dev

# Run only server in watch mode
npm run server:dev

# Clean ports (if port 3000 is in use)
npm run clean
```

### Build
```bash
# Build entire project (client + server)
npm run build

# Build only client
npm run client:build

# Build only server
npm run server:build
```

### Database
```bash
# Run migrations
npx knex migrate:latest --knexfile knexfile.js

# Rollback migrations
npx knex migrate:rollback --knexfile knexfile.js

# Create new migration
npx knex migrate:make migration_name --knexfile knexfile.js
```

### Docker
```bash
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build
```

### Testing
```bash
# Run tests (server)
cd server && npm test
```

## Architecture

### Backend Structure
```
server/src/
├── app.js              # Main Express application entry point
├── config/
│   ├── database.js     # Knex database connection
│   ├── env.js          # Environment variable loader
│   └── whatsappConfig.js
├── controllers/        # Request handlers for routes
├── routes/            # Express route definitions
├── services/          # Business logic layer
├── utils/             # Utility functions
└── database/
    ├── init.js        # Database initialization
    └── migrations/    # Knex migration files
```

**Key Backend Details:**
- Uses ES modules (`"type": "module"` in package.json)
- Server runs on port 3000 by default
- Database connection via Knex with configuration in root-level `knexfile.js`
- CORS configured for multiple origins (localhost, production domains)
- File upload middleware enabled with 20MB limit
- Environment variables loaded from `server/.env`

### Frontend Structure
```
client/src/
├── main.js            # Common entry point for all pages
├── index.js           # Homepage entry point
├── main_*.js          # Page-specific entry points
├── js/
│   ├── components/    # Reusable UI components
│   └── utils/         # Frontend utilities
├── styles/            # SCSS stylesheets
└── assets/
    ├── images/
    ├── fonts/
    └── pdf/
```

**Key Frontend Details:**
- Vanilla JavaScript (no framework)
- Webpack for bundling with multiple entry points
- Each major page has its own entry point (e.g., `main_matriz_riesgos_profesional.js`)
- Webpack generates separate bundles per page for optimization
- HTML templates in `client/public/` directory
- SCSS compiled to CSS via webpack loaders
- Production build outputs to `dist/` directory

### Database
- PostgreSQL database
- Managed via Knex.js query builder
- Migration files in `server/src/database/migrations/`
- Connection configured in `knexfile.js` at root level
- Supports both development and production environments
- Production uses SSL connection with `rejectUnauthorized: false`

### Routing Pattern
The application follows a multi-page architecture where:
- Each HTML page in `client/public/pages/` has a corresponding `main_*.js` entry point
- Webpack generates separate bundles for each page
- All pages share a common `main.js` bundle for shared functionality
- Routes are defined in separate files under `server/src/routes/`
- Controllers handle business logic in `server/src/controllers/`

### API Endpoints
Main API routes:
- `/api/matriz-riesgos` - Risk matrix management
- `/api/documentos` - Document handling
- `/api/whatsapp` - WhatsApp integration
- `/api/flujo-ia` - AI workflow integration
- `/api/health` - Health check endpoint

## Environment Configuration

### Server Environment Variables (server/.env)
Required variables:
- `DB_HOST` - Database host
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `NODE_ENV` - Environment (development/production)
- `SERVER_HOST` - Server IP/hostname
- `FRONTEND_URL` - Frontend URL for CORS

### Docker Environment (root .env)
For docker-compose:
- `POSTGRES_USER` - PostgreSQL user
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_DB` - PostgreSQL database name

## Build Process

The build process includes:
1. Client webpack build with production optimizations
2. CSS extraction and minification (via Beasties plugin)
3. Terser for JS minification
4. Asset optimization (images, fonts, PDFs)
5. Sitemap generation for SEO
6. Post-build CSS path fixes via `scripts/fix-inline-css-paths.js`

## UI/UX Guidelines

This project follows comprehensive UI/UX design principles defined in `.cursor/rules/ui.mdc`:

- **Accessibility**: Follow WCAG 2.1 AA standards, use semantic HTML, ensure keyboard navigation
- **Responsive Design**: Mobile-first approach, fluid layouts with CSS Grid/Flexbox, minimum 44x44px touch targets
- **Performance**: Optimize images, lazy loading, code splitting, monitor Core Web Vitals
- **Visual Design**: Clear hierarchy, cohesive color palette, sufficient contrast, consistent typography
- **User Feedback**: Loading indicators, clear error messages, analytics tracking

## Important Notes

- Node.js version: 18.20.4 or higher (see `.nvmrc`)
- The server uses ES modules, so imports must use `.js` extensions
- Webpack config is in CommonJS format, located at `client/webpack.config.js`
- Migration files use `.cjs` extension to work with Knex in ES module environment
- Port 3000 conflicts are handled automatically by incrementing the port
- Production domain: https://genesyslm.com.co
- The `postclientbuild` script fixes inline CSS paths after webpack build
