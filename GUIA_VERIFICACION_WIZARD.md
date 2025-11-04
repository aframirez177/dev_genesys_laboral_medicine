# 🧪 Guía de Verificación del Wizard SST

**Fecha:** 3 de Noviembre de 2025
**Versión:** 1.0
**URL de prueba:** http://localhost:8080/pages/wizard_example.html

---

## ✅ Estado de Revisión de Código

### 1. **Checkmarks Dinámicos** ✅
**Código revisado:** `diagnosticoSteps.js:1390-1500`

**Implementación:**
- ✅ Event listeners configurados para todos los radio buttons (ND, NE, NC)
- ✅ Checkmarks se crean dinámicamente al hacer clic
- ✅ Color del checkmark coincide con el color de la barra (verde/amarillo/naranja/rojo)
- ✅ Solo un checkmark visible a la vez por grupo
- ✅ Restauración de checkmarks al volver al paso (línea 1451-1500)
- ✅ Timeout de 300ms para asegurar que DOM esté listo

**Estilos del checkmark:**
```javascript
{
  position: absolute;
  top: -8px;
  right: -8px;
  background: white;
  color: [color del nivel];  // Verde/Amarillo/Naranja/Rojo
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 1.6rem;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 10;
}
```

**Qué verificar:**
- [ ] Hacer clic en una barra de nivel (ND/NE/NC)
- [ ] ¿Aparece un checkmark (✓) en la esquina superior derecha?
- [ ] ¿El checkmark tiene el color correcto?
- [ ] ¿Al hacer clic en otra barra del mismo grupo, el checkmark se mueve?

---

### 2. **Botón Atrás** ✅
**Código revisado:** `Wizard.js:102-124`

**Implementación:**
- ✅ Función `back()` implementada correctamente
- ✅ Historial (`this.history`) se llena en cada `next()` (línea 73)
- ✅ Validación de `isTransitioning` para evitar clicks múltiples
- ✅ Validación de que el historial no esté vacío
- ✅ Logs de debugging completos
- ✅ Animación de transición hacia atrás
- ✅ Ejecuta `onEnter()` del paso anterior para restaurar estado

**Flujo del historial:**
```javascript
// Paso 0 (Bienvenida) → history: []
// Click "Siguiente" → history: [0]
// Paso 1 (Empresa) → history: [0]
// Click "Siguiente" → history: [0, 1]
// Paso 2 (Num Cargos) → history: [0, 1]
// Click "Atrás" → history: [0], currentStep = 1
```

**Qué verificar:**
- [ ] Abrir consola del navegador (F12)
- [ ] Avanzar al paso 2 o 3 del wizard
- [ ] Hacer clic en "← Atrás"
- [ ] Buscar en consola: `⬅️ back() called, isTransitioning: false, history length: X`
- [ ] Verificar que regresa al paso anterior
- [ ] Verificar que los datos ingresados se mantienen

---

### 3. **Endpoint de Sugerencias de IA** ✅
**Código revisado:**
- Rutas: `server/src/routes/ia/aiSuggestions.routes.js`
- Controlador: `server/src/controllers/ia/aiSuggestions.controller.js`
- Servicio: `server/src/services/ia/aiSuggestions.service.js`

**Endpoints disponibles:**
1. ✅ `POST /api/ia/suggest-ges` - Sugerir riesgos para un cargo
2. ✅ `POST /api/ia/suggest-controls` - Sugerir controles para un riesgo
3. ✅ `POST /api/ia/validate-cargo` - Validar consistencia de cargo
4. ✅ `GET /api/ia/benchmarks/:sector` - Benchmarks por sector
5. ✅ `GET /api/ia/autocomplete-cargo` - Autocompletar nombre de cargo
6. ✅ `POST /api/ia/calculate-risk-score` - Calcular nivel de riesgo global
7. ✅ `POST /api/ia/detect-similar-cargo` - Detectar cargos similares

**Rutas registradas en app.js:** ✅ Línea 70
```javascript
app.use('/api/ia', aiSuggestionsRoutes);
```

**Base de conocimiento implementada:**
- ✅ 15+ cargos con riesgos predefinidos
- ✅ 10+ tipos de riesgo con controles específicos
- ✅ Sistema rule-based (no requiere ML)
- ✅ Manejo de errores robusto

