/**
 * Dashboard Handler - Sprint 1, 2, 3 & 4
 * Maneja la carga y visualizacion de documentos, cargos, matriz GTC-45, examenes y KPIs
 */

import dashboardCargos from './dashboardCargosHandler.js';
import dashboardExamenes from './dashboardExamenesHandler.js';

// Detectar entorno
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// Current active page
let currentPage = 'documents';

// ============================================
// AUTENTICACION
// ============================================

const token = localStorage.getItem('genesys_token');
const authType = localStorage.getItem('genesys_auth_type');
const userData = authType === 'user'
    ? JSON.parse(localStorage.getItem('genesys_user') || '{}')
    : JSON.parse(localStorage.getItem('genesys_empresa') || '{}');

// Verificar autenticacion
if (!token) {
    console.warn('No hay token, redirigiendo a login...');
    window.location.href = './login.html';
}

// ============================================
// DOM ELEMENTS
// ============================================

const loadingContainer = document.getElementById('loading-container');
const emptyState = document.getElementById('empty-state');
const documentsGrid = document.getElementById('documents-grid');
const cartContainer = document.getElementById('cart-container');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userRole = document.getElementById('user-role');
const logoutBtn = document.getElementById('logout-btn');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const proceedPaymentBtn = document.getElementById('proceed-payment-btn');

// ============================================
// CONFIGURACION DE DOCUMENTOS
// ============================================

const DOCUMENTS_CONFIG = [
    { key: 'matriz', name: 'Matriz de Riesgos', icon: '📊', isFree: false },
    { key: 'profesiograma', name: 'Profesiograma', icon: '🩺', isFree: false },
    { key: 'perfil', name: 'Perfil de Cargo', icon: '👤', isFree: false },
    { key: 'cotizacion', name: 'Cotizacion', icon: '💰', isFree: true }
];

// ============================================
// CARRITO DE COMPRAS
// ============================================

class ShoppingCart {
    constructor() {
        this.items = [];
    }

    add(docKey, docName, price, documentToken) {
        if (!this.items.find(item => item.key === docKey)) {
            this.items.push({ key: docKey, name: docName, price, token: documentToken });
            this.updateUI();
        }
    }

    remove(docKey) {
        this.items = this.items.filter(item => item.key !== docKey);
        this.updateUI();
    }

