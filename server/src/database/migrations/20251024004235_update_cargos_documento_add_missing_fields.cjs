// Archivo: YYYYMMDDHHMMSS_update_cargos_documento_add_missing_fields.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Modifica la tabla 'cargos_documento' existente
  return knex.schema.alterTable('cargos_documento', function(table) {
    // --- Columnas Faltantes ---
    table.string('zona').nullable().comment('Zona o lugar específico del cargo');
    table.integer('num_trabajadores').notNullable().defaultTo(1).comment('Número de trabajadores en este cargo');
    table.boolean('tareas_rutinarias').notNullable().defaultTo(false).comment('¿Las tareas son rutinarias?');
    table.boolean('trabaja_alturas').notNullable().defaultTo(false).comment('¿El cargo implica trabajo en alturas?');
    table.boolean('manipula_alimentos').notNullable().defaultTo(false).comment('¿El cargo implica manipulación de alimentos?');
    table.boolean('conduce_vehiculo').notNullable().defaultTo(false).comment('¿El cargo implica conducción de vehículos?');

    // --- Columnas estándar (Opcional pero recomendado) ---
    table.timestamps(true, true); // Añade created_at y updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Revierte los cambios eliminando las columnas
  return knex.schema.alterTable('cargos_documento', function(table) {
    table.dropColumn('zona');
    table.dropColumn('num_trabajadores');
    table.dropColumn('tareas_rutinarias');
    table.dropColumn('trabaja_alturas');
    table.dropColumn('manipula_alimentos');
    table.dropColumn('conduce_vehiculo');
    table.dropTimestamps(); // Elimina created_at y updated_at
  });
};