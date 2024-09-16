export function addHoverEffect(elements, scale = 1.1) {
    elements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transform = `scale(${scale})`;
            element.style.transition = 'transform 0.3s ease';
        });
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
        });
    });
}

export function smoothScroll(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}