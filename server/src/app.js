// src/app.js
// IMPORTANT: Sentry must be imported and initialized FIRST
import {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler
} from './config/sentry.js';

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
import catalogoRoutes from './routes/catalogo.routes.js';
import solicitudRoutes from './routes/solicitud.routes.js';
import plantillasNivelesRoutes from './routes/plantillas-niveles.routes.js';
import payuRoutes from './routes/payu.routes.js';
import authRoutes from './routes/auth.routes.js';
import cargosRoutes from './routes/cargos.routes.js';
import examenesRoutes from './routes/examenes.routes.js';
import { metricsMiddleware, metricsHandler } from './config/metrics.js';


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

// Initialize Sentry (must be BEFORE other middleware)
initSentry(app);

// Sentry request handler (must be FIRST middleware)
app.use(sentryRequestHandler());

// Sentry tracing handler (must be AFTER requestHandler)
app.use(sentryTracingHandler());

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

// Metrics middleware (before routes)
app.use(metricsMiddleware);

// Rutas
app.use('/api/matriz-riesgos', matrizRiesgosRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/flujo-ia', flujoIaRoutes);
app.use('/api/profesiograma', profesiogramaViewRoutes);
app.use('/api/ia', aiSuggestionsRoutes);  // Nuevas rutas de IA
app.use('/api/catalogo', catalogoRoutes);  // Catálogo de riesgos y GES (incluye datos completos de GES desde BD)
app.use('/api/solicitudes', solicitudRoutes);  // Solicitudes async (NEW)
app.use('/api/plantillas-niveles', plantillasNivelesRoutes);  // Plantillas de niveles GTC-45
app.use('/api/payu', payuRoutes);  // Integración PayU Colombia
app.use('/api/auth', authRoutes);  // Autenticación JWT (Sprint 1)
app.use('/api/cargos', cargosRoutes);  // Cargos y Matriz GTC-45 (Sprint 2)
app.use('/api/examenes', examenesRoutes);  // Examenes y Mapa Calor (Sprint 4)

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

// Prometheus metrics endpoint
app.get('/metrics', metricsHandler);

app.get('/', (req, res) => {
    res.send(`<pre>Nothing to see here.
  Checkout README.md to start.</pre>`);
  });

// Sentry error handler (must be AFTER all routes, BEFORE other error handlers)
app.use(sentryErrorHandler());

// General error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERROR: Puerto ${PORT} ya está en uso.`);
        console.error(`\n💡 Solución:`);
        console.error(`   1. Mata los procesos que usan el puerto:`);
        console.error(`      lsof -ti:${PORT} | xargs kill -9`);
        console.error(`   2. O usa un puerto diferente:`);
        console.error(`      PORT=${PORT + 1000} npm run server:dev\n`);
        process.exit(1);
    } else {
        console.error('❌ Error al iniciar servidor:', err);
        process.exit(1);
    }
});

export default app;