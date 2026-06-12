function pageInit() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('error-message');

        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: { email, password }
            });
            localStorage.setItem('er_token', data.token);
            Router.go('01_index');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
    });
}
