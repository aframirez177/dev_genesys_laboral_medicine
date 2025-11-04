# Plan de Implementación: Floating Bubble Optimizado y Carousel de Cargos

## 📋 Resumen de Cambios Solicitados

### 1. Optimización del Floating Bubble
**Estado actual**: Bocadillo flotante con botón grande "Agregar Cargo" y 3 badges estadísticos

**Cambios requeridos**:
- Reducir tamaño del bocadillo (`max-width: 250px` en `.bubble-content`)
- Los 4 elementos (3 badges + 1 botón) deben tener el mismo tamaño
- La diferencia entre elementos será por color, no por tamaño
- Botón "Agregar Cargo" debe ser solo un icono compacto:
  - Color verde (el que ya tiene)
  - Icono: SVG de trabajador con símbolo "+"
  - Al hacer hover: se expande y muestra texto "Agregar Cargo"
- **Visibilidad condicional**: Solo visible cuando la sección `.calculator-body` esté visible/en viewport
  - Resto del tiempo: oculto/transparente

### 2. Sistema Carousel Horizontal para Cargos
**Estado actual**: Los cargos se apilan verticalmente uno debajo del otro

**Cambios requeridos**:
- Los cargos se crean horizontalmente (como slides)
- Contenedor: `div.section-calculator`
- Al crear un nuevo cargo:
  1. Aparecen flechitas de navegación (◀ ▶) a los lados
  2. El cargo actual se desplaza a la izquierda
  3. El nuevo cargo aparece desde la derecha
- Frame/contenedor con sombra suave interna (efecto "plano más bajo")
- Solo un cargo visible a la vez
- Navegación fluida entre cargos con animaciones slide

---

## 📁 Archivos a Modificar

### Archivos Principales

1. **`client/src/styles/scss/components/_floating-bubble.scss`**
   - Reducir dimensiones
   - Igualar tamaño de badges y botón
   - Implementar estado hover del botón
   - Añadir lógica de visibilidad (opacity/transform transitions)

2. **`client/src/styles/scss/components/_calculadora.scss`**
   - Modificar layout de `.cargo` para carousel horizontal
   - Añadir estilos para contenedor carousel
   - Implementar navegación (flechas)
   - Añadir animaciones slide (transform translateX)
   - Shadow interna para frame

3. **`client/src/js/components/calculator.js`**
   - Modificar `render()` para estructura carousel
   - Implementar lógica de navegación entre cargos
   - Añadir controles prev/next
   - Actualizar `addCargo()` para insertar en carousel
   - Gestionar índice de cargo activo
   - Actualizar SVG del botón floating (trabajador + más)

4. **`client/src/js/pages/examenes_medicos_handler.js`**
   - Implementar Intersection Observer para `.calculator-body`
   - Mostrar/ocultar floating bubble según visibilidad
   - Añadir event listeners para navegación carousel

### Archivos de Referencia (solo lectura)

5. **`client/src/styles/scss/base/_variables.scss`**
   - Variables de color, espaciado, transiciones
   
6. **`DESIGN_VISION.md`**
   - Guía de diseño, paleta de colores, principios UX

7. **`ANALISIS_SCSS.md`**
   - Arquitectura SCSS, mixins disponibles

---

## 🎯 Fases de Implementación

### FASE 1: Optimización del Floating Bubble

#### 1.1 Reducir y Unificar Tamaños
**Archivo**: `client/src/styles/scss/components/_floating-bubble.scss`

