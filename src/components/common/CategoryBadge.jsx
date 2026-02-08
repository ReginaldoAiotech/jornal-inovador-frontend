import Badge from '../ui/Badge';
import { ARTICLE_CATEGORY_LABELS, CLASSIFIED_CATEGORY_LABELS } from '../../constants/enums';

const ARTICLE_COLORS = {
  NEWS: 'info',
  REPORT: 'accent',
  INTERVIEW: 'success',
  EDITORIAL: 'warning',
  OPINION: 'danger',
  ANALYSIS: 'default',
};

const CLASSIFIED_COLORS = {
  ESTAGIO: 'info',
  EMPREGO: 'success',
  TECNOLOGIA: 'accent',
  PUBLICACAO_CIENTIFICA: 'warning',
  EVENTO: 'danger',
  EQUIPAMENTO: 'default',
  EDITAL: 'info',
  OUTRO: 'default',
};

export default function CategoryBadge({ category, type = 'article' }) {
  const labels = type === 'article' ? ARTICLE_CATEGORY_LABELS : CLASSIFIED_CATEGORY_LABELS;
  const colors = type === 'article' ? ARTICLE_COLORS : CLASSIFIED_COLORS;

  return (
    <Badge variant={colors[category] || 'default'}>
      {labels[category] || category}
    </Badge>
  );
}
