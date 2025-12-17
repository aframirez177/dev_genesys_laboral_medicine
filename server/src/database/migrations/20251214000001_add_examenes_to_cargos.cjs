/**
 * Migración: Agregar campos de exámenes médicos a cargos_documento
 * Sprint 6 - Sistema Multi-Rol - Editor de Profesiograma
 *
 * PROBLEMA: Los controllers medico/profesiograma.controller.js intentan
 * leer/escribir campos que NO EXISTEN en la tabla cargos_documento:
 * - examenes_ingreso
 * - examenes_periodicos
 * - examenes_retiro
 * - observaciones_medicas
 *
 * SOLUCIÓN: Agregar campos JSONB para almacenar arrays de exámenes
 * con estructura flexible pero validada en backend.
 *
 * ESTRUCTURA DE DATOS:
 * {
 *   "examenes_periodicos": [
 *     {
 *       "codigo": "AUDIO-001",
 *       "nombre": "Audiometría Tonal",
 *       "justificacion": "Exposición a ruido >85dB según GTC-45 zona producción",
 *       "periodicidad": "anual",
 *       "obligatorio": true
 *     }
 *   ]
 * }
 */

exports.up = async function(knex) {
    await knex.schema.alterTable('cargos_documento', (table) => {
        // Exámenes médicos por momento
        table.jsonb('examenes_ingreso')
            .defaultTo('[]')
            .comment('Exámenes pre-ocupacionales (al ingresar al cargo)');

        table.jsonb('examenes_periodicos')
            .defaultTo('[]')
            .comment('Exámenes periódicos según periodicidad (anual, semestral, etc.)');

        table.jsonb('examenes_retiro')
            .defaultTo('[]')
            .comment('Exámenes post-ocupacionales (al retirarse del cargo)');

        // Campos adicionales para médico especialista
        table.text('observaciones_medicas')
            .nullable()
            .comment('Observaciones del médico SST sobre el cargo');

        table.text('recomendaciones_ept')
            .nullable()
            .comment('Recomendaciones de EPT (Elementos de Protección y Trabajo)');

        table.string('justificacion_modificacion', 1000)
            .nullable()
            .comment('Justificación de última modificación de exámenes por médico');

        table.timestamp('fecha_ultima_modificacion_examenes')
            .nullable()
            .comment('Timestamp de última modificación de exámenes por médico');

        table.integer('modificado_por_medico_id')
            .unsigned()
            .nullable()
            .references('id')
            .inTable('users')
            .onDelete('SET NULL')
            .comment('ID del médico que realizó la última modificación');
    });

    // Índices GIN para búsqueda eficiente en JSONB
    // Permite queries como: WHERE examenes_periodicos @> '[{"nombre": "Audiometría"}]'
    await knex.raw(`
        CREATE INDEX idx_examenes_ingreso_gin
        ON cargos_documento USING GIN (examenes_ingreso);
    `);

    await knex.raw(`
        CREATE INDEX idx_examenes_periodicos_gin
        ON cargos_documento USING GIN (examenes_periodicos);
    `);

    await knex.raw(`
        CREATE INDEX idx_examenes_retiro_gin
        ON cargos_documento USING GIN (examenes_retiro);
    `);

    // Índice para búsqueda por médico modificador
    await knex.raw(`
        CREATE INDEX idx_cargos_modificado_por_medico
        ON cargos_documento (modificado_por_medico_id)
        WHERE modificado_por_medico_id IS NOT NULL;
    `);

    console.log('✅ Migración completada: Campos de exámenes médicos agregados a cargos_documento');
};

exports.down = async function(knex) {
    await knex.schema.alterTable('cargos_documento', (table) => {
        table.dropColumn('examenes_ingreso');
        table.dropColumn('examenes_periodicos');
        table.dropColumn('examenes_retiro');
        table.dropColumn('observaciones_medicas');
        table.dropColumn('recomendaciones_ept');
        table.dropColumn('justificacion_modificacion');
        table.dropColumn('fecha_ultima_modificacion_examenes');
        table.dropColumn('modificado_por_medico_id');
    });

    // Índices se eliminan automáticamente al eliminar columnas
    console.log('⏪ Rollback completado: Campos de exámenes médicos eliminados');
};
