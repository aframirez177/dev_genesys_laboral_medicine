/**
 * floatingUI.js - Utility wrapper for Floating UI
 *
 * Provides easy-to-use functions for tooltips, popovers, and dropdowns
 * using @floating-ui/dom library
 *
 * @module floatingUI
 * @requires @floating-ui/dom
 */

import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
  autoUpdate,
  autoPlacement,
  hide,
  size
} from '@floating-ui/dom';

/**
 * Creates a tooltip with intelligent positioning
 *
 * @param {HTMLElement} reference - The element to attach tooltip to
 * @param {string|HTMLElement} content - Tooltip content (HTML string or element)
 * @param {Object} options - Configuration options
 * @param {string} options.placement - Preferred placement ('top', 'bottom', 'left', 'right')
 * @param {number} options.offset - Distance from reference element (default: 8)
 * @param {boolean} options.arrow - Show arrow pointer (default: true)
 * @param {string} options.trigger - 'hover', 'click', or 'manual' (default: 'hover')
 * @param {number} options.delay - Delay in ms before showing (default: 200)
 * @returns {Object} - Tooltip instance with show/hide/destroy methods
 */
export function createTooltip(reference, content, options = {}) {
  const {
    placement = 'top',
    offset: offsetValue = 8,
    arrow: showArrow = true,
    trigger = 'hover',
    delay = 200
  } = options;

  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'floating-tooltip';
  tooltip.setAttribute('role', 'tooltip');

  if (typeof content === 'string') {
    tooltip.innerHTML = content;
  } else {
    tooltip.appendChild(content);
  }

  // Create arrow if needed
  let arrowElement = null;
  if (showArrow) {
    arrowElement = document.createElement('div');
    arrowElement.className = 'floating-tooltip__arrow';
    tooltip.appendChild(arrowElement);
  }

  // State
  let isVisible = false;
  let timeoutId = null;
  let cleanup = null;

  // Position update function
  async function updatePosition() {
    if (!isVisible) return;

    const middleware = [
      offset(offsetValue),
      flip(),
      shift({ padding: 5 })
    ];

    if (showArrow && arrowElement) {
      middleware.push(arrow({ element: arrowElement }));
    }

    const { x, y, placement: finalPlacement, middlewareData } = await computePosition(
      reference,
      tooltip,
      {
        placement,
        middleware
      }
    );

    // Apply position
    Object.assign(tooltip.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    // Position arrow
    if (middlewareData.arrow && arrowElement) {
      const { x: arrowX, y: arrowY } = middlewareData.arrow;

      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[finalPlacement.split('-')[0]];

      Object.assign(arrowElement.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: '',
        [staticSide]: '-4px',
      });
    }

    // Update data-placement for styling
    tooltip.setAttribute('data-placement', finalPlacement);
  }

  // Show tooltip
  function show() {
    if (isVisible) return;

    isVisible = true;
    document.body.appendChild(tooltip);

    // Auto-update position when scrolling/resizing
    cleanup = autoUpdate(reference, tooltip, updatePosition);

    updatePosition();

    // Trigger animation
    requestAnimationFrame(() => {
      tooltip.classList.add('floating-tooltip--visible');
    });
  }

  // Hide tooltip
  function hide() {
    if (!isVisible) return;

    isVisible = false;
    tooltip.classList.remove('floating-tooltip--visible');

    // Cleanup auto-update
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    // Remove from DOM after animation
    setTimeout(() => {
      if (!isVisible && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 200);
  }

  // Delayed show
  function delayedShow() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(show, delay);
  }

  // Cancel delayed show
  function cancelShow() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  // Destroy tooltip
  function destroy() {
    hide();
    if (trigger === 'hover') {
      reference.removeEventListener('mouseenter', delayedShow);
      reference.removeEventListener('mouseleave', hide);
      reference.removeEventListener('focus', delayedShow);
      reference.removeEventListener('blur', hide);
    } else if (trigger === 'click') {
      reference.removeEventListener('click', toggle);
    }
  }

  // Toggle visibility
  function toggle() {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }

  // Attach event listeners based on trigger
  if (trigger === 'hover') {
    reference.addEventListener('mouseenter', delayedShow);
    reference.addEventListener('mouseleave', () => {
      cancelShow();
      hide();
    });
    reference.addEventListener('focus', delayedShow);
    reference.addEventListener('blur', () => {
      cancelShow();
      hide();
    });
  } else if (trigger === 'click') {
    reference.addEventListener('click', toggle);
  }

  return {
    show,
    hide,
    destroy,
    toggle,
    element: tooltip
  };
}

/**
 * Creates a popover with more complex content
 * Similar to tooltip but designed for interactive content
 *
 * @param {HTMLElement} reference - The element to attach popover to
 * @param {string|HTMLElement} content - Popover content
 * @param {Object} options - Configuration options
 * @returns {Object} - Popover instance
 */
export function createPopover(reference, content, options = {}) {
  const {
    placement = 'bottom',
    offset: offsetValue = 8,
    closeOnClickOutside = true,
    closeOnEscape = true
  } = options;

  const popover = document.createElement('div');
  popover.className = 'floating-popover';
  popover.setAttribute('role', 'dialog');

  if (typeof content === 'string') {
    popover.innerHTML = content;
  } else {
    popover.appendChild(content);
  }

  let isVisible = false;
  let cleanup = null;

  async function updatePosition() {
    if (!isVisible) return;

    const { x, y, placement: finalPlacement } = await computePosition(
      reference,
      popover,
      {
        placement,
        middleware: [
          offset(offsetValue),
          flip(),
          shift({ padding: 10 }),
          size({
            apply({ availableWidth, availableHeight, elements }) {
              Object.assign(elements.floating.style, {
                maxWidth: `${availableWidth}px`,
                maxHeight: `${availableHeight}px`,
              });
            },
          })
        ]
      }
    );

    Object.assign(popover.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    popover.setAttribute('data-placement', finalPlacement);
  }

  function show() {
    if (isVisible) return;

    isVisible = true;
    document.body.appendChild(popover);
    cleanup = autoUpdate(reference, popover, updatePosition);
    updatePosition();

    requestAnimationFrame(() => {
      popover.classList.add('floating-popover--visible');
    });

    // Add event listeners
    if (closeOnClickOutside) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }

    if (closeOnEscape) {
      document.addEventListener('keydown', handleEscape);
    }
  }

  function hide() {
    if (!isVisible) return;

    isVisible = false;
    popover.classList.remove('floating-popover--visible');

    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);

    setTimeout(() => {
      if (!isVisible && popover.parentNode) {
        popover.parentNode.removeChild(popover);
      }
    }, 200);
  }

  function handleClickOutside(event) {
    if (!popover.contains(event.target) && !reference.contains(event.target)) {
      hide();
    }
  }

  function handleEscape(event) {
    if (event.key === 'Escape') {
      hide();
    }
  }

  function destroy() {
    // Cleanup autoUpdate immediately
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    // Remove event listeners
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);

    // Force remove from DOM
    if (popover.parentNode) {
      popover.parentNode.removeChild(popover);
    }

    isVisible = false;
  }

  return {
    show,
    hide,
    destroy,
    toggle: () => (isVisible ? hide() : show()),
    element: popover
  };
}

/**
 * Batch creates tooltips for multiple elements
 * Useful for adding tooltips to a list of items
 *
 * @param {NodeList|Array<HTMLElement>} elements - Elements to add tooltips to
 * @param {Function} contentFn - Function that returns content for each element
 * @param {Object} options - Tooltip options
 * @returns {Array} - Array of tooltip instances
 */
export function batchTooltips(elements, contentFn, options = {}) {
  return Array.from(elements).map((element, index) => {
    const content = contentFn(element, index);
    return createTooltip(element, content, options);
  });
}

/**
 * Default export with all utilities
 */
export default {
  createTooltip,
  createPopover,
  batchTooltips
};
