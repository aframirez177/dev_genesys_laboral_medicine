// server/src/routes/payu.routes.js
import express from 'express';
import {
  initPayment,
  confirmPayment,
  getPaymentStatus,
  paymentResponse,
  simulatePayment
} from '../controllers/payu.controller.js';

const router = express.Router();

/**
 * RUTAS DE PAYU
 * Base: /api/payu
 * 
 * Integración con PayU Colombia para procesamiento de pagos
 */

// POST /api/payu/init - Iniciar un pago (genera formulario para WebCheckout)
router.post('/init', initPayment);

// POST /api/payu/webhook - Webhook de confirmación de PayU
// Este endpoint es llamado por PayU cuando cambia el estado de una transacción
router.post('/webhook', confirmPayment);

// GET /api/payu/status/:referenceCode - Consultar estado de un pago
router.get('/status/:referenceCode', getPaymentStatus);

// GET /api/payu/response - Redirección después del pago (desde PayU)
router.get('/response', paymentResponse);

// POST /api/payu/simulate - Simular pago (solo desarrollo)
// Útil para testing sin pasar por PayU sandbox
router.post('/simulate', simulatePayment);

export default router;

