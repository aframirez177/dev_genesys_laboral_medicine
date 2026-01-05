/**
 * SPRINT 8: Agendamiento Controller
 * Maneja el agendamiento de exámenes médicos y la integración con Google Forms/Sheets
 */

import db from '../config/database.js';

/**
 * Registrar un agendamiento de examen médico
 * Guarda en BD local y opcionalmente sincroniza con Google Sheets
 */
export async function registrarAgendamiento(req, res) {
    try {
        const { empresaId } = req.params;
        const {
            trabajadorNombre,
            cargoId,
            cargoNombre,
            examenCodigo,
            examenNombre,
            fechaExamen,
            periodicidadMeses,
            observaciones,
            syncToGoogleForms = false  // Flag para controlar si debe sincronizar con Google Forms
        } = req.body;

        // Validaciones
        if (!trabajadorNombre || !examenNombre || !fechaExamen) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos',
                message: 'Se requiere nombre del trabajador, examen y fecha'
            });
        }

        // Calcular fecha de vencimiento
        const fechaExamenDate = new Date(fechaExamen);
        const fechaVencimiento = new Date(fechaExamenDate);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (periodicidadMeses || 12));

        // Verificar si existe la tabla de agendamientos
        const tableExists = await db.schema.hasTable('agendamientos_examenes');
        
        let agendamientoId = null;
        
        if (tableExists) {
            // Guardar en BD
            const [result] = await db('agendamientos_examenes').insert({
                empresa_id: empresaId,
                trabajador_nombre: trabajadorNombre,
                cargo_id: cargoId,
                cargo_nombre: cargoNombre,
                examen_codigo: examenCodigo,
                examen_nombre: examenNombre,
                fecha_examen: fechaExamen,
                fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                periodicidad_meses: periodicidadMeses || 12,
                observaciones: observaciones || null,
                estado: 'agendado',
                created_by: req.user?.id || null,
                created_at: new Date(),
                updated_at: new Date()
            }).returning('id');
            agendamientoId = result?.id || result;
        }

        // Sincronizar con Google Forms (esto automáticamente llena la Sheet vinculada)
        // Solo sincronizar si syncToGoogleForms es true (para evitar duplicados)
        let googleSheetsSync = { success: false, message: 'No configurado' };

        const GOOGLE_FORM_ID = process.env.GOOGLE_FORM_ID || '';

        if (GOOGLE_FORM_ID && syncToGoogleForms) {
            try {
                // Extraer datos adicionales de observaciones
                const obsText = observaciones || '';
                const tipoExamenMatch = obsText.match(/\[Tipo:\s*([^\]]+)\]/);
                const enfasisMatch = obsText.match(/\[Énfasis:\s*([^\]]+)\]/);
                const ciudadMatch = obsText.match(/\[Ciudad:\s*([^\]]+)\]/);
                const idMatch = obsText.match(/\[ID:\s*([^\]]+)\]/);
                const edadMatch = obsText.match(/\[Edad:\s*([^\]]+)\]/);

                const tipoExamen = tipoExamenMatch ? tipoExamenMatch[1].trim() : '';
                const enfasis = enfasisMatch ? enfasisMatch[1].trim() : '';
                const ciudad = ciudadMatch ? ciudadMatch[1].trim() : '';
                const tipoIdNumId = idMatch ? idMatch[1].trim() : '';
                const edad = edadMatch ? edadMatch[1].trim() : '';

                // Separar tipo de ID y número (ej: "Cédula de Ciudadanía 123321")
                // El número está al final, separado por espacio
                let tipoId = '';
                let numId = '';
                if (tipoIdNumId) {
                    // Buscar el último grupo de dígitos/caracteres que parezca un número de ID
                    const idParseMatch = tipoIdNumId.match(/^(.+?)\s+([\d\w-]+)$/);
                    if (idParseMatch) {
                        tipoId = idParseMatch[1].trim();  // Ej: "Cédula de Ciudadanía"
                        numId = idParseMatch[2].trim();    // Ej: "123321"
                    } else {
                        // Si no se puede parsear, usar todo como tipo de ID
                        tipoId = tipoIdNumId;
                    }
                }

                // Normalizar tipo de ID para que coincida exactamente con las opciones del formulario
                // Google Forms es case-sensitive y requiere coincidencia exacta
                const tipoIdNormalizado = tipoId
                    .replace(/Ciudadanía/i, 'ciudadanía')
                    .replace(/Extranjería/i, 'extranjería')
                    .replace(/Identidad/i, 'identidad');

                // Normalizar ciudad - quitar tildes según opciones del formulario
                const ciudadNormalizada = ciudad
                    .replace(/Bogotá/i, 'Bogotá')  // Bogotá SÍ tiene tilde en el form
                    .replace(/Medellín/i, 'Medellin')  // Medellin NO tiene tilde
                    .replace(/Montería/i, 'Monteria')  // Monteria NO tiene tilde
                    .replace(/Ibagué/i, 'Ibagué');  // Ibagué SÍ tiene tilde

                // Obtener nombre de empresa desde BD
                let empresaNombre = empresaId.toString();
                try {
                    const empresa = await db('empresas').where('id', empresaId).first();
                    if (empresa) {
                        empresaNombre = empresa.nombre || empresa.razon_social || empresa.nombre_legal || empresaId.toString();
                    }
                } catch (error) {
                    console.error('Error obteniendo nombre de empresa:', error);
                }

                // Parsear fecha para enviar en formato Google Forms (año, mes, día separados)
                const fechaParts = fechaExamen.split('-'); // Formato: YYYY-MM-DD
                const year = fechaParts[0];
                const month = parseInt(fechaParts[1]); // Sin ceros a la izquierda
                const day = parseInt(fechaParts[2]);   // Sin ceros a la izquierda

                // Construir form data según los Entry IDs CORRECTOS del Google Form
                // IMPORTANTE: Estos son los IDs de los CAMPOS DE ENTRADA, no de las preguntas
                const formData = new URLSearchParams({
                    'entry.1787785604_year': year,                                     // Fecha - año
                    'entry.1787785604_month': month.toString(),                        // Fecha - mes
                    'entry.1787785604_day': day.toString(),                            // Fecha - día
                    'entry.686343894': empresaNombre,                                  // Empresa
                    'entry.611314675': empresaNombre,                                  // Nombre y cargo de quien autoriza
                    'entry.668223314': trabajadorNombre,                               // Nombres y apellidos completos
                    'entry.145196227': tipoIdNormalizado,                              // Tipo de identificación
                    'entry.132774813': numId,                                          // No de identificación
                    'entry.827793193': edad,                                           // Edad
                    'entry.1820730534': cargoNombre || '',                             // Cargo
                    'entry.100947566': ciudadNormalizada,                              // Ciudad
                    'entry.1650877741': tipoExamen,                                    // Tipo de examen
                    'entry.307171024': enfasis,                                        // Énfasis
                    'entry.1003988408': 'No Aplica',                                   // Paraclínicos
                    'entry.1702649339': 'No Aplica',                                   // Exámenes de laboratorio
                    'entry.289803857': 'No Aplica',                                    // Psicología
                    'entry.1508953456': observaciones || '',                           // Observaciones
                    // Campos adicionales requeridos por Google Forms
                    'entry.1650877741_sentinel': '',
                    'entry.307171024_sentinel': '',
                    'entry.1003988408_sentinel': '',
                    'entry.1702649339_sentinel': '',
                    'entry.289803857_sentinel': '',
                    'fvv': '1',
                    'pageHistory': '0'
                });

                // Submit to Google Form
                const formSubmitUrl = `https://docs.google.com/forms/d/${GOOGLE_FORM_ID}/formResponse`;

                console.log('📝 [GOOGLE FORM] ========================================');
                console.log('📝 [GOOGLE FORM] Enviando datos al formulario...');
                console.log('   URL:', formSubmitUrl);
                console.log('   Datos enviados:', Object.fromEntries(formData.entries()));
                console.log('   Body completo:', formData.toString());

                const response = await fetch(formSubmitUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                });

                console.log('📝 [GOOGLE FORM] Respuesta recibida:');
                console.log('   Status:', response.status);
                console.log('   StatusText:', response.statusText);
                console.log('📝 [GOOGLE FORM] ========================================');

                // Google Forms always returns 200, even on success (redirects to confirmation page)
                // So we consider any response as success
                googleSheetsSync = {
                    success: true,
                    message: 'Enviado a Google Forms/Sheets exitosamente',
                    debug: {
                        status: response.status,
                        statusText: response.statusText
                    }
                };

            } catch (sheetError) {
                console.error('Error sincronizando con Google Forms:', sheetError);
                googleSheetsSync = {
                    success: false,
                    message: `Error: ${sheetError.message}`
                };
            }
        }


        res.json({
            success: true,
            message: 'Agendamiento registrado exitosamente',
            agendamiento: {
                id: agendamientoId,
                trabajadorNombre,
                cargoNombre,
                examenNombre,
                fechaExamen,
                fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
                periodicidadMeses,
                estado: 'agendado'
            },
            googleSheetsSync
        });

    } catch (error) {
        console.error('Error registrando agendamiento:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar agendamiento',
            message: error.message
        });
    }
}

