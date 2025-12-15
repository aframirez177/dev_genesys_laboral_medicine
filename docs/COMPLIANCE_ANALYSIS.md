# ANÁLISIS DE CUMPLIMIENTO LEGAL Y SST
## Genesys Laboral Medicine - Sistema de Popups de Compliance

---

## MARCO LEGAL APLICABLE

### Protección de Datos Personales
- **Ley 1581 de 2012**: Régimen general de protección de datos personales
- **Decreto 1377 de 2013**: Reglamentación tratamiento de datos personales
- **Ley 1266 de 2008**: Habeas Data

### Salud Ocupacional y SST
- **Decreto 1072 de 2015**: Decreto Único Reglamentario del Sector Trabajo
- **Resolución 1843 de 2024**: Evaluación básica obligatoria
- **Resolución 0312 de 2019**: Estándares mínimos SG-SST
- **GTC 45**: Guía técnica para identificación de peligros y valoración de riesgos

### Normativas Específicas
- **Resolución 1409 de 2012 / 4272 de 2021**: Trabajo en alturas
- **Resolución 2674 de 2013**: Manipulación de alimentos
- **Resolución 1565 de 2014**: Plan Estratégico de Seguridad Vial (PESV)
- **Resolución 0491 de 2020**: Espacios confinados

### Documentos Médico-Laborales
- **Resolución 2346 de 2007**: Evaluaciones médicas ocupacionales
- **Resolución 1918 de 2009**: Custodia y confidencialidad de historias clínicas ocupacionales

---

## SECCIONES QUE REQUIEREN POPUPS DE COMPLIANCE

### 1. ENROLLMENT / REGISTRO DE EMPRESA
**Página:** `/pages/Enrollment.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_001` | Tratamiento de Datos | Al cargar formulario | Sí |
| `POPUP_002` | Términos y Condiciones | Antes de enviar | Sí |

**Contenido POPUP_001 - Autorización Tratamiento de Datos:**
```
AUTORIZACIÓN PARA EL TRATAMIENTO DE DATOS PERSONALES

En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013,
GENESYS LABORAL MEDICINE SAS, identificada con NIT 901.xxxxx-x, como
Responsable del tratamiento de datos personales, requiere su autorización
para recolectar, almacenar, usar, circular, suprimir, procesar y en general,
tratar los datos personales que usted nos proporcione.

FINALIDADES:
• Gestionar servicios de salud ocupacional
• Generar documentos legales (matrices, profesiogramas)
• Comunicaciones comerciales y de servicio
• Facturación y cobro de servicios
• Cumplimiento de obligaciones legales

DERECHOS DEL TITULAR (Art. 8, Ley 1581/2012):
• Conocer, actualizar y rectificar sus datos
• Solicitar prueba de la autorización
• Ser informado sobre el uso de sus datos
• Presentar quejas ante la SIC
• Revocar la autorización y/o solicitar supresión de datos
• Acceder gratuitamente a sus datos

Para ejercer estos derechos: contacto@genesyslm.com.co

[ ] He leído y acepto la Política de Tratamiento de Datos Personales
    (Ver política completa)

[Aceptar] [Cancelar]
```

---

### 2. MATRIZ DE RIESGOS PROFESIONAL (GTC-45)
**Página:** `/pages/Matriz_de_riesgos_profesional.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_003` | Declaración Responsabilidad | Al iniciar formulario | Sí |
| `POPUP_004` | Advertencia Metodológica | Antes de calcular NR | Sí |
| `POPUP_005` | Disclaimer Generación | Al generar documento | Sí |

