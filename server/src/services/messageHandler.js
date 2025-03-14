import whatsappService from './whatsappService.js';

class MessageHandler {
    async handleIncomingMessage(message, senderInfo) {
        if (message?.type === 'text') {
        const incomingMessage = message.text.body.toLowerCase().trim();

        if(this.isGreeting(incomingMessage)){
            await this.sendWelcomeMessage(message.from, message.id, senderInfo)
        } else{
            const response = `Echo: ${message.text.body}`;
            await whatsappService.sendMessage(message.from, response, message.id);
        }
        await whatsappService.markAsRead(message.id);
        }
    }

    isGreeting(message) {
        const greetings = ["hola", "buenas", "buen", "hello", "buenos"];
        // Verifica si el mensaje contiene alguno de los saludos
        return greetings.some(greeting => message.includes(greeting));
    }

    getSenderName(senderInfo){
        const fullName = senderInfo.profile?.name || senderInfo.wa_id || "";
        
        // Usando regex para extraer el primer nombre
        const regex = /^(\S+)/;
        const match = fullName.match(regex);
        
        // Si hay coincidencia, devuelve el primer grupo capturado, si no, devuelve el nombre completo
        return match ? match[1] : fullName;
    }

    async sendWelcomeMessage(to, messageId, senderInfo) {
        const name = this.getSenderName(senderInfo);
        const welcomeMessage =`¡Hola ${name}! 👋 Gracias por contactarte con Genesys Laboral Medicine. `+"¿En qué podemos ayudarte hoy?";
        await whatsappService.sendMessage(to, welcomeMessage, messageId)
    }

}

export default new MessageHandler();