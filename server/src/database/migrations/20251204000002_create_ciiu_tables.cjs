/**
 * Migration: Crear tablas CIIU (Clasificación Industrial Internacional Uniforme)
 * 
 * Estructura jerárquica:
 * - ciiu_secciones: 21 secciones (A-U)
 * - ciiu_divisiones: 87 divisiones con código de 2 dígitos
 * 
 * Basado en CIIU Rev. 4 A.C. (2022) - DIAN Colombia
 * 
 * Sprint 6 - Consolidación de datos
 */

exports.up = function(knex) {
  return knex.schema
    // Tabla 1: Secciones (21 categorías principales)
    .createTable('ciiu_secciones', (table) => {
      table.increments('id').primary();
      table.string('codigo', 1).notNullable().unique(); // A, B, C, ..., U
      table.string('nombre', 255).notNullable();
      table.text('descripcion').nullable();
      table.integer('orden').defaultTo(0);
      table.boolean('activo').defaultTo(true);
      table.timestamps(true, true);
      
      table.index('codigo');
      table.index('activo');
    })
    // Tabla 2: Divisiones (87 actividades económicas)
    .createTable('ciiu_divisiones', (table) => {
      table.increments('id').primary();
      table.string('codigo', 2).notNullable().unique(); // 01, 02, ..., 99
      table.string('seccion_codigo', 1).notNullable();
      table.string('nombre', 500).notNullable();
      table.text('descripcion').nullable();
      table.jsonb('riesgos_comunes').nullable(); // Para sugerir GES automáticamente
      table.integer('orden').defaultTo(0);
      table.boolean('activo').defaultTo(true);
      table.timestamps(true, true);
      
      // Foreign key a secciones
      table.foreign('seccion_codigo')
        .references('codigo')
        .inTable('ciiu_secciones')
        .onDelete('CASCADE');
      
      table.index('seccion_codigo');
      table.index('codigo');
      table.index('activo');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('ciiu_divisiones')
    .dropTableIfExists('ciiu_secciones');
};

