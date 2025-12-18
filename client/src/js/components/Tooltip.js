/**
 * Tooltip Component with Floating UI
 * Sprint 7 - Dashboard Enhancement
 *
 * Modern tooltip system using @floating-ui/dom for smart positioning
 * Dark theme palette with smooth animations
 *
 * Usage:
 * import { Tooltip } from './components/Tooltip.js';
 *
 * // Initialize on page load
 * Tooltip.init();
 *
 * // HTML attributes:
 * <button data-tooltip="Tooltip text">Hover me</button>
 * <button data-tooltip="Tooltip text" data-tooltip-placement="top">Top placement</button>
 *
 * // Programmatic:
 * Tooltip.show(element, 'Tooltip content', { placement: 'top' });
 * Tooltip.hide();
 */

import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

class TooltipManager {
    constructor() {
        this.tooltip = null;
        this.arrowEl = null;
        this.currentTarget = null;
        this.showTimeout = null;
        this.hideTimeout = null;
        this.cleanup = null;

        this.init();
    }

    init() {
        // Create tooltip element
        this.createTooltipElement();

        // Inject styles
        this.injectStyles();

        // Setup global event listeners for data-tooltip elements
        this.setupEventListeners();
    }

    createTooltipElement() {
        // Create tooltip container
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'floating-tooltip';
        this.tooltip.setAttribute('role', 'tooltip');
        this.tooltip.style.display = 'none';

        // Create content wrapper
        const content = document.createElement('div');
        content.className = 'floating-tooltip__content';
        this.tooltip.appendChild(content);

        // Create arrow
        this.arrowEl = document.createElement('div');
        this.arrowEl.className = 'floating-tooltip__arrow';
        this.tooltip.appendChild(this.arrowEl);

        document.body.appendChild(this.tooltip);
    }

