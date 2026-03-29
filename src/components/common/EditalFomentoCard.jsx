import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import DateDisplay from './DateDisplay';
import CurrencyDisplay from './CurrencyDisplay';
import { useAuth } from '../../hooks/useAuth';
import { toggleFavoriteEditalFomento } from '../../services/editalFomentoService';
import { daysUntil, getEffectiveEditalStatus } from '../../utils/formatters';

const STATUS_MAP = {
  ABERTO: { label: 'Aberto', bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  ENCERRADO: { label: 'Encerrado', bar: 'bg-red-400', dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50' },
  CONTINUO: { label: 'Fluxo contínuo', bar: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
};

export default function EditalFomentoCard({ edital, onToggleFavorite }) {
  const { isAuthenticated } = useAuth();
  const effectiveStatus = getEffectiveEditalStatus(edital);
  const days = daysUntil(edital.prazoSubmissaoFase1);
  const isClosingSoon = effectiveStatus === 'ABERTO' && days !== null && days > 0 && days <= 7;
  const statusInfo = STATUS_MAP[effectiveStatus] || STATUS_MAP.ABERTO;

  const description = edital.informacoesGerais || edital.descricao || '';

  return (
    <Link
      to={`/editais-fomento/${edital.id}`}
      className="group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/10"
    >
      {/* Left color bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${statusInfo.bar}`} />

      <div className="flex flex-col flex-1 pl-5 pr-5 pt-5 pb-0">
        {/* Header: FAP badge + status + favorite */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {edital.fap && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-[11px] font-bold tracking-wider uppercase">
                {edital.fap}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
              <span className={`w-[7px] h-[7px] rounded-full ${statusInfo.dot}`} />
              {isClosingSoon ? `Encerra em ${days}d` : statusInfo.label}
            </span>
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

        {/* Title */}
        <h3 className="font-heading font-bold text-primary-800 mb-2 line-clamp-2 text-[15px] leading-snug group-hover:text-primary-600 transition-colors">
          {edital.tituloChamada}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-[13px] text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Institution */}
        {edital.instituicaoFomento && !description && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Building2 className="h-4 w-4 text-gray-300 shrink-0" />
            <span className="truncate">{edital.instituicaoFomento}</span>
          </div>
        )}

        {/* Spacer */}
        <div className="mt-auto" />

        {/* Footer: Value + Date */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 pb-4 mt-2">
          <div>
            <div className="text-[11px] text-gray-400 font-medium">Valor</div>
            {(edital.volumeTotalProjeto || edital.volumeAporte1) ? (
              <CurrencyDisplay value={edital.volumeTotalProjeto || edital.volumeAporte1} className="text-base font-extrabold text-primary-800" />
            ) : (
              <span className="text-sm font-semibold text-gray-400">—</span>
            )}
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-400 font-medium">Encerramento</div>
            {edital.prazoSubmissaoFase1 ? (
              <DateDisplay date={edital.prazoSubmissaoFase1} className={`text-[13px] font-semibold ${isClosingSoon ? 'text-red-600' : 'text-gray-700'}`} />
            ) : (
              <span className="text-sm font-semibold text-gray-400">Contínuo</span>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {edital.areasAtuacao?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-5 pb-4 -mt-1">
          {edital.areasAtuacao.slice(0, 3).map((area) => (
            <span key={area} className="text-[11px] bg-primary-500/[0.07] text-primary-700 px-2.5 py-0.5 rounded font-medium tracking-wide">
              {area}
            </span>
          ))}
          {edital.areasAtuacao.length > 3 && (
            <span className="text-[11px] text-gray-400 px-1 py-0.5">+{edital.areasAtuacao.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  );
}
