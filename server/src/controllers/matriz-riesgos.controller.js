// server/src/controllers/matriz-riesgos.controller.js
import ExcelJS from "exceljs";
import {
    calcularNivelProbabilidad,
    calcularNivelRiesgo,
} from "../utils/risk-calculations.js";
import { GES_DATOS_PREDEFINIDOS } from "../config/ges-config.js";

// Genera SIEMPRE la matriz completa (versión Pro)
async function generarMatrizExcel(
    datosFormulario,
    { companyName = "Genesys Laboral Medicine" } = {} // Solo necesita companyName
) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Matriz de Riesgos GTC45");

    // Columnas siempre serán las completas
    const columnasCompletas = [
        { header: "Proceso", key: "proceso", width: 25 },
        { header: "Zona/Lugar", key: "zona_lugar", width: 25 },
        { header: "Actividades", key: "actividades", width: 30 },
        { header: "Tareas", key: "tareas", width: 35 },
        { header: "Rutinario (Si o No)", key: "rutinario", width: 12, style: { alignment: { horizontal: "center" } } },
        { header: "Descripción", key: "peligro_descripcion", width: 35 },
        { header: "Clasificación", key: "peligro_clasificacion", width: 20 },
        { header: "Efectos posibles", key: "efectos_posibles", width: 35 },
        { header: "Fuente", key: "control_fuente", width: 25 },
        { header: "Medio", key: "control_medio", width: 25 },
        { header: "Individuo", key: "control_individuo", width: 25 },
        { header: "Nivel de deficiencia", key: "nd", width: 10, style: { alignment: { horizontal: "center" } } },
        { header: "Nivel de exposición", key: "ne", width: 10, style: { alignment: { horizontal: "center" } } },
        { header: "Nivel de probabilidad (NP)", key: "np_valor", width: 12, style: { alignment: { horizontal: "center" } } },
        { header: "Nivel de Probabilidad (Categoría)", key: "np_nivel_categoria", width: 18, style: { alignment: { horizontal: "center" } } },
        { header: "Interpretación del nivel de probabilidad", key: "np_interpretacion", width: 30 },
        { header: "Nivel de consecuencia", key: "nc_valor", width: 10, style: { alignment: { horizontal: "center" } } },
        { header: "Nivel de riesgo (NR) e intervención", key: "nr_valor_intervencion", width: 12, style: { alignment: { horizontal: "center" } } },
        { header: "Nivel de Riesgo (Categoría)", key: "nr_interpretacion_nivel", width: 15, style: { alignment: { horizontal: "center" } } },
        { header: "Interpretación del NR", key: "nr_interpretacion_texto", width: 35 },
        { header: "Aceptabilidad del riesgo", key: "aceptabilidad_riesgo", width: 30 },
        { header: "Nro. Expuestos", key: "nro_expuestos", width: 10, style: { alignment: { horizontal: "center" } } },
        { header: "Peor consecuencia", key: "peor_consecuencia", width: 30 },
        { header: "Existencia requisito legal específico asociado (Si o No)", key: "requisito_legal", width: 18, style: { alignment: { horizontal: "center" } } },
        { header: "Eliminación", key: "medida_eliminacion", width: 30 },
        { header: "Sustitución", key: "medida_sustitucion", width: 30 },
        { header: "Controles de ingeniería", key: "medida_ctrl_ingenieria", width: 35 },
        { header: "Controles administrativos, Señalización, Advertencia", key: "medida_ctrl_admin", width: 40 },
        { header: "Equipos/ Elementos de protección personal", key: "epp", width: 40 },
    ];

    worksheet.columns = columnasCompletas;

    // --- ESTILOS DE CABECERA ---
    const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
    const headerFont = { bold: true, color: { argb: "FF000000" }, name: "Calibri", size: 10 };
    const headerAlignment = { vertical: "middle", horizontal: "center", wrapText: true };

    const groupHeaders = {
        Peligro: { start: 6, end: 8 },
        "Controles existentes": { start: 9, end: 11 },
        "Evaluación del riesgo": { start: 12, end: 20 },
        "Valoración del riesgo": { start: 21, end: 21 }, // Revisar si esto es correcto, parece un grupo de 1
        "Criterios para establecer controles": { start: 22, end: 24 },
        "Medidas intervención": { start: 25, end: 29 },
    };

    // --- LÓGICA DE ENCABEZADOS CORREGIDA ---
    const headersRow1 = worksheet.getRow(1);
    const headersRow2 = worksheet.getRow(2);
    headersRow1.height = 30; // Altura fila 1 (grupos)
    headersRow2.height = 40; // Altura fila 2 (específicos)

    // Aplicar estilos base a ambas filas de encabezado
    [headersRow1, headersRow2].forEach(row => {
        row.font = headerFont;
        row.fill = headerFill;
        row.alignment = headerAlignment;
    });

    // Colocar encabezados específicos en la Fila 2
    worksheet.columns.forEach((column, index) => {
        headersRow2.getCell(index + 1).value = column.header;
    });

    // Colocar encabezados agrupados en la Fila 1 y fusionar
    let currentHeaderCol = 1;
    worksheet.columns.forEach((col, index) => {
        const colNum = index + 1;
        let grouped = false;
        if (colNum >= currentHeaderCol) { // Solo procesar si no hemos saltado esta columna
            for (const groupName in groupHeaders) {
                const group = groupHeaders[groupName];
                if (colNum === group.start) {
                     // Asegurarse de que el rango de fusión sea válido (end >= start)
                    if (group.end >= group.start) {
                        worksheet.mergeCells(1, group.start, 1, group.end);
                        headersRow1.getCell(group.start).value = groupName;
                        // Establecer estilo explícito para la celda fusionada (a veces se pierde)
                        headersRow1.getCell(group.start).fill = headerFill;
                        headersRow1.getCell(group.start).font = headerFont;
                        headersRow1.getCell(group.start).alignment = headerAlignment;
                    } else {
                         // Si end < start, solo poner el título en la celda start sin fusionar
                        headersRow1.getCell(group.start).value = groupName;
                    }
                    currentHeaderCol = group.end + 1; // Saltar al final del grupo + 1
                    grouped = true;
                    break;
                }
            }
            // Si no pertenece a ningún grupo (y no hemos saltado ya)
            if (!grouped) {
                // Fusionar verticalmente la celda de la columna no agrupada
                worksheet.mergeCells(1, colNum, 2, colNum);
                headersRow1.getCell(colNum).value = col.header; // Poner header original en Fila 1
                 // Establecer estilo explícito para la celda fusionada
                headersRow1.getCell(colNum).fill = headerFill;
                headersRow1.getCell(colNum).font = headerFont;
                headersRow1.getCell(colNum).alignment = headerAlignment;

                headersRow2.getCell(colNum).value = ''; // Vaciar celda en Fila 2 ya que se fusionó
                currentHeaderCol = colNum + 1; // Mover a la siguiente columna
            }
        }
        // Si la columna está dentro de un grupo ya procesado (colNum < currentHeaderCol), no hacer nada para la fila 1.
    });
    // --- FIN LÓGICA ENCABEZADOS ---


    // --- PROCESAR Y AÑADIR DATOS ---
    let currentRowIndex = 3; // Los datos siempre empiezan en la fila 3
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
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } },
            };
            // Aplica fuente base a celdas de datos (a partir de fila 3) si no tienen ya una fuente específica
            if (r >= 3 && !cell.font) {
                 // Asegúrate de no sobrescribir fuentes aplicadas por semaforización
                const existingFontColor = cell.font?.color?.argb;
                cell.font = {
                     name: "Calibri",
                     size: 10,
                     // Mantiene el color si ya existía (ej. texto blanco en celda oscura) o usa negro
                    color: { argb: existingFontColor || "FF000000" }
                 };
            }
             // Asegurar wrapText en todas las celdas de datos por si acaso
            if (r >= 3 && cell.alignment) {
                cell.alignment.wrapText = true;
            } else if (r >= 3) {
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