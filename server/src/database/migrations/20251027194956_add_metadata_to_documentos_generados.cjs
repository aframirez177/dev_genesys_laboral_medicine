/**
 * Migración: Agregar metadata para página de resultados premium
 * Agrega: nombre_responsable, num_cargos, pricing
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('documentos_generados', function(table) {
    // Nombre de quien diligencia el formulario
    table.string('nombre_responsable', 255).nullable();

    // Número de cargos evaluados
    table.integer('num_cargos').unsigned().nullable();

    // Objeto JSON con pricing detallado
    // Estructura: { precioBase, precioMatriz, precioProfesiograma, precioPerfil, precioCotizacion, subtotal, descuento, total }
    table.jsonb('pricing').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('documentos_generados', function(table) {
    table.dropColumn('nombre_responsable');
    table.dropColumn('num_cargos');
    table.dropColumn('pricing');
  });
};
