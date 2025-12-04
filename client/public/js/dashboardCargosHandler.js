/**
 * Dashboard Cargos Handler - Sprint 2
 * Maneja la vista de Gestion de Cargos y Matriz GTC-45
 */

// Detectar entorno
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// ============================================
// COLORES Y CONFIGURACION GTC-45
// ============================================

const COLORES_NR = {
    V: { bg: '#fef2f2', color: '#dc2626', label: 'Critico' },
    IV: { bg: '#fff7ed', color: '#fb923c', label: 'Alto' },
    III: { bg: '#fefce8', color: '#f59e0b', label: 'Medio' },
    II: { bg: '#f0fdf4', color: '#84cc16', label: 'Bajo' },
    I: { bg: '#ecfdf5', color: '#10b981', label: 'Aceptable' }
};

const COLORES_CATEGORIA = {
    'Biologico': '#10b981',
    'Fisico': '#3b82f6',
    'Quimico': '#f59e0b',
    'Psicosocial': '#8b5cf6',
    'Biomecanico': '#ec4899',
    'Condiciones de seguridad': '#ef4444',
    'Fenomenos naturales': '#6b7280'
};

const ICONOS_TOGGLE = {
    'Alturas': '🧗',
    'Alimentos': '🍽️',
    'Vehiculo': '🚗',
    'Espacios Conf.': '🕳️'
};

// ============================================
// HELPER FUNCTIONS - Sprint 6 Bug Fix A.3
// ============================================

/**
 * Formatea ND para mostrar "No Aplica" cuando es 0
 * ✅ Bug Fix A.3: ND=0 debe mostrarse como "No Aplica"
 */
function formatearND(nd) {
    if (nd === 0 || nd === '0') {
        return 'N/A';
    }
    return nd;
}

// ============================================
// AUTH CHECK
// ============================================

const token = localStorage.getItem('genesys_token');
const authType = localStorage.getItem('genesys_auth_type');
const userData = authType === 'user'
    ? JSON.parse(localStorage.getItem('genesys_user') || '{}')
    : JSON.parse(localStorage.getItem('genesys_empresa') || '{}');

function getEmpresaId() {
    if (authType === 'empresa') return userData.id;
    if (authType === 'user') return userData.empresa_id;
    return null;
}

// ============================================
// CARGOS VIEW
// ============================================

