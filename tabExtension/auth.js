// auth.js - TabFlow Authentication & User Management

const Auth = {
    async getUser() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['token', 'user'], (data) => {
                    resolve({ token: data.token || null, user: data.user || null });
                });
            } else {
                const token = localStorage.getItem('token');
                const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
                resolve({ token, user });
            }
        });
    },

    async setSession(token, user) {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ token, user }, resolve);
            } else {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                resolve();
            }
        });
    },

    async clearSession() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.remove(['token', 'user'], resolve);
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                resolve();
            }
        });
    },

    async handleAuth(type, email, password) {
        if (!email || !password) {
            return { error: 'Please enter both email and password' };
        }

        if (password.length < 4) {
            return { error: 'Password must be at least 4 characters long' };
        }

        const data = type === 'login' 
            ? await API.login(email, password)
            : await API.register(email, password);

        if (data.error) {
            return { error: data.error };
        }

        const userObj = data.user || { email, id: 'u_' + Date.now() };
        await this.setSession(data.token, userObj);
        return { success: true, token: data.token, user: userObj };
    }
};