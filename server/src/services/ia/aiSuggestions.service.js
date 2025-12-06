/**
 * aiSuggestions.service.js - Servicio de sugerencias inteligentes
 *
 * Implementación V1.5: Rule-based + Database lookup
 * - Usa catalogo_cargos y cargo_aliases para mejor precisión
 * - Fallback a diccionario estático si no hay match en BD
 * Implementación V2 (futuro): Embeddings + ML models
 */

import db from '../../config/database.js';

// Base de conocimiento de GES por cargo (datos de dominio - FALLBACK)
// IMPORTANTE: Los nombres de riesgos deben coincidir EXACTAMENTE con la BD
// Ver: /api/catalogo/riesgos para nombres actuales
const GES_BY_CARGO = {
  // Operarios y producción
  'operario': ['Mecánico', 'Físico', 'Biomecánico', 'Seguridad'],
  'operario de produccion': ['Mecánico', 'Físico', 'Biomecánico', 'Químico'],
  'operario de maquina': ['Mecánico', 'Físico', 'Seguridad'],
  'soldador': ['Físico', 'Químico', 'Mecánico', 'Seguridad'],
  'mecanico': ['Mecánico', 'Químico', 'Biomecánico', 'Seguridad'],

  // Administrativos
  'gerente': ['Psicosocial', 'Biomecánico', 'Natural'],
  'administrativo': ['Psicosocial', 'Biomecánico', 'Natural'],
  'secretaria': ['Psicosocial', 'Biomecánico'],
  'digitador': ['Biomecánico', 'Psicosocial'],
  'contador': ['Psicosocial', 'Biomecánico'],
  'auxiliar administrativo': ['Psicosocial', 'Biomecánico'],
  'recepcionista': ['Psicosocial', 'Biomecánico'],

  // Logística y almacén
  'almacenista': ['Biomecánico', 'Mecánico', 'Seguridad', 'Locativo'],
  'conductor': ['Seguridad', 'Biomecánico', 'Psicosocial', 'Físico'],
  'montacarguista': ['Mecánico', 'Seguridad', 'Físico', 'Locativo'],
  'auxiliar de bodega': ['Biomecánico', 'Locativo', 'Seguridad'],

  // Construcción (AMPLIADO)
  'albanil': ['Locativo', 'Biomecánico', 'Seguridad', 'Químico', 'Físico'],
  'maestro de obra': ['Locativo', 'Seguridad', 'Biomecánico', 'Psicosocial'],
  'oficial de construccion': ['Locativo', 'Biomecánico', 'Seguridad', 'Físico'],
  'ayudante de construccion': ['Locativo', 'Biomecánico', 'Seguridad', 'Físico'],
  'electricista': ['Eléctrico', 'Locativo', 'Seguridad'],
  'plomero': ['Biomecánico', 'Químico', 'Locativo', 'Biológico'],
  'pintor': ['Químico', 'Locativo', 'Biomecánico'],
  'carpintero': ['Mecánico', 'Biomecánico', 'Seguridad', 'Físico'],

  // Servicios
  'personal de limpieza': ['Químico', 'Biomecánico', 'Biológico'],
  'auxiliar de servicios generales': ['Químico', 'Biomecánico', 'Biológico', 'Locativo'],
  'cocinero': ['Físico', 'Biomecánico', 'Químico', 'Seguridad'],
  'mesero': ['Biomecánico', 'Físico', 'Psicosocial'],
  'vigilante': ['Psicosocial', 'Seguridad', 'Biomecánico', 'Natural'],

  // Ventas y comercial
  'vendedor': ['Psicosocial', 'Biomecánico', 'Seguridad'],
  'asesor comercial': ['Psicosocial', 'Biomecánico', 'Seguridad'],
  'cajero': ['Psicosocial', 'Biomecánico', 'Seguridad'],
  'supervisor': ['Psicosocial', 'Biomecánico', 'Natural'],
  'jefe': ['Psicosocial', 'Biomecánico', 'Natural'],

  // Salud
  'enfermero': ['Biológico', 'Químico', 'Biomecánico', 'Psicosocial'],
  'medico': ['Biológico', 'Psicosocial', 'Biomecánico'],
  'auxiliar de enfermeria': ['Biológico', 'Químico', 'Biomecánico'],

  // Tecnología
  'ingeniero de software': ['Biomecánico', 'Psicosocial'],
  'desarrollador': ['Biomecánico', 'Psicosocial'],
  'programador': ['Biomecánico', 'Psicosocial'],
  'soporte tecnico': ['Biomecánico', 'Psicosocial', 'Eléctrico']
};

