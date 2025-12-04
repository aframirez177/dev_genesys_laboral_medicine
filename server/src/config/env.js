// src/config/env.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; // Importa 'join' también

const __filename = fileURLToPath(import.meta.url);
// __dirname ahora es /var/www/genesys-project/server/src/config
const __dirname = dirname(__filename);

// ¡CORRECCIÓN CLAVE! Apunta al .env DENTRO de la carpeta server
// Sube dos niveles desde 'config' hasta 'server' y busca '.env'
const envPath = join(__dirname, '../../', '.env'); // Correcto: server/.env

dotenv.config({ path: envPath });

// Exporta una función para obtener TODAS las variables importantes
// (Añade aquí cualquier otra variable que necesites en tu app)
export function getEnvVars() {
    // Es buena práctica validar que las variables esenciales existan
    const requiredVars = [
        'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'NODE_ENV', 'PORT',
        'WHATSAPP_TOKEN', 'WHATSAPP_VERIFY_TOKEN', 'JWT_SECRET'
        // Añade aquí otras variables críticas (ej. PAYU_API_KEY si la usas siempre)
    ];

    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            console.warn(`⚠️ Advertencia: La variable de entorno ${varName} no está definida en ${envPath}`);
            // Podrías lanzar un error si es absolutamente crítica:
            // throw new Error(`Error crítico: Falta la variable de entorno ${varName}`);
        }
    }

    return {
        // Base de Datos
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_NAME: process.env.DB_NAME,
        DB_CLIENT: process.env.DB_CLIENT || 'pg', // Valor por defecto

        // Servidor
        NODE_ENV: process.env.NODE_ENV || 'development', // Por defecto a desarrollo
        PORT: process.env.PORT || 3000,

        // WhatsApp
        WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
        WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
        WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
        API_VERSION: process.env.API_VERSION || 'v22.0',

        // JWT
        JWT_SECRET: process.env.JWT_SECRET,

        // PayU
        PAYU_API_KEY: process.env.PAYU_API_KEY,
        PAYU_API_LOGIN: process.env.PAYU_API_LOGIN,
        PAYU_MERCHANT_ID: process.env.PAYU_MERCHANT_ID,
        PAYU_ACCOUNT_ID: process.env.PAYU_ACCOUNT_ID,
        PAYU_TEST: process.env.PAYU_TEST === 'true', // Convertir a booleano

        // Rutas y Almacenamiento
        UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
        DOC_STORAGE_PATH: process.env.DOC_STORAGE_PATH || 'documents',
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5500', // Asumiendo 5500 por tu config
        API_URL: process.env.API_URL || 'http://localhost:3000',

        // Redis (opcional)
        REDIS_ENABLED: process.env.REDIS_ENABLED !== 'false' && process.env.REDIS_ENABLED !== false,
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
        REDIS_DB: parseInt(process.env.REDIS_DB) || 0,

        // Worker
        WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY) || 2,

        // Sentry (opcional)
        SENTRY_DSN: process.env.SENTRY_DSN || undefined,

        // DigitalOcean Spaces
        SPACES_ENDPOINT: process.env.SPACES_ENDPOINT,
        SPACES_REGION: process.env.SPACES_REGION,
        SPACES_BUCKET: process.env.SPACES_BUCKET,
        SPACES_KEY: process.env.SPACES_KEY,
        SPACES_SECRET: process.env.SPACES_SECRET,
        SPACES_PUBLIC_URL: process.env.SPACES_PUBLIC_URL
    };
}