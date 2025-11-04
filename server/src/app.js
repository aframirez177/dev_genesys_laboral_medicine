// src/app.js
import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { getEnvVars } from './config/env.js';
import { testConnection } from './config/database.js';
import matrizRiesgosRoutes from './routes/matriz-riesgos.routes.js';
import documentosRoutes from './routes/documentos.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import config from './config/whatsappConfig.js';
import flujoIaRoutes from './routes/flujoIa.routes.js';
import profesiogramaViewRoutes from './routes/profesiograma-view.routes.js';
import aiSuggestionsRoutes from './routes/ia/aiSuggestions.routes.js';


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

// Configuración de CORS más robusta
const whitelist = [
    'http://localhost:5500', // Desarrollo local
    'http://localhost:8080', // Otro puerto común de desarrollo de Webpack
    'https://genesyslm.com.co', // Dominio de producción
    'http://genesyslm.com.co', // Dominio de producción (sin SSL)
    `http://${env.SERVER_HOST}`, // La IP de tu servidor desde .env
    `http://104.131.163.89` // Añadimos la IP directamente como respaldo
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permite peticiones sin 'origin' (como las de Postman o apps móviles)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

// Configurar CORS y middleware
app.use(cors(corsOptions));

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
app.use('/api/documentos', documentosRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/flujo-ia', flujoIaRoutes);
app.use('/api/profesiograma', profesiogramaViewRoutes);
app.use('/api/ia', aiSuggestionsRoutes);  // Nuevas rutas de IA

app.use('/', whatsappRoutes);

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

app.get('/', (req, res) => {
    res.send(`<pre>Nothing to see here.
  Checkout README.md to start.</pre>`);
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