/**
 * sectorLoader.js - Cargador inteligente de sectores económicos
 *
 * Resuelve el problema de timing donde SECTORES_ECONOMICOS puede estar undefined
 * al momento de renderizar. Implementa retry con exponential backoff.
 *
 * @module utils/sectorLoader
 */

let SECTORES_CACHE = null;
let CIUDADES_CACHE = null;

/**
 * Carga sectores económicos con retry automático
 *
 * @param {number} attempts - Número de intentos (default: 3)
 * @param {number} initialDelay - Delay inicial en ms (default: 100)
 * @returns {Promise<Array>} Array de sectores económicos
 */
export async function loadSectoresWithRetry(attempts = 3, initialDelay = 100) {
  // Si ya tenemos cache, retornar inmediatamente
  if (SECTORES_CACHE && SECTORES_CACHE.length > 0) {
    console.log('[SectorLoader] ✓ Returning cached SECTORES_ECONOMICOS:', SECTORES_CACHE.length);
    return SECTORES_CACHE;
  }

  // Intentar cargar con retry
  for (let i = 0; i < attempts; i++) {
    try {
      const module = await import('../../config/colombia-data.js');
      const { SECTORES_ECONOMICOS } = module;

      if (SECTORES_ECONOMICOS && SECTORES_ECONOMICOS.length > 0) {
        SECTORES_CACHE = SECTORES_ECONOMICOS;
        console.log(`[SectorLoader] ✓ Loaded SECTORES_ECONOMICOS on attempt ${i + 1}:`, SECTORES_ECONOMICOS.length);
        return SECTORES_ECONOMICOS;
      }

      console.warn(`[SectorLoader] Attempt ${i + 1}: SECTORES_ECONOMICOS empty or undefined`);
    } catch (error) {
      console.error(`[SectorLoader] Attempt ${i + 1} failed:`, error);
    }

    // Esperar antes del siguiente intento (exponential backoff)
    if (i < attempts - 1) {
      const delay = initialDelay * Math.pow(2, i); // 100ms, 200ms, 400ms
      console.log(`[SectorLoader] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error('[SectorLoader] ❌ Failed to load SECTORES_ECONOMICOS after', attempts, 'attempts');
  return [];
}

/**
 * Carga ciudades con retry automático
 *
 * @param {number} attempts - Número de intentos (default: 3)
 * @returns {Promise<Array>} Array de ciudades
 */
export async function loadCiudadesWithRetry(attempts = 3) {
  if (CIUDADES_CACHE && CIUDADES_CACHE.length > 0) {
    return CIUDADES_CACHE;
  }

  for (let i = 0; i < attempts; i++) {
    try {
      const module = await import('../../config/colombia-data.js');
      const { getCiudadesSimple } = module;

      if (getCiudadesSimple) {
        const ciudades = getCiudadesSimple();
        if (ciudades && ciudades.length > 0) {
          CIUDADES_CACHE = ciudades;
          console.log(`[SectorLoader] ✓ Loaded ciudades on attempt ${i + 1}:`, ciudades.length);
          return ciudades;
        }
      }
    } catch (error) {
      console.error(`[SectorLoader] Ciudades attempt ${i + 1} failed:`, error);
    }

    if (i < attempts - 1) {
      await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
    }
  }

  console.error('[SectorLoader] ❌ Failed to load ciudades');
  return [];
}

/**
 * Obtiene sectores desde cache (síncrono)
 * Útil para templates que necesitan acceso inmediato
 *
 * @returns {Array} Sectores en cache o array vacío
 */
export function getSectoresSync() {
  return SECTORES_CACHE || [];
}

/**
 * Obtiene ciudades desde cache (síncrono)
 *
 * @returns {Array} Ciudades en cache o array vacío
 */
export function getCiudadesSync() {
  return CIUDADES_CACHE || [];
}

/**
 * Precarga sectores y ciudades (llamar al inicio de la app)
 *
 * @returns {Promise<void>}
 */
export async function preloadCatalogos() {
  console.log('[SectorLoader] Preloading catalogos...');

  await Promise.all([
    loadSectoresWithRetry(),
    loadCiudadesWithRetry()
  ]);

  console.log('[SectorLoader] ✓ Catalogos preloaded successfully');
}
