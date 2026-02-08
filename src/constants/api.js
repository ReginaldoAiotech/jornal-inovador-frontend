export const API = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  ARTICLES: {
    BASE: '/articles',
    BY_ID: (id) => `/articles/${id}`,
  },
  EDITAIS: {
    BASE: '/editais',
    ACTIVE: '/editais/active',
    BY_ID: (id) => `/editais/${id}`,
    FAVORITE: (id) => `/editais/${id}/favorite`,
    FAVORITES: '/editais/favorites',
  },
  CLASSIFIEDS: {
    BASE: '/classifieds',
    BY_ID: (id) => `/classifieds/${id}`,
    PENDING: '/classifieds/pending',
    MY: '/classifieds/my',
    MODERATE: (id) => `/classifieds/${id}/moderate`,
    FAVORITE: (id) => `/classifieds/${id}/favorite`,
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
  },
});
