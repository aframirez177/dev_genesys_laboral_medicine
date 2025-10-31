# PLAN DE IMPLEMENTACIÓN: Lógica de Controles Basada en Nivel de Riesgo (NR)

**Proyecto**: Genesys Laboral Medicine - Sistema SST
**Fecha**: Octubre 2025
**Creador**: Álvaro Felipe Ramírez
**Objetivo**: Implementar lógica robusta de controles (EPP, exámenes, aptitudes) basada en NR calculado

---

## CONTEXTO Y DECISIONES CLAVE

### Principios Fundamentales (de respuestas.md)

1. **Criterio de decisión**: NR (Nivel de Riesgo = NP × NC), NO solo NP
2. **Gradualidad**: Controles proporcionales al nivel de riesgo
3. **Paquete mínimo universal**: SIEMPRE se aplica (independiente de NR)
4. **Regla de consolidación**: "El más restrictivo gana" cuando hay múltiples GES
5. **Toggles especiales**: DECLARATIVOS - sobrescriben cálculos (requisitos legales)
6. **Umbrales configurables**: Por empresa, con defaults sólidos
7. **Trazabilidad**: Persistir NR y decisiones para auditorías

### Umbrales Default Recomendados

| NR | Nivel | EPP | Exámenes Específicos | Aptitudes/Condiciones | Periodicidad |
|---|---|---|---|---|---|
| I (4-40) | Aceptable | No | Solo ingreso | No | 3 años |
| II (41-120) | Medio | Recomendado | Sí | No | 2 años |
| III (121-500) | Alto | **Obligatorio** | Sí | **Sí** | 1 año |
| IV (501+) | Crítico | **Obligatorio + reforzado** | Sí | **Sí** | 6 meses |

---

## ANÁLISIS DEL FLUJO ACTUAL

### 1. Punto de Entrada: Formulario Matriz de Riesgos

**Archivo**: `client/public/pages/Matriz_de_riesgos_profesional.html`
**JavaScript**: `client/src/main_matriz_riesgos_profesional.js`

**Datos capturados actualmente**:
```javascript
{
  cargos: [{
    cargoName: String,
    area: String,
    descripcionTareas: String,
    zona: String,
    numTrabajadores: Number,
    tareasRutinarias: Boolean,

    // Toggles especiales
    trabajaAlturas: Boolean,      // ← CRÍTICO
    manipulaAlimentos: Boolean,   // ← CRÍTICO
    conduceVehiculo: Boolean,     // ← CRÍTICO

    gesSeleccionados: [{
      ges: String,          // Nombre del GES
      riesgo: String,       // Tipo de riesgo
      niveles: {
        deficiencia: { value: Number },    // ND
        exposicion: { value: Number },     // NE
        consecuencia: { value: Number }    // NC
      },
      controles: {
        fuente: String,
        medio: String,
        individuo: String
      }
    }]
  }]
}
```

**PROBLEMA ACTUAL**:
- Los niveles (ND, NE, NC) se capturan pero **NO se calcula NP ni NR en el frontend**
- No hay preview de qué controles se aplicarán
- Los toggles existen pero no tienen lógica diferenciada

---

### 2. Backend: Registro y Generación

**Archivo**: `server/src/controllers/flujoIa.controller.js`

**Flujo actual**:
```javascript
registrarYGenerar() {
  // 1. Validar datos
  // 2. Crear empresa y usuario (con password hash)
  // 3. Crear documento en BD (estado: pendiente_pago)
  // 4. Crear cargos y riesgos en BD
  //    ↓ Guarda: nd, ne, nc, controles (texto)
  //    ✗ NO guarda: NP calculado, NR calculado

  // 5. Generar documentos en paralelo:
  const [matrizBuffer, profesiogramaBuffer, perfilBuffer, cotizacionBuffer] = await Promise.all([
    generarMatrizExcel(formData, { companyName, nit, diligenciadoPor }),
    generarProfesiogramaPDF(formData, { companyName }),
    generarPerfilCargoPDF(formData, { companyName }),
    generarCotizacionPDF(formData)
  ])

  // 6. Generar thumbnails
  // 7. Subir a DigitalOcean Spaces
  // 8. Actualizar preview_urls en BD
}
```

**PROBLEMA ACTUAL**:
- Cada generador (matriz, profesiograma, perfil) calcula NP/NR **independientemente**
- No hay fuente única de verdad para los cálculos
- No se persiste NP/NR en BD (dificulta trazabilidad)

---

### 3. Generación de Matriz Excel

**Archivo**: `server/src/controllers/matriz-riesgos.controller.js`

**Lógica actual**:
```javascript
generarMatrizExcel(datosFormulario) {
  datosFormulario.cargos.forEach(cargo => {
    cargo.gesSeleccionados.forEach(ges => {
      const nd = ges.niveles.deficiencia.value
      const ne = ges.niveles.exposicion.value
      const nc = ges.niveles.consecuencia.value

      // Calcula NP y NR usando utils
      const np = calcularNivelProbabilidad(nd, ne)
      const nr = calcularNivelRiesgo(np.valor, nc)

      // Agrega a tabla Excel con colores según NR
      // ✓ BIEN: Usa calcularNivelRiesgo() de utils
    })
  })
}
```

**ESTADO**: Relativamente correcto, usa la utilidad `risk-calculations.js`

---

### 4. Generación de Profesiograma PDF

**Archivo**: `server/src/controllers/profesiograma.controller.js`

**Lógica actual (PROBLEMÁTICA)**:
```javascript
generarProfesiogramaPDF(datosFormulario) {
  cargo.gesSeleccionados.forEach(ges => {
    const gesName = ges.ges
    const gesConfig = GES_DATOS_PREDEFINIDOS[gesName]

    // ✗ PROBLEMA: Aplica TODOS los controles del GES automáticamente
    // Sin considerar NP/NR

    if (gesConfig.examenesMedicos) {
      Object.entries(gesConfig.examenesMedicos).forEach(([code, periodicidad]) => {
        examenesMap.set(code, { periodicidad })
      })
    }

    if (gesConfig.aptitudesRequeridas) {
      aptitudesRequeridas.add(...gesConfig.aptitudesRequeridas)
    }

    if (gesConfig.eppSugeridos) {
      eppSugeridos.add(...gesConfig.eppSugeridos)
    }
  })

  // Luego aplica reglas de toggles especiales
  if (cargo.trabajaAlturas) {
    examenesMap.set("EMOA", { periodicidad: 1 })
    // ...más exámenes
  }
}
```

