// server/src/controllers/perfil-cargo.controller.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// Importar fuentes Poppins para mejor renderizado en thumbnails
import { addPoppinsFont } from "../utils/poppins-font-definitions.js";
import riesgosService from '../services/riesgos.service.js';

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
    }

    doc.text(splitContent, margin, currentY);
    currentY += contentHeight + 5; // Añadir espacio después del contenido

    return currentY; // Devuelve la nueva posición Y
}

/**
 * Dibuja una sección de lista con ícono de viñeta
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {number} y - Posición Y inicial
 * @param {string} title - Título de la sección
 * @param {Array|Set} items - Lista de elementos a mostrar
 * @returns {number} Nueva posición Y
 */
function drawListSection(doc, y, title, items) {
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerMargin = 20;
    let currentY = y;

    // Convertir Set a Array si es necesario
    const itemsArray = items instanceof Set ? Array.from(items) : (Array.isArray(items) ? items : []);
    
    if (itemsArray.length === 0) {
        return currentY; // No dibujar si no hay elementos
    }

    // Verificar espacio para título
    if (currentY + 15 > pageHeight - footerMargin) {
        doc.addPage();
        currentY = 35;
    }

    // Dibujar Título de Sección
    doc.setFont('Poppins', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor);
    doc.text(title, margin, currentY);
    currentY += 7;

    // Dibujar elementos de la lista
    doc.setFont('Poppins', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textColor);

    itemsArray.forEach((item, index) => {
        // Verificar espacio para cada elemento
        if (currentY + 6 > pageHeight - footerMargin) {
            doc.addPage();
            currentY = 35;
        }

        // Viñeta y texto
        const bulletX = margin + 2;
        const textX = margin + 7;
        
        // Dibujar viñeta circular
        doc.setFillColor(93, 196, 175); // Color primario
        doc.circle(bulletX, currentY - 1.5, 1.5, 'F');
        
        // Texto del elemento
        const maxWidth = pageWidth - textX - margin;
        const splitText = doc.splitTextToSize(String(item), maxWidth);
        doc.text(splitText, textX, currentY);
        
        currentY += splitText.length * 4 + 2;
    });

    currentY += 3; // Espacio después de la sección

    return currentY;
}

/**
 * Dibuja la sección de EPP con un diseño visual mejorado
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {number} y - Posición Y inicial
 * @param {Array|Set} eppList - Lista de EPP requeridos
 * @returns {number} Nueva posición Y
 */
function drawEPPSection(doc, y, eppList) {
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerMargin = 20;
    let currentY = y;

    // Convertir Set a Array si es necesario
    const eppArray = eppList instanceof Set ? Array.from(eppList) : (Array.isArray(eppList) ? eppList : []);

    // Verificar espacio para el título y al menos algunos elementos
    if (currentY + 25 > pageHeight - footerMargin) {
        doc.addPage();
        currentY = 35;
    }

    // Línea decorativa superior
    doc.setDrawColor(93, 196, 175); // Color primario
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // Título de la sección con ícono de escudo (simulado con texto)
    doc.setFont('Poppins', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.text('🛡️ ELEMENTOS DE PROTECCIÓN PERSONAL (EPP) REQUERIDOS', margin, currentY);
    currentY += 8;

    if (eppArray.length === 0) {
        doc.setFont('Poppins', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(highlightColor);
        doc.text('No se requieren EPP específicos para este cargo.', margin, currentY);
        currentY += 10;
    } else {
        // Dibujar cada EPP en un formato de tarjeta
        const cardWidth = (pageWidth - margin * 2 - 5) / 2; // Dos columnas
        let col = 0;
        let rowY = currentY;

        eppArray.forEach((epp, index) => {
            // Verificar espacio
            if (rowY + 12 > pageHeight - footerMargin) {
                doc.addPage();
                rowY = 35;
                col = 0;
            }

            const x = margin + col * (cardWidth + 5);
            
            // Fondo de tarjeta
            doc.setFillColor(245, 248, 250); // Gris muy claro
            doc.roundedRect(x, rowY - 4, cardWidth, 10, 2, 2, 'F');
            
            // Ícono de check
            doc.setFillColor(93, 196, 175);
            doc.circle(x + 5, rowY, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('Poppins', 'bold');
            doc.setFontSize(6);
            doc.text('✓', x + 4, rowY + 1);
            
            // Texto del EPP
            doc.setFont('Poppins', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(textColor);
            const maxTextWidth = cardWidth - 15;
            const eppText = doc.splitTextToSize(String(epp), maxTextWidth)[0]; // Solo primera línea
            doc.text(eppText, x + 10, rowY + 1);

            col++;
            if (col >= 2) {
                col = 0;
                rowY += 12;
            }
        });

        currentY = rowY + (col > 0 ? 12 : 0) + 5;
    }

    // Nota importante
    currentY += 3;
    doc.setFont('Poppins', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(highlightColor);
    doc.text('* Los EPP deben cumplir con las normas técnicas colombianas aplicables y ser proporcionados por el empleador.', margin, currentY);
    currentY += 5;

    // Línea decorativa inferior
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    return currentY;
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
            : 'No se identificaron riesgos específicos para este cargo.';
        y = drawSection(doc, y, 'Riesgos Ocupacionales Identificados:', riesgosContent);

        // ===== SECCIÓN DE EPP =====
        // Obtener controles consolidados (pueden venir pre-calculados o calcularlos aquí)
        let controles = cargo.controlesConsolidados;
        
        if (!controles) {
            // Calcular controles usando riesgosService si no vienen pre-calculados
            try {
                controles = riesgosService.consolidarControlesCargo(cargo);
            } catch (e) {
                console.warn(`⚠️ Error calculando controles para cargo "${cargo.cargoName}":`, e.message);
                controles = { consolidado: { epp: new Set() } };
            }
        }

        // Obtener EPP desde controles consolidados
        let eppList = controles?.consolidado?.epp || new Set();

        // Si no hay EPP de controles, intentar extraer de los GES individuales
        if (eppList.size === 0 || (Array.isArray(eppList) && eppList.length === 0)) {
            const eppFromGES = new Set();
            gesList.forEach(ges => {
                // EPP sugeridos directamente del GES
                if (ges.eppSugeridos && Array.isArray(ges.eppSugeridos)) {
                    ges.eppSugeridos.forEach(epp => eppFromGES.add(epp));
                }
                // EPP en medidas de intervención
                if (ges.medidasIntervencion?.epp && ges.medidasIntervencion.epp !== 'No aplica') {
                    const eppString = ges.medidasIntervencion.epp;
                    eppString.split(',').forEach(epp => {
                        const trimmed = epp.trim();
                        if (trimmed) eppFromGES.add(trimmed);
                    });
                }
            });
            eppList = eppFromGES;
        }

        // Dibujar sección de EPP
        y = drawEPPSection(doc, y, eppList);

        // Aptitudes requeridas (si existen)
        const aptitudes = controles?.consolidado?.aptitudes;
        if (aptitudes && (aptitudes.size > 0 || (Array.isArray(aptitudes) && aptitudes.length > 0))) {
            y = drawListSection(doc, y, 'Aptitudes Requeridas:', aptitudes);
        }

        // Condiciones incompatibles (si existen)
        const condiciones = controles?.consolidado?.condicionesIncompatibles;
        if (condiciones && (condiciones.size > 0 || (Array.isArray(condiciones) && condiciones.length > 0))) {
            y = drawListSection(doc, y, 'Condiciones Médicas Incompatibles:', condiciones);
        }

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