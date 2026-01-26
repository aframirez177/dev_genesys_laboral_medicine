/**
 * Rutas de Administrador Genesys
 * Todas las rutas requieren rol admin_genesys
 *
 * Prefijo: /api/admin
 */

import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import multer from 'multer';

// Controllers
import * as pagosController from '../controllers/admin/pagos.controller.js';
import * as medicosController from '../controllers/admin/medicos.controller.js';
import * as empresasController from '../controllers/admin/empresas.controller.js';
import * as auditoriaController from '../controllers/admin/auditoria.controller.js';

const router = Router();

// Configuración de multer para uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Permitir imágenes y PDFs
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
});

// ==========================================
// MIDDLEWARE: Solo admin_genesys
// ==========================================
router.use(authenticate, requireRole('admin_genesys'));

// ==========================================
// PAGOS MANUALES
// ==========================================
router.get('/pagos', pagosController.listar);
router.get('/pagos/estadisticas', pagosController.estadisticas);
router.get('/pagos/:id', pagosController.obtener);
router.post('/pagos', upload.single('evidencia'), pagosController.registrar);
router.post('/pagos/:id/aprobar', pagosController.aprobar);
router.post('/pagos/:id/rechazar', pagosController.rechazar);

// ==========================================
// MÉDICOS OCUPACIONALES
// ==========================================
router.get('/medicos', medicosController.listar);
router.get('/medicos/:id', medicosController.obtener);
router.post('/medicos', medicosController.crear);
router.put('/medicos/:id', medicosController.actualizar);
router.get('/medicos/:id/empresas', medicosController.empresasAsignadas);
router.post('/medicos/:id/empresas', medicosController.asignarEmpresas); // Asignar múltiples empresas
router.post('/medicos/:medicoId/asignar/:empresaId', medicosController.asignarEmpresa);
router.delete('/medicos/:medicoId/desasignar/:empresaId', medicosController.desasignarEmpresa);

// ==========================================
// EMPRESAS
// ==========================================
router.get('/empresas', empresasController.listar);
router.get('/empresas/:id', empresasController.obtener);
router.put('/empresas/:id', empresasController.actualizar);
router.post('/empresas/:id/suspender', empresasController.suspender);
router.post('/empresas/:id/activar', empresasController.activar);
router.post('/empresas/:id/marcar-pagado', empresasController.marcarPagado);
router.get('/empresas/:id/medicos', empresasController.medicosAsignados);

// ==========================================
// AUDITORÍA
// ==========================================
router.get('/auditoria', auditoriaController.listar);
router.get('/auditoria/exportar', auditoriaController.exportar);
router.get('/auditoria/acciones', auditoriaController.accionesDisponibles);
router.get('/auditoria/recursos', auditoriaController.recursosDisponibles);

export default router;
