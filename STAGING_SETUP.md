# Guía de Configuración de Ambiente Staging/Beta

Esta guía te ayudará a configurar un ambiente de pruebas (staging/beta) para probar cambios antes de llevarlos a producción.

## 📋 Tabla de Contenidos

1. [¿Qué es un ambiente staging?](#qué-es-un-ambiente-staging)
2. [Configuración del Subdominio](#configuración-del-subdominio)
3. [Configuración en DigitalOcean](#configuración-en-digitalocean)
4. [Configuración en GoDaddy](#configuración-en-godaddy-alternativa)
5. [Deployment de Staging](#deployment-de-staging)
6. [Mejores Prácticas](#mejores-prácticas)

---

## ¿Qué es un ambiente staging?

Un ambiente **staging** (o beta) es una réplica de tu ambiente de producción donde puedes:
- ✅ Probar nuevas funcionalidades antes de producción
- ✅ Hacer pruebas con datos reales sin afectar a usuarios finales
- ✅ Validar cambios de base de datos y migraciones
- ✅ Realizar pruebas de integración con servicios externos (PayU en modo test)
- ✅ Compartir demos con clientes antes del lanzamiento oficial

**Ambientes recomendados:**
- `localhost` (desarrollo local) → `http://localhost:8080`
- `staging/beta` (pruebas en internet) → `https://beta.genesyslm.com.co`
- `production` (usuarios finales) → `https://www.genesyslm.com.co`

---

## Configuración del Subdominio

### Opción 1: Subdominio en DigitalOcean (RECOMENDADO)

Si tienes tu dominio `genesyslm.com.co` gestionado con DigitalOcean Nameservers:

#### Paso 1: Crear el registro DNS

1. Ve a [DigitalOcean Console](https://cloud.digitalocean.com)
2. Click en **Networking** → **Domains**
3. Selecciona tu dominio `genesyslm.com.co`
4. Crea un nuevo registro **A** con:
   - **Hostname:** `beta` (o `staging`, como prefieras)
   - **Will Direct To:** Selecciona tu droplet de staging
   - **TTL:** 3600 (1 hora)
5. Click en **Create Record**

**Resultado:** `beta.genesyslm.com.co` apuntará a tu droplet de staging.

#### Paso 2: Crear un droplet de staging (opcional)

**Opción A: Droplet dedicado (recomendado para producción seria)**
```bash
# En DigitalOcean Console
1. Create → Droplets
2. Elige la misma configuración que tu droplet de producción (pero puede ser más pequeño)
3. Nombre: genesys-staging
4. Tags: staging, beta
```

**Opción B: Usar el mismo droplet (más económico, para proyectos pequeños)**
```bash
# Ejecutar ambas versiones en diferentes puertos
# Production: puerto 3000 → www.genesyslm.com.co
# Staging: puerto 3001 → beta.genesyslm.com.co
```

---

### Opción 2: Configuración en GoDaddy (Alternativa)

Si gestionas tu dominio desde GoDaddy:

#### Paso 1: Crear el registro DNS en GoDaddy

1. Ve a [GoDaddy DNS Management](https://dcc.godaddy.com/manage/dns)
2. Selecciona tu dominio `genesyslm.com.co`
3. Click en **Add** para crear un nuevo registro
4. Configura:
   - **Type:** A
   - **Name:** `beta` (o `staging`)
   - **Value:** IP de tu droplet de DigitalOcean (ej: `64.23.145.78`)
   - **TTL:** 1 Hour
5. Click en **Save**

**Nota:** Los cambios DNS pueden tardar hasta 48 horas en propagarse (generalmente 10-30 minutos).

---

## Configuración en DigitalOcean

### 1. Crear Base de Datos de Staging (Opcional pero recomendado)

```bash
# En DigitalOcean Console
1. Databases → Create Database
2. Nombre: genesys-staging-db
3. Región: La misma que tu droplet
4. Configuración: Puede ser más pequeña que producción
5. Tags: staging

# Una vez creada, anota las credenciales:
- Host
- Port
- User
- Password
- Database name
```

**¿Por qué una DB separada?**
- ✅ Puedes probar migraciones sin riesgo
- ✅ Datos de prueba no afectan producción
- ✅ Mayor seguridad

### 2. Crear Bucket de Spaces para Staging (Opcional)

```bash
# En DigitalOcean Console
1. Spaces → Create Space
2. Nombre: genesys-staging-bucket
3. Región: NYC3 (o la que uses)
4. Files Listing: Private (recomendado)

# Genera access keys:
1. API → Tokens/Keys → Spaces Keys
2. Generate New Key
3. Nombre: genesys-staging-spaces
4. Anota: Access Key y Secret Key
```

### 3. Configurar HTTPS con SSL (Certbot)

```bash
# SSH a tu droplet
ssh root@your-staging-droplet-ip

# Instalar Certbot (si no está instalado)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL para el subdominio
sudo certbot --nginx -d beta.genesyslm.com.co

# Renovación automática (certbot lo hace automáticamente)
sudo certbot renew --dry-run
```

### 4. Configurar Nginx para Staging

```nginx
# /etc/nginx/sites-available/genesys-staging
server {
    listen 80;
    server_name beta.genesyslm.com.co;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name beta.genesyslm.com.co;

    # SSL certificates (Certbot las configura automáticamente)
    ssl_certificate /etc/letsencrypt/live/beta.genesyslm.com.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beta.genesyslm.com.co/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Staging environment indicator (opcional)
    add_header X-Environment "staging" always;

    # Root directory
    root /var/www/genesys-staging/dist;
    index index.html;

    # Frontend static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js
    location /api {
        proxy_pass http://localhost:3001;  # Puerto diferente si usas mismo droplet
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/genesys-staging /etc/nginx/sites-enabled/

# Test de configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## Deployment de Staging

### Opción 1: Deployment Manual

```bash
# En tu droplet de staging
cd /var/www/genesys-staging

# Pull latest changes desde rama staging
git fetch origin
git checkout staging  # Crea una rama 'staging' en tu repo
git pull origin staging

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.staging.example server/.env
nano server/.env  # Edita con los valores reales

# Build del proyecto
npm run build

# Restart del servidor (usando PM2)
pm2 restart genesys-staging
```

### Opción 2: Deployment Automático con GitHub Actions

Crea `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - staging  # Se activa cuando haces push a la rama staging

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Deploy to staging server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /var/www/genesys-staging
            git pull origin staging
            npm install
            npm run build
            pm2 restart genesys-staging
```

### Configurar PM2 para Staging

```bash
# En el droplet
cd /var/www/genesys-staging

# Crear archivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'genesys-staging',
    script: './server/src/app.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'staging',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Para que inicie automáticamente al reiniciar
```

---

## Mejores Prácticas

### 1. Estrategia de Ramas Git

```
main (producción) ← merge desde staging
  ↑
staging (beta) ← merge desde develop
  ↑
develop (desarrollo) ← feature branches
```

**Workflow:**
```bash
# Desarrollo de nueva feature
git checkout -b feature/nueva-funcionalidad
# ... desarrollo ...
git commit -m "feat: nueva funcionalidad"

# Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad

# Probar en staging
git checkout staging
git merge develop
git push origin staging  # Activa deployment automático

# Si todo funciona bien, llevar a producción
git checkout main
git merge staging
git push origin main
```

### 2. Variables de Entorno

**NUNCA** commitees archivos `.env` reales. Usa `.env.example`:

```bash
# Crear .env desde ejemplo
cp .env.staging.example server/.env

# Editar con valores reales
nano server/.env
```

### 3. Base de Datos

**Sincronizar estructura de producción a staging:**

```bash
# Exportar estructura de producción (sin datos sensibles)
pg_dump -h production-db-host -U doadmin -d genesys_db --schema-only > schema.sql

# Importar a staging
psql -h staging-db-host -U doadmin -d genesys_staging_db < schema.sql

# Ejecutar migraciones
cd /var/www/genesys-staging
npx knex migrate:latest --knexfile knexfile.js
```

### 4. Pruebas antes de Producción

**Checklist antes de merge a main:**
- ✅ Todas las features funcionan en staging
- ✅ Migraciones de base de datos probadas
- ✅ Pruebas de integración con servicios externos
- ✅ Performance aceptable
- ✅ No hay errores en logs
- ✅ Aprobación de stakeholders/clientes

### 5. Monitoreo

```bash
# Ver logs en tiempo real
pm2 logs genesys-staging

# Ver status
pm2 status

# Monitoreo de recursos
pm2 monit
```

### 6. Protección con Autenticación Básica (Opcional)

Si no quieres que staging sea público:

```nginx
# En /etc/nginx/sites-available/genesys-staging
location / {
    auth_basic "Staging Area - Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    try_files $uri $uri/ /index.html;
}
```

```bash
# Crear usuario y contraseña
sudo htpasswd -c /etc/nginx/.htpasswd admin
# Ingresa la contraseña cuando se solicite

# Restart Nginx
sudo systemctl restart nginx
```

---

## Resumen de Comandos Rápidos

### Desarrollo Local
```bash
# Frontend en http://localhost:8080 con hot reload
npm run dev

# Solo frontend
cd client && npm run dev

# Solo backend
cd server && npm run dev
```

### Deployment a Staging
```bash
# Opción 1: Manual
ssh root@staging-droplet
cd /var/www/genesys-staging
git pull origin staging
npm install
npm run build
pm2 restart genesys-staging

# Opción 2: Automático
git push origin staging  # GitHub Actions hace el resto
```

### Deployment a Producción
```bash
git checkout main
git merge staging
git push origin main  # GitHub Actions o manual
```

---

## Troubleshooting

### Problema: DNS no resuelve
```bash
# Verificar propagación DNS
nslookup beta.genesyslm.com.co
dig beta.genesyslm.com.co

# Limpiar caché DNS local
sudo systemd-resolve --flush-caches  # Linux
dscacheutil -flushcache  # macOS
ipconfig /flushdns  # Windows
```

### Problema: SSL no funciona
```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Re-generar certificado
sudo certbot --nginx -d beta.genesyslm.com.co --force-renewal
```

### Problema: Puerto 3001 no responde
```bash
# Ver qué está usando el puerto
sudo lsof -i :3001
sudo netstat -tulpn | grep 3001

# Verificar PM2
pm2 status
pm2 logs genesys-staging --lines 100

# Reiniciar
pm2 restart genesys-staging
```

---

## Recursos Adicionales

- [DigitalOcean DNS Documentation](https://docs.digitalocean.com/products/networking/dns/)
- [Certbot Documentation](https://certbot.eff.org/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o contacta al equipo de desarrollo.
