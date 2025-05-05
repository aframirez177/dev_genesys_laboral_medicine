export function initFAQ() {
    const faqContainer = document.querySelector('.faqs__grid');
    
    if (!faqContainer) return;

    const faqs = [
        {
            question: "¿Cuánto me va a costar implementar un programa de SST completo?",
            answer: "En Genesys, adaptamos nuestros programas de SST a las necesidades específicas de tu empresa. Ofrecemos soluciones flexibles y escalables, asegurando que obtengas el mejor valor por tu inversión sin comprometer la calidad. Contáctanos para una cotización personalizada."
        },
        {
            question: "Mi empresa está creciendo y los procesos de SST se están volviendo más complejos, ¿cómo me pueden ayudar a mantener todo bajo control?",
            answer: "Entendemos perfectamente ese desafío del crecimiento. Nuestra plataforma integrada gestiona automáticamente todo el ciclo de SST: desde la identificación de riesgos hasta el seguimiento de exámenes médicos. Lo más valioso es que centralizamos toda la información en un solo lugar, generando alertas automáticas para vencimientos y pendientes. Así, mientras tu empresa crece, mantienes el control total sin multiplicar el trabajo administrativo."
        },
        {
            question: "¿Qué pasa si la ARL o el Ministerio de Trabajo nos hace una visita? ¿Cómo me ayuda su sistema a estar preparado?",
            answer: "Nuestro sistema está diseñado pensando exactamente en estas situaciones. Mantenemos toda tu documentación organizada y actualizada según la normativa vigente, con un tablero de control que te muestra tu nivel de cumplimiento en tiempo real. En caso de visita, puedes generar informes completos con un solo clic. Los clientes que usan nuestro sistema han tenido un 98% de éxito en auditorías de SST."
        },
        {
            question: "Como dueño de empresa, necesito ver resultados concretos. ¿Pueden mostrarme el retorno de esta inversión?",
            answer: "Por supuesto. Nuestros clientes ven resultados medibles en tres áreas principales: ahorro de tiempo (reducción del 70% en procesos administrativos de SST), ahorro en costos (disminución del 30% en gastos relacionados con accidentes laborales) y productividad (reducción del 25% en días perdidos por incapacidades prevenibles). Podemos hacer un análisis específico para tu empresa mostrando el retorno esperado basado en tu sector y tamaño."
        },
        {
            question: "¿Cómo funciona el cotizador automático de exámenes médicos?",
            answer: "El cotizador en línea ofrece transparencia total en precios y elimina las esperas por cotizaciones. Seleccione los exámenes necesarios, ingrese el número de empleados, y obtenga inmediatamente los costos con descuentos por volumen aplicados automáticamente. Puede programar los exámenes directamente desde la plataforma, ahorrando tiempo valioso en coordinación."
        },
        {
            question: "¿Qué garantías ofrece el sistema de IA para la matriz de riesgos y profesiogramas?",
            answer: "Nuestro sistema combina la eficiencia de la IA con la experiencia humana. Cada matriz de riesgos y profesiograma generado por IA es revisado y validado por médicos especialistas en salud ocupacional. Esto asegura que las evaluaciones cumplan con todas las normativas colombianas vigentes mientras aprovechan la precisión y velocidad de la tecnología moderna."
        },
        {
            question: "¿Cómo contribuye su servicio a la sostenibilidad del sistema de salud colombiano?",
            answer: "Nuestro enfoque preventivo ayuda a construir un sistema de salud más sostenible en Colombia. Al identificar y prevenir riesgos laborales tempranamente, reducimos la carga sobre el sistema de salud y los costos asociados con tratamientos posteriores. Esto no solo beneficia a su empresa, sino que contribuye a un sistema de salud más eficiente y accesible para todos los colombianos."
        },
        {
            question: "¿Cómo puedo estar seguro de que mi empresa cumple con todas las normativas de SST sin que esto se convierta en una carga administrativa?",
            answer: "Transformamos la compleja gestión de SST en un proceso simple y confiable. Nuestro sistema, potenciado por IA y respaldado por especialistas, monitorea automáticamente su cumplimiento normativo, genera alertas tempranas y simplifica todos sus procesos de salud ocupacional. Obtenga matrices de riesgo en minutos, profesiogramas en 48 horas, y acceda a un tablero de control que le muestra exactamente qué necesita su atención. Es como tener un experto en SST trabajando 24/7 para su empresa."
        }
        // Añade más preguntas y respuestas aquí
    ];

    faqs.forEach((faq, index) => {
        const faqItem = document.createElement('div');
        faqItem.classList.add('faqs__item');
        faqItem.innerHTML = `
            <div class="faqs__question" role="button" tabindex="0" aria-expanded="false" aria-controls="faq-answer-${index}">
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