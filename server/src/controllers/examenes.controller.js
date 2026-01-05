/**
 * Examenes Controller - Sprint 4
 * Maneja consultas de examenes medicos requeridos por cargo
 */

import db from '../config/database.js';
import { EXAM_DETAILS } from '../config/exam-details-config.js';
import riesgosService from '../services/riesgos.service.js';

/**
 * Get all required exams by empresa
 * Extracts exam requirements from cargo risk analysis
 */
export async function getExamenesByEmpresa(req, res) {
    try {
        const { empresaId } = req.params;

        // Get all cargos with their riesgos
        const cargos = await db('cargos_documento')
            .join('documentos_generados', 'cargos_documento.documento_id', 'documentos_generados.id')
            .where('documentos_generados.empresa_id', empresaId)
            .select(
                'cargos_documento.id',
                'cargos_documento.nombre_cargo',
                'cargos_documento.area',
                'cargos_documento.num_trabajadores',
                'cargos_documento.trabaja_alturas',
                'cargos_documento.manipula_alimentos',
                'cargos_documento.conduce_vehiculo',
                'cargos_documento.trabaja_espacios_confinados'
            );

        // For each cargo, get riesgos and calculate required exams
        const cargosConExamenes = await Promise.all(
            cargos.map(async (cargo) => {
                const riesgos = await db('riesgos_cargo')
                    .where('cargo_id', cargo.id)
                    .select('*');

                // Build cargo structure for riesgos service
                const cargoParaServicio = {
                    cargoName: cargo.nombre_cargo,
                    trabajaAlturas: cargo.trabaja_alturas,
                    manipulaAlimentos: cargo.manipula_alimentos,
                    conduceVehiculo: cargo.conduce_vehiculo,
                    trabajaEspaciosConfinados: cargo.trabaja_espacios_confinados,
                    gesSeleccionados: riesgos.map(r => ({
                        riesgo: r.tipo_riesgo,
                        ges: r.descripcion_riesgo,
                        niveles: {
                            deficiencia: { value: r.nivel_deficiencia },
                            exposicion: { value: r.nivel_exposicion },
                            consecuencia: { value: r.nivel_consecuencia }
                        }
                    }))
                };

                // Use riesgos service to get consolidated controls (includes exams)
                const controles = riesgosService.consolidarControlesCargo(cargoParaServicio);

                // Map exam codes to full names with periodicidad
                const examenes = controles.consolidado.examenes.map(codigoExamen => {
                    const detalle = EXAM_DETAILS[codigoExamen];
                    return {
                        codigo: codigoExamen,
                        nombre: detalle?.fullName || codigoExamen,
                        periodicidadMeses: controles.consolidado.periodicidadMinima,
                        periodicidad: formatearPeriodicidad(controles.consolidado.periodicidadMinima),
                        origen: getOrigenExamen(codigoExamen, controles)
                    };
                });

                // Calculate NR max
                const nrMax = riesgos.length > 0
                    ? Math.max(...riesgos.map(r => {
                        const np = r.nivel_deficiencia * r.nivel_exposicion;
                        return np * r.nivel_consecuencia;
                    }))
                    : 0;

                return {
                    id: cargo.id,
                    nombre: cargo.nombre_cargo,
                    area: cargo.area,
                    numTrabajadores: cargo.num_trabajadores || 0,
                    nrMax,
                    nrNivel: calcularNivelNR(nrMax),
                    examenes,
                    totalExamenes: examenes.length,
                    togglesActivos: getTogglesActivos(cargo)
                };
            })
        );

        // Consolidate all unique exams across all cargos
        const examenesConsolidados = {};
        cargosConExamenes.forEach(cargo => {
            cargo.examenes.forEach(examen => {
                if (!examenesConsolidados[examen.codigo]) {
                    examenesConsolidados[examen.codigo] = {
                        ...examen,
                        cargosQueRequieren: [],
                        trabajadoresAfectados: 0
                    };
                }
                examenesConsolidados[examen.codigo].cargosQueRequieren.push(cargo.nombre);
                examenesConsolidados[examen.codigo].trabajadoresAfectados += cargo.numTrabajadores;
            });
        });

        // Summary
        const totalTrabajadores = cargosConExamenes.reduce((sum, c) => sum + c.numTrabajadores, 0);
        const totalExamenesUnicos = Object.keys(examenesConsolidados).length;

        res.json({
            success: true,
            cargoExamenes: cargosConExamenes,
            examenesConsolidados: Object.values(examenesConsolidados),
            resumen: {
                totalCargos: cargos.length,
                totalTrabajadores,
                totalExamenesUnicos,
                examenesMasFrecuentes: Object.values(examenesConsolidados)
                    .sort((a, b) => b.cargosQueRequieren.length - a.cargosQueRequieren.length)
                    .slice(0, 5)
            }
        });

    } catch (error) {
        console.error('Error al obtener examenes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cargar los examenes',
            message: error.message
        });
    }
}

