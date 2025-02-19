import { generarMatrizExcel } from '../src/controllers/matriz-riesgos.controller';

describe('Matriz de Riesgos Generator', () => {
    test('should generate Excel file from valid form data', async () => {
        const mockFormData = {
            cargos: [{
                cargoName: 'Test Cargo',
                area: 'Test Area',
                // Add more test data
            }]
        };

        const result = await generarMatrizExcel(mockFormData);
        expect(result).toBeTruthy();
        expect(Buffer.isBuffer(result)).toBeTruthy();
    });
});