/**
 * Dashboard Premium Handler
 * Sprint 6 - Fase B
 *
 * Manages navigation, state, and page handlers for the Dashboard Premium
 */

// ============================================
// STATE MANAGEMENT
// ============================================
const DashboardState = {
    currentPage: 'home',
    companyId: null,
    companyName: '',
    user: null,
    isLoading: false,
    data: {
        summary: null,
        alerts: null,
        conditions: null,
        risks: null,
        examenes: null,
        cargos: null,
        matriz: null
    }
};

// ============================================
// DOM SELECTORS
// ============================================
const selectors = {
    sidebar: '#sidebar',
    sidebarToggle: '#sidebar-toggle',
    sidebarOverlay: '#sidebar-overlay',
    mobileMenuToggle: '#mobile-menu-toggle',
    navItems: '.sidebar-nav__item',
    pages: '.dashboard-page',
    header: '#dashboard-header',
    content: '#dashboard-content',
    companyName: '#company-name',
    userAvatar: '#user-avatar',
    pendingCount: '#pending-count'
};

// ============================================
// NAVIGATION HANDLER
// ============================================
class NavigationHandler {
    constructor() {
        this.pages = new Map();
        this.currentPage = null;
        this.init();
    }

    init() {
        // Cache all pages
        document.querySelectorAll(selectors.pages).forEach(page => {
            const pageName = page.dataset.page;
            this.pages.set(pageName, page);
        });

        // Bind navigation events
        this.bindNavEvents();
        this.bindSidebarEvents();

        // Navigate to initial page (from URL hash or default)
        const initialPage = window.location.hash.replace('#', '') || 'home';
        this.navigateTo(initialPage);
    }

    bindNavEvents() {
        document.querySelectorAll(selectors.navItems).forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.navigateTo(page);
                }
            });
        });

        // Also handle card navigation links
        document.querySelectorAll('[data-navigate]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.navigate;
                if (page) {
                    this.navigateTo(page);
                }
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            const page = window.location.hash.replace('#', '') || 'home';
            this.navigateTo(page, false);
        });
    }

    bindSidebarEvents() {
        const sidebar = document.querySelector(selectors.sidebar);
        const toggle = document.querySelector(selectors.sidebarToggle);
        const overlay = document.querySelector(selectors.sidebarOverlay);
        const mobileToggle = document.querySelector(selectors.mobileMenuToggle);

        // Sidebar collapse toggle
        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                document.querySelector('.dashboard-main').classList.toggle('sidebar-collapsed');
            });
        }

        // Mobile menu toggle
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('visible');
            });
        }

        // Close sidebar on overlay click
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('visible');
            });
        }
    }

    navigateTo(pageName, updateHistory = true) {
        // Check if page exists
        if (!this.pages.has(pageName)) {
            console.warn(`Page "${pageName}" not found`);
            pageName = 'home';
        }

        // Hide current page
        if (this.currentPage) {
            const currentPageEl = this.pages.get(this.currentPage);
            if (currentPageEl) {
                currentPageEl.style.display = 'none';
            }
        }

        // Show target page
        const targetPageEl = this.pages.get(pageName);
        if (targetPageEl) {
            targetPageEl.style.display = 'block';
        }

        // Update nav active state
        document.querySelectorAll(selectors.navItems).forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // Update state
        this.currentPage = pageName;
        DashboardState.currentPage = pageName;

        // Update URL hash
        if (updateHistory) {
            window.history.pushState({ page: pageName }, '', `#${pageName}`);
        }

        // Close mobile sidebar
        const sidebar = document.querySelector(selectors.sidebar);
        const overlay = document.querySelector(selectors.sidebarOverlay);
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('visible');

        // Load page data
        this.loadPageData(pageName);

        // Reinitialize Lucide icons for dynamic content
        if (window.lucide) {
            window.lucide.createIcons();
        }

        console.log(`Navigated to: ${pageName}`);
    }

    async loadPageData(pageName) {
        const pageHandlers = {
            'home': loadDashboardHome,
            'inteligencia': loadIntelligencePage,
            'mapa-org': loadOrgMapPage,
            'cargos': loadCargosPage,
            'examenes': loadExamenesPage,
            'matriz': loadMatrizPage,
            'estadisticas': loadEstadisticasPage,
            'sve': loadSVEPage,
            'psicosocial': loadPsicosocialPage,
            'documentos': loadDocumentosPage,
            'profesiograma': loadProfesiogramaPage,
            'config': loadConfigPage,
            'panel-medico': loadPanelMedicoPage
        };

        const handler = pageHandlers[pageName];
        if (handler) {
            try {
                await handler();
            } catch (error) {
                console.error(`Error loading page ${pageName}:`, error);
            }
        }
    }
}

// ============================================
// PAGE HANDLERS
// ============================================

/**
 * Dashboard Home Page
 */
async function loadDashboardHome() {
    console.log('Loading Dashboard Home...');

    try {
        // Update live indicator times
        updateLiveIndicator();

        // Fetch summary data (mock for now, will connect to API)
        const summaryData = await fetchDashboardSummary();

        if (summaryData) {
            renderHomeMetrics(summaryData);
        }

        // Render donut chart
        renderDonutChart('donut-cumplimiento', 87);

    } catch (error) {
        console.error('Error loading dashboard home:', error);
    }
}

