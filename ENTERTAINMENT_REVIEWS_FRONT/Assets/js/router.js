const Router = {
    currentScript: null,

    async init() {
        window.addEventListener('hashchange', () => this.route());
        if (!window.location.hash || window.location.hash === '#') {
            window.location.hash = '#01_index';
        } else {
            this.route();
        }
    },

    async route() {
        const hash = window.location.hash.slice(1) || '01_index';
        const [page, queryString] = hash.split('?');
        const params = {};
        if (queryString) {
            queryString.split('&').forEach(p => {
                const [k, v] = p.split('=');
                params[k] = decodeURIComponent(v || '');
            });
        }
        this.loadPage(page, params);
    },

    async loadPage(page, params) {
        if (this.currentScript) {
            this.currentScript.remove();
            this.currentScript = null;
        }

        const container = document.getElementById('app');
        try {
            const resp = await fetch(`pages/${page}.html`);
            if (!resp.ok) throw new Error('Not found');
            const html = await resp.text();
            container.innerHTML = html;

            const jsName = page.replace(/^\d+_/, '').replace(/_/g, '-');
            if (typeof updateNavbarUI === 'function') updateNavbarUI();
            const script = document.createElement('script');
            script.src = `pages/js/${jsName}.js`;
            script.onload = () => {
                if (typeof pageInit === 'function') pageInit(params);
            };
            script.onerror = () => {
                container.innerHTML += '<p class="error-message">Error al cargar la página</p>';
            };
            document.body.appendChild(script);
            this.currentScript = script;
        } catch {
            container.innerHTML = '<p>Page not found</p>';
        }
    },

    go(path) {
        window.location.hash = path;
    }
};