/**
 * Obtener agendamientos de una empresa
 */
export async function obtenerAgendamientos(req, res) {
    try {
        const { empresaId } = req.params;
        const { estado, desde, hasta } = req.query;

        // Verificar si existe la tabla
        const tableExists = await db.schema.hasTable('agendamientos_examenes');
        
        if (!tableExists) {
            return res.json({
                success: true,
                agendamientos: [],
                resumen: {
                    total: 0,
                    agendados: 0,
                    completados: 0,
                    vencidos: 0
                }
            });
        }

        let query = db('agendamientos_examenes')
            .where('empresa_id', empresaId)
            .orderBy('fecha_examen', 'asc');

        if (estado) {
            query = query.where('estado', estado);
        }

        if (desde) {
            query = query.where('fecha_examen', '>=', desde);
        }

        if (hasta) {
            query = query.where('fecha_examen', '<=', hasta);
        }

        const agendamientos = await query;

        // Calcular resumen
        const hoy = new Date();
        const resumen = {
            total: agendamientos.length,
            agendados: agendamientos.filter(a => a.estado === 'agendado').length,
            completados: agendamientos.filter(a => a.estado === 'completado').length,
            vencidos: agendamientos.filter(a => 
                a.estado !== 'completado' && new Date(a.fecha_vencimiento) < hoy
            ).length
        };

        res.json({
            success: true,
            agendamientos: agendamientos.map(a => ({
                id: a.id,
                trabajadorNombre: a.trabajador_nombre,
                cargoNombre: a.cargo_nombre,
                examenCodigo: a.examen_codigo,
                examenNombre: a.examen_nombre,
                fechaExamen: a.fecha_examen,
                fechaVencimiento: a.fecha_vencimiento,
                periodicidadMeses: a.periodicidad_meses,
                observaciones: a.observaciones,
                estado: a.estado,
                createdAt: a.created_at
            })),
            resumen
        });

    } catch (error) {
        console.error('Error obteniendo agendamientos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener agendamientos',
            message: error.message
        });
    }
}