**PROBLEMAS CRÍTICOS**:
1. **No calcula NP ni NR** - no usa `risk-calculations.js`
2. **Aplica controles indiscriminadamente** - sin filtro por nivel de riesgo
3. **No diferencia** entre NR I (bajo) y NR IV (crítico)
4. Los toggles se aplican correctamente, pero los GES no

---

### 5. Config de GES

**Archivo**: `server/src/config/ges-config.js` (1979 líneas)

**Estructura actual**:
```javascript
export const GES_DATOS_PREDEFINIDOS = {
  "Caídas al mismo nivel": {
    consecuencias: String,
    peorConsecuencia: String,

    // ✗ PROBLEMA: NO hay condicionalidad por NR
    examenesMedicos: {
      EMO: 1,
      OPTO: 1
    },

    aptitudesRequeridas: Array,
    condicionesIncompatibles: Array,
    eppSugeridos: Array,
    medidasIntervencion: Object
  },

  "Caídas de altura": {
    examenesMedicos: {
      EMOA: 1,
      OPTO: 1,
      AUD: 1,
      ECG: 1,
      GLI: 1,
      PL: 1,
      PST: 2
    },
    // ...
  }
}
```

**PROBLEMA**:
- La config NO tiene lógica de "aplicar solo si NR ≥ X"
- Es estática - todos los controles se aplican siempre

---

### 6. Utilidades de Cálculo

**Archivo**: `server/src/utils/risk-calculations.js`

**✓ ESTADO: CORRECTO - Implementa GTC-45 adecuadamente**

```javascript
export function calcularNivelProbabilidad(nd, ne) {
  const np = nd * ne

  if (np >= 24) return { valor: np, nivel: 'Muy Alto', ... }
  if (np >= 10) return { valor: np, nivel: 'Alto', ... }
  if (np >= 6) return { valor: np, nivel: 'Medio', ... }
  return { valor: np, nivel: 'Bajo', ... }
}

export function calcularNivelRiesgo(np, nc) {
  const nr = np * nc

  if (nr >= 600) return { valor: nr, nivel: 'I', interpretacion: 'Crítico', aceptabilidad: 'No Aceptable', ... }
  if (nr >= 150) return { valor: nr, nivel: 'II', ... }
  if (nr >= 40) return { valor: nr, nivel: 'III', ... }
  return { valor: nr, nivel: 'IV', interpretacion: 'No intervenir', aceptabilidad: 'Aceptable', ... }
}
```

**NOTA**: Los niveles están **invertidos** respecto a las respuestas (I=peor, IV=mejor).
**ACCIÓN REQUERIDA**: Verificar si esto es correcto según GTC-45 oficial.

---

## PLAN DE IMPLEMENTACIÓN

### FASE 1: Backend - Service de Lógica de Riesgos (CRÍTICO)

**Duración estimada**: 3-4 días

#### 1.1. Crear Service Centralizado

**Archivo nuevo**: `server/src/services/riesgos.service.js`

