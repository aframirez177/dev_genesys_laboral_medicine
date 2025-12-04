/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('plantillas_niveles_gtc45', (table) => {
      table.increments('id').primary();
      table.integer('empresa_id').unsigned().notNullable();
      table.string('categoria_riesgo', 50).notNullable(); // 'FISICO', 'MECANICO', etc.
      table.string('nombre_plantilla', 100).notNullable();

      // Niveles por defecto (JSON)
      table.jsonb('niveles_default').notNullable();
      // Estructura: { ND: 6, NE: 3, NC: 25 }

      // Justificación de los niveles
      table.text('justificacion');

      // Array de nombres de GES a los que aplica
      table.jsonb('aplica_a_ges').defaultTo('[]');

      // Condiciones de excepción (JSON)
      table.jsonb('condiciones_excepcion').defaultTo('{}');

      // Metadata
      table.integer('num_veces_aplicada').defaultTo(0);
      table.float('tasa_aceptacion').defaultTo(0); // % de veces que se aceptó sin modificar
      table.timestamps(true, true);

      // Índices
      table.index('empresa_id');
      table.index('categoria_riesgo');
      table.unique(['empresa_id', 'categoria_riesgo', 'nombre_plantilla']);
    })
    .createTable('plantillas_aplicaciones', (table) => {
      table.increments('id').primary();
      table.integer('plantilla_id').unsigned().references('id').inTable('plantillas_niveles_gtc45').onDelete('CASCADE');
      table.integer('ges_id').unsigned().notNullable();
      table.integer('cargo_id').unsigned().notNullable();

      // Niveles sugeridos por plantilla
      table.jsonb('niveles_sugeridos').notNullable();

      // Niveles finales (si el usuario ajustó)
      table.jsonb('niveles_finales');

      // ¿El usuario aceptó la sugerencia sin cambios?
      table.boolean('aceptado_sin_cambios').defaultTo(false);

      // Desviación porcentual (si hubo ajuste)
      table.float('desviacion_porcentual').defaultTo(0);

      // Justificación del ajuste (si la proveyó el usuario)
      table.text('justificacion_ajuste');

      table.timestamps(true, true);

      // Índices
      table.index('plantilla_id');
      table.index('ges_id');
      table.index('cargo_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('plantillas_aplicaciones')
    .dropTableIfExists('plantillas_niveles_gtc45');
};
