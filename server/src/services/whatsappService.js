import axios from 'axios';
import config from '../config/whatsappConfig.js';

class WhatsAppService {
    async sendMessage(to, body, messageId) {
        try {
        await axios({
            method: 'POST',
            url: `https://graph.facebook.com/${config.API_VERSION}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            headers: {
            Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
            },
            data: {
            messaging_product: 'whatsapp',
            to,
            text: { body },
            context: {
                message_id: messageId,
            },
            },
        });
        } catch (error) {
        console.error('Error sending message:', error);
        }
    }

    async markAsRead(messageId) {
        try {
        await axios({
            method: 'POST',
            url: `https://graph.facebook.com/${config.API_VERSION}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            headers: {
            Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
            },
            data: {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
            },
        });
        } catch (error) {
        console.error('Error marking message as read:', error);
        }
    }
}

export default new WhatsAppService();