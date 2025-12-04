import { html, render } from 'lit-html';

/**
 * PlantillasManager - Gestión de plantillas de niveles GTC-45
 * Incluye configuración inicial con barras semaforizadas hermosas
 */
export class PlantillasManager {
  constructor(container, state) {
    this.container = container;
    this.state = state;
    this.plantillas = [];

    // Configuración de niveles GTC-45
    this.nivelesGTC45 = {
      ND: [
        { value: 0, label: 'Bajo (B)', color: '#4caf50', emoji: '🟢' },
        { value: 2, label: 'Medio (M)', color: '#ffeb3b', emoji: '🟡' },
        { value: 6, label: 'Alto (A)', color: '#ff9800', emoji: '🟠' },
        { value: 10, label: 'Muy Alto (MA)', color: '#f44336', emoji: '🔴' }
      ],
      NE: [
        { value: 1, label: 'Esporádica (EE)', color: '#4caf50', emoji: '🟢' },
        { value: 2, label: 'Ocasional (EO)', color: '#ffeb3b', emoji: '🟡' },
        { value: 3, label: 'Frecuente (EF)', color: '#ff9800', emoji: '🟠' },
        { value: 4, label: 'Continua (EC)', color: '#f44336', emoji: '🔴' }
      ],
      NC: [
        { value: 10, label: 'Leve (L)', color: '#4caf50', emoji: '🟢' },
        { value: 25, label: 'Grave (G)', color: '#ffeb3b', emoji: '🟡' },
        { value: 60, label: 'Muy Grave (MG)', color: '#ff9800', emoji: '🟠' },
        { value: 100, label: 'Mortal (M)', color: '#f44336', emoji: '🔴' }
      ]
    };

    // Plantillas por defecto por categoría
    this.plantillasDefault = {
      FISICO: { ND: 6, NE: 3, NC: 25 },
      MECANICO: { ND: 10, NE: 3, NC: 60 },
      QUIMICO: { ND: 6, NE: 2, NC: 60 },
      BIOLOGICO: { ND: 6, NE: 3, NC: 25 },
      PSICOSOCIAL: { ND: 2, NE: 4, NC: 10 },
      ERGONOMICO: { ND: 6, NE: 4, NC: 25 },
      ELECTRICO: { ND: 10, NE: 2, NC: 100 },
      LOCATIVO: { ND: 6, NE: 3, NC: 25 }
    };

    this.categoriasRiesgo = [
      { id: 'FISICO', nombre: 'Riesgos Físicos', icon: 'fa-sound', descripcion: 'Ruido, vibración, temperaturas, iluminación' },
      { id: 'MECANICO', nombre: 'Riesgos Mecánicos', icon: 'fa-cog', descripcion: 'Caídas, golpes, atrapamiento, proyecciones' },
      { id: 'QUIMICO', nombre: 'Riesgos Químicos', icon: 'fa-flask', descripcion: 'Gases, vapores, polvos, líquidos' },
      { id: 'BIOLOGICO', nombre: 'Riesgos Biológicos', icon: 'fa-virus', descripcion: 'Virus, bacterias, hongos' },
      { id: 'PSICOSOCIAL', nombre: 'Riesgos Psicosociales', icon: 'fa-brain', descripcion: 'Estrés, carga mental, acoso' },
      { id: 'ERGONOMICO', nombre: 'Riesgos Ergonómicos', icon: 'fa-user', descripcion: 'Posturas, movimientos repetitivos' },
      { id: 'ELECTRICO', nombre: 'Riesgos Eléctricos', icon: 'fa-bolt', descripcion: 'Alta/baja tensión, arco eléctrico' },
      { id: 'LOCATIVO', nombre: 'Riesgos Locativos', icon: 'fa-building', descripcion: 'Pisos, escaleras, almacenamiento' }
    ];
  }

  async init() {
    try {
      // Cargar plantillas existentes
      const response = await fetch('/api/plantillas-niveles');
      const data = await response.json();

      if (data.success) {
        this.plantillas = data.plantillas || [];
      }

      // Si no hay plantillas, mostrar configuración inicial
      if (this.plantillas.length === 0) {
        this.showConfiguracionInicial();
      } else {
        this.showResumenPlantillas();
      }
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      this.showConfiguracionInicial(); // Fallback a configuración inicial
    }
  }

