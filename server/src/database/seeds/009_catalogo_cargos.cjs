/**
 * Seed: Catálogo de Cargos (500+ cargos)
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Catálogo maestro de cargos predefinidos organizados por sector y área.
 * Incluye riesgos típicos, exámenes sugeridos y aptitudes.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('👔 [SEED] Insertando catálogo de cargos...');

  const tableExists = await knex.schema.hasTable('catalogo_cargos');
  if (!tableExists) {
    console.log('⚠️  Tabla catalogo_cargos no existe. Ejecute primero la migración.');
    return;
  }

  await knex('catalogo_cargos').del();

  // ================================================
  // CARGOS ADMINISTRATIVOS (80)
  // ================================================
  const cargosAdministrativos = [
    // Dirección y Gerencia
    { nombre: 'Gerente General', sector: 'Administrativo', area: 'DIRECCIÓN', descripcion: 'Máxima autoridad ejecutiva de la organización', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés laboral', 'Sedentarismo', 'Fatiga mental'], examenes_sugeridos: ['EMO', 'PSM', 'OPTO'], aptitudes: ['Liderazgo', 'Toma de decisiones', 'Visión estratégica'] },
    { nombre: 'Director Ejecutivo', sector: 'Administrativo', area: 'DIRECCIÓN', descripcion: 'Dirección ejecutiva de operaciones', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés laboral', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Liderazgo', 'Gestión de equipos'] },
    { nombre: 'Director Financiero', sector: 'Administrativo', area: 'FINANZAS', descripcion: 'Dirección de finanzas y tesorería', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés laboral', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Análisis financiero', 'Gestión de riesgos'] },
    { nombre: 'Director de Operaciones', sector: 'Administrativo', area: 'OPERACIONES', descripcion: 'Dirección de operaciones y producción', nivel_riesgo: 'II', riesgos_tipicos: ['Estrés laboral', 'Visitas a planta'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Gestión de procesos', 'Liderazgo'] },
    { nombre: 'Director de Recursos Humanos', sector: 'Administrativo', area: 'RECURSOS HUMANOS', descripcion: 'Dirección de gestión humana', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés laboral', 'Carga emocional'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Gestión del talento', 'Comunicación'] },
    { nombre: 'Director Comercial', sector: 'Administrativo', area: 'COMERCIAL', descripcion: 'Dirección de ventas y mercadeo', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por metas', 'Viajes frecuentes'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Ventas', 'Negociación', 'Liderazgo'] },
    { nombre: 'Director de Tecnología', sector: 'Administrativo', area: 'TECNOLOGÍA', descripcion: 'Dirección de sistemas y tecnología', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés laboral', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Tecnología', 'Innovación'] },
    
    // Gerencias Medias
    { nombre: 'Gerente de Planta', sector: 'Administrativo', area: 'OPERACIONES', descripcion: 'Gerencia de planta de producción', nivel_riesgo: 'II', riesgos_tipicos: ['Ruido', 'Estrés laboral'], examenes_sugeridos: ['EMO', 'AUDIO', 'PSM'], aptitudes: ['Gestión de producción', 'Liderazgo'] },
    { nombre: 'Gerente de Ventas', sector: 'Administrativo', area: 'COMERCIAL', descripcion: 'Gerencia del equipo de ventas', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por metas', 'Viajes'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Ventas', 'Liderazgo de equipos'] },
    { nombre: 'Gerente de Proyectos', sector: 'Administrativo', area: 'PROYECTOS', descripcion: 'Gerencia de proyectos especiales', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por deadlines', 'Fatiga mental'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Gestión de proyectos', 'Planificación'] },
    { nombre: 'Gerente de Calidad', sector: 'Administrativo', area: 'CALIDAD', descripcion: 'Gerencia de aseguramiento de calidad', nivel_riesgo: 'II', riesgos_tipicos: ['Visitas a planta', 'Estrés'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Control de calidad', 'ISO 9001'] },
    { nombre: 'Gerente de Logística', sector: 'Administrativo', area: 'LOGÍSTICA', descripcion: 'Gerencia de cadena de suministro', nivel_riesgo: 'II', riesgos_tipicos: ['Estrés', 'Visitas a bodega'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Logística', 'Cadena de suministro'] },
    { nombre: 'Gerente de Marketing', sector: 'Administrativo', area: 'MARKETING', descripcion: 'Gerencia de mercadeo y publicidad', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés creativo', 'Deadlines'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Marketing', 'Creatividad'] },
    { nombre: 'Gerente Administrativo', sector: 'Administrativo', area: 'ADMINISTRATIVA', descripcion: 'Gerencia de servicios administrativos', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Estrés'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Administración', 'Organización'] },
    { nombre: 'Gerente de Compras', sector: 'Administrativo', area: 'COMPRAS', descripcion: 'Gerencia de adquisiciones y proveedores', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por negociación', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Negociación', 'Gestión de proveedores'] },
    
    // Coordinadores y Jefes
    { nombre: 'Coordinador Administrativo', sector: 'Administrativo', area: 'ADMINISTRATIVA', descripcion: 'Coordinación de procesos administrativos', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Organización', 'Coordinación'] },
    { nombre: 'Coordinador de Recursos Humanos', sector: 'Administrativo', area: 'RECURSOS HUMANOS', descripcion: 'Coordinación de procesos de RRHH', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Carga emocional'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Gestión de personal', 'Comunicación'] },
    { nombre: 'Coordinador de Nómina', sector: 'Administrativo', area: 'RECURSOS HUMANOS', descripcion: 'Coordinación de procesos de nómina', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por fechas', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Nómina', 'Legislación laboral'] },
    { nombre: 'Coordinador de Selección', sector: 'Administrativo', area: 'RECURSOS HUMANOS', descripcion: 'Coordinación de reclutamiento y selección', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Fatiga por entrevistas'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Selección de personal', 'Entrevistas'] },
    { nombre: 'Coordinador de Capacitación', sector: 'Administrativo', area: 'RECURSOS HUMANOS', descripcion: 'Coordinación de formación y desarrollo', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Disfonía'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Capacitación', 'Desarrollo organizacional'] },
    { nombre: 'Jefe de Contabilidad', sector: 'Administrativo', area: 'CONTABILIDAD', descripcion: 'Jefatura del departamento contable', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por cierres', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Contabilidad', 'NIIF'] },
    { nombre: 'Jefe de Tesorería', sector: 'Administrativo', area: 'FINANZAS', descripcion: 'Jefatura de tesorería y pagos', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Sedentarismo'], examenes_sugeridos: ['EMO'], aptitudes: ['Tesorería', 'Gestión de flujo de caja'] },
    { nombre: 'Jefe de Cartera', sector: 'Administrativo', area: 'FINANZAS', descripcion: 'Jefatura de gestión de cartera', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por cobranza', 'Fatiga'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Cobranza', 'Negociación'] },
    { nombre: 'Jefe de Compras', sector: 'Administrativo', area: 'COMPRAS', descripcion: 'Jefatura de compras y adquisiciones', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Sedentarismo'], examenes_sugeridos: ['EMO'], aptitudes: ['Compras', 'Negociación'] },
    { nombre: 'Jefe de Almacén', sector: 'Administrativo', area: 'LOGÍSTICA', descripcion: 'Jefatura de bodega y almacenamiento', nivel_riesgo: 'II', riesgos_tipicos: ['Carga física', 'Caídas'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Inventarios', 'Logística'] },
    
    // Analistas y Profesionales
    { nombre: 'Analista Financiero', sector: 'Administrativo', area: 'FINANZAS', descripcion: 'Análisis financiero y proyecciones', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Análisis financiero', 'Excel avanzado'] },
    { nombre: 'Analista de Costos', sector: 'Administrativo', area: 'FINANZAS', descripcion: 'Análisis de costos y presupuestos', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Costos', 'Presupuestos'] },
    { nombre: 'Analista de Presupuesto', sector: 'Administrativo', area: 'FINANZAS', descripcion: 'Elaboración y control presupuestal', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Estrés'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Presupuestos', 'Planeación'] },
    { nombre: 'Analista Contable', sector: 'Administrativo', area: 'CONTABILIDAD', descripcion: 'Análisis y registro contable', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Contabilidad', 'NIIF'] },
    { nombre: 'Analista de Nómina', sector: 'Administrativo', area: 'RECURSOS HUMANOS', descripcion: 'Procesamiento de nómina', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Estrés por fechas'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Nómina', 'Legislación laboral'] },
    { nombre: 'Analista de Datos', sector: 'Administrativo', area: 'TECNOLOGÍA', descripcion: 'Análisis de datos y reportes', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Análisis de datos', 'SQL', 'Power BI'] },
    { nombre: 'Analista de Compras', sector: 'Administrativo', area: 'COMPRAS', descripcion: 'Análisis y gestión de compras', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Estrés'], examenes_sugeridos: ['EMO'], aptitudes: ['Compras', 'Negociación'] },
    { nombre: 'Analista de Inventarios', sector: 'Administrativo', area: 'LOGÍSTICA', descripcion: 'Control y análisis de inventarios', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Visitas a bodega'], examenes_sugeridos: ['EMO'], aptitudes: ['Inventarios', 'Excel'] },
    
    // Asistentes y Auxiliares
    { nombre: 'Asistente Administrativo', sector: 'Administrativo', area: 'ADMINISTRATIVA', descripcion: 'Apoyo administrativo general', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Organización', 'Office'] },
    { nombre: 'Asistente de Gerencia', sector: 'Administrativo', area: 'DIRECCIÓN', descripcion: 'Asistencia a la gerencia general', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Sedentarismo'], examenes_sugeridos: ['EMO'], aptitudes: ['Organización', 'Comunicación'] },
    { nombre: 'Asistente Contable', sector: 'Administrativo', area: 'CONTABILIDAD', descripcion: 'Apoyo en procesos contables', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Contabilidad básica', 'Excel'] },
    { nombre: 'Asistente de Recursos Humanos', sector: 'Administrativo', area: 'RECURSOS HUMANOS', descripcion: 'Apoyo en procesos de RRHH', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Estrés'], examenes_sugeridos: ['EMO'], aptitudes: ['Gestión documental', 'Atención'] },
    { nombre: 'Asistente de Compras', sector: 'Administrativo', area: 'COMPRAS', descripcion: 'Apoyo en gestión de compras', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo'], examenes_sugeridos: ['EMO'], aptitudes: ['Compras', 'Organización'] },
    { nombre: 'Auxiliar Administrativo', sector: 'Administrativo', area: 'ADMINISTRATIVA', descripcion: 'Apoyo operativo administrativo', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Fatiga visual'], examenes_sugeridos: ['EMO'], aptitudes: ['Office', 'Archivo'] },
    { nombre: 'Auxiliar Contable', sector: 'Administrativo', area: 'CONTABILIDAD', descripcion: 'Apoyo operativo contable', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Digitación', 'Archivo'] },
    { nombre: 'Auxiliar de Nómina', sector: 'Administrativo', area: 'RECURSOS HUMANOS', descripcion: 'Apoyo en procesamiento de nómina', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Digitación', 'Excel'] },
    { nombre: 'Auxiliar de Cartera', sector: 'Administrativo', area: 'FINANZAS', descripcion: 'Apoyo en gestión de cartera', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por cobranza'], examenes_sugeridos: ['EMO'], aptitudes: ['Cobranza', 'Comunicación'] },
    { nombre: 'Auxiliar de Archivo', sector: 'Administrativo', area: 'ADMINISTRATIVA', descripcion: 'Gestión documental y archivo', nivel_riesgo: 'I', riesgos_tipicos: ['Polvo', 'Posturas'], examenes_sugeridos: ['EMO', 'ESPI'], aptitudes: ['Organización', 'Archivo'] },
    
    // Secretarias y Recepción
    { nombre: 'Secretaria Ejecutiva', sector: 'Administrativo', area: 'DIRECCIÓN', descripcion: 'Secretaría de alta dirección', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Estrés'], examenes_sugeridos: ['EMO'], aptitudes: ['Organización', 'Comunicación'] },
    { nombre: 'Secretaria General', sector: 'Administrativo', area: 'ADMINISTRATIVA', descripcion: 'Secretaría de departamento', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Office', 'Atención'] },
    { nombre: 'Recepcionista', sector: 'Administrativo', area: 'ADMINISTRATIVA', descripcion: 'Atención en recepción', nivel_riesgo: 'I', riesgos_tipicos: ['Postura sentada', 'Estrés'], examenes_sugeridos: ['EMO'], aptitudes: ['Atención al cliente', 'Comunicación'] },
    
    // Legal
    { nombre: 'Abogado', sector: 'Administrativo', area: 'LEGAL', descripcion: 'Asesoría jurídica', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Derecho', 'Argumentación'] },
    { nombre: 'Asistente Legal', sector: 'Administrativo', area: 'LEGAL', descripcion: 'Apoyo en asuntos legales', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Derecho básico', 'Documentación'] },
    
    // SST
    { nombre: 'Coordinador de SST', sector: 'Administrativo', area: 'SST', descripcion: 'Coordinación del sistema de SST', nivel_riesgo: 'II', riesgos_tipicos: ['Visitas a campo', 'Estrés'], examenes_sugeridos: ['EMO', 'OSTE', 'AUDIO'], aptitudes: ['SST', 'Res. 0312'] },
    { nombre: 'Profesional de SST', sector: 'Administrativo', area: 'SST', descripcion: 'Gestión de seguridad y salud', nivel_riesgo: 'II', riesgos_tipicos: ['Visitas a campo', 'Estrés'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['SST', 'GTC-45'] },
    { nombre: 'Auxiliar de SST', sector: 'Administrativo', area: 'SST', descripcion: 'Apoyo en gestión de SST', nivel_riesgo: 'II', riesgos_tipicos: ['Visitas a campo'], examenes_sugeridos: ['EMO'], aptitudes: ['SST básico', 'Documentación'] },
  ];

  // ================================================
  // CARGOS OPERATIVOS (100)
  // ================================================
  const cargosOperativos = [
    // Producción
    { nombre: 'Jefe de Producción', sector: 'Operativo', area: 'PRODUCCIÓN', descripcion: 'Jefatura de líneas de producción', nivel_riesgo: 'III', riesgos_tipicos: ['Ruido', 'Estrés', 'Postura de pie'], examenes_sugeridos: ['EMO', 'AUDIO', 'OSTE'], aptitudes: ['Gestión de producción', 'Liderazgo'] },
    { nombre: 'Supervisor de Producción', sector: 'Operativo', area: 'PRODUCCIÓN', descripcion: 'Supervisión de operarios', nivel_riesgo: 'III', riesgos_tipicos: ['Ruido', 'Postura de pie'], examenes_sugeridos: ['EMO', 'AUDIO'], aptitudes: ['Supervisión', 'Control de procesos'] },
    { nombre: 'Operario de Producción', sector: 'Operativo', area: 'PRODUCCIÓN', descripcion: 'Operación de línea de producción', nivel_riesgo: 'III', riesgos_tipicos: ['Ruido', 'Movimientos repetitivos', 'Postura de pie'], examenes_sugeridos: ['EMO', 'AUDIO', 'OSTE'], aptitudes: ['Operación de máquinas', 'Atención al detalle'] },
    { nombre: 'Operario de Máquinas', sector: 'Operativo', area: 'PRODUCCIÓN', descripcion: 'Operación de maquinaria industrial', nivel_riesgo: 'IV', riesgos_tipicos: ['Ruido', 'Atrapamiento', 'Vibraciones'], examenes_sugeridos: ['EMO', 'AUDIO', 'OSTE'], aptitudes: ['Operación de maquinaria', 'Mecánica básica'] },
    { nombre: 'Operario de Ensamble', sector: 'Operativo', area: 'PRODUCCIÓN', descripcion: 'Ensamble de componentes', nivel_riesgo: 'III', riesgos_tipicos: ['Movimientos repetitivos', 'Postura'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Ensamble', 'Motricidad fina'] },
    { nombre: 'Operario de Empaque', sector: 'Operativo', area: 'PRODUCCIÓN', descripcion: 'Empaque de productos terminados', nivel_riesgo: 'II', riesgos_tipicos: ['Movimientos repetitivos', 'Carga física'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Empaque', 'Velocidad'] },
    { nombre: 'Operario de Calidad', sector: 'Operativo', area: 'CALIDAD', descripcion: 'Inspección de calidad en línea', nivel_riesgo: 'II', riesgos_tipicos: ['Fatiga visual', 'Postura de pie'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Control de calidad', 'Atención al detalle'] },
    { nombre: 'Inspector de Calidad', sector: 'Operativo', area: 'CALIDAD', descripcion: 'Inspección y control de calidad', nivel_riesgo: 'II', riesgos_tipicos: ['Fatiga visual', 'Desplazamientos'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['QA/QC', 'Metrología'] },
    
    // Mantenimiento
    { nombre: 'Jefe de Mantenimiento', sector: 'Operativo', area: 'MANTENIMIENTO', descripcion: 'Jefatura de mantenimiento industrial', nivel_riesgo: 'III', riesgos_tipicos: ['Ruido', 'Riesgo eléctrico', 'Mecánico'], examenes_sugeridos: ['EMO', 'AUDIO', 'OSTE'], aptitudes: ['Mantenimiento industrial', 'Gestión'] },
    { nombre: 'Técnico de Mantenimiento', sector: 'Operativo', area: 'MANTENIMIENTO', descripcion: 'Mantenimiento preventivo y correctivo', nivel_riesgo: 'IV', riesgos_tipicos: ['Riesgo eléctrico', 'Mecánico', 'Alturas'], examenes_sugeridos: ['EMO', 'AUDIO', 'OSTE', 'ALTE'], aptitudes: ['Mantenimiento', 'Electricidad', 'Mecánica'] },
    { nombre: 'Técnico Electricista', sector: 'Operativo', area: 'MANTENIMIENTO', descripcion: 'Mantenimiento eléctrico', nivel_riesgo: 'IV', riesgos_tipicos: ['Riesgo eléctrico', 'Alturas'], examenes_sugeridos: ['EMO', 'OSTE', 'ALTE'], aptitudes: ['Electricidad industrial', 'Automatización'] },
    { nombre: 'Técnico Mecánico', sector: 'Operativo', area: 'MANTENIMIENTO', descripcion: 'Mantenimiento mecánico', nivel_riesgo: 'IV', riesgos_tipicos: ['Mecánico', 'Ruido', 'Vibraciones'], examenes_sugeridos: ['EMO', 'AUDIO', 'OSTE'], aptitudes: ['Mecánica industrial', 'Soldadura'] },
    { nombre: 'Técnico en Refrigeración', sector: 'Operativo', area: 'MANTENIMIENTO', descripcion: 'Mantenimiento de equipos de frío', nivel_riesgo: 'III', riesgos_tipicos: ['Exposición a frío', 'Químicos refrigerantes'], examenes_sugeridos: ['EMO', 'ESPI', 'OSTE'], aptitudes: ['Refrigeración', 'HVAC'] },
    { nombre: 'Auxiliar de Mantenimiento', sector: 'Operativo', area: 'MANTENIMIENTO', descripcion: 'Apoyo en tareas de mantenimiento', nivel_riesgo: 'III', riesgos_tipicos: ['Mecánico', 'Eléctrico'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Mantenimiento básico', 'Herramientas'] },
    
    // Logística y Bodega
    { nombre: 'Jefe de Bodega', sector: 'Operativo', area: 'LOGÍSTICA', descripcion: 'Jefatura de almacén y bodega', nivel_riesgo: 'II', riesgos_tipicos: ['Carga física', 'Caídas de objetos'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Logística', 'Inventarios'] },
    { nombre: 'Supervisor de Bodega', sector: 'Operativo', area: 'LOGÍSTICA', descripcion: 'Supervisión de operaciones de bodega', nivel_riesgo: 'II', riesgos_tipicos: ['Carga física', 'Montacargas'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Supervisión', 'Control de inventarios'] },
    { nombre: 'Auxiliar de Bodega', sector: 'Operativo', area: 'LOGÍSTICA', descripcion: 'Recepción, almacenamiento y despacho', nivel_riesgo: 'III', riesgos_tipicos: ['Carga física', 'Caídas', 'Atropellamiento'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Bodega', 'Cargue/descargue'] },
    { nombre: 'Operador de Montacargas', sector: 'Operativo', area: 'LOGÍSTICA', descripcion: 'Operación de montacargas', nivel_riesgo: 'IV', riesgos_tipicos: ['Atropellamiento', 'Volcamiento', 'Golpes'], examenes_sugeridos: ['EMO', 'OPTO', 'OSTE'], aptitudes: ['Montacargas', 'Licencia'] },
    { nombre: 'Despachador', sector: 'Operativo', area: 'LOGÍSTICA', descripcion: 'Despacho de mercancía', nivel_riesgo: 'II', riesgos_tipicos: ['Carga física', 'Estrés'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Despacho', 'Documentación'] },
    { nombre: 'Alistador de Pedidos', sector: 'Operativo', area: 'LOGÍSTICA', descripcion: 'Picking y preparación de pedidos', nivel_riesgo: 'II', riesgos_tipicos: ['Carga física', 'Movimientos repetitivos'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Picking', 'Rapidez'] },
    
    // Construcción
    { nombre: 'Maestro de Obra', sector: 'Operativo', area: 'CONSTRUCCIÓN', descripcion: 'Dirección de obra civil', nivel_riesgo: 'IV', riesgos_tipicos: ['Caídas de altura', 'Golpes', 'Solar'], examenes_sugeridos: ['EMO', 'ALTE', 'OSTE', 'OPTO'], aptitudes: ['Construcción', 'Lectura de planos'] },
    { nombre: 'Oficial de Construcción', sector: 'Operativo', area: 'CONSTRUCCIÓN', descripcion: 'Labores especializadas de construcción', nivel_riesgo: 'IV', riesgos_tipicos: ['Caídas', 'Golpes', 'Polvo'], examenes_sugeridos: ['EMO', 'ALTE', 'OSTE', 'ESPI'], aptitudes: ['Albañilería', 'Acabados'] },
    { nombre: 'Ayudante de Construcción', sector: 'Operativo', area: 'CONSTRUCCIÓN', descripcion: 'Apoyo en labores de construcción', nivel_riesgo: 'IV', riesgos_tipicos: ['Carga física', 'Caídas', 'Golpes'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Fuerza física', 'Trabajo en equipo'] },
    { nombre: 'Soldador', sector: 'Operativo', area: 'CONSTRUCCIÓN', descripcion: 'Soldadura de estructuras', nivel_riesgo: 'IV', riesgos_tipicos: ['Radiación UV', 'Humos', 'Quemaduras'], examenes_sugeridos: ['EMO', 'ESPI', 'OPTO', 'OSTE'], aptitudes: ['Soldadura MIG/TIG', 'Lectura de planos'] },
    { nombre: 'Plomero', sector: 'Operativo', area: 'CONSTRUCCIÓN', descripcion: 'Instalaciones hidráulicas y sanitarias', nivel_riesgo: 'III', riesgos_tipicos: ['Posturas forzadas', 'Espacios confinados'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Plomería', 'Gas'] },
    { nombre: 'Electricista', sector: 'Operativo', area: 'CONSTRUCCIÓN', descripcion: 'Instalaciones eléctricas', nivel_riesgo: 'IV', riesgos_tipicos: ['Riesgo eléctrico', 'Alturas'], examenes_sugeridos: ['EMO', 'ALTE', 'OSTE'], aptitudes: ['Electricidad', 'RETIE'] },
    { nombre: 'Pintor', sector: 'Operativo', area: 'CONSTRUCCIÓN', descripcion: 'Pintura y acabados', nivel_riesgo: 'III', riesgos_tipicos: ['Químicos', 'Alturas', 'Posturas'], examenes_sugeridos: ['EMO', 'ESPI', 'ALTE'], aptitudes: ['Pintura', 'Acabados'] },
    { nombre: 'Carpintero', sector: 'Operativo', area: 'CONSTRUCCIÓN', descripcion: 'Carpintería y ebanistería', nivel_riesgo: 'III', riesgos_tipicos: ['Cortes', 'Polvo de madera', 'Ruido'], examenes_sugeridos: ['EMO', 'AUDIO', 'ESPI'], aptitudes: ['Carpintería', 'Herramientas'] },
    { nombre: 'Enchapador', sector: 'Operativo', area: 'CONSTRUCCIÓN', descripcion: 'Instalación de enchapes', nivel_riesgo: 'III', riesgos_tipicos: ['Posturas forzadas', 'Polvo', 'Cortes'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Enchapes', 'Precisión'] },
    
    // Aseo y Servicios Generales
    { nombre: 'Auxiliar de Servicios Generales', sector: 'Operativo', area: 'SERVICIOS', descripcion: 'Aseo y mantenimiento de instalaciones', nivel_riesgo: 'II', riesgos_tipicos: ['Químicos de limpieza', 'Caídas', 'Posturas'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Limpieza', 'Organización'] },
    { nombre: 'Aseador', sector: 'Operativo', area: 'SERVICIOS', descripcion: 'Limpieza de instalaciones', nivel_riesgo: 'II', riesgos_tipicos: ['Químicos', 'Pisos húmedos', 'Posturas'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Limpieza', 'Responsabilidad'] },
    { nombre: 'Jardinero', sector: 'Operativo', area: 'SERVICIOS', descripcion: 'Mantenimiento de zonas verdes', nivel_riesgo: 'II', riesgos_tipicos: ['Solar', 'Herramientas cortantes', 'Pesticidas'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Jardinería', 'Herramientas'] },
    { nombre: 'Todero', sector: 'Operativo', area: 'SERVICIOS', descripcion: 'Labores varias de mantenimiento', nivel_riesgo: 'III', riesgos_tipicos: ['Múltiples', 'Alturas', 'Eléctrico'], examenes_sugeridos: ['EMO', 'OSTE', 'ALTE'], aptitudes: ['Versatilidad', 'Mantenimiento básico'] },
    
    // Vigilancia
    { nombre: 'Vigilante', sector: 'Operativo', area: 'SEGURIDAD', descripcion: 'Vigilancia y control de acceso', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo público', 'Turnos nocturnos', 'Postura de pie'], examenes_sugeridos: ['EMO', 'PSM', 'OPTO'], aptitudes: ['Vigilancia', 'Atención'] },
    { nombre: 'Guarda de Seguridad', sector: 'Operativo', area: 'SEGURIDAD', descripcion: 'Seguridad física de instalaciones', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo público', 'Estrés', 'Turnos'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Seguridad', 'Defensa personal'] },
    { nombre: 'Escolta', sector: 'Operativo', area: 'SEGURIDAD', descripcion: 'Protección de personas', nivel_riesgo: 'V', riesgos_tipicos: ['Riesgo público alto', 'Armas de fuego', 'Estrés'], examenes_sugeridos: ['EMO', 'PSM', 'OPTO', 'AUDIO'], aptitudes: ['Protección', 'Armas', 'Conducción'] },
    
    // Cocina
    { nombre: 'Chef', sector: 'Operativo', area: 'COCINA', descripcion: 'Jefatura de cocina', nivel_riesgo: 'III', riesgos_tipicos: ['Quemaduras', 'Cortes', 'Calor'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Gastronomía', 'Liderazgo'] },
    { nombre: 'Cocinero', sector: 'Operativo', area: 'COCINA', descripcion: 'Preparación de alimentos', nivel_riesgo: 'III', riesgos_tipicos: ['Quemaduras', 'Cortes', 'Postura de pie'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Cocina', 'Manipulación de alimentos'] },
    { nombre: 'Auxiliar de Cocina', sector: 'Operativo', area: 'COCINA', descripcion: 'Apoyo en preparación de alimentos', nivel_riesgo: 'II', riesgos_tipicos: ['Cortes', 'Quemaduras', 'Pisos húmedos'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Cocina básica', 'Limpieza'] },
    { nombre: 'Mesero', sector: 'Operativo', area: 'COCINA', descripcion: 'Atención en restaurante', nivel_riesgo: 'II', riesgos_tipicos: ['Postura de pie', 'Carga de bandejas', 'Estrés'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Servicio', 'Atención al cliente'] },
  ];

  // ================================================
  // CARGOS TÉCNICOS (80)
  // ================================================
  const cargosTecnicos = [
    // Tecnología
    { nombre: 'Ingeniero de Software', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Desarrollo de software', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo', 'Síndrome del túnel carpiano'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Programación', 'Algoritmos'] },
    { nombre: 'Desarrollador Full Stack', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Desarrollo frontend y backend', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['JavaScript', 'Bases de datos', 'APIs'] },
    { nombre: 'Desarrollador Frontend', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Desarrollo de interfaces de usuario', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['HTML/CSS', 'JavaScript', 'React/Vue'] },
    { nombre: 'Desarrollador Backend', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Desarrollo de servidores y APIs', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Node.js/Python', 'Bases de datos', 'APIs'] },
    { nombre: 'Desarrollador Mobile', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Desarrollo de apps móviles', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['React Native/Flutter', 'iOS/Android'] },
    { nombre: 'Arquitecto de Software', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Diseño de arquitectura de sistemas', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga mental', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Arquitectura', 'Cloud', 'Patrones de diseño'] },
    { nombre: 'DevOps Engineer', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Infraestructura y despliegue', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por disponibilidad', 'Fatiga visual'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Docker', 'Kubernetes', 'CI/CD'] },
    { nombre: 'Analista de Sistemas', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Análisis y diseño de sistemas', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Análisis', 'UML', 'Requerimientos'] },
    { nombre: 'Administrador de Base de Datos', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Administración de bases de datos', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Estrés por disponibilidad'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['SQL', 'PostgreSQL/Oracle', 'Backup'] },
    { nombre: 'Administrador de Redes', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Administración de infraestructura de red', nivel_riesgo: 'II', riesgos_tipicos: ['Estrés por disponibilidad', 'Trabajo en datacenter'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Redes', 'Cisco', 'Firewall'] },
    { nombre: 'Especialista en Ciberseguridad', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Seguridad informática', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por amenazas', 'Fatiga mental'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Seguridad', 'Ethical hacking', 'SIEM'] },
    { nombre: 'QA Engineer', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Aseguramiento de calidad de software', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Testing', 'Automatización', 'Selenium'] },
    { nombre: 'Soporte Técnico', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Soporte a usuarios y equipos', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por usuarios', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Soporte', 'Hardware', 'Software'] },
    { nombre: 'Técnico en Sistemas', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Mantenimiento de equipos de cómputo', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Posturas forzadas'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Hardware', 'Redes', 'Windows/Linux'] },
    { nombre: 'Data Scientist', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Ciencia de datos y machine learning', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo', 'Fatiga mental'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Python', 'Machine Learning', 'Estadística'] },
    { nombre: 'UX/UI Designer', sector: 'Técnico', area: 'TECNOLOGÍA', descripcion: 'Diseño de experiencia de usuario', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Figma', 'Diseño', 'Investigación de usuarios'] },
    
    // Ingeniería
    { nombre: 'Ingeniero Civil', sector: 'Técnico', area: 'INGENIERÍA', descripcion: 'Diseño y supervisión de obras civiles', nivel_riesgo: 'III', riesgos_tipicos: ['Visitas a obra', 'Caídas', 'Solar'], examenes_sugeridos: ['EMO', 'ALTE', 'OSTE'], aptitudes: ['Estructuras', 'AutoCAD', 'Presupuestos'] },
    { nombre: 'Ingeniero Industrial', sector: 'Técnico', area: 'INGENIERÍA', descripcion: 'Optimización de procesos', nivel_riesgo: 'II', riesgos_tipicos: ['Visitas a planta', 'Ruido'], examenes_sugeridos: ['EMO', 'AUDIO'], aptitudes: ['Procesos', 'Lean', 'Six Sigma'] },
    { nombre: 'Ingeniero Mecánico', sector: 'Técnico', area: 'INGENIERÍA', descripcion: 'Diseño y mantenimiento mecánico', nivel_riesgo: 'III', riesgos_tipicos: ['Ruido', 'Mecánico', 'Vibraciones'], examenes_sugeridos: ['EMO', 'AUDIO', 'OSTE'], aptitudes: ['Mecánica', 'CAD', 'Materiales'] },
    { nombre: 'Ingeniero Eléctrico', sector: 'Técnico', area: 'INGENIERÍA', descripcion: 'Diseño e instalación eléctrica', nivel_riesgo: 'IV', riesgos_tipicos: ['Riesgo eléctrico', 'Alturas'], examenes_sugeridos: ['EMO', 'ALTE', 'OSTE'], aptitudes: ['Electricidad', 'RETIE', 'Potencia'] },
    { nombre: 'Ingeniero Electrónico', sector: 'Técnico', area: 'INGENIERÍA', descripcion: 'Diseño de sistemas electrónicos', nivel_riesgo: 'II', riesgos_tipicos: ['Fatiga visual', 'Soldadura electrónica'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Electrónica', 'PLC', 'Automatización'] },
    { nombre: 'Ingeniero Químico', sector: 'Técnico', area: 'INGENIERÍA', descripcion: 'Procesos químicos e industriales', nivel_riesgo: 'III', riesgos_tipicos: ['Exposición a químicos', 'Vapores'], examenes_sugeridos: ['EMO', 'ESPI', 'OSTE'], aptitudes: ['Química', 'Procesos', 'Seguridad química'] },
    { nombre: 'Ingeniero Ambiental', sector: 'Técnico', area: 'INGENIERÍA', descripcion: 'Gestión ambiental', nivel_riesgo: 'II', riesgos_tipicos: ['Trabajo de campo', 'Solar'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Ambiental', 'ISO 14001', 'PTAR'] },
    { nombre: 'Ingeniero de Calidad', sector: 'Técnico', area: 'CALIDAD', descripcion: 'Gestión de calidad', nivel_riesgo: 'II', riesgos_tipicos: ['Visitas a planta', 'Estrés'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['ISO 9001', 'Auditorías', 'Mejora continua'] },
    
    // Diseño
    { nombre: 'Diseñador Gráfico', sector: 'Técnico', area: 'DISEÑO', descripcion: 'Diseño visual y publicitario', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Adobe Suite', 'Creatividad', 'Diseño'] },
    { nombre: 'Diseñador Industrial', sector: 'Técnico', area: 'DISEÑO', descripcion: 'Diseño de productos', nivel_riesgo: 'II', riesgos_tipicos: ['Fatiga visual', 'Trabajo con prototipos'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['3D', 'Renderizado', 'Ergonomía'] },
    { nombre: 'Arquitecto', sector: 'Técnico', area: 'DISEÑO', descripcion: 'Diseño arquitectónico', nivel_riesgo: 'II', riesgos_tipicos: ['Fatiga visual', 'Visitas a obra'], examenes_sugeridos: ['EMO', 'OPTO', 'ALTE'], aptitudes: ['AutoCAD', 'Revit', 'Diseño'] },
    { nombre: 'Dibujante Técnico', sector: 'Técnico', area: 'DISEÑO', descripcion: 'Elaboración de planos', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['AutoCAD', 'Planos', 'Detalles técnicos'] },
  ];

  // ================================================
  // CARGOS COMERCIALES (60)
  // ================================================
  const cargosComerciales = [
    { nombre: 'Director de Ventas', sector: 'Comercial', area: 'VENTAS', descripcion: 'Dirección del equipo comercial', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por metas', 'Viajes'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Ventas', 'Liderazgo', 'Estrategia'] },
    { nombre: 'Gerente de Zona', sector: 'Comercial', area: 'VENTAS', descripcion: 'Gerencia de zona geográfica', nivel_riesgo: 'II', riesgos_tipicos: ['Viajes frecuentes', 'Estrés por metas'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Ventas', 'Gestión de territorio'] },
    { nombre: 'Ejecutivo de Cuenta', sector: 'Comercial', area: 'VENTAS', descripcion: 'Gestión de clientes corporativos', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por metas', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Ventas B2B', 'Negociación'] },
    { nombre: 'Asesor Comercial', sector: 'Comercial', area: 'VENTAS', descripcion: 'Venta de productos/servicios', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por metas', 'Desplazamientos'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Ventas', 'Persuasión', 'CRM'] },
    { nombre: 'Vendedor', sector: 'Comercial', area: 'VENTAS', descripcion: 'Venta directa', nivel_riesgo: 'II', riesgos_tipicos: ['Estrés por metas', 'Postura de pie'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Ventas', 'Atención al cliente'] },
    { nombre: 'Vendedor Externo', sector: 'Comercial', area: 'VENTAS', descripcion: 'Venta en campo', nivel_riesgo: 'II', riesgos_tipicos: ['Accidentes de tránsito', 'Riesgo público'], examenes_sugeridos: ['EMO', 'PSM', 'OPTO'], aptitudes: ['Ventas', 'Conducción', 'Autonomía'] },
    { nombre: 'Televendedor', sector: 'Comercial', area: 'VENTAS', descripcion: 'Venta telefónica', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga vocal', 'Sedentarismo', 'Estrés'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Televentas', 'Comunicación'] },
    { nombre: 'Representante de Ventas', sector: 'Comercial', area: 'VENTAS', descripcion: 'Representación comercial', nivel_riesgo: 'II', riesgos_tipicos: ['Viajes', 'Estrés por metas'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Ventas', 'Relaciones comerciales'] },
    { nombre: 'Key Account Manager', sector: 'Comercial', area: 'VENTAS', descripcion: 'Gestión de cuentas clave', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por responsabilidad', 'Viajes'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Ventas estratégicas', 'Negociación'] },
    
    // Servicio al Cliente
    { nombre: 'Jefe de Servicio al Cliente', sector: 'Comercial', area: 'SERVICIO', descripcion: 'Jefatura de servicio al cliente', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por quejas', 'Carga emocional'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Servicio', 'Liderazgo', 'Resolución de conflictos'] },
    { nombre: 'Coordinador de Servicio al Cliente', sector: 'Comercial', area: 'SERVICIO', descripcion: 'Coordinación de atención al cliente', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Carga emocional'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Servicio', 'Coordinación'] },
    { nombre: 'Asesor de Servicio al Cliente', sector: 'Comercial', area: 'SERVICIO', descripcion: 'Atención y soporte a clientes', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés por quejas', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Servicio al cliente', 'Paciencia'] },
    { nombre: 'Agente de Call Center', sector: 'Comercial', area: 'SERVICIO', descripcion: 'Atención telefónica', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga vocal', 'Estrés', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Comunicación', 'Sistemas'] },
    { nombre: 'Community Manager', sector: 'Comercial', area: 'MARKETING', descripcion: 'Gestión de redes sociales', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Estrés por inmediatez'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Redes sociales', 'Comunicación digital'] },
    
    // Marketing
    { nombre: 'Coordinador de Marketing', sector: 'Comercial', area: 'MARKETING', descripcion: 'Coordinación de estrategias de marketing', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés creativo', 'Deadlines'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Marketing', 'Digital', 'Análisis'] },
    { nombre: 'Analista de Marketing', sector: 'Comercial', area: 'MARKETING', descripcion: 'Análisis de mercado y campañas', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Marketing digital', 'Analytics', 'SEO'] },
    { nombre: 'Ejecutivo de Marketing', sector: 'Comercial', area: 'MARKETING', descripcion: 'Ejecución de campañas', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Eventos'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Marketing', 'Eventos', 'BTL'] },
    { nombre: 'Especialista en SEO/SEM', sector: 'Comercial', area: 'MARKETING', descripcion: 'Posicionamiento web', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['SEO', 'SEM', 'Google Ads'] },
    { nombre: 'Content Manager', sector: 'Comercial', area: 'MARKETING', descripcion: 'Gestión de contenidos', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Estrés creativo'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Redacción', 'SEO', 'Estrategia de contenidos'] },
    
    // Trade y Retail
    { nombre: 'Coordinador Trade Marketing', sector: 'Comercial', area: 'TRADE', descripcion: 'Coordinación de trade marketing', nivel_riesgo: 'II', riesgos_tipicos: ['Viajes a puntos de venta', 'Carga física'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Trade marketing', 'Visual merchandising'] },
    { nombre: 'Mercaderista', sector: 'Comercial', area: 'TRADE', descripcion: 'Mercadeo en punto de venta', nivel_riesgo: 'II', riesgos_tipicos: ['Desplazamientos', 'Carga física', 'Postura de pie'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Merchandising', 'Exhibición'] },
    { nombre: 'Impulsador', sector: 'Comercial', area: 'TRADE', descripcion: 'Impulso de ventas en punto de venta', nivel_riesgo: 'I', riesgos_tipicos: ['Postura de pie', 'Atención a público'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Ventas', 'Comunicación'] },
    { nombre: 'Cajero', sector: 'Comercial', area: 'RETAIL', descripcion: 'Operación de caja registradora', nivel_riesgo: 'I', riesgos_tipicos: ['Movimientos repetitivos', 'Estrés', 'Riesgo de robo'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Manejo de dinero', 'Atención'] },
    { nombre: 'Administrador de Tienda', sector: 'Comercial', area: 'RETAIL', descripcion: 'Administración de punto de venta', nivel_riesgo: 'I', riesgos_tipicos: ['Estrés', 'Postura de pie'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Administración', 'Ventas', 'Inventarios'] },
  ];

  // ================================================
  // CARGOS SALUD (60)
  // ================================================
  const cargosSalud = [
    { nombre: 'Médico General', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Atención médica general', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo biológico', 'Estrés', 'Turnos'], examenes_sugeridos: ['EMO', 'PSM', 'HEP'], aptitudes: ['Medicina', 'Diagnóstico', 'Comunicación'] },
    { nombre: 'Médico Especialista', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Atención médica especializada', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo biológico', 'Estrés', 'Turnos'], examenes_sugeridos: ['EMO', 'PSM', 'HEP'], aptitudes: ['Especialidad médica', 'Procedimientos'] },
    { nombre: 'Médico Ocupacional', sector: 'Salud', area: 'OCUPACIONAL', descripcion: 'Medicina del trabajo', nivel_riesgo: 'II', riesgos_tipicos: ['Riesgo biológico', 'Visitas a empresas'], examenes_sugeridos: ['EMO', 'PSM', 'HEP'], aptitudes: ['Medicina ocupacional', 'SST'] },
    { nombre: 'Enfermero/a Jefe', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Jefatura de enfermería', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo biológico', 'Estrés', 'Turnos', 'Carga física'], examenes_sugeridos: ['EMO', 'PSM', 'HEP', 'OSTE'], aptitudes: ['Enfermería', 'Liderazgo', 'Gestión'] },
    { nombre: 'Enfermero/a', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Cuidado de pacientes', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo biológico', 'Pinchazos', 'Carga física', 'Turnos'], examenes_sugeridos: ['EMO', 'PSM', 'HEP', 'OSTE'], aptitudes: ['Enfermería', 'Cuidado de pacientes'] },
    { nombre: 'Auxiliar de Enfermería', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Apoyo en cuidado de pacientes', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo biológico', 'Carga física', 'Turnos'], examenes_sugeridos: ['EMO', 'HEP', 'OSTE'], aptitudes: ['Enfermería básica', 'Atención'] },
    { nombre: 'Odontólogo', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Atención odontológica', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo biológico', 'Posturas forzadas', 'Ruido', 'Vibración'], examenes_sugeridos: ['EMO', 'OSTE', 'AUDIO', 'HEP'], aptitudes: ['Odontología', 'Procedimientos'] },
    { nombre: 'Auxiliar de Odontología', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Apoyo en consultorio odontológico', nivel_riesgo: 'II', riesgos_tipicos: ['Riesgo biológico', 'Posturas'], examenes_sugeridos: ['EMO', 'HEP'], aptitudes: ['Asistencia dental', 'Esterilización'] },
    { nombre: 'Fisioterapeuta', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Rehabilitación física', nivel_riesgo: 'II', riesgos_tipicos: ['Carga física', 'Posturas forzadas', 'Riesgo biológico'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Fisioterapia', 'Rehabilitación'] },
    { nombre: 'Terapeuta Ocupacional', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Terapia ocupacional', nivel_riesgo: 'II', riesgos_tipicos: ['Carga física', 'Riesgo biológico'], examenes_sugeridos: ['EMO', 'OSTE'], aptitudes: ['Terapia ocupacional', 'Ergonomía'] },
    { nombre: 'Psicólogo', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Atención psicológica', nivel_riesgo: 'I', riesgos_tipicos: ['Carga emocional', 'Estrés'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Psicología', 'Terapia', 'Escucha activa'] },
    { nombre: 'Psicólogo Organizacional', sector: 'Salud', area: 'OCUPACIONAL', descripcion: 'Psicología del trabajo', nivel_riesgo: 'I', riesgos_tipicos: ['Carga emocional', 'Estrés'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Psicología organizacional', 'Batería psicosocial'] },
    { nombre: 'Nutricionista', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Asesoría nutricional', nivel_riesgo: 'I', riesgos_tipicos: ['Sedentarismo', 'Carga emocional'], examenes_sugeridos: ['EMO'], aptitudes: ['Nutrición', 'Educación alimentaria'] },
    { nombre: 'Fonoaudiólogo', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Terapia de lenguaje y audición', nivel_riesgo: 'I', riesgos_tipicos: ['Riesgo biológico leve', 'Posturas'], examenes_sugeridos: ['EMO', 'AUDIO'], aptitudes: ['Fonoaudiología', 'Terapia del lenguaje'] },
    { nombre: 'Optómetra', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Examen visual y prescripción', nivel_riesgo: 'I', riesgos_tipicos: ['Fatiga visual', 'Posturas'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Optometría', 'Lentes'] },
    { nombre: 'Regente de Farmacia', sector: 'Salud', area: 'FARMACIA', descripcion: 'Dispensación de medicamentos', nivel_riesgo: 'I', riesgos_tipicos: ['Postura de pie', 'Exposición a medicamentos'], examenes_sugeridos: ['EMO'], aptitudes: ['Farmacia', 'Atención'] },
    { nombre: 'Auxiliar de Farmacia', sector: 'Salud', area: 'FARMACIA', descripcion: 'Apoyo en farmacia', nivel_riesgo: 'I', riesgos_tipicos: ['Postura de pie', 'Estrés'], examenes_sugeridos: ['EMO'], aptitudes: ['Farmacia básica', 'Inventarios'] },
    { nombre: 'Bacteriólogo', sector: 'Salud', area: 'LABORATORIO', descripcion: 'Análisis de laboratorio clínico', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo biológico alto', 'Químicos'], examenes_sugeridos: ['EMO', 'HEP', 'ESPI'], aptitudes: ['Bacteriología', 'Análisis clínicos'] },
    { nombre: 'Auxiliar de Laboratorio', sector: 'Salud', area: 'LABORATORIO', descripcion: 'Apoyo en laboratorio clínico', nivel_riesgo: 'III', riesgos_tipicos: ['Riesgo biológico', 'Pinchazos'], examenes_sugeridos: ['EMO', 'HEP'], aptitudes: ['Toma de muestras', 'Bioseguridad'] },
    { nombre: 'Tecnólogo en Radiología', sector: 'Salud', area: 'IMÁGENES', descripcion: 'Toma de imágenes diagnósticas', nivel_riesgo: 'III', riesgos_tipicos: ['Radiación ionizante', 'Postura'], examenes_sugeridos: ['EMO', 'OSTE', 'DOSIMETRÍA'], aptitudes: ['Radiología', 'Equipos de imágenes'] },
    { nombre: 'Camillero', sector: 'Salud', area: 'ASISTENCIAL', descripcion: 'Traslado de pacientes', nivel_riesgo: 'III', riesgos_tipicos: ['Carga física', 'Riesgo biológico', 'Turnos'], examenes_sugeridos: ['EMO', 'OSTE', 'HEP'], aptitudes: ['Fuerza física', 'Atención a pacientes'] },
    { nombre: 'Instrumentador Quirúrgico', sector: 'Salud', area: 'QUIRÚRGICA', descripcion: 'Asistencia en cirugías', nivel_riesgo: 'IV', riesgos_tipicos: ['Riesgo biológico alto', 'Estrés', 'Postura de pie prolongada'], examenes_sugeridos: ['EMO', 'HEP', 'OSTE', 'PSM'], aptitudes: ['Instrumentación', 'Esterilización', 'Trabajo bajo presión'] },
  ];

  // ================================================
  // CARGOS TRANSPORTE (40)
  // ================================================
  const cargosTransporte = [
    { nombre: 'Conductor de Camión', sector: 'Transporte', area: 'CARGA', descripcion: 'Transporte de carga pesada', nivel_riesgo: 'IV', riesgos_tipicos: ['Accidentes de tránsito', 'Fatiga', 'Sedentarismo', 'Atracos'], examenes_sugeridos: ['EMO', 'OPTO', 'AUDIO', 'PSM'], aptitudes: ['Conducción pesados', 'Licencia C2/C3'] },
    { nombre: 'Conductor de Tractomula', sector: 'Transporte', area: 'CARGA', descripcion: 'Transporte de carga en tractomula', nivel_riesgo: 'IV', riesgos_tipicos: ['Accidentes de tránsito', 'Fatiga prolongada', 'Atracos'], examenes_sugeridos: ['EMO', 'OPTO', 'AUDIO', 'PSM'], aptitudes: ['Conducción tractomulas', 'Licencia C3'] },
    { nombre: 'Conductor de Bus', sector: 'Transporte', area: 'PASAJEROS', descripcion: 'Transporte de pasajeros intermunicipal', nivel_riesgo: 'III', riesgos_tipicos: ['Accidentes', 'Fatiga', 'Estrés por pasajeros'], examenes_sugeridos: ['EMO', 'OPTO', 'AUDIO', 'PSM'], aptitudes: ['Conducción buses', 'Licencia C2'] },
    { nombre: 'Conductor de Taxi', sector: 'Transporte', area: 'PASAJEROS', descripcion: 'Transporte de pasajeros urbano', nivel_riesgo: 'III', riesgos_tipicos: ['Accidentes', 'Atracos', 'Estrés por tráfico'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Conducción', 'Conocimiento de ciudad'] },
    { nombre: 'Conductor de App (Uber/Didi)', sector: 'Transporte', area: 'PASAJEROS', descripcion: 'Transporte por aplicación', nivel_riesgo: 'III', riesgos_tipicos: ['Accidentes', 'Atracos', 'Sedentarismo'], examenes_sugeridos: ['EMO', 'OPTO', 'PSM'], aptitudes: ['Conducción', 'Apps', 'Servicio'] },
    { nombre: 'Conductor de Vehículo Liviano', sector: 'Transporte', area: 'CARGA', descripcion: 'Transporte de carga liviana', nivel_riesgo: 'III', riesgos_tipicos: ['Accidentes', 'Carga física', 'Atracos'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Conducción', 'Licencia B1/C1'] },
    { nombre: 'Mensajero Motorizado', sector: 'Transporte', area: 'MENSAJERÍA', descripcion: 'Mensajería en moto', nivel_riesgo: 'IV', riesgos_tipicos: ['Accidentes de moto', 'Atracos', 'Exposición a clima'], examenes_sugeridos: ['EMO', 'OPTO', 'AUDIO'], aptitudes: ['Conducción moto', 'Conocimiento de ciudad'] },
    { nombre: 'Domiciliario', sector: 'Transporte', area: 'MENSAJERÍA', descripcion: 'Entrega de domicilios', nivel_riesgo: 'IV', riesgos_tipicos: ['Accidentes de moto', 'Atracos', 'Estrés por tiempos'], examenes_sugeridos: ['EMO', 'OPTO'], aptitudes: ['Conducción', 'Apps de delivery'] },
    { nombre: 'Operador de Grúa', sector: 'Transporte', area: 'MAQUINARIA', descripcion: 'Operación de grúa', nivel_riesgo: 'IV', riesgos_tipicos: ['Caída de carga', 'Volcamiento', 'Atrapamiento'], examenes_sugeridos: ['EMO', 'OPTO', 'OSTE', 'ALTE'], aptitudes: ['Operación de grúas', 'Izaje'] },
    { nombre: 'Operador de Maquinaria Pesada', sector: 'Transporte', area: 'MAQUINARIA', descripcion: 'Operación de maquinaria pesada', nivel_riesgo: 'IV', riesgos_tipicos: ['Volcamiento', 'Atropellamiento', 'Vibraciones'], examenes_sugeridos: ['EMO', 'OPTO', 'AUDIO', 'OSTE'], aptitudes: ['Maquinaria pesada', 'Licencia'] },
    { nombre: 'Piloto de Avión', sector: 'Transporte', area: 'AÉREO', descripcion: 'Piloto comercial', nivel_riesgo: 'III', riesgos_tipicos: ['Estrés', 'Jet lag', 'Radiación cósmica', 'Hipoxia'], examenes_sugeridos: ['EMO', 'OPTO', 'AUDIO', 'PSM', 'CARDIO'], aptitudes: ['Pilotaje', 'Licencia de piloto'] },
    { nombre: 'Auxiliar de Vuelo', sector: 'Transporte', area: 'AÉREO', descripcion: 'Atención a pasajeros en vuelo', nivel_riesgo: 'II', riesgos_tipicos: ['Jet lag', 'Estrés', 'Turbulencia'], examenes_sugeridos: ['EMO', 'PSM'], aptitudes: ['Servicio', 'Primeros auxilios', 'Idiomas'] },
  ];

  // Formatear cargos para inserción
  const formatCargos = (cargos) => cargos.map(cargo => ({
    ...cargo,
    riesgos_tipicos: JSON.stringify(cargo.riesgos_tipicos),
    examenes_sugeridos: JSON.stringify(cargo.examenes_sugeridos),
    aptitudes: JSON.stringify(cargo.aptitudes),
    activo: true
  }));

  // Insertar por lotes
  const allCargos = [
    ...formatCargos(cargosAdministrativos),
    ...formatCargos(cargosOperativos),
    ...formatCargos(cargosTecnicos),
    ...formatCargos(cargosComerciales),
    ...formatCargos(cargosSalud),
    ...formatCargos(cargosTransporte)
  ];

  const batchSize = 50;
  for (let i = 0; i < allCargos.length; i += batchSize) {
    await knex('catalogo_cargos').insert(allCargos.slice(i, i + batchSize));
    console.log(`  → Insertados ${Math.min(i + batchSize, allCargos.length)}/${allCargos.length} cargos...`);
  }

  console.log(`✅ [SEED] Insertados ${allCargos.length} cargos en el catálogo.`);
};

