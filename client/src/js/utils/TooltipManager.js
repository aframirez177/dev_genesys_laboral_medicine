/**
 * TooltipManager.js - Sistema de tooltips profesionales que siguen al mouse
 *
 * Características:
 * - Tooltips que siguen el cursor del mouse
 * - Diseño pulido con animaciones suaves
 * - Soporte para título, descripción y tips
 * - Posicionamiento inteligente (no se sale de la pantalla)
 * - Reutilizable en cualquier parte de la aplicación
 *
 * Uso:
 * import { TooltipManager } from './utils/TooltipManager.js';
 * const tooltipManager = new TooltipManager();
 * tooltipManager.showTooltip('Contenido del tooltip', { title: 'Título', tip: 'Consejo' });
 * tooltipManager.hideTooltip();
 */

export class TooltipManager {
  constructor() {
    this.activeTooltip = null;
    this.currentMouseX = 0;
    this.currentMouseY = 0;

    // SEGUIR MOVIMIENTO DEL MOUSE
    this.mouseMoveHandler = (e) => {
      this.currentMouseX = e.clientX;
      this.currentMouseY = e.clientY;

      // ACTUALIZAR POSICIÓN DEL TOOLTIP ACTIVO
      if (this.activeTooltip) {
        this.updateTooltipPosition();
      }
    };

    document.addEventListener("mousemove", this.mouseMoveHandler);

    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById("tooltip-styles")) return;

