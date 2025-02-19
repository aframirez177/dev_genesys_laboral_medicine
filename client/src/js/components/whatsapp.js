export function initWhatsApp() {
    const whatsappButton = document.getElementById('whatsapp-button');
    const whatsappPopup = document.getElementById('whatsapp-popup');
    const closePopup = document.getElementById('close-popup');
    const startChat = document.getElementById('start-chat');

    if (!whatsappButton || !whatsappPopup || !closePopup || !startChat) return;

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
        window.open('https://wa.me/573205803048', '_blank');
    });
}