**Contenido POPUP_003 - Responsabilidad del Diligenciador:**
```
⚠️ DECLARACIÓN DE RESPONSABILIDAD DEL DILIGENCIADOR

De acuerdo con el Decreto 1072 de 2015 y la GTC 45:

El empleador es RESPONSABLE de:
1. La identificación veraz y completa de los peligros
2. La correcta valoración de los riesgos
3. La implementación de controles adecuados
4. La actualización periódica de la matriz

ADVERTENCIA LEGAL:
La información aquí registrada tiene carácter de DECLARACIÓN JURADA.
El diligenciador certifica que:

✓ Los datos ingresados corresponden a la realidad del lugar de trabajo
✓ Tiene conocimiento directo de las condiciones laborales descritas
✓ Actúa en representación autorizada de la empresa
✓ Comprende que esta información será base para evaluaciones
  médicas ocupacionales y toma de decisiones de SST

GENESYS LABORAL MEDICINE actúa como HERRAMIENTA de sistematización.
La responsabilidad legal de la información recae sobre quien la diligencia
en representación del empleador.

Nombre del responsable: ________________
Cargo: ________________
Fecha: ________________

[ ] Declaro que la información proporcionada es veraz y completa,
    y acepto la responsabilidad legal sobre la misma.

[Continuar] [Cancelar]
```

**Contenido POPUP_004 - Advertencia Metodológica:**
```
📊 METODOLOGÍA DE VALORACIÓN GTC-45

El sistema calculará el Nivel de Riesgo (NR) según la fórmula:

NR = ND × NE × NC

Donde:
• ND = Nivel de Deficiencia (1-10)
• NE = Nivel de Exposición (1-4)
• NC = Nivel de Consecuencia (10-100)

IMPORTANTE:
Los niveles ingresados deben basarse en:
- Observación directa del puesto de trabajo
- Mediciones higiénicas cuando aplique
- Historial de incidentes y accidentes
- Análisis de tareas realizadas

La valoración subjetiva puede generar niveles de riesgo incorrectos
que afecten la determinación de:
• Exámenes médicos requeridos
• Periodicidad de evaluaciones
• EPP necesarios
• Aptitud del trabajador para el cargo

[Entendido, continuar]
```

**Contenido POPUP_005 - Disclaimer al Generar Documento:**
```
📄 DOCUMENTO A GENERAR: MATRIZ DE RIESGOS GTC-45

Este documento oficial contendrá:
• Identificación de peligros por cargo
• Valoración de riesgos (NR)
• Controles existentes y propuestos
• Priorización de intervenciones

AVISO LEGAL:
1. Este documento tiene validez legal para cumplimiento de SST
2. Debe ser firmado por el responsable del SG-SST de la empresa
3. Requiere actualización cuando cambien las condiciones de trabajo
4. La periodicidad mínima de revisión es anual (Res. 0312/2019)

RESPONSABILIDAD:
• Genesys proporciona la herramienta tecnológica y metodológica
• La empresa es responsable de la veracidad de la información
• El documento generado refleja EXCLUSIVAMENTE los datos ingresados

Diligenciado por: [Nombre del responsable]
Fecha de generación: [Fecha actual]
Empresa: [Nombre de la empresa]

[ ] Confirmo que la información es correcta y autorizo la generación

[Generar Documento] [Revisar datos]
```

---

### 3. PROFESIOGRAMA
**Página:** `/pages/Profesiograma.html` y `/pages/profesiograma_view.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_006` | Base del Diagnóstico | Al iniciar | Sí |
| `POPUP_007` | Alcance del Documento | Al visualizar resultado | Sí |
| `POPUP_008` | Uso Correcto | Al descargar PDF | Sí |

**Contenido POPUP_006 - Base del Diagnóstico:**
```
🏥 INFORMACIÓN SOBRE EL PROFESIOGRAMA

IMPORTANTE - BASE DEL DIAGNÓSTICO:

El profesiograma que se generará está basado EXCLUSIVAMENTE en:

1. ✓ La información de riesgos ingresada en el formulario
2. ✓ Los niveles de riesgo (NR) calculados según la matriz GTC-45
3. ✓ Las características especiales del cargo (alturas, alimentos, etc.)
4. ✓ El catálogo de GES (Grupos de Exposición Similar)

NO se basa en:
✗ Evaluación médica individual del trabajador
✗ Inspección física del puesto de trabajo
✗ Mediciones ambientales o higiénicas directas

ALCANCE DEL DOCUMENTO:
• Define los REQUISITOS de aptitud médica para el cargo
• Especifica los exámenes médicos ocupacionales necesarios
• Establece la periodicidad de evaluaciones según el riesgo
• NO constituye concepto de aptitud individual

La determinación de APTITUD/NO APTITUD de un trabajador específico
solo puede realizarse mediante examen médico ocupacional por un
médico especialista en salud ocupacional.

[ ] Entiendo que el profesiograma es un documento de requisitos
    del cargo, no una evaluación individual.

[Continuar]
```

