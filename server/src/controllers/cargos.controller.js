/**
 * Cargos Controller - Sprint 2
 * Maneja consultas de cargos y riesgos para el dashboard
 */

import db from '../config/database.js';
import { EXAM_DETAILS, formatearPeriodicidad } from '../config/exam-details-config.js';
import riesgosService from '../services/riesgos.service.js';

/**
 * Get all cargos for an empresa (from all documents)
 * Returns cargos with their risk count and NR levels
 */
export async function getCargosByEmpresa(req, res) {
    try {
        const { empresaId } = req.params;

        // Query cargos from all documents of this empresa
        const cargos = await db('cargos_documento')
            .join('documentos_generados', 'cargos_documento.documento_id', 'documentos_generados.id')
            .where('documentos_generados.empresa_id', empresaId)
            .select(
                'cargos_documento.id',
                'cargos_documento.nombre_cargo',
                'cargos_documento.area',
                'cargos_documento.zona',
                'cargos_documento.num_trabajadores',
                'cargos_documento.descripcion_tareas',
                'cargos_documento.trabaja_alturas',
                'cargos_documento.manipula_alimentos',
                'cargos_documento.conduce_vehiculo',
                'cargos_documento.trabaja_espacios_confinados',
                'cargos_documento.tareas_rutinarias',
                'cargos_documento.documento_id',
                'documentos_generados.created_at as documento_fecha',
                'documentos_generados.estado as documento_estado'
            )
            .orderBy('cargos_documento.created_at', 'desc');

        // For each cargo, get risk summary
        const cargosConRiesgos = await Promise.all(
            cargos.map(async (cargo) => {
                // ✅ Get riesgos for this cargo (WITH all data from catalogo_ges)
                const riesgosDB = await db('riesgos_cargo')
                    .leftJoin('catalogo_ges', 'riesgos_cargo.ges_id', 'catalogo_ges.id')
                    .where('riesgos_cargo.cargo_id', cargo.id)
                    .select(
                        'riesgos_cargo.id',
                        'riesgos_cargo.tipo_riesgo',
                        'riesgos_cargo.descripcion_riesgo',
                        'riesgos_cargo.nivel_deficiencia',
                        'riesgos_cargo.nivel_exposicion',
                        'riesgos_cargo.nivel_consecuencia',
                        'riesgos_cargo.ges_id',
                        'catalogo_ges.examenes_medicos',
                        'catalogo_ges.epp_sugeridos',
                        'catalogo_ges.aptitudes_requeridas',
                        'catalogo_ges.condiciones_incompatibles',
                        'catalogo_ges.nombre as ges_nombre'
                    );

                // ✅ Reconstruir estructura para servicio de riesgos (MISMA LÓGICA QUE VIEWER)
                const cargoParaServicio = {
                    cargoName: cargo.nombre_cargo,
                    area: cargo.area,
                    descripcionTareas: cargo.descripcion_tareas,
                    zona: cargo.zona,
                    numTrabajadores: cargo.num_trabajadores,
                    tareasRutinarias: cargo.tareas_rutinarias,
                    trabajaAlturas: cargo.trabaja_alturas,
                    manipulaAlimentos: cargo.manipula_alimentos,
                    conduceVehiculo: cargo.conduce_vehiculo,
                    trabajaEspaciosConfinados: cargo.trabaja_espacios_confinados,
                    gesSeleccionados: riesgosDB.map(riesgo => ({
                        riesgo: riesgo.tipo_riesgo,
                        ges: riesgo.descripcion_riesgo,
                        examenesMedicos: riesgo.examenes_medicos,
                        eppSugeridos: riesgo.epp_sugeridos,
                        aptitudesRequeridas: riesgo.aptitudes_requeridas,
                        condicionesIncompatibles: riesgo.condiciones_incompatibles,
                        niveles: {
                            deficiencia: { value: riesgo.nivel_deficiencia },
                            exposicion: { value: riesgo.nivel_exposicion },
                            consecuencia: { value: riesgo.nivel_consecuencia }
                        }
                    }))
                };

                // ✅ USAR SERVICIO DE RIESGOS (misma lógica que profesiograma viewer)
                const controles = riesgosService.consolidarControlesCargo(cargoParaServicio);

                // Calculate NR for each riesgo (for UI counts)
                const riesgosConNR = riesgosDB.map(r => {
                    const np = r.nivel_deficiencia * r.nivel_exposicion;
                    const nr = np * r.nivel_consecuencia;
                    return {
                        ...r,
                        np,
                        nr,
                        nrNivel: calcularNivelNR(nr)
                    };
                });

                // Use NR from service metadata
                const nrMaximo = controles.metadata.nrMaximo;

                // Count risks by NR level
                const conteoNiveles = {
                    I: riesgosConNR.filter(r => r.nrNivel === 'I').length,
                    II: riesgosConNR.filter(r => r.nrNivel === 'II').length,
                    III: riesgosConNR.filter(r => r.nrNivel === 'III').length,
                    IV: riesgosConNR.filter(r => r.nrNivel === 'IV').length,
                    V: riesgosConNR.filter(r => r.nrNivel === 'V').length
                };

                // ✅ Formatear exámenes consolidados con DETALLES completos (MISMA LÓGICA QUE VIEWER)
                const examenesConsolidados = Array.from(controles.consolidado.examenes).map(codigoExamen => {
                    const examenDetalle = EXAM_DETAILS[codigoExamen];
                    return {
                        codigo: codigoExamen,
                        nombre: examenDetalle?.fullName || codigoExamen,
                        periodicidadMeses: examenDetalle?.periodicidadMeses || 12,
                        periodicidad: formatearPeriodicidad(examenDetalle?.periodicidadMeses || 12),
                        prioridad: 1, // All exams from service are required
                        tipo: 'Obligatorio'
                    };
                }).sort((a, b) => a.nombre.localeCompare(b.nombre));

                // 🐛 DEBUG: Log exámenes consolidados
                console.log(`🔬 [BACKEND] Cargo "${cargo.nombre_cargo}":`, {
                    riesgosCount: riesgosDB.length,
                    examenesCount: examenesConsolidados.length,
                    examenes: examenesConsolidados.map(e => e.codigo),
                    source: 'riesgosService.consolidarControlesCargo'
                });

                return {
                    ...cargo,
                    riesgosCount: riesgosDB.length,
                    nrMaximo,
                    nrNivelMaximo: calcularNivelNR(nrMaximo),
                    conteoNiveles,
                    togglesActivos: getTogglesActivos(cargo),
                    examenesMedicos: examenesConsolidados // ✅ Usando MISMA LÓGICA que viewer
                };
            })
        );

        res.json({
            success: true,
            cargos: cargosConRiesgos,
            total: cargosConRiesgos.length
        });

    } catch (error) {
        console.error('Error al obtener cargos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cargar los cargos',
            message: error.message
        });
    }
}

