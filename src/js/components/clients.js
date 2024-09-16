export function initClients() {
    const clientsContainer = document.querySelector('.clients');
    
    if (!clientsContainer) return;

    const clients = [
        { name: 'Cliente 1', logo: 'path/to/logo1.png' },
        { name: 'Cliente 2', logo: 'path/to/logo2.png' },
        // Añade más clientes aquí
    ];

    clients.forEach(client => {
        const clientElement = document.createElement('div');
        clientElement.classList.add('client');
        clientElement.innerHTML = `
            <img src="${client.logo}" alt="${client.name}" loading="lazy">
            <p>${client.name}</p>
        `;
        clientsContainer.appendChild(clientElement);
    });
}