import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: integrar com backend
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="bg-primary-500 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-3">
            Fique por dentro das novidades
          </h2>
          <p className="text-primary-200 mb-8">
            Receba as melhores noticias, editais abertos e oportunidades diretamente no seu e-mail.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-accent-300 font-medium">
              <CheckCircle className="h-5 w-5" />
              Inscricao realizada com sucesso!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                required
                className="flex-1 px-4 py-3 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
              >
                <Send className="h-4 w-4" />
                Inscrever-se
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
