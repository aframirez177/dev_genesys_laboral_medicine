/**
 * Generador de datos fake para tests del Wizard
 * Genera datos realistas de empresas colombianas
 */

import { faker } from '@faker-js/faker/locale/es_MX';

// Configurar faker en español
faker.setDefaultRefDate(new Date());

/**
 * Genera un NIT colombiano válido (con dígito de verificación)
 */
export function generateNIT(): string {
  // Generar 9 dígitos aleatorios
  const base = faker.string.numeric(9);
  
  // Calcular dígito de verificación (algoritmo colombiano simplificado)
  const primes = [3, 7, 13, 17, 19, 23, 29, 37, 41];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(base[i]) * primes[8 - i];
  }
  const dv = sum % 11;
  const checkDigit = dv >= 2 ? 11 - dv : dv;
  
  return `${base}-${checkDigit}`;
}

/**
 * Genera datos de una empresa colombiana
 */
export function generateEmpresa() {
  const tiposEmpresa = ['S.A.S', 'S.A.', 'LTDA', 'E.U.', 'S.C.A.'];
  const sectores = [
    'Construcción',
    'Manufactura',
    'Comercio',
    'Servicios',
    'Salud',
    'Educación',
    'Tecnología',
    'Agricultura',
    'Minería',
    'Transporte'
  ];
  
  const nombre = `${faker.company.name()} ${faker.helpers.arrayElement(tiposEmpresa)}`;
  const email = faker.internet.email({ 
    firstName: nombre.split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''),
    provider: 'empresa.com.co'
  });
  
  return {
    nombre,
    nit: generateNIT(),
    email,
    password: faker.internet.password({ length: 12, memorable: true }),
    telefono: `3${faker.string.numeric(9)}`, // Celular colombiano
    direccion: `${faker.location.streetAddress()} - ${faker.location.city()}`,
    sector: faker.helpers.arrayElement(sectores),
    numEmpleados: faker.number.int({ min: 5, max: 500 }),
    ciudades: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'],
  };
}

/**
 * Genera datos de un cargo
 */
export function generateCargo(index: number = 0) {
  const cargosComunes = [
    'Gerente General',
    'Director de Operaciones',
    'Jefe de Producción',
    'Supervisor de Planta',
    'Operario de Máquinas',
    'Técnico de Mantenimiento',
    'Auxiliar Administrativo',
    'Contador',
    'Analista de RRHH',
    'Conductor de Vehículos',
    'Almacenista',
    'Vigilante',
    'Asesor Comercial',
    'Recepcionista',
    'Auxiliar de Servicios Generales',
    'Ingeniero de Proyectos',
    'Coordinador de SST',
    'Médico Ocupacional',
    'Enfermero(a)',
    'Chef / Cocinero'
  ];
  
  const cargo = cargosComunes[index % cargosComunes.length] || faker.person.jobTitle();
  
  return {
    nombre: cargo,
    descripcion: faker.lorem.sentence(),
    numPersonas: faker.number.int({ min: 1, max: 20 }),
    area: faker.helpers.arrayElement([
      'Producción',
      'Administración',
      'Comercial',
      'Operaciones',
      'Mantenimiento',
      'Logística',
      'RRHH',
      'Finanzas'
    ]),
  };
}

/**
 * Genera un set completo de datos para el wizard
 */
export function generateWizardData(numCargos: number = 3) {
  const empresa = generateEmpresa();
  const cargos = Array.from({ length: numCargos }, (_, i) => generateCargo(i));
  
  return {
    empresa,
    cargos,
    // Archivo de credenciales para verificación posterior
    credenciales: {
      email: empresa.email,
      password: empresa.password,
      nit: empresa.nit,
      nombreEmpresa: empresa.nombre,
      fechaCreacion: new Date().toISOString(),
    }
  };
}

/**
 * Guarda las credenciales en un archivo JSON para verificación
 */
export function getCredentialsFileName(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `test-empresa-${timestamp}.json`;
}

// Tipos para TypeScript
export interface EmpresaData {
  nombre: string;
  nit: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
  sector: string;
  numEmpleados: number;
}

export interface CargoData {
  nombre: string;
  descripcion: string;
  numPersonas: number;
  area: string;
}

export interface WizardTestData {
  empresa: EmpresaData;
  cargos: CargoData[];
  credenciales: {
    email: string;
    password: string;
    nit: string;
    nombreEmpresa: string;
    fechaCreacion: string;
  };
}

