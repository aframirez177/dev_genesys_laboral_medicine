# 🚀 PLAN DE CONTINUACIÓN - Rediseño UI/UX Exámenes Médicos Ocupacionales

**Fecha de Creación:** 3 de Noviembre de 2025  
**Estado del Proyecto:** 70% Completado  
**Fases Pendientes:** 3 de 10  
**Archivos Modificados:** 3 | **Archivos Creados:** 1 | **Pendientes:** 2

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ **FASES COMPLETADAS (1-7)**

#### **Fase 1-4: HTML Completado ✅**
- ✅ Errores críticos corregidos (IDs, ortografía)
- ✅ Sección de beneficios rediseñada (4 tarjetas con SVG)
- ✅ Sección de exámenes rediseñada (sin emojis, con iconos SVG profesionales)
- ✅ Instrucciones optimizadas (acordeón colapsable)
- ✅ Todos los `onclick` inline eliminados (reemplazados por `data-attributes`)

**Archivo:** `client/public/pages/Examenes_medicos_ocupacionales.html`

#### **Fase 5: _program-description-service.scss Completado ✅**
- ✅ Grid responsivo de 4 beneficios
- ✅ Tarjetas con hover effects
- ✅ Animaciones fadeInUp
- ✅ Sistema de colores usando variables centralizadas
- ✅ Responsive design (mobile-first)

**Archivo:** `client/src/styles/scss/sections/_program-description-service.scss` (222 líneas)

#### **Fase 6: _exams.scss Completado ✅**
- ✅ Tarjetas sin emojis
- ✅ Sistema de colores por categoría (aux-colors)
- ✅ Iconos SVG con wrappers
- ✅ Grid responsivo 4 columnas → 2 → 1
- ✅ Hover effects con elevación
- ✅ Animaciones de entrada escalonadas

**Archivo:** `client/src/styles/scss/sections/_exams.scss` (actualizado, ~360 líneas)

#### **Fase 7: _calculator-instructions.scss Creado ✅**
- ✅ Acordeón colapsable moderno
- ✅ Pasos numerados con círculos
- ✅ Beneficios destacados
- ✅ Responsive design
- ✅ Transiciones suaves

**Archivo:** `client/src/styles/scss/sections/_calculator-instructions.scss` (157 líneas)

---

## 🎯 FASES PENDIENTES (8-10)

### **FASE 8: Expandir _calculadora.scss con Mejoras UI/UX Avanzadas** 🔄

**Objetivo:** Añadir mejoras profesionales de UI/UX nivel experto a la calculadora existente.

**Archivo a Modificar:**
```
client/src/styles/scss/components/_calculadora.scss
```

**Estado Actual:**
- El archivo tiene 700 líneas
- Ya existe estructura básica de calculadora funcional
- Necesita añadir mejoras UI/UX al FINAL del archivo (después de línea 700)

---

#### **8.1 Progress Indicator Visual**

**Ubicación:** Añadir después de la línea 700

```scss
// ===================================================================
// MEJORAS UI/UX AVANZADAS - Calculadora Nivel Experto
// Añadidas: [FECHA]
// ===================================================================

// Progress Indicator Visual
.calculator-progress {
    position: sticky;
    top: 0;
    background: #ffffff;
    padding: 1.5rem 2rem;
    border-bottom: 2px solid map-get($colors, "border-color");
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
    }
    
    .progress-steps {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        
        .step {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: map-get($fonts, "body");
            font-size: 1.3rem;
            color: map-get($colors, "text");
            opacity: 0.5;
            transition: opacity 0.3s ease;
            
            &.active {
                opacity: 1;
                font-weight: 600;
                color: map-get($colors, "primary");
            }
            
            &.completed {
                opacity: 1;
                
                .step-icon {
                    background: map-get($colors, "success");
                    border-color: map-get($colors, "success");
                    
                    &::after {
                        content: "✓";
                        color: #ffffff;
                    }
                }
            }
            
            .step-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid currentColor;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.1rem;
                transition: all 0.3s ease;
            }
        }
    }
    
    .progress-bar {
        flex: 1;
        height: 4px;
        background: map-get($colors, "border-color");
        border-radius: 2px;
        margin: 0 1rem;
        position: relative;
        overflow: hidden;
        
        @media (max-width: 768px) {
            width: 100%;
            margin: 0;
        }
        
        .progress-fill {
            height: 100%;
            background: map-get($colors, "primary");
            border-radius: 2px;
            transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            
            &::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 20px;
                height: 100%;
                background: rgba(255, 255, 255, 0.3);
                animation: shimmer 2s infinite;
            }
        }
    }
}

@keyframes shimmer {
    0% { transform: translateX(-20px); }
    100% { transform: translateX(100px); }
}
```

