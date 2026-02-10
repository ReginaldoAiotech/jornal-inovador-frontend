import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getModuleById, createModule, updateModule, uploadModuleCover } from '../../services/courseService';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import FileUpload from '../../components/ui/FileUpload';
import toast from 'react-hot-toast';

export default function ModuleFormPage() {
  const { courseId, moduleId } = useParams();
  const isEdit = !!moduleId;
  useDocumentTitle(isEdit ? 'Editar Modulo' : 'Novo Modulo');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    order: '',
    published: false,
  });

  useEffect(() => {
    if (!isEdit) return;
    getModuleById(courseId, moduleId)
      .then((res) => {
        const d = res?.data || res;
        setForm({
          title: d.title || '',
          description: d.description || '',
          order: d.order ?? '',
          published: d.published || false,
        });
        if (d.coverImageUrl) setCoverPreview(d.coverImageUrl);
      })
      .catch(() => toast.error('Erro ao carregar modulo'))
      .finally(() => setLoading(false));
  }, [courseId, moduleId, isEdit]);

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
      if (form.order !== '') body.order = Number(form.order);

      let result;
      if (isEdit) {
        result = await updateModule(courseId, moduleId, body);
      } else {
        result = await createModule(courseId, body);
      }

      if (coverFile) {
        const modId = result?.data?.id || result?.id || moduleId;
        await uploadModuleCover(courseId, modId, coverFile);
      }

      toast.success(isEdit ? 'Modulo atualizado!' : 'Modulo criado!');
      navigate(`/admin/cursos/${courseId}/modulos`);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <Link to={`/admin/cursos/${courseId}/modulos`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar para modulos
      </Link>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">
        {isEdit ? 'Editar Modulo' : 'Novo Modulo'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <Input label="Titulo *" id="title" value={form.title} onChange={handleChange('title')} />
        <Textarea label="Descricao" id="description" value={form.description} onChange={handleChange('description')} rows={3} />
        <Input label="Ordem" id="order" type="number" value={form.order} onChange={handleChange('order')} placeholder="1, 2, 3..." />

        <FileUpload
          label="Imagem de capa"
          accept="image/*"
          preview={coverPreview}
          onChange={(file) => setCoverFile(file)}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.published} onChange={handleChange('published')} className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
          Publicado
        </label>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={saving}>{isEdit ? 'Salvar' : 'Criar Modulo'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(`/admin/cursos/${courseId}/modulos`)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
