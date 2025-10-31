<!-- fc806712-f7e2-40a7-950b-acc426cc79f1 65032d1e-47d7-4aff-888f-9c9a73e69049 -->
# Plan de Implementación: Dashboard SST - Genesys Laboral Medicine

## Contexto del Proyecto

Sistema integral de gestión SST que actualmente genera documentos (matriz de riesgos, profesiogramas, perfiles de cargo) mediante formularios web. El objetivo es crear un dashboard moderno donde:

- **Empresas** gestionen sus documentos, cargos y riesgos de forma visual
- **Médicos** revisen y aprueben exámenes y recomendaciones antes de publicar
- **Admins** tengan acceso total al sistema
- Todos visualicen información de forma user-friendly (más allá de PDFs/Excel)

### Arquitectura Actual

- Frontend: Vanilla JS con Webpack (multi-página)
- Backend: Node.js + Express + PostgreSQL
- Auth existente: Tablas `users`, `empresas`, `roles` con password_hash
- Documentos: Sistema de tokens + almacenamiento en DigitalOcean Spaces

---

## FASE 1: Fundamentos del Dashboard (Implementación Actual)

### 1.1 Sistema de Autenticación

**Objetivo:** Login/logout seguro con JWT + cookies HTTP-only

#### Backend - Endpoints Auth

**Archivo nuevo:** `server/src/routes/auth.routes.js`

- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/logout` - Logout (invalidar sesión)
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/refresh` - Renovar token

**Archivo nuevo:** `server/src/controllers/auth.controller.js`

- Validación de credenciales (bcrypt)
- Generación de JWT (access token 15min, refresh token 7d)
- Middleware de autenticación
- Verificación de roles

**Archivo nuevo:** `server/src/middleware/auth.middleware.js`

- `authenticate()` - Verificar JWT válido
- `authorize(['empresa', 'medico', 'admin'])` - Verificar rol

**Migraciones necesarias:**

- `20251101000000_add_refresh_tokens_table.cjs` - Tabla para refresh tokens
- `20251101000001_add_last_login_to_users.cjs` - Tracking de sesiones

#### Frontend - Páginas Auth

**Página nueva:** `client/public/pages/login.html`

- Formulario minimalista con email/password
- Link a "Olvidé mi contraseña"
- Redirección automática si ya está logueado

**JS nuevo:** `client/src/js/auth/login.js`

- Validación de formulario
- Llamada a API `/api/auth/login`
- Guardar tokens en cookies (manejado por backend)
- Redirección a dashboard según rol

**Página nueva:** `client/public/pages/recuperar-password.html`

- Formulario con email
- Envío de link de recuperación

**Estilos:** `client/src/styles/scss/pages/_auth.scss`

- Diseño minimalista siguiendo DESIGN_VISION.md
- Colores: primary #5dc4af, secondary #383d47
- Sin gradientes, responsive mobile-first

---

### 1.2 Estructura del Dashboard

**Objetivo:** Layout base con sidebar, navbar, y sistema de rutas

#### Frontend - Layout Principal

**Página nueva:** `client/public/pages/dashboard.html`

- Estructura: sidebar colapsable + navbar + content area
- Placeholders para diferentes vistas
- Sistema de notificaciones (badge)

**JS nuevo:** `client/src/js/dashboard/layout.js`

- Manejo de colapso sidebar
- Navegación entre vistas sin recargar (SPA-like con History API)
- Carga dinámica de componentes según ruta

**JS nuevo:** `client/src/js/dashboard/router.js`

- Sistema de rutas: `/dashboard`, `/dashboard/documentos`, `/dashboard/perfil-cargo`
- Lazy loading de componentes
- Protección de rutas por rol

**Componentes del Layout:**

1. **Sidebar** (`client/src/js/dashboard/components/Sidebar.js`)

   - Navegación principal:
     - 🏠 Inicio (resumen ejecutivo)
     - 📄 Mis Documentos
     - 👔 Perfiles de Cargo (preparado para fase 3)
     - 🩺 Exámenes Médicos (preparado para fase 4)
     - ⚙️ Configuración
   - Avatar + nombre usuario
   - Botón collapse
   - Logout

2. **Navbar** (`client/src/js/dashboard/components/Navbar.js`)

   - Breadcrumbs de navegación
   - Botón notificaciones (preparado)
   - Nombre empresa actual
   - Avatar usuario

**Estilos:** `client/src/styles/scss/layout/_dashboard.scss`

- Sidebar: 260px expandido, 60px colapsado
- Transitions suaves (0.3s ease)
- Responsive: sidebar overlay en mobile (<768px)
- Grid layout para content area

