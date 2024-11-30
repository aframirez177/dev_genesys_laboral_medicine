// src/js/matriz_de_riesgos_profesional.js

import { initDropdown } from './components/dropdown.js';
import { initCardVisibility } from './components/cardVisibility.js';
import { initMap } from './components/map.js';
import { initWhatsApp } from './components/whatsapp.js';
import { initFAQ } from './components/faq.js';
import { initHamburgerMenu } from './components/hamburgerMenu.js';
import { initClients } from './components/clients.js';
import { initializeForm } from './components/form_matriz_riesgos_prof.js';
import { addHoverEffect, smoothScroll } from './utils/animations.js';

import '../styles/scss/style_profesiograma.scss';



function initApp() {
    initDropdown();
    initCardVisibility();
    initMap();
    initWhatsApp();
    initFAQ();
    initHamburgerMenu();
    initClients();
    initializeForm();


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