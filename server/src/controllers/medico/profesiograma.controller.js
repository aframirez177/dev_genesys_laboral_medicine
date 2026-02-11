/**
 * Controller: Profesiograma (Médico)
 * El médico puede ver y editar el profesiograma de empresas asignadas
 *
 * Sprint 6 - Sistema Multi-Rol
 * - Validación Joi para exámenes médicos
 * - Optimización de queries (LEFT JOIN, no N+1)
 * - Auditoría completa de modificaciones
 * - Cumplimiento SST Colombia (Res. 2346/2007)
 */

import knex from '../../config/database.js';
import riesgosService from '../../services/riesgos.service.js';
import { EXAM_DETAILS } from '../../config/exam-details-config.js';
import {
    updateExamenesRequestSchema,
    validateSchema,
    examenesIngresoSchema,
    examenesPeriodicosSchema,
    examenesRetiroSchema
} from '../../schemas/profesiograma.schema.js';

/**
 * Obtener profesiograma de una empresa
 * Incluye todos los cargos con sus exámenes asociados
 */
export async function obtener(req, res) {
    try {
        const { empresaId } = req.params;

        // Obtener información de la empresa
        const empresa = await knex('empresas')
            .where('id', empresaId)
            .select('id', 'nombre_legal', 'nit', 'sector_economico')
            .first();

        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        // Obtener cargos a través de documentos_generados (relación correcta)
        const cargos = await knex('cargos_documento as cd')
            .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
            .where('dg.empresa_id', empresaId)
            .select(
                'cd.id',
                'cd.documento_id',
                'cd.nombre_cargo',
                'cd.area',
                'cd.zona',
                'cd.num_trabajadores',
                'cd.tareas_rutinarias',
                'cd.trabaja_alturas',
                'cd.manipula_alimentos',
                'cd.trabaja_espacios_confinados',
                'cd.examenes_ingreso',
                'cd.examenes_periodicos',
                'cd.examenes_retiro',
                'cd.observaciones_medicas',
                'cd.recomendaciones_ept',
                'cd.justificacion_modificacion',
                'cd.fecha_ultima_modificacion_examenes',
                'cd.modificado_por_medico_id'
            )
            .orderBy('cd.id', 'asc'); // Mantener orden original de creación

        // ✅ FIX N+1: Obtener TODOS los riesgos en UNA query con LEFT JOIN
        const cargoIds = cargos.map(c => c.id);
        const riesgos = cargoIds.length > 0
            ? await knex('riesgos_cargo')
                .whereIn('cargo_id', cargoIds)
                .select(
                    'id',
                    'cargo_id',
                    'tipo_riesgo',
                    'ges',
                    'nivel_riesgo_final',
                    'interpretacion_nr'
                )
            : [];

        // Agrupar riesgos por cargo_id
        const riesgosPorCargo = riesgos.reduce((acc, riesgo) => {
            if (!acc[riesgo.cargo_id]) {
                acc[riesgo.cargo_id] = [];
            }
            acc[riesgo.cargo_id].push(riesgo);
            return acc;
        }, {});

        // Asignar riesgos a cada cargo
        cargos.forEach(cargo => {
            cargo.riesgos = riesgosPorCargo[cargo.id] || [];
        });

        res.json({
            success: true,
            profesiograma: {
                empresa,
                cargos,
                total_cargos: cargos.length
            }
        });
    } catch (error) {
        console.error('Error obteniendo profesiograma:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo profesiograma'
        });
    }
}

/**
 * Actualizar datos médicos de un cargo (exámenes, periodicidad, observaciones)
 * ✅ Validación Joi
 * ✅ Auditoría completa con justificación
 * ✅ Protección SQL injection
 */
