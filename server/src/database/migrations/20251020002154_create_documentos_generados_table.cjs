/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('documentos_generados', function(table) {
    table.increments('id').primary();

    // A qué empresa pertenece
    table.integer('empresa_id').unsigned().notNullable().references('id').inTable('empresas').onDelete('CASCADE');
    
    // Quién fue el "lead" que lo creó
    table.integer('usuario_lead_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');

    // 'matriz_riesgos', 'profesiograma', 'perfil_cargo'
    table.string('tipo_documento', 100).notNullable();

    // El JSON con todos los datos del formulario (como un backup)
    table.jsonb('form_data').nullable();

    // Dónde está el PDF o Excel final
    table.string('url_documento_final', 512).nullable();

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('documentos_generados');
};