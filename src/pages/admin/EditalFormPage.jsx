import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getEditalById, createEdital, updateEdital } from '../../services/editalService';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

export default function EditalFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  useDocumentTitle(isEditing ? 'Editar Edital' : 'Novo Edital');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', institutionName: '', fapAcronym: '',
    openingDate: '', closingDate: '', totalAmount: '', amountPerProject: '',
    editalUrl: '', area: '', researchAreas: '', isActive: true,
  });

  useEffect(() => {
    if (!isEditing) return;
    getEditalById(id)
      .then((res) => {
        const d = res?.data || res;
        setForm({
          title: d.title || '',
          description: d.description || '',
          institutionName: d.institutionName || '',
          fapAcronym: d.fapAcronym || '',
          openingDate: d.openingDate ? d.openingDate.slice(0, 10) : '',
          closingDate: d.closingDate ? d.closingDate.slice(0, 10) : '',
          totalAmount: d.totalAmount || '',
          amountPerProject: d.amountPerProject || '',
          editalUrl: d.editalUrl || '',
          area: d.area || '',
          researchAreas: (d.researchAreas || []).join(', '),
          isActive: d.isActive ?? true,
        });
      })
      .catch(() => toast.error('Erro ao carregar edital'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.institutionName || !form.fapAcronym || !form.editalUrl) {
      toast.error('Preencha os campos obrigatorios');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        totalAmount: form.totalAmount ? Number(form.totalAmount) : undefined,
        amountPerProject: form.amountPerProject ? Number(form.amountPerProject) : undefined,
        openingDate: form.openingDate ? new Date(form.openingDate).toISOString() : undefined,
        closingDate: form.closingDate ? new Date(form.closingDate).toISOString() : undefined,
        researchAreas: form.researchAreas ? form.researchAreas.split(',').map((a) => a.trim()).filter(Boolean) : [],
      };
      Object.keys(data).forEach((k) => { if (data[k] === '' || data[k] === undefined) delete data[k]; });

      if (isEditing) {
        await updateEdital(id, data);
        toast.success('Edital atualizado!');
      } else {
        await createEdital(data);
        toast.success('Edital criado!');
      }
      navigate(ROUTES.ADMIN_EDITAIS);
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
        {isEditing ? 'Editar Edital' : 'Novo Edital'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <Input label="Titulo *" id="title" value={form.title} onChange={handleChange('title')} />
        <Textarea label="Descricao" id="description" value={form.description} onChange={handleChange('description')} rows={4} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Instituicao *" id="institutionName" value={form.institutionName} onChange={handleChange('institutionName')} />
          <Input label="Sigla FAP *" id="fapAcronym" value={form.fapAcronym} onChange={handleChange('fapAcronym')} placeholder="Ex: CNPq" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Data abertura" id="openingDate" type="date" value={form.openingDate} onChange={handleChange('openingDate')} />
          <Input label="Data encerramento" id="closingDate" type="date" value={form.closingDate} onChange={handleChange('closingDate')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Valor total (R$)" id="totalAmount" type="number" step="0.01" value={form.totalAmount} onChange={handleChange('totalAmount')} />
          <Input label="Valor por projeto (R$)" id="amountPerProject" type="number" step="0.01" value={form.amountPerProject} onChange={handleChange('amountPerProject')} />
        </div>
        <Input label="URL do edital *" id="editalUrl" value={form.editalUrl} onChange={handleChange('editalUrl')} placeholder="https://..." />
        <Input label="Area" id="area" value={form.area} onChange={handleChange('area')} placeholder="Ex: Tecnologia" />
        <Input label="Areas de pesquisa" id="researchAreas" value={form.researchAreas} onChange={handleChange('researchAreas')} placeholder="Separadas por virgula" />
        <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
          <input type="checkbox" checked={form.isActive} onChange={handleChange('isActive')} className="rounded border-gray-300 text-primary-500 focus:ring-primary-400" />
          Ativo
        </label>
        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={saving}>Salvar</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.ADMIN_EDITAIS)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
