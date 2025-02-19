// server/src/config/gtc45.config.js

// Tablas de niveles según GTC 45
export const NIVEL_DEFICIENCIA = {
    MUY_ALTO: {
        valor: 10,
        descripcion: 'Se ha(n) detectado peligro(s) que determina(n) como posible la generación de incidentes o consecuencias muy significativas'
    },
    ALTO: {
        valor: 6,
        descripcion: 'Se ha(n) detectado algún(os) peligro(s) que pueden dar lugar a consecuencias significativa(s)'
    },
    MEDIO: {
        valor: 2,
        descripcion: 'Se han detectado peligros que pueden dar lugar a consecuencias poco significativas'
    },
    BAJO: {
        valor: 0,
        descripcion: 'No se ha detectado consecuencia alguna'
    }
};

export const NIVEL_EXPOSICION = {
    CONTINUA: {
        valor: 4,
        descripcion: 'La situación de exposición se presenta sin interrupción o varias veces con tiempo prolongado'
    },
    FRECUENTE: {
        valor: 3,
        descripcion: 'La situación de exposición se presenta varias veces durante la jornada laboral por tiempos cortos'
    },
    OCASIONAL: {
        valor: 2,
        descripcion: 'La situación de exposición se presenta alguna vez durante la jornada laboral y por un periodo de tiempo corto'
    },
    ESPORADICA: {
        valor: 1,
        descripcion: 'La situación de exposición se presenta de manera eventual'
    }
};

export const NIVEL_CONSECUENCIA = {
    MORTAL: {
        valor: 100,
        descripcion: 'Muerte'
    },
    MUY_GRAVE: {
        valor: 60,
        descripcion: 'Lesiones graves irreparables (Incapacidad permanente parcial o invalidez)'
    },
    GRAVE: {
        valor: 25,
        descripcion: 'Lesiones con incapacidad laboral temporal'
    },
    LEVE: {
        valor: 10,
        descripcion: 'Lesiones que no requieren hospitalización'
    }
};