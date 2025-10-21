/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('riesgos_cargo', function(table) {
    table.increments('id').primary();

    // A qué cargo pertenece este riesgo
    table.integer('cargo_id').unsigned().notNullable().references('id').inTable('cargos_documento').onDelete('CASCADE');

    table.string('tipo_riesgo', 100).notNullable(); // 'Biológico', 'Físico', 'Químico'
    table.string('descripcion_riesgo', 255).nullable(); // 'Ruido', 'Polvo', etc.
    
    // Aquí puedes añadir los campos de la GTC45
    table.integer('nivel_deficiencia').nullable();
    table.integer('nivel_exposicion').nullable();
    table.integer('nivel_consecuencia').nullable();
    
    table.text('controles_fuente').nullable();
    table.text('controles_medio').nullable();
    table.text('controles_individuo').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('riesgos_cargo');
};