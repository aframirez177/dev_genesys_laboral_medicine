// server/tests/CatalogoService.test.js
import CatalogoService from '../src/services/CatalogoService.js';
import CatalogoRepository from '../src/repositories/CatalogoRepository.js';

// Mock del repository
jest.mock('../src/repositories/CatalogoRepository.js');

describe('CatalogoService', () => {

  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    // Limpiar cache de memoria
    CatalogoService.memoryCache.clear();
    CatalogoService.resetCacheStats();
  });

  describe('getRiesgos', () => {
    it('debe obtener riesgos del repository', async () => {
      const mockRiesgos = [
        { id: 1, codigo: 'RF', nombre: 'Riesgo Físico' },
        { id: 2, codigo: 'RB', nombre: 'Riesgo Biomecánico' }
      ];

      CatalogoRepository.getAllRiesgos = jest.fn().mockResolvedValue(mockRiesgos);

      const result = await CatalogoService.getRiesgos();

      expect(result).toEqual(mockRiesgos);
      expect(CatalogoRepository.getAllRiesgos).toHaveBeenCalledTimes(1);
    });

    it('debe cachear los resultados', async () => {
      const mockRiesgos = [
        { id: 1, codigo: 'RF', nombre: 'Riesgo Físico' }
      ];

      CatalogoRepository.getAllRiesgos = jest.fn().mockResolvedValue(mockRiesgos);

      // Primera llamada
      await CatalogoService.getRiesgos();
      // Segunda llamada (debe usar cache)
      await CatalogoService.getRiesgos();

      // Repository solo debe ser llamado una vez
      expect(CatalogoRepository.getAllRiesgos).toHaveBeenCalledTimes(1);
    });
  });

  describe('buscarGES', () => {
    it('debe buscar GES con filtros', async () => {
      const mockResult = {
        data: [
          { id: 1, nombre: 'Ruido continuo', riesgo_codigo: 'RF' }
        ],
        total: 1,
        page: 1,
        limit: 50,
        hasMore: false
      };

      CatalogoRepository.findGES = jest.fn().mockResolvedValue(mockResult);

      const result = await CatalogoService.buscarGES({
        riesgoCodigo: 'RF',
        limit: 50,
        offset: 0
      });

      expect(result).toEqual(mockResult);
      expect(CatalogoRepository.findGES).toHaveBeenCalledWith({
        riesgoCodigo: 'RF',
        limit: 50,
        offset: 0
      });
    });
  });

  describe('getGESComunes', () => {
    it('debe obtener top 10 GES comunes', async () => {
      const mockGES = [
        { id: 1, nombre: 'Ruido', es_comun: true },
        { id: 2, nombre: 'Iluminación', es_comun: true }
      ];

      CatalogoRepository.getGESComunes = jest.fn().mockResolvedValue(mockGES);

      const result = await CatalogoService.getGESComunes(10);

      expect(result).toEqual(mockGES);
      expect(CatalogoRepository.getGESComunes).toHaveBeenCalledWith(10);
    });
  });

  describe('Cache Stats', () => {
    it('debe trackear cache hits y misses', async () => {
      const mockRiesgos = [{ id: 1, codigo: 'RF' }];
      CatalogoRepository.getAllRiesgos = jest.fn().mockResolvedValue(mockRiesgos);

      // Primera llamada - miss
      await CatalogoService.getRiesgos();

      // Segunda llamada - hit
      await CatalogoService.getRiesgos();

      const stats = CatalogoService.getCacheStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe('50.00%');
    });
  });

  describe('invalidateAllCache', () => {
    it('debe limpiar todo el cache', async () => {
      const mockRiesgos = [{ id: 1, codigo: 'RF' }];
      CatalogoRepository.getAllRiesgos = jest.fn().mockResolvedValue(mockRiesgos);

      // Crear cache
      await CatalogoService.getRiesgos();

      // Invalidar
      await CatalogoService.invalidateAllCache();

      // Nueva llamada debe ir al repository
      await CatalogoService.getRiesgos();

      expect(CatalogoRepository.getAllRiesgos).toHaveBeenCalledTimes(2);
    });
  });
});