// Mapeo de categorías de cargo a riesgos comunes
const CATEGORY_RISKS = {
  'administrativo': ['Psicosocial', 'Biomecánico', 'Natural'],
  'operativo': ['Mecánico', 'Físico', 'Biomecánico', 'Seguridad'],
  'construccion': ['Locativo', 'Biomecánico', 'Seguridad', 'Físico', 'Químico'],
  'servicios': ['Químico', 'Biomecánico', 'Biológico'],
  'salud': ['Biológico', 'Químico', 'Biomecánico', 'Psicosocial'],
  'tecnologia': ['Biomecánico', 'Psicosocial'],
  'comercial': ['Psicosocial', 'Biomecánico', 'Seguridad'],
  'logistica': ['Biomecánico', 'Mecánico', 'Seguridad', 'Locativo']
};

// Controles recomendados por tipo de riesgo
const CONTROLS_BY_RISK = {
  'Mecánico': {
    fuente: 'Guardas de seguridad en máquinas, mantenimiento preventivo de equipos, señalización de zonas peligrosas',
    medio: 'Barreras físicas, sistemas de parada de emergencia, iluminación adecuada',
    individuo: 'EPP: guantes de seguridad, calzado de seguridad con puntera de acero, capacitación en uso seguro de máquinas'
  },
  'Biomecánico': {
    fuente: 'Diseño ergonómico de puestos de trabajo, sillas y escritorios ajustables, herramientas ergonómicas',
    medio: 'Pausas activas cada 2 horas, rotación de tareas, ayudas mecánicas para levantamiento de cargas',
    individuo: 'Capacitación en higiene postural, ejercicios de estiramiento, uso correcto de ayudas mecánicas'
  },
  'Psicosocial': {
    fuente: 'Cargas de trabajo balanceadas, definición clara de roles, canales de comunicación efectivos',
    medio: 'Espacios de descanso, programas de bienestar, clima organizacional positivo',
    individuo: 'Capacitación en manejo del estrés, apoyo psicológico, actividades recreativas'
  },
  'Químico': {
    fuente: 'Sustitución de químicos peligrosos, sistemas cerrados de manipulación, etiquetado adecuado',
    medio: 'Ventilación local exhaustiva, duchas y lavaojos de emergencia, almacenamiento seguro',
    individuo: 'EPP: guantes químicos, máscaras con filtros, gafas de seguridad, capacitación en manipulación de químicos'
  },
  'Físico': {
    fuente: 'Equipos con menor emisión de ruido/vibración, mantenimiento de máquinas, encerramiento de fuentes',
    medio: 'Paneles absorbentes de ruido, aislamiento acústico/térmico, rotación de personal',
    individuo: 'EPP: protectores auditivos, tapones, capacitación, exámenes médicos periódicos'
  },
  'Seguridad': {
    fuente: 'Protocolos de seguridad claros, señalización visible, equipo en buen estado',
    medio: 'Rutas de evacuación, extintores accesibles, iluminación de emergencia',
    individuo: 'EPP adecuado según tarea, capacitación en evacuación, simulacros periódicos'
  },
  'Locativo': {
    fuente: 'Superficies de trabajo estables, barandas perimetrales, andamios certificados',
    medio: 'Líneas de vida, puntos de anclaje certificados, mallas de seguridad',
    individuo: 'EPP: arnés de seguridad, casco, capacitación en trabajo en alturas (certificada)'
  },
  'Eléctrico': {
    fuente: 'Instalaciones eléctricas certificadas, mantenimiento preventivo, señalización',
    medio: 'Interruptores diferenciales, puestas a tierra, aislamiento de circuitos',
    individuo: 'EPP: guantes dieléctricos, calzado dieléctrico, capacitación en riesgo eléctrico'
  },
  'Biológico': {
    fuente: 'Protocolos de bioseguridad, limpieza y desinfección regular, control de plagas',
    medio: 'Ventilación adecuada, disposición segura de desechos, esterilización de equipos',
    individuo: 'EPP: guantes, mascarillas, batas, vacunación, capacitación en bioseguridad'
  },
  'Natural': {
    fuente: 'Planes de emergencia para fenómenos naturales, sistemas de alerta temprana',
    medio: 'Rutas de evacuación señalizadas, puntos de encuentro, suministros de emergencia',
    individuo: 'Capacitación en evacuación, simulacros, botiquines personales'
  }
};

