import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Heart } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getArticleById, getArticles, toggleArticleFavorite } from '../../services/articleService';
import toast from 'react-hot-toast';
import CategoryBadge from '../../components/common/CategoryBadge';
import DateDisplay from '../../components/common/DateDisplay';
import ArticleCard from '../../components/common/ArticleCard';
import ShareButtons from '../../components/common/ShareButtons';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ArticleCommentSection from '../../components/common/ArticleCommentSection';
import ImageGallery from '../../components/common/ImageGallery';
import { ROUTES } from '../../constants/routes';
import { readingTime } from '../../utils/formatters';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

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
        setError(true);
        return null;
      })
      .catch(() => {
        setError(true);
        return null;
      })
      .then((data) => {
        if (!data?.category) return;
        getArticles({ published: true })
          .then((allRes) => {
            let all = allRes?.data || allRes || [];
            all = Array.isArray(all) ? all : [];
            setRelated(
              all.filter((a) => a.id !== data.id && a.category === data.category).slice(0, 3)
            );
          })
          .catch(() => setRelated([]));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await toggleArticleFavorite(id);
      setIsFavorited(res?.favorited ?? !isFavorited);
      toast.success(res?.favorited ? 'Artigo favoritado!' : 'Removido dos favoritos');
    } catch {
      toast.error('Erro ao favoritar');
    }
  };

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
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 leading-tight">
            {article.title}
          </h1>
          {isAuthenticated && (
            <button
              onClick={handleToggleFavorite}
              className="shrink-0 mt-1 p-2 rounded-full hover:bg-red-50 transition-colors"
              title={isFavorited ? 'Remover dos favoritos' : 'Favoritar'}
            >
              <Heart className={`h-6 w-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          )}
        </div>

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
              <Link to={`/autor/${article.author.id || article.authorId}`} className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center hover:bg-primary-200 transition-colors">
                <User className="h-5 w-5" />
              </Link>
              <div>
                <Link to={`/autor/${article.author.id || article.authorId}`} className="text-sm font-medium text-gray-900 hover:text-primary-500 transition-colors">
                  {article.author.name}
                </Link>
                <DateDisplay date={article.publishedAt || article.createdAt} className="text-xs text-gray-500" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Redacao Conex</p>
                <DateDisplay date={article.publishedAt || article.createdAt} className="text-xs text-gray-500" />
              </div>
            </div>
          )}
          <ShareButtons title={article.title} />
        </div>

        {/* Conteudo */}
        <div
          className="article-content max-w-none mb-8
            text-[17px] leading-[1.8] text-gray-800
            [&>p]:mb-5 [&>p]:text-justify [&>p]:hyphens-auto
            [&>h2]:text-2xl [&>h2]:md:text-3xl [&>h2]:font-bold [&>h2]:font-heading [&>h2]:text-gray-900 [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:leading-tight
            [&>h3]:text-xl [&>h3]:font-bold [&>h3]:font-heading [&>h3]:text-gray-900 [&>h3]:mt-8 [&>h3]:mb-3
            [&>blockquote]:my-8 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:border-l-4 [&>blockquote]:border-primary-500 [&>blockquote]:bg-primary-50/50 [&>blockquote]:italic [&>blockquote]:text-xl [&>blockquote]:font-heading [&>blockquote]:text-primary-900 [&>blockquote]:rounded-r-lg
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5 [&>ul]:space-y-2
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-5 [&>ol]:space-y-2
            [&_strong]:font-bold [&_strong]:text-gray-900
            [&_em]:italic
            [&_img]:rounded-lg [&_img]:my-6
            [&_a]:text-primary-500 [&_a]:underline [&_a]:decoration-primary-300 [&_a]:underline-offset-2 [&_a]:font-medium [&_a]:hover:text-primary-600 [&_a]:transition-colors"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Galeria de imagens */}
        <ImageGallery images={article.gallery} />

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

        {/* Comentarios */}
        <ArticleCommentSection articleId={id} />
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
