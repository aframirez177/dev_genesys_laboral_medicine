/**
 * schemas.js - Esquemas de validación con Zod
 *
 * Define esquemas reutilizables para validar datos del formulario
 */

import { z } from 'zod';

// Esquema para información de la empresa
export const empresaSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre de la empresa debe tener al menos 3 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),

  nit: z.string()
    .min(9, 'El NIT debe tener al menos 9 caracteres')
    .regex(/^[0-9-]+$/, 'El NIT solo puede contener números y guiones'),

  sector: z.string().optional(),
  region: z.string().optional()
});

// Esquema para niveles de riesgo
export const nivelesRiesgoSchema = z.object({
  nivelDeficiencia: z.enum(['bajo', 'medio', 'alto', 'muyAlto']),
  valorDeficiencia: z.number().min(0).max(10),

  nivelExposicion: z.enum(['esporadica', 'ocasional', 'frecuente', 'continua']),
  valorExposicion: z.number().min(1).max(4),

  nivelProbabilidad: z.number().min(0),
  interpretacionProbabilidad: z.string(),

  nivelConsecuencia: z.enum(['leve', 'grave', 'muyGrave', 'mortal']),
  valorConsecuencia: z.number().min(10).max(100),

  nivelRiesgo: z.number().min(0),
  interpretacionRiesgo: z.enum(['trivial', 'tolerable', 'moderado', 'importante', 'intolerable'])
});

// Esquema para controles
export const controlesSchema = z.object({
  fuente: z.string().min(1, 'El control en la fuente es requerido'),
  medio: z.string().min(1, 'El control en el medio es requerido'),
  individuo: z.string().min(1, 'El control en el individuo es requerido')
});

// Esquema para GES (Grupo de Exposición Similar)
export const gesSchema = z.object({
  riesgo: z.string().min(1, 'El tipo de riesgo es requerido'),
  ges: z.string().min(1, 'El GES es requerido'),
  controles: controlesSchema,
  niveles: nivelesRiesgoSchema
});

// Esquema para un cargo
export const cargoSchema = z.object({
  id: z.number().optional(),

  cargoName: z.string()
    .min(3, 'El nombre del cargo debe tener al menos 3 caracteres')
    .max(100, 'El nombre del cargo no puede exceder 100 caracteres'),

  area: z.string()
    .min(2, 'El área debe tener al menos 2 caracteres')
    .max(100, 'El área no puede exceder 100 caracteres'),

  zona: z.string()
    .min(2, 'La zona debe tener al menos 2 caracteres')
    .max(100, 'La zona no puede exceder 100 caracteres'),

  numTrabajadores: z.number()
    .int('El número de trabajadores debe ser un entero')
    .positive('Debe haber al menos un trabajador')
    .max(10000, 'El número de trabajadores no puede exceder 10,000'),

  descripcionTareas: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),

  tareasRutinarias: z.boolean().optional().default(false),
  manipulaAlimentos: z.boolean().optional().default(false),
  trabajaAlturas: z.boolean().optional().default(false),
  trabajaEspaciosConfinados: z.boolean().optional().default(false),
  conduceVehiculo: z.boolean().optional().default(false),

  gesSeleccionados: z.array(gesSchema)
    .min(1, 'Debe seleccionar al menos un riesgo')
});

// Esquema para el diagnóstico completo
export const diagnosticoSchema = z.object({
  empresa: empresaSchema,
  cargos: z.array(cargoSchema)
    .min(1, 'Debe agregar al menos un cargo')
    .max(50, 'No puede agregar más de 50 cargos')
});

// Esquema para usuario/contacto
export const usuarioSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .optional(),

  email: z.string()
    .email('El email no es válido'),

  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional()
});

// Utilidad para validar datos de forma segura
export function validateData(schema, data) {
  try {
    const result = schema.safeParse(data);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: []
      };
    } else {
      return {
        success: false,
        data: null,
        errors: result.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      };
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: [{
        path: 'unknown',
        message: error.message,
        code: 'VALIDATION_ERROR'
      }]
    };
  }
}

// Utilidad para mostrar errores de validación
export function formatValidationErrors(errors) {
  if (!errors || errors.length === 0) {
    return '';
  }

  return errors
    .map(err => `• ${err.path}: ${err.message}`)
    .join('\n');
}

// Utilidad para validar un campo individual
export function validateField(schema, fieldName, value) {
  try {
    // Crear un esquema temporal solo para este campo
    const fieldSchema = schema.shape[fieldName];

    if (!fieldSchema) {
      return { isValid: true, error: null };
    }

    const result = fieldSchema.safeParse(value);

    if (result.success) {
      return {
        isValid: true,
        error: null,
        value: result.data
      };
    } else {
      return {
        isValid: false,
        error: result.error.errors[0].message,
        value
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: error.message,
      value
    };
  }
}
