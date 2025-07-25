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

        // 1. Consolidar todos los exámenes y su criticidad
        const examenesMap = new Map();
        cargo.gesSeleccionados.forEach(ges => {
            const gesConfig = GES_DATOS_PREDEFINIDOS[ges.ges];
            if (!gesConfig || !gesConfig.examenesMedicos) return;

            Object.entries(gesConfig.examenesMedicos).forEach(([code, criticidad]) => {
                if (criticidad > 0 && criticidad < 3) { // Asumimos que 1 o 2 son válidos
                    if (!examenesMap.has(code) || criticidad < examenesMap.get(code).criticidad) {
                        examenesMap.set(code, { 
                            criticidad: criticidad,
                            nombre: EXAM_DETAILS[code]?.fullName || code
                        });
                    }
                }
            });
        });
        
        // Reglas obligatorias
        if (cargo.trabajaAlturas) {
             examenesMap.set('EMOA', { criticidad: 1, nombre: EXAM_DETAILS['EMOA'].fullName });
        }
        if (cargo.manipulaAlimentos) {
             examenesMap.set('EMOMP', { criticidad: 1, nombre: EXAM_DETAILS['EMOMP'].fullName });
        }

        // 2. Crear paquetes
        const paqueteBasico = Array.from(examenesMap.values()).filter(e => e.criticidad === 1);
        const paqueteRecomendado = Array.from(examenesMap.values());

        // 3. Maquetar el PDF
        doc.setFontSize(12).setFont('helvetica', 'bold');
        let y = doc.autoTable.previous.finalY ? doc.autoTable.previous.finalY + 10 : 60;
        
        doc.text('Paquetes de Exámenes Médicos Sugeridos', margin, y);
        y += 6;

        // Paquete Básico
        doc.setFontSize(10).setFont('helvetica', 'bold');
        doc.text('Paquete Básico (Exámenes Críticos)', margin, y);
        doc.autoTable({
            startY: y + 2,
            head: [['Ingreso', 'Periódicos', 'Egreso']],
            body: [
                [paqueteBasico.map(e => e.nombre).join('\n'), 
                 paqueteBasico.map(e => e.nombre).join('\n'), 
                 paqueteBasico.map(e => e.nombre).join('\n')]
            ],
            theme: 'striped',
            headStyles: { fillColor: [220, 220, 220], textColor: 40 },
        });
        y = doc.autoTable.previous.finalY + 10;

        // Paquete Recomendado
        doc.setFontSize(10).setFont('helvetica', 'bold');
        doc.text('Paquete Recomendado (Completo)', margin, y);
        doc.autoTable({
            startY: y + 2,
            head: [['Ingreso', 'Periódicos', 'Egreso']],
            body: [
                [paqueteRecomendado.map(e => e.nombre).join('\n'), 
                 paqueteRecomendado.map(e => e.nombre).join('\n'), 
                 paqueteRecomendado.map(e => e.nombre).join('\n')]
            ],
            theme: 'striped',
            headStyles: { fillColor: [93, 196, 175] },
        });
        y = doc.autoTable.previous.finalY + 15;

        // Lista de Riesgos Justificativos
        const riesgosContent = cargo.gesSeleccionados.map(ges => `- ${ges.riesgo}: ${ges.ges}`).join('\n');
        y = drawSection(doc, 'Riesgos Ocupacionales Identificados', riesgosContent, y);
        
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