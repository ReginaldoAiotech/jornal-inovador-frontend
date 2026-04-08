import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getLessonById, createLesson, updateLesson, uploadLessonVideo, getVideoStatus } from '../../services/courseService';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

export default function LessonFormPage() {
  const { courseId, moduleId, lessonId } = useParams();
  const isEdit = !!lessonId;
  useDocumentTitle(isEdit ? 'Editar Aula' : 'Nova Aula');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoStatus, setVideoStatus] = useState(null);
  const pollingRef = useRef(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    order: '',
    published: false,
  });

  useEffect(() => {
    if (!isEdit) return;
    getLessonById(courseId, moduleId, lessonId)
      .then((res) => {
        const d = res?.data || res;
        setForm({
          title: d.title || '',
          description: d.description || '',
          content: d.content || '',
          order: d.order ?? '',
          published: d.published || false,
        });
        if (d.videoUrl) setVideoPreview(d.videoUrl);
        if (d.videoStatus) setVideoStatus(d.videoStatus);
      })
      .catch(() => toast.error('Erro ao carregar aula'))
      .finally(() => setLoading(false));
  }, [courseId, moduleId, lessonId, isEdit]);

  // Polling do status do video
  useEffect(() => {
    if (!isEdit || !lessonId) return;
    if (videoStatus === 'PROCESSING' || videoStatus === 'UPLOADING') {
      pollingRef.current = setInterval(() => {
        getVideoStatus(lessonId)
          .then((res) => {
            const s = res?.data?.status || res?.status;
            if (s) setVideoStatus(s);
            if (s !== 'PROCESSING' && s !== 'UPLOADING') {
              clearInterval(pollingRef.current);
            }
          })
          .catch(() => clearInterval(pollingRef.current));
      }, 5000);
    }
    return () => clearInterval(pollingRef.current);
  }, [videoStatus, isEdit, lessonId]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('O titulo e obrigatorio');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title,
        published: form.published,
      };
      if (form.description) body.description = form.description;
      if (form.content) body.content = form.content;
      if (form.order !== '') body.order = Number(form.order);

      let result;
      if (isEdit) {
        result = await updateLesson(courseId, moduleId, lessonId, body);
      } else {
        result = await createLesson(courseId, moduleId, body);
      }

      if (videoFile) {
        const lId = result?.data?.id || result?.id || lessonId;
        await uploadLessonVideo(courseId, moduleId, lId, videoFile);
      }

      toast.success(isEdit ? 'Aula atualizada!' : 'Aula criada!');
      navigate(`/admin/cursos/${courseId}/modulos/${moduleId}/aulas`);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  const videoStatusBadge = videoStatus && (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-gray-500">Status do video:</span>
      {videoStatus === 'PROCESSING' || videoStatus === 'UPLOADING' ? (
        <Badge variant="warning"><Loader2 className="h-3 w-3 animate-spin inline mr-1" />{videoStatus === 'PROCESSING' ? 'Processando' : 'Enviando'}</Badge>
      ) : videoStatus === 'READY' || videoStatus === 'COMPLETED' ? (
        <Badge variant="success">Pronto</Badge>
      ) : (
        <Badge variant="default">{videoStatus}</Badge>
      )}
    </div>
  );

  return (
    <div>
      <Link
        to={`/admin/cursos/${courseId}/modulos/${moduleId}/aulas`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para aulas
      </Link>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">
        {isEdit ? 'Editar Aula' : 'Nova Aula'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <Input label="Titulo *" id="title" value={form.title} onChange={handleChange('title')} />
        <Textarea label="Descricao" id="description" value={form.description} onChange={handleChange('description')} rows={3} />
        <Textarea label="Conteudo (HTML)" id="content" value={form.content} onChange={handleChange('content')} rows={8} />
        <Input label="Ordem" id="order" type="number" value={form.order} onChange={handleChange('order')} placeholder="1, 2, 3..." />

        <div>
          <FileUpload
            label="Video da aula"
            accept="video/*"
            preview={videoPreview}
            onChange={(file) => setVideoFile(file)}
          />
          {videoStatusBadge}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.published} onChange={handleChange('published')} className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
            Publicada
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={saving}>{isEdit ? 'Salvar' : 'Criar Aula'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(`/admin/cursos/${courseId}/modulos/${moduleId}/aulas`)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
