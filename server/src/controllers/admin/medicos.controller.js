/**
 * Controller: Gestión de Médicos Ocupacionales
 * Admin puede crear médicos, asignarlos a empresas y gestionar asignaciones
 */

import knex from '../../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Listar todos los médicos ocupacionales
 */
export async function listar(req, res) {
    try {
        const { activo, busqueda } = req.query;

        let query = knex('users as u')
            .join('roles as r', 'u.rol_id', 'r.id')
            .where('r.nombre', 'medico_ocupacional')
            .select(
                'u.id',
                'u.full_name',
                'u.email',
                'u.phone',
                'u.licencia_sst',
                'u.fecha_vencimiento_licencia',
                'u.especialidad',
                'u.firma_url',
                'u.created_at'
            );

        // Filtro de búsqueda
        if (busqueda) {
            query = query.where(function () {
                this.where('u.full_name', 'ilike', `%${busqueda}%`)
                    .orWhere('u.email', 'ilike', `%${busqueda}%`)
                    .orWhere('u.licencia_sst', 'ilike', `%${busqueda}%`);
            });
        }

        const medicos = await query.orderBy('u.full_name', 'asc');

        // Agregar conteo de empresas asignadas a cada médico
        for (const medico of medicos) {
            const conteo = await knex('medicos_empresas')
                .where({ medico_id: medico.id, activo: true })
                .count('* as total')
                .first();
            medico.empresas_asignadas = parseInt(conteo?.total || 0);
        }

        res.json({
            success: true,
            medicos
        });
    } catch (error) {
        console.error('Error listando médicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo médicos'
        });
    }
}

/**
 * Obtener detalle de un médico específico
 */
export async function obtener(req, res) {
    try {
        const { id } = req.params;

        const medico = await knex('users as u')
            .join('roles as r', 'u.rol_id', 'r.id')
            .where('u.id', id)
            .where('r.nombre', 'medico_ocupacional')
            .select(
                'u.id',
                'u.full_name',
                'u.email',
                'u.phone',
                'u.licencia_sst',
                'u.fecha_vencimiento_licencia',
                'u.especialidad',
                'u.firma_url',
                'u.firma_metadatos',
                'u.created_at',
                'u.updated_at'
            )
            .first();

        if (!medico) {
            return res.status(404).json({
                success: false,
                message: 'Médico no encontrado'
            });
        }

        // Obtener empresas asignadas
        const empresasAsignadas = await knex('medicos_empresas as me')
            .join('empresas as e', 'me.empresa_id', 'e.id')
            .where('me.medico_id', id)
            .where('me.activo', true)
            .select(
                'me.id as asignacion_id',
                'me.fecha_asignacion',
                'me.es_medico_principal',
                'e.id as empresa_id',
                'e.nombre_legal',
                'e.nit',
                'e.ciudad'
            );

        res.json({
            success: true,
            medico: {
                ...medico,
                empresas_asignadas: empresasAsignadas
            }
        });
    } catch (error) {
        console.error('Error obteniendo médico:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo médico'
        });
    }
}

/**
 * Crear un nuevo médico ocupacional
 */
