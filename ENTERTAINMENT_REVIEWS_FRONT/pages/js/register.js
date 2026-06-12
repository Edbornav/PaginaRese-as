function pageInit() {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('error-message');

        try {
            const data = await apiFetch('/auth/register', {
                method: 'POST',
                body: { username, email, password }
            });
            localStorage.setItem('er_token', data.token);
            Router.go('01_index');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
    });
}
