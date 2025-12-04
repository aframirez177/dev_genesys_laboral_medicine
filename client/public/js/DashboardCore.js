/**
 * DashboardCore - Navegación optimizada sin re-renders
 * Sprint 6 - Bug Fix A.1 y A.2
 *
 * Patrón Show/Hide para evitar destrucción del DOM
 * Cache de documentos con TTL de 5 minutos
 */

export class DashboardCore {
  constructor() {
    this.currentPage = null;
    this.pages = {};
    this.contentContainer = null;
    this.navItems = null;

    // Document cache (Bug Fix A.2)
    this.documentCache = {
      data: null,
      timestamp: null,
      ttl: 5 * 60 * 1000 // 5 minutes
    };

    // API Base URL
    this.API_BASE = window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api'
      : '/api';

    // Auth token
    this.token = localStorage.getItem('genesys_token');
  }

  /**
   * Initialize dashboard
   */
  init() {
    this.contentContainer = document.querySelector('.dashboard-content');
    this.navItems = document.querySelectorAll('.nav-item:not(.disabled)');

    if (!this.contentContainer) {
      console.error('Dashboard content container not found');
      return;
    }

    // Initialize all page containers (hidden)
    this.initializePages();

    // Setup navigation
    this.setupNavigation();

    // Show initial page (documents by default)
    this.switchPage('documents');
  }

  /**
   * Create all page containers upfront (only once)
   * ✅ Bug Fix A.1: Pages are created once and toggled with display
   */
  initializePages() {
    const pageIds = [
      'documents',
      'cargos',
      'matriz',
      'controles',
      'examenes',
      'mapa-calor'
    ];

    pageIds.forEach(pageId => {
      const section = document.createElement('section');
      section.dataset.page = pageId;
      section.className = 'dashboard-page';
      section.style.display = 'none';

      this.contentContainer.appendChild(section);
      this.pages[pageId] = {
        element: section,
        loaded: false
      };
    });
  }

  /**
   * Setup navigation click handlers
   */
  setupNavigation() {
    this.navItems.forEach(item => {
      item.addEventListener('click', async (e) => {
        e.preventDefault();
        const page = item.dataset.page;

        if (!page || page === this.currentPage) return;

        await this.switchPage(page);
        this.closeMobileMenu();
      });
    });
  }

  /**
   * Switch page - OPTIMIZED: Show/hide pattern
   * ✅ Fix Bug A.1: No more re-renders
   * ✅ Fix Bug A.2: DOM persists, data cached
   */
  async switchPage(page) {
    // Hide current page
    if (this.currentPage && this.pages[this.currentPage]) {
      this.pages[this.currentPage].element.style.display = 'none';
    }

    // Update active nav
    this.updateActiveNav(page);

    // Update header title
    this.updateHeaderTitle(page);

    // Show/hide cart (only for documents page)
    this.toggleCart(page === 'documents');

    // Show target page
    const targetPage = this.pages[page];
    if (!targetPage) {
      console.error(`Page ${page} not found`);
      return;
    }

    targetPage.element.style.display = 'block';

    // Load content only if not loaded before
    if (!targetPage.loaded) {
      await this.loadPageContent(page);
      targetPage.loaded = true;
    }

    this.currentPage = page;
  }

