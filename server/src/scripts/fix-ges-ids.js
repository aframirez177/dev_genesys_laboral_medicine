/**
 * Script para vincular riesgos_cargo con catalogo_ges
 *
 * Problema: Los riesgos tienen ges_id = null, necesitamos buscarlos por nombre
 * y actualizar el ges_id para que el JOIN funcione
 */

import db from '../config/database.js';

async function fixGesIds() {
    console.log('🔧 Iniciando actualización de ges_id en riesgos_cargo...\n');

    try {
        // 1. Obtener todos los riesgos sin ges_id
        const riesgosSinGes = await db('riesgos_cargo')
            .whereNull('ges_id')
            .select('id', 'descripcion_riesgo', 'tipo_riesgo');

        console.log(`📊 Encontrados ${riesgosSinGes.length} riesgos sin ges_id\n`);

        if (riesgosSinGes.length === 0) {
            console.log('✅ Todos los riesgos ya tienen ges_id asignado');
            process.exit(0);
        }

        let updated = 0;
        let notFound = 0;

        // 2. Para cada riesgo, buscar en catalogo_ges
        for (const riesgo of riesgosSinGes) {
            // Buscar por nombre exacto en catalogo_ges
            const gesMatch = await db('catalogo_ges')
                .where('nombre', riesgo.descripcion_riesgo)
                .first();

            if (gesMatch) {
                // Actualizar ges_id
                await db('riesgos_cargo')
                    .where('id', riesgo.id)
                    .update({ ges_id: gesMatch.id });

                console.log(`✅ Riesgo "${riesgo.descripcion_riesgo}" → GES ID ${gesMatch.id}`);
                updated++;
            } else {
                console.log(`⚠️  Riesgo "${riesgo.descripcion_riesgo}" NO encontrado en catálogo GES`);
                notFound++;
            }
        }

        console.log(`\n📈 Resumen:`);
        console.log(`   ✅ Actualizados: ${updated}`);
        console.log(`   ⚠️  No encontrados: ${notFound}`);
        console.log(`   📊 Total procesados: ${riesgosSinGes.length}`);

        if (notFound > 0) {
            console.log(`\n⚠️  NOTA: ${notFound} riesgos no se encontraron en el catálogo GES.`);
            console.log(`   Esto puede ser normal si son riesgos personalizados.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al actualizar ges_id:', error);
        process.exit(1);
    }
}

// Ejecutar script
fixGesIds();