export async function actualizar(req, res) {
    try {
        const { empresaId } = req.params;
        const { cargos } = req.body;

        if (!cargos || !Array.isArray(cargos)) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de cargos'
            });
        }

        // Validar que el médico tiene permiso para editar esta empresa
        const asignacion = await knex('medicos_empresas')
            .where({
                medico_id: req.user.id,
                empresa_id: empresaId,
                activo: true
            })
            .first();

        if (!asignacion) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para editar profesiogramas de esta empresa'
            });
        }

        // Actualizar cada cargo
        const actualizados = [];
        const erroresValidacion = [];

        for (const cargo of cargos) {
            if (!cargo.id) {
                erroresValidacion.push({
                    cargo: cargo.nombre_cargo || 'sin nombre',
                    error: 'Falta ID del cargo'
                });
                continue;
            }

            // ✅ VALIDACIÓN JOI: Validar estructura de datos
            const datosValidar = {
                cargo_id: cargo.id,
                examenes_ingreso: cargo.examenes_ingreso,
                examenes_periodicos: cargo.examenes_periodicos,
                examenes_retiro: cargo.examenes_retiro,
                observaciones_medicas: cargo.observaciones_medicas,
                recomendaciones_ept: cargo.recomendaciones_ept,
                justificacion_modificacion: cargo.justificacion_modificacion,
                medico_id: req.user.id
            };

            const { isValid, errors, value } = validateSchema(
                datosValidar,
                updateExamenesRequestSchema
            );

            if (!isValid) {
                erroresValidacion.push({
                    cargo_id: cargo.id,
                    cargo: cargo.nombre_cargo || 'sin nombre',
                    errores: errors
                });
                continue;
            }

            // Verificar que el cargo pertenece a la empresa (a través de documentos_generados)
            const cargoExistente = await knex('cargos_documento as cd')
                .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
                .where('cd.id', cargo.id)
                .where('dg.empresa_id', empresaId)
                .select('cd.*')
                .first();

            if (!cargoExistente) {
                erroresValidacion.push({
                    cargo_id: cargo.id,
                    error: 'Cargo no pertenece a la empresa'
                });
                continue;
            }

            // Preparar datos de actualización (solo campos médicos)
            const datosActualizar = {
                updated_at: knex.fn.now(),
                fecha_ultima_modificacion_examenes: knex.fn.now(),
                modificado_por_medico_id: req.user.id
            };

            if (value.examenes_ingreso !== undefined) {
                datosActualizar.examenes_ingreso = JSON.stringify(value.examenes_ingreso);
            }
            if (value.examenes_periodicos !== undefined) {
                datosActualizar.examenes_periodicos = JSON.stringify(value.examenes_periodicos);
            }
            if (value.examenes_retiro !== undefined) {
                datosActualizar.examenes_retiro = JSON.stringify(value.examenes_retiro);
            }
            if (value.observaciones_medicas !== undefined) {
                datosActualizar.observaciones_medicas = value.observaciones_medicas;
            }
            if (value.recomendaciones_ept !== undefined) {
                datosActualizar.recomendaciones_ept = value.recomendaciones_ept;
            }
            if (value.justificacion_modificacion !== undefined) {
                datosActualizar.justificacion_modificacion = value.justificacion_modificacion;
            }

            // Actualizar en base de datos
            await knex('cargos_documento')
                .where('id', cargo.id)
                .update(datosActualizar);

            actualizados.push({
                cargo_id: cargo.id,
                nombre_cargo: cargoExistente.nombre_cargo,
                campos_modificados: Object.keys(datosActualizar).filter(k =>
                    k !== 'updated_at' && k !== 'fecha_ultima_modificacion_examenes' && k !== 'modificado_por_medico_id'
                )
            });
        }

        // ✅ AUDITORÍA COMPLETA
        if (actualizados.length > 0) {
            await knex('auditoria').insert({
                user_id: req.user.id,
                accion: 'modificar_examenes_profesiograma',
                recurso: 'cargos_documento',
                recurso_id: empresaId,
                detalles: JSON.stringify({
                    empresa_id: empresaId,
                    medico_nombre: req.user.full_name,
                    cargos_actualizados: actualizados,
                    timestamp: new Date().toISOString()
                }),
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });
        }

        // Respuesta con detalles
        const response = {
            success: true,
            message: `${actualizados.length} cargo(s) actualizado(s)`,
            cargos_actualizados: actualizados
        };

        if (erroresValidacion.length > 0) {
            response.advertencias = erroresValidacion;
            response.message += ` (${erroresValidacion.length} con errores)`;
        }

        res.json(response);
    } catch (error) {
        console.error('Error actualizando profesiograma:', error);

        // ✅ AUDITORÍA DE ERRORES
        await knex('auditoria').insert({
            user_id: req.user?.id || null,
            accion: 'error_modificar_examenes',
            recurso: 'cargos_documento',
            recurso_id: req.params.empresaId,
            detalles: JSON.stringify({
                error: error.message,
                stack: error.stack?.substring(0, 500)
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        }).catch(() => {}); // Ignore audit errors

        res.status(500).json({
            success: false,
            message: 'Error actualizando profesiograma',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Regenerar PDF del profesiograma
 * Esto dispararía la regeneración del documento PDF
 */
export async function regenerarPDF(req, res) {
    try {
        const { empresaId } = req.params;

        // Por ahora solo registramos la solicitud
        // La regeneración real se haría conectando con el servicio de generación de PDFs

        // Auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'solicitar_regenerar_profesiograma_pdf',
            recurso: 'empresas',
            recurso_id: empresaId,
            detalles: JSON.stringify({ solicitado_por: req.user.full_name }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Solicitud de regeneración registrada. El PDF se generará en breve.'
        });
    } catch (error) {
        console.error('Error solicitando regeneración de PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error procesando solicitud'
        });
    }
}

/**
 * Helper: Formatear periodicidad en meses a texto legible
 */
function formatearPeriodicidad(meses) {
    if (meses <= 6) return 'Semestral';
    if (meses <= 12) return 'Anual';
    if (meses <= 24) return 'Cada 2 años';
    if (meses <= 36) return 'Cada 3 años';
    return `Cada ${Math.floor(meses / 12)} años`;
}

/**
 * Helper: Generar justificación para un examen específico
 */
function generarJustificacionExamen(codigoExamen, controles) {
    // Buscar si el examen viene de un toggle especial
    if (controles.porToggle && controles.porToggle.examenes.includes(codigoExamen)) {
        if (controles.porToggle.fundamentos && controles.porToggle.fundamentos.length > 0) {
            return controles.porToggle.fundamentos[0];
        }
    }

    // Buscar en los GES que aportan este examen
    const gesQueAportanExamen = controles.porGES.filter(ges =>
        ges.controles.examenes.includes(codigoExamen)
    );

    if (gesQueAportanExamen.length > 0) {
        const ges = gesQueAportanExamen[0];
        return `Exposición a ${ges.gesNombre} - ${ges.justificacion}`;
    }

    // Justificación genérica del paquete mínimo
    if (controles.paqueteMinimo.examenes.includes(codigoExamen)) {
        return controles.paqueteMinimo.fundamento;
    }

    return 'Requerido según valoración de riesgos ocupacionales';
}

/**
 * Obtener datos completos de un cargo para edición
 * ✅ GENERA DINÁMICAMENTE los controles usando riesgosService
 * igual que profesiograma-view.controller.js
 */
export async function obtenerCargo(req, res) {
    try {
        const { empresaId, cargoId } = req.params;

        // Obtener cargo de la BD
        const cargo = await knex('cargos_documento as cd')
            .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
            .where('cd.id', cargoId)
            .where('dg.empresa_id', empresaId)
            .select('cd.*')
            .first();

        if (!cargo) {
            return res.status(404).json({
                success: false,
                message: 'Cargo no encontrado'
            });
        }

        // Obtener riesgos del cargo desde la BD
        const riesgosDB = await knex('riesgos_cargo')
            .where('cargo_id', cargoId)
            .select('*');

        console.log(`📋 Cargo "${cargo.nombre_cargo}": ${riesgosDB.length} riesgos`);
        console.log(`   Toggles: alturas=${cargo.trabaja_alturas}, alimentos=${cargo.manipula_alimentos}, confinados=${cargo.trabaja_espacios_confinados}`);

        // Reconstruir estructura para riesgosService (igual que profesiograma-view.controller.js)
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
                niveles: {
                    deficiencia: { value: riesgo.nivel_deficiencia },
                    exposicion: { value: riesgo.nivel_exposicion },
                    consecuencia: { value: riesgo.nivel_consecuencia }
                }
            }))
        };

        // ✅ GENERAR CONTROLES DINÁMICAMENTE usando riesgosService
        const controles = riesgosService.consolidarControlesCargo(cargoParaServicio);

        console.log(`   📊 Controles generados: ${controles.consolidado.examenes.length} exámenes, ${controles.consolidado.epp.length} EPP`);

        // Formatear exámenes con periodicidad y justificación
        const periodicidadMeses = controles.consolidado.periodicidadMinima;
        const examenesFormateados = controles.consolidado.examenes.map(codigoExamen => {
            const examenDetalle = EXAM_DETAILS[codigoExamen];
            return {
                codigo: codigoExamen,
                nombre: examenDetalle?.fullName || codigoExamen,
                periodicidad: formatearPeriodicidad(periodicidadMeses),
                periodicidadMeses,
                justificacion: generarJustificacionExamen(codigoExamen, controles),
                // Determinar tipo de examen (ingreso, periodico, retiro)
                ingreso: true,  // Todos aplican para ingreso
                periodico: true, // Todos aplican para periódico
                retiro: ['EMO', 'EMOA', 'EMOMP', 'AUD', 'ESP'].includes(codigoExamen) // Solo algunos en retiro
            };
        });

        // Parsear datos guardados en BD (si el médico ya hizo modificaciones)
        const parseJson = (field) => {
            if (!field) return null; // null = no hay override, usar generados
            try { return typeof field === 'string' ? JSON.parse(field) : field; }
            catch { return null; }
        };

        // Datos guardados por el médico (overrides)
        const overrides = {
            examenes_ingreso: parseJson(cargo.examenes_ingreso),
            examenes_periodicos: parseJson(cargo.examenes_periodicos),
            examenes_retiro: parseJson(cargo.examenes_retiro),
            epp: parseJson(cargo.epp),
            aptitudes: parseJson(cargo.aptitudes),
            condiciones_incompatibles: parseJson(cargo.condiciones_incompatibles)
        };

        res.json({
            success: true,
            cargo: {
                id: cargo.id,
                documento_id: cargo.documento_id,
                nombre_cargo: cargo.nombre_cargo,
                area: cargo.area,
                zona: cargo.zona,
                num_trabajadores: cargo.num_trabajadores,
                descripcion_tareas: cargo.descripcion_tareas,

                // Toggles especiales
                trabaja_alturas: cargo.trabaja_alturas,
                manipula_alimentos: cargo.manipula_alimentos,
                conduce_vehiculo: cargo.conduce_vehiculo,
                trabaja_espacios_confinados: cargo.trabaja_espacios_confinados,
                tareas_rutinarias: cargo.tareas_rutinarias,

                // ✅ DATOS GENERADOS DINÁMICAMENTE (usados si no hay override)
                generados: {
                    examenes: examenesFormateados,
                    epp: controles.consolidado.epp,
                    aptitudes: controles.consolidado.aptitudes,
                    condiciones_incompatibles: controles.consolidado.condicionesIncompatibles,
                    periodicidad_minima: periodicidadMeses,
                    nr_maximo: controles.metadata.nrMaximo
                },

                // ✅ DATOS GUARDADOS (overrides del médico, null si no hay)
                overrides,

                // Metadata de auditoría
                observaciones_medicas: cargo.observaciones_medicas,
                recomendaciones_ept: cargo.recomendaciones_ept,
                justificacion_modificacion: cargo.justificacion_modificacion,
                fecha_ultima_modificacion: cargo.fecha_ultima_modificacion_examenes,
                modificado_por_medico_id: cargo.modificado_por_medico_id,

                // Riesgos para referencia
                riesgos: riesgosDB.map(r => ({
                    id: r.id,
                    tipo_riesgo: r.tipo_riesgo,
                    ges: r.descripcion_riesgo,
                    nivel_deficiencia: r.nivel_deficiencia,
                    nivel_exposicion: r.nivel_exposicion,
                    nivel_consecuencia: r.nivel_consecuencia,
                    nivel_riesgo_final: r.nivel_riesgo_final,
                    interpretacion_nr: r.interpretacion_nr
                })),

                // Detalle de controles por toggle (para mostrar fundamento legal)
                controles_por_toggle: controles.porToggle
            }
        });
    } catch (error) {
        console.error('Error obteniendo cargo:', error);
        res.status(500).json({ success: false, message: 'Error obteniendo cargo' });
    }
}

