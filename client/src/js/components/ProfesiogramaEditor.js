/**
 * ProfesiogramaEditor.js
 * Sprint 6 - Sistema Multi-Rol
 *
 * Componente para edición inline de exámenes médicos por médico SST
 *
 * FEATURES:
 * - Edición inline (no modales) para mejor UX
 * - Validación frontend que replica backend Joi
 * - Checkboxes: Ingreso, Periódico, Retiro
 * - Campo justificación obligatorio (min 20 chars)
 * - Select periodicidad con opciones válidas
 * - Confirmación antes de guardar cambios
 * - Indicadores visuales de cambios pendientes
 * - Integración con API backend /api/medico/profesiograma
 *
 * CUMPLIMIENTO SST:
 * - Resolución 2346/2007 (exámenes ocupacionales)
 * - Decreto 1072/2015 (sistema de gestión SST)
 */

import apiClient from '../utils/apiClient.js';

class ProfesiogramaEditor {
    constructor() {
        this.empresaId = null;
        this.cargos = [];
        this.cargosPendientes = new Map(); // cargo_id -> datos modificados
        this.isLoading = false;

        this.PERIODICIDADES = [
            { value: 'unico', label: 'Único (solo una vez)' },
            { value: 'mensual', label: 'Mensual' },
            { value: 'trimestral', label: 'Trimestral' },
            { value: 'semestral', label: 'Semestral' },
            { value: 'anual', label: 'Anual' },
            { value: 'bienal', label: 'Bienal (cada 2 años)' },
            { value: 'trienal', label: 'Trienal (cada 3 años)' }
        ];

        this.TIPOS_EXAMEN = [
            { key: 'ingreso', label: 'Ingreso (Pre-ocupacional)' },
            { key: 'periodico', label: 'Periódico' },
            { key: 'retiro', label: 'Retiro (Post-ocupacional)' }
        ];
    }

    /**
     * Inicializar editor con datos de la empresa
     */
    async init(empresaId) {
        this.empresaId = empresaId;
        await this.cargarProfesiograma();
        this.renderEditor();
        this.attachEventListeners();
    }

