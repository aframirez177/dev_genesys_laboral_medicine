// client/src/js/components/resultadosComponent.js
// REESCRITO DESDE CERO - Diseño premium con carrito y metadata

export function initResultadosPage() {
    console.log('🚀 Inicializando página de resultados premium...');

    // ============================================
    // CONFIGURACIÓN DE DOCUMENTOS
    // ============================================
    const DOCUMENTS_CONFIG = [
        {
            key: 'matriz',
            name: 'Matriz de Riesgos',
            icon: '📊',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            isFree: false
        },
        {
            key: 'profesiograma',
            name: 'Profesiograma',
            icon: '🩺',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            isFree: false
        },
        {
            key: 'perfil',
            name: 'Perfil de Cargo',
            icon: '👤',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            isFree: false
        },
        {
            key: 'cotizacion',
            name: 'Cotización de Exámenes',
            icon: '💰',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            isFree: true
        }
    ];

    // ============================================
    // ELEMENTOS DOM
    // ============================================
    const loaderContainer = document.getElementById('loader-container');
    const resultsContainer = document.getElementById('results-container');
    const errorContainer = document.getElementById('error-container');
    const documentsGrid = document.getElementById('documents-grid');
    const cartContainer = document.getElementById('cart-container');
    const errorMessage = document.getElementById('error-message');

    // Validación de elementos críticos
    if (!loaderContainer || !resultsContainer || !errorContainer || !documentsGrid) {
        console.error('❌ Faltan elementos DOM esenciales');
        document.body.innerHTML = '<p style="padding:20px;color:red;">Error: Página no cargada correctamente.</p>';
        return;
    }

    // ============================================
    // CLASE: CARRITO DE COMPRAS
    // ============================================
    class ShoppingCart {
        constructor() {
            this.items = [];
            this.countElement = document.getElementById('cart-count');
            this.totalElement = document.getElementById('cart-total');
            this.payButton = document.getElementById('proceed-payment-btn');

            if (this.payButton) {
                this.payButton.addEventListener('click', () => this.handlePayment());
            }
        }

        add(docKey, docName, price) {
            // Evitar duplicados
            if (!this.items.find(item => item.key === docKey)) {
                this.items.push({ key: docKey, name: docName, price });
                this.updateUI();
                console.log(`🛒 Agregado al carrito: ${docName} - ${this.formatCurrency(price)}`);
            }
        }

        remove(docKey) {
            const item = this.items.find(i => i.key === docKey);
            this.items = this.items.filter(item => item.key !== docKey);
            this.updateUI();
            console.log(`🗑️ Removido del carrito: ${item?.name || docKey}`);
        }

        toggle(docKey, docName, price) {
            const exists = this.items.find(item => item.key === docKey);
            if (exists) {
                this.remove(docKey);
                return false; // No está en carrito
            } else {
                this.add(docKey, docName, price);
                return true; // Está en carrito
            }
        }

        getTotal() {
            return this.items.reduce((sum, item) => sum + item.price, 0);
        }

        updateUI() {
            if (this.countElement) {
                this.countElement.textContent = this.items.length;
            }
            if (this.totalElement) {
                this.totalElement.textContent = this.formatCurrency(this.getTotal());
            }

            // Mostrar/ocultar carrito
            if (cartContainer) {
                cartContainer.style.display = this.items.length > 0 ? 'block' : 'none';
            }
        }

        formatCurrency(amount) {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            }).format(amount);
        }

        handlePayment() {
            console.log('🛒 Iniciando pago con:', this.items);
            console.log('💰 Total:', this.getTotal());

            // TODO: Integrar con PayU en el futuro
            alert(`Función de pago en desarrollo.\n\nTotal: ${this.formatCurrency(this.getTotal())}\nDocumentos: ${this.items.map(i => i.name).join(', ')}`);
        }
    }

    const cart = new ShoppingCart();

    // ============================================
    // CLASE: TARJETA DE DOCUMENTO (REDISEÑADA)
    // ============================================
    class DocumentCard {
        constructor(config, url, pricing, metadata) {
            this.config = config;
            this.url = url;
            this.pricing = pricing;
            this.metadata = metadata;
        }

        render() {
            const card = document.createElement('div');
            card.className = 'document-card';
            card.dataset.key = this.config.key;

            // Calcular precio
            const priceKey = `precio${this.capitalize(this.config.key)}`;
            const price = this.config.isFree ? 0 : (this.pricing[priceKey] || 0);
            const isAvailable = Boolean(this.url);
            const pricePerCargo = this.pricing.precioBase || 30000;
            const numCargos = this.pricing.numCargos || 0;

            // HTML de la tarjeta (nuevo diseño basado en mockup)
            card.innerHTML = `
                <!-- Barra superior con precio o "Gratis!" -->
                <div class="card-price-banner ${this.config.isFree ? 'free' : 'paid'}">
                    ${this.config.isFree
                        ? '<span class="price-text">Gratis!</span>'
                        : `<span class="price-text">COP$${pricePerCargo.toLocaleString('es-CO')} <span class="price-multiplier">X cargo</span></span>`
                    }
                </div>

                <!-- Thumbnail del documento -->
                <div class="card-thumbnail-wrapper" ${isAvailable ? `data-url="${this.url}"` : ''}>
                    ${isAvailable
                        ? `<img src="${this.url}" alt="Preview ${this.config.name}" class="card-thumbnail-image" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                           <div class="card-thumbnail-fallback" style="background: ${this.config.gradient}; display: none;">
                               <span class="card-icon">${this.config.icon}</span>
                           </div>`
                        : `<div class="card-thumbnail-placeholder" style="background: ${this.config.gradient};">
                               <span class="card-icon">${this.config.icon}</span>
                           </div>`
                    }
                    ${isAvailable ? '<div class="thumbnail-overlay">👁️ Vista Previa</div>' : ''}
                </div>

                <!-- Cuerpo de la tarjeta -->
                <div class="card-body">
                    <h3 class="card-document-title">${this.config.name.toUpperCase()}</h3>

                    <div class="card-info-section">
                        <p class="card-cargo-info"><strong>Perfil del Cargo:</strong> ${this.getCargoExample()}</p>
                        <p class="card-area-info"><strong>Área/Proceso:</strong> ${this.metadata.nombreEmpresa || 'N/A'}</p>
                    </div>

                    <div class="card-risk-section">
                        <h4 class="risk-section-title">Resumen del Cargo y Riesgos Identificados</h4>
                        <p class="risk-section-content">${this.getRiskDescription()}</p>
                    </div>

                    <!-- Footer con metadata -->
                    <div class="card-footer-metadata">
                        <div class="metadata-row">
                            <span class="metadata-label">${this.config.name}</span>
                        </div>
                        <div class="metadata-row">
                            <span class="metadata-company">${this.metadata.nombreEmpresa || 'N/A'}</span>
                        </div>
                        <div class="metadata-row">
                            <span class="metadata-detail"># de cargos: ${numCargos}</span>
                            <span class="metadata-detail">ratizado ${this.getFormattedDate()}</span>
                        </div>
                    </div>

                    <!-- Iconos de acción -->
                    <div class="card-actions">
                        ${!this.config.isFree ? `
                            <button class="btn-icon btn-cart" data-action="cart" title="Agregar al carrito" aria-label="Agregar al carrito">
                                <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 2H10L15.36 28.78C15.5429 29.7008 16.0438 30.5279 16.7751 31.1166C17.5064 31.7053 18.4214 32.018 19.36 32H38.8C39.7386 32.018 40.6536 31.7053 41.3849 31.1166C42.1162 30.5279 42.6171 29.7008 42.8 28.78L46 12H12M20 42C20 43.1046 19.1046 44 18 44C16.8954 44 16 43.1046 16 42C16 40.8954 16.8954 40 18 40C19.1046 40 20 40.8954 20 42ZM42 42C42 43.1046 41.1046 44 40 44C38.8954 44 38 43.1046 38 42C38 40.8954 38.8954 40 40 40C41.1046 40 42 40.8954 42 42Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn-icon btn-download" ${!isAvailable ? 'disabled' : ''} data-action="download" title="Descargar" aria-label="Descargar documento">
                            <svg width="24" height="24" viewBox="0 0 57 57" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M28.5 38L16.625 26.125L19.95 22.6813L26.125 28.8563V9.5H30.875V28.8563L37.05 22.6813L40.375 26.125L28.5 38ZM14.25 47.5C12.9437 47.5 11.8255 47.0349 10.8953 46.1047C9.9651 45.1745 9.5 44.0563 9.5 42.75V35.625H14.25V42.75H42.75V35.625H47.5V42.75C47.5 44.0563 47.0349 45.1745 46.1047 46.1047C45.1745 47.0349 44.0563 47.5 42.75 47.5H14.25Z" fill="currentColor"/>
                            </svg>
                        </button>
                        ${!this.config.isFree ? `
                            <div class="btn-icon btn-lock" title="Pago requerido" aria-label="Pago requerido">
                                <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 22V14C14 11.3478 15.0536 8.8043 16.9289 6.92893C18.8043 5.05357 21.3478 4 24 4C26.6522 4 29.1957 5.05357 31.0711 6.92893C32.9464 8.8043 34 11.3478 34 14V22M10 22H38C40.2091 22 42 23.7909 42 26V40C42 42.2091 40.2091 44 38 44H10C7.79086 44 6 42.2091 6 40V26C6 23.7909 7.79086 22 10 22Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            // Event Listeners
            if (isAvailable) {
                const thumbnail = card.querySelector('.card-thumbnail-wrapper');
                thumbnail.addEventListener('click', () => this.openPreview());
                thumbnail.style.cursor = 'pointer';
            }

            const cartBtn = card.querySelector('[data-action="cart"]');
            if (cartBtn) {
                cartBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const inCart = cart.toggle(this.config.key, this.config.name, price);
                    cartBtn.classList.toggle('active', inCart);
                });
            }

            const downloadBtn = card.querySelector('[data-action="download"]');
            if (downloadBtn && isAvailable) {
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.download();
                });
            }

            return card;
        }

        getCargoExample() {
            const examples = {
                'matriz': 'Operario de producción',
                'profesiograma': 'Gestor de marketing',
                'perfil': 'Analista de sistemas',
                'cotizacion': 'Varios cargos'
            };
            return examples[this.config.key] || 'Cargo general';
        }

        getRiskDescription() {
            const descriptions = {
                'matriz': 'Riesgos identificados: físicos, químicos, ergonómicos. Nivel de exposición: medio-alto.',
                'profesiograma': 'Descripción de tareas: editar videos, realizar campañas, coordinación de equipos.',
                'perfil': 'Aptitudes requeridas: análisis de datos, comunicación efectiva, trabajo en equipo.',
                'cotizacion': 'Cotización detallada de exámenes médicos ocupacionales según perfil de riesgo.'
            };
            return descriptions[this.config.key] || 'Documento generado con información detallada del cargo.';
        }

        getFormattedDate() {
            const fecha = new Date(this.metadata.fechaGeneracion || Date.now());
            return `${fecha.getDate()} ${fecha.toLocaleString('es-CO', { month: 'short' })} ${fecha.getFullYear()}`;
        }

        capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        formatCurrency(amount) {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            }).format(amount);
        }

        openPreview() {
            if (this.url) {
                console.log(`👁️ Abriendo preview: ${this.config.name}`);
                window.open(this.url, '_blank', 'noopener,noreferrer');
            }
        }

        download() {
            if (this.url) {
                console.log(`⬇ Descargando: ${this.config.name}`);
                const link = document.createElement('a');
                link.href = this.url;
                const extension = this.config.key === 'matriz' ? 'xlsx' : 'pdf';
                link.download = `${this.config.key}.${extension}`;
                link.target = '_blank';
                link.click();
            }
        }
    }

    // ============================================
    // FUNCIONES DE ESTADO UI
    // ============================================
    function showLoader(message = 'Generando tus documentos...') {
        console.log('⏳ Mostrando loader:', message);
        loaderContainer.classList.add('active');
        resultsContainer.classList.remove('active');
        errorContainer.classList.remove('active');

        const loaderText = loaderContainer.querySelector('h1');
        if (loaderText) loaderText.textContent = message;
    }

    function showResults(data) {
        console.log('✅ Mostrando resultados:', data);
        loaderContainer.classList.remove('active');
        resultsContainer.classList.add('active');
        errorContainer.classList.remove('active');

        // ============================================
        // ACTUALIZAR METADATA
        // ============================================
        const metadata = data.metadata || {};

        const empresaNombre = document.getElementById('empresa-nombre');
        const numCargos = document.getElementById('num-cargos');
        const nombreResponsable = document.getElementById('nombre-responsable');
        const fechaGeneracion = document.getElementById('fecha-generacion');

        if (empresaNombre) empresaNombre.textContent = metadata.nombreEmpresa || 'N/A';
        if (numCargos) numCargos.textContent = metadata.numCargos || '0';
        if (nombreResponsable) nombreResponsable.textContent = metadata.nombreResponsable || 'N/A';

        if (fechaGeneracion && metadata.fechaGeneracion) {
            const fecha = new Date(metadata.fechaGeneracion);
            fechaGeneracion.textContent = fecha.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // ============================================
        // RENDERIZAR TARJETAS
        // ============================================
        documentsGrid.innerHTML = ''; // Limpiar

        DOCUMENTS_CONFIG.forEach(docConfig => {
            const url = data.urls[docConfig.key];
            const card = new DocumentCard(docConfig, url, metadata.pricing || {}, metadata);
            const cardElement = card.render();
            documentsGrid.appendChild(cardElement);

            console.log(`📄 Tarjeta creada: ${docConfig.name} - URL: ${url ? 'Disponible' : 'No disponible'}`);
        });
    }

    function showError(message) {
        console.error('❌ Mostrando error:', message);
        loaderContainer.classList.remove('active');
        resultsContainer.classList.remove('active');
        errorContainer.classList.add('active');

        if (errorMessage) {
            errorMessage.textContent = message || 'Ha ocurrido un error inesperado.';
        }
    }

    // ============================================
    // POLLING - CONSULTAR ESTADO
    // ============================================
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        showError('No se proporcionó un token de documento válido. Verifica la URL.');
        return;
    }

    console.log('🔑 Token encontrado:', token);

    let pollingInterval = null;

    async function checkDocumentStatus() {
        console.log('🔄 Polling status para token:', token);

        try {
            const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3000'
                : '';

            const response = await fetch(`${apiUrl}/api/documentos/status/${token}`);
            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error ${response.status}:`, errorText);
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Data recibida:', data);

            if (data.success) {
                showResults(data);

                // Detener polling en estados finales
                const finalStates = ['pagado', 'completed', 'failed'];
                if (finalStates.includes(data.status)) {
                    console.log(`✅ Estado final alcanzado: ${data.status}. Deteniendo polling.`);
                    clearInterval(pollingInterval);

                    if (data.status === 'failed') {
                        showError('La generación de documentos ha fallado. Por favor, contacta a soporte.');
                    }
                } else {
                    console.log(`⏳ Estado: ${data.status}. Continuando polling...`);
                }
            } else {
                throw new Error(data.message || 'Respuesta inválida del servidor.');
            }

        } catch (error) {
            console.error('❌ Error fatal durante el sondeo:', error);
            clearInterval(pollingInterval);
            showError(`No se pudo verificar el estado: ${error.message}. Por favor, recarga la página.`);
        }
    }

    // ============================================
    // INICIAR APLICACIÓN
    // ============================================
    showLoader('Generando tus documentos...');

    // Polling cada 5 segundos
    pollingInterval = setInterval(checkDocumentStatus, 5000);

    // Llamada inicial inmediata
    checkDocumentStatus();

    console.log('✅ Página de resultados premium inicializada correctamente');
}
