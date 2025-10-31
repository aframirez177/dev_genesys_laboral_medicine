Perfecto Álvaro, te ayudo a responder cada pregunta fundamentada en la normatividad vigente y mejores prácticas. Voy a estructurar las respuestas de manera práctica para tu implementación:

---

## RESPUESTAS A LAS 18 PREGUNTAS CRÍTICAS

### 1. **Fundamento Legal y Normativo**

**Respuesta:**
- La Resolución 1843 de 2025 establece que las evaluaciones médicas deben estar justificadas según la exposición a riesgos, pero no exime controles por nivel bajo
- La GTC-45 indica que TODOS los riesgos identificados deben gestionarse según su valoración, pero la intensidad del control es proporcional
- **Exámenes SIEMPRE obligatorios por ley:**
  - Evaluación médica de ingreso (básica para todos)
  - Audiometría si hay exposición a ruido ≥80 dB (independiente del nivel)
  - Evaluación de alturas si trabaja en alturas (Resolución 1409/2012)
  - Visiometría para conductores
  - Psicosensométrica para conductores

**Recomendación:** Mantener un "paquete mínimo obligatorio" que NO dependa de NP/NR.

---

### 2. **Nivel de Decisión: ¿NP o NR?**

**Respuesta:** Debe basarse en **NR (Nivel de Riesgo)**, NO solo en NP.

**Justificación:**
- NR = NP × NC (considera probabilidad Y consecuencias)
- Un riesgo con NP Bajo pero NC Mortal/Muy Alto = NR que SÍ requiere controles
- Ejemplo: Trabajo ocasional en alturas
  - ND=2, NE=1 → NP=2 (Bajo)
  - Pero NC=100 (Mortal) → NR=200 (Alto)
  - **SÍ requiere EMOA, EPP, capacitación**

**Recomendación:** Usa NR como criterio principal, con esta tabla:

| NR | Nivel | Acción |
|---|---|---|
| I (4-40) | Aceptable | Examen ingreso + básico. EPP opcional |
| II (41-120) | Aceptable con control | Exámenes periódicos cada 2-3 años. EPP recomendado |
| III (121-500) | Mejorable | Exámenes anuales. EPP obligatorio |
| IV (501+) | No aceptable | Exámenes semestrales. EPP + controles ingeniería |

---

### 3. **Gradualidad de Controles**

**Respuesta:** SÍ debe ser gradual, NO todo-o-nada.

**Propuesta de Gradualidad:**

```javascript
// Lógica propuesta
const getControlesPorNR = (nr) => {
  if (nr >= 501) { // IV - Crítico
    return {
      epp: true,
      examenes: true,
      periodicidad: '6 meses',
      aptitudes: true,
      condicionesIncompatibles: true,
      controles: 'Todos + ingeniería + administrativos'
    }
  } else if (nr >= 121) { // III - Alto
    return {
      epp: true,
      examenes: true,
      periodicidad: '1 año',
      aptitudes: true,
      condicionesIncompatibles: true,
      controles: 'EPP + capacitación + señalización'
    }
  } else if (nr >= 41) { // II - Medio
    return {
      epp: true, // Recomendado pero no crítico
      examenes: true,
      periodicidad: '2 años',
      aptitudes: false, // Solo si toggle especial
      condicionesIncompatibles: false,
      controles: 'EPP recomendado + capacitación básica'
    }
  } else { // I - Bajo
    return {
      epp: false, // No requerido
      examenes: 'Solo ingreso',
      periodicidad: '3 años',
      aptitudes: false,
      condicionesIncompatibles: false,
      controles: 'Sensibilización general'
    }
  }
}
```

---

### 4. **Paquete Mínimo Universal**

**Respuesta:** SÍ existe un paquete mínimo que SIEMPRE aplica.

**Paquete Mínimo Obligatorio (independiente de NR):**
- Historia clínica ocupacional completa
- Examen físico básico
- Medidas antropométricas
- Visiometría básica (agudeza visual)
- **Estos 4 van en TODAS las evaluaciones de ingreso**

**Condicional según toggles especiales:**
- `trabajaEnAlturas` → EMOA + examen de laboratorio clínico
- `manejaAlimentos` → Coprológico + KOH uñas
- `conduceVehiculo` → Psicosensométrica + visiometría completa
- `expuestoRuido` (≥80 dB independiente de NR) → Audiometría

**Recomendación:** Crear en `ges-config.js`:

```javascript
const PAQUETE_MINIMO_UNIVERSAL = {
  examenes: ['EMO_BASICA', 'VISIOMETRIA_BASICA'],
  aptitudes: ['AGUDEZA_VISUAL_NORMAL', 'COORDINACION_BASICA'],
  periodicidad: '3 años' // Si no hay otros GES con mayor exigencia
}
```

