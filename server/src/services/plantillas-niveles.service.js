import db from '../config/database.js';

/**
 * Servicio de Plantillas de Niveles GTC-45
 * Gestiona plantillas de valoración de riesgos para auto-sugerencias inteligentes
 */
class PlantillasNivelesService {

  /**
   * Crear una nueva plantilla
   */
  async crearPlantilla(empresaId, plantillaData) {
    const { categoriaRiesgo, nombrePlantilla, nivelesDefault, justificacion, aplicaAGes, condicionesExcepcion } = plantillaData;

    // Validar niveles GTC-45
    this.validarNiveles(nivelesDefault);

    const plantilla = await db('plantillas_niveles_gtc45').insert({
      empresa_id: empresaId,
      categoria_riesgo: categoriaRiesgo,
      nombre_plantilla: nombrePlantilla,
      niveles_default: JSON.stringify(nivelesDefault),
      justificacion,
      aplica_a_ges: JSON.stringify(aplicaAGes || []),
      condiciones_excepcion: JSON.stringify(condicionesExcepcion || {}),
      num_veces_aplicada: 0,
      tasa_aceptacion: 0
    }).returning('*');

    return plantilla[0];
  }

  /**
   * Crear plantillas por defecto para una empresa (primera vez)
   */
  async crearPlantillasDefault(empresaId) {
    const plantillasDefault = [
      {
        categoriaRiesgo: 'FISICO',
        nombrePlantilla: 'Riesgos Físicos - Estándar',
        nivelesDefault: { ND: 6, NE: 3, NC: 25 },
        justificacion: 'Controles típicos de riesgos físicos en manufactura',
        aplicaAGes: ['Ruido', 'Vibración', 'Temperaturas extremas', 'Iluminación', 'Radiación']
      },
      {
        categoriaRiesgo: 'MECANICO',
        nombrePlantilla: 'Riesgos Mecánicos - Estándar',
        nivelesDefault: { ND: 10, NE: 3, NC: 60 },
        justificacion: 'Riesgos mecánicos requieren alta prioridad',
        aplicaAGes: ['Caídas', 'Golpes', 'Atrapamiento', 'Proyección de partículas']
      },
      {
        categoriaRiesgo: 'QUIMICO',
        nombrePlantilla: 'Riesgos Químicos - Estándar',
        nivelesDefault: { ND: 6, NE: 2, NC: 60 },
        justificacion: 'Exposición química con controles básicos',
        aplicaAGes: ['Gases', 'Vapores', 'Polvos', 'Líquidos', 'Humos']
      },
      {
        categoriaRiesgo: 'BIOLOGICO',
        nombrePlantilla: 'Riesgos Biológicos - Estándar',
        nivelesDefault: { ND: 6, NE: 3, NC: 25 },
        justificacion: 'Exposición a agentes biológicos',
        aplicaAGes: ['Virus', 'Bacterias', 'Hongos', 'Fluidos corporales']
      },
      {
        categoriaRiesgo: 'PSICOSOCIAL',
        nombrePlantilla: 'Riesgos Psicosociales - Estándar',
        nivelesDefault: { ND: 2, NE: 4, NC: 10 },
        justificacion: 'Factores psicosociales habituales',
        aplicaAGes: ['Estrés', 'Carga mental', 'Trabajo nocturno', 'Acoso']
      },
      {
        categoriaRiesgo: 'ERGONOMICO',
        nombrePlantilla: 'Riesgos Ergonómicos - Estándar',
        nivelesDefault: { ND: 6, NE: 4, NC: 25 },
        justificacion: 'Exposición ergonómica continua',
        aplicaAGes: ['Posturas', 'Movimientos repetitivos', 'Manipulación de cargas']
      },
      {
        categoriaRiesgo: 'ELECTRICO',
        nombrePlantilla: 'Riesgos Eléctricos - Estándar',
        nivelesDefault: { ND: 10, NE: 2, NC: 100 },
        justificacion: 'Alta consecuencia, baja exposición con controles',
        aplicaAGes: ['Alta tensión', 'Baja tensión', 'Electricidad estática', 'Arco eléctrico']
      },
      {
        categoriaRiesgo: 'LOCATIVO',
        nombrePlantilla: 'Riesgos Locativos - Estándar',
        nivelesDefault: { ND: 6, NE: 3, NC: 25 },
        justificacion: 'Condiciones locativas típicas',
        aplicaAGes: ['Piso resbaladizo', 'Escaleras', 'Almacenamiento', 'Trabajo en alturas']
      }
    ];

    const plantillasCreadas = [];
    for (const plantilla of plantillasDefault) {
      const created = await this.crearPlantilla(empresaId, plantilla);
      plantillasCreadas.push(created);
    }

    return plantillasCreadas;
  }

