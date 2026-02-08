import api from './api';
import { API } from '../constants/api';

export async function getArticles(params) {
  const { data } = await api.get(API.ARTICLES.BASE, { params });
  return data;
}

export async function getArticleById(id) {
  const { data } = await api.get(API.ARTICLES.BY_ID(id));
  return data;
}

export async function createArticle(articleData) {
  const { data } = await api.post(API.ARTICLES.BASE, articleData);
  return data;
}

export async function updateArticle(id, articleData) {
  const { data } = await api.patch(API.ARTICLES.BY_ID(id), articleData);
  return data;
}

export async function deleteArticle(id) {
  await api.delete(API.ARTICLES.BY_ID(id));
}
