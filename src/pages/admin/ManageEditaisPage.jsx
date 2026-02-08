import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePagination } from '../../hooks/usePagination';
import { getEditais, deleteEdital } from '../../services/editalService';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ManageEditaisPage() {
  useDocumentTitle('Gerenciar Editais');
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const { page, totalPages, setPage, setTotal } = usePagination(1, 20);

  const fetchData = () => {
    setLoading(true);
    getEditais({ page, limit: 20 })
      .then((res) => {
        setEditais(res?.data || []);
        setTotal(res?.total || 0);
      })
      .catch(() => setEditais([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleDelete = async () => {
    try {
      await deleteEdital(deleteId);
      toast.success('Edital excluido!');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const columns = [
    { key: 'title', label: 'Titulo', render: (row) => <span className="font-medium line-clamp-1">{row.title}</span> },
    { key: 'fapAcronym', label: 'FAP', render: (row) => <Badge variant="accent">{row.fapAcronym}</Badge> },
    { key: 'closingDate', label: 'Encerramento', render: (row) => formatDate(row.closingDate) },
    { key: 'isActive', label: 'Ativo', render: (row) => <span className={`h-2.5 w-2.5 rounded-full inline-block ${row.isActive ? 'bg-green-500' : 'bg-red-400'}`} /> },
    { key: 'views', label: 'Views' },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/editais/${row.id}/editar`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
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
        <h1 className="text-2xl font-bold font-heading text-gray-900">Editais</h1>
        <Link to={ROUTES.ADMIN_CREATE_EDITAL}>
          <Button size="sm"><Plus className="h-4 w-4" /> Novo Edital</Button>
        </Link>
      </div>

      <DataTable columns={columns} data={editais} isLoading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir edital"
        message="Tem certeza que deseja excluir este edital?"
      />
    </div>
  );
}
