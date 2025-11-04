# Changelog - Mejoras de Desarrollo y Staging

## [2025-11-02] - Configuración de Desarrollo y Staging

### 🚀 Nuevas Características

#### Hot Reload en Desarrollo Local
- ✅ Configurado **webpack-dev-server** con hot module replacement (HMR)
- ✅ Frontend ahora corre en `http://localhost:8080` con auto-reload
- ✅ Backend en `http://localhost:3000` (sin cambios)
- ✅ Proxy automático de `/api` requests del frontend al backend
- ✅ El navegador se abre automáticamente al ejecutar `npm run dev`
- ✅ Cambios en JS, CSS, HTML se reflejan instantáneamente sin F5

#### Ambiente Staging/Beta
- ✅ Documentación completa en **STAGING_SETUP.md**
- ✅ Template de configuración `.env.staging.example`
- ✅ Guía paso a paso para configurar subdominio en DigitalOcean
- ✅ Guía alternativa para configurar subdominio en GoDaddy
- ✅ Configuración de Nginx para staging con SSL
- ✅ Estrategia de deployment automático con GitHub Actions
- ✅ Mejores prácticas de Git branching (main ← staging ← develop)

---

### 🔧 Cambios Técnicos

#### Archivos Modificados

**1. `client/webpack.config.js`**
```diff
+ Agregada sección devServer con configuración completa
+ publicPath: '/' para rutas correctas
+ static: servir public/ y src/assets/
+ port: 8080
+ hot: true (Hot Module Replacement)
+ open: true (abre navegador automáticamente)
+ proxy: ['/api'] → http://localhost:3000
+ historyApiFallback: soporte para SPA routing
+ client.overlay: mostrar errores en pantalla
```

**2. `client/package.json`**
```diff
- "dev": "webpack --mode development --watch"
+ "dev": "webpack serve --mode development"
+ "build:watch": "webpack --mode development --watch"
```

**Antes:**
- `npm run dev` → solo compilaba y hacía watch (sin servidor)
- Tenías que servir los archivos manualmente con Live Server o similar
- Cambios requerían refresh manual (F5)

**Ahora:**
- `npm run dev` → inicia servidor en puerto 8080 con hot reload
- Cambios se reflejan automáticamente en el navegador
- APIs proxied automáticamente a localhost:3000

**3. `CLAUDE.md`**
```diff
+ Sección "Deployment & Environments" agregada
+ Documentación de 3 ambientes (development, staging, production)
+ Actualización de instrucciones de desarrollo con hot reload
+ Referencia a STAGING_SETUP.md
```

**4. `README.md`**
```diff
+ Actualizada sección "Desarrollo Local" con info de hot reload
+ Agregada subsección "Ambientes"
+ Referencia a STAGING_SETUP.md en documentación adicional
```

#### Archivos Creados

**1. `.env.staging.example`**
- Template de variables de entorno para ambiente staging
- Configuración de DB separada (recomendado)
- PayU en modo TEST
- URLs apuntando a subdominio beta
- Bucket de Spaces separado (recomendado)
- LOG_LEVEL=debug para debugging

**2. `STAGING_SETUP.md` (Guía completa 500+ líneas)**
- ¿Qué es un ambiente staging?
- Configuración de subdominio en DigitalOcean (paso a paso)
- Configuración alternativa en GoDaddy
- Setup de Nginx con SSL (Certbot)
- Configuración de PM2 para staging
- Deployment manual y automático (GitHub Actions)
- Estrategia de Git branching
- Mejores prácticas
- Troubleshooting común
- Comandos de referencia rápida

**3. `CHANGELOG_2025.md`** (este archivo)
- Registro de todos los cambios realizados

---

### 📝 Comandos Actualizados

#### Desarrollo Local

**Antes:**
```bash
npm run dev  # Solo watch, sin servidor
# Necesitabas Live Server de VS Code o similar
```

**Ahora:**
```bash
npm run dev  # Webpack dev server + backend
# ✅ http://localhost:8080 (frontend con hot reload)
# ✅ http://localhost:3000 (backend API)
# ✅ Auto-refresh al guardar cambios
```

#### Nuevo Workflow de Desarrollo

```bash
# 1. Desarrollo local
git checkout develop
git pull origin develop
npm run dev  # Auto-abre http://localhost:8080

# 2. Feature development
git checkout -b feature/nueva-funcionalidad
# ... desarrollo con hot reload ...
git commit -m "feat: nueva funcionalidad"

# 3. Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad

# 4. Probar en staging
git checkout staging
git merge develop
git push origin staging  # Despliega a beta.genesyslm.com.co

# 5. Si todo OK, llevar a producción
git checkout main
git merge staging
git push origin main  # Despliega a www.genesyslm.com.co
```

---

### 🎯 Problemas Resueltos

#### ❌ ANTES: Problema con rutas de imágenes en dev
- El script `fix-inline-css-paths.js` solo corría en build
- En desarrollo las rutas podían estar incorrectas
- Beasties plugin generaba CSS inline con rutas relativas

