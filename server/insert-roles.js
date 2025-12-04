/**
 * Script para insertar roles requeridos en la base de datos
 */

import db from './src/config/database.js';

async function insertRoles() {
  try {
    console.log('🔧 Insertando roles requeridos en la base de datos...\n');

    const requiredRoles = [
      { nombre: 'cliente_empresa' },
      { nombre: 'admin_genesys' }
    ];

    for (const rol of requiredRoles) {
      // Verificar si ya existe
      const existing = await db('roles').where({ nombre: rol.nombre }).first();

      if (existing) {
        console.log(`⏭️  Rol "${rol.nombre}" ya existe (ID: ${existing.id})`);
      } else {
        const [inserted] = await db('roles').insert(rol).returning('*');
        console.log(`✅ Rol "${rol.nombre}" insertado exitosamente (ID: ${inserted.id})`);
      }
    }

    console.log('\n✅ Proceso completado');
    console.log('\n📋 Roles finales en la base de datos:');
    const allRoles = await db('roles').select('*').orderBy('id');
    allRoles.forEach(rol => {
      console.log(`   ID: ${rol.id} | Nombre: ${rol.nombre}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

insertRoles();
