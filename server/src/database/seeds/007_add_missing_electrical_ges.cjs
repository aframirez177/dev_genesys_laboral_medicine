/**
 * Seed 007: Agregar GES Eléctricos Faltantes
 *
 * PROPÓSITO:
 * Agregar los 3 GES eléctricos específicos que existen en ges-config.js
 * pero no están en la BD porque fueron combinados en un solo GES genérico.
 *
 * GES A AGREGAR:
 * 1. Media tensión (instalaciones eléctricas locativas)
 * 2. Baja tensión (instalaciones eléctricas locativas)
 * 3. Electricidad estática
 *
 * CONTEXTO:
 * - Seed 001 creó: "Riesgo eléctrico (alta y baja tensión, estática)" (genérico)
 * - Seed 004 agregó: Contacto eléctrico directo + Arco eléctrico
 * - ges-config.js tiene: Alta, Media, Baja tensión + Electricidad estática (separados)
 *
 * Este seed agrega los 3 que faltan para tener la granularidad completa.
 *
 * EJECUCIÓN:
 * npx knex seed:run --specific=007_add_missing_electrical_ges.cjs --knexfile knexfile.js
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
  console.log('\n⚡ ========================================');
  console.log('   SEED 007: GES Eléctricos Faltantes');
  console.log('========================================\n');

  try {
    // 1. Importar config
    console.log('📥 Importando GES_DATOS_PREDEFINIDOS...');
    const GES_DATOS_PREDEFINIDOS = await importGesConfig();
    console.log('   ✓ Config cargado\n');

    // 2. Obtener ID de categoría Condiciones de Seguridad
    const riesgoCS = await knex('catalogo_riesgos')
      .where({ codigo: 'CS' })
      .first();

    if (!riesgoCS) {
      throw new Error('Categoría CS (Condiciones de Seguridad) no encontrada');
    }

    console.log(`📊 Categoría CS encontrada: ID ${riesgoCS.id}\n`);

    // 3. Obtener orden actual máximo en CS
    const maxOrden = await knex('catalogo_ges')
      .where({ riesgo_id: riesgoCS.id })
      .max('orden as max_orden')
      .first();

    let ordenActual = (maxOrden?.max_orden || 0) + 1;

    console.log(`📊 Próximo orden en CS: ${ordenActual}\n`);

    // 4. Verificar si ya existen (por si se ejecutó antes)
    const existentes = await knex('catalogo_ges')
      .whereIn('codigo', ['CS-MEDIA-TENS', 'CS-BAJA-TENS', 'CS-ELEC-ESTAT'])
      .select('codigo');

    if (existentes.length > 0) {
      console.log('⚠️  Algunos GES ya existen:');
      existentes.forEach(ges => console.log(`   - ${ges.codigo}`));
      console.log('\n❌ Abortando para evitar duplicados.');
      console.log('💡 Si quieres reejecutar, elimina primero:');
      console.log("   DELETE FROM catalogo_ges WHERE codigo IN ('CS-MEDIA-TENS', 'CS-BAJA-TENS', 'CS-ELEC-ESTAT');\n");
      return;
    }

    // 5. Preparar GES eléctricos
    const gesElectricos = [];

    // ========================================
    // GES 1: MEDIA TENSIÓN
    // ========================================
    const datosMediaTension = GES_DATOS_PREDEFINIDOS["Media tensión debido a instalaciones eléctricas locativas y estáticas"];

    if (datosMediaTension) {
      gesElectricos.push({
        riesgo_id: riesgoCS.id,
        codigo: 'CS-MEDIA-TENS',
        nombre: 'Media tensión - Instalaciones eléctricas (1 kV - 36 kV)',
        consecuencias: datosMediaTension.consecuencias,
        peor_consecuencia: datosMediaTension.peorConsecuencia,
        examenes_medicos: JSON.stringify(datosMediaTension.examenesMedicos),
        aptitudes_requeridas: JSON.stringify(datosMediaTension.aptitudesRequeridas),
        condiciones_incompatibles: JSON.stringify(datosMediaTension.condicionesIncompatibles),
        epp_sugeridos: JSON.stringify(datosMediaTension.eppSugeridos),
        medidas_intervencion: JSON.stringify({
          eliminacion: datosMediaTension.medidasIntervencion.eliminacion,
          sustitucion: datosMediaTension.medidasIntervencion.sustitucion,
          controles_ingenieria: datosMediaTension.medidasIntervencion.controlesIngenieria,
          controles_administrativos: datosMediaTension.medidasIntervencion.controlesAdministrativos
        }),
        relevancia_por_sector: JSON.stringify({
          servicios_publicos: 10,
          manufactura: 8,
          metalmecanica: 8,
          mineria: 7,
          construccion: 6,
          oficina: 3,
          tecnologia: 3,
          comercio: 2
        }),
        es_comun: false,
        orden: ordenActual++,
        activo: true
      });
      console.log('   ✅ Preparado: Media tensión');
    } else {
      console.log('   ⚠️  No encontrado en config: Media tensión');
    }

    // ========================================
    // GES 2: BAJA TENSIÓN
    // ========================================
    const datosBajaTension = GES_DATOS_PREDEFINIDOS["Baja tensión debido a instalaciones eléctricas locativas y estáticas"];

    if (datosBajaTension) {
      gesElectricos.push({
        riesgo_id: riesgoCS.id,
        codigo: 'CS-BAJA-TENS',
        nombre: 'Baja tensión - Instalaciones eléctricas (<1 kV)',
        consecuencias: datosBajaTension.consecuencias,
        peor_consecuencia: datosBajaTension.peorConsecuencia,
        examenes_medicos: JSON.stringify(datosBajaTension.examenesMedicos),
        aptitudes_requeridas: JSON.stringify(datosBajaTension.aptitudesRequeridas),
        condiciones_incompatibles: JSON.stringify(datosBajaTension.condicionesIncompatibles),
        epp_sugeridos: JSON.stringify(datosBajaTension.eppSugeridos),
        medidas_intervencion: JSON.stringify({
          eliminacion: datosBajaTension.medidasIntervencion.eliminacion,
          sustitucion: datosBajaTension.medidasIntervencion.sustitucion,
          controles_ingenieria: datosBajaTension.medidasIntervencion.controlesIngenieria,
          controles_administrativos: datosBajaTension.medidasIntervencion.controlesAdministrativos
        }),
        relevancia_por_sector: JSON.stringify({
          oficina: 9,
          comercio: 9,
          tecnologia: 8,
          educacion: 8,
          salud: 8,
          hoteleria: 8,
          manufactura: 9,
          construccion: 10,
          call_center: 7
        }),
        es_comun: true, // Muy común en todos los sectores
        orden: ordenActual++,
        activo: true
      });
      console.log('   ✅ Preparado: Baja tensión');
    } else {
      console.log('   ⚠️  No encontrado en config: Baja tensión');
    }

    // ========================================
    // GES 3: ELECTRICIDAD ESTÁTICA
    // ========================================
    const datosElectEstatic = GES_DATOS_PREDEFINIDOS["Electricidad estática"];

    if (datosElectEstatic) {
      gesElectricos.push({
        riesgo_id: riesgoCS.id,
        codigo: 'CS-ELEC-ESTAT',
        nombre: 'Electricidad estática - Acumulación de cargas',
        consecuencias: datosElectEstatic.consecuencias,
        peor_consecuencia: datosElectEstatic.peorConsecuencia,
        examenes_medicos: JSON.stringify(datosElectEstatic.examenesMedicos),
        aptitudes_requeridas: JSON.stringify(datosElectEstatic.aptitudesRequeridas),
        condiciones_incompatibles: JSON.stringify(datosElectEstatic.condicionesIncompatibles),
        epp_sugeridos: JSON.stringify(datosElectEstatic.eppSugeridos),
        medidas_intervencion: JSON.stringify({
          eliminacion: datosElectEstatic.medidasIntervencion.eliminacion,
          sustitucion: datosElectEstatic.medidasIntervencion.sustitucion,
          controles_ingenieria: datosElectEstatic.medidasIntervencion.controlesIngenieria,
          controles_administrativos: datosElectEstatic.medidasIntervencion.controlesAdministrativos
        }),
        relevancia_por_sector: JSON.stringify({
          manufactura: 9,
          metalmecanica: 9,
          tecnologia: 8,
          salud: 7,
          oficina: 5,
          comercio: 5,
          mineria: 6,
          servicios_publicos: 7
        }),
        es_comun: false,
        orden: ordenActual++,
        activo: true
      });
      console.log('   ✅ Preparado: Electricidad estática\n');
    } else {
      console.log('   ⚠️  No encontrado en config: Electricidad estática\n');
    }

    // 6. Insertar GES
    if (gesElectricos.length === 0) {
      console.log('❌ No se pudieron preparar GES. Verifica ges-config.js\n');
      return;
    }

    console.log(`📋 Insertando ${gesElectricos.length} GES eléctricos...\n`);

    await knex('catalogo_ges').insert(gesElectricos);

    console.log('✅ GES insertados exitosamente!\n');

    // 7. Estadísticas finales
    const statsTotal = await knex('catalogo_ges')
      .where({ activo: true })
      .count('* as total')
      .first();

    const statsCS = await knex('catalogo_ges')
      .where({ riesgo_id: riesgoCS.id, activo: true })
      .count('* as total')
      .first();

    console.log('📊 Estadísticas finales:');
    console.log(`   Total GES en BD: ${statsTotal.total}`);
    console.log(`   Total GES en CS: ${statsCS.total}`);
    console.log(`   GES eléctricos agregados: ${gesElectricos.length}\n`);

    // 8. Listar todos los GES eléctricos ahora en BD
    const todosElectricos = await knex('catalogo_ges')
      .where({ riesgo_id: riesgoCS.id })
      .where('nombre', 'ilike', '%eléctric%')
      .orWhere('nombre', 'ilike', '%tensión%')
      .orWhere('codigo', 'like', '%ELEC%')
      .orWhere('codigo', 'like', '%TENS%')
      .select('codigo', 'nombre')
      .orderBy('codigo');

    console.log('⚡ GES Eléctricos completos en BD:');
    todosElectricos.forEach(ges => {
      console.log(`   ${ges.codigo}: ${ges.nombre}`);
    });
    console.log('');

    console.log('✅ SEED 007 completado!\n');
    console.log('💡 Total esperado: 122 + 3 = 125 GES\n');

  } catch (error) {
    console.error('\n❌ Error fatal en seed 007:', error);
    throw error;
  }
};
