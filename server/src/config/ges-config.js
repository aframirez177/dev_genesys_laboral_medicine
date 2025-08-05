// server/src/config/ges-config.js
export const GES_DATOS_PREDEFINIDOS = {
    // --- RIESGO MECÁNICO ---
    "Caídas al mismo nivel": {
        consecuencias: "Heridas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMO": 1, "VIS": 1, "PSM": 2 },
        aptitudesRequeridas: [
            "Buena agudeza visual y percepción espacial.",
            "Coordinación motriz y equilibrio adecuados.",
            "Capacidad de atención y concentración para evitar obstáculos."
        ],
        condicionesIncompatibles: [
            "Vértigo o mareos crónicos.",
            "Trastornos de la marcha o del equilibrio.",
            "Hipovisión severa no corregida."
        ],
        eppSugeridos: [ "Calzado de seguridad antideslizante" ],
        medidasIntervencion: {
            eliminacion: "Reparación de superficies irregulares y eliminación de obstáculos.",
            sustitucion: "Sustitución de pisos por materiales antideslizantes.",
            controlesIngenieria: "Señalización clara de áreas de riesgo y demarcación de zonas de tránsito.",
            controlesAdministrativos: "Capacitación en orden y aseo, inspecciones periódicas de áreas."
        }
    },
    "Caídas de altura": {
        consecuencias: "Heridas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMOA": 1, "VIS": 1, "ECG": 1, "PST": 1, "PSP": 1, "AUD": 2, "ESP": 2, "OPT": 2, "PSM": 2, "GLI": 2 },
        aptitudesRequeridas: [
            "Buena agudeza visual y percepción de profundidad.",
            "Coordinación motriz y equilibrio adecuados.",
            "Ausencia de vértigo o trastornos del equilibrio.",
            "Capacidad para trabajar bajo presión y seguir protocolos de seguridad."
        ],
        condicionesIncompatibles: [
            "Vértigo o mareos crónicos.",
            "Epilepsia no controlada.",
            "Alteraciones del equilibrio o enfermedades cardiovasculares severas."
        ],
        eppSugeridos: [
            "Arnés de seguridad de cuerpo completo",
            "Línea de vida y punto de anclaje certificado",
            "Casco con barbuquejo",
            "Calzado de seguridad con protección antideslizante"
        ],
        medidasIntervencion: {
            eliminacion: "Realizar trabajos a nivel del suelo siempre que sea posible.",
            sustitucion: "Uso de plataformas elevadoras en lugar de andamios.",
            controlesIngenieria: "Instalación de barandas permanentes y redes de seguridad.",
            controlesAdministrativos: "Permisos de trabajo en altura y capacitación certificada (Res. 1409)."
        }
    },
    "Posibilidad de atrapamiento": {
        consecuencias: "Heridas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMO": 1, "VIS": 1, "PSM": 2 },
        aptitudesRequeridas: [
            "Buena coordinación motriz fina y gruesa.",
            "Capacidad de reacción rápida y toma de decisiones.",
            "Integridad osteomuscular en extremidades."
        ],
        condicionesIncompatibles: [
            "Discapacidad motriz en extremidades superiores o inferiores.",
            "Problemas de audición que impidan escuchar alarmas o advertencias.",
            "Trastornos de la atención y la concentración."
        ],
        eppSugeridos: [
            "Guardas de seguridad en maquinaria",
            "Dispositivos de parada de emergencia",
            "Ropa ajustada sin elementos sueltos"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de procesos peligrosos que requieren interacción manual.",
            sustitucion: "Implementación de equipos con sistemas de seguridad intrínsecos.",
            controlesIngenieria: "Instalación de guardas, barreras físicas y sensores de proximidad.",
            controlesAdministrativos: "Procedimientos de bloqueo y etiquetado (LOTO) y capacitación específica."
        }
    },
    "Posibilidad de ser golpeado por objetos que caen o en movimiento": {
        consecuencias: "Heridas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMO": 1, "VIS": 1, "PSM": 2 },
        aptitudesRequeridas: [
            "Buena agudeza visual y percepción de profundidad.",
            "Capacidad de reacción rápida y agilidad de movimiento."
        ],
        condicionesIncompatibles: [
            "Visión monocular o campo visual reducido.",
            "Problemas de movilidad o trastornos del equilibrio."
        ],
        eppSugeridos: [
            "Casco de seguridad",
            "Calzado con puntera de seguridad",
            "Gafas de seguridad"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de áreas de trabajo para evitar la manipulación de cargas en altura.",
            sustitucion: "Implementación de sistemas automatizados de transporte de materiales.",
            controlesIngenieria: "Barreras físicas, redes de seguridad y túneles protectores.",
            controlesAdministrativos: "Señalización y demarcación de áreas de tránsito de cargas."
        }
    },
    "Posibilidad de proyección de partículas o fluidos a presión": {
        consecuencias: "Heridas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMO": 1, "VIS": 1, "PST": 2 },
        aptitudesRequeridas: [
            "Agudeza visual adecuada para proteger los ojos.",
            "Capacidad de reacción rápida para evitar el contacto.",
            "Conocimiento de protocolos de emergencia y manipulación de fluidos."
        ],
        condicionesIncompatibles: [
            "Hipovisión o ceguera parcial.",
            "Uso de lentes de contacto en ambientes con partículas."
        ],
        eppSugeridos: [
            "Gafas de seguridad",
            "Careta facial",
            "Ropa de protección contra fluidos"
        ],
        medidasIntervencion: {
            eliminacion: "Cambio de procesos que generen proyecciones.",
            sustitucion: "Uso de sistemas cerrados y equipos encapsulados.",
            controlesIngenieria: "Instalación de pantallas de protección y barreras físicas.",
            controlesAdministrativos: "Procedimientos de trabajo seguro y uso obligatorio de EPP."
        }
    },
    "Posibilidad de perforación o de punzonamiento": {
        consecuencias: "Heridas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMO": 1, "VIS": 1, "PST": 2 },
        aptitudesRequeridas: [
            "Coordinación motriz fina y gruesa.",
            "Destreza manual para manipulación de herramientas.",
            "Agudeza visual adecuada."
        ],
        condicionesIncompatibles: [
            "Movimientos involuntarios o temblores.",
            "Trastornos de la sensibilidad en manos.",
            "Amputaciones o limitaciones funcionales en extremidades."
        ],
        eppSugeridos: [
            "Guantes anticorte",
            "Calzado de seguridad con plantilla antiperforación",
            "Mangas de protección"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de procesos con riesgo de perforación.",
            sustitucion: "Uso de herramientas con protecciones integradas.",
            controlesIngenieria: "Instalación de guardas de seguridad y dispositivos de control.",
            controlesAdministrativos: "Capacitación en uso seguro de herramientas y procedimientos de trabajo."
        }
    },
    "Posibilidad de corte o seccionamiento": {
        consecuencias: "Heridas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMO": 1, "VIS": 1, "PST": 2 },
        aptitudesRequeridas: [
            "Coordinación motriz fina y gruesa.",
            "Destreza manual para manipulación de herramientas.",
            "Agudeza visual adecuada."
        ],
        condicionesIncompatibles: [
            "Movimientos involuntarios o temblores.",
            "Trastornos de la sensibilidad en manos.",
            "Amputaciones o limitaciones funcionales en extremidades."
        ],
        eppSugeridos: [
            "Guantes anticorte",
            "Mangas de protección",
            "Delantal de seguridad"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de procesos de corte.",
            sustitucion: "Uso de herramientas con sistemas de seguridad integrados.",
            controlesIngenieria: "Instalación de guardas y dispositivos de protección.",
            controlesAdministrativos: "Procedimientos de trabajo seguro y mantenimiento preventivo de equipos."
        }
    },

    // --- RIESGO ELÉCTRICO ---
    "Alta tensión debido a instalaciones eléctricas locativas y estáticas": {
        consecuencias: "Quemaduras, fibrilación ventricular, shock eléctrico.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMOA": 1, "VIS": 1, "ECG": 1, "PST": 1, "PSP": 1, "AUD": 2, "ESP": 2, "GLI": 2, "CH": 2 },
        aptitudesRequeridas: [
            "Salud cardiovascular y neurológica en óptimas condiciones.",
            "Visión y audición adecuadas para percibir advertencias.",
            "Capacidad para seguir protocolos estrictos y trabajar bajo presión."
        ],
        condicionesIncompatibles: [
            "Epilepsia no controlada, arritmias cardíacas o marcapasos.",
            "Angina de pecho o antecedentes de infarto.",
            "Uso de medicamentos que afecten la coordinación o la conciencia."
        ],
        eppSugeridos: [
            "Guantes dieléctricos de clase adecuada",
            "Botas dieléctricas",
            "Traje ignífugo (Arc Flash)",
            "Careta de seguridad para arco eléctrico"
        ],
        medidasIntervencion: {
            eliminacion: "Desenergización completa y verificación de ausencia de tensión.",
            sustitucion: "Implementación de sistemas de bajo voltaje o tecnologías seguras.",
            controlesIngenieria: "Sistemas de bloqueo y etiquetado (LOTO), aislamiento y puesta a tierra.",
            controlesAdministrativos: "Procedimientos específicos de trabajo seguro con energía."
        }
    },
    "Media tensión debido a instalaciones eléctricas locativas y estáticas": {
        consecuencias: "Quemaduras, fibrilación ventricular, shock eléctrico.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMOA": 1, "VIS": 1, "ECG": 1, "PST": 1, "PSP": 1, "AUD": 2, "ESP": 2, "GLI": 2, "CH": 2 },
        aptitudesRequeridas: [
            "Salud cardiovascular y neurológica en óptimas condiciones.",
            "Agudeza visual y auditiva para percibir advertencias y riesgos.",
            "Capacidad para seguir protocolos de seguridad estrictos."
        ],
        condicionesIncompatibles: [
            "Epilepsia no controlada o arritmias cardiacas.",
            "Angina de pecho o antecedentes de infarto.",
            "Uso de medicamentos que alteren la coordinación o la conciencia."
        ],
        eppSugeridos: [
            "Guantes dieléctricos de clase adecuada",
            "Calzado dieléctrico",
            "Herramientas con aislamiento certificado"
        ],
        medidasIntervencion: {
            eliminacion: "Reubicación de instalaciones a zonas de menor riesgo.",
            sustitucion: "Actualización de sistemas eléctricos a tecnologías más seguras.",
            controlesIngenieria: "Aislamiento físico y señalización de áreas de media tensión.",
            controlesAdministrativos: "Permisos de trabajo y capacitación en seguridad eléctrica."
        }
    },
    "Baja tensión debido a instalaciones eléctricas locativas y estáticas": {
        consecuencias: "Quemaduras, fibrilación ventricular, shock eléctrico.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMOA": 1, "VIS": 1, "ECG": 1, "PST": 1, "PSP": 1, "AUD": 2, "ESP": 2, "GLI": 2, "CH": 2 },
        aptitudesRequeridas: [
            "Salud cardiovascular y neurológica en óptimas condiciones.",
            "Destreza manual para manipulación de herramientas.",
            "Agudeza visual y auditiva para la identificación de riesgos."
        ],
        condicionesIncompatibles: [
            "Epilepsia no controlada o arritmias cardiacas.",
            "Uso de medicamentos que alteren la coordinación o la conciencia."
        ],
        eppSugeridos: [
            "Guantes dieléctricos",
            "Herramientas con aislamiento certificado",
            "Calzado dieléctrico"
        ],
        medidasIntervencion: {
            eliminacion: "Reemplazo de instalaciones eléctricas defectuosas o con cableado expuesto.",
            sustitucion: "Implementación de sistemas más seguros con protecciones eléctricas intrínsecas.",
            controlesIngenieria: "Protecciones eléctricas, fusibles y disyuntores de alta sensibilidad.",
            controlesAdministrativos: "Capacitación en riesgos eléctricos y mantenimiento preventivo."
        }
    },
    "Electricidad estática": {
        consecuencias: "Quemaduras, fibrilación ventricular, shock eléctrico.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMOA": 1, "VIS": 1, "ECG": 1, "PST": 1, "PSP": 1, "AUD": 2, "ESP": 2, "GLI": 2, "CH": 2 },
        aptitudesRequeridas: [
            "Ausencia de condiciones médicas que exacerben el riesgo eléctrico.",
            "Capacidad para seguir protocolos de seguridad específicos."
        ],
        condicionesIncompatibles: [
            "Condiciones cardiacas inestables.",
            "Sensibilidad al contacto eléctrico."
        ],
        eppSugeridos: [
            "Calzado antiestático",
            "Muñequeras antiestáticas",
            "Ropa de trabajo antiestática"
        ],
        medidasIntervencion: {
            eliminacion: "Control de humedad ambiental para evitar la acumulación de carga estática.",
            sustitucion: "Uso de materiales antiestáticos en el proceso de producción.",
            controlesIngenieria: "Sistemas de puesta a tierra, barras ionizadoras y pisos conductivos.",
            controlesAdministrativos: "Procedimientos de control de estática y revisión periódica de equipos."
        }
    },
};