---

### 1.3 Vista de Inicio (Dashboard Home)

**Objetivo:** Resumen ejecutivo con KPIs y acceso rápido

#### Backend - Endpoint Stats

**Archivo nuevo:** `server/src/routes/dashboard.routes.js`

- `GET /api/dashboard/stats/:empresaId` - Estadísticas generales
- `GET /api/dashboard/alerts/:empresaId` - Alertas activas (preparado)

**Archivo nuevo:** `server/src/controllers/dashboard.controller.js`

- Calcular KPIs:
  - Total de documentos generados
  - Documentos pendientes de revisión médica
  - Cargos creados
  - Riesgos críticos (nivel alto/muy alto)
- Consultar últimas actividades

#### Frontend - Componente Home

**JS nuevo:** `client/src/js/dashboard/views/Home.js`

- Tarjetas KPI con iconos
- Gráfica simple (Chart.js o similar) de documentos por mes
- Lista de "Últimas actividades"
- Accesos rápidos:
  - "Crear nuevo documento"
  - "Ver todos los documentos"

**Diseño:**

- Cards con sombra sutil (box-shadow: 0 2px 8px rgba(0,0,0,0.08))
- Iconos: Feather Icons o Heroicons
- Colores de estado para KPIs (success, warning, danger)

---

### 1.4 Vista de Documentos (Migración)

**Objetivo:** Mostrar documentos existentes de forma visual con thumbnails

#### Backend - Endpoints Documentos

**Modificar:** `server/src/controllers/documentos.controller.js`

- `GET /api/documentos/empresa/:empresaId` - Lista de documentos de la empresa
  - Incluir: token, estado, fechas, thumbnails, metadata
  - Paginación y filtros (fecha, tipo)
- `GET /api/documentos/:documentoId` - Detalle completo de un documento
  - Incluir: cargos, riesgos, exámenes calculados

**Nuevo:** `GET /api/documentos/:documentoId/versions` - Historial de versiones (preparado para fase 2)

#### Frontend - Vista Documentos

**JS nuevo:** `client/src/js/dashboard/views/Documentos.js`

- Grid de cards con thumbnails (similar a resultados.html actual)
- Cada card muestra:
  - Thumbnail del PDF (ya generado por sistema actual)
  - Nombre documento
  - Fecha de generación
  - Estado (badge): "Generado", "Pendiente Revisión", "Aprobado"
  - Acciones:
    - 👁️ Ver detalles (modal o vista detalle)
    - ⬇️ Descargar (hover para mostrar opciones: PDF, Excel)
    - 📋 Copiar (preparado para plantillas)
- Filtros:
  - Por tipo: Matriz / Profesiograma / Perfil
  - Por fecha: Último mes, 3 meses, 6 meses, Todo
  - Por estado
- Botón flotante: "+ Generar nuevo documento"

**Modal Detalle:** `client/src/js/dashboard/components/DocumentoDetail.js`

- Tabs:
  - 📄 Información General (empresa, responsable, fecha, nº cargos)
  - 👔 Cargos (lista expandible con riesgos)
  - 🩺 Exámenes Sugeridos (tabla)
  - 📥 Descargas (links a PDF, Excel, thumbnails)
- Botón "Solicitar Modificación" (preparado)

**Estilos:** `client/src/styles/scss/views/_documentos.scss`

- Reutilizar estilos de `_resultados.scss` actual
- Adaptar para layout de dashboard
- Sin gradientes (DESIGN_VISION)

---

### 1.5 Integración con Sistema Actual

**Objetivo:** Conectar flujo actual (formulario → resultados) con dashboard

#### Modificaciones en Flujo Actual

**Modificar:** `client/public/pages/resultados.html`

- Agregar banner en la parte superior:
  - "¿Primera vez aquí? Crea tu cuenta para acceder al dashboard"
  - Botón: "Ir a Mi Dashboard" (si ya está logueado)
- Si usuario está logueado, mostrar link prominente a dashboard

**Modificar:** `server/src/controllers/flujoIa.controller.js`

- Al crear documento, verificar si usuario ya existe
- Si existe y está logueado, asociar documento automáticamente
- Enviar email con link directo al dashboard (además del token)

**Nuevo:** `server/src/services/email.service.js` (preparado)

- Templates de email:
  - Bienvenida con acceso al dashboard
  - Documento generado
  - Documento aprobado por médico

---

### 1.6 Configuración y Perfil de Usuario

**Objetivo:** Gestión básica de perfil de usuario/empresa

#### Backend - Endpoints Perfil

**Archivo nuevo:** `server/src/routes/perfil.routes.js`

