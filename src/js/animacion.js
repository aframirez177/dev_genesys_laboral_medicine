    /* drop down menu */
        document.addEventListener('DOMContentLoaded', function() {
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            const dropdownMenu = document.getElementById('services-menu');
        
            dropdownToggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !expanded);
            dropdownMenu.setAttribute('aria-hidden', expanded);
            });
        
            // Cerrar el menú al hacer clic fuera de él
            document.addEventListener('click', function(e) {
            if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownToggle.setAttribute('aria-expanded', 'false');
                dropdownMenu.setAttribute('aria-hidden', 'true');
            }
            });
        
            // Manejar la navegación con teclado
            dropdownToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
            });
        
            dropdownMenu.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                dropdownToggle.setAttribute('aria-expanded', 'false');
                dropdownMenu.setAttribute('aria-hidden', 'true');
                dropdownToggle.focus();
            }
            });
        });
    
    
    //aparecer a mitad de la pagina
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM Content Loaded");
    const cards = document.querySelectorAll('.step-card, .client-card');
    console.log("Number of cards:", cards.length);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            console.log("Card intersecting:", entry.isIntersecting);
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -100px 0px'
    });

    cards.forEach(card => {
        observer.observe(card);
    });
});


    //map location
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map-container');
    const mapButtons = document.querySelectorAll('.map-button');
    
    // Coordenadas iniciales
    const lat = 4.6747451365260595;
    const lng = -74.06211526147553;

    // Inicializar el mapa de Google
    let map = new google.maps.Map(mapContainer, {
        center: { lat: lat, lng: lng },
        zoom: 14
    });

  // Definir el icono personalizado
    const customMarker = {
    url: 'assets/logo_negro_maps.png', // Reemplaza con la URL real de tu logo
    scaledSize: new google.maps.Size(50, 50), // Ajusta el tamaño según necesites
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(25, 25) // Ajusta el punto de anclaje si es necesario
};

