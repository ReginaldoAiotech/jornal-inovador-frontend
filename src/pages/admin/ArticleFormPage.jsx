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
import CategoryBadge from '../../components/common/CategoryBadge';
import ImageGallery from '../../components/common/ImageGallery';
import Badge from '../../components/ui/Badge';
import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import { Plus, Trash2, Eye, PenLine, Clock, User } from 'lucide-react';
import { readingTime } from '../../utils/formatters';
import { cn } from '../../utils/cn';
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
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    title: '', headline: '', summary: '', content: '', keywords: '',
    featuredImageUrl: '', imageCaption: '', imageCredit: '', videoUrl: '',
    category: 'NEWS', section: '', published: false, featured: false,
    scheduledAt: '', gallery: [],
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
          scheduledAt: data.scheduledAt ? data.scheduledAt.slice(0, 16) : '',
          gallery: data.gallery || [],
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
        gallery: (form.gallery || []).filter((img) => img.url?.trim()),
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

  const previewKeywords = form.keywords ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [];
  const previewGallery = (form.gallery || []).filter((img) => img.url?.trim());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          {isEditing ? 'Editar Artigo' : 'Novo Artigo'}
        </h1>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
            showPreview
              ? 'bg-primary-50 text-primary-600 border-primary-200'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          )}
        >
          {showPreview ? <PenLine className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? 'Voltar ao editor' : 'Preview'}
        </button>
      </div>

      {/* Preview */}
      {showPreview ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="max-w-3xl mx-auto">
            {/* Imagem destaque */}
            {form.featuredImageUrl && (
              <figure className="mb-6">
                <img
                  src={form.featuredImageUrl}
                  alt={form.title}
                  className="w-full rounded-xl object-cover max-h-[400px]"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {(form.imageCaption || form.imageCredit) && (
                  <figcaption className="mt-2 text-sm text-gray-500">
                    {form.imageCaption}
                    {form.imageCredit && <span className="ml-1">({form.imageCredit})</span>}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <CategoryBadge category={form.category} />
              {form.section && <Badge variant="default">{form.section}</Badge>}
              {form.content && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="h-3.5 w-3.5" /> {readingTime(form.content)} min de leitura
                </span>
              )}
            </div>

            {/* Titulo */}
            <h1 className="text-3xl font-bold font-heading text-gray-900 mb-3 leading-tight">
              {form.title || 'Titulo do artigo'}
            </h1>

            {/* Subtitulo */}
            {form.headline && (
              <h2 className="text-xl text-gray-600 font-heading mb-4">{form.headline}</h2>
            )}

            {/* Resumo */}
            {form.summary && (
              <blockquote className="text-lg text-gray-700 border-l-4 border-accent-500 pl-4 mb-6 italic bg-accent-50 py-3 pr-4 rounded-r-lg">
                {form.summary}
              </blockquote>
            )}

            {/* Autor */}
            <div className="flex items-center gap-3 py-4 mb-6 border-y border-gray-200">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Autor'}</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Conteudo */}
            {form.content ? (
              <div
                className="prose prose-lg max-w-none mb-8 prose-headings:font-heading prose-a:text-primary-500 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            ) : (
              <div className="text-center py-12 text-gray-400">
                O conteudo do artigo aparecera aqui...
              </div>
            )}

            {/* Galeria */}
            {previewGallery.length > 0 && <ImageGallery images={previewGallery} />}

            {/* Tags */}
            {previewKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-200">
                <span className="text-xs text-gray-400 mr-1 self-center">Tags:</span>
                {previewKeywords.map((kw) => (
                  <Badge key={kw} variant="default">{kw}</Badge>
                ))}
              </div>
            )}

            {/* Status indicators */}
            <div className="flex items-center gap-3 mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400">
              {form.published ? (
                <span className="text-green-500 font-medium">Publicado</span>
              ) : form.scheduledAt ? (
                <span className="text-blue-500 font-medium">Agendado para {new Date(form.scheduledAt).toLocaleString('pt-BR')}</span>
              ) : (
                <span className="text-yellow-500 font-medium">Rascunho</span>
              )}
              {form.featured && <span className="text-accent-500 font-medium">Em destaque</span>}
            </div>
          </div>
        </div>
      ) : (

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

        {/* Galeria de imagens */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Galeria de imagens</h3>
            <button
              type="button"
              onClick={() => setForm({ ...form, gallery: [...(form.gallery || []), { url: '', caption: '', credit: '' }] })}
              className="text-xs text-primary-500 hover:underline flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Adicionar imagem
            </button>
          </div>
          {(form.gallery || []).map((img, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 items-end">
              <Input
                label={index === 0 ? 'URL' : undefined}
                value={img.url}
                onChange={(e) => {
                  const g = [...form.gallery];
                  g[index] = { ...g[index], url: e.target.value };
                  setForm({ ...form, gallery: g });
                }}
                placeholder="URL da imagem"
              />
              <Input
                label={index === 0 ? 'Legenda' : undefined}
                value={img.caption || ''}
                onChange={(e) => {
                  const g = [...form.gallery];
                  g[index] = { ...g[index], caption: e.target.value };
                  setForm({ ...form, gallery: g });
                }}
                placeholder="Legenda"
              />
              <Input
                label={index === 0 ? 'Credito' : undefined}
                value={img.credit || ''}
                onChange={(e) => {
                  const g = [...form.gallery];
                  g[index] = { ...g[index], credit: e.target.value };
                  setForm({ ...form, gallery: g });
                }}
                placeholder="Credito"
              />
              <button
                type="button"
                onClick={() => {
                  const g = form.gallery.filter((_, i) => i !== index);
                  setForm({ ...form, gallery: g });
                }}
                className="p-2 text-red-400 hover:text-red-500 self-end mb-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Publicacao e agendamento */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={handleChange('published')} className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
              Publicado
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={handleChange('featured')} className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
              Destaque
            </label>
          </div>

          {!form.published && (
            <div className="max-w-xs">
              <Input
                label="Agendar publicacao"
                id="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={handleChange('scheduledAt')}
              />
              {form.scheduledAt && (
                <p className="text-xs text-gray-500 mt-1">
                  O artigo sera publicado automaticamente na data agendada.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={saving}>Salvar</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.ADMIN_ARTICLES)}>Cancelar</Button>
        </div>
      </form>
      )}
    </div>
  );
}
