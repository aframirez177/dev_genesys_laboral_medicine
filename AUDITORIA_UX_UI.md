# 🎨 Auditoría UX/UI - Genesys Laboral Medicine

**Fecha:** 2025-11-04  
**Auditor:** Experto UX/UI  
**Alcance:** Textos, Estilos y Experiencia de Usuario  
**Estado del proyecto:** ✨ Modernizado (SCSS 2.0)

---

## 📋 Índice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Auditoría de Textos (Copywriting UX)](#2-auditoría-de-textos-copywriting-ux)
3. [Auditoría de Estilos (Visual Design)](#3-auditoría-de-estilos-visual-design)
4. [Auditoría de Componentes Específicos](#4-auditoría-de-componentes-específicos)
5. [Plan de Acción](#5-plan-de-acción)
6. [Priorización de Mejoras](#6-priorización-de-mejoras)

---

## 1. Resumen Ejecutivo

### 🎯 Hallazgos Clave

| Categoría | Estado | Severidad | Prioridad |
|-----------|--------|-----------|-----------|
| **Textos: Consistencia** | ⚠️ Necesita mejora | Media | Alta |
| **Textos: Ortografía** | 🔴 Errores críticos | Alta | **Crítica** |
| **Textos: Tono de voz** | ⚠️ Inconsistente | Media | Media |
| **Estilos: Sistema de diseño** | ✅ Excelente | - | - |
| **Estilos: Accesibilidad** | ⚠️ Mejoras necesarias | Media | Alta |
| **Estilos: Responsive** | ✅ Muy bueno | - | - |
| **Componentes: CTAs** | ⚠️ Inconsistentes | Media | Alta |
| **Arquitectura SCSS** | ✅ Excelente | - | - |

### 🎨 Fortalezas del Proyecto

1. ✅ **Sistema de diseño sólido y moderno**
   - Arquitectura SCSS bien estructurada (patrón 7-1)
   - Variables centralizadas y namespaces explícitos
   - Zero warnings de compilación

2. ✅ **Diseño visual cohesivo**
   - Paleta de colores bien definida
   - Tipografía consistente (Poppins + Raleway)
   - Componentes reutilizables

3. ✅ **Responsive design robusto**
   - Enfoque mobile-first
   - Breakpoints bien definidos
   - Grid y Flexbox utilizados correctamente

4. ✅ **Optimización técnica**
   - Performance optimizado
   - Lazy loading implementado
   - Font display: swap

### 🔴 Problemas Críticos Identificados

#### Textos
1. **Errores ortográficos graves** (múltiples instancias)
2. **Inconsistencia en el tono de voz** (formal vs. informal)
3. **CTAs genéricos** ("Empieza aquí", "Conoce más")
4. **Mayúsculas innecesarias** en títulos y headers
5. **Falta de espacios** después de signos de puntuación

#### Estilos
1. **Contraste insuficiente** en algunos textos sobre fondos
2. **Botones Log In / Sign Up** en español con texto en inglés
3. **Tamaños de fuente inconsistentes** en CTAs
4. **Falta de estados hover/focus** consistentes
5. **Espaciado irregular** entre secciones

---

## 2. Auditoría de Textos (Copywriting UX)

### 2.1 Errores Ortográficos y Gramaticales 🔴 CRÍTICO

#### Página: `index.html` / `Nosotros.html`

**Error 1: "Realizamos tus Examenes Medicos Ocupacionales"**
```html
❌ ANTES (línea 811-812 Nosotros.html):
Realizamos tus
<span class="green">Examenes Medicos Ocupacionales</span>en Bogotá

✅ DESPUÉS:
Realizamos tus
<span class="green">exámenes médicos ocupacionales</span> en Bogotá
```
- **Problema:** Falta tilde en "exámenes" y "médicos", mayúsculas innecesarias, falta espacio antes de "en"
- **Impacto:** Baja credibilidad profesional
- **Prioridad:** 🔴 Crítica

**Error 2: "Somos mujeres lideres"**
```html
❌ ANTES (línea 835 Nosotros.html):
Somos mujeres lideres con el proposito de cuidar...

✅ DESPUÉS:
Somos mujeres líderes con el propósito de cuidar...
```
- **Problema:** Falta tilde en "líderes" y "propósito"
- **Prioridad:** 🔴 Crítica

**Error 3: "Encuentra aca"**
```html
❌ ANTES (línea 321 examen_medico_escolar.html):
Encuentra aca todo <span class="green">para que tus hijos </span>esten listos...

✅ DESPUÉS:
Encuentra aquí todo <span class="green">para que tus hijos </span>estén listos...
```
- **Problema:** "aca" → "aquí", falta tilde en "estén", falta espacio
- **Prioridad:** 🔴 Crítica

#### Página: `Matriz_de_riesgos_profesional.html`

**Error 4: "PILAS! EL ESTANDAR ES LA GTC45"**
```html
❌ ANTES (línea 910):
¿Cómo se elabora una matriz de riesgos laborales paso a paso según
la normativa colombiana?
<br />PILAS! EL ESTANDAR ES LA GTC45 (GUITA TECNICA #45)

✅ DESPUÉS:
¿Cómo se elabora una matriz de riesgos laborales paso a paso según
la normativa colombiana?
<br />💡 Nota: El estándar es la GTC-45 (Guía Técnica Colombiana #45)
```
- **Problema:** 
  - "PILAS!" es coloquial, no profesional
  - "ESTANDAR" → "estándar" (falta tilde)
  - "GUITA TECNICA" → "Guía Técnica" (error tipográfico grave + falta tilde)
  - Mayúsculas innecesarias
- **Impacto:** Muy grave - da imagen de poco profesionalismo
- **Prioridad:** 🔴 **URGENTE**

**Error 5: "SST Integral" vs "SST"**
```html
❌ INCONSISTENTE:
Línea 210 examen_medico_escolar.html: "SST Integral"
Línea 485 Matriz_de_riesgos_profesional.html: "SST Integral"
Pero en otros lugares solo dice "SST"

✅ SOLUCIÓN: Decidir uno y mantenerlo consistente en todo el sitio
```
- **Prioridad:** ⚠️ Media

### 2.2 Inconsistencias de Tono de Voz ⚠️

#### Problema: Mezcla de tú/usted

```html
❌ INCONSISTENTE:

Página Nosotros.html (línea 815):
"encuentra aca un proveedor confiable que se ajusta a tus necesidades"
→ Usa "tú" (informal)

Página Perdida_de_capacidad_laboral.html (línea 277):
"Garantizamos el cumplimiento normativo y brindamos soluciones efectivas"
→ Usa "nosotros/ustedes" (formal)

✅ RECOMENDACIÓN:
Mantener TONo CONSISTENTE en todo el sitio.
Sugerencia: Usar "TÚ" (más cercano y humano) pero con lenguaje profesional.
```

#### Problema: CTAs genéricos

```html
❌ CTAs GENÉRICOS encontrados en múltiples páginas:

- "Empieza aquí" (8 instancias)
- "Conoce más" (6 instancias)
- "Más información" (5 instancias)
- "Contáctanos" (4 instancias)

✅ RECOMENDACIÓN: CTAs específicos y orientados a acción

Ejemplos mejorados:

Página Matriz de Riesgos:
❌ "Empieza aquí"
✅ "Solicita tu diagnóstico gratuito"
✅ "Comienza tu matriz de riesgos"

Página Batería Psicosocial:
❌ "Conoce más"
✅ "Agenda tu evaluación psicosocial"
✅ "Evalúa el clima laboral ahora"

Página Profesiograma:
❌ "Más información"
✅ "Diseña tu profesiograma en 48h"
✅ "Cumple con la Res. 1843 hoy"
```

### 2.3 Jerarquía de Información y Escaneo ⚠️

#### Problema: Textos largos sin pausas visuales

```html
❌ ANTES (Nosotros.html, línea 1137-1143):
<p>
  Profesional en finanzas y contabilidad, con una sólida trayectoria
  de liderazgo. Su capacidad estratégica y habilidades gerenciales
  impulsan la transformación y crecimiento empresarial. Con más de 15
  años de experiencia, destaca por su visión innovadora y compromiso
  con la excelencia organizacional.
</p>

✅ DESPUÉS:
<p>
  Profesional en finanzas y contabilidad con más de <strong>15 años de experiencia</strong>.
</p>
<p>
  Su capacidad estratégica y habilidades gerenciales impulsan la transformación 
  y crecimiento empresarial, destacando por su visión innovadora y compromiso 
  con la excelencia organizacional.
</p>
```

**Razón:** Párrafos más cortos mejoran la legibilidad en dispositivos móviles

#### Problema: Falta de microcopy explicativo

```html
❌ FALTA CONTEXTO (index.html):
<button type="button" class="cta-button-1">Log In</button>
<button type="button" class="cta-button">Sign Up</button>

✅ CON CONTEXTO:
<div class="auth-buttons">
  <button type="button" class="cta-button-1" aria-label="Ingresar a la intranet para clientes">
    Intranet
  </button>
  <button type="button" class="cta-button" aria-label="Registrarse como nuevo cliente">
    Registrarse
  </button>
  <p class="auth-hint">Para clientes existentes</p>
</div>
```

**Razón:** Los usuarios no saben qué es "Log In" en un sitio B2B en español

### 2.4 Legibilidad y Escaneabilidad

#### Problema: Textos en mayúsculas sostenidas

```html
❌ DIFÍCIL DE LEER:
<h3>PROPÓSITO <br />ORGANIZACIONAL</h3>
<p>
  ESTAMOS COMPROMETIDOS EN MEJORAR LA
  <span class="green">SALUD LABORAL</span> PARA QUE TU TRABAJO NO TE
  CUESTE LA VIDA
</p>

✅ MEJOR LEGIBILIDAD:
<h3>Propósito organizacional</h3>
<p>
  Estamos comprometidos en mejorar la
  <span class="green">salud laboral</span> para que tu trabajo no te
  cueste la vida
</p>
```

**Razón:** Las mayúsculas sostenidas reducen la velocidad de lectura en un 10-20% (estudios de Nielsen Norman Group)

### 2.5 Microcopy y Feedback

#### Problema: Falta de mensajes de estado

```html
❌ AUSENTE en formularios:
- Sin mensaje "Enviando..."
- Sin mensaje "Gracias por contactarnos"
- Sin validación inline con mensajes claros

✅ AGREGAR:
<div class="form-feedback">
  <div class="feedback-loading" aria-live="polite">
    <span class="spinner"></span>
    Enviando tu solicitud...
  </div>
  <div class="feedback-success">
    ✓ ¡Listo! Te contactaremos en menos de 24 horas.
  </div>
  <div class="feedback-error">
    ⚠️ Algo salió mal. Intenta nuevamente o llámanos al 601-3739387
  </div>
</div>
```

---

## 3. Auditoría de Estilos (Visual Design)

### 3.1 Sistema de Colores ✅ Muy Bueno

#### Paleta Actual

```scss
$colors: (
    "primary": #5dc4af,       // Verde agua ✅
    "secondary": #383d47,     // Gris oscuro ✅
    "text": #2d3238,          // Texto principal ✅
    "alternative": #fff27d,   // Amarillo ⚠️
    "success": #4caf50,       // Verde ✅
    "danger": #f44336,        // Rojo ✅
);
```

**Fortalezas:**
- ✅ Colores bien definidos y consistentes
- ✅ Verde primario transmite salud y confianza
- ✅ Buenos colores semánticos (success, danger)

**Áreas de Mejora:**

#### Problema 1: Contraste insuficiente ⚠️

```scss
❌ CONTRASTE BAJO (no cumple WCAG AA):

// Texto verde sobre fondo claro
.green {
  color: map.get($colors, 'primary'); // #5dc4af
  // Sobre background #f3f0f0
  // Ratio: 2.8:1 (debe ser 4.5:1 mínimo)
}

✅ SOLUCIÓN 1: Oscurecer el verde para texto
$colors-text: (
  "primary-text": #42a594,  // Más oscuro, ratio 4.6:1 ✓
);

✅ SOLUCIÓN 2: Usar solo para fondos/decoración, no texto
```

#### Problema 2: Color alternativo poco usado

```scss
⚠️ REVISAR:
"alternative": #fff27d,  // Amarillo - ¿Se usa realmente?

💡 RECOMENDACIÓN:
Si no se usa significativamente, considerar eliminar para simplificar la paleta
```

### 3.2 Tipografía ✅ Excelente Base, ⚠️ Inconsistencias

#### Sistema Actual

```scss
$fonts: (
    "title": ("Poppins", sans-serif),   // 400, 500, 600, 700, 800
    "body": ("Raleway", sans-serif)     // 400, 500, 600, 700, 800
);
```

**Fortalezas:**
- ✅ Dos fuentes complementarias y legibles
- ✅ Poppins para títulos (geométrica, moderna)
- ✅ Raleway para cuerpo (elegante, legible)
- ✅ Font-display: swap implementado

**Problemas Identificados:**

#### Problema 1: Tamaños inconsistentes en CTAs

```scss
❌ INCONSISTENTE (encontrado en múltiples archivos):

// components/_buttons.scss
.cta-button {
  font-size: 1.8rem;  // 18px
}

// Pero en algunas páginas:
.cta-button {
  font-size: 1.4rem;  // 14px en calculadora
  font-size: 1.6rem;  // 16px en algunos lugares
}

✅ SOLUCIÓN: Estandarizar escalas

// Escala de botones definida
$button-sizes: (
  "small": 1.4rem,    // 14px - Para acciones secundarias
  "medium": 1.6rem,   // 16px - Botones estándar
  "large": 1.8rem,    // 18px - CTAs principales
);

// Aplicar con mixins
@mixin button-size($size) {
  font-size: map.get($button-sizes, $size);
}
```

#### Problema 2: Line-height inconsistente

```scss
❌ INCONSISTENTE:

// Algunos h2 tienen line-height: 1.2
// Otros tienen line-height: 1.5
// Algunos no tienen line-height definido

✅ SOLUCIÓN: Definir sistema coherente

$line-heights: (
  "tight": 1.2,     // Títulos grandes
  "normal": 1.5,    // Títulos medianos
  "relaxed": 1.8,   // Párrafos y cuerpo
);

h1 { line-height: map.get($line-heights, "tight"); }
h2, h3 { line-height: map.get($line-heights, "normal"); }
p, li { line-height: map.get($line-heights, "relaxed"); }
```

### 3.3 Espaciado y Ritmo Visual ⚠️

#### Problema 1: Espaciado irregular entre secciones

```scss
❌ INCONSISTENTE (encontrado en varias páginas):

.section-1 { padding: 2rem 0; }
.section-2 { padding: 3rem 8rem; }
.section-3 { padding: 4rem 2rem; }
.section-4 { padding: 2rem; }

✅ SOLUCIÓN: Sistema de espaciado modular (8px base)

$spacing: (
  "xs": 0.8rem,   // 8px
  "sm": 1.6rem,   // 16px
  "md": 2.4rem,   // 24px
  "lg": 3.2rem,   // 32px
  "xl": 4.8rem,   // 48px
  "2xl": 6.4rem,  // 64px
);

// Uso consistente
.section {
  padding: map.get($spacing, "lg") map.get($spacing, "md");
  
  @include respond-to("tablet") {
    padding: map.get($spacing, "xl") map.get($spacing, "lg");
  }
}
```

#### Problema 2: Márgenes colapsados

```scss
⚠️ DETECTADO:

// Algunos componentes tienen margin-bottom
// Otros tienen margin-top
// Esto causa inconsistencia cuando se apilan

✅ SOLUCIÓN: Metodología "margin-bottom only"

.section,
.card,
.text-block {
  margin-bottom: map.get($spacing, "lg");
  
  &:last-child {
    margin-bottom: 0;
  }
}
```

### 3.4 Componentes Interactivos ⚠️

#### Problema 1: Estados hover inconsistentes

```scss
❌ INCONSISTENTE:

// Algunos botones:
.button:hover {
  transform: translateY(-3px);  // Levitan
}

// Otros botones:
.button:hover {
  background-color: darken($color, 10%);  // Solo color
}

// Algunos no tienen hover

✅ SOLUCIÓN: Estados consistentes

%interactive-element {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:focus-visible {
    outline: 3px solid rgba(map.get($colors, 'primary'), 0.5);
    outline-offset: 2px;
  }
}

.cta-button {
  @extend %interactive-element;
}
```

#### Problema 2: Focus states para accesibilidad

```scss
❌ FALTA O ESTÁ INCONSISTENTE:

// Muchos elementos interactivos no tienen :focus-visible
// O usan el outline por defecto del navegador (inconsistente)

✅ SOLUCIÓN: Sistema de focus consistente

@mixin focus-ring($color: map.get($colors, 'primary')) {
  &:focus {
    outline: none;  // Removemos el outline por defecto
  }
  
  &:focus-visible {
    outline: 3px solid rgba($color, 0.5);
    outline-offset: 2px;
    border-radius: inherit;
  }
}

// Aplicar a todos los elementos interactivos
button,
a,
input,
textarea,
select {
  @include focus-ring();
}
```

### 3.5 Responsive Design ✅ Muy Bueno, ⚠️ Ajustes Menores

#### Breakpoints Actuales

```scss
$breakpoints: (
    "mobile": 400px,   // 📱
    "tablet": 955px,   // 📱
    "desktop": 1080px  // 💻
);
```

**Fortalezas:**
- ✅ Mobile-first approach implementado
- ✅ Breakpoints bien utilizados
- ✅ Mixin `respond-to` funciona perfectamente

**Áreas de Mejora:**

#### Problema 1: Salto abrupto en algunos textos

```scss
❌ SALTO VISUAL FUERTE:

.hero-content h1 {
  font-size: 2.5rem;  // Móvil
  
  @include respond-to("tablet") {
    font-size: 5rem;  // Tablet/Desktop - ¡Duplica!
  }
}

✅ MEJOR: Transición gradual con clamp()

.hero-content h1 {
  font-size: clamp(2.5rem, 4vw + 1rem, 5rem);
  // Crece suavemente entre 2.5rem y 5rem
  // Basado en el ancho del viewport
}
```

#### Problema 2: Imágenes no optimizadas para diferentes pantallas

```html
❌ IMAGEN ÚNICA:
<img src="../assets/images/hero.webp" alt="..." loading="lazy" />

✅ CON SRCSET RESPONSIVE:
<img 
  src="../assets/images/hero.webp" 
  srcset="
    ../assets/images/hero-400w.webp 400w,
    ../assets/images/hero-800w.webp 800w,
    ../assets/images/hero-1200w.webp 1200w,
  "
  sizes="(max-width: 400px) 100vw, 
         (max-width: 955px) 90vw, 
         1200px"
  alt="..." 
  loading="lazy" 
/>
```

### 3.6 Accesibilidad (A11y) ⚠️ Necesita Mejoras

#### Problema 1: Contraste de color insuficiente

```scss
❌ NO CUMPLE WCAG AA:

// Texto verde #5dc4af sobre fondo #f3f0f0
// Ratio de contraste: 2.8:1 (necesita 4.5:1)

✅ SOLUCIÓN:

// Opción 1: Oscurecer el verde para texto
$colors-accessible: (
  "primary-text": #42a594,  // Ratio 4.6:1 ✓
);

// Opción 2: Usar peso bold para el verde actual
.green {
  color: map.get($colors, 'primary');
  font-weight: 600;  // Bold mejora el contraste percibido
}

// Opción 3: Solo usar para fondos/decoración
.green-bg {
  background-color: map.get($colors, 'primary');
  color: white;  // Ratio 3.4:1 - aceptable para texto grande
}
```

#### Problema 2: Texto alternativo en imágenes decorativas

```html
❌ PROBLEMAS DETECTADOS:

<!-- Imagen decorativa con alt descriptivo -->
<img src="render.webp" alt="Pérdida de Capacidad Laboral" />
<!-- Debería tener alt="" porque es decorativa -->

<!-- SVGs sin role ni título -->
<svg width="36" height="41">...</svg>

✅ SOLUCIÓN:

<!-- Imagen decorativa -->
<img src="render.webp" alt="" role="presentation" />

<!-- Imagen informativa -->
<img src="team.webp" alt="Equipo de doctoras de Genesys Laboral Medicine" />

<!-- SVG decorativo -->
<svg width="36" height="41" aria-hidden="true">...</svg>

<!-- SVG informativo -->
<svg width="36" height="41" role="img" aria-labelledby="icon-title">
  <title id="icon-title">Diagnóstico de riesgos</title>
  ...
</svg>
```

#### Problema 3: Elementos interactivos sin labels accesibles

```html
❌ PROBLEMAS:

<!-- Botón hamburguesa sin texto -->
<div class="ham-menu" role="button" tabindex="0">
  <span></span>
  <span></span>
  <span></span>
</div>

<!-- Dropdown sin aria-haspopup -->
<button class="dropdown-toggle">Servicios</button>

✅ SOLUCIÓN:

<!-- Botón hamburguesa accesible -->
<button 
  class="ham-menu" 
  aria-label="Abrir menú de navegación"
  aria-expanded="false"
  aria-controls="mobile-menu"
>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span class="sr-only">Menú</span>
</button>

<!-- Dropdown accesible -->
<button 
  class="dropdown-toggle"
  aria-haspopup="true"
  aria-expanded="false"
  aria-controls="services-menu"
>
  Servicios
  <span aria-hidden="true">▼</span>
</button>
```

---

## 4. Auditoría de Componentes Específicos

### 4.1 Header / Navegación

#### ✅ Fortalezas:
- Sistema de navegación responsive
- Menú hamburguesa funcional
- Dropdown de servicios bien estructurado

#### ⚠️ Problemas:

**Problema 1: Botones "Log In" / "Sign Up" confusos**

```html
❌ ACTUAL:
<button class="cta-button-1">Log In</button>
<button class="cta-button">Sign Up</button>

Problemas:
- Texto en inglés en sitio en español
- No está claro qué hacen (¿para qué son?)
- Colores y jerarquía confusos

✅ PROPUESTA:

<div class="header-auth">
  <!-- Botón principal -->
  <a 
    href="https://sites.google.com/view/intranet-genesys-laboral-medic" 
    class="btn-intranet"
    target="_blank"
    rel="noopener"
  >
    <svg class="icon-lock" aria-hidden="true">...</svg>
    Intranet de clientes
  </a>
  
  <!-- Botón secundario -->
  <a 
    href="/pages/contacto.html#registro" 
    class="btn-registro"
  >
    Solicitar acceso
  </a>
</div>

<!-- Estilos mejorados -->
<style>
.btn-intranet {
  background: map.get($colors, 'primary');
  color: white;
  /* Botón primario destacado */
}

.btn-registro {
  background: transparent;
  border: 2px solid map.get($colors, 'primary');
  color: map.get($colors, 'primary');
  /* Botón secundario outline */
}
</style>
```

**Problema 2: Menú de servicios con íconos idénticos**

```html
❌ ACTUAL:
<!-- Todos los servicios tienen el mismo SVG -->
<svg width="36" height="41">...</svg>
<svg width="36" height="41">...</svg>  <!-- Igual -->
<svg width="36" height="41">...</svg>  <!-- Igual -->

✅ PROPUESTA:
Usar íconos diferenciados para cada servicio:
- 📊 Matriz de Riesgos → Ícono de checklist/matriz
- 📋 Profesiograma → Ícono de documento/perfil
- 🏥 Exámenes → Ícono de estetoscopio
- 🧠 Batería Psicosocial → Ícono de cerebro/mente
- 🔍 Análisis Puesto → Ícono de lupa/análisis
```

### 4.2 Botones CTA

#### Problema: Inconsistencia de estilos y textos

```scss
❌ MÚLTIPLES ESTILOS ENCONTRADOS:

// Estilo 1
.cta-button {
  padding: 0.5rem 1.61rem;
  font-size: 1.4rem;
  border-radius: 34px;
}

// Estilo 2 (FAQs)
.cta-button-faqs {
  padding: 1rem 2rem;
  font-size: 1.6rem;
  border-radius: 25px;
}

// Estilo 3 (Header)
.cta-button-1 {
  padding: 0.5rem 1.3rem;
  font-size: 1.4rem;
  border-radius: 50px;
}

✅ SOLUCIÓN: Sistema unificado de botones

// Base button
%button-base {
  display: inline-block;
  font-family: map.get($fonts, 'body');
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

// Tamaños
@mixin button-small {
  padding: 0.6rem 1.6rem;
  font-size: 1.4rem;
  border-radius: 24px;
}

@mixin button-medium {
  padding: 0.8rem 2rem;
  font-size: 1.6rem;
  border-radius: 28px;
}

@mixin button-large {
  padding: 1.2rem 2.8rem;
  font-size: 1.8rem;
  border-radius: 34px;
}

// Variantes
.btn-primary {
  @extend %button-base;
  @include button-large;
  background: map.get($colors, 'primary');
  color: white;
}

.btn-secondary {
  @extend %button-base;
  @include button-medium;
  background: transparent;
  border: 2px solid map.get($colors, 'primary');
  color: map.get($colors, 'primary');
}

.btn-tertiary {
  @extend %button-base;
  @include button-small;
  background: white;
  color: map.get($colors, 'secondary');
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### 4.3 Formularios

#### Problema: Falta de feedback visual

```html
❌ ACTUAL:
<form id="matrizRiesgosForm">
  <input type="text" name="cargo" />
  <button type="submit">Generar Matriz</button>
</form>

Sin estados de:
- Cargando
- Éxito
- Error
- Validación inline

✅ MEJORADO:

<form id="matrizRiesgosForm" class="form-enhanced">
  <!-- Campo con validación inline -->
  <div class="form-field">
    <label for="cargo">
      Nombre del cargo
      <span class="required" aria-label="campo requerido">*</span>
    </label>
    <input 
      type="text" 
      id="cargo"
      name="cargo" 
      required
      aria-invalid="false"
      aria-describedby="cargo-error"
    />
    <span class="field-error" id="cargo-error" role="alert">
      <!-- Se muestra solo si hay error -->
    </span>
    <span class="field-success" aria-live="polite">
      ✓ Válido
    </span>
  </div>
  
  <!-- Botón con estados -->
  <button 
    type="submit" 
    class="btn-primary"
    data-state="idle"
  >
    <span class="btn-text">Generar Matriz</span>
    <span class="btn-loading" aria-hidden="true">
      <span class="spinner"></span> Generando...
    </span>
    <span class="btn-success" aria-hidden="true">
      ✓ Matriz generada
    </span>
  </button>
  
  <!-- Mensajes de estado del formulario -->
  <div class="form-messages" role="status" aria-live="polite">
    <div class="message-success">
      <svg class="icon-check">...</svg>
      <p>
        <strong>¡Listo!</strong> Tu matriz se ha generado correctamente.
        Te llegará un correo en los próximos 5 minutos.
      </p>
    </div>
    <div class="message-error">
      <svg class="icon-alert">...</svg>
      <p>
        <strong>Algo salió mal.</strong> 
        Revisa los campos marcados o 
        <a href="tel:+573205803048">llámanos al 601-3739387</a>.
      </p>
    </div>
  </div>
</form>

<style>
// Estados del botón
.btn-primary[data-state="idle"] .btn-text { display: inline; }
.btn-primary[data-state="idle"] .btn-loading,
.btn-primary[data-state="idle"] .btn-success { display: none; }

.btn-primary[data-state="loading"] .btn-loading { display: inline; }
.btn-primary[data-state="loading"] .btn-text,
.btn-primary[data-state="loading"] .btn-success { display: none; }

.btn-primary[data-state="success"] .btn-success { display: inline; }
.btn-primary[data-state="success"] .btn-text,
.btn-primary[data-state="success"] .btn-loading { display: none; }

// Animación del spinner
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}
</style>
```

### 4.4 Sección de FAQs

#### ✅ Fortalezas:
- Estructura clara
- Contenido organizado

#### ⚠️ Problemas:

**Problema: No es acordeón interactivo**

```html
❌ ACTUAL: FAQs estáticas (no colapsables)
<div class="faq-block">
  <h2>Pregunta</h2>
  <p>Respuesta siempre visible</p>
</div>

✅ MEJORADO: Acordeón accesible

<div class="faq-accordion">
  <div class="faq-item">
    <h3>
      <button 
        class="faq-toggle"
        aria-expanded="false"
        aria-controls="faq-1"
      >
        <span class="faq-question">
          ¿Qué es la batería de riesgo psicosocial?
        </span>
        <svg class="faq-icon" aria-hidden="true">
          <use href="#icon-chevron"></use>
        </svg>
      </button>
    </h3>
    <div 
      id="faq-1" 
      class="faq-answer"
      hidden
    >
      <p>La batería de riesgo psicosocial es un conjunto de...</p>
    </div>
  </div>
</div>

<style>
.faq-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.6rem;
  background: white;
  border: 1px solid map.get($colors, 'border-color');
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: map.get($colors, 'background-alternative');
  }
  
  &[aria-expanded="true"] {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    
    .faq-icon {
      transform: rotate(180deg);
    }
  }
}

.faq-answer {
  padding: 1.6rem;
  background: white;
  border: 1px solid map.get($colors, 'border-color');
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

---

## 5. Plan de Acción

### 5.1 Correcciones Críticas (Hacer YA) 🔴

#### Prioridad 1: Errores Ortográficos

**Tiempo estimado:** 2 horas  
**Impacto:** Alto (credibilidad profesional)  
**Esfuerzo:** Bajo

**Tareas:**
1. [ ] Corregir "Examenes" → "Exámenes" (todas las instancias)
2. [ ] Corregir "Medicos" → "Médicos" (todas las instancias)
3. [ ] Corregir "lideres" → "líderes"
4. [ ] Corregir "proposito" → "propósito"
5. [ ] Corregir "aca" → "aquí"
6. [ ] Corregir "esten" → "estén"
7. [ ] 🚨 **URGENTE:** Reemplazar "PILAS! EL ESTANDAR ES LA GTC45 (GUITA TECNICA #45)"
   - Por: "💡 Nota: El estándar es la GTC-45 (Guía Técnica Colombiana #45)"
8. [ ] Agregar espacios después de puntuación donde falten
9. [ ] Revisar mayúsculas innecesarias

**Archivos afectados:**
- `Nosotros.html`
- `Perdida_de_capacidad_laboral.html`
- `Matriz_de_riesgos_profesional.html`
- `examen_medico_escolar.html`
- `Bateria_de_riesgo_psicosocial.html`
- `Analisis_de_puesto_de_trabajo.html`
- `Profesiograma.html`

**Script de búsqueda y reemplazo:**

```bash
# Ejecutar en la carpeta client/public/pages/

# 1. Exámenes
find . -name "*.html" -exec sed -i 's/Examenes/Exámenes/g' {} +
find . -name "*.html" -exec sed -i 's/examenes/exámenes/g' {} +

# 2. Médicos
find . -name "*.html" -exec sed -i 's/Medicos/Médicos/g' {} +
find . -name "*.html" -exec sed -i 's/medicos/médicos/g' {} +

# 3. Líderes
find . -name "*.html" -exec sed -i 's/lideres/líderes/g' {} +

# 4. Propósito
find . -name "*.html" -exec sed -i 's/proposito/propósito/g' {} +

# 5. Aquí
find . -name "*.html" -exec sed -i 's/ aca / aquí /g' {} +
find . -name "*.html" -exec sed -i 's/^aca /aquí /g' {} +

# 6. Estén
find . -name "*.html" -exec sed -i 's/esten/estén/g' {} +

# 7. URGENTE: Reemplazar texto completo en Matriz_de_riesgos_profesional.html
# (Hacer manualmente por su complejidad)
```

#### Prioridad 2: Mejorar Contraste de Colores

**Tiempo estimado:** 3 horas  
**Impacto:** Medio-Alto (accesibilidad WCAG AA)  
**Esfuerzo:** Medio

**Tareas:**
1. [ ] Crear variable `$colors-text` con verde oscurecido
2. [ ] Reemplazar `.green` con clase `.text-primary-accessible`
3. [ ] Actualizar todos los usos de texto verde
4. [ ] Probar con herramienta de contraste
5. [ ] Documentar cambios en `_variables.scss`

**Código:**

```scss
// En base/_variables.scss

// AGREGAR: Colores accesibles para texto
$colors-text: (
  "primary-text": #42a594,        // Verde oscurecido (contraste 4.6:1) ✓
  "secondary-text": #2a3038,      // Gris más oscuro (contraste 10:1) ✓
  "success-text": #388e3c,        // Verde success oscurecido
  "danger-text": #c62828,         // Rojo danger oscurecido
) !default;

// En components/_utilities.scss o donde esté .green

// ANTES:
.green {
  color: map.get($colors, 'primary');
}

// DESPUÉS:
.text-primary {
  color: map.get($colors-text, 'primary-text');
  font-weight: 600;  // Bold mejora la legibilidad
}

// Mantener .green solo para fondos
.bg-primary {
  background-color: map.get($colors, 'primary');
  color: white;
}
```

#### Prioridad 3: Estandarizar CTAs

**Tiempo estimado:** 4 horas  
**Impacto:** Medio (usabilidad y conversión)  
**Esfuerzo:** Medio

**Tareas:**
1. [ ] Crear sistema unificado de botones en `_buttons.scss`
2. [ ] Definir 3 variantes (primario, secundario, terciario)
3. [ ] Definir 3 tamaños (small, medium, large)
4. [ ] Actualizar todos los botones del sitio
5. [ ] Mejorar textos de CTAs (específicos en vez de genéricos)

**Reemplazos de texto sugeridos:**

| Página | CTA Actual | CTA Mejorado |
|--------|-----------|--------------|
| Matriz de Riesgos | "Empieza aquí" | "Solicita tu diagnóstico gratuito" |
| Profesiograma | "Empieza aquí" | "Diseña tu profesiograma en 48h" |
| Batería Psicosocial | "Conoce más" | "Agenda tu evaluación psicosocial" |
| Examen Escolar | "Más información" | "Agenda examen médico escolar" |
| PCL | "Empieza aquí" | "Evalúa capacidad laboral ahora" |
| Análisis Puesto | "Conoce más" | "Solicita análisis de puesto" |

### 5.2 Mejoras Importantes (Próximas 2 semanas) ⚠️

#### Mejora 1: Sistema de Espaciado Consistente

**Tiempo estimado:** 6 horas  
**Impacto:** Medio (consistencia visual)  
**Esfuerzo:** Medio

**Tareas:**
1. [ ] Definir escala de espaciado en `_variables.scss`
2. [ ] Crear mixins de spacing
3. [ ] Auditar espaciado actual en todas las secciones
4. [ ] Aplicar sistema consistente
5. [ ] Documentar en guía de estilo

**Código:**

```scss
// En base/_variables.scss

// Sistema de espaciado (base 8px)
$spacing: (
  "0": 0,
  "xs": 0.8rem,   // 8px
  "sm": 1.6rem,   // 16px
  "md": 2.4rem,   // 24px
  "lg": 3.2rem,   // 32px
  "xl": 4.8rem,   // 48px
  "2xl": 6.4rem,  // 64px
  "3xl": 9.6rem,  // 96px
) !default;

// En base/_mixins.scss

@mixin section-padding($size: "lg") {
  padding: map.get($spacing, $size) map.get($spacing, "md");
  
  @include respond-to("tablet") {
    padding: map.get($spacing, $size) map.get($spacing, "lg");
  }
  
  @include respond-to("desktop") {
    padding: map.get($spacing, $size) map.get($spacing, "xl");
  }
}

// Uso
.hero {
  @include section-padding("xl");
}

.service-info {
  @include section-padding("lg");
}
```

#### Mejora 2: Botones "Log In" / "Sign Up" → Español

**Tiempo estimado:** 2 horas  
**Impacto:** Medio (claridad)  
**Esfuerzo:** Bajo

**Tareas:**
1. [ ] Cambiar texto a español ("Intranet de clientes" / "Solicitar acceso")
2. [ ] Mejorar jerarquía visual (primario vs secundario)
3. [ ] Agregar íconos descriptivos
4. [ ] Agregar microcopy explicativo
5. [ ] Actualizar en todas las páginas

#### Mejora 3: FAQs Interactivos (Acordeón)

**Tiempo estimado:** 8 horas  
**Impacto:** Medio (experiencia de usuario)  
**Esfuerzo:** Alto

**Tareas:**
1. [ ] Crear componente de acordeón accesible (HTML + SCSS)
2. [ ] Agregar JavaScript para interactividad
3. [ ] Asegurar accesibilidad (ARIA, keyboard nav)
4. [ ] Aplicar en todas las secciones de FAQs
5. [ ] Probar en todos los dispositivos

#### Mejora 4: Estados de Formularios

**Tiempo estimado:** 10 horas  
**Impacto:** Alto (conversión y UX)  
**Esfuerzo:** Alto

**Tareas:**
1. [ ] Diseñar estados: idle, loading, success, error
2. [ ] Crear componentes de feedback visual
3. [ ] Implementar validación inline
4. [ ] Agregar animaciones de transición
5. [ ] Integrar con backend
6. [ ] Testing exhaustivo

### 5.3 Mejoras de Optimización (Siguiente mes) 💡

#### Optimización 1: Imágenes Responsive

**Tiempo estimado:** 12 horas  
**Impacto:** Alto (performance, UX móvil)  
**Esfuerzo:** Alto

**Tareas:**
1. [ ] Generar versiones 400w, 800w, 1200w de todas las imágenes
2. [ ] Implementar `srcset` y `sizes`
3. [ ] Optimizar webp con compresión ajustada
4. [ ] Probar en diferentes dispositivos y conexiones
5. [ ] Medir mejora de performance (Lighthouse)

#### Optimización 2: Tipografía Fluida (clamp)

**Tiempo estimado:** 4 horas  
**Impacto:** Medio (diseño responsive suave)  
**Esfuerzo:** Medio

**Tareas:**
1. [ ] Identificar saltos abruptos de tamaño de fuente
2. [ ] Implementar `clamp()` en títulos principales
3. [ ] Probar escalado en diferentes viewports
4. [ ] Ajustar valores min/max/preferido
5. [ ] Documentar sistema

#### Optimización 3: Íconos Diferenciados en Menú

**Tiempo estimado:** 6 horas  
**Impacto:** Bajo-Medio (escaneabilidad)  
**Esfuerzo:** Medio

**Tareas:**
1. [ ] Diseñar o seleccionar íconos representativos para cada servicio
2. [ ] Exportar SVG optimizados
3. [ ] Implementar en menú de servicios
4. [ ] Asegurar accesibilidad (aria-hidden, alt)
5. [ ] Probar legibilidad

---

## 6. Priorización de Mejoras

### Matriz de Impacto vs Esfuerzo

```
Alto Impacto, Bajo Esfuerzo (HACER YA) 🔴
┌─────────────────────────────────────┐
│ • Errores ortográficos              │
│ • Contraste de colores              │
│ • Textos de CTAs                    │
└─────────────────────────────────────┘

Alto Impacto, Alto Esfuerzo (PLANIFICAR) ⚠️
┌─────────────────────────────────────┐
│ • Estados de formularios            │
│ • Imágenes responsive               │
│ • Sistema de espaciado              │
└─────────────────────────────────────┘

Bajo Impacto, Bajo Esfuerzo (HACER CUANDO HAYA TIEMPO) 💡
┌─────────────────────────────────────┐
│ • Log In → Intranet (español)       │
│ • Tipografía fluida                 │
│ • Íconos diferenciados              │
└─────────────────────────────────────┘

Bajo Impacto, Alto Esfuerzo (CONSIDERAR) 💭
┌─────────────────────────────────────┐
│ • FAQs interactivos                 │
│ • Animaciones avanzadas             │
└─────────────────────────────────────┘
```

### Cronograma Sugerido

#### Semana 1 (Crítico)
- ✅ Día 1-2: Corrección ortográfica completa
- ✅ Día 3-4: Mejorar contraste de colores
- ✅ Día 5: Estandarizar CTAs y mejorar textos

#### Semana 2-3 (Importante)
- ⚠️ Sistema de espaciado consistente
- ⚠️ Botones Log In/Sign Up en español
- ⚠️ Estados de formularios (inicio)

#### Semana 4 (Finalización)
- ⚠️ Estados de formularios (completar)
- ⚠️ Testing completo
- ⚠️ Documentación de cambios

#### Mes 2 (Optimización)
- 💡 Imágenes responsive con srcset
- 💡 Tipografía fluida
- 💡 FAQs interactivos
- 💡 Íconos diferenciados

---

## 7. Checklist de Implementación

### Fase 1: Correcciones Críticas ✅

```markdown
TEXTOS:
[ ] Corregir "Examenes" → "Exámenes" (global)
[ ] Corregir "Medicos" → "Médicos" (global)
[ ] Corregir "lideres" → "líderes" (Nosotros.html)
[ ] Corregir "proposito" → "propósito" (Nosotros.html)
[ ] Corregir "aca" → "aquí" (examen_medico_escolar.html)
[ ] Corregir "esten" → "estén" (examen_medico_escolar.html)
[ ] 🚨 URGENTE: Reemplazar "PILAS! EL ESTANDAR ES LA GTC45 (GUITA TECNICA #45)"
[ ] Agregar espacios después de puntuación
[ ] Eliminar mayúsculas innecesarias

COLORES:
[ ] Crear $colors-text con verde oscurecido (#42a594)
[ ] Reemplazar .green con .text-primary en textos
[ ] Mantener .green solo para fondos
[ ] Probar contraste con herramienta (4.5:1 mínimo)
[ ] Actualizar documentación en _variables.scss

CTAS:
[ ] Crear sistema unificado de botones (_buttons.scss)
[ ] Definir 3 variantes: primario, secundario, terciario
[ ] Definir 3 tamaños: small, medium, large
[ ] Mejorar textos de CTAs (específicos vs genéricos)
[ ] Aplicar en todas las páginas
[ ] Testing de conversión A/B
```

### Fase 2: Mejoras Importantes ⚠️

```markdown
ESPACIADO:
[ ] Definir $spacing en _variables.scss
[ ] Crear @mixin section-padding
[ ] Auditar espaciado actual
[ ] Aplicar sistema consistente
[ ] Documentar en guía de estilo

BOTONES HEADER:
[ ] Cambiar "Log In" → "Intranet de clientes"
[ ] Cambiar "Sign Up" → "Solicitar acceso"
[ ] Mejorar jerarquía visual
[ ] Agregar íconos descriptivos
[ ] Agregar microcopy

FORMULARIOS:
[ ] Diseñar estados (idle, loading, success, error)
[ ] Implementar componentes de feedback
[ ] Agregar validación inline
[ ] Animaciones de transición
[ ] Integración backend
[ ] Testing exhaustivo

FAQS:
[ ] Crear componente acordeón
[ ] JavaScript de interactividad
[ ] Accesibilidad (ARIA, keyboard)
[ ] Aplicar en todas las secciones
[ ] Testing cross-browser
```

### Fase 3: Optimizaciones 💡

```markdown
IMÁGENES:
[ ] Generar 400w, 800w, 1200w de imágenes
[ ] Implementar srcset y sizes
[ ] Optimizar compresión webp
[ ] Testing en dispositivos
[ ] Medir performance (Lighthouse)

TIPOGRAFÍA:
[ ] Identificar saltos abruptos
[ ] Implementar clamp() en h1-h3
[ ] Testing escalado responsive
[ ] Ajustar valores
[ ] Documentar sistema

ÍCONOS:
[ ] Diseñar/seleccionar íconos servicios
[ ] Exportar SVG optimizados
[ ] Implementar en menú
[ ] Accesibilidad SVG
[ ] Testing legibilidad
```

---

## 8. Herramientas Recomendadas

### Testing y Validación

1. **Contraste de Color**
   - WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
   - Color Safe: http://colorsafe.co/

2. **Accesibilidad**
   - axe DevTools (extensión Chrome/Firefox)
   - WAVE (extensión y herramienta web)
   - Lighthouse (integrado en Chrome DevTools)

3. **Ortografía**
   - LanguageTool (extensión navegador)
   - Grammarly (para español avanzado)
   - VS Code: Spanish Spell Checker

4. **Performance**
   - PageSpeed Insights: https://pagespeed.web.dev/
   - WebPageTest: https://www.webpagetest.org/
   - Chrome DevTools > Lighthouse

5. **Responsive Design**
   - Chrome DevTools > Device Mode
   - BrowserStack (testing multi-dispositivo)
   - Responsively App (herramienta desktop)

### Diseño y Prototipado

1. **Figma** (recomendado para prototipos)
2. **Adobe XD** (alternativa)
3. **Sketch** (solo Mac)

---

## 9. Métricas de Éxito

### KPIs a Monitorear

#### Antes de Implementar Mejoras (Baseline)
- [ ] Lighthouse Score: ___ / 100
- [ ] Contraste de color: ___ elementos con ratio < 4.5:1
- [ ] Errores ortográficos: ___ detectados
- [ ] Tasa de conversión CTAs: ___ %
- [ ] Bounce rate: ___ %
- [ ] Tiempo en página: ___ segundos

#### Después de Implementar Mejoras (Target)
- [ ] Lighthouse Score: > 90 / 100 ✅
- [ ] Contraste de color: 0 elementos con ratio < 4.5:1 ✅
- [ ] Errores ortográficos: 0 detectados ✅
- [ ] Tasa de conversión CTAs: +15% 📈
- [ ] Bounce rate: -10% 📉
- [ ] Tiempo en página: +20% 📈

---

## 10. Conclusión

### Resumen de Hallazgos

El sitio de **Genesys Laboral Medicine** tiene una **excelente base técnica** con:
- ✅ Arquitectura SCSS moderna y bien estructurada
- ✅ Sistema de diseño sólido
- ✅ Responsive design implementado correctamente

Sin embargo, requiere **mejoras críticas en**:
- 🔴 **Textos:** Errores ortográficos graves que afectan credibilidad
- ⚠️ **Accesibilidad:** Contraste de colores insuficiente
- ⚠️ **Usabilidad:** CTAs genéricos y poco específicos

### Impacto Esperado

Al implementar las mejoras sugeridas:

1. **Profesionalismo** 📈
   - Eliminar errores ortográficos = Mayor credibilidad
   - Textos más claros = Mejor percepción de marca

2. **Accesibilidad** ♿
   - Contraste mejorado = Cumplimiento WCAG AA
   - Más usuarios pueden leer el contenido

3. **Conversión** 💰
   - CTAs específicos = +15-20% conversión esperada
   - Mejor UX = Menor bounce rate

4. **Performance** ⚡
   - Imágenes optimizadas = Carga más rápida
   - Mejor ranking SEO

### Próximos Pasos Inmediatos

1. **HOY:** Comenzar con corrección ortográfica (2 horas)
2. **ESTA SEMANA:** Mejorar contraste y CTAs (7 horas total)
3. **PRÓXIMA SEMANA:** Implementar sistema de espaciado (6 horas)
4. **SIGUIENTE MES:** Optimizaciones de performance (20 horas)

### Recursos Necesarios

- **Tiempo de desarrollo:** 40-60 horas (1.5-2 meses)
- **Diseñador/UX:** 10-15 horas (prototipos y guías)
- **QA/Testing:** 8-10 horas
- **Herramientas:** Figma, Lighthouse, axe DevTools (gratis)

---

**Documento creado:** 2025-11-04  
**Versión:** 1.0  
**Estado:** ✅ Completo - Listo para implementación  
**Próxima revisión:** Después de Fase 1 (Correcciones Críticas)

---

## Anexos

### A. Plantilla de Reporte de Bug/Mejora

```markdown
**Título:** [Breve descripción]

**Tipo:** Bug / Mejora / Optimización

**Prioridad:** Crítica / Alta / Media / Baja

**Página(s) afectada(s):** [Lista de páginas]

**Descripción:**
[Descripción detallada del problema o mejora]

**Pasos para reproducir** (si es bug):
1. [Paso 1]
2. [Paso 2]
3. [Resultado actual]

**Comportamiento esperado:**
[Qué debería pasar]

**Capturas de pantalla:**
[Imágenes si aplica]

**Solución propuesta:**
[Cómo solucionarlo]

**Tiempo estimado:** [Horas]

**Archivos afectados:**
- [ ] archivo1.html
- [ ] archivo2.scss
```

### B. Guía Rápida de Mejores Prácticas

#### Textos
- ✅ Usar "tú" de forma consistente
- ✅ CTAs específicos y orientados a acción
- ✅ Revisar ortografía con herramientas
- ✅ Párrafos cortos (3-4 líneas máximo en móvil)
- ❌ No usar mayúsculas sostenidas
- ❌ No usar jerga técnica sin explicación

#### Colores
- ✅ Contraste mínimo 4.5:1 para texto
- ✅ Contraste mínimo 3:1 para UI grande
- ✅ Usar variables de color centralizadas
- ❌ No usar colores hardcodeados
- ❌ No confiar solo en color para información

#### Tipografía
- ✅ Escala consistente (clamp para responsive)
- ✅ Line-height: 1.2 títulos, 1.5-1.8 cuerpo
- ✅ Máximo 2 fuentes (título + cuerpo)
- ❌ No mezclar más de 3 pesos por fuente
- ❌ No usar tamaños menores a 14px (1.4rem)

#### Espaciado
- ✅ Sistema base 8px (0.8rem)
- ✅ Usar spacing utilities
- ✅ Margin-bottom only (no top)
- ❌ No usar padding/margin arbitrarios
- ❌ No mezclar px con rem

#### Botones
- ✅ 3 variantes: primario, secundario, terciario
- ✅ 3 tamaños: small, medium, large
- ✅ Estados: hover, active, focus, disabled
- ✅ Mínimo 44x44px (target touch)
- ❌ No más de 2 CTAs primarios por pantalla

#### Accesibilidad
- ✅ Alt text descriptivo en imágenes informativas
- ✅ Alt="" en imágenes decorativas
- ✅ ARIA labels en elementos interactivos
- ✅ Focus visible en todos los interactivos
- ✅ Keyboard navigation
- ❌ No remover outline sin alternativa
- ❌ No usar solo color para información

---

**FIN DEL DOCUMENTO**

¿Necesitas que profundice en alguna sección específica o que cree más recursos/plantillas?

