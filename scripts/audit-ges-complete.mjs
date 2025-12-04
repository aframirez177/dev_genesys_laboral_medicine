/**
 * Auditoría Completa del Catálogo GES
 * Ejecutar: node scripts/audit-ges-complete.mjs
 */

import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

// Categorías esperadas según form_matriz_riesgos_prof.js
const EXPECTED_CATEGORIES = [
  'Mecánico', 'Eléctrico', 'Físico', 'Químico', 'Biológico',
  'Biomecánico', 'Factores Humanos', 'Psicosocial', 'Locativo',
  'Natural', 'Seguridad', 'Otros Riesgos', 'Saneamiento Básico',
  'Salud Pública'
];

async function auditCatalogo() {
  console.log('━'.repeat(80));
  console.log('  AUDITORÍA COMPLETA: CATÁLOGO GES');
  console.log('━'.repeat(80));
  console.log('');

  try {
    // 1. COUNT por CATEGORÍA DE RIESGO (JOIN con catalogo_riesgos)
    const counts = await db('catalogo_ges as g')
      .join('catalogo_riesgos as r', 'g.riesgo_id', 'r.id')
      .select('r.nombre as categoria', 'r.codigo')
      .count('g.id as total')
      .where('g.activo', true)
      .groupBy('r.id', 'r.nombre', 'r.codigo')
      .orderBy('total', 'desc');

    console.log('1️⃣  COUNT DE GES POR CATEGORÍA DE RIESGO:');
    console.log('━'.repeat(80));
    console.log('Código | Categoría                      | Total GES');
    console.log('━'.repeat(80));
    counts.forEach(row => {
      const codigo = row.codigo.padEnd(6);
      const categoria = row.categoria.padEnd(30);
      console.log(`${codigo} | ${categoria} | ${row.total}`);
    });

    // 2. Categorías esperadas vs existentes
    console.log('');
    console.log('2️⃣  CATEGORÍAS FALTANTES (según form_matriz_riesgos_prof.js):');
    console.log('━'.repeat(80));

    const existingCategories = counts.map(c => c.categoria);
    const missing = EXPECTED_CATEGORIES.filter(cat => !existingCategories.includes(cat));

    if (missing.length === 0) {
      console.log('✅ Todas las categorías están presentes');
    } else {
      console.log(`❌ Faltan ${missing.length} categorías:`);
      missing.forEach(cat => console.log(`   - ${cat}`));
    }

    // 3. Categorías con 0 GES
    console.log('');
    console.log('3️⃣  CATEGORÍAS CON MENOS DE 3 GES (crítico):');
    console.log('━'.repeat(80));
    const criticalCounts = counts.filter(row => parseInt(row.total) < 3);
    if (criticalCounts.length === 0) {
      console.log('✅ Todas las categorías tienen al menos 3 GES');
    } else {
      criticalCounts.forEach(row => {
        const status = parseInt(row.total) === 0 ? '🔴' : '⚠️ ';
        console.log(`${status} ${row.categoria.padEnd(30)} | ${row.total} GES`);
      });
    }

    // 4. Duplicados exactos (mismo nombre)
    console.log('');
    console.log('4️⃣  DUPLICADOS POR NOMBRE:');
    console.log('━'.repeat(80));
    const duplicates = await db('catalogo_ges')
      .select('nombre')
      .count('* as total')
      .where('activo', true)
      .groupBy('nombre')
      .having(db.raw('count(*) > 1'))
      .orderBy('total', 'desc');

    if (duplicates.length === 0) {
      console.log('✅ No hay nombres duplicados');
    } else {
      console.log(`❌ Se encontraron ${duplicates.length} nombres duplicados:`);
      duplicates.forEach(dup => {
        console.log(`   "${dup.nombre}" (${dup.total} veces)`);
      });
    }

    // 5. GES sin detalles completos
    console.log('');
    console.log('5️⃣  GES SIN DETALLES COMPLETOS:');
    console.log('━'.repeat(80));

    const incomplete = await db('catalogo_ges')
      .where('activo', true)
      .andWhere(function() {
        this.whereNull('consecuencias')
          .orWhereNull('peor_consecuencia')
          .orWhereNull('examenes_medicos');
      })
      .count('* as total');

    const total = await db('catalogo_ges').where('activo', true).count('* as total');
    const incompleteCount = parseInt(incomplete[0].total);
    const totalCount = parseInt(total[0].total);
    const completeness = ((totalCount - incompleteCount) / totalCount * 100).toFixed(1);

    console.log(`GES incompletos: ${incompleteCount}/${totalCount} (${completeness}% completos)`);

    // 6. Verificar GES específicos del frontend
    console.log('');
    console.log('6️⃣  VERIFICACIÓN DE GES DEL FRONTEND:');
    console.log('━'.repeat(80));

    // Ejemplos de GES críticos del frontend
    const criticalGES = [
      'Caídas al mismo nivel',
      'Caídas de altura',
      'Ruido',
      'Iluminación deficiente',
      'Posturas prolongadas y/o incorrectas',
      'Movimientos repetitivos (6 o más por minuto)',
      'Deslizamientos',
      'Sismo - Terremotos',
      'Secuestros',
      'Hurtos - Robos - Atracos'
    ];

    for (const gesName of criticalGES) {
      const exists = await db('catalogo_ges')
        .where('nombre', 'ilike', `%${gesName}%`)
        .where('activo', true)
        .first();

      const status = exists ? '✅' : '❌';
      const found = exists ? `(ID: ${exists.id})` : '(NO ENCONTRADO)';
      console.log(`${status} ${gesName.padEnd(50)} ${found}`);
    }

    // 7. Total general
    console.log('');
    console.log('━'.repeat(80));
    console.log(`TOTAL GES ACTIVOS EN BD: ${totalCount}`);
    console.log(`CATEGORÍAS EXISTENTES: ${counts.length}`);
    console.log(`CATEGORÍAS FALTANTES: ${missing.length}`);
    console.log(`DUPLICADOS DETECTADOS: ${duplicates.length}`);
    console.log(`COMPLETITUD: ${completeness}%`);
    console.log('━'.repeat(80));

    // 8. GENERAR RECOMENDACIONES
    console.log('');
    console.log('📋 RECOMENDACIONES:');
    console.log('━'.repeat(80));

    if (missing.length > 0) {
      console.log('🔴 CRÍTICO: Faltan categorías completas:');
      missing.forEach(cat => console.log(`   - Agregar GES para: ${cat}`));
      console.log('');
    }

    if (criticalCounts.length > 0) {
      console.log('⚠️  ALTA PRIORIDAD: Categorías con pocos GES:');
      criticalCounts.forEach(row => {
        console.log(`   - ${row.categoria}: agregar al menos ${3 - parseInt(row.total)} GES más`);
      });
      console.log('');
    }

    if (duplicates.length > 0) {
      console.log('⚠️  DUPLICADOS: Revisar y consolidar:');
      console.log(`   - ${duplicates.length} GES tienen nombres duplicados`);
      console.log('');
    }

    if (incompleteCount > 0) {
      console.log('📝 CALIDAD DE DATOS: Completar información:');
      console.log(`   - ${incompleteCount} GES sin datos completos`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error en auditoría:', error.message);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Ejecutar
auditCatalogo();
