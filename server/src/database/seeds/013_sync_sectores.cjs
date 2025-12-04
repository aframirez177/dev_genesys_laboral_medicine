/**
 * Seed: Sincronizar sectores económicos
 * 
 * Agrega los sectores faltantes a catalogo_sectores que estaban
 * en colombia-data.js pero no en la BD.
 * 
 * Sprint 6 - Consolidación de datos
 */

exports.seed = async function(knex) {
  // Sectores adicionales que NO estaban en la BD
  const sectoresFaltantes = [
    { codigo: 'pesca', nombre: 'Pesca', orden: 16 },
    { codigo: 'electricidad', nombre: 'Suministro de electricidad, gas y agua', orden: 17 },
    { codigo: 'financiero', nombre: 'Intermediación financiera', orden: 18 },
    { codigo: 'inmobiliario', nombre: 'Actividades inmobiliarias y de alquiler', orden: 19 },
    { codigo: 'administracion_publica', nombre: 'Administración pública y defensa', orden: 20 },
    { codigo: 'servicios_comunitarios', nombre: 'Servicios comunitarios, sociales y personales', orden: 21 },
    { codigo: 'telecomunicaciones', nombre: 'Telecomunicaciones', orden: 22 },
    { codigo: 'servicios_profesionales', nombre: 'Actividades profesionales y técnicas', orden: 23 },
    { codigo: 'entretenimiento', nombre: 'Actividades artísticas y de entretenimiento', orden: 24 },
    { codigo: 'alimentos', nombre: 'Industria de alimentos y bebidas', orden: 25 },
    { codigo: 'textil', nombre: 'Industria textil y confecciones', orden: 26 },
    { codigo: 'quimico', nombre: 'Industria química y farmacéutica', orden: 27 },
    { codigo: 'plasticos', nombre: 'Industria del plástico y caucho', orden: 28 },
    { codigo: 'madera', nombre: 'Industria maderera y papelera', orden: 29 },
    { codigo: 'otro', nombre: 'Otro sector', orden: 99 }
  ];

  // Insertar solo si no existe (ON CONFLICT DO NOTHING)
  for (const sector of sectoresFaltantes) {
    const existe = await knex('catalogo_sectores')
      .where('codigo', sector.codigo)
      .first();
    
    if (!existe) {
      await knex('catalogo_sectores').insert(sector);
      console.log(`✅ Agregado sector: ${sector.nombre}`);
    } else {
      console.log(`⏭️  Sector ya existe: ${sector.nombre}`);
    }
  }

  // Mostrar total final
  const total = await knex('catalogo_sectores').count('id as count').first();
  console.log(`📊 Total sectores en BD: ${total.count}`);
};

