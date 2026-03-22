import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getArticles, getTrendingArticles } from '../../services/articleService';
import { getEditaisFomento, getEditaisFomentoStats } from '../../services/editalFomentoService';
import HeroSection from '../../components/common/HeroSection';
import NewsTicker from '../../components/common/NewsTicker';
import SectionTitle from '../../components/common/SectionTitle';
import ArticleCard from '../../components/common/ArticleCard';
import CategorySection from '../../components/common/CategorySection';
import StatsSection from '../../components/common/StatsSection';
import NewsletterSection from '../../components/common/NewsletterSection';
import CategoryBadge from '../../components/common/CategoryBadge';
import DateDisplay from '../../components/common/DateDisplay';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants/routes';
import { readingTime, daysUntil } from '../../utils/formatters';
import {
  Eye, Clock, TrendingUp, Calendar, ArrowRight, Lock,
} from 'lucide-react';

export default function HomePage() {
  useDocumentTitle(null);
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState([]);
  const [trending, setTrending] = useState([]);
  const [editais, setEditais] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [artRes, trendRes, edtRes, statsRes] = await Promise.allSettled([
          getArticles({ published: true, limit: 12 }),
          getTrendingArticles({ limit: 5, days: 30 }),
          getEditaisFomento({ limit: 100, status: 'ABERTO' }),
          getEditaisFomentoStats(),
        ]);

        // Artigos
        if (artRes.status === 'fulfilled') {
          const data = artRes.value?.data || artRes.value || [];
          setArticles(Array.isArray(data) ? data : []);
        }

        // Trending
        if (trendRes.status === 'fulfilled') {
          const data = trendRes.value?.data || trendRes.value || [];
          setTrending(Array.isArray(data) ? data : []);
        }

        // Editais - ordenar por proximidade de vencimento
        if (edtRes.status === 'fulfilled') {
          const data = edtRes.value?.data || edtRes.value || [];
          const list = Array.isArray(data) ? data : [];
          const now = new Date();
          const sorted = list
            .filter((e) => {
              if (!e.data_submissao) return true;
              return new Date(e.data_submissao) > now;
            })
            .sort((a, b) => {
              const dateA = a.data_submissao ? new Date(a.data_submissao) : new Date('2099-12-31');
              const dateB = b.data_submissao ? new Date(b.data_submissao) : new Date('2099-12-31');
              return dateA - dateB;
            })
            .slice(0, 4);
          setEditais(sorted);
        }

        // Stats
        const sData = statsRes.status === 'fulfilled'
          ? (statsRes.value?.data || statsRes.value)
          : null;
        const artData = artRes.status === 'fulfilled'
          ? (Array.isArray(artRes.value?.data || artRes.value) ? (artRes.value?.data || artRes.value) : [])
          : [];
        setStats({
          articles: Array.isArray(artData) ? artData.length : 0,
          editais: sData ? ((sData.total || 0) - (sData.fechados || 0)) : 0,
          classifieds: 0,
          users: sData?.users || 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Spinner size="lg" className="py-20" />;

  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const otherArticles = articles.filter((a) => a.id !== featuredArticle?.id);
  const sideArticles = otherArticles.slice(0, 4);
  const gridArticles = otherArticles.slice(4, 10);

  return (
    <div>
      {/* Ticker de noticias */}
      <NewsTicker articles={articles.slice(0, 8)} />

      {/* Hero com artigo destaque + laterais */}
      <HeroSection article={featuredArticle} sideArticles={sideArticles} />

      {/* === Noticias + Sidebar Mais Lidos === */}
      {(gridArticles.length > 0 || trending.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            {/* Coluna principal - Ultimas noticias */}
            {gridArticles.length > 0 && (
              <div>
                <SectionTitle title="Ultimas noticias" linkTo={ROUTES.ARTICLES} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar - Mais lidos */}
            {trending.length > 0 && (
              <aside className="lg:border-l lg:border-gray-200 lg:pl-8">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-5 w-5 text-accent-500" />
                  <h3 className="text-lg font-bold font-heading text-gray-900">Mais lidos</h3>
                </div>
                <div className="space-y-4">
                  {trending.map((article, index) => (
                    <Link
                      key={article.id}
                      to={`/artigos/${article.id}`}
                      className="group flex gap-3 items-start"
                    >
                      <span className="text-2xl font-black text-accent-400/50 leading-none w-8 shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-500 transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <CategoryBadge category={article.category} size="sm" />
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {article.views || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </section>
      )}

      {/* === Editais proximos a vencer - preview publico === */}
      {editais.length > 0 && (
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-accent-400" />
                <h2 className="text-2xl font-bold font-heading text-white">Editais proximos a vencer</h2>
              </div>
              {isAuthenticated ? (
                <Link
                  to={ROUTES.EDITAIS_FOMENTO}
                  className="flex items-center gap-1 text-sm text-accent-400 hover:text-accent-300 transition-colors"
                >
                  Ver todos <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-accent-400 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" /> Faca login para acessar
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {editais.map((edital) => {
                const days = daysUntil(edital.data_submissao);
                const isClosingSoon = days !== null && days > 0 && days <= 7;

                return (
                  <div
                    key={edital.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant="accent">{edital.sigla_fap || 'FAP'}</Badge>
                      {days !== null && days > 0 ? (
                        <Badge variant={isClosingSoon ? 'danger' : 'success'}>
                          {isClosingSoon ? `${days}d restantes` : `${days}d`}
                        </Badge>
                      ) : (
                        <Badge variant="default">Fluxo continuo</Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">
                      {edital.titulo}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-1">
                      {edital.instituicao}
                    </p>
                    {edital.data_submissao && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Encerra: <DateDisplay date={edital.data_submissao} /></span>
                      </div>
                    )}
                    {!isAuthenticated && (
                      <Link
                        to={ROUTES.REGISTER}
                        className="mt-3 block text-center text-xs text-accent-400 hover:text-accent-300 border border-accent-400/30 rounded-lg py-1.5 transition-colors"
                      >
                        Cadastre-se para ver detalhes
                      </Link>
                    )}
                    {isAuthenticated && (
                      <Link
                        to={`/editais-fomento/${edital.id}`}
                        className="mt-3 block text-center text-xs text-accent-400 hover:text-accent-300 border border-accent-400/30 rounded-lg py-1.5 transition-colors"
                      >
                        Ver edital completo
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Categorias */}
      <CategorySection />

      {/* Numeros */}
      <StatsSection stats={stats} />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}
