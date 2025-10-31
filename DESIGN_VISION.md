# DESIGN VISION - GENESYS BUSINESS INTELLIGENCE

**Creador y Visionario**: Álvaro Felipe Ramírez
**Fecha de Creación**: Octubre 2025
**Versión**: 1.0

---

## Sobre Este Documento

Este documento captura la visión holística de diseño y el concepto filosófico detrás de **Genesys Business Intelligence (Genesys BI)**, una iniciativa digital que representa el futuro de la gestión de datos en Seguridad y Salud en el Trabajo (SST).

Como creador de este proyecto, mi objetivo es transformar la manera en que las empresas visualizan, comprenden y actúan sobre los datos de salud ocupacional de sus colaboradores.

---

## El Concepto: Genesys Business Intelligence

### Partnership Estratégico

**Genesys BI** es el resultado de un partnership entre:
- **Mi iniciativa digital**: Una plataforma tecnológica de análisis y visualización de datos
- **Genesys Laboral Medicine SAS**: Empresa constituida especializada en exámenes médicos ocupacionales

Esta alianza combina:
- **Expertise médico y regulatorio** de Genesys Laboral Medicine
- **Innovación tecnológica y analytics** de la plataforma BI
- **Visión de producto** centrada en el usuario final (empresas y profesionales SST)

### La Visión a Futuro

Genesys BI será **la plataforma integral de gestión de big-data en SST** donde las organizaciones podrán:

#### Visualización Inteligente
- **Estadísticas de salud por cargo**: Identificar patrones de riesgo específicos por posición
- **Análisis por zonas geográficas**: Comparar indicadores de salud entre sedes o regiones
- **Tendencias temporales**: Evolución de indicadores de salud a lo largo del tiempo
- **Perfiles epidemiológicos**: Caracterización de población trabajadora

#### Toma de Decisiones Basada en Datos
- Dashboards interactivos y configurables
- Alertas tempranas de riesgos emergentes
- Reportes automáticos con insights accionables
- Predicción de riesgos mediante machine learning

#### Integración de Ecosistema
- Conexión con sistemas de gestión de RRHH
- Integración con ARL y EPS
- Cumplimiento normativo automatizado
- APIs para conectar con otros sistemas empresariales

---

## Filosofía de Diseño

### Principios Fundamentales

#### 1. Claridad Sobre Complejidad
Los datos de salud son complejos por naturaleza, pero la interfaz debe ser **cristalina**. Cada gráfico, cada tabla, cada indicador debe comunicar su mensaje de forma inmediata y sin ambigüedad.

#### 2. Profesionalismo Sin Frialdad
Trabajamos con datos de salud de personas reales. El diseño debe ser profesional, confiable y serio, pero **nunca frío o deshumanizado**. Queremos que los usuarios se sientan respaldados, no intimidados.

#### 3. Acción Sobre Información
No basta con mostrar datos. El diseño debe **impulsar a la acción**. Cada visualización debe responder la pregunta: "¿Qué debo hacer con esta información?"

#### 4. Accesibilidad Universal
Desde el médico ocupacional hasta el gerente de RRHH, todos deben poder **entender y usar** la plataforma sin entrenamiento extensivo.

---

## Sistema de Diseño

### Paleta de Colores

Nuestra paleta refleja confianza, profesionalismo y la naturaleza de nuestro trabajo en salud.

#### Colores Primarios

```scss
$primary: #5dc4af;      // Verde agua - Salud, vitalidad, acción
$secondary: #383d47;    // Gris oscuro - Profesionalismo, solidez
$text: #2d3238;         // Texto principal - Legibilidad óptima
$background: #f3f0f0;   // Fondo general - Suave, sin fatiga visual
```

