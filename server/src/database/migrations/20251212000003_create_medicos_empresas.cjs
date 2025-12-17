/**
 * Migración: Crear tabla de relación N:N médicos-empresas
 * Permite asignar múltiples médicos a múltiples empresas
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    const exists = await knex.schema.hasTable('medicos_empresas');

    if (!exists) {
        await knex.schema.createTable('medicos_empresas', (table) => {
            table.increments('id').primary();

            // Relaciones
            table.integer('medico_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE');
            table.integer('empresa_id').unsigned().notNullable()
                .references('id').inTable('empresas').onDelete('CASCADE');
            table.integer('asignado_por').unsigned()
                .references('id').inTable('users').onDelete('SET NULL');

            // Metadata de asignación
            table.timestamp('fecha_asignacion').defaultTo(knex.fn.now());
            table.timestamp('fecha_fin').nullable();
            table.boolean('activo').defaultTo(true);
            table.boolean('es_medico_principal').defaultTo(false);
            table.text('notas').nullable();

            // Timestamps
            table.timestamps(true, true);

            // Constraint: Un médico solo puede estar asignado una vez a cada empresa
            table.unique(['medico_id', 'empresa_id']);
        });

        // Índices para queries frecuentes
        await knex.schema.alterTable('medicos_empresas', (table) => {
            table.index('medico_id');
            table.index('empresa_id');
            table.index(['empresa_id', 'activo']);
            table.index(['medico_id', 'activo']);
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('medicos_empresas');
};