```javascript
// server/src/services/riesgos.service.js
import { calcularNivelProbabilidad, calcularNivelRiesgo } from '../utils/risk-calculations.js';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';

/**
 * PAQUETE MÍNIMO UNIVERSAL
 * Aplica a TODOS los trabajadores independiente de NR
 */
const PAQUETE_MINIMO_UNIVERSAL = {
  examenes: ['EMO', 'OPTO', 'AUD'], // Examen médico básico, visiometría, audiometría básica
  periodicidad: 36, // meses
  fundamento: 'Resolución 1843/2025 - Evaluación básica obligatoria'
};

/**
 * UMBRALES DEFAULT (pueden ser configurables por empresa)
 */
const UMBRALES_DEFAULT = {
  nrMinimoParaEPP: 121,           // NR ≥ III (Alto)
  nrMinimoParaExamenes: 41,       // NR ≥ II (Medio)
  nrMinimoParaAptitudes: 121,     // NR ≥ III (Alto)
  periodicidadPorNR: {
    'IV': 36,  // Aceptable: 3 años
    'III': 24, // Mejorable: 2 años
    'II': 12,  // Alto: 1 año
    'I': 6     // Crítico: 6 meses
  }
};

/**
 * CONTROLES POR TOGGLES ESPECIALES (REQUISITOS LEGALES)
 * Estos SOBRESCRIBEN la lógica de NR
 */
const CONTROLES_TOGGLES = {
  trabajaAlturas: {
    fundamento: 'Resolución 1409/2012 y 4272/2021',
    examenes: ['EMOA', 'GLI', 'PL', 'PE', 'ESP', 'ECG'],
    periodicidad: 12, // Anual obligatorio
    epp: ['ARNES_CUERPO_COMPLETO', 'LINEA_VIDA', 'CASCO_BARBUQUEJO', 'CALZADO_ANTIDESLIZANTE'],
    aptitudes: ['EQUILIBRIO', 'SIN_VERTIGO', 'AGUDEZA_VISUAL', 'COORDINACION'],
    condicionesIncompatibles: ['EPILEPSIA', 'SINCOPE', 'VERTIGO', 'CARDIOPATIA_SEVERA']
  },

  manipulaAlimentos: {
    fundamento: 'Resolución 2674/2013',
    examenes: ['EMOMP', 'FRO', 'KOH', 'COP'],
    periodicidad: 12,
    aptitudes: ['HIGIENE_PERSONAL', 'SIN_LESIONES_CUTANEAS'],
    condicionesIncompatibles: ['ENFERMEDADES_TRANSMISIBLES', 'LESIONES_PIEL_MANOS']
  },

  conduceVehiculo: {
    fundamento: 'Resolución 1565/2014 (PESV) y Ley 1383/2010',
    examenes: ['PSM', 'VISIOMETRIA_COMPLETA', 'AUD', 'GLI', 'PL'],
    periodicidad: 24, // Cada 2 años
    aptitudes: ['AGUDEZA_VISUAL_20_40', 'CAMPO_VISUAL_140', 'COORDINACION_PSICOMOTRIZ', 'DISCRIMINACION_COLORES'],
    condicionesIncompatibles: ['EPILEPSIA_NO_CONTROLADA', 'CEGUERA_MONOCULAR', 'HIPOACUSIA_PROFUNDA']
  }
};

class RiesgosService {

  /**
   * Calcula NP y NR para un GES individual
   */
  calcularNivelesRiesgo(ges) {
    const nd = ges.niveles?.deficiencia?.value;
    const ne = ges.niveles?.exposicion?.value;
    const nc = ges.niveles?.consecuencia?.value;

    if (!nd || !ne || !nc) {
      throw new Error(`GES "${ges.ges}" no tiene niveles completos (nd=${nd}, ne=${ne}, nc=${nc})`);
    }

    const np = calcularNivelProbabilidad(nd, ne);
    const nr = calcularNivelRiesgo(np.valor, nc);

    return {
      nd,
      ne,
      nc,
      np: np.valor,
      npNivel: np.nivel,
      npInterpretacion: np.interpretacion,
      nr: nr.valor,
      nrNivel: nr.nivel,
      nrInterpretacion: nr.interpretacion,
      nrAceptabilidad: nr.aceptabilidad,
      fechaCalculo: new Date()
    };
  }

  /**
   * Determina si se aplican controles según NR y umbrales
   */
  determinarControlesPorNR(nr, gesConfig, umbrales = UMBRALES_DEFAULT) {
    const aplicaEPP = nr >= umbrales.nrMinimoParaEPP;
    const aplicaExamenes = nr >= umbrales.nrMinimoParaExamenes;
    const aplicaAptitudes = nr >= umbrales.nrMinimoParaAptitudes;

    // Determinar periodicidad según nivel de NR
    const nrInfo = calcularNivelRiesgo(1, nr); // Truco para obtener info del nivel
    const periodicidad = umbrales.periodicidadPorNR[nrInfo.nivel] || 36;

    return {
      aplicaControles: aplicaEPP || aplicaExamenes,
      epp: aplicaEPP ? (gesConfig.eppSugeridos || []) : [],
      examenes: aplicaExamenes ? Object.keys(gesConfig.examenesMedicos || {}) : [],
      aptitudes: aplicaAptitudes ? (gesConfig.aptitudesRequeridas || []) : [],
      condicionesIncompatibles: aplicaAptitudes ? (gesConfig.condicionesIncompatibles || []) : [],
      periodicidad,
      justificacion: this.generarJustificacion(nr, aplicaEPP, aplicaExamenes)
    };
  }

  /**
   * Aplica controles de toggles especiales (SIEMPRE, independiente de NR)
   */
  aplicarControlesDeToggles(toggles) {
    const controles = {
      examenes: new Set(),
      epp: new Set(),
      aptitudes: new Set(),
      condicionesIncompatibles: new Set(),
      periodicidadMinima: 999, // Muy alta para que se reduzca
      fundamentos: []
    };

    Object.entries(toggles).forEach(([toggle, activo]) => {
      if (activo && CONTROLES_TOGGLES[toggle]) {
        const ctrl = CONTROLES_TOGGLES[toggle];

        ctrl.examenes.forEach(ex => controles.examenes.add(ex));
        (ctrl.epp || []).forEach(epp => controles.epp.add(epp));
        (ctrl.aptitudes || []).forEach(apt => controles.aptitudes.add(apt));
        (ctrl.condicionesIncompatibles || []).forEach(cond => controles.condicionesIncompatibles.add(cond));

        // La periodicidad más corta gana
        if (ctrl.periodicidad < controles.periodicidadMinima) {
          controles.periodicidadMinima = ctrl.periodicidad;
        }

        controles.fundamentos.push(ctrl.fundamento);
      }
    });

    return controles;
  }

  /**
   * CONSOLIDACIÓN FINAL: Procesa un cargo completo
   * "El más restrictivo gana"
   */
  consolidarControlesCargo(cargo, umbrales = UMBRALES_DEFAULT) {
    const controles = {
      paqueteMinimo: PAQUETE_MINIMO_UNIVERSAL,
      porToggle: null,
      porGES: [],
      consolidado: {
        examenes: new Set(PAQUETE_MINIMO_UNIVERSAL.examenes),
        epp: new Set(),
        aptitudes: new Set(),
        condicionesIncompatibles: new Set(),
        periodicidadMinima: PAQUETE_MINIMO_UNIVERSAL.periodicidad
      },
      metadata: {
        numGESAnalizados: 0,
        numGESConControles: 0,
        nrMaximo: 0,
        gesConNRAlto: []
      }
    };

    // 1. Aplicar controles de toggles especiales (PRIORIDAD 1)
    const toggles = {
      trabajaAlturas: cargo.trabajaAlturas || false,
      manipulaAlimentos: cargo.manipulaAlimentos || false,
      conduceVehiculo: cargo.conduceVehiculo || false
    };

    controles.porToggle = this.aplicarControlesDeToggles(toggles);

    // Merge toggles a consolidado
    controles.porToggle.examenes.forEach(ex => controles.consolidado.examenes.add(ex));
    controles.porToggle.epp.forEach(epp => controles.consolidado.epp.add(epp));
    controles.porToggle.aptitudes.forEach(apt => controles.consolidado.aptitudes.add(apt));
    controles.porToggle.condicionesIncompatibles.forEach(cond =>
      controles.consolidado.condicionesIncompatibles.add(cond)
    );

    if (controles.porToggle.periodicidadMinima < controles.consolidado.periodicidadMinima) {
      controles.consolidado.periodicidadMinima = controles.porToggle.periodicidadMinima;
    }

    // 2. Procesar cada GES (PRIORIDAD 2)
    const gesSeleccionados = cargo.gesSeleccionados || [];

    gesSeleccionados.forEach(ges => {
      controles.metadata.numGESAnalizados++;

      // Calcular NP y NR
      const niveles = this.calcularNivelesRiesgo(ges);

      // Obtener config del GES
      const gesConfig = GES_DATOS_PREDEFINIDOS[ges.ges];
      if (!gesConfig) {
        console.warn(`⚠️ GES "${ges.ges}" no encontrado en config`);
        return;
      }

      // Determinar controles según NR
      const controlesGes = this.determinarControlesPorNR(niveles.nr, gesConfig, umbrales);

      // Guardar metadata
      if (niveles.nr > controles.metadata.nrMaximo) {
        controles.metadata.nrMaximo = niveles.nr;
      }

      if (niveles.nr >= 121) { // NR ≥ III (Alto)
        controles.metadata.gesConNRAlto.push({
          ges: ges.ges,
          nr: niveles.nr,
          nivel: niveles.nrNivel
        });
      }

      // Guardar detalle del GES procesado
      controles.porGES.push({
        gesNombre: ges.ges,
        tipoRiesgo: ges.riesgo,
        niveles,
        controlesAplicados: controlesGes.aplicaControles,
        controles: controlesGes,
        justificacion: controlesGes.justificacion
      });

      // Merge a consolidado (solo si aplica controles)
      if (controlesGes.aplicaControles) {
        controles.metadata.numGESConControles++;

        controlesGes.examenes.forEach(ex => controles.consolidado.examenes.add(ex));
        controlesGes.epp.forEach(epp => controles.consolidado.epp.add(epp));
        controlesGes.aptitudes.forEach(apt => controles.consolidado.aptitudes.add(apt));
        controlesGes.condicionesIncompatibles.forEach(cond =>
          controles.consolidado.condicionesIncompatibles.add(cond)
        );

        // La periodicidad más corta gana
        if (controlesGes.periodicidad < controles.consolidado.periodicidadMinima) {
          controles.consolidado.periodicidadMinima = controlesGes.periodicidad;
        }
      }
    });

    // Convertir Sets a Arrays para serializar
    controles.consolidado.examenes = Array.from(controles.consolidado.examenes);
    controles.consolidado.epp = Array.from(controles.consolidado.epp);
    controles.consolidado.aptitudes = Array.from(controles.consolidado.aptitudes);
    controles.consolidado.condicionesIncompatibles = Array.from(controles.consolidado.condicionesIncompatibles);

    return controles;
  }

  /**
   * Genera justificación técnica para auditoría
   */
  generarJustificacion(nr, aplicaEPP, aplicaExamenes) {
    const nrInfo = calcularNivelRiesgo(1, nr);

    if (nr >= 121) {
      return `Riesgo ${nrInfo.nrInterpretacion} (NR=${nr}). Requiere EPP obligatorio y vigilancia médica continua.`;
    } else if (nr >= 41) {
      return `Riesgo ${nrInfo.nrInterpretacion} (NR=${nr}). Requiere exámenes periódicos y EPP recomendado.`;
    } else {
      return `Riesgo ${nrInfo.nrInterpretacion} (NR=${nr}). No requiere controles específicos más allá del paquete mínimo universal.`;
    }
  }
}

export default new RiesgosService();
```

