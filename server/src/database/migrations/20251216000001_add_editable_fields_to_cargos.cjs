/**
 * Migración: Agregar campos editables por médico a cargos_documento
 * Sprint 6 - Sistema Multi-Rol
 *
 * Campos que el médico puede editar:
 * - epp: Elementos de Protección Personal
 * - aptitudes: Aptitudes requeridas para el cargo
 * - condiciones_incompatibles: Condiciones de salud incompatibles
 */

exports.up = async function(knex) {
    console.log('📝 Agregando campos editables a cargos_documento...');

    // Verificar si las columnas ya existen
    const hasEpp = await knex.schema.hasColumn('cargos_documento', 'epp');
    const hasAptitudes = await knex.schema.hasColumn('cargos_documento', 'aptitudes');
    const hasCondiciones = await knex.schema.hasColumn('cargos_documento', 'condiciones_incompatibles');

    await knex.schema.alterTable('cargos_documento', (table) => {
        // EPP - Elementos de Protección Personal (array de strings)
        if (!hasEpp) {
            table.jsonb('epp')
                .nullable()
                .comment('Array de EPP requeridos para el cargo');
        }

        // Aptitudes requeridas (array de strings)
        if (!hasAptitudes) {
            table.jsonb('aptitudes')
                .nullable()
                .comment('Array de aptitudes requeridas');
        }

        // Condiciones de salud incompatibles (array de strings)
        if (!hasCondiciones) {
            table.jsonb('condiciones_incompatibles')
                .nullable()
                .comment('Array de condiciones de salud incompatibles');
        }
    });

    console.log('✅ Campos agregados correctamente');
};

exports.down = async function(knex) {
    console.log('⏪ Removiendo campos editables de cargos_documento...');

    const hasEpp = await knex.schema.hasColumn('cargos_documento', 'epp');
    const hasAptitudes = await knex.schema.hasColumn('cargos_documento', 'aptitudes');
    const hasCondiciones = await knex.schema.hasColumn('cargos_documento', 'condiciones_incompatibles');

    await knex.schema.alterTable('cargos_documento', (table) => {
        if (hasEpp) table.dropColumn('epp');
        if (hasAptitudes) table.dropColumn('aptitudes');
        if (hasCondiciones) table.dropColumn('condiciones_incompatibles');
    });

    console.log('✅ Campos removidos');
};
