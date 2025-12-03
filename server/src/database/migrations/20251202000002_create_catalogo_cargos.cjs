/**
 * Migration: Catálogo de Cargos
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Tabla maestra con 500+ cargos predefinidos, incluyendo
 * riesgos típicos, exámenes sugeridos y aptitudes requeridas.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('catalogo_cargos', (table) => {
    table.increments('id').primary();
    table.string('nombre', 255).notNullable();
    table.string('sector', 100).notNullable();
    table.string('area', 100).notNullable();
    table.text('descripcion').nullable();
    table.integer('actividad_id').unsigned().nullable();
    table.jsonb('riesgos_tipicos').nullable();       // Array de códigos GES
    table.jsonb('examenes_sugeridos').nullable();    // Array de códigos exámenes
    table.jsonb('aptitudes').nullable();             // Array de aptitudes requeridas
    table.jsonb('epp_sugerido').nullable();          // EPP recomendado
    table.string('nivel_riesgo', 10).nullable();     // I, II, III, IV, V
    table.boolean('activo').defaultTo(true);
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('actividad_id')
         .references('id')
         .inTable('actividades_economicas')
         .onDelete('SET NULL');

    // Índices para búsqueda
    table.index('sector');
    table.index('area');
    table.index('actividad_id');
    table.index('nivel_riesgo');
    table.index('activo');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('catalogo_cargos');
};

