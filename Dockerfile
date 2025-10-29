# ============================================
# Dockerfile optimizado para Puppeteer
# ============================================

# 1. Imagen base - Debian (necesaria para Puppeteer)
# Cambiamos de Alpine a Debian porque Puppeteer necesita más dependencias
FROM node:20-slim

# 2. Instalar dependencias del sistema para Puppeteer
RUN apt-get update && apt-get install -y \
    # Chromium y dependencias básicas
    chromium \
    chromium-sandbox \
    # Fuentes
    fonts-liberation \
    fonts-noto-color-emoji \
    # Librerías gráficas
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxshmfence1 \
    # Utilidades
    xdg-utils \
    ca-certificates \
    # Limpieza
    && rm -rf /var/lib/apt/lists/*

# 3. Variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    CHROME_BIN=/usr/bin/chromium \
    NODE_ENV=production

# 4. Directorio de trabajo
WORKDIR /usr/src/app

# 5. Copiar archivos de dependencias primero (para cache de Docker)
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# 6. Instalar dependencias
RUN npm install --include=dev && \
    cd server && npm install && \
    cd ../client && npm install && \
    cd ..

# 7. Copiar todo el código del proyecto
COPY . .

# 8. Exponer el puerto
EXPOSE 3000

# 9. Comando por defecto
CMD [ "node", "server/src/app.js" ]