  /**
   * Obtener plantillas de una empresa
   */
  async obtenerPlantillas(empresaId) {
    const plantillas = await db('plantillas_niveles_gtc45')
      .where('empresa_id', empresaId)
      .orderBy('categoria_riesgo', 'asc');

    return plantillas.map(p => ({
      ...p,
      niveles_default: JSON.parse(p.niveles_default),
      aplica_a_ges: JSON.parse(p.aplica_a_ges),
      condiciones_excepcion: JSON.parse(p.condiciones_excepcion)
    }));
  }

  /**
   * Sugerir niveles para un array de GES basándose en plantillas
   */
  async sugerirNivelesParaGES(empresaId, gesArray) {
    const plantillas = await this.obtenerPlantillas(empresaId);

    if (plantillas.length === 0) {
      // No hay plantillas → crear defaults
      await this.crearPlantillasDefault(empresaId);
      return this.sugerirNivelesParaGES(empresaId, gesArray);
    }

    const sugerencias = [];

    for (const ges of gesArray) {
      const plantilla = this.encontrarPlantillaParaGES(ges, plantillas);

      if (plantilla) {
        const requiereRevision = this.necesitaRevisionManual(ges, plantilla);

        sugerencias.push({
          gesId: ges.id_ges || ges.idGes,
          gesNombre: ges.nombre,
          gesCategoria: ges.categoria,
          plantillaId: plantilla.id,
          plantillaNombre: plantilla.nombre_plantilla,
          nivelesSugeridos: plantilla.niveles_default,
          justificacion: plantilla.justificacion,
          confianza: this.calcularConfianza(plantilla),
          requiereRevision
        });
      } else {
        // No hay plantilla → requiere evaluación manual
        sugerencias.push({
          gesId: ges.id_ges || ges.idGes,
          gesNombre: ges.nombre,
          gesCategoria: ges.categoria,
          plantillaId: null,
          plantillaNombre: null,
          nivelesSugeridos: null,
          justificacion: 'No hay plantilla disponible para este tipo de riesgo',
          confianza: 0,
          requiereRevision: true
        });
      }
    }

    return sugerencias;
  }

  /**
   * Encontrar la plantilla más apropiada para un GES
   */
  encontrarPlantillaParaGES(ges, plantillas) {
    // 1. Buscar por categoría exacta
    const porCategoria = plantillas.filter(p =>
      p.categoria_riesgo.toUpperCase() === this.normalizarCategoria(ges.categoria)
    );

    if (porCategoria.length === 0) return null;

    // 2. Si hay múltiples plantillas, buscar la que incluya el nombre del GES
    const porNombre = porCategoria.find(p =>
      p.aplica_a_ges.some(nombreGes =>
        ges.nombre.toLowerCase().includes(nombreGes.toLowerCase()) ||
        nombreGes.toLowerCase().includes(ges.nombre.toLowerCase())
      )
    );

    if (porNombre) return porNombre;

    // 3. Si no, devolver la primera de la categoría
    return porCategoria[0];
  }

  /**
   * Normalizar nombre de categoría (ej: "Riesgos Físicos" → "FISICO")
   */
  normalizarCategoria(categoria) {
    const mapa = {
      'RIESGOS FISICOS': 'FISICO',
      'FISICO': 'FISICO',
      'RIESGOS MECANICOS': 'MECANICO',
      'MECANICO': 'MECANICO',
      'RIESGOS QUIMICOS': 'QUIMICO',
      'QUIMICO': 'QUIMICO',
      'RIESGOS BIOLOGICOS': 'BIOLOGICO',
      'BIOLOGICO': 'BIOLOGICO',
      'RIESGOS PSICOSOCIALES': 'PSICOSOCIAL',
      'PSICOSOCIAL': 'PSICOSOCIAL',
      'RIESGOS ERGONOMICOS': 'ERGONOMICO',
      'BIOMECANICO': 'ERGONOMICO',
      'BIOMECÁNICO': 'ERGONOMICO',
      'RIESGOS ELECTRICOS': 'ELECTRICO',
      'ELECTRICO': 'ELECTRICO',
      'LOCATIVO': 'LOCATIVO'
    };

    const key = categoria.toUpperCase().trim();
    return mapa[key] || key;
  }