    toggle(docKey, docName, price, documentToken) {
        const exists = this.items.find(item => item.key === docKey);
        if (exists) {
            this.remove(docKey);
            return false;
        } else {
            this.add(docKey, docName, price, documentToken);
            return true;
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }

    updateUI() {
        if (cartCount) cartCount.textContent = this.items.length;
        if (cartTotal) cartTotal.textContent = this.formatCurrency(this.getTotal());

        if (cartContainer) {
            cartContainer.classList.toggle('visible', this.items.length > 0);
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    async handlePayment() {
        if (this.items.length === 0) return;

        console.log('Iniciando pago:', this.items);

        // TODO: Integrar con PayU (Sprint 3)
        try {
            const response = await fetch(`${API_BASE}/payu/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: this.items,
                    total: this.getTotal()
                })
            });

            const data = await response.json();

            if (data.success && data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                alert('Error al iniciar el pago. Intenta de nuevo.');
            }
        } catch (error) {
            console.error('Error en pago:', error);
            alert('Error de conexion. Intenta de nuevo.');
        }
    }
}

const cart = new ShoppingCart();

// ============================================
// RENDERIZADO DE DOCUMENTOS
// ============================================

function renderDocumentCard(docConfig, docData) {
    const url = docData.preview_urls?.[docConfig.key];
    const thumbnailUrl = docData.preview_urls?.thumbnails?.[docConfig.key];
    const pricing = docData.metadata?.pricing || {};
    const isAvailable = Boolean(url);
    const price = docConfig.isFree ? 0 : (pricing[`precio${capitalize(docConfig.key)}`] || 0);
    const pricePerCargo = pricing.precioBase || 30000;
    const numCargos = pricing.numCargos || docData.metadata?.numCargos || 0;

    // Estado de pago
    const isPaid = docData.estado === 'pagado';
    const statusClass = isPaid ? 'status-paid' : (docData.estado === 'procesando' ? 'status-processing' : 'status-pending');
    const statusText = isPaid ? 'Pagado' : (docData.estado === 'procesando' ? 'Procesando' : 'Pendiente');

    const card = document.createElement('div');
    card.className = 'document-card';
    card.dataset.key = docConfig.key;
    card.dataset.token = docData.token_acceso;

    card.innerHTML = `
        <img
            src="${thumbnailUrl || '../assets/images/placeholder-doc.svg'}"
            alt="${docConfig.name}"
            class="card-thumbnail"
            onerror="this.src='../assets/images/placeholder-doc.svg'"
        />
        <div class="card-body">
            <h3 class="card-title">${docConfig.icon} ${docConfig.name}</h3>
            <p class="card-meta">${docData.metadata?.nombreEmpresa || 'Empresa'} - ${numCargos} cargo${numCargos !== 1 ? 's' : ''}</p>

            <div class="card-status ${statusClass}">
                ${isPaid ? '✓' : '⏳'} ${statusText}
            </div>

            <div class="card-actions">
                <a
                    href="${isAvailable ? url : '#'}"
                    class="card-btn card-btn-download ${!isAvailable ? 'disabled' : ''}"
                    ${isAvailable ? 'target="_blank"' : ''}
                    ${!isAvailable ? 'onclick="return false;"' : ''}
                >
                    ⬇ Descargar
                </a>
                ${!docConfig.isFree && !isPaid ? `
                    <button
                        class="card-btn card-btn-cart"
                        data-action="cart"
                        data-key="${docConfig.key}"
                        data-name="${docConfig.name}"
                        data-price="${price}"
                        data-token="${docData.token_acceso}"
                    >
                        🛒 Agregar
                    </button>
                ` : ''}
            </div>
        </div>
    `;

    // Event listener para carrito
    const cartBtn = card.querySelector('[data-action="cart"]');
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const inCart = cart.toggle(
                btn.dataset.key,
                btn.dataset.name,
                parseInt(btn.dataset.price),
                btn.dataset.token
            );
            btn.classList.toggle('in-cart', inCart);
            btn.textContent = inCart ? '✓ En carrito' : '🛒 Agregar';
        });
    }

    return card;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// CARGA DE DOCUMENTOS
// ============================================

async function loadDocuments() {
    try {
        // Determinar empresa_id segun tipo de auth
        let empresaId;
        if (authType === 'empresa') {
            empresaId = userData.id;
        } else if (authType === 'user') {
            empresaId = userData.empresa_id;
        }

        if (!empresaId) {
            // Usuario sin empresa - mostrar estado vacio
            showEmptyState();
            return;
        }

        const response = await fetch(`${API_BASE}/documentos/empresa/${empresaId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token expirado
                logout();
                return;
            }
            throw new Error('Error al cargar documentos');
        }

        const data = await response.json();

        if (!data.success || !data.documents || data.documents.length === 0) {
            showEmptyState();
            return;
        }

        // Renderizar documentos
        renderDocuments(data.documents);

    } catch (error) {
        console.error('Error cargando documentos:', error);
        showEmptyState();
    }
}

function renderDocuments(documents) {
    loadingContainer.style.display = 'none';
    emptyState.style.display = 'none';
    documentsGrid.style.display = 'grid';

    documentsGrid.innerHTML = '';

    // Por cada documento, crear cards para cada tipo de archivo
    documents.forEach(doc => {
        DOCUMENTS_CONFIG.forEach(config => {
            if (doc.preview_urls?.[config.key]) {
                const card = renderDocumentCard(config, doc);
                documentsGrid.appendChild(card);
            }
        });
    });
}

function showEmptyState() {
    loadingContainer.style.display = 'none';
    documentsGrid.style.display = 'none';
    emptyState.style.display = 'block';
}

// ============================================
// UI: USUARIO Y NAVEGACION
// ============================================

function updateUserInfo() {
    if (authType === 'user') {
        if (userName) userName.textContent = userData.full_name || userData.email || 'Usuario';
        if (userRole) userRole.textContent = userData.rol || 'Usuario';
        if (userAvatar) userAvatar.textContent = (userData.full_name || userData.email || 'U').charAt(0).toUpperCase();
    } else if (authType === 'empresa') {
        if (userName) userName.textContent = userData.nombre_legal || userData.nit || 'Empresa';
        if (userRole) userRole.textContent = 'Empresa';
        if (userAvatar) userAvatar.textContent = (userData.nombre_legal || 'E').charAt(0).toUpperCase();
    }
}

function logout() {
    localStorage.removeItem('genesys_token');
    localStorage.removeItem('genesys_user');
    localStorage.removeItem('genesys_empresa');
    localStorage.removeItem('genesys_auth_type');
    window.location.href = './login.html';
}

// ============================================
// MENU MOBILE
// ============================================

function toggleMobileMenu() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('visible');
}

function closeMobileMenu() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
}

// ============================================
// EVENT LISTENERS
// ============================================

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMobileMenu);
}

