/**
 * Seed: Cargo Aliases (Sinónimos)
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Sinónimos y nombres alternativos para cargos.
 * Permite búsqueda fuzzy con múltiples variantes.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('🔤 [SEED] Insertando aliases de cargos...');

  const tableExists = await knex.schema.hasTable('cargo_aliases');
  if (!tableExists) {
    console.log('⚠️  Tabla cargo_aliases no existe. Ejecute primero la migración.');
    return;
  }

  await knex('cargo_aliases').del();

  // Obtener IDs de cargos existentes
  const cargos = await knex('catalogo_cargos').select('id', 'nombre');
  const cargoMap = {};
  cargos.forEach(c => { cargoMap[c.nombre.toLowerCase()] = c.id; });

  // Helper para encontrar cargo_id
  const findCargoId = (nombreCargo) => {
    const key = nombreCargo.toLowerCase();
    return cargoMap[key] || null;
  };

  // Definir aliases por cargo
  const aliasDefinitions = [
    // ADMINISTRATIVOS
    { cargo: 'Gerente General', aliases: ['CEO', 'Director General', 'Director Ejecutivo Principal', 'Chief Executive Officer'] },
    { cargo: 'Director Financiero', aliases: ['CFO', 'Chief Financial Officer', 'Vicepresidente Financiero'] },
    { cargo: 'Director de Recursos Humanos', aliases: ['CHRO', 'Director de Talento Humano', 'Director de Gestión Humana', 'VP de RRHH'] },
    { cargo: 'Director de Tecnología', aliases: ['CTO', 'Chief Technology Officer', 'Director de TI', 'Director de Sistemas'] },
    { cargo: 'Gerente de Proyectos', aliases: ['Project Manager', 'PM', 'Líder de Proyectos', 'Coordinador de Proyectos'] },
    { cargo: 'Coordinador Administrativo', aliases: ['Coord. Administrativo', 'Coordinador Admin'] },
    { cargo: 'Coordinador de Recursos Humanos', aliases: ['Coordinador de RRHH', 'Coord. Talento Humano', 'Coordinador de GH'] },
    { cargo: 'Jefe de Contabilidad', aliases: ['Contador Jefe', 'Líder Contable', 'Supervisor Contable'] },
    { cargo: 'Analista Financiero', aliases: ['Financial Analyst', 'Analista de Finanzas'] },
    { cargo: 'Analista Contable', aliases: ['Contador', 'Contador Junior', 'Analista de Contabilidad'] },
    { cargo: 'Analista de Datos', aliases: ['Data Analyst', 'Analista BI', 'Analista de Información'] },
    { cargo: 'Asistente Administrativo', aliases: ['Auxiliar Administrativo', 'Asistente Admin', 'Secretaria Administrativa', 'Asistente de Oficina'] },
    { cargo: 'Asistente de Gerencia', aliases: ['Secretaria Ejecutiva', 'Asistente Ejecutiva', 'Asistente de Dirección'] },
    { cargo: 'Auxiliar Administrativo', aliases: ['Aux. Administrativo', 'Auxiliar Admin', 'Auxiliar de Oficina'] },
    { cargo: 'Recepcionista', aliases: ['Recepción', 'Auxiliar de Recepción', 'Front Desk'] },
    { cargo: 'Abogado', aliases: ['Asesor Legal', 'Asesor Jurídico', 'Profesional Legal'] },
    { cargo: 'Coordinador de SST', aliases: ['Coordinador SGSST', 'Coordinador de Seguridad', 'Líder de SST', 'Coord. Salud Ocupacional'] },
    { cargo: 'Profesional de SST', aliases: ['Profesional HSEQ', 'Profesional de Seguridad', 'Ingeniero SST'] },

    // OPERATIVOS
    { cargo: 'Jefe de Producción', aliases: ['Líder de Producción', 'Supervisor General de Producción', 'Production Manager'] },
    { cargo: 'Supervisor de Producción', aliases: ['Supervisor de Línea', 'Líder de Línea', 'Encargado de Producción'] },
    { cargo: 'Operario de Producción', aliases: ['Operador de Producción', 'Obrero de Producción', 'Operario de Planta'] },
    { cargo: 'Operario de Máquinas', aliases: ['Maquinista', 'Operador de Maquinaria', 'Operador de Equipos'] },
    { cargo: 'Técnico de Mantenimiento', aliases: ['Técnico de Mtto', 'Mecánico de Mantenimiento', 'Técnico Industrial'] },
    { cargo: 'Técnico Electricista', aliases: ['Electricista Industrial', 'Técnico Eléctrico', 'Electricista de Planta'] },
    { cargo: 'Técnico Mecánico', aliases: ['Mecánico Industrial', 'Técnico en Mecánica', 'Mecánico de Planta'] },
    { cargo: 'Auxiliar de Bodega', aliases: ['Bodeguero', 'Auxiliar de Almacén', 'Almacenista', 'Auxiliar Logístico'] },
    { cargo: 'Operador de Montacargas', aliases: ['Montacarguista', 'Operador de Elevador', 'Forklift Operator'] },
    { cargo: 'Maestro de Obra', aliases: ['Maestro Constructor', 'Encargado de Obra', 'Jefe de Obra'] },
    { cargo: 'Oficial de Construcción', aliases: ['Oficial de Obra', 'Albañil Oficial', 'Constructor'] },
    { cargo: 'Ayudante de Construcción', aliases: ['Auxiliar de Construcción', 'Peón de Obra', 'Obrero de Construcción'] },
    { cargo: 'Soldador', aliases: ['Soldador Industrial', 'Welder', 'Soldador MIG/TIG'] },
    { cargo: 'Electricista', aliases: ['Electricista de Obra', 'Instalador Eléctrico', 'Técnico Electricista'] },
    { cargo: 'Plomero', aliases: ['Fontanero', 'Instalador Hidráulico', 'Técnico en Plomería'] },
    { cargo: 'Auxiliar de Servicios Generales', aliases: ['Aseador', 'Personal de Aseo', 'Auxiliar de Limpieza', 'Servicios Generales'] },
    { cargo: 'Vigilante', aliases: ['Guarda de Seguridad', 'Celador', 'Agente de Seguridad', 'Security'] },

    // TÉCNICOS - TECNOLOGÍA
    { cargo: 'Ingeniero de Software', aliases: ['Software Engineer', 'Desarrollador de Software', 'Programador', 'Ingeniero de Desarrollo'] },
    { cargo: 'Desarrollador Full Stack', aliases: ['Full Stack Developer', 'Desarrollador Web', 'Programador Full Stack'] },
    { cargo: 'Desarrollador Frontend', aliases: ['Frontend Developer', 'Desarrollador UI', 'Maquetador Web'] },
    { cargo: 'Desarrollador Backend', aliases: ['Backend Developer', 'Desarrollador Server Side', 'Programador Backend'] },
    { cargo: 'Desarrollador Mobile', aliases: ['Mobile Developer', 'Desarrollador de Apps', 'Programador Móvil'] },
    { cargo: 'Arquitecto de Software', aliases: ['Software Architect', 'Arquitecto de Sistemas', 'Solution Architect'] },
    { cargo: 'DevOps Engineer', aliases: ['Ingeniero DevOps', 'SRE', 'Site Reliability Engineer', 'Ingeniero de Infraestructura'] },
    { cargo: 'Analista de Sistemas', aliases: ['Systems Analyst', 'Analista Funcional', 'Analista de TI'] },
    { cargo: 'Administrador de Base de Datos', aliases: ['DBA', 'Database Administrator', 'Admin de BD'] },
    { cargo: 'Administrador de Redes', aliases: ['Network Administrator', 'Admin de Redes', 'Ingeniero de Redes'] },
    { cargo: 'Especialista en Ciberseguridad', aliases: ['Security Engineer', 'Analista de Seguridad', 'Ingeniero de Seguridad IT'] },
    { cargo: 'QA Engineer', aliases: ['Ingeniero QA', 'Tester', 'Analista de Calidad de Software', 'Quality Assurance'] },
    { cargo: 'Soporte Técnico', aliases: ['Help Desk', 'Mesa de Ayuda', 'Técnico de Soporte', 'IT Support'] },
    { cargo: 'Data Scientist', aliases: ['Científico de Datos', 'Data Analyst Senior', 'ML Engineer'] },
    { cargo: 'UX/UI Designer', aliases: ['Diseñador UX', 'Diseñador de Interfaces', 'UI Designer', 'Product Designer'] },

    // TÉCNICOS - INGENIERÍA
    { cargo: 'Ingeniero Civil', aliases: ['Civil Engineer', 'Ingeniero de Obras', 'Ingeniero Constructor'] },
    { cargo: 'Ingeniero Industrial', aliases: ['Industrial Engineer', 'Ingeniero de Procesos', 'Ingeniero de Producción'] },
    { cargo: 'Ingeniero Mecánico', aliases: ['Mechanical Engineer', 'Ingeniero de Mantenimiento'] },
    { cargo: 'Ingeniero Eléctrico', aliases: ['Electrical Engineer', 'Ingeniero Electricista'] },
    { cargo: 'Ingeniero Ambiental', aliases: ['Environmental Engineer', 'Ingeniero de Medio Ambiente'] },
    { cargo: 'Ingeniero de Calidad', aliases: ['Quality Engineer', 'Ingeniero QA/QC', 'Ingeniero de Aseguramiento'] },
    { cargo: 'Arquitecto', aliases: ['Architect', 'Arquitecto de Diseño', 'Diseñador Arquitectónico'] },
    { cargo: 'Diseñador Gráfico', aliases: ['Graphic Designer', 'Diseñador Visual', 'Diseñador Publicitario'] },

    // COMERCIALES
    { cargo: 'Director de Ventas', aliases: ['Sales Director', 'VP de Ventas', 'Gerente Nacional de Ventas'] },
    { cargo: 'Gerente de Ventas', aliases: ['Sales Manager', 'Líder de Ventas'] },
    { cargo: 'Asesor Comercial', aliases: ['Ejecutivo Comercial', 'Representante de Ventas', 'Vendedor', 'Sales Rep'] },
    { cargo: 'Key Account Manager', aliases: ['KAM', 'Gerente de Cuentas Clave', 'Account Manager'] },
    { cargo: 'Televendedor', aliases: ['Asesor Telefónico', 'Agente de Telesales', 'Telemarketer'] },
    { cargo: 'Asesor de Servicio al Cliente', aliases: ['Customer Service Rep', 'Atención al Cliente', 'Agente de Servicio'] },
    { cargo: 'Community Manager', aliases: ['CM', 'Social Media Manager', 'Gestor de Redes Sociales'] },
    { cargo: 'Coordinador de Marketing', aliases: ['Marketing Coordinator', 'Coord. de Mercadeo'] },
    { cargo: 'Mercaderista', aliases: ['Merchandiser', 'Impulsor de Ventas', 'Promotor'] },
    { cargo: 'Cajero', aliases: ['Cajera', 'Operador de Caja', 'Cashier'] },

    // SALUD
    { cargo: 'Médico General', aliases: ['Médico', 'Doctor', 'Physician', 'General Practitioner'] },
    { cargo: 'Médico Ocupacional', aliases: ['Médico del Trabajo', 'Médico SST', 'Occupational Physician'] },
    { cargo: 'Enfermero/a Jefe', aliases: ['Jefe de Enfermería', 'Head Nurse', 'Enfermera Líder'] },
    { cargo: 'Enfermero/a', aliases: ['Enfermera', 'Nurse', 'Profesional de Enfermería'] },
    { cargo: 'Auxiliar de Enfermería', aliases: ['Aux. de Enfermería', 'Auxiliar de Clínica', 'Nursing Assistant'] },
    { cargo: 'Odontólogo', aliases: ['Dentista', 'Odontologo', 'Dentist'] },
    { cargo: 'Fisioterapeuta', aliases: ['Physical Therapist', 'Kinesiólogo', 'Terapeuta Físico'] },
    { cargo: 'Psicólogo', aliases: ['Psychologist', 'Psicóloga', 'Profesional en Psicología'] },
    { cargo: 'Psicólogo Organizacional', aliases: ['Psicólogo de Empresa', 'Psicólogo Laboral', 'Organizational Psychologist'] },
    { cargo: 'Bacteriólogo', aliases: ['Microbiólogo', 'Laboratorista Clínico', 'Clinical Lab Scientist'] },

    // TRANSPORTE
    { cargo: 'Conductor de Camión', aliases: ['Camionero', 'Chofer de Camión', 'Truck Driver'] },
    { cargo: 'Conductor de Tractomula', aliases: ['Tractomulero', 'Trailer Driver', 'Chofer de Tractomula'] },
    { cargo: 'Conductor de Bus', aliases: ['Busero', 'Chofer de Bus', 'Bus Driver'] },
    { cargo: 'Mensajero Motorizado', aliases: ['Mensajero en Moto', 'Motorizado', 'Courier'] },
    { cargo: 'Domiciliario', aliases: ['Repartidor', 'Delivery', 'Mensajero de Domicilios'] },
    { cargo: 'Operador de Montacargas', aliases: ['Montacarguista', 'Forklift Operator', 'Operador de Elevador'] },
  ];

  // Construir array de aliases con cargo_id
  const aliases = [];
  for (const def of aliasDefinitions) {
    const cargoId = findCargoId(def.cargo);
    if (cargoId) {
      for (const alias of def.aliases) {
        aliases.push({
          cargo_id: cargoId,
          alias: alias,
          language: alias.match(/[a-zA-Z]+ [a-zA-Z]+/) && !alias.match(/[áéíóúñ]/i) ? 'en' : 'es'
        });
      }
    }
  }

  // Insertar aliases (ignorando duplicados)
  if (aliases.length > 0) {
    const batchSize = 50;
    let insertedCount = 0;
    for (let i = 0; i < aliases.length; i += batchSize) {
      const batch = aliases.slice(i, i + batchSize);
      try {
        await knex('cargo_aliases')
          .insert(batch)
          .onConflict(['cargo_id', 'alias'])
          .ignore();
        insertedCount += batch.length;
      } catch (err) {
        console.log(`  ⚠️  Error insertando batch ${i}: ${err.message}`);
      }
    }
    console.log(`✅ [SEED] Procesados ${aliases.length} aliases de cargos.`);
  } else {
    console.log(`⚠️  [SEED] No se encontraron aliases para insertar.`);
  }
};

