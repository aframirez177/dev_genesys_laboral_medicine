/**
 * Seed: 004 - GES Críticos para Cumplimiento Legal Total
 *
 * Añade 28 GES CRÍTICOS identificados como blockers de cumplimiento legal
 * para clientes empresariales y gubernamentales en Colombia.
 *
 * JUSTIFICACIÓN LEGAL:
 * - GTC 45:2012, Sección 3.2.2: "Anexo A NO es exhaustivo. Las organizaciones
 *   deben desarrollar su propia lista según sus actividades."
 * - Resolución 2607/2024: Identificación exhaustiva de peligros
 * - Resolución 350/2022: COVID-19 obligatorio en riesgos biológicos
 * - Ley 1010/2006: Acoso laboral debe estar en matriz psicosocial
 * - Ley 1257/2008: Acoso sexual en matriz psicosocial
 * - Res. 2844/2007: Asbesto en riesgos químicos (edificios antiguos)
 *
 * DISTRIBUCIÓN:
 * - Riesgo Psicosocial (RPS): 5 GES - Compliance Ley 1010, Ley 1257, Res. 2646
 * - Riesgo Químico (RQ): 5 GES - Compliance Res. 2844, IARC, ATEX
 * - Riesgo Biológico (RBL): 3 GES - Compliance Res. 350/2022
 * - Condiciones de Seguridad (CS): 10 GES - Compliance Res. 1409, Res. 2400
 * - Fenómenos Naturales (RFN): 5 GES - Compliance Ley 1523/2012 Colombia
 *
 * TOTAL: 28 GES críticos
 * Total acumulado: 94 (existentes) + 28 = 122 GES ✅
 *
 * PRIORIDAD: CRÍTICA - Blockers legales para auditorías ARL/Ministerio
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('🚨 [Seed 004] Iniciando inserción de 28 GES críticos de compliance...');

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

  console.log('📊 Contadores de orden iniciales:', contadorOrden);

  const gesCriticos = [];

  // =========================================
  // RIESGO PSICOSOCIAL (5 GES CRÍTICOS)
  // Compliance: Ley 1010/2006, Ley 1257/2008, Res. 2646/2008
  // =========================================

  console.log('📋 Agregando Riesgo Psicosocial (5 GES)...');

  // 1. ACOSO LABORAL (MOBBING) - Ley 1010/2006
  gesCriticos.push({
    riesgo_id: riesgoMap['RPS'],
    codigo: 'RPS-ACOSO-LAB',
    nombre: "Acoso Laboral (Mobbing) o Discriminación",
    consecuencias: "Ansiedad, depresión, baja autoestima, estrés crónico, desmotivación, trastornos del sueño, somatización.",
    peor_consecuencia: "Suicidio, trastorno depresivo mayor, trastorno de estrés postraumático (TEPT), incapacidad laboral permanente.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 1 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de comunicación asertiva",
      "Resiliencia emocional",
      "Habilidades para establecer límites saludables",
      "Capacidad de trabajar en equipo"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Ninguna - este riesgo puede afectar a cualquier persona independientemente de sus condiciones de salud",
      "Nota: Víctimas previas de acoso requieren acompañamiento psicológico"
    ]),
    epp_sugeridos: JSON.stringify([
      "No aplica EPP físico - requiere controles organizacionales y legales"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Política de CERO TOLERANCIA al acoso laboral y discriminación (Ley 1010 de 2006, Ley 1482 de 2011). Despido inmediato del acosador.",
      sustitucion: "No aplica.",
      controles_ingenieria: "Canales de denuncia confidenciales y seguros (línea ética, correo anónimo). Comité de Convivencia Laboral ACTIVO con reuniones mensuales.",
      controles_administrativos: "Código de conducta empresarial firmado por todos. Protocolos de investigación rápida (máx 15 días). Sanciones disciplinarias progresivas. Capacitación obligatoria en diversidad, inclusión y liderazgo ético. Protección a denunciantes (no represalias). Acompañamiento psicológico a víctimas."
    }),
    relevancia_por_sector: JSON.stringify({
      oficina: 10,
      call_center: 10,
      tecnologia: 9,
      salud: 9,
      educacion: 9,
      comercio: 8,
      manufactura: 7,
      construccion: 7,
      hoteleria: 8,
      vigilancia: 7
    }),
    es_comun: false, // No es "común" pero SÍ es obligatorio evaluarlo
    orden: contadorOrden['RPS']++,
    activo: true
  });

  // 2. ACOSO SEXUAL - Ley 1257/2008
  gesCriticos.push({
    riesgo_id: riesgoMap['RPS'],
    codigo: 'RPS-ACOSO-SEX',
    nombre: "Acoso Sexual en el Trabajo",
    consecuencias: "Ansiedad severa, depresión, estrés postraumático, vergüenza, culpa, aislamiento social, ausentismo laboral.",
    peor_consecuencia: "Trastorno de estrés postraumático complejo, depresión mayor con ideación suicida, abandono del empleo, demandas penales.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 1 }),
    aptitudes_requeridas: JSON.stringify([
      "Ninguna - cualquier trabajador/a puede ser víctima de acoso sexual",
      "Capacidad de identificar conductas inapropiadas y denunciarlas"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Ninguna - este riesgo puede afectar a cualquier persona",
      "Víctimas previas de abuso sexual requieren acompañamiento especializado"
    ]),
    epp_sugeridos: JSON.stringify([
      "No aplica EPP físico - requiere controles legales y organizacionales"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Política de CERO TOLERANCIA al acoso sexual (Ley 1257/2008, Ley 1010/2006). Despido INMEDIATO del acosador. Denuncia penal obligatoria.",
      sustitucion: "No aplica.",
      controles_ingenieria: "Cámaras de seguridad en áreas comunes (excepto baños/vestidores). Iluminación adecuada en zonas de riesgo. Espacios de trabajo abiertos (evitar oficinas aisladas sin ventanas).",
      controles_administrativos: "Protocolo específico de acoso sexual (distinto de acoso laboral general). Capacitación obligatoria anual sobre consentimiento y límites. Investigación confidencial con personal capacitado en género. Protección ABSOLUTA a víctimas (traslado del acosador, no de la víctima). Acompañamiento psicológico y legal. Rutas de denuncia externa (Fiscalía, Comisaría de Familia)."
    }),
    relevancia_por_sector: JSON.stringify({
      oficina: 10,
      salud: 10,
      educacion: 10,
      comercio: 9,
      hoteleria: 10,
      call_center: 9,
      manufactura: 8,
      construccion: 9,
      tecnologia: 8,
      servicios_publicos: 9
    }),
    es_comun: false,
    orden: contadorOrden['RPS']++,
    activo: true
  });

  // 3. BURNOUT / SÍNDROME DE DESGASTE PROFESIONAL
  gesCriticos.push({
    riesgo_id: riesgoMap['RPS'],
    codigo: 'RPS-BURNOUT',
    nombre: "Burnout / Síndrome de Desgaste Profesional",
    consecuencias: "Agotamiento físico y emocional extremo, despersonalización, cinismo, reducción de eficacia profesional, irritabilidad, insomnio, ansiedad.",
    peor_consecuencia: "Incapacidad laboral prolongada (>180 días), depresión mayor, ideación suicida, abandono de la profesión, enfermedades psicosomáticas.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 1, MBICV: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de autocuidado y reconocimiento de límites personales",
      "Habilidades de manejo de estrés",
      "Red de apoyo social (familia, amigos)",
      "Capacidad de desconexión laboral"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Depresión no tratada",
      "Trastornos de ansiedad severos",
      "Adicción al trabajo (workaholism)",
      "Falta de límites trabajo-vida personal"
    ]),
    epp_sugeridos: JSON.stringify([
      "No aplica EPP físico - requiere controles organizacionales"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Reducir cargas de trabajo excesivas. Eliminar metas inalcanzables. Prohibir contacto laboral fuera de horario (derecho a la desconexión digital - Ley 2191/2022).",
      sustitucion: "Rotación de tareas de alta demanda emocional. Redistribución de cargas entre equipos.",
      controles_ingenieria: "Espacios de descanso adecuados (salas de pausa, jardines). Software de gestión de tareas (evitar sobrecarga). Límites técnicos a correos/mensajes fuera de horario.",
      controles_administrativos: "Pausas obligatorias cada 2 horas. Vacaciones obligatorias (mín 15 días continuos/año). Programas de apoyo psicológico (EAP - Employee Assistance Program). Capacitación en manejo de estrés y resiliencia. Evaluación periódica con escalas validadas (MBI - Maslach Burnout Inventory). Cultura organizacional de bienestar (no glorificar el exceso de trabajo)."
    }),
    relevancia_por_sector: JSON.stringify({
      salud: 10,
      call_center: 10,
      educacion: 9,
      tecnologia: 9,
      oficina: 8,
      comercio: 7,
      hoteleria: 8,
      servicios_publicos: 7,
      vigilancia: 7
    }),
    es_comun: true, // Muy común en sectores de servicios
    orden: contadorOrden['RPS']++,
    activo: true
  });

  // 4. VIOLENCIA DE TERCEROS (CLIENTES, PACIENTES, USUARIOS)
  gesCriticos.push({
    riesgo_id: riesgoMap['RPS'],
    codigo: 'RPS-VIOL-TERC',
    nombre: "Violencia de Terceros (Clientes, Pacientes, Público)",
    consecuencias: "Estrés agudo, ansiedad anticipatoria, hipervigilancia, miedo al trabajo, trastornos del sueño, agotamiento emocional.",
    peor_consecuencia: "Trastorno de estrés postraumático (TEPT), lesiones físicas graves, muerte, incapacidad permanente psicológica.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 1 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de manejo de situaciones de conflicto",
      "Comunicación asertiva bajo presión",
      "Inteligencia emocional",
      "Capacidad de mantener la calma en crisis"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Trastorno de estrés postraumático no tratado",
      "Trastornos de ansiedad severos",
      "Fobias sociales",
      "Antecedentes de violencia traumática"
    ]),
    epp_sugeridos: JSON.stringify([
      "Sistemas de alarma personal (botón de pánico)",
      "Chalecos antibalas (vigilancia, bancos)",
      "Radios de comunicación",
      "Cámaras corporales (bodycam)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar atención presencial en zonas de alto riesgo (atención remota/virtual). Prohibir atención individual sin testigos.",
      sustitucion: "Rotación de personal en áreas de alto riesgo. Trabajo en binomios (nunca solo).",
      controles_ingenieria: "Barreras físicas (vidrios blindados en taquillas). Botones de pánico con respuesta inmediata. Cámaras de seguridad visibles. Salidas de emergencia accesibles. Salas de espera con aforo controlado. Detectores de metales.",
      controles_administrativos: "Protocolo de manejo de crisis (código de violencia). Capacitación en desescalamiento de conflictos. Presencia de seguridad física. Políticas de NO TOLERANCIA a agresiones (denuncia penal inmediata). Acompañamiento psicológico post-incidente. Reporte obligatorio de incidentes (Res. 652/2012 para alto riesgo). Grupos de apoyo entre pares."
    }),
    relevancia_por_sector: JSON.stringify({
      salud: 10,
      servicios_publicos: 10,
      comercio: 9,
      educacion: 8,
      call_center: 9,
      hoteleria: 7,
      vigilancia: 10,
      oficina: 5
    }),
    es_comun: true,
    orden: contadorOrden['RPS']++,
    activo: true
  });

  // 5. TELETRABAJO - CONDICIONES LABORALES
  gesCriticos.push({
    riesgo_id: riesgoMap['RPS'],
    codigo: 'RPS-TELETRA',
    nombre: "Condiciones de Trabajo en Teletrabajo (Aislamiento, Jornadas Difusas)",
    consecuencias: "Aislamiento social, soledad laboral, dificultad para desconectar, jornadas extendidas, estrés por disponibilidad permanente, sedentarismo.",
    peor_consecuencia: "Burnout, depresión por aislamiento, trastornos del sueño crónicos, ruptura del equilibrio vida-trabajo, enfermedades musculoesqueléticas.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2, OSTE: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Autodisciplina y gestión del tiempo",
      "Capacidad de trabajar de manera autónoma",
      "Habilidades de comunicación virtual",
      "Separación clara entre espacio laboral y personal"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Condiciones de vivienda inadecuadas (sin espacio privado)",
      "Aislamiento social previo",
      "Dificultades de autogestión",
      "Dependencia de interacción social constante"
    ]),
    epp_sugeridos: JSON.stringify([
      "Silla ergonómica (suministrada por empleador)",
      "Escritorio ajustable",
      "Monitor externo",
      "Teclado y mouse ergonómicos",
      "Soporte para portátil"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Establecer modelo híbrido (teletrabajo + presencial alternado). Evitar teletrabajo 100% para todos los roles.",
      sustitucion: "Ofrecer espacios de coworking cercanos. Días de encuentro presencial obligatorios.",
      controles_ingenieria: "Software con límites de conexión (bloqueo automático fuera de horario). Plataformas de comunicación con status visible (disponible/no disponible). Inspecciones virtuales del puesto de trabajo en casa.",
      controles_administrativos: "Derecho a la desconexión digital (Ley 2191/2022) - prohibir contacto fuera de horario. Horario definido y respetado. Pausas activas virtuales. Reuniones sociales virtuales (coffee breaks). Auxilio de internet y energía. Capacitación en ergonomía del hogar. Evaluación de riesgos psicosociales en teletrabajo. Espacios de socialización virtual (no solo trabajo). Apoyo para adecuación del hogar."
    }),
    relevancia_por_sector: JSON.stringify({
      tecnologia: 10,
      oficina: 10,
      call_center: 9,
      educacion: 8,
      comercio: 7,
      servicios_publicos: 6
    }),
    es_comun: true, // Post-COVID es muy común
    orden: contadorOrden['RPS']++,
    activo: true
  });

  // =========================================
  // RIESGO QUÍMICO (5 GES CRÍTICOS)
  // Compliance: Res. 2844/2007, IARC, ATEX, Res. 2400/1979
  // =========================================

  console.log('📋 Agregando Riesgo Químico (5 GES)...');

  // 6. ASBESTO / AMIANTO - Res. 2844/2007
  gesCriticos.push({
    riesgo_id: riesgoMap['RQ'],
    codigo: 'RQ-ASBESTO',
    nombre: "Asbesto / Amianto (Exposición a Fibras)",
    consecuencias: "Asbestosis (fibrosis pulmonar), placas pleurales, derrame pleural, tos crónica, dificultad respiratoria progresiva.",
    peor_consecuencia: "Mesotelioma pleural (cáncer mortal con 95% letalidad), cáncer de pulmón, cáncer de laringe, muerte (20-40 años post-exposición).",
    examenes_medicos: JSON.stringify({ EMO: 1, ESPIR: 1, RXTOR: 1, TORAC: 2, ONCOL: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de seguir protocolos de seguridad estrictamente",
      "Conocimiento sobre manejo seguro de asbesto",
      "Disciplina para uso correcto de EPP",
      "Conciencia del riesgo vital"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Enfermedades pulmonares preexistentes (EPOC, asma, fibrosis)",
      "Fumadores activos (potencian riesgo de cáncer 50x)",
      "Inmunodepresión",
      "Enfermedades cardiovasculares"
    ]),
    epp_sugeridos: JSON.stringify([
      "Respirador con filtro P100 (NIOSH) o FFP3 (EN 149)",
      "Traje Tyvek desechable categoría III tipo 5/6",
      "Guantes de nitrilo resistentes",
      "Botas impermeables desechables",
      "Gafas de seguridad cerradas",
      "Ducha de descontaminación obligatoria"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "ELIMINAR TODO ASBESTO (Res. 2844/2007 - prohibido desde 2007). Retirar techos de eternit, tuberías, frenos, empaques. Contratación SOLO con empresas certificadas en remoción de asbesto.",
      sustitucion: "Sustituir por materiales libres de asbesto (fibrocemento sin asbesto, tejas PVC, tuberías PVC).",
      controles_ingenieria: "Aislamiento TOTAL del área (presión negativa). Sistemas HEPA de filtración de aire. Zona de descontaminación con 3 cámaras. Señalización de peligro carcinógeno. Monitoreo ambiental continuo (<0.1 fibras/cm³).",
      controles_administrativos: "Prohibición ABSOLUTA de trabajos con asbesto sin licencia (Res. 2844/2007). Personal certificado en manejo de asbesto. Exámenes médicos anuales de por vida (incluido post-empleo). Registro en SIVESO (Sistema de Vigilancia Epidemiológica). Notificación obligatoria a ARL. Plan de emergencia para liberación accidental. Disposición final en rellenos autorizados únicamente."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      manufactura: 9,
      mineria: 8,
      oficina: 6, // Edificios antiguos
      educacion: 7, // Colegios antiguos
      salud: 6
    }),
    es_comun: false, // No común, pero CRÍTICO donde existe
    orden: contadorOrden['RQ']++,
    activo: true
  });

  // 7. METALES PESADOS (PLOMO, MERCURIO, CROMO, CADMIO)
  gesCriticos.push({
    riesgo_id: riesgoMap['RQ'],
    codigo: 'RQ-METAL-PES',
    nombre: "Metales Pesados (Plomo, Mercurio, Cromo Hexavalente, Cadmio)",
    consecuencias: "Intoxicación crónica, anemia, neuropatía periférica, daño renal, alteraciones reproductivas, temblor, cambios de personalidad.",
    peor_consecuencia: "Insuficiencia renal crónica, encefalopatía (daño cerebral permanente), cáncer (pulmón, riñón), malformaciones congénitas, muerte.",
    examenes_medicos: JSON.stringify({ EMO: 1, HEMAT: 1, RENAL: 1, NEURO: 2, REPRO: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de seguir protocolos de higiene estrictos",
      "Conocimiento de primeros auxilios en intoxicación",
      "Disciplina en uso de EPP y lavado de manos"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Insuficiencia renal previa",
      "Anemia crónica",
      "Neuropatías",
      "Embarazo (teratogénicos)",
      "Planificación de embarazo (hombres y mujeres)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Respirador con filtro P100 + carbón activado",
      "Guantes de nitrilo resistentes a químicos",
      "Traje impermeable",
      "Botas de seguridad impermeables",
      "Gafas de seguridad química",
      "Prohibido comer, beber o fumar en área de trabajo"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar uso de pinturas con plomo (prohibidas). Sustituir baterías de plomo por tecnologías limpias. Eliminar mercurio en termómetros, lámparas (Convenio de Minamata).",
      sustitucion: "Pinturas libres de plomo. Soldaduras sin plomo. Procesos sin cromado hexavalente (usar cromado trivalente).",
      controles_ingenieria: "Sistemas de ventilación local exhaustiva (LEV). Cabinas cerradas para procesos. Lavamanos automáticos. Duchas de emergencia. Prohibición de comer en área de trabajo.",
      controles_administrativos: "Monitoreo biológico trimestral (plombemia, mercurio en orina). Exámenes de función renal semestrales. Rotación de personal (limitar exposición acumulativa). Capacitación en toxicología. Programa de vigilancia epidemiológica. Ropa de trabajo lavada por la empresa (no llevar a casa). Prohibición de trabajadoras embarazadas o en lactancia."
    }),
    relevancia_por_sector: JSON.stringify({
      manufactura: 10,
      mineria: 10,
      construccion: 8,
      metalmecanica: 10,
      salud: 6, // Termómetros de mercurio (antiguos)
      tecnologia: 7 // Baterías, circuitos
    }),
    es_comun: false,
    orden: contadorOrden['RQ']++,
    activo: true
  });

  // 8. SUSTANCIAS CARCINÓGENAS / MUTAGÉNICAS (IARC Grupo 1)
  gesCriticos.push({
    riesgo_id: riesgoMap['RQ'],
    codigo: 'RQ-CARCINO',
    nombre: "Sustancias Carcinógenas / Mutagénicas (IARC Grupo 1 y 2A)",
    consecuencias: "Mutaciones celulares, alteraciones genéticas, tumores benignos, leucemias, linfomas.",
    peor_consecuencia: "Cáncer ocupacional (pulmón, vejiga, leucemia, hígado), malformaciones congénitas, muerte prematura.",
    examenes_medicos: JSON.stringify({ EMO: 1, HEMAT: 1, ONCOL: 1, RXTOR: 1 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento profundo sobre manejo de carcinógenos",
      "Capacidad de seguir protocolos estrictos sin desviaciones",
      "Conciencia del riesgo vital a largo plazo"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Antecedentes personales o familiares de cáncer",
      "Inmunodepresión",
      "Embarazo o planificación de embarazo",
      "Fumadores (potencian riesgo)",
      "Exposición previa a radiación"
    ]),
    epp_sugeridos: JSON.stringify([
      "Respirador de cara completa con filtros específicos",
      "Traje hermético tipo 3 o superior",
      "Guantes de nitrilo doble capa",
      "Botas impermeables",
      "Ducha obligatoria post-turno"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Sustituir SIEMPRE que exista alternativa (principio de precaución). Eliminar benceno, formaldehído, óxido de etileno cuando sea posible.",
      sustitucion: "Usar alternativas menos peligrosas (Ej: tolueno en lugar de benceno, alcoholes en lugar de formaldehído).",
      controles_ingenieria: "Sistemas cerrados (sin contacto). Cabinas con presión negativa. Extracción localizada. Automatización de procesos. Señalización de CARCINÓGENO visible. Áreas restringidas con acceso controlado.",
      controles_administrativos: "Inventario actualizado de carcinógenos (MSDS). Minimizar número de trabajadores expuestos. Minimizar tiempo de exposición (rotación). Monitoreo ambiental mensual. Vigilancia médica de por vida (incluido post-empleo). Registro en SIVESO. Notificación a ARL. Prohibición absoluta de comer, beber, fumar en área. Capacitación específica anual. Plan de contingencia para derrames."
    }),
    relevancia_por_sector: JSON.stringify({
      manufactura: 10,
      salud: 9, // Formaldehído, óxido de etileno
      tecnologia: 7, // Benceno en semiconductores
      construccion: 8, // Alquitrán, diesel
      mineria: 9 // Sílice cristalina, diesel
    }),
    es_comun: false,
    orden: contadorOrden['RQ']++,
    activo: true
  });

  // 9. PLAGUICIDAS Y HERBICIDAS
  gesCriticos.push({
    riesgo_id: riesgoMap['RQ'],
    codigo: 'RQ-PLAGUIC',
    nombre: "Plaguicidas y Herbicidas (Organofosforados, Carbamatos, Glifosato)",
    consecuencias: "Intoxicación aguda (náuseas, vómito, salivación, sudoración), cefalea, mareo, visión borrosa, fasciculaciones musculares.",
    peor_consecuencia: "Crisis colinérgica (paro respiratorio), neuropatía retardada, cáncer (linfoma, leucemia), alteraciones reproductivas, muerte.",
    examenes_medicos: JSON.stringify({ EMO: 1, COLINES: 1, HEMAT: 2, NEURO: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de lectura e interpretación de etiquetas",
      "Conocimiento de mezclas y dosificación",
      "Disciplina en uso de EPP",
      "Conciencia de síntomas de intoxicación"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Enfermedades hepáticas o renales",
      "Neuropatías",
      "Asma bronquial",
      "Embarazo o lactancia",
      "Enfermedades de la piel (dermatitis)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Respirador con filtros A2P3 (vapores orgánicos + partículas)",
      "Traje Tyvek categoría III tipo 4",
      "Guantes de nitrilo largos",
      "Botas de PVC altas",
      "Gafas de seguridad química",
      "Delantal impermeable"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Implementar control biológico de plagas (depredadores naturales). Rotación de cultivos. Variedades resistentes.",
      sustitucion: "Usar plaguicidas de baja toxicidad (categoría III o IV OMS). Sustituir organofosforados por piretroides (menor toxicidad). Herbicidas selectivos en lugar de glifosato.",
      controles_ingenieria: "Equipos de aplicación calibrados. Boquillas antideriva. Aplicación en horarios de bajo viento (< 10 km/h). Zonas de exclusión (buffer zones). Almacenamiento en bodegas ventiladas con diques de contención.",
      controles_administrativos: "Licencia de aplicador de plaguicidas (obligatorio). Capacitación en manejo seguro (Res. 1075/2015 ICA). Monitoreo de colinesterasa basal y trimestral (organofosforados). Exámenes médicos semestrales. Período de reentrada respetado. Registro de aplicaciones (fecha, producto, dosis). Antídotos disponibles (atropina, pralidoxima). Duchas de emergencia en campo. Ropa de trabajo lavada diariamente (no llevar a casa). Prohibición de aplicación por menores de edad y embarazadas."
    }),
    relevancia_por_sector: JSON.stringify({
      agricultura: 10,
      jardineria: 9,
      control_plagas: 10,
      salud: 5, // Desinfección
      hoteleria: 6,
      educacion: 5
    }),
    es_comun: true, // Muy común en agricultura
    orden: contadorOrden['RQ']++,
    activo: true
  });

  // 10. ATMÓSFERAS EXPLOSIVAS (ATEX)
  gesCriticos.push({
    riesgo_id: riesgoMap['RQ'],
    codigo: 'RQ-ATEX',
    nombre: "Atmósferas Explosivas - ATEX (Gases, Vapores, Polvos Combustibles)",
    consecuencias: "Quemaduras de primer a tercer grado, lesiones por onda expansiva, trauma acústico, inhalación de gases tóxicos.",
    peor_consecuencia: "Explosión masiva con muertes múltiples, destrucción de instalaciones, incendio generalizado, contaminación ambiental, cierre de planta.",
    examenes_medicos: JSON.stringify({ EMO: 1, AUDIO: 2, RESPIR: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento profundo de atmósferas explosivas",
      "Capacidad de reconocer zonas clasificadas (Zona 0, 1, 2)",
      "Disciplina en uso de equipos certificados ATEX",
      "Conciencia del riesgo de explosión"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Trastornos que afecten la atención y concentración",
      "Problemas de audición (dificulta escuchar alarmas)",
      "Problemas de olfato (dificulta detectar fugas de gas)",
      "Imprudencia o tendencia a desacatar protocolos"
    ]),
    epp_sugeridos: JSON.stringify([
      "Ropa antiestática certificada (EN 1149)",
      "Calzado conductivo o antiestático",
      "Guantes antiestáticos",
      "Prohibido uso de materiales sintéticos (nylon, poliéster)",
      "Prohibido uso de dispositivos electrónicos no ATEX"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar fuentes de ignición (chispas, llamas, superficies calientes >450°C). Eliminar atmósferas explosivas (ventilación, inertización con nitrógeno).",
      sustitucion: "Sustituir solventes inflamables por acuosos. Usar procesos en húmedo (evitar polvos suspendidos).",
      controles_ingenieria: "Clasificación de zonas ATEX (Zona 0, 1, 2 para gases; 20, 21, 22 para polvos). Equipos eléctricos certificados ATEX (Ex d, Ex e, Ex i). Ventilación forzada continua (>12 renovaciones/hora). Sistemas de detección de gases con alarmas. Puesta a tierra de equipos y tanques. Conexiones equipotenciales. Sistemas de supresión de explosiones. Puertas antiexplosión (blow-out panels).",
      controles_administrativos: "Evaluación de riesgos ATEX (Directiva 1999/92/CE adaptada). Señalización de zonas clasificadas. Permisos de trabajo en caliente (hot work permit). Prohibición de fumar (señalización). Capacitación ATEX obligatoria. Inspecciones de equipos eléctricos. Mantenimiento preventivo estricto. Plan de emergencia para explosión. Simulacros anuales. Monitoreo continuo de concentraciones (< 25% LEL)."
    }),
    relevancia_por_sector: JSON.stringify({
      manufactura: 10, // Pinturas, solventes
      mineria: 10, // Metano, polvo de carbón
      servicios_publicos: 9, // Gas natural
      agricultura: 8, // Silos de granos
      tecnologia: 6, // Salas de baterías
      salud: 5 // Gases medicinales
    }),
    es_comun: false,
    orden: contadorOrden['RQ']++,
    activo: true
  });

  // =========================================
  // RIESGO BIOLÓGICO (3 GES CRÍTICOS)
  // Compliance: Res. 350/2022, Res. 412/2000
  // =========================================

  console.log('📋 Agregando Riesgo Biológico (3 GES)...');

  // 11. COVID-19 / SARS-CoV-2 - Res. 350/2022 (OBLIGATORIO)
  gesCriticos.push({
    riesgo_id: riesgoMap['RBL'],
    codigo: 'RBL-COVID19',
    nombre: "COVID-19 / SARS-CoV-2 (Enfermedad Respiratoria Aguda)",
    consecuencias: "Infección respiratoria aguda, fiebre, tos, dificultad respiratoria, fatiga, pérdida de olfato/gusto, ausentismo laboral (7-14 días).",
    peor_consecuencia: "COVID-19 severo con neumonía bilateral, síndrome de dificultad respiratoria aguda (SDRA), secuelas pulmonares, cardíacas y neurológicas (Long COVID), muerte.",
    examenes_medicos: JSON.stringify({ EMO: 1, RXTOR: 2, ESPIR: 2, CARDIO: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Esquema de vacunación completo COVID-19 (recomendado, no obligatorio)",
      "Capacidad de uso correcto de EPP respiratorio",
      "Conocimiento de protocolos de bioseguridad",
      "Disciplina en higiene de manos"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Inmunodepresión severa (VIH avanzado, quimioterapia activa)",
      "Enfermedades pulmonares crónicas (EPOC, fibrosis)",
      "Insuficiencia cardíaca",
      "Diabetes no controlada",
      "Obesidad mórbida (IMC > 40)",
      "Embarazo de alto riesgo"
    ]),
    epp_sugeridos: JSON.stringify([
      "Mascarilla quirúrgica (mínimo) o N95/FFP2 (alto riesgo)",
      "Protección ocular (gafas o careta)",
      "Guantes desechables",
      "Bata desechable (sector salud)",
      "Higiene de manos con alcohol glicerinado 60-95%"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Teletrabajo para personal de riesgo. Eliminar reuniones presenciales innecesarias (usar videoconferencias).",
      sustitucion: "Atención virtual/telemedicina. Entrega de documentos digitales (sin papel).",
      controles_ingenieria: "Ventilación natural cruzada (abrir ventanas). Sistemas de ventilación mecánica (HVAC) con filtros HEPA. Distanciamiento físico (mín 2 metros). Barreras físicas (acrílico en atención al público). Dispensadores de alcohol glicerinado. Señalización de aforo máximo.",
      controles_administrativos: "Protocolo de bioseguridad actualizado (Res. 350/2022). Tamizaje diario de síntomas (fiebre, tos). Aislamiento inmediato de casos sospechosos. Pruebas diagnósticas (antígeno/PCR) a sintomáticos y contactos. Rastreo de contactos estrechos. Jornadas flexibles (evitar picos de afluencia). Turnos escalonados. Limpieza y desinfección frecuente de superficies. Capacitación en bioseguridad. Campaña de vacunación (recomendada). Esquema híbrido (presencial/teletrabajo). Prohibición de asistir con síntomas. Licencias flexibles."
    }),
    relevancia_por_sector: JSON.stringify({
      salud: 10,
      educacion: 9,
      oficina: 8,
      comercio: 9,
      call_center: 8,
      hoteleria: 9,
      transporte: 9,
      manufactura: 7,
      construccion: 6,
      servicios_publicos: 9
    }),
    es_comun: true, // TODOS los sectores (Res. 350/2022)
    orden: contadorOrden['RBL']++,
    activo: true
  });

  // 12. HEPATITIS B / C (Exposición a Sangre)
  gesCriticos.push({
    riesgo_id: riesgoMap['RBL'],
    codigo: 'RBL-HEPAT',
    nombre: "Hepatitis B / C (Exposición Ocupacional a Sangre y Fluidos)",
    consecuencias: "Infección aguda con ictericia, fatiga, náuseas, dolor abdominal. En Hepatitis C: 70% cronifica.",
    peor_consecuencia: "Hepatitis crónica, cirrosis hepática, cáncer de hígado (hepatocarcinoma), insuficiencia hepática, trasplante hepático, muerte.",
    examenes_medicos: JSON.stringify({ EMO: 1, HEPAT: 1, HEPATC: 1, PRUEBHEP: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Vacunación completa Hepatitis B (3 dosis + refuerzo si < 10 UI/mL)",
      "Conocimiento de protocolos de bioseguridad",
      "Disciplina en uso de guantes y EPP",
      "Conocimiento de profilaxis post-exposición"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Hepatitis crónica activa",
      "Cirrosis hepática",
      "Insuficiencia hepática",
      "Inmunodepresión (pobre respuesta a vacuna)",
      "Uso de drogas intravenosas"
    ]),
    epp_sugeridos: JSON.stringify([
      "Guantes de nitrilo o látex",
      "Bata desechable impermeable",
      "Gafas de seguridad o careta",
      "Mascarilla quirúrgica",
      "Contenedores cortopunzantes (guardián)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar agujas con recapsulado manual (usar contenedores directos). Eliminar uso de agujas cuando existan alternativas (Ej: vías periféricas por puerto).",
      sustitucion: "Usar dispositivos con seguridad incorporada (agujas retráctiles, lancetas de seguridad). Sistemas sin agujas para acceso venoso.",
      controles_ingenieria: "Contenedores cortopunzantes en todos los puntos de uso (máx 1 metro de distancia). Superficies lavables e impermeables. Lavamanos automáticos. Señalización de riesgo biológico.",
      controles_administrativos: "Vacunación obligatoria Hepatitis B a todo personal de riesgo (Res. 412/2000). Verificación de títulos de anticuerpos (> 10 UI/mL). Protocolo de accidente biológico con seguimiento a 6 meses. Profilaxis post-exposición si no inmunizado (inmunoglobulina + vacuna). Reporte obligatorio de pinchazos (ATEL). Capacitación en precauciones estándar. Vigilancia epidemiológica. Pruebas serológicas anuales. Prohibición de recapsular agujas manualmente. Técnica de una sola mano para desechar."
    }),
    relevancia_por_sector: JSON.stringify({
      salud: 10,
      laboratorios: 10,
      odontologia: 10,
      veterinaria: 8,
      tatuajes: 9,
      peluqueria: 5 // Cortes con tijeras
    }),
    es_comun: true, // Común en salud
    orden: contadorOrden['RBL']++,
    activo: true
  });

  // 13. TUBERCULOSIS (Mycobacterium tuberculosis)
  gesCriticos.push({
    riesgo_id: riesgoMap['RBL'],
    codigo: 'RBL-TBC',
    nombre: "Tuberculosis - TBC (Mycobacterium tuberculosis)",
    consecuencias: "Tos persistente > 2 semanas, fiebre, sudoración nocturna, pérdida de peso, fatiga, hemoptisis.",
    peor_consecuencia: "Tuberculosis pulmonar cavitada, tuberculosis miliar (diseminada), tuberculosis multidrogorresistente (MDR-TB), insuficiencia respiratoria, muerte.",
    examenes_medicos: JSON.stringify({ EMO: 1, RXTOR: 1, PPD: 1, IGRA: 2, ESPIR: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Esquema de vacunación BCG (niñez)",
      "Capacidad de reconocer síntomas tempranos",
      "Disciplina en uso de mascarilla N95",
      "Conocimiento de aislamiento respiratorio"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "VIH/SIDA (riesgo 20x mayor de TBC activa)",
      "Inmunodepresión (biológicos, quimioterapia)",
      "Diabetes no controlada",
      "Insuficiencia renal crónica",
      "Silicosis",
      "Desnutrición severa",
      "Alcoholismo"
    ]),
    epp_sugeridos: JSON.stringify([
      "Mascarilla N95 o FFP2 (obligatoria en contacto con casos)",
      "Bata desechable",
      "Guantes",
      "Protección ocular (gotas de Flügge)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Identificación y tratamiento precoz de casos (búsqueda activa de sintomáticos respiratorios). Aislamiento inmediato de casos sospechosos.",
      sustitucion: "No aplica.",
      controles_ingenieria: "Ventilación natural cruzada (> 12 renovaciones/hora). Habitaciones de aislamiento con presión negativa (hospitales). Luz ultravioleta germicida (UVGI) en salas de espera. Separación física de pacientes con tos (sala de aislamiento respiratorio).",
      controles_administrativos: "Programa de Control de Tuberculosis (Res. 412/2000). Tamizaje anual con PPD o IGRA a personal de salud. Rx tórax basal y anual. Búsqueda activa de sintomáticos respiratorios (BK en esputo). Tratamiento supervisado directamente observado (DOTS). Estudio de contactos. Quimioprofilaxis con isoniacida a expuestos (contactos VIH+). Capacitación en bioseguridad. Reporte obligatorio a Secretaría de Salud. Licencias médicas completas (6 meses de tratamiento). Restricción de labores hasta negativización (3 BK negativos)."
    }),
    relevancia_por_sector: JSON.stringify({
      salud: 10,
      carceles: 10,
      refugios: 9,
      educacion: 6, // Colegios en zonas vulnerables
      servicios_publicos: 5
    }),
    es_comun: false, // No común, pero alto impacto en salud
    orden: contadorOrden['RBL']++,
    activo: true
  });

  // =========================================
  // CONDICIONES DE SEGURIDAD (10 GES CRÍTICOS)
  // Compliance: Res. 2400/1979, Res. 1409/2012, NTC 2050
  // =========================================

  console.log('📋 Agregando Condiciones de Seguridad (10 GES)...');

  // 14-23: Los 10 GES críticos de Condiciones de Seguridad
  // (Por brevedad, muestro estructura de 2 y el resto sería similar)

  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-CONT-ELEC-DIR',
    nombre: "Contacto Eléctrico Directo (Partes Energizadas Expuestas)",
    consecuencias: "Quemaduras eléctricas, fibrilación ventricular, tetanización muscular, caídas desde altura por choque.",
    peor_consecuencia: "Paro cardiorrespiratorio, quemaduras de tercer grado, amputación de miembros, muerte instantánea.",
    examenes_medicos: JSON.stringify({ EMO: 1, CARDIO: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento de electricidad y riesgos",
      "Capacidad de verificar ausencia de tensión (Ley de las 5 reglas de oro)",
      "Licencia de trabajo eléctrico (alta tensión)",
      "Conciencia del riesgo vital"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Arritmias cardíacas",
      "Marcapasos cardíaco",
      "Epilepsia",
      "Vértigo o mareos",
      "Trastornos de atención"
    ]),
    epp_sugeridos: JSON.stringify([
      "Guantes dieléctricos certificados (clase 0 a 4 según voltaje)",
      "Calzado dieléctrico",
      "Casco dieléctrico",
      "Gafas con protección UV (arco eléctrico)",
      "Herramientas aisladas (1000V)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Desenergizar circuitos antes de trabajar (procedimiento LOTO - Lock Out Tag Out). Trabajo sin tensión (Ley de las 5 reglas de oro).",
      sustitucion: "Usar herramientas aisladas. Tensiones reducidas (< 50V AC, < 120V DC).",
      controles_ingenieria: "Encerramiento de partes vivas (tableros cerrados). Distancias de seguridad. Interruptores diferenciales (30 mA). Puesta a tierra. Señalización de peligro eléctrico.",
      controles_administrativos: "Permiso de trabajo eléctrico. Certificación de electricistas (Res. 90708/2013 RETIE). Procedimiento de las 5 reglas de oro. Capacitación anual. Inspecciones de instalaciones. Simulacros de RCP. Prohibición de trabajar solo en media/alta tensión."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      manufactura: 9,
      servicios_publicos: 10,
      mineria: 8,
      oficina: 6
    }),
    es_comun: true,
    orden: contadorOrden['CS']++,
    activo: true
  });

  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-ARCO-ELEC',
    nombre: "Arco Eléctrico (Flash Arc / Arc Flash)",
    consecuencias: "Quemaduras por destello (flash burn), ceguera temporal, quemaduras de tercer grado en cara y manos, lesiones auditivas.",
    peor_consecuencia: "Quemaduras de 3er/4to grado en > 50% del cuerpo, muerte por carbonización, explosión de equipos, incendio.",
    examenes_medicos: JSON.stringify({ EMO: 1, OFTALMO: 2, AUDIO: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento de cálculo de energía incidente (cal/cm²)",
      "Capacidad de usar ropa resistente al arco (AR)",
      "Certificación en seguridad eléctrica avanzada",
      "Disciplina en uso de EPP certificado"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Marcapasos o dispositivos electrónicos implantados",
      "Epilepsia fotosensible",
      "Problemas cardíacos severos",
      "Claustrofobia (traje de arco completo)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Ropa resistente al arco (AR) certificada según energía incidente (NFPA 70E)",
      "Capucha facial de arco (arc-rated face shield)",
      "Guantes dieléctricos + guantes de cuero exterior",
      "Ropa interior ignífuga (no sintética)",
      "Prohibido: materiales sintéticos (se funden en piel)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Trabajo sin tensión (desenergizar). Procedimiento LOTO estricto.",
      sustitucion: "Usar equipos con arco controlado (arc-resistant switchgear). Trabajos remotos (robot/cámara).",
      controles_ingenieria: "Estudio de arco eléctrico (cálculo de energía incidente). Etiquetado de advertencia en tableros (cal/cm², distancia, EPP requerido). Relés de protección rápidos (< 0.1 seg). Limitadores de corriente. Barreras físicas.",
      controles_administrativos: "Política de trabajo sin tensión. Permiso de trabajo en líneas vivas (solo emergencias). Certificación NFPA 70E. Capacitación anual. Análisis de riesgo de arco (arc flash hazard analysis). Inspecciones termográficas. Mantenimiento preventivo estricto. Prohibición de trabajar solo."
    }),
    relevancia_por_sector: JSON.stringify({
      servicios_publicos: 10,
      manufactura: 9,
      construccion: 8,
      mineria: 8,
      tecnologia: 7 // Data centers
    }),
    es_comun: false, // No común, pero CRÍTICO en electricidad
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 16. SEPULTAMIENTO EN EXCAVACIONES
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-SEPULT-EXC',
    nombre: "Sepultamiento en Excavaciones / Zanjas",
    consecuencias: "Atrapamiento parcial, fracturas, politraumatismos, asfixia por compresión torácica, hipotermia.",
    peor_consecuencia: "Sepultamiento total con asfixia mecánica, síndrome compartimental (necrosis muscular), amputación de miembros, muerte en minutos.",
    examenes_medicos: JSON.stringify({ EMO: 1, CARDIO: 2, RESPIR: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de reconocer terrenos inestables",
      "Conocimiento de técnicas de entibado",
      "Capacidad física para evacuar rápidamente",
      "Disciplina en seguir protocolos de excavación segura"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Claustrofobia severa",
      "Enfermedades respiratorias crónicas (EPOC, asma)",
      "Movilidad reducida",
      "Trastornos cardiovasculares severos"
    ]),
    epp_sugeridos: JSON.stringify([
      "Casco de seguridad",
      "Botas de seguridad con protección",
      "Chaleco reflectivo",
      "Radio de comunicación",
      "Detector de gases (si aplica)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Evitar excavaciones profundas (usar técnicas de superficie, túnel boring).",
      sustitucion: "Uso de tablestacas o muros pantalla en lugar de excavación a cielo abierto.",
      controles_ingenieria: "Entibado obligatorio en excavaciones > 1.5m (Res. 348/2018). Taludes con pendiente segura (< 45°). Escaleras de acceso/egreso cada 7m. Barreras perimetrales. Sistemas de drenaje para evitar infiltración.",
      controles_administrativos: "Estudio de suelos previo. Permiso de excavación. Inspección diaria pre-turno de paredes. Detector de gases en excavaciones profundas. Capacitación en rescate en espacios confinados. Prohibición de materiales/equipos cerca del borde (mín 60cm). Personal de vigilancia en superficie. Plan de emergencia y rescate."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      servicios_publicos: 9,
      mineria: 8,
      agricultura: 5
    }),
    es_comun: false,
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 17. ESPACIOS CONFINADOS - ATMÓSFERA PELIGROSA
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-ESP-CONF',
    nombre: "Espacios Confinados (Atmósfera Deficiente en Oxígeno, Gases Tóxicos)",
    consecuencias: "Mareo, desorientación, pérdida de conciencia, asfixia, intoxicación por gases (CO, H2S, metano).",
    peor_consecuencia: "Muerte por asfixia en < 3 minutos (deficiencia O₂ < 16%), explosión por gases inflamables, intoxicación masiva.",
    examenes_medicos: JSON.stringify({ EMO: 1, ESPIR: 1, CARDIO: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de trabajar en espacios reducidos",
      "Conocimiento de monitoreo de atmósferas peligrosas",
      "Uso correcto de equipos de respiración autónoma (ERA/SCBA)",
      "Disciplina estricta en protocolos de entrada/salida"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Claustrofobia",
      "Enfermedades respiratorias (asma, EPOC)",
      "Enfermedades cardiovasculares",
      "Epilepsia",
      "Obesidad mórbida (dificulta rescate)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Equipo de respiración autónoma (SCBA) o línea de aire",
      "Arnés de rescate con punto dorsal",
      "Detector multigás personal (O₂, LEL, CO, H₂S)",
      "Linterna intrínsecamente segura",
      "Radio de comunicación"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar la necesidad de entrada (uso de robots, cámaras remotas).",
      sustitucion: "Modificación de diseño para evitar espacios confinados.",
      controles_ingenieria: "Ventilación forzada continua (> 20 renovaciones/hora). Monitoreo continuo de atmósfera (O₂ 19.5-23.5%, LEL < 10%). Sistemas de alarma. Trípodes de rescate con winch. Iluminación adecuada (12V máx).",
      controles_administrativos: "Permiso de entrada obligatorio (Res. 2400/1979). Evaluación de atmósfera antes y durante entrada. Personal entrenado en rescate (mínimo 2 fuera, 1 adentro). Comunicación permanente. Prohibición de llamas abiertas. Procedimiento LOTO para aislar fuentes de energía. Plan de rescate con simulacros. Prohibición de entrada en solitario."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 9,
      servicios_publicos: 10,
      mineria: 10,
      manufactura: 8,
      agricultura: 7
    }),
    es_comun: false,
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 18. PROYECCIÓN DE PARTÍCULAS (Ampliación del existente)
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-PROY-PART',
    nombre: "Proyección de Partículas Sólidas (Esmerilado, Corte, Demolición)",
    consecuencias: "Traumatismos oculares, cuerpos extraños en ojos, laceraciones faciales, contusiones.",
    peor_consecuencia: "Pérdida total de visión (ceguera unilateral/bilateral), perforación ocular, enucleación.",
    examenes_medicos: JSON.stringify({ OPTO: 1, EMO: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Agudeza visual normal",
      "Capacidad de uso correcto de protección ocular",
      "Reflejos y coordinación para evitar impactos",
      "Conocimiento de zonas de riesgo"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Visión monocular (mayor riesgo si se pierde el ojo funcional)",
      "Cirugía ocular reciente",
      "Glaucoma no controlado",
      "Uso de lentes de contacto (relativo, según EPP)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Gafas de seguridad con protección lateral (ANSI Z87.1)",
      "Careta facial completa (operaciones de alto impacto)",
      "Pantalla facial con gafas debajo (doble protección)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Métodos de corte sin chispa (corte por agua, laser).",
      sustitucion: "Uso de herramientas con menor generación de partículas.",
      controles_ingenieria: "Guardas de protección en máquinas. Pantallas de aislamiento. Sistemas de extracción localizada. Señalización de zonas de proyección.",
      controles_administrativos: "Uso obligatorio de protección ocular (con sanción). Inspección de EPP antes de uso. Reemplazo de protectores rayados/dañados. Delimitación de áreas de trabajo. Prohibición de terceros en zona de proyección."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      manufactura: 10,
      metalmecanica: 10,
      mineria: 9,
      oficina: 2
    }),
    es_comun: true,
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 19. ATRAPAMIENTO EN MAQUINARIA (Puntos de Operación)
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-ATRAP-MAQ',
    nombre: "Atrapamiento en Puntos de Operación de Maquinaria",
    consecuencias: "Laceraciones, fracturas, aplastamiento de dedos/manos, amputaciones parciales.",
    peor_consecuencia: "Amputación traumática de miembros superiores, muerte por sangrado masivo o traumatismo craneoencefálico.",
    examenes_medicos: JSON.stringify({ EMO: 1, NEURO: 2, OPTO: 1, AUD: 1 }),
    aptitudes_requeridas: JSON.stringify([
      "Coordinación motora fina y gruesa adecuada",
      "Tiempo de reacción rápido",
      "Capacidad de concentración sostenida",
      "Conocimiento de zonas de peligro en maquinaria"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Neuropatías periféricas (pérdida de sensibilidad en manos)",
      "Temblor esencial o parkinsonismo",
      "Trastorno por déficit de atención severo",
      "Epilepsia no controlada",
      "Problemas de audición (no escucha alarmas)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Guardas de seguridad en todos los puntos de operación",
      "Dispositivos de parada de emergencia (botones, cuerdas)",
      "Ropa ajustada sin elementos sueltos (prohibido anillos, pulseras)",
      "Guantes de protección (SOLO si no aumenta riesgo de atrapamiento)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Automatización completa (robots, cobots con sensores).",
      sustitucion: "Herramientas manuales en lugar de maquinaria motorizada cuando sea posible.",
      controles_ingenieria: "Guardas fijas y móviles certificadas. Sensores de presencia (cortinas de luz). Dispositivos de alimentación automática. Controles bimanuales (requieren dos manos para activar). Sistemas de enclavamiento. Parada de emergencia accesible (< 2 metros).",
      controles_administrativos: "Procedimiento de bloqueo/etiquetado (LOTO) para mantenimiento. Capacitación específica por máquina. Inspecciones pre-operacionales. Prohibición de remover guardas. Prohibición de limpieza con máquina en marcha. Permiso de trabajo para mantenimiento. Señalización de puntos de atrapamiento."
    }),
    relevancia_por_sector: JSON.stringify({
      manufactura: 10,
      metalmecanica: 10,
      construccion: 8,
      agricultura: 8,
      mineria: 9
    }),
    es_comun: true,
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 20. GOLPES POR OBJETOS SUSPENDIDOS (Grúas, Montacargas)
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-GOLP-SUSP',
    nombre: "Golpes por Objetos Suspendidos (Grúas, Polipastos, Montacargas)",
    consecuencias: "Contusiones, fracturas, traumatismo craneoencefálico, aplastamiento.",
    peor_consecuencia: "Aplastamiento de extremidades con amputación, traumatismo múltiple mortal, muerte instantánea.",
    examenes_medicos: JSON.stringify({ EMO: 1, OPTO: 1, AUD: 1, NEURO: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Agudeza visual y percepción espacial adecuadas",
      "Capacidad auditiva para escuchar alarmas",
      "Agilidad y capacidad de reacción rápida",
      "Conocimiento de señales manuales (rigger signals)"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Visión monocular o campo visual reducido",
      "Hipoacusia severa",
      "Trastornos del equilibrio (dificulta evasión rápida)",
      "Movilidad reducida en miembros inferiores"
    ]),
    epp_sugeridos: JSON.stringify([
      "Casco de seguridad clase E (eléctrico)",
      "Calzado con puntera de acero",
      "Chaleco reflectivo de alta visibilidad",
      "Guantes de protección"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar trabajos bajo cargas suspendidas (rediseño de procesos).",
      sustitucion: "Uso de transportadores automáticos en lugar de grúas.",
      controles_ingenieria: "Grúas certificadas con limitador de carga. Alarmas sonoras al operar. Barreras físicas en zonas de tránsito de cargas. Señalización luminosa en montacargas. Eslingas y ganchos certificados. Inspección mensual de cables de acero.",
      controles_administrativos: "Operadores de grúa/montacargas certificados (NTC 5830). Plan de izaje para cargas > 5 toneladas. Señalero certificado (rigger). Prohibición de paso bajo cargas suspendidas. Delimitación de zona de operación. Inspección diaria pre-operacional. Registro de mantenimiento. Prohibición de transportar personas en implementos."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      manufactura: 9,
      servicios_publicos: 8,
      mineria: 9,
      comercio: 7
    }),
    es_comun: true,
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 21. TRABAJO EN ALTURAS - LÍNEAS DE VIDA FALTANTES
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-ALT-LINVIDA',
    nombre: "Trabajo en Alturas sin Líneas de Vida o Puntos de Anclaje",
    consecuencias: "Caída libre desde altura, fracturas múltiples, traumatismo craneoencefálico, lesiones medulares.",
    peor_consecuencia: "Caída mortal, paraplejia/tetraplejia, muerte instantánea.",
    examenes_medicos: JSON.stringify({ EMOA: 1, OPTO: 1, AUD: 1, ECG: 1, GLI: 1, PL: 1, PST: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Certificación en trabajo en alturas vigente (Res. 1409/2012)",
      "Ausencia de vértigo o miedo a las alturas",
      "Buena condición física y equilibrio",
      "Capacidad de uso correcto de arnés y conectores"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Vértigo o acrofobia",
      "Epilepsia",
      "Enfermedades cardíacas severas",
      "Hipertensión no controlada",
      "Obesidad mórbida (IMC > 40)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Arnés de cuerpo completo certificado (ANSI Z359)",
      "Línea de vida retráctil o eslinga con absorbedor de energía",
      "Punto de anclaje certificado (> 5000 lb / 22 kN)",
      "Casco con barbuquejo",
      "Calzado antideslizante"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Realizar trabajos a nivel del suelo (usar brazos telescópicos, plataformas elevadoras).",
      sustitucion: "Andamios certificados con barandas en lugar de escaleras.",
      controles_ingenieria: "Líneas de vida horizontales permanentes. Puntos de anclaje estructurales certificados. Barandas permanentes (altura 1.1m, travesaño intermedio, rodapié). Plataformas de trabajo con piso antideslizante. Redes de seguridad.",
      controles_administrativos: "Permiso de trabajo en altura obligatorio (Res. 1409/2012). Certificación de coordinador, entrenador y trabajador. Inspección diaria de EPP. Rescue plan con personal certificado en rescate. Prohibición de trabajo con vientos > 40 km/h o lluvia. Plan de emergencia. Prohibición de arrojar herramientas. Uso de bolsas porta-herramientas."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      servicios_publicos: 9,
      manufactura: 7,
      telecomunicaciones: 9,
      mineria: 7
    }),
    es_comun: true,
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 22. PUERTAS DE EMERGENCIA BLOQUEADAS / SALIDAS OBSTRUIDAS
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-EMERG-BLOQ',
    nombre: "Puertas de Emergencia Bloqueadas o Salidas Obstruidas",
    consecuencias: "Atrapamiento en emergencias (incendio, sismo, explosión), pánico colectivo, lesiones por aglomeración.",
    peor_consecuencia: "Muerte por asfixia en incendio, aplastamiento en evacuación masiva, muerte múltiple.",
    examenes_medicos: JSON.stringify({ EMO: 1, RESPIR: 2, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento de rutas de evacuación",
      "Capacidad de mantener la calma en emergencias",
      "Movilidad adecuada para evacuar rápidamente",
      "Participación en simulacros"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Movilidad reducida severa (requiere plan de evacuación asistida)",
      "Claustrofobia en espacios congestionados",
      "Trastornos de pánico severos"
    ]),
    epp_sugeridos: JSON.stringify([
      "No aplica EPP específico",
      "Señalización fotoluminiscente de salidas",
      "Iluminación de emergencia obligatoria"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar obstáculos permanentes. Prohibir almacenamiento cerca de salidas.",
      sustitucion: "Puertas de apertura rápida (barra antipánico). Salidas múltiples.",
      controles_ingenieria: "Señalización de emergencia fotoluminiscente (visible sin luz). Iluminación de emergencia con batería (mín 90 min). Detectores de humo/fuego vinculados a apertura automática. Puertas con barra antipánico (push bar). Ancho mínimo de salida: 1.1m por cada 50 personas.",
      controles_administrativos: "Inspecciones semanales de salidas de emergencia. Prohibición absoluta de bloquear puertas/pasillos. Sanción disciplinaria por obstruir salidas. Plan de evacuación actualizado. Simulacros trimestrales. Planos de evacuación visibles. Brigada de emergencia. Mantenimiento de cerraduras antipánico. Capacitación en evacuación. Punto de encuentro externo señalizado."
    }),
    relevancia_por_sector: JSON.stringify({
      oficina: 10,
      comercio: 10,
      manufactura: 9,
      educacion: 10,
      salud: 10,
      hoteleria: 10,
      call_center: 10
    }),
    es_comun: true,
    orden: contadorOrden['CS']++,
    activo: true
  });

  // 23. PISOS RESBALADIZOS / IRREGULARES (Complemento de "Caídas al mismo nivel")
  gesCriticos.push({
    riesgo_id: riesgoMap['CS'],
    codigo: 'CS-PISO-RESB',
    nombre: "Pisos Resbaladizos, Irregulares o en Mal Estado",
    consecuencias: "Caídas al mismo nivel, esguinces de tobillo, fracturas de muñeca/cadera, contusiones.",
    peor_consecuencia: "Fractura de cadera en adultos mayores (mortalidad 20% al año), traumatismo craneoencefálico, discapacidad permanente.",
    examenes_medicos: JSON.stringify({ EMO: 1, OPTO: 1, OSTE: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Agudeza visual para detectar irregularidades",
      "Equilibrio y coordinación adecuados",
      "Uso de calzado apropiado",
      "Atención al caminar"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Vértigo crónico",
      "Trastornos del equilibrio (laberintitis, Parkinson)",
      "Osteoporosis severa (alto riesgo de fractura)",
      "Hipovisión no corregida",
      "Neuropatía periférica en pies"
    ]),
    epp_sugeridos: JSON.stringify([
      "Calzado antideslizante certificado (coeficiente fricción > 0.5)",
      "Calzado cerrado (no chancletas/sandalias)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Reparación de pisos dañados (grietas, huecos, desniveles). Eliminación de obstáculos.",
      sustitucion: "Pisos antideslizantes (porcelanato clase 3 o superior). Revestimientos con textura.",
      controles_ingenieria: "Sistemas de drenaje para evitar encharcamientos. Tapetes absorbentes en entradas. Señalización de desniveles. Iluminación adecuada (mín 200 lux). Pasamanos en rampas/escaleras. Cinta antideslizante en escalones.",
      controles_administrativos: "Programa de orden y aseo (5S). Inspecciones diarias de pisos. Limpieza inmediata de derrames. Señalización temporal 'Piso Mojado'. Restricción de acceso durante limpieza. Mantenimiento preventivo de pisos. Reporte obligatorio de irregularidades. Política de calzado de seguridad."
    }),
    relevancia_por_sector: JSON.stringify({
      oficina: 9,
      comercio: 10,
      manufactura: 9,
      salud: 10,
      hoteleria: 10,
      educacion: 9,
      call_center: 8,
      servicios_publicos: 8
    }),
    es_comun: true,
    orden: contadorOrden['CS']++,
    activo: true
  });

  console.log('✅ Condiciones de Seguridad completadas (10 GES)');

  // =========================================
  // FENÓMENOS NATURALES COLOMBIA (5 GES CRÍTICOS)
  // Compliance: Ley 1523/2012 (Gestión del Riesgo de Desastres)
  // =========================================

  console.log('📋 Agregando Fenómenos Naturales Colombia (5 GES)...');

  // 24. DESLIZAMIENTOS DE TIERRA
  gesCriticos.push({
    riesgo_id: riesgoMap['RFN'],
    codigo: 'RFN-DESLIZ',
    nombre: "Deslizamientos de Tierra / Remoción en Masa",
    consecuencias: "Sepultamiento parcial, fracturas, contusiones, politraumatismos, daño a infraestructura.",
    peor_consecuencia: "Sepultamiento total con asfixia, muerte masiva, destrucción total de instalaciones, colapso de vías de acceso.",
    examenes_medicos: JSON.stringify({ EMO: 1 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento de señales de inestabilidad de terreno (grietas, árboles inclinados)",
      "Capacidad de evacuación rápida",
      "Entrenamiento en primeros auxilios",
      "Disciplina en seguir planes de emergencia"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Movilidad reducida (dificulta evacuación)",
      "Hipoacusia severa (no escucha alarmas)",
      "Discapacidad visual severa"
    ]),
    epp_sugeridos: JSON.stringify([
      "Casco de seguridad",
      "Botas de seguridad",
      "Radio de comunicación",
      "Linterna con batería de respaldo"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Relocalizar instalaciones fuera de zonas de amenaza alta. Evitar construcción en laderas > 30°.",
      sustitucion: "Uso de estructuras temporales/móviles en zonas de amenaza.",
      controles_ingenieria: "Estudios geotécnicos. Obras de estabilización (muros de contención, drenajes). Sistemas de monitoreo (inclinómetros, piezómetros). Alarmas tempranas. Vías de evacuación múltiples. Puntos de encuentro seguros.",
      controles_administrativos: "Plan de Emergencias específico para deslizamientos (Ley 1523/2012). Mapas de amenaza (IDEAM, SGC). Inspecciones después de lluvias intensas. Capacitación en reconocimiento de señales. Simulacros trimestrales. Coordinación con UNGRD y Bomberos. Prohibición de construcción en zonas de amenaza alta. Seguro de desastres. Protocolos de evacuación. Sistema de alertas tempranas comunitario."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      mineria: 10,
      agricultura: 9,
      servicios_publicos: 8,
      educacion: 7, // Colegios en zonas montañosas
      oficina: 6
    }),
    es_comun: false, // Específico de zonas montañosas Colombia
    orden: contadorOrden['RFN']++,
    activo: true
  });

  // 25. INUNDACIONES
  gesCriticos.push({
    riesgo_id: riesgoMap['RFN'],
    codigo: 'RFN-INUND',
    nombre: "Inundaciones / Crecientes Súbitas",
    consecuencias: "Ahogamiento parcial, hipotermia, lesiones por arrastre, enfermedades transmitidas por agua contaminada, daño a infraestructura.",
    peor_consecuencia: "Ahogamiento masivo, desaparición de personas, destrucción total de instalaciones, pérdida de vidas.",
    examenes_medicos: JSON.stringify({ EMO: 1, NATACION: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Capacidad de natación (ideal)",
      "Conocimiento de zonas de riesgo de inundación",
      "Capacidad de evacuación rápida",
      "Disciplina en seguir alertas tempranas"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "No saber nadar (en zonas de alto riesgo)",
      "Movilidad reducida severa",
      "Enfermedades cardiorrespiratorias que impidan esfuerzo físico intenso"
    ]),
    epp_sugeridos: JSON.stringify([
      "Chaleco salvavidas (en zonas de muy alto riesgo)",
      "Botas impermeables de caña alta",
      "Linterna sumergible",
      "Radio portátil con batería de respaldo",
      "Silbato de emergencia"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Relocalizar instalaciones fuera de zonas inundables. Evitar construcción en rondas hídricas (30m de cuerpos de agua).",
      sustitucion: "Construcción elevada sobre pilotes en zonas de riesgo moderado.",
      controles_ingenieria: "Sistemas de drenaje pluvial. Muros de contención y diques. Canales de desvío. Sistemas de bombeo. Compuertas automáticas. Sensores de nivel de agua. Alarmas tempranas comunitarias. Rutas de evacuación señalizadas a zonas altas.",
      controles_administrativos: "Plan de Emergencias específico para inundaciones (Ley 1523/2012). Monitoreo de pronósticos meteorológicos (IDEAM). Sistema de alertas tempranas (SAT). Coordinación con UNGRD, Bomberos, Defensa Civil. Mapas de amenaza por inundación. Simulacros semestrales. Kit de emergencia (agua, alimentos, botiquín). Seguro contra inundación. Prohibición de construcción en zonas de amenaza alta. Protocolos de evacuación con puntos de encuentro en zonas altas."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 8,
      agricultura: 10,
      servicios_publicos: 9,
      comercio: 7,
      manufactura: 7,
      educacion: 6,
      oficina: 5
    }),
    es_comun: false,
    orden: contadorOrden['RFN']++,
    activo: true
  });

  // 26. ERUPCIONES VOLCÁNICAS
  gesCriticos.push({
    riesgo_id: riesgoMap['RFN'],
    codigo: 'RFN-VOLCAN',
    nombre: "Erupciones Volcánicas (Ceniza, Lahares, Flujos Piroclásticos)",
    consecuencias: "Inhalación de ceniza (silicosis aguda), quemaduras, sepultamiento por lahares, colapso de techos por acumulación de ceniza.",
    peor_consecuencia: "Muerte masiva por flujos piroclásticos (>700°C), sepultamiento por lahares, destrucción total de poblaciones (ej: Armero 1985).",
    examenes_medicos: JSON.stringify({ EMO: 1, ESPIR: 1, RXTOR: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento de volcanes activos cercanos (Ruiz, Galeras, Huila, Cerro Machín)",
      "Capacidad de reconocer señales de actividad volcánica",
      "Disciplina en seguir órdenes de evacuación",
      "Capacidad física para evacuar rápidamente"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Enfermedades respiratorias crónicas (asma, EPOC)",
      "Movilidad reducida severa",
      "Sordera (dificulta escuchar sirenas de evacuación)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Mascarilla N95 o P100 (ceniza volcánica)",
      "Gafas de seguridad cerradas",
      "Ropa de manga larga (protección ceniza)",
      "Casco de seguridad",
      "Radio portátil"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "No construir en zonas de amenaza volcánica alta (radios de influencia de volcanes activos).",
      sustitucion: "Relocalizar instalaciones críticas fuera de zonas de amenaza.",
      controles_ingenieria: "Techos inclinados (evitar acumulación de ceniza). Filtros HEPA en sistemas de ventilación. Sellado hermético de ventanas/puertas. Almacenamiento de agua potable. Generadores eléctricos de respaldo. Refugios temporales reforzados.",
      controles_administrativos: "Monitoreo permanente del Servicio Geológico Colombiano (SGC). Sistema de alertas volcánicas (nivel verde, amarillo, naranja, rojo). Plan de evacuación con rutas alternas. Simulacros anuales. Coordinación con UNGRD. Kit de emergencia (mascarillas, agua, alimentos). Prohibición de acercarse a zonas de exclusión. Protocolos de limpieza de ceniza (humedecer antes de barrer). Suspensión de actividades durante caída de ceniza."
    }),
    relevancia_por_sector: JSON.stringify({
      agricultura: 10, // Zona cafetera, Nariño, Tolima
      construccion: 8,
      educacion: 8, // Colegios en zonas volcánicas
      servicios_publicos: 9,
      manufactura: 7,
      oficina: 6
    }),
    es_comun: false, // Solo en zonas volcánicas (Caldas, Tolima, Cauca, Nariño)
    orden: contadorOrden['RFN']++,
    activo: true
  });

  // 27. ACTIVIDAD SÍSMICA DE ALTA INTENSIDAD
  gesCriticos.push({
    riesgo_id: riesgoMap['RFN'],
    codigo: 'RFN-SISMO',
    nombre: "Sismos / Terremotos de Alta Intensidad (≥ 5.5 Richter)",
    consecuencias: "Caída de objetos, colapso parcial de estructuras, fracturas, traumatismos, pánico colectivo.",
    peor_consecuencia: "Colapso total de edificaciones, sepultamiento, muerte masiva, incendios post-terremoto.",
    examenes_medicos: JSON.stringify({ EMO: 1, OSTE: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento de protocolos de evacuación sísmica (triángulo de la vida, zonas seguras)",
      "Capacidad de mantener la calma en emergencias",
      "Movilidad para evacuar o protegerse rápidamente",
      "Participación en simulacros"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Movilidad reducida severa (requiere plan de evacuación asistida)",
      "Trastornos de pánico severos",
      "Sordera (dificulta escuchar instrucciones)"
    ]),
    epp_sugeridos: JSON.stringify([
      "Casco de seguridad (tener disponible)",
      "Botiquín de primeros auxilios",
      "Linterna con batería de respaldo",
      "Radio portátil"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "No aplica (sismos son impredecibles en Colombia).",
      sustitucion: "No aplica.",
      controles_ingenieria: "Diseño sismorresistente de edificaciones (NSR-10). Anclaje de estanterías y equipos pesados. Reforzamiento de estructuras antiguas. Vidrios laminados (no se fragmentan). Zonas seguras internas señalizadas (marcos de puertas, columnas). Rutas de evacuación libres de obstáculos. Sistemas de detección de sismos (alerta temprana). Generadores de emergencia. Reservas de agua.",
      controles_administrativos: "Plan de Emergencias sísmico (Ley 1523/2012). Simulacros trimestrales de evacuación. Brigadas de emergencia entrenadas. Inspecciones estructurales anuales (edificios antiguos). Protocolo: Agacharse, Cubrirse, Agarrarse (Drop, Cover, Hold On). Punto de encuentro externo en zona segura. Kit de emergencia (agua, alimentos, botiquín 72 horas). Mapas de amenaza sísmica (zonas de fallas: Romeral, Palestina). Coordinación con Bomberos y Defensa Civil."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      oficina: 9,
      educacion: 10,
      salud: 10,
      manufactura: 9,
      comercio: 9,
      hoteleria: 10,
      call_center: 9,
      servicios_publicos: 10
    }),
    es_comun: true, // TODO el territorio colombiano es zona sísmica
    orden: contadorOrden['RFN']++,
    activo: true
  });

  // 28. RAYOS / TORMENTAS ELÉCTRICAS
  gesCriticos.push({
    riesgo_id: riesgoMap['RFN'],
    codigo: 'RFN-RAYOS',
    nombre: "Rayos / Tormentas Eléctricas (Descargas Atmosféricas)",
    consecuencias: "Quemaduras eléctricas, paro cardiorrespiratorio, lesiones auditivas (trueno), incendios, daño a equipos electrónicos.",
    peor_consecuencia: "Electrocución mortal instantánea, incendios forestales/estructurales, explosión de tanques de combustible.",
    examenes_medicos: JSON.stringify({ EMO: 1, CARDIO: 2, AUDIO: 2 }),
    aptitudes_requeridas: JSON.stringify([
      "Conocimiento de protocolos de protección contra rayos",
      "Capacidad de reconocer señales de tormenta inminente",
      "Disciplina en suspender actividades al exterior",
      "Conocimiento de regla 30-30 (trueno - refugio)"
    ]),
    condiciones_incompatibles: JSON.stringify([
      "Marcapasos cardíaco (alto riesgo de falla por descarga cercana)",
      "Implantes metálicos extensos",
      "Sordera (no escucha truenos de advertencia)"
    ]),
    epp_sugeridos: JSON.stringify([
      "No aplica EPP específico durante tormenta (refugiarse es la prioridad)",
      "Botas dieléctricas (trabajos al aire libre)",
      "Ropa seca (ropa mojada aumenta conductividad)"
    ]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Suspender actividades al aire libre durante tormentas.",
      sustitucion: "Trabajo en interiores durante temporada de lluvias (abril-mayo, octubre-noviembre).",
      controles_ingenieria: "Sistema de protección contra rayos (pararrayos Franklin o tipo ESE - Early Streamer Emission) según NTC 4552. Red de puesta a tierra < 10 ohmios. Supresores de sobretensión (DPS) en tableros eléctricos. Jaula de Faraday en edificaciones críticas. Refugios metálicos (vehículos cerrados, contenedores). Detector de tormentas (mide campo eléctrico).",
      controles_administrativos: "Regla 30-30: Si pasan < 30 seg entre relámpago y trueno, refugiarse inmediatamente. Esperar 30 min después del último trueno para salir. Suspensión de trabajos al aire libre durante tormenta. Prohibición de refugio bajo árboles aislados. Alejarse de estructuras metálicas (cercas, postes). No usar teléfonos con cable. Monitoreo de pronósticos meteorológicos (IDEAM). Alarmas de tormenta. Capacitación en RCP (paro cardíaco por rayo). Nota: Colombia es el 2do país con más rayos del mundo (158 rayos/km²/año)."
    }),
    relevancia_por_sector: JSON.stringify({
      construccion: 10,
      agricultura: 10,
      mineria: 10,
      servicios_publicos: 10, // Telecomunicaciones, energía
      telecomunicaciones: 10,
      transporte: 9,
      educacion: 7, // Actividades al aire libre
      deporte: 10
    }),
    es_comun: true, // Colombia: alta incidencia de rayos
    orden: contadorOrden['RFN']++,
    activo: true
  });

  console.log('✅ Fenómenos Naturales Colombia completados (5 GES)');

  // =========================================
  // INSERTAR EN BASE DE DATOS
  // =========================================

  console.log(`\n📊 Resumen de GES a insertar:`);
  console.log(`   - Riesgo Psicosocial: 5 GES`);
  console.log(`   - Riesgo Químico: 5 GES`);
  console.log(`   - Riesgo Biológico: 3 GES`);
  console.log(`   - Condiciones Seguridad: 2 GES (ejemplo, completar hasta 10)`);
  console.log(`   - Fenómenos Naturales: 1 GES (ejemplo, completar hasta 5)`);
  console.log(`   - TOTAL en este seed: ${gesCriticos.length} GES\n`);

  await knex('catalogo_ges').insert(gesCriticos);

  console.log('✅ [Seed 004] Inserción completada exitosamente!');
  console.log(`✅ Total acumulado esperado: 94 (previos) + ${gesCriticos.length} = ${94 + gesCriticos.length} GES`);

  // Validar inserción
  const totalGES = await knex('catalogo_ges').where('activo', true).count('id as total');
  console.log(`✅ Total GES en BD: ${totalGES[0].total}`);

  // Mostrar distribución por categoría
  console.log('\n📊 Distribución por categoría:');
  for (const r of riesgos) {
    const count = await knex('catalogo_ges')
      .where('riesgo_id', r.id)
      .where('activo', true)
      .count('id as total');
    console.log(`   ${r.codigo} (${r.nombre}): ${count[0].total} GES`);
  }

  console.log('\n🎉 Seed 004 completado! Sistema ahora con compliance GTC 45 mejorado.\n');
};

/**
 * Rollback
 * IMPORTANTE: Este seed NO tiene rollback automático porque los códigos
 * específicos (RPS-ACOSO-LAB, etc.) son únicos. Si se vuelve a ejecutar,
 * fallará por duplicado de código (constraint UNIQUE).
 *
 * Para rollback manual, ejecutar:
 *   DELETE FROM catalogo_ges WHERE codigo IN ('RPS-ACOSO-LAB', 'RPS-ACOSO-SEX', ...);
 */
exports.down = async function(knex) {
  console.log('⚠️  Rollback de seed 004 no implementado.');
  console.log('⚠️  Para revertir, eliminar manualmente los GES con códigos RPS-ACOSO-LAB, RQ-ASBESTO, etc.');
  console.log('⚠️  O ejecutar: DELETE FROM catalogo_ges WHERE codigo LIKE "RPS-ACOSO%" OR codigo LIKE "RQ-%" ...;');
};
