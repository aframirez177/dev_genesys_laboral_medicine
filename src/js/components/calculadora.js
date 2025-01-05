// calculator.js

/**
 * Módulo de utilidades para el formateo de moneda
 */
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
* Configuración de exámenes médicos con nombres completos, descripciones y precios base
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

  // ... Configuración para cada examen según la tabla proporcionada
};

/**
* Configuración de rangos de descuento por número de trabajadores
*/
const DISCOUNT_RANGES = {
  '1-10': { min: 1, max: 10, discount: 0.05 },
  '11-50': { min: 11, max: 50, discount: 0.10 },
  '51-100': { min: 51, max: 100, discount: 0.15 },
  '101-500': { min: 101, max: 500, discount: 0.20 },
  '501+': { min: 501, max: Infinity, discount: 0.25 }
};

/**
* Clase principal para la calculadora de exámenes médicos
*/
class MedicalExamCalculator {
  constructor() {

      localStorage.removeItem('calculatorState');

      this.cargos = [];
      this.nextCargoId = 1;
      this.selectedExams = new Map();
      this.initializeElements();
      this.bindEvents();
  }

  /**
   * Inicializa las referencias a elementos del DOM
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
   */
  generateCalculatorHTML() {
      return `
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
                              <p class="discount-description">Por el tamaño de tu empresa tienes un beneficio</p>
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
   * Vincula todos los eventos necesarios
   */
  bindEvents() {
      // Evento para agregar nuevo cargo
      this.addCargoButton.addEventListener('click', () => this.addCargo());

      // Eventos para los descuentos
      Object.values(this.discountCheckboxes).forEach(checkbox => {
          checkbox.addEventListener('change', () => this.updateTotals());
      });

      // Agregar este event listener específico para clicks
      this.cargoContainer.addEventListener('click', (e) => {
          const target = e.target;
          if (target.classList.contains('toggle-cargo')) {
              const cargoElement = target.closest('.cargo');
              this.toggleCargo(cargoElement);
          }
          // Manejo de eliminación
          if (target.classList.contains('delete-cargo')) {
              const cargoElement = target.closest('.cargo');
              this.removeCargo(cargoElement);
          }
      });

      // Delegación de eventos para los cargos
      this.cargoContainer.addEventListener('input', (e) => {
          const target = e.target;

          // Este evento se dispara mientras el usuario escribe
          if (target.classList.contains('cargo-name')) {
              this.updateCargoName(target);
              this.updateTotals(); // Actualizamos inmediatamente
          }
          
          // Manejo de minimizar/maximizar
          if (target.classList.contains('toggle-cargo')) {
              const cargoElement = target.closest('.cargo');
              this.toggleCargo(cargoElement);
          }

      });

      // Cambios en inputs y checkboxes
      this.cargoContainer.addEventListener('change', (e) => {
          const target = e.target;
          
          if (target.classList.contains('exam-checkbox')) {
              this.updateExamSelection(target);
          }
          
          if (target.classList.contains('num-trabajadores')) {
              this.updateWorkerCount(target);
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
   */
  generateCargoHTML(id, isExpanded = true) {
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

      return `
          <div class="cargo" data-cargo-id="${id}">
              <div class="cargo-header">
                  <input type="text" 
                         class="cargo-name" 
                         placeholder="Ingresa el nombre del cargo"
                         value="Cargo ${id}">
                  <div class="cargo-controls">
                  <button class="toggle-cargo">
                  <input type="number" 
                         class="num-trabajadores" 
                         min="1" 
                         value="1">
                          ${isExpanded ? '-' : '+'}
                      </button>
                      ${id !== 1 ? '<button class="delete-cargo">×</button>' : ''}
                  </div>
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
   */
  addFirstCargo() {
      // Limpiamos el contenedor de cargos
      this.cargoContainer.innerHTML = '';
      
      // Creamos el primer cargo
      const cargoHtml = this.generateCargoHTML(this.nextCargoId);
      this.cargoContainer.innerHTML = cargoHtml; // Usamos innerHTML en lugar de insertAdjacentHTML
      
      // Reiniciamos el array de cargos con solo uno
      this.cargos = [{
          id: this.nextCargoId,
          name: `Cargo ${this.nextCargoId}`,
          workers: 1,
          selectedExams: new Set()
      }];

      this.nextCargoId++;
      this.updateTotals();
  }

  /**
   * Agrega un nuevo cargo a la calculadora
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

      // Guardar estado
      this.saveState();
  }

  /**
   * Elimina un cargo existente
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
   */
  toggleCargo(cargoElement) {
      const body = cargoElement.querySelector('.cargo-body');
      const toggleButton = cargoElement.querySelector('.toggle-cargo');
      
      body.classList.toggle('hidden');
      toggleButton.textContent = body.classList.contains('hidden') ? '+' : '-';
  }

  /**
   * Actualiza el nombre de un cargo
   */
  updateCargoName(input) {
      const cargoId = parseInt(input.closest('.cargo').dataset.cargoId);
      const cargo = this.cargos.find(c => c.id === cargoId);
      
      if (cargo) {
          cargo.name = input.value.trim() || `Cargo ${cargoId}`;
          this.saveState();
      }
  }

  /**
   * Actualiza la selección de exámenes para un cargo
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

      /* Formatea valores monetarios y agrega las clases para estilos
  * @param {number} amount - La cantidad a formatear
  * @param {boolean} isLarge - Si es true, usa la clase para texto grande
  * @returns {string} El HTML con el valor formateado y las clases correspondientes
  */
  formatMoneyValue(amount, isLarge = false) {
      const formattedValue = formatUtils.formatCurrency(amount);
      const sizeClass = isLarge ? 'larger' : 'smaller';
      return `<span class="valor-cantidad ${sizeClass}">${formattedValue}</span>`;
  }

  /**
   * Calcula el descuento aplicable según el número total de trabajadores
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

          // Siempre mostramos el paquete, sin importar si cargoTotal es 0
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

      // Calcular descuentos
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
   * Guarda el estado actual de la calculadora en localStorage
   */
  saveState() {
      const state = {
          cargos: this.cargos,
          nextCargoId: this.nextCargoId,
          discounts: {
              time: this.discountCheckboxes.time.checked
          }
      };
      
      try {
          localStorage.setItem('calculatorState', JSON.stringify(state));
      } catch (error) {
          console.error('Error al guardar estado:', error);
      }
  }

  /**
   * Restaura el estado de la calculadora desde localStorage
   */
  restoreState() {
      try {
          const savedState = localStorage.getItem('calculatorState');
          if (!savedState) return false;

          const state = JSON.parse(savedState);
          
          // Limpiar estado actual
          this.cargoContainer.innerHTML = '';
          this.cargos = [];
          
          // Restaurar cargos
          state.cargos.forEach(cargo => {
              this.nextCargoId = cargo.id;
              const cargoHtml = this.generateCargoHTML(cargo.id);
              this.cargoContainer.insertAdjacentHTML('beforeend', cargoHtml);
              
              // Restaurar valores del cargo
              const cargoElement = this.cargoContainer.querySelector(`[data-cargo-id="${cargo.id}"]`);
              if (cargoElement) {
                  cargoElement.querySelector('.cargo-name').value = cargo.name;
                  cargoElement.querySelector('.num-trabajadores').value = cargo.workers;
                  
                  // Restaurar exámenes seleccionados
                  cargo.selectedExams.forEach(examCode => {
                      const checkbox = cargoElement.querySelector(`[data-exam-code="${examCode}"]`);
                      if (checkbox) checkbox.checked = true;
                  });
              }
              
              this.cargos.push(cargo);
          });
          
          // Restaurar estado de descuentos
          this.discountCheckboxes.volume.checked = state.discounts.volume;
          this.discountCheckboxes.time.checked = state.discounts.time;
          
          this.nextCargoId = state.nextCargoId;
          
          // Actualizar totales
          this.updateTotals();
          
          return true;
      } catch (error) {
          console.error('Error al restaurar estado:', error);
          return false;
      }
  }

  /**
   * Genera y descarga la cotización en formato PDF
   */
  async downloadQuotation() {
      try {
          // Generar contenido de la cotización
          const content = this.generateQuotationContent();
          
          // Crear blob con el contenido
          const blob = new Blob([content], { type: 'text/plain' });
          
          // Crear URL y link de descarga
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cotizacion_examenes_${new Date().toISOString().split('T')[0]}.txt`;
          
          // Simular click y limpiar
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
*/
export function initCalculator() {
  const calculator = new MedicalExamCalculator();
  // Siempre iniciamos con un cargo nuevo
  calculator.addFirstCargo();
  return calculator;
}