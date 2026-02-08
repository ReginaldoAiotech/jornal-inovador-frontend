import { useState, useEffect } from 'react';
import { Newspaper, ScrollText, MessageSquare, Users } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../hooks/useAuth';
import { getArticles } from '../../services/articleService';
import { getEditais } from '../../services/editalService';
import { getPendingClassifieds } from '../../services/classifiedService';
import { getUsers } from '../../services/userService';
import Card from '../../components/ui/Card';

export default function AdminDashboardPage() {
  useDocumentTitle('Admin Dashboard');
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({ articles: 0, editais: 0, pending: 0, users: 0 });

  useEffect(() => {
    const promises = [
      getArticles().then((r) => { const d = r?.data || r || []; return Array.isArray(d) ? d.length : 0; }).catch(() => 0),
      getEditais({ limit: 1 }).then((r) => r?.total || 0).catch(() => 0),
      getPendingClassifieds({ limit: 1 }).then((r) => r?.total || 0).catch(() => 0),
      isAdmin ? getUsers().then((r) => { const d = r?.data || r || []; return Array.isArray(d) ? d.length : 0; }).catch(() => 0) : Promise.resolve(0),
    ];

    Promise.all(promises).then(([articles, editais, pending, users]) => {
      setStats({ articles, editais, pending, users });
    });
  }, [isAdmin]);

  const cards = [
    { label: 'Noticias', value: stats.articles, icon: Newspaper, color: 'bg-blue-50 text-blue-600' },
    { label: 'Editais', value: stats.editais, icon: ScrollText, color: 'bg-green-50 text-green-600' },
    { label: 'Classificados Pendentes', value: stats.pending, icon: MessageSquare, color: 'bg-yellow-50 text-yellow-600' },
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
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