  /**
   * Determinar si un GES requiere revisión manual
   */
  necesitaRevisionManual(ges, plantilla) {
    // 1. GES críticos (NC >= 60) siempre requieren revisión
    if (plantilla.niveles_default.NC >= 60) return true;

    // 2. Plantilla nueva (< 5 aplicaciones)
    if (plantilla.num_veces_aplicada < 5) return true;

    // 3. Tasa de aceptación baja (< 70%)
    if (plantilla.tasa_aceptacion < 0.7) return true;

    // 4. GES con sub-tipos conocidos
    const gesConSubtipos = [
      'POLVO', 'QUIMICO', 'RUIDO', 'VIBRACION',
      'TEMPERATURAS', 'ALTURAS', 'ESPACIOS CONFINADOS'
    ];
    const tieneSubtipo = gesConSubtipos.some(subtipo =>
      ges.nombre.toUpperCase().includes(subtipo)
    );
    if (tieneSubtipo) return true;

    return false;
  }

  /**
   * Calcular nivel de confianza de una plantilla (0-1)
   */
  calcularConfianza(plantilla) {
    // Basado en número de aplicaciones y tasa de aceptación
    const factorAplicaciones = Math.min(plantilla.num_veces_aplicada / 20, 1); // Max en 20 aplicaciones
    const factorAceptacion = plantilla.tasa_aceptacion;

    return (factorAplicaciones * 0.4 + factorAceptacion * 0.6);
  }

  /**
   * Registrar aplicación de plantilla (para aprendizaje)
   */
  async registrarAplicacion(aplicacionData) {
    const { plantillaId, gesId, cargoId, nivelesSugeridos, nivelesFinales, justificacionAjuste } = aplicacionData;

    const aceptadoSinCambios = JSON.stringify(nivelesSugeridos) === JSON.stringify(nivelesFinales);
    const desviacion = this.calcularDesviacion(nivelesSugeridos, nivelesFinales);

    const aplicacion = await db('plantillas_aplicaciones').insert({
      plantilla_id: plantillaId,
      ges_id: gesId,
      cargo_id: cargoId,
      niveles_sugeridos: JSON.stringify(nivelesSugeridos),
      niveles_finales: JSON.stringify(nivelesFinales),
      aceptado_sin_cambios: aceptadoSinCambios,
      desviacion_porcentual: desviacion,
      justificacion_ajuste: justificacionAjuste || null
    }).returning('*');

    // Actualizar estadísticas de la plantilla
    await this.actualizarEstadisticasPlantilla(plantillaId);

    // Si hay desviación significativa y repetida, considerar actualizar plantilla
    if (desviacion > 0.3) {
      await this.evaluarActualizacionPlantilla(plantillaId, nivelesFinales);
    }

    return aplicacion[0];
  }

  /**
   * Actualizar estadísticas de la plantilla
   */
  async actualizarEstadisticasPlantilla(plantillaId) {
    const aplicaciones = await db('plantillas_aplicaciones')
      .where('plantilla_id', plantillaId);

    const numAplicaciones = aplicaciones.length;
    const numAceptadas = aplicaciones.filter(a => a.aceptado_sin_cambios).length;
    const tasaAceptacion = numAplicaciones > 0 ? numAceptadas / numAplicaciones : 0;

    await db('plantillas_niveles_gtc45')
      .where('id', plantillaId)
      .update({
        num_veces_aplicada: numAplicaciones,
        tasa_aceptacion: tasaAceptacion,
        updated_at: new Date()
      });
  }

