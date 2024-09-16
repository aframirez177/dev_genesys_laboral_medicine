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
    
        //cambiar tarjetas cada n segundos
    document.addEventListener('DOMContentLoaded', function() {
        const faqItems = document.querySelectorAll('.faq-item');
        let currentItem = 0;
    
        function showNextItem() {
            faqItems[currentItem].classList.remove('active');
            currentItem = (currentItem + 1) % faqItems.length;
            faqItems[currentItem].classList.add('active');
        }
    
        
        // Cambiar cada 6 segundos
        setInterval(showNextItem, 6000);
    });
    
        //map location
    document.addEventListener('DOMContentLoaded', function() {
        const mapContainer = document.getElementById('map-container');
        const mapButtons = document.querySelectorAll('.map-button');
        
        // Coordenadas iniciales
        const lat =  4.6747451365260595;
        const lng = -74.06211526147553;
    
        // Inicializar el mapa de Google
        let map = new google.maps.Map(mapContainer, {
            center: { lat: lat, lng: lng },
            zoom: 14
        });
    
      // Definir el icono personalizado
        const customMarker = {
        url: './assets/logo_negro_maps.png', // Reemplaza con la URL real de tu logo
        scaledSize: new google.maps.Size(50, 50), // Ajusta el tamaño según necesites
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25, 25) // Ajusta el punto de anclaje si es necesario
    };
    
    // Añadir marcador personalizado
    new google.maps.Marker({
        position: { lat: 4.6747451365260595, lng: -74.06211526147553 },
        map: map,
        icon: customMarker,
        title: "Nuestra ubicación"
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
    
    
    
    
    
    
