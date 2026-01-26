/**
 * CargoMiniWizard.js - Mini Wizard para Crear/Editar Cargos
 *
 * Sprint 6 - Fase L: Dashboard Premium
 *
 * Características:
 * - Modal/Ventana emergente para crear o editar cargos
 * - Misma lógica y campos que el wizard de riesgos completo
 * - Sistema de aprobación para cambios en niveles/controles
 * - Estética del dashboard premium (design tokens)
 *
 * Pasos del Mini-Wizard:
 * 1. Información básica del cargo
 * 2. Selección de riesgos/GES
 * 3. Niveles de riesgo (ND, NE, NP, NC, NR) - CON APROBACIÓN
 * 4. Controles existentes - CON APROBACIÓN
 * 5. Resumen y confirmación
 */

import { html, render } from 'lit-html';

export class CargoMiniWizard {
  constructor(options = {}) {
    this.options = {
      mode: options.mode || 'create', // 'create' | 'edit'
      cargoId: options.cargoId || null,
      cargoData: options.cargoData || null,
      empresaId: options.empresaId || null,
      onSave: options.onSave || (() => {}),
      onCancel: options.onCancel || (() => {}),
      ...options
    };

    // Estado del wizard
    this.state = {
      currentStep: 0,
      totalSteps: 5,
      loading: false,
      error: null,

      // Datos del cargo
      cargo: {
        nombre: '',
        area: '',
        zona: '',
        descripcion: '',
        numPersonas: 1,
        tareasRutinarias: false,
        trabajaAlturas: false,
        manipulaAlimentos: false,
        conduceVehiculo: false,
        trabajaEspaciosConfinados: false,
        riesgosSeleccionados: [],
        niveles: {},
        controles: {}
      },

      // Para aprobación
      pendingApprovals: [],
      originalNiveles: {},
      originalControles: {},

      // Catálogos
      catalogoGES: [],
      catalogoRiesgos: [],
      existingAreas: [],
      existingZonas: []
    };

    // Steps definition
    this.steps = [
      { id: 'info', title: 'Información Básica', icon: 'user' },
      { id: 'riesgos', title: 'Selección de Riesgos', icon: 'alert-triangle' },
      { id: 'niveles', title: 'Niveles de Riesgo', icon: 'sliders' },
      { id: 'controles', title: 'Controles', icon: 'shield' },
      { id: 'resumen', title: 'Resumen', icon: 'check-circle' }
    ];

    // Niveles GTC-45
    this.niveles = {
      ND: [
        { value: 1, label: 'Bajo / N/A', color: '#10b981' },
        { value: 2, label: 'Medio', color: '#84cc16' },
        { value: 6, label: 'Alto', color: '#f59e0b' },
        { value: 10, label: 'Muy Alto', color: '#ef4444' }
      ],
      NE: [
        { value: 1, label: 'Esporádica', color: '#10b981' },
        { value: 2, label: 'Ocasional', color: '#84cc16' },
        { value: 3, label: 'Frecuente', color: '#f59e0b' },
        { value: 4, label: 'Continua', color: '#ef4444' }
      ],
      NC: [
        { value: 10, label: 'Leve', color: '#10b981' },
        { value: 25, label: 'Grave', color: '#f59e0b' },
        { value: 60, label: 'Muy Grave', color: '#f97316' },
        { value: 100, label: 'Mortal', color: '#ef4444' }
      ]
    };

    this.modalElement = null;
    this._initPromise = this.init();
  }

  /**
   * Initialize wizard
   */
  async init() {
    // Si es modo edición, cargar datos del cargo
    if (this.options.mode === 'edit' && this.options.cargoData) {
      this.loadCargoData(this.options.cargoData);
    }

    // Cargar catálogos
    await this.loadCatalogos();
  }