---

#### 1.2. Modificar flujoIa.controller.js

**Objetivo**: Calcular y persistir NR ANTES de generar documentos

```javascript
// server/src/controllers/flujoIa.controller.js
import riesgosService from '../services/riesgos.service.js';

export const registrarYGenerar = async (req, res) => {
  const { formData, userData } = req.body;

  try {
    trx = await db.transaction();

    // ... (crear empresa, usuario, documento) ...

    // 🆕 NUEVO: Enriquecer formData con cálculos de NR
    const formDataEnriquecido = {
      ...formData,
      cargos: formData.cargos.map(cargo => {
        // Consolidar controles para el cargo
        const controlesConsolidados = riesgosService.consolidarControlesCargo(cargo);

        return {
          ...cargo,

          // Enriquecer gesSeleccionados con NP/NR calculado
          gesSeleccionados: cargo.gesSeleccionados.map(ges => {
            const niveles = riesgosService.calcularNivelesRiesgo(ges);
            return {
              ...ges,
              ...niveles // Agrega np, nr, npNivel, nrNivel, etc.
            };
          }),

          // Agregar controles consolidados
          controlesConsolidados
        };
      })
    };

    // 5. Crear Cargos y Riesgos (AHORA CON NP/NR PERSISTIDO)
    for (const cargo of formDataEnriquecido.cargos) {
      const [cargoDB] = await trx('cargos_documento').insert({
        documento_id: documento.id,
        nombre_cargo: cargo.cargoName,
        area: cargo.area,
        // ... otros campos ...

        // 🆕 NUEVO: Persistir controles consolidados
        controles_consolidados: JSON.stringify(cargo.controlesConsolidados)
      }).returning('*');

      // Guardar riesgos con NP/NR calculado
      if (cargo.gesSeleccionados && Array.isArray(cargo.gesSeleccionados)) {
        for (const ges of cargo.gesSeleccionados) {
          await trx('riesgos_cargo').insert({
            cargo_id: cargoDB.id,
            tipo_riesgo: ges.riesgo,
            descripcion_riesgo: ges.ges,

            // Niveles de entrada
            nivel_deficiencia: ges.nd,
            nivel_exposicion: ges.ne,
            nivel_consecuencia: ges.nc,

            // 🆕 NUEVO: Niveles calculados (PERSISTIR)
            nivel_probabilidad: ges.np,
            nivel_probabilidad_categoria: ges.npNivel,
            nivel_riesgo: ges.nr,
            nivel_riesgo_categoria: ges.nrNivel,
            interpretacion_riesgo: ges.nrInterpretacion,
            aceptabilidad: ges.nrAceptabilidad,
            fecha_calculo: ges.fechaCalculo,

            // Controles
            controles_fuente: ges.controles?.fuente || null,
            controles_medio: ges.controles?.medio || null,
            controles_individuo: ges.controles?.individuo || null
          });
        }
      }
    }

    // 6. Generar Documentos (AHORA USANDO formDataEnriquecido)
    const [matrizBuffer, profesiogramaBuffer, perfilBuffer, cotizacionBuffer] = await Promise.all([
      generarMatrizExcel(formDataEnriquecido, { ... }),
      generarProfesiogramaPDF(formDataEnriquecido, { ... }),
      generarPerfilCargoPDF(formDataEnriquecido, { ... }),
      generarCotizacionPDF(formDataEnriquecido)
    ]);

    // ... resto del flujo (thumbnails, upload, etc.)

    await trx.commit();

    return res.json({
      success: true,
      documentToken: documento.token,
      metadata: {
        numCargos: formDataEnriquecido.cargos.length,
        gesAnalizados: formDataEnriquecido.cargos.reduce((sum, c) =>
          sum + c.controlesConsolidados.metadata.numGESAnalizados, 0
        ),
        nrMaximoGlobal: Math.max(...formDataEnriquecido.cargos.map(c =>
          c.controlesConsolidados.metadata.nrMaximo
        ))
      }
    });

  } catch (error) {
    if (trx) await trx.rollback();
    console.error('❌ Error en registrarYGenerar:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
```

