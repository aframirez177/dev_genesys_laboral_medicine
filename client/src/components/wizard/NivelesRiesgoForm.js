/**
 * NivelesRiesgoForm.js - Formulario de Niveles de Riesgo con Calculadora NP/NR
 *
 * ✅ MIGRADO A LIT-HTML (2025-11-06)
 *
 * Características:
 * - Usa lit-html para renderizado eficiente (solo actualiza cambios)
 * - Event binding declarativo (@click, @change)
 * - Sin event listeners manuales
 * - Sin loops infinitos de navegación
 * - NC corregido a 4 niveles según GTC-45
 * - Guards para prevenir clicks múltiples
 * - Cálculo automático de NP y NR
 * - Interpretación visual con colores según severidad
 */

import { html, render } from 'lit-html';

export class NivelesRiesgoForm {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('NivelesRiesgoForm: Container not found');
    }

    this.options = {
      cargoIndex: options.cargoIndex || 0,
      cargoNombre: options.cargoNombre || '',
      gesArray: options.gesArray || [],
      state: options.state || null,
      onChange: options.onChange || (() => {}),
      onComplete: options.onComplete || (() => {}),
      ...options
    };

    this.currentGESIndex = 0;

    // ✅ Guard para prevenir navegación múltiple
    this.isNavigating = false;

    // ✅ FASE 2: Estado para vista híbrida
    this.sugerencias = [];
    this.modoVista = 'loading'; // 'loading', 'hybrid', 'step-by-step'
    this.empresaId = 1; // TODO: Obtener de sesión

    // ✅ Debouncing para guardado automático de controles
    this.controlChangeDebounceTimer = null;
    this.controlChangeDebounceDelay = 1500; // 1.5 segundos sin tecleo

    // ✅ Sprint 6 FIX: Flag para evitar renders después de destroy
    this.isDestroyed = false;

    // Definiciones de niveles según GTC 45
    // ✅ ORDEN: De menor (izquierda, verde) a mayor (derecha, rojo)
    // ✅ Sprint 6 Bug Fix: ND=0 cambiado a ND=1 (multiplicador implícito)
    this.niveles = {
      ND: [
        { value: 1, label: 'Bajo / N/A', description: 'No se detectan deficiencias' },
        { value: 2, label: 'Medio', description: 'Deficiencias moderadas' },
        { value: 6, label: 'Alto', description: 'Deficiencias graves detectadas' },
        { value: 10, label: 'Muy Alto', description: 'Deficiencias muy graves detectadas' }
      ],
      NE: [
        { value: 1, label: 'Esporádica (EE)', description: 'Irregularmente' },
        { value: 2, label: 'Ocasional (EO)', description: 'Alguna vez durante la jornada, tiempo corto' },
        { value: 3, label: 'Frecuente (EF)', description: 'Varias veces durante la jornada, tiempos cortos' },
        { value: 4, label: 'Continua (EC)', description: 'Varias veces durante la jornada, tiempos prolongados' }
      ],
      NC: [
        { value: 10, label: 'Leve', description: 'Lesiones sin hospitalización' },
        { value: 25, label: 'Grave', description: 'Incapacidad temporal' },
        { value: 60, label: 'Muy Grave', description: 'Incapacidad permanente parcial o invalidez' },
        { value: 100, label: 'Mortal o Catastrófica', description: 'Muerte(s)' }
      ]
    };

    this.init();
  }

  /**
   * Initialize component
   * ✅ FASE 2: Carga sugerencias de plantillas antes de renderizar
   * ✅ Sprint 6 FIX: Verifica si fue destruido antes de renderizar
   */
  async init() {
    if (this.isDestroyed) return;
    
    if (this.options.gesArray.length === 0) {
      this.renderEmpty();
      return;
    }

    // FASE 2: Cargar sugerencias de plantillas
    await this.loadSugerencias();

    // ✅ Sprint 6 FIX: Verificar si fue destruido durante la carga async
    if (this.isDestroyed) {
      console.log('[NivelesForm] Componente destruido durante init, abortando render');
      return;
    }

    // Decidir qué vista mostrar
    if (this.sugerencias.length > 0) {
      this.modoVista = 'hybrid';
      this.renderVistaHibrida();
    } else {
      this.modoVista = 'step-by-step';
      this.renderComponent();
    }
  }

  /**
   * FASE 2: Cargar sugerencias de plantillas desde API
   */
  async loadSugerencias() {
    try {
      console.log('[NivelesForm] Cargando sugerencias de plantillas...');

      // Preparar array de GES para el API
      const gesArray = this.options.gesArray.map(ges => ({
        id_ges: ges.id_ges || ges.idGes,
        nombre: ges.nombre,
        categoria: ges.categoria,
        descripcion: ges.descripcion
      }));

      const response = await fetch('/api/plantillas-niveles/sugerir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: this.empresaId,
          gesArray
        })
      });

      const data = await response.json();

      if (data.success) {
        this.sugerencias = data.sugerencias || [];
        console.log(`[NivelesForm] ✅ ${this.sugerencias.length} sugerencias cargadas`);
        console.log('[NivelesForm] Stats:', data.stats);
      } else {
        console.warn('[NivelesForm] Error al cargar sugerencias:', data.message);
        this.sugerencias = [];
      }
    } catch (error) {
      console.error('[NivelesForm] Error al cargar sugerencias:', error);
      this.sugerencias = [];
    }
  }

  /**
   * FASE 2: Renderizar vista híbrida con tabla de sugerencias
   * ✅ Sprint 6 FIX: Verifica si fue destruido antes de renderizar
   */
  renderVistaHibrida() {
    // ✅ Sprint 6 FIX: Evitar render si fue destruido
    if (this.isDestroyed || !this.container || !this.container.isConnected || !this.container.parentNode) {
      console.log('[NivelesForm] renderVistaHibrida abortado - componente no válido');
      return;
    }

    // Separar sugerencias en auto-aprobables y que requieren revisión
    const autoAprobables = this.sugerencias.filter(s => !s.requiereRevision && s.plantillaId);
    const requierenRevision = this.sugerencias.filter(s => s.requiereRevision || !s.plantillaId);

    const template = html`
      <div class="niveles-vista-hibrida">
        <!-- Header -->
        <div class="niveles-hibrida__header">
          <h2>🧠 Configuración Inteligente de Niveles</h2>
          <p class="niveles-hibrida__subtitle">
            Hemos pre-configurado los niveles basándonos en plantillas de tu empresa.
            Revisa y valida las sugerencias.
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="niveles-hibrida__stats">
          <div class="stat-card stat-card--success">
            <i class="fas fa-check-circle"></i>
            <div class="stat-card__content">
              <span class="stat-card__number">${autoAprobables.length}</span>
              <span class="stat-card__label">Auto-aprobables</span>
            </div>
          </div>
          <div class="stat-card stat-card--warning">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="stat-card__content">
              <span class="stat-card__number">${requierenRevision.length}</span>
              <span class="stat-card__label">Requieren revisión</span>
            </div>
          </div>
          <div class="stat-card stat-card--info">
            <i class="fas fa-clock"></i>
            <div class="stat-card__content">
              <span class="stat-card__number">~${Math.round(this.sugerencias.length * 0.5)} min</span>
              <span class="stat-card__label">Tiempo ahorrado</span>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="niveles-hibrida__filters">
          <button
            class="filter-tab ${this.filtroActivo === 'todas' ? 'active' : ''}"
            @click=${() => this.handleCambiarFiltro('todas')}
          >
            <i class="fas fa-list"></i>
            Todas (${this.sugerencias.length})
          </button>
          <button
            class="filter-tab ${this.filtroActivo === 'revision' ? 'active' : ''}"
            @click=${() => this.handleCambiarFiltro('revision')}
          >
            <i class="fas fa-flag"></i>
            Solo Revisión (${requierenRevision.length})
          </button>
          <button
            class="filter-tab ${this.filtroActivo === 'auto' ? 'active' : ''}"
            @click=${() => this.handleCambiarFiltro('auto')}
          >
            <i class="fas fa-magic"></i>
            Auto-aprobables (${autoAprobables.length})
          </button>
        </div>

        <!-- Tabla de Sugerencias -->
        <div class="niveles-hibrida__table-container">
          <table class="niveles-hibrida__table">
            <thead>
              <tr>
                <th>GES / Riesgo</th>
                <th>Categoría</th>
                <th>ND</th>
                <th>NE</th>
                <th>NC</th>
                <th>NP</th>
                <th>NR</th>
                <th>Nivel</th>
                <th>Confianza</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${this.getSugerenciasFiltradas().map((sug, index) => this.templateFilaSugerencia(sug, index))}
            </tbody>
          </table>
        </div>

        <!-- Actions -->
        <div class="niveles-hibrida__actions">
          <button
            class="wizard-btn wizard-btn-secondary"
            @click=${() => this.handleCambiarAManual()}
          >
            <i class="fas fa-edit"></i>
            Configurar Manualmente
          </button>

          <button
            class="wizard-btn wizard-btn-success"
            @click=${() => this.handleValidarTodo()}
            ?disabled=${requierenRevision.length > 0}
          >
            <i class="fas fa-check-double"></i>
            Validar Todo y Continuar
          </button>
        </div>

        ${requierenRevision.length > 0 ? html`
          <div class="niveles-hibrida__help">
            <i class="fas fa-info-circle"></i>
            <p>
              <strong>Atención:</strong> Hay ${requierenRevision.length} riesgos que requieren revisión manual
              (riesgos críticos o plantillas nuevas). Revisa cada uno antes de continuar.
            </p>
          </div>
        ` : ''}
      </div>
    `;

    // ✅ Sprint 6 FIX: try-catch para evitar errores de lit-html
    try {
      render(template, this.container);
    } catch (error) {
      console.error('[NivelesForm] Error en renderVistaHibrida:', error.message);
      this.isDestroyed = true;
    }
  }

  /**
   * FASE 2: Template para fila de sugerencia
   */
  templateFilaSugerencia(sugerencia, index) {
    const niveles = sugerencia.nivelesSugeridos || {};
    const np = niveles.ND && niveles.NE ? niveles.ND * niveles.NE : null;
    const nr = np && niveles.NC ? np * niveles.NC : null;
    const interpretacion = this.interpretarNR(nr);

    const rowClass = sugerencia.requiereRevision
      ? 'fila-sugerencia fila-sugerencia--revision'
      : sugerencia.plantillaId
      ? 'fila-sugerencia fila-sugerencia--auto'
      : 'fila-sugerencia fila-sugerencia--manual';

    return html`
      <tr class="${rowClass}">
        <td class="td-ges">
          <strong>${sugerencia.gesNombre}</strong>
          ${!sugerencia.plantillaId ? html`
            <span class="badge badge--warning">Sin plantilla</span>
          ` : ''}
        </td>
        <td class="td-categoria">
          <span class="categoria-badge">${sugerencia.gesCategoria}</span>
        </td>
        <td class="td-nivel">${niveles.ND ?? '—'}</td>
        <td class="td-nivel">${niveles.NE ?? '—'}</td>
        <td class="td-nivel">${niveles.NC ?? '—'}</td>
        <td class="td-np">
          <strong>${np ?? '—'}</strong>
        </td>
        <td class="td-nr">
          <strong>${nr ?? '—'}</strong>
        </td>
        <td class="td-interpretacion">
          ${interpretacion.texto ? html`
            <span class="nivel-badge nivel-badge--${interpretacion.clase}">
              ${interpretacion.emoji || ''} ${interpretacion.texto}
            </span>
          ` : '—'}
        </td>
        <td class="td-confianza">
          ${sugerencia.plantillaId ? html`
            <div class="confianza-bar">
              <div
                class="confianza-bar__fill"
                style="width: ${(sugerencia.confianza * 100).toFixed(0)}%"
              ></div>
              <span class="confianza-bar__text">${(sugerencia.confianza * 100).toFixed(0)}%</span>
            </div>
          ` : '—'}
        </td>
        <td class="td-acciones">
          ${sugerencia.plantillaId ? html`
            <button
              class="btn-accion btn-accion--edit"
              @click=${() => this.handleEditarSugerencia(index)}
              title="Editar niveles"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn-accion btn-accion--check ${sugerencia.validada ? 'validada' : ''}"
              @click=${() => this.handleValidarSugerencia(index)}
              title="${sugerencia.validada ? 'Validado' : 'Validar'}"
            >
              <i class="fas ${sugerencia.validada ? 'fa-check-circle' : 'fa-check'}"></i>
            </button>
          ` : html`
            <button
              class="btn-accion btn-accion--edit"
              @click=${() => this.handleEditarSugerencia(index)}
              title="Configurar manualmente"
            >
              <i class="fas fa-cog"></i>
            </button>
          `}
        </td>
      </tr>
    `;
  }

  /**
   * FASE 2: Obtener sugerencias filtradas
   */
  getSugerenciasFiltradas() {
    if (!this.filtroActivo || this.filtroActivo === 'todas') {
      return this.sugerencias;
    }

    if (this.filtroActivo === 'revision') {
      return this.sugerencias.filter(s => s.requiereRevision || !s.plantillaId);
    }

    if (this.filtroActivo === 'auto') {
      return this.sugerencias.filter(s => !s.requiereRevision && s.plantillaId);
    }

    return this.sugerencias;
  }

  /**
   * FASE 2: Handlers para vista híbrida
   */
  handleCambiarFiltro = (filtro) => {
    if (this.isDestroyed) return;
    this.filtroActivo = filtro;
    this.renderVistaHibrida();
  }

  handleCambiarAManual = () => {
    if (this.isDestroyed) return;
    this.modoVista = 'step-by-step';
    this.renderComponent();
  }

  handleValidarTodo = async () => {
    // Validar que no haya pendientes de revisión
    const pendientes = this.sugerencias.filter(s => s.requiereRevision || !s.plantillaId);

    if (pendientes.length > 0) {
      alert(`Debes revisar ${pendientes.length} riesgos antes de continuar.`);
      return;
    }

    // Aplicar todas las sugerencias
    console.log('[NivelesForm] Aplicando todas las sugerencias...');

    for (let i = 0; i < this.sugerencias.length; i++) {
      const sug = this.sugerencias[i];

      if (sug.plantillaId && sug.nivelesSugeridos) {
        // Aplicar niveles al GES correspondiente
        const gesIndex = this.options.gesArray.findIndex(
          ges => (ges.id_ges || ges.idGes) === sug.gesId
        );

        if (gesIndex !== -1) {
          const ges = this.options.gesArray[gesIndex];

          // Calcular NP y NR
          const niveles = { ...sug.nivelesSugeridos };
          niveles.NP = niveles.ND * niveles.NE;
          niveles.NR = niveles.NP * niveles.NC;

          // Actualizar en state
          if (this.options.state) {
            this.options.state.updateGESNiveles(
              this.options.cargoIndex,
              gesIndex,
              niveles
            );
          }

          // Actualizar local
          ges.niveles = niveles;

          // Registrar aplicación en BD para aprendizaje
          await this.registrarAplicacion(sug, niveles, niveles, true);
        }
      }
    }

    // Notificar completado
    this.options.onComplete();
  }

  handleEditarSugerencia = (index) => {
    const sugerencia = this.sugerencias[index];

    // Encontrar el GES correspondiente
    const gesIndex = this.options.gesArray.findIndex(
      ges => (ges.id_ges || ges.idGes) === sugerencia.gesId
    );

    if (gesIndex !== -1) {
      // Aplicar niveles sugeridos si existen
      if (sugerencia.nivelesSugeridos) {
        const ges = this.options.gesArray[gesIndex];
        ges.niveles = { ...sugerencia.nivelesSugeridos };
      }

      // Cambiar a modo paso a paso y navegar al GES
      if (this.isDestroyed) return;
      this.currentGESIndex = gesIndex;
      this.modoVista = 'step-by-step';
      this.renderComponent();
      this.scrollToTop();
    }
  }

  handleValidarSugerencia = async (index) => {
    const sugerencia = this.sugerencias[index];

    // Toggle validación
    sugerencia.validada = !sugerencia.validada;

    if (sugerencia.validada && sugerencia.plantillaId && sugerencia.nivelesSugeridos) {
      // Aplicar niveles al GES
      const gesIndex = this.options.gesArray.findIndex(
        ges => (ges.id_ges || ges.idGes) === sugerencia.gesId
      );

      if (gesIndex !== -1) {
        const ges = this.options.gesArray[gesIndex];

        // Calcular NP y NR
        const niveles = { ...sugerencia.nivelesSugeridos };
        niveles.NP = niveles.ND * niveles.NE;
        niveles.NR = niveles.NP * niveles.NC;

        // Actualizar en state
        if (this.options.state) {
          this.options.state.updateGESNiveles(
            this.options.cargoIndex,
            gesIndex,
            niveles
          );
        }

        // Actualizar local
        ges.niveles = niveles;

        // Registrar aplicación
        await this.registrarAplicacion(sugerencia, niveles, niveles, true);
      }
    }

    // Re-render
    this.renderVistaHibrida();
  }

  /**
   * FASE 2: Registrar aplicación de plantilla (para aprendizaje)
   */
  async registrarAplicacion(sugerencia, nivelesSugeridos, nivelesFinales, aceptadoSinCambios) {
    try {
      const response = await fetch('/api/plantillas-niveles/aplicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantillaId: sugerencia.plantillaId,
          gesId: sugerencia.gesId,
          cargoId: this.options.cargoIndex, // TODO: Usar ID real del cargo
          nivelesSugeridos,
          nivelesFinales,
          justificacionAjuste: aceptadoSinCambios ? null : 'Ajuste manual del usuario'
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('[NivelesForm] ✅ Aplicación registrada para aprendizaje');
      } else {
        console.warn('[NivelesForm] Error al registrar aplicación:', data.message);
      }
    } catch (error) {
      console.error('[NivelesForm] Error al registrar aplicación:', error);
    }
  }

  /**
   * Main render method - usa lit-html para renderizado eficiente
   * ✅ Solo actualiza partes del DOM que cambiaron
   * ✅ Sprint 6: Layout compacto con header + progress combinados
   * ✅ Sprint 6 FIX: Verifica si el componente fue destruido antes de renderizar
   */
  renderComponent() {
    // ✅ Sprint 6 FIX: Múltiples verificaciones para evitar errores de lit-html
    if (this.isDestroyed) {
      console.log('[NivelesForm] Render abortado - componente destruido');
      return;
    }
    
    if (!this.container) {
      console.log('[NivelesForm] Render abortado - container es null');
      return;
    }
    
    if (!this.container.isConnected) {
      console.log('[NivelesForm] Render abortado - container desconectado del DOM');
      return;
    }
    
    if (!this.container.parentNode) {
      console.log('[NivelesForm] Render abortado - container sin parentNode');
      return;
    }

    const currentGES = this.options.gesArray[this.currentGESIndex];
    const totalGES = this.options.gesArray.length;

    const template = html`
      <div class="niveles-form">
        ${this.templateCompactHeader(currentGES, this.currentGESIndex + 1, totalGES)}
        ${this.templateGESInfo(currentGES)}
        ${this.templateNivelSection('ND', 'Nivel de Deficiencia', currentGES)}
        ${this.templateNivelSection('NE', 'Nivel de Exposición', currentGES)}
        ${this.templateNivelSection('NC', 'Nivel de Consecuencia', currentGES)}
        ${this.templateControlesSection(currentGES)}
        ${this.templateCalculator(currentGES)}
        ${this.templateNavigation(this.currentGESIndex, totalGES)}
      </div>
    `;

    // ✅ lit-html render con try-catch por seguridad
    try {
      render(template, this.container);
    } catch (error) {
      console.error('[NivelesForm] Error en lit-html render:', error.message);
      // Marcar como destruido para evitar más intentos
      this.isDestroyed = true;
    }
  }

  /**
   * Template: Compact Header (Sprint 6)
   * ✅ Combina título, cargo y progreso en una sola fila
   */
  templateCompactHeader(currentGES, currentNum, totalGES) {
    const completed = this.options.gesArray.filter(g => this.isGESComplete(g)).length;
    const percentage = totalGES > 0 ? Math.round((completed / totalGES) * 100) : 0;
    const circumference = 2 * Math.PI * 22; // radio 22
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return html`
      <div class="niveles-form__header-compact">
        <div class="niveles-form__header-left">
          <h2>
            <i class="fas fa-chart-bar"></i>
            Niveles y Controles
          </h2>
          <p class="cargo-info-inline">
            <i class="fas fa-briefcase"></i>
            <strong>${this.options.cargoNombre}</strong>
            <span>• Riesgo ${currentNum} de ${totalGES}</span>
          </p>
        </div>
        
        <div class="niveles-form__header-right">
          <div class="niveles-form__progress-mini">
            <div class="progress-circle">
              <svg viewBox="0 0 50 50">
                <circle class="track" cx="25" cy="25" r="22"></circle>
                <circle class="fill" cx="25" cy="25" r="22" 
                  stroke-dasharray="${strokeDasharray}"></circle>
              </svg>
              <div class="progress-number">
                <span>${completed}</span>
                <small>/${totalGES}</small>
              </div>
            </div>
            <div class="progress-label">
              <strong>${percentage}%</strong>
              completado
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Template: Header (legacy - mantenido por compatibilidad)
   */
  templateHeader(currentGES, currentNum, totalGES) {
    return this.templateCompactHeader(currentGES, currentNum, totalGES);
  }

  /**
   * Template: Progress indicator (legacy - integrado en header compacto)
   */
  templateProgressIndicator() {
    // Ya integrado en templateCompactHeader
    return '';
  }

  /**
   * Template: GES info card
   */
  templateGESInfo(ges) {
    const isComplete = this.isGESComplete(ges);

    return html`
      <div class="niveles-form__ges-card">
        <div class="ges-card__header">
          <h3 class="ges-card__name">
            <i class="fas fa-exclamation-triangle"></i>
            ${ges.nombre}
          </h3>
          ${isComplete ? html`
            <span class="ges-card__badge ges-card__badge--complete">
              <i class="fas fa-check-circle"></i>
              Completo
            </span>
          ` : html`
            <span class="ges-card__badge ges-card__badge--incomplete">
              <i class="fas fa-clock"></i>
              Pendiente
            </span>
          `}
        </div>
        ${ges.descripcion ? html`
          <p class="ges-card__description">${ges.descripcion}</p>
        ` : ''}
        <div class="ges-card__meta">
          <span class="ges-card__category">
            <i class="fas fa-tag"></i>
            ${ges.categoria || 'Sin categoría'}
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Template: Nivel section (ND, NE, or NC)
   */
  templateNivelSection(tipo, titulo, ges) {
    const niveles = this.niveles[tipo];
    const currentValue = ges.niveles?.[tipo] ?? null;

    return html`
      <div class="niveles-form__section">
        <div class="nivel-section__header">
          <h3 class="nivel-section__title">
            <span class="nivel-badge">${tipo}</span>
            ${titulo}
          </h3>
          <button
            class="nivel-section__help"
            @click=${() => this.handleShowHelp(tipo)}
            title="Ayuda sobre ${titulo}"
          >
            <i class="fas fa-question-circle"></i>
          </button>
        </div>

        <div class="nivel-bar">
          ${niveles.map(nivel => this.templateNivelOption(tipo, nivel, currentValue))}
        </div>
      </div>
    `;
  }

  /**
   * Template: Individual nivel option (barra semaforizada horizontal)
   * ✅ Sistema de 4 colores: verde, amarillo, naranja, rojo
   */
  templateNivelOption(tipo, nivel, currentValue) {
    const isSelected = currentValue === nivel.value;
    const color = this.getNivelColor(tipo, nivel.value);

    return html`
      <button
        class="nivel-option ${isSelected ? 'nivel-option--selected' : ''}"
        data-value="${nivel.value}"
        @click=${() => this.handleSelectNivel(tipo, nivel.value)}
        style="--nivel-color: ${color}"
        title="${nivel.label}: ${nivel.description}"
      >
        <span class="nivel-option__label">${nivel.label}</span>
        <span class="nivel-option__value">${nivel.value}</span>
        ${isSelected ? html`<span class="nivel-option__check"><i class="fas fa-check-circle"></i></span>` : ''}
      </button>
    `;
  }

  /**
   * Obtener color para un nivel específico
   */
  getNivelColor(tipo, value) {
    // Colores GTC-45: verde, amarillo, naranja, rojo
    // ⚠️ IMPORTANTE: Las keys deben coincidir con los valores numéricos
    const colors = {
      ND: {
        1: '#4caf50',   // Verde - Bajo / N/A (sin deficiencias) - ✅ Sprint 6: Cambiado de 0 a 1
        2: '#ffeb3b',   // Amarillo - Medio
        6: '#ff9800',   // Naranja - Alto
        10: '#f44336'   // Rojo - Muy Alto (deficiencias graves)
      },
      NE: {
        1: '#4caf50',   // Verde - Esporádica
        2: '#ffeb3b',   // Amarillo - Ocasional
        3: '#ff9800',   // Naranja - Frecuente
        4: '#f44336'    // Rojo - Continua
      },
      NC: {
        10: '#4caf50',  // Verde - Leve
        25: '#ffeb3b',  // Amarillo - Grave
        60: '#ff9800',  // Naranja - Muy Grave
        100: '#f44336'  // Rojo - Mortal
      }
    };

    const color = colors[tipo]?.[value];
    console.log(`🎨 getNivelColor(${tipo}, ${value}) = ${color}`); // Debug
    return color || '#999';
  }

  /**
   * Obtener emoji para un nivel específico
   */
  getNivelEmoji(tipo, value) {
    const emojis = {
      ND: { 0: '🟢', 2: '🟡', 6: '🟠', 10: '🔴' },
      NE: { 1: '🟢', 2: '🟡', 3: '🟠', 4: '🔴' },
      NC: { 10: '🟢', 25: '🟡', 60: '🟠', 100: '🔴' }
    };

    return emojis[tipo]?.[value] || '⚪';
  }

  /**
   * Buscar controles existentes de este mismo GES en otros cargos
   * Los controles existentes son generales para un GES, no específicos de un cargo
   * ✅ FIX Sprint 6: Solo sugerir si el GES tiene EL MISMO NOMBRE exacto
   * @param {Object} currentGES - GES actual
   * @returns {Object|null} - Controles encontrados o null
   */
  findControlesFromOtherCargo(currentGES) {
    if (!this.options.state) return null;

    const allCargos = this.options.state.getCargos();
    const currentGESName = (currentGES.nombre || currentGES.ges || '').trim().toLowerCase();
    const currentGESId = currentGES.id_ges || currentGES.idGes || currentGES.id;

    // Buscar en todos los cargos
    for (let cargoIndex = 0; cargoIndex < allCargos.length; cargoIndex++) {
      // Saltar el cargo actual para evitar falsos positivos
      if (cargoIndex === this.options.cargoIndex) continue;

      const cargo = allCargos[cargoIndex];
      const gesArray = cargo.gesSeleccionados || cargo.ges || [];

      if (!Array.isArray(gesArray)) continue;

      // Buscar el mismo GES por ID primero, luego por nombre exacto
      for (const ges of gesArray) {
        const gesId = ges.id_ges || ges.idGes || ges.id;
        const gesName = (ges.nombre || ges.ges || '').trim().toLowerCase();

        // ✅ FIX: Comparar por ID si está disponible, o nombre exacto
        const isMatchById = currentGESId && gesId && currentGESId === gesId;
        const isMatchByName = currentGESName && gesName && currentGESName === gesName;

        if ((isMatchById || isMatchByName) && ges.controles) {
          // Verificar que tenga al menos un control lleno
          const tieneControles = ges.controles.fuente || ges.controles.medio || ges.controles.individuo;

          if (tieneControles) {
            console.log(`[NivelesForm] ✅ Autocompletando controles de "${currentGES.nombre}" desde cargo: ${cargo.nombre}`);
            return { ...ges.controles };
          }
        }
      }
    }

    return null;
  }

  /**
   * Template: Controles Section (Fuente, Medio, Individuo)
   * ✅ Autocompletado: Si este GES ya tiene controles en otro cargo, los precarga
   * ✅ FIX Sprint 6: Solo autocompletar si el GES actual NO tiene controles propios
   */
  templateControlesSection(ges) {
    // ✅ FIX: Verificar si el GES actual ya tiene controles propios definidos
    const tieneControlesPropios = ges.controles && 
      (ges.controles.fuente || ges.controles.medio || ges.controles.individuo);

    // Solo buscar controles de otro cargo si este GES no tiene controles propios
    let controlesExistentesDeOtroCargo = null;
    let autocompletado = false;

    if (!tieneControlesPropios) {
      controlesExistentesDeOtroCargo = this.findControlesFromOtherCargo(ges);
      
      // Inicializar controles con los de otro cargo si existen
      if (controlesExistentesDeOtroCargo) {
        ges.controles = {
          fuente: controlesExistentesDeOtroCargo.fuente || '',
          medio: controlesExistentesDeOtroCargo.medio || '',
          individuo: controlesExistentesDeOtroCargo.individuo || ''
        };
        autocompletado = true;
      }
    }

    // Asegurar que controles exista
    if (!ges.controles) {
      ges.controles = {
        fuente: '',
        medio: '',
        individuo: ''
      };
    }

    const { fuente = '', medio = '', individuo = '' } = ges.controles;

    return html`
      <div class="controles-section">
        <div class="controles-section__header">
          <h3 class="controles-section__title">
            <i class="fas fa-shield-alt"></i>
            Controles Existentes
          </h3>
          ${autocompletado ? html`
            <div class="autocompletado-badge">
              <i class="fas fa-copy"></i>
              Autocompletado desde otro cargo
            </div>
          ` : ''}
        </div>

        <p class="controles-section__description">
          Indique los controles que la empresa <strong>YA tiene implementados</strong> para este riesgo (GTC-45)
        </p>

        <div class="controles-grid">
          <!-- Control en la FUENTE -->
          <div class="control-field">
            <label class="control-field__label">
              <i class="fas fa-tools"></i>
              Control en la FUENTE
            </label>
            <textarea
              class="control-field__textarea"
              placeholder="Ej: Mantenimiento preventivo de maquinaria, sustitución de materiales peligrosos..."
              rows="3"
              .value=${fuente}
              @input=${(e) => this.handleControlChange('fuente', e.target.value)}
            ></textarea>
          </div>

          <!-- Control en el MEDIO -->
          <div class="control-field">
            <label class="control-field__label">
              <i class="fas fa-warehouse"></i>
              Control en el MEDIO
            </label>
            <textarea
              class="control-field__textarea"
              placeholder="Ej: Ventilación adecuada, señalización de seguridad, aislamiento acústico..."
              rows="3"
              .value=${medio}
              @input=${(e) => this.handleControlChange('medio', e.target.value)}
            ></textarea>
          </div>

          <!-- Control en el INDIVIDUO -->
          <div class="control-field">
            <label class="control-field__label">
              <i class="fas fa-user-shield"></i>
              Control en el INDIVIDUO
            </label>
            <textarea
              class="control-field__textarea"
              placeholder="Ej: Uso de EPP (casco, guantes, tapones auditivos), capacitación en seguridad..."
              rows="3"
              .value=${individuo}
              @input=${(e) => this.handleControlChange('individuo', e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Template: Calculator with NP and NR results
   */
  templateCalculator(ges) {
    const { ND, NE, NC } = ges.niveles || {};

    const npValue = (ND !== null && ND !== undefined && NE !== null && NE !== undefined) ? ND * NE : null;
    const nrValue = (npValue !== null && NC !== null && NC !== undefined) ? npValue * NC : null;

    const npInterpretacion = this.interpretarNP(npValue);
    const nrInterpretacion = this.interpretarNR(nrValue);

    return html`
      <div class="niveles-form__calculator">
        <h3 class="calculator__title">
          <i class="fas fa-calculator"></i>
          Resultados del Cálculo
        </h3>

        <div class="calculator__grid">
          <!-- NP (Nivel de Probabilidad) -->
          <div class="calculator__result">
            <div class="calculator__formula">
              <span class="formula-label">NP</span>
              <span class="formula-equation">=</span>
              <span class="formula-part">ND (${ND ?? '?'})</span>
              <span class="formula-operator">×</span>
              <span class="formula-part">NE (${NE ?? '?'})</span>
            </div>
            <div class="calculator__value ${npInterpretacion.clase}">
              <span class="value-number">${npValue ?? '—'}</span>
              <span class="value-label">Nivel de Probabilidad</span>
            </div>
            ${npInterpretacion.texto ? html`
              <div class="calculator__interpretation ${npInterpretacion.clase}">
                <i class="fas ${npInterpretacion.icono}"></i>
                <span>${npInterpretacion.texto}</span>
              </div>
            ` : ''}
          </div>

          <!-- NR (Nivel de Riesgo) -->
          <div class="calculator__result">
            <div class="calculator__formula">
              <span class="formula-label">NR</span>
              <span class="formula-equation">=</span>
              <span class="formula-part">NP (${npValue ?? '?'})</span>
              <span class="formula-operator">×</span>
              <span class="formula-part">NC (${NC ?? '?'})</span>
            </div>
            <div class="calculator__value ${nrInterpretacion.clase}">
              <span class="value-number">${nrValue ?? '—'}</span>
              <span class="value-label">Nivel de Riesgo</span>
            </div>
            ${nrInterpretacion.texto ? html`
              <div class="calculator__interpretation ${nrInterpretacion.clase}">
                <i class="fas ${nrInterpretacion.icono}"></i>
                <div>
                  <strong>${nrInterpretacion.texto}</strong>
                  <p>${nrInterpretacion.descripcion}</p>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Template: Navigation buttons
   * ✅ Usa @click para event binding automático
   * ✅ Sprint 6: Reconoce cargos pendientes y ajusta el texto del botón
   */
  templateNavigation(currentIndex, totalGES) {
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < totalGES - 1;
    const isComplete = this.isGESComplete(this.options.gesArray[currentIndex]);
    const allGESComplete = this.areAllGESComplete();

    // ✅ Sprint 6: Determinar si hay más cargos pendientes
    const nextCargoInfo = this.getNextPendingCargoInfo();
    const isLastCargo = !nextCargoInfo.hasMoreCargos;
    const allCargosComplete = nextCargoInfo.allCargosComplete;

    // Determinar texto del botón final
    let finalButtonText = 'Finalizar Configuración';
    let finalButtonIcon = 'fa-check';
    
    if (!isLastCargo && allGESComplete) {
      // Hay más cargos pendientes
      finalButtonText = `Siguiente: ${nextCargoInfo.nextCargoName}`;
      finalButtonIcon = 'fa-arrow-right';
    } else if (allCargosComplete) {
      finalButtonText = 'Terminar Configuración';
      finalButtonIcon = 'fa-check-double';
    }

    return html`
      <!-- Navegación tradicional (bottom sticky) -->
      <div class="niveles-form__navigation">
        <button
          class="wizard-btn wizard-btn-secondary"
          ?disabled=${!hasPrevious}
          @click=${() => this.handlePreviousGES()}
        >
          <i class="fas fa-chevron-left"></i>
          Riesgo Anterior
        </button>

        <div class="navigation__info">
          ${!isComplete ? html`
            <p class="navigation__warning">
              <i class="fas fa-exclamation-circle"></i>
              Completa los 3 niveles de riesgo (ND, NE, NC) para continuar
            </p>
          ` : ''}
        </div>

        ${hasNext ? html`
          <button
            class="wizard-btn wizard-btn-primary"
            ?disabled=${!isComplete}
            @click=${() => this.handleNextGES()}
          >
            Siguiente Riesgo
            <i class="fas fa-chevron-right"></i>
          </button>
        ` : html`
          <button
            class="wizard-btn ${allCargosComplete ? 'wizard-btn-success' : 'wizard-btn-primary'}"
            ?disabled=${!allGESComplete}
            @click=${() => this.handleComplete()}
          >
            <i class="fas ${finalButtonIcon}"></i>
            ${finalButtonText}
          </button>
        `}
      </div>

      <!-- FAB Navigation (flotante - solo en desktop con más de 1 riesgo) -->
      ${totalGES > 1 ? html`
        <div class="wizard-fab-nav">
          ${hasPrevious ? html`
            <button
              class="wizard-fab wizard-fab--secondary"
              data-tooltip="Riesgo Anterior"
              @click=${() => this.handlePreviousGES()}
              aria-label="Ir al riesgo anterior"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
          ` : ''}

          ${hasNext ? html`
            <button
              class="wizard-fab"
              data-tooltip="${isComplete ? 'Siguiente Riesgo' : 'Completa este riesgo primero'}"
              ?disabled=${!isComplete}
              @click=${() => this.handleNextGES()}
              aria-label="Ir al siguiente riesgo"
            >
              <i class="fas fa-chevron-right"></i>
              ${currentIndex + 1 < totalGES ? html`
                <span class="wizard-fab__badge">${currentIndex + 2}</span>
              ` : ''}
            </button>
          ` : ''}
        </div>
      ` : ''}
    `;
  }

  /**
   * ✅ Sprint 6: Obtener información sobre el siguiente cargo pendiente
   */
  getNextPendingCargoInfo() {
    if (!this.options.state) {
      return { hasMoreCargos: false, nextCargoName: '', allCargosComplete: false };
    }

    const allCargos = this.options.state.getCargos();
    const currentCargoIndex = this.options.cargoIndex;

    // Verificar si hay más cargos después del actual
    let nextPendingCargo = null;
    let allCargosComplete = true;

    for (let i = 0; i < allCargos.length; i++) {
      const cargo = allCargos[i];
      const gesArray = cargo.gesSeleccionados || cargo.ges || [];
      
      // Verificar si este cargo tiene todos sus GES completos
      const cargoComplete = gesArray.length > 0 && gesArray.every(ges => {
        const niveles = ges.niveles || {};
        return niveles.ND !== null && niveles.ND !== undefined &&
               niveles.NE !== null && niveles.NE !== undefined &&
               niveles.NC !== null && niveles.NC !== undefined;
      });

      if (!cargoComplete && gesArray.length > 0) {
        allCargosComplete = false;
        
        // Si es un cargo después del actual y no está completo, es el siguiente pendiente
        if (i > currentCargoIndex && !nextPendingCargo) {
          nextPendingCargo = cargo;
        }
      }
    }

    return {
      hasMoreCargos: nextPendingCargo !== null,
      nextCargoName: nextPendingCargo?.nombre || '',
      allCargosComplete: allCargosComplete
    };
  }

  /**
   * Handle nivel selection
   * ✅ Arrow function para binding correcto en lit-html
   */
  handleSelectNivel = (tipo, value) => {
    if (this.isDestroyed) return;
    console.log(`[NivelesForm] Selecting ${tipo} = ${value}`);

    const currentGES = this.options.gesArray[this.currentGESIndex];

    // ✅ Inicializar niveles si no existen
    if (!currentGES.niveles) {
      currentGES.niveles = {
        ND: null,
        NE: null,
        NC: null,
        NP: null,
        NR: null,
        // ✅ También inicializar formato WizardState (deficiencia/exposicion/consecuencia)
        deficiencia: null,
        exposicion: null,
        consecuencia: null
      };
    }

    // ✅ Inicializar controles si no existen
    if (!currentGES.controles) {
      currentGES.controles = {
        fuente: '',
        medio: '',
        individuo: ''
      };
    }

    // Update niveles (flat format para uso interno)
    const updatedNiveles = {
      ...currentGES.niveles,
      [tipo]: value
    };

    // Auto-calculate NP and NR
    if (updatedNiveles.ND !== null && updatedNiveles.ND !== undefined &&
        updatedNiveles.NE !== null && updatedNiveles.NE !== undefined) {
      updatedNiveles.NP = updatedNiveles.ND * updatedNiveles.NE;
    }

    if (updatedNiveles.NP !== null && updatedNiveles.NP !== undefined &&
        updatedNiveles.NC !== null && updatedNiveles.NC !== undefined) {
      updatedNiveles.NR = updatedNiveles.NP * updatedNiveles.NC;
    }

    // ✅ TAMBIÉN actualizar en formato WizardState (deficiencia/exposicion/consecuencia)
    // Mapeo: ND -> deficiencia, NE -> exposicion, NC -> consecuencia
    if (tipo === 'ND') {
      updatedNiveles.deficiencia = { value };
    } else if (tipo === 'NE') {
      updatedNiveles.exposicion = { value };
    } else if (tipo === 'NC') {
      updatedNiveles.consecuencia = { value };
    }

    // Update GES in state via WizardState
    if (this.options.state) {
      this.options.state.updateGESNiveles(
        this.options.cargoIndex,
        this.currentGESIndex,
        updatedNiveles
      );
    }

    // Update local reference
    currentGES.niveles = updatedNiveles;

    // Notify parent
    this.options.onChange({
      action: 'update-niveles',
      gesIndex: this.currentGESIndex,
      niveles: updatedNiveles
    });

    console.log('[NivelesForm] Updated niveles:', updatedNiveles);

    // ✅ Re-render EFICIENTE con lit-html (solo actualiza cambios)
    this.renderComponent();
  }

  /**
   * Handle control change (fuente, medio, individuo)
   * ✅ Arrow function para binding correcto en lit-html
   * ✅ Implementa debouncing para evitar guardado excesivo
   * ✅ NO re-renderiza el componente completo - solo actualiza el state
   */
  handleControlChange = (tipo, value) => {
    if (this.isDestroyed) return;
    console.log(`[NivelesForm] Control change (debouncing): ${tipo} = "${value.substring(0, 30)}..."`);

    const currentGES = this.options.gesArray[this.currentGESIndex];

    // ✅ Inicializar controles si no existen
    if (!currentGES.controles) {
      currentGES.controles = {
        fuente: '',
        medio: '',
        individuo: ''
      };
    }

    // Update controles localmente (inmediato para UI responsiva)
    currentGES.controles[tipo] = value;

    // ✅ Cancelar timer anterior si existe
    if (this.controlChangeDebounceTimer) {
      clearTimeout(this.controlChangeDebounceTimer);
    }

    // ✅ Crear nuevo timer - solo guardar después de 1.5 segundos sin teclear
    this.controlChangeDebounceTimer = setTimeout(() => {
      console.log(`[NivelesForm] Saving controls after debounce: ${tipo}`);

      // Update GES in state via WizardState (dispara notify)
      if (this.options.state) {
        this.options.state.updateGESControles(
          this.options.cargoIndex,
          this.currentGESIndex,
          currentGES.controles
        );
      }

      // Notify parent (solo después del debounce)
      this.options.onChange({
        action: 'update-controles',
        gesIndex: this.currentGESIndex,
        controles: currentGES.controles
      });

      console.log('[NivelesForm] Controls saved successfully');
    }, this.controlChangeDebounceDelay);

    // ✅ NO re-renderizar - lit-html maneja el two-way binding automáticamente
    // El textarea ya tiene el valor actualizado porque usamos .value=${...}
  }

  /**
   * Handle show controles help
   */
  handleShowControlesHelp = () => {
    alert(`📋 MEDIDAS DE CONTROL - Jerarquía de Control según GTC-45

✅ CONTROL EN LA FUENTE:
Actúa sobre el origen del peligro para eliminarlo o reducirlo.
Ejemplos:
• Mantenimiento preventivo de maquinaria
• Sustitución de materiales peligrosos por otros más seguros
• Rediseño de procesos para eliminar riesgos
• Instalación de guardas en equipos

🏭 CONTROL EN EL MEDIO:
Actúa en el ambiente entre la fuente y el trabajador.
Ejemplos:
• Ventilación adecuada y extracción de gases
• Señalización de seguridad
• Aislamiento acústico o térmico
• Orden y aseo en áreas de trabajo

👷 CONTROL EN EL INDIVIDUO:
Última barrera de protección, actúa sobre el trabajador.
Ejemplos:
• Uso de EPP (casco, guantes, tapones auditivos, gafas)
• Capacitación y entrenamiento en seguridad
• Rotación de personal
• Pausas activas y exámenes médicos periódicos

💡 Recuerda: La mejor estrategia es controlar en la FUENTE, luego en el MEDIO, y finalmente en el INDIVIDUO.`);
  }

  /**
   * Handle load sugerencias de controles desde ges-config.js
   * Carga automáticamente las medidas de intervención predefinidas
   */
  handleLoadSugerenciasControles = async (ges) => {
    try {
      console.log(`[NivelesForm] Cargando sugerencias para: ${ges.nombre}`);

      // Buscar GES en catálogo de base de datos por nombre exacto
      const searchResponse = await fetch(`/api/catalogo/ges?search=${encodeURIComponent(ges.nombre)}&limit=5`);
      const searchData = await searchResponse.json();

      if (!searchData.success || !searchData.data || searchData.data.length === 0) {
        alert(`No se encontraron sugerencias predefinidas para "${ges.nombre}" en la base de datos. Puedes ingresarlas manualmente.`);
        return;
      }

      // Buscar coincidencia exacta (case-insensitive)
      const gesMatch = searchData.data.find(g =>
        g.nombre.toLowerCase().trim() === ges.nombre.toLowerCase().trim()
      );

      if (!gesMatch) {
        alert(`No se encontró coincidencia exacta para "${ges.nombre}". Resultados similares: ${searchData.data.map(g => g.nombre).join(', ')}`);
        return;
      }

      // Obtener detalles completos del GES por ID
      const detailResponse = await fetch(`/api/catalogo/ges/${gesMatch.id}`);
      const detailData = await detailResponse.json();

      if (!detailData.success || !detailData.data) {
        alert(`No se pudieron cargar los detalles para "${ges.nombre}".`);
        return;
      }

      const gesData = detailData.data;
      const medidasIntervencion = gesData.medidas_intervencion;

      if (!medidasIntervencion) {
        alert(`El GES "${ges.nombre}" no tiene medidas de intervención predefinidas.`);
        return;
      }

      // Mapear las medidas de intervención desde BD a la estructura del wizard
      // BD usa snake_case: eliminacion, sustitucion, controles_ingenieria, controles_administrativos
      // Wizard usa: fuente, medio, individuo
      const sugerencias = {
        fuente: medidasIntervencion.eliminacion || '',
        medio: medidasIntervencion.controles_ingenieria || '',
        individuo: medidasIntervencion.controles_administrativos || ''
      };

      // Actualizar el GES actual con las sugerencias
      const currentGES = this.options.gesArray[this.currentGESIndex];
      currentGES.controles = sugerencias;

      // Actualizar en el estado
      if (this.options.state) {
        this.options.state.updateGESControles(
          this.options.cargoIndex,
          this.currentGESIndex,
          sugerencias
        );
      }

      // Notificar al padre
      this.options.onChange({
        action: 'update-controles',
        gesIndex: this.currentGESIndex,
        controles: sugerencias
      });

      // Re-renderizar para mostrar las sugerencias
      if (!this.isDestroyed) {
        this.renderComponent();
      }

      console.log('[NivelesForm] Sugerencias cargadas desde BD:', sugerencias);
    } catch (error) {
      console.error('[NivelesForm] Error al cargar sugerencias:', error);
      if (!this.isDestroyed) {
        alert('Error al cargar sugerencias. Por favor, intenta nuevamente.');
      }
    }
  }

  /**
   * Handle previous GES
   * ✅ Con guard para prevenir clicks múltiples
   */
  handlePreviousGES = () => {
    if (this.isDestroyed || this.isNavigating) {
      console.log('[NivelesForm] Navigation blocked - destroyed or in progress');
      return;
    }

    if (this.currentGESIndex > 0) {
      this.isNavigating = true;
      console.log(`[NivelesForm] Navigating from GES ${this.currentGESIndex} to ${this.currentGESIndex - 1}`);

      this.currentGESIndex--;
      this.renderComponent();
      this.scrollToTop();

      // Release lock después de render
      setTimeout(() => {
        this.isNavigating = false;
      }, 100);
    }
  }

  /**
   * Handle next GES
   * ✅ Con guard para prevenir clicks múltiples
   */
  handleNextGES = () => {
    if (this.isDestroyed || this.isNavigating) {
      console.log('[NivelesForm] Navigation blocked - destroyed or in progress');
      return;
    }

    const currentGES = this.options.gesArray[this.currentGESIndex];

    if (!this.isGESComplete(currentGES)) {
      alert(`Por favor completa todos los niveles de riesgo (ND, NE, NC) para "${currentGES.nombre}" antes de continuar.`);
      return;
    }

    if (this.currentGESIndex < this.options.gesArray.length - 1) {
      this.isNavigating = true;
      console.log(`[NivelesForm] Navigating from GES ${this.currentGESIndex} to ${this.currentGESIndex + 1}`);

      this.currentGESIndex++;
      this.renderComponent();
      this.scrollToTop();

      // Release lock después de render
      setTimeout(() => {
        this.isNavigating = false;
      }, 100);
    }
  }

  /**
   * Handle complete all niveles
   */
  handleComplete = () => {
    if (this.isDestroyed) return;
    console.log('[NivelesForm] handleComplete - Verificando completitud...');
    console.log('[NivelesForm] gesArray:', this.options.gesArray);

    // Verificar que TODOS los GES estén completos
    const incompleteGES = this.options.gesArray.filter(ges => {
      const isComplete = this.isGESComplete(ges);
      console.log(`[NivelesForm] GES "${ges.nombre}":`, {
        niveles: ges.niveles,
        isComplete
      });
      return !isComplete;
    });

    if (incompleteGES.length > 0) {
      const nombres = incompleteGES.map(ges => `"${ges.nombre}"`).join(', ');
      console.error('[NivelesForm] GES incompletos:', nombres);
      alert(`Por favor completa los niveles de riesgo (ND, NE, NC) para: ${nombres}`);
      return;
    }

    console.log('[NivelesForm] Todos los GES están completos. Llamando onComplete()');
    this.options.onComplete();
  }

  /**
   * Handle show help
   * ✅ Arrow function para binding correcto
   */
  handleShowHelp = (tipo) => {
    const helpTexts = {
      ND: `
        <strong>Nivel de Deficiencia (ND):</strong>
        <br><br>
        Indica la magnitud de la relación entre el conjunto de peligros detectados y su relación causal directa con posibles incidentes.
        <br><br>
        <ul style="text-align: left; margin-top: 1rem;">
          <li><strong>10 - Muy Alto:</strong> Se han detectado factores de riesgo significativos que determinan una muy alta probabilidad de generar incidentes.</li>
          <li><strong>6 - Alto:</strong> Se han detectado factores de riesgo que pueden generar incidentes.</li>
          <li><strong>2 - Medio:</strong> Se han detectado factores de riesgo de menor importancia.</li>
          <li><strong>0 - Bajo:</strong> No se detectan anomalías destacables. El riesgo está controlado.</li>
        </ul>
      `,
      NE: `
        <strong>Nivel de Exposición (NE):</strong>
        <br><br>
        Frecuencia con la que el trabajador está expuesto al peligro.
        <br><br>
        <ul style="text-align: left; margin-top: 1rem;">
          <li><strong>10 - Continua:</strong> Exposición varias veces durante la jornada laboral con tiempos prolongados.</li>
          <li><strong>6 - Frecuente:</strong> Exposición varias veces durante la jornada con tiempos cortos.</li>
          <li><strong>3 - Ocasional:</strong> Exposición alguna vez durante la jornada con tiempo corto.</li>
          <li><strong>1 - Esporádica:</strong> Exposición de forma irregular o muy ocasional.</li>
        </ul>
      `,
      NC: `
        <strong>Nivel de Consecuencia (NC):</strong>
        <br><br>
        Consecuencia normalmente esperada si el riesgo se materializa.
        <br><br>
        <ul style="text-align: left; margin-top: 1rem;">
          <li><strong>100 - Mortal:</strong> Consecuencias fatales, muerte de uno o más trabajadores.</li>
          <li><strong>60 - Muy Grave:</strong> Incapacidad permanente parcial o invalidez.</li>
          <li><strong>25 - Grave:</strong> Incapacidad temporal, lesiones con baja laboral.</li>
          <li><strong>10 - Leve:</strong> Lesiones sin hospitalización, no requiere baja laboral.</li>
        </ul>
      `
    };

    const helpText = helpTexts[tipo] || 'No hay ayuda disponible para este nivel.';
    this.showHelpModal(helpText);
  }

  /**
   * Show help modal
   */
  showHelpModal(content) {
    const modal = document.createElement('div');
    modal.className = 'niveles-help-modal';
    modal.innerHTML = `
      <div class="help-modal__overlay"></div>
      <div class="help-modal__content">
        <button class="help-modal__close">
          <i class="fas fa-times"></i>
        </button>
        <div class="help-modal__body">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listener to close
    const closeModal = () => modal.remove();
    modal.querySelector('.help-modal__overlay').addEventListener('click', closeModal);
    modal.querySelector('.help-modal__close').addEventListener('click', closeModal);
  }

  /**
   * Check if a GES is complete (has ND, NE, NC and controles)
   */
  isGESComplete(ges) {
    // ✅ Solo validar niveles (ND, NE, NC)
    // Los controles son OPCIONALES
    const { ND, NE, NC } = ges.niveles || {};
    const nivelesComplete = ND !== null && ND !== undefined &&
                           NE !== null && NE !== undefined &&
                           NC !== null && NC !== undefined;

    return nivelesComplete;
  }

  /**
   * Check if all GES are complete
   */
  areAllGESComplete() {
    return this.options.gesArray.every(ges => this.isGESComplete(ges));
  }

  /**
   * Interpret NP (Nivel de Probabilidad)
   */
  interpretarNP(np) {
    if (np === null || np === undefined) {
      return { texto: '', clase: '', icono: '', descripcion: '' };
    }

    if (np >= 40) {
      return {
        texto: 'Muy Alto',
        clase: 'risk-muy-alto',
        icono: 'fa-exclamation-triangle',
        descripcion: 'Situación crítica. Corrección urgente.'
      };
    } else if (np >= 20) {
      return {
        texto: 'Alto',
        clase: 'risk-alto',
        icono: 'fa-exclamation-circle',
        descripcion: 'Corregir y adoptar medidas de control.'
      };
    } else if (np >= 8) {
      return {
        texto: 'Medio',
        clase: 'risk-medio',
        icono: 'fa-info-circle',
        descripcion: 'Mejorar si es posible.'
      };
    } else {
      return {
        texto: 'Bajo',
        clase: 'risk-bajo',
        icono: 'fa-check-circle',
        descripcion: 'Mantener las medidas de control existentes.'
      };
    }
  }

  /**
   * Interpret NR (Nivel de Riesgo)
   */
  interpretarNR(nr) {
    if (nr === null || nr === undefined) {
      return { texto: '', clase: '', icono: '', descripcion: '' };
    }

    if (nr >= 600) {
      return {
        texto: 'I - No Aceptable',
        clase: 'risk-muy-alto',
        icono: 'fa-ban',
        descripcion: 'Situación crítica. Suspender actividades hasta controlar el riesgo.'
      };
    } else if (nr >= 150) {
      return {
        texto: 'II - No Aceptable o Aceptable con Control',
        clase: 'risk-alto',
        icono: 'fa-exclamation-triangle',
        descripcion: 'Intervención urgente. No iniciar actividad hasta reducir el riesgo.'
      };
    } else if (nr >= 40) {
      return {
        texto: 'III - Mejorable',
        clase: 'risk-medio',
        icono: 'fa-tasks',
        descripcion: 'Mejorar las medidas de control. Programar acciones de mejora.'
      };
    } else {
      return {
        texto: 'IV - Aceptable',
        clase: 'risk-bajo',
        icono: 'fa-check-circle',
        descripcion: 'Mantener las medidas de control actuales. Seguimiento periódico.'
      };
    }
  }

  /**
   * Scroll to top of container
   */
  scrollToTop() {
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Get current GES index
   */
  getCurrentGESIndex() {
    return this.currentGESIndex;
  }

  /**
   * Set current GES index
   */
  setCurrentGESIndex(index) {
    if (this.isDestroyed) return;
    if (index >= 0 && index < this.options.gesArray.length) {
      this.currentGESIndex = index;
      this.renderComponent();
    }
  }

  /**
   * Update GES array (when parent state changes)
   */
  updateGESArray(gesArray) {
    if (this.isDestroyed) return;
    this.options.gesArray = gesArray;

    // Ensure current index is valid
    if (this.currentGESIndex >= gesArray.length) {
      this.currentGESIndex = Math.max(0, gesArray.length - 1);
    }

    this.renderComponent();
  }

  /**
   * Render empty state
   * ✅ Sprint 6 FIX: Verifica si fue destruido antes de renderizar
   */
  renderEmpty() {
    // ✅ Sprint 6 FIX: Evitar render si fue destruido
    if (this.isDestroyed || !this.container || !this.container.isConnected || !this.container.parentNode) {
      console.log('[NivelesForm] renderEmpty abortado - componente no válido');
      return;
    }

    const template = html`
      <div class="niveles-form__empty">
        <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ffeb3b; margin-bottom: 1rem;"></i>
        <h3>No hay riesgos seleccionados</h3>
        <p>Debes seleccionar al menos un riesgo en el paso anterior antes de configurar los niveles.</p>
        <button
          class="wizard-btn wizard-btn-secondary"
          @click=${() => this.options.onChange({ action: 'go-back' })}
        >
          <i class="fas fa-arrow-left"></i>
          Volver a Selección de Riesgos
        </button>
      </div>
    `;

    // ✅ Sprint 6 FIX: try-catch para evitar errores de lit-html
    try {
      render(template, this.container);
    } catch (error) {
      console.error('[NivelesForm] Error en renderEmpty:', error.message);
      this.isDestroyed = true;
    }
  }

  /**
   * Destroy component
   * ✅ Sprint 6 FIX: Marca como destruido para evitar renders pendientes
   */
  destroy() {
    console.log('[NivelesForm] Destroying component');
    
    // ✅ Marcar como destruido primero para evitar race conditions
    this.isDestroyed = true;
    
    // ✅ Cancelar cualquier timer de debounce pendiente
    if (this.controlChangeDebounceTimer) {
      clearTimeout(this.controlChangeDebounceTimer);
      this.controlChangeDebounceTimer = null;
    }
    
    // Limpiar el container si todavía existe
    if (this.container && this.container.isConnected) {
      this.container.innerHTML = '';
    }
  }
}

/**
 * Helper: Create NivelesRiesgoForm instance
 */
export function createNivelesRiesgoForm(container, options) {
  return new NivelesRiesgoForm(container, options);
}
