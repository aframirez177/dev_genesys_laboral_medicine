# Guía de Integración de Popups de Compliance
## Genesys Laboral Medicine

---

## 1. INSTALACIÓN

Los archivos de compliance ya están creados en:
- `/client/src/js/utils/compliancePopups.js` - Sistema principal de popups
- `/client/src/js/utils/complianceIntegration.js` - Configuración por página

---

## 2. INTEGRACIÓN POR PÁGINA

### 2.1 MATRIZ DE RIESGOS PROFESIONAL
**Archivo:** `form_matriz_riesgos_prof.js`

#### Paso 1: Importar el módulo
```javascript
// Al inicio del archivo, junto con los otros imports
import {
  showMatrixResponsibilityPopup,
  showMatrixGenerationPopup
} from '../utils/complianceIntegration.js';
```

#### Paso 2: Popup de Responsabilidad al iniciar
Agregar después de que el DOM esté listo, cuando el usuario interactúa por primera vez:

```javascript
// Variable para controlar que solo se muestre una vez por sesión
let complianceShown = sessionStorage.getItem('matrix_compliance_shown');

// Función para mostrar popup de responsabilidad
async function showResponsibilityDisclaimer() {
  if (complianceShown) return true;

  const result = await showMatrixResponsibilityPopup({
    metadata: {
      nombreResponsable: '', // Se llenará en el popup
      cargoResponsable: ''
    }
  });

  if (result.accepted) {
    sessionStorage.setItem('matrix_compliance_shown', 'true');
    // Guardar datos de firma si los hay
    if (result.signatureData) {
      window.matrixResponsibleData = result.signatureData;
    }
    return true;
  }
  return false;
}

// Llamar al hacer focus en el primer campo del formulario
const primerCampo = document.querySelector('#cargoContainer input');
if (primerCampo) {
  primerCampo.addEventListener('focus', async function handler() {
    const canContinue = await showResponsibilityDisclaimer();
    if (!canContinue) {
      this.blur();
    }
    // Remover el handler para que solo se ejecute una vez
    this.removeEventListener('focus', handler);
  });
}
```

#### Paso 3: Popup antes de generar documento
Modificar el handler del submit del formulario principal (línea ~3378):

```javascript
// ANTES (original):
matrizRiesgosForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // ... código existente
});

// DESPUÉS (con compliance):
matrizRiesgosForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("📋 Formulario principal enviado");

  if (modalError) modalError.style.display = "none";

  // Guardar datos
  datosFormularioPrincipal = gatherFormData();

  // Validar
  if (!validateCargosData()) {
    console.log("❌ Validación fallida");
    return;
  }

  // ⚠️ NUEVO: Mostrar popup de generación
  const complianceResult = await showMatrixGenerationPopup({
    metadata: {
      nombreResponsable: window.matrixResponsibleData?.nombreResponsable || 'Usuario',
      fechaGeneracion: new Date().toLocaleDateString('es-CO'),
      nombreEmpresa: document.querySelector('[name="nombreEmpresa"]')?.value || 'Empresa'
    }
  });

  if (!complianceResult.accepted) {
    console.log("❌ Usuario canceló en disclaimer de generación");
    return;
  }

  // Mostrar modal (código original)
  if (modal) {
    modal.style.display = "block";
    // ... resto del código
  }
});
```

---

### 2.2 PROFESIOGRAMA
**Archivo:** `CargoMiniWizard.js` y `profesiogramaViewer.js`

#### En CargoMiniWizard.js (al crear profesiograma):

```javascript
import { showProfesiogramaBasePopup } from '../utils/complianceIntegration.js';

// Al inicio del wizard, mostrar el disclaimer
async function initWizard() {
  const result = await showProfesiogramaBasePopup();
  if (!result.accepted) {
    // Redirigir o mostrar mensaje
    return;
  }
  // Continuar con el wizard
}
```

#### En profesiogramaViewer.js (al descargar):

