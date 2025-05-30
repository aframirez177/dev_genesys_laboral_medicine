import { initCalculator } from './js/components/calculator.js';
import { initExamsTabs } from './js/components/exams-carousel.js';

import './styles/scss/style_examenes_medicos_ocupacionales.scss';



function initApp() {
    initCalculator();
    initExamsTabs();
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
