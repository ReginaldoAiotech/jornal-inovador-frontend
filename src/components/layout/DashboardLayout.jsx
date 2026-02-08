import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Star, UserCircle } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import { ROUTES } from '../../constants/routes';

const sidebarItems = [
  { label: 'Painel', path: ROUTES.DASHBOARD, icon: LayoutDashboard, end: true },
  { label: 'Meus Classificados', path: ROUTES.MY_CLASSIFIEDS, icon: FileText },
  { label: 'Editais Favoritos', path: ROUTES.FAVORITE_EDITAIS, icon: Star },
  { label: 'Perfil', path: ROUTES.PROFILE, icon: UserCircle },
];

export default function DashboardLayout() {
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
