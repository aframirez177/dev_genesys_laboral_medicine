/**
 * Script para verificar roles existentes en la base de datos
 */

import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function checkRoles() {
  try {
    console.log('🔍 Verificando roles en la base de datos...\n');

    const roles = await db('roles').select('*').orderBy('id');

    if (roles.length === 0) {
      console.log('❌ No hay roles en la base de datos');
      console.log('\n📝 Necesitas insertar los roles requeridos:');
      console.log('   - cliente_empresa');
      console.log('   - admin_genesys');
    } else {
      console.log(`✅ Roles encontrados (${roles.length}):\n`);
      roles.forEach(rol => {
        console.log(`   ID: ${rol.id} | Nombre: ${rol.nombre}`);
      });

      // Check if required roles exist
      const requiredRoles = ['cliente_empresa', 'admin_genesys'];
      const existingRoleNames = roles.map(r => r.nombre);
      const missingRoles = requiredRoles.filter(r => !existingRoleNames.includes(r));

      if (missingRoles.length > 0) {
        console.log('\n⚠️  Faltan los siguientes roles requeridos:');
        missingRoles.forEach(rol => {
          console.log(`   - ${rol}`);
        });
      } else {
        console.log('\n✅ Todos los roles requeridos están presentes');
      }
    }

  } catch (error) {
    console.error('❌ Error al consultar roles:', error.message);
  } finally {
    await db.destroy();
  }
}

checkRoles();
