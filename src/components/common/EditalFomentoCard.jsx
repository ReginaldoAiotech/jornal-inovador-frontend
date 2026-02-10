import { Link } from 'react-router-dom';
import { Calendar, DollarSign, MapPin, Building2 } from 'lucide-react';
import Badge from '../ui/Badge';
import FavoriteButton from './FavoriteButton';
import DateDisplay from './DateDisplay';
import CurrencyDisplay from './CurrencyDisplay';
import { useAuth } from '../../hooks/useAuth';
import { toggleFavoriteEditalFomento } from '../../services/editalFomentoService';
import { daysUntil, getEffectiveEditalStatus } from '../../utils/formatters';

const STATUS_MAP = {
  ABERTO: { label: 'Aberto', variant: 'success' },
  ENCERRADO: { label: 'Encerrado', variant: 'default' },
  CONTINUO: { label: 'Fluxo continuo', variant: 'info' },
};

export default function EditalFomentoCard({ edital, onToggleFavorite }) {
  const { isAuthenticated } = useAuth();
  const effectiveStatus = getEffectiveEditalStatus(edital);
  const days = daysUntil(edital.prazoSubmissaoFase1);
  const isClosingSoon = effectiveStatus === 'ABERTO' && days !== null && days > 0 && days <= 7;
  const statusInfo = STATUS_MAP[effectiveStatus] || STATUS_MAP.ABERTO;

  return (
    <Link
      to={`/editais-fomento/${edital.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {edital.fap && <Badge variant="accent">{edital.fap}</Badge>}
          <Badge variant={isClosingSoon ? 'danger' : statusInfo.variant}>
            {isClosingSoon ? `Encerra em ${days}d` : statusInfo.label}
          </Badge>
        </div>
        {isAuthenticated && (
          <FavoriteButton
            isFavorited={edital.isFavorited}
            onClick={async () => {
              await toggleFavoriteEditalFomento(edital.id);
              onToggleFavorite?.(edital.id);
            }}
          />
        )}
      </div>

      <h3 className="font-heading font-semibold text-gray-900 mb-2 line-clamp-2">
        {edital.tituloChamada}
      </h3>

      {edital.instituicaoFomento && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="truncate">{edital.instituicaoFomento}</span>
        </div>
      )}

      <div className="space-y-1.5 text-sm text-gray-600">
        {edital.prazoSubmissaoFase1 && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Prazo: <DateDisplay date={edital.prazoSubmissaoFase1} /></span>
          </div>
        )}
        {edital.volumeTotalProjeto && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>Ate <CurrencyDisplay value={edital.volumeTotalProjeto} /></span>
          </div>
        )}
        {edital.estado && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{edital.estado}</span>
          </div>
        )}
      </div>

      {edital.areasAtuacao?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {edital.areasAtuacao.slice(0, 3).map((area) => (
            <span key={area} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {area}
            </span>
          ))}
          {edital.areasAtuacao.length > 3 && (
            <span className="text-xs text-gray-400">+{edital.areasAtuacao.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  );
}
