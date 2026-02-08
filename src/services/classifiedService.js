import api from './api';
import { API } from '../constants/api';

export async function getClassifieds(params) {
  const { data } = await api.get(API.CLASSIFIEDS.BASE, { params });
  return data;
}

export async function getClassifiedById(id) {
  const { data } = await api.get(API.CLASSIFIEDS.BY_ID(id));
  return data;
}

export async function createClassified(classifiedData) {
  const { data } = await api.post(API.CLASSIFIEDS.BASE, classifiedData);
  return data;
}

export async function updateClassified(id, classifiedData) {
  const { data } = await api.put(API.CLASSIFIEDS.BY_ID(id), classifiedData);
  return data;
}

export async function deleteClassified(id) {
  await api.delete(API.CLASSIFIEDS.BY_ID(id));
}

export async function getMyClassifieds(params) {
  const { data } = await api.get(API.CLASSIFIEDS.MY, { params });
  return data;
}

export async function getPendingClassifieds(params) {
  const { data } = await api.get(API.CLASSIFIEDS.PENDING, { params });
  return data;
}

export async function moderateClassified(id, status, rejectionReason) {
  const { data } = await api.patch(API.CLASSIFIEDS.MODERATE(id), { status, rejectionReason });
  return data;
}

export async function toggleFavorite(id) {
  const { data } = await api.post(API.CLASSIFIEDS.FAVORITE(id));
  return data;
}