---

### 5. **Múltiples GES por Cargo**

**Respuesta:** **"El más restrictivo gana"** (principio de máxima protección).

**Lógica de Resolución:**

```javascript
// Pseudocódigo
function consolidarControlesPorCargo(gesDelCargo) {
  const controles = {
    epp: new Set(),
    examenes: new Set(),
    aptitudes: new Set(),
    condicionesIncompatibles: new Set(),
    periodicidadMinima: 36 // meses
  }

  gesDelCargo.forEach(ges => {
    const nr = calcularNR(ges)
    const controlesGes = getControlesPorNR(nr)
    
    // Acumular EPPs y exámenes
    controlesGes.epp.forEach(epp => controles.epp.add(epp))
    controlesGes.examenes.forEach(ex => controles.examenes.add(ex))
    
    // La periodicidad más corta gana
    if (controlesGes.periodicidadMeses < controles.periodicidadMinima) {
      controles.periodicidadMinima = controlesGes.periodicidadMeses
    }
    
    // Solo agregar aptitudes/condiciones si NR ≥ III
    if (nr >= 121) {
      controlesGes.aptitudes.forEach(apt => controles.aptitudes.add(apt))
      controlesGes.condicionesIncompatibles.forEach(cond => 
        controles.condicionesIncompatibles.add(cond)
      )
    }
  })
  
  return controles
}
```

**Ejemplo práctico:**
```
Operario con:
- Ruido → NR=240 (III) → Audiometría anual
- Caídas mismo nivel → NR=20 (I) → Sin exámenes específicos
- Químicos → NR=30 (I) → Sin exámenes específicos
- Biomecánico → NR=100 (II) → Evaluación osteomuscular cada 2 años

Resultado consolidado:
- Audiometría: anual (del más restrictivo)
- Evaluación osteomuscular: cada 2 años
- Los otros GES no aportan exámenes adicionales
```

---

### 6. **Toggles Especiales (Alturas, Alimentos, Conducción)**

**Respuesta:** Los toggles son **DECLARATIVOS y sobrescriben cálculos**.

**Justificación:**
- Son requisitos LEGALES, no dependientes de valoración de riesgo
- Ejemplo: Si marca "Trabaja en alturas" → EMOA obligatorio por Res. 1409/2012, aunque no hayas seleccionado GES "Caídas de altura"

**Orden de Precedencia:**
```javascript
// 1. Toggles especiales (máxima prioridad - legal)
if (cargo.trabajaEnAlturas) {
  examenes.push('EMOA', 'LABORATORIO_CLINICO')
}

// 2. GES con NR ≥ III (alta prioridad)
if (nr >= 121) {
  // aplicar todos los controles del GES
}

// 3. GES con NR II (media prioridad)
if (nr >= 41 && nr < 121) {
  // aplicar controles recomendados
}

// 4. GES con NR I (baja prioridad - puede omitirse)
if (nr < 41) {
  // solo paquete mínimo universal
}
```

**Recomendación UI:** En el profesiograma, mostrar sección separada:
```
📋 REQUISITOS LEGALES ESPECIALES
✓ Trabajo en alturas → Examen de aptitud para alturas (EMOA)
✓ Conducción de vehículos → Prueba psicosensométrica

⚠️ CONTROLES POR EXPOSICIÓN A RIESGOS
[Lista de exámenes según NR de cada GES]
```

---

### 7. **Presentación en Profesiograma**

**Respuesta:** Opción **C modificada** - Transparencia total con justificación.

**Estructura visual recomendada:**

```markdown
## RIESGOS SIGNIFICATIVOS (NR ≥ II - Requieren control)

### Riesgo: RUIDO
- Nivel de Riesgo: III - Alto (NR=240)
- EPP Requeridos: Protección auditiva (tapones o copa)
- Exámenes: Audiometría tonal (anual)
- Aptitudes: Audición funcional
- Controles: Capacitación en conservación auditiva

---

## RIESGOS NO SIGNIFICATIVOS (NR I - No requieren controles específicos)

### Riesgo: Caídas al mismo nivel
- Nivel de Riesgo: I - Aceptable (NR=20)
- Justificación: Superficie plana, pisos antideslizantes, iluminación adecuada
- Controles aplicados: Programa de orden y aseo
- **No requiere EPP ni exámenes específicos**

### Riesgo: Contacto con químicos (ocasional)
- Nivel de Riesgo: I - Aceptable (NR=30)
- Justificación: Exposición <1 hora/semana, bajas concentraciones
- Controles aplicados: Fichas de seguridad disponibles
- **No requiere EPP ni exámenes específicos**
```

**Beneficios:**
- Trazabilidad para auditorías
- Transparencia con el trabajador
- Justifica por qué NO se piden ciertos exámenes
- Cumple con "matriz completa" pero con controles diferenciados

