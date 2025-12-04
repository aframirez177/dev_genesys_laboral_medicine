// server/src/utils/risk-calculations.js

/**
 * Calcula el nivel de probabilidad según GTC 45
 * NP = ND x NE
 *
 * ✅ Sprint 6 Bug Fix A.3: ND=0 tratado como "No Aplica"
 * Cuando ND=0, se usa multiplicador=1 en lugar de 0
 */
export function calcularNivelProbabilidad(nivelDeficiencia, nivelExposicion) {
    // ✅ Bug Fix A.3: Tratar ND=0 como "No Aplica"
    if (nivelDeficiencia === 0) {
        return {
            valor: nivelExposicion, // NP = NE * 1 (multiplicador implícito)
            nivel: 'No Aplica',
            interpretacion: 'No existe deficiencia - Solo exposición',
            esNoAplica: true,
            ndOriginal: 0
        };
    }

    const np = nivelDeficiencia * nivelExposicion;

    if (np >= 24) return {
        valor: np,
        nivel: 'Muy Alto',
        interpretacion: 'Situación deficiente con exposición continua'
    };
    if (np >= 10) return {
        valor: np,
        nivel: 'Alto',
        interpretacion: 'Situación deficiente con exposición frecuente'
    };
    if (np >= 6) return {
        valor: np,
        nivel: 'Medio',
        interpretacion: 'Situación deficiente con exposición ocasional'
    };
    return {
        valor: np,
        nivel: 'Bajo',
        interpretacion: 'Situación mejorable con exposición ocasional'
    };
}

/**
 * Calcula el nivel de riesgo según GTC 45
 * NR = NP x NC
 */
export function calcularNivelRiesgo(nivelProbabilidad, nivelConsecuencia) {
    const nr = nivelProbabilidad * nivelConsecuencia;
    
    if (nr >= 600) return {
        valor: nr,
        nivel: 'I',
        interpretacion: 'Situación crítica. Corrección urgente',
        aceptabilidad: 'No Aceptable',
        color: '#FF0000' // Rojo
    };
    if (nr >= 150) return {
        valor: nr,
        nivel: 'II',
        interpretacion: 'Corregir o adoptar medidas de control',
        aceptabilidad: 'No Aceptable o Aceptable con control específico',
        color: '#FFA500' // Naranja
    };
    if (nr >= 40) return {
        valor: nr,
        nivel: 'III',
        interpretacion: 'Mejorar el control existente',
        aceptabilidad: 'Mejorable',
        color: '#FFFF00' // Amarillo
    };
    return {
        valor: nr,
        nivel: 'IV',
        interpretacion: 'No intervenir, salvo que un análisis más preciso lo justifique',
        aceptabilidad: 'Aceptable',
        color: '#008000' // Verde
    };
}