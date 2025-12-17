/**
 * FirmaDigitalUploader Component
 * Sprint 6 - Sistema Multi-Rol
 *
 * Componente para subir firma digital del médico ocupacional
 * Requisitos:
 * - Formato PNG únicamente
 * - Debe tener canal alpha (transparencia)
 * - Tamaño máximo 500KB
 * - Dimensiones mínimas: 100x30px
 */

const API_BASE = '/api/medico/firma';

// Estado del componente
const FirmaState = {
    tieneFirma: false,
    firma: null,
    isLoading: false,
    isDragging: false,
    error: null,
    validationErrors: []
};

/**
 * Inicializa el componente de firma digital
 * @param {string} containerId - ID del contenedor donde montar el componente
 * @param {string} authToken - Token JWT para autenticación
 */
export function initFirmaDigitalUploader(containerId, authToken) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }

    // Guardar token para requests
    FirmaState.authToken = authToken;

    // Renderizar componente inicial
    render(container);

    // Cargar firma existente
    loadFirmaActual(container);
}

/**
 * Renderiza el componente completo
 */
function render(container) {
    container.innerHTML = `
        <div class="firma-uploader">
            <div class="firma-uploader__header">
                <h3 class="firma-uploader__title">
                    <i data-lucide="pen-tool"></i>
                    Mi Firma Digital
                </h3>
                <p class="firma-uploader__description">
                    Suba su firma en formato PNG con fondo transparente.
                    Esta firma se incorporará en los documentos que genere.
                </p>
            </div>

            <div class="firma-uploader__content">
                <!-- Área de preview o dropzone -->
                <div id="firma-preview-area" class="firma-uploader__preview-area">
                    ${renderPreviewOrDropzone()}
                </div>

                <!-- Mensajes de error -->
                <div id="firma-errors" class="firma-uploader__errors" style="display: none;"></div>

                <!-- Información de ayuda -->
                <div class="firma-uploader__help">
                    <button type="button" class="firma-uploader__help-toggle" id="firma-help-toggle">
                        <i data-lucide="help-circle"></i>
                        ¿Cómo crear una firma con fondo transparente?
                    </button>
                    <div class="firma-uploader__help-content" id="firma-help-content" style="display: none;">
                        <div class="firma-uploader__help-steps">
                            <div class="help-step">
                                <span class="help-step__number">1</span>
                                <div class="help-step__content">
                                    <strong>Firme en papel blanco</strong>
                                    <p>Use un bolígrafo de tinta oscura (negro o azul) y firme sobre papel blanco liso.</p>
                                </div>
                            </div>
                            <div class="help-step">
                                <span class="help-step__number">2</span>
                                <div class="help-step__content">
                                    <strong>Fotografíe o escanee</strong>
                                    <p>Tome una foto con buena iluminación o escanee la firma a alta resolución.</p>
                                </div>
                            </div>
                            <div class="help-step">
                                <span class="help-step__number">3</span>
                                <div class="help-step__content">
                                    <strong>Quite el fondo</strong>
                                    <p>Use herramientas como <a href="https://www.remove.bg/es" target="_blank" rel="noopener">remove.bg</a>
                                    o el editor de imágenes de su preferencia para eliminar el fondo blanco.</p>
                                </div>
                            </div>
                            <div class="help-step">
                                <span class="help-step__number">4</span>
                                <div class="help-step__content">
                                    <strong>Guarde como PNG</strong>
                                    <p>Es importante guardar en formato PNG para mantener la transparencia.</p>
                                </div>
                            </div>
                        </div>
                        <div class="firma-uploader__requirements">
                            <h4>Requisitos técnicos:</h4>
                            <ul>
                                <li><i data-lucide="check"></i> Formato: PNG con transparencia</li>
                                <li><i data-lucide="check"></i> Tamaño máximo: 500 KB</li>
                                <li><i data-lucide="check"></i> Dimensiones mínimas: 100 x 30 píxeles</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Bind events después del render
    bindEvents(container);

    // Inicializar iconos Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Renderiza el área de preview (si hay firma) o el dropzone (si no hay)
 */
function renderPreviewOrDropzone() {
    if (FirmaState.isLoading) {
        return `
            <div class="firma-uploader__loading">
                <div class="spinner"></div>
                <span>Cargando...</span>
            </div>
        `;
    }

    if (FirmaState.tieneFirma && FirmaState.firma) {
        return `
            <div class="firma-uploader__preview">
                <div class="firma-uploader__preview-image checkered-bg">
                    <img src="${FirmaState.firma.url}" alt="Mi firma digital" id="firma-image">
                </div>
                <div class="firma-uploader__preview-info">
                    <span class="firma-uploader__preview-dimensions">
                        ${FirmaState.firma.width} x ${FirmaState.firma.height} px
                    </span>
                    <span class="firma-uploader__preview-size">
                        ${formatFileSize(FirmaState.firma.size)}
                    </span>
                </div>
                <div class="firma-uploader__preview-actions">
                    <button type="button" class="btn btn--outline btn--sm" id="btn-cambiar-firma">
                        <i data-lucide="refresh-cw"></i>
                        Cambiar firma
                    </button>
                    <button type="button" class="btn btn--danger btn--sm" id="btn-eliminar-firma">
                        <i data-lucide="trash-2"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    return `
        <div class="firma-uploader__dropzone ${FirmaState.isDragging ? 'dragging' : ''}" id="firma-dropzone">
            <div class="firma-uploader__dropzone-content">
                <i data-lucide="upload-cloud" class="firma-uploader__dropzone-icon"></i>
                <p class="firma-uploader__dropzone-text">
                    Arrastre su firma aquí o
                </p>
                <button type="button" class="btn btn--primary btn--sm" id="btn-seleccionar-firma">
                    Seleccionar archivo
                </button>
                <span class="firma-uploader__dropzone-formats">
                    PNG con transparencia • Máx. 500KB
                </span>
            </div>
            <input type="file" id="firma-file-input" accept="image/png" style="display: none;">
        </div>
    `;
}

