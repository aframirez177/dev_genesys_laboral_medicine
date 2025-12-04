// server/src/services/payu.service.js
import crypto from 'crypto';
import { getEnvVars } from '../config/env.js';
import db from '../config/database.js';

/**
 * SERVICE: PayUService
 * Maneja la integración con PayU Colombia (Latam)
 * - Generación de pagos
 * - Verificación de firmas
 * - Manejo de webhooks
 */
class PayUService {
  constructor() {
    const env = getEnvVars();
    
    // Configuración de PayU
    this.apiKey = env.PAYU_API_KEY;
    this.apiLogin = env.PAYU_API_LOGIN;
    this.merchantId = env.PAYU_MERCHANT_ID;
    this.accountId = env.PAYU_ACCOUNT_ID;
    this.isTest = env.PAYU_TEST !== false; // Por defecto en modo prueba
    
    // URLs de PayU
    this.checkoutUrl = this.isTest 
      ? 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/'
      : 'https://checkout.payulatam.com/ppp-web-gateway-payu/';
    
    this.apiUrl = this.isTest
      ? 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi'
      : 'https://api.payulatam.com/payments-api/4.0/service.cgi';
    
    this.queriesUrl = this.isTest
      ? 'https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi'
      : 'https://api.payulatam.com/reports-api/4.0/service.cgi';

    console.log(`💳 PayU Service inicializado - Modo: ${this.isTest ? 'SANDBOX' : 'PRODUCCIÓN'}`);
  }

