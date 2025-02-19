// calculator.js

/**
 * Módulo de utilidades para el formateo de moneda
 * Proporciona funciones helper para formatear valores monetarios
 */
import { initContactForm } from './informacion_de_contacto.js';

const formatUtils = {
    /**
     * Formatea un número a moneda colombiana
     * @param {number} amount - Cantidad a formatear
     * @returns {string} Cantidad formateada en pesos colombianos
     */
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
};

/**
 * Configuración de exámenes médicos
 * Define los tipos de exámenes disponibles con sus detalles
 */
    const EXAM_CONFIG = {
        EMO: {
            code: 'EMO',
            fullName: 'EXAMEN MEDICO CON ENFASIS OSTEOMUSCULAR',
            description: 'Evalúa la salud del sistema musculoesquelético, identificando condiciones que puedan afectar el desempeño laboral.',
            basePrice: 30000
        },
        EMOA: {
            code: 'EMOA',
            fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN ALTURAS',
            description: 'Evaluación específica para trabajo en alturas, incluyendo valoración del sistema vestibular y neurológico.',
            basePrice: 33000
        },
        AUD: {
            code: 'AUD',
            fullName: 'AUDIOMETRIA',
            description: 'Mide la capacidad auditiva para identificar posibles pérdidas auditivas causadas por ruido ocupacional.',
            basePrice: 16450
          },
          ESP: {
              code: 'ESP',
              fullName: 'ESPIROMETRÍA',
              description: 'Evalúa la función pulmonar, detectando enfermedades respiratorias que puedan ser causadas o agravadas por el trabajo.',
              basePrice: 16450
          },
          OPTO: {
              code: 'OPTO',
              fullName: 'OPTOMETRÍA',
              description: 'Examina la salud visual y detecta problemas que puedan afectar el desempeño laboral o ser resultado de la exposición a riesgos en el trabajo.',
              basePrice: 16450
          },
          VIS: {
              code: 'VIS',
              fullName: 'VISIOMETRÍA',
              description: 'Mide la agudeza visual y otras capacidades visuales importantes para el trabajo.',
              basePrice: 11900
          },
          ECG: {
              code: 'ECG',
              fullName: 'ELECTROCARDIOGRAMA',
              description: 'Registra la actividad eléctrica del corazón para detectar enfermedades cardíacas.',
              basePrice: 29400
          },
          RXC: {
              code: 'RXC',
              fullName: 'RAYOS X DE COLUMNA',
              description: 'Obtiene imágenes de la columna vertebral para identificar lesiones o condiciones que puedan afectar la salud del trabajador.',
              basePrice: 49000
          },
          PSM: {
              code: 'PSM',
              fullName: 'PRUEBA PSICOSENSOMETRICA',
              description: 'Evalúa habilidades sensoriales y motoras importantes para ciertas tareas laborales.',
              basePrice: 30800
          },
          PST: {
              code: 'PST',
              fullName: 'PRUEBA PSICOTECNICA',
              description: 'Mide aptitudes y habilidades cognitivas relevantes para el desempeño laboral.',
              basePrice: 24500
          },
          GLI: {
              code: 'GLI',
              fullName: 'GLICEMIA',
              description: 'Mide los niveles de azúcar en sangre para identificar diabetes u otras condiciones metabólicas.',
              basePrice: 10500
          },
          CH: {
              code: 'CH',
              fullName: 'CUADRO HEMATICO',
              description: 'Cuadro Hematico',
              basePrice: 9800
          },
          PL: {
              code: 'PL',
              fullName: 'PERFIL LIPÍDICO',
              description: 'Mide los niveles de colesterol y triglicéridos para evaluar el riesgo cardiovascular.',
              basePrice: 22400
          },
          PAS: {
              code: 'PAS',
              fullName: 'PRUEBA DE ALCOHOL EN SALIVA',
              description: 'Detectan consumo reciente de alcohol.',
              basePrice: 28000
          },
          PE: {
              code: 'PE',
              fullName: 'PRUEBA DE EMBARAZO',
              description: 'Confirma o descarta un embarazo.',
              basePrice: 12600
          },
          PSP: {
              code: 'PSP',
              fullName: 'PRUEBA DE SUSTANCIAS PSICOACTIVAS',
              description: 'Detectan el consumo de drogas.',
              basePrice: 23800
          },
          TGO: {
              code: 'TGO',
              fullName: 'TRANSAMINASAS TGO',
              description: 'Evalúan la función hepática. Colesterol: Mide los niveles de colesterol en sangre.',
              basePrice: 12600
          },
          TGP: {
              code: 'TGP',
              fullName: 'TRANSAMINASAS TGP',
              description: 'Evalúan la función hepática. Colesterol: Mide los niveles de colesterol en sangre.',
              basePrice: 12600
          },
          TRI: {
              code: 'TRI',
              fullName: 'TRIGLICÉRIDOS',
              description: 'Mide los niveles de triglicéridos en sangre.',
              basePrice: 10500
          },
          COL: {
              code: 'COL',
              fullName: 'COLESTEROL',
              description: 'Mide los niveles de colesterol en sangre.',
              basePrice: 10500
          },
          COP: {
              code: 'COP',
              fullName: 'COPROLOGICO',
              description: 'Coprologico',
              basePrice: 9800
          },
          LEP: {
              code: 'LEP',
              fullName: 'LEPTOSPIRA',
              description: 'Leptospira',
              basePrice: 80500
          },
          BRU: {
              code: 'BRU',
              fullName: 'BRUCELA',
              description: 'Brucela',
              basePrice: 80500
          },
          TOX: {
              code: 'TOX',
              fullName: 'TOXOPLASMA',
              description: 'Toxoplasma',
              basePrice: 40600
          }


        // Aquí irían los demás exámenes según la configuración proporcionada
    };

    /**
     * Configuración de rangos de descuento por número de trabajadores
     * Define los descuentos aplicables según la cantidad de trabajadores
     */
    const DISCOUNT_RANGES = {
        '1-10': { min: 1, max: 10, discount: 0.05 },
        '11-50': { min: 11, max: 50, discount: 0.10 },
        '51-100': { min: 51, max: 100, discount: 0.15 },
        '101-500': { min: 101, max: 500, discount: 0.20 },
        '501+': { min: 501, max: Infinity, discount: 0.25 }
    };

    /**
     * Constantes para la persistencia de datos
     */
    const STORAGE_CONFIG = {
        KEY: 'calculatorState',
        MAX_AGE: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
    };

    /**
     * Clase principal para la calculadora de exámenes médicos
     * Maneja toda la lógica de la calculadora, incluyendo:
     * - Gestión de cargos y exámenes
     * - Cálculo de precios y descuentos
     * - Persistencia de datos
     * - Interacción con el DOM
     */
    class MedicalExamCalculator {
        /**
         * Inicializa la calculadora y verifica datos guardados
         */
        constructor() {
            // Verificar si se solicitó una nueva calculadora explícitamente
            if (window.location.search.includes('newCalculation=true')) {
                localStorage.removeItem(STORAGE_CONFIG.KEY);
            }
        
            // Inicializar propiedades
            this.cargos = [];
            this.nextCargoId = 1;
            this.selectedExams = new Map();
        
            // Inicializar elementos del DOM
            this.initializeElements();
            this.bindEvents();
        
            // Verificar y restaurar datos guardados
            const hasSavedData = this.checkSavedData();
            
            if (hasSavedData) {
                const state = JSON.parse(localStorage.getItem(STORAGE_CONFIG.KEY));
                const lastUpdate = new Date(state.lastUpdate);
                const hoursAgo = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60));
                
                const banner = this.container.querySelector('.restore-banner');
                const message = banner.querySelector('.banner-message');
                message.textContent = `Encontramos una cotización guardada con ${state.cargos.length} cargo(s) de hace ${hoursAgo} hora(s)`;
                
                banner.style.display = 'block';
        
                // Agregar event listeners para los botones del banner
                banner.querySelector('.btn-restore').addEventListener('click', () => {
                    this.restoreState();
                    banner.style.display = 'none';
                });
        
                banner.querySelector('.btn-new').addEventListener('click', () => {
                    localStorage.removeItem(STORAGE_CONFIG.KEY);
                    this.addFirstCargo();
                    banner.style.display = 'none';
                });
            } else {
                // Si no hay datos guardados, agregar el primer cargo
                this.addFirstCargo();
            }
        }

        /**
         * Verifica y restaura datos guardados si existen
         * @private
         */
        checkAndRestoreSavedData() {
            const hasSavedData = this.checkSavedData();
            
            if (hasSavedData) {
                const state = JSON.parse(localStorage.getItem(STORAGE_CONFIG.KEY));
                const lastUpdate = new Date(state.lastUpdate).toLocaleString();
                const numCargos = state.cargos.length;
                
                const shouldRestore = confirm(
                    `Encontramos una cotización guardada con ${numCargos} cargo(s)\n` +
                    `Última actualización: ${lastUpdate}\n\n` +
                    '¿Desea continuar con la cotización guardada?\n\n' +
                    'Seleccione "Aceptar" para continuar con la cotización guardada\n' +
                    'Seleccione "Cancelar" para comenzar una nueva'
                );

                if (shouldRestore) {
                    this.restoreState();
                } else {
                    localStorage.removeItem(STORAGE_CONFIG.KEY);
                    this.addFirstCargo();
                }
            }
        }
        /**
         * Inicializa las referencias a elementos del DOM
         * Crea la estructura base de la calculadora
         * @private
         */
        initializeElements() {
            this.container = document.querySelector('.calculator');
            if (!this.container) {
                console.error('No se encontró el contenedor de la calculadora');
                return;
            }

            // Crear estructura base
            this.container.innerHTML = this.generateCalculatorHTML();
            
            // Obtener referencias a elementos clave
            this.cargoContainer = this.container.querySelector('#job-positions');
            this.addCargoButton = this.container.querySelector('.btn-add');
            this.examDescription = this.container.querySelector('#examDescription');
            this.totalPriceElement = this.container.querySelector('.total-price');
            this.discountCheckboxes = {
                time: this.container.querySelector('#discount2')
            };
            this.discountPercentageElement = this.container.querySelector('#discount-percentage');
        }

        /**
         * Genera el HTML base de la calculadora
         * @returns {string} HTML estructural de la calculadora
         * @private
         */
        generateCalculatorHTML() {
            return `
                <div class="restore-banner" style="display: none;">
                    <div class="banner-content">
                        <div class="banner-message"></div>
                        <div class="banner-actions">
                            <button class="btn-restore cta-button">Continuar con esta cotización</button>
                            <button class="btn-new cta-button-1">Crear nueva cotización</button>
                        </div>
                    </div>
                </div>
                <div class="calculator-header">
                    <h1>Genera una cotización personalizada de los exámenes médicos ocupacionales para tu equipo de trabajo</h1>
                </div>
                <div class="calculator-body">
                    <div class="calculator-form">
                        <div class="section-calculator">
                            <div id="job-positions"></div>
                            <div class="container-btn-add">
                                <button class="btn-add">+ Agrega un nuevo cargo aquí</button>
                            </div>
                        </div>
                    </div>
                    <div class="calculator-summary">
                        <div class="exam-description">
                            <h3 id="examTitle">Seleccione un examen</h3>
                            <p id="examDescription">Pase el cursor sobre un examen para ver su descripción.</p>
                        </div>
                        <div class="exam-price">
                            <p id="examPrice">Desde: <span class="min-price">$0</span></p>
                        </div>
                        <div class="package-summary"></div>
                        <div class="discount-options">
                            <div class="discount-option info-only">
                                <div class="discount-info">
                                    <div class="discount-header">
                                        <span class="discount-title">Queremos apoyar el desarrollo</span>
                                    </div>
                                    <p class="discount-description">Por el tamaño de tu empresa tienes un beneficio de:</p>
                                </div>
                                <div class="discount-value" id="discount-percentage">-5%</div>
                            </div>
                            <div class="discount-option">
                                <div class="discount-info">
                                    <div class="discount-header">
                                        <span class="discount-title">Ahorra tiempo y dinero</span>
                                    </div>
                                    <p class="discount-description">Todo mi equipo realizará sus examenes en una semana o asistirán un mínimo de 35 personas a la semana.</p>
                                </div>
                                <div class="discount-action">
                                    <span class="discount-value">-5%</span>
                                    <input type="checkbox" id="discount2">
                                </div>
                            </div>
                        </div>
                        <div class="total">
                            <p>Los exámenes de tu empresa tienen un valor de:</p>
                            <p class="total-price">$0</p>
                        </div>
                        <button class="btn-download">Descarga Acá tu cotización</button>
                    </div>
                </div>
            `;
        }

        /**
         * Vincula todos los eventos necesarios para la interactividad
         * @private
         */
        bindEvents() {
            // Evento para agregar nuevo cargo
            this.addCargoButton.addEventListener('click', () => {
                this.addCargo();
                this.saveState(); // Guardar estado después de agregar cargo
            });

            // Eventos para los descuentos
            Object.values(this.discountCheckboxes).forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.updateTotals();
                    this.saveState(); // Guardar estado después de cambiar descuentos
                });
            });

            // Delegación de eventos para los cargos
            this.cargoContainer.addEventListener('click', (e) => {
                const target = e.target;
                
                if (target.classList.contains('toggle-cargo')) {
                    const cargoElement = target.closest('.cargo');
                    this.toggleCargo(cargoElement);
                }

                if (target.classList.contains('delete-cargo')) {
                    const cargoElement = target.closest('.cargo');
                    this.removeCargo(cargoElement);
                }
            });

            // Eventos de input y cambios en cargos
            this.cargoContainer.addEventListener('input', (e) => {
                const target = e.target;

                if (target.classList.contains('cargo-name')) {
                    this.updateCargoName(target);
                    this.updateTotals();
                    this.saveState(); // Guardar estado después de actualizar nombre
                }
            });

            // Cambios en inputs y checkboxes
            this.cargoContainer.addEventListener('change', (e) => {
                const target = e.target;
                
                if (target.classList.contains('exam-checkbox')) {
                    this.updateExamSelection(target);
                    this.saveState(); // Guardar estado después de seleccionar exámenes
                }
                
                if (target.classList.contains('num-trabajadores')) {
                    this.updateWorkerCount(target);
                    this.saveState(); // Guardar estado después de actualizar trabajadores
                }
            });

            // Eventos de hover para descripciones
            this.cargoContainer.addEventListener('mouseover', (e) => {
                const examCheckbox = e.target.closest('.checkbox-item');
                if (examCheckbox) {
                    this.showExamDescription(examCheckbox.dataset.examCode);
                }
            });

            // Evento para descarga
            this.container.querySelector('.btn-download').addEventListener('click', 
                () => this.downloadQuotation());
        }
        /**
         * Crea el HTML para un nuevo cargo
         * @param {number} id - ID único del cargo
         * @param {boolean} isExpanded - Si el cargo debe mostrarse expandido
         * @returns {string} HTML del cargo
         * @private
         */
        generateCargoHTML(id, isExpanded = true) {
            // Generar checkboxes para cada tipo de examen disponible
            const examCheckboxes = Object.values(EXAM_CONFIG)
                .map(exam => `
                    <div class="checkbox-item" 
                        data-exam-code="${exam.code}"
                        title="${exam.fullName}">
                        <label for="exam-${exam.code}-${id}">${exam.code}</label>
                        <input type="checkbox" 
                            id="exam-${exam.code}-${id}"
                            class="exam-checkbox"
                            data-exam-code="${exam.code}"
                            data-cargo-id="${id}">
                    </div>
                `).join('');

            // Retornar la estructura completa del cargo
            return `
                <div class="cargo" data-cargo-id="${id}">
                    <div class="cargo-encabezado">
                        <div class="cargo-header">
                            <input type="text" 
                                class="cargo-name" 
                                placeholder="Acá el nombre del cargo"
                                value="">
                            <div class="cargo-controls">
                            <div class="numero-trabajadores">
                            <input type="number" 
                                class="num-trabajadores" 
                                min="1" 
                                value="1">
                            </div>
                                <button class="toggle-cargo">
                                    ${isExpanded ? '-' : '+'}
                                
                            </div>
                        </div>
                        </button>
                                ${id !== 1 ? '<button class="delete-cargo">×</button>' : ''}
                    </div>
                    <div class="cargo-body ${isExpanded ? '' : 'hidden'}">
                        <div class="exam-selector">
                            <h4>Selecciona los exámenes requeridos:</h4>
                            <div class="exam-grid">
                                ${examCheckboxes}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Agrega el primer cargo por defecto
         * @private
         */
        addFirstCargo() {
            // Limpiamos el contenedor de cargos
            this.cargoContainer.innerHTML = '';
            
            // Creamos el primer cargo
            const cargoHtml = this.generateCargoHTML(this.nextCargoId);
            this.cargoContainer.innerHTML = cargoHtml;
            
            // Inicializamos el array de cargos con el primer cargo
            this.cargos = [{
                id: this.nextCargoId,
                name: `Cargo ${this.nextCargoId}`,
                workers: 1,
                selectedExams: new Set()
            }];

            this.nextCargoId++;
            this.updateTotals();
            this.saveState(); // Guardar estado inicial
        }

        /**
         * Agrega un nuevo cargo a la calculadora
         * @param {boolean} isFirst - Indica si es el primer cargo
         * @private
         */
        addCargo(isFirst = false) {
            const cargoHtml = this.generateCargoHTML(this.nextCargoId);
            this.cargoContainer.insertAdjacentHTML('beforeend', cargoHtml);
            
            // Inicializar el nuevo cargo en el estado
            this.cargos.push({
                id: this.nextCargoId,
                name: `Cargo ${this.nextCargoId}`,
                workers: 1,
                selectedExams: new Set()
            });

            this.nextCargoId++;
            this.updateTotals();
            this.saveState();
        }

        /**
         * Elimina un cargo existente
         * @param {HTMLElement} cargoElement - Elemento DOM del cargo a eliminar
         * @private
         */
        removeCargo(cargoElement) {
            const cargoId = parseInt(cargoElement.dataset.cargoId);
            
            // No permitir eliminar el primer cargo
            if (cargoId === 1) return;
            
            // Confirmar eliminación
            if (!confirm('¿Está seguro de eliminar este cargo?')) return;
            
            // Eliminar del DOM y del estado
            cargoElement.remove();
            this.cargos = this.cargos.filter(cargo => cargo.id !== cargoId);
            
            this.updateTotals();
            this.saveState();
        }

        /**
         * Alterna la visibilidad del contenido de un cargo
         * @param {HTMLElement} cargoElement - Elemento DOM del cargo
         * @private
         */
        toggleCargo(cargoElement) {
            const body = cargoElement.querySelector('.cargo-body');
            const toggleButton = cargoElement.querySelector('.toggle-cargo');
            
            body.classList.toggle('hidden');
            toggleButton.textContent = body.classList.contains('hidden') ? '+' : '-';
        }
        /**
         * Actualiza el nombre de un cargo
         * @param {HTMLInputElement} input - Elemento input con el nuevo nombre
         * @private
         */
        updateCargoName(input) {
            const cargoId = parseInt(input.closest('.cargo').dataset.cargoId);
            const cargo = this.cargos.find(c => c.id === cargoId);
            
            if (cargo) {
                cargo.name = input.value.trim() || `Cargo ${cargoId}`;
                this.saveState();
                this.updateTotals(); // Actualizar totales para reflejar el nuevo nombre
            }
        }

        /**
         * Actualiza la selección de exámenes para un cargo
         * @param {HTMLInputElement} checkbox - Checkbox del examen
         * @private
         */
        updateExamSelection(checkbox) {
            const cargoId = parseInt(checkbox.dataset.cargoId);
            const examCode = checkbox.dataset.examCode;
            const cargo = this.cargos.find(c => c.id === cargoId);
            
            if (cargo) {
                if (checkbox.checked) {
                    cargo.selectedExams.add(examCode);
                } else {
                    cargo.selectedExams.delete(examCode);
                }
                
                this.updateTotals();
                this.saveState();
            }
        }

        /**
         * Actualiza el número de trabajadores para un cargo
         * @param {HTMLInputElement} input - Input con el número de trabajadores
         * @private
         */
        updateWorkerCount(input) {
            const cargoId = parseInt(input.closest('.cargo').dataset.cargoId);
            const cargo = this.cargos.find(c => c.id === cargoId);
            
            if (cargo) {
                cargo.workers = Math.max(1, parseInt(input.value) || 1);
                this.updateTotals();
                this.saveState();
            }
        }

        /**
         * Muestra la descripción de un examen al hacer hover
         * @param {string} examCode - Código del examen
         * @private
         */
        showExamDescription(examCode) {
            const exam = EXAM_CONFIG[examCode];
            if (!exam) return;

            const titleElement = this.container.querySelector('#examTitle');
            const descElement = this.container.querySelector('#examDescription');
            const priceElement = this.container.querySelector('#examPrice .min-price');

            titleElement.textContent = exam.fullName;
            descElement.textContent = exam.description;
            priceElement.textContent = formatUtils.formatCurrency(exam.basePrice);
        }

        /**
         * Formatea valores monetarios y agrega las clases para estilos
         * @param {number} amount - La cantidad a formatear
         * @param {boolean} isLarge - Si es true, usa la clase para texto grande
         * @returns {string} El HTML con el valor formateado y las clases
         * @private
         */
        formatMoneyValue(amount, isLarge = false) {
            const formattedValue = formatUtils.formatCurrency(amount);
            const sizeClass = isLarge ? 'larger' : 'smaller';
            return `<span class="valor-cantidad ${sizeClass}">${formattedValue}</span>`;
        }

        /**
         * Calcula el descuento aplicable según el número total de trabajadores
         * @returns {number} Porcentaje de descuento en decimal
         * @private
         */
        calculateVolumeDiscount() {
            const totalWorkers = this.cargos.reduce((sum, cargo) => sum + cargo.workers, 0);
            
            for (const range of Object.values(DISCOUNT_RANGES)) {
                if (totalWorkers >= range.min && totalWorkers <= range.max) {
                    return range.discount;
                }
            }
            
            return 0;
        }
        /**
         * Actualiza todos los totales y el resumen
         * Este método es el núcleo del cálculo de precios y debe llamarse
         * cada vez que hay un cambio que afecte los totales
         * @private
         */
        updateTotals() {
            let subtotal = 0;
            const packageSummary = this.container.querySelector('.package-summary');
            packageSummary.innerHTML = '';

            // Calcular subtotales por cargo
            this.cargos.forEach(cargo => {
                let cargoTotal = 0;
                
                // Sumar el costo de cada examen seleccionado
                cargo.selectedExams.forEach(examCode => {
                    const exam = EXAM_CONFIG[examCode];
                    if (exam) {
                        cargoTotal += exam.basePrice * cargo.workers;
                    }
                });

                subtotal += cargoTotal;

                // Generar el HTML del resumen para este cargo
                packageSummary.insertAdjacentHTML('beforeend', `
                    <div class="package-item">
                        <div class="package-header">
                            <h4>Paquete ${cargo.name}</h4>
                        </div>
                        <div class="valores-cargo">
                            <div class="valor-item">
                                <div class="valor-descripcion">
                                    <span class="valor-label">Valor por trabajador:</span>
                                </div>
                                <div class="valor-monto">
                                    ${this.formatMoneyValue(cargoTotal / (cargo.workers || 1), false)}
                                </div>
                            </div>
                            <div class="valor-item">
                                <div class="valor-descripcion">
                                    <span class="valor-label">Total para ${cargo.workers} trabajador${cargo.workers !== 1 ? 'es' : ''}:</span>
                                </div>
                                <div class="valor-monto">
                                    ${this.formatMoneyValue(cargoTotal, true)}
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            });

            // Calcular y aplicar descuentos
            const volumeDiscount = this.calculateVolumeDiscount();
            let finalPrice = subtotal;

            // Aplicar descuento por volumen
            finalPrice *= (1 - volumeDiscount);

            // Aplicar descuento adicional por tiempo si está activado
            if (this.discountCheckboxes.time.checked) {
                finalPrice *= 0.95; // 5% de descuento adicional
            }

            // Actualizar el porcentaje de descuento mostrado
            const discountPercentageElement = this.container.querySelector('#discount-percentage');
            discountPercentageElement.textContent = `-${(volumeDiscount * 100).toFixed(0)}%`;

            // Actualizar el precio final
            this.totalPriceElement.textContent = formatUtils.formatCurrency(finalPrice);
        }

        /**
         * Verifica si hay datos guardados en localStorage y si son válidos
         * @returns {boolean} true si hay datos válidos guardados
         * @private
         */
        checkSavedData() {
            try {
                const savedState = localStorage.getItem(STORAGE_CONFIG.KEY);
                if (!savedState) return false;
                
                const state = JSON.parse(savedState);
                if (!state.lastUpdate) return false;
                
                // Verificar si los datos son recientes (menos de 24 horas)
                const savedTime = new Date(state.lastUpdate).getTime();
                const currentTime = new Date().getTime();
                if (currentTime - savedTime > STORAGE_CONFIG.MAX_AGE) {
                    localStorage.removeItem(STORAGE_CONFIG.KEY);
                    return false;
                }
                
                return state && 
                    Array.isArray(state.cargos) && 
                    state.cargos.length > 0 &&
                    typeof state.nextCargoId === 'number';
            } catch (error) {
                console.error('Error al verificar datos guardados:', error);
                return false;
            }
        }
        // Agregar este método justo antes de saveState()
        shouldSaveState() {
            // Verificar el primer cargo
            const firstCargo = this.cargos[0];
            if (!firstCargo || !firstCargo.name || firstCargo.name === `Cargo ${firstCargo.id}`) {
                return false;
            }
            if (firstCargo.selectedExams.size === 0) {
                return false;
            }

            // Si hay más cargos, verificar que tengan nombres válidos
            const additionalCargos = this.cargos.slice(1);
            return additionalCargos.every(cargo => 
                cargo.name && cargo.name !== `Cargo ${cargo.id}`
            );
        }
        /**
         * Guarda el estado actual de la calculadora en localStorage
         * @private
         */
        saveState() {

            if (!this.shouldSaveState()) {
                return;
            }

            const state = {
                cargos: this.cargos.map(cargo => ({
                    id: cargo.id,
                    name: cargo.name,
                    workers: cargo.workers,
                    selectedExams: Array.from(cargo.selectedExams)
                })),
                nextCargoId: this.nextCargoId,
                discounts: {
                    time: this.discountCheckboxes.time.checked
                },
                lastUpdate: new Date().toISOString()
            };

            try {
                localStorage.setItem(STORAGE_CONFIG.KEY, JSON.stringify(state));
                console.log('Estado guardado exitosamente');
            } catch (error) {
                console.error('Error al guardar estado:', error);
            }
        }
        /**
         * Restaura el estado guardado de localStorage
         * @returns {boolean} true si se restauró correctamente, false en caso contrario
         * @private
         */
        restoreState() {
            try {
                const savedState = localStorage.getItem(STORAGE_CONFIG.KEY);
                if (!savedState) return false;
        
                const state = JSON.parse(savedState);
                
                // Limpiar el estado actual
                this.cargoContainer.innerHTML = '';
                this.cargos = [];
                
                // Restaurar cada cargo guardado
                state.cargos.forEach(cargo => {
                    // Primero creamos el HTML
                    const cargoHtml = this.generateCargoHTML(cargo.id);
                    this.cargoContainer.insertAdjacentHTML('beforeend', cargoHtml);
                    
                    // Obtenemos el elemento del cargo
                    const cargoElement = this.cargoContainer.querySelector(`[data-cargo-id="${cargo.id}"]`);
                    if (!cargoElement) {
                        console.error(`No se pudo encontrar el elemento para el cargo ${cargo.id}`);
                        return;
                    }
        
                    // Restauramos los valores básicos
                    cargoElement.querySelector('.cargo-name').value = cargo.name;
                    cargoElement.querySelector('.num-trabajadores').value = cargo.workers;
                    
                    // Creamos el nuevo cargo para el array con el Set inicializado
                    const newCargo = {
                        id: cargo.id,
                        name: cargo.name,
                        workers: cargo.workers,
                        selectedExams: new Set()
                    };
        
                    // Restauramos los exámenes seleccionados
                    if (Array.isArray(cargo.selectedExams)) {
                        cargo.selectedExams.forEach(examCode => {
                            const checkboxContainer = cargoElement.querySelector(`[data-exam-code="${examCode}"]`);
                            if (checkboxContainer) {
                                const checkbox = checkboxContainer.querySelector('input[type="checkbox"]');
                                if (checkbox) {
                                    checkbox.checked = true;
                                    newCargo.selectedExams.add(examCode);
                                }
                            }
                        });
                    }
        
                    // Agregamos el cargo al array
                    this.cargos.push(newCargo);
                });
                
                // Restaurar otros estados
                if (state.discounts) {
                    this.discountCheckboxes.time.checked = state.discounts.time;
                }
                
                this.nextCargoId = state.nextCargoId;
                
                // Actualizar totales
                this.updateTotals();
                
                // Log para debug
                console.log('Estado restaurado:', {
                    cargos: this.cargos.map(cargo => ({
                        ...cargo,
                        selectedExams: Array.from(cargo.selectedExams)
                    })),
                    nextCargoId: this.nextCargoId,
                    discounts: {
                        time: this.discountCheckboxes.time.checked
                    }
                });
                
                return true;
            } catch (error) {
                console.error('Error al restaurar estado:', error);
                return false;
            }
        }

        /**
         * Genera y descarga la cotización en formato de texto
         * @private
         */
        async downloadQuotation() {
            const contactForm = initContactForm({
                googleFormsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfPF3gwfHJtBTVjTyotqTgky39adkKMhwz_AG-G0Hd6iDtBug/formResponse',
                googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbyLelEsDZq-6kbmDwnw7CSMxEKQVjuZnMUConHwMU4extYoi_iOeU4gLPYBHim_04RF/exec',
                onSuccess: (formData) => {
                    this.generateAndDownloadFile();
                },
                onError: (error) => {
                    console.error('Error en el formulario:', error);
                    alert('Hubo un error al procesar su solicitud. Por favor intente nuevamente.');
                }
            });
        
            contactForm.showForm(); // Primero muestra el formulario
        }
        
        // Método separado para la generación y descarga
        async generateAndDownloadFile() {
            try {
                const content = this.generateQuotationContent();
                const blob = new Blob([content], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cotizacion_examenes_${new Date().toISOString().split('T')[0]}.txt`;
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error al generar la cotización:', error);
                alert('Hubo un error al generar la cotización. Por favor intente nuevamente.');
            }
        }

        /**
         * Genera el contenido detallado de la cotización
         * @returns {string} Contenido formateado de la cotización
         * @private
         */
        generateQuotationContent() {
            const lines = [];
            const date = new Date().toLocaleDateString('es-CO');
            
            lines.push('COTIZACIÓN DE EXÁMENES MÉDICOS OCUPACIONALES');
            lines.push(`Fecha: ${date}`);
            lines.push('==========================================\n');
            
            // Detalles por cargo
            this.cargos.forEach(cargo => {
                lines.push(`CARGO: ${cargo.name}`);
                lines.push(`Número de trabajadores: ${cargo.workers}`);
                lines.push('Exámenes seleccionados:');
                
                let subtotal = 0;
                cargo.selectedExams.forEach(examCode => {
                    const exam = EXAM_CONFIG[examCode];
                    const examTotal = exam.basePrice * cargo.workers;
                    subtotal += examTotal;
                    
                    lines.push(`- ${exam.fullName}`);
                    lines.push(`  Precio unitario: ${formatUtils.formatCurrency(exam.basePrice)}`);
                    lines.push(`  Subtotal: ${formatUtils.formatCurrency(examTotal)}`);
                });
                
                lines.push(`Subtotal para ${cargo.name}: ${formatUtils.formatCurrency(subtotal)}\n`);
            });
            
            // Resumen de descuentos
            const volumeDiscount = this.calculateVolumeDiscount();
            const totalWorkers = this.cargos.reduce((sum, cargo) => sum + cargo.workers, 0);
            
            lines.push('RESUMEN DE DESCUENTOS');
            lines.push(`Total de trabajadores: ${totalWorkers}`);
            lines.push(`Descuento por volumen: ${(volumeDiscount * 100).toFixed(0)}%`);
            
            if (this.discountCheckboxes.time.checked) {
                lines.push('Descuento adicional: 5%');
            }
            
            // Total final
            lines.push('\nTOTAL FINAL');
            lines.push(this.totalPriceElement.textContent);
            
            return lines.join('\n');
        }
    }

    /**
     * Función de inicialización para exportar
     * @returns {MedicalExamCalculator} Instancia de la calculadora
     */
    export function initCalculator() {
        // El constructor ya se encarga de todo el proceso de restauración
        // y de agregar el primer cargo si es necesario
        const calculator = new MedicalExamCalculator();
        return calculator;
    }