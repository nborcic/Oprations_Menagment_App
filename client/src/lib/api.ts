import axios from 'axios';

// baseURL '/api' is proxied to the Express server by Vite's dev server config.
export const api = axios.create({ baseURL: '/api' });

// Attach the JWT to every outgoing request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('somp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or revoked — clear storage and force a full page redirect.
      // Using window.location instead of the React Router navigate because this
      // interceptor lives outside the component tree and has no access to the router.
      localStorage.removeItem('somp_token');
      localStorage.removeItem('somp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
