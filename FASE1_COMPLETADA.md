# FASE 1 COMPLETADA: Backend - Service de Lógica de Riesgos

**Fecha de completación**: Octubre 2025
**Tiempo estimado**: 3-4 días → **Completado en 1 sesión**

---

## ✅ ARCHIVOS CREADOS

### 1. `server/src/services/riesgos.service.js` (NUEVO)

**Núcleo del sistema** - 400+ líneas de código

**Funcionalidades implementadas**:
- ✅ `calcularNivelesRiesgo(ges)` → Calcula NP/NR usando `risk-calculations.js`
- ✅ `determinarControlesPorNR(nr, gesConfig, umbrales)` → Decide qué controles aplicar según NR
- ✅ `aplicarControlesDeToggles(toggles)` → Controles obligatorios por ley (alturas, alimentos, conducción)
- ✅ `consolidarControlesCargo(cargo, umbrales)` → **Función principal** - consolida todo
- ✅ `generarJustificacion(nr, nrInfo, aplicaEPP, aplicaExamenes)` → Trazabilidad para auditorías

**Constantes definidas**:
- `PAQUETE_MINIMO_UNIVERSAL`: EMO + OPTO + AUD (36 meses)
- `UMBRALES_DEFAULT`: NR ≥ 121 para EPP, ≥ 41 para exámenes
- `CONTROLES_TOGGLES`: Requisitos legales (Res. 1409/2012, 2674/2013, 1565/2014)

**Lógica implementada**:
```
PRIORIDAD 1: Toggles especiales (requisitos legales)
    ↓
PRIORIDAD 2: GES con NR ≥ umbral
    ↓
PRIORIDAD 3: Paquete mínimo universal
    ↓
RESULTADO: "El más restrictivo gana"
```

---

## ✅ ARCHIVOS MODIFICADOS

### 2. `server/src/controllers/flujoIa.controller.js`

**Líneas modificadas**: ~40 líneas agregadas

**Cambios**:
1. **Import del service** (línea 16):
   ```javascript
   import riesgosService from '../services/riesgos.service.js';
   ```

2. **Enriquecimiento de formData** (líneas 114-150):
   ```javascript
   const formDataEnriquecido = {
       ...formData,
       cargos: formData.cargos.map(cargo => {
           const controlesConsolidados = riesgosService.consolidarControlesCargo(cargo);
           return {
               ...cargo,
               gesSeleccionados: cargo.gesSeleccionados.map(ges => ({
                   ...ges,
                   ...riesgosService.calcularNivelesRiesgo(ges) // Agrega np, nr, npNivel, etc.
               })),
               controlesConsolidados
           };
       })
   };
   ```

3. **Generación de documentos con formDataEnriquecido** (línea 211):
   ```javascript
   generarMatrizExcel(formDataEnriquecido, { ... }),
   generarProfesiogramaPDF(formDataEnriquecido, { ... }),
   generarPerfilCargoPDF(formDataEnriquecido, { ... }),
   generarCotizacionPDF(formDataEnriquecido)
   ```

4. **Preparación para persistir NP/NR en BD** (líneas 182-189 - comentadas):
   - Código listo para cuando se agreguen las columnas en Fase 2

**Resultado**: Ahora TODOS los documentos usan la misma fuente de verdad para NP/NR

---

### 3. `server/src/controllers/profesiograma.controller.js`

**Líneas modificadas**: ~90 líneas reemplazadas

**Cambios críticos**:
1. **Import del service** (línea 8):
   ```javascript
   import riesgosService from "../services/riesgos.service.js";
   ```

2. **Reemplazo de lógica de consolidación** (líneas 162-199):
   - ❌ **ANTES**: Iteraba sobre `gesSeleccionados` y aplicaba TODOS los controles de `ges-config.js`
   - ✅ **AHORA**: Usa `cargo.controlesConsolidados` (ya calculado en flujoIa)
   - Fallback incluido si `controlesConsolidados` no existe

3. **Uso de controles consolidados** (líneas 214-216):
   ```javascript
   y = drawList(doc, y, "Aptitudes y Requerimientos para el Cargo", controles.consolidado.aptitudes);
   y = drawList(doc, y, "Condiciones Médicas Incompatibles", controles.consolidado.condicionesIncompatibles);
   y = drawList(doc, y, "Elementos de Protección Personal (EPP) Requeridos", controles.consolidado.epp);
   ```

