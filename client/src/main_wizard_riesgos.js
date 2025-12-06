/**
 * main_wizard_riesgos.js
 * Entry point for the Wizard Riesgos page
 *
 * This wizard helps users:
 * 1. Create empresa and basic info
 * 2. Add cargos (job positions)
 * 3. Select GES (riesgos) for each cargo
 * 4. Configure risk levels (ND, NE, NC → NP, NR)
 * 5. Add controls (eliminación, sustitución, ingeniería, etc.)
 * 6. Submit to backend for async document generation
 */

// Import main common bundle (navigation, footer, etc.)
/* import './main.js'; */

// Import wizard-specific styles
import './styles/scss/wizard.scss';

// Import state management
import { getWizardState } from './state/WizardState.js';

// Import wizard components
import { WizardCore } from './components/wizard/WizardCore.js';

// Import modal utilities
import { createResumeModal } from './js/utils/wizardModal.js';

// Import sector loader
import { preloadCatalogos } from './js/utils/sectorLoader.js';

// Import Floating-UI utilities (Fase 3)
import { initTooltips } from './js/utils/wizardTooltip.js';
import { initDropdowns } from './js/utils/wizardDropdown.js';

// import { StepManager } from './components/wizard/StepManager.js'; // T3.3
// import { RiesgoSelector } from './components/wizard/RiesgoSelector.js'; // T3.4
// import { NivelesRiesgoForm } from './components/wizard/NivelesRiesgoForm.js'; // T3.5
// import { ControlesManager } from './components/wizard/ControlesManager.js'; // T3.6
// import { ProgressTracker } from './components/wizard/ProgressTracker.js'; // T3.7

/**
 * Initialize Wizard Riesgos
 */
async function initWizardRiesgos() {
  console.log('[Wizard Riesgos] Initializing...');

  // Get wizard state singleton
  const wizardState = getWizardState();

  // Log current state
  console.log('[Wizard Riesgos] Current state:', wizardState.data);

  // Check if we have a saved session FIRST (ANTES de precargar catalogos)
  const currentStep = wizardState.getCurrentStep();
  if (currentStep !== 'info-basica') {
    // Ocultar loading inicial y mostrar modal inmediatamente
    hideLoadingIndicator();

    // Usar modal hermoso en lugar de confirm()
    createResumeModal(
      currentStep,
      async () => {
        // Continuar donde lo dejó
        console.log('[Wizard Riesgos] Resuming from step:', currentStep);

        // Mostrar loading mientras se inicializa
        showLoadingIndicator('Cargando asistente...');

        // AHORA sí precargar catalogos (solo si continúa)
        await preloadCatalogos();

        // Load catalogos from API
        await loadCatalogos(wizardState);

        // Initialize wizard core
        const wizardCore = new WizardCore('#wizard-container', wizardState);
        wizardCore.init();

        // Inicializar tooltips/dropdowns
        initTooltipsAndDropdowns();

        // Ocultar loading
        hideLoadingIndicator();
      },
      () => {
        // Empezar de nuevo
        wizardState.clearStorage();
        console.log('[Wizard Riesgos] Session cleared, starting fresh');
        window.location.reload();
      }
    );

    // No continuar la inicialización hasta que usuario decida
    return;
  }

  // Si NO hay sesión guardada, continuar normalmente
  // Mostrar loading mientras carga
  showLoadingIndicator('Cargando catálogos...');

  try {
    // Precargar catalogos (sectores y ciudades)
    await preloadCatalogos();

    // Load catalogos from API
    await loadCatalogos(wizardState);

    // Initialize wizard core
    const wizardCore = new WizardCore('#wizard-container', wizardState);
    wizardCore.init();

    // Inicializar tooltips/dropdowns
    initTooltipsAndDropdowns();

    console.log('[Wizard Riesgos] Initialized successfully with Floating-UI enhancements');

    // Ocultar loading
    hideLoadingIndicator();
  } catch (error) {
    console.error('[Wizard Riesgos] Error during initialization:', error);
    hideLoadingIndicator();

    const container = document.getElementById('wizard-container');
    if (container) {
      container.innerHTML = `
        <div class="wizard-error">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error al cargar el asistente</h3>
          <p>No se pudieron cargar los catálogos necesarios. Por favor, recarga la página.</p>
          <button onclick="window.location.reload()" class="btn-primary">
            <i class="fas fa-redo"></i> Recargar página
          </button>
        </div>
      `;
    }
  }
}

