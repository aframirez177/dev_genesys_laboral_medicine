// server/src/controllers/profesiograma-pdf.controller.js
// Generador completo de Profesiograma PDF con jsPDF
// Estructura: 13 secciones fijas + secciones dinámicas por cargo

import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { addPoppinsFont } from "../utils/poppins-font-definitions.js";
import { EXAM_DETAILS, formatearPeriodicidad } from "../config/exam-details-config.js";
import riesgosService from "../services/riesgos.service.js";

// --- Constantes de Diseño ---
const COLORS = {
    primary: "#5dc4af",      // Verde agua
    secondary: "#383d47",    // Gris oscuro
    text: "#2d3238",         // Texto principal
    highlight: "#566E8F",    // Azul grisáceo
    background: "#f3f0f0",   // Fondo
    success: "#4caf50",      // Verde éxito
    warning: "#ff9800",      // Naranja advertencia
    danger: "#f44336",       // Rojo peligro
    white: "#FFFFFF"
};

const MARGINS = {
    left: 15,
    right: 15,
    top: 25,
    bottom: 20
};

const PAGE = {
    width: 210,  // A4 width in mm
    height: 297, // A4 height in mm
    contentWidth: 210 - 30, // width - margins
    footerY: 287
};

// --- Funciones de Utilidad ---

/**
 * Convierte color hex a RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/**
 * Formatea fecha en español
 */
