// server/src/services/riesgos.service.js
import { calcularNivelProbabilidad, calcularNivelRiesgo } from '../utils/risk-calculations.js';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';

/**
 * PAQUETE MÍNIMO UNIVERSAL
 * Aplica a TODOS los trabajadores independiente de NR
 * Base: Resolución 1843/2025 - Evaluación básica obligatoria
 */
const PAQUETE_MINIMO_UNIVERSAL = {
  examenes: ['EMO', 'OPTO', 'AUD'], // Examen médico básico, visiometría, audiometría básica
  periodicidad: 36, // meses (3 años)
  fundamento: 'Resolución 1843/2025 - Evaluación básica obligatoria para todos los trabajadores'
};

/**
 * UMBRALES DEFAULT
 * Basados en respuestas.md - Pueden ser configurables por empresa en el futuro
 */
const UMBRALES_DEFAULT = {
  nrMinimoParaEPP: 121,           // NR ≥ III (Alto)
  nrMinimoParaExamenes: 41,       // NR ≥ II (Medio)
  nrMinimoParaAptitudes: 121,     // NR ≥ III (Alto)
  periodicidadPorNivelNR: {
    // Nota: risk-calculations.js usa I=crítico, IV=aceptable (verificar)
    'I': 6,     // Crítico: 6 meses
    'II': 12,   // Alto: 1 año
    'III': 24,  // Medio: 2 años
    'IV': 36    // Aceptable: 3 años
  }
};

/**
 * CONTROLES POR TOGGLES ESPECIALES (REQUISITOS LEGALES)
 * Estos SOBRESCRIBEN la lógica de NR - son obligatorios por ley
 */
const CONTROLES_TOGGLES = {
  trabajaAlturas: {
    fundamento: 'Resolución 1409/2012 y 4272/2021 - Trabajo en alturas',
    examenes: ['EMOA', 'GLI', 'PL', 'PE', 'ESP', 'ECG'],
    periodicidad: 12, // Anual obligatorio
    epp: [
      'Arnés de seguridad de cuerpo completo',
      'Línea de vida y punto de anclaje certificado',
      'Casco con barbuquejo',
      'Calzado de seguridad con protección antideslizante'
    ],
    aptitudes: [
      'Buena agudeza visual y percepción de profundidad',
      'Coordinación motriz y equilibrio adecuados',
      'Ausencia de vértigo o trastornos del equilibrio',
      'Capacidad para trabajar bajo presión y seguir protocolos de seguridad'
    ],
    condicionesIncompatibles: [
      'Vértigo o mareos crónicos',
      'Epilepsia no controlada',
      'Alteraciones del equilibrio o enfermedades cardiovasculares severas no controladas'
    ]
  },

  manipulaAlimentos: {
    fundamento: 'Resolución 2674/2013 - Manipulación de alimentos',
    examenes: ['EMOMP', 'FRO', 'KOH', 'COP'],
    periodicidad: 12,
    aptitudes: [
      'Higiene personal adecuada',
      'Ausencia de lesiones cutáneas en manos'
    ],
    condicionesIncompatibles: [
      'Enfermedades transmisibles activas',
      'Lesiones infectadas en piel de manos',
      'Portador de salmonella u otros patógenos'
    ]
  },

  conduceVehiculo: {
    fundamento: 'Resolución 1565/2014 (PESV) y Ley 1383/2010 - Conducción de vehículos',
    examenes: ['PSM', 'GLI', 'PL'],
    periodicidad: 24, // Cada 2 años
    aptitudes: [
      'Agudeza visual mínima 20/40 corregida',
      'Campo visual mínimo 140 grados',
      'Coordinación psicomotriz adecuada',
      'Discriminación de colores (rojo, verde, amarillo)',
      'Tiempo de reacción adecuado'
    ],
    condicionesIncompatibles: [
      'Epilepsia no controlada',
      'Ceguera monocular (según tipo de vehículo)',
      'Hipoacusia profunda bilateral',
      'Trastornos del equilibrio severos',
      'Consumo de sustancias psicoactivas'
    ]
  }
};

/**
 * SERVICE DE RIESGOS
 * Centraliza toda la lógica de cálculo y determinación de controles
 */
class RiesgosService {

