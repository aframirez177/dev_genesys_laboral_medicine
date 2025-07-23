import db from '../config/database.js';

// Simulación en memoria para el estado de la generación de archivos
// En un sistema real, esto podría ser una tabla en la BD o un sistema de colas como Redis.
const jobStatus = new Map();

/**
 * Inicia la simulación de la generación de documentos.
 * En el futuro, aquí se llamará a la generación real de cada archivo.
 */
export function startDocumentGeneration(token) {
    // Marcar el trabajo como 'pending'
    jobStatus.set(token, { status: 'pending', files: [] });

    // Simular un tiempo de procesamiento
    setTimeout(() => {
        // Una vez completado, actualizar el estado y añadir los enlaces de descarga
        jobStatus.set(token, {
            status: 'completed',
            files: [
                { name: 'Matriz de Riesgos y Peligros', url: `/api/documentos/download/${token}/matriz-riesgos` },
                { name: 'Profesiograma', url: `/api/documentos/download/${token}/profesiograma` },
                { name: 'Cotización de Exámenes Ocupacionales', url: `/api/documentos/download/${token}/cotizacion` }
            ]
        });
    }, 10000); // Simular 10 segundos de procesamiento
}


/**
 * Controlador para verificar el estado de la generación de documentos.
 */
export const checkDocumentStatus = async (req, res) => {
    const { token } = req.params;
    
    // Consultar el estado del trabajo usando el token
    const statusInfo = jobStatus.get(token);

    if (!statusInfo) {
        return res.status(404).json({ success: false, message: 'No se encontró un trabajo con el token proporcionado.' });
    }

    if (statusInfo.status === 'completed') {
        res.status(200).json({
            status: 'completed',
            documents: statusInfo.files
        });
    } else if (statusInfo.status === 'failed') {
        res.status(200).json({
            status: 'failed',
            message: 'La generación del documento falló.'
        });
    } else { // 'pending'
        res.status(200).json({
            status: 'pending'
        });
    }
};

/**
 * Controlador para descargar un documento específico.
 * En el futuro, obtendrá los datos de la BD, generará el archivo y lo enviará.
 */
export const downloadDocument = async (req, res) => {
    const { token, tipo } = req.params;

    try {
        // 1. Validar el token y que el trabajo esté completado
        const record = await db('document_sets').where({ token, status: 'completed' }).first();
        if (!record) {
            return res.status(404).send('Documento no encontrado o no está listo.');
        }

        // 2. Aquí iría la lógica para generar el archivo específico (ej. la matriz)
        // Por ahora, enviaremos un archivo de texto de ejemplo.
        
        // const datosFormulario = JSON.parse(record.form_data);
        // const buffer = await generarMatrizExcel(datosFormulario);

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=${tipo}.txt`);
        res.send(`Este es el documento de ejemplo para: ${tipo}`);
        
    } catch (error) {
        console.error(`Error al generar el documento ${tipo} para el token ${token}:`, error);
        res.status(500).send('Error interno al generar el documento.');
    }
}; 