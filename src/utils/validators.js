export function validateEmail(email) {
  if (!email) return 'E-mail e obrigatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'E-mail invalido';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Senha e obrigatoria';
  if (password.length < 6) return 'Senha deve ter no minimo 6 caracteres';
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} e obrigatorio`;
  }
  return null;
}

export function validateUrl(url) {
  if (!url) return null;
  try {
    new URL(url);
    return null;
  } catch {
    return 'URL invalida';
  }
}
