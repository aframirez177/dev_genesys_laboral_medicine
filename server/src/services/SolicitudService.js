// server/src/services/SolicitudService.js
import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { addDocumentoJob } from '../config/queue.js';

/**
 * SERVICE: SolicitudService
 * Maneja la creación de solicitudes de generación de documentos
 * y las encola en BullMQ para procesamiento asíncrono
 */
class SolicitudService {

  /**
   * Crear solicitud y encolar job de generación
   * @param {Object} formData - Datos del formulario (cargos, gesSeleccionados)
   * @param {Object} userData - Datos del usuario (empresa, email, password)
   * @returns {Object} { token, jobId, pricing }
   */
  async crearSolicitud(formData, userData) {
    // Validaciones básicas
    this._validarDatos(formData, userData);

    // Calcular metadata
    const numCargos = formData.cargos ? formData.cargos.length : 0;
    const nombreResponsable = userData.nombreContacto || userData.nombre || userData.email || 'N/A';
    const pricing = this._calcularPricing(numCargos);

    console.log('💰 Pricing calculado:', pricing);

    let trx;
    try {
      trx = await db.transaction();

      // 1. Crear o buscar empresa
      const empresa = await this._crearOBuscarEmpresa(trx, userData);

      // 2. Crear usuario
      const user = await this._crearUsuario(trx, userData, empresa.id);

      // 3. Generar token único
      const documentToken = crypto.randomBytes(32).toString('hex');
      console.log(`✅ Token generado: ${documentToken}`);

      // 4. Crear documento con estado 'pendiente'
      const [documento] = await trx('documentos_generados').insert({
        empresa_id: empresa.id,
        usuario_lead_id: user.id,
        tipo_documento: 'paquete_inicial',
        form_data: JSON.stringify(formData),
        estado: 'pendiente', // Estado inicial: pendiente (no pendiente_pago)
        token: documentToken,
        preview_urls: '{}',
        nombre_responsable: nombreResponsable,
        num_cargos: numCargos,
        pricing: JSON.stringify(pricing),
        progreso: 0 // Nuevo campo de T1.3
      }).returning('*');

      console.log(`📄 Documento ${documento.id} creado con estado pendiente`);

      // 5. Commit temprano - documento creado exitosamente
      await trx.commit();

      // 6. Encolar job en BullMQ (fuera de transacción)
      const job = await addDocumentoJob('generar-documentos', {
        token: documentToken,
        documentoId: documento.id,
        empresaId: empresa.id,
        empresaData: {
          nombreLegal: empresa.nombre_legal,
          nit: userData.nit,
          nombreResponsable
        },
        formData,
        numCargos,
        pricing
      }, {
        priority: 1, // Alta prioridad
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      });

      console.log(`📨 Job encolado: ${job.id} para token ${documentToken}`);

      return {
        success: true,
        token: documentToken,
        jobId: job.id,
        documentoId: documento.id,
        empresaId: empresa.id,
        pricing,
        estado: 'pendiente',
        mensaje: 'Solicitud creada exitosamente. Los documentos se están generando.'
      };

    } catch (error) {
      if (trx) await trx.rollback();
      console.error('❌ Error en crearSolicitud:', error);
      throw error;
    }
  }

  /**
   * Validar datos de entrada
   * @private
   */
  _validarDatos(formData, userData) {
    if (!formData || !userData) {
      throw new Error('Faltan datos requeridos: formData y userData');
    }

    if (!userData.email || !userData.password || !userData.nombreEmpresa || !userData.nit) {
      throw new Error('Faltan datos del usuario: email, password, nombreEmpresa, nit');
    }

    if (!formData.cargos || !Array.isArray(formData.cargos) || formData.cargos.length === 0) {
      throw new Error('Se requiere al menos un cargo en formData');
    }

    // Validar estructura de cargos
    for (const cargo of formData.cargos) {
      if (!cargo.cargoName) {
        throw new Error('Todos los cargos deben tener un nombre (cargoName)');
      }
      if (!cargo.gesSeleccionados || cargo.gesSeleccionados.length === 0) {
        throw new Error(`El cargo "${cargo.cargoName}" debe tener al menos un GES seleccionado`);
      }
    }
  }

  /**
   * Calcular pricing según número de cargos
   * @private
   */
  _calcularPricing(numCargos) {
    const precioBase = 30000; // COP$ 30,000 por cargo

    const precioMatriz = precioBase * numCargos;
    const precioProfesiograma = precioBase * numCargos;
    const precioPerfil = precioBase * numCargos;
    const precioCotizacion = 0; // GRATIS

    return {
      precioBase,
      numCargos,
      precioMatriz,
      precioProfesiograma,
      precioPerfil,
      precioCotizacion,
      subtotal: precioMatriz + precioProfesiograma + precioPerfil,
      descuento: 0,
      total: precioMatriz + precioProfesiograma + precioPerfil
    };
  }