// Inconsistencias comunes por cargo
const CARGO_INCONSISTENCIES = {
  'gerente': {
    unusual_risks: ['Mecánico', 'Locativo', 'Químico'],
    message: 'Estos riesgos son inusuales para un cargo administrativo'
  },
  'administrativo': {
    unusual_risks: ['Mecánico', 'Químico'],
    message: 'Riesgos físicos/químicos no son típicos en roles administrativos'
  },
  'operario': {
    unusual_risks: ['Psicosocial'],
    message: 'Aunque presente, el riesgo psicosocial es secundario en operarios vs. riesgos físicos'
  }
};

/**
 * Sugerir GES (Grupos de Exposición Similar) para un cargo
 * V1.5: Busca en BD primero, luego fallback a diccionario expandido
 */
export async function suggestGESForCargo(cargoName, options = {}) {
  const { sector, historicalData } = options;

  // Normalizar nombre del cargo (lowercase, sin acentos)
  const normalizedCargo = cargoName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let suggestedRisks = [];
  let matchType = 'default';
  let matchedCargo = null;

  // Diccionario expandido con más cargos de construcción
  const EXPANDED_GES = {
    ...GES_BY_CARGO,
    // Construcción (expandido)
    'albanil': ['Locativo', 'Biomecánico', 'Seguridad', 'Químico', 'Físico'],
    'maestro de obra': ['Locativo', 'Seguridad', 'Biomecánico', 'Psicosocial'],
    'oficial de construccion': ['Locativo', 'Biomecánico', 'Seguridad', 'Físico'],
    'ayudante de construccion': ['Locativo', 'Biomecánico', 'Seguridad', 'Físico'],
    'pintor': ['Químico', 'Locativo', 'Biomecánico'],
    'carpintero': ['Mecánico', 'Biomecánico', 'Seguridad', 'Físico'],
    'techador': ['Locativo', 'Seguridad', 'Biomecánico', 'Físico'],
    'plomero': ['Biomecánico', 'Químico', 'Locativo', 'Biológico'],
    'electricista': ['Eléctrico', 'Locativo', 'Seguridad'],
    // Industria
    'operario': ['Mecánico', 'Físico', 'Biomecánico', 'Seguridad'],
    'operario de produccion': ['Mecánico', 'Físico', 'Biomecánico', 'Químico'],
    'soldador': ['Físico', 'Químico', 'Mecánico', 'Seguridad'],
    // Servicios generales
    'auxiliar de servicios generales': ['Químico', 'Biomecánico', 'Biológico', 'Locativo'],
    'vigilante': ['Psicosocial', 'Seguridad', 'Biomecánico', 'Natural'],
    // Logística
    'auxiliar de bodega': ['Biomecánico', 'Locativo', 'Seguridad'],
    'montacarguista': ['Mecánico', 'Seguridad', 'Físico', 'Locativo'],
    'conductor': ['Seguridad', 'Biomecánico', 'Psicosocial', 'Físico'],
    // Administrativos
    'auxiliar administrativo': ['Psicosocial', 'Biomecánico'],
    'recepcionista': ['Psicosocial', 'Biomecánico'],
    // Salud
    'enfermero': ['Biológico', 'Químico', 'Biomecánico', 'Psicosocial'],
    'auxiliar de enfermeria': ['Biológico', 'Químico', 'Biomecánico']
  };

  // Mapeo de sectores a riesgos comunes
  const SECTOR_RISKS = {
    'construccion': ['Locativo', 'Biomecánico', 'Seguridad', 'Físico', 'Químico'],
    'manufactura': ['Mecánico', 'Físico', 'Químico', 'Biomecánico'],
    'salud': ['Biológico', 'Químico', 'Biomecánico', 'Psicosocial'],
    'comercio': ['Psicosocial', 'Biomecánico', 'Seguridad'],
    'transporte': ['Seguridad', 'Biomecánico', 'Psicosocial', 'Físico'],
    'servicios': ['Psicosocial', 'Biomecánico', 'Natural']
  };

  // 1. Buscar coincidencia exacta en diccionario expandido
  if (EXPANDED_GES[normalizedCargo]) {
    suggestedRisks = EXPANDED_GES[normalizedCargo];
    matchType = 'dictionary-exact';
    matchedCargo = normalizedCargo;
    console.log(`✅ [IA] Exact match: ${normalizedCargo}`);
  }

  // 2. Buscar coincidencia parcial (ej: "ayudante albanil" contiene "albanil")
  if (suggestedRisks.length === 0) {
    for (const [cargo, risks] of Object.entries(EXPANDED_GES)) {
      if (normalizedCargo.includes(cargo) || cargo.includes(normalizedCargo)) {
        suggestedRisks = risks;
        matchType = 'dictionary-partial';
        matchedCargo = cargo;
        console.log(`✅ [IA] Partial match: ${cargo}`);
        break;
      }
    }
  }

  // 3. Inferir por sector si está disponible
  if (suggestedRisks.length === 0 && sector) {
    const sectorLower = sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    for (const [sectorKey, risks] of Object.entries(SECTOR_RISKS)) {
      if (sectorLower.includes(sectorKey) || sectorKey.includes(sectorLower)) {
        suggestedRisks = risks;
        matchType = 'sector-inference';
        matchedCargo = `sector ${sector}`;
        console.log(`✅ [IA] Sector inference: ${sector}`);
        break;
      }
    }
  }

  // 4. Default genérico
  if (suggestedRisks.length === 0) {
    suggestedRisks = ['Biomecánico', 'Psicosocial', 'Seguridad', 'Natural'];
    matchType = 'generic-default';
    console.log(`⚠️ [IA] Using generic defaults for: ${cargoName}`);
  }

  // Calcular confianza basada en tipo de match
  const confidenceByType = {
    'dictionary-exact': 95,
    'dictionary-partial': 85,
    'sector-inference': 75,
    'generic-default': 55
  };

  const baseConfidence = confidenceByType[matchType] || 55;

  const suggestions = suggestedRisks.map((riesgo, index) => ({
    riesgo,
    confidence: Math.max(baseConfidence - (index * 3), 40),
    reason: matchedCargo 
      ? `Basado en: ${matchedCargo}` 
      : `Común para: ${cargoName}`,
    matchType
  }));

  console.log(`🤖 [IA] Suggestions for "${cargoName}": ${suggestedRisks.join(', ')} (${matchType})`);

  return suggestions;
}

