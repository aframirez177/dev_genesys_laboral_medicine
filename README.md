# Genesys Laboral Medicine

Sistema integral para gestión de salud laboral y seguridad en el trabajo.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- `client/`: Frontend en JavaScript vanilla
- `server/`: Backend en Node.js con Express
-
## Requisitos

- Node.js v18.20.4 o superior
- MySQL/MariaDB

ok

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/aframirez177/dev_genesys_laboral_medicine.git
cd dev_genesys_laboral_medicine
```

2. Instalar dependencias:
```bash
# Instalar dependencias principales
npm install

# Instalar dependencias del cliente
cd client && npm install

# Instalar dependencias del servidor
cd ../server && npm install
```

3. Configurar variables de entorno:
```bash
cp server/.env.example server/.env
# Editar server/.env con tus configuraciones
```

## Desarrollo

Para desarrollo local:
```bash
# Ejecutar cliente y servidor simultáneamente
npm run dev

# O ejecutar cada uno por separado:
npm run client:dev
npm run server:dev
```

## Producción

Para construir para producción:
```bash
npm run build
```

## Licencias

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.