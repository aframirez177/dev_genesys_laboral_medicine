// server/src/controllers/flujoIa.controller.js
import db from '../config/database.js'; // Importa tu conexión Knex
import bcrypt from 'bcryptjs'; // Para hashear la contraseña

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