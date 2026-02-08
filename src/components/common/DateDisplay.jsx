import { formatDate, formatRelativeDate } from '../../utils/formatters';

export default function DateDisplay({ date, relative = false, className }) {
  if (!date) return null;
  return (
    <time dateTime={date} className={className}>
      {relative ? formatRelativeDate(date) : formatDate(date)}
    </time>
  );
}
