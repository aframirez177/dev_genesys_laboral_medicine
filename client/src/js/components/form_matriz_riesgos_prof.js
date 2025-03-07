// src/js/components/form_matriz_riesgos_prof.js

import canecaIcon from '../../assets/images/caneca.svg';


// Importar Swiper y los módulos necesarios
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';







// Función para inicializar el formulario de Matriz de Riesgos Profesional
export function initializeForm() {
    const cargoContainer = document.getElementById('cargoContainer');
    const addCargoBtn = document.getElementById('addCargoBtn');
    const matrizRiesgosForm = document.getElementById('matrizRiesgosForm');

    let cargoCount = 0;

    // Estructura para almacenar valores históricos
    const historicalValues = {
        cargos: new Set(),
        areas: new Set(),
        zonas: new Set(),
        controles: {
            fuente: new Set(),
            medio: new Set(),
            individuo: new Set()
        }
    };
    
    // Recuperar valores históricos del localStorage si existen
    try {
        const savedHistorical = localStorage.getItem('historicalValues');
        if (savedHistorical) {
            const parsed = JSON.parse(savedHistorical);
            historicalValues.cargos = new Set(parsed.cargos);
            historicalValues.areas = new Set(parsed.areas);
            historicalValues.zonas = new Set(parsed.zonas);
            historicalValues.controles.fuente = new Set(parsed.controles.fuente);
            historicalValues.controles.medio = new Set(parsed.controles.medio);
            historicalValues.controles.individuo = new Set(parsed.controles.individuo);
        }
    } catch (error) {
        console.error('Error loading historical values:', error);
    }

    //funcion helper

    function createDatalist(id, values) {
        let datalist = document.getElementById(id);
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = id;
            document.body.appendChild(datalist);
        }
        datalist.innerHTML = Array.from(values)
            .map(value => `<option value="${value}">`)
            .join('');
        return datalist;
    }
    
    function updateDatalist(input, values, datalistId) {
        const datalist = createDatalist(datalistId, values);
        input.setAttribute('list', datalistId);
    }



    // Función debounce
    function debounce(func, wait = 300) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

// Función para guardar datos en localStorage con manejo de expiración
function saveData() {
    // Solo guardar si hay datos significativos
    if (!shouldSaveState()) {
        return;
    }
    
    const cargosData = gatherFormData();
    
    // Crear objeto con timestamp para control de expiración (72 horas)
    const saveObject = {
        cargos: cargosData.cargos,
        timestamp: Date.now(),
        lastUpdate: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('matrizRiesgosData', JSON.stringify(saveObject));
        console.log('Estado guardado exitosamente:', new Date().toLocaleTimeString());
        
        // Guardar valores históricos
        const historicalToSave = {
            cargos: Array.from(historicalValues.cargos),
            areas: Array.from(historicalValues.areas),
            zonas: Array.from(historicalValues.zonas),
            controles: {
                fuente: Array.from(historicalValues.controles.fuente),
                medio: Array.from(historicalValues.controles.medio),
                individuo: Array.from(historicalValues.controles.individuo)
            },
            timestamp: Date.now() // Añadir timestamp también a los valores históricos
        };
        
        localStorage.setItem('historicalValues', JSON.stringify(historicalToSave));
    } catch (error) {
        console.error('Error al guardar estado:', error);
    }
}

// Función para determinar si se debe guardar el estado
// Evita guardar datos insignificantes (formularios vacíos)
function shouldSaveState() {
    // Verificar el primer cargo
    const firstCargo = cargoContainer.querySelector('.cargo');
    if (!firstCargo) return false;
    
    const cargoNameInput = firstCargo.querySelector('input[name="cargoName"]');
    if (!cargoNameInput || !cargoNameInput.value.trim()) {
        return false;
    }
    
    // Verificar si hay algún GES seleccionado
    const hasGesSelected = firstCargo.querySelector('input[type="checkbox"][name^="ges"]:checked');
    if (!hasGesSelected) {
        return false;
    }
    
    return true;
}

