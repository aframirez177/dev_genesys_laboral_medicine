// server/src/controllers/flujoIa.controller.js
import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// Importa tus funciones de generación (asegúrate que las rutas sean correctas)
import { generarMatrizExcel } from './matriz-riesgos.controller.js';
// Nuevo generador de Profesiograma PDF completo con jsPDF (todas las secciones)
import { generarProfesiogramaCompletoPDF } from './profesiograma-pdf.controller.js';
import { generarPerfilCargoPDF } from './perfil-cargo.controller.js';
// Importar generador de cotización
import { generarCotizacionPDF } from './cotizacion.controller.js';
// 🆕 Sprint 6 - Profesiograma HTML para thumbnails
import { generarProfesiogramaHTML } from './profesiograma-html.controller.js';
import { uploadToSpaces } from '../utils/spaces.js'; // Asegúrate que esta ruta sea correcta
// Estrategia optimizada: pdf-to-png para PDFs (rápido) + Puppeteer solo para Excel
import { generatePDFThumbnail as generatePDFThumbnailFast } from '../utils/pdfThumbnail.js';
import { generateExcelThumbnail, generateHTMLThumbnail } from '../utils/documentThumbnail.js';
// 🆕 Importar service de riesgos (FASE 1)
import riesgosService from '../services/riesgos.service.js';
// 🆕 Importar service de catálogo para enriquecer GES con datos de BD
import catalogoService from '../services/CatalogoService.js';

