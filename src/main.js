import { initMenu} from './js/components/menuComponent.js';
import { initCardVisibility } from './js/components/cardVisibility.js';
import { initMap } from './js/components/lazyMap.js';
import { initFAQ } from './js/components/faq.js';
import { initClients } from './js/components/clients.js';
import { initFooter } from './js/components/footerInit.js';
import { addHoverEffect, smoothScroll } from './js/utils/animations.js';
import { initWhatsApp } from './js/components/whatsapp.js';
import './styles/scss/main.scss';  // Ajusta la ruta a donde esté tu archivo principal SCSS


function initApp() {
    console.log('Iniciando main.js');
    initMenu();
    initCardVisibility();
    initMap();
    initFAQ();
    initClients();
    initFooter();
    initWhatsApp();
    

    // Añadir efecto hover a las imágenes de certificación
    const certImages = document.querySelectorAll('.certification-img');
    addHoverEffect(certImages);

    // Configurar scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) smoothScroll(target);
        });
    });
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}