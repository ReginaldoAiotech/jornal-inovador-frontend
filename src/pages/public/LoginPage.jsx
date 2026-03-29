import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

export default function LoginPage() {
  useDocumentTitle('Entrar');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = 'E-mail ou senha incorretos. Tente novamente.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-heading text-gray-900">Entrar</h1>
            <p className="text-sm text-gray-500 mt-1">Acesse sua conta no Jornal O Inovador</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>
            )}
            <Input
              label="E-mail"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
            <Input
              label="Senha"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
            />
            <Button type="submit" isLoading={loading} className="w-full">
              Entrar
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Nao tem conta?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary-500 font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
