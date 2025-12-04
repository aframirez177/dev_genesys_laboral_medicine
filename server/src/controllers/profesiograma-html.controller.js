// server/src/controllers/profesiograma-html.controller.js

/**
 * PROFESIOGRAMA HTML CONTROLLER
 * Sprint 6 - Bug Fix A.4
 *
 * Migración de jsPDF a HTML + window.print()
 * Genera HTML renderizable que el navegador puede imprimir directamente
 */

import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import riesgosService from '../services/riesgos.service.js';
import { EXAM_DETAILS } from '../config/exam-details-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Genera profesiograma como HTML para impresión
 * @param {Object} datosFormulario - Datos del formulario con cargos
 * @param {Object} options - Opciones { companyName }
 * @returns {Promise<string>} HTML renderizado
 */
export async function generarProfesiogramaHTML(
    datosFormulario,
    { companyName = "Empresa Cliente" } = {}
) {
    try {
        // Validar datos de entrada
        if (!datosFormulario || !datosFormulario.cargos || !Array.isArray(datosFormulario.cargos)) {
            throw new Error("datosFormulario.cargos no es un array válido o está ausente");
        }

        // Leer template HTML
        const templatePath = path.join(__dirname, '../views/profesiograma-print.html');
        const templateSource = await fs.readFile(templatePath, 'utf-8');

        // Compilar template con Handlebars
        const template = Handlebars.compile(templateSource);

        // Preparar datos para el template
        const cargosData = datosFormulario.cargos
            .filter(cargo => cargo) // Filtrar cargos nulos/undefined
            .map((cargo, index) => {
                // Generar controles consolidados si no existen
                let controles = cargo.controlesConsolidados;
                if (!controles) {
                    console.warn(`⚠️ Cargo "${cargo.cargoName}" no tiene controlesConsolidados. Generando fallback...`);
                    controles = riesgosService.consolidarControlesCargo(cargo);
                }

                // Preparar lista de GES
                const gesSeleccionados = Array.isArray(cargo.gesSeleccionados)
                    ? cargo.gesSeleccionados.filter(ges => ges && ges.ges && ges.riesgo)
                    : [];

                // Verificar características especiales
                const hasCaracteristicasEspeciales =
                    cargo.trabajaAlturas ||
                    cargo.manipulaAlimentos ||
                    cargo.conduceVehiculo;

                // Preparar filas de exámenes
                const examenesIngreso = [];
                const examenesPeriodicos = [];
                let tienePruebaEmbarazo = false;

                (controles.consolidado.examenes || []).forEach((code) => {
                    let examName = EXAM_DETAILS[code]?.fullName || code;
                    if (code === "PE") {
                        examName += " (*)";
                        tienePruebaEmbarazo = true;
                    }
                    examenesIngreso.push(examName);

                    const periodicidadTexto = `(cada ${controles.consolidado.periodicidadMinima} meses)`;
                    examenesPeriodicos.push(`${examName} ${periodicidadTexto}`);
                });

                // Determinar examen de egreso
                let examenEgresoCode = "EMO";
                if (controles.consolidado.examenes.includes("EMOA")) {
                    examenEgresoCode = "EMOA";
                } else if (controles.consolidado.examenes.includes("EMOMP")) {
                    examenEgresoCode = "EMOMP";
                }
                const examenEgreso = EXAM_DETAILS[examenEgresoCode]?.fullName || examenEgresoCode;

                // Construir filas de la tabla de exámenes
                const maxRows = Math.max(examenesIngreso.length, 1);
                const examenesRows = [];
                for (let i = 0; i < maxRows; i++) {
                    examenesRows.push({
                        ingreso: examenesIngreso[i] || "",
                        periodico: examenesPeriodicos[i] || "",
                    });
                }

                return {
                    cargoName: cargo.cargoName || 'N/A',
                    area: cargo.area || 'N/A',
                    descripcionTareas: cargo.descripcionTareas || "No especificada",
                    gesSeleccionados,
                    trabajaAlturas: cargo.trabajaAlturas || false,
                    manipulaAlimentos: cargo.manipulaAlimentos || false,
                    conduceVehiculo: cargo.conduceVehiculo || false,
                    hasCaracteristicasEspeciales,
                    controlesConsolidados: controles,
                    examenesRows,
                    examenEgreso,
                    tienePruebaEmbarazo,
                    pageNumber: index + 1
                };
            });

        // Renderizar HTML
        const html = template({
            companyName,
            cargos: cargosData,
            totalPages: cargosData.length
        });

        console.log("✅ Profesiograma HTML generado exitosamente.");
        return html;

    } catch (error) {
        console.error("❌ Error generando profesiograma HTML:", error);
        throw error;
    }
}

/**
 * Endpoint para servir el HTML de profesiograma
 * Puede ser usado en una ruta Express
 */
export async function serveProfesiogramaHTML(req, res) {
    try {
        const { datosFormulario, companyName } = req.body;

        if (!datosFormulario) {
            return res.status(400).json({
                success: false,
                message: "datosFormulario es requerido"
            });
        }

        const html = await generarProfesiogramaHTML(datosFormulario, { companyName });

        // Servir HTML directamente para que el navegador lo renderice
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);

    } catch (error) {
        console.error("Error en serveProfesiogramaHTML:", error);
        res.status(500).json({
            success: false,
            message: "Error generando profesiograma HTML",
            error: error.message
        });
    }
}
