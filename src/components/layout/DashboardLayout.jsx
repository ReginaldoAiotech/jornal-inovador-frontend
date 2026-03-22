import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Star, Heart, UserCircle, ScrollText, GraduationCap } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import { ROUTES } from '../../constants/routes';
import { getMyClassifieds } from '../../services/classifiedService';
import { getFavoriteEditaisFomento } from '../../services/editalFomentoService';
import { getArticleFavorites } from '../../services/articleService';

export default function DashboardLayout() {
  const [counts, setCounts] = useState({ classifieds: 0, favorites: 0, articleFavorites: 0 });

  useEffect(() => {
    Promise.allSettled([
      getMyClassifieds({ limit: 1 }),
      getFavoriteEditaisFomento({ limit: 1 }),
      getArticleFavorites({ limit: 1 }),
    ]).then(([cls, fav, artFav]) => {
      setCounts({
        classifieds: cls.status === 'fulfilled' ? (cls.value?.total || 0) : 0,
        favorites: fav.status === 'fulfilled' ? (fav.value?.total || 0) : 0,
        articleFavorites: artFav.status === 'fulfilled' ? (artFav.value?.total || 0) : 0,
      });
    });
  }, []);

  const sidebarItems = [
    { label: 'Painel', path: ROUTES.DASHBOARD, icon: LayoutDashboard, end: true },
    { label: 'Editais', path: ROUTES.EDITAIS_FOMENTO, icon: ScrollText },
    { label: 'Cursos', path: ROUTES.COURSES, icon: GraduationCap },
    { label: 'Meus Classificados', path: ROUTES.MY_CLASSIFIEDS, icon: FileText, badge: counts.classifieds },
    { label: 'Artigos Favoritos', path: ROUTES.FAVORITE_ARTICLES, icon: Heart, badge: counts.articleFavorites },
    { label: 'Editais Favoritos', path: ROUTES.FAVORITE_EDITAIS, icon: Star, badge: counts.favorites },
    { label: 'Perfil', path: ROUTES.PROFILE, icon: UserCircle },
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
