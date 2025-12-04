/**
 * Migration: Crear tabla catalogo_ciudades
 * 
 * Consolida las ciudades de Colombia que estaban en archivo estático
 * a la base de datos para mantener escalabilidad.
 * 
 * Sprint 6 - Consolidación de datos
 */

exports.up = function(knex) {
  return knex.schema.createTable('catalogo_ciudades', (table) => {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable();
    table.string('departamento', 100).notNullable();
    table.string('codigo_dane', 10).nullable(); // Código DANE opcional
    table.boolean('es_capital').defaultTo(false);
    table.boolean('activo').defaultTo(true);
    table.integer('orden').defaultTo(0);
    table.timestamps(true, true);
    
    // Índices
    table.index('departamento');
    table.index('activo');
    table.unique(['nombre', 'departamento']); // Evitar duplicados
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('catalogo_ciudades');
};

