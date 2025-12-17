/**
 * Helper para obtener información del médico y su firma
 * Sprint 6 - Sistema Multi-Rol
 *
 * Funciones para obtener datos del médico asignado a una empresa
 * y convertir su firma a base64 para insertar en PDFs
 */

import knex from '../config/database.js';

/**
 * Obtiene la información del médico principal asignado a una empresa
 * Incluye la firma en formato base64 si está disponible
 *
 * @param {number} empresaId - ID de la empresa
 * @returns {Promise<Object|null>} Información del médico con firma_base64
 */
export async function obtenerMedicoPrincipalEmpresa(empresaId) {
    try {
        // Buscar médico principal asignado
        const asignacion = await knex('medicos_empresas as me')
            .join('users as u', 'me.medico_id', 'u.id')
            .where('me.empresa_id', empresaId)
            .where('me.activo', true)
            .where('me.es_medico_principal', true)
            .select(
                'u.id',
                'u.full_name',
                'u.email',
                'u.licencia_sst',
                'u.fecha_vencimiento_licencia',
                'u.especialidad',
                'u.firma_url',
                'u.firma_metadatos'
            )
            .first();

        if (!asignacion) {
            // Si no hay principal, buscar cualquier médico asignado
            const cualquierMedico = await knex('medicos_empresas as me')
                .join('users as u', 'me.medico_id', 'u.id')
                .where('me.empresa_id', empresaId)
                .where('me.activo', true)
                .select(
                    'u.id',
                    'u.full_name',
                    'u.email',
                    'u.licencia_sst',
                    'u.fecha_vencimiento_licencia',
                    'u.especialidad',
                    'u.firma_url',
                    'u.firma_metadatos'
                )
                .first();

            if (!cualquierMedico) {
                return null;
            }

            return await enrichMedicoWithFirma(cualquierMedico);
        }

        return await enrichMedicoWithFirma(asignacion);
    } catch (error) {
        console.error('Error obteniendo médico de empresa:', error);
        return null;
    }
}

/**
 * Obtiene la información de un médico por su ID
 * Incluye la firma en formato base64 si está disponible
 *
 * @param {number} medicoId - ID del médico
 * @returns {Promise<Object|null>} Información del médico con firma_base64
 */
export async function obtenerMedicoPorId(medicoId) {
    try {
        const medico = await knex('users')
            .where('id', medicoId)
            .select(
                'id',
                'full_name',
                'email',
                'licencia_sst',
                'fecha_vencimiento_licencia',
                'especialidad',
                'firma_url',
                'firma_metadatos'
            )
            .first();

        if (!medico) {
            return null;
        }

        return await enrichMedicoWithFirma(medico);
    } catch (error) {
        console.error('Error obteniendo médico:', error);
        return null;
    }
}

/**
 * Enriquece el objeto médico con la firma en base64
 *
 * @param {Object} medico - Objeto con datos del médico
 * @returns {Promise<Object>} Médico con firma_base64 añadida
 */
async function enrichMedicoWithFirma(medico) {
    if (!medico.firma_url) {
        return {
            ...medico,
            firma_base64: null
        };
    }

    try {
        // Descargar la firma desde la URL (DigitalOcean Spaces)
        const response = await fetch(medico.firma_url);

        if (!response.ok) {
            console.warn('No se pudo descargar firma del médico:', response.status);
            return {
                ...medico,
                firma_base64: null
            };
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convertir a base64 con prefijo data URI
        const base64 = `data:image/png;base64,${buffer.toString('base64')}`;

        // Parsear metadatos si existen
        let metadatos = medico.firma_metadatos;
        if (typeof metadatos === 'string') {
            try {
                metadatos = JSON.parse(metadatos);
            } catch (e) {
                metadatos = {};
            }
        }

        return {
            ...medico,
            firma_base64: base64,
            firma_width: metadatos?.width || 300,
            firma_height: metadatos?.height || 100
        };
    } catch (error) {
        console.error('Error convirtiendo firma a base64:', error);
        return {
            ...medico,
            firma_base64: null
        };
    }
}

/**
 * Verifica si un médico tiene firma configurada
 *
 * @param {number} medicoId - ID del médico
 * @returns {Promise<boolean>}
 */
export async function medicoTieneFirma(medicoId) {
    try {
        const result = await knex('users')
            .where('id', medicoId)
            .whereNotNull('firma_url')
            .select('id')
            .first();

        return !!result;
    } catch (error) {
        console.error('Error verificando firma del médico:', error);
        return false;
    }
}

export default {
    obtenerMedicoPrincipalEmpresa,
    obtenerMedicoPorId,
    medicoTieneFirma
};
