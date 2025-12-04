import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { EXAM_CONFIG, DISCOUNT_RANGES } from '../config/exam-prices-config.js';
import { GES_DATOS_PREDEFINIDOS, buscarConfigGES } from '../config/ges-config.js';
import { EXAM_DETAILS } from '../config/exam-details-config.js';
import { addPoppinsFont } from "../utils/poppins-font-definitions.js";

// --- Funciones de Utilidad ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const calculateVolumeDiscount = (totalWorkers) => {
    for (const range of Object.values(DISCOUNT_RANGES)) {
        if (totalWorkers >= range.min && totalWorkers <= range.max) {
            return range.discount;
        }
    }
    return 0;
};

// --- Función Principal de Generación de PDF ---
export async function generarCotizacionPDF(datosFormulario) {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Añadir fuentes Poppins
    try {
        addPoppinsFont(doc);
        doc.setFont('Poppins', 'normal');
        console.log("Fuentes Poppins añadidas a Cotización.");
    } catch (e) {
        console.error("Error al añadir fuentes Poppins:", e);
        doc.setFont('helvetica');
    }

    // --- Lógica de Cálculo (Replicando calculator.js) ---
    const cargosDetails = [];
    let overallSubtotal = 0;
    let totalWorkers = 0;
    const examenesUnicos = new Set();

    datosFormulario.cargos.forEach(cargo => {
        let cargoSubtotal = 0;
        totalWorkers += Number(cargo.numTrabajadores) || 1;

        cargo.gesSeleccionados.forEach(ges => {
            const gesConfig = buscarConfigGES(ges.ges);
            if (!gesConfig || !gesConfig.examenesMedicos) return;

            Object.entries(gesConfig.examenesMedicos).forEach(([code, aplica]) => {
                if (aplica) {
                    examenesUnicos.add(code);
                }
            });
        });
        
        examenesUnicos.forEach(examCode => {
            const exam = EXAM_CONFIG[examCode];
            if(exam) {
                cargoSubtotal += exam.basePrice;
            }
        });

        const cargoTotal = cargoSubtotal * (Number(cargo.numTrabajadores) || 1);
        overallSubtotal += cargoTotal;
        
        cargosDetails.push({
            name: cargo.cargoName,
            workers: Number(cargo.numTrabajadores) || 1,
            unitPrice: cargoSubtotal,
            total: cargoTotal,
        });
    });

    const volumeDiscount = calculateVolumeDiscount(totalWorkers);
    // Nota: El descuento por tiempo no se aplica en el backend por ahora.
    const discountedPrice = overallSubtotal * (1 - volumeDiscount);
    
    // Cálculo de IVA 19%
    const IVA_RATE = 0.19;
    const ivaAmount = Math.round(discountedPrice * IVA_RATE);
    const finalPrice = discountedPrice + ivaAmount;

    // --- Maquetación del PDF (Replicando el diseño de calculator.js) ---
    const companyName = datosFormulario.contact?.companyName || 'Nombre de la Empresa';
    const contactName = datosFormulario.contact?.fullName || 'Contacto';
    const date = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 0;

    // ... Se recreará la maquetación visual del PDF aquí ...
    // Por simplicidad, se genera una tabla con los datos calculados.
    
    y += margin;
    doc.setFontSize(20).setFont('Poppins', 'bold');
    doc.text('Cotización de Exámenes Médicos Ocupacionales', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(10).setFont('Poppins', 'normal');
    doc.text(`Empresa: ${companyName}`, margin, y);
    doc.text(`Fecha: ${date}`, pageWidth - margin, y, { align: 'right' });
    y += 6;
    doc.text(`Atención: ${contactName}`, margin, y);
    y += 10;

    const tableData = cargosDetails.map(cargo => [
        cargo.name,
        cargo.workers,
        formatCurrency(cargo.unitPrice),
        formatCurrency(cargo.total)
    ]);
    
    doc.autoTable({
        startY: y,
        head: [['Cargo', 'Nº Trabajadores', 'Valor Unitario por Trabajador', 'Valor Total por Cargo']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [93, 196, 175],
            font: 'Poppins',
            fontStyle: 'bold'
        },
        bodyStyles: {
            font: 'Poppins',
            fontStyle: 'normal'
        },
    });

    y = doc.autoTable.previous.finalY + 10;
    
    // Resumen de totales con IVA
    const labelX = pageWidth - margin - 55;
    const valueX = pageWidth - margin;
    
    doc.setFontSize(10);
    doc.setFont('Poppins', 'normal');
    
    // Subtotal General
    doc.text('Subtotal General:', labelX, y, { align: 'right' });
    doc.text(formatCurrency(overallSubtotal), valueX, y, { align: 'right' });
    y += 6;

    // Descuento por Volumen (solo si aplica)
    if (volumeDiscount > 0) {
        doc.setTextColor(46, 125, 50); // Verde para descuento
        doc.text(`Descuento por Volumen (${(volumeDiscount * 100).toFixed(0)}%):`, labelX, y, { align: 'right' });
        doc.text(`-${formatCurrency(overallSubtotal * volumeDiscount)}`, valueX, y, { align: 'right' });
        doc.setTextColor(45, 50, 56); // Volver a color normal
        y += 6;
        
        // Subtotal con descuento
        doc.text('Subtotal con Descuento:', labelX, y, { align: 'right' });
        doc.text(formatCurrency(discountedPrice), valueX, y, { align: 'right' });
        y += 6;
    }

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(pageWidth - margin - 90, y, pageWidth - margin, y);
    y += 5;
    
    // IVA 19%
    doc.setFontSize(11);
    doc.text('IVA (19%):', labelX, y, { align: 'right' });
    doc.text(formatCurrency(ivaAmount), valueX, y, { align: 'right' });
    y += 8;

    // Línea separadora antes del total
    doc.setDrawColor(93, 196, 175); // Color primario
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 90, y, pageWidth - margin, y);
    y += 6;

    // Total Final con IVA
    doc.setFont('Poppins', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(56, 61, 71); // Color oscuro para el total
    doc.text('TOTAL (IVA Incluido):', labelX, y, { align: 'right' });
    doc.setTextColor(93, 196, 175); // Color primario para el valor
    doc.text(formatCurrency(finalPrice), valueX, y, { align: 'right' });
    
    // Nota de vigencia
    y += 15;
    doc.setFontSize(8);
    doc.setFont('Poppins', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('* Esta cotización tiene una vigencia de 30 días a partir de la fecha de emisión.', margin, y);
    y += 4;
    doc.text('* Los precios incluyen IVA del 19% según normativa colombiana.', margin, y);
    
    return Buffer.from(doc.output('arraybuffer'));
} 