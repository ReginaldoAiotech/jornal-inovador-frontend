import api from './api';
import { API } from '../constants/api';

export async function login(email, password) {
  const { data } = await api.post(API.AUTH.LOGIN, { email, password });
  return data;
}

export async function register(name, email, password) {
  const { data } = await api.post(API.AUTH.REGISTER, { name, email, password });
  return data;
}

export async function registerTrial(payload) {
  const { data } = await api.post(API.AUTH.REGISTER_TRIAL, payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get(API.AUTH.ME);
  return data;
}
