import api from './api';
import { API } from '../constants/api';

export async function getEditais(params) {
  const { data } = await api.get(API.EDITAIS.BASE, { params });
  return data;
}

export async function getActiveEditais(params) {
  const { data } = await api.get(API.EDITAIS.ACTIVE, { params });
  return data;
}

export async function getEditalById(id) {
  const { data } = await api.get(API.EDITAIS.BY_ID(id));
  return data;
}

export async function createEdital(editalData) {
  const { data } = await api.post(API.EDITAIS.BASE, editalData);
  return data;
}

export async function updateEdital(id, editalData) {
  const { data } = await api.put(API.EDITAIS.BY_ID(id), editalData);
  return data;
}

export async function deleteEdital(id) {
  await api.delete(API.EDITAIS.BY_ID(id));
}

export async function toggleFavorite(id) {
  const { data } = await api.post(API.EDITAIS.FAVORITE(id));
  return data;
}

export async function getFavorites(params) {
  const { data } = await api.get(API.EDITAIS.FAVORITES, { params });
  return data;
}
