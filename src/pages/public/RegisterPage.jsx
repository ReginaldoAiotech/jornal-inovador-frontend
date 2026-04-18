import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';
import { Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  useDocumentTitle('Cadastro');
  const { register, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nome e obrigatorio';
    if (!form.email.trim()) errs.email = 'E-mail e obrigatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'E-mail invalido';
    if (!form.password) errs.password = 'Senha e obrigatoria';
    if (form.password.length < 6) errs.password = 'Minimo 6 caracteres';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Senhas nao conferem';
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
      await register(form.name, form.email, form.password);
      setSubmitted(true);
    } catch (err) {
      setErrors({ general: err.message || 'Erro ao cadastrar' });
    } finally {
      setLoading(false);
    }
  };

  // Tela de sucesso - aguardando aprovacao
  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2">Cadastro enviado!</h1>
            <p className="text-gray-600 mb-6">
              Seu cadastro foi recebido e esta aguardando aprovacao do administrador.
              Voce recebera acesso assim que for aprovado.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">Conta criada com sucesso</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-700">Aguardando aprovacao do admin</span>
              </div>
            </div>
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm"
            >
              Voltar para a plataforma
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-heading text-gray-900">Cadastre-se</h1>
            <p className="text-sm text-gray-500 mt-1">Crie sua conta na Plataforma Conex</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{errors.general}</div>
            )}
            <Input label="Nome" id="name" value={form.name} onChange={handleChange('name')} error={errors.name} placeholder="Seu nome completo" />
            <Input label="E-mail" id="email" type="email" value={form.email} onChange={handleChange('email')} error={errors.email} placeholder="seu@email.com" />
            <Input label="Senha" id="password" type="password" value={form.password} onChange={handleChange('password')} error={errors.password} placeholder="Minimo 6 caracteres" />
            <Input label="Confirmar senha" id="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} error={errors.confirmPassword} placeholder="Repita a senha" />
            <Button type="submit" isLoading={loading} className="w-full">
              Solicitar cadastro
            </Button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-4">
            Seu cadastro sera analisado e aprovado por um administrador.
          </p>

          <p className="text-sm text-center text-gray-500 mt-4">
            Ja tem conta?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary-500 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
