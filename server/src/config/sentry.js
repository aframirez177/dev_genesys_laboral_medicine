// server/src/config/sentry.js
import * as Sentry from '@sentry/node';
// TODO: ProfilingIntegration import temporarily disabled due to version incompatibility
// import { ProfilingIntegration } from '@sentry/profiling-node';
import { getEnvVars } from './env.js';

const env = getEnvVars();

/**
 * Initialize Sentry error tracking
 * 
 * NOTE: Para usar Sentry en producción:
 * 1. Crear cuenta gratuita en https://sentry.io
 * 2. Crear nuevo proyecto Node.js
 * 3. Copiar el DSN del proyecto
 * 4. Agregar SENTRY_DSN al archivo .env
 * 
 * El free tier de Sentry incluye:
 * - 5,000 errores/mes
 * - 10,000 eventos de rendimiento/mes
 * - Retención de datos 30 días
 * - Unlimited projects
 */
export function initSentry(app) {
  // Solo inicializar si hay DSN configurado
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  Sentry no configurado (falta SENTRY_DSN)');
    console.log('   Para habilitar Sentry:');
    console.log('   1. Registrarse en https://sentry.io (gratis)');
    console.log('   2. Crear proyecto Node.js');
    console.log('   3. Agregar SENTRY_DSN=your_dsn_here a .env');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Environment
    environment: env.NODE_ENV || 'development',
    
    // Release tracking (opcional - ayuda a rastrear errores por versión)
    release: process.env.APP_VERSION || 'dev',
    
    // Integrations
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),

      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),

      // Enable profiling (performance monitoring)
      // TODO: ProfilingIntegration temporarily disabled due to version incompatibility
      // new ProfilingIntegration(),
    ],
    
    // Performance Monitoring
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% en prod, 100% en dev
    
    // Profiling
    profilesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Configuración de errores
    beforeSend(event, hint) {
      // Filtrar errores sensibles
      const error = hint.originalException;
      
      // No enviar errores de autenticación (información sensible)
      if (error && error.message && error.message.includes('password')) {
        return null;
      }
      
      // Agregar información adicional
      event.tags = {
        ...event.tags,
        server_type: 'api',
        node_version: process.version
      };
      
      return event;
    },
    
    // Ignorar errores específicos
    ignoreErrors: [
      // Errores de red del cliente
      'NetworkError',
      'Failed to fetch',
      // Errores de CORS
      'Not allowed by CORS',
      // Errores de timeout esperados
      'ECONNRESET',
      'ETIMEDOUT'
    ]
  });

  console.log('✅ Sentry inicializado correctamente');
}

/**
 * Express middleware para capturar errores con Sentry
 */
export function sentryRequestHandler() {
  if (!process.env.SENTRY_DSN) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.requestHandler();
}

/**
 * Express middleware para rastrear errores con Sentry
 */
export function sentryTracingHandler() {
  if (!process.env.SENTRY_DSN) {
    return (req, res, next) => next();
  }
  return Sentry.Handlers.tracingHandler();
}

/**
 * Express middleware para manejo de errores con Sentry
 * IMPORTANTE: Debe ser el ÚLTIMO middleware de error
 */
export function sentryErrorHandler() {
  if (!process.env.SENTRY_DSN) {
    return (err, req, res, next) => next(err);
  }
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capturar errores 4xx y 5xx
      if (error.status >= 400) {
        return true;
      }
      return false;
    }
  });
}

/**
 * Capturar excepción manualmente
 */
export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    extra: context
  });
}

/**
 * Capturar mensaje/warning
 */
export function captureMessage(message, level = 'info', context = {}) {
  Sentry.captureMessage(message, {
    level,
    extra: context
  });
}

/**
 * Agregar contexto al scope actual
 */
export function setContext(name, context) {
  Sentry.setContext(name, context);
}

/**
 * Agregar tag al scope actual
 */
export function setTag(key, value) {
  Sentry.setTag(key, value);
}

/**
 * Agregar información del usuario
 */
export function setUser(user) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.nombreContacto
  });
}

export default {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  captureException,
  captureMessage,
  setContext,
  setTag,
  setUser
};
