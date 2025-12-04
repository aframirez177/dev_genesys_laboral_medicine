import { initMenu} from './js/components/menuComponent.js';
import { initCardVisibility } from './js/components/cardVisibility.js';
import { initMap } from './js/components/lazyMap.js';
import { initFAQ } from './js/components/faq.js';
import { initClients } from './js/components/clients.js';
import { initFooter } from './js/components/footerInit.js';
import { addHoverEffect, smoothScroll } from './js/utils/animations.js';
import { initWhatsApp } from './js/components/whatsapp.js';
import './styles/scss/main.scss';  // Ajusta la ruta a donde esté tu archivo principal SCSS

// Suppress ResizeObserver error (known false positive with Floating UI)
// This error occurs when ResizeObserver callbacks take longer than a single animation frame
// It's harmless and can be safely ignored in development
if (typeof window !== 'undefined') {
  // Method 1: Intercept window.error events
  const resizeObserverErrHandler = (event) => {
    if (
      event.message &&
      (event.message.includes('ResizeObserver loop') ||
       event.message === 'ResizeObserver loop completed with undelivered notifications.' ||
       event.message === 'ResizeObserver loop limit exceeded')
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return false;
    }
  };

  window.addEventListener('error', resizeObserverErrHandler, { capture: true });

  // Method 2: Override console.error to filter ResizeObserver errors
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const errorMsg = args[0]?.toString() || '';
    if (errorMsg.includes('ResizeObserver loop')) {
      // Silently ignore ResizeObserver errors
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Method 3: Patch ResizeObserver to debounce notifications
  if (window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback) {
        let timeoutId = null;
        super((entries, observer) => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            try {
              callback(entries, observer);
            } catch (e) {
              if (!e.message?.includes('ResizeObserver loop')) {
                throw e;
              }
            }
          }, 0);
        });
      }
    };
  }
}

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