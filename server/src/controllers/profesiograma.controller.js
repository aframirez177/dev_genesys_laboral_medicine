import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';
import { EXAM_DETAILS } from '../config/exam-details-config.js';

// --- Funciones de Ayuda para la Maquetación del PDF ---

/**
 * Añade un header estándar a una página del documento.
 * @param {jsPDF} doc Instancia del documento PDF.
 * @param {string} companyName Nombre de la empresa.
 */
function addHeader(doc, companyName) {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('PROFESIOGRAMA DE CARGO', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(companyName, pageWidth / 2, 28, { align: 'center' });
}

/**
 * Añade un footer estándar a una página del documento.
 * @param {jsPDF} doc Instancia del documento PDF.
 * @param {number} pageNumber Número de página actual.
 * @param {number} totalPages Total de páginas del documento.
 */
function addFooter(doc, pageNumber, totalPages) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const footerText = `Página ${pageNumber} de ${totalPages} | Documento generado por Genesys Laboral Medicine`;
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
}

/**
 * Dibuja una sección con título y contenido de texto o lista.
 * @param {jsPDF} doc Instancia del documento PDF.
 * @param {number} startY Posición Y inicial para dibujar.
 * @param {string} title Título de la sección.
 * @param {string|string[]} content Contenido, puede ser un string o un array de strings para una lista.
 * @returns {number} Nueva posición Y después de dibujar la sección.
 */
function drawSection(doc, startY, title, content) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = startY;

    if (y > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 20; // Espacio para el header que se agregará al final
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(title, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    if (Array.isArray(content)) {
        content.forEach(item => {
            const splitItem = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 5);
            doc.text(splitItem, margin + 5, y);
            y += (splitItem.length * 5) + 2;
        });
    } else {
        const splitContent = doc.splitTextToSize(content || 'No especificado', pageWidth - margin * 2);
        doc.text(splitContent, margin, y);
        y += (splitContent.length * 5) + 2;
    }

    return y + 8; // Espacio extra post-sección
}

// --- Lógica Principal de Generación ---

export async function generarProfesiogramaPDF(datosFormulario) {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFont('helvetica', 'normal');

    const companyName = datosFormulario.contact?.companyName || 'Nombre de la Empresa';

    datosFormulario.cargos.forEach((cargo, index) => {
        if (index > 0) doc.addPage();
        let y = 40; // Posición Y inicial para el contenido del cargo

        // --- Título del Cargo ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text(`Perfil del Cargo: ${cargo.cargoName}`, 15, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Área/Proceso: ${cargo.area}`, 15, y);
        y += 15;
        
        // --- 1. Consolidación de Información desde GES ---
        const examenesMap = new Map();
        const aptitudesRequeridas = new Set();
        const condicionesIncompatibles = new Set();
        const eppSugeridos = new Set();
        const gesSeleccionadosNombres = new Set();

        cargo.gesSeleccionados.forEach(ges => {
            const gesFullName = `${ges.riesgo} - ${ges.ges}`;
            gesSeleccionadosNombres.add(gesFullName);
            const gesConfig = GES_DATOS_PREDEFINIDOS[gesFullName];
            if (!gesConfig) return;

            // Consolidar exámenes, priorizando la criticidad más alta
            if (gesConfig.examenesMedicos) {
                Object.entries(gesConfig.examenesMedicos).forEach(([code, criticidad]) => {
                    if (criticidad > 0) {
                        if (!examenesMap.has(code) || criticidad < examenesMap.get(code).criticidad) {
                            examenesMap.set(code, { criticidad });
                        }
                    }
                });
            }

            // Consolidar el resto de la información
            if(gesConfig.aptitudesRequeridas) gesConfig.aptitudesRequeridas.forEach(item => aptitudesRequeridas.add(item));
            if(gesConfig.condicionesIncompatibles) gesConfig.condicionesIncompatibles.forEach(item => condicionesIncompatibles.add(item));
            if(gesConfig.eppSugeridos) gesConfig.eppSugeridos.forEach(item => eppSugeridos.add(item));
        });

        // --- 2. Aplicación de Reglas de Negocio Obligatorias ---
        if (!examenesMap.has('EMO') && !examenesMap.has('EMOA') && !examenesMap.has('EMOMP')) {
            examenesMap.set('EMO', { criticidad: 1 });
        }
        if (cargo.trabajaAlturas) {
            examenesMap.set('EMOA', { criticidad: 1 });
            examenesMap.delete('EMO'); // EMOA reemplaza a EMO
        }
        if (cargo.manipulaAlimentos) {
            examenesMap.set('EMOMP', { criticidad: 1 });
            examenesMap.set('FRO', { criticidad: 1 });
            examenesMap.set('KOH', { criticidad: 1 });
            examenesMap.set('COP', { criticidad: 1 });
            examenesMap.delete('EMO'); // EMOMP reemplaza a EMO
        }
        // NUEVA REGLA: Conducción de vehículos
        if (cargo.conduceVehiculo) {
            examenesMap.set('PSM', { criticidad: 1 });
            examenesMap.set('VIS', { criticidad: 1 });
        }

        // --- 3. Generación de Secciones del PDF ---
        y = drawSection(doc, y, 'Riesgos Ocupacionales Identificados (GES)', Array.from(gesSeleccionadosNombres));
        y = drawSection(doc, y, 'Aptitudes y Requerimientos para el Cargo', Array.from(aptitudesRequeridas));
        y = drawSection(doc, y, 'Condiciones Médicas Incompatibles con el Cargo', Array.from(condicionesIncompatibles));
        y = drawSection(doc, y, 'Elementos de Protección Personal (EPP) Sugeridos', Array.from(eppSugeridos));

        // --- 4. Maquetación de la Tabla de Exámenes ---
        if (y > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = 40;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text('Protocolo de Exámenes Médicos Ocupacionales', 15, y);
        y += 8;

        const examenesIngreso = [];
        const examenesPeriodicos = [];
        const examenesEgreso = [];

        examenesMap.forEach((data, code) => {
            const examName = EXAM_DETAILS[code]?.fullName || code;
            examenesIngreso.push(examName); // Todos para ingreso
            if (data.criticidad <= 2) examenesPeriodicos.push(examName); // Críticos y recomendados para periódicos
            if (data.criticidad <= 2) examenesEgreso.push(examName); // Críticos y recomendados para egreso (se puede refinar)
        });
        
        // Se añade EMO a egreso si no está, como base
        if (!examenesEgreso.includes(EXAM_DETAILS['EMO']?.fullName)) {
             const emoDetails = EXAM_DETAILS['EMO']?.fullName;
             if(emoDetails && !examenesEgreso.includes(emoDetails)) examenesEgreso.unshift(emoDetails);
        }

        doc.autoTable({
            startY: y,
            head: [['Examen de Ingreso', 'Examen Periódico', 'Examen de Egreso']],
            body: [[
                examenesIngreso.join('\n'),
                examenesPeriodicos.join('\n'),
                examenesEgreso.join('\n')
            ]],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
        });
    });

    // --- Finalización y numeración de páginas ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addHeader(doc, companyName);
        addFooter(doc, i, totalPages);
    }

    return Buffer.from(doc.output('arraybuffer'));
}
