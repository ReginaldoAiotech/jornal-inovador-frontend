import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, FileText } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getAuthorProfile } from '../../services/articleService';
import ArticleCard from '../../components/common/ArticleCard';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { ROUTES } from '../../constants/routes';
import { formatRelativeDate } from '../../utils/formatters';

export default function AuthorPage() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(author?.name ? `${author.name} - Autor` : 'Autor');

  useEffect(() => {
    setLoading(true);
    getAuthorProfile(authorId)
      .then((res) => {
        const data = res?.data || res;
        setAuthor(data?.author);
        setArticles(data?.articles || []);
        setTotal(data?.total || 0);
      })
      .catch(() => setAuthor(null))
      .finally(() => setLoading(false));
  }, [authorId]);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (!author) return <EmptyState title="Autor nao encontrado" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link to={ROUTES.ARTICLES} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar para noticias
      </Link>

      {/* Perfil do autor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900">{author.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> {total} artigo{total !== 1 ? 's' : ''} publicado{total !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Membro desde {formatRelativeDate(author.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Artigos do autor */}
      <h2 className="text-lg font-semibold font-heading text-gray-800 mb-4">Artigos de {author.name}</h2>

      {articles.length === 0 ? (
        <EmptyState title="Nenhum artigo publicado" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
