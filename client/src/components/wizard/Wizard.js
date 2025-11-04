/**
 * Wizard.js - Motor de Wizard Reutilizable
 *
 * Sistema conversacional step-by-step estilo Typeform
 */

import { html, render } from 'lit-html';

export class Wizard {
  constructor(steps, options = {}) {
    this.steps = steps;
    this.currentStep = 0;
    this.data = {};
    this.history = []; // Para funcionalidad "back"

    this.options = {
      container: options.container || document.body,
      onComplete: options.onComplete || (() => {}),
      onStepChange: options.onStepChange || (() => {}),
      enableKeyboardNavigation: options.enableKeyboardNavigation !== false,
      showProgress: options.showProgress !== false,
      autoFocus: options.autoFocus !== false,
      animationDuration: options.animationDuration || 400,
      ...options
    };

    this.isTransitioning = false;
    this.keyboardHandler = null;
  }

  /**
   * Inicializar el wizard
   */
  init() {
    this.render();

    if (this.options.enableKeyboardNavigation) {
      this.setupKeyboardNavigation();
    }

    // Ejecutar onEnter del primer paso
    const firstStep = this.steps[0];
    if (firstStep.onEnter) {
      firstStep.onEnter.call(this, this.data);
    }
  }

  /**
   * Ir al siguiente paso
   */
  async next() {
    console.log('next() called, isTransitioning:', this.isTransitioning);
    if (this.isTransitioning) return;

    const currentStepConfig = this.steps[this.currentStep];
    console.log('Processing step:', currentStepConfig.id);

    // Obtener datos del paso actual
    const stepData = await this.getCurrentStepData();

    // Validar
    const validation = await this.validateCurrentStep(stepData);

    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }

    // Guardar datos
    this.data[currentStepConfig.id] = stepData;

    // Guardar en historial
    this.history.push(this.currentStep);
    console.log('📚 Added to history. Current step:', this.currentStep, 'History:', this.history);

    // Ir al siguiente paso
    this.currentStep++;
    console.log('➡️ Moving to step:', this.currentStep);

    // Si llegamos al final, completar wizard
    if (this.currentStep >= this.steps.length) {
      await this.complete();
      return;
    }

    // Notificar cambio
    this.options.onStepChange(this.currentStep, this.steps[this.currentStep]);

    // Ejecutar onEnter del nuevo paso
    const nextStep = this.steps[this.currentStep];
    if (nextStep.onEnter) {
      await nextStep.onEnter.call(this, this.data);
    }

