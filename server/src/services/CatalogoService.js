// server/src/services/CatalogoService.js
import CatalogoRepository from '../repositories/CatalogoRepository.js';

/**
 * SERVICE LAYER - CATALOGO DE RIESGOS Y GES
 * Implementa cache de 2 capas:
 * - CAPA 1: Memoria (Map) - ultrarrápido, volátil
 * - CAPA 2: Redis - persistente, compartido entre instancias
 *
 * Estrategia de cache:
 * - Riesgos: Cache largo (1 hora) - cambian poco
 * - Sectores: Cache largo (1 hora) - cambian poco
 * - GES: Cache medio (15 min) - pueden cambiar más frecuentemente
 * - Búsquedas: Cache corto (5 min) - dinámicas
 */
class CatalogoService {
  constructor() {
    // CAPA 1: Cache en memoria (Map)
    this.memoryCache = new Map();

    // CAPA 2: Redis (se configurará en T2.3)
    this.redisClient = null;

    // TTL por tipo de dato (en segundos)
    this.ttl = {
      riesgos: 3600,      // 1 hora
      sectores: 3600,     // 1 hora
      ges: 900,           // 15 minutos
      search: 300,        // 5 minutos
      gesTotales: 1800    // 30 minutos
    };

    // Estadísticas de cache (para monitoreo)
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0
    };
  }

  /**
   * Configurar cliente Redis (se llamará en app.js después de T2.3)
   * @param {Object} redis - Cliente Redis (ioredis)
   */
  setRedisClient(redis) {
    this.redisClient = redis;
    console.log('✅ CatalogoService: Redis client configurado');
  }

  // ========================================
  // MÉTODOS PRIVADOS - CACHE HELPERS
  // ========================================

  /**
   * Generar clave de cache única
   * @param {String} type - Tipo de dato (riesgos, ges, search)
   * @param {String|Object} params - Parámetros adicionales
   * @returns {String} Clave de cache
   */
  _generateCacheKey(type, params = '') {
    if (typeof params === 'object') {
      params = JSON.stringify(params);
    }
    return `catalogo:${type}:${params}`;
  }

  /**
   * Obtener dato del cache (2 capas: memoria -> Redis)
   * @param {String} key - Clave de cache
   * @returns {Object|null} Dato cacheado o null
   */
  async _getFromCache(key) {
    try {
      // CAPA 1: Memoria
      if (this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key);

        // Verificar si expiró
        if (cached.expiresAt > Date.now()) {
          this.stats.hits++;
          return cached.data;
        } else {
          // Expiró, eliminar
          this.memoryCache.delete(key);
        }
      }

      // CAPA 2: Redis (si está configurado)
      if (this.redisClient) {
        const cached = await this.redisClient.get(key);
        if (cached) {
          const data = JSON.parse(cached);

          // Guardar en memoria para siguiente consulta
          this._setMemoryCache(key, data, this.ttl.ges); // TTL genérico

          this.stats.hits++;
          return data;
        }
      }

      this.stats.misses++;
      return null;

    } catch (error) {
      console.error(`❌ Error obteniendo del cache [${key}]:`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Guardar en cache de memoria (CAPA 1)
   * @param {String} key - Clave
   * @param {Object} data - Dato a cachear
   * @param {Number} ttlSeconds - TTL en segundos
   */
  _setMemoryCache(key, data, ttlSeconds) {
    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    });
  }

  /**
   * Guardar en cache completo (2 capas: memoria + Redis)
   * @param {String} key - Clave
   * @param {Object} data - Dato a cachear
   * @param {Number} ttlSeconds - TTL en segundos
   */
  async _setCache(key, data, ttlSeconds) {
    try {
      // CAPA 1: Memoria
      this._setMemoryCache(key, data, ttlSeconds);

      // CAPA 2: Redis
      if (this.redisClient) {
        await this.redisClient.setex(key, ttlSeconds, JSON.stringify(data));
      }

    } catch (error) {
      console.error(`❌ Error guardando en cache [${key}]:`, error.message);
      this.stats.errors++;
    }
  }

  /**
   * Invalidar cache por patrón
   * @param {String} pattern - Patrón de clave (ej: 'catalogo:ges:*')
   */
  async _invalidateCache(pattern) {
    try {
      // CAPA 1: Limpiar memoria
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          this.memoryCache.delete(key);
        }
      }

      // CAPA 2: Limpiar Redis
      if (this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      }

      console.log(`🗑️  Cache invalidado: ${pattern} (${this.memoryCache.size} keys en memoria)`);

    } catch (error) {
      console.error(`❌ Error invalidando cache [${pattern}]:`, error.message);
      this.stats.errors++;
    }
  }

  // ========================================
  // MÉTODOS PÚBLICOS - RIESGOS
  // ========================================

  /**
   * Obtener todos los tipos de riesgo (con cache)
   * @param {Object} options - { activo: Boolean }
   * @returns {Array} Lista de riesgos
   */
  async getRiesgos(options = {}) {
    const cacheKey = this._generateCacheKey('riesgos', options);

    // Intentar desde cache
    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    // Cache miss - consultar BD
    data = await CatalogoRepository.getAllRiesgos(options);

    // Guardar en cache
    await this._setCache(cacheKey, data, this.ttl.riesgos);

    return data;
  }

  /**
   * Obtener un riesgo por ID o código
   * @param {Number|String} idOrCodigo - ID o código
   * @returns {Object|null} Riesgo encontrado
   */
  async getRiesgoById(idOrCodigo) {
    const cacheKey = this._generateCacheKey('riesgo', idOrCodigo);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getRiesgoById(idOrCodigo);

    if (data) {
      await this._setCache(cacheKey, data, this.ttl.riesgos);
    }

    return data;
  }

  // ========================================
  // MÉTODOS PÚBLICOS - SECTORES
  // ========================================

  /**
   * Obtener todos los sectores económicos (con cache)
   * @param {Object} options - { activo: Boolean }
   * @returns {Array} Lista de sectores
   */
  async getSectores(options = {}) {
    const cacheKey = this._generateCacheKey('sectores', options);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getAllSectores(options);

    await this._setCache(cacheKey, data, this.ttl.sectores);

    return data;
  }

  /**
   * Obtener un sector por ID o código
   * @param {Number|String} idOrCodigo - ID o código
   * @returns {Object|null} Sector encontrado
   */
  async getSectorById(idOrCodigo) {
    const cacheKey = this._generateCacheKey('sector', idOrCodigo);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getSectorById(idOrCodigo);

    if (data) {
      await this._setCache(cacheKey, data, this.ttl.sectores);
    }

    return data;
  }

  // ========================================
  // MÉTODOS PÚBLICOS - CIUDADES
  // ========================================

  /**
   * Obtener todas las ciudades de Colombia (con cache)
   * @param {Object} options - { departamento: String, activo: Boolean }
   * @returns {Array} Lista de ciudades
   */
  async getCiudades(options = {}) {
    const cacheKey = this._generateCacheKey('ciudades', options);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getAllCiudades(options);

    await this._setCache(cacheKey, data, this.ttl.sectores); // Mismo TTL que sectores

    return data;
  }

  /**
   * Obtener lista de departamentos
   * @returns {Array} Lista de departamentos
   */
  async getDepartamentos() {
    const cacheKey = this._generateCacheKey('departamentos', 'all');

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getDepartamentos();

    await this._setCache(cacheKey, data, this.ttl.sectores);

    return data;
  }

  /**
   * Buscar ciudades por nombre (para autocompletado)
   * @param {String} searchTerm - Término de búsqueda
   * @param {Number} limit - Límite de resultados
   * @returns {Array} Ciudades que coinciden
   */
  async searchCiudades(searchTerm, limit = 10) {
    // No cachear búsquedas dinámicas
    return await CatalogoRepository.searchCiudades(searchTerm, limit);
  }

  // ========================================
  // MÉTODOS PÚBLICOS - CIIU
  // ========================================

  /**
   * Obtener todas las secciones CIIU (con cache)
   * @param {Object} options - { activo: Boolean }
   * @returns {Array} Lista de secciones (21)
   */
  async getCIIUSecciones(options = {}) {
    const cacheKey = this._generateCacheKey('ciiu:secciones', options);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getCIIUSecciones(options);

    await this._setCache(cacheKey, data, this.ttl.sectores);

    return data;
  }

  /**
   * Obtener divisiones CIIU por sección (lazy loading con cache)
   * @param {String} seccionCodigo - Código de sección (A, B, C, ..., U)
   * @returns {Array} Lista de divisiones de esa sección
   */
  async getCIIUDivisionesBySeccion(seccionCodigo) {
    const cacheKey = this._generateCacheKey('ciiu:divisiones', seccionCodigo);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getCIIUDivisionesBySeccion(seccionCodigo);

    await this._setCache(cacheKey, data, this.ttl.sectores);

    return data;
  }

  /**
   * Obtener todas las divisiones CIIU (con cache)
   * @param {Object} options - { activo: Boolean }
   * @returns {Array} Lista de divisiones (87)
   */
  async getCIIUDivisiones(options = {}) {
    const cacheKey = this._generateCacheKey('ciiu:divisiones:all', options);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getCIIUDivisiones(options);

    await this._setCache(cacheKey, data, this.ttl.sectores);

    return data;
  }

  /**
   * Obtener una división CIIU por código
   * @param {String} codigo - Código de división (01, 02, ..., 99)
   * @returns {Object|null} División encontrada
   */
  async getCIIUDivisionByCodigo(codigo) {
    const cacheKey = this._generateCacheKey('ciiu:division', codigo);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getCIIUDivisionByCodigo(codigo);

    if (data) {
      await this._setCache(cacheKey, data, this.ttl.sectores);
    }

    return data;
  }

  /**
   * Buscar divisiones CIIU por nombre
   * @param {String} searchTerm - Término de búsqueda
   * @param {Number} limit - Límite de resultados
   * @returns {Array} Divisiones que coinciden
   */
  async searchCIIUDivisiones(searchTerm, limit = 10) {
    // No cachear búsquedas dinámicas
    return await CatalogoRepository.searchCIIUDivisiones(searchTerm, limit);
  }

  // ========================================
  // MÉTODOS PÚBLICOS - GES
  // ========================================

  /**
   * Obtener un GES por ID (con cache)
   * @param {Number} id - ID del GES
   * @returns {Object|null} GES encontrado
   */
  async getGESById(id) {
    const cacheKey = this._generateCacheKey('ges', id);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getGESById(id);

    if (data) {
      await this._setCache(cacheKey, data, this.ttl.ges);
    }

    return data;
  }

  /**
   * Buscar GES con filtros múltiples (con cache)
   * @param {Object} filters - Filtros de búsqueda (ver CatalogoRepository.findGES)
   * @returns {Object} { data, total, page, limit, hasMore }
   */
  async buscarGES(filters = {}) {
    const cacheKey = this._generateCacheKey('ges:search', filters);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.findGES(filters);

    // Cache más corto para búsquedas dinámicas
    await this._setCache(cacheKey, data, this.ttl.search);

    return data;
  }

  /**
   * Buscar GES por término (wrapper simplificado)
   * @param {String} searchTerm - Término de búsqueda
   * @param {Object} options - { limit, offset }
   * @returns {Object} Resultados paginados
   */
  async searchGES(searchTerm, options = {}) {
    return await this.buscarGES({
      search: searchTerm,
      limit: options.limit || 20,
      offset: options.offset || 0
    });
  }

  /**
   * Obtener GES relevantes para un sector (con cache)
   * @param {String} sectorCodigo - Código del sector
   * @param {Number} relevanciaMinima - Relevancia mínima (default: 7)
   * @param {Number} limit - Límite de resultados (default: 20)
   * @returns {Array} GES ordenados por relevancia
   */
  async getGESBySector(sectorCodigo, relevanciaMinima = 7, limit = 20) {
    const cacheKey = this._generateCacheKey('ges:sector', { sectorCodigo, relevanciaMinima, limit });

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getGESBySector(sectorCodigo, relevanciaMinima, limit);

    await this._setCache(cacheKey, data, this.ttl.ges);

    return data;
  }

  /**
   * Obtener GES comunes (con cache)
   * @param {Number} limit - Límite de resultados (default: 10)
   * @returns {Array} GES comunes ordenados
   */
  async getGESComunes(limit = 10) {
    const cacheKey = this._generateCacheKey('ges:comunes', limit);

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getGESComunes(limit);

    await this._setCache(cacheKey, data, this.ttl.ges);

    return data;
  }

  // ========================================
  // LAZY LOADING - Batch fetch de GES
  // ========================================

  /**
   * Obtener detalles completos de múltiples GES por IDs (batch fetch)
   * Para lazy loading: cargar detalles solo cuando se necesiten
   * Cache individual por ID para mejor hit rate
   * @param {Array<Number>} ids - Array de IDs de GES
   * @returns {Array} GES con todos sus detalles
   */
  async getGESByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    // Intentar obtener de cache individual por ID
    const results = [];
    const missingIds = [];

    for (const id of ids) {
      const cacheKey = this._generateCacheKey('ges', id);
      const cached = await this._getFromCache(cacheKey);

      if (cached) {
        results.push(cached);
      } else {
        missingIds.push(id);
      }
    }

    // Si todos estaban en cache, retornar
    if (missingIds.length === 0) {
      return results;
    }

    // Obtener los que faltaron de la DB (batch query)
    const freshData = await CatalogoRepository.getGESByIds(missingIds);

    // Cachear individualmente para futuros requests
    for (const ges of freshData) {
      const cacheKey = this._generateCacheKey('ges', ges.id);
      await this._setCache(cacheKey, ges, this.ttl.ges);
      results.push(ges);
    }

    // Ordenar por el orden original de IDs
    const orderedResults = ids
      .map(id => results.find(ges => ges.id === id))
      .filter(Boolean); // Eliminar nulls si algún ID no existe

    return orderedResults;
  }

  // ========================================
  // MÉTODOS PÚBLICOS - ESTADÍSTICAS
  // ========================================

  /**
   * Obtener conteo de GES por tipo de riesgo (con cache)
   * @returns {Array} [{ riesgo_codigo, riesgo_nombre, total }]
   */
  async getGESCountByRiesgo() {
    const cacheKey = this._generateCacheKey('ges:stats', 'count-by-riesgo');

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getGESCountByRiesgo();

    await this._setCache(cacheKey, data, this.ttl.gesTotales);

    return data;
  }

  /**
   * Obtener GES con sus exámenes médicos (con cache)
   * @param {String} riesgoCodigo - Código del riesgo (opcional)
   * @returns {Array} GES con metadata de exámenes
   */
  async getGESWithExamenes(riesgoCodigo = null) {
    const cacheKey = this._generateCacheKey('ges:examenes', riesgoCodigo || 'all');

    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    data = await CatalogoRepository.getGESWithExamenes(riesgoCodigo);

    await this._setCache(cacheKey, data, this.ttl.ges);

    return data;
  }

  // ========================================
  // MÉTODOS DE ADMINISTRACIÓN
  // ========================================

  /**
   * Invalidar todo el cache de catálogos
   * Usar después de actualizaciones en BD
   */
  async invalidateAllCache() {
    await this._invalidateCache('catalogo:*');
  }

  /**
   * Invalidar solo cache de GES
   */
  async invalidateGESCache() {
    await this._invalidateCache('catalogo:ges:*');
  }

  /**
   * Obtener estadísticas de cache
   * @returns {Object} { hits, misses, errors, hitRate }
   */
  getCacheStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memoryCacheSize: this.memoryCache.size,
      redisConnected: this.redisClient !== null
    };
  }

  /**
   * Limpiar estadísticas de cache
   */
  resetCacheStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0
    };
  }

  /**
   * Pre-cargar cache con datos más usados (warming)
   * Llamar al iniciar la aplicación
   */
  async warmupCache() {
    console.log('🔥 Warming up cache...');

    try {
      // Pre-cargar riesgos
      await this.getRiesgos({ activo: true });

      // Pre-cargar sectores
      await this.getSectores({ activo: true });

      // Pre-cargar GES comunes
      await this.getGESComunes(10);

      // Pre-cargar estadísticas
      await this.getGESCountByRiesgo();

      console.log('✅ Cache warming completado');
    } catch (error) {
      console.error('❌ Error en cache warming:', error.message);
    }
  }

  // ========================================
  // VALIDACIÓN DE CATÁLOGO (H3 - UX Audit)
  // ========================================

  /**
   * Validar que todas las categorías de riesgos esperadas tengan al menos 1 GES
   * Detecta categorías faltantes que impactan compliance legal
   * @returns {Promise<Object>} - { ok, total, existing, missing[], details }
   */
  async validateRiesgoCategories() {
    try {
      // Categorías esperadas según Resolución 0312 de 2019 (SST Colombia)
      const expectedCategories = [
        'Mecánico',
        'Eléctrico',
        'Físico',
        'Químico',
        'Biológico',
        'Biomecánico',
        'Factores Humanos',
        'Psicosocial',
        'Locativo',
        'Natural',
        'Seguridad',
        'Otros Riesgos',
        'Saneamiento Básico',
        'Salud Pública'
      ];

      // Consultar BD: obtener categorías existentes con conteo
      const results = await CatalogoRepository.getGESCountByRiesgo();

      // Mapear a array simple de nombres de categorías
      const existingCategories = results.map(r => r.riesgo_nombre || r.tipo_riesgo);

      // Identificar categorías faltantes
      const missingCategories = expectedCategories.filter(
        cat => !existingCategories.includes(cat)
      );

      // Generar detalles por categoría
      const details = expectedCategories.map(cat => {
        const found = results.find(r =>
          (r.riesgo_nombre || r.tipo_riesgo) === cat
        );

        return {
          categoria: cat,
          existe: !!found,
          cantidad_ges: found ? found.total : 0
        };
      });

      const validationResult = {
        ok: missingCategories.length === 0,
        total: expectedCategories.length,
        existing: existingCategories.length,
        missing: missingCategories,
        details,
        timestamp: new Date().toISOString()
      };

      // Log warning si hay categorías faltantes
      if (!validationResult.ok) {
        console.warn(`⚠️  [CATÁLOGO] Categorías faltantes detectadas: ${missingCategories.join(', ')}`);
        console.warn(`⚠️  [CATÁLOGO] Esto puede causar compliance issues (Resolución 0312)`);
      }

      return validationResult;

    } catch (error) {
      console.error('❌ Error validando categorías de riesgo:', error);
      throw error;
    }
  }

  // ========================================
  // ENRIQUECIMIENTO DE DATOS DEL WIZARD
  // ========================================

  /**
   * Obtener detalles completos de un GES desde catálogo (para enriquecer datos del wizard)
   * @param {string} nombreRiesgo - Nombre de la categoría de riesgo (ej: "Biomecánico")
   * @param {string} nombreGES - Nombre del GES (ej: "Postura prolongada...")
   * @returns {Promise<Object|null>} Datos completos del GES o null si no existe
   */
  async obtenerDetallesGES(nombreRiesgo, nombreGES) {
    const cacheKey = this._generateCacheKey('ges:detalles', { nombreRiesgo, nombreGES });

    // Intentar desde cache
    let data = await this._getFromCache(cacheKey);
    if (data) return data;

    try {
      // Query con JOIN para obtener datos completos
      const gesInfo = await CatalogoRepository.findGESByNombre(nombreRiesgo, nombreGES);

      if (!gesInfo) {
        console.warn(`⚠️ GES no encontrado en catálogo: ${nombreRiesgo} - ${nombreGES}`);
        return null;
      }

      // Mapear datos de BD a estructura esperada por generadores
      data = {
        nombreRiesgo: gesInfo.categoria_riesgo || nombreRiesgo,
        nombreGES: gesInfo.nombre,

        // Campos que estaban faltando en Excel
        efectosPosibles: gesInfo.consecuencias || 'Por determinar',
        peorConsecuencia: gesInfo.peor_consecuencia || 'Por determinar',

        // Medidas de intervención (jerarquía de controles)
        medidasIntervencion: gesInfo.medidas_intervencion || {
          eliminacion: 'No aplica',
          sustitucion: 'No aplica',
          controlesIngenieria: 'No aplica',
          controlesAdministrativos: 'No aplica'
        },

        // EPP sugeridos
        eppSugeridos: gesInfo.epp_sugeridos || [],

        // Datos adicionales para profesiograma
        aptitudesRequeridas: gesInfo.aptitudes_requeridas || [],
        condicionesIncompatibles: gesInfo.condiciones_incompatibles || [],
        examenesMedicos: gesInfo.examenes_medicos || {}
      };

      // Guardar en cache
      await this._setCache(cacheKey, data, this.ttl.ges);

      return data;

    } catch (error) {
      console.error(`❌ Error consultando catálogo para ${nombreRiesgo} - ${nombreGES}:`, error);
      return null;
    }
  }

  /**
   * Enriquecer datos de GES con información del catálogo
   * Prioriza lo que el usuario ya ingresó, usa catálogo como fallback
   *
   * @param {Object} gesData - Datos del GES desde el wizard
   * @returns {Promise<Object>} GES enriquecido con datos del catálogo
   */
  async enriquecerGES(gesData) {
    // Si no hay nombre de riesgo o GES, retornar sin cambios
    if (!gesData.riesgo || !gesData.ges) {
      console.warn('⚠️ GES sin riesgo o nombre, saltando enriquecimiento:', gesData);
      return gesData;
    }

    const detalles = await this.obtenerDetallesGES(gesData.riesgo, gesData.ges);

    // Si no hay datos en catálogo, retornar original
    if (!detalles) {
      return gesData;
    }

    // ✅ CRÍTICO: Separar CONTROLES EXISTENTES (usuario) de MEDIDAS DE INTERVENCIÓN (BD)
    return {
      ...gesData,

      // Efectos y consecuencias (críticos para Excel)
      efectosPosibles: gesData.efectosPosibles || detalles.efectosPosibles,
      peorConsecuencia: gesData.peorConsecuencia || detalles.peorConsecuencia,

      // 🔹 CONTROLES EXISTENTES (lo que YA tiene la empresa - ingresado por usuario)
      // Estos vienen del wizard en gesData.controles: { fuente, medio, individuo }
      controles: gesData.controles || {
        fuente: '',
        medio: '',
        individuo: ''
      },

      // 🔹 MEDIDAS DE INTERVENCIÓN (sugerencias de la BD - 5 campos GTC-45)
      medidasIntervencion: {
        eliminacion: detalles.medidasIntervencion?.eliminacion || 'No aplica',
        sustitucion: detalles.medidasIntervencion?.sustitucion || 'No aplica',
        controlesIngenieria: detalles.medidasIntervencion?.controlesIngenieria ||
                            detalles.medidasIntervencion?.controles_ingenieria ||
                            'No aplica',
        controlesAdministrativos: detalles.medidasIntervencion?.controlesAdministrativos ||
                                 detalles.medidasIntervencion?.controles_administrativos ||
                                 'No aplica',
        epp: (detalles.eppSugeridos || []).join(', ') || 'No aplica'
      },

      // Datos adicionales para profesiograma
      eppSugeridos: detalles.eppSugeridos || [],
      aptitudesRequeridas: detalles.aptitudesRequeridas || [],
      condicionesIncompatibles: detalles.condicionesIncompatibles || [],
      examenesMedicos: detalles.examenesMedicos || {}
    };
  }

  /**
   * Enriquecer todos los GES de un cargo
   * @param {Object} cargo - Datos del cargo con gesSeleccionados
   * @returns {Promise<Object>} Cargo con GES enriquecidos
   */
  async enriquecerCargo(cargo) {
    if (!cargo.gesSeleccionados || !Array.isArray(cargo.gesSeleccionados)) {
      console.warn('⚠️ Cargo sin gesSeleccionados válidos:', cargo.cargoName);
      return cargo;
    }

    console.log(`📚 Enriqueciendo ${cargo.gesSeleccionados.length} GES para cargo: ${cargo.cargoName}`);

    const gesEnriquecidos = [];
    for (const ges of cargo.gesSeleccionados) {
      const gesEnriquecido = await this.enriquecerGES(ges);
      gesEnriquecidos.push(gesEnriquecido);
    }

    return {
      ...cargo,
      gesSeleccionados: gesEnriquecidos
    };
  }

  /**
   * Enriquecer todos los cargos de un formulario
   * @param {Object} formData - Datos del formulario completo
   * @returns {Promise<Object>} FormData con todos los cargos enriquecidos
   */
  async enriquecerFormData(formData) {
    if (!formData.cargos || !Array.isArray(formData.cargos)) {
      console.warn('⚠️ FormData sin cargos válidos');
      return formData;
    }

    console.log(`📦 Enriqueciendo ${formData.cargos.length} cargos del formulario`);

    const cargosEnriquecidos = [];
    for (const cargo of formData.cargos) {
      const cargoEnriquecido = await this.enriquecerCargo(cargo);
      cargosEnriquecidos.push(cargoEnriquecido);
    }

    return {
      ...formData,
      cargos: cargosEnriquecidos
    };
  }
}

// Exportar instancia única (singleton)
export default new CatalogoService();