/**
 * Sugerir controles para un riesgo específico
 */
export async function suggestControls(riesgo, ges, cargoName) {
  // Normalizar nombre del riesgo (quitar "Riesgo " si existe)
  const normalizedRisk = riesgo.replace(/^Riesgo\s+/, '');

  const controls = CONTROLS_BY_RISK[normalizedRisk] || {
    fuente: 'Eliminar o controlar la fuente del riesgo',
    medio: 'Implementar barreras o controles en el medio',
    individuo: 'EPP adecuado y capacitación específica'
  };

  return {
    riesgo,
    ges,
    cargoName,
    controles: [
      { nivel: 'Fuente', medidas: controls.fuente },
      { nivel: 'Medio', medidas: controls.medio },
      { nivel: 'Individuo', medidas: controls.individuo }
    ]
  };
}

/**
 * Validar consistencia de un cargo (detectar GES inusuales)
 */
export async function validateCargoConsistency(cargo) {
  const { nombre, gesSeleccionados } = cargo;
  const normalizedCargo = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Buscar inconsistencias conocidas
  const inconsistency = CARGO_INCONSISTENCIES[normalizedCargo];

  if (!inconsistency) {
    return {
      isValid: true,
      warnings: []
    };
  }

  // Detectar si hay GES inusuales seleccionados
  const warnings = [];
  for (const ges of gesSeleccionados) {
    if (inconsistency.unusual_risks.some(risk => ges.includes(risk))) {
      warnings.push({
        ges,
        message: inconsistency.message,
        severity: 'warning'
      });
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Obtener benchmarks por sector
 */
export async function getBenchmarksBySector(sector, filters = {}) {
  // TODO: Implementar con datos reales de BD
  // Por ahora retornar datos mock
  return {
    sector,
    avgGESPerCargo: 4.5,
    mostCommonRisks: ['Biomecánico', 'Psicosocial', 'Natural'],
    avgEmployeesPerCargo: 12,
    filters
  };
}

/**
 * Autocompletar cargo mientras el usuario escribe
 */
export async function autocompleteCargo(query) {
  const normalizedQuery = query.toLowerCase();

  // Buscar cargos que empiecen con o contengan el query
  const matches = Object.keys(GES_BY_CARGO)
    .filter(cargo => cargo.includes(normalizedQuery))
    .slice(0, 5); // Limitar a 5 sugerencias

  return matches.map(cargo => ({
    value: cargo,
    label: cargo.charAt(0).toUpperCase() + cargo.slice(1)
  }));
}

/**
 * Calcular nivel de riesgo global de un diagnóstico
 */
export async function calculateRiskScore(cargos) {
  // Cálculo simplificado: promedio de GES por cargo
  const totalGES = cargos.reduce((sum, cargo) => sum + (cargo.gesSeleccionados?.length || 0), 0);
  const avgGES = cargos.length > 0 ? totalGES / cargos.length : 0;

  // Clasificar riesgo
  let riskLevel = 'Bajo';
  if (avgGES > 6) riskLevel = 'Alto';
  else if (avgGES > 3) riskLevel = 'Medio';

  return {
    totalCargos: cargos.length,
    totalGES,
    avgGES: avgGES.toFixed(1),
    riskLevel,
    recommendations: [
      'Implementar controles en fuente, medio e individuo',
      'Capacitar al personal en los riesgos identificados',
      'Realizar seguimiento y monitoreo periódico'
    ]
  };
}

/**
 * Detectar cargos similares y sugerir copiar datos
 */
export async function detectSimilarCargo(cargoName, existingCargos) {
  const normalizedNew = cargoName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const similarities = existingCargos.map(cargo => {
    const normalizedExisting = cargo.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Calcular similitud simple (Jaccard)
    const words1 = normalizedNew.split(' ');
    const words2 = normalizedExisting.split(' ');
    const intersection = words1.filter(w => words2.includes(w)).length;
    const union = new Set([...words1, ...words2]).size;
    const similarity = union > 0 ? (intersection / union) * 100 : 0;

    return {
      cargo,
      similarity: Math.round(similarity)
    };
  });

  // Filtrar solo cargos con similitud > 50%
  const similar = similarities.filter(s => s.similarity > 50);

  if (similar.length === 0) {
    return {
      hasSimilar: false,
      suggestions: []
    };
  }

  // Ordenar por similitud descendente
  similar.sort((a, b) => b.similarity - a.similarity);

  return {
    hasSimilar: true,
    suggestions: similar.slice(0, 3).map(s => ({
      cargoId: s.cargo.id,
      cargoName: s.cargo.nombre,
      similarity: s.similarity,
      gesCount: s.cargo.gesSeleccionados?.length || 0
    }))
  };
}

export const aiSuggestionsService = {
  suggestGESForCargo,
  suggestControls,
  validateCargoConsistency,
  getBenchmarksBySector,
  autocompleteCargo,
  calculateRiskScore,
  detectSimilarCargo
};
