import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, DollarSign, MapPin } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getEditalById, toggleFavorite } from '../../services/editalService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import FavoriteButton from '../../components/common/FavoriteButton';
import DateDisplay from '../../components/common/DateDisplay';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { ROUTES } from '../../constants/routes';
import { daysUntil } from '../../utils/formatters';

export default function EditalDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [edital, setEdital] = useState(null);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(edital?.title || 'Edital');

  useEffect(() => {
    setLoading(true);
    getEditalById(id)
      .then((res) => setEdital(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!edital) return <EmptyState title="Edital nao encontrado" />;

  const days = daysUntil(edital.closingDate);
  const isOpen = days !== null && days > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to={ROUTES.EDITAIS} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar para editais
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Badge variant="accent">{edital.fapAcronym}</Badge>
            <Badge variant={isOpen ? 'success' : 'default'}>
              {isOpen ? `Aberto (${days} dias)` : 'Encerrado'}
            </Badge>
          </div>
          {isAuthenticated && (
            <FavoriteButton
              isFavorited={edital.isFavorited}
              onClick={() => toggleFavorite(id)}
            />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-2">
          {edital.title}
        </h1>
        <p className="text-gray-600 mb-6">{edital.institutionName}</p>

        {edital.description && (
          <div className="prose max-w-none mb-8 text-gray-700" dangerouslySetInnerHTML={{ __html: edital.description }} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Abertura</p>
              <DateDisplay date={edital.openingDate} className="text-sm font-medium" />
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Encerramento</p>
              <DateDisplay date={edital.closingDate} className="text-sm font-medium" />
            </div>
          </div>
          {edital.totalAmount && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Valor total</p>
                <CurrencyDisplay value={edital.totalAmount} className="text-sm font-medium" />
              </div>
            </div>
          )}
          {edital.amountPerProject && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Por projeto</p>
                <CurrencyDisplay value={edital.amountPerProject} className="text-sm font-medium" />
              </div>
            </div>
          )}
          {edital.area && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Area</p>
                <p className="text-sm font-medium">{edital.area}</p>
              </div>
            </div>
          )}
        </div>

        {edital.researchAreas?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Areas de pesquisa</h3>
            <div className="flex flex-wrap gap-2">
              {edital.researchAreas.map((area) => (
                <Badge key={area}>{area}</Badge>
              ))}
            </div>
          </div>
        )}

        {edital.editalUrl && (
          <a href={edital.editalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <ExternalLink className="h-4 w-4" /> Acessar Edital
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
