import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getEditalFomentoById, updateEditalFomento } from '../../services/editalFomentoService';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'ABERTO', label: 'Aberto' },
  { value: 'ENCERRADO', label: 'Encerrado' },
  { value: 'CONTINUO', label: 'Fluxo continuo' },
];

export default function EditalFomentoFormPage() {
  const { id } = useParams();
  useDocumentTitle('Editar Edital de Fomento');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tituloChamada: '',
    instituicaoFomento: '',
    fap: '',
    estado: '',
    status: 'ABERTO',
    dataAbertura: '',
    prazoSubmissaoFase1: '',
    volumeTotalProjeto: '',
    volumeAporte1: '',
    volumeAporte2: '',
    volumeAporte3: '',
    areasAtuacao: '',
    restricoes: '',
    informacoesGerais: '',
    linkPdf: '',
    paginaLink: '',
  });

  useEffect(() => {
    getEditalFomentoById(id)
      .then((res) => {
        const d = res?.data || res;
        setForm({
          tituloChamada: d.tituloChamada || '',
          instituicaoFomento: d.instituicaoFomento || '',
          fap: d.fap || '',
          estado: d.estado || '',
          status: d.status || 'ABERTO',
          dataAbertura: d.dataAbertura ? d.dataAbertura.slice(0, 10) : '',
          prazoSubmissaoFase1: d.prazoSubmissaoFase1 ? d.prazoSubmissaoFase1.slice(0, 10) : '',
          volumeTotalProjeto: d.volumeTotalProjeto ?? '',
          volumeAporte1: d.volumeAporte1 ?? '',
          volumeAporte2: d.volumeAporte2 ?? '',
          volumeAporte3: d.volumeAporte3 ?? '',
          areasAtuacao: (d.areasAtuacao || []).join(', '),
          restricoes: d.restricoes || '',
          informacoesGerais: d.informacoesGerais || '',
          linkPdf: d.linkPdf || '',
          paginaLink: d.paginaLink || '',
        });
      })
      .catch(() => toast.error('Erro ao carregar edital'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tituloChamada) {
      toast.error('O titulo e obrigatorio');
      return;
    }
    setSaving(true);
    try {
      const data = {
        tituloChamada: form.tituloChamada,
        instituicaoFomento: form.instituicaoFomento,
        estado: form.estado,
        status: form.status,
        restricoes: form.restricoes,
        informacoesGerais: form.informacoesGerais,
        linkPdf: form.linkPdf,
        volumeTotalProjeto: form.volumeTotalProjeto ? Number(form.volumeTotalProjeto) : undefined,
        volumeAporte1: form.volumeAporte1 ? Number(form.volumeAporte1) : undefined,
        volumeAporte2: form.volumeAporte2 ? Number(form.volumeAporte2) : undefined,
        volumeAporte3: form.volumeAporte3 ? Number(form.volumeAporte3) : undefined,
        dataAbertura: form.dataAbertura ? new Date(form.dataAbertura).toISOString() : undefined,
        prazoSubmissaoFase1: form.prazoSubmissaoFase1 ? new Date(form.prazoSubmissaoFase1).toISOString() : undefined,
        areasAtuacao: form.areasAtuacao ? form.areasAtuacao.split(',').map((a) => a.trim()).filter(Boolean) : [],
      };
      Object.keys(data).forEach((k) => { if (data[k] === '' || data[k] === undefined) delete data[k]; });

      await updateEditalFomento(id, data);
      toast.success('Edital atualizado!');
      navigate(ROUTES.ADMIN_EDITAIS_FOMENTO);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" className="py-20" />;

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Editar Edital de Fomento</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <Input label="Titulo da chamada *" id="tituloChamada" value={form.tituloChamada} onChange={handleChange('tituloChamada')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Instituicao de fomento" id="instituicaoFomento" value={form.instituicaoFomento} onChange={handleChange('instituicaoFomento')} />
          <Input label="FAP" id="fap" value={form.fap} onChange={handleChange('fap')} placeholder="Ex: CNPq" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Estado" id="estado" value={form.estado} onChange={handleChange('estado')} />
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={handleChange('status')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Data abertura" id="dataAbertura" type="date" value={form.dataAbertura} onChange={handleChange('dataAbertura')} />
          <Input label="Prazo de submissao" id="prazoSubmissaoFase1" type="date" value={form.prazoSubmissaoFase1} onChange={handleChange('prazoSubmissaoFase1')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input label="Volume total (R$)" id="volumeTotalProjeto" type="number" step="0.01" value={form.volumeTotalProjeto} onChange={handleChange('volumeTotalProjeto')} />
          <Input label="Aporte 1 (R$)" id="volumeAporte1" type="number" step="0.01" value={form.volumeAporte1} onChange={handleChange('volumeAporte1')} />
          <Input label="Aporte 2 (R$)" id="volumeAporte2" type="number" step="0.01" value={form.volumeAporte2} onChange={handleChange('volumeAporte2')} />
          <Input label="Aporte 3 (R$)" id="volumeAporte3" type="number" step="0.01" value={form.volumeAporte3} onChange={handleChange('volumeAporte3')} />
        </div>
        <Input label="Areas de atuacao" id="areasAtuacao" value={form.areasAtuacao} onChange={handleChange('areasAtuacao')} placeholder="Separadas por virgula" />
        <Textarea label="Restricoes" id="restricoes" value={form.restricoes} onChange={handleChange('restricoes')} rows={4} />
        <Textarea label="Informacoes gerais" id="informacoesGerais" value={form.informacoesGerais} onChange={handleChange('informacoesGerais')} rows={6} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Link do PDF" id="linkPdf" value={form.linkPdf} onChange={handleChange('linkPdf')} placeholder="https://..." />
          <Input label="Pagina original" id="paginaLink" value={form.paginaLink} onChange={handleChange('paginaLink')} placeholder="https://..." />
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={saving}>Salvar</Button>
          <Button type="button" variant="ghost" onClick={() => navigate(ROUTES.ADMIN_EDITAIS_FOMENTO)}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
