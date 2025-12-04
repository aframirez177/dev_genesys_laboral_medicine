/**
 * Login Handler - Sprint 1
 * Maneja la autenticacion de usuarios y empresas
 */

// Detectar entorno
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// DOM Elements
const tabUsuario = document.querySelector('[data-tab="usuario"]');
const tabEmpresa = document.querySelector('[data-tab="empresa"]');
const formUsuario = document.getElementById('form-usuario');
const formEmpresa = document.getElementById('form-empresa');
const errorContainer = document.getElementById('login-error');

// Estado actual
let currentTab = 'usuario';

/**
 * Cambiar entre tabs
 */
function switchTab(tab) {
    currentTab = tab;

    // Actualizar clases de tabs
    if (tab === 'usuario') {
        tabUsuario.classList.add('active');
        tabEmpresa.classList.remove('active');
        formUsuario.style.display = 'flex';
        formEmpresa.style.display = 'none';
    } else {
        tabUsuario.classList.remove('active');
        tabEmpresa.classList.add('active');
        formUsuario.style.display = 'none';
        formEmpresa.style.display = 'flex';
    }

    // Limpiar error
    hideError();
}

/**
 * Mostrar error
 */
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.add('visible');
}

/**
 * Ocultar error
 */
function hideError() {
    errorContainer.classList.remove('visible');
}

/**
 * Manejar login de usuario
 */
async function handleUsuarioLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password-usuario').value;
    const submitBtn = formUsuario.querySelector('.login-btn');

    if (!email || !password) {
        showError('Por favor completa todos los campos');
        return;
    }

    // Estado de carga
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    hideError();

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesion');
        }

        // Guardar token y datos en localStorage
        localStorage.setItem('genesys_token', data.token);
        localStorage.setItem('genesys_user', JSON.stringify(data.user));
        localStorage.setItem('genesys_auth_type', 'user');

        // Redirigir al dashboard
        window.location.href = './dashboard.html';

    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Error al iniciar sesion. Intenta de nuevo.');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

/**
 * Manejar login de empresa
 */
async function handleEmpresaLogin(event) {
    event.preventDefault();

    const nit = document.getElementById('nit').value.trim();
    const password = document.getElementById('password-empresa').value;
    const submitBtn = formEmpresa.querySelector('.login-btn');

    if (!nit || !password) {
        showError('Por favor completa todos los campos');
        return;
    }

    // Estado de carga
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    hideError();

    try {
        const response = await fetch(`${API_BASE}/auth/login-empresa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nit, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesion');
        }

        // Guardar token y datos en localStorage
        localStorage.setItem('genesys_token', data.token);
        localStorage.setItem('genesys_empresa', JSON.stringify(data.empresa));
        localStorage.setItem('genesys_auth_type', 'empresa');

        // Redirigir al dashboard
        window.location.href = './dashboard.html';

    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Error al iniciar sesion. Intenta de nuevo.');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

/**
 * Verificar si ya hay sesion activa
 */
function checkExistingSession() {
    const token = localStorage.getItem('genesys_token');
    if (token) {
        // Verificar si el token es valido
        verifyToken(token);
    }
}

/**
 * Verificar token con el servidor
 */
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Token valido, redirigir al dashboard
            window.location.href = './dashboard.html';
        } else {
            // Token invalido, limpiar storage
            clearSession();
        }
    } catch (error) {
        console.error('Token verification error:', error);
        clearSession();
    }
}

/**
 * Limpiar sesion
 */
function clearSession() {
    localStorage.removeItem('genesys_token');
    localStorage.removeItem('genesys_user');
    localStorage.removeItem('genesys_empresa');
    localStorage.removeItem('genesys_auth_type');
}

// Event Listeners
tabUsuario.addEventListener('click', () => switchTab('usuario'));
tabEmpresa.addEventListener('click', () => switchTab('empresa'));
formUsuario.addEventListener('submit', handleUsuarioLogin);
formEmpresa.addEventListener('submit', handleEmpresaLogin);

// Verificar sesion existente al cargar
document.addEventListener('DOMContentLoaded', checkExistingSession);