**Qué verificar:**
- [ ] Llegar al paso de "Controles + Niveles"
- [ ] Abrir consola del navegador (F12)
- [ ] Buscar logs: `📊 Fetching AI controls for:...`
- [ ] Buscar logs: `✅ AI controls result:...`
- [ ] Verificar que aparecen chips de sugerencias
- [ ] Hacer clic en "Aplicar" y verificar que se llena el textarea

---

### 4. **Calculadora GTC 45 en Tiempo Real** ✅
**Código revisado:** `diagnosticoSteps.js:1303-1525`

**Implementación:**
- ✅ Timeout aumentado a 300ms para asegurar que DOM esté listo
- ✅ Verificación de que radio buttons existen antes de continuar
- ✅ Reintentos automáticos si los elementos no están listos
- ✅ Selectores específicos por cargo/GES para evitar conflictos
- ✅ Cálculo de NP (Nivel de Probabilidad) = ND × NE
- ✅ Cálculo de NR (Nivel de Riesgo) = NP × NC
- ✅ Clasificación según GTC 45 (I/II/III/IV)
- ✅ Actualización de UI con colores dinámicos
- ✅ Borde de tarjeta cambia según nivel de riesgo

**Fórmulas implementadas:**
```javascript
NP = ND × NE
  Muy Alto: NP ≥ 24
  Alto: 10 ≤ NP < 24
  Medio: 6 ≤ NP < 10
  Bajo: NP < 6

NR = NP × NC
  I (Crítico): NR ≥ 600 → Rojo
  II (Alto): 150 ≤ NR < 600 → Naranja
  III (Medio): 40 ≤ NR < 150 → Amarillo
  IV (Bajo): NR < 40 → Verde
```

**Qué verificar:**
- [ ] Seleccionar ND (ej: Alto = 6)
- [ ] Seleccionar NE (ej: Frecuente = 3)
- [ ] Seleccionar NC (ej: Grave = 25)
- [ ] Verificar que aparece la tarjeta "Resultado del Cálculo"
- [ ] Verificar NP = 6 × 3 = 18 (Alto)
- [ ] Verificar NR = 18 × 25 = 450 (Nivel II)
- [ ] Verificar que el borde de la tarjeta es naranja
- [ ] Verificar que muestra "Interpretación" y "Aceptabilidad"

---

### 5. **Tooltips** ✅
**Código revisado:** `diagnosticoSteps.js:1502-1524`

**Implementación:**
- ✅ Event listeners en todos los botones `.tooltip-btn`
- ✅ Textos completos según normativa GTC 45
- ✅ Tres tipos de tooltips: ND, NE, NC
- ✅ Actualmente usa `alert()` (temporal)

**Textos implementados:**
- ✅ **ND**: Nivel de Deficiencia (4 niveles con descripción completa)
- ✅ **NE**: Nivel de Exposición (4 niveles con descripción completa)
- ✅ **NC**: Nivel de Consecuencia (4 niveles con descripción completa)

**Qué verificar:**
- [ ] En el paso de Controles + Niveles
- [ ] Hacer clic en el botón "?" al lado de "Deficiencia (ND)"
- [ ] ¿Aparece un alert con explicación completa?
- [ ] Repetir para NE y NC
- [ ] Verificar que los textos sean claros y útiles

---

## 🧪 Plan de Pruebas Completo

### Escenario 1: Flujo Básico (1 cargo, 1 riesgo)

**Tiempo estimado:** 5-7 minutos

#### Paso 1: Bienvenida
- [ ] Abrir http://localhost:8080/pages/wizard_example.html
- [ ] Leer mensaje de bienvenida
- [ ] Click en "Siguiente"

#### Paso 2: Información de la Empresa
- [ ] Llenar:
  - Nombre: "Empresa Test SAS"
  - NIT: "900123456-7"
  - Sector: "Manufactura"
  - Ciudad: "Bogotá"
- [ ] Verificar que el botón "Atrás" está visible
- [ ] Click en "Siguiente"

