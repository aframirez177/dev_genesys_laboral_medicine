/**
 * Joi Validation Schemas for Profesiograma
 * Sprint 6 - Sistema Multi-Rol
 *
 * Valida estructura de exámenes médicos según Resolución 2346/2007
 * y Decreto 1072/2015 (Colombia - SST)
 */

import Joi from 'joi';

// ==========================================
// SCHEMA: Examen Médico Individual
// ==========================================

/**
 * Schema para un examen médico individual
 * Estructura usada en examenes_ingreso, examenes_periodicos, examenes_retiro
 */
export const examenSchema = Joi.object({
    codigo: Joi.string()
        .max(50)
        .optional()
        .description('Código del examen (ej: AUDIO-001, VISI-002)'),

    nombre: Joi.string()
        .min(3)
        .max(200)
        .required()
        .description('Nombre del examen médico (ej: Audiometría Tonal, Visiometría)'),

    justificacion: Joi.string()
        .min(20)
        .max(1000)
        .required()
        .description('Justificación técnica según factores de riesgo identificados en matriz GTC-45'),

    periodicidad: Joi.string()
        .valid('unico', 'mensual', 'trimestral', 'semestral', 'anual', 'bienal', 'trienal')
        .required()
        .description('Periodicidad del examen según nivel de riesgo y normativa SST'),

    obligatorio: Joi.boolean()
        .default(true)
        .description('Indica si el examen es obligatorio según normativa o recomendado'),

    normativa_aplicable: Joi.string()
        .max(500)
        .optional()
        .description('Normativa SST que sustenta el examen (ej: Res. 2346/2007 Art. 3)')
}).meta({
    className: 'ExamenMedico'
});

// ==========================================
// SCHEMA: Arrays de Exámenes por Momento
// ==========================================

/**
 * Schema para array de exámenes de ingreso (pre-ocupacionales)
 * Aplica Resolución 2346/2007 - Exámenes de ingreso
 */
export const examenesIngresoSchema = Joi.array()
    .items(examenSchema)
    .default([])
    .description('Exámenes pre-ocupacionales (obligatorios al ingresar al cargo)');

/**
 * Schema para array de exámenes periódicos
 * Aplica Resolución 2346/2007 Art. 3 - Exámenes periódicos
 */
export const examenesPeriodicosSchema = Joi.array()
    .items(examenSchema)
    .min(1) // Al menos UN examen periódico es obligatorio por normativa
    .default([])
    .description('Exámenes periódicos según periodicidad y nivel de riesgo');

/**
 * Schema para array de exámenes de retiro (post-ocupacionales)
 * Aplica Resolución 2346/2007 - Exámenes de egreso
 */
export const examenesRetiroSchema = Joi.array()
    .items(examenSchema)
    .default([])
    .description('Exámenes post-ocupacionales (obligatorios al retirarse del cargo)');

// ==========================================
// SCHEMA: Actualización de Exámenes
// ==========================================

/**
 * Schema para solicitud de actualización de exámenes médicos
 * Usado por médico ocupacional para modificar profesiograma
 */
export const updateExamenesRequestSchema = Joi.object({
    cargo_id: Joi.number()
        .integer()
        .positive()
        .required()
        .description('ID del cargo a modificar'),

    examenes_ingreso: examenesIngresoSchema.optional(),

    examenes_periodicos: examenesPeriodicosSchema.optional(),

    examenes_retiro: examenesRetiroSchema.optional(),

    observaciones_medicas: Joi.string()
        .max(2000)
        .allow('', null)
        .optional()
        .description('Observaciones del médico SST sobre el cargo'),

    recomendaciones_ept: Joi.string()
        .max(2000)
        .allow('', null)
        .optional()
        .description('Recomendaciones de EPT (Elementos de Protección y Trabajo)'),

    justificacion_modificacion: Joi.string()
        .min(20)
        .max(1000)
        .required()
        .description('Justificación de la modificación (obligatoria para auditoría)'),

    medico_id: Joi.number()
        .integer()
        .positive()
        .required()
        .description('ID del médico que realiza la modificación')
}).min(2) // Al menos un campo de exámenes + justificación
    .meta({
        className: 'UpdateExamenesRequest'
    });

// ==========================================
// SCHEMA: Crear Cargo con Exámenes
// ==========================================

/**
 * Schema para creación de cargo con exámenes médicos completos
 */
export const createCargoWithExamenesSchema = Joi.object({
    nombre_cargo: Joi.string()
        .min(3)
        .max(200)
        .required(),

    descripcion_cargo: Joi.string()
        .max(1000)
        .optional(),

    examenes_ingreso: examenesIngresoSchema.required(),

    examenes_periodicos: examenesPeriodicosSchema.required(),

    examenes_retiro: examenesRetiroSchema.required(),

    observaciones_medicas: Joi.string()
        .max(2000)
        .optional(),

    recomendaciones_ept: Joi.string()
        .max(2000)
        .optional()
});

// ==========================================
// HELPERS: Mensajes de Error en Español
// ==========================================

/**
 * Configuración de mensajes de error en español
 */
export const validationMessages = {
    'string.base': 'El campo debe ser texto',
    'string.empty': 'El campo no puede estar vacío',
    'string.min': 'El campo debe tener al menos {#limit} caracteres',
    'string.max': 'El campo no puede exceder {#limit} caracteres',
    'number.base': 'El campo debe ser un número',
    'number.positive': 'El campo debe ser un número positivo',
    'array.min': 'Debe incluir al menos {#limit} examen(es)',
    'any.required': 'Este campo es obligatorio',
    'any.only': 'El valor debe ser uno de: {#valids}'
};

/**
 * Opciones por defecto para validación Joi
 */
export const defaultJoiOptions = {
    abortEarly: false, // Devolver TODOS los errores, no solo el primero
    messages: validationMessages,
    stripUnknown: true // Eliminar campos no definidos en el schema
};

// ==========================================
// FUNCIÓN HELPER: Validar y Formatear Errores
// ==========================================

/**
 * Valida un objeto contra un schema y devuelve errores formateados
 *
 * @param {Object} data - Datos a validar
 * @param {Joi.Schema} schema - Schema Joi
 * @returns {Object} { isValid: boolean, errors: Array, value: Object }
 */
export function validateSchema(data, schema) {
    const { error, value } = schema.validate(data, defaultJoiOptions);

    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            type: detail.type
        }));

        return {
            isValid: false,
            errors,
            value: null
        };
    }

    return {
        isValid: true,
        errors: [],
        value
    };
}
