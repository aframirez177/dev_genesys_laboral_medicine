/**
 * Script para identificar GES sin detalles completos
 * Genera lista para mapeo manual con ges-config.js
 */

import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function checkGESWithoutDetails() {
  console.log('\n📊 Analizando GES sin detalles completos...\n');

  try {
    // Obtener GES sin consecuencias (campo clave para "completo")
    const gesIncompletos = await db('catalogo_ges')
      .select('id', 'codigo', 'nombre', 'riesgo_id')
      .whereNull('consecuencias')
      .orderBy('nombre');

    console.log(`Total GES sin detalles: ${gesIncompletos.length}\n`);
    console.log('═'.repeat(80));
    console.log('ID  | Código          | Nombre');
    console.log('═'.repeat(80));

    gesIncompletos.forEach(ges => {
      console.log(`${String(ges.id).padEnd(4)}| ${String(ges.codigo || 'NULL').padEnd(16)}| ${ges.nombre}`);
    });

    console.log('═'.repeat(80));
    console.log(`\nTotal: ${gesIncompletos.length} GES\n`);

    // Exportar lista para análisis
    const nombres = gesIncompletos.map(g => g.nombre);
    console.log('\n📋 Lista de nombres para mapeo:\n');
    console.log(JSON.stringify(nombres, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

checkGESWithoutDetails();
