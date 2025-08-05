// server/src/controllers/matriz-riesgos.controller.js
import ExcelJS from 'exceljs';
import crypto from 'crypto';
import db from '../config/database.js'; // <-- Importamos la conexión a la BD
import { calcularNivelProbabilidad, calcularNivelRiesgo } from '../utils/risk-calculations.js';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';
import { startDocumentGeneration } from './documentos.controller.js'; // <-- AÑADIDO

// La función generarMatrizExcel se actualiza para aceptar opciones y generar
// tanto la versión gratuita como la pro.
async function generarMatrizExcel(datosFormulario, options = { isFree: false }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Matriz de Riesgos GTC45');

    // Definimos las columnas para cada versión
    const columnasCompletas = [
        { header: 'Proceso', key: 'proceso', width: 25 },
        { header: 'Zona/Lugar', key: 'zona_lugar', width: 25 },
        { header: 'Actividades', key: 'actividades', width: 30 },
        { header: 'Tareas', key: 'tareas', width: 35 },
        { header: 'Rutinario (Si o No)', key: 'rutinario', width: 12, style: { alignment: { horizontal: 'center' } } },
        { header: 'Descripción', key: 'peligro_descripcion', width: 35 },
        { header: 'Clasificación', key: 'peligro_clasificacion', width: 20 },
        { header: 'Efectos posibles', key: 'efectos_posibles', width: 35 },
        { header: 'Fuente', key: 'control_fuente', width: 25 },
        { header: 'Medio', key: 'control_medio', width: 25 },
        { header: 'Individuo', key: 'control_individuo', width: 25 },
        { header: 'Nivel de deficiencia', key: 'nd', width: 10, style: { alignment: { horizontal: 'center' } } },
        { header: 'Nivel de exposición', key: 'ne', width: 10, style: { alignment: { horizontal: 'center' } } },
        { header: 'Nivel de probabilidad (NP)', key: 'np_valor', width: 12, style: { alignment: { horizontal: 'center' } } },
        { header: 'Nivel de Probabilidad (Categoría)', key: 'np_nivel_categoria', width: 18, style: { alignment: { horizontal: 'center' } } },
        { header: 'Interpretación del nivel de probabilidad', key: 'np_interpretacion', width: 30 },
        { header: 'Nivel de consecuencia', key: 'nc_valor', width: 10, style: { alignment: { horizontal: 'center' } } },
        { header: 'Nivel de riesgo (NR) e intervención', key: 'nr_valor_intervencion', width: 12, style: { alignment: { horizontal: 'center' } } },
        { header: 'Nivel de Riesgo (Categoría)', key: 'nr_interpretacion_nivel', width: 15, style: { alignment: { horizontal: 'center' } } },
        { header: 'Interpretación del NR', key: 'nr_interpretacion_texto', width: 35 },
        { header: 'Aceptabilidad del riesgo', key: 'aceptabilidad_riesgo', width: 30 },
        { header: 'Nro. Expuestos', key: 'nro_expuestos', width: 10, style: { alignment: { horizontal: 'center' } } },
        { header: 'Peor consecuencia', key: 'peor_consecuencia', width: 30 },
        { header: 'Existencia requisito legal específico asociado (Si o No)', key: 'requisito_legal', width: 18, style: { alignment: { horizontal: 'center' } } },
        { header: 'Eliminación', key: 'medida_eliminacion', width: 30 },
        { header: 'Sustitución', key: 'medida_sustitucion', width: 30 },
        { header: 'Controles de ingeniería', key: 'medida_ctrl_ingenieria', width: 35 },
        { header: 'Controles administrativos, Señalización, Advertencia', key: 'medida_ctrl_admin', width: 40 },
        { header: 'Equipos/ Elementos de protección personal', key: 'epp', width: 40 }
    ];

    const columnasGratuitas = [
        { header: 'Proceso', key: 'proceso', width: 25 },
        { header: 'Zona/Lugar', key: 'zona_lugar', width: 25 },
        { header: 'Actividades', key: 'actividades', width: 30 },
        { header: 'Tareas', key: 'tareas', width: 35 },
        { header: 'Rutinario (Si o No)', key: 'rutinario', width: 12, style: { alignment: { horizontal: 'center' } } },
        { header: 'Descripción', key: 'peligro_descripcion', width: 35 },
        { header: 'Clasificación', key: 'peligro_clasificacion', width: 20 },
        { header: 'Efectos posibles', key: 'efectos_posibles', width: 35 },
        { header: 'Nro. Expuestos', key: 'nro_expuestos', width: 10, style: { alignment: { horizontal: 'center' } } },
        { header: 'Peor consecuencia', key: 'peor_consecuencia', width: 30 },
        { header: 'Interpretación del NR', key: 'nr_interpretacion_texto', width: 35 },
        { header: 'Equipos/ Elementos de protección personal', key: 'epp', width: 40 }
    ];

    // Se elige qué conjunto de columnas usar
    worksheet.columns = options.isFree ? columnasGratuitas : columnasCompletas;
    
    // El resto de la función (colores, estilos de cabecera, procesamiento de datos)
    // se mantiene igual, ya que solo se usan las columnas definidas arriba.
    // Colores para semaforización (AJUSTAR A LOS COLORES DEL FORMULARIO)
    const coloresNiveles = {
        deficiencia: { 10: 'FFF44336', 6: 'FFFF9800', 2: 'FFFFEB3B', 0: 'FF4CAF50' },
        exposicion: { 4: 'FFF44336', 3: 'FFFF9800', 2: 'FFFFEB3B', 1: 'FF4CAF50' },
        consecuencia: { 100: 'FFF44336', 60: 'FFFF9800', 25: 'FFFFEB3B', 10: 'FF4CAF50' }
    };
    const coloresNivelProbabilidadCategoria = {
        'Muy Alto': 'FFF44336', 'Alto': 'FFFF9800', 'Medio': 'FFFFEB3B', 'Bajo': 'FF4CAF50'
    };

    // --- 2. ESTILOS DE CABECERA ---
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }; 
    const headerFont = { bold: true, color: { argb: 'FF000000' }, name: 'Calibri', size: 10 };
    const headerAlignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    
    // Aplicar estilos a la cabecera principal (fila 1)
    const mainHeaderRow = worksheet.getRow(1);
    mainHeaderRow.font = { ...headerFont, size: 11 };
    mainHeaderRow.fill = headerFill;
    mainHeaderRow.alignment = headerAlignment;
    mainHeaderRow.height = 30;

    // Aplicar estilos a la sub-cabecera (fila 2) si no es la versión gratuita
    if (!options.isFree) {
        const subHeaderRow = worksheet.getRow(2);
        subHeaderRow.font = headerFont;
        subHeaderRow.fill = headerFill;
        subHeaderRow.alignment = headerAlignment;
        subHeaderRow.height = 40;

        const groupHeaders = {
            'Peligro': { start: 6, end: 8 },
            'Controles existentes': { start: 9, end: 11 },
            'Evaluación del riesgo': { start: 12, end: 20 },
            'Valoración del riesgo': { start: 21, end: 21 },
            'Criterios para establecer controles': { start: 22, end: 24 },
            'Medidas intervención': { start: 25, end: 29 }
        };
        
        worksheet.columns.forEach((col, index) => {
            const colNum = index + 1;
            let isGrouped = false;
            for (const groupName in groupHeaders) {
                const group = groupHeaders[groupName];
                if (colNum >= group.start && colNum <= group.end) {
                    if (colNum === group.start) {
                        worksheet.mergeCells(1, group.start, 1, group.end);
                        worksheet.getCell(1, group.start).value = groupName;
                    }
                    worksheet.getCell(2, colNum).value = col.header;
                    isGrouped = true;
                    break;
                }
            }
            if (!isGrouped) {
                worksheet.mergeCells(1, colNum, 2, colNum);
                worksheet.getCell(1, colNum).value = col.header;
            }
        });
    } else {
        // En la versión gratuita, simplemente ponemos los headers en la primera fila
        worksheet.getRow(1).values = worksheet.columns.map(c => c.header);
    }


    // --- 3. PROCESAR Y AÑADIR DATOS CON AGRUPACIÓN ---
    let currentRowIndex = options.isFree ? 2 : 3; // Empezar en la fila 2 si es gratis
    
    const cargosPorProceso = datosFormulario.cargos.reduce((acc, cargo) => {
        const proceso = cargo.area;
        if (!acc[proceso]) {
            acc[proceso] = [];
        }
        acc[proceso].push(cargo);
        return acc;
    }, {});

    for (const procesoNombre in cargosPorProceso) {
        const cargosEnEsteProceso = cargosPorProceso[procesoNombre];
        const inicioFilasProceso = currentRowIndex;

        cargosEnEsteProceso.forEach((cargo) => {
            const gesSeleccionados = cargo.gesSeleccionados || [];
            if (gesSeleccionados.length === 0) return;

            const startRowForCurrentCargo = currentRowIndex;

            const gesAgrupadosPorClasificacion = gesSeleccionados.reduce((acc, ges) => {
                const clasificacion = ges.riesgo;
                if (!acc[clasificacion]) acc[clasificacion] = [];
                acc[clasificacion].push(ges);
                return acc;
            }, {});

            for (const clasificacionKey in gesAgrupadosPorClasificacion) {
                const gesDeMismaClasificacion = gesAgrupadosPorClasificacion[clasificacionKey];
                const startRowForClasificacion = currentRowIndex;

                gesDeMismaClasificacion.forEach((ges) => {
                    const datosGesPredefinidos = GES_DATOS_PREDEFINIDOS[ges.ges] || {};
                    let nivelProb = { valor: 0, interpretacion: 'N/A', nivel: 'N/A' };
                    let nivelRiesgo = { valor: 0, interpretacion: 'N/A', nivel: 'N/A', aceptabilidad: 'N/A', color: 'FFFFFFFF' };

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
                    } catch (e) { console.error("Error cálculo niveles:", e); }
                    
                    const rowData = {
                        proceso: cargo.area, 
                        zona_lugar: cargo.zona,
                        actividades: cargo.cargoName,
                        tareas: cargo.descripcionTareas || 'No especificado',
                        rutinario: cargo.tareasRutinarias ? 'Si' : 'No',
                        peligro_descripcion: ges.ges,
                        peligro_clasificacion: ges.riesgo, 
                        efectos_posibles: datosGesPredefinidos.consecuencias || 'No especificado',
                        control_fuente: ges.controles?.fuente || 'Ninguno',
                        control_medio: ges.controles?.medio || 'Ninguno',
                        control_individuo: ges.controles?.individuo || 'Ninguno',
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
                        nro_expuestos: cargo.numTrabajadores,
                        peor_consecuencia: datosGesPredefinidos.peorConsecuencia || 'No especificado',
                        requisito_legal: 'Si', 
                        medida_eliminacion: datosGesPredefinidos.medidasIntervencion?.eliminacion || '',
                        medida_sustitucion: datosGesPredefinidos.medidasIntervencion?.sustitucion || '',
                        medida_ctrl_ingenieria: datosGesPredefinidos.medidasIntervencion?.controlesIngenieria || '',
                        medida_ctrl_admin: datosGesPredefinidos.medidasIntervencion?.controlesAdministrativos || '',
                        epp: datosGesPredefinidos.elementosProteccion || ''
                    };
                    const addedRow = worksheet.addRow(rowData);

                    // Aplicar semaforización de celdas SOLO si no es la versión gratuita
                    if (!options.isFree) {
                        const ndCell = addedRow.getCell('nd');
                        const neCell = addedRow.getCell('ne');
                        const ncCell = addedRow.getCell('nc_valor');
                        if (coloresNiveles.deficiencia[rowData.nd]) ndCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coloresNiveles.deficiencia[rowData.nd] } };
                        if (coloresNiveles.exposicion[rowData.ne]) neCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coloresNiveles.exposicion[rowData.ne] } };
                        if (coloresNiveles.consecuencia[rowData.nc_valor]) ncCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coloresNiveles.consecuencia[rowData.nc_valor] } };
                        
                        const npCategoriaCell = addedRow.getCell('np_nivel_categoria');
                        if (coloresNivelProbabilidadCategoria[nivelProb.nivel]) npCategoriaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: coloresNivelProbabilidadCategoria[nivelProb.nivel] } };
        
                        const nrValorCell = addedRow.getCell('nr_valor_intervencion');
                        const nrCategoriaCell = addedRow.getCell('nr_interpretacion_nivel');
                        if (nivelRiesgo.color) {
                            const bgColorHex = nivelRiesgo.color.replace('#', '').toUpperCase();
                            const cellFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColorHex } };
                            nrValorCell.fill = cellFill;
                            nrCategoriaCell.fill = cellFill;
                            const fontColor = (bgColorHex === 'FF0000' || bgColorHex === 'FFA500' || bgColorHex === '000000') ? 'FFFFFFFF' : 'FF000000';
                            const fontStyle = { color: { argb: fontColor }, name: 'Calibri', size: 10 };
                            nrValorCell.font = fontStyle;
                            nrCategoriaCell.font = fontStyle;
                        }
                    }
    
                    // ***************************************************
                    // * MODIFICACIÓN: Quitar altura fija de la fila     *
                    // ***************************************************
                    // addedRow.height = 20; // Línea eliminada
    
                    addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                       const columnKey = worksheet.getColumn(colNumber).key;
                       // Asegurar que todas las celdas de datos tengan wrapText
                       cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                       const centeredKeys = ['rutinario', 'nd', 'ne', 'np_valor', 'np_nivel_categoria', 'nc_valor', 'nr_valor_intervencion', 'nr_interpretacion_nivel', 'nro_expuestos', 'requisito_legal'];
                       if (centeredKeys.includes(columnKey)) {
                           cell.alignment.horizontal = 'center';
                       }
                    });
                    currentRowIndex++;
                });

                // Combinar celda "Clasificación" - SOLO PARA VERSIÓN PRO
                if (!options.isFree && gesDeMismaClasificacion.length > 1) {
                    const endRowForClasificacion = currentRowIndex - 1;
                    worksheet.mergeCells(startRowForClasificacion, worksheet.getColumn('peligro_clasificacion').number, endRowForClasificacion, worksheet.getColumn('peligro_clasificacion').number);
                    const cellClasificacion = worksheet.getCell(startRowForClasificacion, worksheet.getColumn('peligro_clasificacion').number);
                    cellClasificacion.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
                }
            }

            // Combinar celdas comunes del CARGO - SOLO PARA VERSIÓN PRO
            const endRowForCurrentCargo = currentRowIndex - 1;
            if (!options.isFree && endRowForCurrentCargo >= startRowForCurrentCargo && gesSeleccionados.length > 0) {
                const keysCargoComun = ['zona_lugar', 'actividades', 'tareas', 'rutinario', 'nro_expuestos', 'requisito_legal'];
                keysCargoComun.forEach(key => {
                    const colNum = worksheet.getColumn(key).number;
                    if (endRowForCurrentCargo > startRowForCurrentCargo) {
                         worksheet.mergeCells(startRowForCurrentCargo, colNum, endRowForCurrentCargo, colNum);
                    }
                    const cellToAlign = worksheet.getCell(startRowForCurrentCargo, colNum);
                    cellToAlign.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
                    if (['rutinario', 'nro_expuestos', 'requisito_legal'].includes(key)) {
                        cellToAlign.alignment.horizontal = 'center';
                    }
                });
            }
        });

        // Combinar celda "Proceso" - SOLO PARA VERSIÓN PRO
        const finFilasProceso = currentRowIndex - 1;
        if (!options.isFree && finFilasProceso >= inicioFilasProceso && finFilasProceso > inicioFilasProceso) { 
            worksheet.mergeCells(inicioFilasProceso, worksheet.getColumn('proceso').number, finFilasProceso, worksheet.getColumn('proceso').number);
            const cellProceso = worksheet.getCell(inicioFilasProceso, worksheet.getColumn('proceso').number);
            cellProceso.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        } else if (!options.isFree && finFilasProceso === inicioFilasProceso && cargosEnEsteProceso.length > 0 && cargosEnEsteProceso[0].gesSeleccionados.length > 0) {
            const cellProceso = worksheet.getCell(inicioFilasProceso, worksheet.getColumn('proceso').number);
            cellProceso.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        }
    }
    
    // --- 5. ESTILOS FINALES Y BORDES ---
    // (Ajustar el inicio del bucle de bordes)
    for (let r = 1; r <= worksheet.rowCount; r++) {
        worksheet.getRow(r).eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
            if (r > (options.isFree ? 1 : 2) && !cell.font) { 
                 cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000'} };
            }
        });
    }

    return await workbook.xlsx.writeBuffer();
}


