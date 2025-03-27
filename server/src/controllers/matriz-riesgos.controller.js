// server/src/controllers/matriz-riesgos.controller.js
import ExcelJS from 'exceljs';
import { calcularNivelProbabilidad, calcularNivelRiesgo } from '../utils/risk-calculations.js';

export async function generarMatrizExcel(datosFormulario) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Matriz de Riesgos');

    // Configurar columnas según el formato requerido
    worksheet.columns = [
        { header: 'Proceso', key: 'proceso', width: 15 },
        { header: 'Actividades', key: 'actividades', width: 20 },
        { header: 'Rutinario (Si o No)', key: 'rutinario', width: 10 },
        { header: 'Descripción', key: 'descripcion', width: 30 },
        { header: 'Clasificación', key: 'clasificacion', width: 15 },
        { header: 'Efectos Posibles', key: 'efectos', width: 30 },
        // Controles existentes
        { header: 'Fuente', key: 'control_fuente', width: 15 },
        { header: 'Medio', key: 'control_medio', width: 15 },
        { header: 'Individuo', key: 'control_individuo', width: 15 },
        // Evaluación del riesgo
        { header: 'Nivel de deficiencia', key: 'nd', width: 10 },
        { header: 'Nivel de exposición', key: 'ne', width: 10 },
        { header: 'Nivel de probabilidad (ND x NE)', key: 'np', width: 10 },
        { header: 'Interpretación del nivel de probabilidad', key: 'int_np', width: 20 },
        { header: 'Nivel de consecuencia', key: 'nc', width: 10 },
        { header: 'Nivel de riesgo (NR)', key: 'nr', width: 10 },
        { header: 'Interpretación del NR', key: 'int_nr', width: 20 },
        // Valoración del riesgo
        { header: 'Aceptabilidad del riesgo', key: 'aceptabilidad', width: 20 },
        // Criterios para establecer controles
        { header: 'Nro. Expuestos', key: 'nro_expuestos', width: 10 },
        { header: 'Peor consecuencia', key: 'peor_consecuencia', width: 25 },
        { header: 'Requisito legal', key: 'requisito_legal', width: 10 },
        // Medidas de intervención
        { header: 'Eliminación', key: 'eliminacion', width: 20 },
        { header: 'Sustitución', key: 'sustitucion', width: 20 },
        { header: 'Controles de ingeniería', key: 'controles_ingenieria', width: 20 },
        { header: 'Controles administrativos', key: 'controles_admin', width: 20 },
        { header: 'Equipos / EPP', key: 'epp', width: 20 }
    ];

    // Aplicar estilos a la cabecera
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Procesar datos por cargo para poder combinar celdas
    let startRow = 2; // Comenzamos en la fila 2 (después del encabezado)

    datosFormulario.cargos.forEach(cargo => {
        const gesCount = cargo.gesSeleccionados.length;
        if (gesCount === 0) return; // Saltar si no hay GES seleccionados

        // Datos del cargo que se repetirán en múltiples filas
        const datosCargo = {
            proceso: cargo.area,
            actividades: cargo.cargoName,
            rutinario: cargo.tareasRutinarias ? 'Si' : 'No',
            efectos: cargo.descripcionTareas || 'No especificado',
            nro_expuestos: cargo.numTrabajadores,
            peor_consecuencia: 'Muerte', // Por defecto según requerimiento
            requisito_legal: 'Si'
        };

        // Para cada GES, agregar una fila con datos específicos del GES
        cargo.gesSeleccionados.forEach((ges, idx) => {
            // Calcular niveles
            let nivelProb;
            let nivelRiesgo;

            try {
                // Intentar calcular con los valores proporcionados
                nivelProb = calcularNivelProbabilidad(
                    ges.niveles?.deficiencia?.value,
                    ges.niveles?.exposicion?.value
                );
                
                nivelRiesgo = calcularNivelRiesgo(
                    nivelProb.valor,
                    ges.niveles?.consecuencia?.value
                );
            } catch (error) {
                // Valores por defecto si hay error en el cálculo
                console.error('Error al calcular niveles:', error);
                nivelProb = { valor: 0, interpretacion: 'No determinado' };
                nivelRiesgo = { 
                    valor: 0, 
                    interpretacion: 'No determinado',
                    aceptabilidad: 'No determinado',
                    color: '#FFFFFF'
                };
            }

            // Crear la fila con datos del cargo y específicos del GES
            const rowData = {
                ...datosCargo,
                descripcion: ges.ges,
                clasificacion: ges.riesgo,
                control_fuente: ges.controles?.fuente || '',
                control_medio: ges.controles?.medio || '',
                control_individuo: ges.controles?.individuo || '',
                nd: ges.niveles?.deficiencia?.value || 0,
                ne: ges.niveles?.exposicion?.value || 0,
                np: nivelProb.valor,
                int_np: nivelProb.interpretacion,
                nc: ges.niveles?.consecuencia?.value || 0,
                nr: nivelRiesgo.valor,
                int_nr: nivelRiesgo.interpretacion,
                aceptabilidad: nivelRiesgo.aceptabilidad,
                eliminacion: '',  // Campos para futuras mejoras
                sustitucion: '',
                controles_ingenieria: '',
                controles_admin: '',
                epp: ''
            };

            worksheet.addRow(rowData);

            // Aplicar color según nivel de riesgo
            const ultimaFila = worksheet.lastRow;
            const celdaNR = ultimaFila.getCell('nr');
            if (nivelRiesgo.color) {
                celdaNR.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: nivelRiesgo.color.replace('#', '') }
                };
            }
        });

        // Si hay múltiples GES para este cargo, combinar las celdas con información común
        if (gesCount > 1) {
            const endRow = startRow + gesCount - 1;

            // Columnas con información común del cargo
            const columnasACombinar = ['A', 'B', 'C', 'F', 'R', 'S', 'T'];
            
            // Combinar celdas para cada columna
            columnasACombinar.forEach(col => {
                worksheet.mergeCells(`${col}${startRow}:${col}${endRow}`);
                // Centrar verticalmente el texto en las celdas combinadas
                worksheet.getCell(`${col}${startRow}`).alignment = { 
                    vertical: 'middle', 
                    horizontal: col === 'F' ? 'left' : 'center' // Alineación especial para descripción
                };
            });
        }

        // Actualizar la fila de inicio para el siguiente cargo
        startRow += gesCount;
    });

    // Aplicar bordes a todas las celdas con datos
    const lastRow = worksheet.rowCount;
    const lastCol = worksheet.columnCount;
    
    for (let row = 1; row <= lastRow; row++) {
        for (let col = 1; col <= lastCol; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    // Ajustar altura automática para todas las filas
    worksheet.eachRow({ includeEmpty: false }, function(row) {
        row.height = 25; // Altura mínima para todas las filas
    });

    return await workbook.xlsx.writeBuffer();
}