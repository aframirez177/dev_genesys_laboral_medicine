document.addEventListener('DOMContentLoaded', () => {

    const loaderContainer = document.getElementById('loader-container');
    const resultsContainer = document.getElementById('results-container');
    const errorContainer = document.getElementById('error-container');
    const documentList = document.querySelector('.document-list');
    const errorMessage = document.getElementById('error-message');

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

    function showError(message) {
        loaderContainer.classList.remove('active');
        resultsContainer.classList.remove('active');
        errorContainer.classList.add('active');
        errorMessage.textContent = message || 'Ha ocurrido un error inesperado.';
    }

    // --- Lógica de sondeo (Polling) ---
    async function checkDocumentStatus() {
        try {
            // NOTA: Esta ruta '/api/documentos/status/:token' la crearemos en el backend
            const response = await fetch(`/api/documentos/status/${token}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'completed') {
                clearInterval(pollingInterval); // Detener el sondeo
                showResults(data.documents);
            } else if (data.status === 'failed') {
                clearInterval(pollingInterval); // Detener el sondeo
                showError(data.message || 'La generación de documentos ha fallado.');
            }
            // Si el estado es 'pending', no hacemos nada y dejamos que el polling continúe.

        } catch (error) {
            console.error('Error durante el sondeo:', error);
            clearInterval(pollingInterval); // Detener en caso de error de red/fatal
            showError(error.message);
        }
    }

    // Iniciar el sondeo
    showLoader();
    const pollingInterval = setInterval(checkDocumentStatus, 3000); // Consultar cada 3 segundos
    checkDocumentStatus(); // Llamada inicial inmediata
}); 