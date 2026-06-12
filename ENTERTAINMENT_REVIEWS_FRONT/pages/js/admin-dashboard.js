function pageInit() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        Router.go('02_login');
        return;
    }
    loadCatalog();
    setupAddForm();
}

function setupAddForm() {
    const form = document.getElementById('addItemForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const coverImageInput = document.getElementById('coverImage');
        const releaseDate = document.getElementById('releaseDate').value;
        const creator = document.getElementById('creator').value;
        const description = document.getElementById('description').value;
        const errorEl = document.getElementById('addItemError');
        const successEl = document.getElementById('addItemSuccess');

        errorEl.classList.add('hidden');
        successEl.classList.add('hidden');

        try {
            let coverImageUrl = '';
            if (coverImageInput.files.length > 0) {
                coverImageUrl = await uploadImage(coverImageInput.files[0]);
            }
            await apiFetch('/catalog', {
                method: 'POST',
                body: { title, category, coverImageUrl, releaseDate, creator, description }
            });
            form.reset();
            successEl.textContent = 'Ítem agregado al catálogo exitosamente';
            successEl.classList.remove('hidden');
            loadCatalog();
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
    });
}

async function loadCatalog() {
    try {
        const items = await apiFetch('/catalog');
        const container = document.getElementById('adminCatalog');
        container.innerHTML = items.map(item => `
            <div class="admin-item">
                <img src="${item.coverImageUrl || 'https://placehold.co/60x80/1E1040/5EEAD4?text=N'}" alt="${item.title}">
                <div class="admin-item-info">
                    <div class="admin-item-title">${item.title}</div>
                    <div class="admin-item-category">${item.category} · ⭐ ${item.averageRating.toFixed(1)}</div>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteItem('${item.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    } catch {
        document.getElementById('adminCatalog').innerHTML = '<p>Error al cargar catálogo</p>';
    }
}

async function deleteItem(id) {
    if (!confirm('¿Eliminar este ítem del catálogo?')) return;
    try {
        await apiFetch(`/catalog/${id}`, { method: 'DELETE' });
        loadCatalog();
    } catch (err) {
        alert(err.message);
    }
}