// Función principal que maneja el registro y guardado de datos
export const registrarYGenerar = async (req, res) => {
    // Recibe los datos del frontend:
    // formData = { cargos: [{ cargoName: '...', area: '...', gesSeleccionados: [...] }, ...] }
    // userData = { nombreEmpresa: '...', nit: '...', email: '...', password: '...', nombreContacto: '...' }
    const { formData, userData } = req.body;

    // Capturar nombre del responsable que diligencia
    const nombreResponsable = userData.nombreContacto || userData.nombre || userData.email || 'N/A';

    // Calcular número de cargos
    const numCargos = formData.cargos ? formData.cargos.length : 0;

    // Calcular pricing (COP$ 30,000 por cargo)
    const precioBase = 30000;
    const precioMatriz = precioBase * numCargos;
    const precioProfesiograma = precioBase * numCargos;
    const precioPerfil = precioBase * numCargos;
    const precioCotizacion = 0; // GRATIS

    const pricing = {
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

    console.log('💰 Pricing calculado:', pricing);

    // --- Validaciones básicas ---
    if (!formData || !userData || !userData.email || !userData.password || !userData.nombreEmpresa || !userData.nit) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
    }
    if (!formData.cargos || !Array.isArray(formData.cargos) || formData.cargos.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere al menos un cargo.' });
    }


    let trx;
    try {
        trx = await db.transaction(); // Inicia la transacción
        // --- CALCULAR HASH PRIMERO ---
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt);
        // --- FIN CALCULAR HASH ---
        // 1. Crear la Empresa
        const [empresa] = await trx('empresas').insert({
            nombre_legal: userData.nombreEmpresa,
            nit: userData.nit,
            password_hash: passwordHash
            
        }).returning('*');

        // 2. Buscar el ID del rol 'cliente_empresa'
        const rolCliente = await trx('roles').where({ nombre: 'cliente_empresa' }).first();
        if (!rolCliente) {
            throw new Error("El rol 'cliente_empresa' no se encontró en la base de datos.");
        }
        const rolClienteId = rolCliente.id;

        // 3. Crear el User (hasheando la contraseña)
    /*     const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt); */

        const [user] = await trx('users').insert({
            email: userData.email,
            full_name: userData.nombre || userData.email, // Usa nombre si viene, si no email
            password_hash: passwordHash,
            rol_id: rolClienteId,
            empresa_id: empresa.id
        }).returning('*');

        // 4. Crear el Documento Generado (estado inicial 'pendiente_pago')
        // Generar Token Único para el documento ANTES de insertarlo
        const documentToken = crypto.randomBytes(32).toString('hex');
        console.log(`Token generado para nuevo documento: ${documentToken}`);

        const [documento] = await trx('documentos_generados').insert({
            empresa_id: empresa.id,
            usuario_lead_id: user.id,
            tipo_documento: 'paquete_inicial', // Tipo genérico para el conjunto
            form_data: JSON.stringify(formData), // Guardamos todo el formulario
            estado: 'pendiente_pago',
            token: documentToken, // Guarda el token único
            preview_urls: '{}', // Inicializa como JSON vacío, se actualizará después
            nombre_responsable: nombreResponsable, // 🆕 Metadata
            num_cargos: numCargos, // 🆕 Metadata
            pricing: JSON.stringify(pricing) // 🆕 Metadata
        }).returning('*');
        console.log(`Documento ${documento.id} creado con estado pendiente_pago.`);

        // 🆕 PASO 1 (FASE 1): Enriquecer formData con datos del catálogo desde BD
        console.log("📚 Enriqueciendo GES con datos del catálogo de riesgos...");
        const formDataConCatalogo = await catalogoService.enriquecerFormData(formData);
        console.log("✅ Enriquecimiento del catálogo completado");

        // 🐛 DEBUG: Ver estructura de GES después del enriquecimiento
        if (formDataConCatalogo.cargos?.[0]?.gesSeleccionados?.[0]) {
            const primeraGes = formDataConCatalogo.cargos[0].gesSeleccionados[0];
            console.log("🐛 DEBUG - Estructura de GES enriquecido:", JSON.stringify({
                riesgo: primeraGes.riesgo,
                ges: primeraGes.ges,
                efectosPosibles: primeraGes.efectosPosibles,
                peorConsecuencia: primeraGes.peorConsecuencia,
                medidasIntervencion: primeraGes.medidasIntervencion,
                controles: primeraGes.controles
            }, null, 2));
        }

        // 🆕 PASO 2 (FASE 1): Calcular NP/NR y consolidar controles
        console.log("🔄 Calculando NP/NR y consolidando controles para cada cargo...");
        const formDataEnriquecido = {
            ...formDataConCatalogo,
            cargos: formDataConCatalogo.cargos.map((cargo) => {
                try {
                    // Consolidar controles para el cargo
                    const controlesConsolidados = riesgosService.consolidarControlesCargo(cargo);

                    console.log(`  ✓ Cargo "${cargo.cargoName}": ${controlesConsolidados.metadata.numGESAnalizados} GES analizados, ${controlesConsolidados.metadata.numGESConControles} con controles`);

                    return {
                        ...cargo,

                        // Enriquecer gesSeleccionados con NP/NR calculado
                        gesSeleccionados: (cargo.gesSeleccionados || []).map(ges => {
                            try {
                                const niveles = riesgosService.calcularNivelesRiesgo(ges);
                                return {
                                    ...ges,
                                    ...niveles // Agrega np, nr, npNivel, nrNivel, etc.
                                };
                            } catch (error) {
                                console.error(`  ⚠️ Error calculando niveles para GES "${ges.ges}":`, error.message);
                                return ges; // Devolver sin enriquecer
                            }
                        }),

                        // Agregar controles consolidados
                        controlesConsolidados
                    };
                } catch (error) {
                    console.error(`❌ Error consolidando controles para cargo "${cargo.cargoName}":`, error.message);
                    return cargo; // Devolver sin enriquecer
                }
            })
        };

        // 5. Crear los Cargos y Riesgos (AHORA CON NP/NR PERSISTIDO)
        for (const cargo of formDataEnriquecido.cargos) {
            // Debug: Log toggles recibidos del frontend
            console.log(`📋 Cargo "${cargo.cargoName}" - Toggles: alturas=${cargo.trabajaAlturas}, alimentos=${cargo.manipulaAlimentos}, vehículo=${cargo.conduceVehiculo}, espaciosConf=${cargo.trabajaEspaciosConfinados}, rutinarias=${cargo.tareasRutinarias}`);

            const [cargoDB] = await trx('cargos_documento').insert({
                documento_id: documento.id,
                nombre_cargo: cargo.cargoName,
                area: cargo.area,
                descripcion_tareas: cargo.descripcionTareas,
                zona: cargo.zona,
                num_trabajadores: cargo.numTrabajadores,
                tareas_rutinarias: cargo.tareasRutinarias || false,
                // ✅ Toggles especiales - requeridos para exámenes específicos
                trabaja_alturas: cargo.trabajaAlturas || false,
                manipula_alimentos: cargo.manipulaAlimentos || false,
                conduce_vehiculo: cargo.conduceVehiculo || false,
                trabaja_espacios_confinados: cargo.trabajaEspaciosConfinados || false
            }).returning('*');

            if (cargo.gesSeleccionados && Array.isArray(cargo.gesSeleccionados)) {
                for (const ges of cargo.gesSeleccionados) {
                    // Validar que los niveles existan y tengan valor, o usar null/0
                    const nivelDeficiencia = ges.niveles?.deficiencia?.value || ges.nd;
                    const nivelExposicion = ges.niveles?.exposicion?.value || ges.ne;
                    const nivelConsecuencia = ges.niveles?.consecuencia?.value || ges.nc;

                    await trx('riesgos_cargo').insert({
                        cargo_id: cargoDB.id,
                        tipo_riesgo: ges.riesgo,
                        descripcion_riesgo: ges.ges,

                        // Niveles de entrada
                        nivel_deficiencia: nivelDeficiencia !== undefined ? nivelDeficiencia : null,
                        nivel_exposicion: nivelExposicion !== undefined ? nivelExposicion : null,
                        nivel_consecuencia: nivelConsecuencia !== undefined ? nivelConsecuencia : null,

                        // 🆕 Niveles calculados (FASE 1) - Las columnas se agregan en Fase 2
                        // nivel_probabilidad: ges.np || null,
                        // nivel_probabilidad_categoria: ges.npNivel || null,
                        // nivel_riesgo: ges.nr || null,
                        // nivel_riesgo_categoria: ges.nrNivel || null,
                        // interpretacion_riesgo: ges.nrInterpretacion || null,
                        // aceptabilidad: ges.nrAceptabilidad || null,
                        // fecha_calculo: ges.fechaCalculo || null,

                        // Controles
                        controles_fuente: ges.controles?.fuente || null,
                        controles_medio: ges.controles?.medio || null,
                        controles_individuo: ges.controles?.individuo || null
                    });
                }
            }
        }
        console.log("Cargos y riesgos guardados en la BD.");

        // --- INICIO GENERACIÓN DOCUMENTOS FINALES ---

        // 6. Generar Documentos FINALES (AHORA CON formDataEnriquecido)
        console.log("📄 Generando documentos finales para:", empresa.nombre_legal);
        const companyName = empresa.nombre_legal;
        const companyNit = userData.nit; // NIT de la empresa

        // 🆕 Genera los archivos en memoria usando formDataEnriquecido
        // Esto asegura que profesiograma y matriz usen los mismos cálculos de NR
        const generationPromises = [
            generarMatrizExcel(formDataEnriquecido, {
                companyName: companyName,
                nit: companyNit,
                diligenciadoPor: nombreResponsable
            }),
            generarProfesiogramaCompletoPDF(formDataEnriquecido, { companyName: companyName }),
            generarPerfilCargoPDF(formDataEnriquecido, { companyName: companyName }),
            generarCotizacionPDF(formDataEnriquecido)
        ];

        const [matrizBuffer, profesiogramaBuffer, perfilBuffer, cotizacionBuffer] = await Promise.all(generationPromises);
        console.log("Buffers de documentos finales generados.");

        // 7. Generar Thumbnails: Estrategia selectiva según renderizado
        console.log("Generando thumbnails de documentos...");

        // 🆕 Sprint 6: Profesiograma usa HTML viewer para thumbnail (no PDF)
        const profesiogramaHTML = await generarProfesiogramaHTML(formDataEnriquecido, { companyName: companyName });

        // ⚠️ TEMPORAL: Excel thumbnail deshabilitado (Puppeteer timeout)
        // TODO: Re-habilitar cuando se resuelva el problema de Puppeteer
        const thumbnailPromises = [
            // generateExcelThumbnail(matrizBuffer, { width: 800, quality: 95, maxRows: 12, maxCols: 8 }), // ❌ DESHABILITADO - Puppeteer timeout
            Promise.resolve(null), // Placeholder para matrizThumbnail
            generateHTMLThumbnail(profesiogramaHTML, { width: 800, quality: 95 }), // 🆕 Thumbnail desde HTML viewer
            generatePDFThumbnailFast(perfilBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 4.0 }), // pdf-to-png - crop header como los demás
            generatePDFThumbnailFast(cotizacionBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 4.0 }) // pdf-to-png - viewport MUY alto
        ];

        const [matrizThumbnail, profesiogramaThumbnail, perfilThumbnail, cotizacionThumbnail] = await Promise.all(thumbnailPromises);
        console.log("Thumbnails generados exitosamente (Profesiograma desde HTML, Excel deshabilitado temporalmente).");

        // 8. Subir Documentos Finales y Thumbnails a Spaces
        console.log("Subiendo documentos finales y thumbnails a Spaces...");
        const finalUrls = {}; // Objeto para guardar las URLs
        const thumbnailUrls = {}; // Objeto para guardar las URLs de thumbnails

        // Generar nombres de archivo descriptivos con empresa y fecha
        const fechaActual = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const empresaNormalizada = companyName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/[^a-zA-Z0-9]/g, "-")   // Reemplazar caracteres especiales con guión
            .replace(/-+/g, "-")             // Evitar múltiples guiones consecutivos
            .toLowerCase();

        // Usamos nombres de archivo únicos con empresa, fecha y token
        const uploadPromises = [
             // Documentos originales
             uploadToSpaces(
                matrizBuffer,
                `matriz-riesgos-profesional-${empresaNormalizada}-${fechaActual}-${documentToken}.xlsx`,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
             ),
             uploadToSpaces(
                profesiogramaBuffer,
                `profesiograma-${empresaNormalizada}-${fechaActual}-${documentToken}.pdf`,
                'application/pdf'
            ),
             uploadToSpaces(
                perfilBuffer,
                `perfil-cargo-${empresaNormalizada}-${fechaActual}-${documentToken}.pdf`,
                'application/pdf'
            ),
            uploadToSpaces(cotizacionBuffer, `cotizacion-${empresaNormalizada}-${fechaActual}-${documentToken}.pdf`, 'application/pdf'),
            // Thumbnails (solo PDFs por ahora, matriz deshabilitada)
            matrizThumbnail ? uploadToSpaces(matrizThumbnail, `matriz-riesgos-profesional-${empresaNormalizada}-${fechaActual}-${documentToken}-thumb.jpg`, 'image/jpeg') : Promise.resolve(null),
            uploadToSpaces(profesiogramaThumbnail, `profesiograma-${empresaNormalizada}-${fechaActual}-${documentToken}-thumb.jpg`, 'image/jpeg'),
            uploadToSpaces(perfilThumbnail, `perfil-cargo-${empresaNormalizada}-${fechaActual}-${documentToken}-thumb.jpg`, 'image/jpeg'),
            uploadToSpaces(cotizacionThumbnail, `cotizacion-${empresaNormalizada}-${fechaActual}-${documentToken}-thumb.jpg`, 'image/jpeg')
        ];

        const [matrizUrl, profesiogramaUrl, perfilUrl, cotizacionUrl, matrizThumbnailUrl, profesiogramaThumbnailUrl, perfilThumbnailUrl, cotizacionThumbnailUrl] = await Promise.all(uploadPromises);

        // Guardamos las URLs obtenidas
        finalUrls.matriz = matrizUrl;
        finalUrls.profesiograma = profesiogramaUrl;
        finalUrls.perfil = perfilUrl;
        finalUrls.cotizacion = cotizacionUrl;

        // Guardamos las URLs de thumbnails (solo los que existen)
        if (matrizThumbnailUrl) {
            thumbnailUrls.matriz = matrizThumbnailUrl; // Solo si se generó
        }
        thumbnailUrls.profesiograma = profesiogramaThumbnailUrl;
        thumbnailUrls.perfil = perfilThumbnailUrl;
        thumbnailUrls.cotizacion = cotizacionThumbnailUrl;

        console.log("URLs finales obtenidas:", finalUrls);
        console.log("URLs de thumbnails obtenidas:", thumbnailUrls);

        // 9. ACTUALIZAR el documento en la BD con las URLs Finales y Thumbnails
        // Usamos 'trx' para que sea parte de la misma transacción
        await trx('documentos_generados')
            .where({ id: documento.id })
            .update({
                // Guardamos las URLs de los documentos
                preview_urls: JSON.stringify({
                    ...finalUrls,
                    // 🆕 Vista web del profesiograma (HTML interactivo con scroll horizontal)
                    profesiogramaWebView: `/pages/profesiograma_view.html?id=${documento.id}`,
                    thumbnails: thumbnailUrls
                }) // Incluye thumbnails en el mismo objeto
            });
        console.log(`Documento ${documento.id} actualizado con URLs finales, thumbnails y vista web.`);

        // --- FIN GENERACIÓN DOCUMENTOS FINALES ---


        // Si llegamos aquí, todo fue exitoso.
        await trx.commit(); // Confirma la transacción

        // Respondemos al frontend con éxito y el token para la página de resultados
        res.status(201).json({
            success: true,
            message: '¡Cuenta creada y documentos generados! Redirigiendo...',
            documentToken: documentToken // Envía el token para redirigir a resultados.html?token=...
        });

    } catch (error) {
        // Si ALGO falló, deshace todo
        if (trx) {
            await trx.rollback();
            console.log("Transacción revertida debido a error.");
        }
        console.error('Error detallado en flujo de registro y generación:', error);

        // Envía un error específico si es posible
        if (error.code === '23505') { // Código de error PostgreSQL para violación de unicidad
             if (error.constraint === 'users_email_unique') {
                return res.status(409).json({ success: false, message: 'El correo electrónico ya está registrado.' });
            }
            if (error.constraint === 'empresas_nit_unique') {
                return res.status(409).json({ success: false, message: 'El NIT de la empresa ya está registrado.' });
            }
             if (error.constraint === 'documentos_generados_token_unique') {
                // Muy raro, pero podría pasar si el token generado colisiona
                 console.error("Colisión de token detectada.");
                return res.status(500).json({ success: false, message: 'Error interno temporal, por favor intente de nuevo.', code: 'TOKEN_COLLISION' });
            }
        }


        // Error genérico si no es uno conocido
        // Incluye el mensaje de error real para depuración (considera quitarlo en producción final)
        res.status(500).json({
             success: false,
             message: 'Error interno al procesar la solicitud.',
             error: error.message // Mensaje de error específico para depuración
        });
    }
};

