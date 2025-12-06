// server/src/repositories/CatalogoRepository.js
import db from '../config/database.js';

/**
 * REPOSITORY PATTERN - CATALOGO DE RIESGOS Y GES
 * Centraliza acceso a datos de catálogos (catalogo_riesgos, catalogo_sectores, catalogo_ges)
 * Utiliza características avanzadas de PostgreSQL:
 * - JSONB con índices GIN para queries rápidas
 * - Full-Text Search con tsvector
 * - Paginación eficiente
 */
class CatalogoRepository {

  // ========================================
  // CATALOGO_RIESGOS - CRUD básico
  // ========================================

  /**
   * Obtener todos los tipos de riesgo (RF, RB, RQ, etc.)
   * @param {Object} options - { activo: Boolean, orderBy: String }
   * @returns {Array} Lista de riesgos
   */
  async getAllRiesgos(options = {}) {
    let query = db('catalogo_riesgos').select('*');

    // Filtrar solo activos si se solicita
    if (options.activo !== undefined) {
      query = query.where('activo', options.activo);
    }

    // Ordenar por campo especificado (default: orden)
    const orderBy = options.orderBy || 'orden';
    query = query.orderBy(orderBy, 'asc');

    return await query;
  }

  /**
   * Obtener un riesgo por ID o código
   * @param {Number|String} idOrCodigo - ID numérico o código string (ej: 'RF')
   * @returns {Object|null} Riesgo encontrado
   */
  async getRiesgoById(idOrCodigo) {
    if (typeof idOrCodigo === 'number') {
      return await db('catalogo_riesgos').where('id', idOrCodigo).first();
    } else {
      return await db('catalogo_riesgos').where('codigo', idOrCodigo).first();
    }
  }

  /**
   * Crear un nuevo tipo de riesgo
   * @param {Object} data - { codigo, nombre, orden, activo }
   * @returns {Object} Riesgo creado
   */
  async createRiesgo(data) {
    const [riesgo] = await db('catalogo_riesgos')
      .insert(data)
      .returning('*');
    return riesgo;
  }

  /**
   * Actualizar un riesgo existente
   * @param {Number} id - ID del riesgo
   * @param {Object} data - Campos a actualizar
   * @returns {Object} Riesgo actualizado
   */
  async updateRiesgo(id, data) {
    const [riesgo] = await db('catalogo_riesgos')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return riesgo;
  }

  /**
   * Eliminar un riesgo (soft delete - marcar como inactivo)
   * @param {Number} id - ID del riesgo
   * @returns {Boolean} true si se eliminó
   */
  async deleteRiesgo(id) {
    const count = await db('catalogo_riesgos')
      .where('id', id)
      .update({ activo: false, updated_at: db.fn.now() });
    return count > 0;
  }

  // ========================================
  // CATALOGO_SECTORES - CRUD básico
  // ========================================

  /**
   * Obtener todos los sectores económicos
   * @param {Object} options - { activo: Boolean }
   * @returns {Array} Lista de sectores
   */
  async getAllSectores(options = {}) {
    let query = db('catalogo_sectores').select('*');

    if (options.activo !== undefined) {
      query = query.where('activo', options.activo);
    }

    return await query.orderBy('orden', 'asc');
  }

  // ========================================
  // CATALOGO_CIUDADES - Ciudades de Colombia
  // ========================================

  /**
   * Obtener todas las ciudades de Colombia
   * @param {Object} options - { departamento: String, activo: Boolean }
   * @returns {Array} Lista de ciudades
   */
  async getAllCiudades(options = {}) {
    let query = db('catalogo_ciudades').select('*');

    if (options.departamento) {
      query = query.where('departamento', options.departamento);
    }

    if (options.activo !== undefined) {
      query = query.where('activo', options.activo);
    }

    return await query.orderBy(['departamento', 'orden', 'nombre']);
  }

  /**
   * Obtener lista de departamentos únicos
   * @returns {Array} Lista de departamentos
   */
  async getDepartamentos() {
    return await db('catalogo_ciudades')
      .distinct('departamento')
      .where('activo', true)
      .orderBy('departamento', 'asc');
  }