```javascript
import { showProfesiogramaDownloadPopup } from '../utils/complianceIntegration.js';

// Modificar el botón de descarga/exportar PDF
const exportBtn = document.querySelector('#exportar-pdf');
if (exportBtn) {
  const originalHandler = exportBtn.onclick;

  exportBtn.onclick = async (e) => {
    e.preventDefault();

    const result = await showProfesiogramaDownloadPopup({
      metadata: {
        fechaGeneracion: new Date().toLocaleDateString('es-CO'),
        usuario: 'Usuario actual'
      }
    });

    if (result.accepted) {
      // Ejecutar descarga original
      if (originalHandler) originalHandler.call(exportBtn, e);
    }
  };
}
```

---

### 2.3 EXÁMENES MÉDICOS OCUPACIONALES
**Archivo:** Crear nuevo o modificar handler de la página

```javascript
import { showExamConfidentialityPopup } from '../utils/complianceIntegration.js';

// Al cargar la página de exámenes
document.addEventListener('DOMContentLoaded', async () => {
  const shown = sessionStorage.getItem('exam_confidentiality_shown');

  if (!shown) {
    const result = await showExamConfidentialityPopup();

    if (!result.accepted) {
      // Redirigir a página anterior o dashboard
      window.history.back();
      return;
    }

    sessionStorage.setItem('exam_confidentiality_shown', 'true');
  }

  // Continuar cargando la página
});
```

---

### 2.4 BATERÍA DE RIESGO PSICOSOCIAL
**Archivo:** Handler de la página

```javascript
import { showPsychosocialConsentPopup } from '../utils/complianceIntegration.js';

// Al iniciar la batería
async function iniciarBateria() {
  const result = await showPsychosocialConsentPopup();

  if (!result.accepted) {
    // El usuario rechazó participar (es voluntario)
    mostrarMensajeNoParticipacion();
    return;
  }

  // Continuar con la batería
  cargarPreguntas();
}
```

---

### 2.5 ENROLLMENT / REGISTRO
**Archivo:** Handler de Enrollment.html

```javascript
import { showDataTreatmentPopup } from '../utils/complianceIntegration.js';

// Al cargar el formulario de registro
document.addEventListener('DOMContentLoaded', async () => {
  const result = await showDataTreatmentPopup();

  if (!result.accepted) {
    // No puede continuar sin aceptar tratamiento de datos
    document.querySelector('form')?.setAttribute('disabled', 'true');
    alert('Debe aceptar la política de tratamiento de datos para continuar.');
  }
});
```

---

### 2.6 PÉRDIDA DE CAPACIDAD LABORAL
**Archivo:** Handler de la página

```javascript
import { showPCLWarningPopup } from '../utils/complianceIntegration.js';

document.addEventListener('DOMContentLoaded', async () => {
  const result = await showPCLWarningPopup();

  if (!result.accepted) {
    window.history.back();
  }
});
```

---

## 3. USO MANUAL DE POPUPS

Si necesitas mostrar un popup específico en cualquier momento:

```javascript
import compliancePopups from '../utils/compliancePopups.js';

// Mostrar cualquier popup por su key
const result = await compliancePopups.show('POPUP_003_RESPONSIBILITY', {
  metadata: {
    nombreResponsable: 'Juan Pérez',
    cargoResponsable: 'Jefe SST'
  },
  forceShow: true // Mostrar aunque ya haya sido aceptado
});

if (result.accepted) {
  console.log('Usuario aceptó');
  console.log('Datos de firma:', result.signatureData);
}
```

---

## 4. LISTA DE TODOS LOS POPUPS DISPONIBLES

