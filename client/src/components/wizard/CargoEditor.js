/**
 * CargoEditor.js - Popover de edición de cargos usando Floating UI
 *
 * Permite editar:
 * - Nombre del cargo
 * - Número de trabajadores
 * - Descripción
 *
 * Valida:
 * - Nombre único
 * - Nombre mínimo 3 caracteres
 * - Número de trabajadores >= 1
 */

import { createPopover } from '../../js/utils/floatingUI.js';
import { createConfirmModal, showToast } from '../../js/utils/wizardModal.js';

export class CargoEditor {
  constructor(state) {
    this.state = state;
    this.currentPopover = null;
    this.currentCargoIndex = null;
  }

  /**
   * Show edit popover for a cargo
   * @param {HTMLElement} referenceElement - The button/element that triggered the edit
   * @param {number} cargoIndex - Index of cargo in state
   * @param {Function} onSave - Callback after successful save
   */
  showEditPopover(referenceElement, cargoIndex, onSave) {
    console.log('[CargoEditor] showEditPopover called', { referenceElement, cargoIndex });

    // Close any existing popover and wait for cleanup
    if (this.currentPopover) {
      console.log('[CargoEditor] Closing existing popover');
      this.currentPopover.hide();
      this.currentPopover.destroy();
      this.currentPopover = null;
      this.currentCargoIndex = null;
    }

    this.currentCargoIndex = cargoIndex;
    const cargo = this.state.getCargo(cargoIndex);

    if (!cargo) {
      console.error('[CargoEditor] Cargo not found:', cargoIndex);
      return;
    }

    console.log('[CargoEditor] Creating popover for cargo:', cargo);

    // Create popover content
    const content = this.createPopoverContent(cargo, cargoIndex);

    // Create popover
    console.log('[CargoEditor] Creating popover with Floating UI...');
    this.currentPopover = createPopover(referenceElement, content, {
      placement: 'bottom',
      offset: 8,
      closeOnClickOutside: false, // We'll handle close manually
      closeOnEscape: true
    });

    // Add variant class to the popover wrapper (created by floatingUI)
    this.currentPopover.element.classList.add('floating-popover--cargo-edit');

    console.log('[CargoEditor] Showing popover...');
    // Show popover
    this.currentPopover.show();

    console.log('[CargoEditor] Popover shown, element:', this.currentPopover.element);
    console.log('[CargoEditor] Popover in DOM:', document.body.contains(this.currentPopover.element));

    // Attach event listeners
    this.attachEventListeners(cargoIndex, onSave);

    // Focus first input
    setTimeout(() => {
      const firstInput = this.currentPopover.element.querySelector('#edit-cargo-nombre');
      if (firstInput) {
        console.log('[CargoEditor] Focusing first input');
        firstInput.focus();
      } else {
        console.error('[CargoEditor] First input not found!');
      }
    }, 100);
  }

