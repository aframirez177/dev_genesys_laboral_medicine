/**
 * KeyboardTooltip.js - Floating UI Tooltips para Keyboard Shortcuts
 * H1 - UX Audit: Reemplaza keyboard hint badges por tooltips on-hover
 *
 * Características:
 * - Tooltips solo aparecen en hover/focus (NO permanentes)
 * - Posicionamiento inteligente con Floating UI (flip, shift, offset)
 * - Smooth fade in/out animations
 * - Responsive: ocultos en móvil (touch devices)
 * - Arrow apuntando al botón
 *
 * Uso:
 * - Agregar data-keyboard-shortcut="Enter" al botón
 * - Llamar initKeyboardTooltips() después de renderizar botones
 */

import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

/**
 * Tooltip manager para un botón individual
 */
export class KeyboardShortcutTooltip {
  constructor(button) {
    this.button = button;
    this.tooltip = null;
    this.arrowElement = null;
    this.isShowing = false;

    // Solo inicializar en desktop (no en touch devices)
    if (window.innerWidth > 768 && !('ontouchstart' in window)) {
      this.init();
    }
  }

  init() {
    // Event listeners
    this.button.addEventListener('mouseenter', () => this.show());
    this.button.addEventListener('mouseleave', () => this.hide());
    this.button.addEventListener('focus', () => this.show());
    this.button.addEventListener('blur', () => this.hide());
  }

  async show() {
    const shortcut = this.button.dataset.keyboardShortcut;
    if (!shortcut || this.isShowing) return;

    this.isShowing = true;

    // Create tooltip element
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'floating-tooltip floating-tooltip--keyboard';
    this.tooltip.setAttribute('role', 'tooltip');
    this.tooltip.innerHTML = `
      <div class="tooltip-content">
        <i class="fas fa-keyboard"></i>
        <span>${shortcut}</span>
      </div>
      <div class="floating-tooltip__arrow"></div>
    `;

    document.body.appendChild(this.tooltip);
    this.arrowElement = this.tooltip.querySelector('.floating-tooltip__arrow');

    // Position with Floating UI
    await this.updatePosition();

    // Fade in
    requestAnimationFrame(() => {
      if (this.tooltip) {
        this.tooltip.classList.add('floating-tooltip--visible');
      }
    });
  }

  async updatePosition() {
    if (!this.tooltip || !this.button) return;

    const { x, y, placement, middlewareData } = await computePosition(
      this.button,
      this.tooltip,
      {
        placement: 'top',
        middleware: [
          offset(8),
          flip(),
          shift({ padding: 5 }),
          arrow({ element: this.arrowElement })
        ]
      }
    );

    // Apply positioning
    Object.assign(this.tooltip.style, {
      left: `${x}px`,
      top: `${y}px`
    });

    // Position arrow
    if (middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = middlewareData.arrow;
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      Object.assign(this.arrowElement.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: '',
        [staticSide]: '-4px' // Half of arrow size (8px)
      });
    }
  }

  hide() {
    if (!this.tooltip) return;

    this.isShowing = false;
    this.tooltip.classList.remove('floating-tooltip--visible');

    setTimeout(() => {
      if (this.tooltip && this.tooltip.parentNode) {
        this.tooltip.remove();
        this.tooltip = null;
        this.arrowElement = null;
      }
    }, 200); // Match CSS transition duration
  }

  destroy() {
    this.hide();
    // Event listeners se limpian automáticamente cuando se remueve el botón del DOM
  }
}

/**
 * Initialize keyboard tooltips para todos los botones con data-keyboard-shortcut
 * @returns {Array} Array de instancias KeyboardShortcutTooltip
 */
export function initKeyboardTooltips() {
  const buttons = document.querySelectorAll('[data-keyboard-shortcut]');
  const tooltips = [];

  buttons.forEach(button => {
    const tooltip = new KeyboardShortcutTooltip(button);
    tooltips.push(tooltip);
  });

  console.log(`✅ Keyboard tooltips initialized for ${buttons.length} buttons`);

  return tooltips;
}

/**
 * Destroy all tooltips (cleanup)
 * @param {Array} tooltips - Array de instancias KeyboardShortcutTooltip
 */
export function destroyKeyboardTooltips(tooltips) {
  if (!Array.isArray(tooltips)) return;

  tooltips.forEach(tooltip => tooltip.destroy());
  console.log(`🗑️  Keyboard tooltips destroyed (${tooltips.length} instances)`);
}
