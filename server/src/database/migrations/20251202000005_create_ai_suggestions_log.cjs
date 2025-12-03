/**
 * Migration: AI Suggestions Log
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Tabla para registrar todas las sugerencias de IA,
 * trackear cuáles fueron aceptadas y analizar patrones.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('ai_suggestions_log', (table) => {
    table.increments('id').primary();
    table.integer('cargo_documento_id').unsigned().nullable();
    table.string('suggestion_type', 50).notNullable(); // 'riesgos', 'examenes', 'epp', 'aptitudes'
    table.jsonb('suggested_data').notNullable();
    table.jsonb('input_context').nullable();           // Datos de entrada para debug
    table.boolean('accepted').defaultTo(false);
    table.string('source', 50).notNullable();          // 'n8n-openai', 'local-catalog', 'manual', 'hybrid'
    table.integer('execution_time_ms').nullable();
    table.string('model_version', 50).nullable();      // 'gpt-4-turbo', 'gpt-3.5', etc.
    table.integer('user_id').unsigned().nullable();
    table.timestamps(true, true);

    // Foreign key (opcional ya que cargo puede no existir al momento de sugerencia)
    table.foreign('cargo_documento_id')
         .references('id')
         .inTable('cargos_documento')
         .onDelete('SET NULL');

    // Índices para análisis
    table.index('cargo_documento_id');
    table.index('suggestion_type');
    table.index('source');
    table.index('accepted');
    table.index('created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('ai_suggestions_log');
};

