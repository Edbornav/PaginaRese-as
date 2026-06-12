var editingReviewId = null;

function pageInit() {
    if (!isAuthenticated()) {
        Router.go('02_login');
        return;
    }
    editingReviewId = null;
    loadMyReviews();
    setupEditForm();
    document.getElementById('profileCancelEditBtn').addEventListener('click', cancelEdit);
}

async function loadMyReviews() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const reviews = await apiFetch(`/reviews/user/${user.id}`);
        const container = document.getElementById('myReviews');

        if (reviews.length === 0) {
            container.innerHTML = '<p class="text-muted">No has escrito reseñas aún</p>';
            return;
        }

        container.innerHTML = reviews.map(r => {
            const escapedComment = r.comment.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `
            <div class="review-card">
                <div class="review-header">
                    <a href="#07_item_detail?id=${r.catalogItemId}" class="review-author">${r.itemTitle}</a>
                    <span class="review-rating">⭐ ${r.rating}/10</span>
                </div>
                <p class="review-comment">${r.comment}</p>
                <div class="review-actions">
                    <button class="btn btn-outline btn-sm" onclick="editReview('${r.id}','${escapedComment}',${r.rating})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteReview('${r.id}')">Eliminar</button>
                </div>
            </div>`;
        }).join('');
    } catch {
        document.getElementById('myReviews').innerHTML = '<p>Error al cargar reseñas</p>';
    }
}

function editReview(id, comment, rating) {
    editingReviewId = id;
    document.getElementById('profileComment').value = comment;
    document.getElementById('profileRatingValue').value = rating;

    const stars = document.querySelectorAll('#profileRatingStars .star');
    stars.forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.value) <= rating);
    });

    document.getElementById('editReviewContainer').classList.remove('hidden');
    document.getElementById('editReviewContainer').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    editingReviewId = null;
    document.getElementById('editReviewFormElement').reset();
    document.getElementById('profileRatingValue').value = 0;
    document.querySelectorAll('#profileRatingStars .star').forEach(s => s.classList.remove('active'));
    document.getElementById('editReviewContainer').classList.add('hidden');
}

function setupEditForm() {
    const stars = document.querySelectorAll('#profileRatingStars .star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = parseInt(star.dataset.value);
            document.getElementById('profileRatingValue').value = value;
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= value);
            });
        });
    });

    document.getElementById('editReviewFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const comment = document.getElementById('profileComment').value;
        const rating = parseInt(document.getElementById('profileRatingValue').value);
        const errorEl = document.getElementById('profileReviewError');

        if (!comment.trim() || !rating) {
            errorEl.textContent = 'Comentario y calificación son obligatorios';
            errorEl.classList.remove('hidden');
            return;
        }

        errorEl.classList.add('hidden');

        try {
            await apiFetch(`/reviews/${editingReviewId}`, {
                method: 'PUT',
                body: { comment, rating }
            });
            cancelEdit();
            await loadMyReviews();
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
        pageInit();
    } catch (err) {
        alert(err.message);
    }
}
