import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, Clock, Calendar } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getArticles, deleteArticle } from '../../services/articleService';
import DataTable from '../../components/common/DataTable';
import CategoryBadge from '../../components/common/CategoryBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function ManageArticlesPage() {
  useDocumentTitle('Gerenciar Noticias');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    getArticles()
      .then((res) => {
        const data = res?.data || res || [];
        setArticles(Array.isArray(data) ? data : []);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    try {
      await deleteArticle(deleteId);
      toast.success('Artigo excluido!');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const columns = [
    { key: 'title', label: 'Titulo', render: (row) => <span className="font-medium line-clamp-1">{row.title}</span> },
    { key: 'category', label: 'Categoria', render: (row) => <CategoryBadge category={row.category} /> },
    {
      key: 'status', label: 'Status', render: (row) => {
        if (row.published) return <span className="inline-flex items-center gap-1 text-xs text-green-600"><Eye className="h-3.5 w-3.5" /> Publicado</span>;
        if (row.scheduledAt) return <span className="inline-flex items-center gap-1 text-xs text-blue-600"><Calendar className="h-3.5 w-3.5" /> Agendado</span>;
        return <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Clock className="h-3.5 w-3.5" /> Rascunho</span>;
      },
    },
    { key: 'views', label: 'Views' },
    { key: 'createdAt', label: 'Data', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/admin/artigos/${row.id}/editar`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
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
        <h1 className="text-2xl font-bold font-heading text-gray-900">Noticias</h1>
        <Link to={ROUTES.ADMIN_CREATE_ARTICLE}>
          <Button size="sm"><Plus className="h-4 w-4" /> Novo Artigo</Button>
        </Link>
      </div>

      <DataTable columns={columns} data={articles} isLoading={loading} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir artigo"
        message="Tem certeza que deseja excluir este artigo?"
      />
    </div>
  );
}
