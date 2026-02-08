import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function NewsTicker({ articles = [] }) {
  if (articles.length === 0) return null;

  const items = articles.slice(0, 8);
  // Duplicar para loop infinito
  const doubled = [...items, ...items];

  return (
    <div className="bg-primary-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-9">
        <div className="flex items-center gap-1.5 bg-accent-500 text-white px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide shrink-0 mr-4">
          <Zap className="h-3 w-3" />
          Flash
        </div>
        <div className="overflow-hidden flex-1 relative">
          <div className="flex animate-ticker whitespace-nowrap gap-8">
            {doubled.map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                to={`/artigos/${article.id}`}
                className="text-xs text-primary-200 hover:text-white transition-colors shrink-0"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