/**
 * 🆕 ENDPOINT RÁPIDO: Registrar usuario y redirigir a dashboard
 * Genera documentos en background sin bloquear
 *
 * POST /api/flujo-ia/registrar-rapido
 *
 * Flujo:
 * 1. Registra empresa + usuario
 * 2. Crea documento en estado 'pendiente'
 * 3. Genera JWT de sesión
 * 4. Responde inmediatamente (< 2 segundos)
 * 5. Genera documentos en background
 */
import jwt from 'jsonwebtoken';
import { getEnvVars } from '../config/env.js';

const env = getEnvVars();
const JWT_SECRET = env.JWT_SECRET || 'genesys-default-secret-change-in-production';

export const registrarRapido = async (req, res) => {
    const { formData, userData } = req.body;

    console.log('🚀 [REGISTRO RÁPIDO] Iniciando...');
    console.log(`   Empresa: ${userData?.nombreEmpresa}`);
    console.log(`   Cargos: ${formData?.cargos?.length || 0}`);

    // --- Validaciones básicas ---
    if (!formData || !userData || !userData.email || !userData.password || !userData.nombreEmpresa || !userData.nit) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
    }
    if (!formData.cargos || !Array.isArray(formData.cargos) || formData.cargos.length === 0) {
        return res.status(400).json({ success: false, message: 'Se requiere al menos un cargo.' });
    }

    const nombreResponsable = userData.nombreContacto || userData.nombre || userData.email || 'N/A';
    const numCargos = formData.cargos.length;

    // Calcular pricing
    const precioBase = 30000;
    const pricing = {
        precioBase,
        numCargos,
        precioMatriz: precioBase * numCargos,
        precioProfesiograma: precioBase * numCargos,
        precioPerfil: precioBase * numCargos,
        precioCotizacion: 0,
        subtotal: precioBase * numCargos * 3,
        total: precioBase * numCargos * 3
    };

    let trx;
    try {
        trx = await db.transaction();

        // 1. Hash de contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt);

        // 2. Crear Empresa
        let empresa;
        const existingEmpresa = await trx('empresas').where({ nit: userData.nit }).first();

        if (existingEmpresa) {
            empresa = existingEmpresa;
            console.log(`📋 Empresa existente: ${empresa.nombre_legal}`);
        } else {
            [empresa] = await trx('empresas').insert({
                nombre_legal: userData.nombreEmpresa,
                nit: userData.nit,
                password_hash: passwordHash
            }).returning('*');
            console.log(`✅ Empresa creada: ${empresa.nombre_legal}`);
        }

        // 3. Crear Usuario
        let user;
        const existingUser = await trx('users').where({ email: userData.email.toLowerCase() }).first();

        if (existingUser) {
            user = existingUser;
            console.log(`📋 Usuario existente: ${user.email}`);
        } else {
            const rolCliente = await trx('roles').where({ nombre: 'cliente_empresa' }).first();
            if (!rolCliente) {
                throw new Error("El rol 'cliente_empresa' no existe en la BD");
            }

            [user] = await trx('users').insert({
                full_name: nombreResponsable,
                email: userData.email.toLowerCase(),
                password_hash: passwordHash,
                empresa_id: empresa.id,
                rol_id: rolCliente.id
            }).returning('*');
            console.log(`✅ Usuario creado: ${user.email}`);
        }

        // 4. Generar token de documento
        const documentToken = crypto.randomBytes(32).toString('hex');

        // 5. Crear documento en estado 'pendiente'
        const [documento] = await trx('documentos_generados').insert({
            empresa_id: empresa.id,
            usuario_lead_id: user.id,
            tipo_documento: 'paquete_inicial',
            form_data: JSON.stringify(formData),
            estado: 'pendiente',
            token: documentToken,
            preview_urls: '{}',
            nombre_responsable: nombreResponsable,
            num_cargos: numCargos,
            pricing: JSON.stringify(pricing),
            progreso: 0
        }).returning('*');

        console.log(`📄 Documento ${documento.id} creado (pendiente)`);

        // 6. Commit de transacción
        await trx.commit();

        // 7. Generar JWT de sesión
        const sessionToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: 'cliente_empresa',
                empresa_id: empresa.id,
                type: 'user'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ [REGISTRO RÁPIDO] Completado - Redirigiendo a dashboard');

        // 8. Responder inmediatamente
        res.json({
            success: true,
            message: 'Registro exitoso. Redirigiendo al dashboard...',
            sessionToken,
            documentToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                empresaId: empresa.id,
                empresaNombre: empresa.nombre_legal
            },
            redirectUrl: '/pages/dashboard.html'
        });

        // 9. Generar documentos en BACKGROUND (después de responder)
        setImmediate(async () => {
            console.log('🔄 [BACKGROUND] Iniciando generación de documentos...');
            try {
                await generarDocumentosEnBackground(documento.id, documentToken, empresa, formData, userData, pricing, nombreResponsable);
                console.log('✅ [BACKGROUND] Documentos generados exitosamente');
            } catch (error) {
                console.error('❌ [BACKGROUND] Error generando documentos:', error.message);
                // Actualizar estado a 'fallido'
                await db('documentos_generados')
                    .where({ id: documento.id })
                    .update({ estado: 'fallido', updated_at: new Date() });
            }
        });

    } catch (error) {
        if (trx) await trx.rollback();
        console.error('❌ [REGISTRO RÁPIDO] Error:', error.message);

        // Manejar errores conocidos
        if (error.code === '23505') {
            if (error.constraint?.includes('email')) {
                return res.status(409).json({ success: false, message: 'El email ya está registrado.' });
            }
            if (error.constraint?.includes('nit')) {
                return res.status(409).json({ success: false, message: 'El NIT ya está registrado.' });
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error interno al procesar el registro.',
            error: error.message
        });
    }
};