/**
 * Get exams for a specific cargo
 */
export async function getExamenesByCargo(req, res) {
    try {
        const { cargoId } = req.params;

        const cargo = await db('cargos_documento')
            .where('id', cargoId)
            .first();

        if (!cargo) {
            return res.status(404).json({
                success: false,
                error: 'Cargo no encontrado'
            });
        }

        const riesgos = await db('riesgos_cargo')
            .where('cargo_id', cargoId)
            .select('*');

        const cargoParaServicio = {
            cargoName: cargo.nombre_cargo,
            trabajaAlturas: cargo.trabaja_alturas,
            manipulaAlimentos: cargo.manipula_alimentos,
            conduceVehiculo: cargo.conduce_vehiculo,
            trabajaEspaciosConfinados: cargo.trabaja_espacios_confinados,
            gesSeleccionados: riesgos.map(r => ({
                riesgo: r.tipo_riesgo,
                ges: r.descripcion_riesgo,
                niveles: {
                    deficiencia: { value: r.nivel_deficiencia },
                    exposicion: { value: r.nivel_exposicion },
                    consecuencia: { value: r.nivel_consecuencia }
                }
            }))
        };

        const controles = riesgosService.consolidarControlesCargo(cargoParaServicio);

        const examenes = controles.consolidado.examenes.map(codigoExamen => {
            const detalle = EXAM_DETAILS[codigoExamen];
            return {
                codigo: codigoExamen,
                nombre: detalle?.fullName || codigoExamen,
                periodicidadMeses: controles.consolidado.periodicidadMinima,
                periodicidad: formatearPeriodicidad(controles.consolidado.periodicidadMinima),
                origen: getOrigenExamen(codigoExamen, controles),
                justificacion: getJustificacionExamen(codigoExamen, controles)
            };
        });

        res.json({
            success: true,
            cargo: {
                id: cargo.id,
                nombre: cargo.nombre_cargo,
                area: cargo.area,
                numTrabajadores: cargo.num_trabajadores
            },
            examenes,
            periodicidadMinima: controles.consolidado.periodicidadMinima,
            totalExamenes: examenes.length
        });

    } catch (error) {
        console.error('Error al obtener examenes del cargo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cargar los examenes',
            message: error.message
        });
    }
}

/**
 * Get heatmap data - NR levels by cargo/area
 */