---

### 8. **Trazabilidad y Justificación**

**Respuesta:** SÍ, absolutamente necesario para auditorías y defensa legal.

**Implementación:**

```javascript
// En la generación del PDF/documento
const documentarDecisionControl = (ges, nr, controles) => {
  return {
    ges: ges.nombre,
    nivelRiesgo: nr,
    interpretacion: getNivelRiesgoTexto(nr),
    fundamentoTecnico: `Valoración según GTC-45: ND=${ges.nd}, NE=${ges.ne}, NC=${ges.nc}, NR=${nr}`,
    controlesAplicados: controles.length > 0,
    justificacionOmision: controles.length === 0 
      ? `Riesgo valorado como ACEPTABLE (NR I). No requiere controles específicos más allá del paquete mínimo universal. Medidas implementadas: ${ges.medidasImplementadas}`
      : null,
    fecha: new Date(),
    responsable: 'Sistema Genesys - Médico especialista SST'
  }
}
```

**En el PDF debe aparecer:**
```
SECCIÓN: ANÁLISIS Y JUSTIFICACIÓN DE CONTROLES

Para cada riesgo identificado, se realizó valoración técnica conforme a GTC-45:

Riesgo: Caídas al mismo nivel
- ND (Deficiencia): 2 - Nivel bajo de deficiencia
- NE (Exposición): 1 - Ocasional
- NC (Consecuencia): 10 - Lesiones leves
- NP = ND × NE = 2 (Bajo)
- NR = NP × NC = 20 (Nivel I - Aceptable)

DECISIÓN TÉCNICA: No se requieren EPP ni exámenes médicos específicos 
adicionales al paquete mínimo universal. Medidas de control implementadas: 
programa de orden y aseo, señalización preventiva.

Base normativa: Resolución 1843/2025, Artículo 8 - Justificación técnica 
de evaluaciones médicas según exposición ocupacional.
```

---

### 9. **Cambios en el Tiempo**

**Respuesta:** Se actualiza automáticamente pero se mantiene historial.

**Estrategia de Versionamiento:**

```javascript
// Schema propuesto
const ProtocoloCargoVersion = {
  cargoId: String,
  version: Number,
  fechaVigencia: Date,
  fechaCaducidad: Date,
  gesControles: [{
    gesId: String,
    nr: Number,
    controles: Object,
    razonCambio: String // "Mejora en controles de ingeniería"
  }],
  cambiosRespectoPrevio: [{
    tipo: 'REDUCCION_RIESGO' | 'AUMENTO_RIESGO',
    ges: String,
    nrAnterior: Number,
    nrNuevo: Number,
    implicaciones: String
  }]
}
```

**Manejo de trabajadores activos:**
```javascript
// Regla: "Never downgrade protection until next evaluation"
if (nuevoNR < anteriorNR) {
  // Riesgo bajó de Alto a Medio
  
  // Para trabajadores NUEVOS: aplica nuevo protocolo
  if (trabajador.fechaIngreso > fechaVersionNueva) {
    aplicarProtocoloNuevo()
  }
  
  // Para trabajadores EXISTENTES: mantiene hasta próximo examen
  if (trabajador.ultimoExamen.fecha < fechaVersionNueva) {
    mantenerProtocoloAnterior()
    notas.push('Protocolo anterior hasta próxima evaluación periódica')
  }
}

if (nuevoNR > anteriorNR) {
  // Riesgo subió: APLICAR INMEDIATAMENTE a todos
  aplicarProtocoloNuevo()
  programarExamenExtraordinario()
}
```

---

### 10. **EPPs vs Exámenes Médicos**

**Respuesta:** Lógica DIFERENTE - umbrales distintos.

**Fundamento:**
- **EPP:** Prevención primaria - evitar daño
- **Examen médico:** Prevención secundaria - detectar daño temprano

**Umbrales propuestos:**

| NR | EPP | Examen Médico Específico |
|---|---|---|
| I (≤40) | No requerido | Solo examen básico de ingreso |
| II (41-120) | Recomendado* | Examen cada 2-3 años |
| III (121-500) | **Obligatorio** | Examen anual |
| IV (≥501) | **Obligatorio + reforzado** | Examen semestral |

\* En NR II: EPP puede ser opcional si hay controles de ingeniería eficaces

**Casos especiales:**
```javascript
// Ejemplo: Ruido
if (ges.tipo === 'RUIDO') {
  if (nivelRuido >= 85) {
    // EPP obligatorio por ley (Res. 1792/1990)
    epp = 'OBLIGATORIO'
    examen = 'Audiometría anual'
  } else if (nivelRuido >= 80 && nivelRuido < 85) {
    // Zona de precaución
    epp = 'RECOMENDADO'
    examen = 'Audiometría cada 2 años (vigilancia)'
  } else {
    epp = 'NO REQUERIDO'
    examen = 'Solo ingreso'
  }
}
```

