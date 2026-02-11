/**
 * Rutas de Mensajería Médico-Empresa
 *
 * Sistema de comunicación asíncrona entre médicos ocupacionales y empresas.
 *
 * Prefijo: /api/medico y /api/empresa
 */

import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import * as mensajesController from '../controllers/mensajes.controller.js';

const router = Router();

// ==========================================
// RUTAS PARA MÉDICO
// Prefijo: /api/medico/conversaciones
// ==========================================

// Listar conversaciones del médico
router.get(
    '/medico/conversaciones',
    authenticate,
    requireRole('medico_ocupacional', 'admin_genesys'),
    mensajesController.listarConversacionesMedico
);

// Crear nueva conversación
router.post(
    '/medico/conversaciones',
    authenticate,
    requireRole('medico_ocupacional', 'admin_genesys'),
    mensajesController.crearConversacionMedico
);

// Obtener mensajes de una conversación
router.get(
    '/medico/conversaciones/:id/mensajes',
    authenticate,
    requireRole('medico_ocupacional', 'admin_genesys'),
    mensajesController.obtenerMensajesMedico
);

// Enviar mensaje en una conversación
router.post(
    '/medico/conversaciones/:id/mensajes',
    authenticate,
    requireRole('medico_ocupacional', 'admin_genesys'),
    mensajesController.enviarMensajeMedico
);

// Cerrar conversación
router.put(
    '/medico/conversaciones/:id/cerrar',
    authenticate,
    requireRole('medico_ocupacional', 'admin_genesys'),
    mensajesController.cerrarConversacionMedico
);

// Contador de mensajes no leídos
router.get(
    '/medico/mensajes/no-leidos',
    authenticate,
    requireRole('medico_ocupacional', 'admin_genesys'),
    mensajesController.contadorNoLeidosMedico
);

// ==========================================
// RUTAS PARA EMPRESA
// Prefijo: /api/empresa/conversaciones
// ==========================================

// Listar conversaciones de la empresa
router.get(
    '/empresa/conversaciones',
    authenticate,
    requireRole('empresa', 'admin_genesys'),
    mensajesController.listarConversacionesEmpresa
);

// Obtener mensajes de una conversación
router.get(
    '/empresa/conversaciones/:id/mensajes',
    authenticate,
    requireRole('empresa', 'admin_genesys'),
    mensajesController.obtenerMensajesEmpresa
);

// Enviar mensaje (respuesta)
router.post(
    '/empresa/conversaciones/:id/mensajes',
    authenticate,
    requireRole('empresa', 'admin_genesys'),
    mensajesController.enviarMensajeEmpresa
);

// Contador de mensajes no leídos
router.get(
    '/empresa/mensajes/no-leidos',
    authenticate,
    requireRole('empresa', 'admin_genesys'),
    mensajesController.contadorNoLeidosEmpresa
);

export default router;