/**
 * Actualizar estado de un agendamiento
 */
export async function actualizarAgendamiento(req, res) {
    try {
        const { agendamientoId } = req.params;
        const { estado, fechaExamen, observaciones } = req.body;

        // Verificar si existe la tabla
        const tableExists = await db.schema.hasTable('agendamientos_examenes');
        
        if (!tableExists) {
            return res.status(404).json({
                success: false,
                error: 'Tabla de agendamientos no existe'
            });
        }

        const agendamiento = await db('agendamientos_examenes')
            .where('id', agendamientoId)
            .first();

        if (!agendamiento) {
            return res.status(404).json({
                success: false,
                error: 'Agendamiento no encontrado'
            });
        }

        const updateData = {
            updated_at: new Date()
        };

        if (estado) updateData.estado = estado;
        if (fechaExamen) {
            updateData.fecha_examen = fechaExamen;
            // Recalcular vencimiento
            const fechaExamenDate = new Date(fechaExamen);
            const fechaVencimiento = new Date(fechaExamenDate);
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (agendamiento.periodicidad_meses || 12));
            updateData.fecha_vencimiento = fechaVencimiento.toISOString().split('T')[0];
        }
        if (observaciones !== undefined) updateData.observaciones = observaciones;

        await db('agendamientos_examenes')
            .where('id', agendamientoId)
            .update(updateData);

        res.json({
            success: true,
            message: 'Agendamiento actualizado',
            agendamiento: {
                id: agendamientoId,
                ...updateData
            }
        });

    } catch (error) {
        console.error('Error actualizando agendamiento:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar agendamiento',
            message: error.message
        });
    }
}

