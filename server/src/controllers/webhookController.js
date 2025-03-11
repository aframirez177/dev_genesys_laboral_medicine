// server/src/controllers/webhookController.js
import config from '../config/env.js';
import messageHandler from '../services/messageHandler.js';
import whatsappService from '../services/whatsappService.js';

class WebhookController {
  async handleIncoming(req, res) {
    try {
      // Enviar respuesta de inmediato
      res.status(200).send('EVENT_RECEIVED');
      
      const body = req.body;
      const message = body.entry?.[0]?.changes[0]?.value?.messages?.[0];
      const senderInfo = body.entry?.[0]?.changes[0]?.value?.contacts?.[0];
      
      if (message) {
        await messageHandler.handleIncomingMessage(message, senderInfo);
      }
    } catch (error) {
      console.error('Error in webhook handler:', error);
    }
  }

  verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && whatsappService.isValidVerifyToken(token)) {
      res.status(200).send(challenge);
      console.log('Webhook verified successfully!');
    } else {
      res.sendStatus(403);
    }
  }

  async sendMessageEndpoint(req, res) {
    try {
      const { to, message } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ error: 'Se requieren los campos "to" y "message"' });
      }
      
      const result = await whatsappService.sendMessage(to, message);
      
      if (result.success) {
        res.status(200).json({ success: true, message: 'Mensaje enviado correctamente' });
      } else {
        res.status(500).json({ success: false, error: 'Error al enviar mensaje' });
      }
    } catch (error) {
      console.error('Error in sendMessage endpoint:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default new WebhookController();