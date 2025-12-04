/**
 * ges-config.routes.js
 * Endpoint para obtener configuración predefinida de GES
 * (consecuencias, EPP, medidas de intervención, etc.)
 */

import express from 'express';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';

const router = express.Router();

/**
 * GET /api/ges-config
 * Obtiene todos los datos predefinidos de GES
 */
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: GES_DATOS_PREDEFINIDOS
    });
  } catch (error) {
    console.error('[ges-config.routes] Error al obtener GES config:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de GES',
      error: error.message
    });
  }
});

/**
 * GET /api/ges-config/:gesNombre
 * Obtiene datos predefinidos para un GES específico
 */
router.get('/:gesNombre', (req, res) => {
  try {
    const { gesNombre } = req.params;
    const gesData = GES_DATOS_PREDEFINIDOS[gesNombre];

    if (!gesData) {
      return res.status(404).json({
        success: false,
        message: `GES "${gesNombre}" no encontrado en la configuración`
      });
    }

    res.json({
      success: true,
      data: gesData,
      gesNombre
    });
  } catch (error) {
    console.error('[ges-config.routes] Error al obtener GES específico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de GES',
      error: error.message
    });
  }
});

/**
 * POST /api/ges-config/bulk
 * Obtiene datos predefinidos para múltiples GES
 * Body: { gesNombres: ["GES 1", "GES 2", ...] }
 */
router.post('/bulk', (req, res) => {
  try {
    const { gesNombres } = req.body;

    if (!Array.isArray(gesNombres)) {
      return res.status(400).json({
        success: false,
        message: 'gesNombres debe ser un array'
      });
    }

    const results = {};
    const notFound = [];

    gesNombres.forEach(nombre => {
      if (GES_DATOS_PREDEFINIDOS[nombre]) {
        results[nombre] = GES_DATOS_PREDEFINIDOS[nombre];
      } else {
        notFound.push(nombre);
      }
    });

    res.json({
      success: true,
      data: results,
      notFound: notFound.length > 0 ? notFound : undefined
    });
  } catch (error) {
    console.error('[ges-config.routes] Error al obtener GES en bulk:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de GES',
      error: error.message
    });
  }
});

export default router;
