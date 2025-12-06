/**
 * Script para limpiar códigos de exámenes médicos inválidos del catálogo GES
 *
 * Problema: La BD tiene códigos como VACU, MBICV que no existen en el catálogo oficial
 * Solución: Eliminar estos códigos del campo examenes_medicos en catalogo_ges
 */

import db from '../config/database.js';

// Catálogo oficial de exámenes médicos que ofrece Genesys
const VALID_EXAM_CODES = [
    // Exámenes Médicos Ocupacionales
    'EMO', 'EMOA', 'EMOD', 'EMOMP',
    // Audiológicos y Respiratorios
    'AUD', 'ESP',
    // Visuales
    'OPTO', 'VIS',
    // Cardiológicos
    'ECG',
    // Imagen
    'RXC',
    // Psicológicas
    'PSM', 'PST',
    // Laboratorio - Hematología
    'CH', 'RH',
    // Laboratorio - Química Sanguínea
    'GLI', 'PL', 'TRI', 'COL', 'BUN', 'CRE',
    // Laboratorio - Función Hepática
    'TGO', 'TGP',
    // Laboratorio - Otros
    'ORI', 'COP', 'FRO', 'KOH',
    // Exposición Biológica
    'LEP', 'BRU', 'TOX', 'COLI',
    // Sustancias
    'PAS', 'PSP',
    // Especiales
    'PE', 'T4L',
    // Vacunas
    'TET', 'VH', 'VT', 'VFA'
];

async function cleanInvalidExamCodes() {
    console.log('🧹 Iniciando limpieza de códigos de exámenes inválidos...\n');

    try {
        // 1. Obtener todos los GES con examenes_medicos
        const allGes = await db('catalogo_ges')
            .whereNotNull('examenes_medicos')
            .select('id', 'nombre', 'examenes_medicos');

        console.log(`📊 Encontrados ${allGes.length} registros GES con exámenes médicos\n`);

        let totalUpdated = 0;
        let totalInvalidCodesRemoved = 0;

        // 2. Para cada GES, verificar y limpiar códigos inválidos
        for (const ges of allGes) {
            const examenes = ges.examenes_medicos;
            const codes = Object.keys(examenes);
            const invalidCodes = codes.filter(code => !VALID_EXAM_CODES.includes(code));

            if (invalidCodes.length > 0) {
                console.log(`⚠️  GES ID ${ges.id}: "${ges.nombre}"`);
                console.log(`   Códigos inválidos encontrados: ${invalidCodes.join(', ')}`);
                console.log(`   Códigos válidos conservados: ${codes.filter(c => VALID_EXAM_CODES.includes(c)).join(', ')}`);

                // Limpiar exámenes: solo conservar códigos válidos
                const cleanedExamenes = {};
                codes.forEach(code => {
                    if (VALID_EXAM_CODES.includes(code)) {
                        cleanedExamenes[code] = examenes[code];
                    }
                });

                // Actualizar en BD
                await db('catalogo_ges')
                    .where('id', ges.id)
                    .update({
                        examenes_medicos: JSON.stringify(cleanedExamenes)
                    });

                console.log(`   ✅ Actualizado con ${Object.keys(cleanedExamenes).length} exámenes válidos\n`);

                totalUpdated++;
                totalInvalidCodesRemoved += invalidCodes.length;
            }
        }

        console.log(`\n📈 Resumen:`);
        console.log(`   ✅ Registros actualizados: ${totalUpdated}`);
        console.log(`   🗑️  Códigos inválidos eliminados: ${totalInvalidCodesRemoved}`);
        console.log(`   📊 Total registros procesados: ${allGes.length}`);

        if (totalUpdated === 0) {
            console.log(`\n✨ La base de datos ya está limpia - no se encontraron códigos inválidos`);
        } else {
            console.log(`\n✨ Limpieza completada exitosamente`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al limpiar códigos de exámenes:', error);
        process.exit(1);
    }
}

// Ejecutar script
cleanInvalidExamCodes();
