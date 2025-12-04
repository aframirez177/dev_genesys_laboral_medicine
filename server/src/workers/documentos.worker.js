// server/src/workers/documentos.worker.js
import { Worker } from 'bullmq';
import { redisQueueClient } from '../config/redis.js';
import { getEnvVars } from '../config/env.js';
import SolicitudService from '../services/SolicitudService.js';
import riesgosService from '../services/riesgos.service.js';
import db from '../config/database.js';

// Importar generadores de documentos
import { generarMatrizExcel } from '../controllers/matriz-riesgos.controller.js';
import { generarProfesiogramaPDF } from '../controllers/profesiograma.controller.js';
import { generarPerfilCargoPDF } from '../controllers/perfil-cargo.controller.js';
import { generarCotizacionPDF } from '../controllers/cotizacion.controller.js';
import { uploadToSpaces } from '../utils/spaces.js';
import { generatePDFThumbnail as generatePDFThumbnailFast } from '../utils/pdfThumbnail.js';
import { generateExcelThumbnail } from '../utils/documentThumbnail.js';

const env = getEnvVars();

/**
 * WORKER: documentos-queue
 * Procesa jobs de generación de documentos de forma asíncrona
 *
 * Flujo completo:
 * 1. Validación (5%)
 * 2. Enriquecimiento de datos con NR (10%)
 * 3. Guardar cargos y riesgos en BD (15%)
 * 4. Generar documentos (20-60%)
 * 5. Generar thumbnails (70%)
 * 6. Subir a Spaces (80%)
 * 7. Actualizar BD (95%)
 * 8. Completado (100%)
 */

/**
 * Función procesadora principal
 * @param {Object} job - Job de BullMQ
 * @returns {Object} Resultado del procesamiento
 */
