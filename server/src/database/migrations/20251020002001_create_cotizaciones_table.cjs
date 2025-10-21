/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cotizaciones', function(table) {
    table.increments('id').primary();

    // Quién lo solicitó
    table.integer('empresa_id').unsigned().notNullable().references('id').inTable('empresas').onDelete('CASCADE');
    table.integer('usuario_solicitante_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');

    // Estado del "carrito"
    table.string('estado', 50).notNullable().defaultTo('pendiente'); // 'pendiente', 'aprobada', 'facturada'

    // Totales
    table.decimal('descuento_volumen', 5, 2).defaultTo(0.00); // Ej: 10.50%
    table.decimal('monto_subtotal', 12, 2).notNullable().defaultTo(0.00);
    table.decimal('monto_total', 12, 2).notNullable().defaultTo(0.00);

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('cotizaciones');
};