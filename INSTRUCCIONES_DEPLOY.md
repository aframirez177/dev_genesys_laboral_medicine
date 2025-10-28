# 🚀 INSTRUCCIONES DE DEPLOY A DIGITAL OCEAN

**Fecha**: 27 de octubre, 2025
**Problema detectado**: El servidor crashea por error en configuración de Spaces

---

## ❌ ERRORES ENCONTRADOS EN TU .ENV DEL DROPLET

1. **CRÍTICO**: `SPACES_REGION=nyc-3` → Debe ser `nyc3` (sin guión)
2. Variable `PORT` duplicada 3 veces
3. Variables de base de datos duplicadas
4. `FRONTEND_URL` y `API_URL` apuntan a localhost (deben ser tu dominio)

---

## ✅ PASOS PARA CORREGIR

### 1. Conectarse al droplet
```bash
ssh root@tu_droplet_ip
```

### 2. Navegar al proyecto
```bash
cd /var/www/genesys-project
```

### 3. Editar el archivo .env del servidor
```bash
nano server/.env
```

### 4. Reemplazar TODO el contenido con esto:

```env
# Server
PORT=3000
NODE_ENV=production

# Database (DigitalOcean Managed PostgreSQL)
DB_CLIENT=pg
DB_HOST=your-db-host.ondigitalocean.com
DB_PORT=25060
DB_USER=doadmin
DB_PASSWORD=your_database_password_here
DB_NAME=defaultdb

# JWT (para autenticación)
JWT_SECRET=your_jwt_secret_key_here

# PayU (estos valores los obtendrás cuando te registres en PayU)
PAYU_API_KEY=
PAYU_API_LOGIN=
PAYU_MERCHANT_ID=
PAYU_ACCOUNT_ID=
PAYU_TEST=true

# File Storage
UPLOAD_DIR=uploads
DOC_STORAGE_PATH=documents

# App URLs
FRONTEND_URL=https://genesyslm.com.co
API_URL=https://genesyslm.com.co

# DigitalOcean Spaces Config
SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
SPACES_REGION=nyc3
SPACES_BUCKET=your-bucket-name
SPACES_KEY=your_spaces_key_here
SPACES_SECRET=your_spaces_secret_here
SPACES_PUBLIC_URL=https://your-bucket.nyc3.digitaloceanspaces.com
```

**CAMBIOS CLAVE**:
- ✅ `SPACES_REGION=nyc3` (SIN guión)
- ✅ `PORT` solo una vez
- ✅ URLs apuntan a `genesyslm.com.co`

### 5. Guardar cambios
```
Ctrl + O  (guardar)
Enter     (confirmar)
Ctrl + X  (salir)
```

### 6. Reiniciar el contenedor Docker

```bash
# Asegúrate de estar en el directorio del proyecto
cd /var/www/genesys-project

# Reiniciar solo el contenedor de la API
docker-compose restart api

# Ver los logs en tiempo real
docker-compose logs -f api
```

Presiona `Ctrl + C` para salir de los logs cuando veas que el servidor arrancó correctamente.

---

## 📋 CHECKLIST DESPUÉS DEL DEPLOY

- [ ] Logs del servidor muestran: `✅ Conexión a la base de datos exitosa`
- [ ] Logs muestran: `🚀 Servidor corriendo en puerto 3000`
- [ ] NO hay errores de `ERR_MODULE_NOT_FOUND`
- [ ] Endpoint health check funciona: `curl http://localhost:3000/api/health`
- [ ] Puedes completar el formulario en https://genesyslm.com.co/pages/diagnostico_interactivo.html
- [ ] Después de enviar el formulario, te redirige a resultados
- [ ] La página de resultados muestra los 4 documentos

---

## 🐛 SI SIGUE FALLANDO

1. Verifica que el archivo `server/src/utils/spaces.js` exista:
```bash
ls -la /var/www/genesys-project/server/src/utils/spaces.js
```

2. Verifica los logs completos del contenedor:
```bash
docker-compose logs --tail=100 api
```

3. Verifica que el contenedor esté corriendo:
```bash
docker-compose ps
```

4. Si necesitas reconstruir el contenedor:
```bash
docker-compose down
docker-compose up -d --build
docker-compose logs -f api
```

5. Prueba conexión a Spaces manualmente:
```bash
curl -I https://genesys-sst-archivos.nyc3.digitaloceanspaces.com
```

---

## 📝 NOTAS

- El archivo `.env.production.example` en este proyecto tiene la configuración correcta
- **NO subas** archivos `.env` a git (ya está en .gitignore)
- Guarda una copia de seguridad de tus credenciales de Spaces en un lugar seguro

---

**Generado automáticamente**
**Última actualización**: 27 de octubre, 2025
