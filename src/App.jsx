import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

import HomePage from './pages/public/HomePage';
import ArticleListPage from './pages/public/ArticleListPage';
import ArticleDetailPage from './pages/public/ArticleDetailPage';
import EditalListPage from './pages/public/EditalListPage';
import EditalDetailPage from './pages/public/EditalDetailPage';
import ClassifiedListPage from './pages/public/ClassifiedListPage';
import ClassifiedDetailPage from './pages/public/ClassifiedDetailPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import EditalFomentoListPage from './pages/public/EditalFomentoListPage';
import EditalFomentoDetailPage from './pages/public/EditalFomentoDetailPage';
import NotFoundPage from './pages/public/NotFoundPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import MyClassifiedsPage from './pages/dashboard/MyClassifiedsPage';
import CreateClassifiedPage from './pages/dashboard/CreateClassifiedPage';
import EditClassifiedPage from './pages/dashboard/EditClassifiedPage';
import FavoriteEditaisPage from './pages/dashboard/FavoriteEditaisPage';
import ProfilePage from './pages/dashboard/ProfilePage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageArticlesPage from './pages/admin/ManageArticlesPage';
import ArticleFormPage from './pages/admin/ArticleFormPage';
import ManageEditaisPage from './pages/admin/ManageEditaisPage';
import EditalFormPage from './pages/admin/EditalFormPage';
import ModerateClassifiedsPage from './pages/admin/ModerateClassifiedsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Paginas publicas */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="artigos" element={<ArticleListPage />} />
          <Route path="artigos/:id" element={<ArticleDetailPage />} />
          <Route path="editais" element={<EditalListPage />} />
          <Route path="editais/:id" element={<EditalDetailPage />} />
          <Route path="editais-fomento" element={<EditalFomentoListPage />} />
          <Route path="editais-fomento/:id" element={<EditalFomentoDetailPage />} />
          <Route path="classificados" element={<ClassifiedListPage />} />
          <Route path="classificados/:id" element={<ClassifiedDetailPage />} />
          <Route path="entrar" element={<LoginPage />} />
          <Route path="cadastro" element={<RegisterPage />} />
        </Route>

        {/* Paginas autenticadas - Dashboard do usuario */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="painel" element={<DashboardPage />} />
            <Route path="painel/meus-classificados" element={<MyClassifiedsPage />} />
            <Route path="painel/classificados/novo" element={<CreateClassifiedPage />} />
            <Route path="painel/classificados/:id/editar" element={<EditClassifiedPage />} />
            <Route path="painel/editais-favoritos" element={<FavoriteEditaisPage />} />
            <Route path="painel/perfil" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Paginas admin/editor */}
        <Route element={<RoleRoute roles={['ADMIN', 'EDITOR']} />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/artigos" element={<ManageArticlesPage />} />
            <Route path="admin/artigos/novo" element={<ArticleFormPage />} />
            <Route path="admin/artigos/:id/editar" element={<ArticleFormPage />} />
            <Route path="admin/classificados" element={<ModerateClassifiedsPage />} />

            {/* Somente admin */}
            <Route element={<RoleRoute roles={['ADMIN']} />}>
              <Route path="admin/editais" element={<ManageEditaisPage />} />
              <Route path="admin/editais/novo" element={<EditalFormPage />} />
              <Route path="admin/editais/:id/editar" element={<EditalFormPage />} />
              <Route path="admin/usuarios" element={<ManageUsersPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
