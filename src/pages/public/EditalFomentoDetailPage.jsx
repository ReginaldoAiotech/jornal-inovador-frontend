import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, DollarSign, MapPin, Building2, FileText, AlertTriangle, MessageCircle, Clock, Sparkles, Shield, Info, ChevronRight } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getEditalFomentoById, toggleFavoriteEditalFomento } from '../../services/editalFomentoService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ChatDrawer from '../../components/ui/ChatDrawer';
import FavoriteButton from '../../components/common/FavoriteButton';
import DateDisplay from '../../components/common/DateDisplay';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { ROUTES } from '../../constants/routes';
import { daysUntil, getEffectiveEditalStatus } from '../../utils/formatters';

const STATUS_MAP = {
  ABERTO: { label: 'Aberto', color: 'bg-emerald-500', ring: 'ring-emerald-500/20', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
  ENCERRADO: { label: 'Encerrado', color: 'bg-gray-400', ring: 'ring-gray-400/20', text: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  CONTINUO: { label: 'Fluxo continuo', color: 'bg-violet-500', ring: 'ring-violet-500/20', text: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-400' },
};

function InfoCard({ icon: Icon, label, children, accent = false }) {
  return (
    <div className={`flex items-start gap-3.5 p-4 rounded-xl border ${accent ? 'bg-accent-50/50 border-accent-100' : 'bg-gray-50/80 border-gray-100'}`}>
      <div className={`p-2 rounded-lg ${accent ? 'bg-accent-100' : 'bg-white shadow-sm'}`}>
        <Icon className={`h-4 w-4 ${accent ? 'text-accent-600' : 'text-gray-500'}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <div className="text-sm font-semibold text-gray-900">{children}</div>
      </div>
    </div>
  );
}

function ValueCard({ label, value, highlight = false }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-gradient-to-br from-accent-50 to-accent-100/50 border-accent-200' : 'bg-white border-gray-100 shadow-sm'}`}>
      <p className={`text-xs font-medium mb-1 ${highlight ? 'text-accent-600' : 'text-gray-500'}`}>{label}</p>
      <CurrencyDisplay value={value} className={`text-lg font-bold ${highlight ? 'text-accent-700' : 'text-gray-900'}`} />
    </div>
  );
}

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
  const isClosingSoon = effectiveStatus === 'ABERTO' && days !== null && days > 0 && days <= 7;
  const statusInfo = STATUS_MAP[effectiveStatus] || STATUS_MAP.ABERTO;

  const handleSendMessage = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return 'Em breve conectaremos ao backend de IA para responder suas perguntas sobre este edital. Por enquanto, consulte as informacoes disponiveis na pagina ou acesse o PDF original.';
  };

  const hasFinancialInfo = edital.volumeAporte1 || edital.volumeAporte2 || edital.volumeAporte3 || edital.volumeTotalProjeto;

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20">
          {/* Breadcrumb */}
          <Link
            to={ROUTES.EDITAIS_FOMENTO}
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white/90 transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar para editais
          </Link>

          {/* Status + Meta */}
          <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              {edital.fap && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-bold tracking-wide uppercase">
                  {edital.fap}
                </span>
              )}
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot} ${effectiveStatus === 'ABERTO' ? 'animate-pulse' : ''}`} />
                {statusInfo.label}
              </span>
              {effectiveStatus === 'ABERTO' && days !== null && days > 0 && (
                <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${isClosingSoon ? 'text-red-300' : 'text-white/60'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  {days} dias restantes
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {edital.confiancaExtracao != null && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs text-white/70" title="Confianca da extracao por IA">
                  <Sparkles className="h-3.5 w-3.5" />
                  {Math.round(edital.confiancaExtracao * 100)}% confianca IA
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

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-white mb-3 leading-tight max-w-3xl">
            {edital.tituloChamada}
          </h1>

          {edital.instituicaoFomento && (
            <div className="flex items-center gap-2 text-white/60">
              <Building2 className="h-5 w-5" />
              <span className="text-lg">{edital.instituicaoFomento}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 pb-12">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">

          {/* Main Info Cards */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {edital.dataAbertura && (
                <InfoCard icon={Calendar} label="Data de abertura">
                  <DateDisplay date={edital.dataAbertura} />
                </InfoCard>
              )}
              {edital.prazoSubmissaoFase1 && (
                <InfoCard icon={Calendar} label="Prazo de submissao" accent={isClosingSoon}>
                  <DateDisplay date={edital.prazoSubmissaoFase1} />
                </InfoCard>
              )}
              {edital.estado && (
                <InfoCard icon={MapPin} label="Estado">
                  {edital.estado}
                </InfoCard>
              )}
            </div>

            {/* Financial values */}
            {hasFinancialInfo && (
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  <DollarSign className="h-4 w-4 text-accent-500" />
                  Valores
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {edital.volumeAporte1 && <ValueCard label="Aporte 1" value={edital.volumeAporte1} />}
                  {edital.volumeAporte2 && <ValueCard label="Aporte 2" value={edital.volumeAporte2} />}
                  {edital.volumeAporte3 && <ValueCard label="Aporte 3" value={edital.volumeAporte3} />}
                  {edital.volumeTotalProjeto && <ValueCard label="Volume total do projeto" value={edital.volumeTotalProjeto} highlight />}
                </div>
              </div>
            )}

            {/* Areas de atuacao */}
            {edital.areasAtuacao?.length > 0 && (
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  Areas de atuacao
                </h3>
                <div className="flex flex-wrap gap-2">
                  {edital.areasAtuacao.map((area) => (
                    <span key={area} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium border border-violet-100">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Restricoes */}
            {edital.restricoes && (
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  <Shield className="h-4 w-4 text-red-500" />
                  Restricoes
                </h3>
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {edital.restricoes}
                </div>
              </div>
            )}

            {/* Informacoes gerais */}
            {edital.informacoesGerais && (
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  <Info className="h-4 w-4 text-blue-500" />
                  Informacoes gerais
                </h3>
                <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {edital.informacoesGerais}
                </div>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 sm:px-8 py-5">
            <div className="flex flex-wrap gap-3">
              {edital.linkPdf && (
                <a
                  href={edital.linkPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-primary-500/25 hover:shadow-lg transition-all"
                >
                  <FileText className="h-4 w-4" />
                  Ver PDF do Edital
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              )}
              {edital.paginaLink && (
                <a
                  href={edital.paginaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  Pagina Original
                </a>
              )}
              <button
                onClick={() => setChatOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-accent-500/25 hover:shadow-lg transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                Conversar com IA
              </button>
            </div>
          </div>
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
