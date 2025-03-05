export function initializeForm() {
    const preguntasContainer = document.getElementById('preguntasContainer');
    const form = document.getElementById('bateriaPsicosocialForm');
    const resultadosDiv = document.getElementById('resultados');

    // Preguntas de evaluación
    const preguntas = [
        { id: "estres", texto: "¿Tu equipo experimenta altos niveles de estrés laboral?" },
        { id: "violencia", texto: "¿Se han reportado casos de violencia o acoso en el trabajo?" },
        { id: "apoyo", texto: "¿Existen niveles adecuados de apoyo social entre los empleados?" },
        { id: "ambiente", texto: "¿El ambiente físico y emocional del trabajo es adecuado?" }
    ];

    preguntas.forEach(pregunta => {
        const div = document.createElement('div');
        div.classList.add('form-group');

        const label = document.createElement('label');
        label.htmlFor = pregunta.id;
        label.textContent = pregunta.texto;

        // Crear el contenedor para el toggle
        const toggleContainer = document.createElement('div');
        toggleContainer.classList.add('toggle-container');

        // Crear el label para el switch
        const switchLabel = document.createElement('label');
        switchLabel.classList.add('switch');

        // Crear el input checkbox
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = pregunta.id;
        input.name = pregunta.id;
        input.value = "0"; // Por defecto será "No"
        
        // Cuando se cambia, actualizar el valor
        input.addEventListener('change', (e) => {
            input.value = e.target.checked ? "1" : "0";
        });

        // Crear el slider
        const slider = document.createElement('span');
        slider.classList.add('slider');

        // Añadir todo junto
        switchLabel.appendChild(input);
        switchLabel.appendChild(slider);
        toggleContainer.appendChild(switchLabel);
        
        div.appendChild(label);
        div.appendChild(toggleContainer);
        preguntasContainer.appendChild(div);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let score = 0;
        preguntas.forEach(pregunta => {
            score += parseInt(document.getElementById(pregunta.id).value);
        });

        resultadosDiv.innerHTML = `
            <p>Resultado: ${score > 2 ? "Alto Riesgo Psicosocial" : "Riesgo Controlado"}</p>
            <p>Puntuación: ${score} de 4</p>
        `;
        
        // Hacer scroll al resultado
        resultadosDiv.scrollIntoView({ behavior: 'smooth' });
    });
}