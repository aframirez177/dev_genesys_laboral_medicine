/**
 * Seed: Áreas Similares (Mappings)
 * Sprint 6 - Fase J - Mejoras IA
 *
 * Mapeo de áreas organizacionales similares para
 * sugerir riesgos de áreas relacionadas.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log('🔗 [SEED] Insertando mapeo de áreas similares...');

  const tableExists = await knex.schema.hasTable('areas_similares');
  if (!tableExists) {
    console.log('⚠️  Tabla areas_similares no existe. Ejecute primero la migración.');
    return;
  }

  await knex('areas_similares').del();

  const mappings = [
    // =============================================
    // ÁREA ADMINISTRATIVA Y RELACIONADAS
    // =============================================
    { area_principal: 'ADMINISTRATIVA', area_relacionada: 'CONTABILIDAD', similarity_score: 0.95, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'ADMINISTRATIVA', area_relacionada: 'FINANZAS', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'ADMINISTRATIVA', area_relacionada: 'RECURSOS HUMANOS', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'ADMINISTRATIVA', area_relacionada: 'COMPRAS', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'ADMINISTRATIVA', area_relacionada: 'LEGAL', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'ADMINISTRATIVA', area_relacionada: 'DIRECCIÓN', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Contabilidad
    { area_principal: 'CONTABILIDAD', area_relacionada: 'FINANZAS', similarity_score: 0.95, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'CONTABILIDAD', area_relacionada: 'ADMINISTRATIVA', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'CONTABILIDAD', area_relacionada: 'COMPRAS', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Finanzas
    { area_principal: 'FINANZAS', area_relacionada: 'CONTABILIDAD', similarity_score: 0.95, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'FINANZAS', area_relacionada: 'ADMINISTRATIVA', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // RRHH
    { area_principal: 'RECURSOS HUMANOS', area_relacionada: 'ADMINISTRATIVA', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'RECURSOS HUMANOS', area_relacionada: 'SST', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Dirección
    { area_principal: 'DIRECCIÓN', area_relacionada: 'ADMINISTRATIVA', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'DIRECCIÓN', area_relacionada: 'FINANZAS', similarity_score: 0.70, puede_copiar_riesgos: true, mapping_type: 'manual' },

    // =============================================
    // ÁREA OPERATIVA Y RELACIONADAS
    // =============================================
    { area_principal: 'OPERATIVA', area_relacionada: 'PRODUCCIÓN', similarity_score: 0.95, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'OPERATIVA', area_relacionada: 'MANTENIMIENTO', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'OPERATIVA', area_relacionada: 'LOGÍSTICA', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'OPERATIVA', area_relacionada: 'CALIDAD', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Producción
    { area_principal: 'PRODUCCIÓN', area_relacionada: 'OPERATIVA', similarity_score: 0.95, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'PRODUCCIÓN', area_relacionada: 'MANTENIMIENTO', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'PRODUCCIÓN', area_relacionada: 'CALIDAD', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'PRODUCCIÓN', area_relacionada: 'LOGÍSTICA', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Mantenimiento
    { area_principal: 'MANTENIMIENTO', area_relacionada: 'PRODUCCIÓN', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'MANTENIMIENTO', area_relacionada: 'OPERATIVA', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'MANTENIMIENTO', area_relacionada: 'INGENIERÍA', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Logística
    { area_principal: 'LOGÍSTICA', area_relacionada: 'OPERATIVA', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'LOGÍSTICA', area_relacionada: 'PRODUCCIÓN', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'LOGÍSTICA', area_relacionada: 'COMPRAS', similarity_score: 0.70, puede_copiar_riesgos: false, mapping_type: 'manual' },

    // =============================================
    // ÁREA COMERCIAL Y RELACIONADAS
    // =============================================
    { area_principal: 'COMERCIAL', area_relacionada: 'VENTAS', similarity_score: 0.95, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'COMERCIAL', area_relacionada: 'MARKETING', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'COMERCIAL', area_relacionada: 'SERVICIO', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'COMERCIAL', area_relacionada: 'TRADE', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Ventas
    { area_principal: 'VENTAS', area_relacionada: 'COMERCIAL', similarity_score: 0.95, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'VENTAS', area_relacionada: 'MARKETING', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'VENTAS', area_relacionada: 'SERVICIO', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'VENTAS', area_relacionada: 'TRADE', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Marketing
    { area_principal: 'MARKETING', area_relacionada: 'COMERCIAL', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'MARKETING', area_relacionada: 'VENTAS', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'MARKETING', area_relacionada: 'DISEÑO', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Servicio al Cliente
    { area_principal: 'SERVICIO', area_relacionada: 'COMERCIAL', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'SERVICIO', area_relacionada: 'VENTAS', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Trade Marketing / Retail
    { area_principal: 'TRADE', area_relacionada: 'VENTAS', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'TRADE', area_relacionada: 'COMERCIAL', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'TRADE', area_relacionada: 'LOGÍSTICA', similarity_score: 0.70, puede_copiar_riesgos: false, mapping_type: 'manual' },
    
    { area_principal: 'RETAIL', area_relacionada: 'COMERCIAL', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'RETAIL', area_relacionada: 'VENTAS', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'RETAIL', area_relacionada: 'SERVICIO', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },

    // =============================================
    // ÁREA TÉCNICA Y RELACIONADAS
    // =============================================
    { area_principal: 'TÉCNICA', area_relacionada: 'INGENIERÍA', similarity_score: 0.95, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'TÉCNICA', area_relacionada: 'TECNOLOGÍA', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'TÉCNICA', area_relacionada: 'CALIDAD', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'TÉCNICA', area_relacionada: 'MANTENIMIENTO', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Ingeniería
    { area_principal: 'INGENIERÍA', area_relacionada: 'TÉCNICA', similarity_score: 0.95, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'INGENIERÍA', area_relacionada: 'PROYECTOS', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'INGENIERÍA', area_relacionada: 'MANTENIMIENTO', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'INGENIERÍA', area_relacionada: 'CALIDAD', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Tecnología / IT
    { area_principal: 'TECNOLOGÍA', area_relacionada: 'TÉCNICA', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'TECNOLOGÍA', area_relacionada: 'INGENIERÍA', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'TECNOLOGÍA', area_relacionada: 'DISEÑO', similarity_score: 0.70, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    // Diseño
    { area_principal: 'DISEÑO', area_relacionada: 'TECNOLOGÍA', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'DISEÑO', area_relacionada: 'MARKETING', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'DISEÑO', area_relacionada: 'INGENIERÍA', similarity_score: 0.70, puede_copiar_riesgos: true, mapping_type: 'manual' },

    // =============================================
    // ÁREA DE SALUD Y RELACIONADAS
    // =============================================
    { area_principal: 'ASISTENCIAL', area_relacionada: 'OCUPACIONAL', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'ASISTENCIAL', area_relacionada: 'LABORATORIO', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'ASISTENCIAL', area_relacionada: 'FARMACIA', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'ASISTENCIAL', area_relacionada: 'IMÁGENES', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    { area_principal: 'OCUPACIONAL', area_relacionada: 'ASISTENCIAL', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'OCUPACIONAL', area_relacionada: 'SST', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    { area_principal: 'LABORATORIO', area_relacionada: 'ASISTENCIAL', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'LABORATORIO', area_relacionada: 'IMÁGENES', similarity_score: 0.70, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    { area_principal: 'QUIRÚRGICA', area_relacionada: 'ASISTENCIAL', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },

    // =============================================
    // CONSTRUCCIÓN Y RELACIONADAS
    // =============================================
    { area_principal: 'CONSTRUCCIÓN', area_relacionada: 'OPERATIVA', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'CONSTRUCCIÓN', area_relacionada: 'MANTENIMIENTO', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'CONSTRUCCIÓN', area_relacionada: 'INGENIERÍA', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },

    // =============================================
    // TRANSPORTE Y RELACIONADAS
    // =============================================
    { area_principal: 'CARGA', area_relacionada: 'LOGÍSTICA', similarity_score: 0.90, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'CARGA', area_relacionada: 'MENSAJERÍA', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    { area_principal: 'PASAJEROS', area_relacionada: 'CARGA', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    { area_principal: 'MENSAJERÍA', area_relacionada: 'LOGÍSTICA', similarity_score: 0.85, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'MENSAJERÍA', area_relacionada: 'CARGA', similarity_score: 0.80, puede_copiar_riesgos: true, mapping_type: 'manual' },

    // =============================================
    // SERVICIOS Y RELACIONADAS
    // =============================================
    { area_principal: 'SERVICIOS', area_relacionada: 'OPERATIVA', similarity_score: 0.70, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'SERVICIOS', area_relacionada: 'ADMINISTRATIVA', similarity_score: 0.65, puede_copiar_riesgos: false, mapping_type: 'manual' },
    
    { area_principal: 'SEGURIDAD', area_relacionada: 'SERVICIOS', similarity_score: 0.70, puede_copiar_riesgos: true, mapping_type: 'manual' },
    
    { area_principal: 'COCINA', area_relacionada: 'SERVICIOS', similarity_score: 0.75, puede_copiar_riesgos: true, mapping_type: 'manual' },
    { area_principal: 'COCINA', area_relacionada: 'OPERATIVA', similarity_score: 0.70, puede_copiar_riesgos: true, mapping_type: 'manual' },
  ];

  await knex('areas_similares').insert(mappings);

  console.log(`✅ [SEED] Insertados ${mappings.length} mapeos de áreas similares.`);
};

