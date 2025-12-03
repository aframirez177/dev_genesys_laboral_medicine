/**
 * Migration: Actividades Económicas
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Tabla para almacenar sectores económicos con códigos CIIU
 * y riesgos comunes asociados a cada actividad.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('actividades_economicas', (table) => {
    table.increments('id').primary();
    table.string('nombre', 255).notNullable();
    table.string('ciiu_code', 10).nullable();
    table.string('sector', 100).notNullable();
    table.text('descripcion').nullable();
    table.jsonb('riesgos_comunes').nullable();
    table.boolean('activo').defaultTo(true);
    table.timestamps(true, true);

    // Índices para búsqueda eficiente
    table.index('sector');
    table.index('ciiu_code');
    table.index('activo');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('actividades_economicas');
};