  /**
   * Crear o buscar empresa existente
   * @private
   */
  async _crearOBuscarEmpresa(trx, userData) {
    // Buscar empresa existente por NIT
    let empresa = await trx('empresas')
      .where({ nit: userData.nit })
      .first();

    if (empresa) {
      console.log(`✅ Empresa existente encontrada: ${empresa.nombre_legal} (ID: ${empresa.id})`);
      return empresa;
    }

    // Crear nueva empresa
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const [nuevaEmpresa] = await trx('empresas').insert({
      nombre_legal: userData.nombreEmpresa,
      nit: userData.nit,
      password_hash: passwordHash
    }).returning('*');

    console.log(`✅ Nueva empresa creada: ${nuevaEmpresa.nombre_legal} (ID: ${nuevaEmpresa.id})`);
    return nuevaEmpresa;
  }

  /**
   * Crear usuario asociado a empresa
   * @private
   */
  async _crearUsuario(trx, userData, empresaId) {
    // Buscar rol 'cliente_empresa'
    const rolCliente = await trx('roles')
      .where({ nombre: 'cliente_empresa' })
      .first();

    if (!rolCliente) {
      throw new Error("El rol 'cliente_empresa' no existe en la base de datos");
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Crear usuario
    const [user] = await trx('users').insert({
      email: userData.email,
      full_name: userData.nombre || userData.nombreContacto || userData.email,
      password_hash: passwordHash,
      rol_id: rolCliente.id,
      empresa_id: empresaId
    }).returning('*');

    console.log(`✅ Usuario creado: ${user.email} (ID: ${user.id})`);
    return user;
  }

  /**
   * Obtener estado de una solicitud por token
   * @param {String} token - Token del documento
   * @returns {Object} Estado del documento
   */
  async obtenerEstadoPorToken(token) {
    const documento = await db('documentos_generados')
      .select(
        'id',
        'estado',
        'progreso',
        'error',
        'preview_urls',
        'pricing',
        'num_cargos',
        'nombre_responsable',
        'job_id',
        'created_at',
        'updated_at'
      )
      .where({ token })
      .first();

    if (!documento) {
      throw new Error(`Documento no encontrado con token: ${token}`);
    }

    // Parsear JSON fields
    let previewUrls = {};
    let pricing = {};

    try {
      previewUrls = typeof documento.preview_urls === 'string'
        ? JSON.parse(documento.preview_urls)
        : documento.preview_urls;
    } catch (e) {
      console.warn('Error parseando preview_urls:', e);
    }

    try {
      pricing = typeof documento.pricing === 'string'
        ? JSON.parse(documento.pricing)
        : documento.pricing;
    } catch (e) {
      console.warn('Error parseando pricing:', e);
    }

    return {
      documentoId: documento.id,
      estado: documento.estado,
      progreso: documento.progreso || 0,
      error: documento.error,
      previewUrls,
      pricing,
      numCargos: documento.num_cargos,
      nombreResponsable: documento.nombre_responsable,
      jobId: documento.job_id,
      createdAt: documento.created_at,
      updatedAt: documento.updated_at,
      // Mensajes amigables según estado
      mensaje: this._getMensajeEstado(documento.estado, documento.progreso)
    };
  }

  /**
   * Obtener mensaje amigable según estado
   * @private
   */
  _getMensajeEstado(estado, progreso) {
    const mensajes = {
      'pendiente': 'Tu solicitud está en cola de procesamiento',
      'procesando': `Generando documentos... ${progreso}%`,
      'completado': 'Documentos generados exitosamente',
      'fallido': 'Error al generar documentos',
      'pendiente_pago': 'Documentos listos - Pendiente de pago'
    };

    return mensajes[estado] || `Estado: ${estado}`;
  }

  /**
   * Actualizar progreso de un documento
   * @param {String} token - Token del documento
   * @param {Number} progreso - Progreso (0-100)
   * @param {String} estado - Nuevo estado (opcional)
   */
  async actualizarProgreso(token, progreso, estado = null) {
    const updates = {
      progreso,
      updated_at: db.fn.now()
    };

    if (estado) {
      updates.estado = estado;
    }

    const count = await db('documentos_generados')
      .where({ token })
      .update(updates);

    if (count === 0) {
      throw new Error(`Documento no encontrado: ${token}`);
    }

    console.log(`📊 Progreso actualizado para ${token}: ${progreso}% (estado: ${estado || 'sin cambio'})`);
  }

  /**
   * Marcar documento como completado con URLs
   * @param {String} token - Token del documento
   * @param {Object} previewUrls - URLs de documentos y thumbnails
   */
  async marcarCompletado(token, previewUrls) {
    const count = await db('documentos_generados')
      .where({ token })
      .update({
        estado: 'pendiente_pago', // Listo para pagar
        progreso: 100,
        preview_urls: JSON.stringify(previewUrls),
        updated_at: db.fn.now()
      });

    if (count === 0) {
      throw new Error(`Documento no encontrado: ${token}`);
    }

    console.log(`✅ Documento ${token} marcado como completado`);
  }

  /**
   * Marcar documento como fallido
   * @param {String} token - Token del documento
   * @param {String} error - Mensaje de error
   */
  async marcarFallido(token, error) {
    const count = await db('documentos_generados')
      .where({ token })
      .update({
        estado: 'fallido',
        error,
        updated_at: db.fn.now()
      });

    if (count === 0) {
      throw new Error(`Documento no encontrado: ${token}`);
    }

    console.error(`❌ Documento ${token} marcado como fallido: ${error}`);
  }
}

// Exportar instancia única (singleton)
export default new SolicitudService();
