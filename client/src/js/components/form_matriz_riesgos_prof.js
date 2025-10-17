// src/js/components/form_matriz_riesgos_prof.js

import canecaIcon from '../../assets/images/caneca.svg';
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

// === SISTEMA DE TOOLTIPS QUE SIGUEN AL MOUSE ===
class TooltipManager {
    constructor() {
        this.activeTooltip = null;
        this.currentMouseX = 0;
        this.currentMouseY = 0;
        
        // SEGUIR MOVIMIENTO DEL MOUSE
        document.addEventListener('mousemove', (e) => {
            this.currentMouseX = e.clientX;
            this.currentMouseY = e.clientY;
            
            // ACTUALIZAR POSICIÓN DEL TOOLTIP ACTIVO
            if (this.activeTooltip) {
                this.updateTooltipPosition();
            }
        });
        
        this.injectStyles();
    }
    
    injectStyles() {
        if (document.getElementById('tooltip-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'tooltip-styles';
        style.textContent = `
            .enhanced-tooltip {
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                line-height: 1.4;
                max-width: 300px;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transform: scale(0.8);
                transition: opacity 0.1s ease, transform 0.1s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                word-wrap: break-word;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .enhanced-tooltip.visible {
                opacity: 1;
                transform: scale(1);
            }
            
            .enhanced-tooltip .tooltip-title {
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .enhanced-tooltip .tooltip-description {
                color: #e0e0e0;
                margin-bottom: 4px;
            }
            
            .enhanced-tooltip .tooltip-tip {
                color: #ffeb3b;
                font-size: 11px;
                font-style: italic;
                margin-top: 4px;
                opacity: 0.8;
            }
            
            .nivel-label {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .info-icon {
                cursor: help;
                font-size: 12px;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            }
            
            .info-icon:hover {
                opacity: 1;
            }
            
            /* SOLUCIÓN PARA ELEMENTOS ANIDADOS EN BARRAS */
            .barra .barra-label,
            .barra .check-icon {
                pointer-events: none;
            }
            
            .barra {
                position: relative;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }
    
    createTooltip(content, options = {}) {
        const tooltip = document.createElement('div');
        tooltip.className = 'enhanced-tooltip';
        
        let html = '';
        if (options.title) {
            html += `<div class="tooltip-title">${options.title}</div>`;
        }
        if (content) {
            html += `<div class="tooltip-description">${content}</div>`;
        }
        if (options.tip) {
            html += `<div class="tooltip-tip">💡 ${options.tip}</div>`;
        }
        
        tooltip.innerHTML = html;
        return tooltip;
    }
    
    // MOSTRAR TOOLTIP INMEDIATAMENTE EN POSICIÓN DEL MOUSE
    showTooltip(content, options = {}) {
        // LIMPIAR TOOLTIP ANTERIOR
        this.hideTooltip();
        
        // CREAR NUEVO TOOLTIP
        const tooltip = this.createTooltip(content, options);
        this.activeTooltip = tooltip;
        
        // AÑADIR AL DOM
        document.body.appendChild(tooltip);
        
        // POSICIONAR EN MOUSE
        this.updateTooltipPosition();
        
        // MOSTRAR INMEDIATAMENTE
        tooltip.classList.add('visible');
    }
    
    // ACTUALIZAR POSICIÓN DEL TOOLTIP SEGÚN MOUSE
    updateTooltipPosition() {
        if (!this.activeTooltip) return;
        
        const tooltip = this.activeTooltip;
        const tooltipRect = tooltip.getBoundingClientRect();
        const offset = 15;
        
        let left = this.currentMouseX + offset;
        let top = this.currentMouseY + offset;
        
        // AJUSTAR SI SE SALE DE LA PANTALLA
        if (left + tooltipRect.width > window.innerWidth) {
            left = this.currentMouseX - tooltipRect.width - offset;
        }
        
        if (top + tooltipRect.height > window.innerHeight) {
            top = this.currentMouseY - tooltipRect.height - offset;
        }
        
        // ASEGURAR QUE NO SE SALGA DE LOS BORDES
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }
    
    // OCULTAR TOOLTIP INMEDIATAMENTE
    hideTooltip() {
        if (this.activeTooltip) {
            if (document.body.contains(this.activeTooltip)) {
                document.body.removeChild(this.activeTooltip);
            }
            this.activeTooltip = null;
        }
    }
    
    destroy() {
        this.hideTooltip();
    }
}

// === CONTENIDO DE TOOLTIPS PARA NIVELES ===
const tooltipContent = {
    // NIVELES DE DEFICIENCIA
    deficiencia: {
        bajo: {
            title: "🟢 Nivel de Deficiencia: BAJO (B)",
            description: "No se ha detectado consecuencia alguna, o la eficacia del conjunto de medidas preventivas existentes es alta.",
            tip: "Las medidas de control están funcionando correctamente",
            examples: "Ejemplo: Uso correcto de EPP, mantenimiento preventivo al día"
        },
        medio: {
            title: "🟡 Nivel de Deficiencia: MEDIO (M)", 
            description: "Se han detectado peligros que pueden dar lugar a consecuencias poco significativas.",
            tip: "Es necesario revisar y mejorar algunas medidas de control",
            examples: "Ejemplo: EPP en buen estado pero falta capacitación en su uso"
        },
        alto: {
            title: "🟠 Nivel de Deficiencia: ALTO (A)",
            description: "Se ha(n) detectado algún(os) peligro(s) que pueden dar lugar a consecuencias significativa(s).",
            tip: "Requiere atención prioritaria para implementar controles",
            examples: "Ejemplo: EPP deteriorado, procedimientos desactualizados"
        },
        muyAlto: {
            title: "🔴 Nivel de Deficiencia: MUY ALTO (MA)",
            description: "Se han detectado peligros que determinan como muy posible la generación de incidentes.",
            tip: "¡ACCIÓN INMEDIATA! Riesgo crítico que debe ser controlado urgentemente",
            examples: "Ejemplo: Ausencia total de medidas de control, equipos defectuosos"
        }
    },
    
    // NIVELES DE EXPOSICIÓN
    exposicion: {
        esporadica: {
            title: "🟢 Nivel de Exposición: ESPORÁDICA (EE)",
            description: "La situación de exposición se presenta de manera eventual.",
            tip: "Ocurre rara vez durante las actividades laborales",
            examples: "Ejemplo: Trabajos de mantenimiento ocasionales, tareas especiales"
        },
        ocasional: {
            title: "🟡 Nivel de Exposición: OCASIONAL (EO)",
            description: "La situación de exposición se presenta alguna vez durante la jornada laboral y por un periodo de tiempo corto.",
            tip: "Exposición limitada en tiempo y frecuencia",
            examples: "Ejemplo: Uso de químicos 1-2 veces por semana, trabajos de soldadura puntuales"
        },
        frecuente: {
            title: "🟠 Nivel de Exposición: FRECUENTE (EF)",
            description: "La situación de exposición se presenta varias veces durante la jornada laboral por tiempos cortos.",
            tip: "Exposición regular pero por períodos breves",
            examples: "Ejemplo: Manipulación de cargas varias veces al día, ruido intermitente"
        },
        continua: {
            title: "🔴 Nivel de Exposición: CONTINUA (EC)",
            description: "La situación de exposición se presenta sin interrupción o varias veces con tiempo prolongado durante la jornada laboral.",
            tip: "Exposición constante durante toda la jornada laboral",
            examples: "Ejemplo: Operadores de máquinas ruidosas, trabajo permanente con pantallas"
        }
    },
    
    // NIVELES DE CONSECUENCIA
    consecuencia: {
        leve: {
            title: "🟢 Nivel de Consecuencia: LEVE (L)",
            description: "Lesiones o enfermedades que no requieren incapacidad.",
            tip: "Daños menores que no afectan la capacidad de trabajo",
            examples: "Ejemplo: Rasguños menores, dolores musculares leves, irritaciones"
        },
        grave: {
            title: "🟡 Nivel de Consecuencia: GRAVE (G)",
            description: "Lesiones o enfermedades con incapacidad laboral temporal.",
            tip: "Requiere tiempo de recuperación pero es reversible",
            examples: "Ejemplo: Fracturas simples, cortes que requieren sutura, quemaduras leves"
        },
        muyGrave: {
            title: "🟠 Nivel de Consecuencia: MUY GRAVE (MG)",
            description: "Lesiones o enfermedades graves irreparables.",
            tip: "Daños permanentes que afectan la calidad de vida",
            examples: "Ejemplo: Pérdida de extremidades, sordera permanente, enfermedades crónicas"
        },
        mortal: {
            title: "🔴 Nivel de Consecuencia: MORTAL (M)",
            description: "Muerte.",
            tip: "El máximo nivel de gravedad posible",
            examples: "Ejemplo: Electrocución, caídas fatales, exposición a sustancias letales"
        }
    }
};

// INSTANCIA GLOBAL DEL TOOLTIP MANAGER
const tooltipManager = new TooltipManager();

import { initContactForm } from './informacion_de_contacto.js';

export function initializeForm() {
    const cargoContainer = document.getElementById('cargoContainer');
    const addCargoBtn = document.getElementById('addCargoBtn');
    const matrizRiesgosForm = document.getElementById('matrizRiesgosForm');
    const btnReactivarTutorial = document.getElementById('btnReactivarTutorial'); 

    if (!cargoContainer || !addCargoBtn || !matrizRiesgosForm) {
        console.error("Elementos DOM esenciales no encontrados.");
        return;
    }

    let tutorialMostradoOriginalmente = localStorage.getItem('tutorialMatrizRiesgosMostrado_v1') === 'true';
    let tutorialActualmenteActivo = false;
    let esPrimerCargoAgregado = true;
    let observerTutorialPopup = null; // Para el MutationObserver

    const historicalValues = { /* ... (como antes) ... */
        cargos: new Set(),
        areas: new Set(),
        zonas: new Set(),
        controles: { fuente: new Set(), medio: new Set(), individuo: new Set() }
    };
    
    try { /* ... (carga de historicalValues) ... */
        const savedHistorical = localStorage.getItem('historicalValues');
        if (savedHistorical) {
            const parsed = JSON.parse(savedHistorical);
            historicalValues.cargos = new Set(parsed.cargos || []);
            historicalValues.areas = new Set(parsed.areas || []);
            historicalValues.zonas = new Set(parsed.zonas || []);
            if (parsed.controles) {
                historicalValues.controles.fuente = new Set(parsed.controles.fuente || []);
                historicalValues.controles.medio = new Set(parsed.controles.medio || []);
                historicalValues.controles.individuo = new Set(parsed.controles.individuo || []);
            }
        }
    } catch (error) { /* ... */ }

    function createDatalist(id, values) { /* ... (como antes) ... */
        let datalist = document.getElementById(id);
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = id;
            document.body.appendChild(datalist);
        }
        datalist.innerHTML = Array.from(values).map(value => `<option value="${value}"></option>`).join('');
        return datalist;
    }
    function updateDatalist(input, values, datalistId) { /* ... (como antes) ... */
        if (input && values && datalistId) {
            const datalist = createDatalist(datalistId, values);
            input.setAttribute('list', datalistId);
        }
    }
    function debounce(func, wait = 300) { /* ... (como antes) ... */
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    function checkExpiration(timestamp) { /* ... (como antes) ... */
        if (!timestamp) return true;
        const HOURS_72 = 72 * 60 * 60 * 1000;
        return (Date.now() - timestamp) > HOURS_72;
    }
    function cleanupHistoricalValues() { /* ... (como antes) ... */
        try {
            const saved = localStorage.getItem('historicalValues');
            if (!saved) return;
            const data = JSON.parse(saved);
            if (data.timestamp && checkExpiration(data.timestamp)) {
                localStorage.removeItem('historicalValues');
                historicalValues.cargos = new Set();
                historicalValues.areas = new Set();
                historicalValues.zonas = new Set();
                historicalValues.controles = { fuente: new Set(), medio: new Set(), individuo: new Set() };
            }
        } catch (error) {
            console.error('Error al limpiar valores históricos:', error);
        }
    }
    function gatherFormData() { 
        const cargosData = [];
        if (!cargoContainer) return { cargos: cargosData };
        const cargoDivs = cargoContainer.querySelectorAll('.cargo');
        
        console.log(`gatherFormData: Procesando ${cargoDivs.length} cargos`);
        
        cargoDivs.forEach((cargoDiv, index) => {
            const cargoNameEl = cargoDiv.querySelector('input[name="cargoName"]');
            const areaEl = cargoDiv.querySelector('input[name="area"]');
            const zonaEl = cargoDiv.querySelector('input[name="zona"]');
            const numTrabajadoresEl = cargoDiv.querySelector('input[name="numTrabajadores"]');
            const descripcionTareasEl = cargoDiv.querySelector('textarea[name="descripcionTareas"]');

            const cargoData = {
                cargoName: cargoNameEl ? cargoNameEl.value.trim() : '',
                area: areaEl ? areaEl.value.trim() : '',
                zona: zonaEl ? zonaEl.value.trim() : '',
                numTrabajadores: numTrabajadoresEl ? numTrabajadoresEl.value : '1',
                descripcionTareas: descripcionTareasEl ? descripcionTareasEl.value : '',
                gesSeleccionados: []
            };
    
            ['tareasRutinarias', 'manipulaAlimentos', 'trabajaAlturas', 'trabajaEspaciosConfinados', 'conduceVehiculo'].forEach(name => {
                const inputEl = cargoDiv.querySelector(`input[name="${name}"]`);
                cargoData[name] = inputEl ? inputEl.checked : false;
            });
    
            console.log(`Cargo ${index + 1} (${cargoData.cargoName}): Buscando GES seleccionados...`);
            
            cargoDiv.querySelectorAll('input[type="checkbox"][name^="ges_cargo_"]:checked').forEach(checkbox => {
                const riesgoValue = checkbox.value;
                console.log(`  Procesando GES: ${riesgoValue}`);
                
                try {
                    const controlesData = {
                        fuente: cargoDiv.querySelector(`input[type="hidden"][data-riesgo="${riesgoValue}"][data-tipo="fuente"]`)?.value || 'Ninguno',
                        medio: cargoDiv.querySelector(`input[type="hidden"][data-riesgo="${riesgoValue}"][data-tipo="medio"]`)?.value || 'Ninguno',
                        individuo: cargoDiv.querySelector(`input[type="hidden"][data-riesgo="${riesgoValue}"][data-tipo="individuo"]`)?.value || 'Ninguno'
                    };
                    
                    const nivelesInput = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
                    let niveles = {};
                    if (nivelesInput && nivelesInput.value) {
                        console.log(`    Niveles encontrados para ${riesgoValue}:`, nivelesInput.value);
                        try { 
                            niveles = JSON.parse(nivelesInput.value); 
                            console.log(`    Niveles parseados:`, niveles);
                        } catch (e) { 
                            console.error(`    Error al parsear niveles para ${riesgoValue}:`, e);
                            niveles = {}; 
                        }
                    } else {
                        console.warn(`    No se encontraron niveles para ${riesgoValue}`);
                    }
                    
                    const [riesgo, ges] = riesgoValue.split(' - ');
                    cargoData.gesSeleccionados.push({ riesgo, ges, controles: controlesData, niveles });
                    
                    console.log(`    GES agregado: ${ges} con niveles:`, niveles);
                } catch (e) { 
                    console.error('Error processing GES:', riesgoValue, e); 
                }
            });
            
            console.log(`Cargo ${index + 1} completado con ${cargoData.gesSeleccionados.length} GES`);
            cargosData.push(cargoData);
        });
        
        console.log('gatherFormData completado:', cargosData);
        return { cargos: cargosData };
    }
    function shouldSaveState() { /* ... (como antes) ... */
        if (!cargoContainer) return false;
        const firstCargo = cargoContainer.querySelector('.cargo');
        if (!firstCargo) return false;
        const cargoNameInput = firstCargo.querySelector('input[name="cargoName"]');
        if (!cargoNameInput || !cargoNameInput.value.trim()) return false;
        return true; 
    }
    function saveData() { 
        if (!shouldSaveState()) return;
        
        // VERIFICACIÓN PREVIA DEL DOM ANTES DE GATHER
        console.log('=== VERIFICACIÓN DOM ANTES DE GATHERFORMDATA ===');
        const cargos = cargoContainer.querySelectorAll('.cargo');
        cargos.forEach((cargo, index) => {
            const cargoName = cargo.querySelector('input[name="cargoName"]')?.value || 'Sin nombre';
            const nivelesInputs = cargo.querySelectorAll('[data-niveles]');
            console.log(`Cargo ${index + 1} (${cargoName}): ${nivelesInputs.length} inputs de niveles en DOM`);
            
            nivelesInputs.forEach(input => {
                console.log(`  - ${input.dataset.riesgo}: ${input.value}`);
            });
        });
        console.log('=== FIN VERIFICACIÓN DOM ===');
        
        const cargosData = gatherFormData();
        if (cargosData.cargos.length === 0 && !document.querySelector('.restore-banner')) {
            return;
        }
        const saveObject = {
            cargos: cargosData.cargos,
            timestamp: Date.now(),
            lastUpdate: new Date().toISOString()
        };
        try {
            localStorage.setItem('matrizRiesgosData', JSON.stringify(saveObject));
            const historicalToSave = {
                cargos: Array.from(historicalValues.cargos),
                areas: Array.from(historicalValues.areas),
                zonas: Array.from(historicalValues.zonas),
                controles: {
                    fuente: Array.from(historicalValues.controles.fuente),
                    medio: Array.from(historicalValues.controles.medio),
                    individuo: Array.from(historicalValues.controles.individuo)
                },
                timestamp: Date.now()
            };
            localStorage.setItem('historicalValues', JSON.stringify(historicalToSave));
        } catch (error) {
            console.error('Error al guardar estado:', error);
        }
    }
    function checkSavedData() { /* ... (como antes) ... */
        try {
            const savedState = localStorage.getItem('matrizRiesgosData');
            if (!savedState) return false;
            const state = JSON.parse(savedState);
            if (state.timestamp && checkExpiration(state.timestamp)) {
                localStorage.removeItem('matrizRiesgosData');
                return false;
            }
            return state;
        } catch (error) {
            console.error('Error al verificar datos guardados:', error);
            return false;
        }
    }
    function validateCargosData() { /* ... (como antes) ... */ 
        if (!cargoContainer) return false;
        let isValid = true;
        const cargoDivs = cargoContainer.querySelectorAll('.cargo');
        if (cargoDivs.length === 0) {
            alert('Debe definir al menos un cargo.');
            return false;
        }
        const gesIncompletos = [];
        
        cargoDivs.forEach(cargoDiv => {
            const cargoNameInput = cargoDiv.querySelector('input[name="cargoName"]');
            const areaInput = cargoDiv.querySelector('input[name="area"]');
            const trabajadoresInput = cargoDiv.querySelector('input[name="numTrabajadores"]');
            const zonaInput = cargoDiv.querySelector('input[name="zona"]');

            if (!cargoNameInput || !cargoNameInput.value.trim()) { alert('Por favor, ingrese el nombre de todos los cargos.'); isValid = false; return; }
            if (!areaInput || !areaInput.value.trim()) { alert('Por favor, ingrese el área para el cargo: ' + (cargoNameInput ? cargoNameInput.value : 'desconocido')); isValid = false; return; }
            if (!trabajadoresInput || !trabajadoresInput.value || parseInt(trabajadoresInput.value) < 1) { alert('Por favor, ingrese un número válido de trabajadores para el cargo: ' + (cargoNameInput ? cargoNameInput.value : 'desconocido')); isValid = false; return; }
            if (!zonaInput || !zonaInput.value.trim()) { alert('Por favor, ingrese la zona para el cargo: ' + (cargoNameInput ? cargoNameInput.value : 'desconocido')); isValid = false; return; }
            
            const gesCheckboxes = cargoDiv.querySelectorAll('input[type="checkbox"][name^="ges_cargo_"]:checked'); // Ajustado
            if (gesCheckboxes.length === 0) {
                alert(`Debe seleccionar al menos un GES para el cargo '${cargoNameInput ? cargoNameInput.value : 'desconocido'}'.`);
                isValid = false; return;
            }
            gesCheckboxes.forEach(checkbox => {
                const riesgoValue = checkbox.value;
                const nivelesInput = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
                if (!nivelesInput || !nivelesInput.value) {
                    gesIncompletos.push({ cargo: (cargoNameInput ? cargoNameInput.value : 'desconocido'), ges: riesgoValue });
                    isValid = false; return;
                }
                try {
                    const niveles = JSON.parse(nivelesInput.value);
                    if (niveles.deficiencia === undefined || niveles.exposicion === undefined || niveles.consecuencia === undefined || 
                        niveles.deficiencia.value === undefined || niveles.exposicion.value === undefined || niveles.consecuencia.value === undefined) {
                        gesIncompletos.push({ cargo: (cargoNameInput ? cargoNameInput.value : 'desconocido'), ges: riesgoValue });
                        isValid = false;
                    }
                } catch (e) {
                    gesIncompletos.push({ cargo: (cargoNameInput ? cargoNameInput.value : 'desconocido'), ges: riesgoValue });
                    isValid = false;
                }
            });
        });
        if (!isValid && gesIncompletos.length > 0) { 
            let mensaje = 'Debe completar todos los niveles (deficiencia, exposición y consecuencia) para los siguientes GES:\n\n';
            gesIncompletos.forEach(item => { mensaje += `• Cargo: ${item.cargo}, GES: ${item.ges}\n`; });
            mensaje += '\nHaga clic en cada GES seleccionado (en el resumen debajo de los riesgos) para completar sus niveles.';
            alert(mensaje);
        }
        return isValid;
    }
    function updateNiveles(riesgoValue, cargoDiv, niveles) { 
        console.log(`updateNiveles llamado para ${riesgoValue}:`, niveles);
        
        // BUSCAR O CREAR EN LA SECCIÓN DE INFO GENERAL (más estable)
        const infoGeneralSection = cargoDiv.querySelector('.info-general-section');
        if (!infoGeneralSection) {
            console.error(`No se encontró info-general-section en el cargo para ${riesgoValue}`);
            return;
        }
        
        let nivelesInput = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
        if (!nivelesInput) {
            nivelesInput = document.createElement('input');
            nivelesInput.type = 'hidden';
            nivelesInput.dataset.riesgo = riesgoValue;
            nivelesInput.dataset.niveles = true;
            nivelesInput.setAttribute('name', `niveles_${riesgoValue.replace(/[^a-zA-Z0-9]/g, '_')}`);
            
            // AGREGAR AL FINAL DE LA SECCIÓN DE INFO GENERAL
            infoGeneralSection.appendChild(nivelesInput);
            console.log(`Creado nuevo input hidden para ${riesgoValue} en info-general-section`);
        } else {
            console.log(`Encontrado input hidden existente para ${riesgoValue}`);
        }
        
        nivelesInput.value = JSON.stringify(niveles);
        console.log(`Input hidden actualizado con valor:`, nivelesInput.value);
        
        // VERIFICAR INMEDIATAMENTE QUE ESTÁ EN EL DOM
        const verificacionInmediata = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
        if (verificacionInmediata) {
            console.log(`✅ Input verificado inmediatamente en DOM:`, verificacionInmediata.value);
        } else {
            console.error(`❌ Input NO encontrado inmediatamente después de crearlo`);
        }
        
        // FORZAR GUARDADO INMEDIATO Y VERIFICAR PERSISTENCIA
        saveData();
        
        // Verificar que se guardó correctamente
        setTimeout(() => {
            const savedData = localStorage.getItem('matrizRiesgosData');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    console.log(`Verificación de persistencia para ${riesgoValue}:`, parsed);
                    
                    // Buscar si nuestros niveles están en los datos guardados
                    const cargoGuardado = parsed.cargos.find(cargo => 
                        cargo.gesSeleccionados.some(ges => `${ges.riesgo} - ${ges.ges}` === riesgoValue)
                    );
                    
                    if (cargoGuardado) {
                        const gesGuardado = cargoGuardado.gesSeleccionados.find(ges => 
                            `${ges.riesgo} - ${ges.ges}` === riesgoValue
                        );
                        console.log(`Niveles persistidos en localStorage:`, gesGuardado?.niveles);
                    } else {
                        console.warn(`No se encontraron niveles persistidos para ${riesgoValue}`);
                    }
                } catch (e) {
                    console.error('Error al verificar persistencia:', e);
                }
            }
        }, 100);
    }
    
    // === NUEVA FUNCIÓN PARA PERSISTIR CONTROLES ===
    function updateControles(riesgoValue, cargoDiv, tipo, valor) {
        // BUSCAR EN LA SECCIÓN DE INFO GENERAL (más estable)
        const infoGeneralSection = cargoDiv.querySelector('.info-general-section');
        if (!infoGeneralSection) {
            console.error(`No se encontró info-general-section en el cargo para control ${tipo} de ${riesgoValue}`);
            return;
        }
        
        // Buscar o crear el input hidden para este control específico
        let controlInput = cargoDiv.querySelector(`input[type="hidden"][data-riesgo="${riesgoValue}"][data-tipo="${tipo}"]`);

        if (!controlInput) {
            controlInput = document.createElement('input');
            controlInput.type = 'hidden';
            controlInput.dataset.riesgo = riesgoValue;
            controlInput.dataset.tipo = tipo;
            controlInput.setAttribute('name', `control_${tipo}_${riesgoValue.replace(/[^a-zA-Z0-9]/g, '_')}`);
            
            // AGREGAR AL FINAL DE LA SECCIÓN DE INFO GENERAL
            infoGeneralSection.appendChild(controlInput);
        }
        controlInput.value = valor || '';
        
        // Actualizar los valores históricos para autocompletado
        if (valor && valor.trim() && valor.trim() !== 'Ninguno') {
            historicalValues.controles[tipo].add(valor.trim());
        }
        
        saveData(); 
    }
    
    function getGesListByRiesgo(riesgo) { /* ... (tu lista completa de GES) ... */
        const gesLists = {
            'Mecánico': ['Caídas al mismo nivel', 'Caídas de altura', 'Posibilidad de atrapamiento', 'Posibilidad de ser golpeado por objetos que caen o en movimiento', 'Posibilidad de proyección de partículas o fluidos a presión', 'Posibilidad de perforación o de punzonamiento', 'Posibilidad de corte o seccionamiento'],
            'Eléctrico': ['Alta tensión debido a instalaciones eléctricas locativas y estáticas', 'Media tensión debido a instalaciones eléctricas locativas y estáticas', 'Baja tensión debido a instalaciones eléctricas locativas y estáticas', 'Electricidad estática'],
            'Físico': ['Iluminación deficiente', 'Iluminación en exceso', 'Presiones anormales', 'Radiaciones ionizantes', 'Radiaciones no ionizantes', 'Radiaciones por equipos audiovisuales', 'Ruido', 'Temperaturas extremas: calor', 'Temperaturas extremas: frío', 'Vibraciones mano-cuerpo', 'Vibraciones cuerpo completo', 'Cambios bruscos de temperatura', 'Humedad Relativa (Vapor de agua)'],
            'Químico': ['Exposición a gases vapores humos polvos no tóxicos', 'Exposición a gases vapores humos polvos tóxicos', 'Exposición sustancias químicas líquidas tóxicas', 'Exposición sustancias químicas líquidas no tóxicas', 'Exposición a sustancias químicas que generan efectos en el organismo'],
            'Biológico': ['Presencia de animales/vectores transmisores de enfermedad', 'Exposición a material contaminado o con riesgo biológico', 'Manipulación de alimentos', 'Exposición a microorganismos', 'Exposición a Virus', 'Exposición a Bacterias'],
            'Biomecánico': ['Manejo de cargas mayores a 25 Kg (Hombres)', 'Manejo de cargas mayores a 12.5 Kg (Mujeres)', 'Adopción de posturas nocivas', 'Movimientos repetitivos (6 o más por minuto)', 'Diseño del puesto de trabajo inadecuado', 'Posturas prolongadas y/o incorrectas'],
            'Factores Humanos': ['Competencias no definidas para el cargo', 'Actos inseguros observados'],
            'Psicosocial': ['Atención de público', 'Monotonía/repetitividad de funciones', 'Trabajo bajo presión'],
            'Locativo': ['Almacenamiento inadecuado', 'Condiciones inadecuadas de orden y aseo', 'Condiciones del piso', 'Escaleras y barandas inadecuadas o mal estado', 'Condiciones de las instalaciones'],
            'Natural': ['Deslizamientos', 'Inundación', 'Sismo - Terremotos', 'Tormentas eléctricas', 'Lluvias granizadas'],
            'Seguridad': ['Secuestros', 'Amenazas', 'Hurtos - Robos - Atracos', 'Accidente de Tránsito', 'Desorden público - Atentados', 'Extorsión'],
            'Otros Riesgos': ['Trabajos en caliente', 'Explosión', 'Incendio'],
            'Saneamiento Básico': ['Sin disponibilidad de agua potable'],
            'Salud Pública': ['Enfermedades endémicas', 'Mordedura y Picadura de Animales']
        };
        return gesLists[riesgo] || [];
    }
    function generateNivelesHTML(riesgoValue, cargoDiv) { 
        function getNivelSeleccionado(riesgoVal, nivelNom, val, cDiv) {
            console.log(`🔍 getNivelSeleccionado: Buscando ${nivelNom}=${val} para ${riesgoVal}`);
            
            const nivelesData = cDiv.querySelector(`[data-riesgo="${riesgoVal}"][data-niveles]`);
            if (!nivelesData || !nivelesData.value) {
                console.log(`❌ No se encontraron datos de niveles para ${riesgoVal} - ${nivelNom}`);
                
                // DEBUGGING ADICIONAL: Ver qué inputs SÍ existen
                const todosLosInputsNiveles = cDiv.querySelectorAll('[data-niveles]');
                console.log(`   Inputs de niveles disponibles (${todosLosInputsNiveles.length}):`);
                todosLosInputsNiveles.forEach(input => {
                    console.log(`     - ${input.dataset.riesgo}: ${input.value}`);
                });
                
                return false;
            }
            try { 
                const niveles = JSON.parse(nivelesData.value);
                console.log(`✅ Niveles encontrados para ${riesgoVal}:`, niveles);
                console.log(`🔍 Verificando ${nivelNom} con valor ${val}:`, niveles[nivelNom]);
                
                const resultado = niveles[nivelNom] && niveles[nivelNom].value === val;
                console.log(`🎯 Resultado para ${nivelNom}=${val}: ${resultado}`);
                
                return resultado; 
            } catch (e) { 
                console.error(`❌ Error al parsear niveles para ${riesgoVal}:`, e);
                return false; 
            }
        }
        
        // CONFIGURACIÓN DE NIVELES CON TOOLTIPS MEJORADOS
        const nivelesConfig = [
            { 
                nombre: 'deficiencia', 
                etiqueta: 'Nivel de Deficiencia',
                descripcion: 'Evalúa la eficacia de las medidas de control existentes',
                opciones: [ 
                    { label: 'Bajo (B)', value: 0, d: 'No se ha detectado consecuencia alguna, o la eficacia del conjunto de medidas preventivas existentes es alta.', c: '#4caf50', tooltipKey: 'bajo' }, 
                    { label: 'Medio (M)', value: 2, d: 'Se han detectado peligros que pueden dar lugar a consecuencias poco significativas.', c: '#ffeb3b', tooltipKey: 'medio' }, 
                    { label: 'Alto (A)', value: 6, d: 'Se ha(n) detectado algún(os) peligro(s) que pueden dar lugar a consecuencias significativa(s).', c: '#ff9800', tooltipKey: 'alto' }, 
                    { label: 'Muy Alto (MA)', value: 10, d: 'Se han detectado peligros que determinan como muy posible la generación de incidentes.', c: '#f44336', tooltipKey: 'muyAlto' } 
                ] 
            },
            { 
                nombre: 'exposicion', 
                etiqueta: 'Nivel de Exposición',
                descripcion: 'Evalúa la frecuencia y duración de la exposición al riesgo',
                opciones: [ 
                    { label: 'Esporádica (EE)', value: 1, d: 'La situación de exposición se presenta de manera eventual.', c: '#4caf50', tooltipKey: 'esporadica' }, 
                    { label: 'Ocasional (EO)', value: 2, d: 'La situación de exposición se presenta alguna vez durante la jornada laboral y por un periodo de tiempo corto.', c: '#ffeb3b', tooltipKey: 'ocasional' }, 
                    { label: 'Frecuente (EF)', value: 3, d: 'La situación de exposición se presenta varias veces durante la jornada laboral por tiempos cortos.', c: '#ff9800', tooltipKey: 'frecuente' }, 
                    { label: 'Continua (EC)', value: 4, d: 'La situación de exposición se presenta sin interrupción o varias veces con tiempo prolongado durante la jornada laboral.', c: '#f44336', tooltipKey: 'continua' } 
                ] 
            },
            { 
                nombre: 'consecuencia', 
                etiqueta: 'Nivel de Consecuencia',
                descripcion: 'Evalúa la gravedad del daño potencial que puede ocurrir',
                opciones: [ 
                    { label: 'Leve (L)', value: 10, d: 'Lesiones o enfermedades que no requieren incapacidad.', c: '#4caf50', tooltipKey: 'leve' }, 
                    { label: 'Grave (G)', value: 25, d: 'Lesiones o enfermedades con incapacidad laboral temporal.', c: '#ffeb3b', tooltipKey: 'grave' }, 
                    { label: 'Muy Grave (MG)', value: 60, d: 'Lesiones o enfermedades graves irreparables.', c: '#ff9800', tooltipKey: 'muyGrave' }, 
                    { label: 'Mortal (M)', value: 100, d: 'Muerte.', c: '#f44336', tooltipKey: 'mortal' } 
                ] 
            }
        ];
        
        // GENERACIÓN DE HTML CON TOOLTIPS INTEGRADOS
        const htmlGenerado = nivelesConfig.map(nivel => {
            console.log(`🏗️ Generando HTML para nivel: ${nivel.nombre}`);
            
            const opcionesHTML = nivel.opciones.map(op => {
                const isSelected = getNivelSeleccionado(riesgoValue, nivel.nombre, op.value, cargoDiv);
                console.log(`   Opción ${op.label} (valor ${op.value}): selected = ${isSelected}`);
                
                return `
                    <div class="barra${isSelected ? ' selected' : ''}"
                         style="background-color: ${op.c}" 
                         data-nivel="${op.value}" 
                         data-label="${op.label}" 
                         data-descripcion="${op.d}"
                         data-tooltip-category="${nivel.nombre}"
                         data-tooltip-key="${op.tooltipKey}"
                         tabindex="0" 
                         role="button" 
                         aria-label="${op.label}">
                         <span class="barra-label">${op.label}</span>
                         <span class="check-icon">✓</span>
                    </div>`;
            }).join('');
            
            return `
                <div class="nivel" data-nivel-nombre="${nivel.nombre}">
                    <label class="nivel-label" title="${nivel.descripcion}">
                        ${nivel.etiqueta}
                        <span class="info-icon" data-tooltip-info="${nivel.nombre}">ℹ️</span>
                    </label>
                    <div class="barras">
                        ${opcionesHTML}
                    </div>
                </div>`;
        }).join('');
        
        console.log(`🎨 HTML generado para ${riesgoValue} completado`);
        return htmlGenerado;
    }
    function showControlesPopup(riesgoValue, cargoDiv, checkbox) { 
        console.log(`🚀 showControlesPopup iniciado para: ${riesgoValue}`);
        console.log(`📦 CargoDiv recibido:`, cargoDiv);
        
        // VERIFICAR QUE EL CARGODIV TIENE LOS INPUTS HIDDEN
        const nivelesEnCargoDiv = cargoDiv.querySelectorAll('[data-niveles]');
        console.log(`🔢 Inputs de niveles en cargoDiv: ${nivelesEnCargoDiv.length}`);
        nivelesEnCargoDiv.forEach(input => {
            console.log(`   📝 ${input.dataset.riesgo}: ${input.value}`);
        });
        
        // VERIFICAR ESPECÍFICAMENTE EL INPUT PARA ESTE RIESGO
        const inputEspecifico = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
        console.log(`🎯 Input específico para ${riesgoValue}:`, inputEspecifico);
        if (inputEspecifico) {
            console.log(`   Valor: ${inputEspecifico.value}`);
        }
        
        const existingPopup = document.querySelector('.controles-popup');
        if (existingPopup) existingPopup.remove();
        const [riesgo, ges] = riesgoValue.split(' - ');
        const popup = document.createElement('div');
        popup.className = 'controles-popup';
        createDatalist('fuente-datalist', historicalValues.controles.fuente);
        createDatalist('medio-datalist', historicalValues.controles.medio);
        createDatalist('individuo-datalist', historicalValues.controles.individuo);
        popup.innerHTML = `
            <div class="popup-header"><h4>${ges}</h4><span class="riesgo-label">${riesgo}</span><button class="close-popup" type="button">×</button></div>
            <div class="popup-content">
                <div class="controles-section"><h5>Controles Existentes</h5>
            <div class="control-group">
                <label>Fuente:</label>
                <input type="text" name="control-fuente" data-riesgo="${riesgoValue}" data-tipo="fuente" 
                        placeholder="Ninguno" list="fuente-datalist" 
                        value="${cargoDiv.querySelector(`input[type="hidden"][data-riesgo='${riesgoValue}'][data-tipo='fuente']`)?.value || ''}">
            </div>
            <div class="control-group">
                <label>Medio:</label>
                <input type="text" name="control-medio" data-riesgo="${riesgoValue}" data-tipo="medio" 
                        placeholder="Ninguno" list="medio-datalist" 
                        value="${cargoDiv.querySelector(`input[type="hidden"][data-riesgo='${riesgoValue}'][data-tipo='medio']`)?.value || ''}">
            </div>
            <div class="control-group">
                <label>Individuo:</label>
                <input type="text" name="control-individuo" data-riesgo="${riesgoValue}" data-tipo="individuo" 
                        placeholder="Ninguno" list="individuo-datalist" 
                        value="${cargoDiv.querySelector(`input[type="hidden"][data-riesgo='${riesgoValue}'][data-tipo='individuo']`)?.value || ''}">
            </div>
        </div>
                <div class="niveles-section"><h5>Evaluación de Niveles</h5>${generateNivelesHTML(riesgoValue, cargoDiv)}</div>
            </div>`;
        document.body.appendChild(popup);
        const checkboxRect = checkbox.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        popup.style.position = 'fixed';
        let top = checkboxRect.top + (checkboxRect.height / 2) - (popupRect.height / 2);
        let left = checkboxRect.right + 10;
        if ((left + popupRect.width) > window.innerWidth) left = checkboxRect.left - popupRect.width - 10;
        if ((top + popupRect.height) > window.innerHeight) top = window.innerHeight - popupRect.height - 10;
        if (top < 0) top = 10;
        if (left < 0 && (checkboxRect.right + 10 + popupRect.width <= window.innerWidth)) {
             left = checkboxRect.right + 10;
        } else if (left < 0) {
            left = 10;
        }
        popup.style.top = `${top}px`; popup.style.left = `${left}px`;
        
        // REPOSICIONAR POPUP AL HACER SCROLL
        const repositionOnScroll = () => {
            const newCheckboxRect = checkbox.getBoundingClientRect();
            const newPopupRect = popup.getBoundingClientRect();
            
            let newTop = newCheckboxRect.top + (newCheckboxRect.height / 2) - (newPopupRect.height / 2);
            let newLeft = newCheckboxRect.right + 10;
            
            if ((newLeft + newPopupRect.width) > window.innerWidth) newLeft = newCheckboxRect.left - newPopupRect.width - 10;
            if ((newTop + newPopupRect.height) > window.innerHeight) newTop = window.innerHeight - newPopupRect.height - 10;
            if (newTop < 0) newTop = 10;
            if (newLeft < 0 && (newCheckboxRect.right + 10 + newPopupRect.width <= window.innerWidth)) {
                newLeft = newCheckboxRect.right + 10;
            } else if (newLeft < 0) {
                newLeft = 10;
            }
            
            popup.style.top = `${newTop}px`;
            popup.style.left = `${newLeft}px`;
        };
        
        // AGREGAR LISTENER DE SCROLL
        window.addEventListener('scroll', repositionOnScroll, true);
        
        popup.querySelector('.close-popup').onclick = () => {
            console.log(`Cerrando popup para ${riesgoValue}`);
            
            // Guardar valores de controles antes de cerrar
            popup.querySelectorAll('.control-group input').forEach(input => {
                const tipo = input.dataset.tipo;
                const valor = input.value.trim();
                updateControles(riesgoValue, cargoDiv, tipo, valor);
            });
            
            // FORZAR ACTUALIZACIÓN DEL RESUMEN Y GUARDADO FINAL
            updateGesResumen(cargoDiv);
            
            // Forzar guardado inmediato
            console.log('Forzando guardado final al cerrar popup...');
            saveData();
            
            // Verificar que los niveles siguen ahí después del guardado
            setTimeout(() => {
                const verificacionFinal = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
                console.log(`Verificación final post-cierre para ${riesgoValue}:`, 
                    verificacionFinal ? verificacionFinal.value : 'NO ENCONTRADO');
            }, 50);
            
            tooltipManager.hideTooltip(); // Limpiar tooltips
            window.removeEventListener('scroll', repositionOnScroll, true); // Limpiar listener
            popup.remove();
        };
        
        popup.querySelectorAll('.control-group input').forEach(input => {
            // Actualizar datalist y persistir valor en tiempo real
            input.oninput = () => { 
                const tipo = input.name.split('-')[1];
                const valor = input.value.trim();
                updateDatalist(input, historicalValues.controles[tipo], `${tipo}-datalist`);
                updateControles(riesgoValue, cargoDiv, tipo, valor);
            };
            
            // También guardar al salir del campo (onblur)
            input.onblur = () => {
                const tipo = input.dataset.tipo;
                const valor = input.value.trim();
                updateControles(riesgoValue, cargoDiv, tipo, valor);
            };
        });
        
        // BARRAS DE NIVELES CON TOOLTIPS MEJORADOS
        popup.querySelectorAll('.barra').forEach(barra => {
            // EVENTO CLICK - Seleccionar nivel
            barra.onclick = () => {
                console.log(`Seleccionando nivel para ${riesgoValue}`);
                
                const nivelDiv = barra.closest('.nivel');
                const nivelName = nivelDiv.dataset.nivelNombre;
                
                nivelDiv.querySelectorAll('.barra').forEach(b => b.classList.remove('selected'));
                barra.classList.add('selected');
                
                const nivelesData = cargoDiv.querySelector(`[data-riesgo="${riesgoValue}"][data-niveles]`);
                const niveles = nivelesData && nivelesData.value ? JSON.parse(nivelesData.value) : {};
                
                niveles[nivelName] = { 
                    value: parseInt(barra.dataset.nivel),
                    label: barra.dataset.label
                };
                
                console.log(`Actualizando nivel ${nivelName} para ${riesgoValue}:`, niveles[nivelName]);
                
                updateNiveles(riesgoValue, cargoDiv, niveles);
                updateGesResumen(cargoDiv);
                
                // FORZAR GUARDADO ADICIONAL
                console.log('Forzando guardado adicional tras seleccionar nivel...');
                setTimeout(() => {
                    saveData();
                }, 100);
            };
            
            // TOOLTIPS DIRECTOS EN HOVER
            barra.onmouseenter = () => {
                const category = barra.dataset.tooltipCategory;
                const key = barra.dataset.tooltipKey;
                
                if (tooltipContent[category] && tooltipContent[category][key]) {
                    const content = tooltipContent[category][key];
                    
                    tooltipManager.showTooltip(content.description, {
                        title: content.title,
                        tip: content.tip
                    });
                }
            };
            
            // OCULTAR TOOLTIP AL SALIR
            barra.onmouseleave = () => {
                tooltipManager.hideTooltip();
            };
        });

        // TOOLTIPS PARA ETIQUETAS DE NIVELES
        popup.querySelectorAll('.info-icon').forEach(icon => {
            icon.onmouseenter = () => {
                const nivelType = icon.dataset.tooltipInfo;
                let description = '';
                
                switch(nivelType) {
                    case 'deficiencia':
                        description = 'Evalúa qué tan efectivos son los controles existentes para prevenir o reducir el riesgo.';
                        break;
                    case 'exposicion':
                        description = 'Mide con qué frecuencia y por cuánto tiempo los trabajadores están expuestos al riesgo.';
                        break;
                    case 'consecuencia':
                        description = 'Determina qué tan grave puede ser el daño si el riesgo se materializa.';
                        break;
                }
                
                tooltipManager.showTooltip(description, {
                    title: `ℹ️ Información sobre ${icon.dataset.tooltipInfo}`
                });
            };
            
            icon.onmouseleave = () => {
                tooltipManager.hideTooltip();
            };
        });
        
        // AGREGAR TOOLTIPS PARA CONTROLES
        addControlTooltips(popup);
        
        // CERRAR AL HACER CLICK FUERA
        const clickOutsideHandler = (e) => {
            if (popup && !popup.contains(e.target) && checkbox && !checkbox.contains(e.target)) {
                if (document.body.contains(popup)) {
                    // Guardar valores de controles antes de cerrar
                    popup.querySelectorAll('.control-group input').forEach(input => {
                        const tipo = input.dataset.tipo;
                        const valor = input.value.trim();
                        updateControles(riesgoValue, cargoDiv, tipo, valor);
                    });
                    
                    tooltipManager.hideTooltip(); // Limpiar tooltips
                    window.removeEventListener('scroll', repositionOnScroll, true); // Limpiar listener
                    popup.remove();
                }
                document.removeEventListener('click', clickOutsideHandler, true);
            }
        };
        setTimeout(() => document.addEventListener('click', clickOutsideHandler, true), 0); 
    }
    
    // === TOOLTIPS PARA CONTROLES ===
    function addControlTooltips(popup) {
        const controlInputs = popup.querySelectorAll('.control-group input');
        
        controlInputs.forEach(input => {
            const tipo = input.name.split('-')[1];
            let tooltipInfo = {};
            
            switch(tipo) {
                case 'fuente':
                    tooltipInfo = {
                        title: "🎯 Controles en la Fuente",
                        description: "Medidas que eliminan o reducen el peligro directamente en su origen.",
                        tip: "Ejemplos: Sustitución de químicos, rediseño de procesos, automatización"
                    };
                    break;
                case 'medio':
                    tooltipInfo = {
                        title: "🌊 Controles en el Medio",
                        description: "Medidas que actúan sobre el ambiente de trabajo para reducir la exposición.",
                        tip: "Ejemplos: Ventilación, señalización, barreras físicas, aislamiento acústico"
                    };
                    break;
                case 'individuo':
                    tooltipInfo = {
                        title: "👤 Controles en el Individuo",
                        description: "Medidas que protegen directamente al trabajador expuesto.",
                        tip: "Ejemplos: EPP, capacitación, exámenes médicos, rotación de personal"
                    };
                    break;
            }
            
            input.onmouseenter = () => {
                tooltipManager.showTooltip(tooltipInfo.description, {
                    title: tooltipInfo.title,
                    tip: tooltipInfo.tip
                });
            };
            
            input.onmouseleave = () => {
                tooltipManager.hideTooltip();
            };
        });
    }
    
    function updateGesResumen(cargoDiv) {
        console.log('🔄 updateGesResumen ejecutándose...');
        
        const gesResumenDiv = cargoDiv.querySelector('.ges-resumen');
        if (!gesResumenDiv) { 
            console.error('❌ gesResumenDiv no encontrado en el DOM para:', cargoDiv); 
            return; 
        }
        
        const gesCheckboxes = cargoDiv.querySelectorAll('input[type="checkbox"][name^="ges_cargo_"]:checked');
        const selectedGes = Array.from(gesCheckboxes).map(cb => cb.value);
        
        console.log(`📋 GES seleccionados para resumen: ${selectedGes.length}`);
        selectedGes.forEach(ges => console.log(`   - ${ges}`));
        
        gesResumenDiv.innerHTML = '';
        
        if (selectedGes.length > 0) {
            selectedGes.forEach(ges => {
                console.log(`🔍 Procesando GES para resumen: ${ges}`);
                
                const gesItem = document.createElement('div');
                gesItem.className = 'ges-resumen-item';
                
                // BUSCAR INPUT HIDDEN CON DEBUGGING DETALLADO
                const nivelesInput = cargoDiv.querySelector(`[data-riesgo="${ges}"][data-niveles]`);
                console.log(`   🎯 Input hidden encontrado: ${!!nivelesInput}`);
                
                if (nivelesInput) {
                    console.log(`   📝 Valor del input: ${nivelesInput.value}`);
                } else {
                    // DEBUGGING: Ver qué inputs SÍ existen
                    const todosLosInputsNiveles = cargoDiv.querySelectorAll('[data-niveles]');
                    console.log(`   🔍 Inputs de niveles disponibles (${todosLosInputsNiveles.length}):`);
                    todosLosInputsNiveles.forEach(input => {
                        console.log(`     - ${input.dataset.riesgo}: ${input.value}`);
                    });
                }
                
                let nivelesCompletos = false;
                if (nivelesInput && nivelesInput.value) {
                    try {
                        const niveles = JSON.parse(nivelesInput.value);
                        console.log(`   📊 Niveles parseados:`, niveles);
                        
                        nivelesCompletos = niveles.deficiencia !== undefined && niveles.deficiencia.value !== undefined &&
                                           niveles.exposicion !== undefined && niveles.exposicion.value !== undefined &&
                                           niveles.consecuencia !== undefined && niveles.consecuencia.value !== undefined;
                        
                        console.log(`   ✅ Niveles completos: ${nivelesCompletos}`);
                        console.log(`     - deficiencia: ${niveles.deficiencia?.value !== undefined}`);
                        console.log(`     - exposicion: ${niveles.exposicion?.value !== undefined}`);
                        console.log(`     - consecuencia: ${niveles.consecuencia?.value !== undefined}`);
                    } catch (e) { 
                        console.error(`   ❌ Error al parsear niveles:`, e);
                        nivelesCompletos = false; 
                    }
                } else {
                    console.log(`   ❌ No hay input hidden o está vacío para ${ges}`);
                }
                
                const checkMark = document.createElement('span');
                checkMark.className = `check-mark ${nivelesCompletos ? 'complete' : 'incomplete'}`;
                checkMark.textContent = nivelesCompletos ? '✓' : '!';
                
                console.log(`   🎨 Creando icono: ${nivelesCompletos ? '✓ (completo)' : '! (incompleto)'}`);
                
                const gesText = document.createElement('span');
                gesText.textContent = ges;
                gesItem.className = `ges-resumen-item ${nivelesCompletos ? 'complete-ges' : 'incomplete-ges'}`;
                gesItem.title = nivelesCompletos ? 'Niveles completos' : 'Falta completar los niveles de este GES';
                gesItem.style.cursor = 'pointer';
                gesItem.onclick = () => {
                    console.log(`🖱️ Click en GES resumen: ${ges}`);
                    console.log(`🏠 CargoDiv para popup:`, cargoDiv);
                    
                    const checkbox = cargoDiv.querySelector(`input[value="${ges}"]`);
                    console.log(`☑️ Checkbox encontrado:`, checkbox);
                    
                    if (checkbox) {
                        showControlesPopup(ges, cargoDiv, checkbox);
                    } else {
                        console.error(`❌ No se encontró checkbox para ${ges}`);
                    }
                };
                gesItem.appendChild(checkMark);
                gesItem.appendChild(gesText);
                gesResumenDiv.appendChild(gesItem);
            });
        } else {
            gesResumenDiv.textContent = 'No se han seleccionado GES.';
        }
        
        console.log('🔄 updateGesResumen completado');
    }
    
    function iniciarTutorialPrimerCargo(cargoDiv) {
        if (tutorialMostradoOriginalmente || tutorialActualmenteActivo || !cargoDiv) {
            esPrimerCargoAgregado = false; 
            return;
        }
        tutorialActualmenteActivo = true; 
        const pasosTutorial = [
            { 
                selector: 'input[name="cargoName"]', 
                elementoFriendlyName: 'Nombre del Cargo', 
                mensaje: "Comienza ingresando el nombre del cargo, por ejemplo, 'Secretaria Administrativa' o 'Operario de Máquina'.", 
                posicion: 'bottom' 
            },
            { 
                selector: '.trabajadores-container', // Apuntar al contenedor
                elementoFriendlyName: 'Número de Trabajadores', 
                mensaje: "Indica cuántos trabajadores desempeñan este cargo. Puedes escribir directamente con el teclado o usar los botones '+' y '-' para ajustar el número.", 
                posicion: 'right' // Mantenemos 'right', ya que 'bottom-left' o 'bottom' pueden tapar.
                                   // Si 'right' sigue siendo problemático, 'left' o 'top' son alternativas.
            },
            { 
                selector: 'input[name="area"]', 
                elementoFriendlyName: 'Área', 
                mensaje: "Indica el área o departamento al que pertenece este cargo, como 'Administración' o 'Producción'.", 
                posicion: 'bottom' 
            },
            { 
                selector: 'input[name="zona"]', 
                elementoFriendlyName: 'Zona/Lugar', 
                mensaje: "Especifica la zona o lugar físico donde se desempeña principalmente este cargo.", 
                posicion: 'bottom' 
            },
            { 
                selector: 'textarea[name="descripcionTareas"]', 
                elementoFriendlyName: 'Descripción de Tareas', 
                mensaje: "Describe brevemente las principales tareas y responsabilidades de este cargo.", 
                posicion: 'top' 
            },
            { 
                selector: '.toggles-section .toggle:first-child', 
                elementoFriendlyName: 'Interruptores de Características', 
                mensaje: "Usa estos interruptores para indicar características especiales del cargo, como si manipula alimentos o trabaja en alturas.", 
                posicion: 'bottom' 
            },
            { 
                selector: '.riesgos-swiper .swiper-slide:first-child .slide-content h3', 
                elementoFriendlyName: 'Título del Primer Riesgo', 
                mensaje: "Explora los diferentes tipos de riesgos. Selecciona los GES (Grupos de Exposición Similar) que apliquen a este cargo.", 
                posicion: 'bottom' 
            },
            { 
                selector: '.riesgos-swiper .swiper-slide:first-child .ges-list .ges-item:first-child label', 
                elementoFriendlyName: 'Checkbox del Primer GES', 
                mensaje: "Haz clic en un GES para seleccionarlo. Luego, podrás definir los controles existentes y evaluar los niveles de riesgo al hacer clic en el nombre del GES en el resumen de abajo.", 
                posicion: 'right' 
            },
            { 
                selector: '.ges-resumen', 
                elementoFriendlyName: 'Resumen de GES', 
                mensaje: "Aquí verás los GES seleccionados. Haz clic en cada uno para detallar los controles y niveles. ¡Un check verde indica que está completo!", 
                posicion: 'top', 
                esUltimoPasoConTarget: true 
            }
            // Aquí irían los pasos para el pop-up de controles y niveles
            // Esto requerirá que el paso anterior (selección de GES) abra el pop-up,
            // y luego estos nuevos pasos apunten a elementos DENTRO del pop-up.
        ];
        let pasoActualIdx = 0;

        function limpiarHighlightsYPopups() {
            document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
            document.querySelectorAll('.tutorial-popup').forEach(p => p.remove());
        }

        function posicionarPopup(popup, targetElement, posicion = 'bottom') {
            if (!popup || !targetElement) return;
        
            // Asegurar que el popup esté en el DOM y visible para getBoundingClientRect
            if (!popup.parentNode) document.body.appendChild(popup);
            const prevDisplay = popup.style.display;
            const prevVisibility = popup.style.visibility;
            popup.style.display = 'block'; // Forzar display para cálculo de dimensiones
            popup.style.visibility = 'hidden'; // Ocultar para evitar parpadeo
        
            const popupRect = popup.getBoundingClientRect();
        
            popup.style.display = prevDisplay; // Restaurar display
            popup.style.visibility = prevVisibility; // Restaurar visibilidad
        
            const targetRect = targetElement.getBoundingClientRect();
            popup.style.position = 'fixed'; 
            
            let top, left;
            const arrowSize = 8; 
            const spacing = 15; 
        
            popup.classList.remove('pos-top', 'pos-bottom', 'pos-left', 'pos-right');
        
            switch (posicion) {
                case 'top':
                    top = targetRect.top - popupRect.height - spacing;
                    left = targetRect.left + (targetRect.width / 2) - (popupRect.width / 2);
                    popup.classList.add('pos-top');
                    break;
                case 'left':
                    top = targetRect.top + (targetRect.height / 2) - (popupRect.height / 2);
                    left = targetRect.left - popupRect.width - spacing;
                    popup.classList.add('pos-left');
                    break;
                case 'right':
                    top = targetRect.top + (targetRect.height / 2) - (popupRect.height / 2);
                    left = targetRect.right + spacing;
                    popup.classList.add('pos-right');
                    break;
                case 'bottom-left': 
                    top = targetRect.bottom + spacing;
                    left = targetRect.left; 
                    popup.classList.add('pos-bottom'); 
                    break;
                default: // 'bottom' y cualquier otro caso
                    top = targetRect.bottom + spacing;
                    left = targetRect.left + (targetRect.width / 2) - (popupRect.width / 2);
                    popup.classList.add('pos-bottom');
                    break;
            }
        
            const minMargin = 10; 
            popup.style.top = `${Math.max(minMargin, Math.min(top, window.innerHeight - popupRect.height - minMargin))}px`;
            popup.style.left = `${Math.max(minMargin, Math.min(left, window.innerWidth - popupRect.width - minMargin))}px`;
        }
        

        function mostrarPaso(indicePaso) {
            limpiarHighlightsYPopups();
            if (indicePaso >= pasosTutorial.length) {
                tutorialMostradoOriginalmente = true; 
                localStorage.setItem('tutorialMatrizRiesgosMostrado_v1', 'true');
                tutorialActualmenteActivo = false;
                return;
            }
            const paso = pasosTutorial[indicePaso];
            const elementoTarget = cargoDiv.querySelector(paso.selector);
            if (!elementoTarget) {
                console.warn(`Tutorial: Elemento no encontrado para '${paso.elementoFriendlyName}' (selector: ${paso.selector})`);
                pasoActualIdx++; mostrarPaso(pasoActualIdx); return;
            }

            elementoTarget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            
            // Esperar a que el scroll termine antes de posicionar el popup
            const scrollEndListener = () => {
                // Eliminar el listener para evitar múltiples ejecuciones si hay scrolls rápidos
                // Esto es un poco rudimentario; una solución con promesas sería más elegante
                // pero para un tutorial simple puede funcionar.
                // window.removeEventListener('scroll', scrollEndChecker); // No es la mejor forma de detectar fin de scroll.

                elementoTarget.classList.add('tutorial-highlight');
                const popup = document.createElement('div');
                popup.className = 'tutorial-popup';
                
                let clasePosicionFlecha = paso.posicion;
                if (paso.posicion === 'bottom-left') clasePosicionFlecha = 'bottom';
                if(clasePosicionFlecha) popup.classList.add(`pos-${clasePosicionFlecha}`);

                popup.innerHTML = `
                    <div class="tutorial-mensaje">${paso.mensaje}</div>
                    <div class="tutorial-acciones">
                        ${indicePaso > 0 ? '<button class="tutorial-btn-anterior" type="button">Anterior</button>' : ''}
                        <button class="tutorial-btn-siguiente" type="button">${indicePaso === pasosTutorial.length - 1 ? 'Finalizar Tutorial' : 'Siguiente'}</button>
                        <button class="tutorial-btn-saltar" type="button">Saltar Tutorial</button>
                    </div>`;
                document.body.appendChild(popup);
                
                // Usar requestAnimationFrame para asegurar que el popup esté en el DOM y tenga dimensiones
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => { 
                        posicionarPopup(popup, elementoTarget, paso.posicion);
                    });
                });
                
                popup.querySelector('.tutorial-btn-siguiente').onclick = () => {
                    if (paso.esUltimoPasoConTarget) elementoTarget.classList.remove('tutorial-highlight');
                    pasoActualIdx++; mostrarPaso(pasoActualIdx);
                };
                if (indicePaso > 0) {
                    popup.querySelector('.tutorial-btn-anterior').onclick = () => {
                        pasoActualIdx--; mostrarPaso(pasoActualIdx);
                    };
                }
                popup.querySelector('.tutorial-btn-saltar').onclick = () => {
                    limpiarHighlightsYPopups(); 
                    tutorialMostradoOriginalmente = true; 
                    localStorage.setItem('tutorialMatrizRiesgosMostrado_v1', 'true');
                    tutorialActualmenteActivo = false;
                };
            };
            
            // Dar un tiempo para que la animación de scroll comience/termine.
            // Esto es una heurística, no una garantía.
            setTimeout(scrollEndListener, 400); // Ajustar este delay si es necesario
        }
        setTimeout(() => mostrarPaso(pasoActualIdx), 500); 
    }
    
    function addCargo(cargoData = {}, isDefault = false) {
        const currentCargoCount = cargoContainer ? cargoContainer.querySelectorAll('.cargo').length : 0;
        const uniqueCargoIdSuffix = Date.now() + "_" + currentCargoCount; 
        
        if (!cargoData.niveles) cargoData.niveles = {};
        const cargoDiv = document.createElement('div');
        cargoDiv.className = 'cargo';
    
        const cargoHeader = document.createElement('div');
        cargoHeader.className = 'cargo-header';
        const headerLeft = document.createElement('div');
        headerLeft.className = 'header-left';
        const areaLabel = document.createElement('div');
        areaLabel.className = 'area-label';
        areaLabel.textContent = cargoData.area || 'Área';
        const cargoTitle = document.createElement('h3');
        cargoTitle.className = 'cargo-title';
        cargoTitle.textContent = cargoData.cargoName || `Cargo #${currentCargoCount + 1}`;
        headerLeft.appendChild(areaLabel);
        headerLeft.appendChild(cargoTitle);
    
        const headerRight = document.createElement('div');
        headerRight.className = 'header-right';
        const trabajadoresContainer = document.createElement('div');
        trabajadoresContainer.className = 'trabajadores-container';
        const minusBtn = document.createElement('button');
        minusBtn.type = 'button'; minusBtn.className = 'minus-btn'; minusBtn.textContent = '-';
        const trabajadoresInput = document.createElement('input');
        trabajadoresInput.type = 'number'; 
        trabajadoresInput.name = 'numTrabajadores'; 
        trabajadoresInput.min = '1';
        trabajadoresInput.value = cargoData.numTrabajadores || '1';
        
        // Permitir edición con teclado y validar el valor
        trabajadoresInput.oninput = () => {
            const value = parseInt(trabajadoresInput.value);
            if (value < 1 || isNaN(value)) {
                trabajadoresInput.value = '1';
            }
            saveData();
        };
        
        trabajadoresInput.onblur = () => {
            const value = parseInt(trabajadoresInput.value);
            if (value < 1 || isNaN(value)) {
                trabajadoresInput.value = '1';
            }
            saveData();
        };
        
        const plusBtn = document.createElement('button');
        plusBtn.type = 'button'; plusBtn.className = 'plus-btn'; plusBtn.textContent = '+';
        minusBtn.onclick = () => { 
            const currentValue = parseInt(trabajadoresInput.value);
            if (currentValue > 1) { 
                trabajadoresInput.value = currentValue - 1; 
                saveData(); 
            } 
        };
        plusBtn.onclick = () => { 
            const currentValue = parseInt(trabajadoresInput.value);
            trabajadoresInput.value = currentValue + 1; 
            saveData(); 
        };
        trabajadoresContainer.append(minusBtn, trabajadoresInput, plusBtn);
    
        const minimizeBtn = document.createElement('button');
        minimizeBtn.type = 'button'; minimizeBtn.className = 'minimize-btn'; minimizeBtn.innerHTML = '-';
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button'; deleteBtn.className = 'delete-btn';
        const trashIcon = document.createElement('img');
        trashIcon.src = canecaIcon; trashIcon.alt = 'Eliminar'; trashIcon.className = 'trash-icon';
        deleteBtn.appendChild(trashIcon);
    
        if (isDefault && currentCargoCount === 0) {
            deleteBtn.disabled = true;
        } else {
            deleteBtn.disabled = false;
        }
    
        deleteBtn.onclick = () => {
            if (cargoContainer.querySelectorAll('.cargo').length > 1) {
                if (confirm('¿Está seguro de que desea eliminar este cargo?')) {
                    cargoDiv.remove();
                    saveData(); 
                    const remainingCargos = cargoContainer.querySelectorAll('.cargo');
                    if (remainingCargos.length === 1) {
                        const lastDeleteBtn = remainingCargos[0].querySelector('.delete-btn');
                        if(lastDeleteBtn) lastDeleteBtn.disabled = true;
                    }
                }
            } else { alert('No puede eliminar el último cargo.'); }
        };
        headerRight.append(trabajadoresContainer, minimizeBtn, deleteBtn);
        cargoHeader.append(headerLeft, headerRight);
    
        const cargoBody = document.createElement('div');
        cargoBody.className = 'cargo-body';
        minimizeBtn.onclick = () => { cargoBody.classList.toggle('hidden'); minimizeBtn.innerHTML = cargoBody.classList.contains('hidden') ? '+' : '-'; };
        
        const infoGeneralSection = document.createElement('div');
        infoGeneralSection.className = 'info-general-section';
        const cargoNameInput = document.createElement('input');
        cargoNameInput.type = 'text'; cargoNameInput.name = 'cargoName'; cargoNameInput.placeholder = 'Ingresa el nombre del cargo';
        cargoNameInput.value = cargoData.cargoName || '';
        cargoNameInput.oninput = () => { cargoTitle.textContent = cargoNameInput.value || `Cargo #${cargoContainer.querySelectorAll('.cargo').length}`; };
        cargoNameInput.onblur = () => { if (cargoNameInput.value.trim()) historicalValues.cargos.add(cargoNameInput.value.trim()); saveData(); };
        
        const areaInput = document.createElement('input');
        areaInput.type = 'text'; areaInput.name = 'area'; areaInput.placeholder = 'Ingresa el área';
        areaInput.value = cargoData.area || ''; updateDatalist(areaInput, historicalValues.areas, 'areas-datalist');
        areaInput.oninput = () => { areaLabel.textContent = areaInput.value || 'Área'; updateDatalist(areaInput, historicalValues.areas, 'areas-datalist'); };
        areaInput.onblur = () => { if (areaInput.value.trim()) { historicalValues.areas.add(areaInput.value.trim()); updateDatalist(areaInput, historicalValues.areas, 'areas-datalist'); } saveData(); };
        
        const zonaInput = document.createElement('input');
        zonaInput.type = 'text'; zonaInput.name = 'zona'; zonaInput.placeholder = 'Ingresa la zona o lugar de trabajo';
        zonaInput.value = cargoData.zona || ''; updateDatalist(zonaInput, historicalValues.zonas, 'zonas-datalist');
        zonaInput.oninput = () => updateDatalist(zonaInput, historicalValues.zonas, 'zonas-datalist');
        zonaInput.onblur = () => { if (zonaInput.value.trim()) { historicalValues.zonas.add(zonaInput.value.trim()); updateDatalist(zonaInput, historicalValues.zonas, 'zonas-datalist'); } saveData(); };
        
        const tareasTextarea = document.createElement('textarea');
        tareasTextarea.name = 'descripcionTareas'; tareasTextarea.placeholder = 'Describe las tareas de este cargo';
        tareasTextarea.value = cargoData.descripcionTareas || ''; tareasTextarea.oninput = debounce(saveData, 300);
        infoGeneralSection.append(cargoNameInput, areaInput, zonaInput, tareasTextarea);
        
        const togglesSection = document.createElement('div');
        togglesSection.className = 'toggles-section';
        const toggles = [
            { label: '¿Tareas rutinarias?', name: 'tareasRutinarias' }, { label: '¿Manipula alimentos?', name: 'manipulaAlimentos' },
            { label: '¿Trabaja en alturas?', name: 'trabajaAlturas' }, { label: '¿Trabaja en espacios confinados?', name: 'trabajaEspaciosConfinados' },
            { label: '¿Conduce vehículo?', name: 'conduceVehiculo' }
        ];
        toggles.forEach(toggle => { 
            const toggleDiv = document.createElement('div'); toggleDiv.className = 'toggle';
            const toggleLabelEl = document.createElement('label'); toggleLabelEl.textContent = toggle.label;
            const toggleInput = document.createElement('input'); toggleInput.type = 'checkbox'; toggleInput.name = toggle.name;
            toggleInput.checked = cargoData[toggle.name] || false; toggleInput.onchange = saveData;
            const toggleSlider = document.createElement('span'); toggleSlider.className = 'slider';
            const toggleWrapper = document.createElement('label'); toggleWrapper.className = 'switch';
            toggleWrapper.append(toggleInput, toggleSlider); 
            toggleDiv.append(toggleLabelEl, toggleWrapper);
            togglesSection.appendChild(toggleDiv);
        });
        
        const riesgosSection = document.createElement('div');
        riesgosSection.className = 'riesgos-section';
        const riesgos = ['Mecánico', 'Eléctrico', 'Físico', 'Químico', 'Biológico', 'Biomecánico', 'Factores Humanos', 'Psicosocial', 'Locativo', 'Natural', 'Seguridad', 'Otros Riesgos', 'Saneamiento Básico', 'Salud Pública'];
        const riesgoColors = { 
            'Mecánico': '#cbe3f3', 'Eléctrico': '#fee6fc', 'Físico': '#fdf8cd', 'Químico': '#c7f9ff',
            'Biológico': '#d8fff1', 'Biomecánico': '#d8fff1', 'Factores Humanos': '#ffefd2', 'Psicosocial': '#e6e6e6',
            'Locativo': '#fee6fc', 'Natural': '#fee6fc', 'Seguridad': '#fee6fc', 'Otros Riesgos': '#fee6fc',
            'Saneamiento Básico': '#fee6fc', 'Salud Pública': '#fee6fc'
        };
        const swiperContainerEl = document.createElement('div'); swiperContainerEl.className = 'swiper riesgos-swiper';
        const swiperWrapper = document.createElement('div'); swiperWrapper.className = 'swiper-wrapper';
        
        riesgos.forEach(riesgo => { 
            const swiperSlide = document.createElement('div'); swiperSlide.className = 'swiper-slide'; swiperSlide.style.backgroundColor = riesgoColors[riesgo] || '#f0f0f0';
            const slideContent = document.createElement('div'); slideContent.className = 'slide-content';
            const riesgoTitleH3 = document.createElement('h3'); riesgoTitleH3.textContent = `Riesgo ${riesgo}`;
            const gesList = getGesListByRiesgo(riesgo);
            const gesListDiv = document.createElement('div'); gesListDiv.className = 'ges-list';
            gesList.forEach(ges => {
                const gesItemDiv = document.createElement('div'); gesItemDiv.className = 'ges-item';
                const gesCheckbox = document.createElement('input'); gesCheckbox.type = 'checkbox'; 
                const gesNameUnico = `ges_cargo_${uniqueCargoIdSuffix}_${riesgo.replace(/[^a-zA-Z0-9]/g, "")}_${ges.replace(/[^a-zA-Z0-9]/g, "")}`;
                gesCheckbox.name = gesNameUnico; 
                gesCheckbox.id = gesNameUnico; 
                gesCheckbox.value = `${riesgo} - ${ges}`;
                
                if (cargoData.gesSeleccionados && cargoData.gesSeleccionados.find(g => g.riesgo === riesgo && g.ges === ges)) {
                    gesCheckbox.checked = true;
                }
                gesCheckbox.onchange = () => {
                    if (gesCheckbox.checked) showControlesPopup(gesCheckbox.value, cargoDiv, gesCheckbox);
                    else { 
                        const existingPopup = document.querySelector('.controles-popup');
                        if (existingPopup && existingPopup.querySelector('h4')?.textContent === ges) {
                            existingPopup.remove();
                        }
                    }
                    updateGesResumen(cargoDiv); saveData();
                };
                const gesLabelEl = document.createElement('label'); 
                gesLabelEl.textContent = ges; 
                gesLabelEl.htmlFor = gesNameUnico; 

                gesItemDiv.appendChild(gesCheckbox); 
                gesItemDiv.appendChild(gesLabelEl); 
                gesListDiv.appendChild(gesItemDiv);
            });
            slideContent.append(riesgoTitleH3, gesListDiv);
            swiperSlide.appendChild(slideContent);
            swiperWrapper.appendChild(swiperSlide);
        });
        swiperContainerEl.appendChild(swiperWrapper);
        const swiperButtonNext = document.createElement('div'); swiperButtonNext.className = 'swiper-button-next';
        const swiperButtonPrev = document.createElement('div'); swiperButtonPrev.className = 'swiper-button-prev';
        const swiperPagination = document.createElement('div'); swiperPagination.className = 'swiper-pagination';
        swiperContainerEl.append(swiperButtonPrev, swiperButtonNext, swiperPagination);
        riesgosSection.appendChild(swiperContainerEl);
        
        const gesResumenDiv = document.createElement('div');
        gesResumenDiv.className = 'ges-resumen';
        
        cargoBody.append(infoGeneralSection, togglesSection, riesgosSection, gesResumenDiv);
        cargoDiv.append(cargoHeader, cargoBody);
        
        if (cargoContainer) {
             // FIX: Insertar ANTES del hero-content, no al final
             const heroContent = cargoContainer.querySelector('.hero-content');
             if (heroContent) {
                 cargoContainer.insertBefore(cargoDiv, heroContent);
             } else {
                 cargoContainer.appendChild(cargoDiv);
             }
        } else {
            return; 
        }

        new Swiper(swiperContainerEl, { 
            navigation: { nextEl: swiperButtonNext, prevEl: swiperButtonPrev }, 
            pagination: { el: swiperPagination, clickable: true }, 
            slidesPerView: 1, 
            spaceBetween: 10 
        });
        
        updateGesResumen(cargoDiv);
    
        if (esPrimerCargoAgregado && !tutorialMostradoOriginalmente && cargoDiv.isConnected) {
            const primerCargoDiv = cargoContainer.querySelector('.cargo');
            if (primerCargoDiv) {
                const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
                let tutorialObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !tutorialActualmenteActivo && !tutorialMostradoOriginalmente) {
                            iniciarTutorialPrimerCargo(primerCargoDiv);
                            observer.unobserve(entry.target); 
                        }
                    });
                }, observerOptions);
                tutorialObserver.observe(primerCargoDiv);

