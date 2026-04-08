import { Link } from 'react-router-dom';
import { User, BarChart3, PlayCircle } from 'lucide-react';
import Badge from '../ui/Badge';

const LEVEL_LABELS = { BEGINNER: 'Iniciante', INTERMEDIATE: 'Intermediario', ADVANCED: 'Avancado' };
const LEVEL_VARIANT = { BEGINNER: 'info', INTERMEDIATE: 'warning', ADVANCED: 'danger' };

export default function CourseCard({ course }) {
  const totalLessons = (course.modules || []).reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const totalModules = (course.modules || []).length;

  return (
    <Link
      to={`/cursos/${course.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      {course.coverImageUrl ? (
        <img
          src={course.coverImageUrl}
          alt={course.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
          <BarChart3 className="h-10 w-10 text-primary-300" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {course.category && (
            <span className="text-xs font-medium text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
              {course.category}
            </span>
          )}
          {course.level && (
            <Badge variant={LEVEL_VARIANT[course.level] || 'default'} className="text-xs">
              {LEVEL_LABELS[course.level] || course.level}
            </Badge>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>
        {course.shortDescription && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.shortDescription}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          {course.instructor && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{course.instructor}</span>
            </div>
          )}
          {totalLessons > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <PlayCircle className="h-3.5 w-3.5" />
              <span>{totalLessons} aula{totalLessons !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
