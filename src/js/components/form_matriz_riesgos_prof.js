// src/js/components/form_matriz_riesgos_prof.js

import canecaIcon from '../../assets/images/caneca.svg';
import axios from 'axios';

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
    console.log('Datos recibidos para procesar:', JSON.stringify(data, null, 2));
    const matrizRiesgos = [];
    const profesiograma = [];

    data.forEach(cargo => {
        // Obtener los valores numéricos de los niveles
        const nivelDeficiencia = cargo.niveles.deficiencia ? cargo.niveles.deficiencia.value : 0;
        const nivelExposicion = cargo.niveles.exposicion ? cargo.niveles.exposicion.value : 0;
        const nivelConsecuencia = cargo.niveles.consecuencia ? cargo.niveles.consecuencia.value : 0;

        const nivelProbabilidad = nivelDeficiencia * nivelExposicion;
        const nivelRiesgo = nivelProbabilidad * nivelConsecuencia;

        matrizRiesgos.push({
            cargo: cargo.cargoName,
            area: cargo.area,
            riesgos: cargo.gesSeleccionados,
            nivelRiesgo: nivelRiesgo,
            interpretacion: getInterpretacionRiesgo(nivelRiesgo)
        });

        profesiograma.push({
            cargo: cargo.cargoName,
            area: cargo.area,
            descripcionTareas: cargo.descripcionTareas,
            riesgos: cargo.gesSeleccionados,
            medidasPreventivas: cargo.medidas
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
                numTrabajadores: cargoDiv.querySelector('input[name="numTrabajadores"]').value,
                descripcionTareas: cargoDiv.querySelector('textarea[name="descripcionTareas"]').value,
                niveles: {},
                gesSeleccionados: [],
                medidas: []
            };
            // Recopilar toggles
            ['tareasRutinarias', 'manipulaAlimentos', 'trabajaAlturas', 'trabajaEspaciosConfinados'].forEach(name => {
                cargoData[name] = cargoDiv.querySelector(`input[name="${name}"]`).checked;
            });
            // Recopilar GES seleccionados
            cargoDiv.querySelectorAll('input[type="checkbox"][name^="ges"]:checked').forEach(checkbox => {
                cargoData.gesSeleccionados.push(checkbox.value);
            });
            // Recopilar medidas
            cargoDiv.querySelectorAll('.medidas-section textarea').forEach(textarea => {
                cargoData.medidas.push(textarea.value);
            });

            // Recopilar niveles
            cargoDiv.querySelectorAll('.nivel').forEach(nivelDiv => {
                const nivelName = nivelDiv.dataset.nivelNombre;
                const selectedBar = nivelDiv.querySelector('.barra.selected');
                cargoData.niveles[nivelName] = selectedBar ? {
                    value: parseInt(selectedBar.dataset.nivel),
                    label: selectedBar.dataset.label
                } : null;
            });

            cargosData.push(cargoData);
        });
        return cargosData;
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
        });
        return isValid;
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

        gesResumenDiv.innerHTML = ''; // Limpiar contenido anterior

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

        // Descripción de las tareas
        const tareasTextarea = document.createElement('textarea');
        tareasTextarea.name = 'descripcionTareas';
        tareasTextarea.placeholder = 'Describe las tareas de este cargo';
        tareasTextarea.value = cargoData.descripcionTareas || '';
        tareasTextarea.addEventListener('input', debounce(saveData, 300));

        infoGeneralSection.appendChild(cargoNameInput);
        infoGeneralSection.appendChild(areaInput);
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

        // Sección de Barras de Niveles
        const nivelesSection = document.createElement('div');
        nivelesSection.classList.add('niveles-section');

        // Definición de los niveles y sus opciones
        const niveles = [
            {
                nombre: 'deficiencia',
                etiqueta: 'Nivel de Deficiencia de Control del Riesgo',
                opciones: [
                    {
                        label: 'Bajo (B)',
                        value: 0,
                        descripcion: 'No se ha detectado consecuencia alguna, o la eficacia del conjunto de medidas preventivas existentes es alta, o ambos. El riesgo está controlado.'
                    },
                    {
                        label: 'Medio (M)',
                        value: 2,
                        descripcion: 'Se han detectado peligros que pueden dar lugar a consecuencias poco significativas o de menor importancia, o la eficacia del conjunto de medidas preventivas existentes es moderada, o ambos.'
                    },
                    {
                        label: 'Alto (A)',
                        value: 6,
                        descripcion: 'Se ha(n) detectado algún(os) peligro(s) que pueden dar lugar a consecuencias significativa(s), o la eficacia del conjunto de medidas preventivas existentes es baja, o ambos.'
                    },
                    {
                        label: 'Muy Alto (MA)',
                        value: 10,
                        descripcion: 'Se ha(n) detectado peligro(s) que determina(n) como posible la generación de incidentes o consecuencias muy significativas, o la eficacia del conjunto de medidas preventivas existentes respecto al riesgo es nula o no existe, o ambos.'
                    }
                ]
            },
            {
                nombre: 'exposicion',
                etiqueta: 'Nivel de Exposición a los Riesgos',
                opciones: [
                    {
                        label: 'Esporádica (EE)',
                        value: 1,
                        descripcion: 'La situación de exposición se presenta de manera eventual.'
                    },
                    {
                        label: 'Ocasional (EO)',
                        value: 2,
                        descripcion: 'La situación de exposición se presenta alguna vez durante la jornada laboral y por un periodo de tiempo corto.'
                    },
                    {
                        label: 'Frecuente (EF)',
                        value: 3,
                        descripcion: 'La situación de exposición se presenta varias veces durante la jornada laboral por tiempos cortos.'
                    },
                    {
                        label: 'Continua (EC)',
                        value: 4,
                        descripcion: 'La situación de exposición se presenta sin interrupción o varias veces con tiempo prolongado durante la jornada laboral.'
                    }
                ]
            },
            {
                nombre: 'consecuencia',
                etiqueta: 'Nivel de Consecuencia del Riesgo',
                opciones: [
                    {
                        label: 'Leve (L)',
                        value: 10,
                        descripcion: 'Lesiones o enfermedades que no requieren incapacidad.'
                    },
                    {
                        label: 'Grave (G)',
                        value: 25,
                        descripcion: 'Lesiones o enfermedades con incapacidad laboral temporal (ILT).'
                    },
                    {
                        label: 'Muy Grave (MG)',
                        value: 60,
                        descripcion: 'Lesiones o enfermedades graves irreparables (incapacidad permanente, parcial o invalidez).'
                    },
                    {
                        label: 'Mortal (M)',
                        value: 100,
                        descripcion: 'Pueden ocurrir resultados mortales.'
                    }
                ]
            }
        ];

        // Generar las barras de niveles
        niveles.forEach(nivel => {
            const nivelDiv = document.createElement('div');
            nivelDiv.classList.add('nivel');
            nivelDiv.dataset.nivelNombre = nivel.nombre;

            const nivelLabel = document.createElement('label');
            nivelLabel.textContent = nivel.etiqueta;
            nivelDiv.appendChild(nivelLabel);

            const barrasDiv = document.createElement('div');
            barrasDiv.classList.add('barras');

            // Colores para las barras (del riesgo más alto al más bajo)
            const colores = ['#4caf50', '#ffeb3b', '#ff9800', '#f44336'];

            nivel.opciones.forEach((opcion, index) => {
                const barra = document.createElement('div');
                barra.classList.add('barra');
                barra.style.backgroundColor = colores[index];
                barra.dataset.nivel = opcion.value; // Valor numérico
                barra.dataset.label = opcion.label; // Etiqueta
                barra.dataset.descripcion = opcion.descripcion; // Descripción
                barra.setAttribute('tabindex', '0');
                barra.setAttribute('role', 'button');
                barra.setAttribute('aria-label', opcion.label);

                // Mostrar como seleccionado si corresponde
                if (cargoData.niveles && cargoData.niveles[nivel.nombre] && cargoData.niveles[nivel.nombre].value == opcion.value) {
                    barra.classList.add('selected');
                }

                const barraLabel = document.createElement('span');
                barraLabel.classList.add('barra-label');
                barraLabel.textContent = opcion.label;

                const checkIcon = document.createElement('span');
                checkIcon.classList.add('check-icon');
                checkIcon.textContent = '✓';

                barra.appendChild(barraLabel);
                barra.appendChild(checkIcon);

                // Evento de selección
                barra.addEventListener('click', () => {
                    nivelDiv.querySelectorAll('.barra').forEach(b => b.classList.remove('selected'));
                    barra.classList.add('selected');
                    cargoData.niveles[nivel.nombre] = {
                        value: opcion.value,
                        label: opcion.label
                    };
                    saveData();
                });

                // Evento para mostrar descripción en tooltip al hacer hover
                barra.addEventListener('mouseenter', (e) => {
                    const tooltip = document.createElement('div');
                    tooltip.classList.add('tooltip');
                    tooltip.textContent = opcion.descripcion;
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

                barrasDiv.appendChild(barra);
            });

            nivelDiv.appendChild(barrasDiv);
            nivelesSection.appendChild(nivelDiv);
        });

        // Sección de Acciones a Tomar
        const medidasSection = document.createElement('div');
        medidasSection.classList.add('medidas-section');

        const medidasTitles = [
            'Medidas para eliminar riesgos',
            'Medidas que tomarás para sustituir fuentes de riesgos',
            'Medidas que tomarás en infraestructura para eliminar fuentes de riesgo'
        ];

        medidasTitles.forEach((titulo, index) => {
            const medidaTextarea = document.createElement('textarea');
            medidaTextarea.name = `medida${index + 1}`;
            medidaTextarea.placeholder = titulo;
            medidaTextarea.value = cargoData.medidas ? cargoData.medidas[index] || '' : '';
            medidaTextarea.addEventListener('input', debounce(saveData, 300));

            medidasSection.appendChild(medidaTextarea);
        });

        // Añadir secciones al cuerpo del cargo en el orden correcto
        cargoBody.appendChild(infoGeneralSection);
        cargoBody.appendChild(togglesSection);
        cargoBody.appendChild(riesgosSection);
        cargoBody.appendChild(gesResumenDiv);
        cargoBody.appendChild(nivelesSection);
        cargoBody.appendChild(medidasSection);

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
    matrizRiesgosForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const formData = gatherFormData();
            try {
                // Usa mockApiResponse en lugar de axios.post
                const response = await mockApiResponse(formData);
                console.log('Respuesta de la API:', response.data);
                mostrarResultados(response.data);
                alert('Matriz de Riesgos y Profesiograma generados correctamente.');
                localStorage.removeItem('matrizRiesgosData');
            } catch (error) {
                alert('Hubo un error al procesar los datos.');
                console.error(error);
            }
        }
    });
}
