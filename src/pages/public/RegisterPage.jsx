import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  useDocumentTitle('Cadastro');
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      toast.success('Cadastro realizado com sucesso!');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setErrors({ general: err.message || 'Erro ao cadastrar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-heading text-gray-900">Cadastre-se</h1>
            <p className="text-sm text-gray-500 mt-1">Crie sua conta no Jornal O Inovador</p>
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
              Cadastrar
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
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