    injectStyles() {
        if (document.getElementById('floating-tooltip-styles')) return;

        const style = document.createElement('style');
        style.id = 'floating-tooltip-styles';
        style.textContent = `
            .floating-tooltip {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 10000;
                max-width: 280px;
                pointer-events: none;
                opacity: 0;
                transform: scale(0.95);
                transition: opacity 0.15s ease, transform 0.15s ease;
            }

            .floating-tooltip--visible {
                opacity: 1;
                transform: scale(1);
            }

            .floating-tooltip__content {
                background: #1f2937;
                color: #f3f4f6;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                line-height: 1.4;
                font-family: 'Raleway', system-ui, sans-serif;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25),
                            0 2px 4px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.08);
            }

            .floating-tooltip__arrow {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #1f2937;
                transform: rotate(45deg);
            }

            /* Arrow positioning based on placement */
            .floating-tooltip[data-placement^="top"] .floating-tooltip__arrow {
                bottom: -4px;
                border-right: 1px solid rgba(255, 255, 255, 0.08);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }

            .floating-tooltip[data-placement^="bottom"] .floating-tooltip__arrow {
                top: -4px;
                border-left: 1px solid rgba(255, 255, 255, 0.08);
                border-top: 1px solid rgba(255, 255, 255, 0.08);
            }

            .floating-tooltip[data-placement^="left"] .floating-tooltip__arrow {
                right: -4px;
                border-right: 1px solid rgba(255, 255, 255, 0.08);
                border-top: 1px solid rgba(255, 255, 255, 0.08);
            }

            .floating-tooltip[data-placement^="right"] .floating-tooltip__arrow {
                left: -4px;
                border-left: 1px solid rgba(255, 255, 255, 0.08);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }

            /* Title styling */
            .floating-tooltip__title {
                font-weight: 600;
                color: #5dc4af;
                margin-bottom: 4px;
                font-size: 13px;
            }

            /* Description styling */
            .floating-tooltip__description {
                color: #d1d5db;
            }

            /* Keyboard shortcut styling */
            .floating-tooltip__shortcut {
                display: inline-block;
                background: rgba(255, 255, 255, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 11px;
                color: #9ca3af;
                margin-left: 8px;
            }

            /* High contrast mode */
            @media (prefers-contrast: high) {
                .floating-tooltip__content {
                    background: #000;
                    border: 2px solid #fff;
                }
                .floating-tooltip__arrow {
                    background: #000;
                    border-color: #fff;
                }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .floating-tooltip {
                    transition: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Use event delegation for data-tooltip elements
        // Check if e.target is an Element before calling closest (can be text node or window)
        document.addEventListener('mouseenter', (e) => {
            if (!e.target || typeof e.target.closest !== 'function') return;
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.handleMouseEnter(target);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (!e.target || typeof e.target.closest !== 'function') return;
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.handleMouseLeave(target);
            }
        }, true);

        document.addEventListener('focusin', (e) => {
            if (!e.target || typeof e.target.closest !== 'function') return;
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.handleMouseEnter(target);
            }
        }, true);

        document.addEventListener('focusout', (e) => {
            if (!e.target || typeof e.target.closest !== 'function') return;
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.handleMouseLeave(target);
            }
        }, true);

        // Hide on scroll
        document.addEventListener('scroll', () => {
            this.hide();
        }, true);
    }

    handleMouseEnter(target) {
        clearTimeout(this.hideTimeout);

        // Delay showing to avoid flickering
        this.showTimeout = setTimeout(() => {
            const content = target.getAttribute('data-tooltip');
            const placement = target.getAttribute('data-tooltip-placement') || 'top';
            const title = target.getAttribute('data-tooltip-title');
            const shortcut = target.getAttribute('data-tooltip-shortcut');

            this.show(target, content, { placement, title, shortcut });
        }, 200);
    }

    handleMouseLeave(target) {
        clearTimeout(this.showTimeout);

        // Delay hiding for smoother UX
        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, 100);
    }

    /**
     * Show tooltip on a target element
     * @param {HTMLElement} target - Element to attach tooltip to
     * @param {string} content - Tooltip content
     * @param {Object} options - Options { placement, title, shortcut }
     */
    async show(target, content, options = {}) {
        const { placement = 'top', title, shortcut } = options;

        this.currentTarget = target;

        // Build content HTML
        let html = '';
        if (title) {
            html += `<div class="floating-tooltip__title">${title}</div>`;
        }
        html += `<span class="floating-tooltip__description">${content}</span>`;
        if (shortcut) {
            html += `<span class="floating-tooltip__shortcut">${shortcut}</span>`;
        }

        this.tooltip.querySelector('.floating-tooltip__content').innerHTML = html;
        this.tooltip.style.display = 'block';

        // Calculate position using Floating UI
        const { x, y, placement: finalPlacement, middlewareData } = await computePosition(
            target,
            this.tooltip,
            {
                placement,
                middleware: [
                    offset(8),
                    flip({ fallbackAxisSideDirection: 'start' }),
                    shift({ padding: 8 }),
                    arrow({ element: this.arrowEl })
                ]
            }
        );

        // Apply position
        Object.assign(this.tooltip.style, {
            left: `${x}px`,
            top: `${y}px`
        });

        // Set placement attribute for arrow styling
        this.tooltip.setAttribute('data-placement', finalPlacement);

        // Position arrow
        if (middlewareData.arrow) {
            const { x: arrowX, y: arrowY } = middlewareData.arrow;
            Object.assign(this.arrowEl.style, {
                left: arrowX != null ? `${arrowX}px` : '',
                top: arrowY != null ? `${arrowY}px` : ''
            });
        }

        // Trigger animation
        requestAnimationFrame(() => {
            this.tooltip.classList.add('floating-tooltip--visible');
        });
    }

    /**
     * Hide tooltip
     */
    hide() {
        this.tooltip.classList.remove('floating-tooltip--visible');

        // Wait for animation to complete before hiding
        setTimeout(() => {
            if (!this.tooltip.classList.contains('floating-tooltip--visible')) {
                this.tooltip.style.display = 'none';
            }
        }, 150);

        this.currentTarget = null;
    }

    /**
     * Destroy tooltip manager
     */
    destroy() {
        clearTimeout(this.showTimeout);
        clearTimeout(this.hideTimeout);

        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }

        const styles = document.getElementById('floating-tooltip-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Singleton instance
let tooltipInstance = null;

export const Tooltip = {
    /**
     * Initialize tooltip system
     */
    init() {
        if (!tooltipInstance) {
            tooltipInstance = new TooltipManager();
        }
        return tooltipInstance;
    },

    /**
     * Show tooltip programmatically
     */
    show(target, content, options = {}) {
        if (!tooltipInstance) {
            this.init();
        }
        tooltipInstance.show(target, content, options);
    },

    /**
     * Hide tooltip
     */
    hide() {
        if (tooltipInstance) {
            tooltipInstance.hide();
        }
    },

    /**
     * Destroy tooltip system
     */
    destroy() {
        if (tooltipInstance) {
            tooltipInstance.destroy();
            tooltipInstance = null;
        }
    }
};

export default Tooltip;