- `GET /api/perfil/usuario` - Datos del usuario actual
- `PUT /api/perfil/usuario` - Actualizar datos personales (nombre, email)
- `PUT /api/perfil/password` - Cambiar contraseña
- `GET /api/perfil/empresa` - Datos de la empresa (solo lectura para rol empresa)

#### Frontend - Vista Configuración

**JS nuevo:** `client/src/js/dashboard/views/Configuracion.js`

- Secciones:

  1. **Mi Perfil**

     - Nombre, email
     - Botón "Cambiar contraseña"

  1. **Mi Empresa** (solo lectura)

     - Nombre legal, NIT
     - Nota: "Para modificar estos datos, contacte a soporte"

  1. **Preferencias** (preparado)

     - Notificaciones por email
     - Idioma (futuro)

---

## Estructura de Archivos a Crear/Modificar

### Backend (server/src/)

**Nuevos:**

```
routes/
  ├── auth.routes.js
  ├── dashboard.routes.js
  └── perfil.routes.js

controllers/
  ├── auth.controller.js
  ├── dashboard.controller.js
  └── perfil.controller.js (actualizar)

middleware/
  └── auth.middleware.js

services/
  ├── jwt.service.js
  └── email.service.js

database/migrations/
  ├── 20251101000000_add_refresh_tokens_table.cjs
  └── 20251101000001_add_last_login_to_users.cjs
```

**Modificados:**

- `controllers/documentos.controller.js` (agregar endpoints lista/detalle)
- `controllers/flujoIa.controller.js` (integrar con dashboard)

### Frontend (client/)

**Nuevos:**

```
public/pages/
  ├── login.html
  ├── recuperar-password.html
  └── dashboard.html

src/js/
  ├── auth/
  │   ├── login.js
  │   └── recuperar-password.js
  │
  ├── dashboard/
  │   ├── layout.js
  │   ├── router.js
  │   │
  │   ├── components/
  │   │   ├── Sidebar.js
  │   │   ├── Navbar.js
  │   │   └── DocumentoDetail.js
  │   │
  │   └── views/
  │       ├── Home.js
  │       ├── Documentos.js
  │       └── Configuracion.js
  │
  └── utils/
      ├── api.js (helper para fetch con auth)
      └── auth.js (verificar login, logout)

src/styles/scss/
  ├── pages/
  │   └── _auth.scss
  │
  ├── layout/
  │   └── _dashboard.scss
  │
  └── views/
      ├── _dashboard-home.scss
      ├── _documentos.scss
      └── _configuracion.scss
```

**Modificados:**

- `public/pages/resultados.html` (agregar banner dashboard)
- Agregar `main_dashboard.js` a webpack.config.js

### Configuración

**Modificar:** `webpack.config.js`

- Agregar entry point: `dashboard: './src/js/dashboard/layout.js'`

**Nuevo:** `.env.example` en server/

- Agregar variables:
  ```
  JWT_SECRET=tu_secret_muy_seguro
  JWT_ACCESS_EXPIRATION=15m
  JWT_REFRESH_EXPIRATION=7d
  ```


---

## Consideraciones de Diseño (DESIGN_VISION.md)

- ✅ **Sin gradientes**: Colores sólidos únicamente
- ✅ **Paleta**: Primary #5dc4af, Secondary #383d47, Text #2d3238
- ✅ **Tipografía**: Poppins (títulos), Raleway (body)
- ✅ **Espaciado**: Sistema basado en 8px (0.8rem, 1.6rem, 2.4rem, 3.2rem)
- ✅ **Border radius**: 8-12px elementos pequeños, 16px cards
- ✅ **Sombras**: 3 niveles (0 2px 8px, 0 4px 16px, 0 8px 24px) rgba(0,0,0,0.08-0.15)
- ✅ **Transiciones**: 0.3s ease para todo
- ✅ **Mobile-first**: Breakpoints 400px, 768px, 1080px
- ✅ **Accesibilidad**: Contraste 4.5:1, navegación por teclado, ARIA labels

---

## Testing y Validación

### Testing Manual (Checklist)

**Autenticación:**

- [ ] Login con credenciales válidas (empresa existente)
- [ ] Login con credenciales inválidas (error claro)
- [ ] Logout (redirección a login, tokens limpiados)
- [ ] Refresh token automático (al expirar access token)
- [ ] Protección de rutas (redirigir a login si no autenticado)

**Dashboard:**

- [ ] Sidebar colapsa/expande correctamente
- [ ] Navegación entre vistas sin recargar página
- [ ] Responsive en mobile (sidebar overlay)
- [ ] KPIs muestran datos correctos
- [ ] Última actividad actualizada