**Recomendación:** En `ges-config.js`, agregar:

```javascript
const GES_CONFIG = {
  RUIDO: {
    controles: {
      // Controles por nivel de EXPOSICIÓN real, no solo NR
      byDecibeles: {
        '<80': { epp: false, examen: 'ingreso' },
        '80-84': { epp: 'recomendado', examen: 'cada2años' },
        '85-90': { epp: 'obligatorio', examen: 'anual' },
        '>90': { epp: 'obligatorio_doble', examen: 'semestral' }
      },
      // Controles por NR calculado (si no hay datos técnicos)
      byNR: {
        'I': { epp: false, examen: 'ingreso' },
        'II': { epp: 'recomendado', examen: 'cada2años' },
        'III': { epp: 'obligatorio', examen: 'anual' },
        'IV': { epp: 'obligatorio_doble', examen: 'semestral' }
      }
    }
  }
}
```

---

### 11. **Condiciones Incompatibles y Aptitudes**

**Respuesta:** Se evalúan SOLO si NR ≥ III O si hay toggle especial.

**Lógica:**

```javascript
const determinarAptitudesYCondiciones = (ges, nr, toggles) => {
  // Caso 1: Toggle especial = SIEMPRE se evalúa
  if (toggles.trabajaEnAlturas && ges.tipo === 'CAIDAS_ALTURA') {
    return {
      aptitudes: ['EQUILIBRIO', 'SIN_VERTIGO', 'AGUDEZA_VISUAL'],
      condicionesIncompatibles: ['EPILEPSIA', 'SINCOPE', 'HIPOACUSIA_SEVERA'],
      requiereEvaluacion: true,
      fundamento: 'Resolución 1409/2012 - Trabajo en alturas'
    }
  }
  
  // Caso 2: NR ≥ III = Se evalúa
  if (nr >= 121) {
    return {
      aptitudes: ges.aptitudesRequeridas,
      condicionesIncompatibles: ges.condicionesIncompatibles,
      requiereEvaluacion: true,
      fundamento: 'Riesgo valorado como Alto/Crítico'
    }
  }
  
  // Caso 3: NR < III = NO se evalúa específicamente
  return {
    aptitudes: [],
    condicionesIncompatibles: [],
    requiereEvaluacion: false,
    fundamento: 'Riesgo valorado como Aceptable. Evaluación básica universal es suficiente'
  }
}
```

**Ejemplo práctico:**
```
Cargo: Asistente administrativo
GES: Caídas mismo nivel → NR=20 (I)

❌ NO se pregunta: "¿Tiene vértigo?" "¿Tiene problemas de equilibrio?"
✓ Examen básico de ingreso detectará cualquier limitación obvia
✓ Si médico detecta algo, emite restricción ad-hoc

---

Cargo: Técnico mantenimiento en torres
GES: Caídas altura → NR=400 (IV)
Toggle: trabajaEnAlturas = true

✓ SÍ se pregunta: "¿Tiene vértigo?" "¿Epilepsia?" "¿Síncope?"
✓ Examen EMOA específico
✓ Aptitudes críticas para desempeño seguro
```

---

### 12. **Impacto en Matriz de Riesgos Excel**

**Respuesta:** La matriz Excel debe reflejar la lógica pero no reemplazarla.

**Columnas adicionales propuestas:**

```
| GES | ND | NE | NP | NC | NR | Interpretación | EPP Requerido | Exámenes Requeridos | Periodicidad | Justificación |
```

**Ejemplo de fila:**
```
Ruido | 6 | 3 | 18 | 25 | 450 | III-Alto | Sí - Protección auditiva tipo copa | Audiometría tonal | Anual | NR alto requiere vigilancia continua

Caídas mismo nivel | 2 | 1 | 2 | 10 | 20 | I-Aceptable | No | Ninguno específico | N/A | Riesgo controlado. Paquete mínimo universal
```

**Diferenciación visual en Excel:**
- NR I: Fondo verde claro, texto gris
- NR II: Fondo amarillo claro
- NR III: Fondo naranja
- NR IV: Fondo rojo

**Fórmula en columna "EPP Requerido":**
```excel
=SI([@NR]>=121, "Sí - Obligatorio", SI([@NR]>=41, "Recomendado", "No requerido"))
```

---

### 13. **Integración con Flujo IA**

**Respuesta:** El profesiograma debe RE-CALCULAR, no asumir.

**Flujo propuesto:**

