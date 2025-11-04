/**
 * Event Handlers para Página de Exámenes Médicos Ocupacionales
 * 
 * Funcionalidades:
 * - Scroll suave a secciones
 * - WhatsApp contact handlers
 * - Acordeón de instrucciones
 * - Animaciones de entrada (Intersection Observer)
 * - Sticky summary detector
 * - Validación de inputs
 * - Count-up animations para precios
 * 
 * @author Sistema Genesys
 * @version 2.0
 */

(function() {
  'use strict';

  // =================================================================
  // CONFIGURACIÓN Y CONSTANTES
  // =================================================================
  
  const CONFIG = {
    scrollOffset: 80,
    animationDuration: 600,
    intersectionThreshold: 0.1
  };

  // =================================================================
  // UTILIDADES
  // =================================================================
  
  /**
   * Scroll suave a elemento
   */
  function smoothScrollTo(targetId) {
    const element = document.getElementById(targetId);
    if (!element) return;
    
    const yOffset = -CONFIG.scrollOffset;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    
    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
  }

  /**
   * Detecta si elemento está en viewport
   */
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Formatea número con separador de miles
   */
  function formatMoney(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  /**
   * Animación count-up para números
   */
  function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = formatMoney(Math.round(current));
    }, 16);
  }

  // =================================================================
  // EVENT HANDLERS
  // =================================================================

  /**
   * Handler para botones de scroll
   */
  function initScrollHandlers() {
    const scrollButtons = document.querySelectorAll('[data-scroll-to]');
    
    scrollButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-scroll-to');
        smoothScrollTo(targetId);
        
        // Añadir feedback visual
        this.classList.add('clicked');
        setTimeout(() => this.classList.remove('clicked'), 300);
      });
    });
    
    console.log(`✓ Inicializados ${scrollButtons.length} botones de scroll`);
  }

  /**
   * Handler para botones de WhatsApp
   */
  function initWhatsAppHandlers() {
    const whatsappButtons = document.querySelectorAll('[data-whatsapp-contact]');
    
    whatsappButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.getAttribute('data-whatsapp-url');
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    });
    
    console.log(`✓ Inicializados ${whatsappButtons.length} botones de WhatsApp`);
  }

  /**
   * Acordeón de instrucciones
   */
  function initInstructionsAccordion() {
    const toggleBtn = document.querySelector('[data-toggle-instructions]');
    const content = document.querySelector('[data-instructions-content]');
    
    if (!toggleBtn || !content) return;
    
    toggleBtn.addEventListener('click', function() {
      const isExpanded = content.classList.contains('visible');
      
      if (isExpanded) {
        content.classList.remove('visible');
        this.classList.remove('active');
        this.setAttribute('aria-expanded', 'false');
      } else {
        content.classList.add('visible');
        this.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
      }
    });
    
    console.log('✓ Acordeón de instrucciones inicializado');
  }

  /**
   * Intersection Observer para animaciones
   */
  function initIntersectionObserver() {
    const observerOptions = {
      threshold: CONFIG.intersectionThreshold,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observar elementos
    const elementsToAnimate = document.querySelectorAll(
      '.benefit-card, .exam-card-modern'
    );
    
    elementsToAnimate.forEach(el => observer.observe(el));
    
    console.log(`✓ Observer iniciado para ${elementsToAnimate.length} elementos`);
  }

  /**
   * Detectar sticky summary
   */
  function initStickySummaryDetector() {
    const summary = document.querySelector('.calculator-summary');
    if (!summary) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.boundingClientRect.top <= 20) {
          summary.classList.add('is-sticky');
        } else {
          summary.classList.remove('is-sticky');
        }
      },
      { threshold: [1] }
    );
    
    observer.observe(summary);
    console.log('✓ Sticky summary detector inicializado');
  }

  /**
   * Validación en tiempo real de inputs
   */
  function initInputValidation() {
    // Validar nombre de cargo
    document.addEventListener('input', function(e) {
      if (e.target.classList.contains('cargo-name')) {
        const value = e.target.value.trim();
        
        if (value.length >= 3) {
          e.target.classList.remove('invalid');
          e.target.classList.add('valid');
        } else if (value.length > 0) {
          e.target.classList.remove('valid');
          e.target.classList.add('invalid');
        } else {
          e.target.classList.remove('valid', 'invalid');
        }
      }
      
      // Validar número de trabajadores
      if (e.target.type === 'number' && e.target.closest('.numero-trabajadores')) {
        const value = parseInt(e.target.value);
        
        if (value > 0) {
          e.target.classList.remove('invalid');
          e.target.classList.add('valid');
        } else if (e.target.value !== '') {
          e.target.classList.remove('valid');
          e.target.classList.add('invalid');
        } else {
          e.target.classList.remove('valid', 'invalid');
        }
      }
    });
    
    console.log('✓ Validación de inputs inicializada');
  }

  /**
   * Animación de precios (count-up)
   */
  function initPriceAnimations() {
    // Observar cambios en elementos de precio
    const priceElements = document.querySelectorAll('.total-price, .valor-monto');
    
    priceElements.forEach(element => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            element.classList.add('updating');
            setTimeout(() => element.classList.remove('updating'), 600);
          }
        });
      });
      
      observer.observe(element, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });
    
    console.log('✓ Animaciones de precio inicializadas');
  }

  /**
   * Tooltips para exámenes con posicionamiento dinámico
   */
  function initExamTooltips() {
    // Delegación de eventos para hover en checkboxes
    document.addEventListener('mouseover', function(e) {
      // Verificar que e.target sea un elemento
      if (!e.target || !e.target.closest) return;
      
      const checkboxItem = e.target.closest('.checkbox-item');
      if (!checkboxItem) return;
      
      const tooltip = checkboxItem.querySelector('.exam-tooltip');
      if (!tooltip) return;
      
      // Esperar un tick para que el tooltip tenga dimensiones
      requestAnimationFrame(() => {
        // Obtener posición del checkbox
        const rect = checkboxItem.getBoundingClientRect();
        
        // Calcular posición del tooltip centrado arriba del checkbox
        const tooltipTop = rect.top + window.scrollY - tooltip.offsetHeight - 12;
        const tooltipLeft = rect.left + window.scrollX + (rect.width / 2);
        
        // Aplicar posición
        tooltip.style.top = tooltipTop + 'px';
        tooltip.style.left = tooltipLeft + 'px';
      });
    });
    
    // Añadir soporte touch para móviles
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', function(e) {
        if (!e.target || !e.target.closest) return;
        
        const checkboxItem = e.target.closest('.checkbox-item');
        
        if (checkboxItem) {
          const tooltip = checkboxItem.querySelector('.exam-tooltip');
          if (tooltip) {
            // Calcular posición
            requestAnimationFrame(() => {
              const rect = checkboxItem.getBoundingClientRect();
              const tooltipTop = rect.top + window.scrollY - tooltip.offsetHeight - 12;
              const tooltipLeft = rect.left + window.scrollX + (rect.width / 2);
              
              tooltip.style.top = tooltipTop + 'px';
              tooltip.style.left = tooltipLeft + 'px';
            });
          }
          
          // Cerrar otros tooltips abiertos
          document.querySelectorAll('.checkbox-item.tooltip-open').forEach(item => {
            if (item !== checkboxItem) {
              item.classList.remove('tooltip-open');
            }
          });
          
          // Toggle tooltip actual
          checkboxItem.classList.toggle('tooltip-open');
          
          // Auto-cerrar después de 3 segundos
          setTimeout(() => {
            checkboxItem.classList.remove('tooltip-open');
          }, 3000);
        } else {
          // Cerrar todos si tap fuera
          document.querySelectorAll('.checkbox-item.tooltip-open').forEach(item => {
            item.classList.remove('tooltip-open');
          });
        }
      });
    }
    
    console.log('✓ Tooltips configurados (fixed position + Touch)');
  }
  
  /**
   * Manejo de estados checked en checkboxes
   */
  function initCheckboxStates() {
    document.addEventListener('change', function(e) {
      if (e.target.classList.contains('exam-checkbox')) {
        const checkboxItem = e.target.closest('.checkbox-item');
        
        if (checkboxItem) {
          if (e.target.checked) {
            checkboxItem.classList.add('checked');
          } else {
            checkboxItem.classList.remove('checked');
            checkboxItem.classList.add('recently-unchecked');
            setTimeout(() => {
              checkboxItem.classList.remove('recently-unchecked');
            }, 500);
          }
        }
      }
    });
    
    console.log('✓ Estados de checkbox inicializados');
  }
  
  /**
   * Placeholder dinámico con ejemplos
   */
  function initDynamicPlaceholder() {
    const cargoInputs = document.querySelectorAll('.cargo-name');
    const examples = [
      'Auxiliar Administrativo',
      'Operario de Producción',
      'Supervisor de Logística',
      'Gerente Comercial',
      'Técnico de Mantenimiento'
    ];
    
    cargoInputs.forEach((input, index) => {
      if (!input.value) {
        input.placeholder = examples[index % examples.length];
      }
    });
    
    console.log('✓ Placeholders dinámicos configurados');
  }
  
  /**
   * Intersection Observer para visibilidad del Floating Bubble
   * Solo visible cuando .calculator-body está en viewport
   */
  function initFloatingBubbleVisibility() {
    // Esperar a que los elementos estén en el DOM
    const checkElements = () => {
      const calculatorBody = document.querySelector('.calculator-body');
      const floatingBubble = document.querySelector('.floating-bubble');
      
      if (!calculatorBody || !floatingBubble) {
        console.log('⏳ Esperando elementos de calculadora...');
        // Reintentar después de 100ms
        setTimeout(checkElements, 100);
        return;
      }
      
      // Elementos encontrados, iniciar observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Mostrar bocadillo cuando calculator-body está en viewport
            floatingBubble.classList.add('visible');
          } else {
            // Ocultar bocadillo cuando calculator-body sale del viewport
            floatingBubble.classList.remove('visible');
          }
        });
      }, {
        threshold: 0.1, // Activar cuando 10% sea visible
        rootMargin: '0px' // Sin margen
      });
      
      observer.observe(calculatorBody);
      console.log('✓ Floating bubble visibility observer inicializado');
    };
    
    // Iniciar chequeo
    checkElements();
  }

  // =================================================================
  // INICIALIZACIÓN
  // =================================================================

  function initialize() {
    console.log('🚀 Inicializando handlers de Exámenes Médicos...');
    
    // Inicializar todos los handlers
    initScrollHandlers();
    initWhatsAppHandlers();
    initInstructionsAccordion();
    initIntersectionObserver();
    initStickySummaryDetector();
    initInputValidation();
    initPriceAnimations();
    initExamTooltips();
    initCheckboxStates();
    initDynamicPlaceholder();
    initFloatingBubbleVisibility(); // Nuevo: Controla visibilidad del floating bubble
    
    console.log('✅ Todos los handlers inicializados correctamente');
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();

