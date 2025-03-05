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

        const select = document.createElement('select');
        select.id = pregunta.id;
        select.name = pregunta.id;
        select.innerHTML = `<option value="0">No</option><option value="1">Sí</option>`;

        div.appendChild(label);
        div.appendChild(select);
        preguntasContainer.appendChild(div);
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let score = 0;
        preguntas.forEach(pregunta => {
            score += parseInt(document.getElementById(pregunta.id).value);
        });

        resultadosDiv.innerHTML = `<p>Resultado: ${score > 2 ? "Alto Riesgo Psicosocial" : "Riesgo Controlado"}</p>`;
    });
}
