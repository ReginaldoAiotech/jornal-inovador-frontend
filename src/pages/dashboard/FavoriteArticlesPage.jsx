import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePagination } from '../../hooks/usePagination';
import { getArticleFavorites } from '../../services/articleService';
import ArticleCard from '../../components/common/ArticleCard';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Heart } from 'lucide-react';

export default function FavoriteArticlesPage() {
  useDocumentTitle('Artigos Favoritos');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, totalPages, setPage, setTotal } = usePagination(1, 12);

  useEffect(() => {
    setLoading(true);
    getArticleFavorites({ page, limit: 12 })
      .then((res) => {
        setArticles(res?.data || []);
        setTotal(res?.total || 0);
      })
      .catch(() => {
        setArticles([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, setTotal]);

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Artigos Favoritos</h1>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : articles.length === 0 ? (
        <EmptyState icon={Heart} title="Nenhum artigo favorito" description="Favorite artigos para acompanha-los aqui." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
