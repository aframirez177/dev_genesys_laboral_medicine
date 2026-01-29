/**
 * Add mapa_organizacional JSONB column to empresas table
 * Stores org map node positions and connections
 */
exports.up = function(knex) {
    return knex.schema.alterTable('empresas', (table) => {
        table.jsonb('mapa_organizacional').nullable().defaultTo(null);
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('empresas', (table) => {
        table.dropColumn('mapa_organizacional');
    });
};
