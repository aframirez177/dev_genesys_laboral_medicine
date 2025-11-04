# 🎯 Estado Actual del Wizard SST - Genesys Laboral Medicine

**Fecha última actualización:** 3 de Noviembre de 2025 - Sesión Nocturna
**Status:** 🟡 **90% FUNCIONAL - BUGS CRÍTICOS DETECTADOS**
**URL:** http://localhost:8080/pages/wizard_example.html

---

## 🐛 BUGS CRÍTICOS PENDIENTES

### 1. **❌ CRÍTICO: Radio Buttons se Comparten Entre Riesgos**

**Problema:**
- Al marcar niveles (ND/NE/NC) en el primer riesgo, esos mismos valores aparecen marcados en el segundo riesgo
- Al cambiar valores en un riesgo, los checkmarks se mueven en TODOS los riesgos
- Los controles (textareas) también se pre-llenan con datos del riesgo anterior

**Ejemplo:**
1. Riesgo 1 (Caídas de altura): ND=0, NE=1, NC=10
2. Avanzar a Riesgo 2 (Alta tensión)
3. **BUG:** Aparece con ND=0, NE=1, NC=10 (valores del riesgo 1)
4. Cambiar a ND=6
5. Regresar a Riesgo 1
6. **BUG:** Ahora aparece con ND=6 (el valor cambió!)

**Causa raíz identificada:**
```javascript
// En Wizard.js línea 479
Rendering step: controles-0-0 with data: undefined

// En diagnosticoSteps.js línea 578-579
📦 Data received: {}
📌 data.nd=undefined, data.ne=undefined, data.nc=undefined
```

**El wizard NO está pasando los datos guardados al renderizar el paso.**

**Solución propuesta:**
Cambiar de `?checked` (attribute binding) a `.checked` (property binding) en lit-html para FORZAR el estado de los radio buttons.

**Archivos a modificar:**
- `client/src/components/wizard/diagnosticoSteps.js` - Líneas 954, 963, 972, 981 (ND)
- `client/src/components/wizard/diagnosticoSteps.js` - Líneas 1004, 1013, 1022, 1031 (NE)
- `client/src/components/wizard/diagnosticoSteps.js` - Líneas 1054, 1063, 1072, 1081 (NC)

**Cambio necesario:**
```javascript
// ANTES (incorrecto)
<input type="radio" name="nd-${cargoIndex}-${gesIndex}" value="0" ?checked=${data.nd === '0'} />

// DESPUÉS (correcto)
<input type="radio" name="nd-${cargoIndex}-${gesIndex}" value="0" .checked=${data.nd === '0'} />
```

**Total de líneas a cambiar:** 12 líneas (4 para ND + 4 para NE + 4 para NC)

---

### 2. **⚠️ MEDIO: Chips de IA No Persisten al Navegar Atrás (A Veces)**

**Problema:**
- Los chips de controles (sugerencias de IA) no siempre aparecen al navegar hacia atrás
- Parecen depender del timing del cache

**Solución ya implementada pero necesita verificación:**
- Se agregó verificación de cache antes de fetch (líneas 1278-1311)
- Necesita testing después de arreglar bug crítico #1

---

## ✅ BUGS ARREGLADOS (Sesión Actual)

### 1. ✅ Checkmarks Duplicados Entre Riesgos
- **Problema:** Los checkmarks del riesgo 2 aparecían también en el riesgo 1
- **Solución:** Eliminados checkmarks del HTML estático, agregados data-attributes únicos
- **Estado:** ARREGLADO

### 2. ✅ Múltiples Checkmarks en el Mismo Nivel
- **Problema:** Aparecían 2-3 checkmarks en un mismo nivel
- **Solución:** Limpieza exhaustiva antes de agregar nuevo checkmark
- **Estado:** ARREGLADO

### 3. ✅ Tooltips que Había que Cerrar 3 Veces
- **Problema:** Al hacer clic en "?" salían 3 alerts
- **Solución:** Agregado `data-listenerAdded` para evitar event listeners duplicados
- **Estado:** ARREGLADO (líneas 1495-1510)

### 4. ✅ Chips de Controles No Aparecen en Segundo Cargo
- **Problema:** Los chips solo aparecían en el primer cargo
- **Solución:** Verificación de cache antes de fetch, función `showSuggestions()` reutilizable
- **Estado:** ARREGLADO (líneas 1234-1311)

---

## 📊 ARQUITECTURA DEL WIZARD

### Archivos Principales