  /**
   * Create popover HTML content
   */
  createPopoverContent(cargo, cargoIndex) {
    const container = document.createElement('div');

    // Configuración de toggles con metadata (iconos, severity, hints)
    const togglesConfig = [
      {
        name: 'tareasRutinarias',
        icon: 'fa-repeat',
        label: 'Tareas repetitivas',
        severity: 'warning',
        hint: 'Puede requerir pausas activas y rotación de tareas'
      },
      {
        name: 'conduceVehiculo',
        icon: 'fa-car',
        label: 'Conduce vehículo',
        severity: 'warning',
        hint: 'Requiere licencia de conducción vigente'
      },
      {
        name: 'manipulaAlimentos',
        icon: 'fa-utensils',
        label: 'Manipula alimentos',
        severity: 'danger',
        hint: 'Requiere certificado de manipulación de alimentos vigente'
      },
      {
        name: 'trabajaAlturas',
        icon: 'fa-arrow-up',
        label: 'Trabaja en alturas',
        severity: 'danger',
        hint: 'Requiere certificado de trabajo en alturas y EPP especializado'
      },
      {
        name: 'trabajaEspaciosConfinados',
        icon: 'fa-door-closed',
        label: 'Espacios confinados',
        severity: 'danger',
        hint: 'Requiere permiso de trabajo y monitor de gases continuo'
      }
    ];

    // Generar HTML de toggles modernos
    const togglesHTML = togglesConfig.map(toggle => `
      <div class="toggle-group toggle-group--${toggle.severity}">
        <div class="toggle-header">
          <div class="toggle-label-wrapper">
            <i class="fas ${toggle.icon} toggle-icon toggle-icon--${toggle.severity}"></i>
            <span class="toggle-label">${toggle.label}</span>
          </div>
          <div class="wizard-switch wizard-switch--${toggle.severity}">
            <input
              type="checkbox"
              name="${toggle.name}"
              id="edit-cargo-${toggle.name}"
              ${cargo[toggle.name] ? 'checked' : ''}
            />
            <span class="slider"></span>
          </div>
        </div>
        <div class="toggle-hint">
          <i class="fas fa-info-circle"></i>
          ${toggle.hint}
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="floating-popover__header">
        <h3>Editar Cargo</h3>
        <div class="floating-popover__header-actions">
          <button type="button" class="btn btn--primary btn--compact" data-action="save-edit">
            <i class="fas fa-save"></i> Guardar
          </button>
          <button class="floating-popover__close" data-action="close-edit">
            &times;
          </button>
        </div>
      </div>
      <div class="floating-popover__body floating-popover__body--two-cols">
        <form id="edit-cargo-form" class="cargo-edit-form">
          <!-- Columna Izquierda: Información Básica -->
          <div class="floating-popover__col floating-popover__col--basic">
            <div class="form-group">
              <label for="edit-cargo-nombre">
                Nombre del Cargo <span class="required">*</span>
              </label>
              <input
                type="text"
                id="edit-cargo-nombre"
                name="nombre"
                class="form-input"
                value="${cargo.nombre}"
                placeholder="Ej: Operario de Producción"
                required
                minlength="3"
                maxlength="100"
              />
              <span class="error-message" id="error-nombre"></span>
            </div>

            <div class="form-group">
              <label for="edit-cargo-numPersonas">
                Número de Trabajadores <span class="required">*</span>
              </label>
              <input
                type="number"
                id="edit-cargo-numPersonas"
                name="numPersonas"
                class="form-input"
                value="${cargo.numPersonas}"
                min="1"
                max="9999"
                required
              />
              <span class="error-message" id="error-numPersonas"></span>
            </div>

            <div class="form-group">
              <label for="edit-cargo-area">
                Área en la empresa <span class="required">*</span>
              </label>
              <input
                type="text"
                id="edit-cargo-area"
                name="area"
                class="form-input"
                value="${cargo.area || ''}"
                placeholder="Ej: Producción, Administración, Ventas"
                required
                maxlength="100"
              />
              <span class="error-message" id="error-area"></span>
            </div>

            <div class="form-group">
              <label for="edit-cargo-zona">
                Zona o lugar <span class="required">*</span>
              </label>
              <input
                type="text"
                id="edit-cargo-zona"
                name="zona"
                class="form-input"
                value="${cargo.zona || ''}"
                placeholder="Ej: Planta 1, Oficina central, Bodega 3"
                required
                maxlength="100"
              />
              <span class="error-message" id="error-zona"></span>
            </div>

            <div class="form-group">
              <label for="edit-cargo-descripcion">
                Descripción (opcional)
              </label>
              <textarea
                id="edit-cargo-descripcion"
                name="descripcion"
                class="form-input"
                placeholder="Descripción breve de las funciones del cargo..."
                rows="4"
                maxlength="500"
              >${cargo.descripcion || ''}</textarea>
              <span class="form-hint">${(cargo.descripcion || '').length}/500 caracteres</span>
            </div>
          </div>

          <!-- Columna Derecha: Características Especiales -->
          <div class="floating-popover__col floating-popover__col--toggles">
            <div class="form-group">
              <label class="form-label-section">
                <i class="fas fa-shield-alt"></i>
                Características especiales
              </label>
              <div class="toggles-grid-modern">
                ${togglesHTML}
              </div>
            </div>
          </div>
        </form>
      </div>
    `;

    return container;
  }

  /**
   * Attach event listeners to popover elements
   */
  attachEventListeners(cargoIndex, onSave) {
    const popover = this.currentPopover.element;

    // Close button
    const closeBtn = popover.querySelector('[data-action="close-edit"]');
    closeBtn.addEventListener('click', () => this.closePopover());

    // Save button
    const saveBtn = popover.querySelector('[data-action="save-edit"]');
    saveBtn.addEventListener('click', () => this.handleSave(cargoIndex, onSave));

    // Character counter for descripcion
    const descripcionInput = popover.querySelector('#edit-cargo-descripcion');
    const hint = popover.querySelector('.form-hint');
    descripcionInput.addEventListener('input', (e) => {
      hint.textContent = `${e.target.value.length}/500 caracteres`;
    });

    // Real-time validation
    const nombreInput = popover.querySelector('#edit-cargo-nombre');
    nombreInput.addEventListener('input', () => this.validateField('nombre', cargoIndex));

    const numPersonasInput = popover.querySelector('#edit-cargo-numPersonas');
    numPersonasInput.addEventListener('input', () => this.validateField('numPersonas', cargoIndex));

    const areaInput = popover.querySelector('#edit-cargo-area');
    areaInput.addEventListener('input', () => this.validateField('area', cargoIndex));

    const zonaInput = popover.querySelector('#edit-cargo-zona');
    zonaInput.addEventListener('input', () => this.validateField('zona', cargoIndex));

    // Enter key to save (except in textarea)
    popover.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        saveBtn.click();
      }
    });
  }

  /**
   * Validate a single field
   */
  validateField(fieldName, cargoIndex) {
    const popover = this.currentPopover.element;
    const input = popover.querySelector(`#edit-cargo-${fieldName}`);
    const errorSpan = popover.querySelector(`#error-${fieldName}`);

    if (!input || !errorSpan) return true;

    const value = input.value.trim();
    let error = '';

    if (fieldName === 'nombre') {
      if (value.length < 3) {
        error = 'El nombre debe tener al menos 3 caracteres';
      } else if (!this.state.isCargoNameUnique(value, cargoIndex)) {
        error = 'Ya existe un cargo con ese nombre';
      }
    } else if (fieldName === 'numPersonas') {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        error = 'Debe haber al menos 1 persona';
      }
    } else if (fieldName === 'area') {
      if (value.length < 2) {
        error = 'El área debe tener al menos 2 caracteres';
      }
    } else if (fieldName === 'zona') {
      if (value.length < 2) {
        error = 'La zona debe tener al menos 2 caracteres';
      }
    }

    // Show/hide error
    if (error) {
      errorSpan.textContent = error;
      errorSpan.style.display = 'block';
      input.classList.add('input-error');
      return false;
    } else {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
      input.classList.remove('input-error');
      return true;
    }
  }

  /**
   * Validate all fields
   */
  validateForm(cargoIndex) {
    const nombreValid = this.validateField('nombre', cargoIndex);
    const numPersonasValid = this.validateField('numPersonas', cargoIndex);
    const areaValid = this.validateField('area', cargoIndex);
    const zonaValid = this.validateField('zona', cargoIndex);

    return nombreValid && numPersonasValid && areaValid && zonaValid;
  }

  /**
   * Handle save button click
   */
  async handleSave(cargoIndex, onSave) {
    // Validate form
    if (!this.validateForm(cargoIndex)) {
      console.log('[CargoEditor] Validation failed');
      return;
    }

    const popover = this.currentPopover.element;
    const saveBtn = popover.querySelector('[data-action="save-edit"]');

    // Disable button while saving
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    try {
      // Get form values
      const nombre = popover.querySelector('#edit-cargo-nombre').value.trim();
      const numPersonas = parseInt(popover.querySelector('#edit-cargo-numPersonas').value, 10);
      const area = popover.querySelector('#edit-cargo-area').value.trim();
      const zona = popover.querySelector('#edit-cargo-zona').value.trim();
      const descripcion = popover.querySelector('#edit-cargo-descripcion').value.trim();

      // Get toggle values
      const tareasRutinarias = popover.querySelector('#edit-cargo-tareasRutinarias').checked;
      const manipulaAlimentos = popover.querySelector('#edit-cargo-manipulaAlimentos').checked;
      const trabajaAlturas = popover.querySelector('#edit-cargo-trabajaAlturas').checked;
      const trabajaEspaciosConfinados = popover.querySelector('#edit-cargo-trabajaEspaciosConfinados').checked;
      const conduceVehiculo = popover.querySelector('#edit-cargo-conduceVehiculo').checked;

      // Update cargo in state
      const result = this.state.updateCargo(cargoIndex, {
        nombre,
        numPersonas,
        area,
        zona,
        descripcion,
        tareasRutinarias,
        manipulaAlimentos,
        trabajaAlturas,
        trabajaEspaciosConfinados,
        conduceVehiculo
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('[CargoEditor] Cargo updated successfully', {
        nombre,
        numPersonas,
        descripcion,
        tareasRutinarias,
        manipulaAlimentos,
        trabajaAlturas,
        trabajaEspaciosConfinados,
        conduceVehiculo
      });

      // Show success feedback IN the button
      const originalHTML = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i class="fas fa-check"></i> Guardado';
      saveBtn.classList.add('btn--success');
      saveBtn.disabled = true;

      // Close popover after short delay
      setTimeout(() => {
        // Reset button before closing to prevent visual glitch
        saveBtn.innerHTML = originalHTML;
        saveBtn.classList.remove('btn--success');
        saveBtn.disabled = false;

        this.closePopover();

        // Call onSave callback AFTER popover closes to prevent re-render during animation
        setTimeout(() => {
          if (onSave) onSave(cargoIndex);
        }, 50);
      }, 800);

    } catch (error) {
      console.error('[CargoEditor] Error saving cargo:', error);

      // Show error with beautiful toast
      showToast({
        message: `Error al guardar: ${error.message}`,
        type: 'danger',
        duration: 5000
      });

      // Re-enable button
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar';
    }
  }

  /**
   * Close popover
   */
  closePopover() {
    if (this.currentPopover) {
      // First hide to trigger animation
      this.currentPopover.hide();

      // Wait for animation to complete, then destroy
      setTimeout(() => {
        if (this.currentPopover) {
          this.currentPopover.destroy();
          this.currentPopover = null;
          this.currentCargoIndex = null;
        }
      }, 250); // Slightly longer than hide animation (200ms)
    }
  }

  /**
   * Destroy editor (cleanup)
   */
  destroy() {
    this.closePopover();
  }
}
