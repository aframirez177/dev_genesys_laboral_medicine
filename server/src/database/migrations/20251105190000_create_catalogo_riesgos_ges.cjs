/**
 * Migration: Catálogos de Riesgos y GES
 *
 * Crea las tablas para el sistema de catálogos:
 * - catalogo_riesgos: 9 categorías de riesgo (GTC-45-2012)
 * - catalogo_sectores: Sectores económicos
 * - catalogo_ges: 92 GES (Grupos de Exposición Similar)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 1. Tabla de categorías de riesgo (GTC-45-2012)
    .createTable('catalogo_riesgos', function(table) {
      table.increments('id').primary();

      // Código único: 'RF', 'RB', 'RQ', 'RBL', 'CS', 'RPS', 'RT', 'RFN'
      table.string('codigo', 10).notNullable().unique();
      table.comment('Código único del riesgo (ej: RF=Físico, RB=Biomecánico)');

      // Nombre descriptivo: 'Riesgo Físico', 'Riesgo Biomecánico', etc.
      table.string('nombre', 100).notNullable();

      // Para ordenar en el frontend
      table.integer('orden').notNullable().defaultTo(0);

      // Soft delete
      table.boolean('activo').notNullable().defaultTo(true);

      table.timestamps(true, true);
    })

    // 2. Tabla de sectores económicos
    .createTable('catalogo_sectores', function(table) {
      table.increments('id').primary();

      // Código: 'construccion', 'manufactura', 'oficina', etc.
      table.string('codigo', 50).notNullable().unique();

      // Nombre: 'Construcción', 'Manufactura', 'Oficina', etc.
      table.string('nombre', 100).notNullable();

      // Descripción opcional
      table.text('descripcion').nullable();

      // Orden para mostrar en UI
      table.integer('orden').notNullable().defaultTo(0);

      table.boolean('activo').notNullable().defaultTo(true);

      table.timestamps(true, true);
    })

    // 3. Tabla principal de GES (Grupos de Exposición Similar)
    .createTable('catalogo_ges', function(table) {
      table.increments('id').primary();

      // Relación con categoría de riesgo
      table.integer('riesgo_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('catalogo_riesgos')
        .onDelete('CASCADE');

      // Nombre del GES: 'Ruido (continuo, intermitente, impacto)'
      table.string('nombre', 200).notNullable();

      // Código único opcional: 'RF-RUIDO-001'
      table.string('codigo', 50).nullable().unique();

      // Consecuencias del riesgo
      table.text('consecuencias').nullable();

      // Peor consecuencia posible
      table.text('peor_consecuencia').nullable();

      // Exámenes médicos requeridos - JSONB
      // Estructura: { "AUD": 1, "OPTO": 1, "EMO": 2 }
      // 1 = obligatorio/fundamental, 2 = complementario
      table.jsonb('examenes_medicos').nullable();

      // Aptitudes requeridas - JSONB array
      // Estructura: ["Buena agudeza visual", "Coordinación motriz"]
      table.jsonb('aptitudes_requeridas').nullable();

      // Condiciones médicas incompatibles - JSONB array
      // Estructura: ["Vértigo o mareos crónicos", "Epilepsia no controlada"]
      table.jsonb('condiciones_incompatibles').nullable();

      // EPP sugeridos - JSONB array
      // Estructura: ["Protectores auditivos", "Casco de seguridad"]
      table.jsonb('epp_sugeridos').nullable();

      // Medidas de intervención - JSONB object
      // Estructura: {
      //   "eliminacion": "texto",
      //   "sustitucion": "texto",
      //   "controlesIngenieria": "texto",
      //   "controlesAdministrativos": "texto"
      // }
      table.jsonb('medidas_intervencion').nullable();

      // Relevancia por sector económico - JSONB object
      // Estructura: { "construccion": 10, "manufactura": 8, "oficina": 1 }
      // Escala 1-10: 10=muy relevante, 1=poco relevante
      table.jsonb('relevancia_por_sector').nullable();

      // Vector de búsqueda para Full-Text Search
      table.specificType('nombre_tsvector', 'tsvector').nullable();

      // Top 10 GES más comunes (para sugerencias)
      table.boolean('es_comun').notNullable().defaultTo(false);

      // Orden de aparición en listas
      table.integer('orden').notNullable().defaultTo(0);

      // Soft delete
      table.boolean('activo').notNullable().defaultTo(true);

      table.timestamps(true, true);
    })

    // 4. Crear índices
    .then(function() {
      return knex.raw(`
        -- Índice GIN para consultas rápidas en relevancia_por_sector
        CREATE INDEX idx_ges_relevancia_sector
        ON catalogo_ges USING GIN (relevancia_por_sector);

        -- Índice GIN para Full-Text Search en nombre
        CREATE INDEX idx_ges_nombre_tsvector
        ON catalogo_ges USING GIN (nombre_tsvector);

        -- Trigger para actualizar nombre_tsvector automáticamente
        CREATE OR REPLACE FUNCTION catalogo_ges_tsvector_update()
        RETURNS trigger AS $$
        BEGIN
          NEW.nombre_tsvector := to_tsvector('spanish', coalesce(NEW.nombre, ''));
          RETURN NEW;
        END
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER tsvector_update_catalogo_ges
        BEFORE INSERT OR UPDATE ON catalogo_ges
        FOR EACH ROW EXECUTE FUNCTION catalogo_ges_tsvector_update();

        -- Índices para queries frecuentes
        CREATE INDEX idx_ges_riesgo_id ON catalogo_ges(riesgo_id);
        CREATE INDEX idx_ges_activo ON catalogo_ges(activo);
        CREATE INDEX idx_ges_es_comun ON catalogo_ges(es_comun) WHERE es_comun = true;
        CREATE INDEX idx_riesgos_activo ON catalogo_riesgos(activo);
      `);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw(`
    -- Eliminar trigger y función
    DROP TRIGGER IF EXISTS tsvector_update_catalogo_ges ON catalogo_ges;
    DROP FUNCTION IF EXISTS catalogo_ges_tsvector_update();
  `)
  .then(function() {
    return knex.schema
      .dropTableIfExists('catalogo_ges')
      .dropTableIfExists('catalogo_sectores')
      .dropTableIfExists('catalogo_riesgos');
  });
};
