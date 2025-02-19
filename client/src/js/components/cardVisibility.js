export function initCardVisibility() {
    const cards = document.querySelectorAll('.step-card, .client-card, .exam-cards, .exam');
    
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    cards.forEach(card => observer.observe(card));
}