function updateLiveIndicator() {
    const now = new Date();
    const lastUpdate = document.getElementById('last-update');
    const nextUpdate = document.getElementById('next-update');

    if (lastUpdate) {
        lastUpdate.textContent = `Hoy ${formatTime(now)}`;
    }

    if (nextUpdate) {
        const next = new Date(now.getTime() + 6 * 60 * 60 * 1000); // +6 hours
        nextUpdate.textContent = `Hoy ${formatTime(next)}`;
    }
}

function formatTime(date) {
    return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).toUpperCase();
}

async function fetchDashboardSummary() {
    // TODO: Connect to real API
    // For now, return mock data
    return {
        cumplimiento: 87,
        trabajadores: {
            total: 53,
            alDia: 45,
            alertas: 8
        },
        alertas: {
            total: 8,
            vencidos: 3,
            proximos: 5
        },
        examenes: {
            vencidos: 3,
            proximos: 5
        },
        riesgos: {
            nivelV: 8,
            nivelIV: 15,
            total: 34
        },
        condiciones: {
            hipoacusia: 15,
            trend: 3
        },
        sve: 3,
        peligros: 122
    };
}

function renderHomeMetrics(data) {
    // Main metrics
    setTextContent('cumplimiento-value', data.cumplimiento);
    setTextContent('total-trabajadores', data.trabajadores.total);
    setTextContent('trabajadores-aldia', data.trabajadores.alDia);
    setTextContent('trabajadores-alertas', data.trabajadores.alertas);
    setTextContent('total-alertas', data.alertas.total);
    setTextContent('alertas-vencidos', data.alertas.vencidos);
    setTextContent('alertas-proximos', data.alertas.proximos);

    // Secondary metrics
    setTextContent('hipoacusia-percent', `${data.condiciones.hipoacusia}%`);
    setTextContent('condition-trend-text', `+${data.condiciones.trend}% vs trimestre`);
    setTextContent('examenes-vencidos', data.examenes.vencidos);
    setTextContent('examenes-proximos', data.examenes.proximos);
    setTextContent('riesgos-v', data.riesgos.nivelV);
    setTextContent('riesgos-iv', data.riesgos.nivelIV);
    setTextContent('riesgos-total', data.riesgos.total);

    // Quick stats
    setTextContent('stat-cumplimiento', `${data.cumplimiento}%`);
    setTextContent('stat-examenes-dia', data.trabajadores.alDia);
    setTextContent('stat-total-trabajadores', data.trabajadores.total);
    setTextContent('stat-sve-activos', data.sve);
    setTextContent('stat-peligros', data.peligros);

    // AI Insights (mock)
    setTextContent('insight-pattern-text', 'Aumento 15% deterioro auditivo en soldadores últimos 6 meses');
    setTextContent('insight-recommendation-text', 'Auditoría uso EPP + medir ruido');
}

