import { initializeForm } from './js/components/form_bateria_riesgo_psicosocial.js';
import './styles/scss/style_bateria_de_riesgo_psicosocial.scss';

function initApp() {
    initializeForm();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}