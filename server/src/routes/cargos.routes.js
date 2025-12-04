/**
 * Cargos Routes - Sprint 2
 * Routes for cargos and GTC-45 matriz endpoints
 */

import { Router } from 'express';
import {
    getCargosByEmpresa,
    getCargoDetalle,
    getMatrizGTC45,
    getControlesByEmpresa,
    createCargo,
    updateCargo
} from '../controllers/cargos.controller.js';
import { authenticate, requireOwnEmpresa } from '../middleware/authenticate.js';

const router = Router();

// Get all cargos for an empresa (protected)
router.get('/empresa/:empresaId', authenticate, requireOwnEmpresa('empresaId'), getCargosByEmpresa);

// Get cargo detail with all riesgos (protected)
router.get('/detalle/:cargoId', authenticate, getCargoDetalle);

// Get GTC-45 matriz for empresa (protected)
router.get('/matriz-gtc45/:empresaId', authenticate, requireOwnEmpresa('empresaId'), getMatrizGTC45);

// Get controls by hierarchy for empresa (protected)
router.get('/controles/:empresaId', authenticate, requireOwnEmpresa('empresaId'), getControlesByEmpresa);

// Create new cargo (protected)
router.post('/', authenticate, createCargo);

// Update cargo (protected)
router.put('/:cargoId', authenticate, updateCargo);

export default router;
