// server/src/controllers/perfil-cargo.controller.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// Importar fuentes Poppins para mejor renderizado en thumbnails
import { addPoppinsFont } from "../utils/poppins-font-definitions.js";

// --- Constantes y Colores (Ajusta según tu diseño) ---
const primaryColor = "#5dc4af"; // Verde azulado
const secondaryColor = "#383d47"; // Gris oscuro
const textColor = "#2d3238"; // Casi negro
const highlightColor = "#566E8F"; // Azul grisáceo

// --- Funciones Auxiliares de PDF ---

// Añade fuentes Poppins
function addCustomFonts(doc) {
    try {
        addPoppinsFont(doc);
        doc.setFont('Poppins', 'normal');
        console.log("Fuentes Poppins añadidas a Perfil de Cargo.");
    } catch (e) {
        console.error("Error al añadir fuentes Poppins:", e);
        // Fallback a helvetica si falla
        doc.setFont('helvetica');
    }
}


function addHeaderAndFooter(doc, companyName) {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Encabezado
    doc.setFont('Poppins', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(secondaryColor); // Usa color definido
    doc.text('PERFIL DE CARGO', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(textColor); // Usa color definido
    doc.text(companyName, pageWidth / 2, 28, { align: 'center' });

    // Pie de página
    const footerY = pageHeight - 10;
    doc.setFont('Poppins', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Generado por Genesys LM`, pageWidth - margin, footerY, { align: 'right' });
  }
}

function drawSection(doc, y, title, content) {
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerMargin = 15;
    let currentY = y;

    // Verificar espacio para título y al menos una línea de contenido
    if (currentY + 15 > pageHeight - footerMargin) {
        doc.addPage();
        currentY = 35; // Y inicial después del header en nueva página
    }

    // Dibujar Título de Sección
    doc.setFont('Poppins', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor); // Color primario para títulos
    doc.text(title, margin, currentY);
    currentY += 6;

    // Dibujar Contenido
    doc.setFont('Poppins', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor); // Color de texto normal
    const splitContent = doc.splitTextToSize(content || 'No especificado', pageWidth - margin * 2);
    const contentHeight = splitContent.length * 5; // Altura estimada

    // Verificar si el contenido cabe
    if (currentY + contentHeight > pageHeight - footerMargin) {
        doc.addPage();
        currentY = 35; // Y inicial en nueva página
        // Opcional: Redibujar título en nueva página si quieres
        // doc.setFont('helvetica', 'bold');
        // doc.setFontSize(11);
        // doc.setTextColor(primaryColor);
        // doc.text(title + " (Continuación)", margin, currentY);
        // currentY += 6;
        // doc.setFont('helvetica', 'normal'); // Volver a fuente normal
        // doc.setFontSize(10);
        // doc.setTextColor(textColor);
    }

    doc.text(splitContent, margin, currentY);
    currentY += contentHeight + 5; // Añadir espacio después del contenido

    return currentY; // Devuelve la nueva posición Y
}


/**
 * Genera el documento de Perfil de Cargo en formato PDF (Versión Final).
 */
export async function generarPerfilCargoPDF(
    datosFormulario,
    { companyName = 'Empresa Cliente' } = {} // Eliminado isPreview
) {
    const doc = new jsPDF('p', 'mm', 'a4');
    addCustomFonts(doc); // Añade fuentes personalizadas o estándar

     if (!datosFormulario || !datosFormulario.cargos || !Array.isArray(datosFormulario.cargos)) {
        console.error("datosFormulario.cargos no es un array válido o está ausente para Perfil Cargo");
         doc.text("Error: Datos de cargos inválidos.", 15, 15);
         return Buffer.from(doc.output("arraybuffer"));
    }


    datosFormulario.cargos.forEach((cargo, index) => {
         if (!cargo) {
             console.warn(`Cargo en índice ${index} es undefined o null en Perfil Cargo. Saltando.`);
             return; // Saltar este cargo si es inválido
        }

        if (index > 0) doc.addPage();
        // No añadir header aquí, se añade al final con addHeaderAndFooter

        let y = 35; // Posición Y inicial debajo del espacio del header

        // Información General
        y = drawSection(doc, y, 'Nombre del Cargo:', cargo.cargoName || 'N/A');
        y = drawSection(doc, y, 'Área / Proceso:', cargo.area || 'N/A');
        y = drawSection(doc, y, 'Zona / Lugar:', cargo.zona || 'N/A');
        y = drawSection(doc, y, 'Número de Trabajadores:', String(cargo.numTrabajadores || 'N/A'));
        y = drawSection(doc, y, 'Descripción de Tareas Principales:', cargo.descripcionTareas || 'No especificada');

        // Riesgos Asociados
        const gesList = Array.isArray(cargo.gesSeleccionados) ? cargo.gesSeleccionados : [];
        const riesgosContent = gesList.length > 0
            ? gesList.map(ges => `- ${ges.riesgo || 'N/A'}: ${ges.ges || 'N/A'}`).join('\n')
            : 'No se identificaron riesgos específicos para este cargo.'; // Mensaje si no hay GES
        y = drawSection(doc, y, 'Riesgos Ocupacionales Identificados:', riesgosContent);

        // Puedes añadir más secciones aquí si tienes más datos relevantes del cargo

    }); // Fin forEach cargo

    // Añadir encabezados y pies de página a todas las páginas generadas
    try {
        addHeaderAndFooter(doc, companyName);
    } catch(e) {
         console.error("Error añadiendo header/footer a Perfil Cargo:", e);
    }


    console.log("Perfil de Cargo PDF generado exitosamente.");
    return Buffer.from(doc.output("arraybuffer"));
}