// server/src/routes/flujoIa.routes.js
import { Router } from 'express';
import { registrarYGenerar } from '../controllers/flujoIa.controller.js'; // Importa la función

const router = Router();

// Define la ruta POST que llamará tu frontend
router.post('/registrar-y-generar', registrarYGenerar);

export default router;