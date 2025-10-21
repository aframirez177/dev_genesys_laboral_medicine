/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sesiones', function(table) {
    // El WhatsApp ID del usuario (ej: '573001234567')
    table.string('whatsapp_id', 100).primary();
    
    // El historial completo en formato JSON
    table.jsonb('historial_chat').nullable();
    
    // 'INICIO', 'COTIZANDO', 'SOPORTE', 'SEGUIMIENTO'
    table.string('estado', 100).nullable();
    
    // Datos extra (nombre, email, contador_fallos)
    table.jsonb('variables_sesion').nullable();
    
    table.timestamp('timestamp_ultimo_mensaje').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('sesiones');
};