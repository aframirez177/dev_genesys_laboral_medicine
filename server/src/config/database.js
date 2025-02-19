// src/config/database.js
import mysql from 'mysql2/promise';
import { getEnvVars } from './env.js';

const env = getEnvVars();

console.log('Variables de entorno en database.js:', {
    DB_HOST: env.DB_HOST,
    DB_USER: env.DB_USER,
    DB_NAME: env.DB_NAME,
    DB_PASSWORD: env.DB_PASSWORD ? '[PRESENTE]' : '[NO PRESENTE]'
});

const pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos establecida correctamente');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        console.error('Detalles de la conexión:');
        console.error(`Host: ${env.DB_HOST}`);
        console.error(`Database: ${env.DB_NAME}`);
        console.error(`User: ${env.DB_USER}`);
        return false;
    }
}

export async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error ejecutando query:', error.message);
        console.error('Query:', sql);
        console.error('Parámetros:', params);
        throw error;
    }
}

export default pool;