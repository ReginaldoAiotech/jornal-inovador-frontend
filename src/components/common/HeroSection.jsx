import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import DateDisplay from './DateDisplay';

function SmallArticle({ article }) {
  return (
    <Link to={`/artigos/${article.id}`} className="group flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
      {article.featuredImageUrl ? (
        <img
          src={article.featuredImageUrl}
          alt={article.title}
          className="w-20 h-16 object-cover rounded-lg shrink-0"
        />
      ) : (
        <div className="w-20 h-16 rounded-lg bg-primary-700 shrink-0 flex items-center justify-center text-primary-400 text-xs font-bold">
          JI
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-accent-300 transition-colors">
          {article.title}
        </h3>
        <DateDisplay date={article.publishedAt || article.createdAt} className="text-xs text-gray-400 mt-1" />
      </div>
    </Link>
  );
}

export default function HeroSection({ article, sideArticles = [] }) {
  if (!article) {
    return (
      <section className="bg-primary-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Jornal O Inovador
          </h1>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto">
            Noticias, editais e oportunidades para empreendedores e inovadores.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      {article.featuredImageUrl && (
        <img
          src={article.featuredImageUrl}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/70" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artigo principal */}
          <div className="lg:col-span-2">
            <CategoryBadge category={article.category} />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mt-3 mb-4 leading-tight">
              {article.title}
            </h1>
            {article.headline && (
              <p className="text-lg text-gray-300 mb-3">{article.headline}</p>
            )}
            {article.summary && (
              <p className="text-gray-400 mb-5 line-clamp-3">{article.summary}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <DateDisplay date={article.publishedAt || article.createdAt} className="text-gray-400" />
            </div>
            <Link
              to={`/artigos/${article.id}`}
              className="inline-flex items-center gap-2 bg-accent-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-600 transition-colors"
            >
              Leia mais <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Artigos laterais */}
          {sideArticles.length > 0 && (
            <div className="hidden lg:flex flex-col border-l border-white/10 pl-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-400 mb-4">
                Mais destaques
              </h3>
              <div className="flex flex-col gap-2 flex-1">
                {sideArticles.slice(0, 4).map((art) => (
                  <SmallArticle key={art.id} article={art} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
