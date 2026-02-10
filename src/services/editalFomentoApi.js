import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

const editalFomentoApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

editalFomentoApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

editalFomentoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (window.location.pathname !== '/entrar') {
        window.location.href = '/entrar';
      }
    }
    const message = error.response?.data?.detail || 'Erro ao buscar editais';
    return Promise.reject(new Error(message));
  }
);

export default editalFomentoApi;
