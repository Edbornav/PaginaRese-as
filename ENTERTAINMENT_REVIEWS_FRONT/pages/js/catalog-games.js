var editingItemId = null;
var editingCoverUrl = '';

function pageInit() {
    editingItemId = null;
    editingCoverUrl = '';
    setupEditForm();
    loadCatalog();
}

async function loadCatalog() {
    try {
        const items = await apiFetch('/catalog?category=videogame');
        renderCatalog(items);
    } catch {
        document.getElementById('catalogGrid').innerHTML = '<p class="error-message">Error al cargar el catálogo</p>';
    }
}

function renderCatalog(items) {
    const grid = document.getElementById('catalogGrid');
    if (items.length === 0) {
        grid.innerHTML = '<p class="text-muted">No hay videojuegos en el catálogo</p>';
        return;
    }
    const isAdmin = getCurrentUser()?.role === 'admin';
    grid.innerHTML = items.map(item => `
        <div class="catalog-card" onclick="Router.go('07_item_detail?id=${item.id}')">
            <img src="${item.coverImageUrl || 'https://placehold.co/300x400/1E1040/5EEAD4?text=No+Image'}" alt="${item.title}" loading="lazy">
            <div class="card-overlay">
                <div class="rating-info">⭐ ${item.averageRating.toFixed(1)} · ${item.reviewCount} reseñas</div>
            </div>
            <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-creator">${item.creator}</p>
                ${isAdmin ? `
                    <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                        <button class="btn btn-outline btn-sm" style="flex:1" onclick="event.stopPropagation(); editItem('${item.id}')">Editar</button>
                        <button class="btn btn-danger btn-sm" style="flex:1" onclick="event.stopPropagation(); deleteCatalogItem('${item.id}')">Eliminar</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function editItem(id) {
    try {
        const item = await apiFetch(`/catalog/${id}`);
        editingItemId = id;
        editingCoverUrl = item.coverImageUrl || '';
        document.getElementById('editTitle').value = item.title;
        document.getElementById('editCategory').value = item.category || '';
        document.getElementById('editReleaseDate').value = item.releaseDate ? item.releaseDate.split('T')[0] : '';
        document.getElementById('editCreator').value = item.creator || '';
        document.getElementById('editDescription').value = item.description || '';
        document.getElementById('editItemContainer').classList.remove('hidden');
        document.getElementById('editItemContainer').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        alert(err.message);
    }
}

function cancelEdit() {
    editingItemId = null;
    editingCoverUrl = '';
    document.getElementById('editItemForm').reset();
    document.getElementById('editItemError').classList.add('hidden');
    document.getElementById('editItemContainer').classList.add('hidden');
}

function setupEditForm() {
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);

    document.getElementById('editItemForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('editItemError');
        errorEl.classList.add('hidden');

        try {
            const fileInput = document.getElementById('editCoverImage');
            let coverImageUrl = editingCoverUrl;
            if (fileInput.files.length > 0) {
                coverImageUrl = await uploadImage(fileInput.files[0]);
            }

            await apiFetch(`/catalog/${editingItemId}`, {
                method: 'PUT',
                body: {
                    title: document.getElementById('editTitle').value,
                    category: document.getElementById('editCategory').value,
                    coverImageUrl,
                    releaseDate: document.getElementById('editReleaseDate').value,
                    creator: document.getElementById('editCreator').value,
                    description: document.getElementById('editDescription').value
                }
            });
            cancelEdit();
            loadCatalog();
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
    });
}
