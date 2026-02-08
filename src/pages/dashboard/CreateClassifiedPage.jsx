import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { createClassified } from '../../services/classifiedService';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { ClassifiedCategory, CLASSIFIED_CATEGORY_LABELS } from '../../constants/enums';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const categoryOptions = Object.keys(ClassifiedCategory).map((k) => ({
  value: k,
  label: CLASSIFIED_CATEGORY_LABELS[k],
}));

export default function CreateClassifiedPage() {
  useDocumentTitle('Novo Classificado');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', imageUrl: '',
    contactName: '', contactEmail: '', contactPhone: '', contactInfo: '',
    location: '', city: '', state: '',
  });

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      toast.error('Preencha os campos obrigatorios');
      return;
    }
    setLoading(true);
    try {
      const data = { ...form };
      Object.keys(data).forEach((k) => { if (!data[k]) delete data[k]; });
      await createClassified(data);
      toast.success('Classificado criado com sucesso!');
      navigate(ROUTES.MY_CLASSIFIEDS);
    } catch (err) {
      toast.error(err.message || 'Erro ao criar classificado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Novo Classificado</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <Input label="Titulo *" id="title" value={form.title} onChange={handleChange('title')} placeholder="Titulo do classificado" />
        <Textarea label="Descricao *" id="description" value={form.description} onChange={handleChange('description')} placeholder="Descreva seu classificado..." rows={6} />
        <Select label="Categoria *" id="category" value={form.category} onChange={handleChange('category')} options={categoryOptions} placeholder="Selecione uma categoria" />
        <Input label="URL da imagem" id="imageUrl" value={form.imageUrl} onChange={handleChange('imageUrl')} placeholder="https://..." />

        <h3 className="text-sm font-semibold text-gray-700 pt-4">Contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome" id="contactName" value={form.contactName} onChange={handleChange('contactName')} />
          <Input label="E-mail" id="contactEmail" type="email" value={form.contactEmail} onChange={handleChange('contactEmail')} />
          <Input label="Telefone" id="contactPhone" value={form.contactPhone} onChange={handleChange('contactPhone')} />
          <Input label="Info adicional" id="contactInfo" value={form.contactInfo} onChange={handleChange('contactInfo')} />
        </div>

        <h3 className="text-sm font-semibold text-gray-700 pt-4">Localizacao</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Endereco" id="location" value={form.location} onChange={handleChange('location')} />
          <Input label="Cidade" id="city" value={form.city} onChange={handleChange('city')} />
          <Input label="Estado" id="state" value={form.state} onChange={handleChange('state')} placeholder="Ex: SP" />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading}>Publicar</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.MY_CLASSIFIEDS)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
