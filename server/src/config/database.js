// src/config/database.js
import knex from 'knex';
import knexfile from '../../../knexfile.js'; // Ajustamos la ruta para que suba al directorio raíz
import { getEnvVars } from './env.js';

const env = getEnvVars();
const config = knexfile[env.NODE_ENV || 'development'];

const db = knex(config);

export const testConnection = async () => {
    try {
        await db.raw('SELECT 1+1 AS result');
        console.log('✅ Conexión a la base de datos exitosa.');
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        // En un entorno de producción, podrías querer manejar esto de forma más robusta
        // process.exit(1); 
    }
};

export default db;