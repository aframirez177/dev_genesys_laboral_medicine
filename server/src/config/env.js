// src/config/env.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carga las variables de entorno según el entorno actual
export function getEnvVars() {
    // Carga el archivo .env predeterminado
    dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
    
    // También intenta cargar un archivo específico del entorno si existe
    const nodeEnv = process.env.NODE_ENV || 'development';
    dotenv.config({ path: path.resolve(__dirname, `../../../.env.${nodeEnv}`), override: true });
    
    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || 3000,
        
        // Database
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_USER: process.env.DB_USER || 'root',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        DB_NAME: process.env.DB_NAME || 'genesys_db',
        
        // JWT
        JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
        
        // PayU
        PAYU_API_KEY: process.env.PAYU_API_KEY,
        PAYU_API_LOGIN: process.env.PAYU_API_LOGIN,
        PAYU_MERCHANT_ID: process.env.PAYU_MERCHANT_ID,
        PAYU_ACCOUNT_ID: process.env.PAYU_ACCOUNT_ID,
        PAYU_TEST: process.env.PAYU_TEST === 'true',
        
        // File Storage
        UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
        DOC_STORAGE_PATH: process.env.DOC_STORAGE_PATH || 'documents',
        
        // URLs
        FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
        API_URL: process.env.API_URL || 'http://localhost:3000',
        
        // WhatsApp API
        WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
        WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
        WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID
        
    };
}


// Crea una instancia de configuración para el enfoque orientado a objetos
class EnvironmentConfig {
    constructor() {
        // Carga variables de entorno a través de la función existente
        const envVars = getEnvVars();
        
        // Transfiere todas las propiedades a esta instancia
        Object.assign(this, envVars);
        
        // Añade propiedades específicas para WhatsApp que no estén en getEnvVars
        this.WHATSAPP_API_VERSION = 'v22.0';
    }
}

// Exporta una instancia singleton para uso orientado a objetos
export default new EnvironmentConfig();