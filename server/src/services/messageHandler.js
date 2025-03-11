// server/src/services/messageHandler.js
import whatsappService from './whatsappService.js';

class MessageHandler {
    constructor() {
        // Puedes inicializar aquí cualquier estado o configuración que necesites
        this.keywordResponses = {
            greetings: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos'],
            pricing: ['precio', 'costo', 'vale', 'valor', 'cuesta'],
            location: ['ubicación', 'dirección', 'ubicados', 'donde están'],
            schedule: ['horario', 'atienden', 'abierto']
        };
    }

    /**
     * Maneja un mensaje entrante y responde adecuadamente
     * @param {Object} message - Mensaje recibido
     * @param {Object} senderInfo - Información del remitente
     * @returns {Promise<void>}
     */
    async handleIncomingMessage(message, senderInfo) {
        try {
            if (!message) {
                throw new Error('No message provided');
            }

            const name = senderInfo?.profile?.name || 'Usuario';
            const phoneNumber = message.from;
            const messageId = message.id;

            if (message.type === 'text') {
                const text = message.text.body;
                console.log(`Mensaje de texto recibido de ${name} (${phoneNumber}): ${text}`);
                
                // Generar respuesta basada en el contenido
                const response = this.generateResponse(text, name);
                
                // Enviar respuesta
                await whatsappService.sendTextMessage(phoneNumber, response, messageId);
                
                // Marcar como leído
                await whatsappService.markAsRead(messageId);
            } else {
                console.log(`Mensaje tipo ${message.type} recibido, no se maneja actualmente`);
                
                // Respuesta genérica para tipos no soportados
                const response = `Hola ${name}, gracias por contactarnos. Por el momento no podemos procesar este tipo de mensaje. Por favor, envíanos un mensaje de texto.`;
                await whatsappService.sendTextMessage(phoneNumber, response, messageId);
            }
        } catch (error) {
            console.error('Error handling incoming message:', error);
        }
    }

    /**
     * Genera una respuesta basada en el contenido del mensaje
     * @param {string} messageText - Texto del mensaje recibido
     * @param {string} userName - Nombre del usuario
     * @returns {string} - Respuesta generada
     */
    generateResponse(messageText, userName) {
        const text = messageText.toLowerCase();
        
        // Verificar si contiene saludos
        if (this.containsAny(text, this.keywordResponses.greetings)) {
            return `¡Hola ${userName}! Gracias por contactar a Genesys. ¿En qué podemos ayudarte hoy?`;
        }
        
        // Verificar si pregunta por precios
        if (this.containsAny(text, this.keywordResponses.pricing)) {
            return `${userName}, para información sobre precios, por favor indica qué servicio te interesa: Matriz de Riesgos, Profesiograma o Exámenes Médicos.`;
        }
        
        // Verificar si pregunta por ubicación
        if (this.containsAny(text, this.keywordResponses.location)) {
            return 'Estamos ubicados en Calle 86a #23-12, Bogotá. Te esperamos!';
        }
        
        // Verificar si pregunta por horario
        if (this.containsAny(text, this.keywordResponses.schedule)) {
            return 'Nuestro horario de atención es de lunes a viernes de 6 am a 3 pm y los sábados de 6 am a 12 del medio día. Te esperamos!';
        }
        
        // Respuesta por defecto
        return `¡Gracias por contactar a Genesys! Hemos recibido tu mensaje: "${messageText}". Un asesor se comunicará contigo pronto.`;
    }

    /**
     * Verifica si un texto contiene alguna de las palabras clave
     * @param {string} text - Texto a verificar
     * @param {Array<string>} keywords - Lista de palabras clave
     * @returns {boolean} - true si contiene al menos una palabra clave
     */
    containsAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    /**
     * Verifica si un mensaje es un saludo
     * @param {string} message - Mensaje a verificar
     * @returns {boolean} - true si es un saludo
     */
    isGreeting(message) {
        return this.containsAny(message.toLowerCase(), this.keywordResponses.greetings);
    }

    /**
     * Envía un mensaje de bienvenida personalizado
     * @param {string} to - Número de teléfono del destinatario
     * @param {string} name - Nombre del usuario
     * @param {string} messageId - ID del mensaje original
     * @returns {Promise<Object>} - Resultado del envío
     */
    async sendWelcomeMessage(to, name, messageId) {
        const welcomeMessage = `Hola ${name}, bienvenido a Genesys Salud Ocupacional. ¿En qué podemos ayudarte hoy?`;
        return await whatsappService.sendTextMessage(to, welcomeMessage, messageId);
    }
}

export default new MessageHandler();