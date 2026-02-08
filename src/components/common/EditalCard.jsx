import { Link } from 'react-router-dom';
import { Calendar, DollarSign, MapPin } from 'lucide-react';
import Badge from '../ui/Badge';
import DateDisplay from './DateDisplay';
import CurrencyDisplay from './CurrencyDisplay';
import { daysUntil } from '../../utils/formatters';

export default function EditalCard({ edital }) {
  const days = daysUntil(edital.closingDate);
  const isOpen = days !== null && days > 0;
  const isClosingSoon = days !== null && days > 0 && days <= 7;

  return (
    <Link
      to={`/editais/${edital.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge variant="accent">{edital.fapAcronym}</Badge>
        {isOpen ? (
          <Badge variant={isClosingSoon ? 'danger' : 'success'}>
            {isClosingSoon ? `Encerra em ${days}d` : 'Aberto'}
          </Badge>
        ) : (
          <Badge variant="default">Encerrado</Badge>
        )}
      </div>
      <h3 className="font-heading font-semibold text-gray-900 mb-2 line-clamp-2">
        {edital.title}
      </h3>
      <p className="text-sm text-gray-500 mb-3">{edital.institutionName}</p>
      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>Encerra: <DateDisplay date={edital.closingDate} /></span>
        </div>
        {edital.amountPerProject && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>Ate <CurrencyDisplay value={edital.amountPerProject} /></span>
          </div>
        )}
        {edital.area && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{edital.area}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