if (proceedPaymentBtn) {
    proceedPaymentBtn.addEventListener('click', () => cart.handlePayment());
}

// Nav items - handle page switching
document.querySelectorAll('.nav-item:not(.disabled)').forEach(item => {
    item.addEventListener('click', async (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (!page || page === currentPage) return;

        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        closeMobileMenu();

        currentPage = page;
        await switchPage(page);
    });
});

// ============================================
// OPTIMIZED PAGE SWITCHING - Sprint 6 Bug Fix A.1 & A.2
// ============================================

// Page cache to avoid re-renders
const pageCache = {};

/**
 * Page switching logic - OPTIMIZED
 * ✅ Bug Fix A.1: Uses show/hide pattern instead of innerHTML
 * ✅ Bug Fix A.2: Pages are cached and reused
 */
async function switchPage(page) {
    const headerTitle = document.querySelector('.header-title');
    const contentContainer = document.querySelector('.dashboard-content');

    // Hide cart for non-document pages
    if (cartContainer) {
        cartContainer.style.display = page === 'documents' ? '' : 'none';
    }

    // Hide all existing pages
    const existingPages = contentContainer.querySelectorAll('[data-page]');
    existingPages.forEach(p => p.style.display = 'none');

    // Check if page already exists in cache
    let pageElement = pageCache[page];
    if (!pageElement) {
        // Create new page element
        pageElement = document.createElement('section');
        pageElement.dataset.page = page;
        pageElement.className = 'dashboard-page';
        contentContainer.appendChild(pageElement);
        pageCache[page] = pageElement;

        // Load page content (only once)
        await loadPageContent(page, pageElement, headerTitle);
    }

    // Show the page
    pageElement.style.display = 'block';

    // Update header title
    updatePageTitle(page, headerTitle);
}

/**
 * Update page title
 */
function updatePageTitle(page, headerTitle) {
    if (!headerTitle) return;

    const titles = {
        'documents': 'Mis Documentos',
        'cargos': 'Gestión de Cargos',
        'matriz': 'Matriz GTC-45',
        'controles': 'Controles por Jerarquía',
        'examenes': 'Exámenes Médicos',
        'mapa-calor': 'Mapa de Calor Organizacional',
        'home': 'Dashboard SST',
        'inteligencia': 'Inteligencia de Salud',
        'sve': 'SVE Automático',
        'psicosocial': 'Batería Psicosocial',
        'perfil-socio': 'Perfil Sociodemográfico',
        'profesiograma': 'Profesiograma',
        'config': 'Configuración'
    };

    headerTitle.textContent = titles[page] || 'Dashboard';
}

/**
 * Load page content once
 */
