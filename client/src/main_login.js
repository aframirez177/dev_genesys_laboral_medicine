// main_login.js - Entry point for Login page
import './styles/scss/style_dashboard.scss';

console.log('Login page initialized');

// Tab switching logic
const tabs = document.querySelectorAll('.login-tab');
const formUsuario = document.getElementById('form-usuario');
const formEmpresa = document.getElementById('form-empresa');
const errorDiv = document.getElementById('login-error');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabType = tab.dataset.tab;

    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show/hide forms
    if (tabType === 'usuario') {
      formUsuario.style.display = 'flex';
      formEmpresa.style.display = 'none';
    } else {
      formUsuario.style.display = 'none';
      formEmpresa.style.display = 'flex';
    }

    // Clear error
    errorDiv.classList.remove('visible');
    errorDiv.textContent = '';
  });
});

// Login form handlers
formUsuario.addEventListener('submit', async (e) => {
  e.preventDefault();
  await handleLogin('usuario', formUsuario);
});

formEmpresa.addEventListener('submit', async (e) => {
  e.preventDefault();
  await handleLogin('empresa', formEmpresa);
});

async function handleLogin(tipo, form) {
  const submitBtn = form.querySelector('.login-btn');
  const formData = new FormData(form);

  // Clear previous errors
  errorDiv.classList.remove('visible');
  errorDiv.textContent = '';

  // Show loading state
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const loginData = {};
    formData.forEach((value, key) => {
      loginData[key] = value;
    });

    // Choose endpoint based on tipo
    const endpoint = tipo === 'empresa' ? '/api/auth/login-empresa' : '/api/auth/login';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error('Error de comunicación con el servidor');
    }

    if (!response.ok) {
      // Backend returns 'message' not 'error'
      throw new Error(data.message || data.error || 'Error al iniciar sesión');
    }

    // Success - store token and redirect
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userType', tipo);

    if (tipo === 'usuario') {
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('empresaId', data.user.empresa_id);
      // Store user object for dashboard
      localStorage.setItem('genesys_user', JSON.stringify(data.user));
    } else {
      localStorage.setItem('empresaId', data.empresa.id);
      localStorage.setItem('empresaNIT', data.empresa.nit);
      localStorage.setItem('empresaNombre', data.empresa.nombre_legal);
      // Store empresa object for dashboard
      localStorage.setItem('genesys_empresa', JSON.stringify(data.empresa));
    }

    // Redirect to dashboard
    window.location.href = '/pages/dashboard.html';

  } catch (error) {
    // Show error with better messaging
    console.error('Login error:', error);

    let errorMessage = error.message;

    // Provide more context for network errors
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }

    errorDiv.textContent = errorMessage;
    errorDiv.classList.add('visible');
  } finally {
    // Remove loading state
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

// Check if already logged in
const authToken = localStorage.getItem('authToken');
if (authToken) {
  // Verify token is still valid
  fetch('/api/auth/verify', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  .then(response => {
    if (response.ok) {
      // Already logged in, redirect to dashboard
      window.location.href = '/pages/dashboard.html';
    } else {
      // Token invalid, clear storage
      localStorage.clear();
    }
  })
  .catch(() => {
    // Error verifying, clear storage
    localStorage.clear();
  });
}
