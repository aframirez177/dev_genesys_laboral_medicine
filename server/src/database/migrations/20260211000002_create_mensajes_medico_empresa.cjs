/**
 * Migración: Sistema de mensajería entre médico y empresa
 *
 * Crea las tablas necesarias para comunicación asíncrona tipo correo
 * entre médicos ocupacionales y empresas asignadas.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Verificar si la tabla ya existe
    const hasConversaciones = await knex.schema.hasTable('conversaciones_medico_empresa');

    if (!hasConversaciones) {
        // Tabla de conversaciones (threads)
        await knex.schema.createTable('conversaciones_medico_empresa', (table) => {
            table.increments('id').primary();

            // Participantes de la conversación
            table.integer('medico_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE')
                .comment('ID del médico ocupacional');

            table.integer('empresa_id').unsigned().notNullable()
                .references('id').inTable('empresas').onDelete('CASCADE')
                .comment('ID de la empresa');

            // Opcional: asociar a un cargo específico
            table.integer('cargo_id').unsigned().nullable()
                .references('id').inTable('cargos_documento').onDelete('SET NULL')
                .comment('Si la conversación es sobre un cargo específico');

            // Metadata de la conversación
            table.string('asunto', 255).notNullable()
                .comment('Asunto de la conversación');

            table.enum('estado', ['abierta', 'cerrada']).defaultTo('abierta')
                .comment('Estado de la conversación');

            table.enum('iniciada_por', ['medico', 'empresa']).notNullable()
                .comment('Quién inició la conversación');

            // Contadores para optimizar queries
            table.integer('total_mensajes').unsigned().defaultTo(0);
            table.integer('mensajes_no_leidos_medico').unsigned().defaultTo(0);
            table.integer('mensajes_no_leidos_empresa').unsigned().defaultTo(0);

            // Timestamps
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
            table.timestamp('ultimo_mensaje_at').nullable()
                .comment('Fecha del último mensaje para ordenar');

            // Índices para búsquedas frecuentes
            table.index('medico_id', 'idx_conv_medico');
            table.index('empresa_id', 'idx_conv_empresa');
            table.index('cargo_id', 'idx_conv_cargo');
            table.index('estado', 'idx_conv_estado');
            table.index('ultimo_mensaje_at', 'idx_conv_ultimo_msg');

            // Índice compuesto para evitar duplicados
            table.unique(['medico_id', 'empresa_id', 'cargo_id', 'asunto'], {
                indexName: 'idx_conv_unique',
                useConstraint: true
            });
        });

        console.log('✅ Tabla conversaciones_medico_empresa creada');

        // Tabla de mensajes
        await knex.schema.createTable('mensajes_conversacion', (table) => {
            table.increments('id').primary();

            // Relación con la conversación
            table.integer('conversacion_id').unsigned().notNullable()
                .references('id').inTable('conversaciones_medico_empresa').onDelete('CASCADE')
                .comment('ID de la conversación a la que pertenece');

            // Remitente del mensaje
            table.integer('remitente_id').unsigned().notNullable()
                .references('id').inTable('users').onDelete('CASCADE')
                .comment('ID del usuario que envió el mensaje');

            table.enum('remitente_tipo', ['medico', 'empresa']).notNullable()
                .comment('Rol del remitente');

            // Contenido del mensaje
            table.text('contenido').notNullable()
                .comment('Texto del mensaje');

            // Estado de lectura
            table.boolean('leido').defaultTo(false)
                .comment('Si el destinatario ha leído el mensaje');

            table.timestamp('leido_at').nullable()
                .comment('Fecha en que se leyó el mensaje');

            // Timestamps
            table.timestamp('created_at').defaultTo(knex.fn.now());

            // Índices
            table.index('conversacion_id', 'idx_msg_conversacion');
            table.index('remitente_id', 'idx_msg_remitente');
            table.index(['leido', 'remitente_tipo'], 'idx_msg_no_leidos');
            table.index('created_at', 'idx_msg_fecha');
        });

        console.log('✅ Tabla mensajes_conversacion creada');

        // Trigger para actualizar updated_at en conversaciones (simulado con knex)
        // Nota: PostgreSQL no tiene triggers nativos en Knex, esto se manejará en la aplicación

    } else {
        console.log('ℹ️ Las tablas de mensajería ya existen');
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Eliminar en orden correcto por foreign keys
    await knex.schema.dropTableIfExists('mensajes_conversacion');
    await knex.schema.dropTableIfExists('conversaciones_medico_empresa');

    console.log('✅ Tablas de mensajería eliminadas');
};
