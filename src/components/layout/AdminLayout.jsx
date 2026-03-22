import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Newspaper, FileText, MessageSquare, GraduationCap, Users, MessageCircle, MessagesSquare } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { getPendingComments } from '../../services/courseService';
import { getPendingArticleComments } from '../../services/articleService';

export default function AdminLayout() {
  const { isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingArticleCount, setPendingArticleCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      getPendingComments({ limit: 1 })
        .then((res) => setPendingCount(res?.data?.total || res?.total || 0))
        .catch(() => {});
      getPendingArticleComments({ limit: 1 })
        .then((res) => setPendingArticleCount(res?.data?.total || res?.total || 0))
        .catch(() => {});
    }
  }, [isAdmin]);

  const sidebarItems = [
    { label: 'Dashboard', path: ROUTES.ADMIN, icon: LayoutDashboard, end: true },
    { label: 'Noticias', path: ROUTES.ADMIN_ARTICLES, icon: Newspaper },
    { label: 'Classificados', path: ROUTES.ADMIN_CLASSIFIEDS, icon: MessageSquare },
    ...(isAdmin
      ? [
          { label: 'Editais Fomento', path: ROUTES.ADMIN_EDITAIS_FOMENTO, icon: FileText },
          { label: 'Cursos', path: ROUTES.ADMIN_COURSES, icon: GraduationCap },
          { label: 'Coment. Artigos', path: ROUTES.ADMIN_ARTICLE_COMMENTS, icon: MessagesSquare, badge: pendingArticleCount },
          { label: 'Coment. Aulas', path: ROUTES.ADMIN_PENDING_COMMENTS, icon: MessageCircle, badge: pendingCount },
          { label: 'Usuarios', path: ROUTES.ADMIN_USERS, icon: Users },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex gap-8">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
