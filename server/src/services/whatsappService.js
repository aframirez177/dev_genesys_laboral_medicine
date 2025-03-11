// server/src/services/whatsappService.js
import axios from 'axios';
import config from '../config/env.js';

class WhatsAppService {
    constructor() {
        this.apiVersion = config.WHATSAPP_API_VERSION || 'v22.0';
        this.apiUrl = `https://graph.facebook.com/${this.apiVersion}`;
        this.token = config.WHATSAPP_TOKEN;
        this.phoneNumberId = config.WHATSAPP_PHONE_NUMBER_ID;
        this.verifyToken = config.WHATSAPP_VERIFY_TOKEN;
    }

    /**
     * Envía un mensaje de texto a través de WhatsApp
     * @param {string} to - Número de teléfono del destinatario
     * @param {string} messageText - Texto del mensaje a enviar
     * @param {string} [messageId] - ID del mensaje al que se responde (opcional)
     * @returns {Promise<Object>} - Resultado de la petición a la API
     */
    async sendTextMessage(to, messageText, messageId = null, asReply = false) {
        try {
            const data = {
                messaging_product: 'whatsapp',
                to: to.startsWith('+') ? to : `+${to}`,
                text: { body: messageText }
            };

            // Añadir contexto si es una respuesta a un mensaje específico
            if (messageId && asReply) {
              data.context = { message_id: messageId };
          }

            const response = await axios({
                method: 'POST',
                url: `${this.apiUrl}/${this.phoneNumberId}/messages`,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                data
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al enviar mensaje a WhatsApp:', error);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Marca un mensaje como leído
     * @param {string} messageId - ID del mensaje a marcar como leído
     * @returns {Promise<Object>} - Resultado de la petición a la API
     */
    async markAsRead(messageId) {
        try {
            const response = await axios({
                method: 'POST',
                url: `${this.apiUrl}/${this.phoneNumberId}/messages`,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    messaging_product: 'whatsapp',
                    status: 'read',
                    message_id: messageId
                }
            });
            
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error al marcar mensaje como leído:', error);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * Verifica si un token de verificación de webhook es válido
     * @param {string} token - Token a verificar
     * @returns {boolean} - True si el token es válido
     */
    isValidVerifyToken(token) {
        return token === this.verifyToken;
    }

    /**
     * Obtiene el token de acceso y ID de teléfono para WhatsApp
     * @returns {Object} - Objeto con token y phone_number_id
     */
    getCredentials() {
        return {
            token: this.token,
            phoneNumberId: this.phoneNumberId
        };
    }
}

export default new WhatsAppService();