**Contenido POPUP_007 - Alcance del Documento:**
```
📋 PROFESIOGRAMA GENERADO

Este documento contiene los requisitos ocupacionales para el cargo
basados en la información de riesgos proporcionada.

CONTENIDO DEL PROFESIOGRAMA:
✓ Identificación del cargo y sus funciones
✓ Riesgos identificados y niveles de exposición
✓ Exámenes médicos de ingreso requeridos
✓ Exámenes médicos periódicos (según periodicidad por NR)
✓ Exámenes médicos de retiro
✓ Aptitudes físicas y psicológicas requeridas
✓ Condiciones de incompatibilidad médica
✓ EPP obligatorio según el cargo

ADVERTENCIAS LEGALES:

1. FUNDAMENTO NORMATIVO:
   - Resolución 2346 de 2007: Evaluaciones médicas ocupacionales
   - Resolución 1843 de 2024: Paquete mínimo obligatorio
   - Decreto 1072 de 2015: Reglamento sector trabajo

2. RESPONSABILIDAD:
   - Los exámenes recomendados se derivan de los riesgos declarados
   - Si hay riesgos no identificados, los exámenes pueden ser insuficientes
   - La empresa debe garantizar la realización de los exámenes

3. VALIDEZ:
   - Válido mientras no cambien las condiciones del cargo
   - Debe actualizarse al modificar tareas o riesgos
   - Complementa pero no reemplaza el concepto médico individual

[Ver documento] [Descargar PDF]
```

**Contenido POPUP_008 - Uso Correcto del Profesiograma:**
```
📥 DESCARGA DE PROFESIOGRAMA

Antes de descargar, tenga en cuenta:

USO CORRECTO DE ESTE DOCUMENTO:
✓ Como guía para solicitar exámenes de ingreso
✓ Para definir periodicidad de exámenes periódicos
✓ Como base para el concepto de aptitud médica
✓ Para determinar EPP requerido por el cargo

USO INCORRECTO (PROHIBIDO):
✗ Como concepto de aptitud de un trabajador específico
✗ Para excluir candidatos sin evaluación médica
✗ Como sustituto de evaluación médica ocupacional
✗ Sin actualizar cuando cambien las condiciones

RECOMENDACIÓN:
Este profesiograma debe ser revisado por el médico ocupacional
de la empresa y por el responsable del SG-SST antes de su
implementación oficial.

Generado: [Fecha]
Por: [Usuario/Empresa]

[Descargar] [Cancelar]
```

---

### 4. EXÁMENES MÉDICOS OCUPACIONALES
**Página:** `/pages/Examenes_medicos_ocupacionales.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_009` | Confidencialidad | Al acceder a sección | Sí |
| `POPUP_010` | Uso de Información | Al consultar resultados | Sí |

**Contenido POPUP_009 - Confidencialidad de Datos de Salud:**
```
🔒 DATOS SENSIBLES DE SALUD - CONFIDENCIALIDAD

ADVERTENCIA LEGAL (Ley 1581/2012, Art. 5):

Los datos de salud son considerados DATOS SENSIBLES y gozan de
especial protección. Su tratamiento está sujeto a:

1. PRINCIPIO DE FINALIDAD:
   Solo pueden usarse para fines de salud ocupacional

2. PRINCIPIO DE CIRCULACIÓN RESTRINGIDA:
   Solo accesible a personal autorizado (médico ocupacional,
   responsable SST, el propio trabajador)

3. PROHIBICIONES:
   ✗ No pueden usarse para discriminación laboral
   ✗ No pueden compartirse con terceros sin autorización
   ✗ No pueden usarse para toma de decisiones de contratación
     sin concepto médico de aptitud

RESPONSABILIDADES:
• GENESYS custodia la información bajo estrictas medidas de seguridad
• La empresa debe garantizar el uso adecuado de los conceptos médicos
• Solo el médico ocupacional puede emitir conceptos de aptitud
• El trabajador tiene derecho a conocer su historia clínica ocupacional

Incumplir estas normas puede generar sanciones de hasta
2.000 SMMLV (Ley 1581/2012, Art. 23)

[ ] Acepto manejar esta información de forma confidencial y
    solo para fines de salud ocupacional.

[Continuar]
```

