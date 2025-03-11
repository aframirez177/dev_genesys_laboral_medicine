// src/config/env.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configura dotenv apuntando al archivo .env en la raíz
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Exporta una función para obtener las variables de entorno
export function getEnvVars() {
    return {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT
    };
}