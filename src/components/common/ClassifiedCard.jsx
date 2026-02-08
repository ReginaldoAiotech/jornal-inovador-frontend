import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import DateDisplay from './DateDisplay';
import { truncateText } from '../../utils/formatters';

export default function ClassifiedCard({ classified }) {
  return (
    <Link
      to={`/classificados/${classified.id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {classified.imageUrl ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={classified.imageUrl}
            alt={classified.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-gray-300 text-3xl font-bold">AD</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge category={classified.category} type="classified" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-500 transition-colors line-clamp-2">
          {classified.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
          {truncateText(classified.description, 100)}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          {(classified.city || classified.state) && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {[classified.city, classified.state].filter(Boolean).join(', ')}
            </span>
          )}
          <DateDisplay date={classified.createdAt} relative />
        </div>
      </div>
    </Link>
  );
}
