import { NavLink } from 'react-router-dom';
import {
  Newspaper,
  FileText,
  ShoppingBag,
  GraduationCap,
  Heart,
  Bookmark,
  User,
  LayoutDashboard,
  Shield,
  Users,
  MessageSquare,
  ClipboardList,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  FolderOpen,
  Lock,
  BarChart3,
  FileCode,
  Store,
  Megaphone,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { cn } from '../../utils/cn';

const STORAGE_KEY = 'sidebar-collapsed';

function SidebarLink({ to, icon: Icon, label, end = false, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2',
          isActive
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )
      }
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

function SidebarSection({ title, children, defaultOpen = true, collapsed }) {
  const [open, setOpen] = useState(defaultOpen);

  if (collapsed) {
    return <div className="space-y-0.5 py-2 border-b border-gray-100 last:border-0">{children}</div>;
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
      >
        {title}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', !open && '-rotate-90')} />
      </button>
      {open && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
}

export default function PublicSidebar() {
  const { isAuthenticated, isEditor, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, collapsed); } catch {}
  }, [collapsed]);

  if (!isAuthenticated) return null;

  return (
    <aside className={cn(
      'shrink-0 hidden lg:flex flex-col border-r border-gray-100 bg-white transition-all duration-300 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto',
      collapsed ? 'w-16' : 'w-56'
    )}>
      {/* Toggle button */}
      <div className={cn('flex pt-4 pb-2', collapsed ? 'justify-center px-2' : 'justify-end px-4')}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className={cn('space-y-4 flex-1', collapsed ? 'px-2 py-2' : 'px-4 py-2')}>
        {/* Imprensa */}
        <SidebarSection title="Imprensa" collapsed={collapsed}>
          <SidebarLink to={ROUTES.ARTICLES} icon={Newspaper} label="Noticias" collapsed={collapsed} />
          <SidebarLink to={ROUTES.FAVORITE_ARTICLES} icon={Bookmark} label="Artigos Favoritos" collapsed={collapsed} />
        </SidebarSection>

        {/* Vitrine */}
        <SidebarSection title="Vitrine" collapsed={collapsed}>
          <SidebarLink to={ROUTES.CLASSIFIEDS} icon={Store} label="Classificados" collapsed={collapsed} />
          <SidebarLink to={ROUTES.MY_CLASSIFIEDS} icon={Megaphone} label="Meus Anuncios" collapsed={collapsed} />
        </SidebarSection>

        {/* Fomento */}
        <SidebarSection title="Fomento" collapsed={collapsed}>
          <SidebarLink to={ROUTES.EDITAIS_FOMENTO_DASHBOARD} icon={BarChart3} label="Dashboard" collapsed={collapsed} />
          <SidebarLink to={ROUTES.EDITAIS_FOMENTO} icon={FolderOpen} label="Editais Abertos" end collapsed={collapsed} />
          <SidebarLink to={ROUTES.EDITAIS_FOMENTO_ENCERRADOS} icon={Lock} label="Encerrados" collapsed={collapsed} />
          <SidebarLink to={ROUTES.EDITAIS_FOMENTO_PROJETOS} icon={FileCode} label="Projetos" collapsed={collapsed} />
        </SidebarSection>

        {/* Cursos */}
        <SidebarSection title="Cursos" collapsed={collapsed}>
          <SidebarLink to={ROUTES.COURSES} icon={GraduationCap} label="Todos os Cursos" collapsed={collapsed} />
        </SidebarSection>

        {/* Meu Painel */}
        <SidebarSection title="Meu Painel" defaultOpen={false} collapsed={collapsed}>
          <SidebarLink to={ROUTES.DASHBOARD} icon={LayoutDashboard} label="Painel" end collapsed={collapsed} />
          <SidebarLink to={ROUTES.FAVORITE_EDITAIS} icon={Heart} label="Editais Favoritos" collapsed={collapsed} />
          <SidebarLink to={ROUTES.PROFILE} icon={User} label="Perfil" collapsed={collapsed} />
        </SidebarSection>

        {/* Admin */}
        {isEditor && (
          <SidebarSection title="Admin" defaultOpen={false} collapsed={collapsed}>
            <SidebarLink to={ROUTES.ADMIN} icon={Shield} label="Dashboard" end collapsed={collapsed} />
            <SidebarLink to={ROUTES.ADMIN_ARTICLES} icon={Newspaper} label="Noticias" collapsed={collapsed} />
            <SidebarLink to={ROUTES.ADMIN_CLASSIFIEDS} icon={ShoppingBag} label="Classificados" collapsed={collapsed} />
            {isAdmin && (
              <>
                <SidebarLink to={ROUTES.ADMIN_EDITAIS_FOMENTO} icon={FileText} label="Editais Fomento" collapsed={collapsed} />
                <SidebarLink to={ROUTES.ADMIN_PROJETOS_FOMENTO} icon={FileCode} label="Projetos" collapsed={collapsed} />
                <SidebarLink to={ROUTES.ADMIN_COURSES} icon={GraduationCap} label="Cursos" collapsed={collapsed} />
                <SidebarLink to={ROUTES.ADMIN_ARTICLE_COMMENTS} icon={MessageSquare} label="Coment. Artigos" collapsed={collapsed} />
                <SidebarLink to={ROUTES.ADMIN_PENDING_COMMENTS} icon={MessageSquare} label="Coment. Aulas" collapsed={collapsed} />
                <SidebarLink to={ROUTES.ADMIN_USERS} icon={Users} label="Usuarios" collapsed={collapsed} />
              </>
            )}
          </SidebarSection>
        )}
      </nav>
    </aside>
  );
}
