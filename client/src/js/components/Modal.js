/**
 * Modal Component
 * Sprint 6 - Component Library
 *
 * Modal reutilizable con:
 * - Multiple sizes (small, medium, large, xl, fullscreen)
 * - Confirmación antes de cerrar (si hay cambios)
 * - Backdrop click to close (opcional)
 * - ESC key to close (opcional)
 * - Accessibility (ARIA labels, focus trap)
 * - Animations
 *
 * Inspirado en: WCAG 2.1 AA, Nielsen Norman Group modal research
 */

class Modal {
    constructor(options = {}) {
        this.options = {
            id: options.id || `modal-${Date.now()}`,
            title: options.title || '',
            content: options.content || '',
            size: options.size || 'medium', // small, medium, large, xl, fullscreen
            closeOnBackdrop: options.closeOnBackdrop !== false,
            closeOnEsc: options.closeOnEsc !== false,
            showCloseButton: options.showCloseButton !== false,
            buttons: options.buttons || [],
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            onConfirmClose: options.onConfirmClose || null, // Ask before closing if dirty
            ...options
        };

        this.isOpen = false;
        this.isDirty = false; // Track if modal has unsaved changes
        this.element = null;
        this.previousFocus = null;

        this.create();
    }

    /**
     * Create modal element
     */
    create() {
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'modal-backdrop';
        this.backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(45,50,56,0.6);z-index:9998;display:none;';
        document.body.appendChild(this.backdrop);

        // Create modal
        this.element = document.createElement('div');
        this.element.id = this.options.id;
        this.element.className = `modal modal--${this.options.size}`;
        this.element.setAttribute('role', 'dialog');
        this.element.setAttribute('aria-modal', 'true');
        this.element.setAttribute('aria-labelledby', `${this.options.id}-title`);
        this.element.style.display = 'none';

        // Use existing dashboard modal structure from _dashboard-buttons.scss
        this.element.innerHTML = `
            <div class="modal__header">
                <h2 class="modal__title" id="${this.options.id}-title">${this.options.title}</h2>
                ${this.options.showCloseButton ? `
                    <button class="modal__close" aria-label="Cerrar modal">
                        <i data-lucide="x"></i>
                    </button>
                ` : ''}
            </div>
            <div class="modal__body">
                ${this.options.content}
            </div>
            ${this.options.buttons.length > 0 ? `
                <div class="modal__footer">
                    ${this.options.buttons.map(btn => this.renderButton(btn)).join('')}
                </div>
            ` : ''}
        `;

        document.body.appendChild(this.element);
        this.attachEventListeners();
        this.refreshLucide();
    }

    /**
     * Render button
     */
    renderButton(btn) {
        return `
            <button
                class="btn ${btn.className || 'btn--outline'}"
                data-action="${btn.action}"
                ${btn.disabled ? 'disabled' : ''}>
                ${btn.icon ? `<i data-lucide="${btn.icon}"></i>` : ''}
                ${btn.label}
            </button>
        `;
    }

    /**
     * Open modal
     */
    open() {
        if (this.isOpen) return;

        // Save current focus
        this.previousFocus = document.activeElement;

        // Show backdrop and modal using existing dashboard classes
        this.backdrop.style.display = 'block';
        this.element.style.display = 'block';
        setTimeout(() => {
            this.element.classList.add('open');  // Use existing .open class from dashboard-buttons.scss
        }, 10);

        // Focus first focusable element
        const firstFocusable = this.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        this.isOpen = true;

        if (this.options.onOpen) {
            this.options.onOpen(this);
        }
    }

    /**
     * Close modal
     */
    async close(force = false) {
        if (!this.isOpen) return;

        // Confirm close if dirty
        if (!force && this.isDirty && this.options.onConfirmClose) {
            const shouldClose = await this.options.onConfirmClose(this);
            if (!shouldClose) return;
        }

        // Animate out
        this.element.classList.remove('open');  // Use existing .open class

        setTimeout(() => {
            this.element.style.display = 'none';
            this.backdrop.style.display = 'none';

            // Restore body scroll
            document.body.style.overflow = '';

            // Restore focus
            if (this.previousFocus) {
                this.previousFocus.focus();
            }

            this.isOpen = false;

            if (this.options.onClose) {
                this.options.onClose(this);
            }
        }, 300); // Match CSS transition duration
    }

    /**
     * Update modal content
     */
    setContent(content) {
        const body = this.element.querySelector('.modal__body');
        if (body) {
            body.innerHTML = content;
            this.refreshLucide();
        }
    }

    /**
     * Update modal title
     */
    setTitle(title) {
        const titleEl = this.element.querySelector('.modal__title');
        if (titleEl) {
            titleEl.textContent = title;
        }
    }

    /**
     * Mark modal as dirty (has unsaved changes)
     */
    setDirty(isDirty) {
        this.isDirty = isDirty;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Close button
        if (this.options.showCloseButton) {
            const closeBtn = this.element.querySelector('.modal__close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        }

        // Backdrop click
        if (this.options.closeOnBackdrop) {
            const backdrop = this.element.querySelector('.modal__backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => this.close());
            }
        }

        // ESC key
        if (this.options.closeOnEsc) {
            this.escHandler = (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            };
            document.addEventListener('keydown', this.escHandler);
        }

        // Footer buttons
        this.element.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (btn) {
                const action = btn.dataset.action;
                const button = this.options.buttons.find(b => b.action === action);
                if (button && button.handler) {
                    button.handler(this);
                }
            }
        });

        // Focus trap
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.trapFocus(e);
            }
        });
    }

    /**
     * Trap focus within modal (accessibility)
     */
    trapFocus(e) {
        const focusableElements = this.element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    /**
     * Refresh Lucide icons
     */
    refreshLucide() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Destroy modal
     */
    destroy() {
        if (this.isOpen) {
            this.close(true);
        }

        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
        }

        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        this.element = null;
    }
}

/**
 * Utility: Create confirmation modal
 */
Modal.confirm = function(options) {
    return new Promise((resolve) => {
        const modal = new Modal({
            title: options.title || 'Confirmar',
            content: options.message || '¿Está seguro?',
            size: 'small',
            buttons: [
                {
                    label: options.cancelLabel || 'Cancelar',
                    className: 'btn--outline',
                    action: 'cancel',
                    handler: (m) => {
                        m.close();
                        resolve(false);
                    }
                },
                {
                    label: options.confirmLabel || 'Confirmar',
                    className: options.danger ? 'btn--danger' : 'btn--primary',
                    action: 'confirm',
                    handler: (m) => {
                        m.close();
                        resolve(true);
                    }
                }
            ],
            onClose: () => {
                modal.destroy();
            }
        });

        modal.open();
    });
};

/**
 * Utility: Create alert modal
 */
Modal.alert = function(options) {
    return new Promise((resolve) => {
        const modal = new Modal({
            title: options.title || 'Aviso',
            content: options.message || '',
            size: 'small',
            buttons: [
                {
                    label: options.buttonLabel || 'Aceptar',
                    className: 'btn--primary',
                    action: 'ok',
                    handler: (m) => {
                        m.close();
                        resolve();
                    }
                }
            ],
            onClose: () => {
                modal.destroy();
            }
        });

        modal.open();
    });
};

export default Modal;
