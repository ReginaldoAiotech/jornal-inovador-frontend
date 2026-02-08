import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';

export default function NotFoundPage() {
  useDocumentTitle('Pagina nao encontrada');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold font-heading text-gray-300 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Pagina nao encontrada</h2>
        <p className="text-gray-500 mb-8">A pagina que voce procura nao existe ou foi removida.</p>
        <Link to={ROUTES.HOME}>
          <Button>
            <Home className="h-4 w-4" /> Voltar ao inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