  /**
   * Calcula NP y NR para un GES individual
   * @param {Object} ges - GES con niveles { niveles: { deficiencia: {value}, exposicion: {value}, consecuencia: {value} } }
   * @returns {Object} Niveles calculados con metadatos
   */
  calcularNivelesRiesgo(ges) {
    const nd = ges.niveles?.deficiencia?.value;
    const ne = ges.niveles?.exposicion?.value;
    const nc = ges.niveles?.consecuencia?.value;

    if (!nd || !ne || !nc) {
      console.warn(`⚠️ GES "${ges.ges}" no tiene niveles completos (nd=${nd}, ne=${ne}, nc=${nc})`);
      throw new Error(`GES "${ges.ges}" requiere niveles completos (ND, NE, NC)`);
    }

    // Usar utilidades de risk-calculations.js
    const np = calcularNivelProbabilidad(nd, ne);
    const nr = calcularNivelRiesgo(np.valor, nc);

    return {
      // Valores de entrada
      nd,
      ne,
      nc,

      // Nivel de Probabilidad
      np: np.valor,
      npNivel: np.nivel,
      npInterpretacion: np.interpretacion,

      // Nivel de Riesgo
      nr: nr.valor,
      nrNivel: nr.nivel,
      nrInterpretacion: nr.interpretacion,
      nrAceptabilidad: nr.aceptabilidad,

      // Metadata
      fechaCalculo: new Date().toISOString(),
      metodoCalculo: 'GTC-45-2012'
    };
  }

  /**
   * Determina si se aplican controles según NR y umbrales
   * @param {Number} nr - Nivel de riesgo calculado
   * @param {Object} gesConfig - Configuración del GES desde ges-config.js
   * @param {Object} umbrales - Umbrales personalizados (opcional)
   * @returns {Object} Controles a aplicar
   */
  determinarControlesPorNR(nr, gesConfig, umbrales = UMBRALES_DEFAULT) {
    const aplicaEPP = nr >= umbrales.nrMinimoParaEPP;
    const aplicaExamenes = nr >= umbrales.nrMinimoParaExamenes;
    const aplicaAptitudes = nr >= umbrales.nrMinimoParaAptitudes;

    // Determinar periodicidad según nivel de NR
    // Usar la interpretación del NR para obtener el nivel (I, II, III, IV)
    const nrInfo = calcularNivelRiesgo(1, nr); // Truco: multiplicar por 1 para obtener info
    const periodicidad = umbrales.periodicidadPorNivelNR[nrInfo.nivel] || 36;

    return {
      aplicaControles: aplicaEPP || aplicaExamenes,
      epp: aplicaEPP ? (gesConfig.eppSugeridos || []) : [],
      examenes: aplicaExamenes ? Object.keys(gesConfig.examenesMedicos || {}) : [],
      aptitudes: aplicaAptitudes ? (gesConfig.aptitudesRequeridas || []) : [],
      condicionesIncompatibles: aplicaAptitudes ? (gesConfig.condicionesIncompatibles || []) : [],
      periodicidad,
      justificacion: this.generarJustificacion(nr, nrInfo, aplicaEPP, aplicaExamenes)
    };
  }

  /**
   * Aplica controles de toggles especiales (SIEMPRE, independiente de NR)
   * @param {Object} toggles - { trabajaAlturas: Boolean, manipulaAlimentos: Boolean, conduceVehiculo: Boolean }
   * @returns {Object} Controles consolidados de toggles
   */
  aplicarControlesDeToggles(toggles) {
    const controles = {
      examenes: new Set(),
      epp: new Set(),
      aptitudes: new Set(),
      condicionesIncompatibles: new Set(),
      periodicidadMinima: 999, // Muy alta para que se reduzca
      fundamentos: []
    };

    Object.entries(toggles).forEach(([toggleName, activo]) => {
      if (activo && CONTROLES_TOGGLES[toggleName]) {
        const ctrl = CONTROLES_TOGGLES[toggleName];

        // Agregar exámenes
        (ctrl.examenes || []).forEach(ex => controles.examenes.add(ex));

        // Agregar EPP
        (ctrl.epp || []).forEach(epp => controles.epp.add(epp));

        // Agregar aptitudes
        (ctrl.aptitudes || []).forEach(apt => controles.aptitudes.add(apt));

        // Agregar condiciones incompatibles
        (ctrl.condicionesIncompatibles || []).forEach(cond =>
          controles.condicionesIncompatibles.add(cond)
        );

        // La periodicidad más corta gana
        if (ctrl.periodicidad < controles.periodicidadMinima) {
          controles.periodicidadMinima = ctrl.periodicidad;
        }

        controles.fundamentos.push(ctrl.fundamento);
      }
    });

    return controles;
  }