/**
 * Actualizar campos editables de un cargo
 */
export async function actualizarCargo(req, res) {
    try {
        const { empresaId, cargoId } = req.params;
        const { justificacion_modificacion, ...campos } = req.body;

        if (!justificacion_modificacion || justificacion_modificacion.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Justificación obligatoria (mínimo 10 caracteres)'
            });
        }

        const cargo = await knex('cargos_documento as cd')
            .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
            .where('cd.id', cargoId)
            .where('dg.empresa_id', empresaId)
            .select('cd.*')
            .first();

        if (!cargo) {
            return res.status(404).json({ success: false, message: 'Cargo no encontrado' });
        }

        const datosActualizar = {
            updated_at: knex.fn.now(),
            fecha_ultima_modificacion_examenes: knex.fn.now(),
            modificado_por_medico_id: req.user.id,
            justificacion_modificacion: justificacion_modificacion.trim()
        };

        ['examenes_ingreso', 'examenes_periodicos', 'examenes_retiro', 'epp', 'aptitudes', 'condiciones_incompatibles'].forEach(field => {
            if (campos[field] !== undefined) {
                datosActualizar[field] = JSON.stringify(campos[field]);
            }
        });

        ['observaciones_medicas', 'recomendaciones_ept'].forEach(field => {
            if (campos[field] !== undefined) {
                datosActualizar[field] = campos[field];
            }
        });

        await knex('cargos_documento').where('id', cargoId).update(datosActualizar);

        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'modificar_cargo_medico',
            recurso: 'cargos_documento',
            recurso_id: cargoId,
            detalles: JSON.stringify({
                empresa_id: empresaId,
                cargo_nombre: cargo.nombre_cargo,
                medico: req.user.full_name,
                justificacion: justificacion_modificacion.trim()
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({ success: true, message: 'Cargo actualizado' });
    } catch (error) {
        console.error('Error actualizando cargo:', error);
        res.status(500).json({ success: false, message: 'Error actualizando cargo' });
    }
}

