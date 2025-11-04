/**
 * aiSuggestions.routes.js - Rutas para endpoints de IA
 */

import express from 'express';
import * as aiController from '../../controllers/ia/aiSuggestions.controller.js';

const router = express.Router();

// Sugerir GES para un cargo
router.post('/suggest-ges', aiController.suggestGES);

// Sugerir controles para un riesgo
router.post('/suggest-controls', aiController.suggestControls);

// Validar consistencia de un cargo
router.post('/validate-cargo', aiController.validateCargo);

// Obtener benchmarks por sector
router.get('/benchmarks/:sector', aiController.getBenchmarks);

// Autocompletar cargo
router.get('/autocomplete-cargo', aiController.autocompleteCargo);

// Calcular nivel de riesgo global
router.post('/calculate-risk-score', aiController.calculateRiskScore);

// Detectar cargos similares y sugerir copiar datos
router.post('/detect-similar-cargo', aiController.detectSimilarCargo);

export default router;