  /**
   * Buscar ciudades por nombre (para autocompletado)
   * @param {String} searchTerm - Término de búsqueda
   * @param {Number} limit - Límite de resultados
   * @returns {Array} Ciudades que coinciden
   */
  async searchCiudades(searchTerm, limit = 10) {
    return await db('catalogo_ciudades')
      .select('*')
      .whereRaw('LOWER(nombre) LIKE ?', [`%${searchTerm.toLowerCase()}%`])
      .where('activo', true)
      .orderByRaw('es_capital DESC, nombre ASC')
      .limit(limit);
  }

  // ========================================
  // CIIU - Clasificación Industrial Internacional Uniforme
  // ========================================

  /**
   * Obtener todas las secciones CIIU (21 secciones)
   * @param {Object} options - { activo: Boolean }
   * @returns {Array} Lista de secciones
   */
  async getCIIUSecciones(options = {}) {
    let query = db('ciiu_secciones').select('*');

    if (options.activo !== undefined) {
      query = query.where('activo', options.activo);
    }

    return await query.orderBy('orden', 'asc');
  }

  /**
   * Obtener divisiones CIIU por sección (lazy loading)
   * @param {String} seccionCodigo - Código de sección (A, B, C, ..., U)
   * @returns {Array} Lista de divisiones de esa sección
   */
  async getCIIUDivisionesBySeccion(seccionCodigo) {
    return await db('ciiu_divisiones')
      .select('*')
      .where('seccion_codigo', seccionCodigo.toUpperCase())
      .where('activo', true)
      .orderBy('orden', 'asc');
  }

  /**
   * Obtener todas las divisiones CIIU (87 divisiones)
   * @param {Object} options - { activo: Boolean }
   * @returns {Array} Lista de divisiones con datos de sección
   */
  async getCIIUDivisiones(options = {}) {
    let query = db('ciiu_divisiones as d')
      .join('ciiu_secciones as s', 'd.seccion_codigo', 's.codigo')
      .select(
        'd.*',
        's.nombre as seccion_nombre'
      );

    if (options.activo !== undefined) {
      query = query.where('d.activo', options.activo);
    }

    return await query.orderBy(['s.orden', 'd.orden']);
  }

  /**
   * Obtener una división CIIU por código
   * @param {String} codigo - Código de división (01, 02, ..., 99)
   * @returns {Object|null} División encontrada
   */
  async getCIIUDivisionByCodigo(codigo) {
    return await db('ciiu_divisiones as d')
      .join('ciiu_secciones as s', 'd.seccion_codigo', 's.codigo')
      .select(
        'd.*',
        's.nombre as seccion_nombre'
      )
      .where('d.codigo', codigo)
      .first();
  }

  /**
   * Buscar divisiones CIIU por nombre
   * @param {String} searchTerm - Término de búsqueda
   * @param {Number} limit - Límite de resultados
   * @returns {Array} Divisiones que coinciden
   */
  async searchCIIUDivisiones(searchTerm, limit = 10) {
    return await db('ciiu_divisiones as d')
      .join('ciiu_secciones as s', 'd.seccion_codigo', 's.codigo')
      .select(
        'd.*',
        's.nombre as seccion_nombre'
      )
      .whereRaw('LOWER(d.nombre) LIKE ?', [`%${searchTerm.toLowerCase()}%`])
      .where('d.activo', true)
      .orderBy(['s.orden', 'd.orden'])
      .limit(limit);
  }

  /**
   * Obtener un sector por ID o código
   * @param {Number|String} idOrCodigo - ID numérico o código string
   * @returns {Object|null} Sector encontrado
   */
  async getSectorById(idOrCodigo) {
    if (typeof idOrCodigo === 'number') {
      return await db('catalogo_sectores').where('id', idOrCodigo).first();
    } else {
      return await db('catalogo_sectores').where('codigo', idOrCodigo).first();
    }
  }

  /**
   * Crear un nuevo sector económico
   * @param {Object} data - { codigo, nombre, activo }
   * @returns {Object} Sector creado
   */
  async createSector(data) {
    const [sector] = await db('catalogo_sectores')
      .insert(data)
      .returning('*');
    return sector;
  }

