/**
 * Script para verificar GES faltantes comparando BD vs frontend
 * Compara los GES en form_matriz_riesgos_prof.js con los de la BD
 */

import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

// Lista de GES del frontend (copiada de form_matriz_riesgos_prof.js)
const GES_FRONTEND = {
  Mecánico: [
    "Caídas al mismo nivel",
    "Caídas de altura",
    "Posibilidad de atrapamiento",
    "Posibilidad de ser golpeado por objetos que caen o en movimiento",
    "Posibilidad de proyección de partículas o fluidos a presión",
    "Posibilidad de perforación o de punzonamiento",
    "Posibilidad de corte o seccionamiento",
  ],
  Eléctrico: [
    "Alta tensión debido a instalaciones eléctricas locativas y estáticas",
    "Media tensión debido a instalaciones eléctricas locativas y estáticas",
    "Baja tensión debido a instalaciones eléctricas locativas y estáticas",
    "Electricidad estática",
  ],
  Físico: [
    "Iluminación deficiente",
    "Iluminación en exceso",
    "Presiones anormales",
    "Radiaciones ionizantes",
    "Radiaciones no ionizantes",
    "Radiaciones por equipos audiovisuales",
    "Ruido",
    "Temperaturas extremas: calor",
    "Temperaturas extremas: frío",
    "Vibraciones mano-cuerpo",
    "Vibraciones cuerpo completo",
    "Cambios bruscos de temperatura",
    "Humedad Relativa (Vapor de agua)",
  ],
  Químico: [
    "Exposición a gases vapores humos polvos no tóxicos",
    "Exposición a gases vapores humos polvos tóxicos",
    "Exposición sustancias químicas líquidas tóxicas",
    "Exposición sustancias químicas líquidas no tóxicas",
    "Exposición a sustancias químicas que generan efectos en el organismo",
  ],
  Biológico: [
    "Presencia de animales/vectores transmisores de enfermedad",
    "Exposición a material contaminado o con riesgo biológico",
    "Manipulación de alimentos",
    "Exposición a microorganismos",
    "Exposición a Virus",
    "Exposición a Bacterias",
  ],
  Biomecánico: [
    "Manejo de cargas mayores a 25 Kg (Hombres)",
    "Manejo de cargas mayores a 12.5 Kg (Mujeres)",
    "Adopción de posturas nocivas",
    "Movimientos repetitivos (6 o más por minuto)",
    "Diseño del puesto de trabajo inadecuado",
    "Posturas prolongadas y/o incorrectas",
  ],
  "Factores Humanos": [
    "Competencias no definidas para el cargo",
    "Actos inseguros observados",
  ],
  Psicosocial: [
    "Atención de público",
    "Monotonía/repetitividad de funciones",
    "Trabajo bajo presión",
  ],
  Locativo: [
    "Almacenamiento inadecuado",
    "Condiciones inadecuadas de orden y aseo",
    "Condiciones del piso",
    "Escaleras y barandas inadecuadas o mal estado",
    "Condiciones de las instalaciones",
  ],
  Natural: [
    "Deslizamientos",
    "Inundación",
    "Sismo - Terremotos",
    "Tormentas eléctricas",
    "Lluvias granizadas",
  ],
  Seguridad: [
    "Secuestros",
    "Amenazas",
    "Hurtos - Robos - Atracos",
    "Accidente de Tránsito",
    "Desorden público - Atentados",
    "Extorsión",
  ],
  "Otros Riesgos": ["Trabajos en caliente", "Explosión", "Incendio"],
  "Saneamiento Básico": ["Sin disponibilidad de agua potable"],
  "Salud Pública": [
    "Enfermedades endémicas",
    "Mordedura y Picadura de Animales",
  ],
};

async function verificarGESFaltantes() {
  console.log('\n🔍 ========================================');
  console.log('   Verificando GES: Frontend vs BD');
  console.log('========================================\n');

  try {
    // 1. Obtener todos los GES de la BD
    const gesBD = await db('catalogo_ges')
      .where({ activo: true })
      .select('nombre', 'codigo');

    const nombresBD = new Set(gesBD.map(g => g.nombre.trim()));

    console.log(`📊 Total GES en BD: ${gesBD.length}`);
    console.log(`📋 Total GES en frontend: ${Object.values(GES_FRONTEND).flat().length}\n`);

    // 2. Buscar GES del frontend que NO están en BD
    const faltantes = [];
    const encontrados = [];

    for (const [categoria, gesLista] of Object.entries(GES_FRONTEND)) {
      for (const nombreGES of gesLista) {
        const existe = nombresBD.has(nombreGES.trim());

        if (!existe) {
          faltantes.push({ categoria, nombre: nombreGES });
        } else {
          encontrados.push({ categoria, nombre: nombreGES });
        }
      }
    }

    // 3. Reportar resultados
    console.log('✅ GES ENCONTRADOS EN BD:');
    console.log(`   Total: ${encontrados.length}\n`);

    if (faltantes.length > 0) {
      console.log('❌ GES FALTANTES EN BD:');
      console.log(`   Total: ${faltantes.length}\n`);

      const faltantesPorCategoria = {};
      faltantes.forEach(({ categoria, nombre }) => {
        if (!faltantesPorCategoria[categoria]) {
          faltantesPorCategoria[categoria] = [];
        }
        faltantesPorCategoria[categoria].push(nombre);
      });

      for (const [categoria, gesLista] of Object.entries(faltantesPorCategoria)) {
        console.log(`\n📂 ${categoria} (${gesLista.length} faltantes):`);
        gesLista.forEach(nombre => {
          console.log(`   ❌ ${nombre}`);
        });
      }

      console.log('\n\n📊 RESUMEN POR CATEGORÍA:\n');
      console.log('Categoría                 | Frontend | BD    | Faltantes');
      console.log('─'.repeat(65));

      for (const [categoria, gesLista] of Object.entries(GES_FRONTEND)) {
        const totalFrontend = gesLista.length;
        const faltantesCategoria = faltantesPorCategoria[categoria]?.length || 0;
        const enBD = totalFrontend - faltantesCategoria;

        console.log(
          `${categoria.padEnd(25)} | ${String(totalFrontend).padEnd(8)} | ${String(enBD).padEnd(5)} | ${faltantesCategoria}`
        );
      }

    } else {
      console.log('✅ ¡PERFECTO! Todos los GES del frontend están en la BD\n');
    }

    // 4. Buscar GES en BD que NO están en frontend (extras)
    const todosNombresFrontend = new Set(Object.values(GES_FRONTEND).flat().map(n => n.trim()));
    const gesExtras = gesBD.filter(g => !todosNombresFrontend.has(g.nombre.trim()) && g.codigo);

    if (gesExtras.length > 0) {
      console.log('\n\n📦 GES EXTRAS EN BD (no en frontend):');
      console.log(`   Total: ${gesExtras.length}\n`);
      gesExtras.forEach(ges => {
        console.log(`   + [${ges.codigo}] ${ges.nombre}`);
      });
    }

    console.log('\n✅ Análisis completado!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

verificarGESFaltantes();
