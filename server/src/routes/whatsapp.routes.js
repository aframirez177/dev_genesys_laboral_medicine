// server/src/routes/whatsapp.routes.js
import express from 'express';
import { verifyWebhook, receiveMessage, sendMessage } from '../controllers/whatsapp.controller.js';

const router = express.Router();

// Ruta para la verificación del webhook (GET)
router.get('/webhook', verifyWebhook);

// Ruta para recibir mensajes (POST)
router.post('/webhook', receiveMessage);

// Ruta para enviar mensajes
router.post('/send', sendMessage);

export default router;