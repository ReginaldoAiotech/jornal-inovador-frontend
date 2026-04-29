import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, Rocket, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { registerTrial } from '../../services/authService';
import { setToken } from '../../utils/storage';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const NICHES = [
  'Tecnologia / Software',
  'Saude',
  'Educacao',
  'Industria',
  'Agronegocio',
  'Energia & Sustentabilidade',
  'Servicos',
  'Varejo / E-commerce',
  'Financeiro / Fintech',
  'Construcao & Imobiliario',
  'Outro',
];

function maskPhoneBR(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function RegisterCompanyPage() {
  useDocumentTitle('Cadastro de empresa | 7 dias gratis');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', companyName: '', niche: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const handleChange = (field) => (e) => {
    const value = field === 'phone' ? maskPhoneBR(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome e obrigatorio';
    if (!form.email.trim()) errs.email = 'E-mail e obrigatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'E-mail invalido';
    if (!form.password || form.password.length < 6) errs.password = 'Minimo 6 caracteres';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Senhas nao conferem';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) errs.phone = 'Informe o WhatsApp completo';
    if (!form.companyName.trim()) errs.companyName = 'Nome da empresa e obrigatorio';
    if (!form.niche) errs.niche = 'Selecione um nicho';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const data = await registerTrial({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        companyName: form.companyName.trim(),
        niche: form.niche,
      });
      if (data?.access_token) {
        setToken(data.access_token);
        toast.success('Bem-vindo! Seu teste de 7 dias comeca agora.');
        // Reload pra que o AuthContext recarregue o user via /auth/me
        window.location.href = ROUTES.DASHBOARD;
        return;
      }
      // Fallback se backend nao retornar token
      toast.success('Cadastro feito! Faca login.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setErrors({ general: err.message || 'Erro ao cadastrar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header com destaque do trial */}
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-6">
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Teste gratis</span>
            </div>
            <h1 className="text-2xl font-bold font-heading">Sua empresa na Conex por 7 dias</h1>
            <p className="text-sm opacity-90 mt-1">
              Acesso completo a editais, cursos e classificados. Sem cartao.
            </p>
          </div>

          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.general}</div>
              )}

              <Input
                label="Nome completo"
                id="name"
                value={form.name}
                onChange={handleChange('name')}
                error={errors.name}
                placeholder="Seu nome"
              />

              <Input
                label="E-mail corporativo"
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                error={errors.email}
                placeholder="seu@empresa.com"
              />

              <Input
                label="WhatsApp"
                id="phone"
                value={form.phone}
                onChange={handleChange('phone')}
                error={errors.phone}
                placeholder="(11) 99999-9999"
                inputMode="tel"
                maxLength={16}
              />

              <Input
                label="Nome da empresa"
                id="companyName"
                value={form.companyName}
                onChange={handleChange('companyName')}
                error={errors.companyName}
                placeholder="Sua empresa LTDA"
              />

              <div>
                <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nicho de atuacao
                </label>
                <select
                  id="niche"
                  value={form.niche}
                  onChange={handleChange('niche')}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors ${
                    errors.niche ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione...</option>
                  {NICHES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                {errors.niche && <p className="text-xs text-red-500 mt-1">{errors.niche}</p>}
              </div>

              <Input
                label="Senha"
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                placeholder="Minimo 6 caracteres"
              />

              <Input
                label="Confirmar senha"
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                error={errors.confirmPassword}
                placeholder="Repita a senha"
              />

              <Button type="submit" isLoading={loading} className="w-full">
                Comecar meus 7 dias gratis
              </Button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-xs text-gray-500">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                <span>Acesso a todos os editais e cursos</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                <span>Sem cartao de credito</span>
              </div>
              <div className="flex items-start gap-2">
                <Rocket className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
                <span>Cancele a qualquer momento</span>
              </div>
            </div>

            <p className="text-sm text-center text-gray-500 mt-5">
              Ja tem conta?{' '}
              <Link to={ROUTES.LOGIN} className="text-primary-500 font-medium hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
