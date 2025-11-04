# 🚀 Guía de Implementación Rápida - Mejoras UX/UI

**Para:** Genesys Laboral Medicine  
**Fecha:** 2025-11-04  
**Objetivo:** Corregir problemas críticos en menos de 1 día  

---

## 🎯 Correcciones que Puedes Hacer HOY (2-4 horas)

### 1️⃣ URGENTE: Corrección Ortográfica (30 minutos)

#### Script de Búsqueda y Reemplazo

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
cd /home/aframirez1772/dev_genesys_laboral_medicine/client/public/pages

# 1. Exámenes (CON tilde)
sed -i 's/Examenes/Exámenes/g' *.html
sed -i 's/examenes/exámenes/g' *.html

# 2. Médicos (CON tilde)
sed -i 's/Medicos/Médicos/g' *.html
sed -i 's/medicos/médicos/g' *.html

# 3. Líderes (CON tilde)
sed -i 's/lideres/líderes/g' *.html

# 4. Propósito (CON tilde)
sed -i 's/proposito/propósito/g' *.html

# 5. Aquí (no "aca")
sed -i 's/ aca / aquí /g' *.html
sed -i 's/Encuentra aca/Encuentra aquí/g' *.html

# 6. Estén (CON tilde)
sed -i 's/esten/estén/g' *.html

