// components/footerInit.js

/**
 * Inicializa el footer del sitio.
 * Genera dinámicamente todas las secciones del footer: certificaciones,
 * servicios, información de empresa y contacto.
 */
export function initFooter() {
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    // Detectar si estamos en index o en una subpágina
    const isIndex = isGitHubPages ?
        (window.location.pathname.endsWith('/dev_genesys_laboral_medicine/') ||
         window.location.pathname.endsWith('/dev_genesys_laboral_medicine/index.html')) :
        (window.location.pathname.endsWith('/dist/') || 
         window.location.pathname.endsWith('/dist/index.html'));
    
    // Configurar rutas base según la ubicación
    const basePath = isGitHubPages ? '/dev_genesys_laboral_medicine' : (isIndex ? '.' : '..');
    const pagesPath = isIndex ? 'pages' : '.';

    // Configuración centralizada del footer
    const footerConfig = {
        certifications: [
            {
                src: "assets/images/Distintivos/Distintivo-FONOAUDIOLOGÍA.svg",
                alt: "DISTINTIVO FONAUDIOLOGIA"
            },
            {
                src: "assets/images/Distintivos/Distintivo-MEDICINA DEL TRABAJO.svg",
                alt: "DISTINTIVO MEDICINA DEL TRABAJO"
            },
            {
                src: "assets/images/Distintivos/Distintivo-OPTOMETRIA.svg",
                alt: "DISTINTIVO OPTOMETRIA"
            },
            {
                src: "assets/images/Distintivos/Distintivo-PSICOLOGIA.svg",
                alt: "DISTINTIVO PSICOLIGIA"
            },
            {
                src: "assets/images/Distintivos/Distintivo-TERAPIA RESPIRATORIA.svg",
                alt: "DISTINTIVO TERARPIARESP"
            },
            {
                src: "assets/images/Distintivos/Distintivo-TOMA DE MUESTRAS DE LABORATORIO CLÍNICO.svg",
                alt: "DISTINTIVO TOMA MUESTRAS"
            },
            {
                src: "assets/images/Distintivos/Distintivo-SEGURIDAD Y SALUD EN EL TRABAJO.svg",
                alt: "DISTINTIVOS_DHSS seguridad y salud en el trabajo"
            }
        ],
        services: [
            { text: "Matriz de riesgos y peligros", href: "pages/Matriz_de_riesgos_profesional.html" },
            { text: "Matriz profesiograma", href: "pages/Profesiograma.html" },
            { text: "Exámenes médico ocupacionales", href: "pages/Examenes_medicos_ocupacionales.html" },
            { text: "Batería de riesgo psicosocial", href: "pages/Bateria_de_riesgo_psicosocial.html" },
            { text: "Análisis de puesto de trabajo", href: "pages/Analisis_de_puesto_de_trabajo.html" },
            { text: "Sistema de gestión (SG-SST)", href: "pages/SST.html" },
            { text: "Examen escolar", href: "pages/examen_medico_escolar.html" }
        ],
        companyInfo: [
            { text: "Nosotros", href: "pages/Nosotros.html" },
        /*     { text: "Novedades", href: "pages/Blog.html" },
            { text: "Blog", href: "pages/Blog.html" }, */
            { text: "Trabaja con nosotros", href: "pages/Contacto.html" },
            { text: "informacion financiera", href: "assets/pdf/estados_financieros_2023_2024.pdf", target: "_blank"},
            { text: "Legales", href: "pages/Informacion_legal.html" }
        ],
        contact: {
            address: "Calle 86a # 23-12, Bogotá, Colombia",
            email: "atencionusuario@genesyslm.com.co",
            phone: "+57 304 2014236",
            schedule: {
                weekday: "Lunes a Viernes: 6 am a 3 pm",
                weekend: "Sábados: 6 am a 12m"
            },
            commercial: {
                weekday: "Lunes a Viernes: 6 am a 3 pm",
                weekend: "Sábados: 6 am a 12 pm"
            },
            whatsapp: "+57 3205803048"
        },
        footerLogos: {
            genesys: {
                src: "assets/images/logo_claro_vectores.svg",
                alt: "Genesys Logo"
            },
            sns: {
                src: "assets/images/logo_sns.svg",
                alt: "Super intendencia de salud"
            }
        }
    };

    /**
     * Ajusta las rutas según si estamos en index o en una página interna
     * @param {string} path - La ruta a ajustar
     * @returns {string} - La ruta ajustada
     */
    function adjustPath(path) {
        if (!isIndex) {
            return '../' + path;
        }
        return path;
    }

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
                            src="${adjustPath(cert.src)}" 
                            alt="${cert.alt}" 
                            class="certification-img"
                            loading="lazy"
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
                        <li><a href="${adjustPath(service.href)}">${service.text}</a></li>
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
                        <li><a href="${adjustPath(info.href)}" ${info.target ? `target="${info.target}"` : ''}>${info.text}</a></li>
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
     * Añade los event listeners necesarios para el footer
     */
    function initFooterBehaviors() {
        // Lazy loading para las imágenes de certificación
        const certImages = document.querySelectorAll('.certification-img');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('fade-in');
                        observer.unobserve(img);
                    }
                });
            });

            certImages.forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Smooth scroll para enlaces internos
        document.querySelectorAll('.footer-section a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
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
                        src="${adjustPath(footerConfig.footerLogos.genesys.src)}" 
                        alt="${footerConfig.footerLogos.genesys.alt}" 
                        class="footer-logo"
                    />
                    <img 
                        src="${adjustPath(footerConfig.footerLogos.sns.src)}" 
                        alt="${footerConfig.footerLogos.sns.alt}" 
                        class="footer-logo"
                    />
                </div>
                <div class="disclaimer">
                    <p>&copy; ${new Date().getFullYear()} - Genesys Laboral Medicine sas - Todos los derechos reservados.</p>
                    <a href="${adjustPath('pages/Informacion_legal.html')}#politicas">Políticas de tratamiento de datos y privacidad</a>
                </div>
            </div>
        `;

        document.body.appendChild(footer);
    }

    // Inicialización del footer
    generateFooterHTML();
    initFooterBehaviors();
}