/**
 * Profesiograma View Controller
 * Handles serving profesiograma data and generating PDF from web view
 */

import db from '../config/database.js';
import riesgosService from '../services/riesgos.service.js';
import { EXAM_DETAILS } from '../config/exam-details-config.js';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';
// Nuevo generador de PDF completo con jsPDF
import { generarProfesiogramaCompletoPDF } from './profesiograma-pdf.controller.js';

/**
 * Get profesiograma data by ID
 * This data will be used to populate the profesiograma_view.html page
 */
async function getProfesiogramaData(req, res) {
    try {
        const { id } = req.params;

        console.log(`📋 Consultando profesiograma con ID: ${id}`);

        // 1. Consultar documento base
        const documento = await db('documentos_generados')
            .where({ id })
            .first();

        if (!documento) {
            return res.status(404).json({
                error: 'Profesiograma no encontrado',
                message: `No existe un documento con ID ${id}`
            });
        }

        console.log(`✓ Documento encontrado: ${documento.id}`);

        // 2. Consultar empresa
        const empresa = await db('empresas')
            .where({ id: documento.empresa_id })
            .first();

        // 3. Consultar cargos del documento con sus riesgos
        const cargosDB = await db('cargos_documento')
            .where({ documento_id: documento.id })
            .select('*');

        console.log(`✓ Cargos encontrados: ${cargosDB.length}`);

        // 4. Para cada cargo, obtener sus riesgos y generar controles
        const cargosConControles = await Promise.all(
            cargosDB.map(async (cargoDB, index) => {
                // Obtener riesgos del cargo
                const riesgosDB = await db('riesgos_cargo')
                    .where({ cargo_id: cargoDB.id })
                    .select('*');

                console.log(`  Cargo "${cargoDB.nombre_cargo}": ${riesgosDB.length} riesgos`);
                console.log(`  📋 Toggles del cargo: trabajaAlturas=${cargoDB.trabaja_alturas}, manipulaAlimentos=${cargoDB.manipula_alimentos}, conduceVehiculo=${cargoDB.conduce_vehiculo}`);

                // Debug: mostrar los riesgos cargados
                if (riesgosDB.length > 0) {
                    riesgosDB.forEach((r, i) => {
                        console.log(`    GES[${i}]: "${r.descripcion_riesgo}" - ND:${r.nivel_deficiencia} NE:${r.nivel_exposicion} NC:${r.nivel_consecuencia}`);
                    });
                } else {
                    console.log(`    ⚠️ No hay riesgos guardados para este cargo`);
                }

                // Reconstruir estructura de cargo para el servicio de riesgos
                const cargoParaServicio = {
                    cargoName: cargoDB.nombre_cargo,
                    area: cargoDB.area,
                    descripcionTareas: cargoDB.descripcion_tareas,
                    zona: cargoDB.zona,
                    numTrabajadores: cargoDB.num_trabajadores,
                    tareasRutinarias: cargoDB.tareas_rutinarias,
                    trabajaAlturas: cargoDB.trabaja_alturas,
                    manipulaAlimentos: cargoDB.manipula_alimentos,
                    conduceVehiculo: cargoDB.conduce_vehiculo,
                    trabajaEspaciosConfinados: cargoDB.trabaja_espacios_confinados,
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

                // Usar servicio de riesgos para consolidar controles
                const controles = riesgosService.consolidarControlesCargo(cargoParaServicio);

                // Debug: mostrar resultado de controles
                console.log(`  📊 Resultado controles: ${controles.porGES.length} GES procesados, EPP: ${controles.consolidado.epp.length}, Aptitudes: ${controles.consolidado.aptitudes.length}`);

                // Formatear factores de riesgo con NR calculado y justificaciones
                const factoresRiesgo = controles.porGES
                    .filter(ges => ges.controlesAplicados) // Solo mostrar los que requieren controles
                    .map(ges => ({
                        factor: ges.tipoRiesgo,
                        descripcion: ges.gesNombre,
                        nivelExposicion: mapearNivelExposicion(ges.niveles.ne),
                        valoracion: ges.niveles.nrInterpretacion,
                        nr: ges.niveles.nr,
                        nrNivel: ges.niveles.nrNivel,
                        // ✅ NUEVOS CAMPOS: Justificación y efectos del GES
                        justificacion: ges.justificacion || '',
                        efectosPosibles: ges.efectosPosibles || '',
                        peorConsecuencia: ges.peorConsecuencia || ''
                    }));

                // ✅ NUEVO: Lista completa de GES identificados (todos, no solo los que requieren controles)
                const gesIdentificados = controles.porGES.map(ges => ({
                    riesgo: ges.tipoRiesgo,
                    ges: ges.gesNombre,
                    niveles: {
                        nd: ges.niveles.nd,
                        ne: ges.niveles.ne,
                        nc: ges.niveles.nc,
                        np: ges.niveles.np,
                        nr: ges.niveles.nr
                    },
                    interpretacionNR: ges.niveles.nrInterpretacion,
                    nivelNR: ges.niveles.nrNivel,
                    controlesAplicados: ges.controlesAplicados,
                    justificacion: ges.justificacion || '',
                    efectosPosibles: ges.efectosPosibles || '',
                    peorConsecuencia: ges.peorConsecuencia || ''
                }));

                // Formatear exámenes con periodicidad
                const examenes = controles.consolidado.examenes.map(codigoExamen => {
                    const examenDetalle = EXAM_DETAILS[codigoExamen];
                    const periodicidadMeses = controles.consolidado.periodicidadMinima;

                    return {
                        nombre: examenDetalle?.fullName || codigoExamen,
                        periodicidad: formatearPeriodicidad(periodicidadMeses),
                        justificacion: generarJustificacionExamen(codigoExamen, controles)
                    };
                });

                // Calcular nivel de riesgo ARL (basado en el NR máximo)
                const nrMaximo = controles.metadata.nrMaximo;
                const nivelRiesgoARL = calcularNivelARL(nrMaximo);

                return {
                    nombre: cargoDB.nombre_cargo,
                    area: cargoDB.area || 'No especificada',
                    zona: cargoDB.zona || 'No especificada',
                    numTrabajadores: cargoDB.num_trabajadores || 1,
                    nivelRiesgoARL,
                    descripcion: cargoDB.descripcion_tareas || 'Descripción no disponible',
                    factoresRiesgo,
                    examenes,
                    // ✅ Campos existentes
                    epp: controles.consolidado.epp,
                    aptitudes: controles.consolidado.aptitudes,
                    condicionesIncompatibles: controles.consolidado.condicionesIncompatibles,
                    // ✅ NUEVOS CAMPOS: GES identificados completos con riesgos
                    gesIdentificados,
                    // ✅ Metadata adicional
                    nrMaximo: controles.metadata.nrMaximo,
                    periodicidadMinima: controles.consolidado.periodicidadMinima,
                    // ✅ Toggles especiales (trabajo en alturas, conducción, etc.)
                    togglesEspeciales: {
                        trabajaAlturas: cargoDB.trabaja_alturas,
                        manipulaAlimentos: cargoDB.manipula_alimentos,
                        conduceVehiculo: cargoDB.conduce_vehiculo,
                        trabajaEspaciosConfinados: cargoDB.trabaja_espacios_confinados,
                        tareasRutinarias: cargoDB.tareas_rutinarias
                    }
                };
            })
        );

        // 5. Parsear form_data para obtener datos del médico (si están disponibles)
        let formData = {};
        try {
            formData = JSON.parse(documento.form_data || '{}');
        } catch (e) {
            console.warn('⚠️ No se pudo parsear form_data');
        }

        // 6. Construir respuesta final
        const data = {
            id: documento.id,
            empresa: {
                nombre: empresa?.nombre_legal || 'Empresa',
                nit: empresa?.nit || 'N/A'
            },
            version: '1.0',
            fechaElaboracion: documento.created_at || new Date().toISOString(),
            fechaVigencia: new Date(new Date(documento.created_at).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            medico: {
                nombre: formData.medicoNombre || 'Médico SST',
                registro: formData.medicoRegistro || 'N/A',
                especialidad: 'Medicina del Trabajo y Salud Ocupacional',
                licencia: formData.medicoLicencia || 'N/A',
                fechaExpedicionLicencia: formData.medicoFechaLicencia || 'N/A'
            },
            cargos: cargosConControles
        };

        console.log(`✅ Datos del profesiograma preparados`);
        res.json(data);

    } catch (error) {
        console.error('❌ Error al obtener datos del profesiograma:', error);
        res.status(500).json({
            error: 'Error al cargar los datos del profesiograma',
            message: error.message
        });
    }
}

/**
 * Helper: Mapear nivel de exposición numérico a texto
 */
function mapearNivelExposicion(ne) {
    if (ne >= 4) return 'Continua (todo el día)';
    if (ne >= 3) return 'Frecuente (varias veces al día)';
    if (ne >= 2) return 'Ocasional (algunas veces al día)';
    if (ne >= 1) return 'Esporádica (< 1 hora/día)';
    return 'No especificada';
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
 * Helper: Calcular nivel de riesgo ARL basado en NR máximo
 */
function calcularNivelARL(nrMaximo) {
    if (nrMaximo >= 501) return 'V';  // Crítico
    if (nrMaximo >= 121) return 'IV'; // Alto
    if (nrMaximo >= 41) return 'III'; // Medio
    if (nrMaximo >= 20) return 'II';  // Bajo
    return 'I'; // Muy bajo
}

/**
 * Generate PDF using jsPDF (nuevo generador completo)
 * Ya no usa Puppeteer - genera el PDF directamente con jsPDF
 */
async function exportPDF(req, res) {
    try {
        const { id } = req.params;

        console.log(`📄 Generando PDF con jsPDF para profesiograma ID: ${id}`);

        // 1. Obtener documento de la BD
        const documento = await db('documentos_generados')
            .where({ id })
            .first();

        if (!documento) {
            return res.status(404).json({
                error: 'Profesiograma no encontrado',
                message: `No existe un documento con ID ${id}`
            });
        }

        // 2. Obtener empresa
        const empresa = await db('empresas')
            .where({ id: documento.empresa_id })
            .first();

        // 3. Obtener cargos del documento
        const cargosDB = await db('cargos_documento')
            .where({ documento_id: documento.id })
            .select('*');

        console.log(`✓ Cargos encontrados: ${cargosDB.length}`);

        // 4. Para cada cargo, obtener sus riesgos y reconstruir estructura
        const cargos = await Promise.all(
            cargosDB.map(async (cargoDB) => {
                // Obtener riesgos del cargo
                const riesgosDB = await db('riesgos_cargo')
                    .where({ cargo_id: cargoDB.id })
                    .select('*');

                // Reconstruir estructura de cargo para el generador PDF
                const cargo = {
                    cargoName: cargoDB.nombre_cargo,
                    area: cargoDB.area,
                    descripcionTareas: cargoDB.descripcion_tareas,
                    zona: cargoDB.zona,
                    numTrabajadores: cargoDB.num_trabajadores,
                    tareasRutinarias: cargoDB.tareas_rutinarias,
                    trabajaAlturas: cargoDB.trabaja_alturas,
                    manipulaAlimentos: cargoDB.manipula_alimentos,
                    conduceVehiculo: cargoDB.conduce_vehiculo,
                    trabajaEspaciosConfinados: cargoDB.trabaja_espacios_confinados,
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

                // Calcular controles consolidados usando riesgosService
                const controles = riesgosService.consolidarControlesCargo(cargo);

                // Añadir NR calculado a cada GES
                cargo.gesSeleccionados = cargo.gesSeleccionados.map((ges, index) => {
                    const gesConControles = controles.porGES[index];
                    return {
                        ...ges,
                        nr: gesConControles?.niveles?.nr || 0,
                        nrNivel: gesConControles?.niveles?.nrNivel || 'N/A',
                        nrInterpretacion: gesConControles?.niveles?.nrInterpretacion || 'N/A'
                    };
                });

                cargo.controlesConsolidados = controles;

                return cargo;
            })
        );

        // 5. Construir formData para el generador PDF
        const formData = {
            cargos,
            contact: {
                companyName: empresa?.nombre_legal || 'Empresa',
                nit: empresa?.nit || 'N/A'
            }
        };

        console.log(`📊 Generando PDF con ${cargos.length} cargos...`);

        // 6. Generar PDF con el nuevo generador jsPDF
        const pdfBuffer = await generarProfesiogramaCompletoPDF(formData, {
            companyName: empresa?.nombre_legal || 'Empresa'
        });

        console.log(`✅ PDF generado con jsPDF: ${pdfBuffer.length} bytes`);

        // 7. Enviar PDF como respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=profesiograma_${id}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(pdfBuffer);

    } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        res.status(500).json({
            error: 'Error al generar el PDF',
            message: error.message
        });
    }
}

export default {
    getProfesiogramaData,
    exportPDF
};
