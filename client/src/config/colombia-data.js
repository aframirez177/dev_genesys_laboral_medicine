/**
 * colombia-data.js - Datos de Colombia para formularios
 *
 * Lista completa de sectores económicos y ciudades principales
 */

/**
 * Sectores económicos de Colombia según clasificación CIIU
 */
export const SECTORES_ECONOMICOS = [
  { value: 'agricultura', label: 'Agricultura, ganadería, caza y silvicultura' },
  { value: 'pesca', label: 'Pesca' },
  { value: 'mineria', label: 'Explotación de minas y canteras' },
  { value: 'manufactura', label: 'Industrias manufactureras' },
  { value: 'electricidad', label: 'Suministro de electricidad, gas y agua' },
  { value: 'construccion', label: 'Construcción' },
  { value: 'comercio', label: 'Comercio al por mayor y al por menor' },
  { value: 'hoteles', label: 'Hoteles y restaurantes' },
  { value: 'transporte', label: 'Transporte, almacenamiento y comunicaciones' },
  { value: 'financiero', label: 'Intermediación financiera' },
  { value: 'inmobiliario', label: 'Actividades inmobiliarias, empresariales y de alquiler' },
  { value: 'administracion', label: 'Administración pública y defensa' },
  { value: 'educacion', label: 'Educación' },
  { value: 'salud', label: 'Servicios sociales y de salud' },
  { value: 'servicios-comunitarios', label: 'Otras actividades de servicios comunitarios, sociales y personales' },
  { value: 'servicios-domesticos', label: 'Hogares privados con servicio doméstico' },
  { value: 'tecnologia', label: 'Tecnología e informática' },
  { value: 'telecomunicaciones', label: 'Telecomunicaciones' },
  { value: 'servicios-profesionales', label: 'Actividades profesionales, científicas y técnicas' },
  { value: 'entretenimiento', label: 'Actividades artísticas, de entretenimiento y recreación' },
  { value: 'otro', label: 'Otro sector' }
];

/**
 * Ciudades principales de Colombia por departamento
 */
