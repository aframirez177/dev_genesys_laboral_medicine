/**
 * Seed: Actividades Económicas (50+ sectores)
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Catálogo de actividades económicas con códigos CIIU
 * y riesgos comunes asociados a cada sector.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('🏭 [SEED] Insertando actividades económicas...');

  // Verificar si la tabla existe
  const tableExists = await knex.schema.hasTable('actividades_economicas');
  if (!tableExists) {
    console.log('⚠️  Tabla actividades_economicas no existe. Ejecute primero la migración.');
    return;
  }

  // Limpiar tabla
  await knex('actividades_economicas').del();

  const actividades = [
    // ========================================
    // TECNOLOGÍA Y SOFTWARE (10)
    // ========================================
    {
      nombre: 'Desarrollo de Software y Aplicaciones',
      ciiu_code: '6201',
      sector: 'Tecnología',
      descripcion: 'Desarrollo de software, aplicaciones web, móviles, sistemas empresariales y videojuegos',
      riesgos_comunes: JSON.stringify([
        'Trastornos musculoesqueléticos por postura prolongada',
        'Síndrome visual informático (fatiga visual)',
        'Estrés laboral por deadlines',
        'Sedentarismo',
        'Síndrome del túnel carpiano'
      ])
    },
    {
      nombre: 'Consultoría en Tecnología de la Información',
      ciiu_code: '6202',
      sector: 'Tecnología',
      descripcion: 'Asesoría en TI, arquitectura de sistemas, transformación digital, ciberseguridad',
      riesgos_comunes: JSON.stringify([
        'Estrés laboral',
        'Fatiga mental por análisis complejo',
        'Exposición prolongada a pantallas',
        'Viajes frecuentes'
      ])
    },
    {
      nombre: 'Data Centers y Hosting',
      ciiu_code: '6311',
      sector: 'Tecnología',
      descripcion: 'Centros de datos, servicios de hosting, cloud computing, infraestructura TI',
      riesgos_comunes: JSON.stringify([
        'Ruido de equipos',
        'Exposición a campos electromagnéticos',
        'Riesgo eléctrico en racks',
        'Temperaturas extremas en salas de servidores'
      ])
    },
    {
      nombre: 'Telecomunicaciones',
      ciiu_code: '6110',
      sector: 'Tecnología',
      descripcion: 'Servicios de telecomunicaciones, redes, fibra óptica, comunicaciones móviles',
      riesgos_comunes: JSON.stringify([
        'Trabajo en alturas (antenas)',
        'Radiación no ionizante',
        'Riesgo eléctrico',
        'Exposición a condiciones climáticas'
      ])
    },
    {
      nombre: 'E-commerce y Comercio Digital',
      ciiu_code: '4791',
      sector: 'Tecnología',
      descripcion: 'Comercio electrónico, marketplaces, plataformas de venta online',
      riesgos_comunes: JSON.stringify([
        'Estrés por atención al cliente',
        'Fatiga visual',
        'Sedentarismo',
        'Carga mental por múltiples tareas'
      ])
    },
    {
      nombre: 'Fintech y Servicios Financieros Digitales',
      ciiu_code: '6619',
      sector: 'Tecnología',
      descripcion: 'Tecnología financiera, pagos digitales, banca digital, criptomonedas',
      riesgos_comunes: JSON.stringify([
        'Estrés laboral alto',
        'Fatiga visual',
        'Carga mental por decisiones críticas',
        'Trabajo nocturno (monitoreo 24/7)'
      ])
    },
    {
      nombre: 'Inteligencia Artificial y Machine Learning',
      ciiu_code: '6201',
      sector: 'Tecnología',
      descripcion: 'Desarrollo de sistemas de IA, ML, procesamiento de lenguaje natural, visión artificial',
      riesgos_comunes: JSON.stringify([
        'Fatiga mental intensa',
        'Estrés por innovación constante',
        'Síndrome visual informático',
        'Sedentarismo'
      ])
    },
    {
      nombre: 'Ciberseguridad',
      ciiu_code: '6209',
      sector: 'Tecnología',
      descripcion: 'Seguridad informática, ethical hacking, protección de datos, respuesta a incidentes',
      riesgos_comunes: JSON.stringify([
        'Estrés por amenazas constantes',
        'Trabajo nocturno y turnos',
        'Fatiga mental',
        'Carga emocional por responsabilidad'
      ])
    },
    {
      nombre: 'Videojuegos y Entretenimiento Digital',
      ciiu_code: '5820',
      sector: 'Tecnología',
      descripcion: 'Desarrollo de videojuegos, realidad virtual, metaverso, entretenimiento interactivo',
      riesgos_comunes: JSON.stringify([
        'Estrés por crunch (horas extra intensivas)',
        'Fatiga visual',
        'Trastornos musculoesqueléticos',
        'Burnout'
      ])
    },
    {
      nombre: 'Internet de las Cosas (IoT)',
      ciiu_code: '2620',
      sector: 'Tecnología',
      descripcion: 'Dispositivos conectados, domótica, wearables, sensores industriales',
      riesgos_comunes: JSON.stringify([
        'Riesgo eléctrico (prototipos)',
        'Exposición a soldadura electrónica',
        'Fatiga visual',
        'Posturas inadecuadas'
      ])
    },

    // ========================================
    // SALUD (8)
    // ========================================
    {
      nombre: 'Hospitales y Clínicas',
      ciiu_code: '8610',
      sector: 'Salud',
      descripcion: 'Servicios hospitalarios, urgencias, cirugía, hospitalización',
      riesgos_comunes: JSON.stringify([
        'Riesgo biológico (fluidos corporales)',
        'Pinchazos y cortopunzantes',
        'Estrés laboral alto',
        'Turnos nocturnos y rotativos',
        'Exposición a radiación (rayos X)',
        'Carga emocional con pacientes'
      ])
    },
    {
      nombre: 'Consultorios Médicos',
      ciiu_code: '8621',
      sector: 'Salud',
      descripcion: 'Medicina general, especialidades médicas, pediatría, ginecología',
      riesgos_comunes: JSON.stringify([
        'Riesgo biológico',
        'Estrés por atención a pacientes',
        'Posturas prolongadas',
        'Exposición a enfermedades infectocontagiosas'
      ])
    },
    {
      nombre: 'Laboratorios Clínicos',
      ciiu_code: '8691',
      sector: 'Salud',
      descripcion: 'Análisis clínicos, diagnóstico por laboratorio, toma de muestras',
      riesgos_comunes: JSON.stringify([
        'Riesgo biológico alto',
        'Exposición a químicos (reactivos)',
        'Pinchazos',
        'Manejo de sustancias peligrosas'
      ])
    },
    {
      nombre: 'Odontología',
      ciiu_code: '8622',
      sector: 'Salud',
      descripcion: 'Servicios odontológicos, ortodoncia, cirugía oral, endodoncia',
      riesgos_comunes: JSON.stringify([
        'Riesgo biológico (aerosoles)',
        'Posturas forzadas prolongadas',
        'Ruido de equipos dentales',
        'Vibración por instrumental',
        'Exposición a rayos X'
      ])
    },
    {
      nombre: 'Farmacéutica',
      ciiu_code: '2100',
      sector: 'Salud',
      descripcion: 'Fabricación de medicamentos, investigación farmacéutica, control de calidad',
      riesgos_comunes: JSON.stringify([
        'Exposición a químicos',
        'Riesgo biológico (cultivos)',
        'Ambiente estéril (presión)',
        'Estrés por regulaciones'
      ])
    },
    {
      nombre: 'Droguerías y Farmacias',
      ciiu_code: '4773',
      sector: 'Salud',
      descripcion: 'Dispensación de medicamentos, atención farmacéutica',
      riesgos_comunes: JSON.stringify([
        'Postura de pie prolongada',
        'Atención a público (estrés)',
        'Manejo de medicamentos controlados',
        'Riesgo de robo'
      ])
    },
    {
      nombre: 'Centros de Rehabilitación',
      ciiu_code: '8690',
      sector: 'Salud',
      descripcion: 'Fisioterapia, rehabilitación física, terapia ocupacional',
      riesgos_comunes: JSON.stringify([
        'Carga física por manipulación de pacientes',
        'Posturas forzadas',
        'Estrés emocional',
        'Riesgo biológico'
      ])
    },
    {
      nombre: 'Servicios de Ambulancia y Emergencias',
      ciiu_code: '8690',
      sector: 'Salud',
      descripcion: 'Transporte de pacientes, atención prehospitalaria, emergencias médicas',
      riesgos_comunes: JSON.stringify([
        'Estrés por situaciones críticas',
        'Riesgo biológico',
        'Accidentes de tránsito',
        'Carga física por traslado de pacientes',
        'Trabajo nocturno'
      ])
    },

    // ========================================
    // CONSTRUCCIÓN (7)
    // ========================================
    {
      nombre: 'Construcción de Edificios',
      ciiu_code: '4111',
      sector: 'Construcción',
      descripcion: 'Construcción residencial y comercial, edificios de apartamentos, oficinas',
      riesgos_comunes: JSON.stringify([
        'Caídas de altura',
        'Golpes por objetos',
        'Atrapamiento por maquinaria',
        'Exposición a ruido',
        'Exposición a polvo y partículas',
        'Riesgo eléctrico'
      ])
    },
    {
      nombre: 'Obras Civiles e Infraestructura',
      ciiu_code: '4210',
      sector: 'Construcción',
      descripcion: 'Carreteras, puentes, túneles, obras públicas',
      riesgos_comunes: JSON.stringify([
        'Atropellamiento por vehículos',
        'Caídas a distinto nivel',
        'Exposición a condiciones climáticas',
        'Ruido de maquinaria pesada',
        'Vibración de equipos'
      ])
    },
    {
      nombre: 'Instalaciones Eléctricas',
      ciiu_code: '4321',
      sector: 'Construcción',
      descripcion: 'Instalación eléctrica residencial, comercial e industrial',
      riesgos_comunes: JSON.stringify([
        'Riesgo eléctrico (electrocución)',
        'Trabajo en alturas',
        'Caídas',
        'Quemaduras por arco eléctrico'
      ])
    },
    {
      nombre: 'Instalaciones Hidráulicas y Sanitarias',
      ciiu_code: '4322',
      sector: 'Construcción',
      descripcion: 'Plomería, instalación de redes de agua, gas y alcantarillado',
      riesgos_comunes: JSON.stringify([
        'Espacios confinados',
        'Exposición a aguas residuales',
        'Posturas forzadas',
        'Riesgo biológico'
      ])
    },
    {
      nombre: 'Acabados y Terminaciones',
      ciiu_code: '4330',
      sector: 'Construcción',
      descripcion: 'Pintura, enchapes, pisos, carpintería, drywall',
      riesgos_comunes: JSON.stringify([
        'Exposición a químicos (pinturas, solventes)',
        'Posturas forzadas',
        'Caídas de altura (andamios)',
        'Cortes por herramientas'
      ])
    },
    {
      nombre: 'Demolición y Movimiento de Tierras',
      ciiu_code: '4312',
      sector: 'Construcción',
      descripcion: 'Demolición de estructuras, excavaciones, preparación de terrenos',
      riesgos_comunes: JSON.stringify([
        'Derrumbes',
        'Atrapamiento',
        'Ruido extremo',
        'Polvo y partículas',
        'Vibración de equipos'
      ])
    },
    {
      nombre: 'Soldadura y Estructuras Metálicas',
      ciiu_code: '2511',
      sector: 'Construcción',
      descripcion: 'Fabricación de estructuras metálicas, soldadura industrial',
      riesgos_comunes: JSON.stringify([
        'Radiación UV por soldadura',
        'Humos metálicos',
        'Quemaduras',
        'Riesgo eléctrico',
        'Cortes por material'
      ])
    },

    // ========================================
    // MANUFACTURA E INDUSTRIA (8)
    // ========================================
    {
      nombre: 'Fabricación de Alimentos',
      ciiu_code: '1010',
      sector: 'Manufactura',
      descripcion: 'Procesamiento de alimentos, empaques, conservas, lácteos, cárnicos',
      riesgos_comunes: JSON.stringify([
        'Exposición a frío (cuartos fríos)',
        'Cortes por cuchillos y maquinaria',
        'Caídas por pisos húmedos',
        'Ruido de maquinaria',
        'Riesgo biológico (materias primas)'
      ])
    },
    {
      nombre: 'Fabricación de Productos Químicos',
      ciiu_code: '2011',
      sector: 'Manufactura',
      descripcion: 'Productos químicos industriales, fertilizantes, pesticidas',
      riesgos_comunes: JSON.stringify([
        'Exposición a sustancias químicas',
        'Riesgo de explosión e incendio',
        'Quemaduras químicas',
        'Intoxicación por vapores'
      ])
    },
    {
      nombre: 'Fabricación de Plásticos',
      ciiu_code: '2220',
      sector: 'Manufactura',
      descripcion: 'Productos plásticos, envases, empaques, inyección de plástico',
      riesgos_comunes: JSON.stringify([
        'Exposición a vapores de polímeros',
        'Quemaduras por material caliente',
        'Ruido de maquinaria',
        'Atrapamiento en máquinas'
      ])
    },
    {
      nombre: 'Fabricación Textil y Confecciones',
      ciiu_code: '1311',
      sector: 'Manufactura',
      descripcion: 'Telas, prendas de vestir, confección, acabados textiles',
      riesgos_comunes: JSON.stringify([
        'Ruido de máquinas de coser',
        'Partículas de fibras textiles',
        'Posturas repetitivas',
        'Iluminación inadecuada'
      ])
    },
    {
      nombre: 'Fabricación de Muebles',
      ciiu_code: '3100',
      sector: 'Manufactura',
      descripcion: 'Muebles de madera, metálicos, tapizados',
      riesgos_comunes: JSON.stringify([
        'Polvo de madera',
        'Cortes por herramientas',
        'Ruido de maquinaria',
        'Exposición a barnices y pegamentos'
      ])
    },
    {
      nombre: 'Metalmecánica',
      ciiu_code: '2599',
      sector: 'Manufactura',
      descripcion: 'Fabricación de piezas metálicas, tornería, fresado, mecanizado',
      riesgos_comunes: JSON.stringify([
        'Proyección de partículas',
        'Cortes por material',
        'Ruido intenso',
        'Vibración de herramientas',
        'Atrapamiento en tornos'
      ])
    },
    {
      nombre: 'Fabricación de Productos de Aseo',
      ciiu_code: '2023',
      sector: 'Manufactura',
      descripcion: 'Jabones, detergentes, productos de limpieza, cosméticos',
      riesgos_comunes: JSON.stringify([
        'Exposición a químicos',
        'Dermatitis de contacto',
        'Vapores irritantes',
        'Polvos en suspensión'
      ])
    },
    {
      nombre: 'Industria Automotriz',
      ciiu_code: '2910',
      sector: 'Manufactura',
      descripcion: 'Fabricación y ensamble de vehículos, autopartes',
      riesgos_comunes: JSON.stringify([
        'Ruido industrial',
        'Exposición a humos de soldadura',
        'Posturas forzadas en línea de ensamble',
        'Riesgo de atrapamiento'
      ])
    },

    // ========================================
    // COMERCIO Y RETAIL (6)
    // ========================================
    {
      nombre: 'Supermercados y Grandes Superficies',
      ciiu_code: '4711',
      sector: 'Comercio',
      descripcion: 'Venta al por menor en supermercados, hipermercados, tiendas por departamento',
      riesgos_comunes: JSON.stringify([
        'Carga física por manipulación de productos',
        'Postura de pie prolongada',
        'Atención al público (estrés)',
        'Exposición a frío en secciones refrigeradas'
      ])
    },
    {
      nombre: 'Comercio de Vehículos',
      ciiu_code: '4511',
      sector: 'Comercio',
      descripcion: 'Concesionarios, venta de automóviles, motocicletas',
      riesgos_comunes: JSON.stringify([
        'Atropellamiento en patio de vehículos',
        'Estrés por metas de ventas',
        'Posturas de pie prolongadas'
      ])
    },
    {
      nombre: 'Ferreterías y Materiales de Construcción',
      ciiu_code: '4752',
      sector: 'Comercio',
      descripcion: 'Venta de materiales, herramientas, acabados para construcción',
      riesgos_comunes: JSON.stringify([
        'Carga física por levantamiento de materiales',
        'Caídas de objetos almacenados',
        'Cortes por materiales',
        'Polvo de materiales'
      ])
    },
    {
      nombre: 'Tiendas de Ropa y Accesorios',
      ciiu_code: '4771',
      sector: 'Comercio',
      descripcion: 'Retail de moda, calzado, accesorios',
      riesgos_comunes: JSON.stringify([
        'Postura de pie prolongada',
        'Estrés por atención al cliente',
        'Carga mental en temporadas altas'
      ])
    },
    {
      nombre: 'Comercio al por Mayor',
      ciiu_code: '4690',
      sector: 'Comercio',
      descripcion: 'Distribución mayorista, importación, comercio B2B',
      riesgos_comunes: JSON.stringify([
        'Carga física en bodegas',
        'Atropellamiento por montacargas',
        'Caídas de estanterías',
        'Estrés por negociaciones'
      ])
    },
    {
      nombre: 'Restaurantes y Servicios de Comida',
      ciiu_code: '5611',
      sector: 'Comercio',
      descripcion: 'Restaurantes, comidas rápidas, catering, food trucks',
      riesgos_comunes: JSON.stringify([
        'Quemaduras por cocina',
        'Cortes por cuchillos',
        'Caídas por pisos húmedos',
        'Exposición a calor',
        'Estrés por ritmo acelerado'
      ])
    },

    // ========================================
    // SERVICIOS PROFESIONALES (6)
    // ========================================
    {
      nombre: 'Servicios Legales',
      ciiu_code: '6910',
      sector: 'Servicios',
      descripcion: 'Abogados, notarías, asesoría jurídica, representación legal',
      riesgos_comunes: JSON.stringify([
        'Estrés laboral alto',
        'Sedentarismo',
        'Fatiga visual por lectura prolongada',
        'Carga emocional por casos sensibles'
      ])
    },
    {
      nombre: 'Servicios Contables y Auditoría',
      ciiu_code: '6920',
      sector: 'Servicios',
      descripcion: 'Contabilidad, auditoría, revisoría fiscal, impuestos',
      riesgos_comunes: JSON.stringify([
        'Estrés por fechas límite',
        'Fatiga visual',
        'Sedentarismo',
        'Posturas inadecuadas'
      ])
    },
    {
      nombre: 'Arquitectura e Ingeniería',
      ciiu_code: '7110',
      sector: 'Servicios',
      descripcion: 'Diseño arquitectónico, ingeniería civil, diseño industrial',
      riesgos_comunes: JSON.stringify([
        'Fatiga visual por software CAD',
        'Estrés por proyectos',
        'Visitas a obra (riesgos de construcción)',
        'Sedentarismo en oficina'
      ])
    },
    {
      nombre: 'Publicidad y Marketing',
      ciiu_code: '7310',
      sector: 'Servicios',
      descripcion: 'Agencias de publicidad, marketing digital, branding',
      riesgos_comunes: JSON.stringify([
        'Estrés por creatividad bajo presión',
        'Fatiga visual',
        'Horarios extendidos',
        'Sedentarismo'
      ])
    },
    {
      nombre: 'Consultoría Empresarial',
      ciiu_code: '7020',
      sector: 'Servicios',
      descripcion: 'Consultoría gerencial, estrategia, gestión del cambio',
      riesgos_comunes: JSON.stringify([
        'Viajes frecuentes',
        'Estrés por resultados',
        'Horarios extendidos',
        'Fatiga por presentaciones'
      ])
    },
    {
      nombre: 'Servicios de Recursos Humanos',
      ciiu_code: '7820',
      sector: 'Servicios',
      descripcion: 'Reclutamiento, selección, outsourcing de personal, nómina',
      riesgos_comunes: JSON.stringify([
        'Estrés por manejo de conflictos',
        'Carga emocional (despidos)',
        'Sedentarismo',
        'Fatiga por entrevistas múltiples'
      ])
    },

    // ========================================
    // LOGÍSTICA Y TRANSPORTE (5)
    // ========================================
    {
      nombre: 'Transporte de Carga por Carretera',
      ciiu_code: '4923',
      sector: 'Logística',
      descripcion: 'Transporte de mercancías, camiones, tractomulas',
      riesgos_comunes: JSON.stringify([
        'Accidentes de tránsito',
        'Fatiga por conducción prolongada',
        'Sedentarismo',
        'Problemas de columna (vibraciones)',
        'Atracos'
      ])
    },
    {
      nombre: 'Transporte de Pasajeros',
      ciiu_code: '4921',
      sector: 'Logística',
      descripcion: 'Buses, taxis, servicios de transporte urbano e intermunicipal',
      riesgos_comunes: JSON.stringify([
        'Accidentes de tránsito',
        'Estrés por tráfico',
        'Sedentarismo',
        'Exposición a contaminación',
        'Riesgo de atracos'
      ])
    },
    {
      nombre: 'Almacenamiento y Bodegas',
      ciiu_code: '5210',
      sector: 'Logística',
      descripcion: 'Almacenamiento, centros de distribución, operación logística',
      riesgos_comunes: JSON.stringify([
        'Atropellamiento por montacargas',
        'Caídas de estanterías',
        'Carga física por manipulación de mercancía',
        'Posturas forzadas'
      ])
    },
    {
      nombre: 'Mensajería y Paquetería',
      ciiu_code: '5320',
      sector: 'Logística',
      descripcion: 'Courier, entrega de paquetes, última milla',
      riesgos_comunes: JSON.stringify([
        'Accidentes de tránsito (moto)',
        'Atracos',
        'Carga física por paquetes',
        'Exposición a condiciones climáticas'
      ])
    },
    {
      nombre: 'Operadores Portuarios y Aduaneros',
      ciiu_code: '5224',
      sector: 'Logística',
      descripcion: 'Operación de carga en puertos, agenciamiento aduanero',
      riesgos_comunes: JSON.stringify([
        'Atropellamiento por maquinaria portuaria',
        'Caídas en muelles',
        'Golpes por contenedores',
        'Exposición a condiciones climáticas'
      ])
    },

    // ========================================
    // EDUCACIÓN (4)
    // ========================================
    {
      nombre: 'Educación Básica y Media',
      ciiu_code: '8521',
      sector: 'Educación',
      descripcion: 'Colegios, escuelas, educación primaria y secundaria',
      riesgos_comunes: JSON.stringify([
        'Estrés por manejo de estudiantes',
        'Disfonía por uso de la voz',
        'Posturas de pie prolongadas',
        'Riesgo biológico (niños enfermos)'
      ])
    },
    {
      nombre: 'Educación Superior',
      ciiu_code: '8530',
      sector: 'Educación',
      descripcion: 'Universidades, institutos técnicos, educación profesional',
      riesgos_comunes: JSON.stringify([
        'Estrés por carga académica',
        'Disfonía',
        'Sedentarismo',
        'Fatiga mental por investigación'
      ])
    },
    {
      nombre: 'Capacitación Empresarial',
      ciiu_code: '8559',
      sector: 'Educación',
      descripcion: 'Formación corporativa, coaching, entrenamiento especializado',
      riesgos_comunes: JSON.stringify([
        'Estrés por presentaciones',
        'Viajes frecuentes',
        'Disfonía',
        'Fatiga por múltiples sesiones'
      ])
    },
    {
      nombre: 'Educación Virtual y E-Learning',
      ciiu_code: '8559',
      sector: 'Educación',
      descripcion: 'Plataformas educativas online, cursos virtuales, MOOCs',
      riesgos_comunes: JSON.stringify([
        'Fatiga visual',
        'Sedentarismo',
        'Síndrome del túnel carpiano',
        'Aislamiento social'
      ])
    },

    // ========================================
    // MINERÍA Y ENERGÍA (4)
    // ========================================
    {
      nombre: 'Minería de Carbón',
      ciiu_code: '0510',
      sector: 'Minería',
      descripcion: 'Extracción de carbón, minas subterráneas y a cielo abierto',
      riesgos_comunes: JSON.stringify([
        'Derrumbes',
        'Explosión por gases',
        'Neumoconiosis (polvo de carbón)',
        'Ruido extremo',
        'Vibraciones de maquinaria'
      ])
    },
    {
      nombre: 'Extracción de Petróleo y Gas',
      ciiu_code: '0610',
      sector: 'Minería',
      descripcion: 'Exploración y explotación petrolera, gas natural',
      riesgos_comunes: JSON.stringify([
        'Explosión e incendio',
        'Exposición a hidrocarburos',
        'Trabajo en alturas (torres)',
        'Zonas remotas',
        'Turnos extendidos'
      ])
    },
    {
      nombre: 'Energía Eléctrica',
      ciiu_code: '3511',
      sector: 'Energía',
      descripcion: 'Generación, transmisión y distribución de energía eléctrica',
      riesgos_comunes: JSON.stringify([
        'Riesgo eléctrico alto (alta tensión)',
        'Trabajo en alturas (líneas)',
        'Campos electromagnéticos',
        'Zonas remotas'
      ])
    },
    {
      nombre: 'Energías Renovables',
      ciiu_code: '3511',
      sector: 'Energía',
      descripcion: 'Energía solar, eólica, hidroeléctrica, biomasa',
      riesgos_comunes: JSON.stringify([
        'Trabajo en alturas (aerogeneradores)',
        'Riesgo eléctrico',
        'Exposición solar prolongada',
        'Zonas remotas'
      ])
    },

    // ========================================
    // OTROS SECTORES (4)
    // ========================================
    {
      nombre: 'Hotelería y Turismo',
      ciiu_code: '5510',
      sector: 'Turismo',
      descripcion: 'Hoteles, hostales, resorts, servicios turísticos',
      riesgos_comunes: JSON.stringify([
        'Posturas de pie prolongadas',
        'Turnos nocturnos',
        'Carga física (limpieza, equipaje)',
        'Estrés por atención al huésped'
      ])
    },
    {
      nombre: 'Agricultura y Agroindustria',
      ciiu_code: '0111',
      sector: 'Agro',
      descripcion: 'Cultivos, ganadería, procesamiento agrícola',
      riesgos_comunes: JSON.stringify([
        'Exposición a pesticidas',
        'Radiación solar',
        'Picaduras de animales',
        'Zoonosis',
        'Posturas forzadas',
        'Maquinaria agrícola'
      ])
    },
    {
      nombre: 'Servicios de Seguridad Privada',
      ciiu_code: '8010',
      sector: 'Seguridad',
      descripcion: 'Vigilancia, escoltas, monitoreo, transporte de valores',
      riesgos_comunes: JSON.stringify([
        'Riesgo de agresión física',
        'Estrés por alerta constante',
        'Turnos nocturnos',
        'Postura de pie prolongada',
        'Uso de armas de fuego'
      ])
    },
    {
      nombre: 'Servicios de Limpieza',
      ciiu_code: '8121',
      sector: 'Servicios',
      descripcion: 'Aseo general, limpieza industrial, mantenimiento de instalaciones',
      riesgos_comunes: JSON.stringify([
        'Exposición a químicos de limpieza',
        'Posturas forzadas',
        'Caídas por pisos húmedos',
        'Dermatitis de contacto'
      ])
    }
  ];

  // Insertar todas las actividades
  await knex('actividades_economicas').insert(actividades);

  console.log(`✅ [SEED] Insertadas ${actividades.length} actividades económicas.`);
};

