// server/src/utils/pdfThumbnail.js
import { pdfToPng } from 'pdf-to-png-converter';
import sharp from 'sharp';

/**
 * Genera un thumbnail (imagen PNG) de la primera página de un PDF
 * @param {Buffer} pdfBuffer - Buffer del PDF original
 * @param {Object} options - Opciones de configuración
 * @param {number} options.width - Ancho del thumbnail (por defecto 400px)
 * @param {number} options.quality - Calidad JPEG (1-100, por defecto 85)
 * @returns {Promise<Buffer>} Buffer de la imagen PNG optimizada
 */
export async function generatePDFThumbnail(pdfBuffer, options = {}) {
    const { width = 400, quality = 85 } = options;

    try {
        console.log('🖼️ Generando thumbnail del PDF...');

        // Convertir la primera página del PDF a PNG
        const pngPages = await pdfToPng(pdfBuffer, {
            outputType: 'buffer',
            pagesToProcess: [1], // Solo la primera página (debe ser array)
            strictPagesToProcess: true,
            viewportScale: 2.0 // Mejor calidad
        });

        if (!pngPages || pngPages.length === 0) {
            throw new Error('No se pudo generar la imagen del PDF');
        }

        // Obtener el buffer de la primera página
        const firstPage = pngPages[0];
        const imageBuffer = firstPage.content;

        // Optimizar con sharp: redimensionar y convertir a JPEG
        const optimizedBuffer = await sharp(imageBuffer)
            .resize(width, null, { // Mantener proporción
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality, progressive: true })
            .toBuffer();

        console.log(`✅ Thumbnail generado: ${(optimizedBuffer.length / 1024).toFixed(2)} KB`);
        return optimizedBuffer;

    } catch (error) {
        console.error('❌ Error generando thumbnail del PDF:', error);
        throw new Error(`Error generando thumbnail: ${error.message}`);
    }
}
