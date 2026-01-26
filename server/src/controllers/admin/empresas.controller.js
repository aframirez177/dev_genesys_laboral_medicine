/**
 * Controller: Gestión de Empresas (Admin)
 * Admin puede ver todas las empresas, actualizar datos, suspender/activar
 */

import knex from '../../config/database.js';

/**
 * Listar todas las empresas con filtros
 */
export async function listar(req, res) {
    try {
        console.log('[Admin/Empresas] Listando empresas...');
        const {
            page = 1,
            limit = 20,
            status,
            busqueda,
            ciudad,
            sector
        } = req.query;

        let query = knex('empresas as e')
            .select(
                'e.id',
                'e.nit',
                'e.nombre_legal',
                'e.email',
                'e.telefono',
                'e.ciudad',
                'e.sector_economico',
                'e.status',
                'e.ultimo_pago',
                'e.created_at'
            );

        // Filtros
        if (status) {
            query = query.where('e.status', status);
        }
        if (ciudad) {
            query = query.where('e.ciudad', 'ilike', `%${ciudad}%`);
        }
        if (sector) {
            query = query.where('e.sector_economico', 'ilike', `%${sector}%`);
        }
        if (busqueda) {
            query = query.where(function () {
                this.where('e.nombre_legal', 'ilike', `%${busqueda}%`)
                    .orWhere('e.nit', 'ilike', `%${busqueda}%`)
                    .orWhere('e.email', 'ilike', `%${busqueda}%`);
            });
        }

        // Contar total (query separado sin select previo)
        let countQuery = knex('empresas as e');
        if (status) countQuery = countQuery.where('e.status', status);
        if (ciudad) countQuery = countQuery.where('e.ciudad', 'ilike', `%${ciudad}%`);
        if (sector) countQuery = countQuery.where('e.sector_economico', 'ilike', `%${sector}%`);
        if (busqueda) {
            countQuery = countQuery.where(function () {
                this.where('e.nombre_legal', 'ilike', `%${busqueda}%`)
                    .orWhere('e.nit', 'ilike', `%${busqueda}%`)
                    .orWhere('e.email', 'ilike', `%${busqueda}%`);
            });
        }
        const [{ count: total }] = await countQuery.count('* as count');

        // Paginación
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const empresas = await query
            .orderBy('e.nombre_legal', 'asc')
            .limit(parseInt(limit))
            .offset(offset);

        // Agregar conteo de médicos asignados
        for (const empresa of empresas) {
            const conteo = await knex('medicos_empresas')
                .where({ empresa_id: empresa.id, activo: true })
                .count('* as total')
                .first();
            empresa.medicos_asignados = parseInt(conteo?.total || 0);
        }

        res.json({
            success: true,
            empresas,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(total),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[Admin/Empresas] Error listando empresas:', error.message);
        console.error('[Admin/Empresas] Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo empresas',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Obtener detalle de una empresa
 */
export async function obtener(req, res) {
    try {
        const { id } = req.params;

        const empresa = await knex('empresas')
            .where('id', id)
            .first();

        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        // Obtener médicos asignados
        const medicos = await knex('medicos_empresas as me')
            .join('users as u', 'me.medico_id', 'u.id')
            .where('me.empresa_id', id)
            .where('me.activo', true)
            .select(
                'u.id',
                'u.full_name',
                'u.email',
                'u.licencia_sst',
                'me.es_medico_principal',
                'me.fecha_asignacion'
            );

        // Obtener último pago
        const ultimoPago = await knex('pagos_manuales')
            .where({ empresa_id: id, estado: 'aprobado' })
            .orderBy('fecha_aprobacion', 'desc')
            .first();

        // Conteo de documentos generados
        const documentos = await knex('documentos_generados')
            .where('empresa_id', id)
            .count('* as total')
            .first();

        res.json({
            success: true,
            empresa: {
                ...empresa,
                medicos_asignados: medicos,
                ultimo_pago: ultimoPago,
                total_documentos: parseInt(documentos?.total || 0)
            }
        });
    } catch (error) {
        console.error('Error obteniendo empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo empresa'
        });
    }
}

/**
 * Actualizar datos de una empresa
 */
export async function actualizar(req, res) {
    try {
        const { id } = req.params;
        const {
            email,
            telefono,
            ciudad,
            direccion,
            ciiu,
            sector_economico,
            responsable_sst_nombre,
            responsable_sst_cargo,
            responsable_sst_telefono,
            responsable_sst_email,
            servicio_matriz_riesgos,
            servicio_profesiograma,
            servicio_sve,
            servicio_bateria_psicosocial
        } = req.body;

        // Verificar que existe
        const empresa = await knex('empresas').where('id', id).first();
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        // Preparar datos de actualización
        const datosActualizar = {};
        if (email !== undefined) datosActualizar.email = email;
        if (telefono !== undefined) datosActualizar.telefono = telefono;
        if (ciudad !== undefined) datosActualizar.ciudad = ciudad;
        if (direccion !== undefined) datosActualizar.direccion = direccion;
        if (ciiu !== undefined) datosActualizar.ciiu = ciiu;
        if (sector_economico !== undefined) datosActualizar.sector_economico = sector_economico;
        if (responsable_sst_nombre !== undefined) datosActualizar.responsable_sst_nombre = responsable_sst_nombre;
        if (responsable_sst_cargo !== undefined) datosActualizar.responsable_sst_cargo = responsable_sst_cargo;
        if (responsable_sst_telefono !== undefined) datosActualizar.responsable_sst_telefono = responsable_sst_telefono;
        if (responsable_sst_email !== undefined) datosActualizar.responsable_sst_email = responsable_sst_email;
        if (servicio_matriz_riesgos !== undefined) datosActualizar.servicio_matriz_riesgos = servicio_matriz_riesgos;
        if (servicio_profesiograma !== undefined) datosActualizar.servicio_profesiograma = servicio_profesiograma;
        if (servicio_sve !== undefined) datosActualizar.servicio_sve = servicio_sve;
        if (servicio_bateria_psicosocial !== undefined) datosActualizar.servicio_bateria_psicosocial = servicio_bateria_psicosocial;

        datosActualizar.updated_at = knex.fn.now();

        // Actualizar
        const [empresaActualizada] = await knex('empresas')
            .where('id', id)
            .update(datosActualizar)
            .returning('*');

        // Auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'actualizar_empresa',
            recurso: 'empresas',
            recurso_id: id,
            valores_anteriores: JSON.stringify(empresa),
            valores_nuevos: JSON.stringify(datosActualizar),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Empresa actualizada',
            empresa: empresaActualizada
        });
    } catch (error) {
        console.error('Error actualizando empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando empresa'
        });
    }
}

/**
 * Suspender una empresa
 */
export async function suspender(req, res) {
    try {
        const { id } = req.params;
        const { razon_suspension } = req.body;

        if (!razon_suspension) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar una razón de suspensión'
            });
        }

        const empresa = await knex('empresas').where('id', id).first();
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        if (empresa.status === 'suspendida') {
            return res.status(400).json({
                success: false,
                message: 'La empresa ya está suspendida'
            });
        }

        const [empresaActualizada] = await knex('empresas')
            .where('id', id)
            .update({
                status: 'suspendida',
                fecha_suspension: knex.fn.now(),
                razon_suspension,
                updated_at: knex.fn.now()
            })
            .returning('*');

        // Auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'suspender_empresa',
            recurso: 'empresas',
            recurso_id: id,
            detalles: JSON.stringify({ razon_suspension }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Empresa suspendida',
            empresa: empresaActualizada
        });
    } catch (error) {
        console.error('Error suspendiendo empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error suspendiendo empresa'
        });
    }
}

