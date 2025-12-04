/**
 * Seed: Ciudades de Colombia
 * 
 * Consolida las 87+ ciudades principales de Colombia organizadas por departamento.
 * Migrado desde client/src/config/colombia-data.js
 * 
 * Sprint 6 - Consolidación de datos
 */

exports.seed = async function(knex) {
  // Limpiar tabla existente
  await knex('catalogo_ciudades').del();

  const ciudades = [
    // Amazonas
    { nombre: 'Leticia', departamento: 'Amazonas', es_capital: true, orden: 1 },

    // Antioquia
    { nombre: 'Medellín', departamento: 'Antioquia', es_capital: true, orden: 1 },
    { nombre: 'Envigado', departamento: 'Antioquia', orden: 2 },
    { nombre: 'Itagüí', departamento: 'Antioquia', orden: 3 },
    { nombre: 'Bello', departamento: 'Antioquia', orden: 4 },
    { nombre: 'Rionegro', departamento: 'Antioquia', orden: 5 },
    { nombre: 'Sabaneta', departamento: 'Antioquia', orden: 6 },

    // Arauca
    { nombre: 'Arauca', departamento: 'Arauca', es_capital: true, orden: 1 },

    // Atlántico
    { nombre: 'Barranquilla', departamento: 'Atlántico', es_capital: true, orden: 1 },
    { nombre: 'Soledad', departamento: 'Atlántico', orden: 2 },
    { nombre: 'Malambo', departamento: 'Atlántico', orden: 3 },
    { nombre: 'Puerto Colombia', departamento: 'Atlántico', orden: 4 },

    // Bogotá D.C.
    { nombre: 'Bogotá', departamento: 'Bogotá D.C.', es_capital: true, orden: 1 },

    // Bolívar
    { nombre: 'Cartagena', departamento: 'Bolívar', es_capital: true, orden: 1 },
    { nombre: 'Magangué', departamento: 'Bolívar', orden: 2 },
    { nombre: 'Turbaco', departamento: 'Bolívar', orden: 3 },

    // Boyacá
    { nombre: 'Tunja', departamento: 'Boyacá', es_capital: true, orden: 1 },
    { nombre: 'Duitama', departamento: 'Boyacá', orden: 2 },
    { nombre: 'Sogamoso', departamento: 'Boyacá', orden: 3 },

    // Caldas
    { nombre: 'Manizales', departamento: 'Caldas', es_capital: true, orden: 1 },
    { nombre: 'La Dorada', departamento: 'Caldas', orden: 2 },

    // Caquetá
    { nombre: 'Florencia', departamento: 'Caquetá', es_capital: true, orden: 1 },

    // Casanare
    { nombre: 'Yopal', departamento: 'Casanare', es_capital: true, orden: 1 },

    // Cauca
    { nombre: 'Popayán', departamento: 'Cauca', es_capital: true, orden: 1 },
    { nombre: 'Santander de Quilichao', departamento: 'Cauca', orden: 2 },

    // Cesar
    { nombre: 'Valledupar', departamento: 'Cesar', es_capital: true, orden: 1 },
    { nombre: 'Aguachica', departamento: 'Cesar', orden: 2 },

    // Chocó
    { nombre: 'Quibdó', departamento: 'Chocó', es_capital: true, orden: 1 },

    // Córdoba
    { nombre: 'Montería', departamento: 'Córdoba', es_capital: true, orden: 1 },
    { nombre: 'Cereté', departamento: 'Córdoba', orden: 2 },
    { nombre: 'Lorica', departamento: 'Córdoba', orden: 3 },

    // Cundinamarca
    { nombre: 'Soacha', departamento: 'Cundinamarca', orden: 1 },
    { nombre: 'Chía', departamento: 'Cundinamarca', orden: 2 },
    { nombre: 'Zipaquirá', departamento: 'Cundinamarca', orden: 3 },
    { nombre: 'Facatativá', departamento: 'Cundinamarca', orden: 4 },
    { nombre: 'Fusagasugá', departamento: 'Cundinamarca', orden: 5 },
    { nombre: 'Girardot', departamento: 'Cundinamarca', orden: 6 },
    { nombre: 'Cajicá', departamento: 'Cundinamarca', orden: 7 },
    { nombre: 'Madrid', departamento: 'Cundinamarca', orden: 8 },
    { nombre: 'Mosquera', departamento: 'Cundinamarca', orden: 9 },
    { nombre: 'Funza', departamento: 'Cundinamarca', orden: 10 },

    // Guainía
    { nombre: 'Inírida', departamento: 'Guainía', es_capital: true, orden: 1 },

    // Guaviare
    { nombre: 'San José del Guaviare', departamento: 'Guaviare', es_capital: true, orden: 1 },

    // Huila
    { nombre: 'Neiva', departamento: 'Huila', es_capital: true, orden: 1 },
    { nombre: 'Pitalito', departamento: 'Huila', orden: 2 },

    // La Guajira
    { nombre: 'Riohacha', departamento: 'La Guajira', es_capital: true, orden: 1 },
    { nombre: 'Maicao', departamento: 'La Guajira', orden: 2 },

    // Magdalena
    { nombre: 'Santa Marta', departamento: 'Magdalena', es_capital: true, orden: 1 },
    { nombre: 'Ciénaga', departamento: 'Magdalena', orden: 2 },

    // Meta
    { nombre: 'Villavicencio', departamento: 'Meta', es_capital: true, orden: 1 },
    { nombre: 'Acacías', departamento: 'Meta', orden: 2 },
    { nombre: 'Granada', departamento: 'Meta', orden: 3 },

    // Nariño
    { nombre: 'Pasto', departamento: 'Nariño', es_capital: true, orden: 1 },
    { nombre: 'Tumaco', departamento: 'Nariño', orden: 2 },
    { nombre: 'Ipiales', departamento: 'Nariño', orden: 3 },

    // Norte de Santander
    { nombre: 'Cúcuta', departamento: 'Norte de Santander', es_capital: true, orden: 1 },
    { nombre: 'Ocaña', departamento: 'Norte de Santander', orden: 2 },
    { nombre: 'Pamplona', departamento: 'Norte de Santander', orden: 3 },
    { nombre: 'Villa del Rosario', departamento: 'Norte de Santander', orden: 4 },

    // Putumayo
    { nombre: 'Mocoa', departamento: 'Putumayo', es_capital: true, orden: 1 },

    // Quindío
    { nombre: 'Armenia', departamento: 'Quindío', es_capital: true, orden: 1 },
    { nombre: 'Calarcá', departamento: 'Quindío', orden: 2 },

    // Risaralda
    { nombre: 'Pereira', departamento: 'Risaralda', es_capital: true, orden: 1 },
    { nombre: 'Dosquebradas', departamento: 'Risaralda', orden: 2 },
    { nombre: 'Santa Rosa de Cabal', departamento: 'Risaralda', orden: 3 },

    // San Andrés y Providencia
    { nombre: 'San Andrés', departamento: 'San Andrés y Providencia', es_capital: true, orden: 1 },

    // Santander
    { nombre: 'Bucaramanga', departamento: 'Santander', es_capital: true, orden: 1 },
    { nombre: 'Floridablanca', departamento: 'Santander', orden: 2 },
    { nombre: 'Girón', departamento: 'Santander', orden: 3 },
    { nombre: 'Piedecuesta', departamento: 'Santander', orden: 4 },
    { nombre: 'Barrancabermeja', departamento: 'Santander', orden: 5 },
    { nombre: 'San Gil', departamento: 'Santander', orden: 6 },

    // Sucre
    { nombre: 'Sincelejo', departamento: 'Sucre', es_capital: true, orden: 1 },

    // Tolima
    { nombre: 'Ibagué', departamento: 'Tolima', es_capital: true, orden: 1 },
    { nombre: 'Espinal', departamento: 'Tolima', orden: 2 },

    // Valle del Cauca
    { nombre: 'Cali', departamento: 'Valle del Cauca', es_capital: true, orden: 1 },
    { nombre: 'Palmira', departamento: 'Valle del Cauca', orden: 2 },
    { nombre: 'Buenaventura', departamento: 'Valle del Cauca', orden: 3 },
    { nombre: 'Tuluá', departamento: 'Valle del Cauca', orden: 4 },
    { nombre: 'Cartago', departamento: 'Valle del Cauca', orden: 5 },
    { nombre: 'Buga', departamento: 'Valle del Cauca', orden: 6 },
    { nombre: 'Jamundí', departamento: 'Valle del Cauca', orden: 7 },
    { nombre: 'Yumbo', departamento: 'Valle del Cauca', orden: 8 },

    // Vaupés
    { nombre: 'Mitú', departamento: 'Vaupés', es_capital: true, orden: 1 },

    // Vichada
    { nombre: 'Puerto Carreño', departamento: 'Vichada', es_capital: true, orden: 1 }
  ];

  // Insertar en lotes de 20
  const batchSize = 20;
  for (let i = 0; i < ciudades.length; i += batchSize) {
    const batch = ciudades.slice(i, i + batchSize);
    await knex('catalogo_ciudades').insert(batch);
  }

  console.log(`✅ Insertadas ${ciudades.length} ciudades de Colombia`);
};

