import { Mail, TrendingUp } from 'lucide-react';

const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'];
const MONTHS = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function formatDate() {
  const now = new Date();
  return `${WEEKDAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]} de ${now.getFullYear()}`;
}

export default function TopBar() {
  return (
    <div className="bg-primary-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-8 text-[11px]">
        <span className="text-primary-200 hidden sm:block">{formatDate()}</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-accent-300 font-medium">
            <TrendingUp className="h-3 w-3" />
            Inovacao, Ciencia e Tecnologia
          </span>
          <a href="mailto:contato@jornaldoinovador.com.br" className="text-primary-200 hover:text-white transition-colors hidden md:flex items-center gap-1">
            <Mail className="h-3 w-3" />
            contato@jornaldoinovador.com.br
          </a>
        </div>
      </div>
    </div>
  );
}
