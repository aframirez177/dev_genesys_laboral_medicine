/**
 * Verificar GES faltantes vs Frontend
 */

import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

// GES del frontend (form_matriz_riesgos_prof.js)
const GES_FRONTEND = {
  Natural: [
    'Deslizamientos',
    'Inundación',
    'Sismo - Terremotos',
    'Tormentas eléctricas',
    'Lluvias granizadas'
  ],
  'Riesgo Tecnológico': [
    'Trabajos en caliente',
    'Explosión',
    'Incendio'
  ],
  Seguridad: [
    'Secuestros',
    'Amenazas',
    'Hurtos - Robos - Atracos',
    'Accidente de Tránsito',
    'Desorden público - Atentados',
    'Extorsión'
  ],
  'Saneamiento Básico': [
    'Sin disponibilidad de agua potable'
  ],
  Biomecánico: [
    'Manejo de cargas mayores a 25 Kg (Hombres)',
    'Manejo de cargas mayores a 12.5 Kg (Mujeres)',
    'Adopción de posturas nocivas',
    'Movimientos repetitivos (6 o más por minuto)',
    'Diseño del puesto de trabajo inadecuado',
    'Posturas prolongadas y/o incorrectas'
  ],
  Físico: [
    'Iluminación deficiente',
    'Iluminación en exceso',
    'Ruido',
    'Temperaturas extremas: calor',
    'Temperaturas extremas: frío',
    'Vibraciones mano-cuerpo',
    'Vibraciones cuerpo completo'
  ]
};

async function checkMissingGES() {
  console.log('━'.repeat(80));
  console.log('  VERIFICACIÓN DETALLADA: GES FRONTEND VS BD');
  console.log('━'.repeat(80));
  console.log('');

  try {
    for (const [categoria, gesLista] of Object.entries(GES_FRONTEND)) {
      console.log(`\n📂 ${categoria}:`);
      console.log('━'.repeat(70));

      for (const gesName of gesLista) {
        // Buscar por coincidencia parcial (ILIKE)
        const exists = await db('catalogo_ges')
          .where('nombre', 'ilike', `%${gesName}%`)
          .where('activo', true)
          .first();

        const status = exists ? '✅' : '❌';
        const details = exists
          ? `(ID: ${exists.id}, código: ${exists.codigo || 'NULL'})`
          : '(NO ENCONTRADO)';

        console.log(`${status} ${gesName.padEnd(55)} ${details}`);
      }
    }

    // Buscar con más flexibilidad
    console.log('\n\n🔍 BÚSQUEDA ALTERNATIVA (coincidencias parciales):');
    console.log('━'.repeat(80));

    const problematicGES = [
      { frontend: 'Sismo - Terremotos', searchTerms: ['sismo', 'terremoto'] },
      { frontend: 'Iluminación deficiente', searchTerms: ['iluminación', 'iluminacion', 'deficiente'] },
      { frontend: 'Posturas prolongadas y/o incorrectas', searchTerms: ['posturas prolongadas', 'posturas incorrectas'] },
      { frontend: 'Movimientos repetitivos (6 o más por minuto)', searchTerms: ['movimientos repetitivos', 'repetitivos'] },
      { frontend: 'Hurtos - Robos - Atracos', searchTerms: ['hurto', 'robo', 'atraco'] },
      { frontend: 'Secuestros', searchTerms: ['secuestro'] }
    ];

    for (const { frontend, searchTerms } of problematicGES) {
      console.log(`\n"${frontend}":`);

      for (const term of searchTerms) {
        const results = await db('catalogo_ges')
          .where('nombre', 'ilike', `%${term}%`)
          .where('activo', true)
          .select('id', 'nombre', 'codigo');

        if (results.length > 0) {
          console.log(`  🔎 "${term}" →`);
          results.forEach(r => {
            console.log(`     - [${r.codigo || 'NULL'}] ${r.nombre} (ID: ${r.id})`);
          });
        } else {
          console.log(`  ❌ "${term}" → No encontrado`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await db.destroy();
  }
}

checkMissingGES();
