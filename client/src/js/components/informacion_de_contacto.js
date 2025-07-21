// src/js/components/informacion_de_contacto.js

class ContactFormManager {
    constructor(options = {}) {
        this.options = {
            googleFormsUrl: options.googleFormsUrl || '',
            googleSheetsUrl: options.googleSheetsUrl || '',
            onSuccess: options.onSuccess || (() => {}),
            onError: options.onError || (() => {}),
            redirectTo: options.redirectTo || null
        };

        // Almacenar la página de origen
        this.sourcePage = this.detectSourcePage();
        
        // Referencias al DOM que se inicializarán cuando se muestre el formulario
        this.form = null;
        this.modal = null;
    }

    detectSourcePage() {
        const pathname = window.location.pathname;
        if (pathname.includes('Matriz_de_riesgos_profesional') || pathname.includes('diagnostico_interactivo')) {
            return 'matriz-riesgos';
        } else if (pathname.includes('Profesiograma')) {
            return 'profesiograma';
        } else if (pathname.includes('Examenes_medicos_ocupacionales')) {
            return 'examenes-medicos';
        }
        return 'unknown';
    }

    generateFormHTML() {
        return `
            <div class="contact-form-modal" id="contactFormModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${this.getFormTitle()}</h2>
                        <button class="close-modal" type="button" aria-label="Cerrar formulario">&times;</button>
                    </div>
                    <form id="contactInfoForm" class="contact-form">
                        <div class="form-group">
                            <label for="fullName">Nombre completo <span class="required">*</span></label>
                            <input type="text" 
                                   id="fullName" 
                                   name="fullName" 
                                   placeholder="Ej: Juan Carlos Pérez García"
                                   required
                                   autocomplete="name">
                        </div>
                        
                        <div class="form-group">
                            <label for="company">Empresa <span class="required">*</span></label>
                            <input type="text" 
                                   id="company" 
                                   name="company" 
                                   placeholder="Ej: Tecnologías Avanzadas S.A.S."
                                   required
                                   autocomplete="organization">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="nit">NIT <span class="required">*</span></label>
                                <input type="text" 
                                       id="nit" 
                                       name="nit" 
                                       placeholder="Ej: 900123456-7"
                                       pattern="[0-9-]*" 
                                       title="Ingrese un NIT válido"
                                       required>
                            </div>
                            <div class="form-group">
                                <label for="companySize">Tamaño de la empresa <span class="required">*</span></label>
                                <select id="companySize" name="companySize" required>
                                    <option value="">Seleccione el tamaño...</option>
                                    <option value="micro">Micro (1-10 empleados)</option>
                                    <option value="pequena">Pequeña (11-50 empleados)</option>
                                    <option value="mediana">Mediana (51-200 empleados)</option>
                                    <option value="grande">Grande (201+ empleados)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="corporateEmail">Email corporativo <span class="required">*</span></label>
                                <input type="email" 
                                       id="corporateEmail" 
                                       name="corporateEmail" 
                                       placeholder="usuario@empresa.com"
                                       required
                                       autocomplete="work email">
                            </div>
                            <div class="form-group">
                                <label for="whatsapp">WhatsApp <span class="required">*</span></label>
                                <input type="tel" 
                                       id="whatsapp" 
                                       name="whatsapp" 
                                       placeholder="3001234567"
                                       pattern="[0-9]*" 
                                       title="Ingrese solo números"
                                       maxlength="10"
                                       required
                                       autocomplete="tel">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="position">Cargo <span class="required">*</span></label>
                                <input type="text" 
                                       id="position" 
                                       name="position" 
                                       placeholder="Ej: Gerente de Recursos Humanos"
                                       required
                                       autocomplete="organization-title">
                            </div>
                            <div class="form-group">
                                <label for="city">Ciudad <span class="required">*</span></label>
                                <select id="city" name="city" required>
                                    <option value="">Seleccione la ciudad...</option>
                                    ${this.generateColombiaCities()}
                                </select>
                            </div>
                        </div>

                        <div class="form-row actions">
                            <button type="button" class="cancel-btn">Cancelar</button>
                            <button type="submit" class="submit-btn">Continuar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    getFormTitle() {
        const titles = {
            'matriz-riesgos': 'Complete sus datos para descargar su Matriz de Riesgos',
            'profesiograma': 'Complete sus datos para descargar su Profesiograma',
            'examenes-medicos': 'Complete sus datos para descargar su Cotización'
        };
        return titles[this.sourcePage] || 'Complete sus datos';
    }

    generateColombiaCities() {
        const cities = [
            'Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
            'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
            'Pasto', 'Manizales', 'Neiva', 'Villavicencio', 'Armenia',
            'Montería', 'Sincelejo', 'Valledupar', 'Popayán', 'Buenaventura',
            'Tunja', 'Florencia', 'Riohacha', 'Yopal', 'Quibdó'
        ].sort();

        return cities.map(city => 
            `<option value="${city}">${city}</option>`
        ).join('');
    }

    async submitToGoogleForms(formData) {
        const googleFormsData = {
            'entry.376229560': formData.fullName,
            'entry.388709108': formData.company,
            'entry.816380802': formData.nit,
            'entry.927766678': formData.companySize,
            'entry.1135831971': formData.corporateEmail,
            'entry.412547333': formData.whatsapp,
            'entry.1264021129': formData.position,
            'entry.1441307568': formData.city,
            'entry.1227109866': this.sourcePage
        };

        try {
            const response = await fetch(this.options.googleFormsUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(googleFormsData)
            });
            return true;
        } catch (error) {
            console.error('Error submitting to Google Forms:', error);
            return false;
        }
    }

    async submitToGoogleSheets(formData) {
        try {
            const response = await fetch(this.options.googleSheetsUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    sourcePage: this.sourcePage,
                    timestamp: new Date().toISOString()
                })
            });
            return true;
        } catch (error) {
            console.error('Error submitting to Google Sheets:', error);
            return false;
        }
    }

    showForm() {
        if (!document.getElementById('contactFormModal')) {
            document.body.insertAdjacentHTML('beforeend', this.generateFormHTML());
            this.initializeFormHandlers();
        }
        
        this.modal = document.getElementById('contactFormModal');
        this.form = document.getElementById('contactInfoForm');
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll

        // Focus on first input
        setTimeout(() => {
            const firstInput = this.form.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 300);
    }

    hideForm() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scroll
        }
    }

    initializeFormHandlers() {
        const modal = document.getElementById('contactFormModal');
        const form = document.getElementById('contactInfoForm');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');

        closeBtn.addEventListener('click', () => this.hideForm());
        cancelBtn.addEventListener('click', () => this.hideForm());

        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideForm();
            }
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'block') {
                this.hideForm();
            }
        });

        // Validaciones en tiempo real
        const nitInput = document.getElementById('nit');
        const whatsappInput = document.getElementById('whatsapp');
        const emailInput = document.getElementById('corporateEmail');

        nitInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9-]/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            e.target.value = value;
        });

        whatsappInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length > 10) value = value.substring(0, 10);
            e.target.value = value;
        });

        emailInput.addEventListener('input', (e) => {
            const email = e.target.value;
            const personalDomains = ['gmail', 'hotmail', 'yahoo', 'outlook'];
            const isPersonal = personalDomains.some(domain => 
                email.toLowerCase().includes(domain.toLowerCase())
            );
            
            if (isPersonal) {
                emailInput.setCustomValidity('Por favor utilice un correo corporativo');
            } else {
                emailInput.setCustomValidity('');
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const formDataObj = Object.fromEntries(formData.entries());

            // Mostrar indicador de carga
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando...';

            try {
                // Enviar a Google Forms y Sheets en paralelo
                const [formsResult, sheetsResult] = await Promise.all([
                    this.submitToGoogleForms(formDataObj),
                    this.submitToGoogleSheets(formDataObj)
                ]);

                if (formsResult || sheetsResult) {
                    this.hideForm();
                    this.options.onSuccess(formDataObj);
                    
                    // Mostrar mensaje de éxito
                    this.showSuccessMessage();
                    
                    // Si hay una redirección configurada, realizarla
                    if (this.options.redirectTo) {
                        setTimeout(() => {
                            window.location.href = this.options.redirectTo;
                        }, 2000);
                    }
                } else {
                    throw new Error('Error al enviar el formulario');
                }
            } catch (error) {
                console.error('Error:', error);
                this.options.onError(error);
                alert('Hubo un error al procesar su solicitud. Por favor intente nuevamente.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    showSuccessMessage() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                z-index: 1001;
                text-align: center;
                max-width: 400px;
                animation: slideUp 0.5s ease-out;
            ">
                <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                <h3 style="color: #065f46; margin: 0 0 0.5rem 0; font-size: 1.8rem;">¡Información enviada correctamente!</h3>
                <p style="color: #047857; margin: 0; font-size: 1.3rem;">En breves momentos recibirá su matriz de riesgos en el correo indicado.</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

export function initContactForm(options = {}) {
    return new ContactFormManager(options);
}