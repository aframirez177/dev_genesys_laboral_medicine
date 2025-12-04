/**
 * main_wizard_example.js - Entry point para el Wizard SST
 *
 * Inicializa el wizard conversacional de diagnóstico de riesgos laborales
 */

// Importar estilos del wizard (incluye variables, mixins, reset, y componentes)
import '../styles/scss/wizard.scss';

// Suppress ResizeObserver error (known false positive with Floating UI)
// This error occurs when ResizeObserver callbacks take longer than a single animation frame
// It's harmless and can be safely ignored in development
if (typeof window !== 'undefined') {
  // Method 1: Intercept window.error events
  const resizeObserverErrHandler = (event) => {
    if (
      event.message &&
      (event.message.includes('ResizeObserver loop') ||
       event.message === 'ResizeObserver loop completed with undelivered notifications.' ||
       event.message === 'ResizeObserver loop limit exceeded')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
  };

  window.addEventListener('error', resizeObserverErrHandler, { capture: true });

  // Method 2: Override console.error to filter ResizeObserver errors
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const errorMsg = args[0]?.toString() || '';
    if (errorMsg.includes('ResizeObserver loop')) {
      // Silently ignore ResizeObserver errors
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Method 3: Patch ResizeObserver to debounce notifications
  if (window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback) {
        let timeoutId = null;
        super((entries, observer) => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            try {
              callback(entries, observer);
            } catch (e) {
              if (!e.message?.includes('ResizeObserver loop')) {
                throw e;
              }
            }
          }, 0);
        });
      }
    };
  }
}

import { Wizard } from '../components/wizard/Wizard.js';
import {
  welcomeStep,
  empresaStep,
  numCargosStep,
  createCargoInfoStep,
  createTogglesEspecialesStep,
  createGESSelectionStep,
  createControlesStep,
  // createNivelesRiesgoStep - ELIMINADO: ahora integrado en createControlesStep
  reviewStep,
  generateGESControlSteps
} from '../components/wizard/diagnosticoSteps.js';
import { cargoState } from '../state/CargoState.js';
import { PersistenceManager } from '../state/PersistenceManager.js';

/**
 * Flujo dinámico del wizard
 *
 * El wizard tiene pasos fijos (bienvenida, empresa, num cargos)
 * y pasos dinámicos que se generan según las respuestas del usuario:
 * - N pasos de información de cargo (según numCargos)
 * - Para cada cargo: selección de GES
 * - Para cada GES seleccionado: controles
 */

class DiagnosticoWizard {
  constructor() {
    this.wizard = null;
    this.currentCargoIndex = 0;
    this.totalCargos = 0;
    this.dynamicSteps = [];
  }

  /**
   * Inicializar wizard con pasos iniciales
   */
  init() {
    // Inicializar state y persistence
    const persistence = new PersistenceManager(cargoState, {
      autoSaveInterval: 5000,
      expirationTime: 72 * 60 * 60 * 1000,
      enableBackendSync: false
    });
    persistence.init();

    // Pasos iniciales (fijos)
    const initialSteps = [
      welcomeStep,
      empresaStep,
      numCargosStep
    ];

    // Crear wizard con pasos iniciales
    this.wizard = new Wizard(initialSteps, {
      container: document.getElementById('wizard-root'),
      onComplete: this.handleComplete.bind(this),
      onStepChange: this.handleStepChange.bind(this),
      enableKeyboardNavigation: true,
      showProgress: true,
      autoFocus: true
    });

    this.wizard.init();

    // Sobrescribir next() para interceptar ENTRE validación y avance
    this.interceptNextMethod();
  }