function renderDonutChart(containerId, percentage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    container.innerHTML = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <!-- Background circle -->
            <circle
                cx="${size/2}"
                cy="${size/2}"
                r="${radius}"
                fill="none"
                stroke="#e5e7eb"
                stroke-width="${strokeWidth}"
            />
            <!-- Progress circle -->
            <circle
                cx="${size/2}"
                cy="${size/2}"
                r="${radius}"
                fill="none"
                stroke="#5dc4af"
                stroke-width="${strokeWidth}"
                stroke-linecap="round"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"
                transform="rotate(-90 ${size/2} ${size/2})"
                style="transition: stroke-dashoffset 0.5s ease;"
            />
            <!-- Center text -->
            <text
                x="${size/2}"
                y="${size/2}"
                text-anchor="middle"
                dominant-baseline="middle"
                font-family="Poppins, sans-serif"
                font-size="36"
                font-weight="700"
                fill="#383d47"
            >${percentage}%</text>
        </svg>
    `;
}

/**
 * Intelligence Page
 */
async function loadIntelligencePage() {
    console.log('Loading Intelligence Page...');
    showPageContent('inteligencia-content', `
        <div class="empty-state">
            <div class="empty-state__icon">
                <i data-lucide="brain"></i>
            </div>
            <h3 class="empty-state__title">Inteligencia de Salud</h3>
            <p class="empty-state__description">Aún no hay datos disponibles. Complete el wizard de riesgos para generar análisis de salud.</p>
            <a href="/pages/wizard_riesgos.html" class="btn btn--primary">Iniciar Wizard</a>
        </div>
    `);
    if (window.lucide) window.lucide.createIcons();
}

/**
 * Org Map Page
 */
async function loadOrgMapPage() {
    console.log('Loading Org Map Page...');
    const container = document.getElementById('org-chart-canvas');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i data-lucide="network"></i>
                </div>
                <h3 class="empty-state__title">Mapa Organizacional</h3>
                <p class="empty-state__description">Aún no hay datos disponibles. Agregue cargos para visualizar la estructura organizacional.</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Cargos Page - Muestra los cargos configurados desde el wizard
 */
async function loadCargosPage() {
    console.log('Loading Cargos Page...');

    // Get wizard data from localStorage
    const wizardState = localStorage.getItem('genesys_wizard_state');

    if (!wizardState) {
        showPageContent('cargos-content', `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i data-lucide="users"></i>
                </div>
                <h3 class="empty-state__title">Gestión de Cargos</h3>
                <p class="empty-state__description">Aún no hay cargos registrados. Complete el wizard para agregar cargos a la empresa.</p>
                <a href="/pages/wizard_riesgos.html" class="btn btn--primary">Agregar Cargos</a>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    try {
        const state = JSON.parse(wizardState);
        const formData = state.formData || {};
        const cargos = formData.cargos || [];

        if (cargos.length === 0) {
            showPageContent('cargos-content', `
                <div class="empty-state">
                    <div class="empty-state__icon">
                        <i data-lucide="users"></i>
                    </div>
                    <h3 class="empty-state__title">Sin Cargos</h3>
                    <p class="empty-state__description">No hay cargos configurados. Agregue cargos en el wizard.</p>
                    <a href="/pages/wizard_riesgos.html" class="btn btn--primary">Agregar Cargos</a>
                </div>
            `);
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        // Generate cargo cards
        const cargosHTML = cargos.map((cargo, index) => {
            const gesCount = cargo.gesSeleccionados?.length || cargo.ges?.length || 0;
            const numPersonas = cargo.numPersonas || cargo.numTrabajadores || 0;

            // Conditions badges
            const conditions = [];
            if (cargo.trabajaAlturas) conditions.push({ icon: 'mountain', label: 'Alturas' });
            if (cargo.espaciosConfinados || cargo.trabajaEspaciosConfinados) conditions.push({ icon: 'box', label: 'Esp. Confinados' });
            if (cargo.manipulaAlimentos) conditions.push({ icon: 'utensils', label: 'Alimentos' });
            if (cargo.conduceVehiculo) conditions.push({ icon: 'car', label: 'Conducción' });

            const conditionsBadges = conditions.map(c =>
                `<span class="badge badge--warning"><i data-lucide="${c.icon}" style="width:12px;height:12px;"></i> ${c.label}</span>`
            ).join('');

            return `
                <div class="card">
                    <div class="card__header">
                        <h3 class="card__title">${cargo.nombre || 'Cargo ' + (index + 1)}</h3>
                        <span class="badge badge--${gesCount > 0 ? 'primary' : 'muted'}">${gesCount} riesgo${gesCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="card__body">
                        <div class="cargo-info">
                            <div class="cargo-info__row">
                                <i data-lucide="map-pin" class="text-muted"></i>
                                <span>${cargo.area || 'Sin área'} / ${cargo.zona || 'Sin zona'}</span>
                            </div>
                            <div class="cargo-info__row">
                                <i data-lucide="users" class="text-muted"></i>
                                <span>${numPersonas} persona${numPersonas !== 1 ? 's' : ''}</span>
                            </div>
                            ${conditions.length > 0 ? `
                                <div class="cargo-info__conditions mt-2">
                                    ${conditionsBadges}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card__footer">
                        <a href="/pages/wizard_riesgos.html" class="btn btn--sm btn--outline">
                            <i data-lucide="edit-2"></i> Editar
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        // Summary stats
        const totalPersonas = cargos.reduce((sum, c) => sum + (c.numPersonas || c.numTrabajadores || 0), 0);
        const cargosConAlturas = cargos.filter(c => c.trabajaAlturas).length;
        const cargosConEspacios = cargos.filter(c => c.espaciosConfinados || c.trabajaEspaciosConfinados).length;

        showPageContent('cargos-content', `
            <div class="dashboard-grid dashboard-grid--cols-4 mb-6">
                <div class="card card--stat">
                    <div class="stat-value">${cargos.length}</div>
                    <div class="stat-label">Total Cargos</div>
                </div>
                <div class="card card--stat">
                    <div class="stat-value">${totalPersonas}</div>
                    <div class="stat-label">Total Personas</div>
                </div>
                <div class="card card--stat card--warning">
                    <div class="stat-value stat-value--warning">${cargosConAlturas}</div>
                    <div class="stat-label">Con Trabajo en Alturas</div>
                </div>
                <div class="card card--stat">
                    <div class="stat-value">${cargosConEspacios}</div>
                    <div class="stat-label">Con Esp. Confinados</div>
                </div>
            </div>
            <div class="dashboard-grid dashboard-grid--cols-3">
                ${cargosHTML}
            </div>
            <div class="text-center mt-6">
                <a href="/pages/wizard_riesgos.html" class="btn btn--primary">
                    <i data-lucide="plus"></i> Agregar Cargo
                </a>
            </div>
        `);

        if (window.lucide) window.lucide.createIcons();

    } catch (e) {
        console.error('Error loading cargos:', e);
        showPageContent('cargos-content', `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i data-lucide="alert-circle"></i>
                </div>
                <h3 class="empty-state__title">Error</h3>
                <p class="empty-state__description">Hubo un error al cargar los cargos.</p>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Examenes Page - Muestra exámenes recomendados por cargo desde el wizard
 */
async function loadExamenesPage() {
    console.log('Loading Examenes Page...');

    // Get wizard data from localStorage
    const wizardState = localStorage.getItem('genesys_wizard_state');

    if (!wizardState) {
        setTextContent('examenes-stat-vencidos', '0');
        setTextContent('examenes-stat-proximos', '0');
        setTextContent('examenes-stat-aldia', '0');
        setTextContent('examenes-stat-agendar', '0');
        setTextContent('examenes-showing', 'Mostrando 0 de 0');

        const tableBody = document.getElementById('examenes-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="table-empty">
                        <div class="empty-state empty-state--inline">
                            <i data-lucide="clipboard-list"></i>
                            <span>Complete el wizard para ver los exámenes recomendados por cargo</span>
                        </div>
                    </td>
                </tr>
            `;
        }
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    try {
        const state = JSON.parse(wizardState);
        const formData = state.formData || {};
        const cargos = formData.cargos || [];

        if (cargos.length === 0) {
            setTextContent('examenes-stat-vencidos', '0');
            setTextContent('examenes-stat-proximos', '0');
            setTextContent('examenes-stat-aldia', '0');
            setTextContent('examenes-stat-agendar', '0');
            setTextContent('examenes-showing', 'Mostrando 0 de 0');

            const tableBody = document.getElementById('examenes-table-body');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="table-empty">
                            <div class="empty-state empty-state--inline">
                                <i data-lucide="users"></i>
                                <span>No hay cargos configurados. Agregue cargos en el wizard.</span>
                            </div>
                        </td>
                    </tr>
                `;
            }
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        // Map de nombres de exámenes
        const EXAMENES_NOMBRES = {
            'EMO': 'Examen Médico Ocupacional',
            'EMOA': 'EMO con énfasis en Alturas',
            'EMOMP': 'EMO Manipuladores de Alimentos',
            'OPTO': 'Visiometría',
            'AUD': 'Audiometría',
            'ECG': 'Electrocardiograma',
            'GLI': 'Glicemia',
            'PL': 'Perfil Lipídico',
            'PE': 'Prueba de Esfuerzo',
            'ESP': 'Espirometría',
            'PSM': 'Prueba Psicosensométrica',
            'PST': 'Prueba Psicotécnica',
            'FRO': 'Frotis de Garganta',
            'KOH': 'KOH (Examen Hongos)',
            'COP': 'Coprológico'
        };

        // Paquete mínimo universal (todos los trabajadores)
        const PAQUETE_MINIMO = ['EMO', 'OPTO', 'AUD'];

        // Exámenes por toggle especial
        const EXAMENES_POR_TOGGLE = {
            trabajaAlturas: ['EMOA', 'GLI', 'PL', 'PE', 'ESP', 'ECG'],
            manipulaAlimentos: ['EMOMP', 'FRO', 'KOH', 'COP'],
            conduceVehiculo: ['PSM', 'GLI', 'PL'],
            trabajaEspaciosConfinados: ['EMO', 'ESP', 'ECG', 'GLI', 'PL', 'PSM'],
            espaciosConfinados: ['EMO', 'ESP', 'ECG', 'GLI', 'PL', 'PSM']
        };

        // Procesar cada cargo y generar filas de exámenes
        let totalExamenes = 0;
        let porAgendar = 0;
        const tableRows = [];

        cargos.forEach(cargo => {
            const examenesSet = new Set(PAQUETE_MINIMO);

            // Agregar exámenes por toggles especiales
            Object.entries(EXAMENES_POR_TOGGLE).forEach(([toggle, examenes]) => {
                if (cargo[toggle]) {
                    examenes.forEach(ex => examenesSet.add(ex));
                }
            });

            // Agregar exámenes de los GES seleccionados
            const gesArray = cargo.gesSeleccionados || cargo.ges || [];
            gesArray.forEach(ges => {
                if (ges.examenesMedicos) {
                    Object.keys(ges.examenesMedicos).forEach(ex => examenesSet.add(ex));
                }
            });

            // Generar filas para este cargo
            const examenesArray = Array.from(examenesSet);
            const numPersonas = cargo.numPersonas || cargo.numTrabajadores || 1;

            examenesArray.forEach(examenCode => {
                totalExamenes++;
                porAgendar++;

                tableRows.push(`
                    <tr>
                        <td><input type="checkbox" class="examen-checkbox" data-cargo="${cargo.nombre}" data-examen="${examenCode}" /></td>
                        <td>--</td>
                        <td>
                            <div class="cell-cargo">
                                <strong>${cargo.nombre || 'Sin nombre'}</strong>
                                <span class="text-xs text-muted">${numPersonas} persona${numPersonas !== 1 ? 's' : ''}</span>
                            </div>
                        </td>
                        <td>
                            <span class="badge badge--primary">${examenCode}</span>
                            <span class="text-sm">${EXAMENES_NOMBRES[examenCode] || examenCode}</span>
                        </td>
                        <td class="text-muted">Por programar</td>
                        <td><span class="badge badge--warning">Por agendar</span></td>
                        <td>
                            <button class="btn btn--icon btn--sm" title="Agendar examen">
                                <i data-lucide="calendar-plus"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });
        });

        // Update stats
        setTextContent('examenes-stat-vencidos', '0');
        setTextContent('examenes-stat-proximos', '0');
        setTextContent('examenes-stat-aldia', '0');
        setTextContent('examenes-stat-agendar', porAgendar.toString());
        setTextContent('examenes-showing', `Mostrando ${totalExamenes} de ${totalExamenes}`);

        // Populate filter dropdowns with cargos
        const filterCargo = document.getElementById('filter-cargo');
        if (filterCargo) {
            filterCargo.innerHTML = '<option value="">Cargo: Todos</option>';
            cargos.forEach(cargo => {
                filterCargo.innerHTML += `<option value="${cargo.nombre}">${cargo.nombre}</option>`;
            });
        }

        // Populate table
        const tableBody = document.getElementById('examenes-table-body');
        if (tableBody) {
            if (tableRows.length > 0) {
                tableBody.innerHTML = tableRows.join('');
            } else {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="table-empty">
                            <div class="empty-state empty-state--inline">
                                <i data-lucide="check-circle"></i>
                                <span>No hay exámenes pendientes</span>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }

        if (window.lucide) window.lucide.createIcons();

    } catch (e) {
        console.error('Error loading examenes:', e);
        const tableBody = document.getElementById('examenes-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="table-empty">
                        <div class="empty-state empty-state--inline">
                            <i data-lucide="alert-circle"></i>
                            <span>Error al cargar los exámenes</span>
                        </div>
                    </td>
                </tr>
            `;
        }
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Matriz GTC-45 Page
 */
async function loadMatrizPage() {
    console.log('Loading Matriz Page...');

    // Get wizard data from localStorage
    const wizardState = localStorage.getItem('genesys_wizard_state');

    if (!wizardState) {
        setTextContent('matriz-total', '0');
        setTextContent('matriz-nivel-v', '0');
        setTextContent('matriz-nivel-iv', '0');
        setTextContent('matriz-nivel-iii', '0');
        setTextContent('matriz-nivel-i-ii', '0');
        setTextContent('matriz-fecha', new Date().toLocaleDateString('es-CO'));
        setTextContent('matriz-responsable', 'Sin asignar');

        showPageContent('matriz-critical-content', `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i data-lucide="layout-grid"></i>
                </div>
                <h3 class="empty-state__title">Matriz de Riesgos GTC-45</h3>
                <p class="empty-state__description">Aún no hay peligros identificados. Complete el wizard para generar la matriz de riesgos.</p>
                <a href="/pages/wizard_riesgos.html" class="btn btn--primary">Crear Matriz</a>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    try {
        const state = JSON.parse(wizardState);
        const formData = state.formData || {};
        const cargos = formData.cargos || [];

        // Count risks by level
        let totalGES = 0;
        let nivelV = 0, nivelIV = 0, nivelIII = 0, nivelIII_II = 0;
        const criticalRisks = [];

        cargos.forEach(cargo => {
            const gesArray = cargo.gesSeleccionados || cargo.ges || [];
            gesArray.forEach(ges => {
                totalGES++;
                const nr = ges.niveles?.NR || ges.nivelRiesgo || 0;
                const nrNum = parseInt(nr) || 0;

                if (nrNum > 600) {
                    nivelV++;
                    criticalRisks.push({ cargo: cargo.nombre || cargo.cargoName, ges: ges.ges || ges.nombre, nivel: 'V', nr: nrNum });
                } else if (nrNum > 360) {
                    nivelIV++;
                    criticalRisks.push({ cargo: cargo.nombre || cargo.cargoName, ges: ges.ges || ges.nombre, nivel: 'IV', nr: nrNum });
                } else if (nrNum > 120) {
                    nivelIII++;
                } else {
                    nivelIII_II++;
                }
            });
        });

        // Update stats
        setTextContent('matriz-total', totalGES.toString());
        setTextContent('matriz-nivel-v', nivelV.toString());
        setTextContent('matriz-nivel-iv', nivelIV.toString());
        setTextContent('matriz-nivel-iii', nivelIII.toString());
        setTextContent('matriz-nivel-i-ii', nivelIII_II.toString());
        setTextContent('matriz-fecha', new Date().toLocaleDateString('es-CO'));
        setTextContent('matriz-responsable', formData.nombreEmpresa || 'Sin asignar');

        // Show critical risks or success message
        if (criticalRisks.length > 0) {
            const criticalHTML = criticalRisks.map(r => `
                <div class="card card--danger mb-3">
                    <div class="card__body">
                        <div class="flex justify-between items-center">
                            <div>
                                <h4 class="font-semibold">${r.ges}</h4>
                                <p class="text-sm text-muted">Cargo: ${r.cargo}</p>
                            </div>
                            <span class="badge badge--${r.nivel === 'V' ? 'danger' : 'warning'}">
                                Nivel ${r.nivel} (NR: ${r.nr})
                            </span>
                        </div>
                    </div>
                </div>
            `).join('');

            showPageContent('matriz-critical-content', criticalHTML);
        } else if (totalGES > 0) {
            showPageContent('matriz-critical-content', `
                <div class="card card--success">
                    <div class="card__body text-center">
                        <i data-lucide="check-circle" class="text-success mb-2" style="width:48px;height:48px;"></i>
                        <h3>Sin riesgos críticos</h3>
                        <p class="text-muted">No hay peligros de nivel IV o V en la matriz actual.</p>
                    </div>
                </div>
            `);
        } else {
            showPageContent('matriz-critical-content', `
                <div class="empty-state">
                    <div class="empty-state__icon">
                        <i data-lucide="layout-grid"></i>
                    </div>
                    <h3 class="empty-state__title">Sin peligros identificados</h3>
                    <p class="empty-state__description">Agregue riesgos en el wizard para completar la matriz.</p>
                    <a href="/pages/wizard_riesgos.html" class="btn btn--primary">Ir al Wizard</a>
                </div>
            `);
        }

        // Setup Excel export button
        setupMatrizExcelExport(formData);

    } catch (e) {
        console.error('Error loading matriz:', e);
        showPageContent('matriz-critical-content', `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i data-lucide="alert-circle"></i>
                </div>
                <h3 class="empty-state__title">Error al cargar</h3>
                <p class="empty-state__description">Hubo un error al cargar los datos de la matriz.</p>
            </div>
        `);
    }

    if (window.lucide) window.lucide.createIcons();
}

/**
 * Setup Excel export for Matriz GTC-45
 */
function setupMatrizExcelExport(formData) {
    const exportBtn = document.getElementById('btn-export-matriz-excel');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', async () => {
        exportBtn.disabled = true;
        const originalHTML = exportBtn.innerHTML;
        exportBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Generando...';
        if (window.lucide) window.lucide.createIcons();

        try {
            const response = await fetch('/api/matriz-riesgos/generar-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formData: formData,
                    companyName: formData.nombreEmpresa || 'Empresa',
                    nit: formData.nit || 'N/A'
                })
            });

            if (!response.ok) throw new Error('Error generating Excel');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Matriz_GTC45_${formData.nombreEmpresa || 'Empresa'}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            console.error('Error exporting matriz:', error);
            alert('Error al exportar la matriz. Intente de nuevo.');
        } finally {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalHTML;
            if (window.lucide) window.lucide.createIcons();
        }
    });
}