async function loadPageContent(page, pageElement, headerTitle) {
    switch (page) {
        case 'documents':
            await loadDocumentsPageOptimized(pageElement);
            break;

        case 'cargos':
            pageElement.innerHTML = '<div id="cargos-container"></div>';
            await dashboardCargos.loadCargosView(pageElement.querySelector('#cargos-container'));
            break;

        case 'matriz':
            pageElement.innerHTML = '<div id="matriz-container"></div>';
            await dashboardCargos.loadMatrizGTC45View(pageElement.querySelector('#matriz-container'));
            break;

        case 'controles':
            pageElement.innerHTML = '<div id="controles-container"></div>';
            await dashboardCargos.loadControlesView(pageElement.querySelector('#controles-container'));
            break;

        case 'examenes':
            pageElement.innerHTML = '<div id="examenes-container"></div>';
            await dashboardExamenes.loadExamenesView(pageElement.querySelector('#examenes-container'));
            break;

        case 'mapa-calor':
            pageElement.innerHTML = '<div id="mapa-calor-container"></div>';
            await dashboardExamenes.loadMapaCalorView(pageElement.querySelector('#mapa-calor-container'));
            break;

        case 'home':
            pageElement.innerHTML = '<div id="kpis-container"></div>';
            await dashboardExamenes.loadKPIsView(pageElement.querySelector('#kpis-container'));
            break;

        // ============================================
        // PLACEHOLDER PAGES - Sprint 5
        // ============================================

        case 'inteligencia':
            pageElement.innerHTML = renderPlaceholder({
                icon: '🧠',
                title: 'Inteligencia de Salud',
                subtitle: 'Analisis predictivo y recomendaciones basadas en datos medicos de tu organizacion.',
                features: [
                    'Analisis de tendencias de salud',
                    'Alertas tempranas de riesgo',
                    'Recomendaciones personalizadas',
                    'Reportes automaticos'
                ],
                badge: 'Requiere datos de examenes medicos'
            });
            break;

        case 'sve':
            pageElement.innerHTML = renderPlaceholder({
                icon: '📋',
                title: 'Sistema de Vigilancia Epidemiologica',
                subtitle: 'Generacion automatica de programas SVE basados en los riesgos identificados.',
                features: [
                    'SVE Osteomuscular',
                    'SVE Cardiovascular',
                    'SVE Visual',
                    'SVE Auditivo',
                    'Cronogramas automaticos'
                ],
                badge: 'Requiere historico de examenes'
            });
            break;

        case 'psicosocial':
            pageElement.innerHTML = renderPlaceholder({
                icon: '💭',
                title: 'Bateria de Riesgo Psicosocial',
                subtitle: 'Aplicacion y analisis de la bateria de riesgo psicosocial segun normativa colombiana.',
                features: [
                    'Cuestionarios digitales',
                    'Analisis automatico',
                    'Informe ejecutivo',
                    'Plan de intervencion'
                ],
                badge: 'Modulo en desarrollo'
            });
            break;

        case 'perfil-socio':
            pageElement.innerHTML = renderPlaceholder({
                icon: '👤',
                title: 'Perfil Sociodemografico',
                subtitle: 'Caracterizacion de la poblacion trabajadora para programas de bienestar.',
                features: [
                    'Datos demograficos',
                    'Condiciones de salud',
                    'Habitos y estilos de vida',
                    'Graficos estadisticos'
                ],
                badge: 'Requiere encuesta a trabajadores'
            });
            break;

        case 'profesiograma':
            pageElement.innerHTML = '<div id="profesiograma-container"></div>';
            await loadProfesiogramaView(pageElement.querySelector('#profesiograma-container'));
            break;

        case 'config':
            pageElement.innerHTML = renderPlaceholder({
                icon: '⚙️',
                title: 'Configuracion de Empresa',
                subtitle: 'Gestiona los datos de tu empresa, usuarios y preferencias del sistema.',
                features: [
                    'Datos de la empresa',
                    'Gestion de usuarios',
                    'Roles y permisos',
                    'Notificaciones'
                ],
                badge: 'Disponible pronto'
            });
            break;

        default:
            console.warn('Pagina no implementada:', page);
            pageElement.innerHTML = '<div class="error">Página no encontrada</div>';
    }
}

// ============================================
// OPTIMIZED DOCUMENTS PAGE WITH CACHE
// ✅ Bug Fix A.2: Document cache implementation
// ============================================

// Document cache (5 minutes TTL)
const documentCache = {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000
};

/**
 * Load documents page with caching
 */
