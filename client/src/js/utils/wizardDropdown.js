/**
 * wizardDropdown.js - Dropdown mejorado con Floating-UI y búsqueda
 *
 * Dropdown inteligente para sectores económicos y otros selects
 * Reemplaza <select> con mejor UX y búsqueda integrada
 *
 * @module utils/wizardDropdown
 */

import { computePosition, flip, shift, size } from '@floating-ui/dom';

/**
 * Crea un dropdown mejorado desde un select existente
 *
 * @param {HTMLSelectElement} selectElement - Select nativo a reemplazar
 * @param {Object} options - Opciones del dropdown
 * @param {boolean} options.searchable - Habilitar búsqueda (default: true)
 * @param {string} options.placeholder - Placeholder (default: select placeholder o "Seleccionar...")
 * @param {Function} options.onChange - Callback al cambiar valor
 * @returns {Object} API del dropdown
 */
export function createDropdown(selectElement, {
  searchable = true,
  placeholder = selectElement.getAttribute('placeholder') || 'Seleccionar...',
  onChange = () => {}
} = {}) {
  // Extraer opciones del select
  const options = Array.from(selectElement.options)
    .filter(opt => opt.value !== '') // Filtrar option vacío
    .map(opt => ({
      value: opt.value,
      label: opt.textContent,
      selected: opt.selected
    }));

  // Crear estructura del dropdown
  const wrapper = document.createElement('div');
  wrapper.className = 'wizard-dropdown';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'wizard-dropdown-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const selectedOption = options.find(opt => opt.selected);
  const triggerText = document.createElement('span');
  triggerText.textContent = selectedOption ? selectedOption.label : placeholder;

  const chevron = document.createElement('i');
  chevron.className = 'fas fa-chevron-down chevron';

  trigger.appendChild(triggerText);
  trigger.appendChild(chevron);

  const panel = document.createElement('div');
  panel.className = 'wizard-dropdown-panel';
  panel.setAttribute('role', 'listbox');
  panel.style.position = 'absolute';
  panel.style.top = '0';
  panel.style.left = '0';

  // Search input (si searchable)
  let searchInput = null;
  if (searchable) {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'wizard-dropdown-search';

    searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar...';
    searchInput.setAttribute('aria-label', 'Buscar opciones');

    searchContainer.appendChild(searchInput);
    panel.appendChild(searchContainer);
  }

  // Options list
  const optionsList = document.createElement('ul');
  optionsList.className = 'wizard-dropdown-options';

  const renderOptions = (filteredOptions = options) => {
    optionsList.innerHTML = '';

    if (filteredOptions.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'wizard-dropdown-empty';
      emptyState.textContent = 'No se encontraron resultados';
      optionsList.appendChild(emptyState);
      return;
    }

    filteredOptions.forEach(opt => {
      const li = document.createElement('li');
      li.className = 'wizard-dropdown-option';
      li.setAttribute('role', 'option');
      li.setAttribute('data-value', opt.value);
      li.textContent = opt.label;
      li.tabIndex = 0;

      if (opt.selected) {
        li.setAttribute('aria-selected', 'true');
      }

      // Click handler
      li.addEventListener('click', () => {
        selectOption(opt);
      });

      // Keyboard handler
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectOption(opt);
        }
      });

      optionsList.appendChild(li);
    });
  };

  renderOptions();
  panel.appendChild(optionsList);

  wrapper.appendChild(trigger);
  document.body.appendChild(panel); // Panel en body para mejor positioning

  // Reemplazar select con dropdown
  selectElement.style.display = 'none';
  selectElement.parentElement.insertBefore(wrapper, selectElement);

  let isOpen = false;
  let currentValue = selectedOption ? selectedOption.value : '';

  // Guardar referencia al dropdown API en el select para acceso externo
  // Se define la API más abajo y se asigna aquí después

  // Update position
  async function updatePosition() {
    const { x, y } = await computePosition(trigger, panel, {
      placement: 'bottom-start',
      middleware: [
        flip(),
        shift({ padding: 8 }),
        size({
          apply({ availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              maxHeight: `${Math.min(availableHeight - 16, 300)}px`
            });
          }
        })
      ]
    });

    Object.assign(panel.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${trigger.offsetWidth}px`
    });
  }

  // Open dropdown
  async function open() {
    if (isOpen) return;

    await updatePosition();
    panel.setAttribute('data-show', '');
    trigger.setAttribute('aria-expanded', 'true');
    isOpen = true;

    if (searchInput) {
      // Focus search después de abrir
      setTimeout(() => searchInput.focus(), 50);
    }
  }

  // Close dropdown
  function close() {
    if (!isOpen) return;

    panel.removeAttribute('data-show');
    trigger.setAttribute('aria-expanded', 'false');
    isOpen = false;

    // Limpiar búsqueda
    if (searchInput) {
      searchInput.value = '';
      renderOptions();
    }
  }

  // Select option
  function selectOption(option) {
    currentValue = option.value;
    triggerText.textContent = option.label;

    // Update select nativo (para formularios)
    selectElement.value = option.value;

    // Trigger both change AND input events for compatibility
    const changeEvent = new Event('change', { bubbles: true });
    const inputEvent = new Event('input', { bubbles: true });
    selectElement.dispatchEvent(inputEvent); // Fire input first
    selectElement.dispatchEvent(changeEvent);

    // Update aria-selected
    optionsList.querySelectorAll('[aria-selected]').forEach(el => {
      el.removeAttribute('aria-selected');
    });

    const selectedLi = optionsList.querySelector(`[data-value="${option.value}"]`);
    if (selectedLi) {
      selectedLi.setAttribute('aria-selected', 'true');
    }

    // Callback
    onChange(option.value, option.label);

    close();
  }

  // Toggle
  trigger.addEventListener('click', () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  // Search handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      if (!query) {
        renderOptions();
        return;
      }

      const filtered = options.filter(opt =>
        opt.label.toLowerCase().includes(query)
      );

      renderOptions(filtered);
    });

    // Prevenir que Enter en search cierre el dropdown
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Si hay solo una opción, seleccionarla
        const visibleOptions = optionsList.querySelectorAll('.wizard-dropdown-option');
        if (visibleOptions.length === 1) {
          visibleOptions[0].click();
        }
      }
    });
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target) && !panel.contains(e.target)) {
      close();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      close();
      trigger.focus();
    }
  });

  // Método para actualizar opciones dinámicamente (para lazy loading)
  function refresh() {
    // Re-extraer opciones del select nativo
    const newOptions = Array.from(selectElement.options)
      .filter(opt => opt.value !== '')
      .map(opt => ({
        value: opt.value,
        label: opt.textContent,
        selected: opt.selected
      }));

    // Actualizar array de opciones
    options.length = 0;
    options.push(...newOptions);

    // Re-renderizar el panel
    renderOptions();

    // Actualizar el texto del trigger si hay selección
    const selectedOption = newOptions.find(opt => opt.selected);
    if (selectedOption) {
      triggerText.textContent = selectedOption.label;
      currentValue = selectedOption.value;
    } else {
      triggerText.textContent = placeholder;
      currentValue = '';
    }

    console.log(`[Dropdown] Refreshed with ${newOptions.length} options`);
  }

  // API pública
  const api = {
    open,
    close,
    getValue: () => currentValue,
    setValue: (value) => {
      const option = options.find(opt => opt.value === value);
      if (option) {
        selectOption(option);
      }
    },
    refresh, // 🆕 Método para actualizar opciones dinámicamente
    destroy: () => {
      panel.remove();
      wrapper.remove();
      selectElement.style.display = '';
      delete selectElement._dropdownApi;
    }
  };

  // Guardar referencia en el select para acceso externo
  selectElement._dropdownApi = api;

  return api;
}

/**
 * Inicializa dropdowns para todos los selects con clase específica
 *
 * @param {string} selector - Selector CSS (default: '.wizard-enhanced-select')
 * @returns {Array} Array de APIs de dropdowns creados
 */
export function initDropdowns(selector = '.wizard-enhanced-select') {
  const selects = document.querySelectorAll(selector);
  const dropdowns = [];

  selects.forEach(select => {
    // Prevenir duplicados - skip si ya está inicializado
    if (select.hasAttribute('data-dropdown-initialized')) {
      return;
    }

    const dropdown = createDropdown(select, {
      searchable: select.hasAttribute('data-searchable') !== false
    });

    // Marcar como inicializado
    select.setAttribute('data-dropdown-initialized', 'true');

    dropdowns.push(dropdown);
  });

  if (dropdowns.length > 0) {
    console.log(`[Dropdowns] Initialized ${dropdowns.length} enhanced dropdowns`);
  }
  return dropdowns;
}
