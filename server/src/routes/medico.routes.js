/**
 * Rutas de Médico Ocupacional
 * Todas las rutas requieren rol medico_ocupacional (o admin_genesys)
 *
 * Prefijo: /api/medico
 */

import { Router } from 'express';
import { authenticate, requireRole, requireMedicoAccess } from '../middleware/authenticate.js';
import { profesiogramaUpdateLimiter, uploadLimiter } from '../middleware/rateLimiter.js';
import multer from 'multer';

// Controllers
import * as empresasController from '../controllers/medico/empresas.controller.js';
import * as profesiogramaController from '../controllers/medico/profesiograma.controller.js';
import * as firmaController from '../controllers/medico/firma.controller.js';

const router = Router();

// Configuración de multer para upload de firma (solo PNG)
const uploadFirma = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 // 500KB máximo para firma
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/png') {
            cb(new Error('Solo se permiten archivos PNG para la firma'), false);
        } else {
            cb(null, true);
        }
    }
});

// ==========================================
// MIDDLEWARE: Solo medico_ocupacional o admin
// ==========================================
router.use(authenticate, requireRole('medico_ocupacional', 'admin_genesys'));

// ==========================================
// MIS EMPRESAS (asignadas al médico)
// ==========================================
router.get('/empresas', empresasController.misEmpresas);
router.get('/empresas/:empresaId', requireMedicoAccess(), empresasController.detalleEmpresa);
router.get('/empresas/:empresaId/cargos', requireMedicoAccess(), empresasController.cargosPorEmpresa);

// ==========================================
// PROFESIOGRAMA
// ==========================================
router.get('/profesiograma/:empresaId', requireMedicoAccess(), profesiogramaController.obtener);
router.put('/profesiograma/:empresaId', profesiogramaUpdateLimiter, requireMedicoAccess(), profesiogramaController.actualizar);
router.post('/profesiograma/:empresaId/regenerar', requireMedicoAccess(), profesiogramaController.regenerarPDF);

// Rutas de cargo individual (para edición detallada)
router.get('/empresas/:empresaId/cargos/:cargoId', requireMedicoAccess(), profesiogramaController.obtenerCargo);
router.put('/empresas/:empresaId/cargos/:cargoId', profesiogramaUpdateLimiter, requireMedicoAccess(), profesiogramaController.actualizarCargo);

// ==========================================
// APROBACIÓN DE CARGOS
// ==========================================
router.get('/empresas/:empresaId/aprobaciones', requireMedicoAccess(), profesiogramaController.obtenerEstadosAprobacion);
router.put('/empresas/:empresaId/cargos/:cargoId/aprobar', profesiogramaUpdateLimiter, requireMedicoAccess(), profesiogramaController.aprobarCargo);
router.put('/empresas/:empresaId/cargos/:cargoId/desaprobar', profesiogramaUpdateLimiter, requireMedicoAccess(), profesiogramaController.desaprobarCargo);

// Alias con prefijo /empresas (legacy)
router.get('/empresas/:empresaId/profesiograma', requireMedicoAccess(), profesiogramaController.obtener);
router.put('/empresas/:empresaId/profesiograma', profesiogramaUpdateLimiter, requireMedicoAccess(), profesiogramaController.actualizar);
router.post('/empresas/:empresaId/profesiograma/regenerar', requireMedicoAccess(), profesiogramaController.regenerarPDF);

// ==========================================
// FIRMA DIGITAL
// ==========================================
router.get('/firma', firmaController.obtener);
router.post('/firma', uploadLimiter, uploadFirma.single('firma'), firmaController.subir);
router.delete('/firma', firmaController.eliminar);
router.get('/firma/validar', firmaController.validar);

export default router;
