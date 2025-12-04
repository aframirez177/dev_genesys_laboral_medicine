// server/src/controllers/documentos.controller.js
import db from '../config/database.js';

/**
 * Obtener documentos por empresa_id (para dashboard)
 * GET /api/documentos/empresa/:empresaId
 */
export const getDocumentsByEmpresa = async (req, res) => {
    const { empresaId } = req.params;

    if (!empresaId) {
        return res.status(400).json({
            success: false,
            message: 'empresa_id es requerido'
        });
    }

    try {
        const documentos = await db('documentos_generados')
            .select(
                'documentos_generados.*',
                'empresas.nombre_legal as nombreEmpresa',
                'empresas.nit as nitEmpresa'
            )
            .leftJoin('empresas', 'documentos_generados.empresa_id', 'empresas.id')
            .where('documentos_generados.empresa_id', empresaId)
            .orderBy('documentos_generados.created_at', 'desc')
            .limit(50);

        // Parsear preview_urls y metadata para cada documento
        const parsedDocuments = documentos.map(doc => {
            let preview_urls = {};
            let metadata = {};

            if (doc.preview_urls) {
                try {
                    preview_urls = typeof doc.preview_urls === 'string'
                        ? JSON.parse(doc.preview_urls)
                        : doc.preview_urls;
                } catch (e) {
                    console.error('Error parseando preview_urls:', e);
                }
            }

            // Construir metadata desde campos del documento
            metadata = {
                nombreEmpresa: doc.nombreEmpresa || 'N/A',
                nitEmpresa: doc.nitEmpresa || 'N/A',
                numCargos: doc.num_cargos || 0,
                nombreResponsable: doc.nombre_responsable || 'N/A',
                fechaGeneracion: doc.created_at,
                pricing: doc.pricing || {}
            };

            return {
                id: doc.id,
                token_acceso: doc.token,
                estado: doc.estado,
                preview_urls,
                metadata,
                created_at: doc.created_at
            };
        });

        res.json({
            success: true,
            documents: parsedDocuments,
            count: parsedDocuments.length
        });

    } catch (error) {
        console.error('Error obteniendo documentos por empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

export const getDocumentStatus = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token no proporcionado.' });
    }

    try {
        // JOIN con empresas para obtener datos de la empresa
        const documento = await db('documentos_generados')
            .select(
                'documentos_generados.*',
                'empresas.nombre_legal as nombreEmpresa',
                'empresas.nit as nitEmpresa'
            )
            .leftJoin('empresas', 'documentos_generados.empresa_id', 'empresas.id')
            .where({ 'documentos_generados.token': token })
            .first();

        if (!documento) {
            console.warn(`❌ Documento no encontrado para token: ${token}`);
            return res.status(404).json({ success: false, message: 'Documento no encontrado.' });
        }

        console.log(`✅ Documento encontrado: ID ${documento.id}, Estado: ${documento.estado}`);

        // ============================================
        // PARSEAR URLS (incluye thumbnails)
        // ============================================
        let urlsData = {};
        if (documento.preview_urls && typeof documento.preview_urls === 'object') {
            urlsData = documento.preview_urls;
        } else if (typeof documento.preview_urls === 'string') {
            try {
                urlsData = JSON.parse(documento.preview_urls || '{}');
            } catch (e) {
                console.error(`❌ Error parseando preview_urls (token ${token}):`, e);
                urlsData = {};
            }
        }

        // Separar URLs de documentos y thumbnails
        const { thumbnails, ...urls } = urlsData;

        // ============================================
        // PARSEAR PRICING
        // ============================================
        let pricing = {};
        if (documento.pricing && typeof documento.pricing === 'object') {
            pricing = documento.pricing;
        } else if (typeof documento.pricing === 'string') {
            try {
                pricing = JSON.parse(documento.pricing || '{}');
            } catch (e) {
                console.error(`❌ Error parseando pricing (token ${token}):`, e);
                pricing = {};
            }
        }

        // ============================================
        // CONSTRUIR METADATA
        // ============================================
        const metadata = {
            nombreEmpresa: documento.nombreEmpresa || 'N/A',
            nitEmpresa: documento.nitEmpresa || 'N/A',
            numCargos: documento.num_cargos || 0,
            nombreResponsable: documento.nombre_responsable || 'N/A',
            fechaGeneracion: documento.created_at,
            pricing: {
                precioBase: pricing.precioBase || 30000,
                numCargos: pricing.numCargos || documento.num_cargos || 0,
                precioMatriz: pricing.precioMatriz || 0,
                precioProfesiograma: pricing.precioProfesiograma || 0,
                precioPerfil: pricing.precioPerfil || 0,
                precioCotizacion: pricing.precioCotizacion || 0,
                subtotal: pricing.subtotal || 0,
                descuento: pricing.descuento || 0,
                total: pricing.total || 0
            }
        };

        console.log('📦 Metadata construida:', metadata);

        // ============================================
        // RESPUESTA FINAL
        // ============================================
        res.status(200).json({
            success: true,
            status: documento.estado,
            urls,
            thumbnails: thumbnails || {}, // 🆕 URLs de thumbnails
            metadata // 🆕 Metadata enriquecida
        });

    } catch (error) {
        console.error(`❌ Error buscando documento por token ${token}:`, error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al buscar el documento.',
            error: error.message
        });
    }
};