4. **Tabla de exámenes consolidada** (líneas 232-249):
   ```javascript
   (controles.consolidado.examenes || []).forEach((code) => {
       let examName = EXAM_DETAILS[code]?.fullName || code;
       examenesIngreso.push(examName);
       const periodicidadTexto = `(cada ${controles.consolidado.periodicidadMinima} meses)`;
       examenesPeriodicos.push(`${examName} ${periodicidadTexto}`);
   });
   ```

**Resultado**: El profesiograma ahora aplica controles SOLO si NR ≥ umbrales

---

### 4. `server/src/controllers/matriz-riesgos.controller.js`

**Estado**: ✅ **YA ESTABA CORRECTO** - No requirió cambios

**Verificación**:
- Ya usa `calcularNivelProbabilidad()` y `calcularNivelRiesgo()` de `risk-calculations.js` (líneas 320-322)
- Los cálculos son consistentes con el nuevo service

---

## 📋 ESTRUCTURA DE DATOS GENERADA

Cuando un formulario se procesa, cada cargo ahora tiene:

```javascript
cargo: {
    cargoName: String,
    area: String,
    trabajaAlturas: Boolean,
    manipulaAlimentos: Boolean,
    conduceVehiculo: Boolean,

    // 🆕 GES enriquecidos con cálculos
    gesSeleccionados: [{
        ges: "Ruido industrial",
        riesgo: "Físico",
        niveles: { deficiencia: {value: 6}, exposicion: {value: 3}, consecuencia: {value: 25} },

        // 🆕 Calculados por riesgosService
        nd: 6,
        ne: 3,
        nc: 25,
        np: 18,
        npNivel: "Alto",
        npInterpretacion: "Situación deficiente con exposición frecuente",
        nr: 450,
        nrNivel: "II",
        nrInterpretacion: "Corregir o adoptar medidas de control",
        nrAceptabilidad: "No Aceptable o Aceptable con control específico",
        fechaCalculo: "2025-10-31T...",
        metodoCalculo: "GTC-45-2012"
    }],

    // 🆕 Controles consolidados
    controlesConsolidados: {
        paqueteMinimo: {
            examenes: ["EMO", "OPTO", "AUD"],
            periodicidad: 36,
            fundamento: "Resolución 1843/2025..."
        },

        porToggle: {
            examenes: ["EMOA", "GLI", "PL", ...],
            epp: ["Arnés de seguridad...", ...],
            aptitudes: ["Equilibrio...", ...],
            condicionesIncompatibles: ["Epilepsia...", ...],
            periodicidadMinima: 12,
            fundamentos: ["Resolución 1409/2012..."]
        },

        porGES: [{
            gesNombre: "Ruido industrial",
            tipoRiesgo: "Físico",
            niveles: { ... }, // NP/NR calculados
            controlesAplicados: true,
            controles: {
                epp: ["Protección auditiva..."],
                examenes: ["AUD"],
                aptitudes: ["Audición funcional"],
                condicionesIncompatibles: ["Hipoacusia severa"],
                periodicidad: 12
            },
            justificacion: "Riesgo Corregir o adoptar medidas de control (NR=450, Nivel II)..."
        }],

        consolidado: {
            examenes: ["EMO", "OPTO", "AUD", "EMOA", "GLI", ...], // Unión de todos
            epp: ["Arnés...", "Protección auditiva...", ...],
            aptitudes: ["Equilibrio", "Audición funcional", ...],
            condicionesIncompatibles: ["Epilepsia", "Hipoacusia severa", ...],
            periodicidadMinima: 12 // El más restrictivo (menor valor)
        },

        metadata: {
            numGESAnalizados: 5,
            numGESConControles: 2,
            nrMaximo: 450,
            nrMinimo: 20,
            gesConNRAlto: [{ ges: "Ruido", nr: 450, nivel: "II", interpretacion: "..." }],
            gesConNRBajo: [{ ges: "Caídas mismo nivel", nr: 20, nivel: "IV", interpretacion: "..." }]
        }
    }
}
```

---

## 🧪 TESTING MANUAL

### Caso de Prueba 1: GES con NR Bajo (No aplica controles)

