import api from './api';
import { API } from '../constants/api';

export async function getMyProjetos() {
  const { data } = await api.get(API.PROJETOS_FOMENTO.BASE);
  return data;
}

export async function uploadProjeto(file, titulo, descricao, editalDetalhesId) {
  const formData = new FormData();
  formData.append('arquivo', file);
  formData.append('titulo', titulo);
  if (descricao) formData.append('descricao', descricao);
  if (editalDetalhesId) formData.append('editalDetalhesId', editalDetalhesId);
  const { data } = await api.post(API.PROJETOS_FOMENTO.BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateProjeto(id, { titulo, descricao, editalDetalhesId, arquivo }) {
  const formData = new FormData();
  if (titulo !== undefined) formData.append('titulo', titulo);
  if (descricao !== undefined) formData.append('descricao', descricao || '');
  if (editalDetalhesId !== undefined) formData.append('editalDetalhesId', editalDetalhesId || '');
  if (arquivo) formData.append('arquivo', arquivo);
  const { data } = await api.put(API.PROJETOS_FOMENTO.BY_ID(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProjeto(id) {
  await api.delete(API.PROJETOS_FOMENTO.BY_ID(id));
}
