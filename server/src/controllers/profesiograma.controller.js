// server/src/controllers/profesiograma.controller.js
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { GES_DATOS_PREDEFINIDOS } from "../config/ges-config.js";
import { EXAM_DETAILS } from "../config/exam-details-config.js";
import { addPoppinsFont } from "../utils/poppins-font-definitions.js"; // Asegúrate que la ruta sea correcta

// --- Constantes de Diseño y Branding ---
const primaryColor = "#5dc4af";
const secondaryColor = "#383d47";
const textColor = "#2d3238";
const highlightColor = "#566E8F";

// !!! IMPORTANTE: REVISA Y CORRIGE ESTA CADENA BASE64 !!!
// El error "Incomplete or corrupt PNG file" indica que esta cadena es incorrecta.
// Reemplázala con la cadena Base64 completa y válida de tu logo PNG.
const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZ8AAACqCAYAAAByIkI+AAAACXBIWXMAABYlAAAWJQFJUiTwAAAE7mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTZhNjM5NiwgMjAyNC8wMy8xMi0wNzo0ODoyMyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wNy0wNVQyMjowNjoyMS0wNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDctMDhUMTk6MjA6NDctMDU6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDctMDhUMTk6MjA6NDctMDU6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjEyOGEyZDcyLTk5NTktMGI0Mi04MTA5LWVkNTVkODZhYjI2NSIgeG1wTU06RG9jdW1lbnRJRD0i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'; // !! LOGO GENESYS BASE64 !!
const snsLogoBase64 = 'data:image/png;base64,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'; // !! LOGO SUPERSALUD BASE64 !!
// --- Funciones de Ayuda de Maquetación ---

function addHeaderAndFooter(doc, companyName) {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Encabezado
    // Eliminamos el try-catch para que el error de logo sea más visible si ocurre
    /* if (logoBase64 && logoBase64.startsWith("data:image")) {
        doc.addImage(logoBase64, "PNG", margin, 5, 38, 15);
    } else {
        console.warn("logoBase64 no es válido o está ausente.");
        // Opcional: Dibuja un rectángulo o texto placeholder si el logo falla
        doc.setFontSize(10);
        doc.setTextColor(200, 0, 0);
        doc.text("Logo Inválido", margin, 15);
    } */

    doc.setFont("Poppins", "bold");
    doc.setFontSize(14);
    doc.setTextColor(textColor);
    doc.text("PROFESIOGRAMA DE CARGO", pageWidth / 2, 15, { align: "center" });

    // Pie de página
    const footerY = pageHeight - 10;
    doc.setFont("Poppins", "normal");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, footerY, { align: "center" });
    doc.text(`Generado por Genesys LM`, pageWidth - margin, footerY, { align: "right" });
  }
}

function drawSectionHeader(doc, y, title) {
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont("Poppins", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(primaryColor);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
  doc.text(title, margin + 3, y);
  return y + 8; // Retorna la nueva posición Y debajo del encabezado
}

function drawList(doc, y, title, content) {
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerMargin = 15; // Espacio para el footer

    // Verificar si el título cabe, si no, nueva página
    if (y + 10 > pageHeight - footerMargin) {
        doc.addPage();
        y = 30; // Posición Y inicial en nueva página
    }
    y = drawSectionHeader(doc, y, title); // Dibuja el encabezado y actualiza Y

    doc.setFont("Poppins", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textColor);

    const listStartY = y; // Guardar Y al inicio de la lista
    let currentY = y;

    if (Array.isArray(content) && content.length > 0) {
        content.forEach((item) => {
            const splitItem = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2 - 5);
            const itemHeight = splitItem.length * 4; // Altura estimada del item (ajustar)

            // Verificar si el item cabe en la página actual
            if (currentY + itemHeight > pageHeight - footerMargin) {
                doc.addPage();
                currentY = 30; // Posición Y inicial en nueva página
                 // Redibujar encabezado en la nueva página si la lista continúa
                currentY = drawSectionHeader(doc, currentY, title + " (Continuación)");
            }
            doc.text(splitItem, margin + 5, currentY);
            currentY += itemHeight + 1; // Añadir pequeño espacio entre items
        });
    } else {
         // Verificar si el texto "No especificado" cabe
        if (currentY + 5 > pageHeight - footerMargin) {
            doc.addPage();
            currentY = 30;
            currentY = drawSectionHeader(doc, currentY, title + " (Continuación)");
        }
        doc.text("No se especificaron elementos.", margin + 5, currentY);
        currentY += 5;
    }
    return currentY + 4; // Retorna la Y final después de la lista + espacio
}