  /**
   * Evaluar si actualizar plantilla basándose en ajustes recurrentes
   */
  async evaluarActualizacionPlantilla(plantillaId, nivelesAjustados) {
    // Obtener últimas 10 aplicaciones
    const aplicacionesRecientes = await db('plantillas_aplicaciones')
      .where('plantilla_id', plantillaId)
      .orderBy('created_at', 'desc')
      .limit(10);

    if (aplicacionesRecientes.length < 5) return; // Muy pocas muestras

    // Contar ajustes similares
    let ajustesSimilares = 0;
    for (const app of aplicacionesRecientes) {
      const nivelesFinales = JSON.parse(app.niveles_finales);
      if (JSON.stringify(nivelesFinales) === JSON.stringify(nivelesAjustados)) {
        ajustesSimilares++;
      }
    }

    // Si 60%+ de ajustes recientes son iguales, sugerir actualización
    if (ajustesSimilares / aplicacionesRecientes.length >= 0.6) {
      console.log(`🎓 [Aprendizaje] Plantilla ${plantillaId}: ${ajustesSimilares}/10 ajustes similares detectados`);
      // Aquí podrías crear un registro de "sugerencias de actualización" para revisión humana
    }
  }

  /**
   * Calcular desviación porcentual entre niveles sugeridos y finales
   */
  calcularDesviacion(sugeridos, finales) {
    if (!sugeridos || !finales) return 1;

    const npSugerido = sugeridos.ND * sugeridos.NE;
    const nrSugerido = npSugerido * sugeridos.NC;

    const npFinal = finales.ND * finales.NE;
    const nrFinal = npFinal * finales.NC;

    if (nrSugerido === 0) return nrFinal > 0 ? 1 : 0;

    return Math.abs(nrFinal - nrSugerido) / nrSugerido;
  }

  /**
   * FASE 3: Obtener estadísticas completas de plantillas
   */
  async obtenerEstadisticas(empresaId) {
    const plantillas = await this.obtenerPlantillas(empresaId);

    const estadisticas = [];

    for (const plantilla of plantillas) {
      // Obtener aplicaciones de esta plantilla
      const aplicaciones = await db('plantillas_aplicaciones')
        .where('plantilla_id', plantilla.id);

      // Calcular métricas
      const totalAplicaciones = aplicaciones.length;
      const aceptadasSinCambios = aplicaciones.filter(a => a.aceptado_sin_cambios).length;
      const tasaAceptacion = totalAplicaciones > 0 ? aceptadasSinCambios / totalAplicaciones : 0;

      // Desviación promedio
      const desviacionPromedio = totalAplicaciones > 0
        ? aplicaciones.reduce((sum, a) => sum + a.desviacion_porcentual, 0) / totalAplicaciones
        : 0;

      // Últimas aplicaciones
      const ultimasAplicaciones = await db('plantillas_aplicaciones')
        .where('plantilla_id', plantilla.id)
        .orderBy('created_at', 'desc')
        .limit(5);

      // Detectar patrón de ajustes
      const patronAjustes = await this.detectarPatronAjustes(plantilla.id);

      estadisticas.push({
        plantillaId: plantilla.id,
        nombrePlantilla: plantilla.nombre_plantilla,
        categoriaRiesgo: plantilla.categoria_riesgo,
        nivelesDefault: plantilla.niveles_default,
        totalAplicaciones,
        aceptadasSinCambios,
        tasaAceptacion: Math.round(tasaAceptacion * 100),
        desviacionPromedio: Math.round(desviacionPromedio * 100),
        confianza: this.calcularConfianza(plantilla),
        ultimasAplicaciones: ultimasAplicaciones.length,
        patronAjustes,
        requiereRevision: tasaAceptacion < 0.7 || desviacionPromedio > 0.3
      });
    }

    return estadisticas;
  }

