// server/src/controllers/flujoIa.controller.js
import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// Importa tus funciones de generación (asegúrate que las rutas sean correctas)
import { generarMatrizExcel } from './matriz-riesgos.controller.js';
import { generarProfesiogramaPDF } from './profesiograma.controller.js';
import { generarPerfilCargoPDF } from './perfil-cargo.controller.js';
// Importar generador de cotización
import { generarCotizacionPDF } from './cotizacion.controller.js';
import { uploadToSpaces } from '../utils/spaces.js'; // Asegúrate que esta ruta sea correcta
import { generatePDFThumbnail, generateExcelThumbnail } from '../utils/documentThumbnail.js';

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


        // 5. Crear los Cargos y Riesgos (Iterando sobre formData)
        for (const cargo of formData.cargos) {
            const [cargoDB] = await trx('cargos_documento').insert({
                documento_id: documento.id,
                nombre_cargo: cargo.cargoName,
                area: cargo.area,
                descripcion_tareas: cargo.descripcionTareas,
                zona: cargo.zona, // Asegúrate que estos campos existan en tu form y BD
                num_trabajadores: cargo.numTrabajadores,
                tareas_rutinarias: cargo.tareasRutinarias || false // Añade valor por defecto si es necesario
                // Añade aquí los otros campos del cargo si los necesitas
            }).returning('*');

            if (cargo.gesSeleccionados && Array.isArray(cargo.gesSeleccionados)) {
                for (const ges of cargo.gesSeleccionados) {
                    // Validar que los niveles existan y tengan valor, o usar null/0
                    const nivelDeficiencia = ges.niveles?.deficiencia?.value;
                    const nivelExposicion = ges.niveles?.exposicion?.value;
                    const nivelConsecuencia = ges.niveles?.consecuencia?.value;

                    await trx('riesgos_cargo').insert({
                        cargo_id: cargoDB.id,
                        tipo_riesgo: ges.riesgo,
                        descripcion_riesgo: ges.ges,
                        nivel_deficiencia: nivelDeficiencia !== undefined ? nivelDeficiencia : null,
                        nivel_exposicion: nivelExposicion !== undefined ? nivelExposicion : null,
                        nivel_consecuencia: nivelConsecuencia !== undefined ? nivelConsecuencia : null,
                        controles_fuente: ges.controles?.fuente || null,
                        controles_medio: ges.controles?.medio || null,
                        controles_individuo: ges.controles?.individuo || null
                    });
                }
            }
        }
        console.log("Cargos y riesgos guardados en la BD.");

        // --- INICIO GENERACIÓN DOCUMENTOS FINALES ---

        // 6. Generar Documentos FINALES (Sin isPreview)
        console.log("Generando documentos finales para:", empresa.nombre_legal);
        const companyName = empresa.nombre_legal;

        // Genera los archivos en memoria (como buffers)
        // Asegúrate que tus funciones acepten solo (formData, { companyName })
        const generationPromises = [
            generarMatrizExcel(formData, { companyName: companyName }),
            generarProfesiogramaPDF(formData, { companyName: companyName }),
            generarPerfilCargoPDF(formData, { companyName: companyName }),
            generarCotizacionPDF(formData) // 🆕 Generar cotización
        ];

        const [matrizBuffer, profesiogramaBuffer, perfilBuffer, cotizacionBuffer] = await Promise.all(generationPromises);
        console.log("Buffers de documentos finales generados.");

        // 7. Generar Thumbnails de ALTA FIDELIDAD con Puppeteer
        console.log("📸 Generando thumbnails de alta fidelidad con Puppeteer...");
        const thumbnailPromises = [
            generateExcelThumbnail(matrizBuffer, { width: 800, quality: 95, maxRows: 15 }),
            generatePDFThumbnail(profesiogramaBuffer, { width: 800, quality: 95 }),
            generatePDFThumbnail(perfilBuffer, { width: 800, quality: 95 }),
            generatePDFThumbnail(cotizacionBuffer, { width: 800, quality: 95 })
        ];

        const [matrizThumbnail, profesiogramaThumbnail, perfilThumbnail, cotizacionThumbnail] = await Promise.all(thumbnailPromises);
        console.log("✅ Thumbnails de alta fidelidad generados exitosamente.");

        // 8. Subir Documentos Finales y Thumbnails a Spaces
        console.log("Subiendo documentos finales y thumbnails a Spaces...");
        const finalUrls = {}; // Objeto para guardar las URLs
        const thumbnailUrls = {}; // Objeto para guardar las URLs de thumbnails

        // Usamos nombres de archivo únicos con el token
        const uploadPromises = [
             // Documentos originales
             uploadToSpaces(
                matrizBuffer,
                `matriz-riesgos-${documentToken}.xlsx`,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
             ),
             uploadToSpaces(
                profesiogramaBuffer,
                `profesiograma-${documentToken}.pdf`,
                'application/pdf'
            ),
             uploadToSpaces(
                perfilBuffer,
                `perfil-cargo-${documentToken}.pdf`,
                'application/pdf'
            ),
            uploadToSpaces(cotizacionBuffer, `cotizacion-${documentToken}.pdf`, 'application/pdf'),
            // Thumbnails (TODOS los documentos ahora tienen thumbnail)
            uploadToSpaces(matrizThumbnail, `matriz-riesgos-${documentToken}-thumb.jpg`, 'image/jpeg'),
            uploadToSpaces(profesiogramaThumbnail, `profesiograma-${documentToken}-thumb.jpg`, 'image/jpeg'),
            uploadToSpaces(perfilThumbnail, `perfil-cargo-${documentToken}-thumb.jpg`, 'image/jpeg'),
            uploadToSpaces(cotizacionThumbnail, `cotizacion-${documentToken}-thumb.jpg`, 'image/jpeg')
        ];

        const [matrizUrl, profesiogramaUrl, perfilUrl, cotizacionUrl, matrizThumbnailUrl, profesiogramaThumbnailUrl, perfilThumbnailUrl, cotizacionThumbnailUrl] = await Promise.all(uploadPromises);

        // Guardamos las URLs obtenidas
        finalUrls.matriz = matrizUrl;
        finalUrls.profesiograma = profesiogramaUrl;
        finalUrls.perfil = perfilUrl;
        finalUrls.cotizacion = cotizacionUrl;

        // Guardamos las URLs de thumbnails (TODOS los documentos)
        thumbnailUrls.matriz = matrizThumbnailUrl; // 🆕 Ahora la matriz también tiene thumbnail
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
                    thumbnails: thumbnailUrls
                }) // Incluye thumbnails en el mismo objeto
            });
        console.log(`Documento ${documento.id} actualizado con URLs finales y thumbnails.`);

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