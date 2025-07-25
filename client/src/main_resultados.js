import { initResultadosPage } from './js/components/resultadosComponent.js';
import './styles/scss/style_resultados.scss';

function initApp() {
    initResultadosPage();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
} 