// server/src/controllers/matriz-riesgos.controller.js
import ExcelJS from 'exceljs';
import { calcularNivelProbabilidad, calcularNivelRiesgo } from '../utils/risk-calculations.js';
import { NIVEL_DEFICIENCIA, NIVEL_EXPOSICION, NIVEL_CONSECUENCIA } from '../config/gtc45.config.js';

export async function generarMatrizExcel(datosFormulario) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Matriz de Riesgos');
    worksheet.properties.defaultRowHeight = 20;
    worksheet.properties.protection = { 
        selectLockedCells: true,
        selectUnlockedCells: true
    };

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

    // Procesar datos y añadir filas
    datosFormulario.cargos.forEach(cargo => {
        cargo.gesSeleccionados.forEach(ges => {
            // Calcular niveles
            const nivelProb = calcularNivelProbabilidad(
                ges.niveles.deficiencia.value,
                ges.niveles.exposicion.value
            );
            
            const nivelRiesgo = calcularNivelRiesgo(
                nivelProb.valor,
                ges.niveles.consecuencia.value
            );

            worksheet.addRow({
                proceso: cargo.area,
                actividades: cargo.cargoName,
                rutinario: cargo.tareasRutinarias ? 'Si' : 'No',
                descripcion: ges.ges,
                clasificacion: ges.riesgo,
                efectos: cargo.descripcionTareas || 'No especificado',
                control_fuente: ges.controles?.fuente || '',
                control_medio: ges.controles?.medio || '',
                control_individuo: ges.controles?.individuo || '',
                nd: ges.niveles.deficiencia.value,
                ne: ges.niveles.exposicion.value,
                np: nivelProb.valor,
                int_np: nivelProb.interpretacion,
                nc: ges.niveles.consecuencia.value,
                nr: nivelRiesgo.valor,
                int_nr: nivelRiesgo.interpretacion,
                aceptabilidad: nivelRiesgo.aceptabilidad,
                nro_expuestos: cargo.numTrabajadores,
                peor_consecuencia: 'Muerte', // Por defecto según requerimiento
                requisito_legal: 'Si',
                eliminacion: '',  // Estos campos vendrán de una futura mejora
                sustitucion: '',
                controles_ingenieria: '',
                controles_admin: '',
                epp: ''
            });

            // Aplicar color según nivel de riesgo
            const ultimaFila = worksheet.lastRow;
            const celdaNR = ultimaFila.getCell('nr');
            celdaNR.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: nivelRiesgo.color.replace('#', '') }
            };
        });
    });

    // Aplicar estilos a la cabecera
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' }
    };

    return await workbook.xlsx.writeBuffer();
}