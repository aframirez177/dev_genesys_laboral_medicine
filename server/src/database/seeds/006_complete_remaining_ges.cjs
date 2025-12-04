/**
 * Seed 006: Completar los 53 GES restantes sin detalle
 *
 * PROPÓSITO:
 * Completar los GES que no se pudieron mapear en seed 005 debido a diferencias
 * en los nombres entre la BD y ges-config.js
 *
 * ESTRATEGIA:
 * - Mapeo manual preciso BD → Config
 * - Algunos GES de BD combinan varios del config (ej: "Iluminación inadecuada" = "deficiente" + "en exceso")
 * - Para esos casos, usamos los datos del config más relevante
 *
 * EJECUCIÓN:
 * npx knex seed:run --specific=006_complete_remaining_ges.cjs --knexfile knexfile.js
 */

// Importar el módulo ES usando require + import dinámico
const importGesConfig = async () => {
  const path = require('path');
  const configPath = path.resolve(__dirname, '../../config/ges-config.js');
  const module = await import(`file://${configPath}`);
  return module.GES_DATOS_PREDEFINIDOS;
};

/**
 * Mapeo manual: Nombre en BD → Nombre en ges-config.js
 * Cuando hay múltiples opciones, se elige la más relevante
 */
const NOMBRE_MAPEO = {
  // Riesgos Físicos
  "Ruido (continuo, intermitente, impacto)": "Ruido",
  "Vibraciones (cuerpo entero, segmentaria)": "Vibraciones cuerpo completo",
  "Vibraciones de cuerpo entero (VCE) - Vehículos, maquinaria pesada": "Vibraciones cuerpo completo",
  "Iluminación inadecuada (deficiente o en exceso)": "Iluminación deficiente",
  "Temperaturas extremas (calor o frío)": "Temperaturas extremas: calor",
  "Presión atmosférica (alta o baja)": "Presiones anormales",
  "Presión atmosférica anormal - Hipobaria (alturas) o Hiperbaria (buceo, túneles)": "Presiones anormales",
  "Radiaciones ionizantes (rayos X, gamma, beta, alfa)": "Radiaciones ionizantes",
  "Radiaciones no ionizantes (UV, IR, microondas, radiofrecuencias, láser)": "Radiaciones no ionizantes",
  "Radiación ultravioleta (UV) - Exposición solar": "Radiaciones no ionizantes",
  "Radiación infrarroja (IR) - Exposición a calor radiante": "Radiaciones no ionizantes",
  "Campos electromagnéticos (CEM) - Radiofrecuencias, microondas": "Radiaciones por equipos audiovisuales",
  "Laser - Radiación láser (clases 3R, 3B, 4)": "Radiaciones no ionizantes",

  // Riesgos Biomecánicos
  "Posturas prolongadas y mantenidas": "Posturas prolongadas y/o incorrectas",
  "Movimientos repetitivos": "Movimientos repetitivos (6 o más por minuto)",
  "Manipulación manual de cargas": "Manejo de cargas mayores a 25 Kg (Hombres)",
  "Carga física - Levantamiento manual de cargas": "Manejo de cargas mayores a 25 Kg (Hombres)",
  "Esfuerzos y movimientos con cargas": "Manejo de cargas mayores a 25 Kg (Hombres)",
  "Posiciones forzadas y gestos repetitivos": "Adopción de posturas nocivas",
  "Bipedestación prolongada - Permanencia de pie estática": "Posturas prolongadas y/o incorrectas",
  "Trabajo con pantalla de visualización de datos (PVD) - Más de 4 horas/día": "Radiaciones por equipos audiovisuales",
  "Digitación prolongada o uso intensivo de teclado/mouse - Más de 4 horas/día": "Movimientos repetitivos (6 o más por minuto)",

  // Riesgos Químicos
  "Polvos y fibras": "Exposición a gases vapores humos polvos no tóxicos",
  "Gases y vapores": "Exposición a gases vapores humos polvos tóxicos",
  "Líquidos (nieblas y rocíos)": "Exposición sustancias químicas líquidas tóxicas",
  "Humos metálicos o no metálicos": "Exposición a gases vapores humos polvos tóxicos",
  "Material particulado": "Exposición a gases vapores humos polvos tóxicos",
  "Material particulado - Polvo de sílice, madera, metales": "Exposición a gases vapores humos polvos tóxicos",
  "Solventes orgánicos - Exposición a benceno, tolueno, xileno": "Exposición sustancias químicas líquidas tóxicas",
  "Plaguicidas y agroquímicos - Herbicidas, insecticidas, fungicidas": "Exposición a sustancias químicas que generan efectos en el organismo",

  // Riesgos Biológicos
  "Virus, bacterias, hongos": "Exposición a Virus",
  "Fluidos corporales y material biológico": "Exposición a material contaminado o con riesgo biológico",
  "Animales, plantas y derivados": "Presencia de animales/vectores transmisores de enfermedad",

  // Condiciones de Seguridad
  "Riesgo eléctrico (alta y baja tensión, estática)": "Alta tensión debido a instalaciones eléctricas locativas y estáticas",
  "Trabajo en alturas": "Caídas de altura",
  "Tránsito (desplazamientos en vía pública o internos)": "Accidente de Tránsito",
  "Espacios confinados": "Condiciones de las instalaciones",

  // Riesgos Psicosociales
  "Estrés laboral": "Trabajo bajo presión",
  "Carga mental elevada - Alta demanda cognitiva": "Trabajo bajo presión",
  "Trabajo emocional intenso - Atención de público o situaciones críticas": "Atención de público",
  "Jornadas de trabajo prolongadas": "Trabajo bajo presión",
  "Trabajo nocturno o en turnos rotativos": "Monotonía/repetitividad de funciones",
  "Turnos nocturnos o trabajo nocturno": "Monotonía/repetitividad de funciones",
  "Acoso laboral (mobbing) o discriminación": "Trabajo bajo presión",
  "Violencia externa o amenaza de terceros (clientes, usuarios, público)": "Amenazas",
  "Falta de autonomía o control sobre el trabajo": "Competencias no definidas para el cargo",
  "Extensión de la jornada laboral - Jornadas superiores a 48 horas/semana": "Trabajo bajo presión",
  "Monotonía o tareas repetitivas sin variación": "Monotonía/repetitividad de funciones",

  // Riesgos Tecnológicos
  "Incendio o explosión - Presencia de materiales combustibles/inflamables": "Incendio",
  "Fuga o derrame de sustancias peligrosas": "Explosión",

  // Fenómenos Naturales
  "Sismo o terremoto": "Sismo - Terremotos",
  "Inundación o creciente de ríos": "Inundación",
  "Vendaval, huracán o vientos fuertes": "Tormentas eléctricas"
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  console.log('\n🔄 ========================================');
  console.log('   SEED 006: Completar GES Restantes');
  console.log('========================================\n');

  try {
    // 1. Importar GES_DATOS_PREDEFINIDOS
    console.log('📥 Importando GES_DATOS_PREDEFINIDOS...');
    const GES_DATOS_PREDEFINIDOS = await importGesConfig();
    console.log(`   ✓ ${Object.keys(GES_DATOS_PREDEFINIDOS).length} GES disponibles en config\n`);

    // 2. Estadísticas iniciales
    const statsInicial = await knex('catalogo_ges')
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw('COUNT(CASE WHEN consecuencias IS NULL THEN 1 END) as sin_consecuencias')
      )
      .first();

    console.log('📊 Estado inicial:');
    console.log(`   Total GES: ${statsInicial.total}`);
    console.log(`   Sin consecuencias: ${statsInicial.sin_consecuencias}\n`);

    // 3. Obtener GES incompletos
    const gesIncompletos = await knex('catalogo_ges')
      .select('id', 'codigo', 'nombre')
      .whereNull('consecuencias')
      .orderBy('nombre');

    console.log(`📋 GES a procesar: ${gesIncompletos.length}\n`);

    // 4. Procesar cada GES
    let actualizados = 0;
    let noMapeados = 0;
    let yaCompletos = 0;
    const errores = [];
    const noEncontrados = [];

    for (const gesDB of gesIncompletos) {
      try {
        // Buscar nombre mapeado
        const nombreConfig = NOMBRE_MAPEO[gesDB.nombre];

        if (!nombreConfig) {
          noMapeados++;
          noEncontrados.push(gesDB.nombre);
          console.log(`   ⚠️  Sin mapeo: "${gesDB.nombre}"`);
          continue;
        }

        // Buscar datos en config
        const datosConfig = GES_DATOS_PREDEFINIDOS[nombreConfig];

        if (!datosConfig) {
          noMapeados++;
          noEncontrados.push(`${gesDB.nombre} → ${nombreConfig} (no existe en config)`);
          console.log(`   ❌ Config no encontrado para: "${nombreConfig}"`);
          continue;
        }

        // Preparar datos para actualización
        const updateData = {
          consecuencias: datosConfig.consecuencias,
          peor_consecuencia: datosConfig.peorConsecuencia,
          examenes_medicos: JSON.stringify(datosConfig.examenesMedicos),
          aptitudes_requeridas: JSON.stringify(datosConfig.aptitudesRequeridas),
          condiciones_incompatibles: JSON.stringify(datosConfig.condicionesIncompatibles),
          epp_sugeridos: JSON.stringify(datosConfig.eppSugeridos),
          medidas_intervencion: JSON.stringify({
            eliminacion: datosConfig.medidasIntervencion.eliminacion,
            sustitucion: datosConfig.medidasIntervencion.sustitucion,
            controles_ingenieria: datosConfig.medidasIntervencion.controlesIngenieria,
            controles_administrativos: datosConfig.medidasIntervencion.controlesAdministrativos
          })
        };

        // Actualizar
        await knex('catalogo_ges')
          .where({ id: gesDB.id })
          .update(updateData);

        actualizados++;
        console.log(`   ✅ Actualizado: "${gesDB.nombre}" → "${nombreConfig}"`);

      } catch (error) {
        errores.push({ nombre: gesDB.nombre, error: error.message });
        console.log(`   ❌ Error en "${gesDB.nombre}": ${error.message}`);
      }
    }

    // 5. Estadísticas finales
    console.log('\n📊 Resultados:');
    console.log(`   ✅ Actualizados: ${actualizados} GES`);
    console.log(`   ⚠️  Sin mapeo: ${noMapeados} GES`);
    console.log(`   ❌ Errores: ${errores.length}\n`);

    if (noEncontrados.length > 0) {
      console.log('⚠️  GES sin mapeo (requieren atención manual):');
      noEncontrados.forEach(nombre => {
        console.log(`   - ${nombre}`);
      });
      console.log('');
    }

    // 6. Estadísticas post-actualización
    const statsFinal = await knex('catalogo_ges')
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw('COUNT(CASE WHEN consecuencias IS NULL THEN 1 END) as sin_consecuencias'),
        knex.raw('COUNT(CASE WHEN consecuencias IS NOT NULL THEN 1 END) as con_consecuencias')
      )
      .first();

    console.log('📊 Estado final:');
    console.log(`   Total GES: ${statsFinal.total}`);
    console.log(`   Con detalle completo: ${statsFinal.con_consecuencias}`);
    console.log(`   Sin detalle: ${statsFinal.sin_consecuencias}\n`);

    // 7. Calcular mejora
    const mejora = statsInicial.sin_consecuencias - statsFinal.sin_consecuencias;
    const porcentaje = ((statsFinal.con_consecuencias / statsFinal.total) * 100).toFixed(1);

    console.log('📈 Mejora lograda:');
    console.log(`   GES completados: +${mejora}`);
    console.log(`   Completitud total: ${porcentaje}%\n`);

    console.log('✅ SEED 006 completado!\n');

  } catch (error) {
    console.error('\n❌ Error fatal en seed 006:', error);
    throw error;
  }
};
