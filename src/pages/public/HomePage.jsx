import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getArticles } from '../../services/articleService';
import { getActiveEditais } from '../../services/editalService';
import { getClassifieds } from '../../services/classifiedService';
import { getEditaisFomentoStats } from '../../services/editalFomentoService';
import HeroSection from '../../components/common/HeroSection';
import NewsTicker from '../../components/common/NewsTicker';
import SectionTitle from '../../components/common/SectionTitle';
import ArticleCard from '../../components/common/ArticleCard';
import EditalCard from '../../components/common/EditalCard';
import ClassifiedCard from '../../components/common/ClassifiedCard';
import CategorySection from '../../components/common/CategorySection';
import StatsSection from '../../components/common/StatsSection';
import NewsletterSection from '../../components/common/NewsletterSection';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants/routes';
import { MOCK_ARTICLES, MOCK_CLASSIFIEDS } from '../../constants/mockData';

export default function HomePage() {
  useDocumentTitle(null);
  const [articles, setArticles] = useState([]);
  const [editais, setEditais] = useState([]);
  const [classifieds, setClassifieds] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [artRes, edtRes, clsRes, statsRes] = await Promise.allSettled([
          getArticles({ published: true }),
          getActiveEditais({ limit: 4 }),
          getClassifieds({ limit: 6 }),
          getEditaisFomentoStats(),
        ]);
        // Artigos: usa mock se API retornar vazio
        let artData = [];
        if (artRes.status === 'fulfilled') {
          const data = artRes.value?.data || artRes.value || [];
          artData = Array.isArray(data) ? data : [];
        }
        if (artData.length === 0) artData = MOCK_ARTICLES;
        setArticles(artData);

        // Editais
        if (edtRes.status === 'fulfilled') {
          const data = edtRes.value?.data || edtRes.value || [];
          setEditais(Array.isArray(data) ? data : []);
        }

        // Classificados: usa mock se API retornar vazio
        let clsData = [];
        if (clsRes.status === 'fulfilled') {
          const data = clsRes.value?.data || clsRes.value || [];
          clsData = Array.isArray(data) ? data : [];
        }
        if (clsData.length === 0) clsData = MOCK_CLASSIFIEDS;
        setClassifieds(clsData);

        // Stats
        const sData = statsRes.status === 'fulfilled'
          ? (statsRes.value?.data || statsRes.value)
          : null;
        setStats({
          articles: artData.length || 50,
          editais: sData ? ((sData.total || 0) - (sData.fechados || 0)) : 0,
          classifieds: clsData.length || 20,
          users: 150,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Atualizar stats apos dados carregados
  useEffect(() => {
    if (!loading && stats) {
      setStats((prev) => prev ? {
        ...prev,
        articles: articles.length || prev.articles,
        classifieds: classifieds.length || prev.classifieds,
      } : prev);
    }
  }, [loading, articles.length, classifieds.length]);

  if (loading) return <Spinner size="lg" className="py-20" />;

  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const otherArticles = articles.filter((a) => a.id !== featuredArticle?.id);
  const sideArticles = otherArticles.slice(0, 4);
  const remainingArticles = otherArticles.slice(4, 7);

  return (
    <div>
      {/* Ticker de noticias */}
      <NewsTicker articles={articles.slice(0, 8)} />

      {/* Hero com artigo destaque + laterais */}
      <HeroSection article={featuredArticle} sideArticles={sideArticles} />

      {/* Categorias */}
      <CategorySection />

      {/* Mais artigos */}
      {remainingArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionTitle title="Ultimas noticias" linkTo={ROUTES.ARTICLES} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Editais abertos */}
      {editais.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionTitle title="Editais abertos" linkTo={ROUTES.EDITAIS_FOMENTO} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {editais.map((edital) => (
                <EditalCard key={edital.id} edital={edital} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Numeros */}
      <StatsSection stats={stats} />

      {/* Classificados */}
      {classifieds.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <SectionTitle title="Classificados recentes" linkTo={ROUTES.CLASSIFIEDS} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classifieds.map((c) => (
              <ClassifiedCard key={c.id} classified={c} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}
