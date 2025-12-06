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
                    interpretacion: peligro.interpretacion,
                    controles: peligro.controles
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
     * Render expanded risk details
     */
    renderRiskDetails(risk) {
        return `
            <div class="details-grid">
                <!-- Interpretación -->
                <div class="details-section">
                    <div class="details-section__title">
                        <i data-lucide="info"></i>
                        Interpretación del Riesgo
                    </div>
                    <div class="details-section__content">
                        <strong>${risk.interpretacion?.significado || 'N/A'}</strong>
                        <p>${risk.interpretacion?.accion || ''}</p>
                    </div>
                </div>

                <!-- Eliminación -->
                ${risk.controles?.eliminacion && risk.controles.eliminacion.length > 0 ? `
                    <div class="details-section">
                        <div class="details-section__title">
                            <i data-lucide="x-circle"></i>
                            Eliminación
                        </div>
                        <div class="details-section__content">
                            <ul>
                                ${risk.controles.eliminacion.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                ` : ''}

                <!-- Sustitución -->
                ${risk.controles?.sustitucion && risk.controles.sustitucion.length > 0 ? `
                    <div class="details-section">
                        <div class="details-section__title">
                            <i data-lucide="repeat"></i>
                            Sustitución
                        </div>
                        <div class="details-section__content">
                            <ul>
                                ${risk.controles.sustitucion.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                ` : ''}

                <!-- Controles de Ingeniería -->
                ${risk.controles?.ingenieria && risk.controles.ingenieria.length > 0 ? `
                    <div class="details-section">
                        <div class="details-section__title">
                            <i data-lucide="settings"></i>
                            Controles de Ingeniería
                        </div>
                        <div class="details-section__content">
                            <ul>
                                ${risk.controles.ingenieria.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                ` : ''}

                <!-- Controles Administrativos -->
                ${risk.controles?.administrativos && risk.controles.administrativos.length > 0 ? `
                    <div class="details-section">
                        <div class="details-section__title">
                            <i data-lucide="clipboard-list"></i>
                            Controles Administrativos
                        </div>
                        <div class="details-section__content">
                            <ul>
                                ${risk.controles.administrativos.map(c => `<li>${c}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                ` : ''}

                <!-- EPP -->
                ${risk.controles?.epp && risk.controles.epp.length > 0 ? `
                    <div class="details-section">
                        <div class="details-section__title">
                            <i data-lucide="shield-check"></i>
                            Equipos de Protección Personal (EPP)
                        </div>
                        <div class="details-section__content">
                            <ul>
                                ${risk.controles.epp.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                ` : ''}

                <!-- Mensaje si no hay controles -->
                ${!risk.controles || (
                    (!risk.controles.eliminacion || risk.controles.eliminacion.length === 0) &&
                    (!risk.controles.sustitucion || risk.controles.sustitucion.length === 0) &&
                    (!risk.controles.ingenieria || risk.controles.ingenieria.length === 0) &&
                    (!risk.controles.administrativos || risk.controles.administrativos.length === 0) &&
                    (!risk.controles.epp || risk.controles.epp.length === 0)
                ) ? `
                    <div class="details-section">
                        <div class="details-section__title">
                            <i data-lucide="alert-circle"></i>
                            Medidas de Control
                        </div>
                        <div class="details-section__content">
                            <p class="text-muted">No se han definido medidas de control para este riesgo.</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
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
        const icon = button ? button.querySelector('i') : null;

        if (!detailsRow) {
            console.error('Details row not found for risk:', riskId);
            console.log('Available detail rows:', tableContainer.querySelectorAll('.risk-details'));
            return;
        }

        if (!icon) {
            console.error('Icon not found in button');
            return;
        }

        if (detailsRow.classList.contains('expanded')) {
            // Collapse
            detailsRow.classList.remove('expanded');
            icon.setAttribute('data-lucide', 'chevron-down');
        } else {
            // Expand
            detailsRow.classList.add('expanded');
            icon.setAttribute('data-lucide', 'chevron-up');
        }

        if (window.lucide) window.lucide.createIcons();
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
    }
}

// Export for use in dashboardHandler
export default MatrizRiesgosComponent;
