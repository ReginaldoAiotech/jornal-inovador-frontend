import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce } from '../../hooks/useDebounce';
import { getArticles } from '../../services/articleService';
import FeaturedArticleCard from '../../components/common/FeaturedArticleCard';
import ArticleCard from '../../components/common/ArticleCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '../../constants/enums';
import { cn } from '../../utils/cn';
import { MOCK_ARTICLES } from '../../constants/mockData';

export default function ArticleListPage() {
  useDocumentTitle('Noticias');
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    getArticles({ published: true })
      .then((res) => {
        const data = res?.data || res || [];
        const list = Array.isArray(data) ? data : [];
        setArticles(list.length > 0 ? list : MOCK_ARTICLES);
      })
      .catch(() => setArticles(MOCK_ARTICLES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter((a) => {
    if (selectedCategory !== 'ALL' && a.category !== selectedCategory) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.headline?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const featuredArticle = filtered[0];
  const otherArticles = filtered.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-gray-900 mb-2">Noticias</h1>
        <p className="text-gray-500">Acompanhe as ultimas noticias sobre inovacao, ciencia e tecnologia.</p>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar noticias..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        />
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
            selectedCategory === 'ALL'
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          )}
        >
          Todas
        </button>
        {Object.keys(ArticleCategory).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
              selectedCategory === cat
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            )}
          >
            {ARTICLE_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Conteudo */}
      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhuma noticia encontrada" description="Tente ajustar os filtros ou a busca." />
      ) : (
        <>
          {/* Destaque */}
          <div className="mb-8">
            <FeaturedArticleCard article={featuredArticle} />
          </div>

          {/* Grid */}
          {otherArticles.length > 0 && (
            <>
              <h2 className="text-lg font-semibold font-heading text-gray-800 mb-4">Mais noticias</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
