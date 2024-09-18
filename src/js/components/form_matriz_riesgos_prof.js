// Definición de variables globales
let cargos = [];
let cargoId = 0;

// Definición de riesgos y GES
const riesgos = {
    "Físico": ["GES Ruido", "GES Vibraciones", "GES Temperaturas extremas", "GES Radiaciones ionizantes", "GES Radiaciones no ionizantes", "GES Iluminación deficiente", "GES Presiones anormales"],
    "Químico": ["GES Gases y vapores", "GES Polvos inorgánicos", "GES Polvos orgánicos", "GES Humos metálicos", "GES Líquidos (nieblas y rocíos)", "GES Solventes"],
    "Biológico": ["GES Virus", "GES Bacterias", "GES Hongos", "GES Ricketsias", "GES Parásitos", "GES Picaduras/mordeduras"],
    "Biomecánico": ["GES Posturas prolongadas", "GES Movimientos repetitivos", "GES Manipulación manual de cargas", "GES Esfuerzo"],
    "Psicosocial": ["GES Gestión organizacional", "GES Características del grupo social de trabajo", "GES Condiciones de la tarea", "GES Interface persona-tarea", "GES Jornada de trabajo"],
    "Condiciones de seguridad": ["GES Mecánico", "GES Eléctrico", "GES Locativo", "GES Tecnológico", "GES Accidentes de tránsito", "GES Públicos", "GES Trabajo en alturas", "GES Espacios confinados"],
    "Fenómenos naturales": ["GES Sismo", "GES Terremoto", "GES Vendaval", "GES Inundación", "GES Derrumbe"]
};