**Setup**:
```javascript
{
    cargoName: "Asistente Administrativo",
    gesSeleccionados: [{
        ges: "Caídas al mismo nivel",
        riesgo: "Físico",
        niveles: { deficiencia: {value: 2}, exposicion: {value: 1}, consecuencia: {value: 10} }
        // NP = 2 * 1 = 2 (Bajo)
        // NR = 2 * 10 = 20 (Nivel IV - Aceptable)
    }]
}
```

**Resultado esperado**:
- ✅ Profesiograma debe mostrar:
  - Paquete mínimo: EMO + OPTO + AUD
  - EPP: Lista vacía o mensaje "No requerido"
  - Aptitudes: Lista vacía
  - Periodicidad: 36 meses

**Consola debe mostrar**:
```
  ✓ Cargo "Asistente Administrativo": 1 GES analizados, 0 con controles
```

---

### Caso de Prueba 2: GES con NR Alto (Aplica controles)

**Setup**:
```javascript
{
    cargoName: "Operario Producción",
    gesSeleccionados: [{
        ges: "Ruido industrial",
        riesgo: "Físico",
        niveles: { deficiencia: {value: 6}, exposicion: {value: 3}, consecuencia: {value: 25} }
        // NP = 6 * 3 = 18 (Alto)
        // NR = 18 * 25 = 450 (Nivel II - Corregir medidas)
    }]
}
```

**Resultado esperado**:
- ✅ Profesiograma debe mostrar:
  - Paquete mínimo: EMO + OPTO + AUD
  - Exámenes adicionales: Audiometría tonal
  - EPP: Protección auditiva tipo copa
  - Aptitudes: Audición funcional
  - Periodicidad: 12 meses (porque NR ≥ 121)

**Consola debe mostrar**:
```
  ✓ Cargo "Operario Producción": 1 GES analizados, 1 con controles
```

---

### Caso de Prueba 3: Toggle especial (sobrescribe NR)

**Setup**:
```javascript
{
    cargoName: "Técnico Mantenimiento",
    trabajaAlturas: true,
    gesSeleccionados: [{
        ges: "Caídas al mismo nivel", // NR=20 (Bajo)
        niveles: { deficiencia: {value: 2}, exposicion: {value: 1}, consecuencia: {value: 10} }
    }]
}
```

**Resultado esperado**:
- ✅ Profesiograma debe mostrar:
  - Paquete mínimo: EMO + OPTO + AUD
  - Exámenes por toggle: EMOA + GLI + PL + PE + ESP + ECG
  - EPP: Arnés, línea de vida, casco, calzado antideslizante
  - Aptitudes: Equilibrio, sin vértigo, agudeza visual
  - Periodicidad: 12 meses (por toggle, aunque NR sea bajo)

**Consola debe mostrar**:
```
  ✓ Cargo "Técnico Mantenimiento": 1 GES analizados, 0 con controles
```
*(0 controles POR GES, pero SÍ controles por toggle)*

---

### Caso de Prueba 4: Múltiples GES (el más restrictivo gana)

**Setup**:
```javascript
{
    cargoName: "Operario Químicos",
    gesSeleccionados: [
        { ges: "Ruido", niveles: {deficiencia: {value: 6}, exposicion: {value: 3}, consecuencia: {value: 25}} }, // NR=450
        { ges: "Caídas mismo nivel", niveles: {deficiencia: {value: 2}, exposicion: {value: 1}, consecuencia: {value: 10}} }, // NR=20
        { ges: "Químicos", niveles: {deficiencia: {value: 2}, exposicion: {value: 2}, consecuencia: {value: 25}} } // NR=100
    ]
}
```

**Resultado esperado**:
- ✅ Profesiograma debe mostrar:
  - Exámenes: EMO + OPTO + AUD + Audiometría (por ruido)
  - EPP: Protección auditiva (por ruido) + Guantes químicos (por químicos)
  - Periodicidad: **12 meses** (la más restrictiva - por Ruido NR=450)

**Consola debe mostrar**:
```
  ✓ Cargo "Operario Químicos": 3 GES analizados, 2 con controles
```
*(Ruido y Químicos aplican controles, Caídas no)*

---

## 🐛 CÓMO PROBAR

