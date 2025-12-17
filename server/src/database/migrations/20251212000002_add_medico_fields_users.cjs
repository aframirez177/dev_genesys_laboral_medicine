/**
 * Migración: Agregar campos de médico a tabla users
 * - Licencia SST, fecha vencimiento, especialidad
 * - Firma digital (URL y metadatos)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Verificar columnas existentes
    const hasLicencia = await knex.schema.hasColumn('users', 'licencia_sst');

    if (!hasLicencia) {
        await knex.schema.alterTable('users', (table) => {
            // Campos específicos para médicos ocupacionales
            table.string('licencia_sst', 50).comment('Número de licencia SST');
            table.date('fecha_vencimiento_licencia');
            table.string('especialidad', 100);

            // Firma digital PNG con transparencia
            table.text('firma_url').comment('URL de firma en DigitalOcean Spaces');
            table.jsonb('firma_metadatos').defaultTo('{}').comment('width, height, hash, size, updated_at');

            // Índice para búsqueda por licencia
            table.index('licencia_sst');
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    const hasLicencia = await knex.schema.hasColumn('users', 'licencia_sst');

    if (hasLicencia) {
        await knex.schema.alterTable('users', (table) => {
            table.dropIndex('licencia_sst');
            table.dropColumn('licencia_sst');
            table.dropColumn('fecha_vencimiento_licencia');
            table.dropColumn('especialidad');
            table.dropColumn('firma_url');
            table.dropColumn('firma_metadatos');
        });
    }
};
