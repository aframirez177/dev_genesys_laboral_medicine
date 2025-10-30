// server/src/controllers/matriz-riesgos.controller.js
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
    calcularNivelProbabilidad,
    calcularNivelRiesgo,
} from "../utils/risk-calculations.js";
import { GES_DATOS_PREDEFINIDOS } from "../config/ges-config.js";

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Genera SIEMPRE la matriz completa (versión Pro)
async function generarMatrizExcel(
    datosFormulario,
    {
        companyName = "Genesys Laboral Medicine",
        nit = "N/A",
        diligenciadoPor = "N/A"
    } = {}
) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Matriz de Riesgos GTC45");

    // ============================================
    // SECCIÓN DE ENCABEZADO INFORMATIVO
    // ============================================

    // Colores del proyecto
    const colorPrimary = "87e2d0"; // Color verde agua claro para encabezados
    const colorText = "2d3238";    // Color de texto del proyecto

    // Insertar logo en A1
    // Intentar múltiples rutas para desarrollo y producción
    const possibleLogoPaths = [
        path.join(__dirname, "../../client/src/assets/images/Logo_compuesto_fullcolor_horizontal_negro@2x.png"),
        path.join(__dirname, "../../../client/src/assets/images/Logo_compuesto_fullcolor_horizontal_negro@2x.png"),
        path.join(process.cwd(), "client/src/assets/images/Logo_compuesto_fullcolor_horizontal_negro@2x.png"),
        "/app/client/src/assets/images/Logo_compuesto_fullcolor_horizontal_negro@2x.png", // Docker path
    ];

    let logoPath = null;
    for (const testPath of possibleLogoPaths) {
        if (fs.existsSync(testPath)) {
            logoPath = testPath;
            break;
        }
    }

    try {
        if (logoPath) {
            const logoImage = workbook.addImage({
                filename: logoPath,
                extension: 'png',
            });

            // Ajustar altura de filas 1-3 para el logo
            worksheet.getRow(1).height = 30;
            worksheet.getRow(2).height = 30;
            worksheet.getRow(3).height = 30;

            // Insertar imagen en A1 (3 filas x 1.65 columnas)
            worksheet.addImage(logoImage, {
                tl: { col: 0, row: 0 },      // Top-left: A1 (col 0, row 0)
                br: { col: 1.65, row: 3 },   // Bottom-right: 1.65 columnas, fila 3
                editAs: 'oneCell'
            });

            console.log("✅ Logo agregado al Excel desde:", logoPath);
        } else {
            console.warn("⚠️ Logo no encontrado en ninguna de las rutas posibles");
        }
    } catch (error) {
        console.error("❌ Error al agregar logo:", error.message);
    }

    // Fusionar celdas para el título principal (al lado derecho del logo)
    worksheet.mergeCells('C1:M3');
    const titleCell = worksheet.getCell('C1');
    titleCell.value = 'MATRIZ DE IDENTIFICACIÓN DE PELIGROS, EVALUACIÓN Y VALORACIÓN DE RIESGOS';
    titleCell.font = {
        name: 'Raleway',
        size: 14,
        bold: true,
        color: { argb: colorText }
    };
    titleCell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
    };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colorPrimary }
    };

    // Fila 4: Información de la matriz
    worksheet.getCell('A4').value = 'Basado en: GTC-45';
    worksheet.getCell('A4').font = { name: 'Raleway', size: 10, bold: true, color: { argb: colorText } };

    worksheet.mergeCells('C4:D4');
    worksheet.getCell('C4').value = `Empresa: ${companyName}`;
    worksheet.getCell('C4').font = { name: 'Raleway', size: 10, bold: false, color: { argb: colorText } };

    worksheet.mergeCells('E4:F4');
    worksheet.getCell('E4').value = `NIT: ${nit}`;
    worksheet.getCell('E4').font = { name: 'Raleway', size: 10, bold: false, color: { argb: colorText } };

    // Fila 5: Información del diligenciamiento
    worksheet.mergeCells('A5:B5');
    worksheet.getCell('A5').value = `Diligenciado por: ${diligenciadoPor}`;
    worksheet.getCell('A5').font = { name: 'Raleway', size: 10, bold: false, color: { argb: colorText } };

    worksheet.mergeCells('C5:D5');
    worksheet.getCell('C5').value = 'Genesys Laboral Medicine';
    worksheet.getCell('C5').font = { name: 'Raleway', size: 10, bold: true, color: { argb: colorText } };

    worksheet.mergeCells('E5:F5');
    worksheet.getCell('E5').value = 'Powered by Genesys BI';
    worksheet.getCell('E5').font = { name: 'Raleway', size: 10, bold: false, color: { argb: "5dc4af" } }; // Color primary del proyecto

    // Agregar espacio visual (fila 6 vacía)
    worksheet.getRow(6).height = 10;

    // ============================================
    // FIN SECCIÓN DE ENCABEZADO
    // ============================================

    // Definir columnas SIN encabezados automáticos (solo keys y anchos)
    const columnasCompletas = [
        { key: "proceso", width: 25 },
        { key: "zona_lugar", width: 25 },
        { key: "actividades", width: 30 },
        { key: "tareas", width: 35 },
        { key: "rutinario", width: 12 },
        { key: "peligro_descripcion", width: 35 },
        { key: "peligro_clasificacion", width: 20 },
        { key: "efectos_posibles", width: 35 },
        { key: "control_fuente", width: 25 },
        { key: "control_medio", width: 25 },
        { key: "control_individuo", width: 25 },
        { key: "nd", width: 10 },
        { key: "ne", width: 10 },
        { key: "np_valor", width: 12 },
        { key: "np_nivel_categoria", width: 18 },
        { key: "np_interpretacion", width: 30 },
        { key: "nc_valor", width: 10 },
        { key: "nr_valor_intervencion", width: 12 },
        { key: "nr_interpretacion_nivel", width: 15 },
        { key: "nr_interpretacion_texto", width: 35 },
        { key: "aceptabilidad_riesgo", width: 30 },
        { key: "nro_expuestos", width: 10 },
        { key: "peor_consecuencia", width: 30 },
        { key: "requisito_legal", width: 18 },
        { key: "medida_eliminacion", width: 30 },
        { key: "medida_sustitucion", width: 30 },
        { key: "medida_ctrl_ingenieria", width: 35 },
        { key: "medida_ctrl_admin", width: 40 },
        { key: "epp", width: 40 },
    ];

    // Configurar columnas sin crear encabezados automáticos
    worksheet.columns = columnasCompletas;

    // Nombres de los encabezados (los vamos a poner manualmente en filas 7-8)
    const headersNombres = [
        "Proceso",
        "Zona/Lugar",
        "Actividades",
        "Tareas",
        "Rutinario (Si o No)",
        "Descripción",
        "Clasificación",
        "Efectos posibles",
        "Fuente",
        "Medio",
        "Individuo",
        "Nivel de deficiencia",
        "Nivel de exposición",
        "Nivel de probabilidad (NP)",
        "Nivel de Probabilidad (Categoría)",
        "Interpretación del nivel de probabilidad",
        "Nivel de consecuencia",
        "Nivel de riesgo (NR) e intervención",
        "Nivel de Riesgo (Categoría)",
        "Interpretación del NR",
        "Aceptabilidad del riesgo",
        "Nro. Expuestos",
        "Peor consecuencia",
        "Existencia requisito legal específico asociado (Si o No)",
        "Eliminación",
        "Sustitución",
        "Controles de ingeniería",
        "Controles administrativos, Señalización, Advertencia",
        "Equipos/ Elementos de protección personal",
    ];

    // --- ESTILOS DE CABECERA ---
    const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF87e2d0" } }; // Color verde agua claro
    const headerFont = { bold: true, color: { argb: "FF2d3238" }, name: "Raleway", size: 10 }; // Color de texto del proyecto
    const headerAlignment = { vertical: "middle", horizontal: "center", wrapText: true };

    // Definir grupos de encabezados (columnas que se agrupan bajo un título común)
    // Los números son índices de columnas (1-based)
    const groupHeaders = {
        Peligro: { start: 6, end: 8 },
        "Controles existentes": { start: 9, end: 11 },
        "Evaluación del riesgo": { start: 12, end: 20 },
        "Valoración del riesgo": { start: 21, end: 21 },
        "Criterios para establecer controles": { start: 22, end: 24 },
        "Medidas intervención": { start: 25, end: 29 },
    };

    // --- LÓGICA DE ENCABEZADOS SIMPLIFICADA ---
    const headersRow1 = worksheet.getRow(7);
    const headersRow2 = worksheet.getRow(8);
    headersRow1.height = 30;
    headersRow2.height = 40;

    // Procesar TODAS las columnas (incluyendo las primeras 5)
    for (let colIndex = 1; colIndex <= headersNombres.length; colIndex++) {
        const headerName = headersNombres[colIndex - 1];

        // Verificar si esta columna pertenece a un grupo
        let isGrouped = false;

        for (const [gName, gRange] of Object.entries(groupHeaders)) {
            if (colIndex >= gRange.start && colIndex <= gRange.end) {
                isGrouped = true;

                // Si es el inicio del grupo, fusionar y poner el título del grupo en fila 7
                if (colIndex === gRange.start) {
                    if (gRange.end > gRange.start) {
                        worksheet.mergeCells(7, gRange.start, 7, gRange.end);
                    }
                    const groupCell = headersRow1.getCell(gRange.start);
                    groupCell.value = gName;
                    groupCell.fill = headerFill;
                    groupCell.font = headerFont;
                    groupCell.alignment = headerAlignment;
                }

                // Poner el encabezado específico en fila 8
                const specificCell = headersRow2.getCell(colIndex);
                specificCell.value = headerName;
                specificCell.fill = headerFill;
                specificCell.font = headerFont;
                specificCell.alignment = headerAlignment;

                break;
            }
        }

        // Si NO pertenece a ningún grupo (columnas 1-5), fusionar verticalmente filas 7-8
        if (!isGrouped) {
            worksheet.mergeCells(7, colIndex, 8, colIndex);
            const cell = headersRow1.getCell(colIndex);
            cell.value = headerName;
            cell.fill = headerFill;
            cell.font = headerFont;
            cell.alignment = headerAlignment;
        }
    }
    // --- FIN LÓGICA ENCABEZADOS ---


    // --- PROCESAR Y AÑADIR DATOS ---
    let currentRowIndex = 9; // Los datos ahora empiezan en la fila 9 (después del encabezado informativo + encabezados de matriz)
    const cargosPorProceso = datosFormulario.cargos.reduce((acc, cargo) => {
        const proceso = cargo.area || "Sin Área"; // Default si no hay área
        if (!acc[proceso]) acc[proceso] = [];
        acc[proceso].push(cargo);
        return acc;
    }, {});

     // Colores para semaforización
    const coloresNiveles = {
        deficiencia: { 10: "FFF44336", 6: "FFFF9800", 2: "FFFFEB3B", 0: "FF4CAF50" },
        exposicion: { 4: "FFF44336", 3: "FFFF9800", 2: "FFFFEB3B", 1: "FF4CAF50" },
        consecuencia: { 100: "FFF44336", 60: "FFFF9800", 25: "FFFFEB3B", 10: "FF4CAF50" },
    };
    const coloresNivelProbabilidadCategoria = { "Muy Alto": "FFF44336", Alto: "FFFF9800", Medio: "FFFFEB3B", Bajo: "FF4CAF50" };


    for (const procesoNombre in cargosPorProceso) {
        const cargosEnEsteProceso = cargosPorProceso[procesoNombre];
        const inicioFilasProceso = currentRowIndex;

        cargosEnEsteProceso.forEach((cargo) => {
            const gesSeleccionados = cargo.gesSeleccionados || [];
            if (gesSeleccionados.length === 0) return; // Saltar cargo si no tiene GES

            const startRowForCurrentCargo = currentRowIndex;

            const gesAgrupadosPorClasificacion = gesSeleccionados.reduce((acc, ges) => {
                const clasificacion = ges.riesgo || "Sin Clasificación";
                if (!acc[clasificacion]) acc[clasificacion] = [];
                acc[clasificacion].push(ges);
                return acc;
            }, {});

            for (const clasificacionKey in gesAgrupadosPorClasificacion) {
                const gesDeMismaClasificacion = gesAgrupadosPorClasificacion[clasificacionKey];
                const startRowForClasificacion = currentRowIndex;

                gesDeMismaClasificacion.forEach((ges) => {
                    const datosGesPredefinidos = GES_DATOS_PREDEFINIDOS[ges.ges] || {};
                    let nivelProb = { valor: 0, interpretacion: "N/A", nivel: "N/A" };
                    let nivelRiesgo = { valor: 0, interpretacion: "N/A", nivel: "N/A", aceptabilidad: "N/A", color: "FFFFFFFF" };

                    try {
                        const ndVal = parseInt(ges.niveles?.deficiencia?.value, 10);
                        const neVal = parseInt(ges.niveles?.exposicion?.value, 10);
                        const ncVal = parseInt(ges.niveles?.consecuencia?.value, 10);
                        if (!isNaN(ndVal) && !isNaN(neVal)) {
                            nivelProb = calcularNivelProbabilidad(ndVal, neVal);
                            if (!isNaN(ncVal) && nivelProb.valor !== undefined) {
                                nivelRiesgo = calcularNivelRiesgo(nivelProb.valor, ncVal);
                            }
                        }
                    } catch (e) {
                        console.error(`Error cálculo niveles para GES ${ges.ges}:`, e);
                    }

                    const rowData = {
                        proceso: cargo.area || "N/A",
                        zona_lugar: cargo.zona || "N/A",
                        actividades: cargo.cargoName || "N/A",
                        tareas: cargo.descripcionTareas || "No especificado",
                        rutinario: cargo.tareasRutinarias ? "Si" : "No",
                        peligro_descripcion: ges.ges || "N/A",
                        peligro_clasificacion: ges.riesgo || "N/A",
                        efectos_posibles: datosGesPredefinidos.consecuencias || "No especificado",
                        control_fuente: ges.controles?.fuente || "Ninguno",
                        control_medio: ges.controles?.medio || "Ninguno",
                        control_individuo: ges.controles?.individuo || "Ninguno",
                        nd: ges.niveles?.deficiencia?.value ?? 0,
                        ne: ges.niveles?.exposicion?.value ?? 0,
                        np_valor: nivelProb.valor,
                        np_nivel_categoria: nivelProb.nivel,
                        np_interpretacion: nivelProb.interpretacion,
                        nc_valor: ges.niveles?.consecuencia?.value ?? 0,
                        nr_valor_intervencion: nivelRiesgo.valor,
                        nr_interpretacion_nivel: nivelRiesgo.nivel,
                        nr_interpretacion_texto: nivelRiesgo.interpretacion,
                        aceptabilidad_riesgo: nivelRiesgo.aceptabilidad,
                        nro_expuestos: cargo.numTrabajadores || 1,
                        peor_consecuencia: datosGesPredefinidos.peorConsecuencia || "No especificado",
                        requisito_legal: "Si", // Asumiendo 'Si', ajustar si es variable
                        medida_eliminacion: datosGesPredefinidos.medidasIntervencion?.eliminacion || "",
                        medida_sustitucion: datosGesPredefinidos.medidasIntervencion?.sustitucion || "",
                        medida_ctrl_ingenieria: datosGesPredefinidos.medidasIntervencion?.controlesIngenieria || "",
                        medida_ctrl_admin: datosGesPredefinidos.medidasIntervencion?.controlesAdministrativos || "",
                        epp: (datosGesPredefinidos.eppSugeridos || []).join(", "),
                    };
                    const addedRow = worksheet.addRow(rowData);

                    // Aplicar semaforización de celdas
                    const ndCell = addedRow.getCell("nd");
                    const neCell = addedRow.getCell("ne");
                    const ncCell = addedRow.getCell("nc_valor");
                    const npCategoriaCell = addedRow.getCell("np_nivel_categoria");
                    const nrValorCell = addedRow.getCell("nr_valor_intervencion");
                    const nrCategoriaCell = addedRow.getCell("nr_interpretacion_nivel");

                    if (coloresNiveles.deficiencia[rowData.nd]) ndCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coloresNiveles.deficiencia[rowData.nd] } };
                    if (coloresNiveles.exposicion[rowData.ne]) neCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coloresNiveles.exposicion[rowData.ne] } };
                    if (coloresNiveles.consecuencia[rowData.nc_valor]) ncCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coloresNiveles.consecuencia[rowData.nc_valor] } };
                    if (coloresNivelProbabilidadCategoria[nivelProb.nivel]) npCategoriaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coloresNivelProbabilidadCategoria[nivelProb.nivel] } };

                    if (nivelRiesgo.color && nivelRiesgo.color !== "FFFFFFFF") {
                         const bgColorHex = nivelRiesgo.color.replace("#", "").toUpperCase();
                         // Asegurar que tenga alfa FF si no lo tiene
                        const finalBgColor = bgColorHex.length === 6 ? `FF${bgColorHex}` : bgColorHex;
                        const cellFill = { type: "pattern", pattern: "solid", fgColor: { argb: finalBgColor } };

                        nrValorCell.fill = cellFill;
                        nrCategoriaCell.fill = cellFill;

                         const fontColor = ["FF0000", "FFA500", "000000"].includes(bgColorHex) ? "FFFFFFFF" : "FF000000";
                        const fontStyle = { color: { argb: fontColor }, name: "Calibri", size: 10 };

                        nrValorCell.font = fontStyle;
                        nrCategoriaCell.font = fontStyle;
                    }

                    // Estilos de alineación y wrap
                    addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const columnKey = worksheet.getColumn(colNumber).key;
                        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
                        const centeredKeys = ["rutinario", "nd", "ne", "np_valor", "np_nivel_categoria", "nc_valor", "nr_valor_intervencion", "nr_interpretacion_nivel", "nro_expuestos", "requisito_legal"];
                        if (centeredKeys.includes(columnKey)) {
                            cell.alignment.horizontal = "center";
                        }
                    });

                    currentRowIndex++;
                }); // Fin forEach gesDeMismaClasificacion

                // Combinar celda "Clasificación"
                const endRowForClasificacion = currentRowIndex - 1;
                if (gesDeMismaClasificacion.length > 1 && endRowForClasificacion > startRowForClasificacion) {
                    const colNumClasificacion = worksheet.getColumn("peligro_clasificacion").number;
                    worksheet.mergeCells(startRowForClasificacion, colNumClasificacion, endRowForClasificacion, colNumClasificacion);
                    const cellClasificacion = worksheet.getCell(startRowForClasificacion, colNumClasificacion);
                    cellClasificacion.alignment = { vertical: "top", horizontal: "left", wrapText: true }; // Alinear arriba
                }
            } // Fin for clasificacionKey

            // Combinar celdas comunes del CARGO
            const endRowForCurrentCargo = currentRowIndex - 1;
            if (gesSeleccionados.length > 0 && endRowForCurrentCargo >= startRowForCurrentCargo) {
                const keysCargoComun = ["zona_lugar", "actividades", "tareas", "rutinario", "nro_expuestos", "requisito_legal"];
                keysCargoComun.forEach((key) => {
                    const colNum = worksheet.getColumn(key).number;
                     // Solo fusionar si hay más de una fila para este cargo
                    if (endRowForCurrentCargo > startRowForCurrentCargo) {
                        worksheet.mergeCells(startRowForCurrentCargo, colNum, endRowForCurrentCargo, colNum);
                    }
                    // Siempre alinear la celda superior (sea fusionada o no)
                    const cellToAlign = worksheet.getCell(startRowForCurrentCargo, colNum);
                    cellToAlign.alignment = { vertical: "top", horizontal: "left", wrapText: true };
                    if (["rutinario", "nro_expuestos", "requisito_legal"].includes(key)) {
                        cellToAlign.alignment.horizontal = "center";
                    }
                });
            }
        }); // Fin forEach cargo

        // Combinar celda "Proceso"
        const finFilasProceso = currentRowIndex - 1;
        if (finFilasProceso > inicioFilasProceso) { // Solo fusionar si el proceso abarca más de una fila
            const colNumProceso = worksheet.getColumn("proceso").number;
            worksheet.mergeCells(inicioFilasProceso, colNumProceso, finFilasProceso, colNumProceso);
            const cellProceso = worksheet.getCell(inicioFilasProceso, colNumProceso);
            cellProceso.alignment = { vertical: "top", horizontal: "left", wrapText: true }; // Alinear arriba
        } else if (finFilasProceso === inicioFilasProceso && cargosEnEsteProceso.length > 0 && cargosEnEsteProceso[0].gesSeleccionados.length > 0) {
           // Si solo hay una fila, asegurar alineación top
             const cellProceso = worksheet.getCell(inicioFilasProceso, worksheet.getColumn("proceso").number);
             cellProceso.alignment = { vertical: "top", horizontal: "left", wrapText: true };
        }
    } // Fin for procesoNombre

    // --- ESTILOS FINALES Y BORDES ---
    for (let r = 1; r <= worksheet.rowCount; r++) {
        worksheet.getRow(r).eachCell({ includeEmpty: true }, (cell) => {
            // Aplicar bordes solo a la matriz (desde fila 7 en adelante)
            if (r >= 7) {
                cell.border = {
                    top: { style: "thin", color: { argb: "FF2d3238" } },
                    left: { style: "thin", color: { argb: "FF2d3238" } },
                    bottom: { style: "thin", color: { argb: "FF2d3238" } },
                    right: { style: "thin", color: { argb: "FF2d3238" } },
                };
            }
            // Aplica fuente base a celdas de datos (a partir de fila 9) si no tienen ya una fuente específica
            if (r >= 9 && !cell.font) {
                 // Asegúrate de no sobrescribir fuentes aplicadas por semaforización
                const existingFontColor = cell.font?.color?.argb;
                cell.font = {
                     name: "Raleway",
                     size: 10,
                     // Mantiene el color si ya existía (ej. texto blanco en celda oscura) o usa color del proyecto
                    color: { argb: existingFontColor || "FF2d3238" }
                 };
            }
             // Asegurar wrapText en todas las celdas de datos por si acaso
            if (r >= 9 && cell.alignment) {
                cell.alignment.wrapText = true;
            } else if (r >= 9) {
                 cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            }

        });
    }

    // Ajustar altura de filas de datos automáticamente (experimental, puede consumir recursos)
    // worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
    //     if (rowNumber >= 3) { // A partir de la fila de datos
    //         let maxHeight = 15; // Altura mínima por defecto
    //         row.eachCell({ includeEmpty: true }, function(cell) {
    //             if (cell.value) {
    //                 const text = cell.value.toString();
    //                 const lines = text.split('\\n').length;
    //                 // Estimación simple, ajustar según sea necesario
    //                 const estimatedHeight = lines * 12; // Ajustar multiplicador si es necesario
    //                  if (estimatedHeight > maxHeight) {
    //                     maxHeight = estimatedHeight;
    //                 }
    //                 // Considerar el wrapText y el ancho de columna (más complejo)
    //             }
    //         });
    //          row.height = maxHeight > 60 ? 60 : maxHeight; // Limitar altura máxima
    //     }
    // });


    console.log("Matriz Excel generada exitosamente.");
    return await workbook.xlsx.writeBuffer();
}

export { generarMatrizExcel }; // Exporta la función simplificada