// --- Lógica Principal de Generación ---
export async function generarProfesiogramaPDF(
    datosFormulario,
    { companyName = "Empresa Cliente" } = {} // Eliminado isPreview
) {
    const doc = new jsPDF("p", "mm", "a4");
    try {
        addPoppinsFont(doc); // Asegurarse que las fuentes se añadan correctamente
    } catch (fontError) {
         console.error("Error al añadir fuentes Poppins:", fontError);
         // Continuar con fuente por defecto si falla
         doc.setFont('helvetica');
    }

    if (!datosFormulario || !datosFormulario.cargos || !Array.isArray(datosFormulario.cargos)) {
        console.error("datosFormulario.cargos no es un array válido o está ausente");
        // Opcional: generar un PDF indicando el error
         doc.text("Error: Datos de cargos inválidos.", 15, 15);
         return Buffer.from(doc.output("arraybuffer"));
    }


    datosFormulario.cargos.forEach((cargo, index) => {
        if (!cargo) {
             console.warn(`Cargo en índice ${index} es undefined o null. Saltando.`);
             return; // Saltar este cargo si es inválido
        }

        if (index > 0) doc.addPage();
        let y = 30; // Posición Y inicial para cada cargo

        // --- Título del Cargo ---
        doc.setFont("Poppins", "bold");
        doc.setFontSize(14);
        doc.setTextColor(secondaryColor);
        doc.text(`Perfil del Cargo: ${cargo.cargoName || 'N/A'} - ${companyName}`, 15, y);
        y += 6;
        doc.setFont("Poppins", "normal");
        doc.setFontSize(11);
        doc.setTextColor(highlightColor);
        doc.text(`Área/Proceso: ${cargo.area || 'N/A'}`, 15, y);
        y += 10;

        // --- 1. Consolidación de Información ---
        const examenesMap = new Map();
        const aptitudesRequeridas = new Set();
        const condicionesIncompatibles = new Set();
        const eppSugeridos = new Set();
        const gesSeleccionadosNombres = new Set();
        const caracteristicasEspeciales = [];

        // Validar que gesSeleccionados sea un array
        const gesList = Array.isArray(cargo.gesSeleccionados) ? cargo.gesSeleccionados : [];

        gesList.forEach((ges) => {
             if (!ges || !ges.ges || !ges.riesgo) {
                 console.warn("GES inválido encontrado en cargo:", cargo.cargoName, ges);
                 return; // Saltar GES inválido
            }
            const gesName = ges.ges;
            const riesgoName = ges.riesgo;
            const displayName = `${riesgoName} - ${gesName}`;
            gesSeleccionadosNombres.add(displayName);

            const gesConfig = GES_DATOS_PREDEFINIDOS[gesName];

            if (!gesConfig) {
                console.warn(`ADVERTENCIA: No se encontró configuración para el GES: "${gesName}" en cargo ${cargo.cargoName}`);
                return;
            }

            // Procesar exámenes, aptitudes, etc. (sin cambios aquí)
             if (gesConfig.examenesMedicos) {
                Object.entries(gesConfig.examenesMedicos).forEach(([code, periodicidad]) => {
                     // Asumiendo que periodicidad > 0 significa que se requiere.
                     // Guardamos el código del examen. Podríamos guardar periodicidad si fuera relevante.
                    if (periodicidad > 0) {
                         // Si ya existe, nos quedamos con la periodicidad más frecuente (menor número > 0) o simplemente lo añadimos si no está.
                         // Por simplicidad, solo añadimos si no está o si la nueva periodicidad es más restrictiva.
                        if (!examenesMap.has(code) /* || periodicidad < examenesMap.get(code).periodicidad */ ) {
                             examenesMap.set(code, { periodicidad }); // Guardamos periodicidad por si acaso
                        }
                    }
                });
            }
             if (gesConfig.aptitudesRequeridas) gesConfig.aptitudesRequeridas.forEach(item => aptitudesRequeridas.add(item));
             if (gesConfig.condicionesIncompatibles) gesConfig.condicionesIncompatibles.forEach(item => condicionesIncompatibles.add(item));
             if (gesConfig.eppSugeridos) gesConfig.eppSugeridos.forEach(item => eppSugeridos.add(item));

        });

        // --- 2. Aplicación de Reglas de Negocio Obligatorias ---
        // Regla 1: Paquete Mínimo Universal
        examenesMap.set("EMO", { periodicidad: 1 }); // Usamos periodicidad 1 como 'obligatorio'
        examenesMap.set("AUD", { periodicidad: 1 });
        examenesMap.set("OPTO", { periodicidad: 1 });

        // Regla 2: Características Especiales (Toggles)
        if (cargo.trabajaAlturas) {
            examenesMap.set("EMOA", { periodicidad: 1 });
            examenesMap.set("GLI", { periodicidad: 1 });
            examenesMap.set("PL", { periodicidad: 1 });
            examenesMap.set("PE", { periodicidad: 1 });
            examenesMap.set("ESP", { periodicidad: 1 });
            examenesMap.set("ECG", { periodicidad: 1 });
            examenesMap.delete("EMO"); // Reemplaza EMO básico
            caracteristicasEspeciales.push("Realiza trabajo seguro en alturas.");
        }
        if (cargo.manipulaAlimentos) {
            examenesMap.set("EMOMP", { periodicidad: 1 });
            examenesMap.set("FRO", { periodicidad: 1 });
            examenesMap.set("KOH", { periodicidad: 1 });
            examenesMap.set("COP", { periodicidad: 1 });
             if (!examenesMap.has("EMOA")) examenesMap.delete("EMO"); // Reemplaza EMO si no es de alturas
            caracteristicasEspeciales.push("Realiza manipulación de alimentos.");
        }
        if (cargo.conduceVehiculo) {
            examenesMap.set("PSM", { periodicidad: 1 });
            examenesMap.set("GLI", { periodicidad: 1 }); // Ya puede estar por alturas
            examenesMap.set("PL", { periodicidad: 1 }); // Ya puede estar por alturas
            caracteristicasEspeciales.push("Conduce vehículos motorizados.");
        }

        // --- 3. Generación de Secciones del PDF ---
        y = drawList(doc, y, "Resumen del Cargo y Riesgos", [
            `Descripción Tareas: ${cargo.descripcionTareas || "No especificada"}`,
            `Riesgos (GES) Identificados: ${gesList.length > 0 ? '' : 'Ninguno'}`, // Añadir texto si no hay GES
             ...Array.from(gesSeleccionadosNombres).map(name => `  - ${name}`)
        ]);

        if (caracteristicasEspeciales.length > 0) {
            y = drawList(doc, y, "Características Específicas (Justificación Exámenes)", caracteristicasEspeciales);
        }

        y = drawList(doc, y, "Aptitudes y Requerimientos para el Cargo", Array.from(aptitudesRequeridas));
        y = drawList(doc, y, "Condiciones Médicas Incompatibles", Array.from(condicionesIncompatibles));
        y = drawList(doc, y, "Elementos de Protección Personal (EPP) Sugeridos", Array.from(eppSugeridos));


        // --- 4. Maquetación de la Tabla de Exámenes ---
        const pageHeight = doc.internal.pageSize.getHeight();
        if (y > pageHeight - 95) { // Aumentar margen inferior para tabla y firma
            doc.addPage();
            y = 30; // Y inicial en nueva página
        }
        y = drawSectionHeader(doc, y, "Protocolo de Exámenes Médicos Ocupacionales");

        let tienePruebaEmbarazo = false;
        const examenesIngreso = [];
        const examenesPeriodicos = []; // Usaremos periodicidad para esto si existe

        examenesMap.forEach((data, code) => {
            let examName = EXAM_DETAILS[code]?.fullName || code;
            if (code === "PE") {
                examName += " (*)";
                tienePruebaEmbarazo = true;
            }
            examenesIngreso.push(examName);
            // Asumiendo que data.periodicidad indica cada cuántos años o 0/1 si es periódico o no
            // Ajustar esta lógica según el significado real de 'periodicidad' en ges-config
            if (data.periodicidad && data.periodicidad > 0) { // Ejemplo: si periodicidad > 0 es periódico
                 examenesPeriodicos.push(examName);
            }
        });

        // Determinar Examen de Egreso (priorizando específicos)
        let examenEgresoCode = "EMO";
        if (examenesMap.has("EMOA")) examenEgresoCode = "EMOA";
        else if (examenesMap.has("EMOMP")) examenEgresoCode = "EMOMP";
        const examenEgreso = EXAM_DETAILS[examenEgresoCode]?.fullName || examenEgresoCode;


        const maxRows = Math.max(examenesIngreso.length, examenesPeriodicos.length, 1); // Asegura al menos una fila para Egreso
        const tableBody = [];
        for (let i = 0; i < maxRows; i++) {
            tableBody.push([
                examenesIngreso[i] || "",
                examenesPeriodicos[i] || "",
                i === 0 ? examenEgreso : "", // Poner Egreso solo en la primera fila
            ]);
        }

        doc.autoTable({
            startY: y,
            head: [["Examen de Ingreso", "Examen Periódico", "Examen de Egreso"]],
            body: tableBody,
            theme: "grid",
            headStyles: { fillColor: secondaryColor, textColor: "#FFFFFF", font: "Poppins", fontStyle: "bold" },
            styles: { font: "Poppins", fontSize: 9, cellPadding: 2.5, valign: "middle" },
            alternateRowStyles: { fillColor: "#f3f0f0" },
            didDrawPage: (data) => { y = data.cursor.y; }, // Actualizar Y en cada página
            // Asegurar que la tabla no se corte abruptamente antes del footer
            margin: { bottom: 30 }
        });
        // La Y después de autoTable ya está actualizada por didDrawPage o es doc.autoTable.previous.finalY
        y = doc.autoTable.previous.finalY;

        if (tienePruebaEmbarazo) {
             if (y + 10 > pageHeight - 30) { doc.addPage(); y = 30; } // Espacio para nota y firma
            y += 5;
            doc.setFont("Poppins", "normal");
            doc.setFontSize(8);
            doc.setTextColor(highlightColor);
            doc.text("(*) Prueba de embarazo aplica únicamente bajo consentimiento informado.", 15, y);
            y+= 5; // Más espacio después de la nota
        }

        // --- 5. Espacio para Firma del Médico ---
         if (y + 25 > pageHeight - 15) { // Verificar espacio para la firma
            doc.addPage();
            y = 30;
        }
        y += 15;
        doc.setDrawColor(secondaryColor);
        doc.line(15, y, 95, y); // Línea para la firma
        y += 4;
        doc.setFont("Poppins", "bold");
        doc.setFontSize(10);
        doc.text("Firma Médico Especialista en SST", 15, y);
        y += 4;
        doc.setFont("Poppins", "normal");
        doc.text("Licencia No.", 15, y);

    }); // Fin forEach cargo

    // --- Finalización y numeración de páginas ---
    try {
        addHeaderAndFooter(doc, companyName);
    } catch(e) {
         console.error("Error añadiendo header/footer:", e);
    }


    console.log("Profesiograma PDF generado exitosamente.");
    return Buffer.from(doc.output("arraybuffer"));
}