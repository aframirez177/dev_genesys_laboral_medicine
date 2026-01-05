/**
 * Examenes Routes - Sprint 4
 * Routes for medical exams and heatmap endpoints
 */

import { Router } from 'express';
import { getExamenesByEmpresa, getExamenesByCargo, getMapaCalorNR, getDashboardKPIs, getExamenesTabla } from '../controllers/examenes.controller.js';
import { authenticate, requireOwnEmpresa } from '../middleware/authenticate.js';

const router = Router();

// Get all required exams for an empresa (protected)
router.get('/empresa/:empresaId', authenticate, requireOwnEmpresa('empresaId'), getExamenesByEmpresa);

// Get exams for a specific cargo (protected)
router.get('/cargo/:cargoId', authenticate, getExamenesByCargo);

// Get NR heatmap data for empresa (protected)
router.get('/mapa-calor/:empresaId', authenticate, requireOwnEmpresa('empresaId'), getMapaCalorNR);

// Get dashboard KPIs for empresa (protected)
router.get('/kpis/:empresaId', authenticate, requireOwnEmpresa('empresaId'), getDashboardKPIs);

// SPRINT 8: Get exámenes en formato tabla con trabajadores numerados
router.get('/tabla/:empresaId', authenticate, requireOwnEmpresa('empresaId'), getExamenesTabla);

export default router;
