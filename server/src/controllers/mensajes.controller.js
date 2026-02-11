/**
 * Controller: Mensajes Médico-Empresa
 *
 * Sistema de mensajería asíncrona entre médicos ocupacionales y empresas.
 * Permite comunicación tipo correo sobre temas generales o cargos específicos.
 *
 * Sprint 7 - Sistema de Mensajería
 */

import knex from '../config/database.js';

// ============================================
// CONVERSACIONES - MÉDICO
// ============================================

/**
 * Listar conversaciones del médico
 * GET /api/medico/conversaciones
 */
export async function listarConversacionesMedico(req, res) {
    try {
        const medicoId = req.user.id;
        const { estado, empresa_id, page = 1, limit = 20 } = req.query;

        let query = knex('conversaciones_medico_empresa as c')
            .join('empresas as e', 'c.empresa_id', 'e.id')
            .leftJoin('cargos_documento as cd', 'c.cargo_id', 'cd.id')
            .where('c.medico_id', medicoId)
            .select(
                'c.id',
                'c.asunto',
                'c.estado',
                'c.iniciada_por',
                'c.total_mensajes',
                'c.mensajes_no_leidos_medico as no_leidos',
                'c.ultimo_mensaje_at',
                'c.created_at',
                'e.id as empresa_id',
                'e.nombre_legal as empresa_nombre',
                'e.nit as empresa_nit',
                'cd.id as cargo_id',
                'cd.nombre_cargo'
            )
            .orderBy('c.ultimo_mensaje_at', 'desc');

        // Filtros opcionales
        if (estado) {
            query = query.where('c.estado', estado);
        }
        if (empresa_id) {
            query = query.where('c.empresa_id', empresa_id);
        }

        // Paginación
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const conversaciones = await query.limit(parseInt(limit)).offset(offset);

        // Contar total para paginación
        const [{ count: total }] = await knex('conversaciones_medico_empresa')
            .where('medico_id', medicoId)
            .count();

        // Contar total no leídos
        const [{ total_no_leidos }] = await knex('conversaciones_medico_empresa')
            .where('medico_id', medicoId)
            .sum('mensajes_no_leidos_medico as total_no_leidos');

        res.json({
            success: true,
            conversaciones,
            total_no_leidos: parseInt(total_no_leidos) || 0,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(total),
                pages: Math.ceil(parseInt(total) / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error listando conversaciones médico:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar conversaciones'
        });
    }
}

/**
 * Crear nueva conversación (médico inicia)
 * POST /api/medico/conversaciones
 */
export async function crearConversacionMedico(req, res) {
    try {
        const medicoId = req.user.id;
        const { empresa_id, cargo_id, asunto, mensaje_inicial } = req.body;

        // Validaciones
        if (!empresa_id || !asunto || !mensaje_inicial) {
            return res.status(400).json({
                success: false,
                message: 'empresa_id, asunto y mensaje_inicial son requeridos'
            });
        }

        if (asunto.length > 255) {
            return res.status(400).json({
                success: false,
                message: 'El asunto no puede exceder 255 caracteres'
            });
        }

        // Verificar que el médico está asignado a la empresa
        const asignacion = await knex('medicos_empresas')
            .where({
                medico_id: medicoId,
                empresa_id: empresa_id,
                activo: true
            })
            .first();

        if (!asignacion) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para contactar esta empresa'
            });
        }

        // Si se especifica cargo_id, verificar que pertenece a la empresa
        if (cargo_id) {
            const cargo = await knex('cargos_documento as cd')
                .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
                .where('cd.id', cargo_id)
                .where('dg.empresa_id', empresa_id)
                .first();

            if (!cargo) {
                return res.status(400).json({
                    success: false,
                    message: 'El cargo especificado no pertenece a esta empresa'
                });
            }
        }

        // Crear conversación
        const [conversacion] = await knex('conversaciones_medico_empresa')
            .insert({
                medico_id: medicoId,
                empresa_id: empresa_id,
                cargo_id: cargo_id || null,
                asunto: asunto.trim(),
                estado: 'abierta',
                iniciada_por: 'medico',
                total_mensajes: 1,
                mensajes_no_leidos_empresa: 1,
                ultimo_mensaje_at: knex.fn.now()
            })
            .returning('*');

        // Crear mensaje inicial
        await knex('mensajes_conversacion').insert({
            conversacion_id: conversacion.id,
            remitente_id: medicoId,
            remitente_tipo: 'medico',
            contenido: mensaje_inicial.trim(),
            leido: false
        });

        // Auditoría
        await knex('auditoria').insert({
            user_id: medicoId,
            accion: 'crear_conversacion',
            recurso: 'conversaciones_medico_empresa',
            recurso_id: conversacion.id,
            detalles: JSON.stringify({
                empresa_id,
                cargo_id,
                asunto: asunto.trim()
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.status(201).json({
            success: true,
            message: 'Conversación creada exitosamente',
            conversacion: {
                id: conversacion.id,
                asunto: conversacion.asunto,
                estado: conversacion.estado
            }
        });

    } catch (error) {
        console.error('Error creando conversación:', error);

        // Manejar error de duplicado
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una conversación con este asunto para esta empresa/cargo'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear conversación'
        });
    }
}

