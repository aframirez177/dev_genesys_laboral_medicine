/**
 * Rate Limiting Middleware
 * Sprint 6 - Security Enhancements
 *
 * Protección contra:
 * - Brute force attacks
 * - DoS/DDoS attacks
 * - API abuse
 *
 * OWASP Recommendations:
 * - Login endpoints: Max 5 attempts per 15 minutes
 * - API endpoints: Max 100 requests per 15 minutes
 * - File uploads: Max 10 per hour
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for login/authentication endpoints
 * Strict limits to prevent brute force attacks
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor intente nuevamente en 15 minutos.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests
    skipFailedRequests: false, // Count failed requests
    keyGenerator: (req) => {
        // Use IP + email combination for more accurate tracking
        const email = req.body?.email || 'unknown';
        return `${req.ip}-${email}`;
    },
    handler: (req, res) => {
        console.warn(`⚠️ Rate limit exceeded for login: IP=${req.ip}, Email=${req.body?.email}`);
        res.status(429).json({
            success: false,
            message: 'Demasiados intentos de inicio de sesión. Por favor intente nuevamente en 15 minutos.',
            retryAfter: 900 // seconds
        });
    }
});

/**
 * Rate limiter for general API endpoints
 * Moderate limits for normal usage
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Demasiadas solicitudes. Por favor intente nuevamente más tarde.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user?.id?.toString() || req.ip;
    },
    skip: (req) => {
        // Skip rate limiting for admin users in development
        if (process.env.NODE_ENV === 'development' && req.user?.rol_id === 2) {
            return true;
        }
        return false;
    }
});

/**
 * Rate limiter for file upload endpoints
 * Strict limits to prevent abuse
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: {
        success: false,
        message: 'Límite de subida de archivos alcanzado. Máximo 10 archivos por hora.',
        retryAfter: '1 hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.id?.toString() || req.ip;
    }
});

/**
 * Rate limiter for password reset endpoints
 * Very strict to prevent email bombing
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    message: {
        success: false,
        message: 'Demasiadas solicitudes de restablecimiento de contraseña. Por favor intente nuevamente en 1 hora.',
        retryAfter: '1 hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const email = req.body?.email || 'unknown';
        return `${req.ip}-${email}`;
    }
});

/**
 * Rate limiter for AI/N8N workflow endpoints
 * Moderate limits for expensive operations
 */
export const aiWorkflowLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 AI requests per hour
    message: {
        success: false,
        message: 'Límite de solicitudes de IA alcanzado. Máximo 20 por hora.',
        retryAfter: '1 hora'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate limiter for profesiograma updates
 * Moderate limits for médico modifications
 */
export const profesiogramaUpdateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 updates per 15 minutes
    message: {
        success: false,
        message: 'Demasiadas actualizaciones de profesiograma. Por favor espere unos minutos.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return `medico-${req.user?.id || req.ip}`;
    }
});

/**
 * Rate limiter for admin operations
 * Relaxed limits for trusted users
 */
export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
    message: {
        success: false,
        message: 'Límite de solicitudes alcanzado.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return `admin-${req.user?.id || req.ip}`;
    }
});

/**
 * Global rate limiter for all requests
 * Very high limit, catches extreme abuse
 */
export const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute (wizard needs many requests)
    message: {
        success: false,
        message: 'Demasiadas solicitudes. Por favor reduzca la velocidad.',
        retryAfter: '1 minuto'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default {
    loginLimiter,
    apiLimiter,
    uploadLimiter,
    passwordResetLimiter,
    aiWorkflowLimiter,
    profesiogramaUpdateLimiter,
    adminLimiter,
    globalLimiter
};