#### Paso 3: Número de Cargos
- [ ] Verificar que aparecen botones quick-select (1, 2, 3, 4+)
- [ ] Click en "1"
- [ ] Verificar que el campo se llena con "1"
- [ ] Click en "Siguiente"

#### Paso 4: Información del Cargo #1
- [ ] Llenar:
  - Nombre del cargo: "Operario de producción"
  - Área: "Producción"
  - Zona de trabajo: "Planta 1"
  - Número de trabajadores: "10"
  - Descripción: "Opera máquinas de corte y realiza inspección de calidad"
- [ ] Marcar toggle: "Tareas Rutinarias"
- [ ] Click en "Siguiente"

#### Paso 5: Selección de Riesgos (GES)
- [ ] Verificar que aparecen sugerencias de IA (chips)
- [ ] Buscar "Mecánico" en el buscador
- [ ] Expandir categoría "Riesgo Mecánico"
- [ ] Seleccionar "Posibilidad de corte"
- [ ] Verificar que aparece en "Riesgos seleccionados" (tarjeta azul)
- [ ] Click en "Siguiente"

#### Paso 6: Controles + Niveles - Riesgo Mecánico
- [ ] **Sugerencias de IA:**
  - [ ] Verificar que aparecen 3 secciones de sugerencias
  - [ ] Click en "Aplicar" para Fuente
  - [ ] Verificar que se llena el textarea
  - [ ] Repetir para Medio e Individuo

- [ ] **Niveles de Riesgo:**
  - [ ] Click en "Alto" para Deficiencia (ND = 6)
  - [ ] ✅ Verificar checkmark aparece
  - [ ] Click en "Frecuente" para Exposición (NE = 3)
  - [ ] ✅ Verificar checkmark aparece
  - [ ] Click en "Grave" para Consecuencia (NC = 25)
  - [ ] ✅ Verificar checkmark aparece

- [ ] **Calculadora:**
  - [ ] Verificar que aparece "Resultado del Cálculo"
  - [ ] Verificar NP = 18 (Alto)
  - [ ] Verificar NR = 450 (Nivel II)
  - [ ] Verificar borde naranja en la tarjeta
  - [ ] Verificar interpretación: "Corregir o adoptar medidas de control"
  - [ ] Verificar aceptabilidad: "No Aceptable o Aceptable con control específico"

- [ ] **Tooltips:**
  - [ ] Click en "?" al lado de Deficiencia
  - [ ] Verificar que aparece explicación completa
  - [ ] Cerrar alert
  - [ ] Repetir para Exposición y Consecuencia

- [ ] **Botón Atrás:**
  - [ ] Abrir consola (F12)
  - [ ] Click en "← Atrás"
  - [ ] Verificar en consola: `⬅️ back() called...`
  - [ ] Verificar que regresa al paso de selección de GES
  - [ ] Click en "Siguiente" para volver
  - [ ] Verificar que los datos se mantienen (controles + niveles)
  - [ ] ✅ Verificar que los checkmarks se restauran

- [ ] Click en "Siguiente"

#### Paso 7: Revisión Final
- [ ] Verificar resumen de la empresa
- [ ] Verificar resumen del cargo #1
- [ ] Verificar que muestra el riesgo seleccionado
- [ ] Verificar estadísticas (total riesgos, nivel promedio)
- [ ] Click en "Finalizar"

---

### Escenario 2: Flujo Avanzado (2 cargos, múltiples riesgos)

**Tiempo estimado:** 10-12 minutos

#### Configuración:
- **Cargo 1:** Operario de producción - 3 riesgos
  - Riesgo Mecánico - Posibilidad de corte
  - Riesgo Físico - Ruido
  - Riesgo Biomecánico - Posturas forzadas

- **Cargo 2:** Administrativo - 2 riesgos
  - Riesgo Psicosocial - Estrés laboral
  - Riesgo Biomecánico - Posturas prolongadas sentado

#### Verificaciones adicionales:
- [ ] Navegación entre múltiples cargos
- [ ] Navegación entre múltiples riesgos del mismo cargo
- [ ] Persistencia de datos entre pasos
- [ ] Barra de progreso actualizada correctamente
- [ ] Resumen final con todos los cargos y riesgos

---

### Escenario 3: Pruebas de Regresión

