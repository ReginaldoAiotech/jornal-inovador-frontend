import { useState, useEffect, useMemo } from 'react';
import { Search, X, SlidersHorizontal, Heart } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { getEditaisFomento, getEstados, getFavoriteEditaisFomento } from '../../services/editalFomentoService';
import EditalFomentoCard from '../../components/common/EditalFomentoCard';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import MultiSelect from '../../components/ui/MultiSelect';
import { cn } from '../../utils/cn';
import { getEffectiveEditalStatus, formatCurrency } from '../../utils/formatters';

const PER_PAGE = 12;

function FilterChip({ label, active, onClick, count, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
        active
          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
      {count !== undefined && (
        <span className={cn(
          'ml-1 text-xs px-1.5 py-0.5 rounded-md font-bold',
          active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function EditalFomentoEncerradosPage() {
  useDocumentTitle('Editais Encerrados');
  const { isAuthenticated } = useAuth();
  const [allEditais, setAllEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEstados, setSelectedEstados] = useState([]);
  const [selectedFaps, setSelectedFaps] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [categoria, setCategoria] = useState('FOMENTO');
  const [showFilters, setShowFilters] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    const promises = [getEditaisFomento({ limit: 100 }), getEstados()];
    if (isAuthenticated) promises.push(getFavoriteEditaisFomento({ limit: 100 }));

    Promise.allSettled(promises)
      .then(([editaisResult, estadosResult, favResult]) => {
        const favIds = new Set();
        if (favResult?.status === 'fulfilled') {
          const favData = favResult.value?.data || favResult.value || [];
          (Array.isArray(favData) ? favData : []).forEach((e) => favIds.add(e.id));
        }

        if (editaisResult.status === 'fulfilled') {
          const data = editaisResult.value?.data || editaisResult.value || [];
          const list = (Array.isArray(data) ? data : [])
            .map((e) => ({
              ...e,
              isFavorited: favIds.has(e.id),
              _effectiveStatus: getEffectiveEditalStatus(e),
            }))
            .filter((e) => e._effectiveStatus === 'ENCERRADO');
          setAllEditais(list);
        }
        if (estadosResult.status === 'fulfilled') {
          const data = estadosResult.value?.data || estadosResult.value || [];
          setEstados(Array.isArray(data) ? data : []);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const counts = useMemo(() => {
    let countFomento = 0, countAceleracao = 0;
    allEditais.forEach((e) => {
      const cat = e.categoria || 'FOMENTO';
      if (cat === 'FOMENTO') countFomento++;
      else if (cat === 'ACELERACAO') countAceleracao++;
    });
    return { countFomento, countAceleracao };
  }, [allEditais]);

  const filteredEditais = useMemo(() => {
    return allEditais.filter((e) => {
      if ((e.categoria || 'FOMENTO') !== categoria) return false;
      if (showFavorites && !e.isFavorited) return false;
      if (selectedEstados.length > 0 && !selectedEstados.includes(e.estado)) return false;
      if (selectedFaps.length > 0 && !selectedFaps.includes(e.fap)) return false;
      if (selectedAreas.length > 0 && !(e.areasAtuacao || []).some((a) => selectedAreas.includes(a))) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const searchable = [e.tituloChamada, e.instituicaoFomento, e.fap, e.informacoesGerais]
          .filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [allEditais, categoria, selectedEstados, selectedFaps, selectedAreas, debouncedSearch, showFavorites]);

  const totalPages = Math.ceil(filteredEditais.length / PER_PAGE) || 1;
  const paginatedEditais = filteredEditais.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [categoria, selectedEstados, selectedFaps, selectedAreas, debouncedSearch, showFavorites]);

  const { allAreas, allFaps } = useMemo(() => {
    const areasSet = new Set(), fapsSet = new Set();
    allEditais.forEach((e) => {
      if (e.fap) fapsSet.add(e.fap);
      (e.areasAtuacao || []).forEach((a) => areasSet.add(a));
    });
    return { allAreas: [...areasSet].sort(), allFaps: [...fapsSet].sort() };
  }, [allEditais]);

  const estadoOptions = estados.map((e) => {
    const val = typeof e === 'string' ? e : e.estado || e.value;
    return { value: val, label: val };
  });

  const volumeTotal = useMemo(() => {
    return allEditais.reduce((sum, e) => sum + (parseFloat(e.volumeTotalProjeto) || parseFloat(e.volumeAporte1) || 0), 0);
  }, [allEditais]);

  const activeFilterCount = [selectedEstados.length > 0, selectedFaps.length > 0, selectedAreas.length > 0].filter(Boolean).length;

  const handleToggleFavorite = (id) => {
    setAllEditais((prev) => prev.map((e) => (e.id === id ? { ...e, isFavorited: !e.isFavorited } : e)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-8">
      <div className="mb-4">
        <h1 className="text-xl font-bold font-heading text-gray-900">Editais Encerrados</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {categoria === 'FOMENTO' ? 'Editais de fomento com prazo expirado' : 'Programas de aceleracao com inscricoes encerradas'}
        </p>
      </div>

      {/* Tabs Fomento / Aceleracao */}
      <div className="flex items-center gap-1 border-b border-gray-100 mb-6">
        <button
          onClick={() => setCategoria('FOMENTO')}
          className={cn(
            'px-5 py-3 text-sm font-semibold border-b-2 transition-colors',
            categoria === 'FOMENTO'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Fomento
          <span className={cn(
            'ml-2 text-xs px-2 py-0.5 rounded-full font-bold',
            categoria === 'FOMENTO' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
          )}>
            {counts.countFomento}
          </span>
        </button>
        <button
          onClick={() => setCategoria('ACELERACAO')}
          className={cn(
            'px-5 py-3 text-sm font-semibold border-b-2 transition-colors',
            categoria === 'ACELERACAO'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          Aceleração
          <span className={cn(
            'ml-2 text-xs px-2 py-0.5 rounded-full font-bold',
            categoria === 'ACELERACAO' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
          )}>
            {counts.countAceleracao}
          </span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, instituicao, FAP..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Chips + filter toggle */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          <FilterChip
            label="Todos"
            active={!showFavorites}
            count={allEditais.length}
            onClick={() => setShowFavorites(false)}
          />
          {isAuthenticated && (
            <>
              <div className="w-px h-7 bg-gray-200 shrink-0 mx-1" />
              <FilterChip
                label="Favoritos"
                icon={Heart}
                active={showFavorites}
                count={allEditais.filter((e) => e.isFavorited).length}
                onClick={() => setShowFavorites(!showFavorites)}
              />
            </>
          )}

          <div className="flex-1" />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0',
              showFilters || activeFilterCount > 0
                ? 'bg-accent-50 border border-accent-200 text-accent-700'
                : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MultiSelect label="Estado" options={estadoOptions} selected={selectedEstados} onChange={setSelectedEstados} placeholder="Todos os estados" />
            <MultiSelect label="FAP / Orgao" options={allFaps.map((f) => ({ value: f, label: f }))} selected={selectedFaps} onChange={setSelectedFaps} placeholder="Todas as FAPs" />
            <MultiSelect label="Area" options={allAreas.map((a) => ({ value: a, label: a }))} selected={selectedAreas} onChange={setSelectedAreas} placeholder="Todas as areas" />
          </div>
        )}
      </div>

      {/* Banner */}
      {!loading && allEditais.length > 0 && (
        <div className="mb-6 rounded-xl bg-gray-50 border border-gray-200 px-5 py-3.5 text-center">
          <p className="text-base text-gray-600">
            <span className="font-bold">{allEditais.length} editais</span> encerrados, totalizando <span className="font-bold">{formatCurrency(volumeTotal)}</span> em fomento.
          </p>
        </div>
      )}

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : filteredEditais.length === 0 ? (
        <EmptyState title="Nenhum edital encerrado encontrado" description="Tente ajustar os filtros." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedEditais.map((edital) => (
              <EditalFomentoCard key={edital.id} edital={edital} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
