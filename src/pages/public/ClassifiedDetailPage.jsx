import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, User } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getClassifiedById } from '../../services/classifiedService';
import CategoryBadge from '../../components/common/CategoryBadge';
import DateDisplay from '../../components/common/DateDisplay';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { ROUTES } from '../../constants/routes';
import { MOCK_CLASSIFIEDS } from '../../constants/mockData';

export default function ClassifiedDetailPage() {
  const { id } = useParams();
  const [classified, setClassified] = useState(null);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(classified?.title || 'Classificado');

  useEffect(() => {
    setLoading(true);
    getClassifiedById(id)
      .then((res) => {
        const data = res?.data || res;
        if (data && data.title) { setClassified(data); return; }
        const mock = MOCK_CLASSIFIEDS.find((c) => c.id === id);
        if (mock) setClassified(mock);
      })
      .catch(() => {
        const mock = MOCK_CLASSIFIEDS.find((c) => c.id === id);
        if (mock) setClassified(mock);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!classified) return <EmptyState title="Classificado nao encontrado" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to={ROUTES.CLASSIFIEDS} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar para classificados
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {classified.imageUrl && (
          <img src={classified.imageUrl} alt={classified.title} className="w-full max-h-[400px] object-cover" />
        )}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <CategoryBadge category={classified.category} type="classified" />
            <DateDisplay date={classified.createdAt} className="text-sm text-gray-500" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-4">
            {classified.title}
          </h1>

          <div className="prose max-w-none mb-8 text-gray-700">
            <p className="whitespace-pre-wrap">{classified.description}</p>
          </div>

          {(classified.city || classified.state || classified.location) && (
            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{[classified.location, classified.city, classified.state].filter(Boolean).join(', ')}</span>
            </div>
          )}

          {(classified.contactName || classified.contactEmail || classified.contactPhone) && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informacoes de contato</h3>
              <div className="space-y-3">
                {classified.contactName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4 text-gray-400" />
                    {classified.contactName}
                  </div>
                )}
                {classified.contactEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${classified.contactEmail}`} className="text-primary-500 hover:underline">
                      {classified.contactEmail}
                    </a>
                  </div>
                )}
                {classified.contactPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {classified.contactPhone}
                  </div>
                )}
                {classified.contactInfo && (
                  <p className="text-sm text-gray-500 mt-2">{classified.contactInfo}</p>
                )}
              </div>
            </div>
          )}

          {classified.expiresAt && (
            <p className="text-sm text-gray-500 mt-6">
              Expira em: <DateDisplay date={classified.expiresAt} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
