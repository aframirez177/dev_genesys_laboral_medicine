/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('items_cotizacion', function(table) {
    table.increments('id').primary();

    // A qué "carrito" pertenece
    table.integer('cotizacion_id').unsigned().notNullable().references('id').inTable('cotizaciones').onDelete('CASCADE');
    
    // Qué servicio es
    table.integer('servicio_id').unsigned().references('id').inTable('catalogo_servicios').onDelete('SET NULL');

    // Cuántos
    table.integer('cantidad').unsigned().notNullable().defaultTo(1);
    
    // ¡Importante! Guardamos el precio del servicio AL MOMENTO de la cotización
    table.decimal('precio_unitario_congelado', 10, 2).notNullable();

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('items_cotizacion');
};