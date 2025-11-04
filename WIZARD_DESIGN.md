# 🎯 DISEÑO COMPLETO - Wizard GTC 45 SG-SST Colombia

**Objetivo**: Crear el mejor wizard conversacional del mundo para diagnóstico de riesgos laborales según GTC 45, diseñado específicamente para Colombia.

**Filosofía**: Conversacional, Inteligente, Guiado, Completo.

---

## 📋 ESTRUCTURA COMPLETA DE DATOS (del formulario actual)

### Por Empresa:
```javascript
{
  nombreEmpresa: string,
  nit: string,
  email: string,
  password: string,
  nombreContacto: string
}
```

### Por Cargo:
```javascript
{
  cargoName: string,              // ✅ Implementado
  area: string,                   // ✅ Implementado
  zona: string,                   // ❌ FALTA
  numTrabajadores: string,        // ✅ Implementado
  descripcionTareas: string,      // ❌ FALTA

  // Toggles especiales (requisitos legales)
  tareasRutinarias: boolean,      // ❌ FALTA
  manipulaAlimentos: boolean,     // ❌ FALTA
  trabajaAlturas: boolean,        // ❌ FALTA (CRÍTICO)
  trabajaEspaciosConfinados: boolean, // ❌ FALTA (CRÍTICO)
  conduceVehiculo: boolean,       // ❌ FALTA (CRÍTICO)

  gesSeleccionados: [...]
}
```

### Por GES:
```javascript
{
  riesgo: string,                 // ✅ Implementado
  ges: string,                    // ✅ Implementado

  controles: {                    // ✅ Implementado
    fuente: string,
    medio: string,
    individuo: string
  },

  niveles: {                      // ❌ FALTA (CRÍTICO!)
    deficiencia: { value: Number },   // ND: 2, 6, 10
    exposicion: { value: Number },    // NE: 1, 2, 3, 4
    consecuencia: { value: Number }   // NC: 10, 25, 60, 100
  }
}
```

---

## 🎨 FLUJO COMPLETO DEL WIZARD

### FASE 1: Setup Inicial (3 pasos)
1. **Bienvenida** ✅
2. **Información Empresa** ✅
3. **Número de Cargos** ✅

### FASE 2: Por Cada Cargo (6-8 pasos × N cargos)

#### Paso A: Información Básica del Cargo
**Campos:**
- Nombre del cargo (autocomplete con IA)
- Área
- **Zona** (nuevo)
- Número de trabajadores
- **Descripción de tareas** (textarea - nuevo)

**IA Inteligente:**
- Autocompletar cargo desde base de datos
- **Detectar si cargo similar ya fue ingresado**: "¿'Operario 2' es similar a 'Operario 1'? [Copiar todo] [Empezar desde cero]"

#### Paso B: Características Especiales del Cargo
**Campos (checkboxes):**
- ☐ Tareas rutinarias (Sí/No)
- ☐ Manipula alimentos
- ☐ Trabaja en alturas
- ☐ Trabaja en espacios confinados
- ☐ Conduce vehículo

**IA Inteligente:**
- Inferir del nombre del cargo: "Detectamos 'Conductor' en el cargo. ¿Conduce vehículo? [Sí] [No]"
- Explicar requisitos legales: "⚠️ Trabajo en alturas requiere: Res. 1409/2012..."

#### Paso C: Selección de GES (Riesgos)
**Interfaz:**
- Grid de checkboxes por categorías (como formulario actual)
- **Chips de sugerencias IA** basados en cargo

**IA Inteligente:**
- Sugerir GES comunes del cargo
- **Detectar GES duplicados entre cargos**: "Ya ingresaste 'Riesgo Mecánico - Máquinas' en 'Operario 1'. ¿Es igual? [Copiar controles y niveles] [Configurar nuevo]"

#### Paso D: Controles por GES (repetir por cada GES seleccionado)
**Campos:**
- Control en la Fuente (textarea)
- Control en el Medio (textarea)
- Control en el Individuo (textarea)

**IA Inteligente:**
- Sugerir controles estándar por tipo de riesgo
- **Detectar controles duplicados**: "Este control es similar al que usaste en otro GES. ¿Reutilizar?"
- Botones "Aplicar" para insertar sugerencias

