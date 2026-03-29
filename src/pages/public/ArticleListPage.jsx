import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
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

export default function ArticleListPage() {
  useDocumentTitle('Noticias');
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    const params = { published: true };
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedCategory !== 'ALL') params.category = selectedCategory;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.order = sortOrder;

    getArticles(params)
      .then((res) => {
        const data = res?.data || res || [];
        setArticles(Array.isArray(data) ? data : []);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, selectedCategory, dateFrom, dateTo, sortBy, sortOrder]);

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  const [availableCategories, setAvailableCategories] = useState(new Set());

  useEffect(() => {
    getArticles({ published: true, limit: 200 })
      .then((res) => {
        const data = res?.data || res || [];
        const cats = new Set();
        (Array.isArray(data) ? data : []).forEach((a) => { if (a.category) cats.add(a.category); });
        setAvailableCategories(cats);
      })
      .catch(() => {});
  }, []);

  const hasActiveFilters = dateFrom || dateTo || sortBy !== 'createdAt' || sortOrder !== 'desc';

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-gray-900 mb-2">Noticias</h1>
        <p className="text-gray-500">Acompanhe as ultimas noticias sobre inovacao, ciencia e tecnologia.</p>
      </div>

      {/* Busca + Filtros */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar noticias..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors',
            showFilters || hasActiveFilters
              ? 'bg-primary-50 text-primary-600 border-primary-200'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary-500" />
          )}
        </button>
      </div>

      {/* Painel de filtros avancados */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Filtros avancados</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-primary-500 hover:underline flex items-center gap-1">
                <X className="h-3 w-3" /> Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data inicio</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data fim</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="createdAt">Data de publicacao</option>
                <option value="views">Mais lidos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ordem</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="desc">Mais recentes</option>
                <option value="asc">Mais antigos</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
        {Object.keys(ArticleCategory).filter((cat) => availableCategories.has(cat)).map((cat) => (
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
      ) : articles.length === 0 ? (
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
