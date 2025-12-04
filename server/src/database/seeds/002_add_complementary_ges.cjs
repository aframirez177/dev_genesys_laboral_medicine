/**
 * Seed: GES Complementarios (24 nuevos)
 *
 * Añade 24 GES faltantes identificados en:
 * - Nuevo_asistentewizard_de_riesgos/GES_COMPLEMENTARIOS_PROPUESTOS.md
 * - Nuevo_asistentewizard_de_riesgos/GES_COMPLEMENTARIOS_NUEVOS.js
 *
 * Distribución:
 * - Riesgo Psicosocial: 8 GES
 * - Fenómenos Naturales: 3 GES
 * - Riesgo Físico: 5 GES
 * - Riesgo Biomecánico: 3 GES
 * - Riesgo Químico: 3 GES
 * - Riesgo Tecnológico: 2 GES
 *
 * Total: 24 GES
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
  // 24 GES COMPLEMENTARIOS
  // =========================================

  const gesComplementarios = [];

  // ===== RIESGO PSICOSOCIAL (8 GES) =====

  gesComplementarios.push({
    riesgo_id: riesgoMap['RPS'],
    nombre: "Carga mental elevada - Alta demanda cognitiva",
    consecuencias: "Fatiga mental, estrés, ansiedad, dificultad de concentración, trastornos del sueño.",
    peor_consecuencia: "Trastorno de ansiedad generalizada, depresión, burnout.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 1 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de manejo de estrés y presión laboral", "Habilidades de organización y priorización de tareas", "Resiliencia emocional y capacidad de adaptación", "Concentración y atención sostenida"]),
    condiciones_incompatibles: JSON.stringify(["Trastornos de ansiedad severos no controlados", "Trastorno depresivo mayor en fase aguda", "Trastornos cognitivos que afecten la atención", "Burnout diagnosticado"]),
    epp_sugeridos: JSON.stringify(["No aplica EPP físico - requiere controles organizacionales"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Rediseño de puestos para reducir complejidad y volumen de tareas simultáneas.",
      sustitucion: "Automatización de tareas repetitivas que consumen capacidad cognitiva.",
      controles_ingenieria: "Implementación de software de gestión de tareas y herramientas de priorización.",
      controles_administrativos: "Pausas activas mentales, redistribución de cargas de trabajo, capacitación en manejo de estrés y técnicas de organización."
    }),
    relevancia_por_sector: JSON.stringify({ oficina: 9, call_center: 10, tecnologia: 9, salud: 8, educacion: 7, comercio: 6 }),
    orden: contadorOrden['RPS']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RPS'],
    nombre: "Trabajo emocional intenso - Atención de público o situaciones críticas",
    consecuencias: "Fatiga emocional, agotamiento psicológico, irritabilidad, trastornos del sueño, disonancia emocional.",
    peor_consecuencia: "Burnout, trastorno de estrés postraumático, depresión.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 1 }),
    aptitudes_requeridas: JSON.stringify(["Inteligencia emocional y empatía", "Capacidad de regulación emocional", "Habilidades de comunicación asertiva", "Tolerancia a situaciones de conflicto"]),
    condiciones_incompatibles: JSON.stringify(["Trastornos de personalidad severos", "Depresión mayor no controlada", "Trastorno de estrés postraumático", "Adicciones activas"]),
    epp_sugeridos: JSON.stringify(["No aplica EPP físico - requiere controles organizacionales"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Reducir tiempos de exposición a situaciones emocionalmente demandantes.",
      sustitucion: "Rotación de tareas entre funciones de alta y baja demanda emocional.",
      controles_ingenieria: "Espacios de descompresión emocional, salas de pausa tranquilas.",
      controles_administrativos: "Capacitación en manejo emocional, apoyo psicosocial permanente, programas de acompañamiento post-incidentes críticos, límites claros de jornada."
    }),
    relevancia_por_sector: JSON.stringify({ salud: 10, call_center: 9, educacion: 8, comercio: 7, hoteleria: 7, vigilancia: 6 }),
    orden: contadorOrden['RPS']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RPS'],
    nombre: "Acoso laboral (mobbing) o discriminación",
    consecuencias: "Ansiedad, depresión, baja autoestima, estrés crónico, desmotivación, ideación suicida.",
    peor_consecuencia: "Suicidio, trastorno depresivo mayor, trastorno de estrés postraumático.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 1 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de comunicación y asertividad", "Resiliencia emocional", "Habilidades para establecer límites saludables"]),
    condiciones_incompatibles: JSON.stringify(["Ninguna - este riesgo puede afectar a cualquier persona independientemente de sus condiciones de salud"]),
    epp_sugeridos: JSON.stringify(["No aplica EPP físico - requiere controles organizacionales"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Política de cero tolerancia al acoso laboral y discriminación (Ley 1010 de 2006, Ley 1482 de 2011).",
      sustitucion: "No aplica.",
      controles_ingenieria: "Canales de denuncia confidenciales y seguros, comité de convivencia laboral activo.",
      controles_administrativos: "Código de conducta empresarial, protocolos de intervención rápida, investigaciones efectivas, sanciones disciplinarias, capacitación en diversidad e inclusión, liderazgo ético."
    }),
    relevancia_por_sector: JSON.stringify({ oficina: 7, manufactura: 6, comercio: 7, call_center: 8, tecnologia: 6, construccion: 5 }),
    orden: contadorOrden['RPS']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RPS'],
    nombre: "Turnos nocturnos o trabajo nocturno",
    consecuencias: "Alteración del ritmo circadiano, trastornos del sueño, fatiga crónica, problemas gastrointestinales, dificultad de concentración.",
    peor_consecuencia: "Insomnio crónico, trastornos metabólicos, depresión, mayor riesgo de accidentes.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2, GLI: 2, ECG: 2 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de adaptación a horarios irregulares", "Buena higiene del sueño", "Ausencia de trastornos del sueño previos", "Estado de salud cardiovascular y metabólico estable"]),
    condiciones_incompatibles: JSON.stringify(["Trastornos del sueño severos (apnea del sueño, narcolepsia)", "Diabetes descontrolada", "Epilepsia no controlada", "Trastornos cardiovasculares que requieran control circadiano estricto"]),
    epp_sugeridos: JSON.stringify(["No aplica EPP físico - requiere controles organizacionales"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar turnos nocturnos siempre que sea posible.",
      sustitucion: "Rotación de turnos en sentido horario (mañana → tarde → noche) con períodos de descanso adecuados.",
      controles_ingenieria: "Iluminación adecuada durante turnos nocturnos, áreas de descanso confortables.",
      controles_administrativos: "Evaluaciones médicas periódicas para trabajadores nocturnos, pausas programadas, educación en higiene del sueño, no más de 3-4 turnos nocturnos consecutivos, cumplimiento Resolución 2016 de 2023."
    }),
    relevancia_por_sector: JSON.stringify({ salud: 10, vigilancia: 10, manufactura: 8, call_center: 7, transporte: 8, servicios_publicos: 8 }),
    orden: contadorOrden['RPS']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RPS'],
    nombre: "Extensión de la jornada laboral - Jornadas superiores a 48 horas/semana",
    consecuencias: "Fatiga física y mental, estrés crónico, trastornos del sueño, afectación de vida personal y familiar, mayor riesgo de accidentes.",
    peor_consecuencia: "Burnout, enfermedades cardiovasculares, trastornos mentales, muerte súbita por karoshi (exceso de trabajo).",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 1, ECG: 2 }),
    aptitudes_requeridas: JSON.stringify(["Buena condición física y mental", "Capacidad de recuperación ante esfuerzo sostenido", "Habilidades de gestión del tiempo"]),
    condiciones_incompatibles: JSON.stringify(["Enfermedades cardiovasculares", "Trastornos de ansiedad o depresión severos", "Condiciones médicas que requieran reposo regular"]),
    epp_sugeridos: JSON.stringify(["No aplica EPP físico - requiere controles organizacionales"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Cumplir estrictamente jornada laboral legal (48 horas/semana máximo según Código Sustantivo del Trabajo).",
      sustitucion: "Contratación de personal adicional para evitar extensión de jornadas.",
      controles_ingenieria: "Sistemas de registro de jornada automatizados para prevenir excesos.",
      controles_administrativos: "Política de desconexión laboral, monitoreo estricto de horas extras, evaluaciones médicas a quienes superen 48h/semana, pausas obligatorias, capacitación a líderes sobre gestión de cargas."
    }),
    relevancia_por_sector: JSON.stringify({ manufactura: 8, construccion: 8, transporte: 9, comercio: 7, call_center: 8, tecnologia: 7 }),
    orden: contadorOrden['RPS']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RPS'],
    nombre: "Falta de autonomía o control sobre el trabajo",
    consecuencias: "Desmotivación, estrés, ansiedad, baja satisfacción laboral, sensación de impotencia.",
    peor_consecuencia: "Depresión, síndrome de indefensión aprendida, rotación laboral alta.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de adaptación a estructuras organizacionales rígidas", "Tolerancia a la frustración", "Capacidad de comunicación con superiores"]),
    condiciones_incompatibles: JSON.stringify(["Trastornos de ansiedad severos", "Necesidad de control estricto por condiciones médicas (ej: diabetes que requiera pausas específicas)"]),
    epp_sugeridos: JSON.stringify(["No aplica EPP físico - requiere controles organizacionales"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Rediseño organizacional hacia estructuras más horizontales.",
      sustitucion: "Implementar gestión participativa y toma de decisiones colaborativa.",
      controles_ingenieria: "Plataformas digitales de participación y retroalimentación.",
      controles_administrativos: "Delegar responsabilidades, horarios flexibles, permitir pausas autodirigidas, canales de comunicación abiertos, reconocimiento de aportes individuales."
    }),
    relevancia_por_sector: JSON.stringify({ oficina: 8, manufactura: 9, call_center: 9, comercio: 7, construccion: 6, agricultura: 8 }),
    orden: contadorOrden['RPS']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RPS'],
    nombre: "Violencia externa o amenaza de terceros (clientes, usuarios, público)",
    consecuencias: "Ansiedad, estrés postraumático, miedo, agresiones físicas, lesiones.",
    peor_consecuencia: "Trastorno de estrés postraumático, lesiones graves, muerte.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 1 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de manejo de situaciones de conflicto", "Inteligencia emocional y empatía", "Habilidades de comunicación asertiva y de-escalamiento", "Capacidad de mantener la calma bajo presión"]),
    condiciones_incompatibles: JSON.stringify(["Trastorno de estrés postraumático previo", "Ansiedad severa no controlada", "Discapacidades físicas que limiten la capacidad de respuesta ante agresiones"]),
    epp_sugeridos: JSON.stringify(["Botones de pánico o alarmas personales", "Sistemas de comunicación constante con vigilancia", "Barreras físicas (vidrios de seguridad, mostradores protegidos)"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Rediseñar procesos para minimizar interacciones presenciales de alto riesgo.",
      sustitucion: "Implementar atención virtual o remota para situaciones de alta tensión.",
      controles_ingenieria: "Cámaras de seguridad, botones de pánico, personal de vigilancia, barreras físicas, control de acceso.",
      controles_administrativos: "Capacitación en manejo de situaciones de crisis, protocolos de seguridad claros, trabajo en equipo (no dejar personas solas en situaciones de riesgo), acompañamiento psicológico post-incidente."
    }),
    relevancia_por_sector: JSON.stringify({ salud: 9, vigilancia: 10, transporte: 8, comercio: 7, servicios_publicos: 6, call_center: 7 }),
    orden: contadorOrden['RPS']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RPS'],
    nombre: "Monotonía o tareas repetitivas sin variación",
    consecuencias: "Aburrimiento, desmotivación, fatiga mental, errores por falta de atención, estrés.",
    peor_consecuencia: "Depresión, trastornos musculoesqueléticos por posturas estáticas prolongadas, rotación laboral.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de mantener atención en tareas rutinarias", "Tolerancia a la monotonía", "Capacidad de encontrar propósito en tareas simples"]),
    condiciones_incompatibles: JSON.stringify(["Trastorno de déficit de atención severo", "Necesidad de estimulación cognitiva constante por condiciones previas"]),
    epp_sugeridos: JSON.stringify(["No aplica EPP físico - requiere controles organizacionales"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Automatización de tareas altamente repetitivas y monótonas.",
      sustitucion: "Enriquecimiento del puesto con tareas variadas.",
      controles_ingenieria: "Implementar variedad en secuencias de trabajo.",
      controles_administrativos: "Rotación de tareas, pausas activas con cambios de actividad, involucramiento en proyectos de mejora, reconocimiento del trabajo, música ambiental (si es permitido y seguro)."
    }),
    relevancia_por_sector: JSON.stringify({ manufactura: 10, call_center: 9, comercio: 7, oficina: 6, agricultura: 8, construccion: 5 }),
    orden: contadorOrden['RPS']++,
    activo: true
  });

  // ===== FENÓMENOS NATURALES (3 GES) =====

  gesComplementarios.push({
    riesgo_id: riesgoMap['RFN'],
    nombre: "Sismo o terremoto",
    consecuencias: "Lesiones por caída de objetos, atrapamiento, fracturas, trauma psicológico, pánico colectivo.",
    peor_consecuencia: "Muerte por colapso estructural, lesiones graves por aplastamiento.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de reacción rápida ante emergencias", "Conocimiento de protocolos de evacuación", "Condición física para movilización rápida", "Capacidad de mantener la calma en situaciones de pánico"]),
    condiciones_incompatibles: JSON.stringify(["Discapacidades de movilidad que dificulten evacuación rápida (requiere plan especial de evacuación asistida)", "Trastornos de pánico severos", "Condiciones cardíacas que se agraven con estrés agudo"]),
    epp_sugeridos: JSON.stringify(["Casco de seguridad (almacenado en puntos estratégicos)", "Botiquín de primeros auxilios accesible", "Linterna y silbato personal"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "No es posible eliminar el fenómeno natural.",
      sustitucion: "No aplica.",
      controles_ingenieria: "Construcciones sismo-resistentes (NSR-10), anclaje de muebles y equipos, rutas de evacuación seguras, zonas de refugio identificadas, señalización clara.",
      controles_administrativos: "Plan de emergencias y evacuación, simulacros periódicos, brigadas de emergencia entrenadas, capacitación en protocolo 'Agacharse, Cubrirse, Sujetarse', puntos de encuentro definidos."
    }),
    relevancia_por_sector: JSON.stringify({ construccion: 10, manufactura: 9, oficina: 8, salud: 9, educacion: 9, comercio: 8, tecnologia: 7, mineria: 10 }),
    es_comun: true,
    orden: contadorOrden['RFN']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RFN'],
    nombre: "Inundación o creciente de ríos",
    consecuencias: "Ahogamiento, lesiones por arrastre, hipotermia, enfermedades por contacto con aguas contaminadas, pérdidas materiales.",
    peor_consecuencia: "Muerte por ahogamiento, enfermedades infecciosas graves (leptospirosis, hepatitis A).",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2, VACU: 1 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de natación (deseable)", "Conocimiento de protocolos de evacuación en zonas inundables", "Capacidad de reacción ante emergencias", "Buena condición física para movilización rápida"]),
    condiciones_incompatibles: JSON.stringify(["Discapacidades de movilidad que dificulten evacuación rápida", "Condiciones cardiorrespiratorias severas", "Pánico al agua (si no hay alternativa de evacuación terrestre)"]),
    epp_sugeridos: JSON.stringify(["Chalecos salvavidas (para zonas de muy alto riesgo)", "Botas de caucho impermeables", "Ropa impermeable", "Silbatos de emergencia"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Reubicar instalaciones fuera de zonas inundables.",
      sustitucion: "Implementar trabajo remoto en temporadas de alto riesgo de inundación.",
      controles_ingenieria: "Sistemas de drenaje, barreras contra inundaciones, elevación de instalaciones críticas, sistemas de alerta temprana, rutas de evacuación elevadas.",
      controles_administrativos: "Monitoreo de alertas del IDEAM, plan de evacuación específico para inundaciones, simulacros en temporada de lluvias, seguros contra inundaciones, vacunación contra enfermedades hídricas (tétanos, hepatitis A)."
    }),
    relevancia_por_sector: JSON.stringify({ construccion: 8, agricultura: 10, mineria: 9, servicios_publicos: 7, manufactura: 6, transporte: 7 }),
    orden: contadorOrden['RFN']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RFN'],
    nombre: "Vendaval, huracán o vientos fuertes",
    consecuencias: "Lesiones por impacto de objetos voladores, caída de árboles, colapso de estructuras, electrocución por cables caídos.",
    peor_consecuencia: "Muerte por impacto de objetos o colapso estructural.",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de reacción ante emergencias", "Conocimiento de protocolos de refugio", "Capacidad física para buscar refugio rápidamente"]),
    condiciones_incompatibles: JSON.stringify(["Discapacidades de movilidad que dificulten búsqueda rápida de refugio (requiere plan especial)", "Trastornos de pánico ante fenómenos climáticos extremos"]),
    epp_sugeridos: JSON.stringify(["Casco de seguridad", "Gafas de protección", "Ropa de protección contra viento y lluvia"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "No es posible eliminar el fenómeno natural.",
      sustitucion: "Suspender actividades al aire libre durante alertas de vientos fuertes.",
      controles_ingenieria: "Estructuras resistentes a vientos, anclaje de elementos móviles, podas preventivas de árboles cercanos, canalización de cables eléctricos subterráneos.",
      controles_administrativos: "Monitoreo de alertas del IDEAM, plan de refugio en zonas seguras, prohibición de actividades exteriores durante alertas, aseguramiento de objetos que puedan convertirse en proyectiles."
    }),
    relevancia_por_sector: JSON.stringify({ construccion: 10, agricultura: 10, mineria: 8, servicios_publicos: 8, transporte: 7, manufactura: 6 }),
    orden: contadorOrden['RFN']++,
    activo: true
  });

  // ===== RIESGO FÍSICO (5 GES) =====

  gesComplementarios.push({
    riesgo_id: riesgoMap['RF'],
    nombre: "Radiación infrarroja (IR) - Exposición a calor radiante",
    consecuencias: "Quemaduras, lesiones oculares (cataratas), estrés térmico, deshidratación.",
    peor_consecuencia: "Cataratas por radiación infrarroja, quemaduras graves, golpe de calor.",
    examenes_medicos: JSON.stringify({ EMO: 1, OPTO: 1, DERM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Buena agudeza visual", "Piel sin lesiones severas", "Capacidad de termorregulación adecuada", "Tolerancia al calor"]),
    condiciones_incompatibles: JSON.stringify(["Cataratas previas no tratadas", "Enfermedades dermatológicas severas", "Hipertensión no controlada", "Insuficiencia cardíaca"]),
    epp_sugeridos: JSON.stringify(["Gafas con filtro IR (DIN 4-6 según intensidad)", "Careta facial con protección IR", "Ropa de protección térmica reflectante", "Guantes térmicos"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Automatización de procesos con exposición a calor radiante (ej: fundición, soldadura).",
      sustitucion: "Utilizar tecnologías con menor emisión de radiación IR.",
      controles_ingenieria: "Pantallas reflectantes, ventilación forzada, cabinas con clima controlado.",
      controles_administrativos: "Rotación de personal en exposiciones prolongadas, pausas de hidratación, monitoreo de temperatura corporal, limitación de tiempo de exposición."
    }),
    relevancia_por_sector: JSON.stringify({ manufactura: 10, metalmecanica: 10, mineria: 9, construccion: 7, oficina: 1 }),
    orden: contadorOrden['RF']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RF'],
    nombre: "Presión atmosférica anormal - Hipobaria (alturas) o Hiperbaria (buceo, túneles)",
    consecuencias: "Mal de montaña, barotrauma, enfermedad descompresiva, embolia gaseosa, dolor articular.",
    peor_consecuencia: "Edema cerebral de altura, embolia gaseosa cerebral, muerte.",
    examenes_medicos: JSON.stringify({ EMO: 1, ECG: 1, ESPI: 1, RXT: 1, AUD: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Función cardiovascular y respiratoria normal", "Capacidad de equilibrar presiones (Valsalva)", "Ausencia de problemas de oído medio", "Estabilidad psicológica ante condiciones extremas"]),
    condiciones_incompatibles: JSON.stringify(["Enfermedades cardiovasculares", "Asma no controlada, EPOC", "Patología de oído medio (otitis crónica)", "Epilepsia", "Neumotórax previo", "Embarazo (buceo)"]),
    epp_sugeridos: JSON.stringify(["Equipos de buceo certificados (hiperbaria)", "Ropa térmica", "Sistemas de monitoreo de presión", "Equipos de oxígeno suplementario (alturas extremas)"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Evitar trabajos en condiciones de presión extrema si es posible.",
      sustitucion: "Uso de ROVs (vehículos operados remotamente) para trabajos subacuáticos.",
      controles_ingenieria: "Cámaras hiperbáricas para descompresión, sistemas de suministro de aire certificados, monitoreo continuo de profundidad y tiempo.",
      controles_administrativos: "Certificación de buzos profesionales (Resolución 4111 de 2017), tablas de descompresión, aclimatación gradual a alturas, exámenes médicos previos y periódicos, protocolos de emergencia."
    }),
    relevancia_por_sector: JSON.stringify({ mineria: 10, construccion: 8, servicios_publicos: 7, oficina: 1 }),
    orden: contadorOrden['RF']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RF'],
    nombre: "Campos electromagnéticos (CEM) - Radiofrecuencias, microondas",
    consecuencias: "Efectos térmicos (calentamiento tisular), dolores de cabeza, fatiga, efectos a largo plazo en estudio.",
    peor_consecuencia: "Quemaduras por exposición intensa, efectos reproductivos (en estudio), posibles efectos cancerígenos a largo plazo (clasificación 2B IARC).",
    examenes_medicos: JSON.stringify({ EMO: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Conocimiento de protocolos de seguridad electromagnética", "Capacidad de seguir procedimientos estrictos de distanciamiento"]),
    condiciones_incompatibles: JSON.stringify(["Portadores de marcapasos cardíacos (contraindicado en campos intensos)", "Implantes metálicos en zonas de exposición directa", "Embarazo (precaución en exposiciones altas)"]),
    epp_sugeridos: JSON.stringify(["Ropa conductora (para trabajos en líneas de alta tensión)", "Dosímetros de radiofrecuencia", "Señalización de zonas de exposición"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar fuentes innecesarias de CEM.",
      sustitucion: "Utilizar tecnologías con menor emisión electromagnética.",
      controles_ingenieria: "Blindaje electromagnético, aumento de distancia de fuentes, apagado de equipos cuando no están en uso.",
      controles_administrativos: "Medición periódica de niveles de CEM, cumplimiento de límites ICNIRP, restricción de acceso a zonas de alta exposición, rotación de personal, capacitación específica."
    }),
    relevancia_por_sector: JSON.stringify({ tecnologia: 7, manufactura: 6, servicios_publicos: 8, oficina: 4 }),
    orden: contadorOrden['RF']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RF'],
    nombre: "Laser - Radiación láser (clases 3R, 3B, 4)",
    consecuencias: "Lesiones oculares (retina), quemaduras en piel, daño permanente a la visión.",
    peor_consecuencia: "Ceguera permanente, quemaduras graves.",
    examenes_medicos: JSON.stringify({ OPTO: 1, EMO: 2 }),
    aptitudes_requeridas: JSON.stringify(["Agudeza visual normal", "Capacidad de seguir estrictamente protocolos de seguridad", "Conocimiento de clasificación de láseres y riesgos"]),
    condiciones_incompatibles: JSON.stringify(["Enfermedades oculares previas (cataratas, degeneración macular)", "Uso de medicamentos fotosensibilizantes", "Alteraciones de la atención que impidan cumplir protocolos"]),
    epp_sugeridos: JSON.stringify(["Gafas de protección láser específicas por longitud de onda (certificadas)", "Careta facial con filtro láser", "Ropa de protección ignífuga (láser clase 4)", "Señalización de advertencia láser"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar el uso de láseres si existen alternativas tecnológicas.",
      sustitucion: "Utilizar láseres de clase inferior cuando sea posible.",
      controles_ingenieria: "Encerramientos de haz láser, barreras físicas, sistemas de interlock (apagado automático), señalización luminosa activa.",
      controles_administrativos: "Designación de oficial de seguridad láser, capacitación certificada (norma IEC 60825), protocolos de acceso restringido, inspecciones periódicas de equipos."
    }),
    relevancia_por_sector: JSON.stringify({ salud: 9, manufactura: 8, tecnologia: 7, construccion: 5, oficina: 2 }),
    orden: contadorOrden['RF']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RF'],
    nombre: "Vibraciones de cuerpo entero (VCE) - Vehículos, maquinaria pesada",
    consecuencias: "Lumbalgias, hernias discales, trastornos vasculares, problemas digestivos, afectación del sistema nervioso.",
    peor_consecuencia: "Discapacidad por enfermedad lumbar crónica, síndrome de vibración mano-brazo severo.",
    examenes_medicos: JSON.stringify({ EMO: 1, RXT: 2, NEURO: 2 }),
    aptitudes_requeridas: JSON.stringify(["Columna vertebral sana sin patologías previas", "Buena musculatura de soporte (core)", "Ausencia de hernias discales o lumbalgias crónicas"]),
    condiciones_incompatibles: JSON.stringify(["Hernias discales", "Espondilitis anquilosante", "Espondilolistesis", "Osteoporosis severa", "Embarazo"]),
    epp_sugeridos: JSON.stringify(["Asientos con suspensión antivibraciones", "Fajas lumbares ergonómicas (uso controlado)", "Guantes antivibraciones (para herramientas manuales)"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar operaciones que requieran exposición prolongada a vibraciones de cuerpo entero.",
      sustitucion: "Utilizar vehículos y maquinaria con mejores sistemas de suspensión.",
      controles_ingenieria: "Asientos ergonómicos con suspensión neumática, cabinas aisladas, mantenimiento preventivo de vehículos (neumáticos, suspensión).",
      controles_administrativos: "Rotación de operadores, pausas cada 2 horas, limitación de tiempo de exposición diaria (Directiva 2002/44/CE como referencia), capacitación en postura correcta, evaluaciones médicas periódicas."
    }),
    relevancia_por_sector: JSON.stringify({ construccion: 10, mineria: 10, transporte: 10, agricultura: 9, manufactura: 7 }),
    orden: contadorOrden['RF']++,
    activo: true
  });

  // ===== RIESGO BIOMECÁNICO (3 GES) =====

  gesComplementarios.push({
    riesgo_id: riesgoMap['RB'],
    nombre: "Bipedestación prolongada - Permanencia de pie estática",
    consecuencias: "Várices, edema en miembros inferiores, lumbalgia, fatiga muscular, fascitis plantar.",
    peor_consecuencia: "Insuficiencia venosa crónica, várices severas con úlceras, lumbalgia crónica discapacitante.",
    examenes_medicos: JSON.stringify({ EMO: 1, VASC: 2 }),
    aptitudes_requeridas: JSON.stringify(["Sistema circulatorio venoso funcional", "Ausencia de patologías vasculares previas", "Resistencia física para permanecer de pie"]),
    condiciones_incompatibles: JSON.stringify(["Insuficiencia venosa crónica severa", "Várices grado III-IV", "Linfedema severo", "Embarazo avanzado", "Obesidad mórbida"]),
    epp_sugeridos: JSON.stringify(["Calzado ergonómico con soporte de arco", "Medias de compresión graduada (20-30 mmHg)", "Plantillas ortopédicas personalizadas", "Alfombras anti-fatiga"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Rediseñar puestos de trabajo para permitir posición sentada.",
      sustitucion: "Alternar entre posición de pie y sentada.",
      controles_ingenieria: "Estaciones de trabajo ajustables (sit-stand), superficies anti-fatiga, apoyapiés.",
      controles_administrativos: "Pausas activas cada 2 horas con ejercicios de movilización, rotación de tareas, ejercicios de estiramiento, hidratación adecuada."
    }),
    relevancia_por_sector: JSON.stringify({ comercio: 10, manufactura: 9, salud: 8, hoteleria: 9, vigilancia: 8, construccion: 7 }),
    orden: contadorOrden['RB']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RB'],
    nombre: "Trabajo con pantalla de visualización de datos (PVD) - Más de 4 horas/día",
    consecuencias: "Fatiga visual (astenopía), síndrome visual informático, cefaleas, sequedad ocular, errores refractivos.",
    peor_consecuencia: "Miopía inducida o progresiva, fatiga visual crónica, cefaleas tensionales crónicas.",
    examenes_medicos: JSON.stringify({ OPTO: 1, EMO: 2 }),
    aptitudes_requeridas: JSON.stringify(["Agudeza visual adecuada (corregida con lentes si es necesario)", "Capacidad de enfocar a distancias cercanas e intermedias", "Ausencia de patologías oculares severas"]),
    condiciones_incompatibles: JSON.stringify(["Queratoconjuntivitis seca severa", "Glaucoma no controlado", "Cataratas avanzadas", "Estrabismo descompensado"]),
    epp_sugeridos: JSON.stringify(["Gafas con filtro de luz azul", "Lentes antirreflejantes", "Pantallas con filtro antirreflejo", "Iluminación ergonómica del puesto"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Reducir tiempo de exposición a pantallas digitales.",
      sustitucion: "Utilizar pantallas de mejor calidad (alta resolución, sin parpadeo).",
      controles_ingenieria: "Monitores con tecnología anti-parpadeo, brillo ajustable, ubicación ergonómica (50-70 cm de distancia, 15-20° bajo línea visual), iluminación ambiental adecuada (sin reflejos).",
      controles_administrativos: "Regla 20-20-20 (cada 20 minutos, mirar 20 segundos a 20 pies/6 metros), pausas visuales programadas, evaluaciones optométricas anuales, ajuste de brillo y contraste de pantallas."
    }),
    relevancia_por_sector: JSON.stringify({ oficina: 10, tecnologia: 10, call_center: 10, educacion: 8, comercio: 7, manufactura: 5 }),
    orden: contadorOrden['RB']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RB'],
    nombre: "Digitación prolongada o uso intensivo de teclado/mouse - Más de 4 horas/día",
    consecuencias: "Síndrome del túnel carpiano, tendinitis, tenosinovitis, fatiga muscular en manos y antebrazos.",
    peor_consecuencia: "Síndrome del túnel carpiano severo que requiera cirugía, discapacidad funcional de manos.",
    examenes_medicos: JSON.stringify({ EMO: 1, NEURO: 2, RXT: 2 }),
    aptitudes_requeridas: JSON.stringify(["Función motora fina normal en manos", "Ausencia de neuropatías periféricas", "Rango de movimiento completo en muñecas"]),
    condiciones_incompatibles: JSON.stringify(["Síndrome del túnel carpiano diagnosticado", "Artritis reumatoide severa en manos", "Secuelas de fracturas de muñeca con limitación funcional", "Tendinitis crónica de muñeca o mano"]),
    epp_sugeridos: JSON.stringify(["Teclado ergonómico (dividido o con inclinación negativa)", "Mouse ergonómico vertical", "Apoyamuñecas acolchado", "Pad de mouse con soporte de muñeca"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Reducir tiempo de digitación mediante software de reconocimiento de voz.",
      sustitucion: "Alternar entre dispositivos de entrada (teclado, mouse, trackpad, lápiz digital).",
      controles_ingenieria: "Periféricos ergonómicos, ajuste de altura de teclado y mouse (codos a 90°), superficie de trabajo a altura de codos.",
      controles_administrativos: "Pausas activas cada 1-2 horas con ejercicios de manos y muñecas, técnica de digitación correcta, evaluaciones ergonómicas del puesto, rotación de tareas."
    }),
    relevancia_por_sector: JSON.stringify({ oficina: 10, tecnologia: 10, call_center: 10, educacion: 7, comercio: 6, manufactura: 4 }),
    orden: contadorOrden['RB']++,
    activo: true
  });

  // ===== RIESGO QUÍMICO (3 GES) =====

  gesComplementarios.push({
    riesgo_id: riesgoMap['RQ'],
    nombre: "Solventes orgánicos - Exposición a benceno, tolueno, xileno",
    consecuencias: "Irritación de vías respiratorias, cefaleas, mareos, náuseas, dermatitis, efectos neurotóxicos.",
    peor_consecuencia: "Leucemia (benceno), daño hepático y renal, neuropatía periférica, depresión del sistema nervioso central.",
    examenes_medicos: JSON.stringify({ EMO: 1, ESPI: 1, HEPA: 1, HEMA: 1, NEURO: 2, DERM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Función hepática y renal normal", "Sistema nervioso central sin alteraciones previas", "Ausencia de enfermedades respiratorias crónicas", "Piel sin dermatitis severas"]),
    condiciones_incompatibles: JSON.stringify(["Hepatopatías crónicas", "Insuficiencia renal", "Neuropatías periféricas", "Asma o EPOC", "Embarazo", "Alcoholismo activo"]),
    epp_sugeridos: JSON.stringify(["Respirador con filtros orgánicos (media cara o cara completa)", "Guantes resistentes a solventes (nitrilo, neopreno)", "Gafas de seguridad química", "Delantal o ropa impermeable a químicos"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Sustituir solventes orgánicos por soluciones acuosas o menos tóxicas.",
      sustitucion: "Usar solventes de menor toxicidad (ej: acetona en lugar de benceno).",
      controles_ingenieria: "Sistemas de ventilación local exhaustiva, cabinas de extracción, procesos cerrados, almacenamiento seguro.",
      controles_administrativos: "Mediciones ambientales periódicas, rotación de personal, límites de exposición (TLV-ACGIH), exámenes médicos ocupacionales específicos (hemograma, pruebas hepáticas), capacitación en manejo seguro de químicos."
    }),
    relevancia_por_sector: JSON.stringify({ manufactura: 10, metalmecanica: 9, construccion: 7, mineria: 6, tecnologia: 3 }),
    orden: contadorOrden['RQ']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RQ'],
    nombre: "Material particulado - Polvo de sílice, madera, metales",
    consecuencias: "Irritación respiratoria, tos crónica, rinitis, conjuntivitis, alergias.",
    peor_consecuencia: "Silicosis (sílice cristalina), asma ocupacional, enfermedad pulmonar obstructiva crónica (EPOC), cáncer de pulmón (sílice).",
    examenes_medicos: JSON.stringify({ EMO: 1, ESPI: 1, RXT: 1 }),
    aptitudes_requeridas: JSON.stringify(["Función respiratoria normal", "Ausencia de enfermedades pulmonares previas", "Capacidad de usar correctamente equipos de protección respiratoria"]),
    condiciones_incompatibles: JSON.stringify(["Asma severa", "EPOC", "Fibrosis pulmonar", "Silicosis o neumoconiosis previa", "Insuficiencia respiratoria"]),
    epp_sugeridos: JSON.stringify(["Respirador N95 o superior (P100 para sílice)", "Gafas de seguridad herméticas", "Ropa de trabajo que cubra la piel", "Lavado de ropa de trabajo separado"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Procesos húmedos para suprimir polvo (ej: corte con agua).",
      sustitucion: "Materiales menos pulverulentos o con menor contenido de sílice.",
      controles_ingenieria: "Sistemas de captación en el punto de generación, ventilación local exhaustiva, cabinas cerradas, limpieza con aspiradoras industriales (no barrido seco).",
      controles_administrativos: "Mediciones ambientales periódicas, cumplimiento de límites TLV (0.025 mg/m³ para sílice respirable), espirometrías anuales, radiografías de tórax cada 2 años, capacitación en riesgos y protección."
    }),
    relevancia_por_sector: JSON.stringify({ construccion: 10, mineria: 10, manufactura: 9, metalmecanica: 9, agricultura: 7 }),
    orden: contadorOrden['RQ']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RQ'],
    nombre: "Plaguicidas y agroquímicos - Herbicidas, insecticidas, fungicidas",
    consecuencias: "Intoxicación aguda (náuseas, vómito, diarrea, cefalea), dermatitis de contacto, irritación ocular, efectos neurotóxicos.",
    peor_consecuencia: "Intoxicación severa con falla orgánica múltiple, muerte, cáncer (glifosato clasificado 2A IARC), efectos reproductivos, neuropatía periférica crónica.",
    examenes_medicos: JSON.stringify({ EMO: 1, HEPA: 1, COLINES: 1, HEMA: 2, NEURO: 2, DERM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Función hepática y renal normal", "Nivel de colinesterasa basal normal (organofosforados)", "Capacidad de seguir estrictamente protocolos de seguridad", "Ausencia de enfermedades neurológicas previas"]),
    condiciones_incompatibles: JSON.stringify(["Hepatopatías crónicas", "Insuficiencia renal", "Neuropatías periféricas", "Dermatitis crónica severa", "Embarazo", "Lactancia", "Alcoholismo activo"]),
    epp_sugeridos: JSON.stringify(["Respirador con filtros combinados (gases + partículas)", "Guantes resistentes a químicos (nitrilo de alta resistencia)", "Gafas de seguridad herméticas o careta facial", "Traje de protección química (Tyvek o similar)", "Botas de caucho"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Control integrado de plagas (CIP) reduciendo uso de plaguicidas químicos.",
      sustitucion: "Uso de plaguicidas de menor toxicidad (categoría III-IV OMS en lugar de Ia-Ib).",
      controles_ingenieria: "Equipos de aplicación cerrados, drones para fumigación, almacenamiento seguro con ventilación, duchas de emergencia.",
      controles_administrativos: "Capacitación certificada en manejo de plaguicidas, monitoreo de colinesterasa (organofosorados y carbamatos) cada 3-6 meses, respeto de períodos de reentrada, uso obligatorio de EPP, lavado de manos antes de comer, prohibición de fumar/beber en zonas de aplicación."
    }),
    relevancia_por_sector: JSON.stringify({ agricultura: 10, mineria: 3, manufactura: 4, servicios_publicos: 5, salud: 2 }),
    orden: contadorOrden['RQ']++,
    activo: true
  });

  // ===== RIESGO TECNOLÓGICO (2 GES) =====

  gesComplementarios.push({
    riesgo_id: riesgoMap['RT'],
    nombre: "Incendio o explosión - Presencia de materiales combustibles/inflamables",
    consecuencias: "Quemaduras de diverso grado, inhalación de humo, intoxicación por CO, trauma por explosión, pánico.",
    peor_consecuencia: "Muerte por quemaduras, asfixia o trauma explosivo, lesiones permanentes.",
    examenes_medicos: JSON.stringify({ EMO: 1, ESPI: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Capacidad de reacción rápida ante emergencias", "Conocimiento de protocolos de evacuación", "Condición física para movilización rápida", "Capacidad de mantener la calma bajo presión"]),
    condiciones_incompatibles: JSON.stringify(["Discapacidades de movilidad que dificulten evacuación rápida (requiere plan especial)", "Enfermedades respiratorias severas que se agraven con humo", "Trastornos de pánico severos"]),
    epp_sugeridos: JSON.stringify(["Ropa ignífuga (para trabajos de alto riesgo)", "Casco de seguridad", "Botas de seguridad", "Guantes de protección térmica", "Equipo de respiración autónomo (brigadas)"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar o reducir al mínimo materiales combustibles e inflamables.",
      sustitucion: "Sustituir materiales inflamables por opciones ignífugas o menos combustibles.",
      controles_ingenieria: "Sistemas de detección y alarma de incendio, rociadores automáticos, extintores apropiados y distribuidos, compartimentación de áreas, puertas cortafuego, ventilación adecuada, almacenamiento seguro de inflamables.",
      controles_administrativos: "Plan de emergencias y evacuación, brigadas de emergencia entrenadas, simulacros periódicos, permisos de trabajo en caliente, inspecciones de seguridad contra incendios, orden y aseo estricto, prohibición de fumar en áreas de riesgo, cumplimiento NSR-10 y NTC 1461."
    }),
    relevancia_por_sector: JSON.stringify({ manufactura: 9, metalmecanica: 9, mineria: 8, construccion: 7, comercio: 6, salud: 5 }),
    orden: contadorOrden['RT']++,
    activo: true
  });

  gesComplementarios.push({
    riesgo_id: riesgoMap['RT'],
    nombre: "Fuga o derrame de sustancias peligrosas",
    consecuencias: "Intoxicación aguda, quemaduras químicas, irritación respiratoria, contaminación ambiental, pánico.",
    peor_consecuencia: "Muerte por inhalación de gases tóxicos, quemaduras químicas severas, intoxicación sistémica grave, desastre ambiental.",
    examenes_medicos: JSON.stringify({ EMO: 1, ESPI: 1, DERM: 1, PSM: 2 }),
    aptitudes_requeridas: JSON.stringify(["Conocimiento de hojas de seguridad (SDS)", "Capacidad de reacción ante emergencias químicas", "Conocimiento de protocolos de contención y evacuación", "Capacidad física para usar equipos de protección y evacuación"]),
    condiciones_incompatibles: JSON.stringify(["Alergias severas a sustancias químicas específicas manejadas en el sitio", "Enfermedades respiratorias severas", "Discapacidades de movilidad que dificulten evacuación rápida"]),
    epp_sugeridos: JSON.stringify(["Equipo de protección química (nivel A, B, C según riesgo)", "Respirador con suministro de aire o línea de aire", "Guantes resistentes a químicos", "Botas de seguridad química", "Kit de contención de derrames"]),
    medidas_intervencion: JSON.stringify({
      eliminacion: "Eliminar o minimizar uso y almacenamiento de sustancias peligrosas.",
      sustitucion: "Sustituir por sustancias de menor peligrosidad.",
      controles_ingenieria: "Sistemas de contención secundaria (diques, bandejas), sistemas de detección de fugas, ventilación adecuada, duchas de emergencia y lavaojos, almacenamiento segregado según compatibilidad.",
      controles_administrativos: "Plan de respuesta a emergencias químicas, brigadas HAZMAT entrenadas, hojas de seguridad accesibles, inspecciones periódicas de almacenamiento, simulacros de derrame, sistemas de notificación a autoridades ambientales, cumplimiento Decreto 1609 de 2002 (transporte de mercancías peligrosas)."
    }),
    relevancia_por_sector: JSON.stringify({ manufactura: 9, metalmecanica: 8, mineria: 8, construccion: 6, salud: 7, servicios_publicos: 6 }),
    orden: contadorOrden['RT']++,
    activo: true
  });

  // =========================================
  // INSERTAR GES COMPLEMENTARIOS
  // =========================================

  await knex('catalogo_ges').insert(gesComplementarios);

  console.log(`✅ Seed complementario completado:
   - 8 GES Psicosociales
   - 3 GES Fenómenos Naturales
   - 5 GES Físicos
   - 3 GES Biomecánicos
   - 3 GES Químicos
   - 2 GES Tecnológicos
   - TOTAL: 24 GES complementarios insertados
   - Total acumulado: ${60 + 24} = 84 GES`);
};