/**
 * Get detailed cargo with all riesgos and controls
 */
export async function getCargoDetalle(req, res) {
    try {
        const { cargoId } = req.params;

        // Get cargo
        const cargo = await db('cargos_documento')
            .where('id', cargoId)
            .first();

        if (!cargo) {
            return res.status(404).json({
                success: false,
                error: 'Cargo no encontrado'
            });
        }

        // Get all riesgos with full details
        const riesgos = await db('riesgos_cargo')
            .where('cargo_id', cargoId)
            .select('*');

        // Calculate NR and categorize
        const riesgosDetallados = riesgos.map(r => {
            const np = r.nivel_deficiencia * r.nivel_exposicion;
            const nr = np * r.nivel_consecuencia;
            const nrNivel = calcularNivelNR(nr);

            return {
                id: r.id,
                tipoRiesgo: r.tipo_riesgo,
                descripcion: r.descripcion_riesgo,
                niveles: {
                    nd: r.nivel_deficiencia,
                    ne: r.nivel_exposicion,
                    nc: r.nivel_consecuencia,
                    np,
                    nr,
                    nrNivel
                },
                interpretacionNR: getInterpretacionNR(nr),
                controles: buildControlesFromRiesgo(r),
                esCritico: nrNivel === 'IV' || nrNivel === 'V'
            };
        });

        // Group by tipo_riesgo for GTC-45 view
        const riesgosPorTipo = {};
        riesgosDetallados.forEach(r => {
            if (!riesgosPorTipo[r.tipoRiesgo]) {
                riesgosPorTipo[r.tipoRiesgo] = [];
            }
            riesgosPorTipo[r.tipoRiesgo].push(r);
        });

        // Get peligros criticos (NR IV-V)
        const peligrosCriticos = riesgosDetallados.filter(r => r.esCritico);

        res.json({
            success: true,
            cargo: {
                id: cargo.id,
                nombre: cargo.nombre_cargo,
                area: cargo.area,
                zona: cargo.zona,
                numTrabajadores: cargo.num_trabajadores,
                descripcion: cargo.descripcion_tareas,
                toggles: {
                    trabajaAlturas: cargo.trabaja_alturas,
                    manipulaAlimentos: cargo.manipula_alimentos,
                    conduceVehiculo: cargo.conduce_vehiculo,
                    trabajaEspaciosConfinados: cargo.trabaja_espacios_confinados,
                    tareasRutinarias: cargo.tareas_rutinarias
                }
            },
            riesgos: riesgosDetallados,
            riesgosPorTipo,
            peligrosCriticos,
            resumen: {
                totalRiesgos: riesgos.length,
                nrMaximo: riesgosDetallados.length > 0
                    ? Math.max(...riesgosDetallados.map(r => r.niveles.nr))
                    : 0,
                conteoNiveles: {
                    I: riesgosDetallados.filter(r => r.niveles.nrNivel === 'I').length,
                    II: riesgosDetallados.filter(r => r.niveles.nrNivel === 'II').length,
                    III: riesgosDetallados.filter(r => r.niveles.nrNivel === 'III').length,
                    IV: riesgosDetallados.filter(r => r.niveles.nrNivel === 'IV').length,
                    V: riesgosDetallados.filter(r => r.niveles.nrNivel === 'V').length
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener detalle del cargo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cargar el detalle del cargo',
            message: error.message
        });
    }
}

/**
 * Get matriz GTC-45 for all cargos of empresa
 * Groups all risks by category for consolidated view
 */
export async function getMatrizGTC45(req, res) {
    try {
        const { empresaId } = req.params;

        // Get documento_id and preview_urls for Excel export
        const documento = await db('documentos_generados')
            .where('empresa_id', empresaId)
            .orderBy('created_at', 'desc')
            .first('id', 'preview_urls', 'created_at', 'updated_at');

        // Get all riesgos from all cargos of this empresa
        const riesgos = await db('riesgos_cargo')
            .join('cargos_documento', 'riesgos_cargo.cargo_id', 'cargos_documento.id')
            .join('documentos_generados', 'cargos_documento.documento_id', 'documentos_generados.id')
            .where('documentos_generados.empresa_id', empresaId)
            .select(
                'riesgos_cargo.*',
                'cargos_documento.nombre_cargo',
                'cargos_documento.area'
            );

        // Calculate NR and organize by type
        const categorias = {};
        const COLORES_RIESGO = {
            'Biologico': '#10b981',
            'Fisico': '#3b82f6',
            'Quimico': '#f59e0b',
            'Psicosocial': '#8b5cf6',
            'Biomecanico': '#ec4899',
            'Condiciones de seguridad': '#ef4444',
            'Fenomenos naturales': '#6b7280'
        };

        riesgos.forEach(r => {
            const np = r.nivel_deficiencia * r.nivel_exposicion;
            const nr = np * r.nivel_consecuencia;
            const nrNivel = calcularNivelNR(nr);

            if (!categorias[r.tipo_riesgo]) {
                categorias[r.tipo_riesgo] = {
                    nombre: r.tipo_riesgo,
                    color: COLORES_RIESGO[r.tipo_riesgo] || '#6b7280',
                    peligros: [],
                    conteoNiveles: { I: 0, II: 0, III: 0, IV: 0, V: 0 }
                };
            }

            categorias[r.tipo_riesgo].peligros.push({
                id: r.id,
                descripcion: r.descripcion_riesgo,
                cargo: r.nombre_cargo,
                area: r.area,
                niveles: {
                    nd: r.nivel_deficiencia,
                    ne: r.nivel_exposicion,
                    nc: r.nivel_consecuencia,
                    np,
                    nr,
                    nrNivel
                },
                interpretacion: getInterpretacionNR(nr),
                controles: buildControlesFromRiesgo(r)
            });

            categorias[r.tipo_riesgo].conteoNiveles[nrNivel]++;
        });

        // Get critical alerts (NR IV-V)
        const alertasCriticas = riesgos
            .map(r => {
                const np = r.nivel_deficiencia * r.nivel_exposicion;
                const nr = np * r.nivel_consecuencia;
                const nrNivel = calcularNivelNR(nr);
                return { ...r, nr, nrNivel };
            })
            .filter(r => r.nrNivel === 'IV' || r.nrNivel === 'V')
            .map(r => ({
                descripcion: r.descripcion_riesgo,
                cargo: r.nombre_cargo,
                tipo: r.tipo_riesgo,
                nrNivel: r.nrNivel,
                nr: r.nr
            }));

        // Calculate summary metrics
        const todosNR = riesgos.map(r => {
            const np = r.nivel_deficiencia * r.nivel_exposicion;
            return np * r.nivel_consecuencia;
        });

        const resumen = {
            totalPeligros: riesgos.length,
            nrMaximo: todosNR.length > 0 ? Math.max(...todosNR) : 0,
            conteoNiveles: {
                I: todosNR.filter(nr => calcularNivelNR(nr) === 'I').length,
                II: todosNR.filter(nr => calcularNivelNR(nr) === 'II').length,
                III: todosNR.filter(nr => calcularNivelNR(nr) === 'III').length,
                IV: todosNR.filter(nr => calcularNivelNR(nr) === 'IV').length,
                V: todosNR.filter(nr => calcularNivelNR(nr) === 'V').length
            },
            alertasCriticas: alertasCriticas.length
        };

        // Extract Excel URL from preview_urls if available
        let excelUrl = null;
        if (documento && documento.preview_urls) {
            try {
                const previewUrls = typeof documento.preview_urls === 'string'
                    ? JSON.parse(documento.preview_urls)
                    : documento.preview_urls;
                excelUrl = previewUrls.matriz || null;
            } catch (e) {
                console.error('Error parsing preview_urls:', e);
            }
        }

        res.json({
            success: true,
            categorias: Object.values(categorias),
            alertasCriticas,
            resumen,
            documento: documento ? {
                id: documento.id,
                excelUrl,
                created_at: documento.created_at,
                updated_at: documento.updated_at
            } : null
        });

    } catch (error) {
        console.error('Error al obtener matriz GTC-45:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cargar la matriz GTC-45',
            message: error.message
        });
    }
}

// Helper functions

// ✅ REMOVED: consolidarExamenesMedicos function
// Now using riesgosService.consolidarControlesCargo for consistency with profesiograma viewer

function calcularNivelNR(nr) {
    if (nr >= 600) return 'V';
    if (nr >= 150) return 'IV';
    if (nr >= 40) return 'III';
    if (nr >= 20) return 'II';
    return 'I';
}

function getInterpretacionNR(nr) {
    if (nr >= 600) return 'Situacion critica - Intervencion urgente';
    if (nr >= 150) return 'Situacion alta - Corregir y adoptar medidas';
    if (nr >= 40) return 'Mejorar si es posible';
    if (nr >= 20) return 'Mantener medidas de control';
    return 'No intervenir, salvo justificacion';
}

function getTogglesActivos(cargo) {
    const toggles = [];
    if (cargo.trabaja_alturas) toggles.push('Alturas');
    if (cargo.manipula_alimentos) toggles.push('Alimentos');
    if (cargo.conduce_vehiculo) toggles.push('Vehiculo');
    if (cargo.trabaja_espacios_confinados) toggles.push('Espacios Conf.');
    return toggles;
}

function parseControles(controlesJson) {
    if (!controlesJson) return null;
    try {
        return typeof controlesJson === 'string'
            ? JSON.parse(controlesJson)
            : controlesJson;
    } catch {
        return null;
    }
}

/**
 * Build controles object from riesgo columns (controles_fuente, controles_medio, controles_individuo)
 * Maps to ISO 45001 hierarchy
 */
function buildControlesFromRiesgo(riesgo) {
    const controles = {
        eliminacion: [],
        sustitucion: [],
        ingenieria: [],
        administrativos: [],
        epp: []
    };

    // Parse controles_fuente (typically ingenieria/eliminacion)
    if (riesgo.controles_fuente) {
        const parsed = parseControles(riesgo.controles_fuente);
        if (Array.isArray(parsed)) {
            controles.ingenieria.push(...parsed);
        } else if (typeof parsed === 'string' && parsed.trim()) {
            controles.ingenieria.push(parsed);
        }
    }

    // Parse controles_medio (typically administrativos)
    if (riesgo.controles_medio) {
        const parsed = parseControles(riesgo.controles_medio);
        if (Array.isArray(parsed)) {
            controles.administrativos.push(...parsed);
        } else if (typeof parsed === 'string' && parsed.trim()) {
            controles.administrativos.push(parsed);
        }
    }

    // Parse controles_individuo (EPP)
    if (riesgo.controles_individuo) {
        const parsed = parseControles(riesgo.controles_individuo);
        if (Array.isArray(parsed)) {
            controles.epp.push(...parsed);
        } else if (typeof parsed === 'string' && parsed.trim()) {
            controles.epp.push(parsed);
        }
    }

    return controles;
}

/**
 * Get controls summary by hierarchy for empresa
 * Shows all controls organized by ISO 45001 hierarchy
 */
export async function getControlesByEmpresa(req, res) {
    try {
        const { empresaId } = req.params;

        // Get all riesgos from all cargos of this empresa
        const riesgos = await db('riesgos_cargo')
            .join('cargos_documento', 'riesgos_cargo.cargo_id', 'cargos_documento.id')
            .join('documentos_generados', 'cargos_documento.documento_id', 'documentos_generados.id')
            .where('documentos_generados.empresa_id', empresaId)
            .select(
                'riesgos_cargo.controles_fuente',
                'riesgos_cargo.controles_medio',
                'riesgos_cargo.controles_individuo',
                'riesgos_cargo.tipo_riesgo',
                'riesgos_cargo.descripcion_riesgo',
                'cargos_documento.nombre_cargo'
            );

        // Hierarchy of controls (ISO 45001)
        const JERARQUIA = [
            { key: 'eliminacion', nombre: 'Eliminacion', descripcion: 'Eliminar el peligro' },
            { key: 'sustitucion', nombre: 'Sustitucion', descripcion: 'Reemplazar el peligro' },
            { key: 'ingenieria', nombre: 'Controles de Ingenieria', descripcion: 'Aislar personas del peligro' },
            { key: 'administrativos', nombre: 'Controles Administrativos', descripcion: 'Cambiar la forma de trabajar' },
            { key: 'epp', nombre: 'EPP', descripcion: 'Proteger al trabajador' }
        ];

        // Consolidate controls by hierarchy
        const controlesPorJerarquia = {};
        JERARQUIA.forEach(j => {
            controlesPorJerarquia[j.key] = {
                ...j,
                controles: [],
                count: 0
            };
        });

        // Also track EPP separately for easy access
        const eppConsolidado = new Set();

        riesgos.forEach(r => {
            // Build controles from the 3 columns (fuente, medio, individuo)
            const controles = buildControlesFromRiesgo(r);
            if (!controles) return;

            // Process each hierarchy level
            if (controles.eliminacion && controles.eliminacion.length > 0) {
                controles.eliminacion.forEach(c => {
                    if (!controlesPorJerarquia.eliminacion.controles.find(x => x.control === c)) {
                        controlesPorJerarquia.eliminacion.controles.push({
                            control: c,
                            cargo: r.nombre_cargo,
                            riesgo: r.tipo_riesgo
                        });
                    }
                });
            }

            if (controles.sustitucion && controles.sustitucion.length > 0) {
                controles.sustitucion.forEach(c => {
                    if (!controlesPorJerarquia.sustitucion.controles.find(x => x.control === c)) {
                        controlesPorJerarquia.sustitucion.controles.push({
                            control: c,
                            cargo: r.nombre_cargo,
                            riesgo: r.tipo_riesgo
                        });
                    }
                });
            }

            if (controles.ingenieria && controles.ingenieria.length > 0) {
                controles.ingenieria.forEach(c => {
                    if (!controlesPorJerarquia.ingenieria.controles.find(x => x.control === c)) {
                        controlesPorJerarquia.ingenieria.controles.push({
                            control: c,
                            cargo: r.nombre_cargo,
                            riesgo: r.tipo_riesgo
                        });
                    }
                });
            }

            if (controles.administrativos && controles.administrativos.length > 0) {
                controles.administrativos.forEach(c => {
                    if (!controlesPorJerarquia.administrativos.controles.find(x => x.control === c)) {
                        controlesPorJerarquia.administrativos.controles.push({
                            control: c,
                            cargo: r.nombre_cargo,
                            riesgo: r.tipo_riesgo
                        });
                    }
                });
            }

            if (controles.epp && controles.epp.length > 0) {
                controles.epp.forEach(c => {
                    eppConsolidado.add(c);
                    if (!controlesPorJerarquia.epp.controles.find(x => x.control === c)) {
                        controlesPorJerarquia.epp.controles.push({
                            control: c,
                            cargo: r.nombre_cargo,
                            riesgo: r.tipo_riesgo
                        });
                    }
                });
            }
        });

        // Update counts
        Object.keys(controlesPorJerarquia).forEach(key => {
            controlesPorJerarquia[key].count = controlesPorJerarquia[key].controles.length;
        });

        // Calculate totals
        const totalControles = Object.values(controlesPorJerarquia)
            .reduce((sum, j) => sum + j.count, 0);

        res.json({
            success: true,
            jerarquia: Object.values(controlesPorJerarquia),
            eppConsolidado: Array.from(eppConsolidado),
            resumen: {
                totalControles,
                eliminacion: controlesPorJerarquia.eliminacion.count,
                sustitucion: controlesPorJerarquia.sustitucion.count,
                ingenieria: controlesPorJerarquia.ingenieria.count,
                administrativos: controlesPorJerarquia.administrativos.count,
                epp: controlesPorJerarquia.epp.count
            }
        });

    } catch (error) {
        console.error('Error al obtener controles:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cargar los controles',
            message: error.message
        });
    }
}

