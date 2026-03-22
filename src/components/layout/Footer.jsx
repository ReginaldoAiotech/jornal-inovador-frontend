import { Link } from 'react-router-dom';
import { Newspaper, Rss } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export default function Footer() {
  return (
    <footer className="bg-primary-500 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Newspaper className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold font-heading">O Inovador</span>
            </Link>
            <p className="text-sm text-primary-200 max-w-sm">
              O portal de noticias, editais e oportunidades para empreendedores e inovadores do Brasil.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Navegacao</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><Link to={ROUTES.ARTICLES} className="hover:text-white transition-colors">Noticias</Link></li>
              <li><Link to={ROUTES.CLASSIFIEDS} className="hover:text-white transition-colors">Classificados</Link></li>
              <li><Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">Editais (login)</Link></li>
              <li><Link to={ROUTES.REGISTER} className="hover:text-white transition-colors">Cadastre-se</Link></li>
              <li>
                <a href={`${import.meta.env.VITE_API_URL || ''}/articles/feed/rss`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <Rss className="h-3 w-3" /> RSS Feed
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Contato</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>
                <a href="mailto:contato@jornaldoinovador.com.br" className="hover:text-white transition-colors">
                  contato@jornaldoinovador.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-400 mt-8 pt-6 text-center text-sm text-primary-300">
          &copy; {new Date().getFullYear()} Jornal O Inovador. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
