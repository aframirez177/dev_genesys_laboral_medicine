/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // La lista de trabajadores/pacientes que reciben exámenes
  return knex.schema.createTable('pacientes', function(table) {
    table.increments('id').primary();
    
    // A qué empresa cliente pertenece este trabajador
    table.integer('empresa_id').unsigned().notNullable().references('id').inTable('empresas').onDelete('CASCADE');

    // Datos del trabajador
    table.string('cedula', 20).notNullable().unique();
    table.string('nombre_completo', 255).notNullable();
    table.date('fecha_nacimiento').nullable();
    table.string('cargo_paciente', 255).nullable(); // Ej: 'Soldador', 'Secretaria'
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('pacientes');
};