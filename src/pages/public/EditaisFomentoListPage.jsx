import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { getEditaisFomento, getEstados } from '../../services/editalFomentoService';
import SectionTitle from '../../components/common/SectionTitle';
import EditalFomentoCard from '../../components/common/EditalFomentoCard';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';

export default function EditaisFomentoListPage() {
  useDocumentTitle('Editais');
  const [editais, setEditais] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [estado, setEstado] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, totalPages, setPage, setTotal } = usePagination(1, 12);

  useEffect(() => {
    getEstados().then(setEstados).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (status) params.status = status;
    if (estado) params.estado = estado;

    getEditaisFomento(params)
      .then((res) => {
        setEditais(res?.data || []);
        setTotal(res?.total || 0);
      })
      .catch(() => setEditais([]))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, status, estado, setTotal]);

  const estadoOptions = estados.map((e) => ({ value: e, label: e }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SectionTitle title="Editais (FAPs)" />
      <p className="text-gray-500 text-sm mb-6 -mt-4">
        Editais extraidos automaticamente das principais fundacoes de amparo a pesquisa do Brasil.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar editais..."
          className="flex-1"
        />
        <Select
          value={estado}
          onChange={(e) => { setEstado(e.target.value); setPage(1); }}
          options={estadoOptions}
          placeholder="Todos os estados"
          className="w-full sm:w-48"
        />
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[
            { value: 'ABERTO', label: 'Abertos' },
            { value: 'ENCERRADO', label: 'Encerrados' },
            { value: 'CONTINUO', label: 'Fluxo continuo' },
          ]}
          placeholder="Todos os status"
          className="w-full sm:w-48"
        />
      </div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : editais.length === 0 ? (
        <EmptyState title="Nenhum edital encontrado" description="Tente ajustar os filtros de busca." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editais.map((edital) => (
              <EditalFomentoCard key={edital.id} edital={edital} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
