import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pencil, Trash2, Plus, ArrowLeft, Film, MessageSquare } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getModuleById, getLessons, deleteLesson } from '../../services/courseService';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function ModuleLessonsPage() {
  useDocumentTitle('Aulas do Modulo');
  const { courseId, moduleId } = useParams();
  const [module_, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    Promise.allSettled([getModuleById(courseId, moduleId), getLessons(courseId, moduleId)])
      .then(([modRes, lessonsRes]) => {
        if (modRes.status === 'fulfilled') setModule(modRes.value?.data || modRes.value);
        if (lessonsRes.status === 'fulfilled') {
          const data = lessonsRes.value?.data || lessonsRes.value || [];
          setLessons(Array.isArray(data) ? data : []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [courseId, moduleId]);

  const handleDelete = async () => {
    try {
      await deleteLesson(courseId, moduleId, deleteId);
      toast.success('Aula excluida!');
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
      key: 'isFree',
      label: 'Gratuita',
      render: (row) => row.isFree ? <Badge variant="success">Sim</Badge> : <Badge variant="default">Nao</Badge>,
    },
    {
      key: 'published',
      label: 'Status',
      render: (row) => <Badge variant={row.published ? 'success' : 'default'}>{row.published ? 'Publicada' : 'Rascunho'}</Badge>,
    },
    {
      key: 'video',
      label: 'Video',
      render: (row) => (row.videoUrl || row.videoId)
        ? <Film className="h-4 w-4 text-primary-500" />
        : <span className="text-gray-300">—</span>,
    },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/admin/cursos/aulas/${row.id}/comentarios`}
            className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500"
            title="Comentarios"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>
          <Link
            to={`/admin/cursos/${courseId}/modulos/${moduleId}/aulas/${row.id}/editar`}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
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
      <Link to={`/admin/cursos/${courseId}/modulos`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar para modulos
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900">Aulas</h1>
          {module_ && <p className="text-sm text-gray-500 mt-1">{module_.title}</p>}
        </div>
        <Link to={`/admin/cursos/${courseId}/modulos/${moduleId}/aulas/nova`}>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Aula</Button>
        </Link>
      </div>

      <DataTable columns={columns} data={lessons} isLoading={false} />

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Excluir aula"
        message="Tem certeza que deseja excluir esta aula?"
      />
    </div>
  );
}