---

#### 1.3. Actualizar Profesiograma Controller

**Objetivo**: Usar controles ya consolidados en lugar de aplicar config directamente

```javascript
// server/src/controllers/profesiograma.controller.js
export async function generarProfesiogramaPDF(datosFormulario, { companyName = "Empresa Cliente" } = {}) {
  const doc = new jsPDF("p", "mm", "a4");
  addPoppinsFont(doc);

  datosFormulario.cargos.forEach((cargo, index) => {
    if (index > 0) doc.addPage();
    let y = 30;

    // --- Título del Cargo ---
    doc.text(`Perfil del Cargo: ${cargo.cargoName}`, 15, y);
    y += 10;

    // 🆕 NUEVO: Usar controles ya consolidados
    const controles = cargo.controlesConsolidados;

    if (!controles) {
      console.warn(`⚠️ Cargo "${cargo.cargoName}" no tiene controlesConsolidados`);
      // Fallback: generar en el momento (no ideal)
      const riesgosService = require('../services/riesgos.service.js').default;
      controles = riesgosService.consolidarControlesCargo(cargo);
    }

    // --- Sección: Paquete Mínimo Universal ---
    y = drawList(doc, y, "Exámenes Médicos - Paquete Básico Obligatorio",
      controles.paqueteMinimo.examenes.map(code =>
        EXAM_DETAILS[code]?.fullName || code
      )
    );

    // --- Sección: Requisitos Legales Especiales (Toggles) ---
    if (controles.porToggle && controles.porToggle.examenes.size > 0) {
      const toggleExamenes = Array.from(controles.porToggle.examenes).map(code =>
        EXAM_DETAILS[code]?.fullName || code
      );

      y = drawList(doc, y, "Requisitos Legales Especiales", [
        `Fundamento: ${controles.porToggle.fundamentos.join('; ')}`,
        '',
        'Exámenes obligatorios:',
        ...toggleExamenes
      ]);

      if (controles.porToggle.epp.size > 0) {
        const toggleEPP = Array.from(controles.porToggle.epp);
        y = drawList(doc, y, "EPP Obligatorio por Requisito Legal", toggleEPP);
      }
    }

    // --- Sección: Controles por Exposición a Riesgos (Solo NR ≥ II) ---
    const gesConControles = controles.porGES.filter(g => g.controlesAplicados);

    if (gesConControles.length > 0) {
      y = drawSectionHeader(doc, y, "Controles por Exposición a Riesgos Significativos");

      gesConControles.forEach(ges => {
        y = checkPageBreak(doc, y, 40); // Verificar espacio

        doc.setFont("Poppins", "bold");
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor);
        doc.text(`● ${ges.gesNombre}`, 20, y);
        y += 5;

        doc.setFont("Poppins", "normal");
        doc.setFontSize(9);
        doc.text(`Nivel de Riesgo: ${ges.niveles.nrNivel} - ${ges.niveles.nrInterpretacion} (NR=${ges.niveles.nr})`, 25, y);
        y += 4;

        if (ges.controles.epp.length > 0) {
          doc.text(`EPP: ${ges.controles.epp.join(', ')}`, 25, y);
          y += 4;
        }

        if (ges.controles.examenes.length > 0) {
          const examenesNombres = ges.controles.examenes.map(code =>
            EXAM_DETAILS[code]?.fullName || code
          );
          doc.text(`Exámenes: ${examenesNombres.join(', ')}`, 25, y);
          y += 4;
        }

        doc.setTextColor(highlightColor);
        doc.text(`Periodicidad: ${ges.controles.periodicidad} meses`, 25, y);
        y += 6;
      });
    }

    // --- Sección: Riesgos No Significativos (NR I - Transparencia) ---
    const gesNoSignificativos = controles.porGES.filter(g => !g.controlesAplicados);

    if (gesNoSignificativos.length > 0) {
      y = drawSectionHeader(doc, y, "Riesgos No Significativos (No requieren controles específicos)");

      gesNoSignificativos.forEach(ges => {
        y = checkPageBreak(doc, y, 20);

        doc.setFont("Poppins", "normal");
        doc.setFontSize(9);
        doc.setTextColor("#666666"); // Gris para indicar "no aplica"

        doc.text(`● ${ges.gesNombre}`, 20, y);
        y += 4;
        doc.text(`  NR=${ges.niveles.nr} (${ges.niveles.nrInterpretacion}) - ${ges.justificacion}`, 25, y);
        y += 5;
      });
    }

    // --- Tabla de Exámenes Consolidados ---
    y = checkPageBreak(doc, y, 60);
    y = drawSectionHeader(doc, y, "Protocolo de Exámenes Médicos Ocupacionales");

    const examenesConsolidados = controles.consolidado.examenes.map(code =>
      EXAM_DETAILS[code]?.fullName || code
    );

    // Tabla simple de 3 columnas: Ingreso | Periódicos | Egreso
    const periodicidadTexto = `${controles.consolidado.periodicidadMinima} meses`;

    doc.autoTable({
      startY: y,
      head: [['Examen de Ingreso', 'Exámenes Periódicos', 'Examen de Egreso']],
      body: examenesConsolidados.map(ex => [ex, `${ex} (cada ${periodicidadTexto})`, 'EMO básico']),
      styles: { font: "Poppins", fontSize: 9 },
      headStyles: { fillColor: primaryColor, textColor: textColor }
    });

    y = doc.previousAutoTable.finalY + 10;

    // --- Aptitudes y Condiciones Incompatibles (Solo si NR ≥ III) ---
    if (controles.consolidado.aptitudes.length > 0) {
      y = drawList(doc, y, "Aptitudes Requeridas para el Cargo", controles.consolidado.aptitudes);
    }

    if (controles.consolidado.condicionesIncompatibles.length > 0) {
      y = drawList(doc, y, "Condiciones Médicas Incompatibles", controles.consolidado.condicionesIncompatibles);
    }

    // --- Firma y Metadatos ---
    y = checkPageBreak(doc, y, 30);
    doc.setFont("Poppins", "normal");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text(`Generado por: Sistema Genesys BI`, 15, y);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 15, y + 4);
    doc.text(`GES analizados: ${controles.metadata.numGESAnalizados} | GES con controles: ${controles.metadata.numGESConControles}`, 15, y + 8);
  });

  // Agregar headers/footers
  addHeaderAndFooter(doc, companyName);

  return Buffer.from(doc.output("arraybuffer"));
}

// Helper: Verificar salto de página
function checkPageBreak(doc, y, spaceNeeded) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + spaceNeeded > pageHeight - 20) {
    doc.addPage();
    return 30; // Nueva página, Y inicial
  }
  return y;
}
```