```scss
.floating-bubble {
  // Mantener positioning actual pero ajustar tamaño
  .bubble-content {
    max-width: 250px; // Reducir de 300px
    padding: 12px; // Reducir padding
    gap: 8px; // Reducir gap entre elementos
  }
}

// Unificar tamaño de badges y botón
.floating-stats {
  display: flex;
  gap: 8px; // Consistente
}

.stat-badge-mini,
.btn-add-floating {
  // MISMO TAMAÑO BASE
  min-width: 52px; // Igualar
  height: 52px; // Igualar
  padding: 8px; // Igualar
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

#### 1.2 Botón como Icono con Hover Expansivo
**Archivo**: `client/src/styles/scss/components/_floating-bubble.scss`

```scss
.btn-add-floating {
  background: map-get($colors, "primary"); // Verde
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  // Estado colapsado (solo icono)
  span {
    position: absolute;
    opacity: 0;
    white-space: nowrap;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    transform: translateX(-20px);
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  svg.plus-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
  }
  
  // Estado expandido (hover)
  &:hover {
    min-width: 140px; // Expandir
    gap: 8px;
    
    span {
      position: relative;
      opacity: 1;
      transform: translateX(0);
    }
    
    svg.plus-icon {
      transform: rotate(90deg);
    }
  }
}
```

#### 1.3 Icono SVG del Botón (Trabajador + Más)
**Archivo**: `client/src/js/components/calculator.js`

Reemplazar el SVG actual del botón con:

```javascript
// En el método render(), dentro de .btn-add-floating
<svg class="plus-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Trabajador (icono de usuario) -->
  <circle cx="12" cy="7" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
  <path d="M6 21v-2a6 6 0 0 1 6-6 6 6 0 0 1 6 6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <!-- Símbolo + -->
  <circle cx="18" cy="6" r="5" fill="currentColor"/>
  <path d="M18 4v4M16 6h4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

#### 1.4 Visibilidad Condicional con Intersection Observer
**Archivo**: `client/src/js/pages/examenes_medicos_handler.js`

```javascript
function initFloatingBubbleVisibility() {
  const calculatorBody = document.querySelector('.calculator-body');
  const floatingBubble = document.querySelector('.floating-bubble');
  
  if (!calculatorBody || !floatingBubble) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Mostrar bocadillo con animación
        floatingBubble.classList.add('visible');
      } else {
        // Ocultar bocadillo
        floatingBubble.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.1, // Activar cuando 10% sea visible
    rootMargin: '-50px 0px' // Margen de activación
  });
  
  observer.observe(calculatorBody);
}

// Llamar en initAllHandlers()
```

**Archivo**: `client/src/styles/scss/components/_floating-bubble.scss`

```scss
.floating-bubble {
  // Estado inicial: oculto
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px) scale(0.9);
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  
  // Estado visible
  &.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
  }
}
```

---

### FASE 2: Implementación del Carousel Horizontal

#### 2.1 Estructura HTML del Carousel
**Archivo**: `client/src/js/components/calculator.js`

Modificar método `render()`:

```javascript
render() {
  this.container.innerHTML = `
    <div class="calculator-wrapper">
      <!-- Floating Bubble (mantener como está) -->
      <div class="floating-bubble">
        <!-- ... contenido actual ... -->
      </div>
      
      <!-- NUEVO: Carousel Container -->
      <div class="section-calculator">
        <div class="carousel-container">
          <!-- Navegación Izquierda -->
          <button class="carousel-nav prev" aria-label="Cargo anterior">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <!-- Track de Cargos -->
          <div class="carousel-track-container">
            <div class="carousel-track" id="cargosCarousel">
              <!-- Los cargos se insertan aquí -->
            </div>
          </div>
          
          <!-- Navegación Derecha -->
          <button class="carousel-nav next" aria-label="Siguiente cargo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Indicadores de posición (dots) -->
        <div class="carousel-indicators" id="carouselIndicators"></div>
      </div>
      
      <!-- Resumen (mantener como está) -->
      <div class="calculator-summary">
        <!-- ... -->
      </div>
    </div>
  `;
  
  this.renderCargos();
  this.bindEvents();
}
```

#### 2.2 Estilos del Carousel
**Archivo**: `client/src/styles/scss/components/_calculadora.scss`