```javascript
// flujoIa.controller.js
async function generarDocumentos(cargoData) {
  // 1. Generar matriz de riesgos (calcula NP, NR)
  const matrizRiesgos = await generarMatrizRiesgos(cargoData.gesSeleccionados)
  
  // 2. Enriquecer gesSeleccionados con NR calculado
  const gesConNR = cargoData.gesSeleccionados.map(ges => ({
    ...ges,
    np: calcularNP(ges.nd, ges.ne),
    nr: calcularNR(ges.nd, ges.ne, ges.nc),
    nivelRiesgo: interpretarNR(calcularNR(ges.nd, ges.ne, ges.nc))
  }))
  
  // 3. Generar profesiograma con GES ya valorados
  const profesiograma = await generarProfesiograma({
    ...cargoData,
    gesConNR, // Ya tienen NP/NR calculado
    togglesEspeciales: cargoData.togglesEspeciales
  })
  
  return { matrizRiesgos, profesiograma }
}

// profesiograma.controller.js
function consolidarControles(gesConNR, togglesEspeciales) {
  const controles = {
    paqueteMinimo: PAQUETE_MINIMO_UNIVERSAL,
    porToggle: aplicarControlesDeToggles(togglesEspeciales),
    porGES: []
  }
  
  gesConNR.forEach(ges => {
    const controlesGes = determinarControlesPorNR(ges.nr, ges.tipo)
    
    if (controlesGes.aplicaControles) {
      controles.porGES.push({
        ges: ges.nombre,
        nr: ges.nr,
        nivel: ges.nivelRiesgo,
        epp: controlesGes.epp,
        examenes: controlesGes.examenes,
        periodicidad: controlesGes.periodicidad,
        justificacion: `Riesgo valorado como ${ges.nivelRiesgo}`
      })
    }
  })
  
  return consolidarYDeduplicar(controles)
}
```

---

### 14. **Base de Datos y Persistencia**

**Respuesta:** Guardar NR calculado + metadatos para trazabilidad.

**Schema propuesto:**

```javascript
// Colección: protocolosCargo
{
  _id: ObjectId,
  cargoId: ObjectId,
  version: 1,
  fechaCreacion: ISODate,
  fechaVigencia: ISODate,
  
  gesAnalizados: [
    {
      gesId: String, // "RUIDO"
      nombre: "Exposición a ruido industrial",
      
      // Valores de entrada
      nd: 6,
      ne: 3,
      nc: 25,
      
      // Valores calculados (PERSISTIR para trazabilidad)
      np: 18,
      nr: 450,
      nivelRiesgo: "III", // I, II, III, IV
      interpretacion: "Alto",
      
      // Decisión de controles (PERSISTIR para auditoría)
      aplicaControles: true,
      controles: {
        epp: ["PROTECCION_AUDITIVA_COPA"],
        examenes: ["AUDIOMETRIA_TONAL"],
        periodicidad: "12 meses",
        aptitudes: ["AUDICION_FUNCIONAL"],
        condicionesIncompatibles: ["HIPOACUSIA_SEVERA_BILATERAL"]
      },
      
      // Metadatos
      fechaCalculo: ISODate,
      metodoCalculo: "GTC-45-2012",
      justificacion: "Riesgo Alto requiere vigilancia auditiva continua"
    }
  ],
  
  togglesEspeciales: {
    trabajaEnAlturas: true,
    conduceVehiculo: false,
    manejaAlimentos: false
  },
  
  // Consolidado final
  controlesConsolidados: {
    paqueteMinimo: ["EMO_BASICA", "VISIOMETRIA_BASICA"],
    epp: ["PROTECCION_AUDITIVA_COPA", "ARNES_CUERPO_COMPLETO"],
    examenes: ["AUDIOMETRIA_TONAL", "EMOA", "LABORATORIO_CLINICO"],
    periodicidadMinima: 12, // meses
    aptitudes: ["AUDICION_FUNCIONAL", "EQUILIBRIO", "SIN_VERTIGO"],
    condicionesIncompatibles: ["HIPOACUSIA_SEVERA", "EPILEPSIA", "SINCOPE"]
  },
  
  generadoPor: {
    medicoId: ObjectId,
    nombreMedico: "Dr. XXX",
    licenciaSST: "XXX"
  }
}
```

**Beneficios:**
- Trazabilidad completa (auditoría puede ver por qué se tomó cada decisión)
- Análisis de tendencias en el tiempo
- Comparación entre versiones
- No recalcular cada vez (performance)

**Cuándo recalcular:**
- Usuario cambia ND, NE, NC → recalcular NP, NR inmediatamente
- Usuario genera nuevo documento → recalcular todo
- Consulta histórica → NO recalcular, usar valor persistido

---

### 15. **Validación y Reglas de Negocio**

**Respuesta:** Lógica en BACKEND, preview en FRONTEND.