  /**
   * CONSOLIDACIÓN FINAL: Procesa un cargo completo
   * Aplica "El más restrictivo gana"
   * @param {Object} cargo - Cargo con gesSeleccionados y toggles
   * @param {Object} umbrales - Umbrales personalizados (opcional)
   * @returns {Object} Controles consolidados del cargo
   */
  consolidarControlesCargo(cargo, umbrales = UMBRALES_DEFAULT) {
    const controles = {
      paqueteMinimo: PAQUETE_MINIMO_UNIVERSAL,
      porToggle: null,
      porGES: [],
      consolidado: {
        examenes: new Set(PAQUETE_MINIMO_UNIVERSAL.examenes),
        epp: new Set(),
        aptitudes: new Set(),
        condicionesIncompatibles: new Set(),
        periodicidadMinima: PAQUETE_MINIMO_UNIVERSAL.periodicidad
      },
      metadata: {
        numGESAnalizados: 0,
        numGESConControles: 0,
        nrMaximo: 0,
        nrMinimo: 999999,
        gesConNRAlto: [], // NR ≥ III
        gesConNRBajo: []  // NR < II
      }
    };

    // 1. Aplicar controles de toggles especiales (PRIORIDAD 1 - REQUISITOS LEGALES)
    const toggles = {
      trabajaAlturas: cargo.trabajaAlturas || false,
      manipulaAlimentos: cargo.manipulaAlimentos || false,
      conduceVehiculo: cargo.conduceVehiculo || false
    };

    controles.porToggle = this.aplicarControlesDeToggles(toggles);

    // Merge toggles a consolidado
    controles.porToggle.examenes.forEach(ex => controles.consolidado.examenes.add(ex));
    controles.porToggle.epp.forEach(epp => controles.consolidado.epp.add(epp));
    controles.porToggle.aptitudes.forEach(apt => controles.consolidado.aptitudes.add(apt));
    controles.porToggle.condicionesIncompatibles.forEach(cond =>
      controles.consolidado.condicionesIncompatibles.add(cond)
    );

    if (controles.porToggle.periodicidadMinima < controles.consolidado.periodicidadMinima) {
      controles.consolidado.periodicidadMinima = controles.porToggle.periodicidadMinima;
    }

    // 2. Procesar cada GES (PRIORIDAD 2 - POR NIVEL DE RIESGO)
    const gesSeleccionados = cargo.gesSeleccionados || [];

    gesSeleccionados.forEach((ges, index) => {
      try {
        controles.metadata.numGESAnalizados++;

        // Calcular NP y NR
        const niveles = this.calcularNivelesRiesgo(ges);

        // Actualizar metadata
        if (niveles.nr > controles.metadata.nrMaximo) {
          controles.metadata.nrMaximo = niveles.nr;
        }
        if (niveles.nr < controles.metadata.nrMinimo) {
          controles.metadata.nrMinimo = niveles.nr;
        }

        // Obtener config del GES
        const gesConfig = GES_DATOS_PREDEFINIDOS[ges.ges];
        if (!gesConfig) {
          console.warn(`⚠️ GES "${ges.ges}" no encontrado en GES_DATOS_PREDEFINIDOS`);
          // Continuar con el siguiente GES
          return;
        }

        // Determinar controles según NR
        const controlesGes = this.determinarControlesPorNR(niveles.nr, gesConfig, umbrales);

        // Clasificar GES por nivel
        if (niveles.nr >= 121) { // NR ≥ III (Alto o Crítico)
          controles.metadata.gesConNRAlto.push({
            ges: ges.ges,
            nr: niveles.nr,
            nivel: niveles.nrNivel,
            interpretacion: niveles.nrInterpretacion
          });
        } else if (niveles.nr < 41) { // NR I (Bajo)
          controles.metadata.gesConNRBajo.push({
            ges: ges.ges,
            nr: niveles.nr,
            nivel: niveles.nrNivel,
            interpretacion: niveles.nrInterpretacion
          });
        }

        // Guardar detalle del GES procesado
        controles.porGES.push({
          gesNombre: ges.ges,
          tipoRiesgo: ges.riesgo,
          niveles,
          controlesAplicados: controlesGes.aplicaControles,
          controles: controlesGes,
          justificacion: controlesGes.justificacion
        });

        // Merge a consolidado (solo si aplica controles)
        if (controlesGes.aplicaControles) {
          controles.metadata.numGESConControles++;

          controlesGes.examenes.forEach(ex => controles.consolidado.examenes.add(ex));
          controlesGes.epp.forEach(epp => controles.consolidado.epp.add(epp));
          controlesGes.aptitudes.forEach(apt => controles.consolidado.aptitudes.add(apt));
          controlesGes.condicionesIncompatibles.forEach(cond =>
            controles.consolidado.condicionesIncompatibles.add(cond)
          );

          // La periodicidad más corta gana
          if (controlesGes.periodicidad < controles.consolidado.periodicidadMinima) {
            controles.consolidado.periodicidadMinima = controlesGes.periodicidad;
          }
        }

      } catch (error) {
        console.error(`❌ Error procesando GES "${ges.ges}" (índice ${index}):`, error.message);
        // Continuar con el siguiente GES
      }
    });

    // Convertir Sets a Arrays para serializar a JSON
    controles.consolidado.examenes = Array.from(controles.consolidado.examenes);
    controles.consolidado.epp = Array.from(controles.consolidado.epp);
    controles.consolidado.aptitudes = Array.from(controles.consolidado.aptitudes);
    controles.consolidado.condicionesIncompatibles = Array.from(controles.consolidado.condicionesIncompatibles);

    // Convertir Sets en porToggle también
    if (controles.porToggle) {
      controles.porToggle.examenes = Array.from(controles.porToggle.examenes);
      controles.porToggle.epp = Array.from(controles.porToggle.epp);
      controles.porToggle.aptitudes = Array.from(controles.porToggle.aptitudes);
      controles.porToggle.condicionesIncompatibles = Array.from(controles.porToggle.condicionesIncompatibles);
    }

    return controles;
  }

