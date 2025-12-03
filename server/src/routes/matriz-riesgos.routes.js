// server/src/routes/matriz-riesgos.routes.js
import { Router } from 'express';
import { generarMatrizExcel } from '../controllers/matriz-riesgos.controller.js';

const router = Router();

/**
 * @route   POST /api/matriz-riesgos/generar-excel
 * @desc    Genera y descarga la matriz de riesgos GTC-45 en formato Excel
 * @access  Public
 */
router.post('/generar-excel', async (req, res) => {
    try {
        const { formData, companyName, nit } = req.body;

        if (!formData || !formData.cargos || formData.cargos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay datos de cargos para generar la matriz'
            });
        }

        const excelBuffer = await generarMatrizExcel(formData, {
            companyName: companyName || formData.nombreEmpresa || 'Empresa',
            nit: nit || formData.nit || 'N/A',
            diligenciadoPor: formData.diligenciadoPor || 'Genesys BI'
        });

        const fileName = `Matriz_GTC45_${(companyName || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(excelBuffer);

    } catch (error) {
        console.error('Error generando Excel de matriz:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el archivo Excel',
            error: error.message
        });
    }
});

export default router;