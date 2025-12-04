// server/src/config/redis.js
import Redis from 'ioredis';
import { getEnvVars } from './env.js';

const env = getEnvVars();

/**
 * CONFIGURACIÓN DE REDIS (OPCIONAL EN DESARROLLO)
 *
 * Usado para:
 * - Cache de segundo nivel (CatalogoService)
 * - Queue de trabajos (BullMQ)
 * - Rate limiting
 *
 * Para habilitar Redis:
 * 1. Asegúrate de que Redis esté corriendo: `redis-server`
 * 2. En .env: REDIS_ENABLED=true
 *
 * Si Redis no está disponible:
 * - El sistema funcionará sin cache (consultas directas a DB)
 * - Jobs se procesarán síncronamente (más lento pero funcional)
 */

// Flag para saber si Redis está disponible
let isRedisAvailable = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3; // Solo 3 reintentos, luego desactivar

// Verificar si Redis está habilitado (ya convertido a booleano en env.js)
const isRedisEnabled = env.REDIS_ENABLED === true;

if (!isRedisEnabled) {
  console.log('⚠️  Redis: Deshabilitado vía REDIS_ENABLED=false');
  console.log('   → Sistema funcionará sin cache (modo degradado)');
}

// Opciones de conexión
const redisOptions = {
  host: env.REDIS_HOST || 'localhost',
  port: env.REDIS_PORT || 6379,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB || 0,

  // ✅ Retry strategy con límite
  retryStrategy(times) {
    connectionAttempts = times;

    // Si Redis está deshabilitado, no reintentar
    if (!isRedisEnabled) {
      console.log('⚠️  Redis: No reintentando (deshabilitado)');
      return null;
    }

    // Si superamos el límite de reintentos, desactivar Redis
    if (times > MAX_RETRY_ATTEMPTS) {
      console.log(`❌ Redis: Alcanzado límite de reintentos (${MAX_RETRY_ATTEMPTS})`);
      console.log('⚠️  Redis: Funcionando en MODO DEGRADADO (sin cache)');
      console.log('   → Para habilitarlo: inicia Redis y reinicia el servidor');
      isRedisAvailable = false;
      return null; // Detener reintentos
    }

    const delay = Math.min(times * 1000, 5000);
    console.log(`⏳ Redis: Reintentando conexión en ${delay}ms (intento ${times}/${MAX_RETRY_ATTEMPTS})`);
    return delay;
  },

  // Timeouts
  connectTimeout: 5000, // Reducido a 5s
  commandTimeout: 3000, // Reducido a 3s

  // ✅ No encolar comandos si está offline
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,

  // ✅ Lazy connect - no conectar inmediatamente
  lazyConnect: true,
  showFriendlyErrorStack: env.NODE_ENV === 'development'
};

// Clientes Redis (inicialmente null si está deshabilitado)
let redisClient = null;
let redisQueueClient = null;

// Solo crear clientes si Redis está habilitado
if (isRedisEnabled) {
  redisClient = new Redis(redisOptions);
  redisQueueClient = new Redis(redisOptions);

  // Event handlers para monitoreo
  redisClient.on('connect', () => {
    console.log('✅ Redis: Conectado correctamente');
    isRedisAvailable = true;
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis: Listo para recibir comandos');
    isRedisAvailable = true;
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);

    // Si falla la conexión inicial, marcar como no disponible
    if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
      isRedisAvailable = false;
    }
  });

  redisClient.on('close', () => {
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log('⚠️  Redis: Conexión cerrada');
    }
  });

  redisClient.on('reconnecting', () => {
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log('🔄 Redis: Reconectando...');
    }
  });

  // Event handlers para queue client
  redisQueueClient.on('connect', () => {
    console.log('✅ Redis Queue: Conectado correctamente');
  });

  redisQueueClient.on('error', (err) => {
    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.error('❌ Redis Queue error:', err.message);
    }
  });

  // Intentar conectar (con timeout)
  const connectWithTimeout = async () => {
    try {
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
      isRedisAvailable = true;
    } catch (error) {
      console.error('❌ Redis: Conexión inicial falló:', error.message);
      console.log('⚠️  Redis: Funcionando en MODO DEGRADADO (sin cache)');
      isRedisAvailable = false;
    }
  };

  // Conectar en background (no bloquear inicio del servidor)
  connectWithTimeout();
}

/**
 * Helper: Verificar si Redis está disponible
 */
export const checkRedisAvailable = () => {
  return isRedisAvailable && redisClient !== null;
};

/**
 * Helper: Ejecutar comando Redis si está disponible
 */
export const safeRedisCommand = async (command, ...args) => {
  if (!checkRedisAvailable()) {
    console.log('⚠️  Redis no disponible, saltando comando:', command);
    return null;
  }

  try {
    return await redisClient[command](...args);
  } catch (error) {
    console.error(`❌ Redis ${command} falló:`, error.message);
    return null;
  }
};

/**
 * Test de conexión
 */
export const testRedisConnection = async () => {
  if (!checkRedisAvailable()) {
    console.log('⚠️  Redis: No disponible para test');
    return false;
  }

  try {
    await redisClient.ping();
    console.log('✅ Redis: Test de conexión exitoso');
    return true;
  } catch (error) {
    console.error('❌ Redis: Test de conexión falló:', error.message);
    isRedisAvailable = false;
    return false;
  }
};

/**
 * Cerrar conexiones (para graceful shutdown)
 */
export const closeRedisConnections = async () => {
  if (!redisClient || !redisQueueClient) {
    console.log('⚠️  Redis: No hay conexiones para cerrar');
    return;
  }

  try {
    await redisClient.quit();
    await redisQueueClient.quit();
    console.log('✅ Redis: Conexiones cerradas correctamente');
  } catch (error) {
    console.error('❌ Redis: Error al cerrar conexiones:', error.message);
  }
};

// Exportar clientes (pueden ser null si Redis está deshabilitado)
export { redisClient, redisQueueClient, isRedisAvailable };

// Exportar flag de disponibilidad como getter para que siempre esté actualizado
export const getRedisStatus = () => ({
  enabled: isRedisEnabled,
  available: isRedisAvailable,
  attempts: connectionAttempts
});