---

#### **8.2 Badges de Estado en Tiempo Real**

```scss
// Badges informativos en summary
.calculator-summary {
    .summary-stats {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        
        .stat-badge {
            background: map-get($colors, "background");
            padding: 0.8rem 1.5rem;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            font-family: map-get($fonts, "body");
            font-size: 1.3rem;
            transition: all 0.3s ease;
            border: 1px solid map-get($colors, "border-color");
            
            &:hover {
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .stat-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.1rem;
                font-weight: 700;
            }
            
            &.cargos-count .stat-icon {
                background: map-get($aux-colors, 1);
                color: map-get($colors, "secondary");
            }
            
            &.exams-count .stat-icon {
                background: map-get($aux-colors, 5);
                color: map-get($colors, "secondary");
            }
            
            &.workers-count .stat-icon {
                background: map-get($aux-colors, 3);
                color: map-get($colors, "secondary");
            }
            
            .stat-label {
                color: map-get($colors, "text");
                margin-right: 0.3rem;
            }
            
            .stat-value {
                font-weight: 700;
                color: map-get($colors, "primary");
                font-size: 1.5rem;
            }
        }
    }
}
```

---

#### **8.3 Validación Visual Mejorada**

```scss
// Estados de validación en inputs
.cargo-name,
input[type="number"] {
    position: relative;
    transition: all 0.3s ease;
    
    &.valid {
        border-color: map-get($colors, "success");
        background-color: rgba(map-get($colors, "success"), 0.05);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234caf50' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.8rem center;
        background-size: 16px;
        padding-right: 3rem;
    }
    
    &.invalid {
        border-color: map-get($colors, "danger");
        background-color: rgba(map-get($colors, "danger"), 0.05);
        animation: shake 0.4s ease;
    }
    
    &.validating {
        border-color: map-get($colors, "atention");
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ff9800' stroke-width='3'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.8rem center;
        background-size: 16px;
    }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
```

---

#### **8.4 Tooltips Mejorados con Preview de Precio**

```scss
// Tooltips avanzados para checkboxes de exámenes
.checkbox-item {
    position: relative;
    
    &:hover .exam-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .exam-tooltip {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%) translateY(-5px);
        background: map-get($colors, "secondary");
        color: #ffffff;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-size: 1.2rem;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        pointer-events: none;
        
        &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 6px solid transparent;
            border-top-color: map-get($colors, "secondary");
        }
        
        .exam-name {
            font-weight: 600;
            margin-bottom: 0.4rem;
            display: block;
            font-family: map-get($fonts, "title");
        }
        
        .exam-price {
            color: map-get($colors, "primary");
            font-weight: 700;
            font-size: 1.4rem;
            display: block;
            margin-top: 0.3rem;
        }
    }
}
```

---

#### **8.5 Animación de Números (Count Up)**

```scss
// Animación cuando cambia el precio total
.total-price,
.valor-monto {
    position: relative;
    display: inline-block;
    
    &.updating {
        animation: priceUpdate 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
}

@keyframes priceUpdate {
    0% { 
        transform: scale(1);
        color: map-get($colors, "primary");
    }
    50% { 
        transform: scale(1.15);
        color: lighten(map-get($colors, "primary"), 15%);
    }
    100% { 
        transform: scale(1);
        color: map-get($colors, "primary");
    }
}

// Pulso al añadir nuevo cargo
.cargo {
    &.new-cargo {
        animation: slideInUp 0.6s ease-out, pulse 0.8s ease 0.6s;
    }
}

@keyframes pulse {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(map-get($colors, "primary"), 0.4);
    }
    50% {
        box-shadow: 0 0 0 10px rgba(map-get($colors, "primary"), 0);
    }
}
```

---

#### **8.6 Empty States Mejorados**

