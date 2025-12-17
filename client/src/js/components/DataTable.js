/**
 * DataTable Component
 * Sprint 6 - Component Library
 *
 * Componente reutilizable para tablas de datos con:
 * - Paginación
 * - Búsqueda/filtrado
 * - Ordenamiento
 * - Acciones por fila
 * - Estados de loading/empty
 * - Responsive design
 *
 * Inspirado en: Baymard Institute table research, Material Design tables
 */

class DataTable {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container #${containerId} not found`);
        }

        // Configuration
        this.options = {
            columns: options.columns || [],
            data: options.data || [],
            pageSize: options.pageSize || 10,
            searchable: options.searchable !== false,
            sortable: options.sortable !== false,
            actions: options.actions || [],
            onRowClick: options.onRowClick || null,
            emptyMessage: options.emptyMessage || 'No hay datos para mostrar',
            loadingMessage: options.loadingMessage || 'Cargando...',
            ...options
        };

        // State
        this.currentPage = 1;
        this.searchQuery = '';
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.isLoading = false;

        this.init();
    }

    /**
     * Initialize table
     */
    init() {
        this.render();
        this.attachEventListeners();
    }

    /**
     * Set loading state
     */
    setLoading(isLoading) {
        this.isLoading = isLoading;
        this.render();
    }

    /**
     * Update data
     */
    setData(data) {
        this.options.data = data;
        this.currentPage = 1;
        this.render();
    }

    /**
     * Get filtered and sorted data
     */
    getProcessedData() {
        let data = [...this.options.data];

        // Search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            data = data.filter(row => {
                return this.options.columns.some(col => {
                    const value = this.getCellValue(row, col.field);
                    return value && value.toString().toLowerCase().includes(query);
                });
            });
        }

        // Sort
        if (this.sortColumn) {
            const col = this.options.columns.find(c => c.field === this.sortColumn);
            data.sort((a, b) => {
                const aVal = this.getCellValue(a, this.sortColumn);
                const bVal = this.getCellValue(b, this.sortColumn);

                // Handle null/undefined
                if (aVal == null) return 1;
                if (bVal == null) return -1;

                // Use custom comparator if provided
                if (col.comparator) {
                    return col.comparator(aVal, bVal) * (this.sortDirection === 'asc' ? 1 : -1);
                }

                // Default comparison
                if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }

    /**
     * Get paginated data
     */
    getPaginatedData() {
        const data = this.getProcessedData();
        const start = (this.currentPage - 1) * this.options.pageSize;
        const end = start + this.options.pageSize;
        return data.slice(start, end);
    }

    /**
     * Get cell value from row
     */
    getCellValue(row, field) {
        // Support nested fields (e.g., "user.name")
        return field.split('.').reduce((obj, key) => obj?.[key], row);
    }

    /**
     * Render table
     */
    render() {
        const processedData = this.getProcessedData();
        const paginatedData = this.getPaginatedData();
        const totalPages = Math.ceil(processedData.length / this.options.pageSize);

        this.container.innerHTML = `
            <div class="datatable">
                ${this.renderToolbar(processedData.length)}
                ${this.isLoading ? this.renderLoading() : this.renderTable(paginatedData)}
                ${!this.isLoading && processedData.length > 0 ? this.renderPagination(totalPages) : ''}
            </div>
        `;
    }

    /**
     * Render toolbar (search, filters, actions)
     */
    renderToolbar(totalCount) {
        if (!this.options.searchable && !this.options.toolbar) {
            return '';
        }

        return `
            <div class="datatable__toolbar">
                ${this.options.searchable ? `
                    <div class="datatable__search">
                        <input
                            type="text"
                            class="datatable__search-input"
                            placeholder="Buscar..."
                            value="${this.searchQuery}">
                        <i data-lucide="search"></i>
                    </div>
                ` : ''}
                <div class="datatable__info">
                    ${totalCount} registro(s)
                </div>
                ${this.options.toolbar ? this.options.toolbar() : ''}
            </div>
        `;
    }

    /**
     * Render loading state
     */
    renderLoading() {
        return `
            <div class="datatable__loading">
                <div class="spinner"></div>
                <p>${this.options.loadingMessage}</p>
            </div>
        `;
    }

    /**
     * Render table
     */
    renderTable(data) {
        if (data.length === 0) {
            return `
                <div class="datatable__empty">
                    <i data-lucide="inbox"></i>
                    <p>${this.options.emptyMessage}</p>
                </div>
            `;
        }

        return `
            <div class="datatable__wrapper">
                <table class="datatable__table">
                    <thead>
                        <tr>
                            ${this.options.columns.map(col => this.renderHeaderCell(col)).join('')}
                            ${this.options.actions.length > 0 ? '<th class="datatable__th datatable__th--actions">Acciones</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((row, idx) => this.renderRow(row, idx)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Render header cell
     */
    renderHeaderCell(col) {
        const isSortable = this.options.sortable && col.sortable !== false;
        const isSorted = this.sortColumn === col.field;
        const sortIcon = isSorted
            ? (this.sortDirection === 'asc' ? 'chevron-up' : 'chevron-down')
            : 'chevrons-up-down';

        return `
            <th class="datatable__th ${isSortable ? 'datatable__th--sortable' : ''} ${isSorted ? 'datatable__th--sorted' : ''}"
                data-field="${col.field}"
                style="${col.width ? `width: ${col.width}` : ''}">
                <div class="datatable__th-content">
                    <span>${col.label}</span>
                    ${isSortable ? `<i data-lucide="${sortIcon}" class="datatable__sort-icon"></i>` : ''}
                </div>
            </th>
        `;
    }

    /**
     * Render data row
     */
    renderRow(row, index) {
        const isClickable = typeof this.options.onRowClick === 'function';

        return `
            <tr class="datatable__tr ${isClickable ? 'datatable__tr--clickable' : ''}"
                data-index="${index}">
                ${this.options.columns.map(col => this.renderCell(row, col)).join('')}
                ${this.options.actions.length > 0 ? this.renderActionsCell(row, index) : ''}
            </tr>
        `;
    }

    /**
     * Render data cell
     */
    renderCell(row, col) {
        const value = this.getCellValue(row, col.field);
        const displayValue = col.render ? col.render(value, row) : (value ?? '');

        return `
            <td class="datatable__td" data-field="${col.field}">
                ${displayValue}
            </td>
        `;
    }

    /**
     * Render actions cell
     */
    renderActionsCell(row, index) {
        return `
            <td class="datatable__td datatable__td--actions">
                <div class="datatable__actions">
                    ${this.options.actions.map(action => `
                        <button
                            class="datatable__action-btn"
                            data-action="${action.name}"
                            data-index="${index}"
                            title="${action.label}">
                            <i data-lucide="${action.icon}"></i>
                        </button>
                    `).join('')}
                </div>
            </td>
        `;
    }

    /**
     * Render pagination
     */
    renderPagination(totalPages) {
        if (totalPages <= 1) return '';

        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return `
            <div class="datatable__pagination">
                <button
                    class="datatable__page-btn"
                    data-page="${this.currentPage - 1}"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i data-lucide="chevron-left"></i>
                </button>

                ${startPage > 1 ? `
                    <button class="datatable__page-btn" data-page="1">1</button>
                    ${startPage > 2 ? '<span class="datatable__ellipsis">...</span>' : ''}
                ` : ''}

                ${pages.map(page => `
                    <button
                        class="datatable__page-btn ${page === this.currentPage ? 'datatable__page-btn--active' : ''}"
                        data-page="${page}">
                        ${page}
                    </button>
                `).join('')}

                ${endPage < totalPages ? `
                    ${endPage < totalPages - 1 ? '<span class="datatable__ellipsis">...</span>' : ''}
                    <button class="datatable__page-btn" data-page="${totalPages}">${totalPages}</button>
                ` : ''}

                <button
                    class="datatable__page-btn"
                    data-page="${this.currentPage + 1}"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                    <i data-lucide="chevron-right"></i>
                </button>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Delegated event listeners
        this.container.addEventListener('input', (e) => {
            if (e.target.matches('.datatable__search-input')) {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.render();
                this.refreshLucide();
            }
        });

        this.container.addEventListener('click', (e) => {
            // Sort
            const th = e.target.closest('.datatable__th--sortable');
            if (th) {
                const field = th.dataset.field;
                if (this.sortColumn === field) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = field;
                    this.sortDirection = 'asc';
                }
                this.render();
                this.refreshLucide();
                return;
            }

            // Pagination
            const pageBtn = e.target.closest('.datatable__page-btn');
            if (pageBtn && !pageBtn.disabled) {
                this.currentPage = parseInt(pageBtn.dataset.page);
                this.render();
                this.refreshLucide();
                return;
            }

            // Action buttons
            const actionBtn = e.target.closest('.datatable__action-btn');
            if (actionBtn) {
                const actionName = actionBtn.dataset.action;
                const index = parseInt(actionBtn.dataset.index);
                const row = this.getPaginatedData()[index];
                const action = this.options.actions.find(a => a.name === actionName);
                if (action && action.handler) {
                    action.handler(row, index);
                }
                return;
            }

            // Row click
            const tr = e.target.closest('.datatable__tr--clickable');
            if (tr && !e.target.closest('.datatable__action-btn')) {
                const index = parseInt(tr.dataset.index);
                const row = this.getPaginatedData()[index];
                if (this.options.onRowClick) {
                    this.options.onRowClick(row, index);
                }
            }
        });
    }

    /**
     * Refresh Lucide icons
     */
    refreshLucide() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Destroy table
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

export default DataTable;
