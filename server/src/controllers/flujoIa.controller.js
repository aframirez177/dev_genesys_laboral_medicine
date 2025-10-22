// Al inicio de flujoIa.controller.js
import db from '../config/database.js'; 
import bcrypt from 'bcryptjs'; 
import crypto from 'crypto'; // <--- Añade esta para generar el token
// Importa tus funciones de generación (asegúrate que las rutas sean correctas)
import { generarMatrizExcel } from './matriz-riesgos.controller.js';
import { generarProfesiogramaPDF } from './profesiograma.controller.js';
import { generarPerfilCargoPDF } from './perfil-cargo.controller.js';
// Importa la función que acabamos de crear
import { uploadToSpaces } from '../utils/spaces.js';

// Función principal que maneja el registro y guardado de datos
export const registrarYGenerar = async (req, res) => {
    // Recibe los datos del frontend:
    // formData = { cargos: [{ cargoName: '...', area: '...', gesSeleccionados: [...] }, ...] }
    // userData = { nombreEmpresa: '...', nit: '...', email: '...', password: '...' }
    const { formData, userData } = req.body;

    // --- Validaciones básicas (puedes añadir más) ---
    if (!formData || !userData || !userData.email || !userData.password || !userData.nombreEmpresa || !userData.nit) {
        return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
    }

    // Iniciamos una transacción para asegurar que todo se guarde o nada se guarde
    let trx; // Declara trx fuera del try para poder usarlo en el catch si es necesario
    try {
        trx = await db.transaction(); // Inicia la transacción

        // 1. Crear la Empresa
        // 'returning('*')' nos devuelve el objeto completo de la empresa creada
        const [empresa] = await trx('empresas').insert({
            nombre_legal: userData.nombreEmpresa,
            nit: userData.nit,
            password_hash: 'temporal' // Puedes quitar esto si solo el usuario inicia sesión
        }).returning('*');

        // 2. Buscar el ID del rol 'cliente_empresa'
        // (Asume que ya existe en tu tabla 'roles')
        const rolCliente = await trx('roles').where({ nombre: 'cliente_empresa' }).first();
        if (!rolCliente) {
            // Si el rol no existe, detenemos todo (rollback)
            throw new Error("El rol 'cliente_empresa' no se encontró en la base de datos.");
        }
        const rolClienteId = rolCliente.id;

        // 3. Crear el User (hasheando la contraseña)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt);

        const [user] = await trx('users').insert({
            email: userData.email,
            // Asume que pides 'full_name' en el modal, si no, usa el email o un placeholder
            full_name: userData.nombre || userData.email,
            password_hash: passwordHash,
            rol_id: rolClienteId,
            empresa_id: empresa.id // Vinculamos al usuario con la empresa creada
        }).returning('*');

        // 4. Crear el Documento Generado (estado inicial 'pendiente_pago')
        const [documento] = await trx('documentos_generados').insert({
            empresa_id: empresa.id,
            usuario_lead_id: user.id, // El usuario que llenó el formulario
            tipo_documento: 'matriz_riesgos', // O 'profesiograma', etc.
            form_data: JSON.stringify(formData), // Guardamos todo el formulario como backup
            estado: 'pendiente_pago' // Estado inicial
        }).returning('*');

        // 5. Crear los Cargos y Riesgos (Iterando sobre formData)
        if (formData.cargos && Array.isArray(formData.cargos)) {
            for (const cargo of formData.cargos) {
                // Guarda el cargo
                const [cargoDB] = await trx('cargos_documento').insert({
                    documento_id: documento.id,
                    nombre_cargo: cargo.cargoName,
                    area: cargo.area,
                    descripcion_tareas: cargo.descripcionTareas
                    // Añade aquí los otros campos del cargo si los necesitas
                }).returning('*');

                // Guarda los riesgos asociados a ese cargo
                if (cargo.gesSeleccionados && Array.isArray(cargo.gesSeleccionados)) {
                    for (const ges of cargo.gesSeleccionados) {
                        await trx('riesgos_cargo').insert({
                            cargo_id: cargoDB.id,
                            tipo_riesgo: ges.riesgo,
                            descripcion_riesgo: ges.ges,
                            // Asegúrate de que los nombres coincidan con tu formData y BD
                            nivel_deficiencia: ges.niveles?.deficiencia?.value,
                            nivel_exposicion: ges.niveles?.exposicion?.value,
                            nivel_consecuencia: ges.niveles?.consecuencia?.value,
                            controles_fuente: ges.controles?.fuente,
                            controles_medio: ges.controles?.medio,
                            controles_individuo: ges.controles?.individuo
                        });
                    }
                }
            }
        }
// --- INICIO CÓDIGO NUEVO ---

        // 6. Generar Token Único para el documento
        const documentToken = crypto.randomBytes(32).toString('hex');
        console.log(`Token generado para documento ${documento.id}: ${documentToken}`);

        // 7. Generar Documentos PREVIEW con Marca de Agua
        console.log("Generando previews para:", empresa.nombre_legal);
        // Asegúrate que tus funciones acepten { isPreview: true, companyName: '...' }
        const companyName = empresa.nombre_legal; 

        // Genera los archivos en memoria (como buffers)
        const [matrizPreviewBuffer, profesiogramaPreviewBuffer, perfilPreviewBuffer] = await Promise.all([
            generarMatrizExcel(formData, { isPreview: true, companyName: companyName }),
            generarProfesiogramaPDF(formData, { isPreview: true, companyName: companyName }),
            generarPerfilCargoPDF(formData, { isPreview: false, companyName: companyName }) // ¿Perfil necesita preview?
        ]);
        console.log("Buffers de preview generados.");

        // 8. Subir Previews a Spaces
        console.log("Subiendo previews a Spaces...");
        const previewUrls = {}; // Objeto para guardar las URLs

        // Usamos Promise.all para subir en paralelo
        const [matrizUrl, profesiogramaUrl, perfilUrl] = await Promise.all([
            uploadToSpaces(matrizPreviewBuffer, 'matriz-riesgos.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', true),
            uploadToSpaces(profesiogramaPreviewBuffer, 'profesiograma.pdf', 'application/pdf', true),
            uploadToSpaces(perfilPreviewBuffer, 'perfil-cargo.pdf', 'application/pdf', false) // Sin sufijo preview?
        ]);

        // Guardamos las URLs obtenidas
        previewUrls.matriz = matrizUrl;
        previewUrls.profesiograma = profesiogramaUrl;
        previewUrls.perfil = perfilUrl;
        console.log("URLs de preview obtenidas:", previewUrls);

        // 9. ACTUALIZAR el documento en la BD con el Token y las URLs de Preview
        // Usamos 'trx' para que sea parte de la misma transacción
        await trx('documentos_generados')
            .where({ id: documento.id })
            .update({
                token: documentToken,
                preview_urls: JSON.stringify(previewUrls) // Guarda el objeto como texto JSON
            });
        console.log(`Documento ${documento.id} actualizado con token y preview_urls.`);

        // --- FIN CÓDIGO NUEVO ---

        
        // Si llegamos aquí, todas las inserciones fueron exitosas.
        await trx.commit(); // Confirma la transacción

        // ----------------------------------------------------
        // AQUÍ IRÁ LA LÓGICA PARA LLAMAR A PAYU (Paso 3 del MVP)
        // Por ahora, solo respondemos con éxito
        // ----------------------------------------------------
        const paymentUrl = 'URL_DE_PAGO_DE_PAYU_IRA_AQUI'; // Placeholder

        res.status(200).json({ // Cambiado a 200 OK ya que aún no se crea el recurso final (el pago)
            success: true,
            message: '¡Cuenta creada! Redirigiendo al pago...',
            paymentUrl: paymentUrl // Envía la URL de pago al frontend
            // Aquí también podrías enviar un token JWT para auto-loguear al usuario
        });

    } catch (error) {
        // Si ALGO falló (ej: email duplicado, rol no encontrado), deshace todo
        if (trx) {
            await trx.rollback();
        }
        console.error('Error en el flujo de registro y generación:', error);

        // Envía un error específico si es posible (ej: email duplicado)
        if (error.message.includes('duplicate key value violates unique constraint "users_email_unique"')) {
            return res.status(409).json({ success: false, message: 'El correo electrónico ya está registrado.' });
        }
        if (error.message.includes('duplicate key value violates unique constraint "empresas_nit_unique"')) {
            return res.status(409).json({ success: false, message: 'El NIT de la empresa ya está registrado.' });
        }

        // Error genérico si no es uno conocido
        res.status(500).json({ success: false, message: 'Error interno al procesar la solicitud.', error: error.message });
    }
};