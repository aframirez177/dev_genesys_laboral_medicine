/**
 * ========================================
 * MATRIZ DE RIESGOS GTC-45 COMPONENT
 * World-Class Interactive Table
 * Sprint 6 - Premium Dashboard
 * ========================================
 */

/**
 * Main class for Matriz de Riesgos GTC-45 interactive component
 */
export class MatrizRiesgosComponent {
    constructor(containerId = 'matriz-dashboard-container') {
        this.container = document.getElementById(containerId);
        this.data = null;
        this.filteredData = null;
        this.sortConfig = { column: null, direction: 'asc' };
        this.searchTerm = '';
        this.filters = {
            nivel: '',
            cargo: '',
            tipo: ''
        };
        this.documento = null; // Store documento info for Excel export
    }

    /**
     * Initialize component with data from API
     */
    async init(apiData) {
        console.log('🔵 [MATRIZ] Initializing component with data:', apiData);

        if (!this.container) {
            console.error('🔴 [MATRIZ] Container not found');
            return;
        }

        this.data = this.processAPIData(apiData);
        this.filteredData = [...this.data];
        this.documento = apiData.documento || null; // Store documento info for export

        this.render();
        this.attachEventListeners();

        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Process API data into flat array of risks for table
     */
    processAPIData(apiData) {
        if (!apiData || !apiData.categorias) return [];

        const risks = [];

        // Flatten categorias into array of individual risks
        Object.values(apiData.categorias).forEach(categoria => {
            categoria.peligros.forEach(peligro => {
                risks.push({
                    id: peligro.id,
                    cargo: peligro.cargo,
                    area: peligro.area,
                    tipo: categoria.nombre,
                    descripcion: peligro.descripcion,
                    nd: peligro.niveles.nd,
                    ne: peligro.niveles.ne,
                    nc: peligro.niveles.nc,
                    np: peligro.niveles.np,
                    nr: peligro.niveles.nr,
                    nrNivel: peligro.niveles.nrNivel,
                    niveles: peligro.niveles, // Full niveles object for display
                    interpretacion: peligro.interpretacion,
                    controles: peligro.controles,
                    // Controles existentes (fuente, medio, individuo)
                    controlesExistentes: peligro.controlesExistentes,
                    tieneControlesExistentes: peligro.tieneControlesExistentes,
                    // Warning para riesgos altos sin controles
                    requiereAccionUrgente: peligro.requiereAccionUrgente,
                    sugerenciasIA: peligro.sugerenciasIA
                });
            });
        });

        console.log('🟢 [MATRIZ] Processed risks:', risks.length);
        return risks;
    }

    /**
     * Calculate metrics from current data
     */
    calculateMetrics() {
        const metrics = {
            total: this.data.length,
            critical: this.data.filter(r => r.nrNivel === 'V').length,
            high: this.data.filter(r => r.nrNivel === 'IV').length,
            medium: this.data.filter(r => r.nrNivel === 'III').length,
            low: this.data.filter(r => r.nrNivel === 'II' || r.nrNivel === 'I').length
        };

        return metrics;
    }

    /**
     * Get unique values for filter dropdowns
     */
    getFilterOptions() {
        return {
            cargos: [...new Set(this.data.map(r => r.cargo))].sort(),
            tipos: [...new Set(this.data.map(r => r.tipo))].sort(),
            niveles: ['I', 'II', 'III', 'IV', 'V']
        };
    }

    /**
     * Render complete UI
     */
    render() {
        const metrics = this.calculateMetrics();
        const options = this.getFilterOptions();

        this.container.innerHTML = `
            <!-- Metrics Cards -->
            <div class="matriz-metrics-grid">
                ${this.renderMetricCard('Total de Peligros', metrics.total, 'layout-grid', '')}
                ${this.renderMetricCard('Nivel V - Crítico', metrics.critical, 'alert-octagon', 'critical')}
                ${this.renderMetricCard('Nivel IV - Alto', metrics.high, 'alert-triangle', 'high')}
                ${this.renderMetricCard('Nivel III - Moderado', metrics.medium, 'alert-circle', 'medium')}
                ${this.renderMetricCard('Nivel I-II - Aceptable', metrics.low, 'check-circle', 'low')}
            </div>

            <!-- Toolbar: Search & Filters -->
            <div class="matriz-toolbar">
                <div class="matriz-search">
                    <i data-lucide="search" class="matriz-search__icon"></i>
                    <input
                        type="text"
                        class="matriz-search__input"
                        placeholder="Buscar por descripción, cargo o área..."
                        id="matriz-search-input"
                        value="${this.searchTerm}"
                    />
                </div>

                <div class="matriz-filters">
                    <div class="filter-dropdown">
                        <select id="filter-nivel">
                            <option value="">Todos los niveles</option>
                            ${options.niveles.map(n => `
                                <option value="${n}" ${this.filters.nivel === n ? 'selected' : ''}>
                                    Nivel ${n}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="filter-dropdown">
                        <select id="filter-cargo">
                            <option value="">Todos los cargos</option>
                            ${options.cargos.map(c => `
                                <option value="${c}" ${this.filters.cargo === c ? 'selected' : ''}>
                                    ${c}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="filter-dropdown">
                        <select id="filter-tipo">
                            <option value="">Todos los tipos</option>
                            ${options.tipos.map(t => `
                                <option value="${t}" ${this.filters.tipo === t ? 'selected' : ''}>
                                    ${t}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="matriz-actions">
                    <button class="btn btn--icon" id="btn-reset-filters" title="Limpiar filtros">
                        <i data-lucide="rotate-ccw"></i>
                    </button>
                </div>
            </div>

            <!-- Table Container -->
            <div class="matriz-table-container">
                ${this.renderTable()}
            </div>

            <!-- Results Count -->
            <div class="matriz-results-count">
                Mostrando <strong>${this.filteredData.length}</strong> de <strong>${this.data.length}</strong> peligros
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Render metric card
     */
    renderMetricCard(label, value, icon, variant) {
        return `
            <div class="metric-card ${variant ? `metric-card--${variant}` : ''}">
                <div class="metric-card__icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="metric-card__value">${value}</div>
                <div class="metric-card__label">${label}</div>
            </div>
        `;
    }

    /**
     * Render interactive table
     */
    renderTable() {
        if (this.filteredData.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <table class="matriz-table">
                <thead>
                    <tr>
                        ${this.renderTableHeader('cargo', 'Cargo')}
                        ${this.renderTableHeader('area', 'Área')}
                        ${this.renderTableHeader('tipo', 'Tipo de Riesgo')}
                        ${this.renderTableHeader('descripcion', 'Descripción del Peligro')}
                        ${this.renderTableHeader('nd', 'ND')}
                        ${this.renderTableHeader('ne', 'NE')}
                        ${this.renderTableHeader('nc', 'NC')}
                        ${this.renderTableHeader('np', 'NP')}
                        ${this.renderTableHeader('nr', 'NR')}
                        <th>Nivel</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.filteredData.map(risk => this.renderTableRow(risk)).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Render sortable table header
     */
    renderTableHeader(column, label) {
        const isSorted = this.sortConfig.column === column;
        const sortClass = isSorted
            ? `sorted-${this.sortConfig.direction}`
            : '';

        return `
            <th class="sortable ${sortClass}" data-column="${column}">
                ${label}
            </th>
        `;
    }

    /**
     * Render table row with expandable details
     */
    renderTableRow(risk) {
        return `
            <tr class="row-expandable" data-risk-id="${risk.id}">
                <td class="cell-cargo">${risk.cargo}</td>
                <td>${risk.area || 'N/A'}</td>
                <td>
                    <span class="risk-badge risk-badge--tipo">${risk.tipo}</span>
                </td>
                <td class="cell-riesgo">${risk.descripcion}</td>
                <td class="cell-nr">${risk.nd}</td>
                <td class="cell-nr">${risk.ne}</td>
                <td class="cell-nr">${risk.nc}</td>
                <td class="cell-nr">${risk.np}</td>
                <td class="cell-nr"><strong>${risk.nr}</strong></td>
                <td>
                    ${this.renderNRBadge(risk.nrNivel)}
                </td>
                <td>
                    <button class="btn btn--icon btn--sm" data-action="expand" data-risk-id="${risk.id}">
                        <i data-lucide="chevron-down"></i>
                    </button>
                </td>
            </tr>
            <tr class="risk-details" id="details-${risk.id}">
                <td colspan="11">
                    <div class="risk-details-content">
                        ${this.renderRiskDetails(risk)}
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Render NR badge with color coding
     */
    renderNRBadge(nivel) {
        const nivelLower = nivel.toLowerCase();
        return `<span class="risk-badge risk-badge--nr risk-badge--nr-${nivelLower}">Nivel ${nivel}</span>`;
    }

    /**
     * Render expanded risk details - NUEVA ESTRUCTURA
     * Fila 1: Interpretación + Controles Existentes (Fuente, Medio, Individuo) con warnings
     * Fila 2: Controles Sugeridos ISO 45001
     */
    renderRiskDetails(risk) {
        // Determinar si el riesgo es alto (necesita warnings en campos vacíos)
        const isHighRisk = risk.requiereAccionUrgente ||
                          risk.nrNivel === 'V' ||
                          risk.nrNivel === 'IV' ||
                          (risk.np && risk.np >= 10);

        // Verificar campos vacíos
        const fuenteEmpty = this.isControlEmpty(risk.controlesExistentes?.fuente);
        const medioEmpty = this.isControlEmpty(risk.controlesExistentes?.medio);
        const individuoEmpty = this.isControlEmpty(risk.controlesExistentes?.individuo);

        // SVG iconos por nivel de riesgo
        const riskLevelIcon = this.getRiskLevelIcon(risk.nrNivel);
        const nivelLower = (risk.nrNivel || 'iii').toLowerCase();

        return `
            <div class="risk-expanded-panel">
                <!-- FILA 1: Interpretación + Controles Existentes -->
                <div class="risk-panel-row risk-panel-row--primary">
                    <!-- Columna 1: Interpretación del Riesgo -->
                    <div class="risk-panel-card risk-panel-card--interpretation">
                        <div class="risk-panel-card__header">
                            <div class="risk-level-indicator risk-level-indicator--${nivelLower}">
                                ${riskLevelIcon}
                            </div>
                            <div class="risk-panel-card__title">
                                <span class="label">Interpretación del Riesgo</span>
                                <span class="level-badge level-badge--${nivelLower}">
                                    Nivel ${risk.nrNivel || 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div class="risk-panel-card__body">
                            <p class="interpretation-meaning">
                                <strong>${risk.interpretacion?.significado || 'Sin interpretación'}</strong>
                            </p>
                            <p class="interpretation-action">
                                ${risk.interpretacion?.accion || ''}
                            </p>
                        </div>
                    </div>

                    <!-- Columna 2: Control en Fuente -->
                    <div class="risk-panel-card risk-panel-card--control ${fuenteEmpty && isHighRisk ? 'risk-panel-card--warning' : ''}">
                        ${fuenteEmpty && isHighRisk ? `
                            <div class="control-warning-float">
                                <i data-lucide="alert-triangle"></i>
                                <span>Sin control</span>
                            </div>
                        ` : ''}
                        <div class="risk-panel-card__header">
                            <i data-lucide="target" class="control-icon"></i>
                            <span class="risk-panel-card__title">Fuente</span>
                        </div>
                        <div class="risk-panel-card__body">
                            ${this.renderControlContent(risk.controlesExistentes?.fuente)}
                        </div>
                    </div>

                    <!-- Columna 3: Control en Medio -->
                    <div class="risk-panel-card risk-panel-card--control ${medioEmpty && isHighRisk ? 'risk-panel-card--warning' : ''}">
                        ${medioEmpty && isHighRisk ? `
                            <div class="control-warning-float">
                                <i data-lucide="alert-triangle"></i>
                                <span>Sin control</span>
                            </div>
                        ` : ''}
                        <div class="risk-panel-card__header">
                            <i data-lucide="layers" class="control-icon"></i>
                            <span class="risk-panel-card__title">Medio</span>
                        </div>
                        <div class="risk-panel-card__body">
                            ${this.renderControlContent(risk.controlesExistentes?.medio)}
                        </div>
                    </div>

                    <!-- Columna 4: Control en Individuo -->
                    <div class="risk-panel-card risk-panel-card--control ${individuoEmpty && isHighRisk ? 'risk-panel-card--warning' : ''}">
                        ${individuoEmpty && isHighRisk ? `
                            <div class="control-warning-float">
                                <i data-lucide="alert-triangle"></i>
                                <span>Sin control</span>
                            </div>
                        ` : ''}
                        <div class="risk-panel-card__header">
                            <i data-lucide="user-check" class="control-icon"></i>
                            <span class="risk-panel-card__title">Individuo</span>
                        </div>
                        <div class="risk-panel-card__body">
                            ${this.renderControlContent(risk.controlesExistentes?.individuo)}
                        </div>
                    </div>
                </div>

                <!-- Botón de Sugerencias IA (si hay riesgo alto) -->
                ${isHighRisk && risk.sugerenciasIA ? `
                    <div class="risk-panel-suggestions-bar">
                        <button class="btn-suggestions" data-risk-id="${risk.id}">
                            <i data-lucide="lightbulb"></i>
                            <span>Ver sugerencias para reducir este riesgo</span>
                            <i data-lucide="chevron-right" class="arrow"></i>
                        </button>
                    </div>

                    <!-- Tooltip de sugerencias (position: fixed) -->
                    <div class="sugerencias-ia-tooltip" id="sugerencias-${risk.id}">
                        <div class="sugerencias-ia-tooltip__header">
                            <i data-lucide="sparkles"></i>
                            <span>Sugerencias para reducir el riesgo</span>
                        </div>
                        <div class="sugerencias-ia-tooltip__body">
                            ${risk.sugerenciasIA.fuente?.length ? `
                                <div class="sugerencia-grupo">
                                    <span class="sugerencia-label">En la Fuente</span>
                                    <ul>${risk.sugerenciasIA.fuente.map(s => `<li>${s}</li>`).join('')}</ul>
                                </div>
                            ` : ''}
                            ${risk.sugerenciasIA.medio?.length ? `
                                <div class="sugerencia-grupo">
                                    <span class="sugerencia-label">En el Medio</span>
                                    <ul>${risk.sugerenciasIA.medio.map(s => `<li>${s}</li>`).join('')}</ul>
                                </div>
                            ` : ''}
                            ${risk.sugerenciasIA.individuo?.length ? `
                                <div class="sugerencia-grupo">
                                    <span class="sugerencia-label">En el Individuo</span>
                                    <ul>${risk.sugerenciasIA.individuo.map(s => `<li>${s}</li>`).join('')}</ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- FILA 2: Medidas de Intervención Sugeridas -->
                ${this.hasControlesSugeridos(risk) ? `
                    <div class="risk-panel-row risk-panel-row--controls">
                        <div class="risk-panel-section-header">
                            <i data-lucide="shield-check"></i>
                            <span>Medidas de Intervención Sugeridas (ISO 45001)</span>
                        </div>
                        <div class="risk-panel-controls-grid">
                            ${this.renderControlSugerido(risk.controles?.eliminacion, 'Eliminación', 1, 'eliminacion')}
                            ${this.renderControlSugerido(risk.controles?.sustitucion, 'Sustitución', 2, 'sustitucion')}
                            ${this.renderControlSugerido(risk.controles?.epp, 'EPP', 3, 'epp')}
                            ${this.renderControlSugerido(risk.controles?.ingenieria, 'Controles de Ingeniería', 4, 'ingenieria')}
                            ${this.renderControlSugerido(risk.controles?.administrativos, 'Controles Administrativos', 5, 'administrativos')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Verifica si un control está vacío
     */
    isControlEmpty(controles) {
        if (!controles) return true;
        const items = Array.isArray(controles) ? controles : [controles];
        const validItems = items.filter(i => i && typeof i === 'string' && i.trim());
        return validItems.length === 0;
    }

    /**
     * Obtiene el icono SVG según el nivel de riesgo
     */
    getRiskLevelIcon(nivel) {
        const icons = {
            'V': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>`,
            'IV': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>`,
            'III': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                     <circle cx="12" cy="12" r="10"></circle>
                     <line x1="12" y1="8" x2="12" y2="12"></line>
                     <line x1="12" y1="16" x2="12.01" y2="16"></line>
                   </svg>`,
            'II': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>`,
            'I': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                   <polyline points="22 4 12 14.01 9 11.01"></polyline>
                 </svg>`
        };
        return icons[nivel] || icons['III'];
    }

    /**
     * Renderiza contenido de control existente
     */
    renderControlContent(controles) {
        if (!controles) {
            return `<p class="control-empty">No especificado</p>`;
        }

        const items = Array.isArray(controles) ? controles : [controles];
        const validItems = items.filter(i => i && typeof i === 'string' && i.trim());

        if (validItems.length === 0) {
            return `<p class="control-empty">No especificado</p>`;
        }

        return `
            <ul class="control-list">
                ${validItems.map(c => `<li>${c}</li>`).join('')}
            </ul>
        `;
    }

    /**
     * Verifica si hay controles sugeridos
     */
    hasControlesSugeridos(risk) {
        return risk.controles && (
            risk.controles.eliminacion?.length > 0 ||
            risk.controles.sustitucion?.length > 0 ||
            risk.controles.ingenieria?.length > 0 ||
            risk.controles.administrativos?.length > 0 ||
            risk.controles.epp?.length > 0
        );
    }

    /**
     * Renderiza control sugerido individual
     */
    renderControlSugerido(items, label, numero, tipo) {
        if (!items || items.length === 0) return '';

        const list = Array.isArray(items) ? items : [items];
        const validItems = list.filter(i => i && typeof i === 'string' && i.trim());

        if (validItems.length === 0) return '';

        return `
            <div class="control-sugerido control-sugerido--${tipo}">
                <div class="control-sugerido__header">
                    <span class="control-sugerido__badge">${numero}</span>
                    <span class="control-sugerido__title">${label}</span>
                </div>
                <ul class="control-sugerido__list">
                    ${validItems.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Attach tooltip event listeners for IA suggestions
     */
    attachTooltipEventListeners() {
        const btnSuggestions = this.container.querySelectorAll('.btn-suggestions');

        btnSuggestions.forEach(btn => {
            const riskId = btn.dataset.riskId;
            const tooltip = document.getElementById(`sugerencias-${riskId}`);

            if (!tooltip) return;

            // Click handler for button
            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                // Close other tooltips first
                this.container.querySelectorAll('.sugerencias-ia-tooltip.active').forEach(t => {
                    if (t !== tooltip) {
                        t.classList.remove('active');
                    }
                });

                // Position and toggle the tooltip
                this.positionTooltip(btn, tooltip);
                tooltip.classList.toggle('active');
            });
        });

        // Close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-suggestions') && !e.target.closest('.sugerencias-ia-tooltip')) {
                this.container.querySelectorAll('.sugerencias-ia-tooltip.active').forEach(t => {
                    t.classList.remove('active');
                });
            }
        });

        // Reposition tooltips on scroll
        const tableContainer = this.container.querySelector('.matriz-table-container');
        if (tableContainer) {
            tableContainer.addEventListener('scroll', () => {
                this.container.querySelectorAll('.sugerencias-ia-tooltip.active').forEach(tooltip => {
                    const riskId = tooltip.id.replace('sugerencias-', '');
                    const btn = this.container.querySelector(`.btn-suggestions[data-risk-id="${riskId}"]`);
                    if (btn) {
                        this.positionTooltip(btn, tooltip);
                    }
                });
            });
        }
    }

    /**
     * Position tooltip relative to trigger button using fixed positioning
     */
    positionTooltip(trigger, tooltip) {
        const rect = trigger.getBoundingClientRect();
        const tooltipWidth = 380; // Max width of tooltip from CSS
        const tooltipMaxHeight = 400;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const spacing = 12;

        // Calculate horizontal position
        let left = rect.right + spacing;

        // If tooltip would go off right edge, position to the left of button
        if (left + tooltipWidth > viewportWidth - 20) {
            left = rect.left - tooltipWidth - spacing;
        }

        // If still off screen on left, center it
        if (left < 20) {
            left = Math.max(20, (viewportWidth - tooltipWidth) / 2);
        }

        // Calculate vertical position - align with button top
        let top = rect.top;

        // If tooltip would go off bottom, adjust up
        if (top + tooltipMaxHeight > viewportHeight - 20) {
            top = viewportHeight - tooltipMaxHeight - 20;
        }

        // Ensure not above viewport
        if (top < 20) {
            top = 20;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        return `
            <div class="matriz-empty-state">
                <div class="matriz-empty-state__icon">
                    <i data-lucide="search-x"></i>
                </div>
                <h3 class="matriz-empty-state__title">No se encontraron peligros</h3>
                <p class="matriz-empty-state__description">
                    ${this.searchTerm || Object.values(this.filters).some(f => f)
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'Aún no hay peligros identificados en la matriz'}
                </p>
                ${this.searchTerm || Object.values(this.filters).some(f => f) ? `
                    <button class="btn btn--outline" id="btn-clear-search">
                        <i data-lucide="rotate-ccw"></i>
                        Limpiar búsqueda
                    </button>
                ` : ''}
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search input
        const searchInput = document.getElementById('matriz-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Filter dropdowns
        ['nivel', 'cargo', 'tipo'].forEach(filterName => {
            const select = document.getElementById(`filter-${filterName}`);
            if (select) {
                select.addEventListener('change', (e) => {
                    this.filters[filterName] = e.target.value;
                    this.applyFilters();
                });
            }
        });

        // Reset filters button
        const resetBtn = document.getElementById('btn-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }

        // Sortable headers
        this.container.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', (e) => {
                const column = e.currentTarget.dataset.column;
                this.sortTable(column);
            });
        });

        // Expandable rows
        this.container.querySelectorAll('[data-action="expand"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const riskId = e.currentTarget.dataset.riskId;
                this.toggleRowDetails(riskId, e.currentTarget);
            });
        });

        // Clear search button (in empty state)
        const clearSearchBtn = document.getElementById('btn-clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => this.resetFilters());
        }

        // Attach tooltip event listeners for IA suggestions
        this.attachTooltipEventListeners();
    }

    /**
     * Apply search and filters
     */
    applyFilters() {
        this.filteredData = this.data.filter(risk => {
            // Search term
            if (this.searchTerm) {
                const searchableText = `${risk.descripcion} ${risk.cargo} ${risk.area}`.toLowerCase();
                if (!searchableText.includes(this.searchTerm)) return false;
            }

            // Nivel filter
            if (this.filters.nivel && risk.nrNivel !== this.filters.nivel) return false;

            // Cargo filter
            if (this.filters.cargo && risk.cargo !== this.filters.cargo) return false;

            // Tipo filter
            if (this.filters.tipo && risk.tipo !== this.filters.tipo) return false;

            return true;
        });

        // Re-render table
        const tableContainer = this.container.querySelector('.matriz-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = this.renderTable();
            this.attachTableEventListeners();
        }

        // Update results count
        const resultsCount = this.container.querySelector('.matriz-results-count');
        if (resultsCount) {
            resultsCount.innerHTML = `Mostrando <strong>${this.filteredData.length}</strong> de <strong>${this.data.length}</strong> peligros`;
        }

        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        this.searchTerm = '';
        this.filters = { nivel: '', cargo: '', tipo: '' };
        this.sortConfig = { column: null, direction: 'asc' };
        this.render();
        this.attachEventListeners();
    }

    /**
     * Export Excel - Download existing matrix Excel file
     */
    async exportExcel() {
        if (!this.documento || !this.documento.excelUrl) {
            console.error('No Excel URL available');
            alert('No hay archivo Excel disponible para descargar');
            return;
        }

        const exportBtn = document.getElementById('btn-export-matriz-excel');
        if (!exportBtn) return;

        // Show loading state
        const originalHTML = exportBtn.innerHTML;
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> <span>Descargando...</span>';
        if (window.lucide) window.lucide.createIcons();

        try {
            // Fetch the Excel file
            const response = await fetch(this.documento.excelUrl);

            if (!response.ok) {
                throw new Error('Error al descargar el archivo');
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Extract filename from URL or use default
            const urlParts = this.documento.excelUrl.split('/');
            const filename = urlParts[urlParts.length - 1] || 'Matriz_GTC45.xlsx';
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            console.error('Error exporting matriz:', error);
            alert('Error al descargar el archivo Excel. Intente de nuevo.');
        } finally {
            // Restore button state
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalHTML;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    /**
     * Sort table by column
     */
    sortTable(column) {
        // Toggle direction if same column
        if (this.sortConfig.column === column) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.column = column;
            this.sortConfig.direction = 'asc';
        }

        // Sort filtered data
        this.filteredData.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            // Handle numeric columns
            if (['nd', 'ne', 'nc', 'np', 'nr'].includes(column)) {
                valA = Number(valA);
                valB = Number(valB);
            } else {
                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
            }

            if (valA < valB) return this.sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        // Re-render table
        const tableContainer = this.container.querySelector('.matriz-table-container');
        if (tableContainer) {
            tableContainer.innerHTML = this.renderTable();
            this.attachTableEventListeners();
        }

        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Toggle row details (expand/collapse)
     */
    toggleRowDetails(riskId, button) {
        // Try to find the details row - check in table container
        const tableContainer = this.container.querySelector('.matriz-table-container');
        if (!tableContainer) {
            console.error('Table container not found');
            return;
        }

        const detailsRow = tableContainer.querySelector(`#details-${riskId}`);

        if (!detailsRow) {
            console.error('Details row not found for risk:', riskId);
            console.log('Available detail rows:', tableContainer.querySelectorAll('.risk-details'));
            return;
        }

        // Toggle the expanded state
        const isExpanded = detailsRow.classList.contains('expanded');

        if (isExpanded) {
            // Collapse
            detailsRow.classList.remove('expanded');
        } else {
            // Expand
            detailsRow.classList.add('expanded');
        }

        // Update icon - Lucide replaces <i> with <svg>, so we need to handle both
        // Replace the button's innerHTML to ensure proper icon update
        if (button) {
            const newIcon = isExpanded ? 'chevron-down' : 'chevron-up';
            button.innerHTML = `<i data-lucide="${newIcon}"></i>`;
            if (window.lucide) window.lucide.createIcons();
        }
    }

    /**
     * Attach event listeners only to table elements
     */
    attachTableEventListeners() {
        // Sortable headers
        this.container.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', (e) => {
                const column = e.currentTarget.dataset.column;
                this.sortTable(column);
            });
        });

        // Expandable rows
        this.container.querySelectorAll('[data-action="expand"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const riskId = e.currentTarget.dataset.riskId;
                this.toggleRowDetails(riskId, e.currentTarget);
            });
        });

        // Clear search button
        const clearSearchBtn = document.getElementById('btn-clear-search');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => this.resetFilters());
        }

        // Attach tooltip event listeners for IA suggestions
        this.attachTooltipEventListeners();
    }
}

// Export for use in dashboardHandler
export default MatrizRiesgosComponent;
