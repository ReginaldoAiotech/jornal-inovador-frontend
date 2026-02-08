import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getArticleById, createArticle, updateArticle } from '../../services/articleService';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const categoryOptions = Object.keys(ArticleCategory).map((k) => ({
  value: k,
  label: ARTICLE_CATEGORY_LABELS[k],
}));

export default function ArticleFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  useDocumentTitle(isEditing ? 'Editar Artigo' : 'Novo Artigo');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', headline: '', summary: '', content: '', keywords: '',
    featuredImageUrl: '', imageCaption: '', imageCredit: '', videoUrl: '',
    category: 'NEWS', section: '', published: false, featured: false,
  });

  useEffect(() => {
    if (!isEditing) return;
    getArticleById(id)
      .then((res) => {
        const data = res?.data || res;
        setForm({
          title: data.title || '',
          headline: data.headline || '',
          summary: data.summary || '',
          content: data.content || '',
          keywords: (data.keywords || []).join(', '),
          featuredImageUrl: data.featuredImageUrl || '',
          imageCaption: data.imageCaption || '',
          imageCredit: data.imageCredit || '',
          videoUrl: data.videoUrl || '',
          category: data.category || 'NEWS',
          section: data.section || '',
          published: data.published || false,
          featured: data.featured || false,
        });
      })
      .catch(() => toast.error('Erro ao carregar artigo'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Titulo e conteudo sao obrigatorios');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        keywords: form.keywords ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
      };
      Object.keys(data).forEach((k) => {
        if (data[k] === '' && k !== 'published' && k !== 'featured') delete data[k];
      });

      if (isEditing) {
        await updateArticle(id, data);
        toast.success('Artigo atualizado!');
      } else {
        await createArticle(data);
        toast.success('Artigo criado!');
      }
      navigate(ROUTES.ADMIN_ARTICLES);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar artigo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">
        {isEditing ? 'Editar Artigo' : 'Novo Artigo'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <Input label="Titulo *" id="title" value={form.title} onChange={handleChange('title')} />
        <Input label="Subtitulo" id="headline" value={form.headline} onChange={handleChange('headline')} />
        <Textarea label="Resumo / Lead" id="summary" value={form.summary} onChange={handleChange('summary')} rows={3} />
        <Textarea label="Conteudo *" id="content" value={form.content} onChange={handleChange('content')} rows={12} placeholder="Conteudo do artigo (HTML)" />
        <Input label="Palavras-chave" id="keywords" value={form.keywords} onChange={handleChange('keywords')} placeholder="Separadas por virgula" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Categoria" id="category" value={form.category} onChange={handleChange('category')} options={categoryOptions} />
          <Input label="Secao" id="section" value={form.section} onChange={handleChange('section')} placeholder="Ex: Educacao, Economia" />
        </div>

        <h3 className="text-sm font-semibold text-gray-700 pt-4">Midia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="URL imagem destaque" id="featuredImageUrl" value={form.featuredImageUrl} onChange={handleChange('featuredImageUrl')} />
          <Input label="Legenda da imagem" id="imageCaption" value={form.imageCaption} onChange={handleChange('imageCaption')} />
          <Input label="Credito da imagem" id="imageCredit" value={form.imageCredit} onChange={handleChange('imageCredit')} />
          <Input label="URL do video" id="videoUrl" value={form.videoUrl} onChange={handleChange('videoUrl')} />
        </div>

        <div className="flex items-center gap-6 pt-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={handleChange('published')} className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
            Publicado
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={handleChange('featured')} className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
            Destaque
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={saving}>Salvar</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.ADMIN_ARTICLES)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