  /**
   * Load cargo data for edit mode
   */
  loadCargoData(data) {
    const riesgosSeleccionados = data.gesSeleccionados || data.riesgos || data.riesgosSeleccionados || [];

    // Reconstruir niveles y controles desde gesSeleccionados
    const nivelesFromGES = {};
    const controlesFromGES = {};
    riesgosSeleccionados.forEach(ges => {
      const gesId = String(ges.id_ges || ges.idGes || ges.id);
      if (!gesId || gesId === 'undefined' || gesId === 'null') return;

      // Extraer niveles (Number() para asegurar comparación estricta con botones)
      if (ges.niveles) {
        nivelesFromGES[gesId] = {
          ND: Number(ges.niveles.deficiencia?.value ?? ges.niveles.deficiencia) || 1,
          NE: Number(ges.niveles.exposicion?.value ?? ges.niveles.exposicion) || 1,
          NC: Number(ges.niveles.consecuencia?.value ?? ges.niveles.consecuencia) || 10
        };
      } else {
        nivelesFromGES[gesId] = { ND: 1, NE: 1, NC: 10 };
      }

      // Extraer controles
      if (ges.controles) {
        controlesFromGES[gesId] = {
          fuente: ges.controles.fuente || '',
          medio: ges.controles.medio || '',
          individuo: ges.controles.individuo || ''
        };
      } else {
        controlesFromGES[gesId] = { fuente: '', medio: '', individuo: '' };
      }
    });

    // Usar niveles/controles del data si tienen contenido, sino los reconstruidos desde GES
    const niveles = Object.keys(data.niveles || {}).length > 0 ? data.niveles : nivelesFromGES;
    const controles = Object.keys(data.controles || {}).length > 0 ? data.controles : controlesFromGES;

    this.state.cargo = {
      ...this.state.cargo,
      nombre: data.nombre || data.nombre_cargo || '',
      area: data.area || '',
      zona: data.zona || '',
      descripcion: data.descripcion || data.descripcion_tareas || data.descripcionTareas || '',
      numPersonas: data.numPersonas || data.num_trabajadores || 1,
      tareasRutinarias: data.tareasRutinarias || data.tareas_rutinarias || false,
      trabajaAlturas: data.trabajaAlturas || data.trabaja_alturas || false,
      manipulaAlimentos: data.manipulaAlimentos || data.manipula_alimentos || false,
      conduceVehiculo: data.conduceVehiculo || data.conduce_vehiculo || false,
      trabajaEspaciosConfinados: data.trabajaEspaciosConfinados || data.trabaja_espacios_confinados || false,
      riesgosSeleccionados,
      niveles,
      controles
    };

    // Guardar valores originales para detectar cambios que requieren aprobación
    this.state.originalNiveles = JSON.parse(JSON.stringify(this.state.cargo.niveles));
    this.state.originalControles = JSON.parse(JSON.stringify(this.state.cargo.controles));
  }