```scss
// Contenedor principal del carousel
.section-calculator {
  position: relative;
  margin: 2rem 0;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  // Sombra interna (efecto "plano más bajo")
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.08);
    pointer-events: none;
    z-index: 1;
  }
}

// Track container (overflow hidden)
.carousel-track-container {
  flex: 1;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(map-get($colors, "light-bg"), 0.5);
  padding: 1.5rem;
  min-height: 500px;
}

// Track que se mueve
.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  gap: 2rem;
}

// Cada cargo ocupa el 100% del track
.cargo {
  min-width: 100%;
  flex-shrink: 0;
  animation: none; // Remover slideInUp
}

// Botones de navegación
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
  
  svg {
    width: 24px;
    height: 24px;
    color: map-get($colors, "primary");
  }
  
  &.prev {
    left: -24px;
  }
  
  &.next {
    right: -24px;
  }
  
  &:hover {
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  // Mostrar cuando hay múltiples cargos
  .carousel-container.has-multiple & {
    opacity: 1;
    visibility: visible;
  }
  
  // Deshabilitar en extremos
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
}

// Indicadores (dots)
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 1rem;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(map-get($colors, "text-muted"), 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.active {
      width: 24px;
      border-radius: 4px;
      background: map-get($colors, "primary");
    }
    
    &:hover:not(.active) {
      background: rgba(map-get($colors, "text-muted"), 0.6);
    }
  }
}

// Responsive
@include respond-to(tablet) {
  .carousel-nav {
    width: 40px;
    height: 40px;
    
    &.prev { left: -20px; }
    &.next { right: -20px; }
  }
}

@include respond-to(mobile) {
  .carousel-nav {
    &.prev { left: 8px; }
    &.next { right: 8px; }
  }
  
  .carousel-track-container {
    padding: 1rem;
  }
}
```

#### 2.3 Lógica de Navegación del Carousel
**Archivo**: `client/src/js/components/calculator.js`

```javascript
class Calculator {
  constructor(containerId, examsData) {
    this.container = document.getElementById(containerId);
    this.examsData = examsData;
    this.cargos = [];
    this.currentCargoIndex = 0; // Nuevo: índice del cargo visible
  }
  
  renderCargos() {
    const track = this.container.querySelector('#cargosCarousel');
    if (!track) return;
    
    // Si no hay cargos, crear uno inicial
    if (this.cargos.length === 0) {
      this.addCargo();
      return;
    }
    
    // Renderizar todos los cargos
    track.innerHTML = this.cargos.map((cargo, index) => 
      this.generateCargoHTML(cargo, index)
    ).join('');
    
    // Actualizar indicadores
    this.updateCarouselIndicators();
    
    // Mostrar/ocultar navegación
    this.updateNavigationVisibility();
    
    // Posicionar en cargo actual
    this.goToSlide(this.currentCargoIndex);
  }
  
  updateCarouselIndicators() {
    const indicators = this.container.querySelector('#carouselIndicators');
    if (!indicators) return;
    
    indicators.innerHTML = this.cargos.map((_, index) => 
      `<span class="dot ${index === this.currentCargoIndex ? 'active' : ''}" data-index="${index}"></span>`
    ).join('');
  }
  
  updateNavigationVisibility() {
    const carouselContainer = this.container.querySelector('.carousel-container');
    const prevBtn = this.container.querySelector('.carousel-nav.prev');
    const nextBtn = this.container.querySelector('.carousel-nav.next');
    
    if (!carouselContainer || !prevBtn || !nextBtn) return;
    
    // Mostrar navegación si hay más de un cargo
    if (this.cargos.length > 1) {
      carouselContainer.classList.add('has-multiple');
    } else {
      carouselContainer.classList.remove('has-multiple');
    }
    
    // Deshabilitar en extremos
    prevBtn.disabled = this.currentCargoIndex === 0;
    nextBtn.disabled = this.currentCargoIndex === this.cargos.length - 1;
  }
  
  goToSlide(index) {
    const track = this.container.querySelector('.carousel-track');
    if (!track) return;
    
    // Asegurar que el índice esté en rango
    this.currentCargoIndex = Math.max(0, Math.min(index, this.cargos.length - 1));
    
    // Calcular desplazamiento
    const slideWidth = track.querySelector('.cargo')?.offsetWidth || 0;
    const gap = 32; // 2rem en px
    const offset = -(this.currentCargoIndex * (slideWidth + gap));
    
    // Aplicar transformación
    track.style.transform = `translateX(${offset}px)`;
    
    // Actualizar UI
    this.updateCarouselIndicators();
    this.updateNavigationVisibility();
    
    // Guardar estado
    this.saveState();
  }
  
  nextSlide() {
    if (this.currentCargoIndex < this.cargos.length - 1) {
      this.goToSlide(this.currentCargoIndex + 1);
    }
  }
  
  prevSlide() {
    if (this.currentCargoIndex > 0) {
      this.goToSlide(this.currentCargoIndex - 1);
    }
  }
  
  addCargo() {
    const newCargo = {
      id: Date.now(),
      name: '',
      workers: 1,
      exams: []
    };
    
    this.cargos.push(newCargo);
    this.renderCargos();
    
    // Ir al nuevo cargo (último)
    this.goToSlide(this.cargos.length - 1);
    
    this.saveState();
  }
  
  bindEvents() {
    // ... eventos existentes ...
    
    // NUEVOS: Navegación carousel
    const prevBtn = this.container.querySelector('.carousel-nav.prev');
    const nextBtn = this.container.querySelector('.carousel-nav.next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevSlide());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    // Indicadores (dots)
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('dot')) {
        const index = parseInt(e.target.dataset.index);
        this.goToSlide(index);
      }
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // Botón floating (mantener)
    const floatingBtn = this.container.querySelector('.btn-add-floating');
    if (floatingBtn) {
      floatingBtn.addEventListener('click', () => this.addCargo());
    }
  }
}
```