---

### FASE 2: Base de Datos - Schema Updates

**Duración estimada**: 1-2 días

#### 2.1. Migración: Agregar columnas NP/NR a riesgos_cargo

```javascript
// server/src/database/migrations/20251101_add_nr_to_riesgos_cargo.cjs
exports.up = function(knex) {
  return knex.schema.table('riesgos_cargo', function(table) {
    // Niveles calculados
    table.integer('nivel_probabilidad').comment('NP = ND × NE');
    table.string('nivel_probabilidad_categoria', 20).comment('Muy Alto, Alto, Medio, Bajo');
    table.integer('nivel_riesgo').comment('NR = NP × NC');
    table.string('nivel_riesgo_categoria', 10).comment('I, II, III, IV');
    table.string('interpretacion_riesgo', 100);
    table.string('aceptabilidad', 50);
    table.timestamp('fecha_calculo').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.table('riesgos_cargo', function(table) {
    table.dropColumn('nivel_probabilidad');
    table.dropColumn('nivel_probabilidad_categoria');
    table.dropColumn('nivel_riesgo');
    table.dropColumn('nivel_riesgo_categoria');
    table.dropColumn('interpretacion_riesgo');
    table.dropColumn('aceptabilidad');
    table.dropColumn('fecha_calculo');
  });
};
```

#### 2.2. Migración: Agregar controles_consolidados a cargos_documento

```javascript
// server/src/database/migrations/20251102_add_controles_consolidados_to_cargos.cjs
exports.up = function(knex) {
  return knex.schema.table('cargos_documento', function(table) {
    table.jsonb('controles_consolidados').comment('Resultado de riesgosService.consolidarControlesCargo()');
    table.integer('periodicidad_examenes').comment('Meses - del más restrictivo');
    table.integer('num_ges_con_controles').comment('Cuántos GES aportan controles');
    table.integer('nr_maximo').comment('NR más alto del cargo');
  });
};

exports.down = function(knex) {
  return knex.schema.table('cargos_documento', function(table) {
    table.dropColumn('controles_consolidados');
    table.dropColumn('periodicidad_examenes');
    table.dropColumn('num_ges_con_controles');
    table.dropColumn('nr_maximo');
  });
};
```

---

### FASE 3: Frontend - Preview en Formulario

**Duración estimada**: 3-4 días

#### 3.1. Service Frontend (compartir lógica)

**Opción A: Duplicar lógica en frontend** (más simple, menos mantenible)
**Opción B: Crear paquete npm compartido** (mejor, pero más complejo)
**Recomendación**: Opción A para MVP, migrar a B después

```javascript
// client/src/js/services/riesgos.service.js
class RiesgosServiceFrontend {
  calcularNivelProbabilidad(nd, ne) {
    const np = nd * ne;

    if (np >= 24) return { valor: np, nivel: 'Muy Alto', interpretacion: 'Situación deficiente con exposición continua' };
    if (np >= 10) return { valor: np, nivel: 'Alto', interpretacion: 'Situación deficiente con exposición frecuente' };
    if (np >= 6) return { valor: np, nivel: 'Medio', interpretacion: 'Situación deficiente con exposición ocasional' };
    return { valor: np, nivel: 'Bajo', interpretacion: 'Situación mejorable con exposición ocasional' };
  }

  calcularNivelRiesgo(np, nc) {
    const nr = np * nc;

    if (nr >= 600) return { valor: nr, nivel: 'I', interpretacion: 'Situación crítica', aceptabilidad: 'No Aceptable' };
    if (nr >= 150) return { valor: nr, nivel: 'II', interpretacion: 'Corregir medidas', aceptabilidad: 'No Aceptable o Aceptable con control' };
    if (nr >= 40) return { valor: nr, nivel: 'III', interpretacion: 'Mejorar control', aceptabilidad: 'Mejorable' };
    return { valor: nr, nivel: 'IV', interpretacion: 'Aceptable', aceptabilidad: 'Aceptable' };
  }

  previewControles(cargo) {
    // Calcular para cada GES
    return cargo.gesSeleccionados.map(ges => {
      const nd = ges.niveles?.deficiencia?.value || 0;
      const ne = ges.niveles?.exposicion?.value || 0;
      const nc = ges.niveles?.consecuencia?.value || 0;

      const np = this.calcularNivelProbabilidad(nd, ne);
      const nr = this.calcularNivelRiesgo(np.valor, nc);

      // Determinar si aplica controles
      const aplicaControles = nr.valor >= 41; // NR ≥ II
      const aplicaAptitudes = nr.valor >= 121; // NR ≥ III

      return {
        gesNombre: ges.ges,
        np: np.valor,
        npNivel: np.nivel,
        nr: nr.valor,
        nrNivel: nr.nivel,
        nrInterpretacion: nr.interpretacion,
        aplicaControles,
        aplicaAptitudes,
        mensaje: aplicaControles
          ? `✓ Se aplicarán controles (NR=${nr.valor} - ${nr.interpretacion})`
          : `⚠️ No se aplicarán controles específicos (NR=${nr.valor} - ${nr.interpretacion})`
      };
    });
  }
}

export default new RiesgosServiceFrontend();
```

#### 3.2. Componente de Preview en Formulario