export async function crear(req, res) {
    const trx = await knex.transaction();

    try {
        const {
            full_name,
            email,
            password,
            phone,
            licencia_sst,
            fecha_vencimiento_licencia,
            especialidad
        } = req.body;

        // Validaciones
        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: full_name, email, password'
            });
        }

        // Verificar email único
        const existente = await trx('users').where('email', email).first();
        if (existente) {
            await trx.rollback();
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con ese email'
            });
        }

        // Obtener rol médico
        const rolMedico = await trx('roles').where('nombre', 'medico_ocupacional').first();
        if (!rolMedico) {
            await trx.rollback();
            return res.status(500).json({
                success: false,
                message: 'Rol médico_ocupacional no encontrado. Ejecute las migraciones.'
            });
        }

        // Hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insertar médico
        const [medico] = await trx('users')
            .insert({
                full_name,
                email,
                password_hash,
                phone,
                licencia_sst,
                fecha_vencimiento_licencia: fecha_vencimiento_licencia || null,
                especialidad,
                rol_id: rolMedico.id,
                company_name: 'Genesys Laboral Medicine'
            })
            .returning(['id', 'full_name', 'email', 'licencia_sst', 'especialidad', 'created_at']);

        // Auditoría
        await trx('auditoria').insert({
            user_id: req.user.id,
            accion: 'crear_medico',
            recurso: 'users',
            recurso_id: medico.id,
            detalles: JSON.stringify({ email, licencia_sst }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        await trx.commit();

        res.status(201).json({
            success: true,
            message: 'Médico creado exitosamente',
            medico
        });
    } catch (error) {
        await trx.rollback();
        console.error('Error creando médico:', error);
        res.status(500).json({
            success: false,
            message: 'Error creando médico'
        });
    }
}

/**
 * Actualizar datos de un médico
 */
export async function actualizar(req, res) {
    try {
        const { id } = req.params;
        const {
            full_name,
            phone,
            licencia_sst,
            fecha_vencimiento_licencia,
            especialidad
        } = req.body;

        // Verificar que existe
        const medico = await knex('users as u')
            .join('roles as r', 'u.rol_id', 'r.id')
            .where('u.id', id)
            .where('r.nombre', 'medico_ocupacional')
            .first();

        if (!medico) {
            return res.status(404).json({
                success: false,
                message: 'Médico no encontrado'
            });
        }

        // Actualizar
        const [medicoActualizado] = await knex('users')
            .where('id', id)
            .update({
                full_name: full_name || medico.full_name,
                phone: phone !== undefined ? phone : medico.phone,
                licencia_sst: licencia_sst !== undefined ? licencia_sst : medico.licencia_sst,
                fecha_vencimiento_licencia: fecha_vencimiento_licencia !== undefined
                    ? fecha_vencimiento_licencia
                    : medico.fecha_vencimiento_licencia,
                especialidad: especialidad !== undefined ? especialidad : medico.especialidad,
                updated_at: knex.fn.now()
            })
            .returning(['id', 'full_name', 'email', 'licencia_sst', 'especialidad']);

        // Auditoría
        await knex('auditoria').insert({
            user_id: req.user.id,
            accion: 'actualizar_medico',
            recurso: 'users',
            recurso_id: id,
            detalles: JSON.stringify(req.body),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Médico actualizado',
            medico: medicoActualizado
        });
    } catch (error) {
        console.error('Error actualizando médico:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando médico'
        });
    }
}

/**
 * Obtener empresas asignadas a un médico
 */
export async function empresasAsignadas(req, res) {
    try {
        const { id } = req.params;
        const { activo = true } = req.query;

        const empresas = await knex('medicos_empresas as me')
            .join('empresas as e', 'me.empresa_id', 'e.id')
            .leftJoin('users as u', 'me.asignado_por', 'u.id')
            .where('me.medico_id', id)
            .where('me.activo', activo === 'true' || activo === true)
            .select(
                'me.id as asignacion_id',
                'me.fecha_asignacion',
                'me.fecha_fin',
                'me.es_medico_principal',
                'me.notas',
                'me.activo',
                'e.id as empresa_id',
                'e.nombre_legal',
                'e.nit',
                'e.ciudad',
                'e.status',
                'u.full_name as asignado_por_nombre'
            )
            .orderBy('me.fecha_asignacion', 'desc');

        res.json({
            success: true,
            empresas
        });
    } catch (error) {
        console.error('Error obteniendo empresas asignadas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo empresas'
        });
    }
}

/**
 * Asignar múltiples empresas a un médico (reemplaza asignaciones existentes)
 */
