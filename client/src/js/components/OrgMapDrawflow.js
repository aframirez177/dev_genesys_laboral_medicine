/**
 * OrgMapDrawflow.js - Mapa Organizacional Interactivo
 *
 * Usa Drawflow para crear un canvas interactivo tipo N8N donde:
 * - Los cargos aparecen como cards compactas en un palette/dock
 * - El usuario arrastra cards al canvas para posicionarlas
 * - Las cards se expanden al colocarlas (muestran más info)
 * - El usuario conecta cards con líneas ortogonales (90°)
 * - Doble-click en un nodo abre el CargoMiniWizard para editar
 */

import Drawflow from 'drawflow';
import 'drawflow/dist/drawflow.min.css';

export class OrgMapDrawflow {
    constructor(options = {}) {
        this.options = {
            container: options.container || null,
            paletteContainer: options.paletteContainer || null,
            cargos: options.cargos || [],
            empresaId: options.empresaId || null,
            onEditCargo: options.onEditCargo || (() => {}),
            onAddCargo: options.onAddCargo || (() => {}),
            ...options
        };

        this.editor = null;
        this.nodeCargoMap = {}; // nodeId → cargoData
        this.placedCargoIds = new Set(); // cargo IDs already on canvas
        this.savedPositions = null; // Loaded from localStorage

        // Grid snap settings (20px to match visual grid)
        this.gridSize = 20;
        this.snapToGrid = true;
        this.connectionCornerRadius = 10; // Rounded corners for connections
    }

    /**
     * Snap a value to the nearest grid point
     */
    _snapToGrid(value) {
        if (!this.snapToGrid) return value;
        return Math.round(value / this.gridSize) * this.gridSize;
    }

    /**
     * Snap a node's position to the grid (called after drag ends)
     */
    _snapNodeToGrid(nodeId) {
        if (!this.snapToGrid || !this.editor) return;

        const nodeData = this.editor.getNodeFromId(nodeId);
        if (!nodeData) return;

        const snappedX = this._snapToGrid(nodeData.pos_x);
        const snappedY = this._snapToGrid(nodeData.pos_y);

        // Update node position in Drawflow data
        if (this.editor.drawflow.drawflow.Home.data[nodeId]) {
            this.editor.drawflow.drawflow.Home.data[nodeId].pos_x = snappedX;
            this.editor.drawflow.drawflow.Home.data[nodeId].pos_y = snappedY;
        }

        // Update DOM element position
        const nodeEl = this.options.container.querySelector(`#node-${nodeId}`);
        if (nodeEl) {
            nodeEl.style.left = `${snappedX}px`;
            nodeEl.style.top = `${snappedY}px`;
        }

        // Update connections
        this.editor.updateConnectionNodes(`node-${nodeId}`);
    }

    /**
     * Initialize the Drawflow editor
     */
    init() {
        const container = this.options.container;
        if (!container) {
            console.error('[OrgMap] No container provided');
            return;
        }

        // Clear container
        container.innerHTML = '';
        container.classList.add('orgmap-canvas');

        // Create Drawflow instance
        this.editor = new Drawflow(container);

        // Configure for orthogonal connections
        this.editor.reroute = true;
        this.editor.reroute_fix_curvature = true;
        this.editor.force_first_input = false;

        // Use step-line path for orthogonal routing
        this.editor.curvature = 0.5;
        this.editor.reroute_curvature = 0.5;
        this.editor.reroute_curvature_start_end = 0.5;

        // Start editor
        this.editor.start();

        // Override the connection path to orthogonal
        this._overrideConnectionPath();

        // Setup events
        this._setupEvents();

        // Initialize grid scale and position
        this._updateGridScale();
        this._updateGridPosition();

        // Setup drag and drop from palette
        this._setupDragDrop();

        // Load saved positions and restore nodes
        this._loadSavedState();

        // Render palette with unplaced cargos
        this._renderPalette();
    }

    /**
     * Override Drawflow's default bezier curve with orthogonal step-line paths
     */
    _overrideConnectionPath() {
        // Override the createCurvature function used by Drawflow
        const self = this;
        const originalUpdate = this.editor.updateConnectionNodes.bind(this.editor);

        this.editor.updateConnectionNodes = function(id) {
            originalUpdate(id);
            // After default update, override all SVG paths to orthogonal
            self._applyOrthogonalPaths();
        };

        // Also apply after any connection is created
        this.editor.on('connectionCreated', () => {
            setTimeout(() => self._applyOrthogonalPaths(), 10);
        });
    }

