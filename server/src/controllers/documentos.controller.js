// server/src/controllers/documentos.controller.js
import db from '../config/database.js';

export const getDocumentStatus = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token no proporcionado.' });
    }

    try {
        const documento = await db('documentos_generados').where({ token }).first();

        if (!documento) {
            console.warn(`Documento no encontrado para token: ${token}`);
            return res.status(404).json({ success: false, message: 'Trabajo no encontrado.' });
        }

        let urls = {};
        // --- CORRECCIÓN ---
        // Asume que preview_urls ya es un objeto o null/undefined/string inválido
        if (documento.preview_urls && typeof documento.preview_urls === 'object') {
            urls = documento.preview_urls;
        } else if (typeof documento.preview_urls === 'string') {
            // Fallback por si acaso estuviera como string JSON
            try {
                urls = JSON.parse(documento.preview_urls || '{}');
            } catch (e) {
                console.error(`Error parseando preview_urls (string) para token ${token}:`, e);
                urls = {};
            }
        } else {
            console.warn(`Tipo inesperado o nulo para preview_urls (token ${token}): ${typeof documento.preview_urls}`);
            urls = {};
        }
        // --- FIN CORRECCIÓN ---

        console.log(`Estado encontrado para token ${token}: ${documento.estado}`);
        res.status(200).json({
            success: true,
            status: documento.estado,
            urls: urls
        });

    } catch (error) {
        console.error(`Error buscando documento por token ${token}:`, error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al buscar el documento.' });
    }
};