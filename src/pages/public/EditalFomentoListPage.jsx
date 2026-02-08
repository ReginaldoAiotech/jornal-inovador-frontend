import { useState, useEffect, useMemo } from 'react';
import { FileText, MapPin, Lock, TrendingUp, MessageCircle, SlidersHorizontal, X } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useDebounce } from '../../hooks/useDebounce';
import { getEditaisFomento, getEstados } from '../../services/editalFomentoService';
import SectionTitle from '../../components/common/SectionTitle';
import EditalFomentoCard from '../../components/common/EditalFomentoCard';
import SearchInput from '../../components/ui/SearchInput';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Select from '../../components/ui/Select';
import ChatDrawer from '../../components/ui/ChatDrawer';
import { cn } from '../../utils/cn';
import { getEffectiveEditalStatus } from '../../utils/formatters';

const PER_PAGE = 12;

function StatCard({ icon: Icon, label, value, color = 'text-primary-500' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

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

function AreaTag({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-xs transition-colors border whitespace-nowrap',
        active
          ? 'bg-accent-100 text-accent-700 border-accent-300'
          : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
      )}
    >
      {label}
    </button>
  );
}

export default function EditalFomentoListPage() {
  useDocumentTitle('Editais');
  const [allEditais, setAllEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [status, setStatus] = useState('');
  const [area, setArea] = useState('');
  const [estados, setEstados] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  // Carregar todos os editais e estados uma unica vez
  useEffect(() => {
    setLoading(true);
    Promise.allSettled([getEditaisFomento({ limit: 100 }), getEstados()])
      .then(([editaisResult, estadosResult]) => {
        if (editaisResult.status === 'fulfilled') {
          const data = editaisResult.value?.data || editaisResult.value || [];
          const list = (Array.isArray(data) ? data : []).map((e) => ({
            ...e,
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
  }, []);

  // Stats calculadas com status efetivo
  const stats = useMemo(() => {
    if (allEditais.length === 0) return null;
    let abertos = 0;
    let fechados = 0;
    let continuos = 0;
    allEditais.forEach((e) => {
      if (e._effectiveStatus === 'ENCERRADO') fechados++;
      else if (e._effectiveStatus === 'CONTINUO') continuos++;
      else abertos++;
    });
    return { total: allEditais.length, abertos, fechados, continuos };
  }, [allEditais]);

  // Filtrar editais no frontend
  const filteredEditais = useMemo(() => {
    return allEditais
      .filter((e) => {
        if (status && e._effectiveStatus !== status) return false;
        if (estado && e.estado !== estado) return false;
        if (area && !(e.areasAtuacao || []).includes(area)) return false;
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          const searchable = [e.tituloChamada, e.instituicaoFomento, e.fap, e.informacoesGerais]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
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
  }, [allEditais, status, estado, area, debouncedSearch]);

  // Paginacao no frontend
  const totalPages = Math.ceil(filteredEditais.length / PER_PAGE) || 1;
  const paginatedEditais = filteredEditais.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Resetar pagina quando filtros mudam
  useEffect(() => {
    setPage(1);
  }, [status, estado, area, debouncedSearch]);

  // Extrair areas e FAPs unicos de todos os editais
  const { allAreas, allFaps } = useMemo(() => {
    const areasSet = new Set();
    const fapsSet = new Set();
    allEditais.forEach((e) => {
      if (e.fap) fapsSet.add(e.fap);
      (e.areasAtuacao || []).forEach((a) => areasSet.add(a));
    });
    return { allAreas: [...areasSet].sort(), allFaps: [...fapsSet].sort() };
  }, [allEditais]);

  const estadoOptions = estados.map((e) => ({
    value: typeof e === 'string' ? e : e.estado || e.value,
    label: typeof e === 'string' ? e : e.estado || e.label,
  }));

  const fapOptions = allFaps.map((f) => ({ value: f, label: f }));

  const activeFilterCount = [estado, status, area].filter(Boolean).length;

  const clearFilters = () => {
    setEstado('');
    setStatus('');
    setArea('');
    setSearch('');
  };

  // TODO: substituir pelo endpoint real de chat com IA
  const handleSendMessage = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return 'Em breve conectaremos ao backend de IA para avaliar quais editais sao mais adequados ao seu proposito. Por enquanto, utilize os filtros de busca para encontrar editais relevantes.';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SectionTitle title="Editais" />
      <p className="text-gray-500 text-sm mb-6 -mt-4">
        Editais extraidos automaticamente por IA de diversas agencias de pesquisa do Brasil.
      </p>

      {/* Estatisticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon={FileText} label="Total de editais" value={stats.total} />
          <StatCard icon={TrendingUp} label="Abertos" value={stats.abertos} color="text-green-500" />
          <StatCard icon={Lock} label="Encerrados" value={stats.fechados} color="text-red-500" />
          <StatCard icon={TrendingUp} label="Fluxo continuo" value={stats.continuos} color="text-purple-500" />
          <StatCard icon={MapPin} label="Estados" value={estados.length} color="text-blue-500" />
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
        {/* Busca + botao filtros */}
        <div className="flex gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por titulo, instituicao..."
            className="flex-1"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors shrink-0',
              showFilters || activeFilterCount > 0
                ? 'bg-primary-50 border-primary-200 text-primary-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          <span className="text-xs text-gray-400 mr-1 shrink-0">Status:</span>
          <Chip label="Todos" active={!status} onClick={() => setStatus('')} />
          <Chip label="Abertos" active={status === 'ABERTO'} onClick={() => setStatus(status === 'ABERTO' ? '' : 'ABERTO')} />
          <Chip label="Encerrados" active={status === 'ENCERRADO'} onClick={() => setStatus(status === 'ENCERRADO' ? '' : 'ENCERRADO')} />
          <Chip label="Fluxo continuo" active={status === 'CONTINUO'} onClick={() => setStatus(status === 'CONTINUO' ? '' : 'CONTINUO')} />
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                options={estadoOptions}
                placeholder="Todos os estados"
                label="Estado"
              />
              <Select
                value=""
                onChange={(e) => { if (e.target.value) setSearch(e.target.value); }}
                options={fapOptions}
                placeholder="Todas as FAPs"
                label="FAP / Orgao"
              />
            </div>

            {/* Areas de atuacao */}
            {allAreas.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Areas de atuacao</p>
                <div className="flex flex-wrap gap-1.5">
                  <AreaTag label="Todas" active={!area} onClick={() => setArea('')} />
                  {allAreas.map((a) => (
                    <AreaTag key={a} label={a} active={area === a} onClick={() => setArea(area === a ? '' : a)} />
                  ))}
                </div>
              </div>
            )}

            {/* Limpar filtros */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                <X className="h-3 w-3" /> Limpar todos os filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Listagem */}
      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : filteredEditais.length === 0 ? (
        <EmptyState title="Nenhum edital encontrado" description="Tente ajustar os filtros de busca." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEditais.map((edital) => (
              <EditalFomentoCard key={edital.id} edital={edital} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* FAB sticky - para antes do footer */}
      <div className="pointer-events-none sticky bottom-6 flex justify-end mt-4 z-40">
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="pointer-events-auto flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">Avaliar com IA</span>
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
  );
}
