/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cargos_documento', function(table) {
    table.increments('id').primary();

    // A qué documento pertenece este cargo
    table.integer('documento_id').unsigned().notNullable().references('id').inTable('documentos_generados').onDelete('CASCADE');

    table.string('nombre_cargo', 255).notNullable();
    table.string('area', 255).nullable();
    table.text('descripcion_tareas').nullable();
    // ... puedes añadir más campos de tu formulario aquí
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('cargos_documento');
};