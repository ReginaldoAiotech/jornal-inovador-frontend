import api from './api';
import { API } from '../constants/api';

export async function getUsers() {
  const { data } = await api.get(API.USERS.BASE);
  return data;
}

export async function getUserById(id) {
  const { data } = await api.get(API.USERS.BY_ID(id));
  return data;
}

export async function createUser(userData) {
  const { data } = await api.post(API.USERS.BASE, userData);
  return data;
}

export async function updateUser(id, userData) {
  const { data } = await api.patch(API.USERS.BY_ID(id), userData);
  return data;
}

export async function deleteUser(id) {
  await api.delete(API.USERS.BY_ID(id));
}

export async function approveUser(id) {
  const { data } = await api.patch(API.USERS.APPROVE(id));
  return data;
}

export async function rejectUser(id) {
  await api.patch(API.USERS.REJECT(id));
}

export async function suspendUser(id) {
  const { data } = await api.patch(API.USERS.BY_ID(id), { isApproved: false });
  return data;
}

export async function grantTrial(id, days = 7) {
  const { data } = await api.patch(API.USERS.GRANT_TRIAL(id, days));
  return data;
}

export async function extendTrial(id, days = 7) {
  const { data } = await api.patch(API.USERS.EXTEND_TRIAL(id, days));
  return data;
}

export async function convertToInternal(id) {
  const { data } = await api.patch(API.USERS.CONVERT_TO_INTERNAL(id));
  return data;
}
