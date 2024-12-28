// components/footerInit.js

/**
 * Inicializa el footer del sitio.
 * Genera dinámicamente todas las secciones del footer: certificaciones,
 * servicios, información de empresa y contacto.
 */
export function initFooterPages() {
    // Configuración centralizada del footer
    const existingFooter = document.querySelector('.site-footer');
    if (existingFooter) {
        console.log('Ya existe un footer en el DOM');
        console.trace(); // Esto nos mostrará la pila de llamadas
        return; // No crear otro footer si ya existe uno
    }

    console.log('Iniciando generación del footer');
    const footerConfig = {
        certifications: [
            {
                src: "../assets/images/Distintivos/Distintivo-FONOAUDIOLOGÍA.svg",
                alt: "DISTINTIVO FONAUDIOLOGIA"
            },
            {
                src: "../assets/images/Distintivos/Distintivo-MEDICINA DEL TRABAJO.svg",
                alt: "DISTINTIVO MEDICINA DEL TRABAJO"
            },
            {
                src: "../assets/images/Distintivos/Distintivo-OPTOMETRIA.svg",
                alt: "DISTINTIVO OPTOMETRIA"
            },
            {
                src: "../assets/images/Distintivos/Distintivo-PSICOLOGIA.svg",
                alt: "DISTINTIVO PSICOLIGIA"
            },
            {
                src: "../assets/images/Distintivos/Distintivo-TERAPIA RESPIRATORIA.svg",
                alt: "DISTINTIVO TERARPIARESP"
            },
            {
                src: "../assets/images/Distintivos/Distintivo-TOMA DE MUESTRAS DE LABORATORIO CLÍNICO.svg",
                alt: "DISTINTIVO TOMA MUESTRAS"
            },
            {
                src: "../assets/images/Distintivos/Distintivo-SEGURIDAD Y SALUD EN EL TRABAJO.svg",
                alt: "DISTINTIVOS_DHSS seguridad y salud en el trabajo"
            }
        ],
        services: [
            { text: "Matriz de riesgos y peligros", href: "#matriz-riesgos" },
            { text: "Matriz profesiograma", href: "#profesiograma" },
            { text: "Exámenes médico ocupacionales", href: "#examenes-ocupacionales" },
            { text: "Batería de riesgo psicosocial", href: "#bateria-psicosocial" },
            { text: "Análisis de puesto de trabajo", href: "#analisis-puesto" },
            { text: "Sistema de gestión (SG-SST)", href: "#sistema-gestion" },
            { text: "Exámenes paraclínicos", href: "#examenes-paraclinicos" },
            { text: "Exámenes de laboratorio", href: "#examenes-laboratorio" },
            { text: "Examen escolar", href: "#examen-escolar" }
        ],
        companyInfo: [
            { text: "Nosotros", href: "#nosotros" },
            { text: "Novedades", href: "#novedades" },
            { text: "Blog", href: "#blog" },
            { text: "Trabaja con nosotros", href: "#trabaja-con-nosotros" },
            { text: "Legales", href: "#legales" }
        ],
        contact: {
            address: "Calle 86a # 23-12, Bogotá, Colombia",
            email: "atencionusuario@genesyslm.com.co",
            phone: "+57 304 2014236",
            schedule: {
                weekday: "Lunes a Viernes: 6 am a 3 pm",
                weekend: "Sábados, Domingos y Festivos: 6 am a 12m"
            },
            commercial: {
                weekday: "Lunes a Viernes: 7 am a 4 pm",
                weekend: "Sábados, Domingos y Festivos: 9 am a 3 pm"
            },
            whatsapp: "+57 3205803048"
        },
        footerLogos: {
            genesys: {
                src: "../assets/images/logo_claro_vectores.svg",
                alt: "Genesys Logo"
            },
            sns: {
                src: "../assets/images/logo_sns.svg",
                alt: "Super intendencia de salud"
            }
        }
    };

    /**
     * Genera la sección de certificaciones
     */
    function generateCertificationsSection() {
        return `
            <div class="footer-section certifications">
                <h3>Certificaciones</h3>
                <div class="certification-grid">
                    ${footerConfig.certifications.map(cert => `
                        <img 
                            src="${cert.src}" 
                            alt="${cert.alt}" 
                            class="certification-img"
                        />
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Genera la sección de servicios
     */
    function generateServicesSection() {
        return `
            <div class="footer-section services">
                <h3>Servicios</h3>
                <ul>
                    ${footerConfig.services.map(service => `
                        <li><a href="${service.href}">${service.text}</a></li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Genera la sección de información de la empresa
     */
    function generateCompanyInfoSection() {
        return `
            <div class="footer-section company-info">
                <h3>Información de la Empresa</h3>
                <ul>
                    ${footerConfig.companyInfo.map(info => `
                        <li><a href="${info.href}">${info.text}</a></li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Genera la sección de información de contacto
     */
    function generateContactSection() {
        const contact = footerConfig.contact;
        return `
            <div class="footer-section-contact-info">
                <h3>Contáctanos</h3>
                <a><strong>Dirección:</strong> ${contact.address}</a>
                <a><strong>Email:</strong> ${contact.email}</a>
                <a><strong>Teléfono:</strong> ${contact.phone}</a>
                <h4>Horario de atención:</h4>
                <a>${contact.schedule.weekday}</a>
                <a>${contact.schedule.weekend}</a>
                <h4>Asesores Comerciales:</h4>
                <a>${contact.commercial.weekday}</a>
                <a>${contact.commercial.weekend}</a>
                <a><strong>WhatsApp:</strong> ${contact.whatsapp}</a>
            </div>
        `;
    }

    /**
     * Genera el HTML completo del footer
     */
    function generateFooterHTML() {
        const footer = document.createElement('footer');
        footer.classList.add('site-footer');
        
        footer.innerHTML = `
            <div class="footer-content">
                ${generateCertificationsSection()}
                ${generateServicesSection()}
                ${generateCompanyInfoSection()}
                ${generateContactSection()}
            </div>
            <div class="footer-bottom">
                <div class="footer-logos">
                    <img 
                        src="${footerConfig.footerLogos.genesys.src}" 
                        alt="${footerConfig.footerLogos.genesys.alt}" 
                        class="footer-logo"
                    />
                    <img 
                        src="${footerConfig.footerLogos.sns.src}" 
                        alt="${footerConfig.footerLogos.sns.alt}" 
                        class="footer-logo"
                    />
                </div>
                <div class="disclaimer">
                    <p>&copy; ${new Date().getFullYear()} - Genesys Laboral Medicine sas - Todos los derechos reservados.</p>
                    <a href="#politicas">Políticas de tratamiento de datos y privacidad</a>
                </div>
            </div>
        `;

        document.body.appendChild(footer);
    }

    // Inicialización del footer
    generateFooterHTML();
}