/**
 * Configuración de Google Forms/Sheets
 * Retorna la URL del formulario y estado de configuración
 */
export async function obtenerConfiguracionGoogle(req, res) {
    try {
        const googleFormId = process.env.GOOGLE_FORM_ID || '';

        res.json({
            success: true,
            configuracion: {
                googleFormId: googleFormId ? 'Configurado' : 'No configurado',
                googleFormUrl: googleFormId
                    ? `https://docs.google.com/forms/d/${googleFormId}/viewform`
                    : null,
                integrationType: 'Direct Form Submission'
            }
        });

    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener configuración'
        });
    }
}

/**
 * Registrar múltiples agendamientos en una sola operación (BATCH)
 * Guarda todos los agendamientos en BD y envía UNA sola respuesta a Google Forms
 */
export async function registrarAgendamientoBatch(req, res) {
    try {
        const { empresaId } = req.params;
        const {
            trabajadorNombre,
            cargoNombre,
            fechaExamen,
            examenes = [],  // Array de {codigo, nombre, periodicidadMeses}
            datosAdicionales = {},
            observaciones
        } = req.body;

        console.log('📋 [BATCH] ========================================');
        console.log('📋 [BATCH] Registrando agendamientos batch:', {
            empresaId,
            trabajadorNombre,
            numExamenes: examenes.length,
            examenes: examenes.map(e => e.nombre)
        });

        // Validaciones
        if (!trabajadorNombre || !fechaExamen || examenes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos',
                message: 'Se requiere nombre del trabajador, fecha y al menos un examen'
            });
        }

        // Verificar si existe la tabla de agendamientos
        const tableExists = await db.schema.hasTable('agendamientos_examenes');

        const agendamientosCreados = [];

        if (tableExists) {
            // Crear un agendamiento por cada examen en la BD
            for (const examen of examenes) {
                const fechaExamenDate = new Date(fechaExamen);
                const fechaVencimiento = new Date(fechaExamenDate);
                fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (examen.periodicidadMeses || 12));

                const [result] = await db('agendamientos_examenes').insert({
                    empresa_id: empresaId,
                    trabajador_nombre: trabajadorNombre,
                    cargo_nombre: cargoNombre,
                    examen_codigo: examen.codigo,
                    examen_nombre: examen.nombre,
                    fecha_examen: fechaExamen,
                    fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                    periodicidad_meses: examen.periodicidadMeses || 12,
                    observaciones: observaciones || null,
                    estado: 'agendado',
                    created_by: req.user?.id || null,
                    created_at: new Date(),
                    updated_at: new Date()
                }).returning('id');

                agendamientosCreados.push({
                    id: result?.id || result,
                    examenNombre: examen.nombre,
                    fechaVencimiento: fechaVencimiento.toISOString().split('T')[0]
                });
            }
        }

        console.log('📋 [BATCH] Agendamientos creados en BD:', agendamientosCreados.length);

        // ========== MAPEO INTELIGENTE DE EXÁMENES A GOOGLE FORMS ==========
        // Agrupar exámenes por categoría del formulario
        const categorias = {
            paraclinicos: [],
            laboratorio: [],
            psicologia: []
        };

        // Mapeo de nombres de exámenes a categorías del Google Form
        const EXAM_TO_CATEGORY = {
            // Paraclínicos
            'audiometría': 'paraclinicos',
            'audiometria': 'paraclinicos',
            'optometría': 'paraclinicos',
            'optometria': 'paraclinicos',
            'visiometría': 'paraclinicos',
            'visiometria': 'paraclinicos',
            'espirometría': 'paraclinicos',
            'espirometria': 'paraclinicos',
            'electrocardiograma': 'paraclinicos',

            // Laboratorio (buscar palabras clave)
            'cuadro hemático': 'laboratorio',
            'cuadro hematico': 'laboratorio',
            'hemático': 'laboratorio',
            'hematico': 'laboratorio',
            'glicemia': 'laboratorio',
            'perfil lipídico': 'laboratorio',
            'perfil lipidico': 'laboratorio',
            'lipídico': 'laboratorio',
            'lipidico': 'laboratorio',
            'creatinina': 'laboratorio',
            'laboratorio': 'laboratorio',

            // Psicología
            'psicosénsométrica': 'psicologia',
            'psicosensometrica': 'psicologia',
            'psicosénsométricas': 'psicologia',
            'psicosensometricas': 'psicologia',
            'psicotécnica': 'psicologia',
            'psicotecnica': 'psicologia',
            'psicotécnicas': 'psicologia',
            'psicotecnicas': 'psicologia',
            'psicología': 'psicologia',
            'psicologia': 'psicologia'
        };

        // Valores exactos que espera el Google Form (según FB_LOAD_DATA_)
        const GOOGLE_FORM_VALUES = {
            paraclinicos: {
                'audiometría': 'Audiometría',
                'audiometria': 'Audiometría',  // Sin tilde
                'optometría': 'Optometría',
                'optometria': 'Optometría',
                'visiometría': 'Visiometría',
                'visiometria': 'Visiometría',
                'espirometría': 'Espirometría',
                'espirometria': 'Espirometría',
                'electrocardiograma': 'Electrocardiograma'
            },
            laboratorio: {
                'cuadro hemático': 'Cuadro Hemático.',
                'cuadro hematico': 'Cuadro Hemático.',
                'glicemia': 'Glicemia.',
                'perfil lipídico': 'Perfil Lipídico.',
                'perfil lipidico': 'Perfil Lipídico.'
            },
            psicologia: {
                'psicosénsométricas': 'Pruebas Psicosénsometricas',
                'psicosensometricas': 'Pruebas Psicosénsometricas',
                'psicosénsométrica': 'Pruebas Psicosénsometricas',  // Singular
                'psicosensometrica': 'Pruebas Psicosénsometricas',   // Singular sin tilde
                'psicotécnicas': 'Pruebas Psicotécnicas',
                'psicotecnicas': 'Pruebas Psicotécnicas',
                'psicotécnica': 'Pruebas Psicotécnicas',
                'psicotecnica': 'Pruebas Psicotécnicas'
            }
        };

        // Agrupar exámenes por categoría
        for (const examen of examenes) {
            const nombreLower = examen.nombre.toLowerCase();
            let categorizado = false;

            // Buscar coincidencia exacta o parcial
            for (const [keyword, categoria] of Object.entries(EXAM_TO_CATEGORY)) {
                if (nombreLower.includes(keyword)) {
                    // Intentar mapear a valor exacto del Google Form
                    let valorForm = null;

                    // Primero buscar coincidencia exacta del nombre completo
                    if (categoria === 'paraclinicos') {
                        valorForm = GOOGLE_FORM_VALUES.paraclinicos[nombreLower];
                    } else if (categoria === 'laboratorio') {
                        valorForm = GOOGLE_FORM_VALUES.laboratorio[nombreLower];
                    } else if (categoria === 'psicologia') {
                        valorForm = GOOGLE_FORM_VALUES.psicologia[nombreLower];
                    }

                    // Si no hay coincidencia exacta, buscar por el keyword que hizo match
                    if (!valorForm) {
                        if (categoria === 'paraclinicos') {
                            valorForm = GOOGLE_FORM_VALUES.paraclinicos[keyword];
                        } else if (categoria === 'laboratorio') {
                            valorForm = GOOGLE_FORM_VALUES.laboratorio[keyword];
                        } else if (categoria === 'psicologia') {
                            valorForm = GOOGLE_FORM_VALUES.psicologia[keyword];
                        }
                    }

                    // Si aún no hay valor, usar el nombre original
                    if (!valorForm) {
                        valorForm = examen.nombre;
                    }

                    categorias[categoria].push(valorForm);
                    categorizado = true;
                    break;
                }
            }

            // Si no se pudo categorizar, agregarlo a observaciones
            if (!categorizado) {
                console.log(`⚠️ [BATCH] Examen no categorizado: ${examen.nombre} - se agregará a observaciones`);
            }
        }

        console.log('📋 [BATCH] Exámenes agrupados por categoría:', {
            paraclinicos: categorias.paraclinicos,
            laboratorio: categorias.laboratorio,
            psicologia: categorias.psicologia
        });

        // ========== SINCRONIZAR CON GOOGLE FORMS ==========
        let googleSheetsSync = { success: false, message: 'No configurado' };
        const GOOGLE_FORM_ID = process.env.GOOGLE_FORM_ID || '';

        if (GOOGLE_FORM_ID) {
            try {
                // Extraer datos adicionales
                const { tipoExamen, enfasis, ciudad, tipoId, numId, edad } = datosAdicionales;

                // Normalizar tipo de ID
                const tipoIdNormalizado = (tipoId || '')
                    .replace(/Ciudadanía/i, 'ciudadanía')
                    .replace(/Extranjería/i, 'extranjería')
                    .replace(/Identidad/i, 'identidad');

                // Normalizar ciudad
                const ciudadNormalizada = (ciudad || '')
                    .replace(/Bogotá/i, 'Bogotá')
                    .replace(/Medellín/i, 'Medellin')
                    .replace(/Montería/i, 'Monteria')
                    .replace(/Ibagué/i, 'Ibagué');

                // Obtener nombre de empresa
                let empresaNombre = empresaId.toString();
                try {
                    const empresa = await db('empresas').where('id', empresaId).first();
                    if (empresa) {
                        empresaNombre = empresa.nombre || empresa.razon_social || empresa.nombre_legal || empresaId.toString();
                    }
                } catch (error) {
                    console.error('Error obteniendo nombre de empresa:', error);
                }

                // Parsear fecha
                const fechaParts = fechaExamen.split('-');
                const year = fechaParts[0];
                const month = parseInt(fechaParts[1]);
                const day = parseInt(fechaParts[2]);

                // Agregar lista de exámenes a observaciones
                const examenesLista = examenes.map(e => `- ${e.nombre} (${e.periodicidadMeses || 12} meses)`).join('\n');
                const observacionesCompletas = `${observaciones || ''}\n\n[EXÁMENES AGENDADOS]\n${examenesLista}`.trim();

                // Construir form data BASE (sin checkboxes)
                const formData = new URLSearchParams({
                    'entry.1787785604_year': year,
                    'entry.1787785604_month': month.toString(),
                    'entry.1787785604_day': day.toString(),
                    'entry.686343894': empresaNombre,
                    'entry.611314675': empresaNombre,
                    'entry.668223314': trabajadorNombre,
                    'entry.145196227': tipoIdNormalizado,
                    'entry.132774813': numId || '',
                    'entry.827793193': edad || '',
                    'entry.1820730534': cargoNombre || '',
                    'entry.100947566': ciudadNormalizada,
                    'entry.1650877741': tipoExamen || '',
                    'entry.307171024': enfasis || '',
                    'entry.1508953456': observacionesCompletas,
                    // Sentinel fields
                    'entry.1650877741_sentinel': '',
                    'entry.307171024_sentinel': '',
                    'entry.1003988408_sentinel': '',
                    'entry.1702649339_sentinel': '',
                    'entry.289803857_sentinel': '',
                    'fvv': '1',
                    'pageHistory': '0'
                });

                // Agregar valores de checkbox MÚLTIPLES para cada categoría
                // Google Forms requiere múltiples entradas con el mismo entry ID para checkboxes

                // Paraclínicos
                if (categorias.paraclinicos.length > 0) {
                    categorias.paraclinicos.forEach(valor => {
                        formData.append('entry.1003988408', valor);
                    });
                } else {
                    formData.append('entry.1003988408', 'No Aplica');
                }

                // Laboratorio
                if (categorias.laboratorio.length > 0) {
                    categorias.laboratorio.forEach(valor => {
                        formData.append('entry.1702649339', valor);
                    });
                } else {
                    formData.append('entry.1702649339', 'No Aplica');
                }

                // Psicología
                if (categorias.psicologia.length > 0) {
                    categorias.psicologia.forEach(valor => {
                        formData.append('entry.289803857', valor);
                    });
                } else {
                    formData.append('entry.289803857', 'No Aplica');
                }

                console.log('📝 [GOOGLE FORM BATCH] ========================================');
                console.log('📝 [GOOGLE FORM BATCH] Enviando UNA respuesta con TODOS los exámenes...');
                console.log('   Paraclínicos:', categorias.paraclinicos.length > 0 ? categorias.paraclinicos : ['No Aplica']);
                console.log('   Laboratorio:', categorias.laboratorio.length > 0 ? categorias.laboratorio : ['No Aplica']);
                console.log('   Psicología:', categorias.psicologia.length > 0 ? categorias.psicologia : ['No Aplica']);
                console.log('   FormData toString:', formData.toString());

                const formSubmitUrl = `https://docs.google.com/forms/d/${GOOGLE_FORM_ID}/formResponse`;
                const response = await fetch(formSubmitUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData.toString()
                });

                console.log('📝 [GOOGLE FORM BATCH] Respuesta:', response.status, response.statusText);
                console.log('📝 [GOOGLE FORM BATCH] ========================================');

                googleSheetsSync = {
                    success: true,
                    message: 'Enviado a Google Forms/Sheets exitosamente',
                    categorizacion: {
                        paraclinicos: categorias.paraclinicos,
                        laboratorio: categorias.laboratorio,
                        psicologia: categorias.psicologia
                    },
                    debug: {
                        status: response.status,
                        statusText: response.statusText
                    }
                };

            } catch (sheetError) {
                console.error('Error sincronizando con Google Forms:', sheetError);
                googleSheetsSync = {
                    success: false,
                    message: `Error: ${sheetError.message}`
                };
            }
        }

        res.json({
            success: true,
            message: `${agendamientosCreados.length} agendamientos registrados exitosamente`,
            agendamientosCreados: agendamientosCreados.length,
            agendamientos: agendamientosCreados,
            googleSheetsSync
        });

    } catch (error) {
        console.error('Error registrando agendamientos batch:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar agendamientos',
            message: error.message
        });
    }
}

export default {
    registrarAgendamiento,
    registrarAgendamientoBatch,
    obtenerAgendamientos,
    actualizarAgendamiento,
    obtenerConfiguracionGoogle
};




