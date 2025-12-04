// server/src/controllers/catalogo.controller.js
import CatalogoService from '../services/CatalogoService.js';

/**
 * CONTROLADOR: Catálogo de Riesgos y GES
 * Expone endpoints REST para acceder a los catálogos
 */

/**
 * GET /api/catalogo/riesgos
 * Obtener todos los tipos de riesgo (RF, RB, RQ, etc.)
 */
export const getRiesgos = async (req, res) => {
  try {
    const { activo } = req.query;

    const options = {};
    if (activo !== undefined) {
      options.activo = activo === 'true';
    }

    const riesgos = await CatalogoService.getRiesgos(options);

    res.json({
      success: true,
      data: riesgos,
      total: riesgos.length,
      cached: true // Siempre viene del cache o se cachea
    });

  } catch (error) {
    console.error('❌ Error en getRiesgos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tipos de riesgo',
      error: error.message
    });
  }
};

/**
 * GET /api/catalogo/riesgos/:id
 * Obtener un tipo de riesgo por ID o código
 */
export const getRiesgoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Si es un número, buscar por ID, sino por código
    const idOrCodigo = !isNaN(id) ? parseInt(id) : id;

    const riesgo = await CatalogoService.getRiesgoById(idOrCodigo);

    if (!riesgo) {
      return res.status(404).json({
        success: false,
        message: `Riesgo no encontrado: ${id}`
      });
    }

    res.json({
      success: true,
      data: riesgo
    });

  } catch (error) {
    console.error('❌ Error en getRiesgoById:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo riesgo',
      error: error.message
    });
  }
};

/**
 * GET /api/catalogo/sectores
 * Obtener todos los sectores económicos
 */
export const getSectores = async (req, res) => {
  try {
    const { activo } = req.query;

    const options = {};
    if (activo !== undefined) {
      options.activo = activo === 'true';
    }

    const sectores = await CatalogoService.getSectores(options);

    res.json({
      success: true,
      data: sectores,
      total: sectores.length
    });

  } catch (error) {
    console.error('❌ Error en getSectores:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo sectores económicos',
      error: error.message
    });
  }
};

/**
 * GET /api/catalogo/sectores/:id
 * Obtener un sector por ID o código
 */
export const getSectorById = async (req, res) => {
  try {
    const { id } = req.params;

    const idOrCodigo = !isNaN(id) ? parseInt(id) : id;
    const sector = await CatalogoService.getSectorById(idOrCodigo);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: `Sector no encontrado: ${id}`
      });
    }

    res.json({
      success: true,
      data: sector
    });

  } catch (error) {
    console.error('❌ Error en getSectorById:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo sector',
      error: error.message
    });
  }
};

/**
 * GET /api/catalogo/ges
 * Buscar GES con múltiples filtros
 * Query params:
 * - fields: Modo de campos ('light' para lazy loading, omitir para todos)
 * - riesgoId: Filtrar por ID de riesgo
 * - riesgoCodigo: Filtrar por código de riesgo (ej: 'RF', 'RB')
 * - sectorCodigo: Filtrar por sector relevante
 * - relevanciaMinima: Relevancia mínima en el sector (1-10)
 * - search: Término de búsqueda (Full-Text Search)
 * - esComun: Filtrar solo GES comunes (true/false)
 * - activo: Filtrar solo activos (true/false)
 * - limit: Límite de resultados (default: 50)
 * - offset: Offset para paginación (default: 0)
 * - page: Número de página (alternativa a offset)
 */
export const buscarGES = async (req, res) => {
  try {
    const {
      fields,
      riesgoId,
      riesgoCodigo,
      sectorCodigo,
      relevanciaMinima,
      search,
      esComun,
      activo,
      limit = 50,
      offset = 0,
      page
    } = req.query;

    // Construir filtros
    const filters = {};

    // 🆕 LAZY LOADING: Si fields=light, solo cargar campos básicos
    if (fields === 'light') {
      // NOTA: catalogo_ges NO tiene columna 'descripcion' (ver migration)
      // Solo cargar campos esenciales para performance
      filters.fields = ['id', 'nombre', 'riesgo_id', 'es_comun', 'orden'];
    }

    if (riesgoId) filters.riesgoId = parseInt(riesgoId);
    if (riesgoCodigo) filters.riesgoCodigo = riesgoCodigo;
    if (sectorCodigo) filters.sectorCodigo = sectorCodigo;
    if (relevanciaMinima) filters.relevanciaMinima = parseInt(relevanciaMinima);
    if (search) filters.search = search;
    if (esComun !== undefined) filters.esComun = esComun === 'true';
    if (activo !== undefined) filters.activo = activo === 'true';

    // Paginación
    filters.limit = Math.min(parseInt(limit), 100); // Máximo 100 por página

    if (page) {
      // Si usa "page", calcular offset
      filters.offset = (parseInt(page) - 1) * filters.limit;
    } else {
      filters.offset = parseInt(offset);
    }

    const resultado = await CatalogoService.buscarGES(filters);

    res.json({
      success: true,
      ...resultado,
      mode: fields === 'light' ? 'light' : 'full', // Indicar modo
      filters: filters // Incluir filtros aplicados para debugging
    });

  } catch (error) {
    console.error('❌ Error en buscarGES:', error);
    res.status(500).json({
      success: false,
      message: 'Error buscando GES',
      error: error.message
    });
  }
};

