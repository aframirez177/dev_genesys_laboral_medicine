/**
 * Seed: 10 GES Críticos Faltantes (Sistema Viejo)
 *
 * Añade los 10 GES más críticos que faltan del sistema viejo
 * para mantener compatibilidad y completitud del catálogo.
 *
 * Distribución:
 * - Condiciones de Seguridad: 5 GES (Locativos y Mecánicos)
 * - Riesgo Físico: 1 GES
 * - Riesgo Biológico: 2 GES
 * - Fenómenos Naturales: 1 GES
 * - Riesgo Tecnológico: 1 GES
 *
 * Total: 10 GES críticos
 * Total acumulado: 84 + 10 = 94 GES
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Obtener IDs de categorías de riesgo
  const riesgos = await knex('catalogo_riesgos').select('*');
  const riesgoMap = {};
  riesgos.forEach(r => { riesgoMap[r.codigo] = r.id; });

  // Contador de orden para cada categoría
  const contadorOrden = {};
  for (const r of riesgos) {
    const maxOrden = await knex('catalogo_ges')
      .where('riesgo_id', r.id)
      .max('orden as max_orden')
      .first();
    contadorOrden[r.codigo] = (maxOrden.max_orden || 0) + 1;
  }

  // =========================================
  // 10 GES CRÍTICOS FALTANTES
  // =========================================

  const gesCriticos = [];

  // ========================================
  // CONDICIONES DE SEGURIDAD (5 GES)
  // ========================================

  // 1. Posibilidad de perforación o de punzonamiento
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    nombre: "Posibilidad de perforación o de punzonamiento",
    consecuencias: "Heridas punzantes, lesiones en manos y pies, perforaciones en abdomen o tórax, infecciones por objetos contaminados.",
    peor_consecuencia: "Perforación de órganos vitales, sepsis, amputación, tétanos, muerte por hemorragia.",
    examenes_medicos: JSON.stringify({ EMO: 1, VACU: 1 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de mantener atención en tareas de precisión",
      "Coordinación motora fina adecuada",
      "Buena agudeza visual",
      "Capacidad de seguir protocolos de seguridad estrictamente"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Trastornos de la coordinación motora",
      "Deficiencias visuales no corregidas",
      "Neuropatías periféricas que afecten sensibilidad en manos",
      "Trastorno por déficit de atención severo"
    ]),
    epp_sugeridos: JSON.stringify([
      "Guantes de protección anticorte (nivel 3-5 según EN 388)",
      "Calzado de seguridad con plantilla antipunzón",
      "Gafas de seguridad",
      "Delantales resistentes a perforación",
      "Mangas protectoras"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar herramientas punzantes innecesarias, automatizar procesos con objetos punzocortantes.",
      sustitucion: "Utilizar herramientas con puntas romas cuando sea posible, materiales menos peligrosos.",
      controles_ingenieria: "Protecciones en herramientas punzantes, contenedores para desecho de agujas/objetos punzantes (cortopunzantes), mesas de trabajo con superficies anti-deslizantes.",
      controles_administrativos: "Capacitación en manejo seguro de herramientas punzocortantes, procedimientos de trabajo seguro, inspecciones periódicas de EPP, programa de vacunación (tétanos), primeros auxilios disponibles."
    }),
    relevancia_por_sector: JSON.stringify({
      manufactura: 9,
      construccion: 8,
      salud: 10,
      metalmecanica: 9,
      agricultura: 7,
      oficina: 3
    }),
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 2. Posibilidad de corte o seccionamiento
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    nombre: "Posibilidad de corte o seccionamiento",
    consecuencias: "Laceraciones, cortes profundos, hemorragias, daño en tendones, nervios y vasos sanguíneos, amputaciones.",
    peor_consecuencia: "Amputación de dedos o miembros, sección de arterias con hemorragia masiva, muerte por desangramiento, discapacidad permanente.",
    examenes_medicos: JSON.stringify({ EMO: 1, NEURO: 2, VACU: 1 }),
    aptitudes_requeridas: JSON.stringify([
      "Coordinación motora fina y gruesa adecuada",
      "Buena agudeza visual",
      "Capacidad de concentración sostenida",
      "Reflejos y tiempo de reacción normales"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Trastornos de la coordinación motora",
      "Deficiencias visuales severas no corregidas",
      "Neuropatías que afecten sensibilidad táctil",
      "Epilepsia no controlada",
      "Trastorno por déficit de atención no tratado"
    ]),
    epp_sugeridos: JSON.stringify([
      "Guantes anticorte certificados (nivel 5 EN 388 para alto riesgo)",
      "Mangas y delantales anticorte",
      "Gafas de seguridad o pantalla facial",
      "Calzado de seguridad",
      "Protectores de antebrazo"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Automatizar procesos de corte, eliminar herramientas manuales de corte cuando sea posible.",
      sustitucion: "Utilizar herramientas de corte con sistemas de seguridad (retracción automática de cuchillas, corte por láser, etc.).",
      controles_ingenieria: "Guardas de seguridad en máquinas cortantes, sistemas de paro de emergencia, mesas de corte con guías, contenedores seguros para almacenamiento de herramientas cortantes.",
      controles_administrativos: "Procedimientos de trabajo seguro (lockout/tagout), capacitación en uso correcto de herramientas cortantes, mantenimiento preventivo de maquinaria, inspección periódica de equipos de protección, señalización de áreas de riesgo, botiquín equipado para emergencias."
    }),
    relevancia_por_sector: JSON.stringify({
      manufactura: 10,
      construccion: 9,
      metalmecanica: 10,
      agricultura: 8,
      comercio: 6,
      salud: 7,
      oficina: 3
    }),
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 3. Almacenamiento inadecuado
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    nombre: "Almacenamiento inadecuado",
    consecuencias: "Caída de objetos almacenados, golpes, atrapamiento, colapso de estanterías, bloqueo de vías de evacuación, incendios.",
    peor_consecuencia: "Aplastamiento por colapso de estanterías, lesiones graves por caída de objetos pesados, imposibilidad de evacuación en emergencias, muerte.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de organización espacial",
      "Conocimiento de principios de almacenamiento seguro",
      "Capacidad física para manipular cargas",
      "Capacidad de seguir procedimientos de orden y aseo"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Trastorno obsesivo-compulsivo de acumulación severo",
      "Discapacidades cognitivas que impidan seguir procedimientos de organización"
    ]),
    epp_sugeridos: JSON.stringify([
      "Calzado de seguridad",
      "Casco de seguridad (en áreas de almacenamiento en altura)",
      "Guantes de trabajo",
      "Faja lumbar ergonómica (para manipulación de cargas)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar almacenamiento innecesario mediante gestión just-in-time, reducir inventarios.",
      sustitucion: "Sustituir almacenamiento vertical excesivo por almacenamiento horizontal más seguro.",
      controles_ingenieria: "Estanterías ancladas a pared o piso, sistemas de retención para evitar caída de objetos, pasillos de ancho adecuado (mínimo 1.2m), señalización de capacidad máxima de carga, sistemas anti-vuelco en estanterías móviles.",
      controles_administrativos: "Procedimiento de almacenamiento seguro (objetos pesados abajo, livianos arriba), inspecciones periódicas de estanterías, programa de orden y aseo (5S), capacitación en almacenamiento seguro, señalización de cargas máximas, prohibición de almacenar objetos que obstruyan salidas de emergencia, cumplimiento NTC 1461 (almacenamiento)."
    }),
    relevancia_por_sector: JSON.stringify({
      manufactura: 9,
      comercio: 10,
      construccion: 8,
      oficina: 7,
      salud: 6,
      hoteleria: 6,
      todas: 7
    }),
    es_comun: true, // Este es muy común en todos los sectores
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 4. Condiciones del piso
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    nombre: "Condiciones del piso",
    consecuencias: "Caídas al mismo nivel, resbalones, tropiezos, torceduras, esguinces, fracturas, traumatismos craneoencefálicos.",
    peor_consecuencia: "Fractura de cadera (especialmente en adultos mayores), traumatismo craneoencefálico grave, lesión de columna vertebral, muerte por caída.",
    examenes_medicos: JSON.stringify({ EMO: 1, OPTO: 2, NEURO: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Buena agudeza visual para detectar irregularidades en el piso",
      "Equilibrio y coordinación adecuados",
      "Capacidad de marcha normal",
      "Atención y concentración para evitar distracciones"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Vértigo crónico o trastornos del equilibrio severos",
      "Deficiencias visuales severas no corregidas",
      "Ataxias o trastornos de la marcha",
      "Neuropatías periféricas que afecten sensibilidad en pies",
      "Uso de medicamentos que causen mareos o somnolencia"
    ]),
    epp_sugeridos: JSON.stringify([
      "Calzado antideslizante certificado (SRC según EN ISO 20345)",
      "Calzado cerrado con suela de agarre adecuado",
      "Bastones o apoyos para personas con dificultades de movilidad"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar desniveles innecesarios, reparar grietas y huecos en el piso.",
      sustitucion: "Reemplazar pisos lisos y resbaladizos por superficies antideslizantes.",
      controles_ingenieria: "Pisos antideslizantes (coeficiente de fricción ≥0.5), rampas con pendiente adecuada (<12%), señalización de desniveles, iluminación adecuada (mínimo 200 lux en pasillos), drenajes para evitar encharcamientos, tapetes antideslizantes en zonas húmedas.",
      controles_administrativos: "Programa de mantenimiento preventivo de pisos, limpieza inmediata de derrames, señalización de pisos mojados ('Piso mojado' visible), restricción de tránsito durante limpieza, inspecciones periódicas de condiciones de pisos, capacitación en prevención de caídas, uso de calzado apropiado obligatorio."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      manufactura: 9,
      comercio: 9,
      oficina: 8,
      salud: 9,
      hoteleria: 10,
      servicios_publicos: 8,
      todas: 9
    }),
    es_comun: true, // Muy común en todos los sectores
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 5. Escaleras y barandas inadecuadas o mal estado
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    nombre: "Escaleras y barandas inadecuadas o mal estado",
    consecuencias: "Caídas de altura, caídas por escaleras, fracturas, traumatismos, esguinces, lesiones de columna.",
    peor_consecuencia: "Caída mortal desde escaleras, fractura de columna vertebral con paraplejia, traumatismo craneoencefálico severo, muerte.",
    examenes_medicos: JSON.stringify({ EMO: 1, OPTO: 1, NEURO: 2, PST: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Buena agudeza visual",
      "Equilibrio y coordinación adecuados",
      "Ausencia de vértigo o miedo a alturas",
      "Capacidad de marcha y movilidad normales",
      "Fuerza en miembros inferiores adecuada"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Vértigo o miedo a alturas (acrofobia)",
      "Trastornos del equilibrio severos",
      "Artritis severa en miembros inferiores",
      "Deficiencias visuales severas no corregidas",
      "Enfermedades cardiovasculares que causen mareos",
      "Neuropatías que afecten movilidad o sensibilidad en piernas"
    ]),
    epp_sugeridos: JSON.stringify([
      "Calzado antideslizante con buen agarre",
      "Calzado cerrado (no sandalias ni zapatos abiertos)",
      "Uso de barandas obligatorio (tomar con la mano)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar escaleras innecesarias, instalar rampas cuando sea posible, usar ascensores/montacargas para transporte de cargas.",
      sustitucion: "Reemplazar escaleras deterioradas o con diseño inadecuado.",
      controles_ingenieria: "Escaleras con barandas a ambos lados (altura 90-105 cm según NSR-10), pasamanos continuos, huella mínima 25 cm y contrahuella máxima 18 cm, superficie antideslizante en escalones, iluminación adecuada (mínimo 150 lux), señalización de primer y último escalón, barandas resistentes (carga mínima 100 kg), descansos cada 12 escalones máximo.",
      controles_administrativos: "Inspecciones periódicas de escaleras y barandas, mantenimiento correctivo inmediato de daños, señalización de escaleras en mal estado (prohibición de uso), prohibición de correr en escaleras, campaña de concientización sobre uso de barandas, restricción de carga manual en escaleras (usar montacargas), cumplimiento NSR-10 Título J (escaleras)."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      manufactura: 9,
      oficina: 8,
      comercio: 9,
      salud: 8,
      hoteleria: 9,
      educacion: 9,
      todas: 8
    }),
    es_comun: true, // Presente en casi todos los edificios
    orden: contadorOrden['CS']++,
    activo: true
  });

  // ========================================
  // RIESGO FÍSICO (1 GES)
  // ========================================

  // 6. Humedad Relativa (Vapor de agua)
  gesCriticos.push({
    riesgo_id: riesgoMap['RF'],
    nombre: "Humedad Relativa (Vapor de agua)",
    consecuencias: "Enfermedades respiratorias (asma, bronquitis), alergias, dermatitis, proliferación de moho y ácaros, fatiga, malestar térmico.",
    peor_consecuencia: "Neumonitis por hipersensibilidad (pulmón del granjero), asma ocupacional severo, infecciones fúngicas pulmonares (aspergilosis), empeoramiento de enfermedades respiratorias crónicas.",
    examenes_medicos: JSON.stringify({ EMO: 1, ESPI: 1, DERM: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Función respiratoria normal",
      "Ausencia de alergias severas a moho o ácaros",
      "Piel sin dermatitis crónica severa"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Asma no controlada",
      "Enfermedad Pulmonar Obstructiva Crónica (EPOC)",
      "Alergias severas a moho, hongos o ácaros",
      "Dermatitis atópica severa",
      "Fibrosis quística",
      "Inmunodeficiencias"
    ]),
    epp_sugeridos: JSON.stringify([
      "Respirador N95 (en ambientes con moho visible)",
      "Ropa de trabajo transpirable",
      "Guantes impermeables (si hay contacto con superficies húmedas)",
      "Calzado impermeable"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar fuentes de humedad innecesarias (filtraciones, fugas de agua).",
      sustitucion: "Procesos en seco cuando sea posible, materiales resistentes a la humedad.",
      controles_ingenieria: "Ventilación adecuada (natural o mecánica), deshumidificadores en áreas críticas, sistemas de drenaje efectivos, impermeabilización de techos y paredes, mantenimiento de niveles de humedad relativa entre 30-60% (ASHRAE), extracción localizada en fuentes de vapor.",
      controles_administrativos: "Monitoreo periódico de humedad relativa (higrómetros), mantenimiento preventivo de sistemas de ventilación, limpieza y desinfección regular de áreas húmedas, reparación inmediata de filtraciones, inspecciones de moho, rotación de personal en áreas de alta humedad, pausas en ambientes secos, educación sobre síntomas de alergias respiratorias."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 8,
      agricultura: 10,
      manufactura: 7,
      salud: 6,
      hoteleria: 7,
      servicios_publicos: 9,
      mineria: 9
    }),
    orden: contadorOrden['RF']++,
    activo: true
  });

  // ========================================
  // RIESGO BIOLÓGICO (2 GES)
  // ========================================

  // 7. Manipulación de alimentos
  gesCriticos.push({
    riesgo_id: riesgoMap['RBL'],
    nombre: "Manipulación de alimentos",
    consecuencias: "Enfermedades transmitidas por alimentos (ETAs), infecciones gastrointestinales, hepatitis A, parasitosis, dermatitis por contacto con alimentos.",
    peor_consecuencia: "Intoxicación alimentaria severa (salmonelosis, E. coli O157:H7), hepatitis A, síndrome urémico hemolítico, deshidratación severa, hospitalización, muerte (en casos extremos).",
    examenes_medicos: JSON.stringify({ EMO: 1, COPRO: 1, VACU: 1, DERM: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Buenas prácticas de higiene personal",
      "Capacidad de seguir estrictamente protocolos de manipulación de alimentos",
      "Ausencia de enfermedades infecciosas transmisibles",
      "Conocimiento de cadena de frío y temperatura segura de alimentos"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Enfermedades gastrointestinales activas (diarrea, vómito)",
      "Infecciones de piel en manos (heridas abiertas, dermatitis infectada)",
      "Tuberculosis activa",
      "Hepatitis A en fase aguda",
      "Portadores de Salmonella, Shigella o E. coli patógena",
      "Condiciones que impidan lavado de manos frecuente"
    ]),
    epp_sugeridos: JSON.stringify([
      "Guantes desechables (nitrilo o látex)",
      "Gorro o cofia",
      "Tapabocas (obligatorio al manipular alimentos listos para consumo)",
      "Delantal limpio e impermeable",
      "Calzado cerrado antideslizante"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Automatizar procesos de manipulación de alimentos cuando sea posible.",
      sustitucion: "Utilizar alimentos pre-procesados que requieran menos manipulación.",
      controles_ingenieria: "Superficies de trabajo lisas, no porosas y lavables (acero inoxidable), lavamanos exclusivos con agua potable, jabón líquido y toallas desechables, sistemas de refrigeración adecuados, separación física entre áreas sucias y limpias, control de plagas, ventilación adecuada.",
      controles_administrativos: "Capacitación obligatoria en manipulación higiénica de alimentos (curso BPM), exámenes médicos ocupacionales periódicos (coproscópico, frotis faríngeo), vacunación (hepatitis A, fiebre tifoidea), lavado de manos obligatorio (antes de iniciar, después de ir al baño, después de tocar basura), prohibición de usar joyas, uñas pintadas o largas, control de temperatura de alimentos (refrigeración <5°C, cocción >74°C), cumplimiento Resolución 2674 de 2013 (BPM para alimentos)."
    }),
    relevancia_por_sector: JSON.stringify({
      hoteleria: 10,
      comercio: 9,
      salud: 8,
      educacion: 7,
      servicios_publicos: 5
    }),
    es_comun: true,
    orden: contadorOrden['RBL']++,
    activo: true
  });

  // 8. Sin disponibilidad de agua potable
  gesCriticos.push({
    riesgo_id: riesgoMap['RBL'],
    nombre: "Sin disponibilidad de agua potable",
    consecuencias: "Enfermedades gastrointestinales (diarrea, cólera, fiebre tifoidea), parasitosis, hepatitis A, deshidratación, dermatitis.",
    peor_consecuencia: "Cólera con deshidratación severa, fiebre tifoidea, hepatitis A, muerte por deshidratación o infección severa.",
    examenes_medicos: JSON.stringify({ EMO: 1, COPRO: 1, VACU: 1 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de reconocer síntomas de enfermedades hídricas",
      "Conocimiento de métodos de purificación de agua",
      "Capacidad de seguir protocolos de higiene estrictos"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Inmunodeficiencias severas",
      "Enfermedades gastrointestinales crónicas que se agraven con diarrea",
      "Diabetes descontrolada (vulnerable a deshidratación)",
      "Insuficiencia renal (riesgo con agua de mala calidad)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Guantes desechables para manipulación de agua no potable",
      "Recipientes limpios y cubiertos para almacenamiento de agua",
      "Gel antibacterial (sin agua) para higiene de manos"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Conectar a red de acueducto municipal con agua potable certificada.",
      sustitucion: "Instalar sistemas de purificación de agua (filtros, ósmosis inversa, luz UV), suministrar agua embotellada certificada.",
      controles_ingenieria: "Tanques de almacenamiento limpios y cubiertos, sistemas de cloración automática, filtros de agua, puntos de lavado de manos con agua potable, señalización clara de agua no potable.",
      controles_administrativos: "Análisis periódico de calidad de agua (bacteriológico y fisicoquímico según Resolución 2115 de 2007), limpieza y desinfección de tanques de almacenamiento cada 6 meses, capacitación en riesgos de agua no potable, vacunación (hepatitis A, fiebre tifoidea), prohibición de consumo de agua no potable, suministro de agua potable para consumo y lavado de manos, botiquín con sales de rehidratación oral."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      agricultura: 10,
      mineria: 9,
      servicios_publicos: 7,
      manufactura: 6
    }),
    orden: contadorOrden['RBL']++,
    activo: true
  });

  // ========================================
  // FENÓMENOS NATURALES (1 GES)
  // ========================================

  // 9. Deslizamientos
  gesCriticos.push({
    riesgo_id: riesgoMap['RFN'],
    nombre: "Deslizamientos",
    consecuencias: "Atrapamiento, aplastamiento, fracturas, trauma severo, pérdidas materiales, bloqueo de vías de acceso.",
    peor_consecuencia: "Muerte por sepultamiento, lesiones graves por aplastamiento, trauma múltiple, amputaciones traumáticas.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de reacción rápida ante emergencias",
      "Conocimiento de señales de advertencia de deslizamiento",
      "Capacidad de evacuación rápida",
      "Capacidad de mantener la calma en situaciones de pánico"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Discapacidades de movilidad que dificulten evacuación rápida (requiere plan especial de evacuación asistida)",
      "Trastornos de pánico severos",
      "Condiciones cardiorrespiratorias que se agraven con esfuerzo físico súbito"
    ]),
    epp_sugeridos: JSON.stringify([
      "Casco de seguridad",
      "Calzado de seguridad con buen agarre",
      "Silbato de emergencia",
      "Linterna personal",
      "Kit de emergencia personal"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Reubicar instalaciones fuera de zonas de alto riesgo de deslizamiento.",
      sustitucion: "No aplica (fenómeno natural).",
      controles_ingenieria: "Muros de contención, sistemas de drenaje para control de aguas lluvias, revegetalización de taludes, mallas de contención en laderas, canales de desviación de escorrentía, estabilización de taludes con geotextiles, monitoreo de grietas y movimientos del terreno.",
      controles_administrativos: "Estudios de suelos y geotécnicos antes de construcción, monitoreo de alertas del IDEAM y autoridades locales (temporada de lluvias), plan de emergencias y evacuación específico para deslizamientos, simulacros periódicos, identificación de rutas de evacuación seguras, señalización de zonas de riesgo, restricción de construcción en zonas de amenaza alta, inspecciones post-lluvias fuertes, capacitación en señales de advertencia (grietas, inclinación de árboles, sonidos subterráneos)."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      mineria: 10,
      agricultura: 9,
      servicios_publicos: 8,
      manufactura: 6
    }),
    orden: contadorOrden['RFN']++,
    activo: true
  });

  // ========================================
  // RIESGO TECNOLÓGICO (1 GES)
  // ========================================

  // 10. Trabajos en caliente
  gesCriticos.push({
    riesgo_id: riesgoMap['RT'],
    nombre: "Trabajos en caliente",
    consecuencias: "Quemaduras, incendios, explosiones, inhalación de humos metálicos, lesiones oculares por radiación UV/IR.",
    peor_consecuencia: "Incendio masivo, explosión, quemaduras de tercer grado, muerte por quemaduras o inhalación de humo, pérdidas materiales catastróficas.",
    examenes_medicos: JSON.stringify({ EMO: 1, OPTO: 1, ESPI: 1, DERM: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento de riesgos de trabajos en caliente (soldadura, corte, esmerilado)",
      "Capacidad de seguir estrictamente protocolos de seguridad",
      "Buena agudeza visual",
      "Función respiratoria adecuada",
      "Capacidad de reacción ante emergencias"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Enfermedades respiratorias severas (asma, EPOC)",
      "Enfermedades oculares severas no corregidas",
      "Dermatitis severa o piel muy sensible a quemaduras",
      "Claustrofobia (para trabajos en espacios confinados)",
      "Trastornos de atención que impidan seguir protocolos estrictos"
    ]),
    epp_sugeridos: JSON.stringify([
      "Careta de soldador con filtro adecuado (DIN 9-13 según proceso)",
      "Guantes de cuero para soldador",
      "Delantal de cuero o material ignífugo",
      "Polainas y mangas de cuero",
      "Respirador para humos metálicos (si hay ventilación insuficiente)",
      "Ropa ignífuga (no sintética)",
      "Calzado de seguridad cerrado"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar trabajos en caliente innecesarios, preferir métodos de unión mecánica cuando sea posible.",
      sustitucion: "Utilizar soldadura en frío, adhesivos industriales, uniones roscadas o remachadas en lugar de soldadura.",
      controles_ingenieria: "Cabinas de soldadura con extracción localizada de humos, sistemas de ventilación adecuados, cortinas ignífugas para delimitar área de trabajo, extintores tipo ABC accesibles (máximo 15 metros), detectores de humo y alarmas, mangueras contra incendio disponibles.",
      controles_administrativos: "Permiso de trabajo en caliente obligatorio (válido solo para el día), inspección previa del área (retirar materiales combustibles 10m a la redonda), vigilante de incendios durante y 30 min después del trabajo, capacitación certificada en trabajos en caliente, inspección de equipos antes de uso, prohibición de trabajos en caliente cerca de tanques de combustible o químicos inflamables, plan de respuesta a incendios, cumplimiento NTC 1461 (prevención de incendios)."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      manufactura: 10,
      metalmecanica: 10,
      mineria: 9,
      servicios_publicos: 8,
      oficina: 2
    }),
    es_comun: true,
    orden: contadorOrden['RT']++,
    activo: true
  });

  // =========================================
  // INSERTAR GES CRÍTICOS
  // =========================================

  await knex('catalogo_ges').insert(gesCriticos);

  console.log(`✅ Seed 003 completado:
   - 5 GES Condiciones de Seguridad (Locativos y Mecánicos)
   - 1 GES Riesgo Físico
   - 2 GES Riesgo Biológico
   - 1 GES Fenómenos Naturales
   - 1 GES Riesgo Tecnológico
   - TOTAL: 10 GES críticos insertados
   - Total acumulado: 84 + 10 = 94 GES`);
};
