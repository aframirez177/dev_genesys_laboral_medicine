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
        // Get profesiograma ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

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
        // Get profesiograma ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (!id) {
            console.warn('No profesiograma ID in URL');
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
            const cargoHTML = this.generateCargoHTML(cargo, index + 1);
            container.innerHTML += cargoHTML;
        });
    }

    /**
     * Generate HTML for a single cargo
     */
    generateCargoHTML(cargo, fichaNum) {
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

        // Generate factores de riesgo HTML
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
            </div>
        `).join('') || '<p class="no-data">No se identificaron factores de riesgo específicos.</p>';

        // Generate examenes HTML
        const examenesHTML = cargo.examenes?.map(examen => `
            <tr>
                <td>${examen.nombre || ''}</td>
                <td>${examen.periodicidad || ''}</td>
                <td>${examen.justificacion || ''}</td>
            </tr>
        `).join('') || '<tr><td colspan="3" class="no-data">No se definieron exámenes complementarios.</td></tr>';

        // Generate EPP HTML
        const eppHTML = cargo.epp?.map(item => `<li>${item}</li>`).join('') || '<li class="no-data">No se especificaron EPP.</li>';

        // Generate aptitudes HTML
        const aptitudesHTML = cargo.aptitudes?.map(item => `<li>${item}</li>`).join('') || '<li class="no-data">No se especificaron aptitudes.</li>';

        // Generate condiciones incompatibles HTML
        const incompatiblesHTML = cargo.condicionesIncompatibles?.map(item => `<li>${item}</li>`).join('') || '<li class="no-data">No se especificaron condiciones incompatibles.</li>';

        return `
            <div class="cargo-ficha">
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

                <div class="cargo-section">
                    <h4 class="cargo-section-title">Descripción del cargo</h4>
                    <p class="cargo-descripcion">${cargo.descripcion || 'No disponible'}</p>
                </div>

                <div class="cargo-section">
                    <h4 class="cargo-section-title">Factores de Riesgo Identificados</h4>
                    <div class="factores-riesgo-list">
                        ${factoresHTML}
                    </div>
                </div>

                <div class="cargo-section">
                    <h4 class="cargo-section-title">Exámenes Médicos Complementarios</h4>
                    <table class="examenes-table">
                        <thead>
                            <tr>
                                <th>Examen</th>
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