  /**
   * Interceptar el método next() del wizard
   */
  interceptNextMethod() {
    const originalNext = this.wizard.next.bind(this.wizard);

    this.wizard.next = async () => {
      console.log('🔍 Intercepting next from step:', this.wizard.currentStep);
      const currentStep = this.wizard.steps[this.wizard.currentStep];

      // Paso 1: Obtener datos del paso actual
      const stepData = await this.wizard.getCurrentStepData();
      console.log('Step data:', stepData);

      // Paso 2: Validar
      const validation = await this.wizard.validateCurrentStep(stepData);
      if (!validation.isValid) {
        this.wizard.showValidationErrors(validation.errors);
        return;
      }

      // Paso 3: Guardar datos
      this.wizard.data[currentStep.id] = stepData;

      // Paso 4: GENERAR PASOS DINÁMICOS SI ES NECESARIO (antes de avanzar)
      if (currentStep.id === 'numCargos') {
        this.totalCargos = parseInt(stepData.numCargos, 10);
        console.log('✅ Generando pasos dinámicos para', this.totalCargos, 'cargos');
        this.generateDynamicSteps();
      }

      if (currentStep.id && currentStep.id.startsWith('ges-selection-')) {
        const cargoIndex = parseInt(currentStep.id.split('-')[2], 10);
        console.log('✅ GES selection completado para cargo', cargoIndex, '- generando pasos de controles');
        await this.handleGESSelection(cargoIndex);
      }

      // Paso 5: Guardar en historial
      this.wizard.history.push(this.wizard.currentStep);

      // Paso 6: Avanzar al siguiente paso
      this.wizard.currentStep++;

      // Paso 7: Si llegamos al final, completar wizard
      if (this.wizard.currentStep >= this.wizard.steps.length) {
        await this.wizard.complete();
        return;
      }

      // Paso 8: Notificar cambio
      this.wizard.options.onStepChange(this.wizard.currentStep, this.wizard.steps[this.wizard.currentStep]);

      // Paso 9: Re-render con animación PRIMERO
      await this.wizard.renderWithAnimation('forward');

      // Paso 10: DESPUÉS del render, ejecutar onEnter del nuevo paso
      const nextStep = this.wizard.steps[this.wizard.currentStep];
      if (nextStep.onEnter) {
        await nextStep.onEnter.call(this.wizard, this.wizard.data);
      }
    };
  }

  /**
   * Manejar cambios de paso
   */
  async handleStepChange(stepIndex, step) {
    console.log('Step changed to:', step.id, 'index:', stepIndex);
    // Este método ahora solo se usa para tracking/logging
  }

  /**
   * Generar pasos dinámicos después de saber numCargos
   */
  generateDynamicSteps() {
    console.log(`Generando pasos para ${this.totalCargos} cargos`);

    // Limpiar pasos dinámicos anteriores
    this.dynamicSteps = [];

    // Generar pasos para cada cargo
    for (let i = 0; i < this.totalCargos; i++) {
      // Paso 1: Info del cargo
      this.dynamicSteps.push(createCargoInfoStep(i, this.totalCargos));

      // Paso 2: Toggles especiales
      // Capturar wizard en closure para evitar problemas de binding
      const wizard = this.wizard;

      this.dynamicSteps.push({
        id: `toggles-especiales-${i}`,
        title: `Características especiales ${i + 1}`,
        render: (...args) => {
          const cargoData = wizard.data[`cargo-info-${i}`];
          const cargoName = cargoData?.cargoName || `Cargo ${i + 1}`;
          const togglesStep = createTogglesEspecialesStep(i, this.totalCargos, cargoName);
          return togglesStep.render(...args);
        },
        getData: (...args) => {
          const cargoData = wizard.data[`cargo-info-${i}`];
          const cargoName = cargoData?.cargoName || `Cargo ${i + 1}`;
          const togglesStep = createTogglesEspecialesStep(i, this.totalCargos, cargoName);
          return togglesStep.getData ? togglesStep.getData(...args) : {};
        },
        validate: (...args) => {
          const cargoData = wizard.data[`cargo-info-${i}`];
          const cargoName = cargoData?.cargoName || `Cargo ${i + 1}`;
          const togglesStep = createTogglesEspecialesStep(i, this.totalCargos, cargoName);
          return togglesStep.validate(...args);
        },
        onEnter: function(...args) {
          const cargoData = wizard.data[`cargo-info-${i}`];
          const cargoName = cargoData?.cargoName || `Cargo ${i + 1}`;
          const togglesStep = createTogglesEspecialesStep(i, this.totalCargos, cargoName);
          if (togglesStep.onEnter) {
            return togglesStep.onEnter.call(this, ...args);
          }
        }
      });

      // Paso 3: Selección de GES
      this.dynamicSteps.push({
        id: `ges-selection-${i}`,
        title: `Riesgos del cargo ${i + 1}`,
        render: (...args) => {
          // Obtener el nombre del cargo del wizard data
          const cargoData = wizard.data[`cargo-info-${i}`];
          const cargoName = cargoData?.cargoName || `Cargo ${i + 1}`;

          // Crear el paso con el nombre real
          const gesStep = createGESSelectionStep(i, this.totalCargos, cargoName);
          return gesStep.render(...args);
        },
        getData: (...args) => {
          const cargoData = wizard.data[`cargo-info-${i}`];
          const cargoName = cargoData?.cargoName || `Cargo ${i + 1}`;
          const gesStep = createGESSelectionStep(i, this.totalCargos, cargoName);
          return gesStep.getData ? gesStep.getData(...args) : {};
        },
        validate: (...args) => {
          const cargoData = wizard.data[`cargo-info-${i}`];
          const cargoName = cargoData?.cargoName || `Cargo ${i + 1}`;
          const gesStep = createGESSelectionStep(i, this.totalCargos, cargoName);
          return gesStep.validate(...args);
        },
        onEnter: function(...args) {
          const cargoData = wizard.data[`cargo-info-${i}`];
          const cargoName = cargoData?.cargoName || `Cargo ${i + 1}`;
          const gesStep = createGESSelectionStep(i, this.totalCargos, cargoName);
          if (gesStep.onEnter) {
            return gesStep.onEnter.call(this, ...args);
          }
        }
      });

      // Los pasos de controles se agregarán dinámicamente después de seleccionar GES
    }

    // Agregar paso de revisión al final
    this.dynamicSteps.push(reviewStep);

    // Reemplazar los steps del wizard (mantener los 3 primeros fijos + dinámicos)
    this.wizard.steps = [
      welcomeStep,
      empresaStep,
      numCargosStep,
      ...this.dynamicSteps
    ];

    console.log('Pasos totales generados:', this.wizard.steps.length);
  }

