// server/src/config/exam-prices-config.js

/**
 * Configuración de precios y descuentos para exámenes médicos.
 * ESTA INFORMACIÓN ES UN REFLEJO EXACTO DE LA CONFIGURACIÓN
 * EN `client/src/js/components/calculator.js` para mantener consistencia total.
 */

export const EXAM_CONFIG = {
    EMO: { basePrice: 32100 },
    EMOA: { basePrice: 35310 },
    EMOD: { basePrice: 32100 },
    EMOMP: { basePrice: 32100 },
    AUD: { basePrice: 25145 },
    ESP: { basePrice: 25145 },
    OPTO: { basePrice: 25145 },
    VIS: { basePrice: 16000 },
    ECG: { basePrice: 44940 },
    RXC: { basePrice: 74900 },
    PSM: { basePrice: 43000 },
    PST: { basePrice: 37450 },
    FRO: { basePrice: 13500 },
    GLI: { basePrice: 16050 },
    CH: { basePrice: 18500 },
    RH: { basePrice: 14980 },
    KOH: { basePrice: 13500 },
    BUN: { basePrice: 14980 },
    PL: { basePrice: 34240 },
    PAS: { basePrice: 42800 },
    PE: { basePrice: 19260 },
    PSP: { basePrice: 36380 },
    TGO: { basePrice: 19260 },
    TGP: { basePrice: 19260 },
    TRI: { basePrice: 16050 },
    COL: { basePrice: 16050 },
    COP: { basePrice: 13500 },
    LEP: { basePrice: 90415 },
    BRU: { basePrice: 84530 },
    TOX: { basePrice: 55000 },
    COLI: { basePrice: 53500 },
    CRE: { basePrice: 19000 },
    ORI: { basePrice: 19500 },
    TET: { basePrice: 43000 }
};

export const DISCOUNT_RANGES = {
    '0-7': { min: 0, max: 7, discount: 0.0 },
    '8-10': { min: 1, max: 10, discount: 0.05 },
    '11-50': { min: 11, max: 50, discount: 0.10 },
    '51-100': { min: 51, max: 100, discount: 0.15 },
    '101-500': { min: 101, max: 500, discount: 0.20 },
    '501+': { min: 501, max: Infinity, discount: 0.25 }
}; 