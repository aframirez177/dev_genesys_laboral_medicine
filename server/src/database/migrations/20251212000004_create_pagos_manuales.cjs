/**
 * Migración: Crear tabla de pagos manuales
 * Para registrar pagos que no pasan por PayU (transferencias, QR, efectivo)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    const exists = await knex.schema.hasTable('pagos_manuales');

    if (!exists) {
        await knex.schema.createTable('pagos_manuales', (table) => {
            table.increments('id').primary();

            // Relaciones
            table.integer('empresa_id').unsigned().notNullable()
                .references('id').inTable('empresas').onDelete('CASCADE');
            table.integer('registrado_por').unsigned()
                .references('id').inTable('users').onDelete('SET NULL');
            table.integer('aprobado_por').unsigned()
                .references('id').inTable('users').onDelete('SET NULL');

            // Datos del pago
            table.decimal('monto', 12, 2).notNullable();
            table.string('referencia_pago', 100);
            table.enu('metodo_pago', ['transferencia', 'qr', 'efectivo', 'otro']).notNullable();
            table.enu('estado', ['pendiente', 'aprobado', 'rechazado']).defaultTo('pendiente');

            // Evidencia del pago
            table.text('evidencia_url').comment('URL de comprobante en Spaces');
            table.string('evidencia_tipo', 50).comment('image/jpeg, application/pdf, etc');

            // Fechas importantes
            table.timestamp('fecha_pago').comment('Fecha en que se realizó el pago');
            table.timestamp('fecha_aprobacion');
            table.timestamp('fecha_rechazo');

            // Notas y observaciones
            table.text('notas');
            table.text('motivo_rechazo');

            // Concepto del pago
            table.integer('num_cargos').comment('Número de cargos pagados');
            table.text('descripcion_servicio');

            // Timestamps
            table.timestamps(true, true);
        });

        // Índices para queries frecuentes
        await knex.schema.alterTable('pagos_manuales', (table) => {
            table.index('empresa_id');
            table.index('estado');
            table.index('created_at');
            table.index(['empresa_id', 'estado']);
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('pagos_manuales');
};