  /**
   * Manejar selección de GES y generar pasos de controles + niveles
   */
  async handleGESSelection(cargoIndex) {
    console.log(`Generando pasos de controles y niveles para cargo ${cargoIndex}`);
    console.log('this:', this);
    console.log('this.wizard:', this.wizard);
    console.log('this.wizard.data:', this.wizard?.data);

    if (!this.wizard || !this.wizard.data) {
      console.error('ERROR: this.wizard o this.wizard.data es undefined!');
      return;
    }

    const cargoInfoData = this.wizard.data[`cargo-info-${cargoIndex}`];
    const gesData = this.wizard.data[`ges-selection-${cargoIndex}`];

    if (!gesData || !gesData.gesSeleccionados || gesData.gesSeleccionados.length === 0) {
      return;
    }

    const cargoName = cargoInfoData?.cargoName || `Cargo ${cargoIndex + 1}`;
    const gesSeleccionados = gesData.gesSeleccionados;

    // Generar pasos de controles para cada GES
    // Nota: Los niveles ahora están INTEGRADOS en createControlesStep (un solo paso)
    const gesSteps = [];
    gesSeleccionados.forEach((ges, gesIndex) => {
      // Paso de controles (incluye niveles - ambos en un solo slide)
      gesSteps.push(createControlesStep(cargoIndex, gesIndex, cargoName, ges.riesgo, ges.ges));
    });

    // Insertar pasos después del paso actual de GES
    const currentStepId = `ges-selection-${cargoIndex}`;
    const currentStepIndex = this.wizard.steps.findIndex(s => s.id === currentStepId);

    if (currentStepIndex !== -1) {
      // FIX BUG #1: Solo borrar datos de pasos que YA NO EXISTEN
      // (cuando el usuario cambió los GES seleccionados)
      const oldSteps = this.wizard.steps.filter(s =>
        s.id.startsWith(`controles-${cargoIndex}-`)
      );

      // IDs de los nuevos pasos que se van a crear
      const newStepIds = gesSteps.map(s => s.id);

      oldSteps.forEach(step => {
        const idx = this.wizard.steps.findIndex(s => s.id === step.id);
        if (idx !== -1) {
          this.wizard.steps.splice(idx, 1);

          // Solo borrar datos si el paso YA NO EXISTE en los nuevos pasos
          if (!newStepIds.includes(step.id)) {
            delete this.wizard.data[step.id];
            console.log(`🗑️ Deleted data for removed step: ${step.id}`);
          } else {
            console.log(`💾 Keeping data for existing step: ${step.id}`);
          }
        }
      });

      // Insertar nuevos pasos justo después del paso de GES
      this.wizard.steps.splice(currentStepIndex + 1, 0, ...gesSteps);

      console.log(`Insertados ${gesSteps.length} pasos de controles (con niveles integrados) para cargo ${cargoIndex}`);
      console.log('Pasos totales ahora:', this.wizard.steps.length);
    }
  }

