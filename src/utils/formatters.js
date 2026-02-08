export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `ha ${diffMin} min`;
  if (diffHours < 24) return `ha ${diffHours}h`;
  if (diffDays < 7) return `ha ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  return formatDate(dateStr);
}

export function formatCurrency(value) {
  if (value == null) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trimEnd() + '...';
}

export function readingTime(content) {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target - now;
  return Math.ceil(diffMs / 86400000);
}

/**
 * Retorna o status efetivo do edital.
 * Se o status e ABERTO mas o prazo ja venceu, retorna ENCERRADO.
 */
export function getEffectiveEditalStatus(edital) {
  if (!edital) return 'ENCERRADO';
  if (edital.status === 'CONTINUO') return 'CONTINUO';
  if (edital.status === 'ABERTO') {
    if (!edital.prazoSubmissaoFase1) return 'CONTINUO';
    const days = daysUntil(edital.prazoSubmissaoFase1);
    if (days !== null && days < 0) return 'ENCERRADO';
  }
  return edital.status || 'ABERTO';
}