    // Re-render con animación
    await this.renderWithAnimation('forward');
  }

  /**
   * Volver al paso anterior
   */
  async back() {
    console.log('⬅️ back() called, isTransitioning:', this.isTransitioning, 'history length:', this.history.length, 'history:', this.history);
    if (this.isTransitioning || this.history.length === 0) {
      console.log('❌ Cannot go back. isTransitioning:', this.isTransitioning, 'history empty:', this.history.length === 0);
      return;
    }

    // Restaurar paso anterior del historial
    this.currentStep = this.history.pop();
    console.log('Going back to step:', this.currentStep);

    // Notificar cambio
    this.options.onStepChange(this.currentStep, this.steps[this.currentStep]);

    // Ejecutar onEnter del paso al que regresamos (igual que en next())
    const backStep = this.steps[this.currentStep];
    if (backStep.onEnter) {
      await backStep.onEnter.call(this, this.data);
    }

    // Re-render con animación
    await this.renderWithAnimation('backward');
  }

  /**
   * Ir a un paso específico
   */
  async goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length || stepIndex === this.currentStep) {
      return;
    }

    const direction = stepIndex > this.currentStep ? 'forward' : 'backward';

    // Si vamos hacia adelante, validar pasos intermedios
    if (direction === 'forward') {
      for (let i = this.currentStep; i < stepIndex; i++) {
        const stepData = await this.getStepData(i);
        const validation = await this.validateStep(i, stepData);

        if (!validation.isValid) {
          console.warn(`Cannot skip to step ${stepIndex}: validation failed at step ${i}`);
          return;
        }
      }
    }

    this.currentStep = stepIndex;
    this.options.onStepChange(this.currentStep, this.steps[this.currentStep]);

    await this.renderWithAnimation(direction);
  }

  /**
   * Completar wizard
   */
  async complete() {
    try {
      this.isTransitioning = true;

      // Mostrar loading
      this.renderLoadingState();

      // Ejecutar callback de completación
      await this.options.onComplete(this.data);
    } catch (error) {
      console.error('Error completing wizard:', error);
      this.showError('Ocurrió un error al procesar sus datos. Por favor intente nuevamente.');
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Obtener datos del paso actual
   */
  async getCurrentStepData() {
    const step = this.steps[this.currentStep];

    if (step.getData && typeof step.getData === 'function') {
      return await step.getData();
    }

    // Por defecto, recolectar datos de inputs
    const container = this.options.container;
    const inputs = container.querySelectorAll('input, textarea, select');
    const data = {};

    inputs.forEach(input => {
      if (input.name) {
        if (input.type === 'checkbox') {
          data[input.name] = input.checked;
        } else if (input.type === 'radio') {
          if (input.checked) {
            data[input.name] = input.value;
          }
        } else {
          data[input.name] = input.value;
        }
      }
    });

    return data;
  }

  /**
   * Obtener datos de un paso específico
   */
  async getStepData(stepIndex) {
    const step = this.steps[stepIndex];
    return this.data[step.id] || {};
  }

  /**
   * Validar paso actual
   */
  async validateCurrentStep(data) {
    const step = this.steps[this.currentStep];

    if (step.validate && typeof step.validate === 'function') {
      return await step.validate(data);
    }

    // Validación por defecto: campos requeridos
    const errors = [];
    const container = this.options.container;
    const requiredInputs = container.querySelectorAll('[required]');

    requiredInputs.forEach(input => {
      if (!input.value || (input.type === 'checkbox' && !input.checked)) {
        errors.push({
          field: input.name || 'unknown',
          message: 'Este campo es requerido'
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar un paso específico
   */
  async validateStep(stepIndex, data) {
    const step = this.steps[stepIndex];

    if (step.validate) {
      return await step.validate(data);
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Renderizar wizard
   */
  render() {
    const step = this.steps[this.currentStep];
    const progress = ((this.currentStep + 1) / this.steps.length) * 100;

    console.log('Rendering step:', step.id, 'with data:', this.data[step.id]);

    const template = html`
      <div class="wizard-container" role="dialog" aria-labelledby="wizard-title">
        ${this.options.showProgress ? this.renderProgress(progress) : ''}

        <div class="wizard-content" role="main">
          <div class="wizard-step" data-step="${this.currentStep}">
            ${step.render ? step.render(this.data[step.id] || {}) : ''}
          </div>
        </div>

        <div class="wizard-actions" role="navigation">
          ${this.currentStep > 0 ? html`
            <button
              type="button"
              class="wizard-btn wizard-btn-back"
              @click=${() => this.back()}
              ?disabled=${this.isTransitioning}
            >
              ← Atrás
            </button>
          ` : ''}

          <button
            type="button"
            class="wizard-btn wizard-btn-next"
            @click=${() => this.next()}
            ?disabled=${this.isTransitioning}
          >
            ${this.currentStep === this.steps.length - 1 ? 'Finalizar' : 'Siguiente'} →
          </button>
        </div>

        <div class="wizard-error" style="display: none;"></div>
      </div>
    `;

    render(template, this.options.container);

    // Vincular event handlers manualmente (lit-html a veces pierde eventos después de animaciones)
    this.bindEventHandlers();

    // Auto-focus en el primer input
    if (this.options.autoFocus) {
      setTimeout(() => {
        const firstInput = this.options.container.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }

  /**
   * Vincular event handlers manualmente a los botones
   */
  bindEventHandlers() {
    const nextBtn = this.options.container.querySelector('.wizard-btn-next');
    const backBtn = this.options.container.querySelector('.wizard-btn-back');

    if (nextBtn) {
      // Remover listeners previos para evitar duplicados
      nextBtn.replaceWith(nextBtn.cloneNode(true));
      const newNextBtn = this.options.container.querySelector('.wizard-btn-next');

      newNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Next button clicked (manual handler)');
        this.next();
      });
    }

    if (backBtn) {
      backBtn.replaceWith(backBtn.cloneNode(true));
      const newBackBtn = this.options.container.querySelector('.wizard-btn-back');

      newBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Back button clicked (manual handler)');
        this.back();
      });
    }
  }

  /**
   * Renderizar con animación
   */
  async renderWithAnimation(direction) {
    console.log('Starting animation:', direction);
    this.isTransitioning = true;

    const container = this.options.container;
    const content = container.querySelector('.wizard-content');

    if (!content) {
      console.log('No content found, rendering directly');
      this.render();
      this.isTransitioning = false;
      return;
    }

    // Limpiar clases de animación previas
    content.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
    console.log('Cleaned previous animation classes');

    // Animación de salida
    const exitClass = direction === 'forward' ? 'slide-out-left' : 'slide-out-right';
    content.classList.add(exitClass);
    console.log('Added exit animation:', exitClass);

    await new Promise(resolve => setTimeout(resolve, this.options.animationDuration / 2));

    // Render nuevo contenido
    console.log('Rendering new content');
    this.render();

    // Animación de entrada
    const newContent = container.querySelector('.wizard-content');
    if (!newContent) {
      console.error('ERROR: wizard-content not found after render!');
      this.isTransitioning = false;
      return;
    }

    // Asegurar que no haya clases de animación previas
    newContent.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');

    const entryClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';
    newContent.classList.add(entryClass);
    console.log('Added entry animation:', entryClass);

    await new Promise(resolve => setTimeout(resolve, this.options.animationDuration / 2));

    newContent.classList.remove('slide-in-right', 'slide-in-left');
    console.log('Animation complete, classes removed');

    this.isTransitioning = false;
  }

  /**
   * Renderizar barra de progreso
   */
  renderProgress(progress) {
    return html`
      <div class="wizard-progress" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
        <div class="wizard-progress-bar" style="width: ${progress}%"></div>
        <div class="wizard-progress-steps">
          ${this.steps.map((step, index) => html`
            <div
              class="wizard-progress-step ${index === this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}"
              @click=${() => index < this.currentStep && this.goToStep(index)}
              role="button"
              tabindex="${index < this.currentStep ? 0 : -1}"
              title="${step.title || `Paso ${index + 1}`}"
            >
              ${index < this.currentStep ? html`<span>✓</span>` : html`<span>${index + 1}</span>`}
            </div>
          `)}
        </div>
      </div>
    `;
  }

  /**
   * Renderizar estado de carga
   */
  renderLoadingState() {
    const template = html`
      <div class="wizard-loading">
        <div class="wizard-spinner"></div>
        <p>Procesando sus datos...</p>
      </div>
    `;

    render(template, this.options.container);
  }

  /**
   * Mostrar errores de validación
   */
  showValidationErrors(errors) {
    const errorContainer = this.options.container.querySelector('.wizard-error');

    if (!errorContainer || errors.length === 0) return;

    const errorMessages = errors.map(err => `• ${err.message}`).join('<br>');

    errorContainer.innerHTML = `
      <div class="error-content">
        <strong>Por favor corrija los siguientes errores:</strong><br>
        ${errorMessages}
      </div>
    `;

    errorContainer.style.display = 'block';

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      errorContainer.style.display = 'none';
    }, 5000);

    // Scroll al error
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Mostrar error general
   */
  showError(message) {
    this.showValidationErrors([{ message }]);
  }

  /**
   * Configurar navegación por teclado
   */
  setupKeyboardNavigation() {
    this.keyboardHandler = (e) => {
      // Enter = Siguiente
      if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.next();
      }

      // Escape = Atrás
      if (e.key === 'Escape' && this.currentStep > 0) {
        e.preventDefault();
        this.back();
      }
    };

    document.addEventListener('keydown', this.keyboardHandler);
  }

  /**
   * Destruir wizard y limpiar event listeners
   */
  destroy() {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
    }

    this.options.container.innerHTML = '';
  }

  /**
   * Obtener estado actual del wizard
   */
  getState() {
    return {
      currentStep: this.currentStep,
      data: { ...this.data },
      progress: ((this.currentStep + 1) / this.steps.length) * 100,
      canGoBack: this.history.length > 0,
      canGoNext: this.currentStep < this.steps.length - 1
    };
  }

  /**
   * Establecer datos del wizard (para restaurar sesión)
   */
  setState(state) {
    if (state.data) {
      this.data = { ...state.data };
    }

    if (typeof state.currentStep === 'number') {
      this.currentStep = Math.min(state.currentStep, this.steps.length - 1);
    }

    this.render();
  }
}
