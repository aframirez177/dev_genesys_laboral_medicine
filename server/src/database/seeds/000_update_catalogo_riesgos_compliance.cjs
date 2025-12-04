/**
 * Seed: Actualización de Catálogo de Riesgos para Compliance Res. 0312/2019
 *
 * PROBLEMA: CatalogoService valida 14 categorías según Res. 0312 de 2019,
 * pero la tabla solo tiene 8 categorías según GTC-45-2012.
 *
 * SOLUCIÓN:
 * 1. Actualizar nombres existentes (quitar prefijo "Riesgo")
 * 2. Agregar 6 categorías faltantes (inicialmente sin GES)
 * 3. Mantener GES existentes sin cambios
 *
 * CATEGORÍAS ESPERADAS (14):
 * Mecánico, Eléctrico, Físico, Químico, Biológico, Biomecánico,
 * Factores Humanos, Psicosocial, Locativo, Natural, Seguridad,
 * Otros Riesgos, Saneamiento Básico, Salud Pública
 *
 * MAPEO DE ACTUALIZACIÓN:
 * - RF  → Físico (mantiene GES)
 * - RB  → Biomecánico (mantiene GES)
 * - RQ  → Químico (mantiene GES)
 * - RBL → Biológico (mantiene GES)
 * - RPS → Psicosocial (mantiene GES)
 * - RFN → Natural (mantiene GES)
 * - CS  → Seguridad (mantiene GES - incluye mecánico/eléctrico/locativo)
 * - RT  → (se elimina, GES se reasignan a Seguridad)
 *
 * NUEVAS CATEGORÍAS (sin GES inicialmente):
 * - Mecánico (MEC)
 * - Eléctrico (ELE)
 * - Factores Humanos (FH)
 * - Locativo (LOC)
 * - Otros Riesgos (OTR)
 * - Saneamiento Básico (SAN)
 * - Salud Pública (SP)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('🔧 [SEED] Actualizando catálogo de riesgos para compliance...');

  // =========================================
  // PASO 1: Actualizar nombres existentes
  // =========================================
  console.log('  → Actualizando nombres de categorías existentes...');

  await knex('catalogo_riesgos')
    .where('codigo', 'RF')
    .update({ nombre: 'Físico' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RB')
    .update({ nombre: 'Biomecánico' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RQ')
    .update({ nombre: 'Químico' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RBL')
    .update({ nombre: 'Biológico' });

  await knex('catalogo_riesgos')
    .where('codigo', 'CS')
    .update({ nombre: 'Seguridad' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RPS')
    .update({ nombre: 'Psicosocial' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RFN')
    .update({ nombre: 'Natural' });

  // =========================================
  // PASO 2: Reasignar GES de "Riesgo Tecnológico" a "Seguridad"
  // =========================================
  console.log('  → Reasignando GES de Riesgo Tecnológico a Seguridad...');

  const rtRow = await knex('catalogo_riesgos')
    .where('codigo', 'RT')
    .first();

  const csRow = await knex('catalogo_riesgos')
    .where('codigo', 'CS')
    .first();

  if (rtRow && csRow) {
    // Reasignar GES de RT a CS
    await knex('catalogo_ges')
      .where('riesgo_id', rtRow.id)
      .update({ riesgo_id: csRow.id });

    // Desactivar categoría RT
    await knex('catalogo_riesgos')
      .where('codigo', 'RT')
      .update({ activo: false });

    console.log(`  ✓ ${rtRow.id} GES reasignados de RT → CS`);
  }

  // =========================================
  // PASO 3: Insertar categorías faltantes
  // =========================================
  console.log('  → Agregando categorías faltantes...');

  // Verificar si ya existen antes de insertar
  const newCategories = [
    { codigo: 'MEC', nombre: 'Mecánico', orden: 11 },
    { codigo: 'ELE', nombre: 'Eléctrico', orden: 12 },
    { codigo: 'FH', nombre: 'Factores Humanos', orden: 13 },
    { codigo: 'LOC', nombre: 'Locativo', orden: 14 },
    { codigo: 'OTR', nombre: 'Otros Riesgos', orden: 15 },
    { codigo: 'SAN', nombre: 'Saneamiento Básico', orden: 16 },
    { codigo: 'SP', nombre: 'Salud Pública', orden: 17 }
  ];

  for (const category of newCategories) {
    const exists = await knex('catalogo_riesgos')
      .where('codigo', category.codigo)
      .first();

    if (!exists) {
      await knex('catalogo_riesgos').insert({
        codigo: category.codigo,
        nombre: category.nombre,
        orden: category.orden,
        activo: true
      });
      console.log(`  ✓ Categoría agregada: ${category.nombre} (${category.codigo})`);
    } else {
      console.log(`  ⚠ Categoría ya existe: ${category.nombre} (${category.codigo})`);
    }
  }

  // =========================================
  // VERIFICACIÓN FINAL
  // =========================================
  const totalCategories = await knex('catalogo_riesgos')
    .where('activo', true)
    .count('* as count')
    .first();

  console.log(`\n✅ [SEED] Actualización completada:`);
  console.log(`   - Total categorías activas: ${totalCategories.count}`);
  console.log(`   - Categorías esperadas: 14`);
  console.log(`   - Estado: ${totalCategories.count >= 14 ? '✓ OK' : '⚠ VERIFICAR'}`);

  // Mostrar distribución de GES
  const distribution = await knex('catalogo_riesgos as cr')
    .leftJoin('catalogo_ges as cg', 'cg.riesgo_id', 'cr.id')
    .where('cr.activo', true)
    .select('cr.codigo', 'cr.nombre', 'cr.orden')
    .count('cg.id as ges_count')
    .groupBy('cr.codigo', 'cr.nombre', 'cr.orden')
    .orderBy('cr.orden');

  console.log('\n📊 Distribución de GES por categoría:');
  distribution.forEach(cat => {
    console.log(`   ${cat.codigo.padEnd(4)} - ${cat.nombre.padEnd(20)} : ${cat.ges_count} GES`);
  });
};

/**
 * Rollback: Restaurar estado anterior
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log('🔄 [ROLLBACK] Restaurando nombres originales...');

  // Restaurar nombres con prefijo "Riesgo"
  await knex('catalogo_riesgos')
    .where('codigo', 'RF')
    .update({ nombre: 'Riesgo Físico' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RB')
    .update({ nombre: 'Riesgo Biomecánico' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RQ')
    .update({ nombre: 'Riesgo Químico' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RBL')
    .update({ nombre: 'Riesgo Biológico' });

  await knex('catalogo_riesgos')
    .where('codigo', 'CS')
    .update({ nombre: 'Condiciones de Seguridad' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RPS')
    .update({ nombre: 'Riesgo Psicosocial' });

  await knex('catalogo_riesgos')
    .where('codigo', 'RFN')
    .update({ nombre: 'Fenómenos Naturales' });

  // Reactivar RT
  await knex('catalogo_riesgos')
    .where('codigo', 'RT')
    .update({ activo: true, nombre: 'Riesgo Tecnológico' });

  // Eliminar categorías nuevas
  await knex('catalogo_riesgos')
    .whereIn('codigo', ['MEC', 'ELE', 'FH', 'LOC', 'OTR', 'SAN', 'SP'])
    .del();

  console.log('✅ [ROLLBACK] Completado');
};
