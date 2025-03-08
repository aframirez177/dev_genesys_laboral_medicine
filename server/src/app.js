// src/app.js
import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { getEnvVars } from './config/env.js';
import { testConnection } from './config/database.js';
import matrizRiesgosRoutes from './routes/matriz-riesgos.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';

const env = getEnvVars();

console.log('Variables de entorno cargadas en app.js:', {
    NODE_ENV: env.NODE_ENV,
    DB_HOST: env.DB_HOST,
    DB_USER: env.DB_USER,
    DB_NAME: env.DB_NAME,
    DB_PASSWORD: env.DB_PASSWORD ? '[PRESENTE]' : '[NO PRESENTE]'
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS y middleware
app.use(cors({
    origin: 'http://localhost:5500', // O tu puerto de desarrollo
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 20 * 1024 * 1024
    }
}));

// Rutas
app.use('/api/matriz-riesgos', matrizRiesgosRoutes);
app.use('/api/whatsapp', whatsappRoutes);

await testConnection();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'API funcionando correctamente',
        timestamp: new Date()
    });
});

// Manejo de errores de puerto en uso
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
}).on('error', err => {
    if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Puerto ${PORT} en uso, intentando con puerto ${PORT + 1}`);
        server.listen(PORT + 1);
    } else {
        console.error('Error al iniciar servidor:', err);
    }
});

export default app;