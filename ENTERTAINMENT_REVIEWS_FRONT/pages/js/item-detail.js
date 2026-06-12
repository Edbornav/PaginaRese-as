var currentItemId = null;
var editingReviewId = null;

function pageInit(params) {
    currentItemId = params.id;
    if (!currentItemId) {
        document.getElementById('itemDetail').innerHTML = '<p>Ítem no encontrado</p>';
        return;
    }
    loadItemDetails();
    loadReviews();
    setupReviewForm();
}

async function loadItemDetails() {
    try {
        const item = await apiFetch(`/catalog/${currentItemId}`);
        document.getElementById('itemDetail').innerHTML = `
            <div class="item-detail-content">
                <img src="${item.coverImageUrl || 'https://placehold.co/300x400/1E1040/5EEAD4?text=No+Image'}" alt="${item.title}">
                <div class="item-info">
                    <h2>${item.title}</h2>
                    <div class="item-meta">
                        <span class="badge badge-${item.category}">${item.category}</span>
                        <span> · ${item.creator}</span>
                        <span> · ${new Date(item.releaseDate).toLocaleDateString()}</span>
                    </div>
                    <p class="item-description">${item.description}</p>
                    <div class="item-stats">
                        <div class="stat">
                            <div class="stat-value">⭐ ${item.averageRating.toFixed(1)}</div>
                            <div class="stat-label">Rating Promedio</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${item.reviewCount}</div>
                            <div class="stat-label">Reseñas</div>
                        </div>
                    </div>
                </div>
            </div>`;
    } catch {
        document.getElementById('itemDetail').innerHTML = '<p>Error al cargar detalles</p>';
    }
}

async function loadReviews() {
    try {
        const reviews = await apiFetch(`/catalog/${currentItemId}/reviews`);
        const container = document.getElementById('reviewsList');
        if (reviews.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay reseñas aún. ¡Sé el primero!</p>';
            return;
        }
        const user = getCurrentUser();
        const userId = user?.id;
        const isAdmin = user?.role === 'admin';
        container.innerHTML = reviews.map(r => {
            const isOwner = r.userId === userId;
            const escapedComment = r.comment.replace(/'/g, "\\'");
            return `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${r.username}</span>
                    <span class="review-rating">⭐ ${r.rating}/10</span>
                </div>
                <p class="review-comment">${r.comment}</p>
                <div class="review-actions">
                    ${isOwner ? `
                        <button class="btn btn-outline btn-sm" onclick="editReview('${r.id}','${escapedComment}',${r.rating})">Editar</button>
                    ` : ''}
                    ${(isOwner || isAdmin) ? `
                        <button class="btn btn-danger btn-sm" onclick="deleteReview('${r.id}')">Eliminar</button>
                    ` : ''}
                </div>
            </div>`;
        }).join('');
    } catch {
        document.getElementById('reviewsList').innerHTML = '<p>Error al cargar reseñas</p>';
    }
}

function editReview(id, comment, rating) {
    editingReviewId = id;
    document.getElementById('comment').value = comment;
    document.getElementById('ratingValue').value = rating;
    document.querySelector('#reviewForm h4').textContent = 'Editar reseña';

    const stars = document.querySelectorAll('#ratingStars .star');
    stars.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value) <= rating);
    });

    const form = document.getElementById('reviewForm');
    form.classList.remove('hidden');

    let cancelBtn = document.getElementById('cancelEditBtn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelEditBtn';
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.onclick = cancelEdit;
        form.querySelector('button[type="submit"]').after(cancelBtn);
    }
    cancelBtn.style.display = '';
    form.scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    editingReviewId = null;
    document.getElementById('reviewFormElement').reset();
    document.getElementById('ratingValue').value = 0;
    document.querySelectorAll('#ratingStars .star').forEach(s => s.classList.remove('active'));
    document.querySelector('#reviewForm h4').textContent = 'Escribe tu reseña';
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function setupReviewForm() {
    if (!isAuthenticated()) {
        const el = document.getElementById('reviewForm');
        el.innerHTML = '<p><a href="#02_login">Inicia sesión</a> para escribir una reseña</p>';
        el.classList.remove('hidden');
        return;
    }

    document.getElementById('reviewForm').classList.remove('hidden');

    const stars = document.querySelectorAll('#ratingStars .star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            document.getElementById('ratingValue').value = value;
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= value);
            });
        });
    });

    document.getElementById('reviewFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const comment = document.getElementById('comment').value;
        const rating = parseInt(document.getElementById('ratingValue').value);
        const errorEl = document.getElementById('reviewError');

        if (!comment.trim()) {
            errorEl.textContent = 'El comentario es obligatorio';
            errorEl.classList.remove('hidden');
            return;
        }

        errorEl.classList.add('hidden');

        try {
            if (editingReviewId) {
                await apiFetch(`/reviews/${editingReviewId}`, {
                    method: 'PUT',
                    body: { comment, rating }
                });
            } else {
                await apiFetch(`/catalog/${currentItemId}/reviews`, {
                    method: 'POST',
                    body: { comment, rating }
                });
            }
            cancelEdit();
            await loadReviews();
            await loadItemDetails();
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
    });
}

async function deleteReview(id) {
    if (!confirm('¿Eliminar esta reseña?')) return;
    try {
        await apiFetch(`/reviews/${id}`, { method: 'DELETE' });
        if (editingReviewId === id) cancelEdit();
        await loadReviews();
        await loadItemDetails();
    } catch (err) {
        alert(err.message);
    }
}