/**
 * Obtener mensajes de una conversación (médico)
 * GET /api/medico/conversaciones/:id/mensajes
 */
export async function obtenerMensajesMedico(req, res) {
    try {
        const medicoId = req.user.id;
        const { id: conversacionId } = req.params;

        // Verificar acceso a la conversación
        const conversacion = await knex('conversaciones_medico_empresa as c')
            .join('empresas as e', 'c.empresa_id', 'e.id')
            .leftJoin('cargos_documento as cd', 'c.cargo_id', 'cd.id')
            .where('c.id', conversacionId)
            .where('c.medico_id', medicoId)
            .select(
                'c.*',
                'e.nombre_legal as empresa_nombre',
                'e.nit as empresa_nit',
                'cd.nombre_cargo'
            )
            .first();

        if (!conversacion) {
            return res.status(404).json({
                success: false,
                message: 'Conversación no encontrada'
            });
        }

        // Obtener mensajes
        const mensajes = await knex('mensajes_conversacion as m')
            .join('users as u', 'm.remitente_id', 'u.id')
            .where('m.conversacion_id', conversacionId)
            .select(
                'm.id',
                'm.contenido',
                'm.remitente_tipo',
                'm.leido',
                'm.leido_at',
                'm.created_at',
                'u.full_name as remitente_nombre',
                'u.email as remitente_email'
            )
            .orderBy('m.created_at', 'asc');

        // Marcar mensajes de empresa como leídos
        const noLeidosIds = mensajes
            .filter(m => m.remitente_tipo === 'empresa' && !m.leido)
            .map(m => m.id);

        if (noLeidosIds.length > 0) {
            await knex('mensajes_conversacion')
                .whereIn('id', noLeidosIds)
                .update({
                    leido: true,
                    leido_at: knex.fn.now()
                });

            // Actualizar contador en conversación
            await knex('conversaciones_medico_empresa')
                .where('id', conversacionId)
                .update({
                    mensajes_no_leidos_medico: 0
                });
        }

        res.json({
            success: true,
            conversacion: {
                id: conversacion.id,
                asunto: conversacion.asunto,
                estado: conversacion.estado,
                iniciada_por: conversacion.iniciada_por,
                empresa: {
                    id: conversacion.empresa_id,
                    nombre: conversacion.empresa_nombre,
                    nit: conversacion.empresa_nit
                },
                cargo: conversacion.cargo_id ? {
                    id: conversacion.cargo_id,
                    nombre: conversacion.nombre_cargo
                } : null,
                created_at: conversacion.created_at
            },
            mensajes: mensajes.map(m => ({
                id: m.id,
                contenido: m.contenido,
                remitente: {
                    tipo: m.remitente_tipo,
                    nombre: m.remitente_nombre,
                    es_propio: m.remitente_tipo === 'medico'
                },
                leido: m.leido,
                fecha: m.created_at
            }))
        });

    } catch (error) {
        console.error('Error obteniendo mensajes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensajes'
        });
    }
}

/**
 * Enviar mensaje en una conversación (médico)
 * POST /api/medico/conversaciones/:id/mensajes
 */
export async function enviarMensajeMedico(req, res) {
    try {
        const medicoId = req.user.id;
        const { id: conversacionId } = req.params;
        const { contenido } = req.body;

        if (!contenido || contenido.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El contenido del mensaje es requerido'
            });
        }

        // Verificar acceso y estado de la conversación
        const conversacion = await knex('conversaciones_medico_empresa')
            .where('id', conversacionId)
            .where('medico_id', medicoId)
            .first();

        if (!conversacion) {
            return res.status(404).json({
                success: false,
                message: 'Conversación no encontrada'
            });
        }

        if (conversacion.estado === 'cerrada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden enviar mensajes a una conversación cerrada'
            });
        }

        // Crear mensaje
        const [mensaje] = await knex('mensajes_conversacion')
            .insert({
                conversacion_id: conversacionId,
                remitente_id: medicoId,
                remitente_tipo: 'medico',
                contenido: contenido.trim(),
                leido: false
            })
            .returning('*');

        // Actualizar contadores de la conversación
        await knex('conversaciones_medico_empresa')
            .where('id', conversacionId)
            .update({
                total_mensajes: knex.raw('total_mensajes + 1'),
                mensajes_no_leidos_empresa: knex.raw('mensajes_no_leidos_empresa + 1'),
                ultimo_mensaje_at: knex.fn.now(),
                updated_at: knex.fn.now()
            });

        res.status(201).json({
            success: true,
            message: 'Mensaje enviado exitosamente',
            mensaje: {
                id: mensaje.id,
                contenido: mensaje.contenido,
                fecha: mensaje.created_at
            }
        });

    } catch (error) {
        console.error('Error enviando mensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar mensaje'
        });
    }
}

