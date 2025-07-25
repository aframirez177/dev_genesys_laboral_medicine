import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';
import { EXAM_DETAILS } from '../config/exam-details-config.js';

// Función para añadir la fuente (simplificada por ahora)
function addPoppinsFont(doc) {
    doc.setFont('helvetica');
}

/**
 * Genera el documento de Profesiograma en formato PDF.
 * @param {object} datosFormulario - Los datos del formulario de matriz de riesgos.
 * @param {object} options - Opciones para la generación (ej. { isFree: true }).
 * @returns {Buffer} - El buffer del PDF generado.
 */
export async function generarProfesiogramaPDF(datosFormulario) {
    const doc = new jsPDF();
    doc.setFont('helvetica');

    const companyName = datosFormulario.contact?.companyName || 'Nombre de la Empresa';
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    
    // --- Estructura del Header ---
    const addHeader = (doc, companyName) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('PROFESIOGRAMA DE CARGOS (DIAGNÓSTICO)', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(companyName, pageWidth / 2, 28, { align: 'center' });
    };

    // --- Estructura del Footer ---
    const addFooter = (doc) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const footerText = `Página ${doc.internal.getNumberOfPages()} de ${doc.internal.getNumberOfPages()} | Documento de diagnóstico generado por Genesys Laboral Medicine`;
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    // Función para añadir una sección de texto
    const drawSection = (doc, title, content, startY) => {
        doc.setFontSize(10).setFont('helvetica', 'bold');
        doc.text(title, margin, startY);
        startY += 6;
        doc.setFontSize(9).setFont('helvetica', 'normal');
        doc.text(content, margin, startY);
        startY += 10; // Espacio entre secciones
        return startY;
    };

    datosFormulario.cargos.forEach((cargo, index) => {
        if (index > 0) doc.addPage();
        addHeader(doc, companyName);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(`Cargo: ${cargo.cargoName}`, margin, 45);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Área: ${cargo.area}`, margin, 52);

        // 1. Lógica Sólida de Compilación de Exámenes
        const examenesRecomendados = new Set();

        cargo.gesSeleccionados.forEach(ges => {
            const gesConfig = GES_DATOS_PREDEFINIDOS[ges.ges];
            if (!gesConfig || !gesConfig.examenesMedicos) return;

            Object.entries(gesConfig.examenesMedicos).forEach(([code, aplica]) => {
                if (aplica === true) {
                    examenesRecomendados.add(code);
                }
            });
        });

        // 2. Aplicar Reglas de Negocio Obligatorias y de Supresión
        const condicionesEspeciales = [];
        let requiereCursoAlimentos = false;

        if (cargo.trabajaAlturas) {
            examenesRecomendados.add('EMOA');
            examenesRecomendados.delete('EMO'); // Suprimir EMO si EMOA está presente
            condicionesEspeciales.push('- Realiza trabajo en alturas.');
        }
        if (cargo.manipulaAlimentos) {
            examenesRecomendados.add('EMOMP');
            examenesRecomendados.delete('EMO'); // Suprimir EMO si EMOMP está presente
            condicionesEspeciales.push('- Realiza manipulación de alimentos.');
            requiereCursoAlimentos = true;
        }
        
        // 3. Maquetar el PDF con la lógica mejorada
        let y = 70;
        doc.setFontSize(12).setFont('helvetica', 'bold');
        doc.text('Exámenes Médicos Ocupacionales Sugeridos', margin, y);
        y += 6;

        const checkMark = '✓'; // Símbolo de chulito

        const examenesTableBody = Array.from(examenesRecomendados).map(code => {
            const detalle = EXAM_DETAILS[code] || { fullName: code };
            return [detalle.fullName, checkMark, checkMark, checkMark]; // Usar el chulito
        });

        doc.autoTable({
            startY: y,
            head: [['Examen Sugerido', 'Ingreso', 'Periódico', 'Egreso']],
            body: examenesTableBody,
            theme: 'grid',
            headStyles: { fillColor: [93, 196, 175] },
            styles: { font: 'helvetica', fontSize: 9, halign: 'center' },
            columnStyles: { 0: { halign: 'left' } } // Alinear a la izquierda la primera columna
        });
        
        y = doc.autoTable.previous.finalY + 15;

        // Lista de Riesgos y Justificaciones
        let justificacionContent = condicionesEspeciales.join('\n');
        if (cargo.gesSeleccionados.length > 0) {
            const riesgosContent = cargo.gesSeleccionados.map(ges => `- ${ges.riesgo}: ${ges.ges}`).join('\n');
            justificacionContent += (justificacionContent ? '\n\n' : '') + 'Riesgos Ocupacionales Identificados (GES):\n' + riesgosContent;
        }
        y = drawSection(doc, 'Justificación de Exámenes Sugeridos:', justificacionContent, y);

        // Nueva sección de Recomendaciones Adicionales
        if (requiereCursoAlimentos) {
            const recomendacion = 'Se recomienda la realización del Curso de Manipulación de Alimentos, conforme a la normativa sanitaria vigente para el personal que procesa y/o distribuye alimentos.';
            y = drawSection(doc, 'Recomendaciones Adicionales:', recomendacion, y);
        }
        
        // Anotación Legal
        y = pageHeight - 40; // Posicionar al final
        doc.setFontSize(8).setFont('helvetica', 'italic');
        const disclaimer = 'Este documento es una guía de diagnóstico basada en la información suministrada. El profesiograma que cumple con la resolución vigente es la versión PRO, la cual es más completa y cuenta con la validación y firma de un médico especialista en Seguridad y Salud en el Trabajo.';
        const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
        doc.text(splitDisclaimer, margin, y);
    });
    
    addFooter(doc);

    return Buffer.from(doc.output('arraybuffer'));
} 