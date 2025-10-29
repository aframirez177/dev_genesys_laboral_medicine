// server/src/controllers/documentos.controller.js
import db from '../config/database.js';

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
