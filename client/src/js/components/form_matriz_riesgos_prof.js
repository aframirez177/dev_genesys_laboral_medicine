// src/js/components/form_matriz_riesgos_prof.js

import canecaIcon from '../../assets/images/caneca.svg';
import axios from 'axios';
import { initContactForm } from './informacion_de_contacto.js';

// Importar Swiper y los módulos necesarios
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

// Función para simular la respuesta de la API
function mockApiResponse(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Datos enviados a la API:', JSON.stringify(data, null, 2));
            const procesados = procesarDatos(data);
            resolve({
                status: 200,
                data: {
                    message: 'Datos recibidos y procesados correctamente',
                    matrizRiesgos: procesados.matrizRiesgos,
                    profesiograma: procesados.profesiograma
                }
            });
        }, 1000);
    });
}

        // Función para procesar los datos
        function procesarDatos(data) {
            console.log('Datos recibidos:', JSON.stringify(data, null, 2));
            const matrizRiesgos = [];
            const profesiograma = [];
        
            data.forEach(cargo => {
                matrizRiesgos.push({
                    cargo: cargo.cargoName,
                    area: cargo.area,
                    zona: cargo.zona,
                    descripcionTareas: cargo.descripcionTareas,
                    caracteristicas: {
                        tareasRutinarias: cargo.tareasRutinarias,
                        manipulaAlimentos: cargo.manipulaAlimentos,
                        trabajaAlturas: cargo.trabajaAlturas,
                        trabajaEspaciosConfinados: cargo.trabajaEspaciosConfinados
                    },
                    gesSeleccionados: cargo.gesSeleccionados
                });
        
                profesiograma.push({
                    cargo: cargo.cargoName,
                    area: cargo.area,
                    zona: cargo.zona,
                    descripcionTareas: cargo.descripcionTareas,
                    caracteristicas: {
                        tareasRutinarias: cargo.tareasRutinarias,
                        manipulaAlimentos: cargo.manipulaAlimentos,
                        trabajaAlturas: cargo.trabajaAlturas,
                        trabajaEspaciosConfinados: cargo.trabajaEspaciosConfinados
                    },
                    gesSeleccionados: cargo.gesSeleccionados
                });
            });
        
            return { matrizRiesgos, profesiograma };
        }

// Función para interpretar el nivel de riesgo
function getInterpretacionRiesgo(nivelRiesgo) {
    if (nivelRiesgo >= 600) return 'I';
    if (nivelRiesgo >= 150) return 'II';
    if (nivelRiesgo >= 40) return 'III';
    return 'IV';
}

// Función para mostrar los resultados
function mostrarResultados(data) {
    const resultadosDiv = document.createElement('div');
    resultadosDiv.innerHTML = `
        <h3>Matriz de Riesgos</h3>
        <pre>${JSON.stringify(data.matrizRiesgos, null, 2)}</pre>
        <h3>Profesiograma</h3>
        <pre>${JSON.stringify(data.profesiograma, null, 2)}</pre>
    `;
    document.body.appendChild(resultadosDiv);
}

