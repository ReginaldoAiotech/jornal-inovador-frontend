import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import DateDisplay from './DateDisplay';

function SmallArticle({ article }) {
  return (
    <Link to={`/artigos/${article.id}`} className="group flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      {article.featuredImageUrl ? (
        <img
          src={article.featuredImageUrl}
          alt={article.title}
          className="w-20 h-16 object-cover rounded-lg shrink-0"
        />
      ) : (
        <div className="w-20 h-16 rounded-lg bg-primary-50 shrink-0 flex items-center justify-center text-primary-400 text-xs font-bold">
          JI
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
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
      <section className="bg-gray-50 border-b border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-3">
            Jornal O Inovador
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            Noticias, editais e oportunidades para empreendedores e inovadores.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-primary-50/50 to-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artigo principal */}
          <div className="lg:col-span-2">
            {article.featuredImageUrl && (
              <img
                src={article.featuredImageUrl}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl mb-5"
              />
            )}
            <CategoryBadge category={article.category} />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-gray-900 mt-3 mb-3 leading-tight">
              {article.title}
            </h1>
            {article.headline && (
              <p className="text-base text-gray-600 mb-2 font-medium">{article.headline}</p>
            )}
            {article.summary && (
              <p className="text-gray-500 mb-4 line-clamp-3 text-sm">{article.summary}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-5">
              <DateDisplay date={article.publishedAt || article.createdAt} />
            </div>
            <Link
              to={`/artigos/${article.id}`}
              className="inline-flex items-center gap-2 bg-accent-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-accent-600 transition-colors shadow-sm"
            >
              Leia mais <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Artigos laterais */}
          {sideArticles.length > 0 && (
            <div className="hidden lg:flex flex-col border-l border-gray-100 pl-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Mais destaques
              </h3>
              <div className="flex flex-col gap-1 flex-1">
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
