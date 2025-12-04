/**
 * Dashboard Examenes Handler - Sprint 4
 * Maneja las vistas de examenes medicos, mapa de calor y KPIs
 */

// Detectar entorno
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// ============================================
// COLORES NR
// ============================================

const COLORES_NR = {
    V: { bg: '#fef2f2', color: '#dc2626', label: 'Critico', intensity: 1 },
    IV: { bg: '#fff7ed', color: '#fb923c', label: 'Alto', intensity: 0.8 },
    III: { bg: '#fefce8', color: '#f59e0b', label: 'Medio', intensity: 0.6 },
    II: { bg: '#f0fdf4', color: '#84cc16', label: 'Bajo', intensity: 0.4 },
    I: { bg: '#ecfdf5', color: '#10b981', label: 'Aceptable', intensity: 0.2 }
};

// ============================================
// AUTH
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
// EXAMENES VIEW
// ============================================

export async function loadExamenesView(container) {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        container.innerHTML = renderEmptyState('No tienes empresa asociada');
        return;
    }

    container.innerHTML = renderLoading();

    try {
        const response = await fetch(`${API_BASE}/examenes/empresa/${empresaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar examenes');

        const data = await response.json();

        if (!data.success || data.cargoExamenes.length === 0) {
            container.innerHTML = renderEmptyState('No hay examenes registrados');
            return;
        }

        container.innerHTML = renderExamenesView(data);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = renderErrorState(error.message);
    }
}

function renderExamenesView(data) {
    const { cargoExamenes, examenesConsolidados, resumen } = data;

    // Summary metrics
    const metricsHtml = `
        <div class="metrics-row">
            <div class="metric-card">
                <div class="metric-value">${resumen.totalCargos}</div>
                <div class="metric-label">Cargos</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${resumen.totalTrabajadores}</div>
                <div class="metric-label">Trabajadores</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${resumen.totalExamenesUnicos}</div>
                <div class="metric-label">Examenes Unicos</div>
            </div>
        </div>
    `;

    // Consolidated exams section
    const consolidadosHtml = `
        <div class="examenes-consolidados">
            <h3 class="section-title">Examenes Requeridos (Consolidado)</h3>
            <div class="examenes-grid">
                ${examenesConsolidados.map(ex => `
                    <div class="examen-card">
                        <div class="examen-header">
                            <span class="examen-codigo">${ex.codigo}</span>
                            <span class="examen-periodicidad">${ex.periodicidad}</span>
                        </div>
                        <div class="examen-nombre">${ex.nombre}</div>
                        <div class="examen-meta">
                            <span>${ex.cargosQueRequieren.length} cargos</span>
                            <span>${ex.trabajadoresAfectados} trabajadores</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Exams by cargo table
    const tableCargosHtml = `
        <div class="examenes-por-cargo">
            <h3 class="section-title">Examenes por Cargo</h3>
            <div class="cargo-examenes-table">
                <div class="table-header">
                    <span>Cargo</span>
                    <span>Area</span>
                    <span>Trabajadores</span>
                    <span>NR</span>
                    <span>Examenes</span>
                </div>
                ${cargoExamenes.map(cargo => `
                    <div class="table-row">
                        <span class="cargo-nombre">${cargo.nombre}</span>
                        <span class="cargo-area">${cargo.area || '-'}</span>
                        <span class="cargo-trabajadores">${cargo.numTrabajadores}</span>
                        <span class="cargo-nr" style="background:${COLORES_NR[cargo.nrNivel]?.bg};color:${COLORES_NR[cargo.nrNivel]?.color}">
                            ${cargo.nrNivel}
                        </span>
                        <span class="cargo-examenes">
                            ${cargo.examenes.slice(0, 3).map(e => `<span class="examen-badge">${e.codigo}</span>`).join('')}
                            ${cargo.examenes.length > 3 ? `<span class="examen-badge more">+${cargo.examenes.length - 3}</span>` : ''}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    return `
        <div class="examenes-view">
            ${metricsHtml}
            ${consolidadosHtml}
            ${tableCargosHtml}
        </div>
    `;
}

// ============================================
// MAPA DE CALOR VIEW
// ============================================

export async function loadMapaCalorView(container) {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        container.innerHTML = renderEmptyState('No tienes empresa asociada');
        return;
    }

    container.innerHTML = renderLoading();

    try {
        const response = await fetch(`${API_BASE}/examenes/mapa-calor/${empresaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar mapa de calor');

        const data = await response.json();

        if (!data.success || data.cargos.length === 0) {
            container.innerHTML = renderEmptyState('No hay datos para el mapa de calor');
            return;
        }

        container.innerHTML = renderMapaCalorView(data);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = renderErrorState(error.message);
    }
}

function renderMapaCalorView(data) {
    const { cargos, areas, resumen } = data;

    // Summary with distribution
    const summaryHtml = `
        <div class="mapa-summary">
            <div class="summary-stats">
                <div class="stat-box">
                    <span class="stat-value">${resumen.totalCargos}</span>
                    <span class="stat-label">Cargos</span>
                </div>
                <div class="stat-box">
                    <span class="stat-value">${resumen.totalTrabajadores}</span>
                    <span class="stat-label">Trabajadores</span>
                </div>
                <div class="stat-box danger">
                    <span class="stat-value">${resumen.cargosCriticos}</span>
                    <span class="stat-label">Cargos Criticos</span>
                </div>
                <div class="stat-box danger">
                    <span class="stat-value">${resumen.trabajadoresEnRiesgoCritico}</span>
                    <span class="stat-label">En Riesgo Critico</span>
                </div>
            </div>
            <div class="nr-distribution-bar">
                ${Object.entries(resumen.distribucionNR).map(([nivel, count]) => {
                    const pct = resumen.totalCargos > 0 ? (count / resumen.totalCargos) * 100 : 0;
                    return `<div class="nr-segment" style="width:${pct}%;background:${COLORES_NR[nivel].color}" title="NR ${nivel}: ${count}"></div>`;
                }).join('')}
            </div>
            <div class="nr-legend">
                ${Object.entries(COLORES_NR).map(([nivel, config]) => `
                    <span class="legend-item">
                        <span class="legend-color" style="background:${config.color}"></span>
                        ${nivel}: ${resumen.distribucionNR[nivel] || 0}
                    </span>
                `).join('')}
            </div>
        </div>
    `;

    // Heatmap by area
    const heatmapHtml = `
        <div class="heatmap-section">
            <h3 class="section-title">Mapa de Calor por Area</h3>
            <div class="areas-heatmap">
                ${areas.map(area => `
                    <div class="area-block" style="border-color:${COLORES_NR[area.nrNivelArea]?.color}">
                        <div class="area-header" style="background:${COLORES_NR[area.nrNivelArea]?.bg}">
                            <h4>${area.area}</h4>
                            <span class="area-nr" style="color:${COLORES_NR[area.nrNivelArea]?.color}">
                                NR ${area.nrNivelArea}
                            </span>
                        </div>
                        <div class="area-cargos">
                            ${area.cargos.map(cargo => `
                                <div class="cargo-heat-item" style="background:${getHeatColor(cargo.nrNivel)}">
                                    <span class="heat-cargo-name">${cargo.nombre}</span>
                                    <span class="heat-cargo-info">${cargo.numTrabajadores} trab. | ${cargo.totalRiesgos} riesgos</span>
                                    <span class="heat-cargo-nr" style="color:${COLORES_NR[cargo.nrNivel]?.color}">${cargo.nrNivel}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="area-footer">
                            <span>${area.cargos.length} cargos</span>
                            <span>${area.totalTrabajadores} trabajadores</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Cargos list with heat
    const cargosHtml = `
        <div class="cargos-heat-list">
            <h3 class="section-title">Todos los Cargos por Nivel de Riesgo</h3>
            <div class="cargos-heat-grid">
                ${cargos
                    .sort((a, b) => getNRValue(b.nrNivel) - getNRValue(a.nrNivel))
                    .map(cargo => `
                        <div class="cargo-heat-card" style="border-left: 4px solid ${COLORES_NR[cargo.nrNivel]?.color}">
                            <div class="cargo-heat-header">
                                <span class="cargo-heat-name">${cargo.nombre}</span>
                                <span class="cargo-heat-badge" style="background:${COLORES_NR[cargo.nrNivel]?.bg};color:${COLORES_NR[cargo.nrNivel]?.color}">
                                    NR ${cargo.nrNivel}
                                </span>
                            </div>
                            <div class="cargo-heat-body">
                                <span>${cargo.area}</span>
                                <span>${cargo.numTrabajadores} trabajadores</span>
                                <span>${cargo.totalRiesgos} riesgos</span>
                            </div>
                            <div class="cargo-heat-nr-dist">
                                ${Object.entries(cargo.conteoNiveles)
                                    .filter(([_, count]) => count > 0)
                                    .map(([nivel, count]) => `
                                        <span class="nr-mini" style="background:${COLORES_NR[nivel]?.bg};color:${COLORES_NR[nivel]?.color}">
                                            ${nivel}:${count}
                                        </span>
                                    `).join('')}
                            </div>
                        </div>
                    `).join('')}
            </div>
        </div>
    `;

    return `
        <div class="mapa-calor-view">
            ${summaryHtml}
            ${heatmapHtml}
            ${cargosHtml}
        </div>
    `;
}

function getHeatColor(nrNivel) {
    const config = COLORES_NR[nrNivel];
    return config ? config.bg : '#f3f4f6';
}

function getNRValue(nivel) {
    const values = { V: 5, IV: 4, III: 3, II: 2, I: 1 };
    return values[nivel] || 0;
}

// ============================================
// KPIs / DASHBOARD HOME VIEW
// ============================================

export async function loadKPIsView(container) {
    const empresaId = getEmpresaId();
    if (!empresaId) {
        container.innerHTML = renderEmptyState('No tienes empresa asociada');
        return;
    }

    container.innerHTML = renderLoading();

    try {
        const response = await fetch(`${API_BASE}/examenes/kpis/${empresaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar KPIs');

        const data = await response.json();

        if (!data.success) {
            container.innerHTML = renderEmptyState('No hay datos disponibles');
            return;
        }

        container.innerHTML = renderKPIsView(data);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = renderErrorState(error.message);
    }
}

function renderKPIsView(data) {
    const { empresa, kpis, distribucionNR, riesgosPorTipo } = data;

    // Welcome header
    const headerHtml = `
        <div class="kpi-header">
            <h2>Bienvenido, ${empresa.nombre}</h2>
            <p>Resumen de tu gestion SST</p>
        </div>
    `;

    // Main KPIs
    const mainKpis = `
        <div class="kpi-cards">
            <div class="kpi-card">
                <div class="kpi-icon">👥</div>
                <div class="kpi-value">${kpis.totalCargos}</div>
                <div class="kpi-label">Cargos</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">🧑‍💼</div>
                <div class="kpi-value">${kpis.totalTrabajadores}</div>
                <div class="kpi-label">Trabajadores</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">⚠️</div>
                <div class="kpi-value">${kpis.totalRiesgos}</div>
                <div class="kpi-label">Riesgos ID</div>
            </div>
            <div class="kpi-card danger">
                <div class="kpi-icon">🔴</div>
                <div class="kpi-value">${kpis.riesgosCriticos}</div>
                <div class="kpi-label">Criticos (IV-V)</div>
            </div>
        </div>
    `;

    // Risk indicator
    const riskIndicator = `
        <div class="risk-indicator-section">
            <h3 class="section-title">Indicador de Riesgo Critico</h3>
            <div class="risk-gauge">
                <div class="gauge-bar">
                    <div class="gauge-fill ${kpis.porcentajeRiesgoCritico > 30 ? 'high' : kpis.porcentajeRiesgoCritico > 10 ? 'medium' : 'low'}"
                         style="width: ${Math.min(kpis.porcentajeRiesgoCritico, 100)}%">
                    </div>
                </div>
                <div class="gauge-labels">
                    <span>${kpis.trabajadoresEnRiesgoCritico} de ${kpis.totalTrabajadores} trabajadores en riesgo critico</span>
                    <span class="gauge-percent">${kpis.porcentajeRiesgoCritico}%</span>
                </div>
            </div>
        </div>
    `;

    // NR Distribution chart
    const nrChart = `
        <div class="nr-chart-section">
            <h3 class="section-title">Distribucion de Niveles de Riesgo</h3>
            <div class="nr-bars">
                ${Object.entries(distribucionNR).map(([nivel, count]) => {
                    const maxCount = Math.max(...Object.values(distribucionNR));
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return `
                        <div class="nr-bar-col">
                            <div class="nr-bar" style="height:${height}%;background:${COLORES_NR[nivel]?.color}"></div>
                            <div class="nr-bar-label">${nivel}</div>
                            <div class="nr-bar-value">${count}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // Risks by type
    const tiposHtml = `
        <div class="tipos-riesgo-section">
            <h3 class="section-title">Riesgos por Categoria</h3>
            <div class="tipos-list">
                ${Object.entries(riesgosPorTipo).map(([tipo, data]) => `
                    <div class="tipo-item">
                        <span class="tipo-nombre">${tipo}</span>
                        <div class="tipo-bars">
                            <span class="tipo-total">${data.total} total</span>
                            ${data.criticos > 0 ? `<span class="tipo-criticos">${data.criticos} criticos</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Documents status
    const docsHtml = `
        <div class="docs-status-section">
            <h3 class="section-title">Estado de Documentos</h3>
            <div class="docs-stats">
                <div class="doc-stat">
                    <span class="doc-value">${kpis.documentos.total}</span>
                    <span class="doc-label">Total</span>
                </div>
                <div class="doc-stat success">
                    <span class="doc-value">${kpis.documentos.pagados}</span>
                    <span class="doc-label">Pagados</span>
                </div>
                <div class="doc-stat pending">
                    <span class="doc-value">${kpis.documentos.pendientes}</span>
                    <span class="doc-label">Pendientes</span>
                </div>
            </div>
        </div>
    `;

    return `
        <div class="kpis-view">
            ${headerHtml}
            ${mainKpis}
            ${riskIndicator}
            <div class="kpi-charts-row">
                ${nrChart}
                ${tiposHtml}
            </div>
            ${docsHtml}
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
            <p class="empty-state-text">Genera un diagnostico para ver los datos</p>
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

// Export for dashboard integration
export default {
    loadExamenesView,
    loadMapaCalorView,
    loadKPIsView,
    COLORES_NR
};
