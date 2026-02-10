import { useState, useEffect, useMemo } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce } from '../../hooks/useDebounce';
import { getCourses } from '../../services/courseService';
import SectionTitle from '../../components/common/SectionTitle';
import CourseCard from '../../components/common/CourseCard';
import SearchInput from '../../components/ui/SearchInput';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { cn } from '../../utils/cn';

const LEVEL_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediario' },
  { value: 'ADVANCED', label: 'Avancado' },
];

const PER_PAGE = 12;

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap',
        active
          ? 'bg-primary-500 text-white border-primary-500'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
      )}
    >
      {label}
    </button>
  );
}

export default function CourseListPage() {
  useDocumentTitle('Cursos');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    getCourses({ published: true })
      .then((res) => {
        const data = res?.data || res || [];
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (level && c.level !== level) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const searchable = [c.title, c.shortDescription, c.instructor, c.category]
          .filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [courses, level, debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [level, debouncedSearch]);

  // Categorias unicas
  const categories = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => { if (c.category) set.add(c.category); });
    return [...set].sort();
  }, [courses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SectionTitle title="Cursos" />
      <p className="text-gray-500 text-sm mb-6 -mt-4">
        Explore nossos cursos e aprimore seus conhecimentos.
      </p>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por titulo, instrutor..."
          className="mb-3"
        />
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-gray-400 mr-1 shrink-0">Nivel:</span>
          {LEVEL_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              active={level === opt.value}
              onClick={() => setLevel(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Listagem */}
      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum curso encontrado" description="Tente ajustar os filtros de busca." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                    page === p ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
