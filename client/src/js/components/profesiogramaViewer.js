/**
 * Profesiograma Viewer Component
 * Handles horizontal scroll navigation with smooth animations
 * Based on Figma design with Genesys branding
 */

class ProfesiogramaViewer {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 0;
        this.viewer = null;
        this.pages = [];

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Get DOM elements
        this.viewer = document.getElementById('profesiograma-viewer');
        this.pages = document.querySelectorAll('.page');
        this.totalPages = this.pages.length;

        // Update page indicators
        document.getElementById('total-pages-num').textContent = this.totalPages;

        // Initialize navigation dots
        this.initializeDots();

        // Bind event listeners
        this.bindEvents();

        // Load data from URL params (if viewing a specific profesiograma)
        this.loadData();

        // Set initial page
        this.goToPage(0);

        // Set today's date
        this.setDates();
    }

    initializeDots() {
        const dotsContainer = document.getElementById('page-dots');
        dotsContainer.innerHTML = '';

        for (let i = 0; i < this.totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = 'page-dot';
            dot.setAttribute('aria-label', `Ir a sección ${i + 1}`);
            dot.dataset.page = i;

            dot.addEventListener('click', () => {
                this.goToPage(i);
            });

            dotsContainer.appendChild(dot);
        }
    }

    bindEvents() {
        // Previous button
        const btnPrev = document.getElementById('btn-prev');
        btnPrev.addEventListener('click', () => this.previousPage());

        // Next button
        const btnNext = document.getElementById('btn-next');
        btnNext.addEventListener('click', () => this.nextPage());

        // Print button
        const btnPrint = document.getElementById('btn-print');
        btnPrint.addEventListener('click', () => this.print());

        // Export PDF button
        const btnExportPDF = document.getElementById('btn-export-pdf');
        btnExportPDF.addEventListener('click', () => this.exportPDF());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousPage();
            } else if (e.key === 'ArrowRight') {
                this.nextPage();
            }
        });

        // Scroll snap support
        this.viewer.addEventListener('scroll', () => {
            // Detect current page based on scroll position
            this.detectCurrentPage();
        });

        // Touch swipe support
        this.initTouchSupport();
    }

    initTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;

        this.viewer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.viewer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next page
                    this.nextPage();
                } else {
                    // Swipe right - previous page
                    this.previousPage();
                }
            }
        };

        this.handleSwipe = handleSwipe;
    }

    detectCurrentPage() {
        const scrollLeft = this.viewer.scrollLeft;
        const pageWidth = this.viewer.clientWidth;
        const detectedPage = Math.round(scrollLeft / pageWidth);

        if (detectedPage !== this.currentPage) {
            this.currentPage = detectedPage;
            this.updateUI();
        }
    }

    goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.totalPages) {
            return;
        }

        this.currentPage = pageIndex;

        // Smooth scroll to page
        const pageWidth = this.viewer.clientWidth;
        this.viewer.scrollTo({
            left: pageIndex * pageWidth,
            behavior: 'smooth'
        });

        this.updateUI();
    }

    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.goToPage(this.currentPage + 1);
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.goToPage(this.currentPage - 1);
        }
    }

    updateUI() {
        // Update page number indicator
        document.getElementById('current-page-num').textContent = this.currentPage + 1;

        // Update navigation buttons
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');

        btnPrev.disabled = this.currentPage === 0;
        btnNext.disabled = this.currentPage === this.totalPages - 1;

        // Update dots
        const dots = document.querySelectorAll('.page-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    print() {
        window.print();
    }

    async exportPDF() {
        // Get profesiograma ID from URL (support both 'id' and 'documento_id' params)
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id') || urlParams.get('documento_id');

        if (!id) {
            alert('No se encontró el ID del profesiograma');
            return;
        }

        try {
            const button = document.getElementById('btn-export-pdf');
            const originalText = button.innerHTML;

            // Show loading state
            button.disabled = true;
            button.innerHTML = `
                <svg class="btn-icon btn-icon-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                Generando PDF...
            `;

            // Call backend to generate PDF
            const response = await fetch(`/api/profesiograma/${id}/export-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al generar PDF');
            }

            // Download PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `profesiograma_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Restore button
            button.disabled = false;
            button.innerHTML = originalText;

            // Show success message
            alert('PDF generado exitosamente');

        } catch (error) {
            console.error('Error al exportar PDF:', error);
            alert('Error al generar el PDF. Por favor intente nuevamente.');

            // Restore button
            const button = document.getElementById('btn-export-pdf');
            button.disabled = false;
            button.innerHTML = `
                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                Exportar PDF
            `;
        }
    }

    async loadData() {
        // Get profesiograma ID from URL (support both 'id' and 'documento_id' params)
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id') || urlParams.get('documento_id');

        if (!id) {
            console.warn('No profesiograma ID in URL (looked for both ?id= and ?documento_id=)');
            return;
        }

        try {
            // Fetch profesiograma data from backend
            const response = await fetch(`/api/profesiograma/${id}`);

            if (!response.ok) {
                throw new Error('Error al cargar datos del profesiograma');
            }

            const data = await response.json();

            // Populate data in the page
            this.populateData(data);

        } catch (error) {
            console.error('Error al cargar profesiograma:', error);
            alert('Error al cargar los datos del profesiograma');
        }
    }

    populateData(data) {
        // Populate empresa info
        const empresaNombreElements = document.querySelectorAll('#empresa-nombre, #empresa-nombre-obj');
        empresaNombreElements.forEach(el => {
            if (el) el.textContent = data.empresa?.nombre || '[Nombre de la empresa]';
        });

        const empresaNitEl = document.getElementById('empresa-nit');
        if (empresaNitEl) {
            empresaNitEl.textContent = data.empresa?.nit || '[NIT]';
        }

        // Populate cargos (Sección 8 - LA MÁS IMPORTANTE)
        this.populateCargos(data.cargos || []);

        // Populate next revision date (1 year from now)
        const proximaRevisionEl = document.getElementById('proxima-revision');
        if (proximaRevisionEl) {
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            proximaRevisionEl.textContent = nextYear.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }

        // Populate version dates
        const fechaVersionInicialEl = document.getElementById('fecha-version-inicial');
        const fechaElaboroEl = document.getElementById('fecha-elaboro');
        const today = new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        if (fechaVersionInicialEl) fechaVersionInicialEl.textContent = today;
        if (fechaElaboroEl) fechaElaboroEl.textContent = today;
    }

    /**
     * Populate the Protocolo por Cargo section (Section 8)
     * This is the most important dynamic section
     */
    populateCargos(cargos) {
        const container = document.getElementById('cargos-container');
        if (!container) return;

        if (!cargos || cargos.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <p>No se encontraron cargos para este profesiograma.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        cargos.forEach((cargo, index) => {
            const cargoHTML = this.generateCargoHTML(cargo, index + 1, index);
            container.innerHTML += cargoHTML;
        });
    }

    /**
     * Generate HTML for a single cargo
     * @param {Object} cargo - Cargo data
     * @param {Number} fichaNum - Número de ficha (1-based)
     * @param {Number} cargoIndex - Índice del cargo (0-based, para data attributes)
     */
    generateCargoHTML(cargo, fichaNum, cargoIndex) {
        // Get risk level color
        const getRiskColor = (nivel) => {
            const riskColors = {
                'I': '#4caf50',    // Verde (bajo)
                'II': '#ffeb3b',   // Amarillo (medio)
                'III': '#ff9800',  // Naranja (alto)
                'IV': '#f44336'    // Rojo (muy alto)
            };
            return riskColors[nivel] || '#999';
        };

        // Generate GES identificados HTML (NUEVO - lista completa de riesgos con detalles)
        const gesIdentificadosHTML = cargo.gesIdentificados?.map(ges => `
            <div class="ges-item" style="border-left: 4px solid ${getRiskColor(ges.nivelNR)};">
                <div class="ges-header">
                    <div class="ges-info">
                        <span class="ges-riesgo-tipo">${ges.riesgo || 'Riesgo'}</span>
                        <h5 class="ges-nombre">${ges.ges || ''}</h5>
                    </div>
                    <span class="ges-badge" style="background-color: ${getRiskColor(ges.nivelNR)};">
                        NR: ${ges.niveles?.nr || 'N/A'} - ${ges.interpretacionNR || ''}
                    </span>
                </div>
                <div class="ges-niveles">
                    <span class="nivel-tag">ND: ${ges.niveles?.nd ?? 'N/A'}</span>
                    <span class="nivel-tag">NE: ${ges.niveles?.ne ?? 'N/A'}</span>
                    <span class="nivel-tag">NP: ${ges.niveles?.np ?? 'N/A'}</span>
                    <span class="nivel-tag">NC: ${ges.niveles?.nc ?? 'N/A'}</span>
                </div>
                ${ges.efectosPosibles ? `<p class="ges-efectos"><strong>Efectos posibles:</strong> ${ges.efectosPosibles}</p>` : ''}
                ${ges.justificacion ? `<p class="ges-justificacion"><strong>Justificación:</strong> ${ges.justificacion}</p>` : ''}
            </div>
        `).join('') || '';

        // Generate factores de riesgo HTML (solo los que requieren controles - resumen)
        const factoresHTML = cargo.factoresRiesgo?.map(factor => `
            <div class="factor-riesgo-item">
                <div class="factor-header">
                    <h5 class="factor-nombre">${factor.factor || ''}</h5>
                    <span class="factor-badge" style="background-color: ${getRiskColor(factor.nrNivel)};">
                        NR: ${factor.nr || 'N/A'} (Nivel ${factor.nrNivel || 'N/A'})
                    </span>
                </div>
                <p class="factor-descripcion">${factor.descripcion || ''}</p>
                <p class="factor-exposicion"><strong>Nivel de exposición:</strong> ${factor.nivelExposicion || 'N/A'}</p>
                ${factor.justificacion ? `<p class="factor-justificacion"><strong>Justificación técnica:</strong> ${factor.justificacion}</p>` : ''}
            </div>
        `).join('') || '<p class="no-data">No se identificaron factores de riesgo específicos.</p>';

        // Generate examenes HTML con columnas Ingreso, Periódico, Retiro
        // Lógica: Ingreso y Periódico = ✓ para todos los exámenes
        //         Retiro = ✓ solo para exámenes que contengan "EMO" o "Examen Médico" o "Médico Ocupacional"
        const isRetiroExamen = (nombre) => {
            if (!nombre) return false;
            const nombreLower = nombre.toLowerCase();
            return nombreLower.includes('emo') ||
                   nombreLower.includes('examen médico') ||
                   nombreLower.includes('examen medico') ||
                   nombreLower.includes('médico ocupacional') ||
                   nombreLower.includes('medico ocupacional');
        };

        const examenesHTML = cargo.examenes?.map((examen, index) => `
            <tr class="examen-row" data-examen-index="${index}" data-cargo-index="${cargoIndex}">
                <td>${examen.nombre || ''}</td>
                <td class="check-cell">✓</td>
                <td class="check-cell">✓</td>
                <td class="check-cell">${isRetiroExamen(examen.nombre) ? '✓' : ''}</td>
                <td>${examen.periodicidad || ''}</td>
                <td class="justificacion-cell">
                    <span class="justificacion-preview">${examen.justificacion || ''}</span>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="no-data">No se definieron exámenes médicos.</td></tr>';

        // Generate EPP HTML
        const eppHTML = cargo.epp?.map(item => `<li>${item}</li>`).join('') || '<li class="no-data">No se especificaron EPP.</li>';

        // Generate aptitudes HTML
        const aptitudesHTML = cargo.aptitudes?.map(item => `<li>${item}</li>`).join('') || '<li class="no-data">No se especificaron aptitudes.</li>';

        // Generate condiciones incompatibles HTML
        const incompatiblesHTML = cargo.condicionesIncompatibles?.map(item => `<li>${item}</li>`).join('') || '<li class="no-data">No se especificaron condiciones incompatibles.</li>';

        // Generate características especiales HTML (toggles)
        const toggles = cargo.togglesEspeciales || {};
        const caracteristicasEspeciales = [];

        if (toggles.trabajaAlturas) {
            caracteristicasEspeciales.push({
                icono: 'fa-hard-hat',
                titulo: 'Trabajo en Alturas',
                descripcion: 'El cargo implica trabajo en alturas (≥1.5m). Requiere certificación según Res. 4272/2021.',
                examenes: 'Examen médico con énfasis osteomuscular para alturas (EMOA), Glicemia, Perfil Lipídico, Electrocardiograma, Espirometría',
                normativa: 'Resolución 1409/2012 y 4272/2021'
            });
        }

        if (toggles.conduceVehiculo) {
            caracteristicasEspeciales.push({
                icono: 'fa-car',
                titulo: 'Conduce Vehículo',
                descripcion: 'El cargo requiere conducción de vehículos como parte de sus funciones.',
                examenes: 'Examen Psicosensométrico (PSM), Glicemia, Perfil Lipídico',
                normativa: 'Resolución 1565/2014 (PESV) y Ley 1383/2010'
            });
        }

        if (toggles.manipulaAlimentos) {
            caracteristicasEspeciales.push({
                icono: 'fa-utensils',
                titulo: 'Manipulación de Alimentos',
                descripcion: 'El cargo involucra manipulación directa de alimentos para consumo humano.',
                examenes: 'Examen médico con énfasis en manipulación de alimentos (EMOMP), Frotis de Garganta, KOH, Coprológico',
                normativa: 'Resolución 2674/2013'
            });
        }

        if (toggles.trabajaEspaciosConfinados) {
            caracteristicasEspeciales.push({
                icono: 'fa-door-closed',
                titulo: 'Trabajo en Espacios Confinados',
                descripcion: 'El cargo implica ingreso a espacios confinados (tanques, silos, pozos, túneles, etc.).',
                examenes: 'EMO, Espirometría, Electrocardiograma, Glicemia, Perfil Lipídico, Psicosensométrico',
                normativa: 'Resolución 0491/2020 y NTC 4116'
            });
        }

        const caracteristicasHTML = caracteristicasEspeciales.length > 0
            ? caracteristicasEspeciales.map(c => `
                <div class="caracteristica-especial-item">
                    <div class="caracteristica-header">
                        <i class="fas ${c.icono}"></i>
                        <h5 class="caracteristica-titulo">${c.titulo}</h5>
                    </div>
                    <p class="caracteristica-descripcion">${c.descripcion}</p>
                    <div class="caracteristica-detalles">
                        <p><strong>Exámenes requeridos:</strong> ${c.examenes}</p>
                        <p><strong>Normativa aplicable:</strong> ${c.normativa}</p>
                    </div>
                </div>
            `).join('')
            : '';

        // Estructura de ficha dividida en páginas para impresión:
        // PÁGINA 1: Info + GES + Factores de Riesgo
        // PÁGINA 2: Exámenes + EPP + Aptitudes + Condiciones Incompatibles
        return `
            <!-- PÁGINA 1 DE FICHA: Identificación de Riesgos -->
            <div class="cargo-ficha cargo-ficha-pagina-1">
                <div class="cargo-header">
                    <div class="cargo-numero">FICHA N°: ${String(fichaNum).padStart(3, '0')}</div>
                    <h3 class="cargo-nombre">${cargo.nombre || 'Cargo sin nombre'}</h3>
                </div>

                <div class="cargo-info-grid">
                    <div class="cargo-info-item">
                        <span class="info-label">Área:</span>
                        <span class="info-value">${cargo.area || 'N/A'}</span>
                    </div>
                    <div class="cargo-info-item">
                        <span class="info-label">N° Trabajadores:</span>
                        <span class="info-value">${cargo.numTrabajadores || 'N/A'}</span>
                    </div>
                    <div class="cargo-info-item">
                        <span class="info-label">Nivel de Riesgo ARL:</span>
                        <span class="info-value badge-risk">${cargo.nivelRiesgoARL || 'N/A'}</span>
                    </div>
                </div>

                ${caracteristicasHTML ? `
                <div class="cargo-section caracteristicas-especiales-section">
                    <h4 class="cargo-section-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        Características Especiales del Cargo
                    </h4>
                    <p class="section-subtitle">Condiciones especiales que requieren exámenes y controles específicos según normativa vigente</p>
                    <div class="caracteristicas-especiales-list">
                        ${caracteristicasHTML}
                    </div>
                </div>
                ` : ''}

                <div class="cargo-section">
                    <h4 class="cargo-section-title">Descripción del cargo</h4>
                    <p class="cargo-descripcion">${cargo.descripcion || 'No disponible'}</p>
                </div>

                ${gesIdentificadosHTML ? `
                <div class="cargo-section">
                    <h4 class="cargo-section-title">GES Identificados (Grupos de Exposición Similar)</h4>
                    <p class="section-subtitle">Listado completo de riesgos identificados para este cargo con sus niveles calculados según GTC-45</p>
                    <div class="ges-identificados-list">
                        ${gesIdentificadosHTML}
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- PÁGINA 2 DE FICHA: Protocolo Médico y Controles -->
            <div class="cargo-ficha cargo-ficha-pagina-2">
                <div class="cargo-header cargo-header-continuacion">
                    <div class="cargo-numero">FICHA N°: ${String(fichaNum).padStart(3, '0')} (Continuación)</div>
                    <h3 class="cargo-nombre">${cargo.nombre || 'Cargo sin nombre'}</h3>
                </div>

                <div class="cargo-section">
                    <h4 class="cargo-section-title">Exámenes Médicos Ocupacionales</h4>
                    <table class="examenes-table">
                        <thead>
                            <tr>
                                <th>Examen</th>
                                <th class="check-header">Ingreso</th>
                                <th class="check-header">Periódico</th>
                                <th class="check-header">Retiro</th>
                                <th>Periodicidad</th>
                                <th>Justificación</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${examenesHTML}
                        </tbody>
                    </table>
                </div>

                <div class="cargo-section">
                    <h4 class="cargo-section-title">Elementos de Protección Personal (EPP)</h4>
                    <ul class="epp-list">
                        ${eppHTML}
                    </ul>
                </div>

                <div class="cargo-section">
                    <h4 class="cargo-section-title">Aptitudes Requeridas</h4>
                    <ul class="aptitudes-list">
                        ${aptitudesHTML}
                    </ul>
                </div>

                <div class="cargo-section">
                    <h4 class="cargo-section-title">Condiciones de Salud Incompatibles</h4>
                    <ul class="incompatibles-list">
                        ${incompatiblesHTML}
                    </ul>
                </div>
            </div>
        `;
    }

    setDates() {
        const today = new Date();
        const dateString = today.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const elaboracionEl = document.getElementById('fecha-elaboracion');
        if (elaboracionEl) {
            elaboracionEl.textContent = dateString;
        }

        // Vigencia: 1 year from today
        const vigencia = new Date(today);
        vigencia.setFullYear(vigencia.getFullYear() + 1);
        const vigenciaString = vigencia.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        const vigenciaEl = document.getElementById('fecha-vigencia');
        if (vigenciaEl) {
            vigenciaEl.textContent = vigenciaString;
        }

        // Revision: same as vigencia
        const revisionEl = document.getElementById('fecha-revision');
        if (revisionEl) {
            revisionEl.textContent = vigenciaString;
        }
    }
}

// Initialize when DOM is ready
const viewer = new ProfesiogramaViewer();

export default ProfesiogramaViewer;
