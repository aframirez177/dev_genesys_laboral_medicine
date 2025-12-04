/**
 * wizardTooltip.js - Sistema de tooltips con Floating-UI
 *
 * Tooltips profesionales para ayuda contextual en el wizard
 * Usa @floating-ui/dom para posicionamiento inteligente
 *
 * @module utils/wizardTooltip
 */

import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

/**
 * Crea un tooltip para un elemento
 *
 * @param {HTMLElement} triggerElement - Elemento que dispara el tooltip
 * @param {Object} options - Opciones del tooltip
 * @param {string} options.content - Contenido del tooltip (HTML permitido)
 * @param {string} options.placement - Posición: 'top'|'bottom'|'left'|'right' (default: 'top')
 * @param {number} options.offsetDistance - Distancia del trigger en px (default: 8)
 * @param {string} options.trigger - Evento: 'hover'|'click'|'focus' (default: 'hover')
 * @returns {Object} API del tooltip { show, hide, destroy }
 */
export function createTooltip(triggerElement, {
  content = '',
  placement = 'top',
  offsetDistance = 8,
  trigger = 'hover'
} = {}) {
  // Crear elemento tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'wizard-help-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.innerHTML = content;
  tooltip.style.position = 'absolute';
  tooltip.style.top = '0';
  tooltip.style.left = '0';

  let isVisible = false;

  // Función para actualizar posición
  async function updatePosition() {
    const { x, y, placement: finalPlacement } = await computePosition(
      triggerElement,
      tooltip,
      {
        placement,
        middleware: [
          offset(offsetDistance),
          flip(),
          shift({ padding: 8 })
        ]
      }
    );

    Object.assign(tooltip.style, {
      left: `${x}px`,
      top: `${y}px`
    });

    // Actualizar atributo para CSS del arrow
    tooltip.setAttribute('data-popper-placement', finalPlacement);
  }

  // Mostrar tooltip
  async function show() {
    if (isVisible) return;

    document.body.appendChild(tooltip);
    await updatePosition();

    requestAnimationFrame(() => {
      tooltip.setAttribute('data-show', '');
      isVisible = true;
    });
  }

  // Ocultar tooltip
  function hide() {
    if (!isVisible) return;

    tooltip.removeAttribute('data-show');
    isVisible = false;

    // Remover del DOM después de la animación
    setTimeout(() => {
      if (tooltip.parentElement && !isVisible) {
        tooltip.remove();
      }
    }, 150); // Match CSS transition duration
  }

  // Destruir tooltip completamente
  function destroy() {
    hide();
    // Remover event listeners
    if (trigger === 'hover') {
      triggerElement.removeEventListener('mouseenter', show);
      triggerElement.removeEventListener('mouseleave', hide);
    } else if (trigger === 'click') {
      triggerElement.removeEventListener('click', toggleTooltip);
      document.removeEventListener('click', handleOutsideClick);
    } else if (trigger === 'focus') {
      triggerElement.removeEventListener('focus', show);
      triggerElement.removeEventListener('blur', hide);
    }
  }

  // Toggle para click
  function toggleTooltip(e) {
    e.stopPropagation();
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }

  // Click fuera para cerrar
  function handleOutsideClick(e) {
    if (!tooltip.contains(e.target) && !triggerElement.contains(e.target)) {
      hide();
    }
  }

  // Agregar event listeners según trigger
  if (trigger === 'hover') {
    triggerElement.addEventListener('mouseenter', show);
    triggerElement.addEventListener('mouseleave', hide);

    // También mostrar en focus para accesibilidad
    triggerElement.addEventListener('focus', show);
    triggerElement.addEventListener('blur', hide);
  } else if (trigger === 'click') {
    triggerElement.addEventListener('click', toggleTooltip);
    document.addEventListener('click', handleOutsideClick);
  } else if (trigger === 'focus') {
    triggerElement.addEventListener('focus', show);
    triggerElement.addEventListener('blur', hide);
  }

  // API pública
  return {
    show,
    hide,
    destroy,
    update: updatePosition
  };
}

/**
 * Inicializa tooltips para todos los elementos con data-tooltip
 *
 * Uso en HTML:
 * <button data-tooltip="Texto del tooltip" data-tooltip-placement="top">
 *   <i class="fas fa-question-circle"></i>
 * </button>
 *
 * @param {string} selector - Selector CSS (default: '[data-tooltip]')
 * @returns {Array} Array de APIs de tooltips creados
 */
export function initTooltips(selector = '[data-tooltip]') {
  const elements = document.querySelectorAll(selector);
  const tooltips = [];

  elements.forEach(element => {
    // Prevenir duplicados - skip si ya está inicializado
    if (element.hasAttribute('data-tooltip-initialized')) {
      return;
    }

    const content = element.getAttribute('data-tooltip');
    const placement = element.getAttribute('data-tooltip-placement') || 'top';
    const trigger = element.getAttribute('data-tooltip-trigger') || 'hover';

    if (content) {
      const tooltip = createTooltip(element, {
        content,
        placement,
        trigger
      });

      // Marcar como inicializado
      element.setAttribute('data-tooltip-initialized', 'true');

      tooltips.push(tooltip);
    }
  });

  if (tooltips.length > 0) {
    console.log(`[Tooltips] Initialized ${tooltips.length} tooltips`);
  }
  return tooltips;
}

/**
 * Agrega un icono de ayuda con tooltip a un label
 *
 * @param {HTMLElement} labelElement - Elemento label
 * @param {string} helpText - Texto de ayuda
 * @returns {HTMLElement} Botón de ayuda creado
 */
export function addHelpIconToLabel(labelElement, helpText) {
  const helpButton = document.createElement('button');
  helpButton.type = 'button';
  helpButton.className = 'wizard-help-button';
  helpButton.setAttribute('aria-label', 'Ayuda');
  helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';

  // Envolver label text en span si no está ya envuelto
  if (!labelElement.querySelector('.form-label-text')) {
    const labelText = labelElement.textContent;
    labelElement.textContent = '';
    const span = document.createElement('span');
    span.className = 'form-label-text';
    span.textContent = labelText;
    labelElement.appendChild(span);
  }

  // Agregar wrapper para flex layout
  if (!labelElement.classList.contains('form-label-with-help')) {
    labelElement.classList.add('form-label-with-help');
  }

  labelElement.appendChild(helpButton);

  // Crear tooltip
  createTooltip(helpButton, {
    content: helpText,
    placement: 'right',
    trigger: 'hover'
  });

  return helpButton;
}