/**
 * Estadisticas Page
 */
async function loadEstadisticasPage() {
    console.log('Loading Estadisticas Page...');
    showPageContent('estadisticas-content', `
        <div class="empty-state">
            <div class="empty-state__icon">
                <i data-lucide="bar-chart-3"></i>
            </div>
            <h3 class="empty-state__title">Perfil Sociodemográfico</h3>
            <p class="empty-state__description">Aún no hay datos disponibles. El perfil se generará automáticamente con los datos de trabajadores.</p>
        </div>
    `);
    if (window.lucide) window.lucide.createIcons();
}

/**
 * SVE Page
 */
async function loadSVEPage() {
    console.log('Loading SVE Page...');
    showPageContent('sve-content', `
        <div class="empty-state">
            <div class="empty-state__icon">
                <i data-lucide="activity"></i>
            </div>
            <h3 class="empty-state__title">Sistema de Vigilancia Epidemiológica</h3>
            <p class="empty-state__description">Aún no hay SVE configurados. Se generarán automáticamente basados en los riesgos identificados.</p>
        </div>
    `);
    if (window.lucide) window.lucide.createIcons();
}

/**
 * Psicosocial Page
 */
async function loadPsicosocialPage() {
    console.log('Loading Psicosocial Page...');
    showPageContent('psicosocial-content', `
        <div class="empty-state">
            <div class="empty-state__icon">
                <i data-lucide="flask-conical"></i>
            </div>
            <h3 class="empty-state__title">Batería de Riesgo Psicosocial</h3>
            <p class="empty-state__description">Aún no hay baterías aplicadas. Configure la empresa para comenzar la evaluación psicosocial.</p>
        </div>
    `);
    if (window.lucide) window.lucide.createIcons();
}

