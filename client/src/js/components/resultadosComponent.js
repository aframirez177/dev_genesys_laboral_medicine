// client/src/js/components/resultadosComponent.js

export function initResultadosPage() {

    const loaderContainer = document.getElementById('loader-container');
    const resultsContainer = document.getElementById('results-container');
    const errorContainer = document.getElementById('error-container');
    const documentList = document.querySelector('.document-list');
    const errorMessage = document.getElementById('error-message');

    if (!loaderContainer || !resultsContainer || !errorContainer) {
        console.error('Elementos de UI para la página de resultados no encontrados.');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        showError('No se proporcionó un token de documento válido.');
        return;
    }

    // --- Funciones de UI ---
    function showLoader() {
        loaderContainer.classList.add('active');
        resultsContainer.classList.remove('active');
        errorContainer.classList.remove('active');
    }

    function showResults(documents) {
        loaderContainer.classList.remove('active');
        resultsContainer.classList.add('active');
        errorContainer.classList.remove('active');
        
        if (documentList) {
            documentList.innerHTML = ''; // Limpiar lista anterior
            documents.forEach(doc => {
                const docItem = document.createElement('div');
                docItem.className = 'document-item';
                docItem.innerHTML = `
                    <span class="document-icon">📄</span>
                    <span class="document-name">${doc.name}</span>
                    <a href="${doc.url}" class="btn-download cta-button" download>Descargar</a>
                `;
                documentList.appendChild(docItem);
            });
        }
    }

    function showError(message) {
        loaderContainer.classList.remove('active');
        resultsContainer.classList.remove('active');
        errorContainer.classList.add('active');
        if (errorMessage) {
            errorMessage.textContent = message || 'Ha ocurrido un error inesperado.';
        }
    }

    // --- Lógica de sondeo (Polling) ---
    async function checkDocumentStatus() {
        try {
            const response = await fetch(`/api/documentos/status/${token}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'completed') {
                clearInterval(pollingInterval);
                showResults(data.documents);
            } else if (data.status === 'failed') {
                clearInterval(pollingInterval);
                showError(data.message || 'La generación de documentos ha fallado.');
            }

        } catch (error) {
            console.error('Error durante el sondeo:', error);
            clearInterval(pollingInterval);
            showError(error.message);
        }
    }

    // Iniciar el sondeo
    showLoader();
    const pollingInterval = setInterval(checkDocumentStatus, 3000);
    checkDocumentStatus(); // Llamada inicial
} 