```scss
// Estado cuando no hay cargos agregados
.calculator-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    min-height: 400px;
    background: rgba(map-get($colors, "background"), 0.5);
    border-radius: 12px;
    border: 2px dashed map-get($colors, "border-color");
    
    .empty-icon {
        width: 120px;
        height: 120px;
        margin-bottom: 2rem;
        opacity: 0.3;
        animation: float 3s ease-in-out infinite;
        
        svg {
            width: 100%;
            height: 100%;
            color: map-get($colors, "primary");
        }
    }
    
    h3 {
        font-family: map-get($fonts, "title");
        font-size: 2.2rem;
        color: map-get($colors, "secondary");
        margin-bottom: 1rem;
    }
    
    p {
        font-family: map-get($fonts, "body");
        font-size: 1.4rem;
        color: map-get($colors, "text");
        max-width: 400px;
        margin-bottom: 2rem;
        line-height: 1.6;
    }
    
    .empty-cta {
        padding: 1.2rem 2.5rem;
        background: map-get($colors, "primary");
        color: map-get($colors, "secondary");
        border: none;
        border-radius: 8px;
        font-size: 1.6rem;
        font-weight: 600;
        font-family: map-get($fonts, "title");
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(map-get($colors, "primary"), 0.3);
        }
    }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
```

---

#### **8.7 Collapse/Expand con Iconos Mejorados**

```scss
// Mejor toggle visual para cargo-body
.cargo-header {
    .toggle-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(map-get($colors, "primary"), 0.1);
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        
        svg {
            width: 18px;
            height: 18px;
            color: map-get($colors, "primary");
            transition: transform 0.3s ease;
        }
        
        &:hover {
            background: map-get($colors, "primary");
            transform: scale(1.1);
            
            svg {
                color: #ffffff;
            }
        }
        
        &:active {
            transform: scale(0.95);
        }
    }
    
    &.collapsed .toggle-icon svg {
        transform: rotate(180deg);
    }
}
```

---

#### **8.8 Resumen Sticky Mejorado**

```scss
// Mejor efecto de sticky en desktop
@include respond-to("tablet") {
    .calculator-summary {
        position: sticky;
        top: 2rem;
        transition: all 0.3s ease;
        
        &.is-sticky {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            
            &::before {
                content: '';
                position: absolute;
                top: -2rem;
                left: 0;
                right: 0;
                height: 2rem;
                background: linear-gradient(to bottom, 
                    rgba(238, 247, 253, 0) 0%, 
                    rgba(238, 247, 253, 1) 100%);
                pointer-events: none;
            }
        }
    }
}
```

---

#### **8.9 Botón de Descarga con Loading State**

```scss
// Estado de carga en botón de descarga
.btn-download {
    position: relative;
    overflow: hidden;
    
    &.loading {
        pointer-events: none;
        opacity: 0.7;
        
        .btn-text {
            opacity: 0;
        }
        
        .btn-spinner {
            opacity: 1;
        }
    }
    
    .btn-text {
        transition: opacity 0.3s ease;
    }
    
    .btn-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.3s ease;
        
        &::after {
            content: '';
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top-color: #ffffff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

---

#### **8.10 Feedback Visual al Seleccionar Exámenes**

```scss
// Pulso al seleccionar checkbox
input[type="checkbox"] {
    &:checked {
        animation: checkPulse 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
}

@keyframes checkPulse {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(map-get($colors, "primary"), 0.7);
    }
    50% {
        transform: scale(1.1);
        box-shadow: 0 0 0 8px rgba(map-get($colors, "primary"), 0);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(map-get($colors, "primary"), 0);
    }
}

// Highlight al deseleccionar
.checkbox-item {
    transition: all 0.3s ease;
    
    &.recently-unchecked {
        animation: flashWarning 0.5s ease;
    }
}