/**
 * Create new cargo
 * POST /api/cargos
 */
export async function createCargo(req, res) {
    const trx = await db.transaction();

    try {
        const {
            empresa_id,
            nombre,
            area,
            zona,
            descripcion,
            numPersonas,
            tareasRutinarias,
            trabajaAlturas,
            manipulaAlimentos,
            conduceVehiculo,
            trabajaEspaciosConfinados,
            riesgosSeleccionados,
            niveles,
            controles
        } = req.body;

        // Validate required fields
        if (!nombre || !area || !zona || !empresa_id) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, área, zona y empresa_id son requeridos'
            });
        }

        // Get or create documento for this empresa
        let documento = await trx('documentos_generados')
            .where({ empresa_id, tipo_documento: 'matriz_riesgos' })
            .first();

        if (!documento) {
            // Create new documento
            const [documentoId] = await trx('documentos_generados').insert({
                empresa_id,
                tipo_documento: 'matriz_riesgos',
                estado: 'draft',
                preview_urls: JSON.stringify({}),
                created_at: new Date(),
                updated_at: new Date()
            });
            documento = { id: documentoId };
        }

        // Insert cargo
        const [cargoId] = await trx('cargos_documento').insert({
            documento_id: documento.id,
            nombre_cargo: nombre,
            area,
            zona,
            num_trabajadores: numPersonas || 1,
            descripcion_tareas: descripcion || '',
            trabaja_alturas: trabajaAlturas || false,
            manipula_alimentos: manipulaAlimentos || false,
            conduce_vehiculo: conduceVehiculo || false,
            trabaja_espacios_confinados: trabajaEspaciosConfinados || false,
            tareas_rutinarias: tareasRutinarias || false,
            created_at: new Date()
        });

        // Insert riesgos and their controles
        if (riesgosSeleccionados && riesgosSeleccionados.length > 0) {
            for (const riesgo of riesgosSeleccionados) {
                const gesId = riesgo.id_ges || riesgo.idGes || riesgo.id;
                const nivelData = niveles[gesId] || { ND: 1, NE: 1, NC: 10 };
                const controlData = controles[gesId] || { fuente: '', medio: '', individuo: '' };

                // Insert riesgo
                const [riesgoId] = await trx('riesgos_cargo').insert({
                    cargo_id: cargoId,
                    tipo_riesgo: riesgo.categoria || 'Otros',
                    descripcion_riesgo: riesgo.nombre,
                    nivel_deficiencia: nivelData.ND,
                    nivel_exposicion: nivelData.NE,
                    nivel_consecuencia: nivelData.NC,
                    ges_id: gesId,
                    created_at: new Date()
                });

                // Insert controles if any
                const controlesArr = [];
                if (controlData.fuente) controlesArr.push({ fuente: controlData.fuente });
                if (controlData.medio) controlesArr.push({ medio: controlData.medio });
                if (controlData.individuo) controlesArr.push({ individuo: controlData.individuo });

                for (const control of controlesArr) {
                    await trx('controles_existentes').insert({
                        riesgo_id: riesgoId,
                        ...control,
                        created_at: new Date()
                    });
                }
            }
        }

        await trx.commit();

        res.status(201).json({
            success: true,
            message: 'Cargo creado exitosamente',
            cargo: {
                id: cargoId,
                nombre,
                area,
                zona
            }
        });

    } catch (error) {
        await trx.rollback();
        console.error('Error al crear cargo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear el cargo',
            message: error.message
        });
    }
}