### 1. Iniciar el servidor de desarrollo

```bash
cd server
npm run dev
```

### 2. Llenar formulario de matriz de riesgos

Ir a: `http://localhost:3000/pages/Matriz_de_riesgos_profesional.html`

**Datos de prueba**:
- Empresa: Test Fase 1
- NIT: 900000000
- Email: test@genesys.com
- Password: test123

**Agregar cargo**:
- Nombre: Operario Producción
- Área: Producción
- Descripción: Opera maquinaria ruidosa

**Agregar GES**:
- Tipo riesgo: Físico
- GES: Ruido industrial
- ND: 6 (Deficiente)
- NE: 3 (Frecuente)
- NC: 25 (Grave)

### 3. Verificar consola del servidor

Buscar logs:
```
🔄 Calculando NP/NR y consolidando controles para cada cargo...
  ✓ Cargo "Operario Producción": 1 GES analizados, 1 con controles
📄 Generando documentos finales para: Test Fase 1
Buffers de documentos finales generados.
```

### 4. Verificar PDF generado

**Abrir profesiograma.pdf** y verificar:
- ✅ Sección "Resumen del Cargo y Riesgos" muestra: `Físico - Ruido industrial (NR=450)`
- ✅ Sección "Características Específicas" aparece solo si hay toggles
- ✅ Sección "Aptitudes" contiene: "Audición funcional"
- ✅ Sección "EPP" contiene: "Protección auditiva tipo copa"
- ✅ Tabla de exámenes contiene: Audiometría tonal (cada 12 meses)

---

## ❌ ERRORES COMUNES Y SOLUCIONES

### Error 1: "GES no tiene niveles completos"

**Causa**: El formulario no envió ND, NE o NC

**Solución**: Verificar que el frontend envíe:
```javascript
niveles: {
    deficiencia: { value: Number },
    exposicion: { value: Number },
    consecuencia: { value: Number }
}
```

---

### Error 2: "controlesConsolidados is undefined"

**Causa**: El cargo no pasó por `riesgosService.consolidarControlesCargo()`

**Solución**: Verificar que flujoIa.controller.js está enriqueciendo correctamente:
- Revisar logs: `🔄 Calculando NP/NR y consolidando controles...`
- Si no aparece, verificar que el import del service esté correcto

---

### Error 3: Profesiograma muestra TODOS los exámenes (como antes)

**Causa**: El profesiograma sigue usando lógica antigua

**Solución**:
- Verificar que profesiograma.controller.js tiene el import de riesgosService (línea 8)
- Verificar que usa `controles.consolidado.examenes` (línea 232)

---

## 📊 IMPACTO DE LA FASE 1

### Antes vs Después

| Aspecto | ANTES | DESPUÉS |
|---------|-------|---------|
| Cálculo de NR | Cada generador independiente | **1 fuente única de verdad** |
| Aplicación de controles | **SIEMPRE** todos los controles | **Condicional** según NR |
| Trazabilidad | ❌ No persistido | ✅ Listo para persistir (Fase 2) |
| Toggles especiales | Manual en cada generador | **Centralizado** en service |
| Justificaciones | ❌ No existían | ✅ Generadas automáticamente |
| Coherencia matriz-profesiograma | ❌ Podían diferir | ✅ **100% consistentes** |

---

## 🚀 PRÓXIMOS PASOS (FASE 2)

1. **Migraciones de BD** (1 día):
   - Agregar columnas NP/NR a `riesgos_cargo`
   - Agregar `controles_consolidados` JSON a `cargos_documento`

2. **Descomentar persistencia** en flujoIa.controller.js (líneas 182-189)

3. **Actualizar perfil-cargo.controller.js** (similar a profesiograma)

4. **Testing en desarrollo** con BD actualizada

---

## ✅ CHECKLIST DE FASE 1

- [x] Crear `riesgosService.js` con lógica completa
- [x] Modificar `flujoIa.controller.js` para enriquecer formData
- [x] Actualizar `profesiograma.controller.js` para usar controles consolidados
- [x] Verificar `matriz-riesgos.controller.js` (ya estaba correcto)
- [x] Testing manual - PDF generado correctamente
- [x] Validar PDF generado - **HALLAZGOS IDENTIFICADOS** ⚠️

---

