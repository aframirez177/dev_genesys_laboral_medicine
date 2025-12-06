// server/src/config/exam-details-config.js

/**
 * Mapeo de códigos de examen a sus nombres completos y periodicidad estándar.
 * ESTA INFORMACIÓN ES UN REFLEJO EXACTO DE LA CONFIGURACIÓN
 * EN `client/src/js/components/calculator.js` para mantener consistencia.
 *
 * periodicidadMeses: frecuencia estándar de realización del examen periódico
 */
export const EXAM_DETAILS = {
    EMO: { fullName: 'EXAMEN MEDICO CON ENFASIS OSTEOMUSCULAR', periodicidadMeses: 12 },
    EMOA: { fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN ALTURAS', periodicidadMeses: 12 },
    EMOD: { fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS DERMATOLOGICO', periodicidadMeses: 12 },
    EMOMP: { fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN MANIPULACION DE ALIMENTOS', periodicidadMeses: 12 },
    AUD: { fullName: 'AUDIOMETRIA', periodicidadMeses: 12 },
    ESP: { fullName: 'ESPIROMETRÍA', periodicidadMeses: 12 },
    OPTO: { fullName: 'OPTOMETRÍA', periodicidadMeses: 24 },
    VIS: { fullName: 'VISIOMETRÍA', periodicidadMeses: 24 },
    ECG: { fullName: 'ELECTROCARDIOGRAMA', periodicidadMeses: 12 },
    RXC: { fullName: 'RAYOS X DE COLUMNA', periodicidadMeses: 60 },
    PSM: { fullName: 'PRUEBA PSICOSENSOMETRICA', periodicidadMeses: 12 },
    PST: { fullName: 'PRUEBA PSICOTECNICA', periodicidadMeses: 24 },
    FRO: { fullName: 'FROTIS FARINGEO', periodicidadMeses: 6 },
    GLI: { fullName: 'GLICEMIA', periodicidadMeses: 12 },
    CH: { fullName: 'CUADRO HEMATICO', periodicidadMeses: 12 },
    RH: { fullName: 'HEMOCLASIFICIÓN GRUPO ABO Y FACTOR RH', periodicidadMeses: 999 }, // Solo ingreso
    KOH: { fullName: 'PRUEBA DE KOH', periodicidadMeses: 12 },
    BUN: { fullName: 'NITROGENO UREICO [BUN]', periodicidadMeses: 12 },
    PL: { fullName: 'PERFIL LIPÍDICO', periodicidadMeses: 12 },
    PAS: { fullName: 'PRUEBA DE ALCOHOL EN SALIVA', periodicidadMeses: 6 },
    PE: { fullName: 'PRUEBA DE EMBARAZO', periodicidadMeses: 999 }, // Solo cuando aplique
    PSP: { fullName: 'PRUEBA DE SUSTANCIAS PSICOACTIVAS', periodicidadMeses: 6 },
    TGO: { fullName: 'TRANSAMINASAS TGO', periodicidadMeses: 12 },
    TGP: { fullName: 'TRANSAMINASAS TGP', periodicidadMeses: 12 },
    TRI: { fullName: 'TRIGLICÉRIDOS', periodicidadMeses: 12 },
    COL: { fullName: 'COLESTEROL', periodicidadMeses: 12 },
    COP: { fullName: 'COPROLOGICO', periodicidadMeses: 12 },
    LEP: { fullName: 'LEPTOSPIRA', periodicidadMeses: 12 },
    BRU: { fullName: 'BRUCELA', periodicidadMeses: 12 },
    TOX: { fullName: 'TOXOPLASMA', periodicidadMeses: 12 },
    COLI: { fullName: 'COLINESTERASA', periodicidadMeses: 6 },
    CRE: { fullName: 'CREATININA', periodicidadMeses: 12 },
    ORI: { fullName: 'PARCIAL DE ORINA', periodicidadMeses: 12 },
    TET: { fullName: 'VACUNA DEL TETANO', periodicidadMeses: 120 }, // 10 años
    VH: { fullName: 'VACUNA DEL VIRUS HEPATITIS', periodicidadMeses: 999 }, // Solo cuando aplique
    VT: { fullName: 'VACUNA DEL TETANO', periodicidadMeses: 120 },
    VFA: { fullName: 'VACUNA DE FIEBRE AMARILLA', periodicidadMeses: 120 },
    T4L: { fullName: 'T4 LIBRE', periodicidadMeses: 12 },

    // hasta que tengan una definición oficial en calculator.js, para mantener consistencia.
};

/**
 * Formatea la periodicidad de meses a texto legible
 */
export function formatearPeriodicidad(meses) {
    if (meses >= 999) return 'Solo ingreso/egreso';
    if (meses >= 120) return `Cada ${Math.floor(meses / 12)} años`;
    if (meses >= 24) return `Cada ${Math.floor(meses / 12)} años`;
    if (meses === 12) return 'Anual';
    if (meses === 6) return 'Semestral';
    if (meses === 3) return 'Trimestral';
    if (meses === 1) return 'Mensual';
    return `Cada ${meses} meses`;
} 