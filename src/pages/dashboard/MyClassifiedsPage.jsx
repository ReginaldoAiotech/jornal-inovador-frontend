import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePagination } from '../../hooks/usePagination';
import { getMyClassifieds, deleteClassified } from '../../services/classifiedService';
import SectionTitle from '../../components/common/SectionTitle';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function MyClassifiedsPage() {
  useDocumentTitle('Meus Classificados');
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const { page, totalPages, setPage, setTotal } = usePagination();

  const fetchData = () => {
    setLoading(true);
    getMyClassifieds({ page, limit: 10 })
      .then((res) => {
        setClassifieds(res?.data || []);
        setTotal(res?.total || 0);
      })
      .catch(() => setClassifieds([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleDelete = async () => {
    try {
      await deleteClassified(deleteId);
      toast.success('Classificado excluido!');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const columns = [
    { key: 'title', label: 'Titulo' },
    { key: 'category', label: 'Categoria', render: (row) => <CategoryBadge category={row.category} type="classified" /> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', label: 'Data', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/painel/classificados/${row.id}/editar`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Meus Classificados</h1>
        <Link to={ROUTES.CREATE_CLASSIFIED}>
          <Button size="sm"><Plus className="h-4 w-4" /> Novo</Button>
        </Link>
      </div>

      <DataTable columns={columns} data={classifieds} isLoading={loading} emptyMessage="Voce ainda nao tem classificados" />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir classificado"
        message="Tem certeza que deseja excluir este classificado? Esta acao nao pode ser desfeita."
      />
    </div>
  );
}
