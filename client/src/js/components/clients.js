export function initClients() {
    const clientsContainer = document.querySelector('.clients');
    
    if (!clientsContainer) return;

    const clients = [

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