  /**
   * Update active navigation item
   */
  updateActiveNav(page) {
    this.navItems.forEach(item => {
      if (item.dataset.page === page) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Update header title based on page
   */
  updateHeaderTitle(page) {
    const headerTitle = document.querySelector('.header-title');
    if (!headerTitle) return;

    const titles = {
      'documents': 'Mis Documentos',
      'cargos': 'Gestión de Cargos',
      'matriz': 'Matriz GTC-45',
      'controles': 'Controles por Jerarquía',
      'examenes': 'Exámenes Médicos',
      'mapa-calor': 'Mapa de Calor Organizacional'
    };

    headerTitle.textContent = titles[page] || 'Dashboard';
  }

  /**
   * Toggle cart visibility
   */
  toggleCart(visible) {
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) {
      cartContainer.style.display = visible ? '' : 'none';
    }
  }

  /**
   * Load page content (only once per page)
   */
  async loadPageContent(page) {
    const pageElement = this.pages[page].element;

    // Show loading state
    pageElement.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    `;

    try {
      switch (page) {
        case 'documents':
          await this.loadDocumentsPage(pageElement);
          break;

        case 'cargos':
          await this.loadCargosPage(pageElement);
          break;

        case 'matriz':
          await this.loadMatrizPage(pageElement);
          break;

        case 'controles':
          await this.loadControlesPage(pageElement);
          break;

        case 'examenes':
          await this.loadExamenesPage(pageElement);
          break;

        case 'mapa-calor':
          await this.loadMapaCalorPage(pageElement);
          break;

        default:
          pageElement.innerHTML = '<div class="error">Página no encontrada</div>';
      }
    } catch (error) {
      console.error(`Error loading ${page}:`, error);
      pageElement.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Error al cargar contenido</h3>
          <p>${error.message}</p>
          <button onclick="location.reload()">Reintentar</button>
        </div>
      `;
    }
  }

  /**
   * Load documents page with caching
   * ✅ Fix Bug A.2: Document cache implementation
   */
  async loadDocumentsPage(container) {
    // Build HTML structure
    container.innerHTML = `
      <section class="documents-section">
        <div class="loading-container" id="loading-container-docs">
          <div class="loading-spinner"></div>
          <p>Cargando documentos...</p>
        </div>
        <div class="empty-state" id="empty-state-docs" style="display: none;">
          <div class="empty-state-icon">📂</div>
          <h3 class="empty-state-title">No tienes documentos aún</h3>
          <p class="empty-state-text">Comienza generando tu primer diagnóstico de riesgos ocupacionales</p>
          <a href="./wizard_riesgos.html" class="header-btn header-btn-primary">Crear Diagnóstico</a>
        </div>
        <div class="documents-grid" id="documents-grid-main" style="display: none;"></div>
      </section>
    `;

    const loadingEl = container.querySelector('#loading-container-docs');
    const emptyStateEl = container.querySelector('#empty-state-docs');
    const gridEl = container.querySelector('#documents-grid-main');

    const now = Date.now();

    // Check cache
    if (this.documentCache.data &&
        this.documentCache.timestamp &&
        (now - this.documentCache.timestamp) < this.documentCache.ttl) {

      console.log('📦 Using cached documents');
      this.renderDocuments(gridEl, emptyStateEl, loadingEl, this.documentCache.data);
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE}/documentos`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Update cache
      this.documentCache.data = data;
      this.documentCache.timestamp = now;
      console.log('🔄 Documents cached');

      this.renderDocuments(gridEl, emptyStateEl, loadingEl, data);
    } catch (error) {
      console.error('Error loading documents:', error);
      loadingEl.style.display = 'none';
      gridEl.innerHTML = `
        <div class="error-message">
          <p>Error al cargar documentos: ${error.message}</p>
          <button onclick="location.reload()">Reintentar</button>
        </div>
      `;
      gridEl.style.display = 'block';
    }
  }

  /**
   * Render documents in grid
   */
  renderDocuments(gridEl, emptyStateEl, loadingEl, data) {
    loadingEl.style.display = 'none';

    if (!data || !data.solicitudes || data.solicitudes.length === 0) {
      emptyStateEl.style.display = 'flex';
      gridEl.style.display = 'none';
      return;
    }

    emptyStateEl.style.display = 'none';
    gridEl.style.display = 'grid';

    // Import and render documents
    // (Mantener lógica existente de renderizado de DocumentCard)
    gridEl.innerHTML = data.solicitudes.map(solicitud => {
      return this.createDocumentCard(solicitud);
    }).join('');
  }

  /**
   * Create document card HTML
   */
  createDocumentCard(solicitud) {
    // Placeholder - mantener lógica existente de DocumentCard
    return `
      <div class="document-card" data-id="${solicitud.id}">
        <h3>${solicitud.nombre_empresa}</h3>
        <p>Solicitud #${solicitud.id}</p>
        <!-- Agregar resto de la card según diseño existente -->
      </div>
    `;
  }

  /**
   * Invalidate document cache (call after upload/delete)
   */
  invalidateDocumentCache() {
    this.documentCache.data = null;
    this.documentCache.timestamp = null;
    console.log('🗑️ Document cache cleared');
  }

  /**
   * Load cargos page (delegated to dashboardCargosHandler)
   */
  async loadCargosPage(container) {
    container.innerHTML = '<div id="cargos-container"></div>';

    // Import and initialize cargos module
    const { default: dashboardCargos } = await import('./dashboardCargosHandler.js');
    await dashboardCargos.loadCargosView(container.querySelector('#cargos-container'));
  }

  /**
   * Load matriz page (delegated to dashboardCargosHandler)
   */
  async loadMatrizPage(container) {
    container.innerHTML = '<div id="matriz-container"></div>';

    const { default: dashboardCargos } = await import('./dashboardCargosHandler.js');
    await dashboardCargos.loadMatrizGTC45View(container.querySelector('#matriz-container'));
  }

  /**
   * Load controles page (delegated to dashboardCargosHandler)
   */
  async loadControlesPage(container) {
    container.innerHTML = '<div id="controles-container"></div>';

    const { default: dashboardCargos } = await import('./dashboardCargosHandler.js');
    await dashboardCargos.loadControlesView(container.querySelector('#controles-container'));
  }

  /**
   * Load examenes page (delegated to dashboardExamenesHandler)
   */
  async loadExamenesPage(container) {
    container.innerHTML = '<div id="examenes-container"></div>';

    const { default: dashboardExamenes } = await import('./dashboardExamenesHandler.js');
    await dashboardExamenes.loadExamenesView(container.querySelector('#examenes-container'));
  }

  /**
   * Load mapa calor page (delegated to dashboardExamenesHandler)
   */
  async loadMapaCalorPage(container) {
    container.innerHTML = '<div id="mapa-calor-container"></div>';

    const { default: dashboardExamenes } = await import('./dashboardExamenesHandler.js');
    await dashboardExamenes.loadMapaCalorView(container.querySelector('#mapa-calor-container'));
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
  }
}

// Export singleton instance
export default new DashboardCore();
