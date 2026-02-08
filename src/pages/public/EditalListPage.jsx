import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { getEditais } from '../../services/editalService';
import SectionTitle from '../../components/common/SectionTitle';
import EditalCard from '../../components/common/EditalCard';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';

export default function EditalListPage() {
  useDocumentTitle('Editais');
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [area, setArea] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, totalPages, setPage, setTotal } = usePagination(1, 12);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (onlyOpen) params.onlyOpen = true;
    if (area) params.area = area;

    getEditais(params)
      .then((res) => {
        const data = res?.data || res || [];
        setEditais(Array.isArray(data) ? data : []);
        setTotal(res?.total || 0);
      })
      .catch(() => setEditais([]))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, onlyOpen, area, setTotal]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SectionTitle title="Editais" />

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar editais..."
          className="flex-1"
        />
        <Select
          value={area}
          onChange={(e) => { setArea(e.target.value); setPage(1); }}
          options={[
            { value: 'Tecnologia', label: 'Tecnologia' },
            { value: 'Saude', label: 'Saude' },
            { value: 'Educacao', label: 'Educacao' },
            { value: 'Engenharia', label: 'Engenharia' },
          ]}
          placeholder="Todas as areas"
          className="w-full sm:w-48"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap cursor-pointer">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => { setOnlyOpen(e.target.checked); setPage(1); }}
            className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
          />
          Apenas abertos
        </label>
      </div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : editais.length === 0 ? (
        <EmptyState title="Nenhum edital encontrado" description="Tente ajustar os filtros." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editais.map((edital) => (
              <EditalCard key={edital.id} edital={edital} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
