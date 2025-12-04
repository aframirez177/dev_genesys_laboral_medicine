/**
 * Seed 005: Actualizar GES desde ges-config.js
 *
 * PROPÓSITO:
 * Actualizar los 68 GES importados en seed 001 con sus detalles completos
 * desde el archivo server/src/config/ges-config.js
 *
 * MAPPING:
 * - camelCase (JS config) → snake_case (PostgreSQL)
 * - examenesMedicos → examenes_medicos (JSONB)
 * - aptitudesRequeridas → aptitudes_requeridas (JSONB)
 * - condicionesIncompatibles → condiciones_incompatibles (JSONB)
 * - eppSugeridos → epp_sugeridos (JSONB)
 * - medidasIntervencion → medidas_intervencion (JSONB)
 *
 * ESTRATEGIA:
 * - Buscar GES por nombre exacto (case-sensitive)
 * - Actualizar SOLO si los campos están NULL (no sobrescribir datos manuales)
 * - Preservar codigo, riesgo_id, orden, relevancia_por_sector existentes
 *
 * EJECUCIÓN:
 * npx knex seed:run --specific=005_update_ges_from_config.cjs --knexfile knexfile.js
 */

// Importar el módulo ES usando require + import dinámico
const importGesConfig = async () => {
  const path = require('path');
  const configPath = path.resolve(__dirname, '../../config/ges-config.js');
  const module = await import(`file://${configPath}`);
  return module.GES_DATOS_PREDEFINIDOS;
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  console.log('\n🔄 ========================================');
  console.log('   SEED 005: Actualizar GES desde Config');
  console.log('========================================\n');

  try {
    // 1. Importar GES_DATOS_PREDEFINIDOS desde ges-config.js
    console.log('📥 Importando GES_DATOS_PREDEFINIDOS...');
    const GES_DATOS_PREDEFINIDOS = await importGesConfig();
    const gesCount = Object.keys(GES_DATOS_PREDEFINIDOS).length;
    console.log(`   ✓ ${gesCount} GES cargados desde config\n`);

    // 2. Estadísticas iniciales
    const statsInicial = await knex('catalogo_ges')
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw('COUNT(CASE WHEN consecuencias IS NULL THEN 1 END) as sin_consecuencias'),
        knex.raw('COUNT(CASE WHEN examenes_medicos IS NULL THEN 1 END) as sin_examenes'),
        knex.raw('COUNT(CASE WHEN aptitudes_requeridas IS NULL THEN 1 END) as sin_aptitudes')
      )
      .first();

    console.log('📊 Estado inicial de la base de datos:');
    console.log(`   Total GES: ${statsInicial.total}`);
    console.log(`   Sin consecuencias: ${statsInicial.sin_consecuencias}`);
    console.log(`   Sin exámenes médicos: ${statsInicial.sin_examenes}`);
    console.log(`   Sin aptitudes: ${statsInicial.sin_aptitudes}\n`);

    // 3. Procesar cada GES del config
    let actualizados = 0;
    let noEncontrados = 0;
    let yaCompletos = 0;
    const errores = [];

    console.log('🔄 Procesando actualizaciones...\n');

    for (const [nombreGES, datosGES] of Object.entries(GES_DATOS_PREDEFINIDOS)) {
      try {
        // Buscar GES existente por nombre
        const gesExistente = await knex('catalogo_ges')
          .where({ nombre: nombreGES })
          .first();

        if (!gesExistente) {
          noEncontrados++;
          console.log(`   ⚠️  No encontrado: "${nombreGES}"`);
          continue;
        }

        // Verificar si ya tiene datos completos
        if (
          gesExistente.consecuencias &&
          gesExistente.peor_consecuencia &&
          gesExistente.examenes_medicos &&
          gesExistente.aptitudes_requeridas
        ) {
          yaCompletos++;
          continue; // No sobrescribir datos existentes
        }

        // Preparar datos para actualización (solo campos NULL)
        const updateData = {};

        if (!gesExistente.consecuencias && datosGES.consecuencias) {
          updateData.consecuencias = datosGES.consecuencias;
        }

        if (!gesExistente.peor_consecuencia && datosGES.peorConsecuencia) {
          updateData.peor_consecuencia = datosGES.peorConsecuencia;
        }

        if (!gesExistente.examenes_medicos && datosGES.examenesMedicos) {
          updateData.examenes_medicos = JSON.stringify(datosGES.examenesMedicos);
        }

        if (!gesExistente.aptitudes_requeridas && datosGES.aptitudesRequeridas) {
          updateData.aptitudes_requeridas = JSON.stringify(datosGES.aptitudesRequeridas);
        }

        if (!gesExistente.condiciones_incompatibles && datosGES.condicionesIncompatibles) {
          updateData.condiciones_incompatibles = JSON.stringify(datosGES.condicionesIncompatibles);
        }

        if (!gesExistente.epp_sugeridos && datosGES.eppSugeridos) {
          updateData.epp_sugeridos = JSON.stringify(datosGES.eppSugeridos);
        }

        if (!gesExistente.medidas_intervencion && datosGES.medidasIntervencion) {
          // Convertir camelCase a snake_case para las claves del objeto
          const medidasSnakeCase = {
            eliminacion: datosGES.medidasIntervencion.eliminacion,
            sustitucion: datosGES.medidasIntervencion.sustitucion,
            controles_ingenieria: datosGES.medidasIntervencion.controlesIngenieria,
            controles_administrativos: datosGES.medidasIntervencion.controlesAdministrativos
          };
          updateData.medidas_intervencion = JSON.stringify(medidasSnakeCase);
        }

        // Actualizar solo si hay cambios
        if (Object.keys(updateData).length > 0) {
          await knex('catalogo_ges')
            .where({ id: gesExistente.id })
            .update(updateData);

          actualizados++;
          console.log(`   ✅ Actualizado: "${nombreGES}" (${Object.keys(updateData).length} campos)`);
        }

      } catch (error) {
        errores.push({ nombre: nombreGES, error: error.message });
        console.log(`   ❌ Error en "${nombreGES}": ${error.message}`);
      }
    }

    // 4. Estadísticas finales
    console.log('\n📊 Resultados de la actualización:');
    console.log(`   ✅ Actualizados: ${actualizados} GES`);
    console.log(`   ⏭️  Ya completos (sin cambios): ${yaCompletos} GES`);
    console.log(`   ⚠️  No encontrados en BD: ${noEncontrados} GES`);
    console.log(`   ❌ Errores: ${errores.length}\n`);

    if (noEncontrados > 0) {
      console.log('💡 Los GES no encontrados pueden estar en seeds 002, 003 o 004');
      console.log('   o tener nombres ligeramente diferentes.\n');
    }

    if (errores.length > 0) {
      console.log('❌ Detalle de errores:');
      errores.forEach(err => {
        console.log(`   - ${err.nombre}: ${err.error}`);
      });
      console.log('');
    }

    // 5. Estadísticas post-actualización
    const statsFinal = await knex('catalogo_ges')
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw('COUNT(CASE WHEN consecuencias IS NULL THEN 1 END) as sin_consecuencias'),
        knex.raw('COUNT(CASE WHEN examenes_medicos IS NULL THEN 1 END) as sin_examenes'),
        knex.raw('COUNT(CASE WHEN aptitudes_requeridas IS NULL THEN 1 END) as sin_aptitudes'),
        knex.raw('COUNT(CASE WHEN consecuencias IS NOT NULL AND examenes_medicos IS NOT NULL THEN 1 END) as completos')
      )
      .first();

    console.log('📊 Estado final de la base de datos:');
    console.log(`   Total GES: ${statsFinal.total}`);
    console.log(`   GES completos: ${statsFinal.completos}`);
    console.log(`   Sin consecuencias: ${statsFinal.sin_consecuencias}`);
    console.log(`   Sin exámenes médicos: ${statsFinal.sin_examenes}`);
    console.log(`   Sin aptitudes: ${statsFinal.sin_aptitudes}\n`);

    // 6. Calcular mejora
    const mejora = {
      consecuencias: statsInicial.sin_consecuencias - statsFinal.sin_consecuencias,
      examenes: statsInicial.sin_examenes - statsFinal.sin_examenes,
      aptitudes: statsInicial.sin_aptitudes - statsFinal.sin_aptitudes
    };

    console.log('📈 Mejora lograda:');
    console.log(`   Consecuencias agregadas: +${mejora.consecuencias}`);
    console.log(`   Exámenes médicos agregados: +${mejora.examenes}`);
    console.log(`   Aptitudes agregadas: +${mejora.aptitudes}\n`);

    console.log('✅ SEED 005 completado exitosamente!\n');

    // 7. Recomendaciones
    if (statsFinal.sin_consecuencias > 0) {
      console.log('💡 RECOMENDACIÓN:');
      console.log(`   Aún quedan ${statsFinal.sin_consecuencias} GES sin detalles completos.`);
      console.log('   Estos pueden ser GES de seeds 002, 003 o 004 que no están en ges-config.js');
      console.log('   o tienen nombres que no coinciden exactamente.\n');

      console.log('   Para ver cuáles faltan, ejecuta:');
      console.log('   SELECT nombre, codigo FROM catalogo_ges WHERE consecuencias IS NULL;\n');
    }

  } catch (error) {
    console.error('\n❌ Error fatal en seed 005:', error);
    throw error;
  }
};
