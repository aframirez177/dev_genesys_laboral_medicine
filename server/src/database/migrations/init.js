// server/src/database/migrations/init.js
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Para usar __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    let connection;
    
    // Obtener configuración de las variables de entorno
    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    };

    console.log('Intentando conectar con:', {
        host: dbConfig.host,
        user: dbConfig.user
    });

    try {
        // Crear conexión a MySQL
        connection = await mysql.createConnection(dbConfig);
        console.log('Conexión exitosa a MySQL');

        // Crear la base de datos si no existe
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log('Base de datos creada o verificada');
        
        // Usar la base de datos
        await connection.query(`USE ${process.env.DB_NAME}`);
        console.log('Usando la base de datos');

        // Leer el archivo schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        console.log('Archivo schema.sql leído correctamente');

        // Ejecutar cada comando SQL
        const commands = schema.split(';').filter(cmd => cmd.trim());
        for (const command of commands) {
            if (command.trim()) {
                await connection.query(command);
                console.log('Comando SQL ejecutado exitosamente');
            }
        }

        console.log('Migración completada con éxito');

    } catch (error) {
        console.error('Error durante la migración:', error);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Error de acceso denegado. Verifica tus credenciales en el archivo .env');
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Conexión cerrada');
        }
    }
}

runMigration();