// server/src/utils/documentThumbnail.js
// Sistema de generación de thumbnails de ALTA FIDELIDAD usando Puppeteer
import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let browserInstance = null;

/**
 * Obtiene instancia compartida de Puppeteer para mejor rendimiento
 */
async function getBrowser() {
    if (!browserInstance) {
        console.log('🚀 Iniciando Puppeteer...');
        browserInstance = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
    }
    return browserInstance;
}

/**
 * Genera thumbnail de alta fidelidad de un PDF
 * @param {Buffer} pdfBuffer - Buffer del PDF
 * @param {Object} options - Opciones
 * @returns {Promise<Buffer>} Buffer JPEG del thumbnail
 */
export async function generatePDFThumbnail(pdfBuffer, options = {}) {
    const { width = 800, quality = 95 } = options;

    let tempPdfPath = null;
    let page = null;

    try {
        console.log('🖼️ Generando thumbnail PDF con Puppeteer...');

        // Guardar PDF temporalmente
        tempPdfPath = path.join(os.tmpdir(), `temp-pdf-${Date.now()}.pdf`);
        fs.writeFileSync(tempPdfPath, pdfBuffer);

        const browser = await getBrowser();
        page = await browser.newPage();

        // Configurar viewport para calidad óptima
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 2 // Retina quality
        });

        // Abrir PDF
        await page.goto(`file://${tempPdfPath}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Esperar a que se renderice
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Capturar screenshot de alta calidad
        const screenshot = await page.screenshot({
            type: 'jpeg',
            quality,
            fullPage: false, // Solo viewport (primera página)
            encoding: 'binary'
        });

        console.log(`✅ Thumbnail PDF generado: ${(screenshot.length / 1024).toFixed(2)} KB`);
        return screenshot;

    } catch (error) {
        console.error('❌ Error generando thumbnail PDF:', error);
        throw new Error(`Error generando thumbnail PDF: ${error.message}`);
    } finally {
        if (page) await page.close();
        if (tempPdfPath && fs.existsSync(tempPdfPath)) {
            fs.unlinkSync(tempPdfPath);
        }
    }
}

/**
 * Genera thumbnail de alta fidelidad de un Excel
 * @param {Buffer} excelBuffer - Buffer del Excel
 * @param {Object} options - Opciones
 * @returns {Promise<Buffer>} Buffer JPEG del thumbnail
 */
export async function generateExcelThumbnail(excelBuffer, options = {}) {
    const { width = 800, quality = 95, maxRows = 15 } = options;

    let page = null;

    try {
        console.log('📊 Generando thumbnail Excel con Puppeteer...');

        // Leer Excel
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(excelBuffer);
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
            throw new Error('No se encontró ninguna hoja en el Excel');
        }

        // Generar HTML fiel al Excel
        const html = generateExcelHTML(worksheet, maxRows);

        const browser = await getBrowser();
        page = await browser.newPage();

        // Viewport optimizado
        await page.setViewport({
            width: 1400,
            height: 900,
            deviceScaleFactor: 2
        });

        // Cargar HTML (domcontentloaded es suficiente para HTML estático)
        await page.setContent(html, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        // Esperar renderizado
        await new Promise(resolve => setTimeout(resolve, 500));

        // Screenshot de la tabla
        const element = await page.$('table');
        const screenshot = await element.screenshot({
            type: 'jpeg',
            quality,
            encoding: 'binary'
        });

        console.log(`✅ Thumbnail Excel generado: ${(screenshot.length / 1024).toFixed(2)} KB`);
        return screenshot;

    } catch (error) {
        console.error('❌ Error generando thumbnail Excel:', error);
        throw new Error(`Error generando thumbnail Excel: ${error.message}`);
    } finally {
        if (page) await page.close();
    }
}

/**
 * Genera HTML estilizado del Excel para renderizado fiel
 */
function generateExcelHTML(worksheet, maxRows) {
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                margin: 20px;
                font-family: 'Calibri', Arial, sans-serif;
                background: white;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                background: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            th, td {
                border: 1px solid #d0d0d0;
                padding: 8px 12px;
                text-align: left;
                font-size: 11px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 200px;
            }
            th {
                background: #5dc4af;
                color: white;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 10px;
                letter-spacing: 0.5px;
            }
            tr:nth-child(even) {
                background: #f9f9f9;
            }
            tr:hover {
                background: #f0f0f0;
            }
            .number {
                text-align: right;
            }
            .bold {
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <table>
    `;

    let rowCount = 0;
    worksheet.eachRow((row, rowNumber) => {
        if (rowCount >= maxRows) return;

        const isHeader = rowNumber === 1;
        html += isHeader ? '<thead><tr>' : '<tr>';

        row.eachCell({ includeEmpty: true }, (cell) => {
            const value = getCellDisplayValue(cell);
            const alignment = cell.alignment?.horizontal || 'left';
            const isBold = cell.font?.bold;
            const isNumber = typeof cell.value === 'number';

            const cellTag = isHeader ? 'th' : 'td';
            const classes = [];
            if (isNumber && !isHeader) classes.push('number');
            if (isBold && !isHeader) classes.push('bold');

            const style = `text-align: ${alignment};`;
            const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';

            html += `<${cellTag}${classAttr} style="${style}">${value}</${cellTag}>`;
        });

        html += isHeader ? '</tr></thead><tbody>' : '</tr>';
        rowCount++;
    });

    html += `
        </tbody>
        </table>
    </body>
    </html>
    `;

    return html;
}

/**
 * Obtiene valor de celda formateado
 */
function getCellDisplayValue(cell) {
    if (!cell.value) return '';

    // Si es una fórmula, obtener resultado
    if (cell.value.result !== undefined) {
        return String(cell.value.result);
    }

    // Si es número, formatear
    if (typeof cell.value === 'number') {
        if (cell.numFmt && cell.numFmt.includes('%')) {
            return (cell.value * 100).toFixed(2) + '%';
        }
        if (cell.numFmt && cell.numFmt.includes('$')) {
            return '$' + cell.value.toLocaleString('es-CO');
        }
        return cell.value.toLocaleString('es-CO');
    }

    // Texto normal
    return String(cell.value).substring(0, 50); // Limitar longitud
}

/**
 * Cierra el navegador Puppeteer
 */
export async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
        console.log('🔴 Puppeteer cerrado');
    }
}

// Cleanup al terminar el proceso
process.on('exit', () => {
    if (browserInstance) {
        browserInstance.close();
    }
});
