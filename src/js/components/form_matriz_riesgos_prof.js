// matriz_de_riesgos_profesional.js

let cargos = [];
let cargoId = 0;

const riesgos = {
    "Físico": ["GES Ruido", "GES Vibraciones", "GES Temperaturas extremas", "GES Radiaciones ionizantes", "GES Radiaciones no ionizantes", "GES Iluminación deficiente", "GES Presiones anormales"],
    "Químico": ["GES Gases y vapores", "GES Polvos inorgánicos", "GES Polvos orgánicos", "GES Humos metálicos", "GES Líquidos (nieblas y rocíos)", "GES Solventes"],
    "Biológico": ["GES Virus", "GES Bacterias", "GES Hongos", "GES Ricketsias", "GES Parásitos", "GES Picaduras/mordeduras"],
    "Biomecánico": ["GES Posturas prolongadas", "GES Movimientos repetitivos", "GES Manipulación manual de cargas", "GES Esfuerzo"],
    "Psicosocial": ["GES Gestión organizacional", "GES Características del grupo social de trabajo", "GES Condiciones de la tarea", "GES Interface persona-tarea", "GES Jornada de trabajo"],
    "Condiciones de seguridad": ["GES Mecánico", "GES Eléctrico", "GES Locativo", "GES Tecnológico", "GES Accidentes de tránsito", "GES Públicos", "GES Trabajo en alturas", "GES Espacios confinados"],
    "Fenómenos naturales": ["GES Sismo", "GES Terremoto", "GES Vendaval", "GES Inundación", "GES Derrumbe"]
};

