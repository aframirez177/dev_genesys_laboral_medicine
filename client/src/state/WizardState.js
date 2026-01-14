/**
 * WizardState - Centralized State Management for Wizard Riesgos
 *
 * Responsibilities:
 * - Store wizard form data (info básica, cargos, riesgos, niveles, controles)
 * - Persist state to localStorage
 * - Notify listeners on state changes (Observer pattern)
 * - Validate data per step
 * - Track analytics (time per step, errors)
 * - Export formatted data for backend submission
 */

export class WizardState {
  constructor() {
    this.storageKey = 'genesys_wizard_state';
    this.sessionKey = 'genesys_wizard_session';
    this.data = this.loadFromStorage() || this.getInitialState();
    this.listeners = [];
    this.lastToastTime = 0; // Track last toast timestamp for throttling (5s)

    // Track session start time
    if (!this.data.analytics.sessionStartTime) {
      this.data.analytics.sessionStartTime = Date.now();
    }
  }

  /**
   * Initial state structure
   */
  getInitialState() {
    return {
      // Current wizard step
      currentStep: 'info-basica',

      // Form data
      formData: {
        nombreEmpresa: '',
        nit: '',
        email: '',
        sector: '', // Legacy - kept for backward compatibility
        ciiuSeccion: '', // CIIU Section code (A, B, C, ...)
        ciiuDivision: '', // CIIU Division code (01, 02, ...)
        ciudad: '',
        cargos: []
        // Each cargo: {
        //   nombre: '',
        //   descripcion: '',
        //   numPersonas: 1,
        //   ges: []
        //   // Each GES: {
        //   //   idGes: number,
        //   //   nombre: '',
        //   //   categoria: '',
        //   //   niveles: { ND: null, NE: null, NC: null, NP: null, NR: null },
        //   //   controles: { eliminacion: '', sustitucion: '', ingenieria: '', administrativos: '', epp: '' }
        //   // }
        // }
      },

      // Catalogos loaded from API
      catalogos: {
        riesgos: [], // 84 GES from backend
        gesComunes: [], // 10 most common GES
        sectores: []
      },

      // Validation state
      validation: {
        errors: {},
        touched: {},
        isValid: false
      },

      // Analytics
      analytics: {
        sessionStartTime: null,
        timeSpentPerStep: {},
        stepStartTime: Date.now(),
        errorCount: 0,
        cargoCount: 0,
        gesCount: 0
      }
    };
  }

