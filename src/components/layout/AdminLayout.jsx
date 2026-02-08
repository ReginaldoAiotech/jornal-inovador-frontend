import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Newspaper, ScrollText, MessageSquare, Users } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const { isAdmin } = useAuth();

  const sidebarItems = [
    { label: 'Dashboard', path: ROUTES.ADMIN, icon: LayoutDashboard, end: true },
    { label: 'Noticias', path: ROUTES.ADMIN_ARTICLES, icon: Newspaper },
    { label: 'Classificados', path: ROUTES.ADMIN_CLASSIFIEDS, icon: MessageSquare },
    ...(isAdmin
      ? [
          { label: 'Editais', path: ROUTES.ADMIN_EDITAIS, icon: ScrollText },
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
