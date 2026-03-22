import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Shield, Newspaper, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

export default function Header() {
  const { user, isAuthenticated, isEditor, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate(ROUTES.HOME);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.ARTICLES}?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Fechar menu mobile ao mudar de rota
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Noticias', path: ROUTES.ARTICLES },
    { label: 'Editais', path: isAuthenticated ? ROUTES.EDITAIS_FOMENTO : ROUTES.LOGIN },
    { label: 'Classificados', path: isAuthenticated ? ROUTES.CLASSIFIEDS : ROUTES.LOGIN },
    { label: 'Cursos', path: isAuthenticated ? ROUTES.COURSES : ROUTES.LOGIN },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors">
              <Newspaper className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold font-heading text-primary-500 leading-tight">
                O Inovador
              </span>
              <span className="text-[10px] text-gray-400 leading-tight tracking-wider uppercase hidden sm:block">
                Jornal
              </span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Acoes desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Busca */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar noticias..."
                    className="w-48 px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                    onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-primary-500 transition-colors"
                  title="Buscar"
                >
                  <Search className="h-4.5 w-4.5" />
                </button>
              )}
            </div>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    dropdownOpen
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      {user.name && <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>}
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to={ROUTES.DASHBOARD}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" /> Painel
                    </Link>
                    {isEditor && (
                      <Link
                        to={ROUTES.ADMIN}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Shield className="h-4 w-4 text-gray-400" /> Admin
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm">Cadastre-se</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: busca + hamburger */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Busca mobile */}
        {searchOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar noticias, editais..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              />
              <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                Buscar
              </button>
            </form>
          </div>
        )}

        {/* Menu mobile */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {isAuthenticated ? (
              <>
                <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <LayoutDashboard className="h-4 w-4 text-gray-400" /> Painel
                </Link>
                {isEditor && (
                  <Link to={ROUTES.ADMIN} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Shield className="h-4 w-4 text-gray-400" /> Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 pt-1">
                <Link to={ROUTES.LOGIN} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">Entrar</Button>
                </Link>
                <Link to={ROUTES.REGISTER} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">Cadastre-se</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
