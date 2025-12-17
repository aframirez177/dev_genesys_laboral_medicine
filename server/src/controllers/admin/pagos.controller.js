/**
 * Controller: Gestión de Pagos Manuales
 * Admin puede registrar, aprobar y rechazar pagos que no pasan por PayU
 */

import knex from '../../config/database.js';
import { uploadToSpaces, deleteFromSpaces } from '../../utils/spaces.js';

/**
 * Listar todos los pagos con filtros y paginación
 */
export async function listar(req, res) {
    try {
        console.log('[Admin/Pagos] Listando pagos...');
        const {
            page = 1,
            limit = 20,
            estado,
            metodo,
            empresa_id,
            fecha_inicio,
            fecha_fin
        } = req.query;

        let query = knex('pagos_manuales as p')
            .leftJoin('empresas as e', 'p.empresa_id', 'e.id')
            .leftJoin('users as u_reg', 'p.registrado_por', 'u_reg.id')
            .leftJoin('users as u_apr', 'p.aprobado_por', 'u_apr.id')
            .select(
                'p.*',
                'e.nombre_legal as empresa_nombre',
                'e.nit as empresa_nit',
                'u_reg.full_name as registrado_por_nombre',
                'u_apr.full_name as aprobado_por_nombre'
            );

        // Filtros
        if (estado) {
            query = query.where('p.estado', estado);
        }
        if (metodo) {
            query = query.where('p.metodo_pago', metodo);
        }
        if (empresa_id) {
            query = query.where('p.empresa_id', empresa_id);
        }
        if (fecha_inicio) {
            query = query.where('p.created_at', '>=', fecha_inicio);
        }
        if (fecha_fin) {
            query = query.where('p.created_at', '<=', fecha_fin);
        }

        // Contar total (query separado)
        let countQuery = knex('pagos_manuales as p');
        if (estado) countQuery = countQuery.where('p.estado', estado);
        if (metodo) countQuery = countQuery.where('p.metodo_pago', metodo);
        if (empresa_id) countQuery = countQuery.where('p.empresa_id', empresa_id);
        if (fecha_inicio) countQuery = countQuery.where('p.created_at', '>=', fecha_inicio);
        if (fecha_fin) countQuery = countQuery.where('p.created_at', '<=', fecha_fin);
        const [{ count: total }] = await countQuery.count('* as count');

        // Paginación y ordenamiento
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const pagos = await query
            .orderBy('p.created_at', 'desc')
            .limit(parseInt(limit))
            .offset(offset);

        res.json({
            success: true,
            pagos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(total),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[Admin/Pagos] Error listando pagos:', error.message);
        console.error('[Admin/Pagos] Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo pagos',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Obtener detalle de un pago específico
 */
export async function obtener(req, res) {
    try {
        const { id } = req.params;

        const pago = await knex('pagos_manuales as p')
            .leftJoin('empresas as e', 'p.empresa_id', 'e.id')
            .leftJoin('users as u_reg', 'p.registrado_por', 'u_reg.id')
            .leftJoin('users as u_apr', 'p.aprobado_por', 'u_apr.id')
            .select(
                'p.*',
                'e.nombre_legal as empresa_nombre',
                'e.nit as empresa_nit',
                'e.email as empresa_email',
                'u_reg.full_name as registrado_por_nombre',
                'u_apr.full_name as aprobado_por_nombre'
            )
            .where('p.id', id)
            .first();

        if (!pago) {
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            });
        }

        res.json({
            success: true,
            pago
        });
    } catch (error) {
        console.error('Error obteniendo pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo pago'
        });
    }
}

/**
 * Registrar un nuevo pago manual
 */
export async function registrar(req, res) {
    try {
        const {
            empresa_id,
            monto,
            metodo_pago,
            referencia_pago,
            fecha_pago,
            notas,
            num_cargos,
            descripcion_servicio
        } = req.body;

        // Validaciones básicas
        if (!empresa_id || !monto || !metodo_pago) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: empresa_id, monto, metodo_pago'
            });
        }

        // Verificar que la empresa existe
        const empresa = await knex('empresas').where('id', empresa_id).first();
        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        // Subir evidencia si existe
        let evidencia_url = null;
        let evidencia_tipo = null;
        if (req.file) {
            const fileName = `pagos/${empresa_id}_${Date.now()}_${req.file.originalname}`;
            const uploadResult = await uploadToSpaces(req.file.buffer, fileName, req.file.mimetype);
            evidencia_url = uploadResult.url;
            evidencia_tipo = req.file.mimetype;
        }

        // Insertar pago
        const [pago] = await knex('pagos_manuales')
            .insert({
                empresa_id,
                monto: parseFloat(monto),
                metodo_pago,
                referencia_pago,
                fecha_pago: fecha_pago || null,
                notas,
                num_cargos: num_cargos ? parseInt(num_cargos) : null,
                descripcion_servicio,
                evidencia_url,
                evidencia_tipo,
                estado: 'pendiente',
                registrado_por: req.user.id
            })
            .returning('*');

        // Registrar en auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'registrar_pago_manual',
            recurso: 'pagos_manuales',
            recurso_id: pago.id,
            detalles: JSON.stringify({
                empresa_id,
                monto,
                metodo_pago,
                referencia_pago
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'Pago registrado exitosamente',
            pago
        });
    } catch (error) {
        console.error('Error registrando pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error registrando pago'
        });
    }
}

/**
 * Aprobar un pago pendiente
 */
