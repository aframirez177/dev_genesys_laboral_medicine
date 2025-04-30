// components/menuComponent.js

/**
 * Inicializa SOLO los comportamientos interactivos del menú principal.
 * Asume que la estructura HTML y el contenido ya existen en el DOM.
 */
export function initMenu() {

    /**
     * Inicializa todos los listeners de eventos para el menú.
     */
    function initMenuBehaviors() {
        console.log("Inicializando listeners del menú...");

        // Comportamiento del menú hamburguesa
        const hamburger = document.querySelector('.ham-menu');
        const offScreenMenu = document.querySelector('.off-screen-menu'); // Selecciona por clase general

        if (hamburger && offScreenMenu) {
            hamburger.addEventListener('click', function() {
                const isActive = this.classList.toggle('active');
                offScreenMenu.classList.toggle('active'); // Toggle para la animación/visibilidad CSS
                document.body.classList.toggle('menu-open'); // Para evitar scroll del body
                this.setAttribute('aria-expanded', isActive);
                // Asume que el offScreenMenu tiene el ID correcto para aria-controls
                const offScreenNav = document.getElementById('off-screen-menu-nav');
                if(offScreenNav) offScreenNav.setAttribute('aria-hidden', !isActive);
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', function(e) {
                if (offScreenMenu.classList.contains('active') &&
                    !offScreenMenu.contains(e.target) &&
                    !hamburger.contains(e.target)) {
                    hamburger.classList.remove('active');
                    offScreenMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    hamburger.setAttribute('aria-expanded', 'false');
                    const offScreenNav = document.getElementById('off-screen-menu-nav');
                    if(offScreenNav) offScreenNav.setAttribute('aria-hidden', 'true');
                }
            });
        } else {
            console.warn("Elementos del menú hamburguesa (.ham-menu o .off-screen-menu) no encontrados durante la inicialización de listeners.");
        }

        // Comportamiento del dropdown de servicios (Escritorio)
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        const servicesMenu = document.getElementById('services-menu'); // El contenedor del menú

        if (dropdownToggle && servicesMenu) {
            dropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation(); // Evitar que el clic cierre inmediatamente
                const expanded = this.getAttribute('aria-expanded') === 'true' || false;
                this.setAttribute('aria-expanded', !expanded);
                servicesMenu.setAttribute('aria-hidden', expanded); // Toggle ARIA
                servicesMenu.classList.toggle('active'); // Toggle clase para estilos/animación CSS
            });

            // Cerrar al hacer clic fuera del dropdown
            document.addEventListener('click', function(e) {
                if (servicesMenu.classList.contains('active') &&
                    !dropdownToggle.contains(e.target) &&
                    !servicesMenu.contains(e.target)) {
                    dropdownToggle.setAttribute('aria-expanded', 'false');
                    servicesMenu.setAttribute('aria-hidden', 'true');
                    servicesMenu.classList.remove('active');
                }
            });

             // Cerrar con tecla Escape
             document.addEventListener('keydown', function(e) {
               if (e.key === 'Escape' && servicesMenu.classList.contains('active')) {
                 dropdownToggle.click(); // Simula clic para cerrar y actualizar estado/ARIA
               }
             });

        } else {
            console.warn("Elementos del dropdown de escritorio (.dropdown-toggle o #services-menu) no encontrados.");
        }

        // Comportamiento del menú de servicios móvil
        const mobileServicesToggle = document.querySelector('.mobile-services-toggle');
        const mobileServicesContent = document.getElementById('mobile-services-list'); // Contenedor de la lista

        if (mobileServicesToggle && mobileServicesContent) {
            // Asegurar estado inicial correcto para animación CSS con max-height
            if (!mobileServicesContent.classList.contains('active')) {
                mobileServicesContent.style.maxHeight = '0px';
                mobileServicesContent.style.overflow = 'hidden';
                mobileServicesContent.style.paddingTop = '0';
                mobileServicesContent.style.paddingBottom = '0';
            }
             mobileServicesContent.style.transition = 'max-height 0.4s ease-out, padding 0.4s ease-out';


            mobileServicesToggle.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevenir que el clic cierre el menú off-screen
                const isActive = mobileServicesContent.classList.toggle('active');
                this.setAttribute('aria-expanded', isActive);
                mobileServicesContent.setAttribute('aria-hidden', !isActive);

                if (isActive) {
                    // Expandir
                    mobileServicesContent.style.paddingTop = '0.5rem'; // Restaurar padding
                    mobileServicesContent.style.paddingBottom = '0.5rem';
                    mobileServicesContent.style.maxHeight = mobileServicesContent.scrollHeight + "px";
                } else {
                    // Colapsar
                    mobileServicesContent.style.maxHeight = '0px';
                    mobileServicesContent.style.paddingTop = '0';
                    mobileServicesContent.style.paddingBottom = '0';
                }
            });
        } else {
            console.warn("Elementos del menú de servicios móvil (.mobile-services-toggle o #mobile-services-list) no encontrados.");
        }
        console.log("Listeners del menú inicializados.");
    }

    // --- Ejecutar la inicialización de los listeners ---
    // La llamada a initMenu desde main.js se asegura de que el DOM esté listo
    initMenuBehaviors();
    // --- Fin ---
}