  /**
   * Load GES and Riesgos catalogs, and existing areas/zonas
   */
  async loadCatalogos() {
    try {
      // Load ALL GES catalog (paginated - API max 100 per page)
      let allGES = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const gesResponse = await fetch(`/api/catalogo/ges?limit=100&page=${page}`);
        if (!gesResponse.ok) break;
        const gesData = await gesResponse.json();
        const items = gesData.data || [];
        allGES = allGES.concat(items);
        hasMore = gesData.hasMore === true;
        page++;
      }
      this.state.catalogoGES = allGES;

      // Load existing areas and zonas from empresa's cargos
      if (this.options.empresaId) {
        const token = localStorage.getItem('authToken') || localStorage.getItem('genesys_token');
        const cargosResponse = await fetch(`/api/cargos/empresa/${this.options.empresaId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (cargosResponse.ok) {
          const cargosData = await cargosResponse.json();
          const cargos = cargosData.cargos || [];

          // Extract unique areas and zonas
          this.state.existingAreas = [...new Set(cargos.map(c => c.area).filter(Boolean))];
          this.state.existingZonas = [...new Set(cargos.map(c => c.zona).filter(Boolean))];
        }
      }
    } catch (error) {
      console.error('[CargoMiniWizard] Error loading catalogs:', error);
    }
  }

  /**
   * Show the modal wizard
   */
  async show() {
    // Wait for catalogs to load before showing
    await this._initPromise;

    // Create modal backdrop
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'cargo-mini-wizard-overlay';
    this.modalElement.innerHTML = `
      <div class="cargo-mini-wizard-modal">
        <div class="cargo-mini-wizard-content" id="cargo-mini-wizard-content">
        </div>
      </div>
    `;

    document.body.appendChild(this.modalElement);
    document.body.style.overflow = 'hidden';

    // Render content (catalogs are now loaded)
    this.renderContent();

    // Close on backdrop click
    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.handleCancel();
      }
    });

    // Close on Escape
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.handleCancel();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  /**
   * Hide and destroy modal
   */
  hide() {
    if (this.modalElement) {
      document.body.removeChild(this.modalElement);
      document.body.style.overflow = '';
      this.modalElement = null;
    }
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
  }

  /**
   * Render modal content
   */
  renderContent() {
    const container = document.getElementById('cargo-mini-wizard-content');
    if (!container) return;

    const template = html`
      <!-- Header -->
      <div class="mini-wizard__header">
        <div class="mini-wizard__header-left">
          <h2 class="mini-wizard__title">
            ${this.options.mode === 'edit' ? 'Editar Cargo' : 'Nuevo Cargo'}
          </h2>
          <p class="mini-wizard__subtitle">
            ${this.steps[this.state.currentStep].title}
          </p>
        </div>
        <button class="mini-wizard__close" @click=${() => this.handleCancel()}>
          <i data-lucide="x"></i>
        </button>
      </div>

      <!-- Progress Steps -->
      <div class="mini-wizard__progress">
        ${this.steps.map((step, index) => html`
          <div class="mini-wizard__step ${index === this.state.currentStep ? 'active' : ''} ${index < this.state.currentStep ? 'completed' : ''}">
            <div class="mini-wizard__step-icon">
              <i data-lucide="${step.icon}"></i>
            </div>
            <span class="mini-wizard__step-label">${step.title}</span>
          </div>
        `)}
      </div>

      <!-- Content -->
      <div class="mini-wizard__body">
        ${this.renderCurrentStep()}
      </div>

      <!-- Footer -->
      <div class="mini-wizard__footer">
        <div class="mini-wizard__footer-left">
          ${this.state.currentStep > 0 ? html`
            <button class="btn btn--outline" @click=${() => this.goToPreviousStep()}>
              <i data-lucide="arrow-left"></i>
              Anterior
            </button>
          ` : ''}
        </div>
        <div class="mini-wizard__footer-right">
          <button class="btn btn--ghost" @click=${() => this.handleCancel()}>
            Cancelar
          </button>
          ${this.state.currentStep < this.state.totalSteps - 1 ? html`
            <button class="btn btn--primary" @click=${() => this.goToNextStep()}>
              Siguiente
              <i data-lucide="arrow-right"></i>
            </button>
          ` : html`
            <button class="btn btn--primary" @click=${() => this.handleSave()}>
              <i data-lucide="save"></i>
              ${this.options.mode === 'edit' ? 'Guardar Cambios' : 'Crear Cargo'}
            </button>
          `}
        </div>
      </div>
    `;

    render(template, container);

    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Render current step content
   */
  renderCurrentStep() {
    switch (this.state.currentStep) {
      case 0:
        return this.renderInfoStep();
      case 1:
        return this.renderRiesgosStep();
      case 2:
        return this.renderNivelesStep();
      case 3:
        return this.renderControlesStep();
      case 4:
        return this.renderResumenStep();
      default:
        return html`<p>Paso no encontrado</p>`;
    }
  }

  /**
   * Step 1: Información básica del cargo
   */
  renderInfoStep() {
    const cargo = this.state.cargo;

    const toggles = [
      { name: 'tareasRutinarias', label: 'Tareas repetitivas', icon: 'repeat', severity: 'warning' },
      { name: 'conduceVehiculo', label: 'Conduce vehículo', icon: 'car', severity: 'warning' },
      { name: 'manipulaAlimentos', label: 'Manipula alimentos', icon: 'utensils', severity: 'danger' },
      { name: 'trabajaAlturas', label: 'Trabaja en alturas', icon: 'arrow-up', severity: 'danger' },
      { name: 'trabajaEspaciosConfinados', label: 'Espacios confinados', icon: 'door-closed', severity: 'danger' }
    ];

    return html`
      <div class="mini-wizard__step-content">
        <div class="mini-wizard__form-grid">
          <!-- Columna izquierda: Campos básicos -->
          <div class="mini-wizard__form-col">
            <div class="form-group">
              <label class="form-label">Nombre del Cargo <span class="required">*</span></label>
              <input
                type="text"
                class="form-input"
                .value=${cargo.nombre}
                @input=${(e) => this.updateCargo('nombre', e.target.value)}
                placeholder="Ej: Operario de Producción"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Área <span class="required">*</span></label>
              <input
                type="text"
                class="form-input"
                list="areas-list"
                .value=${cargo.area}
                @input=${(e) => this.updateCargo('area', e.target.value)}
                placeholder="Ej: Producción, Administración"
              />
              <datalist id="areas-list">
                ${this.state.existingAreas.map(area => html`<option value="${area}">`)}
              </datalist>
            </div>

            <div class="form-group">
              <label class="form-label">Zona o Lugar <span class="required">*</span></label>
              <input
                type="text"
                class="form-input"
                list="zonas-list"
                .value=${cargo.zona}
                @input=${(e) => this.updateCargo('zona', e.target.value)}
                placeholder="Ej: Planta 1, Oficina central"
              />
              <datalist id="zonas-list">
                ${this.state.existingZonas.map(zona => html`<option value="${zona}">`)}
              </datalist>
            </div>

            <div class="form-group">
              <label class="form-label">Número de Trabajadores <span class="required">*</span></label>
              <input
                type="number"
                class="form-input"
                .value=${cargo.numPersonas}
                @input=${(e) => this.updateCargo('numPersonas', parseInt(e.target.value) || 1)}
                min="1"
                max="9999"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea
                class="form-input form-textarea"
                .value=${cargo.descripcion}
                @input=${(e) => this.updateCargo('descripcion', e.target.value)}
                placeholder="Descripción de las funciones del cargo..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Columna derecha: Toggles especiales -->
          <div class="mini-wizard__form-col">
            <label class="form-label form-label--section">
              <i data-lucide="shield"></i>
              Características Especiales
            </label>
            <div class="toggles-grid">
              ${toggles.map(toggle => html`
                <div class="toggle-item toggle-item--${toggle.severity}">
                  <div class="toggle-item__info">
                    <i data-lucide="${toggle.icon}" class="toggle-item__icon"></i>
                    <span class="toggle-item__label">${toggle.label}</span>
                  </div>
                  <label class="toggle-switch toggle-switch--${toggle.severity}">
                    <input
                      type="checkbox"
                      .checked=${cargo[toggle.name]}
                      @change=${(e) => this.updateCargo(toggle.name, e.target.checked)}
                    />
                    <span class="toggle-switch__slider"></span>
                  </label>
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Step 2: Selección de riesgos/GES
   */
  renderRiesgosStep() {
    // Agrupar GES por categoría de riesgo
    const gesGrouped = this.state.catalogoGES.reduce((acc, ges) => {
      const cat = ges.riesgo_nombre || ges.categoria || ges.riesgo || 'Otros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ges);
      return acc;
    }, {});

    const selectedIds = this.state.cargo.riesgosSeleccionados
      .map(r => String(r.id_ges || r.idGes || r.id))
      .filter(v => v && v !== 'undefined' && v !== 'null');
    const selectedNames = this.state.cargo.riesgosSeleccionados
      .map(r => (r.nombre || r.ges || r.descripcion || '').toLowerCase().trim())
      .filter(Boolean);

    const isGesSelected = (ges) => {
      const gesId = String(ges.id_ges || ges.idGes || ges.id);
      if (gesId && selectedIds.includes(gesId)) return true;
      // Fallback: match by name
      const gesName = (ges.nombre || '').toLowerCase().trim();
      return gesName && selectedNames.includes(gesName);
    };

    // Sort categories: those with selected GES appear first
    const sortedCategories = Object.entries(gesGrouped).sort(([, listA], [, listB]) => {
      const aHasSelected = listA.some(g => isGesSelected(g));
      const bHasSelected = listB.some(g => isGesSelected(g));
      if (aHasSelected && !bHasSelected) return -1;
      if (!aHasSelected && bHasSelected) return 1;
      return 0;
    });

    return html`
      <div class="mini-wizard__step-content mini-wizard__step-content--riesgos">
        <div class="riesgos-header">
          <p>Selecciona los riesgos asociados a este cargo</p>
          <span class="riesgos-count">
            ${this.state.cargo.riesgosSeleccionados.length} seleccionados
          </span>
        </div>

        <div class="riesgos-carousel-list">
          ${sortedCategories.map(([categoria, gesList]) => {
            // Sort within category: selected GES first
            const sortedGES = [...gesList].sort((a, b) => {
              const aSelected = isGesSelected(a) ? 0 : 1;
              const bSelected = isGesSelected(b) ? 0 : 1;
              return aSelected - bSelected;
            });

            const selectedInCat = sortedGES.filter(g => isGesSelected(g)).length;
            const carouselId = `carousel-${categoria.replace(/[^a-zA-Z0-9]/g, '-')}`;

            return html`
              <div class="riesgos-category">
                <div class="riesgos-category__header">
                  <span class="riesgos-category__name">${categoria}</span>
                  <span class="riesgos-category__count">
                    ${selectedInCat > 0 ? html`<strong>${selectedInCat}</strong> / ` : ''}${gesList.length}
                  </span>
                  <div class="riesgos-category__arrows">
                    <button class="carousel-arrow" @click=${(e) => this.scrollCarousel(carouselId, -1, e)}>
                      <i data-lucide="chevron-left"></i>
                    </button>
                    <button class="carousel-arrow" @click=${(e) => this.scrollCarousel(carouselId, 1, e)}>
                      <i data-lucide="chevron-right"></i>
                    </button>
                  </div>
                </div>
                <div class="riesgos-carousel" id="${carouselId}">
                  <div class="riesgos-carousel__track">
                    ${sortedGES.map(ges => {
                      const isSelected = isGesSelected(ges);
                      return html`
                        <div
                          class="riesgo-chip ${isSelected ? 'selected' : ''}"
                          @click=${() => this.toggleRiesgo(ges)}
                        >
                          <span class="riesgo-chip__name">${ges.nombre}</span>
                          ${isSelected ? html`<i data-lucide="check"></i>` : ''}
                        </div>
                      `;
                    })}
                  </div>
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  /**
   * Scroll carousel left (-1) or right (1)
   */
  scrollCarousel(carouselId, direction, event) {
    if (event) event.preventDefault();
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    carousel.scrollBy({ left: direction * 250, behavior: 'smooth' });
  }

  /**
   * Step 3: Niveles de riesgo (CON APROBACIÓN EN EDICIÓN)
   */
  renderNivelesStep() {
    const riesgos = this.state.cargo.riesgosSeleccionados;

    if (riesgos.length === 0) {
      return html`
        <div class="mini-wizard__empty">
          <i data-lucide="alert-circle"></i>
          <p>No hay riesgos seleccionados</p>
          <span>Vuelve al paso anterior para seleccionar riesgos</span>
        </div>
      `;
    }

    return html`
      <div class="mini-wizard__step-content">
        ${this.options.mode === 'edit' ? html`
          <div class="approval-warning">
            <i data-lucide="alert-triangle"></i>
            <div>
              <strong>Cambios en niveles requieren aprobación</strong>
              <p>Las modificaciones en los niveles de riesgo serán marcadas para revisión antes de aplicarse.</p>
            </div>
          </div>
        ` : ''}

        <div class="niveles-list">
          ${riesgos.map((riesgo, index) => this.renderNivelItem(riesgo, index))}
        </div>
      </div>
    `;
  }

  /**
   * Render individual nivel item
   */
  renderNivelItem(riesgo, index) {
    const gesId = String(riesgo.id_ges || riesgo.idGes || riesgo.id);
    const currentNiveles = this.state.cargo.niveles[gesId] || { ND: 1, NE: 1, NC: 10 };

    // Calcular NP y NR
    const NP = currentNiveles.ND * currentNiveles.NE;
    const NR = NP * currentNiveles.NC;
    const nrInfo = this.getNRInfo(NR);

    return html`
      <div class="nivel-item">
        <div class="nivel-item__header">
          <span class="nivel-item__name">${riesgo.nombre}</span>
          <span class="nivel-item__badge nivel-item__badge--${nrInfo.level}">
            NR: ${NR} (${nrInfo.label})
          </span>
        </div>

        <div class="nivel-item__selectors">
          <!-- ND -->
          <div class="nivel-selector">
            <label>ND (Deficiencia)</label>
            <div class="nivel-buttons">
              ${this.niveles.ND.map(nivel => html`
                <button
                  type="button"
                  class="nivel-btn ${currentNiveles.ND === nivel.value ? 'active' : ''}"
                  style="--nivel-color: ${nivel.color}"
                  @click=${() => this.updateNivel(gesId, 'ND', nivel.value)}
                >
                  ${nivel.value}
                </button>
              `)}
            </div>
          </div>

          <!-- NE -->
          <div class="nivel-selector">
            <label>NE (Exposición)</label>
            <div class="nivel-buttons">
              ${this.niveles.NE.map(nivel => html`
                <button
                  type="button"
                  class="nivel-btn ${currentNiveles.NE === nivel.value ? 'active' : ''}"
                  style="--nivel-color: ${nivel.color}"
                  @click=${() => this.updateNivel(gesId, 'NE', nivel.value)}
                >
                  ${nivel.value}
                </button>
              `)}
            </div>
          </div>

          <!-- NC -->
          <div class="nivel-selector">
            <label>NC (Consecuencia)</label>
            <div class="nivel-buttons">
              ${this.niveles.NC.map(nivel => html`
                <button
                  type="button"
                  class="nivel-btn ${currentNiveles.NC === nivel.value ? 'active' : ''}"
                  style="--nivel-color: ${nivel.color}"
                  @click=${() => this.updateNivel(gesId, 'NC', nivel.value)}
                >
                  ${nivel.value}
                </button>
              `)}
            </div>
          </div>

          <!-- Calculated values -->
          <div class="nivel-calculated">
            <div class="nivel-calc-item">
              <span class="nivel-calc-label">NP</span>
              <span class="nivel-calc-value">${NP}</span>
            </div>
            <div class="nivel-calc-item nivel-calc-item--nr" style="--nr-color: ${nrInfo.color}">
              <span class="nivel-calc-label">NR</span>
              <span class="nivel-calc-value">${NR}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Step 4: Controles (CON APROBACIÓN EN EDICIÓN)
   */
  renderControlesStep() {
    const riesgos = this.state.cargo.riesgosSeleccionados;

    if (riesgos.length === 0) {
      return html`
        <div class="mini-wizard__empty">
          <i data-lucide="alert-circle"></i>
          <p>No hay riesgos seleccionados</p>
        </div>
      `;
    }

    return html`
      <div class="mini-wizard__step-content">
        ${this.options.mode === 'edit' ? html`
          <div class="approval-warning">
            <i data-lucide="alert-triangle"></i>
            <div>
              <strong>Cambios en controles requieren aprobación</strong>
              <p>Las modificaciones en los controles serán marcadas para revisión antes de aplicarse.</p>
            </div>
          </div>
        ` : ''}

        <div class="controles-list">
          ${riesgos.map((riesgo, index) => this.renderControlItem(riesgo, index))}
        </div>
      </div>
    `;
  }

  /**
   * Render individual control item
   */
  renderControlItem(riesgo, index) {
    const gesId = String(riesgo.id_ges || riesgo.idGes || riesgo.id);
    const currentControles = this.state.cargo.controles[gesId] || {
      fuente: '',
      medio: '',
      individuo: ''
    };

    return html`
      <div class="control-item">
        <div class="control-item__header">
          <span class="control-item__name">${riesgo.nombre}</span>
        </div>

        <div class="control-item__fields">
          <div class="form-group">
            <label class="form-label">Control en la Fuente</label>
            <textarea
              class="form-input form-textarea form-textarea--sm"
              .value=${currentControles.fuente}
              @input=${(e) => this.updateControl(gesId, 'fuente', e.target.value)}
              placeholder="Ej: Aislamiento acústico, guardas de protección..."
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Control en el Medio</label>
            <textarea
              class="form-input form-textarea form-textarea--sm"
              .value=${currentControles.medio}
              @input=${(e) => this.updateControl(gesId, 'medio', e.target.value)}
              placeholder="Ej: Señalización, ventilación, iluminación..."
              rows="2"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Control en el Individuo</label>
            <textarea
              class="form-input form-textarea form-textarea--sm"
              .value=${currentControles.individuo}
              @input=${(e) => this.updateControl(gesId, 'individuo', e.target.value)}
              placeholder="Ej: EPP, capacitación, pausas activas..."
              rows="2"
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Step 5: Resumen
   */
  renderResumenStep() {
    const cargo = this.state.cargo;
    const hasPendingApprovals = this.checkPendingApprovals();

    return html`
      <div class="mini-wizard__step-content">
        ${hasPendingApprovals ? html`
          <div class="approval-pending-banner">
            <i data-lucide="clock"></i>
            <div>
              <strong>Cambios pendientes de aprobación</strong>
              <p>Algunos cambios en niveles y/o controles requieren verificación con la empresa antes de aplicarse.</p>
            </div>
          </div>
        ` : ''}

        <div class="resumen-grid">
          <!-- Info básica -->
          <div class="resumen-section">
            <h3 class="resumen-section__title">
              <i data-lucide="user"></i>
              Información del Cargo
            </h3>
            <div class="resumen-section__content">
              <div class="resumen-item">
                <span class="resumen-item__label">Nombre:</span>
                <span class="resumen-item__value">${cargo.nombre || '-'}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-item__label">Área:</span>
                <span class="resumen-item__value">${cargo.area || '-'}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-item__label">Zona:</span>
                <span class="resumen-item__value">${cargo.zona || '-'}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-item__label">Trabajadores:</span>
                <span class="resumen-item__value">${cargo.numPersonas}</span>
              </div>
            </div>
          </div>

          <!-- Características especiales -->
          <div class="resumen-section">
            <h3 class="resumen-section__title">
              <i data-lucide="shield"></i>
              Características Especiales
            </h3>
            <div class="resumen-section__content">
              <div class="resumen-toggles">
                ${cargo.trabajaAlturas ? html`<span class="resumen-toggle resumen-toggle--danger">Alturas</span>` : ''}
                ${cargo.manipulaAlimentos ? html`<span class="resumen-toggle resumen-toggle--danger">Alimentos</span>` : ''}
                ${cargo.conduceVehiculo ? html`<span class="resumen-toggle resumen-toggle--warning">Vehículo</span>` : ''}
                ${cargo.trabajaEspaciosConfinados ? html`<span class="resumen-toggle resumen-toggle--danger">Espacios Confinados</span>` : ''}
                ${cargo.tareasRutinarias ? html`<span class="resumen-toggle resumen-toggle--warning">Tareas Rutinarias</span>` : ''}
                ${!cargo.trabajaAlturas && !cargo.manipulaAlimentos && !cargo.conduceVehiculo && !cargo.trabajaEspaciosConfinados && !cargo.tareasRutinarias ? html`<span class="resumen-toggle resumen-toggle--none">Ninguna</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Riesgos -->
          <div class="resumen-section resumen-section--full">
            <h3 class="resumen-section__title">
              <i data-lucide="alert-triangle"></i>
              Riesgos Seleccionados (${cargo.riesgosSeleccionados.length})
            </h3>
            <div class="resumen-section__content">
              <div class="resumen-riesgos">
                ${cargo.riesgosSeleccionados.map(riesgo => {
                  const gesId = String(riesgo.id_ges || riesgo.idGes || riesgo.id);
                  const niveles = cargo.niveles[gesId] || { ND: 1, NE: 1, NC: 10 };
                  const NR = niveles.ND * niveles.NE * niveles.NC;
                  const nrInfo = this.getNRInfo(NR);

                  return html`
                    <div class="resumen-riesgo">
                      <span class="resumen-riesgo__name">${riesgo.nombre}</span>
                      <span class="resumen-riesgo__nr" style="background: ${nrInfo.color}">
                        NR: ${NR}
                      </span>
                    </div>
                  `;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  updateCargo(field, value) {
    this.state.cargo[field] = value;
    this.renderContent();
  }

  toggleRiesgo(ges) {
    const gesId = String(ges.id_ges || ges.idGes || ges.id);
    const selected = this.state.cargo.riesgosSeleccionados;
    const index = selected.findIndex(r => String(r.id_ges || r.idGes || r.id) === gesId);

    if (index >= 0) {
      selected.splice(index, 1);
      // Limpiar niveles y controles
      delete this.state.cargo.niveles[gesId];
      delete this.state.cargo.controles[gesId];
    } else {
      selected.push(ges);
      // Inicializar niveles y controles por defecto
      this.state.cargo.niveles[gesId] = { ND: 1, NE: 1, NC: 10 };
      this.state.cargo.controles[gesId] = { fuente: '', medio: '', individuo: '' };
    }

    this.renderContent();
  }



  updateNivel(gesId, tipo, value) {
    if (!this.state.cargo.niveles[gesId]) {
      this.state.cargo.niveles[gesId] = { ND: 1, NE: 1, NC: 10 };
    }
    this.state.cargo.niveles[gesId][tipo] = value;

    // Si es modo edición, verificar si necesita aprobación
    if (this.options.mode === 'edit') {
      this.checkNivelApprovalNeeded(gesId, tipo, value);
    }

    this.renderContent();
  }

  updateControl(gesId, tipo, value) {
    if (!this.state.cargo.controles[gesId]) {
      this.state.cargo.controles[gesId] = { fuente: '', medio: '', individuo: '' };
    }
    this.state.cargo.controles[gesId][tipo] = value;

    // Si es modo edición, verificar si necesita aprobación
    if (this.options.mode === 'edit') {
      this.checkControlApprovalNeeded(gesId, tipo, value);
    }
  }

  checkNivelApprovalNeeded(gesId, tipo, newValue) {
    const original = this.state.originalNiveles[gesId];
    if (original && original[tipo] !== newValue) {
      // Agregar a pendientes de aprobación
      const key = `nivel_${gesId}_${tipo}`;
      if (!this.state.pendingApprovals.includes(key)) {
        this.state.pendingApprovals.push(key);
      }
    }
  }

  checkControlApprovalNeeded(gesId, tipo, newValue) {
    const original = this.state.originalControles[gesId];
    if (original && original[tipo] !== newValue) {
      const key = `control_${gesId}_${tipo}`;
      if (!this.state.pendingApprovals.includes(key)) {
        this.state.pendingApprovals.push(key);
      }
    }
  }

  checkPendingApprovals() {
    return this.state.pendingApprovals.length > 0;
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  goToNextStep() {
    // Validar paso actual
    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.state.currentStep < this.state.totalSteps - 1) {
      this.state.currentStep++;
      this.renderContent();
    }
  }

  goToPreviousStep() {
    if (this.state.currentStep > 0) {
      this.state.currentStep--;
      this.renderContent();
    }
  }

  validateCurrentStep() {
    const cargo = this.state.cargo;

    switch (this.state.currentStep) {
      case 0: // Info
        if (!cargo.nombre || cargo.nombre.length < 3) {
          alert('El nombre del cargo debe tener al menos 3 caracteres');
          return false;
        }
        if (!cargo.area) {
          alert('El área es requerida');
          return false;
        }
        if (!cargo.zona) {
          alert('La zona es requerida');
          return false;
        }
        return true;

      case 1: // Riesgos
        if (cargo.riesgosSeleccionados.length === 0) {
          alert('Debes seleccionar al menos un riesgo');
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  // ==========================================
  // ACTIONS
  // ==========================================

  async handleSave() {
    // Verificar si hay aprobaciones pendientes
    if (this.checkPendingApprovals()) {
      const confirmed = await this.showApprovalModal();
      if (!confirmed) return;
    }

    this.state.loading = true;
    this.renderContent();

    try {
      // Llamar callback de guardado
      await this.options.onSave({
        ...this.state.cargo,
        pendingApprovals: this.state.pendingApprovals,
        mode: this.options.mode,
        cargoId: this.options.cargoId
      });

      this.hide();
    } catch (error) {
      console.error('[CargoMiniWizard] Error saving:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      this.state.loading = false;
    }
  }

  handleCancel() {
    this.options.onCancel();
    this.hide();
  }

  /**
   * Show approval confirmation modal
   */
  async showApprovalModal() {
    return new Promise((resolve) => {
      // Crear modal de aprobación
      const modal = document.createElement('div');
      modal.className = 'approval-modal-overlay';
      modal.innerHTML = `
        <div class="approval-modal">
          <div class="approval-modal__icon">
            <i data-lucide="alert-triangle"></i>
          </div>
          <h3 class="approval-modal__title">Cambios Requieren Aprobación</h3>
          <p class="approval-modal__message">
            Has modificado niveles de riesgo y/o controles existentes.
            Estos cambios deben ser verificados con la empresa antes de aplicarse.
          </p>
          <p class="approval-modal__submessage">
            Los cambios quedarán en estado "Pendiente de aprobación" hasta que sean revisados.
          </p>
          <div class="approval-modal__actions">
            <button class="btn btn--ghost" id="approval-cancel">Cancelar</button>
            <button class="btn btn--primary" id="approval-confirm">
              <i data-lucide="clock"></i>
              Enviar para Aprobación
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Event listeners
      modal.querySelector('#approval-cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(false);
      });

      modal.querySelector('#approval-confirm').addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(true);
      });
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  getNRInfo(NR) {
    if (NR <= 20) return { level: 'i', label: 'Nivel I', color: '#10b981' };
    if (NR <= 120) return { level: 'ii', label: 'Nivel II', color: '#84cc16' };
    if (NR <= 500) return { level: 'iii', label: 'Nivel III', color: '#f59e0b' };
    if (NR <= 1000) return { level: 'iv', label: 'Nivel IV', color: '#f97316' };
    return { level: 'v', label: 'Nivel V', color: '#ef4444' };
  }
}

// Export factory function
export function createCargoMiniWizard(options) {
  return new CargoMiniWizard(options);
}