  /**
   * Load state from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - (parsed.analytics.sessionStartTime || 0);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge < maxAge) {
          console.log('[WizardState] Loaded state from localStorage', parsed);
          return parsed;
        } else {
          console.log('[WizardState] Session expired, starting fresh');
          localStorage.removeItem(this.storageKey);
        }
      }
    } catch (error) {
      console.error('[WizardState] Error loading from storage:', error);
      localStorage.removeItem(this.storageKey);
    }
    return null;
  }

  /**
   * Save state to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      console.log('[WizardState] Saved to localStorage');

      // Show toast notification
      this.showToast('Guardado automáticamente', 'success');
    } catch (error) {
      console.error('[WizardState] Error saving to storage:', error);
      this.showToast('Error al guardar', 'error');
    }
  }

  /**
   * Clear state from localStorage
   */
  clearStorage() {
    localStorage.removeItem(this.storageKey);
    this.data = this.getInitialState();
    this.notify();
  }

  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type: 'success', 'error', 'info'
   */
  showToast(message, type = 'success') {
    // Throttle toasts: only show if 5 seconds have passed since last toast
    const now = Date.now();
    const THROTTLE_MS = 5000; // 5 seconds

    // Always show error toasts immediately
    if (type !== 'error' && now - this.lastToastTime < THROTTLE_MS) {
      console.log('[WizardState] Toast throttled:', message);
      return;
    }

    this.lastToastTime = now;

    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.wizard-toast');
    existingToasts.forEach(toast => toast.remove());

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `wizard-toast wizard-toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-exclamation-circle' :
                 'fa-info-circle';

    toast.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    `;

    // Add to document
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('wizard-toast--visible');
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('wizard-toast--visible');

      // Remove from DOM after animation
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // ==================== OBSERVER PATTERN ====================

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function(state)
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notify() {
    this.listeners.forEach(listener => {
      try {
        listener(this.data);
      } catch (error) {
        console.error('[WizardState] Error in listener:', error);
      }
    });
    this.saveToStorage();
  }

  // ==================== STEP MANAGEMENT ====================

  /**
   * Get current step
   */
  getCurrentStep() {
    return this.data.currentStep;
  }

  /**
   * Set current step
   */
  setCurrentStep(stepName) {
    // Track time spent on previous step
    const previousStep = this.data.currentStep;
    const timeSpent = Date.now() - this.data.analytics.stepStartTime;

    if (!this.data.analytics.timeSpentPerStep[previousStep]) {
      this.data.analytics.timeSpentPerStep[previousStep] = 0;
    }
    this.data.analytics.timeSpentPerStep[previousStep] += timeSpent;

    // Update to new step
    this.data.currentStep = stepName;
    this.data.analytics.stepStartTime = Date.now();

    this.notify();
  }

  /**
   * Validate current step
   */
  validateStep(stepName) {
    const errors = {};
    const step = stepName || this.data.currentStep;

    switch (step) {
      case 'info-basica':
        if (!this.data.formData.nombreEmpresa || this.data.formData.nombreEmpresa.trim().length < 3) {
          errors.nombreEmpresa = 'El nombre de la empresa debe tener al menos 3 caracteres';
        }
        if (!this.data.formData.nit || !/^\d{9,10}$/.test(this.data.formData.nit)) {
          errors.nit = 'El NIT debe tener 9 o 10 dígitos';
        }
        if (!this.data.formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.data.formData.email)) {
          errors.email = 'Email inválido';
        }
        // Validate CIIU fields
        if (!this.data.formData.ciiuSeccion) {
          errors.ciiuSeccion = 'Debe seleccionar una sección económica';
        }
        if (!this.data.formData.ciiuDivision) {
          errors.ciiuDivision = 'Debe seleccionar una actividad económica';
        }
        if (!this.data.formData.ciudad || this.data.formData.ciudad.trim().length < 2) {
          errors.ciudad = 'Debe ingresar una ciudad';
        }
        break;

      case 'cargos':
        if (!this.data.formData.cargos || this.data.formData.cargos.length === 0) {
          errors.cargos = 'Debe agregar al menos un cargo';
        }
        this.data.formData.cargos.forEach((cargo, index) => {
          if (!cargo.nombre || cargo.nombre.trim().length < 3) {
            errors[`cargo_${index}_nombre`] = 'El nombre del cargo debe tener al menos 3 caracteres';
          }
          if (!cargo.numPersonas || cargo.numPersonas < 1) {
            errors[`cargo_${index}_numPersonas`] = 'Debe haber al menos 1 persona en el cargo';
          }
          if (!cargo.area || cargo.area.trim().length < 2) {
            errors[`cargo_${index}_area`] = 'El área debe tener al menos 2 caracteres';
          }
          if (!cargo.zona || cargo.zona.trim().length < 2) {
            errors[`cargo_${index}_zona`] = 'La zona debe tener al menos 2 caracteres';
          }
        });
        break;

      case 'riesgos':
        this.data.formData.cargos.forEach((cargo, cargoIndex) => {
          if (!cargo.ges || cargo.ges.length === 0) {
            errors[`cargo_${cargoIndex}_ges`] = `El cargo "${cargo.nombre}" debe tener al menos un riesgo/GES asignado`;
          }
        });
        break;

      case 'niveles':
        this.data.formData.cargos.forEach((cargo, cargoIndex) => {
          cargo.ges.forEach((ges, gesIndex) => {
            const niveles = ges.niveles;
            // FIX: Explicit null/undefined check to allow value 0 (Bajo)
            if (niveles.deficiencia?.value === undefined || niveles.deficiencia?.value === null ||
                niveles.exposicion?.value === undefined || niveles.exposicion?.value === null ||
                niveles.consecuencia?.value === undefined || niveles.consecuencia?.value === null) {
              errors[`cargo_${cargoIndex}_ges_${gesIndex}_niveles`] =
                `Debe completar los niveles de riesgo para "${ges.nombre}"`;
            }
          });
        });
        break;

      case 'controles':
        // Controles are optional, no validation needed
        break;

      case 'resumen':
        // Final validation - all previous steps must be valid
        const allSteps = ['info-basica', 'cargos', 'riesgos', 'niveles'];
        allSteps.forEach(s => {
          const stepErrors = this.validateStep(s);
          Object.assign(errors, stepErrors);
        });
        break;
    }

    this.data.validation.errors = errors;
    this.data.validation.isValid = Object.keys(errors).length === 0;

    if (Object.keys(errors).length > 0) {
      this.data.analytics.errorCount++;
    }

    return errors;
  }

