// server/src/routes/matriz-riesgos.routes.js
import { Router } from 'express';
// Importamos la nueva función del controlador
import { handleFormSubmission } from '../controllers/matriz-riesgos.controller.js';

const router = Router();

/**
 * @route   POST /api/matriz-riesgos/generar
 * @desc    Recibe los datos del formulario, los guarda en la BD y devuelve una URL de redirección.
 * @access  Public
 */
router.post('/generar', async (req, res) => {
    // Simplemente llamamos a nuestro nuevo controlador.
    // Toda la lógica de BD y respuesta está ahora encapsulada allí.
    await handleFormSubmission(req, res);
});


// NOTA: Más adelante añadiremos más rutas aquí, como por ejemplo:
// router.get('/documentos/:token', handleGetDocumentData);
// router.get('/descargar/:token/:tipo', handleDownloadFile);


export default router;