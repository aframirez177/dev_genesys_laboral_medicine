/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('catalogo_servicios', function(table) {
    // Columna JSON para decirle al bot qué preguntar
    // Ej: {"campos": ["numero_empleados", "ciudad"]}
    table.jsonb('datos_requeridos').nullable();
    
    // Columna para el "Flujo Recomendado" que menciona la guía
    table.text('flujo_recomendado').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('catalogo_servicios', function(table) {
    table.dropColumn('datos_requeridos');
    table.dropColumn('flujo_recomendado');
  });
};