/**
 * Cerrar conversación (médico)
 * PUT /api/medico/conversaciones/:id/cerrar
 */
export async function cerrarConversacionMedico(req, res) {
    try {
        const medicoId = req.user.id;
        const { id: conversacionId } = req.params;

        const conversacion = await knex('conversaciones_medico_empresa')
            .where('id', conversacionId)
            .where('medico_id', medicoId)
            .first();

        if (!conversacion) {
            return res.status(404).json({
                success: false,
                message: 'Conversación no encontrada'
            });
        }

        await knex('conversaciones_medico_empresa')
            .where('id', conversacionId)
            .update({
                estado: 'cerrada',
                updated_at: knex.fn.now()
            });

        res.json({
            success: true,
            message: 'Conversación cerrada'
        });

    } catch (error) {
        console.error('Error cerrando conversación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cerrar conversación'
        });
    }
}

// ============================================
// CONVERSACIONES - EMPRESA
// ============================================

/**
 * Listar conversaciones de la empresa
 * GET /api/empresa/conversaciones
 */
export async function listarConversacionesEmpresa(req, res) {
    try {
        const empresaId = req.user.empresa_id;

        if (!empresaId) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no asociado a una empresa'
            });
        }

        const { estado, page = 1, limit = 20 } = req.query;

        let query = knex('conversaciones_medico_empresa as c')
            .join('users as u', 'c.medico_id', 'u.id')
            .leftJoin('cargos_documento as cd', 'c.cargo_id', 'cd.id')
            .where('c.empresa_id', empresaId)
            .select(
                'c.id',
                'c.asunto',
                'c.estado',
                'c.iniciada_por',
                'c.total_mensajes',
                'c.mensajes_no_leidos_empresa as no_leidos',
                'c.ultimo_mensaje_at',
                'c.created_at',
                'u.id as medico_id',
                'u.full_name as medico_nombre',
                'u.licencia_sst as medico_licencia',
                'cd.id as cargo_id',
                'cd.nombre_cargo'
            )
            .orderBy('c.ultimo_mensaje_at', 'desc');

        if (estado) {
            query = query.where('c.estado', estado);
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const conversaciones = await query.limit(parseInt(limit)).offset(offset);

        const [{ count: total }] = await knex('conversaciones_medico_empresa')
            .where('empresa_id', empresaId)
            .count();

        const [{ total_no_leidos }] = await knex('conversaciones_medico_empresa')
            .where('empresa_id', empresaId)
            .sum('mensajes_no_leidos_empresa as total_no_leidos');

        res.json({
            success: true,
            conversaciones,
            total_no_leidos: parseInt(total_no_leidos) || 0,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: parseInt(total),
                pages: Math.ceil(parseInt(total) / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error listando conversaciones empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar conversaciones'
        });
    }
}

/**
 * Obtener mensajes de una conversación (empresa)
 * GET /api/empresa/conversaciones/:id/mensajes
 */