async function loadDocumentsPageOptimized(pageElement) {
    // Build HTML structure
    pageElement.innerHTML = `
        <section class="documents-section">
            <div class="loading-container" id="loading-container-docs">
                <div class="loading-spinner"></div>
                <p>Cargando documentos...</p>
            </div>
            <div class="empty-state" id="empty-state-docs" style="display: none;">
                <div class="empty-state-icon">📂</div>
                <h3 class="empty-state-title">No tienes documentos aún</h3>
                <p class="empty-state-text">Comienza generando tu primer diagnóstico de riesgos ocupacionales</p>
                <a href="./wizard_riesgos.html" class="header-btn header-btn-primary">Crear Diagnóstico</a>
            </div>
            <div class="documents-grid" id="documents-grid-main" style="display: none;"></div>
        </section>
    `;

    const loadingEl = pageElement.querySelector('#loading-container-docs');
    const emptyStateEl = pageElement.querySelector('#empty-state-docs');
    const gridEl = pageElement.querySelector('#documents-grid-main');

    const now = Date.now();

    // Check cache
    if (documentCache.data &&
        documentCache.timestamp &&
        (now - documentCache.timestamp) < documentCache.ttl) {

        console.log('📦 Using cached documents');
        renderDocumentsOptimized(gridEl, emptyStateEl, loadingEl, documentCache.data);
        return;
    }

    try {
        // Determinar empresa_id segun tipo de auth
        let empresaId;
        if (authType === 'empresa') {
            empresaId = userData.id;
        } else if (authType === 'user') {
            empresaId = userData.empresa_id;
        }

        if (!empresaId) {
            loadingEl.style.display = 'none';
            emptyStateEl.style.display = 'flex';
            gridEl.style.display = 'none';
            return;
        }

        const response = await fetch(`${API_BASE}/documentos/empresa/${empresaId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Update cache
        documentCache.data = data;
        documentCache.timestamp = now;
        console.log('🔄 Documents cached');

        renderDocumentsOptimized(gridEl, emptyStateEl, loadingEl, data);
    } catch (error) {
        console.error('Error loading documents:', error);
        loadingEl.style.display = 'none';
        gridEl.innerHTML = `
            <div class="error-message">
                <p>Error al cargar documentos: ${error.message}</p>
                <button onclick="location.reload()">Reintentar</button>
            </div>
        `;
        gridEl.style.display = 'block';
    }
}

/**
 * Render documents in grid
 */
function renderDocumentsOptimized(gridEl, emptyStateEl, loadingEl, data) {
    loadingEl.style.display = 'none';

    if (!data || !data.success || !data.documents || data.documents.length === 0) {
        emptyStateEl.style.display = 'flex';
        gridEl.style.display = 'none';
        return;
    }

    emptyStateEl.style.display = 'none';
    gridEl.style.display = 'grid';

    gridEl.innerHTML = '';

    // Por cada documento, crear cards para cada tipo de archivo
    data.documents.forEach(doc => {
        DOCUMENTS_CONFIG.forEach(config => {
            if (doc.preview_urls?.[config.key]) {
                const card = renderDocumentCard(config, doc);
                gridEl.appendChild(card);
            }
        });
    });
}

/**
 * Invalidate document cache (call after upload/delete)
 */
function invalidateDocumentCache() {
    documentCache.data = null;
    documentCache.timestamp = null;
    console.log('🗑️ Document cache cleared');
}

// Export cache invalidation for external use
window.invalidateDocumentCache = invalidateDocumentCache;

// ============================================
// PLACEHOLDER RENDERER
// ============================================

function renderPlaceholder({ icon, title, subtitle, features, badge }) {
    return `
        <div class="placeholder-view">
            <div class="placeholder-card">
                <div class="placeholder-icon">${icon}</div>
                <h2 class="placeholder-title">${title}</h2>
                <p class="placeholder-subtitle">${subtitle}</p>
                <div class="placeholder-features">
                    ${features.map(f => `<span class="placeholder-feature">✓ ${f}</span>`).join('')}
                </div>
                <div class="placeholder-badge">
                    ⏳ ${badge}
                </div>
                <div class="placeholder-cta">
                    <a href="mailto:contacto@genesyslm.com.co?subject=Interes en ${title}" class="placeholder-btn secondary">
                        📩 Solicitar informacion
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// PROFESIOGRAMA VIEW
// ============================================

/**
 * Load Profesiograma view - integrates with wizard data
 */
async function loadProfesiogramaView(container) {
    // Check for wizard state data first
    const wizardStateRaw = localStorage.getItem('genesys_wizard_state');
    let wizardData = null;

    if (wizardStateRaw) {
        try {
            wizardData = JSON.parse(wizardStateRaw);
        } catch (e) {
            console.warn('Error parsing wizard state:', e);
        }
    }

    // If no wizard data, check for saved profesiograma from API
    if (!wizardData || !wizardData.formData || !wizardData.formData.cargos || wizardData.formData.cargos.length === 0) {
        // Try to load from API
        try {
            let empresaId;
            if (authType === 'empresa') {
                empresaId = userData.id;
            } else if (authType === 'user') {
                empresaId = userData.empresa_id;
            }

            if (empresaId) {
                const response = await fetch(`${API_BASE}/documentos/empresa/${empresaId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.documents && data.documents.length > 0) {
                        // Check if any document has profesiograma
                        const docWithProfesiograma = data.documents.find(d => d.preview_urls?.profesiograma);
                        if (docWithProfesiograma) {
                            container.innerHTML = `
                                <div class="profesiograma-dashboard-container">
                                    <div class="profesiograma-nav-inline">
                                        <a href="./profesiograma_view.html?id=${docWithProfesiograma.id}"
                                           class="btn btn-primary" target="_blank">
                                            <i data-lucide="external-link"></i>
                                            Ver Profesiograma Completo
                                        </a>
                                    </div>
                                    <div class="profesiograma-embedded-viewer">
                                        <iframe
                                            src="./profesiograma_view.html?id=${docWithProfesiograma.id}&embed=true"
                                            style="width: 100%; height: 600px; border: none; border-radius: 8px;"
                                        ></iframe>
                                    </div>
                                </div>
                            `;
                            lucide.createIcons();
                            return;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading profesiograma from API:', error);
        }

        // Show empty state
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="file-text" style="width: 64px; height: 64px; color: #6b7280; margin-bottom: 16px;"></i>
                <h3 class="empty-state__title">Sin profesiograma</h3>
                <p class="empty-state__description">
                    Aun no has generado un profesiograma. Usa el asistente de riesgos para crear uno.
                </p>
                <a href="./wizard_riesgos.html" class="btn btn-primary">
                    <i data-lucide="plus"></i>
                    Crear Profesiograma
                </a>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    // Render profesiograma from wizard data
    const formData = wizardData.formData;
    const cargos = formData.cargos || [];

    container.innerHTML = `
        <div class="profesiograma-dashboard-container">
            <div class="page-header" style="margin-bottom: 24px;">
                <div class="page-header__left">
                    <h2 style="font-size: 2rem; font-weight: 700; color: #383d47; margin: 0;">
                        ${formData.nombreEmpresa || 'Empresa'}
                    </h2>
                    <p style="color: #6b7280; margin-top: 4px;">
                        NIT: ${formData.nit || '--'} | Sector: ${formData.sector || '--'}
                    </p>
                </div>
                <div class="page-header__actions">
                    <span class="badge badge--info" style="padding: 8px 16px;">
                        ${cargos.length} cargo${cargos.length !== 1 ? 's' : ''} configurado${cargos.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div id="cargos-profesiograma-list">
                ${cargos.map((cargo, index) => renderCargoProfileCard(cargo, index)).join('')}
            </div>

            <div class="profesiograma-actions" style="margin-top: 24px; text-align: center;">
                <a href="./wizard_riesgos.html" class="btn btn-outline" style="margin-right: 12px;">
                    <i data-lucide="edit"></i>
                    Editar en Asistente
                </a>
                <button class="btn btn-primary" id="btn-generate-profesiograma">
                    <i data-lucide="file-text"></i>
                    Generar Documento PDF
                </button>
            </div>
        </div>
    `;

    // Initialize icons
    lucide.createIcons();

    // Add event listener for generate button
    const generateBtn = container.querySelector('#btn-generate-profesiograma');
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Generando...';
            lucide.createIcons();

            // Redirect to wizard to complete and generate
            window.location.href = './wizard_riesgos.html';
        });
    }
}

/**
 * Render a cargo profile card for profesiograma view
 */
function renderCargoProfileCard(cargo, index) {
    const gesCount = cargo.ges?.length || 0;
    const hasNiveles = cargo.ges?.some(g => g.niveles?.NR);

    // Get risk categories from GES
    const riskCategories = [...new Set(cargo.ges?.map(g => g.categoria) || [])];

    // Special conditions
    const conditions = [];
    if (cargo.trabajaAlturas) conditions.push('Trabajo en Alturas');
    if (cargo.espaciosConfinados) conditions.push('Espacios Confinados');
    if (cargo.manipulaAlimentos) conditions.push('Manipulacion de Alimentos');
    if (cargo.operaMaquinaria) conditions.push('Opera Maquinaria');
    if (cargo.conduccion) conditions.push('Conduccion');

    return `
        <div class="cargo-profesiograma-card" style="
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
            <div class="cargo-profesiograma-card__header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e5e7eb;
            ">
                <div>
                    <h3 style="font-size: 1.6rem; font-weight: 600; color: #383d47; margin: 0;">
                        ${cargo.nombre || `Cargo ${index + 1}`}
                    </h3>
                    <p style="font-size: 1.2rem; color: #6b7280; margin-top: 4px;">
                        ${cargo.area || 'Sin area'} | ${cargo.zona || 'Sin zona'} | ${cargo.numPersonas || 0} persona${cargo.numPersonas !== 1 ? 's' : ''}
                    </p>
                </div>
                <span class="badge ${gesCount > 0 ? 'badge--success' : 'badge--warning'}" style="padding: 6px 12px;">
                    ${gesCount} riesgo${gesCount !== 1 ? 's' : ''}
                </span>
            </div>

            ${riskCategories.length > 0 ? `
                <div style="margin-bottom: 12px;">
                    <p style="font-size: 1.1rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                        Categorias de Riesgo
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${riskCategories.map(cat => `
                            <span style="
                                display: inline-block;
                                padding: 4px 10px;
                                background: rgba(93, 196, 175, 0.1);
                                color: #5dc4af;
                                border-radius: 4px;
                                font-size: 1.2rem;
                                font-weight: 500;
                            ">${cat}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${conditions.length > 0 ? `
                <div style="margin-bottom: 12px;">
                    <p style="font-size: 1.1rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                        Condiciones Especiales
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${conditions.map(cond => `
                            <span style="
                                display: inline-flex;
                                align-items: center;
                                gap: 4px;
                                padding: 4px 10px;
                                background: rgba(249, 115, 22, 0.1);
                                color: #f97316;
                                border-radius: 4px;
                                font-size: 1.2rem;
                                font-weight: 500;
                            ">⚠️ ${cond}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${hasNiveles ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 1.1rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                        Niveles de Riesgo Configurados
                    </p>
                    <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                        ${cargo.ges.filter(g => g.niveles?.NR).slice(0, 3).map(g => `
                            <div style="
                                background: #f5f5f5;
                                padding: 8px 12px;
                                border-radius: 6px;
                                font-size: 1.2rem;
                            ">
                                <strong>${g.nombre?.substring(0, 30) || 'Riesgo'}${g.nombre?.length > 30 ? '...' : ''}</strong>
                                <span style="
                                    display: inline-block;
                                    margin-left: 8px;
                                    padding: 2px 8px;
                                    background: ${getNRColor(g.niveles.NR)};
                                    color: white;
                                    border-radius: 4px;
                                    font-weight: 600;
                                ">NR: ${g.niveles.NR}</span>
                            </div>
                        `).join('')}
                        ${cargo.ges.filter(g => g.niveles?.NR).length > 3 ? `
                            <span style="color: #6b7280; font-size: 1.2rem; align-self: center;">
                                +${cargo.ges.filter(g => g.niveles?.NR).length - 3} mas...
                            </span>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Get color for NR level based on GTC-45
 */
function getNRColor(nr) {
    const nrNum = parseInt(nr) || 0;
    if (nrNum <= 20) return '#10b981';      // Verde - Nivel I
    if (nrNum <= 120) return '#84cc16';     // Verde claro - Nivel II
    if (nrNum <= 360) return '#f59e0b';     // Amarillo - Nivel III
    if (nrNum <= 600) return '#f97316';     // Naranja - Nivel IV
    return '#ef4444';                        // Rojo - Nivel V (No aceptable)
}

// ============================================
// INICIALIZACION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard inicializado');
    console.log('Auth type:', authType);
    console.log('User data:', userData);

    updateUserInfo();
    loadDocuments();
});
