/**
 * aiSuggestions.service.js - Servicio de sugerencias inteligentes
 *
 * Implementación V1: Rule-based (sin necesidad de ML complejo)
 * Implementación V2 (futuro): Embeddings + ML models
 */

// Base de conocimiento de GES por cargo (datos de dominio)
const GES_BY_CARGO = {
  // Operarios y producción
  'operario': ['Riesgo Mecánico', 'Riesgo Físico - Ruido', 'Riesgo Biomecánico', 'Riesgo de Seguridad'],
  'operario de producción': ['Riesgo Mecánico', 'Riesgo Físico - Ruido', 'Riesgo Biomecánico', 'Riesgo Químico'],
  'operario de máquina': ['Riesgo Mecánico', 'Riesgo Físico - Ruido', 'Riesgo Físico - Vibración', 'Riesgo de Seguridad'],
  'soldador': ['Riesgo de Radiación', 'Riesgo Químico', 'Riesgo de Temperatura', 'Riesgo Mecánico'],
  'mec ánico': ['Riesgo Mecánico', 'Riesgo Químico', 'Riesgo Biomecánico', 'Riesgo de Seguridad'],

  // Administrativos
  'gerente': ['Riesgo Psicosocial', 'Riesgo Biomecánico', 'Riesgo de Fenómenos Naturales'],
  'administrativo': ['Riesgo Psicosocial', 'Riesgo Biomecánico', 'Riesgo de Fenómenos Naturales'],
  'secretaria': ['Riesgo Psicosocial', 'Riesgo Biomecánico'],
  'digitador': ['Riesgo Biomecánico', 'Riesgo Psicosocial'],
  'contador': ['Riesgo Psicosocial', 'Riesgo Biomecánico'],

  // Logística y almacén
  'almacenista': ['Riesgo Biomecánico', 'Riesgo Mecánico', 'Riesgo de Seguridad'],
  'conductor': ['Riesgo de Seguridad', 'Riesgo Biomecánico', 'Riesgo Psicosocial'],
  'montacarguista': ['Riesgo Mecánico', 'Riesgo de Seguridad', 'Riesgo Físico - Ruido'],

  // Construcción
  'albañil': ['Riesgo de Seguridad', 'Riesgo Biomecánico', 'Riesgo de Trabajo en Alturas', 'Riesgo Químico'],
  'electricista': ['Riesgo Eléctrico', 'Riesgo de Trabajo en Alturas', 'Riesgo de Seguridad'],
  'plomero': ['Riesgo Biomecánico', 'Riesgo Químico', 'Riesgo de Espacios Confinados'],

  // Servicios
  'personal de limpieza': ['Riesgo Químico', 'Riesgo Biomecánico', 'Riesgo Biológico'],
  'cocinero': ['Riesgo de Temperatura', 'Riesgo Biomecánico', 'Riesgo Químico', 'Riesgo de Seguridad'],
  'mesero': ['Riesgo Biomecánico', 'Riesgo de Temperatura', 'Riesgo Psicosocial']
};

