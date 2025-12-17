/**
 * Dashboard Premium Handler
 * Sprint 6 - Fase B
 *
 * Manages navigation, state, and page handlers for the Dashboard Premium
 */

import { createCargoMiniWizard } from './components/CargoMiniWizard.js';
import MatrizRiesgosComponent from './components/matrizRiesgosComponent.js';
import { initMultiRolDashboard, ROLES } from './multiRolHandler.js';

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

        // Hide ALL pages first (fixes bug where pages stay visible when navigating directly)
        this.pages.forEach((pageEl, name) => {
            pageEl.style.display = 'none';
        });

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

        // Primero buscar en handlers multi-rol (si existen)
        if (window.multiRolPageHandlers && window.multiRolPageHandlers[pageName]) {
            try {
                await window.multiRolPageHandlers[pageName]();
                return;
            } catch (error) {
                console.error(`Error loading multi-rol page ${pageName}:`, error);
            }
        }

        // Luego buscar en handlers estándar
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
 * Cargos Page - Muestra los cargos desde la API (BD)
 */
async function loadCargosPage() {
    console.log('🔵 [CARGOS] ========== Loading Cargos Page ==========');

    // Show loading state
    showPageContent('cargos-content', `
        <div class="empty-state">
            <div class="empty-state__icon">
                <div class="skeleton skeleton--circle" style="width:64px;height:64px;"></div>
            </div>
            <h3 class="empty-state__title">Cargando cargos...</h3>
        </div>
    `);

    // Fetch cargos from API
    const result = await fetchCargosFromAPI();
    console.log('🔵 [CARGOS] API result:', result);

    if (!result || !result.success) {
        console.log('🟡 [CARGOS] No cargos found from API');
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
        const cargos = result.cargos || [];
        console.log('🔵 [CARGOS] Processing cargos from API:', cargos.length);

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

        // Generate cargo cards from API data
        const cargosHTML = cargos.map((cargo, index) => {
            const riesgosCount = cargo.riesgosCount || 0;
            const numPersonas = cargo.num_trabajadores || 0;
            const nrNivel = cargo.nrNivelMaximo || 'I';
            const togglesActivos = cargo.togglesActivos || [];

            // Conditions badges from togglesActivos array
            const conditionsBadges = togglesActivos.map(toggle => {
                const iconMap = {
                    'Alturas': 'mountain',
                    'Alimentos': 'utensils',
                    'Vehiculo': 'car',
                    'Espacios Conf.': 'box'
                };
                const icon = iconMap[toggle] || 'alert-triangle';
                return `<span class="badge badge--warning"><i data-lucide="${icon}" style="width:12px;height:12px;"></i> ${toggle}</span>`;
            }).join('');

            // NR level badge color
            const nrBadgeClass = {
                'I': 'success',
                'II': 'info',
                'III': 'warning',
                'IV': 'danger',
                'V': 'danger'
            }[nrNivel] || 'muted';

            return `
                <div class="card">
                    <div class="card__header">
                        <h3 class="card__title">${cargo.nombre_cargo || 'Cargo ' + (index + 1)}</h3>
                        <div class="card__badges">
                            <span class="badge badge--${riesgosCount > 0 ? 'primary' : 'muted'}">${riesgosCount} riesgo${riesgosCount !== 1 ? 's' : ''}</span>
                            ${riesgosCount > 0 ? `<span class="badge badge--${nrBadgeClass}">NR ${nrNivel}</span>` : ''}
                        </div>
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
                            ${togglesActivos.length > 0 ? `
                                <div class="cargo-info__conditions mt-2">
                                    ${conditionsBadges}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card__footer">
                        <button class="btn btn--sm btn--ghost btn-view-cargo" data-cargo-id="${cargo.id}" data-cargo='${JSON.stringify(cargo).replace(/'/g, "&#39;")}'>
                            <i data-lucide="eye"></i> Ver detalles
                        </button>
                        <button class="btn btn--sm btn--outline btn-edit-cargo" data-cargo-id="${cargo.id}" data-cargo='${JSON.stringify(cargo).replace(/'/g, "&#39;")}'>
                            <i data-lucide="edit-2"></i> Editar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Summary stats
        const totalPersonas = cargos.reduce((sum, c) => sum + (c.num_trabajadores || 0), 0);
        const cargosConAlturas = cargos.filter(c => c.togglesActivos?.includes('Alturas')).length;
        const cargosConEspacios = cargos.filter(c => c.togglesActivos?.includes('Espacios Conf.')).length;
        const totalRiesgos = cargos.reduce((sum, c) => sum + (c.riesgosCount || 0), 0);

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
                <div class="card card--stat">
                    <div class="stat-value">${totalRiesgos}</div>
                    <div class="stat-label">Total Riesgos</div>
                </div>
                <div class="card card--stat card--warning">
                    <div class="stat-value stat-value--warning">${cargosConAlturas}</div>
                    <div class="stat-label">Trabajo en Alturas</div>
                </div>
            </div>
            <div class="dashboard-grid dashboard-grid--cols-3">
                ${cargosHTML}
            </div>
            <div class="text-center mt-6">
                <button class="btn btn--primary btn-nuevo-cargo-inline">
                    <i data-lucide="plus"></i> Agregar Cargo
                </button>
            </div>
        `);

        if (window.lucide) window.lucide.createIcons();

        // Bind edit cargo buttons
        bindCargoMiniWizardEvents();

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
    console.log('🔵 [EXAMENES] ========== Loading Examenes Page ==========');

    // Get wizard data from localStorage
    const wizardData = getWizardData();
    console.log('🔵 [EXAMENES] wizardData:', wizardData ? 'found' : 'not found');

    if (!wizardData) {
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
        const formData = wizardData.formData || {};
        const cargos = formData.cargos || [];
        console.log('🔵 [EXAMENES] Processing cargos:', cargos.length);

        if (cargos.length === 0) {
            console.log('🟡 [EXAMENES] No cargos found');
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
            conduceVehiculo: ['PSM', 'PSP', 'GLI', 'PL'], // PSM = Psicosensométrica, PSP = Sustancias Psicoactivas
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
 * Matriz GTC-45 Page - Load from API
 * NEW: Uses MatrizRiesgosComponent for world-class interactive table
 */
async function loadMatrizPage() {
    console.log('🔵 [MATRIZ] ========== Loading Matriz Page ==========');

    // Fetch matriz from API
    const result = await fetchMatrizFromAPI();
    console.log('🔵 [MATRIZ] API result:', result);

    // Update header metadata
    setTextContent('matriz-fecha', new Date().toLocaleDateString('es-CO'));
    const empresaData = localStorage.getItem('genesys_empresa');
    let empresaNombre = 'Sin asignar';
    if (empresaData) {
        try {
            const empresa = JSON.parse(empresaData);
            empresaNombre = empresa.nombre_legal || empresa.razon_social || empresa.nombre || 'Sin asignar';
        } catch (e) { /* ignore */ }
    }
    setTextContent('matriz-responsable', empresaNombre);

    // Check if we have data
    if (!result || !result.success) {
        // Show empty state
        const container = document.getElementById('matriz-dashboard-container');
        if (container) {
            container.innerHTML = `
                <div class="matriz-empty-state">
                    <div class="matriz-empty-state__icon">
                        <i data-lucide="layout-grid"></i>
                    </div>
                    <h3 class="matriz-empty-state__title">Matriz de Riesgos GTC-45</h3>
                    <p class="matriz-empty-state__description">
                        Aún no hay peligros identificados. Complete el wizard para generar la matriz de riesgos.
                    </p>
                    <a href="/pages/wizard_riesgos.html" class="btn btn--primary">
                        <i data-lucide="plus"></i>
                        Crear Matriz
                    </a>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        }
        return;
    }

    // Initialize the interactive component with API data
    try {
        const matrizComponent = new MatrizRiesgosComponent('matriz-dashboard-container');
        await matrizComponent.init(result);
        console.log('🟢 [MATRIZ] Component initialized successfully');

        // Setup Excel export button in header
        setupMatrizExcelExport(result.documento);
    } catch (e) {
        console.error('🔴 [MATRIZ] Error initializing component:', e);
        const container = document.getElementById('matriz-dashboard-container');
        if (container) {
            container.innerHTML = `
                <div class="matriz-empty-state">
                    <div class="matriz-empty-state__icon">
                        <i data-lucide="alert-circle"></i>
                    </div>
                    <h3 class="matriz-empty-state__title">Error al cargar</h3>
                    <p class="matriz-empty-state__description">
                        Hubo un error al cargar los datos de la matriz. Intente recargar la página.
                    </p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        }
    }
}

/**
 * Setup Excel export for Matriz GTC-45 - Direct download from Spaces
 */
function setupMatrizExcelExport(documento) {
    const exportBtn = document.getElementById('btn-export-matriz-excel');
    if (!exportBtn) return;

    // Remove any existing listeners
    const newBtn = exportBtn.cloneNode(true);
    exportBtn.parentNode.replaceChild(newBtn, exportBtn);

    if (!documento || !documento.excelUrl) {
        newBtn.style.display = 'none';
        return;
    }

    newBtn.addEventListener('click', () => {
        // Direct download via link (avoids CORS)
        const a = document.createElement('a');
        a.href = documento.excelUrl;
        a.download = documento.excelUrl.split('/').pop() || 'Matriz_GTC45.xlsx';
        a.target = '_blank'; // Open in new tab to trigger download
        document.body.appendChild(a);
        a.click();
        a.remove();
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
 * Documentos Page - Muestra documentos generados desde el wizard
 */
async function loadDocumentosPage() {
    console.log('🔵 [DOCUMENTOS] ========== Loading Documentos Page ==========');

    // Intentar obtener documentos de la API si hay empresa autenticada
    const empresaData = localStorage.getItem('genesys_empresa');
    const wizardData = getWizardData();
    console.log('🔵 [DOCUMENTOS] wizardData:', wizardData ? 'found' : 'not found');

    let documents = [];

    // Fuente 1: API (si hay empresa autenticada)
    if (empresaData) {
        try {
            const empresa = JSON.parse(empresaData);
            if (empresa.id) {
                const token = localStorage.getItem('authToken') || localStorage.getItem('genesys_token');
                const response = await fetch(`/api/documentos/empresa/${empresa.id}`, {
                    headers: token ? {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } : { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.documents) {
                        documents = data.documents;
                    }
                }
            }
        } catch (e) {
            console.warn('Error fetching documents from API:', e);
        }
    }

    // Fuente 2: LocalStorage (documentos pendientes de pago)
    const pendingToken = localStorage.getItem('genesys_pending_document_token');
    if (pendingToken && documents.length === 0) {
        try {
            const response = await fetch(`/api/documentos/status/${pendingToken}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    documents.push({
                        token_acceso: pendingToken,
                        estado: data.status,
                        preview_urls: data.urls || {},
                        metadata: data.metadata || {},
                        created_at: new Date().toISOString()
                    });
                }
            }
        } catch (e) {
            console.warn('Error fetching pending document:', e);
        }
    }

    // Fuente 3: Datos del wizard (para generar vista previa)
    if (documents.length === 0 && wizardData) {
        const formData = wizardData.formData || {};
        const cargos = formData.cargos || [];
        console.log('🔵 [DOCUMENTOS] Wizard cargos:', cargos.length);

        if (cargos.length > 0) {
            // Contar total de GES y trabajadores
            let totalGES = 0;
            let totalTrabajadores = 0;
            cargos.forEach(cargo => {
                totalGES += (cargo.ges?.length || 0);
                totalTrabajadores += (cargo.numPersonas || 0);
            });

            // Mostrar documentos disponibles con botón para ir al wizard
            showPageContent('documentos-content', `
                <div class="alert-banner alert-banner--info mb-6">
                    <i data-lucide="info"></i>
                    <span>
                        <strong>${formData.nombreEmpresa || 'Sin nombre'}</strong> · NIT: ${formData.nit || 'N/A'} ·
                        ${cargos.length} cargo(s), ${totalTrabajadores} trabajadores, ${totalGES} riesgos identificados
                    </span>
                </div>

                <div class="dashboard-section mb-6">
                    <h2 class="dashboard-section__title">Documentos Disponibles para Generar</h2>
                    <div class="dashboard-grid dashboard-grid--cols-4">
                        <div class="card">
                            <div class="card__body text-center">
                                <i data-lucide="file-spreadsheet" style="width:48px;height:48px;color:#10b981;margin-bottom:16px;"></i>
                                <h3 class="card__title">Matriz GTC-45</h3>
                                <p class="text-muted text-sm mb-4">Excel con ${totalGES} peligros identificados</p>
                                <span class="badge badge--success">Listo para generar</span>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card__body text-center">
                                <i data-lucide="file-text" style="width:48px;height:48px;color:#5dc4af;margin-bottom:16px;"></i>
                                <h3 class="card__title">Profesiograma</h3>
                                <p class="text-muted text-sm mb-4">PDF para ${cargos.length} cargo(s)</p>
                                <span class="badge badge--success">Listo para generar</span>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card__body text-center">
                                <i data-lucide="user-check" style="width:48px;height:48px;color:#f59e0b;margin-bottom:16px;"></i>
                                <h3 class="card__title">Perfil de Cargo</h3>
                                <p class="text-muted text-sm mb-4">Requisitos por cargo</p>
                                <span class="badge badge--success">Listo para generar</span>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card__body text-center">
                                <i data-lucide="receipt" style="width:48px;height:48px;color:#6366f1;margin-bottom:16px;"></i>
                                <h3 class="card__title">Cotización</h3>
                                <p class="text-muted text-sm mb-4">Presupuesto de exámenes</p>
                                <span class="badge badge--success">Listo para generar</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-section mb-6">
                    <h2 class="dashboard-section__title">Resumen de Cargos</h2>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Cargo</th>
                                    <th>Área</th>
                                    <th>Zona</th>
                                    <th>Trabajadores</th>
                                    <th>Riesgos GES</th>
                                    <th>Especial</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cargos.map(cargo => `
                                    <tr>
                                        <td><strong>${cargo.nombre || 'Sin nombre'}</strong></td>
                                        <td>${cargo.area || 'N/A'}</td>
                                        <td>${cargo.zona || 'N/A'}</td>
                                        <td>${cargo.numPersonas || 0}</td>
                                        <td><span class="badge badge--primary">${cargo.ges?.length || 0}</span></td>
                                        <td>
                                            ${cargo.trabajaAlturas ? '<span class="badge badge--warning" title="Trabajo en alturas">🪜</span>' : ''}
                                            ${cargo.manipulaAlimentos ? '<span class="badge badge--info" title="Manipula alimentos">🍽️</span>' : ''}
                                            ${cargo.conduceVehiculo ? '<span class="badge badge--secondary" title="Conduce vehículo">🚗</span>' : ''}
                                            ${cargo.trabajaEspaciosConfinados ? '<span class="badge badge--danger" title="Espacios confinados">⚠️</span>' : ''}
                                            ${!cargo.trabajaAlturas && !cargo.manipulaAlimentos && !cargo.conduceVehiculo && !cargo.trabajaEspaciosConfinados ? '-' : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="text-center mt-6">
                    <a href="/pages/wizard_riesgos.html" class="btn btn--primary btn--lg">
                        <i data-lucide="zap"></i>
                        Ir al Wizard para Generar Documentos
                    </a>
                </div>
            `);
            if (window.lucide) window.lucide.createIcons();
            return;
        }
    }

    // Si hay documentos, mostrarlos
    if (documents.length > 0) {
        const DOCUMENT_TYPES = {
            matriz: { icon: 'file-spreadsheet', label: 'Matriz GTC-45', color: '#10b981' },
            profesiograma: { icon: 'file-text', label: 'Profesiograma', color: '#5dc4af' },
            perfil: { icon: 'user-check', label: 'Perfil de Cargo', color: '#f59e0b' },
            cotizacion: { icon: 'receipt', label: 'Cotización', color: '#6366f1' }
        };

        const documentsHTML = documents.map(doc => {
            const urls = doc.preview_urls || {};
            const meta = doc.metadata || {};
            const fecha = new Date(doc.created_at).toLocaleDateString('es-CO');
            const estado = doc.estado === 'pagado' ? 'Pagado' : (doc.estado === 'completado' ? 'Completado' : 'Pendiente');
            const estadoClass = doc.estado === 'pagado' ? 'success' : (doc.estado === 'completado' ? 'primary' : 'warning');

            const docCards = Object.entries(urls).filter(([key]) => key !== 'thumbnails').map(([type, url]) => {
                const typeInfo = DOCUMENT_TYPES[type] || { icon: 'file', label: type, color: '#6b7280' };
                return `
                    <div class="card card--document">
                        <div class="card__body">
                            <div class="document-icon" style="color:${typeInfo.color};">
                                <i data-lucide="${typeInfo.icon}"></i>
                            </div>
                            <div class="document-info">
                                <h4>${typeInfo.label}</h4>
                                <span class="text-xs text-muted">${type === 'matriz' ? 'Excel' : 'PDF'}</span>
                            </div>
                            <a href="${url}" target="_blank" class="btn btn--sm btn--primary" download>
                                <i data-lucide="download"></i>
                            </a>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="card mb-4">
                    <div class="card__header">
                        <div>
                            <h3 class="card__title">${meta.nombreEmpresa || 'Empresa'}</h3>
                            <span class="text-sm text-muted">Generado: ${fecha} · ${meta.numCargos || 0} cargos</span>
                        </div>
                        <span class="badge badge--${estadoClass}">${estado}</span>
                    </div>
                    <div class="card__body">
                        <div class="dashboard-grid dashboard-grid--cols-4">
                            ${docCards || '<p class="text-muted">Sin documentos disponibles</p>'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        showPageContent('documentos-content', `
            <div class="dashboard-section">
                <h2 class="dashboard-section__title">Documentos Generados</h2>
                ${documentsHTML}
            </div>
            <div class="text-center mt-6">
                <a href="/pages/wizard_riesgos.html" class="btn btn--outline">
                    <i data-lucide="plus"></i>
                    Generar Nuevos Documentos
                </a>
            </div>
        `);
    } else {
        // Sin documentos
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
    }

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
 * Profesiograma Page - Shows cargo profiles with risk data, exams, and EPP from API
 */
async function loadProfesiogramaPage() {
    console.log('🔵 [PROFESIOGRAMA] ========== Loading Profesiograma Page ==========');

    // Show loading state
    showPageContent('profesiograma-content', `
        <div class="empty-state">
            <div class="empty-state__icon">
                <div class="skeleton skeleton--circle" style="width:64px;height:64px;"></div>
            </div>
            <h3 class="empty-state__title">Cargando profesiograma...</h3>
        </div>
    `);

    // Fetch cargos from API
    const result = await fetchCargosFromAPI();
    console.log('🔵 [PROFESIOGRAMA] API result:', result);

    if (!result || !result.success) {
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
        const cargos = result.cargos || [];
        console.log('🔵 [PROFESIOGRAMA] Processing cargos from API:', cargos.length);

        if (cargos.length === 0) {
            console.log('🟡 [PROFESIOGRAMA] No cargos found');
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

        // Get company info and documento_id from the latest cargo
        const empresaData = localStorage.getItem('genesys_empresa');
        let empresaInfo = { nombre: 'Empresa', nit: '--' };
        let documentoId = cargos[0]?.documento_id || null; // Get documento_id from first cargo (most recent)

        if (empresaData) {
            try {
                const empresa = JSON.parse(empresaData);
                empresaInfo = {
                    nombre: empresa.nombre_legal || empresa.razon_social || empresa.nombre || 'Empresa',
                    nit: empresa.nit || '--'
                };
            } catch (e) { /* ignore */ }
        }

        // Generate cargo cards HTML from API data
        const cargosHTML = cargos.map((cargo, index) => {
            const riesgosCount = cargo.riesgosCount || 0;
            const togglesActivos = cargo.togglesActivos || [];
            const nrNivel = cargo.nrNivelMaximo || 'I';
            const conteoNiveles = cargo.conteoNiveles || {};
            const examenesMedicos = cargo.examenesMedicos || []; // 🆕 Exámenes médicos

            // 🐛 DEBUG: Log exámenes médicos
            console.log(`🔬 [CARGO ${index + 1}] "${cargo.nombre_cargo}":`, {
                riesgosCount,
                examenesMedicosCount: examenesMedicos.length,
                examenesMedicos: examenesMedicos
            });

            // NR level badge color
            const nrBadgeClass = {
                'I': 'success',
                'II': 'info',
                'III': 'warning',
                'IV': 'danger',
                'V': 'danger'
            }[nrNivel] || 'muted';

            // Special conditions from togglesActivos
            const conditions = togglesActivos.map(toggle => {
                const iconMap = {
                    'Alturas': { icon: 'mountain', label: 'Alturas' },
                    'Alimentos': { icon: 'utensils', label: 'Alimentos' },
                    'Vehiculo': { icon: 'car', label: 'Conducción' },
                    'Espacios Conf.': { icon: 'box', label: 'Esp. Confinados' }
                };
                return iconMap[toggle] || { icon: 'alert-triangle', label: toggle };
            });

            // Risk level summary
            const nivelSummary = Object.entries(conteoNiveles)
                .filter(([, count]) => count > 0)
                .map(([nivel, count]) => {
                    const colorMap = { 'I': 'success', 'II': 'info', 'III': 'warning', 'IV': 'danger', 'V': 'danger' };
                    return `<span class="badge badge--${colorMap[nivel] || 'muted'}">${count} NR-${nivel}</span>`;
                }).join(' ');

            // 🆕 Medical exams HTML
            const examenesHTML = examenesMedicos.length > 0
                ? examenesMedicos.map(examen => `
                    <div class="exam-item">
                        <div class="exam-item__header">
                            <span class="exam-item__name">${examen.nombre}</span>
                            <span class="badge badge--${examen.prioridad === 1 ? 'danger' : 'info'} badge--sm">${examen.tipo}</span>
                        </div>
                        <div class="exam-item__footer">
                            <span class="exam-item__periodicidad">
                                <i data-lucide="calendar" style="width:12px;height:12px;"></i>
                                ${examen.periodicidad}
                            </span>
                        </div>
                    </div>
                `).join('')
                : '<p class="text-muted text-sm">No hay exámenes médicos asignados para este cargo.</p>';

            return `
                <div class="card card--profesiograma">
                    <div class="card__header">
                        <div>
                            <h3 class="card__title">${cargo.nombre_cargo || 'Cargo ' + (index + 1)}</h3>
                            <span class="text-sm text-muted">${cargo.area || 'Sin área'} · ${cargo.zona || 'Sin zona'} · ${cargo.num_trabajadores || 0} persona(s)</span>
                        </div>
                        <div class="card__badges">
                            <span class="badge badge--${riesgosCount > 0 ? 'primary' : 'muted'}">${riesgosCount} Riesgos</span>
                            ${riesgosCount > 0 ? `<span class="badge badge--${nrBadgeClass}">NR Max: ${nrNivel}</span>` : ''}
                        </div>
                    </div>
                    <div class="card__body">
                        ${conditions.length > 0 ? `
                            <div class="profesiograma-section mb-4">
                                <p class="profesiograma-section__title">
                                    <i data-lucide="alert-triangle" style="width:16px;height:16px;color:#f59e0b;"></i>
                                    Condiciones Especiales
                                </p>
                                <div class="flex gap-2 flex-wrap">
                                    ${conditions.map(c => `<span class="badge badge--warning"><i data-lucide="${c.icon}" style="width:12px;height:12px;"></i> ${c.label}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}

                        ${riesgosCount > 0 ? `
                            <div class="profesiograma-section mb-4">
                                <p class="profesiograma-section__title">
                                    <i data-lucide="shield-alert" style="width:16px;height:16px;color:#ef4444;"></i>
                                    Distribución de Riesgos
                                </p>
                                <div class="flex gap-2 flex-wrap">
                                    ${nivelSummary || '<span class="badge badge--muted">Sin clasificar</span>'}
                                </div>
                            </div>
                        ` : ''}

                        <div class="profesiograma-section">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                                <p class="profesiograma-section__title" style="margin-bottom:0;">
                                    <i data-lucide="stethoscope" style="width:16px;height:16px;color:#10b981;"></i>
                                    Exámenes Médicos Requeridos
                                    ${examenesMedicos.length > 0 ? `<span class="badge badge--sm badge--success" style="margin-left:8px;">${examenesMedicos.length}</span>` : ''}
                                </p>
                                ${examenesMedicos.length > 0 ? `
                                    <button class="btn btn--outline btn--sm" style="padding:4px 12px;font-size:12px;" onclick="alert('Función de descarga en desarrollo')">
                                        <i data-lucide="download" style="width:12px;height:12px;"></i>
                                        Descargar Excel
                                    </button>
                                ` : ''}
                            </div>
                            <div class="exams-grid">
                                ${examenesHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Calculate totals
        const totalPersonas = cargos.reduce((sum, c) => sum + (c.num_trabajadores || 0), 0);
        const totalRiesgos = cargos.reduce((sum, c) => sum + (c.riesgosCount || 0), 0);

        showPageContent('profesiograma-content', `
            <div class="dashboard-grid dashboard-grid--cols-4 mb-6">
                <div class="card card--stat">
                    <div class="stat-value">${cargos.length}</div>
                    <div class="stat-label">Cargos</div>
                </div>
                <div class="card card--stat">
                    <div class="stat-value">${totalPersonas}</div>
                    <div class="stat-label">Trabajadores</div>
                </div>
                <div class="card card--stat">
                    <div class="stat-value">${totalRiesgos}</div>
                    <div class="stat-label">Riesgos Identificados</div>
                </div>
                <div class="card card--stat card--highlight">
                    <div class="stat-value stat-value--primary">${result.total || cargos.length}</div>
                    <div class="stat-label">Total BD</div>
                </div>
            </div>

            <div class="card card--company mb-6">
                <div class="card__body" style="display:flex;align-items:center;gap:24px;">
                    <div class="company-logo" style="width:64px;height:64px;background:#5dc4af;border-radius:12px;display:flex;align-items:center;justify-content:center;">
                        <i data-lucide="building-2" style="width:32px;height:32px;color:#fff;"></i>
                    </div>
                    <div>
                        <h2 style="margin:0 0 4px;">${empresaInfo.nombre}</h2>
                        <p class="text-muted" style="margin:0;">NIT: ${empresaInfo.nit}</p>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2 class="dashboard-section__title" style="margin: 0;">Protocolo de Vigilancia por Cargo</h2>
                    <div>
                        <a href="/pages/wizard_riesgos.html" class="btn btn--outline mr-3">
                            <i data-lucide="edit"></i> Editar en Wizard
                        </a>
                        <a href="/pages/profesiograma_view.html${documentoId ? '?documento_id=' + documentoId : ''}" class="btn btn--primary">
                            <i data-lucide="eye"></i> Ver Profesiograma Completo
                        </a>
                    </div>
                </div>
                <div class="dashboard-grid dashboard-grid--cols-2">
                    ${cargosHTML}
                </div>
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
    console.log('🟢 [showPageContent] containerId:', containerId);
    const container = document.getElementById(containerId);
    console.log('🟢 [showPageContent] container found:', !!container);
    if (container) {
        container.innerHTML = html;
        console.log('🟢 [showPageContent] HTML set, length:', html.length);
        console.log('🟢 [showPageContent] First 200 chars:', html.substring(0, 200));
    } else {
        console.error('🔴 [showPageContent] Container NOT FOUND:', containerId);
        console.error('🔴 [showPageContent] Available elements with IDs:',
            Array.from(document.querySelectorAll('[id]')).map(el => el.id).join(', '));
    }
}

/**
 * Debug helper to get wizard data
 */
function getWizardData() {
    const wizardState = localStorage.getItem('genesys_wizard_state');
    if (!wizardState) {
        console.warn('🟡 [getWizardData] No wizard state in localStorage');
        return null;
    }
    try {
        const parsed = JSON.parse(wizardState);
        console.log('🟢 [getWizardData] Successfully parsed wizard state');
        return parsed;
    } catch (e) {
        console.error('🔴 [getWizardData] Error parsing:', e);
        return null;
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
// API FUNCTIONS
// ============================================

/**
 * Get auth headers for API calls
 */
function getAuthHeaders() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('genesys_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

/**
 * Get empresa ID from localStorage
 */
function getEmpresaId() {
    const empresaData = localStorage.getItem('genesys_empresa');
    if (empresaData) {
        try {
            const empresa = JSON.parse(empresaData);
            console.log('🔵 [API] Empresa ID:', empresa.id);
            return empresa.id;
        } catch (e) {
            console.error('🔴 [API] Error parsing empresa:', e);
        }
    }
    return null;
}

/**
 * Fetch cargos from API
 */
async function fetchCargosFromAPI() {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        console.warn('🟡 [API] No empresa ID, cannot fetch cargos');
        return null;
    }

    try {
        console.log('🔵 [API] Fetching cargos for empresa:', empresaId);
        const response = await fetch(`/api/cargos/empresa/${empresaId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            console.error('🔴 [API] Error fetching cargos:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('🟢 [API] Cargos fetched:', data);

        // Cache in DashboardState
        DashboardState.data.cargos = data.cargos || [];
        DashboardState.companyId = empresaId;

        return data;
    } catch (error) {
        console.error('🔴 [API] Error fetching cargos:', error);
        return null;
    }
}

/**
 * Fetch matriz GTC-45 from API
 */
async function fetchMatrizFromAPI() {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        console.warn('🟡 [API] No empresa ID, cannot fetch matriz');
        return null;
    }

    try {
        console.log('🔵 [API] Fetching matriz for empresa:', empresaId);
        const response = await fetch(`/api/cargos/matriz-gtc45/${empresaId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            console.error('🔴 [API] Error fetching matriz:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('🟢 [API] Matriz fetched:', data);

        // Cache in DashboardState
        DashboardState.data.matriz = data;

        return data;
    } catch (error) {
        console.error('🔴 [API] Error fetching matriz:', error);
        return null;
    }
}

/**
 * Fetch controles from API
 */
async function fetchControlesFromAPI() {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        console.warn('🟡 [API] No empresa ID, cannot fetch controles');
        return null;
    }

    try {
        console.log('🔵 [API] Fetching controles for empresa:', empresaId);
        const response = await fetch(`/api/cargos/controles/${empresaId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            console.error('🔴 [API] Error fetching controles:', response.status);
            return null;
        }

        const data = await response.json();
        console.log('🟢 [API] Controles fetched:', data);

        return data;
    } catch (error) {
        console.error('🔴 [API] Error fetching controles:', error);
        return null;
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
 * PRIORITY 1: genesys_empresa (from login) - ALWAYS use logged-in empresa as source of truth
 * PRIORITY 2: genesys_wizard_state (ONLY if matches logged-in empresa or no empresa logged in)
 * PRIORITY 3: API call to /api/empresas/me (if token exists)
 *
 * IMPORTANT: We DON'T use wizard state from OTHER empresas/sessions to avoid
 * cross-tab contamination where opening a wizard in another tab changes the dashboard.
 */
async function loadCompanyData() {
    console.log('[Dashboard] Loading company data...');

    // Helper function to enrich data from API
    const enrichFromAPI = async (empresaIdOverride) => {
        const empresaId = empresaIdOverride || localStorage.getItem('empresaId');
        const authToken = localStorage.getItem('authToken');

        if (empresaId && authToken) {
            try {
                const response = await fetch(`/api/documentos/empresa/${empresaId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.documents && data.documents.length > 0) {
                        console.log('[Dashboard] Enriched data from API with', data.documents.length, 'documents');
                        const latestDoc = data.documents[0];
                        const metadata = latestDoc.metadata || {};
                        return {
                            sector: metadata.sector,
                            actividad_economica: metadata.actividadEconomica,
                            responsable: metadata.nombreResponsable,
                            nombre_responsable: latestDoc.nombre_responsable,
                            numCargos: metadata.numCargos
                        };
                    }
                }
            } catch (apiError) {
                console.warn('[Dashboard] Error enriching from API:', apiError);
            }
        }
        return null;
    };

    // Get logged-in empresa ID (this is the SOURCE OF TRUTH)
    const loggedInEmpresaId = getEmpresaId();
    console.log('[Dashboard] Logged-in empresa ID:', loggedInEmpresaId);

    // PRIORITY 1: genesys_empresa (login as empresa - SOURCE OF TRUTH)
    const empresaData = localStorage.getItem('genesys_empresa');
    if (empresaData) {
        try {
            const empresa = JSON.parse(empresaData);
            console.log('[Dashboard] Found empresa from login:', empresa);

            // Always try to enrich from API
            const apiData = await enrichFromAPI();

            if (apiData) {
                // Enrich empresa data with fresh API data
                const enrichedEmpresa = {
                    ...empresa,
                    sector: apiData.sector || empresa.sector || '-',
                    actividad_economica: apiData.actividad_economica || empresa.actividad_economica || '-',
                    responsable: apiData.responsable || apiData.nombre_responsable || empresa.responsable || '-',
                    numCargos: apiData.numCargos || 0
                };

                updateCompanyUI(enrichedEmpresa.nombre_legal || enrichedEmpresa.razon_social, enrichedEmpresa);
                return enrichedEmpresa;
            }

            // Fallback to basic empresa data from login if API fails
            updateCompanyUI(empresa.nombre_legal || empresa.razon_social || empresa.nombre, empresa);
            return empresa;
        } catch (e) {
            console.warn('[Dashboard] Error parsing genesys_empresa:', e);
        }
    }

    // PRIORITY 3: genesys_user (login as user associated to company)
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

    // Update company details in header
    setTextContent('company-sector', companyData?.sector || '-');
    setTextContent('company-activity', companyData?.actividad_economica || '-');
    setTextContent('company-nit', companyData?.nit || '-');

    // Update responsable in header
    setTextContent('responsable-name', companyData?.responsable || companyData?.nombre_responsable || '-');

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
// CARGO MINI-WIZARD INTEGRATION
// ============================================

/**
 * Open mini-wizard for creating a new cargo
 */
function openCreateCargoWizard() {
    console.log('[CargoWizard] Opening create wizard...');

    const empresaId = getEmpresaId();

    const wizard = createCargoMiniWizard({
        mode: 'create',
        empresaId: empresaId,
        onSave: async (cargoData) => {
            console.log('[CargoWizard] Saving new cargo:', cargoData);

            try {
                // Call API to save cargo
                const response = await fetch('/api/cargos', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        ...cargoData,
                        empresa_id: empresaId
                    })
                });

                if (!response.ok) {
                    throw new Error('Error al crear el cargo');
                }

                const result = await response.json();
                console.log('[CargoWizard] Cargo created:', result);

                // Reload cargos page
                await loadCargosPage();

                // Show success message
                showNotification('Cargo creado exitosamente', 'success');

            } catch (error) {
                console.error('[CargoWizard] Error saving cargo:', error);
                showNotification('Error al crear el cargo: ' + error.message, 'error');
                throw error;
            }
        },
        onCancel: () => {
            console.log('[CargoWizard] Create wizard cancelled');
        }
    });

    wizard.show();
}

/**
 * Open mini-wizard for editing an existing cargo
 */
function openEditCargoWizard(cargoId, cargoData) {
    console.log('[CargoWizard] Opening edit wizard for cargo:', cargoId, cargoData);

    const empresaId = getEmpresaId();

    const wizard = createCargoMiniWizard({
        mode: 'edit',
        cargoId: cargoId,
        cargoData: cargoData,
        empresaId: empresaId,
        onSave: async (updatedCargoData) => {
            console.log('[CargoWizard] Saving edited cargo:', updatedCargoData);

            try {
                // Check if there are pending approvals
                if (updatedCargoData.pendingApprovals && updatedCargoData.pendingApprovals.length > 0) {
                    console.log('[CargoWizard] Cargo has pending approvals:', updatedCargoData.pendingApprovals);
                    // Save with pending status
                    updatedCargoData.estado_aprobacion = 'pendiente';
                }

                // Call API to update cargo
                const response = await fetch(`/api/cargos/${cargoId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        ...updatedCargoData,
                        empresa_id: empresaId
                    })
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar el cargo');
                }

                const result = await response.json();
                console.log('[CargoWizard] Cargo updated:', result);

                // Reload cargos page
                await loadCargosPage();

                // Show success message
                const hasApprovals = updatedCargoData.pendingApprovals?.length > 0;
                if (hasApprovals) {
                    showNotification('Cargo actualizado. Algunos cambios están pendientes de aprobación.', 'warning');
                } else {
                    showNotification('Cargo actualizado exitosamente', 'success');
                }

            } catch (error) {
                console.error('[CargoWizard] Error updating cargo:', error);
                showNotification('Error al actualizar el cargo: ' + error.message, 'error');
                throw error;
            }
        },
        onCancel: () => {
            console.log('[CargoWizard] Edit wizard cancelled');
        }
    });

    wizard.show();
}

/**
 * Bind click events for cargo mini-wizard buttons
 */
function bindCargoMiniWizardEvents() {
    // Bind "Nuevo Cargo" button in page header
    const btnNuevoCargo = document.getElementById('btn-nuevo-cargo');
    if (btnNuevoCargo) {
        btnNuevoCargo.addEventListener('click', (e) => {
            e.preventDefault();
            openCreateCargoWizard();
        });
    }

    // Bind inline "Agregar Cargo" button
    const btnNuevoCargoInline = document.querySelector('.btn-nuevo-cargo-inline');
    if (btnNuevoCargoInline) {
        btnNuevoCargoInline.addEventListener('click', (e) => {
            e.preventDefault();
            openCreateCargoWizard();
        });
    }

    // Bind all edit buttons
    document.querySelectorAll('.btn-edit-cargo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const cargoId = btn.dataset.cargoId;
            let cargoData = {};

            try {
                // Parse cargo data from data attribute
                const cargoJson = btn.dataset.cargo;
                if (cargoJson) {
                    cargoData = JSON.parse(cargoJson.replace(/&#39;/g, "'"));
                }
            } catch (err) {
                console.error('[CargoWizard] Error parsing cargo data:', err);
            }

            openEditCargoWizard(cargoId, cargoData);
        });
    });

    // Bind all view details buttons
    document.querySelectorAll('.btn-view-cargo').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            let cargoData = {};

            try {
                const cargoJson = btn.dataset.cargo;
                if (cargoJson) {
                    cargoData = JSON.parse(cargoJson.replace(/&#39;/g, "'"));
                }
            } catch (err) {
                console.error('[CargoDetails] Error parsing cargo data:', err);
            }

            showCargoDetailsPopup(cargoData);
        });
    });

    console.log('[CargoWizard] Events bound successfully');
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : type === 'warning' ? 'alert-triangle' : 'info'}"></i>
        <span>${message}</span>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ============================================
// CARGO DETAILS POPUP
// ============================================

/**
 * Show cargo details in a modal popup
 */
function showCargoDetailsPopup(cargo) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.cargo-details-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Get toggle labels
    const toggleLabels = {
        trabajaAlturas: 'Trabajo en Alturas',
        manipulaAlimentos: 'Manipulación de Alimentos',
        conduceVehiculo: 'Conduce Vehículo',
        trabajaEspaciosConfinados: 'Espacios Confinados'
    };

    const togglesActivos = cargo.togglesActivos || [];

    // Get NR badge class
    const nrNivel = cargo.nrNivelMaximo || 'N/A';
    let nrBadgeClass = 'muted';
    if (nrNivel === 'I') nrBadgeClass = 'success';
    else if (nrNivel === 'II') nrBadgeClass = 'info';
    else if (nrNivel === 'III') nrBadgeClass = 'warning';
    else if (nrNivel === 'IV') nrBadgeClass = 'danger';
    else if (nrNivel === 'V') nrBadgeClass = 'critical';

    // Build GES/riesgos list
    const gesSeleccionados = cargo.gesSeleccionados || [];
    const gesGrouped = gesSeleccionados.reduce((acc, ges) => {
        const cat = ges.riesgo || ges.categoria || 'Otros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ges);
        return acc;
    }, {});

    let riesgosHtml = '';
    if (Object.keys(gesGrouped).length > 0) {
        riesgosHtml = Object.entries(gesGrouped).map(([categoria, items]) => `
            <div class="ges-category">
                <div class="ges-category__header">${categoria}</div>
                <ul class="ges-category__list">
                    ${items.map(ges => {
                        const niveles = ges.niveles || {};
                        const nd = niveles.deficiencia?.value || niveles.deficiencia || '-';
                        const ne = niveles.exposicion?.value || niveles.exposicion || '-';
                        const nc = niveles.consecuencia?.value || niveles.consecuencia || '-';
                        return `<li>
                            <span class="ges-name">${ges.ges || ges.nombre || 'Sin nombre'}</span>
                            <span class="ges-niveles">ND:${nd} NE:${ne} NC:${nc}</span>
                        </li>`;
                    }).join('')}
                </ul>
            </div>
        `).join('');
    } else {
        riesgosHtml = '<p class="text-muted">Sin riesgos asignados</p>';
    }

    // Build exámenes list
    const examenesMedicos = cargo.examenesMedicos || [];
    let examenesHtml = '';
    if (examenesMedicos.length > 0) {
        examenesHtml = `
            <ul class="examenes-list">
                ${examenesMedicos.map(exam => `
                    <li>
                        <span class="examen-codigo">${exam.codigo}</span>
                        <span class="examen-nombre">${exam.nombre}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        examenesHtml = '<p class="text-muted">Sin exámenes asignados</p>';
    }

    // Build conteo niveles
    const conteoNiveles = cargo.conteoNiveles || {};
    const nivelesHtml = `
        <div class="niveles-grid">
            ${['V', 'IV', 'III', 'II', 'I'].map(nivel => `
                <div class="nivel-item nivel-item--${nivel.toLowerCase()}">
                    <span class="nivel-label">NR ${nivel}</span>
                    <span class="nivel-count">${conteoNiveles[nivel] || 0}</span>
                </div>
            `).join('')}
        </div>
    `;

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'cargo-details-popup';
    popup.innerHTML = `
        <div class="cargo-details-overlay"></div>
        <div class="cargo-details-modal">
            <div class="cargo-details-modal__header">
                <h2 class="cargo-details-modal__title">
                    <i data-lucide="briefcase"></i>
                    ${cargo.nombre_cargo || 'Sin nombre'}
                </h2>
                <button class="cargo-details-modal__close" aria-label="Cerrar">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="cargo-details-modal__body">
                <!-- Info básica -->
                <div class="details-section">
                    <h3 class="details-section__title">
                        <i data-lucide="info"></i> Información General
                    </h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Área</span>
                            <span class="detail-value">${cargo.area || 'Sin área'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Zona</span>
                            <span class="detail-value">${cargo.zona || 'Sin zona'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Personas</span>
                            <span class="detail-value">${cargo.num_trabajadores || 0}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">NR Máximo</span>
                            <span class="detail-value">
                                <span class="badge badge--${nrBadgeClass}">${cargo.nrMaximo || 'N/A'} (${nrNivel})</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Descripción -->
                ${cargo.descripcion_tareas ? `
                <div class="details-section">
                    <h3 class="details-section__title">
                        <i data-lucide="file-text"></i> Descripción de Tareas
                    </h3>
                    <p class="descripcion-text">${cargo.descripcion_tareas}</p>
                </div>
                ` : ''}

                <!-- Condiciones especiales -->
                ${togglesActivos.length > 0 ? `
                <div class="details-section">
                    <h3 class="details-section__title">
                        <i data-lucide="alert-triangle"></i> Condiciones Especiales
                    </h3>
                    <div class="toggles-badges">
                        ${togglesActivos.map(toggle => `
                            <span class="badge badge--attention">${toggle}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Distribución de riesgos -->
                <div class="details-section">
                    <h3 class="details-section__title">
                        <i data-lucide="bar-chart-3"></i> Distribución de Riesgos por NR
                    </h3>
                    ${nivelesHtml}
                </div>

                <!-- Riesgos GES -->
                <div class="details-section">
                    <h3 class="details-section__title">
                        <i data-lucide="shield-alert"></i> Riesgos Identificados (${gesSeleccionados.length})
                    </h3>
                    <div class="ges-list">
                        ${riesgosHtml}
                    </div>
                </div>

                <!-- Exámenes médicos -->
                <div class="details-section">
                    <h3 class="details-section__title">
                        <i data-lucide="stethoscope"></i> Exámenes Médicos (${examenesMedicos.length})
                    </h3>
                    ${examenesHtml}
                </div>
            </div>
            <div class="cargo-details-modal__footer">
                <button class="btn btn--outline btn-close-popup">Cerrar</button>
                <button class="btn btn--primary btn-edit-from-popup" data-cargo-id="${cargo.id}">
                    <i data-lucide="edit-2"></i> Editar Cargo
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Animate in
    requestAnimationFrame(() => {
        popup.classList.add('show');
    });

    // Close handlers
    const closePopup = () => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    };

    popup.querySelector('.cargo-details-overlay').addEventListener('click', closePopup);
    popup.querySelector('.cargo-details-modal__close').addEventListener('click', closePopup);
    popup.querySelector('.btn-close-popup').addEventListener('click', closePopup);

    // Edit from popup
    popup.querySelector('.btn-edit-from-popup').addEventListener('click', () => {
        closePopup();
        openEditCargoWizard(cargo.id, cargo);
    });

    // Close on Escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closePopup();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Dashboard Premium initializing...');

    // Detectar si es un usuario con rol especial (admin/médico)
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.rol === 'admin_genesys' || user.rol === 'medico_ocupacional') {
                console.log('[Dashboard] Detectado rol especial:', user.rol);
                await initMultiRolDashboard();
                return; // El dashboard multi-rol toma control
            }
        } catch (e) {
            console.warn('[Dashboard] Error parsing user:', e);
        }
    }

    // Debug: Check localStorage immediately
    console.log('🔍 [DEBUG] Checking localStorage...');
    const wizardState = localStorage.getItem('genesys_wizard_state');
    console.log('🔍 [DEBUG] genesys_wizard_state exists:', !!wizardState);
    if (wizardState) {
        try {
            const parsed = JSON.parse(wizardState);
            console.log('🔍 [DEBUG] Parsed wizard state:', {
                currentStep: parsed.currentStep,
                hasFormData: !!parsed.formData,
                nombreEmpresa: parsed.formData?.nombreEmpresa || 'N/A',
                nit: parsed.formData?.nit || 'N/A',
                cargosCount: parsed.formData?.cargos?.length || 0,
                firstCargo: parsed.formData?.cargos?.[0] || 'No cargos'
            });

            // Log details of each cargo
            if (parsed.formData?.cargos?.length > 0) {
                parsed.formData.cargos.forEach((cargo, i) => {
                    console.log(`🔍 [DEBUG] Cargo ${i}:`, {
                        nombre: cargo.nombre,
                        area: cargo.area,
                        zona: cargo.zona,
                        numPersonas: cargo.numPersonas,
                        gesCount: cargo.ges?.length || 0,
                        toggles: {
                            trabajaAlturas: cargo.trabajaAlturas,
                            manipulaAlimentos: cargo.manipulaAlimentos,
                            conduceVehiculo: cargo.conduceVehiculo,
                            trabajaEspaciosConfinados: cargo.trabajaEspaciosConfinados
                        }
                    });
                });
            }
        } catch (e) {
            console.error('🔴 [DEBUG] Error parsing wizard state:', e);
        }
    } else {
        console.warn('🟡 [DEBUG] No wizard state found in localStorage. Keys available:', Object.keys(localStorage));
    }

    // Debug: Check DOM containers
    console.log('🔍 [DEBUG] Checking DOM containers...');
    const containers = ['cargos-content', 'matriz-critical-content', 'profesiograma-content', 'documentos-content', 'examenes-table-body'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        console.log(`🔍 [DEBUG] Container "${id}":`, el ? 'FOUND' : 'NOT FOUND');
    });

    // Initialize navigation
    const nav = new NavigationHandler();

    // Initialize user menu
    initUserMenu();

    // Load company data from storage/API
    await loadCompanyData();

    // Pre-load cargos data from API for logged-in empresa
    // This ensures DashboardState.data.cargos is populated before paywall shows
    const empresaId = getEmpresaId();
    if (empresaId) {
        console.log('[Dashboard] Pre-loading cargos for empresa:', empresaId);
        await fetchCargosFromAPI();
    }

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

    console.log('✅ Dashboard Premium ready');
});

// Export for use in other modules
export { DashboardState, NavigationHandler };

// ============================================
// PAYWALL MODAL INITIALIZATION
// ============================================

/**
 * Initialize paywall modal - shows after 8 seconds if user hasn't paid
 * Price: $30.000 COP per cargo
 * Free documents: Cotización and Perfil de Cargo
 */
function initPaywallModal() {
    const PAYWALL_DELAY = 8000;
    const PRICE_PER_CARGO = 30000;

    // NO MOSTRAR PAYWALL para admins y médicos
    const checkIfShouldShowPaywall = () => {
        const userStr = localStorage.getItem('genesys_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const rol = user.rol;
                // Admin y médico NO ven paywall
                if (rol === 'admin_genesys' || rol === 'medico_ocupacional') {
                    console.log('[Paywall] Usuario es', rol, '- Paywall deshabilitado');
                    return false;
                }
            } catch (e) {
                console.warn('[Paywall] Error leyendo rol del usuario:', e);
            }
        }
        return true;
    };

    const hasUserPaid = () => localStorage.getItem('genesys_payment_status') === 'paid';

    const showPaywallModal = () => {
        const overlay = document.getElementById('paywall-overlay');
        if (!overlay) return;

        // Get cargo count from DashboardState (loaded from API for logged-in empresa)
        // This avoids cross-tab contamination from wizard state
        let cargoCount = 0;
        if (DashboardState.data.cargos && DashboardState.data.cargos.length > 0) {
            cargoCount = DashboardState.data.cargos.length;
            console.log('[Paywall] Using cargo count from DashboardState:', cargoCount);
        } else {
            // Fallback: try to get from genesys_empresa (not wizard state!)
            try {
                const empresaData = localStorage.getItem('genesys_empresa');
                if (empresaData) {
                    const empresa = JSON.parse(empresaData);
                    cargoCount = empresa.numCargos || 0;
                    console.log('[Paywall] Using cargo count from genesys_empresa:', cargoCount);
                }
            } catch (e) {
                console.warn('[Paywall] Error reading cargo count:', e);
            }
        }

        // Calculate total
        const total = cargoCount * PRICE_PER_CARGO;

        // Update display
        const countEl = document.getElementById('paywall-cargo-count');
        if (countEl) countEl.textContent = cargoCount.toString();

        const totalEl = document.getElementById('paywall-total');
        if (totalEl) totalEl.textContent = '$' + total.toLocaleString('es-CO');

        // Show overlay
        overlay.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();

        console.log('[Paywall] Modal shown - Cargos:', cargoCount, 'Total:', '$' + total.toLocaleString('es-CO'));
    };

    // Pay button handler
    const payBtn = document.getElementById('paywall-btn-pay');
    if (payBtn) {
        payBtn.addEventListener('click', async () => {
            console.log('[Paywall] Pay button clicked');

            // Close modal
            const overlay = document.getElementById('paywall-overlay');
            if (overlay) overlay.style.display = 'none';

            // Show payment instructions
            showNotification('Contáctenos para procesar su pago y desbloquear todos los documentos', 'info');

            // TODO: Integrate with payment gateway (Wompi, PayU, etc.)
            // For now, redirect to WhatsApp or contact page
            setTimeout(() => {
                const phone = '573102877240'; // Replace with actual business phone
                const message = encodeURIComponent('Hola, quiero pagar por los documentos del dashboard');
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
            }, 1500);
        });
    }

    // Download free cotización
    const downloadCotizacion = document.getElementById('paywall-download-cotizacion');
    if (downloadCotizacion) {
        downloadCotizacion.addEventListener('click', async function() {
            this.disabled = true;
            console.log('[Paywall] Downloading cotización...');

            try {
                // Get empresa ID and auth token
                const empresaId = localStorage.getItem('empresaId');
                const authToken = localStorage.getItem('authToken');

                if (!empresaId || !authToken) {
                    throw new Error('No se encontró información de sesión');
                }

                // Fetch documents from API
                const response = await fetch(`/api/documentos/empresa/${empresaId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener documentos');
                }

                const data = await response.json();

                // Get latest document's cotizacion URL
                if (data.documents && data.documents.length > 0) {
                    const latestDoc = data.documents[0]; // Most recent
                    const cotizacionUrl = latestDoc.preview_urls?.cotizacion;

                    if (cotizacionUrl) {
                        window.open(cotizacionUrl, '_blank');
                        showNotification('Cotización descargada exitosamente', 'success');
                    } else {
                        throw new Error('Cotización no disponible');
                    }
                } else {
                    throw new Error('No hay documentos disponibles');
                }
            } catch (error) {
                console.error('[Paywall] Error downloading cotización:', error);
                showNotification(error.message || 'Error al descargar la cotización', 'error');
            }

            this.disabled = false;
        });
    }

    // Download free perfil de cargo
    const downloadPerfil = document.getElementById('paywall-download-perfil');
    if (downloadPerfil) {
        downloadPerfil.addEventListener('click', async function() {
            this.disabled = true;
            console.log('[Paywall] Downloading perfil...');

            try {
                // Get empresa ID and auth token
                const empresaId = localStorage.getItem('empresaId');
                const authToken = localStorage.getItem('authToken');

                if (!empresaId || !authToken) {
                    throw new Error('No se encontró información de sesión');
                }

                // Fetch documents from API
                const response = await fetch(`/api/documentos/empresa/${empresaId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener documentos');
                }

                const data = await response.json();

                // Get latest document's perfil URL
                if (data.documents && data.documents.length > 0) {
                    const latestDoc = data.documents[0]; // Most recent
                    const perfilUrl = latestDoc.preview_urls?.perfil;

                    if (perfilUrl) {
                        window.open(perfilUrl, '_blank');
                        showNotification('Perfil de Cargo descargado exitosamente', 'success');
                    } else {
                        throw new Error('Perfil de cargo no disponible');
                    }
                } else {
                    throw new Error('No hay documentos disponibles');
                }
            } catch (error) {
                console.error('[Paywall] Error downloading perfil:', error);
                showNotification(error.message || 'Error al descargar el perfil', 'error');
            }

            this.disabled = false;
        });
    }

    // Start paywall timer if user hasn't paid AND should show paywall (not admin/medico)
    if (!checkIfShouldShowPaywall()) {
        console.log('[Paywall] Paywall deshabilitado para este rol.');
        return;
    }

    if (!hasUserPaid()) {
        console.log('[Paywall] User has not paid. Timer starting (' + (PAYWALL_DELAY / 1000) + 's)...');
        setTimeout(() => {
            // Check again in case user paid during the timer
            if (!hasUserPaid() && checkIfShouldShowPaywall()) {
                showPaywallModal();
            }
        }, PAYWALL_DELAY);
    } else {
        console.log('[Paywall] User has paid. No paywall will be shown.');
    }
}

// Initialize paywall when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaywallModal);
} else {
    initPaywallModal();
}

// ============================================
// MULTI-ROL INITIALIZATION
// ============================================
/**
 * Inicializa el sistema multi-rol para mostrar contenido
 * específico según el rol del usuario autenticado
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎭 Inicializando sistema multi-rol...');
        initMultiRolDashboard();
    });
} else {
    console.log('🎭 Inicializando sistema multi-rol...');
    initMultiRolDashboard();
}
