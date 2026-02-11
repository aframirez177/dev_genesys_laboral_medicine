/**
 * Migración: Agregar campos de aprobación médica a cargos_documento
 *
 * Permite al médico ocupacional marcar cargos como "documentación revisada y aprobada"
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Verificar si las columnas ya existen
    const hasAprobado = await knex.schema.hasColumn('cargos_documento', 'aprobado_medico');

    if (!hasAprobado) {
        await knex.schema.alterTable('cargos_documento', (table) => {
            // Estado de aprobación del cargo por parte del médico
            table.boolean('aprobado_medico').defaultTo(false)
                .comment('Indica si el médico ha aprobado la documentación de este cargo');

            // Fecha en que se aprobó
            table.timestamp('fecha_aprobacion').nullable()
                .comment('Fecha y hora en que el médico aprobó el cargo');

            // ID del médico que aprobó (FK a users)
            table.integer('aprobado_por_medico_id').unsigned().nullable()
                .references('id').inTable('users').onDelete('SET NULL')
                .comment('ID del médico que realizó la aprobación');

            // Justificación de desaprobación (si aplica)
            table.text('justificacion_desaprobacion').nullable()
                .comment('Motivo obligatorio cuando el médico desaprueba un cargo previamente aprobado');

            // Índice para búsquedas por estado de aprobación
            table.index('aprobado_medico', 'idx_cargos_aprobacion');
            table.index('aprobado_por_medico_id', 'idx_cargos_medico_aprobador');
        });

        console.log('✅ Campos de aprobación médica agregados a cargos_documento');
    } else {
        console.log('ℹ️ Los campos de aprobación ya existen en cargos_documento');
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    const hasAprobado = await knex.schema.hasColumn('cargos_documento', 'aprobado_medico');

    if (hasAprobado) {
        await knex.schema.alterTable('cargos_documento', (table) => {
            // Eliminar índices primero
            table.dropIndex('aprobado_medico', 'idx_cargos_aprobacion');
            table.dropIndex('aprobado_por_medico_id', 'idx_cargos_medico_aprobador');

            // Eliminar columnas
            table.dropColumn('aprobado_medico');
            table.dropColumn('fecha_aprobacion');
            table.dropColumn('aprobado_por_medico_id');
            table.dropColumn('justificacion_desaprobacion');
        });

        console.log('✅ Campos de aprobación médica eliminados de cargos_documento');
    }
};