export async function aprobar(req, res) {
    const trx = await knex.transaction();

    try {
        const { id } = req.params;
        const { notas } = req.body;

        // Obtener pago actual
        const pago = await trx('pagos_manuales').where('id', id).first();

        if (!pago) {
            await trx.rollback();
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            });
        }

        if (pago.estado !== 'pendiente') {
            await trx.rollback();
            return res.status(400).json({
                success: false,
                message: `No se puede aprobar un pago en estado '${pago.estado}'`
            });
        }

        // Actualizar pago
        const [pagoActualizado] = await trx('pagos_manuales')
            .where('id', id)
            .update({
                estado: 'aprobado',
                aprobado_por: req.user.id,
                fecha_aprobacion: knex.fn.now(),
                notas: notas ? `${pago.notas || ''}\n[Aprobación] ${notas}` : pago.notas,
                updated_at: knex.fn.now()
            })
            .returning('*');

        // Actualizar empresa: marcar último pago y activar
        await trx('empresas')
            .where('id', pago.empresa_id)
            .update({
                ultimo_pago: knex.fn.now(),
                status: 'activa',
                updated_at: knex.fn.now()
            });

        // Auditoría
        await trx('auditoria').insert({
            user_id: req.user.id,
            accion: 'aprobar_pago',
            recurso: 'pagos_manuales',
            recurso_id: id,
            valores_anteriores: JSON.stringify({ estado: pago.estado }),
            valores_nuevos: JSON.stringify({ estado: 'aprobado' }),
            detalles: JSON.stringify({
                monto: pago.monto,
                empresa_id: pago.empresa_id
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        await trx.commit();

        res.json({
            success: true,
            message: 'Pago aprobado exitosamente',
            pago: pagoActualizado
        });
    } catch (error) {
        await trx.rollback();
        console.error('Error aprobando pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error aprobando pago'
        });
    }
}

/**
 * Rechazar un pago pendiente
 */
export async function rechazar(req, res) {
    const trx = await knex.transaction();

    try {
        const { id } = req.params;
        const { motivo_rechazo } = req.body;

        if (!motivo_rechazo) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un motivo de rechazo'
            });
        }

        // Obtener pago actual
        const pago = await trx('pagos_manuales').where('id', id).first();

        if (!pago) {
            await trx.rollback();
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            });
        }

        if (pago.estado !== 'pendiente') {
            await trx.rollback();
            return res.status(400).json({
                success: false,
                message: `No se puede rechazar un pago en estado '${pago.estado}'`
            });
        }

        // Actualizar pago
        const [pagoActualizado] = await trx('pagos_manuales')
            .where('id', id)
            .update({
                estado: 'rechazado',
                aprobado_por: req.user.id, // Quien lo rechazó
                fecha_rechazo: knex.fn.now(),
                motivo_rechazo,
                updated_at: knex.fn.now()
            })
            .returning('*');

        // Auditoría
        await trx('auditoria').insert({
            user_id: req.user.id,
            accion: 'rechazar_pago',
            recurso: 'pagos_manuales',
            recurso_id: id,
            valores_anteriores: JSON.stringify({ estado: pago.estado }),
            valores_nuevos: JSON.stringify({ estado: 'rechazado', motivo_rechazo }),
            detalles: JSON.stringify({
                monto: pago.monto,
                empresa_id: pago.empresa_id,
                motivo_rechazo
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        await trx.commit();

        res.json({
            success: true,
            message: 'Pago rechazado',
            pago: pagoActualizado
        });
    } catch (error) {
        await trx.rollback();
        console.error('Error rechazando pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error rechazando pago'
        });
    }
}

/**
 * Obtener estadísticas de pagos
 */
export async function estadisticas(req, res) {
    try {
        const { mes, anio } = req.query;

        // Mes actual si no se especifica
        const fechaInicio = mes && anio
            ? new Date(anio, mes - 1, 1)
            : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const fechaFin = new Date(fechaInicio);
        fechaFin.setMonth(fechaFin.getMonth() + 1);

        // Total recaudado (aprobados)
        const totalRecaudado = await knex('pagos_manuales')
            .where('estado', 'aprobado')
            .whereBetween('fecha_aprobacion', [fechaInicio, fechaFin])
            .sum('monto as total')
            .first();

        // Conteos por estado
        const conteoPorEstado = await knex('pagos_manuales')
            .whereBetween('created_at', [fechaInicio, fechaFin])
            .select('estado')
            .count('* as cantidad')
            .groupBy('estado');

        // Convertir a objeto
        const estadosObj = {};
        conteoPorEstado.forEach(e => {
            estadosObj[e.estado] = parseInt(e.cantidad);
        });

        // Total del mes
        const totalMes = (estadosObj.pendiente || 0) +
            (estadosObj.aprobado || 0) +
            (estadosObj.rechazado || 0);

        // Tasa de aprobación
        const tasaAprobacion = totalMes > 0
            ? Math.round(((estadosObj.aprobado || 0) / totalMes) * 100)
            : 0;

        res.json({
            success: true,
            estadisticas: {
                periodo: {
                    inicio: fechaInicio,
                    fin: fechaFin
                },
                total_recaudado: parseFloat(totalRecaudado?.total || 0),
                pagos_pendientes: estadosObj.pendiente || 0,
                pagos_aprobados: estadosObj.aprobado || 0,
                pagos_rechazados: estadosObj.rechazado || 0,
                total_pagos: totalMes,
                tasa_aprobacion: tasaAprobacion
            }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas'
        });
    }
}