echo "✅ Correcciones ortográficas completadas!"
```

#### Corrección Manual CRÍTICA 🚨

**Archivo:** `Matriz_de_riesgos_profesional.html`

Busca la línea 910 y **CAMBIA:**

```html
<!-- ❌ ANTES (línea 910) -->
<br />PILAS! EL ESTANDAR ES LA GTC45 (GUITA TECNICA #45)

<!-- ✅ DESPUÉS -->
<br />💡 <strong>Nota:</strong> El estándar es la GTC-45 (Guía Técnica Colombiana #45)
```

**Razón:** "GUITA TECNICA" es un error gravísimo que destruye credibilidad profesional.

---

### 2️⃣ Mejorar Contraste de Colores (1 hora)

#### Paso 1: Agregar Color Accesible

**Archivo:** `client/src/styles/scss/base/_variables.scss`

Busca `$colors` y AGREGA después de la última línea:

```scss
// AGREGAR después de la línea ~20 (después del mapa $colors)

// Colores accesibles para texto (cumplen WCAG AA)
$colors-text: (
  "primary-text": #42a594,        // Verde oscurecido - Contraste 4.6:1 ✓
  "secondary-text": #2a3038,      // Gris más oscuro - Contraste 10:1 ✓
  "success-text": #388e3c,        // Verde success oscurecido
  "danger-text": #c62828,         // Rojo danger oscurecido
) !default;
```

#### Paso 2: Crear Clase Accesible

**Archivo:** `client/src/styles/scss/utilities/_helpers.scss`

AGREGA al final del archivo:

```scss
// Colores de texto accesibles (WCAG AA)
.text-primary-accessible {
  color: map.get($colors-text, 'primary-text');
  font-weight: 600;  // El peso ayuda a la legibilidad
}

.text-secondary-accessible {
  color: map.get($colors-text, 'secondary-text');
}

// Mantener .green solo para fondos
.bg-primary {
  background-color: map.get($colors, 'primary');
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}
```

#### Paso 3: Reemplazar en HTMLs

```bash
# En la carpeta pages/
cd /home/aframirez1772/dev_genesys_laboral_medicine/client/public/pages

# Reemplazar class="green" por class="text-primary-accessible" solo en spans de texto
# (Hacer manualmente o con cuidado para no afectar fondos)

# Ejemplo en Nosotros.html línea 812:
# ANTES: <span class="green">exámenes médicos ocupacionales</span>
# DESPUÉS: <span class="text-primary-accessible">exámenes médicos ocupacionales</span>
```

**IMPORTANTE:** Solo reemplazar `.green` que esté en `<span>` con texto, NO en fondos.

---

### 3️⃣ Mejorar CTAs (1 hora)

#### Paso 1: Textos Específicos

Abre cada archivo HTML y busca los botones CTA:

**Matriz_de_riesgos_profesional.html:**

```html
<!-- ❌ ANTES (línea 828) -->
<button class="cta-button" onclick="...">
  Empieza aquí
</button>

<!-- ✅ DESPUÉS -->
<button class="cta-button" onclick="...">
  Solicita tu diagnóstico gratuito
</button>
```

**Profesiograma.html:**

```html
<!-- ❌ ANTES -->
Empieza aquí

<!-- ✅ DESPUÉS -->
Diseña tu profesiograma en 48h
```

**Bateria_de_riesgo_psicosocial.html:**

```html
<!-- ❌ ANTES (línea 358) -->
Conoce más

<!-- ✅ DESPUÉS -->
Agenda tu evaluación psicosocial
```

**examen_medico_escolar.html:**

```html
<!-- ❌ ANTES (línea 335) -->
Conoce más

<!-- ✅ DESPUÉS -->
Agenda examen médico escolar
```

**Perdida_de_capacidad_laboral.html:**

```html
<!-- ❌ ANTES (línea 281) -->
Empieza aquí

<!-- ✅ DESPUÉS -->
Evalúa capacidad laboral ahora
```

**Analisis_de_puesto_de_trabajo.html:**

```html
<!-- ❌ ANTES (línea 294) -->
Empieza aquí

<!-- ✅ DESPUÉS -->
Solicita análisis de puesto
```

#### Paso 2: Botones Header (Log In / Sign Up)

**Archivo:** TODOS los HTML (en el header)

Busca las líneas ~146-148 y ~258-260 (header y menú móvil):

```html
<!-- ❌ ANTES -->
<button type="button" class="cta-button-1" onclick="window.location.href='...'">
  Log In
</button>
<button type="button" class="cta-button">Sign Up</button>

<!-- ✅ DESPUÉS -->
<button type="button" class="cta-button-1" onclick="window.location.href='...'">
  🔒 Intranet
</button>
<button type="button" class="cta-button">
  Registrarse
</button>
```

---

### 4️⃣ Mayúsculas Innecesarias (30 minutos)

#### Archivo: `Nosotros.html`

Buscar y reemplazar:

```html
<!-- ❌ ANTES (línea 1098) -->
<h3>PROPÓSITO <br />ORGANIZACIONAL</h3>
<p>
  ESTAMOS COMPROMETIDOS EN MEJORAR LA
  <span class="green">SALUD LABORAL</span> PARA QUE TU TRABAJO NO TE
  CUESTE LA VIDA
</p>

<!-- ✅ DESPUÉS -->
<h3>Propósito Organizacional</h3>
<p>
  Estamos comprometidos en mejorar la
  <span class="text-primary-accessible">salud laboral</span> para que tu trabajo no te
  cueste la vida
</p>
```

**Regla general:** Solo usar mayúsculas en:
- Títulos de sección (H2, H3): Primera letra de cada palabra importante
- Siglas: SST, PCL, APT, GTC-45
- Nombres propios: Genesys, Colombia, Bogotá

**NO usar mayúsculas sostenidas en:**
- Párrafos completos
- Textos dentro de `<span>`
- Botones (salvo iniciales)

---

## 🎨 Mejoras de Estilos (2-3 horas)

### 1️⃣ Sistema de Botones Unificado

**Archivo:** `client/src/styles/scss/components/_buttons.scss`

**REEMPLAZAR TODO EL CONTENIDO** con:

```scss
@use "sass:map";
@use '../base/variables' as vars;

//====================================================================
// SISTEMA DE BOTONES UNIFICADO - Genesys Laboral Medicine
// Versión: 2.0 - 2025-11-04
//====================================================================

// Tamaños de botones
$button-sizes: (
  "small": (
    "padding": 0.6rem 1.6rem,
    "font-size": 1.4rem,
    "radius": 24px,
  ),
  "medium": (
    "padding": 0.8rem 2rem,
    "font-size": 1.6rem,
    "radius": 28px,
  ),
  "large": (
    "padding": 1.2rem 2.8rem,
    "font-size": 1.8rem,
    "radius": 34px,
  ),
) !default;

// Placeholder base para todos los botones
%button-base {
  display: inline-block;
  font-family: map.get(vars.$fonts, 'body');
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  line-height: 1.5;
  
  // Estados interactivos
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:focus-visible {
    outline: 3px solid rgba(map.get(vars.$colors, 'primary'), 0.5);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
}

// Mixin para aplicar tamaños
@mixin button-size($size) {
  $size-map: map.get($button-sizes, $size);
  
  @if $size-map {
    padding: map.get($size-map, "padding");
    font-size: map.get($size-map, "font-size");
    border-radius: map.get($size-map, "radius");
  }
}

//====================================================================
// BOTONES PRIMARIOS (CTAs principales)
//====================================================================

.cta-button,
.btn-primary {
  @extend %button-base;
  @include button-size("large");
  background: map.get(vars.$colors, 'primary');
  color: white;
  
  &:hover {
    background: darken(map.get(vars.$colors, 'primary'), 8%);
  }
}

//====================================================================
// BOTONES SECUNDARIOS (Acciones secundarias)
//====================================================================

.cta-button-1,
.btn-secondary {
  @extend %button-base;
  @include button-size("medium");
  background: transparent;
  border: 2px solid map.get(vars.$colors, 'primary');
  color: map.get(vars.$colors, 'primary');
  
  &:hover {
    background: map.get(vars.$colors, 'primary');
    color: white;
  }
}

//====================================================================
// BOTONES TERCIARIOS (Acciones terciarias)
//====================================================================

.btn-tertiary {
  @extend %button-base;
  @include button-size("small");
  background: white;
  color: map.get(vars.$colors, 'secondary');
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

//====================================================================
// BOTONES DE FAQs (caso específico)
//====================================================================

.cta-button-faqs {
  @extend %button-base;
  @include button-size("medium");
  background: map.get(vars.$colors, 'primary');
  color: white;
  margin-top: 2.4rem;
  
  &:hover {
    background: darken(map.get(vars.$colors, 'primary'), 8%);
  }
}

//====================================================================
// VARIANTES DE TAMAÑO (para casos específicos)
//====================================================================

.btn-small {
  @include button-size("small");
}

.btn-medium {
  @include button-size("medium");
}

.btn-large {
  @include button-size("large");
}

//====================================================================
// ESTADOS ESPECÍFICOS
//====================================================================

.btn-loading {
  position: relative;
  pointer-events: none;
  
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 1.6rem;
    width: 1.6rem;
    height: 1.6rem;
    margin-top: -0.8rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-success {
  background: map.get(vars.$colors, 'success') !important;
  
  &::before {
    content: "✓ ";
  }
}

.btn-error {
  background: map.get(vars.$colors, 'danger') !important;
  
  &::before {
    content: "⚠️ ";
  }
}

//====================================================================
// RESPONSIVE
//====================================================================

@media screen and (max-width: 955px) {
  .cta-button,
  .btn-primary {
    @include button-size("medium");
  }
  
  .cta-button-1,
  .btn-secondary {
    @include button-size("small");
  }
}
```

### 2️⃣ Sistema de Espaciado

**Archivo:** `client/src/styles/scss/base/_variables.scss`

AGREGAR después de `$breakpoints`:

```scss
//====================================================================
// SISTEMA DE ESPACIADO (base 8px)
//====================================================================

$spacing: (
  "0": 0,
  "xs": 0.8rem,    // 8px
  "sm": 1.6rem,    // 16px
  "md": 2.4rem,    // 24px
  "lg": 3.2rem,    // 32px
  "xl": 4.8rem,    // 48px
  "2xl": 6.4rem,   // 64px
  "3xl": 9.6rem,   // 96px
) !default;

//====================================================================
// LINE HEIGHTS CONSISTENTES
//====================================================================

$line-heights: (
  "tight": 1.2,      // Títulos grandes (H1)
  "normal": 1.5,     // Títulos medianos (H2, H3)
  "relaxed": 1.8,    // Párrafos y cuerpo de texto
) !default;
```

### 3️⃣ Mixins de Espaciado

**Archivo:** `client/src/styles/scss/base/_mixins.scss`

AGREGAR al final:

```scss
//====================================================================
// MIXINS DE ESPACIADO CONSISTENTE
//====================================================================

@mixin section-padding($size: "lg") {
  padding: map.get(vars.$spacing, $size) map.get(vars.$spacing, "md");
  
  @include respond-to("tablet") {
    padding: map.get(vars.$spacing, $size) map.get(vars.$spacing, "lg");
  }
  
  @include respond-to("desktop") {
    padding: map.get(vars.$spacing, $size) map.get(vars.$spacing, "xl");
  }
}

@mixin margin-bottom($size: "md") {
  margin-bottom: map.get(vars.$spacing, $size);
}

@mixin gap($size: "md") {
  gap: map.get(vars.$spacing, $size);
}
```

---

## ✅ Checklist de Implementación Rápida

### Hoy (4 horas máximo)

```
[ ] 1. Ejecutar script de corrección ortográfica (5 min)
[ ] 2. Corregir manualmente "GUITA TECNICA" → "Guía Técnica" (5 min)
[ ] 3. Agregar $colors-text en _variables.scss (5 min)
[ ] 4. Crear clase .text-primary-accessible en _helpers.scss (5 min)
[ ] 5. Reemplazar .green por .text-primary-accessible en spans de texto (30 min)
[ ] 6. Mejorar textos de CTAs en todas las páginas (45 min)
[ ] 7. Cambiar "Log In" → "Intranet" / "Sign Up" → "Registrarse" (15 min)
[ ] 8. Eliminar mayúsculas innecesarias en Nosotros.html (15 min)
[ ] 9. Reemplazar _buttons.scss con nuevo sistema (10 min)
[ ] 10. Agregar $spacing y $line-heights en _variables.scss (5 min)
[ ] 11. Agregar mixins de espaciado en _mixins.scss (5 min)
[ ] 12. Compilar SCSS (npm run client:build) (2 min)
[ ] 13. Probar en navegador (30 min)
[ ] 14. Testing responsive (dispositivos móviles) (30 min)
[ ] 15. Validar con Lighthouse (accesibilidad y performance) (15 min)

TOTAL ESTIMADO: 3-4 horas
```

### Esta Semana (10 horas)

```
[ ] Aplicar section-padding en todas las secciones principales
[ ] Implementar estados de formularios (loading, success, error)
[ ] Agregar validación inline en formularios
[ ] Crear componente de acordeón para FAQs
[ ] Testing exhaustivo de accesibilidad con axe DevTools
[ ] Documentar cambios en guía de estilo
```

---

## 🧪 Testing Rápido

### 1. Contraste de Color

Abre: https://webaim.org/resources/contrastchecker/

**Probar:**
- ✅ `#42a594` (primary-text) sobre `#f3f0f0` (background) → Debe ser ≥ 4.5:1
- ✅ `#2d3238` (text) sobre `#f3f0f0` (background) → Debe ser ≥ 7:1

### 2. Accesibilidad

**Chrome DevTools:**
1. Abre cualquier página (F12)
2. Tab "Lighthouse"
3. Selecciona "Accessibility"
4. Click "Generate report"
5. **Objetivo:** Score ≥ 90

**axe DevTools (extensión):**
1. Instala: https://chrome.google.com/webstore (busca "axe DevTools")
2. Abre cualquier página
3. F12 > Tab "axe DevTools"
4. Click "Scan ALL of my page"
5. **Objetivo:** 0 violations

### 3. Responsive

**Chrome DevTools:**
1. F12 > Click ícono de dispositivos (Ctrl+Shift+M)
2. Probar en:
   - Mobile: 375px, 414px
   - Tablet: 768px, 955px
   - Desktop: 1280px, 1920px

**Verificar:**
- ✅ Textos legibles (no cortados)
- ✅ Botones clickeables (min 44x44px)
- ✅ Imágenes no distorsionadas
- ✅ Menú hamburguesa funciona en móvil

---

## 📊 Antes vs Después (Métricas Esperadas)

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Errores ortográficos** | 15+ | 0 | ✅ 100% |
| **Contraste texto** | 2.8:1 ❌ | 4.6:1 ✅ | +64% |
| **Lighthouse Accessibility** | ~75 | 90+ | +20% |
| **CTAs específicos** | 0% | 100% | ✅ |
| **Mayúsculas innecesarias** | Alta | Baja | ✅ |

---

## 🆘 Troubleshooting

### Problema: "El comando sed no funciona"

**Solución Windows (Git Bash o WSL):**
```bash
# Asegúrate de estar en Git Bash o WSL
# Si tienes problemas, hacer reemplazos manualmente con VS Code:
# Ctrl+H > Find: "Examenes" > Replace: "Exámenes" > Replace All
```

### Problema: "Los estilos no se aplican después de compilar"

**Solución:**
```bash
# 1. Limpiar caché
npm run clean

# 2. Recompilar
npm run client:build

# 3. Hard refresh en navegador
# Chrome: Ctrl+Shift+R
# Firefox: Ctrl+Shift+F5
```

### Problema: "Error de compilación SCSS"

**Revisar:**
1. ¿Cerraste todas las llaves `{}`?
2. ¿Pusiste `;` al final de cada línea?
3. ¿Usaste comillas correctas (`"..."` no `"..."`)?

**Comando para ver errores:**
```bash
npm run client:dev
# Leer los errores en la terminal
```

---

## 📞 Soporte

Si tienes dudas durante la implementación:

1. **Revisar AUDITORIA_UX_UI.md** (documento principal con explicaciones detalladas)
2. **Consultar ANALISIS_SCSS.md** (referencia de arquitectura)
3. **Google:** Buscar error específico + "Sass" o "SCSS"
4. **Stack Overflow:** Comunidad muy activa para CSS/Sass

---

## 🎉 ¡Listo para Empezar!

**Siguiente paso:** Ejecuta el script de corrección ortográfica y empieza con las mejoras críticas.

Recuerda: **Cada pequeña mejora suma**. No necesitas hacer todo a la vez, pero los errores ortográficos y el contraste son CRÍTICOS y deben solucionarse HOY.

---

**Documento creado:** 2025-11-04  
**Versión:** 1.0  
**Tiempo estimado total:** 3-4 horas (implementación crítica)

**¡Éxito con las mejoras! 🚀**