```javascript
// client/src/js/components/PreviewControlesGES.js
import riesgosService from '../services/riesgos.service.js';

export class PreviewControlesGES {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
  }

  render(cargo) {
    if (!cargo || !cargo.gesSeleccionados || cargo.gesSeleccionados.length === 0) {
      this.container.innerHTML = '<p class="text-gray-500">Seleccione riesgos para ver preview de controles</p>';
      return;
    }

    const preview = riesgosService.previewControles(cargo);

    // Contar cuántos aplican controles
    const numConControles = preview.filter(p => p.aplicaControles).length;
    const numSinControles = preview.length - numConControles;

    const html = `
      <div class="preview-controles">
        <div class="preview-header">
          <h4>Preview de Controles</h4>
          <div class="stats">
            <span class="badge badge-success">${numConControles} con controles</span>
            <span class="badge badge-secondary">${numSinControles} sin controles</span>
          </div>
        </div>

        <div class="preview-list">
          ${preview.map(p => `
            <div class="preview-item ${p.aplicaControles ? 'tiene-controles' : 'sin-controles'}">
              <div class="preview-item-header">
                <span class="ges-nombre">${p.gesNombre}</span>
                <span class="badge badge-nr badge-nr-${p.nrNivel}">${p.nrNivel}</span>
              </div>
              <div class="preview-item-body">
                <p class="nr-info">NR = ${p.nr} (${p.nrInterpretacion})</p>
                <p class="preview-mensaje ${p.aplicaControles ? 'text-success' : 'text-warning'}">
                  ${p.mensaje}
                </p>
              </div>
            </div>
          `).join('')}
        </div>

        ${numSinControles > 0 ? `
          <div class="alert alert-info">
            <strong>Nota:</strong> Los ${numSinControles} riesgos marcados como "sin controles"
            son de nivel aceptable (NR I). Solo se aplicará el paquete mínimo universal.
          </div>
        ` : ''}
      </div>
    `;

    this.container.innerHTML = html;
  }
}
```

#### 3.3. Integración en Formulario Matriz

```javascript
// client/src/main_matriz_riesgos_profesional.js
import { PreviewControlesGES } from './js/components/PreviewControlesGES.js';

// Inicializar preview
const previewComponent = new PreviewControlesGES('#preview-controles-container');

// Escuchar cambios en niveles o selección de GES
function onGESChanged(cargo) {
  // Actualizar preview en tiempo real
  previewComponent.render(cargo);
}

// Agregar listeners a los inputs de niveles (ND, NE, NC)
document.querySelectorAll('.nivel-input').forEach(input => {
  input.addEventListener('change', () => {
    const cargo = getCurrentCargoData();
    onGESChanged(cargo);
  });
});
```

---

### FASE 4: Testing y Validación

**Duración estimada**: 2-3 días

#### 4.1. Unit Tests

```javascript
// server/tests/riesgos.service.test.js
import riesgosService from '../src/services/riesgos.service.js';

describe('RiesgosService', () => {
  test('Calcula NP correctamente', () => {
    const ges = {
      ges: 'Test GES',
      niveles: {
        deficiencia: { value: 6 },
        exposicion: { value: 3 },
        consecuencia: { value: 25 }
      }
    };

    const niveles = riesgosService.calcularNivelesRiesgo(ges);

    expect(niveles.np).toBe(18); // 6 * 3
    expect(niveles.nr).toBe(450); // 18 * 25
    expect(niveles.nrNivel).toBe('II'); // 450 está en rango 150-600
  });

  test('No aplica controles si NR < 41', () => {
    const cargo = {
      gesSeleccionados: [{
        ges: 'Caídas mismo nivel',
        riesgo: 'Físico',
        niveles: {
          deficiencia: { value: 2 },
          exposicion: { value: 1 },
          consecuencia: { value: 10 }
        }
      }]
    };

    const controles = riesgosService.consolidarControlesCargo(cargo);

    expect(controles.metadata.numGESConControles).toBe(0);
    expect(controles.consolidado.epp).toHaveLength(0);
  });

  test('Aplica controles de toggle independiente de NR', () => {
    const cargo = {
      trabajaAlturas: true,
      gesSeleccionados: [{
        ges: 'Caídas mismo nivel', // NR bajo
        niveles: {
          deficiencia: { value: 2 },
          exposicion: { value: 1 },
          consecuencia: { value: 10 }
        }
      }]
    };

    const controles = riesgosService.consolidarControlesCargo(cargo);

    expect(controles.consolidado.examenes).toContain('EMOA');
    expect(controles.consolidado.epp.length).toBeGreaterThan(0);
  });
});
```

#### 4.2. Integration Tests

```javascript
// server/tests/integration/flujoCompleto.test.js
describe('Flujo completo: Formulario → PDF', () => {
  test('Genera profesiograma con controles correctos', async () => {
    const formData = {
      cargos: [{
        cargoName: 'Operario Producción',
        area: 'Producción',
        gesSeleccionados: [
          {
            ges: 'Ruido industrial',
            riesgo: 'Físico',
            niveles: { deficiencia: { value: 6 }, exposicion: { value: 3 }, consecuencia: { value: 25 } }
            // NR = 450 (Alto) → SÍ aplica controles
          },
          {
            ges: 'Caídas mismo nivel',
            riesgo: 'Físico',
            niveles: { deficiencia: { value: 2 }, exposicion: { value: 1 }, consecuencia: { value: 10 } }
            // NR = 20 (Bajo) → NO aplica controles
          }
        ]
      }]
    };

    const pdfBuffer = await generarProfesiogramaPDF(formData, { companyName: 'Test' });

    // Verificar que el PDF se generó
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);

    // Opcional: Extraer texto del PDF y verificar contenido
    // const pdfText = await extractTextFromPDF(pdfBuffer);
    // expect(pdfText).toContain('Ruido industrial');
    // expect(pdfText).toContain('NR=450');
  });
});
```

---

### FASE 5: Documentación y Capacitación

**Duración estimada**: 1 día

#### 5.1. Actualizar CLAUDE.md

Agregar sección:

```markdown
## Lógica de Controles Basada en NR

Este sistema implementa una lógica robusta para determinar qué controles (EPP, exámenes médicos, aptitudes) se aplican a cada cargo basándose en el **Nivel de Riesgo (NR)** calculado.

### Arquitectura

```
Formulario (ND, NE, NC)
    ↓
riesgosService.calcularNivelesRiesgo() → NP, NR
    ↓
