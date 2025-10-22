exports.up = function(knex) {
  return knex.schema.alterTable('documentos_generados', function(table) {
    table.string('token', 64).unique().nullable(); // Para la URL de resultados
    table.jsonb('preview_urls').nullable(); // Guarda {'matriz': 'url1', 'profesiograma': 'url2'}
    table.string('estado', 50).nullable().defaultTo('pendiente_pago').alter(); // Asegura que exista
  });
};
exports.down = function(knex) {
  return knex.schema.alterTable('documentos_generados', function(table) {
    table.dropColumn('token');
    table.dropColumn('preview_urls');
  });
};