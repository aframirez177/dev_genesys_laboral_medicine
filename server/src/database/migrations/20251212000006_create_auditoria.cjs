/**
 * Migración: Crear tabla de auditoría
 * Registra todas las acciones importantes del sistema
 * Cumple con Decreto 1072/2015 Art. 2.2.4.6.13 (Trazabilidad)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    const exists = await knex.schema.hasTable('auditoria');

    if (!exists) {
        await knex.schema.createTable('auditoria', (table) => {
            table.increments('id').primary();

            // Usuario que realizó la acción (puede ser null si se elimina el usuario)
            table.integer('user_id').unsigned()
                .references('id').inTable('users').onDelete('SET NULL');

            // Tipo de acción realizada
            table.string('accion', 100).notNullable()
                .comment('Ej: crear, actualizar, eliminar, aprobar, rechazar, login, logout');

            // Recurso afectado
            table.string('recurso', 100).notNullable()
                .comment('Tabla/entidad afectada: pagos, empresas, medicos, etc');
            table.integer('recurso_id').nullable()
                .comment('ID del registro afectado');

            // Detalles de la acción
            table.jsonb('detalles').defaultTo('{}')
                .comment('Información adicional de la acción');
            table.jsonb('valores_anteriores').nullable()
                .comment('Estado previo del registro (para updates/deletes)');
            table.jsonb('valores_nuevos').nullable()
                .comment('Nuevo estado del registro (para creates/updates)');

            // Metadata de la request
            table.string('ip_address', 45).nullable();
            table.text('user_agent').nullable();

            // Timestamp (solo created_at, los logs no se modifican)
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });

        // Índices para búsquedas y reportes frecuentes
        await knex.schema.alterTable('auditoria', (table) => {
            table.index('user_id');
            table.index('accion');
            table.index('recurso');
            table.index('created_at');
            table.index(['recurso', 'recurso_id']);
            table.index(['user_id', 'created_at']);
            table.index(['accion', 'created_at']);
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('auditoria');
};