riesgosService.determinarControlesPorNR() → EPP, exámenes, aptitudes
    ↓
riesgosService.consolidarControlesCargo() → Merge de todos los GES + toggles
    ↓
Persistir en BD (riesgos_cargo.nivel_riesgo, cargos_documento.controles_consolidados)
    ↓
Generar PDFs (profesiograma, matriz, perfil) usando controles consolidados
```

### Umbrales Default

- **NR ≥ 121 (III - Alto)**: EPP obligatorio + exámenes anuales + aptitudes críticas
- **NR 41-120 (II - Medio)**: EPP recomendado + exámenes cada 2 años
- **NR ≤ 40 (I - Aceptable)**: Solo paquete mínimo universal

### Toggles Especiales

Independientes de NR (requisitos legales):
- `trabajaAlturas` → EMOA + examen de laboratorio
- `manipulaAlimentos` → Coprológico + KOH
- `conduceVehiculo` → Psicosensométrica + visiometría completa
```

#### 5.2. Crear Guía para Médicos

```markdown
# Guía para Médicos: Interpretación de Profesiogramas con NR

## Cómo leer el profesiograma generado

El nuevo profesiograma incluye 3 secciones clave:

1. **Paquete Mínimo Universal**: SIEMPRE se aplica
2. **Requisitos Legales Especiales**: Por toggles (alturas, conducción, alimentos)
3. **Controles por Riesgos Significativos**: Solo GES con NR ≥ II

## Riesgos No Significativos (NR I)

Si ves un riesgo en la sección "Riesgos No Significativos":
- **NO requiere EPP específico**
- **NO requiere exámenes adicionales**
- Solo paquete mínimo universal
- Justificación técnica aparece en el documento

## Validación Médica

Como médico especialista, puedes:
1. Revisar la valoración de riesgo (ND, NE, NC)
2. Verificar que los controles son coherentes con el NR
3. Agregar controles adicionales si lo consideras necesario (criterio médico)
4. Documentar cualquier modificación en el sistema
```

---

## CRONOGRAMA DE IMPLEMENTACIÓN

| Fase | Descripción | Duración | Dependencias |
|---|---|---|---|
| 1.1 | Crear riesgosService | 3 días | Ninguna |
| 1.2 | Modificar flujoIa.controller | 1 día | 1.1 |
| 1.3 | Actualizar profesiograma.controller | 2 días | 1.1, 1.2 |
| 2.1 | Migración BD: riesgos_cargo | 0.5 días | 1.2 |
| 2.2 | Migración BD: cargos_documento | 0.5 días | 1.2 |
| 3.1 | Service frontend | 1 día | Ninguna (paralelo) |
| 3.2 | Componente preview | 2 días | 3.1 |
| 3.3 | Integración en formulario | 1 día | 3.2 |
| 4.1 | Unit tests | 1 día | 1.1 |
| 4.2 | Integration tests | 2 días | 1.3, 2.2 |
| 5.1 | Documentación técnica | 0.5 días | Todo completo |
| 5.2 | Guía médica | 0.5 días | 1.3 |

**Total estimado**: 14-16 días hábiles (~3 semanas)

---

## CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Crear `server/src/services/riesgos.service.js` con lógica completa
- [ ] Modificar `flujoIa.controller.js` para enriquecer formData con NR
- [ ] Actualizar `profesiograma.controller.js` para usar controles consolidados
- [ ] Actualizar `matriz-riesgos.controller.js` (verificar que use risk-calculations.js)
- [ ] Actualizar `perfil-cargo.controller.js` (similar a profesiograma)
- [ ] Crear migración `add_nr_to_riesgos_cargo.cjs`
- [ ] Crear migración `add_controles_consolidados_to_cargos.cjs`
- [ ] Ejecutar migraciones en desarrollo

### Frontend
- [ ] Crear `client/src/js/services/riesgos.service.js` (lógica duplicada)
- [ ] Crear `client/src/js/components/PreviewControlesGES.js`
- [ ] Integrar preview en `main_matriz_riesgos_profesional.js`
- [ ] Agregar estilos para preview (badges NR, colores según nivel)
- [ ] Agregar tooltip explicativo "¿Por qué no se aplican controles?"

### Testing
- [ ] Unit tests para riesgosService.calcularNivelesRiesgo()
- [ ] Unit tests para riesgosService.consolidarControlesCargo()
- [ ] Integration test: Formulario → BD → PDF completo
- [ ] Test manual: Caso NR I (no aplica controles)
- [ ] Test manual: Caso NR III (aplica todos los controles)
- [ ] Test manual: Toggle alturas sin GES alturas

### Documentación
- [ ] Actualizar CLAUDE.md con sección de lógica NR
- [ ] Crear GUIA_MEDICA_PROFESIOGRAMAS.md
- [ ] Actualizar comentarios en código crítico
- [ ] Crear diagrama de flujo (opcional)

### Validación Final
- [ ] Generar documento real y validar con médico especialista
- [ ] Verificar trazabilidad (BD tiene NR persistido)
- [ ] Verificar que PDF incluye justificaciones
- [ ] Verificar que matriz Excel es coherente con profesiograma
- [ ] Backup de BD antes de desplegar a producción

---

## ROLLBACK PLAN

Si algo falla en producción:

1. **Inmediato**: Revertir cambios en controllers
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Base de datos**: Las columnas nuevas NO afectan funcionalidad existente
   - No es necesario revertir migraciones inmediatamente
   - Solo si hay error en queries

3. **Fallback**: Los PDFs se pueden generar con lógica anterior
   - Mantener branch `legacy-profesiograma` como backup

---

## NOTAS IMPORTANTES

1. **Verificar orden de niveles NR**: El código actual parece tener I=crítico, IV=aceptable. Confirmar con GTC-45.

2. **Paquete mínimo**: EMO + Optometría + Audiometría. Confirmar con médico si audiometría es siempre obligatoria.

3. **Periodicidad**: Actualmente en meses. Verificar que se muestra correctamente en PDFs.

4. **Thumbnails**: No afectados por este cambio, pero verificar que siguen generándose correctamente.

5. **Cotización**: Verificar si necesita mostrar "X controles aplicados" vs "Y omitidos".

---

**Última actualización**: Octubre 2025
**Próxima revisión**: Al completar Fase 1
