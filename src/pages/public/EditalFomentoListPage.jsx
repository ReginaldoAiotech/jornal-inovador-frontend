import { useState, useEffect, useMemo } from 'react';
import { FileText, MapPin, Lock, TrendingUp, Heart, MessageCircle, SlidersHorizontal, X, Search, Sparkles, Globe, CalendarRange } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { getEditaisFomento, getEstados, getFavoriteEditaisFomento } from '../../services/editalFomentoService';
import EditalFomentoCard from '../../components/common/EditalFomentoCard';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ChatDrawer from '../../components/ui/ChatDrawer';
import MultiSelect from '../../components/ui/MultiSelect';
import { cn } from '../../utils/cn';
import { getEffectiveEditalStatus, formatCurrency } from '../../utils/formatters';

const PER_PAGE = 12;

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'ABERTO', label: 'Com prazo', icon: TrendingUp },
  { value: 'CONTINUO', label: 'Fluxo continuo', icon: Sparkles },
];

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient}`}>
      <div className="absolute top-3 right-3 opacity-20">
        <Icon className="h-10 w-10 text-white" strokeWidth={1.5} />
      </div>
      <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

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

export default function EditalFomentoListPage() {
  useDocumentTitle('Editais');
  const { isAuthenticated } = useAuth();
  const [allEditais, setAllEditais] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEstados, setSelectedEstados] = useState([]);
  const [selectedFaps, setSelectedFaps] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('');
  const [estados, setEstados] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);
  const [categoria, setCategoria] = useState('FOMENTO');
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
        setFavoriteIds(favIds);

        if (editaisResult.status === 'fulfilled') {
          const data = editaisResult.value?.data || editaisResult.value || [];
          const list = (Array.isArray(data) ? data : []).map((e) => ({
            ...e,
            isFavorited: favIds.has(e.id),
            _effectiveStatus: getEffectiveEditalStatus(e),
          }));
          setAllEditais(list);
        }
        if (estadosResult.status === 'fulfilled') {
          const data = estadosResult.value?.data || estadosResult.value || [];
          setEstados(Array.isArray(data) ? data : []);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const stats = useMemo(() => {
    if (allEditais.length === 0) return null;
    let abertos = 0, fechados = 0, continuos = 0, volumeTotal = 0, totalCategoria = 0;
    let countFomento = 0, countAceleracao = 0;
    allEditais.forEach((e) => {
      const cat = e.categoria || 'FOMENTO';
      if (cat === 'FOMENTO') countFomento++;
      else if (cat === 'ACELERACAO') countAceleracao++;

      if (cat !== categoria) return;
      totalCategoria++;
      if (e._effectiveStatus === 'ENCERRADO') fechados++;
      else if (e._effectiveStatus === 'CONTINUO') continuos++;
      else abertos++;
      const vol = parseFloat(e.volumeTotalProjeto) || parseFloat(e.volumeAporte1) || 0;
      volumeTotal += vol;
    });
    return { total: totalCategoria, abertos, fechados, continuos, volumeTotal, countFomento, countAceleracao };
  }, [allEditais, categoria]);

  const filteredEditais = useMemo(() => {
    return allEditais
      .filter((e) => {
        // Apenas abertos e fluxo continuo nesta pagina
        if (e._effectiveStatus === 'ENCERRADO') return false;
        // Filtro por categoria (FOMENTO ou ACELERACAO)
        if (categoria && (e.categoria || 'FOMENTO') !== categoria) return false;
        if (showFavorites && !e.isFavorited) return false;
        if (status && e._effectiveStatus !== status) return false;
        if (selectedEstados.length > 0 && !selectedEstados.includes(e.estado)) return false;
        if (selectedFaps.length > 0 && !selectedFaps.includes(e.fap)) return false;
        if (selectedAreas.length > 0 && !(e.areasAtuacao || []).some((a) => selectedAreas.includes(a))) return false;
        if (dateFrom && e.prazoSubmissaoFase1 && new Date(e.prazoSubmissaoFase1) < new Date(dateFrom)) return false;
        if (dateTo && e.prazoSubmissaoFase1 && new Date(e.prazoSubmissaoFase1) > new Date(dateTo)) return false;
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          const searchable = [e.tituloChamada, e.instituicaoFomento, e.fap, e.informacoesGerais]
            .filter(Boolean).join(' ').toLowerCase();
          if (!searchable.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aEncerrado = a._effectiveStatus === 'ENCERRADO';
        const bEncerrado = b._effectiveStatus === 'ENCERRADO';
        if (aEncerrado !== bEncerrado) return aEncerrado ? 1 : -1;
        const dateA = a.prazoSubmissaoFase1 ? new Date(a.prazoSubmissaoFase1).getTime() : Infinity;
        const dateB = b.prazoSubmissaoFase1 ? new Date(b.prazoSubmissaoFase1).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [allEditais, categoria, status, selectedEstados, selectedFaps, selectedAreas, dateFrom, dateTo, debouncedSearch, showFavorites]);

  const totalPages = Math.ceil(filteredEditais.length / PER_PAGE) || 1;
  const paginatedEditais = filteredEditais.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [categoria, status, selectedEstados, selectedFaps, selectedAreas, dateFrom, dateTo, debouncedSearch, showFavorites]);

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
  const fapOptions = allFaps.map((f) => ({ value: f, label: f }));
  const areaOptions = allAreas.map((a) => ({ value: a, label: a }));

  const activeFilterCount = [
    selectedEstados.length > 0,
    selectedFaps.length > 0,
    selectedAreas.length > 0,
    dateFrom || dateTo,
    status,
  ].filter(Boolean).length;

  const handleToggleFavorite = (id) => {
    setAllEditais((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorited: !e.isFavorited } : e))
    );
  };

  const clearFilters = () => {
    setSelectedEstados([]);
    setSelectedFaps([]);
    setSelectedAreas([]);
    setDateFrom('');
    setDateTo('');
    setStatus('');
    setSearch('');
    setShowFavorites(false);
  };

  const handleSendMessage = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return 'Em breve conectaremos ao backend de IA para avaliar quais editais sao mais adequados ao seu proposito. Por enquanto, utilize os filtros de busca para encontrar editais relevantes.';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 pt-5 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold font-heading text-gray-900">Editais Abertos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {categoria === 'FOMENTO' ? 'Oportunidades de financiamento com inscricoes ativas' : 'Programas de aceleracao com inscricoes abertas'}
            </p>
          </div>
          {stats && (
            <div className="hidden sm:flex items-center gap-5 text-sm">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-600">{stats.abertos + stats.continuos}</p>
                <p className="text-xs text-gray-400">Abertos</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-lg font-bold text-gray-400">{stats.fechados}</p>
                <p className="text-xs text-gray-400">Encerrados</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{estados.length}</p>
                <p className="text-xs text-gray-400">Estados</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs Fomento / Aceleracao */}
        <div className="flex items-center gap-1 border-b border-gray-100 -mb-px">
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
              {stats?.countFomento || 0}
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
              {stats?.countAceleracao || 0}
            </span>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-8">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 sm:p-5 mb-8">
          {/* Search input */}
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

          {/* Status chips + filter toggle */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_FILTERS.map((f) => (
              <FilterChip
                key={f.value}
                label={f.label}
                icon={f.icon}
                active={!showFavorites && status === f.value}
                count={f.value === '' ? (stats?.abertos || 0) + (stats?.continuos || 0) : f.value === 'ABERTO' ? stats?.abertos : stats?.continuos}
                onClick={() => { setStatus(f.value); setShowFavorites(false); }}
              />
            ))}
            {isAuthenticated && (
              <>
                <div className="w-px h-7 bg-gray-200 shrink-0 mx-1" />
                <FilterChip
                  label="Favoritos"
                  icon={Heart}
                  active={showFavorites}
                  count={allEditais.filter((e) => e.isFavorited && e._effectiveStatus !== 'ENCERRADO').length}
                  onClick={() => { setShowFavorites(!showFavorites); setStatus(''); }}
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
                <span className="bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters - multi-select */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MultiSelect
                  label="Estado"
                  options={estadoOptions}
                  selected={selectedEstados}
                  onChange={setSelectedEstados}
                  placeholder="Todos os estados"
                />
                <MultiSelect
                  label="FAP / Orgao"
                  options={fapOptions}
                  selected={selectedFaps}
                  onChange={setSelectedFaps}
                  placeholder="Todas as FAPs"
                />
                <MultiSelect
                  label="Area de atuacao"
                  options={areaOptions}
                  selected={selectedAreas}
                  onChange={setSelectedAreas}
                  placeholder="Todas as areas"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Prazo de submissao
                </label>
                <div className="flex items-center gap-3 max-w-md">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <span className="text-gray-400 text-sm">ate</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Active filters summary + clear */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedEstados.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-lg">
                        {v}
                        <button onClick={() => setSelectedEstados(selectedEstados.filter((s) => s !== v))} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                    {selectedFaps.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-lg">
                        {v}
                        <button onClick={() => setSelectedFaps(selectedFaps.filter((s) => s !== v))} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                    {selectedAreas.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-lg">
                        {v}
                        <button onClick={() => setSelectedAreas(selectedAreas.filter((s) => s !== v))} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                    {(dateFrom || dateTo) && (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-lg">
                        <CalendarRange className="h-3 w-3" />
                        {dateFrom || '...'} — {dateTo || '...'}
                        <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" /> Limpar tudo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Highlight banner */}
        {!loading && stats && (stats.abertos + stats.continuos) > 0 && (
          <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 text-center">
            <p className="text-base text-emerald-800">
              Aproveite as <span className="font-bold">{stats.abertos + stats.continuos} oportunidades</span> de editais abertos, totalizando <span className="font-bold">{formatCurrency(stats.volumeTotal)}</span> em fomento.
            </p>
          </div>
        )}

        {/* Listing */}
        {loading ? (
          <Spinner size="lg" className="py-20" />
        ) : filteredEditais.length === 0 ? (
          <EmptyState title="Nenhum edital encontrado" description="Tente ajustar os filtros de busca." />
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

        {/* FAB - AI Chat */}
        <div className="pointer-events-none sticky bottom-6 flex justify-end mt-4 z-40">
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="pointer-events-auto group flex items-center gap-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white pl-5 pr-6 py-3.5 rounded-full shadow-xl shadow-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Avaliar com IA</span>
            </button>
          )}
        </div>

        <ChatDrawer
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          title="Avaliar Editais"
          initialMessage="Ola! Descreva seu projeto ou proposito e eu ajudo a identificar quais editais disponiveis sao mais adequados para voce."
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
