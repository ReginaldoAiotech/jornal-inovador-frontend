import { useEffect } from 'react';
import { Rocket, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const WHATSAPP_LINK = 'https://wa.me/5598983150639';

export default function TrialBanner() {
  const { isExternal, isTrialActive, isTrialExpired, trialDaysLeft } = useAuth();

  // Toast quando o usuario foi redirecionado por trial expirado
  useEffect(() => {
    if (sessionStorage.getItem('trial-expired-toast')) {
      sessionStorage.removeItem('trial-expired-toast');
      toast.error('Seu teste de 7 dias expirou. Fale conosco para continuar.', { duration: 6000 });
    }
  }, []);

  if (!isExternal) return null;

  if (isTrialExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-2.5 text-sm flex items-center justify-center gap-3 flex-wrap">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Seu teste expirou. Apenas a Imprensa segue acessivel.</span>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full transition-colors"
        >
          Falar no WhatsApp
        </a>
      </div>
    );
  }

  if (isTrialActive) {
    const isLastDay = trialDaysLeft <= 1;
    return (
      <div className={`px-4 py-2 text-sm flex items-center justify-center gap-2 ${isLastDay ? 'bg-amber-500 text-white' : 'bg-primary-50 text-primary-700'}`}>
        <Rocket className="h-4 w-4 shrink-0" />
        <span>
          {isLastDay
            ? `Ultimo dia do seu teste gratis. `
            : `${trialDaysLeft} dia${trialDaysLeft > 1 ? 's' : ''} restantes do seu teste gratis. `}
        </span>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className={`text-xs font-semibold underline ${isLastDay ? 'text-white' : 'text-primary-700'}`}
        >
          Falar com a gente
        </a>
      </div>
    );
  }

  return null;
}
