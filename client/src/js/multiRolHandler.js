/**
 * Multi-Rol Dashboard Handler
 * Sprint 6 - Sistema Multi-Rol
 *
 * Maneja la navegación y funcionalidades específicas para roles:
 * - admin_genesys: Administrador interno de Genesys
 * - medico_ocupacional: Médico SST asignado a empresas
 * - empresa: Usuario empresa (dashboard existente)
 */

import { initFirmaDigitalUploader } from './components/FirmaDigitalUploader.js';
import DataTable from './components/DataTable.js';
import Modal from './components/Modal.js';
import { Tooltip } from './components/Tooltip.js';

// ============================================
// CONSTANTES Y CONFIGURACIÓN
// ============================================
const API_BASE = '/api';
const ROLES = {
    ADMIN_GENESYS: 'admin_genesys',
    MEDICO_OCUPACIONAL: 'medico_ocupacional',
    EMPRESA: 'empresa'
};

// ============================================
// ESTADO MULTI-ROL
// ============================================
const MultiRolState = {
    user: null,
    rol: null,
    token: null,
    empresaSeleccionada: null,
    // Datos específicos por rol
    data: {
        empresas: [],
        medicos: [],
        pagos: [],
        auditoria: []
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa el handler multi-rol
 * Detecta el rol del usuario y configura la navegación apropiada
 */
export async function initMultiRolDashboard() {
    console.log('[MultiRol] Inicializando dashboard multi-rol...');

    // Inicializar sistema de tooltips con Floating UI
    Tooltip.init();
    console.log('[MultiRol] ✅ Tooltips inicializados');

    // Obtener token y usuario del localStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userStr = localStorage.getItem('genesys_user') || sessionStorage.getItem('genesys_user');

    if (!token) {
        console.warn('[MultiRol] No hay token, redirigiendo a login...');
        window.location.href = '/pages/login.html';
        return;
    }

    if (!userStr) {
        console.warn('[MultiRol] No hay usuario en localStorage, pero hay token. Continuando...');
        // Si no hay usuario pero hay token, el usuario es probablemente una empresa
        // El dashboard normal lo manejará
        return;
    }

    try {
        MultiRolState.token = token;
        MultiRolState.user = JSON.parse(userStr);
        MultiRolState.rol = MultiRolState.user.rol || 'empresa';

        console.log('[MultiRol] Usuario:', MultiRolState.user.full_name);
        console.log('[MultiRol] Rol:', MultiRolState.rol);

        // Configurar UI según rol
        console.log('[MultiRol] 🔄 Ejecutando configureRoleBasedUI...');
        await configureRoleBasedUI();
        console.log('[MultiRol] ✅ configureRoleBasedUI completado');

        // Configurar sidebar según rol
        console.log('[MultiRol] 🔄 Ejecutando configureSidebarForRole...');
        try {
            configureSidebarForRole();
            console.log('[MultiRol] ✅ configureSidebarForRole completado');
        } catch (sidebarError) {
            console.error('[MultiRol] ❌ Error en configureSidebarForRole:', sidebarError);
        }

        // Cargar datos iniciales según rol
        console.log('[MultiRol] 🔄 Ejecutando loadInitialDataForRole...');
        await loadInitialDataForRole();
        console.log('[MultiRol] ✅ loadInitialDataForRole completado');

        // Inicializar selector de empresas para médico (después de cargar datos)
        if (MultiRolState.rol === ROLES.MEDICO_OCUPACIONAL) {
            console.log('[MultiRol] 🔄 Inicializando selector de empresas del médico...');
            initMedicoEmpresaSelector();
            console.log('[MultiRol] ✅ Selector de empresas inicializado');

            // Cargar contador de mensajes no leídos
            loadConversacionesBadge();
        }

        // Cargar contador de mensajes para empresa
        if (MultiRolState.rol === ROLES.EMPRESA) {
            loadConversacionesBadgeEmpresa();
        }

        // Configurar handlers de página específicos
        registerRolePageHandlers();

        // ✅ Cargar la página según el hash URL actual (para que funcione al recargar)
        const currentHash = window.location.hash.replace('#', '') || 'home';
        if (window.multiRolPageHandlers && window.multiRolPageHandlers[currentHash]) {
            console.log('[MultiRol] 🔄 Cargando datos de página actual:', currentHash);
            await window.multiRolPageHandlers[currentHash]();
        }

        // Escuchar evento de actualización de firma digital
        window.addEventListener('firmaDigitalActualizada', (event) => {
            console.log('[MultiRol] 📝 Firma digital actualizada:', event.detail);
            // Actualizar estado
            MultiRolState.data.tieneFirma = event.detail.tieneFirma;
            MultiRolState.data.firma = event.detail.firma;

            // Re-renderizar dashboard si estamos en home
            const currentPage = document.querySelector('.dashboard-page[style*="display: block"]')?.id;
            if (currentPage === 'page-home' && MultiRolState.rol === ROLES.MEDICO_OCUPACIONAL) {
                console.log('[MultiRol] Re-renderizando dashboard médico...');
                renderMedicoDashboard();
            }

            // Re-renderizar config page si estamos en ella
            if (currentPage === 'page-config' && MultiRolState.rol === ROLES.MEDICO_OCUPACIONAL) {
                console.log('[MultiRol] Re-renderizando config médico...');
                loadMedicoConfigPage();
            }
        });

        // Escuchar evento de cambio de empresa seleccionada (para médicos)
        window.addEventListener('empresaSeleccionada', (event) => {
            console.log('[MultiRol] 🏢 Empresa seleccionada:', event.detail);
            const { empresaId, empresa } = event.detail;

            if (MultiRolState.rol === ROLES.MEDICO_OCUPACIONAL && empresaId) {
                // Sincronizar el selector de la página de profesiograma si existe
                const selectProfesiograma = document.getElementById('select-empresa-profesiograma');
                if (selectProfesiograma && selectProfesiograma.value !== empresaId) {
                    selectProfesiograma.value = empresaId;
                }

                // Si estamos en la página de profesiograma, cargar automáticamente el editor
                const profesiogramaPage = document.getElementById('page-profesiograma');
                if (profesiogramaPage && profesiogramaPage.style.display !== 'none') {
                    console.log('[MultiRol] Cargando profesiograma automáticamente para empresa:', empresaId);
                    loadProfesiogramaEditor(empresaId);
                }
            }
        });

    } catch (error) {
        console.error('[MultiRol] Error inicializando:', error);
        showNotification('Error cargando dashboard', 'error');
    }
}

/**
 * Configura la UI según el rol del usuario
 */
async function configureRoleBasedUI() {
    const { rol, user } = MultiRolState;

    // Actualizar header con info del usuario
    updateHeaderForRole(user, rol);

    // Mostrar/ocultar elementos según rol
    document.querySelectorAll('[data-role-visible]').forEach(el => {
        const allowedRoles = el.dataset.roleVisible.split(',');
        el.style.display = allowedRoles.includes(rol) ? '' : 'none';
    });

    // Agregar clase al body para estilos específicos por rol
    document.body.classList.remove('rol-admin', 'rol-medico', 'rol-empresa');
    document.body.classList.add(`rol-${rol.replace('_', '-')}`);
}

/**
 * Actualiza el header según el rol
 */
function updateHeaderForRole(user, rol) {
    const userNameEl = document.getElementById('user-name');
    const userRoleEl = document.getElementById('user-role');
    const companyInfoEl = document.getElementById('company-info');
    const companyNameEl = document.getElementById('company-name');
    const companyDetailsEl = document.querySelector('.header-company-info__details');

    if (userNameEl) {
        userNameEl.textContent = user.full_name || user.email;
    }

    if (userRoleEl) {
        const roleLabels = {
            [ROLES.ADMIN_GENESYS]: 'Administrador Genesys',
            [ROLES.MEDICO_OCUPACIONAL]: 'Médico Ocupacional',
            [ROLES.EMPRESA]: 'Usuario Empresa'
        };
        userRoleEl.textContent = roleLabels[rol] || rol;
    }

    if (companyInfoEl) {
        if (rol === ROLES.ADMIN_GENESYS) {
            // Admin: Mostrar nombre de Genesys
            companyInfoEl.innerHTML = `
                <div class="header-company-info__main">
                    <span class="header-company-info__name">Genesys Laboral Medicine</span>
                </div>
            `;
        } else if (rol === ROLES.MEDICO_OCUPACIONAL) {
            // Médico: Mostrar nombre, licencia SST y selector de empresas
            companyInfoEl.innerHTML = `
                <div class="header-medico-info">
                    <div class="header-medico-info__identity">
                        <span class="header-medico-info__name">${user.full_name || 'Médico Ocupacional'}</span>
                        <span class="header-medico-info__license" data-tooltip="Licencia de Seguridad y Salud en el Trabajo" data-tooltip-placement="bottom">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Lic. SST: ${user.licencia_sst || 'No registrada'}
                        </span>
                    </div>
                    <div class="header-medico-info__separator"></div>
                    <div class="header-medico-info__empresa">
                        <label for="header-empresa-selector">Empresa:</label>
                        <select id="header-empresa-selector" class="header-empresa-select">
                            <option value="">Cargando...</option>
                        </select>
                    </div>
                </div>
            `;
            // El selector se inicializa después en initMultiRolDashboard() una vez que se cargan las empresas
        } else {
            // Usuario empresa: mostrar info normal de empresa
            if (companyNameEl) {
                companyNameEl.textContent = user.company_name || 'Mi Empresa';
            }
            if (companyDetailsEl) {
                companyDetailsEl.style.display = 'flex';
            }
        }
    }
}

/**
 * Inicializa el selector de empresas en el header para el médico
 */
function initMedicoEmpresaSelector() {
    const selector = document.getElementById('header-empresa-selector');
    if (!selector) return;

    const empresas = MultiRolState.data.empresas || [];

    // Limpiar y poblar el selector
    selector.innerHTML = `
        <option value="">Seleccionar empresa...</option>
        ${empresas.map(emp => `
            <option value="${emp.empresa_id}" data-nit="${emp.nit}" data-ciudad="${emp.ciudad || 'N/A'}">
                ${emp.nombre_legal}
            </option>
        `).join('')}
    `;

    // Si hay empresa seleccionada previamente, restaurarla
    if (MultiRolState.empresaSeleccionada) {
        selector.value = MultiRolState.empresaSeleccionada;
        updateEmpresaDetails(MultiRolState.empresaSeleccionada);
    }

    // Event listener para cambio de empresa
    selector.addEventListener('change', (e) => {
        const empresaId = e.target.value;
        MultiRolState.empresaSeleccionada = empresaId;

        if (empresaId) {
            updateEmpresaDetails(empresaId);
            // Disparar evento para que otros componentes se actualicen
            window.dispatchEvent(new CustomEvent('empresaSeleccionada', {
                detail: { empresaId, empresa: empresas.find(emp => emp.empresa_id == empresaId) }
            }));
        } else {
            // Ocultar detalles si no hay empresa seleccionada
            const detailsEl = document.getElementById('empresa-details');
            if (detailsEl) detailsEl.style.display = 'none';
        }
    });
}

/**
 * Actualiza los detalles de la empresa seleccionada en el header
 */
function updateEmpresaDetails(empresaId) {
    const empresas = MultiRolState.data.empresas || [];
    const empresa = empresas.find(emp => emp.empresa_id == empresaId);

    const detailsEl = document.getElementById('empresa-details');
    const nitEl = document.getElementById('empresa-nit-value');
    const ciudadEl = document.getElementById('empresa-ciudad-value');

    if (empresa && detailsEl) {
        detailsEl.style.display = 'flex';
        if (nitEl) nitEl.textContent = empresa.nit || '-';
        if (ciudadEl) ciudadEl.textContent = empresa.ciudad || 'Sin ciudad';
    }
}

/**
 * Configura el sidebar con las opciones de navegación según rol
 */
function configureSidebarForRole() {
    const { rol } = MultiRolState;
    console.log('[MultiRol] Configurando sidebar para rol:', rol);

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        console.warn('[MultiRol] Sidebar no encontrado');
        return;
    }

    // Definir qué pestañas son visibles para cada rol
    const roleVisibility = {
        [ROLES.ADMIN_GENESYS]: {
            visible: ['home', 'admin-empresas', 'admin-medicos', 'admin-pagos', 'admin-auditoria', 'config'],
            hidden: [
                'mapa-org', 'cargos', 'matriz', 'profesiograma', 'examenes',
                'documentos', 'inteligencia', 'estadisticas', 'sve', 'psicosocial',
                'panel-medico'
            ]
        },
        [ROLES.MEDICO_OCUPACIONAL]: {
            visible: ['home', 'profesiograma', 'examenes', 'documentos', 'medico-mensajes', 'config'],
            hidden: [
                'mapa-org', 'cargos', 'matriz', 'inteligencia', 'estadisticas', 'sve', 'psicosocial',
                'admin-empresas', 'admin-medicos', 'admin-pagos', 'admin-auditoria'
            ]
        },
        [ROLES.EMPRESA]: {
            visible: [
                'home', 'mapa-org', 'cargos', 'matriz', 'profesiograma', 'examenes',
                'documentos', 'inteligencia', 'estadisticas', 'sve', 'psicosocial',
                'panel-medico', 'empresa-mensajes', 'config'
            ],
            hidden: ['admin-empresas', 'admin-medicos', 'admin-pagos', 'admin-auditoria']
        }
    };

    const config = roleVisibility[rol] || roleVisibility[ROLES.EMPRESA];

    // Ocultar/mostrar pestañas según el rol
    const navItems = sidebar.querySelectorAll('.sidebar-nav__item[data-page]');
    let visibleCount = 0;
    let hiddenCount = 0;

    console.log('[MultiRol] Encontrados', navItems.length, 'items de navegación');

    navItems.forEach(item => {
        const page = item.dataset.page;
        const listItem = item.parentElement; // El <li> que contiene el <a>

        if (page && config.hidden.includes(page)) {
            listItem.style.display = 'none';
            hiddenCount++;
            console.log('[MultiRol] Ocultando pestaña:', page);
        } else {
            listItem.style.display = '';
            visibleCount++;
            console.log('[MultiRol] Mostrando pestaña:', page);
        }
    });

    console.log(`[MultiRol] Sidebar configurado: ${visibleCount} pestañas visibles, ${hiddenCount} ocultas`);
}

/**
 * Carga datos iniciales según el rol
 */
async function loadInitialDataForRole() {
    const { rol, token } = MultiRolState;

    try {
        switch (rol) {
            case ROLES.ADMIN_GENESYS:
                await loadAdminInitialData();
                break;
            case ROLES.MEDICO_OCUPACIONAL:
                await loadMedicoInitialData();
                break;
            default:
                // Empresa: usar dashboard existente
                break;
        }
    } catch (error) {
        console.error('[MultiRol] Error cargando datos iniciales:', error);
    }
}

/**
 * Carga datos iniciales para admin
 */
async function loadAdminInitialData() {
    const { token } = MultiRolState;

    try {
        // Cargar resumen de empresas, médicos y pagos en paralelo
        const [empresasRes, medicosRes, pagosRes] = await Promise.all([
            fetch(`${API_BASE}/admin/empresas?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_BASE}/admin/medicos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_BASE}/admin/pagos?estado=pendiente&limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (empresasRes.ok) {
            const data = await empresasRes.json();
            MultiRolState.data.empresas = data.empresas || [];
        }

        if (medicosRes.ok) {
            const data = await medicosRes.json();
            MultiRolState.data.medicos = data.medicos || [];
        }

        if (pagosRes.ok) {
            const data = await pagosRes.json();
            MultiRolState.data.pagos = data.pagos || [];
            MultiRolState.data.pagosPendientes = data.pagination?.total || 0;
        }

        console.log('[MultiRol] Datos admin cargados');

        // Renderizar dashboard admin en la página home
        await renderAdminDashboard();
    } catch (error) {
        console.error('[MultiRol] Error cargando datos admin:', error);
    }
}

/**
 * Carga datos iniciales para médico
 */
async function loadMedicoInitialData() {
    const { token } = MultiRolState;

    try {
        // Cargar empresas asignadas y estado de firma
        const [empresasRes, firmaRes] = await Promise.all([
            fetch(`${API_BASE}/medico/empresas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_BASE}/medico/firma`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (empresasRes.ok) {
            const data = await empresasRes.json();
            MultiRolState.data.empresas = data.empresas || [];
        }

        if (firmaRes.ok) {
            const data = await firmaRes.json();
            MultiRolState.data.firma = data.firma;
            MultiRolState.data.tieneFirma = data.tieneFirma;
        }

        console.log('[MultiRol] Datos médico cargados');

        // Renderizar dashboard médico en la página home
        await renderMedicoDashboard();
    } catch (error) {
        console.error('[MultiRol] Error cargando datos médico:', error);
    }
}

// ============================================
// HANDLERS DE PÁGINA POR ROL
// ============================================

/**
 * Registra los handlers de página específicos por rol
 */
function registerRolePageHandlers() {
    const { rol } = MultiRolState;

    // Exponer handlers globalmente para que NavigationHandler los use
    window.multiRolPageHandlers = {
        // Admin pages
        'admin-home': loadAdminHomePage,
        'admin-empresas': loadAdminEmpresasPage,
        'admin-medicos': loadAdminMedicosPage,
        'admin-pagos': loadAdminPagosPage,
        'admin-auditoria': loadAdminAuditoriaPage,
        'admin-config': loadAdminConfigPage,

        // Médico pages
        'medico-home': loadMedicoHomePage,
        'medico-empresas': loadMedicoEmpresasPage,
        'medico-profesiograma': loadMedicoProfesiogramaPage,
        'medico-examenes': loadMedicoExamenesPage,
        'medico-firma': loadMedicoFirmaPage,
        'medico-mensajes': loadMedicoMensajesPage,
        'medico-config': loadMedicoConfigPage,

        // Empresa pages (mensajes)
        'empresa-mensajes': loadEmpresaMensajesPage
    };

    // Sobrescribir handlers de páginas compartidas según el rol
    if (rol === ROLES.MEDICO_OCUPACIONAL) {
        window.multiRolPageHandlers['config'] = loadMedicoConfigPage;
        window.multiRolPageHandlers['profesiograma'] = loadMedicoProfesiogramaPage;
        console.log('[MultiRol] Handlers de config y profesiograma sobrescritos para médico');
    } else if (rol === ROLES.ADMIN_GENESYS) {
        window.multiRolPageHandlers['config'] = loadAdminConfigPage;
        console.log('[MultiRol] Handler de config sobrescrito para admin');
    }
}

// ============================================
// RENDERIZADO DE DASHBOARD ADMIN
// ============================================

/**
 * Renderiza el dashboard de admin en la página home
 */
async function renderAdminDashboard() {
    console.log('[MultiRol] Renderizando dashboard admin...');

    const homePageContent = document.querySelector('#page-home');
    if (!homePageContent) {
        console.warn('[MultiRol] No se encontró la página home');
        return;
    }

    const { empresas = [], medicos = [], pagos = [], pagosPendientes = 0 } = MultiRolState.data;

    // Calcular estadísticas
    const totalEmpresas = empresas.length;
    const totalMedicos = medicos.length;
    const empresasActivas = empresas.filter(e => e.status === 'activo').length;

    homePageContent.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">Panel de Administración Genesys</h1>
            <div class="page-header__meta">
                <div class="live-indicator">
                    <span class="live-indicator__dot"></span>
                    <span>Sistema en línea</span>
                </div>
            </div>
        </div>

        <!-- Estadísticas principales -->
        <div class="dashboard-grid dashboard-grid--cols-4">
            <div class="card card--metric">
                <div class="card__icon">
                    <i data-lucide="building-2"></i>
                </div>
                <div class="card__body">
                    <div class="metric-value">${totalEmpresas}</div>
                    <div class="metric-label">Empresas Registradas</div>
                    <div class="metric-sublabel">
                        <span style="color: #4caf50;">${empresasActivas}</span> activas
                    </div>
                </div>
            </div>

            <div class="card card--metric">
                <div class="card__icon">
                    <i data-lucide="user-cog"></i>
                </div>
                <div class="card__body">
                    <div class="metric-value">${totalMedicos}</div>
                    <div class="metric-label">Médicos Ocupacionales</div>
                    <div class="metric-sublabel">Registrados en el sistema</div>
                </div>
            </div>

            <div class="card card--metric card--warning">
                <div class="card__icon">
                    <i data-lucide="credit-card"></i>
                </div>
                <div class="card__body">
                    <div class="metric-value metric-value--warning">${pagosPendientes}</div>
                    <div class="metric-label">Pagos Pendientes</div>
                    <div class="metric-sublabel">Requieren revisión</div>
                </div>
            </div>

            <div class="card card--metric card--success">
                <div class="card__icon">
                    <i data-lucide="activity"></i>
                </div>
                <div class="card__body">
                    <div class="metric-value metric-value--success">100%</div>
                    <div class="metric-label">Sistema Operativo</div>
                    <div class="metric-sublabel">Todos los servicios OK</div>
                </div>
            </div>
        </div>

        <!-- Sección de accesos rápidos -->
        <div class="dashboard-grid dashboard-grid--cols-2" style="margin-top: 2.4rem;">
            <div class="card card--link" data-navigate="admin-empresas">
                <div class="card__header">
                    <h3 class="card__title">Gestión de Empresas</h3>
                    <i data-lucide="arrow-right" class="card__link-icon"></i>
                </div>
                <div class="card__body">
                    <p style="color: #666; font-size: 1.4rem; margin-bottom: 1.6rem;">
                        Administra todas las empresas registradas en el sistema
                    </p>
                    ${renderUltimasEmpresas(empresas.slice(0, 3))}
                </div>
            </div>

            <div class="card card--link" data-navigate="admin-medicos">
                <div class="card__header">
                    <h3 class="card__title">Gestión de Médicos</h3>
                    <i data-lucide="arrow-right" class="card__link-icon"></i>
                </div>
                <div class="card__body">
                    <p style="color: #666; font-size: 1.4rem; margin-bottom: 1.6rem;">
                        Administra médicos ocupacionales y sus asignaciones
                    </p>
                    ${renderUltimosMedicos(medicos.slice(0, 3))}
                </div>
            </div>

            <div class="card card--link" data-navigate="admin-pagos">
                <div class="card__header">
                    <h3 class="card__title">Pagos Manuales</h3>
                    <i data-lucide="arrow-right" class="card__link-icon"></i>
                </div>
                <div class="card__body">
                    <p style="color: #666; font-size: 1.4rem; margin-bottom: 1.6rem;">
                        Revisa y aprueba pagos pendientes de validación
                    </p>
                    ${renderPagosRecientes(pagos.slice(0, 3))}
                </div>
            </div>

            <div class="card card--link" data-navigate="admin-auditoria">
                <div class="card__header">
                    <h3 class="card__title">Auditoría del Sistema</h3>
                    <i data-lucide="arrow-right" class="card__link-icon"></i>
                </div>
                <div class="card__body">
                    <p style="color: #666; font-size: 1.4rem; margin-bottom: 1.6rem;">
                        Consulta logs y actividad del sistema
                    </p>
                    <div style="padding: 1.6rem; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <i data-lucide="shield-check" style="width: 32px; height: 32px; color: #5dc4af;"></i>
                        <p style="margin-top: 0.8rem; font-size: 1.3rem; color: #666;">
                            Sistema monitoreado 24/7
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Recrear iconos de Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Agregar event listeners para navegación
    homePageContent.querySelectorAll('[data-navigate]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.navigate;
            console.log('[MultiRol] Navegando a:', page);
            // Simular click en la pestaña del sidebar correspondiente
            const navItem = document.querySelector(`[data-page="${page}"]`);
            if (navItem) {
                navItem.click();
            }
        });
    });
}

/**
 * Renderiza lista de últimas empresas
 */
function renderUltimasEmpresas(empresas) {
    if (!empresas || empresas.length === 0) {
        return '<p style="color: #999; font-size: 1.3rem; text-align: center;">No hay empresas registradas</p>';
    }

    return `
        <ul style="list-style: none; padding: 0; margin: 0;">
            ${empresas.map(emp => `
                <li style="padding: 1rem 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 500; color: #2d3238; font-size: 1.4rem;">${emp.nombre_legal || 'Sin nombre'}</div>
                        <div style="font-size: 1.2rem; color: #999;">${emp.ciudad || 'Sin ciudad'}</div>
                    </div>
                    <span class="badge ${emp.status === 'activo' ? 'badge--success' : 'badge--secondary'}" style="font-size: 1.1rem;">
                        ${emp.status || 'inactivo'}
                    </span>
                </li>
            `).join('')}
        </ul>
    `;
}

/**
 * Renderiza lista de últimos médicos
 */
function renderUltimosMedicos(medicos) {
    if (!medicos || medicos.length === 0) {
        return '<p style="color: #999; font-size: 1.3rem; text-align: center;">No hay médicos registrados</p>';
    }

    return `
        <ul style="list-style: none; padding: 0; margin: 0;">
            ${medicos.map(med => `
                <li style="padding: 1rem 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 500; color: #2d3238; font-size: 1.4rem;">${med.full_name || med.email}</div>
                        <div style="font-size: 1.2rem; color: #999;">Licencia: ${med.licencia_sst || 'N/A'}</div>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}

/**
 * Renderiza lista de pagos recientes
 */
function renderPagosRecientes(pagos) {
    if (!pagos || pagos.length === 0) {
        return '<p style="color: #999; font-size: 1.3rem; text-align: center;">No hay pagos pendientes</p>';
    }

    return `
        <ul style="list-style: none; padding: 0; margin: 0;">
            ${pagos.map(pago => `
                <li style="padding: 1rem 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 500; color: #2d3238; font-size: 1.4rem;">${pago.empresa_nombre || 'Empresa'}</div>
                        <div style="font-size: 1.2rem; color: #999;">$${(pago.monto || 0).toLocaleString('es-CO')}</div>
                    </div>
                    <span class="badge badge--warning" style="font-size: 1.1rem;">Pendiente</span>
                </li>
            `).join('')}
        </ul>
    `;
}

// ============================================
// RENDERIZADO DE DASHBOARD MÉDICO
// ============================================

/**
 * Renderiza el dashboard de médico en la página home
 */
async function renderMedicoDashboard() {
    console.log('[MultiRol] Renderizando dashboard médico...');

    const homePageContent = document.querySelector('#page-home');
    if (!homePageContent) {
        console.warn('[MultiRol] No se encontró la página home');
        return;
    }

    const { empresas = [], firma, tieneFirma = false } = MultiRolState.data;
    const { user } = MultiRolState;

    // Calcular estadísticas
    const totalEmpresas = empresas.length;
    const empresasActivas = empresas.filter(e => e.status === 'activo' || e.status === 'activa').length;

    homePageContent.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">Panel Médico Ocupacional</h1>
            <div class="page-header__meta">
                <div class="live-indicator">
                    <span class="live-indicator__dot"></span>
                    <span>Dr(a). ${user.full_name || user.email}</span>
                </div>
                ${user.licencia_sst ? `<span style="margin-left: 1.6rem;">Licencia SST: ${user.licencia_sst}</span>` : ''}
            </div>
        </div>

        <!-- Alerta de firma digital -->
        ${!tieneFirma ? `
            <div class="card card--warning" style="margin-bottom: 2.4rem;">
                <div class="card__body" style="display: flex; align-items: center; gap: 1.6rem;">
                    <i data-lucide="alert-triangle" style="width: 32px; height: 32px; color: #ff9800;"></i>
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 0.4rem 0; font-size: 1.6rem; color: #2d3238;">Firma Digital Pendiente</h3>
                        <p style="margin: 0; color: #666; font-size: 1.4rem;">
                            Para poder firmar profesiogramas y documentos médicos, necesitas configurar tu firma digital.
                        </p>
                    </div>
                    <button class="btn btn--primary" onclick="document.querySelector('[data-page=config]').click()">
                        <i data-lucide="pen-tool"></i>
                        Configurar Firma
                    </button>
                </div>
            </div>
        ` : ''}

        <!-- Estadísticas principales -->
        <div class="dashboard-grid dashboard-grid--cols-4">
            <div class="card card--metric">
                <div class="card__icon">
                    <i data-lucide="building-2"></i>
                </div>
                <div class="card__body">
                    <div class="metric-value">${totalEmpresas}</div>
                    <div class="metric-label">Empresas Asignadas</div>
                    <div class="metric-sublabel">
                        <span style="color: #4caf50;">${empresasActivas}</span> activas
                    </div>
                </div>
            </div>

            <div class="card card--metric ${tieneFirma ? 'card--success' : 'card--warning'}">
                <div class="card__icon">
                    <i data-lucide="${tieneFirma ? 'check-circle' : 'pen-tool'}"></i>
                </div>
                <div class="card__body">
                    <div class="metric-value ${tieneFirma ? 'metric-value--success' : 'metric-value--warning'}">
                        ${tieneFirma ? '✓' : '!'}
                    </div>
                    <div class="metric-label">Firma Digital</div>
                    <div class="metric-sublabel">${tieneFirma ? 'Configurada' : 'Pendiente'}</div>
                </div>
            </div>

            <div class="card card--metric">
                <div class="card__icon">
                    <i data-lucide="file-text"></i>
                </div>
                <div class="card__body">
                    <div class="metric-value">0</div>
                    <div class="metric-label">Profesiogramas</div>
                    <div class="metric-sublabel">Pendientes de firma</div>
                </div>
            </div>

            <div class="card card--metric">
                <div class="card__icon">
                    <i data-lucide="clipboard-list"></i>
                </div>
                <div class="card__body">
                    <div class="metric-value">0</div>
                    <div class="metric-label">Exámenes</div>
                    <div class="metric-sublabel">Próximos a vencer</div>
                </div>
            </div>
        </div>

        <!-- Accesos rápidos -->
        <div class="dashboard-grid dashboard-grid--cols-2" style="margin-top: 2.4rem;">
            <div class="card card--link" data-navigate="profesiograma">
                <div class="card__header">
                    <h3 class="card__title">Profesiogramas</h3>
                    <i data-lucide="arrow-right" class="card__link-icon"></i>
                </div>
                <div class="card__body">
                    <p style="color: #666; font-size: 1.4rem; margin-bottom: 1.6rem;">
                        Revisa y firma profesiogramas de las empresas asignadas
                    </p>
                    <div style="padding: 1.6rem; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <i data-lucide="file-text" style="width: 32px; height: 32px; color: #5dc4af;"></i>
                        <p style="margin-top: 0.8rem; font-size: 1.3rem; color: #666;">
                            ${totalEmpresas} empresa${totalEmpresas !== 1 ? 's' : ''} asignada${totalEmpresas !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>

            <div class="card card--link" data-navigate="examenes">
                <div class="card__header">
                    <h3 class="card__title">Exámenes Médicos</h3>
                    <i data-lucide="arrow-right" class="card__link-icon"></i>
                </div>
                <div class="card__body">
                    <p style="color: #666; font-size: 1.4rem; margin-bottom: 1.6rem;">
                        Gestiona exámenes ocupacionales de trabajadores
                    </p>
                    <div style="padding: 1.6rem; background: #f8f9fa; border-radius: 8px; text-align: center;">
                        <i data-lucide="clipboard-list" style="width: 32px; height: 32px; color: #5dc4af;"></i>
                        <p style="margin-top: 0.8rem; font-size: 1.3rem; color: #666;">
                            Vigila vencimientos y recomendaciones
                        </p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card__header">
                    <h3 class="card__title">Empresas Asignadas</h3>
                </div>
                <div class="card__body">
                    ${renderEmpresasAsignadas(empresas.slice(0, 5))}
                </div>
            </div>

            <div class="card card--link" data-navigate="config">
                <div class="card__header">
                    <h3 class="card__title">Mi Perfil</h3>
                    <i data-lucide="arrow-right" class="card__link-icon"></i>
                </div>
                <div class="card__body">
                    <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                        <div style="display: flex; justify-content: space-between; padding: 1rem; background: #f8f9fa; border-radius: 6px;">
                            <span style="color: #666; font-size: 1.3rem;">Nombre</span>
                            <span style="font-weight: 500; font-size: 1.3rem;">${user.full_name || 'No configurado'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem; background: #f8f9fa; border-radius: 6px;">
                            <span style="color: #666; font-size: 1.3rem;">Email</span>
                            <span style="font-weight: 500; font-size: 1.3rem;">${user.email}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem; background: #f8f9fa; border-radius: 6px;">
                            <span style="color: #666; font-size: 1.3rem;">Licencia SST</span>
                            <span style="font-weight: 500; font-size: 1.3rem;">${user.licencia_sst || 'No configurada'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 1rem; background: #f8f9fa; border-radius: 6px;">
                            <span style="color: #666; font-size: 1.3rem;">Firma Digital</span>
                            <span class="badge ${tieneFirma ? 'badge--success' : 'badge--warning'}" style="font-size: 1.1rem;">
                                ${tieneFirma ? 'Configurada' : 'Pendiente'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Recrear iconos de Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Agregar event listeners para navegación
    homePageContent.querySelectorAll('[data-navigate]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.navigate;
            console.log('[MultiRol] Navegando a:', page);
            const navItem = document.querySelector(`[data-page="${page}"]`);
            if (navItem) {
                navItem.click();
            }
        });
    });
}

/**
 * Renderiza lista de empresas asignadas al médico
 */
function renderEmpresasAsignadas(empresas) {
    if (!empresas || empresas.length === 0) {
        return '<p style="color: #999; font-size: 1.3rem; text-align: center;">No tienes empresas asignadas</p>';
    }

    return `
        <ul style="list-style: none; padding: 0; margin: 0;">
            ${empresas.map(emp => `
                <li style="padding: 1rem 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 500; color: #2d3238; font-size: 1.4rem;">${emp.nombre_legal || 'Sin nombre'}</div>
                        <div style="font-size: 1.2rem; color: #999;">${emp.ciudad || 'Sin ciudad'} · ${emp.nit || 'Sin NIT'}</div>
                    </div>
                    <span class="badge ${(emp.status === 'activo' || emp.status === 'activa') ? 'badge--success' : 'badge--secondary'}" style="font-size: 1.1rem;">
                        ${emp.status || 'inactivo'}
                    </span>
                </li>
            `).join('')}
        </ul>
    `;
}

// ============================================
// PÁGINAS DE ADMIN
// ============================================

async function loadAdminHomePage() {
    console.log('[MultiRol] Cargando Admin Home...');
    const content = document.querySelector('[data-page="admin-home"]');
    if (!content) return;

    const { empresas, medicos, pagos } = MultiRolState.data;

    content.innerHTML = `
        <div class="dashboard-page__header">
            <h1 class="dashboard-page__title">Dashboard Administrador</h1>
            <p class="dashboard-page__subtitle">Vista general del sistema Genesys</p>
        </div>

        <div class="stats-grid stats-grid--4">
            <div class="card card--stat">
                <div class="card__icon-small"><i data-lucide="building-2"></i></div>
                <div class="stat-value stat-value--primary">${empresas.length}</div>
                <div class="stat-label">Empresas Activas</div>
            </div>
            <div class="card card--stat">
                <div class="card__icon-small"><i data-lucide="stethoscope"></i></div>
                <div class="stat-value stat-value--info">${medicos.length}</div>
                <div class="stat-label">Médicos Registrados</div>
            </div>
            <div class="card card--stat card--warning">
                <div class="card__icon-small"><i data-lucide="clock"></i></div>
                <div class="stat-value stat-value--warning">${pagos.length}</div>
                <div class="stat-label">Pagos Pendientes</div>
            </div>
            <div class="card card--stat card--success">
                <div class="card__icon-small"><i data-lucide="check-circle"></i></div>
                <div class="stat-value stat-value--success">98%</div>
                <div class="stat-label">Uptime Sistema</div>
            </div>
        </div>

        <div class="cards-grid cards-grid--2 mt-6">
            <div class="card">
                <div class="card__header">
                    <h3 class="card__title">Pagos Pendientes</h3>
                    <a href="#admin-pagos" class="btn btn--ghost btn--sm">Ver todos</a>
                </div>
                <div class="card__body" id="admin-pagos-preview">
                    ${renderPagosPreview(pagos)}
                </div>
            </div>
            <div class="card">
                <div class="card__header">
                    <h3 class="card__title">Últimas Empresas</h3>
                    <a href="#admin-empresas" class="btn btn--ghost btn--sm">Ver todas</a>
                </div>
                <div class="card__body" id="admin-empresas-preview">
                    ${renderEmpresasPreview(empresas)}
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
}

function renderPagosPreview(pagos) {
    if (!pagos.length) {
        return '<p class="text-muted text-center">No hay pagos pendientes</p>';
    }

    return `
        <ul class="list list--simple">
            ${pagos.slice(0, 5).map(pago => `
                <li class="list__item">
                    <div class="list__content">
                        <span class="list__title">${pago.empresa_nombre || 'Empresa'}</span>
                        <span class="list__subtitle">$${formatNumber(pago.monto)}</span>
                    </div>
                    <span class="badge badge--warning">${pago.estado}</span>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderEmpresasPreview(empresas) {
    if (!empresas.length) {
        return '<p class="text-muted text-center">No hay empresas registradas</p>';
    }

    return `
        <ul class="list list--simple">
            ${empresas.slice(0, 5).map(emp => `
                <li class="list__item">
                    <div class="list__content">
                        <span class="list__title">${emp.nombre_legal}</span>
                        <span class="list__subtitle">${emp.ciudad || 'Sin ciudad'}</span>
                    </div>
                    <span class="badge ${emp.status === 'activa' ? 'badge--success' : 'badge--warning'}">${emp.status}</span>
                </li>
            `).join('')}
        </ul>
    `;
}

async function loadAdminEmpresasPage() {
    console.log('[MultiRol] Cargando Admin Empresas...');
    const content = document.querySelector('#page-admin-empresas');
    if (!content) {
        console.warn('[MultiRol] No se encontró #page-admin-empresas');
        return;
    }

    content.innerHTML = `
        <div class="dashboard-page__header">
            <h1 class="dashboard-page__title">Gestión de Empresas</h1>
            <p class="dashboard-page__subtitle">Administrar empresas clientes de Genesys</p>
        </div>

        <div id="empresas-table-container"></div>
    `;

    // Crear DataTable con las empresas
    new DataTable('empresas-table-container', {
        columns: [
            {
                field: 'nombre_legal',
                label: 'Empresa',
                render: (value, row) => `
                    <div class="table__cell-main">${value}</div>
                    <div class="table__cell-sub">${row.email || ''}</div>
                `
            },
            {
                field: 'nit',
                label: 'NIT'
            },
            {
                field: 'ciudad',
                label: 'Ciudad',
                render: (value) => value || '-'
            },
            {
                field: 'medicos_asignados',
                label: 'Médicos',
                render: (value) => value || 0
            },
            {
                field: 'status',
                label: 'Estado',
                render: (value, row) => {
                    const isActive = value === 'activa';
                    return `
                        <label class="toggle-switch" title="${isActive ? 'Activa' : 'Inactiva'}">
                            <input type="checkbox" ${isActive ? 'checked' : ''}
                                   data-empresa-id="${row.id}"
                                   data-toggle-type="status"
                                   onchange="window._toggleEmpresaStatus(this, ${row.id}, '${value}')">
                            <span class="toggle-switch__slider"></span>
                        </label>`;
                }
            },
            {
                field: 'ultimo_pago',
                label: 'Pagado',
                render: (value, row) => {
                    const isPagado = row.status === 'activa' && value;
                    return isPagado
                        ? `<span class="badge-pagado badge-pagado--si" title="Último pago: ${new Date(value).toLocaleDateString('es-CO')}"><i data-lucide="check-circle"></i> Sí</span>`
                        : `<span class="badge-pagado badge-pagado--no"><i data-lucide="x-circle"></i> No</span>`;
                }
            }
        ],
        data: MultiRolState.data.empresas,
        actions: [
            {
                name: 'ver',
                label: 'Ver detalle',
                icon: 'eye',
                handler: (row) => {
                    openVerEmpresaModal(row);
                }
            },
            {
                name: 'editar',
                label: 'Editar',
                icon: 'edit-2',
                handler: (row) => {
                    console.log('[MultiRol] Editar empresa:', row);
                    try {
                        openEditEmpresaModal(row);
                    } catch (error) {
                        console.error('[MultiRol] ERROR al abrir modal:', error);
                    }
                }
            },
            {
                name: 'pago',
                label: 'Marcar pagado',
                icon: 'credit-card',
                handler: async (row) => {
                    if (row.status === 'activa' && row.ultimo_pago) {
                        showNotification('Esta empresa ya está marcada como pagada', 'info');
                        return;
                    }
                    const confirmar = confirm(`¿Marcar a "${row.nombre_legal}" como pagada?`);
                    if (!confirmar) return;

                    try {
                        const authToken = localStorage.getItem('authToken');
                        const response = await fetch(`${API_BASE}/admin/empresas/${row.id}/marcar-pagado`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ notas: 'Pago manual desde panel admin' })
                        });
                        const data = await response.json();
                        if (data.success) {
                            showNotification(`Empresa "${row.nombre_legal}" marcada como pagada`, 'success');
                            // Actualizar estado local y recargar tabla
                            row.status = 'activa';
                            row.ultimo_pago = new Date().toISOString();
                            await loadAdminEmpresasPage();
                        } else {
                            showNotification(data.message || 'Error al marcar como pagada', 'error');
                        }
                    } catch (error) {
                        console.error('[MultiRol] Error marcando pago:', error);
                        showNotification('Error de conexión', 'error');
                    }
                }
            }
        ],
        pageSize: 10,
        searchable: true,
        sortable: true,
        emptyMessage: 'No hay empresas registradas'
    });

    if (window.lucide) window.lucide.createIcons();
}

// Toggle de estado activa/suspendida para empresas (admin)
window._toggleEmpresaStatus = async function(checkbox, empresaId, currentStatus) {
    const newStatus = checkbox.checked ? 'activa' : 'suspendida';
    const action = checkbox.checked ? 'activar' : 'suspender';
    try {
        const authToken = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE}/admin/empresas/${empresaId}/${action}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.success) {
            showNotification(`Empresa ${newStatus === 'activa' ? 'activada' : 'suspendida'}`, 'success');
            // Update local data
            const empresa = MultiRolState.data.empresas.find(e => e.id === empresaId);
            if (empresa) empresa.status = newStatus;
        } else {
            checkbox.checked = !checkbox.checked; // revert
            showNotification(data.message || 'Error al cambiar estado', 'error');
        }
    } catch (error) {
        checkbox.checked = !checkbox.checked; // revert
        console.error('[MultiRol] Error toggle status:', error);
        showNotification('Error de conexión', 'error');
    }
};

async function loadAdminMedicosPage() {
    console.log('[MultiRol] Cargando Admin Médicos...');
    const content = document.querySelector('#page-admin-medicos');
    if (!content) {
        console.warn('[MultiRol] No se encontró #page-admin-medicos');
        return;
    }

    content.innerHTML = `
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
            <div>
                <h1 class="dashboard-page__title">Gestión de Médicos</h1>
                <p class="dashboard-page__subtitle">Médicos ocupacionales registrados en el sistema</p>
            </div>
            <button class="btn btn--primary" id="btn-nuevo-medico">
                <i data-lucide="plus"></i>
                Nuevo Médico
            </button>
        </div>

        <div id="medicos-table-container"></div>
    `;

    // Crear DataTable con los médicos
    new DataTable('medicos-table-container', {
        columns: [
            {
                field: 'full_name',
                label: 'Médico',
                render: (value, row) => `
                    <div class="table__cell-main">${value}</div>
                    <div class="table__cell-sub">${row.email}</div>
                `
            },
            {
                field: 'licencia_sst',
                label: 'Licencia SST',
                render: (value) => value || 'Sin licencia'
            },
            {
                field: 'empresas_asignadas',
                label: 'Empresas',
                render: (value) => value || 0
            },
            {
                field: 'firma_url',
                label: 'Firma',
                render: (value) => value
                    ? '<span class="badge badge--success">Configurada</span>'
                    : '<span class="badge badge--warning">Pendiente</span>'
            }
        ],
        data: MultiRolState.data.medicos,
        actions: [
            {
                name: 'ver',
                label: 'Ver detalle',
                icon: 'eye',
                handler: (row) => {
                    console.log('[MultiRol] Ver médico:', row);
                    openVerMedicoModal(row);
                }
            },
            {
                name: 'asignar',
                label: 'Asignar empresas',
                icon: 'link',
                handler: (row) => {
                    console.log('[MultiRol] Asignar empresas a médico:', row);
                    openAsignarEmpresasModal(row);
                }
            }
        ],
        pageSize: 10,
        searchable: true,
        sortable: true,
        emptyMessage: 'No hay médicos registrados'
    });

    if (window.lucide) window.lucide.createIcons();

    // Evento para botón de nuevo médico
    document.getElementById('btn-nuevo-medico')?.addEventListener('click', () => {
        console.log('[MultiRol] Nuevo médico');
        // TODO: Implementar modal de creación de médico
    });
}

async function loadAdminPagosPage() {
    console.log('[MultiRol] Cargando Admin Pagos...');
    const content = document.querySelector('#page-admin-pagos');
    if (!content) {
        console.warn('[MultiRol] No se encontró #page-admin-pagos');
        return;
    }

    content.innerHTML = `
        <div class="page-header">
            <h1 class="dashboard-page__title">Gestión de Pagos</h1>
            <p class="dashboard-page__subtitle">Pagos manuales pendientes de aprobación</p>
        </div>

        <div class="tabs mb-6">
            <button class="tab active" data-tab="pendientes">Pendientes</button>
            <button class="tab" data-tab="aprobados">Aprobados</button>
            <button class="tab" data-tab="rechazados">Rechazados</button>
        </div>

        <div class="card">
            <div class="card__body" id="pagos-content">
                ${renderPagosContent(MultiRolState.data.pagos)}
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
}

function renderPagosContent(pagos) {
    if (!pagos.length) {
        return `
            <div class="empty-state">
                <i data-lucide="check-circle" class="empty-state__icon"></i>
                <h3 class="empty-state__title">Sin pagos pendientes</h3>
                <p class="empty-state__description">No hay pagos manuales esperando aprobación</p>
            </div>
        `;
    }

    return `
        <table class="table">
            <thead>
                <tr>
                    <th>Empresa</th>
                    <th>Monto</th>
                    <th>Referencia</th>
                    <th>Fecha</th>
                    <th>Comprobante</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${pagos.map(pago => `
                    <tr>
                        <td>${pago.empresa_nombre || 'N/A'}</td>
                        <td class="font-semibold">$${formatNumber(pago.monto)}</td>
                        <td>${pago.referencia_pago || '-'}</td>
                        <td>${formatDate(pago.created_at)}</td>
                        <td>
                            ${pago.comprobante_url
                                ? `<a href="${pago.comprobante_url}" target="_blank" class="btn btn--ghost btn--sm">
                                    <i data-lucide="file-image"></i> Ver
                                   </a>`
                                : '-'
                            }
                        </td>
                        <td>
                            <div class="table__actions">
                                <button class="btn btn--success btn--sm" data-action="aprobar" data-id="${pago.id}">
                                    <i data-lucide="check"></i> Aprobar
                                </button>
                                <button class="btn btn--danger btn--sm" data-action="rechazar" data-id="${pago.id}">
                                    <i data-lucide="x"></i> Rechazar
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function loadAdminAuditoriaPage() {
    console.log('[MultiRol] Cargando Admin Auditoría...');
    const content = document.querySelector('#page-admin-auditoria');
    if (!content) {
        console.warn('[MultiRol] No se encontró #page-admin-auditoria');
        return;
    }

    content.innerHTML = `
        <div class="page-header">
            <h1 class="dashboard-page__title">Log de Auditoría</h1>
            <p class="dashboard-page__subtitle">Registro de todas las acciones del sistema</p>
        </div>

        <div class="filters-bar">
            <div class="header-search--inline">
                <i data-lucide="search" class="header-search__icon"></i>
                <input type="text" placeholder="Buscar en auditoría..." id="search-auditoria">
            </div>
            <select class="select" id="filter-accion">
                <option value="">Todas las acciones</option>
                <option value="crear_medico">Crear médico</option>
                <option value="aprobar_pago">Aprobar pago</option>
                <option value="subir_firma">Subir firma</option>
            </select>
            <button class="btn btn--outline" id="btn-exportar-auditoria">
                <i data-lucide="download"></i>
                Exportar
            </button>
        </div>

        <div class="card">
            <div class="card__body" id="auditoria-content">
                <p class="text-center text-muted">Cargando registros de auditoría...</p>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Cargar datos de auditoría
    await loadAuditoriaData();
}

async function loadAuditoriaData() {
    try {
        const response = await fetch(`${API_BASE}/admin/auditoria?limit=50`, {
            headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const container = document.getElementById('auditoria-content');
            if (container) {
                container.innerHTML = renderAuditoriaTable(data.registros || []);
                if (window.lucide) window.lucide.createIcons();
            }
        }
    } catch (error) {
        console.error('[MultiRol] Error cargando auditoría:', error);
    }
}

function renderAuditoriaTable(registros) {
    if (!registros.length) {
        return '<p class="text-center text-muted">No hay registros de auditoría</p>';
    }

    return `
        <table class="table table--compact">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Recurso</th>
                    <th>IP</th>
                </tr>
            </thead>
            <tbody>
                ${registros.map(reg => `
                    <tr>
                        <td>${formatDateTime(reg.created_at)}</td>
                        <td>${reg.user_name || 'Sistema'}</td>
                        <td><span class="badge badge--info">${reg.accion}</span></td>
                        <td>${reg.recurso} #${reg.recurso_id || '-'}</td>
                        <td class="text-muted">${reg.ip_address || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function loadAdminConfigPage() {
    console.log('[MultiRol] Cargando Admin Config...');
    const content = document.querySelector('#page-config');
    if (!content) {
        console.warn('[MultiRol] No se encontró #page-config');
        return;
    }

    content.innerHTML = `
        <div class="page-header">
            <h1 class="dashboard-page__title">Configuración</h1>
            <p class="dashboard-page__subtitle">Configuración del sistema Genesys</p>
        </div>

        <div class="cards-grid cards-grid--2">
            <div class="card">
                <div class="card__header">
                    <h3 class="card__title">Mi Perfil</h3>
                </div>
                <div class="card__body">
                    <p>Nombre: ${MultiRolState.user?.full_name}</p>
                    <p>Email: ${MultiRolState.user?.email}</p>
                    <button class="btn btn--outline mt-4">Cambiar contraseña</button>
                </div>
            </div>
            <div class="card">
                <div class="card__header">
                    <h3 class="card__title">Preferencias del Sistema</h3>
                </div>
                <div class="card__body">
                    <p class="text-muted">Próximamente: Configuraciones adicionales del sistema</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// PÁGINAS DE MÉDICO
// ============================================

async function loadMedicoHomePage() {
    console.log('[MultiRol] Cargando Médico Home...');
    const content = document.querySelector('[data-page="medico-home"]');
    if (!content) return;

    const { empresas, tieneFirma } = MultiRolState.data;

    content.innerHTML = `
        <div class="dashboard-page__header">
            <h1 class="dashboard-page__title">Bienvenido, Dr. ${MultiRolState.user?.full_name?.split(' ')[0] || ''}</h1>
            <p class="dashboard-page__subtitle">Panel de médico ocupacional</p>
        </div>

        ${!tieneFirma ? `
            <div class="alert-banner alert-banner--warning mb-6">
                <i data-lucide="alert-triangle"></i>
                <span>No tienes firma digital configurada. <a href="#medico-firma">Configurar ahora</a></span>
            </div>
        ` : ''}

        <div class="stats-grid stats-grid--3">
            <div class="card card--stat">
                <div class="card__icon-small"><i data-lucide="building-2"></i></div>
                <div class="stat-value stat-value--primary">${empresas.length}</div>
                <div class="stat-label">Empresas Asignadas</div>
            </div>
            <div class="card card--stat">
                <div class="card__icon-small"><i data-lucide="users"></i></div>
                <div class="stat-value stat-value--info">${empresas.reduce((sum, e) => sum + (e.total_cargos || 0), 0)}</div>
                <div class="stat-label">Cargos Totales</div>
            </div>
            <div class="card card--stat ${tieneFirma ? 'card--success' : 'card--warning'}">
                <div class="card__icon-small"><i data-lucide="pen-tool"></i></div>
                <div class="stat-value">${tieneFirma ? 'OK' : 'Pendiente'}</div>
                <div class="stat-label">Firma Digital</div>
            </div>
        </div>

        <div class="card mt-6">
            <div class="card__header">
                <h3 class="card__title">Mis Empresas</h3>
                <a href="#medico-empresas" class="btn btn--ghost btn--sm">Ver todas</a>
            </div>
            <div class="card__body">
                ${renderMedicoEmpresasPreview(empresas)}
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
}

function renderMedicoEmpresasPreview(empresas) {
    if (!empresas.length) {
        return `
            <div class="empty-state">
                <i data-lucide="building-2"></i>
                <p>No tienes empresas asignadas aún</p>
            </div>
        `;
    }

    return `
        <div class="cards-grid cards-grid--3">
            ${empresas.slice(0, 6).map(emp => `
                <div class="card card--clickable" data-empresa-id="${emp.empresa_id}">
                    <div class="card__body">
                        <h4 class="card__title">${emp.nombre_legal}</h4>
                        <p class="text-muted">${emp.ciudad || 'Sin ciudad'}</p>
                        <div class="mt-2">
                            <span class="badge badge--info">${emp.total_cargos || 0} cargos</span>
                            ${emp.es_medico_principal ? '<span class="badge badge--success">Principal</span>' : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadMedicoEmpresasPage() {
    console.log('[MultiRol] Cargando Médico Empresas...');
    const content = document.querySelector('[data-page="medico-empresas"]');
    if (!content) return;

    const { empresas } = MultiRolState.data;

    content.innerHTML = `
        <div class="dashboard-page__header">
            <h1 class="dashboard-page__title">Mis Empresas</h1>
            <p class="dashboard-page__subtitle">Empresas asignadas a tu perfil</p>
        </div>

        <div class="cards-grid cards-grid--2">
            ${empresas.map(emp => `
                <div class="card">
                    <div class="card__header">
                        <h3 class="card__title">${emp.nombre_legal}</h3>
                        ${emp.es_medico_principal ? '<span class="badge badge--success">Médico Principal</span>' : ''}
                    </div>
                    <div class="card__body">
                        <p><strong>NIT:</strong> ${emp.nit}</p>
                        <p><strong>Ciudad:</strong> ${emp.ciudad || 'No especificada'}</p>
                        <p><strong>Sector:</strong> ${emp.sector_economico || 'No especificado'}</p>
                        <p><strong>Cargos:</strong> ${emp.total_cargos || 0}</p>
                        <div class="mt-4">
                            <button class="btn btn--primary btn--sm" data-action="ver-cargos" data-id="${emp.empresa_id}">
                                <i data-lucide="users"></i> Ver Cargos
                            </button>
                            <button class="btn btn--outline btn--sm" data-action="ver-profesiograma" data-id="${emp.empresa_id}">
                                <i data-lucide="file-text"></i> Profesiograma
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event listeners para los botones
    content.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const empresaId = btn.dataset.id;

        if (action === 'ver-cargos') {
            console.log('[MultiRol] Ver cargos de empresa:', empresaId);
            // Navegar a la página de profesiograma con la empresa seleccionada
            const selectElement = document.getElementById('select-empresa-profesiograma');
            if (selectElement) {
                selectElement.value = empresaId;
            }
            // Cambiar a la pestaña de profesiograma
            if (window.navigateToPage) {
                window.navigateToPage('profesiograma');
            }
            // Cargar el editor automáticamente
            setTimeout(() => loadProfesiogramaEditor(empresaId), 100);
        } else if (action === 'ver-profesiograma') {
            console.log('[MultiRol] Ver profesiograma de empresa:', empresaId);
            // Navegar a la página de profesiograma
            if (window.navigateToPage) {
                window.navigateToPage('profesiograma');
            }
            // Cargar el editor automáticamente
            setTimeout(() => loadProfesiogramaEditor(empresaId), 100);
        }
    });
}

async function loadMedicoProfesiogramaPage() {
    console.log('[MultiRol] Cargando Médico Profesiograma...');
    const content = document.querySelector('#page-profesiograma');
    if (!content) {
        console.warn('[MultiRol] No se encontró #page-profesiograma');
        return;
    }

    // Obtener la empresa seleccionada del header (si existe)
    const empresaSeleccionada = MultiRolState.empresaSeleccionada;
    const empresas = MultiRolState.data.empresas || [];

    content.innerHTML = `
        <div class="dashboard-page__header">
            <h1 class="dashboard-page__title">Editor de Profesiograma</h1>
            <p class="dashboard-page__subtitle">Editar y generar profesiogramas para tus empresas</p>
        </div>

        ${!empresaSeleccionada ? `
            <div class="card card--info" style="margin-bottom: 2rem;">
                <div class="card__body" style="display: flex; align-items: center; gap: 1.6rem;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5dc4af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                    </svg>
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 0.4rem 0; font-size: 1.6rem; color: #2d3238;">Selecciona una empresa</h3>
                        <p style="margin: 0; color: #666; font-size: 1.4rem;">
                            Usa el selector en el encabezado para elegir la empresa cuyo profesiograma deseas revisar o editar.
                        </p>
                    </div>
                </div>
            </div>
        ` : ''}

        <div class="card" style="${empresaSeleccionada ? 'display:none' : ''}">
            <div class="card__header">
                <h3 class="card__title">Seleccionar Empresa</h3>
            </div>
            <div class="card__body">
                <select class="select w-full" id="select-empresa-profesiograma">
                    <option value="">Seleccione una empresa...</option>
                    ${empresas.map(emp => `
                        <option value="${emp.empresa_id}" ${emp.empresa_id == empresaSeleccionada ? 'selected' : ''}>${emp.nombre_legal}</option>
                    `).join('')}
                </select>
            </div>
        </div>

        <div id="profesiograma-editor" class="mt-6" style="display: none;">
            <!-- El editor de profesiograma se cargará aquí -->
        </div>
    `;

    // Bind event para seleccionar empresa
    const selectEmpresa = document.getElementById('select-empresa-profesiograma');
    if (selectEmpresa) {
        selectEmpresa.addEventListener('change', (e) => {
            const empresaId = e.target.value;
            if (empresaId) {
                // Actualizar también el selector del header
                const headerSelector = document.getElementById('header-empresa-selector');
                if (headerSelector) {
                    headerSelector.value = empresaId;
                    // Disparar evento para sincronizar estado
                    headerSelector.dispatchEvent(new Event('change'));
                }
                loadProfesiogramaEditor(empresaId);
            }
        });
    }

    // Si ya hay una empresa seleccionada, cargar automáticamente el editor
    if (empresaSeleccionada) {
        console.log('[MultiRol] Cargando profesiograma para empresa seleccionada:', empresaSeleccionada);
        loadProfesiogramaEditor(empresaSeleccionada);
    }

    if (window.lucide) window.lucide.createIcons();
}

async function loadProfesiogramaEditor(empresaId) {
    const container = document.getElementById('profesiograma-editor');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
        <div class="card">
            <div class="card__body" style="display:flex;align-items:center;justify-content:center;padding:40px">
                <div class="spinner" style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#5dc4af;border-radius:50%;animation:spin 1s linear infinite"></div>
                <span style="margin-left:12px;color:#6b7280">Cargando datos del profesiograma...</span>
            </div>
        </div>
    `;

    console.log('[MultiRol] Cargando profesiograma para empresa:', empresaId);

    try {
        // Cargar los cargos de la empresa y estados de aprobación en paralelo
        const [cargosResponse, aprobacionesResponse] = await Promise.all([
            fetch(`${API_BASE}/medico/empresas/${empresaId}/cargos`, {
                headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
            }),
            fetch(`${API_BASE}/medico/empresas/${empresaId}/aprobaciones`, {
                headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
            })
        ]);

        if (!cargosResponse.ok) {
            throw new Error('Error al cargar los cargos');
        }

        const { cargos } = await cargosResponse.json();

        // Obtener estados de aprobación (puede fallar si la migración no se ha ejecutado)
        let aprobaciones = { cargos: [], estadisticas: { aprobados: 0, pendientes: 0, total: 0 } };
        if (aprobacionesResponse.ok) {
            aprobaciones = await aprobacionesResponse.json();
        }

        // Crear mapa de aprobaciones para acceso rápido
        const aprobacionMap = {};
        if (aprobaciones.cargos) {
            aprobaciones.cargos.forEach(a => {
                aprobacionMap[a.id] = a;
            });
        }

        // Obtener datos de la empresa
        const empresa = MultiRolState.data.empresas.find(e => e.empresa_id == empresaId);

        // Verificar si el médico tiene firma configurada
        const tieneFirma = MultiRolState.data.tieneFirma;

        container.innerHTML = `
            <div class="card" style="margin-bottom:20px">
                <div class="card__header" style="display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <h3 class="card__title">${empresa?.nombre_legal || 'Empresa'}</h3>
                        <p style="color:#6b7280;font-size:14px;margin-top:4px">
                            ${cargos.length} cargo(s) registrado(s)
                            ${aprobaciones.estadisticas ? `
                                · <span style="color:#10b981">${aprobaciones.estadisticas.aprobados} aprobado(s)</span>
                                · <span style="color:#f59e0b">${aprobaciones.estadisticas.pendientes} pendiente(s)</span>
                            ` : ''}
                        </p>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center">
                        <button class="btn btn--outline btn--sm" data-action="enviar-mensaje-empresa" data-empresa-id="${empresaId}" data-tooltip="Enviar mensaje a la empresa">
                            <i data-lucide="message-square"></i>
                            Mensaje
                        </button>
                        <a href="/pages/profesiograma-view.html?empresa_id=${empresaId}" target="_blank" class="btn btn--outline btn--sm">
                            <i data-lucide="external-link"></i>
                            Ver Completo
                        </a>
                        <button class="btn btn--primary btn--sm" id="btn-exportar-pdf" data-empresa="${empresaId}">
                            <i data-lucide="download"></i>
                            Exportar PDF
                        </button>
                    </div>
                </div>
            </div>

            ${!tieneFirma ? `
                <div class="alert-banner alert-banner--warning" style="margin-bottom:20px">
                    <i data-lucide="alert-triangle"></i>
                    <span>Configure su firma digital para poder aprobar documentación de cargos.</span>
                    <button class="btn btn--sm btn--outline" onclick="document.querySelector('[data-page=config]').click()">
                        Configurar Firma
                    </button>
                </div>
            ` : ''}

            ${cargos.length > 0 ? `
                <div class="cards-grid cards-grid--2">
                    ${cargos.map(cargo => {
                        const aprobacion = aprobacionMap[cargo.id] || { aprobado: false };
                        const isAprobado = aprobacion.aprobado;
                        return `
                        <div class="card cargo-card ${isAprobado ? 'cargo-card--approved' : 'cargo-card--pending'}" data-cargo-id="${cargo.id}">
                            <div class="card__header" style="padding-bottom:8px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:flex-start">
                                <div>
                                    <h4 class="card__title" style="font-size:16px;margin:0">${cargo.nombre_cargo}</h4>
                                    <span class="badge badge--outline" style="font-size:11px">${cargo.area || 'Sin área'}</span>
                                </div>
                                ${isAprobado ? `
                                    <span class="badge badge--approved" style="font-size:10px;display:flex;align-items:center;gap:4px">
                                        <i data-lucide="check-circle" style="width:12px;height:12px"></i>
                                        Aprobado
                                    </span>
                                ` : `
                                    <span class="badge badge--pending-approval" style="font-size:10px">
                                        Pendiente
                                    </span>
                                `}
                            </div>
                            <div class="card__body" style="padding-top:12px">
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;color:#4b5563">
                                    <div><strong>Zona:</strong> ${cargo.zona || 'N/A'}</div>
                                    <div><strong>Trabajadores:</strong> ${cargo.num_trabajadores || 0}</div>
                                    <div><strong>Riesgos:</strong> ${cargo.total_riesgos || 0}</div>
                                    <div>
                                        ${cargo.trabaja_alturas ? '<span class="badge badge--warning" style="font-size:10px" data-tooltip="Requiere exámenes especiales para trabajo en alturas">Alturas</span>' : ''}
                                        ${cargo.manipula_alimentos ? '<span class="badge badge--info" style="font-size:10px" data-tooltip="Requiere certificación de manipulación de alimentos">Alimentos</span>' : ''}
                                        ${cargo.trabaja_espacios_confinados ? '<span class="badge badge--danger" style="font-size:10px" data-tooltip="Requiere capacitación especial para espacios confinados">Esp. Conf.</span>' : ''}
                                    </div>
                                </div>

                                <!-- Toggle de Aprobación -->
                                <div class="approval-section ${isAprobado ? 'approval-section--approved' : ''}" style="margin-top:12px">
                                    <div class="approval-toggle">
                                        <label class="toggle-switch-approval" data-tooltip="${!tieneFirma ? 'Configure su firma para aprobar' : (isAprobado ? 'Revocar aprobación' : 'Aprobar documentación')}">
                                            <input type="checkbox"
                                                   data-action="toggle-aprobacion"
                                                   data-cargo-id="${cargo.id}"
                                                   ${isAprobado ? 'checked' : ''}
                                                   ${!tieneFirma ? 'disabled' : ''}>
                                            <span class="toggle-switch-approval__slider"></span>
                                        </label>
                                        <span class="approval-toggle__label">${isAprobado ? 'Aprobado' : 'Pendiente revisión'}</span>
                                    </div>
                                    ${isAprobado && aprobacion.medico ? `
                                        <div class="approval-info">
                                            <span class="approval-info__doctor">Dr. ${aprobacion.medico.nombre}</span>
                                            <span class="approval-info__date">${new Date(aprobacion.fecha_aprobacion).toLocaleDateString('es-CO')}</span>
                                        </div>
                                    ` : ''}
                                </div>

                                <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f3f4f6;display:flex;gap:8px">
                                    <button class="btn btn--sm btn--outline" data-action="editar-cargo" data-id="${cargo.id}" style="flex:1" data-tooltip="Editar exámenes, EPP y aptitudes del cargo" data-tooltip-placement="bottom">
                                        <i data-lucide="edit-2"></i>
                                        Editar
                                    </button>
                                    <button class="btn--recommendation" data-action="enviar-recomendacion" data-cargo-id="${cargo.id}" data-cargo-nombre="${cargo.nombre_cargo}">
                                        <i data-lucide="message-square"></i>
                                        Recomendación
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;}).join('')}
                </div>
            ` : `
                <div class="card">
                    <div class="card__body" style="text-align:center;padding:40px;color:#6b7280">
                        <i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:16px;opacity:0.5"></i>
                        <p>No hay cargos registrados para esta empresa.</p>
                        <p style="font-size:13px;margin-top:8px">Los cargos se crean durante el proceso del wizard de profesiograma.</p>
                    </div>
                </div>
            `}
        `;

        if (window.lucide) window.lucide.createIcons();

        // Event listeners para los botones - usar event delegation con handler único
        // Evitar duplicar listeners usando un flag en el container
        if (!container._hasClickHandler) {
            container._hasClickHandler = true;
            container.addEventListener('click', async (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;

                const currentEmpresaId = container.dataset.empresaId;

                if (btn.dataset.action === 'editar-cargo') {
                    const cargoId = btn.dataset.id;
                    console.log('[MultiRol] Editar cargo:', cargoId, 'empresa:', currentEmpresaId);
                    openEditarCargoModal(currentEmpresaId, cargoId);
                }

                if (btn.dataset.action === 'enviar-recomendacion') {
                    const cargoId = btn.dataset.cargoId;
                    const cargoNombre = btn.dataset.cargoNombre;
                    openEnviarRecomendacionModal(currentEmpresaId, cargoId, cargoNombre);
                }

                if (btn.dataset.action === 'enviar-mensaje-empresa') {
                    const empId = btn.dataset.empresaId;
                    openNuevaMensajeModal(empId);
                }
            });

            // Handler separado para toggles de aprobación
            container.addEventListener('change', async (e) => {
                if (e.target.dataset.action === 'toggle-aprobacion') {
                    const cargoId = e.target.dataset.cargoId;
                    const isChecked = e.target.checked;
                    const currentEmpresaId = container.dataset.empresaId;

                    if (isChecked) {
                        await handleAprobarCargo(currentEmpresaId, cargoId, e.target);
                    } else {
                        await handleDesaprobarCargo(currentEmpresaId, cargoId, e.target);
                    }
                }
            });
        }
        // Guardar empresaId actual en el container para usarlo en el handler
        container.dataset.empresaId = empresaId;

        // Botón exportar PDF
        const btnExportar = container.querySelector('#btn-exportar-pdf');
        if (btnExportar) {
            // Clonar para remover listeners previos
            const newBtnExportar = btnExportar.cloneNode(true);
            btnExportar.parentNode.replaceChild(newBtnExportar, btnExportar);
            newBtnExportar.addEventListener('click', () => {
                const empresaIdFromBtn = newBtnExportar.dataset.empresa;
                window.open(`/pages/profesiograma-view.html?empresa_id=${empresaIdFromBtn}&print=true`, '_blank');
            });
        }

    } catch (error) {
        console.error('[MultiRol] Error cargando profesiograma:', error);
        container.innerHTML = `
            <div class="card">
                <div class="card__body" style="text-align:center;padding:40px;color:#ef4444">
                    <i data-lucide="alert-circle" style="width:48px;height:48px;margin-bottom:16px"></i>
                    <p>Error al cargar los datos del profesiograma.</p>
                    <p style="font-size:13px;margin-top:8px">${error.message}</p>
                    <button class="btn btn--outline btn--sm" style="margin-top:16px" onclick="loadProfesiogramaEditor(${empresaId})">
                        <i data-lucide="refresh-cw"></i>
                        Reintentar
                    </button>
                </div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Maneja la aprobación de un cargo
 */
async function handleAprobarCargo(empresaId, cargoId, toggleElement) {
    try {
        const response = await fetch(`${API_BASE}/medico/empresas/${empresaId}/cargos/${cargoId}/aprobar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${MultiRolState.token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            // Revertir toggle
            toggleElement.checked = false;

            if (data.codigo === 'FIRMA_REQUERIDA') {
                showNotification('Configure su firma digital antes de aprobar', 'warning');
            } else if (data.codigo === 'LICENCIA_REQUERIDA') {
                showNotification('Registre su licencia SST antes de aprobar', 'warning');
            } else {
                showNotification(data.message || 'Error al aprobar', 'error');
            }
            return;
        }

        showNotification(data.message || 'Cargo aprobado exitosamente', 'success');

        // Actualizar UI de la tarjeta
        const card = toggleElement.closest('.cargo-card');
        if (card) {
            card.classList.remove('cargo-card--pending');
            card.classList.add('cargo-card--approved');

            // Actualizar badge del header
            const headerBadge = card.querySelector('.card__header .badge:not(.badge--outline)');
            if (headerBadge) {
                headerBadge.className = 'badge badge--approved';
                headerBadge.style.cssText = 'font-size:10px;display:flex;align-items:center;gap:4px';
                headerBadge.innerHTML = '<i data-lucide="check-circle" style="width:12px;height:12px"></i> Aprobado';
            }

            // Actualizar sección de aprobación
            const approvalSection = card.querySelector('.approval-section');
            if (approvalSection) {
                approvalSection.classList.add('approval-section--approved');

                // Actualizar label
                const label = approvalSection.querySelector('.approval-toggle__label');
                if (label) label.textContent = 'Aprobado';

                // Agregar info del médico
                let infoDiv = approvalSection.querySelector('.approval-info');
                if (!infoDiv) {
                    infoDiv = document.createElement('div');
                    infoDiv.className = 'approval-info';
                    approvalSection.appendChild(infoDiv);
                }
                infoDiv.innerHTML = `
                    <span class="approval-info__doctor">Dr. ${MultiRolState.user.full_name}</span>
                    <span class="approval-info__date">${new Date().toLocaleDateString('es-CO')}</span>
                `;
            }

            if (window.lucide) window.lucide.createIcons();
        }

    } catch (error) {
        console.error('[MultiRol] Error aprobando cargo:', error);
        toggleElement.checked = false;
        showNotification('Error de conexión al aprobar', 'error');
    }
}

/**
 * Maneja la desaprobación de un cargo
 */
async function handleDesaprobarCargo(empresaId, cargoId, toggleElement) {
    // Mostrar modal para justificación
    const modal = new Modal({
        title: 'Revocar Aprobación',
        size: 'small',
        content: `
            <div class="desaprobacion-form">
                <p style="margin-bottom:16px;color:#4b5563">
                    Para revocar la aprobación de este cargo, debe proporcionar una justificación detallada.
                </p>
                <textarea id="justificacion-desaprobacion" class="desaprobacion-form__textarea"
                    placeholder="Escriba el motivo de la revocación (mínimo 20 caracteres)..."
                    rows="4"></textarea>
                <p class="desaprobacion-form__hint">
                    Esta acción quedará registrada en el historial de auditoría.
                </p>
            </div>
        `,
        buttons: [
            {
                label: 'Cancelar',
                className: 'btn--outline',
                action: 'cancel'
            },
            {
                label: 'Confirmar Revocación',
                className: 'btn--danger',
                icon: 'x-circle',
                action: 'confirm'
            }
        ]
    });

    modal.element.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        if (btn.dataset.action === 'cancel') {
            toggleElement.checked = true; // Revertir
            modal.close();
        }

        if (btn.dataset.action === 'confirm') {
            const justificacion = document.getElementById('justificacion-desaprobacion').value.trim();

            if (justificacion.length < 20) {
                showNotification('La justificación debe tener al menos 20 caracteres', 'warning');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/medico/empresas/${empresaId}/cargos/${cargoId}/desaprobar`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${MultiRolState.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ justificacion })
                });

                const data = await response.json();

                if (!response.ok) {
                    toggleElement.checked = true; // Revertir
                    showNotification(data.message || 'Error al revocar', 'error');
                    modal.close();
                    return;
                }

                showNotification('Aprobación revocada', 'success');
                modal.close();

                // Actualizar UI de la tarjeta
                const card = toggleElement.closest('.cargo-card');
                if (card) {
                    card.classList.remove('cargo-card--approved');
                    card.classList.add('cargo-card--pending');

                    const headerBadge = card.querySelector('.card__header .badge:not(.badge--outline)');
                    if (headerBadge) {
                        headerBadge.className = 'badge badge--pending-approval';
                        headerBadge.style.cssText = 'font-size:10px';
                        headerBadge.innerHTML = 'Pendiente';
                    }

                    const approvalSection = card.querySelector('.approval-section');
                    if (approvalSection) {
                        approvalSection.classList.remove('approval-section--approved');
                        const label = approvalSection.querySelector('.approval-toggle__label');
                        if (label) label.textContent = 'Pendiente revisión';

                        const infoDiv = approvalSection.querySelector('.approval-info');
                        if (infoDiv) infoDiv.remove();
                    }
                }

            } catch (error) {
                console.error('[MultiRol] Error desaprobando cargo:', error);
                toggleElement.checked = true;
                showNotification('Error de conexión', 'error');
                modal.close();
            }
        }
    });

    modal.open();
}

/**
 * Abre modal para enviar recomendación sobre un cargo
 */
function openEnviarRecomendacionModal(empresaId, cargoId, cargoNombre) {
    const empresa = MultiRolState.data.empresas.find(e => e.empresa_id == empresaId);

    const modal = new Modal({
        title: 'Enviar Recomendación',
        size: 'medium',
        content: `
            <div class="nueva-conversacion-form">
                <div class="form-group">
                    <label>Empresa</label>
                    <input type="text" value="${empresa?.nombre_legal || 'Empresa'}" readonly style="background:#f5f5f5">
                </div>
                <div class="form-group">
                    <label>Cargo</label>
                    <input type="text" value="${cargoNombre}" readonly style="background:#f5f5f5">
                </div>
                <div class="form-group">
                    <label>Asunto *</label>
                    <input type="text" id="recomendacion-asunto" placeholder="Ej: Recomendación sobre exámenes médicos" maxlength="255">
                </div>
                <div class="form-group">
                    <label>Mensaje *</label>
                    <textarea id="recomendacion-mensaje" placeholder="Escriba su recomendación o sugerencia..." rows="5"></textarea>
                </div>
            </div>
        `,
        buttons: [
            { label: 'Cancelar', className: 'btn--outline', action: 'cancel' },
            { label: 'Enviar', className: 'btn--primary', icon: 'send', action: 'send' }
        ]
    });

    modal.element.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        if (btn.dataset.action === 'cancel') {
            modal.close();
        }

        if (btn.dataset.action === 'send') {
            const asunto = document.getElementById('recomendacion-asunto').value.trim();
            const mensaje = document.getElementById('recomendacion-mensaje').value.trim();

            if (!asunto || !mensaje) {
                showNotification('Complete todos los campos', 'warning');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/medico/conversaciones`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${MultiRolState.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        empresa_id: parseInt(empresaId),
                        cargo_id: parseInt(cargoId),
                        asunto: asunto,
                        mensaje_inicial: mensaje
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    showNotification(data.message || 'Error al enviar', 'error');
                    return;
                }

                showNotification('Recomendación enviada exitosamente', 'success');
                modal.close();

            } catch (error) {
                console.error('[MultiRol] Error enviando recomendación:', error);
                showNotification('Error de conexión', 'error');
            }
        }
    });

    modal.open();
}

/**
 * Abre modal para enviar nuevo mensaje a empresa
 */
function openNuevaMensajeModal(empresaId) {
    const empresa = MultiRolState.data.empresas.find(e => e.empresa_id == empresaId);

    const modal = new Modal({
        title: 'Nuevo Mensaje',
        size: 'medium',
        content: `
            <div class="nueva-conversacion-form">
                <div class="form-group">
                    <label>Empresa</label>
                    <input type="text" value="${empresa?.nombre_legal || 'Empresa'}" readonly style="background:#f5f5f5">
                </div>
                <div class="form-group">
                    <label>Asunto *</label>
                    <input type="text" id="mensaje-asunto" placeholder="Ej: Consulta sobre exámenes" maxlength="255">
                </div>
                <div class="form-group">
                    <label>Mensaje *</label>
                    <textarea id="mensaje-contenido" placeholder="Escriba su mensaje..." rows="5"></textarea>
                </div>
            </div>
        `,
        buttons: [
            { label: 'Cancelar', className: 'btn--outline', action: 'cancel' },
            { label: 'Enviar', className: 'btn--primary', icon: 'send', action: 'send' }
        ]
    });

    modal.element.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        if (btn.dataset.action === 'cancel') {
            modal.close();
        }

        if (btn.dataset.action === 'send') {
            const asunto = document.getElementById('mensaje-asunto').value.trim();
            const mensaje = document.getElementById('mensaje-contenido').value.trim();

            if (!asunto || !mensaje) {
                showNotification('Complete todos los campos', 'warning');
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/medico/conversaciones`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${MultiRolState.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        empresa_id: parseInt(empresaId),
                        asunto: asunto,
                        mensaje_inicial: mensaje
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    showNotification(data.message || 'Error al enviar', 'error');
                    return;
                }

                showNotification('Mensaje enviado exitosamente', 'success');
                modal.close();

            } catch (error) {
                console.error('[MultiRol] Error enviando mensaje:', error);
                showNotification('Error de conexión', 'error');
            }
        }
    });

    modal.open();
}

async function loadMedicoExamenesPage() {
    console.log('[MultiRol] Cargando Médico Exámenes...');
    const content = document.querySelector('[data-page="medico-examenes"]');
    if (!content) return;

    content.innerHTML = `
        <div class="dashboard-page__header">
            <h1 class="dashboard-page__title">Exámenes Médicos</h1>
            <p class="dashboard-page__subtitle">Gestión de exámenes por empresa</p>
        </div>

        <div class="card">
            <div class="card__body">
                <p class="text-center text-muted">
                    <i data-lucide="activity" style="width: 48px; height: 48px; margin-bottom: 16px;"></i>
                    <br>
                    Selecciona una empresa desde "Mis Empresas" para ver los exámenes programados.
                </p>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();
}

async function loadMedicoFirmaPage() {
    console.log('[MultiRol] Cargando Médico Firma...');
    const content = document.querySelector('[data-page="medico-firma"]');
    if (!content) return;

    content.innerHTML = `
        <div class="dashboard-page__header">
            <h1 class="dashboard-page__title">Mi Firma Digital</h1>
            <p class="dashboard-page__subtitle">Configura tu firma para los documentos que generes</p>
        </div>

        <div id="firma-uploader-container"></div>
    `;

    // Inicializar el componente de firma
    initFirmaDigitalUploader('firma-uploader-container', MultiRolState.token);
}

/**
 * Carga la página de mensajes del médico
 */
async function loadMedicoMensajesPage() {
    console.log('[MultiRol] Cargando Médico Mensajes...');
    const content = document.querySelector('[data-page="medico-mensajes"]');
    if (!content) return;

    content.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">Mensajes</h1>
            <p class="page-header__subtitle">Comunicación con empresas asignadas</p>
        </div>

        <div class="mensajes-container" id="mensajes-medico-container">
            <!-- Panel izquierdo: Lista de conversaciones -->
            <div class="conversaciones-list">
                <div class="conversaciones-list__header">
                    <h3>Conversaciones</h3>
                </div>
                <div class="conversaciones-list__search">
                    <input type="text" placeholder="Buscar conversaciones..." id="buscar-conversacion">
                </div>
                <div class="conversaciones-list__items" id="lista-conversaciones">
                    <div style="display:flex;align-items:center;justify-content:center;padding:40px">
                        <div class="spinner" style="width:24px;height:24px;border:2px solid #e5e7eb;border-top-color:#5dc4af;border-radius:50%;animation:spin 1s linear infinite"></div>
                    </div>
                </div>
            </div>

            <!-- Panel derecho: Conversación activa -->
            <div class="conversacion-panel" id="conversacion-panel">
                <div class="conversacion-panel__empty">
                    <i data-lucide="message-square"></i>
                    <h4>Selecciona una conversación</h4>
                    <p>O inicia una nueva desde el profesiograma de una empresa</p>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Cargar lista de conversaciones
    await loadConversacionesMedico();

    // Configurar búsqueda
    const searchInput = document.getElementById('buscar-conversacion');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterConversaciones(e.target.value);
        });
    }
}

/**
 * Carga las conversaciones del médico desde el API
 */
async function loadConversacionesMedico() {
    const container = document.getElementById('lista-conversaciones');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/medico/conversaciones`, {
            headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
        });

        if (!response.ok) throw new Error('Error cargando conversaciones');

        const data = await response.json();
        const { conversaciones, total_no_leidos } = data;

        // Actualizar badge del sidebar
        updateMensajesBadge(total_no_leidos);

        if (conversaciones.length === 0) {
            container.innerHTML = `
                <div class="conversaciones-list__empty">
                    <i data-lucide="inbox"></i>
                    <p>No hay conversaciones</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        container.innerHTML = conversaciones.map(conv => `
            <div class="conversacion-item ${conv.no_leidos > 0 ? 'conversacion-item--unread' : ''}"
                 data-conversacion-id="${conv.id}"
                 onclick="selectConversacion(${conv.id})">
                <div class="conversacion-item__avatar">
                    ${conv.empresa_nombre.substring(0, 2).toUpperCase()}
                </div>
                <div class="conversacion-item__content">
                    <div class="conversacion-item__header">
                        <span class="conversacion-item__empresa">${conv.empresa_nombre}</span>
                        <span class="conversacion-item__fecha">${formatRelativeDate(conv.ultimo_mensaje_at)}</span>
                    </div>
                    <div class="conversacion-item__asunto">${conv.asunto}</div>
                    <div class="conversacion-item__meta">
                        ${conv.nombre_cargo ? `<span class="conversacion-item__cargo">${conv.nombre_cargo}</span>` : ''}
                        ${conv.no_leidos > 0 ? `<span class="conversacion-item__badge">${conv.no_leidos}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Guardar conversaciones para filtrado
        container._conversaciones = conversaciones;

    } catch (error) {
        console.error('[MultiRol] Error cargando conversaciones:', error);
        container.innerHTML = `
            <div class="conversaciones-list__empty">
                <i data-lucide="alert-circle"></i>
                <p>Error al cargar</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Filtra conversaciones por término de búsqueda
 */
function filterConversaciones(term) {
    const container = document.getElementById('lista-conversaciones');
    if (!container || !container._conversaciones) return;

    const items = container.querySelectorAll('.conversacion-item');
    const termLower = term.toLowerCase();

    items.forEach((item, index) => {
        const conv = container._conversaciones[index];
        const matches = conv.empresa_nombre.toLowerCase().includes(termLower) ||
                       conv.asunto.toLowerCase().includes(termLower) ||
                       (conv.nombre_cargo && conv.nombre_cargo.toLowerCase().includes(termLower));
        item.style.display = matches ? '' : 'none';
    });
}

/**
 * Selecciona una conversación y carga sus mensajes
 */
async function selectConversacion(conversacionId) {
    // Marcar como activa
    document.querySelectorAll('.conversacion-item').forEach(item => {
        item.classList.remove('conversacion-item--active');
    });
    const activeItem = document.querySelector(`[data-conversacion-id="${conversacionId}"]`);
    if (activeItem) {
        activeItem.classList.add('conversacion-item--active');
        activeItem.classList.remove('conversacion-item--unread');
    }

    const panel = document.getElementById('conversacion-panel');
    if (!panel) return;

    panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%">
            <div class="spinner" style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#5dc4af;border-radius:50%;animation:spin 1s linear infinite"></div>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/medico/conversaciones/${conversacionId}/mensajes`, {
            headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
        });

        if (!response.ok) throw new Error('Error cargando mensajes');

        const data = await response.json();
        const { conversacion, mensajes } = data;

        panel.innerHTML = `
            <div class="conversacion-panel__header">
                <button class="conversacion-panel__back" onclick="closeConversacion()">
                    <i data-lucide="arrow-left"></i>
                    Volver
                </button>
                <div class="conversacion-panel__title">
                    <h3>${conversacion.asunto}</h3>
                    <span class="estado-badge estado-badge--${conversacion.estado}">${conversacion.estado}</span>
                </div>
                <div class="conversacion-panel__meta">
                    <span><i data-lucide="building"></i> ${conversacion.empresa.nombre}</span>
                    ${conversacion.cargo ? `<span><i data-lucide="briefcase"></i> ${conversacion.cargo.nombre}</span>` : ''}
                </div>
            </div>

            <div class="mensajes-list" id="mensajes-list">
                ${mensajes.map(msg => `
                    <div class="mensaje mensaje--${msg.remitente.es_propio ? 'propio' : 'otro'}">
                        <div class="mensaje__avatar">
                            ${msg.remitente.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div class="mensaje__content">
                            <div class="mensaje__burbuja">${escapeHtml(msg.contenido)}</div>
                            <div class="mensaje__meta">
                                <span>${formatRelativeDate(msg.fecha)}</span>
                                ${msg.remitente.es_propio && msg.leido ? '<span class="mensaje__leido"><i data-lucide="check-check"></i></span>' : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${conversacion.estado === 'abierta' ? `
                <form class="mensaje-form" id="form-mensaje" data-conversacion="${conversacionId}">
                    <div class="mensaje-form__container">
                        <div class="mensaje-form__input">
                            <textarea id="mensaje-texto" placeholder="Escriba su mensaje..." rows="1"></textarea>
                        </div>
                        <button type="submit" class="mensaje-form__submit">
                            <i data-lucide="send"></i>
                        </button>
                    </div>
                </form>
            ` : `
                <div style="padding:16px;text-align:center;color:#6b7280;background:#f5f5f5">
                    <i data-lucide="lock" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:8px"></i>
                    Conversación cerrada
                </div>
            `}
        `;

        if (window.lucide) window.lucide.createIcons();

        // Scroll al final
        const mensajesList = document.getElementById('mensajes-list');
        if (mensajesList) {
            mensajesList.scrollTop = mensajesList.scrollHeight;
        }

        // Handler para enviar mensaje
        const form = document.getElementById('form-mensaje');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await enviarMensajeConversacion(conversacionId);
            });
        }

        // Auto-resize textarea
        const textarea = document.getElementById('mensaje-texto');
        if (textarea) {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
            });
        }

        // Actualizar badge (los mensajes fueron marcados como leídos)
        loadConversacionesBadge();

    } catch (error) {
        console.error('[MultiRol] Error cargando conversación:', error);
        panel.innerHTML = `
            <div class="conversacion-panel__empty">
                <i data-lucide="alert-circle"></i>
                <h4>Error</h4>
                <p>No se pudo cargar la conversación</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Cierra la conversación actual (móvil)
 */
function closeConversacion() {
    const container = document.getElementById('mensajes-medico-container');
    if (container) {
        container.classList.remove('mensajes-container--viewing');
    }
    document.querySelectorAll('.conversacion-item').forEach(item => {
        item.classList.remove('conversacion-item--active');
    });
}

/**
 * Envía un mensaje en la conversación actual
 */
async function enviarMensajeConversacion(conversacionId) {
    const textarea = document.getElementById('mensaje-texto');
    const contenido = textarea?.value.trim();

    if (!contenido) return;

    const submitBtn = document.querySelector('.mensaje-form__submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/medico/conversaciones/${conversacionId}/mensajes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MultiRolState.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contenido })
        });

        if (!response.ok) throw new Error('Error enviando mensaje');

        // Agregar mensaje a la lista
        const mensajesList = document.getElementById('mensajes-list');
        if (mensajesList) {
            const nuevoMsg = document.createElement('div');
            nuevoMsg.className = 'mensaje mensaje--propio';
            nuevoMsg.innerHTML = `
                <div class="mensaje__avatar">${MultiRolState.user.full_name.substring(0, 2).toUpperCase()}</div>
                <div class="mensaje__content">
                    <div class="mensaje__burbuja">${escapeHtml(contenido)}</div>
                    <div class="mensaje__meta">
                        <span>Ahora</span>
                    </div>
                </div>
            `;
            mensajesList.appendChild(nuevoMsg);
            mensajesList.scrollTop = mensajesList.scrollHeight;
        }

        // Limpiar textarea
        textarea.value = '';
        textarea.style.height = 'auto';

    } catch (error) {
        console.error('[MultiRol] Error enviando mensaje:', error);
        showNotification('Error al enviar mensaje', 'error');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

/**
 * Actualiza el badge de mensajes no leídos en el sidebar
 */
function updateMensajesBadge(count) {
    const badge = document.getElementById('mensajes-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Carga solo el contador de mensajes no leídos
 */
async function loadConversacionesBadge() {
    try {
        const response = await fetch(`${API_BASE}/medico/mensajes/no-leidos`, {
            headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
        });
        if (response.ok) {
            const { no_leidos } = await response.json();
            updateMensajesBadge(no_leidos);
        }
    } catch (error) {
        console.error('[MultiRol] Error cargando badge:', error);
    }
}

/**
 * Formatea una fecha relativa
 */
function formatRelativeDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exponer funciones globalmente para uso en onclick
window.selectConversacion = selectConversacion;
window.closeConversacion = closeConversacion;

// ============================================
// EMPRESA - MENSAJES
// ============================================

/**
 * Carga la página de mensajes de la empresa
 */
async function loadEmpresaMensajesPage() {
    console.log('[MultiRol] Cargando Empresa Mensajes...');
    const content = document.querySelector('[data-page="empresa-mensajes"]');
    if (!content) return;

    content.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">Mensajes del Médico</h1>
            <p class="page-header__subtitle">Comunicación con su médico ocupacional</p>
        </div>

        <div class="mensajes-container" id="mensajes-empresa-container">
            <!-- Panel izquierdo: Lista de conversaciones -->
            <div class="conversaciones-list">
                <div class="conversaciones-list__header">
                    <h3>Conversaciones</h3>
                </div>
                <div class="conversaciones-list__search">
                    <input type="text" placeholder="Buscar conversaciones..." id="buscar-conversacion-empresa">
                </div>
                <div class="conversaciones-list__items" id="lista-conversaciones-empresa">
                    <div style="display:flex;align-items:center;justify-content:center;padding:40px">
                        <div class="spinner" style="width:24px;height:24px;border:2px solid #e5e7eb;border-top-color:#5dc4af;border-radius:50%;animation:spin 1s linear infinite"></div>
                    </div>
                </div>
            </div>

            <!-- Panel derecho: Conversación activa -->
            <div class="conversacion-panel" id="conversacion-panel-empresa">
                <div class="conversacion-panel__empty">
                    <i data-lucide="mail"></i>
                    <h4>Selecciona una conversación</h4>
                    <p>Aquí podrás ver los mensajes de tu médico ocupacional</p>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Cargar lista de conversaciones
    await loadConversacionesEmpresa();

    // Configurar búsqueda
    const searchInput = document.getElementById('buscar-conversacion-empresa');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterConversacionesEmpresa(e.target.value);
        });
    }
}

/**
 * Carga las conversaciones de la empresa desde el API
 */
async function loadConversacionesEmpresa() {
    const container = document.getElementById('lista-conversaciones-empresa');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/empresa/conversaciones`, {
            headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
        });

        if (!response.ok) throw new Error('Error cargando conversaciones');

        const data = await response.json();
        const { conversaciones, total_no_leidos } = data;

        // Actualizar badge del sidebar
        updateEmpresaMensajesBadge(total_no_leidos);

        if (conversaciones.length === 0) {
            container.innerHTML = `
                <div class="conversaciones-list__empty">
                    <i data-lucide="inbox"></i>
                    <p>No hay mensajes</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        container.innerHTML = conversaciones.map(conv => `
            <div class="conversacion-item ${conv.no_leidos > 0 ? 'conversacion-item--unread' : ''}"
                 data-conversacion-id="${conv.id}"
                 onclick="selectConversacionEmpresa(${conv.id})">
                <div class="conversacion-item__avatar">
                    ${conv.medico_nombre.substring(0, 2).toUpperCase()}
                </div>
                <div class="conversacion-item__content">
                    <div class="conversacion-item__header">
                        <span class="conversacion-item__medico">Dr. ${conv.medico_nombre}</span>
                        <span class="conversacion-item__fecha">${formatRelativeDate(conv.ultimo_mensaje_at)}</span>
                    </div>
                    <div class="conversacion-item__asunto">${conv.asunto}</div>
                    <div class="conversacion-item__meta">
                        ${conv.nombre_cargo ? `<span class="conversacion-item__cargo">${conv.nombre_cargo}</span>` : ''}
                        ${conv.no_leidos > 0 ? `<span class="conversacion-item__badge">${conv.no_leidos}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Guardar conversaciones para filtrado
        container._conversaciones = conversaciones;

    } catch (error) {
        console.error('[MultiRol] Error cargando conversaciones empresa:', error);
        container.innerHTML = `
            <div class="conversaciones-list__empty">
                <i data-lucide="alert-circle"></i>
                <p>Error al cargar</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Filtra conversaciones por término de búsqueda
 */
function filterConversacionesEmpresa(term) {
    const container = document.getElementById('lista-conversaciones-empresa');
    if (!container || !container._conversaciones) return;

    const items = container.querySelectorAll('.conversacion-item');
    const termLower = term.toLowerCase();

    items.forEach((item, index) => {
        const conv = container._conversaciones[index];
        const matches = conv.medico_nombre.toLowerCase().includes(termLower) ||
                       conv.asunto.toLowerCase().includes(termLower) ||
                       (conv.nombre_cargo && conv.nombre_cargo.toLowerCase().includes(termLower));
        item.style.display = matches ? '' : 'none';
    });
}

/**
 * Selecciona una conversación y carga sus mensajes (empresa)
 */
async function selectConversacionEmpresa(conversacionId) {
    // Marcar como activa
    document.querySelectorAll('#lista-conversaciones-empresa .conversacion-item').forEach(item => {
        item.classList.remove('conversacion-item--active');
    });
    const activeItem = document.querySelector(`#lista-conversaciones-empresa [data-conversacion-id="${conversacionId}"]`);
    if (activeItem) {
        activeItem.classList.add('conversacion-item--active');
        activeItem.classList.remove('conversacion-item--unread');
    }

    const panel = document.getElementById('conversacion-panel-empresa');
    if (!panel) return;

    panel.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%">
            <div class="spinner" style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#5dc4af;border-radius:50%;animation:spin 1s linear infinite"></div>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/empresa/conversaciones/${conversacionId}/mensajes`, {
            headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
        });

        if (!response.ok) throw new Error('Error cargando mensajes');

        const data = await response.json();
        const { conversacion, mensajes } = data;

        panel.innerHTML = `
            <div class="conversacion-panel__header">
                <button class="conversacion-panel__back" onclick="closeConversacionEmpresa()">
                    <i data-lucide="arrow-left"></i>
                    Volver
                </button>
                <div class="conversacion-panel__title">
                    <h3>${conversacion.asunto}</h3>
                    <span class="estado-badge estado-badge--${conversacion.estado}">${conversacion.estado}</span>
                </div>
                <div class="conversacion-panel__meta">
                    <span><i data-lucide="stethoscope"></i> Dr. ${conversacion.medico.nombre}</span>
                    ${conversacion.cargo ? `<span><i data-lucide="briefcase"></i> ${conversacion.cargo.nombre}</span>` : ''}
                </div>
            </div>

            <div class="mensajes-list" id="mensajes-list-empresa">
                ${mensajes.map(msg => `
                    <div class="mensaje mensaje--${msg.remitente.es_propio ? 'propio' : 'otro'}">
                        <div class="mensaje__avatar">
                            ${msg.remitente.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div class="mensaje__content">
                            <div class="mensaje__burbuja">${escapeHtml(msg.contenido)}</div>
                            <div class="mensaje__meta">
                                <span>${formatRelativeDate(msg.fecha)}</span>
                                ${msg.remitente.es_propio && msg.leido ? '<span class="mensaje__leido"><i data-lucide="check-check"></i></span>' : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${conversacion.estado === 'abierta' ? `
                <form class="mensaje-form" id="form-mensaje-empresa" data-conversacion="${conversacionId}">
                    <div class="mensaje-form__container">
                        <div class="mensaje-form__input">
                            <textarea id="mensaje-texto-empresa" placeholder="Escriba su respuesta..." rows="1"></textarea>
                        </div>
                        <button type="submit" class="mensaje-form__submit">
                            <i data-lucide="send"></i>
                        </button>
                    </div>
                </form>
            ` : `
                <div style="padding:16px;text-align:center;color:#6b7280;background:#f5f5f5">
                    <i data-lucide="lock" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:8px"></i>
                    Conversación cerrada
                </div>
            `}
        `;

        if (window.lucide) window.lucide.createIcons();

        // Scroll al final
        const mensajesList = document.getElementById('mensajes-list-empresa');
        if (mensajesList) {
            mensajesList.scrollTop = mensajesList.scrollHeight;
        }

        // Handler para enviar mensaje
        const form = document.getElementById('form-mensaje-empresa');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await enviarMensajeEmpresa(conversacionId);
            });
        }

        // Auto-resize textarea
        const textarea = document.getElementById('mensaje-texto-empresa');
        if (textarea) {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
            });
        }

        // Actualizar badge
        loadConversacionesBadgeEmpresa();

    } catch (error) {
        console.error('[MultiRol] Error cargando conversación empresa:', error);
        panel.innerHTML = `
            <div class="conversacion-panel__empty">
                <i data-lucide="alert-circle"></i>
                <h4>Error</h4>
                <p>No se pudo cargar la conversación</p>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
}

/**
 * Cierra la conversación actual (móvil - empresa)
 */
function closeConversacionEmpresa() {
    const container = document.getElementById('mensajes-empresa-container');
    if (container) {
        container.classList.remove('mensajes-container--viewing');
    }
    document.querySelectorAll('#lista-conversaciones-empresa .conversacion-item').forEach(item => {
        item.classList.remove('conversacion-item--active');
    });
}

/**
 * Envía un mensaje en la conversación actual (empresa)
 */
async function enviarMensajeEmpresa(conversacionId) {
    const textarea = document.getElementById('mensaje-texto-empresa');
    const contenido = textarea?.value.trim();

    if (!contenido) return;

    const submitBtn = document.querySelector('#form-mensaje-empresa .mensaje-form__submit');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/empresa/conversaciones/${conversacionId}/mensajes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MultiRolState.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contenido })
        });

        if (!response.ok) throw new Error('Error enviando mensaje');

        // Agregar mensaje a la lista
        const mensajesList = document.getElementById('mensajes-list-empresa');
        if (mensajesList) {
            const nuevoMsg = document.createElement('div');
            nuevoMsg.className = 'mensaje mensaje--propio';
            nuevoMsg.innerHTML = `
                <div class="mensaje__avatar">${MultiRolState.user.full_name.substring(0, 2).toUpperCase()}</div>
                <div class="mensaje__content">
                    <div class="mensaje__burbuja">${escapeHtml(contenido)}</div>
                    <div class="mensaje__meta">
                        <span>Ahora</span>
                    </div>
                </div>
            `;
            mensajesList.appendChild(nuevoMsg);
            mensajesList.scrollTop = mensajesList.scrollHeight;
        }

        // Limpiar textarea
        textarea.value = '';
        textarea.style.height = 'auto';

    } catch (error) {
        console.error('[MultiRol] Error enviando mensaje empresa:', error);
        showNotification('Error al enviar mensaje', 'error');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

/**
 * Actualiza el badge de mensajes no leídos en el sidebar (empresa)
 */
function updateEmpresaMensajesBadge(count) {
    const badge = document.getElementById('empresa-mensajes-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Carga solo el contador de mensajes no leídos (empresa)
 */
async function loadConversacionesBadgeEmpresa() {
    try {
        const response = await fetch(`${API_BASE}/empresa/mensajes/no-leidos`, {
            headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
        });
        if (response.ok) {
            const { no_leidos } = await response.json();
            updateEmpresaMensajesBadge(no_leidos);
        }
    } catch (error) {
        console.error('[MultiRol] Error cargando badge empresa:', error);
    }
}

// Exponer funciones de empresa globalmente
window.selectConversacionEmpresa = selectConversacionEmpresa;
window.closeConversacionEmpresa = closeConversacionEmpresa;

async function loadMedicoConfigPage() {
    console.log('[MultiRol] Cargando Médico Config...');
    const content = document.querySelector('#page-config');
    if (!content) {
        console.warn('[MultiRol] No se encontró #page-config');
        return;
    }

    const user = MultiRolState.user;
    const { tieneFirma } = MultiRolState.data;

    content.innerHTML = `
        <div class="page-header">
            <h1 class="page-header__title">Mi Configuración</h1>
            <p class="page-header__subtitle">Actualiza tu información profesional</p>
        </div>

        <!-- Tabs de configuración -->
        <div class="tabs" style="margin-bottom: 2.4rem;">
            <button class="tab active" data-config-tab="perfil">Perfil</button>
            <button class="tab" data-config-tab="firma">Firma Digital</button>
            <button class="tab" data-config-tab="seguridad">Seguridad</button>
        </div>

        <!-- Tab: Perfil -->
        <div id="config-tab-perfil" class="config-tab-content">
            <div class="dashboard-grid dashboard-grid--cols-2">
                <div class="card">
                    <div class="card__header">
                        <h3 class="card__title">Datos Personales</h3>
                    </div>
                    <div class="card__body">
                        <div class="form-group">
                            <label class="form-label">Nombre completo</label>
                            <input type="text" class="input" value="${user?.full_name || ''}" disabled style="background: #f8f9fa;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="input" value="${user?.email || ''}" disabled style="background: #f8f9fa;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Teléfono</label>
                            <input
                                type="tel"
                                class="input"
                                value="${user?.phone || ''}"
                                id="config-phone"
                                placeholder="Ingresa tu teléfono"
                                style="width: 100%; padding: 1rem 1.2rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1.4rem; font-family: 'Raleway', sans-serif;">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h3 class="card__title">Información Profesional</h3>
                    </div>
                    <div class="card__body">
                        <div class="form-group">
                            <label class="form-label">Licencia SST</label>
                            <input
                                type="text"
                                class="input"
                                value="${user?.licencia_sst || ''}"
                                id="config-licencia"
                                placeholder="Ej: 12345-2024"
                                style="width: 100%; padding: 1rem 1.2rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1.4rem; font-family: 'Raleway', sans-serif;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Especialidad</label>
                            <input
                                type="text"
                                class="input"
                                value="${user?.especialidad || ''}"
                                id="config-especialidad"
                                placeholder="Ej: Medicina Ocupacional"
                                style="width: 100%; padding: 1rem 1.2rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1.4rem; font-family: 'Raleway', sans-serif;">
                        </div>
                        <button class="btn btn--primary" id="btn-guardar-config" style="width: 100%; margin-top: 1.6rem;">
                            <i data-lucide="save"></i>
                            Guardar cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab: Firma Digital -->
        <div id="config-tab-firma" class="config-tab-content" style="display: none;">
            <div class="card">
                <div class="card__header">
                    <div style="display: flex; align-items: center; gap: 1.2rem;">
                        <i data-lucide="pen-tool" style="width: 24px; height: 24px; color: #5dc4af;"></i>
                        <div>
                            <h3 class="card__title" style="margin: 0;">Firma Digital</h3>
                            <p style="margin: 0.4rem 0 0 0; font-size: 1.3rem; color: #666;">
                                Sube tu firma para firmar profesiogramas y documentos médicos
                            </p>
                        </div>
                        ${tieneFirma ? '<span class="badge badge--success">Configurada</span>' : '<span class="badge badge--warning">Pendiente</span>'}
                    </div>
                </div>
                <div class="card__body">
                    <div id="firma-digital-uploader-container"></div>
                </div>
            </div>
        </div>

        <!-- Tab: Seguridad -->
        <div id="config-tab-seguridad" class="config-tab-content" style="display: none;">
            <div class="card">
                <div class="card__header">
                    <h3 class="card__title">Cambiar Contraseña</h3>
                </div>
                <div class="card__body">
                    <div class="form-group">
                        <label>Contraseña actual</label>
                        <input type="password" class="input" id="password-actual" placeholder="Ingresa tu contraseña actual">
                    </div>
                    <div class="form-group">
                        <label>Nueva contraseña</label>
                        <input type="password" class="input" id="password-nueva" placeholder="Mínimo 8 caracteres">
                    </div>
                    <div class="form-group">
                        <label>Confirmar nueva contraseña</label>
                        <input type="password" class="input" id="password-confirmar" placeholder="Repite la nueva contraseña">
                    </div>
                    <button class="btn btn--primary" id="btn-cambiar-password" style="margin-top: 1.6rem;">
                        <i data-lucide="lock"></i>
                        Cambiar contraseña
                    </button>
                </div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Configurar tabs
    setupConfigTabs(content);

    // Cargar componente de firma digital
    await loadFirmaDigitalComponent();
}

/**
 * Configura el sistema de tabs en configuración
 */
function setupConfigTabs(container) {
    const tabs = container.querySelectorAll('[data-config-tab]');
    const tabContents = container.querySelectorAll('.config-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.configTab;

            // Actualizar tabs activos
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Mostrar contenido correspondiente
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            const targetContent = document.getElementById(`config-tab-${targetTab}`);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });
}

/**
 * Carga el componente de firma digital dinámicamente
 */
async function loadFirmaDigitalComponent() {
    try {
        // Importar el componente
        const { initFirmaDigitalUploader } = await import('./components/FirmaDigitalUploader.js');

        // Inicializar con el token del estado
        initFirmaDigitalUploader('firma-digital-uploader-container', MultiRolState.token);
    } catch (error) {
        console.error('[MultiRol] Error cargando componente de firma:', error);

        // Mostrar mensaje de error en el contenedor
        const container = document.getElementById('firma-digital-uploader-container');
        if (container) {
            container.innerHTML = `
                <div style="padding: 2.4rem; text-align: center; color: #f44336;">
                    <i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 1.6rem;"></i>
                    <p>Error al cargar el componente de firma digital</p>
                    <p style="font-size: 1.2rem; color: #999; margin-top: 0.8rem;">Por favor, recarga la página</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        }
    }
}

// ============================================
// UTILIDADES
// ============================================

function getStatusBadgeClass(status) {
    const classes = {
        'activa': 'badge--success',
        'suspendida': 'badge--danger',
        'pendiente': 'badge--warning'
    };
    return classes[status] || 'badge--info';
}

function formatNumber(num) {
    return new Intl.NumberFormat('es-CO').format(num || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO');
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    // Usar notificación existente del dashboard o crear una nueva
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast-notification toast-notification--${type} toast-notification--visible`;

    setTimeout(() => {
        toast.classList.remove('toast-notification--visible');
    }, 3000);
}

// ============================================
// MODALS - Sprint 6 Integration
// ============================================

/**
 * Abre modal para ver detalles de empresa (solo lectura)
 */
function openVerEmpresaModal(empresa) {
    const modal = new Modal({
        title: 'Detalles de Empresa',
        size: 'medium',
        content: `
            <div class="form" style="pointer-events:none">
                <div class="form-group">
                    <label class="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Nombre Legal
                    </label>
                    <input type="text" class="form-input" value="${empresa.nombre_legal}" readonly>
                </div>

                <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                            NIT
                        </label>
                        <input type="text" class="form-input" value="${empresa.nit}" readonly>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            Estado
                        </label>
                        <input type="text" class="form-input" value="${empresa.status === 'activa' ? '✓ Activa' : empresa.status === 'suspendida' ? '⏸ Suspendida' : '⏳ Pendiente'}" readonly>
                    </div>
                </div>

                <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Email
                        </label>
                        <input type="text" class="form-input" value="${empresa.email || 'No registrado'}" readonly>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            Ciudad
                        </label>
                        <input type="text" class="form-input" value="${empresa.ciudad || 'No registrada'}" readonly>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Médicos Asignados
                    </label>
                    <input type="text" class="form-input" value="${empresa.medicos_asignados || 0} médicos" readonly>
                </div>
            </div>
        `,
        buttons: [
            {
                label: 'Cerrar',
                className: 'btn--primary',
                action: 'cancel'
            }
        ]
    });

    modal.element.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        if (btn.dataset.action === 'cancel') {
            modal.close();
        }
    });

    modal.open();
}

/**
 * Abre modal para ver detalles del médico (readonly)
 */
function openVerMedicoModal(medico) {
    const modal = new Modal({
        title: 'Detalles del Médico',
        size: 'medium',
        content: `
            <div class="form" style="pointer-events:none">
                <div class="form-group">
                    <label class="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Nombre Completo
                    </label>
                    <input type="text" class="form-input" value="${medico.full_name || 'No especificado'}" readonly>
                </div>

                <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Correo Electrónico
                        </label>
                        <input type="text" class="form-input" value="${medico.email || 'No especificado'}" readonly>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            Teléfono
                        </label>
                        <input type="text" class="form-input" value="${medico.phone || 'No especificado'}" readonly>
                    </div>
                </div>

                <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            Licencia SST
                        </label>
                        <input type="text" class="form-input" value="${medico.licencia_sst || 'Sin licencia'}" readonly>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <polyline points="17 11 19 13 23 9"></polyline>
                            </svg>
                            Especialidad
                        </label>
                        <input type="text" class="form-input" value="${medico.especialidad || 'No especificada'}" readonly>
                    </div>
                </div>

                <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Empresas Asignadas
                        </label>
                        <input type="text" class="form-input" value="${medico.empresas_asignadas || 0}" readonly>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path>
                                <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path>
                                <path d="M15 2v5h5"></path>
                            </svg>
                            Firma Digital
                        </label>
                        <input type="text" class="form-input" value="${medico.firma_url ? '✓ Configurada' : '⚠ Pendiente'}" readonly>
                    </div>
                </div>

                ${medico.fecha_vencimiento_licencia ? `
                <div class="form-group">
                    <label class="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Vencimiento Licencia
                    </label>
                    <input type="text" class="form-input" value="${new Date(medico.fecha_vencimiento_licencia).toLocaleDateString('es-CO')}" readonly>
                </div>
                ` : ''}
            </div>
        `,
        buttons: [
            {
                label: 'Cerrar',
                className: 'btn--primary',
                action: 'cancel'
            }
        ]
    });

    modal.element.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        if (btn.dataset.action === 'cancel') {
            modal.close();
        }
    });

    modal.open();
}

/**
 * Abre modal para editar empresa
 */
function openEditEmpresaModal(empresa) {
    console.log('[MultiRol] 🔵 openEditEmpresaModal llamado con:', empresa);
    console.log('[MultiRol] 🔵 Modal class:', Modal);
    console.log('[MultiRol] 🔵 typeof Modal:', typeof Modal);

    let modal;
    try {
        modal = new Modal({
        title: 'Editar Empresa',
        size: 'medium',
        content: `
            <form id="form-edit-empresa" class="form">
                <div class="form-group">
                    <label for="edit-nombre" class="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Nombre Legal *
                    </label>
                    <input
                        type="text"
                        id="edit-nombre"
                        name="nombre_legal"
                        class="form-input"
                        value="${empresa.nombre_legal}"
                        placeholder="Ej: Acme Corporation S.A.S."
                        required>
                </div>

                <div class="form-group">
                    <label for="edit-nit" class="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        NIT *
                    </label>
                    <input
                        type="text"
                        id="edit-nit"
                        name="nit"
                        class="form-input"
                        value="${empresa.nit}"
                        placeholder="Ej: 900123456-7"
                        required>
                </div>

                <div class="form-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                    <div class="form-group">
                        <label for="edit-email" class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            Email
                        </label>
                        <input
                            type="email"
                            id="edit-email"
                            name="email"
                            class="form-input"
                            value="${empresa.email || ''}"
                            placeholder="empresa@ejemplo.com">
                    </div>

                    <div class="form-group">
                        <label for="edit-ciudad" class="form-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            Ciudad
                        </label>
                        <input
                            type="text"
                            id="edit-ciudad"
                            name="ciudad"
                            class="form-input"
                            value="${empresa.ciudad || ''}"
                            placeholder="Ej: Bogotá">
                    </div>
                </div>

                <div class="form-group">
                    <label for="edit-status" class="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Estado *
                    </label>
                    <select id="edit-status" name="status" class="form-select" required>
                        <option value="activa" ${empresa.status === 'activa' ? 'selected' : ''}>✓ Activa</option>
                        <option value="suspendida" ${empresa.status === 'suspendida' ? 'selected' : ''}>⏸ Suspendida</option>
                        <option value="pendiente" ${empresa.status === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                    </select>
                </div>
            </form>
        `,
        buttons: [
            {
                label: 'Cancelar',
                className: 'btn--outline',
                action: 'cancel'
            },
            {
                label: 'Guardar Cambios',
                className: 'btn--primary',
                icon: 'save',
                action: 'save'
            }
        ]
        });
        console.log('[MultiRol] 🟢 Modal creado exitosamente:', modal);
        console.log('[MultiRol] 🟢 Modal.element:', modal.element);
    } catch (error) {
        console.error('[MultiRol] ❌ Error al crear modal:', error);
        console.error('[MultiRol] ❌ Error stack:', error.stack);
        return;
    }

    modal.element.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === 'cancel') {
            modal.close();
        } else if (action === 'save') {
            const form = document.getElementById('form-edit-empresa');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            console.log('[MultiRol] Guardando cambios empresa:', data);

            try {
                const response = await fetch(`${API_BASE}/admin/empresas/${empresa.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${MultiRolState.token}`
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar empresa');
                }

                showNotification('Empresa actualizada exitosamente', 'success');
                modal.close();

                // Recargar datos
                await loadInitialDataForRole();
                await loadAdminEmpresasPage();
            } catch (error) {
                console.error('[MultiRol] Error:', error);
                showNotification('Error al actualizar empresa', 'error');
            }
        }
    });

    console.log('[MultiRol] 🟡 Abriendo modal...');
    try {
        modal.open();
        console.log('[MultiRol] 🟢 Modal abierto');
    } catch (error) {
        console.error('[MultiRol] ❌ Error al abrir modal:', error);
    }
}

/**
 * Abre modal para asignar empresas a médico
 */
function openAsignarEmpresasModal(medico) {
    // Primero necesitamos cargar todas las empresas disponibles
    const empresasDisponibles = MultiRolState.data.empresas || [];

    const modal = new Modal({
        title: `Asignar Empresas - ${medico.full_name}`,
        size: 'medium',
        content: `
            <div class="form">
                <p class="form-help" style="margin-bottom:16px;color:#6b7280">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                    </svg>
                    Selecciona las empresas que este médico puede gestionar
                </p>

                <div class="form-group">
                    <label class="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                            <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"></path>
                            <path d="M21 21l-4.35-4.35"></path>
                        </svg>
                        Buscar Empresa
                    </label>
                    <input
                        type="text"
                        id="search-empresa"
                        class="form-input"
                        placeholder="Buscar por nombre o NIT..."
                        style="margin-bottom:12px">
                </div>

                <div class="form-group">
                    <label class="form-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Empresas Disponibles (<span id="empresas-count">${empresasDisponibles.length}</span>)
                    </label>
                    <div id="empresas-checkboxes" class="checkbox-list" style="max-height:400px;overflow-y:auto;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb">
                        ${empresasDisponibles.length > 0
                            ? empresasDisponibles.map(emp => `
                                <label class="form-checkbox empresa-item" data-nombre="${emp.nombre_legal.toLowerCase()}" data-nit="${emp.nit}" style="padding:10px;margin-bottom:8px;border-radius:6px;background:#fff;border:1px solid #e5e7eb;cursor:pointer;transition:all 0.2s;display:flex;align-items:start;gap:8px" onmouseover="this.style.borderColor='#5dc4af'" onmouseout="this.style.borderColor='#e5e7eb'">
                                    <input
                                        type="checkbox"
                                        name="empresas[]"
                                        value="${emp.id}">
                                    <span style="display:flex;flex-direction:column;gap:2px">
                                        <strong style="color:#383d47;font-size:14px">${emp.nombre_legal}</strong>
                                        <small style="color:#6b7280;font-size:12px">${emp.nit} - ${emp.ciudad || 'Sin ciudad'}</small>
                                    </span>
                                </label>
                            `).join('')
                            : '<p style="color:#6b7280;text-align:center;padding:20px">No hay empresas disponibles</p>'
                        }
                    </div>
                </div>
            </div>
        `,
        buttons: [
            {
                label: 'Cancelar',
                className: 'btn--outline',
                action: 'cancel'
            },
            {
                label: 'Asignar Empresas',
                className: 'btn--primary',
                icon: 'link',
                action: 'assign'
            }
        ]
    });

    // TODO: Cargar empresas ya asignadas y marcar los checkboxes
    setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE}/admin/medicos/${medico.id}/empresas`, {
                headers: {
                    'Authorization': `Bearer ${MultiRolState.token}`
                }
            });

            if (response.ok) {
                const { empresas } = await response.json();
                console.log('[MultiRol] 🔵 Empresas asignadas recibidas:', empresas);
                empresas.forEach(emp => {
                    const checkbox = modal.element.querySelector(`input[value="${emp.empresa_id}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log('[MultiRol] ✅ Checkbox marcado para empresa:', emp.nombre_legal);
                    }
                });
            }
        } catch (error) {
            console.error('[MultiRol] Error cargando empresas asignadas:', error);
        }
    }, 100);

    // Manejador de botones del modal
    let isProcessing = false; // Flag para evitar clicks múltiples

    const handleModalClick = async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === 'cancel') {
            modal.close();
        } else if (action === 'assign') {
            // Evitar múltiples clicks con flag
            if (isProcessing) {
                console.log('[MultiRol] Ya se está procesando, ignorando click...');
                return;
            }

            isProcessing = true;

            // Deshabilitar botón visualmente
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = 'Asignando...';

            const checkboxes = modal.element.querySelectorAll('input[name="empresas[]"]:checked');
            const empresasIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

            console.log('[MultiRol] 🔵 Asignando empresas:', empresasIds);
            console.log('[MultiRol] 🔵 Médico ID:', medico.id);
            console.log('[MultiRol] 🔵 API_BASE:', API_BASE);
            console.log('[MultiRol] 🔵 Token:', MultiRolState.token ? 'existe' : 'NO EXISTE');

            try {
                const url = `${API_BASE}/admin/medicos/${medico.id}/empresas`;
                console.log('[MultiRol] 🔵 URL completa:', url);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${MultiRolState.token}`
                    },
                    body: JSON.stringify({ empresas: empresasIds })
                });

                console.log('[MultiRol] 🔵 Response status:', response.status);
                console.log('[MultiRol] 🔵 Response ok:', response.ok);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                    console.error('[MultiRol] ❌ Error del servidor:', errorData);
                    throw new Error(errorData.message || 'Error al asignar empresas');
                }

                const data = await response.json();
                console.log('[MultiRol] 🟢 Respuesta exitosa:', data);

                showNotification(data.message || `${empresasIds.length} empresa(s) asignada(s) exitosamente`, 'success');
                modal.close();

                // Recargar datos
                await loadInitialDataForRole();
                await loadAdminMedicosPage();
            } catch (error) {
                console.error('[MultiRol] ❌ Error completo:', error);
                showNotification(error.message || 'Error al asignar empresas', 'error');

                // Re-habilitar botón solo en caso de error
                btn.disabled = false;
                btn.textContent = originalText;
                isProcessing = false; // Reset flag en caso de error
            }
        }
    };

    modal.element.addEventListener('click', handleModalClick);

    // Event listener para búsqueda en tiempo real
    modal.element.addEventListener('input', (e) => {
        if (e.target.id === 'search-empresa') {
            const searchTerm = e.target.value.toLowerCase().trim();
            const empresaItems = modal.element.querySelectorAll('.empresa-item');
            const countElement = modal.element.querySelector('#empresas-count');
            let visibleCount = 0;

            empresaItems.forEach(item => {
                const nombre = item.dataset.nombre || '';
                const nit = item.dataset.nit || '';
                const matches = nombre.includes(searchTerm) || nit.includes(searchTerm);

                if (matches) {
                    item.style.display = 'flex';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (countElement) {
                countElement.textContent = visibleCount;
            }
        }
    });

    modal.open();
}

// ============================================
// MODAL: EDITAR CARGO (MÉDICO)
// ============================================

/**
 * Abre modal para editar un cargo
 * Permite modificar: exámenes, EPP, aptitudes, condiciones incompatibles
 */
async function openEditarCargoModal(empresaId, cargoId) {
    console.log('[MultiRol] Abriendo modal editar cargo:', { empresaId, cargoId });

    // Mostrar loading
    const loadingModal = new Modal({
        title: 'Cargando...',
        size: 'small',
        content: `
            <div style="display:flex;align-items:center;justify-content:center;padding:40px">
                <div class="spinner" style="width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#5dc4af;border-radius:50%;animation:spin 1s linear infinite"></div>
                <span style="margin-left:12px;color:#6b7280">Cargando datos del cargo...</span>
            </div>
        `,
        buttons: []
    });
    loadingModal.open();

    try {
        // Cargar datos del cargo
        const response = await fetch(`${API_BASE}/medico/empresas/${empresaId}/cargos/${cargoId}`, {
            headers: { 'Authorization': `Bearer ${MultiRolState.token}` }
        });

        if (!response.ok) throw new Error('Error al cargar cargo');

        const { cargo } = await response.json();
        loadingModal.close();

        // Crear modal de edición
        const modal = new Modal({
            title: `Editar: ${cargo.nombre_cargo}`,
            size: 'xl',
            content: renderEditarCargoContent(cargo),
            buttons: [
                { label: 'Cancelar', className: 'btn--outline', action: 'cancel' },
                { label: 'Guardar Cambios', className: 'btn--primary', icon: 'save', action: 'save' }
            ]
        });

        // Event handlers del modal
        modal.element.addEventListener('click', async (e) => {
            const target = e.target;

            // Cambiar tab
            if (target.closest('.tab-btn')) {
                const btn = target.closest('.tab-btn');
                const tabId = btn.dataset.tab;

                // Actualizar botones
                modal.element.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '#e5e7eb';
                    b.style.color = '#374151';
                });
                btn.classList.add('active');
                btn.style.background = '#5dc4af';
                btn.style.color = 'white';

                // Mostrar/ocultar contenido
                modal.element.querySelectorAll('.tab-content').forEach(c => {
                    c.style.display = c.dataset.tabContent === tabId ? 'block' : 'none';
                });
            }

            // Agregar item a lista
            if (target.closest('[data-add-item]')) {
                const btn = target.closest('[data-add-item]');
                const listType = btn.dataset.addItem;
                addItemToList(modal.element, listType);
            }

            // Eliminar item de lista
            if (target.closest('[data-remove-item]')) {
                const btn = target.closest('[data-remove-item]');
                btn.closest('.editable-item').remove();
            }

            // Guardar cambios
            if (target.closest('[data-action="save"]')) {
                await saveCargoChanges(modal, empresaId, cargoId);
            }
        });

        modal.open();

    } catch (error) {
        loadingModal.close();
        console.error('[MultiRol] Error cargando cargo:', error);
        showNotification('Error al cargar datos del cargo', 'error');
    }
}

/**
 * Renderiza el contenido del modal de edición de cargo
 * ✅ Usa datos GENERADOS dinámicamente (o overrides si el médico ya modificó)
 */
function renderEditarCargoContent(cargo) {
    console.log('[Editor] Cargo recibido:', cargo);
    console.log('[Editor] Generados:', cargo.generados);
    console.log('[Editor] Overrides:', cargo.overrides);

    // Usar overrides si existen, sino usar datos generados
    const generados = cargo.generados || {};
    const overrides = cargo.overrides || {};

    // Helper: usar override SOLO si es un array CON DATOS (no vacío)
    const hasData = (arr) => Array.isArray(arr) && arr.length > 0;

    // EPP, aptitudes, condiciones: usar override solo si tiene datos
    const eppData = hasData(overrides.epp) ? overrides.epp : (generados.epp || []);
    const aptitudesData = hasData(overrides.aptitudes) ? overrides.aptitudes : (generados.aptitudes || []);
    const condicionesData = hasData(overrides.condiciones_incompatibles) ? overrides.condiciones_incompatibles : (generados.condiciones_incompatibles || []);

    // Exámenes: convertir estructura generada a formato para edición
    const examenesGenerados = generados.examenes || [];

    console.log('[Editor] EPP data:', eppData);
    console.log('[Editor] Examenes generados:', examenesGenerados);

    // Generar exámenes desde datos generados
    const generarExamenesIngreso = () => examenesGenerados.filter(ex => ex.ingreso).map(ex => ({
        nombre: ex.nombre,
        codigo: ex.codigo,
        periodicidad: ex.periodicidad,
        justificacion: ex.justificacion
    }));

    const generarExamenesPeriodicos = () => examenesGenerados.filter(ex => ex.periodico).map(ex => ({
        nombre: ex.nombre,
        codigo: ex.codigo,
        periodicidad: ex.periodicidad,
        justificacion: ex.justificacion
    }));

    const generarExamenesRetiro = () => examenesGenerados.filter(ex => ex.retiro).map(ex => ({
        nombre: ex.nombre,
        codigo: ex.codigo,
        periodicidad: 'N/A',
        justificacion: 'Evaluación de egreso'
    }));

    // Usar override SOLO si tiene datos, sino usar generados
    const examenesIngreso = hasData(overrides.examenes_ingreso) ? overrides.examenes_ingreso : generarExamenesIngreso();
    const examenesPeriodicos = hasData(overrides.examenes_periodicos) ? overrides.examenes_periodicos : generarExamenesPeriodicos();
    const examenesRetiro = hasData(overrides.examenes_retiro) ? overrides.examenes_retiro : generarExamenesRetiro();

    console.log('[Editor] Examenes ingreso:', examenesIngreso);
    console.log('[Editor] Examenes periodicos:', examenesPeriodicos);

    const renderListItems = (items, fieldName, placeholder) => {
        if (!items || items.length === 0) {
            return `<div class="empty-list" style="color:#9ca3af;font-size:13px;padding:8px">No hay items. Usa el botón "+" para agregar.</div>`;
        }
        return items.map((item, idx) => `
            <div class="editable-item" style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
                <input type="text" class="form-input" name="${fieldName}[]" value="${escapeHtml(typeof item === 'string' ? item : item.nombre || '')}" placeholder="${placeholder}" style="flex:1">
                <button type="button" class="btn btn--ghost btn--sm" data-remove-item style="color:#ef4444;padding:4px">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
        `).join('');
    };

    // Lista de exámenes disponibles (sincronizada con EXAM_DETAILS del backend)
    const EXAMENES_DISPONIBLES = [
        { codigo: 'EMO', nombre: 'EXAMEN MEDICO CON ENFASIS OSTEOMUSCULAR' },
        { codigo: 'EMOA', nombre: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN ALTURAS' },
        { codigo: 'EMOD', nombre: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS DERMATOLOGICO' },
        { codigo: 'EMOMP', nombre: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN MANIPULACION DE ALIMENTOS' },
        { codigo: 'AUD', nombre: 'AUDIOMETRIA' },
        { codigo: 'ESP', nombre: 'ESPIROMETRÍA' },
        { codigo: 'OPTO', nombre: 'OPTOMETRÍA' },
        { codigo: 'VIS', nombre: 'VISIOMETRÍA' },
        { codigo: 'ECG', nombre: 'ELECTROCARDIOGRAMA' },
        { codigo: 'RXC', nombre: 'RAYOS X DE COLUMNA' },
        { codigo: 'PSM', nombre: 'PRUEBA PSICOSENSOMETRICA' },
        { codigo: 'PST', nombre: 'PRUEBA PSICOTECNICA' },
        { codigo: 'FRO', nombre: 'FROTIS FARINGEO' },
        { codigo: 'GLI', nombre: 'GLICEMIA' },
        { codigo: 'CH', nombre: 'CUADRO HEMATICO' },
        { codigo: 'RH', nombre: 'HEMOCLASIFICIÓN GRUPO ABO Y FACTOR RH' },
        { codigo: 'KOH', nombre: 'PRUEBA DE KOH' },
        { codigo: 'BUN', nombre: 'NITROGENO UREICO [BUN]' },
        { codigo: 'PL', nombre: 'PERFIL LIPÍDICO' },
        { codigo: 'PAS', nombre: 'PRUEBA DE ALCOHOL EN SALIVA' },
        { codigo: 'PE', nombre: 'PRUEBA DE EMBARAZO' },
        { codigo: 'PSP', nombre: 'PRUEBA DE SUSTANCIAS PSICOACTIVAS' },
        { codigo: 'TGO', nombre: 'TRANSAMINASAS TGO' },
        { codigo: 'TGP', nombre: 'TRANSAMINASAS TGP' },
        { codigo: 'TRI', nombre: 'TRIGLICÉRIDOS' },
        { codigo: 'COL', nombre: 'COLESTEROL' },
        { codigo: 'COP', nombre: 'COPROLOGICO' },
        { codigo: 'LEP', nombre: 'LEPTOSPIRA' },
        { codigo: 'BRU', nombre: 'BRUCELA' },
        { codigo: 'TOX', nombre: 'TOXOPLASMA' },
        { codigo: 'COLI', nombre: 'COLINESTERASA' },
        { codigo: 'CRE', nombre: 'CREATININA' },
        { codigo: 'ORI', nombre: 'PARCIAL DE ORINA' },
        { codigo: 'TET', nombre: 'VACUNA DEL TETANO' },
        { codigo: 'VH', nombre: 'VACUNA DEL VIRUS HEPATITIS' },
        { codigo: 'VFA', nombre: 'VACUNA DE FIEBRE AMARILLA' },
        { codigo: 'T4L', nombre: 'T4 LIBRE' }
    ];

    // Opciones de periodicidad estándar
    const PERIODICIDADES = [
        { valor: 'Semestral', meses: 6 },
        { valor: 'Anual', meses: 12 },
        { valor: 'Cada 2 años', meses: 24 },
        { valor: 'Cada 3 años', meses: 36 },
        { valor: 'Cada 5 años', meses: 60 },
        { valor: 'Solo ingreso/egreso', meses: 999 },
        { valor: 'N/A', meses: 0 }
    ];

    // Generar opciones de select para exámenes
    const renderExamenOptions = (selectedNombre) => {
        return EXAMENES_DISPONIBLES.map(ex => {
            const isSelected = ex.nombre === selectedNombre ? 'selected' : '';
            return `<option value="${escapeHtml(ex.nombre)}" ${isSelected}>${ex.codigo} - ${escapeHtml(ex.nombre)}</option>`;
        }).join('');
    };

    // Generar opciones de select para periodicidad
    const renderPeriodicidadOptions = (selectedPeriodicidad) => {
        return PERIODICIDADES.map(p => {
            const isSelected = p.valor === selectedPeriodicidad ? 'selected' : '';
            return `<option value="${escapeHtml(p.valor)}" ${isSelected}>${escapeHtml(p.valor)}</option>`;
        }).join('');
    };

    const renderExamenesTable = (examenes, tipo) => {
        if (!examenes || examenes.length === 0) {
            return `<p style="color:#9ca3af;font-size:13px;padding:8px">No hay exámenes de ${tipo}.</p>`;
        }
        return `
            <table class="data-table" style="font-size:13px;width:100%">
                <thead>
                    <tr>
                        <th style="text-align:left">Examen</th>
                        <th style="text-align:left;width:140px">Periodicidad</th>
                        <th style="text-align:left">Justificación</th>
                        <th style="width:40px"></th>
                    </tr>
                </thead>
                <tbody>
                    ${examenes.map((ex, idx) => `
                        <tr class="editable-item">
                            <td>
                                <select class="form-input form-input--sm" name="examenes_${tipo}_nombre[]" style="width:100%;font-size:11px">
                                    <option value="">-- Seleccionar examen --</option>
                                    ${renderExamenOptions(ex.nombre || '')}
                                </select>
                            </td>
                            <td>
                                <select class="form-input form-input--sm" name="examenes_${tipo}_periodicidad[]" style="width:100%">
                                    ${renderPeriodicidadOptions(ex.periodicidad || '')}
                                </select>
                            </td>
                            <td><input type="text" class="form-input form-input--sm" name="examenes_${tipo}_justificacion[]" value="${escapeHtml(ex.justificacion || '')}" style="width:100%"></td>
                            <td><button type="button" class="btn btn--ghost btn--sm" data-remove-item style="color:#ef4444;padding:2px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    };

    // Info de NR máximo y periodicidad
    const nrMaximo = generados.nr_maximo || 0;
    const periodicidadMinima = generados.periodicidad_minima || 36;

    return `
        <div class="cargo-editor" style="max-height:70vh;overflow-y:auto">
            <!-- Info del cargo (solo lectura) -->
            <div class="cargo-info" style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px">
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:13px">
                    <div><strong>Área:</strong> ${cargo.area || 'N/A'}</div>
                    <div><strong>Zona:</strong> ${cargo.zona || 'N/A'}</div>
                    <div><strong>Trabajadores:</strong> ${cargo.num_trabajadores || 0}</div>
                </div>
                <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
                    ${cargo.trabaja_alturas ? '<span class="badge badge--warning">Trabajo en Alturas</span>' : ''}
                    ${cargo.manipula_alimentos ? '<span class="badge badge--info">Manipula Alimentos</span>' : ''}
                    ${cargo.trabaja_espacios_confinados ? '<span class="badge badge--danger">Espacios Confinados</span>' : ''}
                    <span class="badge badge--outline" style="font-size:11px">NR máx: ${nrMaximo}</span>
                    <span class="badge badge--outline" style="font-size:11px">Periodicidad: ${periodicidadMinima} meses</span>
                </div>
                ${cargo.riesgos && cargo.riesgos.length > 0 ? `
                    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb">
                        <strong style="font-size:12px;color:#6b7280">Riesgos identificados (${cargo.riesgos.length}):</strong>
                        <div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px">
                            ${cargo.riesgos.slice(0, 5).map(r => `
                                <span class="badge badge--outline" style="font-size:10px">${r.ges}</span>
                            `).join('')}
                            ${cargo.riesgos.length > 5 ? `<span style="font-size:11px;color:#9ca3af">+${cargo.riesgos.length - 5} más</span>` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Tabs -->
            <div class="tabs" style="margin-bottom:16px">
                <button class="tab-btn active" data-tab="examenes" style="padding:8px 16px;border:none;background:#5dc4af;color:white;border-radius:6px 6px 0 0;cursor:pointer">Exámenes Médicos</button>
                <button class="tab-btn" data-tab="epp" style="padding:8px 16px;border:none;background:#e5e7eb;border-radius:6px 6px 0 0;cursor:pointer">EPP (${eppData.length})</button>
                <button class="tab-btn" data-tab="aptitudes" style="padding:8px 16px;border:none;background:#e5e7eb;border-radius:6px 6px 0 0;cursor:pointer">Aptitudes (${aptitudesData.length})</button>
                <button class="tab-btn" data-tab="condiciones" style="padding:8px 16px;border:none;background:#e5e7eb;border-radius:6px 6px 0 0;cursor:pointer">Condiciones (${condicionesData.length})</button>
            </div>

            <!-- Tab: Exámenes -->
            <div class="tab-content" data-tab-content="examenes">
                <div style="margin-bottom:20px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                        <h4 style="margin:0;font-size:14px;color:#374151">Exámenes de Ingreso (${examenesIngreso.length})</h4>
                        <button type="button" class="btn btn--outline btn--sm" data-add-item="examenes_ingreso">+ Agregar</button>
                    </div>
                    <div id="list-examenes_ingreso">${renderExamenesTable(examenesIngreso, 'ingreso')}</div>
                </div>
                <div style="margin-bottom:20px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                        <h4 style="margin:0;font-size:14px;color:#374151">Exámenes Periódicos (${examenesPeriodicos.length})</h4>
                        <button type="button" class="btn btn--outline btn--sm" data-add-item="examenes_periodicos">+ Agregar</button>
                    </div>
                    <div id="list-examenes_periodicos">${renderExamenesTable(examenesPeriodicos, 'periodicos')}</div>
                </div>
                <div style="margin-bottom:20px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                        <h4 style="margin:0;font-size:14px;color:#374151">Exámenes de Retiro (${examenesRetiro.length})</h4>
                        <button type="button" class="btn btn--outline btn--sm" data-add-item="examenes_retiro">+ Agregar</button>
                    </div>
                    <div id="list-examenes_retiro">${renderExamenesTable(examenesRetiro, 'retiro')}</div>
                </div>
            </div>

            <!-- Tab: EPP -->
            <div class="tab-content" data-tab-content="epp" style="display:none">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                    <h4 style="margin:0;font-size:14px;color:#374151">Elementos de Protección Personal</h4>
                    <button type="button" class="btn btn--outline btn--sm" data-add-item="epp">+ Agregar EPP</button>
                </div>
                <div id="list-epp">${renderListItems(eppData, 'epp', 'Ej: Casco de seguridad')}</div>
            </div>

            <!-- Tab: Aptitudes -->
            <div class="tab-content" data-tab-content="aptitudes" style="display:none">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                    <h4 style="margin:0;font-size:14px;color:#374151">Aptitudes Requeridas</h4>
                    <button type="button" class="btn btn--outline btn--sm" data-add-item="aptitudes">+ Agregar Aptitud</button>
                </div>
                <div id="list-aptitudes">${renderListItems(aptitudesData, 'aptitudes', 'Ej: Buena agudeza visual')}</div>
            </div>

            <!-- Tab: Condiciones Incompatibles -->
            <div class="tab-content" data-tab-content="condiciones" style="display:none">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                    <h4 style="margin:0;font-size:14px;color:#374151">Condiciones de Salud Incompatibles</h4>
                    <button type="button" class="btn btn--outline btn--sm" data-add-item="condiciones_incompatibles">+ Agregar Condición</button>
                </div>
                <div id="list-condiciones_incompatibles">${renderListItems(condicionesData, 'condiciones_incompatibles', 'Ej: Vértigo severo')}</div>
            </div>

            <!-- Justificación obligatoria -->
            <div style="margin-top:24px;padding-top:20px;border-top:2px solid #e5e7eb">
                <label class="form-label" style="color:#dc2626;font-weight:600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle;margin-right:4px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Justificación de la modificación (obligatorio)
                </label>
                <textarea id="justificacion_modificacion" class="form-input" rows="3" placeholder="Describa el motivo de los cambios realizados (mínimo 10 caracteres)..." style="width:100%;margin-top:8px">${cargo.justificacion_modificacion || ''}</textarea>
                <p style="font-size:12px;color:#6b7280;margin-top:4px">Esta justificación quedará registrada en el profesiograma y en la auditoría del sistema.</p>
            </div>
        </div>

        <style>
            .tab-btn.active { background: #5dc4af !important; color: white !important; }
            .form-input--sm { padding: 6px 8px; font-size: 12px; }
            .data-table { border-collapse: collapse; }
            .data-table th, .data-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
            .data-table th { background: #f9fafb; font-weight: 500; }
        </style>
    `;
}

// Lista de exámenes disponibles para usar en addItemToList (mismo que en renderEditarCargoContent)
const EXAMENES_DISPONIBLES_GLOBAL = [
    { codigo: 'EMO', nombre: 'EXAMEN MEDICO CON ENFASIS OSTEOMUSCULAR' },
    { codigo: 'EMOA', nombre: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN ALTURAS' },
    { codigo: 'EMOD', nombre: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS DERMATOLOGICO' },
    { codigo: 'EMOMP', nombre: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN MANIPULACION DE ALIMENTOS' },
    { codigo: 'AUD', nombre: 'AUDIOMETRIA' },
    { codigo: 'ESP', nombre: 'ESPIROMETRÍA' },
    { codigo: 'OPTO', nombre: 'OPTOMETRÍA' },
    { codigo: 'VIS', nombre: 'VISIOMETRÍA' },
    { codigo: 'ECG', nombre: 'ELECTROCARDIOGRAMA' },
    { codigo: 'RXC', nombre: 'RAYOS X DE COLUMNA' },
    { codigo: 'PSM', nombre: 'PRUEBA PSICOSENSOMETRICA' },
    { codigo: 'PST', nombre: 'PRUEBA PSICOTECNICA' },
    { codigo: 'FRO', nombre: 'FROTIS FARINGEO' },
    { codigo: 'GLI', nombre: 'GLICEMIA' },
    { codigo: 'CH', nombre: 'CUADRO HEMATICO' },
    { codigo: 'RH', nombre: 'HEMOCLASIFICIÓN GRUPO ABO Y FACTOR RH' },
    { codigo: 'KOH', nombre: 'PRUEBA DE KOH' },
    { codigo: 'BUN', nombre: 'NITROGENO UREICO [BUN]' },
    { codigo: 'PL', nombre: 'PERFIL LIPÍDICO' },
    { codigo: 'PAS', nombre: 'PRUEBA DE ALCOHOL EN SALIVA' },
    { codigo: 'PE', nombre: 'PRUEBA DE EMBARAZO' },
    { codigo: 'PSP', nombre: 'PRUEBA DE SUSTANCIAS PSICOACTIVAS' },
    { codigo: 'TGO', nombre: 'TRANSAMINASAS TGO' },
    { codigo: 'TGP', nombre: 'TRANSAMINASAS TGP' },
    { codigo: 'TRI', nombre: 'TRIGLICÉRIDOS' },
    { codigo: 'COL', nombre: 'COLESTEROL' },
    { codigo: 'COP', nombre: 'COPROLOGICO' },
    { codigo: 'LEP', nombre: 'LEPTOSPIRA' },
    { codigo: 'BRU', nombre: 'BRUCELA' },
    { codigo: 'TOX', nombre: 'TOXOPLASMA' },
    { codigo: 'COLI', nombre: 'COLINESTERASA' },
    { codigo: 'CRE', nombre: 'CREATININA' },
    { codigo: 'ORI', nombre: 'PARCIAL DE ORINA' },
    { codigo: 'TET', nombre: 'VACUNA DEL TETANO' },
    { codigo: 'VH', nombre: 'VACUNA DEL VIRUS HEPATITIS' },
    { codigo: 'VFA', nombre: 'VACUNA DE FIEBRE AMARILLA' },
    { codigo: 'T4L', nombre: 'T4 LIBRE' }
];

const PERIODICIDADES_GLOBAL = [
    { valor: 'Semestral', meses: 6 },
    { valor: 'Anual', meses: 12 },
    { valor: 'Cada 2 años', meses: 24 },
    { valor: 'Cada 3 años', meses: 36 },
    { valor: 'Cada 5 años', meses: 60 },
    { valor: 'Solo ingreso/egreso', meses: 999 },
    { valor: 'N/A', meses: 0 }
];

/**
 * Agrega un nuevo item a una lista editable
 */
function addItemToList(modalElement, listType) {
    const container = modalElement.querySelector(`#list-${listType}`);
    if (!container) return;

    // Remover mensaje de lista vacía si existe
    const emptyMsg = container.querySelector('.empty-list');
    if (emptyMsg) emptyMsg.remove();
    // También remover mensaje de "no hay exámenes"
    const noExamenesMsg = container.querySelector('p');
    if (noExamenesMsg) noExamenesMsg.remove();

    if (listType.startsWith('examenes_')) {
        const tipo = listType.replace('examenes_', '');

        // Generar opciones de select
        const examenOptions = EXAMENES_DISPONIBLES_GLOBAL.map(ex =>
            `<option value="${ex.nombre}">${ex.codigo} - ${ex.nombre}</option>`
        ).join('');

        const periodicidadOptions = PERIODICIDADES_GLOBAL.map(p =>
            `<option value="${p.valor}">${p.valor}</option>`
        ).join('');

        let tbody = container.querySelector('tbody');
        if (tbody) {
            const newRow = document.createElement('tr');
            newRow.className = 'editable-item';
            newRow.innerHTML = `
                <td>
                    <select class="form-input form-input--sm" name="examenes_${tipo}_nombre[]" style="width:100%;font-size:11px">
                        <option value="">-- Seleccionar examen --</option>
                        ${examenOptions}
                    </select>
                </td>
                <td>
                    <select class="form-input form-input--sm" name="examenes_${tipo}_periodicidad[]" style="width:100%">
                        ${periodicidadOptions}
                    </select>
                </td>
                <td><input type="text" class="form-input form-input--sm" name="examenes_${tipo}_justificacion[]" placeholder="Justificación técnica" style="width:100%"></td>
                <td><button type="button" class="btn btn--ghost btn--sm" data-remove-item style="color:#ef4444;padding:2px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></td>
            `;
            tbody.appendChild(newRow);
        } else {
            // Crear tabla si no existe
            container.innerHTML = `
                <table class="data-table" style="font-size:13px;width:100%">
                    <thead><tr><th>Examen</th><th style="width:140px">Periodicidad</th><th>Justificación</th><th style="width:40px"></th></tr></thead>
                    <tbody>
                        <tr class="editable-item">
                            <td>
                                <select class="form-input form-input--sm" name="examenes_${tipo}_nombre[]" style="width:100%;font-size:11px">
                                    <option value="">-- Seleccionar examen --</option>
                                    ${examenOptions}
                                </select>
                            </td>
                            <td>
                                <select class="form-input form-input--sm" name="examenes_${tipo}_periodicidad[]" style="width:100%">
                                    ${periodicidadOptions}
                                </select>
                            </td>
                            <td><input type="text" class="form-input form-input--sm" name="examenes_${tipo}_justificacion[]" placeholder="Justificación" style="width:100%"></td>
                            <td><button type="button" class="btn btn--ghost btn--sm" data-remove-item style="color:#ef4444;padding:2px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
    } else {
        const placeholder = {
            'epp': 'Ej: Guantes de nitrilo',
            'aptitudes': 'Ej: Capacidad para trabajo en equipo',
            'condiciones_incompatibles': 'Ej: Epilepsia no controlada'
        }[listType] || 'Nuevo item';

        const newItem = document.createElement('div');
        newItem.className = 'editable-item';
        newItem.style = 'display:flex;gap:8px;margin-bottom:8px;align-items:center';
        newItem.innerHTML = `
            <input type="text" class="form-input" name="${listType}[]" placeholder="${placeholder}" style="flex:1">
            <button type="button" class="btn btn--ghost btn--sm" data-remove-item style="color:#ef4444;padding:4px">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        `;
        container.appendChild(newItem);
    }
}

/**
 * Guarda los cambios del cargo
 */
async function saveCargoChanges(modal, empresaId, cargoId) {
    const form = modal.element;
    const justificacion = form.querySelector('#justificacion_modificacion')?.value?.trim();

    if (!justificacion || justificacion.length < 10) {
        showNotification('La justificación es obligatoria (mínimo 10 caracteres)', 'error');
        form.querySelector('#justificacion_modificacion')?.focus();
        return;
    }

    // Recopilar exámenes (ahora usan select para nombre y periodicidad)
    const getExamenes = (tipo) => {
        // Los nombres y periodicidades ahora son selects, justificación sigue siendo input
        const nombres = form.querySelectorAll(`select[name="examenes_${tipo}_nombre[]"]`);
        const periodicidades = form.querySelectorAll(`select[name="examenes_${tipo}_periodicidad[]"]`);
        const justificaciones = form.querySelectorAll(`input[name="examenes_${tipo}_justificacion[]"]`);
        const examenes = [];
        nombres.forEach((select, idx) => {
            if (select.value.trim()) {
                examenes.push({
                    nombre: select.value.trim(),
                    periodicidad: periodicidades[idx]?.value?.trim() || '',
                    justificacion: justificaciones[idx]?.value?.trim() || ''
                });
            }
        });
        return examenes;
    };

    // Recopilar listas simples
    const getListItems = (name) => {
        const inputs = form.querySelectorAll(`input[name="${name}[]"]`);
        return Array.from(inputs).map(i => i.value.trim()).filter(v => v);
    };

    const datos = {
        examenes_ingreso: getExamenes('ingreso'),
        examenes_periodicos: getExamenes('periodicos'),
        examenes_retiro: getExamenes('retiro'),
        epp: getListItems('epp'),
        aptitudes: getListItems('aptitudes'),
        condiciones_incompatibles: getListItems('condiciones_incompatibles'),
        justificacion_modificacion: justificacion
    };

    console.log('[MultiRol] Guardando cargo:', datos);

    try {
        const response = await fetch(`${API_BASE}/medico/empresas/${empresaId}/cargos/${cargoId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${MultiRolState.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error al guardar');
        }

        showNotification('Cargo actualizado correctamente', 'success');
        modal.close();

        // Recargar el editor de profesiograma
        loadProfesiogramaEditor(empresaId);

    } catch (error) {
        console.error('[MultiRol] Error guardando cargo:', error);
        showNotification(error.message || 'Error al guardar cambios', 'error');
    }
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// EXPORTS
// ============================================
export {
    MultiRolState,
    ROLES,
    loadAdminHomePage,
    loadAdminEmpresasPage,
    loadAdminMedicosPage,
    loadAdminPagosPage,
    loadMedicoHomePage,
    loadMedicoFirmaPage
};

export default {
    init: initMultiRolDashboard,
    state: MultiRolState,
    ROLES
};
