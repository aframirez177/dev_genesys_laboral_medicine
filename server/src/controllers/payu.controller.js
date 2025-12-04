// server/src/controllers/payu.controller.js
import payuService from '../services/payu.service.js';
import db from '../config/database.js';

/**
 * CONTROLLER: PayU
 * Endpoints para integración con PayU Colombia
 */

/**
 * POST /api/payu/init
 * Inicializa un pago y genera los datos del formulario para PayU WebCheckout
 * 
 * @body {
 *   token: string,           // Token del documento a pagar
 *   buyerEmail: string,      // Email del comprador (opcional)
 *   buyerFullName: string,   // Nombre del comprador (opcional)
 *   buyerPhone: string       // Teléfono del comprador (opcional)
 * }
 */
export async function initPayment(req, res) {
  try {
    const { token, buyerEmail, buyerFullName, buyerPhone } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token de documento requerido'
      });
    }

    // Buscar documento por token
    const documento = await db('documentos_generados')
      .where({ token })
      .first();

    if (!documento) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    // Verificar que el documento no esté ya pagado
    if (documento.estado === 'completado') {
      return res.status(400).json({
        success: false,
        error: 'Este documento ya fue pagado',
        estado: documento.estado
      });
    }

    // Obtener información de la empresa para el buyer
    const empresa = await db('empresas')
      .where({ id: documento.empresa_id })
      .first();

    // Obtener usuario si existe
    const usuario = documento.usuario_lead_id 
      ? await db('users').where({ id: documento.usuario_lead_id }).first()
      : null;

    // Parsear pricing del documento
    let pricing = {};
    try {
      pricing = typeof documento.pricing === 'string'
        ? JSON.parse(documento.pricing)
        : documento.pricing || {};
    } catch (e) {
      console.warn('Error parseando pricing:', e);
    }

    // Calcular monto total con IVA
    const subtotal = pricing.total || pricing.subtotal || 0;
    const iva = Math.round(subtotal * 0.19);
    const total = subtotal + iva;

    if (total <= 0) {
      return res.status(400).json({
        success: false,
        error: 'El monto a pagar debe ser mayor a 0'
      });
    }

    // Generar código de referencia (usamos el token del documento)
    const referenceCode = token;

    // Datos del comprador
    const buyer = {
      email: buyerEmail || usuario?.email || '',
      fullName: buyerFullName || usuario?.full_name || empresa?.nombre_legal || '',
      phone: buyerPhone || ''
    };

    // Descripción del pago
    const numCargos = documento.num_cargos || 1;
    const description = `Documentos SST - ${numCargos} cargo(s) - ${empresa?.nombre_legal || 'Cliente'}`;

    // Crear datos de pago
    const paymentData = payuService.createPayment({
      referenceCode,
      amount: total,
      description,
      buyer,
      responseUrl: `${process.env.FRONTEND_URL}/pages/payment-response.html?ref=${referenceCode}`,
      confirmationUrl: `${process.env.API_URL}/api/payu/webhook`
    });

    // Actualizar documento con estado de pago iniciado
    await db('documentos_generados')
      .where({ token })
      .update({
        estado: 'pago_iniciado',
        updated_at: db.fn.now()
      });

    console.log(`💳 Pago iniciado para documento ${documento.id}, monto: $${total.toLocaleString('es-CO')}`);

    res.json({
      success: true,
      checkoutUrl: paymentData.checkoutUrl,
      formData: paymentData.formData,
      summary: {
        subtotal,
        iva,
        total,
        numCargos,
        empresa: empresa?.nombre_legal,
        referenceCode
      }
    });

  } catch (error) {
    console.error('❌ Error en initPayment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al iniciar el pago'
    });
  }
}

/**
 * POST /api/payu/webhook
 * Webhook para recibir confirmaciones de pago de PayU
 * Este endpoint es llamado por PayU cuando hay un cambio en el estado de la transacción
 */
export async function confirmPayment(req, res) {
  try {
    console.log('📩 Webhook PayU recibido');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const webhookData = req.body;

    // PayU envía datos como form-urlencoded o JSON
    if (!webhookData || Object.keys(webhookData).length === 0) {
      console.error('❌ Webhook sin datos');
      return res.status(400).send('Bad Request');
    }

    // Procesar webhook
    const result = await payuService.handleWebhook(webhookData);

    if (result.success) {
      console.log(`✅ Webhook procesado correctamente: ${result.referenceCode} -> ${result.nuevoEstado}`);
      // PayU espera un 200 OK para confirmar recepción
      res.status(200).send('OK');
    } else {
      console.warn(`⚠️ Webhook procesado con advertencia: ${result.error}`);
      res.status(200).send('OK'); // Aún respondemos OK para que PayU no reintente
    }

  } catch (error) {
    console.error('❌ Error procesando webhook PayU:', error);
    // Respondemos 200 para evitar reintentos infinitos, pero logueamos el error
    res.status(200).send('OK');
  }
}

