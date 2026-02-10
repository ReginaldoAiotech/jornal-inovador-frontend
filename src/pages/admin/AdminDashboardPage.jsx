import { useState, useEffect } from 'react';
import { Newspaper, ScrollText, MessageSquare, Users, BookOpen, Layers, PlayCircle } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getArticles } from '../../services/articleService';
import { getEditaisFomentoStats } from '../../services/editalFomentoService';
import { getPendingClassifieds } from '../../services/classifiedService';
import { getUsers } from '../../services/userService';
import { getCourses, getCourseById } from '../../services/courseService';
import Card from '../../components/ui/Card';

export default function AdminDashboardPage() {
  useDocumentTitle('Admin Dashboard');
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({ articles: 0, editais: 0, pending: 0, users: 0, courses: 0, modules: 0, lessons: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Todas as chamadas rapidas em paralelo (1 request cada)
    const fast = [
      getArticles().then((r) => { const d = r?.data || r || []; return Array.isArray(d) ? d.length : 0; }).catch(() => 0),
      getEditaisFomentoStats().then((r) => r?.total || r?.data?.total || 0).catch(() => 0),
      getPendingClassifieds({ limit: 1 }).then((r) => r?.total || 0).catch(() => 0),
      isAdmin ? getUsers().then((r) => { const d = r?.data || r || []; return Array.isArray(d) ? d.length : 0; }).catch(() => 0) : Promise.resolve(0),
      getCourses().then((r) => r?.data || r || []).catch(() => []),
    ];

    Promise.all(fast).then(([articles, editais, pending, users, courseList]) => {
      const list = Array.isArray(courseList) ? courseList : [];
      // Atualiza stats rapidos imediatamente (cursos ja disponivel)
      setStats((prev) => ({ ...prev, articles, editais, pending, users, courses: list.length }));
      setLoading(false);

      // Busca detalhes dos cursos em paralelo para contar modulos/aulas
      if (list.length > 0) {
        Promise.allSettled(list.map((c) => getCourseById(c.id))).then((details) => {
          let modules = 0;
          let lessons = 0;
          details.forEach((res) => {
            if (res.status === 'fulfilled') {
              const mods = (res.value?.data || res.value)?.modules || [];
              modules += mods.length;
              lessons += mods.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
            }
          });
          setStats((prev) => ({ ...prev, modules, lessons }));
        });
      }
    });
  }, [isAdmin]);

  const cards = [
    { label: 'Noticias', value: stats.articles, icon: Newspaper, color: 'bg-blue-50 text-blue-600' },
    { label: 'Editais', value: stats.editais, icon: ScrollText, color: 'bg-green-50 text-green-600' },
    { label: 'Classificados Pendentes', value: stats.pending, icon: MessageSquare, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Cursos', value: stats.courses, icon: BookOpen, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Modulos', value: stats.modules, icon: Layers, color: 'bg-teal-50 text-teal-600' },
    { label: 'Aulas', value: stats.lessons, icon: PlayCircle, color: 'bg-rose-50 text-rose-600' },
    ...(isAdmin ? [{ label: 'Usuarios', value: stats.users, icon: Users, color: 'bg-purple-50 text-purple-600' }] : []),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              {loading ? (
                <div className="h-8 w-10 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              )}
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
