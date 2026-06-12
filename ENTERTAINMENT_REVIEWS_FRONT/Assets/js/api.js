const API_BASE = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://lively-determination-production-5256.up.railway.app/api';
const CLOUDINARY_CLOUD_NAME = 'dfcbsqxfq';
const CLOUDINARY_UPLOAD_PRESET = 'IMAGENES';

function getToken() {
    return localStorage.getItem('er_token');
}

function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

function getCurrentUser() {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        };
    } catch {
        return null;
    }
}

async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options
    };

    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    if (response.status === 204) return null;

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error en la solicitud');
    return data;
}

async function loadNavbar() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;
    try {
        const resp = await fetch('shared/navbar.html');
        const html = await resp.text();
        placeholder.innerHTML = html;
        updateNavbarUI();
        if (typeof Router !== 'undefined') Router.init();
    } catch {
        placeholder.innerHTML = '<p>Error al cargar navbar</p>';
    }
}

function updateNavbarUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!loginBtn) return;

    if (isAuthenticated()) {
        const user = getCurrentUser();
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        userMenu.classList.remove('hidden');
        usernameDisplay.textContent = user?.username || '';

        const requestBtn = document.getElementById('requestBtn');
        const profileBtn = document.getElementById('profileBtn');

        if (user?.role === 'admin') {
            requestBtn.textContent = 'Agregar Ítem';
            requestBtn.href = '#10_admin_dashboard';
            profileBtn.style.display = 'none';
        } else {
            requestBtn.textContent = 'Solicitar';
            requestBtn.href = '#09_request';
            profileBtn.style.display = '';
        }
    } else {
        loginBtn.style.display = '';
        registerBtn.style.display = '';
        userMenu.classList.add('hidden');
    }

    if (logoutBtn) {
        logoutBtn.removeEventListener('click', logoutHandler);
        logoutBtn.addEventListener('click', logoutHandler);
    }
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Error al subir imagen');
    return data.secure_url;
}

async function deleteCatalogItem(id) {
    if (!confirm('¿Eliminar este ítem del catálogo?')) return;
    try {
        await apiFetch(`/catalog/${id}`, { method: 'DELETE' });
        location.reload();
    } catch (err) {
        alert(err.message);
    }
}

function logoutHandler(e) {
    e.preventDefault();
    localStorage.removeItem('er_token');
    updateNavbarUI();
    Router.go('02_login');
}

loadNavbar();