@keyframes flashWarning {
    0%, 100% { background: transparent; }
    50% { background: rgba(map-get($colors, "atention"), 0.1); }
}
```

---

### **FASE 9: Crear examenes_medicos_handler.js** 📝

**Objetivo:** Crear archivo JavaScript con event listeners para toda la funcionalidad de la página.

**Archivo a Crear:**
```
client/src/js/pages/examenes_medicos_handler.js
```

---

#### **9.1 Estructura del Archivo**

```javascript
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
   * Tooltips para exámenes
   */
  function initExamTooltips() {
    // Los tooltips ya están manejados por CSS :hover
    // Esta función puede extenderse en el futuro para tooltips dinámicos
    console.log('✓ Tooltips configurados (CSS)');
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
    
    console.log('✅ Todos los handlers inicializados correctamente');
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
```

---

### **FASE 10: Actualizar style_examenes_medicos_ocupacionales.scss** 📦

**Objetivo:** Añadir el import del nuevo archivo de instrucciones.

**Archivo a Modificar:**
```
client/src/styles/scss/style_examenes_medicos_ocupacionales.scss
```

**Estado Actual (29 líneas):**
```scss
// Base
@import 'base/variables';
@import 'base/mixins';
@import 'base/reset';
@import 'base/typography';

// Components
@import 'components/calculadora';
@import 'components/buttons';
@import 'components/dropdown';
@import 'components/whatsapp';

// Layout
@import 'layout/header';
@import 'layout/footer';

// Sections
@import 'sections/program-description-service';
@import 'sections/clients';
@import 'sections/faqs';
@import 'sections/location';
@import 'sections/exams';

// Utilities
@import 'utilities/helpers';
@import 'utilities/animations';
```

**Cambio Requerido:**

Añadir DESPUÉS de la línea 23 (después de `@import 'sections/exams';`):

```scss
@import 'sections/calculator-instructions';
```

**Resultado Final:**
```scss
// Base
@import 'base/variables';
@import 'base/mixins';
@import 'base/reset';
@import 'base/typography';

// Components
@import 'components/calculadora';
@import 'components/buttons';
@import 'components/dropdown';
@import 'components/whatsapp';

// Layout
@import 'layout/header';
@import 'layout/footer';

// Sections
@import 'sections/program-description-service';
@import 'sections/clients';
@import 'sections/faqs';
@import 'sections/location';
@import 'sections/exams';
@import 'sections/calculator-instructions'; // ← NUEVA LÍNEA

// Utilities
@import 'utilities/helpers';
@import 'utilities/animations';
```

---

## 📚 ARCHIVOS DE REFERENCIA PARA LA IA

### **Archivos que DEBE Leer:**

1. **`ANALISIS_SCSS.md`** (960 líneas)
   - Arquitectura completa del sistema SCSS
   - Patrón 7-1 modificado
   - Variables y sistema de diseño
   - Mejores prácticas

2. **`DESIGN_VISION.md`** (607 líneas)
   - Filosofía de diseño del proyecto
   - Paleta de colores oficial
   - Tipografía (Poppins/Raleway)
   - Principios UX aplicados

3. **`README.md`** (529 líneas)
   - Estructura del proyecto
   - Stack tecnológico
   - Comandos de desarrollo

4. **`client/src/styles/scss/base/_variables.scss`**
   - Colores: `$colors`, `$aux-colors`
   - Fuentes: `$fonts`
   - Breakpoints: `$breakpoints`

5. **`client/src/styles/scss/base/_mixins.scss`**
   - Mixin `respond-to()` para responsive
   - Utilidades de flexbox
   - Custom scrollbar

6. **`client/src/styles/scss/components/_calculadora.scss`** (700 líneas actuales)
   - Estructura base de la calculadora
   - Dónde añadir las mejoras (después línea 700)

### **Archivos Modificados (para verificar cambios):**

7. **`client/public/pages/Examenes_medicos_ocupacionales.html`**
   - HTML rediseñado completo
   - Data-attributes para JS
   - Nuevas secciones

8. **`client/src/styles/scss/sections/_program-description-service.scss`**
   - Grid de beneficios
   - Referencia de implementación

9. **`client/src/styles/scss/sections/_exams.scss`**
   - Tarjetas sin emojis
   - Sistema de colores por categoría

---

## 🎯 INSTRUCCIONES PRECISAS PARA LA IA CONTINUADORA

### **Orden de Ejecución:**

1. **LEER PRIMERO:**
   - Este documento completo
   - `ANALISIS_SCSS.md` (secciones 3-8)
   - `DESIGN_VISION.md` (secciones de Sistema de Diseño)
   - `client/src/styles/scss/base/_variables.scss`

2. **FASE 8 - Expandir _calculadora.scss:**
   ```bash
   # Abrir archivo
   client/src/styles/scss/components/_calculadora.scss
   
   # Ir al FINAL (después línea 700)
   # Añadir TODAS las secciones 8.1 - 8.10 EN ORDEN
   # USAR search_replace para añadir después de la última línea
   ```

3. **FASE 9 - Crear examenes_medicos_handler.js:**
   ```bash
   # Crear archivo nuevo
   client/src/js/pages/examenes_medicos_handler.js
   
   # Copiar TODO el código de la sección 9.1
   # Usar tool 'write'
   ```

4. **FASE 10 - Actualizar punto de entrada:**
   ```bash
   # Modificar archivo
   client/src/styles/scss/style_examenes_medicos_ocupacionales.scss
   
   # Añadir línea 24: @import 'sections/calculator-instructions';
   # Usar search_replace
   ```

5. **VERIFICAR:**
   ```bash
   # Leer lints de todos los archivos modificados
   read_lints(['client/src/styles/scss/components/_calculadora.scss'])
   read_lints(['client/src/js/pages/examenes_medicos_handler.js'])
   ```

6. **ACTUALIZAR TODOS:**
   ```bash
   # Marcar TODOs como completados
   todo_write con status: "completed" para IDs 7, 9, 10
   ```

---

## ⚠️ REGLAS CRÍTICAS

### **NUNCA:**
- ❌ Crear archivos CSS nuevos (solo SCSS)
- ❌ Usar gradientes (DESIGN_VISION.md lo prohíbe)
- ❌ Hardcodear colores (usar `map-get($colors, ...)`)
- ❌ Usar `@import` de npm packages (solo archivos locales)
- ❌ Modificar `base/_variables.scss` (es inmutable)

### **SIEMPRE:**
- ✅ Usar variables de `$colors` y `$aux-colors`
- ✅ Usar mixin `respond-to()` para breakpoints
- ✅ Tipografía: `map-get($fonts, "title")` y `map-get($fonts, "body")`
- ✅ Border radius: 8px (pequeño), 12px (normal), 16px (grande)
- ✅ Transiciones: `0.3s ease` o `cubic-bezier(0.4, 0, 0.2, 1)`
- ✅ Comentar secciones grandes con `// ===...===`

---

## 🔧 HERRAMIENTAS DISPONIBLES

```javascript
// Para modificar archivos existentes
search_replace(file_path, old_string, new_string)

// Para crear archivos nuevos
write(file_path, contents)

// Para leer archivos
read_file(target_file, offset, limit)

// Para verificar errores
read_lints(paths)

// Para actualizar progreso
todo_write(merge, todos)
```

---

## 📊 MÉTRICAS DE ÉXITO

Al completar las 3 fases:

- ✅ 10/10 TODOs completados
- ✅ 0 errores de linting
- ✅ 100% responsive (mobile, tablet, desktop)
- ✅ Todas las animaciones funcionando
- ✅ Event listeners conectados
- ✅ Sistema de colores consistente
- ✅ Sigue DESIGN_VISION.md al 100%

---

## 🎨 PALETA RÁPIDA (Referencia)

```scss
// Colores principales
map-get($colors, "primary")       // #5dc4af (verde agua)
map-get($colors, "secondary")     // #383d47 (gris oscuro)
map-get($colors, "text")          // #2d3238 (texto)
map-get($colors, "background")    // #f3f0f0 (fondo)
map-get($colors, "success")       // #4caf50 (éxito)
map-get($colors, "danger")        // #f44336 (error)
map-get($colors, "atention")      // #ff9800 (atención)

// Colores auxiliares (tarjetas)
map-get($aux-colors, 1)           // #cbe3f3 (azul pastel)
map-get($aux-colors, 2)           // #fee6fc (rosa pastel)
map-get($aux-colors, 3)           // #fdf8cd (amarillo pastel)
map-get($aux-colors, 5)           // #d8fff1 (verde menta)
```

---

## 💡 CONSEJOS FINALES

1. **Si hay dudas sobre estilos:** Consultar archivos ya modificados como referencia
2. **Si hay conflictos:** Priorizar `DESIGN_VISION.md` > `ANALISIS_SCSS.md`
3. **Si algo no compila:** Verificar que el orden de imports sea correcto
4. **Si los colores se ven mal:** Usar `map-get()` en lugar de hexadecimales

---

## 📞 CHECKPOINTS

Después de cada fase, verificar:

- [ ] Archivo creado/modificado correctamente
- [ ] Sin errores de sintaxis SCSS
- [ ] Variables usadas correctamente
- [ ] Responsive design implementado
- [ ] Animaciones suaves (0.3s)
- [ ] TODO actualizado

---

**Última Actualización:** 3 de Noviembre de 2025  
**Versión:** 1.0  
**Estado:** LISTO PARA CONTINUACIÓN

¡Buena suerte! 🚀

