/**
 * wizardModal.js - Beautiful modal system using Floating-UI
 *
 * Sistema de modales profesionales para reemplazar alerts/confirms nativos
 * Sigue el design system de Genesys (sin gradientes, colores sólidos)
 *
 * @module utils/wizardModal
 */

/**
 * Crea un modal hermoso para preguntar si continuar sesión guardada
 *
 * @param {string} currentStep - Nombre del paso actual guardado
 * @param {Function} onContinue - Callback al continuar
 * @param {Function} onNew - Callback al empezar de nuevo
 * @returns {HTMLElement} Modal element
 */
export function createResumeModal(currentStep, onContinue, onNew) {
  const modal = document.createElement('div');
  modal.className = 'wizard-resume-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');

  // Traducir paso técnico a nombre amigable
  const stepNames = {
    'info-basica': 'Información Básica',
    'cargos': 'Cargos',
    'riesgos': 'Riesgos por Cargo',
    'niveles': 'Niveles de Riesgo',
    'controles': 'Controles de Seguridad',
    'resumen': 'Resumen'
  };

  const friendlyStepName = stepNames[currentStep] || currentStep;

  modal.innerHTML = `
    <div class="modal-overlay" aria-hidden="true"></div>
    <div class="modal-content">
      <div class="modal-icon">
        <i class="fas fa-save"></i>
      </div>
      <h3 class="modal-title" id="modal-title">Sesión guardada encontrada</h3>
      <p class="modal-message">
        Tienes un progreso guardado en el paso
        <strong>"${friendlyStepName}"</strong>
      </p>
      <p class="modal-subtitle">
        ¿Deseas continuar donde lo dejaste o empezar de nuevo?
      </p>
      <div class="modal-actions">
        <button class="btn-continue cta-button" type="button">
          <i class="fas fa-play"></i>
          <span>Continuar</span>
        </button>
        <button class="btn-new cta-button-1" type="button">
          <i class="fas fa-refresh"></i>
          <span>Empezar de Nuevo</span>
        </button>
      </div>
    </div>
  `;

  // Event listeners
  const btnContinue = modal.querySelector('.btn-continue');
  const btnNew = modal.querySelector('.btn-new');
  const overlay = modal.querySelector('.modal-overlay');

  const closeModal = () => {
    modal.classList.add('modal-closing');
    setTimeout(() => {
      modal.remove();
      // Re-enable body scroll
      document.body.style.overflow = '';
    }, 300);
  };

  btnContinue.addEventListener('click', () => {
    closeModal();
    onContinue();
  });

  btnNew.addEventListener('click', () => {
    closeModal();
    onNew();
  });

  overlay.addEventListener('click', closeModal);

  // Keyboard navigation
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
    if (e.key === 'Tab') {
      // Trap focus within modal
      const focusableElements = modal.querySelectorAll('button');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';

  // Animar entrada
  document.body.appendChild(modal);
  requestAnimationFrame(() => {
    modal.classList.add('modal-visible');
    // Focus first button for accessibility
    btnContinue.focus();
  });

  return modal;
}

/**
 * Crea una confirmación elegante (reemplaza confirm())
 *
 * @param {Object} options - Opciones del modal
 * @param {string} options.title - Título del modal
 * @param {string} options.message - Mensaje principal
 * @param {string} options.confirmText - Texto del botón confirmar (default: "Confirmar")
 * @param {string} options.cancelText - Texto del botón cancelar (default: "Cancelar")
 * @param {string} options.type - Tipo: 'info'|'success'|'warning'|'danger' (default: 'info')
 * @param {Function} options.onConfirm - Callback al confirmar
 * @param {Function} options.onCancel - Callback al cancelar (opcional)
 * @returns {HTMLElement} Modal element
 */
export function createConfirmModal({
  title = '¿Estás seguro?',
  message = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  onConfirm = () => {},
  onCancel = () => {}
}) {
  const modal = document.createElement('div');
  modal.className = 'wizard-confirm-modal';
  modal.setAttribute('role', 'alertdialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'confirm-modal-title');

  // Icons por tipo
  const iconMap = {
    info: 'fa-info-circle',
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    danger: 'fa-exclamation-circle'
  };

  const icon = iconMap[type] || iconMap.info;

  modal.innerHTML = `
    <div class="modal-overlay" aria-hidden="true"></div>
    <div class="modal-content modal-content--${type}">
      <div class="modal-icon modal-icon--${type}">
        <i class="fas ${icon}"></i>
      </div>
      <h3 class="modal-title" id="confirm-modal-title">${title}</h3>
      ${message ? `<p class="modal-message">${message}</p>` : ''}
      <div class="modal-actions">
        <button class="btn-cancel cta-button-1" type="button">
          <span>${cancelText}</span>
        </button>
        <button class="btn-confirm cta-button btn-confirm--${type}" type="button">
          <span>${confirmText}</span>
        </button>
      </div>
    </div>
  `;

  const btnConfirm = modal.querySelector('.btn-confirm');
  const btnCancel = modal.querySelector('.btn-cancel');
  const overlay = modal.querySelector('.modal-overlay');

  const closeModal = (confirmed = false) => {
    modal.classList.add('modal-closing');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);

    if (confirmed) {
      onConfirm();
    } else {
      onCancel();
    }
  };

  btnConfirm.addEventListener('click', () => closeModal(true));
  btnCancel.addEventListener('click', () => closeModal(false));
  overlay.addEventListener('click', () => closeModal(false));

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(false);
    }
  });

  document.body.style.overflow = 'hidden';
  document.body.appendChild(modal);
  requestAnimationFrame(() => {
    modal.classList.add('modal-visible');
    btnConfirm.focus();
  });

  return modal;
}

/**
 * Muestra un toast/notification temporal
 *
 * @param {Object} options - Opciones del toast
 * @param {string} options.message - Mensaje a mostrar
 * @param {string} options.type - Tipo: 'info'|'success'|'warning'|'danger'
 * @param {number} options.duration - Duración en ms (default: 3000)
 * @returns {HTMLElement} Toast element
 */
export function showToast({
  message = '',
  type = 'info',
  duration = 3000
}) {
  const toast = document.createElement('div');
  toast.className = `wizard-toast wizard-toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const iconMap = {
    info: 'fa-info-circle',
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    danger: 'fa-times-circle'
  };

  const icon = iconMap[type] || iconMap.info;

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${icon}"></i>
    </div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" type="button" aria-label="Cerrar notificación">
      <i class="fas fa-times"></i>
    </button>
  `;

  const closeToast = () => {
    toast.classList.add('toast-closing');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', closeToast);

  // Check if toast container exists, if not create it
  let container = document.querySelector('.wizard-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'wizard-toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  // Auto-close after duration
  if (duration > 0) {
    setTimeout(closeToast, duration);
  }

  return toast;
}
