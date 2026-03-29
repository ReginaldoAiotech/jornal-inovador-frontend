import { useState } from 'react';
import { Send, CheckCircle, Mail } from 'lucide-react';
import api from '../../services/api';
import { API } from '../../constants/api';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post(API.NEWSLETTER.SUBSCRIBE, { email: email.trim() });
      setSubmitted(true);
      setEmail('');
    } catch {
      toast.error('Erro ao realizar inscricao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-primary-50/60 rounded-2xl border border-primary-100 px-6 py-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2.5 rounded-xl bg-primary-100">
              <Mail className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Fique por dentro</h3>
              <p className="text-xs text-gray-500">Receba novidades no seu e-mail</p>
            </div>
          </div>

          {submitted ? (
            <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
              <CheckCircle className="h-4 w-4" />
              Inscricao realizada com sucesso!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-1 gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                required
                className="flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Enviando...' : 'Inscrever-se'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
