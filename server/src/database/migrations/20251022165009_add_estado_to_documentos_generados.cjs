/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Añade la columna 'estado' a la tabla existente
  return knex.schema.alterTable('documentos_generados', function(table) {
    table.string('estado', 50).nullable().defaultTo('pendiente_pago'); 
    // La hacemos nullable por si acaso, y default pendiente_pago
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Permite revertir el cambio
  return knex.schema.alterTable('documentos_generados', function(table) {
    table.dropColumn('estado');
  });
};