function pageInit() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        Router.go('02_login');
        return;
    }
    loadRequests();
}

async function loadRequests() {
    try {
        const requests = await apiFetch('/requests?status=pending');
        const container = document.getElementById('requestsList');
        if (requests.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay solicitudes pendientes</p>';
            return;
        }
        container.innerHTML = requests.map(req => `
            <div class="request-card">
                <div class="request-info">
                    <div class="request-title">${req.title}</div>
                    <div class="request-meta">${req.category}</div>
                    <p>${req.description || ''}</p>
                    ${req.creator ? `<p class="request-meta">Creador: ${req.creator}</p>` : ''}
                </div>
                <div class="request-actions">
                    <button class="btn btn-secondary" onclick="approve('${req.id}')">Aprobar</button>
                    <button class="btn btn-danger" onclick="reject('${req.id}')">Rechazar</button>
                </div>
            </div>
        `).join('');
    } catch {
        document.getElementById('requestsList').innerHTML = '<p>Error al cargar solicitudes</p>';
    }
}

async function approve(id) {
    try {
        await apiFetch(`/requests/${id}/approve`, { method: 'PUT' });
        loadRequests();
    } catch (err) {
        alert(err.message);
    }
}

async function reject(id) {
    try {
        await apiFetch(`/requests/${id}/reject`, { method: 'PUT' });
        loadRequests();
    } catch (err) {
        alert(err.message);
    }
}
