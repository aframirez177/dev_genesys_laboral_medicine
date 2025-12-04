/**
 * aiSuggestions.controller.js - Controlador para sugerencias de IA
 *
 * Proporciona endpoints para sugerencias inteligentes basadas en el contexto
 */

import { aiSuggestionsService } from '../../services/ia/aiSuggestions.service.js';

/**
 * Sugerir GES (Grupos de Exposición Similar) para un cargo
 * POST /api/ia/suggest-ges
 * Body: { cargoName, sector?, historicalData? }
 */
export const suggestGES = async (req, res) => {
  try {
    const { cargoName, sector, historicalData } = req.body;

    if (!cargoName) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del cargo es requerido'
      });
    }

    const suggestions = await aiSuggestionsService.suggestGESForCargo(
      cargoName,
      { sector, historicalData }
    );

    res.json({
      success: true,
      data: suggestions,
      metadata: {
        cargoName,
        count: suggestions.length,
        avgConfidence: suggestions.length > 0
          ? (suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length).toFixed(1)
          : 0
      }
    });
  } catch (error) {
    console.error('Error in suggestGES:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar sugerencias'
    });
  }
};

/**
 * Sugerir controles para un riesgo específico
 * POST /api/ia/suggest-controls
 * Body: { riesgo, ges, cargoName? }
 */
export const suggestControls = async (req, res) => {
  try {
    const { riesgo, ges, cargoName } = req.body;

    if (!riesgo || !ges) {
      return res.status(400).json({
        success: false,
        error: 'El tipo de riesgo y GES son requeridos'
      });
    }

    const controls = await aiSuggestionsService.suggestControls(
      riesgo,
      ges,
      cargoName
    );

    res.json({
      success: true,
      controls
    });
  } catch (error) {
    console.error('Error in suggestControls:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar sugerencias de controles'
    });
  }
};

/**
 * Validar consistencia de un cargo (detectar inconsistencias)
 * POST /api/ia/validate-cargo
 * Body: { cargo }
 */
export const validateCargo = async (req, res) => {
  try {
    const { cargo } = req.body;

    if (!cargo) {
      return res.status(400).json({
        success: false,
        error: 'Los datos del cargo son requeridos'
      });
    }

    const validation = await aiSuggestionsService.validateCargoConsistency(cargo);

    res.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Error in validateCargo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al validar cargo'
    });
  }
};

/**
 * Obtener benchmarks por sector
 * GET /api/ia/benchmarks/:sector
 */
export const getBenchmarks = async (req, res) => {
  try {
    const { sector } = req.params;
    const { region, tamano } = req.query;

    if (!sector) {
      return res.status(400).json({
        success: false,
        error: 'El sector es requerido'
      });
    }

    const benchmarks = await aiSuggestionsService.getBenchmarksBySector(
      sector,
      { region, tamano }
    );

    res.json({
      success: true,
      benchmarks,
      sector,
      filters: { region, tamano }
    });
  } catch (error) {
    console.error('Error in getBenchmarks:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener benchmarks'
    });
  }
};

/**
 * Autocompletar cargo mientras el usuario escribe
 * GET /api/ia/autocomplete-cargo?q=operario
 */
export const autocompleteCargo = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const suggestions = await aiSuggestionsService.autocompleteCargo(q);

    res.json({
      success: true,
      suggestions,
      query: q
    });
  } catch (error) {
    console.error('Error in autocompleteCargo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al autocompletar cargo'
    });
  }
};

/**
 * Calcular nivel de riesgo global de un diagnóstico
 * POST /api/ia/calculate-risk-score
 * Body: { cargos }
 */
export const calculateRiskScore = async (req, res) => {
  try {
    const { cargos } = req.body;

    if (!cargos || !Array.isArray(cargos)) {
      return res.status(400).json({
        success: false,
        error: 'Los cargos son requeridos'
      });
    }

    const riskAnalysis = await aiSuggestionsService.calculateRiskScore(cargos);

    res.json({
      success: true,
      riskAnalysis
    });
  } catch (error) {
    console.error('Error in calculateRiskScore:', error);
    res.status(500).json({
      success: false,
      error: 'Error al calcular nivel de riesgo'
    });
  }
};

/**
 * Detectar cargos similares y sugerir copiar datos
 * POST /api/ia/detect-similar-cargo
 * Body: { cargoName, existingCargos }
 */
export const detectSimilarCargo = async (req, res) => {
  try {
    const { cargoName, existingCargos } = req.body;

    if (!cargoName) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del cargo es requerido'
      });
    }

    // existingCargos es opcional - si no hay cargos previos, no hay nada que comparar
    if (!existingCargos || existingCargos.length === 0) {
      return res.json({
        success: true,
        hasSimilar: false,
        suggestions: []
      });
    }

    const similarityResult = await aiSuggestionsService.detectSimilarCargo(
      cargoName,
      existingCargos
    );

    res.json({
      success: true,
      ...similarityResult
    });
  } catch (error) {
    console.error('Error in detectSimilarCargo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al detectar cargos similares'
    });
  }
};
