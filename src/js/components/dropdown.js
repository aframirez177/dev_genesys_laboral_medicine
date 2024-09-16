export function initDropdown() {
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.getElementById('services-menu');

    if (!dropdownToggle || !dropdownMenu) return;

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
}