**Arquitectura:**

```javascript
// 📁 server/src/services/riesgos.service.js
class RiesgosService {
  calcularNP(nd, ne) {
    return nd * ne
  }
  
  calcularNR(nd, ne, nc) {
    return this.calcularNP(nd, ne) * nc
  }
  
  interpretarNR(nr) {
    if (nr >= 501) return { nivel: 'IV', descripcion: 'Crítico' }
    if (nr >= 121) return { nivel: 'III', descripcion: 'Alto' }
    if (nr >= 41) return { nivel: 'II', descripcion: 'Medio' }
    return { nivel: 'I', descripcion: 'Aceptable' }
  }
  
  determinarControles(ges, toggles) {
    const nr = this.calcularNR(ges.nd, ges.ne, ges.nc)
    const interpretacion = this.interpretarNR(nr)
    
    // Prioridad 1: Toggles legales
    const controlesPorToggle = this.aplicarTogglesSeguros(toggles, ges)
    
    // Prioridad 2: NR calculado
    const controlesPorNR = this.getControlesPorNivelRiesgo(nr, ges.tipo)
    
    // Merge con precedencia
    return this.mergearControles(controlesPorToggle, controlesPorNR)
  }
}

// 📁 client/src/services/riesgos.service.ts
// Misma lógica para preview en tiempo real
class RiesgosServiceFrontend {
  // DUPLICAR lógica de backend (o mejor: crear paquete compartido)
  calcularNP(nd: number, ne: number): number { ... }
  calcularNR(nd: number, ne: number, nc: number): number { ... }
  
  // Preview en formulario
  previewControles(gesSeleccionados, toggles) {
    return gesSeleccionados.map(ges => ({
      ...ges,
      nr: this.calcularNR(ges.nd, ges.ne, ges.nc),
      controles: this.determinarControles(ges, toggles),
      advertencias: this.validarCoherencia(ges)
    }))
  }
}

// 📁 Validación en tiempo real en form
function MatrizRiesgosForm() {
  const [gesSeleccionados, setGesSeleccionados] = useState([])
  
  // Calcular preview en vivo
  const preview = useMemo(() => 
    riesgosService.previewControles(gesSeleccionados, toggles),
    [gesSeleccionados, toggles]
  )
  
  return (
    <div>
      {preview.map(ges => (
        <div className="ges-preview">
          <h4>{ges.nombre}</h4>
          <Badge color={ges.nr >= 121 ? 'red' : 'green'}>
            NR: {ges.nr} - {ges.nivelRiesgo}
          </Badge>
          
          {ges.controles.aplicaControles ? (
            <div>
              <p>✓ EPP: {ges.controles.epp.join(', ')}</p>
              <p>✓ Exámenes: {ges.controles.examenes.join(', ')}</p>
            </div>
          ) : (
            <p className="text-gray-500">
              ⚠️ No se aplicarán controles específicos (riesgo aceptable)
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

### 16. **Casos Especiales: Riesgo Psicosocial**

**Respuesta:** Reglas especiales - siempre evaluar con batería.

**Justificación:**
- Resolución 2646/2008 y 1843/2025 obligan evaluación psicosocial
- No aplica lógica de EPP (no existen EPPs para lo psicosocial)
- La "exposición" es inherente al trabajo, no se puede reducir a NR bajo

**Reglas especiales:**

```javascript
const REGLAS_ESPECIALES_PSICOSOCIAL = {
  'ESTRES_LABORAL': {
    evaluacionObligatoria: true,
    independienteDeNR: true,
    herramienta: 'Batería de Riesgo Psicosocial (Res. 2646/2008)',
    periodicidad: 'Cada 2 años o cuando haya cambios organizacionales',
    controles: {
      epp: null, // No aplica
      examenes: ['EVALUACION_PSICOLOGICA'],
      programas: ['INTERVENCION_PSICOSOCIAL', 'SVE_PSICOSOCIAL']
    },
    noAplicaLogicaNR: true
  },
  
  'VIOLENCIA_LABORAL': {
    evaluacionObligatoria: true,
    herramienta: 'Protocolo de prevención de acoso laboral',
    periodicidad: 'Anual',
    controles: {
      examenes: ['EVALUACION_PSICOLOGICA'],
      programas: ['COMITE_CONVIVENCIA', 'PROTOCOLO_ACOSO']
    }
  },
  
  'CARGA_MENTAL': {
    evaluacionObligatoria: true,
    periodicidad: 'Cada 2 años',
    controles: {
      examenes: ['EVALUACION_PSICOLOGICA_OCUPACIONAL'],
      programas: ['PAUSAS_ACTIVAS_MENTALES', 'MINDFULNESS']
    }
  }
}

