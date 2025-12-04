/**
 * Migration: Agregar tracking de jobs asíncronos a documentos_generados
 *
 * Agrega columnas para:
 * - job_id: ID del job en BullMQ
 * - progreso: Porcentaje de progreso (0-100)
 * - error: Mensaje de error si falla
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('documentos_generados', function(table) {
    // ID del job en BullMQ (para polling de estado)
    table.string('job_id', 255).nullable();
    table.comment('ID del job en BullMQ para tracking asíncrono');

    // Progreso del job (0-100)
    table.integer('progreso').notNullable().defaultTo(0);
    table.comment('Porcentaje de progreso del job (0-100)');

    // Mensaje de error si el job falla
    table.text('error').nullable();
    table.comment('Mensaje de error si el job falla');
  })
  .then(function() {
    // Crear índices para queries frecuentes
    return knex.raw(`
      CREATE INDEX idx_documentos_job_id ON documentos_generados(job_id) WHERE job_id IS NOT NULL;
    `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
    DROP INDEX IF EXISTS idx_documentos_job_id;
  `)
  .then(function() {
    return knex.schema.alterTable('documentos_generados', function(table) {
      table.dropColumn('job_id');
      table.dropColumn('progreso');
      table.dropColumn('error');
    });
  });
};