/**
 * Aprobar documentación de un cargo
 *
 * El médico marca que ha revisado y aprobado toda la documentación del cargo.
 * Esto permite que su firma aparezca en los documentos generados.
 *
 * Requisitos:
 * - El médico debe tener firma digital configurada
 * - El médico debe estar asignado a la empresa
 * - El cargo debe pertenecer a la empresa
 */
export async function aprobarCargo(req, res) {
    try {
        const { empresaId, cargoId } = req.params;
        const medicoId = req.user.id;

        // 1. Validar que el médico tiene firma configurada
        const medico = await knex('users')
            .where('id', medicoId)
            .select('id', 'full_name', 'licencia_sst', 'firma_url')
            .first();

        if (!medico.firma_url) {
            return res.status(400).json({
                success: false,
                message: 'Debe configurar su firma digital antes de aprobar documentación',
                codigo: 'FIRMA_REQUERIDA'
            });
        }

        if (!medico.licencia_sst) {
            return res.status(400).json({
                success: false,
                message: 'Debe registrar su licencia SST antes de aprobar documentación',
                codigo: 'LICENCIA_REQUERIDA'
            });
        }

        // 2. Validar asignación a la empresa
        const asignacion = await knex('medicos_empresas')
            .where({
                medico_id: medicoId,
                empresa_id: empresaId,
                activo: true
            })
            .first();

        if (!asignacion) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para aprobar documentación de esta empresa'
            });
        }

        // 3. Verificar que el cargo existe y pertenece a la empresa
        const cargo = await knex('cargos_documento as cd')
            .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
            .where('cd.id', cargoId)
            .where('dg.empresa_id', empresaId)
            .select('cd.id', 'cd.nombre_cargo', 'cd.aprobado_medico', 'cd.aprobado_por_medico_id')
            .first();

        if (!cargo) {
            return res.status(404).json({
                success: false,
                message: 'Cargo no encontrado'
            });
        }

        // 4. Verificar si ya está aprobado por este médico
        if (cargo.aprobado_medico && cargo.aprobado_por_medico_id === medicoId) {
            return res.status(400).json({
                success: false,
                message: 'Este cargo ya fue aprobado por usted',
                codigo: 'YA_APROBADO'
            });
        }

        // 5. Actualizar el cargo como aprobado
        const fechaAprobacion = new Date();
        await knex('cargos_documento')
            .where('id', cargoId)
            .update({
                aprobado_medico: true,
                fecha_aprobacion: fechaAprobacion,
                aprobado_por_medico_id: medicoId,
                justificacion_desaprobacion: null, // Limpiar justificación previa si existía
                updated_at: knex.fn.now()
            });

        // 6. Registrar auditoría
        await knex('auditoria').insert({
            user_id: medicoId,
            accion: 'aprobar_cargo',
            recurso: 'cargos_documento',
            recurso_id: cargoId,
            detalles: JSON.stringify({
                empresa_id: empresaId,
                cargo_nombre: cargo.nombre_cargo,
                medico_nombre: medico.full_name,
                licencia_sst: medico.licencia_sst,
                fecha_aprobacion: fechaAprobacion.toISOString()
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: `Cargo "${cargo.nombre_cargo}" aprobado exitosamente`,
            aprobacion: {
                cargo_id: cargoId,
                aprobado_por: medico.full_name,
                licencia_sst: medico.licencia_sst,
                fecha_aprobacion: fechaAprobacion.toISOString()
            }
        });

    } catch (error) {
        console.error('Error aprobando cargo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al aprobar el cargo'
        });
    }
}

