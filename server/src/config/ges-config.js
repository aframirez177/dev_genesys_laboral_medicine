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

    // --- RIESGO FÍSICO ---
    "Iluminación deficiente": {
        consecuencias: "Fatiga visual, generación de accidentes.",
        peorConsecuencia: "Accidente grave",
        examenesMedicos: { "VIS": 1, "PSM": 2 },
        aptitudesRequeridas: [
            "Agudeza visual corregida y visión nocturna adecuada.",
            "Capacidad de adaptación a diferentes niveles de luz."
        ],
        condicionesIncompatibles: [
            "Visión reducida o ceguera nocturna.",
            "Problemas de adaptación a la oscuridad o al bajo contraste."
        ],
        eppSugeridos: [
            "Lámparas portátiles de seguridad",
            "Señalización fotoluminiscente"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de la iluminación del área de trabajo para cumplir con los estándares.",
            sustitucion: "Reemplazo de luminarias ineficientes por sistemas LED de alta eficiencia.",
            controlesIngenieria: "Instalación de sistemas de iluminación automatizados y con sensores de presencia.",
            controlesAdministrativos: "Mantenimiento preventivo de luminarias y medición de niveles de lux."
        }
    },
    "Iluminación en exceso": {
        consecuencias: "Fatiga visual, generación de accidentes.",
        peorConsecuencia: "Accidente grave",
        examenesMedicos: { "VIS": 1, "PSM": 2 },
        aptitudesRequeridas: [
            "Agudeza visual corregida y capacidad para trabajar con altos niveles de luz.",
            "Ausencia de fotofobia o hipersensibilidad a la luz."
        ],
        condicionesIncompatibles: [
            "Sensibilidad a la luz o fotofobia.",
            "Cataratas u otras enfermedades oculares que agraven la exposición."
        ],
        eppSugeridos: [
            "Gafas de seguridad con filtro UV",
            "Cortinas o pantallas protectoras"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de la iluminación para reducir la intensidad lumínica.",
            sustitucion: "Implementación de sistemas de iluminación regulables.",
            controlesIngenieria: "Instalación de controles automáticos de intensidad de luz.",
            controlesAdministrativos: "Realización de estudios de iluminación y pausas visuales activas."
        }
    },
    "Presiones anormales": {
        consecuencias: "Heridas, traumas, abrasiones, quemaduras.",
        peorConsecuencia: "Daño severo",
        examenesMedicos: { "EMO": 1, "AUD": 1, "VIS": 1, "PST": 1, "ESP": 2 },
        aptitudesRequeridas: [
            "Estado físico y mental que permita trabajar en ambientes presurizados.",
            "Agudeza auditiva para detectar fugas o cambios en la presión.",
            "Conocimiento de protocolos de emergencia."
        ],
        condicionesIncompatibles: [
            "Trastornos cardíacos o respiratorios graves.",
            "Otitis crónica o perforación timpánica."
        ],
        eppSugeridos: [
            "Equipos de protección específicos para alta/baja presión",
            "Monitores de presión personales"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño del proceso para evitar la manipulación de sistemas presurizados.",
            sustitucion: "Implementación de equipos más seguros con sistemas de control de presión integrados.",
            controlesIngenieria: "Instalación de sistemas de control de presión y válvulas de seguridad.",
            controlesAdministrativos: "Procedimientos específicos y capacitación para manejo de presiones anormales."
        }
    },
    "Radiaciones ionizantes": {
        consecuencias: "Enfermedades crónicas, quemaduras, daños genéticos.",
        peorConsecuencia: "Cáncer",
        examenesMedicos: { "EMO": 1, "OPT": 1, "VIS": 1, "ECG": 1, "PST": 1, "CH": 1, "PE": 1, "TGO": 1, "TGP": 1, "CRE": 1, "BUN": 1, "T4L": 1, "TSH": 1 },
        aptitudesRequeridas: [
            "Conciencia plena de los riesgos y protocolos de seguridad.",
            "Capacidad para seguir procedimientos de control de exposición.",
            "Estado de salud que permita una adecuada respuesta a la exposición."
        ],
        condicionesIncompatibles: [
            "Embarazo o intención de embarazo.",
            "Antecedentes de cáncer o enfermedades hematológicas.",
            "Daño genético preexistente."
        ],
        eppSugeridos: [
            "Dosímetros personales",
            "Delantales plomados",
            "Gafas plomadas",
            "Protectores de tiroides"
        ],
        medidasIntervencion: {
            eliminacion: "Sustitución de procesos con radiación por alternativas no radiológicas.",
            sustitucion: "Uso de tecnologías más seguras que minimicen la radiación.",
            controlesIngenieria: "Blindaje de áreas, barreras de protección y sistemas de contención.",
            controlesAdministrativos: "Control estricto del tiempo de exposición, distancia y blindaje."
        }
    },
    "Radiaciones no ionizantes": {
        consecuencias: "Lesiones menores, daños en la piel y los ojos.",
        peorConsecuencia: "Cáncer de piel, cataratas.",
        examenesMedicos: { "EMO": 1, "VIS": 1, "AUD": 2, "PST": 2 },
        aptitudesRequeridas: [
            "Integridad de la piel y mucosas.",
            "Salud visual adecuada para soportar la exposición.",
            "Conocimiento sobre los efectos de la radiación."
        ],
        condicionesIncompatibles: [
            "Enfermedades fotosensibles de la piel.",
            "Cataratas o problemas visuales preexistentes."
        ],
        eppSugeridos: [
            "Gafas con filtro UV",
            "Ropa protectora UV (cuando aplique)",
            "Protector solar"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de procesos para eliminar la fuente de radiación.",
            sustitucion: "Uso de equipos más seguros que minimicen la emisión.",
            controlesIngenieria: "Apantallamiento y barreras físicas para contener la radiación.",
            controlesAdministrativos: "Controlar el tiempo de exposición y rotación de personal."
        }
    },
    "Ruido": {
        consecuencias: "Hipoacusia, alteraciones fisiológicas.",
        peorConsecuencia: "Sordera permanente",
        examenesMedicos: { "EMO": 1, "AUD": 1, "ESP": 2, "PSM": 2, "PST": 2 },
        aptitudesRequeridas: [
            "Capacidad auditiva adecuada (sin hipoacusia previa).",
            "Capacidad para seguir protocolos de seguridad y usar EPP de forma correcta."
        ],
        condicionesIncompatibles: [
            "Sordera preexistente o hipoacusia severa.",
            "Patologías auditivas crónicas (otitis)."
        ],
        eppSugeridos: [
            "Protectores auditivos de tipo copa",
            "Tapones auditivos desechables o reutilizables"
        ],
        medidasIntervencion: {
            eliminacion: "Reemplazo de equipos o maquinaria ruidosa.",
            sustitucion: "Uso de equipos más silenciosos o con menor vibración.",
            controlesIngenieria: "Encerramientos acústicos, barreras y cabinas de aislamiento.",
            controlesAdministrativos: "Controlar el tiempo de exposición, rotación de personal y capacitación en uso de EPP."
        }
    },
    "Temperaturas extremas: calor": {
        consecuencias: "Deshidratación, golpe de calor, quemaduras.",
        peorConsecuencia: "Muerte",
        examenesMedicos: { "EMO": 1, "VIS": 1, "PST": 1, "AUD": 2, "ESP": 2 },
        aptitudesRequeridas: [
            "Buena salud cardiovascular y respiratoria.",
            "Capacidad de termorregulación adecuada.",
            "Condiciones de hidratación óptimas."
        ],
        condicionesIncompatibles: [
            "Enfermedades cardiovasculares o respiratorias crónicas.",
            "Insuficiencia renal o diabetes no controlada.",
            "Uso de medicamentos que afecten la termorregulación."
        ],
        eppSugeridos: [
            "Ropa de trabajo fresca y transpirable",
            "Sistemas de hidratación disponibles",
            "Gorro o casco para protección solar"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de procesos en ambientes de calor extremo.",
            sustitucion: "Implementación de procesos que generen menos calor.",
            controlesIngenieria: "Sistemas de ventilación forzada, aire acondicionado y zonas de refugio frescas.",
            controlesAdministrativos: "Pausas programadas para hidratación y aclimatación, monitoreo de la salud."
        }
    },
    "Temperaturas extremas: frío": {
        consecuencias: "Congelamiento, hipotermia, quemaduras por frío.",
        peorConsecuencia: "Hipotermia severa",
        examenesMedicos: { "EMO": 1, "VIS": 1, "PST": 1, "AUD": 2, "ESP": 2 },
        aptitudesRequeridas: [
            "Buena salud cardiovascular y circulatoria.",
            "Capacidad de termorregulación adecuada.",
            "Integridad de la piel sin enfermedades crónicas."
        ],
        condicionesIncompatibles: [
            "Enfermedad de Raynaud.",
            "Insuficiencia circulatoria periférica.",
            "Enfermedades respiratorias crónicas (asma)."
        ],
        eppSugeridos: [
            "Ropa térmica en capas",
            "Guantes térmicos",
            "Calzado térmico",
            "Gorros y pasamontañas"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de procesos para evitar la exposición directa al frío.",
            sustitucion: "Uso de procesos que requieran temperaturas menos frías.",
            controlesIngenieria: "Sistemas de calefacción, aislamiento de áreas frías y cabinas con temperatura controlada.",
            controlesAdministrativos: "Rotación de personal en áreas frías, pausas activas y disponibilidad de bebidas calientes."
        }
    },
    "Vibraciones mano-cuerpo": {
        consecuencias: "Síndrome de vibración mano-brazo, trastornos vasculares y neurológicos.",
        peorConsecuencia: "Daño permanente, incapacidad laboral.",
        examenesMedicos: { "EMO": 1 },
        aptitudesRequeridas: [
            "Integridad osteomuscular y neurológica en extremidades superiores.",
            "Ausencia de trastornos circulatorios."
        ],
        condicionesIncompatibles: [
            "Síndrome de túnel carpiano.",
            "Fenómeno de Raynaud o trastornos circulatorios en manos.",
            "Enfermedades osteomusculares crónicas."
        ],
        eppSugeridos: [
            "Guantes anti-vibración",
            "Herramientas con mangos ergonómicos y amortiguación"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de tareas que requieran herramientas vibratorias.",
            sustitucion: "Uso de herramientas de bajo impacto o con sistemas anti-vibración.",
            controlesIngenieria: "Amortiguación y aislamiento de la fuente de vibración.",
            controlesAdministrativos: "Limitar el tiempo de exposición y establecer pausas programadas."
        }
    },
    "Vibraciones cuerpo completo": {
        consecuencias: "Dolor lumbar, hernias discales, fatiga.",
        peorConsecuencia: "Daño permanente en la columna vertebral.",
        examenesMedicos: { "EMO": 1, "RXC": 1 },
        aptitudesRequeridas: [
            "Buena salud osteomuscular y de la columna vertebral.",
            "Ausencia de patologías lumbares crónicas."
        ],
        condicionesIncompatibles: [
            "Hernia discal o patologías de columna preexistentes.",
            "Problemas renales o gástricos que puedan agravarse."
        ],
        eppSugeridos: [
            "Asientos y plataformas amortiguados",
            "Mobiliario con aislamiento de vibraciones"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de la conducción de vehículos que generan vibración.",
            sustitucion: "Uso de equipos más modernos y con mejores sistemas de suspensión.",
            controlesIngenieria: "Aislamiento de la fuente de vibración en vehículos y maquinaria pesada.",
            controlesAdministrativos: "Pausas y rotación de personal, capacitación en manejo de equipos."
        }
    },
    "Cambios bruscos de temperatura": {
        consecuencias: "Afecciones respiratorias, cefaleas, cambios en la tensión arterial.",
        peorConsecuencia: "Daño permanente, enfermedades crónicas.",
        examenesMedicos: { "EMO": 1, "AUD": 2, "ESP": 2 },
        aptitudesRequeridas: [
            "Salud respiratoria y circulatoria adecuada.",
            "Capacidad para adaptarse a variaciones térmicas."
        ],
        condicionesIncompatibles: [
            "Enfermedades respiratorias crónicas (asma, EPOC).",
            "Patologías cardiovasculares que reaccionen a cambios de temperatura."
        ],
        eppSugeridos: [
            "Ropa térmica adecuada para cada ambiente",
            "Uso de EPP térmico al pasar de un ambiente a otro"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de flujos de trabajo para minimizar el paso entre zonas de temperaturas extremas.",
            sustitucion: "Implementación de equipos más modernos que regulen la temperatura de los procesos.",
            controlesIngenieria: "Zonas de transición con temperatura moderada, aislamiento de áreas.",
            controlesAdministrativos: "Pausas programadas para aclimatación y rotación de personal."
        }
    },
    "Humedad Relativa (Vapor de agua)": {
        consecuencias: "Dificultad en la termorregulación, sequedad de piel y mucosas.",
        peorConsecuencia: "Daño permanente en la piel, deshidratación.",
        examenesMedicos: { "EMO": 1, "AUD": 2, "ESP": 2 },
        aptitudesRequeridas: [
            "Integridad de la piel y mucosas.",
            "Capacidad de termorregulación adecuada."
        ],
        condicionesIncompatibles: [
            "Enfermedades de la piel como dermatitis.",
            "Patologías respiratorias crónicas."
        ],
        eppSugeridos: [
            "Dehumidificadores",
            "Humidificadores",
            "Ropa de trabajo adecuada"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de procesos para controlar la generación de vapor de agua.",
            sustitucion: "Uso de sistemas de climatización con control de humedad integrado.",
            controlesIngenieria: "Sistemas de ventilación y extracción de vapor, humidificadores/deshumidificadores.",
            controlesAdministrativos: "Monitoreo periódico de la humedad relativa y capacitación sobre riesgos."
        }
    }
};