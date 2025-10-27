// client/src/js/components/resultadosComponent.js

export function initResultadosPage() {
    console.log('🚀 Inicializando página de resultados...');
    
    // Elementos DOM principales
    const loaderContainer = document.getElementById('loader-container');
    const resultsContainer = document.getElementById('results-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    // Validación de elementos críticos
    if (!loaderContainer || !resultsContainer || !errorContainer) {
        console.error('❌ Faltan elementos DOM esenciales');
        document.body.innerHTML = '<p style="padding:20px;color:red;">Error: Página no cargada correctamente.</p>';
        return;
    }

    // Buscar o crear contenedor de documentos
    let documentList = resultsContainer.querySelector('.document-list');
    if (!documentList) {
        console.warn('⚠️ .document-list no existe, creando...');
        documentList = document.createElement('ul');
        documentList.className = 'document-list';
        documentList.id = 'document-list';
        
        // Insertar después del header
        const resultsHeader = resultsContainer.querySelector('.results-header');
        if (resultsHeader && resultsHeader.nextSibling) {
            resultsContainer.insertBefore(documentList, resultsHeader.nextSibling);
        } else if (resultsHeader) {
            resultsHeader.after(documentList);
        } else {
            resultsContainer.appendChild(documentList);
        }
    }

    // Obtener token de la URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        showError('No se proporcionó un token de documento válido.');
        return;
    }

    console.log('🔑 Token encontrado:', token);

    let pollingInterval = null;

    // ============================================
    // FUNCIONES DE ESTADO DE UI
    // ============================================
    function showLoader(message = 'Consultando estado...') {
        console.log('⏳ Mostrando loader:', message);
        loaderContainer.classList.add('active');
        resultsContainer.classList.remove('active');
        errorContainer.classList.remove('active');
        
        const loaderMsg = loaderContainer.querySelector('p');
        if (loaderMsg) loaderMsg.textContent = message;
    }

    function showResults(data) {
        console.log('✅ Mostrando resultados:', data);
        loaderContainer.classList.remove('active');
        resultsContainer.classList.add('active');
        errorContainer.classList.remove('active');

        const status = data.status;
        const urls = data.urls || {};

        // Actualizar mensaje de estado
        const statusMessageElement = document.getElementById('status-message');
        if (statusMessageElement) {
            statusMessageElement.textContent = status === 'pagado'
                ? '¡Pago completado! Tus documentos están listos para descargar.'
                : 'Tus documentos han sido generados. Haz clic en descargar para obtenerlos.';
        }

        // Limpiar lista
        documentList.innerHTML = '';

        // Configuración de documentos
        const docTypes = [
            { key: 'matriz', name: 'Matriz de Riesgos', icon: '📊' },
            { key: 'profesiograma', name: 'Profesiograma', icon: '🩺' },
            { key: 'perfil', name: 'Perfil de Cargo', icon: '👤' }
        ];

        docTypes.forEach(docType => {
            const url = urls[docType.key];
            const docItem = document.createElement('li');
            docItem.className = 'document-item';

            let buttonHtml = '';
            if (url) {
                buttonHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="btn-download cta-button">Descargar</a>`;
            } else {
                buttonHtml = `<span class="text-red-500 text-sm italic">No disponible</span>`;
            }

            docItem.innerHTML = `
                <span class="document-icon">${docType.icon}</span>
                <span class="document-name">${docType.name}</span>
                ${buttonHtml}
            `;
            
            documentList.appendChild(docItem);
            console.log(`📄 Agregado: ${docType.name} - URL: ${url ? 'Disponible' : 'No disponible'}`);
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
    async function checkDocumentStatus() {
        console.log('🔄 Polling status para token:', token);

        try {
            const apiUrl = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1'
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

                // Detener polling si el estado es final
                if (data.status === 'pagado' || data.status === 'completed' || data.status === 'failed') {
                    console.log(`✅ Estado final: ${data.status}. Deteniendo polling.`);
                    clearInterval(pollingInterval);
                    
                    if (data.status === 'failed') {
                        showError('La generación de documentos ha fallado. Contacta a soporte.');
                    }
                }
            } else {
                throw new Error(data.message || 'Respuesta inválida del servidor.');
            }

        } catch (error) {
            console.error('❌ Error en polling:', error);
            clearInterval(pollingInterval);
            showError(`No se pudo verificar el estado: ${error.message}. Por favor, recarga la página.`);
        }
    }

    // ============================================
    // INICIAR APLICACIÓN
    // ============================================
    showLoader('Generando tus documentos...');
    pollingInterval = setInterval(checkDocumentStatus, 5000);
    checkDocumentStatus(); // Llamada inicial

    console.log('✅ Página de resultados inicializada correctamente');
}
