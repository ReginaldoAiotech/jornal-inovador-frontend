import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getArticleById, getArticles } from '../../services/articleService';
import CategoryBadge from '../../components/common/CategoryBadge';
import DateDisplay from '../../components/common/DateDisplay';
import ArticleCard from '../../components/common/ArticleCard';
import ShareButtons from '../../components/common/ShareButtons';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { ROUTES } from '../../constants/routes';
import { readingTime } from '../../utils/formatters';
import { MOCK_ARTICLES } from '../../constants/mockData';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useDocumentTitle(article?.title || 'Noticia');

  useEffect(() => {
    setLoading(true);
    setRelated([]);
    getArticleById(id)
      .then((res) => {
        const data = res?.data || res;
        if (data && data.title) {
          setArticle(data);
          return data;
        }
        // Fallback para mock
        const mock = MOCK_ARTICLES.find((a) => a.id === id);
        if (mock) { setArticle(mock); return mock; }
        setError(true);
        return null;
      })
      .catch(() => {
        // Tentar encontrar no mock
        const mock = MOCK_ARTICLES.find((a) => a.id === id);
        if (mock) { setArticle(mock); return mock; }
        setError(true);
        return null;
      })
      .then((data) => {
        if (!data?.category) return;
        // Buscar relacionadas: tenta API, fallback para mock
        getArticles({ published: true })
          .then((allRes) => {
            let all = allRes?.data || allRes || [];
            all = Array.isArray(all) ? all : [];
            if (all.length === 0) all = MOCK_ARTICLES;
            setRelated(
              all.filter((a) => a.id !== data.id && a.category === data.category).slice(0, 3)
            );
          })
          .catch(() => {
            setRelated(
              MOCK_ARTICLES.filter((a) => a.id !== data.id && a.category === data.category).slice(0, 3)
            );
          });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" className="py-20" />;
  if (error || !article) return <EmptyState title="Noticia nao encontrada" />;

  const minutes = readingTime(article.content);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to={ROUTES.ARTICLES} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar para noticias
      </Link>

      <article>
        {/* Imagem de capa */}
        {article.featuredImageUrl && (
          <figure className="mb-6">
            <img
              src={article.featuredImageUrl}
              alt={article.title}
              className="w-full rounded-xl object-cover max-h-[500px]"
            />
            {(article.imageCaption || article.imageCredit) && (
              <figcaption className="mt-2 text-sm text-gray-500">
                {article.imageCaption}
                {article.imageCredit && <span className="ml-1">({article.imageCredit})</span>}
              </figcaption>
            )}
          </figure>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <CategoryBadge category={article.category} />
          <DateDisplay date={article.publishedAt || article.createdAt} className="text-sm text-gray-500" />
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Clock className="h-3.5 w-3.5" /> {minutes} min de leitura
          </span>
        </div>

        {/* Titulo */}
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-3 leading-tight">
          {article.title}
        </h1>

        {/* Subtitulo */}
        {article.headline && (
          <h2 className="text-xl text-gray-600 font-heading mb-4">{article.headline}</h2>
        )}

        {/* Resumo */}
        {article.summary && (
          <blockquote className="text-lg text-gray-700 border-l-4 border-accent-500 pl-4 mb-6 italic bg-accent-50 py-3 pr-4 rounded-r-lg">
            {article.summary}
          </blockquote>
        )}

        {/* Autor + Share */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 mb-8 border-y border-gray-200">
          {article.author ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{article.author.name}</p>
                <DateDisplay date={article.publishedAt || article.createdAt} className="text-xs text-gray-500" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Redacao O Inovador</p>
                <DateDisplay date={article.publishedAt || article.createdAt} className="text-xs text-gray-500" />
              </div>
            </div>
          )}
          <ShareButtons title={article.title} />
        </div>

        {/* Conteudo */}
        <div
          className="prose prose-lg max-w-none mb-8 prose-headings:font-heading prose-a:text-primary-500 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.keywords?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-200 mb-8">
            <span className="text-xs text-gray-400 mr-1 self-center">Tags:</span>
            {article.keywords.map((kw) => (
              <Badge key={kw} variant="default">{kw}</Badge>
            ))}
          </div>
        )}

        {/* Share bottom */}
        <div className="flex justify-center py-6 border-t border-gray-200 mb-8">
          <ShareButtons title={article.title} />
        </div>
      </article>

      {/* Noticias relacionadas */}
      {related.length > 0 && (
        <section className="pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold font-heading text-gray-900 mb-6">Noticias relacionadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
