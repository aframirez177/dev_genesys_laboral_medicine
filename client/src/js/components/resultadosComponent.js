// client/src/js/components/resultadosComponent.js

export function initResultadosPage() {
    // IDs existentes en tu HTML
    const loaderContainer = document.getElementById('loader-container');
    const resultsContainer = document.getElementById('results-container'); // El contenedor principal de resultados
    const errorContainer = document.getElementById('error-container');
    const documentList = resultsContainer.querySelector('.document-list'); // Busca DENTRO de results-container
    const errorMessage = document.getElementById('error-message');

    // IDs que añadiremos/buscaremos (si no existen, los creamos o adaptamos)
    let paymentButtonContainer = document.getElementById('payment-button-container');
    let statusMessageElement = document.getElementById('status-message'); // Podría estar dentro del loader o results

    // --- Verificación robusta de elementos ---
    let missingElements = [];
    if (!loaderContainer) missingElements.push('loader-container');
    if (!resultsContainer) missingElements.push('results-container');
    if (!errorContainer) missingElements.push('error-container');
    if (!documentList) missingElements.push('.document-list within results-container');
    if (!errorMessage) missingElements.push('error-message');

    if (missingElements.length > 0) {
        console.error('Faltan elementos de UI esenciales en resultados.html:', missingElements.join(', '));
        document.body.innerHTML = `<p style="color: red; padding: 20px;">Error: La página de resultados no se cargó correctamente. Faltan elementos: ${missingElements.join(', ')}.</p>`;
        return;
    }

    // --- Crear elementos faltantes si es necesario (o adaptar a tu HTML) ---
    // Si no tienes un sitio específico para el mensaje de estado, lo añadimos antes de la lista
    if (!statusMessageElement) {
        statusMessageElement = document.createElement('p');
        statusMessageElement.id = 'status-message';
        statusMessageElement.className = 'text-lg text-center mb-4 text-gray-700'; // Estilos de ejemplo
        resultsContainer.insertBefore(statusMessageElement, documentList); // Insertar antes de la lista
    }

    // Si no tienes un contenedor específico para el botón de pago, lo añadimos después de la lista
    if (!paymentButtonContainer) {
        paymentButtonContainer = document.createElement('div');
        paymentButtonContainer.id = 'payment-button-container';
        paymentButtonContainer.className = 'mt-8 text-center';
        resultsContainer.appendChild(paymentButtonContainer); // Añadir al final
    }
    // --- Fin creación/adaptación ---


    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        showError('No se proporcionó un token de documento válido.');
        return;
    }

    let pollingInterval = null;

    function showLoader(message = 'Consultando estado...') {
        loaderContainer.style.display = 'block'; // Mostrar loader
        resultsContainer.style.display = 'none'; // Ocultar resultados
        errorContainer.style.display = 'none'; // Ocultar error
        // Actualiza el mensaje DENTRO del loader si existe, si no, no hace nada
        const loaderMsg = loaderContainer.querySelector('p'); // Asume que hay un <p> dentro
        if (loaderMsg) loaderMsg.textContent = message;
    }

    // --- FUNCIÓN showResults ADAPTADA ---
    // Recibe el objeto { status: '...', urls: {...} }
    function showResultsUI(data) {
        loaderContainer.style.display = 'none'; // Ocultar loader
        resultsContainer.style.display = 'block'; // Mostrar resultados
        errorContainer.style.display = 'none'; // Ocultar error

        const status = data.status;
        const urls = data.urls || {}; // Asegura que urls sea un objeto

        if (statusMessageElement) {
            statusMessageElement.textContent = status === 'pagado'
                ? '¡Pago completado! Tus documentos están listos para descargar.'
                : 'Tus documentos han sido generados. Realiza el pago para habilitar la descarga.';
        }

        documentList.innerHTML = ''; // Limpiar lista

        const docTypes = [
            { key: 'matriz', name: 'Matriz de Riesgos', icon: '🧾' },
            { key: 'profesiograma', name: 'Profesiograma', icon: '🩺' },
            { key: 'perfil', name: 'Perfil de Cargo', icon: '👤' },
            // { key: 'cotizacion', name: 'Cotización', icon: '💲' } // Descomenta si aplica
        ];

        docTypes.forEach(docType => {
            const url = urls[docType.key];
            const docItem = document.createElement('li'); // Usa 'li' si documentList es 'ul'
            docItem.className = 'document-item bg-gray-100 p-4 rounded shadow flex justify-between items-center mb-3';

            let buttonHtml = '';
            if (url) {
                if (status === 'pagado') {
                    buttonHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200 text-sm font-medium">Descargar</a>`;
                } else {
                    // Mostrar como bloqueado o deshabilitado si no está pagado
                    buttonHtml = `<button disabled class="bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed text-sm font-medium">Descargar (Pago Requerido)</button>`;
                }
            } else {
                buttonHtml = `<span class="text-red-500 text-sm italic">No disponible</span>`;
            }

            docItem.innerHTML = `
                <div class="flex items-center">
                    <span class="text-xl mr-3">${docType.icon}</span>
                    <span class="font-medium text-gray-800">${docType.name}</span>
                </div>
                <div>
                    ${buttonHtml}
                </div>
            `;
            documentList.appendChild(docItem);
        });

        // Botón de Pago
        if (status === 'pendiente_pago') {
            paymentButtonContainer.innerHTML = `
                <button id="payButton" class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md">
                    Pagar $XXX.XXX para Descargar
                </button>`;
            const payButton = document.getElementById('payButton');
            if (payButton) {
                payButton.addEventListener('click', handlePayment);
            }
            paymentButtonContainer.style.display = 'block';
        } else {
            paymentButtonContainer.innerHTML = '';
            paymentButtonContainer.style.display = 'none';
        }
    }

    function showError(message) {
        loaderContainer.style.display = 'none';
        resultsContainer.style.display = 'none';
        errorContainer.style.display = 'block';
        if (errorMessage) {
            errorMessage.textContent = message || 'Ha ocurrido un error inesperado.';
        }
    }

    async function handlePayment() {
        showLoader('Iniciando proceso de pago...');
        try {
            const response = await fetch(`/api/payments/create-order/${token}`, { method: 'POST' });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al crear la orden de pago.');
            }
            const data = await response.json();
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                throw new Error('No se recibió la URL de pago del servidor.');
            }
        } catch (error) {
            console.error('Error en handlePayment:', error);
            showError(`Error al iniciar el pago: ${error.message}`);
        }
    }

    async function checkDocumentStatus() {
        console.log("Polling status...");
        try {
            // Ajusta la URL si tu API está en otro dominio/puerto en desarrollo
            const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3000' // O tu puerto de backend local
                : ''; // Vacío para producción (ruta relativa)
            const response = await fetch(`${apiUrl}/api/documentos/status/${token}`);


            if (!response.ok) {
                const errorText = await response.text(); // Lee el texto para ver el error
                console.error(`Error ${response.status} en polling:`, errorText);
                const errorData = JSON.parse(errorText || '{}'); // Intenta parsear si es JSON
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // SIEMPRE llama a showResultsUI para actualizar la vista
                showResultsUI(data);

                // Detener polling SOLO si el estado es final (pagado o fallido)
                if (data.status === 'pagado' || data.status === 'completed' || data.status === 'failed') {
                    console.log(`Status final: ${data.status}. Stopping polling.`);
                    clearInterval(pollingInterval);
                    if (data.status === 'failed') {
                        // Podrías querer mostrar un mensaje de error más específico aquí si falla
                        showError(data.message || 'La generación de documentos ha fallado.');
                    }
                } else {
                    console.log(`Status: ${data.status}. Continuing poll.`);
                    // Ya no necesitamos mostrar el loader aquí, showResultsUI maneja la vista
                }
            } else {
                throw new Error(data.message || 'Respuesta inválida (success: false).');
            }

        } catch (error) {
            console.error('Error fatal durante el sondeo:', error);
            clearInterval(pollingInterval);
            showError(`No se pudo verificar el estado: ${error.message}. Por favor, recarga la página.`);
        }
    }

    // --- Iniciar ---
    showLoader(); // Muestra el loader al principio
    pollingInterval = setInterval(checkDocumentStatus, 5000); // Consulta cada 5 seg
    checkDocumentStatus(); // Llamada inicial
}