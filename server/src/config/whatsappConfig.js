import dotenv from 'dotenv';
    
    dotenv.config();
    
    export default {
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    PORT: process.env.PORT || 3000,
    API_VERSION: process.env.API_VERSION,
    };