// Lógica especial en determinarControles()
function determinarControles(ges, nr, toggles) {
  // Caso especial: Riesgo psicosocial
  if (ges.categoria === 'PSICOSOCIAL') {
    return REGLAS_ESPECIALES_PSICOSOCIAL[ges.subcategoria]
  }
  
  // Lógica normal para otros riesgos
  return determinarControlesPorNR(nr)
}
```

---

### 17. **Coherencia con Normativa de Seguridad Vial**

**Respuesta:** Seguridad vial anula lógica de NR (es requisito legal).

**Resolución 1565/2014 - PESV (Plan Estratégico de Seguridad Vial):**

```javascript
const CONTROLES_SEGURIDAD_VIAL = {
  conduceVehiculo: {
    obligatorioLegal: true,
    normativa: 'Resolución 1565/2014',
    independienteDeGES: true, // Aunque no tengas GES "Accidentes tránsito"
    
    examenes: {
      preingreso: [
        'VISIOMETRIA_COMPLETA', // Con campimetría
        'AUDIOMETRIA',
        'PRUEBA_PSICOSENSOMETRICA', // Ley 1383/2010
        'EXAMEN_FISICO_COMPLETO'
      ],
      periodicos: [
        'PRUEBA_PSICOSENSOMETRICA', // Renovación cada 1-2 años
        'VISIOMETRIA_COMPLETA'
      ]
    },
    
    aptitudes: [
      'AGUDEZA_VISUAL_20_40_MINIMO',
      'CAMPO_VISUAL_140_GRADOS',
      'COORDINACION_PSICOMOTRIZ',
      'TIEMPO_REACCION_ADECUADO',
      'DISCRIMINACION_COLORES'
    ],
    
    condicionesIncompatibles: [
      'EPILEPSIA_NO_CONTROLADA',
      'TRASTORNOS_EQUILIBRIO',
      'CONSUMO_SUSTANCIAS_PSICOACTIVAS',
      'CEGUERA_MONOCULAR', // Según tipo vehículo
      'HIPOACUSIA_PROFUNDA_BILATERAL'
    ],
    
    capacitaciones: [
      'MANEJO_DEFENSIVO',
      'PREVENCION_ACCIDENTES_VIALES',
      'PRIMEROS_AUXILIOS_EN_CARRETERA'
    ]
  }
}

// Implementación
function aplicarControlesDeToggles(toggles) {
  const controles = {}
  
  if (toggles.conduceVehiculo) {
    Object.assign(controles, CONTROLES_SEGURIDAD_VIAL.conduceVehiculo)
    
    // NOTA: Estos controles SE SUMAN a los de GES
    // No reemplazan, no se ignoran por NR bajo
  }
  
  if (toggles.trabajaEnAlturas) {
    Object.assign(controles, CONTROLES_TRABAJO_ALTURAS)
  }
  
  return controles
}
```

**En el profesiograma se muestra:**
```markdown
## REQUISITOS LEGALES POR TIPO DE TRABAJO

### Conducción de vehículos (Res. 1565/2014 - PESV)
- Prueba psicosensométrica: Preingreso y renovación cada 2 años
- Visiometría completa: Con campimetría y discriminación de colores
- Capacitación en manejo defensivo
- **Estos requisitos son INDEPENDIENTES del nivel de riesgo calculado**
```

---

### 18. **Threshold (Umbral) Configurable**

**Respuesta:** SÍ debe ser configurable, pero con defaults sólidos.

**Niveles de configuración:**

```javascript
// 📁 server/src/config/umbrales-controles.config.js
const UMBRALES_CONTROLES = {
  // Nivel 1: Global (default para todas las empresas)
  global: {
    nrMinimoParaEPP: 41, // NR ≥ II
    nrMinimoParaExamenes: 41, // NR ≥ II
    nrMinimoParaAptitudes: 121, // NR ≥ III
    nrMinimoParaCondicionesIncompatibles: 121, // NR ≥ III
    periodicidadPorNR: {
      'I': 36, // 3 años
      'II': 24, // 2 años
      'III': 12, // 1 año
      'IV': 6 // 6 meses
    }
  },
  
  // Nivel 2: Por tipo de empresa (puede sobrescribir)
  perfiles: {
    'ALTO_RIESGO': { // Construcción, minería, químicos
      nrMinimoParaEPP: 21, // Más estricto: desde NR bajo-alto
      nrMinimoParaExamenes: 21,
      nrMinimoParaAptitudes: 41, // Desde NR II
      periodicidadPorNR: {
        'I': 24,
        'II': 12,
        'III': 6,
        'IV': 3 // Trimestral
      }
    },
    
    'RIESGO_MEDIO': { // Manufactura, logística
      // Usa defaults globales
    },
    
    'BAJO_RIESGO': { // Oficinas administrativas
      nrMinimoParaEPP: 121, // Solo NR ≥ III
      nrMinimoParaExamenes: 41, // NR ≥ II
      periodicidadPorNR: {
        'I': 36,
        'II': 36, // Extendido
        'III': 24,
        'IV': 12
      }
    }
  },
  
  // Nivel 3: Por empresa específica (almacenado en BD)
  // Se consulta en empresas.configuracionSST.umbralesControles
}