function formatDate(date = new Date()) {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const d = new Date(date);
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * Formatea fecha corta DD/MM/AAAA
 */
function formatDateShort(date = new Date()) {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/**
 * Calcula fecha futura
 */
function addYears(date, years) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
}

// --- Clase Principal del Generador ---
class ProfesiogramaPDFGenerator {
    constructor(doc, datos) {
        this.doc = doc;
        this.datos = datos;
        this.currentY = MARGINS.top;
        this.pageNumber = 0;
        this.totalPages = 0;

        // Información de la empresa
        this.companyName = datos.contact?.companyName || datos.companyName || "Empresa";
        this.companyNit = datos.contact?.nit || datos.nit || "N/A";

        // Fechas
        this.fechaElaboracion = new Date();
        this.fechaVigencia = this.fechaElaboracion;
        this.fechaRevision = addYears(this.fechaElaboracion, 1);
    }

    /**
     * Verifica si hay espacio suficiente, si no, añade nueva página
     */
    checkSpace(neededHeight) {
        if (this.currentY + neededHeight > PAGE.height - MARGINS.bottom) {
            this.addPage();
            return true;
        }
        return false;
    }

    /**
     * Añade nueva página
     */
    addPage() {
        this.doc.addPage();
        this.pageNumber++;
        this.currentY = MARGINS.top;
    }

    /**
     * Dibuja encabezado de sección con fondo de color
     */
    drawSectionHeader(title, fontSize = 12) {
        this.checkSpace(15);

        const rgb = hexToRgb(COLORS.primary);
        this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
        this.doc.rect(MARGINS.left, this.currentY - 5, PAGE.contentWidth, 10, "F");

        this.doc.setFont("Poppins", "bold");
        this.doc.setFontSize(fontSize);
        this.doc.setTextColor(255, 255, 255);
        this.doc.text(title, MARGINS.left + 3, this.currentY + 1);

        this.currentY += 10;
    }

    /**
     * Dibuja título de página
     */
    drawPageTitle(title, fontSize = 14) {
        this.checkSpace(15);

        const rgb = hexToRgb(COLORS.secondary);
        this.doc.setFont("Poppins", "bold");
        this.doc.setFontSize(fontSize);
        this.doc.setTextColor(rgb.r, rgb.g, rgb.b);
        this.doc.text(title, MARGINS.left, this.currentY);

        this.currentY += 8;
    }

    /**
     * Dibuja texto normal con wrap automático
     */
    drawText(text, options = {}) {
        const {
            fontSize = 10,
            bold = false,
            color = COLORS.text,
            indent = 0,
            lineHeight = 5
        } = options;

        const rgb = hexToRgb(color);
        this.doc.setFont("Poppins", bold ? "bold" : "normal");
        this.doc.setFontSize(fontSize);
        this.doc.setTextColor(rgb.r, rgb.g, rgb.b);

        const maxWidth = PAGE.contentWidth - indent;
        const lines = this.doc.splitTextToSize(text, maxWidth);

        for (const line of lines) {
            this.checkSpace(lineHeight);
            this.doc.text(line, MARGINS.left + indent, this.currentY);
            this.currentY += lineHeight;
        }
    }

    /**
     * Dibuja lista con viñetas
     */
    drawBulletList(items, options = {}) {
        const { fontSize = 9, indent = 5, bulletColor = COLORS.primary } = options;

        const rgb = hexToRgb(bulletColor);
        const textRgb = hexToRgb(COLORS.text);

        for (const item of items) {
            this.checkSpace(6);

            // Viñeta
            this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
            this.doc.circle(MARGINS.left + indent, this.currentY - 1.5, 1.5, "F");

            // Texto
            this.doc.setFont("Poppins", "normal");
            this.doc.setFontSize(fontSize);
            this.doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);

            const maxWidth = PAGE.contentWidth - indent - 8;
            const lines = this.doc.splitTextToSize(item, maxWidth);

            for (let i = 0; i < lines.length; i++) {
                if (i > 0) this.checkSpace(4);
                this.doc.text(lines[i], MARGINS.left + indent + 5, this.currentY);
                this.currentY += 4;
            }
            this.currentY += 1;
        }
    }

    /**
     * Dibuja lista numerada
     */
    drawNumberedList(items, options = {}) {
        const { fontSize = 9, indent = 5 } = options;
        const textRgb = hexToRgb(COLORS.text);

        items.forEach((item, index) => {
            this.checkSpace(6);

            this.doc.setFont("Poppins", "bold");
            this.doc.setFontSize(fontSize);
            this.doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
            this.doc.text(`${index + 1}.`, MARGINS.left + indent, this.currentY);

            this.doc.setFont("Poppins", "normal");
            const maxWidth = PAGE.contentWidth - indent - 10;
            const lines = this.doc.splitTextToSize(item, maxWidth);

            for (let i = 0; i < lines.length; i++) {
                if (i > 0) this.checkSpace(4);
                this.doc.text(lines[i], MARGINS.left + indent + 8, this.currentY);
                this.currentY += 4;
            }
            this.currentY += 1;
        });
    }

    /**
     * Dibuja espacio
     */
    addSpace(height = 5) {
        this.currentY += height;
    }

    // ==========================================
    // SECCIONES DEL PROFESIOGRAMA
    // ==========================================

    /**
     * PÁGINA 1: Portada
     */
    drawPortada() {
        this.pageNumber = 1;

        // Logo placeholder (centrado arriba)
        this.currentY = 40;
        const primaryRgb = hexToRgb(COLORS.primary);
        this.doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        this.doc.roundedRect(PAGE.width / 2 - 25, this.currentY, 50, 15, 3, 3, "F");
        this.doc.setFont("Poppins", "bold");
        this.doc.setFontSize(10);
        this.doc.setTextColor(255, 255, 255);
        this.doc.text("GENESYS LM", PAGE.width / 2, this.currentY + 10, { align: "center" });

        // Título principal
        this.currentY = 90;
        const secRgb = hexToRgb(COLORS.secondary);
        this.doc.setFont("Poppins", "bold");
        this.doc.setFontSize(20);
        this.doc.setTextColor(secRgb.r, secRgb.g, secRgb.b);

        const titulo = "PROTOCOLO DE VIGILANCIA DE LA SALUD OCUPACIONAL POR CARGO";
        const tituloLines = this.doc.splitTextToSize(titulo, PAGE.contentWidth);
        tituloLines.forEach(line => {
            this.doc.text(line, PAGE.width / 2, this.currentY, { align: "center" });
            this.currentY += 10;
        });

        // Subtítulo
        this.currentY += 10;
        this.doc.setFontSize(12);
        this.doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        this.doc.text("PROFESIOGRAMA", PAGE.width / 2, this.currentY, { align: "center" });

        // Información de la empresa
        this.currentY = 160;
        const infoData = [
            ["Empresa:", this.companyName],
            ["NIT:", this.companyNit],
            ["Versión:", "1.0"],
            ["Fecha de elaboración:", formatDateShort(this.fechaElaboracion)],
            ["Fecha de vigencia:", formatDateShort(this.fechaVigencia)],
            ["Próxima revisión:", formatDateShort(this.fechaRevision)]
        ];

        this.doc.autoTable({
            startY: this.currentY,
            body: infoData,
            theme: "plain",
            styles: {
                font: "Poppins",
                fontSize: 11,
                cellPadding: 4
            },
            columnStyles: {
                0: { fontStyle: "bold", cellWidth: 55 },
                1: { cellWidth: 100 }
            },
            margin: { left: 40, right: 40 }
        });

        // Disclaimer inferior
        this.currentY = 250;
        this.doc.setFont("Poppins", "normal");
        this.doc.setFontSize(9);
        this.doc.setTextColor(secRgb.r, secRgb.g, secRgb.b);
        const disclaimer = "Documento elaborado en cumplimiento de la Resolución 1843 de 2025 del Ministerio del Trabajo";
        this.doc.text(disclaimer, PAGE.width / 2, this.currentY, { align: "center" });
    }

    /**
     * PÁGINA 2: Información del Médico
     */
    drawInfoMedico() {
        this.addPage();
        this.drawPageTitle("1. INFORMACIÓN DEL MÉDICO RESPONSABLE");
        this.addSpace(5);

        const campos = [
            ["Nombre completo:", "[Nombre del médico especialista]"],
            ["Registro médico:", "[Número de registro]"],
            ["Especialidad:", "Medicina del Trabajo / Salud Ocupacional"],
            ["Número de licencia en SST:", "[Número de licencia vigente]"],
            ["Fecha de expedición licencia:", "[DD/MM/AAAA]"]
        ];

        this.doc.autoTable({
            startY: this.currentY,
            body: campos,
            theme: "striped",
            styles: {
                font: "Poppins",
                fontSize: 10,
                cellPadding: 5
            },
            columnStyles: {
                0: { fontStyle: "bold", cellWidth: 60 },
                1: { cellWidth: 100 }
            },
            alternateRowStyles: { fillColor: [243, 240, 240] },
            margin: { left: MARGINS.left, right: MARGINS.right }
        });

        this.currentY = this.doc.autoTable.previous.finalY + 20;

        // Espacio para firma
        this.drawText("Firma: ___________________________", { bold: true });
        this.addSpace(5);
        this.drawText("Fecha: [DD/MM/AAAA]");
    }

    /**
     * PÁGINA 3: Objeto y Alcance
     */
    drawObjetoAlcance() {
        this.addPage();
        this.drawPageTitle("2. OBJETO DEL DOCUMENTO");
        this.addSpace(3);

        const objetoTexto = `Establecer los lineamientos técnico-médicos para la práctica de evaluaciones médicas ocupacionales de los trabajadores de ${this.companyName}, definiendo los exámenes clínicos, paraclínicos y complementarios requeridos según el perfil de cargo, la exposición a factores de riesgo laboral y las condiciones de salud individuales, en cumplimiento de la Resolución 1843 de 2025 del Ministerio del Trabajo y demás normatividad vigente en materia de Seguridad y Salud en el Trabajo.`;

        this.drawText(objetoTexto);
        this.addSpace(10);

        this.drawPageTitle("3. ALCANCE");
        this.addSpace(3);

        this.drawText("Este protocolo aplica a todos los trabajadores de la organización, independientemente de su tipo de vinculación laboral (directos, contratistas, temporales, aprendices), y contempla las siguientes modalidades de evaluaciones médicas ocupacionales:");
        this.addSpace(5);

        this.drawBulletList([
            "Evaluaciones médicas de preingreso",
            "Evaluaciones médicas periódicas (programadas o por cambio de ocupación)",
            "Evaluaciones médicas de egreso",
            "Evaluaciones médicas de retorno laboral (ausencias no médicas ≥ 90 días)",
            "Evaluaciones médicas post-incapacidad (incapacidad ≥ 30 días o antes si procede)",
            "Evaluaciones médicas de seguimiento y control"
        ]);
    }

    /**
     * PÁGINA 4: Marco Normativo
     */
    drawMarcoNormativo() {
        this.addPage();
        this.drawPageTitle("4. MARCO NORMATIVO");
        this.addSpace(5);

        const normativas = [
            { norma: "Resolución 1843 de 2025", descripcion: "Ministerio del Trabajo" },
            { norma: "Decreto 1072 de 2015", descripcion: "(Libro 2, Parte 2, Título 4, Capítulo 6)" },
            { norma: "Resolución 0312 de 2019", descripcion: "Estándares mínimos del SG-SST" },
            { norma: "Decisión 584 de 2004", descripcion: "Comunidad Andina de Naciones" },
            { norma: "Ley 1562 de 2012", descripcion: "Sistema General de Riesgos Laborales" },
            { norma: "Guías GATISO vigentes", descripcion: "Atención Integral en Salud Ocupacional" }
        ];

        const tableBody = normativas.map(n => [n.norma, n.descripcion]);

        this.doc.autoTable({
            startY: this.currentY,
            head: [["Normativa", "Descripción"]],
            body: tableBody,
            theme: "grid",
            headStyles: {
                fillColor: hexToRgb(COLORS.secondary),
                textColor: [255, 255, 255],
                font: "Poppins",
                fontStyle: "bold"
            },
            styles: {
                font: "Poppins",
                fontSize: 10,
                cellPadding: 5
            },
            alternateRowStyles: { fillColor: [243, 240, 240] },
            margin: { left: MARGINS.left, right: MARGINS.right }
        });

        this.currentY = this.doc.autoTable.previous.finalY + 10;
    }

    /**
     * PÁGINA 5: Definiciones
     */
    drawDefiniciones() {
        this.addPage();
        this.drawPageTitle("5. DEFINICIONES");
        this.addSpace(5);

        const definiciones = [
            {
                termino: "Evaluación médica ocupacional",
                definicion: "Valoración clínica realizada por médico especialista en medicina del trabajo o salud ocupacional con licencia vigente, para determinar las condiciones de salud física, mental y social del trabajador en relación con los factores de riesgo a los que está expuesto."
            },
            {
                termino: "Perfil de cargo",
                definicion: "Documento que describe de manera detallada las funciones, requisitos físicos, mentales, aptitudes, competencias, riesgos asociados y condiciones específicas del puesto de trabajo."
            },
            {
                termino: "Restricción médico-laboral",
                definicion: "Limitación temporal o permanente emitida por médico especialista, fundamentada en una evaluación médica ocupacional, que busca proteger la salud del trabajador."
            },
            {
                termino: "Recomendación médico-laboral",
                definicion: "Sugerencia no restrictiva emitida por médico especialista para proteger la salud del trabajador y garantizar su adecuado desempeño."
            },
            {
                termino: "Concepto de aptitud laboral",
                definicion: "Resultado de la evaluación médica ocupacional que determina si el trabajador está apto, apto con restricciones o no apto para el cargo."
            }
        ];

        for (const def of definiciones) {
            this.checkSpace(25);
            this.drawText(def.termino, { bold: true, color: COLORS.primary, fontSize: 11 });
            this.addSpace(2);
            this.drawText(def.definicion, { indent: 5, fontSize: 9 });
            this.addSpace(5);
        }
    }

    /**
     * PÁGINA 6: Metodología
     */
    drawMetodologia() {
        this.addPage();
        this.drawPageTitle("6. METODOLOGÍA DE ELABORACIÓN DEL PROTOCOLO");
        this.addSpace(3);

        this.drawText("Este protocolo fue elaborado mediante el siguiente proceso técnico-médico:");
        this.addSpace(5);

        // 6.1
        this.drawText("6.1. Análisis de información de entrada", { bold: true, color: COLORS.secondary });
        this.addSpace(2);
        this.drawText("El médico especialista en SST revisó y analizó la siguiente documentación suministrada por el empleador:");
        this.addSpace(3);
        this.drawBulletList([
            "Perfiles de cargo actualizados por área/departamento",
            "Matriz de identificación de peligros, evaluación y valoración de riesgos (IPER)",
            "Matriz de requisitos legales en SST",
            "Diagnóstico de condiciones de salud de los trabajadores",
            "Indicadores epidemiológicos de la empresa",
            "Estudios técnicos (higiénicos, ergonómicos, psicosociales)"
        ]);
        this.addSpace(5);

        // 6.2
        this.drawText("6.2. Identificación de exposiciones ocupacionales", { bold: true, color: COLORS.secondary });
        this.addSpace(2);
        this.drawText("Se identificaron y priorizaron los factores de riesgo presentes en los diferentes cargos:");
        this.addSpace(3);
        this.drawBulletList([
            "Peligros físicos (ruido, vibración, temperaturas extremas, radiaciones)",
            "Peligros químicos (solventes, gases, vapores, material particulado)",
            "Peligros biológicos (virus, bacterias, hongos, parásitos)",
            "Peligros biomecánicos (posturas prolongadas, movimientos repetitivos)",
            "Peligros psicosociales (carga mental, trabajo bajo presión)",
            "Condiciones de seguridad (trabajo en alturas, espacios confinados)"
        ]);
        this.addSpace(5);

        // 6.3
        this.checkSpace(30);
        this.drawText("6.3. Correlación clínico-ocupacional", { bold: true, color: COLORS.secondary });
        this.addSpace(2);
        this.drawText("Se estableció la relación entre las exposiciones laborales identificadas y los posibles efectos en la salud, considerando órganos y sistemas potencialmente afectados, tiempo de exposición, y Guías GATISO.");
        this.addSpace(5);

        // 6.4
        this.drawText("6.4. Selección de exámenes médicos ocupacionales", { bold: true, color: COLORS.secondary });
        this.addSpace(2);
        this.drawText("Con base en el análisis anterior, se definieron los exámenes clínicos, paraclínicos y complementarios más apropiados para cada cargo según la exposición y el nivel de riesgo identificado.");
    }

    /**
     * PÁGINA 7: Criterios Generales
     */
    drawCriteriosGenerales() {
        this.addPage();
        this.drawPageTitle("7. CRITERIOS GENERALES PARA TODAS LAS EVALUACIONES MÉDICAS");
        this.addSpace(5);

        this.drawText("7.1. Evaluación médica básica (aplica a todos los cargos)", { bold: true, color: COLORS.secondary });
        this.addSpace(3);
        this.drawText("Toda evaluación médica ocupacional incluirá como mínimo:");
        this.addSpace(5);

        // A. Historia clínica
        this.drawText("A. Historia clínica ocupacional completa", { bold: true, fontSize: 10 });
        this.drawBulletList([
            "Anamnesis: antecedentes personales, familiares, ocupacionales",
            "Revisión por sistemas",
            "Hábitos (tabaquismo, alcoholismo, actividad física)",
            "Historia ocupacional detallada (empleos previos, exposiciones)"
        ]);
        this.addSpace(3);

        // B. Examen físico
        this.drawText("B. Examen físico completo por sistemas", { bold: true, fontSize: 10 });
        this.drawBulletList([
            "Signos vitales (presión arterial, frecuencia cardíaca)",
            "Evaluación de piel y faneras, cabeza y cuello",
            "Sistema respiratorio, cardiovascular, abdomen",
            "Sistema osteomuscular y neurológico"
        ]);
        this.addSpace(3);

        // C. Medidas
        this.drawText("C. Medidas antropométricas", { bold: true, fontSize: 10 });
        this.drawBulletList([
            "Peso y Talla",
            "Índice de Masa Corporal (IMC)",
            "Perímetro abdominal"
        ]);
        this.addSpace(5);

        // Tabla de periodicidad
        this.checkSpace(60);
        this.drawText("7.2. Criterios de periodicidad", { bold: true, color: COLORS.secondary });
        this.addSpace(3);
        this.drawText("La periodicidad de las evaluaciones médicas periódicas se establece según el nivel de riesgo:");
        this.addSpace(5);

        const periodicidadData = [
            ["Riesgo I (bajo)", "Cada 3 años"],
            ["Riesgo II (medio)", "Cada 2 años"],
            ["Riesgo III (alto)", "Cada año"],
            ["Riesgo IV (muy alto)", "Cada 6-12 meses"],
            ["Riesgo V (crítico)", "Semestral"]
        ];

        this.doc.autoTable({
            startY: this.currentY,
            head: [["Nivel de Riesgo", "Periodicidad Máxima"]],
            body: periodicidadData,
            theme: "grid",
            headStyles: {
                fillColor: hexToRgb(COLORS.secondary),
                textColor: [255, 255, 255],
                font: "Poppins",
                fontStyle: "bold"
            },
            styles: {
                font: "Poppins",
                fontSize: 9,
                cellPadding: 4,
                halign: "center"
            },
            alternateRowStyles: { fillColor: [243, 240, 240] },
            margin: { left: MARGINS.left, right: MARGINS.right }
        });

        this.currentY = this.doc.autoTable.previous.finalY + 5;
    }

    /**
     * SECCIÓN 8: Protocolo por Cargo (DINÁMICO)
     * Esta es la sección principal que genera las fichas de cada cargo
     */
    drawProtocoloCargos() {
        this.addPage();
        this.drawPageTitle("8. PROTOCOLO POR CARGO O GRUPO DE EXPOSICIÓN");
        this.addSpace(3);
        this.drawText("A continuación se presenta el protocolo específico para cada cargo o grupo de exposición similar.");
        this.addSpace(10);

        const cargos = this.datos.cargos || [];

        if (cargos.length === 0) {
            this.drawText("No se han definido cargos para este profesiograma.", { color: COLORS.warning });
            return;
        }

        cargos.forEach((cargo, index) => {
            if (index > 0) {
                this.addPage(); // Cada cargo en página nueva
            }
            this.drawFichaCargo(cargo, index + 1);
        });
    }

    /**
     * Dibuja la ficha completa de un cargo
     * Estructura:
     * - Página 1: Info + GES identificados
     * - Página 2: Exámenes + EPP + Aptitudes + Condiciones incompatibles
     */
    drawFichaCargo(cargo, numero) {
        // Obtener controles consolidados
        let controles = cargo.controlesConsolidados;
        if (!controles) {
            try {
                controles = riesgosService.consolidarControlesCargo(cargo);
            } catch (e) {
                console.warn(`Error calculando controles para cargo "${cargo.cargoName}":`, e.message);
                controles = {
                    consolidado: {
                        examenes: [],
                        epp: [],
                        aptitudes: [],
                        condicionesIncompatibles: [],
                        periodicidadMinima: 36
                    }
                };
            }
        }

        // ===== ENCABEZADO DEL CARGO =====
        this.drawSectionHeader(`8.${numero}. ${cargo.cargoName || 'Cargo sin nombre'}`, 11);
        this.addSpace(5);

        // Información básica del cargo
        const infoCargo = [
            ["Área/Proceso:", cargo.area || "No especificada"],
            ["Zona/Lugar:", cargo.zona || "No especificada"],
            ["N° Trabajadores:", String(cargo.numTrabajadores || 1)],
            ["Periodicidad EMO:", `Cada ${controles.consolidado.periodicidadMinima || 36} meses`]
        ];

        this.doc.autoTable({
            startY: this.currentY,
            body: infoCargo,
            theme: "plain",
            styles: {
                font: "Poppins",
                fontSize: 9,
                cellPadding: 2
            },
            columnStyles: {
                0: { fontStyle: "bold", cellWidth: 40 },
                1: { cellWidth: 80 }
            },
            margin: { left: MARGINS.left }
        });
        this.currentY = this.doc.autoTable.previous.finalY + 5;

        // Descripción de tareas
        if (cargo.descripcionTareas) {
            this.drawText("Descripción de tareas:", { bold: true, fontSize: 9 });
            this.drawText(cargo.descripcionTareas, { fontSize: 9, indent: 3 });
            this.addSpace(5);
        }

        // Características especiales (toggles)
        const caracteristicas = [];
        if (cargo.trabajaAlturas) caracteristicas.push("Trabajo seguro en alturas (Res. 1409/2012 y 4272/2021)");
        if (cargo.manipulaAlimentos) caracteristicas.push("Manipulación de alimentos (Res. 2674/2013)");
        if (cargo.conduceVehiculo) caracteristicas.push("Conducción de vehículos (Res. 1565/2014 - PESV)");
        if (cargo.trabajaEspaciosConfinados) caracteristicas.push("Trabajo en espacios confinados");

        if (caracteristicas.length > 0) {
            this.drawText("Requisitos especiales:", { bold: true, fontSize: 9, color: COLORS.warning });
            this.drawBulletList(caracteristicas, { fontSize: 8, bulletColor: COLORS.warning });
            this.addSpace(5);
        }

        // ===== GES IDENTIFICADOS =====
        const gesList = Array.isArray(cargo.gesSeleccionados) ? cargo.gesSeleccionados : [];

        if (gesList.length > 0) {
            this.checkSpace(40);
            this.drawText("Grupos de Exposición Similar (GES) identificados:", { bold: true, fontSize: 10, color: COLORS.secondary });
            this.addSpace(3);

            const gesTableBody = gesList.map(ges => [
                ges.riesgo || "N/A",
                ges.ges || "N/A",
                ges.nrNivel || "N/A",
                ges.nrInterpretacion || "N/A"
            ]);

            this.doc.autoTable({
                startY: this.currentY,
                head: [["Tipo de Riesgo", "GES", "NR", "Interpretación"]],
                body: gesTableBody,
                theme: "grid",
                headStyles: {
                    fillColor: hexToRgb(COLORS.highlight),
                    textColor: [255, 255, 255],
                    font: "Poppins",
                    fontStyle: "bold",
                    fontSize: 8
                },
                styles: {
                    font: "Poppins",
                    fontSize: 8,
                    cellPadding: 3
                },
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 70 },
                    2: { cellWidth: 15, halign: "center" },
                    3: { cellWidth: 40 }
                },
                alternateRowStyles: { fillColor: [243, 240, 240] },
                margin: { left: MARGINS.left, right: MARGINS.right }
            });
            this.currentY = this.doc.autoTable.previous.finalY + 10;
        }

        // ===== PÁGINA 2 DEL CARGO: EXÁMENES =====
        this.addPage();
        this.drawSectionHeader(`Protocolo de exámenes - ${cargo.cargoName}`, 11);
        this.addSpace(5);

        // Tabla de exámenes médicos
        const examenes = controles.consolidado.examenes || [];

        if (examenes.length > 0) {
            this.drawText("Exámenes Médicos Ocupacionales:", { bold: true, fontSize: 10, color: COLORS.secondary });
            this.addSpace(3);

            const examenesTableBody = examenes.map(code => {
                const examInfo = EXAM_DETAILS[code] || { fullName: code, periodicidadMeses: 12 };
                return [
                    examInfo.fullName,
                    "✓", // Ingreso
                    "✓", // Periódico
                    code === "EMO" || code === "EMOA" || code === "EMOMP" ? "✓" : "" // Retiro
                ];
            });

            this.doc.autoTable({
                startY: this.currentY,
                head: [["Examen", "Ingreso", "Periódico", "Retiro"]],
                body: examenesTableBody,
                theme: "grid",
                headStyles: {
                    fillColor: hexToRgb(COLORS.secondary),
                    textColor: [255, 255, 255],
                    font: "Poppins",
                    fontStyle: "bold",
                    fontSize: 9
                },
                styles: {
                    font: "Poppins",
                    fontSize: 8,
                    cellPadding: 3
                },
                columnStyles: {
                    0: { cellWidth: 100 },
                    1: { cellWidth: 25, halign: "center" },
                    2: { cellWidth: 25, halign: "center" },
                    3: { cellWidth: 25, halign: "center" }
                },
                alternateRowStyles: { fillColor: [243, 240, 240] },
                margin: { left: MARGINS.left, right: MARGINS.right }
            });
            this.currentY = this.doc.autoTable.previous.finalY + 10;
        }

        // ===== EPP REQUERIDOS =====
        const epp = controles.consolidado.epp || [];
        const eppArray = epp instanceof Set ? Array.from(epp) : (Array.isArray(epp) ? epp : []);

        if (eppArray.length > 0) {
            this.checkSpace(30);
            this.drawText("Elementos de Protección Personal (EPP) Requeridos:", { bold: true, fontSize: 10, color: COLORS.secondary });
            this.addSpace(3);
            this.drawBulletList(eppArray, { fontSize: 9, bulletColor: COLORS.success });
            this.addSpace(5);
        }

        // ===== APTITUDES REQUERIDAS =====
        const aptitudes = controles.consolidado.aptitudes || [];
        const aptitudesArray = aptitudes instanceof Set ? Array.from(aptitudes) : (Array.isArray(aptitudes) ? aptitudes : []);

        if (aptitudesArray.length > 0) {
            this.checkSpace(30);
            this.drawText("Aptitudes Requeridas:", { bold: true, fontSize: 10, color: COLORS.secondary });
            this.addSpace(3);
            this.drawBulletList(aptitudesArray, { fontSize: 9 });
            this.addSpace(5);
        }

        // ===== CONDICIONES INCOMPATIBLES =====
        const condiciones = controles.consolidado.condicionesIncompatibles || [];
        const condicionesArray = condiciones instanceof Set ? Array.from(condiciones) : (Array.isArray(condiciones) ? condiciones : []);

        if (condicionesArray.length > 0) {
            this.checkSpace(30);
            this.drawText("Condiciones de Salud Incompatibles:", { bold: true, fontSize: 10, color: COLORS.danger });
            this.addSpace(3);
            this.drawBulletList(condicionesArray, { fontSize: 9, bulletColor: COLORS.danger });
            this.addSpace(5);
        }

        // ===== FIRMA DEL MÉDICO =====
        this.checkSpace(40);
        this.addSpace(10);
        const lineY = this.currentY;
        this.doc.setDrawColor(hexToRgb(COLORS.secondary).r, hexToRgb(COLORS.secondary).g, hexToRgb(COLORS.secondary).b);
        this.doc.line(MARGINS.left, lineY, MARGINS.left + 80, lineY);
        this.currentY += 5;
        this.drawText("Firma Médico Especialista en SST", { bold: true, fontSize: 9 });
        this.drawText("Licencia No. _______________", { fontSize: 8 });
    }

    /**
     * PÁGINA 9: Responsabilidades
     */
    drawResponsabilidades() {
        this.addPage();
        this.drawPageTitle("9. RESPONSABILIDADES");
        this.addSpace(5);

        // 9.1 Del Médico
        this.drawText("9.1. Del Médico Especialista en SST", { bold: true, color: COLORS.secondary });
        this.addSpace(3);
        this.drawBulletList([
            "Elaborar y actualizar el presente protocolo basándose en la información técnica suministrada",
            "Realizar las evaluaciones médicas ocupacionales conforme a este protocolo",
            "Emitir conceptos de aptitud fundamentados técnica y científicamente",
            "Establecer restricciones o recomendaciones médico-laborales cuando sea necesario",
            "Garantizar la confidencialidad de la información médica",
            "Comunicar por escrito al trabajador los resultados de su evaluación"
        ]);
        this.addSpace(8);

        // 9.2 Del Empleador
        this.checkSpace(50);
        this.drawText("9.2. Del Empleador", { bold: true, color: COLORS.secondary });
        this.addSpace(3);
        this.drawBulletList([
            "Suministrar información completa y actualizada sobre perfiles de cargo y matriz de riesgos",
            "Garantizar que las evaluaciones médicas sean realizadas por especialistas con licencia vigente",
            "Asumir el costo de las evaluaciones médicas y exámenes complementarios",
            "Programar las evaluaciones periódicas en horario laboral",
            "Implementar las restricciones y recomendaciones médicas en máximo 20 días hábiles",
            "Garantizar que los trabajadores asistan a las evaluaciones programadas"
        ]);
        this.addSpace(8);

        // 9.3 Del Trabajador
        this.checkSpace(40);
        this.drawText("9.3. Del Trabajador", { bold: true, color: COLORS.secondary });
        this.addSpace(3);
        this.drawBulletList([
            "Asistir puntualmente a las evaluaciones médicas programadas",
            "Suministrar información veraz y completa sobre su estado de salud",
            "Permitir la realización de los exámenes clínicos y paraclínicos",
            "Acatar las restricciones y recomendaciones médico-laborales",
            "Informar oportunamente sobre cambios en su estado de salud"
        ]);
    }

    /**
     * PÁGINA 10: Gestión de Resultados
     */
    drawGestionResultados() {
        this.addPage();
        this.drawPageTitle("10. GESTIÓN DE RESULTADOS");
        this.addSpace(5);

        this.drawText("10.1. Comunicación de resultados", { bold: true, color: COLORS.secondary });
        this.addSpace(3);
        this.drawText("Al trabajador: Se entrega resultado individual por escrito, con explicación de hallazgos, restricciones y recomendaciones. El trabajador firma recibido.");
        this.addSpace(3);
        this.drawText("Al empleador: Se comunican únicamente el concepto de aptitud y las restricciones/recomendaciones necesarias para adecuar el puesto de trabajo, sin revelar diagnósticos.");
        this.addSpace(8);

        this.drawText("10.2. Manejo de hallazgos anormales", { bold: true, color: COLORS.secondary });
        this.addSpace(3);
        this.drawText("Cuando se detecten hallazgos clínicos o paraclínicos anormales:");
        this.addSpace(3);
        this.drawNumberedList([
            "Se informa al trabajador de manera inmediata",
            "Se emite remisión a EPS para manejo especializado si requiere",
            "Se establece restricción temporal hasta aclaración diagnóstica",
            "Se programa evaluación de seguimiento",
            "Se incluye en el sistema de vigilancia epidemiológica correspondiente"
        ]);
        this.addSpace(8);

        this.drawText("10.3. Restricciones y recomendaciones", { bold: true, color: COLORS.secondary });
        this.addSpace(3);
        this.drawText("Toda restricción médico-laboral debe:");
        this.addSpace(3);
        this.drawBulletList([
            "Estar claramente justificada desde lo clínico-ocupacional",
            "Especificar si es temporal o permanente",
            "Indicar la vigencia en caso de ser temporal",
            "Ser comunicada por escrito al trabajador y al empleador"
        ]);
        this.addSpace(8);

        this.drawText("10.4. Custodia de información", { bold: true, color: COLORS.secondary });
        this.addSpace(3);
        this.drawBulletList([
            "Las historias clínicas ocupacionales se custodian bajo estricta confidencialidad",
            "El empleador solo recibe información necesaria para prevención",
            "Tiempo de conservación: 20 años después de terminada la relación laboral"
        ]);
    }

    /**
     * PÁGINA 11: Diagnóstico e Indicadores
     */
    drawDiagnosticoIndicadores() {
        this.addPage();
        this.drawPageTitle("11. DIAGNÓSTICO GENERAL DE SALUD");
        this.addSpace(3);

        this.drawText("El médico especialista consolidará anualmente un diagnóstico general de salud de la población trabajadora, que incluirá:");
        this.addSpace(5);

        this.drawBulletList([
            "Características demográficas - Análisis de la población trabajadora",
            "Prevalencia de condiciones de salud - Indicadores de morbilidad general",
            "Perfil de morbilidad ocupacional - Condiciones relacionadas con el trabajo",
            "Ausentismo por causa médica - Análisis de incapacidades y tendencias",
            "Tendencias y análisis de indicadores - Evolución temporal",
            "Recomendaciones para programas de prevención",
            "Necesidades de vigilancia epidemiológica"
        ]);
        this.addSpace(10);

        this.drawPageTitle("12. INDICADORES DE GESTIÓN DEL PROTOCOLO");
        this.addSpace(5);

        const indicadoresData = [
            ["Cobertura evaluaciones ingreso", "(Realizadas / Ingresos) x 100", "100%", "Mensual"],
            ["Cobertura evaluaciones periódicas", "(Realizadas / Programadas) x 100", "≥95%", "Trimestral"],
            ["Cobertura evaluaciones egreso", "(Realizadas / Egresos) x 100", "≥90%", "Mensual"],
            ["Implementación restricciones", "(Implementadas ≤20 días / Total) x 100", "100%", "Mensual"]
        ];

        this.doc.autoTable({
            startY: this.currentY,
            head: [["Indicador", "Fórmula", "Meta", "Periodicidad"]],
            body: indicadoresData,
            theme: "grid",
            headStyles: {
                fillColor: hexToRgb(COLORS.secondary),
                textColor: [255, 255, 255],
                font: "Poppins",
                fontStyle: "bold",
                fontSize: 8
            },
            styles: {
                font: "Poppins",
                fontSize: 7,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 45 },
                1: { cellWidth: 60 },
                2: { cellWidth: 25, halign: "center" },
                3: { cellWidth: 30, halign: "center" }
            },
            alternateRowStyles: { fillColor: [243, 240, 240] },
            margin: { left: MARGINS.left, right: MARGINS.right }
        });

        this.currentY = this.doc.autoTable.previous.finalY + 10;
    }

    /**
     * PÁGINA 12: Revisión y Aprobación
     */
    drawRevisionAprobacion() {
        this.addPage();
        this.drawPageTitle("13. REVISIÓN Y ACTUALIZACIÓN DEL PROTOCOLO");
        this.addSpace(3);

        this.drawText("Este protocolo debe revisarse y actualizarse en los siguientes casos:");
        this.addSpace(5);
        this.drawBulletList([
            "Cambios en la normatividad vigente",
            "Creación de nuevos cargos o modificación de existentes",
            "Cambios en la matriz de identificación de peligros y valoración de riesgos",
            "Nuevas exposiciones ocupacionales",
            "Cambios en los procesos productivos",
            "Al menos una vez al año, como revisión ordinaria"
        ]);
        this.addSpace(5);
        this.drawText(`Próxima revisión programada: ${formatDateShort(this.fechaRevision)}`, { bold: true });
        this.addSpace(10);

        this.drawPageTitle("14. CONTROL DE CAMBIOS");
        this.addSpace(5);

        const cambiosData = [
            ["1.0", formatDateShort(this.fechaElaboracion), "Emisión inicial", "[Nombre médico]"],
            ["", "", "", ""],
            ["", "", "", ""]
        ];

        this.doc.autoTable({
            startY: this.currentY,
            head: [["Versión", "Fecha", "Descripción del cambio", "Responsable"]],
            body: cambiosData,
            theme: "grid",
            headStyles: {
                fillColor: hexToRgb(COLORS.secondary),
                textColor: [255, 255, 255],
                font: "Poppins",
                fontStyle: "bold",
                fontSize: 9
            },
            styles: {
                font: "Poppins",
                fontSize: 9,
                cellPadding: 4,
                minCellHeight: 10
            },
            margin: { left: MARGINS.left, right: MARGINS.right }
        });

        this.currentY = this.doc.autoTable.previous.finalY + 15;

        // Firmas
        this.checkSpace(80);
        this.drawPageTitle("15. APROBACIÓN Y FIRMAS");
        this.addSpace(10);

        // Tres columnas de firma
        const firmaY = this.currentY;
        const colWidth = 55;

        const firmas = [
            { titulo: "Elaboró:", nombre: "[Médico SST]", cargo: "Médico Especialista SST" },
            { titulo: "Revisó:", nombre: "[Resp. SG-SST]", cargo: "Responsable SG-SST" },
            { titulo: "Aprobó:", nombre: "[Rep. Legal]", cargo: "Representante Legal" }
        ];

        firmas.forEach((firma, i) => {
            const x = MARGINS.left + (i * (colWidth + 10));

            this.doc.setFont("Poppins", "bold");
            this.doc.setFontSize(9);
            this.doc.setTextColor(hexToRgb(COLORS.secondary).r, hexToRgb(COLORS.secondary).g, hexToRgb(COLORS.secondary).b);
            this.doc.text(firma.titulo, x, firmaY);

            this.doc.setFont("Poppins", "normal");
            this.doc.setFontSize(8);
            this.doc.text(firma.nombre, x, firmaY + 8);
            this.doc.text(firma.cargo, x, firmaY + 13);

            // Línea de firma
            this.doc.setDrawColor(100, 100, 100);
            this.doc.line(x, firmaY + 25, x + 50, firmaY + 25);
            this.doc.text("Firma", x, firmaY + 30);
        });

        this.currentY = firmaY + 40;
    }

    /**
     * PÁGINA 13: Anexos
     */
    drawAnexos() {
        this.addPage();
        this.drawPageTitle("16. ANEXOS");
        this.addSpace(5);

        const anexos = [
            "Perfiles de cargo detallados por área",
            "Matriz de identificación de peligros, evaluación y valoración de riesgos",
            "Estudios higiénicos (ruido, iluminación, etc.)",
            "Formatos de evaluación médica ocupacional",
            "Formato de concepto de aptitud",
            "Formato de restricciones y recomendaciones médico-laborales",
            "Consentimiento informado para evaluación médica ocupacional",
            "Programa de vigilancia epidemiológica vigente"
        ];

        anexos.forEach((anexo, i) => {
            this.checkSpace(15);

            const primaryRgb = hexToRgb(COLORS.primary);
            this.doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
            this.doc.roundedRect(MARGINS.left, this.currentY - 4, 25, 8, 2, 2, "F");

            this.doc.setFont("Poppins", "bold");
            this.doc.setFontSize(9);
            this.doc.setTextColor(255, 255, 255);
            this.doc.text(`Anexo ${i + 1}`, MARGINS.left + 3, this.currentY);

            this.doc.setFont("Poppins", "normal");
            this.doc.setTextColor(hexToRgb(COLORS.text).r, hexToRgb(COLORS.text).g, hexToRgb(COLORS.text).b);
            this.doc.text(anexo, MARGINS.left + 30, this.currentY);

            this.currentY += 12;
        });

        this.addSpace(20);

        // Nota final
        const secRgb = hexToRgb(COLORS.secondary);
        this.doc.setFillColor(243, 240, 240);
        this.doc.roundedRect(MARGINS.left, this.currentY, PAGE.contentWidth, 30, 3, 3, "F");

        this.currentY += 8;
        this.doc.setFont("Poppins", "bold");
        this.doc.setFontSize(9);
        this.doc.setTextColor(secRgb.r, secRgb.g, secRgb.b);
        this.doc.text("NOTA IMPORTANTE:", MARGINS.left + 5, this.currentY);

        this.currentY += 5;
        this.doc.setFont("Poppins", "normal");
        this.doc.setFontSize(8);
        const nota = "Este protocolo es un documento técnico-médico que complementa, pero no reemplaza, los perfiles de cargo y la matriz de riesgos elaborados por el empleador.";
        const notaLines = this.doc.splitTextToSize(nota, PAGE.contentWidth - 10);
        notaLines.forEach(line => {
            this.doc.text(line, MARGINS.left + 5, this.currentY);
            this.currentY += 4;
        });

        // Disclaimer final
        this.currentY += 15;
        this.doc.setFont("Poppins", "normal");
        this.doc.setFontSize(9);
        const primaryRgb = hexToRgb(COLORS.primary);
        this.doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        this.doc.text("Documento elaborado en cumplimiento de la Resolución 1843 de 2025", PAGE.width / 2, this.currentY, { align: "center" });
    }

    /**
     * Añade encabezados y pies de página a todas las páginas
     */
    addHeadersAndFooters() {
        const totalPages = this.doc.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            this.doc.setPage(i);

            // Encabezado (excepto portada)
            if (i > 1) {
                const primaryRgb = hexToRgb(COLORS.primary);
                this.doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
                this.doc.setLineWidth(0.5);
                this.doc.line(MARGINS.left, 18, PAGE.width - MARGINS.right, 18);

                this.doc.setFont("Poppins", "bold");
                this.doc.setFontSize(10);
                this.doc.setTextColor(hexToRgb(COLORS.secondary).r, hexToRgb(COLORS.secondary).g, hexToRgb(COLORS.secondary).b);
                this.doc.text("PROFESIOGRAMA - " + this.companyName.toUpperCase(), PAGE.width / 2, 12, { align: "center" });
            }

            // Pie de página
            const footerY = PAGE.height - 10;
            this.doc.setFont("Poppins", "normal");
            this.doc.setFontSize(8);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`Página ${i} de ${totalPages}`, PAGE.width / 2, footerY, { align: "center" });
            this.doc.text("Genesys LM", PAGE.width - MARGINS.right, footerY, { align: "right" });
            this.doc.text(formatDateShort(this.fechaElaboracion), MARGINS.left, footerY);
        }
    }

    /**
     * Genera el PDF completo
     */
    generate() {
        // 1. Portada
        this.drawPortada();

        // 2. Información del Médico
        this.drawInfoMedico();

        // 3. Objeto y Alcance
        this.drawObjetoAlcance();

        // 4. Marco Normativo
        this.drawMarcoNormativo();

        // 5. Definiciones
        this.drawDefiniciones();

        // 6. Metodología
        this.drawMetodologia();

        // 7. Criterios Generales
        this.drawCriteriosGenerales();

        // 8. Protocolo por Cargo (DINÁMICO)
        this.drawProtocoloCargos();

        // 9. Responsabilidades
        this.drawResponsabilidades();

        // 10. Gestión de Resultados
        this.drawGestionResultados();

        // 11-12. Diagnóstico e Indicadores
        this.drawDiagnosticoIndicadores();

        // 13-15. Revisión y Aprobación
        this.drawRevisionAprobacion();

        // 16. Anexos
        this.drawAnexos();

        // Añadir encabezados y pies de página
        this.addHeadersAndFooters();

        return this.doc;
    }
}