#### Test 1: Persistencia de datos
- [ ] Llenar hasta el paso 5
- [ ] Cerrar navegador
- [ ] Reabrir http://localhost:8080/pages/wizard_example.html
- [ ] Verificar banner de restauración
- [ ] Click en "Continuar donde lo dejaste"
- [ ] Verificar que todos los datos están presentes

#### Test 2: Validaciones
- [ ] Intentar avanzar sin llenar campos requeridos
- [ ] Verificar mensajes de error claros
- [ ] Verificar que el foco va al campo con error

#### Test 3: Responsive
- [ ] Probar en móvil (F12 → Toggle device toolbar)
- [ ] Verificar que todo es legible
- [ ] Verificar que los botones son clickeables (min 44x44px)
- [ ] Verificar que las barras de nivel funcionan en touch

---

## 📊 Checklist de Verificación Final

### Funcionalidad
- [ ] ✅ Checkmarks aparecen y se mueven correctamente
- [ ] ✅ Checkmarks tienen colores correctos
- [ ] ✅ Calculadora muestra resultados en tiempo real
- [ ] ✅ Fórmulas GTC 45 son correctas
- [ ] ✅ Botón Atrás funciona sin perder datos
- [ ] ✅ Tooltips muestran información útil
- [ ] ✅ Sugerencias de IA aparecen y se pueden aplicar
- [ ] ✅ Navegación entre pasos es fluida
- [ ] ✅ Barra de progreso se actualiza
- [ ] ✅ Persistencia en localStorage funciona

### UX/UI
- [ ] Animaciones suaves (no hay flickering)
- [ ] Colores son consistentes con el sistema de diseño
- [ ] Textos son legibles y claros
- [ ] Espaciado es adecuado (no muy apretado)
- [ ] Loading states son visibles
- [ ] Mensajes de error son claros

### Performance
- [ ] Wizard carga en < 2 segundos
- [ ] Transiciones entre pasos son inmediatas (< 300ms)
- [ ] No hay lag al escribir en textareas
- [ ] No hay errores en consola
- [ ] No hay warnings en consola

### Accesibilidad
- [ ] Se puede navegar con teclado (Tab, Enter, Escape)
- [ ] Focus es visible
- [ ] Labels están asociados a inputs
- [ ] Contraste de colores es suficiente

---

## 🐛 Registro de Bugs Encontrados

**Formato:**
```markdown
### Bug #X: [Título del bug]
**Paso:** [Dónde ocurrió]
**Esperado:** [Qué debería pasar]
**Actual:** [Qué pasó]
**Logs:** [Copiar logs de consola]
**Reproducibilidad:** [Siempre / A veces / Rara vez]
```

---

## ✅ Criterios de Aceptación

El wizard se considera **100% funcional** si:

1. ✅ Todos los checkmarks aparecen y funcionan correctamente
2. ✅ La calculadora muestra resultados correctos en tiempo real
3. ✅ El botón Atrás funciona sin perder datos
4. ✅ Los tooltips muestran información completa
5. ✅ Las sugerencias de IA se cargan y aplican correctamente
6. ✅ Se puede completar el flujo completo sin errores
7. ✅ Los datos se guardan en localStorage
8. ✅ La revisión final muestra todos los datos correctamente
9. ✅ No hay errores en consola del navegador
10. ✅ Funciona en móvil, tablet y desktop

---

## 📝 Próximos Pasos Según Resultados

### Si TODO funciona ✅
1. Implementar mejora visual: Reemplazar barra de progreso por muñeco SVG
2. Cambiar tooltips de `alert()` a modal bonito
3. Integrar con endpoint `/api/flujo-ia/registrar-y-generar`
4. Testing con usuarios reales

### Si hay bugs menores 🟡
1. Documentar bugs en sección de arriba
2. Priorizar por severidad
3. Corregir uno por uno
4. Re-testing

### Si hay bugs críticos 🔴
1. Detener testing
2. Documentar bug crítico con máximo detalle
3. Incluir logs de consola completos
4. Reportar inmediatamente

---

**Última actualización:** 3 de Noviembre de 2025
**Revisado por:** Claude Code
**Estado:** ✅ Listo para testing