                setTimeout(() => {
                    if (!tutorialActualmenteActivo && !tutorialMostradoOriginalmente && primerCargoDiv.offsetParent !== null) {
                        const rect = primerCargoDiv.getBoundingClientRect();
                        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0 && rect.left < window.innerWidth && rect.right >= 0;
                        if (isVisible) {
                             iniciarTutorialPrimerCargo(primerCargoDiv);
                             if (tutorialObserver) { 
                                tutorialObserver.unobserve(primerCargoDiv);
                                tutorialObserver = null; 
                             }
                        }
                    }
                }, 7000); 
            }
            esPrimerCargoAgregado = false; 
        }
    }
    
    function showRestoreBanner(state) { 
        const banner = document.createElement('div');
        banner.className = 'restore-banner';
        const lastUpdate = new Date(state.lastUpdate || state.timestamp);
        const hoursAgo = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60));
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-message">Encontramos datos guardados con ${state.cargos.length} cargo(s) de hace ${hoursAgo} hora(s).</div>
                <div class="banner-actions">
                    <button class="btn-restore cta-button" type="button">Continuar</button>
                    <button class="btn-new cta-button-1" type="button">Empezar de Nuevo</button>
                </div>
            </div>`;
        const container = document.querySelector('.matriz-riesgos-section') || document.body; 
        if(container.firstChild) container.insertBefore(banner, container.firstChild);
        else container.appendChild(banner);

        banner.querySelector('.btn-restore').onclick = () => { 
            restoreFormState(state); 
            banner.remove(); 
            
            // FORZAR VERIFICACIÓN INMEDIATA DE INPUTS HIDDEN
            console.log('🔄 Ejecutando verificación automática post-restauración...');
            setTimeout(() => {
                if (window.forzarRecreacionInputs) {
                    window.forzarRecreacionInputs();
                }
            }, 100);
        };
        banner.querySelector('.btn-new').onclick = () => {
            localStorage.removeItem('matrizRiesgosData');
            
            // FIX: Solo borrar los cargos, NO el hero-content
            if(cargoContainer) {
                const cargosToRemove = cargoContainer.querySelectorAll('.cargo');
                cargosToRemove.forEach(cargo => cargo.remove());
            }
            
            esPrimerCargoAgregado = true; 
            tutorialMostradoOriginalmente = false; 
            tutorialActualmenteActivo = false;
            localStorage.removeItem('tutorialMatrizRiesgosMostrado_v1');
            addCargo({}, true);
            banner.remove();
        };
    }

    function restoreFormState(state) {
        try {
            if(!cargoContainer) return;
            
            // FIX: Solo borrar los cargos, NO el hero-content
            const cargosToRemove = cargoContainer.querySelectorAll('.cargo');
            cargosToRemove.forEach(cargo => cargo.remove());
            
            esPrimerCargoAgregado = (state.cargos.length <= 1); 
            
            state.cargos.forEach((cargoData, index) => {
                addCargo(cargoData, index === 0 && state.cargos.length === 1);
                
                // Obtener el último cargo agregado (siempre estará antes del hero-content)
                const cargoEl = cargoContainer.querySelector('.cargo:last-of-type');
                    
                if (!cargoEl) return;

                if (cargoData.gesSeleccionados && cargoData.gesSeleccionados.length > 0) {
                    cargoData.gesSeleccionados.forEach(gesData => {
                        const gesValue = `${gesData.riesgo} - ${gesData.ges}`;
                        const checkbox = cargoEl.querySelector(`input[value="${gesValue}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                            if (gesData.controles) {
                                ['fuente', 'medio', 'individuo'].forEach(tipo => {
                                    if (gesData.controles[tipo]) {
                                        // CREAR DIRECTAMENTE EN INFO-GENERAL-SECTION
                                        const infoGeneralSection = cargoEl.querySelector('.info-general-section');
                                        if (infoGeneralSection) {
                                            let controlInput = cargoEl.querySelector(`[data-riesgo="${gesValue}"][data-tipo="${tipo}"]`);
                                            if (!controlInput) {
                                                controlInput = document.createElement('input'); 
                                                controlInput.type = 'hidden';
                                                controlInput.dataset.riesgo = gesValue; 
                                                controlInput.dataset.tipo = tipo;
                                                controlInput.setAttribute('name', `control_${tipo}_${gesValue.replace(/[^a-zA-Z0-9]/g, '_')}`);
                                                infoGeneralSection.appendChild(controlInput);
                                            }
                                            controlInput.value = gesData.controles[tipo];
                                            console.log(`Restaurado control ${tipo} para ${gesValue}: ${gesData.controles[tipo]}`);
                                        }
                                    }
                                });
                            }
                            if (gesData.niveles) {
                                console.log(`Restaurando niveles para ${gesValue}:`, gesData.niveles);
                                
                                // CREAR DIRECTAMENTE EL INPUT EN INFO-GENERAL-SECTION
                                const infoGeneralSection = cargoEl.querySelector('.info-general-section');
                                if (infoGeneralSection) {
                                    let nivelesInput = cargoEl.querySelector(`[data-riesgo="${gesValue}"][data-niveles]`);
                                    if (!nivelesInput) {
                                        nivelesInput = document.createElement('input');
                                        nivelesInput.type = 'hidden';
                                        nivelesInput.dataset.riesgo = gesValue;
                                        nivelesInput.dataset.niveles = true;
                                        nivelesInput.setAttribute('name', `niveles_${gesValue.replace(/[^a-zA-Z0-9]/g, '_')}`);
                                        infoGeneralSection.appendChild(nivelesInput);
                                        console.log(`Creado input hidden directo para restauración: ${gesValue}`);
                                    }
                                    nivelesInput.value = JSON.stringify(gesData.niveles);
                                    console.log(`Input hidden restaurado con valor:`, nivelesInput.value);
                                } else {
                                    console.error(`No se encontró info-general-section para restaurar ${gesValue}`);
                                }
                                
                                // TAMBIÉN LLAMAR updateNiveles como backup
                                updateNiveles(gesValue, cargoEl, gesData.niveles);
                                
                                // Verificar que se creó correctamente
                                const verificacion = cargoEl.querySelector(`[data-riesgo="${gesValue}"][data-niveles]`);
                                console.log(`Verificación post-restauración:`, verificacion ? verificacion.value : 'NO ENCONTRADO');
                            }
                        }
                    });
                    updateGesResumen(cargoEl);
                }
            });
            const allCargos = cargoContainer.querySelectorAll('.cargo');
            if (allCargos.length === 1) {
                const deleteBtn = allCargos[0].querySelector('.delete-btn');
                if (deleteBtn) deleteBtn.disabled = true;
            }
            if (state.cargos.length > 0) {
                esPrimerCargoAgregado = false;
                tutorialMostradoOriginalmente = true; 
                localStorage.setItem('tutorialMatrizRiesgosMostrado_v1', 'true');
            }
        } catch (error) {
            console.error('Error al restaurar estado:', error);
            // En caso de error, solo limpiar cargos y agregar uno nuevo
            const cargosToRemove = cargoContainer.querySelectorAll('.cargo');
            cargosToRemove.forEach(cargo => cargo.remove());
            addCargo({}, true);
        }
        
        // === VERIFICACIÓN Y CORRECCIÓN POST-RESTAURACIÓN ===
        console.log('\n🔧 === VERIFICACIÓN POST-RESTAURACIÓN ===');
        setTimeout(() => {
            const cargosDespuesRestauracion = cargoContainer.querySelectorAll('.cargo');
            console.log(`Verificando ${cargosDespuesRestauracion.length} cargos después de restauración...`);
            
            cargosDespuesRestauracion.forEach((cargoVerificar, index) => {
                const cargoName = cargoVerificar.querySelector('input[name="cargoName"]')?.value || 'Sin nombre';
                console.log(`\n--- CARGO ${index + 1}: ${cargoName} ---`);
                
                const gesCheckboxes = cargoVerificar.querySelectorAll('input[type="checkbox"][name^="ges_cargo_"]:checked');
                console.log(`GES seleccionados: ${gesCheckboxes.length}`);
                
                gesCheckboxes.forEach(checkbox => {
                    const gesValue = checkbox.value;
                    console.log(`🔍 Verificando GES: ${gesValue}`);
                    
                    // Buscar el input hidden correspondiente
                    let inputNiveles = cargoVerificar.querySelector(`[data-riesgo="${gesValue}"][data-niveles]`);
                    
                    if (!inputNiveles) {
                        console.warn(`❌ Input hidden faltante para ${gesValue}, intentando recrear...`);
                        
                        // Buscar en localStorage los datos correspondientes
                        try {
                            const savedData = localStorage.getItem('matrizRiesgosData');
                            if (savedData) {
                                const parsed = JSON.parse(savedData);
                                const cargoEncontrado = parsed.cargos[index];
                                if (cargoEncontrado) {
                                    const gesEncontrado = cargoEncontrado.gesSeleccionados.find(ges => 
                                        `${ges.riesgo} - ${ges.ges}` === gesValue
                                    );
                                    
                                    if (gesEncontrado && gesEncontrado.niveles && Object.keys(gesEncontrado.niveles).length > 0) {
                                        console.log(`🔧 Recreando input hidden para ${gesValue} con niveles:`, gesEncontrado.niveles);
                                        
                                        // Crear el input hidden faltante
                                        const infoGeneralSection = cargoVerificar.querySelector('.info-general-section');
                                        if (infoGeneralSection) {
                                            inputNiveles = document.createElement('input');
                                            inputNiveles.type = 'hidden';
                                            inputNiveles.dataset.riesgo = gesValue;
                                            inputNiveles.dataset.niveles = true;
                                            inputNiveles.setAttribute('name', `niveles_${gesValue.replace(/[^a-zA-Z0-9]/g, '_')}`);
                                            inputNiveles.value = JSON.stringify(gesEncontrado.niveles);
                                            infoGeneralSection.appendChild(inputNiveles);
                                            
                                            console.log(`✅ Input hidden recreado exitosamente para ${gesValue}`);
                                            
                                            // Actualizar el resumen
                                            updateGesResumen(cargoVerificar);
                                        } else {
                                            console.error(`❌ No se encontró info-general-section en cargo para recrear ${gesValue}`);
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.error(`❌ Error al recrear input hidden para ${gesValue}:`, e);
                        }
                    } else {
                        console.log(`✅ Input hidden existe para ${gesValue}: ${inputNiveles.value}`);
                    }
                });
            });
            
            console.log('🔧 === FIN VERIFICACIÓN POST-RESTAURACIÓN ===\n');
        }, 500); // Delay para asegurar que DOM esté estable
        
        // === FORZAR ACTUALIZACIÓN DE RESUMEN DESPUÉS DE RESTAURACIÓN ===
        setTimeout(() => {
            console.log('🔄 === FORZANDO ACTUALIZACIÓN DE RESUMEN POST-RESTAURACIÓN ===');
            const cargosParaActualizar = cargoContainer.querySelectorAll('.cargo');
            cargosParaActualizar.forEach((cargo, index) => {
                const cargoName = cargo.querySelector('input[name="cargoName"]')?.value || 'Sin nombre';
                console.log(`🔄 Actualizando resumen para cargo ${index + 1}: ${cargoName}`);
                updateGesResumen(cargo);
            });
            console.log('🔄 === ACTUALIZACIÓN DE RESUMEN COMPLETADA ===\n');
        }, 1000); // Delay mayor para asegurar que todo esté listo
    }
    
    cleanupHistoricalValues();
    const estadoGuardado = checkSavedData();
    if (estadoGuardado && estadoGuardado.cargos && estadoGuardado.cargos.length > 0) {
        showRestoreBanner(estadoGuardado);
    } else {
        addCargo({}, true);
    }

    addCargoBtn.addEventListener('click', () => {
        const todosLosCargos = cargoContainer.querySelectorAll('.cargo');
        if (todosLosCargos.length === 1) {
            const deleteBtnPrimerCargo = todosLosCargos[0].querySelector('.delete-btn');
            if(deleteBtnPrimerCargo) deleteBtnPrimerCargo.disabled = false;
        }
        addCargo(); 
        saveData();
    });

    matrizRiesgosForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateCargosData()) return;

        const submitButton = matrizRiesgosForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Generando tus documentos...';

        try {
            const formData = gatherFormData();
            // Agregar datos de contacto del nuevo formulario
            const contactForm = document.getElementById('contact-info-form');
            if (contactForm) {
                formData.contact = {
                    fullName: contactForm.querySelector('#contact-fullname').value,
                    email: contactForm.querySelector('#contact-email').value,
                    phone: contactForm.querySelector('#contact-phone').value,
                    companyName: contactForm.querySelector('#contact-company').value,
                };
            }

            console.log('--- DATOS FINALES A ENVIAR (FRONTEND) ---');
            console.log(JSON.stringify(formData, null, 2));
            console.log('-------------------------------------------');

            const response = await fetch('/api/matriz-riesgos/generar', { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // ¡Cambiado! Esperamos un JSON ahora.
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json(); // Leemos la respuesta como JSON

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error desconocido del servidor.');
            }

            // ¡Éxito! Redirigir a la página de resultados.
            if (result.redirectUrl) {
                // Limpiar datos guardados para no mostrar el banner de restauración al volver.
                localStorage.removeItem('matrizRiesgosData');
                window.location.href = result.redirectUrl;
            } else {
                throw new Error('El servidor no proporcionó una URL de redirección.');
            }

        } catch (error) {
            console.error('Error detallado:', error);
            alert(`Error al procesar la solicitud: ${error.message}`);
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    if (btnReactivarTutorial) {
        btnReactivarTutorial.addEventListener('click', () => {
            let primerCargoExistente = cargoContainer.querySelector('.cargo');
            
            // Si no hay cargo, crear uno automáticamente para el tutorial
            if (!primerCargoExistente) {
                addCargo({}, true); // Crear cargo por defecto
                primerCargoExistente = cargoContainer.querySelector('.cargo');
            }
            
            if (primerCargoExistente) {
                tutorialMostradoOriginalmente = false; 
                tutorialActualmenteActivo = false; 
                iniciarTutorialPrimerCargo(primerCargoExistente);
            } else {
                // Fallback si algo sale mal
                console.error("No se pudo crear o encontrar un cargo para el tutorial");
                alert("Error al iniciar el tutorial. Intente refrescar la página.");
            }
        });
    }
}

// === FUNCIÓN TEMPORAL DE DEBUGGING ===
// Añadir esta función al objeto window para debugging manual
window.debugNiveles = function() {
    const cargoContainer = document.getElementById('cargoContainer');
    if (!cargoContainer) {
        console.log('No se encontró cargoContainer');
        return;
    }

    console.log('\n=== DEBUGGING COMPLETO DE NIVELES ===');
    
    // 1. Estado actual en el DOM
    const cargos = cargoContainer.querySelectorAll('.cargo');
    console.log(`\n--- ESTADO ACTUAL DEL DOM (${cargos.length} cargos) ---`);

    cargos.forEach((cargo, index) => {
        const cargoName = cargo.querySelector('input[name="cargoName"]')?.value || 'Sin nombre';
        console.log(`\nCARGO ${index + 1}: ${cargoName}`);

        // VERIFICAR UBICACIÓN DE LOS INPUTS HIDDEN
        const infoGeneralSection = cargo.querySelector('.info-general-section');
        console.log(`  Info-general-section encontrada: ${!!infoGeneralSection}`);
        
        if (infoGeneralSection) {
            const inputsEnInfoGeneral = infoGeneralSection.querySelectorAll('[data-niveles], [data-tipo]');
            console.log(`  Inputs hidden en info-general: ${inputsEnInfoGeneral.length}`);
            
            inputsEnInfoGeneral.forEach(input => {
                if (input.dataset.niveles) {
                    console.log(`    NIVEL: ${input.dataset.riesgo} = ${input.value}`);
                } else if (input.dataset.tipo) {
                    console.log(`    CONTROL ${input.dataset.tipo}: ${input.dataset.riesgo} = ${input.value}`);
                }
            });
        }

        // VERIFICAR SI HAY INPUTS FUERA DE INFO-GENERAL
        const inputsFueraDeInfo = cargo.querySelectorAll('[data-niveles], [data-tipo]');
        const inputsEnInfo = infoGeneralSection ? infoGeneralSection.querySelectorAll('[data-niveles], [data-tipo]') : [];
        console.log(`  Total inputs hidden: ${inputsFueraDeInfo.length}`);
        console.log(`  Inputs en info-general: ${inputsEnInfo.length}`);
        console.log(`  Inputs fuera de info-general: ${inputsFueraDeInfo.length - inputsEnInfo.length}`);

        const nivelesInputs = cargo.querySelectorAll('[data-niveles]');
        console.log(`  Inputs de niveles encontrados: ${nivelesInputs.length}`);

        nivelesInputs.forEach(input => {
            const riesgo = input.dataset.riesgo;
            const parent = input.parentElement?.className || 'unknown';
            console.log(`    Riesgo: ${riesgo}`);
            console.log(`    Valor DOM: ${input.value}`);
            console.log(`    Ubicado en: ${parent}`);
            try {
                const niveles = JSON.parse(input.value);
                console.log(`    Niveles parseados:`, niveles);
            } catch (e) {
                console.error(`    Error al parsear:`, e);
            }
        });

        const gesSeleccionados = cargo.querySelectorAll('input[type="checkbox"][name^="ges_cargo_"]:checked');
        console.log(`  GES seleccionados: ${gesSeleccionados.length}`);
    });

    // 2. Estado guardado en localStorage
    console.log(`\n--- ESTADO EN LOCALSTORAGE ---`);
    try {
        const savedData = localStorage.getItem('matrizRiesgosData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            console.log(`Timestamp: ${new Date(parsed.timestamp).toLocaleString()}`);
            console.log(`Cargos guardados: ${parsed.cargos.length}`);
            
            parsed.cargos.forEach((cargoGuardado, index) => {
                console.log(`\nCARGO GUARDADO ${index + 1}: ${cargoGuardado.cargoName}`);
                console.log(`  GES guardados: ${cargoGuardado.gesSeleccionados.length}`);
                
                cargoGuardado.gesSeleccionados.forEach(ges => {
                    const gesFullName = `${ges.riesgo} - ${ges.ges}`;
                    console.log(`    GES: ${gesFullName}`);
                    console.log(`    Niveles guardados:`, ges.niveles);
                    console.log(`    Controles guardados:`, ges.controles);
                });
            });
        } else {
            console.log('No hay datos guardados en localStorage');
        }
    } catch (e) {
        console.error('Error al leer localStorage:', e);
    }

    // 3. Comparación y diagnóstico
    console.log(`\n--- DIAGNÓSTICO ---`);
    const savedData = localStorage.getItem('matrizRiesgosData');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        const domCargos = cargoContainer.querySelectorAll('.cargo').length;
        const storedCargos = parsed.cargos.length;
        
        if (domCargos === storedCargos) {
            console.log('✅ Cantidad de cargos coincide');
        } else {
            console.warn(`❌ Cantidad de cargos no coincide: DOM(${domCargos}) vs Stored(${storedCargos})`);
        }
        
        // Verificar niveles específicos
        cargos.forEach((cargo, index) => {
            const cargoGuardado = parsed.cargos[index];
            if (!cargoGuardado) return;
            
            const nivelesInputs = cargo.querySelectorAll('[data-niveles]');
            const gesGuardados = cargoGuardado.gesSeleccionados.length;
            
            console.log(`Cargo ${index + 1}: DOM tiene ${nivelesInputs.length} niveles, localStorage tiene ${gesGuardados} GES`);
        });
    }

    console.log('\n=== FIN DEBUG NIVELES ===');
};

// === FUNCIÓN TEMPORAL DE GUARDADO FORZADO ===
window.forzarGuardado = function() {
    console.log('=== FORZANDO GUARDADO MANUAL ===');
    const cargoContainer = document.getElementById('cargoContainer');
    if (!cargoContainer) {
        console.log('No se encontró cargoContainer');
        return;
    }

    // Obtener datos actuales
    const cargosData = gatherFormData();
    console.log('Datos a guardar:', cargosData);

    // Forzar guardado
    const saveObject = {
        cargos: cargosData.cargos,
        timestamp: Date.now(),
        lastUpdate: new Date().toISOString()
    };

    try {
        localStorage.setItem('matrizRiesgosData', JSON.stringify(saveObject));
        console.log('✅ Guardado forzado exitoso');
        
        // Verificar inmediatamente
        const verificacion = localStorage.getItem('matrizRiesgosData');
        if (verificacion) {
            const parsed = JSON.parse(verificacion);
            console.log('✅ Verificación inmediata exitosa:', parsed);
        }
    } catch (error) {
        console.error('❌ Error en guardado forzado:', error);
    }
};

// === FUNCIÓN PARA DEBUGGEAR RESTAURACIÓN VISUAL ===
window.debugRestauracionVisual = function() {
    console.log('\n=== DEBUG RESTAURACIÓN VISUAL ===');
    
    const cargoContainer = document.getElementById('cargoContainer');
    if (!cargoContainer) {
        console.log('❌ No se encontró cargoContainer');
        return;
    }

    const cargos = cargoContainer.querySelectorAll('.cargo');
    console.log(`🏠 Cargos encontrados: ${cargos.length}`);
    
    cargos.forEach((cargo, index) => {
        const cargoName = cargo.querySelector('input[name="cargoName"]')?.value || 'Sin nombre';
        console.log(`\n--- CARGO ${index + 1}: ${cargoName} ---`);
        
        // Verificar GES seleccionados
        const gesSeleccionados = cargo.querySelectorAll('input[type="checkbox"][name^="ges_cargo_"]:checked');
        console.log(`☑️ GES seleccionados: ${gesSeleccionados.length}`);
        
        // Para cada GES, simular clic y ver qué pasa
        gesSeleccionados.forEach(checkbox => {
            const gesValue = checkbox.value;
            console.log(`\n🔍 ANALIZANDO GES: ${gesValue}`);
            
            // Verificar input hidden
            const inputNiveles = cargo.querySelector(`[data-riesgo="${gesValue}"][data-niveles]`);
            if (inputNiveles) {
                console.log(`   ✅ Input hidden encontrado: ${inputNiveles.value}`);
                try {
                    const niveles = JSON.parse(inputNiveles.value);
                    console.log(`   📊 Niveles parseados:`, niveles);
                    
                    // Verificar cada nivel
                    ['deficiencia', 'exposicion', 'consecuencia'].forEach(tipoNivel => {
                        if (niveles[tipoNivel]) {
                            console.log(`     ${tipoNivel}: ${niveles[tipoNivel].label} (${niveles[tipoNivel].value})`);
                        } else {
                            console.log(`     ${tipoNivel}: ❌ NO CONFIGURADO`);
                        }
                    });
                } catch (e) {
                    console.error(`   ❌ Error al parsear niveles:`, e);
                }
            } else {
                console.log(`   ❌ NO se encontró input hidden para ${gesValue}`);
            }
            
            // Verificar si el GES está en el resumen
            const gesResumen = cargo.querySelector('.ges-resumen');
            if (gesResumen) {
                const itemResumen = Array.from(gesResumen.querySelectorAll('.ges-resumen-item')).find(item => 
                    item.textContent.includes(gesValue)
                );
                if (itemResumen) {
                    const isComplete = itemResumen.classList.contains('complete-ges');
                    console.log(`   📋 En resumen: ${isComplete ? '✅ COMPLETO' : '❌ INCOMPLETO'}`);
                } else {
                    console.log(`   📋 ❌ NO se encontró en resumen`);
                }
            }
        });
    });
    
    console.log('\n💡 Para probar restauración visual:');
    console.log('1. Haz clic en un GES del resumen (debajo de los riesgos)');
    console.log('2. Observa los logs de showControlesPopup y getNivelSeleccionado');
    console.log('3. Verifica si las barras aparecen seleccionadas');
    
    console.log('\n=== FIN DEBUG RESTAURACIÓN VISUAL ===');
};

console.log('Funciones de debugging disponibles: debugNiveles(), forzarGuardado(), debugRestauracionVisual(), forzarRecreacionInputs(), forzarActualizacionIconos()');

// === FUNCIÓN PARA FORZAR RECREACIÓN DE INPUTS HIDDEN ===
window.forzarRecreacionInputs = function() {
    console.log('\n🔧 === FORZANDO RECREACIÓN DE INPUTS HIDDEN ===');
    
    const cargoContainer = document.getElementById('cargoContainer');
    if (!cargoContainer) {
        console.log('❌ No se encontró cargoContainer');
        return;
    }

    const cargos = cargoContainer.querySelectorAll('.cargo');
    console.log(`🏠 Procesando ${cargos.length} cargos...`);
    
    cargos.forEach((cargo, index) => {
        const cargoName = cargo.querySelector('input[name="cargoName"]')?.value || 'Sin nombre';
        console.log(`\n--- CARGO ${index + 1}: ${cargoName} ---`);
        
        const gesCheckboxes = cargo.querySelectorAll('input[type="checkbox"][name^="ges_cargo_"]:checked');
        console.log(`GES seleccionados: ${gesCheckboxes.length}`);
        
        gesCheckboxes.forEach(checkbox => {
            const gesValue = checkbox.value;
            console.log(`🔍 Procesando GES: ${gesValue}`);
            
            // Verificar si ya existe input hidden
            let inputNiveles = cargo.querySelector(`[data-riesgo="${gesValue}"][data-niveles]`);
            
            if (!inputNiveles) {
                console.log(`❌ Input hidden faltante para ${gesValue}`);
                
                // Buscar en localStorage
                try {
                    const savedData = localStorage.getItem('matrizRiesgosData');
                    if (savedData) {
                        const parsed = JSON.parse(savedData);
                        const cargoGuardado = parsed.cargos[index];
                        if (cargoGuardado) {
                            const gesGuardado = cargoGuardado.gesSeleccionados.find(ges => 
                                `${ges.riesgo} - ${ges.ges}` === gesValue
                            );
                            
                            if (gesGuardado && gesGuardado.niveles && Object.keys(gesGuardado.niveles).length > 0) {
                                console.log(`🔧 Recreando con niveles:`, gesGuardado.niveles);
                                
                                const infoGeneralSection = cargo.querySelector('.info-general-section');
                                if (infoGeneralSection) {
                                    inputNiveles = document.createElement('input');
                                    inputNiveles.type = 'hidden';
                                    inputNiveles.dataset.riesgo = gesValue;
                                    inputNiveles.dataset.niveles = true;
                                    inputNiveles.setAttribute('name', `niveles_${gesValue.replace(/[^a-zA-Z0-9]/g, '_')}`);
                                    inputNiveles.value = JSON.stringify(gesGuardado.niveles);
                                    infoGeneralSection.appendChild(inputNiveles);
                                    
                                    console.log(`✅ Input hidden creado para ${gesValue}`);
                                } else {
                                    console.error(`❌ No se encontró info-general-section`);
                                }
                            } else {
                                console.log(`ℹ️ No hay niveles guardados para ${gesValue}`);
                            }
                        }
                    }
                } catch (e) {
                    console.error(`❌ Error:`, e);
                }
            } else {
                console.log(`✅ Input hidden ya existe para ${gesValue}`);
            }
        });
        
        // Actualizar resumen
        updateGesResumen(cargo);
    });
    
    console.log('\n🔧 === FIN RECREACIÓN FORZADA ===');
};

// === FUNCIÓN PARA FORZAR ACTUALIZACIÓN DE ICONOS ===
window.forzarActualizacionIconos = function() {
    console.log('\n🔄 === FORZANDO ACTUALIZACIÓN DE ICONOS ===');
    
    const cargoContainer = document.getElementById('cargoContainer');
    if (!cargoContainer) {
        console.log('❌ No se encontró cargoContainer');
        return;
    }

    const cargos = cargoContainer.querySelectorAll('.cargo');
    console.log(`🏠 Actualizando iconos para ${cargos.length} cargos...`);
    
    cargos.forEach((cargo, index) => {
        const cargoName = cargo.querySelector('input[name="cargoName"]')?.value || 'Sin nombre';
        console.log(`\n--- CARGO ${index + 1}: ${cargoName} ---`);
        
        // Forzar actualización del resumen
        updateGesResumen(cargo);
        
        // Verificar resultado
        const gesResumenItems = cargo.querySelectorAll('.ges-resumen-item');
        console.log(`Ítems de resumen procesados: ${gesResumenItems.length}`);
        
        gesResumenItems.forEach(item => {
            const isComplete = item.classList.contains('complete-ges');
            const gesText = item.textContent.trim();
            const icon = item.querySelector('.check-mark')?.textContent || '?';
            console.log(`   ${icon} ${gesText} - ${isComplete ? 'COMPLETO' : 'INCOMPLETO'}`);
        });
    });
    
    console.log('\n🔄 === ACTUALIZACIÓN DE ICONOS COMPLETADA ===');
};