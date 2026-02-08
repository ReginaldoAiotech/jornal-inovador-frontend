import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import DateDisplay from './DateDisplay';
import { truncateText, readingTime } from '../../utils/formatters';

export default function ArticleCard({ article }) {
  const minutes = readingTime(article.content || article.summary);

  return (
    <Link
      to={`/artigos/${article.id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {article.featuredImageUrl ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-primary-400 text-4xl font-heading font-bold">JI</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge category={article.category} />
          <DateDisplay date={article.publishedAt || article.createdAt} relative className="text-xs text-gray-500" />
        </div>
        <h3 className="font-heading font-semibold text-gray-900 mb-1 group-hover:text-primary-500 transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {truncateText(article.summary, 120)}
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>{minutes} min de leitura</span>
        </div>
      </div>
    </Link>
  );
}
