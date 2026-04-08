import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getCourseById, createCourse, updateCourse, uploadCourseCover } from '../../services/courseService';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import FileUpload from '../../components/ui/FileUpload';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const LEVEL_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediario' },
  { value: 'ADVANCED', label: 'Avancado' },
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CourseFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  useDocumentTitle(isEdit ? 'Editar Curso' : 'Novo Curso');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: '',
    level: '',
    instructor: '',
    published: false,
    featured: false,
  });

  useEffect(() => {
    if (!isEdit) return;
    getCourseById(id)
      .then((res) => {
        const d = res?.data || res;
        setForm({
          title: d.title || '',
          slug: d.slug || '',
          description: d.description || '',
          shortDescription: d.shortDescription || '',
          category: d.category || '',
          level: d.level || '',
          instructor: d.instructor || '',
          published: d.published || false,
          featured: d.featured || false,
        });
        if (d.coverImageUrl) setCoverPreview(d.coverImageUrl);
      })
      .catch(() => toast.error('Erro ao carregar curso'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !isEdit) {
        updated.slug = slugify(value);
      }
      return updated;
    });
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
        slug: form.slug || slugify(form.title),
        description: form.description,
        published: form.published,
        featured: form.featured,
      };
      if (form.shortDescription) body.shortDescription = form.shortDescription;
      if (form.category) body.category = form.category;
      if (form.level) body.level = form.level;
      if (form.instructor) body.instructor = form.instructor;

      let result;
      if (isEdit) {
        result = await updateCourse(id, body);
      } else {
        result = await createCourse(body);
      }

      if (coverFile) {
        const courseId = result?.data?.id || result?.id || id;
        await uploadCourseCover(courseId, coverFile);
      }

      toast.success(isEdit ? 'Curso atualizado!' : 'Curso criado!');
      navigate(ROUTES.ADMIN_COURSES);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">
        {isEdit ? 'Editar Curso' : 'Novo Curso'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <Input label="Titulo *" id="title" value={form.title} onChange={handleChange('title')} />
        <Input label="Slug" id="slug" value={form.slug} onChange={handleChange('slug')} placeholder="gerado-automaticamente" />
        <Textarea label="Descricao" id="description" value={form.description} onChange={handleChange('description')} rows={4} />
        <Input label="Descricao curta" id="shortDescription" value={form.shortDescription} onChange={handleChange('shortDescription')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Categoria" id="category" value={form.category} onChange={handleChange('category')} placeholder="Ex: Programacao" />
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select
              id="level"
              value={form.level}
              onChange={handleChange('level')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <Input label="Instrutor" id="instructor" value={form.instructor} onChange={handleChange('instructor')} />

        <FileUpload
          label="Imagem de capa"
          accept="image/*"
          preview={coverPreview}
          onChange={(file) => setCoverFile(file)}
        />

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.published} onChange={handleChange('published')} className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
            Publicado
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.featured} onChange={handleChange('featured')} className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
            Destaque
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={saving}>{isEdit ? 'Salvar' : 'Criar Curso'}</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.ADMIN_COURSES)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