  /**
   * FASE 3: Detectar patrón de ajustes recurrentes
   */
  async detectarPatronAjustes(plantillaId) {
    const aplicaciones = await db('plantillas_aplicaciones')
      .where('plantilla_id', plantillaId)
      .where('aceptado_sin_cambios', false)
      .orderBy('created_at', 'desc')
      .limit(20);

    if (aplicaciones.length < 5) {
      return null; // Muy pocas muestras
    }

    // Agrupar por niveles finales
    const grupos = {};
    for (const app of aplicaciones) {
      const key = JSON.stringify(JSON.parse(app.niveles_finales));
      if (!grupos[key]) {
        grupos[key] = {
          niveles: JSON.parse(app.niveles_finales),
          count: 0,
          aplicaciones: []
        };
      }
      grupos[key].count++;
      grupos[key].aplicaciones.push(app);
    }

    // Encontrar el patrón más común
    const patronesOrdenados = Object.values(grupos).sort((a, b) => b.count - a.count);
    const patronMasComun = patronesOrdenados[0];

    if (!patronMasComun) return null;

    const frecuencia = patronMasComun.count / aplicaciones.length;

    // Si 60%+ de ajustes son iguales, hay un patrón fuerte
    if (frecuencia >= 0.6) {
      return {
        nivelesSugeridos: patronMasComun.niveles,
        frecuencia: Math.round(frecuencia * 100),
        muestras: patronMasComun.count,
        total: aplicaciones.length,
        recomendacion: 'Actualizar plantilla con estos niveles'
      };
    }

    return null;
  }

  /**
   * FASE 3: Auto-actualizar plantilla basándose en patrón detectado
   */
  async autoActualizarPlantilla(plantillaId) {
    const plantilla = await db('plantillas_niveles_gtc45')
      .where('id', plantillaId)
      .first();

    if (!plantilla) {
      throw new Error('Plantilla no encontrada');
    }

    const patron = await this.detectarPatronAjustes(plantillaId);

    if (!patron) {
      return {
        actualizado: false,
        mensaje: 'No se detectó patrón suficiente para auto-actualización'
      };
    }

    // Validar que los nuevos niveles cumplan GTC-45
    this.validarNiveles(patron.nivelesSugeridos);

    // Actualizar plantilla
    const nivelesAnteriores = JSON.parse(plantilla.niveles_default);

    await db('plantillas_niveles_gtc45')
      .where('id', plantillaId)
      .update({
        niveles_default: JSON.stringify(patron.nivelesSugeridos),
        justificacion: `${plantilla.justificacion} | Auto-actualizado basado en ${patron.muestras}/${patron.total} ajustes similares (${patron.frecuencia}%)`,
        updated_at: new Date()
      });

    console.log(`🎓 [Auto-Actualización] Plantilla ${plantillaId} actualizada:`);
    console.log(`   Antes: ND=${nivelesAnteriores.ND}, NE=${nivelesAnteriores.NE}, NC=${nivelesAnteriores.NC}`);
    console.log(`   Ahora: ND=${patron.nivelesSugeridos.ND}, NE=${patron.nivelesSugeridos.NE}, NC=${patron.nivelesSugeridos.NC}`);
    console.log(`   Basado en ${patron.muestras} ajustes (${patron.frecuencia}% frecuencia)`);

    return {
      actualizado: true,
      nivelesAnteriores,
      nivelesNuevos: patron.nivelesSugeridos,
      patron
    };
  }

