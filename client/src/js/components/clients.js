export function initClients() {
    const clientsContainer = document.querySelector('.clients');
    
    if (!clientsContainer) return;

    // Array de clientes con sus datos
    const clients = [
        { name: 'Petcol', logo: './assets/images/Nuestros_clientes/Recurso 1.svg' },
        { name: 'indes', logo: './assets/images/Nuestros_clientes/Recurso 3.svg' },
        { name: 'Fontur co', logo: './assets/images/Nuestros_clientes/Recurso 4.svg' },
        { name: 'Sogrisel', logo: './assets/images/Nuestros_clientes/Recurso 5.svg' },
        { name: 'Etib', logo: './assets/images/Nuestros_clientes/Recurso 6.svg' },
        { name: 'Consorcio', logo: './assets/images/Nuestros_clientes/Recurso 7.svg' },
        { name: 'AXA colpatria', logo: './assets/images/Nuestros_clientes/Recurso 8.svg' },
        { name: 'Seguros bolivar', logo: './assets/images/Nuestros_clientes/Recurso 9.svg' },
        { name: 'IDI energy', logo: './assets/images/Nuestros_clientes/Recurso 10.svg' },
        { name: 'Logistica y limplieza', logo: './assets/images/Nuestros_clientes/Recurso 11.svg' },
        { name: 'Transportes Artico', logo: './assets/images/Nuestros_clientes/Recurso 12.svg' },
        { name: 'Contegral', logo: './assets/images/Nuestros_clientes/Recurso 13.svg' },
        { name: 'Finca', logo: './assets/images/Nuestros_clientes/Recurso 14.svg' },
        { name: 'Euphoria', logo: './assets/images/Nuestros_clientes/Recurso 15.svg' },
        { name: 'Business insights', logo: './assets/images/Nuestros_clientes/Recurso 16.svg' },
        { name: 'Premium Choice', logo: './assets/images/Nuestros_clientes/Recurso 17.svg' },
        { name: 'Dental 83', logo: './assets/images/Nuestros_clientes/Recurso 19.svg' }
    ];

    // Limpiar el contenedor por si había algo estático
    clientsContainer.innerHTML = ''; 

    // Función para crear y añadir una tarjeta de cliente
    const addClientCard = (client) => {
        const clientElement = document.createElement('article'); // Cambiado a article para coincidir con HTML original
        clientElement.classList.add('client-card');
        // Ajustar la ruta del logo si es necesario (depende de dónde se llame initClients)
        // Asumimos que se llama desde páginas que están un nivel dentro de /pages/ o desde index.html
        // Una forma simple es chequear la ruta actual, pero puede ser complejo.
        // Mejor asegurar rutas relativas correctas o usar rutas absolutas desde la raíz si es posible.
        // Por ahora, intentaremos ajustar basado en la estructura común.
        let logoPath = client.logo;
        // Si estamos en una subpágina (ej: /pages/...), la ruta relativa necesita ../
        if (window.location.pathname.includes('/pages/')) {
             logoPath = client.logo.startsWith('./assets') ? `.${client.logo}` : client.logo; // Añade un . extra -> ../assets...
             // Corrección: Si ya empieza con './', debe ser '../'
             if (client.logo.startsWith('./assets')) {
                logoPath = `..${client.logo.substring(1)}`; // Convierte ./assets a ../assets
             }
        } else {
            // Si estamos en index.html, la ruta ./assets está bien
            logoPath = client.logo;
        }


        clientElement.innerHTML = `
            <img src="${logoPath}" alt="${client.name}" loading="lazy">
            <p>${client.name}</p>
        `;
        clientsContainer.appendChild(clientElement);
    };

    // Añadir el conjunto original de clientes
    clients.forEach(addClientCard);
    
    // Añadir el conjunto duplicado para el bucle infinito
    clients.forEach(addClientCard);

}