/**
 * Helper: Mostrar indicador de carga
 */
function showLoadingIndicator(message = 'Cargando asistente...') {
  const loadingElement = document.querySelector('.wizard-loading');
  const loadingText = document.querySelector('.wizard-loading__text');

  if (loadingElement && loadingText) {
    loadingText.textContent = message;
    loadingElement.style.display = 'flex';
  }
}

/**
 * Helper: Ocultar indicador de carga
 */
function hideLoadingIndicator() {
  const loadingElement = document.querySelector('.wizard-loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

/**
 * Helper: Inicializar tooltips y dropdowns con MutationObserver
 */
function initTooltipsAndDropdowns() {
  // Observar cambios en el wizard para reinicializar cuando cambie el paso
  let initTimeout = null;
  const observer = new MutationObserver(() => {
    // Debounce: evitar múltiples llamadas seguidas
    if (initTimeout) {
      clearTimeout(initTimeout);
    }

    initTimeout = setTimeout(() => {
      // Desconectar observer temporalmente para evitar loop
      observer.disconnect();

      initTooltips('[data-tooltip]');
      initDropdowns('.wizard-enhanced-select');

      // Reconectar observer
      const wizardContainer = document.querySelector('#wizard-container');
      if (wizardContainer) {
        observer.observe(wizardContainer, {
          childList: true,
          subtree: true
        });
      }
    }, 50); // 50ms debounce
  });

  const wizardContainer = document.querySelector('#wizard-container');
  if (wizardContainer) {
    observer.observe(wizardContainer, {
      childList: true,
      subtree: true
    });
  }

  // Inicializar inmediatamente
  setTimeout(() => {
    initTooltips('[data-tooltip]');
    initDropdowns('.wizard-enhanced-select');
  }, 100);
}

/**
 * Load catalogos from API
 * Uses new catalog API endpoints from Expert #2
 */
async function loadCatalogos(wizardState) {
  try {
    console.log('[Wizard Riesgos] Loading catalogos from new API...');

    const catalogos = {
      riesgos: [], // All GES
      categorias: [], // Risk categories (Físico, Biomecánico, etc.)
      sectores: [], // Legacy sectors (para compatibilidad)
      ciiuSecciones: [], // CIIU Secciones (21)
      ciudades: [] // Ciudades de Colombia
    };

    // Load all catalog data in parallel for performance
    const [
      gesResponse,
      categoriasResponse,
      sectoresResponse,
      ciiuSeccionesResponse,
      ciudadesResponse
    ] = await Promise.all([
      fetch('/api/catalogo/ges?limit=200'), // Get all GES
      fetch('/api/catalogo/riesgos'), // Get risk categories
      fetch('/api/catalogo/sectores'), // Get legacy sectors
      fetch('/api/catalogo/ciiu/secciones'), // Get CIIU sections (21)
      fetch('/api/catalogo/ciudades') // Get cities
    ]);

    // Process GES
    if (gesResponse.ok) {
      const gesData = await gesResponse.json();
      catalogos.riesgos = gesData.data || [];
      console.log(`[Wizard Riesgos] ✅ Loaded ${catalogos.riesgos.length} GES from catalog API`);
    } else {
      console.error('[Wizard Riesgos] ❌ Error loading GES:', gesResponse.statusText);
    }

    // Process Categories
    if (categoriasResponse.ok) {
      const catData = await categoriasResponse.json();
      catalogos.categorias = catData.data || [];
      console.log(`[Wizard Riesgos] ✅ Loaded ${catalogos.categorias.length} risk categories`);
    } else {
      console.error('[Wizard Riesgos] ❌ Error loading categories:', categoriasResponse.statusText);
    }

    // Process Sectors (legacy)
    if (sectoresResponse.ok) {
      const sectData = await sectoresResponse.json();
      catalogos.sectores = sectData.data || [];
      console.log(`[Wizard Riesgos] ✅ Loaded ${catalogos.sectores.length} sectors`);
    } else {
      console.error('[Wizard Riesgos] ❌ Error loading sectors:', sectoresResponse.statusText);
    }

    // Process CIIU Secciones (nuevo - 21 secciones)
    if (ciiuSeccionesResponse.ok) {
      const ciiuData = await ciiuSeccionesResponse.json();
      catalogos.ciiuSecciones = ciiuData.data || [];
      console.log(`[Wizard Riesgos] ✅ Loaded ${catalogos.ciiuSecciones.length} CIIU sections`);
    } else {
      console.error('[Wizard Riesgos] ❌ Error loading CIIU sections:', ciiuSeccionesResponse.statusText);
    }

    // Process Ciudades
    if (ciudadesResponse.ok) {
      const ciudadesData = await ciudadesResponse.json();
      catalogos.ciudades = ciudadesData.data || [];
      console.log(`[Wizard Riesgos] ✅ Loaded ${catalogos.ciudades.length} cities`);
    } else {
      console.error('[Wizard Riesgos] ❌ Error loading cities:', ciudadesResponse.statusText);
    }

    // Save catalogos to state
    wizardState.setCatalogos(catalogos);

    console.log('[Wizard Riesgos] 🎯 All catalogos loaded successfully');
  } catch (error) {
    console.error('[Wizard Riesgos] ❌ Error loading catalogos:', error);
    // Continue with empty catalogos - wizard will show empty state
  }
}

/**
 * Show placeholder message (temporary until components are ready)
 */
function showPlaceholder() {
  const container = document.getElementById('wizard-container');
  if (!container) {
    console.warn('[Wizard Riesgos] #wizard-container not found');
    return;
  }

  container.innerHTML = `
    <div style="
      max-width: 800px;
      margin: 100px auto;
      padding: 40px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
    ">
      <h1 style="
        font-family: Poppins, sans-serif;
        font-size: 3.2rem;
        color: #383d47;
        margin-bottom: 20px;
      ">
        Wizard de Riesgos
      </h1>
      <p style="
        font-family: Raleway, sans-serif;
        font-size: 1.6rem;
        color: #2d3238;
        line-height: 1.6;
        margin-bottom: 30px;
      ">
        El asistente interactivo para crear tu matriz de riesgos profesionales está en construcción.
      </p>
      <div style="
        background: #f3f0f0;
        border-radius: 12px;
        padding: 30px;
        margin-bottom: 30px;
      ">
        <h2 style="
          font-family: Poppins, sans-serif;
          font-size: 2rem;
          color: #5dc4af;
          margin-bottom: 15px;
        ">
          Próximamente
        </h2>
        <ul style="
          list-style: none;
          padding: 0;
          font-family: Raleway, sans-serif;
          font-size: 1.4rem;
          color: #2d3238;
          text-align: left;
        ">
          <li style="margin-bottom: 10px;">✅ Estado centralizado con localStorage</li>
          <li style="margin-bottom: 10px;">⏳ Navegación paso a paso inteligente</li>
          <li style="margin-bottom: 10px;">⏳ Selector de riesgos con búsqueda</li>
          <li style="margin-bottom: 10px;">⏳ Calculadora de niveles NP/NR en tiempo real</li>
          <li style="margin-bottom: 10px;">⏳ Gestión de controles con sugerencias</li>
          <li style="margin-bottom: 10px;">⏳ Barra de progreso con estimación de tiempo</li>
        </ul>
      </div>
      <a href="/" style="
        display: inline-block;
        background: #5dc4af;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        text-decoration: none;
        font-family: Poppins, sans-serif;
        font-size: 1.6rem;
        font-weight: 600;
        transition: background 0.3s ease;
      " onmouseover="this.style.background='#4db39e'" onmouseout="this.style.background='#5dc4af'">
        Volver al inicio
      </a>
    </div>
  `;
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWizardRiesgos);
} else {
  initWizardRiesgos();
}