  /**
   * Actualizar un sector existente
   * @param {Number} id - ID del sector
   * @param {Object} data - Campos a actualizar
   * @returns {Object} Sector actualizado
   */
  async updateSector(id, data) {
    const [sector] = await db('catalogo_sectores')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return sector;
  }

  // ========================================
  // CATALOGO_GES - CRUD y queries avanzadas
  // ========================================

  /**
   * Obtener un GES por ID
   * @param {Number} id - ID del GES
   * @returns {Object|null} GES encontrado con datos del riesgo asociado
   */
  async getGESById(id) {
    const ges = await db('catalogo_ges as g')
      .leftJoin('catalogo_riesgos as r', 'g.riesgo_id', 'r.id')
      .select(
        'g.*',
        'r.codigo as riesgo_codigo',
        'r.nombre as riesgo_nombre'
      )
      .where('g.id', id)
      .first();

    return ges;
  }

  /**
   * Buscar GES con múltiples filtros (Query principal del sistema)
   * @param {Object} filters - Opciones de búsqueda
   * @param {Number} filters.riesgoId - Filtrar por tipo de riesgo
   * @param {String} filters.riesgoCodigo - Filtrar por código de riesgo (ej: 'RF', 'RB')
   * @param {String} filters.sectorCodigo - Filtrar GES relevantes para un sector específico
   * @param {Number} filters.relevanciaMinima - Relevancia mínima en el sector (1-10)
   * @param {String} filters.search - Búsqueda de texto (usa Full-Text Search)
   * @param {Boolean} filters.esComun - Filtrar solo GES comunes
   * @param {Boolean} filters.activo - Filtrar solo activos
   * @param {Array} filters.fields - Campos a seleccionar (default: todos)
   * @param {Number} filters.limit - Límite de resultados (default: 50)
   * @param {Number} filters.offset - Offset para paginación (default: 0)
   * @param {String} filters.orderBy - Campo para ordenar (default: 'orden')
   * @returns {Object} { data: Array, total: Number, page: Number, limit: Number }
   */
  async findGES(filters = {}) {
    const {
      riesgoId,
      riesgoCodigo,
      sectorCodigo,
      relevanciaMinima = 5,
      search,
      esComun,
      activo = true,
      fields = null,
      limit = 50,
      offset = 0,
      orderBy = 'orden'
    } = filters;

    // Determinar campos a seleccionar
    let selectFields;
    if (fields && Array.isArray(fields)) {
      // Si se especifican campos, usarlos con prefijo 'g.'
      selectFields = [
        ...fields.map(f => `g.${f}`),
        'r.codigo as riesgo_codigo',
        'r.nombre as riesgo_nombre'
      ];
    } else {
      // Por defecto, todos los campos
      selectFields = [
        'g.*',
        'r.codigo as riesgo_codigo',
        'r.nombre as riesgo_nombre'
      ];
    }

    // Query base con JOIN a catalogo_riesgos
    let query = db('catalogo_ges as g')
      .leftJoin('catalogo_riesgos as r', 'g.riesgo_id', 'r.id')
      .select(selectFields);

    // FILTRO 1: Por ID de riesgo
    if (riesgoId) {
      query = query.where('g.riesgo_id', riesgoId);
    }

    // FILTRO 2: Por código de riesgo (ej: 'RF', 'RB')
    if (riesgoCodigo) {
      query = query.where('r.codigo', riesgoCodigo);
    }

    // FILTRO 3: Por sector económico (usa JSONB)
    // Ejemplo: WHERE relevancia_por_sector->>'construccion' >= '5'
    if (sectorCodigo) {
      query = query.whereRaw(
        `(relevancia_por_sector->>?)::int >= ?`,
        [sectorCodigo, relevanciaMinima]
      );
    }

    // FILTRO 4: Full-Text Search en nombre
    // Usa índice GIN en nombre_tsvector para búsqueda rápida
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.whereRaw(
        `nombre_tsvector @@ to_tsquery('spanish', ?)`,
        [searchTerm.split(' ').join(' & ')] // Convierte "calor extremo" -> "calor & extremo"
      );
    }

    // FILTRO 5: Solo GES comunes
    if (esComun !== undefined) {
      query = query.where('g.es_comun', esComun);
    }

    // FILTRO 6: Solo activos
    if (activo !== undefined) {
      query = query.where('g.activo', activo);
    }

