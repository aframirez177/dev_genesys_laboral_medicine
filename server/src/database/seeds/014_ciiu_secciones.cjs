/**
 * Seed: Secciones CIIU Rev. 4 A.C. (2022) - DIAN Colombia
 * 
 * 21 secciones principales de la clasificación económica
 * 
 * Sprint 6 - Consolidación de datos
 */

exports.seed = async function(knex) {
  // Limpiar tablas (en orden correcto por FK)
  await knex('ciiu_divisiones').del();
  await knex('ciiu_secciones').del();

  const secciones = [
    { codigo: 'A', nombre: 'Agricultura, ganadería, caza, silvicultura y pesca', orden: 1 },
    { codigo: 'B', nombre: 'Explotación de minas y canteras', orden: 2 },
    { codigo: 'C', nombre: 'Industrias manufactureras', orden: 3 },
    { codigo: 'D', nombre: 'Suministro de electricidad, gas, vapor y aire acondicionado', orden: 4 },
    { codigo: 'E', nombre: 'Distribución de agua; evacuación y tratamiento de aguas residuales, gestión de desechos y saneamiento ambiental', orden: 5 },
    { codigo: 'F', nombre: 'Construcción', orden: 6 },
    { codigo: 'G', nombre: 'Comercio al por mayor y al por menor; reparación de vehículos automotores y motocicletas', orden: 7 },
    { codigo: 'H', nombre: 'Transporte y almacenamiento', orden: 8 },
    { codigo: 'I', nombre: 'Alojamiento y servicios de comida', orden: 9 },
    { codigo: 'J', nombre: 'Información y comunicaciones', orden: 10 },
    { codigo: 'K', nombre: 'Actividades financieras y de seguros', orden: 11 },
    { codigo: 'L', nombre: 'Actividades inmobiliarias', orden: 12 },
    { codigo: 'M', nombre: 'Actividades profesionales, científicas y técnicas', orden: 13 },
    { codigo: 'N', nombre: 'Actividades de servicios administrativos y de apoyo', orden: 14 },
    { codigo: 'O', nombre: 'Administración pública y defensa; planes de seguridad social de afiliación obligatoria', orden: 15 },
    { codigo: 'P', nombre: 'Educación', orden: 16 },
    { codigo: 'Q', nombre: 'Actividades de atención de la salud humana y de asistencia social', orden: 17 },
    { codigo: 'R', nombre: 'Actividades artísticas, de entretenimiento y recreación', orden: 18 },
    { codigo: 'S', nombre: 'Otras actividades de servicios', orden: 19 },
    { codigo: 'T', nombre: 'Actividades de los hogares individuales en calidad de empleadores', orden: 20 },
    { codigo: 'U', nombre: 'Actividades de organizaciones y entidades extraterritoriales', orden: 21 }
  ];

  await knex('ciiu_secciones').insert(secciones);
  console.log(`✅ Insertadas ${secciones.length} secciones CIIU`);
};