const processDocumento = async (job) => {
  const { name, data } = job;
  const { token, documentoId, empresaId, empresaData, formData, numCargos, pricing } = data;

  console.log(`🚀 Worker procesando: ${name}`);
  console.log(`   Token: ${token}`);
  console.log(`   Empresa: ${empresaData.nombreLegal}`);
  console.log(`   Cargos: ${numCargos}`);

  try {
    // FASE 1: Validación (5%)
    await job.updateProgress(5);
    await SolicitudService.actualizarProgreso(token, 5, 'procesando');

    if (!token || !formData || !empresaData) {
      throw new Error('Datos incompletos en el job');
    }

    // FASE 2: Enriquecer formData con cálculos de NR (10%)
    await job.updateProgress(10);
    await SolicitudService.actualizarProgreso(token, 10);
    console.log('🔄 Calculando NP/NR y consolidando controles...');

    const formDataEnriquecido = {
      ...formData,
      cargos: formData.cargos.map((cargo) => {
        try {
          const controlesConsolidados = riesgosService.consolidarControlesCargo(cargo);

          return {
            ...cargo,
            gesSeleccionados: (cargo.gesSeleccionados || []).map(ges => {
              try {
                const niveles = riesgosService.calcularNivelesRiesgo(ges);
                return { ...ges, ...niveles };
              } catch (error) {
                console.warn(`  ⚠️ Error calculando niveles para GES "${ges.ges}":`, error.message);
                return ges;
              }
            }),
            controlesConsolidados
          };
        } catch (error) {
          console.error(`❌ Error consolidando controles para cargo "${cargo.cargoName}":`, error.message);
          return cargo;
        }
      })
    };

    // FASE 3: Guardar cargos y riesgos en BD (15%)
    await job.updateProgress(15);
    await SolicitudService.actualizarProgreso(token, 15);
    console.log('💾 Guardando cargos y riesgos en BD...');

    let trx = await db.transaction();
    try {
      for (const cargo of formDataEnriquecido.cargos) {
        const [cargoDB] = await trx('cargos_documento').insert({
          documento_id: documentoId,
          nombre_cargo: cargo.cargoName,
          area: cargo.area,
          descripcion_tareas: cargo.descripcionTareas,
          zona: cargo.zona,
          num_trabajadores: cargo.numTrabajadores,
          tareas_rutinarias: cargo.tareasRutinarias || false
        }).returning('*');

        if (cargo.gesSeleccionados && Array.isArray(cargo.gesSeleccionados)) {
          for (const ges of cargo.gesSeleccionados) {
            await trx('riesgos_cargo').insert({
              cargo_id: cargoDB.id,
              tipo_riesgo: ges.riesgo,
              descripcion_riesgo: ges.ges,
              nivel_deficiencia: ges.niveles?.deficiencia?.value || ges.nd,
              nivel_exposicion: ges.niveles?.exposicion?.value || ges.ne,
              nivel_consecuencia: ges.niveles?.consecuencia?.value || ges.nc,
              controles_fuente: ges.controles?.fuente || null,
              controles_medio: ges.controles?.medio || null,
              controles_individuo: ges.controles?.individuo || null
            });
          }
        }
      }
      await trx.commit();
      console.log('✅ Cargos y riesgos guardados');
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    // FASE 4: Generar documentos (20-60%)
    await job.updateProgress(20);
    await SolicitudService.actualizarProgreso(token, 20);
    console.log('📄 Generando documentos...');

    const generationPromises = [
      generarMatrizExcel(formDataEnriquecido, {
        companyName: empresaData.nombreLegal,
        nit: empresaData.nit,
        diligenciadoPor: empresaData.nombreResponsable
      }),
      generarProfesiogramaPDF(formDataEnriquecido, { companyName: empresaData.nombreLegal }),
      generarPerfilCargoPDF(formDataEnriquecido, { companyName: empresaData.nombreLegal }),
      generarCotizacionPDF(formDataEnriquecido)
    ];

    const [matrizBuffer, profesiogramaBuffer, perfilBuffer, cotizacionBuffer] = await Promise.all(generationPromises);
    await job.updateProgress(60);
    await SolicitudService.actualizarProgreso(token, 60);
    console.log('✅ Buffers de documentos generados');

    // FASE 5: Generar thumbnails (70%)
    await job.updateProgress(70);
    await SolicitudService.actualizarProgreso(token, 70);
    console.log('🖼️  Generando thumbnails...');

    const thumbnailPromises = [
      generateExcelThumbnail(matrizBuffer, { width: 800, quality: 95, maxRows: 12, maxCols: 8 }),
      generatePDFThumbnailFast(profesiogramaBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 3.5 }),
      generatePDFThumbnailFast(perfilBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 4.0 }),
      generatePDFThumbnailFast(cotizacionBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 4.0 })
    ];

    const [matrizThumbnail, profesiogramaThumbnail, perfilThumbnail, cotizacionThumbnail] = await Promise.all(thumbnailPromises);
    console.log('✅ Thumbnails generados');

    // FASE 6: Subir a Spaces (80%)
    await job.updateProgress(80);
    await SolicitudService.actualizarProgreso(token, 80);
    console.log('☁️  Subiendo archivos a Spaces...');

    const fechaActual = new Date().toISOString().split('T')[0];
    const empresaNormalizada = empresaData.nombreLegal
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    const finalUrls = {};
    const thumbnailUrls = {};

    // Subir documentos
    const uploads = [
      uploadToSpaces(matrizBuffer, `matriz-${empresaNormalizada}-${fechaActual}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      uploadToSpaces(profesiogramaBuffer, `profesiograma-${empresaNormalizada}-${fechaActual}.pdf`, 'application/pdf'),
      uploadToSpaces(perfilBuffer, `perfil-cargo-${empresaNormalizada}-${fechaActual}.pdf`, 'application/pdf'),
      uploadToSpaces(cotizacionBuffer, `cotizacion-${empresaNormalizada}-${fechaActual}.pdf`, 'application/pdf'),
      // Thumbnails
      uploadToSpaces(matrizThumbnail, `thumb-matriz-${empresaNormalizada}-${fechaActual}.jpg`, 'image/jpeg'),
      uploadToSpaces(profesiogramaThumbnail, `thumb-profesiograma-${empresaNormalizada}-${fechaActual}.jpg`, 'image/jpeg'),
      uploadToSpaces(perfilThumbnail, `thumb-perfil-${empresaNormalizada}-${fechaActual}.jpg`, 'image/jpeg'),
      uploadToSpaces(cotizacionThumbnail, `thumb-cotizacion-${empresaNormalizada}-${fechaActual}.jpg`, 'image/jpeg')
    ];

    const [matrizUrl, profesiogramaUrl, perfilUrl, cotizacionUrl, matrizThumbUrl, profesiogramaThumbUrl, perfilThumbUrl, cotizacionThumbUrl] = await Promise.all(uploads);

    finalUrls.matriz = matrizUrl;
    finalUrls.profesiograma = profesiogramaUrl;
    finalUrls.perfil = perfilUrl;
    finalUrls.cotizacion = cotizacionUrl;

    thumbnailUrls.matriz = matrizThumbUrl;
    thumbnailUrls.profesiograma = profesiogramaThumbUrl;
    thumbnailUrls.perfil = perfilThumbUrl;
    thumbnailUrls.cotizacion = cotizacionThumbUrl;

    console.log('✅ Archivos subidos a Spaces');

    // FASE 7: Actualizar BD (95%)
    await job.updateProgress(95);
    await SolicitudService.actualizarProgreso(token, 95);
    console.log('💾 Actualizando base de datos...');

    await SolicitudService.marcarCompletado(token, {
      ...finalUrls,
      thumbnails: thumbnailUrls
    });

    // FASE 8: Completado (100%)
    await job.updateProgress(100);
    console.log(`✅ Job completado: ${token}`);

    return {
      success: true,
      token,
      urls: finalUrls,
      thumbnails: thumbnailUrls,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Error procesando job:`, error);

    // Marcar como fallido
    await SolicitudService.marcarFallido(token, error.message);

    throw error;
  }
};

/**
 * Crear y configurar worker
 */
export const createDocumentosWorker = () => {
  const worker = new Worker('documentos', processDocumento, {
    connection: redisQueueClient,
    concurrency: env.WORKER_CONCURRENCY || 2,  // Procesar 2 jobs en paralelo
    limiter: {
      max: 10,          // Máximo 10 jobs
      duration: 60000   // Por minuto
    }
  });

  // Event handlers
  worker.on('completed', (job) => {
    console.log(`✅ Worker: Job ${job.id} completado`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Worker: Job ${job?.id} falló:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('❌ Worker error:', err.message);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`⚠️  Worker: Job ${jobId} estancado (stalled)`);
  });

  console.log('✅ Worker de documentos iniciado');
  return worker;
};

/**
 * Iniciar worker si se ejecuta directamente
 * Uso: node server/src/workers/documentos.worker.js
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Iniciando worker de documentos...');
  createDocumentosWorker();
}

export default createDocumentosWorker;
