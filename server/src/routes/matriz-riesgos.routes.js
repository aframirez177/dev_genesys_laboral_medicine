// server/src/routes/matriz-riesgos.routes.js
import express from 'express';
import { generarMatrizExcel } from '../controllers/matriz-riesgos.controller.js';

const router = express.Router();

router.post('/generar', async (req, res) => {
    try {
        // Add input validation
        if (!req.body || !req.body.cargos) {
            return res.status(400).json({
                success: false,
                error: 'Datos de formulario inválidos'
            });
        }

        const datosFormulario = req.body;
        const excelBuffer = await generarMatrizExcel(datosFormulario);
        
        // Set proper headers for Excel download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=matriz-riesgos.xlsx');
        res.send(excelBuffer);
    } catch (error) {
        console.error('Error al generar matriz:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar la matriz de riesgos'
        });
    }
});

export default router;