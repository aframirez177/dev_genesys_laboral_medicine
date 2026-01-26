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
import knex from '../config/database.js';

const router = Router();

// Check payment status for empresa (used by paywall)
router.get('/empresa/:empresaId/payment-status', authenticate, requireOwnEmpresa('empresaId'), async (req, res) => {
    try {
        const empresa = await knex('empresas')
            .where('id', req.params.empresaId)
            .select('status', 'ultimo_pago')
            .first();
        if (!empresa) {
            return res.status(404).json({ success: false });
        }
        const paid = empresa.status === 'activa' && empresa.ultimo_pago != null;
        res.json({ success: true, paid, status: empresa.status, ultimo_pago: empresa.ultimo_pago });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

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
