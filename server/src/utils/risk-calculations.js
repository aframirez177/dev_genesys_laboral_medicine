// server/src/utils/risk-calculations.js

/**
 * Calcula el nivel de probabilidad según GTC 45
 * NP = ND x NE
 */
export function calcularNivelProbabilidad(nivelDeficiencia, nivelExposicion) {
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