// Schema en colección empresas
{
  _id: ObjectId,
  nombreEmpresa: "Construcciones XYZ",
  actividadEconomica: "CONSTRUCCION",
  claseRiesgo: "V",
  
  configuracionSST: {
    perfilUmbrales: "ALTO_RIESGO", // Usa preset
    
    // O configuración custom
    umbralesControles: {
      custom: true,
      nrMinimoParaEPP: 21,
      nrMinimoParaExamenes: 21,
      nrMinimoParaAptitudes: 41,
      periodicidadPorNR: { ... },
      
      // Excepciones por GES específico
      excepcionesPorGES: {
        'RUIDO': {
          // Para ruido, aplicar controles desde NR=40
          nrMinimoParaControles: 40,
          justificacion: 'Política corporativa de conservación auditiva'
        }
      }
    }
  }
}
```

**Implementación en código:**

```javascript
// Service
class ControlesService {
  async determinarControlesParaEmpresa(empresaId, ges, nr) {
    // 1. Obtener configuración de empresa
    const empresa = await Empresa.findById(empresaId)
    const config = empresa.configuracionSST?.umbralesControles
    
    // 2. Resolver umbrales (con fallback a defaults)
    const umbrales = config?.custom 
      ? config
      : UMBRALES_CONTROLES.perfiles[config?.perfilUmbrales || 'global']
      || UMBRALES_CONTROLES.global
    
    // 3. Verificar excepción por GES
    const umbralGes = config?.excepcionesPorGES?.[ges.tipo]
    if (umbralGes) {
      return this.aplicarControles(nr, umbralGes)
    }
    
    // 4. Aplicar lógica con umbrales
    return {
      epp: nr >= umbrales.nrMinimoParaEPP,
      examenes: nr >= umbrales.nrMinimoParaExamenes,
      aptitudes: nr >= umbrales.nrMinimoParaAptitudes,
      periodicidad: umbrales.periodicidadPorNR[this.interpretarNR(nr).nivel]
    }
  }
}
```

**UI de Configuración:**
```jsx
// Página de configuración de empresa
function ConfiguracionUmbralesSST() {
  return (
    <div>
      <h2>Configuración de Umbrales de Control</h2>
      
      <Select label="Perfil de empresa" value={perfil} onChange={setPerfil}>
        <option value="GLOBAL">Estándar (recomendado)</option>
        <option value="ALTO_RIESGO">Alto riesgo (construcción, minería)</option>
        <option value="BAJO_RIESGO">Bajo riesgo (oficinas)</option>
        <option value="CUSTOM">Personalizado</option>
      </Select>
      
      {perfil === 'CUSTOM' && (
        <div>
          <NumberInput
            label="NR mínimo para requerir EPP"
            value={umbrales.nrMinimoParaEPP}
            onChange={v => setUmbrales({...umbrales, nrMinimoParaEPP: v})}
            helperText="Riesgos con NR por debajo de este valor no requerirán EPP"
          />
          
          <NumberInput
            label="NR mínimo para exámenes específicos"
            value={umbrales.nrMinimoParaExamenes}
          />
          
          {/* ... más configuraciones */}
        </div>
      )}
      
      <Alert type="warning">
        ⚠️ Los toggles especiales (alturas, conducción) siempre aplicarán
        controles independientemente de estos umbrales.
      </Alert>
    </div>
  )
}
```

---

## RESUMEN EJECUTIVO

### Recomendaciones Finales

**1. Arquitectura de Decisión:**
```
PRIORIDAD 1: Requisitos Legales (toggles especiales)
    ↓
PRIORIDAD 2: Nivel de Riesgo (NR ≥ umbral configurable)
    ↓
PRIORIDAD 3: Paquete mínimo universal (siempre aplica)
```

**2. Valores default recomendados:**
- EPP obligatorio: NR ≥ 121 (III - Alto)
- Exámenes específicos: NR ≥ 41 (II - Medio)
- Aptitudes/Condiciones: NR ≥ 121 (III - Alto)
- Paquete mínimo universal: SIEMPRE

**3. Implementación por fases:**
```
Fase 1: Backend - Lógica de cálculo y decisión
Fase 2: Frontend - Preview en formularios
Fase 3: PDF - Generación con justificaciones
Fase 4: Configuración - UI para umbrales por empresa
```

