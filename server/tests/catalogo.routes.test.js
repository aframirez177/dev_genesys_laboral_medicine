// server/tests/catalogo.routes.test.js
import request from 'supertest';
import express from 'express';
import catalogoRoutes from '../src/routes/catalogo.routes.js';
import CatalogoService from '../src/services/CatalogoService.js';

// Mock del service
jest.mock('../src/services/CatalogoService.js');

const app = express();
app.use(express.json());
app.use('/api/catalogo', catalogoRoutes);

describe('Catalogo Routes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/catalogo/riesgos', () => {
    it('debe retornar lista de riesgos', async () => {
      const mockRiesgos = [
        { id: 1, codigo: 'RF', nombre: 'Riesgo Físico' },
        { id: 2, codigo: 'RB', nombre: 'Riesgo Biomecánico' }
      ];

      CatalogoService.getRiesgos.mockResolvedValue(mockRiesgos);

      const response = await request(app)
        .get('/api/catalogo/riesgos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockRiesgos);
      expect(response.body.total).toBe(2);
    });

    it('debe manejar errores correctamente', async () => {
      CatalogoService.getRiesgos.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/catalogo/riesgos')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/catalogo/ges', () => {
    it('debe buscar GES con filtros', async () => {
      const mockResult = {
        data: [{ id: 1, nombre: 'Ruido' }],
        total: 1,
        page: 1,
        limit: 50,
        hasMore: false
      };

      CatalogoService.buscarGES.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/catalogo/ges')
        .query({ riesgoCodigo: 'RF', limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult.data);
      expect(CatalogoService.buscarGES).toHaveBeenCalledWith(
        expect.objectContaining({
          riesgoCodigo: 'RF',
          limit: 10
        })
      );
    });
  });

  describe('GET /api/catalogo/ges/comunes', () => {
    it('debe retornar GES comunes', async () => {
      const mockGES = [
        { id: 1, nombre: 'Ruido', es_comun: true },
        { id: 2, nombre: 'Iluminación', es_comun: true }
      ];

      CatalogoService.getGESComunes.mockResolvedValue(mockGES);

      const response = await request(app)
        .get('/api/catalogo/ges/comunes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGES);
      expect(response.body.total).toBe(2);
    });
  });

  describe('GET /api/catalogo/ges/sector/:codigo', () => {
    it('debe retornar GES por sector', async () => {
      const mockGES = [
        { id: 1, nombre: 'Ruido', relevancia: 9 }
      ];

      CatalogoService.getGESBySector.mockResolvedValue(mockGES);

      const response = await request(app)
        .get('/api/catalogo/ges/sector/construccion')
        .query({ relevanciaMinima: 8, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGES);
      expect(CatalogoService.getGESBySector).toHaveBeenCalledWith('construccion', 8, 20);
    });
  });

  describe('GET /api/catalogo/stats', () => {
    it('debe retornar estadísticas', async () => {
      const mockStats = {
        gesByRiesgo: [
          { riesgo_codigo: 'RF', total: 18 },
          { riesgo_codigo: 'RB', total: 12 }
        ],
        cache: {
          hits: 100,
          misses: 20,
          hitRate: '83.33%'
        }
      };

      CatalogoService.getGESCountByRiesgo.mockResolvedValue(mockStats.gesByRiesgo);
      CatalogoService.getCacheStats.mockReturnValue(mockStats.cache);

      const response = await request(app)
        .get('/api/catalogo/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gesByRiesgo).toEqual(mockStats.gesByRiesgo);
      expect(response.body.data.cache).toEqual(mockStats.cache);
    });
  });

  describe('POST /api/catalogo/cache/invalidate', () => {
    it('debe invalidar cache exitosamente', async () => {
      CatalogoService.invalidateAllCache.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/catalogo/cache/invalidate')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(CatalogoService.invalidateAllCache).toHaveBeenCalled();
    });
  });
});
