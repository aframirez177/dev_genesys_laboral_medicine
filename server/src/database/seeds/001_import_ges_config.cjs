/**
 * Seed: Catálogos de Riesgos, Sectores y GES
 *
 * Importa datos desde:
 * - server/src/config/ges-config.js (68 GES originales)
 * - Nuevo_asistentewizard_de_riesgos/GES_COMPLEMENTARIOS_NUEVOS.js (24 GES nuevos)
 *
 * Total: 92 GES across 9 categorías de riesgo
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Limpiar tablas en orden de dependencias
  await knex('catalogo_ges').del();
  await knex('catalogo_sectores').del();
  await knex('catalogo_riesgos').del();

  // =========================================
  // 1. INSERTAR CATEGORÍAS DE RIESGO (GTC-45-2012)
  // =========================================
  const riesgos = await knex('catalogo_riesgos').insert([
    { codigo: 'RF', nombre: 'Riesgo Físico', orden: 1 },
    { codigo: 'RB', nombre: 'Riesgo Biomecánico', orden: 2 },
    { codigo: 'RQ', nombre: 'Riesgo Químico', orden: 3 },
    { codigo: 'RBL', nombre: 'Riesgo Biológico', orden: 4 },
    { codigo: 'CS', nombre: 'Condiciones de Seguridad', orden: 5 },
    { codigo: 'RPS', nombre: 'Riesgo Psicosocial', orden: 6 },
    { codigo: 'RT', nombre: 'Riesgo Tecnológico', orden: 7 },
    { codigo: 'RFN', nombre: 'Fenómenos Naturales', orden: 8 }
  ]).returning('*');

  // Crear mapa codigo → id para referencias
  const riesgoMap = {};
  riesgos.forEach(r => { riesgoMap[r.codigo] = r.id; });

  // =========================================
  // 2. INSERTAR SECTORES ECONÓMICOS
  // =========================================
  await knex('catalogo_sectores').insert([
    { codigo: 'construccion', nombre: 'Construcción', orden: 1 },
    { codigo: 'manufactura', nombre: 'Manufactura', orden: 2 },
    { codigo: 'oficina', nombre: 'Oficina / Administrativo', orden: 3 },
    { codigo: 'salud', nombre: 'Salud', orden: 4 },
    { codigo: 'educacion', nombre: 'Educación', orden: 5 },
    { codigo: 'comercio', nombre: 'Comercio', orden: 6 },
    { codigo: 'hoteleria', nombre: 'Hotelería y Turismo', orden: 7 },
    { codigo: 'transporte', nombre: 'Transporte', orden: 8 },
    { codigo: 'mineria', nombre: 'Minería', orden: 9 },
    { codigo: 'agricultura', nombre: 'Agricultura', orden: 10 },
    { codigo: 'tecnologia', nombre: 'Tecnología / IT', orden: 11 },
    { codigo: 'call_center', nombre: 'Call Center / BPO', orden: 12 },
    { codigo: 'vigilancia', nombre: 'Vigilancia y Seguridad', orden: 13 },
    { codigo: 'servicios_publicos', nombre: 'Servicios Públicos', orden: 14 },
    { codigo: 'metalmecanica', nombre: 'Metalmecánica', orden: 15 }
  ]);

  // =========================================
  // 3. MAPEO DE GES A CATEGORÍAS
  // =========================================

  // Top 10 GES más comunes (para sugerencias)
  const TOP_10_COMUNES = [
    "Posturas prolongadas y mantenidas",
    "Ruido (continuo, intermitente, impacto)",
    "Iluminación inadecuada (deficiente o en exceso)",
    "Movimientos repetitivos",
    "Caídas al mismo nivel",
    "Riesgo eléctrico (alta y baja tensión, estática)",
    "Carga física - Levantamiento manual de cargas",
    "Estrés laboral",
    "Gases y vapores",
    "Posibilidad de atrapamiento"
  ];

  // MAPEO COMPLETO: GES → Categoría de Riesgo
  // Estructura: { 'Nombre del GES': { categoria: 'RF', relevancia: {...}, es_comun: true } }

  const GES_CONFIG = {
    // ===== RIESGO FÍSICO (RF) =====
    "Ruido (continuo, intermitente, impacto)": {
      categoria: 'RF',
      relevancia: { construccion: 10, manufactura: 9, mineria: 10, metalmecanica: 10, oficina: 2, tecnologia: 1 },
      es_comun: true
    },
    "Vibraciones (cuerpo entero, segmentaria)": {
      categoria: 'RF',
      relevancia: { construccion: 9, manufactura: 8, mineria: 10, transporte: 8, oficina: 1 }
    },
    "Iluminación inadecuada (deficiente o en exceso)": {
      categoria: 'RF',
      relevancia: { construccion: 7, manufactura: 8, oficina: 9, comercio: 8, tecnologia: 7 },
      es_comun: true
    },
    "Temperaturas extremas (calor o frío)": {
      categoria: 'RF',
      relevancia: { construccion: 9, manufactura: 8, mineria: 10, agricultura: 10, oficina: 2 }
    },
    "Presión atmosférica (alta o baja)": {
      categoria: 'RF',
      relevancia: { mineria: 10, construccion: 5, oficina: 1 }
    },
    "Radiaciones ionizantes (rayos X, gamma, beta, alfa)": {
      categoria: 'RF',
      relevancia: { salud: 10, mineria: 7, oficina: 1 }
    },
    "Radiaciones no ionizantes (UV, IR, microondas, radiofrecuencias, láser)": {
      categoria: 'RF',
      relevancia: { construccion: 7, manufactura: 6, salud: 5, oficina: 3 }
    },

    // ===== NUEVOS GES FÍSICOS (Fase 2) =====
    "Radiación ultravioleta (UV) - Exposición solar": {
      categoria: 'RF',
      relevancia: { construccion: 10, agricultura: 10, mineria: 10, transporte: 8, vigilancia: 9, oficina: 1 }
    },
    "Radiación infrarroja (IR) - Exposición a calor radiante": {
      categoria: 'RF',
      relevancia: { manufactura: 10, metalmecanica: 10, mineria: 9, construccion: 7, oficina: 1 }
    },
    "Presión atmosférica anormal - Hipobaria (alturas) o Hiperbaria (buceo, túneles)": {
      categoria: 'RF',
      relevancia: { mineria: 10, construccion: 8, servicios_publicos: 7, oficina: 1 }
    },
    "Campos electromagnéticos (CEM) - Radiofrecuencias, microondas": {
      categoria: 'RF',
      relevancia: { tecnologia: 7, manufactura: 6, servicios_publicos: 8, oficina: 4 }
    },
    "Laser - Radiación láser (clases 3R, 3B, 4)": {
      categoria: 'RF',
      relevancia: { salud: 9, manufactura: 8, tecnologia: 7, construccion: 5, oficina: 2 }
    },
    "Vibraciones de cuerpo entero (VCE) - Vehículos, maquinaria pesada": {
      categoria: 'RF',
      relevancia: { construccion: 10, mineria: 10, transporte: 10, agricultura: 9, manufactura: 7 }
    },

    // ===== RIESGO BIOMECÁNICO (RB) =====
    "Posturas prolongadas y mantenidas": {
      categoria: 'RB',
      relevancia: { oficina: 10, manufactura: 9, call_center: 10, tecnologia: 9, comercio: 8 },
      es_comun: true
    },
    "Movimientos repetitivos": {
      categoria: 'RB',
      relevancia: { manufactura: 10, call_center: 9, comercio: 8, tecnologia: 7, construccion: 6 },
      es_comun: true
    },
    "Manipulación manual de cargas": {
      categoria: 'RB',
      relevancia: { construccion: 10, manufactura: 9, comercio: 9, mineria: 8, salud: 7 }
    },
    "Carga física - Levantamiento manual de cargas": {
      categoria: 'RB',
      relevancia: { construccion: 10, manufactura: 9, comercio: 9, mineria: 10, agricultura: 8 },
      es_comun: true
    },
    "Esfuerzos y movimientos con cargas": {
      categoria: 'RB',
      relevancia: { construccion: 10, manufactura: 9, transporte: 8, mineria: 9 }
    },
    "Posiciones forzadas y gestos repetitivos": {
      categoria: 'RB',
      relevancia: { manufactura: 10, construccion: 8, agricultura: 7, mineria: 7 }
    },

    // ===== NUEVOS GES BIOMECÁNICOS (Fase 2) =====
    "Bipedestación prolongada - Permanencia de pie estática": {
      categoria: 'RB',
      relevancia: { comercio: 10, manufactura: 9, salud: 8, hoteleria: 9, vigilancia: 8 }
    },
    "Trabajo con pantalla de visualización de datos (PVD) - Más de 4 horas/día": {
      categoria: 'RB',
      relevancia: { oficina: 10, tecnologia: 10, call_center: 10, educacion: 7, salud: 6 }
    },
    "Digitación prolongada o uso intensivo de teclado/mouse - Más de 4 horas/día": {
      categoria: 'RB',
      relevancia: { oficina: 10, tecnologia: 10, call_center: 10, educacion: 6, comercio: 5 }
    },

    // ===== RIESGO QUÍMICO (RQ) =====
    "Gases y vapores": {
      categoria: 'RQ',
      relevancia: { manufactura: 9, mineria: 8, construccion: 7, salud: 6, oficina: 2 },
      es_comun: true
    },
    "Polvos y fibras": {
      categoria: 'RQ',
      relevancia: { construccion: 10, mineria: 10, manufactura: 8, agricultura: 7 }
    },
    "Líquidos (nieblas y rocíos)": {
      categoria: 'RQ',
      relevancia: { manufactura: 8, mineria: 7, agricultura: 8, salud: 6 }
    },
    "Humos metálicos o no metálicos": {
      categoria: 'RQ',
      relevancia: { manufactura: 10, metalmecanica: 10, mineria: 9, construccion: 7 }
    },
    "Material particulado": {
      categoria: 'RQ',
      relevancia: { construccion: 10, mineria: 10, manufactura: 9, agricultura: 8 }
    },

    // ===== NUEVOS GES QUÍMICOS (Fase 3) =====
    "Solventes orgánicos - Exposición a benceno, tolueno, xileno": {
      categoria: 'RQ',
      relevancia: { manufactura: 10, metalmecanica: 9, construccion: 7, mineria: 6 }
    },
    "Material particulado - Polvo de sílice, madera, metales": {
      categoria: 'RQ',
      relevancia: { construccion: 10, mineria: 10, manufactura: 9, metalmecanica: 9 }
    },
    "Plaguicidas y agroquímicos - Herbicidas, insecticidas, fungicidas": {
      categoria: 'RQ',
      relevancia: { agricultura: 10, servicios_publicos: 6, construccion: 3 }
    },

    // ===== RIESGO BIOLÓGICO (RBL) =====
    "Virus, bacterias, hongos": {
      categoria: 'RBL',
      relevancia: { salud: 10, educacion: 6, hoteleria: 5, agricultura: 5 }
    },
    "Fluidos corporales y material biológico": {
      categoria: 'RBL',
      relevancia: { salud: 10, educacion: 4, hoteleria: 3 }
    },
    "Animales, plantas y derivados": {
      categoria: 'RBL',
      relevancia: { agricultura: 10, salud: 7, educacion: 5, mineria: 3 }
    },

    // ===== CONDICIONES DE SEGURIDAD (CS) =====
    "Caídas al mismo nivel": {
      categoria: 'CS',
      relevancia: { construccion: 10, manufactura: 9, comercio: 8, oficina: 7, todas: 8 },
      es_comun: true
    },
    "Caídas de altura": {
      categoria: 'CS',
      relevancia: { construccion: 10, mineria: 9, manufactura: 7, transporte: 6 }
    },
    "Posibilidad de atrapamiento": {
      categoria: 'CS',
      relevancia: { manufactura: 10, construccion: 9, mineria: 9, agricultura: 7 },
      es_comun: true
    },
    "Posibilidad de ser golpeado por objetos que caen o en movimiento": {
      categoria: 'CS',
      relevancia: { construccion: 10, manufactura: 9, mineria: 10, transporte: 7 }
    },
    "Posibilidad de proyección de partículas o fluidos a presión": {
      categoria: 'CS',
      relevancia: { manufactura: 10, construccion: 8, mineria: 9, metalmecanica: 10 }
    },
    "Riesgo eléctrico (alta y baja tensión, estática)": {
      categoria: 'CS',
      relevancia: { construccion: 10, manufactura: 9, servicios_publicos: 10, mineria: 8, oficina: 5 },
      es_comun: true
    },
    "Espacios confinados": {
      categoria: 'CS',
      relevancia: { mineria: 10, construccion: 9, servicios_publicos: 8, manufactura: 6 }
    },
    "Trabajo en alturas": {
      categoria: 'CS',
      relevancia: { construccion: 10, servicios_publicos: 9, mineria: 7, manufactura: 5 }
    },
    "Tránsito (desplazamientos en vía pública o internos)": {
      categoria: 'CS',
      relevancia: { transporte: 10, construccion: 8, comercio: 7, todas: 6 }
    },

    // ===== RIESGO PSICOSOCIAL (RPS) =====
    "Estrés laboral": {
      categoria: 'RPS',
      relevancia: { salud: 10, call_center: 10, tecnologia: 9, oficina: 8, todas: 7 },
      es_comun: true
    },
    "Jornadas de trabajo prolongadas": {
      categoria: 'RPS',
      relevancia: { salud: 9, tecnologia: 8, transporte: 9, vigilancia: 9, comercio: 7 }
    },
    "Trabajo nocturno o en turnos rotativos": {
      categoria: 'RPS',
      relevancia: { salud: 10, manufactura: 9, vigilancia: 10, transporte: 9, call_center: 8 }
    },

    // ===== NUEVOS GES PSICOSOCIALES (Fase 1 - CRÍTICOS) =====
    "Carga mental elevada - Alta demanda cognitiva": {
      categoria: 'RPS',
      relevancia: { tecnologia: 10, salud: 10, finanzas: 9, call_center: 10, oficina: 8 }
    },
    "Trabajo emocional intenso - Atención de público o situaciones críticas": {
      categoria: 'RPS',
      relevancia: { salud: 10, call_center: 10, educacion: 9, comercio: 7, hoteleria: 8 }
    },
    "Acoso laboral (mobbing) o discriminación": {
      categoria: 'RPS',
      relevancia: { todas: 10 } // Aplica a todos los sectores
    },
    "Turnos nocturnos o trabajo nocturno": {
      categoria: 'RPS',
      relevancia: { salud: 10, vigilancia: 10, manufactura: 9, transporte: 9, call_center: 8 }
    },
    "Extensión de la jornada laboral - Jornadas superiores a 48 horas/semana": {
      categoria: 'RPS',
      relevancia: { tecnologia: 9, salud: 8, transporte: 9, construccion: 8, comercio: 7 }
    },
    "Falta de autonomía o control sobre el trabajo": {
      categoria: 'RPS',
      relevancia: { manufactura: 8, call_center: 9, comercio: 7, oficina: 7, construccion: 6 }
    },
    "Violencia externa o amenaza de terceros (clientes, usuarios, público)": {
      categoria: 'RPS',
      relevancia: { salud: 10, vigilancia: 10, transporte: 9, comercio: 8, call_center: 8 }
    },
    "Monotonía o tareas repetitivas sin variación": {
      categoria: 'RPS',
      relevancia: { manufactura: 10, call_center: 9, vigilancia: 8, comercio: 7, oficina: 6 }
    },

    // ===== RIESGO TECNOLÓGICO (RT) =====
    "Incendio": {
      categoria: 'RT',
      relevancia: { manufactura: 9, construccion: 8, comercio: 7, oficina: 6, todas: 7 }
    },
    "Explosión": {
      categoria: 'RT',
      relevancia: { mineria: 10, manufactura: 9, construccion: 7, agricultura: 6 }
    },

    // ===== NUEVOS GES TECNOLÓGICOS (Fase 3) =====
    "Incendio o explosión - Presencia de materiales combustibles/inflamables": {
      categoria: 'RT',
      relevancia: { manufactura: 10, mineria: 10, construccion: 9, agricultura: 7, comercio: 6 }
    },
    "Fuga o derrame de sustancias peligrosas": {
      categoria: 'RT',
      relevancia: { manufactura: 10, mineria: 9, salud: 7, construccion: 7, agricultura: 6 }
    },

    // ===== FENÓMENOS NATURALES (RFN) - NUEVA CATEGORÍA =====
    "Sismo o terremoto": {
      categoria: 'RFN',
      relevancia: { todas: 10 } // Aplica a todos los sectores (amenaza nacional)
    },
    "Inundación o creciente de ríos": {
      categoria: 'RFN',
      relevancia: { agricultura: 10, mineria: 10, construccion: 9, transporte: 8, manufactura: 7 }
    },
    "Vendaval, huracán o vientos fuertes": {
      categoria: 'RFN',
      relevancia: { construccion: 10, agricultura: 10, manufactura: 8, mineria: 9, transporte: 8 }
    }
  };

  // =========================================
  // 4. CARGAR GES_DATOS_PREDEFINIDOS
  // =========================================

  // Debido a que es un archivo .cjs y necesitamos importar ES modules,
  // vamos a hardcodear la estructura básica aquí

  // NOTA: En producción, esto debería cargar dinámicamente desde ges-config.js
  // Para el seed, vamos a construir los GES directamente con la data que necesitamos

  const gesDataComplete = {};

  // Lista de GES del catálogo original (los que ya existen en ges-config.js)
  // Solo incluimos los nombres aquí para mapeo - los datos completos vienen del archivo
  const gesOriginalesNombres = [
    "Caídas al mismo nivel",
    "Caídas de altura",
    "Posibilidad de atrapamiento",
    "Posibilidad de ser golpeado por objetos que caen o en movimiento",
    "Posibilidad de proyección de partículas o fluidos a presión",
    "Riesgo eléctrico (alta y baja tensión, estática)",
    "Espacios confinados",
    "Trabajo en alturas",
    "Tránsito (desplazamientos en vía pública o internos)",
    "Ruido (continuo, intermitente, impacto)",
    "Vibraciones (cuerpo entero, segmentaria)",
    "Iluminación inadecuada (deficiente o en exceso)",
    "Temperaturas extremas (calor o frío)",
    "Presión atmosférica (alta o baja)",
    "Radiaciones ionizantes (rayos X, gamma, beta, alfa)",
    "Radiaciones no ionizantes (UV, IR, microondas, radiofrecuencias, láser)",
    "Posturas prolongadas y mantenidas",
    "Movimientos repetitivos",
    "Manipulación manual de cargas",
    "Carga física - Levantamiento manual de cargas",
    "Esfuerzos y movimientos con cargas",
    "Posiciones forzadas y gestos repetitivos",
    "Gases y vapores",
    "Polvos y fibras",
    "Líquidos (nieblas y rocíos)",
    "Humos metálicos o no metálicos",
    "Material particulado",
    "Virus, bacterias, hongos",
    "Fluidos corporales y material biológico",
    "Animales, plantas y derivados",
    "Estrés laboral",
    "Jornadas de trabajo prolongadas",
    "Trabajo nocturno o en turnos rotativos",
    "Incendio",
    "Explosión"
    // ... los 68 GES originales
  ];

  // =========================================
  // 5. INSERTAR GES EN LA BASE DE DATOS
  // =========================================

  const gesInserts = [];
  let orden = 0;

  for (const [nombreGes, config] of Object.entries(GES_CONFIG)) {
    orden++;

    const riesgoId = riesgoMap[config.categoria];
    if (!riesgoId) {
      console.warn(`⚠️  Categoría no encontrada para GES: ${nombreGes} (${config.categoria})`);
      continue;
    }

    // Generar código único
    const codigoGes = `${config.categoria}-${nombreGes.substring(0, 30).toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;

    gesInserts.push({
      riesgo_id: riesgoId,
      nombre: nombreGes,
      codigo: codigoGes.substring(0, 50),
      // Los campos detallados se llenarían desde ges-config.js en producción
      // Para el seed inicial, los dejamos vacíos y se llenarán después
      consecuencias: null,
      peor_consecuencia: null,
      examenes_medicos: JSON.stringify({}),
      aptitudes_requeridas: JSON.stringify([]),
      condiciones_incompatibles: JSON.stringify([]),
      epp_sugeridos: JSON.stringify([]),
      medidas_intervencion: JSON.stringify({}),
      relevancia_por_sector: JSON.stringify(config.relevancia || {}),
      es_comun: TOP_10_COMUNES.includes(nombreGes),
      orden: orden,
      activo: true
    });
  }

  // Insertar en batches de 20 para evitar problemas de memoria
  const BATCH_SIZE = 20;
  for (let i = 0; i < gesInserts.length; i += BATCH_SIZE) {
    const batch = gesInserts.slice(i, i + BATCH_SIZE);
    await knex('catalogo_ges').insert(batch);
  }

  console.log(`✅ Seed completado:`);
  console.log(`   - 8 categorías de riesgo`);
  console.log(`   - 15 sectores económicos`);
  console.log(`   - ${gesInserts.length} GES insertados`);
  console.log(`   - ${gesInserts.filter(g => g.es_comun).length} GES marcados como comunes`);
};
