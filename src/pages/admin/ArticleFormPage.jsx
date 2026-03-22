import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getArticleById, createArticle, updateArticle } from '../../services/articleService';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import CategoryBadge from '../../components/common/CategoryBadge';
import ImageGallery from '../../components/common/ImageGallery';
import Badge from '../../components/ui/Badge';
import BlockEditor from '../../components/common/BlockEditor';
import ImageUploader from '../../components/common/ImageUploader';
import { ArticleCategory, ARTICLE_CATEGORY_LABELS } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import {
  Eye, PenLine, Clock, User, Save, X, ChevronDown, ChevronUp,
  Settings, Image as ImageIcon, Tag, Calendar,
} from 'lucide-react';
import { readingTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

const categoryOptions = Object.keys(ArticleCategory).map((k) => ({
  value: k,
  label: ARTICLE_CATEGORY_LABELS[k],
}));

function SidebarSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <Icon className="h-4 w-4 text-gray-400" />
        {title}
        <span className="ml-auto">
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </span>
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

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
    setForm((f) => ({ ...f, [field]: value }));
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

  // --- PREVIEW ---
  if (showPreview) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-heading text-gray-900">Preview da Reportagem</h1>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border bg-primary-50 text-primary-600 border-primary-200"
          >
            <PenLine className="h-4 w-4" /> Voltar ao editor
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
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

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <CategoryBadge category={form.category} />
              {form.section && <Badge variant="default">{form.section}</Badge>}
              {form.content && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="h-3.5 w-3.5" /> {readingTime(form.content)} min de leitura
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold font-heading text-gray-900 mb-3 leading-tight">
              {form.title || 'Titulo do artigo'}
            </h1>

            {form.headline && (
              <h2 className="text-xl text-gray-600 font-heading mb-4">{form.headline}</h2>
            )}

            {form.summary && (
              <blockquote className="text-lg text-gray-700 border-l-4 border-accent-500 pl-4 mb-6 italic bg-accent-50 py-3 pr-4 rounded-r-lg">
                {form.summary}
              </blockquote>
            )}

            <div className="flex items-center gap-3 py-4 mb-6 border-y border-gray-200">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Autor'}</p>
                <p className="text-xs text-gray-500">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

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

            {previewGallery.length > 0 && <ImageGallery images={previewGallery} />}

            {previewKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-200">
                <span className="text-xs text-gray-400 mr-1 self-center">Tags:</span>
                {previewKeywords.map((kw) => (
                  <Badge key={kw} variant="default">{kw}</Badge>
                ))}
              </div>
            )}

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
      </div>
    );
  }

  // --- EDITOR ---
  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold font-heading text-gray-900">
          {isEditing ? 'Editar Artigo' : 'Nova Reportagem'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border bg-white text-gray-600 border-gray-300 hover:border-gray-400 transition-colors"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <Button type="submit" isLoading={saving} className="gap-2">
            <Save className="h-4 w-4" /> Salvar
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.ADMIN_ARTICLES)} className="gap-2">
            <X className="h-4 w-4" /> Cancelar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* === COLUNA PRINCIPAL - Editor === */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5">
          {/* Titulo */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Titulo *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Titulo da reportagem..."
              className="w-full text-2xl font-bold font-heading text-gray-900 placeholder-gray-300 border-0 border-b border-gray-100 outline-none focus:ring-0 focus:border-primary-300 pb-3 transition-colors"
            />
          </div>

          {/* Subtitulo */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Subtitulo</label>
            <input
              value={form.headline}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              placeholder="Linha de apoio da materia..."
              className="w-full text-lg text-gray-600 placeholder-gray-300 border-0 border-b border-gray-100 outline-none focus:ring-0 focus:border-primary-300 pb-3 transition-colors"
            />
          </div>

          {/* Imagem de capa */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Imagem de capa</label>
            <ImageUploader
              value={form.featuredImageUrl}
              onChange={(url) => setForm((f) => ({ ...f, featuredImageUrl: url }))}
            />
            {form.featuredImageUrl && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  value={form.imageCaption}
                  onChange={(e) => setForm((f) => ({ ...f, imageCaption: e.target.value }))}
                  placeholder="Legenda da imagem"
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <input
                  value={form.imageCredit}
                  onChange={(e) => setForm((f) => ({ ...f, imageCredit: e.target.value }))}
                  placeholder="Credito (ex: Foto: Reuters)"
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            )}
          </div>

          {/* Resumo / Lead */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Resumo / Lead</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="Resuma a materia em 2-3 frases. Esse texto aparece em destaque antes do conteudo e nos cards de listagem."
              rows={3}
              className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-y"
            />
          </div>

          {/* Separador visual */}
          <hr className="border-gray-200" />

          {/* Editor de blocos */}
          <BlockEditor
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
          />
        </div>

        {/* === SIDEBAR - Configuracoes === */}
        <div className="space-y-4 lg:sticky lg:top-4">
          {/* Publicacao */}
          <SidebarSection title="Publicacao" icon={Calendar} defaultOpen>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={handleChange('published')}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                />
                Publicado
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={handleChange('featured')}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                />
                Destaque
              </label>
            </div>

            {!form.published && (
              <div>
                <Input
                  label="Agendar publicacao"
                  id="scheduledAt"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={handleChange('scheduledAt')}
                />
                {form.scheduledAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Publicacao automatica na data agendada.
                  </p>
                )}
              </div>
            )}

            {/* Status badge */}
            <div className="pt-1">
              {form.published ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 text-green-600 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Publicado
                </span>
              ) : form.scheduledAt ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Agendado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-600 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Rascunho
                </span>
              )}
            </div>
          </SidebarSection>

          {/* Categoria */}
          <SidebarSection title="Categoria e Secao" icon={Settings} defaultOpen>
            <Select
              label="Categoria"
              id="category"
              value={form.category}
              onChange={handleChange('category')}
              options={categoryOptions}
            />
            <Input
              label="Secao"
              id="section"
              value={form.section}
              onChange={handleChange('section')}
              placeholder="Ex: Educacao, Economia"
            />
          </SidebarSection>

          {/* Video */}
          <SidebarSection title="Video (opcional)" icon={ImageIcon} defaultOpen={false}>
            <Input
              label="URL do video"
              value={form.videoUrl}
              onChange={handleChange('videoUrl')}
              placeholder="YouTube ou Vimeo"
            />
          </SidebarSection>

          {/* Tags */}
          <SidebarSection title="Palavras-chave" icon={Tag}>
            <Input
              value={form.keywords}
              onChange={handleChange('keywords')}
              placeholder="Separadas por virgula"
            />
            {previewKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {previewKeywords.map((kw) => (
                  <span key={kw} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{kw}</span>
                ))}
              </div>
            )}
          </SidebarSection>

          {/* Info */}
          {form.content && (
            <div className="border border-gray-200 rounded-xl bg-white px-4 py-3">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {readingTime(form.content)} min leitura
                </span>
                <span>{form.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} palavras</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
