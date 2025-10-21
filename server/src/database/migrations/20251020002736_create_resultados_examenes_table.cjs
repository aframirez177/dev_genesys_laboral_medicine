/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('resultados_examenes', function(table) {
    table.increments('id').primary();

    // Quién se hizo el examen
    table.integer('paciente_id').unsigned().notNullable().references('id').inTable('pacientes').onDelete('CASCADE');
    
    // Qué examen se hizo
    table.integer('servicio_id').unsigned().references('id').inTable('catalogo_servicios').onDelete('SET NULL');

    // (Opcional) A qué cotización pertenecía
    table.integer('cotizacion_id').unsigned().nullable().references('id').inTable('cotizaciones').onDelete('SET NULL');

    // El link al PDF (en DigitalOcean Spaces)
    table.string('url_resultado_pdf', 512).nullable();

    // El ID de tu software "Avances" para mantenerlos conectados
    table.string('id_externo_avances', 100).nullable();

    table.timestamp('fecha_realizacion').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('resultados_examenes');
};