import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getArticles, getTrendingArticles } from '../../services/articleService';
import { getEditaisFomento, getEditaisFomentoStats } from '../../services/editalFomentoService';
import { getEffectiveEditalStatus } from '../../utils/formatters';
import HeroSection from '../../components/common/HeroSection';
import NewsTicker from '../../components/common/NewsTicker';
import SectionTitle from '../../components/common/SectionTitle';
import ArticleCard from '../../components/common/ArticleCard';
import EditalFomentoCard from '../../components/common/EditalFomentoCard';
import CategorySection from '../../components/common/CategorySection';
import StatsSection from '../../components/common/StatsSection';
import NewsletterSection from '../../components/common/NewsletterSection';
import CategoryBadge from '../../components/common/CategoryBadge';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants/routes';
import {
  Eye, TrendingUp, Calendar, ArrowRight, Lock,
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
          const in15days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
          const sorted = list
            .filter((e) => {
              const status = getEffectiveEditalStatus(e);
              if (status !== 'ABERTO') return false;
              if (!e.prazoSubmissaoFase1) return false;
              const deadline = new Date(e.prazoSubmissaoFase1);
              return deadline > now && deadline <= in15days;
            })
            .sort((a, b) => {
              return new Date(a.prazoSubmissaoFase1) - new Date(b.prazoSubmissaoFase1);
            })
            .slice(0, 3);
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

      {/* === Editais proximos a vencer === */}
      {editais.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-accent-500" />
                <h2 className="text-2xl font-bold font-heading text-gray-900">Editais proximos a vencer</h2>
              </div>
              {isAuthenticated ? (
                <Link
                  to={ROUTES.EDITAIS_FOMENTO}
                  className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Ver todos os editais <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  to={ROUTES.REGISTER}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" /> Cadastre-se para ver todos
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {editais.map((edital) => (
                <EditalFomentoCard key={edital.id} edital={edital} />
              ))}
            </div>

            {!isAuthenticated && (
              <div className="mt-8 text-center bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-gray-600 mb-3">
                  Cadastre-se gratuitamente para acessar todos os editais, classificados e cursos.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    to={ROUTES.REGISTER}
                    className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm"
                  >
                    Criar conta gratuita
                  </Link>
                  <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-2 text-gray-600 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm border border-gray-300"
                  >
                    Ja tenho conta
                  </Link>
                </div>
              </div>
            )}
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