  /**
   * Validate a single field (for inline validation)
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @returns {string|null} - Error message or null if valid
   */
  validateSingleField(field, value) {
    // Validación específica por campo
    switch(field) {
      case 'nombreEmpresa':
        if (!value || value.trim().length < 3) {
          return 'El nombre de la empresa debe tener al menos 3 caracteres';
        }
        if (value.trim().length > 100) {
          return 'El nombre de la empresa no puede exceder 100 caracteres';
        }
        break;

      case 'nit':
        if (!value) {
          return 'El NIT es requerido';
        }
        const nitClean = value.replace(/[^0-9]/g, '');
        if (nitClean.length < 9 || nitClean.length > 10) {
          return 'El NIT debe tener 9 o 10 dígitos';
        }
        break;

      case 'email':
        if (!value) {
          return 'El email es requerido';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Por favor ingresa un email válido (ejemplo: usuario@empresa.com)';
        }
        break;

      case 'sector':
        // Legacy field - no longer required
        break;

      case 'ciiuSeccion':
        if (!value || value === '') {
          return 'Debe seleccionar una sección económica';
        }
        break;

      case 'ciiuDivision':
        if (!value || value === '') {
          return 'Debe seleccionar una actividad económica';
        }
        break;

      case 'telefono':
        if (value && value.length > 0) {
          const telefonoClean = value.replace(/[^0-9]/g, '');
          if (telefonoClean.length < 7) {
            return 'El teléfono debe tener al menos 7 dígitos';
          }
          if (telefonoClean.length > 15) {
            return 'El teléfono no puede exceder 15 dígitos';
          }
        }
        break;

      case 'direccion':
        if (value && value.length > 0 && value.trim().length < 5) {
          return 'La dirección debe tener al menos 5 caracteres';
        }
        break;

      case 'ciudad':
        if (value && value.length > 0 && value.trim().length < 3) {
          return 'La ciudad debe tener al menos 3 caracteres';
        }
        break;

      default:
        // No validation for unknown fields
        return null;
    }

    return null; // No error
  }

  // ==================== FORM DATA MANAGEMENT ====================

  /**
   * Update basic info
   * @param {boolean} silent - If true, don't notify listeners (prevents re-render on every keystroke)
   */
  updateBasicInfo(field, value, silent = false) {
    this.data.formData[field] = value;
    this.data.validation.touched[field] = true;

    // Save to storage immediately (auto-save)
    this.saveToStorage();

    // Only notify (trigger re-render) if not silent
    if (!silent) {
      this.notify();
    }
  }

  /**
   * Set catalogos from API
   */
  setCatalogos(catalogos) {
    this.data.catalogos = {
      ...this.data.catalogos,
      ...catalogos
    };
    this.notify();
  }

  // ==================== CARGO MANAGEMENT ====================

  /**
   * Add new cargo
   */
  addCargo(cargoData) {
    // Validate unique name
    if (!this.isCargoNameUnique(cargoData.nombre || '')) {
      return { success: false, error: 'Ya existe un cargo con ese nombre' };
    }

    // Validate nombre length
    if (!cargoData.nombre || cargoData.nombre.trim().length < 3) {
      return { success: false, error: 'El nombre del cargo debe tener al menos 3 caracteres' };
    }

    // Validate numPersonas
    if (cargoData.numPersonas < 1) {
      return { success: false, error: 'Debe haber al menos 1 persona en el cargo' };
    }

    // Validate area
    if (!cargoData.area || cargoData.area.trim().length < 2) {
      return { success: false, error: 'El área debe tener al menos 2 caracteres' };
    }

    // Validate zona
    if (!cargoData.zona || cargoData.zona.trim().length < 2) {
      return { success: false, error: 'La zona debe tener al menos 2 caracteres' };
    }

    const newCargo = {
      nombre: cargoData.nombre,
      descripcion: cargoData.descripcion || '',
      numPersonas: cargoData.numPersonas || 1,
      area: cargoData.area || '',
      zona: cargoData.zona || '',
      // Toggles especiales (requeridos por backend para generación de documentos)
      tareasRutinarias: cargoData.tareasRutinarias || false,
      manipulaAlimentos: cargoData.manipulaAlimentos || false,
      trabajaAlturas: cargoData.trabajaAlturas || false,
      trabajaEspaciosConfinados: cargoData.trabajaEspaciosConfinados || false,
      conduceVehiculo: cargoData.conduceVehiculo || false,
      ges: [],
      gesSeleccionados: [] // For tracking selected GES IDs
    };

    this.data.formData.cargos.push(newCargo);
    this.data.analytics.cargoCount++;
    this.notify();

    return { success: true, index: this.data.formData.cargos.length - 1 }; // Return index
  }

  /**
   * Check if cargo name is unique (excluding specified index)
   */
  isCargoNameUnique(nombre, excludeIndex = -1) {
    return !this.data.formData.cargos.some((cargo, index) => {
      if (index === excludeIndex) return false; // Skip the cargo being edited
      return cargo.nombre.toLowerCase().trim() === nombre.toLowerCase().trim();
    });
  }

