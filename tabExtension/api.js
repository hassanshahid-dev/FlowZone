// api.js - TabFlow API Service Client

const BASE_URL = `http://localhost:5000/api`;

const API = {
    async getToken() {
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get('token', (data) => {
                    resolve(data.token || null);
                });
            } else {
                resolve(localStorage.getItem('token') || null);
            }
        });
    },

    async checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${BASE_URL}/workspaces`, {
                method: 'HEAD',
                signal: controller.signal
            }).catch(() => null);
            clearTimeout(timeoutId);
            return !!res;
        } catch {
            return false;
        }
    },

    // AUTH APIs
    async register(email, password) {
        try {
            const res = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await res.json();
        } catch (err) {
            return { error: 'Backend network connection failed. ' + err.message };
        }
    },

    async login(email, password) {
        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await res.json();
        } catch (err) {
            return { error: 'Backend network connection failed. ' + err.message };
        }
    },

    // WORKSPACE APIs
    async getWorkspaces() {
        try {
            const token = await this.getToken();
            if (!token) return { error: 'No auth token found' };

            const res = await fetch(`${BASE_URL}/workspaces`, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                return { error: errData.error || `Server responded with status ${res.status}` };
            }

            return await res.json();
        } catch (err) {
            return { error: 'Network error fetching workspaces: ' + err.message };
        }
    },

    async createWorkspace(name, tabs, tag = 'Indigo') {
        try {
            const token = await this.getToken();
            const res = await fetch(`${BASE_URL}/workspaces`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ name, tabs, tag })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                return { error: errData.error || 'Failed to create workspace on backend' };
            }

            return await res.json();
        } catch (err) {
            return { error: 'Network error creating workspace: ' + err.message };
        }
    },

    async updateWorkspace(id, data) {
        try {
            const token = await this.getToken();
            const res = await fetch(`${BASE_URL}/workspaces/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                return { error: errData.error || 'Failed to update workspace' };
            }

            return await res.json();
        } catch (err) {
            return { error: 'Network error updating workspace: ' + err.message };
        }
    },

    async deleteWorkspace(id) {
        try {
            const token = await this.getToken();
            const res = await fetch(`${BASE_URL}/workspaces/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                return { error: errData.error || 'Failed to delete workspace' };
            }

            return await res.json();
        } catch (err) {
            return { error: 'Network error deleting workspace: ' + err.message };
        }
    }
};