**Documentos:**

- [ ] Lista muestra todos los documentos de la empresa
- [ ] Filtros funcionan correctamente
- [ ] Thumbnails cargan correctamente
- [ ] Descarga de PDFs/Excel funciona
- [ ] Modal de detalle muestra información completa
- [ ] Botón "Generar nuevo" redirige al formulario actual

**Perfil:**

- [ ] Datos del usuario cargan correctamente
- [ ] Cambio de contraseña funciona
- [ ] Datos de empresa en solo lectura

### Testing de Seguridad

- [ ] Tokens en cookies HTTP-only (no accesibles por JS)
- [ ] CSRF protection (si aplica)
- [ ] Validación de roles en backend (no solo frontend)
- [ ] SQL injection prevention (usar prepared statements)
- [ ] XSS prevention (sanitizar inputs)

---

## Próximos Pasos (Fases Futuras)

### FASE 2: Gestión Avanzada de Documentos (2-3 semanas)

- Visualización user-friendly de matrices (tabla interactiva)
- Visualización de profesiogramas (cards por cargo)
- Historial de versiones
- Sistema de comentarios/notas
- Notificaciones en tiempo real (WebSockets)

### FASE 3: Perfiles de Cargo Avanzados (3-4 semanas)

- Vista detallada de cargo (más info: herramientas, horario, etc.)
- Copiar GES entre cargos (plantillas)
- Migrar configuraciones (GES, exámenes, precios) de JS a BD
- Mejoras en lógica de sugerencia de exámenes

### FASE 4: Panel Médico (2-3 semanas)

- Dashboard médico con permisos diferenciados
- Check/uncheck exámenes antes de aprobar
- Editar recomendaciones y EPPs
- Sistema de alertas (vencimientos, riesgos altos)
- Aprobación de documentos

### FASE 5: Estructura Organizacional (3-4 semanas)

- Editor visual tipo Canva (drag & drop)
- Conectar cargos para crear jerarquías
- Visualización de organigrama
- Exportar organigrama como imagen

---

## Estimación de Tiempo - FASE 1

| Tarea | Tiempo Estimado |

|-------|-----------------|

| 1.1 Sistema de Autenticación | 5-6 días |

| 1.2 Estructura del Dashboard | 4-5 días |

| 1.3 Vista de Inicio | 2-3 días |

| 1.4 Vista de Documentos | 5-6 días |

| 1.5 Integración con Sistema Actual | 2-3 días |

| 1.6 Configuración y Perfil | 2-3 días |

| Testing y Ajustes | 3-4 días |

| **TOTAL FASE 1** | **23-30 días (~4-6 semanas)** |

---

## Notas Importantes

1. **No tocar pacientes**: El rol "paciente" tendrá su propio dashboard separado ("Mis Historias Clínicas"), no forma parte de este plan.

2. **Versionado**: Cada actualización genera un nuevo documento (no sobrescribe), mantener historial completo.

3. **Permisos claros**:

   - Empresa: Edita info de cargos, genera documentos
   - Médico: Edita exámenes, recomendaciones médicas, EPPs
   - Admin: Acceso total

4. **Migrar a BD progresivamente**: En Fase 3 mover GES_DATOS_PREDEFINIDOS, EXAM_DETAILS, EXAM_CONFIG de JS a PostgreSQL.

5. **Documentos siguen generándose**: El flujo actual (formulario → backend → PDF/Excel) NO cambia, solo se agrega visualización en dashboard.

6. **Call to Action en resultados**: Invitar a usuarios nuevos a crear cuenta y acceder al dashboard premium.

---

*Plan creado considerando arquitectura actual, base de datos existente, y visión de diseño del proyecto (DESIGN_VISION.md). Prioriza entrega incremental con valor agregado en cada fase.*

### To-dos

- [ ] Crear sistema de autenticación backend (routes, controllers, middleware, migraciones para refresh tokens)
- [ ] Crear páginas de login y recuperación de contraseña con estilos minimalistas
- [ ] Implementar estructura base del dashboard (sidebar colapsable, navbar, router SPA-like)
- [ ] Crear vista de inicio con KPIs y resumen ejecutivo
- [ ] Crear endpoints para listar y obtener detalles de documentos por empresa
- [ ] Implementar vista de documentos con cards, thumbnails, filtros y modal de detalle
- [ ] Integrar dashboard con flujo actual (banner en resultados, asociación automática de documentos)
- [ ] Crear vista de configuración y gestión de perfil de usuario
- [ ] Realizar testing completo de autenticación, navegación, documentos y permisos