**Contenido POPUP_010 - Uso de Información de Exámenes:**
```
📊 CONSULTA DE EXÁMENES MÉDICOS OCUPACIONALES

INFORMACIÓN IMPORTANTE:

Los resultados que visualizará corresponden a:
• Exámenes requeridos según el cargo y nivel de riesgo
• Recomendaciones basadas en la Resolución 1843 de 2024
• Periodicidad determinada por el Número de Riesgo (NR)

RECORDATORIO LEGAL:

1. CONCEPTOS DE APTITUD:
   Solo pueden ser emitidos por médico especialista en
   salud ocupacional o medicina del trabajo.

2. RESTRICCIONES Y RECOMENDACIONES:
   Las restricciones médicas deben respetarse y la empresa
   debe realizar ajustes razonables cuando sea posible.

3. ARCHIVO Y CUSTODIA:
   Los resultados de exámenes se archivan por 20 años
   después de terminada la relación laboral (Res. 1918/2009)

4. DERECHOS DEL TRABAJADOR:
   - Conocer los resultados de sus exámenes
   - Recibir copia de su historia clínica ocupacional
   - Confidencialidad de su información médica

[Entendido]
```

---

### 5. BATERÍA DE RIESGO PSICOSOCIAL
**Página:** `/pages/Bateria_de_riesgo_psicosocial.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_011` | Consentimiento Informado | Al iniciar | Sí |
| `POPUP_012` | Confidencialidad Especial | Antes de responder | Sí |

**Contenido POPUP_011 - Consentimiento para Batería Psicosocial:**
```
🧠 BATERÍA DE RIESGO PSICOSOCIAL

CONSENTIMIENTO INFORMADO (Resolución 2646 de 2008)

Esta evaluación tiene como objetivo identificar factores de riesgo
psicosocial en el trabajo para implementar programas de prevención
e intervención.

INFORMACIÓN SOBRE LA EVALUACIÓN:
• Es una herramienta estandarizada del Ministerio del Trabajo
• Evalúa factores intralaborales, extralaborales y de estrés
• Los resultados son GRUPALES, no individuales
• No tiene carácter punitivo ni sancionatorio

DERECHOS DEL PARTICIPANTE:
✓ Participación VOLUNTARIA
✓ Puede retirarse en cualquier momento
✓ Sus respuestas individuales son CONFIDENCIALES
✓ No se compartirá información que lo identifique
✓ No afectará su situación laboral actual ni futura

USO DE RESULTADOS:
Los resultados consolidados (nunca individuales) se usarán para:
• Diagnóstico de riesgo psicosocial organizacional
• Diseño de programas de bienestar
• Cumplimiento del Decreto 1072 de 2015

ADVERTENCIA:
Esta batería NO es una evaluación psicológica individual ni
diagnóstico de salud mental.

[ ] He sido informado(a) y acepto participar voluntariamente

[Participar] [No deseo participar]
```

---

### 6. ANÁLISIS DE PUESTO DE TRABAJO
**Página:** `/pages/Analisis_de_puesto_de_trabajo.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_013` | Alcance del Análisis | Al iniciar | Sí |

