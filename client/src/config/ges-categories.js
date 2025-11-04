/**
 * ges-categories.js - Lista unificada de GES y categorías de riesgo
 *
 * Esta es la ÚNICA fuente de verdad para la lista de riesgos.
 * Usada por: wizard, formulario matriz de riesgos, IA, backend
 */

export const GES_CATEGORIES = {
  Mecánico: {
    color: '#2196F3', // Azul
    items: [
      "Caídas al mismo nivel",
      "Caídas de altura",
      "Posibilidad de atrapamiento",
      "Posibilidad de ser golpeado por objetos que caen o en movimiento",
      "Posibilidad de proyección de partículas o fluidos a presión",
      "Posibilidad de perforación o de punzonamiento",
      "Posibilidad de corte o seccionamiento",
    ]
  },

  Eléctrico: {
    color: '#FFEB3B', // Amarillo
    items: [
      "Alta tensión debido a instalaciones eléctricas locativas y estáticas",
      "Media tensión debido a instalaciones eléctricas locativas y estáticas",
      "Baja tensión debido a instalaciones eléctricas locativas y estáticas",
      "Electricidad estática",
    ]
  },

  Físico: {
    color: '#FF9800', // Naranja
    items: [
      "Iluminación deficiente",
      "Iluminación en exceso",
      "Presiones anormales",
      "Radiaciones ionizantes",
      "Radiaciones no ionizantes",
      "Radiaciones por equipos audiovisuales",
      "Ruido",
      "Temperaturas extremas: calor",
      "Temperaturas extremas: frío",
      "Vibraciones mano-cuerpo",
      "Vibraciones cuerpo completo",
      "Cambios bruscos de temperatura",
      "Humedad Relativa (Vapor de agua)",
    ]
  },

  Químico: {
    color: '#9C27B0', // Morado
    items: [
      "Exposición a gases vapores humos polvos no tóxicos",
      "Exposición a gases vapores humos polvos tóxicos",
      "Exposición sustancias químicas líquidas tóxicas",
      "Exposición sustancias químicas líquidas no tóxicas",
      "Exposición a sustancias químicas que generan efectos en el organismo",
    ]
  },

  Biológico: {
    color: '#4CAF50', // Verde
    items: [
      "Presencia de animales/vectores transmisores de enfermedad",
      "Exposición a material contaminado o con riesgo biológico",
      "Manipulación de alimentos",
      "Exposición a microorganismos",
      "Exposición a Virus",
      "Exposición a Bacterias",
    ]
  },

  Biomecánico: {
    color: '#F44336', // Rojo
    items: [
      "Manejo de cargas mayores a 25 Kg (Hombres)",
      "Manejo de cargas mayores a 12.5 Kg (Mujeres)",
      "Adopción de posturas nocivas",
      "Movimientos repetitivos (6 o más por minuto)",
      "Diseño del puesto de trabajo inadecuado",
      "Posturas prolongadas y/o incorrectas",
    ]
  },

  "Factores Humanos": {
    color: '#795548', // Café
    items: [
      "Competencias no definidas para el cargo",
      "Actos inseguros observados",
    ]
  },

  Psicosocial: {
    color: '#E91E63', // Rosa/Fucsia
    items: [
      "Atención de público",
      "Monotonía/repetitividad de funciones",
      "Trabajo bajo presión",
    ]
  },

  Locativo: {
    color: '#607D8B', // Gris azulado
    items: [
      "Almacenamiento inadecuado",
      "Condiciones inadecuadas de orden y aseo",
      "Condiciones del piso",
      "Escaleras y barandas inadecuadas o mal estado",
      "Condiciones de las instalaciones",
    ]
  },

  Natural: {
    color: '#8BC34A', // Verde claro
    items: [
      "Deslizamientos",
      "Inundación",
      "Sismo - Terremotos",
      "Tormentas eléctricas",
      "Lluvias granizadas",
    ]
  },

  Seguridad: {
    color: '#FF5722', // Naranja rojizo
    items: [
      "Secuestros",
      "Amenazas",
      "Hurtos - Robos - Atracos",
      "Accidente de Tránsito",
      "Desorden público - Atentados",
      "Extorsión",
    ]
  },

  "Otros Riesgos": {
    color: '#673AB7', // Púrpura oscuro
    items: [
      "Trabajos en caliente",
      "Explosión",
      "Incendio"
    ]
  },

  "Saneamiento Básico": {
    color: '#00BCD4', // Cyan
    items: [
      "Sin disponibilidad de agua potable"
    ]
  },

  "Salud Pública": {
    color: '#009688', // Teal
    items: [
      "Enfermedades endémicas",
      "Mordedura y Picadura de Animales",
    ]
  }
};

/**
 * Obtener color de una categoría
 */
export function getCategoryColor(category) {
  return GES_CATEGORIES[category]?.color || '#757575';
}

/**
 * Obtener todos los GES como lista plana
 */
export function getAllGESFlat() {
  const result = [];
  Object.entries(GES_CATEGORIES).forEach(([category, data]) => {
    data.items.forEach(ges => {
      result.push({
        riesgo: category,
        ges: ges,
        color: data.color
      });
    });
  });
  return result;
}