**Significado del Verde Agua (#5dc4af)**:
- Representa **salud y bienestar**
- Transmite **confianza y tranquilidad**
- Es el color de la **acción constructiva**
- Se usa para: botones principales, enlaces importantes, estados de éxito

#### Colores de Estado

```scss
$success: #4caf50;      // Confirmaciones, niveles bajos de riesgo
$warning: #ffeb3b;      // Alertas, niveles medios de riesgo
$attention: #ff9800;    // Requiere atención inmediata
$danger: #f44336;       // Errores, niveles altos de riesgo
```

**Filosofía de Estados**:
- Usamos colores **universalmente reconocidos** (semáforo)
- El rojo se reserva para situaciones **verdaderamente críticas**
- Evitamos alarmar innecesariamente con colores fuertes

#### Colores Auxiliares para Visualizaciones

```scss
$aux-colors: (
    1: #cbe3f3,  // Azul pastel
    2: #fee6fc,  // Rosa pastel
    3: #fdf8cd,  // Amarillo pastel
    4: #c7f9ff,  // Cyan pastel
    5: #d8fff1,  // Verde menta
    6: #ffefd2,  // Naranja pastel
    7: #e8f4fb,  // Azul cielo
    8: #88c6cb,  // Turquesa
);
```

**Para Dashboards y Gráficos**:
- Colores suaves que **no cansan la vista**
- Alto contraste para **diferenciar series de datos**
- Armoniosos entre sí para **gráficos con múltiples variables**

### Tipografía

#### Poppins - Fuente de Títulos

```scss
font-family: 'Poppins', sans-serif;
weights: 400, 500, 600, 700, 800;
```

**Por Qué Poppins**:
- Geométrica y moderna, transmite **innovación tecnológica**
- Excelente legibilidad en pantallas de todos los tamaños
- Profesional sin ser corporativa rígida
- **Personalidad**: Accesible, clara, contemporánea

**Uso**:
- Títulos principales (H1, H2)
- Nombres de secciones
- Labels importantes en dashboards
- Textos de call-to-action

#### Raleway - Fuente de Cuerpo

```scss
font-family: 'Raleway', sans-serif;
weights: 400, 500, 600, 700, 800;
```

**Por Qué Raleway**:
- Elegante y espaciosa, facilita **lectura prolongada**
- Combina perfectamente con Poppins
- Mantiene claridad incluso en tamaños pequeños
- **Personalidad**: Refinada, confiable, profesional

**Uso**:
- Párrafos y cuerpos de texto
- Descripciones y explicaciones
- Datos en tablas y listas
- Tooltips y ayudas contextuales

#### Sistema de Escala

```scss
html { font-size: 62.5%; } // 1rem = 10px
```

**Escala Modular**:
```scss
// Tamaños más usados
1.2rem = 12px  // Textos auxiliares, fechas
1.4rem = 14px  // Textos pequeños, labels
1.6rem = 16px  // Texto base (body)
1.8rem = 18px  // Texto destacado
2.0rem = 20px  // Subtítulos
2.4rem = 24px  // Títulos H3
3.0rem = 30px  // Títulos H2
3.6rem = 36px  // Títulos H1
4.8rem = 48px  // Hero titles
```

**Filosofía**:
- Base de **62.5%** facilita cálculos mentales (1rem = 10px)
- Uso exclusivo de **unidades rem** para accesibilidad
- Escala consistente con proporciones armónicas

---

## Principios de UX Aplicados

### 1. Información Progresiva

No abrumamos al usuario con todos los datos de golpe. Implementamos:
- **Vistas resumen** con KPIs principales
- **Drill-down** para explorar detalles
- **Filtros intuitivos** para enfocarse en lo relevante

### 2. Jerarquía Visual Clara

```
Nivel 1: KPIs críticos (grande, color primario)
  ↓
Nivel 2: Métricas secundarias (mediano, color secundario)
  ↓
Nivel 3: Datos de soporte (normal, texto)
  ↓
Nivel 4: Contexto y ayudas (pequeño, texto claro)
```

### 3. Feedback Constante

Todo acción genera feedback:
- **Inmediato**: Hover states, clicks registrados
- **Procesamiento**: Loaders con mensaje contextual
- **Resultado**: Confirmación clara o mensaje de error explicativo

### 4. Mobile-First para Genesys BI

Aunque es una plataforma enterprise, muchos usuarios revisarán datos desde móvil:
- Dashboards **adaptables** a pantallas pequeñas
- **Touch targets** de mínimo 44x44px
- Navegación simplificada para móvil
- **Gráficos responsive** que se redibujando según viewport

### 5. Accesibilidad WCAG 2.1 AA

Cumplimiento estricto:
- **Contraste mínimo** 4.5:1 para texto normal
- **Navegación por teclado** en todos los componentes
- **Screen reader friendly** con ARIA labels
- **Textos alternativos** para visualizaciones de datos

---

## Estilo Visual: Limpio y Profesional

### NO Usamos Gradientes

**Regla Fundamental**: Colores sólidos únicamente.

**Razón**:
- Los gradientes pueden distraer de los datos
- Dificultan mantener consistencia
- Pueden crear problemas de legibilidad
- La información médica requiere **claridad absoluta**

### Espaciado Generoso

```scss
// Espaciado base
$spacing-xs: 0.4rem;   // 4px
$spacing-sm: 0.8rem;   // 8px
$spacing-md: 1.6rem;   // 16px
$spacing-lg: 2.4rem;   // 24px
$spacing-xl: 3.2rem;   // 32px
$spacing-xxl: 4.8rem;  // 48px
```

**Principio**: El espacio en blanco no es desperdiciado, es **estratégico**.
- Reduce carga cognitiva
- Mejora escaneabilidad
- Destaca elementos importantes

### Bordes y Sombras Sutiles

```scss
border-radius: 8px - 16px;  // Suave, moderno
box-shadow: 0 2px 8px rgba(0,0,0,0.1);  // Elevación sutil
transition: all 0.3s ease;  // Transiciones suaves
```

**Objetivo**: Crear jerarquía visual sin ser intrusivos.

### Componentes Consistentes

Todos los elementos comparten:
- **Border radius consistente**: 8-12px para elementos pequeños, 16px para cards
- **Sombras predefinidas**: Tres niveles (elevación baja, media, alta)
- **Estados hover/active**: Siempre con transición suave de 0.3s

---

## Componentes Clave de Genesys BI

### Dashboard Cards

```scss
.dashboard-card {
    background: white;
    border-radius: 16px;
    padding: 2.4rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);

    &:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        transform: translateY(-2px);
    }
}
```

### Data Visualizations

**Principios para Gráficos**:
- **Colores auxiliares** para distinguir series
- **Colores de estado** para indicar niveles de riesgo
- **Tooltips informativos** al hover
- **Leyendas claras** con iconografía cuando sea necesario
- **Animaciones sutiles** en carga (máx 0.6s)

### Tables

```scss
.data-table {
    // Cebrado sutil para legibilidad
    tbody tr:nth-child(even) {
        background: rgba($primary, 0.03);
    }

    // Hover destacado
    tbody tr:hover {
        background: rgba($primary, 0.08);
    }

    // Headers fijos para tablas largas
    thead {
        position: sticky;
        top: 0;
        background: $secondary;
        color: white;
    }
}
```

### Buttons

**Jerarquía de Botones**:
1. **Primary**: Acción principal (verde agua)
2. **Secondary**: Acciones secundarias (gris oscuro)
3. **Ghost**: Acciones terciarias (solo borde)
4. **Danger**: Acciones destructivas (rojo)

```scss
.btn {
    padding: 1.2rem 2.4rem;
    border-radius: 8px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
}
```

---

## Iconografía

### Lineamientos

- **Estilo**: Line icons, outline (no filled)
- **Grosor**: 2px de stroke
- **Tamaños**: 16px, 20px, 24px, 32px
- **Librería recomendada**: Feather Icons o Heroicons
- **Colores**: Heredan del contexto o usan $primary/$secondary

### Uso Estratégico

Los íconos deben:
- **Reforzar el texto**, nunca reemplazarlo completamente
- Ser **universalmente reconocibles**
- Mantener consistencia de estilo en toda la plataforma

---

## Performance y Optimización

### Principios de Rendimiento

1. **Lazy Loading**: Componentes y datos se cargan bajo demanda
2. **Virtualización**: Tablas grandes usan windowing
3. **Debouncing**: Búsquedas y filtros optimizados
4. **Caching inteligente**: Datos frecuentes en cache local

### Métricas Objetivo

```
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
TTI (Time to Interactive): < 3.5s
```

---

## Responsividad

### Breakpoints

```scss
$breakpoints: (
    "mobile": 400px,   // Teléfonos pequeños
    "tablet": 955px,   // Tablets y teléfonos grandes
    "desktop": 1080px  // Escritorio estándar
);
```

### Estrategia Mobile

Para dashboards complejos:
- **Priorizar KPIs críticos** en vista móvil
- **Colapsar gráficos complejos** en versiones simplificadas
- **Menú hamburguesa** con navegación clara
- **Bottom tabs** para navegación principal en móvil

---

## Flujo de Trabajo del Usuario

### Usuario Principal: Profesional SST

**Flujo Típico**:
1. **Login** → Dashboard general (resumen ejecutivo)
2. **Selección de filtros** (fecha, sede, cargo)
3. **Exploración de métricas** (click en KPI de interés)
4. **Drill-down** en dato específico
5. **Generación de reporte** o exportación
6. **Acción** (crear alerta, agendar intervención)

**Necesidades de Diseño**:
- **Dashboard intuitivo** con jerarquía clara de información
- **Filtros siempre visibles** (sticky sidebar o top bar)
- **Export rápido** (botón siempre accesible)
- **Historial de consultas** para repetir análisis frecuentes

---

## Voz y Tono

### Personalidad de Marca

**Genesys BI es**:
- **Confiable**: Como un asesor experto
- **Empoderador**: Da control al usuario
- **Claro**: Nunca ambiguo o confuso
- **Proactivo**: Sugiere acciones relevantes

**Genesys BI NO es**:
- Robótico o frío
- Condescendiente o simplón
- Alarmista o sensacionalista
- Pasivo o neutral

### Microcopy

**Ejemplos de Tono**:

❌ **Mal**: "Error en la consulta. Código: 500"
✅ **Bien**: "No pudimos cargar estos datos. Intenta de nuevo o contáctanos si persiste."

❌ **Mal**: "Se detectaron 15 anomalías"
✅ **Bien**: "Encontramos 15 casos que requieren tu revisión"

❌ **Mal**: "Datos cargados exitosamente"
✅ **Bien**: "Tu dashboard está actualizado con los últimos datos"

---

## Roadmap de Evolución

### Fase 1: Foundation (Actual)
- ✅ Generación de documentos SST (Profesiograma, Matriz de Riesgos)
- ✅ Sistema de resultados y carrito de compra
- ✅ Integración con WhatsApp
- 🔄 Sistema de identidad visual establecido

### Fase 2: Analytics Core (6-12 meses)
- Dashboard ejecutivo con KPIs principales
- Visualizaciones por cargo, zona, período
- Reportería automatizada
- Comparativas temporales y benchmarks

### Fase 3: Intelligence (12-18 meses)
- Alertas predictivas con ML
- Recomendaciones automáticas de intervenciones
- Análisis de tendencias y predicción de riesgos
- Integración con sistemas externos (RRHH, ARL)

### Fase 4: Ecosystem (18-24 meses)
- API pública para integraciones
- Marketplace de módulos y extensiones
- White-label para consultoras SST
- Mobile app nativa

---

## Consideraciones Técnicas

### Stack Tecnológico Proyectado

**Frontend Analytics**:
- Framework: React o Vue.js (por definir)
- Gráficos: D3.js + Chart.js para balancear flexibilidad y facilidad
- State Management: Context API o Zustand (lightweight)
- Tablas: TanStack Table (ex React Table)

**Backend Analytics**:
- API: Node.js (mantener consistencia con sistema actual)
- Procesamiento de datos: Python + Pandas (para cálculos complejos)
- Cache: Redis para queries frecuentes
- Background jobs: Bull para procesamiento asíncrono

**Database**:
- Actual: PostgreSQL (mantener)
- Analytics: Considerar TimescaleDB (extensión de Postgres para series temporales)
- Warehouse (futuro): Snowflake o BigQuery para big data

### Arquitectura de Datos

```
Fuentes de Datos
    ↓
ETL Pipeline (Node.js + Python)
    ↓
PostgreSQL / TimescaleDB
    ↓
API Layer (Express)
    ↓
Frontend (React/Vue)
    ↓
Usuario
```

---

## Mensajes Clave para el Equipo

### Para Desarrolladores

> "Cada componente que construyas debe responder: ¿Esto ayuda al usuario a tomar una mejor decisión? Si no, repiénsalo."

- **Prioriza la performance**: Usuarios trabajando con datos no pueden esperar
- **Testing riguroso**: Estamos manejando información de salud
- **Documentación clara**: El código debe ser mantenible a largo plazo
- **Accesibilidad desde el día 1**: No es opcional

### Para Diseñadores

> "Diseña para el médico ocupacional que revisa 50 empresas, no para el usuario ocasional."

- **Eficiencia sobre belleza**: Si es hermoso pero lento, no sirve
- **Consistencia absoluta**: Usuarios deben "aprender una vez, usar siempre"
- **Data storytelling**: Cada visualización debe contar una historia clara
- **Diseña con datos reales**: Mock-ups con data realista

### Para el Equipo Médico/SST

> "Ustedes son los expertos. La tecnología debe amplificar su experiencia, no reemplazarla."

- **Feedback constante**: Iteraremos hasta que sea perfecto
- **Validación de insights**: Toda feature analítica debe ser validada por expertos
- **Terminología precisa**: Usaremos su lenguaje, no jerga técnica
- **Enfoque en acción**: Toda métrica debe llevar a una intervención posible

---

## Conclusión: El Futuro es Inteligencia Aplicada

Genesys BI no es solo otra plataforma de dashboards. Es **la herramienta que transformará cómo las empresas cuidan la salud de su gente**.

### Nuestra Promesa

A través de diseño inteligente y tecnología de punta, vamos a:
1. **Hacer visible lo invisible**: Riesgos ocultos en los datos saldrán a la luz
2. **Convertir datos en decisiones**: Cada insight generará una acción concreta
3. **Democratizar el análisis avanzado**: Profesionales SST sin expertise técnico podrán hacer análisis complejos
4. **Salvar vidas**: Identificación temprana de riesgos previene tragedias

### Mi Compromiso como Creador

Como Álvaro Felipe Ramírez, creador de Genesys BI, me comprometo a:

- **Mantener la visión**: No perder el norte ante modas pasajeras
- **Escuchar a los usuarios**: Ellos saben qué necesitan
- **Iterar constantemente**: La perfección es un proceso, no un destino
- **Priorizar el impacto**: Cada feature debe resolver un problema real

---

**Este documento es vivo y evolucionará con el proyecto.**

Última actualización: Octubre 2025
Próxima revisión: Enero 2026

---

*"En Genesys BI, los datos no son números. Son personas, historias y oportunidades de hacer la diferencia."*

**— Álvaro Felipe Ramírez**
