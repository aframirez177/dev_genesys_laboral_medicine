/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('faq', function(table) {
    table.increments('id').primary();
    table.text('pregunta').notNullable();
    table.text('respuesta').notNullable();
    table.string('categoria', 100).nullable();
    
    // Palabras clave para la búsqueda (ej: "precio, audiometria, costo")
    table.text('keywords').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('faq');
};