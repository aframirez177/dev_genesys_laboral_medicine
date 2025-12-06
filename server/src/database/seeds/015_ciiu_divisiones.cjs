/**
 * Seed: Divisiones CIIU Rev. 4 A.C. (2022) - DIAN Colombia
 * 
 * 87 divisiones (actividades económicas) organizadas por sección
 * 
 * Sprint 6 - Consolidación de datos
 */

exports.seed = async function(knex) {
  // Verificar que las secciones existan
  const seccionesCount = await knex('ciiu_secciones').count('id as count').first();
  if (parseInt(seccionesCount.count) === 0) {
    console.error('❌ Error: Ejecutar primero 014_ciiu_secciones.cjs');
    return;
  }

  // Limpiar divisiones existentes
  await knex('ciiu_divisiones').del();

  const divisiones = [
    // SECCIÓN A - Agricultura, ganadería, caza, silvicultura y pesca
    { codigo: '01', seccion_codigo: 'A', nombre: 'Agricultura, ganadería, caza y actividades de servicios conexas', orden: 1 },
    { codigo: '02', seccion_codigo: 'A', nombre: 'Silvicultura y extracción de madera', orden: 2 },
    { codigo: '03', seccion_codigo: 'A', nombre: 'Pesca y acuicultura', orden: 3 },

    // SECCIÓN B - Explotación de minas y canteras
    { codigo: '05', seccion_codigo: 'B', nombre: 'Extracción de carbón de piedra y lignito', orden: 1 },
    { codigo: '06', seccion_codigo: 'B', nombre: 'Extracción de petróleo crudo y gas natural', orden: 2 },
    { codigo: '07', seccion_codigo: 'B', nombre: 'Extracción de minerales metalíferos', orden: 3 },
    { codigo: '08', seccion_codigo: 'B', nombre: 'Extracción de otras minas y canteras', orden: 4 },
    { codigo: '09', seccion_codigo: 'B', nombre: 'Actividades de servicios de apoyo para la explotación de minas y canteras', orden: 5 },

    // SECCIÓN C - Industrias manufactureras
    { codigo: '10', seccion_codigo: 'C', nombre: 'Elaboración de productos alimenticios', orden: 1 },
    { codigo: '11', seccion_codigo: 'C', nombre: 'Elaboración de bebidas', orden: 2 },
    { codigo: '12', seccion_codigo: 'C', nombre: 'Elaboración de productos de tabaco', orden: 3 },
    { codigo: '13', seccion_codigo: 'C', nombre: 'Fabricación de productos textiles', orden: 4 },
    { codigo: '14', seccion_codigo: 'C', nombre: 'Confección de prendas de vestir', orden: 5 },
    { codigo: '15', seccion_codigo: 'C', nombre: 'Curtido y recurtido de cueros; fabricación de calzado; fabricación de artículos de viaje, maletas, bolsos de mano y artículos similares', orden: 6 },
    { codigo: '16', seccion_codigo: 'C', nombre: 'Transformación de la madera y fabricación de productos de madera y de corcho, excepto muebles', orden: 7 },
    { codigo: '17', seccion_codigo: 'C', nombre: 'Fabricación de papel, cartón y productos de papel y cartón', orden: 8 },
    { codigo: '18', seccion_codigo: 'C', nombre: 'Actividades de impresión y de producción de copias a partir de grabaciones originales', orden: 9 },
    { codigo: '19', seccion_codigo: 'C', nombre: 'Coquización, fabricación de productos de la refinación del petróleo y actividad de mezcla de combustibles', orden: 10 },
    { codigo: '20', seccion_codigo: 'C', nombre: 'Fabricación de sustancias y productos químicos', orden: 11 },
    { codigo: '21', seccion_codigo: 'C', nombre: 'Fabricación de productos farmacéuticos, sustancias químicas medicinales y productos botánicos de uso farmacéutico', orden: 12 },
    { codigo: '22', seccion_codigo: 'C', nombre: 'Fabricación de productos de caucho y de plástico', orden: 13 },
    { codigo: '23', seccion_codigo: 'C', nombre: 'Fabricación de otros productos minerales no metálicos', orden: 14 },
    { codigo: '24', seccion_codigo: 'C', nombre: 'Fabricación de productos metalúrgicos básicos', orden: 15 },
    { codigo: '25', seccion_codigo: 'C', nombre: 'Fabricación de productos elaborados de metal, excepto maquinaria y equipo', orden: 16 },
    { codigo: '26', seccion_codigo: 'C', nombre: 'Fabricación de productos informáticos, electrónicos y ópticos', orden: 17 },
    { codigo: '27', seccion_codigo: 'C', nombre: 'Fabricación de aparatos y equipo eléctrico', orden: 18 },
    { codigo: '28', seccion_codigo: 'C', nombre: 'Fabricación de maquinaria y equipo n.c.p.', orden: 19 },
    { codigo: '29', seccion_codigo: 'C', nombre: 'Fabricación de vehículos automotores, remolques y semirremolques', orden: 20 },
    { codigo: '30', seccion_codigo: 'C', nombre: 'Fabricación de otros tipos de equipo de transporte', orden: 21 },
    { codigo: '31', seccion_codigo: 'C', nombre: 'Fabricación de muebles, colchones y somieres', orden: 22 },
    { codigo: '32', seccion_codigo: 'C', nombre: 'Otras industrias manufactureras', orden: 23 },
    { codigo: '33', seccion_codigo: 'C', nombre: 'Instalación, mantenimiento y reparación especializado de maquinaria y equipo', orden: 24 },

    // SECCIÓN D - Suministro de electricidad, gas, vapor y aire acondicionado
    { codigo: '35', seccion_codigo: 'D', nombre: 'Suministro de electricidad, gas, vapor y aire acondicionado', orden: 1 },

    // SECCIÓN E - Distribución de agua; evacuación y tratamiento de aguas residuales
    { codigo: '36', seccion_codigo: 'E', nombre: 'Captación, tratamiento y distribución de agua', orden: 1 },
    { codigo: '37', seccion_codigo: 'E', nombre: 'Evacuación y tratamiento de aguas residuales', orden: 2 },
    { codigo: '38', seccion_codigo: 'E', nombre: 'Recolección, tratamiento y disposición de desechos, recuperación de materiales', orden: 3 },
    { codigo: '39', seccion_codigo: 'E', nombre: 'Actividades de saneamiento ambiental y otros servicios de gestión de desechos', orden: 4 },

    // SECCIÓN F - Construcción
    { codigo: '41', seccion_codigo: 'F', nombre: 'Construcción de edificios', orden: 1 },
    { codigo: '42', seccion_codigo: 'F', nombre: 'Obras de ingeniería civil', orden: 2 },
    { codigo: '43', seccion_codigo: 'F', nombre: 'Actividades especializadas para la construcción de edificios y obras de ingeniería civil', orden: 3 },

    // SECCIÓN G - Comercio al por mayor y al por menor
    { codigo: '45', seccion_codigo: 'G', nombre: 'Comercio, mantenimiento y reparación de vehículos automotores y motocicletas, sus partes, piezas y accesorios', orden: 1 },
    { codigo: '46', seccion_codigo: 'G', nombre: 'Comercio al por mayor y en comisión o por contrata, excepto el comercio de vehículos automotores y motocicletas', orden: 2 },
    { codigo: '47', seccion_codigo: 'G', nombre: 'Comercio al por menor (incluso el comercio al por menor de combustibles), excepto el de vehículos automotores y motocicletas', orden: 3 },

    // SECCIÓN H - Transporte y almacenamiento
    { codigo: '49', seccion_codigo: 'H', nombre: 'Transporte terrestre; transporte por tuberías', orden: 1 },
    { codigo: '50', seccion_codigo: 'H', nombre: 'Transporte acuático', orden: 2 },
    { codigo: '51', seccion_codigo: 'H', nombre: 'Transporte aéreo', orden: 3 },
    { codigo: '52', seccion_codigo: 'H', nombre: 'Almacenamiento y actividades complementarias al transporte', orden: 4 },
    { codigo: '53', seccion_codigo: 'H', nombre: 'Correo y servicios de mensajería', orden: 5 },

    // SECCIÓN I - Alojamiento y servicios de comida
    { codigo: '55', seccion_codigo: 'I', nombre: 'Alojamiento', orden: 1 },
    { codigo: '56', seccion_codigo: 'I', nombre: 'Actividades de servicios de comidas y bebidas', orden: 2 },

    // SECCIÓN J - Información y comunicaciones
    { codigo: '58', seccion_codigo: 'J', nombre: 'Actividades de edición', orden: 1 },
    { codigo: '59', seccion_codigo: 'J', nombre: 'Actividades cinematográficas, de video y producción de programas de televisión, grabación de sonido y edición de música', orden: 2 },
    { codigo: '60', seccion_codigo: 'J', nombre: 'Actividades de programación, transmisión y/o difusión', orden: 3 },
    { codigo: '61', seccion_codigo: 'J', nombre: 'Telecomunicaciones', orden: 4 },
    { codigo: '62', seccion_codigo: 'J', nombre: 'Desarrollo de sistemas informáticos (planificación, análisis, diseño, programación, pruebas), consultoría informática y actividades relacionadas', orden: 5 },
    { codigo: '63', seccion_codigo: 'J', nombre: 'Actividades de servicios de información', orden: 6 },

    // SECCIÓN K - Actividades financieras y de seguros
    { codigo: '64', seccion_codigo: 'K', nombre: 'Actividades de servicios financieros, excepto las de seguros y de pensiones', orden: 1 },
    { codigo: '65', seccion_codigo: 'K', nombre: 'Seguros (incluso el reaseguro), seguros sociales y fondos de pensiones, excepto la seguridad social', orden: 2 },
    { codigo: '66', seccion_codigo: 'K', nombre: 'Actividades auxiliares de las actividades de servicios financieros', orden: 3 },

    // SECCIÓN L - Actividades inmobiliarias
    { codigo: '68', seccion_codigo: 'L', nombre: 'Actividades inmobiliarias', orden: 1 },

    // SECCIÓN M - Actividades profesionales, científicas y técnicas
    { codigo: '69', seccion_codigo: 'M', nombre: 'Actividades jurídicas y de contabilidad', orden: 1 },
    { codigo: '70', seccion_codigo: 'M', nombre: 'Actividades de administración empresarial; actividades de consultoría de gestión', orden: 2 },
    { codigo: '71', seccion_codigo: 'M', nombre: 'Actividades de arquitectura e ingeniería; ensayos y análisis técnicos', orden: 3 },
    { codigo: '72', seccion_codigo: 'M', nombre: 'Investigación científica y desarrollo', orden: 4 },
    { codigo: '73', seccion_codigo: 'M', nombre: 'Publicidad y estudios de mercado', orden: 5 },
    { codigo: '74', seccion_codigo: 'M', nombre: 'Otras actividades profesionales, científicas y técnicas', orden: 6 },
    { codigo: '75', seccion_codigo: 'M', nombre: 'Actividades veterinarias', orden: 7 },

    // SECCIÓN N - Actividades de servicios administrativos y de apoyo
    { codigo: '77', seccion_codigo: 'N', nombre: 'Actividades de alquiler y arrendamiento', orden: 1 },
    { codigo: '78', seccion_codigo: 'N', nombre: 'Actividades de empleo', orden: 2 },
    { codigo: '79', seccion_codigo: 'N', nombre: 'Actividades de las agencias de viajes, operadores turísticos, servicios de reserva y actividades relacionadas', orden: 3 },
    { codigo: '80', seccion_codigo: 'N', nombre: 'Actividades de seguridad e investigación privada', orden: 4 },
    { codigo: '81', seccion_codigo: 'N', nombre: 'Actividades de servicios a edificios y paisajismo (jardines, zonas verdes)', orden: 5 },
    { codigo: '82', seccion_codigo: 'N', nombre: 'Actividades administrativas y de apoyo de oficina y otras actividades de apoyo a las empresas', orden: 6 },

    // SECCIÓN O - Administración pública y defensa
    { codigo: '84', seccion_codigo: 'O', nombre: 'Administración pública y defensa; planes de seguridad social de afiliación obligatoria', orden: 1 },

    // SECCIÓN P - Educación
    { codigo: '85', seccion_codigo: 'P', nombre: 'Educación', orden: 1 },

    // SECCIÓN Q - Actividades de atención de la salud humana y de asistencia social
    { codigo: '86', seccion_codigo: 'Q', nombre: 'Actividades de atención de la salud humana', orden: 1 },
    { codigo: '87', seccion_codigo: 'Q', nombre: 'Actividades de atención residencial medicalizada', orden: 2 },
    { codigo: '88', seccion_codigo: 'Q', nombre: 'Actividades de asistencia social sin alojamiento', orden: 3 },

    // SECCIÓN R - Actividades artísticas, de entretenimiento y recreación
    { codigo: '90', seccion_codigo: 'R', nombre: 'Actividades creativas, artísticas y de entretenimiento', orden: 1 },
    { codigo: '91', seccion_codigo: 'R', nombre: 'Actividades de bibliotecas, archivos, museos y otras actividades culturales', orden: 2 },
    { codigo: '92', seccion_codigo: 'R', nombre: 'Actividades de juegos de azar y apuestas', orden: 3 },
    { codigo: '93', seccion_codigo: 'R', nombre: 'Actividades deportivas y actividades recreativas y de esparcimiento', orden: 4 },

    // SECCIÓN S - Otras actividades de servicios
    { codigo: '94', seccion_codigo: 'S', nombre: 'Actividades de asociaciones', orden: 1 },
    { codigo: '95', seccion_codigo: 'S', nombre: 'Mantenimiento y reparación de computadores, efectos personales y enseres domésticos', orden: 2 },
    { codigo: '96', seccion_codigo: 'S', nombre: 'Otras actividades de servicios personales', orden: 3 },

    // SECCIÓN T - Actividades de los hogares individuales
    { codigo: '97', seccion_codigo: 'T', nombre: 'Actividades de los hogares individuales como empleadores de personal doméstico', orden: 1 },
    { codigo: '98', seccion_codigo: 'T', nombre: 'Actividades no diferenciadas de los hogares individuales como productores de bienes y servicios para uso propio', orden: 2 },

    // SECCIÓN U - Actividades de organizaciones y entidades extraterritoriales
    { codigo: '99', seccion_codigo: 'U', nombre: 'Actividades de organizaciones y entidades extraterritoriales', orden: 1 }
  ];

  // Insertar en lotes
  const batchSize = 20;
  for (let i = 0; i < divisiones.length; i += batchSize) {
    const batch = divisiones.slice(i, i + batchSize);
    await knex('ciiu_divisiones').insert(batch);
  }

  console.log(`✅ Insertadas ${divisiones.length} divisiones CIIU`);
};

