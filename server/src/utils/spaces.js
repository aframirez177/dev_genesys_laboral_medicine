// server/src/utils/spaces.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';
import path from 'path';

// Configura el cliente S3 para DigitalOcean Spaces
const spacesClient = new S3Client({
    endpoint: `https://${process.env.SPACES_ENDPOINT}`, // Asegúrate que el endpoint NO incluya https:// en .env
    region: process.env.SPACES_REGION,
    credentials: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET,
    },
});

/**
 * Sube un buffer de archivo a DigitalOcean Spaces.
 * @param {Buffer} buffer El contenido del archivo.
 * @param {string} originalFilename El nombre original (ej. 'matriz.xlsx').
 * @param {string} contentType El tipo MIME (ej. 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').
 * @param {boolean} isPreview Si es un preview, añade sufijo.
 * @returns {Promise<string>} La URL pública del archivo subido.
 */
export const uploadToSpaces = async (buffer, originalFilename, contentType, isPreview = false) => {
    const fileExtension = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, fileExtension);
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const previewSuffix = isPreview ? '_preview' : '';

    // Nombre único para evitar colisiones: nombre-random-preview.ext
    const uniqueKey = `${baseName}_${randomSuffix}${previewSuffix}${fileExtension}`;

    const params = {
        Bucket: process.env.SPACES_BUCKET,
        Key: uniqueKey, // Nombre del archivo en Spaces
        Body: buffer,
        ACL: 'public-read', // ¡Importante! Para que se pueda ver/descargar
        ContentType: contentType,
    };

    try {
        const command = new PutObjectCommand(params);
        await spacesClient.send(command);

        // Construye la URL pública manualmente
        const publicUrl = `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_ENDPOINT}/${uniqueKey}`;
        console.log(`✅ Archivo subido a Spaces: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error("❌ Error subiendo a Spaces:", error);
        throw error; // Propaga el error para que la transacción falle
    }
};
