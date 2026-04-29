import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const body = error.response?.data;
    // Trial expirado: redireciona pra imprensa (publica) com aviso
    const trialExpired = status === 403 && (body?.code === 'TRIAL_EXPIRED' || body?.message?.code === 'TRIAL_EXPIRED');
    if (trialExpired) {
      if (window.location.pathname !== '/artigos') {
        sessionStorage.setItem('trial-expired-toast', '1');
        window.location.href = '/artigos';
      }
      const err = new Error('TRIAL_EXPIRED');
      err.code = 'TRIAL_EXPIRED';
      return Promise.reject(err);
    }
    if (status === 401) {
      removeToken();
      if (window.location.pathname !== '/entrar') {
        window.location.href = '/entrar';
      }
    }
    const message = body?.message || 'Erro inesperado';
    return Promise.reject(new Error(typeof message === 'string' ? message : 'Erro inesperado'));
  }
);

export default api;