export async function getMapaCalorNR(req, res) {
    try {
        const { empresaId } = req.params;

        // Get all cargos with areas
        const cargos = await db('cargos_documento')
            .join('documentos_generados', 'cargos_documento.documento_id', 'documentos_generados.id')
            .where('documentos_generados.empresa_id', empresaId)
            .select(
                'cargos_documento.id',
                'cargos_documento.nombre_cargo',
                'cargos_documento.area',
                'cargos_documento.num_trabajadores'
            );

        // Get all riesgos and calculate NR
        const cargosConNR = await Promise.all(
            cargos.map(async (cargo) => {
                const riesgos = await db('riesgos_cargo')
                    .where('cargo_id', cargo.id)
                    .select('nivel_deficiencia', 'nivel_exposicion', 'nivel_consecuencia', 'tipo_riesgo');

                const riesgosConNR = riesgos.map(r => {
                    const np = r.nivel_deficiencia * r.nivel_exposicion;
                    const nr = np * r.nivel_consecuencia;
                    return { ...r, nr, nrNivel: calcularNivelNR(nr) };
                });

                const nrMax = riesgosConNR.length > 0
                    ? Math.max(...riesgosConNR.map(r => r.nr))
                    : 0;

                // Group by risk type
                const riesgosPorTipo = {};
                riesgosConNR.forEach(r => {
                    if (!riesgosPorTipo[r.tipo_riesgo]) {
                        riesgosPorTipo[r.tipo_riesgo] = { count: 0, maxNR: 0 };
                    }
                    riesgosPorTipo[r.tipo_riesgo].count++;
                    riesgosPorTipo[r.tipo_riesgo].maxNR = Math.max(riesgosPorTipo[r.tipo_riesgo].maxNR, r.nr);
                });

                return {
                    id: cargo.id,
                    nombre: cargo.nombre_cargo,
                    area: cargo.area || 'Sin Area',
                    numTrabajadores: cargo.num_trabajadores || 0,
                    totalRiesgos: riesgos.length,
                    nrMax,
                    nrNivel: calcularNivelNR(nrMax),
                    riesgosPorTipo,
                    conteoNiveles: {
                        V: riesgosConNR.filter(r => r.nrNivel === 'V').length,
                        IV: riesgosConNR.filter(r => r.nrNivel === 'IV').length,
                        III: riesgosConNR.filter(r => r.nrNivel === 'III').length,
                        II: riesgosConNR.filter(r => r.nrNivel === 'II').length,
                        I: riesgosConNR.filter(r => r.nrNivel === 'I').length
                    }
                };
            })
        );

        // Group by area for heatmap
        const areaMap = {};
        cargosConNR.forEach(cargo => {
            if (!areaMap[cargo.area]) {
                areaMap[cargo.area] = {
                    area: cargo.area,
                    cargos: [],
                    totalTrabajadores: 0,
                    nrMaxArea: 0,
                    conteoNiveles: { V: 0, IV: 0, III: 0, II: 0, I: 0 }
                };
            }
            areaMap[cargo.area].cargos.push(cargo);
            areaMap[cargo.area].totalTrabajadores += cargo.numTrabajadores;
            areaMap[cargo.area].nrMaxArea = Math.max(areaMap[cargo.area].nrMaxArea, cargo.nrMax);

            // Accumulate NR counts
            Object.keys(cargo.conteoNiveles).forEach(nivel => {
                areaMap[cargo.area].conteoNiveles[nivel] += cargo.conteoNiveles[nivel];
            });
        });

        // Add nrNivel to each area
        Object.values(areaMap).forEach(area => {
            area.nrNivelArea = calcularNivelNR(area.nrMaxArea);
        });

        // Summary stats
        const totalCargos = cargosConNR.length;
        const totalTrabajadores = cargosConNR.reduce((sum, c) => sum + c.numTrabajadores, 0);
        const cargosCriticos = cargosConNR.filter(c => c.nrNivel === 'IV' || c.nrNivel === 'V');

        res.json({
            success: true,
            cargos: cargosConNR,
            areas: Object.values(areaMap),
            resumen: {
                totalCargos,
                totalTrabajadores,
                totalAreas: Object.keys(areaMap).length,
                cargosCriticos: cargosCriticos.length,
                trabajadoresEnRiesgoCritico: cargosCriticos.reduce((sum, c) => sum + c.numTrabajadores, 0),
                distribucionNR: {
                    V: cargosConNR.filter(c => c.nrNivel === 'V').length,
                    IV: cargosConNR.filter(c => c.nrNivel === 'IV').length,
                    III: cargosConNR.filter(c => c.nrNivel === 'III').length,
                    II: cargosConNR.filter(c => c.nrNivel === 'II').length,
                    I: cargosConNR.filter(c => c.nrNivel === 'I').length
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener mapa de calor:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cargar el mapa de calor',
            message: error.message
        });
    }
}

/**
 * Get dashboard KPIs
 */
export async function getDashboardKPIs(req, res) {
    try {
        const { empresaId } = req.params;

        // Get empresa info
        const empresa = await db('empresas')
            .where('id', empresaId)
            .first();

        // Get all documents for this empresa
        const documentos = await db('documentos_generados')
            .where('empresa_id', empresaId)
            .select('id', 'estado', 'created_at');

        // Get all cargos
        const cargos = await db('cargos_documento')
            .join('documentos_generados', 'cargos_documento.documento_id', 'documentos_generados.id')
            .where('documentos_generados.empresa_id', empresaId)
            .select('cargos_documento.*');

        // Get all riesgos
        const cargoIds = cargos.map(c => c.id);
        const riesgos = cargoIds.length > 0
            ? await db('riesgos_cargo').whereIn('cargo_id', cargoIds).select('*')
            : [];

        // Calculate NR for each riesgo
        const riesgosConNR = riesgos.map(r => {
            const np = r.nivel_deficiencia * r.nivel_exposicion;
            const nr = np * r.nivel_consecuencia;
            return { ...r, nr, nrNivel: calcularNivelNR(nr) };
        });

        // Totals
        const totalTrabajadores = cargos.reduce((sum, c) => sum + (c.num_trabajadores || 0), 0);
        const totalRiesgos = riesgos.length;

        // Critical risks
        const riesgosCriticos = riesgosConNR.filter(r => r.nrNivel === 'IV' || r.nrNivel === 'V');
        const cargosCriticosIds = [...new Set(riesgosCriticos.map(r => r.cargo_id))];
        const cargosCriticos = cargos.filter(c => cargosCriticosIds.includes(c.id));
        const trabajadoresEnRiesgoCritico = cargosCriticos.reduce((sum, c) => sum + (c.num_trabajadores || 0), 0);

        // Risk types distribution
        const riesgosPorTipo = {};
        riesgosConNR.forEach(r => {
            if (!riesgosPorTipo[r.tipo_riesgo]) {
                riesgosPorTipo[r.tipo_riesgo] = { total: 0, criticos: 0 };
            }
            riesgosPorTipo[r.tipo_riesgo].total++;
            if (r.nrNivel === 'IV' || r.nrNivel === 'V') {
                riesgosPorTipo[r.tipo_riesgo].criticos++;
            }
        });

        // Documents status
        const docsPagados = documentos.filter(d => d.estado === 'pagado').length;
        const docsPendientes = documentos.filter(d => d.estado !== 'pagado').length;

        res.json({
            success: true,
            empresa: {
                nombre: empresa?.nombre_legal || 'Empresa',
                nit: empresa?.nit
            },
            kpis: {
                totalCargos: cargos.length,
                totalTrabajadores,
                totalRiesgos,
                riesgosCriticos: riesgosCriticos.length,
                cargosCriticos: cargosCriticos.length,
                trabajadoresEnRiesgoCritico,
                porcentajeRiesgoCritico: totalTrabajadores > 0
                    ? Math.round((trabajadoresEnRiesgoCritico / totalTrabajadores) * 100)
                    : 0,
                documentos: {
                    total: documentos.length,
                    pagados: docsPagados,
                    pendientes: docsPendientes
                }
            },
            distribucionNR: {
                V: riesgosConNR.filter(r => r.nrNivel === 'V').length,
                IV: riesgosConNR.filter(r => r.nrNivel === 'IV').length,
                III: riesgosConNR.filter(r => r.nrNivel === 'III').length,
                II: riesgosConNR.filter(r => r.nrNivel === 'II').length,
                I: riesgosConNR.filter(r => r.nrNivel === 'I').length
            },
            riesgosPorTipo
        });

    } catch (error) {
        console.error('Error al obtener KPIs:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cargar los KPIs',
            message: error.message
        });
    }
}

// Helper functions

function calcularNivelNR(nr) {
    if (nr >= 600) return 'V';
    if (nr >= 150) return 'IV';
    if (nr >= 40) return 'III';
    if (nr >= 20) return 'II';
    return 'I';
}

function formatearPeriodicidad(meses) {
    if (!meses || meses <= 0) return 'Anual';
    if (meses <= 6) return 'Semestral';
    if (meses <= 12) return 'Anual';
    if (meses <= 24) return 'Cada 2 años';
    return `Cada ${Math.floor(meses / 12)} años`;
}

function getTogglesActivos(cargo) {
    const toggles = [];
    if (cargo.trabaja_alturas) toggles.push('Alturas');
    if (cargo.manipula_alimentos) toggles.push('Alimentos');
    if (cargo.conduce_vehiculo) toggles.push('Vehiculo');
    if (cargo.trabaja_espacios_confinados) toggles.push('Espacios Conf.');
    return toggles;
}

function getOrigenExamen(codigo, controles) {
    // Check if from toggles
    if (controles.porToggle?.examenes?.includes(codigo)) {
        return 'Toggle especial';
    }
    // Check if from GES
    const gesQueAporta = controles.porGES?.find(ges =>
        ges.controles?.examenes?.includes(codigo)
    );
    if (gesQueAporta) {
        return gesQueAporta.tipoRiesgo;
    }
    // Check if from paquete minimo
    if (controles.paqueteMinimo?.examenes?.includes(codigo)) {
        return 'Paquete minimo';
    }
    return 'General';
}

function getJustificacionExamen(codigo, controles) {
    // Check toggles
    if (controles.porToggle?.examenes?.includes(codigo) && controles.porToggle?.fundamentos?.length > 0) {
        return controles.porToggle.fundamentos[0];
    }
    // Check GES
    const gesQueAporta = controles.porGES?.find(ges =>
        ges.controles?.examenes?.includes(codigo)
    );
    if (gesQueAporta) {
        return `Exposicion a ${gesQueAporta.gesNombre}`;
    }
    // Paquete minimo
    if (controles.paqueteMinimo?.examenes?.includes(codigo)) {
        return controles.paqueteMinimo.fundamento || 'Evaluacion medica basica';
    }
    return 'Requerido segun normativa ocupacional';
}

/**
 * SPRINT 8: Get exámenes agrupados por cargo
 * Cada cargo tiene su paquete de exámenes y lista de trabajadores
 * La tabla muestra cargos, y al expandir se ven trabajadores y exámenes
 */
export async function getExamenesTabla(req, res) {
    try {
        const { empresaId } = req.params;
        console.log('🔵 [BACKEND] getExamenesTabla - empresaId:', empresaId);

        // Get all cargos with their exam overrides (from profesiograma)
        const cargos = await db('cargos_documento')
            .join('documentos_generados', 'cargos_documento.documento_id', 'documentos_generados.id')
            .where('documentos_generados.empresa_id', empresaId)
            .select(
                'cargos_documento.id',
                'cargos_documento.nombre_cargo',
                'cargos_documento.area',
                'cargos_documento.num_trabajadores',
                'cargos_documento.trabaja_alturas',
                'cargos_documento.manipula_alimentos',
                'cargos_documento.conduce_vehiculo',
                'cargos_documento.trabaja_espacios_confinados',
                'cargos_documento.examenes_ingreso',
                'cargos_documento.examenes_periodicos',
                'cargos_documento.examenes_retiro'
            );

        console.log('🔵 [BACKEND] Found cargos:', cargos.length);

        if (cargos.length === 0) {
            console.log('🟡 [BACKEND] No cargos found for empresaId:', empresaId);
            return res.json({
                success: true,
                filas: [],
                resumen: {
                    totalCargos: 0,
                    totalTrabajadores: 0,
                    totalExamenes: 0,
                    porAgendar: 0
                }
            });
        }

        // Helper para parsear JSON
        const parseJson = (field) => {
            if (!field) return null;
            try { return typeof field === 'string' ? JSON.parse(field) : field; }
            catch { return null; }
        };

        // EXÁMENES DE RETIRO COMUNES
        const EXAMENES_RETIRO_CODIGOS = ['EMO', 'EMOA', 'EMOMP', 'AUD', 'ESP'];

        // Agrupar exámenes por área para determinar nombre del paquete
        const examenesPorArea = {};
        const filas = [];
        let totalTrabajadores = 0;

        // Primera pasada: Obtener exámenes de cada cargo
        const cargosConExamenes = [];
        for (const cargo of cargos) {
            const riesgos = await db('riesgos_cargo')
                .where('cargo_id', cargo.id)
                .select('*');

            const cargoParaServicio = {
                cargoName: cargo.nombre_cargo,
                trabajaAlturas: cargo.trabaja_alturas,
                manipulaAlimentos: cargo.manipula_alimentos,
                conduceVehiculo: cargo.conduce_vehiculo,
                trabajaEspaciosConfinados: cargo.trabaja_espacios_confinados,
                gesSeleccionados: riesgos.map(r => ({
                    riesgo: r.tipo_riesgo,
                    ges: r.descripcion_riesgo,
                    niveles: {
                        deficiencia: { value: r.nivel_deficiencia },
                        exposicion: { value: r.nivel_exposicion },
                        consecuencia: { value: r.nivel_consecuencia }
                    }
                }))
            };

            const controles = riesgosService.consolidarControlesCargo(cargoParaServicio);
            const medicoOverrides = {
                examenes_ingreso: parseJson(cargo.examenes_ingreso),
                examenes_periodicos: parseJson(cargo.examenes_periodicos),
                examenes_retiro: parseJson(cargo.examenes_retiro)
            };

            // Determinar exámenes de ingreso
            let examenesIngreso = [];
            if (medicoOverrides.examenes_ingreso && medicoOverrides.examenes_ingreso.length > 0) {
                examenesIngreso = medicoOverrides.examenes_ingreso.map(ex => ({
                    codigo: ex.codigo || ex.nombre?.substring(0, 4).toUpperCase(),
                    nombre: ex.nombre,
                    periodicidadMeses: ex.periodicidadMeses || 12,
                    periodicidad: ex.periodicidad || 'Al ingreso'
                }));
            } else {
                examenesIngreso = controles.consolidado.examenes.map(codigoExamen => {
                    const detalle = EXAM_DETAILS[codigoExamen];
                    return {
                        codigo: codigoExamen,
                        nombre: detalle?.fullName || codigoExamen,
                        periodicidadMeses: controles.consolidado.periodicidadMinima,
                        periodicidad: 'Al ingreso'
                    };
                });
            }

            // Determinar exámenes periódicos
            let examenesPeriodicos = [];
            if (medicoOverrides.examenes_periodicos && medicoOverrides.examenes_periodicos.length > 0) {
                examenesPeriodicos = medicoOverrides.examenes_periodicos.map(ex => ({
                    codigo: ex.codigo || ex.nombre?.substring(0, 4).toUpperCase(),
                    nombre: ex.nombre,
                    periodicidadMeses: ex.periodicidadMeses || 12,
                    periodicidad: formatearPeriodicidad(ex.periodicidadMeses || 12)
                }));
            } else {
                examenesPeriodicos = controles.consolidado.examenes.map(codigoExamen => {
                    const detalle = EXAM_DETAILS[codigoExamen];
                    return {
                        codigo: codigoExamen,
                        nombre: detalle?.fullName || codigoExamen,
                        periodicidadMeses: controles.consolidado.periodicidadMinima,
                        periodicidad: formatearPeriodicidad(controles.consolidado.periodicidadMinima)
                    };
                });
            }

            // Determinar exámenes de retiro
            let examenesRetiro = [];
            if (medicoOverrides.examenes_retiro && medicoOverrides.examenes_retiro.length > 0) {
                examenesRetiro = medicoOverrides.examenes_retiro.map(ex => ({
                    codigo: ex.codigo || ex.nombre?.substring(0, 4).toUpperCase(),
                    nombre: ex.nombre,
                    periodicidadMeses: 0,
                    periodicidad: 'Al retiro'
                }));
            } else {
                examenesRetiro = examenesIngreso.filter(ex => 
                    EXAMENES_RETIRO_CODIGOS.includes(ex.codigo)
                ).map(ex => ({
                    ...ex,
                    periodicidad: 'Al retiro'
                }));
            }

            const area = cargo.area || 'General';
            if (!examenesPorArea[area]) {
                examenesPorArea[area] = [];
            }
            
            const examenesCodigosIngreso = examenesIngreso.map(e => e.codigo).sort().join(',');
            examenesPorArea[area].push({
                cargoId: cargo.id,
                cargoNombre: cargo.nombre_cargo,
                examenesCodigosIngreso
            });

            cargosConExamenes.push({
                ...cargo,
                area,
                examenesIngreso,
                examenesPeriodicos,
                examenesRetiro,
                examenesCodigosIngreso
            });
        }

        console.log('🔵 [BACKEND] Processing cargos con examenes:', cargosConExamenes.length);

        // Segunda pasada: Crear filas por cargo (no por trabajador)
        for (const cargoData of cargosConExamenes) {
            const area = cargoData.area;
            const cargosEnArea = examenesPorArea[area];
            
            // Verificar si todos los cargos del área tienen los mismos exámenes
            const todosIguales = cargosEnArea.every(c => 
                c.examenesCodigosIngreso === cargoData.examenesCodigosIngreso
            );
            
            // Determinar nombre del paquete
            let nombrePaquete;
            if (todosIguales && cargosEnArea.length > 1) {
                nombrePaquete = `Paquete ${area}`;
            } else {
                nombrePaquete = `Paquete ${cargoData.nombre_cargo}`;
            }

            const numTrabajadores = cargoData.num_trabajadores || 1;
            totalTrabajadores += numTrabajadores;

            // Obtener agendamientos reales de este cargo desde BD
            let agendamientos = [];
            const tableExists = await db.schema.hasTable('agendamientos_examenes');

            if (tableExists) {
                agendamientos = await db('agendamientos_examenes')
                    .where('empresa_id', empresaId)
                    .where('cargo_nombre', cargoData.nombre_cargo)
                    .select('*');
            }

            // Agrupar agendamientos por trabajador
            const trabajadoresMap = {};
            agendamientos.forEach(ag => {
                const key = ag.trabajador_nombre;
                if (!trabajadoresMap[key]) {
                    trabajadoresMap[key] = {
                        nombre: ag.trabajador_nombre,
                        cedula: null, // Extraer de observaciones si está
                        examenes: [],
                        ultimoEstado: ag.estado,
                        ultimaFecha: ag.fecha_examen
                    };

                    // Intentar extraer cédula de observaciones
                    if (ag.observaciones) {
                        const cedulaMatch = ag.observaciones.match(/\[ID:\s*[^\s]+\s+(\d+)\]/);
                        if (cedulaMatch) {
                            trabajadoresMap[key].cedula = cedulaMatch[1];
                        }
                    }
                }
                trabajadoresMap[key].examenes.push(ag);
                // Actualizar estado (prioridad: completado > agendado > por_agendar)
                if (ag.estado === 'completado') {
                    trabajadoresMap[key].ultimoEstado = 'completado';
                } else if (ag.estado === 'agendado' && trabajadoresMap[key].ultimoEstado !== 'completado') {
                    trabajadoresMap[key].ultimoEstado = 'agendado';
                }
            });

            // Generar lista de trabajadores (usar datos reales si existen)
            const trabajadores = [];
            const trabajadoresReales = Object.values(trabajadoresMap);

            // Primero agregar trabajadores con agendamientos reales
            trabajadoresReales.forEach((trab, idx) => {
                const estadoLabel = trab.ultimoEstado === 'completado' ? 'Completado'
                                  : trab.ultimoEstado === 'agendado' ? 'Agendado'
                                  : 'Por agendar';

                trabajadores.push({
                    id: `trab-${cargoData.id}-${idx + 1}`,
                    numero: idx + 1,
                    nombre: trab.nombre,
                    cedula: trab.cedula,
                    estado: trab.ultimoEstado,
                    estadoLabel: estadoLabel,
                    vencimiento: trab.ultimaFecha || '--',
                    numExamenesAgendados: trab.examenes.length
                });
            });

            // Completar con trabajadores placeholder hasta alcanzar numTrabajadores
            for (let i = trabajadores.length + 1; i <= numTrabajadores; i++) {
                trabajadores.push({
                    id: `trab-${cargoData.id}-${i}`,
                    numero: i,
                    nombre: null, // Será mostrado como "Trabajador #i" en frontend
                    cedula: null,
                    estado: 'por_agendar',
                    estadoLabel: 'Por agendar',
                    vencimiento: '--'
                });
            }

            // Una fila por cargo
            filas.push({
                id: `cargo-${cargoData.id}`,
                cargoId: cargoData.id,
                cargoNombre: cargoData.nombre_cargo,
                area: area,
                paqueteNombre: nombrePaquete,
                numTrabajadores: numTrabajadores,
                numExamenes: cargoData.examenesIngreso.length,
                trabajadores: trabajadores,
                examenesIngreso: cargoData.examenesIngreso,
                examenesPeriodicos: cargoData.examenesPeriodicos,
                examenesRetiro: cargoData.examenesRetiro,
                estado: 'por_agendar',
                estadoLabel: 'Por agendar'
            });
        }

        // Resumen
        const totalExamenes = filas.reduce((sum, f) => sum + (f.numExamenes * f.numTrabajadores), 0);

        console.log('🔵 [BACKEND] Generated filas:', filas.length);
        console.log('🔵 [BACKEND] Total trabajadores:', totalTrabajadores);
        console.log('🔵 [BACKEND] Sample fila:', filas[0] ? {
            cargo: filas[0].cargoNombre,
            area: filas[0].area,
            paquete: filas[0].paqueteNombre,
            trabajadores: filas[0].trabajadores.length,
            examenesIngreso: filas[0].examenesIngreso.length,
            examenesPeriodicos: filas[0].examenesPeriodicos.length
        } : 'No filas');

        res.json({
            success: true,
            filas,
            cargos: cargos.map(c => ({
                id: c.id,
                nombre: c.nombre_cargo,
                area: c.area,
                numTrabajadores: c.num_trabajadores
            })),
            resumen: {
                totalCargos: filas.length,
                totalTrabajadores,
                totalExamenes,
                porAgendar: totalTrabajadores,
                vencidos: 0,
                proximos: 0,
                alDia: 0
            }
        });

    } catch (error) {
        console.error('🔴 [BACKEND] Error al obtener tabla de examenes:', error);
        console.error('🔴 [BACKEND] Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Error al cargar los examenes',
            message: error.message
        });
    }
}

export default {
    getExamenesByEmpresa,
    getExamenesByCargo,
    getMapaCalorNR,
    getDashboardKPIs,
    getExamenesTabla
};