// Función para verificar si los datos guardados han expirado (72 horas)
function checkExpiration(timestamp) {
    if (!timestamp) return true; // Sin timestamp, considerar expirado
    
    const HOURS_72 = 72 * 60 * 60 * 1000; // 72 horas en milisegundos
    const timeElapsed = Date.now() - timestamp;
    
    return timeElapsed > HOURS_72;
}

// Función para verificar expiración de valores históricos
function cleanupHistoricalValues() {
    try {
        const saved = localStorage.getItem('historicalValues');
        if (!saved) return;
        
        const data = JSON.parse(saved);
        if (data.timestamp && checkExpiration(data.timestamp)) {
            console.log('Valores históricos expirados, limpiando...');
            localStorage.removeItem('historicalValues');
        }
    } catch (error) {
        console.error('Error al limpiar valores históricos:', error);
    }
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

// Actualizar el título del cargo mientras escribe
cargoNameInput.addEventListener('input', () => {
    cargoTitle.textContent = cargoNameInput.value || `Cargo #${cargoCount}`;
});

// Guardar cuando pierde el foco
cargoNameInput.addEventListener('blur', () => {
    if (cargoNameInput.value.trim()) {
        historicalValues.cargos.add(cargoNameInput.value.trim());
    }
    saveData();
});

        // Input para el área
        const areaInput = document.createElement('input');
        areaInput.type = 'text';
        areaInput.name = 'area';
        areaInput.placeholder = 'Ingresa el área';
        areaInput.value = cargoData.area || '';
        updateDatalist(areaInput, historicalValues.areas, 'areas-datalist');

        // Actualizar etiqueta mientras escribe
        areaInput.addEventListener('input', () => {
            areaLabel.textContent = areaInput.value || 'Área';
            updateDatalist(areaInput, historicalValues.areas, 'areas-datalist');
        });

        // Guardar cuando pierde el foco
        areaInput.addEventListener('blur', () => {
            if (areaInput.value.trim()) {
                historicalValues.areas.add(areaInput.value.trim());
                updateDatalist(areaInput, historicalValues.areas, 'areas-datalist');
            }
            saveData();
        });

        // Input para la zona/lugar
        const zonaInput = document.createElement('input');
        zonaInput.type = 'text';
        zonaInput.name = 'zona';
        zonaInput.placeholder = 'Ingresa la zona o lugar de trabajo';
        zonaInput.value = cargoData.zona || '';
        updateDatalist(zonaInput, historicalValues.zonas, 'zonas-datalist');

        // Actualizar sugerencias mientras escribe
        zonaInput.addEventListener('input', () => {
            updateDatalist(zonaInput, historicalValues.zonas, 'zonas-datalist');
        });

        // Guardar cuando pierde el foco
        zonaInput.addEventListener('blur', () => {
            if (zonaInput.value.trim()) {
                historicalValues.zonas.add(zonaInput.value.trim());
                updateDatalist(zonaInput, historicalValues.zonas, 'zonas-datalist');
            }
            saveData();
        });

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

        
        
        function createDatalist(id, values) {
            let datalist = document.getElementById(id);
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = id;
                document.body.appendChild(datalist);
            }
            datalist.innerHTML = Array.from(values)
                .map(value => `<option value="${value}">`)
                .join('');
            return datalist;
        }
        
        function updateDatalist(input, values, datalistId) {
            const datalist = createDatalist(datalistId, values);
            input.setAttribute('list', datalistId);
        }
        
        // Agregamos la función para crear y mostrar el popup:
        // función showControlesPopup existente con esta nueva versión
        
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
            
            // Asegurar que existen los datalists
            createDatalist('fuente-datalist', historicalValues.controles.fuente);
            createDatalist('medio-datalist', historicalValues.controles.medio);
            createDatalist('individuo-datalist', historicalValues.controles.individuo);
        
            // Estructura del popup
            popup.innerHTML = `
                <div class="popup-header">
                    <h4>${ges}</h4>
                    <span class="riesgo-label">${riesgo}</span>
                    <button class="close-popup">&times;</button>
                </div>
                <div class="popup-content">
                    <div class="controles-section">
                        <h5>Controles Existentes</h5>
                        <div class="control-group">
                            <label>Fuente:</label>
                            <input type="text" 
                                name="control-fuente" 
                                data-riesgo="${riesgoValue}" 
                                data-tipo="fuente"
                                placeholder="Ninguno" 
                                list="fuente-datalist"
                                value="${cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="fuente"]`)?.value || ''}">
                        </div>
                        <div class="control-group">
                            <label>Medio:</label>
                            <input type="text" 
                                name="control-medio"
                                data-riesgo="${riesgoValue}" 
                                data-tipo="medio"
                                placeholder="Ninguno"
                                list="medio-datalist"
                                value="${cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="medio"]`)?.value || ''}">
                        </div>
                        <div class="control-group">
                            <label>Individuo:</label>
                            <input type="text" 
                                name="control-individuo"
                                data-riesgo="${riesgoValue}" 
                                data-tipo="individuo"
                                placeholder="Ninguno"
                                list="individuo-datalist"
                                value="${cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="individuo"]`)?.value || ''}">
                        </div>
                    </div>
        
                    <!-- Sección de Niveles -->
                    <div class="niveles-section">
                        <h5>Evaluación de Niveles</h5>
                        ${generateNivelesHTML(riesgoValue, cargoDiv)}
                    </div>
                </div>`;
        
            // Posicionar el popup
            const checkboxRect = checkbox.getBoundingClientRect();
            popup.style.position = 'absolute';
            popup.style.top = `${window.scrollY + checkboxRect.top}px`;
            popup.style.left = `${checkboxRect.right + 20}px`;
        
            // Configurar eventos
            const closeBtn = popup.querySelector('.close-popup');
            closeBtn.addEventListener('click', () => {
                popup.remove();
            });
        
            // Configurar eventos para los inputs de controles
            const inputs = popup.querySelectorAll('.control-group input');
inputs.forEach(input => {
    // Mostrar sugerencias mientras escribe (sin guardar)
    input.addEventListener('input', () => {
        const tipo = input.name.split('-')[1];
        updateDatalist(input, historicalValues.controles[tipo], `${tipo}-datalist`);
    });

            // Guardar solo cuando el input pierde el foco
            // En la función showControlesPopup, dentro del evento blur de cada input de control:
input.addEventListener('blur', () => {
    const tipo = input.name.split('-')[1];
    let controlInput = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-tipo="${tipo}"]`);
    
    if (!controlInput) {
        controlInput = document.createElement('input');
        controlInput.type = 'hidden';
        controlInput.dataset.riesgo = riesgoValue;
        controlInput.dataset.tipo = tipo;
        cargoDiv.appendChild(controlInput);
    }
    
    const value = input.value.trim();
    if (value && value !== 'Ninguno') {
        // Actualizar valores históricos
        historicalValues.controles[tipo].add(value);
        // Actualizar datalist correspondiente
        updateDatalist(input, historicalValues.controles[tipo], `${tipo}-datalist`);
    }
    
    controlInput.value = value || 'Ninguno';
    saveData();
});
        });
        
            // Configurar las barras de niveles y sus eventos
            const barras = popup.querySelectorAll('.barra');
            barras.forEach(barra => {
                barra.addEventListener('click', () => {
                    const nivelDiv = barra.closest('.nivel');
                    const nivelName = nivelDiv.dataset.nivelNombre;
                    
                    nivelDiv.querySelectorAll('.barra').forEach(b => b.classList.remove('selected'));
                    barra.classList.add('selected');
            
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

// Verificar si hay datos guardados en localStorage y mostrar banner
function checkSavedData() {
    try {
        const savedState = localStorage.getItem('matrizRiesgosData');
        if (!savedState) return false;
        
        const state = JSON.parse(savedState);
        
        // Verificar si ha expirado (72 horas)
        if (state.timestamp && checkExpiration(state.timestamp)) {
            console.log('Datos guardados expirados, eliminando...');
            localStorage.removeItem('matrizRiesgosData');
            return false;
        }
        
        return state;
    } catch (error) {
        console.error('Error al verificar datos guardados:', error);
        return false;
    }
}

// Función para mostrar banner de restauración
function showRestoreBanner(state) {
    const banner = document.createElement('div');
    banner.className = 'restore-banner';
    
    // Calcular tiempo transcurrido desde la última actualización
    const lastUpdate = new Date(state.lastUpdate || state.timestamp);
    const hoursAgo = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60));
    
    banner.innerHTML = `
        <div class="banner-content">
            <div class="banner-message">
                Encontramos una cotización guardada con ${state.cargos.length} cargo(s) de hace ${hoursAgo} hora(s)
            </div>
            <div class="banner-actions">
                <button class="btn-restore cta-button">Continuar con esta cotización</button>
                <button class="btn-new cta-button-1">Crear nueva cotización</button>
            </div>
        </div>
    `;
    
    // Insertar banner en el DOM
    const container = document.querySelector('.calculator, .matriz-riesgos-section');
    container.insertBefore(banner, container.firstChild);
    
    // Configurar eventos de botones
    banner.querySelector('.btn-restore').addEventListener('click', () => {
        restoreFormState(state);
        banner.style.display = 'none';
    });
    
    banner.querySelector('.btn-new').addEventListener('click', () => {
        localStorage.removeItem('matrizRiesgosData');
        // Limpiar contenedor e inicializar nuevo formulario
        cargoContainer.innerHTML = '';
        addCargo({}, true);
        banner.style.display = 'none';
    });
}


// Función para restaurar el estado completo del formulario
// Modifica la función restoreFormState
function restoreFormState(state) {
    try {
        // Limpiar contenedor
        cargoContainer.innerHTML = '';
        
        // Restaurar cargos con todos sus datos y configuraciones
        state.cargos.forEach((cargoData, index) => {
            addCargo(cargoData, index === 0);
            
            // Buscar el cargo recién añadido
            const cargoEl = cargoContainer.lastElementChild;
            
            // Restaurar GES y sus datos asociados
            if (cargoData.gesSeleccionados && cargoData.gesSeleccionados.length > 0) {
                cargoData.gesSeleccionados.forEach(gesData => {
                    const gesValue = `${gesData.riesgo} - ${gesData.ges}`;
                    
                    // Marcar el checkbox correspondiente
                    const checkbox = cargoEl.querySelector(`input[value="${gesValue}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        
                        // Restaurar controles existentes
                        if (gesData.controles) {
                            // Para cada tipo de control (fuente, medio, individuo)
                            ['fuente', 'medio', 'individuo'].forEach(tipo => {
                                if (gesData.controles[tipo]) {
                                    // Crear o actualizar el input oculto para el control
                                    let controlInput = cargoEl.querySelector(`[data-riesgo="${gesValue}"][data-tipo="${tipo}"]`);
                                    if (!controlInput) {
                                        controlInput = document.createElement('input');
                                        controlInput.type = 'hidden';
                                        controlInput.dataset.riesgo = gesValue;
                                        controlInput.dataset.tipo = tipo;
                                        cargoEl.appendChild(controlInput);
                                    }
                                    controlInput.value = gesData.controles[tipo];
                                }
                            });
                        }
                        
                        // Restaurar niveles
                        if (gesData.niveles) {
                            updateNiveles(gesValue, cargoEl, gesData.niveles);
                        }
                    }
                });
                
                // Actualizar resumen de GES
                updateGesResumen(cargoEl);
            }
        });
        
        console.log('Estado restaurado correctamente con todos los datos');
    } catch (error) {
        console.error('Error al restaurar estado:', error);
        // Si falla la restauración, iniciar con un formulario nuevo
        cargoContainer.innerHTML = '';
        addCargo({}, true);
    }
}
// Limpiar valores históricos expirados al inicio
cleanupHistoricalValues();


// Al inicio del formulario, verificar si hay datos guardados
const savedState = checkSavedData();
if (savedState && savedState.cargos && savedState.cargos.length > 0) {
    // Mostrar banner de restauración
    showRestoreBanner(savedState);
} else {
    // Si no hay datos guardados o han expirado, iniciar con el primer cargo
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