// --- Función Principal de Exportación ---
/**
 * Genera el PDF completo del Profesiograma
 * @param {Object} datosFormulario - Datos del formulario con cargos
 * @param {Object} options - Opciones adicionales
 * @returns {Buffer} Buffer del PDF generado
 */
export async function generarProfesiogramaCompletoPDF(datosFormulario, options = {}) {
    const doc = new jsPDF("p", "mm", "a4");

    // Añadir fuentes Poppins
    try {
        addPoppinsFont(doc);
        doc.setFont("Poppins", "normal");
        console.log("✓ Fuentes Poppins añadidas al Profesiograma PDF.");
    } catch (e) {
        console.error("Error al añadir fuentes Poppins:", e);
        doc.setFont("helvetica");
    }

    // Validar datos
    if (!datosFormulario || !datosFormulario.cargos || !Array.isArray(datosFormulario.cargos)) {
        console.error("datosFormulario.cargos no es un array válido");
        doc.text("Error: Datos de cargos inválidos.", 15, 15);
        return Buffer.from(doc.output("arraybuffer"));
    }

    // Generar PDF
    const generator = new ProfesiogramaPDFGenerator(doc, datosFormulario);
    generator.generate();

    console.log(`✓ Profesiograma PDF generado: ${doc.internal.getNumberOfPages()} páginas, ${datosFormulario.cargos.length} cargos.`);

    return Buffer.from(doc.output("arraybuffer"));
}

export default { generarProfesiogramaCompletoPDF };