  /**
   * Mostrar pantalla de configuración inicial
   */
  showConfiguracionInicial() {
    const template = html`
      <div class="plantillas-config-inicial">
        <div class="plantillas-header">
          <h2>🧠 Configuración Inteligente de Niveles GTC-45</h2>
          <p class="plantillas-subtitle">
            Configura plantillas de valoración para evaluar riesgos similares más rápido.
            Define niveles típicos por categoría y el sistema los sugerirá automáticamente.
          </p>
        </div>

        <div class="plantillas-grid">
          ${this.categoriasRiesgo.map(cat => this.renderPlantillaCard(cat))}
        </div>

        <div class="plantillas-actions">
          <button
            @click=${this.handleCrearPlantillasDefault}
            class="btn btn-primary btn-lg"
          >
            <i class="fas fa-magic"></i>
            Usar Plantillas Recomendadas
          </button>
          <button
            @click=${this.handleSaltarPlantillas}
            class="btn btn-secondary btn-lg"
          >
            <i class="fas fa-forward"></i>
            Saltar (Evaluar Manualmente)
          </button>
        </div>

        <div class="plantillas-help">
          <p>
            <i class="fas fa-info-circle"></i>
            <strong>¿Por qué usar plantillas?</strong>
            Ahorra hasta 80% del tiempo en evaluaciones con múltiples riesgos similares.
            Siempre podrás ajustar los valores sugeridos.
          </p>
        </div>
      </div>
    `;

    render(template, this.container);
  }

