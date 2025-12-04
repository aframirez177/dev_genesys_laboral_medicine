// server/src/routes/solicitud.routes.js
import express from 'express';
import {
  crearSolicitud,
  obtenerEstado,
  obtenerSolicitud
} from '../controllers/solicitud.controller.js';

const router = express.Router();

/**
 * RUTAS DE SOLICITUDES (ASYNC)
 * Base: /api/solicitudes
 *
 * Reemplazan al endpoint sincrónico /api/flujo-ia/registrar-y-generar
 */

// POST /api/solicitudes - Crear solicitud (async, respuesta inmediata)
router.post('/', crearSolicitud);

// GET /api/solicitudes/:token/estado - Polling de progreso
router.get('/:token/estado', obtenerEstado);

// GET /api/solicitudes/:token - Detalles completos de la solicitud
router.get('/:token', obtenerSolicitud);

export default router;
