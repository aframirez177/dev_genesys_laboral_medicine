// server/src/controllers/whatsapp.controller.js
import axios from 'axios';
import { getEnvVars } from '../config/env.js';

const env = getEnvVars();

// Configuración de WhatsApp API
const WHATSAPP_API_VERSION = 'v22.0';
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

/**
 * Verifica el webhook para WhatsApp cuando Meta intenta confirmar la URL
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
export function verifyWebhook(req, res) {
  try {
    console.log('Recibida solicitud de verificación de webhook');
    
    // Verifica la clave de verificación del webhook
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    const VERIFY_TOKEN = env.WHATSAPP_VERIFY_TOKEN;
    
    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado correctamente');
      // Responde con el challenge que envía Meta para confirmar
      res.status(200).send(challenge);
    } else {
      // Token de verificación incorrecto o modo incorrecto
      console.error('Error en la verificación del webhook:', { mode, token });
      res.sendStatus(403);
    }
  } catch (error) {
    console.error('Error en verifyWebhook:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Recibe mensajes enviados por los usuarios a través de WhatsApp
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
export async function receiveMessage(req, res) {
  try {
    console.log('Mensaje recibido en webhook:', JSON.stringify(req.body, null, 2));
    
    // Siempre responde con un 200 OK rápidamente para cumplir con los requisitos de WhatsApp
    res.status(200).send('EVENT_RECEIVED');
    
    // Procesa el mensaje de forma asíncrona
    const body = req.body;
    
    if (body.object && body.entry && 
        body.entry[0].changes && 
        body.entry[0].changes[0].value.messages && 
        body.entry[0].changes[0].value.messages[0]) {
      
      const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = body.entry[0].changes[0].value.messages[0].from;
      const messageBody = body.entry[0].changes[0].value.messages[0].text.body;
      
      console.log(`Mensaje recibido - De: ${from}, Contenido: ${messageBody}`);
      
      // Aquí puedes implementar la lógica para responder al mensaje
      // Por ejemplo, respondiendo con un mensaje automático
      const WHATSAPP_TOKEN = env.WHATSAPP_TOKEN;
      
      await axios({
        method: 'POST',
        url: `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          to: from,
          text: {
            body: `¡Hola! Gracias por contactar a Genesys. Hemos recibido tu mensaje: "${messageBody}". Un asesor se comunicará contigo pronto.`
          }
        }
      });
      
    } else {
      console.log('Evento recibido sin mensajes');
    }
  } catch (error) {
    console.error('Error en receiveMessage:', error);
    // La respuesta HTTP ya fue enviada, así que solo registramos el error
  }
}

/**
 * Envía un mensaje a través de WhatsApp a un número específico
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
export async function sendMessage(req, res) {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Se requieren los campos "to" y "message"' });
    }
    
    const WHATSAPP_TOKEN = env.WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = env.WHATSAPP_PHONE_NUMBER_ID;
    
    const response = await axios({
      method: 'POST',
      url: `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to: to.startsWith('+') ? to : `+${to}`,
        text: { body: message }
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Mensaje enviado con éxito',
      data: response.data
    });
  } catch (error) {
    console.error('Error en sendMessage:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar el mensaje',
      details: error.response?.data || error.message
    });
  }
}