// Añadir marcador personalizado
new google.maps.Marker({
    position: {  lat: 4.6747451365260595, lng: -74.06211526147553 },
    map: map,
    icon: customMarker,
    title: 'Nuestra ubicación'
});

    // Función para abrir enlaces externos
    function openExternalMap(type) {
        let url;
        switch(type) {
            case 'waze':
                url = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
                break;
            case 'moovit':
                url = `https://moovit.com/?to=Nuestra%20Ubicación&tll=${lat}_${lng}`;
                break;
            case 'google':
                url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                break;
        }
        window.open(url, '_blank');
    }

    // Añadir event listeners a los botones
    mapButtons.forEach(button => {
        button.addEventListener('click', function() {
            openExternalMap(this.dataset.map);
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for footer links
    document.querySelectorAll('.site-footer a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add hover effect to certification images
    const certificationImages = document.querySelectorAll('.certification-img');
    certificationImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.3s ease';
        });
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const whatsappButton = document.getElementById('whatsapp-button');
    const whatsappPopup = document.getElementById('whatsapp-popup');
    const closePopup = document.getElementById('close-popup');
    const startChat = document.getElementById('start-chat');

    whatsappButton.addEventListener('click', function() {
    whatsappPopup.style.display = 'block';
    setTimeout(() => {
        whatsappPopup.classList.add('show');
    }, 10);
    });

    closePopup.addEventListener('click', function() {
    whatsappPopup.classList.remove('show');
    setTimeout(() => {
        whatsappPopup.style.display = 'none';
    }, 300);
    });

    startChat.addEventListener('click', function() {
      // Reemplaza este número con tu número de WhatsApp real
    window.open('https://wa.me/573205803048', '_blank');
    });
});


console.log('hola mundo este es un mensaje secreto que no se puede ver');


    /* FAQ section */
    
    
        document.addEventListener('DOMContentLoaded', () => {
            const faqsGrid = document.querySelector('.faqs__grid');
            
            const faqs = [
            {
                question: "¿Cuánto me va a costar implementar un programa de SST completo?",
                answer: "En Genesys, adaptamos nuestros programas de SST a las necesidades específicas de tu empresa. Ofrecemos soluciones flexibles y escalables, asegurando que obtengas el mejor valor por tu inversión sin comprometer la calidad. Contáctanos para una cotización personalizada y descubre cómo podemos ayudarte a mejorar la salud y seguridad en tu lugar de trabajo."
            },
            {
                question: "¿Hay opciones económicas que aún cumplan con todos los requisitos legales?",
                answer: "Sí, en Genesys entendemos la importancia de cumplir con las normativas legales sin exceder tu presupuesto. Ofrecemos opciones económicas que garantizan el cumplimiento total de los requisitos legales en salud y seguridad laboral, adaptándonos a las particularidades de tu empresa."
            },
            {
                question: "¿Este proveedor tiene experiencia con empresas de mi tamaño y sector?",
                answer: "Genesys ha trabajado con una amplia variedad de empresas de diferentes tamaños y sectores. Adaptamos nuestros servicios a las necesidades específicas de cada cliente, garantizando resultados efectivos y personalizados que impulsan la seguridad y productividad en tu lugar de trabajo."
            },
            {
                question: "¿Cómo puedo minimizar el tiempo que los empleados pasan fuera del trabajo para estos exámenes?",
                answer: "Con nuestros exámenes médicos ocupacionales y evaluaciones personalizadas, minimizamos el tiempo fuera del trabajo a través de una planificación eficiente y el uso de tecnología avanzada. Así, garantizamos que los exámenes se realicen de manera rápida y sin interrupciones significativas para tu negocio."
            },
            {
                question: "¿Cuánto me va a costar implementar un programa de SST completo?",
                answer: "En Genesys, adaptamos nuestros programas de SST a las necesidades específicas de tu empresa. Ofrecemos soluciones flexibles y escalables, asegurando que obtengas el mejor valor por tu inversión sin comprometer la calidad. Contáctanos para una cotización personalizada y descubre cómo podemos ayudarte a mejorar la salud y seguridad en tu lugar de trabajo."
            },
            {
                question: "¿Hay opciones económicas que aún cumplan con todos los requisitos legales?",
                answer: "Sí, en Genesys entendemos la importancia de cumplir con las normativas legales sin exceder tu presupuesto. Ofrecemos opciones económicas que garantizan el cumplimiento total de los requisitos legales en salud y seguridad laboral, adaptándonos a las particularidades de tu empresa."
            },
            {
                question: "¿Este proveedor tiene experiencia con empresas de mi tamaño y sector?",
                answer: "Genesys ha trabajado con una amplia variedad de empresas de diferentes tamaños y sectores. Adaptamos nuestros servicios a las necesidades específicas de cada cliente, garantizando resultados efectivos y personalizados que impulsan la seguridad y productividad en tu lugar de trabajo."
            },
            {
                question: "¿Cómo puedo minimizar el tiempo que los empleados pasan fuera del trabajo para estos exámenes?",
                answer: "Con nuestros exámenes médicos ocupacionales y evaluaciones personalizadas, minimizamos el tiempo fuera del trabajo a través de una planificación eficiente y el uso de tecnología avanzada. Así, garantizamos que los exámenes se realicen de manera rápida y sin interrupciones significativas para tu negocio."
            }
            ];
        
            faqs.forEach((faq, index) => {
            const faqItem = document.createElement('div');
            faqItem.classList.add('faqs__item');
            faqItem.innerHTML = `
                <div class="faqs__question" tabindex="0" aria-expanded="false" aria-controls="faq-answer-${index}">
                ${faq.question}
                </div>
                <div id="faq-answer-${index}" class="faqs__answer" aria-hidden="true">
                ${faq.answer}
                </div>
            `;
            faqsGrid.appendChild(faqItem);
            });
        
            const questions = document.querySelectorAll('.faqs__question');
            
            questions.forEach(question => {
            question.addEventListener('click', toggleFaq);
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFaq.call(question);
                }
            });
            });
        
            function toggleFaq() {
            const answer = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            this.setAttribute('aria-expanded', !isExpanded);
            answer.setAttribute('aria-hidden', isExpanded);
        
            this.classList.toggle('faqs__question--active');
            answer.classList.toggle('faqs__answer--active');
        
            if (!isExpanded) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = null;
            }
            }
        });