  /**
   * Update cargo
   */
  updateCargo(cargoIndex, cargoData) {
    if (cargoIndex < 0 || cargoIndex >= this.data.formData.cargos.length) {
      console.error('[WizardState] Invalid cargo index:', cargoIndex);
      return { success: false, error: 'Índice de cargo inválido' };
    }

    // Validate unique name if nombre is being updated
    if (cargoData.nombre) {
      if (!this.isCargoNameUnique(cargoData.nombre, cargoIndex)) {
        return { success: false, error: 'Ya existe un cargo con ese nombre' };
      }

      // Validate nombre length
      if (cargoData.nombre.trim().length < 3) {
        return { success: false, error: 'El nombre del cargo debe tener al menos 3 caracteres' };
      }
    }

    // Validate numPersonas if being updated
    if (cargoData.numPersonas !== undefined && cargoData.numPersonas < 1) {
      return { success: false, error: 'Debe haber al menos 1 persona en el cargo' };
    }

    // Validate area if being updated
    if (cargoData.area !== undefined && cargoData.area.trim().length < 2) {
      return { success: false, error: 'El área debe tener al menos 2 caracteres' };
    }

    // Validate zona if being updated
    if (cargoData.zona !== undefined && cargoData.zona.trim().length < 2) {
      return { success: false, error: 'La zona debe tener al menos 2 caracteres' };
    }

    this.data.formData.cargos[cargoIndex] = {
      ...this.data.formData.cargos[cargoIndex],
      ...cargoData
    };
    this.notify();

    return { success: true };
  }

  /**
   * Remove cargo
   */
  removeCargo(cargoIndex) {
    if (cargoIndex < 0 || cargoIndex >= this.data.formData.cargos.length) {
      console.error('[WizardState] Invalid cargo index:', cargoIndex);
      return;
    }

    this.data.formData.cargos.splice(cargoIndex, 1);
    this.notify();
  }

  /**
   * Get cargo by index
   */
  getCargo(cargoIndex) {
    return this.data.formData.cargos[cargoIndex];
  }

  /**
   * Get all cargos
   */
  getCargos() {
    return this.data.formData.cargos;
  }

  // ==================== GES/RIESGO MANAGEMENT ====================

  /**
   * Add GES to cargo
   */
  addGESToCargo(cargoIndex, gesData) {
    if (cargoIndex < 0 || cargoIndex >= this.data.formData.cargos.length) {
      console.error('[WizardState] Invalid cargo index:', cargoIndex);
      return;
    }

    const cargo = this.data.formData.cargos[cargoIndex];

    // Check if GES already exists in this cargo
    const exists = cargo.ges.some(g => g.idGes === gesData.idGes);
    if (exists) {
      console.warn('[WizardState] GES already exists in cargo:', gesData.idGes);
      return;
    }

    const newGES = {
      idGes: gesData.idGes,
      nombre: gesData.nombre,
      categoria: gesData.categoria || '',
      niveles: {
        deficiencia: { value: null, label: '', color: '', description: '' },
        exposicion: { value: null, label: '', color: '', description: '' },
        consecuencia: { value: null, label: '', color: '', description: '' },
        nivelProbabilidad: null,  // Calculado: ND * NE
        nivelRiesgo: null         // Calculado: NP * NC
      },
      controles: {
        eliminacion: '',
        sustitucion: '',
        ingenieria: '',
        administrativos: '',
        epp: ''
      }
    };

    cargo.ges.push(newGES);
    this.data.analytics.gesCount++;
    this.notify();
  }

  /**
   * Remove GES from cargo
   */
  removeGESFromCargo(cargoIndex, gesIndex) {
    if (cargoIndex < 0 || cargoIndex >= this.data.formData.cargos.length) {
      console.error('[WizardState] Invalid cargo index:', cargoIndex);
      return;
    }

    const cargo = this.data.formData.cargos[cargoIndex];
    if (gesIndex < 0 || gesIndex >= cargo.ges.length) {
      console.error('[WizardState] Invalid GES index:', gesIndex);
      return;
    }

    cargo.ges.splice(gesIndex, 1);
    this.notify();
  }

