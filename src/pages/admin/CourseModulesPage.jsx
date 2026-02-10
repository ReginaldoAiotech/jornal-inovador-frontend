import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pencil, BookOpen, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getCourseById, getModules, deleteModule } from '../../services/courseService';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

export default function CourseModulesPage() {
  useDocumentTitle('Modulos do Curso');
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    Promise.allSettled([getCourseById(courseId), getModules(courseId)])
      .then(([courseRes, modulesRes]) => {
        if (courseRes.status === 'fulfilled') setCourse(courseRes.value?.data || courseRes.value);
        if (modulesRes.status === 'fulfilled') {
          const data = modulesRes.value?.data || modulesRes.value || [];
          setModules(Array.isArray(data) ? data : []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const handleDelete = async () => {
    try {
      await deleteModule(courseId, deleteId);
      toast.success('Modulo excluido!');
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const columns = [
    { key: 'order', label: '#', render: (row) => row.order ?? '—' },
    {
      key: 'title',
      label: 'Titulo',
      render: (row) => <span className="font-medium">{row.title}</span>,
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
          <Link to={`/admin/cursos/${courseId}/modulos/${row.id}/editar`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Editar">
            <Pencil className="h-4 w-4" />
          </Link>
          <Link to={`/admin/cursos/${courseId}/modulos/${row.id}/aulas`} className="p-1.5 rounded hover:bg-gray-100 text-primary-500" title="Aulas">
            <BookOpen className="h-4 w-4" />
          </Link>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Excluir">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <Link to={ROUTES.ADMIN_COURSES} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar para cursos
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Modulos</h1>
          {course && <p className="text-sm text-gray-500 mt-1">{course.title}</p>}
        </div>
        <Link to={`/admin/cursos/${courseId}/modulos/novo`}>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Modulo</Button>
        </Link>
      </div>

      <DataTable columns={columns} data={modules} isLoading={false} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir modulo"
        message="Tem certeza que deseja excluir este modulo? Todas as aulas serao removidas."
      />
    </div>
  );
}