  /**
   * FASE 3: Detectar inconsistencias entre cargos
   */
  async detectarInconsistencias(empresaId) {
    // Obtener todas las aplicaciones de la empresa
    const aplicaciones = await db('plantillas_aplicaciones as pa')
      .join('plantillas_niveles_gtc45 as p', 'pa.plantilla_id', 'p.id')
      .where('p.empresa_id', empresaId)
      .select('pa.*', 'p.categoria_riesgo');

    if (aplicaciones.length < 10) {
      return []; // Muy pocas aplicaciones para detectar inconsistencias
    }

    // Agrupar por GES
    const gesGroups = {};
    for (const app of aplicaciones) {
      const gesId = app.ges_id;
      if (!gesGroups[gesId]) {
        gesGroups[gesId] = [];
      }
      gesGroups[gesId].push(app);
    }

    const inconsistencias = [];

    // Analizar cada GES
    for (const [gesId, apps] of Object.entries(gesGroups)) {
      if (apps.length < 3) continue; // Necesitamos al menos 3 aplicaciones

      // Extraer todos los NR finales
      const nrValues = apps.map(app => {
        const niveles = JSON.parse(app.niveles_finales);
        return niveles.NP * niveles.NC; // NR
      });

      // Calcular desviación estándar
      const promedio = nrValues.reduce((sum, val) => sum + val, 0) / nrValues.length;
      const varianza = nrValues.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / nrValues.length;
      const desviacionEstandar = Math.sqrt(varianza);
      const coeficienteVariacion = promedio > 0 ? desviacionEstandar / promedio : 0;

      // Si el coeficiente de variación es > 0.5 (50%), hay inconsistencia
      if (coeficienteVariacion > 0.5) {
        const nivelesDiferentes = apps.map(app => {
          const niveles = JSON.parse(app.niveles_finales);
          return {
            cargoId: app.cargo_id,
            niveles,
            nr: niveles.NP * niveles.NC
          };
        });

        inconsistencias.push({
          gesId: parseInt(gesId),
          numeroAplicaciones: apps.length,
          promedioNR: Math.round(promedio),
          desviacionEstandar: Math.round(desviacionEstandar),
          coeficienteVariacion: Math.round(coeficienteVariacion * 100),
          nivelesDiferentes,
          severidad: coeficienteVariacion > 1 ? 'ALTA' : coeficienteVariacion > 0.7 ? 'MEDIA' : 'BAJA',
          recomendacion: 'Revisar criterios de evaluación para este riesgo en diferentes cargos'
        });
      }
    }

    // Ordenar por severidad
    inconsistencias.sort((a, b) => b.coeficienteVariacion - a.coeficienteVariacion);

    return inconsistencias;
  }

  /**
   * FASE 3: Sugerir plantillas para actualización
   */
  async sugerirActualizaciones(empresaId) {
    const estadisticas = await this.obtenerEstadisticas(empresaId);

    const sugerencias = [];

    for (const stat of estadisticas) {
      // Criterios para sugerir actualización:
      // 1. Tasa de aceptación baja (< 70%)
      // 2. Desviación promedio alta (> 30%)
      // 3. Hay un patrón de ajustes detectado

      if (stat.patronAjustes && (stat.tasaAceptacion < 70 || stat.desviacionPromedio > 30)) {
        const plantilla = await db('plantillas_niveles_gtc45')
          .where('id', stat.plantillaId)
          .first();

        const nivelesActuales = JSON.parse(plantilla.niveles_default);

        sugerencias.push({
          plantillaId: stat.plantillaId,
          nombrePlantilla: stat.nombrePlantilla,
          categoriaRiesgo: stat.categoriaRiesgo,
          nivelesActuales,
          nivelesRecomendados: stat.patronAjustes.nivelesSugeridos,
          razon: `Tasa de aceptación: ${stat.tasaAceptacion}% | Patrón detectado en ${stat.patronAjustes.frecuencia}% de ajustes`,
          estadisticas: {
            totalAplicaciones: stat.totalAplicaciones,
            tasaAceptacion: stat.tasaAceptacion,
            desviacionPromedio: stat.desviacionPromedio,
            patronFrecuencia: stat.patronAjustes.frecuencia
          },
          prioridad: stat.tasaAceptacion < 50 ? 'ALTA' : stat.tasaAceptacion < 70 ? 'MEDIA' : 'BAJA'
        });
      }
    }

    // Ordenar por prioridad
    const prioridadMap = { 'ALTA': 3, 'MEDIA': 2, 'BAJA': 1 };
    sugerencias.sort((a, b) => prioridadMap[b.prioridad] - prioridadMap[a.prioridad]);

    return sugerencias;
  }

  /**
   * Validar que los niveles cumplan GTC-45
   */
  validarNiveles(niveles) {
    const { ND, NE, NC } = niveles;

    const ndValidos = [0, 2, 6, 10];
    const neValidos = [1, 2, 3, 4];
    const ncValidos = [10, 25, 60, 100];

    if (!ndValidos.includes(ND)) {
      throw new Error(`ND inválido: ${ND}. Debe ser 0, 2, 6 o 10`);
    }

    if (!neValidos.includes(NE)) {
      throw new Error(`NE inválido: ${NE}. Debe ser 1, 2, 3 o 4`);
    }

    if (!ncValidos.includes(NC)) {
      throw new Error(`NC inválido: ${NC}. Debe ser 10, 25, 60 o 100`);
    }

    return true;
  }
}

export default new PlantillasNivelesService();
