// server/src/routes/catalogo.routes.js
import express from 'express';
import {
  getRiesgos,
  getRiesgoById,
  getSectores,
  getSectorById,
  getCiudades,
  getDepartamentos,
  searchCiudades,
  buscarGES,
  getGESById,
  getGESBatch,
  getGESBySector,
  getGESComunes,
  getStats,
  invalidateCache,
  validateCategories
} from '../controllers/catalogo.controller.js';

const router = express.Router();

/**
 * RUTAS DEL CATÁLOGO DE RIESGOS Y GES
 * Base: /api/catalogo
 */

// ========================================
// RIESGOS
// ========================================

// GET /api/catalogo/riesgos - Obtener todos los tipos de riesgo
router.get('/riesgos', getRiesgos);

// GET /api/catalogo/riesgos/:id - Obtener un riesgo por ID o código
router.get('/riesgos/:id', getRiesgoById);

// ========================================
// SECTORES
// ========================================

// GET /api/catalogo/sectores - Obtener todos los sectores económicos
router.get('/sectores', getSectores);

// GET /api/catalogo/sectores/:id - Obtener un sector por ID o código
router.get('/sectores/:id', getSectorById);

// ========================================
// CIUDADES DE COLOMBIA
// ========================================

// GET /api/catalogo/ciudades/search - Buscar ciudades (debe ir antes de /:departamento)
router.get('/ciudades/search', searchCiudades);

// GET /api/catalogo/departamentos - Obtener lista de departamentos
router.get('/departamentos', getDepartamentos);

// GET /api/catalogo/ciudades - Obtener todas las ciudades
router.get('/ciudades', getCiudades);

// ========================================
// GES (Grupos de Exposición Similar)
// ========================================

// GET /api/catalogo/ges/comunes - Obtener GES más comunes (debe ir antes de /:id)
router.get('/ges/comunes', getGESComunes);

// POST /api/catalogo/ges/batch - Obtener múltiples GES por IDs (lazy loading)
router.post('/ges/batch', getGESBatch);

// GET /api/catalogo/ges/sector/:sectorCodigo - Obtener GES por sector
router.get('/ges/sector/:sectorCodigo', getGESBySector);

// GET /api/catalogo/ges/:id - Obtener un GES específico por ID
router.get('/ges/:id', getGESById);

// GET /api/catalogo/ges - Buscar GES con filtros múltiples
router.get('/ges', buscarGES);

// ========================================
// ESTADÍSTICAS Y ADMINISTRACIÓN
// ========================================

// GET /api/catalogo/stats - Obtener estadísticas del catálogo
router.get('/stats', getStats);

// POST /api/catalogo/cache/invalidate - Invalidar cache (admin)
router.post('/cache/invalidate', invalidateCache);

// ========================================
// VALIDACIÓN DE CATÁLOGO (H3 - UX Audit)
// ========================================

// GET /api/catalogo/validate-categories - Validar categorías de riesgos
router.get('/validate-categories', validateCategories);

export default router;