    // Clonar query para contar total (sin paginación)
    // IMPORTANTE: clearSelect() necesario para evitar error de GROUP BY en PostgreSQL
    const countQuery = query.clone().clearSelect().count('g.id as count');

    // Aplicar paginación
    query = query.limit(limit).offset(offset);

    // Ordenar resultados
    query = query.orderBy(`g.${orderBy}`, 'asc');

    // Ejecutar ambas queries en paralelo
    const [data, countResult] = await Promise.all([
      query,
      countQuery
    ]);

    const total = parseInt(countResult[0]?.count || 0);
    const page = Math.floor(offset / limit) + 1;

    return {
      data,
      total,
      page,
      limit,
      hasMore: (offset + limit) < total
    };
  }

  /**
   * Buscar GES por término de búsqueda simple (usa FTS)
   * Wrapper simplificado de findGES para búsqueda rápida
   * @param {String} searchTerm - Término a buscar
   * @param {Object} options - { limit, offset }
   * @returns {Object} Resultados paginados
   */
  async searchGES(searchTerm, options = {}) {
    return await this.findGES({
      search: searchTerm,
      limit: options.limit || 20,
      offset: options.offset || 0
    });
  }

  /**
   * Obtener GES más relevantes para un sector
   * Ordena por relevancia descendente
   * @param {String} sectorCodigo - Código del sector (ej: 'construccion')
   * @param {Number} relevanciaMinima - Relevancia mínima (default: 7)
   * @param {Number} limit - Límite de resultados (default: 20)
   * @returns {Array} GES ordenados por relevancia
   */
  async getGESBySector(sectorCodigo, relevanciaMinima = 7, limit = 20) {
    const ges = await db('catalogo_ges as g')
      .leftJoin('catalogo_riesgos as r', 'g.riesgo_id', 'r.id')
      .select(
        'g.*',
        'r.codigo as riesgo_codigo',
        'r.nombre as riesgo_nombre',
        db.raw(`(relevancia_por_sector->>?)::int as relevancia`, [sectorCodigo])
      )
      .whereRaw(
        `(relevancia_por_sector->>?)::int >= ?`,
        [sectorCodigo, relevanciaMinima]
      )
      .where('g.activo', true)
      .orderByRaw(`(relevancia_por_sector->>?)::int DESC`, [sectorCodigo])
      .limit(limit);

    return ges;
  }

  /**
   * Obtener GES comunes (más frecuentes en la industria)
   * @param {Number} limit - Límite de resultados (default: 10)
   * @returns {Array} GES comunes ordenados por orden
   */
  async getGESComunes(limit = 10) {
    return await db('catalogo_ges as g')
      .leftJoin('catalogo_riesgos as r', 'g.riesgo_id', 'r.id')
      .select(
        'g.*',
        'r.codigo as riesgo_codigo',
        'r.nombre as riesgo_nombre'
      )
      .where('g.es_comun', true)
      .where('g.activo', true)
      .orderBy('g.orden', 'asc')
      .limit(limit);
  }

  /**
   * Crear un nuevo GES
   * @param {Object} data - Datos del GES
   * @returns {Object} GES creado
   */
  async createGES(data) {
    const [ges] = await db('catalogo_ges')
      .insert(data)
      .returning('*');
    return ges;
  }

  /**
   * Actualizar un GES existente
   * @param {Number} id - ID del GES
   * @param {Object} data - Campos a actualizar
   * @returns {Object} GES actualizado
   */
  async updateGES(id, data) {
    const [ges] = await db('catalogo_ges')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return ges;
  }

  /**
   * Eliminar un GES (soft delete)
   * @param {Number} id - ID del GES
   * @returns {Boolean} true si se eliminó
   */
  async deleteGES(id) {
    const count = await db('catalogo_ges')
      .where('id', id)
      .update({ activo: false, updated_at: db.fn.now() });
    return count > 0;
  }

  // ========================================
  // QUERIES DE ESTADÍSTICAS Y ANÁLISIS
  // ========================================

  /**
   * Obtener conteo de GES por tipo de riesgo
   * Incluye categorías sin GES (total = 0) para validación de compliance
   * @returns {Array} [{ riesgo_codigo, riesgo_nombre, total }]
   */
  async getGESCountByRiesgo() {
    return await db('catalogo_riesgos as r')
      .leftJoin('catalogo_ges as g', function() {
        this.on('g.riesgo_id', '=', 'r.id')
          .andOn('g.activo', '=', db.raw('?', [true]));
      })
      .select(
        'r.codigo as riesgo_codigo',
        'r.nombre as riesgo_nombre',
        db.raw('COUNT(g.id) as total')
      )
      .where('r.activo', true)
      .groupBy('r.id', 'r.codigo', 'r.nombre', 'r.orden')
      .orderBy('r.orden', 'asc');
  }

  /**
   * Obtener GES con sus exámenes médicos (para autocompletado)
   * @param {String} riesgoCodigo - Código del riesgo (opcional)
   * @returns {Array} GES con metadata de exámenes
   */
  async getGESWithExamenes(riesgoCodigo = null) {
    let query = db('catalogo_ges as g')
      .leftJoin('catalogo_riesgos as r', 'g.riesgo_id', 'r.id')
      .select(
        'g.id',
        'g.nombre',
        'g.examenes_medicos',
        'r.codigo as riesgo_codigo'
      )
      .where('g.activo', true)
      .whereNotNull('g.examenes_medicos');

    if (riesgoCodigo) {
      query = query.where('r.codigo', riesgoCodigo);
    }

    return await query.orderBy('g.orden', 'asc');
  }

  /**
   * Buscar un GES específico por nombre de riesgo y nombre de GES
   * Para enriquecer datos del wizard con info del catálogo
   * @param {String} nombreRiesgo - Nombre de la categoría de riesgo (ej: "Biomecánico")
   * @param {String} nombreGES - Nombre del GES (ej: "Postura prolongada...")
   * @returns {Object|null} GES encontrado con todos sus datos
   */
  async findGESByNombre(nombreRiesgo, nombreGES) {
    const ges = await db('catalogo_ges as g')
      .leftJoin('catalogo_riesgos as r', 'g.riesgo_id', 'r.id')
      .select(
        'g.*',
        'r.codigo as riesgo_codigo',
        'r.nombre as categoria_riesgo'
      )
      .where('r.nombre', nombreRiesgo)
      .where('g.nombre', nombreGES)
      .where('g.activo', true)
      .first();

    return ges;
  }

  // ========================================
  // LAZY LOADING - Batch fetch de GES
  // ========================================

  /**
   * Obtener detalles completos de múltiples GES por IDs (batch fetch)
   * Para lazy loading: cargar detalles solo cuando se necesiten
   * @param {Array<Number>} ids - Array de IDs de GES
   * @returns {Array} GES con todos sus detalles (examenes, epp, controles)
   */
  async getGESByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    // Construir placeholders seguros para el array
    const placeholders = ids.map(() => '?').join(',');

    const ges = await db('catalogo_ges as g')
      .leftJoin('catalogo_riesgos as r', 'g.riesgo_id', 'r.id')
      .select(
        'g.*',
        'r.codigo as riesgo_codigo',
        'r.nombre as riesgo_nombre'
      )
      .whereIn('g.id', ids)
      .where('g.activo', true)
      .orderByRaw(`ARRAY_POSITION(ARRAY[${placeholders}]::integer[], g.id)`, ids); // Mantener orden del array

    return ges;
  }

  // ========================================
  // VALIDACIÓN DE CATÁLOGO
  // ========================================

  /**
   * Obtener conteo de GES agrupados por tipo de riesgo
   * Para validar que todas las categorías esperadas tengan al menos 1 GES
   * @returns {Array<Object>} - Array con { riesgo_nombre, tipo_riesgo, total }
   */
  async getGESCountByRiesgo() {
    const results = await db('catalogo_ges as g')
      .leftJoin('catalogo_riesgos as r', 'g.riesgo_id', 'r.id')
      .select(
        'r.nombre as riesgo_nombre',
        'r.codigo as tipo_riesgo'
      )
      .count('g.id as total')
      .where('g.activo', true)
      .groupBy('r.nombre', 'r.codigo')
      .orderBy('r.nombre');

    return results;
  }
}

// Exportar instancia única (singleton)
export default new CatalogoRepository();
