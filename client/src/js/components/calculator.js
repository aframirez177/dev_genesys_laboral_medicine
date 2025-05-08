// calculator.js

/**
 * Módulo de utilidades para el formateo de moneda
 * Proporciona funciones helper para formatear valores monetarios
 */
import { initContactForm } from './informacion_de_contacto.js';
import { jsPDF } from 'jspdf'; // Importar jsPDF
import { addPoppinsFont } from '../utils/poppins-font-definitions.js'; // Importar la función de 

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
            basePrice: 32100
        },
        EMOA: {
            code: 'EMOA',
            fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN ALTURAS',
            description: 'Evaluación específica para trabajo en alturas, incluyendo valoración del sistema vestibular y neurológico.',
            basePrice: 35310
        },
        EMOD: {
            code: 'EMOD',
            fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS DERMATOLOGICO',
            description: 'Evaluación específica para trabajo con sustancias quimicas, incluyendo valoración dermatologica.',
            basePrice: 32100
        },
        EMOMP: {
            code: 'EMOMP',
            fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN MANIPULACION DE ALIMENTOS',
            description: 'Evaluación específica para trabajo con manipulacion de alimentos.',
            basePrice: 32100
        },
        AUD: {
            code: 'AUD',
            fullName: 'AUDIOMETRIA',
            description: 'Mide la capacidad auditiva para identificar posibles pérdidas auditivas causadas por ruido ocupacional.',
            basePrice: 25145
          },
          ESP: {
              code: 'ESP',
              fullName: 'ESPIROMETRÍA',
              description: 'Evalúa la función pulmonar, detectando enfermedades respiratorias que puedan ser causadas o agravadas por el trabajo.',
              basePrice: 25145
          },
          OPTO: {
              code: 'OPTO',
              fullName: 'OPTOMETRÍA',
              description: 'Examina la salud visual y detecta problemas que puedan afectar el desempeño laboral o ser resultado de la exposición a riesgos en el trabajo.',
              basePrice: 25145
          },
          VIS: {
              code: 'VIS',
              fullName: 'VISIOMETRÍA',
              description: 'Mide la agudeza visual y otras capacidades visuales importantes para el trabajo.',
              basePrice: 16000
          },
          ECG: {
              code: 'ECG',
              fullName: 'ELECTROCARDIOGRAMA',
              description: 'Registra la actividad eléctrica del corazón para detectar enfermedades cardíacas.',
              basePrice: 44940
          },
          RXC: {
              code: 'RXC',
              fullName: 'RAYOS X DE COLUMNA',
              description: 'Obtiene imágenes de la columna vertebral para identificar lesiones o condiciones que puedan afectar la salud del trabajador.',
              basePrice: 74900
          },
          PSM: {
              code: 'PSM',
              fullName: 'PRUEBA PSICOSENSOMETRICA',
              description: 'Evalúa habilidades sensoriales y motoras importantes para ciertas tareas laborales.',
              basePrice: 43000
          },
          PST: {
              code: 'PST',
              fullName: 'PRUEBA PSICOTECNICA',
              description: 'Mide aptitudes y habilidades cognitivas relevantes para el desempeño laboral.',
              basePrice: 37450
          },
          FRO: {
              code: 'FRO',
              fullName: 'FROTIS FARINGEO',
              description: 'prueba de laboratorio que se realiza para detectar infecciones en la garganta, especialmente aquellas causadas por bacterias como el estreptococo.',
              basePrice: 13500
          },
          GLI: {
              code: 'GLI',
              fullName: 'GLICEMIA',
              description: 'Mide los niveles de azúcar en sangre para identificar diabetes u otras condiciones metabólicas.',
              basePrice: 16050
          },
          CH: {
              code: 'CH',
              fullName: 'CUADRO HEMATICO',
              description: 'Cuadro Hematico',
              basePrice: 18500
          },
          RH: {
              code: 'RH',
              fullName: 'HEMOCLASIFICIÓN GRUPO ABO Y FACTOR RH',
              description: 'análisis de sangre que determina el tipo de sangre de una persona.',
              basePrice: 14980
          },
          KOH: {
              code: 'KOH',
              fullName: 'PRUEBA DE KOH',
              description: 'son las siglas de hidróxido de potasio, un compuesto químico que se utiliza en la prueba de KOH para diagnosticar infecciones por hongos.',
              basePrice: 13500
          },
          BUN: {
              code: 'BUN',
              fullName: 'NITROGENO UREICO [BUN]',
              description: 'Exámen de laboratorio de nitrogeno ureico en sangre',
              basePrice: 14980
          },
          PL: {
              code: 'PL',
              fullName: 'PERFIL LIPÍDICO',
              description: 'Mide los niveles de colesterol y triglicéridos para evaluar el riesgo cardiovascular.',
              basePrice: 34240
          },
          PAS: {
              code: 'PAS',
              fullName: 'PRUEBA DE ALCOHOL EN SALIVA',
              description: 'Detectan consumo reciente de alcohol.',
              basePrice: 42800
          },
          PE: {
              code: 'PE',
              fullName: 'PRUEBA DE EMBARAZO',
              description: 'Confirma o descarta un embarazo.',
              basePrice: 19260
          },
          PSP: {
              code: 'PSP',
              fullName: 'PRUEBA DE SUSTANCIAS PSICOACTIVAS',
              description: 'Detectan el consumo de drogas.',
              basePrice: 36380
          },
          TGO: {
              code: 'TGO',
              fullName: 'TRANSAMINASAS TGO',
              description: 'Evalúan la función hepática. Colesterol: Mide los niveles de colesterol en sangre.',
              basePrice: 19260
          },
          TGP: {
              code: 'TGP',
              fullName: 'TRANSAMINASAS TGP',
              description: 'Evalúan la función hepática. Colesterol: Mide los niveles de colesterol en sangre.',
              basePrice: 19260
          },
          TRI: {
              code: 'TRI',
              fullName: 'TRIGLICÉRIDOS',
              description: 'Mide los niveles de triglicéridos en sangre.',
              basePrice: 16050
          },
          COL: {
              code: 'COL',
              fullName: 'COLESTEROL',
              description: 'Mide los niveles de colesterol en sangre.',
              basePrice: 16050
          },
          COP: {
              code: 'COP',
              fullName: 'COPROLOGICO',
              description: 'Coprologico',
              basePrice: 13500
          },
          LEP: {
              code: 'LEP',
              fullName: 'LEPTOSPIRA',
              description: 'Leptospira',
              basePrice: 90415
          },
          BRU: {
              code: 'BRU',
              fullName: 'BRUCELA',
              description: 'Brucela',
              basePrice: 84530
          },
          TOX: {
              code: 'TOX',
              fullName: 'TOXOPLASMA',
              description: 'Toxoplasma',
              basePrice: 55000
          },
          COLI: {
              code: 'COLI',
              fullName: 'COLINESTERASA',
              description: 'colinesterasa',
              basePrice: 53500
          },
          COLI: {
              code: 'COLI',
              fullName: 'COLINESTERASA',
              description: 'colinesterasa',
              basePrice: 53500
          },
          CRE: {
              code: 'CRE',
              fullName: 'CREATININA',
              description: 'creatinina',
              basePrice: 19000
          },
          ORI: {
              code: 'ORI',
              fullName: 'PARCIAL DE ORINA',
              description: 'parcial de orina',
              basePrice: 19500
          },
          TET: {
              code: 'TET',
              fullName: 'VACUNA DEL TETANO',
              description: 'vacuna del tetano',
              basePrice: 43000
          }


        // Aquí irían los demás exámenes según la configuración proporcionada
    };

    /**
     * Configuración de rangos de descuento por número de trabajadores
     * Define los descuentos aplicables según la cantidad de trabajadores
     */
    const DISCOUNT_RANGES = {

        '0-7': { min: 0, max: 7, discount: 0.0 },
        '8-10': { min: 1, max: 10, discount: 0.05 },
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
                                    <p class="discount-description">quiero hacer todos los examenes medicos de mi equipo en el menor tiempo posible.</p>
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
            const indicativeDiscount = 0.35; // 35%
            const displayPrice = exam.basePrice * (1 - indicativeDiscount);
            priceElement.textContent = formatUtils.formatCurrency(displayPrice);
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
                onSuccess: (formData) => { // <--- formData está disponible aquí
                    console.log("Datos del formulario recibidos:", formData); // Para depuración
                    // *** PASAR formData A LA SIGUIENTE FUNCIÓN ***
                    this.generateAndDownloadFile(formData);
                },
                onError: (error) => {
                    console.error('Error en el formulario:', error);
                    alert('Hubo un error al procesar su solicitud. Por favor intente nuevamente.');
                }
            });

            contactForm.showForm(); // Muestra el formulario
        }
        
        // Método separado para la generación y descarga
                // Método mejorado para generar y descargar el PDF ESTILIZADO Y COMPLETO
        // Versión MUY MEJORADA para generar y descargar el PDF ESTILIZADO Y COMPLETO v2
        async generateAndDownloadFile(formData) {
            try {
                // ... (Validación de formData como antes) ...
                if (!formData || !formData.company || !formData.fullName) {
                     console.error("Faltan datos del formulario para generar el PDF completo.");
                     alert("Error: No se recibieron los datos del cliente para la cotización.");
                     return;
                 }

                const quotationData = this.generateQuotationData();

                // --- CONFIGURACIÓN Y DATOS ESTÁTICOS ---
                const ADVISOR_WHATSAPP = "+573042014236"; // !! REEMPLAZA !!
                const COMMERCIAL_WHATSAPP = "+573205803048"; // !! REEMPLAZA !!
                const COMPANY_NAME = "Genesys Laboral Medicine S.A.S";
                const COMPANY_WEBSITE = "www.genesyslm.com.co";
                const VALIDITY_DAYS = 30; // Días de validez de la cotización

                // Logos Base64 (Cadenas largas)
                const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZ8AAACqCAYAAAByIkI+AAAACXBIWXMAABYlAAAWJQFJUiTwAAAE7mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTZhNjM5NiwgMjAyNC8wMy8xMi0wNzo0ODoyMyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wNy0wNVQyMjowNjoyMS0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDctMDhUMTk6MjA6NDctMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDctMDhUMTk6MjA6NDctMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjEyOGEyZDcyLTk5NTktMGI0Mi04MTA5LWVkNTVkODZhYjI2NSIgeG1wTU06RG9jdW1lbnRJRD0i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'; // !! TU LOGO PRINCIPAL BASE64 !!
                const snsLogoBase64 = 'data:image/png;base64,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'; // !! LOGO SUPERSALUD BASE64 !!



                // Colores (Ajusta si es necesario)
                const primaryColor = '#4ECDC4';
                const secondaryColor = '#333333';
                const accentColor = '#F0F0F0';
                const whiteColor = '#FFFFFF';
                const highlightColor = '#566E8F'; // Gris azulado

                // Textos (Ajusta)
                const introText = `Estimados colaboradores de ${formData.company},\n\nEn ${COMPANY_NAME}, comprendemos que el bienestar y la seguridad de su equipo son pilares fundamentales para el crecimiento y éxito de su organización. Más que un proveedor de exámenes médicos ocupacionales, aspiramos a ser su aliado estratégico en la gestión de la salud laboral.\n\nEsta cotización ha sido cuidadosamente preparada para reflejar sus necesidades específicas, ofreciéndole una solución transparente, ágil y totalmente alineada con la normativa colombiana vigente. Queremos que tenga la certeza de estar invirtiendo no solo en cumplimiento, sino en la salud y productividad de su talento humano.`;
                const benefitsText = `Esta cotización es un excelente punto de partida. Sin embargo, sabemos que cada empresa es única. ¿Le gustaría explorar cómo podemos optimizar aún más su inversión, diseñar un paquete totalmente personalizado o descubrir cómo nuestra plataforma puede integrarse para simplificar radicalmente su gestión de salud ocupacional? Nuestro equipo comercial está listo para escucharle.`;
                const paymentMethodsText = `Pensando en su comodidad, aceptamos diversas formas de pago:`;
                const paymentMethodsList = `• Transferencia Bancaria\n• Tarjetas de Crédito y Débito (a través de pasarela Bold)\n• Nequi\n• Daviplata`;
                // !! REEMPLAZA CON TUS DATOS BANCARIOS REALES !!
                const bankDetailsText = `Datos Bancarios:\nBanco: [Nombre Banco]\nTipo Cuenta: [Ahorros/Corriente]\nNúmero Cuenta: [Tu Número]\nNombre Titular: ${COMPANY_NAME}\nNIT: [Tu NIT]`;
                const signatureName = "Dra. Fanny Ramirez Nuñez";
                const signatureTitle = "Directora Comercial | Optómetra Esp. SST";

                // --- INICIALIZACIÓN DEL DOCUMENTO ---
                const doc = new jsPDF('p', 'mm', 'a4');
                addPoppinsFont(doc);

                const pageHeight = doc.internal.pageSize.height;
                const pageWidth = doc.internal.pageSize.width;
                const margin = 15;
                const contentWidth = pageWidth - margin * 2;
                let y = margin; // Posición Y inicial
                let currentPage = 1; // Contador de páginas actual
                let totalPages = 1; // Placeholder inicial, se actualizará al final


                // --- FUNCIONES HELPER (addText, addLine - Mantener las de la versión anterior) ---
                 const addText = (text, x, currentY, options = {}) => {
                    // ... (Misma función addText que antes, asegurando manejo de saltos de página y actualizando currentPage si ocurre) ...
                     const { fontSize = 10, style = 'normal', color = secondaryColor, align = 'left', maxWidth = contentWidth, link = null } = options;

                     doc.setFont('Poppins', style);
                     doc.setFontSize(fontSize);
                     doc.setTextColor(color);

                     const splitText = doc.splitTextToSize(text, maxWidth);
                     let textHeight = doc.getTextDimensions(splitText).h;
                     textHeight += (splitText.length > 1 ? splitText.length * 0.8 : 0); // Ajuste interlineado

                     // *** IMPORTANTE: Chequeo de salto de página ***
                     if (currentY + textHeight > pageHeight - margin - 10) { // Dejar espacio para footer
                         // Antes de añadir página, actualizar totalPages si es la primera vez que se supera
                         // if (currentPage >= totalPages) { totalPages++; } // Esto no es fiable aquí

                         doc.addPage();
                         currentPage++; // Incrementar número de página actual
                         // OJO: El footer se añadirá al final globalmente
                         currentY = margin + 15; // Reset Y en nueva página
                     }

                     doc.text(splitText, x, currentY, { align: align, maxWidth: maxWidth });

                     if (link) {
                         doc.link(x, currentY - textHeight * 0.8, doc.getStringUnitWidth(splitText[0]) * fontSize / doc.internal.scaleFactor, textHeight, { url: link });
                     }

                     return currentY + textHeight + 1;
                 };

                const addLine = (currentY, lineMargin = 0) => {
                    // ... (Misma función addLine que antes, asegurando manejo de saltos de página y actualizando currentPage si ocurre) ...
                     if (currentY > pageHeight - margin - 10) { // Evitar línea justo antes del footer
                         doc.addPage();
                         currentPage++;
                         currentY = margin + 15;
                     }
                    doc.setDrawColor(accentColor);
                    doc.setLineWidth(0.3);
                    doc.line(margin + lineMargin, currentY, pageWidth - margin - lineMargin, currentY);
                    return currentY + 2;
                };

                // --- ENCABEZADO Y PIE DE PÁGINA (Función revisada) ---
                const addHeaderFooter = (docInstance, pageNum, totalPageNum) => { // Acepta totalPages
                    // ... (Encabezado con logo principal como antes) ...
                     try {
                         const logoWidth = 38; const logoHeight = 15;
                         if (logoBase64 && logoBase64.startsWith('data:image')) {
                            docInstance.addImage(logoBase64, 'PNG', margin, margin / 2, logoWidth, logoHeight);
                         } else { /* Fallback texto */ docInstance.text(COMPANY_NAME, margin, margin/2 + 5); }
                     } catch (e) { /* Fallback texto */ docInstance.text(COMPANY_NAME, margin, margin/2 + 5); }

                    // Info derecha del encabezado
                    docInstance.setFont('Poppins', 'normal');
                    docInstance.setFontSize(8);
                    docInstance.setTextColor(secondaryColor);
                    const headerRightX = pageWidth - margin;
                    docInstance.text('COTIZACIÓN EXÁMENES OCUPACIONALES', headerRightX, margin / 2 + 5, { align: 'right' });
                    docInstance.text(`Fecha: ${quotationData.date}`, headerRightX, margin / 2 + 10, { align: 'right' });


                    // *** Pie de página ***
                    const footerY = pageHeight - margin / 2 - 2;
                    docInstance.setFont('Poppins', 'normal');
                    docInstance.setFontSize(8);
                    docInstance.setTextColor(secondaryColor);
                    docInstance.setDrawColor(accentColor);
                    docInstance.setLineWidth(0.2);
                    docInstance.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

                    // *** CORRECCIÓN PAGINACIÓN: Usar totalPageNum ***
                    docInstance.text(`Página ${pageNum} de ${totalPageNum}`, pageWidth / 2, footerY, { align: 'center' });
                    docInstance.text(COMPANY_WEBSITE, margin, footerY, { align: 'left'});
                    docInstance.text(`Contacto Comercial: ${COMMERCIAL_WHATSAPP}`, headerRightX, footerY, { align: 'right'});
                };


                // --- INICIO DEL CONTENIDO PRINCIPAL ---
                // OJO: El header/footer se aplica en un bucle al FINAL. No aquí.
                y += 20; // Espacio inicial

                // --- Datos del Cliente ---
                // ... (Como antes: Cotización para, Empresa, Atención) ...
                y = addLine(y); y += 3;
                doc.setFont('Poppins', 'bold');
                y = addText('Cotización Para:', margin, y, { fontSize: 11, style: 'bold', color: highlightColor });
                doc.setFont('Poppins', 'normal');
                y = addText(`Empresa: ${formData.company}`, margin + 5, y, { fontSize: 10 });
                y = addText(`Atención: ${formData.fullName}`, margin + 5, y, { fontSize: 10 });
                y += 5;


                // --- Texto Introductorio ---
                // ... (Como antes) ...
                 y = addLine(y); y += 4;
                 y = addText(introText, margin, y, { fontSize: 10 });
                 y += 5;

                // --- Título Principal ---
                // ... (Como antes: Detalle de la Cotización) ...
                 doc.setFont('Poppins', 'bold'); doc.setFontSize(16); doc.setTextColor(primaryColor);
                 y = addText('Detalle de la Cotización', margin, y, { fontSize: 16, style: 'bold', color: primaryColor });
                 y += 6;

                // --- Detalles por Cargo ---
                // ... (Mismo código que antes para iterar cargos y exámenes, usando addText y addLine) ...
                // --- Detalles por Cargo (con lógica de página mejorada) ---
                quotationData.cargos.forEach((cargo, index) => {
                    if (index > 0) y = addLine(y, 5); // Línea separadora entre cargos
                    y += 4;

                    doc.setFont('Poppins', 'bold');
                    let cargoHeader = `Cargo: ${cargo.name} (${cargo.workers} trabajador${cargo.workers !== 1 ? 'es' : ''})`;
                    y = addText(cargoHeader, margin, y, { fontSize: 12, style: 'bold', color: secondaryColor });
                    y += 2;

                    doc.setFont('Poppins', 'normal');
                    doc.setFontSize(9);
                    if (cargo.exams.length > 0) {
                         let examListStartY = y; // Guardar Y antes de 'Exámenes incluidos:'
                         y = addText('Exámenes incluidos:', margin + 3, examListStartY, { fontSize: 9, style: 'italic', color: highlightColor});

                         // *** INICIO DEL BLOQUE MEJORADO CON PRE-VERIFICACIÓN DE PÁGINA ***
                         cargo.exams.forEach(exam => {
                            let examLineText = `- ${exam.name}`;
                            let priceText = `(${formatUtils.formatCurrency(exam.unitPrice)} c/u)`;
                            const fontSize = 9;
                            const lineHeight = doc.getTextDimensions('Test', { fontSize: fontSize }).h * 1.15; // Altura estimada por línea con espaciado

                            // --- Calcular espacio necesario ANTES de dibujar ---
                            let priceWidth = doc.getStringUnitWidth(priceText) * fontSize / doc.internal.scaleFactor;
                            let availableNameWidth = contentWidth - priceWidth - 3; // Ancho para nombre si precio va al lado

                            let splitExamNameForHeightCalc = doc.splitTextToSize(examLineText, contentWidth); // Dividir nombre usando ancho completo
                            let examNameHeight = doc.getTextDimensions(splitExamNameForHeightCalc).h * 1.1; // Altura estimada del nombre (con pequeño margen)

                            let splitExamNameSingleLineCheck = doc.splitTextToSize(examLineText, availableNameWidth);
                            let examNameSingleLineHeightCheck = doc.getTextDimensions(splitExamNameSingleLineCheck).h;

                            let neededHeight = 0;
                            let isSingleLineCase = (examNameSingleLineHeightCheck <= lineHeight * 1.1); // Aproximado

                            if (isSingleLineCase) {
                                // Si cabe en una línea, solo necesita esa altura
                                neededHeight = lineHeight;
                            } else {
                                // Si no, necesita altura del nombre + altura del precio + espacio
                                neededHeight = examNameHeight + lineHeight + 1; // +1 para espacio entre nombre y precio
                            }

                            // --- Verificar si el espacio necesario cabe en la página actual ---
                            if (y + neededHeight > pageHeight - margin - 10) { // Margen para footer
                                doc.addPage();
                                currentPage++;
                                // Redibujar 'Exámenes incluidos:' en la nueva página si es el primer examen que salta
                                // O simplemente resetear 'y' si ya se dibujó algo en la página anterior
                                y = margin + 15; // Reset Y en la nueva página (debajo del header)
                                // Opcional: Podrías redibujar el título "Exámenes incluidos:" si quieres que aparezca en la nueva página también
                                // y = addText('Exámenes incluidos:', margin + 3, y, { fontSize: 9, style: 'italic', color: highlightColor});
                            }

                            // --- Ahora, dibujar el contenido sabiendo que cabe ---
                            let examDrawStartY = y; // Y actual para dibujar este examen

                            if (isSingleLineCase) {
                                // --- Caso 1: Dibujar en una línea ---
                                addText(examLineText, margin + 5, examDrawStartY, { fontSize: fontSize, maxWidth: availableNameWidth });
                                addText(priceText, pageWidth - margin, examDrawStartY, { fontSize: fontSize, align: 'right' });
                                y = examDrawStartY + lineHeight; // Avanzar una línea estimada
                            } else {
                                // --- Caso 2: Nombre en varias líneas, precio debajo ---
                                y = addText(examLineText, margin + 5, examDrawStartY, { fontSize: fontSize, maxWidth: contentWidth }); // Dibuja nombre, actualiza y
                                y = addText(priceText, pageWidth - margin, y, { fontSize: fontSize, align: 'right' }); // Dibuja precio debajo, actualiza y
                            }
                         }); // Fin del forEach de exámenes
                         // *** FIN DEL BLOQUE MEJORADO ***

                         y += 2; // Espacio después de la lista de exámenes
                    } else {
                        y = addText('No se seleccionaron exámenes para este cargo.', margin + 5, y, { fontSize: 9, style: 'italic' });
                        y += 2;
                    }

                   // Subtotal del cargo (Alineado a la derecha)
                   y = addText(`Subtotal Cargo: ${formatUtils.formatCurrency(cargo.subtotal)}`, contentWidth + margin, y, { fontSize: 10, style: 'bold', align: 'right' });
                   y += 7; // Más espacio entre cargos
                }); // Fin del forEach de cargos // Fin del forEach de cargos

                // --- Resumen y Totales ---
                 y = addLine(y); y += 5;
                 doc.setFont('Poppins', 'bold'); doc.setFontSize(14); doc.setTextColor(primaryColor);
                 y = addText('Resumen General', margin, y, { fontSize: 14, style: 'bold', color: primaryColor }); y += 4;

                 const addSummaryLine = (label, value, currentY, options = {}) => { /* ... misma función que antes ... */
                     const { style = 'normal', fontSize = 10 } = options;
                     let textHeightLabel = doc.getTextDimensions(doc.splitTextToSize(label, contentWidth * 0.6)).h;
                     let textHeightValue = doc.getTextDimensions(doc.splitTextToSize(value, contentWidth * 0.35)).h;
                     let maxHeight = Math.max(textHeightLabel, textHeightValue);

                     if (currentY + maxHeight > pageHeight - margin - 10) {
                         doc.addPage(); currentPage++; currentY = margin + 15;
                     }

                     let labelY = addText(label, margin, currentY, { fontSize: fontSize, style: style, maxWidth: contentWidth * 0.6 });
                     // Ajustar Y para el valor basado en la altura real del label añadido
                     let valueYPos = labelY - maxHeight - 1; // Posicionar en la misma "línea" visual inicial
                     let valueY = addText(value, pageWidth - margin, valueYPos , { fontSize: fontSize, style: style, align: 'right', maxWidth: contentWidth * 0.35 });

                     // La Y final es la del elemento que quedó más abajo
                     return Math.max(labelY, valueY); // No sumar el +1 aquí, ya lo hace addText
                 };


                 y = addSummaryLine('Subtotal General (antes de descuentos):', formatUtils.formatCurrency(quotationData.summary.overallSubtotal), y);
                 y = addSummaryLine(`Descuento por volumen (${quotationData.summary.totalWorkers} trabajadores):`, `-${quotationData.summary.volumeDiscountPercent.toFixed(0)}%`, y);
                 if (quotationData.summary.timeDiscountApplied) {
                     y = addSummaryLine('Descuento adicional por programación:', `-${quotationData.summary.timeDiscountPercent}%`, y);
                 }
                 y += 3;
                // *** CORRECCIÓN SOLAPAMIENTO: Dibuja la línea ANTES del texto y precio final ***
                 y = addLine(y, 5); // Línea antes del total final
                 y += 4; // Más espacio antes del texto total

                // *** TOTAL FINAL (Destacado) ***
                 doc.setFont('Poppins', 'bold');
                 let totalLabelY = addText('Valor Total Estimado (COP):', margin, y, { fontSize: 14, style: 'bold', color: primaryColor });
                 let totalPriceY = addText(formatUtils.formatCurrency(quotationData.summary.finalPrice), pageWidth - margin, y, { fontSize: 16, style: 'bold', color: primaryColor, align: 'right'});
                 y = Math.max(totalLabelY, totalPriceY) + 5; // Usar la Y más baja y añadir espacio después


                // --- **NUEVO: Sección Validez** ---
                y = addLine(y); y += 4;
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + VALIDITY_DAYS);
                const formattedExpirationDate = expirationDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
                doc.setFont('Poppins', 'bold');
                y = addText('Validez de la Cotización:', margin, y, { fontSize: 11, style: 'bold', color: highlightColor });
                doc.setFont('Poppins', 'normal');
                y = addText(`Valoramos su tiempo. Esta propuesta comercial tiene una validez de ${VALIDITY_DAYS} días calendario, hasta el ${formattedExpirationDate}. ¡Aproveche estos precios asegurando su servicio pronto!`, margin + 3, y, { fontSize: 10 });
                y += 7;

                // --- **NUEVO: Sección Beneficios Clave** ---
                y = addLine(y); y += 4;
                doc.setFont('Poppins', 'bold');
                y = addText('¿Por qué elegirnos?', margin, y, { fontSize: 12, style: 'bold', color: primaryColor });
                y += 2;
                doc.setFont('Poppins', 'normal');
                // Usar viñetas Unicode (•) o preparar iconos base64 si prefieres
                let benefitY = y; // Guardar Y para logo SNS
                benefitY = addText("• Más de 7 años de experiencia en salud ocupacional.", margin + 5, benefitY, { fontSize: 10 });
                benefitY = addText("• Entrega de resultados certificados en 24 horas hábiles.", margin + 5, benefitY, { fontSize: 10 });
                benefitY = addText("• Procesos ágiles y tecnología al servicio de su empresa.", margin + 5, benefitY, { fontSize: 10 });
                benefitY = addText("• Avalados por:", margin + 5, benefitY, { fontSize: 10 }); // Añadir espacio para logo SNS

                // Añadir Logo SuperSalud
                try {
                    const snsLogoWidth = 28; // Ajustar tamaño
                    const snsLogoHeight = 10; // Ajustar tamaño
                    const snsLogoX = margin + 5 + doc.getStringUnitWidth("• Avalados por:") * 10 / doc.internal.scaleFactor + 5; // Posicionar después del texto
                    if (snsLogoBase64 && snsLogoBase64.startsWith('data:image')) {
                        doc.addImage(snsLogoBase64, 'PNG', snsLogoX, benefitY - snsLogoHeight, snsLogoWidth, snsLogoHeight);
                    }
                } catch (e) { console.error("Error al añadir logo SNS", e); }
                y = benefitY + 3; // Actualizar Y global
                y += 7;


                

                // --- **NUEVO: Sección Formas de Pago** ---
                 y = addLine(y); y += 4;
                 doc.setFont('Poppins', 'bold');
                 y = addText('Formas de Pago', margin, y, { fontSize: 12, style: 'bold', color: primaryColor });
                 y += 2;
                 doc.setFont('Poppins', 'normal');
                 y = addText(paymentMethodsText, margin, y, { fontSize: 10 });
                 y += 3;
                 y = addText(paymentMethodsList, margin, y, { fontSize: 10 });
                 y += 3;
                 // Datos Bancarios (usar fuente más pequeña)
                 y = addText(bankDetailsText, margin, y, { fontSize: 9, color: secondaryColor });
                 y += 7;


                // --- Sección Comercial y Próximos Pasos ---
                 y = addLine(y); y += 5;
                 doc.setFont('Poppins', 'bold');
                 y = addText('¿Necesita una Solución a Medida?', margin, y, { fontSize: 12, style: 'bold', color: highlightColor });
                 doc.setFont('Poppins', 'normal');
                 y = addText(benefitsText, margin, y, { fontSize: 10 }); y += 3;
                 let whatsappLinkCommercial = `https://wa.me/${COMMERCIAL_WHATSAPP.replace(/\D/g,'')}`;
                 y = addText(`Contacta a nuestra área comercial: ${COMMERCIAL_WHATSAPP}`, margin, y, { fontSize: 10, color: primaryColor, style:'bold', link: whatsappLinkCommercial}); y += 7;

                 // --- Información Asesor ---
                 doc.setFont('Poppins', 'normal');
                 y = addText(`Para aclarar dudas sobre esta cotización, puede contactar a su asesor:`, margin, y, {fontSize: 10});
                 let whatsappLinkAdvisor = `https://wa.me/${ADVISOR_WHATSAPP.replace(/\D/g,'')}`;
                 y = addText(`WhatsApp Asesor: ${ADVISOR_WHATSAPP}`, margin, y, { fontSize: 10, style: 'bold', color: primaryColor, link: whatsappLinkAdvisor });
                 y += 10;

                // --- **NUEVO: Firma** ---
                y = addLine(y); y+=5;
                doc.setFont('Poppins', 'normal');
                y = addText('Cordialmente,', margin, y, { fontSize: 11 });
                // Aquí podrías intentar añadir una imagen de firma si la tienes en Base64
                // y = addImage(firmaBase64, 'PNG', margin, y, anchoFirma, altoFirma); y += altoFirma;
                y += 8; // Espacio para firma (o imagen)
                doc.setFont('Poppins', 'bold');
                y = addText(signatureName, margin, y, { fontSize: 11, style: 'bold' });
                doc.setFont('Poppins', 'normal');
                y = addText(signatureTitle, margin, y, { fontSize: 10 });
                y += 5;


                // --- *** CORRECCIÓN FINAL PAGINACIÓN *** ---
                totalPages = doc.internal.getNumberOfPages(); // Obtener el número total REAL de páginas
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i); // Ir a la página i
                    addHeaderFooter(doc, i, totalPages); // Llamar a la función con el número de página actual Y el total
                }

                // --- GUARDAR EL PDF ---
                // ... (Mismo código de guardado que antes) ...
                 const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
                 const safeCompanyName = formData.company.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
                 doc.save(`Cotizacion_${safeCompanyName}_${timestamp}.pdf`);
                 console.log('Cotización PDF v2 generada exitosamente.');


            } catch (error) {
                // ... (Manejo de errores como antes) ...
                 console.error('Error al generar la cotización PDF v2:', error);
                 alert('Hubo un error al generar la cotización en PDF v2. Detalles en consola.');
            }
        }

        /**
         * Genera el contenido detallado de la cotización
         * @returns {string} Contenido formateado de la cotización
         * @private
         */
        // Dentro de la clase MedicalExamCalculator
        generateQuotationData() { // Cambiado el nombre y la salida
            const date = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
            const cargosDetails = [];
            let overallSubtotal = 0;

            this.cargos.forEach(cargo => {
                const examsDetails = [];
                let cargoSubtotal = 0;
                cargo.selectedExams.forEach(examCode => {
                    const exam = EXAM_CONFIG[examCode];
                    if (exam) {
                        const examTotal = exam.basePrice * cargo.workers;
                        cargoSubtotal += examTotal;
                        examsDetails.push({
                            code: exam.code,
                            name: exam.fullName,
                            unitPrice: exam.basePrice,
                            total: examTotal
                        });
                    }
                });
                overallSubtotal += cargoSubtotal;
                cargosDetails.push({
                    name: cargo.name,
                    workers: cargo.workers,
                    exams: examsDetails,
                    subtotal: cargoSubtotal
                });
            });

            const totalWorkers = this.cargos.reduce((sum, cargo) => sum + cargo.workers, 0);
            const volumeDiscount = this.calculateVolumeDiscount();
            const timeDiscountApplied = this.discountCheckboxes.time.checked;
            let finalPrice = overallSubtotal * (1 - volumeDiscount);
            if (timeDiscountApplied) {
                finalPrice *= 0.95; // 5% adicional
            }

            // Devuelve un objeto con toda la información necesaria
            return {
                title: 'Cotización de Exámenes Médicos Ocupacionales',
                date: date,
                cargos: cargosDetails,
                summary: {
                    totalWorkers: totalWorkers,
                    volumeDiscountPercent: (volumeDiscount * 100),
                    timeDiscountApplied: timeDiscountApplied,
                    timeDiscountPercent: 5,
                    overallSubtotal: overallSubtotal, // Subtotal antes de descuentos
                    finalPrice: finalPrice
                }
            };
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