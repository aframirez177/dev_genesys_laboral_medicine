// server/src/config/queue.js
import { Queue, Worker } from 'bullmq';
import { redisQueueClient, checkRedisAvailable } from './redis.js';
import { getEnvVars } from './env.js';

const env = getEnvVars();

/**
 * CONFIGURACIÓN DE BULLMQ (OPCIONAL)
 * Sistema de colas asíncronas para:
 * - Generación de documentos (PDFs, Excel)
 * - Procesamiento de solicitudes de matriz de riesgos
 * - Envío de emails (futuro)
 * - Generación de thumbnails
 *
 * Si Redis no está disponible:
 * - Los jobs se procesarán síncronamente (más lento pero funcional)
 * - No hay persistencia de jobs entre reinicios
 */

// Flag para saber si las colas están disponibles
let queuesAvailable = false;

// Conexión compartida para todas las colas
let queueConnection = null;

// Colas (null si Redis no está disponible)
export let documentosQueue = null;
export let thumbnailsQueue = null;
export let emailsQueue = null;

// Solo crear colas si Redis está disponible
if (checkRedisAvailable() && redisQueueClient) {
  queueConnection = {
    connection: redisQueueClient,
    // Opciones globales de BullMQ
    defaultJobOptions: {
      attempts: 3,                    // 3 intentos antes de fallar
      backoff: {
        type: 'exponential',
        delay: 2000                   // Espera 2s, 4s, 8s entre reintentos
      },
      removeOnComplete: {
        age: 3600,                    // Mantener jobs completados 1 hora
        count: 100                    // Máximo 100 jobs completados en memoria
      },
      removeOnFail: {
        age: 86400                    // Mantener jobs fallidos 24 horas
      }
    }
  };

  try {
    /**
     * COLA: documentos-queue
     * Procesa generación de documentos (matriz, profesiograma, perfil, cotización)
     */
    documentosQueue = new Queue('documentos', queueConnection);

    /**
     * COLA: thumbnails-queue (futuro)
     * Procesa generación de thumbnails de PDFs
     */
    thumbnailsQueue = new Queue('thumbnails', queueConnection);

    /**
     * COLA: emails-queue (futuro)
     * Procesa envío de emails
     */
    emailsQueue = new Queue('emails', queueConnection);

    // Event handlers para monitoreo
    documentosQueue.on('error', (err) => {
      console.error('❌ Queue [documentos] error:', err.message);
    });

    queuesAvailable = true;
    console.log('✅ Colas BullMQ configuradas');

  } catch (error) {
    console.error('❌ BullMQ: Error al inicializar colas:', error.message);
    console.log('⚠️  BullMQ: Funcionando sin colas (procesamiento síncrono)');
    queuesAvailable = false;
  }
} else {
  console.log('⚠️  BullMQ: Redis no disponible, colas deshabilitadas');
  console.log('   → Jobs se procesarán síncronamente (más lento pero funcional)');
}

/**
 * Helper: Verificar si las colas están disponibles
 */
export const checkQueuesAvailable = () => {
  return queuesAvailable && documentosQueue !== null;
};

/**
 * Helper: Agregar job a la cola de documentos
 * @param {String} jobName - Nombre del job (ej: 'generar-matriz')
 * @param {Object} data - Datos del job
 * @param {Object} options - Opciones adicionales (priority, delay, etc.)
 * @returns {Object} Job creado o null si colas no disponibles
 */
export const addDocumentoJob = async (jobName, data, options = {}) => {
  if (!checkQueuesAvailable()) {
    console.log(`⚠️  Colas no disponibles, job ${jobName} debe procesarse síncronamente`);
    return null;
  }

  try {
    const job = await documentosQueue.add(jobName, data, {
      ...options,
      jobId: data.token || undefined  // Usar token como jobId para queries fáciles
    });

    console.log(`✅ Job encolado: ${jobName} (ID: ${job.id})`);
    return job;

  } catch (error) {
    console.error(`❌ Error encolando job ${jobName}:`, error.message);
    throw error;
  }
};

/**
 * Obtener estado de un job por token
 * @param {String} token - Token de la solicitud
 * @returns {Object} Estado del job
 */
export const getJobStatus = async (token) => {
  if (!checkQueuesAvailable()) {
    console.log('⚠️  Colas no disponibles, no se puede obtener estado del job');
    return {
      estado: 'unavailable',
      mensaje: 'Sistema de colas no disponible (procesamiento síncrono)'
    };
  }

  try {
    // Buscar job por ID (usando token como jobId)
    const job = await documentosQueue.getJob(token);

    if (!job) {
      return {
        estado: 'not_found',
        mensaje: 'Solicitud no encontrada'
      };
    }

    const state = await job.getState();
    const progress = job.progress || 0;

    // Mapear estados de BullMQ a estados de negocio
    const estadoMap = {
      'waiting': 'pendiente',
      'active': 'procesando',
      'completed': 'completado',
      'failed': 'fallido',
      'delayed': 'pendiente'
    };

    return {
      estado: estadoMap[state] || state,
      progreso: progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    };

  } catch (error) {
    console.error(`❌ Error obteniendo estado del job ${token}:`, error.message);
    throw error;
  }
};

/**
 * Obtener métricas de la cola
 * @returns {Object} Métricas
 */
export const getQueueMetrics = async () => {
  if (!checkQueuesAvailable()) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0,
      unavailable: true
    };
  }

  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      documentosQueue.getWaitingCount(),
      documentosQueue.getActiveCount(),
      documentosQueue.getCompletedCount(),
      documentosQueue.getFailedCount(),
      documentosQueue.getDelayedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };

  } catch (error) {
    console.error('❌ Error obteniendo métricas de la cola:', error.message);
    throw error;
  }
};

/**
 * Limpiar jobs antiguos (mantenimiento)
 * @param {Number} hoursAgo - Limpiar jobs más antiguos que X horas
 */
export const cleanOldJobs = async (hoursAgo = 24) => {
  if (!checkQueuesAvailable()) {
    console.log('⚠️  Colas no disponibles, no hay jobs para limpiar');
    return;
  }

  try {
    await documentosQueue.clean(hoursAgo * 3600 * 1000, 1000, 'completed');
    await documentosQueue.clean(hoursAgo * 3600 * 1000, 1000, 'failed');

    console.log(`🗑️  Jobs limpiados (más antiguos que ${hoursAgo}h)`);

  } catch (error) {
    console.error('❌ Error limpiando jobs:', error.message);
  }
};

/**
 * Cerrar colas (para graceful shutdown)
 */
export const closeQueues = async () => {
  if (!checkQueuesAvailable()) {
    console.log('⚠️  No hay colas para cerrar');
    return;
  }

  try {
    await documentosQueue.close();
    await thumbnailsQueue.close();
    await emailsQueue.close();
    console.log('✅ Colas cerradas correctamente');
  } catch (error) {
    console.error('❌ Error cerrando colas:', error.message);
  }
};
