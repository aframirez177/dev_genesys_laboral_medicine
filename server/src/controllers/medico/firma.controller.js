/**
 * Controller: Firma Digital del Médico
 * Permite subir, obtener y eliminar la firma PNG con transparencia
 */

import knex from '../../config/database.js';
import { uploadToSpaces, deleteFromSpaces } from '../../utils/spaces.js';
import sharp from 'sharp';
import crypto from 'crypto';

/**
 * Obtener firma actual del médico
 */
export async function obtener(req, res) {
    try {
        const user = await knex('users')
            .where('id', req.user.id)
            .select('firma_url', 'firma_metadatos')
            .first();

        if (!user || !user.firma_url) {
            return res.json({
                success: true,
                tieneFirma: false,
                firma: null
            });
        }

        res.json({
            success: true,
            tieneFirma: true,
            firma: {
                url: user.firma_url,
                ...(typeof user.firma_metadatos === 'string'
                    ? JSON.parse(user.firma_metadatos)
                    : user.firma_metadatos)
            }
        });
    } catch (error) {
        console.error('Error obteniendo firma:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo firma'
        });
    }
}

/**
 * Subir nueva firma PNG con transparencia
 * Requisitos:
 * - Formato PNG
 * - Debe tener canal alpha (transparencia)
 * - Tamaño máximo 500KB
 * - Dimensiones mínimas: 100x30px
 */
export async function subir(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Archivo de firma requerido',
                code: 'NO_FILE'
            });
        }

        const buffer = req.file.buffer;

        // Validar y obtener metadata con Sharp
        let metadata;
        try {
            metadata = await sharp(buffer).metadata();
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo procesar la imagen',
                code: 'INVALID_IMAGE'
            });
        }

        // Validar que sea PNG
        if (metadata.format !== 'png') {
            return res.status(400).json({
                success: false,
                message: 'El archivo debe ser formato PNG',
                code: 'INVALID_FORMAT'
            });
        }

        // Validar que tenga canal alpha (transparencia)
        if (!metadata.hasAlpha) {
            return res.status(400).json({
                success: false,
                message: 'La imagen debe tener fondo transparente (canal alpha)',
                code: 'NO_TRANSPARENCY'
            });
        }

        // Validar dimensiones mínimas
        if (metadata.width < 100 || metadata.height < 30) {
            return res.status(400).json({
                success: false,
                message: 'La imagen es muy pequeña. Mínimo 100x30 píxeles',
                code: 'TOO_SMALL'
            });
        }

        // Optimizar imagen si es muy grande (max 600px ancho)
        let processedBuffer = buffer;
        let finalWidth = metadata.width;
        let finalHeight = metadata.height;

        if (metadata.width > 600) {
            const resizedImage = await sharp(buffer)
                .resize(600, null, { withoutEnlargement: true })
                .png({ quality: 90 })
                .toBuffer();

            processedBuffer = resizedImage;

            // Obtener nuevas dimensiones
            const newMeta = await sharp(processedBuffer).metadata();
            finalWidth = newMeta.width;
            finalHeight = newMeta.height;
        }

        // Generar hash SHA-256 para verificación de integridad
        const hash = crypto
            .createHash('sha256')
            .update(processedBuffer)
            .digest('hex');

        // Subir a DigitalOcean Spaces
        const fileName = `firmas/medico_${req.user.id}_${Date.now()}.png`;
        const uploadResult = await uploadToSpaces(processedBuffer, fileName, 'image/png');

        // Eliminar firma anterior si existe
        const userActual = await knex('users')
            .where('id', req.user.id)
            .select('firma_url')
            .first();

        if (userActual?.firma_url) {
            try {
                await deleteFromSpaces(userActual.firma_url);
            } catch (e) {
                console.warn('No se pudo eliminar firma anterior:', e.message);
            }
        }

        // Preparar metadatos
        const firmaMetadatos = {
            width: finalWidth,
            height: finalHeight,
            hash: hash,
            size: processedBuffer.length,
            updated_at: new Date().toISOString()
        };

        // Actualizar en BD
        await knex('users')
            .where('id', req.user.id)
            .update({
                firma_url: uploadResult.url,
                firma_metadatos: JSON.stringify(firmaMetadatos),
                updated_at: knex.fn.now()
            });

        // Registrar en auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'subir_firma',
            recurso: 'users',
            recurso_id: req.user.id,
            detalles: JSON.stringify({
                hash,
                size: processedBuffer.length,
                dimensions: `${finalWidth}x${finalHeight}`
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Firma subida exitosamente',
            firma: {
                url: uploadResult.url,
                ...firmaMetadatos
            }
        });
    } catch (error) {
        console.error('Error subiendo firma:', error);

        if (error.message?.includes('Solo se permiten archivos PNG')) {
            return res.status(400).json({
                success: false,
                message: error.message,
                code: 'INVALID_FILE_TYPE'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error procesando firma'
        });
    }
}

/**
 * Eliminar firma del médico
 */
export async function eliminar(req, res) {
    try {
        const user = await knex('users')
            .where('id', req.user.id)
            .select('firma_url')
            .first();

        if (!user?.firma_url) {
            return res.status(404).json({
                success: false,
                message: 'No hay firma para eliminar'
            });
        }

        // Eliminar de Spaces
        try {
            await deleteFromSpaces(user.firma_url);
        } catch (e) {
            console.warn('Error eliminando firma de Spaces:', e.message);
        }

        // Actualizar BD
        await knex('users')
            .where('id', req.user.id)
            .update({
                firma_url: null,
                firma_metadatos: null,
                updated_at: knex.fn.now()
            });

        // Auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'eliminar_firma',
            recurso: 'users',
            recurso_id: req.user.id,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Firma eliminada'
        });
    } catch (error) {
        console.error('Error eliminando firma:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando firma'
        });
    }
}

/**
 * Validar firma existente (verificar integridad)
 */
export async function validar(req, res) {
    try {
        const user = await knex('users')
            .where('id', req.user.id)
            .select('firma_url', 'firma_metadatos')
            .first();

        if (!user?.firma_url) {
            return res.json({
                success: true,
                valida: false,
                message: 'No hay firma registrada'
            });
        }

        const metadatos = typeof user.firma_metadatos === 'string'
            ? JSON.parse(user.firma_metadatos)
            : user.firma_metadatos;

        res.json({
            success: true,
            valida: true,
            firma: {
                url: user.firma_url,
                hash: metadatos?.hash,
                updated_at: metadatos?.updated_at,
                dimensions: metadatos ? `${metadatos.width}x${metadatos.height}` : null
            }
        });
    } catch (error) {
        console.error('Error validando firma:', error);
        res.status(500).json({
            success: false,
            message: 'Error validando firma'
        });
    }
}