| Key | Página | Descripción |
|-----|--------|-------------|
| `POPUP_001_DATA_TREATMENT` | Enrollment | Tratamiento de datos personales |
| `POPUP_003_RESPONSIBILITY` | Matriz Riesgos | Responsabilidad del diligenciador |
| `POPUP_004_METHODOLOGY` | Matriz Riesgos | Metodología GTC-45 |
| `POPUP_005_GENERATION` | Matriz Riesgos | Antes de generar documento |
| `POPUP_006_DIAGNOSIS_BASE` | Profesiograma | Base del diagnóstico |
| `POPUP_007_SCOPE` | Profesiograma | Alcance del documento |
| `POPUP_008_CORRECT_USE` | Profesiograma | Uso correcto al descargar |
| `POPUP_009_CONFIDENTIALITY` | Exámenes | Confidencialidad datos salud |
| `POPUP_010_EXAM_INFO` | Exámenes | Info de exámenes |
| `POPUP_011_PSYCHOSOCIAL` | Batería | Consentimiento psicosocial |
| `POPUP_013_APT` | APT | Alcance del análisis |
| `POPUP_014_PCL` | PCL | Advertencia legal |
| `POPUP_016_CONTACT` | Contacto | Autorización contacto |

---

## 5. PERSONALIZAR POPUPS

### Modificar texto de un popup existente:
Editar `/client/src/js/utils/compliancePopups.js` y buscar la key del popup.

### Agregar un nuevo popup:
```javascript
// En COMPLIANCE_POPUPS_CONFIG, agregar:
POPUP_NUEVO: {
  id: 'POPUP_XXX',
  type: 'custom_type',
  version: '1.0',
  required: true,
  requiresAcceptance: true,
  icon: 'fa-icon-name',
  iconColor: '#HEX',
  title: 'Título del Popup',
  content: `
    <p>Contenido HTML del popup...</p>
  `,
  checkboxLabel: 'Texto del checkbox de aceptación',
  confirmText: 'Texto botón confirmar',
  cancelText: 'Texto botón cancelar'
}
```

---

## 6. ESTILOS CSS DISPONIBLES

El sistema incluye clases CSS predefinidas para el contenido:

```html
<!-- Secciones con fondo gris -->
<div class="compliance-section">...</div>

<!-- Dos columnas (positivo/negativo) -->
<div class="compliance-section--two-col">
  <div class="compliance-col compliance-col--positive">...</div>
  <div class="compliance-col compliance-col--negative">...</div>
</div>

<!-- Alertas por tipo -->
<div class="compliance-alert compliance-alert--info">...</div>
<div class="compliance-alert compliance-alert--warning">...</div>
<div class="compliance-alert compliance-alert--danger">...</div>

<!-- Warning box destacado -->
<div class="compliance-warning-box">...</div>

<!-- Nota informativa -->
<div class="compliance-note">...</div>

<!-- Recomendación -->
<div class="compliance-recommendation">...</div>

<!-- Lista con checks -->
<ul class="compliance-checklist">
  <li><i class="fas fa-check"></i> Item</li>
</ul>
```

---

## 7. DEBUGGING

```javascript
// Listar todos los popups disponibles
compliancePopups.listPopups();

// Resetear todas las aceptaciones (útil para testing)
compliancePopups.resetAcceptances();

// Ver qué popups han sido aceptados
console.log(localStorage.getItem('compliance_accepted_popups'));
```

---

## 8. CONSIDERACIONES DE AUDITORÍA

Para cumplimiento legal completo, se recomienda:

1. **Guardar aceptaciones en backend**: Modificar `saveAcceptance()` para enviar al servidor
2. **Registrar IP y timestamp**: Ya incluido en localStorage, pero debe ir a BD
3. **Versionar popups**: Si cambia el texto legal, incrementar version
4. **Logs de auditoría**: Crear tabla `compliance_acceptances` en PostgreSQL

### Ejemplo de endpoint para guardar aceptación:

```javascript
// En saveAcceptance(), agregar:
fetch('/api/compliance/accept', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    popup_id: popupId,
    version: version,
    accepted_at: new Date().toISOString(),
    user_agent: navigator.userAgent
  })
});
```

---

*Documento de integración - Diciembre 2024*