/**
 * Activar una empresa suspendida
 */
export async function activar(req, res) {
    try {
        const { id } = req.params;

        const empresa = await knex('empresas').where('id', id).first();
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        if (empresa.status === 'activa') {
            return res.status(400).json({
                success: false,
                message: 'La empresa ya está activa'
            });
        }

        const [empresaActualizada] = await knex('empresas')
            .where('id', id)
            .update({
                status: 'activa',
                fecha_suspension: null,
                razon_suspension: null,
                updated_at: knex.fn.now()
            })
            .returning('*');

        // Auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'activar_empresa',
            recurso: 'empresas',
            recurso_id: id,
            detalles: JSON.stringify({ status_anterior: empresa.status }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Empresa activada',
            empresa: empresaActualizada
        });
    } catch (error) {
        console.error('Error activando empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error activando empresa'
        });
    }
}

/**
 * Marcar una empresa como pagada (pago manual directo)
 * Temporal hasta implementar PayU
 */
export async function marcarPagado(req, res) {
    try {
        const { id } = req.params;
        const { notas } = req.body;

        const empresa = await knex('empresas').where('id', id).first();
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        const [empresaActualizada] = await knex('empresas')
            .where('id', id)
            .update({
                status: 'activa',
                ultimo_pago: knex.fn.now(),
                updated_at: knex.fn.now()
            })
            .returning('*');

        // Auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'marcar_pagado',
            recurso: 'empresas',
            recurso_id: id,
            detalles: JSON.stringify({ notas: notas || 'Pago manual marcado por admin' }),
            valores_anteriores: JSON.stringify({ status: empresa.status, ultimo_pago: empresa.ultimo_pago }),
            valores_nuevos: JSON.stringify({ status: 'activa', ultimo_pago: new Date().toISOString() }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        console.log(`[Admin/Empresas] Empresa ${id} marcada como pagada por admin ${req.user.id}`);

        res.json({
            success: true,
            message: 'Empresa marcada como pagada',
            empresa: empresaActualizada
        });
    } catch (error) {
        console.error('Error marcando empresa como pagada:', error);
        res.status(500).json({
            success: false,
            message: 'Error marcando empresa como pagada'
        });
    }
}

/**
 * Obtener médicos asignados a una empresa
 */
export async function medicosAsignados(req, res) {
    try {
        const { id } = req.params;

        const medicos = await knex('medicos_empresas as me')
            .join('users as u', 'me.medico_id', 'u.id')
            .leftJoin('users as asignador', 'me.asignado_por', 'asignador.id')
            .where('me.empresa_id', id)
            .where('me.activo', true)
            .select(
                'me.id as asignacion_id',
                'me.fecha_asignacion',
                'me.es_medico_principal',
                'me.notas',
                'u.id as medico_id',
                'u.full_name',
                'u.email',
                'u.licencia_sst',
                'u.especialidad',
                'u.firma_url',
                'asignador.full_name as asignado_por_nombre'
            )
            .orderBy('me.es_medico_principal', 'desc')
            .orderBy('me.fecha_asignacion', 'asc');

        res.json({
            success: true,
            medicos
        });
    } catch (error) {
        console.error('Error obteniendo médicos de empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo médicos'
        });
    }
}