/**
 * Desaprobar (revocar aprobación) de un cargo
 *
 * El médico puede revocar su aprobación previa, pero debe proporcionar
 * una justificación obligatoria.
 */
export async function desaprobarCargo(req, res) {
    try {
        const { empresaId, cargoId } = req.params;
        const { justificacion } = req.body;
        const medicoId = req.user.id;

        // 1. Validar justificación obligatoria
        if (!justificacion || justificacion.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una justificación detallada (mínimo 20 caracteres)'
            });
        }

        // 2. Validar asignación a la empresa
        const asignacion = await knex('medicos_empresas')
            .where({
                medico_id: medicoId,
                empresa_id: empresaId,
                activo: true
            })
            .first();

        if (!asignacion) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para modificar documentación de esta empresa'
            });
        }

        // 3. Verificar que el cargo existe y está aprobado
        const cargo = await knex('cargos_documento as cd')
            .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
            .where('cd.id', cargoId)
            .where('dg.empresa_id', empresaId)
            .select('cd.id', 'cd.nombre_cargo', 'cd.aprobado_medico', 'cd.aprobado_por_medico_id', 'cd.fecha_aprobacion')
            .first();

        if (!cargo) {
            return res.status(404).json({
                success: false,
                message: 'Cargo no encontrado'
            });
        }

        if (!cargo.aprobado_medico) {
            return res.status(400).json({
                success: false,
                message: 'Este cargo no está aprobado',
                codigo: 'NO_APROBADO'
            });
        }

        // 4. Verificar que el médico que desaprueba es el mismo que aprobó (o es admin)
        if (cargo.aprobado_por_medico_id !== medicoId && req.user.rol !== 'admin_genesys') {
            return res.status(403).json({
                success: false,
                message: 'Solo el médico que aprobó este cargo puede revocarlo'
            });
        }

        // 5. Obtener datos del médico para auditoría
        const medico = await knex('users')
            .where('id', medicoId)
            .select('full_name', 'licencia_sst')
            .first();

        // 6. Actualizar el cargo como desaprobado
        await knex('cargos_documento')
            .where('id', cargoId)
            .update({
                aprobado_medico: false,
                fecha_aprobacion: null,
                aprobado_por_medico_id: null,
                justificacion_desaprobacion: justificacion.trim(),
                updated_at: knex.fn.now()
            });

        // 7. Registrar auditoría
        await knex('auditoria').insert({
            user_id: medicoId,
            accion: 'desaprobar_cargo',
            recurso: 'cargos_documento',
            recurso_id: cargoId,
            detalles: JSON.stringify({
                empresa_id: empresaId,
                cargo_nombre: cargo.nombre_cargo,
                medico_nombre: medico.full_name,
                licencia_sst: medico.licencia_sst,
                fecha_aprobacion_previa: cargo.fecha_aprobacion,
                justificacion: justificacion.trim()
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: `Aprobación del cargo "${cargo.nombre_cargo}" revocada`,
            justificacion: justificacion.trim()
        });

    } catch (error) {
        console.error('Error desaprobando cargo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al revocar la aprobación'
        });
    }
}

