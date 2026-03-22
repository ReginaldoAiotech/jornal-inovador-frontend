import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Eye, Clock } from 'lucide-react';
import { getTrendingArticles } from '../../services/articleService';
import CategoryBadge from './CategoryBadge';
import DateDisplay from './DateDisplay';
import { readingTime } from '../../utils/formatters';

export default function TrendingSection() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    getTrendingArticles({ limit: 5, days: 30 })
      .then((res) => {
        const data = res?.data || res || [];
        setArticles(Array.isArray(data) ? data : []);
      })
      .catch(() => setArticles([]));
  }, []);

  if (articles.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="h-6 w-6 text-accent-400" />
          <h2 className="text-2xl font-bold font-heading text-white">Mais lidos</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {articles.map((article, index) => (
            <Link
              key={article.id}
              to={`/artigos/${article.id}`}
              className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 transition-all border border-white/10"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl font-black text-accent-400/40 leading-none shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <CategoryBadge category={article.category} size="sm" />
                  <h3 className="text-sm font-semibold text-white mt-1.5 line-clamp-2 group-hover:text-accent-300 transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {article.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {readingTime(article.content)} min
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