**Contenido POPUP_013 - Análisis de Puesto de Trabajo:**
```
📝 ANÁLISIS DE PUESTO DE TRABAJO (APT)

PROPÓSITO DEL DOCUMENTO:

El APT es una herramienta técnica que permite:
• Describir las tareas y actividades del cargo
• Identificar demandas físicas y cognitivas
• Evaluar condiciones ergonómicas
• Determinar requerimientos ocupacionales

LIMITACIONES DEL ANÁLISIS:

⚠️ Este análisis se realiza con base en la información proporcionada
   y/o la observación del puesto de trabajo.

⚠️ No reemplaza:
   - Estudios de higiene industrial
   - Mediciones ambientales certificadas
   - Evaluación médica ocupacional individual

RESPONSABILIDAD:
• La información base debe ser suministrada por el empleador
• Las recomendaciones son orientativas y deben ser validadas
  por el profesional de SST de la empresa
• La implementación de controles es responsabilidad del empleador

[ ] Entiendo el alcance y limitaciones del análisis

[Continuar]
```

---

### 7. PÉRDIDA DE CAPACIDAD LABORAL
**Página:** `/pages/Perdida_de_capacidad_laboral.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_014` | Advertencia Legal Especial | Al acceder | Sí |
| `POPUP_015` | No Reemplaza Dictamen | Al usar herramienta | Sí |

**Contenido POPUP_014 - Información PCL:**
```
⚖️ PÉRDIDA DE CAPACIDAD LABORAL - INFORMACIÓN LEGAL

ADVERTENCIA IMPORTANTE:

La calificación oficial de Pérdida de Capacidad Laboral (PCL)
SOLO puede ser realizada por:

1. EPS (Primera instancia)
2. Fondo de Pensiones o ARL (según origen)
3. Juntas Regionales de Calificación de Invalidez
4. Junta Nacional de Calificación de Invalidez

MARCO NORMATIVO:
• Decreto 1507 de 2014: Manual Único de Calificación
• Ley 776 de 2002: Organización y funcionamiento del SGRP
• Decreto 1072 de 2015: Procedimientos de calificación

¿QUÉ OFRECE ESTA SECCIÓN?
Esta herramienta proporciona información orientativa sobre:
• Proceso de calificación
• Documentación requerida
• Derechos del trabajador
• Tiempos y plazos legales

⚠️ NO constituye calificación oficial ni concepto médico-legal

[ ] Entiendo que esta es información orientativa únicamente

[Continuar]
```

---

### 8. CONTACTO / SOLICITUD DE SERVICIOS
**Página:** `/pages/Contacto.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_016` | Tratamiento Datos Contacto | Al enviar formulario | Sí |

**Contenido POPUP_016 - Autorización Contacto:**
```
📧 AUTORIZACIÓN PARA CONTACTO

Al enviar este formulario, autoriza a GENESYS LABORAL MEDICINE SAS a:

✓ Almacenar sus datos de contacto
✓ Comunicarse por los medios proporcionados
✓ Enviar información sobre nuestros servicios
✓ Realizar seguimiento a su solicitud

DATOS RECOLECTADOS:
• Nombre y apellidos
• Email de contacto
• Teléfono (opcional)
• Mensaje/consulta

Sus datos no serán compartidos con terceros y puede solicitar
su eliminación en cualquier momento escribiendo a:
contacto@genesyslm.com.co

[ ] Autorizo el tratamiento de mis datos para los fines descritos

[Enviar] [Cancelar]
```

---

### 9. LOGIN Y AUTENTICACIÓN
**Página:** `/pages/login.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_017` | Sesión Segura | Al iniciar sesión | No (informativo) |

**Contenido POPUP_017 (Opcional - Primer login):**
```
🔐 SEGURIDAD DE SU CUENTA

Recomendaciones de seguridad:

✓ Use contraseñas fuertes (mínimo 8 caracteres, mayúsculas,
  números y símbolos)
✓ No comparta sus credenciales de acceso
✓ Cierre sesión al terminar, especialmente en equipos compartidos
✓ Reporte cualquier actividad sospechosa

Su sesión expirará automáticamente tras 24 horas de inactividad.

[Entendido]
```

---

### 10. DASHBOARD - ACCESO A DOCUMENTOS
**Página:** `/pages/dashboard.html`

| Popup ID | Tipo | Momento de Activación | Obligatorio |
|----------|------|----------------------|-------------|
| `POPUP_018` | Uso Interno | Al descargar docs oficiales | Sí |

