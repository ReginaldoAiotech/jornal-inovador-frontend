import { Link } from 'react-router-dom';
import { Rss } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import logoPng from '../../assets/logo-conex.png';

export default function Footer() {
  return (
    <footer className="bg-primary-500 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to={ROUTES.HOME}>
              <img src={logoPng} alt="Conex" className="h-8 brightness-0 invert opacity-80" />
            </Link>
            <span className="text-xs text-primary-300 hidden sm:block">|</span>
            <p className="text-xs text-primary-300 hidden sm:block">Inovação, fomento e empreendedorismo</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-primary-300 flex-wrap">
            <Link to={ROUTES.ARTICLES} className="hover:text-white transition-colors">Imprensa</Link>
            <Link to={ROUTES.CLASSIFIEDS} className="hover:text-white transition-colors">Vitrine</Link>
            <Link to={ROUTES.EDITAIS_FOMENTO} className="hover:text-white transition-colors">Editais</Link>
            <Link to={ROUTES.COURSES} className="hover:text-white transition-colors">Cursos</Link>
            <Link to={ROUTES.EDITAIS_FOMENTO_PROJETOS} className="hover:text-white transition-colors">Projetos</Link>
            <a href="mailto:contato@plataformadigitalconex.com.br" className="hover:text-white transition-colors">Contato</a>
            <a href={`${import.meta.env.VITE_API_URL || ''}/articles/feed/rss`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <Rss className="h-3 w-3" /> RSS
            </a>
          </div>
        </div>
        <div className="border-t border-primary-400/50 mt-4 pt-3 text-center text-[11px] text-primary-400">
          &copy; {new Date().getFullYear()} Plataforma Digital Conex. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
