/**
 * Migration: Agregar ges_id a riesgos_cargo y crear índices adicionales
 *
 * Modifica:
 * - riesgos_cargo: Agrega columna ges_id (referencia a catalogo_ges)
 * - Crea índices para queries frecuentes
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .alterTable('riesgos_cargo', function(table) {
      // Nueva columna ges_id para referenciar el catálogo de GES
      table.integer('ges_id')
        .unsigned()
        .nullable() // Nullable por compatibilidad con datos existentes
        .references('id')
        .inTable('catalogo_ges')
        .onDelete('SET NULL');

      table.comment('Referencia al GES del catálogo (nueva arquitectura)');
    })
    .then(function() {
      // Crear índices para optimización de queries
      return knex.raw(`
        -- Índice para búsquedas por GES en riesgos_cargo
        CREATE INDEX idx_riesgos_cargo_ges_id ON riesgos_cargo(ges_id) WHERE ges_id IS NOT NULL;

        -- Índice adicional para token en documentos_generados (para lookups por URL)
        -- (Ya existe unique constraint, pero este optimiza WHERE token = ?)
        CREATE INDEX IF NOT EXISTS idx_documentos_token ON documentos_generados(token) WHERE token IS NOT NULL;

        -- Índice para consultas por cargo_id (muy frecuente)
        CREATE INDEX IF NOT EXISTS idx_riesgos_cargo_cargo_id ON riesgos_cargo(cargo_id);
      `);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
    DROP INDEX IF EXISTS idx_riesgos_cargo_ges_id;
    DROP INDEX IF EXISTS idx_documentos_token;
    DROP INDEX IF EXISTS idx_riesgos_cargo_cargo_id;
  `)
  .then(function() {
    return knex.schema.alterTable('riesgos_cargo', function(table) {
      table.dropColumn('ges_id');
    });
  });
};
