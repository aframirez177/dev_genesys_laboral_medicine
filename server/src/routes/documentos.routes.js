import { Router } from 'express';
import { getDocumentStatus/* , downloadDocument */ } from '../controllers/documentos.controller.js';

const router = Router();

// Ruta para que el frontend consulte el estado de un trabajo de generación
router.get('/status/:token', getDocumentStatus);

// Ruta para descargar un archivo específico una vez que esté listo
// :tipo puede ser 'matriz-riesgos', 'profesiograma', etc.
/* router.get('/download/:token/:tipo', downloadDocument); */

export default router; 