  /**
   * Update GES niveles (ND, NE, NC)
   * Auto-calculates NP and NR
   */
  updateGESNiveles(cargoIndex, gesIndex, niveles) {
    if (cargoIndex < 0 || cargoIndex >= this.data.formData.cargos.length) {
      console.error('[WizardState] Invalid cargo index:', cargoIndex);
      return;
    }

    const cargo = this.data.formData.cargos[cargoIndex];
    if (gesIndex < 0 || gesIndex >= cargo.ges.length) {
      console.error('[WizardState] Invalid GES index:', gesIndex);
      return;
    }

    const ges = cargo.ges[gesIndex];

    // Update niveles (objetos completos)
    ges.niveles = {
      ...ges.niveles,
      ...niveles
    };

    // Calculate NP (Nivel de Probabilidad) = deficiencia.value * exposicion.value
    // ✅ FIX: Usar !== null && !== undefined para soportar valor 0 en deficiencia
    if (ges.niveles.deficiencia?.value !== null && ges.niveles.deficiencia?.value !== undefined &&
        ges.niveles.exposicion?.value !== null && ges.niveles.exposicion?.value !== undefined) {
      ges.niveles.nivelProbabilidad = ges.niveles.deficiencia.value * ges.niveles.exposicion.value;
      console.log(`[WizardState] Calculated NP: ${ges.niveles.nivelProbabilidad}`);
    }

    // Calculate NR (Nivel de Riesgo) = NP * consecuencia.value
    // ✅ FIX: Usar !== null && !== undefined para soportar NP = 0
    if (ges.niveles.nivelProbabilidad !== null && ges.niveles.nivelProbabilidad !== undefined &&
        ges.niveles.consecuencia?.value !== null && ges.niveles.consecuencia?.value !== undefined) {
      ges.niveles.nivelRiesgo = ges.niveles.nivelProbabilidad * ges.niveles.consecuencia.value;
      console.log(`[WizardState] Calculated NR: ${ges.niveles.nivelRiesgo}`);
    }

    this.notify();
  }

  /**
   * Update GES controles
   */
  updateGESControles(cargoIndex, gesIndex, controles) {
    if (cargoIndex < 0 || cargoIndex >= this.data.formData.cargos.length) {
      console.error('[WizardState] Invalid cargo index:', cargoIndex);
      return;
    }

    const cargo = this.data.formData.cargos[cargoIndex];
    if (gesIndex < 0 || gesIndex >= cargo.ges.length) {
      console.error('[WizardState] Invalid GES index:', gesIndex);
      return;
    }

    const ges = cargo.ges[gesIndex];
    ges.controles = {
      ...ges.controles,
      ...controles
    };

    this.notify();
  }

  /**
   * Get controles for a specific GES by cargo ID and GES ID
   * Convenience method that converts IDs to indices
   */
  getControles(cargoId, gesId) {
    const cargoIndex = this.data.formData.cargos.findIndex(c => c.id === cargoId);
    if (cargoIndex === -1) {
      console.error('[WizardState] Cargo not found:', cargoId);
      return null;
    }

    const cargo = this.data.formData.cargos[cargoIndex];
    const gesIndex = cargo.ges.findIndex(g => g.id === gesId);
    if (gesIndex === -1) {
      console.error('[WizardState] GES not found:', gesId);
      return null;
    }

    return cargo.ges[gesIndex].controles || {};
  }

  /**
   * Set controles for a specific GES by cargo ID and GES ID
   * Convenience method that converts IDs to indices
   */
  setControles(cargoId, gesId, controles) {
    const cargoIndex = this.data.formData.cargos.findIndex(c => c.id === cargoId);
    if (cargoIndex === -1) {
      console.error('[WizardState] Cargo not found:', cargoId);
      return;
    }

    const cargo = this.data.formData.cargos[cargoIndex];
    const gesIndex = cargo.ges.findIndex(g => g.id === gesId);
    if (gesIndex === -1) {
      console.error('[WizardState] GES not found:', gesId);
      return;
    }

    this.updateGESControles(cargoIndex, gesIndex, controles);
  }

  // ==================== DATA IMPORT ====================

