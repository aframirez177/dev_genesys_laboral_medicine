// server/src/config/exam-details-config.js

/**
 * Mapeo de códigos de examen a sus nombres completos.
 * ESTA INFORMACIÓN ES UN REFLEJO EXACTO DE LA CONFIGURACIÓN
 * EN `client/src/js/components/calculator.js` para mantener consistencia.
 */
export const EXAM_DETAILS = {
    EMO: { fullName: 'EXAMEN MEDICO CON ENFASIS OSTEOMUSCULAR' },
    EMOA: { fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN ALTURAS' },
    EMOD: { fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS DERMATOLOGICO' },
    EMOMP: { fullName: 'EXAMEN MEDICO OSTEOMUSCULAR CON ENFASIS EN MANIPULACION DE ALIMENTOS' },
    AUD: { fullName: 'AUDIOMETRIA' },
    ESP: { fullName: 'ESPIROMETRÍA' },
    OPTO: { fullName: 'OPTOMETRÍA' },
    VIS: { fullName: 'VISIOMETRÍA' },
    ECG: { fullName: 'ELECTROCARDIOGRAMA' },
    RXC: { fullName: 'RAYOS X DE COLUMNA' },
    PSM: { fullName: 'PRUEBA PSICOSENSOMETRICA' },
    PST: { fullName: 'PRUEBA PSICOTECNICA' },
    FRO: { fullName: 'FROTIS FARINGEO' },
    GLI: { fullName: 'GLICEMIA' },
    CH: { fullName: 'CUADRO HEMATICO' },
    RH: { fullName: 'HEMOCLASIFICIÓN GRUPO ABO Y FACTOR RH' },
    KOH: { fullName: 'PRUEBA DE KOH' },
    BUN: { fullName: 'NITROGENO UREICO [BUN]' },
    PL: { fullName: 'PERFIL LIPÍDICO' },
    PAS: { fullName: 'PRUEBA DE ALCOHOL EN SALIVA' },
    PE: { fullName: 'PRUEBA DE EMBARAZO' },
    PSP: { fullName: 'PRUEBA DE SUSTANCIAS PSICOACTIVAS' },
    TGO: { fullName: 'TRANSAMINASAS TGO' },
    TGP: { fullName: 'TRANSAMINASAS TGP' },
    TRI: { fullName: 'TRIGLICÉRIDOS' },
    COL: { fullName: 'COLESTEROL' },
    COP: { fullName: 'COPROLOGICO' },
    LEP: { fullName: 'LEPTOSPIRA' },
    BRU: { fullName: 'BRUCELA' },
    TOX: { fullName: 'TOXOPLASMA' },
    COLI: { fullName: 'COLINESTERASA' },
    CRE: { fullName: 'CREATININA' },
    ORI: { fullName: 'PARCIAL DE ORINA' },
    TET: { fullName: 'VACUNA DEL TETANO' }
    // NOTA: Los códigos extra (T4L, TSH, etc.) de ges-config.js se omiten por ahora
    // hasta que tengan una definición oficial en calculator.js, para mantener consistencia.
}; 