/**
 * Documentos Page
 */
async function loadDocumentosPage() {
    console.log('Loading Documentos Page...');
    showPageContent('documentos-content', `
        <div class="empty-state">
            <div class="empty-state__icon">
                <i data-lucide="folder-open"></i>
            </div>
            <h3 class="empty-state__title">Centro de Documentos</h3>
            <p class="empty-state__description">Aún no hay documentos generados. Complete el wizard para generar profesiogramas, matrices y más.</p>
            <a href="/pages/wizard_riesgos.html" class="btn btn--primary">Generar Documentos</a>
        </div>
    `);
    if (window.lucide) window.lucide.createIcons();
}

/**
 * Config Page
 */
async function loadConfigPage() {
    console.log('Loading Config Page...');
    showPageContent('config-content', `
        <div class="card">
            <div class="card__header">
                <h3 class="card__title">Configuración de Empresa</h3>
            </div>
            <div class="card__body">
                <p class="text-muted">La configuración se habilitará cuando la empresa esté registrada en el sistema.</p>
            </div>
        </div>
    `);
}

/**
 * Panel Medico Page
 */
async function loadPanelMedicoPage() {
    console.log('Loading Panel Medico Page...');
    setTextContent('medico-info', 'Sin médico asignado');
    showPageContent('panel-medico-content', `
        <div class="empty-state">
            <div class="empty-state__icon">
                <i data-lucide="stethoscope"></i>
            </div>
            <h3 class="empty-state__title">Panel Médico Ocupacional</h3>
            <p class="empty-state__description">Este panel es exclusivo para médicos ocupacionales. Contacte al administrador para obtener acceso.</p>
        </div>
    `);
    if (window.lucide) window.lucide.createIcons();
}