export async function loadCargosView(container) {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        container.innerHTML = renderEmptyState('No tienes empresa asociada');
        return;
    }

    container.innerHTML = renderLoading();

    try {
        const response = await fetch(`${API_BASE}/cargos/empresa/${empresaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar cargos');

        const data = await response.json();

        if (!data.success || data.cargos.length === 0) {
            container.innerHTML = renderEmptyState('No hay cargos registrados');
            return;
        }

        container.innerHTML = renderCargosView(data.cargos);
        attachCargosEventListeners(container);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = renderErrorState(error.message);
    }
}

function renderCargosView(cargos) {
    // Summary metrics
    const totalCargos = cargos.length;
    const totalTrabajadores = cargos.reduce((sum, c) => sum + (c.num_trabajadores || 0), 0);
    const totalRiesgos = cargos.reduce((sum, c) => sum + c.riesgosCount, 0);
    const cargosCriticos = cargos.filter(c => c.nrNivelMaximo === 'IV' || c.nrNivelMaximo === 'V').length;

    return `
        <div class="cargos-view">
            <!-- Summary Cards -->
            <div class="summary-cards">
                <div class="summary-card">
                    <div class="summary-value">${totalCargos}</div>
                    <div class="summary-label">Cargos</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${totalTrabajadores}</div>
                    <div class="summary-label">Trabajadores</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">${totalRiesgos}</div>
                    <div class="summary-label">Riesgos ID</div>
                </div>
                <div class="summary-card ${cargosCriticos > 0 ? 'danger' : ''}">
                    <div class="summary-value">${cargosCriticos}</div>
                    <div class="summary-label">Cargos Criticos</div>
                </div>
            </div>

            <!-- Cargos List -->
            <div class="cargos-list">
                ${cargos.map(cargo => renderCargoCard(cargo)).join('')}
            </div>
        </div>
    `;
}

function renderCargoCard(cargo) {
    const nrConfig = COLORES_NR[cargo.nrNivelMaximo] || COLORES_NR['I'];
    const togglesBadges = cargo.togglesActivos.map(t =>
        `<span class="toggle-badge" title="${t}">${ICONOS_TOGGLE[t] || '🔧'}</span>`
    ).join('');

    // NR level badges
    const nrBadges = Object.entries(cargo.conteoNiveles)
        .filter(([_, count]) => count > 0)
        .map(([nivel, count]) => {
            const config = COLORES_NR[nivel];
            return `<span class="nr-badge" style="background:${config.bg};color:${config.color}">${nivel}: ${count}</span>`;
        }).join('');

    return `
        <div class="cargo-card" data-cargo-id="${cargo.id}">
            <div class="cargo-header">
                <div class="cargo-info">
                    <h3 class="cargo-name">${cargo.nombre_cargo}</h3>
                    <p class="cargo-area">${cargo.area || 'Sin area'} ${cargo.zona ? `• ${cargo.zona}` : ''}</p>
                </div>
                <div class="cargo-nr" style="background:${nrConfig.bg};color:${nrConfig.color}">
                    NR ${cargo.nrNivelMaximo || '-'}
                </div>
            </div>

            <div class="cargo-body">
                <div class="cargo-stats">
                    <div class="stat">
                        <span class="stat-value">${cargo.num_trabajadores || 0}</span>
                        <span class="stat-label">trabajadores</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${cargo.riesgosCount}</span>
                        <span class="stat-label">riesgos</span>
                    </div>
                </div>

                ${togglesBadges ? `<div class="cargo-toggles">${togglesBadges}</div>` : ''}

                <div class="cargo-nr-badges">
                    ${nrBadges || '<span class="no-risks">Sin riesgos evaluados</span>'}
                </div>
            </div>

            <div class="cargo-actions">
                <button class="cargo-btn cargo-btn-detail" data-action="detail" data-cargo-id="${cargo.id}">
                    Ver Detalle
                </button>
            </div>
        </div>
    `;
}

function attachCargosEventListeners(container) {
    container.querySelectorAll('[data-action="detail"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const cargoId = e.currentTarget.dataset.cargoId;
            await showCargoDetailModal(cargoId);
        });
    });
}

// ============================================
// CARGO DETAIL MODAL
// ============================================

async function showCargoDetailModal(cargoId) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>Detalle del Cargo</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${renderLoading()}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Load cargo detail
    try {
        const response = await fetch(`${API_BASE}/cargos/detalle/${cargoId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar detalle');

        const data = await response.json();
        modal.querySelector('.modal-body').innerHTML = renderCargoDetail(data);

    } catch (error) {
        modal.querySelector('.modal-body').innerHTML = renderErrorState(error.message);
    }
}

function renderCargoDetail(data) {
    const { cargo, riesgosPorTipo, peligrosCriticos, resumen } = data;

    // Peligros criticos section
    const criticosHtml = peligrosCriticos.length > 0 ? `
        <div class="criticos-section">
            <h3 class="section-title danger">⚠️ Peligros Criticos (NR IV-V)</h3>
            <div class="criticos-list">
                ${peligrosCriticos.map(p => `
                    <div class="critico-item" style="border-left: 4px solid ${COLORES_NR[p.niveles.nrNivel].color}">
                        <div class="critico-header">
                            <span class="critico-tipo">${p.tipoRiesgo}</span>
                            <span class="critico-nr" style="background:${COLORES_NR[p.niveles.nrNivel].bg};color:${COLORES_NR[p.niveles.nrNivel].color}">
                                NR ${p.niveles.nrNivel} (${p.niveles.nr})
                            </span>
                        </div>
                        <p class="critico-desc">${p.descripcion}</p>
                        <p class="critico-interp">${p.interpretacionNR}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    // Riesgos by type
    const riesgosHtml = Object.entries(riesgosPorTipo).map(([tipo, riesgos]) => {
        const color = COLORES_CATEGORIA[tipo] || '#6b7280';
        return `
            <div class="riesgo-tipo-section">
                <div class="riesgo-tipo-header" style="border-left: 4px solid ${color}">
                    <h4>${tipo}</h4>
                    <span class="riesgo-count">${riesgos.length} peligros</span>
                </div>
                <div class="riesgo-tipo-list">
                    ${riesgos.map(r => `
                        <div class="riesgo-item">
                            <div class="riesgo-desc">${r.descripcion}</div>
                            <div class="riesgo-niveles">
                                <span>ND: ${formatearND(r.niveles.nd)}</span>
                                <span>NE: ${r.niveles.ne}</span>
                                <span>NC: ${r.niveles.nc}</span>
                                <span class="riesgo-nr" style="background:${COLORES_NR[r.niveles.nrNivel].bg};color:${COLORES_NR[r.niveles.nrNivel].color}">
                                    NR ${r.niveles.nrNivel}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Toggles activos
    const togglesHtml = Object.entries(cargo.toggles)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
            const labels = {
                trabajaAlturas: '🧗 Trabajo en Alturas',
                manipulaAlimentos: '🍽️ Manipulacion de Alimentos',
                conduceVehiculo: '🚗 Conduce Vehiculo',
                trabajaEspaciosConfinados: '🕳️ Espacios Confinados',
                tareasRutinarias: '🔄 Tareas Rutinarias'
            };
            return `<span class="toggle-active">${labels[key] || key}</span>`;
        }).join('');

    return `
        <div class="cargo-detail">
            <div class="cargo-detail-header">
                <div>
                    <h2>${cargo.nombre}</h2>
                    <p>${cargo.area || 'Sin area'} ${cargo.zona ? `• ${cargo.zona}` : ''}</p>
                    <p class="trabajadores">${cargo.numTrabajadores} trabajadores en este cargo</p>
                </div>
                <div class="resumen-nr">
                    <div class="resumen-total">${resumen.totalRiesgos} riesgos</div>
                    <div class="nr-distribution">
                        ${Object.entries(resumen.conteoNiveles)
                            .filter(([_, count]) => count > 0)
                            .map(([nivel, count]) => `
                                <span class="nr-pill" style="background:${COLORES_NR[nivel].bg};color:${COLORES_NR[nivel].color}">
                                    ${nivel}: ${count}
                                </span>
                            `).join('')}
                    </div>
                </div>
            </div>

            ${togglesHtml ? `<div class="toggles-activos">${togglesHtml}</div>` : ''}

            ${cargo.descripcion ? `
                <div class="descripcion-section">
                    <h4>Descripcion de Tareas</h4>
                    <p>${cargo.descripcion}</p>
                </div>
            ` : ''}

            ${criticosHtml}

            <div class="riesgos-section">
                <h3 class="section-title">Riesgos por Categoria</h3>
                ${riesgosHtml || '<p class="no-data">No hay riesgos registrados</p>'}
            </div>
        </div>
    `;
}

// ============================================
// MATRIZ GTC-45 VIEW
// ============================================

export async function loadMatrizGTC45View(container) {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        container.innerHTML = renderEmptyState('No tienes empresa asociada');
        return;
    }

    container.innerHTML = renderLoading();

    try {
        const response = await fetch(`${API_BASE}/cargos/matriz-gtc45/${empresaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar matriz');

        const data = await response.json();

        if (!data.success || data.categorias.length === 0) {
            container.innerHTML = renderEmptyState('No hay datos de riesgos');
            return;
        }

        container.innerHTML = renderMatrizView(data);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = renderErrorState(error.message);
    }
}

function renderMatrizView(data) {
    const { categorias, alertasCriticas, resumen } = data;

    // Metric cards
    const metricsHtml = `
        <div class="metrics-row">
            <div class="metric-card">
                <div class="metric-value">${resumen.totalPeligros}</div>
                <div class="metric-label">Total Peligros</div>
            </div>
            ${Object.entries(resumen.conteoNiveles).map(([nivel, count]) => `
                <div class="metric-card" style="border-top: 3px solid ${COLORES_NR[nivel].color}">
                    <div class="metric-value" style="color:${COLORES_NR[nivel].color}">${count}</div>
                    <div class="metric-label">NR ${nivel}</div>
                </div>
            `).join('')}
        </div>
    `;

    // Critical alerts
    const alertasHtml = alertasCriticas.length > 0 ? `
        <div class="alertas-section">
            <h3 class="section-title danger">⚠️ Alertas Criticas (${alertasCriticas.length})</h3>
            <div class="alertas-grid">
                ${alertasCriticas.slice(0, 6).map(a => `
                    <div class="alerta-card" style="border-left: 4px solid ${COLORES_NR[a.nrNivel].color}">
                        <div class="alerta-header">
                            <span class="alerta-cargo">${a.cargo}</span>
                            <span class="alerta-nr" style="background:${COLORES_NR[a.nrNivel].bg};color:${COLORES_NR[a.nrNivel].color}">
                                NR ${a.nrNivel}
                            </span>
                        </div>
                        <p class="alerta-desc">${a.descripcion}</p>
                        <span class="alerta-tipo">${a.tipo}</span>
                    </div>
                `).join('')}
            </div>
            ${alertasCriticas.length > 6 ? `<p class="ver-mas">+ ${alertasCriticas.length - 6} alertas mas</p>` : ''}
        </div>
    ` : '';

    // Categories
    const categoriasHtml = categorias.map(cat => `
        <div class="categoria-section">
            <div class="categoria-header" style="background: ${cat.color}15; border-left: 4px solid ${cat.color}">
                <h4 style="color: ${cat.color}">${cat.nombre}</h4>
                <div class="categoria-badges">
                    ${Object.entries(cat.conteoNiveles)
                        .filter(([_, count]) => count > 0)
                        .map(([nivel, count]) => `
                            <span class="cat-badge" style="background:${COLORES_NR[nivel].bg};color:${COLORES_NR[nivel].color}">
                                ${nivel}: ${count}
                            </span>
                        `).join('')}
                </div>
            </div>
            <div class="peligros-table">
                <div class="peligros-header">
                    <span>Peligro</span>
                    <span>Cargo</span>
                    <span>ND</span>
                    <span>NE</span>
                    <span>NC</span>
                    <span>NR</span>
                </div>
                ${cat.peligros.slice(0, 5).map(p => `
                    <div class="peligro-row">
                        <span class="peligro-desc" title="${p.descripcion}">${truncate(p.descripcion, 40)}</span>
                        <span class="peligro-cargo">${p.cargo}</span>
                        <span>${formatearND(p.niveles.nd)}</span>
                        <span>${p.niveles.ne}</span>
                        <span>${p.niveles.nc}</span>
                        <span class="peligro-nr" style="background:${COLORES_NR[p.niveles.nrNivel].bg};color:${COLORES_NR[p.niveles.nrNivel].color}">
                            ${p.niveles.nrNivel}
                        </span>
                    </div>
                `).join('')}
                ${cat.peligros.length > 5 ? `
                    <div class="peligro-row ver-mas">
                        <span>+ ${cat.peligros.length - 5} peligros mas en esta categoria</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    return `
        <div class="matriz-view">
            ${metricsHtml}
            ${alertasHtml}
            <div class="categorias-section">
                <h3 class="section-title">Peligros por Categoria GTC-45</h3>
                ${categoriasHtml}
            </div>
        </div>
    `;
}

// ============================================
// HELPERS
// ============================================

function renderLoading() {
    return `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando...</p>
        </div>
    `;
}

function renderEmptyState(message) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <h3 class="empty-state-title">${message}</h3>
            <p class="empty-state-text">Genera un diagnostico para ver los cargos y riesgos</p>
            <a href="./wizard_riesgos.html" class="header-btn header-btn-primary">Crear Diagnostico</a>
        </div>
    `;
}

function renderErrorState(message) {
    return `
        <div class="empty-state error">
            <div class="empty-state-icon">❌</div>
            <h3 class="empty-state-title">Error</h3>
            <p class="empty-state-text">${message}</p>
        </div>
    `;
}

function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
}

// ============================================
// CONTROLES VIEW (JERARQUIA ISO 45001)
// ============================================

export async function loadControlesView(container) {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        container.innerHTML = renderEmptyState('No tienes empresa asociada');
        return;
    }

    container.innerHTML = renderLoading();

    try {
        const response = await fetch(`${API_BASE}/cargos/controles/${empresaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar controles');

        const data = await response.json();

        if (!data.success || data.jerarquia.length === 0) {
            container.innerHTML = renderEmptyState('No hay controles registrados');
            return;
        }

        container.innerHTML = renderControlesView(data);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = renderErrorState(error.message);
    }
}

function renderControlesView(data) {
    const { jerarquia, eppConsolidado, resumen } = data;

    const ICONOS_JERARQUIA = {
        eliminacion: '🚫',
        sustitucion: '🔄',
        ingenieria: '🔧',
        administrativos: '📋',
        epp: '🦺'
    };

    const COLORES_JERARQUIA = {
        eliminacion: '#10b981',
        sustitucion: '#3b82f6',
        ingenieria: '#8b5cf6',
        administrativos: '#f59e0b',
        epp: '#ef4444'
    };

    // Summary metrics
    const metricsHtml = `
        <div class="metrics-row">
            <div class="metric-card">
                <div class="metric-value">${resumen.totalControles}</div>
                <div class="metric-label">Total Controles</div>
            </div>
            ${jerarquia.map(j => `
                <div class="metric-card" style="border-top: 3px solid ${COLORES_JERARQUIA[j.key]}">
                    <div class="metric-value" style="color:${COLORES_JERARQUIA[j.key]}">${j.count}</div>
                    <div class="metric-label">${j.nombre}</div>
                </div>
            `).join('')}
        </div>
    `;

    // Hierarchy pyramid visualization
    const pyramidHtml = `
        <div class="jerarquia-pyramid">
            <h3 class="section-title">Jerarquia de Controles ISO 45001</h3>
            <div class="pyramid-container">
                ${jerarquia.map((j, index) => `
                    <div class="pyramid-level" style="--level: ${index}; --color: ${COLORES_JERARQUIA[j.key]}">
                        <div class="pyramid-icon">${ICONOS_JERARQUIA[j.key]}</div>
                        <div class="pyramid-info">
                            <strong>${j.nombre}</strong>
                            <span>${j.descripcion}</span>
                        </div>
                        <div class="pyramid-count">${j.count}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Controls by hierarchy
    const controlesHtml = jerarquia.map(j => {
        if (j.count === 0) return '';

        return `
            <div class="controles-section">
                <div class="controles-header" style="background: ${COLORES_JERARQUIA[j.key]}15; border-left: 4px solid ${COLORES_JERARQUIA[j.key]}">
                    <div class="controles-title">
                        <span class="controles-icon">${ICONOS_JERARQUIA[j.key]}</span>
                        <h4 style="color: ${COLORES_JERARQUIA[j.key]}">${j.nombre}</h4>
                    </div>
                    <span class="controles-count">${j.count} controles</span>
                </div>
                <div class="controles-list">
                    ${j.controles.slice(0, 10).map(c => `
                        <div class="control-item">
                            <span class="control-text">${c.control}</span>
                            <span class="control-meta">${c.cargo} - ${c.riesgo}</span>
                        </div>
                    `).join('')}
                    ${j.controles.length > 10 ? `
                        <div class="control-item ver-mas">
                            + ${j.controles.length - 10} controles mas
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    // EPP Consolidado
    const eppHtml = eppConsolidado.length > 0 ? `
        <div class="epp-section">
            <h3 class="section-title">🦺 EPP Requerido (Consolidado)</h3>
            <div class="epp-grid">
                ${eppConsolidado.map(epp => `
                    <div class="epp-item">${epp}</div>
                `).join('')}
            </div>
        </div>
    ` : '';

    return `
        <div class="controles-view">
            ${metricsHtml}
            ${pyramidHtml}
            ${controlesHtml}
            ${eppHtml}
        </div>
    `;
}

// Export for dashboard integration
export default {
    loadCargosView,
    loadMatrizGTC45View,
    loadControlesView,
    COLORES_NR,
    COLORES_CATEGORIA
};
