import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Layers, Trash2, Plus } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getCourses, deleteCourse } from '../../services/courseService';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const LEVEL_LABELS = { BEGINNER: 'Iniciante', INTERMEDIATE: 'Intermediario', ADVANCED: 'Avancado' };
const LEVEL_VARIANT = { BEGINNER: 'info', INTERMEDIATE: 'warning', ADVANCED: 'danger' };

export default function ManageCoursesPage() {
  useDocumentTitle('Gerenciar Cursos');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    getCourses()
      .then((res) => setCourses(res?.data || res || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    try {
      await deleteCourse(deleteId);
      toast.success('Curso excluido!');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const columns = [
    {
      key: 'coverImageUrl',
      label: 'Capa',
      render: (row) => row.coverImageUrl
        ? <img src={row.coverImageUrl} alt="" className="w-16 h-10 rounded object-cover" />
        : <div className="w-16 h-10 rounded bg-gray-100" />,
    },
    {
      key: 'title',
      label: 'Titulo',
      render: (row) => <span className="font-medium line-clamp-1">{row.title}</span>,
    },
    { key: 'category', label: 'Categoria', render: (row) => row.category || '—' },
    {
      key: 'level',
      label: 'Nivel',
      render: (row) => row.level
        ? <Badge variant={LEVEL_VARIANT[row.level] || 'default'}>{LEVEL_LABELS[row.level] || row.level}</Badge>
        : '—',
    },
    {
      key: 'price',
      label: 'Preco',
      render: (row) => row.price ? formatCurrency(row.price) : 'Gratuito',
    },
    {
      key: 'published',
      label: 'Status',
      render: (row) => <Badge variant={row.published ? 'success' : 'default'}>{row.published ? 'Publicado' : 'Rascunho'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link to={`/admin/cursos/${row.id}/editar`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Editar">
            <Pencil className="h-4 w-4" />
          </Link>
          <Link to={`/admin/cursos/${row.id}/modulos`} className="p-1.5 rounded hover:bg-gray-100 text-primary-500" title="Modulos">
            <Layers className="h-4 w-4" />
          </Link>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Excluir">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900">Cursos</h1>
        <Link to={ROUTES.ADMIN_CREATE_COURSE}>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Curso</Button>
        </Link>
      </div>

      <DataTable columns={columns} data={courses} isLoading={loading} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir curso"
        message="Tem certeza que deseja excluir este curso? Todos os modulos e aulas serao removidos."
      />
    </div>
  );
}