**Contenido POPUP_018 - Descarga de Documentos:**
```
📁 DESCARGA DE DOCUMENTO OFICIAL

El documento que descargará es de uso interno de la empresa y
debe manejarse conforme a la normatividad aplicable.

RECORDATORIOS:
1. Este documento forma parte del Sistema de Gestión de SST
2. Debe estar disponible para auditorías del MinTrabajo
3. Cualquier modificación debe documentarse
4. La custodia es responsabilidad del empleador

PERÍODO DE CONSERVACIÓN:
• Matrices de riesgo: 20 años
• Profesiogramas: 20 años
• Evaluaciones médicas: 20 años después del retiro del trabajador

[Descargar]
```

---

## RESUMEN DE IMPLEMENTACIÓN

### Tabla de Prioridades

| Prioridad | Popup | Página | Criticidad Legal |
|-----------|-------|--------|------------------|
| 🔴 Alta | POPUP_001 | Enrollment | Ley 1581/2012 |
| 🔴 Alta | POPUP_003 | Matriz Riesgos | Decreto 1072/2015 |
| 🔴 Alta | POPUP_006 | Profesiograma | Res. 2346/2007 |
| 🔴 Alta | POPUP_009 | Exámenes | Datos sensibles |
| 🔴 Alta | POPUP_011 | Batería Psicosocial | Res. 2646/2008 |
| 🟡 Media | POPUP_002 | Enrollment | T&C |
| 🟡 Media | POPUP_004 | Matriz Riesgos | Metodológico |
| 🟡 Media | POPUP_005 | Matriz Riesgos | Disclaimer |
| 🟡 Media | POPUP_007 | Profesiograma | Alcance |
| 🟡 Media | POPUP_008 | Profesiograma | Uso |
| 🟡 Media | POPUP_013 | APT | Alcance |
| 🟡 Media | POPUP_014 | PCL | Advertencia |
| 🟢 Baja | POPUP_010 | Exámenes | Informativo |
| 🟢 Baja | POPUP_016 | Contacto | Datos básicos |
| 🟢 Baja | POPUP_017 | Login | Seguridad |
| 🟢 Baja | POPUP_018 | Dashboard | Descarga |

---

## REQUISITOS TÉCNICOS DE IMPLEMENTACIÓN

### Almacenamiento de Aceptaciones
Cada aceptación de popup debe registrarse con:
- `user_id` o `empresa_id`
- `popup_id`
- `timestamp` de aceptación
- `ip_address`
- `user_agent`
- `version_popup` (para auditoría si cambia el texto)

### Tabla Sugerida: `compliance_acceptances`
```sql
CREATE TABLE compliance_acceptances (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  empresa_id INTEGER REFERENCES empresas(id),
  popup_id VARCHAR(20) NOT NULL,
  popup_version VARCHAR(10) DEFAULT '1.0',
  accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  context_data JSONB -- datos adicionales del contexto
);
```

### Configuración de Popups
```javascript
const COMPLIANCE_POPUPS = {
  POPUP_001: {
    id: 'POPUP_001',
    type: 'data_treatment',
    version: '1.0',
    required: true,
    showOnce: false, // Mostrar cada vez que se registra
    pages: ['Enrollment.html']
  },
  POPUP_003: {
    id: 'POPUP_003',
    type: 'responsibility',
    version: '1.0',
    required: true,
    showOnce: false, // Mostrar cada vez que se llena matriz
    pages: ['Matriz_de_riesgos_profesional.html']
  },
  // ... etc
};
```

---

## NOTAS ADICIONALES

### Actualizaciones Regulatorias
Este análisis debe revisarse cuando:
- Se publique nueva normatividad de SST
- Cambien requisitos de Habeas Data
- Se modifiquen resoluciones del MinTrabajo
- Haya cambios en el alcance del sistema

### Auditoría
Mantener registros de:
- Versiones de textos de popup
- Fechas de aceptación por usuario
- Cambios en la normatividad aplicada

---

*Documento generado: Diciembre 2024*
*Versión: 1.0*
*Última actualización: [Fecha actual]*