// Controles recomendados por tipo de riesgo
const CONTROLS_BY_RISK = {
  'Riesgo Mecánico': {
    fuente: 'Guardas de seguridad en máquinas, mantenimiento preventivo de equipos, señalización de zonas peligrosas',
    medio: 'Barreras físicas, sistemas de parada de emergencia, iluminación adecuada',
    individuo: 'EPP: guantes de seguridad, calzado de seguridad con puntera de acero, capacitación en uso seguro de máquinas'
  },
  'Riesgo Biomecánico': {
    fuente: 'Diseño ergonómico de puestos de trabajo, sillas y escritorios ajustables, herramientas ergonómicas',
    medio: 'Pausas activas cada 2 horas, rotación de tareas, ayudas mecánicas para levantamiento de cargas',
    individuo: 'Capacitación en higiene postural, ejercicios de estiramiento, uso correcto de ayudas mecánicas'
  },
  'Riesgo Psicosocial': {
    fuente: 'Cargas de trabajo balanceadas, definición clara de roles, canales de comunicación efectivos',
    medio: 'Espacios de descanso, programas de bienestar, clima organizacional positivo',
    individuo: 'Capacitación en manejo del estrés, apoyo psicológico, actividades recreativas'
  },
  'Riesgo Químico': {
    fuente: 'Sustitución de químicos peligrosos, sistemas cerrados de manipulación, etiquetado adecuado',
    medio: 'Ventilación local exhaustiva, duchas y lavaojos de emergencia, almacenamiento seguro',
    individuo: 'EPP: guantes químicos, máscaras con filtros, gafas de seguridad, capacitación en manipulación de químicos'
  },
  'Riesgo Físico - Ruido': {
    fuente: 'Equipos con menor emisión de ruido, mantenimiento de máquinas, encerramiento de fuentes',
    medio: 'Paneles absorbentes de ruido, aislamiento acústico, rotación de personal',
    individuo: 'EPP: protectores auditivos (tapones o copas), audiometrías periódicas, capacitación'
  },
  'Riesgo de Seguridad': {
    fuente: 'Protocolos de seguridad claros, señalización visible, equipo en buen estado',
    medio: 'Rutas de evacuación, extintores accesibles, iluminación de emergencia',
    individuo: 'EPP adecuado según tarea, capacitación en evacuación, simulacros periódicos'
  },
  'Riesgo de Trabajo en Alturas': {
    fuente: 'Superficies de trabajo estables, barandas perimetrales, andamios certificados',
    medio: 'Líneas de vida, puntos de anclaje certificados, mallas de seguridad',
    individuo: 'EPP: arnés de seguridad, casco, capacitación en trabajo en alturas (certificada)'
  },
  'Riesgo Eléctrico': {
    fuente: 'Instalaciones eléctricas certificadas, mantenimiento preventivo, señalización',
    medio: 'Interruptores diferenciales, puestas a tierra, aislamiento de circuitos',
    individuo: 'EPP: guantes dieléctricos, calzado dieléctrico, capacitación en riesgo eléctrico'
  },
  'Riesgo Biológico': {
    fuente: 'Protocolos de bioseguridad, limpieza y desinfección regular, control de plagas',
    medio: 'Ventilación adecuada, disposición segura de desechos, esterilización de equipos',
    individuo: 'EPP: guantes, mascarillas, batas, vacunación, capacitación en bioseguridad'
  }
};

// Inconsistencias comunes por cargo
const CARGO_INCONSISTENCIES = {
  'gerente': {
    unusual_risks: ['Riesgo Mecánico', 'Riesgo de Trabajo en Alturas', 'Riesgo Químico'],
    message: 'Estos riesgos son inusuales para un cargo administrativo'
  },
  'administrativo': {
    unusual_risks: ['Riesgo Mecánico', 'Riesgo de Trabajo en Alturas', 'Riesgo Químico'],
    message: 'Estos riesgos son inusuales para un cargo administrativo'
  },
  'operario': {
    unusual_risks: ['Riesgo Psicosocial'],
    message: 'Aunque puede existir, el riesgo psicosocial es más común en cargos administrativos'
  }
};

class AISuggestionsService {
  /**
   * Sugerir GES para un cargo
   */
  async suggestGESForCargo(cargoName, options = {}) {
    const normalized = this.normalizeCargoName(cargoName);

    // Buscar coincidencias exactas
    let suggestions = GES_BY_CARGO[normalized] || [];

    // Si no hay coincidencias exactas, buscar coincidencias parciales
    if (suggestions.length === 0) {
      suggestions = this.findPartialMatches(normalized);
    }

    // Agregar información de confianza
    const suggestionsWithConfidence = suggestions.map(ges => ({
      riesgo: ges,
      confidence: this.calculateConfidence(cargoName, ges),
      commonInSector: options.sector ? this.isCommonInSector(ges, options.sector) : null
    }));

    // Ordenar por confianza
    suggestionsWithConfidence.sort((a, b) => b.confidence - a.confidence);

    return suggestionsWithConfidence;
  }

