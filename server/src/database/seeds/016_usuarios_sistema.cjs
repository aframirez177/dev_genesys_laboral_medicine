/**
 * Seed: Crear usuarios del sistema
 * - 2 Administradores Genesys
 * - 2 Médicos Ocupacionales
 *
 * IMPORTANTE: Este seed solo inserta si los usuarios no existen
 */
const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
    console.log('🔐 Iniciando seed de usuarios del sistema...');

    // 1. Obtener IDs de roles
    const roles = await knex('roles').select('id', 'nombre');
    const rolesMap = {};
    roles.forEach(r => rolesMap[r.nombre] = r.id);

    console.log('📋 Roles encontrados:', Object.keys(rolesMap));

    // Verificar que existan los roles necesarios
    if (!rolesMap['admin_genesys']) {
        console.log('⚠️  Rol admin_genesys no encontrado. Ejecuta primero las migraciones.');
        return;
    }

    if (!rolesMap['medico_ocupacional']) {
        console.log('⚠️  Rol medico_ocupacional no encontrado. Ejecuta primero las migraciones.');
        return;
    }

    // 2. Definir usuarios a crear
    const usuarios = [
        // Administradores Genesys
        {
            full_name: 'Ruth Ramírez',
            email: 'ramirez.ruth.glm@gmail.com',
            password: 'G08071961',
            rol_nombre: 'admin_genesys',
            phone: null,
            company_name: 'Genesys Laboral Medicine'
        },
        {
            full_name: 'Alvaro Ramírez',
            email: 'ramirez.alvaro.glm@gmail.com',
            password: 'G01081992',
            rol_nombre: 'admin_genesys',
            phone: null,
            company_name: 'Genesys Laboral Medicine'
        },
        // Médicos Ocupacionales
        {
            full_name: 'Edison Plazas',
            email: 'plazas.edison.glm@gmail.com',
            password: 'E10181971',
            rol_nombre: 'medico_ocupacional',
            phone: null,
            company_name: 'Genesys Laboral Medicine',
            licencia_sst: 'MD-SST-001',
            especialidad: 'Medicina del Trabajo'
        },
        {
            full_name: 'Fernando Flores',
            email: 'flores.fernando.glm@gmail.com',
            password: 'G19031990',
            rol_nombre: 'medico_ocupacional',
            phone: null,
            company_name: 'Genesys Laboral Medicine',
            licencia_sst: 'MD-SST-002',
            especialidad: 'Medicina Ocupacional'
        }
    ];

    // 3. Insertar usuarios si no existen
    for (const usuario of usuarios) {
        const existe = await knex('users').where('email', usuario.email).first();

        if (existe) {
            console.log(`ℹ️  Usuario ${usuario.email} ya existe, saltando...`);
            continue;
        }

        // Hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(usuario.password, salt);

        // Preparar datos para insertar
        const userData = {
            full_name: usuario.full_name,
            email: usuario.email,
            password_hash: password_hash,
            phone: usuario.phone,
            company_name: usuario.company_name,
            rol_id: rolesMap[usuario.rol_nombre],
            empresa_id: null // Los admins y médicos no pertenecen a una empresa específica
        };

        // Agregar campos de médico si aplica
        if (usuario.licencia_sst) {
            userData.licencia_sst = usuario.licencia_sst;
        }
        if (usuario.especialidad) {
            userData.especialidad = usuario.especialidad;
        }

        await knex('users').insert(userData);
        console.log(`✅ Usuario creado: ${usuario.full_name} (${usuario.rol_nombre})`);
    }

    console.log('🎉 Seed de usuarios completado');
};
