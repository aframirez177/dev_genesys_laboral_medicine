export function initFAQ() {
    const faqContainer = document.querySelector('.faqs__grid');
    
    if (!faqContainer) return;

    const faqs = [
        {
            question: "¿Cuánto me va a costar implementar un programa de SST completo?",
            answer: "En Genesys, adaptamos nuestros programas de SST a las necesidades específicas de tu empresa. Ofrecemos soluciones flexibles y escalables, asegurando que obtengas el mejor valor por tu inversión sin comprometer la calidad. Contáctanos para una cotización personalizada."
        },
        // Añade más preguntas y respuestas aquí
    ];

    faqs.forEach((faq, index) => {
        const faqItem = document.createElement('div');
        faqItem.classList.add('faqs__item');
        faqItem.innerHTML = `
            <div class="faqs__question" tabindex="0" aria-expanded="false" aria-controls="faq-answer-${index}">
                ${faq.question}
            </div>
            <div id="faq-answer-${index}" class="faqs__answer" aria-hidden="true">
                ${faq.answer}
            </div>
        `;
        faqContainer.appendChild(faqItem);
    });

    faqContainer.addEventListener('click', function(e) {
        const question = e.target.closest('.faqs__question');
        if (question) {
            const answer = question.nextElementSibling;
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            question.setAttribute('aria-expanded', !isExpanded);
            answer.setAttribute('aria-hidden', isExpanded);
            answer.style.maxHeight = isExpanded ? null : answer.scrollHeight + "px";
        }
    });
}