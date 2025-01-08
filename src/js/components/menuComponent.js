// components/menuComponent.js

/**
 * Inicializa el menú principal del sitio.
 * Genera dinámicamente el header, menú de navegación y menús desplegables.
 */
export function initMenu() {
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
    
    
    
    // Configuración centralizada del menú
    const menuConfig = {
        
        logo: {
            src: `${basePath}/assets/images/logo_color_vectores.svg`,
            alt: "Genesys Logo",
            homeLink: isIndex ? '.' : '../index.html'
        },
        mainNav: [
            { text: "Nosotros", href: `${pagesPath}/Nosotros.html` },
            { text: "FAQ", href: "#" },
            { text: "SST", href: `${pagesPath}/SST.html` },
            { text: "Genesys BI", href: `${pagesPath}/Genesys_BI.html` }
        ],
        services: [
            {
                text: "Matriz de riesgo profesional",
                href: `${pagesPath}/Matriz_de_riesgos_profesional.html`,
                icon: generateServiceIcon()
            },
            {
                text: "Profesiograma",
                href: `${pagesPath}/Profesiograma.html`,
                icon: generateServiceIcon()
            },
            {
                text: "Exámenes Médico Ocupacionales",
                href: `${pagesPath}/Examenes_medicos_ocupacionales.html`,
                icon: generateServiceIcon()
            },
            {
                text: "Batería de riesgo Psicosocial",
                href: `${pagesPath}/Bateria_de_riesgo_psicosocial.html`,
                icon: generateServiceIcon()
            },
            {
                text: "Análisis de puesto de trabajo",
                href: `${pagesPath}/Analisis_de_puesto_de_trabajo.html`,
                icon: generateServiceIcon()
            },
            {
                text: "SST",
                href: `${pagesPath}/SST.html`,
                icon: generateServiceIcon()
            },
            {
                text: "Examen Médico Escolar",
                href: `${pagesPath}/examen_medico_escolar.html`,
                icon: generateServiceIcon()
            },
            {
                text: "Pérdida de capacidad Laboral",
                href: `${pagesPath}/Perdida_de_capacidad_laboral.html`,
                icon: generateServiceIcon()
            }
        ],
        ctaButtons: [
            { text: "Log In", className: "cta-button-1" },
            { text: "Sign Up", className: "cta-button" }
        ]
    };

    /**
     * Genera el icono SVG usado en el menú de servicios
     */
    function generateServiceIcon() {
        return `<svg width="36" height="41" viewBox="0 0 36 41" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.9929 11.1715V0L36.0001 10.25L26.1845 15.8358L17.9929 11.1715Z" fill="#EBBEC9"/>
            <path d="M26.1843 15.8358V25.1642L35.9999 30.75V10.25L26.1843 15.8358Z" fill="#B0D7DC"/>
            <path d="M17.9929 29.8286V41.0001L36.0001 30.7501L26.1845 25.1643L17.9929 29.8286Z" fill="#92CED2"/>
            <path d="M17.9928 29.8286V41.0001L0 30.7501L9.8012 25.1643L17.9928 29.8286Z" fill="#F1A298"/>
            <path d="M9.8012 25.1642V15.8358L0 10.25V30.75L9.8012 25.1642Z" fill="#F1A59C"/>
            <path d="M17.9928 0V11.1715L9.8012 15.8358L0 10.25L17.9928 0Z" fill="#EDC9C4"/>
        </svg>`;
    }

    /**
     * Genera el HTML para el menú completo
     */
    function generateMenuHTML() {
        const header = document.createElement('header');
        
        header.innerHTML = `
            <a href="${menuConfig.logo.homeLink}">
                <img src="${menuConfig.logo.src}" alt="${menuConfig.logo.alt}" class="logo"/>
            </a>
            
            <nav class="screen-menu">
                ${menuConfig.mainNav.map(item => 
                    `<a href="${item.href}">${item.text}</a>`
                ).join('')}
                <div class="dropdown">
                    <button class="dropdown-toggle" aria-expanded="false" aria-controls="services-menu">
                        Servicios
                    </button>
                </div>
                ${menuConfig.ctaButtons.map(btn => 
                    `<button class="${btn.className}">${btn.text}</button>`
                ).join('')}
            </nav>

            <div class="ham-menu">
                <span></span>
                <span></span>
                <span></span>
            </div>

            <nav class="off-screen-menu">
                ${menuConfig.mainNav.map(item => 
                    `<a href="${item.href}">${item.text}</a>`
                ).join('')}
                <a href="${menuConfig.logo.homeLink}">Servicios</a>
                ${menuConfig.ctaButtons.map(btn => 
                    `<button class="${btn.className}">${btn.text}</button>`
                ).join('')}
            </nav>
        `;

        const servicesMenu = document.createElement('div');
        servicesMenu.id = 'services-menu';
        servicesMenu.className = 'dropdown-menu';
        servicesMenu.setAttribute('aria-hidden', 'true');
        
        servicesMenu.innerHTML = `
            <div class="dropdown-menu-content">
                <ul>
                    ${menuConfig.services.map(service => `
                        <li data-icon="viñeta">
                            ${service.icon}
                            <a href="${service.href}">${service.text}</a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        // Insertamos los elementos en el DOM
        document.body.prepend(header);
        document.body.insertBefore(servicesMenu, header.nextSibling);
    }

    /**
     * Inicializa todos los comportamientos interactivos del menú
     */
    function initMenuBehaviors() {
        // Comportamiento del menú hamburguesa
        const hamburger = document.querySelector('.ham-menu');
        const offScreenMenu = document.querySelector('.off-screen-menu');
        
        if (hamburger && offScreenMenu) {
            hamburger.addEventListener('click', function() {
                this.classList.toggle('active');
                offScreenMenu.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', function(e) {
                if (offScreenMenu.classList.contains('active') && 
                    !offScreenMenu.contains(e.target) && 
                    !hamburger.contains(e.target)) {
                    hamburger.click();
                }
            });
        }

        // Comportamiento del dropdown de servicios
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        const servicesMenu = document.getElementById('services-menu');
        
        if (dropdownToggle && servicesMenu) {
            dropdownToggle.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true' || false;
                this.setAttribute('aria-expanded', !expanded);
                servicesMenu.setAttribute('aria-hidden', expanded);
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', function(e) {
                if (!dropdownToggle.contains(e.target) && !servicesMenu.contains(e.target)) {
                    dropdownToggle.setAttribute('aria-expanded', 'false');
                    servicesMenu.setAttribute('aria-hidden', 'true');
                }
            });
        }
    }

    // Inicialización del menú
    generateMenuHTML();
    initMenuBehaviors();
}