  /**
   * Genera la firma MD5 para PayU
   * Formato: ApiKey~merchantId~referenceCode~amount~currency
   * @param {string} referenceCode - Código de referencia único
   * @param {number} amount - Monto total
   * @param {string} currency - Moneda (default: COP)
   * @returns {string} Firma MD5
   */
  generateSignature(referenceCode, amount, currency = 'COP') {
    const signatureString = `${this.apiKey}~${this.merchantId}~${referenceCode}~${amount}~${currency}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');
    
    console.log(`🔐 Firma generada para referencia ${referenceCode}`);
    return signature;
  }

  /**
   * Verifica la firma recibida en la respuesta/webhook de PayU
   * Formato de respuesta: ApiKey~merchantId~referenceCode~new_value~currency~transactionState
   * @param {Object} responseData - Datos de la respuesta de PayU
   * @returns {boolean} true si la firma es válida
   */
  verifySignature(responseData) {
    const {
      reference_sale: referenceCode,
      value: amount,
      currency = 'COP',
      state_pol: transactionState,
      sign: receivedSignature
    } = responseData;

    if (!receivedSignature) {
      console.warn('⚠️ No se recibió firma en la respuesta de PayU');
      return false;
    }

    // PayU usa un formato diferente para la firma de respuesta
    // Aplica redondeo específico de PayU (1 decimal si termina en .0, 2 decimales si no)
    const roundedAmount = this._roundPayUAmount(parseFloat(amount));
    
    const signatureString = `${this.apiKey}~${this.merchantId}~${referenceCode}~${roundedAmount}~${currency}~${transactionState}`;
    const calculatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');

    const isValid = calculatedSignature === receivedSignature;
    
    if (!isValid) {
      console.error('❌ Firma inválida en respuesta PayU');
      console.error(`   Esperada: ${calculatedSignature}`);
      console.error(`   Recibida: ${receivedSignature}`);
    } else {
      console.log('✅ Firma de PayU verificada correctamente');
    }

    return isValid;
  }

  /**
   * Redondea el monto según las reglas de PayU
   * @private
   */
  _roundPayUAmount(amount) {
    const rounded = Math.round(amount * 100) / 100;
    // Si termina en .00, usar 1 decimal; de lo contrario, 2 decimales
    if (rounded % 1 === 0) {
      return rounded.toFixed(1);
    }
    return rounded.toFixed(2);
  }

  /**
   * Crea los datos del formulario de pago para PayU WebCheckout
   * @param {Object} paymentData - Datos del pago
   * @param {string} paymentData.referenceCode - Código de referencia único (token del documento)
   * @param {number} paymentData.amount - Monto total a pagar
   * @param {string} paymentData.description - Descripción del pago
   * @param {Object} paymentData.buyer - Datos del comprador
   * @param {string} paymentData.responseUrl - URL de redirección después del pago
   * @param {string} paymentData.confirmationUrl - URL de webhook para confirmación
   * @returns {Object} Datos del formulario para enviar a PayU
   */
  createPayment(paymentData) {
    const {
      referenceCode,
      amount,
      description = 'Documentos Genesys LM',
      buyer = {},
      responseUrl,
      confirmationUrl
    } = paymentData;

    if (!referenceCode || !amount) {
      throw new Error('referenceCode y amount son requeridos');
    }

    const currency = 'COP';
    const tax = Math.round(amount * 0.19 / 1.19); // IVA incluido en el precio
    const taxReturnBase = amount - tax;

    const signature = this.generateSignature(referenceCode, amount, currency);

    const formData = {
      // Identificación del comercio
      merchantId: this.merchantId,
      accountId: this.accountId,
      
      // Firma de seguridad
      signature,
      
      // Datos de la transacción
      referenceCode,
      amount,
      tax,
      taxReturnBase,
      currency,
      description,
      
      // Modo de prueba
      test: this.isTest ? '1' : '0',
      
      // Datos del comprador (opcionales pero recomendados)
      buyerEmail: buyer.email || '',
      buyerFullName: buyer.fullName || '',
      telephone: buyer.phone || '',
      
      // Dirección de facturación (opcional)
      billingAddress: buyer.address || '',
      billingCity: buyer.city || 'Bogotá',
      billingCountry: 'CO',
      
      // URLs de callback
      responseUrl: responseUrl || `${process.env.FRONTEND_URL}/pages/payment-response.html`,
      confirmationUrl: confirmationUrl || `${process.env.API_URL}/api/payu/webhook`,
      
      // Idioma
      lng: 'es'
    };

    console.log(`💳 Pago creado para referencia ${referenceCode}:`, {
      amount,
      tax,
      buyer: buyer.email
    });

    return {
      checkoutUrl: this.checkoutUrl,
      formData
    };
  }

  /**
   * Procesa el webhook de confirmación de PayU
   * @param {Object} webhookData - Datos recibidos del webhook
   * @returns {Object} Resultado del procesamiento
   */
  async handleWebhook(webhookData) {
    console.log('📩 Webhook PayU recibido:', JSON.stringify(webhookData, null, 2));

    // Verificar firma
    const isValid = this.verifySignature(webhookData);
    if (!isValid) {
      throw new Error('Firma de webhook inválida');
    }

    const {
      reference_sale: referenceCode,
      state_pol: transactionState,
      transaction_id: transactionId,
      payment_method_name: paymentMethod,
      value: amount,
      response_message_pol: responseMessage
    } = webhookData;

    // Mapear estados de PayU a estados internos
    const estadosMap = {
      '4': 'pagado',      // Aprobada
      '6': 'rechazado',   // Rechazada
      '5': 'fallido',     // Expirada
      '7': 'pendiente',   // Pendiente
      '14': 'pendiente'   // En proceso
    };

    const nuevoEstado = estadosMap[transactionState] || 'pendiente';

    // Actualizar estado en la base de datos
    try {
      const documento = await db('documentos_generados')
        .where({ token: referenceCode })
        .first();

      if (!documento) {
        console.error(`❌ Documento no encontrado para token: ${referenceCode}`);
        return {
          success: false,
          error: 'Documento no encontrado',
          referenceCode
        };
      }

      // Solo actualizar si el pago fue aprobado o es un estado diferente al actual
      if (nuevoEstado === 'pagado' || documento.estado !== nuevoEstado) {
        await db('documentos_generados')
          .where({ token: referenceCode })
          .update({
            estado: nuevoEstado === 'pagado' ? 'completado' : nuevoEstado,
            payment_data: JSON.stringify({
              transactionId,
              paymentMethod,
              amount: parseFloat(amount),
              responseMessage,
              processedAt: new Date().toISOString()
            }),
            updated_at: db.fn.now()
          });

        console.log(`✅ Documento ${documento.id} actualizado a estado: ${nuevoEstado}`);
      }

      return {
        success: true,
        referenceCode,
        documentoId: documento.id,
        nuevoEstado,
        transactionId,
        message: responseMessage
      };

    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      throw error;
    }
  }

  /**
   * Consulta el estado de un pago en PayU
   * @param {string} referenceCode - Código de referencia
   * @returns {Object} Estado del pago
   */
  async getPaymentStatus(referenceCode) {
    // Primero consultamos en nuestra BD
    const documento = await db('documentos_generados')
      .where({ token: referenceCode })
      .select('id', 'estado', 'payment_data', 'pricing', 'updated_at')
      .first();

    if (!documento) {
      throw new Error(`Documento no encontrado: ${referenceCode}`);
    }

    let paymentData = {};
    try {
      paymentData = typeof documento.payment_data === 'string'
        ? JSON.parse(documento.payment_data)
        : documento.payment_data || {};
    } catch (e) {
      console.warn('Error parseando payment_data:', e);
    }

    let pricing = {};
    try {
      pricing = typeof documento.pricing === 'string'
        ? JSON.parse(documento.pricing)
        : documento.pricing || {};
    } catch (e) {
      console.warn('Error parseando pricing:', e);
    }

    return {
      referenceCode,
      documentoId: documento.id,
      estado: documento.estado,
      isPaid: documento.estado === 'completado',
      paymentData,
      pricing,
      updatedAt: documento.updated_at
    };
  }

  /**
   * Genera un código de referencia único para un documento
   * @param {number} documentoId - ID del documento
   * @returns {string} Código de referencia único
   */
  generateReferenceCode(documentoId) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `GLMD-${documentoId}-${timestamp}-${random}`;
  }
}

// Exportar instancia única (singleton)
export default new PayUService();