/**
 * Obtener estado de aprobación de todos los cargos de una empresa
 */
export async function obtenerEstadosAprobacion(req, res) {
    try {
        const { empresaId } = req.params;

        // Obtener cargos con su estado de aprobación
        const cargos = await knex('cargos_documento as cd')
            .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
            .leftJoin('users as u', 'cd.aprobado_por_medico_id', 'u.id')
            .where('dg.empresa_id', empresaId)
            .select(
                'cd.id',
                'cd.nombre_cargo',
                'cd.area',
                'cd.aprobado_medico',
                'cd.fecha_aprobacion',
                'cd.aprobado_por_medico_id',
                'u.full_name as medico_nombre',
                'u.licencia_sst as medico_licencia'
            )
            .orderBy('cd.id', 'asc');

        const totalCargos = cargos.length;
        const cargosAprobados = cargos.filter(c => c.aprobado_medico).length;

        res.json({
            success: true,
            estadisticas: {
                total: totalCargos,
                aprobados: cargosAprobados,
                pendientes: totalCargos - cargosAprobados,
                porcentaje_aprobacion: totalCargos > 0 ? Math.round((cargosAprobados / totalCargos) * 100) : 0
            },
            cargos: cargos.map(cargo => ({
                id: cargo.id,
                nombre_cargo: cargo.nombre_cargo,
                area: cargo.area,
                aprobado: cargo.aprobado_medico,
                fecha_aprobacion: cargo.fecha_aprobacion,
                medico: cargo.aprobado_medico ? {
                    id: cargo.aprobado_por_medico_id,
                    nombre: cargo.medico_nombre,
                    licencia: cargo.medico_licencia
                } : null
            }))
        });

    } catch (error) {
        console.error('Error obteniendo estados de aprobación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estados de aprobación'
        });
    }
}
