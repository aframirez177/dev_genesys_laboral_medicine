/**
 * Controller: Auditoría del Sistema
 * Permite ver el historial de acciones realizadas en el sistema
 */

import knex from '../../config/database.js';

/**
 * Listar registros de auditoría con filtros
 */
export async function listar(req, res) {
    try {
        const {
            page = 1,
            limit = 50,
            user_id,
            accion,
            recurso,
            fecha_inicio,
            fecha_fin
        } = req.query;

        let query = knex('auditoria as a')
            .leftJoin('users as u', 'a.user_id', 'u.id')
            .select(
                'a.id',
                'a.user_id',
                'a.accion',
                'a.recurso',
                'a.recurso_id',
                'a.detalles',
                'a.ip_address',
                'a.created_at',
                'u.full_name as usuario_nombre',
                'u.email as usuario_email'
            );

        // Filtros
        if (user_id) {
            query = query.where('a.user_id', user_id);
        }
        if (accion) {
            query = query.where('a.accion', accion);
        }
        if (recurso) {
            query = query.where('a.recurso', recurso);
        }
        if (fecha_inicio) {
            query = query.where('a.created_at', '>=', fecha_inicio);
        }
        if (fecha_fin) {
            query = query.where('a.created_at', '<=', fecha_fin);
        }

        // Contar total (crear query separada para evitar conflictos con GROUP BY)
        let countQuery = knex('auditoria as a');
        if (user_id) countQuery = countQuery.where('a.user_id', user_id);
        if (accion) countQuery = countQuery.where('a.accion', accion);
        if (recurso) countQuery = countQuery.where('a.recurso', recurso);
        if (fecha_inicio) countQuery = countQuery.where('a.created_at', '>=', fecha_inicio);
        if (fecha_fin) countQuery = countQuery.where('a.created_at', '<=', fecha_fin);
        const [{ count: total }] = await countQuery.count('* as count');

        // Paginación
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const registros = await query
            .orderBy('a.created_at', 'desc')
            .limit(parseInt(limit))
            .offset(offset);

        res.json({
            success: true,
            registros,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(total),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error listando auditoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo registros de auditoría'
        });
    }
}

/**
 * Exportar registros de auditoría (para reportes)
 */
export async function exportar(req, res) {
    try {
        const {
            user_id,
            accion,
            recurso,
            fecha_inicio,
            fecha_fin,
            formato = 'json'
        } = req.query;

        let query = knex('auditoria as a')
            .leftJoin('users as u', 'a.user_id', 'u.id')
            .select(
                'a.id',
                'a.accion',
                'a.recurso',
                'a.recurso_id',
                'a.detalles',
                'a.ip_address',
                'a.created_at',
                'u.full_name as usuario_nombre',
                'u.email as usuario_email'
            );

        // Filtros
        if (user_id) query = query.where('a.user_id', user_id);
        if (accion) query = query.where('a.accion', accion);
        if (recurso) query = query.where('a.recurso', recurso);
        if (fecha_inicio) query = query.where('a.created_at', '>=', fecha_inicio);
        if (fecha_fin) query = query.where('a.created_at', '<=', fecha_fin);

        const registros = await query.orderBy('a.created_at', 'desc').limit(10000);

        if (formato === 'csv') {
            // Generar CSV
            const headers = [
                'ID', 'Fecha', 'Usuario', 'Email', 'Acción',
                'Recurso', 'ID Recurso', 'IP', 'Detalles'
            ];

            let csv = headers.join(',') + '\n';

            registros.forEach(r => {
                const row = [
                    r.id,
                    r.created_at,
                    `"${r.usuario_nombre || 'Sistema'}"`,
                    r.usuario_email || '',
                    r.accion,
                    r.recurso,
                    r.recurso_id || '',
                    r.ip_address || '',
                    `"${JSON.stringify(r.detalles || {}).replace(/"/g, '""')}"`
                ];
                csv += row.join(',') + '\n';
            });

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=auditoria_${Date.now()}.csv`);
            return res.send(csv);
        }

        // Default: JSON
        res.json({
            success: true,
            total: registros.length,
            registros
        });
    } catch (error) {
        console.error('Error exportando auditoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error exportando auditoría'
        });
    }
}

/**
 * Obtener lista de acciones únicas (para filtros)
 */
export async function accionesDisponibles(req, res) {
    try {
        const acciones = await knex('auditoria')
            .distinct('accion')
            .orderBy('accion', 'asc');

        res.json({
            success: true,
            acciones: acciones.map(a => a.accion)
        });
    } catch (error) {
        console.error('Error obteniendo acciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo acciones'
        });
    }
}

/**
 * Obtener lista de recursos únicos (para filtros)
 */
export async function recursosDisponibles(req, res) {
    try {
        const recursos = await knex('auditoria')
            .distinct('recurso')
            .orderBy('recurso', 'asc');

        res.json({
            success: true,
            recursos: recursos.map(r => r.recurso)
        });
    } catch (error) {
        console.error('Error obteniendo recursos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo recursos'
        });
    }
}
