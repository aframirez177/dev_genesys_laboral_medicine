/**
 * Migración: Reasignar GES a Riesgo Tecnológico
 *
 * Problema: El seed 000_update_catalogo_riesgos_compliance.cjs movió los GES
 * de RT a Seguridad (CS), dejando RT vacío. La validación del catálogo
 * falla porque RT no tiene GES.
 *
 * Solución: Reasignar los GES que pertenecen a RT de vuelta a su categoría.
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('🔧 Reasignando GES a Riesgo Tecnológico (RT)...');

  // Obtener ID de RT
  const rt = await knex('catalogo_riesgos')
    .where('codigo', 'RT')
    .first();

  if (!rt) {
    console.log('⚠️  RT no existe en catalogo_riesgos, saltando migración');
    return;
  }

  // GES que pertenecen a Riesgo Tecnológico
  const gesNombres = [
    'Incendio',
    'Explosión',
    'Incendio o explosión - Presencia de materiales combustibles/inflamables',
    'Fuga o derrame de sustancias peligrosas',
    'Trabajos en caliente'
  ];

  // Reasignar GES a RT
  const result = await knex('catalogo_ges')
    .whereIn('nombre', gesNombres)
    .update({ riesgo_id: rt.id });

  console.log(`✅ ${result} GES reasignados a Riesgo Tecnológico (RT)`);

  // Verificar resultado
  const count = await knex('catalogo_ges')
    .where('riesgo_id', rt.id)
    .where('activo', true)
    .count('id as total')
    .first();

  console.log(`📊 RT ahora tiene ${count.total} GES activos`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Obtener ID de CS (Condiciones de Seguridad)
  const cs = await knex('catalogo_riesgos')
    .where('codigo', 'CS')
    .first();

  if (!cs) {
    console.log('⚠️  CS no existe, no se puede hacer rollback');
    return;
  }

  const gesNombres = [
    'Incendio',
    'Explosión',
    'Incendio o explosión - Presencia de materiales combustibles/inflamables',
    'Fuga o derrame de sustancias peligrosas',
    'Trabajos en caliente'
  ];

  await knex('catalogo_ges')
    .whereIn('nombre', gesNombres)
    .update({ riesgo_id: cs.id });

  console.log('↩️  GES devueltos a Condiciones de Seguridad');
};