/**
 * GET /api/catalogo/ges/:id
 * Obtener un GES específico por ID
 */
export const getGESById = async (req, res) => {
  try {
    const { id } = req.params;

    const ges = await CatalogoService.getGESById(parseInt(id));

    if (!ges) {
      return res.status(404).json({
        success: false,
        message: `GES no encontrado: ${id}`
      });
    }

    res.json({
      success: true,
      data: ges
    });

  } catch (error) {
    console.error('❌ Error en getGESById:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo GES',
      error: error.message
    });
  }
};

/**
 * GET /api/catalogo/ges/sector/:sectorCodigo
 * Obtener GES más relevantes para un sector específico
 * Query params:
 * - relevanciaMinima: Relevancia mínima (default: 7)
 * - limit: Límite de resultados (default: 20)
 */
export const getGESBySector = async (req, res) => {
  try {
    const { sectorCodigo } = req.params;
    const { relevanciaMinima = 7, limit = 20 } = req.query;

    const ges = await CatalogoService.getGESBySector(
      sectorCodigo,
      parseInt(relevanciaMinima),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: ges,
      total: ges.length,
      sector: sectorCodigo,
      relevanciaMinima: parseInt(relevanciaMinima)
    });

  } catch (error) {
    console.error('❌ Error en getGESBySector:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo GES por sector',
      error: error.message
    });
  }
};

/**
 * GET /api/catalogo/ges/comunes
 * Obtener GES más comunes (top 10)
 * Query params:
 * - limit: Límite de resultados (default: 10)
 */
export const getGESComunes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const ges = await CatalogoService.getGESComunes(parseInt(limit));

    res.json({
      success: true,
      data: ges,
      total: ges.length
    });

  } catch (error) {
    console.error('❌ Error en getGESComunes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo GES comunes',
      error: error.message
    });
  }
};

/**
 * GET /api/catalogo/stats
 * Obtener estadísticas del catálogo
 */
export const getStats = async (req, res) => {
  try {
    const [gesByRiesgo, cacheStats] = await Promise.all([
      CatalogoService.getGESCountByRiesgo(),
      Promise.resolve(CatalogoService.getCacheStats())
    ]);

    res.json({
      success: true,
      data: {
        gesByRiesgo,
        cache: cacheStats
      }
    });

  } catch (error) {
    console.error('❌ Error en getStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};

/**
 * POST /api/catalogo/cache/invalidate
 * Invalidar cache completo (solo para admin/desarrollo)
 */
export const invalidateCache = async (req, res) => {
  try {
    await CatalogoService.invalidateAllCache();

    res.json({
      success: true,
      message: 'Cache invalidado correctamente'
    });

  } catch (error) {
    console.error('❌ Error en invalidateCache:', error);
    res.status(500).json({
      success: false,
      message: 'Error invalidando cache',
      error: error.message
    });
  }
};

// ========================================
// LAZY LOADING - Batch fetch de GES
// ========================================

/**
 * POST /api/catalogo/ges/batch
 * Obtener detalles completos de múltiples GES por IDs (batch fetch)
 * Para lazy loading: cargar detalles solo cuando se necesiten
 *
 * Request body:
 * {
 *   "ges_ids": [1, 5, 12, 24]
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [ ... GES con todos los detalles ... ],
 *   "count": 4,
 *   "requested": 4
 * }
 */
export const getGESBatch = async (req, res) => {
  try {
    const { ges_ids } = req.body;

    // Validar input
    if (!Array.isArray(ges_ids)) {
      return res.status(400).json({
        success: false,
        message: 'ges_ids debe ser un array'
      });
    }

    if (ges_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ges_ids no puede estar vacío'
      });
    }

    if (ges_ids.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Máximo 50 GES por request (recibidos: ' + ges_ids.length + ')'
      });
    }

    // Validar que sean números
    const invalidIds = ges_ids.filter(id => typeof id !== 'number' || id < 1);
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Todos los IDs deben ser números positivos',
        invalidIds
      });
    }

    // Obtener GES desde el service
    const gesDetails = await CatalogoService.getGESByIds(ges_ids);

    res.json({
      success: true,
      data: gesDetails,
      count: gesDetails.length,
      requested: ges_ids.length,
      notFound: ges_ids.length - gesDetails.length
    });

  } catch (error) {
    console.error('❌ Error en getGESBatch:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo GES batch',
      error: error.message
    });
  }
};

// ========================================
// VALIDACIÓN DE CATÁLOGO (H3 - UX Audit)
// ========================================

/**
 * GET /api/catalogo/validate-categories
 * Validar que todas las categorías de riesgos esperadas existan en el catálogo
 * Detecta categorías faltantes (ej: Riesgo Eléctrico)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "ok": false,
 *     "total": 14,
 *     "existing": 13,
 *     "missing": ["Eléctrico"],
 *     "details": [...],
 *     "timestamp": "2025-11-11T..."
 *   }
 * }
 */
export const validateCategories = async (req, res) => {
  try {
    const validation = await CatalogoService.validateRiesgoCategories();

    // Log de resultado
    if (!validation.ok) {
      console.warn(`⚠️  [API] Validación de catálogo: ${validation.missing.length} categorías faltantes`);
    } else {
      console.log(`✅ [API] Validación de catálogo: Todas las categorías presentes`);
    }

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('❌ Error en validateCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando categorías del catálogo',
      error: error.message
    });
  }
};