export async function obtenerMensajesEmpresa(req, res) {
    try {
        const empresaId = req.user.empresa_id;
        const { id: conversacionId } = req.params;

        if (!empresaId) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no asociado a una empresa'
            });
        }

        // Verificar acceso
        const conversacion = await knex('conversaciones_medico_empresa as c')
            .join('users as u', 'c.medico_id', 'u.id')
            .leftJoin('cargos_documento as cd', 'c.cargo_id', 'cd.id')
            .where('c.id', conversacionId)
            .where('c.empresa_id', empresaId)
            .select(
                'c.*',
                'u.full_name as medico_nombre',
                'u.licencia_sst as medico_licencia',
                'cd.nombre_cargo'
            )
            .first();

        if (!conversacion) {
            return res.status(404).json({
                success: false,
                message: 'Conversación no encontrada'
            });
        }

        // Obtener mensajes
        const mensajes = await knex('mensajes_conversacion as m')
            .join('users as u', 'm.remitente_id', 'u.id')
            .where('m.conversacion_id', conversacionId)
            .select(
                'm.id',
                'm.contenido',
                'm.remitente_tipo',
                'm.leido',
                'm.leido_at',
                'm.created_at',
                'u.full_name as remitente_nombre'
            )
            .orderBy('m.created_at', 'asc');

        // Marcar mensajes de médico como leídos
        const noLeidosIds = mensajes
            .filter(m => m.remitente_tipo === 'medico' && !m.leido)
            .map(m => m.id);

        if (noLeidosIds.length > 0) {
            await knex('mensajes_conversacion')
                .whereIn('id', noLeidosIds)
                .update({
                    leido: true,
                    leido_at: knex.fn.now()
                });

            await knex('conversaciones_medico_empresa')
                .where('id', conversacionId)
                .update({
                    mensajes_no_leidos_empresa: 0
                });
        }

        res.json({
            success: true,
            conversacion: {
                id: conversacion.id,
                asunto: conversacion.asunto,
                estado: conversacion.estado,
                iniciada_por: conversacion.iniciada_por,
                medico: {
                    id: conversacion.medico_id,
                    nombre: conversacion.medico_nombre,
                    licencia: conversacion.medico_licencia
                },
                cargo: conversacion.cargo_id ? {
                    id: conversacion.cargo_id,
                    nombre: conversacion.nombre_cargo
                } : null,
                created_at: conversacion.created_at
            },
            mensajes: mensajes.map(m => ({
                id: m.id,
                contenido: m.contenido,
                remitente: {
                    tipo: m.remitente_tipo,
                    nombre: m.remitente_nombre,
                    es_propio: m.remitente_tipo === 'empresa'
                },
                leido: m.leido,
                fecha: m.created_at
            }))
        });

    } catch (error) {
        console.error('Error obteniendo mensajes empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensajes'
        });
    }
}

/**
 * Enviar mensaje en una conversación (empresa)
 * POST /api/empresa/conversaciones/:id/mensajes
 */
export async function enviarMensajeEmpresa(req, res) {
    try {
        const empresaId = req.user.empresa_id;
        const userId = req.user.id;
        const { id: conversacionId } = req.params;
        const { contenido } = req.body;

        if (!empresaId) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no asociado a una empresa'
            });
        }

        if (!contenido || contenido.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El contenido del mensaje es requerido'
            });
        }

        // Verificar acceso y estado
        const conversacion = await knex('conversaciones_medico_empresa')
            .where('id', conversacionId)
            .where('empresa_id', empresaId)
            .first();

        if (!conversacion) {
            return res.status(404).json({
                success: false,
                message: 'Conversación no encontrada'
            });
        }

        if (conversacion.estado === 'cerrada') {
            return res.status(400).json({
                success: false,
                message: 'No se pueden enviar mensajes a una conversación cerrada'
            });
        }

        // Crear mensaje
        const [mensaje] = await knex('mensajes_conversacion')
            .insert({
                conversacion_id: conversacionId,
                remitente_id: userId,
                remitente_tipo: 'empresa',
                contenido: contenido.trim(),
                leido: false
            })
            .returning('*');

        // Actualizar contadores
        await knex('conversaciones_medico_empresa')
            .where('id', conversacionId)
            .update({
                total_mensajes: knex.raw('total_mensajes + 1'),
                mensajes_no_leidos_medico: knex.raw('mensajes_no_leidos_medico + 1'),
                ultimo_mensaje_at: knex.fn.now(),
                updated_at: knex.fn.now()
            });

        res.status(201).json({
            success: true,
            message: 'Mensaje enviado exitosamente',
            mensaje: {
                id: mensaje.id,
                contenido: mensaje.contenido,
                fecha: mensaje.created_at
            }
        });

    } catch (error) {
        console.error('Error enviando mensaje empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar mensaje'
        });
    }
}

/**
 * Obtener contador de mensajes no leídos (empresa)
 * GET /api/empresa/mensajes/no-leidos
 */
export async function contadorNoLeidosEmpresa(req, res) {
    try {
        const empresaId = req.user.empresa_id;

        if (!empresaId) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no asociado a una empresa'
            });
        }

        const [{ total }] = await knex('conversaciones_medico_empresa')
            .where('empresa_id', empresaId)
            .sum('mensajes_no_leidos_empresa as total');

        res.json({
            success: true,
            no_leidos: parseInt(total) || 0
        });

    } catch (error) {
        console.error('Error obteniendo contador:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener contador'
        });
    }
}

/**
 * Obtener contador de mensajes no leídos (médico)
 * GET /api/medico/mensajes/no-leidos
 */
export async function contadorNoLeidosMedico(req, res) {
    try {
        const medicoId = req.user.id;

        const [{ total }] = await knex('conversaciones_medico_empresa')
            .where('medico_id', medicoId)
            .sum('mensajes_no_leidos_medico as total');

        res.json({
            success: true,
            no_leidos: parseInt(total) || 0
        });

    } catch (error) {
        console.error('Error obteniendo contador:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener contador'
        });
    }
}