  /**
   * Manejar finalización del wizard
   */
  async handleComplete(data) {
    console.log('Wizard completado! Datos:', data);

    try {
      // Actualizar cargoState con todos los datos
      if (data.empresa) {
        cargoState.updateEmpresa(data.empresa);
      }

      // Procesar cada cargo
      Object.keys(data).forEach(key => {
        if (key.startsWith('cargo-info-')) {
          const cargoIndex = parseInt(key.split('-')[2], 10);
          const cargoInfo = data[key];
          const togglesData = data[`toggles-especiales-${cargoIndex}`] || {};
          const gesData = data[`ges-selection-${cargoIndex}`] || {};

          // Obtener controles y niveles de cada GES
          // Nota: Ahora están UNIFICADOS en el mismo paso (controles-X-Y)
          const gesConControles = (gesData.gesSeleccionados || []).map((ges, gesIndex) => {
            const controlKey = `controles-${cargoIndex}-${gesIndex}`;
            const stepData = data[controlKey] || {};

            // El paso unificado contiene tanto controles (fuente, medio, individuo) como niveles (nd, ne, nc)
            return {
              ...ges,
              controles: {
                fuente: stepData.fuente || '',
                medio: stepData.medio || '',
                individuo: stepData.individuo || ''
              },
              niveles: {
                deficiencia: { value: stepData.nd ? parseInt(stepData.nd, 10) : null },
                exposicion: { value: stepData.ne ? parseInt(stepData.ne, 10) : null },
                consecuencia: { value: stepData.nc ? parseInt(stepData.nc, 10) : null }
              }
            };
          });

          // Agregar cargo al state con todos los campos
          // Toggles pueden venir de:
          // 1. cargoInfo directamente (si se agregaron en cargo-info paso)
          // 2. togglesData del paso separado toggles-especiales (legacy)
          cargoState.addCargo({
            ...cargoInfo,
            // Incluir toggles especiales (priorizar cargoInfo sobre togglesData)
            tareasRutinarias: cargoInfo.tareasRutinarias ?? togglesData.tareasRutinarias ?? false,
            manipulaAlimentos: cargoInfo.manipulaAlimentos ?? togglesData.manipulaAlimentos ?? false,
            trabajaAlturas: cargoInfo.trabajaAlturas ?? togglesData.trabajaAlturas ?? false,
            trabajaEspaciosConfinados: cargoInfo.trabajaEspaciosConfinados ?? togglesData.trabajaEspaciosConfinados ?? false,
            conduceVehiculo: cargoInfo.conduceVehiculo ?? togglesData.conduceVehiculo ?? false,
            // GES con controles
            gesSeleccionados: gesConControles
          });
        }
      });

      // Validar datos finales
      const validation = cargoState.validate();
      if (!validation.isValid) {
        throw new Error(`Validación fallida: ${validation.errors.join(', ')}`);
      }

      // Obtener datos limpios
      const finalData = cargoState.getState();

      console.log('Datos finales validados:', finalData);

      // Enviar a backend
      const response = await fetch('/api/flujo-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      // Redirigir a página de resultados
      if (result.solicitudId) {
        window.location.href = `/pages/resultados_ia.html?id=${result.solicitudId}`;
      } else {
        alert('¡Diagnóstico completado con éxito!');
      }
    } catch (error) {
      console.error('Error al completar wizard:', error);
      alert(`Error: ${error.message}`);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new DiagnosticoWizard();
  app.init();
});