  /**
   * Import data from external JSON (e.g., from AI analysis of Excel/PDF)
   * Validates and loads the data into the wizard state
   * @param {object} jsonData - Data in the format expected by the wizard
   * @returns {object} - { success: boolean, message: string, warnings?: string[], cargosImportados?: number, gesImportados?: number }
   */
  importFromJSON(jsonData) {
    const warnings = [];

    try {
      // Validate basic structure
      if (!jsonData) {
        return { success: false, message: 'El archivo JSON está vacío' };
      }

      // Extract userData and formData (support both direct format and nested)
      const userData = jsonData.userData || jsonData;
      const formData = jsonData.formData || jsonData;
      const cargos = formData.cargos || [];

      // === IMPORT EMPRESA INFO ===
      if (userData.nombreEmpresa && userData.nombreEmpresa.length >= 3) {
        this.data.formData.nombreEmpresa = userData.nombreEmpresa;
      } else if (userData.nombreEmpresa) {
        warnings.push('Nombre de empresa muy corto (mínimo 3 caracteres)');
      }

      if (userData.nit) {
        const nitClean = userData.nit.replace(/[^0-9]/g, '');
        if (/^\d{9,10}$/.test(nitClean)) {
          this.data.formData.nit = nitClean;
        } else {
          warnings.push('NIT inválido (debe tener 9-10 dígitos)');
        }
      }

      if (userData.email) {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
          this.data.formData.email = userData.email;
        } else {
          warnings.push('Email inválido');
        }
      }

      // Optional fields
      if (userData.ciiuSeccion) this.data.formData.ciiuSeccion = userData.ciiuSeccion;
      if (userData.ciiuDivision) this.data.formData.ciiuDivision = userData.ciiuDivision;
      if (userData.ciudad) this.data.formData.ciudad = userData.ciudad;

      // === IMPORT CARGOS ===
      if (!cargos || cargos.length === 0) {
        warnings.push('No se encontraron cargos en el JSON');
      } else {
        // Clear existing cargos
        this.data.formData.cargos = [];
        this.data.analytics.cargoCount = 0;
        this.data.analytics.gesCount = 0;

        cargos.forEach((cargo, index) => {
          const cargoName = cargo.cargoName || cargo.nombre || `Cargo ${index + 1}`;

          // Validate cargo
          if (cargoName.length < 3) {
            warnings.push(`Cargo ${index + 1}: nombre muy corto`);
            return;
          }

          const newCargo = {
            nombre: cargoName,
            descripcion: cargo.descripcionTareas || cargo.descripcion || '',
            numPersonas: cargo.numTrabajadores || cargo.numPersonas || 1,
            area: cargo.area || 'General',
            zona: cargo.zona || 'Principal',
            tareasRutinarias: cargo.tareasRutinarias || false,
            manipulaAlimentos: cargo.manipulaAlimentos || false,
            trabajaAlturas: cargo.trabajaAlturas || false,
            trabajaEspaciosConfinados: cargo.trabajaEspaciosConfinados || false,
            conduceVehiculo: cargo.conduceVehiculo || false,
            ges: [],
            gesSeleccionados: []
          };

          // Import GES/riesgos
          const gesArray = cargo.gesSeleccionados || cargo.ges || [];

          if (gesArray.length === 0) {
            warnings.push(`Cargo "${cargoName}": no tiene riesgos asignados`);
          }

          gesArray.forEach((gesItem, gesIndex) => {
            const gesName = gesItem.ges || gesItem.nombre || `Riesgo ${gesIndex + 1}`;
            const categoriaRaw = gesItem.riesgo || gesItem.categoria || 'Otros Riesgos';

            // Mapeo de nombres simplificados (del prompt) a nombres de BD
            const categoriaMap = {
              'Físico': 'Riesgo Físico',
              'Químico': 'Riesgo Químico',
              'Biológico': 'Riesgo Biológico',
              'Biomecánico': 'Riesgo Biomecánico',
              'Psicosocial': 'Riesgo Psicosocial',
              'Mecánico': 'Condiciones de Seguridad',
              'Eléctrico': 'Condiciones de Seguridad',
              'Locativo': 'Condiciones de Seguridad',
              'Seguridad': 'Condiciones de Seguridad',
              'Natural': 'Fenómenos Naturales',
              'Tecnológico': 'Riesgo Tecnológico',
              // Nombres completos (por si ya vienen correctos)
              'Riesgo Físico': 'Riesgo Físico',
              'Riesgo Químico': 'Riesgo Químico',
              'Riesgo Biológico': 'Riesgo Biológico',
              'Riesgo Biomecánico': 'Riesgo Biomecánico',
              'Riesgo Psicosocial': 'Riesgo Psicosocial',
              'Condiciones de Seguridad': 'Condiciones de Seguridad',
              'Fenómenos Naturales': 'Fenómenos Naturales',
              'Riesgo Tecnológico': 'Riesgo Tecnológico'
            };
            const categoria = categoriaMap[categoriaRaw] || categoriaRaw;

            // Parse niveles
            const niveles = gesItem.niveles || {};

            // Helper to parse nivel value
            const parseNivel = (nivel) => {
              if (!nivel) return null;
              if (typeof nivel === 'number') return nivel;
              if (typeof nivel === 'object' && nivel.value !== undefined) return nivel.value;
              return parseInt(nivel) || null;
            };

            const ndValue = parseNivel(niveles.deficiencia) || 2;
            const neValue = parseNivel(niveles.exposicion) || 2;
            const ncValue = parseNivel(niveles.consecuencia) || 25;

            // Build nivel objects with labels
            const ndLabels = { 1: 'Bajo / N/A', 2: 'Medio', 6: 'Alto', 10: 'Muy Alto' };
            const neLabels = { 1: 'Esporádica (EE)', 2: 'Ocasional (EO)', 3: 'Frecuente (EF)', 4: 'Continua (EC)' };
            const ncLabels = { 10: 'Leve', 25: 'Grave', 60: 'Muy Grave', 100: 'Mortal o Catastrófica' };

            // Calcular NP y NR
            const npValue = ndValue * neValue;
            const nrValue = npValue * ncValue;

            const newGES = {
              idGes: gesIndex + 1000 + (index * 100), // Temporary ID for imported GES
              nombre: gesName,
              categoria: categoria,
              // ✅ Formato dual: UI (ND/NE/NC) + exportForSubmission (deficiencia/exposicion/consecuencia)
              niveles: {
                // Formato corto para UI
                ND: ndValue,
                NE: neValue,
                NC: ncValue,
                NP: npValue,
                NR: nrValue,
                // Formato largo para exportForSubmission()
                deficiencia: { value: ndValue },
                exposicion: { value: neValue },
                consecuencia: { value: ncValue }
              },
              controles: this._parseControlesImport(gesItem.controles)
            };

            // ✅ FIX: Guardar en AMBOS arrays para compatibilidad con UI
            // La UI usa gesSeleccionados para mostrar, ges para validación
            newCargo.ges.push(newGES);
            newCargo.gesSeleccionados.push(newGES);
            this.data.analytics.gesCount++;
          });

          this.data.formData.cargos.push(newCargo);
          this.data.analytics.cargoCount++;
        });
      }

      // Save and notify
      this.saveToStorage();
      this.notify();

      const cargosImportados = this.data.formData.cargos.length;
      const gesImportados = this.data.formData.cargos.reduce((sum, c) => sum + c.ges.length, 0);

      if (warnings.length > 0) {
        return {
          success: true,
          message: `Importación completada con ${warnings.length} advertencia(s)`,
          warnings: warnings,
          cargosImportados,
          gesImportados
        };
      }

      return {
        success: true,
        message: 'Importación exitosa',
        cargosImportados,
        gesImportados
      };

    } catch (error) {
      console.error('[WizardState] Error importing JSON:', error);
      return {
        success: false,
        message: 'Error al procesar el archivo JSON: ' + error.message
      };
    }
  }

  /**
   * Helper: Parse controles from various formats
   * El wizard UI usa formato GTC 45: fuente, medio, individuo
   * @private
   */
  _parseControlesImport(controles) {
    if (!controles) {
      return {
        fuente: '',
        medio: '',
        individuo: ''
      };
    }

    // If already in GTC 45 format (fuente, medio, individuo) - return as is
    if (controles.fuente !== undefined || controles.medio !== undefined || controles.individuo !== undefined) {
      return {
        fuente: controles.fuente || '',
        medio: controles.medio || '',
        individuo: controles.individuo || ''
      };
    }

    // If in ISO 45001 format, convert to GTC 45
    if (controles.eliminacion !== undefined) {
      return {
        fuente: [controles.eliminacion, controles.sustitucion].filter(Boolean).join(' | ') || '',
        medio: controles.ingenieria || '',
        individuo: [controles.administrativos, controles.epp].filter(Boolean).join(' | ') || ''
      };
    }

    // Default empty
    return {
      fuente: '',
      medio: '',
      individuo: ''
    };
  }

  // ==================== DATA EXPORT ====================

  /**
   * Convierte controles de ISO 45001 a GTC 45
   * @param {object} controles - Controles en formato ISO 45001
   * @returns {object} Controles en formato GTC 45
   */
  _convertirControlesAGTC45(controles) {
    if (!controles) {
      return {
        fuente: '',
        medio: '',
        individuo: ''
      };
    }

    // Si ya están en formato GTC 45, retornar tal cual
    if (controles.fuente !== undefined) {
      return controles;
    }

    // Mapear ISO 45001 → GTC 45
    return {
      fuente: [
        controles.eliminacion,
        controles.sustitucion
      ].filter(Boolean).join(' | '),

      medio: controles.ingenieria || '',

      individuo: [
        controles.administrativos,
        controles.epp
      ].filter(Boolean).join(' | ')
    };
  }

  /**
   * Calcula nivel de probabilidad (ND × NE)
   */
  _calcularNivelProbabilidad(nivelDef, nivelExp) {
    const nd = typeof nivelDef === 'object' ? nivelDef.value : nivelDef;
    const ne = typeof nivelExp === 'object' ? nivelExp.value : nivelExp;
    return nd * ne;
  }

  /**
   * Calcula nivel de riesgo (NP × NC)
   */
  _calcularNivelRiesgo(nivelProb, nivelCons) {
    const np = nivelProb;
    const nc = typeof nivelCons === 'object' ? nivelCons.value : nivelCons;
    return np * nc;
  }

  /**
   * Interpreta nivel de riesgo según GTC 45
   */
  _interpretarNivelRiesgo(nivelRiesgo) {
    if (nivelRiesgo >= 600) return { nivel: 'I', significado: 'No Aceptable', accion: 'Intervención inmediata', color: 'red' };
    if (nivelRiesgo >= 150) return { nivel: 'II', significado: 'No Aceptable o Aceptable con control', accion: 'Corregir urgente', color: 'orange' };
    if (nivelRiesgo >= 40) return { nivel: 'III', significado: 'Mejorable', accion: 'Mejorar control', color: 'yellow' };
    return { nivel: 'IV', significado: 'Aceptable', accion: 'Mantener control', color: 'green' };
  }

  /**
   * Export data formatted for backend submission
   * Returns structure compatible with POST /api/solicitudes
   */
  exportForSubmission() {
    return {
      formData: {
        cargos: this.data.formData.cargos.map(cargo => ({
          cargoName: cargo.nombre,                    // ✅ Backend espera "cargoName"
          area: cargo.area,                           // ✅ Crítico - GTC 45
          zona: cargo.zona,                           // ✅ Crítico - GTC 45
          numTrabajadores: cargo.numPersonas,         // ✅ Backend espera "numTrabajadores"
          descripcionTareas: cargo.descripcion,       // ✅ Backend espera "descripcionTareas"
          tareasRutinarias: cargo.tareasRutinarias,
          manipulaAlimentos: cargo.manipulaAlimentos,
          trabajaAlturas: cargo.trabajaAlturas,
          trabajaEspaciosConfinados: cargo.trabajaEspaciosConfinados,
          conduceVehiculo: cargo.conduceVehiculo,
          gesSeleccionados: cargo.ges.map(ges => {
            // Normalizar niveles
            const nivelDef = ges.niveles.deficiencia;
            const nivelExp = ges.niveles.exposicion;
            const nivelCons = ges.niveles.consecuencia;

            // Calcular campos derivados
            const nivelProb = this._calcularNivelProbabilidad(nivelDef, nivelExp);
            const nivelRiesgo = this._calcularNivelRiesgo(nivelProb, nivelCons);
            const interpretacion = this._interpretarNivelRiesgo(nivelRiesgo);

            return {
              riesgo: ges.categoria,                    // ✅ Backend espera "riesgo"
              ges: ges.nombre,                          // ✅ Backend espera "ges"
              controles: this._convertirControlesAGTC45(ges.controles), // ✅ GTC 45 format

              // Niveles con estructura completa
              niveles: {
                deficiencia: nivelDef,
                exposicion: nivelExp,
                consecuencia: nivelCons,
                nivelProbabilidad: nivelProb,
                nivelRiesgo: nivelRiesgo,
                interpretacion: interpretacion
              }
            };
          })
        }))
      },
      userData: {
        nombreEmpresa: this.data.formData.nombreEmpresa,
        nit: this.data.formData.nit,
        email: this.data.formData.email,
        sector: this.data.formData.ciiuDivision || this.data.formData.sector, // Use CIIU division or legacy sector
        ciiuSeccion: this.data.formData.ciiuSeccion,
        ciiuDivision: this.data.formData.ciiuDivision,
        ciudad: this.data.formData.ciudad,
        nombreContacto: this.data.formData.nombreContacto || this.data.formData.email
      },
      analytics: {
        totalTimeSeconds: Math.floor((Date.now() - this.data.analytics.sessionStartTime) / 1000),
        timePerStep: this.data.analytics.timeSpentPerStep,
        errorCount: this.data.analytics.errorCount,
        cargoCount: this.data.analytics.cargoCount,
        gesCount: this.data.analytics.gesCount
      }
    };
  }

  /**
   * Get analytics summary
   */
  getAnalytics() {
    return {
      ...this.data.analytics,
      totalTime: Date.now() - this.data.analytics.sessionStartTime,
      currentStepTime: Date.now() - this.data.analytics.stepStartTime
    };
  }
}

// Singleton instance
let instance = null;

/**
 * Get singleton instance
 */
export function getWizardState() {
  if (!instance) {
    instance = new WizardState();
  }
  return instance;
}

/**
 * Reset singleton instance (useful for testing)
 */
export function resetWizardState() {
  if (instance) {
    instance.clearStorage();
  }
  instance = null;
}