/**
 * GET /api/payu/status/:referenceCode
 * Consulta el estado de un pago por código de referencia
 */
export async function getPaymentStatus(req, res) {
  try {
    const { referenceCode } = req.params;

    if (!referenceCode) {
      return res.status(400).json({
        success: false,
        error: 'Código de referencia requerido'
      });
    }

    const status = await payuService.getPaymentStatus(referenceCode);

    res.json({
      success: true,
      ...status
    });

  } catch (error) {
    console.error('❌ Error consultando estado de pago:', error);
    res.status(error.message.includes('no encontrado') ? 404 : 500).json({
      success: false,
      error: error.message || 'Error al consultar estado'
    });
  }
}

/**
 * GET /api/payu/response
 * Endpoint para procesar la respuesta de PayU después del pago
 * Esta ruta recibe los parámetros cuando el usuario es redirigido desde PayU
 */
export async function paymentResponse(req, res) {
  try {
    const {
      referenceCode,
      TX_VALUE,
      currency,
      transactionState,
      signature,
      reference_pol,
      polResponseCode,
      lapTransactionState,
      message
    } = req.query;

    console.log('📤 Respuesta de PayU recibida:', {
      referenceCode,
      transactionState,
      lapTransactionState,
      message
    });

    // Mapear estados de transacción
    const estadoTexto = {
      '1': 'APROBADO',
      '4': 'APROBADO',
      '6': 'RECHAZADO',
      '5': 'EXPIRADA',
      '7': 'PENDIENTE',
      '14': 'EN_PROCESO'
    };

    const estado = estadoTexto[transactionState] || 'DESCONOCIDO';

    // Buscar documento para obtener más info
    const documento = await db('documentos_generados')
      .where({ token: referenceCode })
      .first();

    // Redirigir al frontend con el estado
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    const redirectUrl = new URL(`${frontendUrl}/pages/payment-response.html`);
    redirectUrl.searchParams.set('ref', referenceCode || '');
    redirectUrl.searchParams.set('status', estado);
    redirectUrl.searchParams.set('message', message || '');
    redirectUrl.searchParams.set('docId', documento?.id || '');

    res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('❌ Error procesando respuesta de pago:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    res.redirect(`${frontendUrl}/pages/payment-response.html?status=ERROR&message=${encodeURIComponent(error.message)}`);
  }
}

/**
 * POST /api/payu/simulate
 * Endpoint de prueba para simular un pago (SOLO DESARROLLO)
 */
export async function simulatePayment(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'No disponible en producción'
    });
  }

  try {
    const { token, status = 'APPROVED' } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token requerido'
      });
    }

    // Simular webhook de PayU
    const fakeWebhookData = {
      reference_sale: token,
      state_pol: status === 'APPROVED' ? '4' : '6',
      transaction_id: `SIM-${Date.now()}`,
      payment_method_name: 'VISA',
      value: '100000.00',
      response_message_pol: status === 'APPROVED' ? 'APROBADA' : 'RECHAZADA',
      currency: 'COP',
      // Simulamos firma válida
      sign: 'SIMULATED'
    };

    // Actualizar directamente sin verificar firma
    const documento = await db('documentos_generados')
      .where({ token })
      .first();

    if (!documento) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    const nuevoEstado = status === 'APPROVED' ? 'completado' : 'rechazado';

    await db('documentos_generados')
      .where({ token })
      .update({
        estado: nuevoEstado,
        payment_data: JSON.stringify({
          transactionId: fakeWebhookData.transaction_id,
          paymentMethod: 'SIMULADO',
          amount: 100000,
          responseMessage: fakeWebhookData.response_message_pol,
          processedAt: new Date().toISOString(),
          isSimulated: true
        }),
        updated_at: db.fn.now()
      });

    console.log(`🧪 Pago simulado para ${token}: ${nuevoEstado}`);

    res.json({
      success: true,
      message: `Pago simulado: ${nuevoEstado}`,
      documentoId: documento.id,
      token,
      nuevoEstado
    });

  } catch (error) {
    console.error('❌ Error en simulación:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

