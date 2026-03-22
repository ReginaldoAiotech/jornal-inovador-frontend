import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { getClassifieds } from '../../services/classifiedService';
import SectionTitle from '../../components/common/SectionTitle';
import ClassifiedCard from '../../components/common/ClassifiedCard';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { ClassifiedCategory, CLASSIFIED_CATEGORY_LABELS } from '../../constants/enums';
import { cn } from '../../utils/cn';

export default function ClassifiedListPage() {
  useDocumentTitle('Classificados');
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const debouncedSearch = useDebounce(search);
  const { page, totalPages, setPage, setTotal } = usePagination(1, 12);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category !== 'ALL') params.category = category;

    getClassifieds(params)
      .then((res) => {
        const data = res?.data || res || [];
        const list = Array.isArray(data) ? data : [];
        setClassifieds(list);
        setTotal(res?.total || list.length);
      })
      .catch(() => { setClassifieds([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, category, setTotal]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SectionTitle title="Classificados" />

      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar classificados..." className="max-w-md" />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => { setCategory('ALL'); setPage(1); }}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
            category === 'ALL' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Todos
        </button>
        {Object.keys(ClassifiedCategory).map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              category === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {CLASSIFIED_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : classifieds.length === 0 ? (
        <EmptyState title="Nenhum classificado encontrado" description="Tente ajustar sua busca." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classifieds.map((c) => (
              <ClassifiedCard key={c.id} classified={c} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
