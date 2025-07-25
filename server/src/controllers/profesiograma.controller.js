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
export async function generarProfesiogramaPDF(datosFormulario, options = { isFree: true }) {
    const doc = new jsPDF();
    addPoppinsFont(doc);

    const companyName = datosFormulario.contact?.companyName || 'Nombre de la Empresa';
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // --- Estructura del Header ---
    const addHeader = () => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('PROFESIOGRAMA DE CARGOS (DIAGNÓSTICO)', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(companyName, pageWidth / 2, 28, { align: 'center' });
    };

    // --- Estructura del Footer ---
    const addFooter = (pageNumber, totalPages) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const footerText = `Página ${pageNumber} de ${totalPages} | Documento de diagnóstico generado por Genesys Laboral Medicine`;
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    datosFormulario.cargos.forEach((cargo, index) => {
        if (index > 0) doc.addPage();
        addHeader();

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(`Cargo: ${cargo.cargoName}`, margin, 45);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Área: ${cargo.area}`, margin, 52);

        const tableData = [];
        
        cargo.gesSeleccionados.forEach(ges => {
            const gesConfig = GES_DATOS_PREDEFINIDOS[ges.ges];
            if (!gesConfig || !gesConfig.examenesMedicos) return;

            // La periodicidad para la versión gratuita será genérica por ahora
            const periodicidadGratuita = "Anual / Según criterio médico";

            const examenesSugeridos = Object.entries(gesConfig.examenesMedicos)
                .filter(([, aplica]) => aplica)
                .map(([code]) => {
                    const detalle = EXAM_DETAILS[code];
                    return detalle ? detalle.fullName : code; // Usar el código si no se encuentra el nombre
                }).join('\n');

            tableData.push([ges.riesgo, ges.ges, examenesSugeridos, periodicidadGratuita]);
        });
        
        doc.autoTable({
            startY: 60,
            head: [['Riesgo', 'Factor de Riesgo (GES)', 'Exámenes Médicos Sugeridos', 'Periodicidad Sugerida']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [93, 196, 175] },
            styles: { font: 'helvetica', fontSize: 9 },
        });
        
        let finalY = doc.autoTable.previous.finalY;

        if (!options.isFree) {
            // Lógica para la versión Pro
        }
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i, totalPages);
    }

    return Buffer.from(doc.output('arraybuffer'));
} 