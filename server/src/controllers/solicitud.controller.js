// server/src/controllers/solicitud.controller.js
import SolicitudService from '../services/SolicitudService.js';
import { getJobStatus } from '../config/queue.js';
import db from '../config/database.js';

/**
 * POST /api/solicitudes
 * Crear solicitud de generación de documentos (async)
 *
 * Body:
 * {
 *   formData: { cargos: [...] },
 *   userData: { nombreEmpresa, nit, email, password, ... }
 * }
 *
 * Response:
 * {
 *   success: true,
 *   token: "abc123...",
 *   jobId: "job-uuid",
 *   pricing: { ... },
 *   mensaje: "Solicitud creada..."
 * }
 */
export const crearSolicitud = async (req, res) => {
  try {
    const { formData, userData } = req.body;

    console.log('📝 Nueva solicitud recibida');
    console.log(`   Empresa: ${userData?.nombreEmpresa}`);
    console.log(`   Cargos: ${formData?.cargos?.length || 0}`);

    // Crear solicitud y encolar job
    const resultado = await SolicitudService.crearSolicitud(formData, userData);

    // Respuesta inmediata (job encolado)
    res.status(202).json(resultado); // 202 Accepted

  } catch (error) {
    console.error('❌ Error en crearSolicitud:', error);

    // Determinar código de error
    const statusCode = error.message.includes('Faltan datos') ||
                       error.message.includes('requiere al menos')
                       ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * GET /api/solicitudes/:token/estado
 * Obtener estado de una solicitud (polling)
 *
 * Response:
 * {
 *   success: true,
 *   documentoId: 123,
 *   estado: "procesando",
 *   progreso: 45,
 *   previewUrls: { ... },
 *   pricing: { ... },
 *   jobStatus: { ... }
 * }
 */
export const obtenerEstado = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requerido'
      });
    }

    // Obtener estado del documento
    const estadoDocumento = await SolicitudService.obtenerEstadoPorToken(token);

    // Si tiene jobId, obtener estado del job también
    let jobStatus = null;
    if (estadoDocumento.jobId) {
      try {
        jobStatus = await getJobStatus(token); // Usa token como jobId
      } catch (jobError) {
        console.warn(`⚠️ No se pudo obtener estado del job:`, jobError.message);
      }
    }

    res.json({
      success: true,
      ...estadoDocumento,
      jobStatus
    });

  } catch (error) {
    console.error('❌ Error en obtenerEstado:', error);

    const statusCode = error.message.includes('no encontrado') ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/solicitudes/:token
 * Obtener detalles completos de una solicitud
 *
 * Response:
 * {
 *   success: true,
 *   documento: { ... },
 *   empresa: { ... },
 *   usuario: { ... }
 * }
 */
export const obtenerSolicitud = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requerido'
      });
    }

    // Query completa con JOINs
    const resultado = await db('documentos_generados as d')
      .leftJoin('empresas as e', 'd.empresa_id', 'e.id')
      .leftJoin('users as u', 'd.usuario_lead_id', 'u.id')
      .select(
        'd.*',
        'e.nombre_legal as empresa_nombre',
        'e.nit as empresa_nit',
        'u.email as usuario_email',
        'u.full_name as usuario_nombre'
      )
      .where('d.token', token)
      .first();

    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Parsear JSONs
    const formData = JSON.parse(resultado.form_data || '{}');
    const previewUrls = JSON.parse(resultado.preview_urls || '{}');
    const pricing = JSON.parse(resultado.pricing || '{}');

    res.json({
      success: true,
      documento: {
        id: resultado.id,
        token: resultado.token,
        estado: resultado.estado,
        progreso: resultado.progreso,
        error: resultado.error,
        numCargos: resultado.num_cargos,
        nombreResponsable: resultado.nombre_responsable,
        createdAt: resultado.created_at,
        updatedAt: resultado.updated_at
      },
      empresa: {
        id: resultado.empresa_id,
        nombre: resultado.empresa_nombre,
        nit: resultado.empresa_nit
      },
      usuario: {
        id: resultado.usuario_lead_id,
        email: resultado.usuario_email,
        nombre: resultado.usuario_nombre
      },
      formData,
      previewUrls,
      pricing
    });

  } catch (error) {
    console.error('❌ Error en obtenerSolicitud:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
