import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionTitle({ title, linkTo, linkText = 'Ver todos' }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold font-heading text-gray-900">
        {title}
      </h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          {linkText} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