    /**
     * Cargar profesiograma desde API
     */
    async cargarProfesiograma() {
        try {
            this.showLoading(true);

            const response = await apiClient.get(`/api/medico/profesiograma/${this.empresaId}`);

            if (response.success) {
                this.cargos = response.profesiograma.cargos;
                console.log('✅ Profesiograma cargado:', this.cargos.length, 'cargos');
            } else {
                throw new Error(response.message || 'Error cargando profesiograma');
            }
        } catch (error) {
            console.error('❌ Error cargando profesiograma:', error);
            this.showError('Error cargando profesiograma. Por favor recargue la página.');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Renderizar editor completo
     */
    renderEditor() {
        const container = document.getElementById('profesiograma-editor-container');
        if (!container) {
            console.error('❌ Container #profesiograma-editor-container no encontrado');
            return;
        }

        // Agrupar cargos por área
        const cargosPorArea = this.agruparPorArea(this.cargos);

        container.innerHTML = `
            <div class="profesiograma-editor">
                <div class="editor-header">
                    <h2>Editor de Profesiograma</h2>
                    <p class="text-muted">Edite los exámenes médicos por cargo. Los cambios se guardarán al hacer clic en "Guardar Cambios".</p>
                    ${this.renderBotoneraAcciones()}
                </div>

                <div class="editor-content">
                    ${Object.entries(cargosPorArea).map(([area, cargos]) => `
                        <div class="area-section">
                            <h3 class="area-title">${area || 'Sin área asignada'}</h3>
                            ${cargos.map(cargo => this.renderCargoCard(cargo)).join('')}
                        </div>
                    `).join('')}
                </div>

                ${this.renderBotoneraAcciones()}
            </div>
        `;
    }

    /**
     * Renderizar botonera de acciones principales
     */
    renderBotoneraAcciones() {
        const pendientes = this.cargosPendientes.size;

        return `
            <div class="editor-actions">
                <button
                    id="btn-guardar-cambios"
                    class="btn btn--primary"
                    ${pendientes === 0 || this.isLoading ? 'disabled' : ''}>
                    <i data-lucide="save"></i>
                    Guardar Cambios ${pendientes > 0 ? `(${pendientes})` : ''}
                </button>
                <button
                    id="btn-cancelar-cambios"
                    class="btn btn--outline"
                    ${pendientes === 0 || this.isLoading ? 'disabled' : ''}>
                    <i data-lucide="x"></i>
                    Cancelar
                </button>
            </div>
        `;
    }

    /**
     * Renderizar tarjeta de cargo con exámenes editables
     */
    renderCargoCard(cargo) {
        const examenes = {
            ingreso: this.parseExamenes(cargo.examenes_ingreso),
            periodicos: this.parseExamenes(cargo.examenes_periodicos),
            retiro: this.parseExamenes(cargo.examenes_retiro)
        };

        const tieneCambios = this.cargosPendientes.has(cargo.id);

        return `
            <div class="cargo-card ${tieneCambios ? 'cargo-card--modified' : ''}" data-cargo-id="${cargo.id}">
                <div class="cargo-card__header">
                    <div>
                        <h4 class="cargo-card__title">${cargo.nombre_cargo}</h4>
                        <p class="cargo-card__meta">
                            ${cargo.num_trabajadores || 0} trabajador(es) •
                            ${examenes.ingreso.length + examenes.periodicos.length + examenes.retiro.length} exámenes totales
                        </p>
                    </div>
                    <button
                        class="btn btn--sm btn--outline btn-toggle-examenes"
                        data-cargo-id="${cargo.id}">
                        <i data-lucide="chevron-down"></i>
                        Ver Exámenes
                    </button>
                </div>

                <div class="cargo-card__body" style="display: none;">
                    <!-- Exámenes de Ingreso -->
                    <div class="examenes-section">
                        <div class="examenes-section__header">
                            <h5>📋 Exámenes de Ingreso (Pre-ocupacionales)</h5>
                            <button class="btn btn--sm btn--primary btn-agregar-examen"
                                    data-cargo-id="${cargo.id}"
                                    data-tipo="ingreso">
                                <i data-lucide="plus"></i> Agregar
                            </button>
                        </div>
                        <div class="examenes-list" data-tipo="ingreso">
                            ${examenes.ingreso.length > 0
                                ? examenes.ingreso.map((ex, idx) => this.renderExamenItem(cargo.id, 'ingreso', ex, idx)).join('')
                                : '<p class="text-muted">No hay exámenes de ingreso configurados</p>'}
                        </div>
                    </div>

                    <!-- Exámenes Periódicos -->
                    <div class="examenes-section">
                        <div class="examenes-section__header">
                            <h5>🔄 Exámenes Periódicos</h5>
                            <button class="btn btn--sm btn--primary btn-agregar-examen"
                                    data-cargo-id="${cargo.id}"
                                    data-tipo="periodicos">
                                <i data-lucide="plus"></i> Agregar
                            </button>
                        </div>
                        <div class="examenes-list" data-tipo="periodicos">
                            ${examenes.periodicos.length > 0
                                ? examenes.periodicos.map((ex, idx) => this.renderExamenItem(cargo.id, 'periodicos', ex, idx)).join('')
                                : '<p class="text-muted">⚠️ Se requiere al menos UN examen periódico por normativa SST</p>'}
                        </div>
                    </div>

                    <!-- Exámenes de Retiro -->
                    <div class="examenes-section">
                        <div class="examenes-section__header">
                            <h5>🚪 Exámenes de Retiro (Post-ocupacionales)</h5>
                            <button class="btn btn--sm btn--primary btn-agregar-examen"
                                    data-cargo-id="${cargo.id}"
                                    data-tipo="retiro">
                                <i data-lucide="plus"></i> Agregar
                            </button>
                        </div>
                        <div class="examenes-list" data-tipo="retiro">
                            ${examenes.retiro.length > 0
                                ? examenes.retiro.map((ex, idx) => this.renderExamenItem(cargo.id, 'retiro', ex, idx)).join('')
                                : '<p class="text-muted">No hay exámenes de retiro configurados</p>'}
                        </div>
                    </div>

                    <!-- Observaciones y Recomendaciones -->
                    <div class="cargo-notas">
                        <div class="form-group">
                            <label>Observaciones Médicas:</label>
                            <textarea
                                class="form-control input-observaciones"
                                data-cargo-id="${cargo.id}"
                                rows="3"
                                placeholder="Observaciones del médico SST sobre este cargo...">${cargo.observaciones_medicas || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Recomendaciones EPT:</label>
                            <textarea
                                class="form-control input-recomendaciones"
                                data-cargo-id="${cargo.id}"
                                rows="3"
                                placeholder="Recomendaciones de Elementos de Protección y Trabajo...">${cargo.recomendaciones_ept || ''}</textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderizar item de examen individual (inline editable)
     */
    renderExamenItem(cargoId, tipo, examen, index) {
        return `
            <div class="examen-item" data-index="${index}">
                <div class="examen-item__content">
                    <div class="form-group">
                        <label>Código (opcional):</label>
                        <input
                            type="text"
                            class="form-control input-examen-codigo"
                            data-cargo-id="${cargoId}"
                            data-tipo="${tipo}"
                            data-index="${index}"
                            value="${examen.codigo || ''}"
                            placeholder="Ej: AUDIO-001">
                    </div>

                    <div class="form-group">
                        <label>Nombre del Examen: <span class="required">*</span></label>
                        <input
                            type="text"
                            class="form-control input-examen-nombre"
                            data-cargo-id="${cargoId}"
                            data-tipo="${tipo}"
                            data-index="${index}"
                            value="${examen.nombre || ''}"
                            placeholder="Ej: Audiometría Tonal"
                            required>
                    </div>

                    <div class="form-group">
                        <label>Justificación Técnica: <span class="required">*</span></label>
                        <textarea
                            class="form-control input-examen-justificacion"
                            data-cargo-id="${cargoId}"
                            data-tipo="${tipo}"
                            data-index="${index}"
                            rows="2"
                            placeholder="Justificación según factores de riesgo (mín. 20 caracteres)"
                            required>${examen.justificacion || ''}</textarea>
                        <small class="text-muted">Mínimo 20 caracteres</small>
                    </div>

                    <div class="form-group">
                        <label>Periodicidad: <span class="required">*</span></label>
                        <select
                            class="form-control input-examen-periodicidad"
                            data-cargo-id="${cargoId}"
                            data-tipo="${tipo}"
                            data-index="${index}"
                            required>
                            ${this.PERIODICIDADES.map(p => `
                                <option value="${p.value}" ${examen.periodicidad === p.value ? 'selected' : ''}>
                                    ${p.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>
                            <input
                                type="checkbox"
                                class="input-examen-obligatorio"
                                data-cargo-id="${cargoId}"
                                data-tipo="${tipo}"
                                data-index="${index}"
                                ${examen.obligatorio !== false ? 'checked' : ''}>
                            Examen obligatorio por normativa
                        </label>
                    </div>
                </div>

                <div class="examen-item__actions">
                    <button
                        class="btn btn--sm btn--danger btn-eliminar-examen"
                        data-cargo-id="${cargoId}"
                        data-tipo="${tipo}"
                        data-index="${index}"
                        title="Eliminar examen">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Toggle de exámenes por cargo
        document.querySelectorAll('.btn-toggle-examenes').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cargoId = e.currentTarget.dataset.cargoId;
                const card = document.querySelector(`.cargo-card[data-cargo-id="${cargoId}"]`);
                const body = card.querySelector('.cargo-card__body');
                const icon = btn.querySelector('i');

                if (body.style.display === 'none') {
                    body.style.display = 'block';
                    icon.dataset.lucide = 'chevron-up';
                    btn.innerHTML = '<i data-lucide="chevron-up"></i> Ocultar';
                } else {
                    body.style.display = 'none';
                    icon.dataset.lucide = 'chevron-down';
                    btn.innerHTML = '<i data-lucide="chevron-down"></i> Ver Exámenes';
                }

                // Refresh Lucide icons
                if (window.lucide) window.lucide.createIcons();
            });
        });

        // Agregar examen
        document.querySelectorAll('.btn-agregar-examen').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cargoId = parseInt(e.currentTarget.dataset.cargoId);
                const tipo = e.currentTarget.dataset.tipo;
                this.agregarExamen(cargoId, tipo);
            });
        });

        // Guardar cambios
        const btnGuardar = document.getElementById('btn-guardar-cambios');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', () => this.guardarCambios());
        }

        // Cancelar cambios
        const btnCancelar = document.getElementById('btn-cancelar-cambios');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => this.cancelarCambios());
        }

        // Detectar cambios en inputs (delegación de eventos)
        document.addEventListener('input', (e) => {
            if (e.target.matches('.input-examen-codigo, .input-examen-nombre, .input-examen-justificacion, .input-examen-periodicidad, .input-examen-obligatorio, .input-observaciones, .input-recomendaciones')) {
                const cargoId = parseInt(e.target.dataset.cargoId);
                this.marcarCambioPendiente(cargoId);
            }
        });

        // Eliminar examen (delegación)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-eliminar-examen')) {
                const btn = e.target.closest('.btn-eliminar-examen');
                const cargoId = parseInt(btn.dataset.cargoId);
                const tipo = btn.dataset.tipo;
                const index = parseInt(btn.dataset.index);
                this.eliminarExamen(cargoId, tipo, index);
            }
        });
    }

    /**
     * Agregar nuevo examen
     */
    agregarExamen(cargoId, tipo) {
        const cargo = this.cargos.find(c => c.id === cargoId);
        if (!cargo) return;

        const examenes = this.parseExamenes(cargo[`examenes_${tipo}`]);
        const nuevoExamen = {
            codigo: '',
            nombre: '',
            justificacion: '',
            periodicidad: 'anual',
            obligatorio: true
        };

        examenes.push(nuevoExamen);
        cargo[`examenes_${tipo}`] = examenes;

        // Re-renderizar solo esa sección
        const card = document.querySelector(`.cargo-card[data-cargo-id="${cargoId}"]`);
        const lista = card.querySelector(`.examenes-list[data-tipo="${tipo}"]`);
        lista.innerHTML = examenes.map((ex, idx) => this.renderExamenItem(cargoId, tipo, ex, idx)).join('');

        this.marcarCambioPendiente(cargoId);

        // Refresh Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Eliminar examen
     */
    eliminarExamen(cargoId, tipo, index) {
        if (!confirm('¿Está seguro de eliminar este examen?')) return;

        const cargo = this.cargos.find(c => c.id === cargoId);
        if (!cargo) return;

        const examenes = this.parseExamenes(cargo[`examenes_${tipo}`]);
        examenes.splice(index, 1);
        cargo[`examenes_${tipo}`] = examenes;

        // Re-renderizar
        const card = document.querySelector(`.cargo-card[data-cargo-id="${cargoId}"]`);
        const lista = card.querySelector(`.examenes-list[data-tipo="${tipo}"]`);

        if (examenes.length > 0) {
            lista.innerHTML = examenes.map((ex, idx) => this.renderExamenItem(cargoId, tipo, ex, idx)).join('');
        } else {
            const mensajes = {
                ingreso: 'No hay exámenes de ingreso configurados',
                periodicos: '⚠️ Se requiere al menos UN examen periódico por normativa SST',
                retiro: 'No hay exámenes de retiro configurados'
            };
            lista.innerHTML = `<p class="text-muted">${mensajes[tipo]}</p>`;
        }

        this.marcarCambioPendiente(cargoId);

        // Refresh Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Marcar cargo como modificado
     */
    marcarCambioPendiente(cargoId) {
        const cargo = this.cargos.find(c => c.id === cargoId);
        if (!cargo) return;

        // Recopilar datos actuales del DOM
        const card = document.querySelector(`.cargo-card[data-cargo-id="${cargoId}"]`);

        const datos = {
            id: cargoId,
            nombre_cargo: cargo.nombre_cargo,
            examenes_ingreso: this.recopilarExamenes(card, 'ingreso'),
            examenes_periodicos: this.recopilarExamenes(card, 'periodicos'),
            examenes_retiro: this.recopilarExamenes(card, 'retiro'),
            observaciones_medicas: card.querySelector('.input-observaciones')?.value || '',
            recomendaciones_ept: card.querySelector('.input-recomendaciones')?.value || ''
        };

        this.cargosPendientes.set(cargoId, datos);

        // Marcar visualmente
        card.classList.add('cargo-card--modified');

        // Actualizar botones
        this.actualizarBotones();
    }

    /**
     * Recopilar exámenes desde el DOM
     */
    recopilarExamenes(card, tipo) {
        const items = card.querySelectorAll(`.examenes-list[data-tipo="${tipo}"] .examen-item`);
        const examenes = [];

        items.forEach((item, index) => {
            const examen = {
                codigo: item.querySelector('.input-examen-codigo')?.value || '',
                nombre: item.querySelector('.input-examen-nombre')?.value || '',
                justificacion: item.querySelector('.input-examen-justificacion')?.value || '',
                periodicidad: item.querySelector('.input-examen-periodicidad')?.value || 'anual',
                obligatorio: item.querySelector('.input-examen-obligatorio')?.checked !== false
            };

            examenes.push(examen);
        });

        return examenes;
    }

    /**
     * Guardar cambios en backend
     */
    async guardarCambios() {
        if (this.cargosPendientes.size === 0) {
            alert('No hay cambios pendientes');
            return;
        }

        // Solicitar justificación global
        const justificacion = prompt(
            'Justificación de modificaciones (mín. 20 caracteres):\n\n' +
            'Esta justificación quedará registrada en auditoría.',
            ''
        );

        if (!justificacion) {
            return; // Usuario canceló
        }

        if (justificacion.length < 20) {
            alert('La justificación debe tener al menos 20 caracteres');
            return;
        }

        // Validar exámenes antes de enviar
        const errores = this.validarExamenes();
        if (errores.length > 0) {
            alert('Errores de validación:\n\n' + errores.join('\n'));
            return;
        }

        // Confirmar
        if (!confirm(`¿Guardar cambios en ${this.cargosPendientes.size} cargo(s)?`)) {
            return;
        }

        try {
            this.showLoading(true);

            const cargosArray = Array.from(this.cargosPendientes.values()).map(cargo => ({
                ...cargo,
                justificacion_modificacion: justificacion
            }));

            const response = await apiClient.put(
                `/api/medico/profesiograma/${this.empresaId}`,
                { cargos: cargosArray }
            );

            if (response.success) {
                alert(`✅ ${response.message}`);
                this.cargosPendientes.clear();
                await this.cargarProfesiograma();
                this.renderEditor();
                this.attachEventListeners();

                // Refresh Lucide icons
                if (window.lucide) window.lucide.createIcons();
            } else {
                throw new Error(response.message || 'Error guardando cambios');
            }
        } catch (error) {
            console.error('❌ Error guardando cambios:', error);
            alert('Error guardando cambios: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Cancelar cambios pendientes
     */
    cancelarCambios() {
        if (!confirm(`¿Descartar cambios en ${this.cargosPendientes.size} cargo(s)?`)) {
            return;
        }

        this.cargosPendientes.clear();
        this.renderEditor();
        this.attachEventListeners();

        // Refresh Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Validar exámenes antes de enviar
     */
    validarExamenes() {
        const errores = [];

        this.cargosPendientes.forEach((datos, cargoId) => {
            const cargo = datos.nombre_cargo || `Cargo ID ${cargoId}`;

            // Validar que haya al menos un examen periódico
            if (datos.examenes_periodicos.length === 0) {
                errores.push(`${cargo}: Debe tener al menos UN examen periódico (normativa SST)`);
            }

            // Validar campos obligatorios de cada examen
            ['examenes_ingreso', 'examenes_periodicos', 'examenes_retiro'].forEach(tipo => {
                datos[tipo].forEach((examen, idx) => {
                    if (!examen.nombre || examen.nombre.trim().length < 3) {
                        errores.push(`${cargo} (${tipo}[${idx}]): Nombre del examen inválido`);
                    }
                    if (!examen.justificacion || examen.justificacion.trim().length < 20) {
                        errores.push(`${cargo} (${tipo}[${idx}]): Justificación debe tener mín. 20 caracteres`);
                    }
                });
            });
        });

        return errores;
    }

    /**
     * Actualizar estado de botones
     */
    actualizarBotones() {
        const btnGuardar = document.getElementById('btn-guardar-cambios');
        const btnCancelar = document.getElementById('btn-cancelar-cambios');
        const pendientes = this.cargosPendientes.size;

        if (btnGuardar) {
            btnGuardar.disabled = pendientes === 0 || this.isLoading;
            btnGuardar.innerHTML = `
                <i data-lucide="save"></i>
                Guardar Cambios ${pendientes > 0 ? `(${pendientes})` : ''}
            `;
        }

        if (btnCancelar) {
            btnCancelar.disabled = pendientes === 0 || this.isLoading;
        }

        // Refresh Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }

    /**
     * Helpers
     */
    parseExamenes(jsonData) {
        if (Array.isArray(jsonData)) return jsonData;
        if (typeof jsonData === 'string') {
            try {
                return JSON.parse(jsonData);
            } catch {
                return [];
            }
        }
        return [];
    }

    agruparPorArea(cargos) {
        return cargos.reduce((acc, cargo) => {
            const area = cargo.area || 'Sin área';
            if (!acc[area]) acc[area] = [];
            acc[area].push(cargo);
            return acc;
        }, {});
    }

    showLoading(isLoading) {
        this.isLoading = isLoading;
        // TODO: Implementar overlay de loading
    }

    showError(message) {
        alert('❌ ' + message);
    }
}

export default ProfesiogramaEditor;