**1. Backend - Endpoints de IA:**
- `server/src/routes/ia/aiSuggestions.routes.js` - Rutas de IA
- `server/src/controllers/ia/aiSuggestions.controller.js` - Controladores
- `server/src/services/ia/aiSuggestions.service.js` - Lógica de sugerencias

**2. Frontend - Componentes del Wizard:**
- `client/src/components/wizard/Wizard.js` - Motor principal del wizard (531 líneas)
- `client/src/components/wizard/diagnosticoSteps.js` - Pasos del diagnóstico (1806 líneas) **← AQUÍ ESTÁ EL BUG**
- `client/src/js/main_wizard_example.js` - Entry point y lógica dinámica (407 líneas)
- `client/src/state/CargoState.js` - Gestión de estado
- `client/src/state/PersistenceManager.js` - Auto-guardado

**3. Estilos:**
- `client/src/styles/scss/components/_wizard.scss` - Estilos del wizard (549 líneas)

### Flujo de Datos Crítico

```
1. Usuario marca ND=0 en Riesgo 1
   ↓
2. Click "Siguiente" → Wizard.next()
   ↓
3. step.getData() obtiene valores de los radio buttons
   → { nd: '0', ne: '1', nc: '10', fuente: '...', medio: '...', individuo: '...' }
   ↓
4. Datos se guardan en this.data['controles-0-0']
   ↓
5. Usuario avanza a Riesgo 2 (controles-0-1)
   ↓
6. ❌ BUG: Wizard.render() pasa this.data['controles-0-1'] || {} = {}
   ↓
7. step.render({}) renderiza con data vacía
   ↓
8. Radio buttons con ?checked=${undefined === '0'} NO se desmarcabn
   ↓
9. Los radio buttons conservan estado anterior del DOM
```

---

## 🔧 SOLUCIÓN DETALLADA PARA BUG CRÍTICO

### Cambio en diagnosticoSteps.js

**Buscar y reemplazar:**
```javascript
// BUSCAR (12 ocurrencias):
?checked=${data.nd ===
?checked=${data.ne ===
?checked=${data.nc ===

// REEMPLAZAR CON:
.checked=${data.nd ===
.checked=${data.ne ===
.checked=${data.nc ===
```

**Diferencia clave:**
- `?checked` (attribute): Solo AGREGA el atributo si es true, nunca lo REMUEVE
- `.checked` (property): ESTABLECE la propiedad JavaScript, forzando true/false

**Ubicación exacta de los cambios:**

**ND (Nivel de Deficiencia):**
- Línea 954: `<input type="radio" name="nd-${cargoIndex}-${gesIndex}" value="0" .checked=${data.nd === '0'}`
- Línea 963: value="2"
- Línea 972: value="6"
- Línea 981: value="10"

**NE (Nivel de Exposición):**
- Línea 1004: `<input type="radio" name="ne-${cargoIndex}-${gesIndex}" value="1" .checked=${data.ne === '1'}`
- Línea 1013: value="2"
- Línea 1022: value="3"
- Línea 1031: value="4"

**NC (Nivel de Consecuencia):**
- Línea 1054: `<input type="radio" name="nc-${cargoIndex}-${gesIndex}" value="10" .checked=${data.nc === '10'}`
- Línea 1063: value="25"
- Línea 1072: value="60"
- Línea 1081: value="100"

---

## 🧪 PLAN DE TESTING POST-FIX

### Test 1: Valores Independientes por Riesgo
```
1. Llenar wizard hasta Controles del Riesgo 1
2. Marcar: ND=0, NE=1, NC=10
3. Escribir controles: "Control fuente 1", "Control medio 1", "Control individuo 1"
4. Avanzar a Riesgo 2
5. ✅ Verificar: NO hay ningún valor marcado
6. ✅ Verificar: Los textareas están vacíos
7. Marcar: ND=6, NE=3, NC=25
8. Escribir controles: "Control fuente 2", etc.
9. Regresar a Riesgo 1
10. ✅ Verificar: Aparece ND=0, NE=1, NC=10 (valores originales)
11. ✅ Verificar: Textareas tienen "Control fuente 1", etc.
```

### Test 2: Navegación Adelante/Atrás
```
1. Llenar Riesgo 1 completo
2. Llenar Riesgo 2 completo
3. Navegar: Atrás → Adelante → Atrás → Adelante
4. ✅ Verificar: Los valores se mantienen correctos en cada riesgo
5. ✅ Verificar: Los checkmarks se restauran correctamente
6. ✅ Verificar: La calculadora muestra los valores correctos
```

