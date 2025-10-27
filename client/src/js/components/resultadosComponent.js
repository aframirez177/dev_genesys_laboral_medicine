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
    // CLASE: TARJETA DE DOCUMENTO
    // ============================================
    class DocumentCard {
        constructor(config, url, pricing) {
            this.config = config;
            this.url = url;
            this.pricing = pricing;
        }

        render() {
            const card = document.createElement('div');
            card.className = 'document-card';
            card.dataset.key = this.config.key;

            // Calcular precio
            const priceKey = `precio${this.capitalize(this.config.key)}`;
            const price = this.config.isFree ? 0 : (this.pricing[priceKey] || 0);
            const isAvailable = Boolean(this.url);

            // HTML de la tarjeta
            card.innerHTML = `
                <div class="card-thumbnail" style="background: ${this.config.gradient}" ${isAvailable ? `data-url="${this.url}"` : ''}>
                    <span class="card-icon">${this.config.icon}</span>
                    ${isAvailable ? '<div class="preview-overlay">👁️ Vista Previa</div>' : ''}
                </div>
                <div class="card-footer">
                    <h3 class="card-title">${this.config.name}</h3>

                    ${!this.config.isFree ? `
                        <div class="card-pricing">
                            <p class="price-unit">COP$ ${(this.pricing.precioBase || 30000).toLocaleString('es-CO')} × ${this.pricing.numCargos || 0}</p>
                            <p class="price-total">Total: ${this.formatCurrency(price)}</p>
                        </div>
                    ` : '<p class="price-free">✅ GRATIS</p>'}

                    <div class="card-status">
                        ${this.config.isFree ?
                            '<span class="badge badge-free">Disponible</span>' :
                            '<span class="badge badge-locked">🔒 Pago requerido</span>'
                        }
                    </div>

                    <div class="card-actions">
                        ${!this.config.isFree ? `
                            <button class="btn-cart btn-icon" data-action="cart" title="Agregar al carrito">
                                🛒
                            </button>
                        ` : ''}
                        <button class="btn-download btn-icon" ${!isAvailable ? 'disabled' : ''} data-action="download" title="Descargar">
                            ⬇
                        </button>
                    </div>
                </div>
            `;

            // Event Listeners
            if (isAvailable) {
                const thumbnail = card.querySelector('.card-thumbnail');
                thumbnail.addEventListener('click', () => this.openPreview());
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
            const card = new DocumentCard(docConfig, url, metadata.pricing || {});
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
