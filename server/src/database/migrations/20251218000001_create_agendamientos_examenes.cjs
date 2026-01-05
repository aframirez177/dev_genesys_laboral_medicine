/**
 * SPRINT 8: Tabla de agendamientos de exámenes médicos
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('agendamientos_examenes', (table) => {
        table.increments('id').primary();
        
        // Relaciones
        table.integer('empresa_id').unsigned().notNullable()
            .references('id').inTable('empresas').onDelete('CASCADE');
        table.integer('cargo_id').unsigned()
            .references('id').inTable('cargos_documento').onDelete('SET NULL');
        table.integer('created_by').unsigned()
            .references('id').inTable('users').onDelete('SET NULL');
        
        // Datos del trabajador (nombre se captura al agendar)
        table.string('trabajador_nombre', 255).notNullable();
        table.string('cargo_nombre', 255);
        
        // Datos del examen
        table.string('examen_codigo', 20);
        table.string('examen_nombre', 255).notNullable();
        
        // Fechas
        table.date('fecha_examen').notNullable();
        table.date('fecha_vencimiento').notNullable();
        table.integer('periodicidad_meses').defaultTo(12);
        
        // Estado
        table.enum('estado', ['agendado', 'confirmado', 'completado', 'cancelado', 'vencido'])
            .defaultTo('agendado');
        
        // Notas
        table.text('observaciones');
        
        // Datos de sincronización con Google Sheets
        table.string('google_sheets_row_id', 100);
        table.timestamp('google_sheets_sync_at');
        
        // Timestamps
        table.timestamps(true, true);
        
        // Índices para búsquedas frecuentes
        table.index('empresa_id');
        table.index('estado');
        table.index('fecha_examen');
        table.index('fecha_vencimiento');
        table.index(['empresa_id', 'estado']);
        table.index(['empresa_id', 'fecha_vencimiento']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('agendamientos_examenes');
};