### Test 3: Múltiples Cargos y Riesgos
```
1. Configurar 2 cargos, 3 riesgos cada uno = 6 pasos de controles
2. Llenar todos con valores diferentes
3. Navegar entre todos los pasos
4. ✅ Verificar: Cada paso mantiene sus propios valores
```

---

## 📝 PROMPT PARA CONTINUAR EN PRÓXIMA SESIÓN

**Contexto:**
Estamos trabajando en el wizard de diagnóstico SST. Se detectó un bug CRÍTICO donde los valores de niveles (ND/NE/NC) y controles se comparten entre diferentes riesgos en lugar de ser independientes.

**Bug crítico identificado:**
Los radio buttons en `client/src/components/wizard/diagnosticoSteps.js` usan `?checked` (attribute binding) en lugar de `.checked` (property binding), lo que hace que NO se desmarcen correctamente cuando `data` es vacío o undefined.

**Tarea inmediata:**
1. Abrir archivo: `client/src/components/wizard/diagnosticoSteps.js`
2. Buscar TODAS las ocurrencias de `?checked=${data.nd` (líneas ~954, 963, 972, 981)
3. Buscar TODAS las ocurrencias de `?checked=${data.ne` (líneas ~1004, 1013, 1022, 1031)
4. Buscar TODAS las ocurrencias de `?checked=${data.nc` (líneas ~1054, 1063, 1072, 1081)
5. Reemplazar `?checked=` con `.checked=` en TODAS esas líneas (total: 12 cambios)
6. Guardar archivo
7. Recargar wizard en navegador: http://localhost:8080/pages/wizard_example.html
8. Ejecutar Test 1 del plan de testing (ver arriba)
9. Reportar si el bug está arreglado

**Archivos de referencia:**
- Bug está en: `/home/aframirez1772/dev_genesys_laboral_medicine/client/src/components/wizard/diagnosticoSteps.js`
- Documentación: `/home/aframirez1772/dev_genesys_laboral_medicine/BUGS_ARREGLADOS_WIZARD.md`
- Este archivo: `/home/aframirez1772/dev_genesys_laboral_medicine/WIZARD_STATUS.md`

**Comando para verificar el servidor:**
```bash
# Verificar que el dev server esté corriendo
lsof -ti:8080 && echo "✅ OK" || npm run dev
```

**Logs importantes a verificar en consola:**
```javascript
// Debe mostrar los valores guardados, NO undefined:
📦 Data received: {nd: '0', ne: '1', nc: '10', fuente: '...', ...}

// NO debe mostrar esto:
📦 Data received: {}  ← ESTO INDICA QUE HAY UN PROBLEMA
```

**Después del fix, verificar:**
- ✅ Cada riesgo mantiene sus propios valores de ND/NE/NC
- ✅ Los controles (textareas) no se pre-llenan con datos de otros riesgos
- ✅ Al regresar a un riesgo anterior, aparecen los valores originales
- ✅ Los checkmarks se restauran correctamente

**Si el bug persiste después del cambio:**
Es posible que `this.data['controles-X-Y']` no se esté guardando correctamente. Verificar en `Wizard.js` línea ~70 que `this.data[stepId] = stepData` se ejecuta correctamente.

---

## 📊 RESUMEN ESTADO ACTUAL

**Funcionalidades Completadas (95%):**
- ✅ Arquitectura completa del wizard
- ✅ Navegación entre pasos con validación
- ✅ Calculadora GTC 45 en tiempo real
- ✅ Barras semaforizadas de niveles
- ✅ Sugerencias de IA para controles
- ✅ Auto-guardado en localStorage
- ✅ Barra de progreso
- ✅ Persistencia al refrescar página
- ✅ Checkmarks visuales (arreglados en esta sesión)
- ✅ Tooltips funcionales (arreglados en esta sesión)

**Bugs Críticos Pendientes:**
- ❌ Radio buttons se comparten entre riesgos (SOLUCIÓN IDENTIFICADA)
- ⚠️ Chips de IA no siempre persisten al navegar atrás (necesita re-testing post-fix)

**Próximo milestone:**
Una vez arreglado el bug de radio buttons, el wizard estará **100% funcional** y listo para integración con el endpoint `/api/flujo-ia/registrar-y-generar`.

---

**Última actualización:** 3 de Noviembre de 2025, 23:45
**Implementado por:** Claude Code (Sesiones múltiples)
**Versión:** 1.1 - Con bugs críticos identificados y solución propuesta
