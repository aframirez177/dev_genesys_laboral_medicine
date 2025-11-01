/**
 * Profesiograma View Controller
 * Handles serving profesiograma data and generating PDF from web view
 */

import db from '../config/database.js';
import { generatePDFFromView } from '../utils/profesiogramaToPdf.js';
import riesgosService from '../services/riesgos.service.js';
import { EXAM_DETAILS } from '../config/exam-details-config.js';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';

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

                // Formatear factores de riesgo con NR calculado
                const factoresRiesgo = controles.porGES
                    .filter(ges => ges.controlesAplicados) // Solo mostrar los que requieren controles
                    .map(ges => ({
                        factor: ges.tipoRiesgo,
                        descripcion: ges.gesNombre,
                        nivelExposicion: mapearNivelExposicion(ges.niveles.ne),
                        valoracion: ges.niveles.nrInterpretacion,
                        nr: ges.niveles.nr,
                        nrNivel: ges.niveles.nrNivel
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
                    numTrabajadores: cargoDB.num_trabajadores || 1,
                    nivelRiesgoARL,
                    descripcion: cargoDB.descripcion_tareas || 'Descripción no disponible',
                    factoresRiesgo,
                    examenes,
                    epp: controles.consolidado.epp,
                    aptitudes: controles.consolidado.aptitudes,
                    condicionesIncompatibles: controles.consolidado.condicionesIncompatibles
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
 * Generate PDF from profesiograma view using Puppeteer
 */
async function exportPDF(req, res) {
    try {
        const { id } = req.params;

        console.log(`📄 Generando PDF para profesiograma ID: ${id}`);

        // Build the URL to the profesiograma view page
        // IMPORTANTE: Puppeteer corre dentro del contenedor Docker, debe usar localhost
        // para acceder al servidor Express que está en el mismo contenedor
        const viewUrl = `http://localhost:3000/pages/profesiograma_view.html?id=${id}`;

        console.log(`🌐 URL de vista: ${viewUrl}`);

        // Generate PDF using Puppeteer
        const pdfBuffer = await generatePDFFromView(viewUrl, id);

        console.log(`✅ PDF generado: ${pdfBuffer.length} bytes`);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=profesiograma_${id}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF
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
