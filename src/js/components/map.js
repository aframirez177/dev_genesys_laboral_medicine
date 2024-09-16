import logoNegro from '../../assets/images/logo_negro_maps.png'; // Ajusta la ruta según tu estructura
export function initMap() {
    const mapContainer = document.getElementById('map-container');
    const mapButtons = document.querySelectorAll('.map-button');
    
    if (!mapContainer || !mapButtons.length) return;

    const lat = 4.6747451365260595;
    const lng = -74.06211526147553;

    // Función para cargar el script de Google Maps
    function loadGoogleMaps() {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCjHr3DJQXXQJsbG7rhKl5tkQoSbDP1UDc&callback=initGoogleMap`;
        script.async = true;
        document.head.appendChild(script);
    }

    // Función para inicializar el mapa
    window.initGoogleMap = function() {
        const map = new google.maps.Map(mapContainer, {
            center: { lat, lng },
            zoom: 14
        });

    // Definir el icono personalizado

    const customMarker = {
        url: logoNegro, // Usa la imagen importada
        scaledSize: new google.maps.Size(50, 50), // Ajusta el tamaño
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25, 25),
    };

        new google.maps.Marker({
            position: { lat, lng },
            map: map,
            icon: customMarker,
            title: 'Nuestra ubicación'
        });
    }

    // Cargar el mapa cuando sea visible
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadGoogleMaps();
            observer.disconnect();
        }
    }, { threshold: 0.1 });

    observer.observe(mapContainer);

    // Manejar clics en los botones de mapa
    mapButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mapType = this.dataset.map;
            let url;
            switch(mapType) {
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
            if (url) window.open(url, '_blank');
        });
    });
}