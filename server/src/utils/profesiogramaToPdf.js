/**
 * Profesiograma to PDF Utility
 * Uses Puppeteer to generate PDF from HTML view
 * This is MUCH easier than manual jsPDF generation!
 */

import puppeteer from 'puppeteer';

/**
 * Generate PDF from profesiograma view URL
 * @param {string} viewUrl - Full URL to the profesiograma view page
 * @param {string} profesiogramaId - ID of the profesiograma
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generatePDFFromView(viewUrl, profesiogramaId) {
    let browser = null;

    try {
        console.log(`🚀 Iniciando Puppeteer para ${profesiogramaId}`);

        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        console.log(`📖 Cargando página: ${viewUrl}`);

        // Navigate to the view page
        await page.goto(viewUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForSelector('.profesiograma-viewer', { timeout: 10000 });

        console.log(`📄 Generando PDF...`);

        // Generate PDF
        // The @media print styles in CSS will automatically convert horizontal to vertical layout
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="width: 100%; font-size: 10px; text-align: center; color: #888; padding: 5px 0;">
                    <span>Protocolo de Vigilancia de la Salud Ocupacional - ${profesiogramaId}</span>
                </div>
            `,
            footerTemplate: `
                <div style="width: 100%; font-size: 10px; text-align: center; color: #888; padding: 5px 0;">
                    <span class="pageNumber"></span> / <span class="totalPages"></span>
                </div>
            `,
            margin: {
                top: '1.5cm',
                right: '1.5cm',
                bottom: '1.5cm',
                left: '1.5cm'
            }
        });

        console.log(`✅ PDF generado exitosamente`);

        return pdfBuffer;

    } catch (error) {
        console.error('❌ Error en generatePDFFromView:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
            console.log(`🔒 Browser cerrado`);
        }
    }
}

/**
 * Generate thumbnail from profesiograma PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 * @returns {Promise<Buffer>} Thumbnail JPEG buffer
 */
export async function generateThumbnailFromView(viewUrl, profesiogramaId) {
    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        const page = await browser.newPage();

        // Set viewport for thumbnail
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 2 // High DPI for better quality
        });

        await page.goto(viewUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        await page.waitForSelector('.page-portada', { timeout: 10000 });

        // Take screenshot of first page (portada)
        const screenshot = await page.screenshot({
            type: 'jpeg',
            quality: 95,
            clip: {
                x: 0,
                y: 0,
                width: 1200,
                height: 1600
            }
        });

        return screenshot;

    } catch (error) {
        console.error('Error generating thumbnail:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export default {
    generatePDFFromView,
    generateThumbnailFromView
};
