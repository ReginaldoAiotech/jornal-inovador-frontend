import Badge from '../ui/Badge';
import { CLASSIFIED_STATUS_LABELS } from '../../constants/enums';

const STATUS_VARIANTS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

export default function StatusBadge({ status }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] || 'default'}>
      {CLASSIFIED_STATUS_LABELS[status] || status}
    </Badge>
  );
}
