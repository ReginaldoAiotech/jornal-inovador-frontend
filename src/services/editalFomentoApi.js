import axios from 'axios';

const editalFomentoApi = axios.create({
  baseURL: import.meta.env.VITE_EDITAIS_AGENT_API_URL,
});

editalFomentoApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || 'Erro ao buscar editais';
    return Promise.reject(new Error(message));
  }
);

export default editalFomentoApi;
