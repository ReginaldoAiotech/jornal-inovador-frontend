import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Star, Plus, ScrollText, GraduationCap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getMyClassifieds } from '../../services/classifiedService';
import { getFavoriteEditaisFomento } from '../../services/editalFomentoService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ROUTES } from '../../constants/routes';

export default function DashboardPage() {
  useDocumentTitle('Painel');
  const { user } = useAuth();
  const [stats, setStats] = useState({ classifieds: 0, favorites: 0 });

  useEffect(() => {
    Promise.allSettled([
      getMyClassifieds({ limit: 1 }),
      getFavoriteEditaisFomento({ limit: 1 }),
    ]).then(([cls, fav]) => {
      setStats({
        classifieds: cls.status === 'fulfilled' ? (cls.value?.total || 0) : 0,
        favorites: fav.status === 'fulfilled' ? (fav.value?.total || 0) : 0,
      });
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold font-heading text-gray-900 mb-6">
        Ola, {user?.name || 'Usuario'}!
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-lg">
            <FileText className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.classifieds}</p>
            <p className="text-sm text-gray-500">Meus Classificados</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-accent-50 rounded-lg">
            <Star className="h-6 w-6 text-accent-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
            <p className="text-sm text-gray-500">Editais Favoritos</p>
          </div>
        </Card>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-4">Acoes rapidas</h2>
      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.CREATE_CLASSIFIED}>
          <Button><Plus className="h-4 w-4" /> Criar Classificado</Button>
        </Link>
        <Link to={ROUTES.EDITAIS_FOMENTO}>
          <Button variant="secondary"><ScrollText className="h-4 w-4" /> Ver Editais</Button>
        </Link>
        <Link to={ROUTES.COURSES}>
          <Button variant="secondary"><GraduationCap className="h-4 w-4" /> Ver Cursos</Button>
        </Link>
      </div>
    </div>
  );
}