#### Paso E: Niveles de Riesgo (ND, NE, NC) - **NUEVO PASO CRÍTICO**
**Interfaz:**
```
┌─────────────────────────────────────────────────┐
│ 🎯 Niveles de Riesgo: Máquinas sin guardas     │
├─────────────────────────────────────────────────┤
│                                                 │
│ 1️⃣ Nivel de Deficiencia (ND)                   │
│    ¿Qué tan buenos son los controles actuales? │
│                                                 │
│    ○ Muy deficiente (10)                        │
│    ● Deficiente (6)           ← seleccionado    │
│    ○ Mejorable (2)                              │
│                                                 │
│    💡 Deficiente: Controles existen pero son    │
│       insuficientes o no se aplican bien        │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ 2️⃣ Nivel de Exposición (NE)                    │
│    ¿Con qué frecuencia están expuestos?         │
│                                                 │
│    ○ Continua (4)                               │
│    ● Frecuente (3)            ← seleccionado    │
│    ○ Ocasional (2)                              │
│    ○ Esporádica (1)                             │
│                                                 │
│    💡 Frecuente: Varias veces al día            │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ 3️⃣ Nivel de Consecuencia (NC)                  │
│    ¿Qué tan grave sería un accidente?           │
│                                                 │
│    ○ Mortal/Catastrófico (100)                  │
│    ● Muy grave (60)           ← seleccionado    │
│    ○ Grave (25)                                 │
│    ○ Leve (10)                                  │
│                                                 │
│    💡 Muy grave: Lesiones graves, incapacidad   │
│       permanente parcial                        │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ 📊 CÁLCULO AUTOMÁTICO (GTC 45)                  │
│                                                 │
│ NP = ND × NE = 6 × 3 = 18                       │
│ Nivel de Probabilidad: ALTO                     │
│                                                 │
│ NR = NP × NC = 18 × 60 = 1,080                  │
│ Nivel de Riesgo: I (CRÍTICO) 🔴                 │
│                                                 │
│ ⚠️ ACCIÓN REQUERIDA SEGÚN GTC 45:               │
│ • Suspender actividades hasta corregir         │
│ • Implementar controles inmediatos              │
│ • EPP obligatorio                               │
│ • Exámenes médicos cada 6 meses                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

**IA Inteligente:**
- Calcular NP y NR **en tiempo real** mientras selecciona
- Explicar interpretación según GTC 45
- Guiar acciones requeridas según el nivel
- **Validar inconsistencias**: "NR=1080 (Crítico) pero controles='Ninguno'. ¿Seguro?"

### FASE 3: Revisión Final (1 paso)
**Mostrar:**
- Resumen de empresa
- Estadísticas: N cargos, M trabajadores, X riesgos
- Lista de cargos con:
  - Riesgos identificados
  - Nivel de riesgo máximo
  - Controles críticos pendientes

**IA Inteligente:**
- **Validación global**: "⚠️ 3 cargos tienen 'Riesgo de tránsito' pero ninguno marcó que conduce. ¿Revisar?"
- **Análisis de completitud**: "✓ 100% completo" o "⚠️ Faltan niveles en 2 GES"

---

## 🤖 CAPACIDADES DE IA (Asistente Inteligente)

### 1. Sugerencias Proactivas
```javascript
// Endpoint: /api/ia/suggest-ges
// Ya implementado ✅
{
  cargoName: "Operario de producción",
  sector: "manufactura"
}
→ ["Riesgo Mecánico (95%)", "Riesgo Físico - Ruido (90%)"]
```

### 2. Copiar Entre Cargos Similares (NUEVA FUNCIONALIDAD)
```javascript
// Endpoint: /api/ia/detect-similar-cargo
{
  cargoName: "Operario 2",
  existingCargos: ["Operario 1", "Supervisor", "Gerente"]
}
→ {
  isSimilar: true,
  similarTo: "Operario 1",
  confidence: 95,
  suggestion: "Copiar todos los riesgos y controles de 'Operario 1'?"
}
```

### 3. Detectar GES Duplicados (NUEVA FUNCIONALIDAD)
```javascript
// Endpoint: /api/ia/detect-duplicate-ges
{
  currentCargo: "Operario 2",
  currentGES: "Riesgo Mecánico - Máquinas",
  allCargos: [...]
}
→ {
  isDuplicate: true,
  foundIn: "Operario 1",
  existingData: {
    controles: { fuente: "...", medio: "...", individuo: "..." },
    niveles: { deficiencia: 6, exposicion: 3, consecuencia: 60 }
  },
  suggestion: "Reutilizar configuración de 'Operario 1'?"
}
```

### 4. Validación Inteligente (NUEVA FUNCIONALIDAD)
```javascript
// Endpoint: /api/ia/validate-consistency
{
  cargo: {
    cargoName: "Gerente",
    conduceVehiculo: false,
    gesSeleccionados: [
      { riesgo: "Riesgo de tránsito", ges: "Accidentes vehiculares" }
    ]
  }
}
→ {
  isConsistent: false,
  warnings: [
    {
      type: "toggle_ges_mismatch",
      message: "Tiene 'Riesgo de tránsito' pero no marcó que conduce. ¿Es pasajero frecuente o realmente conduce?",
      suggestions: [
        "Si conduce: marcar toggle 'Conduce vehículo'",
        "Si es pasajero ocasional: considerar eliminar este riesgo o ajustar NE a 'Esporádica'"
      ]
    }
  ]
}
```

### 5. Calculadora NP/NR en Tiempo Real (NUEVA FUNCIONALIDAD)
```javascript
// Endpoint: /api/ia/calculate-npnr
{
  nd: 6,
  ne: 3,
  nc: 60
}
→ {
  np: {
    valor: 18,
    nivel: "ALTO",
    interpretacion: "Situación crítica, corrección urgente"
  },
  nr: {
    valor: 1080,
    nivel: "I",
    interpretacion: "Situación crítica, corrección inmediata",
    aceptabilidad: "No aceptable"
  },
  actions: [
    "Suspender actividades hasta implementar controles",
    "EPP obligatorio",
    "Exámenes médicos cada 6 meses"
  ],
  normativa: "Según GTC 45-2012, metodología de evaluación cuantitativa"
}
```

---

## 🎨 DISEÑO DE PASOS NUEVOS

### Paso: Información Básica del Cargo (MEJORADO)

```javascript
export const cargoInfoStepComplete = {
  id: 'cargo-info',
  title: 'Información del Cargo',

  render: (data = {}) => html`
    <h2>🏢 Información del Cargo ${cargoIndex + 1} de ${totalCargos}</h2>

    ${similarCargoDetected ? html`
      <div class="ai-suggestion-banner">
        <span class="icon">🤖</span>
        <div class="message">
          <strong>Cargo similar detectado</strong>
          <p>"${similarCargoName}" parece similar a "${data.cargoName}".
             ¿Copiar todos los riesgos y controles?</p>
        </div>
        <div class="actions">
          <button @click=${copySimilarCargo}>Sí, copiar todo</button>
          <button @click=${dismissSuggestion}>No, empezar desde cero</button>
        </div>
      </div>
    ` : ''}

    <div class="form-fields">
      <div class="field">
        <label>Nombre del cargo *</label>
        <input
          type="text"
          name="cargoName"
          value="${data.cargoName || ''}"
          placeholder="Ej: Operario de producción"
          @input=${handleAutocomplete}
        />
        <div id="autocomplete-suggestions"></div>
      </div>

      <div class="field-group">
        <div class="field">
          <label>Área *</label>
          <input type="text" name="area" value="${data.area || ''}" />
        </div>
        <div class="field">
          <label>Zona *</label>
          <input
            type="text"
            name="zona"
            value="${data.zona || ''}"
            placeholder="Ej: Planta 1, Oficina central"
          />
        </div>
      </div>

      <div class="field">
        <label>Número de trabajadores *</label>
        <input type="number" name="numTrabajadores" value="${data.numTrabajadores || ''}" />
      </div>

      <div class="field">
        <label>Descripción de tareas *</label>
        <textarea
          name="descripcionTareas"
          rows="4"
          placeholder="Describa las principales tareas y responsabilidades..."
        >${data.descripcionTareas || ''}</textarea>
        <p class="hint">Detallar actividades rutinarias y no rutinarias</p>
      </div>
    </div>
  `,

  validate: (data) => {
    const errors = [];
    if (!data.cargoName || data.cargoName.length < 3)
      errors.push({ field: 'cargoName', message: 'Nombre del cargo requerido' });
    if (!data.area)
      errors.push({ field: 'area', message: 'Área requerida' });
    if (!data.zona)
      errors.push({ field: 'zona', message: 'Zona requerida' });
    if (!data.numTrabajadores || data.numTrabajadores < 1)
      errors.push({ field: 'numTrabajadores', message: 'Número de trabajadores requerido' });
    if (!data.descripcionTareas || data.descripcionTareas.length < 20)
      errors.push({ field: 'descripcionTareas', message: 'Describa las tareas (mínimo 20 caracteres)' });

    return { isValid: errors.length === 0, errors };
  }
};
```

### Paso: Toggles Especiales (NUEVO)

```javascript
export const togglesEspecialesStep = {
  id: 'toggles-especiales',
  title: 'Características Especiales',

  render: (data = {}, cargoName) => html`
    <h2>⚡ Características Especiales: ${cargoName}</h2>
    <p>Marca las que apliquen según la normatividad colombiana de SG-SST:</p>

    <div class="toggles-grid">
      <label class="toggle-card ${data.tareasRutinarias ? 'checked' : ''}">
        <input
          type="checkbox"
          name="tareasRutinarias"
          ?checked=${data.tareasRutinarias}
        />
        <div class="toggle-content">
          <div class="icon">🔄</div>
          <h3>Tareas Rutinarias</h3>
          <p>Actividades que se realizan regularmente como parte del proceso normal</p>
        </div>
      </label>

      <label class="toggle-card ${data.manipulaAlimentos ? 'checked' : ''}">
        <input
          type="checkbox"
          name="manipulaAlimentos"
          ?checked=${data.manipulaAlimentos}
        />
        <div class="toggle-content">
          <div class="icon">🍽️</div>
          <h3>Manipula Alimentos</h3>
          <p>Res. 2674/2013 - Requiere certificación y exámenes específicos</p>
        </div>
      </label>

      <label class="toggle-card ${data.trabajaAlturas ? 'checked' : ''} critical">
        <input
          type="checkbox"
          name="trabajaAlturas"
          ?checked=${data.trabajaAlturas}
        />
        <div class="toggle-content">
          <div class="icon">🪜</div>
          <h3>Trabaja en Alturas</h3>
          <p class="critical-label">⚠️ REQUISITO LEGAL</p>
          <p>Res. 1409/2012 y 4272/2021 - Certificación y exámenes anuales obligatorios</p>
        </div>
      </label>

      <label class="toggle-card ${data.trabajaEspaciosConfinados ? 'checked' : ''} critical">
        <input
          type="checkbox"
          name="trabajaEspaciosConfinados"
          ?checked=${data.trabajaEspaciosConfinados}
        />
        <div class="toggle-content">
          <div class="icon">🚪</div>
          <h3>Espacios Confinados</h3>
          <p class="critical-label">⚠️ REQUISITO LEGAL</p>
          <p>Res. 491/2020 - Permiso de trabajo y monitoreo atmosférico</p>
        </div>
      </label>

      <label class="toggle-card ${data.conduceVehiculo ? 'checked' : ''} critical">
        <input
          type="checkbox"
          name="conduceVehiculo"
          ?checked=${data.conduceVehiculo}
        />
        <div class="toggle-content">
          <div class="icon">🚗</div>
          <h3>Conduce Vehículo</h3>
          <p class="critical-label">⚠️ REQUISITO LEGAL</p>
          <p>Res. 1565/2014 (PESV) - Exámenes psicosensométricos cada 2 años</p>
        </div>
      </label>
    </div>

    ${aiInferredToggles ? html`
      <div class="ai-suggestion">
        <span class="icon">💡</span>
        <p>Detectamos "${cargoName}" - ¿Este cargo conduce vehículo?</p>
      </div>
    ` : ''}
  `,

  validate: () => ({ isValid: true, errors: [] }) // Opcionales
};
```

### Paso: Niveles de Riesgo (NUEVO - CRÍTICO)

```javascript
export const nivelesRiesgoStep = {
  id: 'niveles-riesgo',
  title: 'Niveles de Riesgo',

  render: (data = {}, riesgo, ges) => html`
    <h2>📊 Niveles de Riesgo: ${ges}</h2>
    <p class="subtitle">${riesgo}</p>

    <div class="niveles-container">
      <!-- Nivel Deficiencia -->
      <div class="nivel-section">
        <h3>1️⃣ Nivel de Deficiencia (ND)</h3>
        <p class="question">¿Qué tan buenos son los controles actuales?</p>

        <div class="nivel-options">
          <label class="nivel-option ${data.nd === 10 ? 'selected' : ''}">
            <input type="radio" name="nd" value="10" ?checked=${data.nd === 10} />
            <div class="option-content">
              <span class="value">10</span>
              <span class="label">Muy deficiente</span>
              <p class="description">No existen controles o son completamente inadecuados</p>
            </div>
          </label>

          <label class="nivel-option ${data.nd === 6 ? 'selected' : ''}">
            <input type="radio" name="nd" value="6" ?checked=${data.nd === 6} />
            <div class="option-content">
              <span class="value">6</span>
              <span class="label">Deficiente</span>
              <p class="description">Existen controles pero son insuficientes</p>
            </div>
          </label>

          <label class="nivel-option ${data.nd === 2 ? 'selected' : ''}">
            <input type="radio" name="nd" value="2" ?checked=${data.nd === 2} />
            <div class="option-content">
              <span class="value">2</span>
              <span class="label">Mejorable</span>
              <p class="description">Existen controles y son adecuados pero mejorables</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Nivel Exposición -->
      <div class="nivel-section">
        <h3>2️⃣ Nivel de Exposición (NE)</h3>
        <p class="question">¿Con qué frecuencia están expuestos los trabajadores?</p>

        <div class="nivel-options">
          <label class="nivel-option ${data.ne === 4 ? 'selected' : ''}">
            <input type="radio" name="ne" value="4" ?checked=${data.ne === 4} />
            <div class="option-content">
              <span class="value">4</span>
              <span class="label">Continua</span>
              <p class="description">Permanentemente durante toda la jornada</p>
            </div>
          </label>

          <label class="nivel-option ${data.ne === 3 ? 'selected' : ''}">
            <input type="radio" name="ne" value="3" ?checked=${data.ne === 3} />
            <div class="option-content">
              <span class="value">3</span>
              <span class="label">Frecuente</span>
              <p class="description">Varias veces durante la jornada</p>
            </div>
          </label>

          <label class="nivel-option ${data.ne === 2 ? 'selected' : ''}">
            <input type="radio" name="ne" value="2" ?checked=${data.ne === 2} />
            <div class="option-content">
              <span class="value">2</span>
              <span class="label">Ocasional</span>
              <p class="description">Alguna vez durante la jornada</p>
            </div>
          </label>

          <label class="nivel-option ${data.ne === 1 ? 'selected' : ''}">
            <input type="radio" name="ne" value="1" ?checked=${data.ne === 1} />
            <div class="option-content">
              <span class="value">1</span>
              <span class="label">Esporádica</span>
              <p class="description">Raramente, pocas veces al mes</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Nivel Consecuencia -->
      <div class="nivel-section">
        <h3>3️⃣ Nivel de Consecuencia (NC)</h3>
        <p class="question">¿Qué tan grave sería un accidente?</p>

        <div class="nivel-options">
          <label class="nivel-option ${data.nc === 100 ? 'selected' : ''} critical">
            <input type="radio" name="nc" value="100" ?checked=${data.nc === 100} />
            <div class="option-content">
              <span class="value">100</span>
              <span class="label">Mortal/Catastrófico</span>
              <p class="description">Muerte o múltiples muertes</p>
            </div>
          </label>

          <label class="nivel-option ${data.nc === 60 ? 'selected' : ''} high">
            <input type="radio" name="nc" value="60" ?checked=${data.nc === 60} />
            <div class="option-content">
              <span class="value">60</span>
              <span class="label">Muy grave</span>
              <p class="description">Lesiones graves, incapacidad permanente parcial</p>
            </div>
          </label>

          <label class="nivel-option ${data.nc === 25 ? 'selected' : ''} medium">
            <input type="radio" name="nc" value="25" ?checked=${data.nc === 25} />
            <div class="option-content">
              <span class="value">25</span>
              <span class="label">Grave</span>
              <p class="description">Lesiones con incapacidad temporal</p>
            </div>
          </label>

          <label class="nivel-option ${data.nc === 10 ? 'selected' : ''} low">
            <input type="radio" name="nc" value="10" ?checked=${data.nc === 10} />
            <div class="option-content">
              <span class="value">10</span>
              <span class="label">Leve</span>
              <p class="description">Lesiones superficiales, primeros auxilios</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Calculadora en Tiempo Real -->
      ${data.nd && data.ne && data.nc ? html`
        <div class="calculator-result">
          <h3>📊 Cálculo Automático (GTC 45)</h3>

          <div class="calculation-steps">
            <div class="step">
              <span class="formula">NP = ND × NE</span>
              <span class="result">= ${data.nd} × ${data.ne} = ${npResult.valor}</span>
              <span class="interpretation">Probabilidad: ${npResult.nivel}</span>
            </div>

            <div class="step highlight">
              <span class="formula">NR = NP × NC</span>
              <span class="result">= ${npResult.valor} × ${data.nc} = ${nrResult.valor}</span>
              <span class="interpretation nivel-${nrResult.nivel}">
                Nivel de Riesgo: ${nrResult.nivel} (${nrResult.interpretacion})
              </span>
            </div>
          </div>

          <div class="normativa-guidance">
            <h4>⚠️ Acción Requerida según GTC 45:</h4>
            <ul>
              ${nrResult.actions.map(action => html`<li>${action}</li>`)}
            </ul>
          </div>

          ${nrResult.nivel === 'I' ? html`
            <div class="critical-warning">
              🔴 <strong>SITUACIÓN CRÍTICA</strong> - Acción inmediata requerida
            </div>
          ` : ''}
        </div>
      ` : html`
        <div class="calculator-placeholder">
          <p>💡 Selecciona ND, NE y NC para ver el cálculo automático</p>
        </div>
      `}
    </div>
  `,

  validate: (data) => {
    const errors = [];
    if (!data.nd) errors.push({ field: 'nd', message: 'Seleccione Nivel de Deficiencia' });
    if (!data.ne) errors.push({ field: 'ne', message: 'Seleccione Nivel de Exposición' });
    if (!data.nc) errors.push({ field: 'nc', message: 'Seleccione Nivel de Consecuencia' });
    return { isValid: errors.length === 0, errors };
  },

  onEnter: async function(wizardData) {
    // Detectar si este GES ya fue configurado en otro cargo
    const duplicateResult = await fetchIA('/detect-duplicate-ges', {
      currentGES: ges,
      allCargos: wizardData.cargos
    });

    if (duplicateResult.isDuplicate) {
      // Mostrar banner de sugerencia
      showDuplicateGESBanner(duplicateResult);
    }
  }
};
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Sprint 1: Completar Pasos Básicos (2-3 horas)
- [x] Paso info básica con zona y descripción tareas
- [ ] Paso toggles especiales
- [ ] Endpoints IA: detect-similar-cargo

