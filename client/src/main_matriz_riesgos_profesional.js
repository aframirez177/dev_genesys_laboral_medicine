/* import { initializeForm } from './js/components/form_matriz_riesgos_prof.js'; */

import './styles/scss/style_matriz_de_riesgos_profesional.scss';



function initApp() {

    initializeForm();

}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}





