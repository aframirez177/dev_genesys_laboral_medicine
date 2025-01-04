import { initCalculator } from './js/components/calculadora.js';

import './styles/scss/style_examenes_medicos_ocupacionales.scss';



function initApp() {
    initCalculator();
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