---

## 🎨 Assets Necesarios

### SVG del Botón Floating (Trabajador + Más)
```svg
<svg class="plus-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Trabajador -->
  <circle cx="12" cy="7" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
  <path d="M6 21v-2a6 6 0 0 1 6-6 6 6 0 0 1 6 6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <!-- Badge "+" -->
  <circle cx="18" cy="6" r="5" fill="currentColor"/>
  <path d="M18 4v4M16 6h4" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

---

## ✅ Checklist de Implementación

### Fase 1: Floating Bubble
- [ ] Reducir `max-width` a 250px en `.bubble-content`
- [ ] Igualar tamaño de badges y botón (52x52px)
- [ ] Implementar botón colapsado (solo icono)
- [ ] Implementar expansión en hover
- [ ] Crear SVG de trabajador + más
- [ ] Implementar Intersection Observer para visibilidad
- [ ] Añadir clases `.visible` con transiciones
- [ ] Probar responsividad

### Fase 2: Carousel
- [ ] Crear estructura HTML del carousel
- [ ] Implementar estilos de `.carousel-container`
- [ ] Añadir sombra interna al frame
- [ ] Estilizar botones de navegación
- [ ] Crear indicadores (dots)
- [ ] Implementar `goToSlide()` en Calculator
- [ ] Implementar `nextSlide()` y `prevSlide()`
- [ ] Modificar `addCargo()` para ir al nuevo slide
- [ ] Bind eventos de navegación
- [ ] Añadir navegación con teclado (flechas)
- [ ] Actualizar `saveState()` para incluir `currentCargoIndex`
- [ ] Probar animaciones y transiciones
- [ ] Responsive (mobile, tablet, desktop)

---

## 🧪 Testing

1. **Floating Bubble**:
   - [ ] Aparece solo cuando `.calculator-body` es visible
   - [ ] Desaparece al hacer scroll fuera
   - [ ] Botón se expande suavemente en hover
   - [ ] Todos los elementos tienen el mismo tamaño base
   - [ ] Icono del botón es claro y profesional

2. **Carousel**:
   - [ ] Solo un cargo visible a la vez
   - [ ] Navegación suave entre cargos (transform smooth)
   - [ ] Flechas aparecen cuando hay 2+ cargos
   - [ ] Flechas se deshabilitan en extremos
   - [ ] Dots indican posición actual correctamente
   - [ ] Click en dot navega al cargo correspondiente
   - [ ] Nuevo cargo se crea y navega automáticamente
   - [ ] Teclado funciona (← →)
   - [ ] Responsive en móvil

3. **Integración**:
   - [ ] Botón floating crea nuevo cargo en carousel
   - [ ] Badges se actualizan correctamente
   - [ ] Estado se guarda en localStorage
   - [ ] No hay conflictos con estilos existentes

---

## 📚 Referencias de Archivos

### Archivos a Modificar (en orden)
1. `client/src/styles/scss/components/_floating-bubble.scss` - Optimización del bocadillo
2. `client/src/styles/scss/components/_calculadora.scss` - Carousel y estilos
3. `client/src/js/components/calculator.js` - Lógica del carousel
4. `client/src/js/pages/examenes_medicos_handler.js` - Intersection Observer

### Archivos de Contexto (lectura)
5. `client/src/styles/scss/base/_variables.scss` - Variables globales
6. `DESIGN_VISION.md` - Guía de diseño
7. `ANALISIS_SCSS.md` - Arquitectura SCSS

### Archivo HTML (referencia)
8. `client/public/pages/Examenes_medicos_ocupacionales.html` - Estructura base

---

## 🚀 Prompt para Nueva Sesión

```
Necesito implementar mejoras críticas en la calculadora de exámenes médicos:

1. FLOATING BUBBLE OPTIMIZADO:
   - Reducir tamaño (max-width: 250px)
   - 4 elementos del mismo tamaño (3 badges + 1 botón)
   - Botón "Agregar Cargo" como icono compacto (trabajador + símbolo más)
   - Expandir en hover mostrando texto
   - Solo visible cuando .calculator-body está en viewport (Intersection Observer)

2. CAROUSEL HORIZONTAL DE CARGOS:
   - Cargos se desplazan horizontalmente (no verticalmente)
   - Solo un cargo visible a la vez dentro de .section-calculator
   - Botones de navegación ◀ ▶ (aparecen con 2+ cargos)
   - Animación slide suave (transform translateX)
   - Frame con sombra interna (efecto "plano más bajo")
   - Indicadores de posición (dots)
   - Navegación con teclado

Por favor, implementa siguiendo el documento:
@PLAN_FLOATING_BUBBLE_Y_CAROUSEL.md

Referencias necesarias:
@_floating-bubble.scss
@_calculadora.scss  
@calculator.js
@examenes_medicos_handler.js
@_variables.scss
@DESIGN_VISION.md

Ejecutar en orden: Fase 1 (Floating Bubble) → Fase 2 (Carousel)
```

---

## 💡 Notas Técnicas

### Performance
- Usar `transform` (no `left/top`) para animaciones (GPU)
- `will-change: transform` en track del carousel
- Intersection Observer con threshold 0.1 para floating bubble
- `requestAnimationFrame` para cambios de slide suaves

### Accesibilidad
- `aria-label` en botones de navegación
- Navegación con teclado (ArrowLeft/Right)
- Focus visible en controles
- `role="region"` en carousel container

### Responsive
- Mobile: Flechas dentro del contenedor
- Tablet: Reducir tamaño de controles
- Desktop: Flechas fuera del contenedor

### Browser Support
- `transform: translateX()` - ✅ Universal
- `Intersection Observer` - ✅ Moderno (polyfill si necesario)
- CSS Grid/Flexbox - ✅ Universal
- CSS Custom Properties - ✅ Moderno

---

**Fecha de creación**: 2025-11-03
**Estado**: Pendiente de implementación
**Prioridad**: Alta
**Estimación**: 3-4 horas