  /**
   * Genera justificación técnica para auditoría
   * @param {Number} nr - Nivel de riesgo
   * @param {Object} nrInfo - Info del NR (nivel, interpretación)
   * @param {Boolean} aplicaEPP - Si se aplica EPP
   * @param {Boolean} aplicaExamenes - Si se aplican exámenes
   * @returns {String} Justificación técnica
   */
  generarJustificacion(nr, nrInfo, aplicaEPP, aplicaExamenes) {
    if (nr >= 501) { // I - Crítico
      return `Riesgo ${nrInfo.interpretacion} (NR=${nr}, Nivel ${nrInfo.nivel}). Requiere EPP obligatorio, vigilancia médica continua y controles de ingeniería urgentes.`;
    } else if (nr >= 121) { // II - Alto
      return `Riesgo ${nrInfo.interpretacion} (NR=${nr}, Nivel ${nrInfo.nivel}). Requiere EPP obligatorio y vigilancia médica periódica.`;
    } else if (nr >= 41) { // III - Medio
      return `Riesgo ${nrInfo.interpretacion} (NR=${nr}, Nivel ${nrInfo.nivel}). Requiere exámenes periódicos y EPP recomendado.`;
    } else { // IV - Aceptable
      return `Riesgo ${nrInfo.interpretacion} (NR=${nr}, Nivel ${nrInfo.nivel}). No requiere controles específicos más allá del paquete mínimo universal. Riesgo controlado con medidas existentes.`;
    }
  }

  /**
   * Obtener umbrales (permite configuración futura por empresa)
   * @param {String} empresaId - ID de empresa (para futura configuración)
   * @returns {Object} Umbrales a usar
   */
  getUmbrales(empresaId = null) {
    // TODO: En el futuro, consultar configuración de empresa en BD
    // const empresaConfig = await Empresa.findById(empresaId)
    // if (empresaConfig.umbralesPersonalizados) return empresaConfig.umbralesPersonalizados

    return UMBRALES_DEFAULT;
  }
}

// Exportar instancia única (singleton)
export default new RiesgosService();
