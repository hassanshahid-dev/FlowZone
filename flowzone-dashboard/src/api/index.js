const BASE_URL = 'https://flowzone-backend-api.vercel.app/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
    const { token } = await chrome.storage.local.get('token');

    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        if(err.response?.status === 401) {
            await chrome.storage.local.remove('token');
            await chrome.storage.local.remove('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export const register = (email, password) => {
    api.post('/auth/register', { email, password });
}

export const login = (email, password) => {
    api.post('/auth/login', { email, password });
}

export const getWorkspaces = () =>
    api.get('/workspaces');

export const deleteWorkspace = (id) =>
    api.delete(`/workspaces/${id}`);

export const createCheckoutSession = () =>             // yet to create in backend
    api.post('/billing/checkout');

export default api;