function createCargoHTML(cargo) {
    return `
        <div class="cargo-card" id="cargo-${cargo.id}">
            <div class="cargo-header">
                <h3>Cargo #${cargo.id}</h3>
                <button type="button" class="toggle-btn" onclick="toggleCargo(${cargo.id})">-</button>
            </div>
            <div class="cargo-content">
                <div class="input-group">
                    <input type="text" id="nombre-${cargo.id}" placeholder="Ingresa el Cargo #${cargo.id}">
                    <div class="rutinaria-toggle">
                        <span>Sus tareas son rutinarias?</span>
                        <label class="switch">
                            <input type="checkbox" id="rutinaria-${cargo.id}">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
                <div class="input-group">
                    <input type="text" id="proceso-${cargo.id}" placeholder="Ingresa área o proceso al área">
                </div>
                <div class="input-group">
                    <textarea id="tareas-${cargo.id}" placeholder="Cuéntanos un poco sobre las tareas que tiene este cargo."></textarea>
                </div>
                <div class="input-group workers-count">
                    <label for="numTrabajadores-${cargo.id}"># de trabajadores en el cargo:</label>
                    <div class="number-input">
                        <button type="button" onclick="changeWorkers(${cargo.id}, -1)">-</button>
                        <input type="number" id="numTrabajadores-${cargo.id}" min="1" value="1" readonly>
                        <button type="button" onclick="changeWorkers(${cargo.id}, 1)">+</button>
                    </div>
                </div>
                
                <div class="riesgos-section">
                    <h4>Selecciona los riesgos a los que se expone tu (cargo ${cargo.id})</h4>
                    <div class="riesgos-accordion">
                        ${Object.keys(riesgos).map(tipo => `
                            <button class="accordion-btn" onclick="toggleAccordion(this)">${tipo}</button>
                            <div class="accordion-content">
                                ${riesgos[tipo].map(ges => `
                                    <div class="checkbox-group">
                                        <input type="checkbox" id="${ges}-${cargo.id}" name="riesgos-${cargo.id}" value="${ges}">
                                        <label for="${ges}-${cargo.id}">${ges}</label>
                                    </div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="sliders-section">
                    <div class="slider-group">
                        <label>Nivel de Deficiencia del control de riesgos</label>
                        <input type="range" id="nivelDeficiencia-${cargo.id}" min="0" max="10" step="2" class="custom-slider" oninput="updateSliderValue(this)">
                        <div class="slider-labels">
                            <span>Todo esta bajo control</span>
                            <span>Hay peligro(s) inminente(s)</span>
                        </div>
                    </div>
                    <div class="slider-group">
                        <label>Nivel de exposición a los riesgos</label>
                        <input type="range" id="nivelExposicion-${cargo.id}" min="1" max="4" class="custom-slider" oninput="updateSliderValue(this)">
                        <div class="slider-labels">
                            <span>Exposición esporádica</span>
                            <span>Exposición Continua</span>
                        </div>
                    </div>
                    <div class="slider-group">
                        <label>Nivel de consecuencias del riesgo</label>
                        <input type="range" id="nivelConsecuencias-${cargo.id}" min="10" max="100" step="10" class="custom-slider" oninput="updateSliderValue(this)">
                        <div class="slider-labels">
                            <span>Leve</span>
                            <span>Mortal o catastrófico</span>
                        </div>
                    </div>
                </div>

                <div class="medidas-intervencion">
                    <textarea id="eliminacion-${cargo.id}" placeholder="Cuéntanos un poco sobre las medidas que tomarás para sustituir las fuentes de riesgo."></textarea>
                    <textarea id="controlIngenieria-${cargo.id}" placeholder="Cuéntanos un poco sobre las medidas que tomarás en infraestructura para eliminar fuentes de riesgo."></textarea>
                </div>
            </div>
        </div>
    `;
}

function addCargo() {
    cargoId++;
    const newCargo = { id: cargoId };
    cargos.push(newCargo);
    const cargoHTML = createCargoHTML(newCargo);
    document.getElementById('cargosContainer').insertAdjacentHTML('beforeend', cargoHTML);
}

function toggleCargo(id) {
    const cargoContent = document.querySelector(`#cargo-${id} .cargo-content`);
    const toggleBtn = document.querySelector(`#cargo-${id} .toggle-btn`);
    cargoContent.classList.toggle('hidden');
    toggleBtn.textContent = cargoContent.classList.contains('hidden') ? '+' : '-';
}

function toggleAccordion(button) {
    button.classList.toggle("active");
    const content = button.nextElementSibling;
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

function updateSliderValue(slider) {
    const value = slider.value;
    const min = slider.min;
    const max = slider.max;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #5dc4af 0%, #5dc4af ${percentage}%, #d3d3d3 ${percentage}%, #d3d3d3 100%)`;
}

function changeWorkers(cargoId, change) {
    const input = document.getElementById(`numTrabajadores-${cargoId}`);
    let value = parseInt(input.value) + change;
    value = Math.max(1, value); // Asegura que el valor mínimo sea 1
    input.value = value;
}

async function submitForm(event) {
    event.preventDefault();
    
    const formData = cargos.map(cargo => ({
        nombre: document.getElementById(`nombre-${cargo.id}`).value,
        rutinaria: document.getElementById(`rutinaria-${cargo.id}`).checked,
        proceso: document.getElementById(`proceso-${cargo.id}`).value,
        tareas: document.getElementById(`tareas-${cargo.id}`).value,
        numTrabajadores: document.getElementById(`numTrabajadores-${cargo.id}`).value,
        riesgos: Array.from(document.querySelectorAll(`#cargo-${cargo.id} input[type="checkbox"]:checked`)).map(cb => cb.value),
        nivelDeficiencia: document.getElementById(`nivelDeficiencia-${cargo.id}`).value,
        nivelExposicion: document.getElementById(`nivelExposicion-${cargo.id}`).value,
        nivelConsecuencias: document.getElementById(`nivelConsecuencias-${cargo.id}`).value,
        medidasIntervencion: {
            eliminacion: document.getElementById(`eliminacion-${cargo.id}`).value,
            sustitucion: document.getElementById(`sustitucion-${cargo.id}`).value,
            controlIngenieria: document.getElementById(`controlIngenieria-${cargo.id}`).value
        }
    }));

    try {
        const response = await axios.post('https://tu-api-endpoint.com/matriz-riesgos', formData);
        console.log('Respuesta del servidor:', response.data);
        alert('Matriz de Riesgos generada con éxito. Revisa tu correo electrónico para más detalles.');
    } catch (error) {
        console.error('Error al enviar los datos:', error);
        alert('Hubo un error al generar la Matriz de Riesgos. Por favor, intenta de nuevo.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addCargoBtn').addEventListener('click', addCargo);
    document.getElementById('matrizRiesgosForm').addEventListener('submit', submitForm);
    addCargo(); // Añadir el primer cargo automáticamente
});