/**
 * Migración: Extender tabla empresas
 * - Estado de servicio (activa, suspendida, pendiente_pago)
 * - Datos de contacto adicionales
 * - Responsable SST
 * - Servicios contratados
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Verificar si ya tiene las columnas
    const hasStatus = await knex.schema.hasColumn('empresas', 'status');

    if (!hasStatus) {
        await knex.schema.alterTable('empresas', (table) => {
            // Estado de servicio
            table.enu('status', ['activa', 'suspendida', 'pendiente_pago']).defaultTo('activa');
            table.timestamp('fecha_suspension').nullable();
            table.text('razon_suspension').nullable();

            // Datos de contacto adicionales
            table.string('email', 255).nullable();
            table.string('telefono', 50).nullable();
            table.string('ciudad', 100).nullable();
            table.string('direccion', 255).nullable();
            table.string('ciiu', 20).nullable().comment('Código CIIU de actividad económica');
            table.string('sector_economico', 100).nullable();

            // Responsable SST de la empresa
            table.string('responsable_sst_nombre', 255).nullable();
            table.string('responsable_sst_cargo', 100).nullable();
            table.string('responsable_sst_telefono', 50).nullable();
            table.string('responsable_sst_email', 255).nullable();

            // Servicios contratados
            table.boolean('servicio_matriz_riesgos').defaultTo(true);
            table.boolean('servicio_profesiograma').defaultTo(true);
            table.boolean('servicio_sve').defaultTo(false);
            table.boolean('servicio_bateria_psicosocial').defaultTo(false);

            // Control de pagos
            table.timestamp('ultimo_pago').nullable();
            table.decimal('saldo_pendiente', 12, 2).defaultTo(0);
        });

        // Índices
        await knex.schema.alterTable('empresas', (table) => {
            table.index('status');
            table.index('ciiu');
            table.index('ciudad');
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    const hasStatus = await knex.schema.hasColumn('empresas', 'status');

    if (hasStatus) {
        await knex.schema.alterTable('empresas', (table) => {
            // Eliminar índices primero
            table.dropIndex('status');
            table.dropIndex('ciiu');
            table.dropIndex('ciudad');

            // Eliminar columnas
            table.dropColumn('status');
            table.dropColumn('fecha_suspension');
            table.dropColumn('razon_suspension');
            table.dropColumn('email');
            table.dropColumn('telefono');
            table.dropColumn('ciudad');
            table.dropColumn('direccion');
            table.dropColumn('ciiu');
            table.dropColumn('sector_economico');
            table.dropColumn('responsable_sst_nombre');
            table.dropColumn('responsable_sst_cargo');
            table.dropColumn('responsable_sst_telefono');
            table.dropColumn('responsable_sst_email');
            table.dropColumn('servicio_matriz_riesgos');
            table.dropColumn('servicio_profesiograma');
            table.dropColumn('servicio_sve');
            table.dropColumn('servicio_bateria_psicosocial');
            table.dropColumn('ultimo_pago');
            table.dropColumn('saldo_pendiente');
        });
    }
};
