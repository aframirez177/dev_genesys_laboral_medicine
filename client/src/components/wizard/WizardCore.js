/**
 * WizardCore.js - Componente Orquestador Principal del Wizard
 *
 * Responsabilidades:
 * - Renderizar los pasos del wizard según el estado actual
 * - Manejar navegación entre pasos
 * - Integrar con WizardState para gestión de estado
 * - Coordinar los componentes especializados (RiesgoSelector, NivelesForm, etc.)
 * - Validar y enviar datos al backend
 */

import { getWizardState } from '../../state/WizardState.js';
import { RiesgoSelector } from './RiesgoSelector.js';
import { NivelesRiesgoForm } from './NivelesRiesgoForm.js';
import { ControlesManager } from './ControlesManager.js';
import { CargoEditor } from './CargoEditor.js';
import { createConfirmModal } from '../../js/utils/wizardModal.js';
import { computePosition, offset, shift } from '@floating-ui/dom';
import { initKeyboardTooltips, destroyKeyboardTooltips } from '../../js/utils/KeyboardTooltip.js'; // 🆕 H1
import { createTooltip } from '../../js/utils/floatingUI.js'; // 🆕 P1-1: Tooltips para cargo tabs

export class WizardCore {
  constructor(containerSelector, wizardState = null) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error(`Container not found: ${containerSelector}`);
    }

    this.state = wizardState || getWizardState();
    this.unsubscribe = null;
    this.currentStepComponent = null;
    this.riesgoSelectors = {}; // Store RiesgoSelector instances by cargo index
    this.nivelesForm = null; // Store NivelesRiesgoForm instance
    this.controlesManager = null; // Store ControlesManager instance
    this.cargoEditor = new CargoEditor(this.state); // Cargo editor with Floating UI
    this.previousStep = null; // Track previous step to avoid unnecessary re-renders
    this.carouselIndex = 0; // Current cargo in carousel
    this.fabCleanup = null; // Cleanup function for FAB Floating UI positioning
    this.keyboardHandler = null; // Keyboard shortcuts handler
    this.keyboardTooltips = null; // 🆕 H1: Floating UI tooltips instances

    // Steps that manage their own rendering (shouldn't be re-rendered on state changes)
    // info-basica: Event listeners handle input, no need to re-render while typing
    // cargos: Uses updateCargoCards() for surgical updates, avoids re-rendering during popover edits
    // riesgos: RiesgoSelector component manages its own DOM
    // niveles: NivelesRiesgoForm uses lit-html (ahora incluye controles existentes integrados)
    this.selfManagedSteps = new Set(['info-basica', 'cargos', 'riesgos', 'niveles']);

    // Step definitions
    this.steps = [
      {
        id: 'info-basica',
        title: 'Información Básica',
        description: 'Comencemos con los datos de tu empresa',
        icon: 'fas fa-building',
        component: this.renderInfoBasica.bind(this)
      },
      {
        id: 'cargos',
        title: 'Cargos',
        description: 'Agrega los puestos de trabajo de tu empresa',
        icon: 'fas fa-users',
        component: this.renderCargos.bind(this)
      },
      {
        id: 'riesgos',
        title: 'Riesgos por Cargo',
        description: 'Selecciona los riesgos (GES) para cada cargo',
        icon: 'fas fa-exclamation-triangle',
        component: this.renderRiesgos.bind(this)
      },
      {
        id: 'niveles',
        title: 'Niveles y Controles',
        description: 'Configura niveles de riesgo (ND, NE, NC) y controles existentes',
        icon: 'fas fa-chart-bar',
        component: this.renderNiveles.bind(this)
      },
      // ❌ PASO ELIMINADO: Controles ahora están integrados en el paso de Niveles
      // {
      //   id: 'controles',
      //   title: 'Controles',
      //   description: 'Agrega controles de seguridad (opcional)',
      //   icon: 'fas fa-shield-alt',
      //   component: this.renderControles.bind(this)
      // },
      {
        id: 'resumen',
        title: 'Resumen y Envío',
        description: 'Revisa y genera tus documentos',
        icon: 'fas fa-check-circle',
        component: this.renderResumen.bind(this)
      }
    ];

    console.log('[WizardCore] Initialized with', this.steps.length, 'steps');
  }

  /**
   * Initialize wizard
   */
  init() {
    console.log('[WizardCore] Starting initialization...');

    // Subscribe to state changes with intelligent re-rendering
    this.unsubscribe = this.state.subscribe((newState) => {
      const currentStep = newState.currentStep;

      // Always re-render if step changed
      if (currentStep !== this.previousStep) {
        console.log('[WizardCore] Step changed:', this.previousStep, '->', currentStep);
        
        // ✅ Sprint 6: Limpiar cache de niveles al salir del paso
        if (this.previousStep === 'niveles' && currentStep !== 'niveles') {
          console.log('[WizardCore] Saliendo de niveles, limpiando cache');
          this.cleanupNivelesFormCache();
        }
        
        this.previousStep = currentStep;
        this.render();
        return;
      }

      // For self-managed steps (niveles, riesgos, controles):
      // Skip re-render - they manage their own DOM with lit-html/components
      // BUT still update context bar to reflect state changes
      if (this.selfManagedSteps.has(currentStep)) {
        console.log('[WizardCore] State updated for self-managed step, updating context bar only');
        this.updateContextBar();
        return;
      }

      // For template steps (info-basica, cargos, resumen):
      // Re-render to reflect state changes (e.g., new cargo added)
      console.log('[WizardCore] State updated for template step, re-rendering');
      this.render();
    });

    // Setup keyboard shortcuts
    this.keyboardHandler = this.handleKeyboardShortcuts.bind(this);
    document.addEventListener('keydown', this.keyboardHandler);

    // Initial render
    this.previousStep = this.state.getCurrentStep();
    this.render();

    console.log('[WizardCore] Initialization complete');
  }

  /**
   * Destroy wizard and cleanup
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
    // 🆕 H1: Cleanup keyboard tooltips
    if (this.keyboardTooltips) {
      destroyKeyboardTooltips(this.keyboardTooltips);
      this.keyboardTooltips = null;
    }
    // ✅ Sprint 6: Cleanup niveles form cache
    this.cleanupNivelesFormCache();
    console.log('[WizardCore] Destroyed');
  }

  /**
   * ✅ Sprint 6: Limpiar cache de NivelesRiesgoForm
   */
  cleanupNivelesFormCache() {
    if (this.nivelesFormCache) {
      Object.values(this.nivelesFormCache).forEach(form => {
        if (form && typeof form.destroy === 'function') {
          form.destroy();
        }
      });
      this.nivelesFormCache = {};
    }
    this.nivelesForm = null;
  }

  /**
   * Handle keyboard shortcuts for wizard navigation
   * - Enter: Next step
   * - Shift+Enter: Previous step
   * - Escape: Already handled by modal handlers
   */
  handleKeyboardShortcuts(e) {
    // Ignore if user is typing in an input field
    const activeElement = document.activeElement;
    const isEditingText = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.isContentEditable
    );

    if (isEditingText) {
      return; // Don't interfere with text input
    }

    // Ignore if a modal is open (modals have their own Escape handler)
    const hasOpenModal = document.querySelector('.wizard-modal');
    if (hasOpenModal) {
      return; // Let modal handlers take precedence
    }

    const currentStep = this.state.getCurrentStep();

    // Enter: Go to next step
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('[WizardCore] Keyboard shortcut: Enter → Next');
      this.handleNext(currentStep);
      return;
    }

    // Shift+Enter: Go to previous step
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      console.log('[WizardCore] Keyboard shortcut: Shift+Enter → Previous');
      this.handleBack();
      return;
    }
  }

  /**
   * Force a re-render (useful for in-step updates like adding/removing cargos)
   */
  forceRender() {
    console.log('[WizardCore] Forcing re-render');
    this.render();
  }

  /**
   * Main render method
   */
  render() {
    const currentStep = this.state.getCurrentStep();
    const stepDef = this.steps.find(s => s.id === currentStep);

    if (!stepDef) {
      console.error('[WizardCore] Unknown step:', currentStep);
      this.container.innerHTML = this.renderError('Paso desconocido');
      return;
    }

    console.log('[WizardCore] Rendering step:', currentStep);

    // Clear container
    this.container.innerHTML = '';

    // Create wizard wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'wizard-wrapper';

    // 🎨 H4: Create header container con 3 niveles jerárquicos
    const headerContainer = document.createElement('div');
    headerContainer.className = 'wizard-header';

    // Nivel 1: Branding (Logo + Título)
    const brandingHeader = this.renderBrandingHeader();
    headerContainer.appendChild(brandingHeader);

    // 🆕 TASK 5: Unified Progress Bar (Progress + Steps + Context in one line)
    const unifiedProgressBar = this.renderUnifiedProgressBar(currentStep);
    headerContainer.appendChild(unifiedProgressBar);

    wrapper.appendChild(headerContainer);

    // 🆕 TASK 4: Comic Bubble Flotante (posición fixed)
    const comicBubble = this.renderComicBubble();
    wrapper.appendChild(comicBubble);

    // Render current step
    const stepContainer = document.createElement('div');
    stepContainer.className = 'wizard-content';
    stepContainer.innerHTML = stepDef.component();
    wrapper.appendChild(stepContainer);

    // Render navigation buttons
    const navigation = this.renderNavigation(currentStep);
    wrapper.appendChild(navigation);

    this.container.appendChild(wrapper);

    // Attach event listeners after render
    this.attachEventListeners(currentStep);
  }

  /**
   * Calculate estimated time remaining
   */
  calculateRemainingTime(currentIndex) {
    // Tiempo estimado por paso (en minutos)
    const timePerStep = {
      'info-basica': 3,
      'cargos': 5,
      'riesgos': 8,
      'niveles': 6,
      'controles': 4,
      'resumen': 2
    };

    // Calcular tiempo restante sumando pasos futuros
    let remainingTime = 0;
    for (let i = currentIndex + 1; i < this.steps.length; i++) {
      const stepId = this.steps[i].id;
      remainingTime += timePerStep[stepId] || 3;
    }

    return remainingTime;
  }

  /**
   * 🎨 H4: Render branding header (Nivel 1)
   * Logo + Título del wizard + Botón Importar JSON
   */
  renderBrandingHeader() {
    const brandingHeader = document.createElement('div');
    brandingHeader.className = 'wizard-branding-header';
    brandingHeader.innerHTML = `
      <div class="wizard-branding-content">
        <div class="wizard-logo">
          <a href="../index.html" aria-label="Volver al inicio">
            <img src="../assets/images/logo_negro_vectores.svg"
                 alt="Genesys Medicina Laboral"
                 loading="eager">
          </a>
        </div>
        <div class="wizard-title-group">
          <h1 class="wizard-title">
            <i class="fas fa-clipboard-list"></i>
            Asistente de Matriz de Riesgos
          </h1>
          <p class="wizard-subtitle">
            Genera tu matriz profesional en 6 pasos sencillos
          </p>
        </div>
      </div>
      <div class="wizard-header-actions">
        <button id="btn-import-json" class="wizard-import-btn" type="button" title="Importar datos desde JSON">
          <i class="fas fa-file-import"></i>
          <span>Importar JSON</span>
        </button>
      </div>
    `;
    return brandingHeader;
  }

  /**
   * 🆕 TASK 5: Unified Progress Bar - Progress + Steps + Context in ONE line
   * Layout: [← Volver] [Steps Dots] [Context Info]
   */
  renderUnifiedProgressBar(currentStep) {
    const currentIndex = this.steps.findIndex(s => s.id === currentStep);
    const progressPercent = ((currentIndex + 1) / this.steps.length) * 100;

    const data = this.state.data.formData;
    const cargos = this.state.data.formData.cargos || [];
    const totalRiesgos = cargos.reduce((sum, cargo) => sum + (cargo.ges?.length || 0), 0);

    const progressBar = document.createElement('div');
    progressBar.className = 'wizard-progress-unified';
    progressBar.id = 'wizard-progress-unified';
    progressBar.innerHTML = `
      <div class="wizard-progress-unified-content">

        <!-- Left: Spacer (botón "Volver" removido - ya hay botones "Anterior") -->
        <div class="progress-left">
          <div class="progress-spacer"></div>
        </div>

        <!-- Center: Step Dots + Progress Bar -->
        <div class="progress-center">
          <div class="wizard-progress-steps">
            ${this.steps.map((step, index) => {
              let className = 'wizard-progress-step';
              if (index < currentIndex) className += ' completed';
              if (index === currentIndex) className += ' active';

              return `
                <div class="${className}"
                     data-step="${step.id}"
                     role="button"
                     tabindex="0"
                     aria-label="${step.title}${index < currentIndex ? ' - Completado' : index === currentIndex ? ' - Paso actual' : ''}"
                     title="${step.title}">
                  <i class="${step.icon}"></i>
                  <span class="step-tooltip">${step.title}</span>
                </div>
              `;
            }).join('')}
          </div>

          <div class="wizard-progress-bar-track">
            <div class="wizard-progress-bar-fill"
                 style="width: ${progressPercent}%"
                 role="progressbar"
                 aria-valuenow="${progressPercent}"
                 aria-valuemin="0"
                 aria-valuemax="100"
                 aria-label="Progreso: ${Math.round(progressPercent)}%">
            </div>
          </div>
        </div>

        <!-- Right: Placeholder (comic bubble ahora es fixed) -->
        <div class="progress-right">
          <!-- Espacio reservado para balance visual -->
        </div>

      </div>
    `;

    return progressBar;
  }

  /**
   * 🆕 TASK 4: Comic Bubble Flotante - Reemplaza el context bar con bocadillo estilo comic
   * Bocadillo fixed esquina superior derecha con cola apuntando hacia abajo
   *
   * ✅ P1 FIX: Surgical DOM updates - solo actualiza valores numéricos sin re-renderizar
   */
  renderComicBubble() {
    const data = this.state.data.formData;
    const cargos = this.state.data.formData.cargos || [];
    const totalRiesgos = cargos.reduce((sum, cargo) => sum + (cargo.ges?.length || 0), 0);
    const totalTrabajadores = cargos.reduce((sum, cargo) => sum + (parseInt(cargo.numPersonas) || 0), 0);

    // Buscar bubble existente en el DOM
    let bubble = document.getElementById('wizard-comic-bubble');

    // Si ya existe, solo actualizar valores (surgical update)
    if (bubble) {
      // Actualizar nombre de empresa si cambió
      const companyNameSpan = bubble.querySelector('.company-name');
      if (companyNameSpan && data.nombreEmpresa) {
        companyNameSpan.textContent = data.nombreEmpresa;
      }

      // Actualizar valores de stats (los 3 números)
      const statValues = bubble.querySelectorAll('.stat-value');
      if (statValues.length >= 3) {
        statValues[0].textContent = cargos.length;           // Cargos
        statValues[1].textContent = totalTrabajadores;       // Trabajadores
        statValues[2].textContent = totalRiesgos;            // Riesgos
      }

      return bubble; // Retornar bubble existente (NO re-render)
    }

    // Si no existe, crear nuevo bubble (primera renderización)
    bubble = document.createElement('div');
    bubble.className = 'wizard-comic-bubble';
    bubble.id = 'wizard-comic-bubble';
    bubble.innerHTML = `
      <div class="comic-bubble-content">
        ${data.nombreEmpresa ? `
          <div class="comic-bubble-company">
            <i class="fas fa-building"></i>
            <span class="company-name">${data.nombreEmpresa}</span>
          </div>
        ` : ''}

        <div class="comic-bubble-stats">
          <div class="stat-item">
            <i class="fas fa-user-tie"></i>
            <div class="stat-content">
              <span class="stat-value">${cargos.length}</span>
              <span class="stat-label">Cargos</span>
            </div>
          </div>

          <div class="stat-item">
            <i class="fas fa-users"></i>
            <div class="stat-content">
              <span class="stat-value">${totalTrabajadores}</span>
              <span class="stat-label">Trabajadores</span>
            </div>
          </div>

          <div class="stat-item">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="stat-content">
              <span class="stat-value">${totalRiesgos}</span>
              <span class="stat-label">Riesgos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cola SVG triángulo simple con punta hacia abajo (sin borde superior) -->
      <svg class="comic-bubble-tail" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <!-- Triángulo relleno -->
        <polygon points="0,0 20,0 10,15" fill="#ffffff"/>
        <!-- Bordes laterales (sin la línea superior) -->
        <line x1="0" y1="0" x2="10" y2="15" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
        <line x1="20" y1="0" x2="10" y2="15" stroke="#e0e0e0" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    return bubble;
  }

  /**
   * 🎨 H4: Render progress bar (Nivel 2 - DEPRECATED - Replaced by renderUnifiedProgressBar)
   * Progress bar with step indicator and time estimate
   */
  renderProgressBar(currentStep) {
    // This method is deprecated but kept for backwards compatibility
    console.warn('[WizardCore] renderProgressBar is deprecated, use renderUnifiedProgressBar');
    return this.renderUnifiedProgressBar(currentStep);
  }

  /**
   * Render context bar with key information
   */
  renderContextBar() {
    const data = this.state.data.formData;
    const cargos = this.state.data.formData.cargos || [];

    // Calcular total de riesgos seleccionados (usar .ges que es el array correcto)
    const totalRiesgos = cargos.reduce((sum, cargo) => {
      return sum + (cargo.ges?.length || 0);
    }, 0);

    const contextBar = document.createElement('div');
    contextBar.className = 'wizard-context-bar';
    contextBar.id = 'wizard-context-bar'; // Add ID for updateContextBar()
    contextBar.innerHTML = `
      <div class="context-bar-content" id="wizard-context-content">
        ${data.nombreEmpresa ? `
          <div class="context-item context-item--empresa">
            <i class="fas fa-building"></i>
            <div class="context-item-info">
              <span class="context-item-label">Empresa</span>
              <span class="context-item-value">${data.nombreEmpresa}</span>
            </div>
          </div>
        ` : ''}

        <div class="context-item context-item--cargos">
          <i class="fas fa-users"></i>
          <div class="context-item-info">
            <span class="context-item-label">Cargos</span>
            <span class="context-item-value">${cargos.length}</span>
          </div>
        </div>

        <div class="context-item context-item--riesgos">
          <i class="fas fa-exclamation-triangle"></i>
          <div class="context-item-info">
            <span class="context-item-label">Riesgos</span>
            <span class="context-item-value">${totalRiesgos}</span>
          </div>
        </div>
      </div>
    `;

    return contextBar;
  }

  /**
   * 🆕 TASK 4: Update comic bubble reactively without full re-render
   * Called when state changes but we don't want to re-render entire wizard
   * Con bounce animation al actualizar datos
   */
  updateContextBar() {
    const bubble = document.getElementById('wizard-comic-bubble');
    if (!bubble) {
      console.warn('[WizardCore] Comic bubble not found in DOM, skipping update');
      return;
    }

    const data = this.state.data.formData;
    const cargos = this.state.data.formData.cargos || [];

    // Calcular total de riesgos seleccionados (usar .ges que es el array correcto)
    const totalRiesgos = cargos.reduce((sum, cargo) => {
      return sum + (cargo.ges?.length || 0);
    }, 0);
    const totalTrabajadores = cargos.reduce((sum, cargo) => sum + (parseInt(cargo.numPersonas) || 0), 0);

    // Update HTML (surgical DOM update, no flickering)
    const bubbleContent = bubble.querySelector('.comic-bubble-content');
    if (bubbleContent) {
      bubbleContent.innerHTML = `
        ${data.nombreEmpresa ? `
          <div class="comic-bubble-company">
            <i class="fas fa-building"></i>
            <span class="company-name">${data.nombreEmpresa}</span>
          </div>
        ` : ''}

        <div class="comic-bubble-stats">
          <div class="stat-item">
            <i class="fas fa-user-tie"></i>
            <div class="stat-content">
              <span class="stat-value">${cargos.length}</span>
              <span class="stat-label">Cargos</span>
            </div>
          </div>

          <div class="stat-item">
            <i class="fas fa-users"></i>
            <div class="stat-content">
              <span class="stat-value">${totalTrabajadores}</span>
              <span class="stat-label">Trabajadores</span>
            </div>
          </div>

          <div class="stat-item">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="stat-content">
              <span class="stat-value">${totalRiesgos}</span>
              <span class="stat-label">Riesgos</span>
            </div>
          </div>
        </div>
      `;

      // 🎭 Trigger bounce animation al actualizar
      bubble.classList.add('bounce-update');
      setTimeout(() => {
        bubble.classList.remove('bounce-update');
      }, 500);
    }

    console.log('[WizardCore] Comic bubble updated:', { cargos: cargos.length, riesgos: totalRiesgos });
  }

  /**
   * Render navigation buttons
   */
  renderNavigation(currentStep) {
    const currentIndex = this.steps.findIndex(s => s.id === currentStep);
    const isFirstStep = currentIndex === 0;
    const isLastStep = currentIndex === this.steps.length - 1;

    const navigation = document.createElement('div');
    navigation.className = 'wizard-navigation';
    navigation.innerHTML = `
      ${!isFirstStep ? `
        <button class="wizard-btn wizard-btn-back"
                data-action="back"
                data-keyboard-shortcut="Shift + Enter">
          <i class="fas fa-arrow-left"></i>
          Anterior
        </button>
      ` : ''}

      <button class="wizard-btn wizard-btn-next"
              data-action="next"
              data-keyboard-shortcut="Enter">
        ${isLastStep ? 'Generar Documentos' : 'Siguiente'}
        ${!isLastStep ? '<i class="fas fa-arrow-right"></i>' : '<i class="fas fa-paper-plane"></i>'}
      </button>
    `;

    // 🆕 H1: Initialize Floating UI tooltips after rendering buttons
    setTimeout(() => {
      // Destroy previous tooltips first
      if (this.keyboardTooltips) {
        destroyKeyboardTooltips(this.keyboardTooltips);
      }
      // Initialize new tooltips
      this.keyboardTooltips = initKeyboardTooltips();
    }, 0);

    return navigation;
  }

  /**
   * Render error state
   */
  renderError(message) {
    return `
      <div class="wizard-error">
        <div class="error-content">
          <strong>Error</strong>
          <p>${message}</p>
        </div>
      </div>
    `;
  }

  // ==================== STEP RENDERERS ====================

  /**
   * Step 1: Información Básica
   */
  renderInfoBasica() {
    const data = this.state.data.formData;
    const catalogos = this.state.data.catalogos;

    return `
      <div class="wizard-step" data-step="info-basica">
        <div class="wizard-step-header">
          <h2>
            <i class="fas fa-building wizard-icon wizard-icon--primary"></i>
            Información Básica de tu Empresa
          </h2>
          <p>Comencemos con los datos esenciales de tu organización</p>
        </div>

        <div class="wizard-form">
          <!-- Grid de 2 columnas en desktop, 1 en mobile -->
          <div class="wizard-form-grid">
            <!-- Nombre (ancho completo) -->
            <div class="form-group form-group--full-width">
              <label for="nombreEmpresa" class="form-label-with-help">
                <span class="form-label-text">Nombre de la Empresa *</span>
                <button type="button" class="wizard-help-button"
                  data-tooltip="Nombre legal completo de la empresa"
                  data-tooltip-placement="right"
                  aria-label="Ayuda">
                  <i class="fas fa-question-circle"></i>
                </button>
              </label>
              <input
                type="text"
                id="nombreEmpresa"
                name="nombreEmpresa"
                value="${data.nombreEmpresa || ''}"
                placeholder="Ej: Constructora XYZ S.A.S."
                required
              />
            </div>

            <!-- NIT -->
            <div class="form-group">
              <label for="nit">NIT *</label>
              <input
                type="text"
                id="nit"
                name="nit"
                value="${data.nit || ''}"
                placeholder="Ej: 900123456"
                pattern="[0-9]{9,10}"
                aria-describedby="hint-nit"
                required
              />
              <div class="wizard-hint" id="hint-nit">
                <i class="fas fa-info-circle"></i>
                Solo números, entre 9 y 10 dígitos
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email">Email de Contacto *</label>
              <input
                type="email"
                id="email"
                name="email"
                value="${data.email || ''}"
                placeholder="contacto@empresa.com"
                required
              />
            </div>

            <!-- Sector Económico con UX mejorada -->
            <div class="form-group form-group--sector-animated ${data.ciiuSeccion ? 'sector-selected' : ''}" id="sector-container">
              
              <!-- Estado inicial: Solo dropdown de sector -->
              <div class="sector-initial ${data.ciiuSeccion ? 'hidden' : ''}" id="sector-initial">
                <label for="ciiuSeccion" class="form-label-with-help">
                  <span class="form-label-text">Sector Económico *</span>
                  <button type="button" class="wizard-help-button"
                    data-tooltip="Clasificación CIIU según la DIAN"
                    data-tooltip-placement="right"
                    aria-label="Ayuda">
                    <i class="fas fa-question-circle"></i>
                  </button>
                </label>
                <select
                  id="ciiuSeccion"
                  name="ciiuSeccion"
                  class="wizard-enhanced-select wizard-select-sector"
                  aria-describedby="hint-ciiu-seccion"
                  required>
                  <option value="">Selecciona tu sector económico...</option>
                  ${(catalogos.ciiuSecciones || []).map(seccion => `
                    <option value="${seccion.codigo}" ${data.ciiuSeccion === seccion.codigo ? 'selected' : ''}>
                      ${seccion.nombre}
                    </option>
                  `).join('')}
                </select>
                <div class="wizard-hint" id="hint-ciiu-seccion">
                  <i class="fas fa-info-circle"></i>
                  Categoría principal según clasificación DIAN
                </div>
              </div>

              <!-- Estado después de seleccionar: Sector como badge editable + Dropdown actividad -->
              <div class="sector-selected-view ${!data.ciiuSeccion ? 'hidden' : ''}" id="sector-selected-view">
                <!-- Badge del sector seleccionado -->
                <div class="sector-badge" id="sector-badge">
                  <span class="sector-badge-label">Sector:</span>
                  <span class="sector-badge-value" id="sector-badge-value">
                    ${data.ciiuSeccion ? (catalogos.ciiuSecciones || []).find(s => s.codigo === data.ciiuSeccion)?.nombre || '' : ''}
                  </span>
                  <button type="button" class="sector-edit-btn" id="sector-edit-btn" title="Cambiar sector">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>

                <!-- Dropdown de Actividad Económica -->
                <div class="activity-dropdown-container">
                  <label for="ciiuDivision" class="form-label-with-help">
                    <span class="form-label-text">Actividad Económica *</span>
                    <button type="button" class="wizard-help-button"
                      data-tooltip="Actividad específica dentro del sector"
                      data-tooltip-placement="right"
                      aria-label="Ayuda">
                      <i class="fas fa-question-circle"></i>
                    </button>
                  </label>
                  <select
                    id="ciiuDivision"
                    name="ciiuDivision"
                    class="wizard-enhanced-select wizard-select-activity"
                    aria-describedby="hint-ciiu-division"
                    required>
                    <option value="">Selecciona tu actividad económica...</option>
                    <!-- Opciones cargadas dinámicamente -->
                  </select>
                  <div class="wizard-hint" id="hint-ciiu-division">
                    <i class="fas fa-info-circle"></i>
                    Actividad específica de tu empresa
                  </div>
                </div>
              </div>
            </div>

            <!-- Ciudad (con datalist desde BD) -->
            <div class="form-group">
              <label for="ciudad">Ciudad *</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                list="ciudades-datalist"
                value="${data.ciudad || ''}"
                placeholder="Ej: Bogotá"
                autocomplete="off"
                required
              />
              <datalist id="ciudades-datalist">
                ${(catalogos.ciudades || []).map(ciudad => `
                  <option value="${ciudad.nombre}" data-departamento="${ciudad.departamento}">
                `).join('')}
              </datalist>
              <div class="wizard-hint">
                <i class="fas fa-info-circle"></i>
                Escribe para buscar tu ciudad
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render special characteristics badges for a cargo
   */
  renderCargoCharacteristics(cargo) {
    const characteristics = [];

    // Warning level characteristics (yellow)
    if (cargo.tareasRutinarias) {
      characteristics.push({
        icon: 'fas fa-repeat',
        label: 'Tareas repetitivas',
        type: 'warning'
      });
    }
    if (cargo.conduceVehiculo) {
      characteristics.push({
        icon: 'fas fa-car',
        label: 'Conduce vehículo',
        type: 'warning'
      });
    }

    // Danger level characteristics (red)
    if (cargo.manipulaAlimentos) {
      characteristics.push({
        icon: 'fas fa-utensils',
        label: 'Manipula alimentos',
        type: 'danger'
      });
    }
    if (cargo.trabajaAlturas) {
      characteristics.push({
        icon: 'fas fa-arrow-up',
        label: 'Trabajo en alturas',
        type: 'danger'
      });
    }
    if (cargo.trabajaEspaciosConfinados) {
      characteristics.push({
        icon: 'fas fa-door-closed',
        label: 'Espacios confinados',
        type: 'danger'
      });
    }

    if (characteristics.length === 0) {
      return '';
    }

    return `
      <div class="cargo-characteristics">
        ${characteristics.map(char => `
          <span class="cargo-badge cargo-badge--${char.type}">
            <i class="${char.icon}"></i>
            ${char.label}
          </span>
        `).join('')}
      </div>
    `;
  }

  /**
   * Step 2: Cargos
   */
  renderCargos() {
    const cargos = this.state.getCargos();
    const currentCargoIndex = this.carouselIndex || 0;

    return `
      <div class="wizard-step" data-step="cargos">
        <h2>Cargos de tu Empresa</h2>
        <p>Agrega los puestos de trabajo que deseas evaluar</p>

        ${cargos.length === 0 ? `
          <div class="wizard-form">
            <div class="wizard-hint" style="margin-bottom: 3rem;">
              <i class="fas fa-info-circle"></i>
              Aún no has agregado ningún cargo
            </div>
            <button class="wizard-btn wizard-btn-primary wizard-btn-add-first" data-action="add-cargo" style="display: block; margin: 0 auto; padding: 2rem 4rem; font-size: 1.8rem;">
              <i class="fas fa-plus" style="margin-right: 1rem;"></i>
              Agrega acá tu primer cargo
            </button>
          </div>
        ` : `
          <!-- Navigation arrows - OUTSIDE wizard-form -->
          <button class="carousel-nav carousel-nav--prev" data-action="carousel-prev" ${currentCargoIndex === 0 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <button class="carousel-nav carousel-nav--next" data-action="carousel-next" ${currentCargoIndex >= cargos.length - 1 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6l6 6-6 6"/>
            </svg>
          </button>

          <div class="wizard-form">
            <div class="cargos-list">
              <!-- Carousel track -->
              <div class="cargos-carousel" style="transform: translateX(calc(-${currentCargoIndex * 100}% - ${currentCargoIndex * 2}rem))">
                ${cargos.map((cargo, index) => `
                  <div class="cargo-card" data-cargo-index="${index}">
                    ${cargo.area ? `<div class="cargo-area">${cargo.area}</div>` : ''}
                    <div class="cargo-card-header">
                      <h3>${cargo.nombre}</h3>
                      <div class="cargo-actions">
                        <button class="btn-icon" data-action="edit-cargo" data-index="${index}" title="Editar cargo">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-icon--danger" data-action="remove-cargo" data-index="${index}" title="Eliminar cargo">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="cargo-card-body">
                      <!-- Scrollable description with max height -->
                      <div class="cargo-description-scroll">
                        <p>${cargo.descripcion || 'Sin descripción'}</p>
                      </div>

                      <!-- Special characteristics badges -->
                      ${this.renderCargoCharacteristics(cargo)}

                      <div class="cargo-meta">
                        <span><i class="fas fa-user"></i> ${cargo.numPersonas} persona(s)</span>
                        <span><i class="fas fa-exclamation-triangle"></i> ${cargo.gesSeleccionados?.length || 0} riesgo(s)</span>
                        ${cargo.zona ? `<span><i class="fas fa-map-marker-alt"></i> ${cargo.zona}</span>` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Carousel dots indicator - OUTSIDE wizard-form -->
          <div class="carousel-dots">
            ${cargos.map((_, index) => `
              <button
                class="carousel-dot ${index === currentCargoIndex ? 'active' : ''}"
                data-action="carousel-goto"
                data-index="${index}"
                aria-label="Ir a cargo ${index + 1}"
              ></button>
            `).join('')}
          </div>
        `}

        <!-- FAB (Floating Action Button) - Visible solo cuando hay cargos -->
        <button
          class="fab ${cargos.length === 0 ? 'fab--hidden' : ''}"
          data-action="add-cargo"
          aria-label="Agregar un nuevo cargo"
        >
          <span class="fab-text">Agregar un nuevo cargo</span>
          <svg class="fab-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <!-- Worker icon -->
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
            <!-- Plus icon (small, top-right) -->
            <circle cx="18" cy="6" r="5" fill="white"/>
            <path d="M18 4v4m-2-2h4" stroke="#5dc4af" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <!-- Tooltip nativo usando title attribute (eliminado fab-tooltip custom) -->

        <!-- Modal para agregar cargo (hidden by default) -->
          <div id="modal-add-cargo" class="wizard-modal" style="display: none;">
            <div class="wizard-modal-content wizard-modal-content--two-cols">
              <div class="wizard-modal-header">
                <h3 id="modal-title-cargo">Agregar Nuevo Cargo</h3>
                <div class="wizard-modal-header-actions">
                  <button class="wizard-btn wizard-btn-primary wizard-btn-compact" data-action="save-cargo">
                    <i class="fas fa-save"></i>
                    Guardar
                  </button>
                  <button class="btn-close" data-action="close-modal">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <div class="wizard-modal-body wizard-modal-body--two-cols">
                <!-- Columna Izquierda: Información Básica -->
                <div class="wizard-modal-col wizard-modal-col--basic">
                  <div class="form-group">
                    <label for="cargo-nombre">Nombre del Cargo *</label>
                    <input
                      type="text"
                      id="cargo-nombre"
                      placeholder="Ej: Operario de Construcción"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label for="cargo-descripcion">Descripción (opcional)</label>
                    <textarea
                      id="cargo-descripcion"
                      rows="4"
                      placeholder="Breve descripción de las funciones del cargo"
                    ></textarea>
                  </div>
                  <div class="form-group">
                    <label for="cargo-num-personas">Número de Personas *</label>
                    <input
                      type="number"
                      id="cargo-num-personas"
                      min="1"
                      value="1"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label for="cargo-area">Área o Departamento del Cargo *</label>
                    <input
                      type="text"
                      id="cargo-area"
                      list="areas-list"
                      placeholder="Ej: Producción, Administración, etc."
                      required
                    />
                    <datalist id="areas-list">
                      <option value="Producción">
                      <option value="Administración">
                      <option value="Logística">
                      <option value="Ventas">
                      <option value="Mantenimiento">
                      <option value="Calidad">
                      <option value="Operaciones">
                      <option value="Recursos Humanos">
                      <option value="Contabilidad">
                      <option value="Sistemas">
                      <option value="Finanzas">
                      <option value="Compras">
                      <option value="Almacén">
                    </datalist>
                  </div>
                  <div class="form-group">
                    <label for="cargo-zona">Zona/Lugar de Trabajo *</label>
                    <input
                      type="text"
                      id="cargo-zona"
                      placeholder="Ej: Planta 1, Oficina Principal, Bodega A"
                      required
                    />
                  </div>
                </div>

                <!-- Columna Derecha: Características Especiales -->
                <div class="wizard-modal-col wizard-modal-col--toggles">
                  <div class="form-group">
                  <label class="form-label-section">
                    <i class="fas fa-shield-alt"></i>
                    Características Especiales
                  </label>
                  <div class="toggles-grid-modern">
                    <!-- Warning toggles (amarillo) -->
                    <div class="toggle-group toggle-group--warning">
                      <div class="toggle-header">
                        <div class="toggle-label-wrapper">
                          <i class="fas fa-repeat toggle-icon toggle-icon--warning"></i>
                          <span class="toggle-label">Tareas repetitivas</span>
                        </div>
                        <div class="wizard-switch wizard-switch--warning">
                          <input type="checkbox" id="cargo-tareasRutinarias" name="tareasRutinarias" />
                          <span class="slider"></span>
                        </div>
                      </div>
                      <div class="toggle-hint">
                        <i class="fas fa-info-circle"></i>
                        Puede requerir pausas activas y rotación de tareas
                      </div>
                    </div>

                    <div class="toggle-group toggle-group--warning">
                      <div class="toggle-header">
                        <div class="toggle-label-wrapper">
                          <i class="fas fa-car toggle-icon toggle-icon--warning"></i>
                          <span class="toggle-label">Conduce vehículo</span>
                        </div>
                        <div class="wizard-switch wizard-switch--warning">
                          <input type="checkbox" id="cargo-conduceVehiculo" name="conduceVehiculo" />
                          <span class="slider"></span>
                        </div>
                      </div>
                      <div class="toggle-hint">
                        <i class="fas fa-info-circle"></i>
                        Requiere licencia de conducción vigente
                      </div>
                    </div>

                    <!-- Danger toggles (rojo) -->
                    <div class="toggle-group toggle-group--danger">
                      <div class="toggle-header">
                        <div class="toggle-label-wrapper">
                          <i class="fas fa-utensils toggle-icon toggle-icon--danger"></i>
                          <span class="toggle-label">Manipula alimentos</span>
                        </div>
                        <div class="wizard-switch wizard-switch--danger">
                          <input type="checkbox" id="cargo-manipulaAlimentos" name="manipulaAlimentos" />
                          <span class="slider"></span>
                        </div>
                      </div>
                      <div class="toggle-hint">
                        <i class="fas fa-info-circle"></i>
                        Requiere certificado de manipulación de alimentos vigente
                      </div>
                    </div>

                    <div class="toggle-group toggle-group--danger">
                      <div class="toggle-header">
                        <div class="toggle-label-wrapper">
                          <i class="fas fa-arrow-up toggle-icon toggle-icon--danger"></i>
                          <span class="toggle-label">Trabaja en alturas</span>
                        </div>
                        <div class="wizard-switch wizard-switch--danger">
                          <input type="checkbox" id="cargo-trabajaAlturas" name="trabajaAlturas" />
                          <span class="slider"></span>
                        </div>
                      </div>
                      <div class="toggle-hint">
                        <i class="fas fa-info-circle"></i>
                        Requiere certificado de trabajo en alturas y EPP especializado
                      </div>
                    </div>

                    <div class="toggle-group toggle-group--danger">
                      <div class="toggle-header">
                        <div class="toggle-label-wrapper">
                          <i class="fas fa-door-closed toggle-icon toggle-icon--danger"></i>
                          <span class="toggle-label">Espacios confinados</span>
                        </div>
                        <div class="wizard-switch wizard-switch--danger">
                          <input type="checkbox" id="cargo-trabajaEspaciosConfinados" name="trabajaEspaciosConfinados" />
                          <span class="slider"></span>
                        </div>
                      </div>
                      <div class="toggle-hint">
                        <i class="fas fa-info-circle"></i>
                        Requiere permiso de trabajo y monitor de gases continuo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    `;
  }

  /**
   * Step 3: Riesgos - Uses RiesgoSelector component
   */
  renderRiesgos() {
    const cargos = this.state.getCargos();

    if (cargos.length === 0) {
      return `
        <div class="wizard-step" data-step="riesgos">
          <div class="wizard-hint" style="margin-top: 5rem;">
            <i class="fas fa-exclamation-triangle"></i>
            Debes agregar al menos un cargo antes de seleccionar riesgos.
          </div>
        </div>
      `;
    }

    // Render tabs for multiple cargos or single selector
    if (cargos.length === 1) {
      return `
        <div class="wizard-step" data-step="riesgos">
          <div id="riesgo-selector-0" class="riesgo-selector-container"></div>
        </div>
      `;
    }

    return `
      <div class="wizard-step" data-step="riesgos">
        <h2>Riesgos por Cargo</h2>
        <p>Selecciona los riesgos para cada uno de tus cargos usando las pestañas</p>

        <!-- P0-3: ARIA attributes para accesibilidad + P1-2: Wrapper para scroll indicators -->
        <div class="cargo-tabs-wrapper">
          <div class="cargo-tabs" role="tablist" aria-label="Lista de cargos">
            ${cargos.map((cargo, index) => {
              const riesgoCount = cargo.ges?.length || 0;
              const hasRisks = riesgoCount > 0;
              return `
                <button
                  class="cargo-tab ${index === 0 ? 'active' : ''}"
                  role="tab"
                  id="cargo-tab-${index}"
                  aria-selected="${index === 0}"
                  aria-controls="cargo-panel-${index}"
                  tabindex="${index === 0 ? 0 : -1}"
                  data-action="switch-cargo-tab"
                  data-cargo-index="${index}"
                  data-has-risks="${hasRisks}"
                  data-cargo-name="${cargo.nombre}"
                >
                  <span class="cargo-name">${cargo.nombre}</span>
                  <span class="cargo-count" aria-label="${riesgoCount} ${riesgoCount === 1 ? 'riesgo seleccionado' : 'riesgos seleccionados'}">
                    ${riesgoCount}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- P0-3: Selector containers con role="tabpanel" -->
        ${cargos.map((cargo, index) => `
          <div
            id="riesgo-selector-${index}"
            class="riesgo-selector-container"
            role="tabpanel"
            aria-labelledby="cargo-tab-${index}"
            tabindex="0"
            style="${index === 0 ? '' : 'display: none;'}"
          ></div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Step 4: Niveles
   * ✅ Sprint 6: Tags de cargos con estilo mejorado y tooltips
   */
  renderNiveles() {
    const cargos = this.state.getCargos();

    // Build HTML with container for each cargo
    let html = `
      <div class="wizard-step" data-step="niveles">
    `;

    // If there are multiple cargos, show tabs with improved styling
    if (cargos.length > 1) {
      html += `
        <div class="niveles-cargo-tabs">
          ${cargos.map((cargo, index) => {
            const gesArray = cargo.gesSeleccionados || cargo.ges || [];
            const gesCount = gesArray.length;
            
            // Contar GES completados
            const gesCompleted = gesArray.filter(ges => {
              const niveles = ges.niveles || {};
              return niveles.ND !== null && niveles.ND !== undefined &&
                     niveles.NE !== null && niveles.NE !== undefined &&
                     niveles.NC !== null && niveles.NC !== undefined;
            }).length;
            
            const isComplete = gesCount > 0 && gesCompleted === gesCount;
            const statusIcon = isComplete ? 'fa-check-circle completed' : 'fa-circle';
            
            return `
              <button
                class="niveles-cargo-tab ${index === 0 ? 'active' : ''} ${isComplete ? 'completed' : ''}"
                data-action="switch-cargo-niveles"
                data-cargo-index="${index}"
                data-cargo-name="${cargo.nombre}"
              >
                <i class="fas ${statusIcon} cargo-status-icon"></i>
                <span class="cargo-tab__name">${cargo.nombre}</span>
                <span class="cargo-tab__count">${gesCompleted}/${gesCount}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    // Containers for each cargo (only first visible initially)
    cargos.forEach((cargo, index) => {
      html += `
        <div
          id="niveles-container-${index}"
          class="niveles-cargo-container"
          style="${index === 0 ? '' : 'display: none;'}"
        ></div>
      `;
    });

    html += `</div>`;
    
    // Tooltip container (will be positioned with Floating UI)
    html += `
      <div id="niveles-cargo-tooltip" class="niveles-cargo-tooltip" role="tooltip">
        <div class="niveles-cargo-tooltip__header">
          <i class="fas fa-briefcase"></i>
          <span id="tooltip-cargo-name">Cargo</span>
          <span class="tooltip-stats" id="tooltip-stats">0/0</span>
        </div>
        <div class="niveles-cargo-tooltip__divider"></div>
        <div class="niveles-cargo-tooltip__body">
          <span class="niveles-cargo-tooltip__label">Riesgos (GES)</span>
          <ul class="niveles-cargo-tooltip__list" id="tooltip-ges-list">
          </ul>
        </div>
      </div>
    `;
    
    return html;
  }

  /**
   * Step 5: Controles - Delegate to ControlesManager component
   */
  renderControles() {
    console.log('[WizardCore] Rendering controles step with ControlesManager');

    const html = `
      <div class="wizard-step" data-step="controles">
        <div id="controles-container"></div>
      </div>
    `;

    // Return HTML first, then initialize component after render
    setTimeout(() => {
      this.initControlesManager();
    }, 0);

    return html;
  }

  /**
   * Initialize ControlesManager component
   */
  initControlesManager() {
    const container = document.getElementById('controles-container');
    if (!container) {
      console.error('[WizardCore] controles-container not found');
      return;
    }

    // Clean up previous instance
    if (this.controlesManager) {
      this.controlesManager.destroy();
    }

    // Create new instance
    this.controlesManager = new ControlesManager('#controles-container', this.state);
    this.controlesManager.render();

    // Listen for completion event
    container.addEventListener('controles:completed', (e) => {
      console.log('[WizardCore] Controles completed', e.detail);
      this.avanzarPaso();
    });

    console.log('[WizardCore] ControlesManager initialized');
  }

  /**
   * Avanzar al siguiente paso del wizard
   * Usado cuando se completan los controles
   */
  avanzarPaso() {
    const currentStep = this.state.getCurrentStep();
    const currentIndex = this.steps.findIndex(s => s.id === currentStep);

    if (currentIndex < this.steps.length - 1) {
      const nextStep = this.steps[currentIndex + 1];
      console.log(`[WizardCore] Avanzando de ${currentStep} a ${nextStep.id}`);
      this.state.setCurrentStep(nextStep.id);
    } else {
      console.warn('[WizardCore] Ya estás en el último paso');
    }
  }

  /**
   * Step 6: Resumen y Generación de Documentos
   */
  renderResumen() {
    const data = this.state.data.formData;
    const cargos = this.state.getCargos();
    const analytics = this.state.getAnalytics();

    const totalGES = cargos.reduce((sum, cargo) => sum + (cargo.gesSeleccionados?.length || 0), 0);
    const totalPersonas = cargos.reduce((sum, cargo) => sum + (parseInt(cargo.numPersonas) || 0), 0);

    // Count GES with niveles configured
    let gesConNiveles = 0;
    let gesConControles = 0;

    cargos.forEach(cargo => {
      cargo.gesSeleccionados.forEach(ges => {
        if (ges.niveles && ges.niveles.NR !== null) {
          gesConNiveles++;
        }
        if (ges.controles && Object.values(ges.controles).some(c => c && c.trim())) {
          gesConControles++;
        }
      });
    });

    return `
      <div class="wizard-step" data-step="resumen">
        <div class="resumen-header">
          <h2><i class="fas fa-check-circle"></i> Resumen Final</h2>
          <p>Revisa la información antes de generar tus documentos</p>
        </div>

        <div class="resumen-container">
          <!-- Información Básica -->
          <div class="resumen-section">
            <h3><i class="fas fa-building"></i> Información de la Empresa</h3>
            <div class="resumen-details">
              <div class="detail-item">
                <span class="detail-label">Empresa:</span>
                <span class="detail-value">${data.nombreEmpresa || 'Sin especificar'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">NIT:</span>
                <span class="detail-value">${data.nit || 'Sin especificar'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${data.email || 'Sin especificar'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Sector Económico:</span>
                <span class="detail-value">${data.sector || 'Sin especificar'}</span>
              </div>
            </div>
          </div>

          <!-- Cargos Summary -->
          <div class="resumen-section">
            <h3><i class="fas fa-users"></i> Cargos Definidos (${cargos.length})</h3>
            <div class="cargos-list">
              ${cargos.map((cargo, index) => `
                <div class="cargo-item">
                  <div class="cargo-header">
                    <span class="cargo-number">${index + 1}</span>
                    <strong>${cargo.nombre}</strong>
                  </div>
                  <div class="cargo-stats">
                    <span><i class="fas fa-user"></i> ${cargo.numPersonas} persona(s)</span>
                    <span><i class="fas fa-exclamation-triangle"></i> ${cargo.gesSeleccionados?.length || 0} riesgo(s)</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Estadísticas Globales -->
          <div class="resumen-section">
            <h3><i class="fas fa-chart-bar"></i> Estadísticas del Análisis</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-content">
                  <div class="stat-value">${cargos.length}</div>
                  <div class="stat-label">Cargos</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-user-friends"></i></div>
                <div class="stat-content">
                  <div class="stat-value">${totalPersonas}</div>
                  <div class="stat-label">Personas</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="stat-content">
                  <div class="stat-value">${totalGES}</div>
                  <div class="stat-label">Riesgos (GES)</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-calculator"></i></div>
                <div class="stat-content">
                  <div class="stat-value">${gesConNiveles}</div>
                  <div class="stat-label">Niveles Configurados</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-shield-alt"></i></div>
                <div class="stat-content">
                  <div class="stat-value">${gesConControles}</div>
                  <div class="stat-label">Controles Definidos</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-content">
                  <div class="stat-value">${Math.floor(analytics.totalTime / 1000 / 60)}</div>
                  <div class="stat-label">Minutos</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documentos que se generarán -->
          <div class="resumen-section">
            <h3><i class="fas fa-file-alt"></i> Documentos que se Generarán</h3>
            <div class="documentos-list">
              <div class="documento-item">
                <i class="fas fa-file-excel documento-icon excel"></i>
                <div class="documento-info">
                  <strong>Matriz de Riesgos Profesionales</strong>
                  <span>Archivo Excel con análisis completo de todos los riesgos</span>
                </div>
              </div>
              <div class="documento-item">
                <i class="fas fa-file-pdf documento-icon pdf"></i>
                <div class="documento-info">
                  <strong>Profesiograma</strong>
                  <span>PDF con perfil profesional y requisitos de cada cargo</span>
                </div>
              </div>
              <div class="documento-item">
                <i class="fas fa-file-pdf documento-icon pdf"></i>
                <div class="documento-info">
                  <strong>Perfil de Cargo</strong>
                  <span>PDF detallado de competencias y responsabilidades</span>
                </div>
              </div>
              <div class="documento-item">
                <i class="fas fa-file-pdf documento-icon pdf"></i>
                <div class="documento-info">
                  <strong>Cotización de Exámenes</strong>
                  <span>PDF con precios y detalles de exámenes médicos ocupacionales</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Info Box -->
          <div class="wizard-hint info">
            <i class="fas fa-info-circle"></i>
            <div>
              <strong>¿Qué sucede al generar documentos?</strong>
              <p>Los documentos se generarán de forma asíncrona en nuestros servidores. Recibirás los links de descarga cuando estén listos (usualmente en 1-2 minutos).</p>
            </div>
          </div>

          <!-- Submit Section -->
          <div id="submit-section" class="submit-section">
            <button id="btn-generar-documentos" class="btn-wizard btn-wizard--primary btn-large">
              <i class="fas fa-rocket"></i>
              Generar Documentos
            </button>
            <button class="btn-wizard btn-wizard--secondary" data-action="back">
              <i class="fas fa-arrow-left"></i>
              Volver a Controles
            </button>
          </div>

          <!-- Progress/Results Section (hidden initially) -->
          <div id="generation-status" class="generation-status" style="display: none;">
            <!-- Will be populated dynamically -->
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach listeners for Resumen step
   */
  attachResumenListeners() {
    const btnGenerar = this.container.querySelector('#btn-generar-documentos');

    if (btnGenerar) {
      btnGenerar.addEventListener('click', () => {
        this.handleGenerarDocumentos();
      });
    }
  }

  /**
   * Handle document generation submission
   * Muestra modal para recoger email, password y nombre del contacto (igual que prototipo)
   */
  async handleGenerarDocumentos() {
    console.log('[WizardCore] 🚀 handleGenerarDocumentos iniciado');

    // Mostrar modal de registro (igual que form_matriz_riesgos_prof.js)
    this.showRegistrationModal();
  }

  /**
   * Show registration modal (same as prototipo)
   */
  showRegistrationModal() {
    // Get company data from state
    const stateData = this.state.exportForSubmission();
    const companyData = stateData.userData;

    // Create modal HTML
    const modalHTML = `
      <div id="registration-modal" class="wizard-modal" style="display: block;">
        <div class="wizard-modal-content" style="max-width: 500px;">
          <div class="wizard-modal-header">
            <h3 style="margin: 0; color: #383d47;">
              <i class="fas fa-user-check" style="color: #5dc4af; margin-right: 8px;"></i>
              Completa tu Registro
            </h3>
            <button type="button" class="btn-close" id="close-registration-modal" aria-label="Cerrar">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="wizard-modal-body">
            <p style="margin-bottom: 24px; color: #666; font-size: 14px;">
              Para generar tus documentos, necesitamos algunos datos adicionales:
            </p>

            <form id="registration-form">
              <!-- Pre-filled company data (readonly) -->
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #383d47;">
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  value="${companyData.nombreEmpresa || ''}"
                  readonly
                  style="background: #f5f5f5; cursor: not-allowed;"
                />
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #383d47;">
                  NIT
                </label>
                <input
                  type="text"
                  value="${companyData.nit || ''}"
                  readonly
                  style="background: #f5f5f5; cursor: not-allowed;"
                />
              </div>

              <!-- User data fields (required) -->
              <div style="margin-bottom: 20px;">
                <label for="modal-email" style="display: block; font-weight: 600; margin-bottom: 8px; color: #383d47;">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="modal-email"
                  name="email"
                  placeholder="contacto@empresa.com"
                  required
                  autocomplete="email"
                />
              </div>

              <div style="margin-bottom: 20px;">
                <label for="modal-password" style="display: block; font-weight: 600; margin-bottom: 8px; color: #383d47;">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="modal-password"
                  name="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minlength="6"
                  autocomplete="new-password"
                />
                <small style="display: block; margin-top: 4px; color: #666; font-size: 12px;">
                  Usarás este correo y contraseña para acceder a tus documentos
                </small>
              </div>

              <div style="margin-bottom: 24px;">
                <label for="modal-nombre" style="display: block; font-weight: 600; margin-bottom: 8px; color: #383d47;">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  id="modal-nombre"
                  name="nombre"
                  placeholder="Ej: Juan Pérez"
                  autocomplete="name"
                />
              </div>

              <div id="modal-error" style="display: none; padding: 12px; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin-bottom: 16px; color: #c33; font-size: 14px;">
              </div>

              <button type="submit" class="wizard-btn-primary wizard-btn-full submit-modal-btn">
                <i class="fas fa-paper-plane"></i>
                Registrar y Generar Documentos
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Inject modal into body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    // Setup event listeners
    const modal = document.getElementById('registration-modal');
    const closeBtn = document.getElementById('close-registration-modal');
    const form = document.getElementById('registration-form');

    // Close modal on X button
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modalContainer);
      }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('[WizardCore] 📋 Formulario de registro enviado');

      const modalError = document.getElementById('modal-error');
      if (modalError) modalError.style.display = 'none';

      // Collect user data from form
      const userData = {
        nombreEmpresa: companyData.nombreEmpresa,
        nit: companyData.nit,
        email: document.getElementById('modal-email')?.value.trim() || '',
        password: document.getElementById('modal-password')?.value || '',
        nombre: document.getElementById('modal-nombre')?.value.trim() || null
      };

      console.log('[WizardCore] 👤 Datos del usuario:', userData);

      // Validate
      if (!userData.email || !userData.password || !userData.nombreEmpresa || !userData.nit) {
        if (modalError) {
          modalError.textContent = 'Por favor completa todos los campos requeridos (*)';
          modalError.style.display = 'block';
        }
        return;
      }

      // Disable submit button
      const submitBtn = form.querySelector('.submit-modal-btn');
      const originalBtnText = submitBtn?.textContent || 'Registrar';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
      }

      try {
        console.log('[WizardCore] 📤 Enviando al backend...');

        // Get form data from state
        const stateData = this.state.exportForSubmission();

        // Construct payload
        const payload = {
          formData: stateData.formData,  // { cargos: [...] }
          userData: userData              // { nombreEmpresa, nit, email, password, nombre }
        };

        console.log('[WizardCore] 📦 Payload completo:', payload);

        // 🆕 Usar endpoint rápido que responde inmediato y genera en background
        const response = await fetch('/api/flujo-ia/registrar-rapido', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('[WizardCore] 📥 Respuesta:', result);

        if (!response.ok || !result.success) {
          throw new Error(result.message || `Error ${response.status}`);
        }

        // Success!
        console.log('[WizardCore] ✅ Registro exitoso');

        // Close modal
        document.body.removeChild(modalContainer);

        // Clear saved state
        localStorage.removeItem('wizardState');

        // 🆕 Guardar sesión en localStorage para autenticación automática
        if (result.sessionToken && result.user) {
          // Tokens y auth
          localStorage.setItem('authToken', result.sessionToken);
          localStorage.setItem('genesys_token', result.sessionToken);

          // Datos de usuario (múltiples keys para compatibilidad)
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('genesys_user', JSON.stringify(result.user));

          // Datos de empresa
          localStorage.setItem('empresaId', result.user.empresaId);
          localStorage.setItem('genesys_empresa', JSON.stringify({
            id: result.user.empresaId,
            nombre_legal: result.user.empresaNombre,
            nit: userData.nit
          }));

          // Token del documento para seguimiento
          if (result.documentToken) {
            localStorage.setItem('genesys_pending_document_token', result.documentToken);
          }

          console.log('[WizardCore] 🔐 Sesión completa guardada en localStorage');
        }

        // 🆕 Redirigir al dashboard (documentos se generan en background)
        const redirectUrl = result.redirectUrl || '/pages/dashboard.html';
        console.log('[WizardCore] 🚀 Redirigiendo a ' + redirectUrl);
        window.location.href = redirectUrl;

      } catch (error) {
        console.error('[WizardCore] ❌ Error:', error);

        if (modalError) {
          modalError.textContent = `Error: ${error.message}`;
          modalError.style.display = 'block';
        }

        // Re-enable button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  /**
   * Start polling for job status
   */
  startPollingStatus(token, jobId) {
    this.pollingToken = token;
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/solicitud/${token}/estado`);
        const status = await response.json();

        if (!response.ok) {
          throw new Error(status.message || 'Error al obtener estado');
        }

        console.log('[WizardCore] Status update:', status);

        // Update UI
        this.updateStatusUI(status);

        // Stop polling if completed or failed
        if (status.estado === 'completado' || status.estado === 'error') {
          this.stopPolling();
        }

      } catch (error) {
        console.error('[WizardCore] Error polling status:', error);
        this.stopPolling();
        this.updateStatusUI({
          estado: 'error',
          mensaje: 'Error al verificar estado. Recarga la página para continuar.'
        });
      }
    }, 3000); // Poll every 3 seconds
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Update status UI
   */
  updateStatusUI(status) {
    const statusSection = this.container.querySelector('#generation-status');
    if (!statusSection) return;

    const { estado, progreso, mensaje, previewUrls } = status;

    let html = `
      <div class="status-container">
    `;

    if (estado === 'procesando') {
      html += `
        <div class="status-header processing">
          <i class="fas fa-spinner fa-spin"></i>
          <h3>Generando Documentos...</h3>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progreso || 0}%"></div>
        </div>
        <p class="status-message">${mensaje || 'Procesando tu solicitud...'}</p>
        <p class="status-hint">Esto puede tomar 1-2 minutos. No cierres esta página.</p>
      `;
    } else if (estado === 'completado') {
      html += `
        <div class="status-header success">
          <i class="fas fa-check-circle"></i>
          <h3>¡Documentos Generados Exitosamente!</h3>
        </div>
        <p class="status-message">Tus documentos están listos para descargar:</p>
        <div class="documentos-download">
          ${previewUrls?.matriz ? `
            <a href="${previewUrls.matriz}" target="_blank" class="download-card excel">
              <i class="fas fa-file-excel"></i>
              <span>Matriz de Riesgos (Excel)</span>
              <i class="fas fa-download"></i>
            </a>
          ` : ''}
          ${previewUrls?.profesiograma ? `
            <a href="${previewUrls.profesiograma}" target="_blank" class="download-card pdf">
              <i class="fas fa-file-pdf"></i>
              <span>Profesiograma (PDF)</span>
              <i class="fas fa-download"></i>
            </a>
          ` : ''}
          ${previewUrls?.perfil ? `
            <a href="${previewUrls.perfil}" target="_blank" class="download-card pdf">
              <i class="fas fa-file-pdf"></i>
              <span>Perfil de Cargo (PDF)</span>
              <i class="fas fa-download"></i>
            </a>
          ` : ''}
          ${previewUrls?.cotizacion ? `
            <a href="${previewUrls.cotizacion}" target="_blank" class="download-card pdf">
              <i class="fas fa-file-pdf"></i>
              <span>Cotización (PDF)</span>
              <i class="fas fa-download"></i>
            </a>
          ` : ''}
        </div>
        <div class="wizard-hint success">
          <i class="fas fa-check"></i>
          Los documentos también fueron enviados a tu email: ${this.state.data.formData.email}
        </div>
        <button id="btn-nueva-solicitud" class="btn-wizard btn-wizard--primary">
          <i class="fas fa-plus"></i>
          Nueva Solicitud
        </button>
      `;
    } else if (estado === 'error') {
      html += `
        <div class="status-header error">
          <i class="fas fa-times-circle"></i>
          <h3>Error al Generar Documentos</h3>
        </div>
        <p class="status-message error">${mensaje || 'Ocurrió un error inesperado.'}</p>
        <div class="wizard-hint error">
          <i class="fas fa-exclamation-triangle"></i>
          Por favor contacta a soporte técnico o intenta de nuevo.
        </div>
        <button id="btn-reintentar" class="btn-wizard btn-wizard--primary">
          <i class="fas fa-redo"></i>
          Reintentar
        </button>
      `;
    }

    html += `</div>`;

    statusSection.innerHTML = html;

    // Attach new listeners
    const btnNueva = statusSection.querySelector('#btn-nueva-solicitud');
    if (btnNueva) {
      btnNueva.addEventListener('click', () => {
        this.state.clearStorage();
        window.location.reload();
      });
    }

    const btnReintentar = statusSection.querySelector('#btn-reintentar');
    if (btnReintentar) {
      btnReintentar.addEventListener('click', () => {
        statusSection.style.display = 'none';
        this.container.querySelector('#submit-section').style.display = 'block';
      });
    }
  }

  // ==================== EVENT HANDLERS ====================

  /**
   * Attach event listeners for current step
   */
  attachEventListeners(currentStep) {
    // Navigation buttons (bottom of wizard)
    const backBtn = this.container.querySelector('[data-action="back"]');
    const nextBtn = this.container.querySelector('[data-action="next"]');

    if (backBtn) {
      backBtn.addEventListener('click', () => this.handleBack());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.handleNext(currentStep));
    }

    // Step-specific listeners
    switch (currentStep) {
      case 'info-basica':
        this.attachInfoBasicaListeners();
        break;
      case 'cargos':
        this.attachCargosListeners();
        break;
      case 'riesgos':
        this.attachRiesgosListeners();
        break;
      case 'niveles':
        this.attachNivelesListeners();
        break;
      case 'controles':
        // ControlesManager handles its own listeners
        break;
      case 'resumen':
        this.attachResumenListeners();
        break;
    }
  }

  /**
   * Show inline error message for a field
   * @param {HTMLElement} input - Input field
   * @param {string} errorMessage - Error message to display
   */
  showFieldError(input, errorMessage) {
    if (!input) return;

    // Add error class to input
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');

    // Remove existing error message if any
    this.clearFieldError(input);

    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    errorElement.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${errorMessage}</span>
    `;

    // Insert error message after input
    input.parentElement.appendChild(errorElement);

    // Link error to input for screen readers
    const errorId = `error-${input.id || input.name}`;
    errorElement.id = errorId;
    input.setAttribute('aria-describedby', errorId);
  }

  /**
   * Clear inline error message for a field
   * @param {HTMLElement} input - Input field
   */
  clearFieldError(input) {
    if (!input) return;

    // Remove error class from input
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');

    // Remove error message element
    const errorElement = input.parentElement.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Attach listeners for Info Basica step
   */
  attachInfoBasicaListeners() {
    // All inputs including optional ones
    const inputs = this.container.querySelectorAll(
      '#nombreEmpresa, #nit, #email, #ciiuSeccion, #ciiuDivision, #telefono, #direccion, #ciudad'
    );

    inputs.forEach(input => {
      // Update on input (silent mode - no re-render, just save to storage)
      input.addEventListener('input', (e) => {
        this.state.updateBasicInfo(e.target.name, e.target.value, true); // silent = true

        // Clear error on input (user is fixing it)
        this.clearFieldError(e.target);
      });

      // Validate on blur (when user leaves the field)
      input.addEventListener('blur', (e) => {
        const field = e.target.name;
        const value = e.target.value;

        // Validate field
        const error = this.state.validateSingleField(field, value);

        if (error) {
          // Show error message
          this.showFieldError(e.target, error);
        } else {
          // Clear any existing error
          this.clearFieldError(e.target);
        }

        // Update state (silent mode to avoid re-render)
        this.state.updateBasicInfo(field, value, true);
      });
    });

    // 🆕 CIIU Cascading Dropdown with animated UX
    this.setupSectorAnimatedDropdown();
  }

  /**
   * Setup animated sector dropdown with two-step selection
   */
  setupSectorAnimatedDropdown() {
    const sectorContainer = this.container.querySelector('#sector-container');
    const sectorInitial = this.container.querySelector('#sector-initial');
    const sectorSelectedView = this.container.querySelector('#sector-selected-view');
    const ciiuSeccionSelect = this.container.querySelector('#ciiuSeccion');
    const ciiuDivisionSelect = this.container.querySelector('#ciiuDivision');
    const sectorBadgeValue = this.container.querySelector('#sector-badge-value');
    const sectorEditBtn = this.container.querySelector('#sector-edit-btn');

    if (!ciiuSeccionSelect || !ciiuDivisionSelect) return;

    // Handler for sector selection
    ciiuSeccionSelect.addEventListener('change', async (e) => {
      const seccionCodigo = e.target.value;
      
      if (!seccionCodigo) return;

      // 🔧 FIX: Reset division state when sector changes
      this.state.updateBasicInfo('ciiuDivision', '', true);
      this.state.updateBasicInfo('sector', '', true);
      
      // Clear the division dropdown immediately
      if (ciiuDivisionSelect) {
        ciiuDivisionSelect.innerHTML = '<option value="">Cargando actividades...</option>';
        ciiuDivisionSelect.value = '';
      }

      // Save sector to state
      this.state.updateBasicInfo('ciiuSeccion', seccionCodigo, true);

      // Get sector name from selected option
      const selectedOption = e.target.options[e.target.selectedIndex];
      const sectorNombre = selectedOption.text;

      // Update badge text
      if (sectorBadgeValue) {
        sectorBadgeValue.textContent = sectorNombre;
      }

      // Animate transition
      if (sectorInitial && sectorSelectedView) {
        // Fade out initial view
        sectorInitial.style.opacity = '0';
        sectorInitial.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
          sectorInitial.classList.add('hidden');
          sectorSelectedView.classList.remove('hidden');
          
          // Fade in selected view
          sectorSelectedView.style.opacity = '0';
          sectorSelectedView.style.transform = 'translateY(10px)';
          
          requestAnimationFrame(() => {
            sectorSelectedView.style.transition = 'all 0.3s ease-out';
            sectorSelectedView.style.opacity = '1';
            sectorSelectedView.style.transform = 'translateY(0)';
          });
        }, 200);
      }

      // Add selected class to container
      if (sectorContainer) {
        sectorContainer.classList.add('sector-selected');
      }

      // Load activities for this sector (fresh load)
      await this.loadCIIUDivisiones(seccionCodigo, ciiuDivisionSelect);
    });

    // Handler for edit button (go back to sector selection)
    if (sectorEditBtn) {
      sectorEditBtn.addEventListener('click', () => {
        console.log('[WizardCore] 🔄 Resetting sector selection');
        
        // Reset state completely
        this.state.updateBasicInfo('ciiuSeccion', '', true);
        this.state.updateBasicInfo('ciiuDivision', '', true);
        this.state.updateBasicInfo('sector', '', true);

        // Animate back to initial view
        if (sectorSelectedView && sectorInitial) {
          sectorSelectedView.style.opacity = '0';
          sectorSelectedView.style.transform = 'translateY(10px)';
          
          setTimeout(() => {
            sectorSelectedView.classList.add('hidden');
            sectorInitial.classList.remove('hidden');
            
            // Reset both selects completely
            if (ciiuSeccionSelect) {
              ciiuSeccionSelect.value = '';
            }
            if (ciiuDivisionSelect) {
              ciiuDivisionSelect.innerHTML = '<option value="">Selecciona tu actividad económica...</option>';
              ciiuDivisionSelect.value = '';
              ciiuDivisionSelect.disabled = false;
            }
            
            // Fade in initial view
            sectorInitial.style.opacity = '0';
            sectorInitial.style.transform = 'translateY(-10px)';
            
            requestAnimationFrame(() => {
              sectorInitial.style.transition = 'all 0.3s ease-out';
              sectorInitial.style.opacity = '1';
              sectorInitial.style.transform = 'translateY(0)';
            });
          }, 200);
        }

        // Remove selected class
        if (sectorContainer) {
          sectorContainer.classList.remove('sector-selected');
        }
      });
    }

    // Handler for activity selection
    ciiuDivisionSelect.addEventListener('change', (e) => {
      this.state.updateBasicInfo('ciiuDivision', e.target.value, true);
      // Also save as 'sector' for backward compatibility
      this.state.updateBasicInfo('sector', e.target.value, true);
    });

    // 🆕 If sector was already selected (resuming), show selected view and load activities
    const savedSeccion = this.state.data.formData.ciiuSeccion;
    const savedDivision = this.state.data.formData.ciiuDivision;
    
    if (savedSeccion) {
      // Already showing selected view (from template), just load activities
      this.loadCIIUDivisiones(savedSeccion, ciiuDivisionSelect).then(() => {
        if (savedDivision) {
          ciiuDivisionSelect.value = savedDivision;
        }
      });
    }
  }

  /**
   * Load CIIU divisions (activities) for a sector
   */
  async loadCIIUDivisiones(seccionCodigo, selectElement) {
    if (!selectElement) return;

    console.log(`[WizardCore] 🔄 Loading divisions for sector: ${seccionCodigo}`);

    // Show loading state and reset value
    selectElement.innerHTML = '<option value="">Cargando actividades...</option>';
    selectElement.value = '';
    selectElement.disabled = true;

    try {
      // Fetch divisions for selected section (add cache-busting)
      const response = await fetch(`/api/catalogo/ciiu/secciones/${seccionCodigo}/divisiones?_t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Error cargando actividades: ${response.status}`);
      }

      const data = await response.json();
      const divisiones = data.data || [];

      console.log(`[WizardCore] 📦 Received ${divisiones.length} divisions for sector ${seccionCodigo}:`, 
        divisiones.slice(0, 3).map(d => d.nombre));

      // Populate division dropdown (only name, no code)
      selectElement.innerHTML = `
        <option value="">Selecciona tu actividad económica...</option>
        ${divisiones.map(div => `
          <option value="${div.codigo}">${div.nombre}</option>
        `).join('')}
      `;
      selectElement.value = ''; // Ensure no pre-selection
      selectElement.disabled = false;

      // 🆕 Refresh enhanced dropdown if it exists
      if (selectElement._dropdownApi && typeof selectElement._dropdownApi.refresh === 'function') {
        selectElement._dropdownApi.refresh();
        console.log(`[WizardCore] 🔄 Refreshed enhanced dropdown for activities`);
      }

      console.log(`[WizardCore] ✅ Loaded ${divisiones.length} activities for sector ${seccionCodigo}`);

    } catch (error) {
      console.error('[WizardCore] ❌ Error loading CIIU divisions:', error);
      selectElement.innerHTML = '<option value="">Error cargando actividades</option>';
      selectElement.disabled = true;
    }
  }

  /**
   * Position FAB using Floating UI to stay close to wizard-form
   * Tooltip ahora usa title attribute nativo (no necesita posicionamiento)
   */
  async positionFAB() {
    const fab = this.container.querySelector('.fab');
    const wizardForm = this.container.querySelector('.wizard-form');

    if (!fab || !wizardForm) return;

    // Clean up previous positioning
    if (this.fabCleanup) {
      this.fabCleanup();
      this.fabCleanup = null;
    }

    // Position FAB only (tooltip removed)
    const updateFABPosition = async () => {
      // Position FAB relative to wizard-form (right-end placement)
      const { x, y } = await computePosition(wizardForm, fab, {
        placement: 'right-end',
        middleware: [
          offset(24), // 2.4rem gap from wizard-form
          shift({ padding: 10 })
        ]
      });

      Object.assign(fab.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
      });
    };

    // Initial position
    await updateFABPosition();

    // Update position on scroll/resize
    const handleUpdate = () => updateFABPosition();
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);

    // Store cleanup function
    this.fabCleanup = () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }

  /**
   * Attach listeners for Cargos step
   */
  attachCargosListeners() {
    // Add cargo button
    const addBtn = this.container.querySelector('[data-action="add-cargo"]');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showAddCargoModal());
    }

    // Position FAB with Floating UI
    this.positionFAB();

    // Carousel navigation buttons
    const prevBtn = this.container.querySelector('[data-action="carousel-prev"]');
    const nextBtn = this.container.querySelector('[data-action="carousel-next"]');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.handleCarouselPrev());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.handleCarouselNext());
    }

    // Carousel dots navigation
    const dots = this.container.querySelectorAll('[data-action="carousel-goto"]');
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleCarouselGoto(index);
      });
    });

    // Edit cargo buttons
    const editBtns = this.container.querySelectorAll('[data-action="edit-cargo"]');
    console.log('[WizardCore] Found edit buttons:', editBtns.length);
    editBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('[WizardCore] Edit button clicked!');
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleEditCargo(e.currentTarget, index);
      });
    });

    // Remove cargo buttons
    const removeBtns = this.container.querySelectorAll('[data-action="remove-cargo"]');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.handleRemoveCargo(index);
      });
    });

    // Modal close buttons
    const closeBtns = this.container.querySelectorAll('[data-action="close-modal"]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.hideAddCargoModal());
    });

    // Save cargo button
    const saveBtn = this.container.querySelector('[data-action="save-cargo"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSaveCargo());
    }
  }

  /**
   * Update carousel position without full re-render
   */
  updateCarouselPosition() {
    const carousel = this.container.querySelector('.cargos-carousel');
    if (carousel) {
      carousel.style.transform = `translateX(calc(-${this.carouselIndex * 100}% - ${this.carouselIndex * 2}rem))`;
    }

    // Update carousel dots
    const dots = this.container.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      if (index === this.carouselIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update navigation buttons disabled state
    const prevBtn = this.container.querySelector('[data-action="carousel-prev"]');
    const nextBtn = this.container.querySelector('[data-action="carousel-next"]');
    const cargos = this.state.getCargos();

    if (prevBtn) {
      prevBtn.disabled = this.carouselIndex === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.carouselIndex >= cargos.length - 1;
    }
  }

  /**
   * Handle carousel previous navigation
   */
  handleCarouselPrev() {
    const cargos = this.state.getCargos();
    if (this.carouselIndex > 0) {
      this.carouselIndex--;
      this.updateCarouselPosition(); // Update only carousel, not full render
    }
  }

  /**
   * Handle carousel next navigation
   */
  handleCarouselNext() {
    const cargos = this.state.getCargos();
    if (this.carouselIndex < cargos.length - 1) {
      this.carouselIndex++;
      this.updateCarouselPosition(); // Update only carousel, not full render
    }
  }

  /**
   * Handle carousel goto specific index (from dots)
   */
  handleCarouselGoto(index) {
    const cargos = this.state.getCargos();
    if (index >= 0 && index < cargos.length) {
      this.carouselIndex = index;
      this.updateCarouselPosition(); // Update only carousel, not full render
    }
  }

  /**
   * Attach listeners for Riesgos step
   */
  attachRiesgosListeners() {
    const cargos = this.state.getCargos();
    const catalogos = this.state.data.catalogos;

    console.log('[WizardCore] Initializing RiesgoSelector for', cargos.length, 'cargo(s)');
    console.log('[WizardCore] Available GES:', catalogos.riesgos?.length || 0);
    console.log('[WizardCore] Available categories:', catalogos.categorias?.length || 0);

    // Initialize RiesgoSelector for each cargo
    cargos.forEach((cargo, index) => {
      const container = this.container.querySelector(`#riesgo-selector-${index}`);
      if (!container) {
        console.warn(`[WizardCore] Container #riesgo-selector-${index} not found`);
        return;
      }

      // Destroy previous instance if exists
      if (this.riesgoSelectors[index]) {
        this.riesgoSelectors[index].destroy();
      }

      // Map GES data to include category info
      const gesWithCategories = (catalogos.riesgos || []).map(ges => ({
        ...ges,
        categoria: this.getCategoryName(ges.id_riesgo || ges.riesgo_id, catalogos.categorias)
      }));

      // Create new RiesgoSelector instance
      this.riesgoSelectors[index] = new RiesgoSelector(container, {
        cargoIndex: index,
        cargoNombre: cargo.nombre,
        sector: this.state.data.sector || null,
        catalogoGES: gesWithCategories,
        catalogoRiesgos: catalogos.categorias || [],
        seleccionados: cargo.gesSeleccionados || [],
        onChange: (gesArray) => this.handleGESChange(index, gesArray)
      });

      // 🆕 Listen for GES selection to trigger flying animation
      container.addEventListener('ges-selected', (e) => {
        const { cargoIndex, sourceElement } = e.detail;
        if (sourceElement) {
          this.animateGESToCargoTab(sourceElement, cargoIndex);
        }
      });

      console.log(`[WizardCore] ✅ RiesgoSelector #${index} initialized for cargo "${cargo.nombre}"`);
    });

    // Tab switching for multiple cargos
    const tabButtons = this.container.querySelectorAll('[data-action="switch-cargo-tab"]');
    tabButtons.forEach(btn => {
      // Click handler
      btn.addEventListener('click', (e) => {
        const cargoIndex = parseInt(e.currentTarget.dataset.cargoIndex);
        this.switchCargoTab(cargoIndex);
      });

      // P0-3: Keyboard navigation (Arrow keys, Home, End)
      btn.addEventListener('keydown', (e) => {
        this.handleTabKeydown(e, tabButtons);
      });

      // P1-1: Tooltips con floating-ui (hover)
      btn.addEventListener('mouseenter', (e) => {
        this.showCargoTooltip(e.currentTarget);
      });

      btn.addEventListener('mouseleave', () => {
        this.hideCargoTooltip();
      });
    });

    // P1-3: Setup scroll indicators (mobile)
    this.setupScrollIndicators();
  }

  /**
   * P0-3: Handle keyboard navigation for cargo tabs
   */
  handleTabKeydown(e, tabButtons) {
    const tabs = Array.from(tabButtons);
    const currentIndex = tabs.findIndex(tab => tab === e.target);
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      default:
        return; // Don't prevent default for other keys
    }

    e.preventDefault();
    tabs[newIndex].click();
    tabs[newIndex].focus();
  }

  /**
   * P1-3: Setup scroll indicators for cargo tabs (mobile)
   */
  setupScrollIndicators() {
    const wrapper = this.container.querySelector('.cargo-tabs-wrapper');
    const tabs = this.container.querySelector('.cargo-tabs');

    if (!tabs || !wrapper) return;

    const updateIndicators = () => {
      const hasScrollLeft = tabs.scrollLeft > 10;
      const hasScrollRight = tabs.scrollLeft < (tabs.scrollWidth - tabs.clientWidth - 10);

      wrapper.classList.toggle('has-scroll-left', hasScrollLeft);
      wrapper.classList.toggle('has-scroll-right', hasScrollRight);
    };

    tabs.addEventListener('scroll', updateIndicators);
    window.addEventListener('resize', updateIndicators);
    updateIndicators(); // Initial check
  }

  /**
   * Get category name by ID
   */
  getCategoryName(categoryId, categories) {
    if (!categories || !Array.isArray(categories)) return 'Sin categoría';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  }

  /**
   * Extract unique categories from GES array (legacy fallback)
   * @deprecated Use catalogos.categorias from API instead
   */
  getCategoriesFromGES(gesArray) {
    const categoriesMap = new Map();

    gesArray.forEach(ges => {
      const categoryId = ges.id_riesgo || ges.riesgo_id;
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: categoryId,
          nombre: ges.categoria || `Categoría ${categoryId}`
        });
      }
    });

    return Array.from(categoriesMap.values());
  }

  /**
   * Handle GES selection change for a cargo
   */
  handleGESChange(cargoIndex, gesArray) {
    const cargo = this.state.getCargo(cargoIndex);
    if (!cargo) return;

    // Map GES array to the expected format
    const mappedGES = gesArray.map(ges => ({
      idGes: ges.id,
      nombre: ges.nombre,
      categoria: ges.categoria || '',
      niveles: {
        ND: null,
        NE: null,
        NC: null,
        NP: null,
        NR: null
      },
      controles: {
        eliminacion: '',
        sustitucion: '',
        ingenieria: '',
        administrativos: '',
        epp: ''
      }
    }));

    // Update cargo with new GES selection
    // IMPORTANT: Save in both `ges` (for validation) and `gesSeleccionados` (for display)
    this.state.updateCargo(cargoIndex, {
      ...cargo,
      ges: mappedGES,  // For validation in WizardState
      gesSeleccionados: mappedGES  // For display in templates
    });

    console.log(`[WizardCore] Updated cargo ${cargoIndex} with ${gesArray.length} GES`);

    // 🆕 Trigger re-render of cargo cards to update counter
    this.updateCargoCards();
  }

  /**
   * Update cargo cards to reflect current state (without full re-render)
   */
  updateCargoCards() {
    const cargos = this.state.getCargos();

    // Update cargo cards in step 2 (cargos)
    const cargoCards = this.container.querySelectorAll('.cargo-card');
    cargoCards.forEach((card, index) => {
      const cargo = cargos[index];
      if (!cargo) return;

      // Update cargo name
      const nameElement = card.querySelector('.cargo-card-header h3');
      if (nameElement) {
        nameElement.textContent = cargo.nombre;
      }

      // Update cargo description
      const descriptionElement = card.querySelector('.cargo-card-body > p');
      if (descriptionElement) {
        descriptionElement.textContent = cargo.descripcion || 'Sin descripción';
      }

      // Update num personas
      const numPersonasSpan = card.querySelector('.cargo-meta span:first-child');
      if (numPersonasSpan) {
        numPersonasSpan.innerHTML = `<i class="fas fa-user"></i> ${cargo.numPersonas} persona${cargo.numPersonas !== 1 ? 's' : ''}`;
      }

      // Update risk counter
      const counterSpan = card.querySelector('.cargo-meta span:last-child');
      if (counterSpan) {
        const count = cargo.gesSeleccionados?.length || 0;
        counterSpan.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${count} riesgo${count !== 1 ? 's' : ''}`;
      }
    });

    // 🆕 Update cargo tabs in step 3 (riesgos)
    const riesgoTabs = this.container.querySelectorAll('.cargo-tabs .cargo-tab');
    riesgoTabs.forEach((tab, index) => {
      const cargo = cargos[index];
      if (!cargo) return;

      // Update cargo name
      const cargoName = tab.querySelector('.cargo-name');
      if (cargoName) {
        cargoName.textContent = cargo.cargoName || cargo.nombre || `Cargo ${index + 1}`;
      }

      // ✅ FIX P0: Usar el selector correcto (.cargo-count)
      const counterSpan = tab.querySelector('.cargo-count');
      if (counterSpan) {
        const count = cargo.gesSeleccionados?.length || cargo.ges?.length || 0;
        counterSpan.textContent = count;

        // Agregar animación de pulse para feedback visual
        counterSpan.classList.add('pulse-update');
        setTimeout(() => counterSpan.classList.remove('pulse-update'), 400);

        // Actualizar el atributo data para el checkmark verde
        tab.setAttribute('data-has-risks', count > 0 ? 'true' : 'false');
      }
    });

    // 🆕 Update cargo tabs in step 4 (niveles)
    const nivelesTabs = this.container.querySelectorAll('.niveles-cargo-tabs .niveles-cargo-tab');
    nivelesTabs.forEach((tab, index) => {
      const cargo = cargos[index];
      if (!cargo) return;

      // Update tab text (excluding counter span)
      const textNode = Array.from(tab.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
      if (textNode) {
        textNode.textContent = cargo.nombre;
      }

      const counterSpan = tab.querySelector('.cargo-tab__count');
      if (counterSpan) {
        const count = cargo.gesSeleccionados?.length || 0;
        counterSpan.textContent = `${count} GES`;
      }
    });

    // Update cargo items in step 6 (resumen)
    const cargoItems = this.container.querySelectorAll('.cargo-item');
    cargoItems.forEach((item, index) => {
      const cargo = cargos[index];
      if (!cargo) return;

      const counterSpan = item.querySelector('.cargo-stats span:last-child');
      if (counterSpan) {
        const count = cargo.gesSeleccionados?.length || 0;
        counterSpan.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${count} riesgo${count !== 1 ? 's' : ''}`;
      }
    });

    console.log('[WizardCore] Cargo cards and tabs updated');
  }

  /**
   * Switch cargo tab (for multiple cargos)
   */
  switchCargoTab(cargoIndex) {
    // Update tab buttons (P0-3: ARIA attributes)
    const tabButtons = this.container.querySelectorAll('.cargo-tab');
    tabButtons.forEach((btn, index) => {
      const isActive = index === cargoIndex;

      if (isActive) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('tabindex', '0');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('tabindex', '-1');
      }
    });

    // Show/hide selector containers
    const containers = this.container.querySelectorAll('.riesgo-selector-container');
    containers.forEach((container, index) => {
      container.style.display = index === cargoIndex ? '' : 'none';
    });
  }

  /**
   * P1-1: Get color for category (same as RiesgoSelector.js)
   */
  getCategoryColor(categoria) {
    const colors = {
      'Mecánico': '#3498db',
      'Eléctrico': '#f39c12',
      'Físico': '#9b59b6',
      'Químico': '#e74c3c',
      'Biológico': '#2ecc71',
      'Ergonómico': '#1abc9c',
      'Biomecánico': '#1abc9c',
      'Psicosocial': '#e67e22',
      'Factores Humanos': '#ffa726',
      'Locativo': '#34495e',
      'Natural': '#8e44ad',
      'Seguridad': '#c0392b',
      'Otros Riesgos': '#95a5a6',
      'Saneamiento Básico': '#16a085',
      'Salud Pública': '#27ae60',
      'Comunes': '#5dc4af'
    };
    return colors[categoria] || '#95a5a6';
  }

  /**
   * Attach listeners for Niveles step
   * ✅ Sprint 6: Agrega tooltips para cargo tabs
   */
  attachNivelesListeners() {
    const cargos = this.state.getCargos();

    // Initialize NivelesRiesgoForm for first cargo by default
    if (cargos.length > 0) {
      this.initializeNivelesForm(0);
    }

    // Tab switching for multiple cargos
    const tabButtons = this.container.querySelectorAll('[data-action="switch-cargo-niveles"]');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cargoIndex = parseInt(e.currentTarget.dataset.cargoIndex);
        this.switchCargoNivelesTab(cargoIndex);
      });

      // ✅ Sprint 6: Hover tooltip para mostrar GES del cargo
      btn.addEventListener('mouseenter', (e) => {
        this.showNivelesCargoTooltip(e.currentTarget);
      });

      btn.addEventListener('mouseleave', () => {
        this.hideNivelesCargoTooltip();
      });
    });
  }

  /**
   * ✅ Sprint 6: Mostrar tooltip con los GES del cargo y su estado
   */
  showNivelesCargoTooltip(tabButton) {
    const tooltip = document.getElementById('niveles-cargo-tooltip');
    if (!tooltip) return;

    const cargoIndex = parseInt(tabButton.dataset.cargoIndex);
    const cargo = this.state.getCargo(cargoIndex);
    if (!cargo) return;

    const gesArray = cargo.gesSeleccionados || cargo.ges || [];
    
    // Actualizar contenido del tooltip
    const titleEl = document.getElementById('tooltip-cargo-name');
    const statsEl = document.getElementById('tooltip-stats');
    const listEl = document.getElementById('tooltip-ges-list');
    
    if (titleEl) titleEl.textContent = cargo.nombre;
    
    // Contar completados
    const completed = gesArray.filter(ges => {
      const niveles = ges.niveles || {};
      return niveles.ND !== null && niveles.ND !== undefined &&
             niveles.NE !== null && niveles.NE !== undefined &&
             niveles.NC !== null && niveles.NC !== undefined;
    }).length;
    
    if (statsEl) statsEl.textContent = `${completed}/${gesArray.length}`;
    
    // Renderizar lista de GES
    if (listEl) {
      listEl.innerHTML = gesArray.map(ges => {
        const niveles = ges.niveles || {};
        const isComplete = niveles.ND !== null && niveles.ND !== undefined &&
                          niveles.NE !== null && niveles.NE !== undefined &&
                          niveles.NC !== null && niveles.NC !== undefined;
        
        const statusClass = isComplete ? 'completed' : 'pending';
        const statusIcon = isComplete ? 'fa-check' : 'fa-circle';
        
        // Determinar nivel de riesgo si está completo
        let levelBadge = '';
        if (isComplete && niveles.NR) {
          const nr = niveles.NR;
          let levelClass = 'risk-bajo';
          let levelText = 'IV';
          if (nr >= 600) { levelClass = 'risk-muy-alto'; levelText = 'I'; }
          else if (nr >= 150) { levelClass = 'risk-alto'; levelText = 'II'; }
          else if (nr >= 40) { levelClass = 'risk-medio'; levelText = 'III'; }
          levelBadge = `<span class="item-level ${levelClass}">${levelText}</span>`;
        }
        
        return `
          <li class="niveles-cargo-tooltip__item">
            <span class="item-status ${statusClass}">
              <i class="fas ${statusIcon}"></i>
            </span>
            <span class="item-name">${ges.nombre}</span>
            ${levelBadge}
          </li>
        `;
      }).join('');
    }
    
    // Posicionar y mostrar tooltip
    tooltip.classList.add('visible');
    
    // Usar Floating UI si está disponible
    if (typeof computePosition !== 'undefined') {
      computePosition(tabButton, tooltip, {
        placement: 'bottom',
        middleware: [offset(8), shift({ padding: 8 })]
      }).then(({ x, y }) => {
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      });
    } else {
      // Fallback: posicionar manualmente
      const rect = tabButton.getBoundingClientRect();
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;
    }
  }

  /**
   * ✅ Sprint 6: Ocultar tooltip
   */
  hideNivelesCargoTooltip() {
    const tooltip = document.getElementById('niveles-cargo-tooltip');
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }

  /**
   * Initialize NivelesRiesgoForm for a specific cargo
   * ✅ Sprint 6 FIX: Usar cache de forms por cargo para evitar errores de lit-html
   */
  initializeNivelesForm(cargoIndex) {
    console.log(`[WizardCore] initializeNivelesForm(${cargoIndex})`);
    
    // ✅ FIX: Obtener datos frescos del state
    const cargo = this.state.getCargo(cargoIndex);
    if (!cargo) {
      console.error(`[WizardCore] Cargo ${cargoIndex} no encontrado`);
      return;
    }

    const container = this.container.querySelector(`#niveles-container-${cargoIndex}`);
    if (!container) {
      console.error(`[WizardCore] Container niveles-container-${cargoIndex} no encontrado`);
      return;
    }

    // ✅ Sprint 6 FIX: Usar cache de forms por cargo
    // NO destruir el form anterior - cada cargo mantiene su propio form
    if (!this.nivelesFormCache) {
      this.nivelesFormCache = {};
    }

    // Si ya existe un form para este cargo, solo actualizarlo
    if (this.nivelesFormCache[cargoIndex]) {
      console.log(`[WizardCore] Reutilizando form existente para cargo ${cargoIndex}`);
      this.nivelesForm = this.nivelesFormCache[cargoIndex];
      // Actualizar datos si es necesario
      const gesArray = cargo.gesSeleccionados || cargo.ges || [];
      this.nivelesForm.updateGESArray(gesArray);
      return;
    }

    // ✅ FIX: Obtener gesSeleccionados directamente del state (datos frescos)
    const gesArray = cargo.gesSeleccionados || cargo.ges || [];
    
    console.log(`[WizardCore] Creando nuevo NivelesForm para cargo "${cargo.nombre}" con ${gesArray.length} GES`);

    // Create new NivelesRiesgoForm instance
    const newForm = new NivelesRiesgoForm(container, {
      cargoIndex: cargoIndex,
      cargoNombre: cargo.nombre,
      gesArray: gesArray,
      state: this.state,
      onChange: (data) => this.handleNivelesChange(cargoIndex, data),
      onComplete: () => this.handleNivelesComplete(cargoIndex)
    });

    // ✅ Guardar en cache y asignar como form actual
    this.nivelesFormCache[cargoIndex] = newForm;
    this.nivelesForm = newForm;
  }

  /**
   * Handle niveles change for a cargo
   * ✅ Sprint 6 FIX: Actualiza los indicadores de los cargo tabs
   */
  handleNivelesChange(cargoIndex, data) {
    if (data.action === 'update-niveles') {
      // State is already updated via WizardState.updateGESNiveles()
      console.log(`[WizardCore] Niveles updated for cargo ${cargoIndex}, GES ${data.gesIndex}`);
      
      // ✅ Sprint 6 FIX: Actualizar indicadores de cargo tabs
      this.updateNivelesCargoTabIndicators();
    } else if (data.action === 'go-back') {
      // User wants to go back to riesgos selection
      this.state.setCurrentStep('riesgos');
    }
  }

  /**
   * ✅ Sprint 6: Actualizar indicadores X/Y de los cargo tabs
   */
  updateNivelesCargoTabIndicators() {
    const cargos = this.state.getCargos();
    const tabButtons = this.container.querySelectorAll('.niveles-cargo-tab');
    
    tabButtons.forEach((btn, index) => {
      if (index >= cargos.length) return;
      
      const cargo = cargos[index];
      const gesArray = cargo.gesSeleccionados || cargo.ges || [];
      
      // Contar GES completados
      const gesCompleted = gesArray.filter(ges => {
        const niveles = ges.niveles || {};
        return niveles.ND !== null && niveles.ND !== undefined &&
               niveles.NE !== null && niveles.NE !== undefined &&
               niveles.NC !== null && niveles.NC !== undefined;
      }).length;
      
      const isComplete = gesArray.length > 0 && gesCompleted === gesArray.length;
      
      // Actualizar contador
      const countEl = btn.querySelector('.cargo-tab__count');
      if (countEl) {
        countEl.textContent = `${gesCompleted}/${gesArray.length}`;
      }
      
      // Actualizar icono de estado
      const statusIcon = btn.querySelector('.cargo-status-icon');
      if (statusIcon) {
        if (isComplete) {
          statusIcon.classList.remove('fa-circle');
          statusIcon.classList.add('fa-check-circle', 'completed');
        } else {
          statusIcon.classList.remove('fa-check-circle', 'completed');
          statusIcon.classList.add('fa-circle');
        }
      }
      
      // Actualizar clase del tab
      if (isComplete) {
        btn.classList.add('completed');
      } else {
        btn.classList.remove('completed');
      }
    });
  }

  /**
   * Handle niveles completion
   * ✅ Sprint 6: Verifica si hay más cargos pendientes
   */
  handleNivelesComplete(currentCargoIndex = 0) {
    console.log(`[WizardCore] handleNivelesComplete for cargo ${currentCargoIndex}`);
    
    const cargos = this.state.getCargos();
    
    // Buscar el siguiente cargo con GES pendientes
    let nextPendingCargoIndex = -1;
    
    for (let i = currentCargoIndex + 1; i < cargos.length; i++) {
      const cargo = cargos[i];
      const gesArray = cargo.gesSeleccionados || cargo.ges || [];
      
      if (gesArray.length > 0) {
        // Verificar si tiene GES sin completar
        const hasIncomplete = gesArray.some(ges => {
          const niveles = ges.niveles || {};
          return niveles.ND === null || niveles.ND === undefined ||
                 niveles.NE === null || niveles.NE === undefined ||
                 niveles.NC === null || niveles.NC === undefined;
        });
        
        if (hasIncomplete) {
          nextPendingCargoIndex = i;
          break;
        }
      }
    }
    
    if (nextPendingCargoIndex !== -1) {
      // Hay más cargos pendientes, cambiar al siguiente
      console.log(`[WizardCore] Switching to next pending cargo: ${nextPendingCargoIndex}`);
      this.switchCargoNivelesTab(nextPendingCargoIndex);
    } else {
      // Todos los cargos completos, avanzar al siguiente paso
      console.log('[WizardCore] All cargos completed, proceeding to next step');
      this.handleNext('niveles');
    }
  }

  /**
   * Switch cargo tab in niveles step (for multiple cargos)
   * ✅ Sprint 6 FIX: Siempre reinicializa el form al cambiar de tab
   */
  switchCargoNivelesTab(cargoIndex) {
    console.log(`[WizardCore] switchCargoNivelesTab(${cargoIndex})`);
    
    // Update tab buttons
    const tabButtons = this.container.querySelectorAll('.niveles-cargo-tab');
    tabButtons.forEach((btn, index) => {
      if (index === cargoIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Show/hide containers
    const containers = this.container.querySelectorAll('.niveles-cargo-container');
    containers.forEach((container, index) => {
      container.style.display = index === cargoIndex ? '' : 'none';
    });

    // ✅ FIX: Siempre reinicializar el form para obtener datos frescos
    // Usar setTimeout para asegurar que el DOM esté listo
    setTimeout(() => {
      this.initializeNivelesForm(cargoIndex);
    }, 0);
  }

  // ==================== NAVIGATION HANDLERS ====================

  /**
   * Handle back button
   */
  handleBack() {
    const currentIndex = this.steps.findIndex(s => s.id === this.state.getCurrentStep());
    if (currentIndex > 0) {
      const previousStep = this.steps[currentIndex - 1];
      this.state.setCurrentStep(previousStep.id);
    }
  }

  /**
   * Migrar datos antiguos de niveles al nuevo formato
   * Convierte { ND: 10, NE: 4, NC: 100 } → { ND: 10, NE: 4, NC: 100, deficiencia: {value: 10}, exposicion: {value: 4}, consecuencia: {value: 100} }
   */
  migrateNivelesData() {
    const cargos = this.state.getCargos();
    let migrated = false;

    cargos.forEach((cargo, cargoIndex) => {
      if (!cargo.ges) return;

      cargo.ges.forEach((ges, gesIndex) => {
        const niveles = ges.niveles;
        if (!niveles) return;

        // Verificar si necesita migración (tiene ND pero no tiene deficiencia)
        if (niveles.ND !== null && niveles.ND !== undefined && !niveles.deficiencia) {
          console.log(`[WizardCore] Migrando niveles para cargo ${cargoIndex}, GES ${gesIndex}:`, ges.nombre);

          // Agregar formato WizardState
          niveles.deficiencia = { value: niveles.ND };
          niveles.exposicion = { value: niveles.NE };
          niveles.consecuencia = { value: niveles.NC };

          migrated = true;
        }
      });
    });

    if (migrated) {
      console.log('[WizardCore] Datos de niveles migrados, guardando...');
      this.state.notify(); // Trigger save to localStorage
    }
  }

  /**
   * Handle next button
   */
  async handleNext(currentStep) {
    // ✅ MIGRAR datos antiguos de niveles antes de validar
    if (currentStep === 'niveles') {
      this.migrateNivelesData();
    }

    // Validate current step
    const errors = this.state.validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      console.error('[WizardCore] Validation errors:', errors);
      this.showValidationErrors(errors);
      return;
    }

    // 🆕 P0-2: Validación especial para paso de riesgos
    if (currentStep === 'riesgos') {
      const canProceed = await this.validateRiesgosStep();
      if (!canProceed) {
        return; // User canceled or needs to add more risks
      }
    }

    // If last step, show registration modal (collects password) then submit
    if (currentStep === 'resumen') {
      this.handleGenerarDocumentos();
      return;
    }

    // 🆕 LAZY LOADING: Preload GES details before leaving riesgos step
    if (currentStep === 'riesgos') {
      await this.preloadGESDetails();
    }

    // Go to next step
    const currentIndex = this.steps.findIndex(s => s.id === currentStep);
    if (currentIndex < this.steps.length - 1) {
      const nextStep = this.steps[currentIndex + 1];
      this.state.setCurrentStep(nextStep.id);
    }
  }

  /**
   * 🆕 P0-2: Validación especial para paso de riesgos con UX mejorado
   */
  async validateRiesgosStep() {
    const cargos = this.state.getCargos();

    // Contar riesgos por cargo
    const riesgosStats = cargos.map(cargo => ({
      nombre: cargo.nombre,
      count: cargo.ges?.length || 0
    }));

    const totalRiesgos = riesgosStats.reduce((sum, stat) => sum + stat.count, 0);

    // 🔥 Error crítico: No hay riesgos seleccionados
    if (totalRiesgos === 0) {
      await createConfirmModal({
        title: 'Debes seleccionar al menos un riesgo',
        message: `
          <div style="text-align: left; line-height: 1.6;">
            <p>No has seleccionado ningún riesgo para los cargos de tu empresa.</p>
            <p><strong>¿Por qué es importante?</strong></p>
            <ul style="margin-left: 1.5rem;">
              <li>La matriz de riesgos es requerida por la normativa SST colombiana</li>
              <li>Te ayuda a identificar y controlar peligros en el lugar de trabajo</li>
              <li>Es necesaria para generar el profesiograma y perfil de cargo</li>
            </ul>
          </div>
        `,
        confirmText: 'Entendido, seleccionaré riesgos',
        showCancelButton: false,
        type: 'error',
        icon: 'fa-exclamation-triangle'
      });
      return false;
    }

    // ⚠️ Warning: Pocos riesgos (< 3 por cargo en promedio)
    const avgRiesgosPorCargo = totalRiesgos / cargos.length;
    if (avgRiesgosPorCargo < 3) {
      const cargosSinRiesgos = riesgosStats
        .filter(stat => stat.count === 0)
        .map(stat => stat.nombre);

      const cargosConPocosRiesgos = riesgosStats
        .filter(stat => stat.count > 0 && stat.count < 3)
        .map(stat => `${stat.nombre} (${stat.count} ${stat.count === 1 ? 'riesgo' : 'riesgos'})`);

      let warningMessage = '<div style="text-align: left; line-height: 1.6;">';
      warningMessage += `<p>Has seleccionado <strong>${totalRiesgos} ${totalRiesgos === 1 ? 'riesgo' : 'riesgos'}</strong> en total.</p>`;

      if (cargosSinRiesgos.length > 0) {
        warningMessage += '<p><strong>Cargos sin riesgos:</strong></p>';
        warningMessage += '<ul style="margin-left: 1.5rem;">';
        cargosSinRiesgos.forEach(nombre => {
          warningMessage += `<li>${nombre}</li>`;
        });
        warningMessage += '</ul>';
      }

      if (cargosConPocosRiesgos.length > 0) {
        warningMessage += '<p><strong>Cargos con pocos riesgos:</strong></p>';
        warningMessage += '<ul style="margin-left: 1.5rem;">';
        cargosConPocosRiesgos.forEach(info => {
          warningMessage += `<li>${info}</li>`;
        });
        warningMessage += '</ul>';
      }

      warningMessage += '<p>Se recomienda seleccionar al menos <strong>3-5 riesgos por cargo</strong> para una evaluación completa.</p>';
      warningMessage += '</div>';

      const confirmed = await createConfirmModal({
        title: '¿Continuar con esta selección?',
        message: warningMessage,
        confirmText: 'Sí, continuar de todas formas',
        cancelText: 'Volver a revisar riesgos',
        type: 'warning',
        icon: 'fa-exclamation-circle'
      });

      return confirmed;
    }

    // Todo bien, permitir avanzar
    return true;
  }

  /**
   * Preload GES details for all selected items across all cargos
   * Called before advancing from riesgos to niveles step
   */
  async preloadGESDetails() {
    console.log('[WizardCore] 🔄 Precargando detalles de GES seleccionados...');

    const startTime = performance.now();
    const nextBtn = this.container.querySelector('[data-action="next"]');
    const originalHTML = nextBtn ? nextBtn.innerHTML : '';

    try {
      // Show loading state on button
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando detalles...';
      }

      // Collect all preload promises from all cargo selectors
      const preloadPromises = Object.values(this.riesgoSelectors)
        .filter(selector => selector && typeof selector.preloadSelectedDetails === 'function')
        .map(selector => selector.preloadSelectedDetails());

      if (preloadPromises.length === 0) {
        console.log('[WizardCore] No hay selectores activos para precargar');
        return;
      }

      // Wait for all preloads to complete
      await Promise.all(preloadPromises);

      const duration = Math.round(performance.now() - startTime);
      console.log(`[WizardCore] ✅ Precarga completada en ${duration}ms`);

    } catch (error) {
      console.error('[WizardCore] ❌ Error en precarga de detalles:', error);
      // Don't throw - continue anyway, details will be fetched on-demand if needed
    } finally {
      // Restore button state
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.innerHTML = originalHTML;
      }
    }
  }

  /**
   * Show validation errors
   */
  showValidationErrors(errors) {
    const errorMessages = Object.values(errors).join('<br>');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'wizard-error';
    errorDiv.innerHTML = `
      <div class="error-content">
        <strong>Por favor corrige los siguientes errores:</strong>
        <p>${errorMessages}</p>
      </div>
    `;

    // Remove existing errors
    const existingError = this.container.querySelector('.wizard-error');
    if (existingError) {
      existingError.remove();
    }

    this.container.appendChild(errorDiv);

    // Auto-hide after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // ==================== CARGO HANDLERS ====================

  /**
   * Show add cargo modal
   */
  showAddCargoModal() {
    const modal = this.container.querySelector('#modal-add-cargo');
    if (modal) {
      // Guardar el elemento que tenía focus antes de abrir el modal
      this.previousFocusedElement = document.activeElement;

      modal.style.display = 'flex';
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'modal-title-cargo');

      // Guardar estado inicial del formulario para detectar cambios
      this.initialCargoFormState = this.getCargoFormState();

      // Focus en el primer input del modal
      const firstInput = modal.querySelector('#cargo-nombre');
      if (firstInput) {
        // Delay para que el modal esté visible
        requestAnimationFrame(() => {
          firstInput.focus();
        });
      }

      // Agregar focus trap
      this.setupModalFocusTrap(modal);

      // Agregar Escape key handler
      this.modalEscapeHandler = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.hideAddCargoModal();
        }
      };
      document.addEventListener('keydown', this.modalEscapeHandler);
    }
  }

  /**
   * Setup focus trap for modal
   * @param {HTMLElement} modal - Modal element
   */
  setupModalFocusTrap(modal) {
    // Get all focusable elements within modal
    const focusableSelectors = [
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.modalFocusTrapHandler = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(modal.querySelectorAll(focusableSelectors));
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab (backwards)
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (forwards)
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener('keydown', this.modalFocusTrapHandler);
  }

  /**
   * Get current cargo form state
   */
  getCargoFormState() {
    return {
      nombre: this.container.querySelector('#cargo-nombre')?.value || '',
      descripcion: this.container.querySelector('#cargo-descripcion')?.value || '',
      numPersonas: this.container.querySelector('#cargo-num-personas')?.value || '1',
      area: this.container.querySelector('#cargo-area')?.value || '',
      zona: this.container.querySelector('#cargo-zona')?.value || '',
      tareasRutinarias: this.container.querySelector('#cargo-tareasRutinarias')?.checked || false,
      manipulaAlimentos: this.container.querySelector('#cargo-manipulaAlimentos')?.checked || false,
      trabajaAlturas: this.container.querySelector('#cargo-trabajaAlturas')?.checked || false,
      trabajaEspaciosConfinados: this.container.querySelector('#cargo-trabajaEspaciosConfinados')?.checked || false,
      conduceVehiculo: this.container.querySelector('#cargo-conduceVehiculo')?.checked || false
    };
  }

  /**
   * Check if cargo form has unsaved changes
   */
  hasCargoFormChanges() {
    if (!this.initialCargoFormState) return false;

    const currentState = this.getCargoFormState();

    // Comparar cada campo
    return (
      currentState.nombre !== this.initialCargoFormState.nombre ||
      currentState.descripcion !== this.initialCargoFormState.descripcion ||
      currentState.numPersonas !== this.initialCargoFormState.numPersonas ||
      currentState.tareasRutinarias !== this.initialCargoFormState.tareasRutinarias ||
      currentState.manipulaAlimentos !== this.initialCargoFormState.manipulaAlimentos ||
      currentState.trabajaAlturas !== this.initialCargoFormState.trabajaAlturas ||
      currentState.trabajaEspaciosConfinados !== this.initialCargoFormState.trabajaEspaciosConfinados ||
      currentState.conduceVehiculo !== this.initialCargoFormState.conduceVehiculo
    );
  }

  /**
   * Hide add cargo modal
   * @param {boolean} skipConfirmation - Si es true, no pregunta confirmación (ej: cuando se guardó exitosamente)
   */
  hideAddCargoModal(skipConfirmation = false) {
    // Verificar si hay cambios sin guardar (solo si NO se skipea confirmación)
    if (!skipConfirmation && this.hasCargoFormChanges()) {
      // Mostrar confirmación hermosa en lugar de confirm()
      createConfirmModal({
        title: 'Cambios sin guardar',
        message: '¿Deseas salir sin guardar este cargo?',
        confirmText: 'Salir sin Guardar',
        cancelText: 'Continuar Editando',
        type: 'warning',
        onConfirm: () => {
          // Usuario confirma salir
          this.forceCloseAddCargoModal();
        },
        onCancel: () => {
          // Usuario cancela, no cerrar el modal (no hacer nada)
        }
      });
      return;
    }

    // Si llegamos aquí, no hay cambios o se skipeo confirmación
    this.forceCloseAddCargoModal();
  }

  /**
   * Force close add cargo modal without confirmation
   * (Used internally when user already confirmed)
   */
  forceCloseAddCargoModal() {
    const modal = this.container.querySelector('#modal-add-cargo');
    if (modal) {
      modal.style.display = 'none';
      modal.removeAttribute('aria-modal');
      modal.removeAttribute('role');
      modal.removeAttribute('aria-labelledby');

      // Remover Escape key handler
      if (this.modalEscapeHandler) {
        document.removeEventListener('keydown', this.modalEscapeHandler);
        this.modalEscapeHandler = null;
      }

      // Remover focus trap
      if (this.modalFocusTrapHandler) {
        modal.removeEventListener('keydown', this.modalFocusTrapHandler);
        this.modalFocusTrapHandler = null;
      }

      // Restaurar focus al elemento anterior
      if (this.previousFocusedElement && this.previousFocusedElement.focus) {
        this.previousFocusedElement.focus();
        this.previousFocusedElement = null;
      }

      // Clear inputs
      this.container.querySelector('#cargo-nombre').value = '';
      this.container.querySelector('#cargo-descripcion').value = '';
      this.container.querySelector('#cargo-num-personas').value = '1';
      this.container.querySelector('#cargo-area').value = '';
      this.container.querySelector('#cargo-zona').value = '';

      // Clear toggles
      this.container.querySelector('#cargo-tareasRutinarias').checked = false;
      this.container.querySelector('#cargo-manipulaAlimentos').checked = false;
      this.container.querySelector('#cargo-trabajaAlturas').checked = false;
      this.container.querySelector('#cargo-trabajaEspaciosConfinados').checked = false;
      this.container.querySelector('#cargo-conduceVehiculo').checked = false;

      // Limpiar estado inicial
      this.initialCargoFormState = null;
    }
  }

  /**
   * Handle save cargo
   */
  handleSaveCargo() {
    const nombre = this.container.querySelector('#cargo-nombre').value.trim();
    const descripcion = this.container.querySelector('#cargo-descripcion').value.trim();
    const numPersonas = parseInt(this.container.querySelector('#cargo-num-personas').value);
    const area = this.container.querySelector('#cargo-area').value.trim();
    const zona = this.container.querySelector('#cargo-zona').value.trim();

    // Get toggle values
    const tareasRutinarias = this.container.querySelector('#cargo-tareasRutinarias')?.checked || false;
    const manipulaAlimentos = this.container.querySelector('#cargo-manipulaAlimentos')?.checked || false;
    const trabajaAlturas = this.container.querySelector('#cargo-trabajaAlturas')?.checked || false;
    const trabajaEspaciosConfinados = this.container.querySelector('#cargo-trabajaEspaciosConfinados')?.checked || false;
    const conduceVehiculo = this.container.querySelector('#cargo-conduceVehiculo')?.checked || false;

    if (!nombre || numPersonas < 1 || !area || !zona) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Guardar estado ANTES de agregar cargo
    const wasFirstCargo = this.state.getCargos().length === 0;

    this.state.addCargo({
      nombre,
      descripcion,
      numPersonas,
      area,
      zona,
      // Características especiales
      tareasRutinarias,
      manipulaAlimentos,
      trabajaAlturas,
      trabajaEspaciosConfinados,
      conduceVehiculo
    });

    // Cerrar modal SIN confirmación porque ya se guardó exitosamente
    this.hideAddCargoModal(true);

    // Si era el primer cargo, triggear animación bounce del FAB
    if (wasFirstCargo) {
      // Force re-render
      this.forceRender();

      // Esperar a que el DOM se actualice completamente
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.triggerFABBounce();
        });
      });
    } else {
      // Si no era el primer cargo, solo re-renderizar normalmente
      this.forceRender();
    }
  }

  /**
   * Handle remove cargo
   */
  handleRemoveCargo(index) {
    const cargo = this.state.getCargo(index);
    if (confirm(`¿Estás seguro de eliminar el cargo "${cargo.nombre}"?`)) {
      this.state.removeCargo(index);

      // Force re-render since we removed a cargo (cargos is now self-managed)
      this.forceRender();
    }
  }

  /**
   * Handle edit cargo
   * Opens the CargoEditor popover
   */
  handleEditCargo(buttonElement, index) {
    console.log('[WizardCore] Opening edit popover for cargo:', index);

    // Show edit popover using CargoEditor
    this.cargoEditor.showEditPopover(buttonElement, index, (updatedIndex) => {
      // Callback after successful save
      console.log('[WizardCore] Cargo updated successfully:', updatedIndex);

      // ✅ Update cargo cards surgically (no full re-render)
      // This is safe because CargoEditor calls this callback AFTER the popover closes,
      // so there's no DOM mutation while the popover is open
      this.updateCargoCards();
    });
  }

  /**
   * Trigger bounce animation on FAB
   * Called after first cargo is added to draw attention
   */
  triggerFABBounce() {
    const fab = this.container.querySelector('.fab');
    if (!fab) {
      console.warn('[WizardCore] FAB not found for bounce animation');
      return;
    }

    console.log('[WizardCore] ✨ Triggering FAB bounce animation');

    // Remover clase hidden si existe
    fab.classList.remove('fab--hidden');

    // Añadir clase de animación bounce
    fab.classList.add('fab--bounce-in');

    // Remover clase después de que termine la animación (800ms)
    setTimeout(() => {
      fab.classList.remove('fab--bounce-in');
      console.log('[WizardCore] ✓ FAB bounce animation completed');
    }, 800);
  }

  // ==================== SUBMIT ====================

  /**
   * Handle final submission
   */
  async handleSubmit() {
    console.log('[WizardCore] Submitting wizard...');

    try {
      // Show loading state
      this.showLoading('Generando documentos...');

      // Export data for backend
      const submissionData = this.state.exportForSubmission();

      // Submit to backend (async API)
      const response = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('[WizardCore] Submission successful:', result);

      // Clear wizard state
      this.state.clearStorage();

      // Redirect to results page with token
      window.location.href = `/pages/resultados.html?token=${result.token}`;

    } catch (error) {
      console.error('[WizardCore] Submission error:', error);
      this.showError('Error al generar documentos. Por favor intenta de nuevo.');
    }
  }

  /**
   * Show loading overlay
   */
  showLoading(message) {
    const loading = document.createElement('div');
    loading.className = 'wizard-loading-overlay';
    loading.innerHTML = `
      <div class="wizard-loading">
        <div class="wizard-loading__spinner"></div>
        <p class="wizard-loading__text">${message}</p>
      </div>
    `;
    document.body.appendChild(loading);
  }

  /**
   * Show error message
   */
  showError(message) {
    alert(message); // TODO: Replace with better UI
  }

  // ========================================
  // CARGO TOOLTIP CON FLOATING-UI
  // ========================================

  /**
   * Show cargo tooltip with selected risks
   * @param {HTMLElement} tabElement - The cargo tab button
   */
  async showCargoTooltip(tabElement) {
    // Remove any existing tooltip
    this.hideCargoTooltip();

    const cargoIndex = parseInt(tabElement.dataset.cargoIndex);
    const cargoName = tabElement.dataset.cargoName;
    const cargos = this.state.getCargos();
    const cargo = cargos[cargoIndex];

    if (!cargo) return;

    // Get selected GES/risks
    const selectedGES = cargo.gesSeleccionados || cargo.ges || [];
    
    if (selectedGES.length === 0) {
      // Don't show tooltip if no risks selected
      return;
    }

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'cargo-tooltip';
    tooltip.id = 'cargo-tooltip-floating';
    tooltip.setAttribute('role', 'tooltip');

    // Build content
    const riesgosList = selectedGES.map(ges => {
      const gesName = typeof ges === 'string' ? ges : (ges.nombre || ges.name || 'GES');
      const riesgoType = typeof ges === 'object' ? (ges.categoria || ges.riesgo || '') : '';
      return `
        <li class="cargo-tooltip__item">
          <i class="fas fa-shield-alt"></i>
          <span>${gesName}</span>
          ${riesgoType ? `<small>${riesgoType}</small>` : ''}
        </li>
      `;
    }).join('');

    tooltip.innerHTML = `
      <div class="cargo-tooltip__header">
        <i class="fas fa-briefcase"></i>
        <span>${cargoName}</span>
      </div>
      <div class="cargo-tooltip__divider"></div>
      <div class="cargo-tooltip__body">
        <p class="cargo-tooltip__label">Riesgos Seleccionados (${selectedGES.length})</p>
        <ul class="cargo-tooltip__list">
          ${riesgosList}
        </ul>
      </div>
    `;

    document.body.appendChild(tooltip);

    // Position with Floating-UI
    try {
      const { computePosition, flip, shift, offset } = await import('@floating-ui/dom');
      
      const { x, y } = await computePosition(tabElement, tooltip, {
        placement: 'bottom',
        middleware: [
          offset(10),
          flip(),
          shift({ padding: 8 })
        ]
      });

      Object.assign(tooltip.style, {
        left: `${x}px`,
        top: `${y}px`
      });

      // Animate in
      requestAnimationFrame(() => {
        tooltip.classList.add('visible');
      });
    } catch (error) {
      console.warn('[WizardCore] Error positioning tooltip:', error);
      // Fallback positioning
      const rect = tabElement.getBoundingClientRect();
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.bottom + 10}px`;
      tooltip.classList.add('visible');
    }
  }

  /**
   * Hide cargo tooltip
   */
  hideCargoTooltip() {
    const tooltip = document.getElementById('cargo-tooltip-floating');
    if (tooltip) {
      tooltip.classList.remove('visible');
      setTimeout(() => {
        tooltip.remove();
      }, 200);
    }
  }

  // ========================================
  // GES SELECTION ANIMATION
  // ========================================

  /**
   * Animate GES flying to cargo tab
   * Called when a GES is selected
   * @param {HTMLElement} gesElement - The GES item being selected
   * @param {number} cargoIndex - Index of the target cargo
   */
  animateGESToCargoTab(gesElement, cargoIndex) {
    const cargoTab = this.container.querySelector(`[data-cargo-index="${cargoIndex}"]`);
    if (!cargoTab || !gesElement) return;

    // Get positions
    const gesRect = gesElement.getBoundingClientRect();
    const tabRect = cargoTab.getBoundingClientRect();

    // Create flying element
    const flyingGES = document.createElement('div');
    flyingGES.className = 'ges-flying';
    flyingGES.innerHTML = '<i class="fas fa-shield-alt"></i>';
    
    // Initial position
    Object.assign(flyingGES.style, {
      position: 'fixed',
      left: `${gesRect.left + gesRect.width / 2}px`,
      top: `${gesRect.top + gesRect.height / 2}px`,
      zIndex: '10000'
    });

    document.body.appendChild(flyingGES);

    // Calculate target position (center of cargo tab counter)
    const targetX = tabRect.left + tabRect.width - 25;
    const targetY = tabRect.top + tabRect.height / 2;

    // Animate
    requestAnimationFrame(() => {
      flyingGES.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      flyingGES.style.left = `${targetX}px`;
      flyingGES.style.top = `${targetY}px`;
      flyingGES.style.transform = 'scale(0.3)';
      flyingGES.style.opacity = '0.5';
    });

    // Pulse the cargo tab counter
    setTimeout(() => {
      const counter = cargoTab.querySelector('.cargo-count');
      if (counter) {
        counter.classList.add('pulse-animation');
        setTimeout(() => {
          counter.classList.remove('pulse-animation');
        }, 600);
      }
    }, 400);

    // Remove flying element
    setTimeout(() => {
      flyingGES.remove();
    }, 600);
  }
}
