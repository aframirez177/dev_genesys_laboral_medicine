// client/src/js/components/resultadosComponent.js

export function initResultadosPage() {
    const loaderContainer = document.getElementById('loader-container');
    const resultsContainer = document.getElementById('results-container');
    const errorContainer = document.getElementById('error-container');
    const documentList = document.querySelector('.document-list'); // UL o DIV donde van los docs
    const paymentButtonContainer = document.getElementById('payment-button-container'); // Contenedor para el botón Pagar
    const statusMessage = document.getElementById('status-message'); // Elemento para mostrar estado (ej. Procesando, Listo)
    const errorMessage = document.getElementById('error-message');

    // Verifica que todos los elementos necesarios existan
    if (!loaderContainer || !resultsContainer || !errorContainer || !documentList || !paymentButtonContainer || !statusMessage) {
        console.error('Faltan elementos de UI esenciales en resultados.html.');
        // Muestra un error genérico si faltan elementos
        document.body.innerHTML = '<p style="color: red; padding: 20px;">Error: La página de resultados no se cargó correctamente. Faltan elementos esenciales.</p>';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        showError('No se proporcionó un token de documento válido.');
        return;
    }

    let pollingInterval = null; // Variable para guardar el ID del intervalo

    // --- Funciones de UI ---
    function showLoader(message = 'Consultando estado...') {
        loaderContainer.classList.add('active');
        resultsContainer.classList.remove('active');
        errorContainer.classList.remove('active');
        if (statusMessage) statusMessage.textContent = message; // Mostrar mensaje en loader
    }

    // --- FUNCIÓN MODIFICADA ---
    // Recibe el objeto { status: '...', urls: {...} } completo
    function showResults(data) {
        loaderContainer.classList.remove('active');
        resultsContainer.classList.add('active');
        errorContainer.classList.remove('active');

        if (statusMessage) {
            statusMessage.textContent = data.status === 'pagado' ? 'Documentos listos para descargar.' : 'Tus documentos están listos. Realiza el pago para descargarlos.';
        }

        if (documentList) {
            documentList.innerHTML = ''; // Limpiar lista
            const urls = data.urls || {}; // Asegurar que urls sea un objeto

            // Crear elementos para cada documento encontrado en las URLs
            const docTypes = [
                { key: 'matriz', name: 'Matriz de Riesgos', icon: '🧾' }, // Añade iconos o clases
                { key: 'profesiograma', name: 'Profesiograma', icon: '🩺' },
                { key: 'perfil', name: 'Perfil de Cargo', icon: '👤' },
                // { key: 'cotizacion', name: 'Cotización', icon: '💲' } // Si la generas
            ];

            docTypes.forEach(docType => {
                const url = urls[docType.key];
                const docItem = document.createElement('li'); // O 'div' si prefieres
                docItem.className = 'document-item bg-gray-100 p-4 rounded shadow flex justify-between items-center mb-3'; // Clases de ejemplo

                let buttonHtml = '';
                if (url) {
                    if (data.status === 'pagado') {
                        // Botón de Descarga (si está pagado)
                        buttonHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">Descargar</a>`;
                    } else {
                        // Indicador de 'Bloqueado' o 'Requiere Pago'
                        buttonHtml = `<span class="text-gray-500 text-sm italic">(Pago requerido)</span>`;
                    }
                } else {
                    // Mensaje si falta la URL (raro, pero posible)
                    buttonHtml = `<span class="text-red-500 text-sm">No disponible</span>`;
                }

                docItem.innerHTML = `
                    <div class="flex items-center">
                         <span class="text-xl mr-3">${docType.icon}</span>
                         <span>${docType.name}</span>
                    </div>
                    <div>
                         ${buttonHtml}
                    </div>
                `;
                documentList.appendChild(docItem);
            });
        }

        // Mostrar u ocultar botón de pago según el estado
        if (paymentButtonContainer) {
            if (data.status === 'pendiente_pago') {
                paymentButtonContainer.innerHTML = `
                    <button id="payButton" class="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md">
                        Pagar $XXX.XXX para Descargar Documentos
                    </button>`;
                // Añadir event listener al botón de pago
                const payButton = document.getElementById('payButton');
                if (payButton) {
                    payButton.addEventListener('click', handlePayment);
                }
                paymentButtonContainer.style.display = 'block';
            } else {
                paymentButtonContainer.innerHTML = ''; // Vaciar si ya está pagado
                paymentButtonContainer.style.display = 'none';
            }
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

    // --- Lógica de Pago (Placeholder) ---
    async function handlePayment() {
        showLoader('Redirigiendo a la pasarela de pago...'); // Mensaje mientras se obtiene URL
        try {
             // 1. Llamar al backend para crear la orden en PayU
             const response = await fetch(`/api/payments/create-order/${token}`, { method: 'POST' });
             if (!response.ok) {
                 const errData = await response.json();
                 throw new Error(errData.message || 'Error al iniciar el pago.');
             }
             const data = await response.json();

             // 2. Redirigir a la URL de pago de PayU
             if (data.paymentUrl) {
                 window.location.href = data.paymentUrl;
             } else {
                 throw new Error('No se recibió la URL de pago.');
             }

        } catch (error) {
             console.error('Error al procesar el pago:', error);
             showError(`Error al iniciar el pago: ${error.message}`);
        }
    }


    // --- Lógica de sondeo (Polling) MODIFICADA ---
    async function checkDocumentStatus() {
        console.log("Polling status..."); // Log para ver que sigue funcionando
        try {
            const response = await fetch(`/api/documentos/status/${token}`);

            if (!response.ok) {
                 // Si la respuesta es 404 u otro error, detener polling y mostrar error
                const errorData = await response.json().catch(() => ({ message: `Error del servidor: ${response.status}` }));
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            // --- LÓGICA MEJORADA ---
            if (data.success) {
                if (data.status === 'pagado' || data.status === 'completed') { // Acepta 'completed' también por si acaso
                    console.log("Status completed/paid. Stopping polling.");
                    clearInterval(pollingInterval); // Detener polling
                    showResults(data); // Mostrar resultados finales (ya tiene URLs)
                } else if (data.status === 'pendiente_pago') {
                     console.log("Status pending_payment. Displaying results and pay button.");
                     // Si está pendiente de pago, MOSTRAMOS los documentos (sin link de descarga)
                     // y el botón de pago, PERO NO DETENEMOS el polling (por si paga en otra pestaña y vuelve).
                     // Opcional: Podríamos detener el polling aquí si preferimos que solo se actualice al recargar.
                     // clearInterval(pollingInterval); // <--- DESCOMENTA SI QUIERES DETENER POLLING EN PENDIENTE_PAGO
                     showResults(data); // Muestra estado pendiente y botón pagar
                } else if (data.status === 'failed') {
                    console.error("Status failed. Stopping polling.");
                    clearInterval(pollingInterval);
                    showError(data.message || 'La generación de documentos ha fallado.');
                } else {
                    // Estado desconocido o aún procesando (si hubiera un estado intermedio)
                    console.log(`Status: ${data.status}. Continuing poll.`);
                    showLoader(`Procesando... Estado: ${data.status}`); // Actualizar mensaje loader
                }
            } else {
                 // Si data.success es false
                 throw new Error(data.message || 'Respuesta inválida del servidor.');
            }

        } catch (error) {
            console.error('Error durante el sondeo:', error);
            clearInterval(pollingInterval); // Detener en cualquier error
            showError(`Error al consultar estado: ${error.message}`);
        }
    }

    // --- Iniciar ---
    showLoader(); // Mostrar loader inicialmente
    pollingInterval = setInterval(checkDocumentStatus, 5000); // Consulta cada 5 segundos
    checkDocumentStatus(); // Llamada inicial inmediata
}