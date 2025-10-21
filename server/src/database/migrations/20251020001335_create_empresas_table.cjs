/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Esta tabla guardará tus clientes (las empresas)
  return knex.schema.createTable('empresas', function(table) {
    table.increments('id').primary();
    table.string('nit', 20).notNullable().unique();
    table.string('nombre_legal', 255).notNullable();
    table.string('password_hash', 255).notNullable(); // Para que puedan iniciar sesión
    table.timestamps(true, true); // Añade created_at y updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('empresas');
};