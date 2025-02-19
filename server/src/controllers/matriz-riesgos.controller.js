// server/src/controllers/matriz-riesgos.controller.js
import ExcelJS from 'exceljs';
import { calcularNivelProbabilidad, calcularNivelRiesgo } from '../utils/risk-calculations.js';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';

export async function generarMatrizExcel(datosFormulario) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Matriz de Riesgos');

    // Configurar columnas con los ajustes solicitados
    worksheet.columns = [
        { header: 'Proceso', key: 'proceso', width: 20 },
        { header: 'Proceso/Zona/Lugar', key: 'zona', width: 20 },
        { header: 'Actividades', key: 'actividades', width: 25 },
        { header: 'Actividades/Tareas', key: 'tareas', width: 25 },
        { header: 'Rutinario (Si/No)', key: 'rutinario', width: 15 },
        { header: 'Peligro - Descripción', key: 'peligro', width: 30 },
        { header: 'Clasificación', key: 'clasificacion', width: 20 },
        { header: 'Efectos Posibles', key: 'efectos', width: 30 },
        // Controles existentes
        { header: 'Control Fuente', key: 'controlFuente', width: 20 },
        { header: 'Control Medio', key: 'controlMedio', width: 20 },
        { header: 'Control Individuo', key: 'controlIndividuo', width: 20 },
        // Evaluación del riesgo
        { header: 'ND', key: 'nivelDeficiencia', width: 8 },
        { header: 'NE', key: 'nivelExposicion', width: 8 },
        { header: 'NP', key: 'nivelProbabilidad', width: 8 },
        { header: 'Interpretación NP', key: 'interpretacionNP', width: 25 },
        { header: 'NC', key: 'nivelConsecuencia', width: 8 },
        { header: 'NR', key: 'nivelRiesgo', width: 8 },
        { header: 'Interpretación NR', key: 'interpretacionNR', width: 25 },
        { header: 'Aceptabilidad del Riesgo', key: 'aceptabilidad', width: 20 },
        { header: 'Nro. Expuestos', key: 'nroExpuestos', width: 15 },
        { header: 'Peor Consecuencia', key: 'peorConsecuencia', width: 25 },
        { header: 'EPP y Elementos de Confort', key: 'epp', width: 30 },
        { header: 'Eliminación', key: 'eliminacion', width: 30 },
        { header: 'Sustitución', key: 'sustitucion', width: 30 },
        { header: 'Controles de Ingeniería', key: 'controlesIngenieria', width: 30 },
        { header: 'Controles Administrativos', key: 'controlesAdmin', width: 30 }
    ];

    // Procesar cada cargo y sus GES
    datosFormulario.cargos.forEach(cargo => {
        cargo.gesSeleccionados.forEach(ges => {
            const datosPredefinidos = GES_DATOS_PREDEFINIDOS[ges.ges] || {};
            
            // Calcular niveles
            const nivelProb = calcularNivelProbabilidad(
                ges.niveles.deficiencia.value,
                ges.niveles.exposicion.value
            );
            
            const nivelRiesgo = calcularNivelRiesgo(
                nivelProb.valor,
                ges.niveles.consecuencia.value
            );

            // Crear interpretaciones con formato solicitado
            const interpretacionNP = `(${nivelProb.nivel}) ${nivelProb.interpretacion}`;
            const interpretacionNR = `(${nivelRiesgo.nivel}) ${nivelRiesgo.interpretacion}`;

            worksheet.addRow({
                proceso: cargo.area,
                zona: cargo.zona,
                actividades: cargo.cargoName,
                tareas: cargo.descripcionTareas,
                rutinario: cargo.tareasRutinarias ? 'Si' : 'No',
                peligro: ges.ges,
                clasificacion: ges.riesgo,
                efectos: datosPredefinidos.consecuencias || '',
                controlFuente: ges.controles?.fuente || 'No existe',
                controlMedio: ges.controles?.medio || 'No existe',
                controlIndividuo: ges.controles?.individuo || 'No existe',
                nivelDeficiencia: ges.niveles.deficiencia.value,
                nivelExposicion: ges.niveles.exposicion.value,
                nivelProbabilidad: nivelProb.valor,
                interpretacionNP: interpretacionNP,
                nivelConsecuencia: ges.niveles.consecuencia.value,
                nivelRiesgo: nivelRiesgo.valor,
                interpretacionNR: interpretacionNR,
                aceptabilidad: nivelRiesgo.aceptabilidad,
                nroExpuestos: Number(cargo.numTrabajadores), // Convertir a número
                peorConsecuencia: datosPredefinidos.peorConsecuencia || '',
                epp: datosPredefinidos.elementosProteccion || '',
                eliminacion: datosPredefinidos.medidasIntervencion?.eliminacion || '',
                sustitucion: datosPredefinidos.medidasIntervencion?.sustitucion || '',
                controlesIngenieria: datosPredefinidos.medidasIntervencion?.controlesIngenieria || '',
                controlesAdmin: datosPredefinidos.medidasIntervencion?.controlesAdministrativos || ''
            });

            // Obtener la última fila añadida
            const row = worksheet.lastRow;

            // Establecer formato numérico para la columna de Nro. Expuestos
            const nroExpuestosCell = row.getCell('nroExpuestos');
            nroExpuestosCell.numFmt = '0';

            // Aplicar color según nivel de riesgo
            const celdaNR = row.getCell('nivelRiesgo');
            celdaNR.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: nivelRiesgo.color.replace('#', '') }
            };
        });
    });

    // Aplicar estilos a la tabla
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.border = {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            };
            cell.alignment = { 
                vertical: 'middle',
                horizontal: 'left',
                wrapText: true
            };
            
            if (rowNumber === 1) {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '4472C4' }
                };
                cell.alignment.horizontal = 'center';
            }
        });
        row.height = 35; // Altura consistente para todas las filas
    });

    return await workbook.xlsx.writeBuffer();
}