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

// Comentarios de artigos
export async function getArticleComments(articleId, params) {
  const { data } = await api.get(API.ARTICLES.COMMENTS(articleId), { params });
  return data;
}

export async function createArticleComment(articleId, body) {
  const { data } = await api.post(API.ARTICLES.COMMENTS(articleId), body);
  return data;
}

export async function replyArticleComment(commentId, body) {
  const { data } = await api.post(API.ARTICLES.COMMENT_REPLIES(commentId), body);
  return data;
}

export async function updateArticleComment(commentId, body) {
  const { data } = await api.put(API.ARTICLES.COMMENT_BY_ID(commentId), body);
  return data;
}

export async function deleteArticleComment(commentId) {
  await api.delete(API.ARTICLES.COMMENT_BY_ID(commentId));
}

export async function getPendingArticleComments(params) {
  const { data } = await api.get(API.ARTICLES.COMMENTS_PENDING, { params });
  return data;
}

export async function moderateArticleComment(commentId, body) {
  const { data } = await api.patch(API.ARTICLES.COMMENT_MODERATE(commentId), body);
  return data;
}

// Favoritos de artigos
export async function toggleArticleFavorite(articleId) {
  const { data } = await api.post(API.ARTICLES.FAVORITE(articleId));
  return data;
}

export async function getArticleFavorites(params) {
  const { data } = await api.get(API.ARTICLES.FAVORITES, { params });
  return data;
}

// Trending
export async function getTrendingArticles(params) {
  const { data } = await api.get(API.ARTICLES.TRENDING, { params });
  return data;
}

// Autor
export async function getAuthorProfile(authorId, params) {
  const { data } = await api.get(API.ARTICLES.AUTHOR(authorId), { params });
  return data;
}
