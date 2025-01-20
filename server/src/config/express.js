// server/src/config/express.js

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export default function configureExpress() {
    const app = express();
    
    // Seguridad básica
    app.use(helmet());
    
    // Rate limiting - protección contra ataques DoS
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100 // límite de 100 peticiones por ventana
    });
    app.use(limiter);
    
    // Middlewares esenciales
    app.use(cors());
    app.use(compression());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // Logging
    if (process.env.NODE_ENV !== 'production') {
        app.use(morgan('dev'));
    }
    
    // Manejo de errores global
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            error: process.env.NODE_ENV === 'production' 
                ? 'Error interno del servidor'
                : err.message
        });
    });
    
    return app;
}