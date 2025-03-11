// server/src/routes/whatsapp.routes.js
import express from 'express';
import webhookController from '../controllers/webhookController.js';

const router = express.Router();

router.post('/webhook', webhookController.handleIncoming);
router.get('/webhook', webhookController.verifyWebhook);
router.post('/send', webhookController.sendMessageEndpoint);

export default router;