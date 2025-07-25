import db from '../config/database.js';
// Importamos las funciones de generación de documentos reales
import { generarMatrizExcel } from './matriz-riesgos.controller.js';
import { generarProfesiogramaPDF } from './profesiograma.controller.js';

// Usaremos un mapa en memoria para almacenar temporalmente los archivos generados.
// La clave será el token, y el valor será un mapa de los buffers de los archivos.
const jobStore = new Map();

/**
 * Inicia la generación real de los documentos.
 * Por ahora, solo genera la matriz de riesgos gratuita.
 */
export async function startDocumentGeneration(token) {
    try {
        // 1. Marcar el trabajo como 'pending'
        jobStore.set(token, { status: 'pending', files: new Map() });

        // 2. Obtener los datos del formulario desde la BD
        const record = await db('document_sets').where({ token }).first();
        if (!record) {
            throw new Error('No se encontró el registro en la base de datos.');
        }
        // CORRECCIÓN: Los datos ya vienen como un objeto JSON desde la BD con Knex/pg, no es necesario parsearlos.
        const formData = record.form_data;

        // 3. Generar el buffer del Excel (versión gratuita)
        const matrizGratuitaBuffer = await generarMatrizExcel(formData, { isFree: true });
        
        // 4. Generar el buffer del PDF del Profesiograma (versión gratuita)
        const profesiogramaGratuitoBuffer = await generarProfesiogramaPDF(formData, { isFree: true });

        // 5. Almacenar los buffers en memoria
        const currentJob = jobStore.get(token);
        currentJob.files.set('matriz-riesgos-gratuita', {
            buffer: matrizGratuitaBuffer,
            filename: 'matriz-de-riesgos-diagnostico.xlsx',
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        currentJob.files.set('profesiograma-gratuito', {
            buffer: profesiogramaGratuitoBuffer,
            filename: 'profesiograma-diagnostico.pdf',
            contentType: 'application/pdf'
        });
        
        // Simular los otros dos documentos
        currentJob.files.set('perfil-cargo-gratuito', {
            buffer: Buffer.from('Este es el PDF del perfil de cargo gratuito.'),
            filename: 'perfil-de-cargo.pdf',
            contentType: 'application/pdf'
        });
        currentJob.files.set('cotizacion-examenes', {
            buffer: Buffer.from('Este es el PDF de la cotización de exámenes.'),
            filename: 'cotizacion-examenes.pdf',
            contentType: 'application/pdf'
        });

        // 6. Actualizar el estado a 'completed'
        currentJob.status = 'completed';
        
        // 7. Actualizar el estado en la base de datos
        await db('document_sets').where({ token }).update({ status: 'completed' });

    } catch (error) {
        console.error(`Error en la generación de documentos para el token ${token}:`, error);
        // Marcar el trabajo como fallido
        jobStore.set(token, { status: 'failed', message: error.message });
        await db('document_sets').where({ token }).update({ status: 'failed' });
    }
}

/**
 * Controlador para verificar el estado de la generación de documentos.
 */
export const checkDocumentStatus = async (req, res) => {
    const { token } = req.params;
    const job = jobStore.get(token);

    if (!job) {
        return res.status(404).json({ success: false, message: 'Trabajo no encontrado.' });
    }

    if (job.status === 'completed') {
        // Crear los enlaces de descarga dinámicamente
        const documents = [
            { name: 'Matriz de Riesgos (Diagnóstico)', url: `/api/documentos/download/${token}/matriz-riesgos-gratuita` },
            { name: 'Profesiograma (Diagnóstico)', url: `/api/documentos/download/${token}/profesiograma-gratuito` },
            { name: 'Perfil de Cargo', url: `/api/documentos/download/${token}/perfil-cargo-gratuito` },
            { name: 'Cotización de Exámenes', url: `/api/documentos/download/${token}/cotizacion-examenes` }
        ];
        res.status(200).json({ status: 'completed', documents: documents });
    } else if (job.status === 'failed') {
        res.status(500).json({ status: 'failed', message: job.message || 'La generación de documentos ha fallado.' });
    } else { // 'pending'
        res.status(200).json({ status: 'pending' });
    }
};

/**
 * Controlador para descargar un documento específico.
 */
export const downloadDocument = async (req, res) => {
    const { token, tipo } = req.params;
    const job = jobStore.get(token);

    if (!job || job.status !== 'completed' || !job.files.has(tipo)) {
        return res.status(404).send('Documento no encontrado o no está listo.');
    }

    try {
        const file = job.files.get(tipo);
        
        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${file.filename}`);
        res.send(file.buffer);
        
    } catch (error) {
        console.error(`Error al enviar el documento ${tipo} para el token ${token}:`, error);
        res.status(500).send('Error interno al enviar el documento.');
    }
}; 