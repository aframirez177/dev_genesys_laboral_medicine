/**
 * Migration: Áreas Similares
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Tabla para mapear relaciones entre áreas organizacionales similares.
 * Permite sugerir riesgos de áreas relacionadas cuando se crea un nuevo cargo.
 *
 * Ejemplo: ADMINISTRATIVA → [CONTABILIDAD, FINANZAS, RRHH]
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('areas_similares', (table) => {
    table.increments('id').primary();
    table.string('area_principal', 100).notNullable();
    table.string('area_relacionada', 100).notNullable();
    table.decimal('similarity_score', 3, 2).defaultTo(1.0); // 0.00 - 1.00
    table.boolean('puede_copiar_riesgos').defaultTo(true);
    table.string('mapping_type', 50).defaultTo('manual'); // manual, auto, ml
    table.timestamps(true, true);

    // Índices
    table.index('area_principal');
    table.index('area_relacionada');
    
    // Evitar duplicados bidireccionales
    table.unique(['area_principal', 'area_relacionada']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('areas_similares');
};