    const style = document.createElement("style");
    style.id = "tooltip-styles";
    style.textContent = `
      .enhanced-tooltip {
        position: fixed;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        line-height: 1.4;
        max-width: 300px;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transform: scale(0.8);
        transition: opacity 0.1s ease, transform 0.1s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        word-wrap: break-word;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .enhanced-tooltip.visible {
        opacity: 1;
        transform: scale(1);
      }

      .enhanced-tooltip .tooltip-title {
        font-weight: bold;
        color: #5dc4af;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .enhanced-tooltip .tooltip-description {
        color: #e0e0e0;
        margin-bottom: 4px;
      }

      .enhanced-tooltip .tooltip-tip {
        color: #ffeb3b;
        font-size: 11px;
        font-style: italic;
        margin-top: 4px;
        opacity: 0.8;
      }

      .enhanced-tooltip .tooltip-examples {
        color: #b0b0b0;
        font-size: 11px;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }

      .nivel-label {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .info-icon {
        cursor: help;
        font-size: 12px;
        opacity: 0.7;
        transition: opacity 0.2s ease;
      }

      .info-icon:hover {
        opacity: 1;
      }

      /* SOLUCIÓN PARA ELEMENTOS ANIDADOS EN BARRAS */
      .barra .barra-label,
      .barra .check-icon {
        pointer-events: none;
      }

      .barra {
        position: relative;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  createTooltip(content, options = {}) {
    const tooltip = document.createElement("div");
    tooltip.className = "enhanced-tooltip";

    let html = "";
    if (options.title) {
      html += `<div class="tooltip-title">${options.title}</div>`;
    }
    if (content) {
      html += `<div class="tooltip-description">${content}</div>`;
    }
    if (options.tip) {
      html += `<div class="tooltip-tip">💡 ${options.tip}</div>`;
    }
    if (options.examples) {
      html += `<div class="tooltip-examples">${options.examples}</div>`;
    }

    tooltip.innerHTML = html;
    return tooltip;
  }

  /**
   * Mostrar tooltip inmediatamente en posición del mouse
   * @param {string} content - Contenido principal del tooltip
   * @param {Object} options - Opciones adicionales (title, tip, examples)
   */
  showTooltip(content, options = {}) {
    // LIMPIAR TOOLTIP ANTERIOR
    this.hideTooltip();

    // CREAR NUEVO TOOLTIP
    const tooltip = this.createTooltip(content, options);
    this.activeTooltip = tooltip;

    // AÑADIR AL DOM
    document.body.appendChild(tooltip);

    // POSICIONAR EN MOUSE
    this.updateTooltipPosition();

    // MOSTRAR INMEDIATAMENTE
    requestAnimationFrame(() => {
      tooltip.classList.add("visible");
    });
  }

  /**
   * Actualizar posición del tooltip según cursor del mouse
   */
  updateTooltipPosition() {
    if (!this.activeTooltip) return;

    const tooltip = this.activeTooltip;
    const tooltipRect = tooltip.getBoundingClientRect();
    const offset = 15;

    let left = this.currentMouseX + offset;
    let top = this.currentMouseY + offset;

    // AJUSTAR SI SE SALE DE LA PANTALLA POR LA DERECHA
    if (left + tooltipRect.width > window.innerWidth) {
      left = this.currentMouseX - tooltipRect.width - offset;
    }

    // AJUSTAR SI SE SALE DE LA PANTALLA POR ABAJO
    if (top + tooltipRect.height > window.innerHeight) {
      top = this.currentMouseY - tooltipRect.height - offset;
    }

    // ASEGURAR QUE NO SE SALGA DE LOS BORDES
    left = Math.max(
      10,
      Math.min(left, window.innerWidth - tooltipRect.width - 10)
    );
    top = Math.max(
      10,
      Math.min(top, window.innerHeight - tooltipRect.height - 10)
    );

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  /**
   * Ocultar tooltip inmediatamente
   */
  hideTooltip() {
    if (this.activeTooltip) {
      if (document.body.contains(this.activeTooltip)) {
        document.body.removeChild(this.activeTooltip);
      }
      this.activeTooltip = null;
    }
  }

  /**
   * Destruir el TooltipManager y limpiar event listeners
   */
  destroy() {
    this.hideTooltip();
    document.removeEventListener("mousemove", this.mouseMoveHandler);

    // Remover estilos inyectados
    const styleElement = document.getElementById("tooltip-styles");
    if (styleElement) {
      styleElement.remove();
    }
  }
}

/**
 * Contenido predefinido de tooltips para niveles de riesgo GTC 45
 * Exportado para uso en wizard y formularios
 */
export const tooltipContent = {
  // NIVELES DE DEFICIENCIA
  deficiencia: {
    bajo: {
      title: "🟢 Nivel de Deficiencia: BAJO (B)",
      description:
        "No se ha detectado consecuencia alguna, o la eficacia del conjunto de medidas preventivas existentes es alta.",
      tip: "Las medidas de control están funcionando correctamente",
      examples: "Ejemplo: Uso correcto de EPP, mantenimiento preventivo al día",
    },
    medio: {
      title: "🟡 Nivel de Deficiencia: MEDIO (M)",
      description:
        "Se han detectado peligros que pueden dar lugar a consecuencias poco significativas.",
      tip: "Es necesario revisar y mejorar algunas medidas de control",
      examples: "Ejemplo: EPP en buen estado pero falta capacitación en su uso",
    },
    alto: {
      title: "🟠 Nivel de Deficiencia: ALTO (A)",
      description:
        "Se ha(n) detectado algún(os) peligro(s) que pueden dar lugar a consecuencias significativa(s).",
      tip: "Requiere atención prioritaria para implementar controles",
      examples: "Ejemplo: EPP deteriorado, procedimientos desactualizados",
    },
    muyAlto: {
      title: "🔴 Nivel de Deficiencia: MUY ALTO (MA)",
      description:
        "Se han detectado peligros que determinan como muy posible la generación de incidentes.",
      tip: "¡ACCIÓN INMEDIATA! Riesgo crítico que debe ser controlado urgentemente",
      examples:
        "Ejemplo: Ausencia total de medidas de control, equipos defectuosos",
    },
  },

  // NIVELES DE EXPOSICIÓN
  exposicion: {
    esporadica: {
      title: "🟢 Nivel de Exposición: ESPORÁDICA (EE)",
      description: "La situación de exposición se presenta de manera eventual.",
      tip: "Ocurre rara vez durante las actividades laborales",
      examples:
        "Ejemplo: Trabajos de mantenimiento ocasionales, tareas especiales",
    },
    ocasional: {
      title: "🟡 Nivel de Exposición: OCASIONAL (EO)",
      description:
        "La situación de exposición se presenta alguna vez durante la jornada laboral y por un periodo de tiempo corto.",
      tip: "Exposición limitada en tiempo y frecuencia",
      examples:
        "Ejemplo: Uso de químicos 1-2 veces por semana, trabajos de soldadura puntuales",
    },
    frecuente: {
      title: "🟠 Nivel de Exposición: FRECUENTE (EF)",
      description:
        "La situación de exposición se presenta varias veces durante la jornada laboral por tiempos cortos.",
      tip: "Exposición regular pero por períodos breves",
      examples:
        "Ejemplo: Manipulación de cargas varias veces al día, ruido intermitente",
    },
    continua: {
      title: "🔴 Nivel de Exposición: CONTINUA (EC)",
      description:
        "La situación de exposición se presenta sin interrupción o varias veces con tiempo prolongado durante la jornada laboral.",
      tip: "Exposición constante durante toda la jornada laboral",
      examples:
        "Ejemplo: Operadores de máquinas ruidosas, trabajo permanente con pantallas",
    },
  },

  // NIVELES DE CONSECUENCIA
  consecuencia: {
    leve: {
      title: "🟢 Nivel de Consecuencia: LEVE (L)",
      description: "Lesiones o enfermedades que no requieren incapacidad.",
      tip: "Daños menores que no afectan la capacidad de trabajo",
      examples:
        "Ejemplo: Rasguños menores, dolores musculares leves, irritaciones",
    },
    grave: {
      title: "🟡 Nivel de Consecuencia: GRAVE (G)",
      description: "Lesiones o enfermedades con incapacidad laboral temporal.",
      tip: "Requiere tiempo de recuperación pero es reversible",
      examples:
        "Ejemplo: Fracturas simples, cortes que requieren sutura, quemaduras leves",
    },
    muyGrave: {
      title: "🟠 Nivel de Consecuencia: MUY GRAVE (MG)",
      description: "Lesiones o enfermedades graves irreparables.",
      tip: "Daños permanentes que afectan la calidad de vida",
      examples:
        "Ejemplo: Pérdida de extremidades, sordera permanente, enfermedades crónicas",
    },
    mortal: {
      title: "🔴 Nivel de Consecuencia: MORTAL (M)",
      description: "Muerte.",
      tip: "El máximo nivel de gravedad posible",
      examples:
        "Ejemplo: Electrocución, caídas fatales, exposición a sustancias letales",
    },
  },
};

/**
 * Helper para crear instancia global singleton (opcional)
 */
let globalTooltipManager = null;

export function getGlobalTooltipManager() {
  if (!globalTooltipManager) {
    globalTooltipManager = new TooltipManager();
  }
  return globalTooltipManager;
}

export function destroyGlobalTooltipManager() {
  if (globalTooltipManager) {
    globalTooltipManager.destroy();
    globalTooltipManager = null;
  }
}
