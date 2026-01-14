/**
 * Migración: Reactivar Riesgo Tecnológico
 *
 * Problema: RT estaba desactivado pero el sistema lo requiere para
 * importar matrices JSON que usan "Riesgo Tecnológico"
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('🔧 Reactivando categoría Riesgo Tecnológico (RT)...');

  await knex('catalogo_riesgos')
    .where('codigo', 'RT')
    .update({ activo: true });

  console.log('✅ Riesgo Tecnológico reactivado');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex('catalogo_riesgos')
    .where('codigo', 'RT')
    .update({ activo: false });
};