/**
 * Vincula todos los eventos del componente
 */
function bindEvents(container) {
    // Toggle ayuda
    const helpToggle = container.querySelector('#firma-help-toggle');
    const helpContent = container.querySelector('#firma-help-content');
    if (helpToggle && helpContent) {
        helpToggle.addEventListener('click', () => {
            const isVisible = helpContent.style.display !== 'none';
            helpContent.style.display = isVisible ? 'none' : 'block';
            helpToggle.classList.toggle('active', !isVisible);
        });
    }

    // Eventos del dropzone o preview
    bindDropzoneEvents(container);
    bindPreviewEvents(container);
}

/**
 * Vincula eventos del dropzone (drag & drop, click)
 */
function bindDropzoneEvents(container) {
    const dropzone = container.querySelector('#firma-dropzone');
    const fileInput = container.querySelector('#firma-file-input');
    const btnSeleccionar = container.querySelector('#btn-seleccionar-firma');

    if (!dropzone) return;

    // Click para seleccionar archivo
    if (btnSeleccionar) {
        btnSeleccionar.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que se propague al dropzone
            fileInput?.click();
        });
    }

    dropzone.addEventListener('click', (e) => {
        // Solo abrir file input si NO se hizo clic en el botón
        if (e.target === dropzone || (e.target.closest('.firma-uploader__dropzone-content') && !e.target.closest('button'))) {
            fileInput?.click();
        }
    });

    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            FirmaState.isDragging = true;
            dropzone.classList.add('dragging');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            FirmaState.isDragging = false;
            dropzone.classList.remove('dragging');
        });
    });

    // Drop
    dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer?.files;
        if (files?.length > 0) {
            handleFileSelect(files[0], container);
        }
    });

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileSelect(file, container);
            }
        });
    }
}

/**
 * Vincula eventos del preview (cambiar, eliminar)
 */
function bindPreviewEvents(container) {
    const btnCambiar = container.querySelector('#btn-cambiar-firma');
    const btnEliminar = container.querySelector('#btn-eliminar-firma');

    if (btnCambiar) {
        btnCambiar.addEventListener('click', () => {
            // Mostrar dropzone en lugar de preview
            FirmaState.tieneFirma = false;
            FirmaState.firma = null;
            updatePreviewArea(container);
        });
    }

    if (btnEliminar) {
        btnEliminar.addEventListener('click', () => {
            if (confirm('¿Está seguro de eliminar su firma digital?')) {
                eliminarFirma(container);
            }
        });
    }
}

/**
 * Maneja la selección de archivo
 */
async function handleFileSelect(file, container) {
    // Reset errores
    FirmaState.validationErrors = [];
    hideErrors(container);

    // Validar archivo antes de subir
    const validationResult = await validateFile(file);

    if (!validationResult.valid) {
        showErrors(container, validationResult.errors);
        return;
    }

    // Subir archivo
    await subirFirma(file, container);
}

/**
 * Valida el archivo localmente antes de subir
 */
