// server/src/utils/pdfThumbnail.js
import { pdfToPng } from 'pdf-to-png-converter';
import sharp from 'sharp';
import ExcelJS from 'exceljs';

/**
 * Genera un thumbnail (imagen PNG) de la primera página de un PDF
 * @param {Buffer} pdfBuffer - Buffer del PDF original
 * @param {Object} options - Opciones de configuración
 * @param {number} options.width - Ancho del thumbnail (por defecto 400px)
 * @param {number} options.quality - Calidad JPEG (1-100, por defecto 85)
 * @param {boolean} options.cropHeader - Recortar solo el header (30% superior)
 * @returns {Promise<Buffer>} Buffer de la imagen JPEG optimizada
 */
export async function generatePDFThumbnail(pdfBuffer, options = {}) {
    const { width = 400, quality = 90, cropHeader = true, viewportScale = 3.0 } = options;

    try {
        console.log('🖼️ Generando thumbnail del PDF con pdf-to-png...');

        // Convertir la primera página del PDF a PNG con ALTA CALIDAD
        const pngPages = await pdfToPng(pdfBuffer, {
            outputType: 'buffer',
            pagesToProcess: [1], // Solo la primera página (debe ser array)
            strictPagesToProcess: true,
            viewportScale // Configurable según necesidad (3.5 para helvetica, 3.0 para Poppins)
        });

        if (!pngPages || pngPages.length === 0) {
            throw new Error('No se pudo generar la imagen del PDF');
        }

        // Obtener el buffer de la primera página
        const firstPage = pngPages[0];
        const imageBuffer = firstPage.content;

        // Obtener dimensiones de la imagen original
        const metadata = await sharp(imageBuffer).metadata();

        let processedBuffer = imageBuffer;

        // Si cropHeader está activado, recortar solo la parte superior (header)
        if (cropHeader && metadata.height) {
            const cropHeight = Math.floor(metadata.height * 0.35); // 35% superior
            console.log(`✂️ Recortando header: ${metadata.width}x${cropHeight}px`);

            processedBuffer = await sharp(imageBuffer)
                .extract({
                    left: 0,
                    top: 0,
                    width: metadata.width,
                    height: cropHeight
                })
                .toBuffer();
        }

        // Optimizar con sharp: redimensionar y convertir a JPEG
        const optimizedBuffer = await sharp(processedBuffer)
            .resize(width, null, {
                fit: 'inside',
                withoutEnlargement: true,
                kernel: sharp.kernel.lanczos3 // Mejor algoritmo para texto
            })
            .sharpen() // Afilar para mejorar legibilidad
            .jpeg({ quality, progressive: true })
            .toBuffer();

        console.log(`✅ Thumbnail generado: ${(optimizedBuffer.length / 1024).toFixed(2)} KB`);
        return optimizedBuffer;

    } catch (error) {
        console.error('❌ Error generando thumbnail del PDF:', error);
        throw new Error(`Error generando thumbnail: ${error.message}`);
    }
}

/**
 * Genera un thumbnail de un archivo Excel mostrando las primeras filas
 * @param {Buffer} excelBuffer - Buffer del archivo Excel
 * @param {Object} options - Opciones de configuración
 * @param {number} options.width - Ancho del thumbnail (por defecto 400px)
 * @param {number} options.quality - Calidad JPEG (1-100, por defecto 90)
 * @param {number} options.rows - Número de filas a mostrar (por defecto 10)
 * @returns {Promise<Buffer>} Buffer de la imagen JPEG
 */
export async function generateExcelThumbnail(excelBuffer, options = {}) {
    const { width = 400, quality = 90, rows = 10 } = options;

    try {
        console.log('📊 Generando thumbnail del Excel...');

        // Leer el archivo Excel
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(excelBuffer);

        const worksheet = workbook.worksheets[0]; // Primera hoja
        if (!worksheet) {
            throw new Error('No se encontró ninguna hoja en el Excel');
        }

        // Dimensiones del thumbnail
        const cellWidth = 80;
        const cellHeight = 25;
        const maxCols = Math.ceil(width / cellWidth);
        const thumbnailWidth = maxCols * cellWidth;
        const thumbnailHeight = rows * cellHeight;

        // Crear canvas SVG con los datos del Excel
        const svgContent = generateExcelSVG(worksheet, maxCols, rows, cellWidth, cellHeight);

        // Convertir SVG a imagen con sharp
        const thumbnailBuffer = await sharp(Buffer.from(svgContent))
            .resize(width, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality, progressive: true })
            .toBuffer();

        console.log(`✅ Thumbnail Excel generado: ${(thumbnailBuffer.length / 1024).toFixed(2)} KB`);
        return thumbnailBuffer;

    } catch (error) {
        console.error('❌ Error generando thumbnail del Excel:', error);
        throw new Error(`Error generando thumbnail Excel: ${error.message}`);
    }
}

/**
 * Genera SVG de un Excel para convertir a imagen
 * @private
 */
function generateExcelSVG(worksheet, maxCols, maxRows, cellWidth, cellHeight) {
    const width = maxCols * cellWidth;
    const height = maxRows * cellHeight;

    let svgContent = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${width}" height="${height}" fill="white"/>
            <style>
                .cell { font-family: Arial, sans-serif; font-size: 11px; fill: #2d3238; }
                .cell-bold { font-weight: bold; }
                .grid { stroke: #dddddd; stroke-width: 1; }
            </style>
    `;

    let rowIndex = 0;
    worksheet.eachRow((row, rowNumber) => {
        if (rowIndex >= maxRows) return;

        let colIndex = 0;
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colIndex >= maxCols) return;

            const x = colIndex * cellWidth;
            const y = rowIndex * cellHeight;
            const value = cell.value ? String(cell.value).substring(0, 12) : '';
            const isBold = cell.font?.bold || rowNumber === 1;

            // Rectángulo de celda
            svgContent += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}"
                                 fill="${rowNumber === 1 ? '#5dc4af' : 'white'}" class="grid"/>`;

            // Texto de celda
            if (value) {
                const textColor = rowNumber === 1 ? '#ffffff' : '#2d3238';
                svgContent += `<text x="${x + 5}" y="${y + 17}"
                                     class="cell ${isBold ? 'cell-bold' : ''}"
                                     fill="${textColor}">${escapeXml(value)}</text>`;
            }

            colIndex++;
        });

        rowIndex++;
    });

    svgContent += '</svg>';
    return svgContent;
}

/**
 * Escapa caracteres especiales XML
 * @private
 */
function escapeXml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
