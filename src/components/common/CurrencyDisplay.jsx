import { formatCurrency } from '../../utils/formatters';

export default function CurrencyDisplay({ value, className }) {
  if (value == null) return null;
  return <span className={className}>{formatCurrency(value)}</span>;
}