/**
 * Update cargo
 * PUT /api/cargos/:cargoId
 */
export async function updateCargo(req, res) {
    const trx = await db.transaction();

    try {
        const { cargoId } = req.params;
        const {
            nombre,
            area,
            zona,
            descripcion,
            numPersonas,
            tareasRutinarias,
            trabajaAlturas,
            manipulaAlimentos,
            conduceVehiculo,
            trabajaEspaciosConfinados,
            riesgosSeleccionados,
            niveles,
            controles,
            pendingApprovals,
            estado_aprobacion
        } = req.body;

        // Update cargo basic info
        await trx('cargos_documento')
            .where('id', cargoId)
            .update({
                nombre_cargo: nombre,
                area,
                zona,
                num_trabajadores: numPersonas || 1,
                descripcion_tareas: descripcion || '',
                trabaja_alturas: trabajaAlturas || false,
                manipula_alimentos: manipulaAlimentos || false,
                conduce_vehiculo: conduceVehiculo || false,
                trabaja_espacios_confinados: trabajaEspaciosConfinados || false,
                tareas_rutinarias: tareasRutinarias || false,
                updated_at: new Date()
            });

        // Delete existing riesgos and controles
        const existingRiesgos = await trx('riesgos_cargo')
            .where('cargo_id', cargoId)
            .select('id');

        for (const riesgo of existingRiesgos) {
            await trx('controles_existentes').where('riesgo_id', riesgo.id).del();
        }
        await trx('riesgos_cargo').where('cargo_id', cargoId).del();

        // Insert updated riesgos and controles
        if (riesgosSeleccionados && riesgosSeleccionados.length > 0) {
            for (const riesgo of riesgosSeleccionados) {
                const gesId = riesgo.id_ges || riesgo.idGes || riesgo.id;
                const nivelData = niveles[gesId] || { ND: 1, NE: 1, NC: 10 };
                const controlData = controles[gesId] || { fuente: '', medio: '', individuo: '' };

                // Insert riesgo
                const [riesgoId] = await trx('riesgos_cargo').insert({
                    cargo_id: cargoId,
                    tipo_riesgo: riesgo.categoria || 'Otros',
                    descripcion_riesgo: riesgo.nombre,
                    nivel_deficiencia: nivelData.ND,
                    nivel_exposicion: nivelData.NE,
                    nivel_consecuencia: nivelData.NC,
                    ges_id: gesId,
                    estado_aprobacion: estado_aprobacion || 'aprobado',
                    created_at: new Date()
                });

                // Insert controles if any
                const controlesArr = [];
                if (controlData.fuente) controlesArr.push({ fuente: controlData.fuente });
                if (controlData.medio) controlesArr.push({ medio: controlData.medio });
                if (controlData.individuo) controlesArr.push({ individuo: controlData.individuo });

                for (const control of controlesArr) {
                    await trx('controles_existentes').insert({
                        riesgo_id: riesgoId,
                        ...control,
                        created_at: new Date()
                    });
                }
            }
        }

        await trx.commit();

        res.json({
            success: true,
            message: 'Cargo actualizado exitosamente',
            pendingApprovals: pendingApprovals || []
        });

    } catch (error) {
        await trx.rollback();
        console.error('Error al actualizar cargo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el cargo',
            message: error.message
        });
    }
}

export default {
    getCargosByEmpresa,
    getCargoDetalle,
    getMatrizGTC45,
    getControlesByEmpresa,
    createCargo,
    updateCargo
};
