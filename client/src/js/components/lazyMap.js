import logoNegro from '../../assets/images/logo_negro_maps.png'; // Ajusta la ruta según tu estructura

export function initMap() {
    const mapContainer = document.getElementById('map-container');
    const mapButtons = document.querySelectorAll('.map-button'); // These are <a> elements

    const lat = 4.6747451365260595;
    const lng = -74.06211526147553;

    // Setup map buttons if they exist
    if (mapButtons.length) {
        mapButtons.forEach(button => { // button is an <a> element
            const mapType = button.dataset.map;
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
            if (url) {
                button.href = url;
                button.target = '_blank';
                button.rel = 'noopener noreferrer';
            }
        });
    }

    // Setup embedded Google Map if its container exists
    if (mapContainer) {
        // Función para cargar el script de Google Maps
        function loadGoogleMaps() {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCjHr3DJQXXQJsbG7rhKl5tkQoSbDP1UDc&callback=initGoogleMap`; // Considera la seguridad de la API Key
            script.async = true;
            document.head.appendChild(script);
        }

        // Función para inicializar el mapa
        window.initGoogleMap = function() {
            const map = new google.maps.Map(mapContainer, {
                center: { lat, lng },
                zoom: 14
            });

            const customMarker = {
                url: logoNegro,
                scaledSize: new google.maps.Size(50, 50),
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

        // Implementar lazy loading for the embedded map
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadGoogleMaps();
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        observer.observe(mapContainer);
    }
}