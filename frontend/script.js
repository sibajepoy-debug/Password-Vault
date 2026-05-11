class PasswordVaultApp {
    constructor() {
        this.API_BASE = 'http://localhost:3000';
        this.token = localStorage.getItem('token');
        this.currentUser = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
    }

    bindEvents() {
        // Auth forms
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const logoutBtn = document.getElementById('logoutBtn');
        const addPasswordForm = document.getElementById('addPasswordForm');

        if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        if (signupForm) signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());
        if (addPasswordForm) addPasswordForm.addEventListener('submit', (e) => this.handleAddPassword(e));
    }

    async apiRequest(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.API_BASE}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            this.showError(error.message);
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            this.setAuth(data.token, data.user);
            window.location.href = 'vault.html';
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await this.apiRequest('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            this.setAuth(data.token, data.user);
            window.location.href = 'vault.html';
        } catch (error) {
            console.error('Signup failed:', error);
        }
    }

    setAuth(token, user) {
        this.token = token;
        this.currentUser = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            this.token = token;
            this.currentUser = JSON.parse(user);
        }

        // Redirect if not authenticated on protected pages
        if (window.location.pathname.includes('vault.html') && !this.token) {
            window.location.href = 'login.html';
        }
    }

    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    showLoading(show = true) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('hidden', !show);
        }
    }

    showError(message) {
        const errorEl = document.getElementById('error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            setTimeout(() => errorEl.classList.add('hidden'), 5000);
        }
    }

    async loadVault() {
        try {
            // In a real app, you'd fetch passwords from /api/passwords
            // For demo, we'll simulate with localStorage
            const passwords = JSON.parse(localStorage.getItem('passwords') || '[]');
            this.renderPasswords(passwords);
            this.updateUserInfo();
        } catch (error) {
            this.showError('Failed to load vault');
        }
    }

    updateUserInfo() {
        const userNameEl = document.getElementById('userName');
        if (userNameEl && this.currentUser) {
            userNameEl.textContent = this.currentUser.name;
        }
    }

    renderPasswords(passwords) {
        const container = document.getElementById('passwordList');
        if (!container) return;

        container.innerHTML = passwords.map(p => `
            <div class="password-item">
                <div class="password-info">
                    <h4>${p.site}</h4>
                    <p>${p.username}</p>
                </div>
                <div class="password-actions">
                    <button class="btn btn-small btn-copy" onclick="navigator.clipboard.writeText('${p.password}')">
                        📋 Copy
                    </button>
                    <button class="btn btn-small btn-delete" onclick="app.deletePassword('${p.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async handleAddPassword(e) {
        e.preventDefault();
        const site = document.getElementById('site').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const newPassword = {
            id: Date.now().toString(),
            site,
            username,
            password
        };

        // Simulate API call
        let passwords = JSON.parse(localStorage.getItem('passwords') || '[]');
        passwords.push(newPassword);
        localStorage.setItem('passwords', JSON.stringify(passwords));

        this.renderPasswords(passwords);
        e.target.reset();
    }

    deletePassword(id) {
        let passwords = JSON.parse(localStorage.getItem('passwords') || '[]');
        passwords = passwords.filter(p => p.id !== id);
        localStorage.setItem('passwords', JSON.stringify(passwords));
        this.loadVault();
    }
}

// Global app instance
const app = new PasswordVaultApp();

// Load vault on vault page
if (window.location.pathname.includes('vault.html')) {
    window.addEventListener('DOMContentLoaded', () => {
        app.loadVault();
    });
}