export const CIUDADES_COLOMBIA = [
  // Amazonas
  { value: 'Leticia', departamento: 'Amazonas' },

  // Antioquia
  { value: 'Medellín', departamento: 'Antioquia' },
  { value: 'Envigado', departamento: 'Antioquia' },
  { value: 'Itagüí', departamento: 'Antioquia' },
  { value: 'Bello', departamento: 'Antioquia' },
  { value: 'Rionegro', departamento: 'Antioquia' },
  { value: 'Sabaneta', departamento: 'Antioquia' },

  // Arauca
  { value: 'Arauca', departamento: 'Arauca' },

  // Atlántico
  { value: 'Barranquilla', departamento: 'Atlántico' },
  { value: 'Soledad', departamento: 'Atlántico' },
  { value: 'Malambo', departamento: 'Atlántico' },
  { value: 'Puerto Colombia', departamento: 'Atlántico' },

  // Bogotá D.C.
  { value: 'Bogotá', departamento: 'Bogotá D.C.' },

  // Bolívar
  { value: 'Cartagena', departamento: 'Bolívar' },
  { value: 'Magangué', departamento: 'Bolívar' },
  { value: 'Turbaco', departamento: 'Bolívar' },

  // Boyacá
  { value: 'Tunja', departamento: 'Boyacá' },
  { value: 'Duitama', departamento: 'Boyacá' },
  { value: 'Sogamoso', departamento: 'Boyacá' },

  // Caldas
  { value: 'Manizales', departamento: 'Caldas' },
  { value: 'La Dorada', departamento: 'Caldas' },

  // Caquetá
  { value: 'Florencia', departamento: 'Caquetá' },

  // Casanare
  { value: 'Yopal', departamento: 'Casanare' },

  // Cauca
  { value: 'Popayán', departamento: 'Cauca' },
  { value: 'Santander de Quilichao', departamento: 'Cauca' },

  // Cesar
  { value: 'Valledupar', departamento: 'Cesar' },
  { value: 'Aguachica', departamento: 'Cesar' },

  // Chocó
  { value: 'Quibdó', departamento: 'Chocó' },

  // Córdoba
  { value: 'Montería', departamento: 'Córdoba' },
  { value: 'Cereté', departamento: 'Córdoba' },
  { value: 'Lorica', departamento: 'Córdoba' },

  // Cundinamarca
  { value: 'Soacha', departamento: 'Cundinamarca' },
  { value: 'Chía', departamento: 'Cundinamarca' },
  { value: 'Zipaquirá', departamento: 'Cundinamarca' },
  { value: 'Facatativá', departamento: 'Cundinamarca' },
  { value: 'Fusagasugá', departamento: 'Cundinamarca' },
  { value: 'Girardot', departamento: 'Cundinamarca' },
  { value: 'Cajicá', departamento: 'Cundinamarca' },
  { value: 'Madrid', departamento: 'Cundinamarca' },
  { value: 'Mosquera', departamento: 'Cundinamarca' },
  { value: 'Funza', departamento: 'Cundinamarca' },

  // Guainía
  { value: 'Inírida', departamento: 'Guainía' },

  // Guaviare
  { value: 'San José del Guaviare', departamento: 'Guaviare' },

  // Huila
  { value: 'Neiva', departamento: 'Huila' },
  { value: 'Pitalito', departamento: 'Huila' },

  // La Guajira
  { value: 'Riohacha', departamento: 'La Guajira' },
  { value: 'Maicao', departamento: 'La Guajira' },

  // Magdalena
  { value: 'Santa Marta', departamento: 'Magdalena' },
  { value: 'Ciénaga', departamento: 'Magdalena' },

  // Meta
  { value: 'Villavicencio', departamento: 'Meta' },
  { value: 'Acacías', departamento: 'Meta' },
  { value: 'Granada', departamento: 'Meta' },

  // Nariño
  { value: 'Pasto', departamento: 'Nariño' },
  { value: 'Tumaco', departamento: 'Nariño' },
  { value: 'Ipiales', departamento: 'Nariño' },

  // Norte de Santander
  { value: 'Cúcuta', departamento: 'Norte de Santander' },
  { value: 'Ocaña', departamento: 'Norte de Santander' },
  { value: 'Pamplona', departamento: 'Norte de Santander' },
  { value: 'Villa del Rosario', departamento: 'Norte de Santander' },

  // Putumayo
  { value: 'Mocoa', departamento: 'Putumayo' },

  // Quindío
  { value: 'Armenia', departamento: 'Quindío' },
  { value: 'Calarcá', departamento: 'Quindío' },

  // Risaralda
  { value: 'Pereira', departamento: 'Risaralda' },
  { value: 'Dosquebradas', departamento: 'Risaralda' },
  { value: 'Santa Rosa de Cabal', departamento: 'Risaralda' },

  // San Andrés y Providencia
  { value: 'San Andrés', departamento: 'San Andrés y Providencia' },

  // Santander
  { value: 'Bucaramanga', departamento: 'Santander' },
  { value: 'Floridablanca', departamento: 'Santander' },
  { value: 'Girón', departamento: 'Santander' },
  { value: 'Piedecuesta', departamento: 'Santander' },
  { value: 'Barrancabermeja', departamento: 'Santander' },
  { value: 'San Gil', departamento: 'Santander' },

  // Sucre
  { value: 'Sincelejo', departamento: 'Sucre' },

  // Tolima
  { value: 'Ibagué', departamento: 'Tolima' },
  { value: 'Espinal', departamento: 'Tolima' },

  // Valle del Cauca
  { value: 'Cali', departamento: 'Valle del Cauca' },
  { value: 'Palmira', departamento: 'Valle del Cauca' },
  { value: 'Buenaventura', departamento: 'Valle del Cauca' },
  { value: 'Tuluá', departamento: 'Valle del Cauca' },
  { value: 'Cartago', departamento: 'Valle del Cauca' },
  { value: 'Buga', departamento: 'Valle del Cauca' },
  { value: 'Jamundí', departamento: 'Valle del Cauca' },
  { value: 'Yumbo', departamento: 'Valle del Cauca' },

  // Vaupés
  { value: 'Mitú', departamento: 'Vaupés' },

  // Vichada
  { value: 'Puerto Carreño', departamento: 'Vichada' }
];

/**
 * Obtener lista simple de ciudades (solo nombres)
 */
export function getCiudadesSimple() {
  return CIUDADES_COLOMBIA.map(c => c.value).sort();
}

/**
 * Obtener ciudades agrupadas por departamento
 */
export function getCiudadesByDepartamento() {
  const grouped = {};
  CIUDADES_COLOMBIA.forEach(ciudad => {
    if (!grouped[ciudad.departamento]) {
      grouped[ciudad.departamento] = [];
    }
    grouped[ciudad.departamento].push(ciudad.value);
  });
  return grouped;
}
