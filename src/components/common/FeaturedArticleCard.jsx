import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import DateDisplay from './DateDisplay';
import { readingTime } from '../../utils/formatters';

export default function FeaturedArticleCard({ article }) {
  if (!article) return null;

  const minutes = readingTime(article.content || article.summary);

  return (
    <Link
      to={`/artigos/${article.id}`}
      className="group grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {article.featuredImageUrl ? (
        <div className="aspect-video md:aspect-auto md:h-full overflow-hidden">
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-video md:aspect-auto md:h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center min-h-[240px]">
          <span className="text-primary-400 text-6xl font-heading font-bold">JI</span>
        </div>
      )}
      <div className="p-6 md:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={article.category} />
          <DateDisplay date={article.publishedAt || article.createdAt} relative className="text-xs text-gray-500" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold font-heading text-gray-900 mb-3 group-hover:text-primary-500 transition-colors line-clamp-3">
          {article.title}
        </h2>
        {article.headline && (
          <p className="text-gray-600 mb-2 line-clamp-1">{article.headline}</p>
        )}
        {article.summary && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-3">{article.summary}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{minutes} min de leitura</span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 group-hover:text-primary-600 transition-colors">
            Ler noticia <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
