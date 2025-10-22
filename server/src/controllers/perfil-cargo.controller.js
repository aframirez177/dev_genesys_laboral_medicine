import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function addPoppinsFont(doc) {
    doc.setFont('helvetica');
}

/**
 * Genera el documento de Perfil de Cargo en formato PDF.
 * @param {object} datosFormulario - Los datos del formulario de matriz de riesgos.
 * @returns {Buffer} - El buffer del PDF generado.
 */
export async function generarPerfilCargoPDF(datosFormulario, { isPreview = false, companyName = 'Empresa Cliente' } = {}) {
    const doc = new jsPDF();
    addPoppinsFont(doc);

    /* const companyName = datosFormulario.contact?.companyName || 'Nombre de la Empresa'; */
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // --- Estructura del Header ---
    const addHeader = (companyNameForHeader) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('PERFIL DE CARGO (DIAGNÓSTICO)', pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(companyNameForHeader, pageWidth / 2, 28, { align: 'center' });
    };

    // --- Estructura del Footer ---
    const addFooter = (pageNumber, totalPages) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const footerText = `Página ${pageNumber} de ${totalPages} | Documento de diagnóstico generado por Genesys Laboral Medicine`;
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    // --- Función para dibujar una sección con título y contenido ---
    const drawSection = (title, content, startY) => {
        let y = startY;
        if (y > pageHeight - 30) { // Salto de página si no hay espacio
            doc.addPage();
            y = 40;
            addHeader();
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(title, margin, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const splitContent = doc.splitTextToSize(content || 'No especificado', pageWidth - margin * 2);
        doc.text(splitContent, margin, y);
        y += (splitContent.length * 5) + 8; // Ajustar espacio después de la sección
        return y;
    };

    datosFormulario.cargos.forEach((cargo, index) => {
        if (index > 0) doc.addPage();
        addHeader(companyName);
        
        let y = 45;

        // Información General
        y = drawSection('Nombre del Cargo:', cargo.cargoName, y);
        y = drawSection('Área / Proceso:', cargo.area, y);
        y = drawSection('Zona / Lugar:', cargo.zona, y);
        y = drawSection('Número de Trabajadores:', String(cargo.numTrabajadores), y);
        y = drawSection('Descripción de Tareas Principales:', cargo.descripcionTareas, y);

        // Riesgos Asociados
        const riesgosContent = cargo.gesSeleccionados.map(ges => `- ${ges.riesgo}: ${ges.ges}`).join('\n');
        y = drawSection('Riesgos Ocupacionales Identificados:', riesgosContent, y);
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        // --- CAMBIO 3: Añadir Marca de Agua si es Preview ---
    if (isPreview) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(72); 
        doc.setTextColor(255, 0, 0, 0.15); 
        doc.text('BORRADOR', pageWidth / 2, pageHeight / 2, { 
            align: 'center', 
            angle: 45,
            baseline: 'middle' 
        });
        doc.setFontSize(10); 
        doc.setTextColor(80, 80, 80); // Restaura color del texto normal
    }
        addFooter(i, totalPages);
    }

    return Buffer.from(doc.output('arraybuffer'));
} 