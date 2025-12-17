/**
 * Migración: Extender sistema de roles
 * - Agregar campos descripcion, permisos JSONB, activo, timestamps
 * - Insertar rol medico_ocupacional
 * - Actualizar roles existentes con permisos
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // 1. Verificar si las columnas ya existen antes de agregarlas
    const hasDescripcion = await knex.schema.hasColumn('roles', 'descripcion');
    const hasPermisos = await knex.schema.hasColumn('roles', 'permisos');
    const hasActivo = await knex.schema.hasColumn('roles', 'activo');
    const hasCreatedAt = await knex.schema.hasColumn('roles', 'created_at');

    // 2. Agregar columnas faltantes
    await knex.schema.alterTable('roles', (table) => {
        if (!hasDescripcion) {
            table.text('descripcion');
        }
        if (!hasPermisos) {
            table.jsonb('permisos').defaultTo('{}');
        }
        if (!hasActivo) {
            table.boolean('activo').defaultTo(true);
        }
        if (!hasCreatedAt) {
            table.timestamps(true, true);
        }
    });

    // 3. Verificar si rol medico_ocupacional ya existe
    const medicoRol = await knex('roles').where('nombre', 'medico_ocupacional').first();

    if (!medicoRol) {
        await knex('roles').insert({
            nombre: 'medico_ocupacional',
            descripcion: 'Médico especialista en SST asignado a empresas',
            permisos: JSON.stringify({
                empresas_asignadas: true,
                profesiograma: 'full',
                examenes_cargo: true,
                firma_digital: true,
                aprobar_profesiogramas: true,
                configuracion: 'own'
            }),
            activo: true
        });
    }

    // 4. Actualizar permisos de admin_genesys
    await knex('roles')
        .where('nombre', 'admin_genesys')
        .update({
            descripcion: 'Administrador interno de Genesys',
            permisos: JSON.stringify({
                gestion_pagos: true,
                asignar_medicos: true,
                cargar_condiciones_salud: true,
                gestion_empresas: true,
                auditoria: true,
                configuracion: 'all',
                ver_todas_empresas: true
            })
        });

    // 5. Actualizar permisos de cliente_empresa
    await knex('roles')
        .where('nombre', 'cliente_empresa')
        .update({
            descripcion: 'Usuario de empresa cliente de Genesys',
            permisos: JSON.stringify({
                dashboard: true,
                mapa_org: true,
                cargos: true,
                matriz_gtc45: true,
                profesiograma: 'readonly',
                examenes: true,
                inteligencia_salud: true,
                estadisticas: true,
                sve: true,
                documentos: true,
                configuracion: 'own'
            })
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Eliminar rol médico
    await knex('roles').where('nombre', 'medico_ocupacional').del();

    // Remover columnas agregadas
    await knex.schema.alterTable('roles', (table) => {
        table.dropColumn('descripcion');
        table.dropColumn('permisos');
        table.dropColumn('activo');
        table.dropColumn('created_at');
        table.dropColumn('updated_at');
    });
};
