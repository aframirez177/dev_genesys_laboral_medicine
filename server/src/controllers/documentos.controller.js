// server/src/controllers/documentos.controller.js
import db from '../config/database.js'; // Asegúrate que la ruta sea correcta

// NO NECESITAS las funciones de generación aquí
// NO NECESITAS jobStore

/**
 * Obtiene el estado y las URLs de un documento basado en su token.
 * Reemplaza la antigua función checkDocumentStatus.
 */
export const getDocumentStatus = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token no proporcionado.' });
    }

    try {
        // Busca el documento en la BASE DE DATOS usando el token
        const documento = await db('documentos_generados').where({ token }).first();

        if (!documento) {
            // Si no se encuentra el documento con ese token
            console.warn(`Documento no encontrado para token: ${token}`);
            return res.status(404).json({ success: false, message: 'Trabajo no encontrado.' });
        }

        // Parsea las URLs (asumiendo que están en 'preview_urls' como JSON string)
        let urls = {};
        if (documento.preview_urls && typeof documento.preview_urls === 'object') {
            urls = documento.preview_urls;
        } else {
            console.warn(`preview_urls para token ${token} no es un objeto válido o está vacío/nulo.`);
            urls = {}; // Asegura que siempre sea un objeto
        }

        // Devuelve el estado y las URLs encontradas
        console.log(`Estado encontrado para token ${token}: ${documento.estado}`);
        res.status(200).json({
            success: true,
            status: documento.estado, // 'pendiente_pago' o 'pagado'
            urls: urls // Objeto con { matriz: '...', profesiograma: '...', perfil: '...' }
        });

    } catch (error) {
        console.error(`Error buscando documento por token ${token}:`, error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al buscar el documento.' });
    }
};

/**
 * Controlador para descargar un documento específico (Ajustado para usar BD si es necesario).
 * ESTA PARTE ES OPCIONAL AHORA, ya que las URLs son directas a Spaces.
 * Podrías necesitarla si quieres añadir lógica de autenticación antes de la descarga.
 * Por ahora, la dejamos comentada o simplificada, ya que el frontend podría usar las URLs directamente.
 */
/*
export const downloadDocument = async (req, res) => {
    const { token, tipo } = req.params;

    // Aquí podrías añadir lógica para verificar si el documento está 'pagado' antes de permitir la descarga,
    // buscando el documento por token en la BD.
    // Por simplicidad, si las URLs son públicas en Spaces, el frontend podría usarlas directamente.
    // Si necesitas proteger las descargas, esta función debería buscar la URL en la BD
    // y luego redirigir al usuario o hacer un stream del archivo desde Spaces.

    res.status(501).send('Funcionalidad de descarga directa desde el servidor no implementada en esta versión.');
};
*/

// Asegúrate de que documentos.routes.js importe y use getDocumentStatus en lugar de checkDocumentStatus