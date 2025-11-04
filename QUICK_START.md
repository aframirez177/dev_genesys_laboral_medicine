# 🚀 Quick Start - Hot Reload

## Prueba el Hot Reload en 2 Minutos

### Paso 1: Iniciar el Servidor de Desarrollo

```bash
# En la raíz del proyecto
npm run dev
```

Esto va a:
- ✅ Iniciar webpack-dev-server en `http://localhost:8080`
- ✅ Iniciar Express backend en `http://localhost:3000`
- ✅ Abrir tu navegador automáticamente

### Paso 2: Hacer un Cambio y Ver el Hot Reload

1. **Abre** cualquier archivo de JavaScript en `client/src/`
   Por ejemplo: `client/src/index.js`

2. **Agrega** un console.log:
   ```javascript
   console.log('🎉 Hot reload funcionando!');
   ```

3. **Guarda** el archivo (Ctrl+S / Cmd+S)

4. **Observa** la consola del navegador - verás el mensaje automáticamente sin necesidad de refrescar (F5)

### Paso 3: Probar con CSS

1. **Abre** `client/src/styles/main.scss` (o cualquier archivo SCSS)

2. **Agrega** una regla temporal:
   ```scss
   body {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   }
   ```

3. **Guarda** el archivo

4. **Observa** cómo el background cambia INSTANTÁNEAMENTE sin reload

### Paso 4: Probar con HTML

1. **Abre** `client/public/index.html`

2. **Cambia** algún texto en la página

3. **Guarda** el archivo

4. **Observa** cómo la página se recarga automáticamente

---

## 🎯 Diferencia: Antes vs Ahora

### ❌ ANTES
```bash
# Terminal 1
cd client
npm run dev  # Solo compilaba, sin servidor

# Terminal 2
# Usabas Live Server de VS Code en puerto 5500

# Terminal 3
cd server
npm run dev

# Cambios = F5 manual cada vez
```

### ✅ AHORA
```bash
# Solo 1 terminal
npm run dev  # Todo listo en localhost:8080

# Cambios = auto-refresh automático
```

---

## 🔥 Features del Hot Reload

### JavaScript
- **Hot Module Replacement (HMR)**: Cambios se aplican sin perder el estado de la app
- **Fast Refresh**: Actualización casi instantánea
- **Error Overlay**: Errores se muestran en pantalla (no necesitas abrir DevTools)

### CSS/SCSS
- **Instant Update**: Cambios CSS se aplican SIN reload de página
- **Style Injection**: Webpack inyecta estilos actualizados en vivo

### HTML
- **Live Reload**: Cambios en HTML recargan la página automáticamente

### API Calls
- **Proxy Automático**: Requests a `/api/*` se redirigen a `http://localhost:3000`
- Ejemplo: `fetch('/api/matriz-riesgos')` → `http://localhost:3000/api/matriz-riesgos`

---

## 🛠️ Configuración del Dev Server

La configuración está en `client/webpack.config.js`:

```javascript
devServer: {
  static: [
    {
      directory: path.join(__dirname, 'public'),
      publicPath: '/',
    },
    {
      directory: path.join(__dirname, 'src/assets'),
      publicPath: '/assets',
    }
  ],
  compress: true,
  port: 8080,
  hot: true,              // Hot Module Replacement
  open: true,             // Abre navegador automáticamente
  proxy: [
    {
      context: ['/api'],
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    }
  ],
  client: {
    overlay: {
      errors: true,       // Mostrar errores en overlay
      warnings: false,    // No mostrar warnings
    },
    progress: true,       // Mostrar progreso de compilación
  },
}
```

---

## 📱 Probar en Dispositivos Móviles (LAN)

Si quieres probar en tu teléfono u otra computadora en la misma red:

1. **Encuentra tu IP local:**
   ```bash
   # Linux/Mac
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows
   ipconfig | findstr IPv4
   ```

2. **Abre en tu dispositivo:**
   ```
   http://TU_IP_LOCAL:8080
   ```
   Ejemplo: `http://192.168.1.100:8080`

3. **Edita webpack config** (opcional para acceso externo):
   ```javascript
   devServer: {
     host: '0.0.0.0',  // Permite acceso desde otras IPs
     // ... resto de config
   }
   ```

---

## 🐛 Troubleshooting

### Puerto 8080 ya está en uso
```bash
# Ver qué está usando el puerto
sudo lsof -i :8080  # Linux/Mac
netstat -ano | findstr 8080  # Windows

# Matar el proceso
sudo kill -9 <PID>  # Linux/Mac
taskkill /F /PID <PID>  # Windows

# O cambiar puerto en webpack.config.js
devServer: {
  port: 3001,  // Usar otro puerto
}
```

### Hot reload no funciona
```bash
# 1. Limpiar cache y reinstalar
rm -rf client/node_modules client/dist
cd client && npm install

# 2. Verificar que webpack-dev-server está instalado
npm list webpack-dev-server

# 3. Revisar permisos de archivos
chmod -R 755 client/src
```

### Cambios en HTML no se reflejan
- HTML hot reload requiere refresh completo
- Verifica que el archivo esté en `client/public/`
- Asegúrate de que webpack está compilando (chequea terminal)

### Proxy /api no funciona
```bash
# 1. Verifica que el backend esté corriendo
curl http://localhost:3000/api/health

# 2. Verifica configuración de proxy en webpack.config.js
# 3. Revisa CORS en server/src/app.js
```

### El navegador no se abre automáticamente
```bash
# Es normal en algunas configuraciones
# Solo abre manualmente: http://localhost:8080

# O desactiva en webpack.config.js:
devServer: {
  open: false,  // No abrir automáticamente
}
```

---

## 💡 Tips Pro

### 1. Usar Chrome DevTools para Hot Reload
- Abre DevTools (F12)
- Ve a Settings → Preferences → Network
- ✅ Marca "Disable cache (while DevTools is open)"

### 2. Guardar automáticamente en VS Code
```json
// .vscode/settings.json
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

### 3. Ver logs de Webpack en detalle
```bash
# En package.json, modifica el comando dev:
"dev": "webpack serve --mode development --progress --stats verbose"
```

### 4. Source Maps para Debugging
- Los source maps ya están habilitados en modo development
- Puedes ver y debuggear tu código original en DevTools
- Breakpoints funcionan en archivos .js originales

---

## 🎓 Aprende Más

- [Webpack Dev Server Docs](https://webpack.js.org/configuration/dev-server/)
- [Hot Module Replacement Concepts](https://webpack.js.org/concepts/hot-module-replacement/)
- [STAGING_SETUP.md](./STAGING_SETUP.md) - Configuración de staging
- [CLAUDE.md](./CLAUDE.md) - Guía completa del proyecto

---

## ✅ Checklist de Primera Vez

- [ ] Ejecuté `npm install` en la raíz
- [ ] Ejecuté `npm run dev`
- [ ] El navegador se abrió en http://localhost:8080
- [ ] Hice un cambio en un archivo JS y lo vi reflejarse
- [ ] Hice un cambio en un archivo SCSS y lo vi reflejarse sin reload
- [ ] Probé llamar a la API desde el frontend
- [ ] Configuré auto-save en mi editor
- [ ] Agregué http://localhost:8080 a mis bookmarks

---

**¡Listo! Ahora tienes un entorno de desarrollo moderno con hot reload 🚀**

¿Tienes dudas? Revisa [STAGING_SETUP.md](./STAGING_SETUP.md) para más configuraciones.
