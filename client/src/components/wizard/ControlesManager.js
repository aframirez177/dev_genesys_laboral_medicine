/**
 * ControlesManager.js
 * Manages the "Controles" step where users define control measures for each GES
 * following the GTC-45 hierarchy of controls and ges-config.js structure.
 *
 * Hierarchy (most to least effective) según ges-config.js:
 * 1. Eliminación - Eliminate the hazard/risk
 * 2. Sustitución - Substitute with less hazardous alternative
 * 3. Controles de ingeniería - Engineering controls
 * 4. Controles administrativos - Administrative controls
 *
 * Nota: Señalización forma parte de Controles de Ingeniería
 * Nota: EPP se maneja en campo separado (eppSugeridos)
 */

export class ControlesManager {
  constructor(container, state) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.state = state;
    this.currentGesIndex = 0;
    this.currentCargoIndex = 0;

    if (!this.container) {
      console.error('[ControlesManager] Container not found');
    }
  }

  /**
   * Main render method
   */
  render() {
    if (!this.container) return;

    const cargos = this.state.getCargos();
    if (!cargos || cargos.length === 0) {
      this.renderEmptyState();
      return;
    }

    const cargoActual = cargos[this.currentCargoIndex];
    if (!cargoActual || !cargoActual.ges || cargoActual.ges.length === 0) {
      this.renderNoRiesgos(cargoActual);
      return;
    }

    const gesActual = cargoActual.ges[this.currentGesIndex];
    if (!gesActual) {
      console.warn('[ControlesManager] No GES found at current index');
      return;
    }

    this.container.innerHTML = this.getHTML(cargos, cargoActual, gesActual);
    this.attachEventListeners();
  }

  /**
   * Generate HTML for the controles form
   */
  getHTML(cargos, cargoActual, gesActual) {
    const totalGES = cargoActual.ges.length;
    const progreso = Math.round(((this.currentGesIndex + 1) / totalGES) * 100);

    return `
      <div class="controles-form">
        <!-- Cargo Tabs -->
        ${cargos.length > 1 ? this.renderCargoTabs(cargos) : ''}

        <!-- Header -->
        <div class="controles-header">
          <div class="controles-header__info">
            <h2 class="controles-header__title">Controles de Riesgo</h2>
            <p class="controles-header__subtitle">
              Define las medidas de control para: <strong>${gesActual.nombre || 'Riesgo sin nombre'}</strong>
            </p>
            <p class="controles-header__cargo">
              Cargo: <strong>${cargoActual.nombre}</strong>
            </p>
          </div>
          <div class="controles-header__progress">
            <div class="progress-circle">
              <svg
                viewBox="0 0 36 36"
                class="circular-chart"
                role="img"
                aria-label="Progreso de GES: ${this.currentGesIndex + 1} de ${totalGES}"
              >
                <path class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle"
                  stroke-dasharray="${progreso}, 100"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="progress-text" aria-hidden="true">
                <span class="progress-number">${this.currentGesIndex + 1}</span>
                <span class="progress-total">/${totalGES}</span>
              </div>
            </div>
            <p class="progress-label">GES configurados</p>
          </div>
        </div>

        <!-- Controles Existentes (GTC-45) -->
        <div class="controles-existentes-section">
          <div class="section-header">
            <div class="section-header__left">
              <i class="fas fa-shield-alt"></i>
              <h3 class="section-title">Controles Existentes</h3>
            </div>
            <p class="section-description">
              Indique los controles que la empresa <strong>YA tiene implementados</strong> para este riesgo según GTC-45
            </p>
          </div>

          ${this.renderControlesExistentesFields(gesActual)}
        </div>

        <!-- Medidas de Intervención (Sugerencias BD) -->
        <div class="medidas-intervencion-section">
          <div class="section-header">
            <div class="section-header__left">
              <i class="fas fa-lightbulb"></i>
              <h3 class="section-title">Medidas de Intervención Sugeridas</h3>
            </div>
            <button
              class="wizard-btn-tertiary"
              id="btn-cargar-sugerencias"
              title="Cargar sugerencias desde la base de datos"
              aria-label="Cargar sugerencias de medidas de intervención desde el catálogo">
              <i class="fas fa-magic"></i>
              Cargar Sugerencias desde BD
            </button>
          </div>
          <p class="section-description">
            Estas son las medidas que la empresa <strong>DEBERÍA implementar</strong> según la jerarquía de controles
          </p>

          <div class="controles-hierarchy">
            ${this.renderControlField(1, 'eliminacion', 'Eliminación', 'fa-times-circle', 'Eliminar completamente la fuente del riesgo. Ejemplo: Eliminar proceso ruidoso, automatizar tarea peligrosa, realizar trabajos a nivel del suelo.', gesActual)}

            ${this.renderControlField(2, 'sustitucion', 'Sustitución', 'fa-exchange-alt', 'Reemplazar por algo menos peligroso. Ejemplo: Sustituir químico tóxico por alternativa más segura, usar plataformas elevadoras en lugar de andamios.', gesActual)}

            ${this.renderControlField(3, 'controlesIngenieria', 'Controles de Ingeniería', 'fa-cogs', 'Modificaciones físicas, señalización y diseño. Ejemplo: Cabinas insonorizadas, ventilación, guardas en maquinaria, señalización de seguridad, barandas.', gesActual)}

            ${this.renderControlField(4, 'controlesAdministrativos', 'Controles Administrativos', 'fa-clipboard-list', 'Procedimientos, permisos y capacitación. Ejemplo: Rotación de personal, pausas activas, permisos de trabajo, capacitaciones en SST, inspecciones periódicas.', gesActual)}
          </div>
        </div>

        <!-- Hint -->
        <div class="wizard-hint info" style="margin-top: 2rem;">
          <i class="fas fa-lightbulb"></i>
          Los campos de control son opcionales. Puedes dejarlos vacíos si no aplican para este riesgo específico.
        </div>

        <!-- Navigation -->
        <div class="controles-navigation">
          ${this.renderNavigationButtons(totalGES)}
        </div>
      </div>
    `;
  }

  /**
   * Render cargo tabs (if multiple cargos)
   */
  renderCargoTabs(cargos) {
    return `
      <div class="wizard-tabs">
        ${cargos.map((cargo, index) => `
          <button
            class="wizard-tab ${index === this.currentCargoIndex ? 'active' : ''}"
            data-cargo-index="${index}"
          >
            <i class="fas fa-user-tie"></i>
            ${cargo.nombre}
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render controles existentes fields (GTC-45: fuente, medio, individuo)
   */
  renderControlesExistentesFields(gesActual) {
    const cargos = this.state.getCargos();
    const cargoActual = cargos[this.currentCargoIndex];
    const controles = gesActual.controles || {};

    return `
      <div class="controles-existentes-grid">
        ${this.renderControlExistenteField('fuente', 'Control en la Fuente', 'fa-exclamation-triangle', 'Ejemplo: Encerramiento del proceso ruidoso, guardas en maquinaria, aislamiento de cables eléctricos', controles.fuente || '')}

        ${this.renderControlExistenteField('medio', 'Control en el Medio', 'fa-wind', 'Ejemplo: Ventilación general, extractores localizados, señalización de seguridad, barandas', controles.medio || '')}

        ${this.renderControlExistenteField('individuo', 'Control en el Individuo', 'fa-user-shield', 'Ejemplo: Capacitación, EPP entregados, exámenes médicos periódicos, pausas activas', controles.individuo || '')}
      </div>
    `;
  }

  /**
   * Render a single control existente field
   */
  renderControlExistenteField(key, title, icon, placeholder, value) {
    const charCount = value.length;
    const fieldId = `control-existente-${key}-${this.currentCargoIndex}-${this.currentGesIndex}`;
    const charCountId = `${fieldId}-char-count`;

    return `
      <div class="control-existente-group">
        <div class="control-existente-header">
          <i class="fas ${icon}"></i>
          <label for="${fieldId}" class="control-existente-title">${title}</label>
        </div>
        <div class="control-existente-body">
          <textarea
            id="${fieldId}"
            class="control-existente-textarea ${value ? 'filled' : ''}"
            data-control-existente="${key}"
            placeholder="${placeholder}"
            maxlength="500"
            rows="3"
            aria-label="${title}: ${placeholder}"
            aria-describedby="${charCountId}"
          >${value}</textarea>
          <span class="control-char-count" id="${charCountId}" aria-live="polite" aria-atomic="true">
            <span class="char-current">${charCount}</span> / 500
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Render a single control field (medidas de intervención)
   */
  renderControlField(level, key, title, icon, placeholder, gesActual) {
    // Get controles from GES using current indices
    const cargos = this.state.getCargos();
    const cargoActual = cargos[this.currentCargoIndex];
    const controles = gesActual.controles || {};
    const value = controles[key] || '';
    const charCount = value.length;

    // Generate unique ID for label-input association (WCAG 2.1 AA)
    const fieldId = `control-${key}-${this.currentCargoIndex}-${this.currentGesIndex}`;
    const charCountId = `${fieldId}-char-count`;

    return `
      <div class="control-group" data-level="${level}">
        <div class="control-header">
          <div class="control-header__left">
            <span class="control-number" aria-hidden="true">${level}</span>
            <i class="fas ${icon} control-icon" aria-hidden="true"></i>
            <label for="${fieldId}" class="control-title">${title}</label>
          </div>
          <span class="control-char-count" id="${charCountId}" aria-live="polite" aria-atomic="true">
            <span class="char-current">${charCount}</span> / 500 caracteres
          </span>
        </div>
        <div class="control-body">
          <textarea
            id="${fieldId}"
            class="control-textarea ${value ? 'filled' : ''}"
            data-control-type="${key}"
            placeholder="${placeholder}"
            maxlength="500"
            rows="3"
            aria-label="${title}: ${placeholder}"
            aria-describedby="${charCountId}"
          >${value}</textarea>
        </div>
      </div>
    `;
  }

  /**
   * Render navigation buttons
   */
  renderNavigationButtons(totalGES) {
    const isFirstGes = this.currentGesIndex === 0;
    const isLastGes = this.currentGesIndex === totalGES - 1;

    return `
      <!-- Navegación tradicional -->
      <button
        class="btn-wizard btn-wizard--secondary"
        id="btn-ges-anterior"
        ${isFirstGes ? 'disabled' : ''}
      >
        <i class="fas fa-arrow-left"></i>
        GES Anterior
      </button>

      <div class="controles-navigation__center">
        ${!isLastGes ? `
          <button class="btn-wizard btn-wizard--primary" id="btn-ges-siguiente">
            Siguiente GES
            <i class="fas fa-arrow-right"></i>
          </button>
        ` : `
          <button class="btn-wizard btn-wizard--success" id="btn-finalizar-controles">
            Finalizar Controles
            <i class="fas fa-check"></i>
          </button>
        `}
      </div>

      <button class="btn-wizard btn-wizard--tertiary" id="btn-saltar-ges">
        Saltar
        <i class="fas fa-step-forward"></i>
      </button>

      <!-- FAB Navigation (solo si hay más de 1 GES) -->
      ${totalGES > 1 ? `
        <div class="wizard-fab-nav">
          ${!isFirstGes ? `
            <button
              class="wizard-fab wizard-fab--secondary"
              id="fab-ges-anterior"
              data-tooltip="GES Anterior"
              aria-label="Ir al GES anterior"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
          ` : ''}

          ${!isLastGes ? `
            <button
              class="wizard-fab"
              id="fab-ges-siguiente"
              data-tooltip="Siguiente GES"
              aria-label="Ir al siguiente GES"
            >
              <i class="fas fa-chevron-right"></i>
              <span class="wizard-fab__badge">${this.currentGesIndex + 2}</span>
            </button>
          ` : ''}
        </div>
      ` : ''}
    `;
  }

  /**
   * Render empty state (no cargos)
   */
  renderEmptyState() {
    this.container.innerHTML = `
      <div class="wizard-empty-state">
        <i class="fas fa-briefcase"></i>
        <h3>No hay cargos creados</h3>
        <p>Necesitas crear al menos un cargo para definir controles de riesgo.</p>
        <button class="btn-wizard btn-wizard--primary" onclick="window.history.back()">
          <i class="fas fa-arrow-left"></i>
          Volver
        </button>
      </div>
    `;
  }

  /**
   * Render state when cargo has no selected GES
   */
  renderNoRiesgos(cargo) {
    this.container.innerHTML = `
      <div class="wizard-empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Sin riesgos seleccionados</h3>
        <p>El cargo <strong>${cargo.nombre}</strong> no tiene riesgos (GES) seleccionados.</p>
        <button class="btn-wizard btn-wizard--primary" onclick="window.history.back()">
          <i class="fas fa-arrow-left"></i>
          Volver a seleccionar riesgos
        </button>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.container) return;

    // Cargo tabs
    const cargoTabs = this.container.querySelectorAll('[data-cargo-index]');
    cargoTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const newIndex = parseInt(e.currentTarget.dataset.cargoIndex, 10);
        if (newIndex !== this.currentCargoIndex) {
          this.saveCurrentControles(); // Save before switching
          this.switchCargo(newIndex);
        }
      });
    });

    // Textarea auto-save on blur - Controles Existentes
    const textareasExistentes = this.container.querySelectorAll('.control-existente-textarea');
    textareasExistentes.forEach(textarea => {
      // Update character count on input
      textarea.addEventListener('input', (e) => {
        this.updateCharCountExistente(e.target);
      });

      // Auto-save on blur
      textarea.addEventListener('blur', () => {
        this.saveCurrentControles();
      });
    });

    // Textarea auto-save on blur - Medidas de Intervención
    const textareas = this.container.querySelectorAll('.control-textarea');
    textareas.forEach(textarea => {
      // Update character count on input
      textarea.addEventListener('input', (e) => {
        this.updateCharCount(e.target);
      });

      // Auto-save on blur
      textarea.addEventListener('blur', () => {
        this.saveCurrentControles();
      });
    });

    // Botón Cargar Sugerencias
    const btnSugerencias = this.container.querySelector('#btn-cargar-sugerencias');
    if (btnSugerencias) {
      btnSugerencias.addEventListener('click', () => {
        this.handleLoadSugerencias();
      });
    }

    // Navigation buttons (tradicionales)
    const btnAnterior = this.container.querySelector('#btn-ges-anterior');
    const btnSiguiente = this.container.querySelector('#btn-ges-siguiente');
    const btnFinalizar = this.container.querySelector('#btn-finalizar-controles');
    const btnSaltar = this.container.querySelector('#btn-saltar-ges');

    if (btnAnterior) {
      btnAnterior.addEventListener('click', () => {
        this.saveCurrentControles();
        this.navegarGesAnterior();
      });
    }

    if (btnSiguiente) {
      btnSiguiente.addEventListener('click', () => {
        this.saveCurrentControles();
        this.navegarGesSiguiente();
      });
    }

    if (btnFinalizar) {
      btnFinalizar.addEventListener('click', () => {
        this.saveCurrentControles();
        this.finalizarControles();
      });
    }

    if (btnSaltar) {
      btnSaltar.addEventListener('click', () => {
        this.saveCurrentControles();
        this.saltarGes();
      });
    }

    // FAB Navigation buttons
    const fabAnterior = this.container.querySelector('#fab-ges-anterior');
    const fabSiguiente = this.container.querySelector('#fab-ges-siguiente');

    if (fabAnterior) {
      fabAnterior.addEventListener('click', () => {
        this.saveCurrentControles();
        this.navegarGesAnterior();
      });
    }

    if (fabSiguiente) {
      fabSiguiente.addEventListener('click', () => {
        this.saveCurrentControles();
        this.navegarGesSiguiente();
      });
    }
  }

  /**
   * Update character count display for controles existentes
   */
  updateCharCountExistente(textarea) {
    const controlGroup = textarea.closest('.control-existente-group');
    if (!controlGroup) return;

    const currentLength = textarea.value.length;
    const charCountEl = controlGroup.querySelector('.char-current');
    const charCountContainer = controlGroup.querySelector('.control-char-count');

    if (charCountEl) {
      charCountEl.textContent = currentLength;
    }

    // Update textarea "filled" class
    if (currentLength > 0) {
      textarea.classList.add('filled');
    } else {
      textarea.classList.remove('filled');
    }

    // Update character count styling based on thresholds
    if (charCountContainer) {
      // Remove all warning classes
      charCountContainer.classList.remove('warning', 'danger');

      // Warning: 400-489 characters (80-98%)
      if (currentLength >= 400 && currentLength < 490) {
        charCountContainer.classList.add('warning');
      }
      // Danger: 490-500 characters (98-100%)
      else if (currentLength >= 490) {
        charCountContainer.classList.add('danger');
      }
    }
  }

  /**
   * Update character count display for medidas de intervención
   */
  updateCharCount(textarea) {
    const controlGroup = textarea.closest('.control-group');
    if (!controlGroup) return;

    const currentLength = textarea.value.length;
    const maxLength = 500;
    const charCountEl = controlGroup.querySelector('.char-current');
    const charCountContainer = controlGroup.querySelector('.control-char-count');

    if (charCountEl) {
      charCountEl.textContent = currentLength;
    }

    // Update textarea "filled" class
    if (currentLength > 0) {
      textarea.classList.add('filled');
    } else {
      textarea.classList.remove('filled');
    }

    // Update character count styling based on thresholds
    if (charCountContainer) {
      // Remove all warning classes
      charCountContainer.classList.remove('warning', 'danger');

      // Warning: 400-489 characters (80-98%)
      if (currentLength >= 400 && currentLength < 490) {
        charCountContainer.classList.add('warning');
      }
      // Danger: 490-500 characters (98-100%)
      else if (currentLength >= 490) {
        charCountContainer.classList.add('danger');
      }
    }
  }

  /**
   * Save current controles to state
   * Guarda tanto controles existentes (fuente/medio/individuo) como medidas de intervención
   */
  saveCurrentControles() {
    if (!this.container) return;

    const cargos = this.state.getCargos();
    const cargoActual = cargos[this.currentCargoIndex];
    if (!cargoActual) return;

    const gesActual = cargoActual.ges[this.currentGesIndex];
    if (!gesActual) return;

    const controles = {};

    // 1. Guardar CONTROLES EXISTENTES (fuente, medio, individuo) - GTC-45
    const textareasExistentes = this.container.querySelectorAll('.control-existente-textarea');
    textareasExistentes.forEach(textarea => {
      const controlKey = textarea.dataset.controlExistente; // fuente, medio, individuo
      controles[controlKey] = textarea.value.trim();
    });

    // 2. Guardar MEDIDAS DE INTERVENCIÓN (eliminacion, sustitucion, etc.) - jerarquía de controles
    const textareasMedidas = this.container.querySelectorAll('.control-textarea');
    textareasMedidas.forEach(textarea => {
      const controlType = textarea.dataset.controlType;
      controles[controlType] = textarea.value.trim();
    });

    console.log('[ControlesManager] Saving controles:', {
      cargoIndex: this.currentCargoIndex,
      gesIndex: this.currentGesIndex,
      controles
    });

    // Use updateGESControles with indices (same pattern as NivelesRiesgoForm)
    this.state.updateGESControles(this.currentCargoIndex, this.currentGesIndex, controles);
  }

  /**
   * Switch to different cargo
   */
  switchCargo(newCargoIndex) {
    const cargos = this.state.getCargos();
    if (newCargoIndex < 0 || newCargoIndex >= cargos.length) return;

    this.currentCargoIndex = newCargoIndex;
    this.currentGesIndex = 0; // Reset to first GES of new cargo
    this.render();

    console.log(`[ControlesManager] Switched to cargo ${newCargoIndex}`);
  }

  /**
   * Navigate to previous GES
   */
  navegarGesAnterior() {
    if (this.currentGesIndex > 0) {
      // Add exit animation
      const hierarchy = this.container.querySelector('.controles-hierarchy');
      if (hierarchy) {
        hierarchy.classList.add('ges-transition-exit');
      }

      // Wait for animation, then render
      setTimeout(() => {
        this.currentGesIndex--;
        this.render();
        this.scrollToTop();

        // Add enter animation
        const newHierarchy = this.container.querySelector('.controles-hierarchy');
        if (newHierarchy) {
          newHierarchy.classList.add('ges-transition-enter');
        }
      }, 300);
    }
  }

  /**
   * Navigate to next GES
   */
  navegarGesSiguiente() {
    const cargos = this.state.getCargos();
    const cargoActual = cargos[this.currentCargoIndex];
    const totalGES = cargoActual.ges.length;

    if (this.currentGesIndex < totalGES - 1) {
      // Add exit animation
      const hierarchy = this.container.querySelector('.controles-hierarchy');
      if (hierarchy) {
        hierarchy.classList.add('ges-transition-exit');
      }

      // Wait for animation, then render
      setTimeout(() => {
        this.currentGesIndex++;
        this.render();
        this.scrollToTop();

        // Add enter animation
        const newHierarchy = this.container.querySelector('.controles-hierarchy');
        if (newHierarchy) {
          newHierarchy.classList.add('ges-transition-enter');
        }
      }, 300);
    }
  }

  /**
   * Skip current GES (same as next)
   */
  saltarGes() {
    this.navegarGesSiguiente();
  }

  /**
   * Finalize controles and move to next step
   */
  finalizarControles() {
    console.log('[ControlesManager] Finalizando controles...');

    // Dispatch custom event to notify WizardCore
    const event = new CustomEvent('controles:completed', {
      bubbles: true,
      detail: {
        cargoIndex: this.currentCargoIndex,
        gesIndex: this.currentGesIndex
      }
    });

    this.container.dispatchEvent(event);
  }

  /**
   * Scroll to top of container
   */
  scrollToTop() {
    if (this.container) {
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Get completion statistics
   */
  getCompletionStats() {
    const cargos = this.state.getCargos();
    let totalGES = 0;
    let gesWithControles = 0;

    cargos.forEach(cargo => {
      if (!cargo.ges) return;

      cargo.ges.forEach(ges => {
        totalGES++;

        // Get controles directly from GES object
        const controles = ges.controles || {};

        // Consider GES as "with controls" if at least one control field is filled
        const hasAnyControl = Object.values(controles).some(value => value && value.trim().length > 0);
        if (hasAnyControl) {
          gesWithControles++;
        }
      });
    });

    return {
      totalGES,
      gesWithControles,
      percentage: totalGES > 0 ? Math.round((gesWithControles / totalGES) * 100) : 0
    };
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = 4000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Icon mapping
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    toast.innerHTML = `
      <i class="${icons[type] || icons.info}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Cerrar notificación">
        <i class="fas fa-times"></i>
      </button>
    `;

    document.body.appendChild(toast);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    });

    // Auto-remove after duration
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  /**
   * Handle load sugerencias from database
   */
  async handleLoadSugerencias() {
    const btn = this.container.querySelector('#btn-cargar-sugerencias');
    if (!btn) return;

    try {
      const cargos = this.state.getCargos();
      const cargoActual = cargos[this.currentCargoIndex];
      if (!cargoActual) return;

      const gesActual = cargoActual.ges[this.currentGesIndex];
      if (!gesActual) return;

      const gesNombre = gesActual.nombre;
      console.log(`[ControlesManager] Cargando sugerencias para: ${gesNombre}`);

      // Set loading state
      btn.disabled = true;
      btn.classList.add('wizard-btn-loading');
      btn.setAttribute('aria-busy', 'true');
      const originalText = btn.innerHTML;

      // Buscar GES en catálogo de base de datos por nombre exacto
      const searchResponse = await fetch(`/api/catalogo/ges?search=${encodeURIComponent(gesNombre)}&limit=5`);
      const searchData = await searchResponse.json();

      if (!searchData.success || !searchData.data || searchData.data.length === 0) {
        this.showToast(`No se encontraron sugerencias predefinidas para "${gesNombre}". Puedes ingresarlas manualmente.`, 'warning', 6000);
        btn.disabled = false;
        btn.classList.remove('wizard-btn-loading');
        btn.setAttribute('aria-busy', 'false');
        btn.innerHTML = originalText;
        return;
      }

      // Buscar coincidencia exacta (case-insensitive)
      const gesMatch = searchData.data.find(g =>
        g.nombre.toLowerCase().trim() === gesNombre.toLowerCase().trim()
      );

      if (!gesMatch) {
        this.showToast(`No se encontró coincidencia exacta para "${gesNombre}"`, 'warning', 6000);
        btn.disabled = false;
        btn.classList.remove('wizard-btn-loading');
        btn.setAttribute('aria-busy', 'false');
        btn.innerHTML = originalText;
        return;
      }

      // Obtener detalles completos del GES por ID
      const detailResponse = await fetch(`/api/catalogo/ges/${gesMatch.id}`);
      const detailData = await detailResponse.json();

      if (!detailData.success || !detailData.data) {
        this.showToast(`No se pudieron cargar los detalles para "${gesNombre}"`, 'error');
        btn.disabled = false;
        btn.classList.remove('wizard-btn-loading');
        btn.setAttribute('aria-busy', 'false');
        btn.innerHTML = originalText;
        return;
      }

      const gesData = detailData.data;
      const medidasIntervencion = gesData.medidas_intervencion;

      if (!medidasIntervencion) {
        this.showToast(`El GES "${gesNombre}" no tiene medidas de intervención predefinidas`, 'warning');
        btn.disabled = false;
        btn.classList.remove('wizard-btn-loading');
        btn.setAttribute('aria-busy', 'false');
        btn.innerHTML = originalText;
        return;
      }

      // Actualizar los textareas con las sugerencias
      const textareas = this.container.querySelectorAll('.control-textarea');
      let fieldsUpdated = 0;

      textareas.forEach(textarea => {
        const controlType = textarea.dataset.controlType;
        let value = '';

        switch (controlType) {
          case 'eliminacion':
            value = medidasIntervencion.eliminacion || '';
            break;
          case 'sustitucion':
            value = medidasIntervencion.sustitucion || '';
            break;
          case 'controlesIngenieria':
            value = medidasIntervencion.controles_ingenieria || '';
            break;
          case 'controlesAdministrativos':
            value = medidasIntervencion.controles_administrativos || '';
            break;
        }

        if (value) {
          // Animate field update
          const controlGroup = textarea.closest('.control-group');

          textarea.value = value;
          textarea.classList.add('filled');
          this.updateCharCount(textarea);

          // Highlight animation
          if (controlGroup) {
            controlGroup.style.animation = 'none';
            setTimeout(() => {
              controlGroup.style.animation = 'fieldHighlight 0.6s ease-out';
            }, 10);
          }

          fieldsUpdated++;
        }
      });

      // Guardar los controles actualizados
      this.saveCurrentControles();

      // Remove loading state
      btn.disabled = false;
      btn.classList.remove('wizard-btn-loading');
      btn.setAttribute('aria-busy', 'false');
      btn.innerHTML = originalText;

      // Show success toast
      if (fieldsUpdated > 0) {
        this.showToast(`✓ Se cargaron ${fieldsUpdated} medidas de intervención exitosamente`, 'success');
      } else {
        this.showToast('No se encontraron medidas predefinidas para este GES', 'info');
      }

      console.log('[ControlesManager] Sugerencias cargadas desde BD');
    } catch (error) {
      console.error('[ControlesManager] Error al cargar sugerencias:', error);

      // Remove loading state
      const btn = this.container.querySelector('#btn-cargar-sugerencias');
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('wizard-btn-loading');
        btn.setAttribute('aria-busy', 'false');
      }

      this.showToast('Error al cargar sugerencias. Por favor, intenta nuevamente.', 'error');
    }
  }

  /**
   * Destroy component and clean up
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