## 🔍 HALLAZGOS DEL TESTING (31/10/2025)

### ✅ LO QUE FUNCIONA CORRECTAMENTE

1. **Los NR se calculan y muestran**: Aparecen en el PDF como "(NR=600)", "(NR=1440)"
2. **La lógica condicional funciona**:
   - Si NR ≥ 501 → Aplica exámenes semestrales ✅
   - Si NR ≥ 121 → Aplica aptitudes y EPP ✅
3. **La consolidación funciona**: "El más restrictivo gana" - periodicidad 6 meses porque hay GES críticos

### ⚠️ PROBLEMAS IDENTIFICADOS

#### Problema 1: INPUT DEL USUARIO (NO ES FALLO DEL CÓDIGO)

**Caso de prueba real**: "Travel Group - Auxiliar Contable, Contador"
- **Cargo**: Administrativo de oficina
- **GES seleccionados**: 17 riesgos
- **NR reportados**:
  - Radiaciones ionizantes: NR=600 (Crítico)
  - Movimientos repetitivos: NR=1000 (Crítico)
  - Atención de público: NR=1440 (Crítico)
  - Accidente de tránsito: NR=1200 (Crítico)

**Análisis**:
- ❌ **NR irrealistas para cargo administrativo**: Un auxiliar contable NO debería tener exposición a radiaciones ionizantes con NR=600
- ❌ **Niveles de entrada muy altos**: Usuario seleccionó ND, NE, NC que resultan en NR críticos
- ✅ **El código funcionó correctamente**: Al tener NR ≥ 501, aplicó exámenes semestrales (como debe ser)

**Valores realistas para administrativo**:
```
Movimientos repetitivos (teclado/mouse):
- ND: 2, NE: 4, NC: 10 → NR = 80 (Medio)
- Resultado esperado: Exámenes cada 2 años, EPP recomendado

Posturas prolongadas (sedente):
- ND: 2, NE: 3, NC: 10 → NR = 60 (Medio)
- Resultado esperado: Evaluación osteomuscular cada 2 años

Atención de público:
- ND: 2, NE: 2, NC: 10 → NR = 40 (Aceptable)
- Resultado esperado: Solo paquete mínimo universal
```

**Conclusión**: Necesitamos validación/sugerencias de niveles en el formulario frontend.

---

#### Problema 2: DISEÑO DEL PDF INCOMPLETO

Comparando PDF generado vs `figma design profesiograma/documento_profesiograma.md`:

**FALTA el 90% del contenido profesional**:

❌ No incluye:
1. Portada con info empresa, versión, fechas, vigencia
2. Información del médico responsable (nombre, licencia, firma)
3. Objeto del documento (párrafo normativo)
4. Alcance (tipos de evaluaciones)
5. Marco normativo (Res. 1843/2025, Decreto 1072, etc.)
6. Definiciones (evaluación médica, perfil de cargo, aptitud)
7. Metodología de elaboración (6.1-6.4)
8. Criterios generales (evaluación básica, periodicidad por nivel)
9. **Tabla detallada de factores de riesgo** (Sección 8.3 con columnas: Factor, Descripción, Nivel Exposición, Valoración)
10. **Justificación de cada examen** (columna "Justificación")
11. Separación A/B/C/D/E/F (Preingreso, Periódica, Egreso, Retorno, Post-incapacidad, Seguimiento)
12. Sistemas de vigilancia epidemiológica aplicables
13. Indicadores biológicos de exposición
14. **Contraindicaciones estructuradas por sistema**
15. Recomendaciones generales para el cargo (EPP, pausas, rotación)
16. Responsabilidades (médico, empleador, trabajador)
17. Gestión de resultados
18. Indicadores de gestión
19. Revisión y actualización
20. Control de cambios
21. Aprobación y firmas (médico, revisor, aprobador)
22. Anexos

**El PDF actual solo tiene** (3 páginas):
- ✅ Título del cargo y área
- ✅ Lista de GES con NR
- ✅ Aptitudes (mezcladas todas sin agrupar)
- ✅ Condiciones incompatibles (mezcladas)
- ✅ EPP (mezclados)
- ✅ Tabla de exámenes básica (3 columnas)