/**
 * Profesiograma Page - Shows cargo profiles with risk data
 */
async function loadProfesiogramaPage() {
    console.log('Loading Profesiograma Page...');

    // Get wizard data from localStorage
    const wizardState = localStorage.getItem('genesys_wizard_state');

    if (!wizardState) {
        showPageContent('profesiograma-content', `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i data-lucide="file-text"></i>
                </div>
                <h3 class="empty-state__title">Sin Profesiograma</h3>
                <p class="empty-state__description">Aún no has generado un profesiograma. Usa el asistente para crear uno.</p>
                <a href="/pages/wizard_riesgos.html" class="btn btn--primary">Crear Profesiograma</a>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    try {
        const state = JSON.parse(wizardState);
        const formData = state.formData || {};
        const cargos = formData.cargos || [];

        if (cargos.length === 0) {
            showPageContent('profesiograma-content', `
                <div class="empty-state">
                    <div class="empty-state__icon">
                        <i data-lucide="file-text"></i>
                    </div>
                    <h3 class="empty-state__title">Sin Cargos Configurados</h3>
                    <p class="empty-state__description">No hay cargos en el profesiograma. Completa el wizard para agregar cargos.</p>
                    <a href="/pages/wizard_riesgos.html" class="btn btn--primary">Ir al Wizard</a>
                </div>
            `);
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        // Generate cargo cards HTML
        const cargosHTML = cargos.map((cargo, index) => {
            const gesCount = cargo.ges?.length || cargo.gesSeleccionados?.length || 0;
            const riskCategories = [...new Set((cargo.ges || cargo.gesSeleccionados || []).map(g => g.categoria).filter(Boolean))];

            // Special conditions
            const conditions = [];
            if (cargo.trabajaAlturas) conditions.push('Trabajo en Alturas');
            if (cargo.espaciosConfinados) conditions.push('Espacios Confinados');
            if (cargo.manipulaAlimentos) conditions.push('Manipulación de Alimentos');
            if (cargo.operaMaquinaria) conditions.push('Opera Maquinaria');
            if (cargo.conduccion) conditions.push('Conducción');

            return `
                <div class="card">
                    <div class="card__header">
                        <h3 class="card__title">${cargo.nombre || 'Cargo ' + (index + 1)}</h3>
                        <span class="badge badge--${gesCount > 0 ? 'success' : 'warning'}">${gesCount} riesgo${gesCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="card__body">
                        <p class="text-muted mb-3">
                            ${cargo.area || 'Sin área'} | ${cargo.zona || 'Sin zona'} | ${cargo.numPersonas || 0} persona${cargo.numPersonas !== 1 ? 's' : ''}
                        </p>
                        ${riskCategories.length > 0 ? `
                            <div class="mb-3">
                                <p class="text-xs text-muted font-semibold mb-2">CATEGORÍAS DE RIESGO</p>
                                <div class="flex gap-2 flex-wrap">
                                    ${riskCategories.map(cat => `<span class="badge badge--primary">${cat}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${conditions.length > 0 ? `
                            <div>
                                <p class="text-xs text-muted font-semibold mb-2">CONDICIONES ESPECIALES</p>
                                <div class="flex gap-2 flex-wrap">
                                    ${conditions.map(c => `<span class="badge badge--warning">${c}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        showPageContent('profesiograma-content', `
            <div class="page-summary mb-6">
                <div class="card card--highlight">
                    <div class="card__body">
                        <h2 class="text-lg font-bold mb-2">${formData.nombreEmpresa || 'Empresa'}</h2>
                        <p class="text-muted">NIT: ${formData.nit || '--'} | Sector: ${formData.sector || '--'}</p>
                        <p class="text-sm mt-2"><strong>${cargos.length}</strong> cargo${cargos.length !== 1 ? 's' : ''} configurado${cargos.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>
            <div class="dashboard-grid dashboard-grid--cols-2">
                ${cargosHTML}
            </div>
            <div class="text-center mt-6">
                <a href="/pages/wizard_riesgos.html" class="btn btn--outline mr-3">
                    <i data-lucide="edit"></i> Editar en Wizard
                </a>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();

    } catch (e) {
        console.error('Error loading profesiograma:', e);
        showPageContent('profesiograma-content', `
            <div class="empty-state">
                <div class="empty-state__icon">
                    <i data-lucide="alert-circle"></i>
                </div>
                <h3 class="empty-state__title">Error al cargar</h3>
                <p class="empty-state__description">Hubo un error al cargar los datos del profesiograma.</p>
            </div>
        `);
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Helper to show content in page container
 */
function showPageContent(containerId, html) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = html;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function setTextContent(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

// ============================================
// USER MENU HANDLER
// ============================================

function initUserMenu() {
    const userMenu = document.getElementById('user-menu');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('btn-logout');

    if (userMenu && userDropdown) {
        // Toggle dropdown on click
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('open');
            userMenu.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userDropdown.classList.remove('open');
                userMenu.classList.remove('open');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                userDropdown.classList.remove('open');
                userMenu.classList.remove('open');
            }
        });
    }

    // Logout handler (header dropdown)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Logout handler (sidebar)
    const sidebarLogoutBtn = document.getElementById('sidebar-logout');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Initialize user avatar with placeholder
    initUserAvatar();
}

/**
 * Initialize user avatar with placeholder data
 */
function initUserAvatar() {
    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');

    // Try to get user data from localStorage (try new keys first, then legacy)
    const userData = localStorage.getItem('genesys_user') || localStorage.getItem('userData');
    const empresaData = localStorage.getItem('genesys_empresa');

    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (avatarEl && user.nombre) {
                const initials = user.nombre.split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                avatarEl.textContent = initials;
            }
            if (nameEl && user.nombre) {
                nameEl.textContent = user.nombre;
            }
            if (emailEl && user.email) {
                emailEl.textContent = user.email;
            }
        } catch (e) {
            console.warn('Error parsing user data:', e);
        }
    } else if (empresaData) {
        // User logged in as empresa
        try {
            const empresa = JSON.parse(empresaData);
            if (avatarEl && empresa.razon_social) {
                const initials = empresa.razon_social.split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                avatarEl.textContent = initials;
            }
            if (nameEl && empresa.razon_social) {
                nameEl.textContent = empresa.razon_social;
            }
            if (emailEl && empresa.email) {
                emailEl.textContent = empresa.email;
            }
        } catch (e) {
            console.warn('Error parsing empresa data:', e);
        }
    } else {
        // Set placeholder values
        if (avatarEl) avatarEl.textContent = 'US';
        if (nameEl) nameEl.textContent = 'Usuario';
        if (emailEl) emailEl.textContent = 'usuario@empresa.com';
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    // Clear all session data (both old and new key names)
    // Keys used by loginHandler.js
    localStorage.removeItem('genesys_token');
    localStorage.removeItem('genesys_user');
    localStorage.removeItem('genesys_empresa');
    localStorage.removeItem('genesys_auth_type');
    // Legacy keys
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = '/pages/login.html';
}

// ============================================
// COMPANY DATA LOADER
// ============================================

/**
 * Load company data from multiple sources:
 * 1. genesys_empresa (from login)
 * 2. genesys_wizard_state (from wizard - contains formData with company info)
 * 3. API call to /api/empresas/me (if token exists)
 */
async function loadCompanyData() {
    console.log('[Dashboard] Loading company data...');

    // Source 1: genesys_empresa (login as empresa)
    const empresaData = localStorage.getItem('genesys_empresa');
    if (empresaData) {
        try {
            const empresa = JSON.parse(empresaData);
            console.log('[Dashboard] Found empresa from login:', empresa);
            updateCompanyUI(empresa.razon_social || empresa.nombre_legal || empresa.nombre, empresa);
            return empresa;
        } catch (e) {
            console.warn('[Dashboard] Error parsing genesys_empresa:', e);
        }
    }

    // Source 2: genesys_wizard_state (from wizard)
    const wizardState = localStorage.getItem('genesys_wizard_state');
    if (wizardState) {
        try {
            const state = JSON.parse(wizardState);
            if (state.formData && state.formData.nombreEmpresa) {
                console.log('[Dashboard] Found company from wizard state:', state.formData.nombreEmpresa);
                const companyInfo = {
                    nombre: state.formData.nombreEmpresa,
                    nit: state.formData.nit,
                    email: state.formData.email,
                    sector: state.formData.sector,
                    cargos: state.formData.cargos || []
                };
                updateCompanyUI(companyInfo.nombre, companyInfo);

                // Also update dashboard state
                DashboardState.companyName = companyInfo.nombre;
                DashboardState.data.cargos = companyInfo.cargos;

                return companyInfo;
            }
        } catch (e) {
            console.warn('[Dashboard] Error parsing genesys_wizard_state:', e);
        }
    }

    // Source 3: genesys_user (login as user associated to company)
    const userData = localStorage.getItem('genesys_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user.empresa) {
                console.log('[Dashboard] Found empresa from user data:', user.empresa);
                updateCompanyUI(user.empresa.nombre || user.empresa.razon_social, user.empresa);
                return user.empresa;
            }
        } catch (e) {
            console.warn('[Dashboard] Error parsing genesys_user:', e);
        }
    }

    // No company data found
    console.log('[Dashboard] No company data found');
    setTextContent('company-name', 'Sin empresa');
    return null;
}

/**
 * Update company-related UI elements
 */
function updateCompanyUI(companyName, companyData) {
    // Update company name in header
    setTextContent('company-name', companyName || 'Sin empresa');

    // Update dashboard state
    DashboardState.companyName = companyName;
    DashboardState.companyId = companyData?.id || null;

    // If we have cargos data, update related stats
    if (companyData?.cargos && Array.isArray(companyData.cargos)) {
        const numCargos = companyData.cargos.length;
        const totalTrabajadores = companyData.cargos.reduce((sum, cargo) => {
            return sum + (cargo.numPersonas || cargo.numTrabajadores || 0);
        }, 0);

        // Update home page stats if visible
        setTextContent('stat-total-trabajadores', totalTrabajadores.toString());

        // Count total GES/riesgos
        let totalGES = 0;
        companyData.cargos.forEach(cargo => {
            if (cargo.ges && Array.isArray(cargo.ges)) {
                totalGES += cargo.ges.length;
            }
            if (cargo.gesSeleccionados && Array.isArray(cargo.gesSeleccionados)) {
                totalGES += cargo.gesSeleccionados.length;
            }
        });
        setTextContent('stat-peligros', totalGES.toString());

        console.log(`[Dashboard] Company stats - Cargos: ${numCargos}, Trabajadores: ${totalTrabajadores}, GES: ${totalGES}`);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard Premium initializing...');

    // Initialize navigation
    const nav = new NavigationHandler();

    // Initialize user menu
    initUserMenu();

    // Load company data from storage/API
    await loadCompanyData();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K for search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    console.log('Dashboard Premium ready');
});

// Export for use in other modules
export { DashboardState, NavigationHandler };
