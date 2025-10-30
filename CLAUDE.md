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
│   ├── spaces.js      # DigitalOcean Spaces upload utility
│   └── pdfThumbnail.js # PDF thumbnail generation (pdf-to-png + sharp)
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

### Design System

**Color Palette** (defined in `_variables.scss`):
- Primary: `#5dc4af` (verde agua) - Botones principales, enlaces, acciones primarias
- Secondary: `#383d47` (gris oscuro) - Títulos, texto importante
- Text: `#2d3238` - Texto general
- Background: `#f3f0f0` - Fondo general
- Success: `#4caf50` - Estados exitosos, botones de descarga
- Warning: `#ffeb3b` - Alertas
- Attention: `#ff9800` - Atención
- Danger: `#f44336` - Errores, estados críticos

**Typography System**:
- Base: `html { font-size: 62.5%; }` → 1rem = 10px
- Title Font: Poppins (weights: 400, 500, 600, 700, 800)
- Body Font: Raleway (weights: 400, 500, 600, 700, 800)
- Scale: Use rem units for all sizes (1.4rem = 14px, 1.6rem = 16px, 2.4rem = 24px, etc.)

**Design Principles**:
- NO gradients (use solid colors from the palette)
- Clean, professional design
- Adequate whitespace
- Consistent border-radius (8px-16px)
- Smooth transitions (0.3s ease)

## PDF Thumbnail Generation

The system generates thumbnails for PDF documents to display in the results page:

**Technology Stack**:
- `pdf-to-png-converter`: Converts PDF first page to PNG buffer
- `sharp`: Optimizes and resizes images to JPEG format

**Implementation** (`server/src/utils/pdfThumbnail.js`):
```javascript
import { pdfToPng } from 'pdf-to-png-converter';
import sharp from 'sharp';

// Generates 400px wide JPEG thumbnails at 85% quality
// Processes only first page for performance
// Returns optimized buffer ready for upload to Spaces
```

**Usage in Flow**:
1. PDF documents are generated (profesiograma, perfil, cotización)
2. Thumbnails are generated in parallel from PDF buffers
3. Both original PDFs and thumbnails are uploaded to DigitalOcean Spaces
4. Thumbnail URLs are stored in database alongside document URLs
5. Frontend displays thumbnails in result cards

**Data Structure**:
```javascript
preview_urls: {
  matriz: "url_to_excel",
  profesiograma: "url_to_pdf",
  perfil: "url_to_pdf",
  cotizacion: "url_to_pdf",
  thumbnails: {
    profesiograma: "url_to_thumbnail.jpg",
    perfil: "url_to_thumbnail.jpg",
    cotizacion: "url_to_thumbnail.jpg"
    // Note: matriz doesn't have thumbnail (Excel file)
  }
}
```

## Results Page System

**Key Features**:
- Optimized polling: Cards render only once (no flickering on status checks)
- Clean design: No gradients, uses project color palette
- Thumbnail previews: Real PDF thumbnails, not placeholder icons
- Minimal data display: Only essential info (price, company, document name, cargo count)

**Frontend Component** (`client/src/js/components/resultadosComponent.js`):
- `isFirstRender` flag prevents unnecessary re-renders during polling
- `ShoppingCart` class manages cart state and UI updates
- `DocumentCard` class renders simplified cards with thumbnails
- Polling continues until final state (pagado/completed/failed)

## Thumbnail Generation System

**Architecture**: Hybrid strategy using different tools for optimal results

**Implementation** (`server/src/controllers/flujoIa.controller.js`):

```javascript
// Excel: Puppeteer for HTML rendering
generateExcelThumbnail(matrizBuffer, {
    width: 800,
    quality: 95,
    maxRows: 12,
    maxCols: 8  // Zoom to top-left corner
});

// PDFs: pdf-to-png-converter (faster than Puppeteer)
generatePDFThumbnailFast(pdfBuffer, {
    width: 600,
    cropHeader: true,  // Show 35% of top (header + table start)
    quality: 95,
    viewportScale: 3.5-4.0  // High resolution for text clarity
});
```

**Why This Strategy?**
1. **Puppeteer cannot open PDFs directly** with `page.goto('file://...')`
2. **pdf-to-png-converter is 3-5x faster** than Puppeteer for PDF rendering
3. **Puppeteer excels at HTML** - perfect for Excel → HTML → Screenshot
4. **Result**: 2-3 seconds total (vs 15+ seconds with pure Puppeteer)

**Critical Requirements**:
- **All PDFs must use Poppins fonts** (not helvetica)
  - Why? pdf-to-png-converter doesn't render helvetica text from jsPDF
  - Solution: Import `addPoppinsFont()` in all PDF controllers

```javascript
// profesiograma.controller.js, perfil-cargo.controller.js, cotizacion.controller.js
import { addPoppinsFont } from "../utils/poppins-font-definitions.js";

const doc = new jsPDF('p', 'mm', 'a4');
addPoppinsFont(doc);
doc.setFont('Poppins', 'normal');  // NOT 'helvetica'
```

**Utilities**:
- `server/src/utils/pdfThumbnail.js`: Fast PDF → PNG → JPEG converter
- `server/src/utils/documentThumbnail.js`: Puppeteer-based for Excel and fallback

**Quality Parameters**:
- Width: 600-800px (balanced between quality and file size)
- JPEG Quality: 95% (high quality, mozjpeg compression)
- ViewportScale: 3.5-4.0 (2x-3x higher than default for text clarity)
- NO sharpen filter (causes paleness/washing out of colors)

**Expected Output Sizes**:
- Profesiograma: ~30-35 KB
- Perfil de Cargo: ~28-32 KB
- Cotización: ~32-38 KB
- Matriz Excel: ~60-70 KB

## Important Notes

- Node.js version: 18.20.4 or higher (see `.nvmrc`)
- The server uses ES modules, so imports must use `.js` extensions
- Webpack config is in CommonJS format, located at `client/webpack.config.js`
- Migration files use `.cjs` extension to work with Knex in ES module environment
- Port 3000 conflicts are handled automatically by incrementing the port
- Production domain: https://genesyslm.com.co
- The `postclientbuild` script fixes inline CSS paths after webpack build
- PDF thumbnail generation requires sufficient memory (recommend 512MB+ for Node process)
