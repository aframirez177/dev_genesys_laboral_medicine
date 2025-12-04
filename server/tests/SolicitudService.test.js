// server/tests/SolicitudService.test.js
import SolicitudService from '../src/services/SolicitudService.js';
import db from '../src/config/database.js';
import { addDocumentoJob } from '../src/config/queue.js';

// Mocks
jest.mock('../src/config/database.js');
jest.mock('../src/config/queue.js');
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  genSalt: jest.fn().mockResolvedValue('salt')
}));
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({ toString: () => 'mock_token_123' })
}));

describe('SolicitudService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crearSolicitud', () => {
    it('debe crear solicitud y encolar job', async () => {
      const mockFormData = {
        cargos: [
          {
            cargoName: 'Operario',
            area: 'Producción',
            gesSeleccionados: [
              { riesgo: 'RF', ges: 'Ruido', niveles: { deficiencia: { value: 6 }, exposicion: { value: 4 }, consecuencia: { value: 25 } }, controles: {} }
            ]
          }
        ]
      };

      const mockUserData = {
        nombreEmpresa: 'Empresa Test',
        nit: '123456789',
        email: 'test@test.com',
        password: 'password123',
        nombreContacto: 'Juan Pérez'
      };

      // Mock de transacción
      const mockTrx = {
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn()
      };

      mockTrx.insert.mockReturnValue(mockTrx);
      mockTrx.returning.mockResolvedValue([{ id: 1, nombre_legal: 'Empresa Test', nit: '123456789' }]);
      mockTrx.where.mockReturnValue(mockTrx);
      mockTrx.first.mockResolvedValue({ id: 1, nombre: 'cliente_empresa' });

      db.transaction = jest.fn().mockResolvedValue(mockTrx);
      db.mockReturnValue(mockTrx);

      addDocumentoJob.mockResolvedValue({ id: 'job_123' });

      const result = await SolicitudService.crearSolicitud(mockFormData, mockUserData);

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock_token_123');
      expect(result.jobId).toBe('job_123');
      expect(result.pricing.total).toBe(90000); // 3 documentos * 30k * 1 cargo
      expect(addDocumentoJob).toHaveBeenCalled();
    });

    it('debe validar datos faltantes', async () => {
      await expect(
        SolicitudService.crearSolicitud(null, null)
      ).rejects.toThrow('Faltan datos requeridos');
    });

    it('debe validar cargos vacíos', async () => {
      const mockFormData = { cargos: [] };
      const mockUserData = {
        nombreEmpresa: 'Test',
        nit: '123',
        email: 'test@test.com',
        password: 'pass'
      };

      await expect(
        SolicitudService.crearSolicitud(mockFormData, mockUserData)
      ).rejects.toThrow('Se requiere al menos un cargo');
    });
  });

  describe('_calcularPricing', () => {
    it('debe calcular pricing correctamente', () => {
      const service = SolicitudService;
      const pricing = service._calcularPricing(5);

      expect(pricing.numCargos).toBe(5);
      expect(pricing.precioBase).toBe(30000);
      expect(pricing.precioMatriz).toBe(150000); // 30k * 5
      expect(pricing.precioProfesiograma).toBe(150000);
      expect(pricing.precioPerfil).toBe(150000);
      expect(pricing.precioCotizacion).toBe(0); // Gratis
      expect(pricing.total).toBe(450000); // 3 * 150k
    });
  });

  describe('obtenerEstadoPorToken', () => {
    it('debe obtener estado de documento existente', async () => {
      const mockDocumento = {
        id: 1,
        estado: 'procesando',
        progreso: 50,
        error: null,
        preview_urls: '{}',
        pricing: '{"total":90000}',
        num_cargos: 1,
        nombre_responsable: 'Juan',
        job_id: 'job_123',
        created_at: new Date(),
        updated_at: new Date()
      };

      db.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockDocumento)
      });

      const result = await SolicitudService.obtenerEstadoPorToken('token_123');

      expect(result.documentoId).toBe(1);
      expect(result.estado).toBe('procesando');
      expect(result.progreso).toBe(50);
    });

    it('debe lanzar error si documento no existe', async () => {
      db.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      await expect(
        SolicitudService.obtenerEstadoPorToken('token_invalido')
      ).rejects.toThrow('Documento no encontrado');
    });
  });
});
