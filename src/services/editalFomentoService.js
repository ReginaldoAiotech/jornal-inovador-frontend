import editalFomentoApi from './editalFomentoApi';
import { API } from '../constants/api';

export async function getEditaisFomento(params) {
  const { data } = await editalFomentoApi.get(API.EDITAIS_FOMENTO.BASE, { params });
  return data;
}

export async function getEditalFomentoById(id) {
  const { data } = await editalFomentoApi.get(API.EDITAIS_FOMENTO.BY_ID(id));
  return data;
}

export async function getEstados() {
  const { data } = await editalFomentoApi.get(API.EDITAIS_FOMENTO.ESTADOS);
  return data;
}

export async function getEditaisFomentoStats() {
  const { data } = await editalFomentoApi.get(API.EDITAIS_FOMENTO.STATS);
  return data;
}

export async function getEditaisFomentoDashboard() {
  const { data } = await editalFomentoApi.get(API.EDITAIS_FOMENTO.DASHBOARD);
  return data;
}

export async function updateEditalFomento(id, editalData) {
  const { data } = await editalFomentoApi.put(API.EDITAIS_FOMENTO.BY_ID(id), editalData);
  return data;
}

export async function deleteEditalFomento(id) {
  await editalFomentoApi.delete(API.EDITAIS_FOMENTO.BY_ID(id));
}

export async function getFavoriteEditaisFomento(params) {
  const { data } = await editalFomentoApi.get(API.EDITAIS_FOMENTO.FAVORITES, { params });
  return data;
}

export async function toggleFavoriteEditalFomento(id) {
  const { data } = await editalFomentoApi.post(API.EDITAIS_FOMENTO.FAVORITE(id));
  return data;
}
