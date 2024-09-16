// Objeto para almacenar los rangos de descuento
const discountRanges = {
    '1-10': 0.05,
    '11-50': 0.10,
    '51-100': 0.15,
    '101-500': 0.20,
    '501+': 0.25
};

// Función para obtener el descuento basado en el número de trabajadores
function getDiscount(numWorkers) {
    if (numWorkers <= 10) return discountRanges['1-10'];
    if (numWorkers <= 50) return discountRanges['11-50'];
    if (numWorkers <= 100) return discountRanges['51-100'];
    if (numWorkers <= 500) return discountRanges['101-500'];
    return discountRanges['501+'];
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);
}

export function initCalculator() {
    const checkboxItems = document.querySelectorAll('.checkbox-item');
    const examTitle = document.getElementById('examTitle');
    const examDescription = document.getElementById('examDescription');
    const examPrice = document.getElementById('examPrice');
    const cargoInput = document.getElementById('cargo');
    const packageName = document.getElementById('packageName');
    const workerPrice = document.getElementById('workerPrice');
    const totalPrice = document.getElementById('totalPrice');
    const trabajadoresInput = document.getElementById('trabajadores');
    const discount1Checkbox = document.getElementById('discount1');
    const discount2Checkbox = document.getElementById('discount2');
    const totalPriceElement = document.querySelector('.total-price');

    if (!checkboxItems.length || !examTitle || !examDescription || !examPrice || !cargoInput || 
        !packageName || !workerPrice || !totalPrice || !trabajadoresInput || 
        !discount1Checkbox || !discount2Checkbox || !totalPriceElement) {
        console.error('Faltan elementos necesarios para la calculadora');
        return;
    }

    let lastSelectedExam = null;
    let totalExamPrice = 0;

    function updateExamDescription(title, description, price) {
        examTitle.textContent = title;
        examDescription.textContent = description;
        examPrice.innerHTML = `Desde: <span class="min-price">${formatPrice(price)}</span>`;
    }

    function updatePackageSummary() {
        const cargo = cargoInput.value.trim() || 'Cargo';
        packageName.textContent = `Paquete ${cargo}`;
        workerPrice.textContent = formatPrice(totalExamPrice);
        
        const numTrabajadores = parseInt(trabajadoresInput.value) || 1;
        const packageTotal = totalExamPrice * numTrabajadores;
        totalPrice.textContent = formatPrice(packageTotal);

        // Calcular el precio final con descuentos
        let finalPrice = packageTotal;
        const workerDiscount = getDiscount(numTrabajadores);
        if (discount1Checkbox.checked) {
            finalPrice *= (1 - workerDiscount);
        }
        if (discount2Checkbox.checked) {
            finalPrice *= 0.95; // 5% de descuento adicional
        }

        totalPriceElement.textContent = formatPrice(finalPrice);
    }

    function calculateTotalPrice() {
        totalExamPrice = 0;
        checkboxItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                totalExamPrice += parseInt(item.dataset.price);
            }
        });
        updatePackageSummary();
    }

    checkboxItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');

        item.addEventListener('mouseenter', () => {
            updateExamDescription(item.title, item.dataset.description, item.dataset.price);
        });

        item.addEventListener('mouseleave', () => {
            if (lastSelectedExam) {
                updateExamDescription(lastSelectedExam.title, lastSelectedExam.dataset.description, lastSelectedExam.dataset.price);
            } else {
                updateExamDescription('Seleccione un examen', 'Pase el cursor sobre un examen para ver su descripción.', 0);
            }
        });

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                lastSelectedExam = item;
                updateExamDescription(item.title, item.dataset.description, item.dataset.price);
            } else if (lastSelectedExam === item) {
                lastSelectedExam = null;
                updateExamDescription('Seleccione un examen', 'Pase el cursor sobre un examen para ver su descripción.', 0);
            }
            calculateTotalPrice();
        });
    });

    cargoInput.addEventListener('input', updatePackageSummary);
    trabajadoresInput.addEventListener('input', calculateTotalPrice);
    discount1Checkbox.addEventListener('change', updatePackageSummary);
    discount2Checkbox.addEventListener('change', updatePackageSummary);

    // Inicialización
    calculateTotalPrice();
}