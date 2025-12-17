/**
 * Controller: Empresas asignadas al Médico
 * El médico puede ver solo las empresas a las que está asignado
 */

import knex from '../../config/database.js';

/**
 * Obtener lista de empresas asignadas al médico actual
 */
export async function misEmpresas(req, res) {
    try {
        const medicoId = req.user.id;

        const empresas = await knex('medicos_empresas as me')
            .join('empresas as e', 'me.empresa_id', 'e.id')
            .where('me.medico_id', medicoId)
            .where('me.activo', true)
            .select(
                'me.id as asignacion_id',
                'me.fecha_asignacion',
                'me.es_medico_principal',
                'e.id as empresa_id',
                'e.nombre_legal',
                'e.nit',
                'e.email',
                'e.telefono',
                'e.ciudad',
                'e.sector_economico',
                'e.status',
                'e.responsable_sst_nombre',
                'e.responsable_sst_email'
            )
            .orderBy('e.nombre_legal', 'asc');

        // Agregar conteo de cargos por empresa
        for (const empresa of empresas) {
            const conteo = await knex('cargos_documento as cd')
                .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
                .where('dg.empresa_id', empresa.empresa_id)
                .count('* as total')
                .first();
            empresa.total_cargos = parseInt(conteo?.total || 0);
        }

        res.json({
            success: true,
            empresas
        });
    } catch (error) {
        console.error('Error obteniendo empresas del médico:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo empresas'
        });
    }
}

/**
 * Obtener detalle de una empresa asignada
 * Requiere middleware requireMedicoAccess
 */
export async function detalleEmpresa(req, res) {
    try {
        const { empresaId } = req.params;

        const empresa = await knex('empresas')
            .where('id', empresaId)
            .first();

        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        // Conteos
        const conteos = await Promise.all([
            knex('cargos_documento as cd')
                .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
                .where('dg.empresa_id', empresaId)
                .count('* as total')
                .first(),
            knex('documentos_generados').where('empresa_id', empresaId).count('* as total').first()
        ]);

        res.json({
            success: true,
            empresa: {
                ...empresa,
                total_cargos: parseInt(conteos[0]?.total || 0),
                total_documentos: parseInt(conteos[1]?.total || 0)
            }
        });
    } catch (error) {
        console.error('Error obteniendo detalle de empresa:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo empresa'
        });
    }
}

/**
 * Obtener cargos de una empresa asignada
 * Requiere middleware requireMedicoAccess
 */
export async function cargosPorEmpresa(req, res) {
    try {
        const { empresaId } = req.params;

        const cargos = await knex('cargos_documento as cd')
            .join('documentos_generados as dg', 'cd.documento_id', 'dg.id')
            .where('dg.empresa_id', empresaId)
            .select(
                'cd.id',
                'cd.nombre_cargo',
                'cd.area',
                'cd.zona',
                'cd.num_trabajadores',
                'cd.tareas_rutinarias',
                'cd.trabaja_alturas',
                'cd.manipula_alimentos',
                'cd.trabaja_espacios_confinados',
                'cd.created_at'
            )
            .orderBy('cd.area', 'asc')
            .orderBy('cd.nombre_cargo', 'asc');

        // Agregar conteo de riesgos por cargo
        for (const cargo of cargos) {
            const conteo = await knex('riesgos_cargo')
                .where('cargo_id', cargo.id)
                .count('* as total')
                .first();
            cargo.total_riesgos = parseInt(conteo?.total || 0);
        }

        res.json({
            success: true,
            cargos
        });
    } catch (error) {
        console.error('Error obteniendo cargos:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo cargos'
        });
    }
}