    /**
     * Update grid scale to match zoom level
     */
    _updateGridScale() {
        const container = this.options.container;
        if (!container || !this.editor) return;

        const zoom = this.editor.zoom || 1;
        const baseSize = 20; // Base grid size in pixels

        container.style.setProperty('--grid-size', `${baseSize * zoom}px`);
        container.style.setProperty('--grid-major', `${baseSize * 5 * zoom}px`);
    }

    /**
     * Convert all connection SVG paths to orthogonal vertical routing (V-H-V)
     * Output is at bottom of source node, input is at top of target node
     * With rounded corners for a smoother look
     */
    _applyOrthogonalPaths() {
        const container = this.options.container;
        if (!container) return;

        const r = this.connectionCornerRadius || 20;

        const connections = container.querySelectorAll('.connection path.main-path');
        connections.forEach(path => {
            const parent = path.closest('.connection');
            if (!parent) return;

            const outputClass = [...parent.classList].find(c => c.startsWith('node_out_'));
            const inputClass = [...parent.classList].find(c => c.startsWith('node_in_'));
            if (!outputClass || !inputClass) return;

            const outputNodeId = outputClass.replace('node_out_node-', '');
            const inputNodeId = inputClass.replace('node_in_node-', '');

            const outputNode = container.querySelector(`#node-${outputNodeId}`);
            const inputNode = container.querySelector(`#node-${inputNodeId}`);
            if (!outputNode || !inputNode) return;

            const outputEl = outputNode.querySelector('.output_1');
            const inputEl = inputNode.querySelector('.input_1');
            if (!outputEl || !inputEl) return;

            const canvasRect = container.querySelector('.drawflow').getBoundingClientRect();
            const zoom = this.editor ? this.editor.zoom : 1;

            const outRect = outputEl.getBoundingClientRect();
            const inRect = inputEl.getBoundingClientRect();

            // Output: bottom-center of source node
            const x1 = (outRect.left + outRect.width / 2 - canvasRect.left) / zoom;
            const y1 = (outRect.top + outRect.height / 2 - canvasRect.top) / zoom;
            // Input: top-center of target node
            const x2 = (inRect.left + inRect.width / 2 - canvasRect.left) / zoom;
            const y2 = (inRect.top + inRect.height / 2 - canvasRect.top) / zoom;

            // Vertical orthogonal path: down, across, down (V-H-V) with rounded corners
            const midY = (y1 + y2) / 2;
            const dx = x2 - x1;
            const dy1 = midY - y1;
            const dy2 = y2 - midY;

            // Calculate effective radius (can't be larger than half the available space)
            const effectiveR = Math.min(r, Math.abs(dx) / 2, Math.abs(dy1), Math.abs(dy2));

            let d;
            if (effectiveR < 3 || Math.abs(dx) < 3) {
                // Too small for curves or nearly straight - use simple path
                d = `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;
            } else {
                // Direction flags - FIXED: inverted sweep for convex corners
                const goingRight = dx > 0;
                const sweepFirst = goingRight ? 0 : 1;  // Counter-clockwise if going right (convex)
                const sweepSecond = goingRight ? 1 : 0; // Clockwise if going right (convex)

                // Corner points
                const corner1Y = midY - effectiveR;  // End of first vertical
                const corner1X = x1 + (goingRight ? effectiveR : -effectiveR);  // Start of horizontal
                const corner2X = x2 - (goingRight ? effectiveR : -effectiveR);  // End of horizontal
                const corner2Y = midY + effectiveR;  // Start of second vertical

                d = `M ${x1} ${y1} ` +
                    `V ${corner1Y} ` +
                    `A ${effectiveR} ${effectiveR} 0 0 ${sweepFirst} ${corner1X} ${midY} ` +
                    `H ${corner2X} ` +
                    `A ${effectiveR} ${effectiveR} 0 0 ${sweepSecond} ${x2} ${corner2Y} ` +
                    `V ${y2}`;
            }
            path.setAttribute('d', d);
        });
    }

    /**
     * Setup Drawflow event listeners
     */
    _setupEvents() {
        // Node selected (single click) - highlight
        this.editor.on('nodeSelected', (nodeId) => {
            this._highlightNode(nodeId);
        });

        // Node double-click - open editor
        this.options.container.addEventListener('dblclick', (e) => {
            const nodeEl = e.target.closest('.drawflow-node');
            if (!nodeEl) return;
            const nodeId = parseInt(nodeEl.id.replace('node-', ''));
            const cargoData = this.nodeCargoMap[nodeId];
            if (cargoData) {
                this.options.onEditCargo(cargoData);
            }
        });

        // Node moved - snap to grid and save positions
        this.editor.on('nodeMoved', (nodeId) => {
            this._snapNodeToGrid(nodeId);
            this._saveState();
            setTimeout(() => this._applyOrthogonalPaths(), 20);
        });

        // Connection removed
        this.editor.on('connectionRemoved', () => {
            this._saveState();
        });

        // Connection created
        this.editor.on('connectionCreated', () => {
            this._saveState();
        });

        // Update grid scale on zoom AND pan
        const containerEl = this.options.container;
        if (containerEl) {
            containerEl.addEventListener('wheel', () => {
                // Small delay to let Drawflow update zoom first
                setTimeout(() => {
                    this._updateGridScale();
                    this._updateGridPosition();
                }, 10);
            });
        }

        // Track mouse movement for grid panning and live snap-to-grid
        this._setupDragSnap();

        // Node removed
        this.editor.on('nodeRemoved', (nodeId) => {
            const cargoData = this.nodeCargoMap[nodeId];
            if (cargoData) {
                this.placedCargoIds.delete(cargoData.id);
                delete this.nodeCargoMap[nodeId];
            }
            this._saveState();
            this._renderPalette();
        });

        // Track canvas panning with mouse events
        this._setupPanTracking();
    }

    /**
     * Setup tracking for canvas panning to update grid position
     */
    _setupPanTracking() {
        const container = this.options.container;
        if (!container) return;

        // DEBUG: Visual confirmation that this code is running
        container.setAttribute('data-pan-tracking', 'initialized');

        // Cache last position to avoid unnecessary DOM updates
        let lastBgPosition = '';

        // Continuously sync grid position with canvas transform
        const syncGrid = () => {
            const drawflowEl = container.querySelector('.drawflow');
            if (drawflowEl) {
                const transform = drawflowEl.style.transform || '';
                // Extract translate values from transform: translate(Xpx, Ypx) scale(Z)
                const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                if (match) {
                    const newPos = `${match[1]} ${match[2]}`;
                    if (newPos !== lastBgPosition) {
                        container.style.backgroundPosition = newPos;
                        lastBgPosition = newPos;
                    }
                }
            }
            requestAnimationFrame(syncGrid);
        };
        requestAnimationFrame(syncGrid);
    }

    /**
     * Setup live snap-to-grid during drag
     */
    _setupDragSnap() {
        const container = this.options.container;
        if (!container) return;

        let isDraggingNode = false;
        let currentDragNodeId = null;
        let lastSnapX = null;
        let lastSnapY = null;

        // Detect when a node starts being dragged
        container.addEventListener('mousedown', (e) => {
            const nodeEl = e.target.closest('.drawflow-node');
            if (nodeEl && !e.target.closest('.output') && !e.target.closest('.input')) {
                isDraggingNode = true;
                currentDragNodeId = parseInt(nodeEl.id.replace('node-', ''));
                lastSnapX = null;
                lastSnapY = null;
            }
        });

        // Snap during drag
        container.addEventListener('mousemove', (e) => {
            if (!isDraggingNode || !currentDragNodeId || !this.snapToGrid) return;

            const nodeEl = container.querySelector(`#node-${currentDragNodeId}`);
            if (!nodeEl) return;

            // Get current position from style
            const currentLeft = parseFloat(nodeEl.style.left) || 0;
            const currentTop = parseFloat(nodeEl.style.top) || 0;

            // Calculate snapped position
            const snappedX = this._snapToGrid(currentLeft);
            const snappedY = this._snapToGrid(currentTop);

            // Only update if snap position changed (reduces DOM thrashing)
            if (snappedX !== lastSnapX || snappedY !== lastSnapY) {
                nodeEl.style.left = `${snappedX}px`;
                nodeEl.style.top = `${snappedY}px`;

                // Update Drawflow internal data
                if (this.editor.drawflow.drawflow.Home.data[currentDragNodeId]) {
                    this.editor.drawflow.drawflow.Home.data[currentDragNodeId].pos_x = snappedX;
                    this.editor.drawflow.drawflow.Home.data[currentDragNodeId].pos_y = snappedY;
                }

                lastSnapX = snappedX;
                lastSnapY = snappedY;

                // Update connections in real-time
                this.editor.updateConnectionNodes(`node-${currentDragNodeId}`);
            }
        });

        // Stop tracking on mouse up
        document.addEventListener('mouseup', () => {
            if (isDraggingNode && currentDragNodeId) {
                // Final snap
                this._snapNodeToGrid(currentDragNodeId);
                setTimeout(() => this._applyOrthogonalPaths(), 20);
            }
            isDraggingNode = false;
            currentDragNodeId = null;
        });
    }

    /**
     * Update grid background position to match pan offset
     */
    _updateGridPosition() {
        const container = this.options.container;
        if (!container || !this.editor) return;

        // Get the .drawflow element which has the transform applied
        const drawflowEl = container.querySelector('.drawflow');
        if (!drawflowEl) return;

        // Parse the transform matrix to get translation values
        const transform = window.getComputedStyle(drawflowEl).transform;

        let translateX = 0;
        let translateY = 0;

        if (transform && transform !== 'none') {
            // Transform is a matrix like: matrix(a, b, c, d, tx, ty)
            const matrix = transform.match(/matrix.*\((.+)\)/);
            if (matrix && matrix[1]) {
                const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
                // For matrix(a, b, c, d, tx, ty), tx is index 4, ty is index 5
                translateX = values[4] || 0;
                translateY = values[5] || 0;
            }
        }

        // Apply the offset to background position
        container.style.backgroundPosition = `${translateX}px ${translateY}px`;
    }

    /**
     * Setup HTML5 Drag and Drop for palette → canvas
     */
    _setupDragDrop() {
        const canvas = this.options.container;

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.classList.add('orgmap-canvas--dragover');
        });

