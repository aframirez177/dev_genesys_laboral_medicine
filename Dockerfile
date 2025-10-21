# 1. Imagen base
# Usamos una imagen oficial de Node.js v20 (ligera)
FROM node:20-alpine

# 2. Directorio de trabajo
# Creamos y nos movemos a la carpeta /usr/src/app dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar solo el package.json de la raíz
# Tu package.json raíz ya tiene TODAS las dependencias
COPY . .
# 4. Instalar todas las dependencias
RUN npm install --include=dev

# 5. Copiar todo el código del proyecto
# Copia todo (server, client, etc.) al directorio de trabajo
COPY . .

# 6. Exponer el puerto
# Le dice a Docker que tu app corre en el puerto 3000
EXPOSE 3000

# 7. Comando por defecto (para producción)
# El script "start" de tu package.json apunta a "src/app.js",
# pero tu app está en "server/src/app.js". Lo corremos directamente.
CMD [ "node", "server/src/app.js" ]
