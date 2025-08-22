// server/src/config/ges-config.js
export const GES_DATOS_PREDEFINIDOS = {
    "Caídas al mismo nivel": {
        consecuencias: "Heridas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte",
        examenesMedicos: {
            EMO: 1,
            OPTO: 1
        },
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
        eppSugeridos: [
            "Calzado de seguridad antideslizante"
        ],
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
        examenesMedicos: {
            EMOA: 1,
            OPTO: 1,
            AUD: 1,
            ECG: 1,
            GLI: 1,
            PL: 1,
            PST: 2
        },
        aptitudesRequeridas: [
            "Buena agudeza visual y percepción de profundidad.",
            "Coordinación motriz y equilibrio adecuados.",
            "Ausencia de vértigo o trastornos del equilibrio.",
            "Capacidad para trabajar bajo presión y seguir protocolos de seguridad."
        ],
        condicionesIncompatibles: [
            "Vértigo o mareos crónicos.",
            "Epilepsia no controlada.",
            "Alteraciones del equilibrio o enfermedades cardiovasculares severas no controladas."
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
            controlesAdministrativos: "Permisos de trabajo en altura y capacitación certificada (Res. 4272 de 2021)."
        }
    },

    "Posibilidad de atrapamiento": {
        consecuencias: "Heridas, traumas, contusiones, fracturas, amputaciones.",
        peorConsecuencia: "Muerte",
        examenesMedicos: {
            EMO: 1,
            OPTO: 1,
            AUD: 2
        },
        aptitudesRequeridas: [
            "Buena coordinación motriz fina y gruesa.",
            "Capacidad de reacción rápida y toma de decisiones.",
            "Integridad osteomuscular en extremidades."
        ],
        condicionesIncompatibles: [
            "Discapacidad motriz en extremidades superiores o inferiores que impida una reacción rápida.",
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
        examenesMedicos: {
            EMO: 1,
            OPTO: 1,
            AUD: 1
        },
        aptitudesRequeridas: [
            "Buena agudeza visual y percepción de profundidad.",
            "Capacidad de reacción rápida y agilidad de movimiento.",
            "Capacidad auditiva para percibir señales de advertencia."
        ],
        condicionesIncompatibles: [
            "Visión monocular o campo visual reducido.",
            "Problemas de movilidad o trastornos del equilibrio.",
            "Hipoacusia severa no corregida."
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
        consecuencias: "Heridas, traumas oculares, quemaduras, contusiones.",
        peorConsecuencia: "Ceguera, Muerte.",
        examenesMedicos: {
            OPTO: 1,
            EMO: 2
        },
        aptitudesRequeridas: [
            "Agudeza visual adecuada para proteger los ojos.",
            "Capacidad de reacción rápida para evitar el contacto.",
            "Conocimiento de protocolos de emergencia y manipulación de fluidos."
        ],
        condicionesIncompatibles: [
            "Hipovisión o ceguera parcial.",
            "Uso de lentes de contacto en ambientes con partículas (según valoración)."
        ],
        eppSugeridos: [
            "Gafas de seguridad de impacto",
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
        consecuencias: "Heridas punzantes, infecciones, hemorragias.",
        peorConsecuencia: "Muerte por hemorragia o infección grave.",
        examenesMedicos: {
            EMO: 1,
            OPTO: 2
        },
        aptitudesRequeridas: [
            "Coordinación motriz fina y gruesa.",
            "Destreza manual para manipulación de herramientas.",
            "Agudeza visual adecuada."
        ],
        condicionesIncompatibles: [
            "Movimientos involuntarios o temblores.",
            "Trastornos de la sensibilidad en manos.",
            "Amputaciones o limitaciones funcionales en extremidades superiores."
        ],
        eppSugeridos: [
            "Guantes anti-perforación",
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
        consecuencias: "Heridas cortantes, amputaciones, hemorragias.",
        peorConsecuencia: "Muerte",
        examenesMedicos: {
            EMO: 1,
            OPTO: 2
        },
        aptitudesRequeridas: [
            "Coordinación motriz fina y gruesa.",
            "Destreza manual para manipulación de herramientas.",
            "Agudeza visual adecuada."
        ],
        condicionesIncompatibles: [
            "Movimientos involuntarios o temblores.",
            "Trastornos de la sensibilidad en manos.",
            "Amputaciones o limitaciones funcionales en extremidades superiores."
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

    "Alta tensión debido a instalaciones eléctricas locativas y estáticas": {
        consecuencias: "Quemaduras, fibrilación ventricular, shock eléctrico.",
        peorConsecuencia: "Muerte",
        examenesMedicos: {
            EMOA: 1,
            ECG: 1,
            OPTO: 1,
            AUD: 2,
            PST: 2
        },
        aptitudesRequeridas: [
            "Salud cardiovascular y neurológica en óptimas condiciones.",
            "Visión y audición adecuadas para percibir advertencias.",
            "Capacidad para seguir protocolos estrictos y trabajar bajo presión."
        ],
        condicionesIncompatibles: [
            "Epilepsia no controlada, arritmias cardíacas o uso de marcapasos.",
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
            eliminacion: "Desenergización completa y verificación de ausencia de tensión (Reglas de Oro).",
            sustitucion: "Implementación de sistemas de bajo voltaje o tecnologías seguras.",
            controlesIngenieria: "Sistemas de bloqueo y etiquetado (LOTO), aislamiento y puesta a tierra.",
            controlesAdministrativos: "Procedimientos de trabajo seguro con energía eléctrica (RETIE)."
        }
    },

    "Media tensión debido a instalaciones eléctricas locativas y estáticas": {
        consecuencias: "Quemaduras, fibrilación ventricular, shock eléctrico.",
        peorConsecuencia: "Muerte",
        examenesMedicos: {
            EMOA: 1,
            ECG: 1,
            OPTO: 1,
            AUD: 2,
            PST: 2
        },
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
            eliminacion: "Desenergización completa y verificación de ausencia de tensión (Reglas de Oro).",
            sustitucion: "Actualización de sistemas eléctricos a tecnologías más seguras.",
            controlesIngenieria: "Aislamiento físico y señalización de áreas de media tensión.",
            controlesAdministrativos: "Permisos de trabajo y capacitación en seguridad eléctrica (RETIE)."
        }
    },

    "Baja tensión debido a instalaciones eléctricas locativas y estáticas": {
        consecuencias: "Quemaduras, fibrilación ventricular, shock eléctrico.",
        peorConsecuencia: "Muerte",
        examenesMedicos: {
            EMO: 1,
            ECG: 1,
            OPTO: 2
        },
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
        consecuencias: "Quemaduras, shock eléctrico, ignición de atmósferas inflamables.",
        peorConsecuencia: "Muerte por explosión.",
        examenesMedicos: {
            EMO: 1,
            ECG: 2
        },
        aptitudesRequeridas: [
            "Ausencia de condiciones médicas que exacerben el riesgo eléctrico.",
            "Capacidad para seguir protocolos de seguridad específicos."
        ],
        condicionesIncompatibles: [
            "Condiciones cardiacas inestables."
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

    "Iluminación deficiente": {
        consecuencias: "Fatiga visual, caídas, golpes, generación de accidentes.",
        peorConsecuencia: "Accidente grave.",
        examenesMedicos: {
            OPTO: 1,
            
        },
        aptitudesRequeridas: [
            "Agudeza visual corregida y visión nocturna adecuada.",
            "Capacidad de adaptación a diferentes niveles de luz."
        ],
        condicionesIncompatibles: [
            "Visión reducida o ceguera nocturna no corregida.",
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
        consecuencias: "Fatiga visual, deslumbramiento, cefalea, generación de accidentes.",
        peorConsecuencia: "Accidente grave.",
        examenesMedicos: {
            OPTO: 1,
            
        },
        aptitudesRequeridas: [
            "Agudeza visual corregida y capacidad para trabajar con altos niveles de luz.",
            "Ausencia de fotofobia o hipersensibilidad a la luz."
        ],
        condicionesIncompatibles: [
            "Sensibilidad a la luz o fotofobia.",
            "Cataratas u otras enfermedades oculares que agraven la exposición."
        ],
        eppSugeridos: [
            "Gafas de seguridad con filtro para luz visible",
            "Pantallas anti-deslumbramiento para monitores"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de la iluminación para reducir la intensidad lumínica y el deslumbramiento.",
            sustitucion: "Implementación de sistemas de iluminación regulables (dimmers).",
            controlesIngenieria: "Instalación de persianas, cortinas o películas de control solar en ventanas.",
            controlesAdministrativos: "Realización de estudios de iluminación y pausas visuales activas."
        }
    },

    "Presiones anormales": {
        consecuencias: "Barotrauma, enfermedad por descompresión, embolia gaseosa.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            AUD: 1,
            ESP: 1,
            ECG: 2
        },
        aptitudesRequeridas: [
            "Estado físico y mental que permita trabajar en ambientes hiperbáricos o hipobáricos.",
            "Capacidad de compensación de presión en oído medio.",
            "Salud cardiovascular y respiratoria adecuada."
        ],
        condicionesIncompatibles: [
            "Trastornos cardíacos o respiratorios graves.",
            "Otitis crónica, perforación timpánica o sinusitis crónica.",
            "Obesidad mórbida."
        ],
        eppSugeridos: [
            "Equipos de buceo (para condiciones hiperbáricas)",
            "Equipos de oxígeno suplementario (para condiciones hipobáricas)"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de tareas en ambientes con presiones anormales.",
            sustitucion: "Implementación de equipos más seguros con sistemas de control de presión integrados.",
            controlesIngenieria: "Cámaras de descompresión, sistemas de presurización controlada.",
            controlesAdministrativos: "Procedimientos específicos, tablas de descompresión, capacitación y aptitud médica."
        }
    },

    "Radiaciones ionizantes": {
        consecuencias: "Enfermedades crónicas, quemaduras, daños genéticos, cáncer.",
        peorConsecuencia: "Cáncer, Muerte.",
        examenesMedicos: {
            EMO: 1,
            OPTO: 1,
            CH: 1,
            PE: 1,
            T4L: 1,
            TSH: 1,
            EMOD: 2,
            TGO: 2,
            TGP: 2,
            CRE: 2
        },
        aptitudesRequeridas: [
            "Conciencia plena de los riesgos y protocolos de seguridad.",
            "Capacidad para seguir procedimientos de control de exposición.",
            "Estado de salud que permita una adecuada respuesta a la exposición."
        ],
        condicionesIncompatibles: [
            "Embarazo o intención de embarazo.",
            "Antecedentes de cáncer o enfermedades hematológicas.",
            "Sistema inmunológico comprometido."
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
            controlesIngenieria: "Blindaje de áreas (plomo, concreto), sistemas de interbloqueo.",
            controlesAdministrativos: "Control estricto del tiempo de exposición, distancia y blindaje (ALARA)."
        }
    },
    
    "Radiaciones no ionizantes": {
        consecuencias: "Quemaduras, daños en la piel y los ojos, cataratas.",
        peorConsecuencia: "Cáncer de piel, cataratas.",
        examenesMedicos: {
            OPTO: 1,
            EMOD: 1,
            EMO: 2
        },
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
            "Gafas con filtro UV/IR",
            "Ropa protectora de manga larga",
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
        consecuencias: "Hipoacusia, acúfenos, estrés, alteraciones fisiológicas.",
        peorConsecuencia: "Sordera profesional (Hipoacusia Neurosensorial Inducida por Ruido).",
        examenesMedicos: {
            AUD: 1,
            EMO: 2,
            PST: 2
        },
        aptitudesRequeridas: [
            "Capacidad auditiva dentro de límites normales.",
            "Capacidad para seguir protocolos de seguridad y usar EPP de forma correcta."
        ],
        condicionesIncompatibles: [
            "Hipoacusia neurosensorial preexistente que pueda agravarse.",
            "Patologías auditivas crónicas (ej. otitis crónica supurativa)."
        ],
        eppSugeridos: [
            "Protectores auditivos de inserción (tapones)",
            "Protectores auditivos de copa (orejeras)"
        ],
        medidasIntervencion: {
            eliminacion: "Reemplazo de equipos o maquinaria ruidosa.",
            sustitucion: "Uso de equipos más silenciosos.",
            controlesIngenieria: "Encerramientos acústicos, barreras y cabinas de aislamiento.",
            controlesAdministrativos: "Controlar el tiempo de exposición, Programa de Conservación Auditiva."
        }
    },

    "Temperaturas extremas: calor": {
        consecuencias: "Deshidratación, golpe de calor, agotamiento por calor, síncope.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            ECG: 2,
            CRE: 2,
            GLI: 2
        },
        aptitudesRequeridas: [
            "Buena salud cardiovascular y respiratoria.",
            "Capacidad de termorregulación adecuada.",
            "Condiciones de hidratación óptimas."
        ],
        condicionesIncompatibles: [
            "Enfermedades cardiovasculares o respiratorias crónicas no controladas.",
            "Insuficiencia renal o diabetes no controlada.",
            "Uso de medicamentos que afecten la termorregulación (diuréticos, betabloqueadores)."
        ],
        eppSugeridos: [
            "Ropa de trabajo fresca y transpirable",
            "Sistemas de hidratación disponibles",
            "Gorro o casco para protección solar"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de procesos en ambientes de calor extremo.",
            sustitucion: "Implementación de procesos que generen menos calor.",
            controlesIngenieria: "Sistemas de ventilación forzada, aire acondicionado y zonas de refugio climatizadas.",
            controlesAdministrativos: "Pausas programadas para hidratación y descanso, aclimatación, monitoreo de temperatura corporal."
        }
    },

    "Temperaturas extremas: frío": {
        consecuencias: "Congelamiento, hipotermia, quemaduras por frío.",
        peorConsecuencia: "Hipotermia severa y muerte.",
        examenesMedicos: {
            EMO: 1,
            ECG: 2,
            ESP: 2
        },
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
            "Ropa térmica en capas (primera, segunda y tercera capa)",
            "Guantes térmicos",
            "Calzado térmico e impermeable",
            "Gorros y pasamontañas"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de procesos para evitar la exposición directa al frío.",
            sustitucion: "Uso de procesos que requieran temperaturas menos frías.",
            controlesIngenieria: "Sistemas de calefacción, aislamiento de áreas frías y cabinas con temperatura controlada.",
            controlesAdministrativos: "Rotación de personal en áreas frías, pausas para recuperación térmica y disponibilidad de bebidas calientes."
        }
    },

    "Vibraciones mano-cuerpo": {
        consecuencias: "Síndrome de vibración mano-brazo, trastornos vasculares (dedo blanco), neurológicos y osteomusculares.",
        peorConsecuencia: "Daño vascular y neurológico permanente, incapacidad laboral.",
        examenesMedicos: {
            EMO: 1
        },
        aptitudesRequeridas: [
            "Integridad osteomuscular y neurológica en extremidades superiores.",
            "Ausencia de trastornos circulatorios."
        ],
        condicionesIncompatibles: [
            "Síndrome de túnel carpiano preexistente.",
            "Fenómeno de Raynaud o trastornos circulatorios en manos.",
            "Enfermedades osteomusculares crónicas en miembro superior."
        ],
        eppSugeridos: [
            "Guantes anti-vibración",
            "Herramientas con mangos ergonómicos y amortiguación"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de tareas que requieran herramientas vibratorias.",
            sustitucion: "Uso de herramientas de bajo impacto o con sistemas anti-vibración.",
            controlesIngenieria: "Mantenimiento preventivo de herramientas para reducir vibraciones.",
            controlesAdministrativos: "Limitar el tiempo de exposición (rotación) y establecer pausas programadas."
        }
    },

    "Vibraciones cuerpo completo": {
        consecuencias: "Dolor lumbar, hernias discales, trastornos digestivos, fatiga.",
        peorConsecuencia: "Daño permanente en la columna vertebral.",
        examenesMedicos: {
            EMO: 1,
            RXC: 1
        },
        aptitudesRequeridas: [
            "Buena salud osteomuscular y de la columna vertebral.",
            "Ausencia de patologías lumbares crónicas."
        ],
        condicionesIncompatibles: [
            "Hernia discal o patologías de columna preexistentes.",
            "Espondilolistesis, espondilolisis.",
            "Embarazo."
        ],
        eppSugeridos: [
            "Asientos y plataformas con suspensión y amortiguación",
            "Sistemas de anclaje que reduzcan la transmisión de vibración"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de la conducción de vehículos que generan vibración.",
            sustitucion: "Uso de equipos más modernos y con mejores sistemas de suspensión.",
            controlesIngenieria: "Mejora de superficies de rodadura, mantenimiento de vehículos.",
            controlesAdministrativos: "Pausas y rotación de personal, capacitación en posturas de conducción."
        }
    },

    "Cambios bruscos de temperatura": {
        consecuencias: "Afecciones respiratorias, cefaleas, estrés térmico.",
        peorConsecuencia: "Agravamiento de enfermedades crónicas.",
        examenesMedicos: {
            EMO: 1,
            ESP: 2
        },
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
        consecuencias: "Dificultad en la termorregulación, proliferación de hongos y bacterias, afecciones respiratorias.",
        peorConsecuencia: "Enfermedades respiratorias crónicas.",
        examenesMedicos: {
            EMO: 1,
            ESP: 2,
            EMOD: 2
        },
        aptitudesRequeridas: [
            "Integridad de la piel y mucosas.",
            "Capacidad de termorregulación adecuada."
        ],
        condicionesIncompatibles: [
            "Enfermedades de la piel como dermatitis atópica.",
            "Patologías respiratorias crónicas (asma, rinitis)."
        ],
        eppSugeridos: [
            "Ropa de trabajo transpirable o impermeable según el caso",
            "Sistemas de protección respiratoria si hay presencia de bioaerosoles"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de procesos para controlar la generación de vapor de agua.",
            sustitucion: "Uso de sistemas de climatización con control de humedad integrado.",
            controlesIngenieria: "Sistemas de ventilación y extracción de vapor, humidificadores/deshumidificadores.",
            controlesAdministrativos: "Monitoreo periódico de la humedad relativa y capacitación sobre riesgos."
        }
    },
    
    "Exposición a gases vapores humos polvos no tóxicos": {
        consecuencias: "Irritación respiratoria, alergias, neumoconiosis benignas.",
        peorConsecuencia: "Daño respiratorio crónico.",
        examenesMedicos: {
            ESP: 1,
            EMO: 1,
            RXC: 2,
            OPTO: 2
        },
        aptitudesRequeridas: [
            "Buena capacidad pulmonar y salud respiratoria.",
            "Integridad de la piel y mucosas.",
            "Capacidad para utilizar equipos de protección respiratoria."
        ],
        condicionesIncompatibles: [
            "Asma, rinitis alérgica o enfermedades respiratorias crónicas.",
            "Sensibilidad a partículas o sustancias en el ambiente."
        ],
        eppSugeridos: [
            "Respiradores con filtros para material particulado (N95)",
            "Gafas de seguridad"
        ],
        medidasIntervencion: {
            eliminacion: "Implementación de procesos cerrados para contener los contaminantes.",
            sustitucion: "Uso de productos con menor potencial de emisión de polvos o vapores (ej. pellets en vez de polvo).",
            controlesIngenieria: "Sistemas de extracción localizada y ventilación general forzada.",
            controlesAdministrativos: "Procedimientos de trabajo seguro y monitoreo ambiental de concentraciones."
        }
    },
    
    "Exposición a gases vapores humos polvos tóxicos": {
        consecuencias: "Intoxicaciones, daños en órganos (hígado, riñón, sistema nervioso), cáncer.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            ESP: 1,
            TGO: 1,
            TGP: 1,
            CRE: 1,
            BUN: 1,
            CH: 1,
            RXC: 2,
            COLI: 2, // Prioridad 1 solo si son inhibidores de colinesterasa
            PSP: 2
        },
        aptitudesRequeridas: [
            "Capacidad pulmonar y salud respiratoria óptima.",
            "Funciones renal y hepática en buen estado.",
            "Conocimiento estricto de las fichas de seguridad (MSDS)."
        ],
        condicionesIncompatibles: [
            "Enfermedades respiratorias o cardiovasculares crónicas.",
            "Insuficiencia renal o hepática preexistente.",
            "Embarazo."
        ],
        eppSugeridos: [
            "Equipo de respiración autónoma (SCBA) o máscaras con filtros de cartucho específicos",
            "Trajes químicos de protección total",
            "Guantes y botas de seguridad química"
        ],
        medidasIntervencion: {
            eliminacion: "Cambio de proceso productivo para evitar el uso de sustancias tóxicas.",
            sustitucion: "Uso de productos no tóxicos o menos peligrosos.",
            controlesIngenieria: "Sistemas cerrados de producción y extracción localizada de contaminantes.",
            controlesAdministrativos: "Protocolos estrictos de manipulación, permisos de trabajo y monitoreo biológico."
        }
    },

    "Exposición sustancias químicas líquidas tóxicas": {
        consecuencias: "Irritación cutánea, quemaduras químicas, intoxicación sistémica.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMOD: 1,
            TGO: 1,
            TGP: 1,
            CRE: 1,
            BUN: 1,
            CH: 2,
            OPTO: 2
        },
        aptitudesRequeridas: [
            "Integridad de la piel y mucosas.",
            "Funciones renal y hepática en buen estado.",
            "Capacidad para seguir procedimientos de manipulación de químicos."
        ],
        condicionesIncompatibles: [
            "Enfermedades de la piel como dermatitis atópica.",
            "Insuficiencia renal o hepática preexistente.",
            "Alergias cutáneas severas a la sustancia."
        ],
        eppSugeridos: [
            "Trajes químicos resistentes a salpicaduras",
            "Guantes de protección química de material adecuado (nitrilo, neopreno, etc.)",
            "Botas de seguridad química",
            "Protección ocular y facial"
        ],
        medidasIntervencion: {
            eliminacion: "Reemplazo de procesos por alternativas sin químicos tóxicos.",
            sustitucion: "Uso de productos no tóxicos o menos peligrosos.",
            controlesIngenieria: "Sistemas cerrados, duchas de emergencia y lavaojos.",
            controlesAdministrativos: "Procedimientos especiales, fichas de seguridad y capacitación en emergencias químicas."
        }
    },

    "Exposición sustancias químicas líquidas no tóxicas": {
        consecuencias: "Irritación, dermatitis por contacto, alergias leves.",
        peorConsecuencia: "Dermatitis de contacto severa.",
        examenesMedicos: {
            EMOD: 1,
            EMO: 2
        },
        aptitudesRequeridas: [
            "Integridad de la piel sin patologías crónicas.",
            "Ausencia de alergias de contacto conocidas a la sustancia."
        ],
        condicionesIncompatibles: [
            "Dermatitis preexistente o alergias cutáneas.",
            "Piel atópica o sensible."
        ],
        eppSugeridos: [
            "Guantes de nitrilo o látex",
            "Gafas de seguridad"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de la manipulación de líquidos.",
            sustitucion: "Uso de productos más seguros y con menor potencial alergénico.",
            controlesIngenieria: "Sistemas cerrados de dispensación, duchas de emergencia y lavaojos.",
            controlesAdministrativos: "Fichas de seguridad, capacitación en procedimientos y manejo de EPP."
        }
    },

    "Exposición a sustancias químicas que generan efectos en el organismo": {
        consecuencias: "Carcinogénesis, mutagénesis, teratogénesis, toxicidad sistémica.",
        peorConsecuencia: "Cáncer, Muerte.",
        examenesMedicos: {
            EMO: 1,
            ESP: 1,
            CH: 1,
            TGO: 1,
            TGP: 1,
            CRE: 1,
            BUN: 1,
            RXC: 2,
            COLI: 2 // Prioridad 1 solo si son inhibidores de colinesterasa
        },
        aptitudesRequeridas: [
            "Óptima salud respiratoria y de los órganos vitales.",
            "Conocimiento y cumplimiento estricto de los protocolos de seguridad."
        ],
        condicionesIncompatibles: [
            "Enfermedades crónicas de los sistemas hepático, renal o respiratorio.",
            "Antecedentes de cáncer o mutaciones genéticas.",
            "Embarazo o intención de embarazo."
        ],
        eppSugeridos: [
            "Trajes especiales químicos (Nivel de protección adecuado)",
            "Máscaras con filtros específicos para la sustancia",
            "Guantes de protección química"
        ],
        medidasIntervencion: {
            eliminacion: "Sustitución de procesos productivos para evitar el uso de sustancias carcinogénicas.",
            sustitucion: "Uso de sustancias menos tóxicas o con fichas de seguridad verificadas.",
            controlesIngenieria: "Sistemas cerrados y automatizados, extracción de vapores, y cabinas de seguridad.",
            controlesAdministrativos: "Protocolos estrictos de manipulación, monitoreo biológico y capacitación específica."
        }
    },

    "Presencia de animales/vectores transmisores de enfermedad": {
        consecuencias: "Enfermedades infecciosas (dengue, zika, leptospirosis, fiebre amarilla).",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            CH: 1,
            VFA: 1, // Vacuna Fiebre Amarilla
            TET: 1, // Vacuna Tétanos
            LEP: 2, // Según zona endémica
            BRU: 2  // Según exposición a ganado
        },
        aptitudesRequeridas: [
            "Ausencia de enfermedades inmunosupresoras.",
            "Esquema de vacunación completo para la zona.",
            "Conocimiento de las zonas de riesgo endémico."
        ],
        condicionesIncompatibles: [
            "Alergias severas a picaduras de insectos o animales.",
            "Enfermedades crónicas que afecten la respuesta inmunológica."
        ],
        eppSugeridos: [
            "Repelentes de insectos con Icaridina o DEET",
            "Ropa de manga larga y pantalones",
            "Botas altas o cerradas"
        ],
        medidasIntervencion: {
            eliminacion: "Control integral de plagas y vectores en las instalaciones.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Barreras físicas como mallas y cerramientos, limpieza de áreas verdes.",
            controlesAdministrativos: "Programas de fumigación, vacunación del personal y capacitación en primeros auxilios."
        }
    },

    "Exposición a material contaminado o con riesgo biológico": {
        consecuencias: "Enfermedades infecciosas (Hepatitis B, VIH, Tuberculosis, etc.).",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            CH: 1,
            VH: 1, // Vacuna Hepatitis B
            TET: 1, // Vacuna Tétanos
            ESP: 2 // Si hay riesgo de aerosoles (ej. TBC)
        },
        aptitudesRequeridas: [
            "Integridad de la piel sin heridas abiertas.",
            "Sistema inmunológico competente.",
            "Conocimiento y seguimiento de protocolos de bioseguridad."
        ],
        condicionesIncompatibles: [
            "Enfermedades inmunosupresoras (VIH, quimioterapia).",
            "Alergias a componentes del EPP (ej. látex).",
            "Dermatopatías activas."
        ],
        eppSugeridos: [
            "Guantes de nitrilo",
            "Mascarillas de alta filtración (N95)",
            "Bata anti-fluidos",
            "Protección ocular y facial"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de procesos con riesgo biológico.",
            sustitucion: "Uso de materiales estériles o desinfectados.",
            controlesIngenieria: "Cabinas de bioseguridad, sistemas de filtración de aire (HEPA) y autoclaves.",
            controlesAdministrativos: "Protocolos de bioseguridad estrictos, plan de vacunación y gestión de residuos biológicos."
        }
    },
    
    "Manipulación de alimentos": {
        consecuencias: "Enfermedades transmitidas por alimentos (ETA).",
        peorConsecuencia: "Intoxicación severa, brote epidemiológico.",
        examenesMedicos: {
            EMOMP: 1,
            COP: 1,
            FRO: 1,
            KOH: 1
        },
        aptitudesRequeridas: [
            "Buenas prácticas de higiene personal.",
            "Conocimiento de las Buenas Prácticas de Manufactura (BPM).",
            "Integridad de la piel sin heridas abiertas o infectadas en manos y brazos."
        ],
        condicionesIncompatibles: [
            "Enfermedades gastrointestinales infecciosas activas.",
            "Heridas abiertas o lesiones infectadas en manos.",
            "Ser portador asintomático de patógenos entéricos."
        ],
        eppSugeridos: [
            "Guantes de nitrilo o polietileno",
            "Tapabocas",
            "Cofia o gorro para el cabello",
            "Delantal impermeable"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización de procesos de manipulación de alimentos.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Equipos de refrigeración y conservación adecuados, áreas de lavado y desinfección.",
            controlesAdministrativos: "Capacitación en BPM y HACCP, monitoreo de la salud del personal y control de proveedores."
        }
    },

    "Manejo de cargas mayores a 25 Kg (Hombres)": {
        consecuencias: "Lesiones osteomusculares (hernias discales, lumbalgias).",
        peorConsecuencia: "Lesión incapacitante permanente.",
        examenesMedicos: {
            EMO: 1,
            RXC: 2
        },
        aptitudesRequeridas: [
            "Buena salud osteomuscular, especialmente de la columna vertebral.",
            "Fuerza y resistencia física para el levantamiento de cargas.",
            "Capacitación en técnicas de levantamiento seguro."
        ],
        condicionesIncompatibles: [
            "Hernia discal o patologías de columna preexistentes sintomáticas.",
            "Limitaciones de movilidad en extremidades.",
            "Debilidad muscular severa."
        ],
        eppSugeridos: [
            "Guantes con buen agarre",
            "Calzado de seguridad con puntera"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización completa del levantamiento de cargas.",
            sustitucion: "Uso de ayudas mecánicas (montacargas, polipastos, estibadores).",
            controlesIngenieria: "Diseño ergonómico de puestos de trabajo para reducir la manipulación manual.",
            controlesAdministrativos: "Capacitación en manejo manual de cargas, límites de peso y rotación de tareas."
        }
    },

    "Manejo de cargas mayores a 12.5 Kg (Mujeres)": {
        consecuencias: "Lesiones osteomusculares (hernias, lumbalgias).",
        peorConsecuencia: "Lesión incapacitante permanente.",
        examenesMedicos: {
            EMO: 1,
            RXC: 2
        },
        aptitudesRequeridas: [
            "Buena salud osteomuscular, especialmente de la columna vertebral.",
            "Fuerza y resistencia física para el levantamiento de cargas.",
            "Capacitación en técnicas de levantamiento seguro."
        ],
        condicionesIncompatibles: [
            "Hernia discal o patologías de columna preexistentes sintomáticas.",
            "Embarazo (con restricciones específicas).",
            "Debilidad muscular o limitaciones de movilidad."
        ],
        eppSugeridos: [
            "Guantes con buen agarre",
            "Calzado de seguridad con puntera"
        ],
        medidasIntervencion: {
            eliminacion: "Automatización completa del levantamiento de cargas.",
            sustitucion: "Uso de ayudas mecánicas y equipos de elevación.",
            controlesIngenieria: "Diseño ergonómico de puestos de trabajo para reducir la manipulación manual.",
            controlesAdministrativos: "Capacitación en manejo manual de cargas y límites de peso."
        }
    },

    "Adopción de posturas nocivas": {
        consecuencias: "Lesiones osteomusculares (lumbalgias, tendinitis, cervicalgias).",
        peorConsecuencia: "Lesión permanente, síndrome del túnel carpiano.",
        examenesMedicos: {
            EMO: 1,
            RXC: 2
        },
        aptitudesRequeridas: [
            "Integridad y flexibilidad osteomuscular.",
            "Capacidad para mantener posturas adecuadas por periodos prolongados."
        ],
        condicionesIncompatibles: [
            "Patologías de columna o articulares crónicas.",
            "Síndrome del túnel carpiano preexistente.",
            "Dolor crónico o fibromialgia."
        ],
        eppSugeridos: [
            "No aplica EPP. Requiere controles de ingeniería y administrativos."
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de los puestos de trabajo para evitar posturas estáticas.",
            sustitucion: "Mobiliario y equipos ergonómicos y ajustables a la medida del trabajador.",
            controlesIngenieria: "Implementación de sillas ergonómicas, mesas de altura regulable, soportes para monitores.",
            controlesAdministrativos: "Capacitación en higiene postural y pausas activas programadas."
        }
    },

    "Movimientos repetitivos (6 o más por minuto)": {
        consecuencias: "Lesiones osteomusculares (tendinitis, epicondilitis, síndrome de túnel carpiano).",
        peorConsecuencia: "Lesión permanente, incapacidad funcional.",
        examenesMedicos: {
            EMO: 1
        },
        aptitudesRequeridas: [
            "Buena salud osteomuscular en manos, muñecas y hombros.",
            "Habilidad para realizar movimientos coordinados de forma precisa."
        ],
        condicionesIncompatibles: [
            "Síndrome de túnel carpiano preexistente sintomático.",
            "Tendinitis, epicondilitis o patologías articulares crónicas en miembro superior.",
            "Limitaciones funcionales en manos o brazos."
        ],
        eppSugeridos: [
            "No aplica EPP. Requiere controles de ingeniería y administrativos."
        ],
        medidasIntervencion: {
            eliminacion: "Automatización total de las tareas repetitivas.",
            sustitucion: "Uso de herramientas ergonómicas o semiautomáticas que reduzcan la fuerza y repetición.",
            controlesIngenieria: "Diseño de puestos de trabajo que minimicen la repetición y la fuerza.",
            controlesAdministrativos: "Rotación de tareas y pausas activas para evitar la sobrecarga."
        }
    },

    "Diseño del puesto de trabajo inadecuado": {
        consecuencias: "Lesiones osteomusculares, fatiga visual, estrés.",
        peorConsecuencia: "Lesión permanente, incapacidad laboral.",
        examenesMedicos: {
            EMO: 1,
            OPTO: 2
        },
        aptitudesRequeridas: [
            "Salud osteomuscular y visual sin patologías crónicas.",
            "Capacidad de adaptación a los ajustes ergonómicos del puesto."
        ],
        condicionesIncompatibles: [
            "Patologías de columna o articulares que impidan la adaptación al puesto.",
            "Dificultades visuales no corregidas."
        ],
        eppSugeridos: [
            "No aplica EPP. Requiere controles de ingeniería y administrativos."
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño completo de los puestos de trabajo con principios ergonómicos.",
            sustitucion: "Reemplazo del mobiliario por modelos ajustables y adaptables.",
            controlesIngenieria: "Ajustes personalizados de altura de mesas, sillas y equipos.",
            controlesAdministrativos: "Evaluaciones ergonómicas periódicas y capacitación en ergonomía."
        }
    },
    
    "Posturas prolongadas y/o incorrectas": {
        consecuencias: "Lesiones osteomusculares, fatiga muscular, problemas circulatorios.",
        peorConsecuencia: "Lesión permanente, incapacidad laboral.",
        examenesMedicos: {
            EMO: 1,
            RXC: 2
        },
        aptitudesRequeridas: [
            "Integridad de la columna vertebral y sistema muscular.",
            "Conocimiento de la higiene postural."
        ],
        condicionesIncompatibles: [
            "Patologías de columna o articulares crónicas.",
            "Insuficiencia venosa periférica severa."
        ],
        eppSugeridos: [
            "No aplica EPP. Requiere controles de ingeniería y administrativos."
        ],
        medidasIntervencion: {
            eliminacion: "Diseño de puestos de trabajo que permitan alternar posturas (sentado/de pie).",
            sustitucion: "Mobiliario y equipo que faciliten el cambio de postura y el movimiento (sillas ergonómicas, reposapiés).",
            controlesIngenieria: "Plataformas elevadoras para reducir la flexión de tronco.",
            controlesAdministrativos: "Implementación de pausas activas, capacitación en higiene postural y rotación de tareas."
        }
    },

    "Competencias no definidas para el cargo": {
        consecuencias: "Incidentes de trabajo, errores, estrés, baja productividad.",
        peorConsecuencia: "Accidente grave, daño a la propiedad.",
        examenesMedicos: {
            PST: 1
        },
        aptitudesRequeridas: [
            "Habilidades blandas y técnicas acorde a las responsabilidades.",
            "Capacidad de aprendizaje continuo y adaptación.",
            "Proactividad y toma de decisiones."
        ],
        condicionesIncompatibles: [
            "No aplica."
        ],
        eppSugeridos: [
            "No aplica EPP. Requiere controles administrativos."
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "No aplica.",
            controlesAdministrativos: "Definición de perfiles de cargo, descripciones de funciones claras y programa de inducción y entrenamiento."
        }
    },

    "Actos inseguros observados": {
        consecuencias: "Incidentes y accidentes de trabajo, enfermedades laborales.",
        peorConsecuencia: "Accidente fatal.",
        examenesMedicos: {},
        aptitudesRequeridas: [
            "Conciencia de los riesgos y responsabilidad en el autocuidado.",
            "Disciplina para seguir procedimientos de trabajo seguro."
        ],
        condicionesIncompatibles: [
            "No aplica."
        ],
        eppSugeridos: [
            "EPP según la tarea específica"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Sistemas a prueba de error (poka-yoke) que prevengan actos inseguros.",
            controlesAdministrativos: "Programa de seguridad basada en el comportamiento, retroalimentación positiva y medidas disciplinarias."
        }
    },

    "Atención de público": {
        consecuencias: "Estrés, irritabilidad, ansiedad, violencia en el trabajo.",
        peorConsecuencia: "Síndrome de Burnout o trastornos de ansiedad.",
        examenesMedicos: {
            PST: 1,
            EMO: 2
        },
        aptitudesRequeridas: [
            "Inteligencia emocional y capacidad para manejar el estrés.",
            "Habilidad para la resolución de conflictos y comunicación asertiva."
        ],
        condicionesIncompatibles: [
            "Trastornos de ansiedad o depresión severa no tratada.",
            "Baja tolerancia a la frustración o dificultad para gestionar emociones."
        ],
        eppSugeridos: [
            "No aplica EPP. Requiere controles administrativos."
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Barreras físicas de seguridad en puntos de atención, sistemas de llamado o turno.",
            controlesAdministrativos: "Pausas programadas, capacitación en servicio al cliente y resolución de conflictos."
        }
    },

    "Monotonía/repetitividad de funciones": {
        consecuencias: "Estrés, desmotivación, fatiga mental, disminución de la alerta.",
        peorConsecuencia: "Síndrome de Burnout, depresión.",
        examenesMedicos: {
            PST: 1,
            EMO: 2
        },
        aptitudesRequeridas: [
            "Capacidad para mantener la atención y el enfoque.",
            "Resiliencia y automotivación."
        ],
        condicionesIncompatibles: [
            "Trastornos de ansiedad o depresión severa no tratada.",
            "Trastorno por Déficit de Atención (según valoración)."
        ],
        eppSugeridos: [
            "No aplica EPP. Requiere controles administrativos."
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "Automatización parcial de las tareas más monótonas.",
            controlesIngenieria: "No aplica.",
            controlesAdministrativos: "Rotación de tareas, enriquecimiento de funciones y programas de bienestar."
        }
    },

    "Trabajo bajo presión": {
        consecuencias: "Estrés, ansiedad, irritabilidad, fatiga mental.",
        peorConsecuencia: "Síndrome de Burnout, problemas cardiovasculares.",
        examenesMedicos: {
            PST: 1,
            EMO: 1
        },
        aptitudesRequeridas: [
            "Capacidad para manejar el estrés y la presión.",
            "Toma de decisiones eficaz bajo presión.",
            "Resiliencia y estabilidad emocional."
        ],
        condicionesIncompatibles: [
            "Trastornos de ansiedad o depresión no controlados.",
            "Hipertensión arterial no controlada.",
            "Enfermedad cardiovascular sintomática."
        ],
        eppSugeridos: [
            "No aplica EPP. Requiere controles administrativos."
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de procesos para reducir los picos de presión laboral.",
            sustitucion: "No aplica.",
            controlesIngenieria: "No aplica.",
            controlesAdministrativos: "Capacitación en gestión del tiempo y del estrés, apoyo psicológico y definición de objetivos claros y realistas."
        }
    },

    "Almacenamiento inadecuado": {
        consecuencias: "Golpes, contusiones, fracturas, caída de objetos.",
        peorConsecuencia: "Muerte por aplastamiento.",
        examenesMedicos: {
            EMO: 1,
            OPTO: 1
        },
        aptitudesRequeridas: [
            "Buena agudeza visual y percepción de profundidad.",
            "Conocimiento de protocolos de almacenamiento seguro.",
            "Integridad osteomuscular para manipulación de cargas."
        ],
        condicionesIncompatibles: [
            "Vértigo.",
            "Trastornos de equilibrio."
        ],
        eppSugeridos: [
            "Casco de seguridad",
            "Calzado con puntera de seguridad",
            "Guantes de protección"
        ],
        medidasIntervencion: {
            eliminacion: "Rediseño de los espacios de almacenamiento para optimizar la seguridad.",
            sustitucion: "Implementación de sistemas de almacenamiento automatizados.",
            controlesIngenieria: "Estanterías seguras y ancladas, pasillos demarcados y señalizados.",
            controlesAdministrativos: "Procedimientos de almacenamiento y apilamiento seguro, capacitación en manejo de inventarios."
        }
    },

    "Condiciones inadecuadas de orden y aseo": {
        consecuencias: "Caídas al mismo nivel, golpes, contusiones, incendios.",
        peorConsecuencia: "Lesión grave, incendio de grandes proporciones.",
        examenesMedicos: {
            EMO: 1,
            OPTO: 1
        },
        aptitudesRequeridas: [
            "Conciencia de los riesgos y disciplina para mantener el orden.",
            "Agudeza visual para identificar riesgos y obstáculos."
        ],
        condicionesIncompatibles: [
            "No aplica."
        ],
        eppSugeridos: [
            "Calzado antideslizante",
            "Guantes de protección"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Sistemas de almacenamiento definidos, puntos de recolección de residuos señalizados.",
            controlesAdministrativos: "Implementación del programa de las 5S, inspecciones periódicas y housekeeping."
        }
    },

    "Condiciones del piso": {
        consecuencias: "Caídas, resbalones, torceduras, fracturas.",
        peorConsecuencia: "Muerte por trauma craneoencefálico.",
        examenesMedicos: {
            EMO: 1,
            OPTO: 1
        },
        aptitudesRequeridas: [
            "Buena agudeza visual para identificar superficies resbaladizas o irregulares.",
            "Coordinación motriz y equilibrio adecuados."
        ],
        condicionesIncompatibles: [
            "Vértigo o trastornos del equilibrio.",
            "Trastornos de la marcha."
        ],
        eppSugeridos: [
            "Calzado antideslizante",
            "Señalización de áreas mojadas"
        ],
        medidasIntervencion: {
            eliminacion: "Reemplazo de pisos deteriorados o resbaladizos.",
            sustitucion: "Uso de materiales antideslizantes.",
            controlesIngenieria: "Tratamientos superficiales para aumentar la fricción y sistemas de drenaje adecuados.",
            controlesAdministrativos: "Inspecciones periódicas, protocolos de limpieza y secado de pisos."
        }
    },

    "Escaleras y barandas inadecuadas o mal estado": {
        consecuencias: "Caídas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            OPTO: 1
        },
        aptitudesRequeridas: [
            "Equilibrio y coordinación motriz.",
            "Agudeza visual para identificar escalones y barandas.",
            "Movilidad articular adecuada."
        ],
        condicionesIncompatibles: [
            "Vértigo o trastornos del equilibrio.",
            "Dificultades de movilidad o uso de ayudas externas (muletas/bastones).",
            "Hipovisión severa no corregida."
        ],
        eppSugeridos: [
            "Calzado antideslizante"
        ],
        medidasIntervencion: {
            eliminacion: "Reemplazo total de estructuras defectuosas.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Reforzamiento de barandas, instalación de pasamanos dobles y cintas antideslizantes en escalones.",
            controlesAdministrativos: "Inspecciones periódicas y plan de mantenimiento preventivo."
        }
    },

    "Condiciones de las instalaciones": {
        consecuencias: "Caídas, golpes, heridas, traumas.",
        peorConsecuencia: "Muerte por colapso estructural.",
        examenesMedicos: {
            EMO: 1,
            OPTO: 1
        },
        aptitudesRequeridas: [
            "Capacidad de percepción de riesgos en el entorno.",
            "Conocimiento de rutas de evacuación y plan de emergencias."
        ],
        condicionesIncompatibles: [
            "No aplica."
        ],
        eppSugeridos: [
            "Casco de seguridad (en áreas de construcción o riesgo de caída de objetos)",
            "Calzado de seguridad"
        ],
        medidasIntervencion: {
            eliminacion: "Renovación completa de instalaciones deficientes.",
            sustitucion: "Mejora de la infraestructura con materiales más seguros y resistentes.",
            controlesIngenieria: "Reforzamiento estructural de áreas críticas, señalización de emergencia.",
            controlesAdministrativos: "Inspecciones programadas de la infraestructura y mantenimiento preventivo."
        }
    },

    "Deslizamientos": {
        consecuencias: "Heridas, traumas, contusiones, fracturas, aplastamiento.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            PST: 2
        },
        aptitudesRequeridas: [
            "Conocimiento del entorno y los riesgos geológicos.",
            "Capacidad de reacción y movilidad rápida en una emergencia."
        ],
        condicionesIncompatibles: [
            "Limitaciones de movilidad severas."
        ],
        eppSugeridos: [
            "No aplica EPP para el evento, pero sí para la respuesta (casco, botas, etc.)."
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Construcción de muros de contención y sistemas de drenaje de laderas.",
            controlesAdministrativos: "Plan de emergencias para deslizamientos y evacuación, monitoreo de alertas geológicas."
        }
    },

    "Inundación": {
        consecuencias: "Ahogamiento, heridas, enfermedades transmitidas por el agua.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            PST: 2
        },
        aptitudesRequeridas: [
            "Capacidad para nadar (si aplica).",
            "Conocimiento de protocolos de emergencia y evacuación.",
            "Salud general para resistir exposición a aguas contaminadas."
        ],
        condicionesIncompatibles: [
            "Fobia al agua.",
            "Enfermedades de la piel o heridas abiertas."
        ],
        eppSugeridos: [
            "Botas impermeables",
            "Chalecos salvavidas"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Sistemas de drenaje pluvial, muros de contención y barreras contra inundaciones.",
            controlesAdministrativos: "Plan de emergencias y evacuación, monitoreo de alertas meteorológicas."
        }
    },

    "Sismo - Terremotos": {
        consecuencias: "Heridas, traumas, contusiones, fracturas por caída de estructuras.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            PST: 1
        },
        aptitudesRequeridas: [
            "Capacidad para reaccionar con calma en una emergencia.",
            "Conocimiento de rutas y puntos de encuentro.",
            "Movilidad física sin restricciones."
        ],
        condicionesIncompatibles: [
            "Claustrofobia severa.",
            "Trastornos de pánico o ansiedad severa no controlados."
        ],
        eppSugeridos: [
            "Kit de emergencias personal (pito, linterna, etc.)"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Refuerzo estructural de edificaciones sismo-resistente y anclaje de mobiliario.",
            controlesAdministrativos: "Plan de evacuación, simulacros periódicos y capacitación en respuesta a sismos."
        }
    },

    "Tormentas eléctricas": {
        consecuencias: "Quemaduras, shock eléctrico, paro cardíaco.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            ECG: 2
        },
        aptitudesRequeridas: [
            "Conocimiento de los protocolos de seguridad para tormentas.",
            "Capacidad para seguir instrucciones de emergencia."
        ],
        condicionesIncompatibles: [
            "No aplica."
        ],
        eppSugeridos: [
            "No aplica EPP para el trabajador. Requiere controles de ingeniería."
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Sistemas pararrayos y de puesta a tierra en las instalaciones.",
            controlesAdministrativos: "Protocolos de seguridad para tormentas eléctricas y suspensión de trabajos en exteriores."
        }
    },

    "Lluvias granizadas": {
        consecuencias: "Heridas, traumas, contusiones por impacto.",
        peorConsecuencia: "Trauma craneoencefálico severo.",
        examenesMedicos: {
            EMO: 1
        },
        aptitudesRequeridas: [
            "Capacidad para identificar riesgos y buscar refugio seguro.",
            "Conocimiento de los protocolos de emergencia."
        ],
        condicionesIncompatibles: [
            "No aplica."
        ],
        eppSugeridos: [
            "Casco de seguridad (si la tarea en exterior no puede suspenderse)"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Techos reforzados y sistemas de protección para vehículos y áreas expuestas.",
            controlesAdministrativos: "Procedimientos de refugio seguro, suspensión de actividades en exterior, monitoreo de alertas meteorológicas."
        }
    },

    "Secuestros": {
        consecuencias: "Pérdida de libertad, traumas psicológicos, lesiones físicas.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            PST: 1,
            EMO: 2
        },
        aptitudesRequeridas: [
            "Capacidad de mantener la calma y seguir protocolos de seguridad.",
            "Inteligencia emocional y resiliencia psicológica."
        ],
        condicionesIncompatibles: [
            "Trastornos de pánico o ansiedad severa.",
            "Dificultad para seguir instrucciones bajo presión."
        ],
        eppSugeridos: [
            "Sistemas de comunicación seguros",
            "Dispositivos de localización personal (GPS)"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Sistemas de rastreo vehicular y personal, botones de pánico.",
            controlesAdministrativos: "Protocolos de seguridad personal y anti-secuestro, capacitación en autoprotección."
        }
    },

    "Amenazas": {
        consecuencias: "Cuadros depresivos, ansiedad, estrés postraumático.",
        peorConsecuencia: "Agresión física o afectación psicológica severa.",
        examenesMedicos: {
            PST: 1
        },
        aptitudesRequeridas: [
            "Resiliencia y capacidad de afrontamiento.",
            "Capacidad para seguir protocolos de protección y denuncias."
        ],
        condicionesIncompatibles: [
            "Trastornos de ansiedad o depresión severa.",
            "Historial de trauma o victimización que genere vulnerabilidad."
        ],
        eppSugeridos: [
            "Sistemas de comunicación de emergencia",
            "Alarmas personales"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Sistemas de seguridad y control de acceso (CCTV, guardas).",
            controlesAdministrativos: "Protocolos de manejo de amenazas, apoyo psicológico y canales de denuncia confidenciales."
        }
    },

    "Hurtos - Robos - Atracos": {
        consecuencias: "Pérdida económica, depresión, trauma psicológico, lesiones físicas.",
        peorConsecuencia: "Muerte, lesión física grave.",
        examenesMedicos: {
            PST: 1,
            EMO: 2
        },
        aptitudesRequeridas: [
            "Capacidad para manejar situaciones de alta tensión.",
            "Resiliencia emocional y psicológica."
        ],
        condicionesIncompatibles: [
            "Trastornos de ansiedad o pánico.",
            "Dificultad para mantener la calma bajo amenaza."
        ],
        eppSugeridos: [
            "No aplica EPP. Requiere controles de ingeniería y administrativos."
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Sistemas de control de acceso, cámaras de vigilancia y cajas de seguridad.",
            controlesAdministrativos: "Protocolos de seguridad para manejo de dinero/valores, capacitación en respuesta a atracos."
        }
    },

    "Accidente de Tránsito": {
        consecuencias: "Heridas, traumas, contusiones, fracturas.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            PSM: 1,
            EMO: 1,
            OPTO: 1,
            AUD: 1
        },
        aptitudesRequeridas: [
            "Buena agudeza visual y auditiva.",
            "Coordinación motriz y reflejos adecuados.",
            "Estado psicológico que permita una conducción segura."
        ],
        condicionesIncompatibles: [
            "Epilepsia no controlada.",
            "Trastornos de atención o somnolencia crónica.",
            "Hipovisión severa o campo visual muy reducido, no corregidos."
        ],
        eppSugeridos: [
            "Cinturón de seguridad",
            "Kit de carretera, extintor",
            "Casco (para motociclistas)"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Mantenimiento preventivo de vehículos, sistemas de seguridad activa y pasiva (ABS, airbags).",
            controlesAdministrativos: "Implementación del Plan Estratégico de Seguridad Vial (PESV), capacitación y exámenes de aptitud."
        }
    },
    
    "Desorden público - Atentados": {
        consecuencias: "Heridas, traumas, contusiones, fracturas, traumas psicológicos.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            PST: 1,
            EMO: 2
        },
        aptitudesRequeridas: [
            "Capacidad para mantener la calma en situaciones de emergencia.",
            "Conocimiento de las rutas de evacuación y puntos de encuentro.",
            "Resiliencia psicológica."
        ],
        condicionesIncompatibles: [
            "Trastornos de ansiedad o pánico severos.",
            "Problemas de movilidad que dificulten la evacuación."
        ],
        eppSugeridos: [
            "Equipos de comunicación de emergencia",
            "Mochila de emergencia"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Refugios seguros y puntos de encuentro, refuerzo de vidrios y puertas.",
            controlesAdministrativos: "Plan de contingencia, simulacros y capacitación en respuesta a desórdenes públicos."
        }
    },
    
    "Extorsión": {
        consecuencias: "Pérdida económica, alteración nerviosa, estrés postraumático.",
        peorConsecuencia: "Trauma psicológico severo, daño físico.",
        examenesMedicos: {
            PST: 1
        },
        aptitudesRequeridas: [
            "Capacidad para mantener la calma y seguir protocolos de seguridad.",
            "Discreción y confidencialidad en el manejo de información."
        ],
        condicionesIncompatibles: [
            "Trastornos de ansiedad o depresión.",
            "Dificultad para manejar situaciones de amenaza."
        ],
        eppSugeridos: [
            "Sistemas de comunicación segura",
            "Mecanismos de alerta silenciosa"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Sistemas de seguridad y monitoreo.",
            controlesAdministrativos: "Protocolos anti-extorsión, capacitación en manejo de amenazas y apoyo psicológico."
        }
    },

    "Trabajos en caliente": {
        consecuencias: "Quemaduras, heridas por proyección de partículas, inhalación de humos metálicos.",
        peorConsecuencia: "Muerte, daño pulmonar permanente.",
        examenesMedicos: {
            EMO: 1,
            ESP: 1,
            OPTO: 1,
            RXC: 2
        },
        aptitudesRequeridas: [
            "Buena salud cardiovascular y respiratoria.",
            "Agudeza visual para soldadura y corte.",
            "Capacidad para trabajar en ambientes de calor y humos."
        ],
        condicionesIncompatibles: [
            "Enfermedades respiratorias crónicas (asma, EPOC).",
            "Enfermedades cardiovasculares inestables.",
            "Epilepsia no controlada."
        ],
        eppSugeridos: [
            "Careta de soldador fotosensible",
            "Guantes para soldador (carnaza)",
            "Ropa ignífuga (algodón 100% o jean)",
            "Delantal y mangas de cuero"
        ],
        medidasIntervencion: {
            eliminacion: "Uso de procesos en frío como uniones mecánicas (atornillado, remachado).",
            sustitucion: "Uso de métodos de soldadura que generen menos humos.",
            controlesIngenieria: "Ventilación forzada y extracción localizada de humos.",
            controlesAdministrativos: "Permisos de trabajo en caliente, capacitación y monitoreo de atmósferas."
        }
    },

    "Explosión": {
        consecuencias: "Politraumatismo, quemaduras, lesiones por onda expansiva.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            ESP: 1,
            AUD: 1,
            OPTO: 1
        },
        aptitudesRequeridas: [
            "Conocimiento estricto de las propiedades de los materiales.",
            "Capacidad para seguir protocolos de emergencia y evacuación.",
            "Salud respiratoria y auditiva adecuada."
        ],
        condicionesIncompatibles: [
            "Enfermedades respiratorias crónicas.",
            "Patologías auditivas severas.",
            "Trastornos de pánico."
        ],
        eppSugeridos: [
            "EPP específico según el riesgo (trajes antiestáticos, protección facial, protección auditiva)."
        ],
        medidasIntervencion: {
            eliminacion: "Sustitución de materiales explosivos por alternativas menos peligrosas.",
            sustitucion: "Uso de materiales menos volátiles o inflamables.",
            controlesIngenieria: "Sistemas anti-explosión, ventilación y confinamiento de procesos.",
            controlesAdministrativos: "Procedimientos para atmósferas explosivas (ATEX), permisos de trabajo y capacitación."
        }
    },
    
    "Incendio": {
        consecuencias: "Quemaduras, inhalación de humos, asfixia.",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            ESP: 1,
            ECG: 2
        },
        aptitudesRequeridas: [
            "Salud respiratoria y cardiovascular óptima.",
            "Capacidad para reaccionar con calma y seguir protocolos.",
            "Conocimiento de las rutas de evacuación."
        ],
        condicionesIncompatibles: [
            "Enfermedades respiratorias crónicas (asma, EPOC).",
            "Trastornos de pánico o claustrofobia.",
            "Problemas de movilidad que dificulten la evacuación."
        ],
        eppSugeridos: [
            "Trajes para brigadistas contra incendios",
            "Equipos de respiración autónoma (SCBA)"
        ],
        medidasIntervencion: {
            eliminacion: "Uso de materiales no combustibles en la construcción y dotación.",
            sustitucion: "Uso de materiales con retardo de llama.",
            controlesIngenieria: "Sistemas de detección y extinción automática de incendios (rociadores).",
            controlesAdministrativos: "Plan de emergencias, simulacros y conformación de brigadas de emergencia."
        }
    },
    
    "Sin disponibilidad de agua potable": {
        consecuencias: "Deshidratación, enfermedades gastrointestinales.",
        peorConsecuencia: "Deshidratación severa, brote de enfermedades hídricas.",
        examenesMedicos: {
            EMO: 1,
            COP: 2,
            CRE: 2
        },
        aptitudesRequeridas: [
            "Buena salud gastrointestinal y renal.",
            "Conocimiento de la importancia de la hidratación."
        ],
        condicionesIncompatibles: [
            "Enfermedades gastrointestinales crónicas.",
            "Insuficiencia renal."
        ],
        eppSugeridos: [
            "Filtros de agua portátiles",
            "Contenedores seguros para almacenamiento"
        ],
        medidasIntervencion: {
            eliminacion: "Conexión a un acueducto certificado para garantizar el suministro.",
            sustitucion: "Suministro de agua embotellada certificada.",
            controlesIngenieria: "Sistemas de purificación y potabilización de agua in situ.",
            controlesAdministrativos: "Control de calidad periódico del agua, protocolos de hidratación."
        }
    },

    "Enfermedades endémicas": {
        consecuencias: "Enfermedades infecciosas propias de la región (malaria, leishmaniasis, etc.).",
        peorConsecuencia: "Muerte.",
        examenesMedicos: {
            EMO: 1,
            CH: 1
        },
        aptitudesRequeridas: [
            "Sistema inmunológico competente y esquema de vacunación al día.",
            "Conocimiento de las medidas de prevención para la zona geográfica."
        ],
        condicionesIncompatibles: [
            "Enfermedades que comprometan el sistema inmunológico.",
            "Embarazo (con restricciones específicas)."
        ],
        eppSugeridos: [
            "Repelente de insectos",
            "Ropa de manga larga"
        ],
        medidasIntervencion: {
            eliminacion: "No aplica.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Control de vectores en el lugar de trabajo.",
            controlesAdministrativos: "Protocolos sanitarios, campañas de vacunación y educación en salud pública."
        }
    },

    "Mordedura y Picadura de Animales": {
        consecuencias: "Reacciones alérgicas, infecciones, envenenamiento.",
        peorConsecuencia: "Muerte por shock anafiláctico o veneno.",
        examenesMedicos: {
            EMO: 1,
            TET: 1
        },
        aptitudesRequeridas: [
            "Ausencia de alergias graves conocidas a venenos o picaduras.",
            "Conocimiento de la fauna local y protocolos de primeros auxilios."
        ],
        condicionesIncompatibles: [
            "Alergias graves conocidas (ej. a picaduras de abejas).",
            "Condiciones que comprometan la respuesta inmunológica."
        ],
        eppSugeridos: [
            "Ropa protectora de manga larga",
            "Repelentes de insectos",
            "Botas de caña alta"
        ],
        medidasIntervencion: {
            eliminacion: "Control de plagas y fauna peligrosa en áreas de trabajo.",
            sustitucion: "No aplica.",
            controlesIngenieria: "Barreras físicas en áreas de riesgo, cerramientos y limpieza de maleza.",
            controlesAdministrativos: "Protocolos de primeros auxilios, capacitación sobre fauna peligrosa y plan de emergencias."
        }
    }
};