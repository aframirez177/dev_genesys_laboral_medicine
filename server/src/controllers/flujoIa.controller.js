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
// Estrategia optimizada: pdf-to-png para PDFs (rápido) + Puppeteer solo para Excel
import { generatePDFThumbnail as generatePDFThumbnailFast } from '../utils/pdfThumbnail.js';
import { generateExcelThumbnail } from '../utils/documentThumbnail.js';
// 🆕 Importar service de riesgos (FASE 1)
import riesgosService from '../services/riesgos.service.js';

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

        // 🆕 NUEVO (FASE 1): Enriquecer formData con cálculos de NR ANTES de guardar y generar
        console.log("🔄 Calculando NP/NR y consolidando controles para cada cargo...");
        const formDataEnriquecido = {
            ...formData,
            cargos: formData.cargos.map((cargo, index) => {
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
            generarProfesiogramaPDF(formDataEnriquecido, { companyName: companyName }),
            generarPerfilCargoPDF(formDataEnriquecido, { companyName: companyName }),
            generarCotizacionPDF(formDataEnriquecido)
        ];

        const [matrizBuffer, profesiogramaBuffer, perfilBuffer, cotizacionBuffer] = await Promise.all(generationPromises);
        console.log("Buffers de documentos finales generados.");

        // 7. Generar Thumbnails: Estrategia selectiva según renderizado
        console.log("Generando thumbnails de documentos...");
        const thumbnailPromises = [
            generateExcelThumbnail(matrizBuffer, { width: 800, quality: 95, maxRows: 12, maxCols: 8 }), // Puppeteer - zoom esquina superior izquierda
            generatePDFThumbnailFast(profesiogramaBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 3.5 }), // pdf-to-png optimizado
            generatePDFThumbnailFast(perfilBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 4.0 }), // pdf-to-png - crop header como los demás
            generatePDFThumbnailFast(cotizacionBuffer, { width: 600, cropHeader: true, quality: 95, viewportScale: 4.0 }) // pdf-to-png - viewport MUY alto
        ];

        const [matrizThumbnail, profesiogramaThumbnail, perfilThumbnail, cotizacionThumbnail] = await Promise.all(thumbnailPromises);
        console.log("Thumbnails generados exitosamente (Excel + PDFs).");

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
            // Thumbnails (TODOS los documentos ahora tienen thumbnail)
            uploadToSpaces(matrizThumbnail, `matriz-riesgos-profesional-${empresaNormalizada}-${fechaActual}-${documentToken}-thumb.jpg`, 'image/jpeg'),
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