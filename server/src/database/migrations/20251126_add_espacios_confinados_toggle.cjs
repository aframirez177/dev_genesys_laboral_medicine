/**
 * Migration: Add trabaja_espacios_confinados column to cargos_documento
 *
 * This toggle is required for:
 * - Compliance with Colombian regulations (Res. 0491/2020, NTC 4116)
 * - Triggering specific medical exams (spirometry, cardio, etc.)
 * - Generating appropriate EPP requirements
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if column already exists
  const hasColumn = await knex.schema.hasColumn('cargos_documento', 'trabaja_espacios_confinados');
  
  if (!hasColumn) {
    return knex.schema.alterTable('cargos_documento', function(table) {
      table.boolean('trabaja_espacios_confinados')
        .notNullable()
        .defaultTo(false)
        .comment('¿El cargo implica trabajo en espacios confinados? (tanques, silos, pozos, etc.)');
    });
  }
  
  console.log('Column trabaja_espacios_confinados already exists, skipping...');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('cargos_documento', 'trabaja_espacios_confinados');
  
  if (hasColumn) {
    return knex.schema.alterTable('cargos_documento', function(table) {
      table.dropColumn('trabaja_espacios_confinados');
    });
  }
};
