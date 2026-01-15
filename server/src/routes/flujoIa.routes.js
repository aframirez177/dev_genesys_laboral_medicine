// server/src/routes/flujoIa.routes.js
import { Router } from 'express';
import { registrarYGenerar, registrarRapido } from '../controllers/flujoIa.controller.js';

const router = Router();

// Endpoint original (síncrono, espera a generar todo)
router.post('/registrar-y-generar', registrarYGenerar);

// 🆕 Endpoint rápido (responde inmediato, genera en background)
// Registra usuario → JWT → Redirige a dashboard → Genera docs en background
router.post('/registrar-rapido', registrarRapido);

export default router;