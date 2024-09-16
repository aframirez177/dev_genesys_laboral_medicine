export function initHamburgerMenu() {
    const hamburger = document.querySelector('.ham-menu');
    const offScreenMenu = document.querySelector('.off-screen-menu');
    
    if (!hamburger || !offScreenMenu) return;

    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        offScreenMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Cerrar el menú al hacer clic fuera de él
    document.addEventListener('click', function(e) {
        if (offScreenMenu.classList.contains('active') && 
            !offScreenMenu.contains(e.target) && 
            !hamburger.contains(e.target)) {
            hamburger.click();
        }
    });
}