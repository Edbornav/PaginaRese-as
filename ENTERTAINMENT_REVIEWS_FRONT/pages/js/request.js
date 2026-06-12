function pageInit() {
    if (!isAuthenticated()) {
        Router.go('02_login');
        return;
    }

    document.getElementById('requestForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const coverImageInput = document.getElementById('coverImage');
        const releaseDate = document.getElementById('releaseDate').value;
        const creator = document.getElementById('creator').value;
        const description = document.getElementById('description').value;
        const errorEl = document.getElementById('error-message');
        const successEl = document.getElementById('success-message');

        errorEl.classList.add('hidden');
        successEl.classList.add('hidden');

        try {
            let coverImageUrl = '';
            if (coverImageInput.files.length > 0) {
                coverImageUrl = await uploadImage(coverImageInput.files[0]);
            }
            await apiFetch('/requests', {
                method: 'POST',
                body: { title, category, coverImageUrl, releaseDate, creator, description }
            });
            document.getElementById('requestForm').reset();
            successEl.textContent = 'Solicitud enviada correctamente';
            successEl.classList.remove('hidden');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
    });
}
