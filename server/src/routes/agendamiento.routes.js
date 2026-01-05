/**
 * SPRINT 8: Agendamiento Routes
 * Rutas para gestión de agendamientos de exámenes médicos
 */

import { Router } from 'express';
import {
    registrarAgendamiento,
    registrarAgendamientoBatch,
    obtenerAgendamientos,
    actualizarAgendamiento,
    obtenerConfiguracionGoogle
} from '../controllers/agendamiento.controller.js';
import { authenticate, requireOwnEmpresa } from '../middleware/authenticate.js';

const router = Router();

// Obtener configuración de Google Forms/Sheets
router.get('/config/google', authenticate, obtenerConfiguracionGoogle);

// Registrar múltiples agendamientos en batch (protected)
router.post('/empresa/:empresaId/batch', authenticate, requireOwnEmpresa('empresaId'), registrarAgendamientoBatch);

// Registrar nuevo agendamiento (protected)
router.post('/empresa/:empresaId', authenticate, requireOwnEmpresa('empresaId'), registrarAgendamiento);

// Obtener agendamientos de una empresa (protected)
router.get('/empresa/:empresaId', authenticate, requireOwnEmpresa('empresaId'), obtenerAgendamientos);

// Actualizar un agendamiento (protected)
router.put('/:agendamientoId', authenticate, actualizarAgendamiento);

export default router;




