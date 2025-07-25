import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { EXAM_CONFIG, DISCOUNT_RANGES } from '../config/exam-prices-config.js';
import { GES_DATOS_PREDEFINIDOS } from '../config/ges-config.js';
import { EXAM_DETAILS } from '../config/exam-details-config.js';

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
    doc.setFont('helvetica');

    // --- Lógica de Cálculo (Replicando calculator.js) ---
    const cargosDetails = [];
    let overallSubtotal = 0;
    let totalWorkers = 0;
    const examenesUnicos = new Set();

    datosFormulario.cargos.forEach(cargo => {
        let cargoSubtotal = 0;
        totalWorkers += Number(cargo.numTrabajadores) || 1;

        cargo.gesSeleccionados.forEach(ges => {
            const gesConfig = GES_DATOS_PREDEFINIDOS[ges.ges];
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
    const finalPrice = overallSubtotal * (1 - volumeDiscount);

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
    doc.setFontSize(20).setFont('helvetica', 'bold');
    doc.text('Cotización de Exámenes Médicos Ocupacionales', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(10).setFont('helvetica', 'normal');
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
        headStyles: { fillColor: [93, 196, 175] },
    });

    y = doc.autoTable.previous.finalY + 10;
    
    // Resumen de totales
    doc.setFontSize(11);
    doc.text('Subtotal General:', pageWidth - margin - 50, y, { align: 'right' });
    doc.text(formatCurrency(overallSubtotal), pageWidth - margin, y, { align: 'right' });
    y += 7;

    doc.text(`Descuento por Volumen (${(volumeDiscount * 100).toFixed(0)}%):`, pageWidth - margin - 50, y, { align: 'right' });
    doc.text(`-${formatCurrency(overallSubtotal * volumeDiscount)}`, pageWidth - margin, y, { align: 'right' });
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Valor Total Estimado:', pageWidth - margin - 50, y, { align: 'right' });
    doc.text(formatCurrency(finalPrice), pageWidth - margin, y, { align: 'right' });
    
    return Buffer.from(doc.output('arraybuffer'));
} 