/**
 * Migration: N8N Workflow Logs
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Tabla para registrar ejecuciones de workflows N8N.
 * Útil para debugging, monitoreo y análisis de uso.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('n8n_workflow_logs', (table) => {
    table.increments('id').primary();
    table.string('workflow_name', 100).notNullable();
    table.string('workflow_id', 100).nullable();       // ID interno de N8N
    table.jsonb('trigger_data').nullable();            // Datos enviados al workflow
    table.jsonb('response').nullable();                // Respuesta del workflow
    table.string('status', 20).notNullable();          // 'success', 'failed', 'timeout', 'pending'
    table.text('error_message').nullable();
    table.integer('execution_time_ms').nullable();
    table.string('triggered_by', 100).nullable();      // 'api', 'cron', 'webhook', 'manual'
    table.integer('user_id').unsigned().nullable();
    table.timestamp('executed_at').defaultTo(knex.fn.now());

    // Índices para monitoreo
    table.index('workflow_name');
    table.index('status');
    table.index('executed_at');
    table.index('triggered_by');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('n8n_workflow_logs');
};