// Función para inicializar el formulario de Matriz de Riesgos Profesional
export function initializeForm() {
    const cargoContainer = document.getElementById('cargoContainer');
    const addCargoBtn = document.getElementById('addCargoBtn');
    const matrizRiesgosForm = document.getElementById('matrizRiesgosForm');

    let cargoCount = 0;

    // Función debounce
    function debounce(func, wait = 300) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Función para guardar datos en localStorage
    function saveData() {
        const cargosData = gatherFormData();
        localStorage.setItem('matrizRiesgosData', JSON.stringify(cargosData));
    }

    // Función para recopilar datos del formulario
    function gatherFormData() {
        const cargosData = [];
        const cargoDivs = cargoContainer.querySelectorAll('.cargo');
        
        cargoDivs.forEach(cargoDiv => {
            const cargoData = {
                cargoName: cargoDiv.querySelector('input[name="cargoName"]').value.trim(),
                area: cargoDiv.querySelector('input[name="area"]').value.trim(),
                zona: cargoDiv.querySelector('input[name="zona"]').value.trim(),
                numTrabajadores: cargoDiv.querySelector('input[name="numTrabajadores"]').value,
                descripcionTareas: cargoDiv.querySelector('textarea[name="descripcionTareas"]').value,
                gesSeleccionados: []
            };
    
            // Recopilar toggles 
            ['tareasRutinarias', 'manipulaAlimentos', 'trabajaAlturas', 'trabajaEspaciosConfinados'].forEach(name => {
                cargoData[name] = cargoDiv.querySelector(`input[name="${name}"]`).checked;
            });
    
            // Recopilar GES y sus datos asociados
            cargoDiv.querySelectorAll('input[type="checkbox"][name^="ges"]:checked').forEach(checkbox => {
                const riesgoValue = checkbox.value;
                try {
                    // Obtener controles existentes
                    const controlesData = {
                        fuente: cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="fuente"]`)?.value || 'Ninguno',
                        medio: cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="medio"]`)?.value || 'Ninguno',
                        individuo: cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="individuo"]`)?.value || 'Ninguno'
                    };
    
                    // Obtener niveles
                    const nivelesInput = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
                    let niveles = {};
                    if (nivelesInput && nivelesInput.value) {
                        try {
                            niveles = JSON.parse(nivelesInput.value);
                        } catch (e) {
                            console.error('Error parsing niveles:', e);
                            niveles = {};
                        }
                    }
    
                    const [riesgo, ges] = riesgoValue.split(' - ');
                    cargoData.gesSeleccionados.push({
                        riesgo: riesgo,
                        ges: ges,
                        controles: controlesData,
                        niveles: niveles
                    });
                } catch (e) {
                    console.error('Error processing GES:', riesgoValue, e);
                }
            });
    
            cargosData.push(cargoData);
        });
    
        return {
            cargos: cargosData
        };
    }

    // Función para validar el formulario
    function validateForm() {
        let isValid = true;
        const cargoDivs = cargoContainer.querySelectorAll('.cargo');
        cargoDivs.forEach(cargoDiv => {
            const cargoNameInput = cargoDiv.querySelector('input[name="cargoName"]');
            const areaInput = cargoDiv.querySelector('input[name="area"]');
            const trabajadoresInput = cargoDiv.querySelector('input[name="numTrabajadores"]');
            if (!cargoNameInput.value.trim()) {
                alert('Por favor, ingrese el nombre del cargo.');
                isValid = false;
            }
            if (!areaInput.value.trim()) {
                alert('Por favor, ingrese el área del cargo.');
                isValid = false;
            }
            if (!trabajadoresInput.value || trabajadoresInput.value < 1) {
                alert('Por favor, ingrese un número válido de trabajadores.');
                isValid = false;
            }
            // Validaciones adicionales aquí
            const zonaInput = cargoDiv.querySelector('input[name="zona"]');
            if (!zonaInput.value.trim()) {
                alert('Por favor, ingrese la zona o lugar de trabajo.');
                isValid = false;
            }
        });
        return isValid;
    }


    function updateNiveles(riesgoValue, cargoDiv, niveles) {
        let nivelesInput = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
        if (!nivelesInput) {
            nivelesInput = document.createElement('input');
            nivelesInput.type = 'hidden';
            nivelesInput.dataset.riesgo = riesgoValue;
            nivelesInput.dataset.niveles = true;
            cargoDiv.appendChild(nivelesInput);
        }
        nivelesInput.value = JSON.stringify(niveles);
        saveData();
    }

    // Función para obtener la lista de GES según el riesgo
    function getGesListByRiesgo(riesgo) {
        const gesLists = {
            'Mecánico': [
                'Caídas al mismo nivel',
                'Caídas de altura',
                'Posibilidad de atrapamiento',
                'Posibilidad de ser golpeado por objetos que caen o en movimiento',
                'Posibilidad de proyección de partículas o fluidos a presión',
                'Posibilidad de perforación o de punzonamiento',
                'Posibilidad de corte o seccionamiento'
            ],
            'Eléctrico': [
                'Alta tensión debido a instalaciones eléctricas locativas y estáticas',
                'Media tensión debido a instalaciones eléctricas locativas y estáticas',
                'Baja tensión debido a instalaciones eléctricas locativas y estáticas',
                'Electricidad estática'
            ],
            'Físico': [
                'Iluminación deficiente',
                'Iluminación en exceso',
                'Presiones anormales',
                'Radiaciones ionizantes',
                'Radiaciones no ionizantes',
                'Ruido',
                'Temperaturas extremas: calor',
                'Temperaturas extremas: frío',
                'Vibraciones mano-cuerpo',
                'Vibraciones cuerpo completo',
                'Cambios bruscos de temperatura',
                'Humedad Relativa (Vapor de agua)'
            ],
            'Químico': [
                'Exposición a gases vapores humos polvos no tóxicos',
                'Exposición a gases vapores humos polvos tóxicos',
                'Exposición sustancias químicas líquidas tóxicas',
                'Exposición sustancias químicas líquidas no tóxicas',
                'Exposición a sustancias químicas que generan efectos en el organismo'
            ],
            'Biológico': [
                'Presencia de animales/vectores transmisores de enfermedad',
                'Exposición a material contaminado o con riesgo biológico',
                'Manipulación de alimentos'
            ],
            'Biomecánico': [
                'Manejo de cargas mayores a 25 Kg (Hombres)',
                'Manejo de cargas mayores a 12.5 Kg (Mujeres)',
                'Adopción de posturas nocivas',
                'Movimientos repetitivos (6 o más por minuto)',
                'Diseño del puesto de trabajo inadecuado',
                'Posturas prolongadas y/o incorrectas'
            ],
            'Factores Humanos': [
                'Competencias no definidas para el cargo',
                'Actos inseguros observados'
            ],
            'Psicosocial': [
                'Atención de público',
                'Monotonía/repetitividad de funciones',
                'Trabajo bajo presión'
            ],
            'Locativo': [
                'Almacenamiento inadecuado',
                'Condiciones inadecuadas de orden y aseo',
                'Condiciones del piso',
                'Escaleras y barandas inadecuadas o mal estado',
                'Condiciones de las instalaciones'
            ],
            'Natural': [
                'Deslizamientos',
                'Inundación',
                'Sismo - Terremotos',
                'Tormentas eléctricas',
                'Lluvias granizadas'
            ],
            'Seguridad': [
                'Secuestros',
                'Amenazas',
                'Hurtos - Robos - Atracos',
                'Accidente de Tránsito',
                'Desorden público - Atentados',
                'Extorsión'
            ],
            'Otros Riesgos': [
                'Trabajos en caliente',
                'Explosión',
                'Incendio'
            ],
            'Saneamiento Básico': [
                'Sin disponibilidad de agua potable'
            ],
            'Salud Pública': [
                'Enfermedades endémicas',
                'Mordedura y Picadura de Animales'
            ]
        };
        return gesLists[riesgo] || [];
    }

    // Función para actualizar el resumen de GES
        function updateGesResumen(cargoDiv) {
            const gesResumenDiv = cargoDiv.querySelector('.ges-resumen');
            if (!gesResumenDiv) {
                console.error('gesResumenDiv no encontrado en el DOM');
                return;
            }
        
            const gesCheckboxes = cargoDiv.querySelectorAll('input[type="checkbox"][name^="ges"]:checked');
            const selectedGes = [];
            gesCheckboxes.forEach(checkbox => {
                selectedGes.push(checkbox.value);
            });
        
            gesResumenDiv.innerHTML = '';
        
            if (selectedGes.length > 0) {
                selectedGes.forEach(ges => {
                    const gesItem = document.createElement('div');
                    gesItem.classList.add('ges-resumen-item');
        
                    const checkMark = document.createElement('span');
                    checkMark.classList.add('check-mark');
                    checkMark.textContent = '✓';
        
                    const gesText = document.createElement('span');
                    gesText.textContent = ges;
        
                    gesItem.appendChild(checkMark);
                    gesItem.appendChild(gesText);
        
                    gesResumenDiv.appendChild(gesItem);
                });
            } else {
                gesResumenDiv.textContent = 'No se han seleccionado GES.';
            }
        }

    // Función para agregar un nuevo cargo
    function addCargo(cargoData = {}, isDefault = false) {
        cargoCount++;

        // Inicializar cargoData.niveles si no existe
        if (!cargoData.niveles) {
            cargoData.niveles = {};
        }

        const cargoDiv = document.createElement('div');
        cargoDiv.classList.add('cargo');

        // Sección 1: Encabezado
        const cargoHeader = document.createElement('div');
        cargoHeader.classList.add('cargo-header');

        // Lado izquierdo del encabezado
        const headerLeft = document.createElement('div');
        headerLeft.classList.add('header-left');

        // Etiqueta de área
        const areaLabel = document.createElement('div');
        areaLabel.classList.add('area-label');
        areaLabel.textContent = cargoData.area || 'Área';

        // Título del cargo
        const cargoTitle = document.createElement('h3');
        cargoTitle.classList.add('cargo-title');
        cargoTitle.textContent = cargoData.cargoName || `Cargo #${cargoCount}`;

        headerLeft.appendChild(areaLabel);
        headerLeft.appendChild(cargoTitle);

        // Lado derecho del encabezado
        const headerRight = document.createElement('div');
        headerRight.classList.add('header-right');

        // Contenedor de número de trabajadores con botones - y +
        const trabajadoresContainer = document.createElement('div');
        trabajadoresContainer.classList.add('trabajadores-container');

        const minusBtn = document.createElement('button');
        minusBtn.type = 'button';
        minusBtn.classList.add('minus-btn');
        minusBtn.textContent = '-';

        const trabajadoresInput = document.createElement('input');
        trabajadoresInput.type = 'number';
        trabajadoresInput.name = 'numTrabajadores';
        trabajadoresInput.min = '1';
        trabajadoresInput.value = cargoData.numTrabajadores || '1';
        trabajadoresInput.readOnly = true;

        const plusBtn = document.createElement('button');
        plusBtn.type = 'button';
        plusBtn.classList.add('plus-btn');
        plusBtn.textContent = '+';

        minusBtn.addEventListener('click', () => {
            if (parseInt(trabajadoresInput.value) > 1) {
                trabajadoresInput.value = parseInt(trabajadoresInput.value) - 1;
                saveData();
            }
        });

        plusBtn.addEventListener('click', () => {
            trabajadoresInput.value = parseInt(trabajadoresInput.value) + 1;
            saveData();
        });

        trabajadoresContainer.appendChild(minusBtn);
        trabajadoresContainer.appendChild(trabajadoresInput);
        trabajadoresContainer.appendChild(plusBtn);

        // Botón de minimizar
        const minimizeBtn = document.createElement('button');
        minimizeBtn.type = 'button';
        minimizeBtn.classList.add('minimize-btn');
        minimizeBtn.innerHTML = '-'; // Inicia con el icono de menos
        minimizeBtn.addEventListener('click', () => {
            cargoBody.classList.toggle('hidden');
            minimizeBtn.innerHTML = cargoBody.classList.contains('hidden') ? '+' : '-';
        });

        // Botón de eliminar cargo
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.classList.add('delete-btn');

        // Añadir icono de caneca
        const trashIcon = document.createElement('img');
        trashIcon.src = canecaIcon;
        trashIcon.alt = 'Eliminar';
        trashIcon.classList.add('trash-icon');
        deleteBtn.appendChild(trashIcon);

        if (isDefault) {
            deleteBtn.disabled = true;
        }
        deleteBtn.addEventListener('click', () => {
            if (cargoCount > 1) {
                if (confirm('¿Está seguro de que desea eliminar este cargo?')) {
                    cargoDiv.remove();
                    cargoCount--;
                    saveData();
                }
            } else {
                alert('No puede eliminar el último cargo.');
            }
        });

        headerRight.appendChild(trabajadoresContainer);
        headerRight.appendChild(minimizeBtn);
        headerRight.appendChild(deleteBtn);

        cargoHeader.appendChild(headerLeft);
        cargoHeader.appendChild(headerRight);

        // Sección 2: Cuerpo del cargo
        const cargoBody = document.createElement('div');
        cargoBody.classList.add('cargo-body');

        // Sección de Información General
        const infoGeneralSection = document.createElement('div');
        infoGeneralSection.classList.add('info-general-section');

        // Input para el nombre del cargo
        const cargoNameInput = document.createElement('input');
        cargoNameInput.type = 'text';
        cargoNameInput.name = 'cargoName';
        cargoNameInput.placeholder = 'Ingresa el nombre del cargo';
        cargoNameInput.value = cargoData.cargoName || '';

        // Actualizar el título del cargo dinámicamente
        cargoNameInput.addEventListener('input', debounce(() => {
            cargoTitle.textContent = cargoNameInput.value || `Cargo #${cargoCount}`;
            saveData();
        }, 300));

        // Input para el área
        const areaInput = document.createElement('input');
        areaInput.type = 'text';
        areaInput.name = 'area';
        areaInput.placeholder = 'Ingresa el área';
        areaInput.value = cargoData.area || '';

        // Actualizar la etiqueta de área dinámicamente
        areaInput.addEventListener('input', debounce(() => {
            areaLabel.textContent = areaInput.value || 'Área';
            saveData();
        }, 300));

        // Input para la zona/lugar
        const zonaInput = document.createElement('input');
        zonaInput.type = 'text';
        zonaInput.name = 'zona';
        zonaInput.placeholder = 'Ingresa la zona o lugar de trabajo';
        zonaInput.value = cargoData.zona || '';

        // Descripción de las tareas
        const tareasTextarea = document.createElement('textarea');
        tareasTextarea.name = 'descripcionTareas';
        tareasTextarea.placeholder = 'Describe las tareas de este cargo';
        tareasTextarea.value = cargoData.descripcionTareas || '';
        tareasTextarea.addEventListener('input', debounce(saveData, 300));

        infoGeneralSection.appendChild(cargoNameInput);
        infoGeneralSection.appendChild(areaInput);
        infoGeneralSection.appendChild(zonaInput);
        infoGeneralSection.appendChild(tareasTextarea);

        // Sección de Toggles
        const togglesSection = document.createElement('div');
        togglesSection.classList.add('toggles-section');

        const toggles = [
            { label: '¿Las tareas son rutinarias?', name: 'tareasRutinarias' },
            { label: '¿Manipula alimentos?', name: 'manipulaAlimentos' },
            { label: '¿Trabaja en alturas?', name: 'trabajaAlturas' },
            { label: '¿Trabaja en espacios confinados?', name: 'trabajaEspaciosConfinados' }
        ];

        toggles.forEach(toggle => {
            const toggleDiv = document.createElement('div');
            toggleDiv.classList.add('toggle');

            const toggleLabel = document.createElement('label');
            toggleLabel.textContent = toggle.label;

            const toggleInput = document.createElement('input');
            toggleInput.type = 'checkbox';
            toggleInput.name = toggle.name;
            toggleInput.checked = cargoData[toggle.name] || false;
            toggleInput.addEventListener('change', saveData);

            const toggleSlider = document.createElement('span');
            toggleSlider.classList.add('slider');

            // Añadir etiquetas "Sí" y "No"
            const toggleYes = document.createElement('span');
            toggleYes.classList.add('toggle-yes');
            toggleYes.textContent = 'Sí';

            const toggleNo = document.createElement('span');
            toggleNo.classList.add('toggle-no');
            toggleNo.textContent = 'No';

            const toggleWrapper = document.createElement('label');
            toggleWrapper.classList.add('switch');
            toggleWrapper.appendChild(toggleInput);
            toggleWrapper.appendChild(toggleSlider);
            toggleWrapper.appendChild(toggleYes);
            toggleWrapper.appendChild(toggleNo);

            toggleDiv.appendChild(toggleLabel);
            toggleDiv.appendChild(toggleWrapper);

            togglesSection.appendChild(toggleDiv);
        });

        // Sección de Riesgos y GES (Implementada como carrusel)
        const riesgosSection = document.createElement('div');
        riesgosSection.classList.add('riesgos-section');

        const riesgos = [
            'Mecánico',
            'Eléctrico',
            'Físico',
            'Químico',
            'Biológico',
            'Biomecánico',
            'Factores Humanos',
            'Psicosocial',
            'Locativo',
            'Natural',
            'Seguridad',
            'Otros Riesgos',
            'Saneamiento Básico',
            'Salud Pública'
        ];

        const riesgoColors = {
            'Mecánico': '#cbe3f3',
            'Eléctrico': '#fee6fc',
            'Físico': '#fdf8cd',
            'Químico': '#c7f9ff',
            'Biológico': '#d8fff1',
            'Biomecánico': '#d8fff1',
            'Factores Humanos': '#ffefd2',
            'Psicosocial': '#e6e6e6',
            'Locativo': '#fee6fc',
            'Natural': '#fee6fc',
            'Seguridad': '#fee6fc',
            'Otros Riesgos': '#fee6fc',
            'Saneamiento Básico': '#fee6fc',
            'Salud Pública': '#fee6fc'
        };

        // Crear contenedor Swiper
        const swiperContainer = document.createElement('div');
        swiperContainer.classList.add('swiper', 'riesgos-swiper');

        const swiperWrapper = document.createElement('div');
        swiperWrapper.classList.add('swiper-wrapper');

            // Agregamos la función para crear y mostrar el popup:
            // Reemplaza la función showControlesPopup existente con esta nueva versión
            function showControlesPopup(riesgoValue, cargoDiv, checkbox) {
                // Eliminar popup existente si hay uno
                const existingPopup = document.querySelector('.controles-popup');
                if (existingPopup) {
                    existingPopup.remove();
                }

                // Extraer el riesgo y el GES del valor del checkbox
                const [riesgo, ges] = riesgoValue.split(' - ');

                // Crear el popup
                const popup = document.createElement('div');
                popup.classList.add('controles-popup');
                
                // Estructura del popup
                popup.innerHTML = `
                    <div class="popup-header">
                        <h4>${ges}</h4>
                        <span class="riesgo-label">${riesgo}</span>
                        <button class="close-popup">&times;</button>
                    </div>
                    <div class="popup-content">
                        <!-- Sección de Controles Existentes -->
                        <div class="controles-section">
                            <h5>Controles Existentes</h5>
                            <div class="control-group">
                                <label>Fuente:</label>
                                <input type="text" name="control-fuente" 
                                    data-riesgo="${riesgoValue}" data-tipo="fuente"
                                    placeholder="Ninguno" 
                                    value="${cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="fuente"]`)?.value || ''}">
                            </div>
                            <div class="control-group">
                                <label>Medio:</label>
                                <input type="text" name="control-medio"
                                    data-riesgo="${riesgoValue}" data-tipo="medio"
                                    placeholder="Ninguno"
                                    value="${cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="medio"]`)?.value || ''}">
                            </div>
                            <div class="control-group">
                                <label>Individuo:</label>
                                <input type="text" name="control-individuo"
                                    data-riesgo="${riesgoValue}" data-tipo="individuo"
                                    placeholder="Ninguno"
                                    value="${cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="individuo"]`)?.value || ''}">
                            </div>
                        </div>

                        <!-- Sección de Niveles -->
                        <div class="niveles-section">
                            <h5>Evaluación de Niveles</h5>
                            ${generateNivelesHTML(riesgoValue, cargoDiv)}
                        </div>
                    </div>
                `;

                // Posicionar el popup
                const checkboxRect = checkbox.getBoundingClientRect();
                popup.style.position = 'absolute';
                popup.style.top = `${window.scrollY + checkboxRect.top}px`;
                popup.style.left = `${checkboxRect.right + 20}px`;

                // Eventos
                const closeBtn = popup.querySelector('.close-popup');
                closeBtn.addEventListener('click', () => {
                    popup.remove();
                });

                // Manejar inputs de controles
                const inputs = popup.querySelectorAll('.control-group input');
                inputs.forEach(input => {
                    input.addEventListener('input', () => {
                        const tipo = input.name.split('-')[1];
                        let controlInput = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="${tipo}"]`);
                        
                        if (!controlInput) {
                            controlInput = document.createElement('input');
                            controlInput.type = 'hidden';
                            controlInput.dataset.riesgo = riesgoValue;
                            controlInput.dataset.tipo = tipo;
                            cargoDiv.appendChild(controlInput);
                        }
                        
                        controlInput.value = input.value || 'Ninguno';
                        saveData();
                    });
                });

                // Manejar selección de niveles
                const barras = popup.querySelectorAll('.barra');
                barras.forEach(barra => {
                    barra.addEventListener('click', () => {
                        const nivelDiv = barra.closest('.nivel');
                        const nivelName = nivelDiv.dataset.nivelNombre;
                        
                        nivelDiv.querySelectorAll('.barra').forEach(b => b.classList.remove('selected'));
                        barra.classList.add('selected');
                
                        // Guardar el nivel seleccionado
                        const nivelesData = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
                        const niveles = nivelesData ? JSON.parse(nivelesData.value || '{}') : {};
                        
                        niveles[nivelName] = {
                            value: parseInt(barra.dataset.nivel),
                            label: barra.dataset.label
                        };
                
                        updateNiveles(riesgoValue, cargoDiv, niveles);
                        updateGesResumen(cargoDiv);
                    });
                    // Tooltips para las barras
                    barra.addEventListener('mouseenter', (e) => {
                        const tooltip = document.createElement('div');
                        tooltip.classList.add('tooltip');
                        tooltip.textContent = barra.dataset.descripcion;
                        document.body.appendChild(tooltip);

                        function positionTooltip(event) {
                            tooltip.style.left = event.pageX + 10 + 'px';
                            tooltip.style.top = event.pageY + 10 + 'px';
                        }

                        positionTooltip(e);
                        barra.addEventListener('mousemove', positionTooltip);

                        barra.addEventListener('mouseleave', () => {
                            document.body.removeChild(tooltip);
                            barra.removeEventListener('mousemove', positionTooltip);
                        }, { once: true });
                    });
                });

                // Click fuera para cerrar
                document.addEventListener('click', (e) => {
                    if (!popup.contains(e.target) && !checkbox.contains(e.target)) {
                        popup.remove();
                    }
                });

                document.body.appendChild(popup);
            }

            // Función auxiliar para generar el HTML de los niveles
            function generateNivelesHTML(riesgoValue, cargoDiv) {
                const niveles = [
                    {
                        nombre: 'deficiencia',
                        etiqueta: 'Nivel de Deficiencia',
                        opciones: [
                            {
                                label: 'Bajo (B)',
                                value: 0,
                                descripcion: 'No se ha detectado consecuencia alguna, o la eficacia del conjunto de medidas preventivas existentes es alta.',
                                color: '#4caf50'
                            },
                            {
                                label: 'Medio (M)',
                                value: 2,
                                descripcion: 'Se han detectado peligros que pueden dar lugar a consecuencias poco significativas.',
                                color: '#ffeb3b'
                            },
                            {
                                label: 'Alto (A)',
                                value: 6,
                                descripcion: 'Se ha(n) detectado algún(os) peligro(s) que pueden dar lugar a consecuencias significativa(s).',
                                color: '#ff9800'
                            },
                            {
                                label: 'Muy Alto (MA)',
                                value: 10,
                                descripcion: 'Se han detectado peligros que determinan como muy posible la generación de incidentes.',
                                color: '#f44336'
                            }
                        ]
                    },
                    {
                        nombre: 'exposicion',
                        etiqueta: 'Nivel de Exposición',
                        opciones: [
                            {
                                label: 'Esporádica (EE)',
                                value: 1,
                                descripcion: 'La situación de exposición se presenta de manera eventual.',
                                color: '#4caf50'
                            },
                            {
                                label: 'Ocasional (EO)',
                                value: 2,
                                descripcion: 'La situación de exposición se presenta alguna vez durante la jornada laboral y por un periodo de tiempo corto.',
                                color: '#ffeb3b'
                            },
                            {
                                label: 'Frecuente (EF)',
                                value: 3,
                                descripcion: 'La situación de exposición se presenta varias veces durante la jornada laboral por tiempos cortos.',
                                color: '#ff9800'
                            },
                            {
                                label: 'Continua (EC)',
                                value: 4,
                                descripcion: 'La situación de exposición se presenta sin interrupción o varias veces con tiempo prolongado durante la jornada laboral.',
                                color: '#f44336'
                            }
                        ]
                    },
                    {
                        nombre: 'consecuencia',
                        etiqueta: 'Nivel de Consecuencia',
                        opciones: [
                            {
                                label: 'Leve (L)',
                                value: 10,
                                descripcion: 'Lesiones o enfermedades que no requieren incapacidad.',
                                color: '#4caf50'
                            },
                            {
                                label: 'Grave (G)',
                                value: 25,
                                descripcion: 'Lesiones o enfermedades con incapacidad laboral temporal.',
                                color: '#ffeb3b'
                            },
                            {
                                label: 'Muy Grave (MG)',
                                value: 60,
                                descripcion: 'Lesiones o enfermedades graves irreparables.',
                                color: '#ff9800'
                            },
                            {
                                label: 'Mortal (M)',
                                value: 100,
                                descripcion: 'Muerte.',
                                color: '#f44336'
                            }
                        ]
                    }
                ];

                return niveles.map(nivel => `
                    <div class="nivel" data-nivel-nombre="${nivel.nombre}">
                        <label>${nivel.etiqueta}</label>
                        <div class="barras">
                            ${nivel.opciones.map(opcion => `
                                <div class="barra${getNivelSeleccionado(riesgoValue, nivel.nombre, opcion.value, cargoDiv) ? ' selected' : ''}"
                                    style="background-color: ${opcion.color}"
                                    data-nivel="${opcion.value}"
                                    data-label="${opcion.label}"
                                    data-descripcion="${opcion.descripcion}"
                                    tabindex="0"
                                    role="button"
                                    aria-label="${opcion.label}">
                                    <span class="barra-label">${opcion.label}</span>
                                    <span class="check-icon">✓</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
            }

            // Función auxiliar para determinar si un nivel está seleccionado
            function getNivelSeleccionado(riesgoValue, nivelNombre, valor, cargoDiv) {
                const nivelesData = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
                if (!nivelesData) return false;
                
                try {
                    const niveles = JSON.parse(nivelesData.value);
                    return niveles[nivelNombre]?.value === valor;
                } catch (e) {
                    return false;
                }
            }


        riesgos.forEach(riesgo => {
            const swiperSlide = document.createElement('div');
            swiperSlide.classList.add('swiper-slide');
            swiperSlide.style.backgroundColor = riesgoColors[riesgo];

            const slideContent = document.createElement('div');
            slideContent.classList.add('slide-content');

            const riesgoTitle = document.createElement('h3');
            riesgoTitle.textContent = `Riesgo ${riesgo}`;

            // GES específicos para cada tipo de riesgo
            const gesList = getGesListByRiesgo(riesgo);

            const gesListDiv = document.createElement('div');
            gesListDiv.classList.add('ges-list');



            gesList.forEach(ges => {
                const gesCheckbox = document.createElement('input');
                gesCheckbox.type = 'checkbox';
                gesCheckbox.name = `ges${cargoCount}`;
                gesCheckbox.value = `${riesgo} - ${ges}`;

                if (cargoData.gesSeleccionados && cargoData.gesSeleccionados.includes(`${riesgo} - ${ges}`)) {
                    gesCheckbox.checked = true;
                }

                gesCheckbox.addEventListener('change', () => {
                    if (gesCheckbox.checked) {
                        showControlesPopup(gesCheckbox.value, cargoDiv, gesCheckbox);
                    }
                    updateGesResumen(cargoDiv);
                    saveData();
                });

                

                const gesLabel = document.createElement('label');
                gesLabel.textContent = ges;

                const gesItemDiv = document.createElement('div');
                gesItemDiv.classList.add('ges-item');
                gesItemDiv.appendChild(gesCheckbox);
                gesItemDiv.appendChild(gesLabel);

                gesListDiv.appendChild(gesItemDiv);
            });

            slideContent.appendChild(riesgoTitle);
            slideContent.appendChild(gesListDiv);

            swiperSlide.appendChild(slideContent);
            swiperWrapper.appendChild(swiperSlide);
        });

        swiperContainer.appendChild(swiperWrapper);

        // Botones de navegación
        const swiperButtonNext = document.createElement('div');
        swiperButtonNext.classList.add('swiper-button-next');

        const swiperButtonPrev = document.createElement('div');
        swiperButtonPrev.classList.add('swiper-button-prev');

        // Paginación
        const swiperPagination = document.createElement('div');
        swiperPagination.classList.add('swiper-pagination');

        swiperContainer.appendChild(swiperButtonNext);
        swiperContainer.appendChild(swiperButtonPrev);
        swiperContainer.appendChild(swiperPagination);

        riesgosSection.appendChild(swiperContainer);

        // Inicializar Swiper
        const swiper = new Swiper(swiperContainer, {
            navigation: {
                nextEl: swiperButtonNext,
                prevEl: swiperButtonPrev,
            },
            pagination: {
                el: swiperPagination,
                clickable: true,
            },
            slidesPerView: 1,
            spaceBetween: 10,
        });

        // Resumen de GES seleccionados
        const gesResumenDiv = document.createElement('div');
        gesResumenDiv.classList.add('ges-resumen');

        
        cargoBody.appendChild(infoGeneralSection);
        cargoBody.appendChild(togglesSection);
        cargoBody.appendChild(riesgosSection);
        cargoBody.appendChild(gesResumenDiv);

/*         cargoBody.appendChild(medidasSection); */

        // Añadir encabezado y cuerpo al div del cargo
        cargoDiv.appendChild(cargoHeader);
        cargoDiv.appendChild(cargoBody);

        cargoContainer.appendChild(cargoDiv);

        // Ahora que gesResumenDiv está en el DOM, inicializa el resumen de GES
        updateGesResumen(cargoDiv);
    }

    // Cargar datos guardados en localStorage
    const savedData = JSON.parse(localStorage.getItem('matrizRiesgosData')) || [];
    if (savedData.length > 0) {
        savedData.forEach((cargoData, index) => {
            addCargo(cargoData, index === 0);
        });
    } else {
        // Añadir el primer cargo por defecto (no se puede eliminar)
        addCargo({}, true);
    }

    // Evento para agregar un nuevo cargo
    addCargoBtn.addEventListener('click', () => {
        addCargo();
        saveData();
    });

    // Envío del formulario
    const API_URL = 'http://localhost:3000';
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateForm()) return;
    
        try {
            // Recopilamos los datos del formulario
            const formData = gatherFormData();
            console.log('Datos que se enviarán al servidor:', JSON.stringify(formData, null, 2));

                    // Verificamos que los datos tengan la estructura correcta antes de enviar
                    if (!formData.cargos || !Array.isArray(formData.cargos) || formData.cargos.length === 0) {
                        throw new Error('Debe incluir al menos un cargo con sus datos');
                    }

    
            // Enviamos directamente al endpoint de generación de matriz
            const response = await fetch('http://localhost:3000/api/matriz-riesgos/generar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
                body: JSON.stringify(formData)
            });
    
            if (!response.ok) {
                            // Intentamos obtener más información sobre el error
            const errorText = await response.text();
            console.error('Error del servidor:', {
                status: response.status,
                statusText: response.statusText,
                errorDetails: errorText
            });
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
    
            // Descargamos el archivo Excel generado
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'matriz-riesgos.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
    
            alert('¡Matriz de riesgos generada exitosamente!');
            
        } catch (error) {
            console.error('Error detallado:', error);
            alert(`Error al generar la matriz: ${error.message}`);
        }
    }
    
    matrizRiesgosForm.addEventListener('submit', handleSubmit);
}
