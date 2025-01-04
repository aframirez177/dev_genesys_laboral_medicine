export function initCalculator() {
    const container = document.querySelector('.calculator');
  
    if (!container) {
      console.error('No se encontró el contenedor .calculator');
      return;
    }
  
    container.innerHTML = `
      <div class="calculator-layout">
        <!-- Sección Izquierda -->
        <div class="calculator-left">
          <div class="calculator-header">
            <h1>Genera una cotización personalizada de los exámenes médicos ocupacionales para tu equipo de trabajo</h1>
          </div>
          <div class="calculator-form">
            <form class="container-input-group">
              <div class="input-group">
                <label for="cargo"></label>
                <div class="colapsable-cargo-button">
                  <span></span>
                  <span></span>
                </div>
                <input type="text" id="cargo" name="cargo" placeholder="Ingresa acá el cargo">
              </div>
              <div class="checkbox-group">
                <!-- Checkboxes generados dinámicamente -->
              </div>
              <div class="input-group-cantidad-trabajadores">
                <label for="trabajadores"># de trabajadores en el cargo:</label>
                <input type="number" id="trabajadores" name="trabajadores" min="1" value="1">
              </div>
              <div class="container-btn-add">
                <button class="btn-add">+ Agrega un nuevo cargo aquí</button>
              </div>
            </form>
          </div>
        </div>
  
        <!-- Sección Derecha -->
        <div class="calculator-right">
          <div class="exam-summary">
            <h3 id="examTitle">Seleccione un examen</h3>
            <p id="examDescription">Pase el cursor sobre un examen para ver su descripción.</p>
            <p id="examPrice">Desde: <span class="min-price">$0</span></p>
          </div>
          <div class="package-summary">
            <div class="package-details">
              <h3 id="packageName">Paquete Cargo 1</h3>
              <p>Valor por trabajador: <span id="workerPrice" class="price">$0</span></p>
              <p id="totalPrice" class="your-price">$0</p>
            </div>
            <div class="line"></div>
          </div>
          <div class="discount-options">
            <label>
              <input type="checkbox" id="discount1" name="discount1"> Queremos apoyar el desarrollo (-5%)
            </label>
            <label>
              <input type="checkbox" id="discount2" name="discount2"> Ahorra tiempo y dinero (-5%)
            </label>
          </div>
          <div class="total">
            <p>Los exámenes de tu empresa tienen un valor de:</p>
            <p class="total-price">$0</p>
          </div>
          <button class="btn">Descarga Acá tu Cotización</button>
        </div>
      </div>
    `;
  
    // Exámenes
    const exámenes = [
      { id: 'emo', sigla: 'EMO', nombre: 'Examen Médico Osteomuscular', descripcion: 'Evalúa la salud del sistema musculoesquelético.', precio: 23100 },
      { id: 'emoa', sigla: 'EMOA', nombre: 'Examen Médico con Enfasis en Alturas', descripcion: 'Evalúa la aptitud física para trabajos en alturas.', precio: 23100 },
      // Agrega más exámenes aquí
    ];
  
    const checkboxGroup = container.querySelector('.checkbox-group');
    checkboxGroup.innerHTML = exámenes
      .map(
        (examen) => `
          <div class="checkbox-item" title="${examen.nombre}" data-description="${examen.descripcion}" data-price="${examen.precio}">
            <label for="${examen.id}">${examen.sigla}</label>
            <input type="checkbox" id="${examen.id}" name="${examen.id}">
          </div>
        `
      )
      .join('');
  
    const totalPriceElement = container.querySelector('.total-price');
    const trabajadoresInput = container.querySelector('#trabajadores');
  
    function calculateTotal() {
      let subtotal = 0;
      const trabajadores = parseInt(trabajadoresInput.value) || 1;
  
      checkboxGroup.querySelectorAll('input:checked').forEach((checkbox) => {
        const item = checkbox.closest('.checkbox-item');
        subtotal += parseFloat(item.dataset.price) * trabajadores;
      });
  
      let total = subtotal;
      totalPriceElement.textContent = `$${total.toLocaleString('es-CO')}`;
    }
  
    checkboxGroup.addEventListener('change', calculateTotal);
    trabajadoresInput.addEventListener('input', calculateTotal);
  
    calculateTotal(); // Inicializa el cálculo
  }
  