/**
 * Función auxiliar: Genera documentos en background
 */
async function generarDocumentosEnBackground(documentoId, documentToken, empresa, formData, userData, pricing, nombreResponsable) {
    console.log(`📄 [BACKGROUND] Procesando documento ${documentoId}...`);

    // Actualizar estado a 'procesando'
    await db('documentos_generados')
        .where({ id: documentoId })
        .update({ estado: 'procesando', progreso: 5, updated_at: new Date() });

    // Enriquecer formData con cálculos de NR
    console.log('🔄 Calculando NP/NR...');
    const formDataEnriquecido = {
        ...formData,
        cargos: formData.cargos.map((cargo) => {
            try {
                const controlesConsolidados = riesgosService.consolidarControlesCargo(cargo);
                return {
                    ...cargo,
                    gesSeleccionados: (cargo.gesSeleccionados || []).map(ges => {
                        try {
                            const niveles = riesgosService.calcularNivelesRiesgo(ges);
                            return { ...ges, ...niveles };
                        } catch (error) {
                            console.warn(`  ⚠️ Error en GES "${ges.ges}":`, error.message);
                            return ges;
                        }
                    }),
                    controlesConsolidados
                };
            } catch (error) {
                console.error(`❌ Error en cargo "${cargo.cargoName}":`, error.message);
                return cargo;
            }
        })
    };

    await db('documentos_generados')
        .where({ id: documentoId })
        .update({ progreso: 20, updated_at: new Date() });

    // Guardar cargos y riesgos en BD
    console.log('💾 Guardando cargos en BD...');
    for (const cargo of formDataEnriquecido.cargos) {
        const [cargoDB] = await db('cargos_documento').insert({
            documento_id: documentoId,
            nombre_cargo: cargo.cargoName,
            area: cargo.area,
            descripcion_tareas: cargo.descripcionTareas,
            num_trabajadores: cargo.numTrabajadores || 1,
            zona: cargo.zona || 'General',
            trabaja_alturas: cargo.trabajaAlturas || false,
            manipula_alimentos: cargo.manipulaAlimentos || false,
            conduce_vehiculo: cargo.conduceVehiculo || false,
            trabaja_espacios_confinados: cargo.trabajaEspaciosConfinados || false,
            tareas_rutinarias: cargo.tareasRutinarias !== false
        }).returning('*');

        for (const ges of (cargo.gesSeleccionados || [])) {
            await db('riesgos_cargo').insert({
                cargo_id: cargoDB.id,
                tipo_riesgo: ges.riesgo || 'Otros',
                descripcion_riesgo: ges.ges || ges.nombre || '',
                controles_fuente: ges.controles?.fuente || 'Ninguno',
                controles_medio: ges.controles?.medio || 'Ninguno',
                controles_individuo: ges.controles?.individuo || 'Ninguno',
                nivel_deficiencia: ges.niveles?.deficiencia?.value || ges.nd || 2,
                nivel_exposicion: ges.niveles?.exposicion?.value || ges.ne || 2,
                nivel_consecuencia: ges.niveles?.consecuencia?.value || ges.nc || 25,
                ges_id: ges.idGes || ges.id_ges || null
            });
        }
    }

    await db('documentos_generados')
        .where({ id: documentoId })
        .update({ progreso: 40, updated_at: new Date() });

    // Generar documentos
    console.log('📄 Generando documentos...');
    const companyName = empresa.nombre_legal;
    const companyNit = userData.nit;

    const [matrizBuffer, profesiogramaBuffer, perfilBuffer, cotizacionBuffer] = await Promise.all([
        generarMatrizExcel(formDataEnriquecido, { companyName, nit: companyNit, diligenciadoPor: nombreResponsable }),
        generarProfesiogramaCompletoPDF(formDataEnriquecido, { companyName }),
        generarPerfilCargoPDF(formDataEnriquecido, { companyName }),
        generarCotizacionPDF(formDataEnriquecido)
    ]);

    await db('documentos_generados')
        .where({ id: documentoId })
        .update({ progreso: 60, updated_at: new Date() });

    // Generar thumbnails (puede fallar sin bloquear)
    console.log('🖼️ Generando thumbnails...');
    let profesiogramaThumbnail = null, perfilThumbnail = null, cotizacionThumbnail = null;
    try {
        const profesiogramaHTML = await generarProfesiogramaHTML(formDataEnriquecido, { companyName });
        [profesiogramaThumbnail, perfilThumbnail, cotizacionThumbnail] = await Promise.all([
            generateHTMLThumbnail(profesiogramaHTML, { width: 800, quality: 95 }).catch(() => null),
            generatePDFThumbnailFast(perfilBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 4.0 }).catch(() => null),
            generatePDFThumbnailFast(cotizacionBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 4.0 }).catch(() => null)
        ]);
    } catch (error) {
        console.warn('⚠️ Error generando thumbnails (continuando sin ellos):', error.message);
    }

    await db('documentos_generados')
        .where({ id: documentoId })
        .update({ progreso: 75, updated_at: new Date() });

    // Subir a Spaces
    console.log('☁️ Subiendo a Spaces...');
    const fechaActual = new Date().toISOString().split('T')[0];
    const empresaNormalizada = companyName
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").toLowerCase();

    const [matrizUrl, profesiogramaUrl, perfilUrl, cotizacionUrl] = await Promise.all([
        uploadToSpaces(matrizBuffer, `matriz-riesgos-profesional-${empresaNormalizada}-${fechaActual}-${documentToken}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
        uploadToSpaces(profesiogramaBuffer, `profesiograma-${empresaNormalizada}-${fechaActual}-${documentToken}.pdf`, 'application/pdf'),
        uploadToSpaces(perfilBuffer, `perfil-cargo-${empresaNormalizada}-${fechaActual}-${documentToken}.pdf`, 'application/pdf'),
        uploadToSpaces(cotizacionBuffer, `cotizacion-${empresaNormalizada}-${fechaActual}-${documentToken}.pdf`, 'application/pdf')
    ]);

    // Subir thumbnails si existen
    let thumbnailUrls = {};
    if (profesiogramaThumbnail) {
        thumbnailUrls.profesiograma = await uploadToSpaces(profesiogramaThumbnail, `profesiograma-${empresaNormalizada}-${fechaActual}-${documentToken}-thumb.jpg`, 'image/jpeg');
    }
    if (perfilThumbnail) {
        thumbnailUrls.perfil = await uploadToSpaces(perfilThumbnail, `perfil-cargo-${empresaNormalizada}-${fechaActual}-${documentToken}-thumb.jpg`, 'image/jpeg');
    }
    if (cotizacionThumbnail) {
        thumbnailUrls.cotizacion = await uploadToSpaces(cotizacionThumbnail, `cotizacion-${empresaNormalizada}-${fechaActual}-${documentToken}-thumb.jpg`, 'image/jpeg');
    }

    await db('documentos_generados')
        .where({ id: documentoId })
        .update({ progreso: 90, updated_at: new Date() });

    // Actualizar BD con URLs finales
    const previewUrls = {
        matriz: matrizUrl,
        profesiograma: profesiogramaUrl,
        perfil: perfilUrl,
        cotizacion: cotizacionUrl,
        thumbnails: thumbnailUrls
    };

    await db('documentos_generados')
        .where({ id: documentoId })
        .update({
            preview_urls: JSON.stringify(previewUrls),
            estado: 'pendiente_pago',
            progreso: 100,
            updated_at: new Date()
        });

    console.log(`✅ [BACKGROUND] Documento ${documentoId} completado`);
}