// Función para crear el HTML de un cargo
function createCargoHTML(cargo) {
    return `
        <div class="cargo-card" id="cargo-${cargo.id}">
            <h3>Cargo #${cargo.id}</h3>
            <div class="input-group">
                <input type="text" id="nombre-${cargo.id}" placeholder="Ingresa el Cargo #${cargo.id}">
                <label>Sus tareas son rutinarias?</label>
                <div class="toggle-switch">
                    <input type="checkbox" id="rutinaria-${cargo.id}">
                    <label for="rutinaria-${cargo.id}">
                        <span class="toggle-slider"></span>
                        <span class="toggle-text">SI</span>
                        <span class="toggle-text">NO</span>
                    </label>
                </div>
            </div>
            <div class="input-group">
                <input type="text" id="proceso-${cargo.id}" placeholder="Ingresa área o proceso al área">
            </div>
            <div class="input-group">
                <textarea id="tareas-${cargo.id}" placeholder="Cuéntanos un poco sobre las tareas que tiene este cargo."></textarea>
            </div>
            <div class="input-group">
                <label># de trabajadores en el cargo:</label>
                <input type="number" id="numTrabajadores-${cargo.id}" min="1" value="1">
            </div>
            
            <div class="riesgos-section">
                <h4>Selecciona los riesgos a los que se expone tu (cargo ${cargo.id})</h4>
                <div class="riesgos-accordion">
                    ${Object.keys(riesgos).map(tipo => `
                        <div class="riesgo-category">
                            <button class="accordion-btn">${tipo}</button>
                            <div class="accordion-content">
                                ${riesgos[tipo].map(ges => `
                                    <div class="checkbox-group">
                                        <input type="checkbox" id="${ges}-${cargo.id}" name="riesgos-${cargo.id}" value="${ges}">
                                        <label for="${ges}-${cargo.id}">${ges}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="slider-group">
                <label>Nivel de Deficiencia del control de riesgos</label>
                <input type="range" id="nivelDeficiencia-${cargo.id}" min="0" max="10" step="2" class="custom-slider" oninput="updateSliderValue(this)">
                <div class="slider-labels">
                    <span>Todo esta bajo control</span>
                    <span>Hay peligro(s) inminente(s)</span>
                </div>
                <span class="slider-value" id="nivelDeficienciaValue-${cargo.id}">0</span>
            </div>

            <div class="slider-group">
                <label>Nivel de exposición a los riesgos</label>
                <input type="range" id="nivelExposicion-${cargo.id}" min="1" max="4" class="custom-slider" oninput="updateSliderValue(this)">
                <div class="slider-labels">
                    <span>Exposición esporádica</span>
                    <span>Exposición Continua</span>
                </div>
                <span class="slider-value" id="nivelExposicionValue-${cargo.id}">1</span>
            </div>

            <div class="slider-group">
                <label>Nivel de consecuencias del riesgo</label>
                <input type="range" id="nivelConsecuencias-${cargo.id}" min="10" max="100" step="10" class="custom-slider" oninput="updateSliderValue(this)">
                <div class="slider-labels">
                    <span>Leve</span>
                    <span>Mortal o catastrófico</span>
                </div>
                <span class="slider-value" id="nivelConsecuenciasValue-${cargo.id}">10</span>
            </div>

            <div class="medidas-intervencion">
                <textarea id="eliminacion-${cargo.id}" placeholder="Cuéntanos un poco sobre las medidas que tomarás para eliminar el riesgo."></textarea>
                <textarea id="sustitucion-${cargo.id}" placeholder="Cuéntanos un poco sobre las medidas que tomarás para sustituir las fuentes de riesgo."></textarea>
                <textarea id="controlIngenieria-${cargo.id}" placeholder="Cuéntanos un poco sobre las medidas que tomarás en infraestructura para eliminar fuentes de riesgo."></textarea>
            </div>
        </div>
    `;
}

// Función para inicializar el acordeón
function initializeAccordion() {
    const accordionBtns = document.querySelectorAll(".accordion-btn");
    accordionBtns.forEach(button => {
        button.addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

// Función para actualizar el valor del slider
function updateSliderValue(slider) {
    const valueSpan = document.getElementById(slider.id + 'Value');
    valueSpan.textContent = slider.value;
    calculateRisk(slider.id.split('-')[1]);
}

// Función para calcular el riesgo
function calculateRisk(cargoId) {
    const nivelDeficiencia = parseInt(document.getElementById(`nivelDeficiencia-${cargoId}`).value);
    const nivelExposicion = parseInt(document.getElementById(`nivelExposicion-${cargoId}`).value);
    const nivelConsecuencias = parseInt(document.getElementById(`nivelConsecuencias-${cargoId}`).value);

    const nivelProbabilidad = nivelDeficiencia * nivelExposicion;
    const nivelRiesgo = nivelProbabilidad * nivelConsecuencias;

    // Aquí puedes agregar lógica adicional para interpretar los niveles de riesgo
    // y actualizar la interfaz de usuario si es necesario
}

// Función para añadir un nuevo cargo
function addCargo() {
    cargoId++;
    const newCargo = { id: cargoId };
    cargos.push(newCargo);
    const cargoHTML = createCargoHTML(newCargo);
    document.getElementById('cargosContainer').insertAdjacentHTML('beforeend', cargoHTML);
    initializeAccordion();
}

// Función para recopilar los datos de un cargo
function getCargoData(cargoId) {
    const riesgosSeleccionados = Array.from(document.querySelectorAll(`#cargo-${cargoId} input[type="checkbox"]:checked`))
        .map(checkbox => checkbox.value);

    return {
        nombre: document.getElementById(`nombre-${cargoId}`).value,
        rutinaria: document.getElementById(`rutinaria-${cargoId}`).checked,
        proceso: document.getElementById(`proceso-${cargoId}`).value,
        tareas: document.getElementById(`tareas-${cargoId}`).value,
        numTrabajadores: document.getElementById(`numTrabajadores-${cargoId}`).value,
        riesgos: riesgosSeleccionados,
        nivelDeficiencia: document.getElementById(`nivelDeficiencia-${cargoId}`).value,
        nivelExposicion: document.getElementById(`nivelExposicion-${cargoId}`).value,
        nivelConsecuencias: document.getElementById(`nivelConsecuencias-${cargoId}`).value,
        medidasIntervencion: {
            eliminacion: document.getElementById(`eliminacion-${cargoId}`).value,
            sustitucion: document.getElementById(`sustitucion-${cargoId}`).value,
            controlIngenieria: document.getElementById(`controlIngenieria-${cargoId}`).value
        }
    };
}

// Función para enviar el formulario
async function submitForm(event) {
    event.preventDefault();

    const formData = cargos.map(cargo => getCargoData(cargo.id));

    const dataToSend = {
        empresa: document.getElementById('nombreEmpresa').value,
        fecha: new Date().toISOString(),
        cargos: formData
    };

    try {
        const response = await axios.post('https://tu-api-endpoint.com/matriz-riesgos-prof', dataToSend);
        console.log('Respuesta del servidor:', response.data);
        alert('Matriz de Riesgos y Profesiograma generados con éxito. Revisa tu correo electrónico para más detalles.');
        // Aquí puedes agregar lógica adicional para manejar la respuesta exitosa
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        alert('Hubo un error al generar la Matriz de Riesgos y Profesiograma. Por favor, intenta de nuevo.');
    }
}

// Inicialización cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addCargoBtn').addEventListener('click', addCargo);
    document.getElementById('matrizRiesgosProfForm').addEventListener('submit', submitForm);
    addCargo(); // Añadir el primer cargo automáticamente
    initializeAccordion();
});

export function initMatrizRiesgos() {
    // Código de inicialización
    document.getElementById('addCargoBtn').addEventListener('click', addCargo);
    document.getElementById('matrizRiesgosProfForm').addEventListener('submit', submitForm);
    addCargo(); // Añadir el primer cargo automáticamente
    initializeAccordion();
    loadDraft();
    setInterval(autosave, 30000);
}