export async function asignarEmpresas(req, res) {
    const trx = await knex.transaction();

    try {
        const { id } = req.params;
        const { empresas = [] } = req.body;

        // Verificar que el médico existe y es médico
        const medico = await trx('users as u')
            .join('roles as r', 'u.rol_id', 'r.id')
            .where('u.id', id)
            .where('r.nombre', 'medico_ocupacional')
            .first();

        if (!medico) {
            await trx.rollback();
            return res.status(404).json({
                success: false,
                message: 'Médico no encontrado'
            });
        }

        // Desactivar todas las asignaciones existentes del médico
        await trx('medicos_empresas')
            .where({ medico_id: id })
            .update({ activo: false, fecha_fin: knex.fn.now() });

        let asignacionesCreadas = 0;

        // Crear nuevas asignaciones para las empresas seleccionadas
        for (const empresaId of empresas) {
            // Verificar que la empresa existe
            const empresa = await trx('empresas').where('id', empresaId).first();
            if (!empresa) {
                console.warn(`Empresa ${empresaId} no encontrada, saltando...`);
                continue;
            }

            // Insertar o reactivar asignación existente
            await trx.raw(`
                INSERT INTO medicos_empresas (medico_id, empresa_id, asignado_por, es_medico_principal, activo, fecha_asignacion)
                VALUES (?, ?, ?, ?, ?, NOW())
                ON CONFLICT (medico_id, empresa_id)
                DO UPDATE SET
                    activo = true,
                    fecha_asignacion = NOW(),
                    fecha_fin = NULL,
                    asignado_por = EXCLUDED.asignado_por
            `, [id, empresaId, req.user.id, false, true]);

            asignacionesCreadas++;
        }

        // Auditoría
        await trx('auditoria').insert({
            user_id: req.user.id,
            accion: 'asignar_empresas_medico',
            recurso: 'medicos_empresas',
            recurso_id: id,
            detalles: JSON.stringify({
                medico_id: id,
                empresas_ids: empresas,
                total_asignadas: asignacionesCreadas
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        await trx.commit();

        res.json({
            success: true,
            message: `${asignacionesCreadas} empresa(s) asignada(s) exitosamente`,
            total: asignacionesCreadas
        });
    } catch (error) {
        await trx.rollback();
        console.error('Error asignando empresas:', error);
        res.status(500).json({
            success: false,
            message: 'Error asignando empresas'
        });
    }
}

/**
 * Asignar un médico a una empresa
 */
export async function asignarEmpresa(req, res) {
    const trx = await knex.transaction();

    try {
        const { medicoId, empresaId } = req.params;
        const { es_medico_principal = false, notas } = req.body;

        // Verificar que el médico existe y es médico
        const medico = await trx('users as u')
            .join('roles as r', 'u.rol_id', 'r.id')
            .where('u.id', medicoId)
            .where('r.nombre', 'medico_ocupacional')
            .first();

        if (!medico) {
            await trx.rollback();
            return res.status(404).json({
                success: false,
                message: 'Médico no encontrado'
            });
        }

        // Verificar que la empresa existe
        const empresa = await trx('empresas').where('id', empresaId).first();
        if (!empresa) {
            await trx.rollback();
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        // Verificar si ya existe asignación activa
        const asignacionExistente = await trx('medicos_empresas')
            .where({ medico_id: medicoId, empresa_id: empresaId, activo: true })
            .first();

        if (asignacionExistente) {
            await trx.rollback();
            return res.status(400).json({
                success: false,
                message: 'El médico ya está asignado a esta empresa'
            });
        }

        // Si es médico principal, quitar el flag a otros médicos de esta empresa
        if (es_medico_principal) {
            await trx('medicos_empresas')
                .where({ empresa_id: empresaId, es_medico_principal: true })
                .update({ es_medico_principal: false });
        }

        // Crear asignación
        const [asignacion] = await trx('medicos_empresas')
            .insert({
                medico_id: medicoId,
                empresa_id: empresaId,
                asignado_por: req.user.id,
                es_medico_principal,
                notas,
                activo: true
            })
            .returning('*');

        // Auditoría
        await trx('auditoria').insert({
            user_id: req.user.id,
            accion: 'asignar_medico_empresa',
            recurso: 'medicos_empresas',
            recurso_id: asignacion.id,
            detalles: JSON.stringify({
                medico_id: medicoId,
                empresa_id: empresaId,
                es_medico_principal
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        await trx.commit();

        res.status(201).json({
            success: true,
            message: 'Médico asignado exitosamente',
            asignacion
        });
    } catch (error) {
        await trx.rollback();
        console.error('Error asignando médico:', error);
        res.status(500).json({
            success: false,
            message: 'Error asignando médico'
        });
    }
}

/**
 * Desasignar un médico de una empresa (soft delete)
 */
export async function desasignarEmpresa(req, res) {
    const trx = await knex.transaction();

    try {
        const { medicoId, empresaId } = req.params;

        // Buscar asignación activa
        const asignacion = await trx('medicos_empresas')
            .where({ medico_id: medicoId, empresa_id: empresaId, activo: true })
            .first();

        if (!asignacion) {
            await trx.rollback();
            return res.status(404).json({
                success: false,
                message: 'Asignación no encontrada'
            });
        }

        // Desactivar asignación
        await trx('medicos_empresas')
            .where('id', asignacion.id)
            .update({
                activo: false,
                fecha_fin: knex.fn.now(),
                updated_at: knex.fn.now()
            });

        // Auditoría
        await trx('auditoria').insert({
            user_id: req.user.id,
            accion: 'desasignar_medico_empresa',
            recurso: 'medicos_empresas',
            recurso_id: asignacion.id,
            detalles: JSON.stringify({
                medico_id: medicoId,
                empresa_id: empresaId
            }),
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        await trx.commit();

        res.json({
            success: true,
            message: 'Médico desasignado de la empresa'
        });
    } catch (error) {
        await trx.rollback();
        console.error('Error desasignando médico:', error);
        res.status(500).json({
            success: false,
            message: 'Error desasignando médico'
        });
    }
}