/**
 * NUEVO Controlador para manejar el envío del formulario.
 * Guarda los datos en la BD y devuelve una URL de redirección.
 */
const handleFormSubmission = async (req, res) => {
    const formData = req.body;

    console.log('--- DATOS RECIBIDOS EN EL SERVIDOR (BACKEND) ---');
    console.log(JSON.stringify(formData, null, 2));
    console.log('-----------------------------------------------');

    // Extraer datos del cliente (asumiendo que vienen en el formulario)
    // NECESITAREMOS un formulario de contacto al inicio o al final del flujo.
    // Por ahora, usaremos datos de ejemplo.
    const contactData = {
        fullName: formData.contact?.fullName || 'Usuario de Prueba',
        email: formData.contact?.email || `test-${Date.now()}@example.com`,
        phone: formData.contact?.phone || 'N/A',
        companyName: formData.contact?.companyName || 'Empresa de Prueba',
    };

    let trx;
    try {
        // Iniciar una transacción
        trx = await db.transaction();

        // 1. Buscar o crear el usuario
        let user = await trx('users').where('email', contactData.email).first();
        let userId;

        if (user) {
            userId = user.id;
        } else {
            const [newUser] = await trx('users').insert({
                full_name: contactData.fullName,
                email: contactData.email,
                phone: contactData.phone,
                company_name: contactData.companyName,
            }).returning('id');
            userId = newUser.id;
        }

        // 2. Generar un token seguro
        const token = crypto.randomBytes(32).toString('hex');

        // 3. Crear el conjunto de documentos
        await trx('document_sets').insert({
            user_id: userId,
            token: token,
            form_data: JSON.stringify(formData), // Guardamos todos los datos del formulario
            status: 'pending', // Lo marcamos como pendiente
        });

        // Si todo va bien, confirmar la transacción
        await trx.commit();

        // ¡NUEVO! Iniciar la generación de documentos en segundo plano
        startDocumentGeneration(token);

        // 4. Enviar la URL de redirección al frontend
        const redirectUrl = `/pages/resultados.html?token=${token}`; 
        
        res.status(200).json({
            success: true,
            message: 'Datos guardados correctamente.',
            redirectUrl: redirectUrl
        });

    } catch (error) {
        // Si algo falla, deshacer la transacción
        if (trx) {
            await trx.rollback();
        }
        console.error('Error al procesar el formulario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al procesar su solicitud.'
        });
    }
};

// Exportamos ambas funciones. La antigua se usará después.
export { generarMatrizExcel, handleFormSubmission };