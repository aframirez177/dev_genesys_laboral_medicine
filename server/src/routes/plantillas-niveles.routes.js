import express from 'express';
import PlantillasNivelesService from '../services/plantillas-niveles.service.js';

const router = express.Router();

/**
 * GET /api/plantillas-niveles
 * Obtener plantillas de una empresa
 */
router.get('/', async (req, res) => {
  try {
    const empresaId = req.query.empresa_id || 1; // TODO: Obtener de sesión

    const plantillas = await PlantillasNivelesService.obtenerPlantillas(empresaId);

    res.json({
      success: true,
      plantillas
    });
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas',
      error: error.message
    });
  }
});

/**
 * POST /api/plantillas-niveles/crear
 * Crear una nueva plantilla
 */
router.post('/crear', async (req, res) => {
  try {
    const empresaId = req.body.empresa_id || 1; // TODO: Obtener de sesión
    const plantillaData = req.body;

    const plantilla = await PlantillasNivelesService.crearPlantilla(empresaId, plantillaData);

    res.json({
      success: true,
      plantilla
    });
  } catch (error) {
    console.error('Error al crear plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear plantilla',
      error: error.message
    });
  }
});

/**
 * POST /api/plantillas-niveles/crear-defaults
 * Crear plantillas por defecto para una empresa
 */
router.post('/crear-defaults', async (req, res) => {
  try {
    const empresaId = req.body.empresa_id || 1; // TODO: Obtener de sesión

    const plantillas = await PlantillasNivelesService.crearPlantillasDefault(empresaId);

    res.json({
      success: true,
      message: `${plantillas.length} plantillas creadas exitosamente`,
      plantillas
    });
  } catch (error) {
    console.error('Error al crear plantillas default:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear plantillas default',
      error: error.message
    });
  }
});

/**
 * POST /api/plantillas-niveles/sugerir
 * Obtener sugerencias de niveles para un array de GES
 */
router.post('/sugerir', async (req, res) => {
  try {
    const empresaId = req.body.empresa_id || 1; // TODO: Obtener de sesión
    const gesArray = req.body.gesArray || [];

    if (!gesArray || gesArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'gesArray es requerido y no puede estar vacío'
      });
    }

    const sugerencias = await PlantillasNivelesService.sugerirNivelesParaGES(empresaId, gesArray);

    res.json({
      success: true,
      sugerencias,
      stats: {
        total: sugerencias.length,
        conPlantilla: sugerencias.filter(s => s.plantillaId).length,
        sinPlantilla: sugerencias.filter(s => !s.plantillaId).length,
        requierenRevision: sugerencias.filter(s => s.requiereRevision).length
      }
    });
  } catch (error) {
    console.error('Error al sugerir niveles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al sugerir niveles',
      error: error.message
    });
  }
});

/**
 * POST /api/plantillas-niveles/aplicar
 * Registrar aplicación de plantilla (para aprendizaje)
 */
router.post('/aplicar', async (req, res) => {
  try {
    const aplicacionData = req.body;

    const aplicacion = await PlantillasNivelesService.registrarAplicacion(aplicacionData);

    res.json({
      success: true,
      aplicacion
    });
  } catch (error) {
    console.error('Error al registrar aplicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar aplicación',
      error: error.message
    });
  }
});

/**
 * FASE 3: GET /api/plantillas-niveles/estadisticas
 * Obtener estadísticas completas de plantillas
 */
router.get('/estadisticas', async (req, res) => {
  try {
    const empresaId = req.query.empresa_id || 1; // TODO: Obtener de sesión

    const estadisticas = await PlantillasNivelesService.obtenerEstadisticas(empresaId);

    res.json({
      success: true,
      estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

/**
 * FASE 3: GET /api/plantillas-niveles/sugerencias-actualizacion
 * Obtener sugerencias de plantillas para actualizar
 */
router.get('/sugerencias-actualizacion', async (req, res) => {
  try {
    const empresaId = req.query.empresa_id || 1; // TODO: Obtener de sesión

    const sugerencias = await PlantillasNivelesService.sugerirActualizaciones(empresaId);

    res.json({
      success: true,
      sugerencias,
      total: sugerencias.length
    });
  } catch (error) {
    console.error('Error al obtener sugerencias de actualización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sugerencias de actualización',
      error: error.message
    });
  }
});

/**
 * FASE 3: POST /api/plantillas-niveles/auto-actualizar/:id
 * Auto-actualizar una plantilla basándose en patrón detectado
 */
router.post('/auto-actualizar/:id', async (req, res) => {
  try {
    const plantillaId = parseInt(req.params.id);

    const resultado = await PlantillasNivelesService.autoActualizarPlantilla(plantillaId);

    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error al auto-actualizar plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al auto-actualizar plantilla',
      error: error.message
    });
  }
});

/**
 * FASE 3: GET /api/plantillas-niveles/inconsistencias
 * Detectar inconsistencias en evaluación de riesgos entre cargos
 */
router.get('/inconsistencias', async (req, res) => {
  try {
    const empresaId = req.query.empresa_id || 1; // TODO: Obtener de sesión

    const inconsistencias = await PlantillasNivelesService.detectarInconsistencias(empresaId);

    res.json({
      success: true,
      inconsistencias,
      total: inconsistencias.length,
      severidades: {
        alta: inconsistencias.filter(i => i.severidad === 'ALTA').length,
        media: inconsistencias.filter(i => i.severidad === 'MEDIA').length,
        baja: inconsistencias.filter(i => i.severidad === 'BAJA').length
      }
    });
  } catch (error) {
    console.error('Error al detectar inconsistencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al detectar inconsistencias',
      error: error.message
    });
  }
});

export default router;