**El PDF ideal debería tener** (15-20 páginas):
- Documento formal tipo "Protocolo de Vigilancia de la Salud Ocupacional"
- Estructura completa según Resolución 1843/2025
- Justificación técnica de cada control
- Separación clara entre riesgos significativos y no significativos

---

#### Problema 3: NO HAY SEPARACIÓN VISUAL DE RIESGOS

**Situación actual**: Todas las aptitudes, condiciones y EPP aparecen mezcladas en listas únicas.

**Debería mostrar**:

```
## RIESGOS SIGNIFICATIVOS (Requieren controles)

### 1. Movimientos repetitivos (NR=1000 - Nivel I - Crítico)
**Justificación**: Exposición continua a digitación y uso de mouse

**Controles aplicados**:
- EPP: Apoyo ergonómico para muñecas
- Exámenes: Evaluación osteomuscular (cada 6 meses)
- Aptitudes requeridas: Buena salud osteomuscular en manos
- Condiciones incompatibles: Síndrome túnel carpiano sintomático

---

### 2. Posturas prolongadas (NR=600 - Nivel I - Crítico)
...

---

## RIESGOS NO SIGNIFICATIVOS (No requieren controles adicionales)

### Caídas al mismo nivel (NR=20 - Nivel IV - Aceptable)
**Justificación técnica**: Riesgo controlado con medidas existentes (pisos adecuados, iluminación, orden y aseo).

**Decisión técnica**: No se requieren EPP ni exámenes específicos más allá del paquete mínimo universal.

**Base normativa**: Resolución 1843/2025, Artículo 8 - Justificación técnica de evaluaciones según exposición.
```

---

## 🎯 QUÉ SIGUE - PRIORIDADES

### PRIORIDAD 1: Validación de INPUT (Frontend) ⚡ URGENTE

**Problema**: Usuarios pueden ingresar niveles irrealistas.

**Solución**: En `main_matriz_riesgos_profesional.js`:
1. Agregar sugerencias de niveles por tipo de cargo
2. Warning si NR > 500: "⚠️ NR Crítico - ¿Está seguro? Este nivel implica exámenes semestrales"
3. Validación: "Personal administrativo con radiación ionizante NR=600 es inusual"

**Tiempo estimado**: 1-2 días

---

### PRIORIDAD 2: Mejorar Visualización PDF (Intermedio) 🎨

**Objetivo**: Separar riesgos significativos de no significativos en el PDF.

**Cambios en `profesiograma.controller.js`**:
1. Dividir `controles.porGES` en dos grupos:
   - `gesConControles` (NR ≥ II)
   - `gesSinControles` (NR I)
2. Generar secciones separadas en PDF
3. Agregar columna "Justificación" en tabla de exámenes

**Tiempo estimado**: 2-3 días

---

### PRIORIDAD 3: Rediseño Completo del PDF (Proyecto grande) 📄

**Objetivo**: Implementar diseño completo según `documento_profesiograma.md`.

**Alcance**:
- 15-20 páginas de documento profesional
- Todas las secciones normativas
- Justificaciones técnicas detalladas
- Firmas y control de cambios

**Tiempo estimado**: 1-2 semanas

**Decisión**: ¿Vale la pena? El PDF actual cumple función básica, pero no es "presentable" a auditorías.

---

## 📊 RESUMEN EJECUTIVO

| Aspecto | Estado | Acción Requerida |
|---------|--------|------------------|
| **Lógica de cálculo NP/NR** | ✅ **Funciona** | Ninguna |
| **Aplicación condicional de controles** | ✅ **Funciona** | Ninguna |
| **Consolidación "el más restrictivo"** | ✅ **Funciona** | Ninguna |
| **Validación de input usuario** | ❌ **Falta** | PRIORIDAD 1 - Urgente |
| **Separación visual en PDF** | ⚠️ **Incompleto** | PRIORIDAD 2 - Importante |
| **Diseño completo del PDF** | ❌ **Falta 90%** | PRIORIDAD 3 - Opcional |

---

**Fase 1 completada técnicamente** ✅
**Requiere mejoras de UX y diseño** ⚠️

**Siguiente paso recomendado**:
1. **PRIORIDAD 1** - Validación de input en frontend
2. Luego **PRIORIDAD 2** - Mejorar visualización PDF
3. En paralelo: **Fase 2** - Migraciones de BD
