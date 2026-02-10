import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, DollarSign, MapPin, Building2, FileText, AlertTriangle, MessageCircle } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getEditalFomentoById, toggleFavoriteEditalFomento } from '../../services/editalFomentoService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import ChatDrawer from '../../components/ui/ChatDrawer';
import FavoriteButton from '../../components/common/FavoriteButton';
import DateDisplay from '../../components/common/DateDisplay';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { ROUTES } from '../../constants/routes';
import { daysUntil, getEffectiveEditalStatus } from '../../utils/formatters';

const STATUS_MAP = {
  ABERTO: { label: 'Aberto', variant: 'success' },
  ENCERRADO: { label: 'Encerrado', variant: 'default' },
  CONTINUO: { label: 'Fluxo continuo', variant: 'info' },
};

export default function EditalFomentoDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [edital, setEdital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useDocumentTitle(edital?.tituloChamada || 'Edital');

  useEffect(() => {
    setLoading(true);
    getEditalFomentoById(id)
      .then(setEdital)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!edital) return <EmptyState title="Edital nao encontrado" />;

  const effectiveStatus = getEffectiveEditalStatus(edital);
  const days = daysUntil(edital.prazoSubmissaoFase1);
  const statusInfo = STATUS_MAP[effectiveStatus] || STATUS_MAP.ABERTO;

  // TODO: substituir pelo endpoint real de chat com IA
  const handleSendMessage = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return 'Em breve conectaremos ao backend de IA para responder suas perguntas sobre este edital. Por enquanto, consulte as informacoes disponiveis na pagina ou acesse o PDF original.';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to={ROUTES.EDITAIS_FOMENTO} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar para editais
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {edital.fap && <Badge variant="accent">{edital.fap}</Badge>}
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {effectiveStatus === 'ABERTO' && days !== null && days > 0 && (
              <span className="text-sm text-gray-500">{days} dias restantes</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {edital.confiancaExtracao != null && (
              <div className="flex items-center gap-1 text-xs text-gray-400" title="Confianca da extracao por IA">
                <AlertTriangle className="h-3.5 w-3.5" />
                {Math.round(edital.confiancaExtracao * 100)}% confianca
              </div>
            )}
            {isAuthenticated && (
              <FavoriteButton
                isFavorited={edital.isFavorited}
                onClick={() => toggleFavoriteEditalFomento(edital.id)}
              />
            )}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 mb-2">
          {edital.tituloChamada}
        </h1>

        {edital.instituicaoFomento && (
          <div className="flex items-center gap-2 text-gray-600 mb-6">
            <Building2 className="h-5 w-5 text-gray-400" />
            <span>{edital.instituicaoFomento}</span>
          </div>
        )}

        {/* Informacoes principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {edital.dataAbertura && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Abertura</p>
                <DateDisplay date={edital.dataAbertura} className="text-sm font-medium" />
              </div>
            </div>
          )}
          {edital.prazoSubmissaoFase1 && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Prazo de submissao</p>
                <DateDisplay date={edital.prazoSubmissaoFase1} className="text-sm font-medium" />
              </div>
            </div>
          )}
          {edital.estado && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <p className="text-sm font-medium">{edital.estado}</p>
              </div>
            </div>
          )}
        </div>

        {/* Valores financeiros */}
        {(edital.volumeAporte1 || edital.volumeAporte2 || edital.volumeAporte3 || edital.volumeTotalProjeto) && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Valores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {edital.volumeAporte1 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">Aporte 1</p>
                  <CurrencyDisplay value={edital.volumeAporte1} className="text-sm font-semibold text-green-700" />
                </div>
              )}
              {edital.volumeAporte2 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">Aporte 2</p>
                  <CurrencyDisplay value={edital.volumeAporte2} className="text-sm font-semibold text-green-700" />
                </div>
              )}
              {edital.volumeAporte3 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600">Aporte 3</p>
                  <CurrencyDisplay value={edital.volumeAporte3} className="text-sm font-semibold text-green-700" />
                </div>
              )}
              {edital.volumeTotalProjeto && (
                <div className="p-3 bg-accent-50 rounded-lg">
                  <p className="text-xs text-accent-600">Volume total do projeto</p>
                  <CurrencyDisplay value={edital.volumeTotalProjeto} className="text-sm font-semibold text-accent-700" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Areas de atuacao */}
        {edital.areasAtuacao?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Areas de atuacao</h3>
            <div className="flex flex-wrap gap-2">
              {edital.areasAtuacao.map((area) => (
                <Badge key={area}>{area}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Restricoes */}
        {edital.restricoes && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Restricoes</h3>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
              {edital.restricoes}
            </div>
          </div>
        )}

        {/* Informacoes gerais */}
        {edital.informacoesGerais && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Informacoes gerais</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
              {edital.informacoesGerais}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          {edital.linkPdf && (
            <a href={edital.linkPdf} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg">
                <FileText className="h-4 w-4" /> Ver PDF do Edital
              </Button>
            </a>
          )}
          {edital.paginaLink && (
            <a href={edital.paginaLink} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="lg">
                <ExternalLink className="h-4 w-4" /> Pagina Original
              </Button>
            </a>
          )}
          <Button variant="accent" size="lg" onClick={() => setChatOpen(true)}>
            <MessageCircle className="h-4 w-4" /> Conversar com IA
          </Button>
        </div>
      </div>

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Assistente IA"
        initialMessage={`Ola! Posso te ajudar a entender o edital "${edital.tituloChamada}". O que voce gostaria de saber?`}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
