import { Router } from 'express';
import { getDocumentStatus, getDocumentsByEmpresa } from '../controllers/documentos.controller.js';
import { authenticate, requireOwnEmpresa } from '../middleware/authenticate.js';

const router = Router();

// Ruta publica: Consultar estado de un documento por token
router.get('/status/:token', getDocumentStatus);

// Ruta protegida: Obtener documentos de una empresa (para dashboard)
router.get('/empresa/:empresaId', authenticate, requireOwnEmpresa('empresaId'), getDocumentsByEmpresa);

export default router; 