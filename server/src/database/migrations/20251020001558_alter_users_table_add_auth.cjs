/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // 1. Añade la columna para la contraseña
    // La hacemos nullable() por si tienes usuarios existentes que aún no tienen pass
    table.string('password_hash', 255).nullable();

    // 2. Añade la conexión a la tabla 'roles'
    table.integer('rol_id').unsigned().references('id').inTable('roles').onDelete('SET NULL');

    // 3. Añade la conexión a la tabla 'empresas'
    // Es nullable() porque un 'admin_genesys' no pertenece a una empresa cliente
    table.integer('empresa_id').unsigned().references('id').inTable('empresas').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // El 'down' es importante para poder revertir los cambios
    table.dropColumn('password_hash');
    table.dropForeign('rol_id');
    table.dropColumn('rol_id');
    table.dropForeign('empresa_id');
    table.dropColumn('empresa_id');
  });
};