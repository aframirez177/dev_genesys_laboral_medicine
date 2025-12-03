/**
 * Migration: Cargo Aliases (Sinónimos)
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Tabla para almacenar sinónimos y nombres alternativos de cargos.
 * Permite búsqueda fuzzy con múltiples variantes de un mismo cargo.
 *
 * Ejemplo: "Ingeniero de Software" → ["Desarrollador", "Programador", "Software Developer"]
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cargo_aliases', (table) => {
    table.increments('id').primary();
    table.integer('cargo_id').unsigned().notNullable();
    table.string('alias', 255).notNullable();
    table.string('language', 10).defaultTo('es');
    table.timestamps(true, true);

    // Foreign key
    table.foreign('cargo_id')
         .references('id')
         .inTable('catalogo_cargos')
         .onDelete('CASCADE');

    // Índices
    table.index('cargo_id');
    
    // Evitar duplicados
    table.unique(['cargo_id', 'alias']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('cargo_aliases');
};

