/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Esta es la lista maestra de precios y servicios
  return knex.schema.createTable('catalogo_servicios', function(table) {
    table.increments('id').primary();

    table.string('nombre', 255).notNullable().unique(); 
    // Ej: 'Audiometría', 'Examen Médico Escolar', 'Matriz de Riesgos (IA)'

    table.text('descripcion').nullable();

    // El precio base antes de descuentos por volumen
    table.decimal('precio_base', 10, 2).notNullable().defaultTo(0.00); 

    // Para organizar: 'EXAMEN', 'LABORATORIO', 'DOCUMENTO_IA', 'CONSULTORIA'
    table.string('tipo', 100).notNullable().defaultTo('EXAMEN');

    // Para "desactivar" un servicio sin borrarlo
    table.boolean('activo').notNullable().defaultTo(true);

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('catalogo_servicios');
};