  /**
   * Sugerir controles para un riesgo
   */
  async suggestControls(riesgo, ges, cargoName) {
    const controls = CONTROLS_BY_RISK[riesgo] || {
      fuente: 'Eliminar o sustituir la fuente del peligro',
      medio: 'Implementar barreras o controles ingenieriles',
      individuo: 'Proporcionar EPP adecuado y capacitación'
    };

    return {
      ...controls,
      source: 'knowledge_base',
      applicableTo: cargoName
    };
  }

  /**
   * Validar consistencia de un cargo
   */
  async validateCargoConsistency(cargo) {
    const warnings = [];
    const normalized = this.normalizeCargoName(cargo.cargoName);

    // Buscar inconsistencias conocidas
    const inconsistency = CARGO_INCONSISTENCIES[normalized];
    if (inconsistency) {
      cargo.gesSeleccionados.forEach(ges => {
        if (inconsistency.unusual_risks.includes(ges.riesgo)) {
          warnings.push({
            type: 'unusual_risk',
            riesgo: ges.riesgo,
            message: inconsistency.message,
            severity: 'medium'
          });
        }
      });
    }

    // Validar número de trabajadores vs. número de riesgos
    if (cargo.numTrabajadores > 10 && cargo.gesSeleccionados.length < 2) {
      warnings.push({
        type: 'insufficient_risks',
        message: `Para un cargo con ${cargo.numTrabajadores} trabajadores, es recomendable evaluar más riesgos`,
        severity: 'low'
      });
    }

    // Validar controles vacíos
    cargo.gesSeleccionados.forEach(ges => {
      if (!ges.controles || !ges.controles.fuente || !ges.controles.medio || !ges.controles.individuo) {
        warnings.push({
          type: 'missing_controls',
          riesgo: ges.riesgo,
          message: 'Faltan controles para este riesgo',
          severity: 'high'
        });
      }
    });

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions: this.generateSuggestions(cargo, warnings)
    };
  }

  /**
   * Obtener benchmarks por sector
   */
  async getBenchmarksBySector(sector, filters = {}) {
    // V1: Datos simulados
    // V2: Consultar base de datos real de diagnósticos anónimos

    const mockBenchmarks = {
      'manufactura': {
        promedioRiesgo: 7.2,
        numEmpresas: 45,
        riesgosPrincipales: ['Riesgo Mecánico', 'Riesgo Físico - Ruido', 'Riesgo Biomecánico']
      },
      'servicios': {
        promedioRiesgo: 5.8,
        numEmpresas: 32,
        riesgosPrincipales: ['Riesgo Psicosocial', 'Riesgo Biomecánico']
      },
      'construccion': {
        promedioRiesgo: 8.5,
        numEmpresas: 28,
        riesgosPrincipales: ['Riesgo de Trabajo en Alturas', 'Riesgo Mecánico', 'Riesgo de Seguridad']
      },
      'default': {
        promedioRiesgo: 6.5,
        numEmpresas: 20,
        riesgosPrincipales: ['Riesgo Biomecánico', 'Riesgo Psicosocial']
      }
    };

    return mockBenchmarks[sector.toLowerCase()] || mockBenchmarks.default;
  }

  /**
   * Autocompletar cargo
   */
  async autocompleteCargo(query) {
    const normalized = query.toLowerCase();
    const matches = [];

    // Buscar en base de conocimiento
    for (const cargo in GES_BY_CARGO) {
      if (cargo.includes(normalized)) {
        matches.push({
          cargo,
          numRiesgos: GES_BY_CARGO[cargo].length,
          frequency: this.getCargoFrequency(cargo)
        });
      }
    }

    // Ordenar por frecuencia
    matches.sort((a, b) => b.frequency - a.frequency);

    return matches.slice(0, 5);
  }

  /**
   * Calcular nivel de riesgo global
   */
  async calculateRiskScore(cargos) {
    let totalRiesgo = 0;
    let countRiesgos = 0;
    const riesgosPorTipo = {};

    cargos.forEach(cargo => {
      cargo.gesSeleccionados.forEach(ges => {
        if (ges.niveles && ges.niveles.nivelRiesgo) {
          totalRiesgo += ges.niveles.nivelRiesgo;
          countRiesgos++;

          // Agrupar por tipo de riesgo
          if (!riesgosPorTipo[ges.riesgo]) {
            riesgosPorTipo[ges.riesgo] = [];
          }
          riesgosPorTipo[ges.riesgo].push(ges.niveles.nivelRiesgo);
        }
      });
    });

    const promedioGlobal = countRiesgos > 0 ? totalRiesgo / countRiesgos : 0;

    // Calcular promedio por tipo de riesgo
    const promediosPorTipo = {};
    for (const tipo in riesgosPorTipo) {
      const valores = riesgosPorTipo[tipo];
      promediosPorTipo[tipo] = valores.reduce((a, b) => a + b, 0) / valores.length;
    }

    // Determinar nivel
    let nivel = 'Bajo';
    if (promedioGlobal >= 8) nivel = 'Muy Alto';
    else if (promedioGlobal >= 6) nivel = 'Alto';
    else if (promedioGlobal >= 4) nivel = 'Medio';

    return {
      promedioGlobal: promedioGlobal.toFixed(1),
      nivel,
      totalRiesgos: countRiesgos,
      promediosPorTipo,
      interpretacion: this.getInterpretacion(promedioGlobal)
    };
  }

  // ==================== Utilidades ====================

  normalizeCargoName(name) {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Eliminar acentos
  }

  findPartialMatches(normalizedCargo) {
    const matches = [];

    for (const cargo in GES_BY_CARGO) {
      // Buscar palabras clave
      const cargoWords = cargo.split(' ');
      const searchWords = normalizedCargo.split(' ');

      const commonWords = cargoWords.filter(word =>
        searchWords.some(searchWord => searchWord.includes(word) || word.includes(searchWord))
      );

      if (commonWords.length > 0) {
        matches.push(...GES_BY_CARGO[cargo]);
      }
    }

    // Eliminar duplicados
    return [...new Set(matches)];
  }

  calculateConfidence(cargoName, ges) {
    // V1: Basado en frecuencia
    // V2: Basado en embeddings y similitud

    const normalized = this.normalizeCargoName(cargoName);
    const exactMatch = GES_BY_CARGO[normalized];

    if (exactMatch && exactMatch.includes(ges)) {
      return 95; // Alta confianza para coincidencia exacta
    }

    // Coincidencia parcial
    return 70;
  }

  isCommonInSector(ges, sector) {
    // Placeholder - en V2 consultar datos reales
    return Math.random() > 0.5;
  }

  generateSuggestions(cargo, warnings) {
    const suggestions = [];

    warnings.forEach(warning => {
      if (warning.type === 'missing_controls') {
        suggestions.push(`Completar los controles para ${warning.riesgo}`);
      } else if (warning.type === 'insufficient_risks') {
        suggestions.push('Considere evaluar riesgos adicionales para este cargo');
      }
    });

    return suggestions;
  }

  getCargoFrequency(cargo) {
    // V1: Datos hardcoded
    // V2: Consultar base de datos
    const frequencies = {
      'operario': 100,
      'operario de producción': 85,
      'gerente': 75,
      'administrativo': 70,
      'conductor': 65
    };

    return frequencies[cargo] || 50;
  }

  getInterpretacion(promedio) {
    if (promedio >= 8) {
      return 'Nivel de riesgo muy alto. Se requieren acciones correctivas inmediatas.';
    } else if (promedio >= 6) {
      return 'Nivel de riesgo alto. Se deben implementar controles prioritariamente.';
    } else if (promedio >= 4) {
      return 'Nivel de riesgo medio. Mejorar controles existentes.';
    } else {
      return 'Nivel de riesgo bajo. Mantener controles actuales.';
    }
  }

  /**
   * Detectar cargos similares y sugerir copiar datos
   * @param {string} cargoName - Nombre del nuevo cargo
   * @param {Array} existingCargos - Cargos ya completados en el wizard
   * @returns {Object} - { hasSimilar, suggestions: [{ cargoIndex, cargoName, similarity, reason }] }
   */
  async detectSimilarCargo(cargoName, existingCargos) {
    const normalizedNew = this.normalizeCargoName(cargoName);
    const suggestions = [];

    existingCargos.forEach((cargo, index) => {
      const normalizedExisting = this.normalizeCargoName(cargo.cargoName);

      // Calcular similaridad
      const similarity = this.calculateCargoSimilarity(normalizedNew, normalizedExisting);

      if (similarity >= 60) {
        // Similar enough to suggest
        suggestions.push({
          cargoIndex: index,
          cargoName: cargo.cargoName,
          similarity,
          reason: this.getSimilarityReason(normalizedNew, normalizedExisting, similarity),
          cargoData: cargo // Incluir todos los datos del cargo similar
        });
      }
    });

    // Ordenar por similaridad descendente
    suggestions.sort((a, b) => b.similarity - a.similarity);

    return {
      hasSimilar: suggestions.length > 0,
      suggestions: suggestions.slice(0, 3) // Máximo 3 sugerencias
    };
  }

  /**
   * Calcular similaridad entre dos nombres de cargo
   * @param {string} cargo1 - Primer cargo (normalizado)
   * @param {string} cargo2 - Segundo cargo (normalizado)
   * @returns {number} - Porcentaje de similaridad (0-100)
   */
  calculateCargoSimilarity(cargo1, cargo2) {
    // Estrategia 1: Coincidencia exacta
    if (cargo1 === cargo2) {
      return 100;
    }

    // Estrategia 2: Uno contiene al otro
    if (cargo1.includes(cargo2) || cargo2.includes(cargo1)) {
      return 95;
    }

    // Estrategia 3: Coincidencia de palabras clave
    const words1 = cargo1.split(' ').filter(w => w.length > 3); // Ignorar palabras cortas
    const words2 = cargo2.split(' ').filter(w => w.length > 3);

    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);

    if (commonWords.length > 0 && totalWords > 0) {
      const wordSimilarity = (commonWords.length / totalWords) * 100;

      // Boost si comparten palabra principal (primera palabra)
      if (words1[0] === words2[0]) {
        return Math.min(wordSimilarity + 20, 90);
      }

      return wordSimilarity;
    }

    // Estrategia 4: Distancia de Levenshtein (similaridad de cadenas)
    const distance = this.levenshteinDistance(cargo1, cargo2);
    const maxLength = Math.max(cargo1.length, cargo2.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    // Solo considerar si hay al menos 60% de similaridad por Levenshtein
    return similarity >= 60 ? similarity : 0;
  }

  /**
   * Calcular distancia de Levenshtein entre dos strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Generar razón de similaridad para mostrar al usuario
   */
  getSimilarityReason(_cargo1, _cargo2, similarity) {
    if (similarity === 100) {
      return 'Nombre idéntico';
    } else if (similarity >= 95) {
      return 'Nombre muy similar';
    } else if (similarity >= 80) {
      return 'Comparten palabras clave principales';
    } else if (similarity >= 70) {
      return 'Tienen funciones similares';
    } else {
      return 'Podrían compartir características';
    }
  }
}

export const aiSuggestionsService = new AISuggestionsService();