#### ✅ AHORA: Rutas funcionan correctamente
- webpack-dev-server sirve assets desde configuración `static`
- `publicPath: '/'` asegura rutas correctas
- Assets servidos desde:
  - `public/` → `/`
  - `src/assets/` → `/assets/`

#### ❌ ANTES: Sin hot reload
- Cambios requerían refresh manual (F5)
- Lento para desarrollo iterativo
- No había servidor de desarrollo, solo watch

#### ✅ AHORA: Hot reload completo
- Cambios en JS → hot module replacement
- Cambios en CSS → actualización instantánea sin refresh
- Cambios en HTML → reload automático
- Navegador se abre automáticamente

#### ❌ ANTES: Sin ambiente de staging
- Cambios iban directo a producción
- Riesgoso probar en usuarios reales
- No había forma de mostrar features en internet antes de lanzar

#### ✅ AHORA: Ambiente staging completo
- Subdominio `beta.genesyslm.com.co` para pruebas
- Base de datos separada (sin afectar producción)
- Deployment automático desde rama `staging`
- Espacio seguro para testing

---

### 📚 Documentación Mejorada

#### Nuevos Archivos de Documentación
1. **STAGING_SETUP.md** - Guía completa de staging (530 líneas)
2. **.env.staging.example** - Template de configuración
3. **CHANGELOG_2025.md** - Este archivo

#### Archivos Actualizados
1. **CLAUDE.md** - Sección de deployment y ambientes
2. **README.md** - Comandos y ambientes actualizados

---

### 🔐 Configuración de Ambientes

#### Development (Local)
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
API_URL=http://localhost:3000
DB_HOST=localhost
```

#### Staging (Beta)
```env
NODE_ENV=staging
FRONTEND_URL=https://beta.genesyslm.com.co
API_URL=https://beta.genesyslm.com.co
DB_HOST=staging-db.digitalocean.com
PAYU_TEST=true  # Siempre en modo test
```

#### Production
```env
NODE_ENV=production
FRONTEND_URL=https://www.genesyslm.com.co
API_URL=https://www.genesyslm.com.co
DB_HOST=production-db.digitalocean.com
PAYU_TEST=false  # Pagos reales
```

---

### 🚀 Próximos Pasos Recomendados

#### Para empezar a usar staging:

1. **Crear subdominio en DigitalOcean**
   ```bash
   # Ve a: https://cloud.digitalocean.com
   # Networking → Domains → genesyslm.com.co
   # Add Record: Type A, Hostname: beta, Points to: tu droplet
   ```

2. **Configurar certificado SSL**
   ```bash
   ssh root@tu-droplet
   sudo certbot --nginx -d beta.genesyslm.com.co
   ```

3. **Crear rama staging**
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

4. **Configurar .env en servidor**
   ```bash
   cp .env.staging.example server/.env
   nano server/.env  # Editar con valores reales
   ```

5. **Configurar GitHub Actions (opcional)**
   - Ver ejemplo en STAGING_SETUP.md sección "Deployment Automático"

#### Para usar hot reload en local:

```bash
# ¡Simplemente ejecuta!
npm run dev

# El navegador se abrirá en http://localhost:8080
# Edita cualquier archivo JS/CSS/HTML y verás cambios automáticos
```

---

### ⚠️ Notas Importantes

1. **NO commitees archivos .env reales**
   - `.gitignore` ya los excluye
   - Solo commitea archivos `.env.example`

2. **Staging debe usar modo TEST de PayU**
   - Evita cargos reales en pruebas

3. **Usa base de datos separada para staging**
   - Más seguro para probar migraciones
   - No afecta datos de producción

4. **Certbot renueva automáticamente SSL**
   - Configurado para renovación automática
   - No necesitas hacer nada

5. **Puerto 8080 es el nuevo puerto de desarrollo**
   - Antes: probablemente usabas Live Server en puerto 5500
   - Ahora: `npm run dev` usa puerto 8080
   - Actualiza tus bookmarks

---

### 🎉 Beneficios

#### Desarrollo más rápido
- ⚡ Hot reload = menos tiempo esperando
- ⚡ Auto-refresh = más productividad
- ⚡ Servidor integrado = un solo comando

#### Deployment más seguro
- ✅ Testing en staging antes de producción
- ✅ Base de datos separada = sin riesgos
- ✅ URLs distintas = fácil identificar ambiente
- ✅ Deployment automático = menos errores manuales

#### Mejor organización
- 📁 Git branching claro (main ← staging ← develop)
- 📁 Configuraciones separadas por ambiente
- 📁 Documentación completa para nuevos desarrolladores

---

### 📞 Soporte

Si tienes problemas:
1. Revisa **STAGING_SETUP.md** sección "Troubleshooting"
2. Verifica logs: `pm2 logs` o `npm run dev` output
3. Revisa variables de entorno en `server/.env`
4. Contacta al equipo de desarrollo

---

**Fecha:** 2025-11-02
**Autor:** Claude Code
**Revisión:** v1.0