async function validateFile(file) {
    const errors = [];
    const maxSize = 500 * 1024; // 500KB

    // Validar tipo MIME
    if (file.type !== 'image/png') {
        errors.push('El archivo debe ser formato PNG');
    }

    // Validar tamaño
    if (file.size > maxSize) {
        errors.push(`El archivo es muy grande. Máximo 500KB (actual: ${formatFileSize(file.size)})`);
    }

    // Validar que sea una imagen válida y tenga transparencia
    try {
        const imageValidation = await validateImageProperties(file);
        if (!imageValidation.valid) {
            errors.push(...imageValidation.errors);
        }
    } catch (e) {
        errors.push('No se pudo leer el archivo de imagen');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Valida propiedades de la imagen (dimensiones, transparencia)
 */
function validateImageProperties(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            const errors = [];

            // Validar dimensiones mínimas
            if (img.width < 100 || img.height < 30) {
                errors.push(`La imagen es muy pequeña. Mínimo 100x30 píxeles (actual: ${img.width}x${img.height})`);
            }

            // Validar transparencia (check alpha channel)
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let hasTransparency = false;

                // Revisar canal alpha (cada 4to byte)
                for (let i = 3; i < data.length; i += 4) {
                    if (data[i] < 255) {
                        hasTransparency = true;
                        break;
                    }
                }

                if (!hasTransparency) {
                    errors.push('La imagen no tiene fondo transparente. Debe tener canal alpha.');
                }
            } catch (e) {
                // Cross-origin error, skip validation
                console.warn('Could not validate transparency:', e);
            }

            URL.revokeObjectURL(img.src);
            resolve({ valid: errors.length === 0, errors });
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            resolve({ valid: false, errors: ['El archivo no es una imagen válida'] });
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * Sube la firma al servidor
 */
async function subirFirma(file, container) {
    FirmaState.isLoading = true;
    updatePreviewArea(container);

    try {
        const formData = new FormData();
        formData.append('firma', file);

        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FirmaState.authToken}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error subiendo firma');
        }

        // Actualizar estado
        FirmaState.tieneFirma = true;
        FirmaState.firma = data.firma;
        FirmaState.error = null;

        // Mostrar notificación de éxito
        showNotification('Firma subida exitosamente', 'success');

        // Disparar evento personalizado para actualizar el estado global
        window.dispatchEvent(new CustomEvent('firmaDigitalActualizada', {
            detail: { tieneFirma: true, firma: data.firma }
        }));

    } catch (error) {
        console.error('Error subiendo firma:', error);
        showErrors(container, [error.message]);
    } finally {
        FirmaState.isLoading = false;
        updatePreviewArea(container);
    }
}

/**
 * Elimina la firma del servidor
 */
async function eliminarFirma(container) {
    FirmaState.isLoading = true;
    updatePreviewArea(container);

    try {
        const response = await fetch(API_BASE, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${FirmaState.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error eliminando firma');
        }

        // Actualizar estado
        FirmaState.tieneFirma = false;
        FirmaState.firma = null;
        FirmaState.error = null;

        showNotification('Firma eliminada', 'success');

        // Disparar evento personalizado para actualizar el estado global
        window.dispatchEvent(new CustomEvent('firmaDigitalActualizada', {
            detail: { tieneFirma: false, firma: null }
        }));

    } catch (error) {
        console.error('Error eliminando firma:', error);
        showErrors(container, [error.message]);
    } finally {
        FirmaState.isLoading = false;
        updatePreviewArea(container);
    }
}

/**
 * Carga la firma actual del servidor
 */
async function loadFirmaActual(container) {
    FirmaState.isLoading = true;
    updatePreviewArea(container);

    try {
        const response = await fetch(API_BASE, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FirmaState.authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error obteniendo firma');
        }

        FirmaState.tieneFirma = data.tieneFirma;
        FirmaState.firma = data.firma;

    } catch (error) {
        console.error('Error cargando firma:', error);
        // No mostrar error, solo dejar el estado vacío
    } finally {
        FirmaState.isLoading = false;
        updatePreviewArea(container);
    }
}

/**
 * Actualiza solo el área de preview/dropzone
 */
function updatePreviewArea(container) {
    const previewArea = container.querySelector('#firma-preview-area');
    if (previewArea) {
        previewArea.innerHTML = renderPreviewOrDropzone();
        bindDropzoneEvents(container);
        bindPreviewEvents(container);

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

/**
 * Muestra errores de validación
 */
function showErrors(container, errors) {
    const errorsDiv = container.querySelector('#firma-errors');
    if (errorsDiv) {
        errorsDiv.innerHTML = errors.map(err => `
            <div class="firma-uploader__error">
                <i data-lucide="alert-circle"></i>
                <span>${err}</span>
            </div>
        `).join('');
        errorsDiv.style.display = 'block';

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

/**
 * Oculta los errores
 */
function hideErrors(container) {
    const errorsDiv = container.querySelector('#firma-errors');
    if (errorsDiv) {
        errorsDiv.style.display = 'none';
        errorsDiv.innerHTML = '';
    }
}

/**
 * Muestra notificación toast
 */
function showNotification(message, type = 'info') {
    // Crear toast si no existe
    let toast = document.querySelector('.firma-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'firma-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `firma-toast firma-toast--${type} firma-toast--visible`;

    // Auto-hide después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('firma-toast--visible');
    }, 3000);
}

/**
 * Formatea el tamaño del archivo
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Obtiene el estado actual de la firma
 */
export function getFirmaState() {
    return { ...FirmaState };
}

/**
 * Verifica si el médico tiene firma configurada
 */
export function tieneFirmaConfigurada() {
    return FirmaState.tieneFirma;
}

export default {
    initFirmaDigitalUploader,
    getFirmaState,
    tieneFirmaConfigurada
};