        canvas.addEventListener('dragleave', () => {
            canvas.classList.remove('orgmap-canvas--dragover');
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('orgmap-canvas--dragover');

            const cargoId = e.dataTransfer.getData('cargo-id');
            if (!cargoId) return;

            const cargo = this.options.cargos.find(c => String(c.id) === String(cargoId));
            if (!cargo) return;

            // Calculate position relative to canvas
            const canvasEl = canvas.querySelector('.drawflow');
            if (!canvasEl) return;

            const rect = canvasEl.getBoundingClientRect();
            const zoom = this.editor.zoom || 1;
            const posX = (e.clientX - rect.left) / zoom - this.editor.canvas_x / zoom;
            const posY = (e.clientY - rect.top) / zoom - this.editor.canvas_y / zoom;

            // Add node to canvas
            this._addCargoNode(cargo, posX, posY);

            // Update palette
            this._renderPalette();
        });
    }

    /**
     * Add a cargo as a Drawflow node
     */
    _addCargoNode(cargo, posX, posY) {
        // Snap position to grid
        posX = this._snapToGrid(posX);
        posY = this._snapToGrid(posY);

        const riskLevel = this._getRiskLevel(cargo);
        const numPersonas = cargo.num_trabajadores || cargo.num_personas || cargo.numPersonas || 1;
        const numRiesgos = cargo.riesgosCount || (cargo.gesSeleccionados || cargo.riesgos || cargo.riesgosSeleccionados || []).length;
        const area = cargo.area || '';
        const zona = cargo.zona || '';

        // Expanded card HTML (shown on canvas)
        const nodeHtml = `
            <div class="orgmap-node orgmap-node--${riskLevel}" data-cargo-id="${cargo.id}">
                <div class="orgmap-node__header">
                    <span class="orgmap-node__badge orgmap-node__badge--${riskLevel}">N${riskLevel.toUpperCase()}</span>
                    <button class="orgmap-node__edit-btn" title="Editar cargo">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                </div>
                <div class="orgmap-node__body">
                    <div class="orgmap-node__title">${this._escapeHtml(cargo.nombre)}</div>
                    ${area ? `<div class="orgmap-node__area">${this._escapeHtml(area)}</div>` : ''}
                    ${zona ? `<div class="orgmap-node__zona">${this._escapeHtml(zona)}</div>` : ''}
                </div>
                <div class="orgmap-node__stats">
                    <div class="orgmap-node__stat">
                        <span class="orgmap-node__stat-value">${numPersonas}</span>
                        <span class="orgmap-node__stat-label">Pers.</span>
                    </div>
                    <div class="orgmap-node__stat">
                        <span class="orgmap-node__stat-value">${numRiesgos}</span>
                        <span class="orgmap-node__stat-label">Riesg.</span>
                    </div>
                </div>
            </div>
        `;

        // Add node with 1 input and 1 output for connections
        const nodeId = this.editor.addNode(
            `cargo_${cargo.id}`,
            1, // inputs
            1, // outputs
            posX,
            posY,
            `orgmap-drawflow-node risk-${riskLevel}`,
            { cargoId: cargo.id },
            nodeHtml
        );

        // Track mapping
        this.nodeCargoMap[nodeId] = cargo;
        this.placedCargoIds.add(cargo.id);

        // Handle edit button click (stop propagation to prevent Drawflow events)
        setTimeout(() => {
            const nodeEl = this.options.container.querySelector(`#node-${nodeId} .orgmap-node__edit-btn`);
            if (nodeEl) {
                nodeEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.options.onEditCargo(cargo);
                });
            }
        }, 50);

        this._saveState();
        return nodeId;
    }

    /**
     * Render the palette/dock with unplaced cargos
     */
    _renderPalette() {
        const palette = this.options.paletteContainer;
        if (!palette) return;

        const unplaced = this.options.cargos.filter(c => !this.placedCargoIds.has(c.id));

        if (unplaced.length === 0 && this.options.cargos.length > 0) {
            palette.innerHTML = `
                <div class="orgmap-palette__empty">
                    <span>Todos los cargos están en el mapa</span>
                </div>
            `;
            return;
        }

        if (this.options.cargos.length === 0) {
            palette.innerHTML = `
                <div class="orgmap-palette__empty">
                    <span>No hay cargos creados. Use "Agregar cargo" para empezar.</span>
                </div>
            `;
            return;
        }

        palette.innerHTML = `
            <div class="orgmap-palette__header">
                <span class="orgmap-palette__title">Cargos disponibles</span>
                <span class="orgmap-palette__hint">Arrastre al canvas para posicionar</span>
            </div>
            <div class="orgmap-palette__cards">
                ${unplaced.map(cargo => `
                    <div class="orgmap-palette-card"
                         draggable="true"
                         data-cargo-id="${cargo.id}"
                         title="${this._escapeHtml(cargo.nombre)}">
                        <span class="orgmap-palette-card__dot orgmap-palette-card__dot--${this._getRiskLevel(cargo)}"></span>
                        <div class="orgmap-palette-card__info">
                            <span class="orgmap-palette-card__name">${this._escapeHtml(cargo.nombre)}</span>
                            ${cargo.area ? `<span class="orgmap-palette-card__area">${this._escapeHtml(cargo.area)}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add drag event listeners
        palette.querySelectorAll('.orgmap-palette-card[draggable]').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('cargo-id', card.dataset.cargoId);
                e.dataTransfer.effectAllowed = 'move';
                card.classList.add('orgmap-palette-card--dragging');
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('orgmap-palette-card--dragging');
            });
        });
    }

    /**
     * Highlight selected node
     */
    _highlightNode(nodeId) {
        // Remove previous highlights
        this.options.container.querySelectorAll('.orgmap-node--selected').forEach(el => {
            el.classList.remove('orgmap-node--selected');
        });
        // Add highlight to selected
        const nodeEl = this.options.container.querySelector(`#node-${nodeId} .orgmap-node`);
        if (nodeEl) {
            nodeEl.classList.add('orgmap-node--selected');
        }
    }

    /**
     * Save editor state to localStorage + backend (debounced)
     */
    _saveState() {
        try {
            const exportData = this.editor.export();
            const stateKey = `orgmap_state_${this.options.empresaId || 'default'}`;
            const stateData = {
                drawflow: exportData,
                nodeCargoMap: Object.fromEntries(
                    Object.entries(this.nodeCargoMap).map(([nodeId, cargo]) => [nodeId, cargo.id])
                ),
                timestamp: Date.now()
            };
            localStorage.setItem(stateKey, JSON.stringify(stateData));

            // Debounced save to backend
            if (this.options.empresaId) {
                clearTimeout(this._saveDebounceTimer);
                this._saveDebounceTimer = setTimeout(() => this._saveToDB(stateData), 2000);
            }
        } catch (e) {
            console.warn('[OrgMap] Could not save state:', e);
        }
    }

    /**
     * Persist map state to backend
     */
    async _saveToDB(stateData) {
        try {
            const authToken = localStorage.getItem('authToken');
            await fetch(`/api/cargos/empresa/${this.options.empresaId}/mapa-organizacional`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mapData: stateData })
            });
        } catch (e) {
            console.warn('[OrgMap] Could not save to DB:', e);
        }
    }

    /**
     * Load and restore saved state from backend or localStorage
     */
    async _loadSavedState() {
        try {
            let state = null;

            // Try backend first
            if (this.options.empresaId) {
                try {
                    const authToken = localStorage.getItem('authToken');
                    const resp = await fetch(`/api/cargos/empresa/${this.options.empresaId}/mapa-organizacional`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const json = await resp.json();
                    if (json.success && json.data) {
                        state = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
                    }
                } catch (e) {
                    console.warn('[OrgMap] Backend load failed, falling back to localStorage');
                }
            }

            // Fallback to localStorage
            if (!state) {
                const stateKey = `orgmap_state_${this.options.empresaId || 'default'}`;
                const saved = localStorage.getItem(stateKey);
                if (!saved) return;
                state = JSON.parse(saved);
            }
            if (!state.drawflow || !state.nodeCargoMap) return;

            // Restore nodes from saved state
            const nodeMap = state.nodeCargoMap; // nodeId → cargoId
            const drawflowData = state.drawflow;

            // Get Home module data
            const homeData = drawflowData?.drawflow?.Home?.data;
            if (!homeData) return;

            // Restore each saved node
            Object.entries(homeData).forEach(([nodeId, nodeData]) => {
                const cargoId = nodeMap[nodeId];
                if (!cargoId) return;

                const cargo = this.options.cargos.find(c => String(c.id) === String(cargoId));
                if (!cargo) return;

                // Add the node at saved position
                this._addCargoNode(cargo, nodeData.pos_x, nodeData.pos_y);
            });

            // Restore connections after all nodes are placed
            setTimeout(() => {
                Object.entries(homeData).forEach(([nodeId, nodeData]) => {
                    if (!nodeData.outputs) return;
                    Object.entries(nodeData.outputs).forEach(([outputName, outputData]) => {
                        if (!outputData.connections) return;
                        outputData.connections.forEach(conn => {
                            try {
                                // Find new node IDs (since they may differ after re-adding)
                                const origCargoId = nodeMap[nodeId];
                                const destCargoId = nodeMap[conn.node];
                                if (!origCargoId || !destCargoId) return;

                                // Find current node IDs for these cargos
                                const fromNodeId = Object.entries(this.nodeCargoMap)
                                    .find(([, c]) => String(c.id) === String(origCargoId))?.[0];
                                const toNodeId = Object.entries(this.nodeCargoMap)
                                    .find(([, c]) => String(c.id) === String(destCargoId))?.[0];

                                if (fromNodeId && toNodeId) {
                                    this.editor.addConnection(
                                        parseInt(fromNodeId),
                                        parseInt(toNodeId),
                                        'output_1',
                                        'input_1'
                                    );
                                }
                            } catch (e) {
                                // Ignore connection restore errors
                            }
                        });
                    });
                });
                this._applyOrthogonalPaths();
            }, 100);
        } catch (e) {
            console.warn('[OrgMap] Could not load saved state:', e);
        }
    }

    /**
     * Update cargos data and refresh
     */
    updateCargos(newCargos) {
        this.options.cargos = newCargos;

        // Update nodeCargoMap with fresh data
        Object.entries(this.nodeCargoMap).forEach(([nodeId, oldCargo]) => {
            const updated = newCargos.find(c => String(c.id) === String(oldCargo.id));
            if (updated) {
                this.nodeCargoMap[nodeId] = updated;
                // Update node HTML
                this._updateNodeHtml(parseInt(nodeId), updated);
            }
        });

        this._renderPalette();
    }

    /**
     * Update a single node's HTML content
     */
    _updateNodeHtml(nodeId, cargo) {
        const nodeEl = this.options.container.querySelector(`#node-${nodeId} .orgmap-node`);
        if (!nodeEl) return;

        const riskLevel = this._getRiskLevel(cargo);
        const numPersonas = cargo.num_trabajadores || cargo.num_personas || cargo.numPersonas || 1;
        const numRiesgos = cargo.riesgosCount || (cargo.gesSeleccionados || cargo.riesgos || cargo.riesgosSeleccionados || []).length;

        nodeEl.className = `orgmap-node orgmap-node--${riskLevel}`;
        const titleEl = nodeEl.querySelector('.orgmap-node__title');
        if (titleEl) titleEl.textContent = cargo.nombre;
        const areaEl = nodeEl.querySelector('.orgmap-node__area');
        if (areaEl) areaEl.textContent = cargo.area || '';
        const statValues = nodeEl.querySelectorAll('.orgmap-node__stat-value');
        if (statValues[0]) statValues[0].textContent = numPersonas;
        if (statValues[1]) statValues[1].textContent = numRiesgos;
    }

    /**
     * Reset the canvas (remove all nodes)
     */
    reset() {
        if (this.editor) {
            this.editor.clear();
        }
        this.nodeCargoMap = {};
        this.placedCargoIds.clear();
        const stateKey = `orgmap_state_${this.options.empresaId || 'default'}`;
        localStorage.removeItem(stateKey);
        this._renderPalette();
    }

    /**
     * Zoom controls
     */
    zoomIn() {
        if (this.editor) {
            this.editor.zoom_in();
            this._updateGridScale();
        }
    }

    zoomOut() {
        if (this.editor) {
            this.editor.zoom_out();
            this._updateGridScale();
        }
    }

    zoomReset() {
        if (this.editor) {
            this.editor.zoom_reset();
            this._updateGridScale();
        }
    }

    /**
     * Get risk level string from cargo data
     */
    _getRiskLevel(cargo) {
        // Usar nivel pre-calculado del backend si existe
        if (cargo.nrNivelMaximo) {
            return cargo.nrNivelMaximo.toLowerCase();
        }
        // Fallback: calcular desde gesSeleccionados
        const gesArr = cargo.gesSeleccionados || cargo.riesgos || cargo.riesgosSeleccionados || [];
        if (gesArr.length === 0) return 'i';
        let maxNR = 0;
        gesArr.forEach(ges => {
            if (ges.niveles) {
                const nd = ges.niveles.deficiencia?.value || ges.niveles.deficiencia || 1;
                const ne = ges.niveles.exposicion?.value || ges.niveles.exposicion || 1;
                const nc = ges.niveles.consecuencia?.value || ges.niveles.consecuencia || 10;
                const nr = nd * ne * nc;
                if (nr > maxNR) maxNR = nr;
            }
        });
        // Fallback legacy: cargo.niveles { [gesId]: { NP, NC } }
        if (maxNR === 0 && cargo.niveles) {
            Object.values(cargo.niveles).forEach(n => {
                const nr = (n.NP || (n.ND || 0) * (n.NE || 0) || 0) * (n.NC || 0);
                if (nr > maxNR) maxNR = nr;
            });
        }
        if (maxNR >= 600) return 'v';
        if (maxNR >= 150) return 'iv';
        if (maxNR >= 40) return 'iii';
        if (maxNR >= 20) return 'ii';
        return 'i';
    }

    /**
     * Escape HTML entities
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    /**
     * Destroy the editor instance
     */
    destroy() {
        if (this.editor) {
            this.editor.clear();
            this.editor = null;
        }
        this.nodeCargoMap = {};
        this.placedCargoIds.clear();
    }
}