### Sprint 2: Niveles de Riesgo (3-4 horas)
- [ ] Paso niveles ND/NE/NC con radio buttons
- [ ] Calculadora NP/NR en tiempo real
- [ ] Endpoint IA: calculate-npnr
- [ ] Diseño visual del paso niveles

### Sprint 3: IA Inteligente (2-3 horas)
- [ ] Endpoint: detect-duplicate-ges
- [ ] Endpoint: validate-consistency
- [ ] Lógica de copiar entre cargos similares
- [ ] Banners de sugerencias IA

### Sprint 4: Integración y Testing (2 horas)
- [ ] Integrar con /api/flujo-ia/registrar-y-generar
- [ ] Testing end-to-end completo
- [ ] Validar estructura de datos completa

### Sprint 5: Polish y Documentación (1 hora)
- [ ] Animaciones y transiciones
- [ ] Mensajes de error mejorados
- [ ] Documentación completa

**TOTAL ESTIMADO: 10-13 horas**

---

## ✅ CRITERIOS DE ÉXITO

1. ✅ Wizard completo recoge **100% de los datos** del formulario actual
2. ✅ Estructura de salida **idéntica** al formulario actual
3. ✅ IA sugiere pero **nunca asume** - solo la empresa decide
4. ✅ Experiencia conversacional **fluida y guiada**
5. ✅ Validaciones **inteligentes** detectan inconsistencias
6. ✅ Compatible con backend actual sin cambios
7. ✅ Mantenible y extensible en el tiempo
8. ✅ **El mejor wizard de SG-SST del mundo para Colombia**

---

**Status**: 🎯 Diseño completado - Listo para implementar
**Próximo paso**: Implementar Sprint 1 (completar pasos básicos)