  /**
   * Render de card de plantilla con barras semaforizadas
   */
  renderPlantillaCard(categoria) {
    const niveles = this.plantillasDefault[categoria.id];

    // Calcular NP y NR
    const np = niveles.ND * niveles.NE;
    const nr = np * niveles.NC;
    const interpretacion = this.interpretarNR(nr);

    return html`
      <div class="plantilla-card">
        <div class="plantilla-card__header">
          <i class="fas ${categoria.icon}"></i>
          <h3>${categoria.nombre}</h3>
        </div>

        <p class="plantilla-card__descripcion">${categoria.descripcion}</p>

        <!-- BARRAS SEMAFORIZADAS -->
        <div class="plantilla-niveles">
          ${this.renderBarraNivel('ND', niveles.ND, categoria.id)}
          ${this.renderBarraNivel('NE', niveles.NE, categoria.id)}
          ${this.renderBarraNivel('NC', niveles.NC, categoria.id)}
        </div>

        <!-- RESULTADO AUTOMÁTICO -->
        <div class="plantilla-resultado ${interpretacion.clase}">
          <div class="plantilla-resultado__calculo">
            <span>NP = ${niveles.ND} × ${niveles.NE} = <strong>${np}</strong></span>
            <span>NR = ${np} × ${niveles.NC} = <strong>${nr}</strong></span>
          </div>
          <div class="plantilla-resultado__nivel">
            <span class="nivel-badge nivel-badge--${interpretacion.clase}">
              ${interpretacion.emoji} ${interpretacion.texto}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render de barra semaforizada individual (4 colores)
   */
  renderBarraNivel(tipo, valorActual, categoriaId) {
    const opciones = this.nivelesGTC45[tipo];
    const tipoLabel = tipo === 'ND' ? 'Nivel de Deficiencia' :
                      tipo === 'NE' ? 'Nivel de Exposición' :
                      'Nivel de Consecuencia';

    return html`
      <div class="nivel-selector">
        <label class="nivel-selector__label">
          ${tipoLabel} (${tipo})
          <button
            class="nivel-selector__help"
            @click=${() => this.showTooltip(tipo)}
            aria-label="Ayuda"
          >
            <i class="fas fa-question-circle"></i>
          </button>
        </label>

        <div class="nivel-bar" role="radiogroup" aria-label="${tipoLabel}">
          ${opciones.map(opcion => html`
            <button
              class="nivel-option ${valorActual === opcion.value ? 'nivel-option--selected' : ''}"
              style="--nivel-color: ${opcion.color}"
              role="radio"
              aria-checked="${valorActual === opcion.value}"
              @click=${() => this.handleSelectNivel(categoriaId, tipo, opcion.value)}
              data-categoria="${categoriaId}"
              data-tipo="${tipo}"
              data-value="${opcion.value}"
            >
              <span class="nivel-option__emoji">${opcion.emoji}</span>
              <span class="nivel-option__label">${opcion.label.split(' ')[0]}</span>
              <span class="nivel-option__value">${opcion.value}</span>
              ${valorActual === opcion.value ? html`
                <span class="nivel-option__check">✓</span>
              ` : ''}
            </button>
          `)}
        </div>
      </div>
    `;
  }

  /**
   * Handler: Seleccionar nivel en barra
   */
  handleSelectNivel = (categoriaId, tipo, valor) => {
    this.plantillasDefault[categoriaId][tipo] = valor;
    this.showConfiguracionInicial(); // Re-render para mostrar cambios
  }

  /**
   * Handler: Crear plantillas default
   */
  handleCrearPlantillasDefault = async () => {
    try {
      const response = await fetch('/api/plantillas-niveles/crear-defaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: 1 }) // TODO: Obtener de sesión
      });

      const data = await response.json();

      if (data.success) {
        this.plantillas = data.plantillas;
        console.log(`✅ ${data.plantillas.length} plantillas creadas exitosamente`);

        // Cerrar modal y continuar con el wizard
        this.onComplete();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error al crear plantillas:', error);
      alert('Error al crear plantillas. Por favor, intenta nuevamente.');
    }
  }

  /**
   * Handler: Saltar configuración de plantillas
   */
  handleSaltarPlantillas = () => {
    console.log('Usuario optó por evaluación manual (sin plantillas)');
    this.onComplete();
  }

  /**
   * Mostrar resumen de plantillas existentes
   */
  showResumenPlantillas() {
    const template = html`
      <div class="plantillas-resumen">
        <h2>📋 Plantillas de Niveles Configuradas</h2>
        <p>Tienes ${this.plantillas.length} plantillas activas.</p>

        <div class="plantillas-list">
          ${this.plantillas.map(p => html`
            <div class="plantilla-item">
              <h4>${p.nombre_plantilla}</h4>
              <p>Categoría: ${p.categoria_riesgo}</p>
              <p>Niveles: ND=${p.niveles_default.ND}, NE=${p.niveles_default.NE}, NC=${p.niveles_default.NC}</p>
              <p>Aplicada ${p.num_veces_aplicada} veces (${Math.round(p.tasa_aceptacion * 100)}% aceptación)</p>
            </div>
          `)}
        </div>

        <button @click=${this.onComplete} class="btn btn-primary">
          Continuar con el Wizard
        </button>
      </div>
    `;

    render(template, this.container);
  }

  /**
   * Interpretar NR según GTC-45
   */
  interpretarNR(nr) {
    if (nr >= 600) {
      return {
        nivel: 'I',
        texto: 'No Aceptable',
        clase: 'nivel-i',
        emoji: '🔴',
        color: '#f44336'
      };
    } else if (nr >= 150) {
      return {
        nivel: 'II',
        texto: 'No Aceptable con Control',
        clase: 'nivel-ii',
        emoji: '🟠',
        color: '#ff9800'
      };
    } else if (nr >= 40) {
      return {
        nivel: 'III',
        texto: 'Mejorable',
        clase: 'nivel-iii',
        emoji: '🟡',
        color: '#ffeb3b'
      };
    } else {
      return {
        nivel: 'IV',
        texto: 'Aceptable',
        clase: 'nivel-iv',
        emoji: '🟢',
        color: '#4caf50'
      };
    }
  }

  /**
   * Mostrar tooltip de ayuda
   */
  showTooltip(tipo) {
    const ayudas = {
      ND: 'Evalúa la efectividad de las medidas de control existentes. Bajo=controles excelentes, Muy Alto=sin controles.',
      NE: 'Frecuencia y duración de exposición al riesgo. Esporádica=eventual, Continua=toda la jornada.',
      NC: 'Gravedad del daño potencial. Leve=sin hospitalización, Mortal=muerte del trabajador.'
    };

    alert(ayudas[tipo]); // TODO: Mejorar con modal o tooltip más elegante
  }

  /**
   * Callback al completar configuración
   */
  onComplete() {
    if (this.options && this.options.onComplete) {
      this.options.onComplete();
    }
  }

  /**
   * Set options
   */
  setOptions(options) {
    this.options = options;
  }
}
