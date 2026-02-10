import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getEditaisFomento, deleteEditalFomento } from '../../services/editalFomentoService';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

const TABS = [
  { value: '', label: 'Todos' },
  { value: 'ABERTO', label: 'Abertos' },
  { value: 'CONTINUO', label: 'Fluxo continuo' },
  { value: 'ENCERRADO', label: 'Encerrados' },
];

const STATUS_VARIANT = {
  ABERTO: 'success',
  ENCERRADO: 'default',
  CONTINUO: 'info',
};

const PER_PAGE = 20;

export default function ManageEditaisFomentoPage() {
  useDocumentTitle('Gerenciar Editais de Fomento');
  const [allEditais, setAllEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = () => {
    setLoading(true);
    getEditaisFomento({ limit: 100 })
      .then((res) => {
        setAllEditais(res?.data || []);
      })
      .catch(() => setAllEditais([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Filtrar pelo campo status que já vem do backend
  const filtered = useMemo(() => {
    if (!statusFilter) return allEditais;
    return allEditais.filter((e) => e.status === statusFilter);
  }, [allEditais, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleTabChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDelete = async () => {
    try {
      await deleteEditalFomento(deleteId);
      toast.success('Edital excluido!');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  // Contadores por status
  const tabCounts = useMemo(() => {
    const counts = { '': allEditais.length, ABERTO: 0, CONTINUO: 0, ENCERRADO: 0 };
    allEditais.forEach((e) => { if (counts[e.status] !== undefined) counts[e.status]++; });
    return counts;
  }, [allEditais]);

  const columns = [
    {
      key: 'tituloChamada',
      label: 'Titulo',
      render: (row) => <span className="font-medium line-clamp-1">{row.tituloChamada}</span>,
    },
    {
      key: 'fap',
      label: 'FAP',
      render: (row) => row.fap ? <Badge variant="accent">{row.fap}</Badge> : '—',
    },
    { key: 'estado', label: 'UF', render: (row) => row.estado || '—' },
    {
      key: 'prazoSubmissaoFase1',
      label: 'Submissao',
      render: (row) => formatDate(row.prazoSubmissaoFase1),
    },
    {
      key: 'volumeTotalProjeto',
      label: 'Valor',
      render: (row) => row.volumeTotalProjeto ? formatCurrency(row.volumeTotalProjeto) : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={STATUS_VARIANT[row.status] || 'default'}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/editais-fomento/${row.id}/editar`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
            <Pencil className="h-4 w-4" />
          </Link>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Editais de Fomento</h1>

      {/* Abas de status */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              statusFilter === tab.value
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">({tabCounts[tab.value] || 0})</span>
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={paginated} isLoading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir edital"
        message="Tem certeza que deseja excluir este edital de fomento?"
      />
    </div>
  );
}
